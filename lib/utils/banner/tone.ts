export const BANNER_DEFAULT_BG = '#000040';
export const BANNER_INK_DARK = '#101216';
export const BANNER_INK_LIGHT = '#ffffff';

export const normalizeHex = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value.trim());
  if (!match) return null;
  const digits = match[1].toLowerCase();
  if (digits.length === 3) {
    return `#${digits
      .split('')
      .map((c) => c + c)
      .join('')}`;
  }
  return `#${digits}`;
};

export const luminance = (hex: string): number => {
  const channel = (start: number) => {
    const v = parseInt(hex.slice(start, start + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
};

export const contrastRatio = (a: string, b: string): number => {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};

export interface BannerTone {
  bg: string;
  fg: string;
  ink: 'dark' | 'light';
}

export const bannerTone = (value: unknown): BannerTone => {
  const bg = normalizeHex(value) ?? BANNER_DEFAULT_BG;
  const withLight = contrastRatio(bg, BANNER_INK_LIGHT);
  const withDark = contrastRatio(bg, BANNER_INK_DARK);
  return withDark > withLight
    ? { bg, fg: BANNER_INK_DARK, ink: 'dark' }
    : { bg, fg: BANNER_INK_LIGHT, ink: 'light' };
};
