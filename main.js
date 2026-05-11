const state = {
  user: {
    firstName: 'Adib', lastName: 'El Modafar', phone: '+212 6 12 34 56 78',
    email: 'adib.elmodafar@gmail.com', address: '45 Rue Zerktouni, Maarif, Casablanca',
    memberSince: '2024-09-15', cardNumber: 'FR-2024-9988-4421',
    ltv: 150, cagnotte: 125.50, totalVisits: 47, avgBasket: 89.20,
    hasPin: false, favStore: 'Franprix Casa Maarif',
    lastVisit: '2026-05-10', pointsThisMonth: 34
  },
  receipts: [
    { store:'Franprix Casa Maarif', date:'10 Mai 2026', time:'18:42', amount:245, cb:2.45, items:12 },
    { store:'Franprix Ain Diab', date:'07 Mai 2026', time:'14:15', amount:178, cb:1.78, items:8 },
    { store:'Franprix Casa Maarif', date:'03 Mai 2026', time:'11:30', amount:92, cb:0.92, items:5 },
    { store:'Franprix Rabat Agdal', date:'28 Avr 2026', time:'16:20', amount:312, cb:9.36, items:18 },
    { store:'Franprix Casa Maarif', date:'22 Avr 2026', time:'19:05', amount:156, cb:1.56, items:9 }
  ],
  tiers: {
    silver:{ min:0, next:500, label:'Silver', cls:'tier-silver', cb:1, pill:'pill-silver' },
    gold:{ min:500, next:1500, label:'Gold', cls:'tier-gold', cb:3, pill:'pill-gold' },
    titanium:{ min:1500, next:Infinity, label:'Titanium', cls:'tier-titanium', cb:5, pill:'pill-titanium' }
  }
};

function getTier(ltv){ return ltv>=1500?state.tiers.titanium:ltv>=500?state.tiers.gold:state.tiers.silver; }

function init(){
  bindAuth(); bindNav(); bindAdmin();
  renderHome(); renderWallet(); renderPromos(); renderReceipts(); renderProfile(); renderFeedback();
  updateTier();
  const h=new Date().getHours();
  const g=h<12?'Bonjour':h<18?'Bon apres-midi':'Bonsoir';
  const el=document.getElementById('smart-greeting');
  if(el) el.textContent=g+', '+state.user.firstName+'.';
  document.getElementById('header-name').textContent=state.user.firstName;
  document.getElementById('avatar-letter').textContent=state.user.firstName[0];
  gsap.from('.logo-main',{opacity:0,y:-8,duration:0.8,ease:'power2.out'});
}

function bindAuth(){
  document.getElementById('btn-goto-login')?.addEventListener('click',()=>switchGlobal('global-auth'));
  const ph=document.getElementById('auth-step-phone');
  const otp=document.getElementById('auth-step-otp');
  const reg=document.getElementById('auth-step-register');
  ph?.addEventListener('submit',e=>{e.preventDefault();document.getElementById('display-phone').textContent=document.getElementById('auth-phone-input').value;transStep(ph,otp);});
  otp?.addEventListener('submit',e=>{e.preventDefault();transStep(otp,reg);});
  reg?.addEventListener('submit',e=>{e.preventDefault();switchGlobal('global-app');});
  document.getElementById('btn-back-phone')?.addEventListener('click',()=>transStep(otp,ph));
  document.getElementById('btn-logout-sidebar')?.addEventListener('click',()=>{switchGlobal('global-landing');document.querySelectorAll('.auth-step').forEach(s=>s.style.display='none');ph.style.display='block';ph.classList.add('active');});
  document.querySelectorAll('.otp-digit').forEach((d,i,all)=>{d.addEventListener('input',function(){if(this.value.length===1&&i<all.length-1)all[i+1].focus();});d.addEventListener('keydown',function(e){if(e.key==='Backspace'&&!this.value&&i>0)all[i-1].focus();});});
}

