import { state } from './state.js';
import { init, doLogin, onLoginInput, logout } from './auth.js';
import { openDrawer, closeDrawer, closeSheet } from './ui.js';
import { drawerNav, goBack } from './nav.js';
import { changeMonth } from './calendar.js';
import {
  openForm, submitForm, closeSuccess, removeEntry,
} from './form.js';
import {
  setQuickPeriod, setFilter, renderRecords,
} from './records.js';
import {
  openDetail, closeDetail, openEdit, closeEdit, saveEdit,
  confirmDelete, closeConfirm, doDelete,
} from './detail.js';
import {
  downloadExcel, openUpload, closeUpload, triggerUploadInput,
  handleExcelUpload, confirmImport,
} from './excel.js';

// ── EVENT REGISTRATION ──

function wire() {
  // Login
  const loginInput = document.getElementById('login-input');
  loginInput.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  loginInput.addEventListener('input', onLoginInput);
  document.getElementById('login-pw').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  document.getElementById('login-btn').addEventListener('click', doLogin);

  // Calendar navigation
  document.getElementById('cal-prev').addEventListener('click', () => changeMonth(-1));
  document.getElementById('cal-next').addEventListener('click', () => changeMonth(1));

  // Home action buttons
  document.getElementById('home-btn-schedule').addEventListener('click', () => openForm('schedule', null));
  document.getElementById('home-btn-plan').addEventListener('click', () => openForm('plan', null));

  // Recent list — event delegation
  document.getElementById('recent-list').addEventListener('click', e => {
    const item = e.target.closest('.recent-item');
    if (item) openDetail(parseInt(item.dataset.idx));
  });

  // Form screens
  document.getElementById('schedule-back').addEventListener('click', goBack);
  document.getElementById('plan-back').addEventListener('click', goBack);
  document.getElementById('schedule-submit').addEventListener('click', () => submitForm('schedule'));
  document.getElementById('plan-submit').addEventListener('click', () => submitForm('plan'));

  // Form body — event delegation for remove buttons
  ['schedule', 'plan'].forEach(type => {
    document.getElementById(`${type}-body`).addEventListener('click', e => {
      const btn = e.target.closest('.entry-remove-btn');
      if (btn) removeEntry(btn.dataset.type, parseInt(btn.dataset.id));
    });
  });

  // Hamburger buttons
  document.querySelectorAll('.hamburger-btn').forEach(btn => {
    btn.addEventListener('click', openDrawer);
  });

  // Drawer
  document.getElementById('drawer-backdrop').addEventListener('click', closeDrawer);
  document.querySelector('.drawer-close').addEventListener('click', closeDrawer);
  document.getElementById('drawer-home').addEventListener('click', () => drawerNav('home'));
  document.getElementById('drawer-records').addEventListener('click', () => drawerNav('records'));
  document.getElementById('drawer-form-schedule').addEventListener('click', () => {
    closeDrawer(); openForm('schedule', null);
  });
  document.getElementById('drawer-form-plan').addEventListener('click', () => {
    closeDrawer(); openForm('plan', null);
  });
  document.getElementById('drawer-upload').addEventListener('click', () => {
    closeDrawer(); openUpload();
  });
  document.querySelector('.drawer-logout-btn').addEventListener('click', logout);

  // Records screen — period quick buttons (event delegation)
  document.querySelector('.period-actions').addEventListener('click', e => {
    const btn = e.target.closest('.period-quick-btn');
    if (btn) setQuickPeriod(btn, btn.dataset.period);
    if (e.target.classList.contains('period-search-btn')) renderRecords();
  });

  // Filter chips (event delegation)
  document.querySelector('.filter-chips-wrap').addEventListener('click', e => {
    const chip = e.target.closest('.filter-chip');
    if (chip) setFilter(chip.dataset.filter);
  });

  document.querySelector('.excel-btn').addEventListener('click', downloadExcel);
  document.querySelector('.upload-btn').addEventListener('click', openUpload);

  // Records body — event delegation for record cards
  document.getElementById('records-body').addEventListener('click', e => {
    const card = e.target.closest('.record-card');
    if (card) openDetail(parseInt(card.dataset.idx));
  });

  // Detail overlay
  document.getElementById('detail-overlay').addEventListener('click', closeDetail);
  document.querySelector('.detail-edit-btn').addEventListener('click', openEdit);
  document.querySelector('.detail-delete-btn').addEventListener('click', confirmDelete);

  // Edit overlay
  document.querySelector('.edit-sheet-close').addEventListener('click', closeEdit);
  document.querySelector('.edit-save-btn').addEventListener('click', saveEdit);

  // Confirm delete
  document.querySelector('.confirm-btn.cancel').addEventListener('click', closeConfirm);
  document.querySelector('.confirm-btn.danger').addEventListener('click', doDelete);

  // Bottom sheet
  document.getElementById('sheet-backdrop').addEventListener('click', closeSheet);
  document.querySelector('.opt-schedule').addEventListener('click', () => {
    closeSheet(); openForm('schedule', state.selectedDate);
  });
  document.querySelector('.opt-plan').addEventListener('click', () => {
    closeSheet(); openForm('plan', state.selectedDate);
  });
  document.querySelector('.sheet-cancel-btn').addEventListener('click', closeSheet);

  // Success overlay
  document.querySelector('.success-close-btn').addEventListener('click', closeSuccess);

  // Excel upload overlay
  document.querySelector('.upload-sheet-close').addEventListener('click', closeUpload);
  document.querySelector('.upload-zone').addEventListener('click', triggerUploadInput);
  document.getElementById('excel-upload-input').addEventListener('change', handleExcelUpload);
  document.getElementById('upload-import-btn').addEventListener('click', confirmImport);
}

// ── KEYBOARD / VISUAL VIEWPORT FIX ──

function applyKeyboardFix() {
  if (!window.visualViewport) return;
  function updateKeyboardInset() {
    const kb = Math.max(0, window.innerHeight - window.visualViewport.offsetTop - window.visualViewport.height);
    document.documentElement.style.setProperty('--keyboard-inset', kb + 'px');
  }
  window.visualViewport.addEventListener('resize', updateKeyboardInset, { passive: true });
  window.visualViewport.addEventListener('scroll', updateKeyboardInset, { passive: true });
  updateKeyboardInset();
}

function applyScrollLock() {
  document.addEventListener('touchstart', e => {
    const el = e.target;
    if ((el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') && el === document.activeElement) {
      const fb = el.closest?.('.form-body');
      if (!fb) return;
      const st = fb.scrollTop;
      requestAnimationFrame(() => requestAnimationFrame(() => { fb.scrollTop = st; }));
    }
  }, { passive: true });
}

// ── BOOT ──

wire();
applyKeyboardFix();
applyScrollLock();
init();
