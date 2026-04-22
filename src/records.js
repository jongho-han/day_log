import { state, today, isAdmin } from './state.js';
import { esc, DAY_NAMES } from './utils.js';

// ── STATS & RECENT (home screen) ──

export function renderStats() {
  const scheds = state.allEntries.filter(e =>
    e.type === 'schedule' &&
    new Date(e.date).getMonth() === state.calMonth &&
    new Date(e.date).getFullYear() === state.calYear
  );
  const plans = state.allEntries.filter(e =>
    e.type === 'plan' &&
    new Date(e.date).getMonth() === state.calMonth &&
    new Date(e.date).getFullYear() === state.calYear
  );
  document.getElementById('stat-schedule').textContent = scheds.length;
  document.getElementById('stat-plan').textContent = plans.length;
}

export function renderRecent() {
  const list = document.getElementById('recent-list');
  const recent = state.allEntries.map((e, i) => ({ e, i })).reverse().slice(0, 6);
  if (recent.length === 0) {
    list.innerHTML = '<div class="empty-state">아직 기록된 내용이 없습니다</div>';
    return;
  }
  list.innerHTML = recent.map(({ e, i }) => {
    const typeLabel = e.type === 'schedule' ? '일정' : '계획';
    const timeDisp = e.time ? ` · ${e.time}` : '';
    const meta = e.type === 'schedule'
      ? `${e.date}${timeDisp}${e.seller ? ' · ' + e.seller : ''}`
      : `${e.date}${timeDisp}`;
    return `<div class="recent-item" data-idx="${i}" style="cursor:pointer">
      <div class="recent-dot ${e.type}"></div>
      <div class="recent-info">
        <div class="recent-location">${esc(e.location)}</div>
        <div class="recent-meta">${esc(meta)}</div>
      </div>
      <span class="recent-type ${e.type}">${typeLabel}</span>
    </div>`;
  }).join('');
}

// ── PERIOD SELECTORS ──

export function initPeriodSelectors() {
  const curY = today.getFullYear();
  const curM = today.getMonth() + 1;
  const curD = today.getDate();

  ['period-start-year', 'period-end-year'].forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    for (let y = curY - 4; y <= curY + 1; y++) {
      const o = document.createElement('option');
      o.value = y; o.textContent = y + '년';
      if (y === curY) o.selected = true;
      sel.appendChild(o);
    }
    sel.addEventListener('change', () => {
      syncDayOpts(id.includes('start') ? 'start' : 'end');
    });
  });

  ['period-start-month', 'period-end-month'].forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    for (let m = 1; m <= 12; m++) {
      const o = document.createElement('option');
      o.value = m; o.textContent = m + '월';
      if (m === curM) o.selected = true;
      sel.appendChild(o);
    }
    sel.addEventListener('change', () => {
      syncDayOpts(id.includes('start') ? 'start' : 'end');
    });
  });

  syncDayOpts('start');
  syncDayOpts('end');

  document.getElementById('period-start-year').value = curY;
  document.getElementById('period-start-month').value = curM;
  syncDayOpts('start');
  document.getElementById('period-start-day').value = curD;
  document.getElementById('period-end-year').value = curY;
  document.getElementById('period-end-month').value = curM;
  syncDayOpts('end');
  document.getElementById('period-end-day').value = curD;
}

export function syncDayOpts(prefix) {
  const ySel = document.getElementById(`period-${prefix}-year`);
  const mSel = document.getElementById(`period-${prefix}-month`);
  const dSel = document.getElementById(`period-${prefix}-day`);
  if (!ySel || !mSel || !dSel) return;
  const y = parseInt(ySel.value);
  const m = parseInt(mSel.value);
  const maxDay = new Date(y, m, 0).getDate();
  const prevDay = parseInt(dSel.value) || 1;
  dSel.innerHTML = '';
  for (let d = 1; d <= maxDay; d++) {
    const o = document.createElement('option');
    o.value = d; o.textContent = d + '일';
    if (d === Math.min(prevDay, maxDay)) o.selected = true;
    dSel.appendChild(o);
  }
}

export function setQuickPeriod(btn, type) {
  const curY = today.getFullYear();
  const curM = today.getMonth() + 1;
  const curD = today.getDate();
  let sy, sm, sd, ey, em, ed;

  if (type === 'today') {
    sy = curY; sm = curM; sd = curD; ey = curY; em = curM; ed = curD;
  } else if (type === 'this-month') {
    sy = curY; sm = curM; sd = 1; ey = curY; em = curM; ed = new Date(curY, curM, 0).getDate();
  } else if (type === 'last-month') {
    const t = new Date(curY, curM - 2, 1);
    sy = t.getFullYear(); sm = t.getMonth() + 1; sd = 1;
    ey = sy; em = sm; ed = new Date(sy, sm, 0).getDate();
  } else if (type === '3-months') {
    const t = new Date(curY, curM - 3, 1);
    sy = t.getFullYear(); sm = t.getMonth() + 1; sd = 1;
    ey = curY; em = curM; ed = new Date(curY, curM, 0).getDate();
  } else if (type === 'this-year') {
    sy = curY; sm = 1; sd = 1; ey = curY; em = 12; ed = 31;
  }

  document.getElementById('period-start-year').value = sy;
  document.getElementById('period-start-month').value = sm;
  syncDayOpts('start');
  document.getElementById('period-start-day').value = sd;
  document.getElementById('period-end-year').value = ey;
  document.getElementById('period-end-month').value = em;
  syncDayOpts('end');
  document.getElementById('period-end-day').value = ed;

  document.querySelectorAll('.period-quick-btn').forEach(b => b.classList.remove('active-quick'));
  if (btn) btn.classList.add('active-quick');
  renderRecords();
}

