export default function WalletLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-pulse">
      <div className="h-8 w-32 bg-paper rounded" />
      <div className="h-32 w-full bg-paper rounded" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 bg-paper rounded" />
        ))}
      </div>
      <div className="space-y-3">
        <div className="h-6 w-24 bg-paper rounded" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-paper rounded" />
        ))}
      </div>
      <div className="h-20 bg-paper rounded" />
      <div className="space-y-3">
        <div className="h-6 w-32 bg-paper rounded" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-14 bg-paper rounded" />
        ))}
      </div>
    </div>
  );
}