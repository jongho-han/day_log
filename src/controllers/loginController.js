// 로그인 화면 입력·제출
import { byId } from '../core/dom.js';

export function createLoginController({ auth, onSignedIn }) {
  const idInput = byId('login-input');
  const pwInput = byId('login-pw');
  const pwWrap = byId('login-pw-wrap');
  const errorEl = byId('login-error');

  // 관리자 사번일 때만 비밀번호 입력 노출
  function syncPasswordField() {
    const needed = auth.requiresPassword(idInput.value.trim().toUpperCase());
    pwWrap.hidden = !needed;
    if (!needed) pwInput.value = '';
  }

  async function submit() {
    errorEl.textContent = '';
    const result = await auth.login(idInput.value, pwInput.value);
    if (!result.ok) {
      errorEl.textContent = result.error;
      if (result.selectField === 'pw') pwInput.select();
      if (result.selectField === 'id') idInput.select();
      return;
    }
    await onSignedIn();
  }

  const submitOnEnter = (e) => { if (e.key === 'Enter') submit(); };

  return {
    bind() {
      idInput.addEventListener('keydown', submitOnEnter);
      idInput.addEventListener('input', syncPasswordField);
      pwInput.addEventListener('keydown', submitOnEnter);
      byId('login-btn').addEventListener('click', submit);
    },

    reset() {
      idInput.value = '';
      pwInput.value = '';
      errorEl.textContent = '';
      pwWrap.hidden = true;
    },
  };
}