function bindNav(){
  const navs=document.querySelectorAll('.nav-item,.m-nav-item');
  const views=document.querySelectorAll('.view-content');
  const titles={'view-home':'Tableau de bord','view-wallet':'Ma Carte','view-promos':'Boosters & Offres','view-receipts':'Mes Tickets','view-profile':'Mon Profil','view-feedback':'Support & Reclamations'};
  navs.forEach(n=>n.addEventListener('click',e=>{
    e.preventDefault(); const t=n.dataset.target; if(!t)return;
    navs.forEach(x=>x.classList.remove('active'));
    document.querySelectorAll('[data-target="'+t+'"]').forEach(x=>x.classList.add('active'));
    views.forEach(v=>v.classList.remove('active'));
    const tv=document.getElementById(t); if(tv){tv.classList.add('active');gsap.fromTo('#'+t+' .bento-card,#'+t+' .stat-card,#'+t+' .ticket-item',{opacity:0,y:12},{opacity:1,y:0,stagger:0.06,duration:0.35,ease:'power2.out'});}
    const ti=document.getElementById('current-title'); if(ti)ti.textContent=titles[t]||'';
  }));
}

function bindAdmin(){
  document.getElementById('dev-toggle')?.addEventListener('click',()=>{const c=document.getElementById('demo-controls');c.style.display=c.style.display==='none'?'block':'none';});
  const btns=document.querySelectorAll('#demo-controls button');
  btns.forEach(b=>b.addEventListener('click',()=>{btns.forEach(x=>x.classList.remove('active'));b.classList.add('active');state.user.ltv=parseInt(b.dataset.ltv);updateTier();renderHome();renderWallet();renderPromos();}));
}

function transStep(from,to){from.classList.remove('active');setTimeout(()=>{from.style.display='none';to.style.display='block';setTimeout(()=>to.classList.add('active'),50);},250);}
function switchGlobal(id){document.querySelectorAll('.global-view').forEach(v=>v.classList.remove('active'));document.getElementById(id)?.classList.add('active');window.scrollTo(0,0);}

function updateTier(){
  const t=getTier(state.user.ltv);
  document.querySelectorAll('.wallet-card').forEach(c=>{c.classList.remove('tier-silver','tier-gold','tier-titanium');c.classList.add(t.cls);});
  document.querySelectorAll('.booster-item').forEach(item=>{
    const req=item.dataset.tier;const tiers=['silver','gold','titanium'];
    const ui=tiers.indexOf(t.label.toLowerCase()),ri=tiers.indexOf(req);
    const btn=item.querySelector('.btn-act-booster');
    if(ri>ui){item.classList.add('locked');if(btn){btn.textContent='Niveau '+req.toUpperCase()+' requis';btn.disabled=true;}}
    else{item.classList.remove('locked');if(btn&&btn.textContent.includes('requis')){btn.textContent='Activer';btn.disabled=false;}}
  });
}

