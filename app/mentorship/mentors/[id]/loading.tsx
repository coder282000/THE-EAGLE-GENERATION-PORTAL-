import { MemberLayout } from "@/components/layout/memberLayout";
import { Card } from "@/components/card";

export default function MentorProfileLoading() {
  return (
    <MemberLayout>
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 bg-ink-100 animate-pulse rounded" />
          <div className="h-6 w-32 bg-ink-100 animate-pulse rounded" />
        </div>
        <Card className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="h-24 w-24 rounded-full bg-ink-100 animate-pulse shrink-0 mx-auto sm:mx-0" />
            <div className="flex-1 space-y-3">
              <div className="h-7 w-40 bg-ink-100 animate-pulse" />
              <div className="h-4 w-full bg-ink-100 animate-pulse" />
              <div className="h-4 w-3/4 bg-ink-100 animate-pulse" />
              <div className="flex gap-2">
                <div className="h-5 w-20 bg-ink-100 animate-pulse rounded-full" />
                <div className="h-5 w-20 bg-ink-100 animate-pulse rounded-full" />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </MemberLayout>
  );
}
