import { state, today, isAdmin } from './state.js';
import { makeOpts, esc } from './utils.js';
import { showToast } from './ui.js';
import { syncToServer } from './api.js';
import { goBack } from './nav.js';
import { renderCalendar } from './calendar.js';
import { renderStats, renderRecent, renderRecords } from './records.js';

// ── OPEN FORM ──

export function openForm(type, date) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(`screen-${type}`).classList.add('active');
  window.scrollTo(0, 0);

  if (type === 'schedule') {
    state.scheduleEntryCount = 0;
    document.getElementById('schedule-body').innerHTML = '';
    addEntry('schedule', date);
  } else {
    state.planEntryCount = 0;
    document.getElementById('plan-body').innerHTML = '';
    addEntry('plan', date);
  }
}

// ── ADD ENTRY CARD ──

function buildTimeOpts(selectedHour, selectedMin) {
  let hourOpts = '<option value="">선택 안함</option>';
  for (let h = 0; h <= 23; h++) {
    hourOpts += `<option value="${h}"${h === selectedHour ? ' selected' : ''}>${h}시</option>`;
  }
  let minOpts = '';
  for (let m = 0; m <= 59; m++) {
    minOpts += `<option value="${m}"${m === selectedMin ? ' selected' : ''}>${String(m).padStart(2, '0')}분</option>`;
  }
  return { hourOpts, minOpts };
}

export function addEntry(type, date) {
  const isSchedule = type === 'schedule';
  const countId = isSchedule ? ++state.scheduleEntryCount : ++state.planEntryCount;
  const body = document.getElementById(`${type}-body`);

  const existBtn = body.querySelector('.add-entry-btn');
  if (existBtn) existBtn.remove();

  const py = date ? date.year  : today.getFullYear();
  const pm = date ? date.month : today.getMonth() + 1;
  const pd = date ? date.day   : today.getDate();

  const { hourOpts, minOpts } = buildTimeOpts('', 0);

  const bankField = `<div class="field-group"><label class="field-label">은행</label>
    <select class="text-input" data-field="bank">
      <option value="">선택 안함</option>
      <option value="iM뱅크">iM뱅크</option>
      <option value="KB국민">KB국민</option>
    </select></div>`;

  const dateFields = `<div class="field-group"><label class="field-label">날짜</label>
    <div class="date-group">
      <select class="date-select" data-field="year">${makeOpts(2023, 2028, py, '년')}</select>
      <select class="date-select" data-field="month">${makeOpts(1, 12, pm, '월')}</select>
      <select class="date-select" data-field="day">${makeOpts(1, 31, pd, '일')}</select>
    </div></div>`;

  const timeFields = `<div class="field-group"><label class="field-label">시간</label>
    <div class="date-group">
      <select class="date-select" data-field="hour">${hourOpts}</select>
      <select class="date-select" data-field="minute">${minOpts}</select>
    </div></div>`;

  const removeBtn = countId > 1
    ? `<button class="entry-remove-btn" data-type="${type}" data-id="${countId}">삭제</button>`
    : '';

  const card = document.createElement('div');
  card.className = 'entry-card';
  card.id = `${type}-entry-${countId}`;

  if (isSchedule) {
    card.innerHTML = `<div class="entry-card-header">
      <div class="entry-card-label"><div class="entry-num-badge">${countId}</div>방문 기록</div>
      ${removeBtn}
    </div>
    <div class="entry-card-body">
      ${dateFields}${timeFields}${bankField}
      <div class="field-group"><label class="field-label">방문지점</label>
        <input type="text" class="text-input" data-field="location" placeholder="예) OO 지점" /></div>
      <div class="field-group"><label class="field-label">판매인</label>
        <input type="text" class="text-input" data-field="seller" placeholder="예) 홍길동" /></div>
      <div class="field-group"><label class="field-label">내용</label>
        <textarea class="textarea-input" data-field="content" placeholder="오늘의 대화 내용, 주요 사항 등을 입력하세요"></textarea></div>
    </div>`;
  } else {
    card.innerHTML = `<div class="entry-card-header">
      <div class="entry-card-label"><div class="entry-num-badge">${countId}</div>방문 계획</div>
      ${removeBtn}
    </div>
    <div class="entry-card-body">
      ${dateFields}${timeFields}${bankField}
      <div class="field-group"><label class="field-label">방문지점</label>
        <input type="text" class="text-input" data-field="location" placeholder="예) OO 지점" /></div>
    </div>`;
  }

  body.appendChild(card);

  const addBtn = document.createElement('button');
  addBtn.className = 'add-entry-btn';
  addBtn.innerHTML = '<div class="add-plus">+</div> 항목 추가';
  addBtn.addEventListener('click', () => {
    const firstCard = body.querySelector('.entry-card');
    let defaultDate = null;
    if (firstCard) {
      defaultDate = {
        year:  parseInt(firstCard.querySelector('[data-field="year"]').value),
        month: parseInt(firstCard.querySelector('[data-field="month"]').value),
        day:   parseInt(firstCard.querySelector('[data-field="day"]').value),
      };
    }
    addEntry(type, defaultDate);
  });
  body.appendChild(addBtn);
  updateCount(type);

  setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 50);
}

