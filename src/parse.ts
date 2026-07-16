import type { ParsedSession, SessionType } from './types';

const TIME_RANGE_RE = /(\d{1,2}):(\d{2})\s*(am|pm)\s*[-\u2013\u2014]\s*(\d{1,2}):(\d{2})\s*(am|pm)/i;

export function toMinutes(hourStr: string, minStr: string, meridiem: string): number {
  let hour = Number(hourStr) % 12;
  if (meridiem.toLowerCase() === 'pm') hour += 12;
  return hour * 60 + Number(minStr);
}

export function parseTimeRange(text: string): { startMin: number; endMin: number } | null {
  const m = TIME_RANGE_RE.exec(text);
  if (!m) return null;
  const [, h1, m1, mer1, h2, m2, mer2] = m;
  if (!h1 || !m1 || !mer1 || !h2 || !m2 || !mer2) return null;
  return {
    startMin: toMinutes(h1, m1, mer1),
    endMin: toMinutes(h2, m2, mer2),
  };
}

function textOf(root: Element, selector: string): string {
  return root.querySelector(selector)?.textContent?.trim() ?? '';
}

/**
 * Parse every session card on the page. Cards carry all schedule data in
 * data-* attributes and the visible header, so this works on both
 * /pages/sessions and /pages/my-list regardless of current filters.
 */
export function parseSessions(doc: Document): ParsedSession[] {
  const cards = doc.querySelectorAll<HTMLElement>('details.session[data-session-id]');
  const sessions: ParsedSession[] = [];

  cards.forEach((card) => {
    const id = card.dataset.sessionId ?? '';
    const timeText = textOf(card, '.session__time');
    if (!id || !timeText) return;

    // Product booths render "All day" instead of a time range.
    const range = parseTimeRange(timeText);
    if (!range && !/all[\s-]*day/i.test(timeText)) return;

    const wishlistBtn = card.querySelector('.session__wishlist-button');
    sessions.push({
      id,
      day: card.dataset.sessionDay ?? '1',
      type: (card.dataset.sessionType ?? 'na') as SessionType,
      title: textOf(card, '.session__title'),
      location: textOf(card, '.session__location'),
      startMin: range?.startMin ?? 0,
      endMin: range?.endMin ?? 0,
      timeText,
      allDay: range === null,
      featured: card.dataset.sessionFeatured === 'true',
      wishlisted: wishlistBtn?.classList.contains('session__wishlist-button--active') ?? false,
      element: card,
    });
  });

  return sessions;
}

export function sessionsForDay(sessions: ParsedSession[], day: string): ParsedSession[] {
  return sessions
    .filter((s) => s.day === day || s.day === 'both')
    .sort((a, b) => a.startMin - b.startMin || b.endMin - a.endMin);
}
