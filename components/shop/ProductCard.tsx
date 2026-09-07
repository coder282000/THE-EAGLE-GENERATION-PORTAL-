// components/shop/ProductCard.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/button';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { Product } from '@/components/mock/data';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if inside a link
    addItem({
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: 1,
      total: product.price,
      variant: undefined,
    });
  };

  return (
    <Link href={`/shop/${product.id}`} className="block group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
        <div className="relative aspect-square bg-gray-100">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
              📦
            </div>
          )}
          {!product.inStock && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
              Out of Stock
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-sm font-medium text-ink truncate">{product.name}</h3>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-lg font-bold text-ink">
              {formatCurrency(product.price, 'KES')}
            </span>
            <Button
              variant="primary"
              size="sm"
              className="mt-0"
              disabled={!product.inStock}
              onClick={handleAddToCart}
            >
              Add to Cart
            </Button>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs text-gray-500 capitalize">{product.category}</span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">{product.inStock ? 'In Stock' : 'Out of Stock'}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}