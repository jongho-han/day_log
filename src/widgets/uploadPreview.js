// 엑셀 업로드 미리보기
import { escapeHtml } from '../core/dom.js';
import { typeLabel } from '../domain/entry.js';

const PREVIEW_LIMIT = 30;

export const uploadSummary = (total, validCount, errorCount) =>
  `총 ${total}행 · 유효 ${validCount}건${errorCount ? ` · 오류 ${errorCount}건` : ''}`;

function previewItem(item) {
  if (item.error) {
    return `<div class="upload-preview-item err">
      <div class="upload-preview-dot error"></div>
      <div class="upload-preview-info"><div class="upload-preview-loc">⚠ ${escapeHtml(item.reason)}</div></div>
    </div>`;
  }
  const meta = [item.date, item.time, item.bank, typeLabel(item.type)].filter(Boolean).join(' · ');
  return `<div class="upload-preview-item">
    <div class="upload-preview-dot ${item.type}"></div>
    <div class="upload-preview-info">
      <div class="upload-preview-loc">${escapeHtml(item.location)}</div>
      <div class="upload-preview-meta">${escapeHtml(meta)}</div>
    </div>
  </div>`;
}

export function renderUploadPreview(items) {
  const more = items.length > PREVIEW_LIMIT
    ? `<div class="upload-preview-more">... 외 ${items.length - PREVIEW_LIMIT}건</div>` : '';
  return items.slice(0, PREVIEW_LIMIT).map(previewItem).join('') + more;
}
