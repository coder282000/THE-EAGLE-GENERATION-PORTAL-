"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MemberLayout } from "@/components/layout/memberLayout";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { mockGroups, Group, mockGroupMembers, GroupMember, mockGroupPosts, GroupPost } from "@/components/mock/data";
import { mockMembers } from "@/components/mock/data";
import { formatDistanceToNow } from "date-fns";

type TabValue = "about" | "members" | "posts" | "settings";

// Helper: group type labels
const GROUP_TYPE_LABELS: Record<string, string> = {
  STUDY: "Study Group",
  CHAPTER: "Chapter",
  MENTORSHIP: "Mentorship",
  INTEREST: "Interest Circle",
};

const VISIBILITY_LABELS: Record<string, { label: string; color: string }> = {
  OPEN: { label: "Open", color: "bg-green-100 text-green-700" },
  CLOSED: { label: "Closed", color: "bg-amber-100 text-amber-700" },
  SECRET: { label: "Secret", color: "bg-clay-100 text-clay-700" },
};

const GROUP_ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  MODERATOR: "Moderator",
  MEMBER: "Member",
};

// ============================================================
// Member List Component
// ============================================================

function MemberList({ groupId }: { groupId: string }) {
  const members = mockGroupMembers.filter((gm) => gm.groupId === groupId);
  
  return (
    <div className="space-y-3">
      {members.length === 0 ? (
        <p className="text-sm text-ink-400">No members yet.</p>
      ) : (
        members.map((gm) => {
          const user = mockMembers.find((m) => m.id === gm.userId);
          if (!user) return null;
          const initials = user.firstName[0] + user.lastName[0];
          return (
            <div key={gm.userId} className="flex items-center gap-3 py-2 border-b border-ink-50 last:border-0">
              <Avatar className="h-10 w-10">
                {user.avatar ? (
                  <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                ) : (
                  <AvatarFallback className="bg-dawn-100 text-dawn-700 text-sm font-medium">
                    {initials}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-ink-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-ink-400">
                  {GROUP_ROLE_LABELS[gm.role] || "Member"} • Joined {formatDistanceToNow(new Date(gm.joinedAt), { addSuffix: true })}
                </p>
              </div>
              {gm.role === "ADMIN" && (
                <span className="text-[10px] font-medium bg-dawn-100 text-dawn-700 px-2 py-0.5 rounded-full">
                  Admin
                </span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

// ============================================================
// Group Post Component (simplified for group feed)
// ============================================================

function GroupPostItem({ post }: { post: GroupPost }) {
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
  const initials = post.author.firstName[0] + post.author.lastName[0];

  return (
    <div className="border-b border-ink-100 last:border-0 py-4">
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          {post.author.avatar ? (
            <AvatarImage src={post.author.avatar} alt={`${post.author.firstName} ${post.author.lastName}`} />
          ) : (
            <AvatarFallback className="bg-ink-100 text-ink-700 text-xs font-medium">
              {initials}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm text-ink-900">
              {post.author.firstName} {post.author.lastName}
            </span>
            {post.isPinned && (
              <span className="text-[10px] font-medium bg-dawn-100 text-dawn-700 px-2 py-0.5 rounded-full">
                📌 Pinned
              </span>
            )}
            <span className="text-xs text-ink-400">• {timeAgo}</span>
          </div>
          <p className="text-sm text-ink-800 mt-1">{post.content}</p>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-xs text-ink-400">❤️ {post.likes}</span>
            <span className="text-xs text-ink-400">💬 {post.comments}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Main Page Component
// ============================================================

export default function GroupHomePage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [group, setGroup] = useState<Group | null>(null);
  const [posts, setPosts] = useState<GroupPost[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabValue>("posts");

  // Fetch group data
  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 600));

        const foundGroup = mockGroups.find((g) => g.id === groupId);
        if (!foundGroup) {
          setError("Group not found");
          setIsLoading(false);
          return;
        }
        setGroup(foundGroup);

        // Check if current user is a member (mock: user '1' is logged in)
        const isUserMember = mockGroupMembers.some(
          (gm) => gm.groupId === groupId && gm.userId === "1"
        );
        setIsMember(isUserMember);

        // Get group posts
        const groupPosts = mockGroupPosts.filter((p) => p.groupId === groupId);
        setPosts(groupPosts);

        setError(null);
      } catch (err) {
        setError("Failed to load group. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroupData();
  }, [groupId]);

  // Handle join/leave
  const handleToggleMembership = () => {
    if (isMember) {
      if (confirm("Are you sure you want to leave this group?")) {
        setIsMember(false);
        // In real app, call API to leave
        alert("You have left the group. (Mock)");
      }
    } else {
      setIsMember(true);
      // In real app, call API to join
      alert("You have joined the group! (Mock)");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <MemberLayout>
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 bg-ink-100 rounded animate-pulse" />
            <div className="h-6 w-32 bg-ink-100 animate-pulse rounded" />
          </div>
          <Card className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="h-7 w-48 bg-ink-100 animate-pulse rounded" />
                <div className="h-4 w-24 bg-ink-100 animate-pulse rounded" />
                <div className="h-4 w-full bg-ink-100 animate-pulse" />
                <div className="h-4 w-3/4 bg-ink-100 animate-pulse" />
              </div>
              <div className="h-10 w-28 bg-ink-100 animate-pulse rounded-md" />
            </div>
            <div className="flex gap-4">
              <div className="h-8 w-20 bg-ink-100 animate-pulse rounded-full" />
              <div className="h-8 w-20 bg-ink-100 animate-pulse rounded-full" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="h-8 w-24 bg-ink-100 animate-pulse rounded" />
            <div className="space-y-3 mt-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-ink-100 animate-pulse" />
                  <div className="flex-1 space-y-1">
                    <div className="h-4 w-32 bg-ink-100 animate-pulse" />
                    <div className="h-3 w-24 bg-ink-100 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </MemberLayout>
    );
  }

  // Error state
  if (error || !group) {
    return (
      <MemberLayout>
        <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-12 text-center">
          <span className="text-4xl mb-4">🔍</span>
          <p className="text-lg text-ink-600">{error || "Group not found"}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/community/groups")}>
            Back to Groups
          </Button>
        </div>
      </MemberLayout>
    );
  }

  // Populated state
  const visibilityInfo = VISIBILITY_LABELS[group.visibility] || VISIBILITY_LABELS.OPEN;
  const memberCount = mockGroupMembers.filter((gm) => gm.groupId === group.id).length;

  return (
    <MemberLayout>
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Back navigation */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-ink-400 hover:text-ink-600 transition-colors"
        >
          ← Back to Groups
        </button>

        {/* Group Header */}
        <Card className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-display text-2xl font-semibold text-ink-900">
                  {group.name}
                </h1>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${visibilityInfo.color}`}>
                  {visibilityInfo.label}
                </span>
              </div>
              <p className="text-sm text-ink-500 mt-1">{group.description}</p>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <span className="text-xs text-ink-400">
                  👥 {memberCount} members
                </span>
                <span className="text-xs text-ink-400">•</span>
                <span className="text-xs font-medium text-ink-500 px-2 py-0.5 bg-ink-50 rounded-full">
                  {GROUP_TYPE_LABELS[group.type] || group.type}
                </span>
                {group.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-ink-400 px-2 py-0.5 bg-ink-50 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
            <Button
              variant={isMember ? "outline" : "primary"}
              size="sm"
              onClick={handleToggleMembership}
              className="shrink-0"
            >
              {isMember ? "Leave Group" : "Join Group"}
            </Button>
          </div>
        </Card>

        {/* Tabs */}
        <Card className="p-4">
          <Tabs
            defaultValue="posts"
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as TabValue)}
            className="space-y-4"
          >
            <TabsList className="border-b border-ink-100 pb-0">
              <TabsTrigger value="posts" className="text-sm">
                Posts
              </TabsTrigger>
              <TabsTrigger value="about" className="text-sm">
                About
              </TabsTrigger>
              <TabsTrigger value="members" className="text-sm">
                Members ({memberCount})
              </TabsTrigger>
            </TabsList>

            {/* Posts Tab */}
            <TabsContent value="posts" className="mt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-sm font-semibold text-ink-900">
                  Group Activity
                </h3>
                <Button variant="primary" size="sm">
                  + New Post
                </Button>
              </div>
              {posts.length === 0 ? (
                <p className="text-sm text-ink-400 text-center py-8">No posts in this group yet.</p>
              ) : (
                <div className="divide-y divide-ink-100">
                  {posts.map((post) => (
                    <GroupPostItem key={post.id} post={post} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* About Tab */}
            <TabsContent value="about" className="mt-4 space-y-4">
              <div>
                <h4 className="text-sm font-medium text-ink-900">Description</h4>
                <p className="text-sm text-ink-600 mt-1">{group.description}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-ink-900">Type</h4>
                  <p className="text-sm text-ink-600">{GROUP_TYPE_LABELS[group.type] || group.type}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-ink-900">Visibility</h4>
                  <p className="text-sm text-ink-600">{visibilityInfo.label}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-ink-900">Members</h4>
                  <p className="text-sm text-ink-600">{memberCount}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-ink-900">Created</h4>
                  <p className="text-sm text-ink-600">
                    {formatDistanceToNow(new Date(group.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
              {group.tags && group.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-ink-900">Tags</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {group.tags.map((tag) => (
                      <span key={tag} className="text-xs text-ink-500 px-2 py-1 bg-ink-50 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Members Tab */}
            <TabsContent value="members" className="mt-4">
              <MemberList groupId={group.id} />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </MemberLayout>
  );
}