const TMDB_API_KEY = process.env.VITE_TMDB_API_KEY;
const FIREWORK_API_KEY = process.env.VITE_FIREWORK_API_KEY;
const DOBBY_MODEL = process.env.VITE_DOBBY_MODEL;

let currentQuestion = 1;
const userSelections = { occasion: '', mood: '', genre: '', era: '', audience: '' };
let watchlist = JSON.parse(localStorage.getItem('dobby_watchlist')) || [];

const progressEl = document.getElementById('progress');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const submitBtn = document.getElementById('submit-btn');
const restartBtn = document.getElementById('restart-btn');
const loadingEl = document.getElementById('loading');
const resultsEl = document.getElementById('results');
const resultsGrid = document.getElementById('results-grid');
const wizardContainer = document.getElementById('wizard-container');
const questionsArea = document.getElementById('questions-area');
const dots = document.querySelectorAll('.dot');
const featuredGrid = document.getElementById('featured-grid');
const watchlistToggle = document.getElementById('watchlist-toggle');
const watchlistCount = document.getElementById('watchlist-count');
const watchlistPreview = document.getElementById('watchlist-grid-preview');
const emptyPreview = document.getElementById('empty-watchlist-preview');
const toast = document.getElementById('toast');
const toastText = document.getElementById('toast-text');
const searchBox = document.getElementById('search-box');
const searchBtn = document.getElementById('search-btn');
const quickRecBtn = document.getElementById('quick-recommend');

function init() {
  console.log('Initializing Dobby Movie Wizard...');
  const trendingElement = document.getElementById('trending-scroll');
  if (trendingElement) {
    console.log('✅ Trending scroll element found');
  } else {
    console.error('❌ Trending scroll element NOT found!');
  }
  updateProgress();
  attachListeners();
  console.log('Trending movies in compact mode - click button to expand');
  renderWatchlistPreview();
  updateWatchlistCount();
  setTimeout(() => {
    document.querySelectorAll('.option').forEach((option, index) => {
      option.style.transitionDelay = `${index * 0.05}s`;
      option.style.opacity = '1';
      option.style.transform = 'translateY(0)';
    });
  }, 300);
}

async function testTMDBAPI() {
  try {
    console.log('Testing TMDB API connection...');
    let res = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`);
    if (!res.ok) {
      console.log('Direct TMDB request failed, trying with CORS proxy...');
      res = await fetch(`https://cors-anywhere.herokuapp.com/https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`);
    }
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    if (!data.results || data.results.length === 0) {
      throw new Error('No results from TMDB API');
    }
    console.log('TMDB API test successful, found', data.results.length, 'movies');
    return true;
  } catch (err) {
    console.error('TMDB API test failed:', err);
    throw err;
  }
}

function toggleWatchlist(movieId, title, rating, releaseDate, description, poster) {
  const movie = {
    id: movieId,
    title: title,
    rating: rating,
    year: releaseDate ? new Date(releaseDate).getFullYear() : 'N/A',
    description: description,
    poster: poster
  };
  const existingIndex = watchlist.findIndex(w => w.id === movieId);
  if (existingIndex !== -1) {
    watchlist.splice(existingIndex, 1);
    showToast(`Removed ${title} from watchlist`);
  } else {
    watchlist.push(movie);
    showToast(`Added ${title} to watchlist`);
  }
  localStorage.setItem('dobby_watchlist', JSON.stringify(watchlist));
  renderWatchlistPreview();
  updateWatchlistCount();
  loadFeaturedMovies();
}

function openTrailer(movieTitle) {
  try {
    const searchQuery = encodeURIComponent(`${movieTitle} official trailer`);
    const youtubeUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;
    window.open(youtubeUrl, '_blank');
    showToast(`Searching for ${movieTitle} trailer on YouTube`);
  } catch (err) {
    console.error('Error opening trailer:', err);
    showToast('Failed to open trailer');
  }
}

