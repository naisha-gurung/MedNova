const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema({
  bedNumber: { type: String, required: true, unique: true },
  ward: { type: String, required: true }, // General, ICU, Emergency, Maternity, etc.
  floor: { type: String },
  type: { type: String, enum: ['general', 'semi-private', 'private', 'icu', 'emergency'], default: 'general' },
  isOccupied: { type: Boolean, default: false },
  currentPatient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  dailyCharge: { type: Number, default: 0 },
}, { timestamps: true });

const ipdSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bed: { type: mongoose.Schema.Types.ObjectId, ref: 'Bed', required: true },
  admissionDate: { type: Date, default: Date.now },
  dischargeDate: { type: Date },
  admissionReason: { type: String, required: true },
  diagnosis: { type: String },
  treatment: { type: String },
  vitals: [{
    recordedAt: { type: Date, default: Date.now },
    temperature: String,
    bloodPressure: String,
    pulse: String,
    oxygenSaturation: String,
    notes: String,
  }],
  status: { type: String, enum: ['admitted', 'under-treatment', 'discharged', 'transferred'], default: 'admitted' },
  totalBill: { type: Number, default: 0 },
  notes: { type: String },
  admittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Bed = mongoose.model('Bed', bedSchema);
const IPD = mongoose.model('IPD', ipdSchema);

module.exports = { Bed, IPD };
