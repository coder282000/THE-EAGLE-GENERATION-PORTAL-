// app/profile/orders/[id]/loading.tsx
export default function OrderDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-32 bg-gray-200 rounded mt-2 animate-pulse"></div>
        </div>
        <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-t border-gray-200">
                <div className="flex-1">
                  <div className="h-5 w-40 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded mt-1 animate-pulse"></div>
                </div>
                <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-1">
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