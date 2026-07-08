import { loginMusician, registerMusician } from './api.js?v=4';


window.initLogin = function() {
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');
  
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        forms.forEach(f => f.classList.remove('active'));
        
        tab.classList.add('active');
        document.getElementById(`${tab.dataset.target}-form`).classList.add('active');
      });
    });
  
    function showToast(msg) {
      const t = document.getElementById('toast');
      t.textContent = msg;
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 3000);
    }
  
    // Redirect if already logged in
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role === 'ADMIN' || payload.role === 'SUPER_ADMIN') {
          window.location.href = 'admin.html';
        } else {
          window.location.href = 'dashboard.html';
        }
      } catch (e) {
        window.location.href = 'dashboard.html';
      }
    }
  
    // Login
    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const pass = document.getElementById('login-password').value;
      
      try {
        const res = await loginMusician(email, pass);
        if (res.accessToken) {
          localStorage.setItem('access_token', res.accessToken);
          try {
            const payload = JSON.parse(atob(res.accessToken.split('.')[1]));
            if (payload.role === 'ADMIN' || payload.role === 'SUPER_ADMIN') {
              window.location.href = 'admin.html';
            } else {
              window.location.href = 'dashboard.html';
            }
          } catch (e) {
            window.location.href = 'dashboard.html';
          }
        } else {
          showToast(res.message || 'Login gagal.');
        }
      } catch (err) {
        showToast('Terjadi kesalahan pada sistem.');
      }
    });
  
    // Register
    document.getElementById('register-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = {
        artistName: document.getElementById('reg-artist-name').value,
        realName: document.getElementById('reg-real-name').value,
        email: document.getElementById('reg-email').value,
        password: document.getElementById('reg-password').value,
        city: document.getElementById('reg-city').value,
        whatsapp: document.getElementById('reg-wa').value,
        instagram: document.getElementById('reg-ig').value,
        spotifyArtistUrl: document.getElementById('reg-spotify').value,
      };
      
      try {
        const res = await registerMusician(data);
        if (res.user) {
          showToast('Pendaftaran berhasil! Silakan login.');
          document.querySelector('[data-target="login"]').click();
          document.getElementById('login-email').value = data.email;
          document.getElementById('login-password').value = data.password;
        } else {
          showToast(res.message || 'Pendaftaran gagal.');
        }
      } catch (err) {
        showToast('Email mungkin sudah terdaftar atau terjadi kesalahan.');
      }
    });
  
    // Mobile menu script
    const mobileOpen = document.getElementById('mobile-open');
    const mobileClose = document.getElementById('mobile-close');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileOpen && mobileClose && mobileMenu) {
      mobileOpen.addEventListener('click', () => mobileMenu.classList.add('open'));
      mobileClose.addEventListener('click', () => mobileMenu.classList.remove('open'));
      mobileMenu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => mobileMenu.classList.remove('open'));
      });
    }
  
};

// Auto-init if loaded directly
if (document.getElementById('login-form')) {
  window.initLogin();
}
