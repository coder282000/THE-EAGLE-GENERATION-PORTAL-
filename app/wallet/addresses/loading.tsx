export default function AddressBookLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-paper rounded" />
      <div className="grid grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-paper rounded" />
        ))}
      </div>
      <div className="h-16 bg-paper rounded" />
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-paper rounded" />
        ))}
      </div>
    </div>
  );
}