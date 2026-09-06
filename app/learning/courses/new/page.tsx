'use client';
"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { MemberLayout } from "@/components/layout/memberLayout";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Textarea } from "@/components/textarea";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { mockCourses, Course } from "@/components/mock/data";

type Pillar = "MARKETPLACE" | "GOVERNANCE" | "TECHNOLOGY";
type Level = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
type Status = "DRAFT" | "PUBLISHED";

const PILLAR_OPTIONS: { value: Pillar; label: string }[] = [
  { value: "MARKETPLACE", label: "Marketplace" },
  { value: "GOVERNANCE", label: "Governance" },
  { value: "TECHNOLOGY", label: "Technology" },
];

const LEVEL_OPTIONS: { value: Level; label: string }[] = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
];

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
];

// Helper: generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

export default function CreateCoursePage() {
  const router = useRouter();
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [pillar, setPillar] = useState<Pillar>("MARKETPLACE");
  const [level, setLevel] = useState<Level>("BEGINNER");
  const [durationHours, setDurationHours] = useState(10);
  const [lessonsCount, setLessonsCount] = useState(20);
  const [status, setStatus] = useState<Status>("DRAFT");

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);

  // Auto-generate slug from title (only if not manually touched)
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!slugTouched) {
      setSlug(generateSlug(newTitle));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugTouched(true);
    setSlug(e.target.value);
  };

  // Validation
  const isValid = title.trim().length > 0 && description.trim().length > 0 && slug.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      setError("Please fill in all required fields.");
      return;
    }

    // Check for duplicate slug
    if (mockCourses.some((c) => c.slug === slug)) {
      setError(`A course with slug "${slug}" already exists. Please use a different slug.`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Build new course
      const newCourse: Course = {
        id: `course-${Date.now()}`,
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim(),
        pillar,
        instructorId: "1", // mock current user (Grace Mwangi)
        instructorName: "Grace Mwangi",
        enrolledCount: 0,
        rating: 0,
        reviewCount: 0,
        durationHours: Number(durationHours) || 0,
        lessonsCount: Number(lessonsCount) || 0,
        level,
        status,
      };

      // Add to mock data (in real app, API would handle)
      mockCourses.unshift(newCourse);

      // Redirect to course detail page
      router.push(`/learning/courses/${newCourse.slug}`);
    } catch (err) {
      setError("Failed to create course. Please try again.");
      setIsSubmitting(false);
    }
  };

  // ======== RENDER ========
  return (
    <MemberLayout>
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Back navigation */}
        <button
          onClick={() => router.back()}
          className="text-sm text-ink-400 hover:text-ink-600 transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <Card className="p-6">
          <h1 className="font-display text-2xl font-semibold text-ink-900">Create New Course</h1>
          <p className="text-sm text-ink-400 mt-0.5">Fill in the details to create a new course.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {/* Error */}
            {error && (
              <div className="rounded-lg bg-clay-50 border border-clay-200 p-3 text-sm text-clay-700 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Title */}
            <div className="space-y-1.5">
              <label htmlFor="course-title" className="text-sm font-medium text-ink-700">
                Course Title <span className="text-clay-500">*</span>
              </label>
              <Input
                ref={titleInputRef}
                id="course-title"
                placeholder="e.g., Advanced AI Ethics"
                value={title}
                onChange={handleTitleChange}
                disabled={isSubmitting}
                className="w-full"
                required
              />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <label htmlFor="course-slug" className="text-sm font-medium text-ink-700">
                Slug <span className="text-clay-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-ink-400 shrink-0">/learning/courses/</span>
                <Input
                  id="course-slug"
                  placeholder="e.g., advanced-ai-ethics"
                  value={slug}
                  onChange={handleSlugChange}
                  disabled={isSubmitting}
                  className="w-full"
                  required
                  pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                  title="Lowercase letters, numbers, and hyphens only"
                />
              </div>
              <p className="text-xs text-ink-400">
                Slug is used in the URL. Only lowercase letters, numbers, and hyphens allowed.
              </p>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label htmlFor="course-description" className="text-sm font-medium text-ink-700">
                Description <span className="text-clay-500">*</span>
              </label>
              <Textarea
                id="course-description"
                placeholder="Describe what the course covers..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                disabled={isSubmitting}
                className="w-full resize-none"
                required
              />
              <p className="text-xs text-ink-400 text-right">{description.length} characters</p>
            </div>

            {/* Pillar, Level, Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="course-pillar" className="text-sm font-medium text-ink-700">
                  Pillar <span className="text-clay-500">*</span>
                </label>
                <select
                  id="course-pillar"
                  value={pillar}
                  onChange={(e) => setPillar(e.target.value as Pillar)}
                  disabled={isSubmitting}
                  className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-dawn-400 focus:border-transparent"
                >
                  {PILLAR_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="course-level" className="text-sm font-medium text-ink-700">
                  Level <span className="text-clay-500">*</span>
                </label>
                <select
                  id="course-level"
                  value={level}
                  onChange={(e) => setLevel(e.target.value as Level)}
                  disabled={isSubmitting}
                  className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-dawn-400 focus:border-transparent"
                >
                  {LEVEL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="course-status" className="text-sm font-medium text-ink-700">
                  Status
                </label>
                <select
                  id="course-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Status)}
                  disabled={isSubmitting}
                  className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-dawn-400 focus:border-transparent"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Duration and Lessons Count */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="course-duration" className="text-sm font-medium text-ink-700">
                  Duration (hours)
                </label>
                <Input
                  id="course-duration"
                  type="number"
                  min="1"
                  step="1"
                  value={durationHours}
                  onChange={(e) => setDurationHours(parseInt(e.target.value) || 0)}
                  disabled={isSubmitting}
                  className="w-full"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="course-lessons" className="text-sm font-medium text-ink-700">
                  Lessons Count
                </label>
                <Input
                  id="course-lessons"
                  type="number"
                  min="1"
                  step="1"
                  value={lessonsCount}
                  onChange={(e) => setLessonsCount(parseInt(e.target.value) || 0)}
                  disabled={isSubmitting}
                  className="w-full"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-ink-100">
              <p className="text-xs text-ink-400">
                <span className="text-clay-500">*</span> Required fields
              </p>
              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" size="sm" onClick={() => router.back()} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={!isValid || isSubmitting} className="min-w-[120px]">
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Creating...
                    </span>
                  ) : (
                    "Create Course"
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
