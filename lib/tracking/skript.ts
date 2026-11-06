// Cookieloses Tracking, Browser-Teil (inline, < 1 KB): Seitenaufrufe inkl. Client-Navigation und Kontakt-Klicks.
// Keine Cookies, kein localStorage, keine IDs im Browser. Admin-Pfade werden nie gemessen.
export const TRACKING_SKRIPT = `(function(){
if(window.__tsT)return;window.__tsT=1;
var L=location,N=navigator,last='';
function s(t,z){try{var p=L.pathname;if(/^\\/(admin|api)(\\/|$)/.test(p))return;
var d={t:t,p:p,l:(N.language||'').slice(0,12),w:window.innerWidth};
if(z)d.z=String(z).slice(0,80);
if(t==='pageview'){var q=new URLSearchParams(L.search);d.r=document.referrer;d.us=q.get('utm_source');d.um=q.get('utm_medium');d.uc=q.get('utm_campaign');}
var b=JSON.stringify(d);
if(N.sendBeacon){N.sendBeacon('/api/t/',new Blob([b],{type:'application/json'}))}else{fetch('/api/t/',{method:'POST',body:b,keepalive:true,headers:{'Content-Type':'application/json'}})}}catch(e){}}
function pv(){if(L.pathname===last)return;last=L.pathname;s('pageview')}
['pushState','replaceState'].forEach(function(m){var o=history[m];history[m]=function(){var r=o.apply(this,arguments);setTimeout(pv,50);return r}});
addEventListener('popstate',function(){setTimeout(pv,50)});
document.addEventListener('click',function(e){var a=e.target&&e.target.closest&&e.target.closest('a,button,[data-track]');if(!a)return;
var h=(a.getAttribute('href')||'').toLowerCase(),tr=a.getAttribute('data-track');
if(h.indexOf('tel:')===0)s('click_tel');
else if(h.indexOf('wa.me')>-1||h.indexOf('whatsapp')>-1)s('click_whatsapp');
else if(h.indexOf('mailto:')===0)s('click_mail');
else if(/google\\.[a-z.]+\\/maps|maps\\.google|maps\\.apple|goo\\.gl\\/maps/.test(h))s('click_route');
else if(tr)s('cta',tr);},true);
document.addEventListener('submit',function(e){var f=e.target;s('form_submit',f&&(f.getAttribute('data-track')||f.getAttribute('aria-label')||f.id||''))},true);
pv();
})();`;
