import { formatMinutes, layoutDay, timeBounds } from './layout';
import type { ParsedSession, PositionedSession } from './types';

/** Sessions at least this long (booths) render as all-day chips, not blocks. */
const ALL_DAY_MIN = 300;

const TYPE_LABELS: Record<string, string> = {
  main_stage: 'Main Stage',
  workshop: 'Workshop',
  talk: 'Talk',
  breakout: 'Breakout',
  product_booth: 'Product Booth',
  na: '',
};

export function typeLabel(type: string): string {
  return TYPE_LABELS[type] ?? '';
}

function pxPerMinute(): number {
  return window.innerWidth >= 750 ? 2 : 1.6;
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function renderBlock(
  s: PositionedSession,
  dayStart: number,
  ppm: number,
  onOpen: (session: ParsedSession) => void,
): HTMLElement {
  const top = (s.startMin - dayStart) * ppm;
  const height = Math.max((s.endMin - s.startMin) * ppm - 2, 18);
  const widthPct = 100 / s.laneCount;

  const block = el('button', 'ddc-block');
  block.type = 'button';
  block.style.top = `${top}px`;
  block.style.height = `${height}px`;
  block.style.left = `${s.lane * widthPct}%`;
  block.style.width = `calc(${widthPct}% - 2px)`;
  if (s.wishlisted) block.classList.add('ddc-listed');
  if (s.clashing) block.classList.add('ddc-clash');
  if (s.featured) block.classList.add('ddc-featured');
  if (height < 44) block.classList.add('ddc-short');

  const type = typeLabel(s.type);
  block.append(
    el('span', 'ddc-block-time', s.timeText),
    el('span', 'ddc-block-title', s.title),
    el('span', 'ddc-block-loc', type ? `${s.location} \u00b7 ${type}` : s.location),
  );
  block.setAttribute(
    'aria-label',
    `${s.title}, ${s.timeText}, ${s.location}${s.clashing ? ', clashes with another session on your list' : ''}`,
  );
  block.addEventListener('click', () => onOpen(s));
  return block;
}

/** Render the timeline for one day into a fresh element. */
export function renderTimeline(
  sessions: ParsedSession[],
  onOpen: (session: ParsedSession) => void,
): HTMLElement {
  const root = el('div', 'ddc-day');

  const allDay = sessions.filter((s) => s.allDay || s.endMin - s.startMin >= ALL_DAY_MIN);
  const timed = sessions.filter((s) => !s.allDay && s.endMin - s.startMin < ALL_DAY_MIN);

  if (sessions.length === 0) {
    root.append(el('p', 'ddc-empty', 'Nothing to show for this day'));
    return root;
  }

  const positioned = layoutDay(timed);
  const clashCount = new Set(positioned.filter((s) => s.clashing).map((s) => s.id)).size;

  const legend = el('div', 'ddc-legend');
  const keyListed = el('span', 'ddc-key-listed');
  keyListed.append(el('i', ''), document.createTextNode('On my list'));
  const keyClash = el('span', 'ddc-key-clash');
  keyClash.append(el('i', ''), document.createTextNode('Clash'));
  legend.append(keyListed, keyClash);
  root.append(legend);

  if (clashCount > 0) {
    root.append(
      el(
        'div',
        'ddc-clash-note',
        `${clashCount} session${clashCount === 1 ? '' : 's'} on your list overlap${clashCount === 1 ? 's' : ''} with another`,
      ),
    );
  }

  if (allDay.length > 0) {
    const strip = el('div', 'ddc-allday');
    for (const s of allDay) {
      const suffix = s.allDay ? 'all day' : s.timeText;
      const chip = el('button', 'ddc-allday-chip', `${s.title} \u00b7 ${suffix}`);
      chip.type = 'button';
      if (s.wishlisted) chip.classList.add('ddc-listed');
      chip.addEventListener('click', () => onOpen(s));
      strip.append(chip);
    }
    root.append(strip);
  }

  const { startMin, endMin } = timeBounds(timed.length > 0 ? timed : sessions);
  const ppm = pxPerMinute();
  const heightPx = (endMin - startMin) * ppm;

  const grid = el('div', 'ddc-grid');
  grid.style.height = `${heightPx}px`;
  const axis = el('div', 'ddc-axis');
  const canvas = el('div', 'ddc-canvas');

  for (let t = startMin; t <= endMin; t += 60) {
    const y = (t - startMin) * ppm;
    const label = el('span', 'ddc-hour-label', formatMinutes(t));
    label.style.top = `${y}px`;
    axis.append(label);
    const line = el('div', 'ddc-hour');
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
