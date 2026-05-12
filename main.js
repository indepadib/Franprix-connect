import { gsap } from 'gsap';
import JsBarcode from 'jsbarcode';

const TICKETS = [
  { store:'Franprix Maarif', date:'10 Mai 2026', time:'18:42', items:[['Lait Centrale 1L x2','15,00'],['Yaourt Danone x4','28,00'],['Pain de mie','8,50'],['Coca-Cola 1.5L','10,50'],['Fromage Kiri x8','22,00'],['Huile Lesieur 1L','35,00'],['Biscuits LU','14,50'],['Cafe Nescafe','38,00'],['Dentifrice','18,00'],['Savon Dove','19,00'],['Sac caisse','1,00'],['Remise fidélité','-4,50']], total:'245,00', cashback:'2,45', caissier:'N°12 - Fatima' },
  { store:'Franprix Ain Diab', date:'7 Mai 2026', time:'14:15', items:[['Eau Sidi Ali 1.5L x6','24,00'],['Chips Lay\'s 150g','12,90'],['Chocolat Milka','19,50'],['Jus Rani 1L x2','25,00'],['Café Don Nespresso x10','42,00'],['Serviettes','22,00'],['Gâteau','14,90'],['Pâtes Barilla','17,70']], total:'178,00', cashback:'1,78', caissier:'N°3 - Karim' },
  { store:'Franprix Maarif', date:'3 Mai 2026', time:'11:30', items:[['Beurre Président','24,00'],['Oeufs x12','28,50'],['Lait Centrale 1L','7,50'],['Farine 1kg','14,00'],['Sucre 1kg','12,00'],['Remise fidélité','-4,00']], total:'92,00', cashback:'0,92', caissier:'N°7 - Yasmine' },
  { store:'Monoprix Beverly Walks', date:'28 Avr 2026', time:'16:20', items:[['Viande hachée 500g','65,00'],['Poulet entier 1.2kg','58,00'],['Légumes frais','34,00'],['Fromage râpé','22,50'],['Pâtes x3','27,00'],['Sauce tomate x2','18,00'],['Vin de cuisine','28,00'],['Épices','15,50'],['Papier toilette x6','32,00'],['Lessive Ariel','48,00'],['Eau x6 pack','19,00'],['Dessert','21,00'],['Serviettes','17,00'],['Sac','4,00'],['Remise fidélité','-16,00']], total:'312,00', cashback:'3,12', caissier:'N°1 - Mohammed' },
  { store:'Franprix Maarif', date:'22 Avr 2026', time:'19:05', items:[['Shampoing Pantene','34,00'],['Gel douche','22,00'],['Dentifrice Colgate x2','28,00'],['Déodorant Rexona','32,00'],['Crème hydratante','48,00'],['Cotons-tiges','8,50'],['Rasoirs','16,00'],['Sac','1,00'],['Remise fidélité','-33,50']], total:'156,00', cashback:'1,56', caissier:'N°9 - Sara' }
];

const state = {
  user: { firstName:'Adib', lastName:'El Modafar', phone:'+212 6 12 34 56 78', email:'adib.elmodafar@gmail.com', address:'45 Rue Zerktouni, Maarif, Casablanca', memberSince:'15 Sept 2024', cardNumber:'FR-2024-9988-4421', ltv:150, cagnotte:125.50, totalVisits:47, avgBasket:89.20, favStore:'Franprix Maarif', lastVisit:'10 Mai 2026', hasPin:false },
  tiers: {
    silver:   { min:0,    next:500,      label:'Silver',   class:'tier-silver',   cb:1 },
    gold:     { min:500,  next:1500,     label:'Gold',     class:'tier-gold',     cb:3 },
    titanium: { min:1500, next:Infinity, label:'Titanium', class:'tier-titanium', cb:5 }
  },
  pinBuffer: []
};

let els = {};

