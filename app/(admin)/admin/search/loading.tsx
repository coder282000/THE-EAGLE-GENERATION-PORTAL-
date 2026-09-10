// app/admin/search/loading.tsx
export default function SearchLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-paper rounded" />
      <div className="h-14 bg-white border border-ink/10 rounded-lg" />
      <div className="h-64 bg-white border border-ink/10 rounded-lg" />
    </div>
  );
}