// ── FILTER ──

export function setFilter(f) {
  state.currentFilter = f;
  document.querySelectorAll('.filter-chip').forEach(c => {
    c.classList.toggle('active', c.dataset.filter === f);
  });
  renderRecords();
}

// ── FILTERED ENTRIES ──

export function getFilteredEntries() {
  const sy = parseInt(document.getElementById('period-start-year')?.value || today.getFullYear());
  const sm = parseInt(document.getElementById('period-start-month')?.value || (today.getMonth() + 1));
  const sd = parseInt(document.getElementById('period-start-day')?.value || 1);
  const ey = parseInt(document.getElementById('period-end-year')?.value || today.getFullYear());
  const em = parseInt(document.getElementById('period-end-month')?.value || (today.getMonth() + 1));
  const ed = parseInt(document.getElementById('period-end-day')?.value || 31);

  const s = `${sy}-${String(sm).padStart(2, '0')}-${String(sd).padStart(2, '0')}`;
  const e = `${ey}-${String(em).padStart(2, '0')}-${String(ed).padStart(2, '0')}`;

  let entries = state.allEntries.filter(x => x.date >= s && x.date <= e);
  if (state.currentFilter !== 'all') entries = entries.filter(x => x.type === state.currentFilter);
  return { entries, startStr: s, endStr: e, sy, sm, sd, ey, em, ed };
}

// ── RENDER RECORDS ──

export function renderRecords() {
  const body = document.getElementById('records-body');
  const summary = document.getElementById('records-summary');
  const { entries, startStr: s, endStr: e, sy, sm, sd, ey, em, ed } = getFilteredEntries();

  const schedCount = entries.filter(x => x.type === 'schedule').length;
  const planCount = entries.filter(x => x.type === 'plan').length;

  if (summary) {
    if (entries.length === 0) {
      summary.innerHTML = '';
    } else {
      const label = s === e
        ? `${sy}년 ${sm}월 ${sd}일`
        : `${sy}년 ${sm}월 ${sd}일 ~ ${ey}년 ${em}월 ${ed}일`;
      summary.innerHTML = `<strong>${label}</strong> &nbsp;·&nbsp; ` +
        `<span class="sum-sched">일정 ${schedCount}건</span> &nbsp;·&nbsp; ` +
        `<span class="sum-plan">계획 ${planCount}건</span> &nbsp;·&nbsp; 총 ${entries.length}건`;
    }
  }

  if (entries.length === 0) {
    const label = s === e
      ? `${sy}년 ${sm}월 ${sd}일`
      : `${sy}년 ${sm}월 ${sd}일 ~ ${ey}년 ${em}월 ${ed}일`;
    body.innerHTML = `<div class="records-empty"><div class="records-empty-icon">📭</div><div>${label} 기록이 없습니다</div></div>`;
    return;
  }

  const groups = {};
  entries.forEach(x => {
    if (!groups[x.date]) groups[x.date] = [];
    groups[x.date].push(x);
  });

  let html = '';
  Object.keys(groups).sort().reverse().forEach(date => {
    const d = new Date(date + 'T00:00:00');
    const [y, mo, da] = date.split('-');
    const titleStr = `${y}년 ${parseInt(mo)}월 ${parseInt(da)}일 (${DAY_NAMES[d.getDay()]})`;
    const cnt = groups[date].length;
    const cards = groups[date].map(x => {
      const idx = state.allEntries.indexOf(x);
      const typeLabel = x.type === 'schedule' ? '일정' : '계획';
      const metaParts = [];
      if (x.time) metaParts.push(x.time);
      if (x.type === 'schedule' && x.seller) metaParts.push(x.seller);
      if (x.bank) metaParts.push(x.bank);
      const meta = metaParts.join(' · ');
      const impTag = x.importance
        ? `<span class="imp-tag imp-tag-${x.importance}">${x.importance}</span>` : '';
      const preview = (x.type === 'schedule' && x.content)
        ? `<div class="record-content-preview">${esc(x.content)}</div>` : '';
      const userInfo = isAdmin() && x.userId
        ? `<div class="record-user-info">👤 ${esc(x.userId)} · ${esc(state.ALLOWED_USERS[x.userId] || '알수없음')}</div>` : '';
      return `<div class="record-card" data-idx="${idx}">
        <div class="record-type-dot ${x.type}"></div>
        <div class="record-card-info">
          <div class="record-location">${esc(x.location)}${impTag}</div>
          ${meta ? `<div class="record-meta">${esc(meta)}</div>` : ''}
          ${userInfo}${preview}
        </div>
        <span class="record-badge ${x.type}">${typeLabel}</span>
      </div>`;
    }).join('');
    html += `<div class="records-date-group">
      <div class="records-date-header">
        <span class="records-date-title">${titleStr}</span>
        <span class="records-date-count">${cnt}건</span>
      </div>${cards}
    </div>`;
  });
  body.innerHTML = html;
}
