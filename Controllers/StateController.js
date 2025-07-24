const Appointment = require('../Models/Appointment');
const Case = require('../Models/Case');
const User = require('../Models/User');
const sendResponse = require('../Utils/Response');



//! ==============================================        Get Lawyer Stats            ================================= 
const getLawyerStats = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const appointmentStatuses = ["approved", "rejected", "pending"];
    const caseStatuses = ["pending", "accepted", "rejected", "in_progress", "closed", "dismissed"];

    const appointmentStats = {};
    const caseStats = {};

    for (let status of appointmentStatuses) {
      appointmentStats[status] = await Appointment.countDocuments({ lawyer: userId, status });
    }

    for (let status of caseStatuses) {
      caseStats[status] = await Case.countDocuments({ lawyer: userId, status });
    }

    return sendResponse(res, 200, true, 'Lawyer stats fetched', {
      appointmentStats,
      caseStats
    });

  } catch (error) {
    next(error);
  }
};




//! ==============================================        Get Client Stats            =================================
const getClientStats = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const appointmentStatuses = ["approved", "rejected", "pending"];
    const caseStatuses = ["pending", "accepted", "rejected", "in_progress", "closed", "dismissed"];

    const appointmentStats = {};
    const caseStats = {};

    for (let status of appointmentStatuses) {
      appointmentStats[status] = await Appointment.countDocuments({ client: userId, status });
    }

    for (let status of caseStatuses) {
      caseStats[status] = await Case.countDocuments({ client: userId, status });
    }

    return sendResponse(res, 200, true, 'Client stats fetched', {
      appointmentStats,
      caseStats,
    });

  } catch (error) {
    next(error);
  }
};



//! ==============================================        Get Admin Stats            =================================
const getAdminStats = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return sendResponse(res, 403, false, 'Admin access required');
        }

        const totalAppointments = await Appointment.countDocuments();
        const totalCases = await Case.countDocuments();
        const totalLawyers = await User.countDocuments({ role: 'lawyer' });
        const totalClients = await User.countDocuments({ role: 'client' });

        res.status(200).json({
            success: true,
            stats: {
                totalAppointments,
                totalCases,
                totalLawyers,
                totalClients,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getLawyerStats, getClientStats };
