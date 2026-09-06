"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MemberLayout } from "@/components/layout/memberLayout";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { mockCertificates, mockCourses, mockMembers, Certificate } from "@/components/mock/data";
import { format } from "date-fns";
import { ArrowLeft, Download, ShieldCheck, Calendar, Award, Users, BookOpen, CheckCircle } from "lucide-react";

// ============================================================
// Certificate Display Component (Print Friendly)
// ============================================================

function CertificateContent({
  certificate,
  memberName,
  courseTitle,
  issuedDate,
}: {
  certificate: Certificate;
  memberName: string;
  courseTitle: string;
  issuedDate: string;
}) {
  const formattedDate = format(new Date(issuedDate), "MMMM d, yyyy");

  return (
    <div className="print:bg-white print:p-8">
      <div className="relative bg-white rounded-xl border-8 border-amber-400 p-10 shadow-xl max-w-3xl mx-auto print:shadow-none print:border-4">
        {/* Decorative border inner */}
        <div className="absolute inset-4 border-2 border-amber-200 rounded-lg pointer-events-none" />

        {/* Eagle emblem */}
        <div className="text-center">
          <div className="text-6xl mb-2">🦅</div>
          <h1 className="font-display text-3xl font-bold text-ink-900 tracking-wide">
            Eagle Generation
          </h1>
          <p className="text-sm text-ink-500 uppercase tracking-widest mt-1">Certificate of Completion</p>
        </div>

        <div className="border-b border-ink-200 my-6" />

        {/* Body */}
        <div className="text-center space-y-4">
          <p className="text-sm text-ink-500">This certifies that</p>
          <h2 className="font-display text-3xl font-semibold text-ink-900">{memberName}</h2>
          <p className="text-sm text-ink-500">has successfully completed the course</p>
          <h3 className="font-display text-2xl font-semibold text-dawn-700">{courseTitle}</h3>

          <div className="flex items-center justify-center gap-2 text-sm text-ink-500 mt-2">
            <Calendar className="h-4 w-4" />
            <span>Issued on {formattedDate}</span>
          </div>
        </div>

        <div className="border-b border-ink-200 my-6" />

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-ink-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-green-600" />
            <span>Certificate ID: {certificate.certificateNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-500" />
            <span>Verified by Eagle Generation</span>
          </div>
        </div>

        {/* Verification URL */}
        <div className="mt-4 pt-4 border-t border-ink-100 text-center">
          <p className="text-xs text-ink-400">
            Verify this certificate at:
            <span className="ml-1 font-mono text-ink-600">
              theeaglegeneration.org/verify/{certificate.id}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Main Page Component
// ============================================================

export default function CertificateViewPage() {
  const params = useParams();
  const router = useRouter();
  const certificateId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [memberName, setMemberName] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 500));

        const found = mockCertificates.find((c) => c.id === certificateId);
        if (!found) {
          setError("Certificate not found");
          setIsLoading(false);
          return;
        }
        setCertificate(found);

        // Find member
        const member = mockMembers.find((m) => m.id === found.userId);
        setMemberName(member ? `${member.firstName} ${member.lastName}` : "Unknown Member");

        // Find course
        const course = mockCourses.find((c) => c.id === found.courseId);
        setCourseTitle(course ? course.title : "Unknown Course");

        setError(null);
      } catch (err) {
        setError("Failed to load certificate. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [certificateId]);

  const handlePrint = () => {
    window.print();
  };

  // ======== LOADING ========
  if (isLoading) {
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

  // ======== ERROR ========
  if (error || !certificate) {
    return (
      <MemberLayout>
        <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-12 text-center">
          <span className="text-4xl mb-4">🔍</span>
          <p className="text-lg text-ink-600">{error || "Certificate not found"}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/learning/my-learning")}>
            Back to My Learning
          </Button>
        </div>
      </MemberLayout>
    );
  }

  // ======== POPULATED ========
  return (
    <MemberLayout>
      <div className="max-w-3xl mx-auto space-y-6 print:max-w-full print:mx-0 print:p-0">
        {/* Header actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <button
            onClick={() => router.back()}
            className="text-sm text-ink-400 hover:text-ink-600 transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex items-center gap-3">
            <Link href={`/verify/${certificate.id}`} target="_blank">
              <Button variant="outline" size="sm" className="gap-1">
                <ShieldCheck className="h-4 w-4" /> Verify
              </Button>
            </Link>
            <Button variant="primary" size="sm" onClick={handlePrint} className="gap-1">
              <Download className="h-4 w-4" /> Download PDF
            </Button>
          </div>
        </div>

        {/* Certificate */}
        <CertificateContent
          certificate={certificate}
          memberName={memberName}
          courseTitle={courseTitle}
          issuedDate={certificate.issuedAt}
        />

        {/* Additional info (print hidden) */}
        <div className="print:hidden">
          <Card className="p-4 bg-ink-50 border-none">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-ink-600">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>This certificate is officially issued and can be verified online.</span>
              </div>
              <Link href={`/verify/${certificate.id}`} className="text-sm text-dawn-600 hover:underline">
                Verify this certificate →
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </MemberLayout>
  );
}
