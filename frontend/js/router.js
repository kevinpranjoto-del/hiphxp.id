// ─── PJAX Router (SPA Navigation) ──────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Initial page setup
  initPageScripts();
});

document.addEventListener('click', async (e) => {
  const link = e.target.closest('a');
  if (!link) return;

  const url = link.getAttribute('href');
  
  // Ignore external links or empty links or anchor links on the same page
  if (!url || url.startsWith('http') || url.startsWith('mailto:') || url.startsWith('https://wa.me')) return;
  if (url.startsWith('#')) {
    // Let native hash navigation happen, but don't preventDefault
    return;
  }

  // Handle local navigation
  e.preventDefault();

  // If the path contains an anchor (e.g. index.html#musik), split it
  const urlParts = url.split('#');
  const path = urlParts[0] || window.location.pathname; // if just "#" it should be caught above, but just in case
  const hash = urlParts[1] ? '#' + urlParts[1] : '';

  try {
    // Add loading state
    const mainContent = document.getElementById('app-content');
    if (mainContent) {
      mainContent.style.opacity = '0.5';
    }

    // Fetch new page
    const response = await fetch(path);
    if (!response.ok) throw new Error('Network response was not ok');
    const htmlText = await response.text();

    // Parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');

    // Update document title
    document.title = doc.title;

    // Swap content
    const newContent = doc.getElementById('app-content');
    if (mainContent && newContent) {
      mainContent.innerHTML = newContent.innerHTML;
      mainContent.style.opacity = '1';
    }

    // Swap header
    const mainHeader = document.querySelector('header.site');
    const newHeader = doc.querySelector('header.site');
    if (mainHeader && newHeader) {
      mainHeader.innerHTML = newHeader.innerHTML;
    }

    // Swap footer
    const mainFooter = document.querySelector('footer');
    const newFooter = doc.querySelector('footer');
    if (newFooter) {
      if (mainFooter) {
        mainFooter.outerHTML = newFooter.outerHTML;
      } else {
        const playerFooter = document.getElementById('player-footer');
        if (playerFooter) playerFooter.insertAdjacentHTML('beforebegin', newFooter.outerHTML);
      }
    } else if (mainFooter) {
      mainFooter.remove();
    }

    // Swap body class for themes
    document.body.className = doc.body.className;

    // Update URL history
    window.history.pushState({}, '', url);

    // Re-initialize page-specific scripts

    // Route specific initialization
    if (url.includes('dashboard') && window.initDashboard) {
      window.initDashboard();
    } else if (url.includes('login') && window.initLogin) {
      window.initLogin();
    } else if (url.includes('music') && window.initMusicPage) {
      window.initMusicPage();
    }
    
    initPageScripts();


    // Handle scroll to hash if exists, or top
    if (hash) {
      // Need a tiny delay to let the DOM settle before scrolling
      setTimeout(() => {
        const targetEl = document.getElementById(hash.substring(1));
        if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

  } catch (error) {
    console.error('Navigation error:', error);
    // Fallback to normal navigation
    window.location.href = url;
  }
});

// Handle Back/Forward buttons
window.addEventListener('popstate', async () => {
  const url = window.location.pathname + window.location.search;
  try {
    const response = await fetch(url);
    const htmlText = await response.text();
    const doc = new DOMParser().parseFromString(htmlText, 'text/html');
    document.title = doc.title;
    
    const mainContent = document.getElementById('app-content');
    const newContent = doc.getElementById('app-content');
    if (mainContent && newContent) {
      mainContent.innerHTML = newContent.innerHTML;
    }
    
    const mainHeader = document.querySelector('header.site');
    const newHeader = doc.querySelector('header.site');
    if (mainHeader && newHeader) {
      mainHeader.innerHTML = newHeader.innerHTML;
    }

    // Swap footer
    const mainFooter = document.querySelector('footer');
    const newFooter = doc.querySelector('footer');
    if (newFooter) {
      if (mainFooter) {
        mainFooter.outerHTML = newFooter.outerHTML;
      } else {
        const playerFooter = document.getElementById('player-footer');
        if (playerFooter) playerFooter.insertAdjacentHTML('beforebegin', newFooter.outerHTML);
      }
    } else if (mainFooter) {
      mainFooter.remove();
    }

    document.body.className = doc.body.className;
    

    // Route specific initialization
    if (url.includes('dashboard') && window.initDashboard) {
      window.initDashboard();
    } else if (url.includes('login') && window.initLogin) {
      window.initLogin();
    } else if (url.includes('music') && window.initMusicPage) {
      window.initMusicPage();
    }
    
    initPageScripts();

  } catch (error) {
    window.location.reload();
  }
});

// Re-initialize scripts after DOM swap
function initPageScripts() {
  if (typeof window.initApp === 'function') {
    window.initApp();
  }

  // Music Page logic (from music-player.js)
  if (document.getElementById('search-input') && typeof window.initMusicPage === 'function') {
    window.initMusicPage();
  }
}
