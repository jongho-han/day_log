import { state, isAdmin } from './state.js';

export async function loadFromServer() {
  try {
    const res = await fetch('/api/entries');
    if (res.ok) {
      const all = await res.json();
      if (isAdmin()) {
        state.allEntries = all;
      } else {
        state.allEntries = all.filter(e => e.userId === state.currentUser.id);
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
    const res = await fetch('/api/entries');
    let allUsersEntries = [];
    if (res.ok) allUsersEntries = await res.json();
    const others = allUsersEntries.filter(e => e.userId !== state.currentUser.id);
    const merged = [...others, ...state.allEntries];
    const putRes = await fetch('/api/entries', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(merged),
    });
    if (!putRes.ok) {
      console.error('syncToServer PUT failed:', putRes.status);
      localStorage.setItem(state.KEY, JSON.stringify(state.allEntries));
      return;
    }
  } catch (e) {
    console.error('syncToServer error:', e);
    localStorage.setItem(state.KEY, JSON.stringify(state.allEntries));
    return;
  }
  localStorage.setItem(state.KEY, JSON.stringify(state.allEntries));
}
