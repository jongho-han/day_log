// 일정·계획 등록 폼 (여러 항목 카드 일괄 등록)
import { byId, qs, qsa, setVisible } from '../core/dom.js';
import { ymdOf } from '../core/date.js';
import { scrollToBottom, scrollToTop } from '../core/viewport.js';
import { ENTRY_TYPE, createEntry, isSchedule, typeLabel, validateEntryInput } from '../domain/entry.js';
import { ADD_ENTRY_BUTTON_HTML, entryCardId, renderEntryCard } from '../widgets/entryCard.js';
import { bindImportanceToggle, focusLocation, readEntryDate, readEntryFields } from '../widgets/entryFields.js';

const TYPES = [ENTRY_TYPE.SCHEDULE, ENTRY_TYPE.PLAN];

export function createFormController({ entries, auth, nav, toast, today }) {
  const cardCounter = { schedule: 0, plan: 0 };
  const bodyOf = (type) => byId(`${type}-body`);
  const cardsOf = (type) => qsa('.entry-card', bodyOf(type));
  const successOverlay = byId('success-overlay');

  function updateCount(type) {
    byId(`${type}-count`).textContent = `${cardsOf(type).length}건`;
  }

  function addCard(type, date) {
    const body = bodyOf(type);
    const index = ++cardCounter[type];
    qs('.add-entry-btn', body)?.remove();
    body.insertAdjacentHTML('beforeend',
      renderEntryCard({ type, index, date: date || ymdOf(today) }) + ADD_ENTRY_BUTTON_HTML);
    updateCount(type);
    scrollToBottom();
  }

  // 추가 카드는 첫 카드의 날짜를 기본값으로 사용
  function addCardFromFirst(type) {
    const first = cardsOf(type)[0];
    addCard(type, first ? readEntryDate(first) : null);
  }

  function removeCard(type, index) {
    byId(entryCardId(type, index))?.remove();
    updateCount(type);
  }

  function open(type, date) {
    nav.showScreen(type);
    scrollToTop();
    cardCounter[type] = 0;
    bodyOf(type).innerHTML = '';
    addCard(type, date);
  }

  function showSuccess(type, count) {
    byId('success-icon').textContent = isSchedule(type) ? '📝' : '📅';
    byId('success-title').textContent = `${typeLabel(type)} 등록 완료!`;
    byId('success-sub').textContent = `총 ${count}건이 기기에 저장되었습니다.`;
    setVisible(successOverlay, true);
  }

  function submit(type) {
    const newEntries = [];
    for (const card of cardsOf(type)) {
      const values = readEntryFields(card);
      const error = validateEntryInput(values);
      if (error) {
        focusLocation(card);
        toast.show(error);
        return;
      }
      newEntries.push(createEntry({ ...values, type, userId: auth.currentUser.id }));
    }
    if (!newEntries.length) {
      toast.show('⚠️ 항목을 입력해주세요');
      return;
    }
    entries.add(newEntries);
    showSuccess(type, newEntries.length);
  }

  function closeSuccess() {
    setVisible(successOverlay, false);
    nav.goBack();
  }

  return {
    open,

    bind() {
      TYPES.forEach((type) => {
        const body = bodyOf(type);
        bindImportanceToggle(body);
        body.addEventListener('click', (e) => {
          const removeBtn = e.target.closest('.entry-remove-btn');
          if (removeBtn) removeCard(type, parseInt(removeBtn.dataset.id, 10));
          if (e.target.closest('.add-entry-btn')) addCardFromFirst(type);
        });
        byId(`${type}-back`).addEventListener('click', () => nav.goBack());
        byId(`${type}-submit`).addEventListener('click', () => submit(type));
      });
      successOverlay.querySelector('.success-close-btn').addEventListener('click', closeSuccess);
    },
  };
}
