// 기록 보기: 기간·유형 필터와 목록
import { byId, qsa } from '../core/dom.js';
import { filterEntries, quickPeriod } from '../domain/period.js';
import { createPeriodSelector } from '../widgets/periodSelector.js';
import { renderRecordGroups, renderRecordSummary, renderRecordsEmpty } from '../widgets/recordList.js';

export function createRecordsController({ entries, auth, today, openDetail }) {
  let typeFilter = 'all';
  const period = createPeriodSelector();
  const body = byId('records-body');

  // 현재 조회 조건의 항목 (엑셀 다운로드와 공유)
  function getFiltered() {
    const range = period.getRange(today);
    return { range, items: filterEntries(entries.all(), range, typeFilter) };
  }

  function userLabel(x) {
    if (!auth.isAdmin() || !x.userId) return '';
    return `${x.userId} · ${auth.userName(x.userId) || '알수없음'}`;
  }

  function render() {
    const { range, items } = getFiltered();
    byId('records-summary').innerHTML = renderRecordSummary(range, items);
    body.innerHTML = items.length
      ? renderRecordGroups(items, { indexOf: entries.indexOf, userLabel })
      : renderRecordsEmpty(range);
  }

  function setQuickPeriod(btn) {
    const range = quickPeriod(btn.dataset.period, today);
    if (range) period.setRange(range);
    qsa('.period-quick-btn').forEach((b) => b.classList.toggle('active-quick', b === btn));
    render();
  }

  function setFilter(filter) {
    typeFilter = filter;
    qsa('.filter-chip').forEach((c) => c.classList.toggle('active', c.dataset.filter === filter));
    render();
  }

  return {
    render,
    getFiltered,
    reset: () => period.reset(today),

    bind() {
      entries.subscribe(render);
      period.bind();
      document.querySelector('.period-actions').addEventListener('click', (e) => {
        const quickBtn = e.target.closest('.period-quick-btn');
        if (quickBtn) setQuickPeriod(quickBtn);
        if (e.target.closest('.period-search-btn')) render();
      });
      document.querySelector('.filter-chips-wrap').addEventListener('click', (e) => {
        const chip = e.target.closest('.filter-chip');
        if (chip) setFilter(chip.dataset.filter);
      });
      body.addEventListener('click', (e) => {
        const card = e.target.closest('.record-card');
        if (card) openDetail(parseInt(card.dataset.idx, 10));
      });
    },
  };
}