// API LAYER
const API = {
  async call(action, data = {}) {
    showLoader();
    try {
      const response = await fetch('/.netlify/functions/d365-proxy', {
        method: 'POST',
        body: JSON.stringify({ action, data })
      });
      if (!response.ok) throw new Error("Fonction non déployée");
      const res = await response.json();
      if (res.error) throw new Error(res.error);
      return res;
    } catch (e) {
      // Fallback démo
      return new Promise(resolve => setTimeout(() => resolve({ demo: true }), 500));
    } finally {
      hideLoader();
    }
  },
  async getProfile(phone) { return this.call('getProfile', { phone }); },
  async updateProfile(id, body) { return this.call('updateProfile', { id, body }); },
  async generatePass(userData) {
    showLoader();
    try {
      const response = await fetch('/.netlify/functions/apple-wallet', {
        method: 'POST',
        body: JSON.stringify({ userData })
      });
      if (!response.ok) throw new Error("Pass not ready");
      return await response.json();
    } catch (e) {
      return new Promise(resolve => setTimeout(() => resolve({ message: "Pass démo généré !" }), 1200));
    } finally {
      hideLoader();
    }
  }
};

// UI HELPERS
function showLoader() { const l = document.getElementById('global-loader'); if(l) l.style.display = 'flex'; }
function hideLoader() { const l = document.getElementById('global-loader'); if(l) l.style.display = 'none'; }
function showToast(msg, type = 'success') {
  const container = document.getElementById('toast-container');
  if(!container) return;
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${type === 'success' ? '✓' : '✕'}</span> ${msg}`;
  container.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 400); }, 3000);
}

function init() {
  els = {
    navItems:          document.querySelectorAll('.nav-item, .m-nav-item'),
    viewContents:      document.querySelectorAll('.view-content'),
    currentTitle:      document.getElementById('current-title'),
    btnGotoLogin:      document.getElementById('btn-goto-login'),
    authPhone:         document.getElementById('auth-step-phone'),
    authOtp:           document.getElementById('auth-step-otp'),
    authRegister:      document.getElementById('auth-step-register'),
    authContact:       document.getElementById('auth-step-contact'),
    authStore:         document.getElementById('auth-step-store'),
    ltvFill:           document.getElementById('ltv-fill'),
    ltvNeeded:         document.getElementById('ltv-needed'),
    homeCagnotte:      document.getElementById('home-cagnotte'),
    statusBadge:       document.getElementById('home-status-badge'),
    cardHome:          document.getElementById('wallet-card-home'),
    cardFull:          document.getElementById('wallet-card-full'),
    walletFullBadge:   document.getElementById('full-status-badge'),
    walletFullBalance: document.getElementById('wallet-balance-full'),
    btnPinAction:      document.getElementById('btn-pin-action'),
    boosterBtns:       document.querySelectorAll('.btn-act-booster'),
    toggleSms:         document.getElementById('toggle-sms')
  };
  bindEvents();
  try {
    updateUI();
    renderBarcodes();
    renderProfileView();
    const h = new Date().getHours();
    const g = h<12?'Bonjour':h<18?'Bon après-midi':'Bonsoir';
    const ge = document.getElementById('smart-greeting');
    if(ge) ge.textContent = `${g}, ${state.user.firstName}. Voici vos avantages.`;
    const hn = document.getElementById('header-name');
    const al = document.getElementById('avatar-letter');
    const df = document.getElementById('dash-fav-store');
    if(hn) hn.textContent = state.user.firstName;
    if(al) al.textContent = state.user.firstName[0];
    if(df) df.textContent = state.user.favStore;
  } catch(e){ console.error('Init UI:', e); }
  initFeedback();
  initOtpInputs();
  initStorePicker();
  try{ gsap.from('.landing-headline',{opacity:0,y:30,duration:1,ease:'expo.out'}); }catch(e){}
}
function bindEvents() {
  els.btnGotoLogin?.addEventListener('click', () => switchGlobal('global-auth'));

  els.authPhone?.addEventListener('submit', async e => {
    e.preventDefault();
    const phone = document.getElementById('auth-phone-input')?.value || '';
    
    // SIMULATION RETURNING USER
    // Si le numéro commence par '06', on simule un utilisateur connu
    const res = await API.getProfile(phone);
    const isReturning = phone.startsWith('06') || (res && !res.demo);

    if (isReturning) {
      showToast('Heureux de vous revoir !');
      // On saute les étapes d'inscription
      els.authOtp.dataset.mode = 'login'; 
    } else {
      showToast('Bienvenue chez Franprix Connect !');
      els.authOtp.dataset.mode = 'register';
    }

    const display = document.getElementById('display-phone');
    if (display) display.textContent = phone;
    transitionAuthStep(els.authPhone, els.authOtp);
  });

  document.getElementById('btn-back-phone')?.addEventListener('click', () => {
    transitionAuthStep(els.authOtp, els.authPhone);
  });

  els.authOtp?.addEventListener('submit', e => {
    e.preventDefault();
    const mode = els.authOtp.dataset.mode;
    if (mode === 'login') {
      switchGlobal('global-app');
      init(); // Re-init to update UI
    } else {
      transitionAuthStep(els.authOtp, els.authRegister);
    }
  });

  els.authRegister?.addEventListener('submit', e => {
    e.preventDefault();
    state.user.firstName = document.getElementById('reg-prenom').value;
    state.user.lastName = document.getElementById('reg-nom').value;
    transitionAuthStep(els.authRegister, els.authContact);
  });

  els.authContact?.addEventListener('submit', e => {
    e.preventDefault();
    state.user.email = document.getElementById('reg-email').value;
    state.user.address = document.getElementById('reg-adresse').value;
    transitionAuthStep(els.authContact, els.authStore);
  });

  els.authStore?.addEventListener('submit', e => {
    e.preventDefault();
    const selectedStore = document.querySelector('input[name="fav-store"]:checked');
    if (selectedStore) state.user.favStore = selectedStore.value;
    switchGlobal('global-app');
    init(); // Re-init to update names/stores
  });

  document.getElementById('btn-logout-sidebar')?.addEventListener('click', () => {
    switchGlobal('global-landing');
    document.querySelectorAll('.auth-step').forEach(s => s.style.display = 'none');
    if (els.authPhone) { els.authPhone.style.display = 'block'; els.authPhone.classList.add('active'); }
  });

  document.querySelectorAll('.nav-item, .m-nav-item').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      const target = item.getAttribute('data-target');
      if (!target) return;
      
      // Update ALL nav items (mobile + desktop)
      document.querySelectorAll('.nav-item, .m-nav-item').forEach(n => n.classList.remove('active'));
      document.querySelectorAll(`[data-target="${target}"]`).forEach(n => n.classList.add('active'));
      
      els.viewContents.forEach(v => v.classList.remove('active'));
      const targetView = document.getElementById(target);
      if (targetView) {
        targetView.classList.add('active');
        try {
          gsap.fromTo(`#${target} .bento-card`,
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, stagger: 0.08, duration: 0.4, ease: 'power2.out' }
          );
        } catch (e) {}
      }
      const titles = {
        'view-home': 'Tableau de bord',
        'view-wallet': 'Ma Carte & PIN',
        'view-promos': 'Boosters & Offres',
        'view-receipts': 'Mes Tickets',
        'view-profile': 'Mon Profil',
        'view-feedback': 'Réclamations'
      };
      if (els.currentTitle) els.currentTitle.textContent = titles[target] || 'Franprix Connect';
    });
  });

  // Admin Toggle - Robust Binding
  const devBtn = document.getElementById('dev-toggle');
  const demoCtrl = document.getElementById('demo-controls');
  if (devBtn && demoCtrl) {
    devBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isHidden = demoCtrl.style.display === 'none';
      demoCtrl.style.display = isHidden ? 'block' : 'none';
    });
  }

  document.querySelectorAll('#demo-controls button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#demo-controls button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.user.ltv = parseInt(btn.getAttribute('data-ltv'));
      updateUI();
    });
  });

  els.boosterBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      if (this.disabled) return;
      this.textContent = 'Activé ✓';
      this.classList.remove('btn-orange', 'btn-outline');
      this.classList.add('btn-black');
      this.disabled = true;
      try { gsap.from(this, { scale: 0.9, duration: 0.3, ease: 'back.out(2)' }); } catch (e) {}
    });
  });

  els.btnPinAction?.addEventListener('click', showPinModal);

  els.toggleSms?.addEventListener('click', function() {
    this.classList.toggle('active');
  });

  document.querySelectorAll('.ticket-item').forEach(item => {
    item.addEventListener('click', () => {
      const idx = item.getAttribute('data-ticket');
      showReceipt(TICKETS[idx]);
    });
  });
}
function transitionAuthStep(from, to) {
  from.classList.remove('active');
  setTimeout(() => {
    from.style.display = 'none';
    to.style.display = 'block';
    setTimeout(() => to.classList.add('active'), 50);
  }, 300);
}

