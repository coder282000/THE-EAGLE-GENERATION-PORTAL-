// app/checkout/loading.tsx
export default function CheckoutLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-8"></div>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="lg:w-1/3">
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded animate-pulse mt-6"></div>
          </div>
        </div>
      </div>
    </div>
  );
}