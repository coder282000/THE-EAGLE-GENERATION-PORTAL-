"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MemberLayout } from "@/components/layout/memberLayout";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/avatar";
import { PillarTag } from "@/components/pillarTag";
import { ArrowLeft, Clock, BookOpen, Users, Star, Calendar, CheckCircle, PlayCircle, FileText, PlusCircle } from "lucide-react";
import { mockCourses, mockCohorts, Course, Cohort, mockMembers } from "@/components/mock/data";
import { formatDistanceToNow, format } from "date-fns";

// ============================================================
// Helpers
// ============================================================

const PILLAR_MAP: Record<string, "marketplace" | "governance" | "technology"> = {
  MARKETPLACE: "marketplace",
  GOVERNANCE: "governance",
  TECHNOLOGY: "technology",
};

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: "bg-green-100 text-green-700",
  INTERMEDIATE: "bg-amber-100 text-amber-700",
  ADVANCED: "bg-clay-100 text-clay-700",
};

const COHORT_STATUS_LABELS: Record<string, { label: string; color: string; action: string }> = {
  PLANNED: { label: "Planned", color: "bg-ink-100 text-ink-600", action: "Notify me" },
  OPEN: { label: "Open", color: "bg-green-100 text-green-700", action: "Enrol Now" },
  FULL: { label: "Full", color: "bg-amber-100 text-amber-700", action: "Join Waitlist" },
  IN_PROGRESS: { label: "In Progress", color: "bg-blue-100 text-blue-700", action: "View" },
  COMPLETED: { label: "Completed", color: "bg-clay-100 text-clay-700", action: "View" },
};

function formatDate(dateStr: string): string {
  return format(new Date(dateStr), "MMM d, yyyy");
}

// ============================================================
// Cohort Card Component
// ============================================================

