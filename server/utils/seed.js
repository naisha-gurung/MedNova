require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Inventory = require('../models/Inventory');
const { Bed } = require('../models/IPD');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mednova');
  console.log('MongoDB connected for seeding...');
};

const seed = async () => {
  await connectDB();

  // Clear existing
  await User.deleteMany({});
  await Inventory.deleteMany({});
  await Bed.deleteMany({});

  console.log('Cleared existing data...');

  // Create users
  const password = await bcrypt.hash('password123', 12);

  const users = await User.insertMany([
    { name: 'Admin User', email: 'admin@mednova.com', password, role: 'admin', phone: '9876543210', gender: 'male', isActive: true },
    { name: 'Dr. Arjun Sharma', email: 'doctor1@mednova.com', password, role: 'doctor', specialization: 'Cardiology', consultationFee: 800, department: 'Cardiology', phone: '9876543211', gender: 'male', isActive: true },
    { name: 'Dr. Priya Mehta', email: 'doctor2@mednova.com', password, role: 'doctor', specialization: 'Orthopedics', consultationFee: 700, department: 'Orthopedics', phone: '9876543212', gender: 'female', isActive: true },
    { name: 'Dr. Rahul Verma', email: 'doctor3@mednova.com', password, role: 'doctor', specialization: 'Neurology', consultationFee: 900, department: 'Neurology', phone: '9876543213', gender: 'male', isActive: true },
    { name: 'Dr. Sneha Kapoor', email: 'doctor4@mednova.com', password, role: 'doctor', specialization: 'Pediatrics', consultationFee: 600, department: 'Pediatrics', phone: '9876543214', gender: 'female', isActive: true },
    { name: 'Dr. Vikram Nair', email: 'doctor5@mednova.com', password, role: 'doctor', specialization: 'Dermatology', consultationFee: 650, department: 'Dermatology', phone: '9876543215', gender: 'male', isActive: true },
    { name: 'Nurse Anita Singh', email: 'nurse@mednova.com', password, role: 'nurse', department: 'General', phone: '9876543216', gender: 'female', isActive: true },
    { name: 'Raj Patel', email: 'pharmacist@mednova.com', password, role: 'pharmacist', phone: '9876543217', gender: 'male', isActive: true },
    { name: 'Meena Gupta', email: 'receptionist@mednova.com', password, role: 'receptionist', phone: '9876543218', gender: 'female', isActive: true },
    { name: 'Ramu Kumar', email: 'worker@mednova.com', password, role: 'worker', phone: '9876543219', gender: 'male', isActive: true },
    { name: 'Amit Kumar', email: 'patient@mednova.com', password, role: 'patient', phone: '9876543220', gender: 'male', bloodGroup: 'B+', dateOfBirth: new Date('1990-05-15'), address: '123 MG Road, Delhi', isActive: true },
    { name: 'Sunita Devi', email: 'patient2@mednova.com', password, role: 'patient', phone: '9876543221', gender: 'female', bloodGroup: 'A+', dateOfBirth: new Date('1985-08-22'), address: '456 Park Street, Mumbai', isActive: true },
  ]);

  console.log(`Created ${users.length} users`);

  // Create inventory
  const medicines = await Inventory.insertMany([
    { name: 'Paracetamol 500mg', genericName: 'Acetaminophen', category: 'tablet', manufacturer: 'Sun Pharma', quantity: 500, unit: 'tablets', purchasePrice: 2, sellingPrice: 5, reorderLevel: 50, expiryDate: new Date('2026-12-31'), addedBy: users[0]._id },
    { name: 'Amoxicillin 250mg', genericName: 'Amoxicillin', category: 'capsule', manufacturer: 'Cipla', quantity: 200, unit: 'capsules', purchasePrice: 8, sellingPrice: 18, reorderLevel: 30, expiryDate: new Date('2026-06-30'), addedBy: users[0]._id },
    { name: 'Azithromycin 500mg', genericName: 'Azithromycin', category: 'tablet', manufacturer: 'Dr. Reddy\'s', quantity: 150, unit: 'tablets', purchasePrice: 12, sellingPrice: 25, reorderLevel: 20, expiryDate: new Date('2026-09-30'), addedBy: users[0]._id },
    { name: 'Metformin 500mg', genericName: 'Metformin HCl', category: 'tablet', manufacturer: 'Sun Pharma', quantity: 8, unit: 'tablets', purchasePrice: 3, sellingPrice: 7, reorderLevel: 50, expiryDate: new Date('2026-03-31'), addedBy: users[0]._id },
    { name: 'Atorvastatin 10mg', genericName: 'Atorvastatin', category: 'tablet', manufacturer: 'Pfizer', quantity: 300, unit: 'tablets', purchasePrice: 6, sellingPrice: 14, reorderLevel: 40, expiryDate: new Date('2027-01-31'), addedBy: users[0]._id },
    { name: 'Omeprazole 20mg', genericName: 'Omeprazole', category: 'capsule', manufacturer: 'Ranbaxy', quantity: 250, unit: 'capsules', purchasePrice: 4, sellingPrice: 10, reorderLevel: 30, expiryDate: new Date('2026-08-31'), addedBy: users[0]._id },
    { name: 'Cough Syrup 100ml', genericName: 'Dextromethorphan', category: 'syrup', manufacturer: 'Mankind', quantity: 12, unit: 'bottles', purchasePrice: 45, sellingPrice: 90, reorderLevel: 20, expiryDate: new Date('2026-04-30'), addedBy: users[0]._id },
    { name: 'Normal Saline 500ml', genericName: 'Sodium Chloride 0.9%', category: 'injection', manufacturer: 'Baxter', quantity: 80, unit: 'bottles', purchasePrice: 35, sellingPrice: 70, reorderLevel: 20, expiryDate: new Date('2026-11-30'), addedBy: users[0]._id },
    { name: 'Betamethasone Cream', genericName: 'Betamethasone', category: 'ointment', manufacturer: 'GSK', quantity: 60, unit: 'tubes', purchasePrice: 25, sellingPrice: 55, reorderLevel: 15, expiryDate: new Date('2026-07-31'), addedBy: users[0]._id },
    { name: 'Salbutamol Inhaler', genericName: 'Salbutamol', category: 'inhaler', manufacturer: 'Cipla', quantity: 5, unit: 'units', purchasePrice: 120, sellingPrice: 250, reorderLevel: 10, expiryDate: new Date('2026-10-31'), addedBy: users[0]._id },
    { name: 'Ibuprofen 400mg', genericName: 'Ibuprofen', category: 'tablet', manufacturer: 'Abbott', quantity: 400, unit: 'tablets', purchasePrice: 3, sellingPrice: 8, reorderLevel: 50, expiryDate: new Date('2026-12-31'), addedBy: users[0]._id },
    { name: 'Cetirizine 10mg', genericName: 'Cetirizine HCl', category: 'tablet', manufacturer: 'UCB', quantity: 180, unit: 'tablets', purchasePrice: 2, sellingPrice: 5, reorderLevel: 25, expiryDate: new Date('2026-09-30'), addedBy: users[0]._id },
  ]);

  console.log(`Created ${medicines.length} inventory items`);

  // Create beds
  const beds = [];
  const wards = [
    { ward: 'General', count: 10, type: 'general', dailyCharge: 500 },
    { ward: 'Semi-Private', count: 6, type: 'semi-private', dailyCharge: 1500 },
    { ward: 'Private', count: 4, type: 'private', dailyCharge: 3000 },
    { ward: 'ICU', count: 5, type: 'icu', dailyCharge: 8000 },
    { ward: 'Emergency', count: 5, type: 'emergency', dailyCharge: 5000 },
  ];

  let bedNum = 100;
  for (const w of wards) {
    for (let i = 0; i < w.count; i++) {
      beds.push({ bedNumber: `${w.ward.charAt(0)}${bedNum++}`, ward: w.ward, type: w.type, dailyCharge: w.dailyCharge, isOccupied: false });
    }
  }
  await Bed.insertMany(beds);
  console.log(`Created ${beds.length} beds`);

  console.log('\n✅ Seed completed! Login credentials:');
  console.log('  Admin:       admin@mednova.com / password123');
  console.log('  Doctor:      doctor1@mednova.com / password123');
  console.log('  Nurse:       nurse@mednova.com / password123');
  console.log('  Pharmacist:  pharmacist@mednova.com / password123');
  console.log('  Receptionist:receptionist@mednova.com / password123');
  console.log('  Patient:     patient@mednova.com / password123');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