function loadTrendingMovies() {
  console.log('Loading trending movies...');
  const trendingContainer = document.getElementById('trending-container');
  const trendingCompact = document.getElementById('trending-compact');
  const trendingScroll = document.getElementById('trending-scroll');
  if (trendingContainer && trendingCompact && trendingScroll) {
    trendingCompact.style.display = 'none';
    trendingScroll.style.display = 'flex';
    trendingContainer.classList.remove('collapsed');
    trendingContainer.classList.add('expanded');
    trendingScroll.innerHTML = `
      <div class="trending-item">
        <img src="https://via.placeholder.com/120x110/1a2a6c/fff?text=Loading..." alt="Loading">
        <div class="trending-info">
          <div class="trending-title">Loading Trending Movies...</div>
          <div class="trending-meta">Please wait</div>
          <div class="trending-summary">Fetching the latest popular movies from TMDB...</div>
          <div class="trending-actions">
            <button class="trending-btn watchlist" disabled><i class="fas fa-spinner fa-spin"></i> Loading</button>
            <button class="trending-btn trailer" disabled><i class="fab fa-youtube"></i> Loading</button>
          </div>
        </div>
      </div>
    `;
    const loadBtn = document.querySelector('.trending-load-btn');
    const collapseBtn = document.querySelector('.trending-collapse-btn');
    if (loadBtn) {
      loadBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Reload';
      loadBtn.onclick = reloadTrendingMovies;
    }
    if (collapseBtn) {
      collapseBtn.style.display = 'inline-flex';
    }
  }
  loadFeaturedMovies();
}

function reloadTrendingMovies() {
  console.log('Reloading trending movies...');
  showToast('Refreshing trending movies...');
  loadFeaturedMovies();
}

function collapseTrendingMovies() {
  const trendingContainer = document.getElementById('trending-container');
  const trendingCompact = document.getElementById('trending-compact');
  const trendingScroll = document.getElementById('trending-scroll');
  if (trendingContainer && trendingCompact && trendingScroll) {
    trendingCompact.style.display = 'flex';
    trendingScroll.style.display = 'none';
    trendingContainer.classList.remove('expanded');
    trendingContainer.classList.add('collapsed');
    const loadBtn = document.querySelector('.trending-load-btn');
    const collapseBtn = document.querySelector('.trending-collapse-btn');
    if (loadBtn) {
      loadBtn.innerHTML = '<i class="fas fa-play"></i> Load Trending Movies';
      loadBtn.onclick = loadTrendingMovies;
    }
    if (collapseBtn) {
      collapseBtn.style.display = 'none';
    }
  }
}

function updateProgress() {
  const pct = (currentQuestion / 5) * 100;
  progressEl.style.width = pct + '%';
  dots.forEach(d => {
    const q = Number(d.dataset.q);
    d.classList.toggle('active', q <= currentQuestion);
  });
  prevBtn.disabled = currentQuestion === 1;
  if (currentQuestion < 5) {
    nextBtn.style.display = 'inline-flex';
    submitBtn.style.display = 'none';
  } else {
    nextBtn.style.display = 'none';
    submitBtn.style.display = 'inline-flex';
  }
}

function showQuestion(n) {
  document.querySelectorAll('.question-slide').forEach(sec => {
    sec.style.display = Number(sec.dataset.q) === n ? 'block' : 'none';
  });
  currentQuestion = n;
  updateProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

prevBtn.addEventListener('click', () => {
  if (currentQuestion > 1) showQuestion(currentQuestion - 1);
});

nextBtn.addEventListener('click', () => {
  if (currentQuestion < 5) showQuestion(currentQuestion + 1);
});

dots.forEach(d => d.addEventListener('click', () => {
  const q = Number(d.dataset.q);
  if (q < currentQuestion) showQuestion(q);
}));

questionsArea.addEventListener('click', (ev) => {
  const opt = ev.target.closest('.option');
  if (!opt) return;
  const container = opt.closest('.options-grid');
  container.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
  opt.classList.add('selected');
  const q = Number(opt.closest('.question-slide').dataset.q);
  const val = opt.dataset.value;
  switch (q) {
    case 1: userSelections.occasion = val; break;
    case 2: userSelections.mood = val; break;
    case 3: userSelections.genre = val; break;
    case 4: userSelections.era = val; break;
    case 5: userSelections.audience = val; break;
  }
  if (q < 5) nextBtn.disabled = false;
  else submitBtn.disabled = false;
});

restartBtn.addEventListener('click', restartWizard);

document.getElementById('back-to-wizard').addEventListener('click', () => {
  resultsEl.style.display = 'none';
  wizardContainer.style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

submitBtn.addEventListener('click', submitForm);

quickRecBtn.addEventListener('click', async () => {
  if (!userSelections.genre) userSelections.genre = 'drama';
  if (!userSelections.era) userSelections.era = 'recent';
  if (!userSelections.audience) userSelections.audience = 'adults';
  await submitForm();
});

searchBtn.addEventListener('click', () => doSearch(searchBox.value));
searchBox.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') doSearch(searchBox.value);
});

async function doSearch(query) {
  if (!query || !query.trim()) return;
  showLoading();
  try {
    const movies = await searchTMDB(query, 6);
    hideLoading();
    showResults(movies);
  } catch (e) {
    hideLoading();
    console.error(e);
    alert('Search error. Check console.');
  }
}

async function searchTMDB(q, limit = 6) {
  const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(q)}&language=en-US&page=1`);
  const data = await res.json();
  const list = (data.results || []).slice(0, limit).map(m => ({
    id: m.id,
    title: m.title,
    year: m.release_date ? new Date(m.release_date).getFullYear() : 'N/A',
    rating: m.vote_average,
    description: m.overview,
    poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : '',
    trailer: ''
  }));
  for (const mv of list) {
    try {
      const md = await (await fetch(`https://api.themoviedb.org/3/movie/${mv.id}?api_key=${TMDB_API_KEY}&append_to_response=videos`)).json();
      if (md.videos && md.videos.results) {
        const t = md.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
        if (t) mv.trailer = `https://www.youtube.com/watch?v=${t.key}`;
      }
    } catch (e) {}
  }
  return list;
}

