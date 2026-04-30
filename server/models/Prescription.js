const mongoose = require('mongoose');

const medicineLineSchema = new mongoose.Schema({
  inventoryItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' }, // null if "other"
  medicineName: { type: String, required: true },
  isExternal: { type: Boolean, default: false }, // true if not in inventory
  dosage: { type: String, required: true },
  frequency: { type: String, required: true }, // e.g. "3 times a day"
  duration: { type: String, required: true }, // e.g. "7 days"
  instructions: { type: String },
});

const prescriptionSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  medicines: [medicineLineSchema],
  diagnosis: { type: String, required: true },
  notes: { type: String },
  followUpDate: { type: Date },
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);
