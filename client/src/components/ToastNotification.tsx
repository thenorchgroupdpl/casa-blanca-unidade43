/**
 * Toast Notification Component - Casa Blanca
 * Design: Warm Luxury - Elegant notification box
 * Renders directly in the component tree
 */

import { Check, X } from 'lucide-react';
import { useToast } from '@/store/useStore';

export default function ToastNotification() {
  const { isVisible, title, description, hideToast } = useToast();

  console.log('[ToastNotification] Rendering, isVisible:', isVisible);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="fixed top-5 left-1/2 z-[999999] w-[90%] max-w-[400px] pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-300"
      style={{
        transform: 'translateX(-50%)',
      }}
    >
      <div 
        className="flex items-center gap-3 px-5 py-4 rounded-2xl cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          border: '1px solid rgba(212, 175, 55, 0.4)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 20px rgba(212, 175, 55, 0.2)',
        }}
        onClick={hideToast}
      >
        {/* Success Icon */}
        <div 
          className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'rgba(212, 175, 55, 0.2)' }}
        >
          <Check className="w-5 h-5 text-[#D4AF37]" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-base m-0 leading-tight">
            {title}
          </p>
          <p className="text-gray-400 text-sm mt-1 truncate">
            {description}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            hideToast();
          }}
          className="p-1.5 rounded-full hover:bg-white/10 transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </div>
  );
}
