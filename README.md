# Dobby Movie Wizard

AI-powered movie recommendation web application built with HTML, CSS, and JavaScript.

## Features

- **Interactive Wizard**: 5-step questionnaire to gather user preferences
- **AI Recommendations**: Uses Dobby AI model via Fireworks API for personalized movie suggestions
- **Movie Database**: Integrates with The Movie Database (TMDB) for movie data and posters
- **Trending Movies**: Displays popular movies with smooth scrolling animation
- **Watchlist**: Save movies for later viewing
- **Search**: Direct movie search functionality
- **Responsive Design**: Works on desktop and mobile devices

## Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dobby-movie-wizard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**

   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your API keys:
   ```env
   VITE_TMDB_API_KEY=your_tmdb_api_key_here
   VITE_FIREWORK_API_KEY=your_fireworks_api_key_here
   VITE_DOBBY_MODEL=accounts/sentientfoundation/models/dobby-unhinged-llama-3-3-70b-new
   ```

4. **Get API Keys**

   - **TMDB API Key**: Sign up at [The Movie Database](https://www.themoviedb.org/settings/api) and get your API key
   - **Fireworks API Key**: Sign up at [Fireworks AI](https://fireworks.ai/) and get your API key

5. **Run locally**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5000`

## Deployment to Vercel

### Option 1: Using Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Set Environment Variables in Vercel**

   In your Vercel dashboard or using CLI:
   ```bash
   vercel env add VITE_TMDB_API_KEY
   vercel env add VITE_FIREWORK_API_KEY
   vercel env add VITE_DOBBY_MODEL
   ```

### Option 2: Using Vercel Dashboard

1. **Connect Repository**

   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your Git repository

2. **Configure Environment Variables**

   In the project settings, add these environment variables:
   - `VITE_TMDB_API_KEY`
   - `VITE_FIREWORK_API_KEY`
   - `VITE_DOBBY_MODEL`

3. **Deploy**

   Vercel will automatically deploy your application.

## Project Structure

```
dobby-movie-wizard/
├── index.html          # Main application file
├── package.json        # Dependencies and scripts
├── vercel.json         # Vercel deployment configuration
├── .env                # Environment variables (local development)
├── .env.example        # Environment variables template
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## API Usage

The application uses the following APIs:

- **TMDB API**: For movie data, posters, and trailers
- **Fireworks AI API**: For AI-powered movie recommendations using the Dobby model

## Security Notes

- API keys are stored as environment variables and not committed to version control
- The application uses client-side API calls, so API keys are exposed in the browser
- For production use, consider implementing server-side API proxying for sensitive operations

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production (no build step required for static site)
- `npm run start` - Start production server
- `npm run deploy` - Deploy to Vercel

### Technologies Used

- **HTML5**: Structure and content
- **CSS3**: Styling with custom properties and animations
- **JavaScript (ES6+)**: Application logic and API integration
- **Font Awesome**: Icons
- **Google Fonts**: Typography

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues or questions, please open an issue on the GitHub repository.