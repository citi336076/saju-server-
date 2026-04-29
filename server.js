const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// API 키는 환경변수에서 불러옵니다 (코드에 직접 쓰지 않아요)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-2.5-flash-preview-09-2025";

app.use(cors()); // 앱에서 이 서버로 요청을 허용
app.use(express.json({ limit: '20mb' })); // 사진 파일이 크니까 넉넉하게 설정

// 서버가 살아있는지 확인용
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: '사주 서버가 정상 작동 중입니다.' });
});

// 앱이 이 주소로 요청을 보내면, 서버가 Gemini에 전달합니다
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

// 1:1 프리미엄 질문용 엔드포인트
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
