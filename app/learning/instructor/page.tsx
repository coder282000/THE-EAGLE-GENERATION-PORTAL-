"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { MemberLayout } from "@/components/layout/memberLayout";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { 
  BookOpen, 
  Users, 
  Clock, 
  CheckCircle, 
  GraduationCap,
  PlusCircle,
  BarChart3,
  MessageSquare,
  ArrowRight,
  Calendar,
  FileText
} from "lucide-react";
import {
  mockCourses,
  mockCohorts,
  mockEnrollments,
  mockAssignments,
  mockMembers,
  mockLessons,
} from "@/components/mock/data";

// ============================================================
// Stats Card Component
// ============================================================

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <Card className="p-4 border border-ink-100">
      <div className="flex items-center gap-3">
        <div className={`rounded-lg p-2 ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-ink-900">{value}</p>
          <p className="text-xs text-ink-400">{label}</p>
        </div>
      </div>
    </Card>
  );
}

// ============================================================
// Course Card Component
// ============================================================

function InstructorCourseCard({ course }: { course: any }) {
  const cohorts = mockCohorts.filter((c) => c.courseId === course.id);
  const activeCohorts = cohorts.filter((c) => c.status === "IN_PROGRESS" || c.status === "OPEN");
  const totalStudents = cohorts.reduce((sum, c) => sum + c.enrolled, 0);

  // Get pending assignments for grading
  const pendingAssignments = mockAssignments.filter(
    (a) => a.lessonId && mockLessons.some((l) => l.courseId === course.id && l.id === a.lessonId) && !a.isSubmitted
  ).length;

  return (
    <Card className="p-4 border border-ink-100 hover:shadow-md transition-shadow">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <Link href={`/learning/courses/${course.slug}`}>
            <h3 className="font-display font-semibold text-ink-900 hover:underline">
              {course.title}
            </h3>
          </Link>
          <p className="text-sm text-ink-500 mt-1 line-clamp-1">{course.description}</p>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-ink-400">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> {totalStudents} students
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {activeCohorts.length} active cohorts
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" /> {pendingAssignments} pending grading
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/learning/cohorts/${activeCohorts[0]?.id || '#'}`}>
            <Button variant="outline" size="sm">
              View Cohorts
            </Button>
          </Link>
          <Link href={`/learning/courses/${course.slug}/manage`}>
            <Button variant="primary" size="sm">
              Manage
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}

// ============================================================
// Activity Item Component
// ============================================================

function ActivityItem({ activity }: { activity: any }) {
  const { icon: Icon, title, description, time, color } = activity;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-ink-50 last:border-0">
      <div className={`rounded-full p-1.5 ${color}`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink-900">{title}</p>
        <p className="text-xs text-ink-400">{description}</p>
      </div>
      <span className="text-xs text-ink-400 shrink-0">{time}</span>
    </div>
  );
}

// ============================================================
// Main Page Component
// ============================================================

