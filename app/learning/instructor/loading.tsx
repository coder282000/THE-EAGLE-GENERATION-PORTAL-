import { MemberLayout } from "@/components/layout/memberLayout";

export default function InstructorLoading() {
  return (
    <MemberLayout>
      <div className="space-y-4">
        <div>
          <div className="h-7 w-48 bg-ink-100 animate-pulse rounded" />
          <div className="h-4 w-32 bg-ink-100 animate-pulse rounded mt-1" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 border border-ink-100 rounded-lg space-y-2">
              <div className="h-6 w-12 bg-ink-100 animate-pulse" />
              <div className="h-4 w-20 bg-ink-100 animate-pulse" />
            </div>
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="p-4 border border-ink-100 rounded-lg">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-48 bg-ink-100 animate-pulse" />
                  <div className="h-4 w-64 bg-ink-100 animate-pulse" />
                  <div className="flex gap-3">
                    <div className="h-4 w-20 bg-ink-100 animate-pulse" />
                    <div className="h-4 w-20 bg-ink-100 animate-pulse" />
                  </div>
                </div>
                <div className="h-9 w-24 bg-ink-100 animate-pulse rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </MemberLayout>
  );
}