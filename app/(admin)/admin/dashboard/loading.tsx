// app/admin/dashboard/loading.tsx
export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-paper rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-white border border-ink/10 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-72 bg-white border border-ink/10 rounded-lg" />
          <div className="h-80 bg-white border border-ink/10 rounded-lg" />
        </div>
        <div className="space-y-6">
          <div className="h-64 bg-white border border-ink/10 rounded-lg" />
          <div className="h-56 bg-white border border-ink/10 rounded-lg" />
        </div>
      </div>
    </div>
  );
}