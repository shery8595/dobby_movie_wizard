module.exports = async (req, res) => {
  try {
    // Accept POST (preferred). For GET, allow ?prompt=... for debugging.
    const method = req.method || 'POST';
    if (method !== 'POST' && method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const API_KEY = process.env.FIREWORK_API_KEY || process.env.API_KEY;
    if (!API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Normalize input body
    let bodyObj;
    if (method === 'POST') {
      bodyObj = req.body;
      // If body is a string, try to parse it
      if (typeof bodyObj === 'string') {
        try { bodyObj = JSON.parse(bodyObj); } catch (e) { return res.status(400).json({ error: 'Invalid JSON body' }); }
      }
      if (!bodyObj || typeof bodyObj !== 'object') {
        return res.status(400).json({ error: 'Missing JSON body' });
      }
    } else {
      // GET fallback for testing
      const prompt = (req.query && req.query.prompt) || '';
      if (!prompt) return res.status(400).json({ error: 'Missing prompt' });
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
