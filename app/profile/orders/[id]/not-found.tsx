// app/profile/orders/[id]/not-found.tsx
import Link from 'next/link';
import { Button } from '@/components/button';

export default function OrderNotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="text-6xl mb-4">🔍</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h2>
      <p className="text-gray-600 mb-6">
        The order you're looking for doesn't exist or you don't have permission to view it.
      </p>
      <Link href="/profile/orders">
        <Button variant="primary">View All Orders</Button>
      </Link>
    </div>
  );
}
