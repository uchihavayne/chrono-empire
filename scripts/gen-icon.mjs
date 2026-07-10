// Renders public/icon.html and exports the app icon + splash source PNGs into resources/.
// Then run `npx @capacitor/assets generate` (after `cap add ios/android`) to fan them out
// to every platform size. Uses system Chrome via puppeteer-core — no Chromium download.
import puppeteer from 'puppeteer-core';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const url = 'http://localhost:5199/icon.html';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const outDir = join(root, 'resources');
mkdirSync(outDir, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--force-device-scale-factor=1', '--hide-scrollbars'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1700, height: 3400, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle0' });
await page.evaluateHandle('document.fonts.ready');
await new Promise((r) => setTimeout(r, 400));

const targets = [
  { sel: '#icon', file: 'icon.png' },     // 1024×1024
  { sel: '#splash', file: 'splash.png' }, // 1536×1536 (assets tool upscales/pads for splashes)
];
for (const t of targets) {
  const el = await page.$(t.sel);
  await el.screenshot({ path: join(outDir, t.file) });
  console.log('saved', join(outDir, t.file));
}

// a dark splash variant for @capacitor/assets dark mode (same art, tool handles the rest)
await browser.close();
console.log('DONE');
