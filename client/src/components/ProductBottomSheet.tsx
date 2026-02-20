/**
 * Product Bottom Sheet - Casa Blanca
 * Design: Warm Luxury - Drawer for product details and quantity selection
 * Features: Large image, description, quantity controls, add to cart
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { useUI, useCart, useToast } from '@/store/useStore';

export default function ProductBottomSheet() {
  const { selectedProduct, isBottomSheetOpen, closeProductSheet } = useUI();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
    
    // Show success toast notification
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
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] bg-lp-surface rounded-t-3xl overflow-hidden"
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
              {/* Product Image */}
              <div className="relative aspect-square max-h-[300px] bg-lp-surface">
                {selectedProduct.images?.[currentImageIndex] ? (
                  <img
                    src={selectedProduct.images[currentImageIndex]}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-lp-surface">
                    <ShoppingBag className="w-16 h-16 text-lp-text-muted" />
                  </div>
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
                            ? 'bg-lp-accent w-6'
                            : 'bg-lp-border hover:bg-lp-border-strong'
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-6 space-y-4">
                {/* Name & Price */}
                <div>
                  <h2 className="font-display text-2xl text-lp-text mb-2">
                    {selectedProduct.name}
                  </h2>
                  <p className="text-lp-accent text-xl font-semibold">
                    {formatPrice(selectedProduct.price)}
                  </p>
                </div>

                {/* Description */}
                {selectedProduct.description && (
                  <p className="text-lp-text-muted leading-relaxed">
                    {selectedProduct.description}
                  </p>
                )}

                {/* Quantity Selector */}
                <div className="flex items-center justify-between py-4 border-t border-lp-border">
                  <span className="text-lp-text font-medium">Quantidade</span>
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
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="text-lp-text text-xl font-semibold w-8 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={incrementQuantity}
                      className="w-10 h-10 rounded-full bg-lp-accent text-lp-accent-fg flex items-center justify-center hover:bg-lp-accent-hover transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  className="w-full py-4 rounded-full bg-lp-accent text-lp-accent-fg font-semibold text-lg flex items-center justify-center gap-3 hover:bg-lp-accent-hover transition-colors"
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
