/* Light / dark toggle. Dark is Eren's default; a visitor's choice is remembered in this browser only.
   The early part (setting data-theme before paint) is inlined in each page's <head>. */
(function () {
  var root = document.documentElement;
  function current() { return root.getAttribute("data-theme") === "light" ? "light" : "dark"; }
  var SUN = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>';
  function paint(btn) {
    var light = current() === "light";
    btn.innerHTML = light ? MOON : SUN;
    btn.setAttribute("aria-label", light ? "Switch to dark mode" : "Switch to light mode");
    btn.setAttribute("title", light ? "Dark mode" : "Light mode");
  }
  function mount() {
    var host = document.querySelector("nav .nav-r"), before = null;
    if (!host) { before = document.querySelector("nav .nav-in > .btn"); host = before && before.parentNode; }
    if (!host || host.querySelector(".theme-toggle")) return;
    var btn = document.createElement("button");
    btn.type = "button"; btn.className = "theme-toggle";
    paint(btn);
    btn.addEventListener("click", function () {
      var next = current() === "light" ? "dark" : "light";
      if (next === "light") root.setAttribute("data-theme", "light"); else root.removeAttribute("data-theme");
      try { localStorage.setItem("eren-theme", next); } catch (e) {}
      paint(btn);
    });
    host.insertBefore(btn, before || host.firstChild);
    if (before) btn.style.marginRight = "12px";
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();
})();
