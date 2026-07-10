// Renders public/appstore.html and exports each .shot as an exact-size PNG.
// Uses the system Chrome via puppeteer-core — no Chromium download.
// Output: appstore-shots/6.7-and-6.9inch/*.png and 6.5inch/*.png
import puppeteer from 'puppeteer-core';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const htmlUrl = 'http://localhost:5199/appstore.html';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const NAMES = ['01-hero', '02-eras', '03-idle', '04-rebirth', '05-worlds'];

const SIZES = [
  { dir: '6.7-and-6.9inch', query: '?full=1', w: 1290, h: 2796 },
  { dir: '6.5inch',         query: '?full=1&size=65', w: 1284, h: 2778 },
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--force-device-scale-factor=1', '--hide-scrollbars'],
});

for (const size of SIZES) {
  const outDir = join(root, 'appstore-shots', size.dir);
  mkdirSync(outDir, { recursive: true });
  const page = await browser.newPage();
  await page.setViewport({ width: size.w, height: size.h, deviceScaleFactor: 1 });
  await page.goto(htmlUrl + size.query, { waitUntil: 'networkidle0' });
  // wait for the web font to load so text renders correctly
  await page.evaluateHandle('document.fonts.ready');
  await new Promise((r) => setTimeout(r, 400));

  const shots = await page.$$('.shot');
  for (let i = 0; i < shots.length; i++) {
    const file = join(outDir, `${NAMES[i] || 'shot-' + i}.png`);
    await shots[i].screenshot({ path: file });
    console.log('saved', file);
  }
  await page.close();
}

await browser.close();
console.log('DONE');
