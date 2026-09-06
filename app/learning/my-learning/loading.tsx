import { MemberLayout } from "@/components/layout/memberLayout";

export default function MyLearningLoading() {
  return (
    <MemberLayout>
      <div className="max-w-3xl mx-auto space-y-4">
        <div>
          <div className="h-7 w-32 bg-ink-100 animate-pulse rounded" />
          <div className="h-4 w-48 bg-ink-100 animate-pulse rounded mt-1" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 border border-ink-100 rounded-lg space-y-2">
              <div className="h-6 w-12 bg-ink-100 animate-pulse rounded" />
              <div className="h-4 w-20 bg-ink-100 animate-pulse rounded" />
            </div>
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 border border-ink-100 rounded-lg flex flex-col sm:flex-row gap-4">
              <div className="h-20 w-full sm:w-28 rounded-lg bg-ink-100 animate-pulse" />
              <div className="flex-1 space-y-3">
                <div className="h-6 w-40 bg-ink-100 animate-pulse rounded" />
                <div className="h-4 w-32 bg-ink-100 animate-pulse" />
                <div className="h-2 w-full bg-ink-100 animate-pulse rounded" />
              </div>
              <div className="h-9 w-28 bg-ink-100 animate-pulse rounded-md shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </MemberLayout>
  );
}
