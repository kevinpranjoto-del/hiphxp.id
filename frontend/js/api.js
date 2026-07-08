/**
 * api.js — Backend connector for hiphxp.id
 * 
 * Auto-detects environment:
 * - localhost / 127.0.0.1  → uses local dev backend
 * - anything else          → uses production backend
 */

const IS_LOCAL = ['localhost', '127.0.0.1', ''].includes(window.location.hostname) && window.location.port !== '4000';
export const API_BASE_URL = IS_LOCAL ? 'http://localhost:4000' : ''; // Gunakan relative path untuk Unified Deployment (Backend + Frontend satu server)

// ─── Custom Modal Dialog System ─────────────────────────────────────────────
function createModalOverlay(contentHtml) {
  const overlay = document.createElement('div');
  overlay.className = 'custom-modal-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
  overlay.style.backdropFilter = 'blur(8px)';
  overlay.style.display = 'flex';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.zIndex = '99999';
  overlay.style.animation = 'fadeIn 0.2s ease-out';

  let style = document.getElementById('custom-modal-style');
  if (!style) {
    style = document.createElement('style');
    style.id = 'custom-modal-style';
    style.textContent = `
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      .custom-modal-box {
        background: #0f0f0f;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        padding: 30px;
        width: 90%;
        max-width: 420px;
        box-shadow: 0 20px 50px rgba(0,0,0,0.8);
        animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        font-family: 'Work Sans', sans-serif;
        color: #f2f1ec;
        text-align: center;
      }
      .custom-modal-title {
        font-family: 'Archivo Black', sans-serif;
        font-size: 16px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 15px;
        color: var(--red, #e5342a);
      }
      .custom-modal-body {
        font-size: 14px;
        line-height: 1.6;
        margin-bottom: 24px;
        opacity: 0.9;
      }
      .custom-modal-input {
        width: 100%;
        padding: 10px 14px;
        background: #151515;
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 4px;
        color: #fff;
        font-size: 14px;
        margin-bottom: 20px;
        box-sizing: border-box;
        outline: none;
        transition: border-color 0.2s;
      }
      .custom-modal-input:focus {
        border-color: var(--red, #e5342a);
      }
      .custom-modal-footer {
        display: flex;
        justify-content: center;
        gap: 12px;
      }
      .custom-modal-btn {
        padding: 8px 20px;
        border-radius: 4px;
        font-weight: 600;
        font-size: 13px;
        cursor: pointer;
        border: none;
        transition: all 0.2s;
        min-width: 90px;
        font-family: 'Work Sans', sans-serif;
      }
      .custom-modal-btn-primary {
        background: var(--red, #e5342a);
        color: #fff;
      }
      .custom-modal-btn-primary:hover {
        background: #ff4d44;
      }
      .custom-modal-btn-secondary {
        background: rgba(255,255,255,0.06);
        color: #f2f1ec;
        border: 1px solid rgba(255,255,255,0.1);
      }
      .custom-modal-btn-secondary:hover {
        background: rgba(255,255,255,0.12);
      }
    `;
    document.head.appendChild(style);
  }

  overlay.innerHTML = contentHtml;
  document.body.appendChild(overlay);
  return overlay;
}

window.customAlert = (message) => {
  return new Promise((resolve) => {
    const html = `
      <div class="custom-modal-box">
        <div class="custom-modal-title">PEMBERITAHUAN</div>
        <div class="custom-modal-body">${message}</div>
        <div class="custom-modal-footer">
          <button class="custom-modal-btn custom-modal-btn-primary" id="custom-alert-ok">OK</button>
        </div>
      </div>
    `;
    const overlay = createModalOverlay(html);
    overlay.querySelector('#custom-alert-ok').addEventListener('click', () => {
      overlay.remove();
      resolve();
    });
  });
};

window.customConfirm = (message) => {
  return new Promise((resolve) => {
    const html = `
      <div class="custom-modal-box">
        <div class="custom-modal-title">KONFIRMASI</div>
        <div class="custom-modal-body">${message}</div>
        <div class="custom-modal-footer">
          <button class="custom-modal-btn custom-modal-btn-secondary" id="custom-confirm-cancel">Batal</button>
          <button class="custom-modal-btn custom-modal-btn-primary" id="custom-confirm-ok">Ya</button>
        </div>
      </div>
    `;
    const overlay = createModalOverlay(html);
    overlay.querySelector('#custom-confirm-ok').addEventListener('click', () => {
      overlay.remove();
      resolve(true);
    });
    overlay.querySelector('#custom-confirm-cancel').addEventListener('click', () => {
      overlay.remove();
      resolve(false);
    });
  });
};

