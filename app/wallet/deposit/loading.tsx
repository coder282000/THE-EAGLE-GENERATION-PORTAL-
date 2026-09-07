export default function DepositLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 animate-pulse">
      <div className="h-8 w-32 bg-paper rounded" />
      <div className="h-20 bg-paper rounded" />
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-paper rounded" />
        ))}
      </div>
    </div>
  );
}