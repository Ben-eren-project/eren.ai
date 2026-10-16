'use strict';
// Preview behavior only. No network writes, analytics, persistence or submissions.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('#site-menu');
if(menuToggle && menu){
 const close=()=>{menuToggle.setAttribute('aria-expanded','false');menu.classList.remove('is-open');};
 menuToggle.addEventListener('click',()=>{const open=menuToggle.getAttribute('aria-expanded')!=='true';menuToggle.setAttribute('aria-expanded',String(open));menu.classList.toggle('is-open',open);});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.classList.contains('is-open')){close();menuToggle.focus();}});
 menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
 window.matchMedia('(min-width:801px)').addEventListener('change',e=>{if(e.matches)close();});
}
const perspectives={
 web:{label:'The website & customer experience',title:'Make the next step feel obvious.',body:'Clear services, useful proof, a site that works on a phone, and an inquiry route that reaches the right person. We check the whole path.',steps:['Find you','Understand','Get in touch']},
 work:{label:'The process behind the promise',title:'Less chasing. Clearer handoffs.',body:'Follow one real job from first contact to finished work. Find what gets copied, delayed or corrected, then build a process your team can actually run.',steps:['Request','Handoff','Work complete']},
 tools:{label:'Software, connections & practical AI',title:'The right tools, working together.',body:'Start with what you already use. Configure it, connect it, or build something tailored when a standard tool cannot do the job. AI gets a defined role and a human reviewer.',steps:['Your sources','Useful tool','Human check']}
};
document.querySelectorAll('[data-perspective]').forEach(tab=>tab.addEventListener('click',()=>{
 const item=perspectives[tab.dataset.perspective];
 document.querySelectorAll('[data-perspective]').forEach(t=>{t.setAttribute('aria-selected',String(t===tab));t.tabIndex=t===tab?0:-1;});
 document.querySelector('#perspective-panel').setAttribute('aria-labelledby',tab.id);
 document.querySelector('[data-perspective-label]').textContent=item.label;
 document.querySelector('[data-perspective-title]').textContent=item.title;
 document.querySelector('[data-perspective-body]').textContent=item.body;
 document.querySelectorAll('.route-diagram span').forEach((n,i)=>n.textContent=item.steps[i]);
}));
document.querySelectorAll('.tablist .tab[aria-controls]').forEach(tab=>tab.addEventListener('click',()=>{
 const group=tab.closest('[role=tablist]');
 group.querySelectorAll('[role=tab]').forEach(t=>{const active=t===tab;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;const panel=document.getElementById(t.getAttribute('aria-controls'));if(panel)panel.hidden=!active;});
}));
document.querySelectorAll('[role=tablist]').forEach(group=>group.addEventListener('keydown',e=>{
 const tabs=[...group.querySelectorAll('[role=tab]')],current=tabs.indexOf(document.activeElement);if(current<0)return;
 let next;if(e.key==='ArrowRight'||e.key==='ArrowDown')next=(current+1)%tabs.length;
 if(e.key==='ArrowLeft'||e.key==='ArrowUp')next=(current+tabs.length-1)%tabs.length;
 if(e.key==='Home')next=0;if(e.key==='End')next=tabs.length-1;
 if(next!==undefined){e.preventDefault();tabs[next].focus();tabs[next].click();}
}));
document.querySelectorAll('.tablist .tab[aria-controls]').forEach(tab=>{const p=document.getElementById(tab.getAttribute('aria-controls'));if(p)p.hidden=tab.getAttribute('aria-selected')!=='true';});
const track=document.querySelector('.project-track');
if(track){const move=direction=>track.scrollBy({left:direction*(track.querySelector('.project-card').getBoundingClientRect().width+25),behavior:reducedMotion?'instant':'smooth'});document.querySelector('[data-project-prev]').addEventListener('click',()=>move(-1));document.querySelector('[data-project-next]').addEventListener('click',()=>move(1));track.addEventListener('keydown',e=>{if(e.target===track&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();move(e.key==='ArrowLeft'?-1:1);}});}
const quote=document.querySelector('#qf');
if(quote){
 quote.setAttribute('action','#');quote.setAttribute('onsubmit','return false');
 const submit=quote.querySelector('#send');submit.disabled=false;submit.textContent='Preview quote request ↗';
 const job=new URLSearchParams(location.search).get('job');const jobMap={production:'Production part to print',repair:'Repair or replacement part',assembly:'Fabricated assembly',unsure:'Not sure'};
 if(jobMap[job]){quote.querySelector('#f_type').value=jobMap[job];document.querySelector('#prefill').hidden=false;}
 quote.addEventListener('submit',e=>{e.preventDefault();let first;
  quote.querySelectorAll('[required]').forEach(field=>{const valid=field.checkValidity();field.setAttribute('aria-invalid',String(!valid));const msg=field.parentElement.querySelector('.err');if(msg)msg.textContent=valid?'':field.type==='email'?'Enter a valid email address.':'Please complete this field.';if(!valid&&!first)first=field;});
  if(first){first.focus();return;}
  const result=document.querySelector('#ok');result.hidden=false;result.setAttribute('tabindex','-1');result.focus();
 });
}
const intake=document.querySelector('#intake');
if(intake){
 const params=new URLSearchParams(location.search);const rawPackage=params.get('package');const pack=rawPackage==='build'?'build':'diagnose';const firstLook=rawPackage==='first-look'||params.get('intent')==='first-look';
 const steps=[...intake.querySelectorAll('fieldset')].filter(f=>!f.dataset.package||f.dataset.package===pack);let index=0;
 intake.querySelectorAll('fieldset').forEach(f=>{f.hidden=true;f.disabled=true;});
 if(pack==='build'){document.querySelector('#packageTitle').textContent='Talk about a Build.';document.querySelector('#packageIntro').textContent='Tell us what you want to change. The diagnosis and your priorities set the scope, and you get an exact quote before work begins.';}
 if(firstLook){document.querySelector('#packageTitle').textContent='Start with a free First Look.';document.querySelector('#packageIntro').textContent='Tell us the question you keep coming back to. A short conversation helps us decide whether a paid diagnosis makes sense.';}
 const show=()=>{steps.forEach((f,i)=>{f.hidden=i!==index;f.disabled=i!==index;f.classList.toggle('current',i===index);});document.querySelector('#form-progress').textContent=`Step ${index+1} of 3`;document.querySelectorAll('.intake-progress li').forEach((li,i)=>li.classList.toggle('active',i===index));steps[index].querySelectorAll('.step-back').forEach(b=>b.hidden=index===0);document.querySelector('#sendBtn').disabled=false;};
 const valid=()=>{const failed=[...steps[index].querySelectorAll('input,textarea,select')].find(f=>!f.checkValidity());if(failed){failed.reportValidity();return false;}return true;};
 const focusTitle=()=>{const title=steps[index].querySelector('.step-title');title.tabIndex=-1;title.focus({preventScroll:true});document.querySelector('.intake-main').scrollIntoView({behavior:reducedMotion?'instant':'smooth',block:'start'});};
 intake.querySelectorAll('.step-next').forEach(b=>b.addEventListener('click',()=>{if(valid()&&index<2){index++;show();focusTitle();}}));
 intake.querySelectorAll('.step-back').forEach(b=>b.addEventListener('click',()=>{if(index>0){index--;show();focusTitle();}}));
 intake.addEventListener('submit',e=>{e.preventDefault();if(index!==2){if(valid()){index++;show();focusTitle();}return;}if(!valid())return;
  const summary=document.querySelector('#request-summary');summary.replaceChildren();
  const fields=[['Request',firstLook?'Free First Look':pack==='build'?'Eren Build':'Eren Diagnose'],['Business',document.querySelector('#business').value],['Website',document.querySelector('#website').value],['Question / change',document.querySelector(pack==='build'?'#buildChange':'#diagnoseProblem').value],['Reply to',`${document.querySelector('#you').value} · ${document.querySelector('#email').value}`]];
  fields.forEach(([label,value])=>{if(value){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;summary.append(dt,dd);}});
  intake.hidden=true;const result=document.querySelector('.local-result');result.hidden=false;result.focus();
 });
 document.querySelector('[data-edit-request]').addEventListener('click',()=>{document.querySelector('.local-result').hidden=true;intake.hidden=false;show();focusTitle();});show();
}
