// localStorage JSON 래퍼 (사생활 보호 모드 등에서 예외 무시)

export function createJsonStorage(backend = window.localStorage) {
  return {
    get(key, fallback = null) {
      try {
        const raw = backend.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (_) {
        return fallback;
      }
    },
    set(key, value) {
      try { backend.setItem(key, JSON.stringify(value)); } catch (_) { /* 저장 불가 환경 무시 */ }
    },
    remove(key) {
      try { backend.removeItem(key); } catch (_) { /* 저장 불가 환경 무시 */ }
    },
  };
}