async function submitForm() {
  wizardContainer.style.display = 'none';
  resultsEl.style.display = 'none';
  showLoading();
  try {
    const movieTitles = await getDobbyRecommendations();
    const movieDetails = await getMovieDetails(movieTitles);
    hideLoading();
    showResults(movieDetails);
  } catch (e) {
    hideLoading();
    console.error(e);
    alert('Sorry, something went wrong while fetching recommendations.');
  }
}

async function getDobbyRecommendations() {
  const prompt = `Recommend 5 movies for a ${userSelections.occasion || 'casual'} occasion where I'm feeling ${userSelections.mood || 'neutral'}.
I prefer ${userSelections.genre || 'drama'} movies from the ${userSelections.era || 'any'} era, suitable for ${userSelections.audience || 'adults'}.
Please return only the movie titles in a comma-separated list.`;
  try {
    const resp = await fetch('https://api.fireworks.ai/inference/v1/chat/completions', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${FIREWORK_API_KEY}` },
      body: JSON.stringify({ model: DOBBY_MODEL, max_tokens: 120, temperature: 0.7, messages: [{ role: 'user', content: prompt }] })
    });
    if (!resp.ok) throw new Error(`Model API ${resp.status}`);
    const data = await resp.json();
    const content = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';
    return parseMovieTitles(content);
  } catch (err) {
    console.warn('Dobby API failed, using fallback:', err);
    return getFallbackRecommendations();
  }
}

function parseMovieTitles(movieList) {
  if (!movieList) return [];
  const titles = movieList.replace(/\d+\./g, '').split(/[\n,]/).map(t => t.trim().replace(/["']/g, '')).filter(Boolean);
  return titles.slice(0, 5);
}

function getFallbackRecommendations() {
  const key = `${userSelections.occasion}-${userSelections.mood}-${userSelections.genre}-${userSelections.era}-${userSelections.audience}`;
  const map = {
    'date-happy-comedy-new-adults': ['Crazy Stupid Love', 'La La Land', 'The Proposal', 'Silver Linings Playbook', '500 Days of Summer'],
    'family-happy-comedy-recent-kids': ['Toy Story 4', 'The Incredibles 2', 'Frozen II', 'Paddington 2', 'Spider-Man: Into the Spider-Verse'],
    'solo-excited-action-recent-adults': ['John Wick', 'Mad Max: Fury Road', 'The Dark Knight', 'Inception', 'The Matrix'],
    'party-excited-comedy-any-teens': ['Superbad', 'The Hangover', 'Bridesmaids', '21 Jump Street', 'Step Brothers'],
    'nostalgic-happy-romance-any-couples': ['Titanic', 'Notting Hill', 'You\'ve Got Mail', 'Sleepless in Seattle', 'Pretty Woman'],
    'default': ['The Shawshank Redemption', 'The Godfather', 'Pulp Fiction', 'Forrest Gump', 'The Dark Knight']
  };
  return map[key] || map['default'];
}

async function getMovieDetails(movieTitles) {
  const details = [];
  for (const t of movieTitles) {
    try {
      const s = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(t)}&language=en-US&page=1`);
      const sd = await s.json();
      if (sd.results && sd.results.length > 0) {
        const m = sd.results[0];
        const md = await (await fetch(`https://api.themoviedb.org/3/movie/${m.id}?api_key=${TMDB_API_KEY}&append_to_response=videos`)).json();
        let trailerKey = '';
        if (md.videos && md.videos.results) {
          const tr = md.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
          if (tr) trailerKey = tr.key;
        }
        details.push({
          id: md.id,
          title: md.title,
          year: md.release_date ? new Date(md.release_date).getFullYear() : 'Unknown',
          rating: md.vote_average,
          description: md.overview,
          poster: md.poster_path ? `https://image.tmdb.org/t/p/w500${md.poster_path}` : '',
          trailer: trailerKey ? `https://www.youtube.com/watch?v=${trailerKey}` : ''
        });
      }
    } catch (err) {
      console.warn('Error details for', t, err);
    }
  }
  return details;
}

