import { state, isAdmin } from './state.js';
import { esc, makeOpts, DAY_NAMES } from './utils.js';
import { showToast } from './ui.js';
import { syncToServer } from './api.js';
import { renderCalendar } from './calendar.js';
import { renderStats, renderRecent, renderRecords } from './records.js';

// ── DETAIL ──

export function openDetail(idx) {
  state.detailEntryIndex = idx;
  const x = state.allEntries[idx];
  if (!x) return;

  const badge = document.getElementById('detail-badge');
  badge.textContent = x.type === 'schedule' ? '일정' : '계획';
  badge.className = `detail-type-badge ${x.type}`;

  document.getElementById('detail-location').textContent = x.location;

  const d = new Date(x.date + 'T00:00:00');
  const [y, mo, da] = x.date.split('-');
  const timeStr = x.time ? ` · ${x.time}` : '';
  document.getElementById('detail-date').textContent =
    `${y}년 ${parseInt(mo)}월 ${parseInt(da)}일 (${DAY_NAMES[d.getDay()]})${timeStr}`;

  let rows = `<div class="detail-row">
    <div class="detail-row-label">은행</div>
    <div class="detail-row-value${x.bank ? '' : ' empty'}">${x.bank || '선택 안함'}</div>
  </div>`;
  if (x.type === 'schedule') {
    rows += `<div class="detail-row">
      <div class="detail-row-label">판매인</div>
      <div class="detail-row-value${x.seller ? '' : ' empty'}">${x.seller || '입력 없음'}</div>
    </div>
    <div class="detail-row">
      <div class="detail-row-label">내용</div>
      <div class="detail-row-value${x.content ? '' : ' empty'}">${esc(x.content) || '입력 없음'}</div>
    </div>`;
  }
  rows += `<div class="detail-row">
    <div class="detail-row-label">등록 시각</div>
    <div class="detail-row-value">${x.createdAt ? new Date(x.createdAt).toLocaleString('ko-KR') : '-'}</div>
  </div>`;

  document.getElementById('detail-rows').innerHTML = rows;
  document.getElementById('detail-overlay').classList.add('visible');
}

export function closeDetail(ev) {
  if (ev && ev.target !== document.getElementById('detail-overlay')) return;
  document.getElementById('detail-overlay').classList.remove('visible');
}

// ── EDIT ──

export function openEdit() {
  const x = state.allEntries[state.detailEntryIndex];
  if (!x) return;

  const [ey, em, ed] = x.date.split('-').map(Number);

  const _et = x.time ? x.time.split(':') : ['', '0'];
  const _eh = _et[0] !== '' ? parseInt(_et[0]) : '';
  const _emin = _et[0] !== '' ? parseInt(_et[1]) : 0;

  let hourOpts = `<option value=""${_eh === '' ? ' selected' : ''}>선택 안함</option>`;
  for (let h = 0; h <= 23; h++) {
    hourOpts += `<option value="${h}"${h === _eh ? ' selected' : ''}>${h}시</option>`;
  }
  let minOpts = '';
  for (let m = 0; m <= 59; m++) {
    minOpts += `<option value="${m}"${m === _emin ? ' selected' : ''}>${String(m).padStart(2, '0')}분</option>`;
  }

  const bankField = `<div class="field-group"><label class="field-label">은행</label>
    <select class="text-input" id="edit-bank">
      <option value="">선택 안함</option>
      <option value="iM뱅크"${x.bank === 'iM뱅크' ? ' selected' : ''}>iM뱅크</option>
      <option value="KB국민"${x.bank === 'KB국민' ? ' selected' : ''}>KB국민</option>
    </select></div>`;

  let extra = '';
  if (x.type === 'schedule') {
    extra = `<div class="field-group"><label class="field-label">판매인</label>
      <input type="text" class="text-input" id="edit-seller" value="${esc(x.seller || '')}" placeholder="예) 홍길동" /></div>
      <div class="field-group"><label class="field-label">내용</label>
      <textarea class="textarea-input" id="edit-content" placeholder="오늘의 대화 내용 등">${esc(x.content || '')}</textarea></div>`;
  }

  document.getElementById('edit-sheet-body').innerHTML =
    `<div class="field-group"><label class="field-label">날짜</label>
      <div class="date-group">
        <select class="date-select" id="edit-year">${makeOpts(2023, 2028, ey, '년')}</select>
        <select class="date-select" id="edit-month">${makeOpts(1, 12, em, '월')}</select>
        <select class="date-select" id="edit-day">${makeOpts(1, 31, ed, '일')}</select>
      </div></div>
    <div class="field-group"><label class="field-label">시간</label>
      <div class="date-group">
        <select class="date-select" id="edit-hour">${hourOpts}</select>
        <select class="date-select" id="edit-minute">${minOpts}</select>
      </div></div>
    ${bankField}
    <div class="field-group"><label class="field-label">방문지점</label>
      <input type="text" class="text-input" id="edit-location" value="${esc(x.location)}" placeholder="예) OO 지점" /></div>
    ${extra}`;

  document.getElementById('edit-overlay').classList.add('visible');
}

export function closeEdit() {
  document.getElementById('edit-overlay').classList.remove('visible');
}

export async function saveEdit() {
  const x = state.allEntries[state.detailEntryIndex];
  if (!x) return;

  const location = (document.getElementById('edit-location').value || '').trim();
  if (!location) {
    showToast('⚠️ 방문지점을 입력해주세요');
    document.getElementById('edit-location').focus();
    return;
  }

  x.date = `${document.getElementById('edit-year').value}-` +
    `${String(document.getElementById('edit-month').value).padStart(2, '0')}-` +
    `${String(document.getElementById('edit-day').value).padStart(2, '0')}`;
  const saveHour = document.getElementById('edit-hour').value;
  const saveMin  = document.getElementById('edit-minute').value;
  x.time     = saveHour !== '' ? `${String(saveHour).padStart(2, '0')}:${String(saveMin).padStart(2, '0')}` : '';
  x.bank     = document.getElementById('edit-bank').value || '';
  x.location = location;
  if (x.type === 'schedule') {
    x.seller  = (document.getElementById('edit-seller').value || '').trim();
    x.content = (document.getElementById('edit-content').value || '').trim();
  }

  localStorage.setItem(state.KEY, JSON.stringify(state.allEntries));
  syncToServer();
  closeEdit();
  openDetail(state.detailEntryIndex);
  renderRecords();
  renderCalendar();
  renderStats();
  renderRecent();
  showToast('✅ 수정되었습니다');
}

// ── DELETE ──

export function confirmDelete() {
  document.getElementById('confirm-overlay').classList.add('visible');
}

export function closeConfirm() {
  document.getElementById('confirm-overlay').classList.remove('visible');
}

export async function doDelete() {
  if (state.detailEntryIndex === null) return;
  state.allEntries.splice(state.detailEntryIndex, 1);
  await syncToServer();
  closeConfirm();
  document.getElementById('detail-overlay').classList.remove('visible');
  renderRecords();
  renderCalendar();
  renderStats();
  renderRecent();
  showToast('🗑 삭제되었습니다');
}
