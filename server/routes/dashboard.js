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
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const role = req.user.role;
    const userId = req.user._id;

    // ─── PATIENT dashboard ───────────────────────────────────────────────────
    if (role === 'patient') {
      const [
        myTotalAppointments,
        myUpcoming,
        myConfirmed,
        myPrescriptions,
      ] = await Promise.all([
        Appointment.countDocuments({ patient: userId }),
        Appointment.countDocuments({
          patient: userId,
          date: { $gte: startOfDay },
          status: { $in: ['pending', 'confirmed'] },
        }),
        Appointment.countDocuments({ patient: userId, status: 'confirmed' }),
        Prescription.countDocuments({ patient: userId }),
      ]);

      const recentAppointments = await Appointment.find({ patient: userId })
        .populate('doctor', 'name specialization profilePicture')
        .sort('-date')
        .limit(5)
        .lean();

      let monthlyTrend = [];
      try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        monthlyTrend = await Appointment.aggregate([
          { $match: { patient: userId, createdAt: { $gte: sixMonthsAgo } } },
          { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, count: { $sum: 1 } } },
          { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]).exec();
      } catch (e) {
        console.error('Monthly trend aggregate error:', e.message);
      }

      return res.json({
        role: 'patient',
        stats: {
          myTotalAppointments,
          myUpcoming,
          myConfirmed,
          myPrescriptions,
        },
        recentAppointments,
        monthlyTrend,
      });
    }

    // ─── DOCTOR dashboard ────────────────────────────────────────────────────
    if (role === 'doctor') {
      const [
        myTodayAppointments,
        myPendingAppointments,
        myTotalPatients,
        myPrescriptions,
      ] = await Promise.all([
        Appointment.countDocuments({ doctor: userId, date: { $gte: startOfDay, $lte: endOfDay } }),
        Appointment.countDocuments({ doctor: userId, status: 'pending' }),
        Appointment.distinct('patient', { doctor: userId }).then(ids => ids.length),
        Prescription.countDocuments({ doctor: userId }),
      ]);

      const recentAppointments = await Appointment.find({ doctor: userId })
        .populate('patient', 'name profilePicture phone')
        .populate('doctor', 'name specialization')
        .sort('-date')
        .limit(5)
        .lean();

      let monthlyTrend = [];
      try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        monthlyTrend = await Appointment.aggregate([
          { $match: { doctor: userId, createdAt: { $gte: sixMonthsAgo } } },
          { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, count: { $sum: 1 } } },
          { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]).exec();
      } catch (e) {
        console.error('Monthly trend aggregate error:', e.message);
      }

      return res.json({
        role: 'doctor',
        stats: {
          myTodayAppointments,
          myPendingAppointments,
          myTotalPatients,
          myPrescriptions,
        },
        recentAppointments,
        monthlyTrend,
      });
    }

    // ─── ADMIN / STAFF dashboard (all roles except patient & doctor) ─────────
    const [
      totalPatients,
      totalDoctors,
      totalStaff,
      todayAppointments,
      pendingAppointments,
      confirmedAppointments,
      totalBeds,
      occupiedBeds,
      lowStockItems,
      todayOPD,
      activeIPD,
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
    ]);

    let totalRevenue = 0;
    // Only admins see revenue
    if (role === 'admin') {
      try {
        const revenueResult = await Appointment.aggregate([
          { $match: { paymentStatus: 'paid' } },
          { $group: { _id: null, total: { $sum: '$consultationFee' } } },
        ]).exec();
        totalRevenue = revenueResult[0]?.total || 0;
      } catch (e) {
        console.error('Revenue aggregate error:', e.message);
      }
    }

    const recentAppointments = await Appointment.find()
      .populate('patient', 'name profilePicture')
      .populate('doctor', 'name specialization')
      .sort('-createdAt')
      .limit(5)
      .lean();

    let monthlyTrend = [];
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      monthlyTrend = await Appointment.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]).exec();
    } catch (e) {
      console.error('Monthly trend aggregate error:', e.message);
    }

    res.json({
      role,
      stats: {
        totalPatients,
        totalDoctors,
        totalStaff,
        todayAppointments,
        pendingAppointments,
        confirmedAppointments,
        totalBeds,
        occupiedBeds,
        availableBeds: totalBeds - occupiedBeds,
        lowStockItems,
        todayOPD,
        activeIPD,
        ...(role === 'admin' && { totalRevenue }),
      },
      recentAppointments,
      monthlyTrend,
    });
  } catch (err) {
    console.error('Dashboard stats error:', err.message, err.stack);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;