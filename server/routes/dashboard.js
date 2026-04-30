const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Inventory = require('../models/Inventory');
const OPD = require('../models/OPD');
const { IPD, Bed } = require('../models/IPD');
const Prescription = require('../models/Prescription');
const { protect } = require('../middleware/auth');

router.get('/stats', protect, async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const [
      totalPatients, totalDoctors, totalStaff,
      todayAppointments, pendingAppointments, confirmedAppointments,
      totalBeds, occupiedBeds,
      lowStockItems,
      todayOPD, activeIPD,
      totalRevenue
    ] = await Promise.all([
      User.countDocuments({ role: 'patient', isActive: true }),
      User.countDocuments({ role: 'doctor', isActive: true }),
      User.countDocuments({ role: { $nin: ['patient'] }, isActive: true }),
      Appointment.countDocuments({ date: { $gte: startOfDay, $lte: endOfDay } }),
      Appointment.countDocuments({ status: 'pending' }),
      Appointment.countDocuments({ status: 'confirmed' }),
      Bed.countDocuments(),
      Bed.countDocuments({ isOccupied: true }),
      Inventory.countDocuments({ $expr: { $lte: ['$quantity', '$reorderLevel'] } }),
      OPD.countDocuments({ visitDate: { $gte: startOfDay, $lte: endOfDay } }),
      IPD.countDocuments({ status: { $in: ['admitted', 'under-treatment'] } }),
      Appointment.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$consultationFee' } } }
      ])
    ]);

    // Recent appointments
    const recentAppointments = await Appointment.find()
      .populate('patient', 'name profilePicture')
      .populate('doctor', 'name specialization')
      .sort('-createdAt')
      .limit(5);

    // Monthly appointment trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyTrend = await Appointment.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      stats: {
        totalPatients, totalDoctors, totalStaff,
        todayAppointments, pendingAppointments, confirmedAppointments,
        totalBeds, occupiedBeds, availableBeds: totalBeds - occupiedBeds,
        lowStockItems, todayOPD, activeIPD,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
      recentAppointments,
      monthlyTrend,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