function switchGlobal(id) {
  document.querySelectorAll('.global-view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) target.classList.add('active');
  window.scrollTo(0, 0);
}

function getTier(ltv) {
  if (ltv >= 1500) return state.tiers.titanium;
  if (ltv >= 500)  return state.tiers.gold;
  return state.tiers.silver;
}

function updateUI() {
  const ltv = state.user.ltv;
  const tier = getTier(ltv);
  const nextTier = tier.label === 'Silver' ? state.tiers.gold : (tier.label === 'Gold' ? state.tiers.titanium : {min:1500, next:Infinity, label:'Titanium'});

  if (els.homeCagnotte) els.homeCagnotte.textContent = `${state.user.cagnotte.toFixed(2).replace('.', ',')} MAD`;
  if (els.statusBadge) {
    els.statusBadge.textContent = tier.label;
    els.statusBadge.style.background = tier.label === 'Silver' ? '#F3F4F6' : (tier.label === 'Gold' ? '#FEF3C7' : '#111');
    els.statusBadge.style.color = tier.label === 'Titanium' ? 'white' : '#111';
  }

  if (els.walletFullBalance) els.walletFullBalance.textContent = `${state.user.cagnotte.toFixed(2).replace('.', ',')} MAD`;
  if (els.walletFullBadge)   els.walletFullBadge.textContent = tier.label;

  [els.cardHome, els.cardFull].forEach(c => {
    if (c) {
      c.classList.remove('tier-silver', 'tier-gold', 'tier-titanium');
      c.classList.add(tier.class);
    }
  });

  if (els.ltvFill) {
    const progress = Math.min(100, (ltv / nextTier.min) * 100);
    try { gsap.to(els.ltvFill, { width: `${progress}%`, duration: 1, ease: 'power2.out' }); } catch (e) { els.ltvFill.style.width = `${progress}%`; }
  }

  if (els.ltvNeeded) {
    const needed = nextTier.min - ltv;
    els.ltvNeeded.textContent = needed <= 0 ? '0 MAD' : `${needed} MAD`;
  }

  const tip = document.getElementById('cashback-boost-tip');
  if(tip) {
     const lastBasket = 80; // Example
     let currentCb = 0;
     let nextTarget = 0;
     let nextCb = 0;
     
     if (lastBasket < 150) { currentCb = 1; nextTarget = 150; nextCb = 3; }
     else if (lastBasket < 300) { currentCb = 3; nextTarget = 300; nextCb = 5; }
     else { currentCb = 5; nextTarget = null; }

     const tipTitle = tip.querySelector('div div:first-child');
     const tipDesc = tip.querySelector('div .muted');
     
     if (tipTitle) tipTitle.textContent = `Palier de cashback : ${currentCb}%`;
     if (tipDesc) {
       if (nextTarget) {
         tipDesc.innerHTML = `Votre panier actuel : <strong>${lastBasket} MAD</strong> → <strong>${currentCb}%</strong> cashback.<br>Dépensez <strong>${nextTarget} MAD</strong> pour passer à <strong style="color:var(--p-orange)">${nextCb}%</strong> !`;
       } else {
         tipDesc.innerHTML = `Félicitations ! Vous bénéficiez du cashback maximum de <strong>5%</strong> sur ce panier.`;
       }
     }
  }

  document.querySelectorAll('.mission-item, .booster-item').forEach(item => {
    const req = item.getAttribute('data-tier');
    const tiers = ['silver', 'gold', 'titanium'];
    const userIdx = tiers.indexOf(tier.label.toLowerCase());
    const reqIdx = tiers.indexOf(req);
    const btn = item.querySelector('.btn-act-booster, .btn-outline');
    
    if (reqIdx > userIdx) {
      item.classList.add('locked');
      if (btn && !btn.classList.contains('status-pill')) {
         btn.disabled = true;
         if(btn.tagName === 'BUTTON') btn.textContent = 'Verrouillé';
      }
    } else {
      item.classList.remove('locked');
      if (btn && btn.disabled) {
        btn.disabled = false;
        if(btn.tagName === 'BUTTON' && btn.textContent === 'Verrouillé') btn.textContent = 'Activer';
      }
    }
  });

  document.querySelectorAll('#apple-wallet-btn, #apple-wallet-btn-2').forEach(btn => {
    btn.addEventListener('click', async function(e) {
      e.preventDefault();
      const originalText = this.innerHTML;
      this.innerHTML = "Génération du pass...";
      this.disabled = true;
      
      const res = await API.generatePass(state.user);
      
      if (res && res.message) {
        showToast(res.message);
        this.innerHTML = "Ajouté ! ✓";
        this.style.background = "var(--green)";
        setTimeout(() => {
          this.innerHTML = originalText;
          this.style.background = "";
          this.disabled = false;
        }, 2000);
      } else {
        this.innerHTML = originalText;
        this.disabled = false;
      }
    });
  });
}

function renderBarcodes() {
  const opts = { format: 'CODE128', lineColor: '#111', width: 2, height: 40, displayValue: false, background: 'transparent' };
  if (document.getElementById('barcode-home')) JsBarcode('#barcode-home', state.user.cardNumber.replace(/-/g,''), opts);
  if (document.getElementById('barcode-full')) JsBarcode('#barcode-full', state.user.cardNumber.replace(/-/g,''), { ...opts, height: 60 });
}
function renderProfileView() {
  const el = document.getElementById('view-profile');
  if (!el) return;
  const u = state.user;
  const t = getTier(u.ltv);
  el.innerHTML = `
    <div class="bento-grid">
      <div class="span-4 bento-card" style="text-align:center;padding:40px 28px">
        <div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,var(--p-orange),#F59E0B);color:white;font-weight:900;font-size:28px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px">${u.firstName[0]}${u.lastName[0]}</div>
        <h2 style="font-size:22px">${u.firstName} ${u.lastName}</h2>
        <div class="status-pill bg-orange-soft" style="margin-top:12px;display:inline-block">${t.label} · ${t.cb}% cashback</div>
        <p class="muted" style="font-size:13px;margin-top:12px">Membre depuis ${u.memberSince}</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:24px">
          <div style="padding:16px;border-radius:16px;background:#FAFAFA;border:1px solid var(--border)">
            <div style="font-size:12px;color:var(--text-muted);font-weight:600">Cagnotte</div>
            <div style="font-size:22px;font-weight:900;color:var(--p-orange);margin-top:4px">${u.cagnotte.toFixed(0)}</div>
          </div>
          <div style="padding:16px;border-radius:16px;background:#FAFAFA;border:1px solid var(--border)">
            <div style="font-size:12px;color:var(--text-muted);font-weight:600">Visites</div>
            <div style="font-size:22px;font-weight:900;margin-top:4px">${u.totalVisits}</div>
          </div>
        </div>
      </div>
      <div class="span-8 bento-card">
        <h3 style="margin-bottom:24px">Informations personnelles</h3>
        <div style="display:flex;flex-direction:column">
          <div style="display:flex;padding:14px 0;border-bottom:1px solid var(--border)"><span style="min-width:160px;font-size:13px;color:var(--text-muted);font-weight:500">Prénom</span><span style="font-weight:700;font-size:14px">${u.firstName}</span></div>
          <div style="display:flex;padding:14px 0;border-bottom:1px solid var(--border)"><span style="min-width:160px;font-size:13px;color:var(--text-muted);font-weight:500">Nom</span><span style="font-weight:700;font-size:14px">${u.lastName}</span></div>
          <div style="display:flex;padding:14px 0;border-bottom:1px solid var(--border)"><span style="min-width:160px;font-size:13px;color:var(--text-muted);font-weight:500">Téléphone</span><span style="font-weight:700;font-size:14px">${u.phone}</span></div>
          <div style="display:flex;padding:14px 0;border-bottom:1px solid var(--border)"><span style="min-width:160px;font-size:13px;color:var(--text-muted);font-weight:500">Email</span><span style="font-weight:700;font-size:14px">${u.email}</span></div>
          <div style="display:flex;padding:14px 0;border-bottom:1px solid var(--border)"><span style="min-width:160px;font-size:13px;color:var(--text-muted);font-weight:500">Adresse</span><span style="font-weight:700;font-size:14px">${u.address}</span></div>
          <div style="display:flex;padding:14px 0;border-bottom:1px solid var(--border)"><span style="min-width:160px;font-size:13px;color:var(--text-muted);font-weight:500">N° de carte</span><span style="font-weight:700;font-size:14px;font-family:monospace">${u.cardNumber}</span></div>
          <div style="display:flex;padding:14px 0;border-bottom:1px solid var(--border)"><span style="min-width:160px;font-size:13px;color:var(--text-muted);font-weight:500">Magasin favori</span><span style="font-weight:700;font-size:14px">${u.favStore}</span></div>
        </div>
        <button class="btn btn-outline" style="margin-top:20px">Modifier mes informations</button>
      </div>
    </div>`;
}

function initFeedback() {
  const stars = document.querySelectorAll('.fb-star');
  stars.forEach(star => {
    star.addEventListener('mouseover', () => {
      const v = +star.dataset.val;
      stars.forEach(s => s.style.color = +s.dataset.val <= v ? 'var(--p-orange)' : '');
    });
    star.addEventListener('mouseout', () => {
      stars.forEach(s => { if (!s.classList.contains('selected')) s.style.color = ''; });
    });
    star.addEventListener('click', () => {
      const v = +star.dataset.val;
      stars.forEach(s => {
        if (+s.dataset.val <= v) { s.style.color = 'var(--p-orange)'; s.classList.add('selected'); }
        else { s.style.color = ''; s.classList.remove('selected'); }
      });
    });
  });

  document.querySelectorAll('input[name="fb_type"]').forEach(r => r.addEventListener('change', e => {
    const lblA = document.getElementById('lbl-avis');
    const lblR = document.getElementById('lbl-reclamation');
    if (!lblA || !lblR) return;
    if (e.target.value === 'avis') {
      lblA.style.cssText = 'flex:1;border:2px solid var(--p-orange);border-radius:var(--radius-sm);padding:12px;text-align:center;font-weight:700;color:var(--p-orange);cursor:pointer;background:#FFFBEB';
      lblR.style.cssText = 'flex:1;border:2px solid var(--border);border-radius:var(--radius-sm);padding:12px;text-align:center;font-weight:700;color:var(--text-muted);cursor:pointer;background:white';
    } else {
      lblR.style.cssText = 'flex:1;border:2px solid var(--p-orange);border-radius:var(--radius-sm);padding:12px;text-align:center;font-weight:700;color:var(--p-orange);cursor:pointer;background:#FFFBEB';
      lblA.style.cssText = 'flex:1;border:2px solid var(--border);border-radius:var(--radius-sm);padding:12px;text-align:center;font-weight:700;color:var(--text-muted);cursor:pointer;background:white';
    }
  }));

  document.getElementById('feedback-form')?.addEventListener('submit', e => {
    e.preventDefault();
    alert('Merci pour votre retour !');
    e.target.reset();
    stars.forEach(s => { s.style.color = ''; s.classList.remove('selected'); });
  });
}
function initOtpInputs() {
  const inputs = document.querySelectorAll('.otp-digit');
  inputs.forEach((input, idx) => {
    input.addEventListener('input', (e) => {
      if (e.target.value.length === 1 && idx < inputs.length - 1) inputs[idx + 1].focus();
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !e.target.value && idx > 0) inputs[idx - 1].focus();
    });
  });
}

