/**
 * Intro Section - Casa Blanca
 * Design: Warm Luxury - Divisor section with rounded top corners
 * Purpose: Visual transition from Hero to content sections
 */

import { motion } from 'framer-motion';
import { useSiteData } from '@/store/useStore';

export default function IntroSection() {
  const { data } = useSiteData();

  if (!data) return null;

  const { intro } = data.sections_content;

  return (
    <section
      id="intro"
      className="relative bg-background section-divider pt-16 pb-8"
    >
      {/* Decorative top border */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-primary/30 rounded-full" />

      <div className="container text-center">
        <motion.h2
          className="font-display text-3xl md:text-4xl lg:text-5xl text-white"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          {intro.headline}
        </motion.h2>

        <motion.p
          className="mt-4 text-lg text-white/60 max-w-2xl mx-auto"
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
