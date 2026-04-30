const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { search, specialization } = req.query;
    const query = { role: 'doctor', isActive: true };
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { specialization: { $regex: search, $options: 'i' } }
    ];
    if (specialization) query.specialization = { $regex: specialization, $options: 'i' };
    const doctors = await User.find(query).select('name email specialization consultationFee department profilePicture gender');
    res.json({ doctors });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/specializations', async (req, res) => {
  try {
    const specs = await User.distinct('specialization', { role: 'doctor', isActive: true });
    res.json({ specializations: specs.filter(Boolean) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' })
      .select('name email specialization consultationFee department profilePicture gender phone');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json({ doctor });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
