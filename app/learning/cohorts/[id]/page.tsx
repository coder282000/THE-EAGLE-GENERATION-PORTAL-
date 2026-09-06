'use client';
// app/learning/cohorts/[id]/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MemberLayout } from '@/components/layout/memberLayout';
import { Card } from '@/components/card';
import { Button } from '@/components/button';
import { Textarea } from '@/components/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/avatar';
import {
  ArrowLeft,
  Users,
  BookOpen,
  CheckCircle,
  Clock,
  UserCheck,
  UserX,
  Edit2,
  Save,
  X,
  PlusCircle,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { mockCohorts, mockCourses, mockCohortMembers, Cohort, Course, CohortMember, mockMembers } from '@/components/mock/data';
import { format, formatDistanceToNow } from 'date-fns';

// ============================================================
// Helpers
// ============================================================

const STATUS_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  PLANNED: { label: 'Planned', color: 'bg-ink-100 text-ink-600', icon: '📅' },
  OPEN: { label: 'Open', color: 'bg-green-100 text-green-700', icon: '🟢' },
  FULL: { label: 'Full', color: 'bg-amber-100 text-amber-700', icon: '🔴' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: '📖' },
  COMPLETED: { label: 'Completed', color: 'bg-clay-100 text-clay-700', icon: '✅' },
};

const STATUS_OPTIONS = [
  { value: 'PLANNED', label: 'Planned' },
  { value: 'OPEN', label: 'Open' },
  { value: 'FULL', label: 'Full' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
];

const MEMBER_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: 'Active', color: 'bg-green-100 text-green-700' },
  COMPLETED: { label: 'Completed', color: 'bg-blue-100 text-blue-700' },
  DROPPED: { label: 'Dropped', color: 'bg-clay-100 text-clay-700' },
};

function formatDate(dateStr: string): string {
  return format(new Date(dateStr), 'MMM d, yyyy');
}

function getCohortStats(members: CohortMember[]) {
  const total = members.length;
  const active = members.filter((m) => m.status === 'ACTIVE').length;
  const completed = members.filter((m) => m.status === 'COMPLETED').length;
  const dropped = members.filter((m) => m.status === 'DROPPED').length;
  const avgProgress = total > 0 ? Math.round(members.reduce((sum, m) => sum + m.progress, 0) / total) : 0;
  return { total, active, completed, dropped, avgProgress };
}

// ============================================================
// Member List Component (with management actions)
// ============================================================

