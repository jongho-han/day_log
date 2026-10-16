// 일지 항목 상태 + 저장 정책. 변경 시 구독자에게 알림
import { createEmitter } from '../core/emitter.js';
import { applyEdit } from '../domain/entry.js';

export function createEntryProvider({ entryRepository, auth }) {
  let entries = [];
  const changes = createEmitter();
  const notify = () => changes.emit(entries);

  // 관리자는 전체 사용자 데이터를 보므로 저장하지 않음 (조회 전용)
  async function persist() {
    if (auth.isAdmin()) return;
    entryRepository.writeCache(entries);
    try {
      await entryRepository.replaceAll(auth.currentUser.id, entries);
    } catch (e) {
      console.error('[entries] 서버 동기화 실패:', e);
    }
  }

  return {
    subscribe: changes.subscribe,
    all: () => entries,
    at: (index) => entries[index],
    indexOf: (entry) => entries.indexOf(entry),

    // 서버 실패 시 일반 사용자는 로컬 캐시로 대체
    async load() {
      const admin = auth.isAdmin();
      try {
        entries = await entryRepository.fetchAll(auth.currentUser?.id);
        if (!admin) entryRepository.writeCache(entries);
      } catch (_) {
        entries = admin ? [] : entryRepository.readCache();
      }
      notify();
    },

    add(newEntries) {
      entries = [...entries, ...newEntries];
      notify();
      return persist();
    },

    update(index, values) {
      entries = entries.map((x, i) => (i === index ? applyEdit(x, values) : x));
      notify();
      return persist();
    },

    remove(index) {
      entries = entries.filter((_, i) => i !== index);
      notify();
      return persist();
    },

    clear() {
      entries = [];
      notify();
    },
  };
}
