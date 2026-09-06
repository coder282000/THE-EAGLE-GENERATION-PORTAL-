// app/verify/liveness/loading.tsx
export default function LivenessLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-6"></div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mb-6"></div>
        <div className="bg-gray-900 rounded-lg aspect-video animate-pulse"></div>
        <div className="mt-4 h-12 w-full bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  );
}