window.customPrompt = (message, defaultValue = '', type = 'text') => {
  return new Promise((resolve) => {
    const html = `
      <div class="custom-modal-box">
        <div class="custom-modal-title">MASUKKAN INPUT</div>
        <div class="custom-modal-body">${message}</div>
        <input type="${type}" class="custom-modal-input" id="custom-prompt-input" value="${defaultValue}">
        <div class="custom-modal-footer">
          <button class="custom-modal-btn custom-modal-btn-secondary" id="custom-prompt-cancel">Batal</button>
          <button class="custom-modal-btn custom-modal-btn-primary" id="custom-prompt-ok">Kirim</button>
        </div>
      </div>
    `;
    const overlay = createModalOverlay(html);
    const input = overlay.querySelector('#custom-prompt-input');
    input.focus();
    input.select();

    overlay.querySelector('#custom-prompt-ok').addEventListener('click', () => {
      const val = input.value;
      overlay.remove();
      resolve(val);
    });
    overlay.querySelector('#custom-prompt-cancel').addEventListener('click', () => {
      overlay.remove();
      resolve(null);
    });
  });
};


export function resolveUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${API_BASE_URL}${path}`;
}

/**
 * Generic fetch wrapper with error handling
 */
export async function apiFetch(path, options = {}) {
  try {
    const token = localStorage.getItem('access_token');
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers
    });
    if (!response.ok) {
      if (response.status === 401 && !path.includes('/auth/login')) {
        localStorage.removeItem('access_token');
        window.location.href = 'login.html';
        return;
      }
      const err = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(err.message || `HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn(`[API] ${path} failed:`, error.message);
    throw error;
  }
}

// ─── Endpoints ─────────────────────────────────────────────────────────────

/** GET /api/dashboard/stats */
export async function getStats() {
  return apiFetch('/api/dashboard/stats');
}

/** GET /api/songs */
export async function getSongs(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`/api/songs${qs ? '?' + qs : ''}`);
}

/** GET /api/artists */
export async function getArtists(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`/api/artists${qs ? '?' + qs : ''}`);
}

/** GET /api/collectives */
export async function getCollectives(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`/api/collectives${qs ? '?' + qs : ''}`);
}

/** GET /api/events */
export async function getEvents(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`/api/events${qs ? '?' + qs : ''}`);
}

/** GET /api/content/articles */
export async function getArticles(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`/api/content/articles${qs ? '?' + qs : ''}`);
}

/** GET /api/content/lifestyle (streetwear, graffiti, dance) */
export async function getLifestyle(category = 'streetwear', params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`/api/content/lifestyle/${category}${qs ? '?' + qs : ''}`);
}

/** GET /api/content/editorials (interviews, longforms, features) */
export async function getEditorials(category = 'interviews', params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`/api/content/editorials/${category}${qs ? '?' + qs : ''}`);
}

/** GET /api/content/reviews (music, radar) */
export async function getReviews(category = 'music', params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`/api/content/reviews/${category}${qs ? '?' + qs : ''}`);
}

/** POST /api/partnerships — submit partnership inquiry */
export async function submitPartnership(data) {
  return apiFetch('/api/partnerships', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ─── Auth & Musician Dashboard ─────────────────────────────────────────────

export async function loginMusician(email, password) {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

export async function registerMusician(data) {
  return apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

/** POST /api/songs */
export async function submitSong(formData, token) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/songs`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData // No Content-Type header so browser sets multipart boundary automatically
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(err.message || `HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn(`[API] /api/songs failed:`, error.message);
    throw error;
  }
}

/** GET /api/artists/me/profile */
export async function getMyProfile(token) {
  return apiFetch('/api/artists/me/profile', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
}

/** PUT /api/artists/me/profile */
export async function updateMyProfile(formData, token) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/artists/me/profile`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(err.message || `HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn(`[API] /api/artists/me/profile failed:`, error.message);
    throw error;
  }
}

/** POST /api/events */
export async function submitEvent(formData, token) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/events`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(err.message || `HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn(`[API] /api/events failed:`, error.message);
    throw error;
  }
}

/** GET /api/songs/me */
export async function getMySongs(token) {
  return apiFetch('/api/songs/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
}

/** PATCH /api/songs/:id */
export async function updateSongStatus(id, isHidden, token) {
  return apiFetch(`/api/songs/${id}`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ is_hidden: isHidden })
  });
}

/** DELETE /api/songs/:id */
export async function deleteSong(id, token) {
  return apiFetch(`/api/songs/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
}

/** GET /api/events/me */
export async function getMyEvents(token) {
  return apiFetch('/api/events/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
}

/** PATCH /api/events/:id */
export async function updateEventStatus(id, status, token) {
  return apiFetch(`/api/events/${id}`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ status })
  });
}

/** DELETE /api/events/:id */
export async function deleteEvent(id, token) {
  return apiFetch(`/api/events/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
}
