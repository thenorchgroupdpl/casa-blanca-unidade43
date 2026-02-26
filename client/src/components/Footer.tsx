/**
 * Footer Component - Casa Blanca
 * Design: Warm Luxury - CTA section with copyright
 * Features: Editable headline/subheadline/CTA, dynamic colors,
 *           conditional logo, copyright with fallback
 *           + info_style overrides from Design System (6.9 Footer)
 * NOTE: Social icons removed — lojista uses seção 6.6 Redes Sociais instead
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

  // Footer style overrides from info_style (6.9)
  const footerBg = s.footerBgColor;
  const footerText = s.footerTextColor;
  const copyrightText = s.footerCopyrightText;
  const headlineText = s.footerHeadlineText;
  const subheadlineText = s.footerSubheadlineText;
  const ctaText = s.footerCtaText;
  const ctaBg = s.footerCtaBg;
  const ctaTextColor = s.footerCtaTextColor;
  const showLogo = s.footerShowLogo !== false; // default true

  // Use sectionBgColor from info_style for footer background (legacy fallback)
  const sectionBg = s.sectionBgColor;
  // Priority: footerBgColor > sectionBgColor > default class
  const resolvedBg = footerBg || sectionBg;

  return (
    <footer
      className={cn(!resolvedBg && "bg-lp-surface-soft", "border-t border-lp-border")}
      style={{
        ...(resolvedBg ? { backgroundColor: resolvedBg } : {}),
        ...(footerText ? { color: footerText } : {}),
      }}
    >
      {/* CTA Section */}
      <motion.div
        className="container py-16 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
      >
        <h2
          className={cn("font-display text-2xl md:text-3xl lg:text-4xl mb-4", !footerText && "text-lp-text")}
          style={footerText ? { color: footerText } : undefined}
        >
          {headlineText || footer.cta_headline}
        </h2>
        <p
          className={cn("mb-8 max-w-md mx-auto", !footerText && "text-lp-text-muted")}
          style={footerText ? { color: footerText, opacity: 0.7 } : undefined}
        >
          {subheadlineText || footer.cta_subheadline}
        </p>
        
        <button
          onClick={openWhatsAppModal}
          className={cn(
            'inline-flex items-center gap-3 px-8 py-4 rounded-full',
            'font-semibold text-lg',
            'transition-all duration-300',
            'gold-glow hover:scale-105',
            !ctaBg && 'bg-lp-btn hover:bg-lp-btn-hover',
            !ctaTextColor && 'text-lp-btn-fg'
          )}
          style={{
            ...(ctaBg ? { backgroundColor: ctaBg } : {}),
            ...(ctaTextColor ? { color: ctaTextColor } : {}),
          }}
        >
          <MessageCircle className="w-5 h-5" />
          {ctaText || 'Mandar Mensagem'}
        </button>
      </motion.div>

      {/* Bottom Bar */}
      <div
        className="border-t border-lp-border"
        style={footerText ? { borderColor: `${footerText}20` } : undefined}
      >
        <div className="container py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Logo (conditional) */}
            {showLogo && (
              <div
                className={cn("font-display text-xl", !footerText && "text-lp-text")}
                style={footerText ? { color: footerText } : undefined}
              >
                {data.logo_type === 'image' && data.logo_url ? (
                  <img
                    src={data.logo_url}
                    alt={companyName}
                    className="h-6 w-auto object-contain"
                  />
                ) : (
                  <>
                    {firstName}{restName ? ' ' : ''}
                    <span
                      className={cn(!footerText && "text-lp-highlight")}
                      style={footerText ? { color: footerText } : undefined}
                    >
                      {restName}
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Copyright */}
            <p
              className={cn("text-sm", !footerText && "text-lp-text-subtle", !showLogo && "mx-auto")}
              style={footerText ? { color: footerText, opacity: 0.6 } : undefined}
            >
              {copyrightText || footer.copyright || `© ${currentYear} ${companyName}. Todos os direitos reservados.`}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
