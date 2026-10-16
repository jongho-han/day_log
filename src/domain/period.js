// 조회 기간 계산 (순수 함수)
import { daysInMonth, formatYmd, toDateStr, ymdOf } from '../core/date.js';

export const PERIOD = {
  TODAY: 'today',
  THIS_MONTH: 'this-month',
  LAST_MONTH: 'last-month',
  THREE_MONTHS: '3-months',
  THIS_YEAR: 'this-year',
};

const monthStart = (year, month) => ({ year, month, day: 1 });
const monthEnd = (year, month) => ({ year, month, day: daysInMonth(year, month) });

export function quickPeriod(type, today) {
  const t = ymdOf(today);
  switch (type) {
    case PERIOD.TODAY:
      return { start: t, end: t };
    case PERIOD.THIS_MONTH:
      return { start: monthStart(t.year, t.month), end: monthEnd(t.year, t.month) };
    case PERIOD.LAST_MONTH: {
      const p = ymdOf(new Date(t.year, t.month - 2, 1));
      return { start: monthStart(p.year, p.month), end: monthEnd(p.year, p.month) };
    }
    case PERIOD.THREE_MONTHS: {
      const p = ymdOf(new Date(t.year, t.month - 3, 1));
      return { start: monthStart(p.year, p.month), end: monthEnd(t.year, t.month) };
    }
    case PERIOD.THIS_YEAR:
      return { start: { year: t.year, month: 1, day: 1 }, end: { year: t.year, month: 12, day: 31 } };
    default:
      return null;
  }
}

export function periodKeys({ start, end }) {
  return { startStr: toDateStr(start), endStr: toDateStr(end) };
}

export function periodLabel(range) {
  const { startStr, endStr } = periodKeys(range);
  return startStr === endStr ? formatYmd(range.start) : `${formatYmd(range.start)} ~ ${formatYmd(range.end)}`;
}

export function filterEntries(entries, range, typeFilter) {
  const { startStr, endStr } = periodKeys(range);
  return entries.filter((x) =>
    x.date >= startStr && x.date <= endStr && (typeFilter === 'all' || x.type === typeFilter));
}

export function groupByDateDesc(items, dateOf) {
  const groups = new Map();
  items.forEach((item) => {
    const key = dateOf(item);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  });
  return [...groups.entries()].sort(([a], [b]) => (a < b ? 1 : a > b ? -1 : 0));
}
