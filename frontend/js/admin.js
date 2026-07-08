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
