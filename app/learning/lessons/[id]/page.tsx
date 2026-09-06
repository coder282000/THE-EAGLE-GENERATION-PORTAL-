'use client';
"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MemberLayout } from "@/components/layout/memberLayout";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  PlayCircle, 
  FileText, 
  BookOpen, 
  Video,
  FileQuestion,
  FileEdit
} from "lucide-react";
import { mockLessons, mockCourses, mockLessonProgress, Lesson, Course, LessonProgress } from "@/components/mock/data";
import { formatDistanceToNow } from "date-fns";

// ============================================================
// Helpers
// ============================================================

const LESSON_TYPE_ICONS: Record<string, { icon: JSX.Element; label: string }> = {
  text: { icon: <FileText className="h-4 w-4" />, label: "Text" },
  video: { icon: <Video className="h-4 w-4" />, label: "Video" },
  quiz: { icon: <FileQuestion className="h-4 w-4" />, label: "Quiz" },
  assignment: { icon: <FileEdit className="h-4 w-4" />, label: "Assignment" },
};

function getLessonIcon(type: string) {
  return LESSON_TYPE_ICONS[type]?.icon || <FileText className="h-4 w-4" />;
}

function getLessonTypeLabel(type: string) {
  return LESSON_TYPE_ICONS[type]?.label || type;
}

// ============================================================
// Main Page Component
// ============================================================

