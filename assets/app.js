(function(){
'use strict';
var D=null, NW=0, S={per:'12',can:'all',exp:'all',art:'all'};
var HORS='Hors exposition';
var CANAUX=['Instagram','Lettre','Site','Visite en ligne','Presse','Foires'];
var CNOM={'Instagram':'Instagram','Lettre':'Lettre d’information','Site':'Site','Visite en ligne':'Visite en ligne','Presse':'Presse','Foires':'Foires'};
var SEGS=['Collectionneurs','Institutions','Presse','Grand public'];
var MOIS=['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
var charts={};
var NOMF={'Instagram':'Instagram','Lettre':'La lettre d’information','Site':'Le site','Visite en ligne':'La visite en ligne','Presse':'La presse','Foires':'Les foires'};
function $(id){return document.getElementById(id)}
function nf(x,d){return (+x).toLocaleString('fr-FR',{minimumFractionDigits:d||0,maximumFractionDigits:d||0}).replace(/\u202f/g,'\u00a0')}
function pct(x,d){return nf(x*100,d===undefined?1:d)+'\u00a0%'}
function eur(e){if(e>=1e6)return nf(e/1e6,2)+'\u00a0M€';if(e>=1e4)return nf(e/1e3,0)+'\u00a0k€';return nf(e)+'\u00a0€'}
function big(s){var m=String(s).match(/^([\d\s\u00a0,+]+)\u00a0(.*)$/);return m?m[1]+'<small>'+m[2]+'</small>':s}
function compact(x){if(x>=1e6)return nf(x/1e6,x>=1e7?1:2)+'\u00a0M';if(x>=1e5)return nf(x/1e3,0)+'\u00a0k';return nf(x)}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;')}
function sum(a,f){var s=0;for(var i=0;i<a.length;i++)s+=f(a[i]);return s}
function dfr(iso,y){var d=new Date(iso+'T12:00:00');return d.getDate()+(d.getDate()===1?'er':'')+' '+MOIS[d.getMonth()].replace('.','')+(y?' '+d.getFullYear():'')}
function wlab(i){var d=new Date(D.semaines[i]+'T12:00:00');return d.getDate()+' '+MOIS[d.getMonth()]}
function dl(c,p){ // variation relative, HTML
  if(p===null||p===undefined||!isFinite(p)||!p) return '';
  var d=(c-p)/Math.abs(p)*100, cl=d>=0?'up':'down';
  return '<span class="'+cl+'">'+(d>=0?'+':'\u2212')+nf(Math.abs(d),0)+'\u00a0%</span>';
}
function dpt(c,p){ // variation en points
  if(p===null||p===undefined||!isFinite(p)||!isFinite(c)) return '';
  var d=(c-p)*100, cl=d>=0?'up':'down';
  if(Math.abs(d)<0.05) return '<span class="up">stable</span>';
  return '<span class="'+cl+'">'+(d>=0?'+':'\u2212')+nf(Math.abs(d),Math.abs(d)<0.1?2:1)+'\u00a0pt</span>';
}
function range(){
  var b=NW-1,a,pa,pb,lab,cmp;
  if(S.per==='ytd'){a=0;while(D.semaines[a]<'2026-01-01')a++;pa=a-52;pb=b-52;lab='depuis janvier 2026';cmp='vs même période 2025'}
  else{var n=+S.per;a=NW-n;pa=a-n;pb=a-1;lab='sur les '+n+' dernières semaines';cmp='vs '+n+' semaines précédentes'}
  return {a:a,b:b,pa:pa,pb:pb,n:b-a+1,lab:lab,cmp:cmp};
}
// filtres génériques : idx semaine, canal, expo, artiste
function keep(w,a,b,can,ex,ar,ign){ign=ign||{};
  return w>=a&&w<=b&&(ign.can||S.can==='all'||can===S.can)&&(S.exp==='all'||ex===S.exp)&&(S.art==='all'||ar===S.art);
}
function funRows(a,b,ign){return D.fun.filter(function(r){return keep(r[0],a,b,r[1],r[2],r[3],ign)})}
function agg(rows){var o={t:0,vg:0,vp:0,vl:0,vs:0,v:0,d:0,r:0,o:0,s:0,ca:0};
  rows.forEach(function(x){o.t+=x[4];o.vg+=x[5];o.vp+=x[6];o.vl+=x[7];o.vs+=x[8];o.d+=x[9];o.r+=x[10];o.o+=x[11];o.s+=x[12];o.ca+=x[13]});
  o.v=o.vg+o.vp+o.vl+o.vs;return o}
function div(a,b){return b?a/b:0}

function render(){
  var R=range(), c=agg(funRows(R.a,R.b)), p=agg(funRows(R.pa,R.pb));
  // phrase
  var byC={};CANAUX.forEach(function(k){byC[k]=agg(funRows(R.a,R.b,{can:1}).filter(function(r){return r[1]===k}))});
  var best=CANAUX.filter(function(k){return k!=='Foires'&&byC[k].t>=10000&&byC[k].ca>0}).sort(function(x,y){return div(byC[y].ca,byC[y].t)-div(byC[x].ca,byC[x].t)})[0];
  var ph;
  if(!c.t&&!c.d){ph='Aucune activité ne correspond à ces filtres '+R.lab+'.'}
  else{
    var pre=[];if(S.exp===HORS)pre.push('Hors exposition');else if(S.exp!=='all')pre.push('Autour de « '+esc(S.exp)+' »');if(S.art!=='all')pre.push((pre.length?'pour ':'Pour ')+esc(S.art));
    ph=(pre.length?pre.join(', ')+', l':'L')+'a communication'+(S.can!=='all'?' ('+CNOM[S.can].toLowerCase().replace('site','site').replace('instagram','Instagram')+')':'')+' a touché <b>'+compact(c.t)+' personnes</b> '+R.lab+
      ', suscité <b>'+nf(c.d)+' demandes de dossier</b> et conduit à <b>'+nf(c.s)+' vente'+(c.s>1?'s':'')+'</b> pour '+eur(c.ca)+'.';
    if(S.can==='all'&&best) ph+=' '+NOMF[best]+' est le canal de communication qui rapporte le plus : '+eur(div(byC[best].ca,byC[best].t)*1000)+' de ventes pour 1\u00a0000 personnes touchées.';
  }
  $('phrase').innerHTML=ph;
  var K=[
    {l:'Personnes touchées',v:big(compact(c.t)),d:dl(c.t,p.t)+' '+R.cmp},
    {l:'Demandes de dossier',v:nf(c.d),d:dl(c.d,p.d)+' '+R.cmp},
    {l:'Rendez-vous',v:nf(c.r),d:dl(c.r,p.r)+' '+R.cmp},
    {l:'Œuvres vendues',v:nf(c.s),d:dl(c.s,p.s)+' '+R.cmp},
    {l:'Ventes issues de la communication',v:big(eur(c.ca)),d:dl(c.ca,p.ca)+' '+R.cmp}];
  $('kpis').innerHTML=K.map(function(x){return '<div class="kpi"><p class="l">'+x.l+'</p><p class="v">'+x.v+'</p><p class="d">'+x.d+'</p></div>'}).join('');
  renderObj(R);renderFunnel(R,c,p);renderCanaux(R);renderFunChart(R);
  renderIG(R);renderNL(R);renderWeb(R);renderPresse(R);renderExpos();
  var vis={Instagram:['Instagram'],Lettre:['Lettre'],Site:['Site','Visite en ligne'],Presse:['Presse','Foires']};
  Array.prototype.forEach.call(document.querySelectorAll('.chan'),function(el){el.classList.toggle('hidden',S.can!=='all'&&vis[el.dataset.chan].indexOf(S.can)<0)});
}

/* ---------- 01 objectifs et alertes (toute la galerie) ---------- */
function gallery(a,b){
  var f=agg(D.fun.filter(function(r){return r[0]>=a&&r[0]<=b})), n=b-a+1;
  var gp=D.lettres.filter(function(l){return l[2]>=a&&l[2]<=b&&l[3]==='Grand public'});
  var po=D.posts.filter(function(x){return x[2]>=a&&x[2]<=b});
  var ab=D.insta.filter(function(x){return x[0]>=a&&x[0]<=b});
  return {n:n,f:f,t:f.t/n,d:f.d/n,r:f.r/n,s:f.s/n,ca:f.ca/n,
    gp:div(sum(gp,function(l){return l[8]}),sum(gp,function(l){return l[7]})),
    gpu:div(sum(gp,function(l){return l[10]}),sum(gp,function(l){return l[7]})),
    eng:div(sum(po,function(x){return x[8]}),sum(po,function(x){return x[7]})),
    ab:sum(ab,function(x){return x[2]})/n};
}
function renderObj(R){
  var g=gallery(R.a,R.b), q=gallery(R.pa,R.pb), O=D.objectifs;
  var G=[
    {l:'Personnes touchées / sem.',v:(g.t>=1e4&&g.t<1e5?nf(g.t/1e3,0)+'\u00a0k':compact(g.t)),x:g.t,o:O.touches,ov:compact(O.touches),p:q.t},
    {l:'Demandes de dossier / sem.',v:nf(g.d,1),x:g.d,o:O.demandes,ov:nf(O.demandes),p:q.d},
    {l:'Rendez-vous / sem.',v:nf(g.r,1),x:g.r,o:O.rdv,ov:nf(O.rdv,0),p:q.r},
    {l:'Œuvres vendues / sem.',v:nf(g.s,1),x:g.s,o:O.ventes,ov:nf(O.ventes,1),p:q.s},
    {l:'Ventes / sem.',v:eur(g.ca),x:g.ca,o:O.ca,ov:eur(O.ca),p:q.ca},
    {l:'Ouverture lettre grand public',v:pct(g.gp),x:g.gp,o:O.ouverture_gp,ov:pct(O.ouverture_gp,0),p:q.gp,pt:1},
    {l:'Engagement Instagram',v:pct(g.eng),x:g.eng,o:O.engagement,ov:pct(O.engagement),p:q.eng,pt:1},
    {l:'Nouveaux abonnés / sem.',v:nf(g.ab),x:g.ab,o:O.abonnes_sem,ov:nf(O.abonnes_sem),p:q.ab}];
  G.forEach(function(x){x.r=div(x.x,x.o);x.k=x.r>=.95?'ok':x.r>=.85?'warn':'bad'});
  $('gauges').innerHTML=G.map(function(x){
    var w=Math.min(x.r/1.3,1)*100, m=1/1.3*100;
    return '<div class="g '+x.k+'"><p class="l"><span>'+x.l+'</span><span class="st"><i></i>'+(x.k==='ok'?'Atteint':x.k==='warn'?'À surveiller':'Décroche')+'</span></p>'+
      '<p class="v">'+big(x.v)+'</p><div class="bar"><span style="width:'+w+'%"></span><b style="left:'+m+'%"></b></div>'+
      '<p class="tr">'+nf(x.r*100,0)+'\u00a0% de l’objectif ('+x.ov+') · '+(x.pt?dpt(x.x,x.p):dl(x.x,x.p))+' '+R.cmp.replace('vs ','vs ')+'</p></div>'}).join('');
  // alertes
  var A=[], fc=g.f, fp=agg(D.fun.filter(function(r){return r[0]>=R.pa&&r[0]<=R.pb}));
  var steps=[
    ['visites','demandes de dossier',div(fc.d,fc.v),div(fp.d,fp.v),'Mettre le bouton « Demander le dossier » sur chaque œuvre exposée et le rappeler dans chaque publication.'],
    ['demandes de dossier','rendez-vous',div(fc.r,fc.d),div(fp.r,fp.d),'Répondre à chaque demande de dossier le jour même et proposer aussitôt un créneau de visite.'],
    ['rendez-vous','options',div(fc.o,fc.r),div(fp.o,fp.r),'Rappeler sous 48 heures chaque collectionneur reçu, avec une sélection d’œuvres disponibles et leur prix.'],
    ['options','ventes',div(fc.s,fc.o),div(fp.s,fp.o),'Fixer une date d’échéance à chaque option et relancer la veille.']];
  steps.forEach(function(s){var d=div(s[2]-s[3],s[3]);if(d<-.12)A.push({k:'bad',w:-d,t:'Le passage des '+s[0]+' aux '+s[1]+' décroche : <b>'+pct(s[2],0)+'</b> contre '+pct(s[3],0)+' '+R.cmp.replace('vs ','sur les ').replace('sur les même','sur la même')+'.',r:s[4]})});
  if(g.gp<O.ouverture_gp*.9) A.push({k:'bad',w:1-g.gp/O.ouverture_gp,t:'La lettre grand public n’est plus ouverte que par <b>'+pct(g.gp,0)+'</b> des destinataires (objectif '+pct(O.ouverture_gp,0)+'), et les désinscriptions montent à '+pct(g.gpu,2)+' par envoi.',r:'Raccourcir la lettre grand public, mettre une œuvre dans l’objet et retirer les adresses inactives depuis six mois.'});
  if(g.eng<O.engagement*.9) A.push({k:'warn',w:.1,t:'L’engagement Instagram tombe à <b>'+pct(g.eng)+'</b> par publication (objectif '+pct(O.engagement)+').',r:'Publier davantage d’artistes en atelier et de Reels, les formats qui font réagir.'});
  if(G[4].k==='bad'||G[3].k==='bad') A.push({k:'bad',w:1-Math.min(G[4].r,G[3].r),t:'Les ventes issues de la communication sont sous l’objectif : <b>'+eur(g.ca)+'</b> par semaine pour '+eur(O.ca)+', '+(G[4].p?dl(g.ca,q.ca)+' '+R.cmp:'')+'.',r:'Reprendre une à une les options ouvertes et les rendez-vous sans suite des quatre dernières semaines.'});
  if(G[0].k==='bad') A.push({k:'warn',w:1-G[0].r,t:'L’audience recule : <b>'+compact(g.t)+'</b> personnes touchées par semaine pour un objectif de '+compact(O.touches)+'.',r:'Programmer un Reel par semaine sur l’exposition en cours, c’est le format qui touche le plus.'});
  if(g.d<O.demandes*.85&&!A.length) A.push({k:'bad',w:.1,t:'Les demandes de dossier sont sous l’objectif : <b>'+nf(g.d,1)+'</b> par semaine pour '+nf(O.demandes)+'.',r:'Relancer les collectionneurs de la lettre avec les œuvres disponibles de l’exposition en cours.'});
  A.sort(function(x,y){return (x.k==='bad'?0:1)-(y.k==='bad'?0:1)||y.w-x.w});A=A.slice(0,3);
  // point fort
  var bc=CANAUX.filter(function(k){return k!=='Foires'}).map(function(k){var x=agg(D.fun.filter(function(r){return r[0]>=R.a&&r[0]<=R.b&&r[1]===k}));return {k:k,v:div(x.ca,x.t)*1000,ca:x.ca,t:x.t}}).filter(function(x){return x.ca>0&&x.t>=10000}).sort(function(x,y){return y.v-x.v})[0];
  if(bc) A.push({k:'ok',t:'Point fort : '+NOMF[bc.k].replace(/^L/,'l')+' '+(bc.k==='Foires'?'rapportent':'rapporte')+' <b>'+eur(bc.v)+'</b> de ventes pour 1\u00a0000 personnes touchées.',r:bc.k==='Lettre'?'Garder un envoi tous les quinze jours au segment collectionneurs, c’est lui qui fait les ventes.':'Renforcer ce canal à la prochaine exposition.'});
  $('alerts').innerHTML='<h3>Ce qu’il faut regarder cette semaine</h3>'+A.map(function(x){return '<div class="al '+x.k+'"><i></i><p>'+x.t+'<span>'+x.r+'</span></p></div>'}).join('');
}

/* ---------- 02 entonnoir ---------- */
function renderFunnel(R,c,p){
  var st=[
    ['Personnes touchées','Instagram, lettre, site, visite en ligne, presse, foires',c.t,p.t],
    ['Visites','Galerie, showroom à Paris, visite en ligne, stand',c.v,p.v],
    ['Demandes','Dossier d’œuvres demandé',c.d,p.d],
    ['Rendez-vous','Visite privée ou appel',c.r,p.r],
    ['Options','Œuvre réservée',c.o,p.o],
    ['Ventes',eur(c.ca),c.s,p.s]];
  var mx=Math.log10(Math.max(c.t,10));
  $('funnel').innerHTML=st.map(function(s,i){
    var w=s[2]>0?Math.max(Math.log10(s[2])/mx*100,3):0, rate=i?div(s[2],st[i-1][2]):null, prate=i?div(s[3],st[i-1][3]):null;
    var vs=i===1?'<p class="dl">dont '+nf(c.vg)+' en galerie, '+nf(c.vp)+' à Paris, '+nf(c.vl)+' en ligne, '+nf(c.vs)+' en foire</p>':'';
    return '<div class="st6"><p class="n">'+s[0]+'</p><p class="s">'+s[1]+'</p><p class="v">'+(i?nf(s[2]):big(compact(s[2])))+'</p><div class="bar"><span style="width:'+w+'%"></span></div>'+
      (i?'<p class="r">'+pct(rate,rate<.01?2:rate<.1?1:0)+' <em>de l’étape précédente</em></p><p class="dl">'+(prate?dpt(rate,prate)+' '+R.cmp:'')+'</p>':'<p class="r">'+dl(s[2],s[3])+' <em>'+R.cmp+'</em></p>')+vs+'</div>'}).join('');
}
function renderCanaux(R){
  var rows=funRows(R.a,R.b,{can:1}), prs=funRows(R.pa,R.pb,{can:1});
  var h='<thead><tr><th>Canal</th><th>Touchées</th><th>Visites</th><th>Demandes</th><th>Rendez-vous</th><th>Options</th><th>Ventes</th><th>Montant</th><th>Pour 1 000 touchées</th><th>Évolution</th></tr></thead><tbody>';
  var tot=agg(rows);
  CANAUX.forEach(function(k){var x=agg(rows.filter(function(r){return r[1]===k})),y=agg(prs.filter(function(r){return r[1]===k}));
    if(!x.t&&!x.d)return;
    h+='<tr class="'+(S.can!=='all'&&S.can!==k?'dim':'')+(S.can===k?' hl':'')+'"><td class="t">'+CNOM[k]+'</td><td>'+compact(x.t)+'</td><td>'+nf(x.v)+'</td><td>'+nf(x.d)+'</td><td>'+nf(x.r)+'</td><td>'+nf(x.o)+'</td><td>'+nf(x.s)+'</td><td>'+eur(x.ca)+'</td><td>'+eur(div(x.ca,x.t)*1000)+'</td><td>'+(!x.ca&&y.ca?'<span class="mute">aucune vente attribuée</span>':(dl(x.ca,y.ca)||'·'))+'</td></tr>'});
  h+='<tr class="tot"><td>Total</td><td>'+compact(tot.t)+'</td><td>'+nf(tot.v)+'</td><td>'+nf(tot.d)+'</td><td>'+nf(tot.r)+'</td><td>'+nf(tot.o)+'</td><td>'+nf(tot.s)+'</td><td>'+eur(tot.ca)+'</td><td>'+eur(div(tot.ca,tot.t)*1000)+'</td><td></td></tr>';
  $('t-canaux').innerHTML=h+'</tbody>';
}
var AX={color:'#8A8780',font:{family:'Inter',size:11}};
function baseOpts(yfmt,legend){return {responsive:true,maintainAspectRatio:false,animation:{duration:300},interaction:{mode:'index',intersect:false},
  plugins:{legend:legend?{position:'bottom',align:'start',labels:{boxWidth:9,boxHeight:9,usePointStyle:true,pointStyle:'circle',color:'#4A4945',font:{family:'Inter',size:12},padding:16}}:{display:false},
    tooltip:{backgroundColor:'#111',titleFont:{family:'Inter',size:12},bodyFont:{family:'Inter',size:12},padding:10,cornerRadius:0}},
  scales:{x:{grid:{display:false},border:{color:'#111'},ticks:{color:AX.color,font:{family:'Inter',size:innerWidth<480?10:11},maxRotation:0,autoSkip:true,autoSkipPadding:innerWidth<480?6:10}},
    y:{grid:{color:'#ECE9E2'},border:{display:false},beginAtZero:true,ticks:{color:AX.color,font:AX.font,maxTicksLimit:5,callback:yfmt||function(v){return nf(v)}}}}}}
function chart(id,cfg){if(charts[id])charts[id].destroy();charts[id]=new Chart($(id),cfg)}
function weeksFor(R){var a=Math.min(R.a,NW-12);var o=[];for(var i=a;i<=R.b;i++)o.push(i);return o}
function renderFunChart(R){
  var ws=weeksFor(R), rows=funRows(ws[0],R.b);
  var dm=ws.map(function(w){return sum(rows,function(r){return r[0]===w?r[9]:0})}), vn=ws.map(function(w){return sum(rows,function(r){return r[0]===w?r[12]:0})});
  var o=baseOpts(null,true);o.scales.y2={position:'right',grid:{display:false},border:{display:false},beginAtZero:true,ticks:{color:AX.color,font:AX.font,maxTicksLimit:5,precision:0}};
  chart('c-fun',{data:{labels:ws.map(wlab),datasets:[
    {type:'bar',label:'Demandes de dossier',data:dm,backgroundColor:'#C9BFAE',borderWidth:0,maxBarThickness:22,yAxisID:'y'},
    {type:'line',label:'Œuvres vendues (échelle de droite)',data:vn,borderColor:'#111',backgroundColor:'#111',borderWidth:1.6,pointRadius:2,tension:.25,yAxisID:'y2'}]},options:o});
}

/* ---------- 03 Instagram ---------- */
function postsF(a,b){return D.posts.filter(function(x){return x[2]>=a&&x[2]<=b&&(S.exp==='all'||x[5]===S.exp)&&(S.art==='all'||x[6]===S.art)})}
function renderIG(R){
  var ps=postsF(R.a,R.b), pp=postsF(R.pa,R.pb);
  var ab=D.insta.filter(function(x){return x[0]>=R.a&&x[0]<=R.b}), abp=D.insta.filter(function(x){return x[0]>=R.pa&&x[0]<=R.pb});
  var g=sum(ab,function(x){return x[2]}), gp=sum(abp,function(x){return x[2]});
  var por=div(sum(ps,function(x){return x[7]}),ps.length), porp=div(sum(pp,function(x){return x[7]}),pp.length);
  var en=div(sum(ps,function(x){return x[8]}),sum(ps,function(x){return x[7]})), enp=div(sum(pp,function(x){return x[8]}),sum(pp,function(x){return x[7]}));
  $('ig-ab').textContent=nf(D.insta[D.insta.length-1][1]);$('ig-rel').textContent=D.releve_ig;
  $('ig-mini').innerHTML='<div><p class="v">+'+nf(g)+'</p><p class="l">nouveaux abonnés '+R.lab+' · '+dl(g,gp)+'</p></div>'+
    '<div><p class="v">'+compact(por)+'</p><p class="l">comptes touchés par publication · '+dl(por,porp)+'</p></div>'+
    '<div><p class="v">'+pct(en)+'</p><p class="l">engagement par publication · '+dpt(en,enp)+'</p></div>';
  var ws=weeksFor(R);
  var o=baseOpts();o.plugins.tooltip.callbacks={label:function(x){return ' +'+nf(x.raw)+' abonnés'}};
  chart('c-ig',{type:'bar',data:{labels:ws.map(wlab),datasets:[{data:ws.map(function(w){return D.insta[w][2]}),backgroundColor:ws.map(function(w){return w>=R.a?'#111':'#C9BFAE'}),borderWidth:0,maxBarThickness:20}]},options:o});
  // formats
  var F=['Reel','Carrousel','Image'].map(function(t){var x=ps.filter(function(p){return p[3]===t});
    return {t:t,n:x.length,por:div(sum(x,function(p){return p[7]}),x.length),en:div(sum(x,function(p){return p[8]}),sum(x,function(p){return p[7]})),sv:div(sum(x,function(p){return p[10]}),x.length)}});
  var bestE=F.slice().sort(function(a,b){return b.en-a.en})[0];
  $('formats').innerHTML=F.map(function(f){return '<div class="fm"><p class="n">'+(f.t==='Reel'?'Reels':f.t==='Image'?'Images':'Carrousels')+(f===bestE&&f.n?'<span class="best">Le plus engageant</span>':'')+'</p>'+
    '<p class="row"><span>Publications</span><b>'+nf(f.n)+'</b></p><p class="row"><span>Comptes touchés en moyenne</span><b>'+(f.n?compact(f.por):'·')+'</b></p>'+
    '<p class="row"><span>Engagement</span><b>'+(f.n?pct(f.en):'·')+'</b></p><p class="row"><span>Enregistrements en moyenne</span><b>'+(f.n?nf(f.sv):'·')+'</b></p></div>'}).join('');
  var top=ps.slice().sort(function(a,b){return b[7]-a[7]}).slice(0,6), mx=top.length?top[0][7]:1;
  var h='<thead><tr><th>Publication</th><th>Format</th><th>Comptes touchés</th><th>Interactions</th><th>Engagement</th><th>Enregistrements</th></tr></thead><tbody>';
  if(!top.length)h+='<tr><td colspan="6" class="empty">Aucune publication sur cette sélection.</td></tr>';
  top.forEach(function(x){h+='<tr><td class="t">'+esc(x[11])+'<small>'+dfr(x[1],1)+(x[5]!==HORS?' · '+esc(x[5]):'')+'</small></td><td>'+x[3]+'</td><td><span class="minibar"><span style="width:'+(x[7]/mx*100)+'%"></span></span>'+nf(x[7])+'</td><td>'+nf(x[8])+'</td><td>'+pct(div(x[8],x[7]))+'</td><td>'+nf(x[10])+'</td></tr>'});
  $('t-posts').innerHTML=h+'</tbody>';
}

/* ---------- 04 lettre ---------- */
function nlF(a,b){return D.lettres.filter(function(l){return l[2]>=a&&l[2]<=b&&(S.exp==='all'||l[4]===S.exp)&&(S.art==='all'||l[5]===S.art)})}
function renderNL(R){
  var L=nlF(R.a,R.b), P=nlF(R.pa,R.pb), env={};L.forEach(function(l){env[l[0]]=1});
  var h='<thead><tr><th>Segment</th><th>Envois</th><th>Destinataires</th><th>Ouverture</th><th>Évolution</th><th>Clics</th><th>Désinscriptions</th><th>Demandes générées</th></tr></thead><tbody>';
  var nE=Object.keys(env).length;
  if(!nE)h+='<tr><td colspan="8" class="empty">Aucun envoi sur cette sélection.</td></tr>';
  else{
    SEGS.forEach(function(s){var x=L.filter(function(l){return l[3]===s}),y=P.filter(function(l){return l[3]===s});
      var n=sum(x,function(l){return l[7]}),o=sum(x,function(l){return l[8]}),c=sum(x,function(l){return l[9]}),u=sum(x,function(l){return l[10]}),d=sum(x,function(l){return l[11]});
      var op=div(sum(y,function(l){return l[8]}),sum(y,function(l){return l[7]}));
      h+='<tr class="'+(div(o,n)<D.objectifs.ouverture_gp*.9&&s==='Grand public'?'hl':'')+'"><td class="t">'+s+'<small>'+nf(div(n,x.length))+' destinataires par envoi</small></td><td>'+nf(x.length)+'</td><td>'+nf(n)+'</td><td>'+pct(div(o,n))+'</td><td>'+(dpt(div(o,n),op)||'·')+'</td><td>'+pct(div(c,n))+'</td><td>'+pct(div(u,n),2)+'</td><td>'+nf(d)+'</td></tr>'});
    var n=sum(L,function(l){return l[7]});
    h+='<tr class="tot"><td>Toutes les listes</td><td>'+nE+'</td><td>'+nf(n)+'</td><td>'+pct(div(sum(L,function(l){return l[8]}),n))+'</td><td></td><td>'+pct(div(sum(L,function(l){return l[9]}),n))+'</td><td>'+pct(div(sum(L,function(l){return l[10]}),n),2)+'</td><td>'+nf(sum(L,function(l){return l[11]}))+'</td></tr>';
  }
  $('t-nl').innerHTML=h+'</tbody>';
  var a=Math.min(R.a,NW-26), all=nlF(a,R.b), ids=[];all.forEach(function(l){if(ids.indexOf(l[0])<0)ids.push(l[0])});
  var col={'Collectionneurs':'#111111','Institutions':'#8C6D46','Presse':'#9A9890','Grand public':'#A33A2B'};
  var o=baseOpts(function(v){return nf(v*100,0)+' %'},true);o.plugins.tooltip.callbacks={label:function(x){return ' '+x.dataset.label+' : '+pct(x.raw)}};
  chart('c-nl',{type:'line',data:{labels:ids.map(function(id){var l=all.filter(function(x){return x[0]===id})[0];return dfr(l[1])}),
    datasets:SEGS.map(function(s){return {label:s,borderColor:col[s],backgroundColor:col[s],borderWidth:1.6,pointRadius:2,tension:.25,
      data:ids.map(function(id){var l=all.filter(function(x){return x[0]===id&&x[3]===s})[0];return l?div(l[8],l[7]):null})}})},options:o});
}

/* ---------- 05 site ---------- */
function webF(a,b){return D.site.filter(function(x){return x[0]>=a&&x[0]<=b&&(S.exp==='all'||x[2]===S.exp)&&(S.art==='all'||x[3]===S.art)})}
function renderWeb(R){
  var W=webF(R.a,R.b), P=webF(R.pa,R.pb);
  function k(A){return {v:sum(A,function(x){return x[4]}),p:sum(A,function(x){return x[5]}),c:sum(A,function(x){return x[6]}),vl:sum(A,function(x){return x[7]}),vc:sum(A,function(x){return x[8]})}}
  var c=k(W),p=k(P);
  var M=[[compact(c.v),'visiteurs du site · '+dl(c.v,p.v)],[compact(c.p),'pages vues · '+nf(div(c.p,c.v),1)+' par visite'],[nf(c.c),'clics « Demander le dossier » · '+dl(c.c,p.c)],
         [nf(c.vl),'visiteurs de la visite en ligne · '+dl(c.vl,p.vl)],[pct(div(c.vc,c.vl),0),'vont au bout de la visite en ligne']];
  $('web-k').innerHTML=M.map(function(m){return '<div class="mi"><p class="v">'+m[0]+'</p><p class="l">'+m[1]+'</p></div>'}).join('');
  var by={};W.forEach(function(x){var o=by[x[1]]=by[x[1]]||{v:0,c:0};o.v+=x[4];o.c+=x[6]});
  var ks=Object.keys(by).sort(function(a,b){return (a==='Autres pays')-(b==='Autres pays')||by[b].v-by[a].v}), mx=Math.max.apply(null,ks.map(function(x){return by[x].v}).concat([1]));
  $('pays').innerHTML=ks.length?ks.map(function(x){return '<div class="p"><span class="n">'+x+'</span><span class="m">'+compact(by[x].v)+'<small>'+pct(div(by[x].v,c.v),0)+' · '+nf(by[x].c)+' demandes</small></span><span class="bar"><span style="width:'+(by[x].v/mx*100)+'%"></span></span></div>'}).join(''):'<p class="empty">Aucune visite sur cette sélection.</p>';
  var ws=weeksFor(R), all=webF(ws[0],R.b);
  var o=baseOpts(function(v){return compact(v)},true);
  chart('c-web',{type:'bar',data:{labels:ws.map(wlab),datasets:[
    {label:'Visiteurs du site',data:ws.map(function(w){return sum(all,function(x){return x[0]===w?x[4]:0})}),backgroundColor:'#111',borderWidth:0,maxBarThickness:20},
    {label:'Visite en ligne',data:ws.map(function(w){return sum(all,function(x){return x[0]===w?x[7]:0})}),backgroundColor:'#C9BFAE',borderWidth:0,maxBarThickness:20}]},options:o});
}

/* ---------- 06 presse et foires ---------- */
function renderPresse(R){
  var A=D.presse.filter(function(x){return x[2]>=R.a&&x[2]<=R.b&&(S.exp==='all'||x[6]===S.exp)&&(S.art==='all'||x[7]===S.art)});
  var P=D.presse.filter(function(x){return x[2]>=R.pa&&x[2]<=R.pb&&(S.exp==='all'||x[6]===S.exp)&&(S.art==='all'||x[7]===S.art)});
  var fo=D.foires.filter(function(f){return f.sem>=R.a&&f.sem<=R.b&&(S.exp==='all'||S.exp===HORS)&&(S.art==='all'||f.artistes.indexOf(S.art)>=0)});
  var intl=A.filter(function(x){return x[4]!=='Côte d’Ivoire'&&x[4]!=='Sénégal'}).length;
  var M=[[nf(A.length),'retombées presse · '+dl(A.length,P.length)],[compact(sum(A,function(x){return x[8]})),'audience cumulée'],[nf(sum(A,function(x){return x[9]})),'demandes de dossier générées'],
         [nf(intl),'dans la presse hors Côte d’Ivoire et Sénégal'],[nf(sum(fo,function(f){return f.contacts})),'contacts pris en foire']];
  $('pr-k').innerHTML=M.map(function(m){return '<div class="mi"><p class="v">'+m[0]+'</p><p class="l">'+m[1]+'</p></div>'}).join('');
  var top=A.slice().sort(function(a,b){return b[1]<a[1]?-1:1}).slice(0,8);
  var h='<thead><tr><th>Retombée</th><th>Type</th><th>Audience</th><th>Demandes</th></tr></thead><tbody>';
  if(!top.length)h+='<tr><td colspan="4" class="empty">Aucune retombée sur cette sélection.</td></tr>';
  top.forEach(function(x){h+='<tr><td class="t">'+x[3]+'<small>'+dfr(x[1],1)+' · '+(x[6]!==HORS?'« '+esc(x[6])+' »':esc(x[7]))+'</small></td><td>'+x[5]+'</td><td>'+compact(x[8])+'</td><td>'+nf(x[9])+'</td></tr>'});
  if(A.length>8)h+='<tr class="dim"><td colspan="4">et '+(A.length-8)+' autres retombées sur la période</td></tr>';
  $('t-presse').innerHTML=h+'</tbody>';
  var all=D.foires.filter(function(f){return (S.exp==='all'||S.exp===HORS)&&(S.art==='all'||f.artistes.indexOf(S.art)>=0)}).slice().reverse();
  var g='<thead><tr><th>Foire</th><th>Visiteurs du stand</th><th>Contacts</th><th>Relancés</th><th>Dossiers envoyés</th><th>Rendez-vous</th><th>Ventes</th><th>Montant</th><th>Contact → vente</th></tr></thead><tbody>';
  if(!all.length)g+='<tr><td colspan="9" class="empty">Aucune foire sur cette sélection.</td></tr>';
  all.forEach(function(f){var x=agg(D.fun.filter(function(r){return r[1]==='Foires'&&r[0]===f.sem&&(S.art==='all'||r[3]===S.art)}));
    var inP=f.sem>=R.a&&f.sem<=R.b;
    g+='<tr class="'+(inP?'hl':'')+'"><td class="t">'+f.nom+'<small>'+dfr(f.date,1)+(inP?' · sur la période':'')+'</small></td><td>'+nf(f.visiteurs)+'</td><td>'+nf(f.contacts)+'</td><td>'+nf(f.relances)+' <span class="mute">('+pct(div(f.relances,f.contacts),0)+')</span></td><td>'+nf(x.d)+'</td><td>'+nf(x.r)+'</td><td>'+nf(x.s)+'</td><td>'+eur(x.ca)+'</td><td>'+pct(div(x.s,f.contacts),1)+'</td></tr>'});
  $('t-foires').innerHTML=g+'</tbody>';
}

/* ---------- 07 par exposition ---------- */
function expoStats(e,first){
  var a=D.semaines.findIndex(function(s){return s>=e.debut})-1; if(a<0)a=0; if(D.semaines[a+1]===e.debut)a=a+1;
  var b=D.semaines.length-1; for(var i=0;i<D.semaines.length;i++){if(D.semaines[i]>e.fin){b=i-1;break}}
  if(first)b=Math.min(b,a+first-1);
  var f=agg(D.fun.filter(function(r){return r[2]===e.titre&&r[0]>=a&&r[0]<=b&&(S.can==='all'||r[1]===S.can)&&(S.art==='all'||r[3]===S.art)}));
  var po=D.posts.filter(function(x){return x[5]===e.titre&&x[2]>=a&&x[2]<=b});
  var pr=D.presse.filter(function(x){return x[6]===e.titre&&x[2]>=a&&x[2]<=b});
  return {a:a,b:b,n:Math.max(b-a+1,1),f:f,po:po.length,pr:pr.length,eng:div(sum(po,function(x){return x[8]}),sum(po,function(x){return x[7]}))};
}
function renderExpos(){
  var now=D.expos.filter(function(e){return e.en_cours})[0];
  var past=D.expos.filter(function(e){return !e.en_cours&&e.debut>='2024-11-01'});
  if(now){
    var s=expoStats(now,2), comp=past.map(function(e){return expoStats(e,2)});
    var avg=function(f){return div(sum(comp,f),comp.length)};
    var aD=avg(function(x){return x.f.d}), aT=avg(function(x){return x.f.t}), aR=avg(function(x){return x.f.r});
    $('expo-now').innerHTML='<div><p class="big">'+nf(s.f.d)+'</p></div><div><p class="t">« '+esc(now.titre)+' »<span class="pill">En cours</span></p><p class="s">'+esc(now.sous)+' · '+now.lieu+' · depuis le '+dfr(now.debut)+', jusqu’au '+dfr(now.fin,1)+
      '<br>demandes de dossier sur les deux premières semaines, contre <b>'+nf(aD,0)+'</b> en moyenne pour les '+past.length+' expositions précédentes au même stade ('+dl(s.f.d,aD)+'). '+
      compact(s.f.t)+' personnes touchées ('+dl(s.f.t,aT)+'), '+nf(s.f.r)+' rendez-vous ('+dl(s.f.r,aR)+'), '+nf(s.pr)+' retombées presse.</p></div>';
  }
  var L=D.expos.filter(function(e){return e.debut>='2024-11-01'||e.fin>='2024-11-15'}).map(function(e){return {e:e,s:expoStats(e)}}).sort(function(a,b){return b.e.debut<a.e.debut?-1:1});
  var mx=Math.max.apply(null,L.map(function(x){return x.s.f.d/x.s.n}).concat([.1]));
  var h='<thead><tr><th>Exposition</th><th>Semaines</th><th>Touchées</th><th>Demandes</th><th>Demandes / sem.</th><th>Rendez-vous</th><th>Ventes</th><th>Montant</th><th>Publications</th><th>Presse</th></tr></thead><tbody>';
  L.forEach(function(x){var e=x.e,s=x.s,dw=s.f.d/s.n;
    h+='<tr class="'+(e.en_cours?'hl':'')+(S.exp!=='all'&&S.exp!==e.titre?' dim':'')+'"><td class="t">'+esc(e.titre)+(e.en_cours?'<span class="pill">En cours</span>':'')+'<small>'+esc(e.sous)+' · '+e.lieu+' · '+dfr(e.debut,1)+' au '+dfr(e.fin,1)+'</small></td><td>'+s.n+'</td><td>'+compact(s.f.t)+'</td><td>'+nf(s.f.d)+'</td><td><span class="minibar"><span style="width:'+(dw/mx*100)+'%"></span></span>'+nf(dw,1)+'</td><td>'+nf(s.f.r)+'</td><td>'+nf(s.f.s)+'</td><td>'+eur(s.f.ca)+'</td><td>'+s.po+'</td><td>'+s.pr+'</td></tr>'});
  $('t-expos').innerHTML=h+'</tbody>';
}

function bind(){
  var ex=$('f-exp');
  D.expos.slice().sort(function(a,b){return b.debut<a.debut?-1:1}).forEach(function(e){var o=document.createElement('option');o.value=e.titre;o.textContent=e.titre+(e.en_cours?' (en cours)':'');ex.appendChild(o)});
  var o=document.createElement('option');o.value=HORS;o.textContent='Hors exposition, foires comprises';ex.appendChild(o);
  var arts={};D.fun.forEach(function(r){arts[r[3]]=1});
  Object.keys(arts).sort(function(a,b){return a.localeCompare(b,'fr')}).forEach(function(a){var o=document.createElement('option');o.value=o.textContent=a;$('f-art').appendChild(o)});
  $('f-per').onchange=function(){S.per=this.value;render()};
  $('f-can').onchange=function(){S.can=this.value;render()};
  $('f-exp').onchange=function(){S.exp=this.value;render()};
  $('f-art').onchange=function(){S.art=this.value;render()};
  $('raz').onclick=function(){S={per:'12',can:'all',exp:'all',art:'all'};$('f-per').value='12';$('f-can').value='all';$('f-exp').value='all';$('f-art').value='all';render()};
  $('arrete').textContent=D.arrete;
}
Chart.defaults.font.family='Inter';
fetch('data/donnees.json?v=20261117d').then(function(r){return r.json()}).then(function(j){D=j;NW=D.semaines.length;bind();render()})
 .catch(function(e){$('phrase').textContent='Les données n’ont pas pu être chargées. Recharger la page.';console.error(e)});
})();
