/**
 * Tests for Google Integrations:
 * - Google Reviews mock service
 * - Analytics trackEvent utility
 * - Store router Google integration endpoints
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getGoogleReviews, type GoogleReview } from './services/googleReviews';

// ============================================
// Google Reviews Mock Service
// ============================================
describe('Google Reviews Service', () => {
  describe('getGoogleReviews', () => {
    it('should return mock reviews when useMock is true', async () => {
      const reviews = await getGoogleReviews('ChIJ_test', null, true);
      expect(reviews).toHaveLength(3);
      expect(reviews[0]).toHaveProperty('authorName');
      expect(reviews[0]).toHaveProperty('authorPhoto');
      expect(reviews[0]).toHaveProperty('rating');
      expect(reviews[0]).toHaveProperty('text');
      expect(reviews[0]).toHaveProperty('relativeTime');
      expect(reviews[0]).toHaveProperty('isFromGoogle');
    });

    it('should return mock reviews when placeId is null', async () => {
      const reviews = await getGoogleReviews(null, null, false);
      expect(reviews).toHaveLength(3);
    });

    it('should return mock reviews when no API key is provided', async () => {
      const reviews = await getGoogleReviews('ChIJ_test', null, false);
      expect(reviews).toHaveLength(3);
    });

    it('should return mock reviews by default (useMock defaults to true)', async () => {
      const reviews = await getGoogleReviews('ChIJ_test');
      expect(reviews).toHaveLength(3);
    });

    it('mock reviews should have valid ratings (1-5)', async () => {
      const reviews = await getGoogleReviews('ChIJ_test');
      reviews.forEach((review) => {
        expect(review.rating).toBeGreaterThanOrEqual(1);
        expect(review.rating).toBeLessThanOrEqual(5);
      });
    });

    it('mock reviews should have non-empty author names', async () => {
      const reviews = await getGoogleReviews('ChIJ_test');
      reviews.forEach((review) => {
        expect(review.authorName.length).toBeGreaterThan(0);
      });
    });

    it('mock reviews should have non-empty text', async () => {
      const reviews = await getGoogleReviews('ChIJ_test');
      reviews.forEach((review) => {
        expect(review.text.length).toBeGreaterThan(0);
      });
    });

    it('mock reviews should be marked as from Google', async () => {
      const reviews = await getGoogleReviews('ChIJ_test');
      reviews.forEach((review) => {
        expect(review.isFromGoogle).toBe(true);
      });
    });

    it('mock reviews should have photo URLs', async () => {
      const reviews = await getGoogleReviews('ChIJ_test');
      reviews.forEach((review) => {
        expect(review.authorPhoto).toBeTruthy();
        expect(review.authorPhoto).toContain('ui-avatars.com');
      });
    });

    it('mock reviews should have relative time descriptions', async () => {
      const reviews = await getGoogleReviews('ChIJ_test');
      reviews.forEach((review) => {
        expect(review.relativeTime).toBeTruthy();
        expect(review.relativeTime.length).toBeGreaterThan(0);
      });
    });
  });
});

// ============================================
// Analytics trackEvent Utility (Unit Tests)
// ============================================
describe('Analytics trackEvent Utility', () => {
  // We test the analytics module by importing it and checking behavior
  // Since it depends on window.gtag, we mock it

  beforeEach(() => {
    vi.restoreAllMocks();
    // Reset window.gtag
    (globalThis as any).window = {
      gtag: vi.fn(),
    };
  });

  it('trackEvent should call console.log with event name', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    // Dynamic import to get fresh module
    const { trackEvent } = await import('../client/src/lib/analytics');
    trackEvent('test_event', { value: 100 });
    
    expect(consoleSpy).toHaveBeenCalled();
    // Check that the event name appears in the log
    const logCall = consoleSpy.mock.calls[0];
    expect(logCall).toBeDefined();
    // With styled console.log (%c), the event name is in the third argument (index 2)
    const logStr = logCall.join(' ');
    expect(logStr).toContain('test_event');
    
    consoleSpy.mockRestore();
  });

  it('trackEvent should call window.gtag when available', async () => {
    const mockGtag = vi.fn();
    (globalThis as any).window = { gtag: mockGtag };
    
    const { trackEvent } = await import('../client/src/lib/analytics');
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    trackEvent('purchase_whatsapp', { value: 50, currency: 'BRL' });
    
    expect(mockGtag).toHaveBeenCalledWith('event', 'purchase_whatsapp', {
      value: 50,
      currency: 'BRL',
    });
    
    consoleSpy.mockRestore();
  });

  it('trackViewItem should fire view_item event', async () => {
    const mockGtag = vi.fn();
    (globalThis as any).window = { gtag: mockGtag };
    
    const { trackViewItem } = await import('../client/src/lib/analytics');
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    trackViewItem({ id: '1', name: 'Picanha', price: 89.90 });
    
    expect(mockGtag).toHaveBeenCalledWith('event', 'view_item', expect.objectContaining({
      currency: 'BRL',
      value: 89.90,
      item_id: '1',
      item_name: 'Picanha',
    }));
    
    consoleSpy.mockRestore();
  });

  it('trackAddToCart should fire add_to_cart event with correct value', async () => {
    const mockGtag = vi.fn();
    (globalThis as any).window = { gtag: mockGtag };
    
    const { trackAddToCart } = await import('../client/src/lib/analytics');
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    trackAddToCart({ id: '2', name: 'Costela', price: 65.00, quantity: 2 });
    
    expect(mockGtag).toHaveBeenCalledWith('event', 'add_to_cart', expect.objectContaining({
      currency: 'BRL',
      value: 130.00, // price * quantity
      item_id: '2',
      item_name: 'Costela',
      quantity: 2,
    }));
    
    consoleSpy.mockRestore();
  });

  it('trackBeginCheckout should fire begin_checkout event', async () => {
    const mockGtag = vi.fn();
    (globalThis as any).window = { gtag: mockGtag };
    
    const { trackBeginCheckout } = await import('../client/src/lib/analytics');
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    trackBeginCheckout({ totalValue: 250.00, itemCount: 3 });
    
    expect(mockGtag).toHaveBeenCalledWith('event', 'begin_checkout', expect.objectContaining({
      currency: 'BRL',
      value: 250.00,
      item_count: 3,
    }));
    
    consoleSpy.mockRestore();
  });

  it('trackPurchaseWhatsApp should fire purchase_whatsapp event with coupon', async () => {
    const mockGtag = vi.fn();
    (globalThis as any).window = { gtag: mockGtag };
    
    const { trackPurchaseWhatsApp } = await import('../client/src/lib/analytics');
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    trackPurchaseWhatsApp({
      totalValue: 200.00,
      itemCount: 4,
      couponCode: 'PROMO10',
      discountValue: 25.00,
    });
    
    expect(mockGtag).toHaveBeenCalledWith('event', 'purchase_whatsapp', expect.objectContaining({
      currency: 'BRL',
      value: 200.00,
      item_count: 4,
      coupon: 'PROMO10',
      discount: 25.00,
    }));
    
    consoleSpy.mockRestore();
  });

  it('trackPurchaseWhatsApp should handle missing coupon gracefully', async () => {
    const mockGtag = vi.fn();
    (globalThis as any).window = { gtag: mockGtag };
    
    const { trackPurchaseWhatsApp } = await import('../client/src/lib/analytics');
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    trackPurchaseWhatsApp({ totalValue: 100.00, itemCount: 2 });
    
    expect(mockGtag).toHaveBeenCalledWith('event', 'purchase_whatsapp', expect.objectContaining({
      coupon: '',
      discount: 0,
    }));
    
    consoleSpy.mockRestore();
  });

  it('trackEvent should not throw when window.gtag is undefined', async () => {
    (globalThis as any).window = {};
    
    const { trackEvent } = await import('../client/src/lib/analytics');
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    expect(() => trackEvent('test_event')).not.toThrow();
    
    consoleSpy.mockRestore();
  });
});
