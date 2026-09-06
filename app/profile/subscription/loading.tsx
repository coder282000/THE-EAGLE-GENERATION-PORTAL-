// app/profile/subscription/loading.tsx
export default function SubscriptionLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
      <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mb-8"></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-40 bg-gray-200 rounded mt-2 animate-pulse"></div>
          <div className="mt-4 space-y-3">
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  );
}