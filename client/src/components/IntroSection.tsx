
/**
 * Intro Section - Casa Blanca
 * Design: Warm Luxury - Divisor section with rounded top corners
 * Purpose: Visual transition from Hero to content sections
 * Now supports granular style overrides from Design System (Products section)
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSiteData } from '@/store/useStore';

// Map Tailwind-style gradient directions to CSS linear-gradient angles
const GRADIENT_CSS_MAP: Record<string, string> = {
  'to-b': '180deg',
  'to-t': '0deg',
  'to-r': '90deg',
  'to-l': '270deg',
  'to-br': '135deg',
  'to-bl': '225deg',
  'to-tr': '45deg',
  'to-tl': '315deg',
};

export default function IntroSection() {
  const { data } = useSiteData();

  const intro = data?.sections_content?.intro;

  // ALL hooks MUST be called before any early return (React rules of hooks)
  const sectionStyle = useMemo(() => {
    if (!intro) return {};
    const style: React.CSSProperties = {};
    if (intro.bg_gradient && intro.bg_gradient_from && intro.bg_gradient_to) {
      const dir = GRADIENT_CSS_MAP[intro.bg_gradient_direction || 'to-b'] || '180deg';
      style.background = `linear-gradient(${dir}, ${intro.bg_gradient_from}, ${intro.bg_gradient_to})`;
    } else if (intro.bg_color) {
      style.backgroundColor = intro.bg_color;
    }
    return style;
  }, [intro?.bg_color, intro?.bg_gradient, intro?.bg_gradient_from, intro?.bg_gradient_to, intro?.bg_gradient_direction]);

  const headlineStyle = useMemo(() => {
    if (!intro) return {};
    const style: React.CSSProperties = {};
    if (intro.headline_font && intro.headline_font !== 'inherit') style.fontFamily = `'${intro.headline_font}', sans-serif`;
    if (intro.headline_font_size) style.fontSize = `${intro.headline_font_size}px`;
    if (intro.headline_font_weight) style.fontWeight = intro.headline_font_weight;
    if (intro.headline_color) style.color = intro.headline_color;
    return style;
  }, [intro?.headline_font, intro?.headline_font_size, intro?.headline_font_weight, intro?.headline_color]);

  const subheadlineStyle = useMemo(() => {
    if (!intro) return {};
    const style: React.CSSProperties = {};
    if (intro.subheadline_font && intro.subheadline_font !== 'inherit') style.fontFamily = `'${intro.subheadline_font}', sans-serif`;
    if (intro.subheadline_font_size) style.fontSize = `${intro.subheadline_font_size}px`;
    if (intro.subheadline_font_weight) style.fontWeight = intro.subheadline_font_weight;
    if (intro.subheadline_color) style.color = intro.subheadline_color;
    return style;
  }, [intro?.subheadline_font, intro?.subheadline_font_size, intro?.subheadline_font_weight, intro?.subheadline_color]);

  // Early return AFTER all hooks
  if (!data || !intro) return null;

  const hasBgMedia = !!intro.bg_media_url;

  return (
    <section
      id="intro"
      className="relative bg-lp-bg section-divider pt-16 pb-8"
      style={sectionStyle}
    >
      {/* Background media */}
      {hasBgMedia && (
        <>
          {intro.bg_media_type === 'video' ? (
            <video
              src={intro.bg_media_url}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          ) : (
            <div
              className="absolute inset-0 w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${intro.bg_media_url})` }}
            />
          )}
          {/* Overlay */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: intro.bg_overlay_color || '#000000',
              opacity: (intro.bg_overlay_opacity ?? 0) / 100,
            }}
          />
        </>
      )}

      {/* Decorative top border */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-lp-highlight-soft rounded-full" />

      <div className="container text-center relative z-10">
        <motion.h2
          className="font-display text-3xl md:text-4xl lg:text-5xl text-lp-text"
          style={headlineStyle}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          {intro.headline}
        </motion.h2>

        <motion.p
          className="mt-4 text-lg text-lp-text-muted max-w-2xl mx-auto"
          style={subheadlineStyle}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {intro.subheadline}
        </motion.p>
      </div>
    </section>
  );
}
