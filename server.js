import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const DOBBY_API_KEY = process.env.DOBBY_API_KEY; // Fireworks AI key
const TMDB_API_KEY = process.env.TMDB_API_KEY;   // TMDb API key

// POST route
app.post("/recommend", async (req, res) => {
  try {
    const { occasion, mood, genre, age, audience } = req.body;

    // Build a natural prompt from user-selected options
    const prompt = `Recommend 5 movies for the following preferences:
    Occasion: ${occasion}
    Mood: ${mood}
    Genre: ${genre}
    Movie Age: ${age}
    Audience: ${audience}
    Return only movie names.`;

    // Call Dobby
    const dobbyResponse = await fetch("https://api.fireworks.ai/inference/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${DOBBY_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "accounts/sentientfoundation/models/dobby-unhinged-llama-3-3-70b-new",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200
      })
    });

    const dobbyData = await dobbyResponse.json();
    const textOutput = dobbyData.choices[0].message.content;

    // Extract movie titles (split by line or comma)
    const movies = textOutput
      .split("\n")
      .map(line => line.replace(/^\d+\.\s*/, "").trim())
      .filter(line => line.length > 0);

    // Fetch movie details from TMDb
    const movieDetails = [];
    for (const title of movies) {
      const searchRes = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}`
      );
      const searchData = await searchRes.json();
      if (searchData.results && searchData.results.length > 0) {
        const movie = searchData.results[0];
        movieDetails.push({
          title: movie.title,
          poster: movie.poster_path,
          rating: movie.vote_average,
          release_date: movie.release_date
        });
      }
    }

    res.json(movieDetails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(3000, () => console.log("🚀 Server running at http://localhost:3000"));
