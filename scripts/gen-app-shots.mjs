// Captures REAL in-app screenshots (Apple 2.3.3: marketing mockups are rejected) at valid App
// Store sizes. Sets up a rich game state, then shoots Empire / Cards / Time Rift / Shop.
// Needs the dev server on :5199 (preview_start chrono-empire).
import puppeteer from 'puppeteer-core';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

// [dir, css width pts, height pts]  ->  ×3 gives the pixel size
const SIZES = [
  { dir: 'real-6.9inch', w: 430, h: 932 }, // 1290×2796 (6.7"/6.9")
  { dir: 'real-6.5inch', w: 428, h: 926 }, // 1284×2778 (6.5")
];

// tab id + optional scroll target + output name.
// NOTE: for the prestige shot we scroll to the actual rebirth hero (`.rebirth-hero:not(.exp-hero)`)
// so the Temporal Expedition card (not in the submitted build) never appears in a screenshot.
const SHOTS = [
  { name: '01-empire', tab: 'empire' },
  { name: '02-cards', tab: 'cards' },
  { name: '03-rebirth', tab: 'rebirth', scrollSel: '.rebirth-hero:not(.exp-hero)' },
  { name: '04-shop', tab: 'more', scrollEmoji: '🛒' },
];

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new',
  args: ['--no-sandbox', '--hide-scrollbars'],
});

for (const size of SIZES) {
  const outDir = join(root, 'appstore-shots', size.dir);
  mkdirSync(outDir, { recursive: true });
  const page = await browser.newPage();
  await page.setViewport({ width: size.w, height: size.h, deviceScaleFactor: 3 });
  await page.goto('http://localhost:5199', { waitUntil: 'networkidle0' });
  await page.evaluateHandle('document.fonts.ready');

  // rich, believable progression so the screenshots show the app "in use"
  await page.evaluate(() => {
    const e = window.__engine;
    const s = e.state;
    s.cash = 4.2e12;
    s.gems = 780;
    s.crystals = 65;
    s.rebirths = 3;
    s.totalCrystalsEarned = 9e5;
    s.erasUnlocked = 8;
    s.tutorialDone = true;
    let i = 0;
    for (const id of Object.keys(s.generators)) {
      s.generators[id].count = 25 + (i % 6) * 22;
      s.cards[id] = 12 + (i % 5) * 9; // ≥10 → managers unlock, varied tiers
      i++;
    }
    e.setLang && e.setLang('en'); // English for the US App Store
    e.syncManagers && e.syncManagers();
    e.emit();
  });

  await wait(500);
  await page.evaluate(() => document.querySelector('.intro')?.click());
  await wait(900);

  for (const shot of SHOTS) {
    await page.evaluate((tab) => document.querySelector(`[data-tut="${tab}"]`)?.click(), shot.tab);
    await wait(500);
    if (shot.scrollEmoji) {
      await page.evaluate((emoji) => {
        const el = [...document.querySelectorAll('.section-title')].find((t) => t.textContent.includes(emoji));
        el?.scrollIntoView({ block: 'start' });
      }, shot.scrollEmoji);
      await wait(400);
    }
    if (shot.scrollSel) {
      await page.evaluate((sel) => document.querySelector(sel)?.scrollIntoView({ block: 'start' }), shot.scrollSel);
      await wait(400);
    }
    const file = join(outDir, `${shot.name}.png`);
    await page.screenshot({ path: file });
    console.log('saved', file);
  }
  await page.close();
}

await browser.close();
console.log('DONE');