function renderHome(){
  const u=state.user, t=getTier(u.ltv), diff=t.next===Infinity?0:t.next-u.ltv;
  const pct=t.next===Infinity?100:Math.min(100,(u.ltv/t.next)*100);
  const nextTier=t.next===500?'Gold':t.next===1500?'Titanium':'Max';
  document.getElementById('view-home').innerHTML=`
  <div class="bento-grid">
    <div class="span-7" style="display:flex;flex-direction:column;gap:20px">
      <div class="wallet-card-wrapper"><div class="wallet-card ${t.cls}" id="wallet-card-home">
        <div class="card-top"><div class="card-brand">franprix<span>.</span></div><div class="card-logos"><span style="font-weight:900;font-size:13px;letter-spacing:-0.5px">chari</span><span class="logo-v">VISA</span></div></div>
        <div class="card-amount">${u.cagnotte.toFixed(2).replace('.',',')} MAD</div>
        <div class="card-footer"><div class="barcode-box"><svg id="barcode-home"></svg></div><div style="text-align:right"><div class="text-xs muted">MEMBRE</div><div style="font-weight:900;font-size:16px;text-transform:uppercase">${t.label}</div></div></div>
      </div></div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">
        <div class="stat-card"><div class="stat-label">Cagnotte</div><div class="stat-value text-orange">${u.cagnotte.toFixed(0)}<span class="text-sm"> MAD</span></div><div class="stat-change up">+${u.pointsThisMonth} ce mois</div></div>
        <div class="stat-card"><div class="stat-label">Visites</div><div class="stat-value">${u.totalVisits}</div><div class="stat-change up">Fidele depuis 2024</div></div>
        <div class="stat-card"><div class="stat-label">Panier moyen</div><div class="stat-value">${u.avgBasket.toFixed(0)}<span class="text-sm"> MAD</span></div><div class="stat-change up">+12% vs mois dernier</div></div>
      </div>
    </div>
    <div class="span-5 bento-card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div><h3 style="font-size:18px">Progression ${nextTier}</h3><p class="muted text-sm" style="margin-top:4px">${t.next===Infinity?'Vous etes au niveau maximum !':'Encore <strong class="text-orange">'+diff+' MAD</strong> pour '+t.cb+'% → '+nextTier}</p></div>
        <div class="icon-box" style="background:var(--p-orange-soft);color:var(--p-orange)">★</div>
      </div>
      <div class="progress-track"><div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div></div>
      <div class="tier-ladder">
        <div class="tier-step ${u.ltv>=0?'reached':''} ${t.label==='Silver'?'current':''}"><div class="tier-icon">🥈</div><div class="tier-name">Silver</div><div class="tier-cb">1% cashback</div></div>
        <div class="tier-step ${u.ltv>=500?'reached':''} ${t.label==='Gold'?'current':''} ${u.ltv<500?'locked':''}"><div class="tier-icon">🥇</div><div class="tier-name">Gold</div><div class="tier-cb">3% cashback</div></div>
        <div class="tier-step ${u.ltv>=1500?'reached':''} ${t.label==='Titanium'?'current':''} ${u.ltv<1500?'locked':''}"><div class="tier-icon">💎</div><div class="tier-name">Titanium</div><div class="tier-cb">5% cashback</div></div>
      </div>
      <div style="margin-top:24px;padding-top:20px;border-top:1px solid var(--border)">
        <div class="text-sm" style="font-weight:600">Dernier achat — ${state.receipts[0].store}</div>
        <div style="display:flex;justify-content:space-between;margin-top:8px"><span class="muted text-sm">${state.receipts[0].date}</span><span class="text-green" style="font-weight:800">+${state.receipts[0].cb.toFixed(2)} MAD</span></div>
      </div>
    </div>
    <div class="span-8 bento-card">
      <h3 style="margin-bottom:20px">Missions en cours</h3>
      <div style="display:flex;flex-direction:column;gap:10px">
        <div class="action-item"><div class="icon-box">🥛</div><div style="flex:1"><h4 style="font-size:15px">Le defi laitier</h4><p class="muted text-sm">Achetez 3 packs de lait Centrale — 10 MAD offerts</p></div><div class="status-pill pill-green">2/3</div></div>
        <div class="action-item"><div class="icon-box">🥗</div><div style="flex:1"><h4 style="font-size:15px">Fraicheur locale</h4><p class="muted text-sm">50 MAD de fruits & legumes = 5 MAD cashback</p></div><button class="btn btn-outline btn-sm">Activer</button></div>
        <div class="action-item"><div class="icon-box">☕</div><div style="flex:1"><h4 style="font-size:15px">Pause cafe</h4><p class="muted text-sm">5 cafes achetes = le 6eme offert</p></div><div class="status-pill pill-orange">4/5</div></div>
      </div>
    </div>
    <div class="span-4 bento-card" style="background:var(--p-accent);color:white">
      <h3 style="color:var(--p-yellow);margin-bottom:8px">Catalogue</h3>
      <p style="font-size:13px;opacity:0.7;margin-bottom:20px">150 promos cette semaine dans votre magasin.</p>
      <button class="btn btn-orange" style="width:100%">Consulter</button>
      <div style="margin-top:20px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.1)">
        <div class="text-sm" style="opacity:0.6">Magasin favori</div>
        <div style="font-weight:700;margin-top:4px">${u.favStore}</div>
      </div>
    </div>
  </div>`;
  try{JsBarcode('#barcode-home',u.cardNumber.slice(-8),{format:'CODE128',lineColor:'#111',width:1.5,height:36,displayValue:false,background:'transparent'});}catch(e){}
}

