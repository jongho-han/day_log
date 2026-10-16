// entries 테이블 접근 + 클라이언트 형식(camelCase) 변환
const { getSupabase } = require('./supabase');

function toRow(entry) {
  return {
    type: entry.type,
    date: entry.date,
    time: entry.time || null,
    location: entry.location,
    bank: entry.bank,
    importance: entry.importance || '',
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
    importance: row.importance || '',
    userId: row.user_id,
    createdAt: row.created_at,
  };
  if (row.seller) entry.seller = row.seller;
  if (row.content) entry.content = row.content;
  return entry;
}

// userId 가 없으면 전체
async function listEntries(userId) {
  let query = getSupabase().from('entries').select();
  if (userId) query = query.eq('user_id', userId);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(toEntry);
}

// 해당 사용자 항목 전체 교체
async function replaceUserEntries(userId, entries) {
  const supabase = getSupabase();
  const { error: deleteError } = await supabase.from('entries').delete().eq('user_id', userId);
  if (deleteError) throw deleteError;
  if (!entries.length) return;
  const { error: insertError } = await supabase.from('entries').insert(entries.map(toRow));
  if (insertError) throw insertError;
}

module.exports = { listEntries, replaceUserEntries };
