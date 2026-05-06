/**
 * Franprix Connect x Chari
 */

const state = {
  user: {
    ltv: 150, // Starts at 150 MAD
    cagnotte: 125.50
  },
  tiers: {
    silver: { min: 0, next: 500, label: 'Silver', class: 'tier-silver' },
    gold: { min: 500, next: 1500, label: 'Gold', class: 'tier-gold' },
    titanium: { min: 1500, next: Infinity, label: 'Titanium', class: 'tier-titanium' }
  }
};

const els = {
  views: document.querySelectorAll('.global-view'),
  navItems: document.querySelectorAll('.nav-item, .b-nav-item'),
  viewContents: document.querySelectorAll('.view-content'),
  
  // Dashboard
  ltvFill: document.getElementById('ltv-fill'),
  homeCagnotte: document.getElementById('home-cagnotte'),
  statusBadge: document.getElementById('home-status-badge'),
  walletFullBadge: document.getElementById('full-status-badge'),
  ltvHint: document.getElementById('ltv-hint'),
  walletFull: document.getElementById('wallet-balance-full'),
  
  // Cards
  cardHome: document.getElementById('wallet-card-home'),
  cardFull: document.getElementById('wallet-card-full'),
  
  // Interactions
  boosterBtns: document.querySelectorAll('.btn-act-booster')
};

function init() {
  bindEvents();
  updateUI();
  
  // Entry Animation
  gsap.from(".logo-main", { opacity: 0, y: -10, duration: 0.8, ease: "power2.out" });
}

function bindEvents() {
  document.getElementById('btn-goto-login')?.addEventListener('click', () => {
    switchGlobal('global-auth');
  });
  
  document.getElementById('login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    switchGlobal('global-app');
    animateCards('view-home');
    renderBarcodes();
  });
  
  document.getElementById('btn-logout-sidebar')?.addEventListener('click', () => {
    switchGlobal('global-landing');
  });

  els.navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = item.getAttribute('data-target');
      if (!targetId) return;

      els.navItems.forEach(n => n.classList.remove('active'));
      document.querySelectorAll(`[data-target="${targetId}"]`).forEach(n => n.classList.add('active'));

      els.viewContents.forEach(v => v.classList.remove('active'));
      const targetView = document.getElementById(targetId);
      if (targetView) {
        targetView.classList.add('active');
        animateCards(targetId);
      }

      if (targetId === 'view-wallet') renderBarcodes();
      
      const titles = {
        'view-home': 'Tableau de bord',
        'view-promos': 'Offres & Boosters',
        'view-wallet': 'Ma Carte Chari',
        'view-receipts': 'Tickets de caisse',
        'view-stores': 'Magasins'
      };
      if(document.getElementById('current-title')) {
        document.getElementById('current-title').textContent = titles[targetId];
      }
    });
  });

  document.getElementById('dev-toggle')?.addEventListener('click', () => {
    const p = document.getElementById('demo-controls');
    p.style.display = p.style.display === 'none' ? 'block' : 'none';
  });

  document.querySelectorAll('#demo-controls button').forEach(btn => {
    btn.addEventListener('click', () => {
      state.user.ltv = parseInt(btn.getAttribute('data-ltv'));
      updateUI();
    });
  });

  els.boosterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      gsap.to(this, { 
        scale: 0.95, 
        duration: 0.1, 
        yoyo: true, 
        repeat: 1,
        onComplete: () => {
          this.textContent = "Activé ✓";
          this.className = "btn btn-primary"; // Visually transform
        }
      });
    });
  });
}

function switchGlobal(id) {
  els.views.forEach(v => v.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
  window.scrollTo(0,0);
}

function animateCards(viewId) {
  gsap.fromTo(`#${viewId} .card`, 
    { opacity: 0, y: 15 }, 
    { opacity: 1, y: 0, stagger: 0.05, duration: 0.4, ease: "power2.out" }
  );
}

function updateUI() {
  const { ltv, cagnotte } = state.user;
  
  // Tier Calc
  let tier = state.tiers.silver;
  if(ltv >= 1500) tier = state.tiers.titanium;
  else if(ltv >= 500) tier = state.tiers.gold;

  // Update Text
  const money = `${cagnotte.toFixed(2).replace('.', ',')} MAD`;
  if(els.homeCagnotte) els.homeCagnotte.textContent = money;
  if(els.walletFull) els.walletFull.textContent = money;
  
  if(els.statusBadge) els.statusBadge.textContent = tier.label;
  if(els.walletFullBadge) els.walletFullBadge.textContent = tier.label;

  // Update Card Styles (Metallic)
  if(els.cardHome) {
    els.cardHome.className = `card col-6 wallet-cc ${tier.class}`;
  }
  if(els.cardFull) {
    els.cardFull.className = `wallet-cc ${tier.class}`;
  }

  // Progress Bar Animation
  const nextVal = tier.next === Infinity ? ltv : tier.next;
  const percent = Math.min(100, (ltv / nextVal) * 100);
  
  if(els.ltvFill) {
    gsap.to(els.ltvFill, { width: `${percent}%`, duration: 1, ease: "power2.out" });
  }

  if(els.ltvHint) {
    const rem = tier.next - ltv;
    if (tier.next === Infinity) {
      els.ltvHint.innerHTML = "Vous possédez la carte <strong>Titanium</strong>, profitez de 5% de cashback.";
    } else {
      els.ltvHint.innerHTML = `Dépensez encore ${rem.toFixed(0)} MAD pour débloquer la prestigieuse carte <strong>${tier.next === 500 ? 'Gold' : 'Titanium'}</strong> et maximiser votre cashback.`;
    }
  }

  // Update Tier Steps Visualization
  const stepSilver = document.getElementById('step-silver');
  const stepGold = document.getElementById('step-gold');
  const stepTitanium = document.getElementById('step-titanium');
  
  if (stepSilver && stepGold && stepTitanium) {
    // Reset all
    [stepSilver, stepGold, stepTitanium].forEach(s => {
      s.classList.remove('active');
      s.classList.add('locked');
      s.querySelector('.t-dot').textContent = s.id === 'step-silver' ? '1' : s.id === 'step-gold' ? '2' : '3';
    });

    // Silver is always active
    stepSilver.classList.add('active');
    stepSilver.classList.remove('locked');

    if (ltv >= 500) {
      stepSilver.querySelector('.t-dot').textContent = '✓';
      stepGold.classList.add('active');
      stepGold.classList.remove('locked');
    }
    if (ltv >= 1500) {
      stepGold.querySelector('.t-dot').textContent = '✓';
      stepTitanium.classList.add('active');
      stepTitanium.classList.remove('locked');
      stepTitanium.querySelector('.t-dot').textContent = '✓';
    }
  }
}

function renderBarcodes() {
  const opts = { format: "CODE128", lineColor: "#111", width: 2, height: 40, displayValue: false, background: "transparent" };
  
  if(document.getElementById('barcode-home')) JsBarcode("#barcode-home", "CH-9876", opts);
  if(document.getElementById('barcode-full')) JsBarcode("#barcode-full", "CH-9876", { ...opts, height: 60 });
}

init();
