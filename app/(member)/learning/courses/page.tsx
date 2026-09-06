'use client';
"use client";

import { MemberLayout } from "@/components/layout/memberLayout";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import Link from "next/link";

// Mock courses data
const courses = [
  { id: 1, title: "Marketplace Ethics 101", description: "Learn the fundamentals of ethical leadership in business.", status: "In Progress", progress: 65 },
  { id: 2, title: "Foundations of Leadership", description: "Core principles of effective leadership.", status: "Completed", progress: 100 },
  { id: 3, title: "Governance and Policy", description: "Understanding policy-making and governance structures.", status: "Not Started", progress: 0 },
  { id: 4, title: "Technology for Transformation", description: "Leveraging technology for social impact.", status: "In Progress", progress: 30 },
];

export default function CoursesPage() {
  return (
    <MemberLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900">
            Courses
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Browse and track your learning progress.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((course) => (
            <Card key={course.id} className="p-5">
              <h3 className="font-display font-semibold text-ink-900">{course.title}</h3>
              <p className="text-sm text-ink-600 mt-1">{course.description}</p>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-ink-400">
                  <span>{course.status}</span>
                  <span>{course.progress}%</span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-ink-100">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      course.progress === 100 ? "bg-green-500" : "bg-dawn-400"
                    }`}
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>
              <div className="mt-4">
                <Button variant="secondary" onClick={() => alert("Course details coming soon")}>
                  {course.progress === 100 ? "View Certificate" : "Continue Learning"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </MemberLayout>
  );
}
