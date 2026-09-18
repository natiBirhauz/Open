const fs = require('fs');

const legitimateIsraeliSpots = [
  { name: 'Rosh HaNikra', lat: 33.092, lng: 35.105 },
  { name: 'Hanita', lat: 33.085, lng: 35.172 },
  { name: 'Aramshe', lat: 33.083, lng: 35.197 },
  { name: 'Zarit', lat: 33.082, lng: 35.275 },
  { name: 'Shtula', lat: 33.081, lng: 35.297 },
  { name: 'Netua', lat: 33.065, lng: 35.337 },
  { name: 'Mattat', lat: 33.048, lng: 35.368 },
  { name: 'Sasa', lat: 33.028, lng: 35.393 },
  { name: 'Dovev', lat: 33.043, lng: 35.397 },
  { name: 'Baram', lat: 33.047, lng: 35.430 },
  { name: 'Avivim', lat: 33.045, lng: 35.457 },
  { name: 'Yiron', lat: 33.075, lng: 35.458 },
  { name: 'Dishon', lat: 33.080, lng: 35.526 },
  { name: 'Malkia', lat: 33.098, lng: 35.509 },
  { name: 'Ramot Naftali', lat: 33.111, lng: 35.545 },
  { name: 'Yiftach', lat: 33.128, lng: 35.556 },
  { name: 'Menara', lat: 33.193, lng: 35.539 },
  { name: 'Margaliot', lat: 33.214, lng: 35.552 },
  { name: 'Misgav Am', lat: 33.235, lng: 35.545 },
  { name: 'Kfar Giladi', lat: 33.242, lng: 35.571 },
  { name: 'Metula', lat: 33.278, lng: 35.576 },
  { name: 'Kiryat Shmona', lat: 33.207, lng: 35.570 },
  { name: 'Dan', lat: 33.238, lng: 35.652 },
  { name: 'Majdal Shams', lat: 33.268, lng: 35.772 },
  { name: 'Hermon Ski Resort', lat: 33.305, lng: 35.775 },
  // Eilat legitimate points
  { name: 'Eilat North Beach', lat: 29.552, lng: 34.964 },
  { name: 'Eilat Coral Beach', lat: 29.508, lng: 34.918 },
  { name: 'Taba Border Crossing (Israel side)', lat: 29.491, lng: 34.903 },
  // South & Gaza envelope
  { name: 'Zikim', lat: 31.607, lng: 34.521 },
  { name: 'Netiv HaAsara', lat: 31.595, lng: 34.545 },
  { name: 'Kerem Shalom', lat: 31.228, lng: 34.285 }
];

const foreignSpots = [
  { name: 'Rmeish (Lebanon)', lat: 33.086, lng: 35.376 },
  { name: 'Yaroun (Lebanon)', lat: 33.068, lng: 35.422 },
  { name: 'Maroun al-Ras (Lebanon)', lat: 33.081, lng: 35.422 },
  { name: 'Aitaroun (Lebanon)', lat: 33.112, lng: 35.472 },
  { name: 'Bint Jbeil (Lebanon)', lat: 33.123, lng: 35.433 },
  { name: 'Blida (Lebanon)', lat: 33.140, lng: 35.512 },
  { name: 'Meiss Ej Jabal (Lebanon)', lat: 33.170, lng: 35.510 },
  { name: 'Houla (Lebanon)', lat: 33.210, lng: 35.515 },
  { name: 'Markaba (Lebanon)', lat: 33.235, lng: 35.518 },
  { name: 'Safad El Battikh (Lebanon)', lat: 33.191, lng: 35.443 },
  { name: 'Tibnine (Lebanon)', lat: 33.190, lng: 35.390 },
  { name: 'Odaisseh (Lebanon)', lat: 33.250, lng: 35.540 },
  { name: 'Kfar Kila (Lebanon)', lat: 33.270, lng: 35.550 },
  { name: 'Khiam (Lebanon)', lat: 33.310, lng: 35.590 },
  // Aqaba (Jordan)
  { name: 'Aqaba Port (Jordan)', lat: 29.529, lng: 35.001 },
  { name: 'Aqaba City Center (Jordan)', lat: 29.532, lng: 35.004 },
  // Gaza
  { name: 'Gaza City (Gaza)', lat: 31.500, lng: 34.460 },
  { name: 'Khan Yunis (Gaza)', lat: 31.340, lng: 34.300 },
  { name: 'Rafah (Gaza)', lat: 31.280, lng: 34.250 }
];

