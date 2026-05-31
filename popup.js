// ModelDesk — popup.js
// Flow: 1) Google sign-in gate (first visit only)  2) Survey popup (once per session)

const W3F_KEY   = 'edda75a2-32f2-40d3-bf3d-753b9de10bef';
const SEEN_KEY  = 'md_popup_v2';       // survey popup already shown
const AUTH_KEY  = 'md_authed';         // user has signed in at least once

const answers = {
  'architecture': { label: 'an architecture model', icon: '🏗' },
  'laser':        { label: 'laser cutting',          icon: '✂️' },
  'sketchup':     { label: 'SketchUp design',        icon: '🖥' },
  'question':     { label: 'a design question',      icon: '📐' }
};

let mdUser = null;

/* ── SIGN-IN GATE ──────────────────────────────────────────── */

function buildSignInGate() {
  const el = document.createElement('div');
  el.id = 'mdGate';
  el.innerHTML = `
<div class="mdg-overlay" id="mdgOverlay">
  <div class="mdg-card">
    <div class="mdg-logo">Model<span>Desk</span></div>
    <div class="mdg-tagline">For designers who build.</div>
    <h2 class="mdg-heading">Welcome — sign in to continue</h2>
    <p class="mdg-sub">Get free resources, guides, and expert help matched to what you're making.</p>
    <button class="mdg-google-btn" id="mdgSignInBtn">
      <svg class="mdg-google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      Continue with Google
    </button>
    <div class="mdg-error" id="mdgError">Something went wrong — please try again.</div>
  </div>
</div>`;
  document.body.appendChild(el);
}

function showSignInGate() {
  buildSignInGate();
  document.getElementById('mdgOverlay').classList.add('mdg-open');

  // Block Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') e.preventDefault();
  });

  // Block clicking outside the card — do nothing
  document.getElementById('mdgOverlay').addEventListener('click', e => {
    e.stopPropagation();
  });

  document.getElementById('mdgSignInBtn').addEventListener('click', async () => {
    const btn = document.getElementById('mdgSignInBtn');
    const err = document.getElementById('mdgError');
    btn.disabled = true;
    btn.textContent = 'Signing in…';
    err.style.display = 'none';
    try {
      await window.mdAuth.signInWithGoogle();
      // onAuthStateChanged will handle closing gate + showing popup
    } catch (e) {
      console.warn('Sign-in failed', e);
      btn.disabled = false;
      btn.innerHTML = `<svg class="mdg-google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg> Continue with Google`;
      err.style.display = 'block';
    }
  });

}

function closeSignInGate() {
  document.getElementById('mdgOverlay')?.classList.remove('mdg-open');
}

/* ── SURVEY POPUP ──────────────────────────────────────────── */

function buildPopup() {
  const el = document.createElement('div');
  el.id = 'mdPopup';
  el.innerHTML = `
<div class="mdp-overlay" id="mdpOverlay">
  <div class="mdp-card" id="mdpCard">

    <!-- STEP 1: Survey -->
    <div class="mdp-step" id="mdpStep1">
      <div class="mdp-badge">// Free consultation</div>
      <h3 class="mdp-title">What are you working on right now?</h3>
      <p class="mdp-sub">Click your answer — we'll match you with the right help.</p>
      <div class="mdp-options">
        <button class="mdp-option" data-key="architecture">🏗 Architecture model</button>
        <button class="mdp-option" data-key="laser">✂️ Laser cutting</button>
        <button class="mdp-option" data-key="sketchup">🖥 Learning SketchUp</button>
        <button class="mdp-option" data-key="question">📐 Specific design question</button>
      </div>
      <button class="mdp-skip" id="mdpSkip1" style="display:none">I'm just browsing</button>
    </div>

    <!-- STEP 2: Form -->
    <div class="mdp-step" id="mdpStep2" style="display:none">
      <div class="mdp-icon" id="mdpIcon"></div>
      <div class="mdp-badge mdp-badge-green">✓ We can help with that</div>
      <h3 class="mdp-title" id="mdpTitle2"></h3>
      <p class="mdp-sub">Leave your WhatsApp — a designer will reach out, usually within a few hours. Free to ask.</p>
      <form class="mdp-form" id="mdpForm">
        <input type="hidden" name="access_key" value="${W3F_KEY}">
        <input type="hidden" name="user_email" value="">
        <input type="hidden" name="subject" id="mdpSubject" value="New ModelDesk enquiry">
        <input type="hidden" name="topic" id="mdpTopic">
        <input type="text"  name="name"     placeholder="Your name"    required>
        <input type="tel"   name="whatsapp" placeholder="WhatsApp (e.g. +44 7xx xxx xxx)" required>
        <select name="country" required>
          <option value="">Country</option>
          <option>Australia</option><option>Kenya</option>
          <option>United Kingdom</option><option>United States</option>
          <option>South Africa</option><option>Nigeria</option>
          <option>India</option><option>New Zealand</option>
          <option>Canada</option><option>Other</option>
        </select>
        <button type="submit" class="mdp-btn">Connect with a designer →</button>
      </form>
      <div class="mdp-success" id="mdpSuccess" style="display:none">
        <div style="font-size:2rem;margin-bottom:0.5rem">✓</div>
        <strong>You're connected!</strong>
        <p>Thanks <span id="mdpName"></span>! A designer will message you on WhatsApp shortly.</p>
      </div>
      <button class="mdp-negative" id="mdpSkip2">No thanks, I'll figure it out myself</button>
    </div>

  </div>
</div>`;
  document.body.appendChild(el);
}

