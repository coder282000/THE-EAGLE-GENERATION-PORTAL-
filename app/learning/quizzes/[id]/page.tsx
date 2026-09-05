"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MemberLayout } from "@/components/layout/memberLayout";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { Progress } from "@/components/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Clock, CheckCircle, XCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { mockQuizzes, mockLessons, Quiz, QuizQuestion } from "@/components/mock/data";

// ============================================================
// Quiz Question Component
// ============================================================

function QuestionDisplay({
  question,
  selectedIndex,
  onSelect,
  showFeedback,
  isCorrect,
  explanation,
}: {
  question: QuizQuestion;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  showFeedback: boolean;
  isCorrect?: boolean;
  explanation?: string;
}) {
  return (
    <div className="space-y-4">
      <p className="text-base font-medium text-ink-900">{question.question}</p>
      <RadioGroup
        value={selectedIndex !== null ? String(selectedIndex) : undefined}
        onValueChange={(val) => onSelect(parseInt(val))}
        disabled={showFeedback}
        className="space-y-2"
      >
        {question.options.map((option, idx) => (
          <div key={idx} className="flex items-center space-x-2">
            <RadioGroupItem value={String(idx)} id={`q${question.id}-opt${idx}`} />
            <Label
              htmlFor={`q${question.id}-opt${idx}`}
              className={`text-sm cursor-pointer ${
                showFeedback && idx === question.correctAnswer
                  ? "text-green-600 font-medium"
                  : showFeedback && selectedIndex === idx && idx !== question.correctAnswer
                  ? "text-clay-600 line-through"
                  : ""
              }`}
            >
              {option}
              {showFeedback && idx === question.correctAnswer && (
                <span className="ml-2 text-green-600">✓</span>
              )}
              {showFeedback && selectedIndex === idx && idx !== question.correctAnswer && (
                <span className="ml-2 text-clay-600">✗</span>
              )}
            </Label>
          </div>
        ))}
      </RadioGroup>
      {showFeedback && explanation && (
        <div className={`mt-2 p-3 rounded-lg ${isCorrect ? "bg-green-50 border border-green-200" : "bg-clay-50 border border-clay-200"}`}>
          <p className="text-sm">
            <span className="font-medium">{isCorrect ? "✅ Correct" : "❌ Incorrect"}</span>
            <span className="text-ink-600 ml-2">{explanation}</span>
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Results Component
// ============================================================

function Results({
  questions,
  answers,
  score,
  passingScore,
  passed,
}: {
  questions: QuizQuestion[];
  answers: (number | null)[];
  score: number;
  passingScore: number;
  passed: boolean;
}) {
  const correctCount = answers.filter((a, idx) => a === questions[idx].correctAnswer).length;
  const total = questions.length;
  const percentage = Math.round((correctCount / total) * 100);

  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        {passed ? (
          <span className="text-5xl block mb-2">🎉</span>
        ) : (
          <span className="text-5xl block mb-2">📚</span>
        )}
        <h2 className="text-2xl font-bold text-ink-900">
          {passed ? "Congratulations!" : "Keep Learning!"}
        </h2>
        <p className="text-sm text-ink-500 mt-1">
          You scored {percentage}% ({correctCount}/{total})
        </p>
        <p className="text-sm text-ink-500">
          Passing score: {passingScore}%
        </p>
        <div className="mt-2 flex justify-center">
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
            passed ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
          }`}>
            {passed ? "✅ Passed" : "⏳ Needs Review"}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-ink-900">Review Answers</h3>
        {questions.map((q, idx) => {
          const userAnswer = answers[idx];
          const correct = userAnswer === q.correctAnswer;
          return (
            <div key={q.id} className={`p-3 rounded-lg border ${correct ? "border-green-200 bg-green-50" : "border-clay-200 bg-clay-50"}`}>
              <div className="flex items-start gap-2">
                <span className="mt-0.5">
                  {correct ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-clay-600" />}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink-900">{q.question}</p>
                  <p className="text-sm text-ink-600">
                    Your answer: {userAnswer !== null ? q.options[userAnswer] : "Not answered"}
                    {userAnswer !== null && userAnswer !== q.correctAnswer && (
                      <span className="ml-2 text-green-600">
                        Correct: {q.options[q.correctAnswer]}
                      </span>
                    )}
                  </p>
                  {q.explanation && (
                    <p className="text-xs text-ink-500 mt-1">{q.explanation}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3 pt-4 border-t border-ink-100">
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retake Quiz
        </Button>
        <Link href={`/learning/lessons/${mockLessons.find(l => l.type === 'quiz')?.id}`}>
          <Button variant="primary">
            Back to Lesson
          </Button>
        </Link>
      </div>
    </div>
  );
}

// ============================================================
// Main Page Component
// ============================================================

export default function QuizAttemptPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch quiz
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 500));
        const foundQuiz = mockQuizzes.find((q) => q.id === quizId);
        if (!foundQuiz) {
          setError("Quiz not found");
          setIsLoading(false);
          return;
        }
        setQuiz(foundQuiz);
        setAnswers(new Array(foundQuiz.questions.length).fill(null));
        if (foundQuiz.timeLimitMinutes) {
          setTimeRemaining(foundQuiz.timeLimitMinutes * 60); // in seconds
        }
        setError(null);
      } catch (err) {
        setError("Failed to load quiz. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0 && !isSubmitted) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timerRef.current!);
            // Auto-submit when time runs out
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [timeRemaining, isSubmitted]);

  const handleSelectAnswer = (index: number) => {
    if (isSubmitted) return;
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = index;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    if (!quiz) return;
    const correctCount = answers.reduce<number>((count, ans, idx) => {
      if (ans === quiz.questions[idx].correctAnswer) return count + 1;
      return count;
    }, 0);
    const total = quiz.questions.length;
    const percentage = (correctCount / total) * 100;
    setScore(percentage);
    setPassed(percentage >= quiz.passingScore);
    setIsSubmitted(true);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const isAnswerable = answers.every((ans) => ans !== null);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
              <div className="h-6 w-48 bg-ink-100 animate-pulse" />
              <div className="h-4 w-32 bg-ink-100 animate-pulse" />
              <div className="h-2 w-full bg-ink-100 animate-pulse rounded" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-ink-100 animate-pulse" />
                  <div className="h-4 w-48 bg-ink-100 animate-pulse" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </MemberLayout>
    );
  }

  // ======== ERROR ========
  if (error || !quiz) {
    return (
      <MemberLayout>
        <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-clay-500 mb-4" />
          <p className="text-lg text-ink-600">{error || "Quiz not found"}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/learning/courses")}>
            Back to Courses
          </Button>
        </div>
      </MemberLayout>
    );
  }

  // ======== RESULTS ========
  if (isSubmitted) {
    return (
      <MemberLayout>
        <div className="max-w-2xl mx-auto">
          <Results
            questions={quiz.questions}
            answers={answers}
            score={score}
            passingScore={quiz.passingScore}
            passed={passed}
          />
        </div>
      </MemberLayout>
    );
  }

  // ======== QUIZ ATTEMPT ========
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <MemberLayout>
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <button
              onClick={() => router.back()}
              className="text-sm text-ink-400 hover:text-ink-600 transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <h1 className="font-display text-xl font-semibold text-ink-900">{quiz.title}</h1>
            <p className="text-sm text-ink-400">{quiz.description}</p>
          </div>
          {timeRemaining !== null && (
            <div className="flex items-center gap-2 text-sm font-medium text-ink-700 bg-ink-50 px-3 py-1.5 rounded-lg">
              <Clock className="h-4 w-4" />
              <span className={timeRemaining < 60 ? "text-clay-600" : ""}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm text-ink-400">
            <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="p-6">
          <QuestionDisplay
            question={currentQuestion}
            selectedIndex={answers[currentQuestionIndex]}
            onSelect={handleSelectAnswer}
            showFeedback={false}
          />
        </Card>

        {/* Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-ink-400">
              {answers.filter(a => a !== null).length} / {quiz.questions.length} answered
            </span>
            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={!isAnswerable}
              >
                Submit Quiz
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={answers[currentQuestionIndex] === null}
              >
                Next →
              </Button>
            )}
          </div>
        </div>

        {/* Question indicator dots */}
        <div className="flex flex-wrap gap-1 justify-center mt-2">
          {quiz.questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentQuestionIndex(idx)}
              className={`w-3 h-3 rounded-full transition-colors ${
                answers[idx] !== null
                  ? "bg-dawn-500"
                  : idx === currentQuestionIndex
                  ? "bg-ink-300 ring-2 ring-dawn-300"
                  : "bg-ink-200"
              }`}
              aria-label={`Go to question ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </MemberLayout>
  );
}