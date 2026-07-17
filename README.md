# dotdev-calendar

Userscript that adds a **List / Calendar** toggle to the DotDev 2026 [sessions](https://dotdev.shopify.com/pages/sessions) and [my-list](https://dotdev.shopify.com/pages/my-list) pages. Calendar view is a clash-aware timeline: overlaps sit in side-by-side lanes, My List sessions are highlighted, and conflicting listed sessions are outlined. Product booths show as all-day chips; everything else stays on the timeline. Site filters and wishlist actions keep working.

## Install

1. Install a userscript manager (platform steps below).
2. Open **https://raw.githubusercontent.com/Ginger-Automotive/dotdev-calendar/main/dist/dotdev-calendar.user.js** — the manager should prompt to install.
3. Visit [sessions](https://dotdev.shopify.com/pages/sessions) or [my-list](https://dotdev.shopify.com/pages/my-list) and use the toggle.

Managers pick up newer `@version` values from the script’s `@updateURL` (check for updates in the dashboard, or wait for the usual schedule).

### Firefox on Android

Chrome on Android cannot run userscripts. Use Firefox.

1. Install **[Firefox for Android](https://play.google.com/store/apps/details?id=org.mozilla.firefox)**.
2. In Firefox, add **[Violentmonkey](https://addons.mozilla.org/en-US/android/addon/violentmonkey/)** (menu → **Add-ons** to confirm it’s enabled).
3. Open the [raw script URL](https://raw.githubusercontent.com/Ginger-Automotive/dotdev-calendar/main/dist/dotdev-calendar.user.js) and confirm **Install**.
4. Visit sessions or my-list, allow the script if prompted, and use the toggle.

To upgrade a manually pasted older copy: Violentmonkey → script → update, or delete and reinstall from the raw URL.

### Firefox on desktop

1. Install **[Violentmonkey](https://addons.mozilla.org/en-US/firefox/addon/violentmonkey/)** or **[Tampermonkey](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)**.
2. Open the [raw script URL](https://raw.githubusercontent.com/Ginger-Automotive/dotdev-calendar/main/dist/dotdev-calendar.user.js) and confirm **Install**.
3. Open sessions or my-list and use the toggle.

### Chrome / Edge on desktop

Supported. Chrome on iOS/Android is **not** (no extensions).

1. Install **[Tampermonkey](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)** or **[Violentmonkey](https://chromewebstore.google.com/detail/violentmonkey/jinjaccalgkegednnccohejagnlnfdag)**.
2. Open the [raw script URL](https://raw.githubusercontent.com/Ginger-Automotive/dotdev-calendar/main/dist/dotdev-calendar.user.js) and confirm **Install**.
3. Open sessions or my-list. If nothing runs, confirm the script is enabled for `dotdev.shopify.com`.

### iOS / iPadOS (Safari)

Chrome on iOS cannot run userscripts. Use Safari + **[Userscripts](https://apps.apple.com/us/app/userscripts/id1463298887)**.

1. Install Userscripts and set a save location when prompted.
2. **Settings → Safari → Extensions**: enable Userscripts (allow `dotdev.shopify.com`).
3. In Safari, open the [raw script URL](https://raw.githubusercontent.com/Ginger-Automotive/dotdev-calendar/main/dist/dotdev-calendar.user.js) → Extensions → Userscripts → install. Or paste the file into the Userscripts dashboard.
4. Open sessions or my-list in Safari with the script active, then use the toggle.

### After install

- Log in on **My list** (ticket email) for wishlist state, clash highlights, and Add/Remove in the overlay.
- List vs Calendar is remembered per browser.

## Development

```bash
npm install
npm run typecheck
npm run build       # src/ → dist/dotdev-calendar.user.js (version from package.json)
npm test
```

Bump `"version"` in `package.json` before each release build so managers treat the file as an update.
