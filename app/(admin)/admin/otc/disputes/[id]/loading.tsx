export default function Loading() {
  return (
    <div className="p-6">
      <div className="h-4 w-48 animate-pulse rounded bg-ink/10" />
      <div className="mt-4 h-8 w-64 animate-pulse rounded bg-ink/10" />
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="h-64 animate-pulse rounded-lg bg-ink/5 lg:col-span-2" />
        <div className="h-64 animate-pulse rounded-lg bg-ink/5" />
      </div>
    </div>
  );
}