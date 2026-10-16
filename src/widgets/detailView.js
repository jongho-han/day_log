// 기록 상세 시트 내용
import { escapeHtml } from '../core/dom.js';
import { formatYmdWithDay, parseDateStr } from '../core/date.js';
import { isSchedule } from '../domain/entry.js';
import { importanceTag } from './importanceTag.js';

export const formatDetailDate = (x) =>
  `${formatYmdWithDay(parseDateStr(x.date))}${x.time ? ` · ${x.time}` : ''}`;

function row(label, valueHtml, emptyText) {
  const empty = !valueHtml;
  return `<div class="detail-row">
    <div class="detail-row-label">${label}</div>
    <div class="detail-row-value${empty ? ' empty' : ''}">${empty ? emptyText : valueHtml}</div>
  </div>`;
}

export function renderDetailRows(x) {
  const rows = [
    row('은행', escapeHtml(x.bank), '선택 안함'),
    row('중요도', importanceTag(x.importance), '선택 안함'),
  ];
  if (isSchedule(x)) {
    rows.push(
      row('판매인', escapeHtml(x.seller), '입력 없음'),
      row('내용', escapeHtml(x.content), '입력 없음'),
    );
  }
  rows.push(row('등록 시각', x.createdAt ? new Date(x.createdAt).toLocaleString('ko-KR') : '', '-'));
  return rows.join('');
}
