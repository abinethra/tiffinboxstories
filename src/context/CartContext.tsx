import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CartItem, MenuItem } from '../types/index.ts';

const CART_STORAGE_KEY = 'tiffinbox_stories_cart_v2';
export const FREE_DELIVERY_THRESHOLD = 399;
export const STANDARD_DELIVERY_FEE = 35;

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  lastAddedName: string | null;
  addItem: (item: MenuItem, quantity?: number) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  removeItem: (menuItemId: string) => void;
  clearCart: () => void;
  getItemQuantity: (menuItemId: string) => number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // Ignore invalid localStorage data
    }
    return [];
  });

  const [lastAddedName, setLastAddedName] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage quota issues
    }
  }, [items]);

  useEffect(() => {
    if (!lastAddedName) return;
    const timer = window.setTimeout(() => setLastAddedName(null), 2600);
    return () => window.clearTimeout(timer);
  }, [lastAddedName]);

  const addItem = (item: MenuItem, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((entry) => entry.item.id === item.id);
      if (existing) {
        return prev.map((entry) =>
          entry.item.id === item.id
            ? { ...entry, item, quantity: Math.min(25, entry.quantity + quantity) }
            : entry
        );
      }
      return [...prev, { item, quantity: Math.min(25, quantity) }];
    });
    setLastAddedName(item.name);
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(menuItemId);
      return;
    }
    setItems((prev) =>
      prev.map((entry) =>
        entry.item.id === menuItemId ? { ...entry, quantity: Math.min(25, quantity) } : entry
      )
    );
  };

  const removeItem = (menuItemId: string) => {
    setItems((prev) => prev.filter((entry) => entry.item.id !== menuItemId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemQuantity = (menuItemId: string) => {
    return items.find((entry) => entry.item.id === menuItemId)?.quantity || 0;
  };

  const summary = useMemo(() => {
    const totalItems = items.reduce((sum, entry) => sum + entry.quantity, 0);
    const subtotal = items.reduce((sum, entry) => sum + entry.item.price * entry.quantity, 0);
    const deliveryFee =
      subtotal === 0 ? 0 : subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE;
    const total = subtotal + deliveryFee;
    return { totalItems, subtotal, deliveryFee, total };
  }, [items]);

  const value: CartContextValue = {
    items,
    ...summary,
    lastAddedName,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
