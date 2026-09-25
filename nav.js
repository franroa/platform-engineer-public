// nav.js — the one top navbar for every page. Injects its own CSS, markup and mobile behavior,
// so the bar is defined in exactly one place. Include it once per page:
//
//   <script src="nav.js" data-page="home|terminal|posts|map"></script>
//
// data-page picks the active link. The map (data-page="map") uses id="pf-nav" (kept so the
// internal build strips it and embed-mode hides it), a slightly more compact height because its
// fixed panels are offset to the bar, and NO "Access Ultraplatform" CTA. Every other page gets
// the full bar with the CTA. In ?embed= mode (the landing hero's globe iframe) nothing is injected.
(function () {
  if (/[?&]embed=/.test(location.search)) return;

  var s = document.currentScript;
  var page = (s && s.getAttribute('data-page')) || '';
  var isMap = page === 'map';
  var isHome = page === 'home';
  var A = isHome ? '' : 'index.html';            // section links point at the landing sections
  var activeKey = page;

  var CSS = ''
    + ':where(#nav,#pf-nav){position:fixed;top:0;left:0;right:0;z-index:50;display:flex;align-items:center;'
    + 'justify-content:space-between;padding:14px 24px;backdrop-filter:blur(12px);background:rgba(6,9,16,.82);'
    + 'border-bottom:1px solid rgba(130,160,230,.14);font-size:14px}'
    + '#pf-nav{z-index:30;height:42px;padding:0 24px}'
    + ':where(#nav,#pf-nav) .logo{display:flex;align-items:center;gap:10px;font-weight:700;letter-spacing:.2px;color:#e8eefc;font-size:16px;text-decoration:none}'
    + '#pf-nav .logo{font-size:15px}'
    + ':where(#nav,#pf-nav) .logo .badge{width:32px;height:32px;border-radius:9px;display:grid;place-items:center;'
    + 'font:700 13px/1 ui-monospace,monospace;color:#06121f;background:linear-gradient(135deg,#7fd4ff,#b69bff 60%,#ffb36b)}'
    + '#pf-nav .logo .badge{width:26px;height:26px;border-radius:8px;font-size:12px}'
    + ':where(#nav,#pf-nav) .links{display:flex;align-items:center;gap:24px}'
    + ':where(#nav,#pf-nav) .links a{font-size:14px;color:#8b97b8;text-decoration:none;transition:color .18s}'
    + ':where(#nav,#pf-nav) .links a:hover,:where(#nav,#pf-nav) .links a.active{color:#e8eefc}'
    + ':where(#nav,#pf-nav) .links a:not(.cta){position:relative}'
    + ':where(#nav,#pf-nav) .links a:not(.cta)::after{content:"";position:absolute;left:0;right:0;bottom:-6px;height:2px;'
    + 'border-radius:2px;background:linear-gradient(90deg,#7fd4ff,#b69bff);transform:scaleX(0);transform-origin:center;transition:transform .22s ease}'
    + ':where(#nav,#pf-nav) .links a:not(.cta):hover::after,:where(#nav,#pf-nav) .links a.active::after{transform:scaleX(1)}'
    + ':where(#nav,#pf-nav) .links a.cta{color:#06121f}'
    + ':where(#nav,#pf-nav) .cta{display:inline-flex;align-items:center;gap:7px;padding:13px 22px;border-radius:10px;font-size:15px;'
    + 'font-weight:600;color:#06121f;background:linear-gradient(135deg,#7fd4ff,#b69bff 70%);box-shadow:0 6px 22px rgba(127,212,255,.22);'
    + 'transition:transform .15s,box-shadow .2s}'
    + ':where(#nav,#pf-nav) .cta:hover{transform:translateY(-1px);box-shadow:0 10px 30px rgba(127,212,255,.34)}'
    + ':where(#nav,#pf-nav) .cta .ci{width:17px;height:17px;display:block;flex:0 0 auto}' // transparent glyph (currentColor)
    + '.navburger{display:none;background:none;border:1px solid rgba(130,160,230,.3);border-radius:9px;color:#e8eefc;'
    + 'font-size:17px;padding:4px 10px;cursor:pointer;font-family:inherit}'
    + '@media(max-width:1150px){'
    + ':where(#nav,#pf-nav) .logo span:last-child{display:none}'
    + '.navburger{display:block}'
    + ':where(#nav,#pf-nav) .links{display:none}'
    + ':where(#nav,#pf-nav) .links.open{display:flex;position:fixed;top:60px;left:0;right:0;flex-direction:column;'
    + 'align-items:flex-start;gap:0;background:rgba(6,9,16,.97);border-bottom:1px solid rgba(130,160,230,.14);padding:10px 22px 16px}'
    + '#pf-nav .links.open{top:42px}'
    + ':where(#nav,#pf-nav) .links.open a{padding:10px 2px;font-size:15px;width:100%}'
    + ':where(#nav,#pf-nav) .links.open a:not(.cta)::after{display:none}'
    + ':where(#nav,#pf-nav) .links.open a.cta{width:auto;margin-top:10px;padding:13px 22px}' // restore the real button chrome — the generic .links.open a padding above flattens it otherwise
    + '}'
    // Light theme: the bar follows it on EVERY surface — home hero included, and the map's
    // #pf-nav too (the map is themable; its embed variant never shows a nav at all).
    + ':root[data-theme="light"] :where(#nav,#pf-nav){background:rgba(246,248,252,.85);border-bottom-color:rgba(40,70,130,.16)}'
    + ':root[data-theme="light"] :where(#nav,#pf-nav) .logo{color:#0f1a33}'
    + ':root[data-theme="light"] :where(#nav,#pf-nav) .links a:not(.cta){color:#54617e}'
    + ':root[data-theme="light"] :where(#nav,#pf-nav) .links a:not(.cta):hover,:root[data-theme="light"] :where(#nav,#pf-nav) .links a:not(.cta).active{color:#0f1a33}'
    + ':root[data-theme="light"] :where(#nav,#pf-nav) .navburger{color:#0f1a33;border-color:rgba(40,70,130,.3)}'
    + ':root[data-theme="light"] :where(#nav,#pf-nav) .links.open{background:rgba(246,248,252,.97);border-bottom-color:rgba(40,70,130,.16)}';

  var sections = [['about', 'About'], ['experience', 'Experience'], ['stack', 'Stack'],
    ['landscape', 'Landscape'], ['tools', 'Tools'], ['contact', 'Contact']];
  function link(href, label, key, extra) {
    var cls = [];
    if (key && key === activeKey) cls.push('active');
    if (extra) cls.push(extra);
    return '<a href="' + href + '"' + (cls.length ? ' class="' + cls.join(' ') + '"' : '') + '>' + label + '</a>';
  }
  var linksHtml = sections.map(function (x) { return link(A + '#' + x[0], x[1], x[0]); }).join('')
    + link('terminal.html', 'Terminal', 'terminal')
    + link('cv.html', 'CV', 'cv');
  if (!isMap) linksHtml += '<a class="cta" href="ultraplatform.html"><svg class="ci" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-opacity=".4" stroke-width="1"/><g transform="rotate(-24 12 12)"><ellipse cx="12" cy="12" rx="10" ry="3.7" stroke="currentColor" stroke-width="1.2"/><circle cx="21.5" cy="12" r="1.5" fill="currentColor"/></g><path d="M12 6 17.2 9 17.2 15 12 18 6.8 15 6.8 9Z" fill="currentColor"/></svg>Access Ultraplatform <span aria-hidden="true">↗</span></a>';

  var nav = document.createElement('nav');
  nav.id = isMap ? 'pf-nav' : 'nav';
  var linksId = nav.id + '-links';
  nav.innerHTML =
    '<a class="logo" href="' + (isHome ? '#top' : 'index.html') + '"><span class="badge">FR</span><span>Francisco&nbsp;Roa</span></a>'
    + '<button class="navburger" type="button" aria-label="Menu" aria-expanded="false" aria-controls="' + linksId + '">☰</button>'
    + '<div class="links" id="' + linksId + '">' + linksHtml + '</div>';

  if (!document.getElementById('site-nav-css')) {
    var st = document.createElement('style'); st.id = 'site-nav-css'; st.textContent = CSS;
    document.head.appendChild(st);
  }
  document.body.insertBefore(nav, document.body.firstChild);

  var burger = nav.querySelector('.navburger'), links = nav.querySelector('.links');
  function setOpen(open) { links.classList.toggle('open', open); burger.setAttribute('aria-expanded', open ? 'true' : 'false'); }
  burger.addEventListener('click', function (e) { e.stopPropagation(); setOpen(!links.classList.contains('open')); });
  document.addEventListener('click', function (e) { if (!e.target.closest('#' + nav.id)) setOpen(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && links.classList.contains('open')) { setOpen(false); burger.focus(); } });
  links.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
})();
