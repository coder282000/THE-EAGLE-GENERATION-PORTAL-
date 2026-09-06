"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MemberLayout } from "@/components/layout/memberLayout";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Textarea } from "@/components/textarea";
import { mockGroups, Group } from "@/components/mock/data";

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

export default function CreateGroupPage() {
  const router = useRouter();

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<Group["type"]>("STUDY");
  const [visibility, setVisibility] = useState<Group["visibility"]>("OPEN");
  const [tagsInput, setTagsInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validation
  const isValid = name.trim().length > 0 && description.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Build new group object
      const newGroup: Group = {
        id: `group-${Date.now()}`,
        name: name.trim(),
        description: description.trim(),
        type,
        visibility,
        chapterId: undefined, // optional, could be set based on context
        createdBy: "1", // mock current user ID
        createdAt: new Date().toISOString(),
        memberCount: 1, // creator is the first member
        tags: tagsInput
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        coverImage: undefined,
      };

      // Add to mock data (in real app, API would handle this)
      mockGroups.unshift(newGroup);

      // Redirect to the new group's page
      router.push(`/community/groups/${newGroup.id}`);
    } catch (err) {
      setError("Failed to create group. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <MemberLayout>
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Back navigation */}
        <button
          onClick={() => router.back()}
          className="text-sm text-ink-400 hover:text-ink-600 transition-colors flex items-center gap-1"
        >
          ← Back to Groups
        </button>

        <Card className="p-6">
          <h1 className="font-display text-2xl font-semibold text-ink-900">
            Create a Group
          </h1>
          <p className="text-sm text-ink-400 mt-0.5">
            Start a new group and invite members to join.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {/* Error message */}
            {error && (
              <div className="rounded-lg bg-clay-50 border border-clay-200 p-3 text-sm text-clay-700">
                ⚠️ {error}
              </div>
            )}

            {/* Group Name */}
            <div className="space-y-1.5">
              <label htmlFor="group-name" className="text-sm font-medium text-ink-700">
                Group Name <span className="text-clay-500">*</span>
              </label>
              <Input
                id="group-name"
                placeholder="e.g., Governance Leaders Circle"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
                className="w-full"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label htmlFor="group-description" className="text-sm font-medium text-ink-700">
                Description <span className="text-clay-500">*</span>
              </label>
              <Textarea
                id="group-description"
                placeholder="What is this group about? What will members discuss or do?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                disabled={isSubmitting}
                className="w-full resize-none"
                required
              />
              <p className="text-xs text-ink-400">
                {description.length} characters
              </p>
            </div>

            {/* Type and Visibility */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="group-type" className="text-sm font-medium text-ink-700">
                  Type
                </label>
                <select
                  id="group-type"
                  value={type}
                  onChange={(e) => setType(e.target.value as Group["type"])}
                  disabled={isSubmitting}
                  className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-dawn-400 focus:border-transparent"
                >
                  {GROUP_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="group-visibility" className="text-sm font-medium text-ink-700">
                  Visibility
                </label>
                <select
                  id="group-visibility"
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as Group["visibility"])}
                  disabled={isSubmitting}
                  className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-dawn-400 focus:border-transparent"
                >
                  {VISIBILITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <label htmlFor="group-tags" className="text-sm font-medium text-ink-700">
                Tags (optional)
              </label>
              <Input
                id="group-tags"
                placeholder="e.g., leadership, governance, public policy"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                disabled={isSubmitting}
                className="w-full"
              />
              <p className="text-xs text-ink-400">
                Separate tags with commas. Tags help members discover your group.
              </p>
            </div>

            {/* Submit actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-ink-100">
              <p className="text-xs text-ink-400">
                <span className="text-clay-500">*</span> Required fields
              </p>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!isValid || isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Creating...
                    </span>
                  ) : (
                    "Create Group"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </MemberLayout>
  );
}
