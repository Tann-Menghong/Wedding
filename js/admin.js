import { isFirebaseConfigured, getFirebaseApp, FIREBASE_CDN } from './firebase-init.js';
import { DEFAULTS } from './site-content.js';

const notConfiguredView = document.getElementById('notConfiguredView');
const authView = document.getElementById('authView');
const dashboardView = document.getElementById('dashboardView');

if (!isFirebaseConfigured) {
  notConfiguredView.classList.remove('hidden');
} else {
  initAdmin();
}

async function initAdmin() {
  const app = await getFirebaseApp();
  const authMod = await import(`${FIREBASE_CDN}/firebase-auth.js`);
  const firestoreMod = await import(`${FIREBASE_CDN}/firebase-firestore.js`);
  const storageMod = await import(`${FIREBASE_CDN}/firebase-storage.js`);

  const { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } = authMod;
  const { getFirestore, doc, getDoc, setDoc } = firestoreMod;
  const { getStorage, ref, uploadBytes, getDownloadURL } = storageMod;

  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);

  let content = JSON.parse(JSON.stringify(DEFAULTS));

  // ---------- DOM refs ----------
  const loginForm = document.getElementById('loginForm');
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  const loginError = document.getElementById('loginError');
  const signOutBtn = document.getElementById('signOutBtn');
  const saveAllBtn = document.getElementById('saveAllBtn');
  const saveStatus = document.getElementById('saveStatus');
  const scheduleRowsEl = document.getElementById('scheduleRows');
  const addScheduleRowBtn = document.getElementById('addScheduleRow');
  const heroPreview = document.getElementById('heroPreview');
  const heroFileInput = document.getElementById('heroFileInput');
  const heroStatus = document.getElementById('heroStatus');
  const galleryThumbs = document.getElementById('galleryThumbs');
  const galleryFileInput = document.getElementById('galleryFileInput');
  const galleryStatus = document.getElementById('galleryStatus');

  const fields = {
    coupleScriptKm: document.getElementById('coupleScriptKm'),
    coupleScriptEn: document.getElementById('coupleScriptEn'),
    groomName: document.getElementById('groomName'),
    brideName: document.getElementById('brideName'),
    weddingDateISO: document.getElementById('weddingDateISO'),
    mapQuery: document.getElementById('mapQuery'),
    invitationMessageKm: document.getElementById('invitationMessageKm'),
    invitationMessageEn: document.getElementById('invitationMessageEn'),
    venueTextKm: document.getElementById('venueTextKm'),
    venueTextEn: document.getElementById('venueTextEn'),
    thanksMessageKm: document.getElementById('thanksMessageKm'),
    thanksMessageEn: document.getElementById('thanksMessageEn'),
    footerTextKm: document.getElementById('footerTextKm'),
    footerTextEn: document.getElementById('footerTextEn')
  };

  onAuthStateChanged(auth, (user) => {
    authView.classList.toggle('hidden', !!user);
    dashboardView.classList.toggle('hidden', !user);
    if (user) loadContent();
  });

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.textContent = '';
    try {
      await signInWithEmailAndPassword(auth, loginEmail.value.trim(), loginPassword.value);
    } catch (err) {
      loginError.textContent = 'Sign in failed. Check your email and password.';
    }
  });

  signOutBtn.addEventListener('click', () => signOut(auth));

  async function loadContent() {
    const merged = JSON.parse(JSON.stringify(DEFAULTS));
    try {
      const snap = await getDoc(doc(db, 'site', 'content'));
      if (snap.exists()) Object.assign(merged, snap.data());
    } catch (err) {
      console.error('Failed to load site content', err);
    }
    content = merged;
    populateForm();
  }

  function populateForm() {
    fields.coupleScriptKm.value = content.coupleScript.km;
    fields.coupleScriptEn.value = content.coupleScript.en;
    fields.groomName.value = content.groomName;
    fields.brideName.value = content.brideName;
    fields.weddingDateISO.value = content.weddingDateISO;
    fields.mapQuery.value = content.mapQuery;
    fields.invitationMessageKm.value = content.invitationMessage.km;
    fields.invitationMessageEn.value = content.invitationMessage.en;
    fields.venueTextKm.value = content.venueText.km;
    fields.venueTextEn.value = content.venueText.en;
    fields.thanksMessageKm.value = content.thanksMessage.km;
    fields.thanksMessageEn.value = content.thanksMessage.en;
    fields.footerTextKm.value = content.footerText.km;
    fields.footerTextEn.value = content.footerText.en;

    scheduleRowsEl.innerHTML = '';
    content.schedule.forEach(addScheduleRow);

    renderHeroPreview();
    renderGalleryThumbs();
  }

  function addScheduleRow(item) {
    const data = item || { timeKm: '', timeEn: '', textKm: '', textEn: '' };
    const row = document.createElement('div');
    row.className = 'schedule-row';

    const timeKm = makeInput('timeKm', data.timeKm, 'Time (Khmer)');
    const timeEn = makeInput('timeEn', data.timeEn, 'Time (English)');
    const textKm = makeInput('textKm', data.textKm, 'Description (Khmer)');
    const textEn = makeInput('textEn', data.textEn, 'Description (English)');

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-row';
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', () => row.remove());

    row.append(timeKm, timeEn, textKm, textEn, removeBtn);
    scheduleRowsEl.appendChild(row);
  }

  function makeInput(field, value, placeholder) {
    const input = document.createElement('input');
    input.type = 'text';
    input.dataset.field = field;
    input.value = value || '';
    input.placeholder = placeholder;
    return input;
  }

  addScheduleRowBtn.addEventListener('click', () => addScheduleRow(null));

  function renderHeroPreview() {
    heroPreview.innerHTML = '';
    if (content.heroPhotoUrl) {
      const img = document.createElement('img');
      img.src = content.heroPhotoUrl;
      img.alt = '';
      heroPreview.appendChild(img);
    } else {
      heroPreview.textContent = 'No photo yet';
    }
  }

  function renderGalleryThumbs() {
    galleryThumbs.innerHTML = '';
    content.gallery.forEach((url, index) => {
      const thumb = document.createElement('div');
      thumb.className = 'thumb';
      const img = document.createElement('img');
      img.src = url;
      img.alt = '';
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'remove-thumb';
      removeBtn.textContent = '×';
      removeBtn.addEventListener('click', () => removeGalleryPhoto(index));
      thumb.append(img, removeBtn);
      galleryThumbs.appendChild(thumb);
    });
  }

  async function saveField(partial) {
    await setDoc(doc(db, 'site', 'content'), partial, { merge: true });
    Object.assign(content, partial);
  }

  heroFileInput.addEventListener('change', async () => {
    const file = heroFileInput.files[0];
    if (!file) return;
    heroStatus.textContent = 'Uploading…';
    try {
      const path = `site/hero-${Date.now()}-${file.name}`;
      const fileRef = ref(storage, path);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      await saveField({ heroPhotoUrl: url });
      renderHeroPreview();
      heroStatus.textContent = 'Saved.';
    } catch (err) {
      console.error('Hero upload failed', err);
      heroStatus.textContent = 'Upload failed. Please try again.';
    } finally {
      heroFileInput.value = '';
    }
  });

  galleryFileInput.addEventListener('change', async () => {
    const files = Array.from(galleryFileInput.files || []);
    if (!files.length) return;
    galleryStatus.textContent = 'Uploading…';
    try {
      const urls = await Promise.all(files.map(async (file, i) => {
        const path = `site/gallery-${Date.now()}-${i}-${file.name}`;
        const fileRef = ref(storage, path);
        await uploadBytes(fileRef, file);
        return getDownloadURL(fileRef);
      }));
      const gallery = content.gallery.concat(urls);
      await saveField({ gallery });
      renderGalleryThumbs();
      galleryStatus.textContent = 'Saved.';
    } catch (err) {
      console.error('Gallery upload failed', err);
      galleryStatus.textContent = 'Upload failed. Please try again.';
    } finally {
      galleryFileInput.value = '';
    }
  });

  async function removeGalleryPhoto(index) {
    const gallery = content.gallery.slice();
    gallery.splice(index, 1);
    try {
      await saveField({ gallery });
      renderGalleryThumbs();
    } catch (err) {
      console.error('Failed to remove photo', err);
      galleryStatus.textContent = 'Could not remove photo. Please try again.';
    }
  }

  saveAllBtn.addEventListener('click', async () => {
    const isoValue = fields.weddingDateISO.value.trim();
    if (isNaN(new Date(isoValue).getTime())) {
      saveStatus.textContent = 'Wedding date is not a valid date — fix it before saving.';
      return;
    }

    const schedule = Array.from(scheduleRowsEl.querySelectorAll('.schedule-row')).map(row => ({
      timeKm: row.querySelector('[data-field="timeKm"]').value,
      timeEn: row.querySelector('[data-field="timeEn"]').value,
      textKm: row.querySelector('[data-field="textKm"]').value,
      textEn: row.querySelector('[data-field="textEn"]').value
    }));

    const updated = {
      coupleScript: { km: fields.coupleScriptKm.value, en: fields.coupleScriptEn.value },
      groomName: fields.groomName.value,
      brideName: fields.brideName.value,
      weddingDateISO: isoValue,
      mapQuery: fields.mapQuery.value,
      invitationMessage: { km: fields.invitationMessageKm.value, en: fields.invitationMessageEn.value },
      venueText: { km: fields.venueTextKm.value, en: fields.venueTextEn.value },
      thanksMessage: { km: fields.thanksMessageKm.value, en: fields.thanksMessageEn.value },
      footerText: { km: fields.footerTextKm.value, en: fields.footerTextEn.value },
      schedule,
      heroPhotoUrl: content.heroPhotoUrl,
      gallery: content.gallery
    };

    saveStatus.textContent = 'Saving…';
    try {
      await setDoc(doc(db, 'site', 'content'), updated, { merge: true });
      content = updated;
      saveStatus.textContent = 'All changes saved.';
    } catch (err) {
      console.error('Failed to save site content', err);
      saveStatus.textContent = 'Save failed. Please try again.';
    }
  });
}
