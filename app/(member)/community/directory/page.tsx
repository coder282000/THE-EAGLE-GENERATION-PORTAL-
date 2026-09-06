"use client";

import { useState, useEffect, useMemo } from "react";
import { MemberLayout } from "@/components/layout/memberLayout";
import { TextInput } from "@/components/input";
import { Select } from "@/components/select";
import { Button } from "@/components/button";
import { mockMembers, type Member } from "@/components/mock/data";

type FilterState = {
  search: string;
  chapter: string;
  tier: string;
  pillarInterest: string;
  status: string;
};

export default function MemberDirectoryPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    chapter: "",
    tier: "",
    pillarInterest: "",
    status: "",
  });

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setMembers(mockMembers);
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Extract unique filter options from members
  const filterOptions = useMemo(() => {
    const chapters = Array.from(new Set(mockMembers.map((m) => m.chapter))).sort();
    const tiers = Array.from(new Set(mockMembers.map((m) => m.tier))).sort();
    const pillarInterests = Array.from(
      new Set(mockMembers.flatMap((m) => m.pillarInterest))
    ).sort();
    const statuses = Array.from(new Set(mockMembers.map((m) => m.status))).sort();
    return { chapters, tiers, pillarInterests, statuses };
  }, []);

  // Filter members
  const filteredMembers = useMemo(() => {
    let result = members;

    // Search
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.firstName.toLowerCase().includes(q) ||
          m.lastName.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.memberNumber.toLowerCase().includes(q)
      );
    }

    // Chapter
    if (filters.chapter) {
      result = result.filter((m) => m.chapter === filters.chapter);
    }

    // Tier
    if (filters.tier) {
      result = result.filter((m) => m.tier === filters.tier);
    }

    // Pillar Interest
    if (filters.pillarInterest) {
      result = result.filter((m) =>
        m.pillarInterest.includes(filters.pillarInterest as any)
      );
    }

    // Status
    if (filters.status) {
      result = result.filter((m) => m.status === filters.status);
    }

    return result;
  }, [members, filters]);

  // Reset filters
  const handleReset = () => {
    setFilters({
      search: "",
      chapter: "",
      tier: "",
      pillarInterest: "",
      status: "",
    });
  };

  // Update a single filter
  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <MemberLayout>
      <div className="container-portal py-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold text-ink-900">
            Member Directory
          </h1>
          <p className="text-ink-500 mt-1">
            Connect with fellow Eagles across chapters and pillars.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-paper border border-ink-100 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search */}
            <TextInput
              id="directory-search"
              label="Search"
              placeholder="Name, email, or member number..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="w-full"
            />

            {/* Chapter */}
            <Select
              id="filter-chapter"
              label="Chapter"
              value={filters.chapter}
              onChange={(e) => updateFilter("chapter", e.target.value)}
              options={[
                { value: "", label: "All Chapters" },
                ...filterOptions.chapters.map((ch) => ({ value: ch, label: ch })),
              ]}
            />

            {/* Tier */}
            <Select
              id="filter-tier"
              label="Tier"
              value={filters.tier}
              onChange={(e) => updateFilter("tier", e.target.value)}
              options={[
                { value: "", label: "All Tiers" },
                ...filterOptions.tiers.map((t) => ({ value: t, label: t })),
              ]}
            />

            {/* Pillar Interest */}
            <Select
              id="filter-pillar"
              label="Pillar Interest"
              value={filters.pillarInterest}
              onChange={(e) => updateFilter("pillarInterest", e.target.value)}
              options={[
                { value: "", label: "All Pillars" },
                ...filterOptions.pillarInterests.map((p) => ({ value: p, label: p })),
              ]}
            />

            {/* Status */}
            <Select
              id="filter-status"
              label="Status"
              value={filters.status}
              onChange={(e) => updateFilter("status", e.target.value)}
              options={[
                { value: "", label: "All Statuses" },
                ...filterOptions.statuses.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) })),
              ]}
            />

            {/* Reset Button */}
            <div className="flex items-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleReset}
                className="w-full"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Results count */}
        {!isLoading && (
          <p className="text-sm text-ink-500 mb-4">
            {filteredMembers.length} member{filteredMembers.length !== 1 ? "s" : ""} found
          </p>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" aria-live="polite">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border border-ink-100 rounded-lg p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-ink-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-ink-200 rounded w-3/4" />
                    <div className="h-3 bg-ink-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <div className="h-3 bg-ink-100 rounded w-full" />
                  <div className="h-3 bg-ink-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-clay-600">Something went wrong loading members.</p>
            <Button variant="secondary" size="sm" onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-ink-500 text-lg">No members match your filters.</p>
            <p className="text-sm text-ink-400 mt-2">
              Try adjusting your search or filter criteria.
            </p>
            <Button variant="secondary" size="sm" onClick={handleReset} className="mt-4">
              Reset Filters
            </Button>
          </div>
        )}

        {/* Populated State */}
        {!isLoading && !error && filteredMembers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="border border-ink-100 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-dawn-200 flex items-center justify-center text-ink-700 font-semibold flex-shrink-0">
                    {member.firstName[0]}{member.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-ink-900 truncate">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="text-sm text-ink-500 truncate">{member.memberNumber}</p>
                    <p className="text-xs text-ink-400 truncate">{member.email}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <span className="text-xs bg-paper text-ink-600 px-2 py-0.5 rounded border border-ink-100">
                        {member.chapter}
                      </span>
                      <span className="text-xs bg-paper text-ink-600 px-2 py-0.5 rounded border border-ink-100">
                        {member.tier}
                      </span>
                      {member.pillarInterest.slice(0, 2).map((pillar) => (
                        <span key={pillar} className="text-xs bg-dawn-100 text-ink-700 px-2 py-0.5 rounded">
                          {pillar}
                        </span>
                      ))}
                      {member.pillarInterest.length > 2 && (
                        <span className="text-xs text-ink-400">+{member.pillarInterest.length - 2}</span>
                      )}
                    </div>
                  </div>
                </div>
                {member.bio && (
                  <p className="text-sm text-ink-600 mt-2 line-clamp-2">{member.bio}</p>
                )}
                <div className="mt-3 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.location.href = `/profile/${member.id}`}
                  >
                    View Profile →
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MemberLayout>
  );
}
