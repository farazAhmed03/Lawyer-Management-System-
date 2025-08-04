const Case = require('../Models/Case');
const Appointment = require('../Models/Appointment');
const sendResponse = require('../Utils/Response');


//!=============================================  Create Case =============================================
const createCase = async (req, res, next) => {
    try {
        const { title, description } = req.body;
        const { appointmentId } = req.params;
        const file = req.file;

        if (!title || !description || !file || !appointmentId) {
            return sendResponse(res, 400, false, 'All fields are required');
        }

        if (req.user.role !== 'client') {
            return sendResponse(res, 403, false, 'Only clients can create cases');
        }

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment || appointment.status !== 'approved' || appointment.client.toString() !== req.user.userId) {
            return sendResponse(res, 400, false, 'Invalid or unauthorized appointment');
        }

        const existingCase = await Case.findOne({ client: req.user.userId, lawyer: appointment.lawyer });
        if (existingCase) {
            return sendResponse(res, 400, false, 'Case already exists with this lawyer');
        }

        const filePath = `/uploads/${file.filename}`;
        const newCase = await Case.create({
            title,
            description,
            client: req.user.userId,
            lawyer: appointment.lawyer,
            appointment: appointment._id,
            file: filePath,
            status: 'pending',
            isLocked: true
        });

        appointment.linkedCase = newCase._id;
        appointment.isLocked = true;
        await appointment.save();

        sendResponse(res, 201, true, 'Case created successfully', newCase);
    } catch (error) {
        next(error);
    }
};

//!=============================================  Get Cases =============================================
const getCases = async (req, res, next) => {
    try {
        const { userId, role } = req.user;
        let cases;

        if (role === 'client') {
            cases = await Case.find({ client: userId }).populate('lawyer', 'username specialization image').sort({ updatedAt: -1 });
        } else if (role === 'lawyer') {
            cases = await Case.find({ lawyer: userId }).populate('client', 'username email image').sort({ updatedAt: -1 });
        } else if (role === 'admin') {
            cases = await Case.find().populate('client', 'username email').populate('lawyer', 'username specialization').sort({ updatedAt: -1 });
        } else {
            return sendResponse(res, 403, false, 'Unauthorized access');
        }

        sendResponse(res, 200, true, 'Cases retrieved successfully', cases);
    } catch (error) {
        next(error);
    }
};

//!=============================================  Get Case =============================================
const getCase = async (req, res, next) => {
    try {
        const { caseId } = req.params;
        const { userId, role } = req.user;
        const caseData = await Case.findById(caseId).populate('client', 'username email image').populate('lawyer', 'username specialization image');

        if (!caseData) return sendResponse(res, 404, false, 'Case not found');

        if (role === 'client' && caseData.client._id.toString() !== userId) {
            return sendResponse(res, 403, false, 'Not authorized');
        }
        if (role === 'lawyer' && caseData.lawyer._id.toString() !== userId) {
            return sendResponse(res, 403, false, 'Not authorized');
        }

        sendResponse(res, 200, true, 'Case retrieved successfully', caseData);
    } catch (error) {
        next(error);
    }
};

//!=============================================  Accept Case =============================================
const acceptCase = async (req, res, next) => {
    try {
        const { caseId } = req.params;
        const { userId, role } = req.user;
        const caseData = await Case.findById(caseId);

        if (!caseData || role !== 'lawyer' || caseData.lawyer.toString() !== userId) {
            return sendResponse(res, 403, false, 'Unauthorized to accept');
        }

        if (caseData.status !== 'pending') {
            return sendResponse(res, 400, false, 'Already processed');
        }

        caseData.status = 'accepted';
        await caseData.save();

        sendResponse(res, 200, true, 'Case accepted', caseData);
    } catch (error) {
        next(error);
    }
};

//!=============================================  Reject Case =============================================
const rejectCase = async (req, res, next) => {
    try {
        const { caseId } = req.params;
        const { userId, role } = req.user;
        const caseData = await Case.findById(caseId).populate('appointment');

        if (!caseData || role !== 'lawyer' || caseData.lawyer.toString() !== userId) {
            return sendResponse(res, 403, false, 'Unauthorized to reject');
        }

        if (caseData.status !== 'pending') {
            return sendResponse(res, 400, false, 'Already processed');
        }

        caseData.status = 'rejected';
        caseData.isLocked = true;
        await caseData.save();

        const appointmentData = await Appointment.findById(caseData.appointment);
        appointmentData.isLocked = false;
        await appointmentData.save();

        sendResponse(res, 200, true, 'Case rejected', caseData);
    } catch (error) {
        next(error);
    }
};


//!============================================= Update CASE Status =============================================
const updateCaseStatus = async (req, res, next) => {
    try {
        const { caseId } = req.params;
        const { status } = req.body;
        const { userId, role } = req.user;

        const allowedStatuses = ['open', 'in_progress', 'closed', 'dismissed'];
        if (!allowedStatuses.includes(status)) {
            return sendResponse(res, 400, false, 'Invalid status value');
        }

        const caseData = await Case.findById(caseId).populate('appointment');
        if (!caseData) {
            return sendResponse(res, 404, false, 'Case not found');
        }

        if (caseData.status !== 'accepted' && caseData.status !== 'in_progress') {
            return sendResponse(res, 400, false, 'Case must be accepted or in progress before updating status');
        }

        if (role !== 'lawyer' || caseData.lawyer.toString() !== userId) {
            return sendResponse(res, 403, false, 'Only assigned lawyer can update this case');
        }

        caseData.status = status;
        if (['closed', 'dismissed'].includes(status)) {
            const appointmentData = await Appointment.findById(caseData.appointment);
            appointmentData.isActive = false;
            appointmentData.isLocked = false;
            await appointmentData.save();
        }

        await caseData.save();

        return sendResponse(res, 200, true, 'Case status updated successfully', caseData);
    } catch (error) {
        next(error);
    }
};



//!============================================= DELETE CASE =============================================
const deleteCase = async (req, res, next) => {
    try {
        const { caseId } = req.params;
        const { userId, role } = req.user;
        const caseData = await Case.findById(caseId);

        if (!caseData) return sendResponse(res, 404, false, 'Case not found');

        const isOwner = caseData.client.toString() === userId || caseData.lawyer.toString() === userId;
        if (!isOwner && role !== 'admin') {
            return sendResponse(res, 403, false, 'Unauthorized to delete');
        }

        await Case.deleteOne({ _id: caseId });
        sendResponse(res, 200, true, 'Case deleted');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createCase,
    getCases,
    getCase,
    acceptCase,
    rejectCase,
    updateCaseStatus,
    deleteCase
};
