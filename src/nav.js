import { state } from './state.js';
import { closeDrawer } from './ui.js';
import { renderRecords } from './records.js';

export function goBack() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  window.scrollTo(0, 0);
  if (state.currentTab === 'records') {
    document.getElementById('screen-records').classList.add('active');
    renderRecords();
  } else {
    document.getElementById('screen-main').classList.add('active');
  }
}

export function drawerNav(tab) {
  closeDrawer();
  state.currentTab = tab;
  ['home', 'records'].forEach(id => {
    const el = document.getElementById('drawer-' + id);
    if (el) el.classList.toggle('active', id === tab);
  });
  ['screen-main', 'screen-records', 'screen-schedule', 'screen-plan'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  });
  if (tab === 'home') {
    document.getElementById('screen-main').classList.add('active');
  } else if (tab === 'records') {
    document.getElementById('screen-records').classList.add('active');
    renderRecords();
  }
}
