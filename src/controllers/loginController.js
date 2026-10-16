// 로그인 화면 입력·제출
import { byId } from '../core/dom.js';

export function createLoginController({ auth, onSignedIn }) {
  const idInput = byId('login-input');
  const pwInput = byId('login-pw');
  const errorEl = byId('login-error');

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
      pwInput.addEventListener('keydown', submitOnEnter);
      byId('login-btn').addEventListener('click', submit);
    },

    reset() {
      idInput.value = '';
      pwInput.value = '';
      errorEl.textContent = '';
    },
  };
}
