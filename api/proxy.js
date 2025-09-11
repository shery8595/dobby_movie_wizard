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

    const method = req.method || 'POST';
    if (method !== 'POST' && method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed. Use GET or POST.' });
    }

    const API_KEY = process.env.FIREWORK_API_KEY || process.env.API_KEY;
    if (!API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Normalize input body
    let bodyObj;
    if (method === 'POST') {
      bodyObj = req.body;
      // In Vercel, body is already parsed if Content-Type is application/json
      if (typeof bodyObj === 'string') {
        try {
          bodyObj = JSON.parse(bodyObj);
        } catch (e) {
          return res.status(400).json({ error: 'Invalid JSON body', details: e.message });
        }
      }
      if (!bodyObj || typeof bodyObj !== 'object') {
        return res.status(400).json({ error: 'Missing or invalid JSON body' });
      }
    } else {
      // GET fallback for testing
      const prompt = (req.query && req.query.prompt) || '';
      if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
        return res.status(400).json({ error: 'Missing or empty prompt parameter' });
      }
      bodyObj = {
        model: process.env.DOBBY_MODEL || 'accounts/sentientfoundation/models/dobby-unhinged-llama-3-3-70b-new',
        max_tokens: 120,
        temperature: 0.7,
        messages: [{ role: 'user', content: prompt }]
      };
    }

    const response = await fetch('https://api.fireworks.ai/inference/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(bodyObj)
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: (data && (data.error?.message || data.message)) || 'API error', details: data });
    }
    res.status(200).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};