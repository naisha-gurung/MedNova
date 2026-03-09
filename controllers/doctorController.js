// controllers/doctorController.js
// CRUD Operations for Doctors

const { readData, writeData } = require('../utils/fileHandler');
const FILE = 'doctors.json';

function generateId(records) {
  const last = records[records.length - 1];
  if (!last) return 'D001';
  const num = parseInt(last.id.slice(1)) + 1;
  return 'D' + String(num).padStart(3, '0');
}

// CREATE — POST /api/doctors
function createDoctor(req, res) {
  const doctors = readData(FILE);
  const newDoctor = {
    id: generateId(doctors),
    name: req.body.name,
    specialization: req.body.specialization,
    phone: req.body.phone,
    email: req.body.email,
    available: true
  };
  doctors.push(newDoctor);
  writeData(FILE, doctors);
  res.status(201).json({ message: 'Doctor added!', doctor: newDoctor });
}

// READ ALL — GET /api/doctors
function getAllDoctors(req, res) {
  res.json(readData(FILE));
}

// READ ONE — GET /api/doctors/:id
function getDoctorById(req, res) {
  const doctor = readData(FILE).find(d => d.id === req.params.id);
  if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
  res.json(doctor);
}

// UPDATE — PUT /api/doctors/:id
function updateDoctor(req, res) {
  const doctors = readData(FILE);
  const index = doctors.findIndex(d => d.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Doctor not found' });
  doctors[index] = { ...doctors[index], ...req.body, id: doctors[index].id };
  writeData(FILE, doctors);
  res.json({ message: 'Doctor updated!', doctor: doctors[index] });
}

// DELETE — DELETE /api/doctors/:id
function deleteDoctor(req, res) {
  let doctors = readData(FILE);
  const index = doctors.findIndex(d => d.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Doctor not found' });
  const deleted = doctors.splice(index, 1)[0];
  writeData(FILE, doctors);
  res.json({ message: 'Doctor deleted!', doctor: deleted });
}

module.exports = { createDoctor, getAllDoctors, getDoctorById, updateDoctor, deleteDoctor };
