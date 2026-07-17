/**
 * Dev-only visual check. Serves the saved page HTML at the real URL (so all
 * CDN subresources and inline scripts behave normally), injects the built
 * userscript, and captures screenshots into /tmp/ddc-shots/.
 *
 * Usage: node scripts/screenshot.mjs [path-to-raw-html]
 */
import { readFileSync, mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const rawHtmlPath = process.argv[2] ?? '/tmp/sessions_raw.html';
const html = readFileSync(rawHtmlPath, 'utf8');
const bundle = readFileSync('dist/dotdev-calendar.user.js', 'utf8');
const outDir = '/tmp/ddc-shots';
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ executablePath: '/usr/local/bin/google-chrome' });

async function capture(viewport, label) {
  const page = await browser.newPage({ viewport });
  await page.route('**/pages/sessions*', (route) =>
    route.fulfill({ contentType: 'text/html', body: html }),
  );
  // Block analytics noise.
  await page.route(/web-pixels|monorail|trekkie|evey-files/, (route) => route.abort());
  await page.goto('https://dotdev.shopify.com/pages/sessions', { waitUntil: 'load' });
  await page.addScriptTag({ content: bundle });
  await page.waitForSelector('.ddc-toggle');

  await page.screenshot({ path: `${outDir}/${label}-list.png` });

  await page.click('.ddc-toggle:nth-child(2)');
  await page.waitForSelector('.ddc-block');
  await page.screenshot({ path: `${outDir}/${label}-calendar-top.png` });

  // Simulate a logged-in wishlist with a clash, then re-render.
  await page.evaluate(() => {
    const ids = [
      'replace-noisy-webhooks-with-precise-events-1',
      'how-sidekick-extensions-change-app-engagement',
      'agencies-in-the-agent-era',
    ];
    for (const id of ids) {
      document
        .querySelector(`[data-session-id="${id}"] .session__wishlist-button`)
        ?.classList.add('session__wishlist-button--active');
    }
  });
  await page.waitForSelector('.ddc-clash-note');
  await page.screenshot({ path: `${outDir}/${label}-calendar-clash.png` });

  const grid = page.locator('.ddc-grid');
  await grid.screenshot({ path: `${outDir}/${label}-calendar-full.png` });

  // Detail overlay.
  await page.click('.ddc-block.ddc-clash');
  await page.waitForSelector('.ddc-overlay');
  await page.screenshot({ path: `${outDir}/${label}-overlay.png` });

  await page.close();
}

await capture({ width: 1280, height: 900 }, 'desktop');
await capture({ width: 390, height: 844 }, 'mobile');

await browser.close();
console.log(`screenshots written to ${outDir}`);
