import puppeteer from 'puppeteer';

async function testAdvanced() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:5176/', { waitUntil: 'networkidle2' });

  // 1. Click 'סינון מתקדם' to open drawer
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text.includes('סינון מתקדם')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: 'public/advanced_filters_open.png' });
  console.log('Saved advanced_filters_open.png');

  // 2. Click on 'תל אביב - יפו' in city carousel to zoom in
  const cityButtons = await page.$$('.cities-scroll-container button');
  for (const b of cityButtons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text.includes('תל אביב')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1800));
  await page.screenshot({ path: 'public/tel_aviv_zoomed_city.png' });
  console.log('Saved tel_aviv_zoomed_city.png');

  await browser.close();
}

testAdvanced().catch(console.error);
