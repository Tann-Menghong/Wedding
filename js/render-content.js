import { loadSiteContent, describeDate } from './site-content.js';

function setKmEn(container, value) {
  if (!container || !value) return;
  const kmEl = container.querySelector('.km');
  const enEl = container.querySelector('.en');
  if (kmEl) kmEl.textContent = value.km;
  if (enEl) enEl.textContent = value.en;
}

function setText(selector, value) {
  document.querySelectorAll(selector).forEach(el => { el.textContent = value; });
}

function setKmEnAll(selector, value) {
  document.querySelectorAll(selector).forEach(el => setKmEn(el, value));
}

function buildTimeline(schedule) {
  const ol = document.getElementById('timeline');
  if (!ol || !Array.isArray(schedule) || !schedule.length) return;
  ol.innerHTML = '';
  schedule.forEach(item => {
    const li = document.createElement('li');
    const timeKm = document.createElement('span');
    timeKm.className = 'time km';
    timeKm.textContent = item.timeKm || '';
    const timeEn = document.createElement('span');
    timeEn.className = 'time en';
    timeEn.textContent = item.timeEn || '';
    const pKm = document.createElement('p');
    pKm.className = 'km';
    pKm.textContent = item.textKm || '';
    const pEn = document.createElement('p');
    pEn.className = 'en';
    pEn.textContent = item.textEn || '';
    li.append(timeKm, timeEn, pKm, pEn);
    ol.appendChild(li);
  });
}

function openLightboxImage(url, triggerEl) {
  const content = document.getElementById('lightboxContent');
  content.innerHTML = '';
  content.style.display = '';
  content.style.background = '';
  content.style.color = '';
  const img = document.createElement('img');
  img.src = url;
  img.alt = '';
  img.style.width = '100%';
  img.style.height = '100%';
  img.style.objectFit = 'cover';
  content.appendChild(img);
  window.openLightbox(triggerEl);
}

function buildGallery(urls) {
  const grid = document.getElementById('galleryGrid');
  if (!grid || !Array.isArray(urls) || !urls.length) return false;
  grid.innerHTML = '';
  urls.forEach(url => {
    const tile = document.createElement('div');
    tile.className = 'tile photo-tile';
    tile.setAttribute('role', 'button');
    tile.setAttribute('tabindex', '0');
    tile.setAttribute('aria-label', 'View photo / មើលរូបភាព');
    const img = document.createElement('img');
    img.src = url;
    img.alt = '';
    img.loading = 'lazy';
    tile.appendChild(img);
    tile.addEventListener('click', () => openLightboxImage(url, tile));
    tile.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightboxImage(url, tile);
      }
    });
    grid.appendChild(tile);
  });
  return true;
}

function setHeroPhoto(url) {
  if (!url) return;
  const placeholder = document.querySelector('.hero-img');
  if (!placeholder) return;
  placeholder.innerHTML = '';
  placeholder.classList.add('has-photo');
  const img = document.createElement('img');
  img.src = url;
  img.alt = '';
  img.className = 'hero-photo-img';
  placeholder.appendChild(img);
}

(async function init() {
  const content = await loadSiteContent();
  const date = describeDate(content.weddingDateISO);

  setKmEnAll('[data-content="coupleScript"]', content.coupleScript);
  setText('[data-content="groomName"]', content.groomName);
  setText('[data-content="brideName"]', content.brideName);
  setKmEnAll('[data-content="invitationMessage"]', content.invitationMessage);
  setKmEnAll('[data-content="venueText"]', content.venueText);
  setKmEnAll('[data-content="thanksMessage"]', content.thanksMessage);
  setKmEnAll('[data-content="footerText"]', content.footerText);

  setKmEnAll('[data-content="dateWeekday"]', { km: date.weekdayKm, en: date.weekdayEn });
  setText('[data-content="dateNum"]', date.dayNumKm);
  setKmEnAll('[data-content="dateMonth"]', { km: date.monthKm, en: date.monthEn });
  setText('[data-content="dateYear"]', date.yearKm);
  document.querySelectorAll('[data-content="dateGregorian"]').forEach(el => {
    el.textContent = '';
    el.append(date.gregorianPrefix);
    const sup = document.createElement('sup');
    sup.textContent = date.gregorianSuffix;
    el.append(sup, ` ${date.gregorianTail}`);
  });
  setKmEnAll('[data-content="scheduleDate"]', { km: date.scheduleDateKm, en: date.scheduleDateEn });

  buildTimeline(content.schedule);
  const hadGallery = buildGallery(content.gallery);
  setHeroPhoto(content.heroPhotoUrl);

  const mapsLinkUrl = `https://www.google.com/maps?q=${encodeURIComponent(content.mapQuery)}`;
  const mapsEmbedUrl = `${mapsLinkUrl}&output=embed`;
  const iframe = document.querySelector('.map-embed iframe');
  if (iframe) iframe.src = mapsEmbedUrl;

  document.dispatchEvent(new CustomEvent('wedding:content-ready', {
    detail: {
      weddingDate: new Date(content.weddingDateISO),
      venueText: content.venueText,
      mapsUrl: mapsLinkUrl,
      hadGallery
    }
  }));
})();
