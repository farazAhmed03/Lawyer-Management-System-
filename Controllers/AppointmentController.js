const Appointment = require('../Models/Appointment');
const { sendNotification } = require('../Controllers/NotificationController');
const User = require('../Models/User');
const sendResponse = require('../Utils/Response');

// Create Appointment
const createAppointment = async (req, res, next) => {
    try {
        const { date } = req.body;
        const lawyerId = req.params.lawyerId;
        const io = req.app.get('io');

        // Role validation
        if (req.user.role !== 'client') {
            return sendResponse(res, 403, false, 'Only clients can create appointments');
        }

        // Lawyer validation
        const lawyer = await User.findById(lawyerId);
        if (!lawyer || lawyer.role !== 'lawyer') {
            return sendResponse(res, 400, false, 'Invalid lawyer ID');
        }

        // Date conflict check
        const existingAppointment = await Appointment.findOne({ 
            lawyer: lawyerId, 
            date 
        });
        if (existingAppointment) {
            return sendResponse(res, 400, false, 'Time slot already booked');
        }

        // Client existing appointment check
        const clientExistingAppointment = await Appointment.findOne({ 
            lawyer: lawyerId, 
            client: req.user.userId,
            status: { $in: ['pending'] } 
        });

        if (clientExistingAppointment) {
            return sendResponse(res, 400, false, 'You already have an appointment with this lawyer');
        }

        // Date validation
        if (new Date(date) < new Date()) {
            return sendResponse(res, 400, false, 'Cannot book appointments in the past');
        }

        // Create appointment
        const appointment = await Appointment.create({
            client: req.user.userId,
            lawyer: lawyerId,
            date,
            status: 'pending'
        });

        // Send notification
        // if (io) {
        //     await sendNotification(
        //         lawyerId,
        //         'new_appointment',
        //         `New appointment request from ${req.user.username}`,
        //         appointment._id,
        //         'Appointment',
        //         io
        //     );
        // }

        return sendResponse(res, 201, true, 'Appointment created successfully', appointment);

    } catch (error) {
        next(error);
    }
};

// Get Single Appointment
const getAppointment = async (req, res, next) => {
    try {
        const appointmentId = req.params.appointmentId;
        const appointment = await Appointment.findById(appointmentId)
            .populate('lawyer', 'username specialization image')
            .populate('client', 'username email image')
            .populate('linkedCase', 'status')
            .sort({ date: 1 })
            // .lean();

        if (!appointment) {
            return sendResponse(res, 404, false, 'Appointment not found');
        }

        // Authorization check
        if (req.user.role === 'client' && appointment.client._id.toString() !== req.user.userId) {
            return sendResponse(res, 403, false, 'Unauthorized to view this appointment');
        }

        if (req.user.role === 'lawyer' && appointment.lawyer._id.toString() !== req.user.userId) {
            return sendResponse(res, 403, false, 'Unauthorized to view this appointment');
        }

        return sendResponse(res, 200, true, 'Appointment fetched successfully', appointment);

    } catch (error) {
        next(error);
    }
};

// Get All Appointments
const getAppointments = async (req, res, next) => {
    try {
        let appointments;
        const userId = req.user.userId;
        const role = req.user.role;

        // Role-based filtering
        if (role === 'client') {
            appointments = await Appointment.find({ client: userId })
                .populate('lawyer', 'username specialization image')
                .select('date lawyer status isLocked linkedCase')
                .sort({ date: 1 })
                // .lean();
        } 
        else if (role === 'lawyer') {
            appointments = await Appointment.find({ lawyer: userId })
                .populate('client', 'username email image')
                .select('date client status isLocked linkedCase')
                .sort({ date: 1 })
                // .lean();
        } 
        else if (role === 'admin') {
            appointments = await Appointment.find()
                .populate('client', 'username email image')
                .populate('lawyer', 'username email barNumber specialization image')
                .select('date client lawyer status isLocked linkedCase')
                .sort({ date: 1 })
                // .lean();
        } 
        else {
            return sendResponse(res, 403, false, 'Unauthorized access');
        }

        // if (!appointments || appointments.length === 0) {
        //     return sendResponse(res, 404, false, 'No appointments found');
        // }

        return sendResponse(res, 200, true, 'Appointments fetched successfully', appointments);

    } catch (error) {
        next(error);
    }
};

// Update Appointment
const updateAppointment = async (req, res, next) => {
    try {
        const { appointmentId } = req.params;
        const { status, date } = req.body;
        const currentDate = new Date();
        const io = req.app.get('io');

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return sendResponse(res, 404, false, 'Appointment not found');
        }

        // Check if appointment is expired
        if (appointment.date < currentDate) {
            await Appointment.deleteOne({ _id: appointmentId });
            return sendResponse(res, 400, false, 'Appointment expired. Please create a new one');
        }

        // Authorization checks
        if (req.user.role === 'client' && appointment.client.toString() !== req.user.userId) {
            return sendResponse(res, 403, false, 'Unauthorized to update this appointment');
        }

        if (req.user.role === 'lawyer' && appointment.lawyer.toString() !== req.user.userId) {
            return sendResponse(res, 403, false, 'Unauthorized to update this appointment');
        }

        // Client can only update date
        if (req.user.role === 'client' && date) {
            if (new Date(date) < currentDate) {
                return sendResponse(res, 400, false, 'Cannot reschedule to past date');
            }

            const conflict = await Appointment.findOne({
                lawyer: appointment.lawyer,
                date: date,
                _id: { $ne: appointmentId }
            });

            if (conflict) {
                return sendResponse(res, 400, false, 'Time slot already booked');
            }

            appointment.date = date;
        }

        // Lawyer/Admin can update status
        if (status && (req.user.role === 'lawyer' || req.user.role === 'admin')) {
            if (!['approved', 'rejected'].includes(status)) {
                return sendResponse(res, 400, false, 'Invalid status value');
            }
            appointment.status = status;
        }

        await appointment.save();
        return sendResponse(res, 200, true, 'Appointment updated successfully', appointment);

    } catch (error) {
        next(error);
    }
};

// Delete Appointment
const deleteAppointment = async (req, res, next) => {
    try {
        const { appointmentId } = req.params;
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return sendResponse(res, 404, false, 'Appointment not found');
        }

        // Authorization checks
        const isOwner = 
            (req.user.role === 'client' && appointment.client.toString() === req.user.userId) ||
            (req.user.role === 'lawyer' && appointment.lawyer.toString() === req.user.userId);

        if (!isOwner && req.user.role !== 'admin') {
            return sendResponse(res, 403, false, 'Unauthorized to delete this appointment');
        }

        await Appointment.deleteOne({ _id: appointmentId });
        return sendResponse(res, 200, true, 'Appointment deleted successfully');

    } catch (error) {
        next(error);
    }
};

module.exports = {
    createAppointment,
    getAppointment,
    getAppointments,
    updateAppointment,
    deleteAppointment
};