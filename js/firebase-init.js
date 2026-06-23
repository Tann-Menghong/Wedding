import { firebaseConfig } from './firebase-config.js';

export const isFirebaseConfigured = firebaseConfig.apiKey !== 'YOUR_API_KEY';

const FIREBASE_VERSION = '10.12.2';
export const FIREBASE_CDN = `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}`;

let appPromise = null;

// Multiple module scripts (wishes.js, render-content.js, admin.js) can run on the
// same page; initializeApp() throws if called twice, so the app instance is shared.
export function getFirebaseApp() {
  if (!isFirebaseConfigured) return Promise.resolve(null);
  if (!appPromise) {
    appPromise = import(`${FIREBASE_CDN}/firebase-app.js`).then(({ initializeApp, getApps, getApp }) =>
      getApps().length ? getApp() : initializeApp(firebaseConfig)
    );
  }
  return appPromise;
}
