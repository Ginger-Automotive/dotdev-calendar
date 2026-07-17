# dotdev-calendar

A userscript that adds a **toggleable, clash-aware calendar view** to the [DotDev 2026](https://dotdev.shopify.com/) schedule pages:

- [The lineup](https://dotdev.shopify.com/pages/sessions)
- [My list](https://dotdev.shopify.com/pages/my-list)

Use the **List view / Calendar view** toggle under the Day 1 / Day 2 tabs. Calendar view lays sessions on a vertical timeline with side-by-side lanes for overlaps. Sessions on your My List are filled dark; overlapping listed sessions get a high-contrast clash outline (violet on warm page colors, magenta-red on cool ones). Product booths appear as all-day chips; timed events (including Block Party) stay on the timeline. Day tabs, topic filters, and my-list filtering keep working. Tapping a session opens its details and uses the site’s own Add/Remove my-list controls.

## Install

You need a userscript manager, then install the built script:

[`dist/dotdev-calendar.user.js`](./dist/dotdev-calendar.user.js)

Because this repository is **private**, GitHub raw URLs return 404 without auth. Prefer **copy/paste** or **import from file** (steps below). Auto-update from GitHub will not work until the repo is public.

When you update the script later, the `@version` in the file header must increase (e.g. `0.2.0` → `0.2.1`) or the manager may keep the old copy. After pulling a newer build, replace the script contents in the manager (or reinstall) so the new version is applied.

### Firefox on Android

Chrome on Android cannot run userscripts. Use Firefox.

1. Install **[Firefox for Android](https://play.google.com/store/apps/details?id=org.mozilla.firefox)** from the Play Store.
2. In Firefox, open **[Violentmonkey](https://addons.mozilla.org/en-US/android/addon/violentmonkey/)** and tap **Add to Firefox**. Confirm it is enabled under Firefox menu → **Add-ons**.
3. Get the script contents:
   - On a computer with repo access, open `dist/dotdev-calendar.user.js` and copy all of it, **or**
   - Transfer that file to your phone (Files, Drive, AirDrop, etc.).
4. Open the Violentmonkey extension → **+** (new) → paste the full script (including the `==UserScript==` header) → **Save**.  
   If you have the file on the phone: Violentmonkey → menu → **Install from URL / file** if available, or paste as above.
5. Visit [sessions](https://dotdev.shopify.com/pages/sessions) or [my-list](https://dotdev.shopify.com/pages/my-list) in Firefox. Allow the script for the site if prompted.
6. Use the **List view / Calendar view** toggle under the day tabs.

**Updating on Android:** open Violentmonkey → this script → edit → replace the entire contents with the new `dist/dotdev-calendar.user.js` → Save. Check that `@version` in the header is higher than before.

### Firefox on desktop

1. Install **[Violentmonkey](https://addons.mozilla.org/en-US/firefox/addon/violentmonkey/)** or **[Tampermonkey](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)** from Firefox Add-ons.
2. Open `dist/dotdev-calendar.user.js` from this repo (clone/download with your GitHub access).
3. Either:
   - Drag the `.user.js` file onto a Firefox tab — the manager should offer **Install**, or
   - Manager dashboard → **New** / **Create a new script** → paste the file contents → **Save**.
4. Open [sessions](https://dotdev.shopify.com/pages/sessions) or [my-list](https://dotdev.shopify.com/pages/my-list) and use the toggle.

If the repo is made public later, you can also open the raw file URL and the manager will install/update from there.

### Chrome / Edge on desktop

Supported. Chrome on iOS/Android is **not** supported (no extensions).

1. Install **[Tampermonkey](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)** or **[Violentmonkey](https://chromewebstore.google.com/detail/violentmonkey/jinjaccalgkegednnccohejagnlnfdag)** from the Chrome Web Store (Edge: use the matching store listing or Chrome Web Store).
2. Open `dist/dotdev-calendar.user.js` from a local clone of this repo.
3. Either drag the file onto a Chrome tab, or create a new script in the manager and paste the full contents, then **Save** / **Install**.
4. Open the DotDev sessions or my-list page. If the script does not run, open the manager, confirm the script is enabled, and that `dotdev.shopify.com` is allowed.

**Updating:** same as Firefox — replace the script body with a newer build whose `@version` is higher, then save.

### iOS / iPadOS (Safari)

Chrome on iOS cannot run userscripts. Use Safari + the Userscripts app.

1. Install **[Userscripts](https://apps.apple.com/us/app/userscripts/id1463298887)** (free) from the App Store.
2. Open the **Userscripts** app once and set a save location (Files) when prompted.
3. In **Settings → Safari → Extensions**, enable **Userscripts** and allow it on websites (or at least `dotdev.shopify.com`).
4. Add the script:
   - On a Mac/PC with repo access, copy the contents of `dist/dotdev-calendar.user.js`.
   - In Safari, tap the **Extensions** puzzle icon → **Userscripts** → **Dashboard** (or open the Userscripts app) → create a new script → paste the full file → save.
5. Visit [sessions](https://dotdev.shopify.com/pages/sessions) or [my-list](https://dotdev.shopify.com/pages/my-list) in **Safari**. Tap the Extensions icon → Userscripts and ensure the DotDev script is active for the page.
6. Use the List / Calendar toggle.

**Updating on iOS:** open the script in Userscripts, replace its contents with the new build, save.

### After install

- Log in on **My list** (ticket email) if you want wishlist state, clash highlights, and Add/Remove in the calendar overlay.
- Your List vs Calendar choice is remembered per browser.
- If nothing appears: confirm you are on `/pages/sessions` or `/pages/my-list`, the manager shows the script as enabled, and you installed a build whose `@match` rules include those URLs.

## Development

```bash
npm install
npm run typecheck   # strict TS
npm run build       # bundles src/ → dist/dotdev-calendar.user.js (version from package.json)
npm test            # jsdom smoke tests against test/fixtures/sessions.html
```

Bump `"version"` in `package.json` before each release build so userscript managers treat the file as an update. The parser reads each `details.session` card’s `data-*` attributes and header — no network calls — and works with the page’s server-rendered content (including logged-in wishlist state).
