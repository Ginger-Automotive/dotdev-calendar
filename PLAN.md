# DotDev 2026 Calendar / Clash Timeline — Options Plan

**Goal:** View the DotDev 2026 [sessions](https://dotdev.shopify.com/pages/sessions) and [my-list](https://dotdev.shopify.com/pages/my-list) pages as a timeline/calendar that makes scheduling clashes obvious, match the DotDev visual language, and toggle back to the site’s existing list view. Prefer fully client-side, low/no hosting cost, and usable on mobile (Chrome extensions do not run on Chrome for iOS/Android).

**Status:** Planning only — no implementation yet.

---

## What we learned from investigation

### Site shape
- `dotdev.shopify.com` is a Shopify Online Store theme (not a separate app host).
- Public pages of interest: `/pages/sessions`, `/pages/my-list` (also `/pages/badge-maker`).
- Catalog is not the schedule: the product sitemap only exposes tickets (`/products/tickets`). Sessions are theme/content data, not Shopify products.
- Visual language (from theme CSS): light page background, near-black “terminal” foreground (`--color-terminal`), mono labels (`--font-mono`) + sans body (`--font-sans`), bordered badges, sticky session filters. Calendar UI should reuse those cues rather than invent a new brand look.

### Schedule data (public)
- Official **DotDev MCP** at `https://dotdev-mcp.shopify.dev/mcp/` (public, no auth).
- Health reports **87 sessions**, FAQ + venue data, backed by private GCS content (not anonymously listable).
- Useful tools: `get_day_schedule`, `search_sessions`, `get_session_detail`, `get_venue_info`, `get_faq`.
- Day 1 ≈ 48 items, Day 2 ≈ 39 items; heavy overlap among talks/workshops/breakouts; product booths are all-day spans.
- MCP returns **markdown text**, not a stable JSON schema. Session IDs exist (e.g. `d1-c001`, repeat slots like `d1-c001r`).
- **Browser CORS:** MCP responses do not expose `Access-Control-Allow-Origin`; OPTIONS preflight is rejected. A pure browser SPA **cannot** call the MCP directly from an arbitrary origin. Server-side or bundled data works fine.

### My List (personalized)
- Requires ticket-email login (“Enter your ticket email to log in and plan your DotDev”).
- FAQ: adding to My List does **not** reserve a seat; it’s a personal planner.
- MCP explicitly exposes **public data only — no attendee / My List information**.
- There is no documented public API for My List. A separate hosted app cannot read your list without either:
  1. Running **on the authenticated DotDev page** (DOM / in-page state), or
  2. A user-driven export/import, or
  3. A server that somehow proxies authenticated requests (fragile, higher cost/risk — not recommended).

### Hosting / rate limits
- The storefront is aggressively rate-limited (frequent HTTP 429 from this environment). Scraping live HTML as a primary data pipeline is unreliable.
- Railway is optional; for a static client app, **GitHub Pages / Cloudflare Pages / Netlify** are free and enough. Railway only helps if you need a tiny proxy.

---

## Core product decisions (independent of delivery vehicle)

| Decision | Options | Notes |
|---|---|---|
| Primary UX | Day timeline with parallel columns / overlap lanes | Best for clash detection; classic month calendar is a poor fit for a 2-day event |
| Scope of “calendar” | Full lineup vs My List only vs both with highlight | Full lineup shows opportunity cost; My List shows personal clashes |
| Toggle “site view ↔ calendar” | In-page overlay vs separate app with link-back | Toggle requirement strongly favors **in-page** injection |
| Booths / logistics | Show as background bands vs hide by default | All-day booths will dominate a timeline if always on |
| Data freshness | Bundle snapshot vs live fetch | Event is ~5 days away (Jul 21–22); a snapshot + manual refresh is likely fine |

**Clash UX sketch (any option):**
- Vertical time axis (e.g. 07:30–22:00 per day).
- Horizontal lanes for overlapping items (or room tracks).
- Clear visual for overlap on **My List** items (the actual decision problem).
- Optional: fade/ghost non-listed sessions when viewing My List mode.
- Day 1 / Day 2 tabs matching the site.

---

## Delivery options

### Option A — Userscript (recommended baseline)

**What:** A `.user.js` that runs on `dotdev.shopify.com/pages/sessions` and `/pages/my-list`, injects a **Calendar / List** toggle, and replaces (or overlays) the session list with a timeline while preserving the native view when toggled off.

| | |
|---|---|
| **Pros** | Works where the user already plans; toggle is natural; My List available because the script runs in the logged-in page; no hosting; no database; fully client-side |
| **Cons** | Not one-click for everyone — needs a userscript manager; Chrome mobile still unsupported natively |
| **Desktop** | Tampermonkey / Violentmonkey (Chrome, Firefox, Edge, Safari desktop) |
| **Mobile** | **iOS Safari:** [Userscripts](https://apps.apple.com/us/app/userscripts/id1463298887) or Stay; **Android:** Firefox + Violentmonkey (Chrome Android still no extensions) |
| **Data** | Parse session cards from the live DOM (already rendered), and/or embed a small JSON snapshot for richer fields |
| **Style** | Inject CSS using DotDev tokens (`--color-terminal`, mono labels, badges) |
| **Cost** | $0 |

**Fits requirements:** toggle ✓, My List ✓, client-side ✓, mobile via Safari/Firefox ✓ (not Chrome mobile).

---

### Option B — Safari Web Extension (iOS-friendly packaged variant of A)

Same idea as A, packaged as a Safari Web Extension (and optionally mirrored as a Chromium MV3 extension for desktop Chrome).

| | |
|---|---|
| **Pros** | Better install UX on Apple devices than raw userscripts; same in-page toggle + My List access |
| **Cons** | Apple Developer account / App Store or TestFlight distribution; more packaging work; still doesn’t help **Chrome on mobile** |
| **Cost** | $0 hosting; possible Apple developer fee if distributing publicly |

Use this if the primary phone is iPhone and you want something more “productized” than Userscripts.app.

---

### Option C — Standalone static web app (GitHub Pages / Cloudflare Pages / Railway static)

**What:** A small SPA at e.g. `dotdev-calendar.pages.dev` with Day 1/Day 2 timeline views, clash detection, and a My List import.

| | |
|---|---|
| **Pros** | Works in **any** mobile browser including Chrome; PWA-installable; easy to share; no DB |
| **Cons** | Does **not** sit on top of the official pages, so “toggle existing view” becomes “open DotDev ↔ open this app”; My List must be imported somehow |
| **Data for full schedule** | Bundle JSON generated once from MCP (`get_day_schedule` × 2 + details); refresh by re-running a script locally/CI |
| **Data for My List** | Manual: paste session titles/IDs, multi-select UI, or a companion bookmarklet that copies list JSON from the authenticated page |
| **Railway?** | Only needed if you want a **~10-line MCP proxy** to avoid bundling. Static hosting is cheaper/simpler otherwise |
| **Cost** | $0 on Pages; Railway free tier only if proxying |

**Toggle compromise:** app header links “Official list view” → DotDev pages; optional query `?mode=list|calendar` only affects the SPA, not DotDev itself.

---

### Option D — Hybrid (best coverage if you need Chrome mobile **and** true toggle)

1. **Userscript / extension** on DotDev pages for in-place calendar + authentic My List + toggle.
2. **Static SPA** (same timeline component) for Chrome mobile / sharing, fed by bundled schedule JSON.
3. Optional **“Export My List”** bookmarklet/userscript button that copies IDs into `localStorage` / clipboard for the SPA.

Shared TypeScript timeline module; two thin shells (content-script vs SPA). Still no database.

---

### Option E — Chrome extension only (rejected as sole solution)

| | |
|---|---|
| **Pros** | Clean desktop UX, content scripts, easy toggle |
| **Cons** | **Does not run on Chrome iOS/Android** — the reason you moved away from this |
| **Verdict** | Fine as a *desktop* build of B/D, not as the only delivery path |

---

### Option F — Server-backed app on Railway (not recommended for your constraints)

Proxy MCP, scrape storefront, store My List server-side, etc.

| | |
|---|---|
| **Pros** | Live data, possible richer sync |
| **Cons** | Hosting + ops; My List auth is the hard part; storefront rate limits; violates “minimize hosting/databases” and “ideally completely client side” |
| **Verdict** | Skip unless Shopify exposes a public My List API later |

---

## Data strategy options (how the calendar gets sessions)

| Approach | Client-side? | My List? | Freshness | Risk |
|---|---|---|---|---|
| **1. DOM parse on DotDev pages** | Yes | Yes (when logged in) | Always current | Fragile if theme markup changes |
| **2. Bundled JSON from MCP (build-time)** | Yes | No (needs import) | Manual/CI refresh | MCP text parsing; IDs help |
| **3. Browser → MCP live** | Blocked by CORS | No | Live | Not viable without proxy |
| **4. Tiny proxy → MCP** | Mostly (UI client-side) | No | Live | Small host cost; still no My List |
| **5. Storefront JSON scrape** | Possible if endpoints exist | Maybe with cookies | Live | Heavy 429s; sessions aren’t products |

**Practical recommendation:**  
- In-page tool → **(1)** primary, optionally hydrate from **(2)** for missing fields.  
- Standalone SPA → **(2)** + My List import from an export helper.

---

## Toggle requirement — how each option satisfies it

| Option | Toggle behavior |
|---|---|
| A / B (in-page) | True toggle: hide native list, show timeline; preference in `localStorage` |
| C (standalone) | Soft toggle: navigate between SPA calendar and official DotDev URLs |
| D (hybrid) | True toggle on DotDev; SPA for browsers that can’t inject |

If “switch this view on and off” means **literally on the DotDev pages**, choose A/B/D, not C alone.

---

## Mobile reality check

| Browser | Extension | Userscript | Static SPA |
|---|---|---|---|
| Desktop Chrome | ✓ | ✓ | ✓ |
| Desktop Safari/Firefox | ✓ / ✓ | ✓ | ✓ |
| **Chrome iOS** | ✗ | ✗ | ✓ |
| Safari iOS | Safari Web Ext / Userscripts.app | ✓ | ✓ |
| Chrome Android | ✗ | ✗ | ✓ |
| Firefox Android | limited | Violentmonkey ✓ | ✓ |

**If Chrome-on-mobile is a hard requirement**, you need at least Option C or D’s SPA — pure extension/userscript cannot cover it.

---

## Suggested architecture (if we proceed)

```
shared/
  types.ts          # Session { id, title, start, end, day, room, type, speakers, ... }
  parseMcp.ts       # optional build-time parser
  clashes.ts        # overlap detection / lane assignment
  TimelineView.ts   # render timeline (vanilla or lightweight framework)

shell-userscript/   # Option A/B
  inject toggle + mount TimelineView over .sessions list
  read My List from DOM / existing page state
  theme CSS variables mirrored from DotDev

shell-spa/          # Option C/D
  static host, bundled sessions.json
  My List via localStorage import
```

**Stack lean:** Vite + TypeScript + vanilla DOM or Preact. No backend, no DB. Optional GitHub Action to regenerate `sessions.json` from MCP.

**Out of scope for v1:** seat availability, push notifications, multi-user sync, editing My List from the SPA (write-back to DotDev).

---

## Recommendation

1. **Default path: Option A (userscript)** — best match for toggle + My List + zero hosting, with iOS via Safari Userscripts.
2. **If you must use Chrome on the phone: Option D (hybrid)** — same timeline, plus a free static SPA and a one-tap My List export from the userscript.
3. **Skip Railway/DB** unless you later need a live MCP proxy; prefer bundling schedule JSON.
4. **Do not rely on Chrome extension alone.**

### Open questions before implementation
1. Is your primary mobile browser **Safari**, **Chrome**, or either?
2. Is the toggle required **on the DotDev pages themselves**, or is a companion site acceptable?
3. Should the timeline show the **full lineup with My List highlighted**, or **My List only** (with optional “browse all”)?
4. Should product booths / meals appear on the timeline by default?

Once those are answered, implementation can start with a shared timeline prototype and the chosen shell(s).
