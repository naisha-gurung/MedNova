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

const handleSubmit = async (e) => {
  e.preventDefault();
  if (form.medicines.length === 0) return toast.error('Add at least one medicine');
  if (needsDoctorSelect && !form.doctor) return toast.error('Please select a doctor');

  setSaving(true);
  try {
    const payload = sanitizePayload(form);

    // ✅ Strip empty inventoryItem from each medicine line
    payload.medicines = payload.medicines.map(med => {
      const m = { ...med };
      if (!m.inventoryItem) delete m.inventoryItem;
      return m;
    });

    await api.post('/prescriptions', payload);
    toast.success('Prescription created');
    onSaved(); onClose();
  } catch (err) {
    if (!err._toasted) toast.error(err.response?.data?.message || 'Failed to save');
  } finally { setSaving(false); }
};