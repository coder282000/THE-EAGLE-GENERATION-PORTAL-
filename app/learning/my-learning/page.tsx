'use client';
"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { MemberLayout } from "@/components/layout/memberLayout";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/avatar";
import { PillarTag } from "@/components/pillarTag";
import { mockCourses, mockEnrollments, Enrollment, mockMembers } from "@/components/mock/data";
import { formatDistanceToNow, format } from "date-fns";

// ============================================================
// Helpers
// ============================================================

const STATUS_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  NOT_STARTED: { label: "Not Started", color: "bg-ink-100 text-ink-600", icon: "⏳" },
  IN_PROGRESS: { label: "In Progress", color: "bg-blue-100 text-blue-700", icon: "📖" },
  COMPLETED: { label: "Completed", color: "bg-green-100 text-green-700", icon: "✅" },
};

function getCourseById(courseId: string) {
  return mockCourses.find((c) => c.id === courseId);
}

function getEnrollmentStats(enrollments: Enrollment[]) {
  const total = enrollments.length;
  const inProgress = enrollments.filter((e) => e.status === "IN_PROGRESS").length;
  const completed = enrollments.filter((e) => e.status === "COMPLETED").length;
  const notStarted = enrollments.filter((e) => e.status === "NOT_STARTED").length;
  const averageProgress = total > 0 ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / total) : 0;
  return { total, inProgress, completed, notStarted, averageProgress };
}

// ============================================================
// Enrollment Card Component
// ============================================================

