// 홈: 캘린더·통계·최근 기록·날짜 선택 시트
import { byId, qsa, setVisible } from '../core/dom.js';
import { formatYmdWithDay } from '../core/date.js';
import { ENTRY_TYPE, isInMonth } from '../domain/entry.js';
import { calendarTitle, renderCalendarDays } from '../widgets/calendar.js';
import { renderRecentList } from '../widgets/recentList.js';

const RECENT_LIMIT = 6;

export function createHomeController({ entries, today, openForm, openDetail }) {
  let year = today.getFullYear();
  let month = today.getMonth() + 1;
  let selectedDate = null;

  const grid = byId('cal-grid');
  const sheet = byId('bottom-sheet');
  const sheetBackdrop = byId('sheet-backdrop');

  function renderCalendar() {
    byId('cal-month-title').textContent = calendarTitle(year, month);
    grid.innerHTML = renderCalendarDays({ year, month, entries: entries.all(), today });
  }

  function renderStats() {
    const monthEntries = entries.all().filter((e) => isInMonth(e, year, month));
    const count = (type) => monthEntries.filter((e) => e.type === type).length;
    byId('stat-schedule').textContent = count(ENTRY_TYPE.SCHEDULE);
    byId('stat-plan').textContent = count(ENTRY_TYPE.PLAN);
  }

  function renderRecent() {
    const items = entries.all().map((entry, index) => ({ entry, index })).reverse().slice(0, RECENT_LIMIT);
    byId('recent-list').innerHTML = renderRecentList(items);
  }

  function render() {
    renderCalendar();
    renderStats();
    renderRecent();
  }

  function changeMonth(delta) {
    const d = new Date(year, month - 1 + delta, 1);
    year = d.getFullYear();
    month = d.getMonth() + 1;
    renderCalendar();
    renderStats();
  }

  const clearSelection = () => qsa('.cal-day.selected', grid).forEach((el) => el.classList.remove('selected'));

  function openSheet(dayEl) {
    selectedDate = { year, month, day: parseInt(dayEl.dataset.day, 10) };
    clearSelection();
    dayEl.classList.add('selected');
    byId('sheet-date-label').textContent = formatYmdWithDay(selectedDate);
    setVisible(sheetBackdrop, true);
    setVisible(sheet, true);
  }

  function closeSheet() {
    setVisible(sheetBackdrop, false);
    setVisible(sheet, false);
    clearSelection();
  }

  function openFormFromSheet(type) {
    closeSheet();
    openForm(type, selectedDate);
  }

  return {
    render,

    bind() {
      entries.subscribe(render);
      byId('cal-prev').addEventListener('click', () => changeMonth(-1));
      byId('cal-next').addEventListener('click', () => changeMonth(1));
      grid.addEventListener('click', (e) => {
        const dayEl = e.target.closest('.cal-day[data-day]');
        if (dayEl) openSheet(dayEl);
      });
      byId('home-btn-schedule').addEventListener('click', () => openForm(ENTRY_TYPE.SCHEDULE, null));
      byId('home-btn-plan').addEventListener('click', () => openForm(ENTRY_TYPE.PLAN, null));
      byId('recent-list').addEventListener('click', (e) => {
        const item = e.target.closest('.recent-item');
        if (item) openDetail(parseInt(item.dataset.idx, 10));
      });
      sheetBackdrop.addEventListener('click', closeSheet);
      sheet.querySelector('.opt-schedule').addEventListener('click', () => openFormFromSheet(ENTRY_TYPE.SCHEDULE));
      sheet.querySelector('.opt-plan').addEventListener('click', () => openFormFromSheet(ENTRY_TYPE.PLAN));
      sheet.querySelector('.sheet-cancel-btn').addEventListener('click', closeSheet);
    },
  };
}
