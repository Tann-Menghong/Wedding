// ============ Config ============
// These are reassigned by the wedding:content-ready listener below once
// js/render-content.js resolves the (possibly Firebase-backed) site content.
let WEDDING_DATE = new Date('2026-12-26T17:00:00+07:00');
const WEDDING_TITLE = 'Wedding of Tann Menghong & Ouk Sokha';
let VENUE_TEXT = 'Tuol Domnak Village, Cambodia';
let MAPS_URL = `https://www.google.com/maps?q=${encodeURIComponent('ភូមិទួលដំណាក់, Cambodia')}`;

// ============ Language toggle ============
function setLang(lang) {
  document.documentElement.setAttribute('data-lang', lang);
  document.documentElement.setAttribute('lang', lang);
  localStorage.setItem('wedding-lang', lang);
  const toggle = document.getElementById('langToggle');
  if (toggle) toggle.setAttribute('aria-checked', String(lang === 'en'));
}
(function initLang() {
  const saved = localStorage.getItem('wedding-lang') || 'km';
  setLang(saved);
  document.getElementById('langToggle').addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-lang');
    setLang(current === 'km' ? 'en' : 'km');
  });
})();

// ============ Guest name personalization (?to=Name in URL) ============
(function initGuestName() {
  const params = new URLSearchParams(window.location.search);
  const guest = params.get('to');
  if (guest) {
    const el = document.getElementById('guestName');
    el.innerHTML = '';
    const span = document.createElement('span');
    span.textContent = guest; // URLSearchParams already decodes the value
    el.appendChild(span);
  }
})();

// ============ Open invitation (splash -> main content) ============
(function initOpenInvite() {
  const btn = document.getElementById('openInviteBtn');
  const main = document.getElementById('mainContent');
  const music = document.getElementById('bgMusic');
  btn.addEventListener('click', () => {
    main.classList.remove('hidden');
    document.getElementById('cover').scrollIntoView({ behavior: 'smooth' });
    if (music.querySelector('source')) {
      music.play().catch(() => {});
      document.getElementById('soundToggle').classList.remove('muted');
    }
  });
})();

// ============ Sound toggle ============
(function initSoundToggle() {
  const btn = document.getElementById('soundToggle');
  const music = document.getElementById('bgMusic');
  btn.addEventListener('click', () => {
    if (music.paused) {
      music.play().catch(() => {});
      btn.classList.remove('muted');
    } else {
      music.pause();
      btn.classList.add('muted');
    }
  });
  btn.classList.add('muted');
})();

// ============ Countdown ============
(function initCountdown() {
  const elDays = document.getElementById('cdDays');
  const elHours = document.getElementById('cdHours');
  const elMinutes = document.getElementById('cdMinutes');
  const elSeconds = document.getElementById('cdSeconds');
  const countdownBox = document.getElementById('countdown');
  const congrats = document.getElementById('congratsText');

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const diff = WEDDING_DATE.getTime() - Date.now();
    if (diff <= 0) {
      countdownBox.style.display = 'none';
      congrats.style.display = 'block';
      return;
    }
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    elDays.textContent = pad(days);
    elHours.textContent = pad(hours);
    elMinutes.textContent = pad(minutes);
    elSeconds.textContent = pad(seconds);
  }
  tick();
  setInterval(tick, 1000);
})();

