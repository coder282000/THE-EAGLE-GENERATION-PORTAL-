"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/card";
import { Button } from "@/components/button";

// Mock certificate data – in real app, this would come from an API
const mockCertificates = [
  {
    id: "cert-001",
    recipient: "Grace Mwangi",
    course: "Foundations of Leadership",
    pillar: "Governance",
    issuedAt: "2026-08-15T10:00:00Z",
    issuer: "Eagle Generation",
    status: "valid",
  },
  {
    id: "cert-002",
    recipient: "David Ochieng",
    course: "Marketplace Ethics 101",
    pillar: "Marketplace",
    issuedAt: "2026-07-20T14:30:00Z",
    issuer: "Eagle Generation",
    status: "valid",
  },
  {
    id: "cert-003",
    recipient: "Faith Akinyi",
    course: "Technology for Transformation",
    pillar: "Technology",
    issuedAt: "2026-06-10T09:00:00Z",
    issuer: "Eagle Generation",
    status: "revoked",
  },
];

export default function CertificateVerificationPage() {
  const { id } = useParams();
  const certificate = mockCertificates.find((c) => c.id === id);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-ink-900">
            Certificate Verification
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Verify the authenticity of an Eagle Generation certificate.
          </p>
        </div>

        {!certificate ? (
          <Card className="p-6 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="font-display text-lg font-semibold text-ink-900">Certificate Not Found</h2>
            <p className="text-sm text-ink-500 mt-2">
              No certificate found with ID: <span className="font-mono text-xs bg-ink-50 px-2 py-1 rounded">{id}</span>
            </p>
            <p className="text-xs text-ink-400 mt-4">
              Double-check the certificate ID or contact support if you believe this is an error.
            </p>
            <Link href="/">
              <Button variant="secondary" className="mt-6">Return Home</Button>
            </Link>
          </Card>
        ) : (
          <Card className="p-6">
            {/* Status Badge */}
            <div className="flex items-center gap-3 mb-4">
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${certificate.status === "valid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {certificate.status === "valid" ? "✅ Valid" : "❌ Revoked"}
              </span>
              <span className="text-xs text-ink-400">ID: {certificate.id}</span>
            </div>

            {/* Certificate Details */}
            <div className="border-t border-ink-100 pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-ink-500">Recipient</span>
                <span className="font-medium text-ink-900">{certificate.recipient}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-500">Course</span>
                <span className="font-medium text-ink-900">{certificate.course}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-500">Pillar</span>
                <span className="font-medium text-ink-900">{certificate.pillar}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-500">Issued</span>
                <span className="font-medium text-ink-900">
                  {new Date(certificate.issuedAt).toLocaleDateString("en-KE", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-500">Issued By</span>
                <span className="font-medium text-ink-900">{certificate.issuer}</span>
              </div>
            </div>

            {/* Verification URL */}
            <div className="mt-6 pt-4 border-t border-ink-100 flex justify-center">
              <div className="text-center">
                <p className="text-xs text-ink-400">This certificate can be verified at</p>
                <p className="text-xs font-mono text-ink-500 break-all">
                  the-eagle-generation-portal.vercel.app/verify/{certificate.id}
                </p>
              </div>
            </div>

            <div className="mt-4 flex justify-center gap-3">
              <Link href="/">
                <Button variant="secondary">Return Home</Button>
              </Link>
              <Button variant="ghost" onClick={() => window.print()}>
                🖨️ Print
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}