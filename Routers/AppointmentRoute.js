const express = require('express');
const router = express.Router();
const appointmentController = require('../Controllers/AppointmentController');
const auth = require('../Middleware/authMiddleware');

// Protected routes
router.post("/:lawyerId", auth, appointmentController.createAppointment);
router.get('/:appointmentId', auth, appointmentController.getAppointment);
router.get('/', auth, appointmentController.getAppointments);
router.put('/:appointmentId', auth, appointmentController.updateAppointment);
router.delete('/:appointmentId', auth, appointmentController.deleteAppointment);

module.exports = router;