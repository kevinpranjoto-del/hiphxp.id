import { apiFetch } from './api.js?v=4';

document.addEventListener('DOMContentLoaded', async () => {
  // Check auth & role
  const token = localStorage.getItem('access_token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.role !== 'ADMIN' && payload.role !== 'SUPER_ADMIN') {
      await customAlert('Akses ditolak: Hanya Admin');
      window.location.href = 'dashboard.html';
      return;
    }
  } catch(e) {
    window.location.href = 'login.html';
  }

  await loadAdminStats();
  await loadAdminUsers();
  await loadAdminSongs();
  await loadAdminEvents();
  await loadAdminReviews();
  await loadAdminRadars();
  await loadAdminLifestyle('streetwear');
  await loadAdminInterviews();
  await populateArtistsDropdown();
  setupAdminForms();
});

async function loadAdminStats() {
  try {
    const stats = await apiFetch('/api/admin/stats');
    if (stats) {
      document.getElementById('stat-users').innerText = stats.users || 0;
      document.getElementById('stat-songs').innerText = stats.songs || 0;
      document.getElementById('stat-events').innerText = stats.events || 0;
      document.getElementById('stat-visitors').innerText = stats.visitors || 0;
    }
  } catch (err) {
    console.error('Failed to load admin stats', err);
  }
}

