// app/admin/tasks/loading.tsx
export default function TasksLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-40 bg-paper rounded" />
      <div className="flex gap-2 border-b border-ink/10 pb-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 w-20 bg-paper rounded-lg" />
        ))}
      </div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-24 bg-white border border-ink/10 rounded-lg"
          />
        ))}
      </div>
    </div>
  );
}