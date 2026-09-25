// analytics.js — GDPR-friendly Google Analytics 4 with a cookie-consent banner.
//
// Google Analytics loads ONLY after the visitor clicks "Accept" — never before, and never if
// they decline. IP anonymization is on. The choice is remembered (localStorage), so the banner
// shows once. Self-contained (injects its own CSS + markup), so every page includes it with one
// line — root pages: <script defer src="analytics.js"></script> · post pages: ../analytics.js
//
// ►► SET YOUR GA4 MEASUREMENT ID BELOW. Until it's a real "G-XXXX" id (not the placeholder),
//    this script does NOTHING — no banner, no analytics. That's the intended pre-launch state.
(function () {
  var GA_ID = 'G-XXXXXXXXXX';                 // ← replace with your GA4 Measurement ID

  if (/[?&]embed=/.test(location.search)) return;                 // skip inside the globe iframe

  // No service worker — the portfolio is a plain static site (a PWA's offline/install layer earns
  // nothing here and only risks serving a stale cached build). If an older build DID register one,
  // self-heal: proactively unregister any worker and drop its caches so no stale layer lingers.
  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker.getRegistrations) {
      navigator.serviceWorker.getRegistrations().then(function (rs) { rs.forEach(function (r) { r.unregister(); }); });
      if (window.caches && caches.keys) caches.keys().then(function (ks) { ks.forEach(function (k) { if (/^up-portfolio/.test(k)) caches.delete(k); }); });
    }
  } catch (e) {}

  // Event API — available on EVERY page regardless of consent/config; no-ops unless GA is actually
  // loaded (i.e. the visitor accepted). Page code calls window.upTrack('name', {…}) freely.
  window.upTrack = window.upTrack || function (name, params) { if (window.gtag) window.gtag('event', name, params || {}); };
  // Auto-track the CTA/outbound intents that matter for a portfolio, site-wide (one delegated handler).
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest && e.target.closest('a'); if (!a) return;
    var href = a.getAttribute('href') || '', ev = null;
    if (/^mailto:/i.test(href)) ev = 'email_click';
    else if (/(^|\/)cv\.html/.test(href)) ev = 'cv_open';
    else if (/linkedin\.com/i.test(href)) ev = 'linkedin_click';
    else if (/github\.com/i.test(href)) ev = 'github_click';
    else if (/(^|\/)ultraplatform\.html($|[#?])/.test(href) && !/embed=/.test(href)) ev = 'map_open';
    if (ev) window.upTrack(ev, { href: href, from: location.pathname });
  }, true);

  function configured() { return /^G-[A-Z0-9]{6,}$/.test(GA_ID) && GA_ID !== 'G-XXXXXXXXXX'; }
  if (!configured()) return;                                      // no real id yet → no-op (banner/GA)

  var KEY = 'up-analytics-consent';                               // 'granted' | 'denied'
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  function loadGA() {
    if (window.__gaLoaded) return; window.__gaLoaded = true;
    var s = document.createElement('script');
    s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { anonymize_ip: true });        // no PII, EU-appropriate
  }

  var cssDone = false;
  function injectCSS() {
    if (cssDone) return; cssDone = true;
    var css = '#ga-consent{position:fixed;left:18px;bottom:18px;z-index:2000;max-width:340px;'
      + 'background:rgba(10,15,28,.96);color:#e8eefc;border:1px solid rgba(127,212,255,.3);'
      + 'border-radius:14px;padding:15px 17px;box-shadow:0 18px 50px -12px rgba(0,0,0,.72);'
      + 'font:13.5px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;'
      + 'backdrop-filter:blur(10px);animation:gaIn .25s ease}'
      + '@keyframes gaIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}'
      + '#ga-consent p{margin:0 0 12px;color:#c4cee6}'
      + '#ga-consent .row{display:flex;gap:9px}'
      + '#ga-consent button{font:inherit;font-size:13px;font-weight:600;cursor:pointer;border-radius:9px;'
      + 'padding:8px 16px;border:1px solid rgba(130,160,230,.28);background:transparent;color:#e8eefc}'
      + '#ga-consent button.ok{color:#06121f;border-color:transparent;background:linear-gradient(135deg,#7fd4ff,#b69bff 70%)}'
      + '#ga-consent button:hover{border-color:rgba(127,212,255,.6)}'
      + '#ga-consent button.ok:hover{filter:brightness(1.06)}'
      + '@media(prefers-reduced-motion:reduce){#ga-consent{animation:none}}'
      + '@media(max-width:560px){#ga-consent{left:12px;right:12px;bottom:12px;max-width:none}}';
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  }

  function showBanner() {
    injectCSS();
    if (document.getElementById('ga-consent')) return;
    var box = document.createElement('div');
    box.id = 'ga-consent'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Analytics cookie consent');
    box.innerHTML = '<p>I use Google Analytics (IP-anonymized) to see which notes people find useful. '
      + 'Load analytics cookies?</p>'
      + '<div class="row"><button class="ok" id="ga-ok">Accept</button>'
      + '<button id="ga-no">Decline</button></div>';
    document.body.appendChild(box);
    box.querySelector('#ga-ok').onclick = function () { set('granted'); box.remove(); loadGA(); };
    box.querySelector('#ga-no').onclick = function () {
      set('denied'); box.remove();
      if (window.__gaLoaded) location.reload();               // purge GA already loaded this session
    };
  }

  function start() {
    var c = get();
    if (c === 'granted') loadGA();
    else if (c !== 'denied') showBanner();
    // any element with data-cookie-settings reopens the banner (withdraw or grant anytime)
    var links = document.querySelectorAll('[data-cookie-settings]');
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', function (e) { e.preventDefault(); showBanner(); });
    }
  }
  if (document.body) start(); else addEventListener('DOMContentLoaded', start);
})();
