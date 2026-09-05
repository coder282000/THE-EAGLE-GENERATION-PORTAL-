import { MemberLayout } from "@/components/layout/memberLayout";
import { Card } from "@/components/card";

export default function LessonViewLoading() {
  return (
    <MemberLayout>
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 bg-ink-100 animate-pulse rounded" />
          <div className="h-6 w-32 bg-ink-100 animate-pulse rounded" />
        </div>
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 bg-ink-100 animate-pulse rounded" />
            <div className="h-6 w-32 bg-ink-100 animate-pulse" />
          </div>
          <div className="space-y-3">
            <div className="h-8 w-48 bg-ink-100 animate-pulse" />
            <div className="h-4 w-32 bg-ink-100 animate-pulse" />
            <div className="h-4 w-full bg-ink-100 animate-pulse" />
            <div className="h-4 w-3/4 bg-ink-100 animate-pulse" />
            <div className="h-4 w-1/2 bg-ink-100 animate-pulse" />
          </div>
        </Card>
        <div className="flex justify-between">
          <div className="h-9 w-32 bg-ink-100 animate-pulse rounded-md" />
          <div className="h-9 w-32 bg-ink-100 animate-pulse rounded-md" />
        </div>
      </div>
    </MemberLayout>
  );
}