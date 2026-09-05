import { MemberLayout } from "@/components/layout/memberLayout";
import { Card } from "@/components/card";

export default function MessageThreadLoading() {
  return (
    <MemberLayout>
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 bg-ink-100 animate-pulse rounded" />
          <div className="h-10 w-10 rounded-full bg-ink-100 animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-5 w-32 bg-ink-100 animate-pulse" />
            <div className="h-3 w-24 bg-ink-100 animate-pulse" />
          </div>
        </div>
        <Card className="p-4 space-y-4 min-h-[400px] flex flex-col">
          <div className="flex-1 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={`flex gap-3 ${i % 2 === 0 ? "" : "flex-row-reverse"}`}
              >
                <div className="h-8 w-8 rounded-full bg-ink-100 animate-pulse" />
                <div className={`space-y-2 max-w-[75%] ${i % 2 === 0 ? "" : "items-end"}`}>
                  <div className="h-10 w-48 bg-ink-100 animate-pulse rounded-2xl" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-4 border-t border-ink-100">
            <div className="flex-1 h-10 bg-ink-100 animate-pulse rounded-md" />
            <div className="h-10 w-20 bg-ink-100 animate-pulse rounded-md" />
          </div>
        </Card>
      </div>
    </MemberLayout>
  );
}