function CohortCard({ cohort, courseId }: { cohort: Cohort; courseId: string }) {
  const statusInfo = COHORT_STATUS_LABELS[cohort.status] || COHORT_STATUS_LABELS.PLANNED;
  const isOpen = cohort.status === "OPEN";
  const isFull = cohort.status === "FULL";
  const isInProgress = cohort.status === "IN_PROGRESS";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-4 border border-ink-100 rounded-lg hover:border-ink-200 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-medium text-ink-900">{cohort.name}</h4>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-ink-400">
          <span>📅 {formatDate(cohort.startsOn)} → {formatDate(cohort.endsOn)}</span>
          <span>•</span>
          <span>👥 {cohort.enrolled} / {cohort.capacity} enrolled</span>
          {cohort.facilitators.length > 0 && (
            <>
              <span>•</span>
              <span>👨‍🏫 {cohort.facilitators.join(", ")}</span>
            </>
          )}
        </div>
      </div>
      <div className="shrink-0">
        {isOpen ? (
          <Button variant="primary" size="sm">
            Enrol Now
          </Button>
        ) : isFull ? (
          <Button variant="outline" size="sm">
            Join Waitlist
          </Button>
        ) : isInProgress ? (
          <Button variant="outline" size="sm">
            View
          </Button>
        ) : (
          <Button variant="ghost" size="sm" disabled>
            {statusInfo.action}
          </Button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Main Page Component
// ============================================================

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [isLoading, setIsLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);

  // Mock current user – we'll assume user '1' is the instructor for courses where instructorId === '1'
  const currentUserId = "1";

  // Fetch course and cohorts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 600));

        const foundCourse = mockCourses.find((c) => c.slug === slug);
        if (!foundCourse) {
          setError("Course not found");
          setIsLoading(false);
          return;
        }
        setCourse(foundCourse);

        // Get cohorts for this course
        const courseCohorts = mockCohorts.filter((c) => c.courseId === foundCourse.id);
        setCohorts(courseCohorts);

        // Check if user is enrolled (mock: user '1' is logged in)
        // In a real app, this would come from the API
        setIsEnrolled(false);

        setError(null);
      } catch (err) {
        setError("Failed to load course. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  const instructor = useMemo(() => {
    if (!course) return null;
    return mockMembers.find((m) => m.id === course.instructorId);
  }, [course]);

  const openCohorts = useMemo(() => {
    return cohorts.filter((c) => c.status === "OPEN");
  }, [cohorts]);

  // Check if current user is the instructor
  const isInstructor = course && course.instructorId === currentUserId;

  // ======== LOADING STATE ========
  if (isLoading) {
    return (
      <MemberLayout>
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 bg-ink-100 animate-pulse rounded" />
            <div className="h-6 w-32 bg-ink-100 animate-pulse rounded" />
          </div>
          <Card className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="h-32 w-full sm:w-40 rounded-lg bg-ink-100 animate-pulse" />
              <div className="flex-1 space-y-3">
                <div className="h-8 w-48 bg-ink-100 animate-pulse rounded" />
                <div className="h-4 w-full bg-ink-100 animate-pulse" />
                <div className="h-4 w-3/4 bg-ink-100 animate-pulse" />
                <div className="flex gap-3">
                  <div className="h-5 w-20 bg-ink-100 animate-pulse rounded-full" />
                  <div className="h-5 w-20 bg-ink-100 animate-pulse rounded-full" />
                </div>
              </div>
            </div>
          </Card>
          <Card className="p-6 space-y-4">
            <div className="h-6 w-32 bg-ink-100 animate-pulse rounded" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-ink-100 rounded-lg">
                  <div className="space-y-2 flex-1">
                    <div className="h-5 w-32 bg-ink-100 animate-pulse rounded" />
                    <div className="h-4 w-48 bg-ink-100 animate-pulse" />
                  </div>
                  <div className="h-9 w-24 bg-ink-100 animate-pulse rounded-md" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </MemberLayout>
    );
  }

  // ======== ERROR / NOT FOUND ========
  if (error || !course) {
    return (
      <MemberLayout>
        <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-12 text-center">
          <span className="text-4xl mb-4">🔍</span>
          <p className="text-lg text-ink-600">{error || "Course not found"}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/learning/courses")}>
            Back to Courses
          </Button>
        </div>
      </MemberLayout>
    );
  }

  // ======== POPULATED STATE ========
  const instructorInitials = instructor
    ? `${instructor.firstName[0]}${instructor.lastName[0]}`
    : "??";

  return (
    <MemberLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back navigation */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-ink-400 hover:text-ink-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Courses
        </button>

        {/* Course Header */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Thumbnail placeholder */}
            <div className="h-32 w-full sm:w-40 shrink-0 rounded-lg bg-dawn-100 flex items-center justify-center text-4xl">
              📚
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h1 className="font-display text-2xl font-semibold text-ink-900">
                  {course.title}
                </h1>
                <PillarTag pillar={PILLAR_MAP[course.pillar] || "marketplace"} />
              </div>

              <p className="text-sm text-ink-500 mt-2">{course.description}</p>

              {/* Instructor */}
              <div className="flex items-center gap-2 mt-3">
                <Avatar className="h-6 w-6">
                  {instructor?.avatar ? (
                    <AvatarImage src={instructor.avatar} alt={`${instructor.firstName} ${instructor.lastName}`} />
                  ) : (
                    <AvatarFallback className="bg-ink-100 text-ink-700 text-[10px] font-medium">
                      {instructorInitials}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span className="text-sm text-ink-600">
                  Instructor: <span className="font-medium">{course.instructorName}</span>
                </span>
              </div>

              {/* Tags and stats */}
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${LEVEL_COLORS[course.level]}`}>
                  {LEVEL_LABELS[course.level] || course.level}
                </span>
                <span className="text-xs text-ink-400 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {course.durationHours}h
                </span>
                <span className="text-xs text-ink-400 flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5" /> {course.lessonsCount} lessons
                </span>
                <span className="text-xs text-ink-400 flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" /> {course.enrolledCount} enrolled
                </span>
                <span className="text-xs text-ink-400 flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {course.rating.toFixed(1)} ({course.reviewCount} reviews)
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-ink-100">
            <div className="flex flex-wrap items-center gap-3">
              {isEnrolled ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium text-sm">You are enrolled in this course</span>
                </div>
              ) : openCohorts.length > 0 ? (
                <Button variant="primary" size="sm">
                  Enrol Now
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  No open cohorts available
                </Button>
              )}
              {isEnrolled && (
                <Link href="/learning/my-learning">
                  <Button variant="outline" size="sm">
                    Go to My Learning →
                  </Button>
                </Link>
              )}
            </div>

            {/* Instructor actions */}
            {isInstructor && (
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/learning/lessons/new?courseId=${course.id}`}>
                  <Button variant="primary" size="sm" className="gap-1">
                    <PlusCircle className="h-4 w-4" /> Add Lesson
                  </Button>
                </Link>
                <Link href={`/learning/cohorts`}>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Users className="h-4 w-4" /> Manage Cohorts
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </Card>

        {/* Cohorts Section */}
        <Card className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="font-display text-lg font-semibold text-ink-900">
              Cohorts
            </h2>
            <span className="text-sm text-ink-400">
              {cohorts.length} cohort{cohorts.length !== 1 ? "s" : ""} available
            </span>
          </div>

          {cohorts.length === 0 ? (
            <div className="rounded-lg border border-dashed border-ink-200 p-6 text-center">
              <p className="text-ink-500">No cohorts available for this course yet.</p>
              <p className="text-sm text-ink-400 mt-1">Check back later for upcoming cohorts.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cohorts.map((cohort) => (
                <CohortCard key={cohort.id} cohort={cohort} courseId={course.id} />
              ))}
            </div>
          )}
        </Card>

        {/* Syllabus / Lessons */}
        <Card className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="font-display text-lg font-semibold text-ink-900">
              Course Syllabus
            </h2>
            {isInstructor && (
              <Link href={`/learning/lessons/new?courseId=${course.id}`}>
                <Button variant="primary" size="sm" className="gap-1">
                  <PlusCircle className="h-4 w-4" /> Add Lesson
                </Button>
              </Link>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-ink-50 transition-colors border border-ink-50">
              <span className="text-ink-400 text-sm font-medium">Module 1</span>
              <div className="flex-1">
                <p className="font-medium text-ink-900">Foundations</p>
                <div className="flex items-center gap-3 text-xs text-ink-400">
                  <span>4 lessons</span>
                  <span>•</span>
                  <span>~2 hours</span>
                </div>
              </div>
              <FileText className="h-4 w-4 text-ink-400" />
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-ink-50 transition-colors border border-ink-50">
              <span className="text-ink-400 text-sm font-medium">Module 2</span>
              <div className="flex-1">
                <p className="font-medium text-ink-900">Core Concepts</p>
                <div className="flex items-center gap-3 text-xs text-ink-400">
                  <span>6 lessons</span>
                  <span>•</span>
                  <span>~3 hours</span>
                </div>
              </div>
              <FileText className="h-4 w-4 text-ink-400" />
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-ink-50 transition-colors border border-ink-50">
              <span className="text-ink-400 text-sm font-medium">Module 3</span>
              <div className="flex-1">
                <p className="font-medium text-ink-900">Application & Projects</p>
                <div className="flex items-center gap-3 text-xs text-ink-400">
                  <span>5 lessons</span>
                  <span>•</span>
                  <span>~3 hours</span>
                </div>
              </div>
              <FileText className="h-4 w-4 text-ink-400" />
            </div>
          </div>
          <div className="mt-4 text-xs text-ink-400">
            📖 Total: {course.lessonsCount} lessons • {course.durationHours} hours of content
          </div>
        </Card>
      </div>
    </MemberLayout>
  );
}