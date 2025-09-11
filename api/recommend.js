module.exports = async (req, res) => {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    const apiKey = process.env.FIREWORK_API_KEY;
    const model = process.env.DOBBY_MODEL || 'accounts/sentientfoundation/models/dobby-unhinged-llama-3-3-70b-new';
    if (!apiKey) return res.status(500).json({ error: 'Missing FIREWORK_API_KEY' });

    let prompt;
    if (req.method === 'POST') {
      // In Vercel, body is already parsed if Content-Type is application/json
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch (e) {
          return res.status(400).json({ error: 'Invalid JSON body', details: e.message });
        }
      }
      if (!body || typeof body !== 'object') {
        return res.status(400).json({ error: 'Missing or invalid JSON body' });
      }
      prompt = body.prompt;
    } else if (req.method === 'GET') {
      prompt = (req.query && req.query.prompt) || '';
    } else {
      return res.status(405).json({ error: 'Method not allowed. Use GET or POST.' });
    }

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'Missing or empty prompt parameter' });
    }

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