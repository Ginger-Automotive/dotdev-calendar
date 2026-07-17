import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const fixture = readFileSync('test/fixtures/sessions.html', 'utf8');
const bundle = readFileSync('dist/dotdev-calendar.user.js', 'utf8');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function boot(url) {
  const dom = new JSDOM(fixture, { url, runScripts: 'outside-only', pretendToBeVisual: true });
  dom.window.eval(bundle);
  return dom;
}

// --- Sessions page: toggle + calendar rendering ---
{
  const dom = await boot('https://dotdev.shopify.com/pages/sessions');
  const doc = dom.window.document;

  const toggles = doc.querySelectorAll('.ddc-toggle');
  assert.equal(toggles.length, 2, 'expected two toggle buttons');
  assert.equal(toggles[0].getAttribute('aria-pressed'), 'true', 'list view active by default');

  const calendarBtn = toggles[1];
  calendarBtn.click();

  const root = doc.querySelector('.ddc-root');
  assert.ok(root && !root.hidden, 'calendar root visible after toggle');

  const nativeSection = doc.querySelector('.sessions-container').closest('.shopify-section');
  assert.equal(nativeSection.style.display, 'none', 'native list hidden in calendar mode');

  const blocks = doc.querySelectorAll('.ddc-block');
  assert.ok(blocks.length >= 20, `expected many day-1 blocks, got ${blocks.length}`);

  const chips = doc.querySelectorAll('.ddc-allday-chip');
  assert.ok(chips.length >= 5, `expected all-day booth chips, got ${chips.length}`);

  // No two blocks in the same lane cluster may overlap visually: verify by
  // checking that blocks sharing identical left offsets never overlap in time.
  const byLeft = new Map();
  for (const b of blocks) {
    const key = b.style.left;
    const top = parseFloat(b.style.top);
    const bottom = top + parseFloat(b.style.height);
    const list = byLeft.get(key) ?? [];
    for (const other of list) {
      assert.ok(
        bottom <= other.top + 2 || top >= other.bottom - 2,
        `blocks overlap in same lane: ${b.textContent} vs ${other.text}`,
      );
    }
    list.push({ top, bottom, text: b.textContent });
    byLeft.set(key, list);
  }

  // Toggle back restores the native view.
  toggles[0].click();
  assert.equal(nativeSection.style.display, '', 'native list restored');
  assert.ok(doc.querySelector('.ddc-root').hidden, 'calendar hidden in list mode');

  // Detail overlay opens from a block.
  toggles[1].click();
  doc.querySelector('.ddc-block').click();
  assert.ok(doc.querySelector('.ddc-overlay'), 'detail overlay opens');
  assert.ok(doc.querySelector('.ddc-detail-title').textContent.length > 0, 'overlay has a title');
  doc.querySelector('.ddc-detail-close').click();
  assert.equal(doc.querySelector('.ddc-overlay'), null, 'overlay closes');

  dom.window.close();
  console.log('sessions page: ok');
}

// --- Clash detection: mark two overlapping sessions as wishlisted ---
{
  const dom = await boot('https://dotdev.shopify.com/pages/sessions');
  const doc = dom.window.document;

  // Two known-overlapping day-1 sessions (10:15-11:15 workshop, 10:30-11:15 talk).
  const a = doc.querySelector(
    '[data-session-id="replace-noisy-webhooks-with-precise-events-1"] .session__wishlist-button',
  );
  const b = doc.querySelector(
    '[data-session-id="how-sidekick-extensions-change-app-engagement"] .session__wishlist-button',
  );
  assert.ok(a && b, 'fixture contains the two overlap test sessions');
  a.classList.add('session__wishlist-button--active');
  b.classList.add('session__wishlist-button--active');

  doc.querySelectorAll('.ddc-toggle')[1].click();
  await sleep(150); // allow the mutation-observer re-render to settle

  const clashes = doc.querySelectorAll('.ddc-block.ddc-clash');
  assert.equal(clashes.length, 2, `expected 2 clashing blocks, got ${clashes.length}`);
  const listed = doc.querySelectorAll('.ddc-block.ddc-listed');
  assert.equal(listed.length, 2, `expected 2 listed blocks, got ${listed.length}`);
  assert.ok(doc.querySelector('.ddc-clash-note'), 'clash banner shown');

  // Fixture page bg is sky (#8FD5F1) → cool → magenta-red clash accent.
  const day = doc.querySelector('.ddc-day');
  assert.ok(day, 'day root present');
  assert.equal(
    day.style.getPropertyValue('--ddc-clash').trim().toLowerCase(),
    '#ff2d55',
    'cool page bg should pick magenta-red clash accent',
  );

  // Warm (orange) page bg → violet clash accent.
  doc.documentElement.style.setProperty('--page-bg-color', '#FF8A1D');
  doc.querySelectorAll('.ddc-toggle')[0].click();
  doc.querySelectorAll('.ddc-toggle')[1].click();
  await sleep(150);
  assert.equal(
    doc.querySelector('.ddc-day').style.getPropertyValue('--ddc-clash').trim().toLowerCase(),
    '#4d1fff',
    'warm page bg should pick violet clash accent',
  );

  dom.window.close();
  console.log('clash detection: ok');
}

