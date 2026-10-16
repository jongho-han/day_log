// 로컬 개발용 API 서버: 운영(Vercel)과 같은 api/ 핸들러를 그대로 사용
require('dotenv').config({ path: '.env.local' });
const express = require('express');

const PORT = 3001;
const app = express();
app.use(express.json({ limit: '10mb' }));

app.all('/api/members', require('./api/members'));
app.all('/api/entries', require('./api/entries'));

app.listen(PORT, () => {
  console.log(`API server: http://localhost:${PORT}`);
});