// ============ Add to calendar (.ics download + Google Calendar link) ============
(function initCalendar() {
  function toICSDate(d) {
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }
  document.getElementById('addCalendarBtn').addEventListener('click', () => {
    const start = WEDDING_DATE;
    const end = new Date(WEDDING_DATE.getTime() + 3 * 3600000);
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${toICSDate(start)}`,
      `DTEND:${toICSDate(end)}`,
      `SUMMARY:${WEDDING_TITLE}`,
      `LOCATION:${VENUE_TEXT}`,
      'DESCRIPTION:You are cordially invited to our wedding ceremony.',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wedding-invitation.ics';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });
})();

// ============ Open in Google Maps ============
(function initMapsButton() {
  document.getElementById('openMapsBtn').addEventListener('click', () => {
    window.open(MAPS_URL, '_blank', 'noopener');
  });
})();

// ============ QR codes (location + gift placeholder) ============
function redrawMapQr() {
  if (typeof QRCode === 'undefined') return;
  QRCode.toCanvas(document.getElementById('mapQr'), MAPS_URL, { width: 160, margin: 1 }, () => {});
}
(function initQrCodes() {
  if (typeof QRCode === 'undefined') return;
  redrawMapQr();
  QRCode.toCanvas(
    document.getElementById('giftQr'),
    'Sample placeholder QR. Replace with your own KHQR image from your bank app.',
    { width: 180, margin: 1 },
    () => {}
  );
})();

// ============ Apply dynamic content once render-content.js resolves it ============
document.addEventListener('wedding:content-ready', (e) => {
  const { weddingDate, venueText, mapsUrl } = e.detail;
  if (weddingDate && !isNaN(weddingDate.getTime())) WEDDING_DATE = weddingDate;
  if (venueText) VENUE_TEXT = venueText.en || VENUE_TEXT;
  if (mapsUrl) MAPS_URL = mapsUrl;
  redrawMapQr();
});

// ============ Currency toggle (display only) ============
(function initCurrencyToggle() {
  document.querySelectorAll('.currency-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.currency-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
})();

// ============ Gallery placeholders + lightbox ============
(function initGallery() {
  const grid = document.getElementById('galleryGrid');
  const lightbox = document.getElementById('lightbox');
  const content = document.getElementById('lightboxContent');
  const lightboxCloseBtn = document.getElementById('lightboxClose');
  const TILE_COUNT = 6;

  for (let i = 0; i < TILE_COUNT; i++) {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.setAttribute('role', 'button');
    tile.setAttribute('tabindex', '0');
    tile.setAttribute('aria-label', 'View photo placeholder / មើលរូបភាពគំរូ');
    tile.innerHTML = `<svg viewBox="0 0 24 24" width="28" height="28"><path fill="currentColor" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>`;
    const openTile = () => {
      content.innerHTML = tile.innerHTML;
      content.style.display = 'flex';
      content.style.alignItems = 'center';
      content.style.justifyContent = 'center';
      content.style.background = 'linear-gradient(160deg, #efd9c4, #cbb59f)';
      content.style.color = '#fff';
      openLightbox(tile);
    };
    tile.addEventListener('click', openTile);
    tile.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openTile();
      }
    });
    grid.appendChild(tile);
  }

  // Moves focus into the modal on open and back to the triggering tile on
  // close, since a lightbox that just appears visually leaves keyboard and
  // screen-reader users stranded on a tile underneath it.
  function openLightbox(triggerEl) {
    lightbox._triggerEl = triggerEl;
    lightbox.classList.add('open');
    lightboxCloseBtn.focus();
  }
  window.openLightbox = openLightbox;

  function closeLightbox() {
    if (!lightbox.classList.contains('open')) return;
    lightbox.classList.remove('open');
    const trigger = lightbox._triggerEl;
    lightbox._triggerEl = null;
    if (trigger && typeof trigger.focus === 'function') trigger.focus();
  }

  lightboxCloseBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
  // The close button is the only focusable element inside the dialog, so
  // Tab/Shift+Tab should simply keep focus pinned there while it's open.
  lightbox.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      lightboxCloseBtn.focus();
    }
  });
})();

// ============ Bottom nav scroll-spy + smooth scroll ============
(function initBottomNav() {
  const navItems = document.querySelectorAll('.nav-item');
  const sectionIds = ['splash', 'schedule', 'location', 'gallery', 'wishes'];
  const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(item.dataset.target);
      if (!target) return;
      if (target.closest('.main-content.hidden')) {
        document.getElementById('mainContent').classList.remove('hidden');
      }
      target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navItems.forEach(i => i.classList.toggle('active', i.dataset.target === entry.target.id));
      }
    });
  }, { rootMargin: '-40% 0px -40% 0px' });

  sections.forEach(s => observer.observe(s));
})();

// ============ Scroll-to-top button ============
(function initScrollTop() {
  const btn = document.getElementById('scrollTopBtn');
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 600);
  });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

// ============ Falling petals background ============
(function initPetals() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const bg = document.createElement('div');
  bg.className = 'petals-bg';
  bg.setAttribute('aria-hidden', 'true');
  const PETAL_COUNT = 16;
  for (let i = 0; i < PETAL_COUNT; i++) {
    const isFlower = i % 4 === 0;
    const petal = isFlower
      ? (() => {
          const svgNS = 'http://www.w3.org/2000/svg';
          const svg = document.createElementNS(svgNS, 'svg');
          svg.setAttribute('viewBox', '-12 -16 24 32');
          svg.classList.add('petal', 'petal-flower');
          const use = document.createElementNS(svgNS, 'use');
          use.setAttribute('href', '#flower-motif');
          svg.appendChild(use);
          return svg;
        })()
      : document.createElement('span');
    if (!isFlower) petal.className = `petal petal-${(i % 4) + 1}`;
    const left = Math.random() * 100;
    const duration = 11 + Math.random() * 10;
    const delay = Math.random() * -20;
    const drift = (Math.random() * 80 - 40).toFixed(0);
    const size = (isFlower ? 14 + Math.random() * 8 : 10 + Math.random() * 10).toFixed(0);
    petal.style.left = `${left}%`;
    petal.style.width = `${size}px`;
    petal.style.height = `${size}px`;
    petal.style.animationDuration = `${duration}s, ${(3 + Math.random() * 3).toFixed(1)}s`;
    petal.style.animationDelay = `${delay}s, ${delay}s`;
    petal.style.setProperty('--drift', `${drift}px`);
    bg.appendChild(petal);
  }
  document.body.appendChild(bg);
})();

// ============ Scroll-reveal fade-in for sections ============
(function initScrollReveal() {
  const targets = document.querySelectorAll('.screen, .site-footer');
  if (!('IntersectionObserver' in window) || !targets.length) {
    targets.forEach(t => t.classList.add('in-view'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  targets.forEach(t => observer.observe(t));
})();
