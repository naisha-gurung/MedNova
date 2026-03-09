// routes/patientRoutes.js
const express = require('express');
const router = express.Router();
const {
  createPatient, getAllPatients, getPatientById, updatePatient, deletePatient
} = require('../controllers/patientController');

router.post('/', createPatient);         // Create
router.get('/', getAllPatients);          // Read All
router.get('/:id', getPatientById);      // Read One
router.put('/:id', updatePatient);       // Update
router.delete('/:id', deletePatient);    // Delete

module.exports = router;
