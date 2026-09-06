export default function RejectedLoading() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="h-16 w-16 bg-gray-200 rounded-full animate-pulse mx-auto"></div>
        <div className="h-8 w-48 bg-gray-200 rounded mx-auto mt-4 animate-pulse"></div>
        <div className="h-4 w-64 bg-gray-200 rounded mx-auto mt-2 animate-pulse"></div>
        <div className="h-32 bg-gray-200 rounded mx-auto mt-6 animate-pulse"></div>
      </div>
    </div>
  );
}
