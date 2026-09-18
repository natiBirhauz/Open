const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../src/data/realVenuesIsrael.json');
const venues = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

console.log('Initial total venues:', venues.length);

let fixedCount = 0;
let websiteUpdatedCount = 0;

// Explicit mapping for towns misclassified due to 'ים' suffix
const townFixes = [
  { match: 'זיקים', city: 'ashkelon', cityNameHe: 'זיקים' },
  { match: 'חצרים', city: 'beersheba', cityNameHe: 'חצרים' },
  { match: 'רביבים', city: 'beersheba', cityNameHe: 'רביבים' },
  { match: 'נבטים', city: 'beersheba', cityNameHe: 'נבטים' },
  { match: 'כרמים', city: 'beersheba', cityNameHe: 'כרמים' },
  { match: 'באר גנים', city: 'ashkelon', cityNameHe: 'באר גנים' },
  { match: 'אמונים', city: 'ashdod', cityNameHe: 'אמונים' },
  { match: 'שתולים', city: 'ashdod', cityNameHe: 'שתולים' },
  { match: 'עין צורים', city: 'kiryatmalakhi', cityNameHe: 'עין צורים' },
  { match: 'מבקיעים', city: 'ashkelon', cityNameHe: 'מבקיעים' },
  { match: 'ניר בנים', city: 'kiryatgat', cityNameHe: 'ניר בנים' },
  { match: 'גבעת חיים', city: 'hadera', cityNameHe: 'גבעת חיים איחוד' },
  { match: 'אודים', city: 'netanya', cityNameHe: 'אודים' },
  { match: 'שושנת העמקים', city: 'netanya', cityNameHe: 'שושנת העמקים' },
  { match: 'רמות השבים', city: 'sharon', cityNameHe: 'רמות השבים' },
  { match: 'עדנים', city: 'sharon', cityNameHe: 'עדנים' },
  { match: 'צוקים', city: 'south', cityNameHe: 'צוקים' },
  { match: 'הזורעים', city: 'tiberias', cityNameHe: 'הזורעים' },
  { match: 'אדירים', city: 'afula', cityNameHe: 'אדירים' },
  { match: 'תל עדשים', city: 'afula', cityNameHe: 'תל עדשים' },
  { match: 'בית שערים', city: 'afula', cityNameHe: 'בית שערים' },
  { match: 'מכבים', city: 'modiin', cityNameHe: 'מודיעין-מכבים-רעות' },
  { match: 'גבים', city: 'sderot', cityNameHe: 'גבים' },
  { match: 'הגושרים', city: 'kiryatshmona', cityNameHe: 'הגושרים' },
  { match: 'מחניים', city: 'north', cityNameHe: 'מחניים' },
  { match: 'שדות ים', city: 'hadera', cityNameHe: 'שדות ים' }
];

venues.forEach(v => {
  // 1. Fix Brisket Hadera in Haifa
  if (v.id === 'easy-26403175' || (v.nameHe === 'Brisket' && v.address && v.address.includes('חדרה'))) {
    v.city = 'hadera';
    v.cityNameHe = 'חדרה';
    fixedCount++;
  }

  // 2. Fix false Krayot
  if (v.city === 'krayot' && (v.lat < 32.75 || v.lat > 32.95)) {
    let matched = false;
    for (const fix of townFixes) {
      if ((v.address && v.address.includes(fix.match)) || (v.nameHe && v.nameHe.includes(fix.match))) {
        v.city = fix.city;
        v.cityNameHe = fix.cityNameHe;
        matched = true;
        fixedCount++;
        break;
      }
    }
    if (!matched) {
      if (v.lat < 31.6) {
        v.city = 'south';
        v.cityNameHe = v.address || 'דרום הארץ';
      } else if (v.lat > 32.5) {
        v.city = 'north';
        v.cityNameHe = v.address || 'צפון הארץ';
      } else {
        v.city = 'center';
        v.cityNameHe = v.address || 'מרכז הארץ';
      }
      fixedCount++;
    }
  }

  // 3. Fix website search queries
  if (v.website && v.website.includes('google.com/search?q=')) {
    const decoded = decodeURIComponent(v.website);
    if (decoded.includes('הקריות') && (v.lat < 32.75 || v.lat > 32.95)) {
      const searchTarget = v.address || v.cityNameHe || '';
      const newQuery = `${v.nameHe || ''} ${searchTarget} תפריט`.trim();
      v.website = `https://www.google.com/search?q=${encodeURIComponent(newQuery)}`;
      websiteUpdatedCount++;
    }
  }

  // Specific check for עלמי בר יין
  if (v.nameHe && v.nameHe.includes('עלמי')) {
    v.city = 'ashkelon';
    v.cityNameHe = 'זיקים';
    v.address = 'זיקים';
    v.website = `https://www.google.com/search?q=${encodeURIComponent('עלמי בר יין זיקים תפריט')}`;
    console.log('עלמי בר יין updated explicitly:', v);
  }
});

fs.writeFileSync(jsonPath, JSON.stringify(venues, null, 2), 'utf8');
console.log(`Successfully fixed ${fixedCount} city mismatches and updated ${websiteUpdatedCount} website search URLs.`);

// Verify bad krayot remaining
const remainingBadKrayot = venues.filter(v => v.city === 'krayot' && (v.lat < 32.75 || v.lat > 32.95));
console.log('Remaining bad krayot venues:', remainingBadKrayot.length);
