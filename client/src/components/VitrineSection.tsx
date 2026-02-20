/**
 * Vitrine Section - Casa Blanca
 * Design: Warm Luxury - Horizontal product carousel
 * Features: Category highlights, "Ver Todas" button, smooth scroll
 */

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSiteData, useUI } from '@/store/useStore';
import ProductCard from './ProductCard';
import type { Category } from '@/types';

interface CategoryCarouselProps {
  category: Category;
  index: number;
}

function CategoryCarousel({ category, index }: CategoryCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { openOrderOverlay, setSelectedCategory } = useUI();

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
          >
            <span>Ver Todas</span>
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
          />
        ))}
      </div>
    </motion.div>
  );
}

export default function VitrineSection() {
  const { data } = useSiteData();
  const { openOrderOverlay } = useUI();

  if (!data) return null;

  // Get categories marked for home highlight
  const highlightedCategories = data.catalog.filter(
    (cat) => cat.highlight_on_home && cat.products.length > 0
  );

  if (highlightedCategories.length === 0) return null;

  return (
    <section id="vitrine" className="py-16 bg-lp-bg">
      {highlightedCategories.map((category, index) => (
        <CategoryCarousel key={category.id} category={category} index={index} />
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
          onClick={openOrderOverlay}
          className={cn(
            'inline-flex items-center gap-3 px-8 py-4 rounded-full',
            'bg-lp-text-faint border border-lp-border text-lp-text',
            'hover:bg-lp-border hover:border-lp-highlight-border transition-all duration-300',
            'font-medium'
          )}
        >
          <span>Ver Cardápio Completo</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </motion.div>
    </section>
  );
}
