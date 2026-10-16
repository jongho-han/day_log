// 날짜 포맷·계산 (순수 함수)

export const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

export const pad2 = (n) => String(n).padStart(2, '0');

export const toDateStr = ({ year, month, day }) => `${year}-${pad2(month)}-${pad2(day)}`;

export function parseDateStr(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return { year, month, day };
}

export const ymdOf = (date) => ({ year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() });

export const daysInMonth = (year, month) => new Date(year, month, 0).getDate();

export const dayNameOf = ({ year, month, day }) => DAY_NAMES[new Date(year, month - 1, day).getDay()];

export const formatYmd = ({ year, month, day }) => `${year}년 ${month}월 ${day}일`;

export const formatYmdWithDay = (ymd) => `${formatYmd(ymd)} (${dayNameOf(ymd)})`;

export const formatDotDate = (ymd) => `${ymd.year}.${pad2(ymd.month)}.${pad2(ymd.day)} ${dayNameOf(ymd)}`;
