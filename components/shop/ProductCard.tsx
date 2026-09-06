// components/shop/ProductCard.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/components/mock/data';
import { Button } from '@/components/button';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const { id, name, description, price, category, image, inStock } = product;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if inside a link
    addItem(product, 1);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col">
      <Link href={`/shop/${id}`} className="block relative aspect-square bg-gray-100">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-4xl">📦</span>
          </div>
        )}
        {!inStock && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
            Out of Stock
          </div>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <Link href={`/shop/${id}`} className="block">
          <h3 className="text-base font-semibold text-gray-900 line-clamp-2 hover:text-blue-600">
            {name}
          </h3>
        </Link>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2 flex-1">{description}</p>

        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold text-gray-900">
            {formatCurrency(price, 'KES')}
          </span>
          <span className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-0.5 rounded-full">
            {category}
          </span>
        </div>

        <Button
          variant="primary"
          size="sm"
          className="mt-3 w-full"
          disabled={!inStock}
          onClick={handleAddToCart}
        >
          {inStock ? 'Add to Cart' : 'Unavailable'}
        </Button>
      </div>
    </div>
  );
};
