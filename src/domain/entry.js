// 일지 항목 도메인 규칙 (순수 함수)
import { pad2, parseDateStr } from '../core/date.js';

export const ENTRY_TYPE = { SCHEDULE: 'schedule', PLAN: 'plan' };

export const TYPE_LABEL = { schedule: '일정', plan: '계획' };

export const BANKS = ['iM뱅크', 'KB국민'];

export const IMPORTANCE_LEVELS = [
  { value: '핵심', icon: '⭐' },
  { value: '성장', icon: '📈' },
  { value: '휴면', icon: '💤' },
];

export const isSchedule = (entryOrType) =>
  (typeof entryOrType === 'string' ? entryOrType : entryOrType.type) === ENTRY_TYPE.SCHEDULE;

export const typeLabel = (type) => TYPE_LABEL[type] || '';

export const isImportance = (value) => IMPORTANCE_LEVELS.some((lv) => lv.value === value);

// hour 가 '' 이면 시간 미지정
export const formatTime = (hour, minute) => (hour === '' ? '' : `${pad2(hour)}:${pad2(minute)}`);

export function parseTime(time) {
  if (!time) return { hour: '', minute: 0 };
  const [h, m] = time.split(':');
  return { hour: parseInt(h, 10), minute: parseInt(m, 10) };
}

export function isInMonth(entry, year, month) {
  const d = parseDateStr(entry.date);
  return d.year === year && d.month === month;
}

// 입력값으로 저장용 항목 생성. 판매인·내용은 일정에만 존재
export function createEntry({ type, date, time = '', location, bank = '', importance = '', seller = '', content = '', userId }) {
  const entry = {
    type,
    date,
    time,
    location,
    bank,
    importance,
    userId,
    createdAt: new Date().toISOString(),
  };
  if (isSchedule(type)) {
    entry.seller = seller;
    entry.content = content;
  }
  return entry;
}

// 기존 항목에 편집값 반영 (createdAt·userId·type 유지)
export function applyEdit(entry, values) {
  const next = { ...entry, ...values };
  if (!isSchedule(entry)) {
    delete next.seller;
    delete next.content;
  }
  return next;
}

export function validateEntryInput({ location }) {
  return location ? null : '⚠️ 방문지점을 입력해주세요';
}
