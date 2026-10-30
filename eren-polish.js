/* Eren polish layer (30 Oct 2026): the problem strip shows each item once (it no longer scrolls), and on phones the
   nav links fold behind a Menu button. Without JavaScript the links stay visible and the strip shows twice. */
(function(){
  document.querySelectorAll('.marq-track').forEach(function(t){
    var items=[].slice.call(t.children), seen={};
    items.forEach(function(el){ var k=el.textContent.trim(); if(seen[k]) el.classList.add('dup'); seen[k]=1; });
  });
  var links=document.querySelector('nav .nav-links'), inner=document.querySelector('nav .nav-in');
  if(!links||!inner) return;
  links.classList.add('collapsible'); if(!links.id) links.id='site-links';
  var b=document.createElement('button'); b.type='button'; b.className='nav-menu'; b.setAttribute('aria-expanded','false'); b.setAttribute('aria-controls',links.id);
  b.innerHTML='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg><span class="lbl">Menu</span>';
  var r=inner.querySelector('.nav-r'); if(r) r.insertBefore(b,r.firstChild); else inner.appendChild(b);
  function set(open){ links.classList.toggle('open',open); b.setAttribute('aria-expanded',String(open)); }
  b.addEventListener('click',function(){ set(!links.classList.contains('open')); if(links.classList.contains('open')){ var a=links.querySelector('a'); if(a) a.focus(); } });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&links.classList.contains('open')){ set(false); b.focus(); } });
  document.addEventListener('click',function(e){ if(links.classList.contains('open')&&!links.contains(e.target)&&e.target!==b&&!b.contains(e.target)) set(false); });
})();
