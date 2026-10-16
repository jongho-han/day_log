// members 테이블 접근
const { getSupabase } = require('./supabase');

async function listMembers() {
  const { data, error } = await getSupabase().from('members').select('id, name, is_admin');
  if (error) throw error;
  return data || [];
}

async function findAdminPassword(id) {
  const { data, error } = await getSupabase()
    .from('members').select('pw').eq('id', id).eq('is_admin', true).single();
  return error || !data ? null : data.pw;
}

async function isAdmin(userId) {
  if (!userId) return false;
  const { data } = await getSupabase().from('members').select('is_admin').eq('id', userId).single();
  return data?.is_admin === true;
}

module.exports = { listMembers, findAdminPassword, isAdmin };
