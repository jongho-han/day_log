import { state, today } from './state.js';
import { MONTH_NAMES } from './utils.js';
import { openSheet } from './ui.js';
import { renderStats } from './records.js';

export function renderCalendar() {
  document.getElementById('cal-month-title').textContent =
    `${state.calYear}년 ${MONTH_NAMES[state.calMonth]}`;

  const grid = document.getElementById('cal-grid');
  grid.innerHTML = '';

  const firstDay = new Date(state.calYear, state.calMonth, 1).getDay();
  const lastDate = new Date(state.calYear, state.calMonth + 1, 0).getDate();
  const prevLast = new Date(state.calYear, state.calMonth, 0).getDate();

  for (let i = firstDay - 1; i >= 0; i--) {
    const el = document.createElement('div');
    el.className = 'cal-day other-month';
    el.textContent = prevLast - i;
    grid.appendChild(el);
  }

  for (let day = 1; day <= lastDate; day++) {
    const el = document.createElement('div');
    el.className = 'cal-day';
    el.textContent = day;

    const dateStr = `${state.calYear}-${String(state.calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayEntries = state.allEntries.filter(e => e.date === dateStr);
    if (dayEntries.some(e => e.type === 'schedule')) el.classList.add('has-schedule');
    if (dayEntries.some(e => e.type === 'plan')) el.classList.add('has-plan');
    if (
      state.calYear === today.getFullYear() &&
      state.calMonth === today.getMonth() &&
      day === today.getDate()
    ) el.classList.add('today');

    el.addEventListener('click', () => openSheet(state.calYear, state.calMonth + 1, day, el));
    grid.appendChild(el);
  }

  const total = firstDay + lastDate;
  const remain = total % 7 === 0 ? 0 : 7 - (total % 7);
  for (let i = 1; i <= remain; i++) {
    const el = document.createElement('div');
    el.className = 'cal-day other-month';
    el.textContent = i;
    grid.appendChild(el);
  }
}

export function changeMonth(dir) {
  state.calMonth += dir;
  if (state.calMonth < 0) { state.calMonth = 11; state.calYear--; }
  if (state.calMonth > 11) { state.calMonth = 0; state.calYear++; }
  renderCalendar();
  renderStats();
}
