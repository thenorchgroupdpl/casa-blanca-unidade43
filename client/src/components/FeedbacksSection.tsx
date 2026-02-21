/**
 * Feedbacks Section - Casa Blanca
 * Design: Warm Luxury - Google-style review cards
 * Features: Star ratings, verified badge, photo gallery, carousel navigation
 * Supports feedbacks_style overrides from Design System
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, BadgeCheck, X } from 'lucide-react';
import { cn, formatRelativeDate } from '@/lib/utils';
import { useSiteData } from '@/store/useStore';
import type { Feedback, FeedbacksStyleOverrides } from '@/types';

interface FeedbackCardProps {
  feedback: Feedback;
  onPhotoClick: (photos: string[], index: number) => void;
  style?: FeedbacksStyleOverrides;
}

function FeedbackCard({ feedback, onPhotoClick, style }: FeedbackCardProps) {
  const cardStyle: React.CSSProperties = {
    ...(style?.cardBgColor ? { backgroundColor: style.cardBgColor } : {}),
  };

  return (
    <div
      className="flex-shrink-0 w-[320px] sm:w-[360px] p-6 bg-lp-surface rounded-2xl border border-lp-border"
      style={cardStyle}
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        {feedback.author_photo ? (
          <img
            src={feedback.author_photo}
            alt={feedback.author_name}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-lp-highlight-soft flex items-center justify-center flex-shrink-0">
            <span className="text-lp-highlight font-semibold text-lg">
              {feedback.author_name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4
              className="font-medium text-lp-text truncate"
              style={style?.cardNameColor ? { color: style.cardNameColor } : undefined}
            >
              {feedback.author_name}
            </h4>
            {feedback.verified && (
              <BadgeCheck className="w-4 h-4 text-lp-highlight flex-shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            {/* Stars */}
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    'w-4 h-4',
                    star <= feedback.rating
                      ? 'fill-lp-star text-lp-star'
                      : 'fill-lp-surface-soft text-lp-text-subtle'
                  )}
                  style={
                    star <= feedback.rating && style?.starColor
                      ? { fill: style.starColor, color: style.starColor }
                      : undefined
                  }
                />
              ))}
            </div>
            <span
              className="text-xs text-lp-text-muted"
              style={style?.cardDateColor ? { color: style.cardDateColor } : undefined}
            >
              {formatRelativeDate(feedback.date)}
            </span>
          </div>
        </div>
      </div>

      {/* Review Text */}
      <p
        className="mt-4 text-sm text-lp-text-muted line-clamp-4"
        style={style?.cardTextColor ? { color: style.cardTextColor } : undefined}
      >
        {feedback.text}
      </p>

      {/* Photos */}
      {feedback.photos.length > 0 && (
        <div className="mt-4 flex gap-2">
          {feedback.photos.slice(0, 3).map((photo, idx) => (
            <button
              key={idx}
              onClick={() => onPhotoClick(feedback.photos, idx)}
              className="relative w-16 h-16 rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
            >
              <img
                src={photo}
                alt={`Foto ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              {idx === 2 && feedback.photos.length > 3 && (
                <div className="absolute inset-0 bg-lp-overlay flex items-center justify-center">
                  <span className="text-lp-text text-sm font-medium">
                    +{feedback.photos.length - 3}
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface LightboxProps {
  photos: string[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

function Lightbox({ photos, currentIndex, onClose, onNavigate }: LightboxProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-lp-overlay/95 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-lp-text-muted hover:text-lp-text transition-colors"
      >
        <X className="w-8 h-8" />
      </button>

      {/* Navigation */}
      {photos.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate('prev');
            }}
            className="absolute left-4 p-3 rounded-full bg-lp-border text-lp-text hover:bg-lp-border-strong transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate('next');
            }}
            className="absolute right-4 p-3 rounded-full bg-lp-border text-lp-text hover:bg-lp-border-strong transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Image */}
      <motion.img
        key={currentIndex}
        src={photos[currentIndex]}
        alt={`Foto ${currentIndex + 1}`}
        className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
      />

      {/* Counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-lp-border text-lp-text text-sm">
        {currentIndex + 1} / {photos.length}
      </div>
    </motion.div>
  );
}

export default function FeedbacksSection() {
  const { data } = useSiteData();
  const [lightboxState, setLightboxState] = useState<{
    photos: string[];
    currentIndex: number;
  } | null>(null);

  // Memoize style to prevent unnecessary re-renders
  const style = useMemo(() => data?.feedbacks_style || {}, [data?.feedbacks_style]);

  if (!data) return null;

  const { feedbacks } = data;

  const openLightbox = (photos: string[], index: number) => {
    setLightboxState({ photos, currentIndex: index });
  };

  const closeLightbox = () => {
    setLightboxState(null);
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (!lightboxState) return;
    const { photos, currentIndex } = lightboxState;
    const newIndex =
      direction === 'prev'
        ? (currentIndex - 1 + photos.length) % photos.length
        : (currentIndex + 1) % photos.length;
    setLightboxState({ ...lightboxState, currentIndex: newIndex });
  };

  // Calculate average rating
  const avgRating = feedbacks.length > 0
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
    : '0.0';

  // Build section background style
  const sectionBgStyle: React.CSSProperties = {};
  if (style.bgColor) {
    sectionBgStyle.backgroundColor = style.bgColor;
  }
  if (style.bgMediaUrl) {
    sectionBgStyle.backgroundImage = `url(${style.bgMediaUrl})`;
    sectionBgStyle.backgroundSize = 'cover';
    sectionBgStyle.backgroundPosition = 'center';
    sectionBgStyle.width = '100%';
  }

  // Label text and style
  const labelText = style.label || 'Avaliações';
  const labelStyle: React.CSSProperties = {
    ...(style.labelFont && style.labelFont !== 'inherit' ? { fontFamily: style.labelFont } : {}),
    ...(style.labelFontSize ? { fontSize: `${style.labelFontSize}px` } : {}),
    ...(style.labelFontWeight ? { fontWeight: style.labelFontWeight } : {}),
    ...(style.labelColor ? { color: style.labelColor } : {}),
  };

  // Headline text and style
  const headlineText = style.headline || 'O que dizem nossos clientes';
  const headlineStyle: React.CSSProperties = {
    ...(style.headlineFont && style.headlineFont !== 'inherit' ? { fontFamily: style.headlineFont } : {}),
    ...(style.headlineFontSize ? { fontSize: `${style.headlineFontSize}px` } : {}),
    ...(style.headlineFontWeight ? { fontWeight: style.headlineFontWeight } : {}),
    ...(style.headlineColor ? { color: style.headlineColor } : {}),
  };

  // CTA button style
  const ctaBtnStyle: React.CSSProperties = {
    ...(style.ctaBgColor ? { backgroundColor: style.ctaBgColor } : {}),
    ...(style.ctaTextColor ? { color: style.ctaTextColor } : {}),
    ...(style.ctaFont && style.ctaFont !== 'inherit' ? { fontFamily: style.ctaFont } : {}),
    ...(style.ctaFontSize ? { fontSize: `${style.ctaFontSize}px` } : {}),
    ...(style.ctaFontWeight ? { fontWeight: style.ctaFontWeight } : {}),
  };

  return (
    <section id="feedbacks" className="py-20 bg-lp-surface-soft relative" style={sectionBgStyle}>
      {/* Background overlay */}
      {style.bgMediaUrl && (style.bgOverlayOpacity ?? 0) > 0 && (
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundColor: style.bgOverlayColor || '#000000',
            opacity: (style.bgOverlayOpacity || 0) / 100,
          }}
        />
      )}

      <div className="relative z-10">
        <div className="container mb-8">
          {/* Header */}
          <motion.div
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <p
                className="text-lp-highlight text-sm font-medium tracking-wider uppercase mb-3"
                style={labelStyle}
              >
                {labelText}
              </p>
              <h2
                className="font-display text-3xl md:text-4xl text-lp-text"
                style={headlineStyle}
              >
                {headlineText}
              </h2>
            </div>

            {/* Rating Summary */}
            <div className="flex items-center gap-3 px-5 py-3 bg-lp-surface rounded-xl border border-lp-border">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="w-5 h-5 fill-lp-star text-lp-star"
                    style={style.starColor ? { fill: style.starColor, color: style.starColor } : undefined}
                  />
                ))}
              </div>
              <span
                className="text-2xl font-bold text-lp-text"
                style={style.ratingNumberColor ? { color: style.ratingNumberColor } : undefined}
              >
                {avgRating}
              </span>
              <span
                className="text-sm text-lp-text-muted"
                style={style.ratingTotalColor ? { color: style.ratingTotalColor } : undefined}
              >
                ({feedbacks.length} avaliações)
              </span>
            </div>
          </motion.div>
        </div>

        {/* Carousel */}
        <motion.div
          className="flex gap-4 overflow-x-auto hide-scrollbar px-4 md:px-8 lg:px-[calc((100vw-1280px)/2+2rem)] pb-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {feedbacks.map((feedback, index) => (
            <motion.div
              key={feedback.id}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <FeedbackCard feedback={feedback} onPhotoClick={openLightbox} style={style} />
            </motion.div>
          ))}
        </motion.div>

        {/* Google Badge / CTA */}
        <motion.div
          className="container mt-8 flex justify-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-lp-text-faint border border-lp-border cursor-pointer hover:opacity-80 transition-opacity"
            style={ctaBtnStyle}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-sm text-lp-text-muted" style={ctaBtnStyle.color ? { color: ctaBtnStyle.color } : undefined}>
              Avaliações do Google
            </span>
          </div>
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxState && (
          <Lightbox
            photos={lightboxState.photos}
            currentIndex={lightboxState.currentIndex}
            onClose={closeLightbox}
            onNavigate={navigateLightbox}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
