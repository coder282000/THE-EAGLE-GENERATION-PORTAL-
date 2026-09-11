export default function Loading() {
  return (
    <div className="space-y-6 p-6">
      <div className="h-8 w-64 animate-pulse rounded bg-ink/10" />
      <div className="h-4 w-96 animate-pulse rounded bg-ink/10" />
      <div className="h-96 animate-pulse rounded-lg bg-ink/10" />
    </div>
  );
}