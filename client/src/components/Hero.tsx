/**
 * Hero Section - Casa Blanca
 * Design: Warm Luxury - Full-screen hero with image background
 * Features: Dynamic open/closed status, location info, animated headline
 * Supports granular style overrides from Design System
 */

import { motion } from 'framer-motion';
import { MapPin, Clock, ChevronDown } from 'lucide-react';
import { cn, getStatusText } from '@/lib/utils';
import { useSiteData, useUI } from '@/store/useStore';

export default function Hero() {
  const { data } = useSiteData();
  const { openScheduleModal, openOrderOverlay } = useUI();

  if (!data) return null;

  const { hero } = data.sections_content;
  const status = getStatusText(data.business_hours);

  const headlineLines = hero.headline.split('\n');

  // Granular style values with fallbacks
  const overlayOpacity = hero.bg_overlay_opacity ?? 60;
  const overlayColor = hero.bg_overlay_color || '#000000';
  const bgFallback = hero.bg_fallback_color || '';

  // Location box styles
  const locationBg = hero.location_box_bg;
  const locationText = hero.location_box_text;
  const locationIcon = hero.location_box_icon;
  const locationLabel = hero.location_label || data.contact.address.city;

  // Schedule box styles
  const scheduleBg = hero.schedule_box_bg;
  const scheduleText = hero.schedule_box_text;
  const scheduleIcon = hero.schedule_box_icon;
  const scheduleLabel = hero.schedule_label || status.text;

  // Headline styles
  const headlineStyle: React.CSSProperties = {};
  if (hero.headline_font) headlineStyle.fontFamily = `'${hero.headline_font}', Georgia, serif`;
  if (hero.headline_font_size) headlineStyle.fontSize = `${hero.headline_font_size}px`;
  if (hero.headline_font_weight) headlineStyle.fontWeight = hero.headline_font_weight;
  if (hero.headline_color) headlineStyle.color = hero.headline_color;

  // Subheadline styles
  const subheadlineStyle: React.CSSProperties = {};
  if (hero.subheadline_font) subheadlineStyle.fontFamily = `'${hero.subheadline_font}', sans-serif`;
  if (hero.subheadline_font_size) subheadlineStyle.fontSize = `${hero.subheadline_font_size}px`;
  if (hero.subheadline_font_weight) subheadlineStyle.fontWeight = hero.subheadline_font_weight;
  if (hero.subheadline_color) subheadlineStyle.color = hero.subheadline_color;

  // CTA button styles
  const ctaStyle: React.CSSProperties = {};
  if (hero.cta_bg_color) {
    if (hero.cta_gradient && hero.cta_gradient_end) {
      ctaStyle.background = `linear-gradient(135deg, ${hero.cta_bg_color}, ${hero.cta_gradient_end})`;
    } else {
      ctaStyle.backgroundColor = hero.cta_bg_color;
    }
  }
  if (hero.cta_text_color) ctaStyle.color = hero.cta_text_color;

  // Overlay style
  const overlayAlpha = overlayOpacity / 100;

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-center overflow-hidden"
      style={bgFallback ? { backgroundColor: bgFallback } : undefined}
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        {hero.media_url && !hero.media_url.startsWith('/images/') ? (
          hero.media_type === 'video' ? (
            <video
              src={hero.media_url}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={hero.media_url}
              alt={data.project_name || 'Restaurant'}
              className="w-full h-full object-cover"
            />
          )
        ) : (
          <div
            className="w-full h-full bg-gradient-to-br from-lp-surface to-lp-bg"
            style={bgFallback ? { background: bgFallback } : undefined}
          />
        )}
        {/* Gradient Overlay - uses custom opacity and color */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, ${overlayColor}${Math.round(overlayAlpha * 0.8 * 255).toString(16).padStart(2, '0')}, ${overlayColor}${Math.round(overlayAlpha * 0.6 * 255).toString(16).padStart(2, '0')}, ${overlayColor}${Math.round(overlayAlpha * 255).toString(16).padStart(2, '0')})`,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to right, ${overlayColor}${Math.round(overlayAlpha * 0.8 * 255).toString(16).padStart(2, '0')}, transparent, transparent)`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container pt-32 pb-20">
        {/* Info Bar */}
        <motion.div
          className="flex flex-wrap items-center gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Location */}
          <a
            href="#contato"
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm border transition-colors group',
              !locationBg && 'bg-lp-border border-lp-border hover:border-lp-highlight-border'
            )}
            style={locationBg ? {
              backgroundColor: locationBg,
              borderColor: locationBg,
            } : undefined}
          >
            <MapPin
              className={cn('w-4 h-4', !locationIcon && 'text-lp-highlight')}
              style={locationIcon ? { color: locationIcon } : undefined}
            />
            <span
              className={cn('text-sm', !locationText && 'text-lp-text-muted group-hover:text-lp-text transition-colors')}
              style={locationText ? { color: locationText } : undefined}
            >
              {locationLabel}
            </span>
          </a>

          {/* Status */}
          <button
            onClick={openScheduleModal}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm transition-all',
              !scheduleBg && (status.isOpen ? 'badge-open' : 'badge-closed')
            )}
            style={scheduleBg ? {
              backgroundColor: scheduleBg,
              color: scheduleText || undefined,
            } : undefined}
          >
            <Clock
              className="w-4 h-4"
              style={scheduleIcon ? { color: scheduleIcon } : undefined}
            />
            <span
              className="text-sm font-medium"
              style={scheduleText ? { color: scheduleText } : undefined}
            >
              {scheduleLabel}
            </span>
          </button>
        </motion.div>

        {/* Headline */}
        <div className="max-w-3xl">
          <h1
            className={cn(
              'font-display leading-tight',
              !hero.headline_font_size && 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl',
              !hero.headline_color && 'text-lp-text'
            )}
            style={headlineStyle}
          >
            {headlineLines.map((line, index) => (
              <motion.span
                key={index}
                className="block"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.15 }}
              >
                {line}
              </motion.span>
            ))}
          </h1>

          <motion.p
            className={cn(
              'mt-6 max-w-xl',
              !hero.subheadline_font_size && 'text-lg md:text-xl',
              !hero.subheadline_color && 'text-lp-text-muted'
            )}
            style={subheadlineStyle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            {hero.subheadline}
          </motion.p>

          {/* CTA Button */}
          <motion.button
            onClick={openOrderOverlay}
            className={cn(
              'mt-8 inline-flex items-center gap-3 px-8 py-4 rounded-full',
              'font-semibold text-lg',
              'hover:scale-105 transition-all duration-300',
              !hero.cta_bg_color && 'bg-lp-btn hover:bg-lp-btn-hover gold-glow hover:gold-glow',
              !hero.cta_text_color && 'text-lp-btn-fg'
            )}
            style={ctaStyle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {hero.cta_text}
          </motion.button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.a
        href="#intro"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-lp-text-subtle hover:text-lp-highlight transition-colors"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.2 }}
      >
        <span className="text-xs uppercase tracking-widest">Explorar</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </motion.a>
    </section>
  );
}
