"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MemberLayout } from "@/components/layout/memberLayout";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Textarea } from "@/components/textarea";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { mockCourses, mockLessons, Lesson } from "@/components/mock/data";

type LessonType = "video" | "text" | "quiz" | "assignment";

const TYPE_OPTIONS: { value: LessonType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "video", label: "Video" },
  { value: "quiz", label: "Quiz" },
  { value: "assignment", label: "Assignment" },
];

export default function NewLessonPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");

  const [courseTitle, setCourseTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<LessonType>("text");
  const [order, setOrder] = useState(1);
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [videoUrl, setVideoUrl] = useState("");
  const [isPreview, setIsPreview] = useState(false);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch course details
  useEffect(() => {
    if (!courseId) {
      setError("No course selected. Please select a course first.");
      setIsLoading(false);
      return;
    }

    const course = mockCourses.find((c) => c.id === courseId);
    if (!course) {
      setError("Course not found.");
      setIsLoading(false);
      return;
    }

    setCourseTitle(course.title);
    // Set default order: next lesson number
    const existingLessons = mockLessons.filter((l) => l.courseId === courseId);
    setOrder(existingLessons.length + 1);
    setError(null);
    setIsLoading(false);
  }, [courseId]);

  // Validation
  const isValid = title.trim().length > 0 && content.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      setFormError("Please fill in all required fields.");
      return;
    }

    if (type === "video" && !videoUrl.trim()) {
      setFormError("Video URL is required for video lessons.");
      return;
    }

    if (!courseId) {
      setFormError("Course ID is missing. Please go back and try again.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Build new lesson
      const newLesson: Lesson = {
        id: `lesson-${Date.now()}`,
        courseId,
        title: title.trim(),
        content: content.trim(),
        type,
        order: Number(order),
        durationMinutes: Number(durationMinutes),
        videoUrl: type === "video" ? videoUrl.trim() : undefined,
        isPreview,
      };

      // Add to mock data
      mockLessons.push(newLesson);

      // Redirect to course detail
      router.push(`/learning/courses/${mockCourses.find(c => c.id === courseId)?.slug}`);
    } catch (err) {
      setFormError("Failed to create lesson. Please try again.");
      setIsSubmitting(false);
    }
  };

  // ======== LOADING ========
  if (isLoading) {
    return (
      <MemberLayout>
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 bg-ink-100 animate-pulse rounded" />
            <div className="h-6 w-32 bg-ink-100 animate-pulse rounded" />
          </div>
          <Card className="p-6 space-y-4">
            <div className="space-y-2">
              <div className="h-7 w-48 bg-ink-100 animate-pulse" />
              <div className="h-4 w-32 bg-ink-100 animate-pulse" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <div className="h-4 w-24 bg-ink-100 animate-pulse" />
                  <div className="h-10 w-full bg-ink-100 animate-pulse rounded-md" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </MemberLayout>
    );
  }

  // ======== ERROR ========
  if (error) {
    return (
      <MemberLayout>
        <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-clay-500 mb-4" />
          <p className="text-lg text-ink-600">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/learning/courses")}
          >
            Back to Courses
          </Button>
        </div>
      </MemberLayout>
    );
  }

  // ======== FORM ========
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
          <h1 className="font-display text-2xl font-semibold text-ink-900">Create New Lesson</h1>
          <p className="text-sm text-ink-400 mt-0.5">
            Adding a lesson to <span className="font-medium text-ink-700">{courseTitle}</span>
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {/* Error */}
            {formError && (
              <div className="rounded-lg bg-clay-50 border border-clay-200 p-3 text-sm text-clay-700 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {/* Title */}
            <div className="space-y-1.5">
              <label htmlFor="lesson-title" className="text-sm font-medium text-ink-700">
                Lesson Title <span className="text-clay-500">*</span>
              </label>
              <Input
                id="lesson-title"
                placeholder="e.g., Introduction to Governance"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
                className="w-full"
                required
              />
            </div>

            {/* Type */}
            <div className="space-y-1.5">
              <label htmlFor="lesson-type" className="text-sm font-medium text-ink-700">
                Lesson Type <span className="text-clay-500">*</span>
              </label>
              <select
                id="lesson-type"
                value={type}
                onChange={(e) => setType(e.target.value as LessonType)}
                disabled={isSubmitting}
                className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-dawn-400 focus:border-transparent"
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Content */}
            <div className="space-y-1.5">
              <label htmlFor="lesson-content" className="text-sm font-medium text-ink-700">
                Content <span className="text-clay-500">*</span>
              </label>
              <Textarea
                id="lesson-content"
                placeholder="Write the lesson content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                disabled={isSubmitting}
                className="w-full resize-none"
                required
              />
              <p className="text-xs text-ink-400 text-right">{content.length} characters</p>
            </div>

            {/* Video URL (conditional) */}
            {type === "video" && (
              <div className="space-y-1.5">
                <label htmlFor="lesson-video" className="text-sm font-medium text-ink-700">
                  Video URL <span className="text-clay-500">*</span>
                </label>
                <Input
                  id="lesson-video"
                  placeholder="https://www.youtube.com/embed/..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full"
                />
                <p className="text-xs text-ink-400">YouTube embed URL or direct video link.</p>
              </div>
            )}

            {/* Order & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="lesson-order" className="text-sm font-medium text-ink-700">
                  Order <span className="text-clay-500">*</span>
                </label>
                <Input
                  id="lesson-order"
                  type="number"
                  min="1"
                  step="1"
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
                  disabled={isSubmitting}
                  className="w-full"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="lesson-duration" className="text-sm font-medium text-ink-700">
                  Duration (minutes) <span className="text-clay-500">*</span>
                </label>
                <Input
                  id="lesson-duration"
                  type="number"
                  min="1"
                  step="1"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                  disabled={isSubmitting}
                  className="w-full"
                />
              </div>
            </div>

            {/* Preview toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="lesson-preview"
                checked={isPreview}
                onChange={(e) => setIsPreview(e.target.checked)}
                disabled={isSubmitting}
                className="h-4 w-4 text-dawn-600 rounded border-ink-300 focus:ring-dawn-500"
              />
              <label htmlFor="lesson-preview" className="text-sm text-ink-700">
                Allow free preview (non-enrolled users can view)
              </label>
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
                    "Create Lesson"
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