const Appointment = require('../models/Appointment');
const User = require('../models/User');

// Helper: parse "09:00 AM" style slot into a Date on a given date string
function slotToDateTime(dateStr, slot) {
  const [time, meridiem] = slot.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (meridiem === 'PM' && hours !== 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  const d = new Date(dateStr);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

exports.getAppointments = async (req, res) => {
  try {
    const { status, doctorId, patientId, date, page = 1, limit = 20 } = req.query;
    const query = {};
    const { user } = req;

    if (user.role === 'patient') query.patient = user._id;
    else if (user.role === 'doctor') query.doctor = user._id;
    else {
      if (doctorId) query.doctor = doctorId;
      if (patientId) query.patient = patientId;
    }
    if (status) query.status = status;
    if (date) {
      const d = new Date(date);
      query.date = { $gte: new Date(d.setHours(0,0,0,0)), $lt: new Date(d.setHours(23,59,59,999)) };
    }

    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone profilePicture')
      .populate('doctor', 'name email specialization profilePicture consultationFee')
      .sort('-date')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ appointments, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getAppointmentById = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone gender bloodGroup profilePicture')
      .populate('doctor', 'name specialization consultationFee profilePicture department');
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });
    res.json({ appointment: appt });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || !date) return res.status(400).json({ message: 'doctorId and date required' });

    const d = new Date(date);
    const booked = await Appointment.find({
      doctor: doctorId,
      date: { $gte: new Date(d.setHours(0,0,0,0)), $lt: new Date(new Date(date).setHours(23,59,59,999)) },
      status: { $nin: ['cancelled'] }
    }).select('timeSlot');

    const bookedSlots = booked.map(a => a.timeSlot);
    const allSlots = [
      '09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM',
      '12:00 PM','12:30 PM','02:00 PM','02:30 PM','03:00 PM','03:30 PM',
      '04:00 PM','04:30 PM','05:00 PM'
    ];

    const now = new Date();
    const isToday = new Date(date).toDateString() === now.toDateString();
    const isAdmin = req.user && req.user.role === 'admin';

    const available = allSlots.filter(s => {
      if (bookedSlots.includes(s)) return false;
      // Filter past slots on today unless admin
      if (isToday && !isAdmin) {
        const slotTime = slotToDateTime(date, s);
        return slotTime > now;
      }
      return true;
    });

    res.json({ available, booked: bookedSlots });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createAppointment = async (req, res) => {
  try {
    const { doctorId, date, timeSlot, reason, type } = req.body;
    const isAdmin = req.user && req.user.role === 'admin';

    // Prevent past DATE booking (admins exempt)
    if (!isAdmin && new Date(date) < new Date().setHours(0,0,0,0)) {
      return res.status(400).json({ message: 'Cannot book appointment for a past date' });
    }

    // Prevent past TIME SLOT on today (admins exempt)
    const isToday = new Date(date).toDateString() === new Date().toDateString();
    if (!isAdmin && isToday && timeSlot) {
      const slotTime = slotToDateTime(date, timeSlot);
      if (slotTime <= new Date()) {
        return res.status(400).json({ message: 'Cannot book a time slot that has already passed' });
      }
    }

    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') return res.status(404).json({ message: 'Doctor not found' });

    const d = new Date(date);
    const conflict = await Appointment.findOne({
      doctor: doctorId,
      date: { $gte: new Date(d.setHours(0,0,0,0)), $lt: new Date(new Date(date).setHours(23,59,59,999)) },
      timeSlot,
      status: { $nin: ['cancelled'] }
    });
    if (conflict) return res.status(409).json({ message: 'This time slot is already booked' });

    const patientId = req.user.role === 'patient' ? req.user._id : req.body.patientId;

    const appointment = await Appointment.create({
      patient: patientId,
      doctor: doctorId,
      date,
      timeSlot,
      reason,
      type: type || 'opd',
      consultationFee: doctor.consultationFee || 0,
      paymentStatus: 'pending',
      bookedBy: req.user._id,
    });

    await appointment.populate([
      { path: 'patient', select: 'name email' },
      { path: 'doctor', select: 'name specialization consultationFee' }
    ]);

    res.status(201).json({ appointment, message: 'Appointment booked. Complete payment to confirm.' });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Time slot already booked' });
    res.status(500).json({ message: err.message });
  }
};

exports.processPayment = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });
    appt.paymentStatus = 'paid';
    appt.paymentId = `PAY_${Date.now()}`;
    appt.status = 'confirmed';
    await appt.save();
    res.json({ appointment: appt, message: 'Payment successful. Appointment confirmed.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateAppointment = async (req, res) => {
  try {
    const allowed = ['status', 'notes', 'timeSlot', 'date'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const appt = await Appointment.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('patient', 'name email')
      .populate('doctor', 'name specialization');
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });
    res.json({ appointment: appt });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.cancelAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });
    appt.status = 'cancelled';
    if (appt.paymentStatus === 'paid') appt.paymentStatus = 'refunded';
    await appt.save();
    res.json({ appointment: appt, message: 'Appointment cancelled' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};