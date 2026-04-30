const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', ctrl.getAll);
router.get('/low-stock', ctrl.getLowStock);
router.get('/:id', ctrl.getById);
router.post('/', authorize('admin', 'pharmacist'), ctrl.create);
router.put('/:id', authorize('admin', 'pharmacist'), ctrl.update);
router.delete('/:id', authorize('admin', 'pharmacist'), ctrl.remove);

module.exports = router;
