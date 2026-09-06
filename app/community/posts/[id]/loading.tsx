import { MemberLayout } from "@/components/layout/memberLayout";
import { PostSkeleton } from "@/components/community/PostSkeleton";
import { Card } from "@/components/card";

export default function PostDetailLoading() {
  return (
    <MemberLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="h-6 w-20 bg-ink-100 rounded animate-pulse" />
        <Card className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-ink-100 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-ink-100 animate-pulse" />
              <div className="h-3 w-20 bg-ink-100 animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-ink-100 animate-pulse" />
            <div className="h-4 w-3/4 bg-ink-100 animate-pulse" />
          </div>
          <div className="flex gap-4">
            <div className="h-6 w-12 bg-ink-100 animate-pulse" />
            <div className="h-6 w-12 bg-ink-100 animate-pulse" />
          </div>
        </Card>
        <Card className="p-6 space-y-4">
          <div className="h-20 w-full bg-ink-100 animate-pulse" />
          <div className="flex justify-end">
            <div className="h-9 w-24 bg-ink-100 animate-pulse rounded-md" />
          </div>
        </Card>
      </div>
    </MemberLayout>
  );
}
