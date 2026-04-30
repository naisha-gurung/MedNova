const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, select: false },
  role: {
    type: String,
    enum: ['admin', 'doctor', 'nurse', 'pharmacist', 'patient', 'receptionist', 'worker'],
    default: 'patient'
  },
  phone: { type: String, trim: true },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  dateOfBirth: { type: Date },
  address: { type: String },
  profilePicture: { type: String, default: '' },
  googleId: { type: String },
  specialization: { type: String }, // For doctors
  consultationFee: { type: Number, default: 0 }, // For doctors
  department: { type: String },
  isActive: { type: Boolean, default: true },
  bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''] },
  emergencyContact: { type: String },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
