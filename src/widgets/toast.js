// 하단 토스트 메시지

export function createToast(el, duration = 2800) {
  let timer = null;
  return {
    show(message) {
      el.textContent = message;
      el.classList.add('visible');
      clearTimeout(timer);
      timer = setTimeout(() => el.classList.remove('visible'), duration);
    },
  };
}
