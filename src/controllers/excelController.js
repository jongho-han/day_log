// 엑셀 다운로드·업로드 (XLSX 는 index.html 의 CDN 전역)
import { byId, setVisible } from '../core/dom.js';
import { parseRows, toSheet } from '../domain/excelMapper.js';
import { periodKeys } from '../domain/period.js';
import { renderUploadPreview, uploadSummary } from '../widgets/uploadPreview.js';

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const LOADING_MESSAGE = '⚠️ 라이브러리 로딩 중. 잠시 후 재시도해주세요.';
const SHEET_NAME_MAX = 31;

function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 1000);
}

export function createExcelController({ auth, entries, getFiltered, toast }) {
  let pendingEntries = [];
  const overlay = byId('upload-overlay');
  const fileInput = byId('excel-upload-input');
  const preview = byId('upload-preview');
  const importBtn = byId('upload-import-btn');
  const xlsx = () => window.XLSX;

  function download() {
    const XLSX = xlsx();
    if (!XLSX) { toast.show(LOADING_MESSAGE); return; }

    const { range, items } = getFiltered();
    if (!items.length) { toast.show('⚠️ 다운로드할 데이터가 없습니다'); return; }

    const { data, cols } = toSheet(items, { admin: auth.isAdmin(), userName: auth.userName });
    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = cols;

    const { startStr, endStr } = periodKeys(range);
    const sameDay = startStr === endStr;
    const sheetLabel = sameDay ? startStr : `${startStr}~${endStr}`;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetLabel.slice(0, SHEET_NAME_MAX));

    const user = auth.currentUser;
    const filename = `BM영업일지_${user ? `${user.name}_` : ''}${sheetLabel}.xlsx`;
    saveBlob(new Blob([XLSX.write(wb, { bookType: 'xlsx', type: 'array' })], { type: XLSX_MIME }), filename);

    toast.show(`📥 ${sameDay ? startStr : `${startStr} ~ ${endStr}`} 다운로드 완료! (${items.length}건)`);
  }

  function resetUpload() {
    pendingEntries = [];
    fileInput.value = '';
  }

  function openUpload() {
    resetUpload();
    setVisible(preview, false);
    importBtn.disabled = true;
    importBtn.textContent = '가져오기';
    setVisible(overlay, true);
  }

  function closeUpload() {
    setVisible(overlay, false);
    resetUpload();
  }

  function showPreview(parsed) {
    const valid = parsed.filter((x) => !x.error);
    pendingEntries = valid;
    byId('upload-preview-count').textContent = uploadSummary(parsed.length, valid.length, parsed.length - valid.length);
    byId('upload-preview-list').innerHTML = renderUploadPreview(parsed);
    setVisible(preview, true);

    importBtn.disabled = !valid.length;
    importBtn.innerHTML = valid.length ? `<span>📥</span> ${valid.length}건 가져오기` : '가져올 유효한 데이터가 없습니다';
  }

  function readWorkbookRows(buffer) {
    const workbook = xlsx().read(new Uint8Array(buffer), { type: 'array' });
    return xlsx().utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: '' });
  }

  function handleFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (!xlsx()) { toast.show(LOADING_MESSAGE); return; }

    const reader = new FileReader();
    reader.onload = (e) => {
      let rows;
      try {
        rows = readWorkbookRows(e.target.result);
      } catch (_) {
        toast.show('⚠️ 파일을 읽을 수 없습니다');
        return;
      }
      if (!rows.length) { toast.show('⚠️ 데이터가 없습니다'); return; }
      showPreview(parseRows(rows, {
        currentUserId: auth.currentUser.id,
        admin: auth.isAdmin(),
        isKnownUser: auth.isKnownUser,
      }));
    };
    reader.readAsArrayBuffer(file);
  }

  function confirmImport() {
    if (!pendingEntries.length) return;
    const count = pendingEntries.length;
    entries.add(pendingEntries);
    closeUpload();
    toast.show(`✅ ${count}건을 가져왔습니다`);
  }

  return {
    openUpload,

    bind() {
      document.querySelector('.excel-btn').addEventListener('click', download);
      document.querySelector('.upload-btn').addEventListener('click', openUpload);
      overlay.querySelector('.upload-sheet-close').addEventListener('click', closeUpload);
      overlay.querySelector('.upload-zone').addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', handleFile);
      importBtn.addEventListener('click', confirmImport);
    },
  };
}