function showResults(movies) {
  resultsEl.style.display = 'block';
  wizardContainer.style.display = 'none';
  resultsGrid.innerHTML = '';
  if (!movies || movies.length === 0) {
    resultsGrid.innerHTML = `<div class="empty">No movies found. Try again or use search.</div>`;
    return;
  }
  movies.forEach(movie => {
    const inWatch = watchlist.some(w => w.id === movie.id);
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.innerHTML = `
      <img class="movie-poster" src="${movie.poster || 'https://via.placeholder.com/500x750/1a2a6c/fff?text=No+Image'}" alt="${movie.title}">
      <div class="movie-info">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
          <div style="flex:1">
            <div class="movie-title">${movie.title}</div>
            <div class="movie-meta"><div>${movie.year || 'N/A'}</div><div>⭐ ${movie.rating || 'N/A'}</div></div>
          </div>
        </div>
        <div class="movie-desc">${movie.description || 'No description available.'}</div>
        <div class="movie-actions" style="margin-top:10px">
          ${movie.trailer ? `<button class="btn trailer" onclick="window.open('${movie.trailer}', '_blank')"><i class="fab fa-youtube"></i> Trailer</button>` : ''}
          <button class="btn watchlist add-watchlist" data-id="${movie.id}">${inWatch ? '<i class="fas fa-check"></i> Added' : '<i class="fas fa-plus"></i> Watchlist'}</button>
        </div>
      </div>
    `;
    resultsGrid.appendChild(card);
  });
  document.querySelectorAll('.add-watchlist').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      const already = watchlist.some(w => w.id === id);
      if (already) {
        removeFromWatchlist(id);
        btn.innerHTML = '<i class="fas fa-plus"></i> Watchlist';
        btn.classList.remove('primary');
        showToast('Removed from watchlist');
      } else {
        const movie = movies.find(m => m.id === id);
        if (movie) {
          addToWatchlist(movie);
          btn.innerHTML = '<i class="fas fa-check"></i> Added';
          btn.classList.remove('primary');
          showToast('Added to watchlist');
        }
      }
    });
  });
  resultsEl.scrollIntoView({ behavior: 'smooth' });
}

function addToWatchlist(movie) {
  if (!watchlist.some(w => w.id === movie.id)) {
    watchlist.push(movie);
    localStorage.setItem('dobby_watchlist', JSON.stringify(watchlist));
    renderWatchlistPreview();
    updateWatchlistCount();
  }
}

function removeFromWatchlist(id) {
  watchlist = watchlist.filter(m => m.id !== id);
  localStorage.setItem('dobby_watchlist', JSON.stringify(watchlist));
  renderWatchlistPreview();
  updateWatchlistCount();
}

