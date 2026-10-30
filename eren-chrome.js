/* Eren site chrome behaviour: hover pill + capsule/progress/hide-on-scroll for the nav. */
(() => {
  const nav = document.querySelector('nav');
  if (nav) {
    const links = nav.querySelector('.nav-links'), inner = nav.querySelector('.nav-in');
    if (links) {
      const pill = document.createElement('span'); pill.className = 'nav-pill'; pill.setAttribute('aria-hidden', 'true'); links.prepend(pill);
      links.querySelectorAll(':scope > a, :scope > .nav-dd > .nav-dd-link').forEach(a => a.addEventListener('mouseenter', () => {
        const r = a.getBoundingClientRect(), p = links.getBoundingClientRect();
        pill.style.left = (r.left - p.left - 12) + 'px'; pill.style.width = (r.width + 24) + 'px';
      }));
    }
    const prog = document.createElement('div'); prog.className = 'nav-progress'; prog.setAttribute('aria-hidden', 'true');
    if (inner) inner.appendChild(prog);
    let lastY = scrollY, ticking = false;
    const onScroll = () => {
      const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
      nav.classList.toggle('scrolled', y > 60);
      prog.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
      if (y > lastY + 6 && y > 140) nav.classList.add('hide'); else if (y < lastY - 6 || y < 140) nav.classList.remove('hide');
      lastY = y; ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    nav.addEventListener('focusin', () => nav.classList.remove('hide'));
    onScroll();
  }

  // Guides menu. Click (or Enter/Space) opens it; on a mouse, hovering opens it too.
  // The panel lives in the nav itself so the scrolling link row on phones can't clip it.
  document.querySelectorAll('.nav-dd').forEach(dd => {
    const link = dd.querySelector('.nav-dd-link'), panel = dd.querySelector('.nav-dd-panel'), host = dd.closest('nav');
    if (!link || !panel || !host) return;
    host.appendChild(panel);
    link.setAttribute('role', 'button');
    link.setAttribute('aria-expanded', 'false');
    link.setAttribute('aria-controls', panel.id);
    const hoverable = matchMedia('(hover: hover) and (pointer: fine)');
    let closeTimer = 0, byHover = false;
    const place = () => {
      const n = host.getBoundingClientRect(), r = link.getBoundingClientRect();
      if (innerWidth <= 1000) { panel.style.left = ''; panel.style.top = ''; return; }
      const w = panel.offsetWidth || 620;
      const left = Math.max(12, Math.min(r.left - n.left - 24, n.width - w - 12));
      panel.style.left = left + 'px';
      panel.style.top = (r.bottom - n.top + 14) + 'px';
    };
    const open = () => {
      clearTimeout(closeTimer);
      if (!panel.hidden) return;
      panel.hidden = false; place(); link.setAttribute('aria-expanded', 'true');
      requestAnimationFrame(() => panel.classList.add('is-open'));
    };
    const close = (focusBack) => {
      clearTimeout(closeTimer);
      if (panel.hidden) return;
      byHover = false; panel.classList.remove('is-open'); panel.hidden = true; link.setAttribute('aria-expanded', 'false');
      if (focusBack) link.focus();
    };
    // A click right after a hover-open keeps it open instead of snapping it shut.
    link.addEventListener('click', e => { e.preventDefault(); if (byHover && !panel.hidden) { byHover = false; return; } panel.hidden ? open() : close(false); });
    link.addEventListener('keydown', e => {
      if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); panel.hidden ? open() : close(false); }
      if (e.key === 'ArrowDown') { e.preventDefault(); open(); const first = panel.querySelector('a'); if (first) first.focus(); }
    });
    // The panel sits at the end of the nav, so walk Tab through it as if it followed the link.
    const items = () => Array.from(panel.querySelectorAll('a'));
    const after = () => { const n = dd.nextElementSibling; return n && n.matches('a') ? n : (n && n.querySelector('a')); };
    panel.addEventListener('keydown', e => {
      if (e.key === 'Escape') { close(true); return; }
      if (e.key !== 'Tab') return;
      const list = items();
      if (!e.shiftKey && document.activeElement === list[list.length - 1]) { const n = after(); if (n) { e.preventDefault(); close(false); n.focus(); } }
      if (e.shiftKey && document.activeElement === list[0]) { e.preventDefault(); link.focus(); }
    });
    link.addEventListener('keydown', e => {
      if (e.key === 'Tab' && !e.shiftKey && !panel.hidden) { e.preventDefault(); const f = items()[0]; if (f) f.focus(); }
    });
    link.addEventListener('keydown', e => { if (e.key === 'Escape') close(false); });
    const later = () => { clearTimeout(closeTimer); closeTimer = setTimeout(() => close(false), 180); };
    [dd, panel].forEach(el => {
      el.addEventListener('mouseenter', () => { if (hoverable.matches) { if (panel.hidden) byHover = true; open(); } });
      el.addEventListener('mouseleave', () => { if (hoverable.matches) later(); });
    });
    document.addEventListener('click', e => { if (!dd.contains(e.target) && !panel.contains(e.target)) close(false); });
    document.addEventListener('focusin', e => { if (!dd.contains(e.target) && !panel.contains(e.target)) close(false); });
    addEventListener('resize', () => { if (!panel.hidden) place(); });
    addEventListener('scroll', () => { if (!panel.hidden && host.classList.contains('hide')) close(false); else if (!panel.hidden) place(); }, { passive: true });
  });
  document.querySelectorAll('a[href="#top"]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault(); scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }));
})();
