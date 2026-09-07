export default function TransactionsLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-paper rounded" />
      <div className="h-32 bg-paper rounded" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-paper rounded" />
        ))}
      </div>
    </div>
  );
}