const fs = require('fs');
const path = require('path');

function loadMembers() {
  // 환경변수 우선 (Vercel 배포 시 사용)
  if (process.env.MEMBERS_JSON) {
    try { return JSON.parse(process.env.MEMBERS_JSON); } catch {}
  }
  // 로컬 .member 파일
  try {
    const filePath = path.join(__dirname, '..', '.member');
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return { users: {}, admin: { id: '', pw: '' } };
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const members = loadMembers();

  if (req.method === 'GET') {
    // 사용자 목록과 adminId만 반환 (비밀번호 제외)
    return res.status(200).json({
      users: members.users,
      adminId: members.admin.id,
    });
  }

  if (req.method === 'POST') {
    // 관리자 로그인 검증 (서버사이드)
    const { id, pw } = req.body || {};
    if (id === members.admin.id && pw === members.admin.pw) {
      return res.status(200).json({ ok: true });
    }
    return res.status(401).json({ ok: false, error: '비밀번호가 올바르지 않습니다' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
