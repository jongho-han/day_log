// members 테이블 접근
const { getSupabase } = require('./supabase');

async function listMembers() {
  const { data, error } = await getSupabase().from('members').select('id, name, is_admin');
  if (error) throw error;
  return data || [];
}

// 비밀번호 미설정(null/빈 값) 회원은 로그인 불가
async function findPassword(id) {
  const { data, error } = await getSupabase().from('members').select('pw').eq('id', id).single();
  return error || !data?.pw ? null : data.pw;
}

async function isAdmin(userId) {
  if (!userId) return false;
  const { data } = await getSupabase().from('members').select('is_admin').eq('id', userId).single();
  return data?.is_admin === true;
}

module.exports = { listMembers, findPassword, isAdmin };
