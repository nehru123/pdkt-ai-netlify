import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/stream-carousel', async (req, res) => {
  const { topic } = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const stream = await openai.chat.completions.create({
    model: 'gpt-4o',
    stream: true,
    messages: [
      { role: 'system', content: 'Kamu adalah ahli copywriting dan konten karousel viral untuk topik PDKT dan cara mendekati wanita. Format output: Slide 1 = hook kontroversial, Slide 2–4 = value edukatif & relate, Slide 5 = CTA untuk beli produk digital (eBook, mentoring).' },
      { role: 'user', content: `Topik: ${topic}` },
    ],
    temperature: 0.85,
  });

  for await (const chunk of stream) {
    const content = chunk.choices?.[0]?.delta?.content;
    if (content) {
      res.write(`data: ${content}\n\n`);
    }
  }

  res.write('data: [DONE]\n\n');
  res.end();
});

app.listen(3000, () => console.log('✅ Server aktif di http://localhost:3000'));