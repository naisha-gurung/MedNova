// controllers/appointmentController.js
// CRUD Operations for Appointments

const { readData, writeData } = require('../utils/fileHandler');
const FILE = 'appointments.json';

function generateId(records) {
  const last = records[records.length - 1];
  if (!last) return 'A001';
  const num = parseInt(last.id.slice(1)) + 1;
  return 'A' + String(num).padStart(3, '0');
}

// CREATE — POST /api/appointments
function createAppointment(req, res) {
  const appointments = readData(FILE);
  const newAppt = {
    id: generateId(appointments),
    patientId: req.body.patientId,
    doctorId: req.body.doctorId,
    date: req.body.date,
    time: req.body.time,
    status: 'Scheduled',
    reason: req.body.reason
  };
  appointments.push(newAppt);
  writeData(FILE, appointments);
  res.status(201).json({ message: 'Appointment booked!', appointment: newAppt });
}

// READ ALL — GET /api/appointments
function getAllAppointments(req, res) {
  res.json(readData(FILE));
}

// READ ONE — GET /api/appointments/:id
function getAppointmentById(req, res) {
  const appt = readData(FILE).find(a => a.id === req.params.id);
  if (!appt) return res.status(404).json({ message: 'Appointment not found' });
  res.json(appt);
}

// UPDATE — PUT /api/appointments/:id
function updateAppointment(req, res) {
  const appointments = readData(FILE);
  const index = appointments.findIndex(a => a.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Appointment not found' });
  appointments[index] = { ...appointments[index], ...req.body, id: appointments[index].id };
  writeData(FILE, appointments);
  res.json({ message: 'Appointment updated!', appointment: appointments[index] });
}

// DELETE — DELETE /api/appointments/:id
function deleteAppointment(req, res) {
  let appointments = readData(FILE);
  const index = appointments.findIndex(a => a.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Appointment not found' });
  const deleted = appointments.splice(index, 1)[0];
  writeData(FILE, appointments);
  res.json({ message: 'Appointment deleted!', appointment: deleted });
}

module.exports = { createAppointment, getAllAppointments, getAppointmentById, updateAppointment, deleteAppointment };
