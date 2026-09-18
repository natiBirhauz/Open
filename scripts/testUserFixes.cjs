const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  console.log('Launching browser to test fixes...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 30000 });
  console.log('Page loaded.');

  // 1. Search for עלמי
  const searchInput = await page.$('input[type="text"]');
  if (!searchInput) {
    console.error('Search input not found!');
    await browser.close();
    process.exit(1);
  }

  await searchInput.type('עלמי');
  await new Promise(r => setTimeout(r, 1000));

  // Screenshot search result
  await page.screenshot({ path: path.join(__dirname, '../elmi_search_result.png') });
  console.log('Screenshot saved: elmi_search_result.png');

  // Click on the first card
  const card = await page.$('.venue-card');
  if (!card) {
    console.error('No venue card found for עלמי!');
    await browser.close();
    process.exit(1);
  }

  await card.click();
  await new Promise(r => setTimeout(r, 1200));

  // Check modal content
  const modalData = await page.evaluate(() => {
    const modal = document.querySelector('.modal-content');
    if (!modal) return null;
    const h1 = modal.querySelector('h1')?.innerText;
    const h2 = modal.querySelector('h2')?.innerText;
    const cityBadges = Array.from(modal.querySelectorAll('span')).map(s => s.innerText);
    const menuLink = modal.querySelector('a[href*="google.com/search"]')?.href;
    const descHeader = modal.querySelector('h4')?.innerText;
    return { h1, h2, cityBadges, menuLink, descHeader };
  });

  console.log('Modal Verification Data:', JSON.stringify(modalData, null, 2));

  // Take screenshot of open modal
  await page.screenshot({ path: path.join(__dirname, '../elmi_modal_details.png') });
  console.log('Screenshot saved: elmi_modal_details.png');

  // Close modal
  const closeBtn = await page.$('button[aria-label="סגור חלונית"]');
  if (closeBtn) {
    await closeBtn.click();
    await new Promise(r => setTimeout(r, 500));
  }

  // 2. Test Surprise Roulette with fresh reload
  console.log('Testing Surprise Roulette...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  const rouletteBtn = await page.$('.surprise-button');
  if (rouletteBtn) {
    console.log('Clicking surprise roulette...');
    await rouletteBtn.click();
    // Roulette takes 16 spins * 80ms = 1280ms, + 500ms timeout before onPickVenue = ~1800ms
    await new Promise(r => setTimeout(r, 3500));

    const rouletteModalData = await page.evaluate(() => {
      const modal = document.querySelector('.modal-content');
      if (!modal) return null;
      const h1 = modal.querySelector('h1')?.innerText;
      const h2 = modal.querySelector('h2')?.innerText;
      const address = modal.querySelector('div[style*="font-size: 13px"] span')?.innerText;
      return { h1, h2, address };
    });

    console.log('Roulette Picked Venue Modal Data:', JSON.stringify(rouletteModalData, null, 2));
    await page.screenshot({ path: path.join(__dirname, '../roulette_modal_details.png') });
    console.log('Screenshot saved: roulette_modal_details.png');
  }

  await browser.close();
  console.log('All browser verification tests completed successfully.');
})();