async function loadAdminUsers() {
  try {
    const users = await apiFetch('/api/admin/users');
    const tbody = document.getElementById('admin-users-list');
    if (!tbody) return;
    tbody.innerHTML = '';
    users.forEach(u => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${u.email}</td>
        <td>${u.account_type}</td>
        <td>${u.musician_profile?.artist_name || '-'}</td>
        <td>
          <button class="btn-primary btn-sm" onclick="changeUserPassword('${u.id}')" style="margin-right: 5px;">Ganti Password</button>
          <button class="btn-danger btn-sm" onclick="deleteUser('${u.id}')">Hapus</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) { console.error(err); }
}

async function loadAdminSongs() {
  try {
    const songs = await apiFetch('/api/admin/songs');
    const tbody = document.getElementById('admin-songs-list');
    if (!tbody) return;
    tbody.innerHTML = '';
    songs.forEach(s => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${s.title}</td>
        <td>${s.artist?.name || '-'}</td>
        <td>${s.release_date ? new Date(s.release_date).toLocaleDateString() : '-'}</td>
        <td>
          <button class="btn-danger btn-sm" onclick="deleteSong('${s.id}')">Hapus</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) { console.error(err); }
}

async function loadAdminEvents() {
  try {
    const events = await apiFetch('/api/admin/events');
    const tbody = document.getElementById('admin-events-list');
    if (!tbody) return;
    tbody.innerHTML = '';
    events.forEach(e => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${e.name || '-'}</td>
        <td>${e.venue || e.city || '-'}</td>
        <td>${e.event_date ? new Date(e.event_date).toLocaleDateString() : '-'}</td>
        <td>
          <button class="btn-danger btn-sm" onclick="deleteEvent('${e.id}')">Hapus</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) { console.error(err); }
}

window.deleteUser = async (id) => {
  if(!await customConfirm('Yakin hapus user ini?')) return;
  await apiFetch(`/api/admin/users/${id}`, { method: 'DELETE' });
  loadAdminUsers();
  loadAdminStats();
}

window.deleteSong = async (id) => {
  if(!await customConfirm('Yakin hapus lagu ini?')) return;
  await apiFetch(`/api/admin/songs/${id}`, { method: 'DELETE' });
  loadAdminSongs();
  loadAdminStats();
}

window.deleteEvent = async (id) => {
  if(!await customConfirm('Yakin hapus event ini?')) return;
  await apiFetch(`/api/admin/events/${id}`, { method: 'DELETE' });
  loadAdminEvents();
  loadAdminStats();
}

window.logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  window.location.href = 'index.html';
}

window.changeUserPassword = async (id) => {
  const newPassword = await customPrompt('Masukkan password baru untuk user ini (min. 6 karakter):', '', 'password');
  if (!newPassword) return;
  if (newPassword.length < 6) {
    await customAlert('Password minimal 6 karakter!');
    return;
  }
  
  try {
    const res = await apiFetch(`/api/admin/users/${id}/password`, {
      method: 'PUT',
      body: JSON.stringify({ newPassword })
    });
    if (res.success) {
      await customAlert('Password berhasil diubah!');
    }
  } catch (err) {
    await customAlert('Gagal mengubah password.');
  }
}

function setupAdminForms() {
  // Review form submit
  const formReview = document.getElementById('form-admin-review');
  if (formReview) {
    formReview.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('review-title').value;
      const slug = document.getElementById('review-slug').value;
      const artist_id = document.getElementById('review-artist-id').value;
      const rating = document.getElementById('review-rating').value;
      const content = document.getElementById('review-content').value;

      try {
        await apiFetch('/api/admin/reviews', {
          method: 'POST',
          body: JSON.stringify({ title, slug, artist_id, rating, content })
        });
        formReview.reset();
        await customAlert('Review berhasil dipublikasikan!');
        loadAdminReviews();
      } catch (err) {
        await customAlert('Gagal mempublikasikan review: ' + err.message);
      }
    });
  }

  // Radar form submit
  const formRadar = document.getElementById('form-admin-radar');
  if (formRadar) {
    formRadar.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('radar-title').value;
      const slug = document.getElementById('radar-slug').value;
      const artist_id = document.getElementById('radar-artist-id').value;
      const content = document.getElementById('radar-content').value;

      try {
        await apiFetch('/api/admin/radar', {
          method: 'POST',
          body: JSON.stringify({ title, slug, artist_id, content })
        });
        formRadar.reset();
        await customAlert('Radar berhasil dipublikasikan!');
        loadAdminRadars();
      } catch (err) {
        await customAlert('Gagal mempublikasikan radar: ' + err.message);
      }
    });
  }

  // Lifestyle form submit
  const formLifestyle = document.getElementById('form-admin-lifestyle');
  if (formLifestyle) {
    formLifestyle.addEventListener('submit', async (e) => {
      e.preventDefault();
      const category = document.getElementById('lifestyle-category').value;
      const title = document.getElementById('lifestyle-title').value;
      const slug = document.getElementById('lifestyle-slug').value;
      const city = document.getElementById('lifestyle-city').value;
      const province = document.getElementById('lifestyle-province').value;
      const content = document.getElementById('lifestyle-content').value;
      const imgFile = document.getElementById('lifestyle-image').files[0];

      const formData = new FormData();
      formData.append('title', title);
      formData.append('slug', slug);
      formData.append('city', city);
      formData.append('province', province);
      formData.append('content', content);
      if (imgFile) {
        formData.append('image', imgFile);
      }

      try {
        await apiFetch(`/api/admin/lifestyle/${category}`, {
          method: 'POST',
          body: formData
        });
        formLifestyle.reset();
        await customAlert('Post lifestyle berhasil dipublikasikan!');
        switchLifestyleSubtab(category);
      } catch (err) {
        await customAlert('Gagal mempublikasikan post lifestyle: ' + err.message);
      }
    });
  }

  // Interview form submit
  const formInterview = document.getElementById('form-admin-interview');
  if (formInterview) {
    formInterview.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('interview-title').value;
      const slug = document.getElementById('interview-slug').value;
      const content = document.getElementById('interview-content').value;
      const imgFile = document.getElementById('interview-image').files[0];

      const formData = new FormData();
      formData.append('title', title);
      formData.append('slug', slug);
      formData.append('content', content);
      if (imgFile) {
        formData.append('image', imgFile);
      }

      try {
        await apiFetch('/api/admin/interviews', {
          method: 'POST',
          body: formData
        });
        formInterview.reset();
        await customAlert('Wawancara/editorial berhasil dipublikasikan!');
        loadAdminInterviews();
      } catch (err) {
        await customAlert('Gagal mempublikasikan wawancara: ' + err.message);
      }
    });
  }

  // Setup auto-slugging
  autoSlug('review-title', 'review-slug');
  autoSlug('radar-title', 'radar-slug');
  autoSlug('lifestyle-title', 'lifestyle-slug');
  autoSlug('interview-title', 'interview-slug');

  // Lifestyle subtab switchers
  const subtabs = ['streetwear', 'graffiti', 'dance'];
  subtabs.forEach(sub => {
    const btn = document.getElementById(`subtab-${sub}`);
    if (btn) {
      btn.addEventListener('click', () => {
        subtabs.forEach(s => {
          const b = document.getElementById(`subtab-${s}`);
          if (b) {
            b.classList.remove('btn-primary', 'active-subtab');
            b.style.background = 'rgba(255,255,255,0.05)';
            b.style.color = '#fff';
            b.style.border = '1px solid rgba(255,255,255,0.1)';
          }
        });
        btn.classList.add('btn-primary', 'active-subtab');
        btn.style.background = '';
        btn.style.color = '';
        btn.style.border = '';
        loadAdminLifestyle(sub);
      });
    }
  });
}

