import { state, isAdmin } from './state.js';

export async function loadFromServer() {
  try {
    const userId = state.currentUser?.id;
    const url = userId
      ? `/api/entries?userId=${encodeURIComponent(userId)}`
      : '/api/entries';
    const res = await fetch(url);
    if (res.ok) {
      const all = await res.json();
      state.allEntries = all;
      if (!isAdmin()) {
        localStorage.setItem(state.KEY, JSON.stringify(state.allEntries));
      }
      return;
    }
  } catch (_) {}
  state.allEntries = isAdmin() ? [] : JSON.parse(localStorage.getItem(state.KEY) || '[]');
}

export async function syncToServer() {
  if (isAdmin()) return;
  try {
    const putRes = await fetch('/api/entries', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: state.currentUser.id,
        entries: state.allEntries,
      }),
    });
    if (!putRes.ok) {
      console.error('syncToServer PUT failed:', putRes.status);
    }
  } catch (e) {
    console.error('syncToServer error:', e);
  }
  localStorage.setItem(state.KEY, JSON.stringify(state.allEntries));
}
