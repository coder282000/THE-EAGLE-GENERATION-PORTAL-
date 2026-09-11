export default function Loading() {
  return (
    <div className="p-6">
      <div className="h-8 w-72 animate-pulse rounded bg-ink/10" />
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-40 animate-pulse rounded-lg bg-ink/5" />
        ))}
      </div>
    </div>
  );
}