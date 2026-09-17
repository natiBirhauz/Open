import puppeteer from 'puppeteer';

async function testInteractions() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:5176/', { waitUntil: 'networkidle2' });

  // 1. Click Map Only
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text.includes('מפה בלבד')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: 'public/map_only_desktop.png' });
  console.log('Saved map_only_desktop.png');

  // 2. Click on a marker to open popup
  const markers = await page.$$('.custom-map-marker');
  if (markers.length > 0) {
    await markers[0].click();
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: 'public/map_popup_opened.png' });
    console.log('Saved map_popup_opened.png');
  }

  await browser.close();
}

testInteractions().catch(console.error);
