/**
 * WhatsApp Confirmation Modal - Casa Blanca
 * Design: Warm Luxury - Glass modal with pulsing CTA
 * Features: Phone number display, avatar, animated button
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle } from 'lucide-react';
import { cn, formatPhone, openWhatsApp } from '@/lib/utils';
import { useSiteData, useUI } from '@/store/useStore';

export default function WhatsAppModal() {
  const { data } = useSiteData();
  const { isWhatsAppModalOpen, closeWhatsAppModal } = useUI();

  if (!data) return null;

  const handleOpenWhatsApp = () => {
    openWhatsApp(data.contact.whatsapp);
    closeWhatsAppModal();
  };

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
            <div className="relative bg-lp-surface rounded-3xl p-8 border border-lp-border shadow-2xl">
              {/* Close Button */}
              <button
                onClick={closeWhatsAppModal}
                className="absolute top-4 right-4 p-2 text-lp-text-muted hover:text-lp-text transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Content */}
              <div className="text-center">
                {/* Avatar */}
                <div className="w-20 h-20 mx-auto mb-6 rounded-full overflow-hidden border-2 border-lp-highlight-border">
                  {data.sections_content.about.owner_photo ? (
                    <img
                      src={data.sections_content.about.owner_photo}
                      alt={`Atendente ${data.project_name || 'Casa Blanca'}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-lp-highlight-soft flex items-center justify-center">
                      <MessageCircle className="w-8 h-8 text-lp-highlight" />
                    </div>
                  )}
                </div>

                {/* Title */}
                <h3 className="font-display text-xl text-lp-text mb-2">
                  Deseja seguir para o WhatsApp?
                </h3>
                <p className="text-lp-text-muted text-sm mb-6">
                  {`Você será redirecionado para o WhatsApp da ${data.project_name || 'Casa Blanca'}`}
                </p>

                {/* Phone Number */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lp-surface-soft mb-6">
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span className="text-lp-text font-medium">
                    {formatPhone(data.contact.whatsapp)}
                  </span>
                </div>

                {/* CTA Button */}
                <motion.button
                  onClick={handleOpenWhatsApp}
                  className={cn(
                    'w-full py-4 rounded-2xl font-semibold text-lp-text',
                    'bg-[#25D366] hover:bg-[#20BD5A] transition-colors',
                    'flex items-center justify-center gap-3'
                  )}
                  animate={{
                    boxShadow: [
                      '0 0 0 0 rgba(37, 211, 102, 0.4)',
                      '0 0 0 10px rgba(37, 211, 102, 0)',
                    ],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                >
                  <MessageCircle className="w-5 h-5" />
                  Abrir WhatsApp
                </motion.button>

                {/* Cancel */}
                <button
                  onClick={closeWhatsAppModal}
                  className="mt-4 text-sm text-lp-text-muted hover:text-lp-text transition-colors"
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
