/* Northline Metal Works (fictional demo by Eren). Runs after kit/eren-kit.js.
   Nothing here makes a network request, stores anything or sends a form. */
(function () {
  'use strict';

  /* Revision switch: the kit's tabs move the pill and swap the note; this keeps the drawing in step. */
  document.querySelectorAll('[data-rev-for]').forEach(function (root) {
    var art = document.getElementById(root.getAttribute('data-rev-for'));
    if (!art) return;
    var sync = function () {
      var on = root.querySelector('[role="tab"][aria-selected="true"]');
      if (on) art.setAttribute('data-rev', on.getAttribute('data-rev'));
    };
    root.querySelectorAll('[role="tab"]').forEach(function (t) {
      t.addEventListener('click', sync);
      t.addEventListener('keyup', sync);
    });
    sync();
  });

  /* Quote form: prefill the job type from ?job=, check the fields, then show what a shop would receive. */
  var form = document.getElementById('qf');
  if (!form) return;
  document.getElementById('send').disabled = false;
  var job = new URLSearchParams(location.search).get('job');
  var radio = job && form.querySelector('input[name="type"][value="' + job + '"]');
  if (radio) { radio.checked = true; document.getElementById('prefill').hidden = false; }

  var messages = {
    type: 'Choose the closest job type, so the right person reads it first.',
    company: 'Enter your company name, so the quote is addressed correctly.',
    name: 'Enter your name, so the coordinator knows who to reply to.',
    email: 'Enter an email address like name@company.example. The quote is sent there.'
  };
  function setError(name, bad) {
    var box = document.getElementById('e_' + name);
    form.querySelectorAll('[name="' + name + '"]').forEach(function (f) {
      if (f.type !== 'radio') f.setAttribute('aria-invalid', bad ? 'true' : 'false');
    });
    if (box) box.textContent = bad ? messages[name] : '';
  }
  function value(name) {
    var el = form.querySelector('[name="' + name + '"]:checked') || form.querySelector('[name="' + name + '"]:not([type="radio"])');
    if (!el) return '';
    if (el.type === 'file') return el.files[0] ? el.files[0].name : '';
    return el.value.trim();
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var first = null;
    ['type', 'company', 'name', 'email'].forEach(function (n) {
      var el = form.querySelector('[name="' + n + '"]');
      var ok = n === 'type' ? !!form.querySelector('input[name="type"]:checked') : (el.checkValidity() && el.value.trim() !== '');
      setError(n, !ok);
      if (!ok && !first) first = el;
    });
    if (first) { first.focus(); return; }

    var rows = [
      ['Job type', form.querySelector('input[name="type"]:checked').getAttribute('data-label')],
      ['Company', value('company')], ['Contact', value('name') + ', ' + value('email')],
      ['Material', value('material') || 'Not given yet'], ['Quantity', value('qty') || 'Not given yet'],
      ['Drawing', value('drawing') || 'None attached'], ['Job and timing', value('desc') || 'Not given yet', 'wide']
    ];
    var list = document.getElementById('summary');
    list.replaceChildren();
    rows.forEach(function (r) {
      var d = document.createElement('div'), dt = document.createElement('dt'), dd = document.createElement('dd');
      if (r[2]) d.className = r[2];
      dt.textContent = r[0]; dd.textContent = r[1]; d.append(dt, dd); list.append(d);
    });
    form.hidden = true;
    var done = document.getElementById('done');
    done.hidden = false; done.focus();
  });
  form.querySelectorAll('input,textarea').forEach(function (f) {
    f.addEventListener('change', function () { if (messages[f.name]) setError(f.name, false); });
  });
  document.getElementById('edit').addEventListener('click', function () {
    document.getElementById('done').hidden = true; form.hidden = false;
    (form.querySelector('input[name="type"]:checked') || form.querySelector('input')).focus();
  });
})();
