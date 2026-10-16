// 로그인 사용자 유지 (새로고침·뒤로가기 대응)

const SESSION_KEY = 'bm_user';

export function createSessionRepository({ storage }) {
  return {
    load: () => storage.get(SESSION_KEY),
    save: (user) => storage.set(SESSION_KEY, user),
    clear: () => storage.remove(SESSION_KEY),
  };
}
