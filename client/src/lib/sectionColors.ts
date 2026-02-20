/**
 * Section Colors Helper
 * Generates inline CSS variable overrides for individual sections
 */
import type { SectionColors } from '@/types';

/**
 * Converts a hex color to rgba with given alpha
 */
function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Determines if a color is dark (for contrast calculations)
 */
function isDark(hex: string): boolean {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

/**
 * Generates CSS variable overrides for a section.
 * Returns a React CSSProperties object with CSS custom properties.
 * When a section has enabled=true, it overrides the global --lp-* variables locally.
 */
export function getSectionStyle(sc?: SectionColors): React.CSSProperties | undefined {
  if (!sc?.enabled) return undefined;

  const vars: Record<string, string> = {};

  if (sc.background) {
    vars['--lp-bg'] = sc.background;
    vars['--lp-bg-lighter'] = sc.background;
    // Derive overlay from background
    const dark = isDark(sc.background);
    vars['--lp-overlay'] = dark
      ? hexToRgba(sc.background, 0.8)
      : hexToRgba(sc.background, 0.8);
    vars['--lp-overlay-heavy'] = dark
      ? hexToRgba(sc.background, 0.95)
      : hexToRgba(sc.background, 0.95);
  }

  if (sc.text) {
    vars['--lp-text'] = sc.text;
    vars['--lp-text-muted'] = sc.textMuted || hexToRgba(sc.text, 0.6);
    vars['--lp-text-subtle'] = hexToRgba(sc.text, 0.4);
    vars['--lp-text-faint'] = hexToRgba(sc.text, 0.08);
  } else if (sc.textMuted) {
    vars['--lp-text-muted'] = sc.textMuted;
  }

  if (sc.highlight) {
    vars['--lp-highlight'] = sc.highlight;
    vars['--lp-highlight-soft'] = hexToRgba(sc.highlight, 0.15);
    vars['--lp-highlight-subtle'] = hexToRgba(sc.highlight, 0.08);
    vars['--lp-highlight-muted'] = hexToRgba(sc.highlight, 0.25);
    vars['--lp-highlight-border'] = hexToRgba(sc.highlight, 0.25);
    vars['--lp-highlight-fg'] = isDark(sc.highlight) ? '#FFFFFF' : '#1a1a1a';
    // Also update accent (legacy alias)
    vars['--lp-accent'] = sc.highlight;
    vars['--lp-accent-hover'] = sc.highlight;
    vars['--lp-accent-soft'] = hexToRgba(sc.highlight, 0.15);
    vars['--lp-accent-subtle'] = hexToRgba(sc.highlight, 0.08);
    vars['--lp-accent-muted'] = hexToRgba(sc.highlight, 0.25);
    vars['--lp-accent-border'] = hexToRgba(sc.highlight, 0.25);
    vars['--lp-accent-fg'] = isDark(sc.highlight) ? '#FFFFFF' : '#1a1a1a';
  }

  if (sc.surface) {
    vars['--lp-surface'] = sc.surface;
    vars['--lp-surface-hover'] = sc.surface;
    vars['--lp-surface-soft'] = hexToRgba(sc.surface, 0.5);
  }

  if (sc.border) {
    vars['--lp-border'] = sc.border;
    vars['--lp-border-strong'] = sc.border;
  } else if (sc.text) {
    // Derive border from text color
    vars['--lp-border'] = hexToRgba(sc.text, 0.1);
    vars['--lp-border-strong'] = hexToRgba(sc.text, 0.2);
  }

  if (sc.buttonBg) {
    vars['--lp-btn'] = sc.buttonBg;
    vars['--lp-btn-hover'] = sc.buttonBg;
  }

  if (sc.buttonFg) {
    vars['--lp-btn-fg'] = sc.buttonFg;
  }

  return vars as React.CSSProperties;
}
