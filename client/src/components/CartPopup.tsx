/**
 * Cart Popup Component - Casa Blanca
 * Popup do carrinho que abre ao clicar no ícone no header mobile
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag, MessageCircle } from 'lucide-react';
import { cn, formatPrice, generateWhatsAppMessage, openWhatsApp } from '@/lib/utils';
import { useCart, useSiteData } from '@/store/useStore';

interface CartPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartPopup({ isOpen, onClose }: CartPopupProps) {
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice } = useCart();
  const { data } = useSiteData();

  const handleFinishOrder = () => {
    if (!data) return;
    
    const storeName = data.project_name || 'Casa Blanca';
    const message = generateWhatsAppMessage(items, getTotalPrice(), undefined, storeName);
    openWhatsApp(data.contact.whatsapp, message);
    onClose();
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

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
            className="fixed inset-0 bg-lp-overlay z-[60] backdrop-blur-sm"
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-16 right-4 left-4 sm:left-auto sm:w-96 z-[70] max-h-[80vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl bg-lp-surface border border-lp-border"
            style={{ fontFamily: 'var(--font-sans, inherit)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-lp-border">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-lp-highlight" />
                <h3 className="font-semibold text-lp-text">Sua Sacola</h3>
                {totalItems > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-lp-success text-lp-success-fg">
                    {totalItems}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-lp-surface-soft transition-colors text-lp-text-muted hover:text-lp-text"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-lp-surface-soft flex items-center justify-center mb-4">
                    <ShoppingBag className="w-8 h-8 text-lp-text-subtle" />
                  </div>
                  <p className="text-lp-text-muted text-sm">Sua sacola está vazia</p>
                  <p className="text-lp-text-subtle text-xs mt-1">Adicione produtos para continuar</p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex gap-3 p-3 rounded-xl bg-lp-surface-soft"
                    >
                      {/* Product Image */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        {item.product.images[0] ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-lp-border flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-lp-text-subtle" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-lp-text text-sm line-clamp-1">
                          {item.product.name}
                        </h4>
                        <p className="text-lp-highlight font-semibold text-sm mt-0.5">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-7 h-7 rounded-full bg-lp-border flex items-center justify-center text-lp-text-muted hover:bg-lp-border-strong transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-lp-text font-medium text-sm w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-full bg-lp-border flex items-center justify-center text-lp-text-muted hover:bg-lp-border-strong transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="ml-auto p-1.5 rounded-full text-red-400/60 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-4 border-t border-lp-border space-y-3">
                {/* Total */}
                <div className="flex items-center justify-between">
                  <span className="text-lp-text-muted">Total</span>
                  <span className="text-xl font-bold text-lp-text">
                    {formatPrice(getTotalPrice())}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={clearCart}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium text-lp-text-muted hover:text-lp-text bg-lp-surface-soft hover:bg-lp-border transition-colors"
                  >
                    Limpar
                  </button>
                  <button
                    onClick={handleFinishOrder}
                    className={cn(
                      'flex-[2] flex items-center justify-center gap-2 py-2.5 rounded-xl',
                      'text-sm font-medium text-white',
                      'bg-[#25D366] hover:bg-[#20BD5A] transition-colors'
                    )}
                  >
                    <MessageCircle className="w-4 h-4" />
                    Finalizar Pedido
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
