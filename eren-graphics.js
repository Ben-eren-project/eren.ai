/* User-driven disclosure only. All examples remain visible without JS. */
document.querySelectorAll('.gx-showcase').forEach(root=>{
 root.classList.add('gx-ready');
 root.querySelectorAll('[role="tabpanel"]').forEach(panel=>panel.tabIndex=0);
 const tabs=[...root.querySelectorAll('[role="tab"]')];
 function select(tab){tabs.forEach(t=>{const active=t===tab;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;root.querySelector('#'+t.getAttribute('aria-controls')).hidden=!active;});}
 tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>select(tab));tab.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%tabs.length;if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;if(e.key==='Home')n=0;if(e.key==='End')n=tabs.length-1;if(n!==undefined){e.preventDefault();select(tabs[n]);tabs[n].focus();}})});
 select(tabs[0]);
});
