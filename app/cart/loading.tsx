// app/shop/[id]/loading.tsx
export default function ProductDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-6"></div>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2">
          <div className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        <div className="md:w-1/2 space-y-4">
          <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-6 w-1/3 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-24 w-full bg-gray-200 rounded animate-pulse"></div>
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-40 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
