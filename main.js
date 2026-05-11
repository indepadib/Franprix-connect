/**
 * Franprix Connect x Chari
 * Pro-Max Experience Engine
 */

const state = {
  user: {
    name: 'Adib',
    ltv: 150, // Cumulative spend
    cagnotte: 125.50,
    hasPin: false
  },
  tiers: {
    silver: { min: 0, next: 500, label: 'Silver', class: 'tier-silver', cb: 1 },
    gold: { min: 500, next: 1500, label: 'Gold', class: 'tier-gold', cb: 3 },
    titanium: { min: 1500, next: Infinity, label: 'Titanium', class: 'tier-titanium', cb: 5 }
  }
};

let els = {};

function init() {
  els = {
    // Nav
    navItems: document.querySelectorAll('.nav-item, .m-nav-item'),
    viewContents: document.querySelectorAll('.view-content'),
    currentTitle: document.getElementById('current-title'),
    
    // Auth
    btnGotoLogin: document.getElementById('btn-goto-login'),
    authPhone: document.getElementById('auth-step-phone'),
    authPassword: document.getElementById('auth-step-password'),
    authOtp: document.getElementById('auth-step-otp'),
    authRegister: document.getElementById('auth-step-register'),
    
    // Dashboard
    ltvFill: document.getElementById('ltv-fill'),
    ltvNeeded: document.getElementById('ltv-needed'),
    homeCagnotte: document.getElementById('home-cagnotte'),
    statusBadge: document.getElementById('home-status-badge'),
    cardHome: document.getElementById('wallet-card-home'),
    
    // Wallet
    cardFull: document.getElementById('wallet-card-full'),
    walletFullBadge: document.getElementById('full-status-badge'),
    walletFullBalance: document.getElementById('wallet-balance-full'),
    btnPinAction: document.getElementById('btn-pin-action'),
    
    // Common
    boosterBtns: document.querySelectorAll('.btn-act-booster')
  };

  bindEvents();
  updateUI();
  renderBarcodes();

  // Initial Animation
  gsap.from(".logo-main", { opacity: 0, scale: 0.9, duration: 1, ease: "expo.out" });
}

