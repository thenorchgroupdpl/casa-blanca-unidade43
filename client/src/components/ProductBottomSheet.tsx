/**
 * Product Bottom Sheet - Casa Blanca
 * Design: Warm Luxury - Drawer for product details and quantity selection
 * Features: Large image, description, quantity controls, add to cart
 * Now supports: highlight badges, unit of measure, original price strikethrough
 * Consumes menu_style from SiteData for Design System customization
 * Image standardization: aspect-square, w-full, object-cover
 *
 * REFACTORED: All styles injected DIRECTLY via inline styles from menu_style.
 * Modal elements (name, price, desc, qty, CTA) each use their OWN variable.
 * No CSS inheritance from card styles — fully isolated from Cardápio cards.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { useUI, useCart, useToast, useSiteData } from '@/store/useStore';

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

export default function ProductBottomSheet() {
  const { data } = useSiteData();
  const { selectedProduct, isBottomSheetOpen, closeProductSheet } = useUI();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const ms = data?.menu_style;

  // Reset quantity when product changes
  useEffect(() => {
    setQuantity(1);
    setCurrentImageIndex(0);
  }, [selectedProduct]);

  // Lock body scroll when sheet is open
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

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    
    addItem(selectedProduct, quantity);
    
    showToast(
      'Produto adicionado!',
      `${quantity}x ${selectedProduct.name} adicionado à sacola.`
    );
    
    closeProductSheet();
  };

  const incrementQuantity = () => setQuantity((q) => q + 1);
  const decrementQuantity = () => setQuantity((q) => Math.max(1, q - 1));

  if (!selectedProduct) return null;

  const totalPrice = selectedProduct.price * quantity;
  const highlightLabel = selectedProduct.highlightTag ? HIGHLIGHT_LABELS[selectedProduct.highlightTag] : null;
  const unitDisplay = formatUnit(selectedProduct.unitValue, selectedProduct.unit);

  // ===== ISOLATED MODAL STYLE VARIABLES (section 3.4) =====
  // These are SEPARATE from card styles (section 3.3)
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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeProductSheet}
            className="fixed inset-0 z-50 bg-lp-overlay backdrop-blur-sm"
            style={ms?.panelOverlayColor ? {
              backgroundColor: `${ms.panelOverlayColor}${Math.round((ms.panelOverlayOpacity ?? 50) * 2.55).toString(16).padStart(2, '0')}`,
            } : undefined}
          />

          {/* Bottom Sheet — ISOLATED: uses modalBg, NOT panelBg or cardBg */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              'fixed inset-x-0 bottom-0 z-50 max-h-[90vh] rounded-t-3xl overflow-hidden',
              !modalBg && 'bg-lp-surface'
            )}
            style={modalBg ? { backgroundColor: modalBg } : undefined}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 rounded-full bg-lp-surface" />
            </div>

            {/* Close Button */}
            <button
              onClick={closeProductSheet}
              className="absolute right-4 top-4 p-2 rounded-full bg-lp-surface-soft hover:bg-lp-surface transition-colors z-10"
            >
              <X className="w-5 h-5 text-lp-text-muted" />
            </button>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-60px)]">
              {/* Product Image - aspect-square + w-full + object-cover */}
              <div className="relative aspect-square w-full max-h-[300px] bg-lp-surface overflow-hidden">
                {selectedProduct.images?.[currentImageIndex] ? (
                  <img
                    src={selectedProduct.images[currentImageIndex]}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-lp-surface">
                    <ShoppingBag className="w-16 h-16 text-lp-text-muted" />
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
                          'w-2 h-2 rounded-full transition-all',
                          index === currentImageIndex
                            ? 'bg-lp-highlight w-6'
                            : 'bg-lp-border hover:bg-lp-border-strong'
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-6 space-y-4">
                {/* Name — ISOLATED: uses modalNameColor, NOT cardNameColor */}
                <div>
                  <h2
                    className={cn('font-display text-2xl mb-1', !modalNameColor && 'text-lp-text')}
                    style={modalNameColor ? { color: modalNameColor } : undefined}
                  >
                    {selectedProduct.name}
                  </h2>
                  {/* Unit of measure below the name — ISOLATED: uses modalUnitColor */}
                  {unitDisplay && (
                    <p
                      className={cn('text-sm mb-2', !modalUnitColor && 'text-lp-text-muted')}
                      style={modalUnitColor ? { color: modalUnitColor } : undefined}
                    >{unitDisplay}</p>
                  )}
                  {/* Price — ISOLATED: uses modalPriceColor, NOT cardPriceColor */}
                  <div className="flex items-center gap-3">
                    <p
                      className={cn('text-xl font-semibold', !modalPriceColor && 'text-lp-highlight')}
                      style={modalPriceColor ? { color: modalPriceColor } : undefined}
                    >
                      {formatPrice(selectedProduct.price)}
                    </p>
                    {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                      <span className="text-lp-text-muted text-sm line-through">
                        {formatPrice(selectedProduct.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Description — ISOLATED: uses modalDescColor, NOT cardDescColor */}
                {selectedProduct.description && (
                  <p
                    className={cn('leading-relaxed', !modalDescColor && 'text-lp-text-muted')}
                    style={modalDescColor ? { color: modalDescColor } : undefined}
                  >
                    {selectedProduct.description}
                  </p>
                )}

                {/* Quantity Selector — ISOLATED: uses qtyBtnBg/Text/NumColor */}
                <div className="flex items-center justify-between py-4 border-t border-lp-border">
                  <span
                    className={cn('font-medium', !qtyLabelColor && 'text-lp-text')}
                    style={qtyLabelColor ? { color: qtyLabelColor } : undefined}
                  >Quantidade</span>
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

                {/* Add to Cart Button — ISOLATED: uses modalCta* variables */}
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
