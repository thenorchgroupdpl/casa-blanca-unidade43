/**
 * Upsell Modal (Order Bump) - Casa Blanca
 * Shows suggested products after the customer adds an item to cart.
 * Fetches upsell products from the backend and displays them in a bottom sheet.
 * Design follows the warm luxury theme with customizable colors via Design System.
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Zap, ShoppingBag } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { useCart, useSiteData, useToast } from '@/store/useStore';
import type { Product } from '@/types';

interface UpsellModalProps {
  /** The product that was just added to cart (trigger) */
  triggerProduct: Product | null;
  /** Whether the modal is open */
  isOpen: boolean;
  /** Close callback */
  onClose: () => void;
  /** Upsell products to display */
  upsellProducts: Array<{
    id: number;
    name: string;
    price: string;
    imageUrl: string | null;
    tenantId: number;
    discountPrice?: string | null;
  }>;
}

export default function UpsellModal({ triggerProduct, isOpen, onClose, upsellProducts }: UpsellModalProps) {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const { data } = useSiteData();
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());

  // Reset added state when modal opens with new product
  useEffect(() => {
    if (isOpen) {
      setAddedIds(new Set());
    }
  }, [isOpen, triggerProduct?.id]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleAddUpsell = (upsell: typeof upsellProducts[number]) => {
    // Use discount price if available, otherwise original price
    const effectivePrice = upsell.discountPrice ? parseFloat(upsell.discountPrice) : parseFloat(upsell.price);
    
    // Convert to Product type for cart
    const product: Product = {
      id: String(upsell.id),
      name: upsell.name,
      price: effectivePrice,
      images: upsell.imageUrl ? [upsell.imageUrl] : [],
      description: '',
      available: true,
    };
    
    addItem(product, 1);
    setAddedIds(prev => new Set(prev).add(upsell.id));
    showToast('Adicionado!', `${upsell.name} adicionado à sacola.`);
  };

  if (!triggerProduct || upsellProducts.length === 0) return null;

  // Upsell design tokens from Design System
  const upsellStyle = data?.upsell_style;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-[60] max-h-[70vh] rounded-t-3xl overflow-hidden"
            style={{
              backgroundColor: upsellStyle?.bgColor || '#1a1a1a',
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 rounded-full bg-white/20" />
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
              style={upsellStyle?.closeButtonColor ? { color: upsellStyle.closeButtonColor } : undefined}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(70vh-60px)] px-5 pb-6">
              {/* Header */}
              <div className="flex items-center gap-2 mb-4 pt-2">
                <div
                  className="p-2 rounded-full"
                  style={{ backgroundColor: upsellStyle?.iconBgColor || 'rgba(245, 158, 11, 0.2)' }}
                >
                  <Zap
                    className="w-5 h-5"
                    style={{ color: upsellStyle?.iconCheckColor || '#f59e0b' }}
                  />
                </div>
                <div>
                  <h3
                    className="font-semibold text-lg"
                    style={{ color: upsellStyle?.titleColor || '#ffffff' }}
                  >
                    {upsellStyle?.title || 'Que tal adicionar?'}
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: upsellStyle?.subtitleColor || 'rgba(255,255,255,0.6)' }}
                  >
                    {upsellStyle?.subtitle || 'Sugestões que combinam com seu pedido'}
                  </p>
                </div>
              </div>

              {/* Upsell Products Grid */}
              <div className="space-y-3">
                {upsellProducts.map((upsell) => {
                  const isAdded = addedIds.has(upsell.id);
                  return (
                    <motion.div
                      key={upsell.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 p-3 rounded-xl border"
                      style={{
                        backgroundColor: upsellStyle?.cardBgColor || 'rgba(255,255,255,0.05)',
                        borderColor: upsellStyle?.borderColor || 'rgba(255,255,255,0.1)',
                      }}
                    >
                      {/* Product Image */}
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                        {upsell.imageUrl ? (
                          <img
                            src={upsell.imageUrl}
                            alt={upsell.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-white/30" />
                          </div>
                        )}
                        {/* OFERTA Badge */}
                        {upsell.discountPrice && Number(upsell.discountPrice) < Number(upsell.price) && (
                          <div className="absolute top-0 left-0 right-0 bg-red-500 text-white text-[9px] font-bold text-center py-[1px] tracking-wider shadow-sm">
                            -{Math.round((1 - Number(upsell.discountPrice) / Number(upsell.price)) * 100)}% OFF
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4
                          className="font-medium text-sm truncate"
                          style={{ color: upsellStyle?.titleColor || '#ffffff' }}
                        >
                          {upsell.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          {upsell.discountPrice && Number(upsell.discountPrice) < Number(upsell.price) ? (
                            <>
                              <p
                                className="font-semibold text-sm"
                                style={{ color: upsellStyle?.iconCheckColor || '#f59e0b' }}
                              >
                                {formatPrice(parseFloat(upsell.discountPrice))}
                              </p>
                              <p
                                className="text-xs line-through opacity-50"
                                style={{ color: upsellStyle?.subtitleColor || 'rgba(255,255,255,0.6)' }}
                              >
                                {formatPrice(parseFloat(upsell.price))}
                              </p>
                            </>
                          ) : (
                            <p
                              className="font-semibold text-sm"
                              style={{ color: upsellStyle?.iconCheckColor || '#f59e0b' }}
                            >
                              {formatPrice(parseFloat(upsell.price))}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Add Button */}
                      <button
                        onClick={() => handleAddUpsell(upsell)}
                        disabled={isAdded}
                        className={cn(
                          'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all',
                          isAdded
                            ? 'bg-green-500/20 text-green-400 cursor-default'
                            : 'active:scale-95'
                        )}
                        style={!isAdded ? {
                          backgroundColor: upsellStyle?.ctaBgColor || '#f59e0b',
                          color: upsellStyle?.ctaTextColor || '#000000',
                        } : undefined}
                      >
                        {isAdded ? '✓ Adicionado' : (
                          <span className="flex items-center gap-1">
                            <Plus className="w-4 h-4" />
                            Adicionar
                          </span>
                        )}
                      </button>
                    </motion.div>
                  );
                })}
              </div>

              {/* Continue Button */}
              <button
                onClick={onClose}
                className="w-full mt-5 py-3.5 rounded-full font-semibold text-center transition-all active:scale-[0.98]"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: upsellStyle?.subtitleColor || 'rgba(255,255,255,0.7)',
                }}
              >
                Continuar comprando
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
