const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // Click on the 15 km tick label
  await page.evaluate(() => {
    const spans = Array.from(document.querySelectorAll('span'));
    const span15 = spans.find(s => s.innerText.trim() === '15 ק״מ');
    if (span15) span15.click();
  });

  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({ path: 'C:/Users/nati4/.gemini/antigravity-ide/brain/73c379b1-512e-4719-ae8b-9fa0a8fac2e1/test_distance_slider_tick_15km.png' });
  console.log('Saved test_distance_slider_tick_15km.png');

  await browser.close();
})();
