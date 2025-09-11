export default async function handler(req, res) {
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
    
    if (!apiKey) {
      console.error('FIREWORK_API_KEY missing');
      return res.status(500).json({ error: 'Missing FIREWORK_API_KEY' });
    }

    let prompt;
    if (req.method === 'POST') {
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

    console.log('Getting recommendations for prompt:', prompt.substring(0, 100) + '...');
    
    const response = await fetch('https://api.fireworks.ai/inference/v1/chat/completions', {
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

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Fireworks API error:', data);
      return res.status(response.status).json({ 
        error: 'Model API error', 
        details: data 
      });
    }
    
    console.log('Recommendations generated successfully');
    res.status(200).json(data);
  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({ error: 'Failed to get recommendations', details: error.message });
  }
}
