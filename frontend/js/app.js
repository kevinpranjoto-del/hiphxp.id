/**
 * app.js — Main application logic for hiphxp.id
 * Handles: API data fetching, dynamic rendering, filters, share, form submit
 */

import { getStats, getSongs, getCollectives, getEvents, submitPartnership, getLifestyle, getEditorials, getReviews } from './api.js?v=4';

// ─── Helpers ───────────────────────────────────────────────────────────────

function showToast(msg, duration = 3000) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

function formatDate(dateStr) {
  if (!dateStr) return '–';
  const d = new Date(dateStr);
  return {
    day: d.getDate().toString().padStart(2, '0'),
    month: d.toLocaleString('id-ID', { month: 'short' }).toUpperCase(),
    full: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
  };
}

function getInitials(name) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function categoryLabel(cat) {
  const map = {
    FESTIVAL: 'Festival', GIG: 'Gigs', RAP_BATTLE: 'Rap Battle',
    STREET_EVENT: 'Street Event', WORKSHOP: 'Workshop', COMPETITION: 'Kompetisi',
  };
  return map[cat] || cat;
}

// ─── Stats ─────────────────────────────────────────────────────────────────

async function loadStats() {
  try {
    const stats = await getStats();
    const map = {
      'stat-songs': stats.music || stats.songs || 0,
      'stat-artists': stats.artists || 0,
      'stat-events': stats.events || 0,
    };
    for (const [id, val] of Object.entries(map)) {
      const el = document.getElementById(id);
      if (el) animateCount(el, val);
    }
  } catch {
    // fallback values already in HTML
  }
}

function animateCount(el, target) {
  let cur = 0;
  const step = Math.ceil(target / 40);
  const interval = setInterval(() => {
    cur = Math.min(cur + step, target);
    el.textContent = cur + (target > 99 ? '+' : '');
    if (cur >= target) clearInterval(interval);
  }, 30);
}

// ─── Songs / Release Radar ─────────────────────────────────────────────────

async function loadSongs() {
  const grid = document.getElementById('releases-grid');
  if (!grid) return;

  grid.innerHTML = '<div class="loading-spinner">Memuat rilisan...</div>';

  try {
    const data = await getSongs({ limit: 8 });
    const songs = Array.isArray(data) ? data : (data.data || []);

    if (!songs.length) {
      grid.innerHTML = '<div class="empty-state"><p>Belum ada lagu tersedia.</p></div>';
      return;
    }

    grid.innerHTML = songs.map(song => {
      const date = formatDate(song.release_date);
      const artistName = song.artist?.name || 'Unknown Artist';
      return `
        <div class="release-card">
          <div class="rc-tag">Rilisan Baru</div>
          <h4>${escHtml(song.title)}</h4>
          <div class="rc-artist mono">${escHtml(artistName)}</div>
          ${song.release_date ? `<div class="rc-date">${date.full}</div>` : ''}
        </div>
      `;
    }).join('');
  } catch {
    grid.innerHTML = '<div class="empty-state"><p>Gagal memuat rilisan. Coba lagi nanti.</p></div>';
  }
}

// ─── Community Hub — Collectives ───────────────────────────────────────────

let allCollectives = [];

async function loadCollectives(cityFilter = '') {
  const grid = document.getElementById('collective-grid');
  if (!grid) return;

  grid.innerHTML = '<div class="loading-spinner" style="color:rgba(242,241,236,0.6)">Memuat direktori...</div>';

  try {
    const params = cityFilter ? { city: cityFilter } : {};
    const data = await getCollectives(params);
    allCollectives = Array.isArray(data) ? data : (data.data || []);

    renderCollectiveGrid(allCollectives);
  } catch {
    grid.innerHTML = '<div class="empty-state" style="color:rgba(242,241,236,0.6)"><p>Gagal memuat direktori.</p></div>';
  }
}

