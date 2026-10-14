/* Eren effects runtime: reveal-on-scroll for [data-reveal] and .fx-mark. Runs once per element. */
(function(){
  "use strict";
  if(!("IntersectionObserver" in window)) return;
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var root=document.documentElement; root.classList.add("fx-on");
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add("is-in"); io.unobserve(e.target); } });
  },{rootMargin:"0px 0px -10% 0px",threshold:0.08});
  document.querySelectorAll("[data-reveal],.fx-mark").forEach(function(el){ io.observe(el); });
})();