export default function InstructorDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Current user (instructor) – mock id '1' (Grace Mwangi)
  const instructorId = "1";

  // Fetch data (simulate)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 600));
        // All data is already in mock, just simulate loading
        setError(null);
      } catch (err) {
        setError("Failed to load instructor dashboard. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute instructor's courses
  const instructorCourses = useMemo(() => {
    return mockCourses.filter((c) => c.instructorId === instructorId);
  }, []);

  // Compute stats
  const stats = useMemo(() => {
    const totalCourses = instructorCourses.length;
    const totalCohorts = instructorCourses.reduce((sum, c) => {
      return sum + mockCohorts.filter((co) => co.courseId === c.id).length;
    }, 0);
    const totalStudents = instructorCourses.reduce((sum, c) => {
      return sum + mockCohorts.filter((co) => co.courseId === c.id).reduce((s, co) => s + co.enrolled, 0);
    }, 0);
    const pendingGrading = mockAssignments.filter((a) => {
      const lesson = mockLessons.find((l) => l.id === a.lessonId);
      if (!lesson) return false;
      const course = mockCourses.find((c) => c.id === lesson.courseId);
      return course && course.instructorId === instructorId && !a.isSubmitted;
    }).length;
    return { totalCourses, totalCohorts, totalStudents, pendingGrading };
  }, [instructorCourses]);

  // Activity feed (mock)
  const activities = useMemo(() => {
    return [
      {
        icon: CheckCircle,
        title: "New student completed assignment",
        description: "James Kariuki submitted Governance Case Study",
        time: "2 hours ago",
        color: "bg-green-500",
      },
      {
        icon: MessageSquare,
        title: "New message from cohort",
        description: "Governance Cohort Q1 2026 – discussion thread",
        time: "5 hours ago",
        color: "bg-blue-500",
      },
      {
        icon: Calendar,
        title: "Cohort session scheduled",
        description: "Tech Cohort Q1 2026 – live session tomorrow",
        time: "1 day ago",
        color: "bg-amber-500",
      },
      {
        icon: Users,
        title: "New enrollment",
        description: "Samuel Mutua enrolled in Marketplace Ethics",
        time: "2 days ago",
        color: "bg-dawn-500",
      },
    ];
  }, []);

  // ======== LOADING ========
  if (isLoading) {
    return (
      <MemberLayout>
        <div className="space-y-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink-900">Instructor Dashboard</h1>
            <p className="text-sm text-ink-400">Manage your courses and students</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 border border-ink-100 rounded-lg space-y-2">
                <div className="h-6 w-12 bg-ink-100 animate-pulse" />
                <div className="h-4 w-20 bg-ink-100 animate-pulse" />
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i} className="p-4 border border-ink-100">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-48 bg-ink-100 animate-pulse" />
                    <div className="h-4 w-64 bg-ink-100 animate-pulse" />
                    <div className="flex gap-3">
                      <div className="h-4 w-20 bg-ink-100 animate-pulse" />
                      <div className="h-4 w-20 bg-ink-100 animate-pulse" />
                    </div>
                  </div>
                  <div className="h-9 w-24 bg-ink-100 animate-pulse rounded-md" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </MemberLayout>
    );
  }

  // ======== ERROR ========
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

  // ======== EMPTY ========
  if (instructorCourses.length === 0) {
    return (
      <MemberLayout>
        <div className="space-y-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink-900">Instructor Dashboard</h1>
            <p className="text-sm text-ink-400">Manage your courses and students</p>
          </div>
          <Card className="border border-dashed border-ink-200 p-8 text-center">
            <span className="text-4xl block mb-3">👨‍🏫</span>
            <p className="text-ink-500">You don't have any courses yet.</p>
            <p className="text-sm text-ink-400 mt-1">Create your first course to get started.</p>
            <Link href="/learning/courses/new">
              <Button variant="primary" size="sm" className="mt-4">
                <PlusCircle className="h-4 w-4 mr-1" />
                Create Course
              </Button>
            </Link>
          </Card>
        </div>
      </MemberLayout>
    );
  }

  // ======== POPULATED ========
  return (
    <MemberLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink-900">Instructor Dashboard</h1>
            <p className="text-sm text-ink-400">Manage your courses and students</p>
          </div>
          <Link href="/learning/courses/new">
            <Button variant="primary" size="sm" className="gap-1">
              <PlusCircle className="h-4 w-4" />
              New Course
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            icon={BookOpen}
            label="Courses"
            value={stats.totalCourses}
            color="bg-dawn-500"
          />
          <StatCard
            icon={Users}
            label="Cohorts"
            value={stats.totalCohorts}
            color="bg-blue-500"
          />
          <StatCard
            icon={GraduationCap}
            label="Students"
            value={stats.totalStudents}
            color="bg-green-500"
          />
          <StatCard
            icon={FileText}
            label="Pending Grading"
            value={stats.pendingGrading}
            color="bg-amber-500"
          />
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Link href="/learning/courses/new">
            <Button variant="outline" size="sm" className="gap-1">
              <PlusCircle className="h-4 w-4" /> Create Course
            </Button>
          </Link>
          <Link href="/learning/cohorts">
            <Button variant="outline" size="sm" className="gap-1">
              <Users className="h-4 w-4" /> Manage Cohorts
            </Button>
          </Link>
          <Link href="/learning/assignments">
            <Button variant="outline" size="sm" className="gap-1">
              <FileText className="h-4 w-4" /> Grade Assignments
            </Button>
          </Link>
        </div>

        {/* My Courses */}
        <div>
          <h2 className="font-display text-lg font-semibold text-ink-900 mb-3">My Courses</h2>
          <div className="space-y-3">
            {instructorCourses.map((course) => (
              <InstructorCourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="font-display text-lg font-semibold text-ink-900 mb-3">Recent Activity</h2>
          <Card className="p-4 border border-ink-100">
            {activities.length === 0 ? (
              <p className="text-sm text-ink-400">No recent activity.</p>
            ) : (
              <div className="divide-y divide-ink-50">
                {activities.map((activity, idx) => (
                  <ActivityItem key={idx} activity={activity} />
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </MemberLayout>
  );
}
