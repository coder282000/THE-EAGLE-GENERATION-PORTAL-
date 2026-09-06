// app/shop/[id]/not-found.tsx
import Link from 'next/link';
import { Button } from '@/components/button';

export default function ProductNotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="text-6xl mb-4">🔍</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
      <p className="text-gray-600 mb-6">
        The product you're looking for doesn't exist or has been removed.
      </p>
      <Link href="/shop">
        <Button variant="primary">Browse Shop</Button>
      </Link>
    </div>
  );
}