/**
 * WhatsApp Confirmation Modal - Casa Blanca
 * Design: Warm Luxury - Glass modal with pulsing CTA
 * Features: Phone number display, avatar, animated button
 *           + Design System overrides (whatsapp_popup_*)
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle } from 'lucide-react';
import { cn, openWhatsApp } from '@/lib/utils';
import { useSiteData, useUI } from '@/store/useStore';

export default function WhatsAppModal() {
  const { data } = useSiteData();
  const { isWhatsAppModalOpen, closeWhatsAppModal } = useUI();

  if (!data) return null;

  const handleOpenWhatsApp = () => {
    openWhatsApp(data.contact.whatsapp);
    closeWhatsAppModal();
  };

  // Style overrides from Design System
  const popupBg = data.whatsapp_popup_bg;
  const popupTextColor = data.whatsapp_popup_text_color;
  const buttonBg = data.whatsapp_button_bg || '#25D366';
  const buttonTextColor = data.whatsapp_button_text_color;

  return (
    <AnimatePresence>
      {isWhatsAppModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeWhatsAppModal}
            className="fixed inset-0 z-50 bg-lp-overlay backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 mx-auto max-w-sm"
          >
            <div
              className={cn("relative rounded-3xl p-8 border shadow-2xl", !popupBg && "bg-lp-surface border-lp-border")}
              style={{
                ...(popupBg ? { backgroundColor: popupBg, borderColor: `${popupBg}40` } : {}),
              }}
            >
              {/* Close Button */}
              <button
                onClick={closeWhatsAppModal}
                className={cn("absolute top-4 right-4 p-2 transition-colors", !popupTextColor && "text-lp-text-muted hover:text-lp-text")}
                style={popupTextColor ? { color: popupTextColor, opacity: 0.6 } : undefined}
              >
                <X className="w-5 h-5" />
              </button>

              {/* Content */}
              <div className="text-center">
                {/* Avatar */}
                <div className="w-20 h-20 mx-auto mb-6 rounded-full overflow-hidden border-2 border-lp-highlight-border">
                  {(data.whatsapp_avatar || data.sections_content.about.owner_photo) ? (
                    <img
                      src={data.whatsapp_avatar || data.sections_content.about.owner_photo}
                      alt={`Atendente ${data.whatsapp_name || data.project_name || 'Casa Blanca'}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-lp-highlight-soft flex items-center justify-center">
                      <MessageCircle className="w-8 h-8 text-lp-highlight" />
                    </div>
                  )}
                </div>

                {/* Attendant Name */}
                {data.whatsapp_name && (
                  <p
                    className={cn("font-semibold text-base mb-1", !popupTextColor && "text-lp-text")}
                    style={popupTextColor ? { color: popupTextColor } : undefined}
                  >
                    {data.whatsapp_name}
                  </p>
                )}

                {/* Title */}
                <h3
                  className={cn("font-display text-xl mb-2", !popupTextColor && "text-lp-text")}
                  style={popupTextColor ? { color: popupTextColor } : undefined}
                >
                  {data.whatsapp_popup_title || 'Olá! Como podemos ajudar?'}
                </h3>
                <p
                  className={cn("text-sm mb-6", !popupTextColor && "text-lp-text-muted")}
                  style={popupTextColor ? { color: popupTextColor, opacity: 0.6 } : undefined}
                >
                  {`Você será redirecionado para o WhatsApp da ${data.project_name || 'Casa Blanca'}`}
                </p>

                {/* CTA Button */}
                <motion.button
                  onClick={handleOpenWhatsApp}
                  className="w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-3"
                  style={{
                    backgroundColor: buttonBg,
                    color: buttonTextColor || '#ffffff',
                  }}
                  animate={{
                    boxShadow: [
                      `0 0 0 0 ${buttonBg}66`,
                      `0 0 0 10px ${buttonBg}00`,
                    ],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                >
                  <MessageCircle className="w-5 h-5" />
                  {data.whatsapp_button_text || 'Iniciar Conversa'}
                </motion.button>

                {/* Cancel */}
                <button
                  onClick={closeWhatsAppModal}
                  className={cn("mt-4 text-sm transition-colors", !popupTextColor && "text-lp-text-muted hover:text-lp-text")}
                  style={popupTextColor ? { color: popupTextColor, opacity: 0.5 } : undefined}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
