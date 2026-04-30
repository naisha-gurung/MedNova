const OPD = require('../models/OPD');

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
      .sort('-visitDate')
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ records, total });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getById = async (req, res) => {
  try {
    const record = await OPD.findById(req.params.id)
      .populate('patient', 'name email phone gender dateOfBirth bloodGroup')
      .populate('doctor', 'name specialization department')
      .populate('prescription');
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
