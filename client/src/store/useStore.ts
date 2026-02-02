import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product, SiteData } from '@/types';

// Site Data Store
interface SiteDataState {
  data: SiteData | null;
  isLoading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
  setData: (data: SiteData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useSiteData = create<SiteDataState>((set) => ({
  data: null,
  isLoading: true,
  error: null,
  fetchData: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch('/data.json');
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      set({ data, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  setData: (data) => set({ data, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

// Cart Store with persistence and multi-tenant support
interface CartState {
  tenantId: number | null;
  items: CartItem[];
  setTenantId: (tenantId: number) => void;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      tenantId: null,
      items: [],
      
      setTenantId: (tenantId: number) => {
        const currentTenantId = get().tenantId;
        // Clear cart if switching tenants
        if (currentTenantId !== null && currentTenantId !== tenantId) {
          set({ tenantId, items: [] });
        } else {
          set({ tenantId });
        }
      },
      
      addItem: (product: Product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product.id === product.id
          );
          
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          
          return {
            items: [...state.items, { product, quantity }],
          };
        });
      },
      
      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },
      
      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        }));
      },
      
      clearCart: () => set({ items: [] }),
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'casa-blanca-cart',
      // Custom storage key based on tenant
      partialize: (state) => ({
        tenantId: state.tenantId,
        items: state.items,
      }),
    }
  )
);

// Alias for backward compatibility
export const useCartStore = useCart;

// UI State Store
interface UIState {
  isOrderOverlayOpen: boolean;
  selectedCategory: string | null;
  searchQuery: string;
  selectedProduct: Product | null;
  isBottomSheetOpen: boolean;
  isWhatsAppModalOpen: boolean;
  isScheduleModalOpen: boolean;
  isCartDrawerOpen: boolean;
  
  openOrderOverlay: () => void;
  closeOrderOverlay: () => void;
  setSelectedCategory: (categoryId: string | null) => void;
  setSearchQuery: (query: string) => void;
  openProductSheet: (product: Product) => void;
  closeProductSheet: () => void;
  openWhatsAppModal: () => void;
  closeWhatsAppModal: () => void;
  openScheduleModal: () => void;
  closeScheduleModal: () => void;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
}

export const useUI = create<UIState>((set) => ({
  isOrderOverlayOpen: false,
  selectedCategory: null,
  searchQuery: '',
  selectedProduct: null,
  isBottomSheetOpen: false,
  isWhatsAppModalOpen: false,
  isScheduleModalOpen: false,
  isCartDrawerOpen: false,
  
  openOrderOverlay: () => set({ isOrderOverlayOpen: true }),
  closeOrderOverlay: () => set({ 
    isOrderOverlayOpen: false, 
    searchQuery: '', 
    selectedCategory: null 
  }),
  setSelectedCategory: (categoryId) => set({ selectedCategory: categoryId }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  openProductSheet: (product) => set({ selectedProduct: product, isBottomSheetOpen: true }),
  closeProductSheet: () => set({ selectedProduct: null, isBottomSheetOpen: false }),
  openWhatsAppModal: () => set({ isWhatsAppModalOpen: true }),
  closeWhatsAppModal: () => set({ isWhatsAppModalOpen: false }),
  openScheduleModal: () => set({ isScheduleModalOpen: true }),
  closeScheduleModal: () => set({ isScheduleModalOpen: false }),
  openCartDrawer: () => set({ isCartDrawerOpen: true }),
  closeCartDrawer: () => set({ isCartDrawerOpen: false }),
}));

// Alias for backward compatibility
export const useUIStore = useUI;

// Toast Store
interface ToastState {
  isVisible: boolean;
  title: string;
  description: string;
  showToast: (title: string, description: string) => void;
  hideToast: () => void;
}

export const useToast = create<ToastState>((set, get) => ({
  isVisible: false,
  title: '',
  description: '',
  showToast: (title, description) => {
    console.log('[Toast] showToast called:', { title, description });
    set({ isVisible: true, title, description });
    console.log('[Toast] State after set:', get());
    // Auto-hide after 3 seconds
    setTimeout(() => {
      console.log('[Toast] Auto-hiding toast');
      set({ isVisible: false });
    }, 3000);
  },
  hideToast: () => {
    console.log('[Toast] hideToast called');
    set({ isVisible: false });
  },
}));
