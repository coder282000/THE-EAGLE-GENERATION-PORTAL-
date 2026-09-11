export default function Loading() {
  return (
    <div className="space-y-6 p-6">
      <div className="h-4 w-32 animate-pulse rounded bg-ink/10" />
      <div className="h-8 w-64 animate-pulse rounded bg-ink/10" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-40 animate-pulse rounded-lg bg-ink/10" />
          <div className="h-32 animate-pulse rounded-lg bg-ink/10" />
        </div>
        <div className="h-64 animate-pulse rounded-lg bg-ink/10" />
      </div>
    </div>
  );
}