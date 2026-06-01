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

    <!-- STEP 2: WhatsApp or Form -->
    <div class="mdp-step" id="mdpStep2" style="display:none">
      <div class="mdp-icon" id="mdpIcon"></div>
      <div class="mdp-badge mdp-badge-green">✓ We can help with that</div>
      <h3 class="mdp-title" id="mdpTitle2"></h3>
      <p class="mdp-sub" id="mdpSub2"></p>
      
      <a href="#" class="mdp-wa-btn" id="mdpWABtn" target="_blank">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width:1.2em;height:1.2em;fill:white;margin-right:0.5rem">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004c-1.769 0-3.44.561-4.823 1.604-.988.747-1.7 1.735-2.106 2.854-.437 1.219-.436 2.551.001 3.77.528 1.48 1.505 2.761 2.743 3.661 1.35 1.027 3.007 1.588 4.766 1.588 1.331 0 2.633-.286 3.863-.857l.455-.214 4.588 1.204-.31-4.883.194-.314c.447-.735.708-1.577.708-2.479 0-1.768-.561-3.44-1.604-4.823-.747-.988-1.736-1.7-2.855-2.106-1.219-.437-2.55-.436-3.769-.001"/>
        </svg>
        Message on WhatsApp
      </a>
      
      <div class="mdp-divider">
        <span>or leave your number</span>
      </div>
      
      <form class="mdp-form" id="mdpForm">
        <input type="hidden" name="access_key" value="${W3F_KEY}">
        <input type="hidden" name="user_email" value="">
        <input type="hidden" name="subject" id="mdpSubject" value="New ModelDesk enquiry">
        <input type="hidden" name="topic" id="mdpTopic">
        <input type="text"  name="name"     placeholder="Your name"    required>
        <input type="tel"   name="whatsapp" placeholder="WhatsApp (e.g. +44 7xx xxx xxx)" required>
        <select name="country" required>
          <option value="">Country</option>
          <option>United States</option>
          <option>United Kingdom</option>
          <option>Canada</option>
          <option>Australia</option>
          <option>New Zealand</option>
          <option>Germany</option>
          <option>France</option>
          <option>Netherlands</option>
          <option>Sweden</option>
          <option>Norway</option>
          <option>Denmark</option>
          <option>Switzerland</option>
          <option>Ireland</option>
          <option>South Africa</option>
          <option>Nigeria</option>
          <option>Ghana</option>
          <option>India</option>
          <option>Singapore</option>
          <option>UAE</option>
          <option>Brazil</option>
          <option>Kenya</option>
          <option>Zimbabwe</option>
          <option>Tanzania</option>
          <option>Uganda</option>
          <option>Other</option>
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
  
  // Personalized greeting with user's first name
  const firstName = mdUser?.displayName?.split(' ')[0] || 'there';
  document.getElementById('mdpTitle2').textContent =
    firstName + ', a ModelDesk designer can guide you through ' + a.label + ' — for free';
  
  // Set form values
  document.getElementById('mdpTopic').value = a.label;
  document.getElementById('mdpSubject').value = 'ModelDesk enquiry: ' + a.label;
  
  // Pre-fill name from Google auth
  const nameInput = document.querySelector('#mdpForm input[name="name"]');
  if (nameInput && mdUser?.displayName) nameInput.value = mdUser.displayName;
  
  // Pre-fill email if signed in
  const emailInput = document.querySelector('#mdpForm input[name="user_email"]');
  if (emailInput && mdUser?.email) emailInput.value = mdUser.email;
  
  // Build WhatsApp link with personalized message
  const waNumber = '16296290721';
  const waMessage = `Hi ModelDesk, I'm ${mdUser?.displayName || 'there'}! I need help with ${a.label}.`;
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;
  document.getElementById('mdpWABtn').href = waLink;
  
  // Set sub-text
  document.getElementById('mdpSub2').textContent = 'a designer will reach out, usually within a few hours. Free to ask.';
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
