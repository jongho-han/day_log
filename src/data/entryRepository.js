// 일지 항목 저장소: 서버(/api/entries) + 로컬 캐시

const CACHE_KEY = 'bm_entries_v1';

export function createEntryRepository({ http, storage }) {
  return {
    // 관리자가 아니면 서버가 해당 사용자 항목만 반환
    async fetchAll(userId) {
      const url = userId ? `/api/entries?userId=${encodeURIComponent(userId)}` : '/api/entries';
      const res = await http.get(url);
      if (!res.ok) throw new Error(`entries ${res.status}`);
      return Array.isArray(res.data) ? res.data : [];
    },

    // 서버는 해당 사용자 항목을 전부 지우고 다시 저장 (전체 교체)
    async replaceAll(userId, entries) {
      const res = await http.put('/api/entries', { userId, entries });
      if (!res.ok) throw new Error(`entries PUT ${res.status}`);
    },

    readCache: () => storage.get(CACHE_KEY, []),
    writeCache: (entries) => storage.set(CACHE_KEY, entries),
  };
}
