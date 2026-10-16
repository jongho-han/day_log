// 단순 변경 알림 (상태 구독용)

export function createEmitter() {
  const listeners = new Set();
  return {
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    emit(payload) {
      listeners.forEach((fn) => fn(payload));
    },
  };
}
