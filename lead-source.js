/* First approved campaign tag in this browser tab. No analytics request or cookies.
   Values are allowlisted channel labels, never full URLs or arbitrary query contents.
   The label is sent only with a deliberately submitted intake, in existing notes. */
(function () {
  'use strict';
  var key = 'eren-source-v1';
  var sources = ['referral','partner','research','linkedin','community','workshop','organic','case-study'];
  var campaigns = ['first-look','lead-leak','booking','manual-work','presence','tool-stack','custom-tool'];
  function valid(value, list) { return typeof value === 'string' && list.indexOf(value) !== -1; }
  function read() {
    try {
      var value = JSON.parse(sessionStorage.getItem(key));
      return value && valid(value.source, sources) && valid(value.campaign, campaigns) ? value : null;
    } catch (_) { return null; }
  }
  var params = new URLSearchParams(window.location.search);
  var source = params.get('utm_source'), campaign = params.get('utm_campaign') || 'first-look';
  if (!read() && valid(source, sources) && valid(campaign, campaigns)) {
    try { sessionStorage.setItem(key, JSON.stringify({source:source,campaign:campaign})); } catch (_) {}
  }
  window.ErenLeadSource = {read:read};
})();
