# Dobby Movie Wizard

AI-powered movie recommendation wizard built with Vercel.

## Features

- Interactive movie recommendation wizard
- AI-powered suggestions using Fireworks AI
- Movie database integration with TMDB
- Trending movies display
- Watchlist functionality
- Responsive design

## Environment Variables

This project uses Vercel environment variables for API keys. You need to set up the following environment variables in your Vercel project:

### Required Environment Variables

1. **TMDB_API_KEY** - The Movie Database API key
   - Get it from: https://www.themoviedb.org/settings/api
   - Used for fetching movie data and posters

2. **FIREWORK_API_KEY** - Fireworks AI API key
   - Get it from: https://fireworks.ai/
   - Used for AI-powered movie recommendations

3. **DOBBY_MODEL** - The specific AI model to use
   - Default: `accounts/sentientfoundation/models/dobby-unhinged-llama-3-3-70b-new`
   - Used for generating movie recommendations

### Setting up Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add each environment variable:
   - Name: `TMDB_API_KEY`, Value: `your_tmdb_api_key_here`
   - Name: `FIREWORK_API_KEY`, Value: `your_firework_api_key_here`
   - Name: `DOBBY_MODEL`, Value: `accounts/sentientfoundation/models/dobby-unhinged-llama-3-3-70b-new`

### Local Development

1. Copy `env.example` to `.env.local`
2. Fill in your actual API keys
3. Run `npm install` to install dependencies
4. Run `npm run dev` to start local development server

## Deployment

The project is configured to automatically build and deploy on Vercel. The build process will:

1. Read environment variables from Vercel
2. Replace placeholders in `index.html` with actual API keys
3. Deploy the processed static files

## Project Structure

```
├── index.html          # Main application file
├── vercel.json         # Vercel configuration
├── package.json        # Node.js dependencies
├── build.js           # Build script for environment variable injection
├── env.example        # Example environment variables
├── vercel-env.d.ts    # TypeScript environment variable types
└── README.md          # This file
```

## How It Works

1. The build script (`build.js`) reads environment variables from Vercel
2. It replaces placeholders (`{{TMDB_API_KEY}}`, etc.) in `index.html` with actual values
3. The processed HTML file is deployed as a static site
4. The frontend JavaScript uses the injected API keys to make requests

## Security

- API keys are injected at build time, not exposed in the source code
- The build process ensures sensitive data is not committed to version control
- Environment variables are securely managed by Vercel
