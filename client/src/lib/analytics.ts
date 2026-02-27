/**
 * Google Analytics 4 - Event Tracking Utility
 * 
 * Provides a centralized trackEvent function that fires GA4 events
 * and logs them to the console for debugging.
 * 
 * Events tracked:
 * - view_item: When a product modal is opened
 * - add_to_cart: When an item is added to the cart
 * - begin_checkout: When the cart/bag is opened
 * - purchase_whatsapp: When the order is sent via WhatsApp
 */

// Extend Window to include gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export interface TrackEventParams {
  [key: string]: string | number | boolean | undefined | null;
}

/**
 * Fire a GA4 event with optional parameters.
 * Always logs to console for debugging, even if GA4 is not loaded.
 * 
 * @param eventName - The GA4 event name (e.g., 'view_item', 'add_to_cart')
 * @param params - Optional event parameters
 */
export function trackEvent(eventName: string, params: TrackEventParams = {}): void {
  // Always log to console for debugging
  console.log(
    `%c[GA Event Fired]%c ${eventName}`,
    'background: #4285F4; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
    'color: #4285F4; font-weight: bold;',
    params
  );

  // Fire GA4 event if gtag is available
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
}

// ============================================
// Pre-defined E-commerce Event Helpers
// ============================================

/**
 * Track when a user views a product detail (opens product modal).
 */
export function trackViewItem(product: {
  id: string;
  name: string;
  price: number;
  category?: string;
}): void {
  trackEvent('view_item', {
    currency: 'BRL',
    value: product.price,
    item_id: product.id,
    item_name: product.name,
    item_category: product.category || '',
  });
}

/**
 * Track when a user adds an item to the cart.
 */
export function trackAddToCart(product: {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
}): void {
  trackEvent('add_to_cart', {
    currency: 'BRL',
    value: product.price * product.quantity,
    item_id: product.id,
    item_name: product.name,
    item_category: product.category || '',
    quantity: product.quantity,
  });
}

/**
 * Track when the user opens the cart/bag (begin checkout).
 */
export function trackBeginCheckout(cart: {
  totalValue: number;
  itemCount: number;
}): void {
  trackEvent('begin_checkout', {
    currency: 'BRL',
    value: cart.totalValue,
    item_count: cart.itemCount,
  });
}

/**
 * Track when the user sends the order via WhatsApp (purchase equivalent).
 */
export function trackPurchaseWhatsApp(order: {
  totalValue: number;
  itemCount: number;
  couponCode?: string;
  discountValue?: number;
}): void {
  trackEvent('purchase_whatsapp', {
    currency: 'BRL',
    value: order.totalValue,
    item_count: order.itemCount,
    coupon: order.couponCode || '',
    discount: order.discountValue || 0,
  });
}
