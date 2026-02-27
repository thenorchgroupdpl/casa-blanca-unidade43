/**
 * Cart Drawer - Casa Blanca
 * Design: Warm Luxury - Side drawer for cart review and checkout
 * Features: Item list, quantity controls, observation field, delivery zone selector, WhatsApp checkout
 * 
 * REFACTORED: All customizable styles injected via inline styles from cart_style.
 * Falls back to Tailwind theme classes when no custom color is set.
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, MessageCircle, ShoppingBag, Truck, Store, MapPin, ChevronDown } from 'lucide-react';
import { cn, formatPrice, generateWhatsAppMessage, openWhatsApp } from '@/lib/utils';
import { useCart, useSiteData } from '@/store/useStore';
import { trpc } from '@/lib/trpc';

export default function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [observation, setObservation] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  const [showZoneSelector, setShowZoneSelector] = useState(false);
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice, tenantId } = useCart();
  const { data } = useSiteData();

  // Cart style from Design System (Cardápio)
  const cs = data?.cart_menu_style;

  // Fetch delivery zones for the current tenant
  const { data: deliveryZones } = trpc.deliveryZones.listPublic.useQuery(
    { tenantId: tenantId! },
    { enabled: !!tenantId && isOpen }
  );

  const hasDeliveryZones = deliveryZones && deliveryZones.length > 0;

  const selectedZone = useMemo(() => {
    if (!deliveryZones || !selectedZoneId) return null;
    return deliveryZones.find((z: any) => z.id === selectedZoneId) || null;
  }, [deliveryZones, selectedZoneId]);

  const deliveryFee = selectedZone ? parseFloat(selectedZone.feeAmount || '0') : 0;
  const subtotal = getTotalPrice();
  const totalWithDelivery = subtotal + deliveryFee;

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

  // Create order mutation
  const createOrder = trpc.orders.create.useMutation();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckout = async () => {
    if (!data || items.length === 0 || isSubmitting) return;

    setIsSubmitting(true);

    const storeName = data.project_name || 'Casa Blanca';
    const deliveryInfo = selectedZone
      ? { zoneName: selectedZone.zoneName, fee: deliveryFee }
      : null;

    const message = generateWhatsAppMessage(items, totalWithDelivery, observation || undefined, storeName, deliveryInfo);

    // 1. Save order in the database FIRST
    try {
      if (!tenantId) {
        throw new Error('Tenant não identificado');
      }

      const summary = items
        .map((item) => `${item.quantity}x ${item.product.name}`)
        .join(', ');

      await createOrder.mutateAsync({
        tenantId,
        customerName: 'Cliente via WhatsApp',
        summary,
        items: items.map((item) => ({
          productId: Number(item.product.id),
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
        })),
        totalValue: totalWithDelivery.toFixed(2),
        deliveryZoneId: selectedZone?.id,
        deliveryZoneName: selectedZone?.zoneName,
        deliveryFee: deliveryFee > 0 ? deliveryFee.toFixed(2) : undefined,
      });
    } catch {
      // Show error and DO NOT open WhatsApp
      setIsSubmitting(false);
      // Use a simple alert since we're on the public landing page (no toast library)
      alert('Não foi possível registrar seu pedido. Por favor, tente novamente.');
      return;
    }

    // 2. Only open WhatsApp AFTER order is saved successfully
    openWhatsApp(data.contact.whatsapp, message);
    
    // 3. Clear cart after successful checkout
    clearCart();
    setObservation('');
    setSelectedZoneId(null);
    setIsOpen(false);
    setIsSubmitting(false);
  };

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
                  style={{ color: cs?.headerIconColor || cs?.headerTextColor || undefined }}
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

                    {/* Delivery Zone Selector */}
                    {hasDeliveryZones && (
                      <div className="pt-4">
                        <label
                          className={cn("block text-sm font-medium mb-2", !cs?.headerTextColor && "text-lp-text")}
                          style={{ color: cs?.headerTextColor || undefined }}
                        >
                          <MapPin className="w-4 h-4 inline mr-1" />
                          Entrega / Retirada
                        </label>
                        
                        {/* Zone Selector Button */}
                        <button
                          onClick={() => setShowZoneSelector(!showZoneSelector)}
                          className={cn(
                            "w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors",
                            !cs?.obsBgColor && "bg-lp-surface-soft",
                            !cs?.obsBorderColor && "border-lp-border",
                            !cs?.obsTextColor && "text-lp-text"
                          )}
                          style={{
                            ...(cs?.obsBgColor ? { backgroundColor: cs.obsBgColor } : {}),
                            ...(cs?.obsBorderColor ? { borderColor: cs.obsBorderColor, borderWidth: '1px', borderStyle: 'solid' } : {}),
                            ...(cs?.obsTextColor ? { color: cs.obsTextColor } : {}),
                          }}
                        >
                          <span className={cn(!selectedZone && "opacity-60")}>
                            {selectedZone ? (
                              <span className="flex items-center gap-2">
                                {selectedZone.isPickup ? (
                                  <Store className="w-4 h-4" />
                                ) : (
                                  <Truck className="w-4 h-4" />
                                )}
                                {selectedZone.zoneName}
                                {!selectedZone.isPickup && deliveryFee > 0 && (
                                  <span className="opacity-70 text-sm">
                                    (+{formatPrice(deliveryFee)})
                                  </span>
                                )}
                                {selectedZone.isPickup && (
                                  <span className="opacity-70 text-sm">(Grátis)</span>
                                )}
                              </span>
                            ) : (
                              'Selecione a forma de entrega'
                            )}
                          </span>
                          <ChevronDown className={cn("w-4 h-4 transition-transform", showZoneSelector && "rotate-180")} />
                        </button>

                        {/* Zone Options */}
                        <AnimatePresence>
                          {showZoneSelector && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-2 space-y-1.5">
                                {deliveryZones.map((zone: any) => {
                                  const fee = parseFloat(zone.feeAmount || '0');
                                  const isSelected = selectedZoneId === zone.id;
                                  return (
                                    <button
                                      key={zone.id}
                                      onClick={() => {
                                        setSelectedZoneId(zone.id);
                                        setShowZoneSelector(false);
                                      }}
                                      className={cn(
                                        "w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all",
                                        isSelected
                                          ? "border-lp-highlight bg-lp-highlight/10"
                                          : "border-lp-border bg-lp-surface-soft hover:border-lp-highlight/50"
                                      )}
                                    >
                                      <span className="flex items-center gap-2 text-lp-text">
                                        {zone.isPickup ? (
                                          <Store className="w-4 h-4 text-lp-highlight" />
                                        ) : (
                                          <Truck className="w-4 h-4 text-lp-text-muted" />
                                        )}
                                        <span className="text-sm font-medium">{zone.zoneName}</span>
                                      </span>
                                      <span className={cn(
                                        "text-sm font-semibold",
                                        zone.isPickup || fee === 0 ? "text-green-500" : "text-lp-highlight"
                                      )}>
                                        {zone.isPickup || fee === 0 ? 'Grátis' : formatPrice(fee)}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

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
                  <div className="p-6 border-t border-lp-border space-y-3">
                    {/* Subtotal + Delivery Fee breakdown */}
                    {hasDeliveryZones && selectedZone && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-lp-text-muted">Subtotal</span>
                          <span className="text-lp-text">{formatPrice(subtotal)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-lp-text-muted flex items-center gap-1">
                            {selectedZone.isPickup ? (
                              <><Store className="w-3 h-3" /> Retirada</>
                            ) : (
                              <><Truck className="w-3 h-3" /> Entrega</>
                            )}
                          </span>
                          <span className={cn(
                            deliveryFee === 0 ? "text-green-500" : "text-lp-text"
                          )}>
                            {deliveryFee === 0 ? 'Grátis' : formatPrice(deliveryFee)}
                          </span>
                        </div>
                        <div className="border-t border-lp-border my-1" />
                      </div>
                    )}

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
                        {formatPrice(totalWithDelivery)}
                      </span>
                    </div>

                    {/* Checkout Button — ISOLATED: ctaBgColor, ctaTextColor */}
                    <button
                      onClick={handleCheckout}
                      disabled={(hasDeliveryZones && !selectedZone) || isSubmitting}
                      className={cn(
                        'w-full flex items-center justify-center gap-3',
                        'py-4 rounded-2xl',
                        'font-semibold text-lg',
                        'transition-colors',
                        !cs?.ctaBgColor && 'bg-[#25D366]',
                        !cs?.ctaTextColor && 'text-white',
                        ((hasDeliveryZones && !selectedZone) || isSubmitting) && 'opacity-50 cursor-not-allowed'
                      )}
                      style={{
                        ...(cs?.ctaBgColor ? { backgroundColor: cs.ctaBgColor } : {}),
                        ...(cs?.ctaTextColor ? { color: cs.ctaTextColor } : {}),
                      }}
                    >
                      <MessageCircle className="w-5 h-5" />
                      {isSubmitting
                        ? 'Registrando pedido...'
                        : hasDeliveryZones && !selectedZone
                          ? 'Selecione a entrega'
                          : 'Finalizar no WhatsApp'}
                    </button>

                    {/* Clear Cart — ISOLATED: clearLinkColor */}
                    <button
                      onClick={() => {
                        clearCart();
                        setObservation('');
                        setSelectedZoneId(null);
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
