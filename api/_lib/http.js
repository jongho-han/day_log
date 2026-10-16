// 서버리스 핸들러 공통: CORS·메서드 분기

function withCors(methods, handlers) {
  return async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', [...methods, 'OPTIONS'].join(', '));
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    const route = handlers[req.method];
    if (!route) return res.status(405).json({ error: 'Method not allowed' });
    return route(req, res);
  };
}

module.exports = { withCors };
