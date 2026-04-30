const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/ipdController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
const noPatient = authorize('admin', 'doctor', 'nurse', 'receptionist', 'worker', 'pharmacist');

// Bed routes
router.get('/beds', noPatient, ctrl.getAllBeds);
router.post('/beds', authorize('admin'), ctrl.createBed);
router.put('/beds/:id', authorize('admin', 'nurse'), ctrl.updateBed);

// IPD routes
router.get('/', noPatient, ctrl.getAllIPD);
router.get('/:id', noPatient, ctrl.getIPDById);
router.post('/', authorize('admin', 'doctor', 'nurse', 'receptionist'), ctrl.admitPatient);
router.put('/:id', authorize('admin', 'doctor', 'nurse'), ctrl.updateIPD);
router.patch('/:id/discharge', authorize('admin', 'doctor'), ctrl.dischargePatient);
router.post('/:id/vitals', authorize('admin', 'doctor', 'nurse'), ctrl.addVitals);

module.exports = router;
