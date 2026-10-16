// GET ?userId=: 일반 사용자는 본인 항목, 관리자는 전체 / PUT { userId, entries }: 본인 항목 전체 교체
const { withCors } = require('./_lib/http');
const members = require('./_lib/memberRepository');
const entryRepo = require('./_lib/entryRepository');

module.exports = withCors(['GET', 'PUT'], {
  async GET(req, res) {
    try {
      const { userId } = req.query;
      const admin = await members.isAdmin(userId);
      return res.status(200).json(await entryRepo.listEntries(admin ? undefined : userId));
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  },

  async PUT(req, res) {
    const { userId, entries } = req.body || {};
    if (!userId || !Array.isArray(entries)) {
      return res.status(400).json({ error: 'userId and entries array expected' });
    }
    try {
      await entryRepo.replaceUserEntries(userId, entries);
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  },
});
