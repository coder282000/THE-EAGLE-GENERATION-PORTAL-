export default function WithdrawLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 animate-pulse">
      <div className="h-8 w-32 bg-paper rounded" />
      <div className="flex gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-8 w-16 bg-paper rounded" />
        ))}
      </div>
      <div className="h-24 bg-paper rounded" />
      <div className="space-y-4">
        <div className="h-14 bg-paper rounded" />
        <div className="h-14 bg-paper rounded" />
        <div className="h-14 bg-paper rounded" />
      </div>
    </div>
  );
}