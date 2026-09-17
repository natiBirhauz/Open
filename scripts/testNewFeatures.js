import puppeteer from 'puppeteer';
import path from 'path';

async function test() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 850 });
  await page.goto('http://localhost:5176/', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  // 1. Capture clean country overview (verify NO bulky purple circles)
  await page.screenshot({ path: 'test_1_clean_map.png' });
  console.log('1. Saved test_1_clean_map.png');

  // 2. Test clicking on the map (center area of map)
  const mapElement = await page.$('.map-wrapper');
  if (mapElement) {
    const box = await mapElement.boundingBox();
    // Click near the middle of the map
    await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.45);
    await new Promise(r => setTimeout(r, 2500));
    await page.screenshot({ path: 'test_2_map_clicked.png' });
    console.log('2. Saved test_2_map_clicked.png after clicking on map!');
  }

  // 3. Test clicking "מסעדות וביסטרו" category pill
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('מסעדות וביסטרו')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'test_3_restaurants.png' });
  console.log('3. Saved test_3_restaurants.png');

  // 4. Test Address Search
  const searchInput = await page.$('input[placeholder*="חפש בר, מסעדה"]');
  if (searchInput) {
    await searchInput.click({ clickCount: 3 });
    await searchInput.type('דיזנגוף תל אביב');
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 2500));
    await page.screenshot({ path: 'test_4_address_search.png' });
    console.log('4. Saved test_4_address_search.png');
  }

  // 5. Test "פתוח עכשיו" toggle
  const allButtons = await page.$$('button');
  for (const btn of allButtons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('פתוח עכשיו')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'test_5_open_now.png' });
  console.log('5. Saved test_5_open_now.png');

  await browser.close();
  console.log('All tests completed successfully!');
}

test().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
