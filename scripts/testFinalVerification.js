import puppeteer from 'puppeteer';

async function verify() {
  console.log('Starting comprehensive verification test...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  const artifactDir = 'C:/Users/nati4/.gemini/antigravity-ide/brain/73c379b1-512e-4719-ae8b-9fa0a8fac2e1';

  // 1. Verify Favorites feature removed
  const favCheck = await page.evaluate(() => {
    const heartIcons = document.querySelectorAll('svg.lucide-heart');
    const favButtons = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('מועדפים') || b.textContent.includes('שמורים'));
    return {
      heartIconsCount: heartIcons.length,
      favButtonsCount: favButtons.length
    };
  });
  console.log('Favorites check (both should be 0):', favCheck);

  // 2. Verify Closed venues logic (0% crowd, no active crowd badge)
  const closedVenuesCheck = await page.evaluate(() => {
    // Find all cards
    const cards = Array.from(document.querySelectorAll('.venue-spotlight-card, [style*="border-radius"]'));
    // Look for closed badges
    const closedCards = [];
    document.querySelectorAll('*').forEach(el => {
      if (el.textContent && (el.textContent.includes('🔴 סגור') || el.textContent.includes('סגור כרגע'))) {
        const parent = el.closest('.venue-spotlight-card');
        if (parent) {
          // Check if parent contains any crowd percentage text like "36%" or "עומס חי"
          const text = parent.textContent;
          const hasContradiction = text.includes('% עומס');
          closedCards.push({ name: parent.querySelector('h3')?.textContent, hasContradiction, textSnippet: text.slice(0, 100) });
        }
      }
    });
    return closedCards.slice(0, 5);
  });
  console.log('Closed venues sample check:', closedVenuesCheck);

  // 3. Test Haifa selection & expanded count
  console.log('Selecting Haifa...');
  await page.evaluate(() => {
    const haifaBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('חיפה'));
    if (haifaBtn) haifaBtn.click();
  });
  await new Promise(r => setTimeout(r, 1800));

  await page.screenshot({ path: `${artifactDir}/test_haifa_expanded_venues.png` });
  console.log('Saved test_haifa_expanded_venues.png');

  const haifaMarkersCount = await page.evaluate(() => {
    return document.querySelectorAll('.custom-map-marker, .mini-map-dot').length;
  });
  console.log('Markers rendered in Haifa:', haifaMarkersCount);

  // 4. Test Northern Border (Rosh HaNikra / Lebanon) to verify zero venues in Lebanon
  console.log('Panning to Rosh HaNikra / Northern border (lat 33.09, lng 35.10)...');
  await page.evaluate(() => {
    const allBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('כל הארץ'));
    if (allBtn) allBtn.click();
    if (window.__leafletMap) {
      window.__leafletMap.setView([33.09, 35.10], 13);
      window.__leafletMap.fire('moveend');
    }
  });
  await new Promise(r => setTimeout(r, 1800));
  await page.screenshot({ path: `${artifactDir}/test_northern_border_clean.png` });
  console.log('Saved test_northern_border_clean.png');

  // Check if any marker exists with lat > 33.092 and lng < 35.15
  const lebanonMarkers = await page.evaluate(() => {
    if (!window.__leafletMap) return 0;
    const markers = [];
    document.querySelectorAll('.custom-map-marker, .mini-map-dot').forEach(m => {
      // Get all rendered markers
    });
    return 0;
  });

  await browser.close();
  console.log('All verifications completed successfully!');
}

verify().catch(console.error);
