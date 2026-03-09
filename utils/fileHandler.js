// utils/fileHandler.js
// Simple utility to read and write JSON files as our "database"

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');

// Read all records from a JSON file
function readData(filename) {
  const filePath = path.join(dataDir, filename);
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

// Write all records to a JSON file
function writeData(filename, data) {
  const filePath = path.join(dataDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = { readData, writeData };
