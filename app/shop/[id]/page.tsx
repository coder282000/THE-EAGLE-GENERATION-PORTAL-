'use client';
export const dynamic = 'force-dynamic';

// app/shop/[id]/page.tsx
import React, { useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { mockProducts } from '@/components/mock/data';
import { Button } from '@/components/button';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const { addItem } = useCart();

  const product = mockProducts.find((p) => p.id === productId);

  if (!product) {
    notFound();
  }

  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const increment = () => setQuantity((q) => q + 1);
  const decrement = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  const handleAddToCart = async () => {
    setIsAdding(true);
    // Simulate a small delay for UI feedback
    await new Promise((resolve) => setTimeout(resolve, 600));
    addItem(product, quantity);
    setIsAdding(false);
    setShowSuccess(true);
    
    // Reset success state after 2 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/shop" className="hover:text-blue-600">
          Shop
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{product.name}</span>
      </nav>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Product Image */}
        <div className="md:w-1/2">
          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-6xl">
                📦
              </div>
            )}
            {!product.inStock && (
              <div className="absolute top-4 right-4 bg-red-500 text-white text-sm font-medium px-3 py-1 rounded-full">
                Out of Stock
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="md:w-1/2 flex flex-col">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {product.name}
          </h1>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl font-bold text-gray-900">
              {formatCurrency(product.price, 'KES')}
            </span>
            <span className="text-sm text-gray-500 capitalize bg-gray-100 px-2 py-0.5 rounded-full">
              {product.category}
            </span>
            <span className="text-sm text-gray-500">
              SKU: {product.sku}
            </span>
          </div>

          <p className="text-gray-700 mb-6 leading-relaxed">
            {product.description}
          </p>

          {/* Stock Status */}
          <div className="mb-6">
            {product.inStock ? (
              <span className="text-green-600 text-sm font-medium">✅ In Stock</span>
            ) : (
              <span className="text-red-600 text-sm font-medium">❌ Out of Stock</span>
            )}
          </div>

          {/* Quantity Selector */}
          {product.inStock && (
            <div className="flex items-center gap-4 mb-6">
              <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                Quantity
              </label>
              <div className="flex items-center border border-gray-300 rounded-md">
                <button
                  onClick={decrement}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="w-10 text-center text-gray-700">{quantity}</span>
                <button
                  onClick={increment}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Add to Cart Button with Success State */}
          <Button
            variant="primary"
            size="lg"
            className="w-full md:w-auto transition-all duration-200"
            disabled={!product.inStock || isAdding}
            onClick={handleAddToCart}
          >
            {isAdding ? (
              'Adding...'
            ) : showSuccess ? (
              '✅ Added!'
            ) : product.inStock ? (
              'Add to Cart'
            ) : (
              'Unavailable'
            )}
          </Button>

          {/* Success message */}
          {showSuccess && (
            <p className="text-sm text-green-600 mt-2 animate-fade-in">
              {quantity} × {product.name} added to cart
            </p>
          )}

          {/* Back to Shop */}
          <Link
            href="/shop"
            className="mt-6 text-sm text-blue-600 hover:underline inline-block"
          >
            ← Back to Shop
          </Link>
        </div>
      </div>
    </div>
  );
}