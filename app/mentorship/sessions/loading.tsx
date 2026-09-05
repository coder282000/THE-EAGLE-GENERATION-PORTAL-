import { MemberLayout } from "@/components/layout/memberLayout";
import { Card } from "@/components/card";

export default function SessionsLoading() {
  return (
    <MemberLayout>
      <div className="space-y-4">
        <div>
          <div className="h-7 w-48 bg-ink-100 animate-pulse rounded" />
          <div className="h-4 w-32 bg-ink-100 animate-pulse rounded mt-1" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-20 bg-ink-100 animate-pulse rounded-md" />
          <div className="h-9 w-24 bg-ink-100 animate-pulse rounded-md" />
          <div className="h-9 w-20 bg-ink-100 animate-pulse rounded-md" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="p-5 border border-ink-100">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="h-14 w-14 rounded-full bg-ink-100 animate-pulse shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 w-40 bg-ink-100 animate-pulse" />
                  <div className="h-4 w-32 bg-ink-100 animate-pulse" />
                  <div className="h-4 w-48 bg-ink-100 animate-pulse" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </MemberLayout>
  );
}