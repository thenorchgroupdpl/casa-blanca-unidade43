/**
 * Header Component - Casa Blanca
 * Design: Warm Luxury - Glassmorphism sticky header
 * Features: Logo, WhatsApp CTA button, blur effect on scroll
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUI, useSiteData } from '@/store/useStore';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { openWhatsAppModal } = useUI();
  const { data } = useSiteData();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Início', href: '#hero' },
    { label: 'Cardápio', href: '#vitrine' },
    { label: 'Sobre', href: '#sobre' },
    { label: 'Avaliações', href: '#feedbacks' },
    { label: 'Contato', href: '#contato' },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'glass border-b border-white/5 py-3'
          : 'bg-transparent py-4'
      )}
    >
      <div className="container flex items-center justify-between">
        {/* Logo */}
        <motion.a
          href="#hero"
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="font-display text-2xl md:text-3xl text-white">
            Casa <span className="text-primary">Blanca</span>
          </span>
        </motion.a>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item, index) => (
            <motion.a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-white/70 hover:text-primary transition-colors"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              {item.label}
            </motion.a>
          ))}
        </nav>

        {/* CTA Button */}
        <div className="flex items-center gap-3">
          <motion.button
            onClick={openWhatsAppModal}
            className={cn(
              'hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full',
              'bg-primary text-primary-foreground font-medium text-sm',
              'hover:bg-primary/90 transition-all duration-200',
              'gold-glow-sm hover:gold-glow'
            )}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Mandar Mensagem</span>
          </motion.button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-white/80 hover:text-white transition-colors"
            aria-label="Menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden glass-dark border-t border-white/5 mt-3"
          >
            <nav className="container py-4 flex flex-col gap-1">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-3 px-4 text-white/80 hover:text-primary hover:bg-white/5 rounded-lg transition-colors"
                >
                  {item.label}
                </a>
              ))}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openWhatsAppModal();
                }}
                className="mt-2 flex items-center justify-center gap-2 py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium"
              >
                <MessageCircle className="w-4 h-4" />
                Mandar Mensagem
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
