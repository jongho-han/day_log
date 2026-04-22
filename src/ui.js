import { state } from './state.js';

// ── TOAST ──

let toastTimer = null;

export function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('visible');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('visible'), 2800);
}

// ── DRAWER ──

export function openDrawer() {
  document.getElementById('drawer').classList.add('open');
  document.getElementById('drawer-backdrop').classList.add('open');
}

export function closeDrawer() {
  document.getElementById('drawer').classList.remove('open');
  document.getElementById('drawer-backdrop').classList.remove('open');
}

// ── BOTTOM SHEET ──

export function openSheet(year, month, day, el) {
  state.selectedDate = { year, month, day };
  document.querySelectorAll('.cal-day.selected').forEach(e => e.classList.remove('selected'));
  if (el) el.classList.add('selected');
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const dow = new Date(year, month - 1, day).getDay();
  document.getElementById('sheet-date-label').textContent =
    `${year}년 ${month}월 ${day}일 (${dayNames[dow]})`;
  document.getElementById('sheet-backdrop').classList.add('visible');
  document.getElementById('bottom-sheet').classList.add('visible');
}

export function closeSheet() {
  document.getElementById('sheet-backdrop').classList.remove('visible');
  document.getElementById('bottom-sheet').classList.remove('visible');
  document.querySelectorAll('.cal-day.selected').forEach(e => e.classList.remove('selected'));
}
