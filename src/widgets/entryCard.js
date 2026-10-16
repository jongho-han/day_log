// 등록 폼의 항목 카드
import { isSchedule } from '../domain/entry.js';
import { renderEntryFields } from './entryFields.js';

export const ADD_ENTRY_BUTTON_HTML =
  '<button type="button" class="add-entry-btn"><div class="add-plus">+</div> 항목 추가</button>';

export const entryCardId = (type, index) => `${type}-entry-${index}`;

export function renderEntryCard({ type, index, date }) {
  const label = isSchedule(type) ? '방문 기록' : '방문 계획';
  const removeBtn = index > 1
    ? `<button type="button" class="entry-remove-btn" data-type="${type}" data-id="${index}">삭제</button>`
    : '';
  return `<div class="entry-card" id="${entryCardId(type, index)}">
    <div class="entry-card-header">
      <div class="entry-card-label"><div class="entry-num-badge">${index}</div>${label}</div>
      ${removeBtn}
    </div>
    <div class="entry-card-body">${renderEntryFields({ date }, isSchedule(type))}</div>
  </div>`;
}
