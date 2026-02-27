/**
 * UpsellProvider - Manages upsell modal state for the public landing page.
 * Wraps children and provides a trigger function via context.
 * When a product is added to cart, call triggerUpsell(product) to check
 * if there are upsell products and show the modal.
 */

import { createContext, useContext, useState, useCallback, useRef } from 'react';
import UpsellModal from './UpsellModal';
import type { Product } from '@/types';

interface UpsellContextType {
  triggerUpsell: (product: Product, tenantId: number) => void;
}

const UpsellContext = createContext<UpsellContextType>({
  triggerUpsell: () => {},
});

export function useUpsell() {
  return useContext(UpsellContext);
}

interface UpsellProviderProps {
  children: React.ReactNode;
}

export default function UpsellProvider({ children }: UpsellProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [triggerProduct, setTriggerProduct] = useState<Product | null>(null);
  const [upsellProducts, setUpsellProducts] = useState<Array<{
    id: number;
    name: string;
    price: string;
    imageUrl: string | null;
    tenantId: number;
  }>>([]);
  const fetchingRef = useRef(false);

  const triggerUpsell = useCallback(async (product: Product, tenantId: number) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      // Fetch upsell products via tRPC (using fetch directly to avoid hook rules)
      const res = await fetch(`/api/trpc/upsells.getProducts?input=${encodeURIComponent(JSON.stringify({ json: { productId: parseInt(product.id) } }))}`);
      const data = await res.json();
      
      const results = data?.result?.data?.json;
      if (results && Array.isArray(results) && results.length > 0) {
        setTriggerProduct(product);
        setUpsellProducts(results);
        setIsOpen(true);
      }
    } catch (err) {
      // Silently fail - upsell is optional
      console.warn('[Upsell] Failed to fetch:', err);
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    // Delay cleanup to allow exit animation
    setTimeout(() => {
      setTriggerProduct(null);
      setUpsellProducts([]);
    }, 300);
  }, []);

  return (
    <UpsellContext.Provider value={{ triggerUpsell }}>
      {children}
      <UpsellModal
        triggerProduct={triggerProduct}
        isOpen={isOpen}
        onClose={handleClose}
        upsellProducts={upsellProducts}
      />
    </UpsellContext.Provider>
  );
}
