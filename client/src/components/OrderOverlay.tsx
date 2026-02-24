/**
 * Order Overlay - Casa Blanca (App-Mode)
 * Design: Warm Luxury - Full-screen overlay like Zé Delivery
 * Features: Search, category pills, product grid, floating cart bar
 * Consumes menu_style from SiteData for Design System customization
 */

import { useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSiteData, useUI, useCart } from '@/store/useStore';
import ProductCard from './ProductCard';

export default function OrderOverlay() {
  const { data } = useSiteData();
  const { 
    isOrderOverlayOpen, 
    closeOrderOverlay, 
    selectedCategory, 
    setSelectedCategory,
    searchQuery,
    setSearchQuery 
  } = useUI();
  const { getTotalItems, getTotalPrice } = useCart();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const ms = data?.menu_style;

  // Lock body scroll when overlay is open
  useEffect(() => {
    if (isOrderOverlayOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOrderOverlayOpen]);

  // Scroll to selected category pill
  useEffect(() => {
    if (selectedCategory && categoryScrollRef.current) {
      const pill = categoryScrollRef.current.querySelector(`[data-category="${selectedCategory}"]`);
      if (pill) {
        pill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [selectedCategory]);

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    if (!data) return [];

    let products = data.catalog.flatMap((cat) =>
      cat.products.map((p) => ({ ...p, categoryId: cat.id, categoryName: cat.category_name }))
    );

    // Filter by category
    if (selectedCategory) {
      products = products.filter((p) => p.categoryId === selectedCategory);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.categoryName.toLowerCase().includes(query)
      );
    }

    return products;
  }, [data, selectedCategory, searchQuery]);

  // Group products by category for display
  const groupedProducts = useMemo(() => {
    if (!data) return [];

    if (selectedCategory || searchQuery.trim()) {
      return [{ id: 'results', name: 'Resultados', products: filteredProducts }];
    }

    return data.catalog
      .filter((cat) => cat.products.length > 0)
      .map((cat) => ({
        id: cat.id,
        name: cat.category_name,
        products: cat.products,
      }));
  }, [data, selectedCategory, searchQuery, filteredProducts]);

  // Card style from menu_style (passed to ProductCard)
  const cardStyle = useMemo(() => {
    if (!ms) return undefined;
    return {
      bgColor: ms.cardBgColor,
      nameColor: ms.cardNameColor,
      priceColor: ms.cardPriceColor,
      descColor: ms.cardDescColor,
      borderRadius: ms.cardBorderRadius,
      borderColor: ms.cardBorderColor,
      borderWidth: ms.cardBorderWidth,
      font: ms.cardFont,
      fontSize: ms.cardFontSize,
      fontWeight: ms.cardFontWeight,
      hoverBgColor: ms.cardHoverBgColor,
    };
  }, [ms]);

  if (!data) return null;

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  // Overlay background with customizable opacity
  const overlayBg = ms?.panelBgColor || undefined;
  const headerTextColor = ms?.headerTextColor || undefined;

  return (
    <AnimatePresence>
      {isOrderOverlayOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 bg-background"
          style={overlayBg ? { backgroundColor: overlayBg } : undefined}
        >
          {/* Header */}
          <div
            className="sticky top-0 z-10 bg-background border-b border-border/50"
            style={overlayBg ? { backgroundColor: overlayBg } : undefined}
          >
            <div className="container py-4">
              {/* Top Row */}
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={closeOrderOverlay}
                  className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
                  style={headerTextColor ? { color: headerTextColor } : undefined}
                >
                  <X className="w-6 h-6" />
                </button>
                
                <h1
                  className="font-display text-xl text-foreground flex-1"
                  style={headerTextColor ? { color: headerTextColor } : undefined}
                >
                  {ms?.menuSectionTitle || 'Cardápio'}
                </h1>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
                  style={ms?.searchIconColor ? { color: ms.searchIconColor } : undefined}
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    'w-full pl-12 pr-4 py-3 rounded-xl',
                    'bg-muted/50 border border-border/50',
                    'text-foreground placeholder:text-muted-foreground',
                    'focus:outline-none focus:border-lp-highlight/50 focus:ring-1 focus:ring-lp-highlight/20',
                    'transition-all'
                  )}
                  style={{
                    ...(ms?.searchBgColor ? { backgroundColor: ms.searchBgColor } : {}),
                    ...(ms?.searchBorderColor ? { borderColor: ms.searchBorderColor } : {}),
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div
                ref={categoryScrollRef}
                className="flex gap-2 mt-4 overflow-x-auto hide-scrollbar -mx-4 px-4"
              >
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={cn(
                    'pill flex-shrink-0',
                    !selectedCategory
                      ? 'bg-lp-highlight text-lp-highlight-fg'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  )}
                  style={
                    !selectedCategory
                      ? {
                          ...(ms?.filterActiveBgColor ? { backgroundColor: ms.filterActiveBgColor } : {}),
                          ...(ms?.filterActiveTextColor ? { color: ms.filterActiveTextColor } : {}),
                        }
                      : {
                          ...(ms?.filterInactiveBgColor ? { backgroundColor: ms.filterInactiveBgColor } : {}),
                          ...(ms?.filterInactiveTextColor ? { color: ms.filterInactiveTextColor } : {}),
                        }
                  }
                >
                  Todos
                </button>
                {data.catalog.map((cat) => (
                  <button
                    key={cat.id}
                    data-category={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      'pill flex-shrink-0',
                      selectedCategory === cat.id
                        ? 'bg-lp-highlight text-lp-highlight-fg'
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                    )}
                    style={
                      selectedCategory === cat.id
                        ? {
                            ...(ms?.filterActiveBgColor ? { backgroundColor: ms.filterActiveBgColor } : {}),
                            ...(ms?.filterActiveTextColor ? { color: ms.filterActiveTextColor } : {}),
                          }
                        : {
                            ...(ms?.filterInactiveBgColor ? { backgroundColor: ms.filterInactiveBgColor } : {}),
                            ...(ms?.filterInactiveTextColor ? { color: ms.filterInactiveTextColor } : {}),
                          }
                    }
                  >
                    {cat.category_name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="container py-6 pb-32 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
            {filteredProducts.length === 0 ? (
              /* Empty State */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="p-6 rounded-full bg-muted/30 mb-6">
                  <Package className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="font-display text-xl text-foreground mb-2">
                  Ops! Nenhum produto encontrado
                </h3>
                <p className="text-muted-foreground max-w-sm">
                  Não conseguimos encontrar "{searchQuery}". Que tal explorar outras categorias?
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory(null);
                  }}
                  className="mt-6 px-6 py-2 rounded-full bg-lp-btn text-lp-btn-fg font-medium"
                >
                  Ver todos os produtos
                </button>
              </motion.div>
            ) : (
              /* Products by Category */
              <div className="space-y-10">
                {groupedProducts.map((group) => (
                  <div key={group.id}>
                    {/* Category Header */}
                    {!searchQuery.trim() && !selectedCategory && (
                      <h2
                        className="font-display text-2xl text-foreground mb-6"
                        style={headerTextColor ? { color: headerTextColor } : undefined}
                      >
                        {group.name}
                      </h2>
                    )}

                    {/* Products Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {group.products.map((product, index) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          index={index}
                          variant="grid"
                          cardStyle={cardStyle}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Floating Cart Bar */}
          <AnimatePresence>
            {totalItems > 0 && (
              <FloatingCartBar totalItems={totalItems} totalPrice={totalPrice} />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface FloatingCartBarProps {
  totalItems: number;
  totalPrice: number;
}

function FloatingCartBar({ totalItems, totalPrice }: FloatingCartBarProps) {
  const { openProductSheet } = useUI();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const handleViewCart = () => {
    const event = new CustomEvent('openCart');
    window.dispatchEvent(event);
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-background via-background to-transparent"
    >
      <button
        onClick={handleViewCart}
        className={cn(
          'w-full max-w-lg mx-auto flex items-center justify-between',
          'px-6 py-4 rounded-2xl',
          'bg-lp-btn text-lp-btn-fg',
          'gold-glow hover:scale-[1.02] active:scale-[0.98] transition-transform'
        )}
      >
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-foreground/20 text-sm font-bold">
            {totalItems}
          </span>
          <span className="font-semibold">Ver Sacola</span>
        </div>
        <span className="font-bold text-lg">{formatPrice(totalPrice)}</span>
      </button>
    </motion.div>
  );
}
