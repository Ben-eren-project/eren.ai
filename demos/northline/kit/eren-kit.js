/* Eren component kit (vanilla JS), pairs with eren-kit.css. Each function names its source repo file.
   Content is visible without this file: hidden start states only apply under html.js. */
(function () {
  var doc = document.documentElement;
  doc.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* In-view trigger: motion-primitives components/core/in-view.tsx (once: true). */
  function inView(els, fn, threshold) {
    if (!('IntersectionObserver' in window)) { els.forEach(fn); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { fn(e.target); io.unobserve(e.target); } });
    }, { threshold: threshold || 0.2 });
    els.forEach(function (el) { io.observe(el); });
  }
  var all = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* Word cascade: trickle word-cascade + motion-primitives text-effect a11y
     (full sentence in a visually hidden span, animated words aria-hidden). */
  all('[data-cascade]').forEach(function (el) {
    var text = el.textContent.trim();
    var words = text.split(/\s+/), off = parseInt(el.getAttribute('data-offset') || '0', 10);
    var sr = document.createElement('span'); sr.className = 'vh'; sr.textContent = text;
    var vis = document.createElement('span'); vis.setAttribute('aria-hidden', 'true');
    words.forEach(function (w, i) {
      var s = document.createElement('span'); s.className = 'w'; s.style.setProperty('--i', i + off);
      s.textContent = w + (i < words.length - 1 ? ' ' : '');
      vis.appendChild(s);
    });
    el.textContent = ''; el.appendChild(sr); el.appendChild(vis); el.classList.add('cascade');
  });
  inView(all('.cascade'), function (el) { el.classList.add('is-in'); }, 0.1);

  /* Highlighter sweep (trickle) and underline draw (trickle): play once in view. */
  inView(all('.trickle-highlight-word, .tlink.draw'), function (el) { el.classList.add('is-in'); }, 0.6);

  /* Reveal group: motion-primitives animated-group 'blur-slide', stagger .1s. */
  all('[data-reveal]').forEach(function (g) { Array.prototype.forEach.call(g.children, function (c, i) { c.style.setProperty('--i', i); }); });
  inView(all('[data-reveal]'), function (g) { g.classList.add('is-in'); }, 0.15);

  /* Number pop-in: better-design scripts/transitions-src/number-pop-in.tsx (transitions.dev). */
  all('[data-digits]').forEach(function (el) {
    var txt = el.textContent; el.setAttribute('aria-label', txt); el.textContent = '';
    el.classList.add('t-digit-group');
    txt.split('').forEach(function (ch, i) {
      var s = document.createElement('span'); s.className = 't-digit'; s.setAttribute('aria-hidden', 'true');
      s.style.setProperty('--t-digit-i', i); s.textContent = ch; el.appendChild(s);
    });
    el.setAttribute('role', 'text');
  });
  if (!reduce) inView(all('[data-digits]'), function (el) { el.classList.add('is-animating'); }, 0.6);

  /* Image comparison: motion-primitives image-comparison.tsx, on <input type=range>. */
  all('.cmp').forEach(function (c) {
    var r = c.querySelector('.cmp-range');
    if (!r) return;
    var set = function () { c.style.setProperty('--pos', r.value + '%'); };
    r.addEventListener('input', set); set();
  });

  /* Spotlight cards: ui-layouts spam-spotlight.tsx, one listener, fine pointers only. */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    all('.spot-grid').forEach(function (grid) {
      var cards = all('.spot', grid), raf = 0, ev = null;
      grid.addEventListener('pointermove', function (e) {
        ev = e; if (raf) return;
        raf = requestAnimationFrame(function () {
          raf = 0;
          cards.forEach(function (card) {
            var b = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', (ev.clientX - b.left) + 'px');
            card.style.setProperty('--mouse-y', (ev.clientY - b.top) + 'px');
          });
        });
      });
    });
  }

  /* Segmented control + transition panel: motion-primitives animated-background (sliding pill)
     and transition-panel (enter animation). Tabs pattern with arrow keys. */
  all('[data-tabs]').forEach(function (root) {
    var tabs = all('[role="tab"]', root), pill = root.querySelector('.seg-pill');
    var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });
    function place(t) { if (!pill) return; pill.style.width = t.offsetWidth + 'px'; pill.style.height = t.offsetHeight + 'px'; pill.style.transform = 'translate(' + t.offsetLeft + 'px,' + t.offsetTop + 'px)'; }
    function select(i, focus) {
      tabs.forEach(function (t, k) {
        var on = k === i;
        t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1;
        panels[k].hidden = !on;
        if (on) { panels[k].classList.remove('enter'); void panels[k].offsetWidth; if (!reduce) panels[k].classList.add('enter'); }
      });
      place(tabs[i]); if (focus) tabs[i].focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(i); });
      t.addEventListener('keydown', function (e) {
        var n = tabs.length, j = null;
        if (e.key === 'ArrowRight') j = (i + 1) % n; else if (e.key === 'ArrowLeft') j = (i - 1 + n) % n;
        else if (e.key === 'Home') j = 0; else if (e.key === 'End') j = n - 1;
        if (j !== null) { e.preventDefault(); select(j, true); }
      });
    });
    var start = tabs.findIndex(function (t) { return t.getAttribute('aria-selected') === 'true'; });
    select(start < 0 ? 0 : start);
    window.addEventListener('resize', function () { var k = tabs.findIndex(function (t) { return t.getAttribute('aria-selected') === 'true'; }); place(tabs[k]); });
  });

  /* Mobile menu: better-design transitions-src/menu-dropdown.tsx state machine
     (is-open / is-closing, close timer = --dropdown-close-dur), Esc returns focus. */
  all('[data-menu]').forEach(function (scope) {
    var btn = scope.querySelector('.menu-btn'), menu = scope.querySelector('.t-dropdown'), timer = 0;
    function open() { clearTimeout(timer); menu.classList.remove('is-closing'); menu.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); var f = menu.querySelector('a'); if (f) f.focus(); }
    function close(ret) {
      if (!menu.classList.contains('is-open')) return;
      menu.classList.remove('is-open'); menu.classList.add('is-closing'); btn.setAttribute('aria-expanded', 'false');
      timer = setTimeout(function () { menu.classList.remove('is-closing'); }, reduce ? 0 : 150);
      if (ret) btn.focus();
    }
    btn.addEventListener('click', function () { menu.classList.contains('is-open') ? close(false) : open(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(true); });
    document.addEventListener('click', function (e) { if (!scope.contains(e.target)) close(false); });
  });

  /* Reading progress: motion-primitives scroll-progress.tsx (scaleX), no spring. */
  var bar = document.querySelector('.progress');
  if (bar) {
    var tick = 0;
    var upd = function () { tick = 0; var h = doc.scrollHeight - innerHeight; bar.style.setProperty('--p', h > 0 ? Math.min(1, scrollY / h) : 0); };
    addEventListener('scroll', function () { if (!tick) tick = requestAnimationFrame(upd); }, { passive: true }); upd();
  }

  /* Preview forms: <form data-preview-form data-done="id-of-thanks-panel">. They never send.
     The thanks panel holds a [data-back] button that returns to the form. */
  all('form[data-preview-form]').forEach(function (form) {
    var done = document.getElementById(form.getAttribute('data-done'));
    form.addEventListener('submit', function (e) {
      e.preventDefault(); form.hidden = true;
      if (done) { done.hidden = false; done.setAttribute('tabindex', '-1'); done.focus(); }
    });
    if (done) all('[data-back]', done).forEach(function (b) {
      b.addEventListener('click', function () { done.hidden = true; form.hidden = false; var f = form.querySelector('input,select,textarea'); if (f) f.focus(); });
    });
  });
})();