function bindEvents() {
  // Navigation Landing -> Auth
  els.btnGotoLogin?.addEventListener('click', () => switchGlobal('global-auth'));

  // Auth Flow
  els.authPhone?.addEventListener('submit', (e) => {
    e.preventDefault();
    const phone = document.getElementById('auth-phone-input').value;
    document.getElementById('display-phone').textContent = phone;
    
    // Transition
    transitionAuthStep(els.authPhone, els.authOtp);
  });

  document.getElementById('btn-back-phone')?.addEventListener('click', () => {
    transitionAuthStep(els.authOtp, els.authPhone);
  });

  els.authOtp?.addEventListener('submit', (e) => {
    e.preventDefault();
    transitionAuthStep(els.authOtp, els.authRegister);
  });

  els.authRegister?.addEventListener('submit', (e) => {
    e.preventDefault();
    switchGlobal('global-app');
  });

  document.getElementById('btn-logout-sidebar')?.addEventListener('click', () => {
    switchGlobal('global-landing');
    // Reset auth steps for next time
    document.querySelectorAll('.auth-step').forEach(s => s.style.display = 'none');
    els.authPhone.style.display = 'block';
    els.authPhone.classList.add('active');
  });

  // App View Switching
  els.navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const target = item.getAttribute('data-target');
      if (!target) return;

      // Update Nav States
      els.navItems.forEach(n => n.classList.remove('active'));
      document.querySelectorAll(`[data-target="${target}"]`).forEach(n => n.classList.add('active'));

      // Switch View
      els.viewContents.forEach(v => v.classList.remove('active'));
      const targetView = document.getElementById(target);
      if (targetView) {
        targetView.classList.add('active');
        // Animate content
        gsap.fromTo(`#${target} .bento-card`, 
          { opacity: 0, y: 15 }, 
          { opacity: 1, y: 0, stagger: 0.1, duration: 0.4, ease: "power2.out" }
        );
      }

      // Title Update
      const titles = {
        'view-home': 'Tableau de bord',
        'view-wallet': 'Ma Carte & PIN',
        'view-promos': 'Boosters & Offres',
        'view-receipts': 'Mes Tickets',
        'view-feedback': 'Réclamations'
      };
      if (els.currentTitle) els.currentTitle.textContent = titles[target] || 'Franprix Connect';
    });
  });

  // Admin Controls
  document.getElementById('dev-toggle')?.addEventListener('click', () => {
    const ctrl = document.getElementById('demo-controls');
    ctrl.style.display = ctrl.style.display === 'none' ? 'block' : 'none';
  });

  const adminBtns = document.querySelectorAll('#demo-controls button');
  adminBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      adminBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.user.ltv = parseInt(btn.getAttribute('data-ltv'));
      updateUI();
    });
  });

  // Booster Actions
  els.boosterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      if (this.disabled) return;
      this.textContent = "Activé ✓";
      this.classList.remove('btn-orange', 'btn-outline');
      this.classList.add('btn-black');
      this.disabled = true;
      
      gsap.from(this, { scale: 0.9, duration: 0.3, ease: "back.out(2)" });
    });
  });

  // PIN Toggle
  els.btnPinAction?.addEventListener('click', () => {
    state.user.hasPin = !state.user.hasPin;
    updateUI();
  });

  // 3D Tilt Effect
  const cards = document.querySelectorAll('.wallet-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;
      
      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = `rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
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
  const views = document.querySelectorAll('.global-view');
  views.forEach(v => v.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) target.classList.add('active');
  window.scrollTo(0,0);
}

function updateUI() {
  const ltv = state.user.ltv;
  const tier = getTier(ltv);

  // Dashboard Updates
  if (els.homeCagnotte) els.homeCagnotte.textContent = `${state.user.cagnotte.toFixed(2).replace('.', ',')} MAD`;
  if (els.statusBadge) {
    els.statusBadge.textContent = tier.label;
    els.statusBadge.style.background = tier.label === 'Silver' ? '#F3F4F6' : 
                                       tier.label === 'Gold' ? '#FEF3C7' : '#111';
    els.statusBadge.style.color = tier.label === 'Titanium' ? 'white' : '#111';
  }
  
  // Wallet Updates
  if (els.walletFullBalance) els.walletFullBalance.textContent = `${state.user.cagnotte.toFixed(2).replace('.', ',')} MAD`;
  if (els.walletFullBadge) {
    els.walletFullBadge.textContent = tier.label;
  }

  // Card Tiers
  [els.cardHome, els.cardFull].forEach(c => {
    if (c) {
      c.classList.remove('tier-silver', 'tier-gold', 'tier-titanium');
      c.classList.add(tier.class);
    }
  });

  // Progress Bar
  if (els.ltvFill) {
    const progress = Math.min(100, (ltv / (tier.next === Infinity ? ltv : tier.next)) * 100);
    gsap.to(els.ltvFill, { width: `${progress}%`, duration: 1, ease: "power2.out" });
  }

  if (els.ltvNeeded) {
    const diff = tier.next - ltv;
    els.ltvNeeded.textContent = tier.next === Infinity ? "0 MAD" : `${diff} MAD`;
  }

  // PIN Button
  if (els.btnPinAction) {
    els.btnPinAction.textContent = state.user.hasPin ? "Modifier mon PIN" : "Créer mon PIN";
  }

  // Booster Locks
  document.querySelectorAll('.booster-item').forEach(item => {
    const req = item.getAttribute('data-tier');
    const tiers = ['silver', 'gold', 'titanium'];
    const userIdx = tiers.indexOf(tier.label.toLowerCase());
    const reqIdx = tiers.indexOf(req);
    
    const btn = item.querySelector('.btn-act-booster');
    if (reqIdx > userIdx) {
      item.classList.add('locked');
      if (btn) {
        btn.textContent = `Niveau ${req.toUpperCase()} requis`;
        btn.disabled = true;
      }
    } else {
      item.classList.remove('locked');
      if (btn && btn.textContent.includes('requis')) {
        btn.textContent = "Activer";
        btn.disabled = false;
      }
    }
  });
}

function getTier(ltv) {
  if (ltv >= 1500) return state.tiers.titanium;
  if (ltv >= 500) return state.tiers.gold;
  return state.tiers.silver;
}

function renderBarcodes() {
  const opts = { format: "CODE128", lineColor: "#111", width: 2, height: 40, displayValue: false, background: "transparent" };
  if (document.getElementById('barcode-home')) JsBarcode("#barcode-home", "FR-9988", opts);
  if (document.getElementById('barcode-full')) JsBarcode("#barcode-full", "FR-9988", { ...opts, height: 60 });
}

// Start
init();
