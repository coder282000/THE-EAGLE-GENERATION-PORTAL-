"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MemberLayout } from "@/components/layout/memberLayout";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Textarea } from "@/components/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/avatar";
import {
  mockGroups,
  Group,
  mockGroupMembers,
  GroupMember,
  mockMembers,
} from "@/components/mock/data";

// Helpers
const GROUP_TYPE_OPTIONS = [
  { value: "STUDY", label: "Study Group" },
  { value: "CHAPTER", label: "Chapter" },
  { value: "MENTORSHIP", label: "Mentorship" },
  { value: "INTEREST", label: "Interest Circle" },
];

const VISIBILITY_OPTIONS = [
  { value: "OPEN", label: "Open – anyone can join" },
  { value: "CLOSED", label: "Closed – request to join" },
  { value: "SECRET", label: "Secret – hidden from non-members" },
];

const ROLE_OPTIONS = [
  { value: "MEMBER", label: "Member" },
  { value: "MODERATOR", label: "Moderator" },
  { value: "ADMIN", label: "Admin" },
];

// ============================================================
// Member Management Component
// ============================================================

function MemberManagement({
  groupId,
  currentUserRole,
}: {
  groupId: string;
  currentUserRole: string;
}) {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 400));
      setMembers(mockGroupMembers.filter((gm) => gm.groupId === groupId));
      setIsLoading(false);
    };
    fetchMembers();
  }, [groupId]);

  const canManage = currentUserRole === "ADMIN" || currentUserRole === "MODERATOR";

  const handleRoleChange = (userId: string, newRole: string) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.userId === userId ? { ...m, role: newRole as GroupMember["role"] } : m
      )
    );
    // In real app, call API
  };

  const handleRemoveMember = (userId: string) => {
    if (confirm("Are you sure you want to remove this member from the group?")) {
      setMembers((prev) => prev.filter((m) => m.userId !== userId));
      // In real app, call API
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-2">
            <div className="h-10 w-10 rounded-full bg-ink-100 animate-pulse" />
            <div className="flex-1 space-y-1">
              <div className="h-4 w-32 bg-ink-100 animate-pulse" />
              <div className="h-3 w-24 bg-ink-100 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {members.length === 0 ? (
        <p className="text-sm text-ink-400">No members yet.</p>
      ) : (
        members.map((gm) => {
          const user = mockMembers.find((m) => m.id === gm.userId);
          if (!user) return null;
          const initials = user.firstName[0] + user.lastName[0];
          const isSelf = user.id === "1"; // mock current user
          const isAdmin = gm.role === "ADMIN";

          return (
            <div
              key={gm.userId}
              className="flex flex-wrap items-center gap-3 py-3 border-b border-ink-50 last:border-0"
            >
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
                  {isSelf && " (You)"}
                </p>
                <p className="text-xs text-ink-400">{user.email}</p>
              </div>
              {canManage && !isSelf ? (
                <div className="flex items-center gap-2">
                  <select
                    value={gm.role}
                    onChange={(e) => handleRoleChange(gm.userId, e.target.value)}
                    className="rounded-md border border-ink-200 px-2 py-1 text-xs bg-white"
                  >
                    {ROLE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-clay-500 hover:text-clay-600 px-2"
                    onClick={() => handleRemoveMember(gm.userId)}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <span className="text-xs font-medium text-ink-400 bg-ink-50 px-2 py-1 rounded-full">
                  {ROLE_OPTIONS.find((o) => o.value === gm.role)?.label || gm.role}
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
// Main Page Component
// ============================================================

export default function GroupSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [group, setGroup] = useState<Group | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<Group["type"]>("STUDY");
  const [visibility, setVisibility] = useState<Group["visibility"]>("OPEN");
  const [tags, setTags] = useState<string>("");

  // Permission check
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 500));

        const foundGroup = mockGroups.find((g) => g.id === groupId);
        if (!foundGroup) {
          setError("Group not found");
          setIsLoading(false);
          return;
        }

        setGroup(foundGroup);
        setName(foundGroup.name);
        setDescription(foundGroup.description);
        setType(foundGroup.type);
        setVisibility(foundGroup.visibility);
        setTags(foundGroup.tags?.join(", ") || "");

        // Check current user's role (mock: user '1' is logged in)
        const member = mockGroupMembers.find(
          (gm) => gm.groupId === groupId && gm.userId === "1"
        );
        setUserRole(member?.role || "MEMBER");

        setError(null);
      } catch (err) {
        setError("Failed to load group settings.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroup();
  }, [groupId]);

  // Permission: only admins and moderators can access settings
  const canEdit = userRole === "ADMIN" || userRole === "MODERATOR";

  const handleSave = async () => {
    if (!group) return;
    setIsSaving(true);
    setSuccess(false);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update group in mock data (in real app, call API)
      const updatedGroup: Group = {
        ...group,
        name,
        description,
        type,
        visibility,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      };

      // Find and update in mock array
      const index = mockGroups.findIndex((g) => g.id === groupId);
      if (index !== -1) {
        mockGroups[index] = updatedGroup;
      }

      setGroup(updatedGroup);
      setSuccess(true);

      // Reset success after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGroup = () => {
    if (
      confirm(
        "Are you sure you want to delete this group? This action cannot be undone."
      )
    ) {
      // In real app, call API to delete
      alert("Group deleted! (Mock)");
      router.push("/community/groups");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <MemberLayout>
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="h-6 w-24 bg-ink-100 animate-pulse rounded" />
          <Card className="p-6 space-y-4">
            <div className="h-7 w-32 bg-ink-100 animate-pulse" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <div className="h-4 w-20 bg-ink-100 animate-pulse" />
                  <div className="h-10 w-full bg-ink-100 animate-pulse rounded-md" />
                </div>
              ))}
            </div>
            <div className="h-10 w-28 bg-ink-100 animate-pulse rounded-md" />
          </Card>
        </div>
      </MemberLayout>
    );
  }

  // Error / Not found
  if (error || !group) {
    return (
      <MemberLayout>
        <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-12 text-center">
          <span className="text-4xl mb-4">🔒</span>
          <p className="text-lg text-ink-600">{error || "Group not found"}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/community/groups")}>
            Back to Groups
          </Button>
        </div>
      </MemberLayout>
    );
  }

  // Permission denied
  if (!canEdit) {
    return (
      <MemberLayout>
        <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-12 text-center">
          <span className="text-4xl mb-4">🚫</span>
          <p className="text-lg text-ink-600">You don't have permission to manage this group.</p>
          <p className="text-sm text-ink-400 mt-1">Only admins and moderators can access settings.</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push(`/community/groups/${groupId}`)}>
            Back to Group
          </Button>
        </div>
      </MemberLayout>
    );
  }

  // Populated state
  return (
    <MemberLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => router.push(`/community/groups/${groupId}`)}
              className="text-sm text-ink-400 hover:text-ink-600 transition-colors flex items-center gap-1"
            >
              ← Back to Group
            </button>
            <h1 className="font-display text-2xl font-semibold text-ink-900 mt-1">
              Group Settings
            </h1>
            <p className="text-sm text-ink-400">Manage group details and members.</p>
          </div>
        </div>

        {/* Success message */}
        {success && (
          <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">
            ✅ Settings saved successfully!
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="rounded-lg bg-clay-50 border border-clay-200 p-3 text-sm text-clay-700">
            ⚠️ {error}
          </div>
        )}

        {/* Settings Form */}
        <Card className="p-6 space-y-5">
          <h2 className="font-display text-sm font-semibold text-ink-900">Group Details</h2>

          <div className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="group-name" className="text-sm font-medium text-ink-700">
                Group Name
              </label>
              <Input
                id="group-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="group-description" className="text-sm font-medium text-ink-700">
                Description
              </label>
              <Textarea
                id="group-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="group-type" className="text-sm font-medium text-ink-700">
                  Type
                </label>
                <select
                  id="group-type"
                  value={type}
                  onChange={(e) => setType(e.target.value as Group["type"])}
                  className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm bg-white"
                >
                  {GROUP_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="group-visibility" className="text-sm font-medium text-ink-700">
                  Visibility
                </label>
                <select
                  id="group-visibility"
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as Group["visibility"])}
                  className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm bg-white"
                >
                  {VISIBILITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="group-tags" className="text-sm font-medium text-ink-700">
                Tags (comma separated)
              </label>
              <Input
                id="group-tags"
                placeholder="e.g., leadership, tech, governance"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-ink-400">
                Tags help members discover your group. Separate with commas.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-3 border-t border-ink-100">
            <Button variant="primary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving...
                </span>
              ) : (
                "Save Settings"
              )}
            </Button>
            <Button variant="outline" onClick={() => router.push(`/community/groups/${groupId}`)}>
              Cancel
            </Button>
          </div>
        </Card>

        {/* Member Management */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold text-ink-900">Members</h2>
            <span className="text-xs text-ink-400">
              {mockGroupMembers.filter((gm) => gm.groupId === groupId).length} members
            </span>
          </div>
          <MemberManagement groupId={groupId} currentUserRole={userRole} />
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 border-clay-200 bg-clay-50/30">
          <h2 className="font-display text-sm font-semibold text-clay-700">Danger Zone</h2>
          <p className="text-sm text-ink-500 mt-1">
            Deleting a group is permanent and cannot be undone. All posts and member data will be lost.
          </p>
          <Button
            variant="danger"
            size="sm"
            className="mt-3"
            onClick={handleDeleteGroup}
          >
            Delete Group
          </Button>
        </Card>
      </div>
    </MemberLayout>
  );
}
