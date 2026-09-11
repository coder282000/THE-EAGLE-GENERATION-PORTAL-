export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-72 animate-pulse rounded bg-ink/10" />
      <div className="h-24 w-full animate-pulse rounded-lg border border-ink/10 bg-paper" />
      <div className="space-y-3 rounded-lg border border-ink/10 bg-white p-6">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 w-full animate-pulse rounded bg-ink/5" />
        ))}
      </div>
    </div>
  );
}