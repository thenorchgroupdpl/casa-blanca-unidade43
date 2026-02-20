/**
 * Hero Section - Casa Blanca
 * Design: Warm Luxury - Full-screen hero with image background
 * Features: Dynamic open/closed status, location info, animated headline
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

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-center overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        {hero.media_url && !hero.media_url.startsWith('/images/') ? (
          <img
            src={hero.media_url}
            alt="Casa Blanca Restaurant"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-lp-surface to-lp-bg" />
        )}
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-lp-overlay/80 via-lp-overlay/60 to-lp-bg" />
        <div className="absolute inset-0 bg-gradient-to-r from-lp-overlay/80 via-transparent to-transparent" />
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
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-lp-border backdrop-blur-sm border border-lp-border hover:border-lp-highlight-border transition-colors group"
          >
            <MapPin className="w-4 h-4 text-lp-highlight" />
            <span className="text-sm text-lp-text-muted group-hover:text-lp-text transition-colors">
              {data.contact.address.city}
            </span>
          </a>

          {/* Status */}
          <button
            onClick={openScheduleModal}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm transition-all',
              status.isOpen ? 'badge-open' : 'badge-closed'
            )}
          >
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">{status.text}</span>
          </button>
        </motion.div>

        {/* Headline */}
        <div className="max-w-3xl">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-lp-text leading-tight">
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
            className="mt-6 text-lg md:text-xl text-lp-text-muted max-w-xl"
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
              'bg-lp-btn text-lp-btn-fg font-semibold text-lg',
              'hover:bg-lp-btn-hover transition-all duration-300',
              'gold-glow hover:scale-105'
            )}
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
