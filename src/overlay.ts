import { typeLabel } from './timeline';
import type { ParsedSession } from './types';

/**
 * Full-detail overlay for a session. The description and speakers are cloned
 * from the native card so the content (rich text, speaker badges, social
 * links) is always identical to the site's own detail view. The Add/Remove
 * button proxies clicks to the native wishlist button so the site's own
 * wishlist.js handles auth, persistence, and error states.
 */
export function openDetailOverlay(session: ParsedSession): void {
  closeDetailOverlay();

  const overlay = document.createElement('div');
  overlay.className = 'ddc-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', session.title);

  const panel = document.createElement('div');
  panel.className = 'ddc-detail';

  const meta = document.createElement('div');
  meta.className = 'ddc-detail-meta';
  const parts = [session.timeText, session.location, typeLabel(session.type)].filter(Boolean);
  for (const part of parts) {
    const span = document.createElement('span');
    span.textContent = part;
    meta.append(span);
  }

  const title = document.createElement('h2');
  title.className = 'ddc-detail-title';
  title.textContent = session.title;

  const body = document.createElement('div');
  body.className = 'ddc-detail-body';
  const nativeBody = session.element.querySelector('.session__body');
  if (nativeBody) body.append(nativeBody.cloneNode(true));

  const actions = document.createElement('div');
  actions.className = 'ddc-detail-actions';

  const nativeWishlistBtn = session.element.querySelector<HTMLButtonElement>(
    '.session__wishlist-button[data-wishlist-toggle]',
  );
  if (nativeWishlistBtn) {
    const wishBtn = document.createElement('button');
    wishBtn.type = 'button';
    wishBtn.className = 'session__wishlist-button';
    const sync = (): void => {
      const active = nativeWishlistBtn.classList.contains('session__wishlist-button--active');
      wishBtn.textContent = active ? 'Remove from my list' : 'Add to my list';
      wishBtn.classList.toggle('session__wishlist-button--active', active);
    };
    sync();
    wishBtn.addEventListener('click', () => {
      nativeWishlistBtn.click();
      // wishlist.js updates the native button synchronously (optimistic UI).
      setTimeout(sync, 50);
    });
    actions.append(wishBtn);
  }

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'ddc-detail-close';
  closeBtn.textContent = 'Close';
  closeBtn.addEventListener('click', closeDetailOverlay);
  actions.append(closeBtn);

  panel.append(meta, title, body, actions);
  overlay.append(panel);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeDetailOverlay();
  });
  document.addEventListener('keydown', escListener);

  document.body.append(overlay);
  closeBtn.focus();
}

function escListener(e: KeyboardEvent): void {
  if (e.key === 'Escape') closeDetailOverlay();
}

export function closeDetailOverlay(): void {
  document.querySelector('.ddc-overlay')?.remove();
  document.removeEventListener('keydown', escListener);
}
