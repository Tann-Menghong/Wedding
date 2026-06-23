import { firebaseConfig } from './firebase-config.js';

const form = document.getElementById('wishForm');
const nameInput = document.getElementById('wishName');
const messageInput = document.getElementById('wishMessage');
const submitBtn = document.getElementById('wishSubmitBtn');
const statusEl = document.getElementById('wishStatus');
const listEl = document.getElementById('wishList');
const rsvpButtons = document.querySelectorAll('#rsvpToggle .rsvp-btn');

const isConfigured = firebaseConfig.apiKey !== 'YOUR_API_KEY';

let selectedAttending = null;
rsvpButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    selectedAttending = btn.dataset.attending;
    rsvpButtons.forEach(b => b.classList.toggle('selected', b === btn));
  });
});

function resetRsvp() {
  selectedAttending = null;
  rsvpButtons.forEach(b => b.classList.remove('selected'));
}

function setStatus(text) {
  statusEl.textContent = text;
}

function renderEmpty(text) {
  listEl.innerHTML = '';
  const p = document.createElement('p');
  p.className = 'wish-empty';
  p.textContent = text;
  listEl.appendChild(p);
}

function renderWishes(wishes) {
  listEl.innerHTML = '';
  if (wishes.length === 0) {
    renderEmpty('Be the first to send your wishes! / សូមជាអ្នកដំបូងផ្ញើសារជូនពរ!');
    return;
  }
  wishes.forEach(({ name, message, attending, createdAt }) => {
    const card = document.createElement('div');
    card.className = 'wish-card';

    const nameEl = document.createElement('p');
    nameEl.className = 'wish-name';
    nameEl.textContent = name; // textContent only — never innerHTML with user data

    const attendingEl = document.createElement('p');
    attendingEl.className = attending ? 'wish-attending yes' : 'wish-attending no';
    attendingEl.textContent = attending ? '✓ Attending / ចូលរួម' : '✗ Not attending / បដិសេធ';

    const msgEl = document.createElement('p');
    msgEl.className = 'wish-msg';
    msgEl.textContent = message;

    const timeEl = document.createElement('p');
    timeEl.className = 'wish-time';
    timeEl.textContent = createdAt ? new Date(createdAt).toLocaleString() : 'just now';

    card.append(nameEl, attendingEl, msgEl, timeEl);
    listEl.appendChild(card);
  });
}

if (!isConfigured) {
  renderEmpty('Guest wishes are not connected yet. Configure Firebase in js/firebase-config.js (see README.md) to enable this feature.');
  submitBtn.disabled = true;
  setStatus('');
} else {
  initFirebase();
}

async function initFirebase() {
  try {
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
    const {
      getFirestore, collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp
    } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const wishesRef = collection(db, 'wishes');

    const wishesQuery = query(wishesRef, orderBy('createdAt', 'desc'), limit(50));
    onSnapshot(wishesQuery, (snapshot) => {
      const wishes = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          name: data.name,
          message: data.message,
          attending: data.attending === true,
          createdAt: data.createdAt ? data.createdAt.toMillis() : null
        };
      });
      renderWishes(wishes);
    }, (err) => {
      console.error('Failed to load wishes', err);
      renderEmpty('Could not load wishes right now. Please try again later.');
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = nameInput.value.trim();
      const message = messageInput.value.trim();
      if (!name || !message) return;
      if (!selectedAttending) {
        setStatus('Please confirm your attendance. / សូមបញ្ជាក់ពីវត្តមានអ្នក។');
        return;
      }

      submitBtn.disabled = true;
      setStatus('Sending… / កំពុងផ្ញើ...');
      try {
        await addDoc(wishesRef, {
          name: name.slice(0, 50),
          message: message.slice(0, 300),
          attending: selectedAttending === 'yes',
          createdAt: serverTimestamp()
        });
        form.reset();
        resetRsvp();
        setStatus('Thank you for your wishes! / អរគុណសម្រាប់សារជូនពរ!');
      } catch (err) {
        console.error('Failed to send wish', err);
        setStatus('Something went wrong. Please try again.');
      } finally {
        submitBtn.disabled = false;
      }
    });
  } catch (err) {
    console.error('Firebase init failed', err);
    renderEmpty('Could not connect to the guestbook service.');
  }
}
