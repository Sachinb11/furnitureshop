import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartStoreItem } from '@/types/index';

interface CartStore {
  items: CartStoreItem[];
  itemCount: number;
  subtotal: number;
  addItem: (item: Omit<CartStoreItem, 'id'> & { id?: string }) => void;
  updateQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
}

function recalc(items: CartStoreItem[]) {
  return {
    itemCount: items.reduce((s, i) => s + i.quantity, 0),
    subtotal: +items.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2),
  };
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      itemCount: 0,
      subtotal: 0,

      addItem: (item) =>
        set((s) => {
          const key = item.id ?? `${item.productId}-${item.variantId ?? ''}`;
          const existing = s.items.find((i) => i.id === key);
          const items = existing
            ? s.items.map((i) =>
                i.id === key ? { ...i, quantity: i.quantity + (item.quantity ?? 1) } : i
              )
            : [...s.items, { ...item, id: key, quantity: item.quantity ?? 1 }];
          return { items, ...recalc(items) };
        }),

      updateQty: (id, qty) =>
        set((s) => {
          const items =
            qty <= 0
              ? s.items.filter((i) => i.id !== id)
              : s.items.map((i) => (i.id === id ? { ...i, quantity: qty } : i));
          return { items, ...recalc(items) };
        }),

      removeItem: (id) =>
        set((s) => {
          const items = s.items.filter((i) => i.id !== id);
          return { items, ...recalc(items) };
        }),

      clear: () => set({ items: [], itemCount: 0, subtotal: 0 }),
    }),
    { name: 'furnishop-cart' }
  )
);
