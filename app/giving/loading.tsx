// app/giving/loading.tsx
export default function GivingLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
      <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mb-8"></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse mt-6"></div>
          </div>
        </div>
      </div>
    </div>
  );
}