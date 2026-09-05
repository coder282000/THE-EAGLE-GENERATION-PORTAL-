"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { MemberLayout } from "@/components/layout/memberLayout";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/avatar";
import { Star, Clock, Users, Search, Filter, X } from "lucide-react";
import { mockMentors, MentorProfile, mockMembers } from "@/components/mock/data";

// ============================================================
// Helpers
// ============================================================

const FOCUS_CATEGORIES = [
  "Leadership",
  "Governance",
  "Public Policy",
  "Entrepreneurship",
  "Technology",
  "Software Engineering",
  "Career Growth",
  "Cloud Computing",
  "DevOps",
  "Infrastructure",
  "Marketplace",
];

const EXPERTISE_OPTIONS = [
  "Policy Analysis",
  "Public Administration",
  "Ethical Leadership",
  "Business Development",
  "AI Strategy",
  "Product Management",
  "Full Stack Development",
  "Mentoring Women in Tech",
  "Cloud Architecture",
  "AWS",
  "Kubernetes",
  "CI/CD",
  "Site Reliability",
];

// ============================================================
// Mentor Card Component
// ============================================================

function MentorCard({ mentor }: { mentor: MentorProfile }) {
  const user = mockMembers.find((m) => m.id === mentor.userId);
  const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : "??";
  const displayName = user ? `${user.firstName} ${user.lastName}` : "Unknown Mentor";

  return (
    <Card className="p-5 border border-ink-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Avatar */}
        <Link href={`/mentorship/mentors/${mentor.userId}`} className="shrink-0">
          <Avatar className="h-16 w-16">
            {mentor.avatar ? (
              <AvatarImage src={mentor.avatar} alt={displayName} />
            ) : (
              <AvatarFallback className="bg-dawn-100 text-dawn-700 text-lg font-medium">
                {initials}
              </AvatarFallback>
            )}
          </Avatar>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <Link href={`/mentorship/mentors/${mentor.userId}`}>
              <h3 className="font-display font-semibold text-ink-900 hover:underline">
                {displayName}
              </h3>
            </Link>
            <div className="flex items-center gap-2 text-sm">
              {mentor.rating && (
                <span className="flex items-center gap-1 text-amber-500">
                  <Star className="h-4 w-4 fill-amber-400" />
                  {mentor.rating.toFixed(1)}
                </span>
              )}
              <span className="text-ink-400">•</span>
              <span className="text-ink-400">
                {mentor.currentMentees}/{mentor.capacity} mentees
              </span>
            </div>
          </div>

          <p className="text-sm text-ink-500 mt-1 line-clamp-2">{mentor.bio}</p>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            {mentor.focusCategories.slice(0, 3).map((cat) => (
              <span key={cat} className="text-[10px] font-medium bg-dawn-100 text-dawn-700 px-2 py-0.5 rounded-full">
                {cat}
              </span>
            ))}
            {mentor.focusCategories.length > 3 && (
              <span className="text-[10px] text-ink-400">+{mentor.focusCategories.length - 3} more</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-ink-400">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {mentor.availability}
            </span>
            <span>•</span>
            <span className={`${mentor.isActive ? "text-green-600" : "text-clay-500"}`}>
              {mentor.isActive ? "🟢 Active" : "⚪ Inactive"}
            </span>
          </div>
        </div>

        <div className="shrink-0 w-full sm:w-auto">
          <Link href={`/mentorship/mentors/${mentor.userId}`}>
            <Button variant="primary" size="sm" className="w-full sm:w-auto">
              View Profile
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}

// ============================================================
// Main Page Component
// ============================================================

export default function FindMentorPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch mentors
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 600));
        setMentors(mockMentors.filter((m) => m.isActive));
        setError(null);
      } catch (err) {
        setError("Failed to load mentors. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMentors();
  }, []);

  // Filter mentors
  const filteredMentors = useMemo(() => {
    let result = mentors;

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((m) => {
        const user = mockMembers.find((u) => u.id === m.userId);
        const name = user ? `${user.firstName} ${user.lastName}`.toLowerCase() : "";
        const bio = m.bio.toLowerCase();
        const focus = m.focusCategories.some((f) => f.toLowerCase().includes(q));
        const expertise = m.expertise.some((e) => e.toLowerCase().includes(q));
        return name.includes(q) || bio.includes(q) || focus || expertise;
      });
    }

    // Filter by categories
    if (selectedCategories.length > 0) {
      result = result.filter((m) =>
        m.focusCategories.some((cat) => selectedCategories.includes(cat))
      );
    }

    // Filter by expertise
    if (selectedExpertise.length > 0) {
      result = result.filter((m) =>
        m.expertise.some((exp) => selectedExpertise.includes(exp))
      );
    }

    return result;
  }, [mentors, searchQuery, selectedCategories, selectedExpertise]);

  // Toggle category filter
  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  // Toggle expertise filter
  const toggleExpertise = (exp: string) => {
    setSelectedExpertise((prev) =>
      prev.includes(exp) ? prev.filter((e) => e !== exp) : [...prev, exp]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedExpertise([]);
  };

  // ======== LOADING ========
  if (isLoading) {
    return (
      <MemberLayout>
        <div className="space-y-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink-900">Find a Mentor</h1>
            <p className="text-sm text-ink-400">Connect with experienced Eagles</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="h-10 w-48 bg-ink-100 animate-pulse rounded-md" />
            <div className="h-10 w-28 bg-ink-100 animate-pulse rounded-md" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-5 border border-ink-100">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="h-16 w-16 rounded-full bg-ink-100 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-40 bg-ink-100 animate-pulse" />
                    <div className="h-4 w-full bg-ink-100 animate-pulse" />
                    <div className="h-4 w-3/4 bg-ink-100 animate-pulse" />
                    <div className="flex gap-2">
                      <div className="h-5 w-20 bg-ink-100 animate-pulse rounded-full" />
                      <div className="h-5 w-20 bg-ink-100 animate-pulse rounded-full" />
                    </div>
                  </div>
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
  if (filteredMentors.length === 0) {
    return (
      <MemberLayout>
        <div className="space-y-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink-900">Find a Mentor</h1>
            <p className="text-sm text-ink-400">Connect with experienced Eagles</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Input
              placeholder="Search mentors..."
              className="max-w-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 mr-1" /> Filters
            </Button>
          </div>
          <Card className="border border-dashed border-ink-200 p-8 text-center">
            <span className="text-4xl block mb-3">🔍</span>
            <p className="text-ink-500">No mentors found.</p>
            <p className="text-sm text-ink-400 mt-1">
              {searchQuery || selectedCategories.length > 0 || selectedExpertise.length > 0
                ? "Try adjusting your search or filters."
                : "Check back later for new mentors."}
            </p>
            {(searchQuery || selectedCategories.length > 0 || selectedExpertise.length > 0) && (
              <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </Card>
        </div>
      </MemberLayout>
    );
  }

  // ======== POPULATED ========
  return (
    <MemberLayout>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Find a Mentor</h1>
          <p className="text-sm text-ink-400">
            {filteredMentors.length} mentor{filteredMentors.length !== 1 ? "s" : ""} available
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search mentors by name, bio, or focus..."
            className="max-w-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 mr-1" /> Filters
            {(selectedCategories.length > 0 || selectedExpertise.length > 0) && (
              <span className="ml-1 bg-dawn-100 text-dawn-700 text-[10px] px-1.5 py-0.5 rounded-full">
                {selectedCategories.length + selectedExpertise.length}
              </span>
            )}
          </Button>
          {(searchQuery || selectedCategories.length > 0 || selectedExpertise.length > 0) && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-ink-400">
              <X className="h-4 w-4 mr-1" /> Clear
            </Button>
          )}
        </div>

        {/* Filter panel */}
        {showFilters && (
          <Card className="p-4 border border-ink-100">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-ink-700 mb-2">Focus Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {FOCUS_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`text-xs px-3 py-1 rounded-full transition-colors ${
                        selectedCategories.includes(cat)
                          ? "bg-dawn-500 text-white"
                          : "bg-ink-50 text-ink-600 hover:bg-ink-100"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-ink-700 mb-2">Expertise</h4>
                <div className="flex flex-wrap gap-2">
                  {EXPERTISE_OPTIONS.map((exp) => (
                    <button
                      key={exp}
                      onClick={() => toggleExpertise(exp)}
                      className={`text-xs px-3 py-1 rounded-full transition-colors ${
                        selectedExpertise.includes(exp)
                          ? "bg-dawn-500 text-white"
                          : "bg-ink-50 text-ink-600 hover:bg-ink-100"
                      }`}
                    >
                      {exp}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Mentor list */}
        <div className="space-y-3">
          {filteredMentors.map((mentor) => (
            <MentorCard key={mentor.userId} mentor={mentor} />
          ))}
        </div>
      </div>
    </MemberLayout>
  );
}