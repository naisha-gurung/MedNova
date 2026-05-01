const { IPD, Bed } = require('../models/IPD');
const Appointment = require('../models/Appointment');

// Helper: parse "09:00 AM" style slot into a Date
function slotToDateTime(dateStr, slot) {
  const [time, meridiem] = slot.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (meridiem === 'PM' && hours !== 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  const d = new Date(dateStr);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

// Derive IPD status from appointment:
// - future appointment: admitted (waiting)
// - within 24 hours of admission: under-treatment
// - more than 24 hours: stays under-treatment until discharged manually
// Logic based on admissionDate (when actually admitted):
// - admitted < 24 hours ago: under-treatment
// - If linked to appointment and slot is in the future: admitted
function deriveIPDStatus(record) {
  if (!record || record.status === 'discharged') return null;
  const now = new Date();
  const admissionTime = new Date(record.admissionDate);
  const diffMs = now - admissionTime;

  if (diffMs < 0) return 'admitted';                           // future admission
  if (diffMs <= 24 * 60 * 60 * 1000) return 'under-treatment'; // within 24 hours
  // More than 24 hours: keep as under-treatment (still in hospital)
  return 'under-treatment';
}

exports.getAllBeds = async (req, res) => {
  try {
    const { ward, isOccupied } = req.query;
    const query = {};
    if (ward) query.ward = ward;
    if (isOccupied !== undefined) query.isOccupied = isOccupied === 'true';
    const beds = await Bed.find(query).populate('currentPatient', 'name email').sort('ward bedNumber');
    res.json({ beds });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createBed = async (req, res) => {
  try {
    const bed = await Bed.create(req.body);
    res.status(201).json({ bed });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Bed number already exists' });
    res.status(500).json({ message: err.message });
  }
};

exports.updateBed = async (req, res) => {
  try {
    const bed = await Bed.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!bed) return res.status(404).json({ message: 'Bed not found' });
    res.json({ bed });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getAllIPD = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (req.user.role === 'doctor') query.doctor = req.user._id;
    const total = await IPD.countDocuments(query);
    const records = await IPD.find(query)
      .populate('patient', 'name email phone gender bloodGroup profilePicture')
      .populate('doctor', 'name specialization')
      .populate('bed', 'bedNumber ward type dailyCharge')
      .sort('-admissionDate')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Auto-derive and update status for non-discharged records
    const updatedRecords = await Promise.all(records.map(async (r) => {
      const rObj = r.toObject();
      if (r.status !== 'discharged' && r.status !== 'transferred') {
        const derived = deriveIPDStatus(r);
        if (derived && r.status !== derived) {
          await IPD.findByIdAndUpdate(r._id, { status: derived });
          rObj.status = derived;
        }
      }
      return rObj;
    }));

    // Re-filter after status update
    const finalRecords = status
      ? updatedRecords.filter(r => r.status === status)
      : updatedRecords;

    res.json({ records: finalRecords, total });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getIPDById = async (req, res) => {
  try {
    const record = await IPD.findById(req.params.id)
      .populate('patient', 'name email phone gender dateOfBirth bloodGroup address emergencyContact')
      .populate('doctor', 'name specialization department')
      .populate('bed', 'bedNumber ward floor type dailyCharge');
    if (!record) return res.status(404).json({ message: 'IPD record not found' });
    res.json({ record });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.admitPatient = async (req, res) => {
  try {
    const { bedId } = req.body;
    const bed = await Bed.findById(bedId);
    if (!bed) return res.status(404).json({ message: 'Bed not found' });
    if (bed.isOccupied) return res.status(409).json({ message: 'Bed is already occupied' });

    // New admissions start as 'admitted'; status transitions to under-treatment automatically
    const record = await IPD.create({ ...req.body, admittedBy: req.user._id, status: 'admitted' });

    bed.isOccupied = true;
    bed.currentPatient = req.body.patient;
    await bed.save();

    await record.populate([
      { path: 'patient', select: 'name email' },
      { path: 'doctor', select: 'name specialization' },
      { path: 'bed', select: 'bedNumber ward type' }
    ]);

    res.status(201).json({ record });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateIPD = async (req, res) => {
  try {
    const record = await IPD.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('patient', 'name email')
      .populate('doctor', 'name specialization')
      .populate('bed', 'bedNumber ward');
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json({ record });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.dischargePatient = async (req, res) => {
  try {
    const record = await IPD.findById(req.params.id).populate('bed');
    if (!record) return res.status(404).json({ message: 'IPD record not found' });

    record.status = 'discharged';
    record.dischargeDate = new Date();
    if (req.body.totalBill) record.totalBill = req.body.totalBill;
    if (req.body.notes) record.notes = req.body.notes;
    await record.save();

    if (record.bed) {
      await Bed.findByIdAndUpdate(record.bed._id, { isOccupied: false, currentPatient: null });
    }

    res.json({ record, message: 'Patient discharged successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addVitals = async (req, res) => {
  try {
    const record = await IPD.findByIdAndUpdate(
      req.params.id,
      { $push: { vitals: { ...req.body, recordedAt: new Date() } } },
      { new: true }
    );
    if (!record) return res.status(404).json({ message: 'IPD record not found' });
    res.json({ record });
  } catch (err) { res.status(500).json({ message: err.message }); }
};