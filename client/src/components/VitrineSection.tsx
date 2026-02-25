/**
 * Vitrine Section - Casa Blanca
 * Design: Warm Luxury - Horizontal product carousel
 * Features: Category highlights, "Ver Todas" button, smooth scroll
 * Includes Intro header (headline/subheadline) inside the same section
 * to avoid background break between intro and product carousel.
 */

import { useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSiteData, useUI } from '@/store/useStore';
import ProductCard from './ProductCard';
import type { Category, IntroContent } from '@/types';

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

interface CategoryCarouselProps {
  category: Category;
  index: number;
  intro: IntroContent;
}

function CategoryCarousel({ category, index, intro }: CategoryCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { openOrderOverlay, setSelectedCategory } = useUI();

  // View All button style — hook called unconditionally
  const viewAllStyle = useMemo(() => {
    const style: React.CSSProperties = {};
    if (intro.view_all_bg_color) style.backgroundColor = intro.view_all_bg_color;
    if (intro.view_all_text_color) style.color = intro.view_all_text_color;
    if (intro.view_all_font && intro.view_all_font !== 'inherit') style.fontFamily = `'${intro.view_all_font}', sans-serif`;
    if (intro.view_all_font_size) style.fontSize = `${intro.view_all_font_size}px`;
    if (intro.view_all_font_weight) style.fontWeight = intro.view_all_font_weight;
    if (intro.view_all_bg_color) style.borderColor = intro.view_all_bg_color;
    return style;
  }, [intro.view_all_bg_color, intro.view_all_text_color, intro.view_all_font, intro.view_all_font_size, intro.view_all_font_weight]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 240;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleViewAll = () => {
    setSelectedCategory(category.id);
    openOrderOverlay();
  };

  return (
    <motion.div
      className="mb-12 last:mb-0"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
    >
      {/* Category Header */}
      <div className="container flex items-center justify-between mb-6">
        <h3 className="font-display text-2xl md:text-3xl text-lp-text">
          {category.category_name}
        </h3>
        
        <div className="flex items-center gap-2">
          {/* Scroll Buttons - Desktop */}
          <div className="hidden md:flex items-center gap-2 mr-4">
            <button
              onClick={() => scroll('left')}
              className="p-2 rounded-full bg-lp-text-faint hover:bg-lp-border text-lp-text-muted hover:text-lp-text transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 rounded-full bg-lp-text-faint hover:bg-lp-border text-lp-text-muted hover:text-lp-text transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* View All Button */}
          <button
            onClick={handleViewAll}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full',
              'text-sm font-medium text-lp-highlight',
              'border border-lp-highlight-border hover:border-lp-highlight hover:bg-lp-highlight-subtle',
              'transition-all duration-200'
            )}
            style={viewAllStyle}
          >
            <span>{intro.view_all_label || 'Ver Todas'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Products Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto hide-scrollbar px-4 md:px-8 lg:px-[calc((100vw-1280px)/2+2rem)]"
      >
        {category.products.slice(0, 8).map((product, idx) => (
          <ProductCard
            key={product.id}
            product={product}
            index={idx}
            variant="showcase"
            cardStyle={{
              bgColor: intro.card_bg_color,
              nameColor: intro.card_name_color,
              priceColor: intro.card_price_color,
              descColor: intro.card_desc_color,
              borderRadius: intro.card_border_radius,
              borderColor: intro.card_border_color,
              borderWidth: intro.card_border_width,
              buttonText: intro.card_button_text,
              buttonBgColor: intro.card_button_bg_color,
              buttonTextColor: intro.card_button_text_color,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

export default function VitrineSection() {
  const { data } = useSiteData();
  const { openOrderOverlay } = useUI();

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

  const ctaStyle = useMemo(() => {
    if (!intro) return {};
    const style: React.CSSProperties = {};
    if (intro.cta_bg_color) {
      if (intro.cta_gradient && intro.cta_gradient_end) {
        style.background = `linear-gradient(135deg, ${intro.cta_bg_color}, ${intro.cta_gradient_end})`;
      } else {
        style.backgroundColor = intro.cta_bg_color;
      }
      style.borderColor = intro.cta_bg_color;
    }
    if (intro.cta_text_color) style.color = intro.cta_text_color;
    if (intro.cta_font && intro.cta_font !== 'inherit') style.fontFamily = `'${intro.cta_font}', sans-serif`;
    if (intro.cta_font_size) style.fontSize = `${intro.cta_font_size}px`;
    if (intro.cta_font_weight) style.fontWeight = intro.cta_font_weight;
    return style;
  }, [intro?.cta_bg_color, intro?.cta_text_color, intro?.cta_gradient, intro?.cta_gradient_end, intro?.cta_font, intro?.cta_font_size, intro?.cta_font_weight]);

  // Strict auto-hide: only show categories that are highlighted AND have at least one available product
  // This prevents rendering empty sections (inactive category or all products paused)
  const highlightedCategories = useMemo(() => {
    if (!data) return [];
    return data.catalog
      .filter((cat) => cat.highlight_on_home)
      .map((cat) => ({
        ...cat,
        products: cat.products.filter((p) => p.available),
      }))
      .filter((cat) => cat.products.length > 0);
  }, [data?.catalog]);

  // Early returns AFTER all hooks
  if (!data || !intro) return null;

  const hasBgMedia = !!intro.bg_media_url;

  const handleCtaClick = () => {
    if (intro.cta_action) {
      if (intro.cta_action.startsWith('#')) {
        const el = document.querySelector(intro.cta_action);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else if (intro.cta_action.startsWith('http')) {
        window.open(intro.cta_action, '_blank');
      }
    } else {
      openOrderOverlay();
    }
  };

  return (
    <section
      id="vitrine"
      className="relative bg-lp-bg section-divider pt-16 pb-16"
      style={sectionStyle}
    >
      {/* Background media (shared across intro header + product carousel) */}
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

      <div className="relative z-10">
        {/* Decorative top border */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-lp-highlight-soft rounded-full" />

        {/* Intro Header (headline + subheadline) — merged into this section */}
        <div className="container text-center pb-8">
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

        {/* Product Carousels */}
        {highlightedCategories.length > 0 && (
          <>
            {highlightedCategories.map((category, index) => (
              <CategoryCarousel key={category.id} category={category} index={index} intro={intro} />
            ))}

            {/* Full Menu CTA */}
            <motion.div
              className="container mt-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <button
                onClick={handleCtaClick}
                className={cn(
                  'inline-flex items-center gap-3 px-8 py-4 rounded-full',
                  'bg-lp-text-faint border border-lp-border text-lp-text',
                  'hover:bg-lp-border hover:border-lp-highlight-border transition-all duration-300',
                  'font-medium'
                )}
                style={ctaStyle}
              >
                <span>{intro.cta_text || 'Ver Cardápio Completo'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}
