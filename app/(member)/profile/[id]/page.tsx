"use client";

import { useParams, useRouter } from "next/navigation";
import { MemberLayout } from "@/components/layout/memberLayout";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { PillarTag } from "@/components/pillarTag";
import { mockMembers } from "@/components/mock/data";

export default function MemberProfilePage() {
  const { id } = useParams();
  const router = useRouter();

  // Find the member by id (string)
  const member = mockMembers.find((m) => m.id === id);

  // Not found state
  if (!member) {
    return (
      <MemberLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-ink-900">Member Not Found</h1>
          <p className="text-ink-500 mt-2">
            The member you're looking for doesn't exist or has been removed.
          </p>
          <Button
            variant="secondary"
            className="mt-6"
            onClick={() => router.back()}
          >
            ← Go Back
          </Button>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700 transition-colors"
        >
          ← Back
        </button>

        {/* Profile card */}
        <Card className="p-6 space-y-6">
          {/* Header: Avatar + Name */}
          <div className="flex items-start gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-dawn-100 text-3xl font-bold text-dawn-700">
              {member.firstName[0]}{member.lastName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-2xl font-bold text-ink-900 truncate">
                {member.firstName} {member.lastName}
              </h1>
              <p className="text-sm text-ink-500">{member.memberNumber}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-block rounded-full bg-ink-100 px-2.5 py-0.5 text-xs font-medium text-ink-700">
                  {member.tier}
                </span>
                <span className="text-xs text-ink-400">•</span>
                <span className="text-sm text-ink-600">{member.chapter}</span>
              </div>
            </div>
          </div>

          {/* Contact button placeholder */}
          <div className="flex gap-3">
            <Button variant="secondary" className="gap-1">
              ✉️ Message
            </Button>
            {/* More actions could be added here */}
          </div>

          {/* Divider */}
          <hr className="border-ink-100" />

          {/* Details grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-xs uppercase tracking-wider text-ink-400">Email</span>
              <p className="font-medium text-ink-900 break-all">{member.email}</p>
            </div>
            <div>
              <span className="block text-xs uppercase tracking-wider text-ink-400">Chapter</span>
              <p className="font-medium text-ink-900">{member.chapter}</p>
            </div>
            <div>
              <span className="block text-xs uppercase tracking-wider text-ink-400">Tier</span>
              <p className="font-medium text-ink-900">{member.tier}</p>
            </div>
            <div>
              <span className="block text-xs uppercase tracking-wider text-ink-400">Joined</span>
              <p className="font-medium text-ink-900">
                {new Date(member.joinedAt).toLocaleDateString("en-KE", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Pillar Interests */}
          <div>
            <span className="block text-xs uppercase tracking-wider text-ink-400 mb-2">
              Pillar Interests
            </span>
            <div className="flex flex-wrap gap-2">
              {member.pillarInterest.length > 0 ? (
                member.pillarInterest.map((pillar) => (
                  <PillarTag 
                    key={pillar} 
                    pillar={pillar.toLowerCase() as "marketplace" | "governance" | "technology"} 
                  />
                ))
              ) : (
                <p className="text-sm text-ink-400">No interests specified.</p>
              )}
            </div>
          </div>

          {/* Bio */}
          <div>
            <span className="block text-xs uppercase tracking-wider text-ink-400 mb-1">
              Bio
            </span>
            <p className="text-ink-700 leading-relaxed">
              {member.bio || "This member hasn't written a bio yet."}
            </p>
          </div>
        </Card>
      </div>
    </MemberLayout>
  );
}