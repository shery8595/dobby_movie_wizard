const fs = require('fs');
const path = require('path');

// Read the template HTML file
const templatePath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(templatePath, 'utf8');

// Get environment variables
const tmdbApiKey = process.env.TMDB_API_KEY ;
const fireworkApiKey = process.env.FIREWORK_API_KEY ;
const dobbyModel = process.env.DOBBY_MODEL || 'accounts/sentientfoundation/models/dobby-unhinged-llama-3-3-70b-new';

// Replace placeholders with actual environment variables
html = html.replace(/\{\{TMDB_API_KEY\}\}/g, tmdbApiKey);
html = html.replace(/\{\{FIREWORK_API_KEY\}\}/g, fireworkApiKey);
html = html.replace(/\{\{DOBBY_MODEL\}\}/g, dobbyModel);

// Write the processed HTML file
fs.writeFileSync(templatePath, html);

console.log('✅ Build completed successfully!');
console.log('Environment variables injected into index.html');

