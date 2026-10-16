// fetch JSON 래퍼. 네트워크 오류는 throw, HTTP 오류는 ok=false 로 반환

export function createHttpClient(fetchFn = window.fetch.bind(window)) {
  async function request(url, { method = 'GET', body } = {}) {
    const res = await fetchFn(url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    let data = null;
    try { data = await res.json(); } catch (_) { /* 본문 없음 */ }
    return { ok: res.ok, status: res.status, data };
  }

  return {
    get: (url) => request(url),
    post: (url, body) => request(url, { method: 'POST', body }),
    put: (url, body) => request(url, { method: 'PUT', body }),
  };
}
