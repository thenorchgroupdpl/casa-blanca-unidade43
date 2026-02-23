/**
 * Cart Drawer - Casa Blanca
 * Design: Warm Luxury - Side drawer for cart review and checkout
 * Features: Item list, quantity controls, observation field, WhatsApp checkout
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, MessageCircle, ShoppingBag } from 'lucide-react';
import { cn, formatPrice, generateWhatsAppMessage, openWhatsApp } from '@/lib/utils';
import { useCart, useSiteData } from '@/store/useStore';

export default function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [observation, setObservation] = useState('');
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice } = useCart();
  const { data } = useSiteData();

  // Listen for cart open event
  useEffect(() => {
    const handleOpenCart = () => setIsOpen(true);
    window.addEventListener('openCart', handleOpenCart);
    return () => window.removeEventListener('openCart', handleOpenCart);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleCheckout = () => {
    if (!data || items.length === 0) return;

    const total = getTotalPrice();
    const storeName = data.project_name || 'Casa Blanca';
    const message = generateWhatsAppMessage(items, total, observation || undefined, storeName);
    openWhatsApp(data.contact.whatsapp, message);
    
    // Clear cart after checkout
    clearCart();
    setObservation('');
    setIsOpen(false);
  };

  const totalPrice = getTotalPrice();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-50 bg-lp-overlay backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-lp-surface shadow-2xl"
            style={{ fontFamily: 'var(--font-sans, inherit)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-lp-border">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-lp-highlight" />
                <h2 className="font-display text-xl text-lp-text">Sua Sacola</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-lp-text-muted hover:text-lp-text transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-col h-[calc(100vh-80px)]">
              {items.length === 0 ? (
                /* Empty State */
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <div className="p-6 rounded-full bg-lp-surface-soft mb-6">
                    <ShoppingBag className="w-12 h-12 text-lp-text-muted" />
                  </div>
                  <h3 className="font-display text-xl text-lp-text mb-2">
                    Sacola vazia
                  </h3>
                  <p className="text-lp-text-muted">
                    Adicione produtos para começar seu pedido
                  </p>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="mt-6 px-6 py-2 rounded-full bg-lp-btn text-lp-btn-fg font-medium"
                  >
                    Explorar cardápio
                  </button>
                </div>
              ) : (
                <>
                  {/* Items List */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-3">
                    {items.map((item, idx) => (
                      <div key={item.product.id}>
                        {idx > 0 && <div className="border-t border-lp-border my-1" />}
                        <motion.div
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -100 }}
                          className="flex gap-4 p-4 bg-lp-surface-soft rounded-2xl border border-lp-border"
                      >
                        {/* Image */}
                        {item.product.images[0] ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-20 h-20 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-xl bg-lp-surface flex items-center justify-center">
                            <ShoppingBag className="w-8 h-8 text-lp-text-muted" />
                          </div>
                        )}

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-lp-text truncate">
                            {item.product.name}
                          </h4>
                          <p className="text-lp-highlight font-semibold mt-1">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3 mt-2">
                            <button
                              onClick={() =>
                                updateQuantity(item.product.id, item.quantity - 1)
                              }
                              className="w-8 h-8 rounded-full bg-lp-surface flex items-center justify-center text-lp-text hover:bg-lp-surface-hover transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-medium text-lp-text w-6 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.product.id, item.quantity + 1)
                              }
                              className="w-8 h-8 rounded-full bg-lp-btn text-lp-btn-fg flex items-center justify-center hover:bg-lp-btn-hover transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="p-2 text-lp-text-muted hover:text-destructive transition-colors self-start"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </motion.div>
                      </div>
                    ))}

                    {/* Observation Field */}
                    <div className="pt-4">
                      <label className="block text-sm font-medium text-lp-text mb-2">
                        Observações (opcional)
                      </label>
                      <textarea
                        value={observation}
                        onChange={(e) => setObservation(e.target.value)}
                        placeholder="Ex: Sem cebola, ponto da carne..."
                        rows={3}
                        className={cn(
                          'w-full px-4 py-3 rounded-xl resize-none',
                          'bg-lp-surface-soft border border-lp-border',
                          'text-lp-text placeholder:text-lp-text-muted',
                          'focus:outline-none focus:border-lp-highlight-border focus:ring-1 focus:ring-lp-highlight-soft',
                          'transition-all'
                        )}
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-6 border-t border-lp-border space-y-4">
                    {/* Total */}
                    <div className="flex items-center justify-between">
                      <span className="text-lg text-lp-text">Total</span>
                      <span className="text-2xl font-bold text-lp-highlight">
                        {formatPrice(totalPrice)}
                      </span>
                    </div>

                    {/* Checkout Button */}
                    <button
                      onClick={handleCheckout}
                      className={cn(
                        'w-full flex items-center justify-center gap-3',
                        'py-4 rounded-2xl',
                        'bg-[#25D366] text-white font-semibold text-lg',
                        'hover:bg-[#20BD5A] transition-colors'
                      )}
                    >
                      <MessageCircle className="w-5 h-5" />
                      Finalizar no WhatsApp
                    </button>

                    {/* Clear Cart */}
                    <button
                      onClick={() => {
                        clearCart();
                        setObservation('');
                      }}
                      className="w-full py-2 text-sm text-lp-text-muted hover:text-destructive transition-colors"
                    >
                      Limpar sacola
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
