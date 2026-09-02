"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { mockProducts } from "@/components/mock/data";

const categories = ["all", "merchandise", "resources", "learning", "other"];

export default function ShopPage() {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  const filteredProducts = useMemo(() => {
    let result = mockProducts;
    if (category !== "all") {
      result = result.filter((p) => p.category === category);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [category, search]);

  return (
    <div className="min-h-screen bg-paper">
      <div className="container-portal py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="font-display text-3xl font-bold text-ink-900">Shop</h1>
            <p className="mt-1 text-sm text-ink-500">
              Merchandise, resources, and learning materials to support your journey.
            </p>
          </div>

          {/* Search & Categories */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300">🔍</span>
              <input
                type="text"
                placeholder="Search products..."
                className="w-full rounded-md border border-ink-200 py-2 pl-9 pr-4 text-sm outline-none transition-colors placeholder:text-ink-300 focus:border-sky-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                    category === cat
                      ? "bg-ink-900 text-white shadow-sm"
                      : "bg-ink-100 text-ink-700 hover:bg-ink-200"
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <p className="text-sm text-ink-400">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} found
          </p>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-4xl mb-3">🛍️</p>
              <h3 className="font-display text-lg font-semibold text-ink-900">No products found</h3>
              <p className="mt-1 text-sm text-ink-500">Try adjusting your search or filter.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="p-4 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col h-full">
                    <div className="h-32 bg-ink-100 rounded-lg flex items-center justify-center text-4xl">
                      {product.category === "merchandise" && "👕"}
                      {product.category === "resources" && "📚"}
                      {product.category === "learning" && "🎓"}
                      {product.category === "other" && "📦"}
                    </div>
                    <div className="mt-3">
                      <span className="inline-block rounded-full bg-ink-50 px-2 py-0.5 text-xs font-medium text-ink-600 capitalize">
                        {product.category}
                      </span>
                      <h3 className="mt-1 font-display font-semibold text-ink-900">{product.name}</h3>
                      <p className="text-sm text-ink-600 leading-relaxed flex-1">{product.description}</p>
                      <p className="mt-2 text-sm font-semibold text-ink-900">
                        KES {product.price.toLocaleString()}
                      </p>
                      <div className="mt-3 pt-3 border-t border-ink-100">
                        {product.inStock ? (
                          <Link href={`/shop/${product.id}`}>
                            <Button variant="primary" size="sm" fullWidth>
                              View Details
                            </Button>
                          </Link>
                        ) : (
                          <span className="text-xs text-clay-500">Out of stock</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Back to Home */}
          <div className="text-center">
            <Link href="/" className="text-sm text-sky-600 hover:underline">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}