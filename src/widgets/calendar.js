// 월간 캘린더 그리드 (일정·계획 점 표시)
import { daysInMonth, pad2 } from '../core/date.js';
import { ENTRY_TYPE } from '../domain/entry.js';

export const calendarTitle = (year, month) => `${year}년 ${month}월`;

function marksByDay(entries, year, month) {
  const prefix = `${year}-${pad2(month)}-`;
  const marks = new Map();
  entries.forEach((e) => {
    if (!e.date.startsWith(prefix)) return;
    const day = parseInt(e.date.slice(prefix.length), 10);
    if (!marks.has(day)) marks.set(day, new Set());
    marks.get(day).add(e.type);
  });
  return marks;
}

const otherMonthDay = (day) => `<div class="cal-day other-month">${day}</div>`;

export function renderCalendarDays({ year, month, entries, today }) {
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const lastDay = daysInMonth(year, month);
  const prevLastDay = daysInMonth(year, month - 1);
  const marks = marksByDay(entries, year, month);
  const isThisMonth = today.getFullYear() === year && today.getMonth() + 1 === month;
  const cells = [];

  for (let i = firstWeekday - 1; i >= 0; i--) cells.push(otherMonthDay(prevLastDay - i));

  for (let day = 1; day <= lastDay; day++) {
    const types = marks.get(day);
    const cls = [
      types?.has(ENTRY_TYPE.SCHEDULE) && 'has-schedule',
      types?.has(ENTRY_TYPE.PLAN) && 'has-plan',
      isThisMonth && day === today.getDate() && 'today',
    ].filter(Boolean).map((c) => ` ${c}`).join('');
    cells.push(`<div class="cal-day${cls}" data-day="${day}">${day}</div>`);
  }

  const trailing = (7 - ((firstWeekday + lastDay) % 7)) % 7;
  for (let day = 1; day <= trailing; day++) cells.push(otherMonthDay(day));

  return cells.join('');
}
