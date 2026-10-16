// GET: 사용자 목록 { users, adminId } / POST: 사번·비밀번호 확인 (모든 회원)
const { withCors } = require('./_lib/http');
const members = require('./_lib/memberRepository');

const WRONG_PASSWORD = '비밀번호가 올바르지 않습니다';

module.exports = withCors(['GET', 'POST'], {
  async GET(req, res) {
    try {
      const users = {};
      let adminId = '';
      for (const row of await members.listMembers()) {
        if (row.is_admin) adminId = row.id;
        else users[row.id] = row.name;
      }
      return res.status(200).json({ users, adminId });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  },

  async POST(req, res) {
    const { id, pw } = req.body || {};
    if (!id || !pw) return res.status(401).json({ ok: false, error: '입력값이 올바르지 않습니다' });
    const stored = await members.findPassword(id);
    if (stored === null || pw !== stored) return res.status(401).json({ ok: false, error: WRONG_PASSWORD });
    return res.status(200).json({ ok: true });
  },
});
