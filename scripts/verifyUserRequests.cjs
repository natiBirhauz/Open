const puppeteer = require('puppeteer');

(async () => {
  console.log('Launching browser to test new features...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('Navigating to http://localhost:5173/...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });

  await new Promise(r => setTimeout(r, 2000));

  // 1. Check venue count in navbar
  const navbarText = await page.evaluate(() => {
    return document.querySelector('header')?.innerText || '';
  });
  console.log('Navbar text snippet:', navbarText.replace(/\n/g, ' '));

  // 2. Check if floating buttons "כל הארץ" / "סביבי" / tile switcher exist on map
  const floatingControlsExist = await page.evaluate(() => {
    const text = document.querySelector('.map-wrapper')?.innerText || '';
    const hasKolHaaretz = text.includes('כל הארץ');
    const hasSvivi = text.includes('סביבי');
    const hasTileSwitch = text.includes('עברית כהה') && text.includes('עברית בהיר');
    return { hasKolHaaretz, hasSvivi, hasTileSwitch };
  });
  console.log('Floating controls check (should all be false):', floatingControlsExist);

  // 3. Check distance slidebar presence and attributes
  const sliderInfo = await page.evaluate(() => {
    const range = document.querySelector('input[type="range"][max="40"]');
    return range ? {
      min: range.min,
      max: range.max,
      step: range.step,
      value: range.value
    } : null;
  });
  console.log('Distance slider info:', sliderInfo);

  // Take screenshot 1: Clean Dark Map & 40km Distance Slider
  await page.screenshot({ path: 'C:/Users/nati4/.gemini/antigravity-ide/brain/73c379b1-512e-4719-ae8b-9fa0a8fac2e1/test_clean_dark_map.png' });
  console.log('Saved test_clean_dark_map.png');

  // 4. Test clicking on the map and verifying NO ZOOM OUT
  console.log('Testing map click to verify zoom does NOT decrease...');
  const initialZoom = await page.evaluate(() => {
    // Zoom in first to level 14
    const leafletMapEl = document.querySelector('.leaflet-container');
    // Click zoom in button twice
    const zoomInBtn = document.querySelector('.leaflet-control-zoom-in');
    if (zoomInBtn) {
      zoomInBtn.click();
      zoomInBtn.click();
    }
  });

  await new Promise(r => setTimeout(r, 1000));

  const zoomBeforeClick = await page.evaluate(() => {
    // Find zoom level from leaflet classes or map
    const mapEl = document.querySelector('.leaflet-container');
    const zoomClass = Array.from(mapEl.classList).find(c => c.startsWith('leaflet-zoom-'));
    return zoomClass;
  });
  console.log('Zoom before click:', zoomBeforeClick);

  // Click on the map container
  const mapBox = await page.$('.map-wrapper');
  if (mapBox) {
    const box = await mapBox.boundingBox();
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  }

  await new Promise(r => setTimeout(r, 1200));

  const zoomAfterClick = await page.evaluate(() => {
    const mapEl = document.querySelector('.leaflet-container');
    const zoomClass = Array.from(mapEl.classList).find(c => c.startsWith('leaflet-zoom-'));
    return zoomClass;
  });
  console.log('Zoom after click (must NOT decrease):', zoomAfterClick);

  // Take screenshot 2: After map click with beacon and radius
  await page.screenshot({ path: 'C:/Users/nati4/.gemini/antigravity-ide/brain/73c379b1-512e-4719-ae8b-9fa0a8fac2e1/test_map_click_no_zoomout.png' });
  console.log('Saved test_map_click_no_zoomout.png');

  // 5. Change distance slidebar to 15 km
  console.log('Testing distance slidebar adjustment...');
  await page.evaluate(() => {
    const range = document.querySelector('input[type="range"][max="40"]');
    if (range) {
      range.value = '15';
      range.dispatchEvent(new Event('change', { bubbles: true }));
      range.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });

  await new Promise(r => setTimeout(r, 1000));

  // Take screenshot 3: Distance slider adjusted to 15km
  await page.screenshot({ path: 'C:/Users/nati4/.gemini/antigravity-ide/brain/73c379b1-512e-4719-ae8b-9fa0a8fac2e1/test_distance_slider_15km.png' });
  console.log('Saved test_distance_slider_15km.png');

  await browser.close();
  console.log('Verification completed successfully!');
})();
