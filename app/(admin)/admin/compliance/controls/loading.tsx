export default function Loading() {
  return (
    <div className="p-6">
      <div className="h-8 w-96 animate-pulse rounded bg-ink/10" />
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-ink/5" />
        ))}
      </div>
      <div className="mt-6 space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-40 animate-pulse rounded-lg bg-ink/5" />
        ))}
      </div>
    </div>
  );
}