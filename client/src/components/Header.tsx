/**
 * Header Component - Casa Blanca
 * Design: Warm Luxury - Glassmorphism sticky header
 * Features: Dynamic logo (image or text), WhatsApp CTA button, Cart icon on mobile
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUI, useSiteData, useCart } from '@/store/useStore';
import CartPopup from './CartPopup';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { openWhatsAppModal } = useUI();
  const { data } = useSiteData();
  const { items } = useCart();

  // Calcular total de itens no carrinho
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

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

  // Dynamic logo: image or text fallback
  const logoUrl = data?.logo_url;
  const logoType = data?.logo_type || 'text';
  const companyName = data?.project_name || 'Casa Blanca';

  // Split company name for highlight effect (first word normal, rest highlighted)
  const nameParts = companyName.split(' ');
  const firstName = nameParts[0] || '';
  const restName = nameParts.slice(1).join(' ');

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? 'glass border-b border-lp-border py-3'
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
            {logoType === 'image' && logoUrl ? (
              <img
                src={logoUrl}
                alt={companyName}
                className="h-8 md:h-10 w-auto object-contain"
              />
            ) : (
              <span className="font-display text-2xl md:text-3xl text-lp-text">
                {firstName}{restName ? ' ' : ''}<span className="text-lp-highlight">{restName}</span>
              </span>
            )}
          </motion.a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item, index) => (
              <motion.a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-lp-text-muted hover:text-lp-highlight transition-colors"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {item.label}
              </motion.a>
            ))}
          </nav>

          {/* CTA Button & Cart */}
          <div className="flex items-center gap-3">
            {/* Desktop WhatsApp Button */}
            <motion.button
              onClick={openWhatsAppModal}
              className={cn(
                'hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full',
                'bg-lp-btn text-lp-btn-fg font-medium text-sm',
                'hover:bg-lp-btn-hover transition-all duration-200',
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

            {/* Cart Button - Mobile & Desktop */}
            <motion.button
              onClick={() => setIsCartOpen(true)}
              className={cn(
                'relative p-2.5 rounded-full transition-all duration-200',
                'text-lp-text-muted hover:text-lp-text',
                'hover:bg-lp-border',
                'lg:hidden' // Esconde no desktop grande
              )}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Carrinho"
            >
              <ShoppingCart className="w-6 h-6" />
              
              {/* Badge com quantidade */}
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className={cn(
                      'absolute -top-0.5 -right-0.5',
                      'min-w-[20px] h-5 px-1.5',
                      'flex items-center justify-center',
                      'text-xs font-bold',
                      'rounded-full',
                      'bg-lp-success text-lp-success-fg'
                    )}
                  >
                    {totalItems > 99 ? '99+' : totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Cart Popup */}
      <CartPopup isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