function renderCollectiveGrid(collectives) {
  const grid = document.getElementById('collective-grid');
  if (!grid) return;

  if (!collectives.length) {
    grid.innerHTML = '<div class="empty-state" style="color:rgba(242,241,236,0.6)"><p>Tidak ada kolektif ditemukan.</p></div>';
    return;
  }

  grid.innerHTML = collectives.map(a => `
    <div class="collective-card">
      <div class="collective-avatar">
        <span>${getInitials(a.name)}</span>
      </div>
      <h4>${escHtml(a.name)}</h4>
      <div class="city mono">${escHtml(a.city || '–')}</div>
      <p class="desc">${escHtml(a.bio || a.description || '')}</p>
    </div>
  `).join('');
}

function initCityFilter() {
  const chips = document.querySelectorAll('.chip[data-city]');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const city = chip.dataset.city;
      loadCollectives(city === 'all' ? '' : city);
    });
  });
}

// ─── Events ────────────────────────────────────────────────────────────────

async function loadEvents(params = {}) {
  const list = document.getElementById('event-list');
  if (!list) return;

  list.innerHTML = '<div class="loading-spinner" style="color:rgba(242,241,236,0.6)">Memuat agenda...</div>';

  try {
    const data = await getEvents(params);
    const events = Array.isArray(data) ? data : (data.data || []);
    renderEventList(events);
  } catch {
    list.innerHTML = '<div class="empty-state" style="color:rgba(242,241,236,0.6)"><p>Gagal memuat agenda.</p></div>';
  }
}

function renderEventList(events) {
  const list = document.getElementById('event-list');
  if (!list) return;

  if (!events.length) {
    list.innerHTML = '<div class="empty-state" style="color:rgba(242,241,236,0.6)"><p>Tidak ada acara ditemukan.</p></div>';
    return;
  }

  list.innerHTML = events.map(ev => {
    const date = formatDate(ev.event_date);
    const organizer = ev.organizer || '';
    const city = ev.city || '';
    const subtitle = [organizer, city].filter(Boolean).join(' · ');
    return `
      <div class="event-row">
        <div class="event-date">
          <div class="d">${date.day}</div>
          <div class="m">${date.month}</div>
        </div>
        <div class="event-info">
          <h5>${escHtml(ev.name)}</h5>
          <span>${escHtml(subtitle)}</span>
        </div>
        <div class="event-badge">${categoryLabel(ev.category)}</div>
      </div>
    `;
  }).join('');
}

function initEventFilters() {
  const btnFilter = document.getElementById('btn-filter-events');
  if (!btnFilter) return;

  btnFilter.addEventListener('click', () => {
    const city = document.getElementById('filter-city')?.value || '';
    const date = document.getElementById('filter-date')?.value || '';
    const category = document.getElementById('filter-category')?.value || '';

    const params = {};
    if (city) params.city = city;
    if (date) { params.startDate = date; params.endDate = date; }
    if (category) params.category = category;
    loadEvents(params);
  });
}

// ─── Partnership Form ──────────────────────────────────────────────────────

function initPartnershipForm() {
  const form = document.getElementById('partnership-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('.form-submit');
    const name = document.getElementById('p-name')?.value?.trim();
    const wa = document.getElementById('p-wa')?.value?.trim();
    const needs = document.getElementById('p-needs')?.value?.trim();

    if (!name || !wa || !needs) {
      showToast('⚠️ Isi semua field sebelum mengirim.');
      return;
    }

    const text = `Halo hiphxp.id!\nSaya ingin mendiskusikan kerja sama media.\n\n*Nama Brand / Label:* ${name}\n*Nomor WA:* ${wa}\n*Kebutuhan:* ${needs}`;
    const waUrl = `https://wa.me/628159881312?text=${encodeURIComponent(text)}`;
    
    window.open(waUrl, '_blank');
    form.reset();
  });
}
window.initPartnershipForm = initPartnershipForm;

// ─── Social Share ──────────────────────────────────────────────────────────

