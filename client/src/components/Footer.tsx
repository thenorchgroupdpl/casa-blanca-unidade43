/**
 * Footer Component - Casa Blanca
 * Design: Warm Luxury - CTA section with legal info
 * Features: Final WhatsApp CTA, copyright, developer credits, dynamic company name
 *           + info_style overrides from Design System
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSiteData, useUI } from '@/store/useStore';

export default function Footer() {
  const { data } = useSiteData();
  const { openWhatsAppModal } = useUI();

  // All hooks BEFORE early returns
  const s = useMemo(() => data?.info_style || {}, [data?.info_style]);

  if (!data) return null;

  const { footer } = data.sections_content;
  const currentYear = new Date().getFullYear();
  const companyName = data.project_name || 'Casa Blanca';

  // Split company name for highlight effect
  const nameParts = companyName.split(' ');
  const firstName = nameParts[0] || '';
  const restName = nameParts.slice(1).join(' ');

  // Use sectionBgColor from info_style for footer background
  const footerBg = s.sectionBgColor;

  return (
    <footer
      className={cn(!footerBg && "bg-lp-surface-soft", "border-t border-lp-border")}
      style={footerBg ? { backgroundColor: footerBg } : undefined}
    >
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
            'bg-lp-btn text-lp-btn-fg font-semibold text-lg',
            'hover:bg-lp-btn-hover transition-all duration-300',
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
              {data.logo_type === 'image' && data.logo_url ? (
                <img
                  src={data.logo_url}
                  alt={companyName}
                  className="h-6 w-auto object-contain"
                />
              ) : (
                <>
                  {firstName}{restName ? ' ' : ''}<span className="text-lp-highlight">{restName}</span>
                </>
              )}
            </div>

            {/* Copyright */}
            <p className="text-sm text-lp-text-subtle">
              {footer.copyright || `© ${currentYear} ${companyName}. Todos os direitos reservados.`}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
