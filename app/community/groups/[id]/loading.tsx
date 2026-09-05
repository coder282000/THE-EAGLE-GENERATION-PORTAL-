import { MemberLayout } from "@/components/layout/memberLayout";
import { Card } from "@/components/card";

export default function GroupLoading() {
  return (
    <MemberLayout>
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="h-6 w-20 bg-ink-100 rounded animate-pulse" />
        <Card className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="h-7 w-48 bg-ink-100 animate-pulse rounded" />
              <div className="h-4 w-24 bg-ink-100 animate-pulse rounded" />
              <div className="h-4 w-full bg-ink-100 animate-pulse" />
              <div className="h-4 w-3/4 bg-ink-100 animate-pulse" />
            </div>
            <div className="h-10 w-28 bg-ink-100 animate-pulse rounded-md" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="h-8 w-24 bg-ink-100 animate-pulse rounded" />
          <div className="space-y-3 mt-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-ink-100 animate-pulse" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 w-32 bg-ink-100 animate-pulse" />
                  <div className="h-3 w-24 bg-ink-100 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </MemberLayout>
  );
}