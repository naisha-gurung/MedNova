const Prescription = require('../models/Prescription');

exports.getAll = async (req, res) => {
  try {
    const { patientId, page = 1, limit = 20 } = req.query;
    const query = {};
    if (req.user.role === 'patient') query.patient = req.user._id;
    else if (req.user.role === 'doctor') query.doctor = req.user._id;
    else if (patientId) query.patient = patientId;

    const total = await Prescription.countDocuments(query);
    const prescriptions = await Prescription.find(query)
      .populate('patient', 'name email')
      .populate('doctor', 'name specialization')
      .populate('medicines.inventoryItem', 'name genericName')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ prescriptions, total });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getById = async (req, res) => {
  try {
    const rx = await Prescription.findById(req.params.id)
      .populate('patient', 'name email dateOfBirth gender bloodGroup')
      .populate('doctor', 'name specialization department')
      .populate('appointment')
      .populate('medicines.inventoryItem', 'name genericName category');
    if (!rx) return res.status(404).json({ message: 'Prescription not found' });
    res.json({ prescription: rx });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const rx = await Prescription.create({ ...req.body, doctor: req.user._id });
    res.status(201).json({ prescription: rx });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const rx = await Prescription.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!rx) return res.status(404).json({ message: 'Prescription not found' });
    res.json({ prescription: rx });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
