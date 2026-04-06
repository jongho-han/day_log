const { put, list, del } = require('@vercel/blob');

const BLOB_PATHNAME = 'bm-entries.json';

async function readData() {
  try {
    const { blobs } = await list({ prefix: BLOB_PATHNAME });
    if (blobs.length === 0) return [];
    const res = await fetch(blobs[0].downloadUrl);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function writeData(entries) {
  // 기존 blob 삭제 후 새로 저장 (덮어쓰기)
  const { blobs } = await list({ prefix: BLOB_PATHNAME });
  if (blobs.length > 0) {
    await del(blobs.map(b => b.url));
  }
  await put(BLOB_PATHNAME, JSON.stringify(entries), {
    access: 'private',
    contentType: 'application/json',
    addRandomSuffix: false,
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const data = await readData();
    return res.status(200).json(data);
  }

  if (req.method === 'PUT') {
    if (!Array.isArray(req.body)) {
      return res.status(400).json({ error: 'Array expected' });
    }
    await writeData(req.body);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
