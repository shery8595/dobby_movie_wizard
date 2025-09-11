module.exports = async (req, res) => {
  try {
    const apiKey = process.env.FIREWORK_API_KEY;
    const model = process.env.DOBBY_MODEL || 'accounts/sentientfoundation/models/dobby-unhinged-llama-3-3-70b-new';
    if (!apiKey) return res.status(500).json({ error: 'Missing FIREWORK_API_KEY' });

    const { prompt } = (req.method === 'POST' ? req.body : req.query) || {};
    if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

    const r = await fetch('https://api.fireworks.ai/inference/v1/chat/completions', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: 120,
        temperature: 0.7,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await r.json();
    if (!r.ok) {
      return res.status(r.status).json({ error: 'Model API error', details: data });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
};