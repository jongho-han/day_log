// DOM 조회·표시 헬퍼

export const byId = (id) => document.getElementById(id);
export const qs = (selector, root = document) => root.querySelector(selector);
export const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);
}

export function setVisible(el, visible, className = 'visible') {
  if (el) el.classList.toggle(className, visible);
}

export function optionsHtml(items, selected) {
  return items
    .map(({ value, label }) => `<option value="${value}"${value === selected ? ' selected' : ''}>${label}</option>`)
    .join('');
}

export function rangeOptionsHtml(from, to, selected, unit) {
  const items = [];
  for (let v = from; v <= to; v++) items.push({ value: v, label: `${v}${unit}` });
  return optionsHtml(items, selected);
}
