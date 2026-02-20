/**
 * Landing Page Theme System
 * 
 * Converts the 8 Design System colors into a complete set of CSS variables
 * that control every visual element on the landing page.
 * 
 * Color Groups (8 independent controls):
 * 1. Button Primary (buttonPrimary) → CTA buttons: "Fazer Pedido", "Mandar Mensagem", "Finalizar Compra"
 * 2. Highlight (highlight)          → Prices, links, active filters, icons, overlines, stars
 * 3. Success (success)              → Toast notifications, check icons, cart badges
 * 4. Background (background)        → Site bg, gradients
 * 5. Surface (accent)               → Cards, modals, popups, drawers
 * 6. Text (foreground)              → Headlines, titles
 * 7. Text Muted (muted)             → Subtitles, descriptions, placeholders
 * 8. Border                         → Derived from foreground
 */

export interface LandingThemeColors {
  primary: string;        // LEGACY: kept for backward compat, maps to highlight
  background: string;     // Main site background
  foreground: string;     // Primary text color
  accent: string;         // Surface/card background
  muted: string;          // Secondary text color
  buttonPrimary: string;  // CTA button backgrounds
  highlight: string;      // Prices, links, active states, icons, stars
  success: string;        // Toasts, badges, check icons
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
export function applyLandingTheme(colors: LandingThemeColors, extras?: { badgeOpen?: string; badgeClosed?: string; starColor?: string }, root?: HTMLElement): void {
  const el = root || document.documentElement;
  
  // Resolve the 3 action colors (use legacy primary as fallback)
  const btnColor = colors.buttonPrimary || colors.primary;
  const hlColor = colors.highlight || colors.primary;
  const successColor = colors.success || '#22c55e'; // green default
  
  // === Group 1: Button Primary ===
  // Controls: CTA buttons ("Fazer Pedido", "Mandar Mensagem", "Finalizar Compra", etc.)
  el.style.setProperty('--lp-btn', btnColor);
  el.style.setProperty('--lp-btn-hover', adjustColor(btnColor, -10));
  el.style.setProperty('--lp-btn-fg', getContrastColor(btnColor));
  
  // === Group 2: Highlight ===
  // Controls: Prices, links, active filters, icons, stars, overlines, decorative elements
  el.style.setProperty('--lp-highlight', hlColor);
  el.style.setProperty('--lp-highlight-soft', hexToRgba(hlColor, 0.2));
  el.style.setProperty('--lp-highlight-subtle', hexToRgba(hlColor, 0.1));
  el.style.setProperty('--lp-highlight-muted', hexToRgba(hlColor, 0.3));
  el.style.setProperty('--lp-highlight-border', hexToRgba(hlColor, 0.3));
  el.style.setProperty('--lp-highlight-fg', getContrastColor(hlColor));
  
  // === Group 3: Success ===
  // Controls: Toast notifications, check icons, cart quantity badges
  el.style.setProperty('--lp-success', successColor);
  el.style.setProperty('--lp-success-soft', hexToRgba(successColor, 0.2));
  el.style.setProperty('--lp-success-fg', getContrastColor(successColor));
  
  // === LEGACY: Keep --lp-accent mapped to highlight for any remaining references ===
  el.style.setProperty('--lp-accent', hlColor);
  el.style.setProperty('--lp-accent-hover', adjustColor(hlColor, -10));
  el.style.setProperty('--lp-accent-soft', hexToRgba(hlColor, 0.2));
  el.style.setProperty('--lp-accent-subtle', hexToRgba(hlColor, 0.1));
  el.style.setProperty('--lp-accent-muted', hexToRgba(hlColor, 0.3));
  el.style.setProperty('--lp-accent-border', hexToRgba(hlColor, 0.3));
  el.style.setProperty('--lp-accent-fg', getContrastColor(hlColor));
  
  // === Group 4: Background ===
  // Controls: Main site background, section backgrounds, gradients
  el.style.setProperty('--lp-bg', colors.background);
  el.style.setProperty('--lp-bg-lighter', adjustColor(colors.background, 5));
  el.style.setProperty('--lp-overlay', hexToRgba(colors.background, 0.8));
  el.style.setProperty('--lp-overlay-heavy', hexToRgba(colors.background, 0.95));
  
  // === Group 5: Surface ===
  // Controls: Cards, modals, popups, drawers, input backgrounds
  el.style.setProperty('--lp-surface', colors.accent);
  el.style.setProperty('--lp-surface-hover', adjustColor(colors.accent, 8));
  el.style.setProperty('--lp-surface-soft', hexToRgba(colors.accent, 0.5));
  
  // === Group 6: Text ===
  // Controls: Headlines, titles, primary text
  el.style.setProperty('--lp-text', colors.foreground);
  el.style.setProperty('--lp-text-muted', hexToRgba(colors.foreground, 0.6));
  el.style.setProperty('--lp-text-subtle', hexToRgba(colors.foreground, 0.4));
  el.style.setProperty('--lp-text-faint', hexToRgba(colors.foreground, 0.1));
  
  // === Group 7: Border ===
  // Controls: Card borders, dividers, separators
  el.style.setProperty('--lp-border', hexToRgba(colors.foreground, 0.1));
  el.style.setProperty('--lp-border-strong', hexToRgba(colors.foreground, 0.2));
  
  // === Extra: Status Badges ===
  if (extras?.badgeOpen) el.style.setProperty('--lp-badge-open', extras.badgeOpen);
  if (extras?.badgeClosed) el.style.setProperty('--lp-badge-closed', extras.badgeClosed);
  
  // === Extra: Star Color ===
  if (extras?.starColor) el.style.setProperty('--lp-star', extras.starColor);
  
  // Also update the existing shadcn/ui CSS variables for compatibility
  el.style.setProperty('--primary', btnColor);
  el.style.setProperty('--primary-foreground', getContrastColor(btnColor));
  el.style.setProperty('--background', colors.background);
  el.style.setProperty('--foreground', colors.foreground);
  el.style.setProperty('--card', colors.accent);
  el.style.setProperty('--card-foreground', colors.foreground);
  el.style.setProperty('--muted-foreground', hexToRgba(colors.foreground, 0.6));
  el.style.setProperty('--muted', adjustColor(colors.accent, 5));
  el.style.setProperty('--border', hexToRgba(colors.foreground, 0.1));
  el.style.setProperty('--ring', hlColor);
}

/**
 * Remove all landing page theme CSS variables from the document root.
 */
export function removeLandingTheme(root?: HTMLElement): void {
  const el = root || document.documentElement;
  const vars = [
    '--lp-btn', '--lp-btn-hover', '--lp-btn-fg',
    '--lp-highlight', '--lp-highlight-soft', '--lp-highlight-subtle',
    '--lp-highlight-muted', '--lp-highlight-border', '--lp-highlight-fg',
    '--lp-success', '--lp-success-soft', '--lp-success-fg',
    '--lp-accent', '--lp-accent-hover', '--lp-accent-soft', '--lp-accent-subtle',
    '--lp-accent-muted', '--lp-accent-border', '--lp-accent-fg',
    '--lp-bg', '--lp-bg-lighter', '--lp-overlay', '--lp-overlay-heavy',
    '--lp-surface', '--lp-surface-hover', '--lp-surface-soft',
    '--lp-text', '--lp-text-muted', '--lp-text-subtle', '--lp-text-faint',
    '--lp-border', '--lp-border-strong',
    '--lp-badge-open', '--lp-badge-closed', '--lp-star',
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
  background: '#FFFFFF',
  foreground: '#1a1a1a',
  accent: '#F5F5F5',
  muted: '#71717a',
  buttonPrimary: '#D4AF37',
  highlight: '#D4AF37',
  success: '#22c55e',
};
