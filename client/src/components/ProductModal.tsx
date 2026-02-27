/**
 * Product Modal - Casa Blanca
 * Design: Warm Luxury - Glassmorphism centered modal
 *
 * Desktop/Tablet: Side-by-side — image covers full height on left, info scrolls on right
 * Mobile: Stacked — large image top (~60vh), info scrolls below
 *
 * Glassmorphism: backdrop-blur-lg + bg-black/60 overlay for premium depth effect
 *
 * Features: Full description (no truncation), highlight badges over expanded image,
 * original price strikethrough, unit of measure, quantity controls, add to cart, upsell.
 *
 * All styles injected via inline styles from menu_style (Design System).
 * 5 key variables: product_modal_bg → modalBgColor, product_modal_text → modalNameColor,
 * product_modal_price → modalPriceColor, product_modal_button_bg → modalCtaBgColor,
 * product_modal_button_text → modalCtaTextColor.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { useUI, useCart, useToast, useSiteData } from '@/store/useStore';
import { trackViewItem, trackAddToCart } from '@/lib/analytics';
import { useUpsell } from './UpsellProvider';

const HIGHLIGHT_LABELS: Record<string, string> = {
  mais_vendido: '🔥 Mais Vendido',
  novidade: '✨ Novidade',
  vegano: '🌱 Vegano',
};

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

  // Reset state when product changes + GA4 view_item
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

  // Lock body scroll
  useEffect(() => {
    if (isBottomSheetOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isBottomSheetOpen]);

  // Close on Escape
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') closeProductSheet();
  }, [closeProductSheet]);

  useEffect(() => {
    if (isBottomSheetOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isBottomSheetOpen, handleKeyDown]);

  // Upsell trigger (safely handles missing context)
  let triggerUpsell: ((product: any, tenantId: number) => void) | null = null;
  try {
    const upsellCtx = useUpsell();
    triggerUpsell = upsellCtx.triggerUpsell;
  } catch { /* Not inside UpsellProvider */ }

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    trackAddToCart({
      id: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      quantity,
    });
    addItem(selectedProduct, quantity);
    showToast('Produto adicionado!', `${quantity}x ${selectedProduct.name} adicionado à sacola.`);
    closeProductSheet();
    const tenantId = useCart.getState().tenantId;
    if (triggerUpsell && tenantId) triggerUpsell(selectedProduct, tenantId);
  };

  const incrementQuantity = () => setQuantity((q) => q + 1);
  const decrementQuantity = () => setQuantity((q) => Math.max(1, q - 1));

  if (!selectedProduct) return null;

  const totalPrice = selectedProduct.price * quantity;
  const highlightLabel = selectedProduct.highlightTag ? HIGHLIGHT_LABELS[selectedProduct.highlightTag] : null;
  const unitDisplay = formatUnit(selectedProduct.unitValue, selectedProduct.unit);

  // ===== DESIGN SYSTEM VARIABLES =====
  const modalBg = ms?.modalBgColor;
  const nameColor = ms?.modalNameColor;
  const unitColor = ms?.modalUnitColor;
  const priceColor = ms?.modalPriceColor;
  const descColor = ms?.modalDescColor;
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
          {/* ===== GLASSMORPHISM OVERLAY ===== */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeProductSheet}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-lg"
            style={ms?.panelOverlayColor ? {
              backgroundColor: `${ms.panelOverlayColor}${Math.round((ms.panelOverlayOpacity ?? 60) * 2.55).toString(16).padStart(2, '0')}`,
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            } : undefined}
          />

          {/* ===== CENTERED MODAL CONTAINER ===== */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="fixed z-50 inset-0 flex items-center justify-center p-3 sm:p-6 pointer-events-none"
          >
            <div
              className={cn(
                'relative w-full max-w-5xl pointer-events-auto',
                'rounded-3xl overflow-hidden',
                'shadow-[0_25px_80px_-12px_rgba(0,0,0,0.6)]',
                'ring-1 ring-white/10',
                !modalBg && 'bg-[#111111]'
              )}
              style={{
                ...(modalBg ? { backgroundColor: modalBg } : {}),
                maxHeight: '92vh',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button (X) */}
              <button
                onClick={closeProductSheet}
                className="absolute right-4 top-4 z-30 p-2.5 rounded-full bg-black/50 hover:bg-black/70 text-white/90 hover:text-white transition-all backdrop-blur-md ring-1 ring-white/10"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>

              {/* ===== RESPONSIVE LAYOUT ===== */}
              <div className="flex flex-col md:flex-row" style={{ maxHeight: '92vh' }}>

                {/* ===== IMAGE SECTION ===== */}
                {/* Desktop: full height, fixed width | Mobile: large top image */}
                <div className="relative w-full md:w-[55%] flex-shrink-0 bg-black/20">
                  {/* Desktop: image fills full modal height */}
                  <div className="relative w-full h-[50vh] sm:h-[55vh] md:h-full md:min-h-[500px] overflow-hidden">
                    {selectedProduct.images?.[currentImageIndex] ? (
                      <img
                        src={selectedProduct.images[currentImageIndex]}
                        alt={selectedProduct.name}
                        className="w-full h-full object-cover object-center"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-black/30">
                        <ShoppingBag className="w-24 h-24 text-white/20" />
                      </div>
                    )}

                    {/* Subtle gradient at bottom for text readability on mobile */}
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent md:hidden" />

                    {/* Highlight Badge — elegantly floating over the expanded image */}
                    {highlightLabel && (
                      <span className="absolute top-4 left-4 z-10 px-4 py-2 rounded-full bg-black/60 text-white text-sm font-semibold backdrop-blur-md ring-1 ring-white/15 shadow-lg">
                        {highlightLabel}
                      </span>
                    )}

                    {/* Image Navigation Dots */}
                    {selectedProduct.images && selectedProduct.images.length > 1 && (
                      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2.5 z-10">
                        {selectedProduct.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={cn(
                              'h-2.5 rounded-full transition-all duration-300 shadow-md',
                              index === currentImageIndex
                                ? 'bg-white w-8'
                                : 'bg-white/40 hover:bg-white/60 w-2.5'
                            )}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* ===== INFO SECTION ===== */}
                <div className="w-full md:w-[45%] overflow-y-auto flex flex-col" style={{ maxHeight: '92vh' }}>
                  <div className="p-6 sm:p-8 flex flex-col flex-1">
                    {/* Product Info */}
                    <div className="space-y-5 flex-1">
                      {/* Name */}
                      <h2
                        className={cn('font-display text-2xl sm:text-3xl font-bold leading-tight', !nameColor && 'text-white')}
                        style={nameColor ? { color: nameColor } : undefined}
                      >
                        {selectedProduct.name}
                      </h2>

                      {/* Unit of measure */}
                      {unitDisplay && (
                        <p
                          className={cn('text-sm -mt-3', !unitColor && 'text-white/50')}
                          style={unitColor ? { color: unitColor } : undefined}
                        >
                          {unitDisplay}
                        </p>
                      )}

                      {/* Price Block */}
                      <div className="flex items-baseline gap-3">
                        <p
                          className={cn('text-3xl sm:text-4xl font-bold', !priceColor && 'text-amber-400')}
                          style={priceColor ? { color: priceColor } : undefined}
                        >
                          {formatPrice(selectedProduct.price)}
                        </p>
                        {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                          <span className="text-white/40 text-lg line-through">
                            {formatPrice(selectedProduct.originalPrice)}
                          </span>
                        )}
                      </div>

                      {/* Divider */}
                      <div className="h-px bg-white/10" />

                      {/* Description — full, no truncation */}
                      {selectedProduct.description && (
                        <p
                          className={cn('leading-relaxed text-base', !descColor && 'text-white/60')}
                          style={descColor ? { color: descColor } : undefined}
                        >
                          {selectedProduct.description}
                        </p>
                      )}
                    </div>

                    {/* ===== BOTTOM ACTIONS ===== */}
                    <div className="mt-8 space-y-5 pt-5 border-t border-white/10">
                      {/* Quantity Selector */}
                      <div className="flex items-center justify-between">
                        <span
                          className={cn('font-medium text-base', !qtyLabelColor && 'text-white/80')}
                          style={qtyLabelColor ? { color: qtyLabelColor } : undefined}
                        >
                          Quantidade
                        </span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={decrementQuantity}
                            disabled={quantity <= 1}
                            className={cn(
                              'w-11 h-11 rounded-full flex items-center justify-center transition-all',
                              quantity <= 1
                                ? 'bg-white/5 text-white/20 cursor-not-allowed'
                                : 'bg-white/10 hover:bg-white/20 text-white'
                            )}
                            style={quantity > 1 ? {
                              ...(qtyBtnBg ? { backgroundColor: qtyBtnBg } : {}),
                              ...(qtyBtnText ? { color: qtyBtnText } : {}),
                            } : undefined}
                          >
                            <Minus className="w-5 h-5" />
                          </button>
                          <span
                            className={cn('text-2xl font-bold w-10 text-center tabular-nums', !qtyNumColor && 'text-white')}
                            style={qtyNumColor ? { color: qtyNumColor } : undefined}
                          >
                            {quantity}
                          </span>
                          <button
                            onClick={incrementQuantity}
                            className={cn(
                              'w-11 h-11 rounded-full flex items-center justify-center transition-all',
                              'bg-white/10 hover:bg-white/20 text-white'
                            )}
                            style={{
                              ...(qtyBtnBg ? { backgroundColor: qtyBtnBg } : {}),
                              ...(qtyBtnText ? { color: qtyBtnText } : {}),
                            }}
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Add to Cart CTA */}
                      <button
                        onClick={handleAddToCart}
                        className={cn(
                          'w-full py-4 rounded-2xl font-semibold text-lg',
                          'flex items-center justify-center gap-3',
                          'transition-all duration-200 hover:brightness-110 active:scale-[0.98]',
                          'shadow-lg',
                          !ctaBg && 'bg-amber-500',
                          !ctaText && 'text-black'
                        )}
                        style={{
                          ...(ctaBg ? { backgroundColor: ctaBg } : {}),
                          ...(ctaText ? { color: ctaText } : {}),
                          ...(ctaFont && ctaFont !== 'inherit' ? { fontFamily: ctaFont } : {}),
                          ...(ctaFontSize ? { fontSize: `${ctaFontSize}px` } : {}),
                          ...(ctaFontWeight ? { fontWeight: ctaFontWeight } : {}),
                        }}
                      >
                        <ShoppingBag className="w-5 h-5" />
                        Adicionar ({quantity}) — {formatPrice(totalPrice)}
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
