// app/mentorship/apply/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MemberLayout } from '@/components/layout/memberLayout';
import { Card } from '@/components/card';
import { Button } from '@/components/button';
import { Textarea } from '@/components/textarea';
import { ArrowLeft, AlertCircle, UserCheck } from 'lucide-react';
import { mockMentors, mockMembers, MentorProfile } from '@/components/mock/data';

// ============================================================
// Helper Data
// ============================================================

const AVAILABLE_FOCUS_CATEGORIES = [
  'Leadership',
  'Governance',
  'Public Policy',
  'Entrepreneurship',
  'Technology',
  'Software Engineering',
  'Career Growth',
  'Cloud Computing',
  'DevOps',
  'Infrastructure',
  'Marketplace',
  'Data Science',
  'AI/ML',
  'Cybersecurity',
  'Product Management',
  'Project Management',
  'Finance',
  'Legal',
  'Education',
  'Healthcare',
];

const AVAILABLE_EXPERTISE = [
  'Policy Analysis',
  'Public Administration',
  'Ethical Leadership',
  'Business Development',
  'AI Strategy',
  'Product Management',
  'Full Stack Development',
  'Mentoring Women in Tech',
  'Cloud Architecture',
  'AWS',
  'Kubernetes',
  'CI/CD',
  'Site Reliability',
  'Data Analytics',
  'Machine Learning',
  'Cybersecurity',
  'Risk Management',
  'Financial Planning',
  'Legal Compliance',
  'Project Management',
];

// ============================================================
// Main Page Component
// ============================================================

export default function BecomeMentorPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  const [availability, setAvailability] = useState('');
  const [bio, setBio] = useState('');

  // Current user (mock)
  const currentUserId = '1';

  // Validation
  const isValid = useMemo(() => {
    return (
      selectedCategories.length > 0 &&
      selectedExpertise.length > 0 &&
      availability.trim().length > 0 &&
      bio.trim().length >= 20
    );
  }, [selectedCategories, selectedExpertise, availability, bio]);

  // Toggle category selection
  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  // Toggle expertise selection
  const toggleExpertise = (expertise: string) => {
    setSelectedExpertise((prev) =>
      prev.includes(expertise) ? prev.filter((e) => e !== expertise) : [...prev, expertise]
    );
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      setError('Please fill in all required fields and ensure bio is at least 20 characters.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Check if user already has a mentor profile
      const existingMentor = mockMentors.find((m) => m.userId === currentUserId);
      if (existingMentor) {
        // Update existing profile
        const index = mockMentors.indexOf(existingMentor);
        mockMentors[index] = {
          ...existingMentor,
          focusCategories: selectedCategories,
          expertise: selectedExpertise,
          availability: availability.trim(),
          bio: bio.trim(),
          isActive: true,
        };
      } else {
        // Create new mentor profile
        const member = mockMembers.find((m) => m.id === currentUserId);
        const newMentor: MentorProfile = {
          userId: currentUserId,
          firstName: member?.firstName || 'Unknown',
          lastName: member?.lastName || 'User',
          avatar: member?.avatar || '',
          focusCategories: selectedCategories,
          expertise: selectedExpertise,
          availability: availability.trim(),
          bio: bio.trim(),
          isActive: true,
          capacity: 3,
          currentMentees: 0,
          rating: 0,
          reviewCount: 0,
        };
        mockMentors.push(newMentor);
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/mentorship/my-mentors');
      }, 2000);
    } catch (err) {
      setError('Failed to submit application. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ======== SUCCESS ========
  if (success) {
    return (
      <MemberLayout>
        <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-12 text-center">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-3xl mb-4">
            ✅
          </div>
          <h2 className="text-xl font-semibold text-ink-900">Application Submitted!</h2>
          <p className="text-sm text-ink-500 mt-1">
            Your mentor profile has been created/updated. You can now receive mentorship requests.
          </p>
          <p className="text-xs text-ink-400 mt-2">Redirecting to My Mentors...</p>
        </div>
      </MemberLayout>
    );
  }

  // ======== FORM ========
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

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-dawn-100 flex items-center justify-center text-xl">
              🧑‍🏫
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold text-ink-900">Become a Mentor</h1>
              <p className="text-sm text-ink-400">Share your expertise and mentor fellow Eagles</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error */}
            {error && (
              <div className="rounded-lg bg-clay-50 border border-clay-200 p-3 text-sm text-clay-700 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Focus Categories */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-700">
                Focus Categories <span className="text-clay-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_FOCUS_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                      selectedCategories.includes(cat)
                        ? 'bg-dawn-500 text-white'
                        : 'bg-ink-50 text-ink-600 hover:bg-ink-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <p className="text-xs text-ink-400">Select at least one focus category.</p>
            </div>

            {/* Expertise */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-700">
                Expertise <span className="text-clay-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_EXPERTISE.map((exp) => (
                  <button
                    key={exp}
                    type="button"
                    onClick={() => toggleExpertise(exp)}
                    className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                      selectedExpertise.includes(exp)
                        ? 'bg-dawn-500 text-white'
                        : 'bg-ink-50 text-ink-600 hover:bg-ink-100'
                    }`}
                  >
                    {exp}
                  </button>
                ))}
              </div>
              <p className="text-xs text-ink-400">Select at least one area of expertise.</p>
            </div>

            {/* Availability */}
            <div className="space-y-1.5">
              <label htmlFor="availability" className="text-sm font-medium text-ink-700">
                Availability <span className="text-clay-500">*</span>
              </label>
              <input
                id="availability"
                type="text"
                placeholder="e.g., Weekends and Tuesday evenings"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                disabled={isLoading}
                className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-dawn-400 disabled:opacity-50"
              />
              <p className="text-xs text-ink-400">When are you available for mentoring sessions?</p>
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <label htmlFor="bio" className="text-sm font-medium text-ink-700">
                Bio <span className="text-clay-500">*</span>
              </label>
              <Textarea
                id="bio"
                placeholder="Tell us about your experience, background, and why you want to mentor..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={5}
                disabled={isLoading}
                className="resize-none"
              />
              <p className="text-xs text-ink-400 text-right">
                {bio.length} characters (minimum 20)
              </p>
            </div>

            {/* Actions */}
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
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!isValid || isLoading}
                  className="min-w-[120px]"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Submitting...
                    </span>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4 mr-1" /> Become a Mentor
                    </>
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