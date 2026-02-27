/**
 * Product Modal - Casa Blanca
 * Design: Warm Luxury - Centered modal for product details and quantity selection
 * Replaces ProductBottomSheet with a centered popup layout.
 *
 * Desktop/Tablet: Side-by-side layout (image left, info right)
 * Mobile: Stacked layout (image top, info below) with internal scroll
 *
 * Features: Full description (no truncation), highlight badges, unit of measure,
 * original price strikethrough, quantity controls, add to cart, upsell trigger.
 *
 * All styles injected via inline styles from menu_style (Design System).
 * Modal elements each use their OWN variable — fully isolated.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { useUI, useCart, useToast, useSiteData } from '@/store/useStore';
import { trackViewItem, trackAddToCart } from '@/lib/analytics';
import { useUpsell } from './UpsellProvider';

// Map highlight tag values to display labels
const HIGHLIGHT_LABELS: Record<string, string> = {
  mais_vendido: '🔥 Mais Vendido',
  novidade: '✨ Novidade',
  vegano: '🌱 Vegano',
};

// Remove trailing zeros: 700.00 → 700, 1.50 → 1.5
function formatUnit(unitValue?: string | null, unit?: string | null): string | null {
  if (!unitValue || !unit) return null;
  const formatted = parseFloat(unitValue);
  if (isNaN(formatted)) return null;
  return `${formatted}${unit}`;
}

export default function ProductModal() {
  const { data } = useSiteData();
  const { selectedProduct, isBottomSheetOpen, closeProductSheet } = useUI();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const ms = data?.menu_style;

  // Reset quantity when product changes + GA4 view_item
  useEffect(() => {
    setQuantity(1);
    setCurrentImageIndex(0);
    if (selectedProduct) {
      trackViewItem({
        id: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedProduct.price,
      });
    }
  }, [selectedProduct]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isBottomSheetOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isBottomSheetOpen]);

  // Close on Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeProductSheet();
    }
  }, [closeProductSheet]);

  useEffect(() => {
    if (isBottomSheetOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isBottomSheetOpen, handleKeyDown]);

  // Upsell trigger (safely handles missing context)
  let triggerUpsell: ((product: any, tenantId: number) => void) | null = null;
  try {
    const upsellCtx = useUpsell();
    triggerUpsell = upsellCtx.triggerUpsell;
  } catch { /* Not inside UpsellProvider */ }

  const handleAddToCart = () => {
    if (!selectedProduct) return;

    // GA4: add_to_cart event
    trackAddToCart({
      id: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      quantity,
    });

    addItem(selectedProduct, quantity);

    showToast(
      'Produto adicionado!',
      `${quantity}x ${selectedProduct.name} adicionado à sacola.`
    );

    closeProductSheet();

    // Trigger upsell check
    const tenantId = useCart.getState().tenantId;
    if (triggerUpsell && tenantId) {
      triggerUpsell(selectedProduct, tenantId);
    }
  };

  const incrementQuantity = () => setQuantity((q) => q + 1);
  const decrementQuantity = () => setQuantity((q) => Math.max(1, q - 1));

  if (!selectedProduct) return null;

  const totalPrice = selectedProduct.price * quantity;
  const highlightLabel = selectedProduct.highlightTag ? HIGHLIGHT_LABELS[selectedProduct.highlightTag] : null;
  const unitDisplay = formatUnit(selectedProduct.unitValue, selectedProduct.unit);

  // ===== ISOLATED MODAL STYLE VARIABLES (Design System) =====
  const modalBg = ms?.modalBgColor;
  const modalNameColor = ms?.modalNameColor;
  const modalUnitColor = ms?.modalUnitColor;
  const modalPriceColor = ms?.modalPriceColor;
  const modalDescColor = ms?.modalDescColor;
  const ctaBg = ms?.modalCtaBgColor;
  const ctaText = ms?.modalCtaTextColor;
  const ctaFont = ms?.modalCtaFont;
  const ctaFontSize = ms?.modalCtaFontSize;
  const ctaFontWeight = ms?.modalCtaFontWeight;
  const qtyLabelColor = ms?.qtyLabelColor;
  const qtyBtnBg = ms?.qtyBtnBgColor;
  const qtyBtnText = ms?.qtyBtnTextColor;
  const qtyNumColor = ms?.qtyNumberColor;

  return (
    <AnimatePresence>
      {isBottomSheetOpen && (
        <>
          {/* Overlay - click to close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeProductSheet}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            style={ms?.panelOverlayColor ? {
              backgroundColor: `${ms.panelOverlayColor}${Math.round((ms.panelOverlayOpacity ?? 50) * 2.55).toString(16).padStart(2, '0')}`,
            } : undefined}
          />

          {/* Centered Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'fixed z-50 inset-0 flex items-center justify-center p-4 pointer-events-none'
            )}
          >
            <div
              className={cn(
                'relative w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl pointer-events-auto',
                !modalBg && 'bg-lp-surface'
              )}
              style={modalBg ? { backgroundColor: modalBg } : undefined}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button (X) - top right */}
              <button
                onClick={closeProductSheet}
                className="absolute right-3 top-3 z-20 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors backdrop-blur-sm"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Content wrapper - scrollable */}
              <div className="overflow-y-auto max-h-[90vh]">
                {/* Responsive layout: side-by-side on md+, stacked on mobile */}
                <div className="flex flex-col md:flex-row">
                  {/* Image Section */}
                  <div className="relative w-full md:w-1/2 bg-lp-surface flex-shrink-0">
                    <div className="relative aspect-square w-full overflow-hidden">
                      {selectedProduct.images?.[currentImageIndex] ? (
                        <img
                          src={selectedProduct.images[currentImageIndex]}
                          alt={selectedProduct.name}
                          className="w-full h-full object-cover object-center"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-lp-surface">
                          <ShoppingBag className="w-20 h-20 text-lp-text-muted" />
                        </div>
                      )}

                      {/* Highlight Badge - top-left floating */}
                      {highlightLabel && (
                        <span className="absolute top-3 left-3 z-10 px-3 py-1.5 rounded-full bg-black/70 text-white text-xs font-medium backdrop-blur-sm">
                          {highlightLabel}
                        </span>
                      )}

                      {/* Image Navigation Dots */}
                      {selectedProduct.images && selectedProduct.images.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                          {selectedProduct.images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={cn(
                                'w-2.5 h-2.5 rounded-full transition-all',
                                index === currentImageIndex
                                  ? 'bg-white w-7 shadow-md'
                                  : 'bg-white/50 hover:bg-white/70'
                              )}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between">
                    <div className="space-y-4">
                      {/* Name */}
                      <div>
                        <h2
                          className={cn('font-display text-2xl md:text-3xl font-bold mb-1', !modalNameColor && 'text-lp-text')}
                          style={modalNameColor ? { color: modalNameColor } : undefined}
                        >
                          {selectedProduct.name}
                        </h2>

                        {/* Unit of measure */}
                        {unitDisplay && (
                          <p
                            className={cn('text-sm mb-2', !modalUnitColor && 'text-lp-text-muted')}
                            style={modalUnitColor ? { color: modalUnitColor } : undefined}
                          >
                            {unitDisplay}
                          </p>
                        )}

                        {/* Price */}
                        <div className="flex items-center gap-3 mt-2">
                          <p
                            className={cn('text-2xl md:text-3xl font-bold', !modalPriceColor && 'text-lp-highlight')}
                            style={modalPriceColor ? { color: modalPriceColor } : undefined}
                          >
                            {formatPrice(selectedProduct.price)}
                          </p>
                          {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                            <span className="text-lp-text-muted text-base line-through">
                              {formatPrice(selectedProduct.originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Description - full, no truncation */}
                      {selectedProduct.description && (
                        <p
                          className={cn('leading-relaxed text-base', !modalDescColor && 'text-lp-text-muted')}
                          style={modalDescColor ? { color: modalDescColor } : undefined}
                        >
                          {selectedProduct.description}
                        </p>
                      )}
                    </div>

                    {/* Bottom actions area */}
                    <div className="mt-6 space-y-4">
                      {/* Quantity Selector */}
                      <div className="flex items-center justify-between py-4 border-t border-lp-border">
                        <span
                          className={cn('font-medium', !qtyLabelColor && 'text-lp-text')}
                          style={qtyLabelColor ? { color: qtyLabelColor } : undefined}
                        >
                          Quantidade
                        </span>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={decrementQuantity}
                            disabled={quantity <= 1}
                            className={cn(
                              'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                              quantity <= 1
                                ? 'bg-lp-surface text-lp-text-muted cursor-not-allowed'
                                : 'bg-lp-surface hover:bg-lp-surface-hover text-lp-text'
                            )}
                            style={quantity > 1 ? {
                              ...(qtyBtnBg ? { backgroundColor: qtyBtnBg } : {}),
                              ...(qtyBtnText ? { color: qtyBtnText } : {}),
                            } : undefined}
                          >
                            <Minus className="w-5 h-5" />
                          </button>
                          <span
                            className={cn('text-xl font-semibold w-8 text-center', !qtyNumColor && 'text-lp-text')}
                            style={qtyNumColor ? { color: qtyNumColor } : undefined}
                          >
                            {quantity}
                          </span>
                          <button
                            onClick={incrementQuantity}
                            className="w-10 h-10 rounded-full bg-lp-btn text-lp-btn-fg flex items-center justify-center hover:bg-lp-btn-hover transition-colors"
                            style={{
                              ...(qtyBtnBg ? { backgroundColor: qtyBtnBg } : {}),
                              ...(qtyBtnText ? { color: qtyBtnText } : {}),
                            }}
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        onClick={handleAddToCart}
                        className="w-full py-4 rounded-full bg-lp-btn text-lp-btn-fg font-semibold text-lg flex items-center justify-center gap-3 hover:bg-lp-btn-hover transition-colors"
                        style={{
                          ...(ctaBg ? { backgroundColor: ctaBg } : {}),
                          ...(ctaText ? { color: ctaText } : {}),
                          ...(ctaFont && ctaFont !== 'inherit' ? { fontFamily: ctaFont } : {}),
                          ...(ctaFontSize ? { fontSize: `${ctaFontSize}px` } : {}),
                          ...(ctaFontWeight ? { fontWeight: ctaFontWeight } : {}),
                        }}
                      >
                        <ShoppingBag className="w-5 h-5" />
                        Adicionar ({quantity}) - {formatPrice(totalPrice)}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
