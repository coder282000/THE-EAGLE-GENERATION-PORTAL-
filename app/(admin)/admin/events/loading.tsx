export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-40 animate-pulse rounded bg-ink/10" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-lg border border-ink/10 bg-paper"
          />
        ))}
      </div>
      <div className="space-y-2 rounded-lg border border-ink/10 bg-white p-4">
        <div className="h-10 w-full animate-pulse rounded bg-ink/5" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-12 w-full animate-pulse rounded bg-ink/5"
          />
        ))}
      </div>
    </div>
  );
}