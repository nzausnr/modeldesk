// ModelDesk — script.js
const W3F_KEY = 'edda75a2-32f2-40d3-bf3d-753b9de10bef';

// === THEME ==================================================
const root = document.documentElement;
const saved = localStorage.getItem('md-theme') || 'light';
root.setAttribute('data-theme', saved);

function initTheme() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  btn.textContent = root.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙';
  btn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('md-theme', next);
    btn.textContent = next === 'dark' ? '☀️' : '🌙';
  });
}

// === MOBILE MENU ============================================
function initMobileMenu() {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => menu.classList.toggle('open'));

  // Mobile theme toggle — wired to button inside mobile menu
  const mobileThemeBtn = document.getElementById('mobileThemeToggle');
  if (mobileThemeBtn) {
    // Set initial label
    mobileThemeBtn.textContent = root.getAttribute('data-theme') === 'dark' ? '☀️ Light mode' : '🌙 Dark mode';
    mobileThemeBtn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem('md-theme', next);
      mobileThemeBtn.textContent = next === 'dark' ? '☀️ Light mode' : '🌙 Dark mode';
      // Sync desktop toggle too
      const desktopBtn = document.getElementById('themeToggle');
      if (desktopBtn) desktopBtn.textContent = next === 'dark' ? '☀️' : '🌙';
    });
  }
}

// === MODAL ==================================================
function openModal() {
  document.getElementById('signupModal')?.classList.add('open');
}
function closeModal() {
  document.getElementById('signupModal')?.classList.remove('open');
}
window.openModal = openModal;
window.closeModal = closeModal;
window.__mdScriptLoaded = true;
function initModal() {
  const overlay = document.getElementById('signupModal');
  if (!overlay) return;
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
}

// === LEARN PAGE NAVIGATION ==================================
function initLearn() {
  const links    = document.querySelectorAll('.sidebar-link[data-article]');
  const articles = document.querySelectorAll('.learn-article');
  if (!links.length) return;
  function show(id) {
    articles.forEach(a => a.classList.remove('active'));
    links.forEach(l => l.classList.remove('active'));
    const art = document.getElementById('art-' + id);
    const lnk = document.querySelector(`.sidebar-link[data-article="${id}"]`);
    if (art) art.classList.add('active');
    if (lnk) lnk.classList.add('active');
    // On mobile the sidebar stacks above the content, so scroll to
    // the article itself. On desktop they are side-by-side so scroll to top.
    if (window.innerWidth <= 768) {
      art?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
  links.forEach(link => link.addEventListener('click', (e) => {
    e.preventDefault();
    show(link.dataset.article);
    // On mobile: close the accordion after selection
    if (window.innerWidth <= 768) {
      document.querySelectorAll('.sidebar-group.open').forEach(g => g.classList.remove('open'));
    }
  }));

  // Mobile accordion — only active on small screens
  function initAccordion() {
    if (window.innerWidth > 768) return;
    const groups = Array.from(document.querySelectorAll('.learn-sidebar .sidebar-group'));

    function getGroupItems(group) {
      // Collect all siblings between this group and the next group (or end)
      const items = [];
      let el = group.nextElementSibling;
      while (el && !el.classList.contains('sidebar-group')) {
        items.push(el);
        el = el.nextElementSibling;
      }
      return items;
    }

    function closeAll() {
      groups.forEach(g => {
        g.classList.remove('open');
        getGroupItems(g).forEach(item => item.classList.remove('accordion-visible'));
      });
    }

    groups.forEach(group => {
      group.addEventListener('click', () => {
        const isOpen = group.classList.contains('open');
        closeAll();
        if (!isOpen) {
          group.classList.add('open');
          getGroupItems(group).forEach(item => item.classList.add('accordion-visible'));
        }
      });
    });
  }
  initAccordion();
}

// === FORM SUBMISSION (Web3Forms) ============================
function handleForm(form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Sending...';
    btn.disabled = true;

    const data = Object.fromEntries(new FormData(form));
    data.access_key = W3F_KEY;
    data.subject = 'New ModelDesk enquiry — ' + (data.country || 'Unknown');

    try {
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (_) {}

    // Backup
    try { localStorage.setItem('md_lead_' + Date.now(), JSON.stringify(data)); } catch(_) {}

    // Show success
    form.style.display = 'none';
    const success = form.nextElementSibling;
    if (success?.classList.contains('form-success')) {
      const name = data.name?.split(' ')[0] || 'there';
      const nameEl = success.querySelector('.success-name');
      if (nameEl) nameEl.textContent = name;
      success.style.display = 'block';
    }
  });
}

function initForms() {
  document.querySelectorAll('form.cta-form').forEach(handleForm);
}

// === ACTIVE NAV =============================================
function initActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });
}

// === INIT ===================================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileMenu();
  initModal();
  initLearn();
  initForms();
  initActiveNav();
});
