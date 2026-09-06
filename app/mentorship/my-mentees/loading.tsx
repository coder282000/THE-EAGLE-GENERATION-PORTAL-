import { MemberLayout } from "@/components/layout/memberLayout";
import { Card } from "@/components/card";

export default function MyMenteesLoading() {
  return (
    <MemberLayout>
      <div className="space-y-4">
        <div>
          <div className="h-7 w-48 bg-ink-100 animate-pulse rounded" />
          <div className="h-4 w-32 bg-ink-100 animate-pulse rounded mt-1" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="p-5 border border-ink-100">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="h-16 w-16 rounded-full bg-ink-100 animate-pulse shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 w-40 bg-ink-100 animate-pulse" />
                  <div className="h-4 w-full bg-ink-100 animate-pulse" />
                  <div className="flex gap-2">
                    <div className="h-5 w-20 bg-ink-100 animate-pulse rounded-full" />
                    <div className="h-5 w-20 bg-ink-100 animate-pulse rounded-full" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </MemberLayout>
  );
}
