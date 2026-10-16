// 모바일 키보드·스크롤 보정

export function applyKeyboardInset() {
  const vv = window.visualViewport;
  if (!vv) return;
  const update = () => {
    const inset = Math.max(0, window.innerHeight - vv.offsetTop - vv.height);
    document.documentElement.style.setProperty('--keyboard-inset', `${inset}px`);
  };
  vv.addEventListener('resize', update, { passive: true });
  vv.addEventListener('scroll', update, { passive: true });
  update();
}

// 이미 포커스된 입력을 다시 탭할 때 폼 스크롤이 튀는 현상 방지
export function applyFormScrollLock() {
  document.addEventListener('touchstart', (e) => {
    const el = e.target;
    const isField = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA';
    if (!isField || el !== document.activeElement) return;
    const formBody = el.closest?.('.form-body');
    if (!formBody) return;
    const top = formBody.scrollTop;
    requestAnimationFrame(() => requestAnimationFrame(() => { formBody.scrollTop = top; }));
  }, { passive: true });
}

export const scrollToTop = () => window.scrollTo(0, 0);

export const scrollToBottom = () =>
  setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 50);
