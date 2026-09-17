import puppeteer from 'puppeteer';
import path from 'path';

const url = process.argv[2] || 'http://localhost:5176/';
const outputFilename = process.argv[3] || 'app_screenshot.png';
const width = parseInt(process.argv[4] || '1280');
const height = parseInt(process.argv[5] || '800');

async function capture() {
  console.log(`Launching Puppeteer to screenshot ${url} at ${width}x${height}...`);
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width, height });
  
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  
  // Wait 1.5 seconds for Leaflet tiles & Canvas animations to settle
  await new Promise(r => setTimeout(r, 1500));

  const outputPath = path.resolve(outputFilename);
  await page.screenshot({ path: outputPath, fullPage: false });
  console.log(`Saved screenshot to ${outputPath}`);

  await browser.close();
}

capture().catch(err => {
  console.error('Puppeteer screenshot failed:', err);
  process.exit(1);
});
