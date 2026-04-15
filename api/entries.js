const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

function toRow(entry) {
  return {
    type: entry.type,
    date: entry.date,
    time: entry.time || null,
    location: entry.location,
    bank: entry.bank,
    user_id: entry.userId,
    created_at: entry.createdAt,
    seller: entry.seller || null,
    content: entry.content || null,
  };
}

function toEntry(row) {
  const entry = {
    type: row.type,
    date: row.date,
    time: row.time || '',
    location: row.location,
    bank: row.bank,
    userId: row.user_id,
    createdAt: row.created_at,
  };
  if (row.seller) entry.seller = row.seller;
  if (row.content) entry.content = row.content;
  return entry;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('entries').select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json((data || []).map(toEntry));
  }

  if (req.method === 'PUT') {
    if (!Array.isArray(req.body)) {
      return res.status(400).json({ error: 'Array expected' });
    }
    const { error: deleteError } = await supabase
      .from('entries')
      .delete()
      .neq('id', 0);
    if (deleteError) return res.status(500).json({ error: deleteError.message });
    if (req.body.length > 0) {
      const { error: insertError } = await supabase
        .from('entries')
        .insert(req.body.map(toRow));
      if (insertError) return res.status(500).json({ error: insertError.message });
    }
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
