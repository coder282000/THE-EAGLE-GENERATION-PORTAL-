export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-56 animate-pulse rounded bg-ink/10" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-lg border border-ink/10 bg-paper"
          />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-lg border border-ink/10 bg-paper" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-64 animate-pulse rounded-lg border border-ink/10 bg-paper" />
        <div className="h-64 animate-pulse rounded-lg border border-ink/10 bg-paper" />
      </div>
    </div>
  );
}