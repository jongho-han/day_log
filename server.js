const express = require('express');
const fs = require('fs');
const path = require('path');

const DATA_FILE   = path.join(__dirname, 'data.json');
const MEMBER_FILE = path.join(__dirname, '.member');

const app = express();
app.use(express.json({ limit: '10mb' }));

function readMembers() {
  try { return JSON.parse(fs.readFileSync(MEMBER_FILE, 'utf-8')); }
  catch { return { users: {}, admin: { id: '', pw: '' } }; }
}

app.get('/api/members', (req, res) => {
  const m = readMembers();
  res.json({ users: m.users, adminId: m.admin.id });
});

app.post('/api/members', (req, res) => {
  const m = readMembers();
  const { id, pw } = req.body || {};
  if (id === m.admin.id && pw === m.admin.pw) {
    return res.json({ ok: true });
  }
  res.status(401).json({ ok: false, error: '비밀번호가 올바르지 않습니다' });
});

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
