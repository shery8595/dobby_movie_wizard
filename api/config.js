// API route to serve environment variables securely
export default function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Return environment variables (server-side only)
  res.status(200).json({
    TMDB_API_KEY: process.env.VITE_TMDB_API_KEY,
    FIREWORK_API_KEY: process.env.VITE_FIREWORK_API_KEY,
    DOBBY_MODEL: process.env.VITE_DOBBY_MODEL
  });
}
