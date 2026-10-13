/* Home hero: drag the line to look underneath the example website. */
(function(){
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.hx-a .xr-stage').forEach(function(stage){
    var scan = stage.querySelector('.xr-scan'), p = 58, touched = false, raf = 0;
    function set(v){
      p = Math.max(0, Math.min(100, v));
      stage.style.setProperty('--p', p.toFixed(2));
      scan.setAttribute('aria-valuenow', Math.round(p));
    }
    function fromEvent(e){ var r = stage.getBoundingClientRect(); return (e.clientX - r.left) / r.width * 100; }
    function stopIntro(){ touched = true; if (raf) cancelAnimationFrame(raf); stage.classList.remove('show-hint'); }
    // Mouse and pen grab the line straight away. A finger only takes it once it moves
    // sideways, so a vertical swipe still scrolls the page.
    var start = null;
    stage.addEventListener('pointerdown', function(e){
      if (e.pointerType === 'touch') { start = { x: e.clientX, y: e.clientY, id: e.pointerId }; return; }
      stopIntro(); stage.classList.add('is-drag'); stage.setPointerCapture(e.pointerId); set(fromEvent(e));
    });
    stage.addEventListener('pointermove', function(e){
      if (start && e.pointerId === start.id && !stage.classList.contains('is-drag')) {
        var dx = Math.abs(e.clientX - start.x), dy = Math.abs(e.clientY - start.y);
        if (dx > 6 && dx > dy) { stopIntro(); stage.classList.add('is-drag'); try { stage.setPointerCapture(e.pointerId); } catch (_) {} }
        else if (dy > 10) { start = null; }
      }
      if (stage.classList.contains('is-drag')) set(fromEvent(e));
    });
    ['pointerup','pointercancel','lostpointercapture'].forEach(function(t){
      stage.addEventListener(t, function(e){
        // Capture moving from a child to the stage also fires lostpointercapture; ignore that one.
        if (t === 'lostpointercapture' && e.target !== stage) return;
        stage.classList.remove('is-drag'); start = null;
      });
    });
    scan.addEventListener('keydown', function(e){
      var k = e.key, step = e.shiftKey ? 15 : 5;
      if (k === 'ArrowLeft' || k === 'ArrowDown') { stopIntro(); set(p - step); e.preventDefault(); }
      else if (k === 'ArrowRight' || k === 'ArrowUp') { stopIntro(); set(p + step); e.preventDefault(); }
      else if (k === 'Home') { stopIntro(); set(0); e.preventDefault(); }
      else if (k === 'End') { stopIntro(); set(100); e.preventDefault(); }
    });
    if (reduce) { set(58); return; }
    // One sweep on load: right across to show everything underneath, then back to rest.
    set(0);
    var keys = [[0, 0], [1500, 94], [2300, 58]], t0 = 0;
    function ease(t){ return t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2; }
    function frame(ts){
      if (touched) return;
      if (!t0) t0 = ts;
      var t = ts - t0, i = 1;
      while (i < keys.length - 1 && t > keys[i][0]) i++;
      var a = keys[i-1], b = keys[i], f = Math.min(1, Math.max(0, (t - a[0]) / (b[0] - a[0])));
      set(a[1] + (b[1] - a[1]) * ease(f));
      if (t < keys[keys.length-1][0]) raf = requestAnimationFrame(frame);
      else { stage.classList.add('show-hint'); }
    }
    setTimeout(function(){ if (!touched) raf = requestAnimationFrame(frame); }, 500);
  });
})();
