/**
 * About Section - Casa Blanca
 * Design: Warm Luxury - Storytelling with owner photo
 * Features: Rich text, image with rounded corners, elegant typography
 */

import { motion } from 'framer-motion';
import { useSiteData } from '@/store/useStore';

export default function AboutSection() {
  const { data } = useSiteData();

  if (!data) return null;

  const { about } = data.sections_content;

  // Split text into paragraphs
  const paragraphs = about.text ? about.text.split('\n\n').filter(p => p.trim()) : [];

  // Hide section if there's no meaningful content (need at least text or a real photo)
  const hasContent = paragraphs.length > 0 || (about.owner_photo && about.owner_photo.length > 0);
  if (!hasContent) return null;

  return (
    <section id="sobre" className="py-20 bg-lp-bg">
      <div className="container">
        {/* Pre-headline */}
        <motion.p
          className="text-lp-highlight text-sm font-medium tracking-wider uppercase mb-3"
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
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {about.headline}
        </motion.h2>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="relative rounded-2xl overflow-hidden aspect-[4/5]">
              {about.owner_photo ? (
                <img
                  src={about.owner_photo}
                  alt={about.owner_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-lp-highlight-soft to-lp-highlight-subtle flex items-center justify-center">
                  <span className="font-display text-6xl text-lp-highlight-soft">CB</span>
                </div>
              )}
              {/* Gradient overlay at bottom */}
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-lp-overlay to-transparent" />
              
              {/* Owner info overlay */}
              {(about.owner_name || about.owner_title) && (
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  {about.owner_name && <p className="font-display text-xl text-lp-text">{about.owner_name}</p>}
                  {about.owner_title && <p className="text-lp-text-muted text-sm mt-1">{about.owner_title}</p>}
                </div>
              )}
            </div>

            {/* Decorative element */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 border-2 border-lp-highlight-border rounded-2xl -z-10" />
          </motion.div>

          {/* Text Content */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            {paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="text-lp-text-muted text-lg leading-relaxed"
              >
                {paragraph}
              </p>
            ))}

            {/* Signature decoration */}
            <div className="pt-6 flex items-center gap-4">
              <div className="w-12 h-px bg-lp-highlight-soft" />
              <span className="text-lp-highlight font-display text-lg italic">
                {data.project_name || 'Casa Blanca'}
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
