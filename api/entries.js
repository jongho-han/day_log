const fs = require('fs');

// Vercel 서버리스: /tmp는 인스턴스 내에서만 유지됩니다.
// 영구 데이터 공유가 필요하면 Vercel KV 또는 외부 DB를 사용하세요.
const DATA_FILE = '/tmp/bm_data.json';

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

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json(readData());
  }

  if (req.method === 'PUT') {
    if (!Array.isArray(req.body)) {
      return res.status(400).json({ error: 'Array expected' });
    }
    writeData(req.body);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
