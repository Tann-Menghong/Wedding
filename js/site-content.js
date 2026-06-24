import { isFirebaseConfigured, getFirebaseApp, FIREBASE_CDN } from './firebase-init.js';

// Mirrors the hardcoded content originally in index.html/app.js exactly, so the
// site renders identically whether or not Firebase content has been configured.
export const DEFAULTS = {
  weddingDateISO: '2026-12-26T17:00:00+07:00',
  coupleScript: { km: 'ម៉េងហុង & សុខា', en: 'Menghong & Sokha' },
  groomName: 'តាន់ ម៉េងហុង',
  brideName: 'អ៊ុក សុខា',
  mapQuery: 'ភូមិទួលដំណាក់, Cambodia',
  invitationMessage: {
    km: `សម្តេច ទ្រង់ ឯកឧត្តម លោកជំទាវ លោកអ្នកឧកញ៉ា អ្នកឧកញ៉ា ឧកញ៉ា លោក លោកស្រី អ្នកនាង កញ្ញា
ព្រមទាំងប្រិយមិត្តអញ្ជើញចូលរួមជាអធិបតី និងជាភ្ញៀវកិត្តិយស ដើម្បីប្រសិទ្ធិពរជ័យសិរីសួស្តី
ជ័យមង្គល ក្នុងពិធីអាពាហ៍ពិពាហ៍ កូនប្រុសស្រី របស់យើងខ្ញុំទាំងពីរ។`,
    en: `Your Excellency, Oknha, Madam, Ladies and Gentlemen, please join us as the presiding
officers and guests of honor to bestow blessings on our two weddings.`
  },
  venueText: {
    km: 'ស្ថិតនៅ ភូមិទួលដំណាក់\nសូមអញ្ជើញចូលរួមអបអរសាទរជាមួយយើងខ្ញុំ',
    en: 'Held at Tuol Domnak Village.\nWe look forward to celebrating with you.'
  },
  thanksMessage: {
    km: `យើងខ្ញុំទាំងពីរ សូមថ្លែងអំណរគុណ យ៉ាងជ្រាលជ្រៅ ចំពោះវត្តមាន ដ៏ឧត្តុង្គឧត្តមរបស់ សម្តេច ឯកឧត្តម
លោកជំទាវ លោកអ្នកឧកញ៉ា អ្នកឧកញ៉ា ឧកញ៉ា លោក លោកស្រី អ្នកនាង កញ្ញា ដែលបាន អញ្ជើញចូលរួមជាកិត្តិយស
ក្នុងពិធីសិរីសួស្តីអាពាហ៍ពិពាហ៍ របស់យើងខ្ញុំ នាពេលខាងមុខនេះ។ យើងខ្ញុំសូមការខន្តីអភ័យទោស
ដែលពុំបានជូនលិខិតអញ្ជើញ ដោយផ្ទាល់។ ដោយការវកិច្ចដ៏ខ្ពង់ខ្ពស់ពីយើងខ្ញុំ។`,
    en: `We are extremely thankful for H.E., L.C.T., Okhna, ladies and gentlemen for your presence
in the upcoming marriage of our children. We would like to apologize if this invitation
has not been personally delivered by us.`
  },
  footerText: {
    km: 'សូមអរគុណចំពោះការអញ្ជើញចូលរួមជាមួយយើងខ្ញុំ 🤍',
    en: 'Thank you for celebrating with us 🤍'
  },
  heroPhotoUrl: '',
  gallery: [],
  schedule: [
    { timeKm: '០៦:00 ព្រឹក', timeEn: '6:00 AM', textKm: 'ជួបជុំភ្ញៀវកិត្តិយស ដើម្បីរៀបចំហែលជង្គង', textEn: 'Guests gather to prepare the procession' },
    { timeKm: '០៧:00 ព្រឹក', timeEn: '7:00 AM', textKm: 'ពិធីហែលជង្គង (កម្សាន្ត)', textEn: 'Procession ceremony' },
    { timeKm: '០៧:30 ព្រឹក', timeEn: '7:30 AM', textKm: 'ពិធីចូលជូនដំណឹងការ រាប់ផ្លៃលី', textEn: 'Ceremony of presenting to parents' },
    { timeKm: '០៨:30 ព្រឹក', timeEn: '8:30 AM', textKm: 'ពិធីបំពាក់ចិញ្ជៀង', textEn: 'Ring ceremony' },
    { timeKm: '០៩:45 ព្រឹក', timeEn: '9:45 AM', textKm: 'ពិធីកាត់សក់បង្កក់ស្រី', textEn: 'Hair-cutting ceremony' },
    { timeKm: '១០:30 ព្រឹក', timeEn: '10:30 AM', textKm: 'ពិធីបង្វិលពពិល សំពះថ្វាយសែនជង្ហែរ', textEn: 'Candle-circling ceremony' },
    { timeKm: '១១:30 ព្រឹក', timeEn: '11:30 AM', textKm: 'អញ្ជើញភ្ញៀវពិសាអាហារថ្ងៃត្រង់', textEn: 'Lunch reception for guests' },
    { timeKm: '០៥:00 ល្ងាច', timeEn: '5:00 PM', textKm: 'អញ្ជើញភ្ញៀវកិត្តិយសពិសាគោជដាហារ', textEn: 'Evening dinner reception' }
  ]
};

