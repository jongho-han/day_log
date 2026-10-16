// 중요도 태그
import { escapeHtml } from '../core/dom.js';
import { isImportance } from '../domain/entry.js';

export const importanceTag = (value) =>
  (isImportance(value) ? `<span class="imp-tag imp-tag-${value}">${escapeHtml(value)}</span>` : '');
