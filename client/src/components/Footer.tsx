/**
 * Footer Component - Casa Blanca
 * Design: Warm Luxury - CTA section with social icons and legal info
 * Features: Final WhatsApp CTA, social media icons, copyright, dynamic company name
 *           + info_style overrides from Design System
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Instagram, Facebook, Youtube } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSiteData, useUI } from '@/store/useStore';

// TikTok icon (not available in lucide-react)
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.73a8.19 8.19 0 004.76 1.52V6.79a4.84 4.84 0 01-1-.1z" />
    </svg>
  );
}

// Helper: ensure URL is complete
function ensureUrl(value: string, baseUrl: string): string {
  if (!value) return '';
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  const clean = value.replace('@', '');
  return `${baseUrl}${clean}`;
}

export default function Footer() {
  const { data } = useSiteData();
  const { openWhatsAppModal } = useUI();

  // All hooks BEFORE early returns
  const s = useMemo(() => data?.info_style || {}, [data?.info_style]);

  if (!data) return null;

  const { footer } = data.sections_content;
  const { contact } = data;
  const currentYear = new Date().getFullYear();
  const companyName = data.project_name || 'Casa Blanca';

  // Split company name for highlight effect
  const nameParts = companyName.split(' ');
  const firstName = nameParts[0] || '';
  const restName = nameParts.slice(1).join(' ');

  // Use sectionBgColor from info_style for footer background
  const footerBg = s.sectionBgColor;

  // Build social links array
  const socialLinks = [
    {
      icon: Instagram,
      label: 'Instagram',
      href: ensureUrl(contact.instagram, 'https://instagram.com/'),
      enabled: !!(contact.instagram) && (s.socialInstagramEnabled ?? true),
    },
    {
      icon: Facebook,
      label: 'Facebook',
      href: ensureUrl(contact.facebook, 'https://facebook.com/'),
      enabled: !!(contact.facebook) && (s.socialFacebookEnabled ?? true),
    },
    {
      icon: Youtube,
      label: 'YouTube',
      href: ensureUrl(contact.youtube, 'https://youtube.com/@'),
      enabled: !!(contact.youtube) && (s.socialYoutubeEnabled ?? true),
    },
    {
      icon: TikTokIcon,
      label: 'TikTok',
      href: ensureUrl(contact.tiktok, 'https://tiktok.com/@'),
      enabled: !!(contact.tiktok) && (s.socialTiktokEnabled ?? true),
    },
  ].filter(link => link.enabled && link.href);

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

            {/* Social Icons */}
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lp-text-muted hover:text-lp-highlight transition-colors duration-200"
                    aria-label={social.label}
                    title={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            )}

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
