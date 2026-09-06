import { MemberLayout } from "@/components/layout/memberLayout";

export default function CertificateLoading() {
  return (
    <MemberLayout>
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 bg-ink-100 animate-pulse rounded" />
          <div className="h-6 w-32 bg-ink-100 animate-pulse rounded" />
        </div>
        <div className="rounded-xl border-8 border-amber-200 bg-white p-10 shadow-xl max-w-3xl mx-auto h-[400px] animate-pulse">
          <div className="h-16 w-16 bg-ink-100 rounded-full mx-auto mb-4" />
          <div className="h-8 w-48 bg-ink-100 mx-auto mb-4" />
          <div className="h-4 w-32 bg-ink-100 mx-auto mb-6" />
          <div className="h-6 w-56 bg-ink-100 mx-auto mb-4" />
          <div className="h-4 w-40 bg-ink-100 mx-auto mb-8" />
          <div className="h-4 w-64 bg-ink-100 mx-auto" />
        </div>
      </div>
    </MemberLayout>
  );
}
