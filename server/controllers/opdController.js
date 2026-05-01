const OPD = require('../models/OPD');
const Appointment = require('../models/Appointment');

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

// Derive OPD status from an appointment's date + timeSlot:
// - appointment time is in the future (>1hr away): waiting
// - within 1 hour window of appointment start: in-progress
// - past 1 hour from appointment start: completed
function deriveOPDStatus(appt) {
  if (!appt || !appt.date || !appt.timeSlot) return null;
  const apptTime = slotToDateTime(appt.date, appt.timeSlot);
  const now = new Date();
  const diffMs = now - apptTime; // positive = past, negative = future
  if (diffMs < 0) return 'waiting';           // appointment in future
  if (diffMs <= 60 * 60 * 1000) return 'in-progress'; // within 1 hour window
  return 'completed';                          // more than 1 hour past
}

exports.getAll = async (req, res) => {
  try {
    const { status, doctorId, patientId, date, page = 1, limit = 20 } = req.query;
    const query = {};
    if (req.user.role === 'doctor') query.doctor = req.user._id;
    else if (doctorId) query.doctor = doctorId;
    if (patientId) query.patient = patientId;
    if (status) query.status = status;
    if (date) {
      const d = new Date(date);
      query.visitDate = { $gte: new Date(d.setHours(0,0,0,0)), $lt: new Date(new Date(date).setHours(23,59,59,999)) };
    }
    const total = await OPD.countDocuments(query);
    const records = await OPD.find(query)
      .populate('patient', 'name email phone gender bloodGroup profilePicture')
      .populate('doctor', 'name specialization')
      .populate({ path: 'appointment', select: 'date timeSlot status' })
      .sort('-visitDate')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Auto-derive status from linked appointment if available
    const now = new Date();
    const updatedRecords = await Promise.all(records.map(async (r) => {
      const rObj = r.toObject();
      if (r.appointment && r.appointment.date && r.appointment.timeSlot) {
        const derived = deriveOPDStatus(r.appointment);
        if (derived && r.status !== derived && r.status !== 'completed') {
          // Only auto-update if not manually set to completed already
          await OPD.findByIdAndUpdate(r._id, { status: derived });
          rObj.status = derived;
        }
      }
      return rObj;
    }));

    // Re-filter after status update if status filter was applied
    const finalRecords = status
      ? updatedRecords.filter(r => r.status === status)
      : updatedRecords;

    res.json({ records: finalRecords, total });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getById = async (req, res) => {
  try {
    const record = await OPD.findById(req.params.id)
      .populate('patient', 'name email phone gender dateOfBirth bloodGroup')
      .populate('doctor', 'name specialization department')
      .populate('prescription')
      .populate({ path: 'appointment', select: 'date timeSlot status' });
    if (!record) return res.status(404).json({ message: 'OPD record not found' });
    res.json({ record });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const record = await OPD.create({ ...req.body, registeredBy: req.user._id });
    res.status(201).json({ record });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const record = await OPD.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('patient', 'name email')
      .populate('doctor', 'name specialization');
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json({ record });
  } catch (err) { res.status(500).json({ message: err.message }); }
};