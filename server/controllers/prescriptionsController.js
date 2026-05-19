// controllers/prescriptionsController.js

const Prescription = require('../models/Prescription');
const User = require('../models/User'); // needed for doctors list

// Helper: strips empty strings from ObjectId fields so Mongoose doesn't choke
const sanitizeObjectIdFields = (body, fields) => {
  const sanitized = { ...body };
  fields.forEach(field => {
    if (sanitized[field] === '' || sanitized[field] === null) {
      delete sanitized[field];
    }
  });
  return sanitized;
};

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
    // ✅ Strip empty strings from all ObjectId fields before saving
    const sanitizedBody = sanitizeObjectIdFields(req.body, ['appointment', 'patient']);

    const rx = await Prescription.create({
      ...sanitizedBody,
      doctor: req.user._id,
    });
    res.status(201).json({ prescription: rx });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.update = async (req, res) => {
  try {
    // ✅ Same fix for updates
    const sanitizedBody = sanitizeObjectIdFields(req.body, ['appointment', 'patient']);

    const rx = await Prescription.findByIdAndUpdate(req.params.id, sanitizedBody, { new: true, runValidators: true });
    if (!rx) return res.status(404).json({ message: 'Prescription not found' });
    res.json({ prescription: rx });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ✅ New endpoint for doctors dropdown
exports.getDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor', isActive: true })
      .select('name specialization department')
      .sort('name');
    res.json({ doctors });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const sanitizedBody = sanitizeObjectIdFields(req.body, ['appointment', 'patient']);

    // ✅ Strip empty inventoryItem from medicine lines
    if (Array.isArray(sanitizedBody.medicines)) {
      sanitizedBody.medicines = sanitizedBody.medicines.map(med => {
        const m = { ...med };
        if (!m.inventoryItem) delete m.inventoryItem;
        return m;
      });
    }

    const rx = await Prescription.create({
      ...sanitizedBody,
      doctor: req.user._id,
    });
    res.status(201).json({ prescription: rx });
  } catch (err) { res.status(500).json({ message: err.message }); }
};