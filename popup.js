// ModelDesk — popup.js
// Multi-step survey popup with Web3Forms notification

const W3F_KEY = 'edda75a2-32f2-40d3-bf3d-753b9de10bef';
const SEEN_KEY = 'md_popup_v2';

const answers = {
  'architecture': { label: 'an architecture model', icon: '🏗' },
  'laser':        { label: 'laser cutting',          icon: '✂️' },
  'sketchup':     { label: 'SketchUp design',        icon: '🖥' },
  'question':     { label: 'a design question',      icon: '📐' }
};

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
      <button class="mdp-skip" id="mdpSkip1">I'm just browsing</button>
    </div>

    <!-- STEP 2: Form -->
    <div class="mdp-step" id="mdpStep2" style="display:none">
      <div class="mdp-icon" id="mdpIcon"></div>
      <div class="mdp-badge mdp-badge-green">✓ We can help with that</div>
      <h3 class="mdp-title" id="mdpTitle2"></h3>
      <p class="mdp-sub">Leave your WhatsApp — a designer will reach out, usually within a few hours. Free to ask.</p>
      <form class="mdp-form" id="mdpForm">
        <input type="hidden" name="access_key" value="${W3F_KEY}">
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
  document.getElementById('mdpSubject').value =
    'ModelDesk enquiry: ' + a.label;
}

function initPopup() {
  if (sessionStorage.getItem(SEEN_KEY)) return;
  buildPopup();

  // Show after 7s — X button appears after 12s
  setTimeout(() => {
    document.getElementById('mdpOverlay')?.classList.add('mdp-open');
    setTimeout(() => {
      document.getElementById('mdpSkip1')?.style.setProperty('display','block');
    }, 5000); // skip appears 5s after popup opens
  }, 7000);

  // Option clicks → step 2
  document.querySelectorAll('.mdp-option').forEach(btn => {
    btn.addEventListener('click', () => goStep2(btn.dataset.key));
  });

  // Skips
  document.getElementById('mdpSkip1')?.addEventListener('click', closePopup);
  document.getElementById('mdpSkip2')?.addEventListener('click', closePopup);

  // Click outside card to dismiss (only after step 1 skip is visible)
  document.getElementById('mdpOverlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'mdpOverlay') closePopup();
  });

  // Form submit → Web3Forms
  document.getElementById('mdpForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const btn  = form.querySelector('button[type="submit"]');
    btn.textContent = 'Sending...';
    btn.disabled = true;

    const data = Object.fromEntries(new FormData(form));

    try {
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (_) {}

    // Backup local storage
    try { localStorage.setItem('md_lead_' + Date.now(), JSON.stringify(data)); } catch(_) {}

    // Show success
    form.style.display = 'none';
    document.getElementById('mdpSkip2').style.display = 'none';
    document.getElementById('mdpSuccess').style.display = 'block';
    document.getElementById('mdpName').textContent =
      data.name?.split(' ')[0] || 'there';
    sessionStorage.setItem(SEEN_KEY, '1');
  });
}

document.addEventListener('DOMContentLoaded', initPopup);
