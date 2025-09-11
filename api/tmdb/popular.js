export default async function handler(req, res) {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Missing TMDB_API_KEY' });
    }
    const url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=1`;
    const r = await fetch(url);
    const data = await r.json();
    if (!r.ok) {
      return res.status(r.status).json({ error: data?.status_message || 'TMDB error', details: data });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch TMDB popular' });
  }
}