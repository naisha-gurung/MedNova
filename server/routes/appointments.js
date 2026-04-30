const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/appointmentsController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', ctrl.getAppointments);
router.get('/slots', ctrl.getAvailableSlots);
router.get('/:id', ctrl.getAppointmentById);
router.post('/', ctrl.createAppointment);
router.post('/:id/pay', ctrl.processPayment);
router.put('/:id', authorize('admin', 'doctor', 'nurse', 'receptionist'), ctrl.updateAppointment);
router.patch('/:id/cancel', ctrl.cancelAppointment);

module.exports = router;
