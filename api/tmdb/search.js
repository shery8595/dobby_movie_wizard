module.exports = async (req, res) => {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed. Use GET.' });
    }

    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Missing TMDB_API_KEY' });
    }

    const q = (req.query.q || '').toString().trim();
    if (!q) {
      return res.status(400).json({ error: 'Missing or empty search query parameter (q)' });
    }

    const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(q)}&language=en-US&page=1`;
    const r = await fetch(url);
    const data = await r.json();

    if (!r.ok) {
      return res.status(r.status).json({
        error: (data && data.status_message) || 'TMDB API error',
        details: data
      });
    }

    res.status(200).json(data);
  } catch (e) {
    console.error('TMDB search error:', e);
    res.status(500).json({ error: 'Failed to search TMDB', details: e.message });
  }
};