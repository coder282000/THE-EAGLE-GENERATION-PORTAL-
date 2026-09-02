"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { mockProducts } from "@/components/mock/data";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const product = mockProducts.find((p) => p.id === id);

  const [addedToCart, setAddedToCart] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsLoading(false);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  if (!product) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Card className="max-w-md w-full p-6 text-center">
          <p className="text-4xl mb-3">🔍</p>
          <h2 className="font-display text-lg font-semibold text-ink-900">Product Not Found</h2>
          <p className="text-sm text-ink-500 mt-2">The product you're looking for doesn't exist.</p>
          <Link href="/shop" className="mt-4 inline-block">
            <Button variant="secondary">← Back to Shop</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <div className="container-portal py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <Link href="/shop" className="text-sm text-sky-600 hover:underline inline-flex items-center gap-1">
            ← Back to Shop
          </Link>

          <Card className="p-6 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-block rounded-full bg-ink-50 px-2.5 py-0.5 text-xs font-medium text-ink-600 capitalize">
                  {product.category}
                </span>
                <h1 className="mt-2 font-display text-2xl font-bold text-ink-900">{product.name}</h1>
              </div>
              <span className="inline-block rounded-full bg-dawn-100 px-3 py-1 text-sm font-medium text-dawn-700">
                KES {product.price.toLocaleString()}
              </span>
            </div>

            <div className="h-48 bg-ink-100 rounded-lg flex items-center justify-center text-6xl">
              {product.category === "merchandise" && "👕"}
              {product.category === "resources" && "📚"}
              {product.category === "learning" && "🎓"}
              {product.category === "other" && "📦"}
            </div>

            <div className="border-t border-ink-100 pt-4 space-y-2 text-sm">
              <p className="text-ink-700 leading-relaxed">{product.description}</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-ink-500">SKU</span>
                  <p className="font-medium text-ink-900">{product.sku || "N/A"}</p>
                </div>
                <div>
                  <span className="text-ink-500">Availability</span>
                  <p className={`font-medium ${product.inStock ? "text-green-700" : "text-clay-700"}`}>
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </p>
                </div>
              </div>
            </div>

            {addedToCart ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-2xl mb-1">✅</p>
                <p className="font-medium text-green-700">Added to Cart!</p>
                <Link href="/cart" className="mt-2 inline-block">
                  <Button variant="secondary" size="sm">View Cart</Button>
                </Link>
              </div>
            ) : product.inStock ? (
              <Button variant="primary" size="lg" fullWidth onClick={handleAddToCart} disabled={isLoading}>
                {isLoading ? "Adding..." : "Add to Cart"}
              </Button>
            ) : (
              <Button variant="secondary" size="lg" fullWidth disabled>
                Out of Stock
              </Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}