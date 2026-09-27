/* Eren site chrome behaviour: hover pill + capsule/progress/hide-on-scroll for the nav, footer wordmark spotlight. */
(() => {
  const nav = document.querySelector('nav');
  if (nav) {
    const links = nav.querySelector('.nav-links'), inner = nav.querySelector('.nav-in');
    if (links) {
      const pill = document.createElement('span'); pill.className = 'nav-pill'; pill.setAttribute('aria-hidden', 'true'); links.prepend(pill);
      links.querySelectorAll('a').forEach(a => a.addEventListener('mouseenter', () => {
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
  const wm = document.querySelector('.wordmark');
  if (wm) wm.addEventListener('pointermove', e => {
    const r = wm.getBoundingClientRect();
    wm.style.setProperty('--mx', (e.clientX - r.left) + 'px'); wm.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
  document.querySelectorAll('a[href="#top"]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault(); scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }));
})();
