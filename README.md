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
- Couple photo hero with a live countdown to the ceremony
- Program schedule timeline
- Location section with an embedded Google Map, "Open in Maps" button, and a generated QR code
- Photo gallery with lightbox
- Gift/KHQR section with a sample placeholder QR code
- **Guest wishes (guestbook)** backed by Firebase Firestore — fully functional once configured
- Sticky bottom navigation with scroll-spy + a scroll-to-top button

All text content is placeholder data transcribed from the reference design. Replace it with
your own details before publishing — see below.

## 1. Run it locally

No build step needed. From the `website/` folder, serve it with any static server, e.g.:

```bash
npx serve .
# or
python3 -m http.server 8080
```

Then open `http://localhost:8080` (or the port shown).

## 2. Replace the placeholder content

- **Names, parents, dates, venue, schedule:** edit the text directly in `index.html`
  (search for the Khmer/English text blocks — each has a `.km` and `.en` version).
- **Wedding date/time:** update `WEDDING_DATE` at the top of `js/app.js` (used by the
  countdown and the "Add to Calendar" button).
- **Venue / map:** the map is a placeholder centered on Phnom Penh. Replace `MAPS_URL` in
  `js/app.js` with your real venue's Google Maps link (share a place from Google Maps to get
  one), and update the `src` of the `<iframe>` in the Location section of `index.html` the
  same way (`https://www.google.com/maps?q=YOUR+ADDRESS&output=embed`).
- **Photos:** the hero photo and gallery are styled placeholder boxes (no real photos were
  used, since this is a generic template). Drop your own images into an `assets/` folder and
  swap the `.photo-placeholder` div and the generated `.tile` elements in `js/app.js`
  (`initGallery`) for `<img>` tags.
- **Background music (optional):** add an audio file to `assets/` and add a `<source>` tag
  inside the `<audio id="bgMusic">` element in `index.html`.
- **Gift QR code:** the QR under "Send a Gift" is a harmless placeholder (it encodes a note,
  not a real payment link). Replace it with an `<img>` of your bank's real KHQR code when
  you're ready — don't reuse the generated placeholder for actual payments.

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
   deleting other people's messages, and validates field sizes server-side.
6. Reload the site — the "Connect Firebase..." notice in the Wishes section will be replaced
   by a working form and live message feed.

Until you complete this setup, the Wishes section will show a friendly placeholder message
and the form will be disabled — the rest of the site works fine without it.

### A note on abuse protection

A public guestbook on a free-tier database can attract spam. The rules above cap message
length and require valid fields, which covers the basics. If you expect a very public link
(shared widely, indexed by search engines, etc.) consider adding Firebase App Check or a
simple CAPTCHA before going live.

## 4. Personalized invitation links

Share links like `index.html?to=Sok%20Keanvisal` to show a personalized guest name on the
splash screen ("We respectfully invite Sok Keanvisal"). Falls back to "Honored Guest" /
"ភ្ញៀវកិត្តិយស" if no `to` param is given.

## 5. Deploy

Any static host works since there's no build step:

- **GitHub Pages:** enable Pages for this repo, pointing at the `website/` folder (or push it
  to its own branch/repo root).
- **Netlify / Vercel:** drag-and-drop the `website/` folder, or connect the repo and set the
  publish directory to `website`.
- **Hugging Face Spaces:** create a new Space with the "Static HTML" SDK, then push the
  contents of this `website/` folder (including this `README.md`, which already has the
  required `sdk: static` frontmatter) to the Space's git repo as its root.

## File structure

```
website/
├── index.html          all markup/sections
├── css/style.css        styling (blush/cream/gold floral theme)
├── js/app.js            language toggle, countdown, calendar, maps, QR codes, gallery, nav
├── js/firebase-config.js  your Firebase project keys (placeholders by default)
├── js/wishes.js          guestbook logic (Firestore read/write)
└── firestore.rules      recommended security rules for the wishes collection
```
