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
  const links    = document.querySelectorAll('.sidebar-link[data-article]');
  const articles = document.querySelectorAll('.learn-article');
  if (!links.length) return;
  function show(id) {
    articles.forEach(a => a.classList.remove('active'));
    links.forEach(l => l.classList.remove('active'));
    document.getElementById('art-' + id)?.classList.add('active');
    document.querySelector(`.sidebar-link[data-article="${id}"]`)?.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  links.forEach(link => link.addEventListener('click', () => show(link.dataset.article)));
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
