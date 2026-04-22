import { state, isAdmin } from './state.js';
import { esc, DAY_NAMES } from './utils.js';
import { showToast } from './ui.js';
import { syncToServer } from './api.js';
import { renderCalendar } from './calendar.js';
import { renderStats, renderRecent, renderRecords, getFilteredEntries } from './records.js';

let pendingUploadEntries = [];

// ── DOWNLOAD ──

export function downloadExcel() {
  const XLSX = window.XLSX;
  if (!XLSX) { showToast('⚠️ 라이브러리 로딩 중. 잠시 후 재시도해주세요.'); return; }

  const { entries, startStr: s, endStr: e } = getFilteredEntries();
  if (entries.length === 0) { showToast('⚠️ 다운로드할 데이터가 없습니다'); return; }

  const sorted = entries.slice().sort((a, b) => a.date.localeCompare(b.date));
  let wsData;

  if (isAdmin()) {
    wsData = [['사번', '이름', '날짜', '요일', '시간', '유형', '은행', '중요도', '방문지점', '판매인', '내용']];
    sorted.forEach(x => {
      const d = new Date(x.date + 'T00:00:00');
      wsData.push([
        x.userId || '', state.ALLOWED_USERS[x.userId] || '', x.date, DAY_NAMES[d.getDay()],
        x.time || '', x.type === 'schedule' ? '일정' : '계획',
        x.bank || '', x.importance || '', x.location || '', x.seller || '', x.content || '',
      ]);
    });
  } else {
    wsData = [['날짜', '요일', '시간', '유형', '은행', '중요도', '방문지점', '판매인', '내용']];
    sorted.forEach(x => {
      const d = new Date(x.date + 'T00:00:00');
      wsData.push([
        x.date, DAY_NAMES[d.getDay()], x.time || '', x.type === 'schedule' ? '일정' : '계획',
        x.bank || '', x.importance || '', x.location || '', x.seller || '', x.content || '',
      ]);
    });
  }

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!cols'] = isAdmin()
    ? [{ wch:12 },{ wch:10 },{ wch:14 },{ wch:6 },{ wch:8 },{ wch:8 },{ wch:12 },{ wch:8 },{ wch:22 },{ wch:14 },{ wch:50 }]
    : [{ wch:14 },{ wch:6 },{ wch:8 },{ wch:8 },{ wch:12 },{ wch:8 },{ wch:22 },{ wch:14 },{ wch:50 }];

  const wb = XLSX.utils.book_new();
  const sheetLabel = s === e ? s : `${s}~${e}`;
  XLSX.utils.book_append_sheet(wb, ws, sheetLabel.slice(0, 31));

  const nameTag = state.currentUser ? `${state.currentUser.name}_` : '';
  const filename = `BM영업일지_${nameTag}${sheetLabel}.xlsx`;
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 1000);

  const dispLabel = s === e ? s : `${s} ~ ${e}`;
  showToast(`📥 ${dispLabel} 다운로드 완료! (${entries.length}건)`);
}

// ── UPLOAD ──

export function openUpload() {
  pendingUploadEntries = [];
  const previewEl = document.getElementById('upload-preview');
  if (previewEl) previewEl.style.display = 'none';
  const importBtn = document.getElementById('upload-import-btn');
  if (importBtn) { importBtn.disabled = true; importBtn.textContent = '가져오기'; }
  const inp = document.getElementById('excel-upload-input');
  if (inp) inp.value = '';
  document.getElementById('upload-overlay').classList.add('visible');
}

export function closeUpload() {
  document.getElementById('upload-overlay').classList.remove('visible');
  pendingUploadEntries = [];
  const inp = document.getElementById('excel-upload-input');
  if (inp) inp.value = '';
}

export function triggerUploadInput() {
  document.getElementById('excel-upload-input').click();
}

export function handleExcelUpload(event) {
  const XLSX = window.XLSX;
  const file = event.target.files[0];
  if (!file) return;
  if (!XLSX) { showToast('⚠️ 라이브러리 로딩 중. 잠시 후 재시도해주세요.'); return; }

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      if (!rows.length) { showToast('⚠️ 데이터가 없습니다'); return; }
      parseUploadRows(rows);
    } catch (_) {
      showToast('⚠️ 파일을 읽을 수 없습니다');
    }
  };
  reader.readAsArrayBuffer(file);
}

