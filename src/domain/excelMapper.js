// 엑셀 행 ↔ 일지 항목 변환 (순수 함수)
import { pad2, parseDateStr, dayNameOf } from '../core/date.js';
import { ENTRY_TYPE, createEntry, isImportance, typeLabel } from './entry.js';

const USER_COLUMNS = ['날짜', '요일', '시간', '유형', '은행', '중요도', '방문지점', '판매인', '내용'];
const USER_WIDTHS = [14, 6, 8, 8, 12, 8, 22, 14, 50];
const ADMIN_COLUMNS = ['사번', '이름', ...USER_COLUMNS];
const ADMIN_WIDTHS = [12, 10, ...USER_WIDTHS];

const TYPE_BY_LABEL = { 일정: ENTRY_TYPE.SCHEDULE, 계획: ENTRY_TYPE.PLAN };

const EXCEL_EPOCH_OFFSET = 25569; // 1970-01-01 의 엑셀 일련번호

// ── EXPORT ──

function entryCells(x) {
  return [
    x.date, dayNameOf(parseDateStr(x.date)), x.time || '', typeLabel(x.type),
    x.bank || '', x.importance || '', x.location || '', x.seller || '', x.content || '',
  ];
}

// admin 이면 사번·이름 컬럼 포함
export function toSheet(entries, { admin, userName }) {
  const sorted = entries.slice().sort((a, b) => a.date.localeCompare(b.date));
  const header = admin ? ADMIN_COLUMNS : USER_COLUMNS;
  const rows = sorted.map((x) => (admin ? [x.userId || '', userName(x.userId), ...entryCells(x)] : entryCells(x)));
  const widths = admin ? ADMIN_WIDTHS : USER_WIDTHS;
  return { data: [header, ...rows], cols: widths.map((wch) => ({ wch })) };
}

// ── IMPORT ──

function parseDateCell(raw) {
  if (typeof raw === 'number') {
    const d = new Date(Math.round((raw - EXCEL_EPOCH_OFFSET) * 86400 * 1000));
    return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
  }
  const s = String(raw || '').trim().replace(/[./]/g, '-');
  return /^\d{8}$/.test(s) ? `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}` : s;
}

function parseTimeCell(raw) {
  const s = String(raw || '').trim();
  if (!/^\d{1,2}:\d{2}$/.test(s)) return '';
  const [h, m] = s.split(':');
  return `${pad2(h)}:${m}`;
}

const text = (row, key) => String(row[key] || '').trim();

const fail = (reason) => ({ error: true, reason });

/**
 * @param rows sheet_to_json 결과
 * @param ctx { currentUserId, admin, isKnownUser(id) }
 * @returns 항목 또는 { error, reason } 배열
 */
export function parseRows(rows, { currentUserId, admin, isKnownUser }) {
  const hasUserColumns = rows.length > 0 && ('사번' in rows[0] || '이름' in rows[0]);

  return rows.map((row) => {
    const rawDate = row['날짜'];
    const date = parseDateCell(rawDate);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return fail(`날짜 형식 오류: ${String(rawDate || '(없음)')}`);

    const typeText = text(row, '유형');
    const type = TYPE_BY_LABEL[typeText];
    if (!type) return fail(`유형 오류 (일정/계획 중 하나): ${typeText || '(없음)'}`);

    const location = text(row, '방문지점');
    if (!location) return fail(`방문지점 필수 (날짜: ${date})`);

    let userId = currentUserId;
    if (admin && hasUserColumns) {
      const uploadedId = text(row, '사번').toUpperCase();
      if (uploadedId && isKnownUser(uploadedId)) userId = uploadedId;
    }

    const importance = text(row, '중요도');
    return createEntry({
      type,
      date,
      time: parseTimeCell(row['시간']),
      location,
      bank: text(row, '은행'),
      importance: isImportance(importance) ? importance : '',
      seller: text(row, '판매인'),
      content: text(row, '내용'),
      userId,
    });
  });
}
