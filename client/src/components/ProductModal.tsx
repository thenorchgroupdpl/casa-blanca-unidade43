/**
 * Product Modal - Casa Blanca
 * Design: "Giant Card" — always stacked vertical layout (image top + content bottom)
 *
 * Key design decisions:
 * - ALWAYS stacked vertical, even on desktop (max-w-lg centered = elegant giant card)
 * - Image edge-to-edge at top (no padding, glued to borders, ~55% of modal height)
 * - Content area below with solid color-blocked background (modalBgColor)
 * - Glassmorphism overlay: backdrop-blur-md + bg-black/60
 * - Badge floats over image (top-left corner)
 * - Hierarchy: Name → Weight/Category → Price → Quantity → Wide CTA button
 *
 * All styles injected via inline styles from menu_style (Design System).
 * 5 key variables: modalBgColor, modalNameColor, modalPriceColor, modalCtaBgColor, modalCtaTextColor
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
            className="fixed inset-0 z-50"
            style={{
              backgroundColor: ms?.panelOverlayColor
                ? `${ms.panelOverlayColor}${Math.round((ms.panelOverlayOpacity ?? 60) * 2.55).toString(16).padStart(2, '0')}`
                : 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          />

          {/* ===== GIANT CARD MODAL ===== */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 30 }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="fixed z-50 inset-0 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className={cn(
                'relative w-full max-w-lg pointer-events-auto',
                'rounded-3xl overflow-hidden',
                'shadow-[0_30px_80px_-15px_rgba(0,0,0,0.7)]',
                'ring-1 ring-white/10',
                'flex flex-col'
              )}
              style={{ maxHeight: '90vh' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* ===== IMAGE SECTION (edge-to-edge, top) ===== */}
              <div className="relative w-full flex-shrink-0 overflow-hidden bg-black/20">
                <div className="relative w-full" style={{ height: 'clamp(220px, 55vh, 420px)' }}>
                  {selectedProduct.images?.[currentImageIndex] ? (
                    <img
                      src={selectedProduct.images[currentImageIndex]}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-black/30">
                      <ShoppingBag className="w-20 h-20 text-white/15" />
                    </div>
                  )}

                  {/* Close Button (X) — subtle, floating over image */}
                  <button
                    onClick={closeProductSheet}
                    className="absolute right-3 top-3 z-30 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white/80 hover:text-white transition-all backdrop-blur-sm"
                    aria-label="Fechar"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {/* Highlight Badge — floating over image, top-left */}
                  {highlightLabel && (
                    <span className="absolute top-3 left-3 z-10 px-3 py-1.5 rounded-full bg-black/60 text-white text-xs font-semibold backdrop-blur-sm">
                      {highlightLabel}
                    </span>
                  )}

                  {/* Image Navigation Dots */}
                  {selectedProduct.images && selectedProduct.images.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                      {selectedProduct.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={cn(
                            'h-2 rounded-full transition-all duration-300',
                            index === currentImageIndex
                              ? 'bg-white w-6'
                              : 'bg-white/40 hover:bg-white/60 w-2'
                          )}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ===== CONTENT AREA (color-blocked, below image) ===== */}
              <div
                className={cn(
                  'flex-1 overflow-y-auto',
                  !modalBg && 'bg-[#111111]'
                )}
                style={modalBg ? { backgroundColor: modalBg } : undefined}
              >
                <div className="px-5 pt-5 pb-6 space-y-4">
                  {/* Product Name */}
                  <h2
                    className={cn(
                      'font-display text-xl sm:text-2xl font-bold leading-tight',
                      !nameColor && 'text-white'
                    )}
                    style={nameColor ? { color: nameColor } : undefined}
                  >
                    {selectedProduct.name}
                  </h2>

                  {/* Weight / Category / Unit */}
                  {unitDisplay && (
                    <p
                      className={cn('text-sm -mt-2', !unitColor && 'text-white/50')}
                      style={unitColor ? { color: unitColor } : undefined}
                    >
                      {unitDisplay}
                    </p>
                  )}

                  {/* Description */}
                  {selectedProduct.description && (
                    <p
                      className={cn('text-sm leading-relaxed', !descColor && 'text-white/55')}
                      style={descColor ? { color: descColor } : undefined}
                    >
                      {selectedProduct.description}
                    </p>
                  )}

                  {/* Price Block */}
                  <div className="flex items-baseline gap-3 pt-1">
                    <p
                      className={cn('text-2xl sm:text-3xl font-bold', !priceColor && 'text-amber-400')}
                      style={priceColor ? { color: priceColor } : undefined}
                    >
                      {formatPrice(selectedProduct.price)}
                    </p>
                    {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                      <span className="text-white/35 text-base line-through">
                        {formatPrice(selectedProduct.originalPrice)}
                      </span>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-white/10" />

                  {/* Quantity Selector */}
                  <div className="flex items-center justify-between">
                    <span
                      className={cn('font-medium text-sm', !qtyLabelColor && 'text-white/70')}
                      style={qtyLabelColor ? { color: qtyLabelColor } : undefined}
                    >
                      Quantidade
                    </span>
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={decrementQuantity}
                        disabled={quantity <= 1}
                        className={cn(
                          'w-9 h-9 rounded-full flex items-center justify-center transition-all',
                          quantity <= 1
                            ? 'bg-white/5 text-white/20 cursor-not-allowed'
                            : 'bg-white/10 hover:bg-white/20 text-white'
                        )}
                        style={quantity > 1 ? {
                          ...(qtyBtnBg ? { backgroundColor: qtyBtnBg } : {}),
                          ...(qtyBtnText ? { color: qtyBtnText } : {}),
                        } : undefined}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span
                        className={cn('text-xl font-bold w-8 text-center tabular-nums', !qtyNumColor && 'text-white')}
                        style={qtyNumColor ? { color: qtyNumColor } : undefined}
                      >
                        {quantity}
                      </span>
                      <button
                        onClick={incrementQuantity}
                        className={cn(
                          'w-9 h-9 rounded-full flex items-center justify-center transition-all',
                          'bg-white/10 hover:bg-white/20 text-white'
                        )}
                        style={{
                          ...(qtyBtnBg ? { backgroundColor: qtyBtnBg } : {}),
                          ...(qtyBtnText ? { color: qtyBtnText } : {}),
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Add to Cart CTA — wide button */}
                  <button
                    onClick={handleAddToCart}
                    className={cn(
                      'w-full py-3.5 rounded-2xl font-semibold text-base',
                      'flex items-center justify-center gap-2.5',
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
