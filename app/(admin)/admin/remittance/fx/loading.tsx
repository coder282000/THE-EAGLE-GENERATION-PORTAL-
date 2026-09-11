export default function Loading() {
  return (
    <div className="p-6">
      <div className="h-8 w-80 animate-pulse rounded bg-ink/10" />
      <div className="mt-6 space-y-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg bg-ink/5" />
        ))}
      </div>
    </div>
  );
}