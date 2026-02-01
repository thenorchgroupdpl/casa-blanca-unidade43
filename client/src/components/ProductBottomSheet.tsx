/**
 * Product Bottom Sheet - Casa Blanca
 * Design: Warm Luxury - Drawer for product details and quantity selection
 * Features: Large image, description, quantity controls, add to cart
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { useUI, useCart } from '@/store/useStore';
import { toast } from 'sonner';

export default function ProductBottomSheet() {
  const { selectedProduct, isBottomSheetOpen, closeProductSheet } = useUI();
  const { addItem } = useCart();
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
    toast.success('Produto adicionado!', {
      description: `${quantity}x ${selectedProduct.name} adicionado à sacola.`,
    });
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
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] bg-card rounded-t-3xl overflow-hidden"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 rounded-full bg-muted" />
            </div>

            {/* Close Button */}
            <button
              onClick={closeProductSheet}
              className="absolute top-4 right-4 p-2 rounded-full bg-muted/50 text-muted-foreground hover:text-foreground transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-60px)]">
              {/* Image */}
              <div className="relative aspect-square max-h-[40vh] overflow-hidden">
                <img
                  src={selectedProduct.images[currentImageIndex]}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />

                {/* Image Navigation Dots */}
                {selectedProduct.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {selectedProduct.images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={cn(
                          'w-2 h-2 rounded-full transition-colors',
                          idx === currentImageIndex
                            ? 'bg-primary'
                            : 'bg-white/50 hover:bg-white/70'
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-6">
                <h2 className="font-display text-2xl text-foreground mb-2">
                  {selectedProduct.name}
                </h2>
                <p className="text-muted-foreground mb-4">
                  {selectedProduct.description}
                </p>
                <p className="text-2xl font-bold text-primary">
                  {formatPrice(selectedProduct.price)}
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="px-6 pb-6">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
                  <span className="text-foreground font-medium">Quantidade</span>
                  
                  <div className="flex items-center gap-4">
                    <button
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        'bg-muted text-foreground',
                        'hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed',
                        'transition-colors'
                      )}
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    
                    <span className="text-xl font-bold text-foreground w-8 text-center">
                      {quantity}
                    </span>
                    
                    <button
                      onClick={incrementQuantity}
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        'bg-primary text-primary-foreground',
                        'hover:bg-primary/90 transition-colors'
                      )}
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="p-6 pt-0 pb-8">
                <button
                  onClick={handleAddToCart}
                  className={cn(
                    'w-full flex items-center justify-center gap-3',
                    'py-4 rounded-2xl',
                    'bg-primary text-primary-foreground font-semibold text-lg',
                    'hover:bg-primary/90 transition-colors',
                    'gold-glow'
                  )}
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Adicionar ({quantity})</span>
                  <span className="ml-2">-</span>
                  <span>{formatPrice(totalPrice)}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
