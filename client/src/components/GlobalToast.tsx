/**
 * Global Toast Component - Casa Blanca
 * Design: Warm Luxury - Elegant notification
 * Uses Zustand store for state management
 * Renders directly in React tree (no portal needed since it's in App.tsx)
 * 
 * REFACTORED: All customizable styles injected via inline styles from toast_style.
 * Falls back to CSS custom properties when no custom color is set.
 */

import { useEffect, useRef } from 'react';
import { Check, X } from 'lucide-react';
import { useToast, useSiteData } from '@/store/useStore';

export default function GlobalToast() {
  const { isVisible, title, description, hideToast } = useToast();
  const { data } = useSiteData();
  const containerRef = useRef<HTMLDivElement>(null);

  // Toast style from Design System
  const ts = data?.toast_style;

  // Debug log
  useEffect(() => {
    console.log('[GlobalToast] isVisible changed:', isVisible, 'title:', title);
  }, [isVisible, title]);

  return (
    <div
      ref={containerRef}
      role="alert"
      aria-live="assertive"
      style={{
        position: 'fixed',
        top: isVisible ? '20px' : '-120px',
        left: '50%',
        transform: 'translateX(-50%)',
        opacity: isVisible ? 1 : 0,
        zIndex: 999999,
        width: '90%',
        maxWidth: '400px',
        pointerEvents: isVisible ? 'auto' : 'none',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Toast Container — ISOLATED: bgColor, borderColor */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 20px',
          borderRadius: '16px',
          background: ts?.bgColor || 'linear-gradient(135deg, var(--lp-surface) 0%, var(--lp-surface-hover) 100%)',
          border: `1px solid ${ts?.borderColor || 'var(--lp-success, var(--lp-accent-border))'}`,
          boxShadow: '0 20px 60px var(--lp-overlay), 0 0 20px var(--lp-success-soft, var(--lp-accent-soft))',
          cursor: 'pointer',
        }}
        onClick={hideToast}
      >
        {/* Success Icon — ISOLATED: iconBgColor, iconCheckColor */}
        <div 
          style={{
            flexShrink: 0,
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: ts?.iconBgColor || 'var(--lp-success-soft)',
          }}
        >
          <Check style={{ width: '22px', height: '22px', color: ts?.iconCheckColor || 'var(--lp-success)' }} />
        </div>

        {/* Content — ISOLATED: titleColor, subtitleColor */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ 
            color: ts?.titleColor || 'var(--lp-text)', 
            fontWeight: 600, 
            fontSize: '16px',
            margin: 0,
            lineHeight: 1.4,
          }}>
            {title || 'Notificação'}
          </p>
          <p style={{ 
            color: ts?.subtitleColor || 'var(--lp-text-muted)', 
            fontSize: '14px',
            margin: '4px 0 0 0',
            lineHeight: 1.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {description || ''}
          </p>
        </div>

        {/* Close Button — ISOLATED: closeButtonColor */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            hideToast();
          }}
          style={{
            padding: '6px',
            borderRadius: '50%',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <X style={{ width: '18px', height: '18px', color: ts?.closeButtonColor || 'var(--lp-text-subtle)' }} />
        </button>
      </div>
    </div>
  );
}
