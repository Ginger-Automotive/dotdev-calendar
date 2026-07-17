# dotdev-calendar

A userscript that adds a **toggleable, clash-aware calendar view** to the [DotDev 2026](https://dotdev.shopify.com/) schedule pages:

- [The lineup](https://dotdev.shopify.com/pages/sessions)
- [My list](https://dotdev.shopify.com/pages/my-list)

Use the **List view / Calendar view** toggle under the Day 1 / Day 2 tabs. Calendar view lays sessions on a vertical timeline with side-by-side lanes for overlaps. Sessions on your My List are filled dark; overlapping listed sessions get a high-contrast clash outline (violet on warm page colors, magenta-red on cool ones). Product booths appear as all-day chips; timed events (including Block Party) stay on the timeline. Day tabs, topic filters, and my-list filtering keep working. Tapping a session opens its details and uses the site’s own Add/Remove my-list controls.

## Install

1. Install a userscript manager for your browser (see platform sections below).
2. Open the raw script URL — the manager should prompt to install:

   **https://raw.githubusercontent.com/Ginger-Automotive/dotdev-calendar/main/dist/dotdev-calendar.user.js**

   If that link 404s (script not on `main` yet), use the current development branch instead:

   **https://raw.githubusercontent.com/Ginger-Automotive/dotdev-calendar/cursor/dotdev-calendar-plan-06f4/dist/dotdev-calendar.user.js**

3. Visit [sessions](https://dotdev.shopify.com/pages/sessions) or [my-list](https://dotdev.shopify.com/pages/my-list) and use the toggle.

Managers check `@version` for updates. When a newer release is published to the `@updateURL` above, Violentmonkey/Tampermonkey can offer an update (dashboard → check for updates, or on their usual schedule).

### Firefox on Android

Chrome on Android cannot run userscripts. Use Firefox.

1. Install **[Firefox for Android](https://play.google.com/store/apps/details?id=org.mozilla.firefox)** from the Play Store.
2. In Firefox, open **[Violentmonkey](https://addons.mozilla.org/en-US/android/addon/violentmonkey/)** and tap **Add to Firefox**. Confirm it is enabled under Firefox menu → **Add-ons**.
3. Open the [raw script URL](https://raw.githubusercontent.com/Ginger-Automotive/dotdev-calendar/main/dist/dotdev-calendar.user.js) in Firefox. Violentmonkey should offer **Install** — confirm it.
   - If you already had an older copy (e.g. pasted while the repo was private), open Violentmonkey → this script → sync/update, or delete it and install again from the raw URL so `@version` can upgrade.
4. Visit [sessions](https://dotdev.shopify.com/pages/sessions) or [my-list](https://dotdev.shopify.com/pages/my-list). Allow the script for the site if prompted.
5. Use the **List view / Calendar view** toggle under the day tabs.

### Firefox on desktop

1. Install **[Violentmonkey](https://addons.mozilla.org/en-US/firefox/addon/violentmonkey/)** or **[Tampermonkey](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)** from Firefox Add-ons.
2. Open the [raw script URL](https://raw.githubusercontent.com/Ginger-Automotive/dotdev-calendar/main/dist/dotdev-calendar.user.js). Confirm **Install** when the manager prompts.
3. Open [sessions](https://dotdev.shopify.com/pages/sessions) or [my-list](https://dotdev.shopify.com/pages/my-list) and use the toggle.

### Chrome / Edge on desktop

Supported. Chrome on iOS/Android is **not** supported (no extensions).

1. Install **[Tampermonkey](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)** or **[Violentmonkey](https://chromewebstore.google.com/detail/violentmonkey/jinjaccalgkegednnccohejagnlnfdag)** from the Chrome Web Store (Edge: use the matching store listing or Chrome Web Store).
2. Open the [raw script URL](https://raw.githubusercontent.com/Ginger-Automotive/dotdev-calendar/main/dist/dotdev-calendar.user.js). Confirm **Install** when the manager prompts.
3. Open the DotDev sessions or my-list page. If the script does not run, confirm it is enabled and that `dotdev.shopify.com` is allowed.

### iOS / iPadOS (Safari)

Chrome on iOS cannot run userscripts. Use Safari + the Userscripts app.

1. Install **[Userscripts](https://apps.apple.com/us/app/userscripts/id1463298887)** (free) from the App Store.
2. Open the **Userscripts** app once and set a save location (Files) when prompted.
3. In **Settings → Safari → Extensions**, enable **Userscripts** and allow it on websites (or at least `dotdev.shopify.com`).
4. In Safari, open the [raw script URL](https://raw.githubusercontent.com/Ginger-Automotive/dotdev-calendar/main/dist/dotdev-calendar.user.js). Tap the **Extensions** puzzle icon → **Userscripts** and install/save the detected script.  
   Alternatively: Userscripts dashboard → new script → paste the file contents → save.
5. Visit [sessions](https://dotdev.shopify.com/pages/sessions) or [my-list](https://dotdev.shopify.com/pages/my-list) in **Safari**. Ensure the DotDev script is active for the page via the Extensions menu.
6. Use the List / Calendar toggle.

### After install

- Log in on **My list** (ticket email) if you want wishlist state, clash highlights, and Add/Remove in the calendar overlay.
- Your List vs Calendar choice is remembered per browser.
- If nothing appears: confirm you are on `/pages/sessions` or `/pages/my-list`, the manager shows the script as enabled, and the page was reloaded after install.

## Development

```bash
npm install
npm run typecheck   # strict TS
npm run build       # bundles src/ → dist/dotdev-calendar.user.js (version from package.json)
npm test            # jsdom smoke tests against test/fixtures/sessions.html
```

Bump `"version"` in `package.json` before each release build so userscript managers treat the file as an update. The parser reads each `details.session` card’s `data-*` attributes and header — no network calls — and works with the page’s server-rendered content (including logged-in wishlist state).
