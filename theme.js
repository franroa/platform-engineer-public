// theme.js — light/dark toggle for every surface: index, writing, cv, post pages, terminal and
// the 3D map (whose scene follows <html data-theme> via a MutationObserver in ultraplatform.html).
//
// The actual theme is applied by a tiny inline snippet in each page's <head> (no flash of the
// wrong theme before this deferred script runs). This file only builds the toggle button and
// remembers the choice. Preference order: explicit choice (localStorage) → OS preference.
(function () {
  var KEY = 'up-theme';
  var root = document.documentElement;

  function current() { return root.dataset.theme === 'light' ? 'light' : 'dark'; }

  // keep the browser-chrome color (address bar / task switcher) in step with the theme
  function syncMeta() {
    var m = document.querySelector('meta[name="theme-color"]');
    if (!m) return;
    m.setAttribute('content', current() === 'light' ? '#eef2fb' : (m.dataset.dark || '#0a0f1e'));
  }
  // theme-aware embeds (the landing hero's globe iframe) repaint their backdrop on this message
  function broadcast(t) {
    try {
      var fs = document.querySelectorAll('iframe');
      for (var i = 0; i < fs.length; i++) { try { fs[i].contentWindow.postMessage('up-theme:' + t, '*'); } catch (e) {} }
    } catch (e) {}
  }
  function apply(t) { root.dataset.theme = t; try { localStorage.setItem(KEY, t); } catch (e) {} paint(); syncMeta(); broadcast(t); }

  var btn;
  function paint() {
    if (!btn) return;
    var toLight = current() === 'dark';
    btn.setAttribute('aria-label', toLight ? 'Switch to light theme' : 'Switch to dark theme');
    btn.title = btn.getAttribute('aria-label');
    // show the destination: a sun when it'll go light, a moon when it'll go dark
    btn.innerHTML = toLight
      ? '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.4M12 19.6V22M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M2 12h2.4M19.6 12H22M4.9 19.1l1.7-1.7M17.4 6.6l1.7-1.7"/></svg>'
      : '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.6 6.6 0 0 0 9.8 9.8z"/></svg>';
  }

  function build() {
    var css = '#theme-toggle{position:fixed;right:18px;bottom:18px;z-index:1500;width:42px;height:42px;'
      + 'border-radius:50%;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;'
      + 'border:1px solid var(--card-line);background:var(--card);color:var(--fg);box-shadow:var(--elev);'
      + 'transition:transform .18s,border-color .2s,background .2s,color .2s}'
      + '#theme-toggle:hover{transform:translateY(-2px);border-color:var(--cyan)}'
      + '#theme-toggle:focus-visible{outline:2px solid var(--cyan);outline-offset:2px}'
      + '@media(max-width:560px){#theme-toggle{right:12px;bottom:12px}}'
      + '@media print{#theme-toggle{display:none}}';
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    btn = document.createElement('button');
    btn.id = 'theme-toggle'; btn.type = 'button';
    btn.addEventListener('click', function () { apply(current() === 'dark' ? 'light' : 'dark'); });
    document.body.appendChild(btn);
    paint();
  }

  // keep in sync with the OS only while the visitor hasn't made an explicit choice
  try {
    var mq = matchMedia('(prefers-color-scheme:light)');
    mq.addEventListener && mq.addEventListener('change', function (e) {
      var stored; try { stored = localStorage.getItem(KEY); } catch (x) {}
      if (!stored) { root.dataset.theme = e.matches ? 'light' : 'dark'; paint(); syncMeta(); broadcast(root.dataset.theme); }
    });
  } catch (e) {}

  syncMeta();
  if (document.body) build(); else addEventListener('DOMContentLoaded', build);
})();