const KHMER_DIGITS = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
const KHMER_WEEKDAYS = ['អាទិត្យ', 'ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];
const KHMER_MONTHS = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
const EN_WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const EN_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function toKhmerNumeral(n) {
  return String(n).split('').map(ch => (ch >= '0' && ch <= '9' ? KHMER_DIGITS[ch] : ch)).join('');
}

function ordinalSuffix(n) {
  const v = n % 100;
  if (v >= 11 && v <= 13) return 'th';
  switch (n % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

function formatHour12(hours, minutes) {
  const period = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${h12}:${String(minutes).padStart(2, '0')} ${period}`;
}

export function describeDate(isoString) {
  // Parse the date/time fields literally from the string (rather than via
  // `new Date(isoString).getHours()` etc.) so the displayed ceremony date
  // and time always show the venue's local wall-clock time, regardless of
  // the timezone of whoever is viewing the page.
  const [, yStr, moStr, dStr, hStr, miStr] = isoString.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  const year = Number(yStr);
  const monthIdx = Number(moStr) - 1;
  const day = Number(dStr);
  const hours = Number(hStr);
  const minutes = Number(miStr);
  const weekdayIdx = new Date(Date.UTC(year, monthIdx, day)).getUTCDay();
  const weekdayEn = EN_WEEKDAYS[weekdayIdx];
  const weekdayKm = KHMER_WEEKDAYS[weekdayIdx];
  const monthEn = EN_MONTHS[monthIdx];
  const monthKm = KHMER_MONTHS[monthIdx];
  const timeStr = formatHour12(hours, minutes);

  return {
    weekdayKm: `ថ្ងៃ ${weekdayKm}`,
    weekdayEn,
    dayNumKm: toKhmerNumeral(day),
    monthKm: `ខែ${monthKm}`,
    monthEn,
    yearKm: toKhmerNumeral(year),
    yearEn: String(year),
    gregorianLine: `${weekdayEn}, ${day}${ordinalSuffix(day)} ${monthEn} ${year} — ${timeStr}`,
    gregorianPrefix: `${weekdayEn}, ${day}`,
    gregorianSuffix: ordinalSuffix(day),
    gregorianTail: `${monthEn} ${year} — ${timeStr}`,
    scheduleDateKm: `កម្មវិធីថ្ងៃ${weekdayKm} ទី${toKhmerNumeral(day)} ខែ${monthKm} ឆ្នាំ${toKhmerNumeral(year)}`,
    scheduleDateEn: `${weekdayEn}, ${day}${ordinalSuffix(day)} ${monthEn} ${year}`
  };
}

export async function loadSiteContent() {
  const merged = JSON.parse(JSON.stringify(DEFAULTS));
  if (!isFirebaseConfigured) return merged;
  try {
    const app = await getFirebaseApp();
    const { getFirestore, doc, getDoc } = await import(`${FIREBASE_CDN}/firebase-firestore.js`);
    const db = getFirestore(app);
    const snap = await getDoc(doc(db, 'site', 'content'));
    if (snap.exists()) {
      Object.assign(merged, snap.data());
    }
  } catch (err) {
    console.error('Failed to load site content, using defaults', err);
  }
  return merged;
}
