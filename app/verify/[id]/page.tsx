'use client';
// app/verify/[id]/page.tsx
import { notFound, redirect } from "next/navigation";
import { mockCertificates, mockMembers, mockCourses } from "@/components/mock/data";
import { format } from "date-fns";
import Link from "next/link";
import { CheckCircle, ShieldCheck, Calendar, Award } from "lucide-react";

// Force static rendering
export const dynamic = "force-static";

// Generate static params for all known certificate IDs
export async function generateStaticParams() {
  return mockCertificates.map((cert) => ({
    id: cert.id,
  }));
}

// Meta data for the page
export async function generateMetadata({ params }: { params: { id: string } }) {
  const id = params.id;
  const cert = mockCertificates.find((c) => c.id === id);
  if (!cert) {
    return {
      title: "Certificate Not Found – Eagle Generation",
      description: "The certificate you are looking for could not be found.",
    };
  }
  const member = mockMembers.find((m) => m.id === cert.userId);
  const course = mockCourses.find((c) => c.id === cert.courseId);
  const name = member ? `${member.firstName} ${member.lastName}` : "a member";
  const courseTitle = course ? course.title : "a course";
  return {
    title: `Certificate of Completion – ${name} – Eagle Generation`,
    description: `Verified certificate: ${name} completed "${courseTitle}" with Eagle Generation.`,
    openGraph: {
      title: `Certificate – ${name}`,
      description: `Verified certificate for completion of "${courseTitle}"`,
      images: [
        {
          url: `/api/og/certificate?id=${id}`,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

// ============================================================
// Certificate Display Component (Server Component Friendly)
// ============================================================

function CertificateDisplay({
  certificate,
  member,
  course,
}: {
  certificate: any;
  member: any;
  course: any;
}) {
  const issuedDate = format(new Date(certificate.issuedAt), "MMMM d, yyyy");
  const memberName = member ? `${member.firstName} ${member.lastName}` : "Unknown Member";
  const memberNumber = member?.memberNumber || "N/A";
  const courseTitle = course?.title || "Unknown Course";

  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Verification badge header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
            <CheckCircle className="h-5 w-5" />
            Verified Certificate
          </div>
        </div>

        {/* Certificate card */}
        <div className="bg-white rounded-xl border-8 border-amber-400 shadow-2xl overflow-hidden print:border-4 print:shadow-none">
          {/* Inner decorative border */}
          <div className="relative p-6 sm:p-10">
            <div className="absolute inset-4 border-2 border-amber-200 rounded-lg pointer-events-none" />

            {/* Header */}
            <div className="text-center relative z-10">
              <div className="text-5xl mb-2">🦅</div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 tracking-wide">
                Eagle Generation
              </h1>
              <p className="text-xs sm:text-sm text-ink-500 uppercase tracking-widest mt-1 font-medium">
                Certificate of Completion
              </p>
            </div>

            <div className="border-b border-ink-200 my-4 sm:my-6 relative z-10" />

            {/* Body */}
            <div className="text-center space-y-3 sm:space-y-4 relative z-10">
              <p className="text-sm text-ink-500">This certifies that</p>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900">
                {memberName}
              </h2>
              <p className="text-sm text-ink-500">has successfully completed the course</p>
              <h3 className="font-display text-xl sm:text-2xl font-semibold text-dawn-700">
                {courseTitle}
              </h3>

              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-sm text-ink-500 mt-2">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Issued {issuedDate}</span>
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  <span>ID: {certificate.certificateNumber}</span>
                </span>
              </div>
            </div>

            <div className="border-b border-ink-200 my-4 sm:my-6 relative z-10" />

            {/* Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm text-ink-400 gap-2 relative z-10">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                <span>Verified by Eagle Generation</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Member #</span>
                <span className="font-mono font-medium text-ink-600">{memberNumber}</span>
              </div>
            </div>

            {/* Verification URL */}
            <div className="mt-4 pt-4 border-t border-ink-100 text-center relative z-10">
              <p className="text-[10px] sm:text-xs text-ink-400">
                Verify this certificate at:
                <span className="ml-1 font-mono text-ink-600 break-all">
                  theeaglegeneration.org/verify/{certificate.id}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="text-center mt-6 text-sm text-ink-400">
          <p>This certificate is officially issued and can be verified online.</p>
          <Link href="/" className="inline-block mt-2 text-dawn-600 hover:underline">
            ← Return to Eagle Generation
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Not Found Component (Server Component)
// ============================================================

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <span className="text-5xl block mb-4">🔍</span>
        <h1 className="font-display text-2xl font-semibold text-ink-900">Certificate Not Found</h1>
        <p className="text-ink-500 mt-2">
          The certificate you are looking for does not exist or has been revoked.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-ink-900 text-white rounded-lg hover:bg-ink-800 transition-colors text-sm"
          >
            Return Home
          </Link>
          <Link
            href="/apply"
            className="inline-block px-6 py-2 border border-ink-200 rounded-lg hover:bg-ink-50 transition-colors text-sm"
          >
            Apply for Membership
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Main Page Component (Server Component)
// ============================================================

export default async function VerifyCertificatePage({
  params,
}: {
  params: { id: string };
}) {
  const id = params.id;

  // Find certificate
  const certificate = mockCertificates.find((c) => c.id === id);

  // Not found or revoked
  if (!certificate || certificate.status === "revoked") {
    return <NotFoundPage />;
  }

  // Find member and course
  const member = mockMembers.find((m) => m.id === certificate.userId);
  const course = mockCourses.find((c) => c.id === certificate.courseId);

  // Even if member or course is missing, we still show the certificate with fallback values
  return (
    <CertificateDisplay
      certificate={certificate}
      member={member}
      course={course}
    />
  );
}
