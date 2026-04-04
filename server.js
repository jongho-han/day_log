const express = require('express');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data.json');

const app = express();
app.use(express.json({ limit: '10mb' }));

function readData() {
  if (!fs.existsSync(DATA_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function writeData(entries) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(entries, null, 2), 'utf-8');
}

app.get('/api/entries', (req, res) => {
  res.json(readData());
});

app.put('/api/entries', (req, res) => {
  if (!Array.isArray(req.body)) {
    return res.status(400).json({ error: 'Array expected' });
  }
  writeData(req.body);
  res.json({ ok: true });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`API server: http://localhost:${PORT}`);
});
