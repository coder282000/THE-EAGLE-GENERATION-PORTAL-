import { MemberLayout } from "@/components/layout/memberLayout";
import { Card } from "@/components/card";

export default function NewLessonLoading() {
  return (
    <MemberLayout>
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 bg-ink-100 animate-pulse rounded" />
          <div className="h-6 w-32 bg-ink-100 animate-pulse rounded" />
        </div>
        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <div className="h-7 w-48 bg-ink-100 animate-pulse" />
            <div className="h-4 w-32 bg-ink-100 animate-pulse" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="h-4 w-24 bg-ink-100 animate-pulse" />
                <div className="h-10 w-full bg-ink-100 animate-pulse rounded-md" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </MemberLayout>
  );
}
