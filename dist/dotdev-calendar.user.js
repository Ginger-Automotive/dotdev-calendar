// ==UserScript==
// @name         DotDev 2026 Calendar View
// @namespace    https://github.com/Ginger-Automotive/dotdev-calendar
// @version      0.1.0
// @description  Adds a toggleable clash-aware calendar/timeline view to the DotDev 2026 sessions and my-list pages
// @author       dotdev-calendar
// @match        https://dotdev.shopify.com/pages/sessions*
// @match        https://dotdev.shopify.com/pages/my-list*
// @run-at       document-idle
// @noframes
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/Ginger-Automotive/dotdev-calendar/main/dist/dotdev-calendar.user.js
// @updateURL    https://raw.githubusercontent.com/Ginger-Automotive/dotdev-calendar/main/dist/dotdev-calendar.user.js
// ==/UserScript==
"use strict";
(() => {
  // src/parse.ts
  var TIME_RANGE_RE = /(\d{1,2}):(\d{2})\s*(am|pm)\s*[-\u2013\u2014]\s*(\d{1,2}):(\d{2})\s*(am|pm)/i;
  function toMinutes(hourStr, minStr, meridiem) {
    let hour = Number(hourStr) % 12;
    if (meridiem.toLowerCase() === "pm") hour += 12;
    return hour * 60 + Number(minStr);
  }
  function parseTimeRange(text) {
    const m = TIME_RANGE_RE.exec(text);
    if (!m) return null;
    const [, h1, m1, mer1, h2, m2, mer2] = m;
    if (!h1 || !m1 || !mer1 || !h2 || !m2 || !mer2) return null;
    return {
      startMin: toMinutes(h1, m1, mer1),
      endMin: toMinutes(h2, m2, mer2)
    };
  }
  function textOf(root, selector) {
    return root.querySelector(selector)?.textContent?.trim() ?? "";
  }
  function parseSessions(doc) {
    const cards = doc.querySelectorAll("details.session[data-session-id]");
    const sessions = [];
    cards.forEach((card) => {
      const id = card.dataset.sessionId ?? "";
      const timeText = textOf(card, ".session__time");
      if (!id || !timeText) return;
      const range = parseTimeRange(timeText);
      if (!range && !/all[\s-]*day/i.test(timeText)) return;
      const wishlistBtn = card.querySelector(".session__wishlist-button");
      sessions.push({
        id,
        day: card.dataset.sessionDay ?? "1",
        type: card.dataset.sessionType ?? "na",
        title: textOf(card, ".session__title"),
        location: textOf(card, ".session__location"),
        startMin: range?.startMin ?? 0,
        endMin: range?.endMin ?? 0,
        timeText,
        allDay: range === null,
        featured: card.dataset.sessionFeatured === "true",
        wishlisted: wishlistBtn?.classList.contains("session__wishlist-button--active") ?? false,
        element: card
      });
    });
    return sessions;
  }
  function sessionsForDay(sessions, day) {
    return sessions.filter((s) => s.day === day || s.day === "both").sort((a, b) => a.startMin - b.startMin || b.endMin - a.endMin);
  }

  // src/styles.ts
  var CSS = `
.ddc-toggle-wrap {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background-color: var(--page-bg-color, #8fd5f1);
  box-shadow: inset 0 -1px 0 var(--color-terminal, #031e1d);
}
.ddc-toggle {
  appearance: none;
  border: none;
  background: none;
  padding: 12px 8px;
  cursor: pointer;
  font-family: var(--font-mono, 'IBM Plex Mono', monospace);
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-terminal, #031e1d);
}
.ddc-toggle[aria-pressed='true'] {
  background-color: var(--color-terminal, #031e1d);
  color: var(--color-grey, #d3d3d3);
}
.ddc-toggle + .ddc-toggle {
  border-left: 1px solid var(--color-terminal, #031e1d);
}

.ddc-root {
  font-family: var(--font-sans, 'Inter', sans-serif);
  color: var(--color-terminal, #031e1d);
  padding: 12px var(--page-padding, 20px) 96px;
  max-width: var(--page-width, 1600px);
  margin: 0 auto;
}
.ddc-root[hidden] { display: none; }

.ddc-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 0 14px;
  font-family: var(--font-mono, 'IBM Plex Mono', monospace);
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.ddc-legend span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.ddc-legend i {
  width: 12px;
  height: 12px;
  border: 1px solid var(--color-terminal, #031e1d);
  font-style: normal;
}
.ddc-legend .ddc-key-listed i { background: var(--color-terminal, #031e1d); }
.ddc-legend .ddc-key-clash i { background: #ff3b3b; border-color: #ff3b3b; }

.ddc-allday {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 14px;
}
.ddc-allday-chip {
  border: 1px solid var(--color-terminal, #031e1d);
  background: var(--color-grey, #d3d3d3);
  font-family: var(--font-mono, 'IBM Plex Mono', monospace);
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 4px 8px;
  cursor: pointer;
  color: inherit;
}
.ddc-allday-chip.ddc-listed {
  background: var(--color-terminal, #031e1d);
  color: var(--color-grey, #d3d3d3);
}

.ddc-grid {
  position: relative;
  display: grid;
  grid-template-columns: 52px 1fr;
}
.ddc-axis { position: relative; }
.ddc-hour {
  position: absolute;
  left: 0;
  right: 0;
  border-top: 1px solid var(--color-terminal, #031e1d);
  opacity: 0.35;
}
.ddc-hour-label {
  position: absolute;
  transform: translateY(-55%);
  background: var(--page-bg-color, #8fd5f1);
  padding-right: 6px;
  font-family: var(--font-mono, 'IBM Plex Mono', monospace);
  font-size: 0.6875rem;
  text-transform: uppercase;
  z-index: 1;
}
.ddc-canvas { position: relative; }

.ddc-block {
  position: absolute;
  box-sizing: border-box;
  overflow: hidden;
  display: block;
  width: 100%;
  text-align: left;
  border: 1px solid var(--color-terminal, #031e1d);
  background: var(--color-grey, #d3d3d3);
  color: var(--color-terminal, #031e1d);
  padding: 4px 6px;
  cursor: pointer;
  font-family: var(--font-sans, 'Inter', sans-serif);
}
.ddc-block:hover { filter: brightness(1.06); }
.ddc-block.ddc-listed {
  background: var(--color-terminal, #031e1d);
  color: var(--color-grey, #d3d3d3);
}
.ddc-block.ddc-clash {
  border: 2px solid #ff3b3b;
  box-shadow: 0 0 0 1px #ff3b3b;
}
.ddc-block.ddc-featured:not(.ddc-listed) { background: var(--page-bg-color, #8fd5f1); }

.ddc-block-time {
  font-family: var(--font-mono, 'IBM Plex Mono', monospace);
  font-size: 0.625rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ddc-block-title {
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.25;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
.ddc-block-loc {
  font-family: var(--font-mono, 'IBM Plex Mono', monospace);
  font-size: 0.625rem;
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ddc-block.ddc-short { padding-block: 1px 0; }
.ddc-block.ddc-short .ddc-block-title { -webkit-line-clamp: 1; font-size: 0.6875rem; }
.ddc-block.ddc-short .ddc-block-loc { display: none; }

.ddc-clash-note {
  border: 2px solid #ff3b3b;
  background: var(--color-grey, #d3d3d3);
  font-family: var(--font-mono, 'IBM Plex Mono', monospace);
  font-size: 0.75rem;
  padding: 8px 10px;
  margin-bottom: 12px;
}

.ddc-empty {
  padding: 48px 0;
  text-align: center;
  font-family: var(--font-mono, 'IBM Plex Mono', monospace);
  text-transform: uppercase;
  font-size: 0.8125rem;
}

/* Detail overlay */
.ddc-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}
.ddc-overlay[hidden] { display: none; }
.ddc-detail {
  background: var(--color-grey, #d3d3d3);
  color: var(--color-terminal, #031e1d);
  border: 1px solid var(--color-terminal, #031e1d);
  max-width: 680px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  padding: 20px;
  font-family: var(--font-sans, 'Inter', sans-serif);
}
.ddc-detail-meta {
  font-family: var(--font-mono, 'IBM Plex Mono', monospace);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
}
.ddc-detail-title {
  font-size: 1.375rem;
  font-weight: 500;
  margin: 0 0 12px;
}
.ddc-detail-body { line-height: 1.6; font-size: 0.9375rem; }
.ddc-detail-body .session__body {
  display: block;
  border-top: 1px solid var(--color-terminal, #031e1d);
  padding: 12px 0 0;
}
.ddc-detail-body .session__body::before,
.ddc-detail-body .session__body::after { display: none; }
.ddc-detail-body .session__description,
.ddc-detail-body .session__speakers { padding: 0 0 14px; }
.ddc-detail-body .session__speakers {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.ddc-detail-actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}
.ddc-detail-actions .session__wishlist-button {
  position: static;
  grid-area: auto;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: #fff;
  border: 1px solid var(--color-terminal, #031e1d);
  border-radius: 50px;
  padding: 6px 14px;
  cursor: pointer;
  color: inherit;
}
.ddc-detail-actions .session__wishlist-button--active {
  background: var(--color-terminal, #031e1d);
  color: var(--color-grey, #d3d3d3);
}
.ddc-detail-close {
  border: 1px solid var(--color-terminal, #031e1d);
  border-radius: 50px;
  background: none;
  font-family: var(--font-mono, 'IBM Plex Mono', monospace);
  font-size: 0.75rem;
  text-transform: uppercase;
  padding: 6px 14px;
  cursor: pointer;
  color: inherit;
}

@media (min-width: 750px) {
  .ddc-grid { grid-template-columns: 64px 1fr; }
  .ddc-block-title { font-size: 0.8125rem; }
}
`;

  // src/layout.ts
  function overlaps(a, b) {
    return a.startMin < b.endMin && b.startMin < a.endMin;
  }
  function layoutDay(sessions) {
    const sorted = [...sessions].sort((a, b) => a.startMin - b.startMin || b.endMin - a.endMin);
    const result = [];
    let cluster = [];
    let laneEnds = [];
    let clusterEnd = -1;
    const flushCluster = () => {
      for (const s of cluster) s.laneCount = laneEnds.length;
      result.push(...cluster);
      cluster = [];
      laneEnds = [];
    };
    for (const s of sorted) {
      if (cluster.length > 0 && s.startMin >= clusterEnd) flushCluster();
      let lane = laneEnds.findIndex((end) => end <= s.startMin);
      if (lane === -1) {
        lane = laneEnds.length;
        laneEnds.push(s.endMin);
      } else {
        laneEnds[lane] = s.endMin;
      }
      cluster.push({ ...s, lane, laneCount: 1, clashing: false });
      clusterEnd = Math.max(clusterEnd, s.endMin);
    }
    flushCluster();
    markClashes(result);
    return result;
  }
  function markClashes(sessions) {
    const listed = sessions.filter((s) => s.wishlisted);
    for (let i = 0; i < listed.length; i++) {
      for (let j = i + 1; j < listed.length; j++) {
        const a = listed[i];
        const b = listed[j];
        if (a && b && overlaps(a, b)) {
          a.clashing = true;
          b.clashing = true;
        }
      }
    }
  }
  function timeBounds(sessions) {
    if (sessions.length === 0) return { startMin: 8 * 60, endMin: 18 * 60 };
    let start = Infinity;
    let end = -Infinity;
    for (const s of sessions) {
      start = Math.min(start, s.startMin);
      end = Math.max(end, s.endMin);
    }
    return { startMin: Math.floor(start / 60) * 60, endMin: Math.ceil(end / 60) * 60 };
  }
  function formatMinutes(min) {
    const hour24 = Math.floor(min / 60);
    const minute = min % 60;
    const meridiem = hour24 >= 12 ? "pm" : "am";
    const hour = hour24 % 12 === 0 ? 12 : hour24 % 12;
    return minute === 0 ? `${hour}${meridiem}` : `${hour}:${String(minute).padStart(2, "0")}${meridiem}`;
  }

  // src/timeline.ts
  var ALL_DAY_MIN = 300;
  var TYPE_LABELS = {
    main_stage: "Main Stage",
    workshop: "Workshop",
    talk: "Talk",
    breakout: "Breakout",
    product_booth: "Product Booth",
    na: ""
  };
  function typeLabel(type) {
    return TYPE_LABELS[type] ?? "";
  }
  function pxPerMinute() {
    return window.innerWidth >= 750 ? 2 : 1.6;
  }
  function el(tag, className, text) {
    const node = document.createElement(tag);
    node.className = className;
    if (text !== void 0) node.textContent = text;
    return node;
  }
  function renderBlock(s, dayStart, ppm, onOpen) {
    const top = (s.startMin - dayStart) * ppm;
    const height = Math.max((s.endMin - s.startMin) * ppm - 2, 18);
    const widthPct = 100 / s.laneCount;
    const block = el("button", "ddc-block");
    block.type = "button";
    block.style.top = `${top}px`;
    block.style.height = `${height}px`;
    block.style.left = `${s.lane * widthPct}%`;
    block.style.width = `calc(${widthPct}% - 2px)`;
    if (s.wishlisted) block.classList.add("ddc-listed");
    if (s.clashing) block.classList.add("ddc-clash");
    if (s.featured) block.classList.add("ddc-featured");
    if (height < 44) block.classList.add("ddc-short");
    const type = typeLabel(s.type);
    block.append(
      el("span", "ddc-block-time", s.timeText),
      el("span", "ddc-block-title", s.title),
      el("span", "ddc-block-loc", type ? `${s.location} \xB7 ${type}` : s.location)
    );
    block.setAttribute(
      "aria-label",
      `${s.title}, ${s.timeText}, ${s.location}${s.clashing ? ", clashes with another session on your list" : ""}`
    );
    block.addEventListener("click", () => onOpen(s));
    return block;
  }
  function renderTimeline(sessions, onOpen) {
    const root = el("div", "ddc-day");
    const allDay = sessions.filter((s) => s.allDay || s.endMin - s.startMin >= ALL_DAY_MIN);
    const timed = sessions.filter((s) => !s.allDay && s.endMin - s.startMin < ALL_DAY_MIN);
    if (sessions.length === 0) {
      root.append(el("p", "ddc-empty", "Nothing to show for this day"));
      return root;
    }
    const positioned = layoutDay(timed);
    const clashCount = new Set(positioned.filter((s) => s.clashing).map((s) => s.id)).size;
    const legend = el("div", "ddc-legend");
    const keyListed = el("span", "ddc-key-listed");
    keyListed.append(el("i", ""), document.createTextNode("On my list"));
    const keyClash = el("span", "ddc-key-clash");
    keyClash.append(el("i", ""), document.createTextNode("Clash"));
    legend.append(keyListed, keyClash);
    root.append(legend);
    if (clashCount > 0) {
      root.append(
        el(
          "div",
          "ddc-clash-note",
          `${clashCount} session${clashCount === 1 ? "" : "s"} on your list overlap${clashCount === 1 ? "s" : ""} with another`
        )
      );
    }
    if (allDay.length > 0) {
      const strip = el("div", "ddc-allday");
      for (const s of allDay) {
        const suffix = s.allDay ? "all day" : s.timeText;
        const chip = el("button", "ddc-allday-chip", `${s.title} \xB7 ${suffix}`);
        chip.type = "button";
        if (s.wishlisted) chip.classList.add("ddc-listed");
        chip.addEventListener("click", () => onOpen(s));
        strip.append(chip);
      }
      root.append(strip);
    }
    const { startMin, endMin } = timeBounds(timed.length > 0 ? timed : sessions);
    const ppm = pxPerMinute();
    const heightPx = (endMin - startMin) * ppm;
    const grid = el("div", "ddc-grid");
    grid.style.height = `${heightPx}px`;
    const axis = el("div", "ddc-axis");
    const canvas = el("div", "ddc-canvas");
    for (let t = startMin; t <= endMin; t += 60) {
      const y = (t - startMin) * ppm;
      const label = el("span", "ddc-hour-label", formatMinutes(t));
      label.style.top = `${y}px`;
      axis.append(label);
      const line = el("div", "ddc-hour");
      line.style.top = `${y}px`;
      canvas.append(line);
    }
    for (const s of positioned) {
      canvas.append(renderBlock(s, startMin, ppm, onOpen));
    }
    grid.append(axis, canvas);
    root.append(grid);
    return root;
  }

  // src/overlay.ts
  function openDetailOverlay(session) {
    closeDetailOverlay();
    const overlay = document.createElement("div");
    overlay.className = "ddc-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", session.title);
    const panel = document.createElement("div");
    panel.className = "ddc-detail";
    const meta = document.createElement("div");
    meta.className = "ddc-detail-meta";
    const parts = [session.timeText, session.location, typeLabel(session.type)].filter(Boolean);
    for (const part of parts) {
      const span = document.createElement("span");
      span.textContent = part;
      meta.append(span);
    }
    const title = document.createElement("h2");
    title.className = "ddc-detail-title";
    title.textContent = session.title;
    const body = document.createElement("div");
    body.className = "ddc-detail-body";
    const nativeBody = session.element.querySelector(".session__body");
    if (nativeBody) body.append(nativeBody.cloneNode(true));
    const actions = document.createElement("div");
    actions.className = "ddc-detail-actions";
    const nativeWishlistBtn = session.element.querySelector(
      ".session__wishlist-button[data-wishlist-toggle]"
    );
    if (nativeWishlistBtn) {
      const wishBtn = document.createElement("button");
      wishBtn.type = "button";
      wishBtn.className = "session__wishlist-button";
      const sync = () => {
        const active = nativeWishlistBtn.classList.contains("session__wishlist-button--active");
        wishBtn.textContent = active ? "Remove from my list" : "Add to my list";
        wishBtn.classList.toggle("session__wishlist-button--active", active);
      };
      sync();
      wishBtn.addEventListener("click", () => {
        nativeWishlistBtn.click();
        setTimeout(sync, 50);
      });
      actions.append(wishBtn);
    }
    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "ddc-detail-close";
    closeBtn.textContent = "Close";
    closeBtn.addEventListener("click", closeDetailOverlay);
    actions.append(closeBtn);
    panel.append(meta, title, body, actions);
    overlay.append(panel);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeDetailOverlay();
    });
    document.addEventListener("keydown", escListener);
    document.body.append(overlay);
    closeBtn.focus();
  }
  function escListener(e) {
    if (e.key === "Escape") closeDetailOverlay();
  }
  function closeDetailOverlay() {
    document.querySelector(".ddc-overlay")?.remove();
    document.removeEventListener("keydown", escListener);
  }

  // src/main.ts
  var STORAGE_KEY = "ddc:view";
  function savedView() {
    try {
      return localStorage.getItem(STORAGE_KEY) === "calendar" ? "calendar" : "list";
    } catch {
      return "list";
    }
  }
  function saveView(view) {
    try {
      localStorage.setItem(STORAGE_KEY, view);
    } catch {
    }
  }
  function activeDay() {
    return document.querySelector(".date-tab--active")?.dataset.day ?? document.querySelector(".date-tab")?.dataset.day ?? "1";
  }
  function isMyListPage() {
    return window.location.pathname.includes("/pages/my-list");
  }
  function visibleSessions(all, day) {
    return sessionsForDay(all, day).filter((s) => !s.element.hidden);
  }
  function nativeSectionsToToggle() {
    const sections = [];
    const container = document.querySelector(".sessions-container");
    const section = container?.closest(".shopify-section");
    if (section) sections.push(section);
    return sections;
  }
  var CalendarApp = class {
    constructor(anchor) {
      this.anchor = anchor;
      this.view = savedView();
      this.renderQueued = false;
      const style = document.createElement("style");
      style.textContent = CSS;
      document.head.append(style);
      const toggleWrap = document.createElement("div");
      toggleWrap.className = "ddc-toggle-wrap";
      toggleWrap.setAttribute("role", "group");
      toggleWrap.setAttribute("aria-label", "Schedule view");
      this.buttons = {
        list: this.makeToggleButton("List view", "list"),
        calendar: this.makeToggleButton("Calendar view", "calendar")
      };
      toggleWrap.append(this.buttons.list, this.buttons.calendar);
      this.root = document.createElement("div");
      this.root.className = "ddc-root";
      this.anchor.after(toggleWrap, this.root);
      this.observeChanges();
      this.applyView();
    }
    makeToggleButton(label, view) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ddc-toggle";
      btn.textContent = label;
      btn.addEventListener("click", () => {
        this.view = view;
        saveView(view);
        this.applyView();
      });
      return btn;
    }
    applyView() {
      const calendarOn = this.view === "calendar";
      this.buttons.list.setAttribute("aria-pressed", String(!calendarOn));
      this.buttons.calendar.setAttribute("aria-pressed", String(calendarOn));
      for (const section of nativeSectionsToToggle()) {
        section.style.display = calendarOn ? "none" : "";
      }
      this.root.hidden = !calendarOn;
      if (calendarOn) this.render();
    }
    render() {
      const sessions = visibleSessions(parseSessions(document), activeDay());
      this.root.replaceChildren(renderTimeline(sessions, openDetailOverlay));
    }
    queueRender() {
      if (this.view !== "calendar" || this.renderQueued) return;
      this.renderQueued = true;
      setTimeout(() => {
        this.renderQueued = false;
        if (this.view === "calendar") this.render();
      }, 60);
    }
    observeChanges() {
      const container = document.querySelector(".sessions-container");
      if (container) {
        const observer = new MutationObserver(() => this.queueRender());
        observer.observe(container, {
          subtree: true,
          attributes: true,
          attributeFilter: ["hidden", "class", "data-wishlist-hidden"]
        });
      }
      document.querySelectorAll(".date-tab").forEach((tab) => {
        tab.addEventListener("click", () => this.queueRender());
      });
      let resizeTimer;
      window.addEventListener("resize", () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => this.queueRender(), 150);
      });
    }
  };
  function init() {
    const anchor = document.querySelector(".sessions-date-selector");
    const container = document.querySelector(".sessions-container");
    if (!anchor || !container) return;
    const anchorSection = anchor.closest(".shopify-section") ?? anchor;
    new CalendarApp(anchorSection);
  }
  if (window.location.pathname.includes("/pages/sessions") || isMyListPage()) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  }
})();
