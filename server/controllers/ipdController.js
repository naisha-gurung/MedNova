const { IPD, Bed } = require('../models/IPD');

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
      .populate('bed', 'bedNumber ward type')
      .sort('-admissionDate')
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ records, total });
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

    const record = await IPD.create({ ...req.body, admittedBy: req.user._id });

    // Mark bed as occupied
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

    // Free the bed
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
