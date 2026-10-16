// 일지 입력 필드 묶음 (등록 폼·편집 시트 공용)
import { escapeHtml, optionsHtml, qs, qsa, rangeOptionsHtml } from '../core/dom.js';
import { pad2, toDateStr } from '../core/date.js';
import { BANKS, IMPORTANCE_LEVELS, formatTime } from '../domain/entry.js';

const YEAR_FROM = 2023;
const YEAR_TO = 2028;
const NONE = { value: '', label: '선택 안함' };

const field = (label, control) =>
  `<div class="field-group"><label class="field-label">${label}</label>${control}</div>`;

function hourOptions(selected) {
  const hours = Array.from({ length: 24 }, (_, h) => ({ value: h, label: `${h}시` }));
  return optionsHtml([NONE, ...hours], selected);
}

function minuteOptions(selected) {
  const minutes = [0, 10, 20, 30, 40, 50].map((m) => ({ value: m, label: `${pad2(m)}분` }));
  return optionsHtml(minutes, selected);
}

function importanceButtons(selected) {
  return IMPORTANCE_LEVELS.map(({ value, icon }) =>
    `<button type="button" class="importance-btn${value === selected ? ' imp-selected' : ''}" data-value="${value}">${icon} ${value}</button>`,
  ).join('');
}

/**
 * @param values { date:{year,month,day}, time?:{hour,minute}, bank, importance, location, seller, content }
 * @param withScheduleFields 판매인·내용 필드 포함 여부 (일정만)
 */
export function renderEntryFields(values, withScheduleFields) {
  const { date, time = { hour: '', minute: 0 }, bank = '', importance = '', location = '', seller = '', content = '' } = values;
  const bankItems = [NONE, ...BANKS.map((b) => ({ value: b, label: b }))];

  const html = [
    field('날짜', `<div class="date-group">
      <select class="date-select" data-field="year">${rangeOptionsHtml(YEAR_FROM, YEAR_TO, date.year, '년')}</select>
      <select class="date-select" data-field="month">${rangeOptionsHtml(1, 12, date.month, '월')}</select>
      <select class="date-select" data-field="day">${rangeOptionsHtml(1, 31, date.day, '일')}</select>
    </div>`),
    field('시간', `<div class="date-group">
      <select class="date-select" data-field="hour">${hourOptions(time.hour)}</select>
      <select class="date-select" data-field="minute">${minuteOptions(time.minute)}</select>
    </div>`),
    field('은행', `<select class="text-input" data-field="bank">${optionsHtml(bankItems, bank)}</select>`),
    field('중요도', `<div class="importance-group">${importanceButtons(importance)}</div>`),
    field('방문지점', `<input type="text" class="text-input" data-field="location" value="${escapeHtml(location)}" placeholder="예) OO 지점" />`),
  ];

  if (withScheduleFields) {
    html.push(
      field('판매인', `<input type="text" class="text-input" data-field="seller" value="${escapeHtml(seller)}" placeholder="예) 홍길동" />`),
      field('내용', `<textarea class="textarea-input" data-field="content" placeholder="오늘의 대화 내용, 주요 사항 등을 입력하세요">${escapeHtml(content)}</textarea>`),
    );
  }
  return html.join('');
}

const fieldEl = (root, name) => qs(`[data-field="${name}"]`, root);
const fieldValue = (root, name) => fieldEl(root, name)?.value ?? '';

export function readEntryDate(root) {
  return {
    year: parseInt(fieldValue(root, 'year'), 10),
    month: parseInt(fieldValue(root, 'month'), 10),
    day: parseInt(fieldValue(root, 'day'), 10),
  };
}

// 판매인·내용은 해당 필드가 있을 때만 포함
export function readEntryFields(root) {
  const values = {
    date: toDateStr(readEntryDate(root)),
    time: formatTime(fieldValue(root, 'hour'), fieldValue(root, 'minute')),
    bank: fieldValue(root, 'bank'),
    importance: qs('.importance-btn.imp-selected', root)?.dataset.value || '',
    location: fieldValue(root, 'location').trim(),
  };
  if (fieldEl(root, 'seller')) {
    values.seller = fieldValue(root, 'seller').trim();
    values.content = fieldValue(root, 'content').trim();
  }
  return values;
}

export const focusLocation = (root) => fieldEl(root, 'location')?.focus();

// 중요도는 단일 선택, 선택된 버튼을 다시 누르면 해제
export function bindImportanceToggle(container) {
  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.importance-btn');
    if (!btn) return;
    const wasSelected = btn.classList.contains('imp-selected');
    qsa('.importance-btn', btn.closest('.importance-group')).forEach((b) => b.classList.remove('imp-selected'));
    if (!wasSelected) btn.classList.add('imp-selected');
  });
}
