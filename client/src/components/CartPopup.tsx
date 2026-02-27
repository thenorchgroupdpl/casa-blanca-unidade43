/**
 * Cart Popup Component - Casa Blanca
 * Popup do carrinho que abre ao clicar no ícone no header mobile
 * Uses cart_landing_style for isolated customization
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag, MessageCircle } from 'lucide-react';
import { cn, formatPrice, generateWhatsAppMessage, openWhatsApp } from '@/lib/utils';
import { useCart, useSiteData } from '@/store/useStore';
import { trpc } from '@/lib/trpc';

interface CartPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartPopup({ isOpen, onClose }: CartPopupProps) {
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice } = useCart();
  const { data } = useSiteData();

  // Cart Landing style from Design System
  const cs = data?.cart_landing_style;

  const createOrder = trpc.orders.create.useMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFinishOrder = async () => {
    if (!data || items.length === 0 || isSubmitting) return;

    setIsSubmitting(true);

    const storeName = data.project_name || 'Casa Blanca';
    const total = getTotalPrice();
    const message = generateWhatsAppMessage(items, total, undefined, storeName);

    // 1. Save order in the database FIRST
    try {
      const summary = items
        .map((item) => `${item.quantity}x ${item.product.name}`)
        .join(', ');

      // Get tenantId from data
      const tenantId = (data as any).tenant_id || (data as any).tenantId;

      if (tenantId) {
        await createOrder.mutateAsync({
          tenantId: Number(tenantId),
          customerName: 'Cliente via WhatsApp',
          summary,
          items: items.map((item) => ({
            productId: Number(item.product.id),
            name: item.product.name,
            quantity: item.quantity,
            price: item.product.price,
          })),
          totalValue: total.toFixed(2),
        });
      }
    } catch {
      setIsSubmitting(false);
      alert('N\u00e3o foi poss\u00edvel registrar seu pedido. Por favor, tente novamente.');
      return;
    }

    // 2. Only open WhatsApp AFTER order is saved
    openWhatsApp(data.contact.whatsapp, message);

    // 3. Clear cart after success
    clearCart();
    setIsSubmitting(false);
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

          {/* Popup — ISOLATED: modalBgColor */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              "fixed top-16 right-4 left-4 sm:left-auto sm:w-96 z-[70] max-h-[80vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-lp-border",
              !cs?.modalBgColor && "bg-lp-surface"
            )}
            style={{
              fontFamily: 'var(--font-sans, inherit)',
              ...(cs?.modalBgColor ? { backgroundColor: cs.modalBgColor } : {}),
            }}
          >
            {/* Header — ISOLATED: headerTextColor, headerCloseColor */}
            <div className="flex items-center justify-between p-4 border-b border-lp-border">
              <div className="flex items-center gap-2">
                <ShoppingBag
                  className={cn("w-5 h-5", !cs?.headerIconColor && "text-lp-highlight")}
                  style={{ color: cs?.headerIconColor || undefined }}
                />
                <h3
                  className={cn("font-semibold", !cs?.headerTextColor && "text-lp-text")}
                  style={{ color: cs?.headerTextColor || undefined }}
                >
                  Sua Sacola
                </h3>
                {totalItems > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-lp-success text-lp-success-fg">
                    {totalItems}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className={cn(
                  "p-1.5 rounded-full hover:bg-lp-surface-soft transition-colors",
                  !cs?.headerCloseColor && "text-lp-text-muted hover:text-lp-text"
                )}
                style={{ color: cs?.headerCloseColor || undefined }}
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
                      className={cn(
                        "flex gap-3 p-3 rounded-xl",
                        !cs?.itemBgColor && "bg-lp-surface-soft"
                      )}
                      style={{
                        ...(cs?.itemBgColor ? { backgroundColor: cs.itemBgColor } : {}),
                        ...(cs?.itemBorderColor ? { borderColor: cs.itemBorderColor, borderWidth: '1px', borderStyle: 'solid' } : {}),
                      }}
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

                      {/* Product Info — ISOLATED: itemNameColor, itemPriceColor, itemTrashColor */}
                      <div className="flex-1 min-w-0">
                        <h4
                          className={cn("font-medium text-sm line-clamp-1", !cs?.itemNameColor && "text-lp-text")}
                          style={{ color: cs?.itemNameColor || undefined }}
                        >
                          {item.product.name}
                        </h4>
                        <p
                          className={cn("font-semibold text-sm mt-0.5", !cs?.itemPriceColor && "text-lp-highlight")}
                          style={{ color: cs?.itemPriceColor || undefined }}
                        >
                          {formatPrice(item.product.price * item.quantity)}
                        </p>

                        {/* Quantity Controls — ISOLATED: qtyBtnBgColor, qtyBtnTextColor, qtyNumberColor */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className={cn(
                              "w-7 h-7 rounded-full flex items-center justify-center transition-colors",
                              !cs?.qtyBtnBgColor && "bg-lp-border",
                              !cs?.qtyBtnTextColor && "text-lp-text-muted"
                            )}
                            style={{
                              ...(cs?.qtyBtnBgColor ? { backgroundColor: cs.qtyBtnBgColor } : {}),
                              ...(cs?.qtyBtnTextColor ? { color: cs.qtyBtnTextColor } : {}),
                            }}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span
                            className={cn("font-medium text-sm w-6 text-center", !cs?.qtyNumberColor && "text-lp-text")}
                            style={{ color: cs?.qtyNumberColor || undefined }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className={cn(
                              "w-7 h-7 rounded-full flex items-center justify-center transition-colors",
                              !cs?.qtyBtnBgColor && "bg-lp-border",
                              !cs?.qtyBtnTextColor && "text-lp-text-muted"
                            )}
                            style={{
                              ...(cs?.qtyBtnBgColor ? { backgroundColor: cs.qtyBtnBgColor } : {}),
                              ...(cs?.qtyBtnTextColor ? { color: cs.qtyBtnTextColor } : {}),
                            }}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => removeItem(item.product.id)}
                            className={cn(
                              "ml-auto p-1.5 rounded-full transition-colors",
                              !cs?.itemTrashColor && "text-red-400/60 hover:text-red-400 hover:bg-red-400/10"
                            )}
                            style={{ color: cs?.itemTrashColor || undefined }}
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
                {/* Total — ISOLATED: totalLabelColor, totalValueColor */}
                <div className="flex items-center justify-between">
                  <span
                    className={cn(!cs?.totalLabelColor && "text-lp-text-muted")}
                    style={{ color: cs?.totalLabelColor || undefined }}
                  >
                    Total
                  </span>
                  <span
                    className={cn("text-xl font-bold", !cs?.totalValueColor && "text-lp-text")}
                    style={{ color: cs?.totalValueColor || undefined }}
                  >
                    {formatPrice(getTotalPrice())}
                  </span>
                </div>

                {/* Actions — ISOLATED: ctaBgColor, ctaTextColor, clearLinkColor */}
                <div className="flex gap-2">
                  <button
                    onClick={clearCart}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors",
                      !cs?.clearLinkColor && "text-lp-text-muted hover:text-lp-text bg-lp-surface-soft hover:bg-lp-border"
                    )}
                    style={{ color: cs?.clearLinkColor || undefined }}
                  >
                    Limpar
                  </button>
                  <button
                    onClick={handleFinishOrder}
                    disabled={isSubmitting}
                    className={cn(
                      'flex-[2] flex items-center justify-center gap-2 py-2.5 rounded-xl',
                      'text-sm font-medium transition-colors',
                      !cs?.ctaBgColor && 'bg-[#25D366] hover:bg-[#20BD5A]',
                      !cs?.ctaTextColor && 'text-white',
                      isSubmitting && 'opacity-50 cursor-not-allowed'
                    )}
                    style={{
                      ...(cs?.ctaBgColor ? { backgroundColor: cs.ctaBgColor } : {}),
                      ...(cs?.ctaTextColor ? { color: cs.ctaTextColor } : {}),
                    }}
                  >
                    <MessageCircle className="w-4 h-4" />
                    {isSubmitting ? 'Registrando...' : 'Finalizar Pedido'}
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
