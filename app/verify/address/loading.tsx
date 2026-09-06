// app/verify/address/loading.tsx
export default function AddressLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-6"></div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mb-6"></div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
          <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}