import puppeteer from 'puppeteer';

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  await page.setViewport({ width: 1400, height: 900 });
  await page.goto('http://localhost:5176/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  const btns = await page.$$('button');
  for (const b of btns) {
    const txt = await page.evaluate(el => el.textContent, b);
    if (txt.includes('רוטשילד ת״א')) {
      console.log('Clicking רוטשילד ת״א preset...');
      await b.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'public/test_proximity_feed_filtered.png' });
  console.log('Saved public/test_proximity_feed_filtered.png');
  await browser.close();
}

run().catch(console.error);