function initShareButtons() {
  const pageUrl = encodeURIComponent(window.location.href);
  const pageTitle = encodeURIComponent(document.title);

  const shareHandlers = {
    'share-wa': () => window.open(`https://wa.me/?text=${pageTitle}%20${pageUrl}`, '_blank'),
    'share-x': () => window.open(`https://twitter.com/intent/tweet?text=${pageTitle}&url=${pageUrl}`, '_blank'),
    'share-ig': () => {
      navigator.clipboard.writeText(window.location.href).then(() => {
        showToast('📸 Link disalin! Paste di Instagram Stories kamu.');
      });
    },
    'share-tiktok': () => {
      navigator.clipboard.writeText(window.location.href).then(() => {
        showToast('🎵 Link disalin! Paste di TikTok kamu.');
      });
    },
  };

  for (const [id, handler] of Object.entries(shareHandlers)) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', handler);
  }
}
window.initShareButtons = initShareButtons;

// ─── Mobile Menu ───────────────────────────────────────────────────────────

function initMobileMenu() {
  const hamburger = document.getElementById('nav-hamburger');
  const menu = document.getElementById('mobile-menu');
  const close = document.getElementById('mobile-close');

  hamburger?.addEventListener('click', () => menu?.classList.add('open'));
  close?.addEventListener('click', () => menu?.classList.remove('open'));
  menu?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => menu?.classList.remove('open'));
  });
}
window.initMobileMenu = initMobileMenu;

// ─── Escape HTML ───────────────────────────────────────────────────────────
function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ─── Auto Media Embedding ──────────────────────────────────────────────────
function initAutoEmbeds() {
  const links = document.querySelectorAll('.auto-embed-link');
  links.forEach(link => {
    const url = link.href;

    // SSRF/XSS guard: only allow https:// URLs
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch {
      return; // skip malformed URLs
    }
    if (parsedUrl.protocol !== 'https:') return; // block javascript:, data:, http:, etc.

    let embedHtml = '';
    
    if (url.includes('spotify.com')) {
      const match = url.match(/(track|album|playlist)\/([a-zA-Z0-9]+)/);
      if (match) {
        embedHtml = `<iframe style="border-radius:12px; margin-bottom:14px;" src="https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator" width="100%" height="152" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
      }
    } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let vidId = '';
      if (url.includes('youtube.com/watch?v=')) vidId = new URL(url).searchParams.get('v');
      else if (url.includes('youtu.be/')) vidId = url.split('youtu.be/')[1].split('?')[0];
      // Validate video ID format (alphanumeric + _ -)
      if (vidId && /^[a-zA-Z0-9_-]{11}$/.test(vidId)) {
        embedHtml = `<iframe style="border-radius:12px; margin-bottom:14px; aspect-ratio: 16/9;" width="100%" src="https://www.youtube.com/embed/${vidId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
      }
    } else if (url.includes('music.apple.com')) {
      const parts = url.split('apple.com/')[1];
      if (parts) {
        embedHtml = `<iframe style="border-radius:12px; margin-bottom:14px; max-width:100%;" allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write" frameborder="0" height="175" width="100%" src="https://embed.music.apple.com/${parts}"></iframe>`;
      }
    } else if (url.includes('tiktok.com')) {
      // Use textContent for display, not the URL in onclick
      const safeUrl = encodeURIComponent(url);
      embedHtml = `<div class="embed-box" role="link" tabindex="0" data-href="${safeUrl}"><div class="embed-icon ic-tiktok" style="background:#000;color:#fff;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;">♪</div><div class="embed-meta"><b>TikTok Video</b><span>Buka di TikTok</span></div></div>`;
    } else if (url.includes('instagram.com')) {
      const safeUrl = encodeURIComponent(url);
      embedHtml = `<div class="embed-box" role="link" tabindex="0" data-href="${safeUrl}"><div class="embed-icon ic-ig" style="background:radial-gradient(circle at 30% 110%, #fdf497 0%, #fd5949 45%, #d6249f 60%, #285AEB 90%);color:#fff;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;">◎</div><div class="embed-meta"><b>Instagram Post</b><span>Buka di Instagram</span></div></div>`;
    }

    if (embedHtml) {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = embedHtml;
      const el = wrapper.firstChild;
      // Attach safe click handler via JS (not inline onclick)
      if (el && el.dataset && el.dataset.href) {
        el.style.cursor = 'pointer';
        el.addEventListener('click', () => {
          window.open(decodeURIComponent(el.dataset.href), '_blank', 'noopener,noreferrer');
        });
      }
      link.replaceWith(el);
    }
  });
}

