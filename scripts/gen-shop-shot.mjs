// Screenshots the in-game Shop (More tab) at phone size → appstore-shots/shop/shop.png.
// Use this PNG as the App Store "Review Screenshot" for the in-app purchases.
// Needs the dev server running on :5199 (preview_start chrono-empire).
import puppeteer from 'puppeteer-core';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--force-device-scale-factor=2', '--hide-scrollbars'],
});

const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
await page.goto('http://localhost:5199', { waitUntil: 'networkidle0' });
await page.evaluateHandle('document.fonts.ready');

// dismiss the launch intro (auto-dismisses ~2.4s, but click to be quick)
await new Promise((r) => setTimeout(r, 600));
await page.evaluate(() => document.querySelector('.intro')?.click());
await new Promise((r) => setTimeout(r, 800));

// force English for a reviewer-friendly App Store screenshot
await page.evaluate(() => window.__engine?.setLang?.('en'));
await new Promise((r) => setTimeout(r, 500));

// go to the More tab
await page.evaluate(() => document.querySelector('[data-tut="more"]')?.click());
await new Promise((r) => setTimeout(r, 600));

// scroll the "🛒 Shop" section to the top of the content area
await page.evaluate(() => {
  const titles = [...document.querySelectorAll('.section-title')];
  const shop = titles.find((t) => t.textContent.includes('🛒'));
  if (shop) shop.scrollIntoView({ block: 'start' });
});
await new Promise((r) => setTimeout(r, 500));

const outDir = join(root, 'appstore-shots', 'shop');
mkdirSync(outDir, { recursive: true });
const file = join(outDir, 'shop.png');
await page.screenshot({ path: file });
console.log('saved', file);

await browser.close();
console.log('DONE');
