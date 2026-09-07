// context/CartContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  variant?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

// Provide a default empty context – this avoids null/undefined errors.
const defaultContext: CartContextType = {
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalItems: 0,
  totalPrice: 0,
};

const CartContext = createContext<CartContextType>(defaultContext);

const CART_STORAGE_KEY = 'eagle_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.warn('Failed to save cart:', error);
    }
  }, [items]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId && i.variant === item.variant);
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId && i.variant === item.variant
            ? { ...i, quantity: i.quantity + item.quantity, total: (i.quantity + item.quantity) * i.price }
            : i
        );
      }
      return [...prev, item];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId ? { ...i, quantity, total: quantity * i.price } : i
      )
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.total, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

// This hook now always returns a valid context (default or provider).
// No need to check for undefined or throw.
export function useCart() {
  return useContext(CartContext);
}