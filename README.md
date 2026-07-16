# dotdev-calendar

A userscript that adds a **toggleable, clash-aware calendar view** to the [DotDev 2026](https://dotdev.shopify.com/) schedule pages:

- [The lineup](https://dotdev.shopify.com/pages/sessions) (`/pages/sessions`)
- [My list](https://dotdev.shopify.com/pages/my-list) (`/pages/my-list`)

A **List view / Calendar view** toggle appears under the Day 1 / Day 2 tabs. Calendar view lays sessions out on a vertical timeline with side-by-side lanes for overlaps. Sessions on your My List are filled dark; any two listed sessions that overlap get a red **clash** outline and a banner. Product booths render as all-day chips. Tapping a session opens its full details (description, speakers, prerequisites) with an Add/Remove my-list button that uses the site's own wishlist mechanism, so login state and persistence behave exactly like the native pages.

The site's Day tabs, topic filters, and my-list filtering all keep working — the calendar re-renders from whatever the native filters leave visible. Styling reuses the DotDev theme's own CSS variables (colors rotate per visit, like the site).

## Install

You need a userscript manager, then install [`dist/dotdev-calendar.user.js`](https://raw.githubusercontent.com/Ginger-Automotive/dotdev-calendar/main/dist/dotdev-calendar.user.js).

| Platform | Manager |
|---|---|
| Desktop Chrome / Edge / Firefox | [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/) |
| iOS / iPadOS Safari | [Userscripts](https://apps.apple.com/us/app/userscripts/id1463298887) (free, open source) |
| Android | Firefox + Violentmonkey |

Chrome on iOS/Android does not support extensions or userscripts — use Safari (iOS) or Firefox (Android) there.

**Steps:** install the manager → open the raw script URL above → the manager prompts to install → visit the sessions or my-list page and use the toggle. Your view choice is remembered per browser.

## Development

```bash
npm install
npm run typecheck   # strict TS
npm run build       # bundles src/ -> dist/dotdev-calendar.user.js
npm test            # jsdom smoke tests against test/fixtures/sessions.html
node scripts/screenshot.mjs  # optional: visual check (needs Chrome + a saved raw page HTML)
```

The parser reads each `details.session` card's `data-*` attributes and header, so it needs no network access and works with whatever the page has server-rendered (including logged-in wishlist state). See `PLAN.md` for the option analysis that led to this design.