function renderWallet(){
  const u=state.user, t=getTier(u.ltv);
  document.getElementById('view-wallet').innerHTML=`
  <div class="bento-grid">
    <div class="span-12 bento-card" style="display:flex;flex-direction:column;align-items:center;text-align:center;padding:48px 28px">
      <div class="wallet-card-wrapper" style="width:100%;max-width:480px"><div class="wallet-card ${t.cls}" style="height:280px">
        <div class="card-top"><div class="card-brand" style="font-size:24px">franprix<span>.</span></div><div class="card-logos"><span class="logo-v" style="font-size:28px">VISA</span></div></div>
        <div class="card-amount" style="font-size:52px">${u.cagnotte.toFixed(2).replace('.',',')} MAD</div>
        <div class="card-footer"><div class="barcode-box" style="padding:10px 20px"><svg id="barcode-full"></svg></div><div class="status-pill ${t.pill}" style="font-size:14px;padding:8px 16px">${t.label}</div></div>
      </div></div>
      <div style="margin-top:8px;font-size:13px;color:var(--text-muted);font-weight:500">N° ${u.cardNumber}</div>
      <div style="margin-top:32px;display:flex;gap:12px;flex-wrap:wrap;justify-content:center">
        <button id="btn-pin-action" class="btn btn-black">${u.hasPin?'Modifier mon PIN':'Creer mon PIN'}</button>
        <button class="btn btn-outline">Historique complet</button>
        <button class="btn btn-outline">Ajouter au Wallet</button>
      </div>
    </div>
  </div>`;
  try{JsBarcode('#barcode-full',u.cardNumber.slice(-8),{format:'CODE128',lineColor:'#111',width:2,height:50,displayValue:false,background:'transparent'});}catch(e){}
  document.getElementById('btn-pin-action')?.addEventListener('click',()=>{state.user.hasPin=!state.user.hasPin;renderWallet();});
}

function renderPromos(){
  const boosters=[
    {icon:'☕',name:'Pause Cafe',desc:'10% rembourses sur capsules cafe',tier:'silver'},
    {icon:'🥐',name:'Petit Dej Express',desc:'Cafe + Croissant pur beurre a prix reduit',tier:'silver'},
    {icon:'🍫',name:'Gourmandise Gold',desc:'Points x2 sur le rayon chocolaterie',tier:'gold'},
    {icon:'🧀',name:'Fromagerie x2',desc:'Cashback double sur fromages locaux',tier:'gold'},
    {icon:'🥩',name:'Boucherie Premium',desc:'Cashback x3 sur viandes nobles',tier:'titanium'},
    {icon:'🍷',name:'Cave VIP',desc:'Acces aux offres vins & spiritueux premium',tier:'titanium'}
  ];
  document.getElementById('view-promos').innerHTML=`
  <div class="bento-grid"><div class="span-12">
    <h2 style="margin-bottom:20px">Boosters de Fidelite</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px">
      ${boosters.map(b=>`<div class="bento-card booster-item" data-tier="${b.tier}">
        <div class="icon-box" style="margin-bottom:12px">${b.icon}</div>
        <h4 style="font-size:15px">${b.name}</h4>
        <p class="muted text-sm" style="margin-top:6px">${b.desc}</p>
        <div class="booster-tier-badge btb-${b.tier}" style="margin-top:8px">${b.tier}</div>
        <button class="btn btn-orange btn-act-booster" style="width:100%;margin-top:16px">Activer</button>
      </div>`).join('')}
    </div>
  </div></div>`;
  document.querySelectorAll('.btn-act-booster').forEach(b=>b.addEventListener('click',function(){if(this.disabled)return;this.textContent='Active ✓';this.classList.remove('btn-orange');this.classList.add('btn-black');this.disabled=true;gsap.from(this,{scale:0.9,duration:0.3,ease:'back.out(2)'});}));
  updateTier();
}

