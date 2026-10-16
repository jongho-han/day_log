// 기록 보기 화면: 요약·날짜별 그룹 목록
import { escapeHtml } from '../core/dom.js';
import { formatYmdWithDay, parseDateStr } from '../core/date.js';
import { ENTRY_TYPE, isSchedule, typeLabel } from '../domain/entry.js';
import { groupByDateDesc, periodLabel } from '../domain/period.js';
import { importanceTag } from './importanceTag.js';

export function renderRecordSummary(range, items) {
  if (!items.length) return '';
  const count = (type) => items.filter((x) => x.type === type).length;
  return `<strong>${periodLabel(range)}</strong> &nbsp;·&nbsp; `
    + `<span class="sum-sched">일정 ${count(ENTRY_TYPE.SCHEDULE)}건</span> &nbsp;·&nbsp; `
    + `<span class="sum-plan">계획 ${count(ENTRY_TYPE.PLAN)}건</span> &nbsp;·&nbsp; 총 ${items.length}건`;
}

export const renderRecordsEmpty = (range) =>
  `<div class="records-empty"><div class="records-empty-icon">📭</div><div>${periodLabel(range)} 기록이 없습니다</div></div>`;

function recordCard(x, { index, userLabel }) {
  const meta = [x.time, isSchedule(x) ? x.seller : '', x.bank].filter(Boolean).join(' · ');
  const preview = isSchedule(x) && x.content
    ? `<div class="record-content-preview">${escapeHtml(x.content)}</div>` : '';
  const user = userLabel ? `<div class="record-user-info">👤 ${escapeHtml(userLabel)}</div>` : '';
  return `<div class="record-card" data-idx="${index}">
    <div class="record-type-dot ${x.type}"></div>
    <div class="record-card-info">
      <div class="record-location">${escapeHtml(x.location)}${importanceTag(x.importance)}</div>
      ${meta ? `<div class="record-meta">${escapeHtml(meta)}</div>` : ''}
      ${user}${preview}
    </div>
    <span class="record-badge ${x.type}">${typeLabel(x.type)}</span>
  </div>`;
}

/**
 * @param ctx { indexOf(entry), userLabel(entry) → 문자열|'' }
 */
export function renderRecordGroups(items, ctx) {
  return groupByDateDesc(items, (x) => x.date).map(([date, group]) => `<div class="records-date-group">
      <div class="records-date-header">
        <span class="records-date-title">${formatYmdWithDay(parseDateStr(date))}</span>
        <span class="records-date-count">${group.length}건</span>
      </div>${group.map((x) => recordCard(x, { index: ctx.indexOf(x), userLabel: ctx.userLabel(x) })).join('')}
    </div>`).join('');
}
