/* Home hero scene: one made-up business week on a perspective grid. A "now" frame sweeps
   Monday to Friday; as it passes each moment, Eren's call appears (worth fixing / leave it).
   Click a point for the detail, drag to turn the view, switch the example business, hide a
   lane, pause. No network requests, no storage except the First Look box hand-off. */
(function () {
  'use strict';
  var root = document.querySelector('.hx-p');
  if (!root) return;

  /* ---------- First Look box: carry the question into the form ---------- */
  var ask = root.querySelector('.ask');
  if (ask) {
    var ta = ask.querySelector('textarea');
    var go = function () {
      var q = (ta.value || '').trim();
      try { if (q) sessionStorage.setItem('eren-first-look-q', q.slice(0, 1500)); } catch (_) {}
      window.location.href = 'start.html?intent=first-look';
    };
    ask.addEventListener('submit', function (e) { e.preventDefault(); go(); });
    ta.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); go(); }
    });
    // Cycle example questions in the placeholder until the visitor types.
    var examples = [
      'Customers say they can’t find our prices on a phone.',
      'We retype every invoice into QuickBooks.',
      'People keep calling to ask if their order is ready.',
      'Is our website worth rebuilding, or just fixing?'
    ];
    var ei = 0, reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion) setInterval(function () {
      if (document.activeElement === ta || ta.value) return;
      ei = (ei + 1) % examples.length; ta.placeholder = examples[ei];
    }, 3600);
  }

  /* ---------- Scene ---------- */
  var scene = root.querySelector('.scene');
  if (!scene) return;
  var canvas = scene.querySelector('canvas');
  var ctx = canvas.getContext('2d');
  var layer = scene.querySelector('.chips');
  var clock = scene.querySelector('.clock');
  var clockText = clock.querySelector('span');
  var pauseBtn = clock.querySelector('.pause');
  var card = scene.querySelector('.card');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var LANES = {
    w: { z: -2.1, name: 'Website', c: '#a8d1f1' },
    f: { z: 0, name: 'Workflow', c: '#9fe0c0' },
    t: { z: 2.1, name: 'Tools & AI', c: '#c9b6f2' }
  };
  var DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

  // Made-up example businesses. No real names, numbers are illustrative.
  var DATA = {
    repair: { name: 'Repair shop', ev: [
      { l: 'w', t: .38, when: 'Mon 9:12 AM', label: 'Quote form', sub: 'asks job type twice', call: 'fix',
        title: 'The quote form asks for the job type twice.',
        saw: 'A customer picks “Small engine” from the menu, then the form asks again further down.',
        say: 'Carry the choice through so they answer once. A small change to the form.' },
      { l: 't', t: 1.38, when: 'Tue 10:05 AM', label: 'Invoice retyped', sub: 'into QuickBooks', call: 'fix',
        title: 'Every invoice is typed twice.',
        saw: 'The counter writes the ticket, then someone types the same invoice into QuickBooks at night.',
        say: 'Connect the two before buying anything new. The software they already pay for can take it.' },
      { l: 'f', t: 2.62, when: 'Wed 3:05 PM', label: '“Is it ready?” calls', sub: 'same question, all day', call: 'fix',
        title: 'Customers call to ask where their repair stands.',
        saw: 'The answer is on a paper tag in the back, so every call pulls someone off the bench.',
        say: 'A status the counter can see in one place, and a text when the repair is ready.' },
      { l: 'w', t: 3.28, when: 'Thu 11:00 AM', label: 'Booking link', sub: 'works on phones', call: 'leave',
        title: 'The booking link works.',
        saw: 'Checked on a phone: it loads, takes the booking and confirms by text.',
        say: 'Leave it alone. Not everything worth looking at is worth changing.' },
      { l: 't', t: 3.82, when: 'Thu 4:40 PM', label: 'Parts orders', sub: 'in one email thread', call: 'leave',
        title: 'Parts are ordered by email.',
        saw: 'One person owns it, with one main supplier, and nothing gets lost.',
        say: 'Leave it. It’s old, but it isn’t broken.' },
      { l: 'w', t: 4.62, when: 'Fri 8:15 PM', label: 'After-hours call', sub: 'goes to a full voicemail', call: 'fix',
        title: 'Calls after closing hit a full voicemail box.',
        saw: 'Friday evening, a caller couldn’t leave a message and nobody knew they had called.',
        say: 'A short text-back for missed calls, and a set time each morning to reply.' }
    ]},
    bakery: { name: 'Bakery', ev: [
      { l: 'w', t: .3, when: 'Mon 7:05 AM', label: 'Cake orders', sub: 'no pickup time', call: 'fix',
        title: 'Online cake orders have no pickup time.',
        saw: 'Each order arrives without a time, so someone calls the customer back to set one.',
        say: 'Pickup slots on the order form, limited to what the kitchen can make.' },
      { l: 'f', t: 1.15, when: 'Tue 5:30 AM', label: 'Bake list', sub: 'built from 3 places', call: 'fix',
        title: 'The morning bake list is built by hand.',
        saw: 'Website orders, phone orders and a notebook are copied onto one sheet before the ovens start.',
        say: 'One list the ovens work from, filled in as orders arrive.' },
      { l: 't', t: 1.85, when: 'Tue 2:00 PM', label: 'Card reader', sub: 'matches the till', call: 'leave',
        title: 'Payments and daily totals are clean.',
        saw: 'The card reader and the till agree every day without anyone fixing them up.',
        say: 'Leave it alone.' },
      { l: 'f', t: 3.05, when: 'Thu 4:45 PM', label: 'Wholesale orders', sub: 'by text message', call: 'fix',
        title: 'Standing orders from cafés arrive by text.',
        saw: 'A change to Friday’s order was in a text thread and didn’t reach the bake list.',
        say: 'A standing-order sheet each café can update, feeding the same bake list.' },
      { l: 't', t: 3.9, when: 'Thu 6:10 PM', label: 'Allergen questions', sub: 'asked on every call', call: 'fix',
        title: 'The same allergen questions come in by phone.',
        saw: 'The answers are in the recipe cards, but only the bakers can read them quickly.',
        say: 'An allergen page drafted from the recipe cards with AI, and every line checked by a baker before it goes up.' },
      { l: 'w', t: 4.7, when: 'Fri 9:00 PM', label: 'Weekend preorders', sub: 'form works', call: 'leave',
        title: 'The weekend preorder form works.',
        saw: 'It’s short, works on a phone and confirms by email.',
        say: 'Leave it alone.' }
    ]},
    fab: { name: 'Fabrication shop', ev: [
      { l: 'w', t: .5, when: 'Mon 8:40 AM', label: 'Quote request', sub: 'no drawing upload', call: 'fix',
        title: 'Drawings arrive separately from quote requests.',
        saw: 'Buyers fill in the form, then email the drawing, and the two are matched by hand.',
        say: 'Let the drawing come in with the request, with the job type already filled in.' },
      { l: 'f', t: 1.3, when: 'Tue 7:15 AM', label: 'Revised drawing', sub: 'old print on the floor', call: 'fix',
        title: 'A revision reached the office, not the floor.',
        saw: 'Tuesday’s revised drawing was in the inbox while the floor worked from Monday’s print.',
        say: 'One released version per job on the floor, and a named person who releases it.' },
      { l: 't', t: 2.0, when: 'Wed 10:20 AM', label: 'Nesting software', sub: 'set up well', call: 'leave',
        title: 'The nesting software is set up well.',
        saw: 'Sheets are nested to cut waste and the operators trust it.',
        say: 'Leave it alone.' },
      { l: 'f', t: 2.72, when: 'Wed 3:30 PM', label: 'Job status', sub: 'buyers call to ask', call: 'fix',
        title: 'Buyers call to ask where their parts are.',
        saw: 'The answer is spread across the scheduler’s notes and the floor.',
        say: 'A simple status for each job that the office can read out or send.' },
      { l: 'w', t: 3.5, when: 'Thu 9:00 AM', label: 'Capabilities page', sub: 'limits listed', call: 'leave',
        title: 'The shop’s limits are stated plainly.',
        saw: 'Sheet sizes, tube sizes and finishes are listed, so poor-fit jobs filter themselves out.',
        say: 'Leave it alone.' },
      { l: 't', t: 4.25, when: 'Thu 2:10 PM', label: 'Job hours', sub: 'kept in two places', call: 'fix',
        title: 'Hours are tracked twice and matched on Friday.',
        saw: 'Timecards and a spreadsheet both hold job hours, and someone reconciles them every week.',
        say: 'Connect the timecards to the job record so the hours land once.' }
    ]}
  };

  var bizKey = 'repair', ev = [], chips = [], lanesOn = { w: true, f: true, t: true };
  var now = reduce ? 5 : 0, playing = !reduce, holdUntil = 0, visible = true;
  var yaw = -0.3, pitch = 0.52, W = 0, H = 0, dpr = 1, active = null;
  var SWEEP = 22000; // ms for a full week

  function build() {
    layer.textContent = '';
    ev = DATA[bizKey].ev.slice();
    chips = ev.map(function (e, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip ' + (e.call || '');
      b.setAttribute('aria-label', e.when + ', ' + LANES[e.l].name + ': ' + e.label + ', ' + e.sub + '. ' + (e.call === 'fix' ? 'Worth fixing.' : 'Leave it.'));
      var tag = document.createElement('span'); tag.className = 'tag'; tag.textContent = e.call === 'fix' ? 'Fix' : 'Leave';
      var txt = document.createElement('span'); txt.textContent = e.label + ' ';
      var sm = document.createElement('small'); sm.textContent = e.sub;
      txt.appendChild(sm);
      b.appendChild(tag); b.appendChild(txt);
      b.addEventListener('click', function () { open(i); });
      layer.appendChild(b);
      return b;
    });
    close();
  }

  function open(i) {
    var e = ev[i]; active = i;
    chips.forEach(function (c, j) { c.classList.toggle('on', j === i); });
    card.querySelector('.k span').textContent = 'Example · ' + DATA[bizKey].name;
    card.querySelector('.k em').textContent = e.when;
    card.querySelector('h3').textContent = e.title;
    card.querySelector('.saw').textContent = e.saw;
    var call = card.querySelector('.call');
    call.textContent = '';
    var b = document.createElement('b'); b.className = e.call; b.textContent = e.call === 'fix' ? 'Worth fixing' : 'Leave it';
    call.appendChild(b); call.appendChild(document.createTextNode(e.say));
    card.hidden = false;
  }
  function close() { active = null; card.hidden = true; chips.forEach(function (c) { c.classList.remove('on'); }); }
  card.querySelector('.x').addEventListener('click', close);
  scene.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

  root.querySelectorAll('.biz button').forEach(function (b) {
    b.addEventListener('click', function () {
      bizKey = b.getAttribute('data-biz');
      root.querySelectorAll('.biz button').forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
      build(); if (!reduce) { now = 0; } draw();
    });
  });
  root.querySelectorAll('.lanes button').forEach(function (b) {
    b.addEventListener('click', function () {
      var k = b.getAttribute('data-lane'); lanesOn[k] = !lanesOn[k];
      b.setAttribute('aria-pressed', String(lanesOn[k]));
      if (active !== null && ev[active].l === k && !lanesOn[k]) close();
      draw();
    });
  });
  function setPlaying(p) {
    playing = p;
    pauseBtn.setAttribute('aria-label', p ? 'Pause the week' : 'Play the week');
    pauseBtn.innerHTML = p ? '<svg viewBox="0 0 10 10" aria-hidden="true"><rect x="1.5" y="1" width="2.4" height="8"/><rect x="6.1" y="1" width="2.4" height="8"/></svg>'
                           : '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 1l7 4-7 4z"/></svg>';
    if (p) { if (now >= 5) now = 0; last = performance.now(); tick(); }
  }
  pauseBtn.addEventListener('click', function () { setPlaying(!playing); });

  /* drag to turn */
  var dragging = false, sx = 0, sy = 0, syaw = 0, spitch = 0, moved = false;
  scene.addEventListener('pointerdown', function (e) {
    if (e.target.closest('button,.card')) return;
    dragging = true; moved = false; sx = e.clientX; sy = e.clientY; syaw = yaw; spitch = pitch;
    scene.classList.add('dragging');
  });
  window.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > 3) moved = true;
    yaw = Math.max(-0.95, Math.min(0.35, syaw + dx * 0.005));
    if (e.pointerType === 'mouse') pitch = Math.max(0.22, Math.min(0.72, spitch + dy * 0.004));
    if (!playing) draw();
  });
  window.addEventListener('pointerup', function () { dragging = false; scene.classList.remove('dragging'); });

  /* projection */
  var cx, cy, f, dist = 10;
  function proj(x, y, z) {
    var cyw = Math.cos(yaw), syw = Math.sin(yaw);
    var x1 = x * cyw - z * syw, z1 = x * syw + z * cyw;
    var cp = Math.cos(pitch), sp = Math.sin(pitch);
    var y2 = y * cp + z1 * sp, z2 = -y * sp + z1 * cp + dist;
    return [cx + f * x1 / z2, cy - f * y2 / z2, z2];
  }
  function tx(day) { return -2.6 + day * 1.04; }

  function resize() {
    var r = scene.getBoundingClientRect();
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var narrow = W < 600; cx = W * (narrow ? 0.5 : 0.55); cy = H * (narrow ? 0.47 : 0.5); f = Math.min(W * (narrow ? 1.35 : 1.2), H * 1.6);
    draw();
  }

  function line(a, b, col, w) { ctx.strokeStyle = col; ctx.lineWidth = w || 1; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }

  function draw() {
    if (!W) return;
    ctx.clearRect(0, 0, W, H);
    // floor grid
    var gx0 = -4.4, gx1 = 4.4, gz0 = -4.2, gz1 = 5.4, s = 0.45, x, z;
    for (x = gx0; x <= gx1 + 1e-6; x += s) {
      var a = proj(x, 0, gz0), b = proj(x, 0, gz1);
      line(a, b, 'rgba(196,215,235,' + (0.085 * fade(x, 0)).toFixed(3) + ')');
    }
    for (z = gz0; z <= gz1 + 1e-6; z += s) {
      var c = proj(gx0, 0, z), d = proj(gx1, 0, z);
      line(c, d, 'rgba(196,215,235,' + (0.085 * fade(0, z)).toFixed(3) + ')');
    }
    // lanes
    var laneBoxes = [];
    Object.keys(LANES).forEach(function (k) {
      var L = LANES[k], p0 = proj(tx(0) - 0.3, 0, L.z), p1 = proj(tx(5) + 0.2, 0, L.z);
      line(p0, p1, hexA(L.c, lanesOn[k] ? 0.45 : 0.12), 1.2);
      var lp = proj(tx(0) - 0.3, 0, L.z);
      ctx.fillStyle = hexA(L.c, lanesOn[k] ? 0.9 : 0.3);
      ctx.font = '600 10.5px ui-monospace,SFMono-Regular,Consolas,monospace';
      ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
      ctx.fillText(L.name.toUpperCase(), lp[0] + 2, lp[1] - 5);
      laneBoxes.push([lp[0] + 2, lp[1] - 18, ctx.measureText(L.name.toUpperCase()).width + 4, 14]);
    });
    // day ticks along the front lane edge
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    for (var dd = 0; dd < 5; dd++) {
      var t0 = proj(tx(dd), 0, LANES.t.z + 0.55), t1 = proj(tx(dd), 0, LANES.w.z - 0.6);
      line(t0, t1, 'rgba(196,215,235,0.10)');
      var lab = proj(tx(dd + 0.5), 0, LANES.w.z - 0.85);
      ctx.fillStyle = 'rgba(196,215,235,0.5)'; ctx.font = '600 10px ui-monospace,SFMono-Regular,Consolas,monospace';
      ctx.fillText(DAYS[dd], lab[0], lab[1]);
    }
    // events: stems and nodes
    var placed = [];
    ev.forEach(function (e, i) {
      var L = LANES[e.l], on = lanesOn[e.l], seen = e.t <= now;
      var h = 0.75 + (i % 2) * 0.35;
      var base = proj(tx(e.t), 0, L.z), top = proj(tx(e.t), h, L.z);
      var col = e.call === 'fix' && seen ? '#e8b56a' : L.c;
      if (on) {
        line(base, top, hexA(col, seen ? 0.65 : 0.22), 1);
        ctx.fillStyle = hexA(col, seen ? 0.95 : 0.4);
        var sz = seen ? 6 : 5;
        ctx.fillRect(top[0] - sz / 2, top[1] - sz / 2, sz, sz);
        ctx.fillStyle = hexA(L.c, 0.5); ctx.beginPath(); ctx.arc(base[0], base[1], 2, 0, 6.3); ctx.fill();
        if (seen && now - e.t < 0.25 && !reduce) { // pulse when the frame passes
          var k = (now - e.t) / 0.25;
          ctx.strokeStyle = hexA(col, 0.6 * (1 - k)); ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.arc(top[0], top[1], 6 + k * 18, 0, 6.3); ctx.stroke();
        }
      }
      placed.push([top[0], top[1], on, seen]);
    });
    // now frame
    var xn = tx(now), z0 = LANES.w.z - 0.8, z1 = LANES.t.z + 0.8, yh = 1.45;
    var A = proj(xn, 0, z0), B = proj(xn, 0, z1), C = proj(xn, yh, z1), D = proj(xn, yh, z0);
    ctx.fillStyle = 'rgba(168,209,241,0.045)';
    ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.lineTo(C[0], C[1]); ctx.lineTo(D[0], D[1]); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(238,241,246,0.75)'; ctx.lineWidth = 1.2; ctx.stroke();
    // give the frame depth: a second face a little behind, joined at the corners
    var xb = tx(Math.max(0, now - 0.32));
    if (now > 0.05) {
      var Ab = proj(xb, 0, z0), Bb = proj(xb, 0, z1), Cb = proj(xb, yh, z1), Db = proj(xb, yh, z0);
      ctx.strokeStyle = 'rgba(196,215,235,0.22)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(Ab[0], Ab[1]); ctx.lineTo(Bb[0], Bb[1]); ctx.lineTo(Cb[0], Cb[1]); ctx.lineTo(Db[0], Db[1]); ctx.closePath(); ctx.stroke();
      line(Ab, A, 'rgba(196,215,235,0.3)'); line(Bb, B, 'rgba(196,215,235,0.3)'); line(Cb, C, 'rgba(196,215,235,0.3)'); line(Db, D, 'rgba(196,215,235,0.3)');
    }
    // clock label above the frame
    var top2 = proj(xn, yh, z1);
    clock.style.left = Math.max(70, Math.min(W - 70, top2[0])) + 'px';
    clock.style.top = Math.max(58, top2[1] - 8) + 'px';
    var day = Math.min(4, Math.floor(now)), frac = Math.min(1, now - day);
    var mins = Math.round(7 * 60 + frac * 14 * 60), hh = Math.floor(mins / 60), mm = mins % 60;
    var ap = hh >= 12 ? 'PM' : 'AM', h12 = ((hh + 11) % 12) + 1;
    clockText.textContent = 'NOW · ' + DAYS[day] + ' ' + h12 + ':' + (mm < 10 ? '0' : '') + mm + ' ' + ap;
    // chips follow their nodes, nudged apart so labels never sit on each other
    var boxes = laneBoxes.slice();
    var order = chips.map(function (c, i) { return i; }).sort(function (a, b) { return placed[a][1] - placed[b][1]; });
    order.forEach(function (i) {
      var c = chips[i], p = placed[i];
      var key = p[3] ? 's' : 'n'; c._ws = c._ws || {}; var cw = c._ws[key] || 0; if (!cw) { c.classList.toggle('seen', p[3]); cw = c._ws[key] = c.offsetWidth || 160; } var ch = 24;
      var left = p[0] + 12; if (left + cw > W - 2) left = p[0] - 12 - cw;
      left = Math.max(2, left);
      var top = p[1] - ch / 2;
      if (p[2]) {
        for (var tries = 0; tries < 12; tries++) {
          var hit = boxes.some(function (bx) { return left < bx[0] + bx[2] + 6 && left + cw + 6 > bx[0] && top < bx[1] + bx[3] + 3 && top + ch + 3 > bx[1]; });
          if (!hit) break; top += 14;
        }
        boxes.push([left, top, cw, ch]);
        if (Math.abs(top + ch / 2 - p[1]) > 4) { // leader from the node to the moved label
          var ax = left > p[0] ? left : left + cw;
          line([p[0], p[1]], [ax, top + ch / 2], 'rgba(196,215,235,0.28)');
        }
      }
      c._pos = [left, top];
    });
    chips.forEach(function (c, i) {
      var p = placed[i];
      c.classList.toggle('off', !p[2]);
      c.classList.toggle('seen', p[3]);
      c.classList.toggle('future', !p[3]);
      c.style.transform = 'translate(' + Math.round(c._pos[0]) + 'px,' + Math.round(c._pos[1]) + 'px)';
      c.tabIndex = p[2] ? 0 : -1;
    });
  }
  function fade(x, z) { var p = proj(x, 0, z); var d = p[2]; return Math.max(0, Math.min(1, 1.5 - (d - 6) / 5)); }
  function hexA(h, a) { var n = parseInt(h.slice(1), 16); return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')'; }

  var last = 0, raf = 0;
  function tick(t) {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function step(ts) {
      if (!playing || !visible) return;
      var dt = Math.min(64, ts - (last || ts)); last = ts;
      if (holdUntil) { if (ts > holdUntil) { holdUntil = 0; now = 0; } }
      else { now += dt / SWEEP * 5; if (now >= 5) { now = 5; holdUntil = ts + 3500; } }
      draw();
      raf = requestAnimationFrame(step);
    });
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      visible = en[0].isIntersecting;
      if (visible && playing) { last = performance.now(); tick(); }
    }).observe(scene);
  }
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && playing) { last = performance.now(); tick(); }
  });
  window.addEventListener('resize', resize);
  build();
  resize();
  setPlaying(playing);
  if (reduce) draw();
  scene.classList.add('ready');
})();
