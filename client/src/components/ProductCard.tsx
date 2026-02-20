/**
 * Product Card Component - Casa Blanca
 * Design: Warm Luxury - Light card on dark background
 * Features: Image gallery navigation, price, add to cart CTA, inline toast
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { useCart, useUI, useToast } from '@/store/useStore';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  index?: number;
  variant?: 'showcase' | 'grid';
}

export default function ProductCard({ product, index = 0, variant = 'showcase' }: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addItem } = useCart();
  const { openProductSheet } = useUI();
  const { showToast } = useToast();

  const hasMultipleImages = product.images.length > 1;

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
    console.log('Adding to cart:', product.name);
    addItem(product, 1);
    showToast('Produto adicionado!', `${product.name} adicionado à sacola.`);
  };

  const handleCardClick = () => {
    openProductSheet(product);
  };

  if (variant === 'grid') {
    return (
      <motion.div
        onClick={handleCardClick}
        className={cn(
          'group relative bg-lp-surface rounded-xl overflow-hidden cursor-pointer',
          'border border-lp-border hover:border-lp-highlight-border transition-all duration-300',
          'hover:shadow-lg hover:bg-lp-highlight-subtle'
        )}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        whileHover={{ y: -4 }}
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden">
          {product.images[currentImageIndex] ? (
            <img
              src={product.images[currentImageIndex]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-lp-surface flex items-center justify-center">
              <span className="text-3xl text-lp-text-muted">🍽️</span>
            </div>
          )}
          
          {/* Quick Add Button */}
          <button
            onClick={handleAddToCart}
            className={cn(
              'absolute bottom-3 right-3 p-2 rounded-full',
              'bg-lp-btn text-lp-btn-fg',
              'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
              'hover:scale-110 active:scale-95'
            )}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-medium text-lp-text line-clamp-1">{product.name}</h3>
          <p className="text-lp-highlight font-semibold mt-1">{formatPrice(product.price)}</p>
        </div>
      </motion.div>
    );
  }

  // Showcase variant (horizontal scroll)
  return (
    <motion.div
      onClick={handleCardClick}
      className={cn(
        'group relative flex-shrink-0 w-[200px] sm:w-[220px] cursor-pointer',
        'product-card rounded-2xl overflow-hidden',
        'shadow-lg hover:shadow-xl transition-all duration-300'
      )}
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        {product.images[currentImageIndex] ? (
          <img
            src={product.images[currentImageIndex]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-lp-surface flex items-center justify-center">
            <span className="text-3xl text-lp-text-muted">🍽️</span>
          </div>
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

      {/* Info */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 line-clamp-1">{product.name}</h3>
        <p className="text-sm text-gray-600 mt-0.5 line-clamp-1">{product.description}</p>
        
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
        </div>

        {/* Add Button */}
        <button
          onClick={handleAddToCart}
          className={cn(
            'mt-3 w-full py-2.5 rounded-xl font-medium text-sm',
            'bg-lp-surface text-lp-text',
            'hover:bg-lp-surface-hover active:scale-[0.98] transition-all'
          )}
        >
          Adicionar
        </button>
      </div>
    </motion.div>
  );
}
