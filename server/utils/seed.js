require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Inventory = require('../models/Inventory');
const { Bed, IPD } = require('../models/IPD');
const Appointment = require('../models/Appointment');
const OPD = require('../models/OPD');
const Prescription = require('../models/Prescription');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mednova');
  console.log('MongoDB connected for seeding...');
  console.log('Connected DB:', mongoose.connection.name);
};

// Helper: date N days from today
const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(10, 0, 0, 0);
  return d;
};

// Helper: random item from array
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const timeSlots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM'];
const reasons = ['Fever and cold', 'Back pain', 'Headache', 'Chest pain', 'Diabetes checkup', 'Skin rash', 'Joint pain', 'Stomach ache', 'Follow-up visit', 'General checkup'];
const complaints = ['Persistent cough', 'High fever', 'Severe headache', 'Abdominal pain', 'Breathlessness', 'Dizziness', 'Fatigue', 'Nausea'];
const diagnoses = ['Viral fever', 'Hypertension', 'Type 2 Diabetes', 'Migraine', 'Gastritis', 'Bronchitis', 'Lumbar spondylosis', 'Allergic rhinitis'];
const admissionReasons = ['Severe chest pain', 'Post-surgery recovery', 'Acute respiratory distress', 'Diabetic ketoacidosis', 'Stroke monitoring'];

