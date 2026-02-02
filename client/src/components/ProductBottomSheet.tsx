/**
 * Product Bottom Sheet - Casa Blanca
 * Design: Warm Luxury - Drawer for product details and quantity selection
 * Features: Large image, description, quantity controls, add to cart
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, Check } from 'lucide-react';
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
    
    // Use Sonner toast with custom styling
    toast.custom((t) => (
      <div 
        className="flex items-center gap-3 px-5 py-4 rounded-2xl w-full max-w-[400px] mx-auto"
        style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          border: '1px solid rgba(212, 175, 55, 0.4)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 20px rgba(212, 175, 55, 0.2)',
        }}
      >
        {/* Success Icon */}
        <div 
          className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'rgba(212, 175, 55, 0.2)' }}
        >
          <Check className="w-5 h-5 text-[#D4AF37]" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-base m-0 leading-tight">
            Produto adicionado!
          </p>
          <p className="text-gray-400 text-sm mt-1 truncate">
            {quantity}x {selectedProduct.name} adicionado à sacola.
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={() => toast.dismiss(t)}
          className="p-1.5 rounded-full hover:bg-white/10 transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    ), {
      duration: 3000,
      position: 'top-center',
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
              className="absolute right-4 top-4 p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors z-10"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-60px)]">
              {/* Product Image */}
              <div className="relative aspect-square max-h-[300px] bg-muted">
                <img
                  src={selectedProduct.images?.[currentImageIndex] || '/images/placeholder.jpg'}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
                
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
                            ? 'bg-primary w-6'
                            : 'bg-white/50 hover:bg-white/70'
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
                  <h2 className="font-display text-2xl text-foreground mb-2">
                    {selectedProduct.name}
                  </h2>
                  <p className="text-primary text-xl font-semibold">
                    {formatPrice(selectedProduct.price)}
                  </p>
                </div>

                {/* Description */}
                {selectedProduct.description && (
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedProduct.description}
                  </p>
                )}

                {/* Quantity Selector */}
                <div className="flex items-center justify-between py-4 border-t border-border">
                  <span className="text-foreground font-medium">Quantidade</span>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                        quantity <= 1
                          ? 'bg-muted text-muted-foreground cursor-not-allowed'
                          : 'bg-muted hover:bg-muted/80 text-foreground'
                      )}
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="text-foreground text-xl font-semibold w-8 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={incrementQuantity}
                      className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  className="w-full py-4 rounded-full bg-primary text-primary-foreground font-semibold text-lg flex items-center justify-center gap-3 hover:bg-primary/90 transition-colors"
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
