/**
 * Cart Popup Component - Casa Blanca
 * Popup do carrinho que abre ao clicar no ícone no header mobile
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag, MessageCircle } from 'lucide-react';
import { cn, formatPrice, generateWhatsAppMessage, normalizeWhatsAppNumber } from '@/lib/utils';
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
    
    const message = generateWhatsAppMessage(items, getTotalPrice());
    const whatsappNumber = normalizeWhatsAppNumber(data.contact.whatsapp);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
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
            className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-16 right-4 left-4 sm:left-auto sm:w-96 z-[70] max-h-[80vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl"
            style={{
              backgroundColor: 'var(--popup-bg, #1a1a1a)',
              border: '1px solid var(--popup-border, rgba(255, 255, 255, 0.1))',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-white">Sua Sacola</h3>
                {totalItems > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary text-primary-foreground">
                    {totalItems}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <ShoppingBag className="w-8 h-8 text-white/30" />
                  </div>
                  <p className="text-white/60 text-sm">Sua sacola está vazia</p>
                  <p className="text-white/40 text-xs mt-1">Adicione produtos para continuar</p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex gap-3 p-3 rounded-xl bg-white/5"
                    >
                      {/* Product Image */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white text-sm line-clamp-1">
                          {item.product.name}
                        </h4>
                        <p className="text-primary font-semibold text-sm mt-0.5">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:bg-white/20 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-white font-medium text-sm w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:bg-white/20 transition-colors"
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
              <div className="p-4 border-t border-white/10 space-y-3">
                {/* Total */}
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Total</span>
                  <span className="text-xl font-bold text-white">
                    {formatPrice(getTotalPrice())}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={clearCart}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
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