const seed = async () => {
  await connectDB();

  // ─── Clear ALL existing data ─────────────────────────────────────────────
  await Promise.all([
    User.deleteMany({}),
    Inventory.deleteMany({}),
    Bed.deleteMany({}),
    IPD.deleteMany({}),
    Appointment.deleteMany({}),
    OPD.deleteMany({}),
    Prescription.deleteMany({}),
  ]);
  console.log('Cleared all existing data...');

  // ─── Users ───────────────────────────────────────────────────────────────
  const password = await bcrypt.hash('password123', 12);

  const users = await User.insertMany([
    { name: 'Admin User',        email: 'admin@mednova.com',        password, role: 'admin',        phone: '9876543210', gender: 'male',   isActive: true },
    { name: 'Dr. Arjun Sharma',  email: 'doctor1@mednova.com',      password, role: 'doctor', specialization: 'Cardiology',   consultationFee: 800, department: 'Cardiology',   phone: '9876543211', gender: 'male',   isActive: true },
    { name: 'Dr. Priya Mehta',   email: 'doctor2@mednova.com',      password, role: 'doctor', specialization: 'Orthopedics',  consultationFee: 700, department: 'Orthopedics',  phone: '9876543212', gender: 'female', isActive: true },
    { name: 'Dr. Rahul Verma',   email: 'doctor3@mednova.com',      password, role: 'doctor', specialization: 'Neurology',    consultationFee: 900, department: 'Neurology',    phone: '9876543213', gender: 'male',   isActive: true },
    { name: 'Dr. Sneha Kapoor',  email: 'doctor4@mednova.com',      password, role: 'doctor', specialization: 'Pediatrics',   consultationFee: 600, department: 'Pediatrics',   phone: '9876543214', gender: 'female', isActive: true },
    { name: 'Dr. Vikram Nair',   email: 'doctor5@mednova.com',      password, role: 'doctor', specialization: 'Dermatology',  consultationFee: 650, department: 'Dermatology',  phone: '9876543215', gender: 'male',   isActive: true },
    { name: 'Nurse Anita Singh', email: 'nurse@mednova.com',        password, role: 'nurse',        department: 'General',  phone: '9876543216', gender: 'female', isActive: true },
    { name: 'Raj Patel',         email: 'pharmacist@mednova.com',   password, role: 'pharmacist',                           phone: '9876543217', gender: 'male',   isActive: true },
    { name: 'Meena Gupta',       email: 'receptionist@mednova.com', password, role: 'receptionist',                         phone: '9876543218', gender: 'female', isActive: true },
    { name: 'Ramu Kumar',        email: 'worker@mednova.com',       password, role: 'worker',                               phone: '9876543219', gender: 'male',   isActive: true },
    { name: 'Amit Kumar',        email: 'patient@mednova.com',      password, role: 'patient', phone: '9876543220', gender: 'male',   bloodGroup: 'B+', dateOfBirth: new Date('1990-05-15'), address: '123 MG Road, Delhi',      isActive: true },
    { name: 'Sunita Devi',       email: 'patient2@mednova.com',     password, role: 'patient', phone: '9876543221', gender: 'female', bloodGroup: 'A+', dateOfBirth: new Date('1985-08-22'), address: '456 Park Street, Mumbai', isActive: true },
    { name: 'Rohit Sharma',      email: 'patient3@mednova.com',     password, role: 'patient', phone: '9876543222', gender: 'male',   bloodGroup: 'O+', dateOfBirth: new Date('1995-03-10'), address: '789 Lake View, Pune',     isActive: true },
    { name: 'Kavita Singh',      email: 'patient4@mednova.com',     password, role: 'patient', phone: '9876543223', gender: 'female', bloodGroup: 'AB+',dateOfBirth: new Date('1992-11-25'), address: '321 Hill Road, Chennai',  isActive: true },
  ]);
  console.log(`Created ${users.length} users`);

  const admin    = users[0];
  const doctors  = users.slice(1, 6);   // 5 doctors
  const patients = users.slice(10);     // 4 patients

  // ─── Inventory ───────────────────────────────────────────────────────────
  const medicines = await Inventory.insertMany([
    { name: 'Paracetamol 500mg',    genericName: 'Acetaminophen',       category: 'tablet',   manufacturer: 'Sun Pharma',   quantity: 500, unit: 'tablets',  purchasePrice: 2,   sellingPrice: 5,   reorderLevel: 50, expiryDate: new Date('2026-12-31'), addedBy: admin._id },
    { name: 'Amoxicillin 250mg',    genericName: 'Amoxicillin',         category: 'capsule',  manufacturer: 'Cipla',        quantity: 200, unit: 'capsules', purchasePrice: 8,   sellingPrice: 18,  reorderLevel: 30, expiryDate: new Date('2026-06-30'), addedBy: admin._id },
    { name: 'Azithromycin 500mg',   genericName: 'Azithromycin',        category: 'tablet',   manufacturer: "Dr. Reddy's",  quantity: 150, unit: 'tablets',  purchasePrice: 12,  sellingPrice: 25,  reorderLevel: 20, expiryDate: new Date('2026-09-30'), addedBy: admin._id },
    { name: 'Metformin 500mg',      genericName: 'Metformin HCl',       category: 'tablet',   manufacturer: 'Sun Pharma',   quantity: 8,   unit: 'tablets',  purchasePrice: 3,   sellingPrice: 7,   reorderLevel: 50, expiryDate: new Date('2026-03-31'), addedBy: admin._id },
    { name: 'Atorvastatin 10mg',    genericName: 'Atorvastatin',        category: 'tablet',   manufacturer: 'Pfizer',       quantity: 300, unit: 'tablets',  purchasePrice: 6,   sellingPrice: 14,  reorderLevel: 40, expiryDate: new Date('2027-01-31'), addedBy: admin._id },
    { name: 'Omeprazole 20mg',      genericName: 'Omeprazole',          category: 'capsule',  manufacturer: 'Ranbaxy',      quantity: 250, unit: 'capsules', purchasePrice: 4,   sellingPrice: 10,  reorderLevel: 30, expiryDate: new Date('2026-08-31'), addedBy: admin._id },
    { name: 'Cough Syrup 100ml',    genericName: 'Dextromethorphan',    category: 'syrup',    manufacturer: 'Mankind',      quantity: 12,  unit: 'bottles',  purchasePrice: 45,  sellingPrice: 90,  reorderLevel: 20, expiryDate: new Date('2026-04-30'), addedBy: admin._id },
    { name: 'Normal Saline 500ml',  genericName: 'Sodium Chloride 0.9%',category: 'injection',manufacturer: 'Baxter',       quantity: 80,  unit: 'bottles',  purchasePrice: 35,  sellingPrice: 70,  reorderLevel: 20, expiryDate: new Date('2026-11-30'), addedBy: admin._id },
    { name: 'Betamethasone Cream',  genericName: 'Betamethasone',       category: 'ointment', manufacturer: 'GSK',          quantity: 60,  unit: 'tubes',    purchasePrice: 25,  sellingPrice: 55,  reorderLevel: 15, expiryDate: new Date('2026-07-31'), addedBy: admin._id },
    { name: 'Salbutamol Inhaler',   genericName: 'Salbutamol',          category: 'inhaler',  manufacturer: 'Cipla',        quantity: 5,   unit: 'units',    purchasePrice: 120, sellingPrice: 250, reorderLevel: 10, expiryDate: new Date('2026-10-31'), addedBy: admin._id },
    { name: 'Ibuprofen 400mg',      genericName: 'Ibuprofen',           category: 'tablet',   manufacturer: 'Abbott',       quantity: 400, unit: 'tablets',  purchasePrice: 3,   sellingPrice: 8,   reorderLevel: 50, expiryDate: new Date('2026-12-31'), addedBy: admin._id },
    { name: 'Cetirizine 10mg',      genericName: 'Cetirizine HCl',      category: 'tablet',   manufacturer: 'UCB',          quantity: 180, unit: 'tablets',  purchasePrice: 2,   sellingPrice: 5,   reorderLevel: 25, expiryDate: new Date('2026-09-30'), addedBy: admin._id },
  ]);
  console.log(`Created ${medicines.length} inventory items`);

  // ─── Beds ────────────────────────────────────────────────────────────────
  const bedDefs = [
    { ward: 'General',     count: 10, type: 'general',     dailyCharge: 500  },
    { ward: 'Semi-Private',count: 6,  type: 'semi-private',dailyCharge: 1500 },
    { ward: 'Private',     count: 4,  type: 'private',     dailyCharge: 3000 },
    { ward: 'ICU',         count: 5,  type: 'icu',         dailyCharge: 8000 },
    { ward: 'Emergency',   count: 5,  type: 'emergency',   dailyCharge: 5000 },
  ];
  const bedDocs = [];
  let bedNum = 100;
  for (const w of bedDefs) {
    for (let i = 0; i < w.count; i++) {
      bedDocs.push({ bedNumber: `${w.ward.charAt(0)}${bedNum++}`, ward: w.ward, type: w.type, dailyCharge: w.dailyCharge, isOccupied: false });
    }
  }
  const beds = await Bed.insertMany(bedDocs);
  console.log(`Created ${beds.length} beds`);

  // ─── Appointments (past 6 months + future) ───────────────────────────────
  // Spread appointments day offsets across ~180 days back and 30 days forward
  // Using unique (doctor, date, timeSlot) combos to avoid index conflicts
  const appointmentDefs = [
    // Past appointments — spread across months for graph data
    // Month -6
    { daysOffset: -175, doctor: 0, patient: 0, slot: 0, status: 'completed', payment: 'paid' },
    { daysOffset: -172, doctor: 1, patient: 1, slot: 1, status: 'completed', payment: 'paid' },
    { daysOffset: -168, doctor: 2, patient: 2, slot: 2, status: 'completed', payment: 'paid' },
    // Month -5
    { daysOffset: -145, doctor: 0, patient: 1, slot: 3, status: 'completed', payment: 'paid' },
    { daysOffset: -142, doctor: 1, patient: 2, slot: 4, status: 'completed', payment: 'paid' },
    { daysOffset: -138, doctor: 3, patient: 3, slot: 5, status: 'completed', payment: 'paid' },
    { daysOffset: -135, doctor: 2, patient: 0, slot: 6, status: 'completed', payment: 'paid' },
    // Month -4
    { daysOffset: -115, doctor: 0, patient: 2, slot: 7, status: 'completed', payment: 'paid' },
    { daysOffset: -112, doctor: 1, patient: 3, slot: 8, status: 'completed', payment: 'paid' },
    { daysOffset: -108, doctor: 4, patient: 0, slot: 9, status: 'completed', payment: 'paid' },
    { daysOffset: -105, doctor: 2, patient: 1, slot: 0, status: 'cancelled', payment: 'refunded' },
    { daysOffset: -102, doctor: 3, patient: 2, slot: 1, status: 'completed', payment: 'paid' },
    // Month -3
    { daysOffset: -85,  doctor: 0, patient: 3, slot: 2, status: 'completed', payment: 'paid' },
    { daysOffset: -82,  doctor: 1, patient: 0, slot: 3, status: 'completed', payment: 'paid' },
    { daysOffset: -78,  doctor: 2, patient: 2, slot: 4, status: 'completed', payment: 'paid' },
    { daysOffset: -75,  doctor: 3, patient: 1, slot: 5, status: 'no-show',   payment: 'pending' },
    { daysOffset: -72,  doctor: 4, patient: 3, slot: 6, status: 'completed', payment: 'paid' },
    { daysOffset: -68,  doctor: 0, patient: 0, slot: 7, status: 'completed', payment: 'paid' },
    // Month -2
    { daysOffset: -55,  doctor: 1, patient: 1, slot: 8, status: 'completed', payment: 'paid' },
    { daysOffset: -52,  doctor: 2, patient: 3, slot: 9, status: 'completed', payment: 'paid' },
    { daysOffset: -48,  doctor: 3, patient: 0, slot: 0, status: 'completed', payment: 'paid' },
    { daysOffset: -45,  doctor: 0, patient: 2, slot: 1, status: 'completed', payment: 'paid' },
    { daysOffset: -42,  doctor: 4, patient: 1, slot: 2, status: 'cancelled', payment: 'refunded' },
    { daysOffset: -38,  doctor: 1, patient: 3, slot: 3, status: 'completed', payment: 'paid' },
    // Month -1
    { daysOffset: -28,  doctor: 0, patient: 1, slot: 4, status: 'completed', payment: 'paid' },
    { daysOffset: -25,  doctor: 2, patient: 0, slot: 5, status: 'completed', payment: 'paid' },
    { daysOffset: -22,  doctor: 3, patient: 2, slot: 6, status: 'completed', payment: 'paid' },
    { daysOffset: -18,  doctor: 4, patient: 3, slot: 7, status: 'completed', payment: 'paid' },
    { daysOffset: -15,  doctor: 1, patient: 0, slot: 8, status: 'completed', payment: 'paid' },
    { daysOffset: -12,  doctor: 0, patient: 3, slot: 9, status: 'completed', payment: 'paid' },
    { daysOffset: -8,   doctor: 2, patient: 1, slot: 0, status: 'completed', payment: 'paid' },
    { daysOffset: -5,   doctor: 3, patient: 0, slot: 1, status: 'completed', payment: 'paid' },
    { daysOffset: -2,   doctor: 4, patient: 2, slot: 2, status: 'confirmed', payment: 'paid' },
    // Future appointments
    { daysOffset: 1,    doctor: 0, patient: 0, slot: 3, status: 'confirmed', payment: 'paid' },
    { daysOffset: 2,    doctor: 1, patient: 1, slot: 4, status: 'confirmed', payment: 'paid' },
    { daysOffset: 3,    doctor: 2, patient: 2, slot: 5, status: 'pending',   payment: 'pending' },
    { daysOffset: 5,    doctor: 3, patient: 3, slot: 6, status: 'pending',   payment: 'pending' },
    { daysOffset: 7,    doctor: 4, patient: 0, slot: 7, status: 'confirmed', payment: 'paid' },
    { daysOffset: 10,   doctor: 0, patient: 1, slot: 8, status: 'pending',   payment: 'pending' },
    { daysOffset: 14,   doctor: 1, patient: 2, slot: 9, status: 'pending',   payment: 'pending' },
    { daysOffset: 20,   doctor: 2, patient: 3, slot: 0, status: 'pending',   payment: 'pending' },
  ];

  const appointmentDocs = appointmentDefs.map(def => {
    const doc = doctors[def.doctor];
    const pat = patients[def.patient];
    return {
      patient: pat._id,
      doctor: doc._id,
      date: daysFromNow(def.daysOffset),
      timeSlot: timeSlots[def.slot],
      reason: pick(reasons),
      status: def.status,
      consultationFee: doc.consultationFee,
      paymentStatus: def.payment,
      type: 'opd',
      bookedBy: pat._id,
    };
  });

  const appointments = await Appointment.insertMany(appointmentDocs);
  console.log(`Created ${appointments.length} appointments`);

  // ─── Prescriptions (for completed past appointments) ─────────────────────
  const completedAppts = appointments.filter(a => a.status === 'completed');
  const prescriptionDocs = completedAppts.slice(0, 20).map(appt => ({
    patient: appt.patient,
    doctor: appt.doctor,
    appointment: appt._id,
    diagnosis: pick(diagnoses),
    medicines: [
      {
        medicineName: 'Paracetamol 500mg',
        inventoryItem: medicines[0]._id,
        dosage: '500mg',
        frequency: 'Twice a day',
        duration: '5 days',
        instructions: 'After food',
      },
      {
        medicineName: pick(['Amoxicillin 250mg', 'Ibuprofen 400mg', 'Omeprazole 20mg', 'Cetirizine 10mg']),
        dosage: '1 tablet',
        frequency: 'Once a day',
        duration: '7 days',
        instructions: 'Before sleep',
        isExternal: true,
      },
    ],
    status: 'active',
    followUpDate: daysFromNow(14),
    notes: 'Rest and stay hydrated.',
  }));

  const prescriptions = await Prescription.insertMany(prescriptionDocs);
  console.log(`Created ${prescriptions.length} prescriptions`);

  // ─── OPD Records (linked to past appointments) ────────────────────────────
  const opdDocs = completedAppts.slice(0, 20).map((appt, i) => ({
    patient: appt.patient,
    doctor: appt.doctor,
    appointment: appt._id,
    visitDate: appt.date,
    chiefComplaint: pick(complaints),
    vitals: {
      temperature: `${(98 + Math.random()).toFixed(1)}°F`,
      bloodPressure: `${110 + Math.floor(Math.random() * 30)}/${70 + Math.floor(Math.random() * 20)}`,
      pulse: `${68 + Math.floor(Math.random() * 20)} bpm`,
      weight: `${55 + Math.floor(Math.random() * 35)} kg`,
      height: `${160 + Math.floor(Math.random() * 20)} cm`,
      oxygenSaturation: `${97 + Math.floor(Math.random() * 3)}%`,
    },
    diagnosis: pick(diagnoses),
    treatment: 'Prescribed medications and rest',
    prescription: prescriptions[i]?._id,
    status: 'completed',
    registeredBy: admin._id,
  }));

  const opdRecords = await OPD.insertMany(opdDocs);
  console.log(`Created ${opdRecords.length} OPD records`);

  // ─── IPD Records (use first 4 beds, 2 active + 2 discharged) ─────────────
  const ipdData = [
    {
      patient: patients[0]._id,
      doctor: doctors[0]._id,
      bed: beds[0]._id,
      admissionDate: daysFromNow(-10),
      admissionReason: admissionReasons[0],
      diagnosis: 'Acute Myocardial Infarction',
      status: 'under-treatment',
      totalBill: 0,
    },
    {
      patient: patients[1]._id,
      doctor: doctors[2]._id,
      bed: beds[1]._id,
      admissionDate: daysFromNow(-5),
      admissionReason: admissionReasons[2],
      diagnosis: 'Severe Pneumonia',
      status: 'under-treatment',
      totalBill: 0,
    },
    {
      patient: patients[2]._id,
      doctor: doctors[1]._id,
      bed: beds[2]._id,
      admissionDate: daysFromNow(-30),
      dischargeDate: daysFromNow(-20),
      admissionReason: admissionReasons[1],
      diagnosis: 'Post knee replacement surgery',
      status: 'discharged',
      totalBill: 45000,
    },
    {
      patient: patients[3]._id,
      doctor: doctors[3]._id,
      bed: beds[3]._id,
      admissionDate: daysFromNow(-45),
      dischargeDate: daysFromNow(-38),
      admissionReason: admissionReasons[3],
      diagnosis: 'Diabetic Ketoacidosis',
      status: 'discharged',
      totalBill: 32000,
    },
  ];

  const ipdRecords = await IPD.insertMany(
    ipdData.map(r => ({ ...r, admittedBy: admin._id }))
  );

  // Mark the 2 active IPD beds as occupied
  await Bed.findByIdAndUpdate(beds[0]._id, { isOccupied: true, currentPatient: patients[0]._id });
  await Bed.findByIdAndUpdate(beds[1]._id, { isOccupied: true, currentPatient: patients[1]._id });

  console.log(`Created ${ipdRecords.length} IPD records`);

  console.log('\n✅ Seed completed!');
  console.log('  Admin:         admin@mednova.com / password123');
  console.log('  Doctor:        doctor1@mednova.com / password123');
  console.log('  Nurse:         nurse@mednova.com / password123');
  console.log('  Pharmacist:    pharmacist@mednova.com / password123');
  console.log('  Receptionist:  receptionist@mednova.com / password123');
  console.log('  Patient:       patient@mednova.com / password123');
  console.log('  Patient 2:     patient2@mednova.com / password123');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });