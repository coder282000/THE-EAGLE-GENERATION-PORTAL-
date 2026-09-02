"use client";

import Link from "next/link";
import { MemberLayout } from "@/components/layout/memberLayout";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { PillarTag } from "@/components/pillarTag";
import { mockMembers } from "@/components/mock/data";

// Simulate current user (Grace) – replace with real auth later
const CURRENT_USER = mockMembers[0];

// Status badge colours
const statusColors = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
};

// Mock certificates for the current user
const userCertificates = [
  {
    id: "cert-001",
    name: "Foundations of Leadership",
    pillar: "Governance",
    issuedAt: "2026-08-15T10:00:00Z",
  },
  {
    id: "cert-002",
    name: "Marketplace Ethics 101",
    pillar: "Marketplace",
    issuedAt: "2026-07-20T14:30:00Z",
  },
];

export default function ProfilePage() {
  const member = CURRENT_USER;

  return (
    <MemberLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900">
            My Profile
          </h1>
          <Link href="/profile/settings">
            <Button variant="secondary" className="gap-2">
              ✏️ Edit Profile
            </Button>
          </Link>
        </div>

        {/* Profile Card */}
        <Card className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar */}
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-dawn-100 text-3xl font-bold text-dawn-700">
              {member.firstName[0]}{member.lastName[0]}
            </div>

            <div className="flex-1 text-center sm:text-left min-w-0">
              <p className="font-display text-xl font-semibold text-ink-900">
                {member.firstName} {member.lastName}
              </p>
              <p className="text-sm text-ink-500">
                <span className="font-mono">{member.memberNumber}</span>
                <span className="mx-2">•</span>
                <span className="inline-block rounded-full bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-700">
                  {member.tier}
                </span>
                <span className="mx-2">•</span>
                <span>{member.chapter}</span>
              </p>

              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                {member.pillarInterest.map((pillar) => (
                  <PillarTag 
                    key={pillar} 
                    pillar={pillar.toLowerCase() as "marketplace" | "governance" | "technology"} 
                  />
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Bio */}
        <Card className="p-5">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-ink-400">
            About Me
          </h3>
          <p className="mt-2 text-ink-700 leading-relaxed">
            {member.bio || "No bio yet. Click 'Edit Profile' to add one."}
          </p>
        </Card>

        {/* Member Details */}
        <Card className="p-5">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-ink-400">
            Member Details
          </h3>

          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex flex-wrap justify-between items-center py-2 border-b border-ink-100">
              <dt className="text-ink-500 flex items-center gap-2">
                ✉️ Email
              </dt>
              <dd className="text-ink-900 font-medium break-all">{member.email}</dd>
            </div>

            <div className="flex flex-wrap justify-between items-center py-2 border-b border-ink-100">
              <dt className="text-ink-500 flex items-center gap-2">
                📞 Phone
              </dt>
              <dd className="text-ink-900 font-medium">{member.phone || "Not provided"}</dd>
            </div>

            <div className="flex flex-wrap justify-between items-center py-2 border-b border-ink-100">
              <dt className="text-ink-500 flex items-center gap-2">
                📅 Joined
              </dt>
              <dd className="text-ink-900 font-medium">
                {new Date(member.joinedAt).toLocaleDateString("en-KE", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </dd>
            </div>

            <div className="flex flex-wrap justify-between items-center py-2">
              <dt className="text-ink-500">Status</dt>
              <dd>
                <span
                  className={`inline-block rounded-full px-3 py-0.5 text-xs font-medium capitalize ${
                    statusColors[member.status]
                  }`}
                >
                  {member.status}
                </span>
              </dd>
            </div>
          </dl>
        </Card>

        {/* Certificates Section - NEW */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-ink-400">
              My Certificates
            </h3>
            <Link
              href="/learning/certificates"
              className="text-xs font-medium text-sky-600 hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="mt-3 space-y-2">
            {userCertificates.length === 0 ? (
              <p className="text-sm text-ink-400">No certificates yet. Complete a course to earn one.</p>
            ) : (
              userCertificates.map((cert) => (
                <div key={cert.id} className="flex items-center justify-between border-b border-ink-100 pb-2 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-ink-900">{cert.name}</p>
                    <p className="text-xs text-ink-400">
                      {cert.pillar} · Issued: {new Date(cert.issuedAt).toLocaleDateString("en-KE", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <Link
                    href={`/verify/${cert.id}`}
                    className="text-sm font-medium text-sky-600 hover:underline"
                  >
                    Verify
                  </Link>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Quick Action Links – connects to Settings, Security, Privacy */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/profile/settings" className="block">
            <Card className="p-4 text-center hover:border-sky-300 transition-colors">
              <p className="text-sm font-medium text-ink-700">✏️ Edit Profile</p>
              <p className="text-xs text-ink-400 mt-1">Update your details</p>
            </Card>
          </Link>
          <Link href="/profile/security" className="block">
            <Card className="p-4 text-center hover:border-sky-300 transition-colors">
              <p className="text-sm font-medium text-ink-700">🔐 Security</p>
              <p className="text-xs text-ink-400 mt-1">Password &amp; 2FA</p>
            </Card>
          </Link>
          <Link href="/profile/privacy" className="block">
            <Card className="p-4 text-center hover:border-sky-300 transition-colors">
              <p className="text-sm font-medium text-ink-700">🛡️ Privacy</p>
              <p className="text-xs text-ink-400 mt-1">Data &amp; preferences</p>
            </Card>
          </Link>
        </div>
      </div>
    </MemberLayout>
  );
}