import { state, today, isAdmin } from './state.js';
import { loadFromServer } from './api.js';
import { closeDrawer } from './ui.js';
import { drawerNav } from './nav.js';
import { renderCalendar } from './calendar.js';
import { renderStats, renderRecent, initPeriodSelectors } from './records.js';

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

// ── INIT (load member list) ──

export async function init() {
  localStorage.removeItem('bm_user');
  try {
    const res = await fetch('/api/members');
    if (res.ok) {
      const data = await res.json();
      state.ALLOWED_USERS = data.users || {};
      state.ADMIN_ID = data.adminId || '';
    }
  } catch (_) {}
}

// ── POST-LOGIN SCREEN SETUP ──

export function initMainScreen() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

  const app = document.getElementById('app');
  const regIds = ['drawer-reg-divider', 'drawer-reg-section', 'drawer-form-schedule', 'drawer-form-plan'];

  if (isAdmin()) {
    app.classList.add('admin-mode');
    regIds.forEach(id => document.getElementById(id)?.classList.add('hidden'));
  } else {
    app.classList.remove('admin-mode');
    regIds.forEach(id => document.getElementById(id)?.classList.remove('hidden'));
  }

  document.getElementById('screen-main').classList.add('active');
  state.currentTab = 'home';
  document.getElementById('drawer-home').classList.add('active');
  document.getElementById('drawer-records').classList.remove('active');

  const d = today;
  document.getElementById('today-str').textContent =
    `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${DAY_NAMES[d.getDay()]}`;

  updateUserUI();
  renderCalendar();
  renderStats();
  renderRecent();
  initPeriodSelectors();
}

export function updateUserUI() {
  if (!state.currentUser) return;
  const hour = today.getHours();
  const greeting = hour < 12 ? '좋은 아침입니다' : hour < 18 ? '오늘도 수고하세요' : '오늘 하루도 고생하셨습니다';
  document.getElementById('greeting-title').textContent = `${state.currentUser.name}님, ${greeting}`;
  const el = document.getElementById('drawer-username');
  if (el) el.textContent = isAdmin() ? '관리자' : state.currentUser.name;
}

// ── LOGIN INPUT HANDLER ──

export function onLoginInput() {
  const val = document.getElementById('login-input').value.trim().toUpperCase();
  const pwWrap = document.getElementById('login-pw-wrap');
  if (val === state.ADMIN_ID && state.ADMIN_ID) {
    pwWrap.style.display = 'block';
  } else {
    pwWrap.style.display = 'none';
    document.getElementById('login-pw').value = '';
  }
}

// ── LOGIN ──

export async function doLogin() {
  const input = document.getElementById('login-input');
  const errEl = document.getElementById('login-error');
  const id = input.value.trim().toUpperCase();
  errEl.textContent = '';

  if (!id) { errEl.textContent = '사번을 입력해주세요'; return; }

  if (id === state.ADMIN_ID) {
    const pw = document.getElementById('login-pw').value;
    if (!pw) { errEl.textContent = '비밀번호를 입력해주세요'; return; }
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, pw }),
      });
      const data = await res.json();
      if (!data.ok) {
        errEl.textContent = data.error || '비밀번호가 올바르지 않습니다';
        document.getElementById('login-pw').select();
        return;
      }
    } catch (_) { errEl.textContent = '서버 연결 오류'; return; }

    state.currentUser = { id: state.ADMIN_ID, name: '관리자' };
    localStorage.setItem('bm_user', JSON.stringify(state.currentUser));
    loadFromServer().then(() => initMainScreen());
    return;
  }

  if (!state.ALLOWED_USERS[id]) {
    errEl.textContent = '등록되지 않은 사번입니다';
    input.select();
    return;
  }

  state.currentUser = { id, name: state.ALLOWED_USERS[id] };
  localStorage.setItem('bm_user', JSON.stringify(state.currentUser));
  loadFromServer().then(() => initMainScreen());
}

// ── LOGOUT ──

export function logout() {
  localStorage.removeItem('bm_user');
  state.currentUser = null;
  state.allEntries = [];
  closeDrawer();
  document.getElementById('app').classList.remove('admin-mode');
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-login').classList.add('active');
  document.getElementById('login-input').value = '';
  document.getElementById('login-error').textContent = '';
  document.getElementById('login-pw').value = '';
  document.getElementById('login-pw-wrap').style.display = 'none';
}
