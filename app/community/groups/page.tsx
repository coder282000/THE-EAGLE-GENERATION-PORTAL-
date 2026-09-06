"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { MemberLayout } from "@/components/layout/memberLayout";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { mockGroups, Group, mockGroupMembers } from "@/components/mock/data";

type FilterType = "all" | "STUDY" | "CHAPTER" | "MENTORSHIP" | "INTEREST";
type VisibilityType = "all" | "OPEN" | "CLOSED" | "SECRET";

const GROUP_TYPE_LABELS: Record<string, string> = {
  STUDY: "Study Group",
  CHAPTER: "Chapter",
  MENTORSHIP: "Mentorship",
  INTEREST: "Interest Circle",
};

const VISIBILITY_LABELS: Record<string, string> = {
  OPEN: "Open",
  CLOSED: "Closed",
  SECRET: "Secret",
};

const VISIBILITY_COLORS: Record<string, string> = {
  OPEN: "bg-green-100 text-green-700",
  CLOSED: "bg-amber-100 text-amber-700",
  SECRET: "bg-clay-100 text-clay-700",
};

function GroupCard({ group }: { group: Group }) {
  const initials = group.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Check if current user (mock: user '1') is an admin of this group
  const isAdmin = mockGroupMembers.some(
    (gm) => gm.groupId === group.id && gm.userId === "1" && gm.role === "ADMIN"
  );

  return (
    <Card className="border border-ink-100 shadow-sm hover:shadow-md transition-shadow p-5">
      <div className="flex items-start gap-4">
        {/* Avatar / Icon */}
        <div className="h-14 w-14 shrink-0 rounded-lg bg-dawn-100 flex items-center justify-center text-2xl font-bold text-dawn-700">
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/community/groups/${group.id}`}>
              <h3 className="font-display font-semibold text-ink-900 hover:underline">
                {group.name}
              </h3>
            </Link>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  VISIBILITY_COLORS[group.visibility] || "bg-ink-100 text-ink-600"
                }`}
              >
                {VISIBILITY_LABELS[group.visibility] || group.visibility}
              </span>
              {isAdmin && (
                <Link
                  href={`/community/groups/${group.id}/settings`}
                  className="text-ink-400 hover:text-ink-600 transition-colors"
                  title="Group Settings"
                >
                  ⚙️
                </Link>
              )}
            </div>
          </div>

          <p className="text-sm text-ink-500 mt-1 line-clamp-2">{group.description}</p>

          <div className="flex flex-wrap items-center gap-3 mt-3">
            <span className="text-xs text-ink-400">
              👥 {group.memberCount} members
            </span>
            <span className="text-xs text-ink-400">•</span>
            <span className="text-xs font-medium text-ink-500 px-2 py-0.5 bg-ink-50 rounded-full">
              {GROUP_TYPE_LABELS[group.type] || group.type}
            </span>
            {group.tags?.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-xs text-ink-400 px-2 py-0.5 bg-ink-50 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function GroupsBrowsePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterVisibility, setFilterVisibility] = useState<VisibilityType>("all");
  const [error, setError] = useState<string | null>(null);

  // Fetch groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 600));
        setGroups(mockGroups);
        setError(null);
      } catch (err) {
        setError("Failed to load groups. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchGroups();
  }, []);

  // Filter groups
  const filteredGroups = useMemo(() => {
    let result = groups;

    // Type filter
    if (filterType !== "all") {
      result = result.filter((g) => g.type === filterType);
    }

    // Visibility filter
    if (filterVisibility !== "all") {
      result = result.filter((g) => g.visibility === filterVisibility);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          g.tags?.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    return result;
  }, [groups, filterType, filterVisibility, searchQuery]);

  // Loading state
  if (isLoading) {
    return (
      <MemberLayout>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="font-display text-2xl font-semibold text-ink-900">Groups</h1>
            <Button variant="primary" size="sm" disabled>
              + New Group
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Input placeholder="Search groups..." className="max-w-xs" disabled />
            <div className="h-10 w-40 bg-ink-100 rounded animate-pulse" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-5 border border-ink-100">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-lg bg-ink-100 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-32 bg-ink-100 animate-pulse" />
                    <div className="h-4 w-full bg-ink-100 animate-pulse" />
                    <div className="flex gap-2">
                      <div className="h-5 w-16 bg-ink-100 animate-pulse rounded-full" />
                      <div className="h-5 w-16 bg-ink-100 animate-pulse rounded-full" />
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

  // Error state
  if (error) {
    return (
      <MemberLayout>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <span className="text-4xl mb-4">⚠️</span>
          <p className="text-lg text-ink-600">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </MemberLayout>
    );
  }

  // Empty state
  if (filteredGroups.length === 0) {
    return (
      <MemberLayout>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-semibold text-ink-900">Groups</h1>
              <p className="text-sm text-ink-400">Discover and join groups that match your interests.</p>
            </div>
            <Link href="/community/groups/new">
              <Button variant="primary" size="sm">
                + New Group
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Input
              placeholder="Search groups..."
              className="max-w-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <select
                className="rounded-md border border-ink-200 px-3 py-2 text-sm bg-white"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FilterType)}
              >
                <option value="all">All Types</option>
                <option value="STUDY">Study Group</option>
                <option value="CHAPTER">Chapter</option>
                <option value="MENTORSHIP">Mentorship</option>
                <option value="INTEREST">Interest Circle</option>
              </select>
              <select
                className="rounded-md border border-ink-200 px-3 py-2 text-sm bg-white"
                value={filterVisibility}
                onChange={(e) => setFilterVisibility(e.target.value as VisibilityType)}
              >
                <option value="all">All Visibility</option>
                <option value="OPEN">Open</option>
                <option value="CLOSED">Closed</option>
                <option value="SECRET">Secret</option>
              </select>
            </div>
          </div>
          <Card className="border border-dashed border-ink-200 p-8 text-center">
            <p className="text-ink-500">No groups found.</p>
            <p className="text-sm text-ink-400 mt-1">
              {searchQuery
                ? "Try adjusting your search or filters."
                : "Be the first to create a group!"}
            </p>
            {!searchQuery && filterType === "all" && filterVisibility === "all" && (
              <Link href="/community/groups/new">
                <Button variant="primary" size="sm" className="mt-4">
                  + Create Group
                </Button>
              </Link>
            )}
          </Card>
        </div>
      </MemberLayout>
    );
  }

  // Populated state
  return (
    <MemberLayout>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink-900">Groups</h1>
            <p className="text-sm text-ink-400">Discover and join groups that match your interests.</p>
          </div>
          <Link href="/community/groups/new">
            <Button variant="primary" size="sm">
              + New Group
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search groups..."
            className="max-w-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <select
              className="rounded-md border border-ink-200 px-3 py-2 text-sm bg-white"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FilterType)}
            >
              <option value="all">All Types</option>
              <option value="STUDY">Study Group</option>
              <option value="CHAPTER">Chapter</option>
              <option value="MENTORSHIP">Mentorship</option>
              <option value="INTEREST">Interest Circle</option>
            </select>
            <select
              className="rounded-md border border-ink-200 px-3 py-2 text-sm bg-white"
              value={filterVisibility}
              onChange={(e) => setFilterVisibility(e.target.value as VisibilityType)}
            >
              <option value="all">All Visibility</option>
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
              <option value="SECRET">Secret</option>
            </select>
          </div>
          <span className="ml-auto text-sm text-ink-400">
            {filteredGroups.length} group{filteredGroups.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Groups list */}
        <div className="space-y-3">
          {filteredGroups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      </div>
    </MemberLayout>
  );
}
