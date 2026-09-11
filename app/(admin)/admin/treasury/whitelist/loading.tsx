export default function Loading() {
  return (
    <div className="p-6">
      <div className="h-8 w-96 animate-pulse rounded bg-ink/10" />
      <div className="mt-6 grid grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-ink/5" />
        ))}
      </div>
      <div className="mt-6 h-96 animate-pulse rounded-lg bg-ink/5" />
    </div>
  );
}