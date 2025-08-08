import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { prompt, mode } = req.body;
  const providers = [
    { name: 'groq',    url: 'https://api.groq.com/openai/v1/chat/completions',   key: process.env.GROQ_API_KEY },
    { name: 'openrouter', url: 'https://openrouter.ai/api/v1/chat/completions', key: process.env.OPENROUTER_API_KEY },
    { name: 'google',  url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${process.env.GOOGLE_API_KEY}` }
  ];

  for (const p of providers) {
    if (!p.key) continue;
    try {
      const body = p.name === 'google'
        ? { model: 'gemini-1.5-pro', prompt: { text: prompt, mode } }
        : { model: p.name==='groq'?'llama3-70b-8192':'meta-llama/llama-3.1-8b-instruct:free', messages: [{ role: 'user', content: prompt + ` (${mode})` }] };

      const r = await fetch(p.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(p.name!=='google' && { Authorization: `Bearer ${p.key}` })
        },
        body: JSON.stringify(body)
      });
      if (!r.ok) throw new Error(await r.text());
      const json = await r.json();
      const content = p.name==='google'
        ? json.candidates[0].content
        : json.choices.message.content;
      return res.status(200).json({ provider: p.name, text: content });
    } catch (e) {
      console.warn(`Failed ${p.name}:`, e.message);
    }
  }
  res.status(502).json({ error: 'All providers failed' });
}