function initStorePicker() {
  document.querySelectorAll('.store-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.store-card').forEach(c => c.style.borderColor = 'var(--border)');
      card.style.borderColor = 'var(--p-orange)';
    });
  });
}

function openModal(content) {
  const overlay = document.getElementById('modal-overlay');
  const box = document.getElementById('modal-box');
  if (!overlay || !box) return;
  box.innerHTML = content;
  overlay.style.display = 'flex';
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.style.display = 'none';
}

document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
  if (e.target.id === 'modal-overlay') closeModal();
});

function showReceipt(t) {
  let itemsHtml = t.items.map(it => `
    <div class="receipt-row"><span>${it[0]}</span><span>${it[1]} MAD</span></div>
  `).join('');

  const content = `
    <div class="receipt">
      <div class="receipt-header">
        <img src="https://upload.wikimedia.org/wikipedia/commons/e/e0/Franprix_logo.svg" alt="Franprix" style="height:30px;width:auto;margin-bottom:12px">
        <p class="muted" style="font-size:12px">${t.store}<br>${t.date} à ${t.time}<br>Caissier: ${t.caissier}</p>
      </div>
      <div style="margin-bottom:16px">${itemsHtml}</div>
      <div class="receipt-row receipt-total" style="font-weight:900;font-size:16px">
        <span>TOTAL</span><span>${t.total} MAD</span>
      </div>
      <div class="receipt-cashback">
        CASHBACK GAGNÉ: +${t.cashback} MAD
      </div>
      <div style="text-align:center;margin-top:20px;opacity:0.3">
        <div style="font-size:24px;letter-spacing:2px">|||| ||| || |||||</div>
        <div style="font-size:10px">TICKET N°${Math.floor(Math.random()*1000000)}</div>
      </div>
    </div>
    <button class="btn btn-black" onclick="closeModal()" style="width:100%;margin-top:24px">Fermer</button>
  `;
  openModal(content);
}

