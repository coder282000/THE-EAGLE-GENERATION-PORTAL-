export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-72 animate-pulse rounded bg-ink/10" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
        <div className="space-y-3 rounded-lg border border-ink/10 bg-white p-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 w-full animate-pulse rounded bg-ink/5" />
          ))}
        </div>
        <div className="space-y-3">
          <div className="h-40 animate-pulse rounded-lg border border-ink/10 bg-paper" />
          <div className="h-40 animate-pulse rounded-lg border border-ink/10 bg-paper" />
        </div>
      </div>
    </div>
  );
}