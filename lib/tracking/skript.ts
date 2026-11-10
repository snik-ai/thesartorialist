// Cookieloses Tracking, Browser-Teil (inline, ~2 KB): Seitenaufrufe inkl. Client-Navigation, sichtbare
// Verweildauer (beim Verlassen/Verstecken und alle 60 s als «ende» nachgetragen), Kontakt-Klicks,
// Konfigurator-/Shop-Aktionen und gesendete Anfragen.
// Keine Cookies, kein localStorage/sessionStorage: die Aufruf-ID lebt nur im Arbeitsspeicher der Seite,
// die Sitzung bildet der Server. «Do Not Track» und «Global Privacy Control» werden respektiert.
// Admin-Pfade werden nie gemessen. Komponenten melden Aktionen über window.tsT(typ, ziel).
export const TRACKING_SKRIPT = `(function(){
if(window.__tsT)return;window.__tsT=1;
var L=location,N=navigator,D=document,W=window,last='',A=null,P='',vis=0,seit=null,erst=1;
if(N.doNotTrack==='1'||W.doNotTrack==='1'||N.globalPrivacyControl){W.tsT=function(){};return}
function id(){var a=new Uint8Array(9);(W.crypto||W.msCrypto).getRandomValues(a);return Array.prototype.map.call(a,function(x){return('0'+(x%36).toString(36)).slice(-1)}).join('')+Date.now().toString(36)}
function frei(p){return!/^\\/(admin|api|angebot)(\\/|$)/.test(p)}
function post(d){try{var b=JSON.stringify(d);
if(N.sendBeacon&&N.sendBeacon('/api/t/',new Blob([b],{type:'application/json'})))return;
fetch('/api/t/',{method:'POST',body:b,keepalive:true,headers:{'Content-Type':'application/json'}})}catch(e){}}
function s(t,z){try{var p=L.pathname;if(!frei(p))return;
var d={t:t,p:p,l:(N.language||'').slice(0,12),w:W.innerWidth,tp:N.maxTouchPoints>1};
if(z)d.z=String(z).slice(0,80);
if(t==='pageview'){d.a=A;d.ti=D.title.slice(0,160);
if(erst){erst=0;var q=new URLSearchParams(L.search);d.r=D.referrer;d.us=q.get('utm_source');d.um=q.get('utm_medium');d.uc=q.get('utm_campaign');d.ut=q.get('utm_term');d.uco=q.get('utm_content');d.g=!!(q.get('gclid')||q.get('gbraid')||q.get('wbraid'))}}
post(d)}catch(e){}}
function zeit(){return vis+(seit?Date.now()-seit:0)}
function ende(){if(A&&frei(P))post({t:'ende',p:P,a:A,d:Math.min(zeit(),1800000)})}
function pv(){if(L.pathname===last)return;ende();last=L.pathname;P=L.pathname;A=id();vis=0;seit=D.visibilityState==='visible'?Date.now():null;setTimeout(function(){s('pageview')},0)}
D.addEventListener('visibilitychange',function(){if(D.visibilityState==='hidden'){if(seit){vis+=Date.now()-seit;seit=null}ende()}else seit=Date.now()});
addEventListener('pagehide',ende);
setInterval(function(){if(D.visibilityState==='visible')ende()},60000);
['pushState','replaceState'].forEach(function(m){var o=history[m];history[m]=function(){var r=o.apply(this,arguments);setTimeout(pv,60);return r}});
addEventListener('popstate',function(){setTimeout(pv,60)});
W.tsT=function(t,z){s(t,z)};
var EIGEN=/^(konfig_start|konfig_pdf|konfig_termin|shop_warenkorb|shop_checkout)$/;
D.addEventListener('click',function(e){var a=e.target&&e.target.closest&&e.target.closest('a,button,[data-track]');if(!a)return;
var h=(a.getAttribute('href')||'').toLowerCase(),tr=a.getAttribute('data-track');
if(h.indexOf('tel:')===0)s('click_tel',h.slice(4).replace(/[^+0-9]/g,''));
else if(h.indexOf('wa.me')>-1||h.indexOf('whatsapp')>-1)s('click_whatsapp','WhatsApp');
else if(h.indexOf('mailto:')===0)s('click_mail',h.slice(7).split('?')[0]);
else if(/google\\.[a-z.]+\\/maps|maps\\.google|maps\\.apple|goo\\.gl\\/maps/.test(h))s('click_route','Route');
else if(tr&&EIGEN.test(tr))s(tr);
else if(tr)s('cta',tr);},true);
D.addEventListener('submit',function(e){var f=e.target;s('form_submit',f&&(f.getAttribute('data-track')||f.getAttribute('aria-label')||f.id||''))},true);
pv();
})();`;