function renderWatchlistPreview() {
  watchlistPreview.innerHTML = '';
  if (!watchlist || watchlist.length === 0) {
    emptyPreview.style.display = 'block';
    return;
  }
  emptyPreview.style.display = 'none';
  watchlist.slice(0, 6).forEach(m => {
    const node = document.createElement('div');
    node.className = 'featured-item';
    node.innerHTML = `<img src="${m.poster || 'https://via.placeholder.com/500x750/1a2a6c/fff?text=No+Image'}"><div class="featured-info"><div class="featured-title">${m.title}</div><div class="featured-meta">⭐ ${m.rating || 'N/A'}</div></div>`;
    node.addEventListener('click', () => {
      if (m.trailer) window.open(m.trailer, '_blank');
    });
    watchlistPreview.appendChild(node);
  });
}

function updateWatchlistCount() {
  watchlistCount.textContent = watchlist.length ? `(${watchlist.length})` : '(0)';
}

document.getElementById('open-watchlist').addEventListener('click', () => {
  if (watchlist.length === 0) {
    alert('Watchlist empty');
    return;
  }
  let html = 'Your Watchlist:\n\n';
  watchlist.forEach(w => html += `${w.title} (${w.year}) — ⭐ ${w.rating}\n`);
  alert(html);
});

document.getElementById('clear-watchlist').addEventListener('click', () => {
  if (confirm('Clear your watchlist?')) {
    watchlist = [];
    localStorage.removeItem('dobby_watchlist');
    renderWatchlistPreview();
    updateWatchlistCount();
    showToast('Watchlist cleared');
  }
});

async function loadFeaturedMovies() {
  try {
    console.log('Loading trending movies...');
    const trendingScroll = document.getElementById('trending-scroll');
    if (!trendingScroll) {
      console.error('trending-scroll element not found!');
      return;
    }
    trendingScroll.innerHTML = `
      <div class="trending-item">
        <img src="https://via.placeholder.com/120x110/1a2a6c/fff?text=Loading..." alt="Loading">
        <div class="trending-info">
          <div class="trending-title">Loading Trending Movies...</div>
          <div class="trending-meta">Please wait</div>
          <div class="trending-summary">Fetching the latest popular movies from TMDB...</div>
          <div class="trending-actions">
            <button class="trending-btn watchlist" disabled><i class="fas fa-spinner fa-spin"></i> Loading</button>
            <button class="trending-btn trailer" disabled><i class="fab fa-youtube"></i> Loading</button>
          </div>
        </div>
      </div>
    `;
    let res = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`);
    if (!res.ok) {
      console.log('Direct TMDB request failed, trying with CORS proxy...');
      try {
        res = await fetch(`https://cors-anywhere.herokuapp.com/https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`);
      } catch (corsErr) {
        console.log('CORS proxy also failed, using fallback movies');
        throw new Error('Both direct and CORS requests failed');
      }
    }
    const data = await res.json();
    console.log('TMDB API response:', data);
    if (!data.results || data.results.length === 0) {
      throw new Error('No results from TMDB API');
    }
    const list = data.results.slice(0, 10);
    console.log('Movies to display:', list);
    trendingScroll.innerHTML = '';
    list.forEach(movie => {
      const movieItem = createTrendingMovieItem(movie);
      trendingScroll.appendChild(movieItem);
    });
    list.forEach(movie => {
      const movieItem = createTrendingMovieItem(movie);
      trendingScroll.appendChild(movieItem);
    });
    console.log('Trending movies loaded successfully!');
  } catch (e) {
    console.error('Featured load failed:', e);
    const trendingScroll = document.getElementById('trending-scroll');
    if (trendingScroll) {
      const sampleMovies = [
        {
          id: 1,
          title: 'The Dark Knight',
          vote_average: 9.0,
          poster_path: null,
          overview: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
          release_date: '2008-07-18'
        },
        {
          id: 2,
          title: 'Inception',
          vote_average: 8.8,
          poster_path: null,
          overview: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
          release_date: '2010-07-16'
        },
        {
          id: 3,
          title: 'Pulp Fiction',
          vote_average: 8.9,
          poster_path: null,
          overview: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
          release_date: '1994-10-14'
        },
        {
          id: 4,
          title: 'Forrest Gump',
          vote_average: 8.8,
          poster_path: null,
          overview: 'The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man with an IQ of 75.',
          release_date: '1994-07-06'
        },
        {
          id: 5,
          title: 'The Matrix',
          vote_average: 8.7,
          poster_path: null,
          overview: 'A computer programmer discovers that reality as he knows it is a simulation created by machines, and joins a rebellion to break free.',
          release_date: '1999-03-31'
        }
      ];
      trendingScroll.innerHTML = '';
      sampleMovies.forEach(movie => {
        const movieItem = createTrendingMovieItem(movie);
        trendingScroll.appendChild(movieItem);
      });
      sampleMovies.forEach(movie => {
        const movieItem = createTrendingMovieItem(movie);
        trendingScroll.appendChild(movieItem);
      });
      console.log('Loaded sample movies as fallback');
    }
  }
}

