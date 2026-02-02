/**
 * Toast Provider Component - Casa Blanca
 * Design: Warm Luxury - Dark box with gold accent
 * Uses React Context for state management
 */

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

interface ToastContextType {
  showToast: (title: string, description: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toast, setToast] = useState<{ title: string; description: string } | null>(null);

  const showToast = useCallback((title: string, description: string) => {
    setToast({ title, description });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {createPortal(
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -100, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: -100, x: '-50%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-4 left-1/2 z-[9999] w-[90%] max-w-md"
              onClick={() => setToast(null)}
            >
              <div 
                className="flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                }}
              >
                <div 
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(212, 175, 55, 0.2)' }}
                >
                  <Check className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-base">{toast.title}</p>
                  <p className="text-gray-300 text-sm truncate">{toast.description}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </ToastContext.Provider>
  );
}
