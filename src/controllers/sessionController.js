// 앱 시작·로그인 후 메인 진입·로그아웃
import { byId } from '../core/dom.js';
import { formatDotDate, ymdOf } from '../core/date.js';

const REGISTER_MENU_IDS = ['drawer-reg-divider', 'drawer-reg-section', 'drawer-form-schedule', 'drawer-form-plan'];

function greetingFor(hour) {
  if (hour < 12) return '좋은 아침입니다';
  if (hour < 18) return '오늘도 수고하세요';
  return '오늘 하루도 고생하셨습니다';
}

export function createSessionController({ auth, entries, nav, home, records, login, today }) {
  const app = byId('app');

  function renderUser() {
    const user = auth.currentUser;
    byId('greeting-title').textContent = `${user.name}님, ${greetingFor(today.getHours())}`;
    byId('drawer-username').textContent = auth.isAdmin() ? '관리자' : user.name;
  }

  // 관리자는 등록 메뉴 숨김 (조회 전용)
  function enterMain() {
    const admin = auth.isAdmin();
    app.classList.toggle('admin-mode', admin);
    REGISTER_MENU_IDS.forEach((id) => byId(id)?.classList.toggle('hidden', admin));
    nav.resetToHome();
    byId('today-str').textContent = formatDotDate(ymdOf(today));
    renderUser();
    home.render();
    records.reset();
  }

  async function signIn() {
    await entries.load();
    enterMain();
  }

  function logout() {
    auth.logout();
    entries.clear();
    nav.closeDrawer();
    app.classList.remove('admin-mode');
    nav.showLogin();
    login.reset();
  }

  return {
    signIn,

    async boot() {
      await auth.loadMembers();
      if (auth.restoreSession()) await signIn();
    },

    bind() {
      app.querySelector('.drawer-logout-btn').addEventListener('click', logout);
    },
  };
}