function createTrendingMovieItem(movie) {
  const item = document.createElement('div');
  item.className = 'trending-item';
  let posterSrc = 'https://via.placeholder.com/120x110/1a2a6c/fff?text=No+Image';
  if (movie.poster_path) {
    posterSrc = `https://image.tmdb.org/t/p/w200${movie.poster_path}`;
  }
  const inWatchlist = watchlist.some(w => w.id === movie.id);
  const summary = movie.overview || 'No description available.';
  const truncatedSummary = summary.length > 120 ? summary.substring(0, 120) + '...' : summary;
  console.log('Creating trending item for:', movie.title);
  console.log('Movie ID:', movie.id);
  console.log('In watchlist:', inWatchlist);
  item.innerHTML = `
    <img src="${posterSrc}"
         alt="${movie.title}"
         onerror="this.src='https://via.placeholder.com/160x180/1a2a6c/fff?text=No+Image'"
         onload="this.style.display='block'">
    <div class="trending-info">
      <div class="trending-title">${movie.title}</div>
      <div class="trending-meta">⭐ ${movie.vote_average || 'N/A'} • ${movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</div>
      <div class="trending-summary">${truncatedSummary}</div>
      <div class="trending-actions">
        <button class="trending-btn watchlist" onclick="event.stopPropagation(); toggleWatchlist(${movie.id}, '${movie.title}', ${movie.vote_average || 0}, '${movie.release_date || ''}', '${truncatedSummary}', '${posterSrc}')">
          <i class="fas ${inWatchlist ? 'fa-check' : 'fa-plus'}"></i>
          ${inWatchlist ? 'Added' : 'Watchlist'}
        </button>
        <button class="trending-btn trailer" onclick="event.stopPropagation(); openTrailer('${movie.title}')" style="display: inline-flex !important; visibility: visible !important; opacity: 1 !important;">
          <i class="fab fa-youtube"></i>
          🎬 Trailer
        </button>
      </div>
    </div>
  `;
  setTimeout(() => {
    const watchlistBtn = item.querySelector('.trending-btn.watchlist');
    const trailerBtn = item.querySelector('.trending-btn.trailer');
    console.log('Watchlist button found:', !!watchlistBtn);
    console.log('Trailer button found:', !!trailerBtn);
    if (watchlistBtn) {
      console.log('Watchlist button classes:', watchlistBtn.className);
      console.log('Watchlist button styles:', watchlistBtn.style.cssText);
      console.log('Watchlist button computed display:', getComputedStyle(watchlistBtn).display);
    }
    if (trailerBtn) {
      console.log('Trailer button classes:', trailerBtn.className);
      console.log('Trailer button styles:', trailerBtn.style.cssText);
      console.log('Trailer button computed display:', getComputedStyle(trailerBtn).display);
      console.log('Trailer button computed visibility:', getComputedStyle(trailerBtn).visibility);
      console.log('Trailer button computed opacity:', getComputedStyle(trailerBtn).opacity);
    } else {
      console.error('❌ TRAILER BUTTON NOT FOUND in item for:', movie.title);
      console.log('Item HTML:', item.innerHTML);
    }
  }, 100);
  item.addEventListener('click', () => {
    console.log('Clicked movie:', movie.title);
    showToast(`Selected: ${movie.title}`);
  });
  return item;
}

function showLoading() { loadingEl.style.display = 'block'; }
function hideLoading() { loadingEl.style.display = 'none'; }
function showToast(msg) {
  toastText.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

function restartWizard() {
  currentQuestion = 1;
  Object.keys(userSelections).forEach(k => userSelections[k] = '');
  document.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
  showQuestion(1);
  resultsEl.style.display = 'none';
  wizardContainer.style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function attachListeners() {
  // Event listeners are already attached above
}

document.addEventListener('DOMContentLoaded', init);