function renderReceipts(){
  document.getElementById('view-receipts').innerHTML=`
  <div class="bento-grid"><div class="span-12 bento-card">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
      <h2>Historique d'achats</h2>
      <span class="status-pill pill-blue">${state.receipts.length} tickets</span>
    </div>
    <div style="display:flex;flex-direction:column;gap:10px">
      ${state.receipts.map((r,i)=>`<div class="ticket-item">
        <div class="ticket-icon ${['ti-green','ti-blue','ti-orange'][i%3]}">🧾</div>
        <div style="flex:1"><h4 style="font-size:15px">${r.store}</h4><p class="muted text-sm">${r.date} - ${r.time} · ${r.items} articles</p></div>
        <div style="text-align:right"><div style="font-weight:800">${r.amount.toFixed(2)} MAD</div><div class="text-sm text-green" style="font-weight:700">+${r.cb.toFixed(2)} MAD</div></div>
      </div>`).join('')}
    </div>
    <div style="margin-top:24px;padding-top:20px;border-top:1px solid var(--border);display:flex;justify-content:space-between">
      <div><span class="muted text-sm">Total depense</span><div style="font-weight:900;font-size:20px">${state.receipts.reduce((a,r)=>a+r.amount,0).toFixed(2)} MAD</div></div>
      <div style="text-align:right"><span class="muted text-sm">Total cashback</span><div style="font-weight:900;font-size:20px;color:var(--green)">${state.receipts.reduce((a,r)=>a+r.cb,0).toFixed(2)} MAD</div></div>
    </div>
  </div></div>`;
}

function renderProfile(){
  const u=state.user, t=getTier(u.ltv);
  const since=new Date(u.memberSince);
  const months=Math.floor((Date.now()-since)/(1000*60*60*24*30));
  document.getElementById('view-profile').innerHTML=`
  <div class="bento-grid">
    <div class="span-5 bento-card" style="text-align:center;padding:40px 28px">
      <div class="avatar" style="width:80px;height:80px;font-size:32px;margin:0 auto 16px">${u.firstName[0]}${u.lastName[0]}</div>
      <h2 style="font-size:22px">${u.firstName} ${u.lastName}</h2>
      <div class="status-pill ${t.pill}" style="margin-top:12px">${t.label} · ${t.cb}% cashback</div>
      <div class="muted text-sm" style="margin-top:12px">Membre depuis ${months} mois</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:24px">
        <div class="stat-card"><div class="stat-label">Cagnotte</div><div class="stat-value text-orange" style="font-size:22px">${u.cagnotte.toFixed(0)}</div></div>
        <div class="stat-card"><div class="stat-label">Visites</div><div class="stat-value" style="font-size:22px">${u.totalVisits}</div></div>
      </div>
    </div>
    <div class="span-7 bento-card">
      <h3 style="margin-bottom:20px">Informations personnelles</h3>
      <div class="profile-row"><span class="pr-label">Prenom</span><span class="pr-value">${u.firstName}</span></div>
      <div class="profile-row"><span class="pr-label">Nom</span><span class="pr-value">${u.lastName}</span></div>
      <div class="profile-row"><span class="pr-label">Telephone</span><span class="pr-value">${u.phone}</span></div>
      <div class="profile-row"><span class="pr-label">Email</span><span class="pr-value">${u.email}</span></div>
      <div class="profile-row"><span class="pr-label">Adresse</span><span class="pr-value">${u.address}</span></div>
      <div class="profile-row"><span class="pr-label">N° de carte</span><span class="pr-value" style="font-family:monospace">${u.cardNumber}</span></div>
      <div class="profile-row"><span class="pr-label">Magasin favori</span><span class="pr-value">${u.favStore}</span></div>
      <div class="profile-row"><span class="pr-label">Derniere visite</span><span class="pr-value">${u.lastVisit}</span></div>
      <div class="profile-row"><span class="pr-label">Panier moyen</span><span class="pr-value">${u.avgBasket.toFixed(2)} MAD</span></div>
      <button class="btn btn-outline" style="margin-top:20px">Modifier mes informations</button>
    </div>
  </div>`;
}

