"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MemberLayout } from "@/components/layout/memberLayout";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { PillarTag } from "@/components/pillarTag";
import { mockMembers } from "@/components/mock/data";

// Tier filter options
const TIER_FILTERS = [
  { value: "all", label: "All" },
  { value: "Eagle", label: "🦅 Eagle" },
  { value: "Rising", label: "⬆️ Rising" },
  { value: "Nestling", label: "🐣 Nestling" },
] as const;

export default function DirectoryPage() {
  const [search, setSearch] = useState("");
  const [activeTier, setActiveTier] = useState<"all" | "Eagle" | "Rising" | "Nestling">("all");
  const [isLoading] = useState(false);

  // Filter members based on search + tier
  const filteredMembers = useMemo(() => {
    let result = mockMembers;

    if (activeTier !== "all") {
      result = result.filter((m) => m.tier === activeTier);
    }

    if (search.trim()) {
      const query = search.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.firstName.toLowerCase().includes(query) ||
          m.lastName.toLowerCase().includes(query) ||
          m.email.toLowerCase().includes(query) ||
          m.memberNumber.toLowerCase().includes(query) ||
          m.chapter.toLowerCase().includes(query)
      );
    }

    return result;
  }, [search, activeTier]);

  if (isLoading) {
    return (
      <MemberLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-dawn-400 border-t-transparent mx-auto" />
            <p className="mt-4 text-sm text-ink-500">Loading members...</p>
          </div>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900">
            Member Directory
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Connect with fellow Eagles across East Africa.
          </p>
        </div>

        {/* Search + Filters */}
        <div className="space-y-4">
          {/* Custom Search Input with icon */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-ink-700">
              Search
            </label>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-ink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                id="search"
                type="text"
                placeholder="Search by name, email, member number, or chapter"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border border-ink-200 py-2 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-ink-300 focus:border-sky-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-ink-400 mr-1">
              Tier:
            </span>
            {TIER_FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setActiveTier(filter.value)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                  activeTier === filter.value
                    ? "bg-ink-900 text-white shadow-sm"
                    : "bg-ink-100 text-ink-700 hover:bg-ink-200"
                }`}
                aria-pressed={activeTier === filter.value}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <p className="text-sm text-ink-400">
            {filteredMembers.length} member{filteredMembers.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* Member Grid */}
        {filteredMembers.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-4xl mb-3">🔍</p>
            <h3 className="font-display text-lg font-semibold text-ink-900">
              No members found
            </h3>
            <p className="mt-1 text-sm text-ink-500">
              Try adjusting your search or filter criteria.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredMembers.map((member) => (
              <Link
                key={member.id}
                href={`/profile/${member.id}`}
                className="group block transition-all duration-200 hover:-translate-y-1"
              >
                <Card className="h-full p-5 transition-shadow group-hover:shadow-lg">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-dawn-100 text-lg font-bold text-dawn-700">
                      {member.firstName[0]}
                      {member.lastName[0]}
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <p className="font-display font-semibold text-ink-900">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-xs text-ink-500">{member.memberNumber}</p>
                      <p className="mt-0.5 text-sm truncate text-ink-600">
                        {member.email}
                      </p>
                      <p className="mt-1 text-xs text-ink-400">
                        🏛️ {member.chapter}
                      </p>

                      {/* Badges */}
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className="inline-block rounded-full bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-700">
                          {member.tier}
                        </span>
                        {member.pillarInterest.map((pillar) => (
                          <PillarTag 
                            key={pillar} 
                            pillar={pillar.toLowerCase() as "marketplace" | "governance" | "technology"} 
                          />
                        ))}
                      </div>
                    </div>

                    {/* Chevron hint */}
                    <svg
                      className="mt-1 h-4 w-4 shrink-0 text-ink-300 transition-transform group-hover:translate-x-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MemberLayout>
  );
}