// --- Day switching: respect the native hidden attribute per day ---
{
  const dom = await boot('https://dotdev.shopify.com/pages/sessions');
  const doc = dom.window.document;
  doc.querySelectorAll('.ddc-toggle')[1].click();
  const day1Count = doc.querySelectorAll('.ddc-block').length;

  // Simulate the native day switch: flip active tab and hidden attributes.
  doc.querySelectorAll('.date-tab').forEach((t) => t.classList.toggle('date-tab--active'));
  doc.querySelectorAll('[data-session-day]').forEach((s) => {
    if (!s.dataset.sessionId) return;
    const day = s.dataset.sessionDay;
    if (day === '1') s.hidden = true;
    else if (day === '2') s.hidden = false;
  });
  await sleep(150);

  const day2Count = doc.querySelectorAll('.ddc-block').length;
  assert.ok(day2Count > 5, `expected day-2 blocks, got ${day2Count}`);
  assert.notEqual(day1Count, day2Count, 'day switch changes the rendered set');

  // Block Party is 5:00pm–10:00pm — a long timed event, not an all-day booth.
  // It must appear on the timeline, not as a chip at the top.
  const blockPartyChip = [...doc.querySelectorAll('.ddc-allday-chip')].find((c) =>
    c.textContent?.includes('Block Party'),
  );
  assert.equal(blockPartyChip, undefined, 'Block Party must not be an all-day chip');
  const blockParty = [...doc.querySelectorAll('.ddc-block')].find((b) =>
    b.querySelector('.ddc-block-title')?.textContent === 'Block Party',
  );
  assert.ok(blockParty, 'Block Party appears as a timeline block on day 2');
  assert.ok(
    parseFloat(blockParty.style.height) > 100,
    `Block Party block should span several hours, height=${blockParty.style.height}`,
  );

  dom.window.close();
  console.log(`day switching: ok (day1=${day1Count}, day2=${day2Count})`);
}

// --- My List page: only wishlisted sessions visible ---
{
  const dom = await boot('https://dotdev.shopify.com/pages/my-list');
  const doc = dom.window.document;

  // Simulate the native my-list behavior: everything hidden except two
  // wishlisted sessions and featured specials.
  const keep = new Set([
    'replace-noisy-webhooks-with-precise-events-1',
    'how-sidekick-extensions-change-app-engagement',
  ]);
  doc.querySelectorAll('details.session[data-session-id]').forEach((s) => {
    const isKept = keep.has(s.dataset.sessionId);
    const isFeatured = s.dataset.sessionFeatured === 'true';
    const isDay1 = s.dataset.sessionDay === '1' || s.dataset.sessionDay === 'both';
    s.hidden = !(isDay1 && (isKept || isFeatured));
    if (isKept) {
      s.querySelector('.session__wishlist-button')?.classList.add('session__wishlist-button--active');
    }
  });

  doc.querySelectorAll('.ddc-toggle')[1].click();
  await sleep(150);

  const blocks = [...doc.querySelectorAll('.ddc-block')];
  const titles = blocks.map((b) => b.querySelector('.ddc-block-title').textContent);
  assert.ok(
    titles.includes('Replace noisy webhooks with precise Events'),
    'my-list calendar contains wishlisted session',
  );
  assert.ok(blocks.length < 12, `my-list calendar should be sparse, got ${blocks.length}`);
  assert.equal(doc.querySelectorAll('.ddc-block.ddc-clash').length, 2, 'clash visible on my-list');

  dom.window.close();
  console.log(`my-list page: ok (${blocks.length} blocks)`);
}

console.log('all smoke tests passed');
