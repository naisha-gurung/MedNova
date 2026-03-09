// controllers/patientController.js
// CRUD Operations for Patients

const { readData, writeData } = require('../utils/fileHandler');
const FILE = 'patients.json';

// Helper to generate simple IDs
function generateId(records) {
  const last = records[records.length - 1];
  if (!last) return 'P001';
  const num = parseInt(last.id.slice(1)) + 1;
  return 'P' + String(num).padStart(3, '0');
}

// ─── CREATE ─────────────────────────────────────────────
// POST /api/patients
function createPatient(req, res) {
  const patients = readData(FILE);
  const newPatient = {
    id: generateId(patients),
    name: req.body.name,
    age: req.body.age,
    gender: req.body.gender,
    phone: req.body.phone,
    address: req.body.address,
    bloodGroup: req.body.bloodGroup,
    createdAt: new Date().toISOString().split('T')[0]
  };
  patients.push(newPatient);
  writeData(FILE, patients);
  res.status(201).json({ message: 'Patient registered!', patient: newPatient });
}

// ─── READ ALL ────────────────────────────────────────────
// GET /api/patients
function getAllPatients(req, res) {
  const patients = readData(FILE);
  res.json(patients);
}

// ─── READ ONE ────────────────────────────────────────────
// GET /api/patients/:id
function getPatientById(req, res) {
  const patients = readData(FILE);
  const patient = patients.find(p => p.id === req.params.id);
  if (!patient) return res.status(404).json({ message: 'Patient not found' });
  res.json(patient);
}

// ─── UPDATE ─────────────────────────────────────────────
// PUT /api/patients/:id
function updatePatient(req, res) {
  const patients = readData(FILE);
  const index = patients.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Patient not found' });
  
  patients[index] = { ...patients[index], ...req.body, id: patients[index].id };
  writeData(FILE, patients);
  res.json({ message: 'Patient updated!', patient: patients[index] });
}

// ─── DELETE ─────────────────────────────────────────────
// DELETE /api/patients/:id
function deletePatient(req, res) {
  let patients = readData(FILE);
  const index = patients.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Patient not found' });
  
  const deleted = patients.splice(index, 1)[0];
  writeData(FILE, patients);
  res.json({ message: 'Patient deleted!', patient: deleted });
}

module.exports = { createPatient, getAllPatients, getPatientById, updatePatient, deletePatient };
