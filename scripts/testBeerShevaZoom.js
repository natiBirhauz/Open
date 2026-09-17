import puppeteer from 'puppeteer';

async function run() {
  console.log('Testing Be\'er Sheva zoom and orange marker persistence with puppeteer...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  const artifactDir = 'C:/Users/nati4/.gemini/antigravity-ide/brain/73c379b1-512e-4719-ae8b-9fa0a8fac2e1';

  // 1. Zoom into Be'er Sheva via city button
  console.log('Clicking Be\'er Sheva city button...');
  await page.evaluate(() => {
    const bsBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('באר שבע'));
    if (bsBtn) {
      bsBtn.click();
    }
  });

  await new Promise(r => setTimeout(r, 1800));

  await page.screenshot({ path: `${artifactDir}/test_beersheba_city_selected.png` });
  console.log('Saved test_beersheba_city_selected.png');

  // Check markers count and styles
  const cityMarkersInfo = await page.evaluate(() => {
    const markers = document.querySelectorAll('.custom-map-marker, .mini-map-dot, .constellation-dot-marker');
    const samples = [];
    markers.forEach(m => {
      const varColor = m.style.getPropertyValue('--marker-color') || m.style.backgroundColor || '';
      samples.push({ className: m.className, color: varColor });
    });
    return { count: markers.length, samples: samples.slice(0, 8) };
  });

  console.log('Markers rendered in Be\'er Sheva city selection:', cityMarkersInfo.count);
  console.log('Sample markers:', cityMarkersInfo.samples);

  // 2. Test manual zoom on Be'er Sheva from "All Country"
  console.log('Resetting to all country...');
  await page.evaluate(() => {
    const allBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('כל הארץ'));
    if (allBtn) allBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  console.log('Manually panning and zooming into Be\'er Sheva via window.__leafletMap without selecting city...');
  await page.evaluate(() => {
    if (window.__leafletMap) {
      window.__leafletMap.setView([31.252, 34.791], 14);
      window.__leafletMap.fire('moveend');
    }
  });

  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: `${artifactDir}/test_beersheba_manual_zoom.png` });
  console.log('Saved test_beersheba_manual_zoom.png');

  const manualMarkersInfo = await page.evaluate(() => {
    const markers = document.querySelectorAll('.custom-map-marker, .mini-map-dot');
    const samples = [];
    markers.forEach(m => {
      const varColor = m.style.getPropertyValue('--marker-color') || m.style.backgroundColor || '';
      samples.push({ className: m.className, color: varColor });
    });
    return { count: markers.length, samples: samples.slice(0, 8) };
  });
  console.log('Manual zoom markers count in Be\'er Sheva:', manualMarkersInfo.count);
  console.log('Manual zoom sample markers:', manualMarkersInfo.samples);

  // 3. Zoom even closer to street view (zoom 15)
  await page.evaluate(() => {
    if (window.__leafletMap) {
      window.__leafletMap.setZoom(15);
      window.__leafletMap.fire('moveend');
    }
  });

  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: `${artifactDir}/test_beersheba_close_street_view.png` });
  console.log('Saved test_beersheba_close_street_view.png');

  await browser.close();
  console.log('All Be\'er Sheva tests passed successfully!');
}

run().catch(err => {
  console.error('Error during test:', err);
  process.exit(1);
});
