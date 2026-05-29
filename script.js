// ModelDesk — script.js

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
  const btn = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => menu.classList.toggle('open'));
}

// === MODAL ==================================================
function openModal() {
  document.getElementById('signupModal')?.classList.add('open');
}
function closeModal() {
  document.getElementById('signupModal')?.classList.remove('open');
}
function initModal() {
  const overlay = document.getElementById('signupModal');
  if (!overlay) return;
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
}

// === LEARN PAGE NAVIGATION ==================================
function initLearn() {
  const links = document.querySelectorAll('.sidebar-link[data-article]');
  const articles = document.querySelectorAll('.learn-article');
  if (!links.length) return;
  function show(id) {
    articles.forEach(a => a.classList.remove('active'));
    links.forEach(l => l.classList.remove('active'));
    const art = document.getElementById('art-' + id);
    const link = document.querySelector(`.sidebar-link[data-article="${id}"]`);
    if (art) art.classList.add('active');
    if (link) link.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  links.forEach(link => link.addEventListener('click', () => show(link.dataset.article)));
}

// === FORM SUBMISSION (Netlify Forms) ========================
// Netlify detects the `netlify` attribute on the form at build time.
// On submit, we use fetch to POST without a page reload.
function handleForm(form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const original = btn.textContent;
    btn.textContent = 'Sending...';
    btn.disabled = true;

    const data = new FormData(form);

    try {
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data).toString()
      });
    } catch (_) {
      // fail silently — show success anyway
    }

    // Backup: store locally
    try {
      const obj = Object.fromEntries(data);
      obj.timestamp = new Date().toISOString();
      obj.page = window.location.href;
      localStorage.setItem('md_signup_' + Date.now(), JSON.stringify(obj));
    } catch (_) {}

    // Show success state
    form.style.display = 'none';
    const success = form.nextElementSibling;
    if (success?.classList.contains('form-success')) {
      const name = data.get('name')?.split(' ')[0] || 'there';
      const nameEl = success.querySelector('.success-name');
      if (nameEl) nameEl.textContent = name;
      success.style.display = 'block';
    }
  });
}

function initForms() {
  document.querySelectorAll('form[data-netlify]').forEach(handleForm);
}

// === ACTIVE NAV LINK ========================================
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