window.closeModal = closeModal; // Expose to global for onclick

function showPinModal() {
  state.pinBuffer = [];
  const renderPinDisplay = () => {
    const dots = document.querySelectorAll('.pin-dot');
    dots.forEach((dot, i) => {
      if (i < state.pinBuffer.length) dot.classList.add('filled');
      else dot.classList.remove('filled');
    });
  };

  const content = `
    <div style="text-align:center">
      <h3 style="margin-bottom:8px">${state.user.hasPin ? 'Modifier mon PIN' : 'Créer mon PIN'}</h3>
      <p class="muted" style="font-size:14px">Saisissez un code à 4 chiffres</p>
      <div class="pin-display">
        <div class="pin-dot"></div><div class="pin-dot"></div><div class="pin-dot"></div><div class="pin-dot"></div>
      </div>
      <div class="pin-pad">
        ${[1,2,3,4,5,6,7,8,9].map(n => `<button class="pin-key" data-val="${n}">${n}</button>`).join('')}
        <button class="pin-key" data-val="clear">C</button>
        <button class="pin-key" data-val="0">0</button>
        <button class="pin-key" data-val="del">←</button>
      </div>
    </div>
  `;
  openModal(content);

  setTimeout(() => {
    document.querySelectorAll('.pin-key').forEach(key => {
      key.addEventListener('click', () => {
        const val = key.dataset.val;
        if (val === 'clear') state.pinBuffer = [];
        else if (val === 'del') state.pinBuffer.pop();
        else if (state.pinBuffer.length < 4) state.pinBuffer.push(val);
        renderPinDisplay();
        if (state.pinBuffer.length === 4) {
          setTimeout(() => {
            state.user.hasPin = true;
            updateUI();
            closeModal();
            alert('Code PIN mis à jour avec succès !');
          }, 200);
        }
      });
    });
  }, 100);
}

document.addEventListener('DOMContentLoaded', init);
