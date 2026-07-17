type Rgb = { r: number; g: number; b: number };

/** Parse `#rgb`, `#rrggbb`, or `rgb()`/`rgba()` into 0–255 channels. */
export function parseCssColor(raw: string): Rgb | null {
  const value = raw.trim();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value);
  if (hex?.[1]) {
    const h = hex[1];
    if (h.length === 3) {
      return {
        r: Number.parseInt(h[0]! + h[0]!, 16),
        g: Number.parseInt(h[1]! + h[1]!, 16),
        b: Number.parseInt(h[2]! + h[2]!, 16),
      };
    }
    return {
      r: Number.parseInt(h.slice(0, 2), 16),
      g: Number.parseInt(h.slice(2, 4), 16),
      b: Number.parseInt(h.slice(4, 6), 16),
    };
  }
  const rgb = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i.exec(value);
  if (rgb) {
    return { r: Number(rgb[1]), g: Number(rgb[2]), b: Number(rgb[3]) };
  }
  return null;
}

/** Hue in degrees [0, 360), saturation and lightness in [0, 1]. */
export function rgbToHsl({ r, g, b }: Rgb): { h: number; s: number; l: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return { h: h * 360, s, l };
}

/**
 * Pick a clash accent that stays visible against DotDev's rotating page
 * background. Warm oranges/ambers/reds get a cool violet; cooler skies/mints
 * get a vivid magenta-red that still pops on dark "on my list" blocks.
 */
export function clashColorForBackground(bg: string): string {
  const rgb = parseCssColor(bg);
  if (!rgb) return '#4D1FFF';
  const { h, s } = rgbToHsl(rgb);
  const warm = s > 0.25 && (h <= 55 || h >= 330);
  return warm ? '#4D1FFF' : '#FF2D55';
}

/** Read the live theme page background and resolve a clash accent. */
export function resolveClashColor(doc: Document = document): string {
  const root = doc.documentElement;
  const fromRoot = getComputedStyle(root).getPropertyValue('--page-bg-color').trim();
  const fromBody = doc.body
    ? getComputedStyle(doc.body).getPropertyValue('--page-bg-color').trim()
    : '';
  return clashColorForBackground(fromRoot || fromBody || '#8fd5f1');
}
