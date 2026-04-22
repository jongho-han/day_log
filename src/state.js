export const today = new Date();

export const state = {
  calYear: today.getFullYear(),
  calMonth: today.getMonth(),
  scheduleEntryCount: 0,
  planEntryCount: 0,
  selectedDate: null,
  currentTab: 'home',
  currentFilter: 'all',
  detailEntryIndex: null,
  KEY: 'bm_entries_v1',
  allEntries: [],
  ALLOWED_USERS: {},
  ADMIN_ID: '',
  currentUser: null,
};

export function isAdmin() {
  return !!(state.currentUser && state.currentUser.id === state.ADMIN_ID);
}
