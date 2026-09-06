// app/profile/giving/loading.tsx
export default function GivingHistoryLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-32 bg-gray-200 rounded mt-1 animate-pulse"></div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="h-10 w-40 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-5 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
                <div className="h-4 w-48 bg-gray-200 rounded mt-2 animate-pulse"></div>
                <div className="h-3 w-24 bg-gray-200 rounded mt-1 animate-pulse"></div>
              </div>
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}