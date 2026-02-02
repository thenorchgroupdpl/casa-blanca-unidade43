/**
 * Global Toast Component - Casa Blanca
 * Design: Warm Luxury - Elegant notification box
 * Uses Zustand store for state management with createPortal
 */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, X } from 'lucide-react';
import { useToast } from '@/store/useStore';

export default function GlobalToast() {
  const { isVisible, title, description, hideToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Handle animation state
  useEffect(() => {
    if (isVisible) {
      // Small delay to trigger CSS transition
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setShow(true);
        });
      });
    } else {
      setShow(false);
    }
  }, [isVisible]);

  // Don't render on server or before mount
  if (!mounted) return null;

  // Don't render if not visible
  if (!isVisible) return null;

  const toastContent = (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: `translateX(-50%) translateY(${show ? '0' : '-100px'})`,
        opacity: show ? 1 : 0,
        zIndex: 999999,
        width: '90%',
        maxWidth: '400px',
        pointerEvents: 'auto',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
            {title}
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
            {description}
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
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <X style={{ width: '18px', height: '18px', color: '#666666' }} />
        </button>
      </div>
    </div>
  );

  // Use createPortal to render at document.body level
  return createPortal(toastContent, document.body);
}
