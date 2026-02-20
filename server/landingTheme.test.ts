/**
 * Tests for Landing Page Theme System (Design Tokens)
 * Tests the color conversion, contrast calculation, and CSS variable generation
 */

import { describe, it, expect } from 'vitest';

// We test the pure logic functions that are shared between client and server
// Since landingTheme.ts is a client module, we replicate the core logic here for testing

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastColor(bgHex: string): string {
  const { r, g, b } = hexToRgb(bgHex);
  const luminance = getLuminance(r, g, b);
  return luminance > 0.4 ? '#1a1a1a' : '#ffffff';
}

function hexToRgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

describe('Design Tokens - Color Utilities', () => {
  describe('hexToRgb', () => {
    it('should parse standard hex colors', () => {
      expect(hexToRgb('#D4AF37')).toEqual({ r: 212, g: 175, b: 55 });
      expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
      expect(hexToRgb('#121212')).toEqual({ r: 18, g: 18, b: 18 });
    });

    it('should handle hex without hash', () => {
      expect(hexToRgb('D4AF37')).toEqual({ r: 212, g: 175, b: 55 });
    });

    it('should parse pure red, green, blue', () => {
      expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('#00FF00')).toEqual({ r: 0, g: 255, b: 0 });
      expect(hexToRgb('#0000FF')).toEqual({ r: 0, g: 0, b: 255 });
    });
  });

  describe('getLuminance', () => {
    it('should return 0 for black', () => {
      expect(getLuminance(0, 0, 0)).toBeCloseTo(0, 4);
    });

    it('should return 1 for white', () => {
      expect(getLuminance(255, 255, 255)).toBeCloseTo(1, 4);
    });

    it('should return intermediate value for gold', () => {
      const lum = getLuminance(212, 175, 55);
      expect(lum).toBeGreaterThan(0.3);
      expect(lum).toBeLessThan(0.6);
    });
  });

  describe('getContrastColor', () => {
    it('should return white text for dark backgrounds', () => {
      expect(getContrastColor('#000000')).toBe('#ffffff');
      expect(getContrastColor('#121212')).toBe('#ffffff');
      expect(getContrastColor('#1a1a1a')).toBe('#ffffff');
      expect(getContrastColor('#333333')).toBe('#ffffff');
    });

    it('should return dark text for light backgrounds', () => {
      expect(getContrastColor('#FFFFFF')).toBe('#1a1a1a');
      expect(getContrastColor('#F0F0F0')).toBe('#1a1a1a');
      expect(getContrastColor('#EEEEEE')).toBe('#1a1a1a');
    });

    it('should return dark text for gold (D4AF37) since it is a light color', () => {
      // Gold has luminance ~0.42, which is borderline
      const contrast = getContrastColor('#D4AF37');
      // Gold is bright enough that dark text should be used
      expect(contrast).toBe('#1a1a1a');
    });

    it('should return white text for dark blue', () => {
      expect(getContrastColor('#1a237e')).toBe('#ffffff');
    });

    it('should return dark text for yellow', () => {
      expect(getContrastColor('#FFEB3B')).toBe('#1a1a1a');
    });
  });

  describe('hexToRgba', () => {
    it('should convert hex to rgba with specified alpha', () => {
      expect(hexToRgba('#D4AF37', 0.2)).toBe('rgba(212, 175, 55, 0.2)');
      expect(hexToRgba('#FFFFFF', 0.6)).toBe('rgba(255, 255, 255, 0.6)');
      expect(hexToRgba('#000000', 1)).toBe('rgba(0, 0, 0, 1)');
    });

    it('should handle zero alpha', () => {
      expect(hexToRgba('#D4AF37', 0)).toBe('rgba(212, 175, 55, 0)');
    });
  });
});

describe('Design Tokens - Color Groups', () => {
  const defaultTheme = {
    primary: '#D4AF37',
    background: '#121212',
    foreground: '#FFFFFF',
    accent: '#1a1a1a',
    muted: '#a1a1aa',
  };

  it('should have all 5 required color groups', () => {
    const keys = Object.keys(defaultTheme);
    expect(keys).toContain('primary');
    expect(keys).toContain('background');
    expect(keys).toContain('foreground');
    expect(keys).toContain('accent');
    expect(keys).toContain('muted');
  });

  it('should generate correct accent-fg for gold primary', () => {
    const accentFg = getContrastColor(defaultTheme.primary);
    // Gold is light enough for dark text
    expect(accentFg).toBe('#1a1a1a');
  });

  it('should generate correct accent-fg for dark primary', () => {
    const accentFg = getContrastColor('#2d2d8a');
    expect(accentFg).toBe('#ffffff');
  });

  it('should generate correct soft variant', () => {
    const soft = hexToRgba(defaultTheme.primary, 0.2);
    expect(soft).toBe('rgba(212, 175, 55, 0.2)');
  });

  it('should generate correct subtle variant', () => {
    const subtle = hexToRgba(defaultTheme.primary, 0.1);
    expect(subtle).toBe('rgba(212, 175, 55, 0.1)');
  });

  it('should generate correct text-muted from foreground', () => {
    const textMuted = hexToRgba(defaultTheme.foreground, 0.6);
    expect(textMuted).toBe('rgba(255, 255, 255, 0.6)');
  });

  it('should generate correct border from foreground', () => {
    const border = hexToRgba(defaultTheme.foreground, 0.1);
    expect(border).toBe('rgba(255, 255, 255, 0.1)');
  });
});

describe('Design Tokens - Edge Cases', () => {
  it('should handle pure red primary', () => {
    const contrast = getContrastColor('#FF0000');
    // Red has luminance ~0.21, so white text
    expect(contrast).toBe('#ffffff');
  });

  it('should handle pure green primary', () => {
    const contrast = getContrastColor('#00FF00');
    // Green has high luminance ~0.72, so dark text
    expect(contrast).toBe('#1a1a1a');
  });

  it('should handle very dark background', () => {
    const contrast = getContrastColor('#050505');
    expect(contrast).toBe('#ffffff');
  });

  it('should handle white background', () => {
    const contrast = getContrastColor('#FFFFFF');
    expect(contrast).toBe('#1a1a1a');
  });
});
