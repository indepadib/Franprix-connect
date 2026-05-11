/**
 * Franprix Connect x Chari
 */

const state = {
  user: {
    ltv: 150, // Starts at 150 MAD
    cagnotte: 125.50,
    hasPin: false
  },
  tiers: {
    silver: { min: 0, next: 500, label: 'Silver', class: 'tier-silver' },
    gold: { min: 500, next: 1500, label: 'Gold', class: 'tier-gold' },
    titanium: { min: 1500, next: Infinity, label: 'Titanium', class: 'tier-titanium' }
  }
};

let els = {};

function init() {
  els = {
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

  bindEvents();
  updateUI();
  
  // Entry Animation
  gsap.from(".logo-main", { opacity: 0, y: -10, duration: 0.8, ease: "power2.out" });
}

function bindEvents() {
  document.getElementById('btn-goto-login')?.addEventListener('click', () => {
    switchGlobal('global-auth');
  });
  
  // --- AUTHENTICATION FLOW ---
  const authPhone = document.getElementById('auth-step-phone');
  const authPassword = document.getElementById('auth-step-password');
  const authOtp = document.getElementById('auth-step-otp');
  const authRegister = document.getElementById('auth-step-register');
  
  authPhone?.addEventListener('submit', (e) => {
    e.preventDefault();
    const phone = document.getElementById('auth-phone-input').value.replace(/\s+/g, '');
    document.getElementById('display-phone').textContent = phone;
    
    authPhone.classList.remove('active');
    
    setTimeout(() => { 
      authPhone.style.display = 'none';
      
      if (phone === '0611111111') {
        // Full User -> Password
        authPassword.style.display = 'block'; 
        setTimeout(() => authPassword.classList.add('active'), 50);
      } else {
        // Partial or New -> OTP
        authOtp.style.display = 'block'; 
        setTimeout(() => authOtp.classList.add('active'), 50);
        
        // Store phone globally for next step logic
        state.tempPhone = phone;
      }
    }, 300);
  });

  document.getElementById('btn-back-phone')?.addEventListener('click', () => {
    authOtp.classList.remove('active');
    setTimeout(() => { authOtp.style.display = 'none'; authPhone.style.display = 'block'; setTimeout(() => authPhone.classList.add('active'), 50); }, 300);
  });
  
  document.getElementById('btn-back-phone-pw')?.addEventListener('click', () => {
    authPassword.classList.remove('active');
    setTimeout(() => { authPassword.style.display = 'none'; authPhone.style.display = 'block'; setTimeout(() => authPhone.classList.add('active'), 50); }, 300);
  });

  authPassword?.addEventListener('submit', (e) => {
    e.preventDefault();
    switchGlobal('global-app');
    animateCards('view-home');
    renderBarcodes();
  });

  // OTP Auto-focus
  const otpDigits = document.querySelectorAll('.otp-digit');
  otpDigits.forEach((digit, i) => {
    digit.addEventListener('input', function() {
      if(this.value.length === 1 && i < otpDigits.length - 1) otpDigits[i+1].focus();
    });
    digit.addEventListener('keydown', function(e) {
      if(e.key === 'Backspace' && this.value === '' && i > 0) otpDigits[i-1].focus();
    });
  });

  authOtp?.addEventListener('submit', (e) => {
    e.preventDefault();
    authOtp.classList.remove('active');
    
    setTimeout(() => { 
      authOtp.style.display = 'none'; 
      authRegister.style.display = 'block'; 
      setTimeout(() => authRegister.classList.add('active'), 50);
      
      // Logic for pre-filled data
      const prenomInput = document.getElementById('reg-prenom');
      const nomInput = document.getElementById('reg-nom');
      
      if (state.tempPhone === '0622222222') {
        prenomInput.value = 'Hassan';
        nomInput.value = 'El Idrissi';
        prenomInput.setAttribute('disabled', 'true');
        nomInput.setAttribute('disabled', 'true');
        prenomInput.style.background = 'rgba(0,0,0,0.05)';
        nomInput.style.background = 'rgba(0,0,0,0.05)';
      } else {
        prenomInput.value = '';
        nomInput.value = '';
        prenomInput.removeAttribute('disabled');
        nomInput.removeAttribute('disabled');
        prenomInput.style.background = '';
        nomInput.style.background = '';
      }
    }, 300);
  });

  authRegister?.addEventListener('submit', (e) => {
    e.preventDefault();
    switchGlobal('global-app');
    animateCards('view-home');
    renderBarcodes();
  });
  
  document.getElementById('btn-logout-sidebar')?.addEventListener('click', () => {
    switchGlobal('global-landing');
    // Reset Auth View
    authRegister.style.display = 'none';
    authRegister.classList.remove('active');
    authOtp.style.display = 'none';
    authOtp.classList.remove('active');
    authPhone.style.display = 'block';
    authPhone.classList.add('active');
    document.getElementById('auth-phone-input').value = '';
    otpDigits.forEach(d => d.value = '');
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
        'view-promos': 'Boosters Gold',
        'view-wallet': 'Ma Carte & PIN',
        'view-receipts': 'Mes Tickets',
        'view-feedback': 'Avis & Réclamations'
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
    btn.addEventListener('click', function(e) {
      if(this.closest('.locked-booster')) return e.preventDefault();
      
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

  // --- PIN CREATION ---
  document.getElementById('btn-pin-action')?.addEventListener('click', function() {
    state.user.hasPin = !state.user.hasPin;
    updateUI();
  });

  // --- FEEDBACK STARS ---
  const fbStars = document.querySelectorAll('.fb-star');
  fbStars.forEach(star => {
    star.addEventListener('mouseover', function() {
      const val = parseInt(this.dataset.val);
      fbStars.forEach(s => parseInt(s.dataset.val) <= val ? s.classList.add('hovered') : s.classList.remove('hovered'));
    });
    star.addEventListener('mouseout', function() {
      fbStars.forEach(s => s.classList.remove('hovered'));
    });
    star.addEventListener('click', function() {
      const val = parseInt(this.dataset.val);
      fbStars.forEach(s => parseInt(s.dataset.val) <= val ? s.classList.add('active') : s.classList.remove('active'));
    });
  });

  // Feedback Radio Toggle
  const fbRadios = document.querySelectorAll('input[name="fb_type"]');
  fbRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      document.getElementById('lbl-avis').style.background = e.target.value === 'avis' ? '#FFFBEB' : 'white';
      document.getElementById('lbl-avis').style.borderColor = e.target.value === 'avis' ? 'var(--p-orange)' : 'var(--border)';
      document.getElementById('lbl-avis').style.color = e.target.value === 'avis' ? 'var(--p-orange)' : 'var(--text-muted)';
      
      document.getElementById('lbl-reclamation').style.background = e.target.value === 'reclamation' ? '#FFFBEB' : 'white';
      document.getElementById('lbl-reclamation').style.borderColor = e.target.value === 'reclamation' ? 'var(--p-orange)' : 'var(--border)';
      document.getElementById('lbl-reclamation').style.color = e.target.value === 'reclamation' ? 'var(--p-orange)' : 'var(--text-muted)';
    });
  });

  document.getElementById('feedback-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Votre message a bien été envoyé ! Merci pour votre retour.');
    e.target.reset();
    fbStars.forEach(s => s.classList.remove('active'));
  });

  // --- 3D TILT EFFECT ---
  const cards3D = document.querySelectorAll('.wallet-cc');
  cards3D.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -12;
      const rotateY = ((x - centerX) / centerX) * 12;
      
      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      
      const glow = card.querySelector('.wallet-glow');
      if(glow) {
        glow.style.opacity = '1';
        glow.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.6), transparent 60%)`;
      }
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = `rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      const glow = card.querySelector('.wallet-glow');
      if(glow) glow.style.opacity = '0';
    });
  });
}