export default function LessonViewPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<LessonProgress | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentUserId = "1"; // mock user

  // Fetch lesson data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 600));

        const foundLesson = mockLessons.find((l) => l.id === lessonId);
        if (!foundLesson) {
          setError("Lesson not found");
          setIsLoading(false);
          return;
        }
        setLesson(foundLesson);

        // Find the course
        const foundCourse = mockCourses.find((c) => c.id === foundLesson.courseId);
        if (foundCourse) setCourse(foundCourse);

        // Get all lessons for this course
        const courseLessons = mockLessons
          .filter((l) => l.courseId === foundLesson.courseId)
          .sort((a, b) => a.order - b.order);
        setAllLessons(courseLessons);

        // Get user progress for this lesson
        const userProgress = mockLessonProgress.find(
          (p) => p.userId === currentUserId && p.lessonId === lessonId
        );
        setProgress(userProgress || null);

        setError(null);
      } catch (err) {
        setError("Failed to load lesson. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [lessonId]);

  // Find current index and navigation helpers
  const currentIndex = useMemo(() => {
    return allLessons.findIndex((l) => l.id === lessonId);
  }, [allLessons, lessonId]);

  const prevLesson = useMemo(() => {
    if (currentIndex > 0) return allLessons[currentIndex - 1];
    return null;
  }, [currentIndex, allLessons]);

  const nextLesson = useMemo(() => {
    if (currentIndex < allLessons.length - 1) return allLessons[currentIndex + 1];
    return null;
  }, [currentIndex, allLessons]);

  // Handle marking lesson as complete
  const handleMarkComplete = async () => {
    if (!lesson || isMarkingComplete) return;

    setIsMarkingComplete(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Update mock progress
      const existingProgress = mockLessonProgress.find(
        (p) => p.userId === currentUserId && p.lessonId === lesson.id
      );
      if (existingProgress) {
        existingProgress.completed = true;
        existingProgress.completedAt = new Date().toISOString();
      } else {
        mockLessonProgress.push({
          userId: currentUserId,
          lessonId: lesson.id,
          completed: true,
          completedAt: new Date().toISOString(),
        });
      }

      setProgress({
        userId: currentUserId,
        lessonId: lesson.id,
        completed: true,
        completedAt: new Date().toISOString(),
      });
    } catch (err) {
      alert("Failed to mark lesson as complete. Please try again.");
    } finally {
      setIsMarkingComplete(false);
    }
  };

  // Handle navigation to next/previous lesson
  const handleNavigate = (targetLesson: Lesson | null) => {
    if (targetLesson) {
      router.push(`/learning/lessons/${targetLesson.id}`);
    }
  };

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
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-ink-100 animate-pulse rounded" />
              <div className="h-6 w-32 bg-ink-100 animate-pulse" />
            </div>
            <div className="space-y-3">
              <div className="h-8 w-48 bg-ink-100 animate-pulse" />
              <div className="h-4 w-32 bg-ink-100 animate-pulse" />
              <div className="h-4 w-full bg-ink-100 animate-pulse" />
              <div className="h-4 w-3/4 bg-ink-100 animate-pulse" />
              <div className="h-4 w-1/2 bg-ink-100 animate-pulse" />
            </div>
          </Card>
        </div>
      </MemberLayout>
    );
  }

  // ======== ERROR / NOT FOUND ========
  if (error || !lesson || !course) {
    return (
      <MemberLayout>
        <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-12 text-center">
          <span className="text-4xl mb-4">🔍</span>
          <p className="text-lg text-ink-600">{error || "Lesson not found"}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/learning/courses")}>
            Back to Courses
          </Button>
        </div>
      </MemberLayout>
    );
  }

  // ======== POPULATED STATE ========
  const isCompleted = progress?.completed || false;
  const isQuiz = lesson.type === "quiz";
  const isAssignment = lesson.type === "assignment";
  const isVideo = lesson.type === "video";

  return (
    <MemberLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-ink-400">
          <Link href="/learning/courses" className="hover:text-ink-600 hover:underline">
            Courses
          </Link>
          <span>•</span>
          <Link href={`/learning/courses/${course.slug}`} className="hover:text-ink-600 hover:underline">
            {course.title}
          </Link>
          <span>•</span>
          <span className="text-ink-600 font-medium truncate">{lesson.title}</span>
        </div>

        {/* Lesson Header */}
        <Card className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-sm text-ink-400">
                {getLessonIcon(lesson.type)}
                <span>{getLessonTypeLabel(lesson.type)}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {lesson.durationMinutes} min
                </span>
                <span>•</span>
                <span>Lesson {lesson.order} of {allLessons.length}</span>
              </div>
              <h1 className="font-display text-2xl font-semibold text-ink-900 mt-1">
                {lesson.title}
              </h1>
            </div>
            {isCompleted ? (
              <span className="flex items-center gap-1.5 text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                <CheckCircle className="h-4 w-4" /> Completed
              </span>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkComplete}
                disabled={isMarkingComplete}
                className="gap-1.5"
              >
                {isMarkingComplete ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink-900 border-t-transparent" />
                    Marking...
                  </span>
                ) : (
                  <>✓ Mark Complete</>
                )}
              </Button>
            )}
          </div>
        </Card>

        {/* Lesson Content */}
        <Card className="p-6">
          {isVideo && lesson.videoUrl ? (
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-ink-50">
              <iframe
                src={lesson.videoUrl}
                title={lesson.title}
                className="h-full w-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          ) : null}

          <div className={`prose prose-ink max-w-none mt-4 ${isVideo ? "mt-6" : ""}`}>
            {lesson.content.split("\n").map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          {isQuiz && (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h3 className="font-medium text-amber-800">📝 Quiz</h3>
              <p className="text-sm text-amber-700 mt-1">
                This is a quiz lesson. Click below to start the quiz.
              </p>
              <Button variant="primary" size="sm" className="mt-3">
                Start Quiz →
              </Button>
            </div>
          )}

          {isAssignment && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-800">📄 Assignment</h3>
              <p className="text-sm text-blue-700 mt-1">
                Submit your work for this assignment.
              </p>
              <Button variant="primary" size="sm" className="mt-3">
                Submit Assignment →
              </Button>
            </div>
          )}
        </Card>

        {/* Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleNavigate(prevLesson)}
            disabled={!prevLesson}
            className="gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous Lesson
          </Button>
          <span className="text-sm text-ink-400">
            {currentIndex + 1} / {allLessons.length}
          </span>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleNavigate(nextLesson)}
            disabled={!nextLesson}
            className="gap-1.5"
          >
            Next Lesson
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Course progress summary */}
        <Card className="p-4 bg-ink-50 border-none">
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-600">Course Progress</span>
            <span className="font-medium text-ink-900">
              {allLessons.filter((l) => 
                mockLessonProgress.some((p) => p.userId === currentUserId && p.lessonId === l.id && p.completed)
              ).length} / {allLessons.length} lessons completed
            </span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-ink-200">
            <div
              className="h-2 rounded-full bg-dawn-500 transition-all"
              style={{
                width: `${(allLessons.filter((l) => 
                  mockLessonProgress.some((p) => p.userId === currentUserId && p.lessonId === l.id && p.completed)
                ).length / allLessons.length) * 100}%`,
              }}
            />
          </div>
        </Card>
      </div>
    </MemberLayout>
  );
}
