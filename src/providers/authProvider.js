// 로그인 상태·사용자 목록 관리 (실제 인증 없음: 사번 확인, 관리자만 비밀번호)

export function createAuthProvider({ memberRepository, sessionRepository }) {
  let users = {};
  let adminId = '';
  let currentUser = null;

  const isAdminId = (id) => !!adminId && id === adminId;

  function signIn(user) {
    currentUser = user;
    sessionRepository.save(user);
    return { ok: true };
  }

  return {
    get currentUser() { return currentUser; },

    isAdmin: () => !!currentUser && isAdminId(currentUser.id),
    requiresPassword: (id) => isAdminId(id),
    isKnownUser: (id) => !!users[id],
    userName: (id) => users[id] || '',

    async loadMembers() {
      try {
        ({ users, adminId } = await memberRepository.fetchMembers());
      } catch (_) { /* 오프라인: 저장된 세션 검증 불가 → 로그인 화면 유지 */ }
    },

    // 저장된 세션이 현재 사용자 목록에 유효하면 복원
    restoreSession() {
      const saved = sessionRepository.load();
      if (saved?.id && (isAdminId(saved.id) || users[saved.id])) {
        currentUser = saved;
        return true;
      }
      sessionRepository.clear();
      return false;
    },

    /**
     * @returns {{ ok: boolean, error?: string, selectField?: 'id' | 'pw' }}
     */
    async login(rawId, pw) {
      const id = rawId.trim().toUpperCase();
      if (!id) return { ok: false, error: '사번을 입력해주세요' };

      if (isAdminId(id)) {
        if (!pw) return { ok: false, error: '비밀번호를 입력해주세요' };
        let result;
        try {
          result = await memberRepository.verifyAdmin(id, pw);
        } catch (_) {
          return { ok: false, error: '서버 연결 오류' };
        }
        if (!result.ok) {
          return { ok: false, error: result.error || '비밀번호가 올바르지 않습니다', selectField: 'pw' };
        }
        return signIn({ id, name: '관리자' });
      }

      if (!users[id]) return { ok: false, error: '등록되지 않은 사번입니다', selectField: 'id' };
      return signIn({ id, name: users[id] });
    },

    logout() {
      sessionRepository.clear();
      currentUser = null;
    },
  };
}