function switchGlobal(id) {
  const allViews = document.querySelectorAll('.global-view');
  allViews.forEach(v => v.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) {
    target.classList.add('active');
  }
  window.scrollTo(0,0);
}

function animateCards(viewId) {
  gsap.fromTo(`#${viewId} .card`, 
    { opacity: 0, y: 15 }, 
    { opacity: 1, y: 0, stagger: 0.05, duration: 0.4, ease: "power2.out" }
  );
}

function updateUI() {
  const ltv = state.user.ltv;
  const tier = getTier(ltv);
  
  // Update UI Elements
  if(els.homeCagnotte) els.homeCagnotte.textContent = `${state.user.cagnotte.toFixed(2).replace('.', ',')} MAD`;
  if(els.walletFull) els.walletFull.textContent = `${state.user.cagnotte.toFixed(2).replace('.', ',')} MAD`;
  
  if(els.statusBadge) els.statusBadge.textContent = tier.label;
  if(els.walletFullBadge) els.walletFullBadge.textContent = tier.label;
  
  // Card Visuals
  [els.cardHome, els.cardFull].forEach(c => {
    if(c) {
      c.classList.remove('tier-silver', 'tier-gold', 'tier-titanium');
      c.classList.add(tier.class);
    }
  });

  // PIN Button Text
  const pinBtn = document.getElementById('btn-pin-action');
  if(pinBtn) {
    pinBtn.innerHTML = state.user.hasPin 
      ? `<svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg> Modifier mon code PIN`
      : `<svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> Créer mon code PIN`;
  }

  // Handle Booster Locks
  lockBoosters(tier.label.toLowerCase());

  // Progress Bar Animation
  const nextVal = tier.next === Infinity ? ltv : tier.next;
  const percent = Math.min(100, (ltv / nextVal) * 100);
  
  if(els.ltvFill) {
    gsap.to(els.ltvFill, { width: `${percent}%`, duration: 1, ease: "power2.out" });
  }

  // --- PREDICTIVE CASHBACK LOGIC ---
  const lastPurchase = 120; // Simulated last purchase amount
  let cbPercent = 0;
  let nextTarget = 0;
  let cbNextPercent = 0;

  if (lastPurchase < 150) {
    cbPercent = 1;
    nextTarget = 150;
    cbNextPercent = 3;
  } else if (lastPurchase < 300) {
    cbPercent = 3;
    nextTarget = 300;
    cbNextPercent = 5;
  } else {
    cbPercent = 5;
    nextTarget = Infinity;
  }

  const amtEl = document.getElementById('last-purchase-amount');
  const txtEl = document.getElementById('last-purchase-cashback');
  const hintEl = document.getElementById('cb-hint-text');
  const fillEl = document.getElementById('cb-fill');

  if(amtEl) amtEl.textContent = `${lastPurchase.toFixed(2).replace('.', ',')} MAD`;
  if(txtEl) txtEl.textContent = `(${cbPercent}%)`;
  
  if(hintEl && fillEl) {
    if(lastPurchase < 150) {
      const to3 = 150 - lastPurchase;
      const to5 = 300 - lastPurchase;
      const progress = (lastPurchase / 150) * 100;
      hintEl.innerHTML = `<span>💡</span> Il vous manquait <strong style="color: var(--p-orange);">${to3.toFixed(0)} MAD</strong> pour 3% et <strong style="color: var(--p-orange);">${to5.toFixed(0)} MAD</strong> pour 5% de cashback.`;
      gsap.to(fillEl, { width: `${progress}%`, duration: 1, ease: "power2.out" });
    } else if(lastPurchase < 300) {
      const to5 = 300 - lastPurchase;
      const progress = (lastPurchase / 300) * 100;
      hintEl.innerHTML = `<span>💡</span> Il vous manquait <strong style="color: var(--p-orange);">${to5.toFixed(0)} MAD</strong> pour débloquer le palier de 5% de cashback.`;
      gsap.to(fillEl, { width: `${progress}%`, duration: 1, ease: "power2.out" });
    } else {
      hintEl.innerHTML = `<span>✨</span> Félicitations ! Vous avez atteint le palier maximum de 5% de cashback.`;
      fillEl.style.width = '100%';
    }
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

  // Update PIN Button
  const btnPin = document.getElementById('btn-pin-action');
  if(btnPin) {
    if(state.user.hasPin) {
      btnPin.innerHTML = '<svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg> Modifier mon code PIN';
    } else {
      btnPin.innerHTML = '<svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> Créer mon code PIN';
    }
  }

  // Update Boosters (Lock/Unlock based on tier)
  document.querySelectorAll('.booster-item').forEach(item => {
    const reqTier = item.getAttribute('data-tier');
    if(!reqTier) return;
    
    let isLocked = false;
    if(reqTier === 'gold' && ltv < 500) isLocked = true;
    if(reqTier === 'titanium' && ltv < 1500) isLocked = true;
    
    if(isLocked) {
      item.classList.add('locked-booster');
      // Reset button if it was activated
      const btn = item.querySelector('.btn-act-booster');
      if(btn && btn.textContent === "Activé ✓") {
        btn.textContent = "Activer";
        btn.className = item.classList.contains('premium-booster') ? "btn btn-brand btn-act-booster" : "btn btn-outline btn-act-booster";
      }
    } else {
      item.classList.remove('locked-booster');
    }
  });
}

function lockBoosters(userTier) {
  const boosters = document.querySelectorAll('.booster-item');
  const tiersOrder = ['silver', 'gold', 'titanium'];
  const userTierIndex = tiersOrder.indexOf(userTier);

  boosters.forEach(item => {
    const requiredTier = item.dataset.tier;
    const requiredTierIndex = tiersOrder.indexOf(requiredTier);
    
    if (requiredTierIndex > userTierIndex) {
      item.classList.add('locked-booster');
      item.style.opacity = '0.5';
      item.style.filter = 'grayscale(1)';
      item.style.pointerEvents = 'none';
      
      const btn = item.querySelector('.btn-act-booster');
      if(btn) {
        btn.textContent = `Réservé aux membres ${requiredTier.toUpperCase()}`;
        btn.disabled = true;
      }
    } else {
      item.classList.remove('locked-booster');
      item.style.opacity = '1';
      item.style.filter = 'none';
      item.style.pointerEvents = 'auto';
      
      const btn = item.querySelector('.btn-act-booster');
      if(btn && btn.textContent.startsWith("Réservé")) {
        btn.textContent = "Activer";
        btn.disabled = false;
      }
    }
  });
}

function renderBarcodes() {
  const opts = { format: "CODE128", lineColor: "#111", width: 2, height: 40, displayValue: false, background: "transparent" };
  
  if(document.getElementById('barcode-home')) JsBarcode("#barcode-home", "CH-9876", opts);
  if(document.getElementById('barcode-full')) JsBarcode("#barcode-full", "CH-9876", { ...opts, height: 60 });
}

init();
