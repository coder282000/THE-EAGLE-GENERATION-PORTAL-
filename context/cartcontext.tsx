// context/CartContext.tsx
'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Product } from '@/components/mock/data';

// Cart item extends product with quantity and selected variant
export interface CartItem extends Product {
  quantity: number;
  variant?: string; // for future use (size, color, etc.)
}

// Cart state
interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number; // in minor units
}

// Cart actions
type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity: number; variant?: string } }
  | { type: 'REMOVE_ITEM'; payload: { productId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartState };

// Context value
interface CartContextValue extends CartState {
  addItem: (product: Product, quantity?: number, variant?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
}

// Initial state
const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
};

// Reducer
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, quantity, variant } = action.payload;
      const existingIndex = state.items.findIndex((item) => item.id === product.id);
      let newItems;
      if (existingIndex >= 0) {
        // Update quantity
        newItems = [...state.items];
        newItems[existingIndex].quantity += quantity;
      } else {
        // Add new item
        const newItem: CartItem = { ...product, quantity, variant };
        newItems = [...state.items, newItem];
      }
      const totalItems = newItems.reduce((sum, i) => sum + i.quantity, 0);
      const totalPrice = newItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
      return { items: newItems, totalItems, totalPrice };
    }
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter((item) => item.id !== action.payload.productId);
      const totalItems = newItems.reduce((sum, i) => sum + i.quantity, 0);
      const totalPrice = newItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
      return { items: newItems, totalItems, totalPrice };
    }
    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload;
      if (quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: { productId } });
      }
      const newItems = state.items.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      );
      const totalItems = newItems.reduce((sum, i) => sum + i.quantity, 0);
      const totalPrice = newItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
      return { items: newItems, totalItems, totalPrice };
    }
    case 'CLEAR_CART':
      return initialState;
    case 'LOAD_CART':
      return action.payload;
    default:
      return state;
  }
}

// Create context
const CartContext = createContext<CartContextValue | undefined>(undefined);

// Provider component
export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('cart');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as CartState;
        dispatch({ type: 'LOAD_CART', payload: parsed });
      } catch (e) {
        console.error('Failed to parse cart from localStorage', e);
      }
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state));
  }, [state]);

  const addItem = (product: Product, quantity: number = 1, variant?: string) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, quantity, variant } });
  };

  const removeItem = (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productId } });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const isInCart = (productId: string) => {
    return state.items.some((item) => item.id === productId);
  };

  const getItemQuantity = (productId: string) => {
    const item = state.items.find((item) => item.id === productId);
    return item ? item.quantity : 0;
  };

  const value: CartContextValue = {
    ...state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Hook for using cart
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}