function MemberList({
  cohortId,
  canManage,
  onRemoveMember,
}: {
  cohortId: string;
  canManage: boolean;
  onRemoveMember: (userId: string) => void;
}) {
  const members = mockCohortMembers.filter((cm) => cm.cohortId === cohortId);

  if (members.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-ink-200 p-6 text-center">
        <p className="text-ink-500">No members enrolled yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {members.map((cm) => {
        const user = mockMembers.find((m) => m.id === cm.userId);
        if (!user) return null;
        const statusInfo = MEMBER_STATUS_LABELS[cm.status] || MEMBER_STATUS_LABELS.ACTIVE;
        const initials = `${user.firstName[0]}${user.lastName[0]}`;

        return (
          <div
            key={cm.userId}
            className="flex flex-wrap items-center gap-3 p-3 border border-ink-50 rounded-lg hover:border-ink-100 transition-colors"
          >
            <Link href={`/profile/${user.id}`} className="shrink-0">
              <Avatar className="h-10 w-10">
                {user.avatar ? (
                  <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                ) : (
                  <AvatarFallback className="bg-dawn-100 text-dawn-700 font-medium">
                    {initials}
                  </AvatarFallback>
                )}
              </Avatar>
            </Link>
            <div className="flex-1 min-w-0">
              <Link href={`/profile/${user.id}`} className="font-medium text-ink-900 hover:underline">
                {user.firstName} {user.lastName}
              </Link>
              <p className="text-xs text-ink-400">{user.email}</p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>
              <div className="w-24">
                <div className="flex items-center justify-between text-xs text-ink-500">
                  <span>{cm.progress}%</span>
                </div>
                <div className="mt-0.5 h-1.5 w-full rounded-full bg-ink-100">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      cm.progress === 100
                        ? 'bg-green-500'
                        : cm.progress > 0
                        ? 'bg-dawn-500'
                        : 'bg-ink-200'
                    }`}
                    style={{ width: `${cm.progress}%` }}
                  />
                </div>
              </div>
              {canManage && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-clay-500 hover:text-clay-600"
                  onClick={() => onRemoveMember(cm.userId)}
                >
                  <UserX className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// Timeline Component
// ============================================================

function CohortTimeline({ cohort }: { cohort: Cohort }) {
  const milestones = [
    { date: cohort.startsOn, label: 'Cohort Starts', icon: '🚀' },
    { date: cohort.endsOn, label: 'Cohort Ends', icon: '🏁' },
  ];

  const phaseMilestones = [
    {
      date: new Date(new Date(cohort.startsOn).getTime() + 1000 * 60 * 60 * 24 * 30).toISOString(),
      label: 'Phase 1: Foundation',
      icon: '📚',
    },
    {
      date: new Date(new Date(cohort.startsOn).getTime() + 1000 * 60 * 60 * 24 * 60).toISOString(),
      label: 'Phase 2: Specialisation',
      icon: '📖',
    },
    {
      date: new Date(new Date(cohort.startsOn).getTime() + 1000 * 60 * 60 * 24 * 90).toISOString(),
      label: 'Phase 3: Application',
      icon: '🛠️',
    },
  ];

  const allMilestones = [...milestones, ...phaseMilestones].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="relative pl-6 space-y-6">
      {allMilestones.map((milestone, index) => (
        <div key={index} className="relative">
          {index < allMilestones.length - 1 && (
            <div className="absolute left-[-14px] top-5 h-full w-0.5 bg-ink-100" />
          )}
          <div className="flex items-start gap-4">
            <span className="text-xl">{milestone.icon}</span>
            <div>
              <p className="font-medium text-ink-900">{milestone.label}</p>
              <p className="text-sm text-ink-400">{formatDate(milestone.date)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Main Page Component
// ============================================================

export default function CohortDetailPage() {
  const params = useParams();
  const router = useRouter();
  const cohortId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [members, setMembers] = useState<CohortMember[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isManageMode, setIsManageMode] = useState(false);

  const [editName, setEditName] = useState('');
  const [editStartsOn, setEditStartsOn] = useState('');
  const [editEndsOn, setEditEndsOn] = useState('');
  const [editCapacity, setEditCapacity] = useState(0);
  const [editStatus, setEditStatus] = useState<Cohort['status']>('PLANNED');
  const [editFacilitators, setEditFacilitators] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [memberSearch, setMemberSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isAddingMember, setIsAddingMember] = useState(false);

  const currentUserId = '1';

  const isFacilitator = cohort?.facilitators?.includes(currentUserId) || false;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 500));

        const foundCohort = mockCohorts.find((c) => c.id === cohortId);
        if (!foundCohort) {
          setError('Cohort not found');
          setIsLoading(false);
          return;
        }
        setCohort(foundCohort);
        setEditName(foundCohort.name);
        setEditStartsOn(foundCohort.startsOn);
        setEditEndsOn(foundCohort.endsOn);
        setEditCapacity(foundCohort.capacity);
        setEditStatus(foundCohort.status);
        setEditFacilitators(foundCohort.facilitators.join(', '));

        const foundCourse = mockCourses.find((c) => c.id === foundCohort.courseId);
        if (foundCourse) setCourse(foundCourse);

        const cohortMembers = mockCohortMembers.filter((cm) => cm.cohortId === cohortId);
        setMembers(cohortMembers);

        setError(null);
      } catch (err) {
        setError('Failed to load cohort. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [cohortId]);

  const stats = useMemo(() => getCohortStats(members), [members]);
  const statusInfo = cohort ? STATUS_LABELS[cohort.status] || STATUS_LABELS.PLANNED : null;

  const handleRemoveMember = (userId: string) => {
    if (!confirm('Are you sure you want to remove this member from the cohort?')) return;
    setMembers((prev) => prev.filter((m) => m.userId !== userId));
  };

  const handleSearchMembers = (query: string) => {
    setMemberSearch(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const q = query.toLowerCase().trim();
    const alreadyInCohort = members.map((m) => m.userId);
    const results = mockMembers
      .filter(
        (m) =>
          !alreadyInCohort.includes(m.id) &&
          (m.firstName.toLowerCase().includes(q) ||
            m.lastName.toLowerCase().includes(q) ||
            m.email.toLowerCase().includes(q) ||
            m.memberNumber.toLowerCase().includes(q))
      )
      .slice(0, 5);
    setSearchResults(results);
  };

  const handleAddMember = (userId: string) => {
    setIsAddingMember(true);
    const newMember: CohortMember = {
      userId,
      cohortId: cohort!.id,
      progress: 0,
      status: 'ACTIVE',
      enrolledAt: new Date().toISOString(),
    };
    setMembers((prev) => [...prev, newMember]);
    setMemberSearch('');
    setSearchResults([]);
    setIsAddingMember(false);
    if (cohort) {
      setCohort({ ...cohort, enrolled: cohort.enrolled + 1 });
    }
  };

  const handleSaveEdits = async () => {
    if (!cohort) return;
    setSaveError(null);
    setSaveSuccess(false);
    setIsSaving(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const updatedCohort: Cohort = {
        ...cohort,
        name: editName,
        startsOn: editStartsOn,
        endsOn: editEndsOn,
        capacity: editCapacity,
        status: editStatus,
        facilitators: editFacilitators
          .split(',')
          .map((f) => f.trim())
          .filter(Boolean),
      };

      const index = mockCohorts.findIndex((c) => c.id === cohortId);
      if (index !== -1) {
        mockCohorts[index] = updatedCohort;
      }

      setCohort(updatedCohort);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      setIsManageMode(false);
    } catch (err) {
      setSaveError('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCohort = () => {
    if (!confirm('Are you sure you want to delete this cohort? This action cannot be undone.')) return;
    const index = mockCohorts.findIndex((c) => c.id === cohortId);
    if (index !== -1) {
      mockCohorts.splice(index, 1);
    }
    router.push(`/learning/courses/${course?.slug || ''}`);
  };

  if (isLoading) {
    return (
      <MemberLayout>
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 bg-ink-100 animate-pulse rounded" />
            <div className="h-6 w-32 bg-ink-100 animate-pulse rounded" />
          </div>
          <Card className="p-6 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="space-y-2">
                <div className="h-8 w-48 bg-ink-100 animate-pulse rounded" />
                <div className="h-4 w-32 bg-ink-100 animate-pulse" />
              </div>
              <div className="h-6 w-20 bg-ink-100 animate-pulse rounded-full" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-3 border border-ink-100 rounded-lg space-y-1">
                  <div className="h-6 w-12 bg-ink-100 animate-pulse" />
                  <div className="h-3 w-16 bg-ink-100 animate-pulse" />
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-6">
            <div className="h-6 w-32 bg-ink-100 animate-pulse rounded mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <div className="h-10 w-10 rounded-full bg-ink-100 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-ink-100 animate-pulse" />
                    <div className="h-3 w-24 bg-ink-100 animate-pulse" />
                  </div>
                  <div className="h-4 w-16 bg-ink-100 animate-pulse" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </MemberLayout>
    );
  }

  if (error || !cohort) {
    return (
      <MemberLayout>
        <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-12 text-center">
          <span className="text-4xl mb-4">🔍</span>
          <p className="text-lg text-ink-600">{error || 'Cohort not found'}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push('/learning/courses')}>
            Back to Courses
          </Button>
        </div>
      </MemberLayout>
    );
  }

  const isOpen = cohort.status === 'OPEN';
  const isFull = cohort.status === 'FULL';
  const isInProgress = cohort.status === 'IN_PROGRESS';
  const isCompleted = cohort.status === 'COMPLETED';

  return (
    <MemberLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-ink-400 hover:text-ink-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          {isFacilitator && (
            <Button
              variant={isManageMode ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setIsManageMode(!isManageMode)}
              className="gap-1"
            >
              {isManageMode ? (
                <>
                  <X className="h-4 w-4" /> Cancel
                </>
              ) : (
                <>
                  <Edit2 className="h-4 w-4" /> Manage Cohort
                </>
              )}
            </Button>
          )}
        </div>

        <Card className="p-6">
          {isManageMode && isFacilitator ? (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-semibold text-ink-900">Edit Cohort</h2>
              {saveError && (
                <div className="rounded-lg bg-clay-50 border border-clay-200 p-3 text-sm text-clay-700 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{saveError}</span>
                </div>
              )}
              {saveSuccess && (
                <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">
                  ✅ Changes saved successfully!
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-ink-700">Cohort Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-dawn-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-ink-700">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as Cohort['status'])}
                    className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-dawn-400"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-ink-700">Start Date</label>
                  <input
                    type="date"
                    value={editStartsOn}
                    onChange={(e) => setEditStartsOn(e.target.value)}
                    className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-dawn-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-ink-700">End Date</label>
                  <input
                    type="date"
                    value={editEndsOn}
                    onChange={(e) => setEditEndsOn(e.target.value)}
                    className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-dawn-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-ink-700">Capacity</label>
                  <input
                    type="number"
                    min="1"
                    value={editCapacity}
                    onChange={(e) => setEditCapacity(parseInt(e.target.value) || 0)}
                    className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-dawn-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-ink-700">
                    Facilitators (comma-separated names)
                  </label>
                  <input
                    type="text"
                    value={editFacilitators}
                    onChange={(e) => setEditFacilitators(e.target.value)}
                    placeholder="e.g., Grace Mwangi, David Ochieng"
                    className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-dawn-400"
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-ink-100">
                <Button variant="primary" size="sm" onClick={handleSaveEdits} disabled={isSaving}>
                  {isSaving ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Saving...
                    </span>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1" /> Save Changes
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsManageMode(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="font-display text-2xl font-semibold text-ink-900">{cohort.name}</h1>
                  {course && (
                    <Link href={`/learning/courses/${course.slug}`} className="text-sm text-ink-500 hover:underline">
                      {course.title}
                    </Link>
                  )}
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-ink-400">
                    <span>
                      📅 {formatDate(cohort.startsOn)} → {formatDate(cohort.endsOn)}
                    </span>
                    <span>•</span>
                    <span>
                      👥 {cohort.enrolled} / {cohort.capacity} enrolled
                    </span>
                    {cohort.facilitators.length > 0 && (
                      <>
                        <span>•</span>
                        <span>👨‍🏫 {cohort.facilitators.join(', ')}</span>
                      </>
                    )}
                  </div>
                </div>
                {statusInfo && (
                  <span className={`text-[10px] font-medium px-3 py-1 rounded-full ${statusInfo.color}`}>
                    {statusInfo.icon} {statusInfo.label}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-ink-100">
                <div>
                  <p className="text-2xl font-bold text-ink-900">{stats.total}</p>
                  <p className="text-xs text-ink-400">Total Members</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
                  <p className="text-xs text-ink-400">Active</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                  <p className="text-xs text-ink-400">Completed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-dawn-600">{stats.avgProgress}%</p>
                  <p className="text-xs text-ink-400">Avg Progress</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-ink-100">
                {isOpen && !isFull && (
                  <Button variant="primary" size="sm">
                    Enrol Now
                  </Button>
                )}
                {isFull && (
                  <Button variant="outline" size="sm">
                    Join Waitlist
                  </Button>
                )}
                {isCompleted && course && (
                  <Link href={`/learning/certificates/${course.id}`}>
                    <Button variant="outline" size="sm">
                      🎓 View Certificates
                    </Button>
                  </Link>
                )}
                {isFacilitator && (
                  <Button variant="primary" size="sm" onClick={() => setIsManageMode(true)}>
                    <Edit2 className="h-4 w-4 mr-1" /> Manage
                  </Button>
                )}
              </div>
            </>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-ink-900">Members</h2>
            <span className="text-sm text-ink-400">
              {stats.total} member{stats.total !== 1 ? 's' : ''}
            </span>
          </div>

          {isManageMode && isFacilitator && (
            <div className="mb-4 p-4 bg-ink-50 rounded-lg border border-ink-100">
              <h3 className="font-medium text-sm text-ink-700 mb-2">Add Member</h3>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  placeholder="Search by name, email, or member number..."
                  value={memberSearch}
                  onChange={(e) => handleSearchMembers(e.target.value)}
                  className="flex-1 min-w-[200px] rounded-md border border-ink-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-dawn-400"
                />
              </div>
              {searchResults.length > 0 && (
                <div className="mt-2 space-y-1">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-2 bg-white rounded border border-ink-100"
                    >
                      <span className="text-sm">
                        {user.firstName} {user.lastName} ({user.memberNumber})
                      </span>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAddMember(user.id)}
                        disabled={isAddingMember}
                      >
                        <PlusCircle className="h-3.5 w-3.5" /> Add
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              {memberSearch.trim().length >= 2 && searchResults.length === 0 && (
                <p className="text-sm text-ink-400 mt-1">No members found.</p>
              )}
            </div>
          )}

          <MemberList
            cohortId={cohort.id}
            canManage={isManageMode && isFacilitator}
            onRemoveMember={handleRemoveMember}
          />
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold text-ink-900 mb-4">Cohort Timeline</h2>
          <CohortTimeline cohort={cohort} />
        </Card>

        {isManageMode && isFacilitator && (
          <Card className="p-6 border-clay-200 bg-clay-50/30">
            <h2 className="font-display text-sm font-semibold text-clay-700">Danger Zone</h2>
            <p className="text-sm text-ink-500 mt-1">
              Deleting a cohort is permanent and cannot be undone. All member data and progress will be lost.
            </p>
            <Button variant="danger" size="sm" className="mt-3" onClick={handleDeleteCohort}>
              <Trash2 className="h-4 w-4 mr-1" /> Delete Cohort
            </Button>
          </Card>
        )}
      </div>
    </MemberLayout>
  );
}