// ─── Init ──────────────────────────────────────────────────────────────────

window.initApp = function() {
  if (typeof loadStats === 'function') loadStats();
  if (typeof loadSongs === 'function') loadSongs();
  if (typeof loadCollectives === 'function') loadCollectives();
  if (typeof loadEvents === 'function') loadEvents();
  if (typeof initCityFilter === 'function') initCityFilter();
  if (typeof initEventFilters === 'function') initEventFilters();
  if (typeof initPartnershipForm === 'function') initPartnershipForm();
  if (typeof initShareButtons === 'function') initShareButtons();
  if (typeof initMobileMenu === 'function') initMobileMenu();
  if (typeof initAutoEmbeds === 'function') initAutoEmbeds();
  if (typeof loadHomeReviews === 'function') loadHomeReviews();
  if (typeof loadHomeLifestyle === 'function') loadHomeLifestyle();
  if (typeof loadHomeFeatures === 'function') loadHomeFeatures();
  if (typeof loadSongMeanings === 'function') loadSongMeanings();
};

// ─── Custom Modal & Content Loaders ──────────────────────────────────────────

function showContentModal(title, subtitle, contentHtml) {
  const overlay = document.createElement('div');
  overlay.className = 'custom-modal-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
  overlay.style.backdropFilter = 'blur(10px)';
  overlay.style.display = 'flex';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.zIndex = '99999';
  overlay.style.animation = 'fadeIn 0.2s ease-out';

  const styleId = 'custom-content-modal-style';
  let style = document.getElementById(styleId);
  if (!style) {
    style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .custom-content-box {
        background: #0f0f0f;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        padding: 40px;
        width: 90%;
        max-width: 650px;
        max-height: 85vh;
        overflow-y: auto;
        box-shadow: 0 30px 60px rgba(0,0,0,0.8);
        font-family: 'Work Sans', sans-serif;
        color: #f2f1ec;
        position: relative;
      }
      .custom-content-close {
        position: absolute;
        top: 20px;
        right: 20px;
        background: none;
        border: none;
        color: var(--grey, #8a8a85);
        font-size: 24px;
        cursor: pointer;
        transition: color 0.2s;
      }
      .custom-content-close:hover {
        color: #fff;
      }
      .custom-content-title {
        font-family: 'Archivo Black', sans-serif;
        font-size: 22px;
        line-height: 1.2;
        text-transform: uppercase;
        margin-bottom: 8px;
        color: #fff;
      }
      .custom-content-subtitle {
        font-family: 'JetBrains Mono', monospace;
        font-size: 12px;
        color: var(--red, #e5342a);
        text-transform: uppercase;
        margin-bottom: 24px;
        letter-spacing: 0.1em;
      }
      .custom-content-body {
        font-size: 15px;
        line-height: 1.7;
        opacity: 0.9;
        white-space: pre-wrap;
      }
      .custom-content-body p {
        margin-bottom: 16px;
      }
      .custom-content-body strong {
        color: #fff;
      }
    `;
    document.head.appendChild(style);
  }

  overlay.innerHTML = `
    <div class="custom-content-box">
      <button class="custom-content-close" aria-label="Tutup modal">×</button>
      <div class="custom-content-subtitle">${subtitle}</div>
      <h3 class="custom-content-title">${title}</h3>
      <div class="custom-content-body">${contentHtml}</div>
    </div>
  `;

  document.body.appendChild(overlay);

  const closeBtn = overlay.querySelector('.custom-content-close');
  const close = () => overlay.remove();
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
}

async function loadHomeReviews() {
  const colReview = document.getElementById('col-review');
  const colRadar = document.getElementById('col-radar');

  try {
    const reviewsRes = await getReviews('music');
    const reviews = reviewsRes.data || [];
    const latestReview = reviews[0];

    if (latestReview) {
      const byline = document.querySelector('.article-demo .byline');
      const titleEl = document.querySelector('.article-demo h4');
      const bodyTextEls = document.querySelectorAll('.article-demo .body-text');

      if (titleEl) titleEl.textContent = latestReview.title;
      if (byline) byline.textContent = `Review · ${new Date(latestReview.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} · oleh Redaksi`;
      
      if (bodyTextEls.length) {
        const paragraphs = latestReview.content.split('\n\n');
        bodyTextEls[0].textContent = paragraphs[0] || '';
        if (bodyTextEls[1]) bodyTextEls[1].textContent = paragraphs[1] || '';
      }

      const embedList = document.querySelector('.article-demo .embed-list');
      if (embedList) {
        embedList.innerHTML = '';
        if (latestReview.artist?.spotify) {
          embedList.innerHTML += `<a href="${latestReview.artist.spotify}" class="auto-embed-link">Spotify Artist</a>`;
        }
        embedList.innerHTML += `
          <a href="https://open.spotify.com/track/2AT8iROs4FQueDv2c8q2KE" class="auto-embed-link">Spotify: Contoh Lagu Hip-Hop</a>
          <a href="https://www.youtube.com/watch?v=VqB1uoDTdKM" class="auto-embed-link">YouTube: Contoh Video Musik</a>
        `;
        initAutoEmbeds();
      }

      if (colReview) {
        colReview.addEventListener('click', () => {
          showContentModal(
            latestReview.title,
            `Review · Rating: ${latestReview.rating || '–'}/10`,
            `<p>${latestReview.content.replace(/\n\n/g, '</p><p>')}</p>`
          );
        });
      }
    }
  } catch (err) {
    console.error('Failed to load home reviews:', err);
  }

  if (colRadar) {
    colRadar.addEventListener('click', async () => {
      try {
        const radarRes = await getReviews('radar');
        const radars = radarRes.data || [];
        if (!radars.length) {
          showContentModal('Release Radar', 'Rilisan Minggu Ini', '<p>Belum ada kurasi rilisan minggu ini.</p>');
          return;
        }

        const html = radars.map(r => `
          <div style="margin-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 16px;">
            <div style="font-family:'JetBrains Mono', monospace; font-size:12px; color:var(--red); text-transform:uppercase;">${escHtml(r.artist?.name || 'Unknown Artist')}</div>
            <h4 style="font-family:'Archivo Black', sans-serif; font-size:18px; margin: 4px 0 8px 0; color:#fff;">${escHtml(r.title)}</h4>
            <p style="font-size:14px; opacity:0.85; line-height:1.6;">${escHtml(r.content)}</p>
          </div>
        `).join('');

        showContentModal('Release Radar', 'Kumpulan Rilisan Terkurasi', html);
      } catch (err) {
        console.error('Failed to load release radar:', err);
      }
    });
  }
}

async function loadHomeLifestyle() {
  const cards = {
    'life-1': 'streetwear',
    'life-2': 'graffiti',
    'life-3': 'dance'
  };

  const labels = {
    'streetwear': 'Streetwear / Fashion',
    'graffiti': 'Graffiti / Mural',
    'dance': 'Dance / Breaking'
  };

  Object.entries(cards).forEach(([cardClass, category]) => {
    const el = document.querySelector(`.${cardClass}`);
    if (el) {
      el.style.cursor = 'pointer';
      el.addEventListener('click', async () => {
        try {
          const res = await getLifestyle(category);
          const posts = res.data || [];
          const latest = posts[0];

          if (!latest) {
            showContentModal(labels[category], 'Artikel Budaya', '<p>Belum ada artikel di kategori ini.</p>');
            return;
          }

          const dateStr = new Date(latest.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
          const subtitle = `${labels[category]} · ${latest.city || ''} · ${dateStr}`;

          showContentModal(
            latest.title,
            subtitle,
            `<p>${latest.content.replace(/\n\n/g, '</p><p>')}</p>`
          );
        } catch (err) {
          console.error(`Failed to load lifestyle ${category}:`, err);
        }
      });
    }
  });
}

async function loadHomeFeatures() {
  const card = document.getElementById('feature-card');
  try {
    const res = await getEditorials('interviews');
    const posts = res.data || [];
    const latest = posts[0];

    if (latest) {
      const quoteEl = document.querySelector('.feature-quote');
      const descEl = document.querySelector('.feature-editorial p:not(.feature-quote)');

      if (quoteEl) {
        quoteEl.innerHTML = `"${latest.title.replace(/"/g, '')}"`;
      }
      if (descEl) {
        const paragraphs = latest.content.split('\n\n');
        descEl.textContent = paragraphs[0] || '';
      }

      if (card) {
        card.addEventListener('click', () => {
          showContentModal(
            latest.title,
            'Eksklusif Interview · Skena Bawah Tanah',
            `<p>${latest.content.replace(/\n\n/g, '</p><p>')}</p>`
          );
        });
      }
    }
  } catch (err) {
    console.error('Failed to load editorials:', err);
  }
}

