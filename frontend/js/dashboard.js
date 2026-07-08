import { submitSong, submitEvent, getMyProfile, updateMyProfile, getMySongs, updateSongStatus, deleteSong, getMyEvents, updateEventStatus, deleteEvent, resolveUrl } from './api.js?v=4';

// ─── XSS Protection ──────────────────────────────────────────────────────────
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

window.initDashboard = function() {
  // Check Auth
  const token = localStorage.getItem('access_token');
  if (!token) {
    window.location.href = 'login.html';
  }
  
  function parseJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(window.atob(base64));
    } catch (e) {
      return null;
    }
  }
  
  function getDecodedToken() {
    const token = localStorage.getItem('access_token');
    return token ? parseJwt(token) : null;
  }
  
  // Load Profile
  async function loadProfile() {
    const token = localStorage.getItem('access_token');
    try {
      const profile = await getMyProfile(token);
      if (profile) {
        document.getElementById('prof-artist-name').value = profile.artist_name || '';
        document.getElementById('prof-real-name').value = profile.real_name || '';
        document.getElementById('prof-bio').value = profile.bio || '';
        document.getElementById('prof-city').value = profile.city || '';
        document.getElementById('prof-whatsapp').value = profile.whatsapp || '';
        document.getElementById('prof-instagram').value = profile.instagram || '';
        document.getElementById('prof-spotify').value = profile.spotify_artist_url || '';
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  }
  
  // Load Songs
  async function loadMySongs() {
    const token = localStorage.getItem('access_token');
    try {
      const res = await getMySongs(token);
      const container = document.getElementById('my-songs-list');
      if (!container) return;
      
      if (!res.data || res.data.length === 0) {
        container.innerHTML = `<tr><td colspan="5" style="padding: 24px; text-align: center; color: rgba(255,255,255,0.5);">Belum ada lagu yang diunggah.</td></tr>`;
        return;
      }
      
      container.innerHTML = res.data.map(song => {
        const coverUrl = song.cover_image ? resolveUrl(song.cover_image) : 'assets/default-cover.jpg';
        const releaseDate = song.release_date ? new Date(song.release_date).toLocaleDateString('id-ID') : '-';
        const statusText = song.is_hidden ? 'Tersembunyi' : 'Publik';
        const statusClass = song.is_hidden ? 'status-hidden' : 'status-public';
        const toggleLabel = song.is_hidden ? 'Tampilkan' : 'Sembunyikan';
        
        return `
          <tr style="border-bottom: 1px solid rgba(242,241,236,0.1); font-size: 14px;">
            <td style="padding: 12px 16px;">
              <img src="${escHtml(coverUrl)}" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;">
            </td>
            <td style="padding: 12px 16px; font-weight: 600;">${escHtml(song.title)}</td>
            <td style="padding: 12px 16px; font-family: 'JetBrains Mono', monospace;">${escHtml(releaseDate)}</td>
            <td style="padding: 12px 16px;">
              <span class="status-badge ${statusClass}" style="padding: 4px 8px; border-radius: 4px; font-size: 11px; font-family: 'JetBrains Mono', monospace; font-weight: bold; background: ${song.is_hidden ? 'rgba(255, 193, 7, 0.15)' : 'rgba(40, 167, 69, 0.15)'}; color: ${song.is_hidden ? '#ffc107' : '#28a745'}">
                ${escHtml(statusText)}
              </span>
            </td>
            <td style="padding: 12px 16px; text-align: right;">
              <button class="btn-action toggle-song" data-id="${escHtml(song.id)}" data-hidden="${song.is_hidden ? 'true' : 'false'}" style="background: none; border: 1px solid rgba(255,255,255,0.2); color: white; padding: 6px 12px; border-radius: 4px; cursor: pointer; margin-right: 8px; font-size: 12px;">${escHtml(toggleLabel)}</button>
              <button class="btn-action delete-song" data-id="${escHtml(song.id)}" style="background: rgba(220,53,69,0.2); border: 1px solid #dc3545; color: #ff6b6b; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">Hapus</button>
            </td>
          </tr>
        `;
      }).join('');
      
      // Bind actions
      container.querySelectorAll('.toggle-song').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id;
          const isHidden = btn.dataset.hidden === 'true';
          try {
            await updateSongStatus(id, !isHidden, token);
            showToast('Status lagu berhasil diperbarui!');
            loadMySongs();
          } catch (err) {
            await customAlert('Gagal mengubah status: ' + err.message);
          }
        });
      });
      
      container.querySelectorAll('.delete-song').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!await customConfirm('Apakah Anda yakin ingin menghapus lagu ini secara permanen?')) return;
          const id = btn.dataset.id;
          try {
            await deleteSong(id, token);
            showToast('Lagu berhasil dihapus!');
            loadMySongs();
          } catch (err) {
            await customAlert('Gagal menghapus lagu: ' + err.message);
          }
        });
      });
      
    } catch (err) {
      console.error('Failed to load songs:', err);
    }
  }
  
  // Load Events
  async function loadMyEvents() {
    const token = localStorage.getItem('access_token');
    try {
      const res = await getMyEvents(token);
      const container = document.getElementById('my-events-list');
      if (!container) return;
      
      if (!res || res.length === 0) {
        container.innerHTML = `<tr><td colspan="5" style="padding: 24px; text-align: center; color: rgba(255,255,255,0.5);">Belum ada event yang dijadwalkan.</td></tr>`;
        return;
      }
      
      container.innerHTML = res.map(event => {
        const posterUrl = event.image_url ? resolveUrl(event.image_url) : 'assets/default-poster.jpg';
        const eventDate = event.event_date ? new Date(event.event_date).toLocaleDateString('id-ID') : '-';
        const isActive = event.status === 'PUBLISHED';
        const statusText = isActive ? 'Aktif' : 'Draft/Hidden';
        const statusClass = isActive ? 'status-public' : 'status-hidden';
        const toggleLabel = isActive ? 'Sembunyikan' : 'Aktifkan';
        
        return `
          <tr style="border-bottom: 1px solid rgba(242,241,236,0.1); font-size: 14px;">
            <td style="padding: 12px 16px;">
              <img src="${escHtml(posterUrl)}" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;">
            </td>
            <td style="padding: 12px 16px; font-weight: 600;">${escHtml(event.name)}</td>
            <td style="padding: 12px 16px; font-family: 'JetBrains Mono', monospace;">${escHtml(eventDate)} (${escHtml(event.city || '-')})</td>
            <td style="padding: 12px 16px;">
              <span class="status-badge ${statusClass}" style="padding: 4px 8px; border-radius: 4px; font-size: 11px; font-family: 'JetBrains Mono', monospace; font-weight: bold; background: ${!isActive ? 'rgba(255, 193, 7, 0.15)' : 'rgba(40, 167, 69, 0.15)'}; color: ${!isActive ? '#ffc107' : '#28a745'}">
                ${escHtml(statusText)}
              </span>
            </td>
            <td style="padding: 12px 16px; text-align: right;">
              <button class="btn-action toggle-event" data-id="${escHtml(event.id)}" data-status="${escHtml(event.status)}" style="background: none; border: 1px solid rgba(255,255,255,0.2); color: white; padding: 6px 12px; border-radius: 4px; cursor: pointer; margin-right: 8px; font-size: 12px;">${escHtml(toggleLabel)}</button>
              <button class="btn-action delete-event" data-id="${escHtml(event.id)}" style="background: rgba(220,53,69,0.2); border: 1px solid #dc3545; color: #ff6b6b; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">Hapus</button>
            </td>
          </tr>
        `;
      }).join('');
      
      // Bind actions
      container.querySelectorAll('.toggle-event').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id;
          const status = btn.dataset.status;
          const newStatus = status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
          try {
            await updateEventStatus(id, newStatus, token);
            showToast('Status event berhasil diperbarui!');
            loadMyEvents();
          } catch (err) {
            await customAlert('Gagal mengubah status event: ' + err.message);
          }
        });
      });
      
      container.querySelectorAll('.delete-event').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!await customConfirm('Apakah Anda yakin ingin menghapus event ini?')) return;
          const id = btn.dataset.id;
          try {
            await deleteEvent(id, token);
            showToast('Event berhasil dihapus!');
            loadMyEvents();
          } catch (err) {
            await customAlert('Gagal menghapus event: ' + err.message);
          }
        });
      });
      
    } catch (err) {
      console.error('Failed to load events:', err);
    }
  }
  
  const user = getDecodedToken();
  const welcomeEl = document.getElementById('welcome-name');
  if (welcomeEl && user && user.email) {
    welcomeEl.textContent = user.email.split('@')[0];
  }
  
  loadProfile();
  
  const profileForm = document.getElementById('profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = profileForm.querySelector('button');
      btn.textContent = 'Menyimpan...';
      
      const formData = new FormData();
      formData.append('artist_name', document.getElementById('prof-artist-name').value);
      formData.append('real_name', document.getElementById('prof-real-name').value);
      formData.append('bio', document.getElementById('prof-bio').value);
      formData.append('city', document.getElementById('prof-city').value);
      formData.append('whatsapp', document.getElementById('prof-whatsapp').value);
      formData.append('instagram', document.getElementById('prof-instagram').value);
      formData.append('spotify_artist_url', document.getElementById('prof-spotify').value);
      
      const photoInput = document.getElementById('prof-photo');
      if (photoInput.files[0]) {
        formData.append('profile_photo', photoInput.files[0]);
      }
      
      try {
        await updateMyProfile(formData, localStorage.getItem('access_token'));
        await customAlert('Profil berhasil diperbarui!');
      } catch (err) {
        await customAlert('Gagal memperbarui profil: ' + err.message);
      } finally {
        btn.textContent = 'Simpan Profil';
      }
    });
  }

  // Form Upload Rilisan (Lagu)
  const songForm = document.getElementById('form-song');
  if (songForm) {
    songForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = songForm.querySelector('button');
      btn.textContent = 'Mengunggah...';

      try {
        const formData = new FormData();
        formData.append('title', document.getElementById('song-title').value);
        formData.append('slug', document.getElementById('song-slug').value);
        formData.append('release_date', document.getElementById('song-date').value);
        
        const tokenPayload = getDecodedToken();
        formData.append('artist_id', tokenPayload.id); 

        const audioInput = document.getElementById('song-audio');
        if (audioInput.files[0]) formData.append('audio', audioInput.files[0]);
        
        const coverInput = document.getElementById('song-cover');
        if (coverInput.files[0]) formData.append('cover', coverInput.files[0]);
        
        await submitSong(formData, localStorage.getItem('access_token'));
        await customAlert('Rilisan berhasil diunggah!');
        songForm.reset();
        loadMySongs(); // Refresh songs list
      } catch (err) {
        await customAlert('Gagal mengunggah rilisan: ' + err.message);
      } finally {
        btn.textContent = 'PUBLISH LAGU';
      }
    });
  }
  
  // Let's implement a simple toast
  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
  }
  
  // UI Tabs
  const tabs = document.querySelectorAll('.dash-tab');
  const sections = document.querySelectorAll('.dash-content section');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));
      
      tab.classList.add('active');
      document.getElementById(tab.dataset.target).classList.add('active');
  
      if (tab.dataset.target === 'kelola-rilisan') {
        loadMySongs();
        loadMyEvents();
      }
    });
  });
  
  // Logout
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      localStorage.removeItem('access_token');
      window.location.href = 'login.html';
    });
  }
  
  
    // Submit Event
  const formEvent = document.getElementById('form-event');
  if (formEvent) {
    formEvent.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData();
      formData.append('title', document.getElementById('event-title').value);
      formData.append('slug', document.getElementById('event-title').value.toLowerCase().replace(/ /g, '-'));
      formData.append('category', document.getElementById('event-category').value);
      formData.append('event_date', document.getElementById('event-date').value);
      formData.append('city', document.getElementById('event-city').value);
      formData.append('location', document.getElementById('event-location').value);
      
      const posterInput = document.getElementById('event-poster');
      if (posterInput.files[0]) {
        formData.append('poster', posterInput.files[0]);
      }
    
      try {
        const res = await submitEvent(formData, token);
        if (res.id) {
          showToast('Acara berhasil dijadwalkan!');
          e.target.reset();
          loadMyEvents(); // Refresh events list
        } else {
          showToast(res.message || 'Gagal membuat acara.');
        }
      } catch (err) {
        showToast('Terjadi kesalahan pada sistem.');
      }
    });
  }
  
};

// Auto-init if loaded directly
if (document.querySelector('.dash-tab')) {
  window.initDashboard();
}
