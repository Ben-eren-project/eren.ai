/* Smooth open/close for .faq-x <details>. Native behaviour stays the fallback. */
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !Element.prototype.animate) return;
  document.querySelectorAll('.faq-x details').forEach(function (d) {
    var s = d.querySelector('summary'), a = d.querySelector('.fx-a'), anim = null;
    s.addEventListener('click', function (e) {
      e.preventDefault();
      if (anim) anim.cancel();
      if (!d.open) {
        d.open = true;
        var h = a.scrollHeight;
        anim = a.animate([{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }], { duration: 320, easing: 'cubic-bezier(.22,1,.36,1)' });
        anim.onfinish = function () { anim = null; };
      } else {
        var h2 = a.scrollHeight;
        d.classList.add('closing');
        anim = a.animate([{ height: h2 + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 240, easing: 'cubic-bezier(.4,0,.2,1)' });
        anim.onfinish = function () { d.open = false; d.classList.remove('closing'); anim = null; };
      }
    });
  });
})();
