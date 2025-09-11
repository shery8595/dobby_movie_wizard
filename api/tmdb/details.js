export default async function handler(req, res) {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Missing TMDB_API_KEY' });
    }
    const id = (req.query.id || '').toString();
    if (!id) return res.status(400).json({ error: 'Missing id' });
    const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&append_to_response=videos`;
    const r = await fetch(url);
    const data = await r.json();
    if (!r.ok) {
      return res.status(r.status).json({ error: data?.status_message || 'TMDB error', details: data });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch TMDB details' });
  }
}