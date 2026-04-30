const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/prescriptionsController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', authorize('admin', 'doctor', 'nurse'), ctrl.create);
router.put('/:id', authorize('admin', 'doctor', 'nurse'), ctrl.update);

module.exports = router;