function parseUploadRows(rows) {
  const isAdminFmt = rows.length > 0 && ('사번' in rows[0] || '이름' in rows[0]);
  const parsed = rows.map(row => {
    const rawDate = row['날짜'];
    let dateStr = '';
    if (typeof rawDate === 'number') {
      const d = new Date(Math.round((rawDate - 25569) * 86400 * 1000));
      dateStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    } else {
      dateStr = String(rawDate || '').trim().replace(/[./]/g, '-');
      if (/^\d{8}$/.test(dateStr)) {
        dateStr = `${dateStr.slice(0,4)}-${dateStr.slice(4,6)}-${dateStr.slice(6,8)}`;
      }
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return { error: true, reason: `날짜 형식 오류: ${String(rawDate || '(없음)')}` };
    }

    const typeStr = String(row['유형'] || '').trim();
    const type = typeStr === '일정' ? 'schedule' : typeStr === '계획' ? 'plan' : null;
    if (!type) return { error: true, reason: `유형 오류 (일정/계획 중 하나): ${typeStr || '(없음)'}` };

    const location = String(row['방문지점'] || '').trim();
    if (!location) return { error: true, reason: `방문지점 필수 (날짜: ${dateStr})` };

    const bank       = String(row['은행']   || '').trim();
    const rawImp     = String(row['중요도'] || '').trim();
    const importance = ['핵심', '성장', '휴면'].includes(rawImp) ? rawImp : '';
    const seller  = String(row['판매인'] || '').trim();
    const content = String(row['내용']   || '').trim();
    const rawTime = String(row['시간']   || '').trim();
    const timeVal = rawTime && /^\d{1,2}:\d{2}$/.test(rawTime)
      ? `${String(rawTime.split(':')[0]).padStart(2, '0')}:${rawTime.split(':')[1]}`
      : '';

    let userId = state.currentUser.id;
    if (isAdmin() && isAdminFmt) {
      const uploadedId = String(row['사번'] || '').trim().toUpperCase();
      if (uploadedId && state.ALLOWED_USERS[uploadedId]) userId = uploadedId;
    }

    const entry = { type, date: dateStr, time: timeVal, location, bank, importance, userId, createdAt: new Date().toISOString() };
    if (type === 'schedule') { entry.seller = seller; entry.content = content; }
    return entry;
  });

  const validEntries = parsed.filter(e => !e.error);
  const errCount = parsed.filter(e => e.error).length;
  pendingUploadEntries = validEntries;
  showUploadPreview(parsed, validEntries.length, errCount);
}

function showUploadPreview(items, validCount, errCount) {
  const countEl   = document.getElementById('upload-preview-count');
  const listEl    = document.getElementById('upload-preview-list');
  const importBtn = document.getElementById('upload-import-btn');
  const previewEl = document.getElementById('upload-preview');

  countEl.textContent = `총 ${items.length}행 · 유효 ${validCount}건${errCount ? ` · 오류 ${errCount}건` : ''}`;

  let html = items.slice(0, 30).map(item => {
    if (item.error) {
      return `<div class="upload-preview-item err">
        <div class="upload-preview-dot error"></div>
        <div class="upload-preview-info"><div class="upload-preview-loc">⚠ ${esc(item.reason)}</div></div>
      </div>`;
    }
    const meta = [item.date, item.time || null, item.bank, item.type === 'schedule' ? '일정' : '계획']
      .filter(Boolean).join(' · ');
    return `<div class="upload-preview-item">
      <div class="upload-preview-dot ${item.type}"></div>
      <div class="upload-preview-info">
        <div class="upload-preview-loc">${esc(item.location)}</div>
        <div class="upload-preview-meta">${esc(meta)}</div>
      </div>
    </div>`;
  }).join('');

  if (items.length > 30) {
    html += `<div style="text-align:center;padding:8px;font-size:11px;color:var(--text-hint)">... 외 ${items.length - 30}건</div>`;
  }

  listEl.innerHTML = html;
  previewEl.style.display = 'block';

  if (validCount > 0) {
    importBtn.disabled = false;
    importBtn.innerHTML = `<span>📥</span> ${validCount}건 가져오기`;
  } else {
    importBtn.disabled = true;
    importBtn.innerHTML = '가져올 유효한 데이터가 없습니다';
  }
}

export function confirmImport() {
  if (!pendingUploadEntries.length) return;
  const count = pendingUploadEntries.length;
  state.allEntries.push(...pendingUploadEntries);
  localStorage.setItem(state.KEY, JSON.stringify(state.allEntries));
  syncToServer();
  closeUpload();
  renderCalendar();
  renderStats();
  renderRecent();
  if (state.currentTab === 'records') renderRecords();
  showToast(`✅ ${count}건을 가져왔습니다`);
}
