// 조회 기간 선택 (시작·종료 년/월/일 셀렉트 6개)
import { byId, rangeOptionsHtml } from '../core/dom.js';
import { daysInMonth, ymdOf } from '../core/date.js';

const EDGES = ['start', 'end'];

export function createPeriodSelector() {
  const select = (edge, part) => byId(`period-${edge}-${part}`);

  // 년·월 변경 시 해당 월의 일수에 맞춰 일 목록 갱신 (선택 일 유지)
  function fillDays(edge) {
    const y = parseInt(select(edge, 'year').value, 10);
    const m = parseInt(select(edge, 'month').value, 10);
    const daySelect = select(edge, 'day');
    const maxDay = daysInMonth(y, m);
    const prevDay = parseInt(daySelect.value, 10) || 1;
    daySelect.innerHTML = rangeOptionsHtml(1, maxDay, Math.min(prevDay, maxDay), '일');
  }

  function setEdge(edge, { year, month, day }) {
    select(edge, 'year').value = year;
    select(edge, 'month').value = month;
    fillDays(edge);
    select(edge, 'day').value = day;
  }

  function readEdge(edge, fallback) {
    const num = (part, def) => parseInt(select(edge, part)?.value || def, 10);
    return { year: num('year', fallback.year), month: num('month', fallback.month), day: num('day', fallback.day) };
  }

  return {
    bind() {
      EDGES.forEach((edge) => ['year', 'month'].forEach((part) => {
        select(edge, part).addEventListener('change', () => fillDays(edge));
      }));
    },

    // 오늘 기준으로 옵션을 다시 채움 (재로그인 시 중복 방지)
    reset(today) {
      const t = ymdOf(today);
      EDGES.forEach((edge) => {
        select(edge, 'year').innerHTML = rangeOptionsHtml(t.year - 4, t.year + 1, t.year, '년');
        select(edge, 'month').innerHTML = rangeOptionsHtml(1, 12, t.month, '월');
        select(edge, 'day').innerHTML = '';
        setEdge(edge, t);
      });
    },

    setRange({ start, end }) {
      setEdge('start', start);
      setEdge('end', end);
    },

    getRange(today) {
      const t = ymdOf(today);
      return {
        start: readEdge('start', { year: t.year, month: t.month, day: 1 }),
        end: readEdge('end', { year: t.year, month: t.month, day: 31 }),
      };
    },
  };
}
