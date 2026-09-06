'use client';
// app/shop/page.tsx
'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/shop/ProductCard';
import { mockProducts } from '@/components/mock/data';
import { Product } from '@/components/mock/data';
import { TextInput, SelectInput } from '@/components/input';
import { Button } from '@/components/button';
import { debounce } from '@/lib/utils';

type CategoryFilter = 'all' | 'merchandise' | 'resources' | 'learning' | 'other';

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  { value: 'merchandise', label: 'Merchandise' },
  { value: 'resources', label: 'Resources' },
  { value: 'learning', label: 'Learning Products' },
  { value: 'other', label: 'Other' },
];

export default function ShopPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 9;

  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const allProducts = useMemo(() => {
    let result = mockProducts;
    if (category !== 'all') {
      result = result.filter(p => p.category === category);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [category, searchTerm]);

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, page]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setFilteredProducts(allProducts);
      setPage(1);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [allProducts]);

  const handleSearch = useCallback(
    debounce((value: string) => {
      setSearchTerm(value);
    }, 300),
    []
  );

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value as CategoryFilter);
  };

  const loadMore = () => {
    if (page < totalPages) {
      setPage(p => p + 1);
    }
  };

  if (loading && filteredProducts.length === 0) {
    return <ShopLoadingSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Shop</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="flex-1 sm:w-64">
            <TextInput
              id="shop-search"
              label="Search"
              placeholder="Search products..."
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
              aria-label="Search products"
            />
          </div>
          <div className="sm:w-48">
            <SelectInput
              id="shop-category"
              label="Category"
              value={category}
              onChange={handleCategoryChange}
              options={CATEGORY_OPTIONS}
              aria-label="Filter by category"
            />
          </div>
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-500">
        Showing {paginatedProducts.length} of {filteredProducts.length} products
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-700">No products found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your filters or search terms.</p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => {
              setSearchTerm('');
              setCategory('all');
            }}
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {totalPages > 1 && page < totalPages && (
            <div className="flex justify-center mt-8">
              <Button
                variant="secondary"
                onClick={loadMore}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ShopLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="h-10 w-full sm:w-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-full sm:w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="aspect-square bg-gray-200 animate-pulse"></div>
            <div className="p-4">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-4 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