export function removeEntry(type, id) {
  const el = document.getElementById(`${type}-entry-${id}`);
  if (el) el.remove();
  updateCount(type);
}

export function updateCount(type) {
  const cards = document.getElementById(`${type}-body`).querySelectorAll('.entry-card');
  document.getElementById(`${type}-count`).textContent = `${cards.length}건`;
}

// ── SUBMIT ──

export async function submitForm(type) {
  const body = document.getElementById(`${type}-body`);
  const cards = body.querySelectorAll('.entry-card');
  const entries = [];
  let valid = true;

  cards.forEach(card => {
    const year  = card.querySelector('[data-field="year"]').value;
    const month = card.querySelector('[data-field="month"]').value;
    const day   = card.querySelector('[data-field="day"]').value;
    const dateVal = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const location = (card.querySelector('[data-field="location"]').value || '').trim();
    if (!location) {
      valid = false;
      card.querySelector('[data-field="location"]').focus();
      return;
    }
    const bank = card.querySelector('[data-field="bank"]').value || '';
    const hourVal   = card.querySelector('[data-field="hour"]').value;
    const minuteVal = card.querySelector('[data-field="minute"]').value;
    const timeVal   = hourVal !== ''
      ? `${String(hourVal).padStart(2, '0')}:${String(minuteVal).padStart(2, '0')}`
      : '';
    const entry = {
      type,
      date: dateVal,
      time: timeVal,
      location,
      bank,
      userId: state.currentUser.id,
      createdAt: new Date().toISOString(),
    };
    if (type === 'schedule') {
      entry.seller  = (card.querySelector('[data-field="seller"]').value || '').trim();
      entry.content = (card.querySelector('[data-field="content"]').value || '').trim();
    }
    entries.push(entry);
  });

  if (!valid) { showToast('⚠️ 방문지점을 입력해주세요'); return; }
  if (entries.length === 0) { showToast('⚠️ 항목을 입력해주세요'); return; }

  state.allEntries.push(...entries);
  localStorage.setItem(state.KEY, JSON.stringify(state.allEntries));
  syncToServer();

  const typeLabel = type === 'schedule' ? '일정' : '계획';
  document.getElementById('success-icon').textContent  = type === 'schedule' ? '📝' : '📅';
  document.getElementById('success-title').textContent = `${typeLabel} 등록 완료!`;
  document.getElementById('success-sub').textContent   = `총 ${entries.length}건이 기기에 저장되었습니다.`;
  document.getElementById('success-overlay').classList.add('visible');
}

export function closeSuccess() {
  document.getElementById('success-overlay').classList.remove('visible');
  goBack();
  renderCalendar();
  renderStats();
  renderRecent();
  if (state.currentTab === 'records') renderRecords();
}
