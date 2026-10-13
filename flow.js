/* Step-by-step intake. Shows one fieldset.step at a time, checks the step's required
   fields before moving on, and keeps the paper-sheet preview in sync with the answers.
   It never sends anything: each page's own script still builds and posts the request. */
(function () {
  'use strict';
  var root = document.querySelector('.flow');
  if (!root) return;
  var form = root.querySelector('form');
  if (!form) return;
  document.documentElement.classList.add('flow-js');

  var previewIn = root.querySelector('.flow-preview-in');
  var sheetWrap = root.querySelector('.flow-sheet-wrap');
  var bar = root.querySelector('.flow-bar i');
  var count = root.querySelector('.flow-count');
  var live = root.querySelector('.flow-live');
  var mobile = window.matchMedia ? window.matchMedia('(max-width: 979px)') : { matches: false };
  var saveKey = root.getAttribute('data-save-key');
  var cur = 0;

  function all(sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); }
  function steps() { return all('fieldset.step', form).filter(function (s) { return !s.hasAttribute('data-off'); }); }
  function off(el) { return !!el.closest('[data-off]'); }

  function labelText(el) {
    var lab = el.id ? form.querySelector('label[for="' + el.id + '"]') : null;
    if (!lab) return 'this field';
    var copy = lab.cloneNode(true);
    all('.req, .opt, .hint', copy).forEach(function (n) { n.remove(); });
    return copy.textContent.replace(/\s+/g, ' ').trim();
  }

  function placeSheet() {
    if (!sheetWrap || !previewIn) return;
    var slot = form.querySelector('fieldset.step.is-current .review-slot');
    var target = (mobile.matches && slot) ? slot : previewIn;
    if (sheetWrap.parentNode !== target) target.insertBefore(sheetWrap, target.firstChild);
  }

  function show(i, focus) {
    var list = steps();
    if (!list.length) return;
    cur = Math.max(0, Math.min(i, list.length - 1));
    all('fieldset.step', form).forEach(function (s) { s.hidden = true; s.classList.remove('is-current'); });
    var s = list[cur];
    s.hidden = false;
    s.classList.add('is-current');
    var n = list.length;
    if (bar) bar.style.width = ((cur + 1) / n * 100) + '%';
    if (count) count.textContent = (cur + 1) + ' of ' + n;
    if (live) live.textContent = 'Step ' + (cur + 1) + ' of ' + n;
    root.classList.toggle('is-first', cur === 0);
    root.classList.toggle('is-last', cur === n - 1);
    placeSheet();
    if (focus) {
      var h = s.querySelector('.step-title');
      if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
      var top = root.getBoundingClientRect().top + window.pageYOffset - 90;
      if (window.pageYOffset > top) window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }
  }

  function stepError(s, message, el) {
    var box = s.querySelector('.step-err');
    all('.f.is-invalid', s).forEach(function (f) { f.classList.remove('is-invalid'); });
    if (!box) return;
    if (!message) { box.hidden = true; box.textContent = ''; return; }
    box.textContent = message;
    box.hidden = false;
    if (el) {
      var f = el.closest('.f');
      if (f) f.classList.add('is-invalid');
      el.focus();
    }
  }

  function validate(s) {
    var fields = all('input, textarea', s).filter(function (el) { return !off(el) && !el.closest('[hidden]'); });
    for (var i = 0; i < fields.length; i++) {
      var el = fields[i];
      if (el.required && !el.value.trim()) { stepError(s, 'Please fill in “' + labelText(el) + '” to continue.', el); return false; }
    }
    for (var j = 0; j < fields.length; j++) {
      var e = fields[j];
      if (e.value.trim() && (e.type === 'email' || e.type === 'url') && !e.checkValidity()) {
        stepError(s, e.type === 'email' ? 'Please enter a valid email address.' : 'Please enter a full website address, including https://.', e);
        return false;
      }
    }
    stepError(s, '');
    return true;
  }

  // Chips that stand in for a select: the picked value is copied into a hidden input,
  // so the page script reads it by id exactly as before.
  all('[data-sync]', form).forEach(function (group) {
    var target = document.getElementById(group.getAttribute('data-sync'));
    if (!target) return;
    group.addEventListener('change', function (e) {
      if (e.target && e.target.type === 'radio') { target.value = e.target.value; render(); }
    });
  });

  function render() {
    if (!sheetWrap) return;
    all('[data-preview]', sheetWrap).forEach(function (slot) {
      var ids = slot.getAttribute('data-preview').split('|'), v = '';
      for (var i = 0; i < ids.length; i++) {
        var el = document.getElementById(ids[i]);
        if (el && !off(el) && el.value.trim()) { v = el.value.trim(); break; }
      }
      var max = +slot.getAttribute('data-max') || 0;
      if (max && v.length > max) v = v.slice(0, max - 1).replace(/\s+\S*$/, '') + '…';
      slot.textContent = v;
      slot.classList.toggle('is-empty', !v);
    });
    all('[data-preview-group]', sheetWrap).forEach(function (slot) {
      var name = slot.getAttribute('data-preview-group');
      var picked = all('input[name="' + name + '"]:checked', form).filter(function (b) { return !off(b); });
      slot.innerHTML = '';
      picked.forEach(function (b) {
        var span = document.createElement('span');
        span.textContent = (b.closest('label') || b).textContent.replace(/\s+/g, ' ').trim();
        slot.appendChild(span);
      });
      slot.classList.toggle('is-empty', !picked.length);
    });
    all('[data-preview-count]', sheetWrap).forEach(function (slot) {
      var name = slot.getAttribute('data-preview-count');
      var n = all('input[name="' + name + '"]:checked', form).length;
      slot.textContent = n ? n + ' of ' + all('input[name="' + name + '"]', form).length + ' granted' : '';
      slot.classList.toggle('is-empty', !n);
    });
  }

  form.addEventListener('input', render);
  form.addEventListener('change', render);

  form.addEventListener('click', function (e) {
    var next = e.target.closest('.step-next');
    var back = e.target.closest('.step-back');
    if (next) { e.preventDefault(); var s = steps()[cur]; if (validate(s)) show(cur + 1, true); }
    if (back) { e.preventDefault(); show(cur - 1, true); }
  });

  // Enter moves to the next step instead of sending the whole form early.
  form.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' || e.isComposing) return;
    var t = e.target;
    if (!t || t.tagName !== 'INPUT' || t.type === 'checkbox' || t.type === 'radio' || t.type === 'submit') return;
    if (cur < steps().length - 1) {
      e.preventDefault();
      var s = steps()[cur];
      if (validate(s)) show(cur + 1, true);
    }
  });

  if (mobile.addEventListener) mobile.addEventListener('change', placeSheet);

  // Save for later: kept only in this browser, cleared once the details are sent.
  function snapshot() {
    var data = { v: {}, c: [], step: cur };
    all('input, textarea', form).forEach(function (el) {
      if (el.type === 'checkbox' || el.type === 'radio') { if (el.checked) data.c.push(el.name + '=' + el.value); }
      else if (el.id) data.v[el.id] = el.value;
    });
    return data;
  }
  function restore(data) {
    Object.keys(data.v || {}).forEach(function (id) { var el = document.getElementById(id); if (el) el.value = data.v[id]; });
    all('input[type=checkbox], input[type=radio]', form).forEach(function (el) {
      var on = (data.c || []).indexOf(el.name + '=' + el.value) !== -1;
      if (el.checked !== on) { el.checked = on; el.dispatchEvent(new Event('change', { bubbles: true })); }
    });
    render();
    show(data.step || 0, true);
  }
  function readSaved() { try { return JSON.parse(localStorage.getItem(saveKey) || 'null'); } catch (_) { return null; } }
  if (saveKey) {
    var saveBtn = root.querySelector('.flow-save'), savedNote = root.querySelector('.flow-saved');
    if (saveBtn) saveBtn.addEventListener('click', function () {
      try {
        localStorage.setItem(saveKey, JSON.stringify(snapshot()));
        if (savedNote) { savedNote.hidden = false; savedNote.textContent = 'Saved in this browser only. Open this page again on this device to pick up where you left off.'; }
      } catch (_) {
        if (savedNote) { savedNote.hidden = false; savedNote.textContent = 'This browser won’t let the page save. Your answers are still here while the page stays open.'; }
      }
    });
    var resume = root.querySelector('.flow-resume'), saved = readSaved();
    if (resume && saved) {
      resume.hidden = false;
      resume.querySelector('.yes').addEventListener('click', function () { resume.hidden = true; restore(saved); });
      resume.querySelector('.no').addEventListener('click', function () { resume.hidden = true; try { localStorage.removeItem(saveKey); } catch (_) {} });
    }
  }

  window.ErenFlow = {
    // Jump to the step that holds a field, so the page script's own checks can point at it.
    reveal: function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var s = el.closest('fieldset.step');
      var i = steps().indexOf(s);
      if (i !== -1 && i !== cur) show(i, false);
    },
    sent: function () {
      root.classList.add('is-sent');
      if (saveKey) { try { localStorage.removeItem(saveKey); } catch (_) {} }
    }
  };

  render();
  show(0, false);
})();
