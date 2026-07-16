import { parseSessions, sessionsForDay } from './parse';
import { CSS } from './styles';
import { openDetailOverlay } from './overlay';
import { renderTimeline } from './timeline';
import type { ParsedSession } from './types';

const STORAGE_KEY = 'ddc:view';

type View = 'list' | 'calendar';

function savedView(): View {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'calendar' ? 'calendar' : 'list';
  } catch {
    return 'list';
  }
}

function saveView(view: View): void {
  try {
    localStorage.setItem(STORAGE_KEY, view);
  } catch {
    // Storage may be unavailable (private mode); the toggle still works for the session.
  }
}

function activeDay(): string {
  return (
    document.querySelector<HTMLElement>('.date-tab--active')?.dataset.day ??
    document.querySelector<HTMLElement>('.date-tab')?.dataset.day ??
    '1'
  );
}

function isMyListPage(): boolean {
  return window.location.pathname.includes('/pages/my-list');
}

/**
 * A card is "visible" when the site's own day/topic filters (and, on my-list,
 * the wishlist filter) have not hidden it. The native filter script keeps the
 * `hidden` attribute up to date for the active day, so respecting it means
 * the calendar honors the same filters as the list view for free.
 */
function visibleSessions(all: ParsedSession[], day: string): ParsedSession[] {
  return sessionsForDay(all, day).filter((s) => !s.element.hidden);
}

function nativeSectionsToToggle(): HTMLElement[] {
  const sections: HTMLElement[] = [];
  const container = document.querySelector<HTMLElement>('.sessions-container');
  const section = container?.closest<HTMLElement>('.shopify-section');
  if (section) sections.push(section);
  return sections;
}

class CalendarApp {
  private view: View = savedView();
  private root: HTMLElement;
  private buttons: Record<View, HTMLButtonElement>;
  private renderQueued = false;

  constructor(private anchor: HTMLElement) {
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.append(style);

    const toggleWrap = document.createElement('div');
    toggleWrap.className = 'ddc-toggle-wrap';
    toggleWrap.setAttribute('role', 'group');
    toggleWrap.setAttribute('aria-label', 'Schedule view');
    this.buttons = {
      list: this.makeToggleButton('List view', 'list'),
      calendar: this.makeToggleButton('Calendar view', 'calendar'),
    };
    toggleWrap.append(this.buttons.list, this.buttons.calendar);

    this.root = document.createElement('div');
    this.root.className = 'ddc-root';

    this.anchor.after(toggleWrap, this.root);
    this.observeChanges();
    this.applyView();
  }

  private makeToggleButton(label: string, view: View): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ddc-toggle';
    btn.textContent = label;
    btn.addEventListener('click', () => {
      this.view = view;
      saveView(view);
      this.applyView();
    });
    return btn;
  }

  private applyView(): void {
    const calendarOn = this.view === 'calendar';
    this.buttons.list.setAttribute('aria-pressed', String(!calendarOn));
    this.buttons.calendar.setAttribute('aria-pressed', String(calendarOn));
    for (const section of nativeSectionsToToggle()) {
      section.style.display = calendarOn ? 'none' : '';
    }
    this.root.hidden = !calendarOn;
    if (calendarOn) this.render();
  }

  private render(): void {
    const sessions = visibleSessions(parseSessions(document), activeDay());
    this.root.replaceChildren(renderTimeline(sessions, openDetailOverlay));
  }

  private queueRender(): void {
    if (this.view !== 'calendar' || this.renderQueued) return;
    this.renderQueued = true;
    // Let the site's own filter/wishlist handlers finish updating the DOM first.
    setTimeout(() => {
      this.renderQueued = false;
      if (this.view === 'calendar') this.render();
    }, 60);
  }

  private observeChanges(): void {
    const container = document.querySelector('.sessions-container');
    if (container) {
      // Re-render when the native scripts change card visibility (day tabs,
      // filters, my-list) or wishlist button state (Add/Remove).
      const observer = new MutationObserver(() => this.queueRender());
      observer.observe(container, {
        subtree: true,
        attributes: true,
        attributeFilter: ['hidden', 'class', 'data-wishlist-hidden'],
      });
    }

    document.querySelectorAll('.date-tab').forEach((tab) => {
      tab.addEventListener('click', () => this.queueRender());
    });

    let resizeTimer: number | undefined;
    window.addEventListener('resize', () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => this.queueRender(), 150);
    });
  }
}

function init(): void {
  const anchor = document.querySelector<HTMLElement>('.sessions-date-selector');
  const container = document.querySelector('.sessions-container');
  if (!anchor || !container) return;
  const anchorSection = anchor.closest<HTMLElement>('.shopify-section') ?? anchor;
  new CalendarApp(anchorSection);
}

if (
  window.location.pathname.includes('/pages/sessions') ||
  isMyListPage()
) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}
