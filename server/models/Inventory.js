const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  genericName: { type: String, trim: true },
  category: {
    type: String,
    enum: ['tablet', 'capsule', 'syrup', 'injection', 'ointment', 'drops', 'inhaler', 'other'],
    required: true
  },
  manufacturer: { type: String, trim: true },
  batchNumber: { type: String },
  expiryDate: { type: Date },
  quantity: { type: Number, required: true, min: 0 },
  unit: { type: String, default: 'units' },
  purchasePrice: { type: Number, min: 0 },
  sellingPrice: { type: Number, min: 0 },
  reorderLevel: { type: Number, default: 10 },
  location: { type: String }, // shelf/rack location
  description: { type: String },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);
