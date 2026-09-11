export default function Loading() {
  return (
    <div className="p-6">
      <div className="h-8 w-80 animate-pulse rounded bg-ink/10" />
      <div className="mt-6 h-64 animate-pulse rounded-lg bg-ink/5" />
      <div className="mt-6 h-40 animate-pulse rounded-lg bg-ink/5" />
    </div>
  );
}