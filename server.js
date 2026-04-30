const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-2.0-flash";

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json({ limit: '20mb' }));

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: '사주 서버가 정상 작동 중입니다.' });
});

app.post('/api/fortune', async (req, res) => {
  try {
    const { contents, systemInstruction, generationConfig } = req.body;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents, systemInstruction, generationConfig }),
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API 오류:', errorText);
      return res.status(500).json({ error: 'Gemini API 호출 실패' });
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('서버 오류:', error);
    res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
  }
});

app.post('/api/ask', async (req, res) => {
  try {
    const { contents } = req.body;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents }),
      }
    );
    if (!response.ok) {
      return res.status(500).json({ error: 'Gemini API 호출 실패' });
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('서버 오류:', error);
    res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ 사주 서버 실행 중: http://localhost:${PORT}`);
});