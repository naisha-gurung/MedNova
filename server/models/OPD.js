const mongoose = require('mongoose');

const opdSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  visitDate: { type: Date, default: Date.now },
  chiefComplaint: { type: String, required: true },
  vitals: {
    temperature: { type: String },
    bloodPressure: { type: String },
    pulse: { type: String },
    weight: { type: String },
    height: { type: String },
    oxygenSaturation: { type: String },
  },
  diagnosis: { type: String },
  treatment: { type: String },
  prescription: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
  status: { type: String, enum: ['waiting', 'in-progress', 'completed'], default: 'waiting' },
  referredTo: { type: String },
  followUpDate: { type: Date },
  notes: { type: String },
  registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('OPD', opdSchema);