function switchLifestyleSubtab(category) {
  const btn = document.getElementById(`subtab-${category}`);
  if (btn) btn.click();
}

async function populateArtistsDropdown() {
  try {
    const artists = await apiFetch('/api/admin/artists');
    const selectReview = document.getElementById('review-artist-id');
    const selectRadar = document.getElementById('radar-artist-id');
    
    const optionsHtml = artists.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
    if (selectReview) selectReview.innerHTML = optionsHtml;
    if (selectRadar) selectRadar.innerHTML = optionsHtml;
  } catch (err) {
    console.error('Failed to load artists for dropdown', err);
  }
}

async function loadAdminReviews() {
  try {
    const reviews = await apiFetch('/api/admin/reviews');
    const tbody = document.getElementById('admin-reviews-list');
    if (!tbody) return;
    tbody.innerHTML = '';
    reviews.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${r.title}</td>
        <td>${r.artist?.name || '-'}</td>
        <td>${r.rating || '-'}</td>
        <td>
          <button class="btn-danger btn-sm" onclick="deleteReview('${r.id}')">Hapus</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) { console.error(err); }
}

async function loadAdminRadars() {
  try {
    const radars = await apiFetch('/api/admin/radar');
    const tbody = document.getElementById('admin-radar-list');
    if (!tbody) return;
    tbody.innerHTML = '';
    radars.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${r.title}</td>
        <td>${r.artist?.name || '-'}</td>
        <td>
          <button class="btn-danger btn-sm" onclick="deleteRadar('${r.id}')">Hapus</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) { console.error(err); }
}

async function loadAdminLifestyle(category) {
  try {
    const posts = await apiFetch(`/api/admin/lifestyle/${category}`);
    const tbody = document.getElementById('admin-lifestyle-list');
    if (!tbody) return;
    tbody.innerHTML = '';
    posts.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${p.title}</td>
        <td>${p.city || p.province || '-'}</td>
        <td>
          <button class="btn-danger btn-sm" onclick="deleteLifestyle('${category}', '${p.id}')">Hapus</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) { console.error(err); }
}

async function loadAdminInterviews() {
  try {
    const interviews = await apiFetch('/api/admin/interviews');
    const tbody = document.getElementById('admin-interviews-list');
    if (!tbody) return;
    tbody.innerHTML = '';
    interviews.forEach(i => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${i.title}</td>
        <td>
          <button class="btn-danger btn-sm" onclick="deleteInterview('${i.id}')">Hapus</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) { console.error(err); }
}

window.deleteReview = async (id) => {
  if (!await customConfirm('Yakin hapus review ini?')) return;
  try {
    await apiFetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
    loadAdminReviews();
  } catch (err) {
    await customAlert('Gagal menghapus review.');
  }
}

window.deleteRadar = async (id) => {
  if (!await customConfirm('Yakin hapus radar ini?')) return;
  try {
    await apiFetch(`/api/admin/radar/${id}`, { method: 'DELETE' });
    loadAdminRadars();
  } catch (err) {
    await customAlert('Gagal menghapus radar.');
  }
}

window.deleteLifestyle = async (category, id) => {
  if (!await customConfirm(`Yakin hapus post ${category} ini?`)) return;
  try {
    await apiFetch(`/api/admin/lifestyle/${category}/${id}`, { method: 'DELETE' });
    loadAdminLifestyle(category);
  } catch (err) {
    await customAlert('Gagal menghapus post lifestyle.');
  }
}

window.deleteInterview = async (id) => {
  if (!await customConfirm('Yakin hapus wawancara ini?')) return;
  try {
    await apiFetch(`/api/admin/interviews/${id}`, { method: 'DELETE' });
    loadAdminInterviews();
  } catch (err) {
    await customAlert('Gagal menghapus wawancara.');
  }
}

function autoSlug(titleInputId, slugInputId) {
  const titleInput = document.getElementById(titleInputId);
  const slugInput = document.getElementById(slugInputId);
  if (titleInput && slugInput) {
    titleInput.addEventListener('input', () => {
      slugInput.value = titleInput.value
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
        .replace(/\s+/g, '-')       // collapse whitespace and replace by -
        .replace(/-+/g, '-');       // collapse dashes
    });
  }
}