async function loadSongMeanings() {
  const colMeaning = document.getElementById('col-meaning');
  if (!colMeaning) return;

  colMeaning.addEventListener('click', async () => {
    try {
      const data = await getSongs();
      const songs = Array.isArray(data) ? data : (data.data || []);
      
      const songsWithMeaning = songs.filter(s => s.song_meaning && s.song_meaning.content);

      if (!songsWithMeaning.length) {
        showContentModal(
          'Makna Lagu',
          'Cerita Rilisan',
          '<p>Belum ada musisi yang membagikan makna di balik lagunya saat ini. Jadilah yang pertama!</p>'
        );
        return;
      }

      const listHtml = `
        <div class="meaning-list-container" style="display:flex; flex-direction:column; gap:16px;">
          ${songsWithMeaning.map(s => {
            const artistName = s.artist?.name || 'Unknown Artist';
            const safeContent = s.song_meaning.content.replace(/'/g, "\\'").replace(/"/g, '&quot;');
            return `
              <div class="meaning-item" data-title="${escHtml(s.title)}" data-artist="${escHtml(artistName)}" data-content="${escHtml(safeContent)}" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); padding:16px; border-radius:6px; cursor:pointer; transition:all 0.2s; display:flex; flex-direction:row; align-items:center; justify-content:flex-start; text-align:left; width:100%; box-sizing:border-box;">
                <div style="width:40px; height:40px; background:var(--ink); border-radius:4px; display:flex; align-items:center; justify-content:center; border:1px solid rgba(255,255,255,0.1); margin-right:16px; flex-shrink:0;">
                  <span style="font-size:18px; color:var(--red);">♪</span>
                </div>
                <div style="display:flex; flex-direction:column; gap:4px; align-items:flex-start; text-align:left;">
                  <h5 style="font-family:'Archivo Black', sans-serif; font-size:15px; margin:0; color:#fff; text-align:left;">${escHtml(s.title)}</h5>
                  <span style="font-family:'JetBrains Mono', monospace; font-size:11px; color:var(--grey); text-align:left;">${escHtml(artistName)}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;

      showContentModal('Makna Lagu', 'Pilih lagu untuk membaca ceritanya', listHtml);

      const modal = document.querySelector('.custom-modal-overlay');
      if (modal) {
        modal.querySelectorAll('.meaning-item').forEach(item => {
          item.addEventListener('click', () => {
            const title = item.dataset.title;
            const artist = item.dataset.artist;
            const content = item.dataset.content;
            
            modal.remove();

            showContentModal(
              title,
              `Makna Lagu · oleh ${artist}`,
              `<p style="font-size:16px; font-style:italic; border-left:3px solid var(--red); padding-left:16px; margin-bottom:24px; color:var(--grey);">${title} menceritakan tentang...</p>
               <p>${escHtml(content).replace(/\n\n/g, '</p><p>')}</p>
               <div style="margin-top:30px;"><button class="btn primary" id="back-to-meanings" style="padding:8px 16px; font-size:12px;">&larr; Kembali ke Daftar</button></div>`
            );

            const backBtn = document.getElementById('back-to-meanings');
            if (backBtn) {
              backBtn.addEventListener('click', () => {
                document.querySelector('.custom-modal-overlay')?.remove();
                document.getElementById('col-meaning').click();
              });
            }
          });
        });
      }

    } catch (err) {
      console.error('Failed to load song meanings:', err);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // For safety if router.js doesn't run, though router.js does the primary init
});
