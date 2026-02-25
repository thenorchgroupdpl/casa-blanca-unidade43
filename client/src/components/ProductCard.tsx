/**
 * Product Card Component - Casa Blanca
 * Design: Warm Luxury - Light card on dark background
 * Features: Image gallery navigation, price, add to cart CTA
 * Now supports: highlight badges, unit of measure, granular card style overrides
 * Image standardization: aspect-square, w-full, object-cover
 *
 * REFACTORED: All styles injected DIRECTLY via inline styles from cardStyle.
 * Each element (name, price, description, bg) uses its OWN variable.
 * No CSS inheritance — no CSS Bleeding.
 * HOVER REMOVED: Background color is always static (menu_card_bg).
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { useCart, useUI, useToast } from '@/store/useStore';
import type { Product } from '@/types';

export interface CardStyleOverrides {
  bgColor?: string;
  nameColor?: string;
  priceColor?: string;
  descColor?: string;
  borderRadius?: number;
  borderColor?: string;
  borderWidth?: number;
  font?: string;
  fontSize?: number;
  fontWeight?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
}

interface ProductCardProps {
  product: Product;
  index?: number;
  variant?: 'showcase' | 'grid';
  cardStyle?: CardStyleOverrides;
}

// Map highlight tag values to display labels
const HIGHLIGHT_LABELS: Record<string, string> = {
  mais_vendido: '🔥 Mais Vendido',
  novidade: '✨ Novidade',
  vegano: '🌱 Vegano',
};

// Format unit of measure for display (remove trailing zeros: 700.00 → 700, 1.50 → 1.5)
function formatUnit(unitValue?: string | null, unit?: string | null): string | null {
  if (!unitValue || !unit) return null;
  const formatted = parseFloat(unitValue);
  if (isNaN(formatted)) return null;
  return `${formatted}${unit}`;
}

export default function ProductCard({ product, index = 0, variant = 'showcase', cardStyle }: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addItem } = useCart();
  const { openProductSheet } = useUI();
  const { showToast } = useToast();

  const hasMultipleImages = product.images.length > 1;
  const highlightLabel = product.highlightTag ? HIGHLIGHT_LABELS[product.highlightTag] : null;
  const unitDisplay = formatUnit(product.unitValue, product.unit);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    addItem(product, 1);
    showToast('Produto adicionado!', `${product.name} adicionado à sacola.`);
  };

  const handleCardClick = () => {
    openProductSheet(product);
  };

  // Card container style — STATIC: only bgColor, no hover changes
  const cardContainerStyle = useMemo(() => {
    const style: React.CSSProperties = {};
    if (cardStyle?.bgColor) style.backgroundColor = cardStyle.bgColor;
    if (cardStyle?.borderRadius !== undefined) style.borderRadius = `${cardStyle.borderRadius}px`;
    if (cardStyle?.borderColor) style.borderColor = cardStyle.borderColor;
    if (cardStyle?.borderWidth !== undefined) style.borderWidth = `${cardStyle.borderWidth}px`;
    if (cardStyle?.font && cardStyle.font !== 'inherit') style.fontFamily = cardStyle.font;
    if (cardStyle?.fontSize) style.fontSize = `${cardStyle.fontSize}px`;
    if (cardStyle?.fontWeight) style.fontWeight = cardStyle.fontWeight;
    return style;
  }, [cardStyle?.bgColor, cardStyle?.borderRadius, cardStyle?.borderColor, cardStyle?.borderWidth, cardStyle?.font, cardStyle?.fontSize, cardStyle?.fontWeight]);

  // =============================================
  // GRID VARIANT (used in OrderOverlay / Cardápio)
  // =============================================
  if (variant === 'grid') {
    return (
      <motion.div
        onClick={handleCardClick}
        className={cn(
          'group relative rounded-xl overflow-hidden cursor-pointer',
          'border',
          !cardStyle?.bgColor && 'bg-lp-surface',
          !cardStyle?.borderColor && 'border-lp-border hover:border-lp-highlight-border'
        )}
        style={cardContainerStyle}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
      >
        {/* Image - aspect-square + w-full + object-cover */}
        <div className="relative aspect-square w-full overflow-hidden">
          {product.images[currentImageIndex] ? (
            <img
              src={product.images[currentImageIndex]}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-lp-surface flex items-center justify-center">
              <span className="text-3xl text-lp-text-muted">🍽️</span>
            </div>
          )}

          {/* Highlight Badge - top-left floating */}
          {highlightLabel && (
            <span className="absolute top-2 left-2 z-10 px-2.5 py-1 rounded-full bg-black/70 text-white text-[11px] font-medium backdrop-blur-sm">
              {highlightLabel}
            </span>
          )}
          
          {/* Quick Add Button — ISOLATED: uses cardStyle.buttonBgColor/buttonTextColor */}
          <button
            onClick={handleAddToCart}
            className={cn(
              'absolute bottom-3 right-3 p-2 rounded-full',
              !cardStyle?.buttonBgColor && 'bg-lp-btn',
              !cardStyle?.buttonTextColor && 'text-lp-btn-fg',
              'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
              'hover:scale-110 active:scale-95'
            )}
            style={{
              ...(cardStyle?.buttonBgColor ? { backgroundColor: cardStyle.buttonBgColor } : {}),
              ...(cardStyle?.buttonTextColor ? { color: cardStyle.buttonTextColor } : {}),
            }}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Info — ISOLATED: each text element gets its own color */}
        <div className="p-4">
          <h3
            className={cn('font-medium line-clamp-1', !cardStyle?.nameColor && 'text-lp-text')}
            style={cardStyle?.nameColor ? { color: cardStyle.nameColor } : undefined}
          >
            {product.name}
            {unitDisplay && (
              <span className="text-lp-text-muted font-normal text-xs ml-1.5">• {unitDisplay}</span>
            )}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <p
              className={cn('font-semibold', !cardStyle?.priceColor && 'text-lp-highlight')}
              style={cardStyle?.priceColor ? { color: cardStyle.priceColor } : undefined}
            >
              {formatPrice(product.price)}
            </p>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-lp-text-muted text-xs line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // =============================================
  // SHOWCASE VARIANT (horizontal scroll on home/vitrine)
  // =============================================
  return (
    <motion.div
      onClick={handleCardClick}
      className={cn(
        'group relative flex-shrink-0 w-[200px] sm:w-[220px] cursor-pointer',
        'product-card rounded-2xl overflow-hidden',
        'shadow-lg hover:shadow-xl transition-shadow duration-300'
      )}
      style={cardContainerStyle}
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      {/* Image Container - aspect-square + w-full + object-cover */}
      <div className="relative aspect-square w-full overflow-hidden">
        {product.images[currentImageIndex] ? (
          <img
            src={product.images[currentImageIndex]}
            alt={product.name}
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-lp-surface flex items-center justify-center">
            <span className="text-3xl text-lp-text-muted">🍽️</span>
          </div>
        )}

        {/* Highlight Badge - top-left floating */}
        {highlightLabel && (
          <span className="absolute top-2 left-2 z-10 px-2.5 py-1 rounded-full bg-black/70 text-white text-[11px] font-medium backdrop-blur-sm">
            {highlightLabel}
          </span>
        )}

        {/* Image Navigation */}
        {hasMultipleImages && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-lp-overlay text-lp-text opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-lp-overlay text-lp-text opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {product.images.map((_, idx) => (
                <span
                  key={idx}
                  className={cn(
                    'w-1.5 h-1.5 rounded-full transition-colors',
                    idx === currentImageIndex ? 'bg-lp-highlight' : 'bg-lp-text-subtle'
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Info — ISOLATED: each text element gets its own color via inline style */}
      <div className="p-4">
        <h3
          className={cn('font-medium line-clamp-1', !cardStyle?.nameColor && 'text-gray-900')}
          style={cardStyle?.nameColor ? { color: cardStyle.nameColor } : undefined}
        >
          {product.name}
        </h3>
        {/* Unit of measure below the name */}
        {unitDisplay && (
          <p className="text-xs text-gray-400 mt-0.5">{unitDisplay}</p>
        )}
        <p
          className={cn('text-sm mt-0.5 line-clamp-1', !cardStyle?.descColor && 'text-gray-600')}
          style={cardStyle?.descColor ? { color: cardStyle.descColor } : undefined}
        >
          {product.description}
        </p>
        
        <div className="mt-3 flex items-center gap-2">
          <span
            className={cn('text-lg font-bold', !cardStyle?.priceColor && 'text-gray-900')}
            style={cardStyle?.priceColor ? { color: cardStyle.priceColor } : undefined}
          >
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Add Button — ISOLATED: uses cardStyle.buttonBgColor/buttonTextColor */}
        <button
          onClick={handleAddToCart}
          className={cn(
            'mt-3 w-full py-2.5 rounded-xl font-medium text-sm',
            !cardStyle?.buttonBgColor && 'bg-lp-surface',
            !cardStyle?.buttonTextColor && 'text-lp-text',
            'active:scale-[0.98] transition-all'
          )}
          style={{
            ...(cardStyle?.buttonBgColor ? { backgroundColor: cardStyle.buttonBgColor } : {}),
            ...(cardStyle?.buttonTextColor ? { color: cardStyle.buttonTextColor } : {}),
          }}
        >
          Adicionar
        </button>
      </div>
    </motion.div>
  );
}
