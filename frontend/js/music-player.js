import { getSongs, resolveUrl } from './api.js?v=4';

let allSongs = [];
let currentQueue = [];
let currentIndex = -1;


// DOM Elements
const audio = document.getElementById('audio-element');
const playerFooter = document.getElementById('player-footer');

const btnPlay = document.getElementById('btn-play');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const iconPlay = document.getElementById('icon-play');
const iconPause = document.getElementById('icon-pause');

const playerCover = document.getElementById('player-cover');
const playerCoverPlaceholder = document.getElementById('player-cover-placeholder');
const playerTitle = document.getElementById('player-title');
const playerArtist = document.getElementById('player-artist');

const timeCurrent = document.getElementById('time-current');
const timeTotal = document.getElementById('time-total');
const progressBg = document.getElementById('progress-bg');
const progressFill = document.getElementById('progress-fill');
const volumeSlider = document.getElementById('volume-slider');

// Helpers
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.innerText = str;
  return div.innerHTML;
}

function formatTime(seconds) {
  if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

let searchInput = null;
let resultsContainer = null;

// 1. Load Data & Render
window.initMusicPage = async function() {
  searchInput = document.getElementById('search-input');
  resultsContainer = document.getElementById('search-results');
  
  if (!searchInput || !resultsContainer) return;

  // 2. Search Logic
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (!query) {
      renderList(allSongs);
      return;
    }
    
    const filtered = allSongs.filter(s => {
      const titleMatch = s.title.toLowerCase().includes(query);
      const artistMatch = s.artist?.name?.toLowerCase().includes(query);
      return titleMatch || artistMatch;
    });
    
    renderList(filtered);
  });

  try {
    const data = await getSongs();
    allSongs = Array.isArray(data) ? data : (data.data || []);
    renderList(allSongs);
  } catch (err) {
    resultsContainer.innerHTML = '<div class="empty-state">Gagal memuat lagu. Coba lagi nanti.</div>';
  }
};

function renderList(songs) {
  if (!resultsContainer) return;

  if (!songs.length) {
    resultsContainer.innerHTML = '<div class="empty-state">Tidak ada lagu ditemukan.</div>';
    return;
  }

  resultsContainer.innerHTML = songs.map((s, index) => {
    const artistName = s.artist?.name || 'Unknown Artist';
    const cover = s.cover_image ? resolveUrl(s.cover_image) : '';
    const coverHtml = cover 
      ? `<img src="${escapeHtml(cover)}" class="song-cover" alt="Cover">`
      : `<div class="song-cover" style="background:#333"></div>`;
    
    // Check if this song is currently playing
    const isPlaying = currentIndex !== -1 && currentQueue[currentIndex]?.id === s.id;

    return `
      <div class="song-row ${isPlaying ? 'playing' : ''}" data-index="${index}" data-id="${s.id}">
        ${coverHtml}
        <div class="song-info">
          <h4>${escapeHtml(s.title)}</h4>
          <span>${escapeHtml(artistName)}</span>
        </div>
        <button class="play-btn-list">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        </button>
      </div>
    `;
  }).join('');

  // Attach click events
  document.querySelectorAll('.song-row').forEach(row => {
    row.addEventListener('click', () => {
      const id = row.getAttribute('data-id');
      // Set current queue to the displayed list
      currentQueue = [...songs];
      // Find index in the new queue
      const qIndex = currentQueue.findIndex(s => s.id === id);
      playSong(qIndex);
    });
  });
}

// 3. Audio Player Logic
function playSong(index) {
  if (index < 0 || index >= currentQueue.length) return;
  
  const song = currentQueue[index];
  if (!song.audio_url) {
    showToast('Lagu ini belum memiliki file audio.');
    return;
  }

  currentIndex = index;
  
  // Update UI
  playerFooter.classList.add('active');
  playerTitle.textContent = song.title;
  playerArtist.textContent = song.artist?.name || 'Unknown Artist';
  
  if (song.cover_image) {
    playerCover.src = resolveUrl(song.cover_image);
    playerCover.style.display = 'block';
    playerCoverPlaceholder.style.display = 'none';
  } else {
    playerCover.style.display = 'none';
    playerCoverPlaceholder.style.display = 'block';
  }

  // Play Audio
  audio.src = resolveUrl(song.audio_url);
  audio.play().catch(e => {
    console.error("Audio play failed:", e);
    showToast("Gagal memutar audio. Pastikan URL valid.");
  });

  updatePlayPauseUI(true);
  
  // Re-render list to show active state
  // Only if search query is empty to avoid overwriting search results
  if (!searchInput.value) {
    renderList(allSongs);
  }
}

function togglePlay() {
  if (currentIndex === -1) return;
  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }
}

function updatePlayPauseUI(isPlaying) {
  if (isPlaying) {
    iconPlay.style.display = 'none';
    iconPause.style.display = 'block';
  } else {
    iconPlay.style.display = 'block';
    iconPause.style.display = 'none';
  }
}

// Events
if (btnPlay) {
  btnPlay.addEventListener('click', togglePlay);

  btnPrev.addEventListener('click', () => {
    if (currentIndex > 0) playSong(currentIndex - 1);
  });

  btnNext.addEventListener('click', () => {
    if (currentIndex < currentQueue.length - 1) playSong(currentIndex + 1);
  });
}

audio.addEventListener('play', () => updatePlayPauseUI(true));
audio.addEventListener('pause', () => updatePlayPauseUI(false));
audio.addEventListener('ended', () => {
  if (currentIndex < currentQueue.length - 1) {
    playSong(currentIndex + 1);
  } else {
    updatePlayPauseUI(false);
  }
});

audio.addEventListener('timeupdate', () => {
  timeCurrent.textContent = formatTime(audio.currentTime);
  if (audio.duration) {
    const progress = (audio.currentTime / audio.duration) * 100;
    progressFill.style.width = `${progress}%`;
  }
});

audio.addEventListener('loadedmetadata', () => {
  timeTotal.textContent = formatTime(audio.duration);
});

// Progress Bar Click
progressBg.addEventListener('click', (e) => {
  if (!audio.duration) return;
  const rect = progressBg.getBoundingClientRect();
  const pos = (e.clientX - rect.left) / rect.width;
  audio.currentTime = pos * audio.duration;
});

// Volume
if (volumeSlider) {
  volumeSlider.addEventListener('input', (e) => {
    audio.volume = e.target.value;
    e.target.style.setProperty('--vol', `${e.target.value * 100}%`);
  });
  volumeSlider.style.setProperty('--vol', `${volumeSlider.value * 100}%`);
}

// Toast
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

