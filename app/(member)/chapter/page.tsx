"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { MemberLayout } from "@/components/layout/memberLayout";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { PillarTag } from "@/components/pillarTag";
import {
  mockChapters,
  mockMembers,
  chapterActivities,
  Member,
  ChapterActivity,
} from "@/components/mock/data";

// Simple icon components instead of @heroicons/react
const UserGroupIcon = () => <span className="text-xl">👥</span>;
const MapPinIcon = () => <span className="text-sm">📍</span>;
const UserIcon = () => <span className="text-xl">👤</span>;
const BuildingOfficeIcon = () => <span className="text-xl">🏛️</span>;

// Simulate current user (Grace) – in production, this would come from auth
const CURRENT_USER: Member = mockMembers[0];

type SortOption = "joinDateDesc" | "tierDesc";

export default function ChapterPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [chapter, setChapter] = useState<typeof mockChapters[0] | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [activities, setActivities] = useState<ChapterActivity[]>([]);
  const [isLeader, setIsLeader] = useState(false);

  // Pagination & sorting state
  const [visibleCount, setVisibleCount] = useState(6);
  const [sortBy, setSortBy] = useState<SortOption>("joinDateDesc");

  // Load data
  useEffect(() => {
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 400));

      const foundChapter = mockChapters.find(
        (c) => c.code === CURRENT_USER.chapter
      );

      if (foundChapter) {
        setChapter(foundChapter);

        const chapterMembers = mockMembers.filter(
          (m) => m.chapter === CURRENT_USER.chapter
        );
        setMembers(chapterMembers);

        // Check if current user is the leader
        setIsLeader(
          foundChapter.leader === `${CURRENT_USER.firstName} ${CURRENT_USER.lastName}`
        );

        // Filter activities for this chapter
        const chapterActs = chapterActivities.filter(
          (act) => act.chapterCode === foundChapter.code
        );
        setActivities(chapterActs);
      }

      setIsLoading(false);
    };

    loadData();
  }, []);

  // Sorting logic
  const sortedMembers = useMemo(() => {
    const sorted = [...members];
    if (sortBy === "joinDateDesc") {
      sorted.sort(
        (a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()
      );
    } else if (sortBy === "tierDesc") {
      const tierOrder = { Eagle: 0, Rising: 1, Nestling: 2 };
      sorted.sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier]);
    }
    return sorted;
  }, [members, sortBy]);

  // Pagination
  const paginatedMembers = useMemo(() => {
    return sortedMembers.slice(0, visibleCount);
  }, [sortedMembers, visibleCount]);

  const hasMore = visibleCount < sortedMembers.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  // Loading state
  if (isLoading) {
    return (
      <MemberLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-dawn-400 border-t-transparent mx-auto" />
            <p className="mt-4 text-sm text-ink-500">Loading chapter details...</p>
          </div>
        </div>
      </MemberLayout>
    );
  }

  // Chapter not found
  if (!chapter) {
    return (
      <MemberLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <p className="text-4xl mb-4">🏛️</p>
          <h1 className="text-2xl font-bold text-ink-900">Chapter Not Found</h1>
          <p className="text-ink-500 mt-2">
            You are not assigned to any chapter. Please contact support.
          </p>
        </div>
      </MemberLayout>
    );
  }

  // Stats
  const stats = [
    {
      label: "Members",
      value: chapter.memberCount,
      icon: UserGroupIcon,
      color: "text-sky-600 bg-sky-50",
    },
    {
      label: "Leader",
      value: chapter.leader || "Not assigned",
      icon: UserIcon,
      color: "text-dawn-600 bg-dawn-50",
    },
    {
      label: "Type",
      value: chapter.type === "CAMPUS" ? "Campus" : "Professional",
      icon: BuildingOfficeIcon,
      color: "text-clay-600 bg-clay-50",
    },
  ];

  return (
    <MemberLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900">
            {chapter.name}
          </h1>
          <p className="mt-1 flex items-center gap-1 text-sm text-ink-500">
            <MapPinIcon />
            {chapter.location} • {chapter.type === "CAMPUS" ? "Campus" : "Professional"} Chapter
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="flex items-center gap-4 p-4">
              <div className={`rounded-full p-2.5 ${stat.color}`}>
                <stat.icon />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-ink-400">
                  {stat.label}
                </p>
                <p className="font-display text-lg font-semibold text-ink-900">
                  {stat.value}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* About Section */}
        <Card className="p-5">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-ink-400">
            About This Chapter
          </h2>
          <p className="mt-2 text-ink-700 leading-relaxed">
            {chapter.description || "No description provided."}
          </p>
        </Card>

        {/* Member Roster with Sorting & Pagination */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-ink-400">
              Members ({members.length})
            </h2>
            <div className="flex items-center gap-2">
              <label htmlFor="sortSelect" className="text-xs text-ink-500">
                Sort by:
              </label>
              <select
                id="sortSelect"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="rounded-md border border-ink-200 bg-white px-2 py-1 text-sm text-ink-700 focus:border-sky-500 focus:outline-none"
              >
                <option value="joinDateDesc">Newest</option>
                <option value="tierDesc">Tier (Eagle → Nestling)</option>
              </select>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {paginatedMembers.length === 0 ? (
              <p className="text-center text-ink-500 py-8">
                No members in this chapter yet.
              </p>
            ) : (
              paginatedMembers.map((member) => {
                const isCurrentUser = member.id === CURRENT_USER.id;
                return (
                  <Link
                    key={member.id}
                    href={`/profile/${member.id}`}
                    className={`block rounded-lg border p-3 transition-all hover:shadow-md ${
                      isCurrentUser
                        ? "border-dawn-300 bg-dawn-50 ring-1 ring-dawn-200"
                        : "border-ink-100 bg-white hover:border-ink-300"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100 font-bold text-sky-700">
                          {member.firstName[0]}{member.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-ink-900">
                            {member.firstName} {member.lastName}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs font-normal text-dawn-600">
                                (You)
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-ink-500">{member.memberNumber}</p>
                          <p className="text-xs text-ink-400">
                            Joined {new Date(member.joinedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-block rounded-full bg-ink-100 px-2.5 py-0.5 text-xs font-medium text-ink-700">
                          {member.tier}
                        </span>
                        {member.pillarInterest.slice(0, 2).map((pillar) => (
                          <PillarTag 
                            key={pillar} 
                            pillar={pillar.toLowerCase() as "marketplace" | "governance" | "technology"} 
                          />
                        ))}
                        {member.pillarInterest.length > 2 && (
                          <span className="text-xs text-ink-400">
                            +{member.pillarInterest.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          {/* Load More button */}
          {hasMore && (
            <div className="mt-4 text-center">
              <Button variant="secondary" onClick={handleLoadMore}>
                Load More ({sortedMembers.length - visibleCount} remaining)
              </Button>
            </div>
          )}
        </div>

        {/* Activity Feed */}
        {activities.length > 0 && (
          <div>
            <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-ink-400">
              Recent Activity
            </h2>
            <Card className="mt-4 p-5 space-y-3">
              {activities.map((act) => (
                <div
                  key={act.id}
                  className="flex items-start gap-3 border-b border-ink-100 last:border-0 pb-3 last:pb-0"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ink-900">{act.title}</p>
                    {act.description && (
                      <p className="text-sm text-ink-600">{act.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-ink-400">
                      <span>{act.actor}</span>
                      <span>•</span>
                      <span>
                        {new Date(act.timestamp).toLocaleDateString("en-KE", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="inline-block capitalize bg-ink-50 px-1.5 py-0.5 rounded">
                        {act.type.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* Leader Actions */}
        {isLeader && (
          <div className="flex flex-wrap gap-3 border-t border-ink-100 pt-6">
            <Link href="/chapter/manage">
              <Button variant="primary">Manage Chapter</Button>
            </Link>
            <Link href="/announcements/new?chapter=true">
              <Button variant="secondary">Send Announcement</Button>
            </Link>
          </div>
        )}
      </div>
    </MemberLayout>
  );
}
