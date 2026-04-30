const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/opdController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
const noPatient = authorize('admin', 'doctor', 'nurse', 'receptionist', 'worker', 'pharmacist');
router.get('/', noPatient, ctrl.getAll);
router.get('/:id', noPatient, ctrl.getById);
router.post('/', authorize('admin', 'doctor', 'nurse', 'receptionist'), ctrl.create);
router.put('/:id', authorize('admin', 'doctor', 'nurse'), ctrl.update);

module.exports = router;