function renderFeedback(){
  document.getElementById('view-feedback').innerHTML=`
  <div class="bento-grid">
    <div class="span-8 bento-card">
      <h3 style="margin-bottom:4px">Votre avis compte</h3>
      <p class="muted text-sm" style="margin-bottom:28px">Partagez votre experience ou signalez un probleme.</p>
      <form id="feedback-form">
        <div class="fb-type-toggle" style="margin-bottom:24px">
          <div class="fb-type-btn active" data-type="avis">💬 Avis</div>
          <div class="fb-type-btn" data-type="reclamation">⚠️ Reclamation</div>
        </div>
        <div style="margin-bottom:20px"><label class="text-sm" style="font-weight:700;display:block;margin-bottom:10px">Note globale</label>
          <div style="display:flex;gap:6px">${[1,2,3,4,5].map(v=>'<span class="fb-star" data-val="'+v+'">★</span>').join('')}</div>
        </div>
        <textarea class="auth-input" style="height:120px;resize:none;margin-bottom:20px" placeholder="Decrivez votre experience..." required></textarea>
        <button type="submit" class="btn btn-orange" style="width:100%">Envoyer</button>
      </form>
    </div>
    <div class="span-4 bento-card" style="background:rgba(0,0,0,0.02)">
      <h4 style="margin-bottom:4px">Besoin d'aide ?</h4>
      <p class="muted text-sm" style="margin-bottom:24px">Service client 7j/7</p>
      <div style="display:flex;flex-direction:column;gap:12px">
        <div class="action-item" style="padding:14px"><div class="icon-box" style="width:36px;height:36px;font-size:16px">📞</div><div><div style="font-weight:700;font-size:13px">Telephone</div><div class="muted text-xs">+212 5 22 XX XX XX</div></div></div>
        <div class="action-item" style="padding:14px"><div class="icon-box" style="width:36px;height:36px;font-size:16px">💬</div><div><div style="font-weight:700;font-size:13px">WhatsApp</div><div class="muted text-xs">Reponse en -2h</div></div></div>
        <div class="action-item" style="padding:14px"><div class="icon-box" style="width:36px;height:36px;font-size:16px">📧</div><div><div style="font-weight:700;font-size:13px">Email</div><div class="muted text-xs">support@franprix.ma</div></div></div>
      </div>
    </div>
  </div>`;
  document.querySelectorAll('.fb-type-btn').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.fb-type-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');}));
  const stars=document.querySelectorAll('.fb-star');
  stars.forEach(s=>{
    s.addEventListener('mouseover',()=>{const v=+s.dataset.val;stars.forEach(x=>+x.dataset.val<=v?x.classList.add('hovered'):x.classList.remove('hovered'));});
    s.addEventListener('mouseout',()=>stars.forEach(x=>x.classList.remove('hovered')));
    s.addEventListener('click',()=>{const v=+s.dataset.val;stars.forEach(x=>+x.dataset.val<=v?x.classList.add('active'):x.classList.remove('active'));});
  });
  document.getElementById('feedback-form')?.addEventListener('submit',e=>{e.preventDefault();alert('Merci pour votre retour !');e.target.reset();stars.forEach(s=>s.classList.remove('active'));});
}

init();
