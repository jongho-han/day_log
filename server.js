require('dotenv').config({ path: '.env.local' });
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data.json');
const app = express();
app.use(express.json({ limit: '10mb' }));

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
}

app.get('/api/members', async (req, res) => {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('members').select('id, name, is_admin');
  if (error) return res.status(500).json({ error: error.message });

  const users = {};
  let adminId = '';
  for (const row of data || []) {
    if (row.is_admin) adminId = row.id;
    else users[row.id] = row.name;
  }
  res.json({ users, adminId });
});

app.post('/api/members', async (req, res) => {
  const supabase = getSupabase();
  const { id, pw } = req.body || {};
  const { data, error } = await supabase
    .from('members')
    .select('pw')
    .eq('id', id)
    .eq('is_admin', true)
    .single();

  if (error || !data || pw !== data.pw) {
    return res.status(401).json({ ok: false, error: '비밀번호가 올바르지 않습니다' });
  }
  res.json({ ok: true });
});

function readData() {
  if (!fs.existsSync(DATA_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')); }
  catch { return []; }
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
