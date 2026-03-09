// server.js — Hospital Management System (Part 1)
// Run: npm install && node server.js
// API will be live at http://localhost:3000

const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app  = express();
const PORT = 3000;

// ─── Middleware ──────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── Routes ─────────────────────────────────────────────
app.use('/api/patients',     require('./routes/patientRoutes'));
app.use('/api/doctors',      require('./routes/doctorRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));

// ─── Root ────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Start Server ────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🏥 HMS Part 1 running at http://localhost:${PORT}`);
  console.log('─────────────────────────────────────────');
  console.log('📌 Active API Endpoints:');
  console.log('  GET  / POST        /api/patients');
  console.log('  GET  / PUT /DELETE /api/patients/:id');
  console.log('  GET  / POST        /api/doctors');
  console.log('  GET  / PUT /DELETE /api/doctors/:id');
  console.log('  GET  / POST        /api/appointments');
  console.log('  DELETE             /api/appointments/:id');
  console.log('─────────────────────────────────────────\n');
});
