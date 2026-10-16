// 홈 화면 최근 기록 목록
import { escapeHtml } from '../core/dom.js';
import { isSchedule, typeLabel } from '../domain/entry.js';

function recentMeta(e) {
  const parts = [e.date, e.time, isSchedule(e) ? e.seller : ''];
  return parts.filter(Boolean).join(' · ');
}

// items: [{ entry, index }] (index = 전체 목록 내 위치)
export function renderRecentList(items) {
  if (!items.length) return '<div class="empty-state">아직 기록된 내용이 없습니다</div>';
  return items.map(({ entry: e, index }) => `<div class="recent-item" data-idx="${index}">
      <div class="recent-dot ${e.type}"></div>
      <div class="recent-info">
        <div class="recent-location">${escapeHtml(e.location)}</div>
        <div class="recent-meta">${escapeHtml(recentMeta(e))}</div>
      </div>
      <span class="recent-type ${e.type}">${typeLabel(e.type)}</span>
    </div>`).join('');
}
