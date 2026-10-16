// 화면 전환·드로어·현재 탭 관리
import { byId, qsa, setVisible } from '../core/dom.js';
import { scrollToTop } from '../core/viewport.js';

export const TAB = { HOME: 'home', RECORDS: 'records' };

export function createNavigator() {
  let currentTab = TAB.HOME;
  let onShowRecords = () => {};
  const drawer = byId('drawer');
  const backdrop = byId('drawer-backdrop');

  function showScreen(name) {
    qsa('.screen').forEach((s) => s.classList.remove('active'));
    byId(`screen-${name}`).classList.add('active');
  }

  function showTab(tab) {
    currentTab = tab;
    Object.values(TAB).forEach((id) => byId(`drawer-${id}`)?.classList.toggle('active', id === tab));
    showScreen(tab === TAB.RECORDS ? 'records' : 'main');
    if (tab === TAB.RECORDS) onShowRecords();
  }

  const openDrawer = () => { setVisible(drawer, true, 'open'); setVisible(backdrop, true, 'open'); };
  const closeDrawer = () => { setVisible(drawer, false, 'open'); setVisible(backdrop, false, 'open'); };
  const goTab = (tab) => { closeDrawer(); showTab(tab); };

  return {
    showScreen,
    openDrawer,
    closeDrawer,
    showLogin: () => showScreen('login'),
    resetToHome: () => showTab(TAB.HOME),
    goTab,
    // 폼 화면에서 직전 탭으로 복귀
    goBack() { scrollToTop(); showTab(currentTab); },
    setOnShowRecords(fn) { onShowRecords = fn; },

    bind({ onOpenForm, onOpenUpload }) {
      qsa('.hamburger-btn').forEach((btn) => btn.addEventListener('click', openDrawer));
      backdrop.addEventListener('click', closeDrawer);
      byId('drawer').querySelector('.drawer-close').addEventListener('click', closeDrawer);
      byId('drawer-home').addEventListener('click', () => goTab(TAB.HOME));
      byId('drawer-records').addEventListener('click', () => goTab(TAB.RECORDS));
      byId('drawer-form-schedule').addEventListener('click', () => { closeDrawer(); onOpenForm('schedule'); });
      byId('drawer-form-plan').addEventListener('click', () => { closeDrawer(); onOpenForm('plan'); });
      byId('drawer-upload').addEventListener('click', () => { closeDrawer(); onOpenUpload(); });
    },
  };
}
