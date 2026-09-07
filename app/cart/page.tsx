// app/cart/page.tsx
'use client';
export const dynamic = 'force-dynamic';

import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/button';
import Link from 'next/link';
import { mockProducts } from '@/components/mock/data';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-ink">Your cart is empty</h2>
        <p className="text-gray-500 mt-2">Browse the shop and add items you like.</p>
        <Link href="/shop" className="inline-block mt-4 text-sky-600 hover:underline">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-ink mb-6">Shopping Cart</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <div className="divide-y divide-gray-200">
            {items.map((item) => {
              // Optional: find product to get image if needed
              const product = mockProducts.find((p) => p.id === item.productId);
              return (
                <div key={item.productId} className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden relative flex items-center justify-center text-2xl">
                    📦 {/* Placeholder instead of missing image */}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-ink">{item.productName}</h3>
                    <p className="text-sm text-gray-500">{formatCurrency(item.price, 'KES')} each</p>
                    {item.variant && <p className="text-sm text-gray-500">Variant: {item.variant}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="px-2 py-1 border rounded hover:bg-gray-100"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="px-2 py-1 border rounded hover:bg-gray-100"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(item.total, 'KES')}</p>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-sm text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={clearCart}
              className="text-sm text-red-500 hover:underline"
            >
              Clear Cart
            </button>
            <span className="text-sm text-gray-500">{totalItems} items</span>
          </div>
        </div>
        <div className="lg:w-1/3">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-lg font-semibold text-ink mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(totalPrice, 'KES')}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="border-t pt-2 font-semibold flex justify-between">
                <span>Total</span>
                <span>{formatCurrency(totalPrice, 'KES')}</span>
              </div>
            </div>
            <Link href="/checkout">
              <Button variant="primary" className="w-full mt-4">
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}