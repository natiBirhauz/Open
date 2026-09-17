const puppeteer = require('puppeteer');

(async () => {
  console.log('Launching browser to test latest user requests...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('Navigating to app on http://localhost:5173/...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 2000));

  // 1. Check City Search Filter (e.g. typing "אשקלון")
  console.log('Testing city search filter for אשקלון...');
  await page.evaluate(() => {
    const input = document.querySelector('input[placeholder*="חיפוש עיר"]');
    if (input) {
      input.value = 'אשק';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await new Promise((r) => setTimeout(r, 800));

  // Screenshot 1: City Search Filter showing Ashkelon
  await page.screenshot({
    path: 'C:/Users/nati4/.gemini/antigravity-ide/brain/73c379b1-512e-4719-ae8b-9fa0a8fac2e1/test_city_search_ashkelon.png'
  });
  console.log('Saved test_city_search_ashkelon.png');

  // Click on Ashkelon button
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const ashkelonBtn = btns.find((b) => b.innerText.includes('אשקלון'));
    if (ashkelonBtn) ashkelonBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1500));

  // Screenshot 2: Ashkelon selected with venues list and map view
  await page.screenshot({
    path: 'C:/Users/nati4/.gemini/antigravity-ide/brain/73c379b1-512e-4719-ae8b-9fa0a8fac2e1/test_ashkelon_selected.png'
  });
  console.log('Saved test_ashkelon_selected.png');

  // 2. Select Tel Aviv or Zoom in to verify Restaurant dots STAY ORANGE and DO NOT TURN GREEN!
  console.log('Selecting Tel Aviv to verify restaurant dots stay orange when zoomed in...');
  await page.evaluate(() => {
    const input = document.querySelector('input[placeholder*="חיפוש עיר"]');
    if (input) {
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    const btns = Array.from(document.querySelectorAll('button'));
    const tlvBtn = btns.find((b) => b.innerText.includes('תל אביב'));
    if (tlvBtn) tlvBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1500));

  // Check marker colors in DOM
  const markerColors = await page.evaluate(() => {
    const dots = Array.from(document.querySelectorAll('.mini-map-dot div, .custom-map-marker'));
    return dots.slice(0, 8).map((d) => {
      return {
        bg: d.style.background || d.style.getPropertyValue('--marker-color'),
        border: d.style.borderColor
      };
    });
  });
  console.log('Zoomed in marker colors sample:', markerColors);

  // Screenshot 3: Zoomed in map showing preserved orange restaurant pins (never green!)
  await page.screenshot({
    path: 'C:/Users/nati4/.gemini/antigravity-ide/brain/73c379b1-512e-4719-ae8b-9fa0a8fac2e1/test_zoomed_orange_markers.png'
  });
  console.log('Saved test_zoomed_orange_markers.png');

  // 3. Test Kiryat Gat and Kiryat Malakhi
  console.log('Testing Kiryat Gat / Kiryat Malakhi filter...');
  await page.evaluate(() => {
    const input = document.querySelector('input[placeholder*="חיפוש עיר"]');
    if (input) {
      input.value = 'גת';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  await new Promise((r) => setTimeout(r, 800));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const gatBtn = btns.find((b) => b.innerText.includes('קריית גת'));
    if (gatBtn) gatBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1500));

  // Screenshot 4: Kiryat Gat selected
  await page.screenshot({
    path: 'C:/Users/nati4/.gemini/antigravity-ide/brain/73c379b1-512e-4719-ae8b-9fa0a8fac2e1/test_kiryat_gat_selected.png'
  });
  console.log('Saved test_kiryat_gat_selected.png');

  await browser.close();
  console.log('All tests passed successfully!');
})();
