import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product, SiteData } from '@/types';

// Site Data Store
interface SiteDataState {
  data: SiteData | null;
  isLoading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
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
}));

// Cart Store with persistence
interface CartState {
  items: CartItem[];
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
      items: [],
      
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
    }
  )
);

// UI State Store
interface UIState {
  isOrderOverlayOpen: boolean;
  selectedCategory: string | null;
  searchQuery: string;
  selectedProduct: Product | null;
  isBottomSheetOpen: boolean;
  isWhatsAppModalOpen: boolean;
  isScheduleModalOpen: boolean;
  
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
}

export const useUI = create<UIState>((set) => ({
  isOrderOverlayOpen: false,
  selectedCategory: null,
  searchQuery: '',
  selectedProduct: null,
  isBottomSheetOpen: false,
  isWhatsAppModalOpen: false,
  isScheduleModalOpen: false,
  
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
}));
