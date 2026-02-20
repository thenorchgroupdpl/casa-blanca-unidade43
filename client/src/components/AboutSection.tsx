/**
 * About Section - Casa Blanca
 * Design: Warm Luxury - Storytelling with owner photo
 * Features: Rich text, image with rounded corners, elegant typography
 * Supports granular style overrides from Design System
 */

import { motion } from 'framer-motion';
import { useSiteData } from '@/store/useStore';

export default function AboutSection() {
  const { data } = useSiteData();

  if (!data) return null;

  const { about } = data.sections_content;

  // Split text into paragraphs
  const paragraphs = about.text ? about.text.split('\n\n').filter(p => p.trim()) : [];

  // Hide section if there's no meaningful content
  const hasContent = paragraphs.length > 0 || (about.owner_photo && about.owner_photo.length > 0);
  if (!hasContent) return null;

  // Granular style helpers
  const imagePosition = about.image_position || 'left';
  const showDecorative = about.show_decorative !== false;
  const showSignature = about.show_signature !== false;
  const imageRadius = about.image_radius ?? 16; // px

  // Background styles
  const hasBgMedia = about.bg_media_url && about.bg_media_url.length > 0;
  const bgOverlayOpacity = about.bg_overlay_opacity ?? 0;
  const bgOverlayColor = about.bg_overlay_color || '#000000';
  const bgFallbackColor = about.bg_fallback_color;

  const sectionStyle: React.CSSProperties = bgFallbackColor && !hasBgMedia
    ? { backgroundColor: bgFallbackColor }
    : {};

  return (
    <section
      id="sobre"
      className="py-20 bg-lp-bg relative overflow-hidden"
      style={sectionStyle}
    >
      {/* Background media */}
      {hasBgMedia && about.bg_media_type === 'video' ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src={about.bg_media_url}
        />
      ) : hasBgMedia ? (
        <img
          src={about.bg_media_url}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : null}

      {/* Background overlay */}
      {hasBgMedia && bgOverlayOpacity > 0 && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: bgOverlayColor,
            opacity: bgOverlayOpacity / 100,
          }}
        />
      )}

      <div className="container relative z-10">
        {/* Pre-headline */}
        <motion.p
          className="text-lp-highlight text-sm font-medium tracking-wider uppercase mb-3"
          style={{
            ...(about.pre_headline_font ? { fontFamily: about.pre_headline_font } : {}),
            ...(about.pre_headline_font_size ? { fontSize: `${about.pre_headline_font_size}px` } : {}),
            ...(about.pre_headline_font_weight ? { fontWeight: about.pre_headline_font_weight } : {}),
            ...(about.pre_headline_color ? { color: about.pre_headline_color } : {}),
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          {about.pre_headline}
        </motion.p>

        {/* Main headline */}
        <motion.h2
          className="font-display text-3xl md:text-4xl lg:text-5xl text-lp-text mb-12"
          style={{
            ...(about.headline_font ? { fontFamily: about.headline_font } : {}),
            ...(about.headline_font_size ? { fontSize: `${about.headline_font_size}px` } : {}),
            ...(about.headline_font_weight ? { fontWeight: about.headline_font_weight } : {}),
            ...(about.headline_color ? { color: about.headline_color } : {}),
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {about.headline}
        </motion.h2>

        <div className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center ${imagePosition === 'right' ? 'direction-rtl' : ''}`}
          style={imagePosition === 'right' ? { direction: 'ltr' } : {}}
        >
          {/* Image - order changes based on position */}
          <motion.div
            className={`relative ${imagePosition === 'right' ? 'lg:order-2' : 'lg:order-1'}`}
            initial={{ opacity: 0, x: imagePosition === 'right' ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div
              className="relative overflow-hidden aspect-[4/5]"
              style={{ borderRadius: `${imageRadius}px` }}
            >
              {about.owner_photo ? (
                <img
                  src={about.owner_photo}
                  alt={about.owner_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-lp-highlight-soft to-lp-highlight-subtle flex items-center justify-center">
                  <span className="font-display text-6xl text-lp-highlight-soft">
                    {(data.project_name || 'CB').substring(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
              {/* Gradient overlay at bottom */}
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-lp-overlay to-transparent" />
              
              {/* Owner info overlay */}
              {(about.owner_name || about.owner_title) && (
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  {about.owner_name && (
                    <p
                      className="font-display text-xl text-lp-text"
                      style={{
                        ...(about.owner_name_font ? { fontFamily: about.owner_name_font } : {}),
                        ...(about.owner_name_font_size ? { fontSize: `${about.owner_name_font_size}px` } : {}),
                        ...(about.owner_name_font_weight ? { fontWeight: about.owner_name_font_weight } : {}),
                        ...(about.owner_name_color ? { color: about.owner_name_color } : {}),
                      }}
                    >
                      {about.owner_name}
                    </p>
                  )}
                  {about.owner_title && (
                    <p
                      className="text-lp-text-muted text-sm mt-1"
                      style={{
                        ...(about.owner_title_color ? { color: about.owner_title_color } : {}),
                      }}
                    >
                      {about.owner_title}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Decorative element */}
            {showDecorative && (
              <div
                className="absolute -bottom-4 -right-4 w-24 h-24 border-2 border-lp-highlight-border -z-10"
                style={{ borderRadius: `${imageRadius}px` }}
              />
            )}
          </motion.div>

          {/* Text Content */}
          <motion.div
            className={`space-y-6 ${imagePosition === 'right' ? 'lg:order-1' : 'lg:order-2'}`}
            initial={{ opacity: 0, x: imagePosition === 'right' ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            {paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="text-lp-text-muted text-lg leading-relaxed"
                style={{
                  ...(about.storytelling_font ? { fontFamily: about.storytelling_font } : {}),
                  ...(about.storytelling_font_size ? { fontSize: `${about.storytelling_font_size}px` } : {}),
                  ...(about.storytelling_font_weight ? { fontWeight: about.storytelling_font_weight } : {}),
                  ...(about.storytelling_color ? { color: about.storytelling_color } : {}),
                }}
              >
                {paragraph}
              </p>
            ))}

            {/* Signature decoration */}
            {showSignature && (
              <div className="pt-6 flex items-center gap-4">
                <div className="w-12 h-px bg-lp-highlight-soft" />
                <span
                  className="text-lp-highlight font-display text-lg italic"
                  style={{
                    ...(about.signature_color ? { color: about.signature_color } : {}),
                  }}
                >
                  {about.signature_text || data.project_name || 'Casa Blanca'}
                </span>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