function EnrollmentCard({ enrollment }: { enrollment: Enrollment }) {
  const course = getCourseById(enrollment.courseId);
  if (!course) return null;

  const statusInfo = STATUS_LABELS[enrollment.status] || STATUS_LABELS.NOT_STARTED;
  const instructor = mockMembers.find((m) => m.id === course.instructorId);
  const instructorInitials = instructor
    ? `${instructor.firstName[0]}${instructor.lastName[0]}`
    : "??";

  const lastAccessed = enrollment.lastAccessedAt
    ? formatDistanceToNow(new Date(enrollment.lastAccessedAt), { addSuffix: true })
    : "Never accessed";
  const enrolledDate = format(new Date(enrollment.enrolledAt), "MMM d, yyyy");

  return (
    <div className="flex flex-col sm:flex-row items-start gap-4 p-4 border border-ink-100 rounded-lg hover:border-ink-200 transition-colors">
      {/* Thumbnail placeholder */}
      <div className="h-20 w-full sm:w-28 shrink-0 rounded-lg bg-dawn-100 flex items-center justify-center text-2xl">
        📚
      </div>

      <div className="flex-1 min-w-0 w-full">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <Link href={`/learning/courses/${course.slug}`}>
            <h3 className="font-display font-semibold text-ink-900 hover:underline">
              {course.title}
            </h3>
          </Link>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusInfo.color}`}>
            {statusInfo.icon} {statusInfo.label}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-ink-400">
          <span>👨‍🏫 {course.instructorName}</span>
          <span>•</span>
          <span>📅 Enrolled {enrolledDate}</span>
          {enrollment.lastAccessedAt && (
            <>
              <span>•</span>
              <span>🕐 Last accessed {lastAccessed}</span>
            </>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-ink-500">
            <span>Progress</span>
            <span>{enrollment.progress}%</span>
          </div>
          <div className="mt-1 h-2 w-full rounded-full bg-ink-100">
            <div
              className={`h-2 rounded-full transition-all ${
                enrollment.progress === 100
                  ? "bg-green-500"
                  : enrollment.progress > 0
                  ? "bg-dawn-500"
                  : "bg-ink-200"
              }`}
              style={{ width: `${enrollment.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="shrink-0 w-full sm:w-auto flex flex-wrap gap-2">
        {enrollment.status === "COMPLETED" ? (
          <Link href={`/learning/certificates/${course.id}`}>
            <Button variant="outline" size="sm">
              🎓 View Certificate
            </Button>
          </Link>
        ) : (
          <Link href={`/learning/lessons/${course.id}-lesson-1`}>
            <Button variant="primary" size="sm">
              {enrollment.progress === 0 ? "Start Learning" : "Continue"}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Main Page Component
// ============================================================

export default function MyLearningPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [error, setError] = useState<string | null>(null);

  const currentUserId = "1"; // mock user

  // Fetch enrollments
  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 600));

        const userEnrollments = mockEnrollments.filter((e) => e.userId === currentUserId);
        setEnrollments(userEnrollments);
        setError(null);
      } catch (err) {
        setError("Failed to load your learning progress. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEnrollments();
  }, []);

  const stats = useMemo(() => getEnrollmentStats(enrollments), [enrollments]);

  // Sort enrollments: In Progress first, then Not Started, then Completed
  const sortedEnrollments = useMemo(() => {
    const statusOrder = { IN_PROGRESS: 0, NOT_STARTED: 1, COMPLETED: 2 };
    return [...enrollments].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
  }, [enrollments]);

  // ======== LOADING STATE ========
  if (isLoading) {
    return (
      <MemberLayout>
        <div className="max-w-3xl mx-auto space-y-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink-900">My Learning</h1>
            <p className="text-sm text-ink-400">Track your course progress</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 border border-ink-100 rounded-lg space-y-2">
                <div className="h-6 w-12 bg-ink-100 animate-pulse rounded" />
                <div className="h-4 w-20 bg-ink-100 animate-pulse rounded" />
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 border border-ink-100 rounded-lg flex flex-col sm:flex-row gap-4">
                <div className="h-20 w-full sm:w-28 rounded-lg bg-ink-100 animate-pulse" />
                <div className="flex-1 space-y-3">
                  <div className="h-6 w-40 bg-ink-100 animate-pulse rounded" />
                  <div className="h-4 w-32 bg-ink-100 animate-pulse" />
                  <div className="h-2 w-full bg-ink-100 animate-pulse rounded" />
                </div>
                <div className="h-9 w-28 bg-ink-100 animate-pulse rounded-md shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </MemberLayout>
    );
  }

  // ======== ERROR STATE ========
  if (error) {
    return (
      <MemberLayout>
        <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-12 text-center">
          <span className="text-4xl mb-4">⚠️</span>
          <p className="text-lg text-ink-600">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </MemberLayout>
    );
  }

  // ======== EMPTY STATE ========
  if (enrollments.length === 0) {
    return (
      <MemberLayout>
        <div className="max-w-3xl mx-auto space-y-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink-900">My Learning</h1>
            <p className="text-sm text-ink-400">Track your course progress</p>
          </div>
          <Card className="border border-dashed border-ink-200 p-8 text-center">
            <span className="text-4xl block mb-3">📖</span>
            <p className="text-ink-500">You haven't enrolled in any courses yet.</p>
            <p className="text-sm text-ink-400 mt-1">Browse the course catalogue and start learning!</p>
            <Link href="/learning/courses">
              <Button variant="primary" size="sm" className="mt-4">
                Browse Courses →
              </Button>
            </Link>
          </Card>
        </div>
      </MemberLayout>
    );
  }

  // ======== POPULATED STATE ========
  return (
    <MemberLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">My Learning</h1>
          <p className="text-sm text-ink-400">Track your course progress</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 border border-ink-100 rounded-lg">
            <p className="text-2xl font-bold text-ink-900">{stats.total}</p>
            <p className="text-xs text-ink-400">Enrolled</p>
          </div>
          <div className="p-4 border border-ink-100 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
            <p className="text-xs text-ink-400">In Progress</p>
          </div>
          <div className="p-4 border border-ink-100 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-xs text-ink-400">Completed</p>
          </div>
          <div className="p-4 border border-ink-100 rounded-lg">
            <p className="text-2xl font-bold text-dawn-600">{stats.averageProgress}%</p>
            <p className="text-xs text-ink-400">Average Progress</p>
          </div>
        </div>

        {/* Enrollments */}
        <div className="space-y-3">
          {sortedEnrollments.map((enrollment) => (
            <EnrollmentCard key={enrollment.courseId} enrollment={enrollment} />
          ))}
        </div>
      </div>
    </MemberLayout>
  );
}