function closePopup() {
  document.getElementById('mdpOverlay')?.classList.remove('mdp-open');
  sessionStorage.setItem(SEEN_KEY, '1');
}

function goStep2(key) {
  const a = answers[key];
  document.getElementById('mdpStep1').style.display = 'none';
  document.getElementById('mdpStep2').style.display = 'block';
  document.getElementById('mdpIcon').textContent = a.icon;
  document.getElementById('mdpTitle2').textContent =
    'Great — we help with ' + a.label + ' every day';
  document.getElementById('mdpTopic').value = a.label;
  document.getElementById('mdpSubject').value = 'ModelDesk enquiry: ' + a.label;
  // pre-fill email if signed in
  const emailInput = document.querySelector('#mdpForm input[name="user_email"]');
  if (emailInput && mdUser?.email) emailInput.value = mdUser.email;
}

function initSurveyPopup() {
  if (sessionStorage.getItem(SEEN_KEY)) return;
  buildPopup();

  document.getElementById('mdpOverlay').classList.add('mdp-open');
  setTimeout(() => {
    document.getElementById('mdpSkip1')?.style.setProperty('display', 'block');
  }, 5000);

  document.querySelectorAll('.mdp-option').forEach(btn => {
    btn.addEventListener('click', () => goStep2(btn.dataset.key));
  });
  document.getElementById('mdpSkip1')?.addEventListener('click', () => goStep2('question'));
  document.getElementById('mdpSkip2')?.addEventListener('click', closePopup);
  document.getElementById('mdpOverlay')?.addEventListener('click', e => {
    if (e.target.id === 'mdpOverlay') closePopup();
  });

  document.getElementById('mdpForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.target;
    const btn  = form.querySelector('button[type="submit"]');
    btn.textContent = 'Sending...';
    btn.disabled = true;

    const data = Object.fromEntries(new FormData(form));
    if (mdUser?.email) data.user_email = mdUser.email;

    try {
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (_) {}

    try { localStorage.setItem('md_lead_' + Date.now(), JSON.stringify(data)); } catch (_) {}

    form.style.display = 'none';
    document.getElementById('mdpSkip2').style.display = 'none';
    document.getElementById('mdpSuccess').style.display = 'block';
    document.getElementById('mdpName').textContent = data.name?.split(' ')[0] || 'there';
    sessionStorage.setItem(SEEN_KEY, '1');
  });
}

/* ── INIT ──────────────────────────────────────────────────── */

function init() {
  // Wait for Firebase auth to be ready
  if (!window.mdAuth) {
    // Firebase not loaded yet — nothing to do
    return;
  }

  window.mdAuth.onAuthStateChanged(user => {
    mdUser = user;

    if (user) {
      // Signed in: mark authed, close gate if open, show survey
      localStorage.setItem(AUTH_KEY, '1');
      closeSignInGate();
      initSurveyPopup();
    } else {
      // Not signed in — always show gate, no bypass
      showSignInGate();
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
