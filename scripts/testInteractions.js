import puppeteer from 'puppeteer';

async function testFlow() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });
  await page.goto('http://localhost:5176/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  // 1. Screenshot map country view: clusters should only show big numbers
  await page.screenshot({ path: 'public/test_big_numbers_map.png' });
  console.log('Saved test_big_numbers_map.png');

  // 2. Click on "פולג נתניה" preset to activate proximity
  const allBtns = await page.$$('button');
  for (const b of allBtns) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text.includes('פולג נתניה')) {
      console.log('Clicking preset פולג נתניה...');
      await b.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'public/test_proximity_feed_filtered.png' });
  console.log('Saved test_proximity_feed_filtered.png');

  // 3. Test rating slider (change value to 4.5)
  const sliders = await page.$$('input[type="range"]');
  if (sliders.length >= 2) {
    console.log('Interacting with sliders...');
    // Rating slider (first slider)
    await page.evaluate(el => {
      el.value = '4.5';
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }, sliders[0]);

    // Cost slider (second slider) - set to 2 (עד ₪₪)
    await page.evaluate(el => {
      el.value = '2';
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }, sliders[1]);
  }

  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: 'public/test_sliders_active.png' });
  console.log('Saved test_sliders_active.png');

  await browser.close();
}

testFlow().catch(console.error);
