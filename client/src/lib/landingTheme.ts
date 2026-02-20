/**
 * Landing Page Theme System
 * 
 * Converts the 5 Design System colors into a complete set of CSS variables
 * that control every visual element on the landing page.
 * 
 * Color Groups:
 * 1. Accent (primary)  → Buttons, badges, prices, stars, icons, overlines
 * 2. Accent Foreground → Text on accent backgrounds (button labels)
 * 3. Background        → Site bg, gradients
 * 4. Surface (accent)  → Cards, modals, popups, drawers
 * 5. Text (foreground) → Headlines, titles
 * 6. Text Muted (muted)→ Subtitles, descriptions, placeholders
 * 7. Border            → Card borders, dividers
 */

export interface LandingThemeColors {
  primary: string;    // Accent/highlight color
  background: string; // Main site background
  foreground: string; // Primary text color
  accent: string;     // Surface/card background
  muted: string;      // Secondary text color
}

/**
 * Parse a hex color to RGB components
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

/**
 * Calculate relative luminance of a color (WCAG formula)
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Determine the best contrast color (black or white) for text on a given background
 */
function getContrastColor(bgHex: string): string {
  const { r, g, b } = hexToRgb(bgHex);
  const luminance = getLuminance(r, g, b);
  // Use white text on dark backgrounds, black on light
  return luminance > 0.4 ? '#1a1a1a' : '#ffffff';
}

/**
 * Lighten or darken a hex color by a percentage
 */
function adjustColor(hex: string, percent: number): string {
  const { r, g, b } = hexToRgb(hex);
  const adjust = (c: number) => Math.min(255, Math.max(0, Math.round(c + (255 - c) * (percent / 100))));
  const darken = (c: number) => Math.min(255, Math.max(0, Math.round(c * (1 + percent / 100))));
  
  const fn = percent > 0 ? adjust : (c: number) => darken(c);
  const nr = fn(r);
  const ng = fn(g);
  const nb = fn(b);
  
  return `#${((1 << 24) + (nr << 16) + (ng << 8) + nb).toString(16).slice(1)}`;
}

/**
 * Convert hex to rgba string
 */
function hexToRgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Apply the complete landing page theme to the document root.
 * This sets all CSS variables that components reference.
 */
export function applyLandingTheme(colors: LandingThemeColors, root?: HTMLElement): void {
  const el = root || document.documentElement;
  
  // === Group 1: Accent (Primary) ===
  // Controls: CTA buttons, badges, prices, stars, icons, overlines, active states
  el.style.setProperty('--lp-accent', colors.primary);
  el.style.setProperty('--lp-accent-hover', adjustColor(colors.primary, -10));
  el.style.setProperty('--lp-accent-soft', hexToRgba(colors.primary, 0.2));
  el.style.setProperty('--lp-accent-subtle', hexToRgba(colors.primary, 0.1));
  el.style.setProperty('--lp-accent-muted', hexToRgba(colors.primary, 0.3));
  el.style.setProperty('--lp-accent-border', hexToRgba(colors.primary, 0.3));
  
  // === Group 2: Accent Foreground ===
  // Controls: Text on accent-colored backgrounds (button labels, badge text)
  const accentFg = getContrastColor(colors.primary);
  el.style.setProperty('--lp-accent-fg', accentFg);
  
  // === Group 3: Background ===
  // Controls: Main site background, section backgrounds, gradients
  el.style.setProperty('--lp-bg', colors.background);
  el.style.setProperty('--lp-bg-lighter', adjustColor(colors.background, 5));
  el.style.setProperty('--lp-overlay', hexToRgba(colors.background, 0.8));
  el.style.setProperty('--lp-overlay-heavy', hexToRgba(colors.background, 0.95));
  
  // === Group 4: Surface ===
  // Controls: Cards, modals, popups, drawers, input backgrounds
  el.style.setProperty('--lp-surface', colors.accent);
  el.style.setProperty('--lp-surface-hover', adjustColor(colors.accent, 8));
  el.style.setProperty('--lp-surface-soft', hexToRgba(colors.accent, 0.5));
  
  // === Group 5: Text ===
  // Controls: Headlines, titles, primary text
  el.style.setProperty('--lp-text', colors.foreground);
  el.style.setProperty('--lp-text-muted', hexToRgba(colors.foreground, 0.6));
  el.style.setProperty('--lp-text-subtle', hexToRgba(colors.foreground, 0.4));
  el.style.setProperty('--lp-text-faint', hexToRgba(colors.foreground, 0.1));
  
  // === Group 6: Border ===
  // Controls: Card borders, dividers, separators
  el.style.setProperty('--lp-border', hexToRgba(colors.foreground, 0.1));
  el.style.setProperty('--lp-border-strong', hexToRgba(colors.foreground, 0.2));
  
  // Also update the existing shadcn/ui CSS variables for compatibility
  el.style.setProperty('--primary', colors.primary);
  el.style.setProperty('--primary-foreground', accentFg);
  el.style.setProperty('--background', colors.background);
  el.style.setProperty('--foreground', colors.foreground);
  el.style.setProperty('--card', colors.accent);
  el.style.setProperty('--card-foreground', colors.foreground);
  el.style.setProperty('--muted-foreground', hexToRgba(colors.foreground, 0.6));
  el.style.setProperty('--muted', adjustColor(colors.accent, 5));
  el.style.setProperty('--border', hexToRgba(colors.foreground, 0.1));
  el.style.setProperty('--ring', colors.primary);
}

/**
 * Remove all landing page theme CSS variables from the document root.
 */
export function removeLandingTheme(root?: HTMLElement): void {
  const el = root || document.documentElement;
  const vars = [
    '--lp-accent', '--lp-accent-hover', '--lp-accent-soft', '--lp-accent-subtle',
    '--lp-accent-muted', '--lp-accent-border', '--lp-accent-fg',
    '--lp-bg', '--lp-bg-lighter', '--lp-overlay', '--lp-overlay-heavy',
    '--lp-surface', '--lp-surface-hover', '--lp-surface-soft',
    '--lp-text', '--lp-text-muted', '--lp-text-subtle', '--lp-text-faint',
    '--lp-border', '--lp-border-strong',
    '--primary', '--primary-foreground', '--background', '--foreground',
    '--card', '--card-foreground', '--muted-foreground', '--muted', '--border', '--ring',
  ];
  vars.forEach(v => el.style.removeProperty(v));
}

/**
 * Default theme colors (Casa Blanca gold luxury)
 */
export const DEFAULT_THEME: LandingThemeColors = {
  primary: '#D4AF37',
  background: '#121212',
  foreground: '#FFFFFF',
  accent: '#1a1a1a',
  muted: '#a1a1aa',
};
