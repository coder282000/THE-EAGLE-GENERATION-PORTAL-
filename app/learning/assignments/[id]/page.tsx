'use client';
"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MemberLayout } from "@/components/layout/memberLayout";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { Textarea } from "@/components/textarea";
import { Input } from "@/components/input";
import { AlertCircle, Calendar, FileText, Upload, Download, CheckCircle, ArrowLeft } from "lucide-react";
import { mockAssignments, mockLessons } from "@/components/mock/data";
import { format, formatDistanceToNow } from "date-fns";

// ============================================================
// File Upload Component
// ============================================================

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  disabled?: boolean;
}

function FileUpload({ onFileSelect, selectedFile, disabled }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      {!selectedFile ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging ? "border-dawn-400 bg-dawn-50" : "border-ink-200 hover:border-ink-400"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.zip"
            disabled={disabled}
          />
          <Upload className="h-8 w-8 text-ink-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-ink-700">Drag & drop your file here</p>
          <p className="text-xs text-ink-400 mt-1">or click to browse (PDF, Word, Text, ZIP up to 10MB)</p>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-3 bg-ink-50 rounded-lg border border-ink-100">
          <FileText className="h-5 w-5 text-ink-400" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink-700 truncate">{selectedFile.name}</p>
            <p className="text-xs text-ink-400">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
          {!disabled && (
            <Button variant="ghost" size="sm" onClick={handleRemoveFile} className="text-clay-500 hover:text-clay-600">
              Remove
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Main Page Component
// ============================================================

export default function AssignmentSubmissionPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [assignment, setAssignment] = useState<any>(null);
  const [lessonTitle, setLessonTitle] = useState<string>("");
  const [textSubmission, setTextSubmission] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Fetch assignment
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 500));
        const found = mockAssignments.find((a) => a.id === assignmentId);
        if (!found) {
          setError("Assignment not found");
          setIsLoading(false);
          return;
        }
        setAssignment(found);
        setIsSubmitted(found.isSubmitted);

        // Pre-populate text submission if already submitted
        if (found.isSubmitted && found.submissionText) {
          setTextSubmission(found.submissionText);
        }

        // Find associated lesson title
        const lesson = mockLessons.find((l) => l.id === found.lessonId);
        if (lesson) setLessonTitle(lesson.title);

        setError(null);
      } catch (err) {
        setError("Failed to load assignment. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [assignmentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignment) return;

    // Validation
    if (!textSubmission.trim() && !selectedFile) {
      setError("Please provide either text submission or upload a file.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate submission
      // In real app, this would send to API
      const updatedAssignment = {
        ...assignment,
        isSubmitted: true,
        submittedAt: new Date().toISOString(),
        submissionText: textSubmission.trim() || undefined,
        submissionFileUrl: selectedFile ? `submissions/${selectedFile.name}` : undefined,
      };
      // Update mock data (in real app, API would handle)
      const index = mockAssignments.findIndex((a) => a.id === assignmentId);
      if (index !== -1) {
        mockAssignments[index] = updatedAssignment;
      }
      setAssignment(updatedAssignment);
      setIsSubmitted(true);
    } catch (err) {
      setError("Failed to submit assignment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPastDue = assignment && new Date(assignment.dueDate) < new Date();

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
              <div className="h-6 w-48 bg-ink-100 animate-pulse" />
              <div className="h-4 w-32 bg-ink-100 animate-pulse" />
              <div className="h-4 w-24 bg-ink-100 animate-pulse" />
            </div>
            <div className="space-y-3">
              <div className="h-20 w-full bg-ink-100 animate-pulse rounded" />
              <div className="h-32 w-full bg-ink-100 animate-pulse rounded" />
            </div>
          </Card>
        </div>
      </MemberLayout>
    );
  }

  // ======== ERROR ========
  if (error || !assignment) {
    return (
      <MemberLayout>
        <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-clay-500 mb-4" />
          <p className="text-lg text-ink-600">{error || "Assignment not found"}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/learning/courses")}>
            Back to Courses
          </Button>
        </div>
      </MemberLayout>
    );
  }

  // ======== SUBMITTED VIEW ========
  if (isSubmitted) {
    return (
      <MemberLayout>
        <div className="max-w-2xl mx-auto space-y-4">
          <button
            onClick={() => router.back()}
            className="text-sm text-ink-400 hover:text-ink-600 transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          <Card className="p-6">
            <div className="flex items-start gap-4">
              <CheckCircle className="h-8 w-8 text-green-500 shrink-0 mt-1" />
              <div className="flex-1">
                <h1 className="font-display text-2xl font-semibold text-ink-900">Assignment Submitted!</h1>
                <p className="text-sm text-ink-500 mt-1">
                  Your submission for "{assignment.title}" has been received.
                </p>
                <p className="text-xs text-ink-400 mt-1">
                  Submitted on {format(new Date(assignment.submittedAt), "MMM d, yyyy 'at' h:mm a")}
                </p>
                {assignment.grade !== undefined && (
                  <div className="mt-3 p-3 bg-ink-50 rounded-lg">
                    <p className="text-sm">
                      <span className="font-medium">Grade:</span> {assignment.grade}/{assignment.maxScore}
                    </p>
                    {assignment.feedback && (
                      <p className="text-sm text-ink-600 mt-1">{assignment.feedback}</p>
                    )}
                  </div>
                )}
                {assignment.submissionText && (
                  <div className="mt-4 p-3 bg-ink-50 rounded-lg">
                    <h4 className="text-sm font-medium text-ink-700">Your Submission</h4>
                    <p className="text-sm text-ink-600 mt-1 whitespace-pre-wrap">{assignment.submissionText}</p>
                  </div>
                )}
                {assignment.submissionFileUrl && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-ink-600">
                    <FileText className="h-4 w-4" />
                    <span>File submitted: {assignment.submissionFileUrl.split('/').pop()}</span>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Download className="h-3.5 w-3.5" /> Download
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-ink-100 flex gap-3">
              <Link href={`/learning/lessons/${assignment.lessonId}`}>
                <Button variant="outline" size="sm">Back to Lesson</Button>
              </Link>
              <Link href="/learning/my-learning">
                <Button variant="primary" size="sm">My Learning</Button>
              </Link>
            </div>
          </Card>
        </div>
      </MemberLayout>
    );
  }

  // ======== SUBMISSION FORM ========
  const dueDate = new Date(assignment.dueDate);
  const timeRemaining = formatDistanceToNow(dueDate, { addSuffix: true });

  return (
    <MemberLayout>
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="text-sm text-ink-400 hover:text-ink-600 transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {/* Assignment Header */}
        <Card className="p-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm text-ink-400">Assignment • {lessonTitle}</p>
                <h1 className="font-display text-2xl font-semibold text-ink-900">{assignment.title}</h1>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                isPastDue ? "bg-clay-100 text-clay-700" : "bg-green-100 text-green-700"
              }`}>
                {isPastDue ? "Past Due" : "Open"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-ink-400">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" /> Due: {format(dueDate, "MMM d, yyyy 'at' h:mm a")}
              </span>
              <span>•</span>
              <span>{timeRemaining}</span>
              <span>•</span>
              <span>Max Score: {assignment.maxScore}</span>
            </div>
          </div>
        </Card>

        {/* Instructions */}
        <Card className="p-6">
          <h3 className="font-display text-sm font-semibold text-ink-900 mb-2">Instructions</h3>
          <p className="text-sm text-ink-600 whitespace-pre-wrap">{assignment.instructions}</p>
        </Card>

        {/* Submission Form */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="font-display text-sm font-semibold text-ink-900">Your Submission</h3>

            {error && (
              <div className="rounded-lg bg-clay-50 border border-clay-200 p-3 text-sm text-clay-700">
                ⚠️ {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="text-submission" className="text-sm font-medium text-ink-700">
                Text Submission
              </label>
              <Textarea
                id="text-submission"
                placeholder="Write your response here..."
                value={textSubmission}
                onChange={(e) => setTextSubmission(e.target.value)}
                rows={6}
                disabled={isSubmitting}
                className="resize-none"
              />
              <p className="text-xs text-ink-400 text-right">
                {textSubmission.length} characters
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-700">File Upload (optional)</label>
              <FileUpload
                onFileSelect={setSelectedFile}
                selectedFile={selectedFile}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-ink-100">
              <div className="text-xs text-ink-400">
                <span className="text-clay-500">*</span> Provide either text or file submission
              </div>
              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" size="sm" onClick={() => router.back()} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Submitting...
                    </span>
                  ) : (
                    "Submit Assignment"
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
