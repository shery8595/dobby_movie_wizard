export default async function handler(req, res) {
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
      console.error('TMDB_API_KEY missing');
      return res.status(500).json({ error: 'Missing TMDB_API_KEY' });
    }

    const q = (req.query.q || '').toString().trim();
    if (!q) {
      return res.status(400).json({ error: 'Missing or empty search query parameter (q)' });
    }

    const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(q)}&language=en-US&page=1`;
    console.log('Searching TMDB for:', q);
    
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error('TMDB API error:', data);
      return res.status(response.status).json({
        error: (data && data.status_message) || 'TMDB API error',
        details: data
      });
    }

    console.log('TMDB search successful, found', data.results?.length || 0, 'results');
    res.status(200).json(data);
  } catch (error) {
    console.error('TMDB search error:', error);
    res.status(500).json({ error: 'Failed to search TMDB', details: error.message });
  }
}
