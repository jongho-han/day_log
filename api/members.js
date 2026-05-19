const { createClient } = require('@supabase/supabase-js');

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const supabase = getSupabase();

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('members').select('id, name, is_admin');
    if (error) return res.status(500).json({ error: error.message });

    const users = {};
    let adminId = '';
    for (const row of data || []) {
      if (row.is_admin) adminId = row.id;
      else users[row.id] = row.name;
    }
    return res.status(200).json({ users, adminId });
  }

  if (req.method === 'POST') {
    const { id, pw } = req.body || {};
    if (!id || !pw) return res.status(401).json({ ok: false, error: '입력값이 올바르지 않습니다' });

    const { data, error } = await supabase
      .from('members')
      .select('pw')
      .eq('id', id)
      .eq('is_admin', true)
      .single();

    if (error || !data) return res.status(401).json({ ok: false, error: '비밀번호가 올바르지 않습니다' });
    if (pw === data.pw) return res.status(200).json({ ok: true });
    return res.status(401).json({ ok: false, error: '비밀번호가 올바르지 않습니다' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
