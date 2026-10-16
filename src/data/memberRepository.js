// 사용자 목록·로그인 비밀번호 확인 (/api/members)

export function createMemberRepository({ http }) {
  return {
    // → { users: { 사번: 이름 }, adminId }
    async fetchMembers() {
      const res = await http.get('/api/members');
      if (!res.ok) throw new Error(`members ${res.status}`);
      return { users: res.data?.users || {}, adminId: res.data?.adminId || '' };
    },

    // → { ok, error }
    async verifyPassword(id, pw) {
      const res = await http.post('/api/members', { id, pw });
      return { ok: !!res.data?.ok, error: res.data?.error };
    },
  };
}
