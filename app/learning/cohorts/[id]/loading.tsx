import { MemberLayout } from "@/components/layout/memberLayout";
import { Card } from "@/components/card";

export default function CohortDetailLoading() {
  return (
    <MemberLayout>
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 bg-ink-100 animate-pulse rounded" />
          <div className="h-6 w-32 bg-ink-100 animate-pulse rounded" />
        </div>
        <Card className="p-6 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="space-y-2">
              <div className="h-8 w-48 bg-ink-100 animate-pulse rounded" />
              <div className="h-4 w-32 bg-ink-100 animate-pulse" />
            </div>
            <div className="h-6 w-20 bg-ink-100 animate-pulse rounded-full" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-3 border border-ink-100 rounded-lg space-y-1">
                <div className="h-6 w-12 bg-ink-100 animate-pulse" />
                <div className="h-3 w-16 bg-ink-100 animate-pulse" />
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <div className="h-6 w-32 bg-ink-100 animate-pulse rounded mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <div className="h-10 w-10 rounded-full bg-ink-100 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-ink-100 animate-pulse" />
                  <div className="h-3 w-24 bg-ink-100 animate-pulse" />
                </div>
                <div className="h-4 w-16 bg-ink-100 animate-pulse" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </MemberLayout>
  );
}
