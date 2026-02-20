/**
 * Footer Component - Casa Blanca
 * Design: Warm Luxury - CTA section with legal info
 * Features: Final WhatsApp CTA, copyright, developer credits
 */

import { motion } from 'framer-motion';
import { MessageCircle, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSiteData, useUI } from '@/store/useStore';

export default function Footer() {
  const { data } = useSiteData();
  const { openWhatsAppModal } = useUI();

  if (!data) return null;

  const { footer } = data.sections_content;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-lp-surface-soft border-t border-lp-border">
      {/* CTA Section */}
      <motion.div
        className="container py-16 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="font-display text-2xl md:text-3xl lg:text-4xl text-lp-text mb-4">
          {footer.cta_headline}
        </h2>
        <p className="text-lp-text-muted mb-8 max-w-md mx-auto">
          {footer.cta_subheadline}
        </p>
        
        <button
          onClick={openWhatsAppModal}
          className={cn(
            'inline-flex items-center gap-3 px-8 py-4 rounded-full',
            'bg-lp-accent text-lp-accent-fg font-semibold text-lg',
            'hover:bg-lp-accent-hover transition-all duration-300',
            'gold-glow hover:scale-105'
          )}
        >
          <MessageCircle className="w-5 h-5" />
          Mandar Mensagem
        </button>
      </motion.div>

      {/* Bottom Bar */}
      <div className="border-t border-lp-border">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Logo */}
            <div className="font-display text-xl text-lp-text">
              Casa <span className="text-lp-accent">Blanca</span>
            </div>

            {/* Copyright */}
            <p className="text-sm text-lp-text-subtle">
              © {currentYear} Casa Blanca. Todos os direitos reservados.
            </p>

            {/* Developer Credit */}
            <p className="text-sm text-lp-text-subtle flex items-center gap-1">
              {footer.developer.replace('❤️', '')}
              <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
