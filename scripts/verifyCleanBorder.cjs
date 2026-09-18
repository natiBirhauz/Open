const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  console.log('Launching browser to test Northern Lebanon border clearance...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 30000 });
  console.log('Page loaded.');
  await new Promise(r => setTimeout(r, 1500));

  // 1. Move map to the exact sector shown in user photo: center [33.15, 35.45], zoom 12
  console.log('Panning to Northern border sector...');
  await page.evaluate(() => {
    if (window.__leafletMap) {
      window.__leafletMap.setView([33.15, 35.45], 12);
    }
  });
  await new Promise(r => setTimeout(r, 2000));

  // Take screenshot of the exact sector from user's image
  const screenshotPath = path.join(__dirname, '../lebanon_border_clean.png');
  await page.screenshot({ path: screenshotPath });
  console.log('Screenshot saved to:', screenshotPath);

  // Check how many markers exist in Lebanon in the live Leaflet map
  const markersInLebanon = await page.evaluate(() => {
    const map = window.__leafletMap;
    if (!map) return -1;
    let count = 0;
    map.eachLayer((layer) => {
      if (layer.getLatLng && layer._icon) {
        const { lat, lng } = layer.getLatLng();
        // Check if point is inside Lebanon
        if (
          (lng >= 35.33 && lng < 35.45 && lat > 33.055) ||
          (lng < 35.535 && lat > 33.100)
        ) {
          count++;
        }
      }
    });
    return count;
  });

  console.log('Markers detected inside Lebanon in live DOM:', markersInLebanon);

  await browser.close();
  console.log('Verification finished.');
})();
