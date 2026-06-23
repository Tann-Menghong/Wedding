// ============ Config ============
const WEDDING_DATE = new Date('2026-12-26T17:00:00+07:00');
const WEDDING_TITLE = 'Wedding of Tann Menghong & Ouk Sokha';
const VENUE_TEXT = 'Tuol Domnak Village, Cambodia';
const MAPS_URL = `https://www.google.com/maps?q=${encodeURIComponent('ភូមិទួលដំណាក់, Cambodia')}`;

// ============ Language toggle ============
function setLang(lang) {
  document.documentElement.setAttribute('data-lang', lang);
  document.documentElement.setAttribute('lang', lang);
  localStorage.setItem('wedding-lang', lang);
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
      congrats.textContent = 'Congratulations to the newlyweds! 🎉';
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
(function initQrCodes() {
  if (typeof QRCode === 'undefined') return;
  QRCode.toCanvas(document.getElementById('mapQr'), MAPS_URL, { width: 160, margin: 1 }, () => {});
  QRCode.toCanvas(
    document.getElementById('giftQr'),
    'Sample placeholder QR. Replace with your own KHQR image from your bank app.',
    { width: 180, margin: 1 },
    () => {}
  );
})();

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
  const TILE_COUNT = 6;

  for (let i = 0; i < TILE_COUNT; i++) {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.innerHTML = `<svg viewBox="0 0 24 24" width="28" height="28"><path fill="currentColor" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>`;
    tile.addEventListener('click', () => {
      content.innerHTML = tile.innerHTML;
      content.style.display = 'flex';
      content.style.alignItems = 'center';
      content.style.justifyContent = 'center';
      content.style.background = 'linear-gradient(160deg, #efd9c4, #cbb59f)';
      content.style.color = '#fff';
      lightbox.classList.add('open');
    });
    grid.appendChild(tile);
  }

  document.getElementById('lightboxClose').addEventListener('click', () => {
    lightbox.classList.remove('open');
  });
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) lightbox.classList.remove('open');
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
