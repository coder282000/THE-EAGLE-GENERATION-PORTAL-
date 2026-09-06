import { MemberLayout } from "@/components/layout/memberLayout";

export default function MessagesLoading() {
  return (
    <MemberLayout>
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-7 w-32 bg-ink-100 animate-pulse rounded" />
            <div className="h-4 w-48 bg-ink-100 animate-pulse rounded mt-1" />
          </div>
          <div className="h-9 w-28 bg-ink-100 animate-pulse rounded-md" />
        </div>
        <div className="space-y-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <div className="h-12 w-12 rounded-full bg-ink-100 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-ink-100 animate-pulse" />
                <div className="h-3 w-48 bg-ink-100 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </MemberLayout>
  );
}
