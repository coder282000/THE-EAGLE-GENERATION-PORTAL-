import { MemberLayout } from "@/components/layout/memberLayout";
import { Card } from "@/components/card";

export default function QuizLoading() {
  return (
    <MemberLayout>
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 bg-ink-100 animate-pulse rounded" />
          <div className="h-6 w-32 bg-ink-100 animate-pulse rounded" />
        </div>
        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-ink-100 animate-pulse" />
            <div className="h-4 w-32 bg-ink-100 animate-pulse" />
            <div className="h-2 w-full bg-ink-100 animate-pulse rounded" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-ink-100 animate-pulse" />
                <div className="h-4 w-48 bg-ink-100 animate-pulse" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </MemberLayout>
  );
}