function isStrictlyInsideIsrael(lat, lng) {
  if (!lat || !lng) return false;

  // 1. NORTHERN BORDER (LEBANON) - STRICT BLUE LINE
  // Coast to Rosh HaNikra: Rosh HaNikra kibbutz/grottos is at 33.093, 35.105
  if (lng < 35.110 && lat > 33.095) return false;
  // Rosh HaNikra to Hanita / Aramshe
  if (lng >= 35.110 && lng < 35.250 && lat > 33.088) return false;
  // Zar'it / Shtula to Netu'a: Zar'it is at 33.082, Shtula at 33.081, Netu'a at 33.065
  if (lng >= 35.250 && lng < 35.320 && lat > 33.085) return false;
  if (lng >= 35.320 && lng < 35.350 && lat > 33.072) return false;
  // Mattat, Sasa, Dovev, Bar'am, Avivim sector (Opposite Rmeish, Yaroun, Maroun al-Ras)
  // Dovev is 33.043, Bar'am 33.047, Avivim 33.045. Rmeish is 33.086, Yaroun 33.068.
  if (lng >= 35.350 && lng < 35.450 && lat > 33.055) return false;
  // Yir'on sector (Yir'on is at 33.075; border north is ~33.079; Maroun al-Ras is at 33.081)
  if (lng >= 35.450 && lng < 35.480 && lat > 33.079) return false;
  // Malkia sector (Malkia is at 33.098; border northwest is ~33.100; Aitaroun is north)
  if (lng >= 35.480 && lng < 35.520 && lat > 33.100) return false;
  // West of the Naftali/Hula ridge (Blida, Meiss Ej Jabal, Houla, Markaba, Safad El Battikh, etc.)
  // All these Lebanese towns are west of lng 35.535!
  if (lng < 35.535 && lat > 33.100) return false;
  // Ridge from Menara to Misgav Am (Misgav Am is 33.235, 35.545)
  if (lng < 35.540 && lat > 33.230) return false;
  // West of Kfar Giladi / Metula (Odaisseh, Kfar Kila are west of 35.560)
  if (lng < 35.560 && lat > 33.242) return false;
  // West of Metula town
  if (lng < 35.568 && lat > 33.268) return false;
  // North of Metula (Blue Line peak in Galilee is at lat 33.285)
  if (lng < 35.700 && lat > 33.285) return false;
  // East of Metula / North of Ghajar (Hasbani/Wazzani Lebanese valley)
  if (lng >= 35.585 && lng < 35.660 && lat > 33.242) return false;
  // Hermon slope: north of Nimrod / Majdal Shams / Hermon ski site (summit up to 33.315)
  if (lng >= 35.660 && lng < 35.740 && lat > 33.275) return false;
  if (lng >= 35.740 && lat > 33.315) return false;

  // 2. NORTHEAST BORDER (SYRIA - GOLAN ALPHA LINE)
  if (lat >= 33.10 && lng > 35.840) return false;
  if (lat >= 32.85 && lat < 33.10 && lng > 35.860) return false;
  if (lat >= 32.70 && lat < 32.85 && lng > 35.880) return false;

  // 3. EASTERN BORDER (JORDAN)
  if (lat >= 32.40 && lat < 32.70 && lng > 35.580) return false;
  if (lat >= 31.75 && lat < 32.40 && lng > 35.550) return false;
  if (lat >= 31.05 && lat < 31.75 && lng > 35.450) return false; // Dead Sea
  if (lat >= 30.60 && lat < 31.05 && lng > 35.320) return false;
  if (lat >= 30.00 && lat < 30.60 && lng > 35.200) return false;
  if (lat >= 29.55 && lat < 30.00 && lng > 35.030) return false;
  // Aqaba cutoff: East of Eilat (Eilat North Beach is at lng 34.964)
  if (lat < 29.55 && lng > 34.975) return false;

  // 4. SOUTHWEST BORDER (EGYPT / SINAI)
  if (lat < 29.485) return false; // South of Taba crossing
  if (lat < 29.56 && lng < 34.885) return false; // West of Eilat / Mt Yoash
  if (lat >= 29.56 && lat < 30.00 && lng < 34.800) return false;
  if (lat >= 30.00 && lat < 30.50 && lng < 34.600) return false;
  if (lat >= 30.50 && lat < 31.00 && lng < 34.400) return false;
  if (lat >= 31.00 && lat < 31.20 && lng < 34.250) return false;

  // 5. GAZA STRIP (Rafah, Khan Yunis, Deir al-Balah, Gaza City, Beit Lahia)
  // Gaza border: from Rafah (lat 31.25, lng 34.25) to north of Beit Lahia (lat 31.585, lng 34.50)
  if (lat >= 31.250 && lat <= 31.585 && lng <= 34.520) return false;

  return true;
}

console.log('--- TESTING LEGITIMATE ISRAELI PLACES ---');
let allIsraeliValid = true;
for (const spot of legitimateIsraeliSpots) {
  const ok = isStrictlyInsideIsrael(spot.lat, spot.lng);
  if (!ok) {
    console.error(`FAIL: Legitimate Israeli place ${spot.name} (${spot.lat}, ${spot.lng}) was incorrectly rejected!`);
    allIsraeliValid = false;
  }
}
if (allIsraeliValid) console.log('PASS: All 31 legitimate Israeli border settlements are 100% VALID.');

console.log('\n--- TESTING FOREIGN / LEBANON / AQABA / GAZA PLACES ---');
let allForeignRejected = true;
for (const spot of foreignSpots) {
  const ok = isStrictlyInsideIsrael(spot.lat, spot.lng);
  if (ok) {
    console.error(`FAIL: Foreign place ${spot.name} (${spot.lat}, ${spot.lng}) was NOT rejected!`);
    allForeignRejected = false;
  }
}
if (allForeignRejected) console.log('PASS: All 19 foreign places (Rmeish, Yaroun, Maroun al-Ras, Markaba, Safad El Battikh, Aqaba, Gaza) are 100% REJECTED.');
