// 기록 상세·편집·삭제
import { byId, setVisible } from '../core/dom.js';
import { parseDateStr } from '../core/date.js';
import { isSchedule, parseTime, typeLabel, validateEntryInput } from '../domain/entry.js';
import { formatDetailDate, renderDetailRows } from '../widgets/detailView.js';
import { bindImportanceToggle, focusLocation, readEntryFields, renderEntryFields } from '../widgets/entryFields.js';

export function createDetailController({ entries, toast }) {
  let index = null;
  const detailOverlay = byId('detail-overlay');
  const editOverlay = byId('edit-overlay');
  const confirmOverlay = byId('confirm-overlay');
  const editBody = byId('edit-sheet-body');

  function open(idx) {
    index = idx;
    const x = entries.at(idx);
    if (!x) return;
    const badge = byId('detail-badge');
    badge.textContent = typeLabel(x.type);
    badge.className = `detail-type-badge ${x.type}`;
    byId('detail-location').textContent = x.location;
    byId('detail-date').textContent = formatDetailDate(x);
    byId('detail-rows').innerHTML = renderDetailRows(x);
    setVisible(detailOverlay, true);
  }

  const closeDetail = () => setVisible(detailOverlay, false);

  function openEdit() {
    const x = entries.at(index);
    if (!x) return;
    editBody.innerHTML = renderEntryFields({
      date: parseDateStr(x.date),
      time: parseTime(x.time),
      bank: x.bank,
      importance: x.importance,
      location: x.location,
      seller: x.seller,
      content: x.content,
    }, isSchedule(x));
    setVisible(editOverlay, true);
  }

  const closeEdit = () => setVisible(editOverlay, false);

  function saveEdit() {
    if (!entries.at(index)) return;
    const values = readEntryFields(editBody);
    const error = validateEntryInput(values);
    if (error) {
      toast.show(error);
      focusLocation(editBody);
      return;
    }
    entries.update(index, values);
    closeEdit();
    open(index);
    toast.show('✅ 수정되었습니다');
  }

  async function deleteEntry() {
    if (index === null) return;
    const target = index;
    index = null;
    await entries.remove(target);
    setVisible(confirmOverlay, false);
    closeDetail();
    toast.show('🗑 삭제되었습니다');
  }

  return {
    open,

    bind() {
      bindImportanceToggle(editBody);
      detailOverlay.addEventListener('click', (e) => { if (e.target === detailOverlay) closeDetail(); });
      detailOverlay.querySelector('.detail-edit-btn').addEventListener('click', openEdit);
      detailOverlay.querySelector('.detail-delete-btn').addEventListener('click', () => setVisible(confirmOverlay, true));
      editOverlay.querySelector('.edit-sheet-close').addEventListener('click', closeEdit);
      editOverlay.querySelector('.edit-save-btn').addEventListener('click', saveEdit);
      confirmOverlay.querySelector('.confirm-btn.cancel').addEventListener('click', () => setVisible(confirmOverlay, false));
      confirmOverlay.querySelector('.confirm-btn.danger').addEventListener('click', deleteEntry);
    },
  };
}
