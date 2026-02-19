/**
 * Global Toast Component - Casa Blanca
 * Design: Warm Luxury - Elegant notification
 * Uses Zustand store for state management
 * Renders directly in React tree (no portal needed since it's in App.tsx)
 */

import { useEffect, useRef } from 'react';
import { Check, X } from 'lucide-react';
import { useToast } from '@/store/useStore';

export default function GlobalToast() {
  const { isVisible, title, description, hideToast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);

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
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 20px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          border: '1px solid rgba(212, 175, 55, 0.4)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 20px rgba(212, 175, 55, 0.2)',
          cursor: 'pointer',
        }}
        onClick={hideToast}
      >
        {/* Success Icon */}
        <div 
          style={{
            flexShrink: 0,
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(212, 175, 55, 0.2)',
          }}
        >
          <Check style={{ width: '22px', height: '22px', color: '#D4AF37' }} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ 
            color: '#ffffff', 
            fontWeight: 600, 
            fontSize: '16px',
            margin: 0,
            lineHeight: 1.4,
          }}>
            {title || 'Notificação'}
          </p>
          <p style={{ 
            color: '#a0a0a0', 
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

        {/* Close Button */}
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
          <X style={{ width: '18px', height: '18px', color: '#666666' }} />
        </button>
      </div>
    </div>
  );
}
