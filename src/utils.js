export const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];
export const MONTH_NAMES = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

export function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function makeOpts(from, to, cur, unit) {
  let o = '';
  for (let v = from; v <= to; v++) {
    o += `<option value="${v}"${v === cur ? ' selected' : ''}>${v}${unit}</option>`;
  }
  return o;
}
