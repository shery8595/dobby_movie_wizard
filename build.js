const fs = require('fs');
const path = require('path');

// Build script to replace environment variable placeholders
function build() {
  console.log('🚀 Starting build process...');
  console.log('📋 Environment variables check:');
  console.log('VITE_TMDB_API_KEY:', process.env.VITE_TMDB_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('VITE_FIREWORK_API_KEY:', process.env.VITE_FIREWORK_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('VITE_DOBBY_MODEL:', process.env.VITE_DOBBY_MODEL ? '✅ Set' : '❌ Missing');

  const indexPath = path.join(__dirname, 'index.html');

  try {
    // Read the HTML file
    let htmlContent = fs.readFileSync(indexPath, 'utf8');
    console.log('📄 HTML file loaded successfully');

    // Get environment variables (no fallbacks)
    const tmdbKey = process.env.VITE_TMDB_API_KEY;
    const fireworkKey = process.env.VITE_FIREWORK_API_KEY;
    const dobbyModel = process.env.VITE_DOBBY_MODEL;

    // Validate that all required environment variables are present
    if (!tmdbKey || !fireworkKey || !dobbyModel) {
      console.error('❌ Missing required environment variables!');
      console.error('Please set: VITE_TMDB_API_KEY, VITE_FIREWORK_API_KEY, VITE_DOBBY_MODEL');
      console.error('Available env vars:', Object.keys(process.env).filter(key => key.startsWith('VITE_')));
      process.exit(1);
    }

    console.log('🔑 Using API keys:');
    console.log('TMDB Key length:', tmdbKey.length);
    console.log('Fireworks Key length:', fireworkKey.length);
    console.log('Dobby Model:', dobbyModel);

    // Replace placeholders with actual values
    htmlContent = htmlContent
      .replace('VITE_TMDB_API_KEY', tmdbKey)
      .replace('VITE_FIREWORK_API_KEY', fireworkKey)
      .replace('VITE_DOBBY_MODEL', dobbyModel);

    // Write the updated HTML file
    fs.writeFileSync(indexPath, htmlContent, 'utf8');

    console.log('✅ Build completed successfully!');
    console.log('📝 Environment variables injected into HTML');

  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// Run the build
build();
