import { MemberLayout } from "@/components/layout/memberLayout";
import { Card } from "@/components/card";

export default function GroupSettingsLoading() {
  return (
    <MemberLayout>
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="h-6 w-24 bg-ink-100 animate-pulse rounded" />
        <Card className="p-6 space-y-4">
          <div className="h-7 w-32 bg-ink-100 animate-pulse" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="h-4 w-20 bg-ink-100 animate-pulse" />
                <div className="h-10 w-full bg-ink-100 animate-pulse rounded-md" />
              </div>
            ))}
          </div>
          <div className="h-10 w-28 bg-ink-100 animate-pulse rounded-md" />
        </Card>
        <Card className="p-6">
          <div className="h-7 w-24 bg-ink-100 animate-pulse" />
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
