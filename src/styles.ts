/**
 * Calendar styles. Reuses the DotDev theme's CSS custom properties
 * (--color-terminal, --page-bg-color, --font-mono, ...) with fallbacks
 * matching the live site so the view degrades gracefully.
 */
export const CSS = `
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
