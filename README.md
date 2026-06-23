---
title: Tann Menghong & Ouk Sokha Wedding
emoji: 💍
colorFrom: pink
colorTo: yellow
sdk: static
pinned: false
---

# Wedding Invitation Website

A mobile-first, single-page digital wedding invitation (Khmer/English), inspired by the
provided design. Pure static HTML/CSS/JS — no build step, deployable anywhere (GitHub Pages,
Netlify, Vercel, or any static host).

## What's included

- Splash screen with KH/EN language toggle and personalized guest name via `?to=` URL param
- Date announcement, full invitation details (parents, message, venue), "Add to Calendar" button
- Couple photo hero with a live countdown to the ceremony, plus an ambient falling
  petals/flowers background and soft section fade-in animations
- Program schedule timeline
- Location section with an embedded Google Map, "Open in Maps" button, and a generated QR code
- Photo gallery with lightbox
- Gift/KHQR section with a sample placeholder QR code
- **Guest wishes (guestbook)** backed by Firebase Firestore — fully functional once configured
- **Admin page** (`admin.html`) to edit the couple/date/venue/messages/schedule text and upload
  the hero + gallery photos, backed by Firebase Auth + Firestore + Storage
- Sticky bottom navigation with scroll-spy + a scroll-to-top button

All text content is placeholder data transcribed from the reference design. Replace it with
your own details before publishing — see below.

## 1. Run it locally

No build step needed. Serve the repo root with any static server, e.g.:

```bash
npx serve .
# or
python3 -m http.server 8080
```

Then open `http://localhost:8080` (or the port shown).

## 2. Replace the placeholder content

Once Firebase is configured (see sections 3 and 4 below), the easiest way to edit content is
the **admin page** at `/admin.html` — it covers couple names, the wedding date/time, venue
text, invitation/thank-you/footer messages, the schedule, and photo uploads, and changes show
up on the site immediately without touching any code.

A few things stay as plain template copy you edit directly in `index.html`/`css/style.css`
(section titles, nav labels, parent-name labels, the map note, the gift QR caption):

- **Background music (optional):** add an audio file to an `assets/` folder and add a
  `<source>` tag inside the `<audio id="bgMusic">` element in `index.html`.
- **Gift QR code:** the QR under "Send a Gift" is a harmless placeholder (it encodes a note,
  not a real payment link). Replace it with an `<img>` of your bank's real KHQR code when
  you're ready — don't reuse the generated placeholder for actual payments.

If you don't configure Firebase at all, the site still works fine — every editable field
simply falls back to the defaults baked into `js/site-content.js`.

## 3. Enable the guest wishes feature (Firebase Firestore)

The guestbook works out of the box once you connect a free Firebase project:

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and create a
   new project (free Spark plan is enough).
2. In the project, go to **Build → Firestore Database → Create database** (start in
   production mode).
3. Go to **Project settings → General → Your apps**, click the web icon (`</>`) to register
   a web app, and copy the config object it gives you.
4. Paste those values into `js/firebase-config.js`, replacing the `YOUR_...` placeholders.
5. In **Firestore Database → Rules**, paste the contents of `firestore.rules` (in this folder)
   and publish. This allows anyone to read wishes and submit a new one, but blocks editing or
   deleting other people's messages, and validates field sizes server-side. It also includes
   the `site/{docId}` rule needed by the admin page (section 4).
6. Reload the site — the "Connect Firebase..." notice in the Wishes section will be replaced
   by a working form and live message feed.

Until you complete this setup, the Wishes section will show a friendly placeholder message
and the form will be disabled — the rest of the site works fine without it.

### A note on abuse protection

A public guestbook on a free-tier database can attract spam. The rules above cap message
length and require valid fields, which covers the basics. If you expect a very public link
(shared widely, indexed by search engines, etc.) consider adding Firebase App Check or a
simple CAPTCHA before going live.

## 4. Enable the admin page (Firebase Auth + Storage)

The admin page reuses the same Firebase project as the guestbook, plus Authentication and
Storage:

1. Complete section 3 first (Firestore must already be set up).
2. In the Firebase console, go to **Build → Authentication → Sign-in method** and enable the
   **Email/Password** provider.
3. Go to **Authentication → Users → Add user** and create your own admin login (your email +
   a strong password). There's no public sign-up page — this is the only account that can sign in.
4. Go to **Build → Storage → Get started** to provision a Storage bucket.
5. In **Storage → Rules**, paste the contents of `storage.rules` (in this folder) and publish.
   This allows public read access (so guests' browsers can load the photos) but only allows
   writes from a signed-in user, and validates the file is an image under 10 MB.
6. Make sure `firestore.rules` (with the `site/{docId}` block) has been published too.
7. Visit `/admin.html`, sign in with the user from step 3, edit the content, and upload the
   hero/gallery photos. Text edits save when you click **Save All Changes**; photo uploads and
   removals save immediately.

If Firebase isn't configured yet, `/admin.html` shows a setup notice instead of the login form.

## 5. Personalized invitation links

Share links like `index.html?to=Sok%20Keanvisal` to show a personalized guest name on the
splash screen ("We respectfully invite Sok Keanvisal"). Falls back to "Honored Guest" /
"ភ្ញៀវកិត្តិយស" if no `to` param is given.

## 6. Deploy

Any static host works since there's no build step:

- **GitHub Pages:** this repo includes `.github/workflows/deploy-pages.yml`, which deploys the
  repo root to GitHub Pages on every push to `main`. Enable it once under
  **Settings → Pages → Build and deployment → Source → GitHub Actions**.
- **Netlify / Vercel:** connect the repo and deploy with the repo root as the publish directory.
- **Hugging Face Spaces:** create a new Space with the "Static HTML" SDK, then push the
  contents of this repo (including this `README.md`, which already has the required
  `sdk: static` frontmatter) to the Space's git repo as its root.

## File structure

```
index.html               all markup/sections, including admin link in the footer
admin.html                admin dashboard (Firebase Auth login + content editor)
css/style.css             public site styling (blush/cream/gold floral theme, animations)
css/admin.css             admin dashboard styling
js/app.js                 language toggle, countdown, calendar, maps, QR codes, gallery, nav, petals
js/wishes.js              guestbook logic (Firestore read/write)
js/admin.js               admin auth, content editing, photo uploads (Firestore + Storage)
js/site-content.js        default content + Khmer date helpers + Firestore content loader
js/render-content.js      applies loaded content to the public page on load
js/firebase-init.js       shared Firebase app singleton (avoids duplicate-init across scripts)
js/firebase-config.js     your Firebase project keys (placeholders by default)
firestore.rules           security rules for the wishes collection + admin-managed site content
storage.rules             security rules for hero/gallery photo uploads
```
