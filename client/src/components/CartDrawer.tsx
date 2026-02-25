/**
 * Cart Drawer - Casa Blanca
 * Design: Warm Luxury - Side drawer for cart review and checkout
 * Features: Item list, quantity controls, observation field, WhatsApp checkout
 * 
 * REFACTORED: All customizable styles injected via inline styles from cart_style.
 * Falls back to Tailwind theme classes when no custom color is set.
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

  // Cart style from Design System (Cardápio)
  const cs = data?.cart_menu_style;

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

          {/* Drawer — ISOLATED: modalBgColor */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              "fixed inset-y-0 right-0 z-50 w-full max-w-md shadow-2xl",
              !cs?.modalBgColor && "bg-lp-surface"
            )}
            style={{
              fontFamily: 'var(--font-sans, inherit)',
              ...(cs?.modalBgColor ? { backgroundColor: cs.modalBgColor } : {}),
            }}
          >
            {/* Header — ISOLATED: headerTextColor, headerCloseColor */}
            <div className="flex items-center justify-between p-6 border-b border-lp-border">
              <div className="flex items-center gap-3">
                <ShoppingBag
                  className="w-6 h-6"
                  style={{ color: cs?.headerTextColor || undefined }}
                />
                <h2
                  className={cn("font-display text-xl", !cs?.headerTextColor && "text-lp-text")}
                  style={{ color: cs?.headerTextColor || undefined }}
                >
                  Sua Sacola
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 transition-colors"
                style={{ color: cs?.headerCloseColor || undefined }}
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
                  <h3
                    className={cn("font-display text-xl mb-2", !cs?.headerTextColor && "text-lp-text")}
                    style={{ color: cs?.headerTextColor || undefined }}
                  >
                    Sacola vazia
                  </h3>
                  <p className="text-lp-text-muted">
                    Adicione produtos para começar seu pedido
                  </p>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="mt-6 px-6 py-2 rounded-full bg-lp-btn text-lp-btn-fg font-medium"
                  >
                    Explorar {data?.menu_style?.menuSectionTitle?.toLowerCase() || 'cardápio'}
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
                          className={cn(
                            "flex gap-4 p-4 rounded-2xl border",
                            !cs?.itemBgColor && "bg-lp-surface-soft",
                            !cs?.itemBorderColor && "border-lp-border"
                          )}
                          style={{
                            ...(cs?.itemBgColor ? { backgroundColor: cs.itemBgColor } : {}),
                            ...(cs?.itemBorderColor ? { borderColor: cs.itemBorderColor } : {}),
                          }}
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

                          {/* Info — ISOLATED: itemNameColor, itemPriceColor */}
                          <div className="flex-1 min-w-0">
                            <h4
                              className={cn("font-medium truncate", !cs?.itemNameColor && "text-lp-text")}
                              style={{ color: cs?.itemNameColor || undefined }}
                            >
                              {item.product.name}
                            </h4>
                            <p
                              className={cn("font-semibold mt-1", !cs?.itemPriceColor && "text-lp-highlight")}
                              style={{ color: cs?.itemPriceColor || undefined }}
                            >
                              {formatPrice(item.product.price * item.quantity)}
                            </p>

                            {/* Quantity Controls — ISOLATED: qtyBtnBgColor/Text, qtyNumberColor */}
                            <div className="flex items-center gap-3 mt-2">
                              <button
                                onClick={() =>
                                  updateQuantity(item.product.id, item.quantity - 1)
                                }
                                className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                                  !cs?.qtyBtnBgColor && "bg-lp-surface",
                                  !cs?.qtyBtnTextColor && "text-lp-text"
                                )}
                                style={{
                                  ...(cs?.qtyBtnBgColor ? { backgroundColor: cs.qtyBtnBgColor } : {}),
                                  ...(cs?.qtyBtnTextColor ? { color: cs.qtyBtnTextColor } : {}),
                                }}
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span
                                className={cn("font-medium w-6 text-center", !cs?.qtyNumberColor && "text-lp-text")}
                                style={{ color: cs?.qtyNumberColor || undefined }}
                              >
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.product.id, item.quantity + 1)
                                }
                                className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                                  !cs?.qtyBtnBgColor && "bg-lp-btn",
                                  !cs?.qtyBtnTextColor && "text-lp-btn-fg"
                                )}
                                style={{
                                  ...(cs?.qtyBtnBgColor ? { backgroundColor: cs.qtyBtnBgColor } : {}),
                                  ...(cs?.qtyBtnTextColor ? { color: cs.qtyBtnTextColor } : {}),
                                }}
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Remove Button — ISOLATED: itemTrashColor */}
                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="p-2 transition-colors self-start"
                            style={{ color: cs?.itemTrashColor || undefined }}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </motion.div>
                      </div>
                    ))}

                    {/* Observation Field — ISOLATED: obsBgColor, obsBorderColor, obsTextColor */}
                    <div className="pt-4">
                      <label
                        className={cn("block text-sm font-medium mb-2", !cs?.headerTextColor && "text-lp-text")}
                        style={{ color: cs?.headerTextColor || undefined }}
                      >
                        Observações (opcional)
                      </label>
                      <textarea
                        value={observation}
                        onChange={(e) => setObservation(e.target.value)}
                        placeholder="Ex: Sem cebola, ponto da carne..."
                        rows={3}
                        className={cn(
                          'w-full px-4 py-3 rounded-xl resize-none',
                          'focus:outline-none focus:ring-1 focus:ring-lp-highlight-soft',
                          'transition-all',
                          !cs?.obsBgColor && 'bg-lp-surface-soft',
                          !cs?.obsBorderColor && 'border border-lp-border',
                          !cs?.obsTextColor && 'text-lp-text placeholder:text-lp-text-muted'
                        )}
                        style={{
                          ...(cs?.obsBgColor ? { backgroundColor: cs.obsBgColor } : {}),
                          ...(cs?.obsBorderColor ? { borderColor: cs.obsBorderColor, borderWidth: '1px', borderStyle: 'solid' } : {}),
                          ...(cs?.obsTextColor ? { color: cs.obsTextColor } : {}),
                        }}
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-6 border-t border-lp-border space-y-4">
                    {/* Total — ISOLATED: totalLabelColor, totalValueColor */}
                    <div className="flex items-center justify-between">
                      <span
                        className={cn("text-lg", !cs?.totalLabelColor && "text-lp-text")}
                        style={{ color: cs?.totalLabelColor || undefined }}
                      >
                        Total
                      </span>
                      <span
                        className={cn("text-2xl font-bold", !cs?.totalValueColor && "text-lp-highlight")}
                        style={{ color: cs?.totalValueColor || undefined }}
                      >
                        {formatPrice(totalPrice)}
                      </span>
                    </div>

                    {/* Checkout Button — ISOLATED: ctaBgColor, ctaTextColor */}
                    <button
                      onClick={handleCheckout}
                      className={cn(
                        'w-full flex items-center justify-center gap-3',
                        'py-4 rounded-2xl',
                        'font-semibold text-lg',
                        'transition-colors',
                        !cs?.ctaBgColor && 'bg-[#25D366]',
                        !cs?.ctaTextColor && 'text-white'
                      )}
                      style={{
                        ...(cs?.ctaBgColor ? { backgroundColor: cs.ctaBgColor } : {}),
                        ...(cs?.ctaTextColor ? { color: cs.ctaTextColor } : {}),
                      }}
                    >
                      <MessageCircle className="w-5 h-5" />
                      Finalizar no WhatsApp
                    </button>

                    {/* Clear Cart — ISOLATED: clearLinkColor */}
                    <button
                      onClick={() => {
                        clearCart();
                        setObservation('');
                      }}
                      className={cn(
                        "w-full py-2 text-sm transition-colors",
                        !cs?.clearLinkColor && "text-lp-text-muted hover:text-destructive"
                      )}
                      style={{ color: cs?.clearLinkColor || undefined }}
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
