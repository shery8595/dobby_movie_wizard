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

    const id = (req.query.id || '').toString().trim();
    if (!id) {
      return res.status(400).json({ error: 'Missing or empty id parameter' });
    }

    const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&append_to_response=videos`;
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
    console.error('TMDB details error:', e);
    res.status(500).json({ error: 'Failed to fetch TMDB details', details: e.message });
  }
};