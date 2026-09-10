"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { AuditTrail, type AuditEntry } from "@/components/applications/audit-trail";
import {
  getChapterByCode,
  getChapterMembers,
  getChapterActivity,
  canEditChapter,
  canManageLeaders,
  CHAPTER_TYPE_LABELS,
} from "@/lib/mock/chapters";
import { MEMBER_TIER_LABELS, MEMBER_STATUS_LABELS } from "@/lib/mock/members";
import {
  ArrowLeft,
  Pencil,
  UserCog,
  BarChart3,
  Users,
  MapPin,
} from "lucide-react";

export default function ChapterDetailPage() {
  const params = useParams<{ code: string }>();
  const code = params.code ? decodeURIComponent(params.code) : null;
  const chapter = useMemo(() => (code ? getChapterByCode(code) : null), [code]);

  if (!chapter) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <Card className="p-8 text-center">
          <h1 className="font-display text-xl text-ink-900">Chapter not found</h1>
          <p className="mt-2 text-sm text-ink-500">
            The chapter does not exist, or you do not have permission to view it.
          </p>
          <div className="mt-6">
            <Link href="/admin/chapters">
              <Button variant="primary">Back to chapters</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const members = getChapterMembers(chapter.code);
  const activity = getChapterActivity(chapter.code);
  const canEdit = canEditChapter();
  const canLeaders = canManageLeaders();

  const auditEntries: AuditEntry[] = activity.map((a) => ({
    id: a.id,
    actor: a.actor,
    action: a.type.replace(/_/g, " ").toLowerCase(),
    target: a.title,
    timestamp: a.timestamp,
    category:
      a.type === "member_joined"
        ? "status"
        : a.type === "event"
        ? "interview"
        : a.type === "announcement"
        ? "note"
        : "default",
  }));

  const activeCount = members.filter((m) => m.status === "active").length;
  const pendingCount = members.filter((m) => m.status === "pending").length;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/chapters"
          className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Chapters
        </Link>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-900">
                {chapter.name}
              </h1>
              <span className="inline-block rounded bg-ink-100 px-2 py-0.5 font-mono text-xs font-medium text-ink-700">
                {chapter.code}
              </span>
              <span className="inline-block rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700">
                {CHAPTER_TYPE_LABELS[chapter.type]}
              </span>
            </div>
            <p className="mt-1 flex items-center gap-1 text-sm text-ink-500">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {chapter.location}
            </p>
            {chapter.description && (
              <p className="mt-2 max-w-2xl text-sm text-ink-600">
                {chapter.description}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {canEdit && (
              <Link
                href={`/admin/chapters/${encodeURIComponent(chapter.code)}/edit`}
              >
                <Button variant="outline">
                  <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                  Edit
                </Button>
              </Link>
            )}
            {canLeaders && (
              <Link
                href={`/admin/chapters/${encodeURIComponent(chapter.code)}/leaders`}
              >
                <Button variant="outline">
                  <UserCog className="mr-2 h-4 w-4" aria-hidden="true" />
                  Leaders
                </Button>
              </Link>
            )}
            <Link
              href={`/admin/chapters/${encodeURIComponent(chapter.code)}/performance`}
            >
              <Button variant="outline">
                <BarChart3 className="mr-2 h-4 w-4" aria-hidden="true" />
                Performance
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total members" value={chapter.memberCount} icon={<Users className="h-4 w-4" />} />
        <StatCard label="Active" value={activeCount} tone="green" />
        <StatCard label="Pending" value={pendingCount} tone="dawn" />
        <StatCard label="Activity events" value={activity.length} tone="sky" />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="roster">
            Roster
            {members.length > 0 && <Badge>{members.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="activity">
            Activity
            {activity.length > 0 && <Badge>{activity.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted">
                Leadership
              </h2>
              {chapter.leader ? (
                <div className="mt-4 flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700"
                    aria-hidden="true"
                  >
                    {chapter.leader
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div>
                    <p className="font-medium text-ink-900">{chapter.leader}</p>
                    <p className="text-xs text-ink-500">Chapter Leader</p>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-ink-500">
                  No leader assigned.{" "}
                  {canLeaders && (
                    <Link
                      href={`/admin/chapters/${encodeURIComponent(chapter.code)}/leaders`}
                      className="text-sky-600 hover:underline"
                    >
                      Assign one →
                    </Link>
                  )}
                </p>
              )}
            </Card>

            <Card className="p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted">
                Quick facts
              </h2>
              <dl className="mt-4 space-y-3 text-sm">
                <Row label="Chapter code" value={chapter.code} mono />
                <Row label="Type" value={CHAPTER_TYPE_LABELS[chapter.type]} />
                <Row label="Region" value={chapter.location} />
                <Row label="Total members" value={String(chapter.memberCount)} />
              </dl>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="roster">
          {members.length === 0 ? (
            <EmptyTab message="No members assigned yet." />
          ) : (
            <Card className="overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-ink-100 bg-ink-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-ink-500">Member</th>
                      <th className="hidden px-4 py-3 text-left font-medium text-ink-500 sm:table-cell">
                        Member #
                      </th>
                      <th className="hidden px-4 py-3 text-left font-medium text-ink-500 md:table-cell">
                        Tier
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-ink-500">Status</th>
                      <th className="px-4 py-3 text-right font-medium text-ink-500">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-50">
                    {members.map((m) => (
                      <tr key={m.id} className="hover:bg-ink-50/50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-ink-900">
                            {m.firstName} {m.lastName}
                          </p>
                          <p className="text-xs text-ink-400">{m.email}</p>
                        </td>
                        <td className="hidden px-4 py-3 font-mono text-xs text-ink-500 sm:table-cell">
                          {m.memberNumber}
                        </td>
                        <td className="hidden px-4 py-3 text-ink-600 md:table-cell">
                          {MEMBER_TIER_LABELS[m.tier]}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-medium text-ink-600">
                            {MEMBER_STATUS_LABELS[m.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/admin/members/${m.id}`}
                            className="text-sm font-medium text-sky-600 hover:underline"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="activity">
          <Card className="p-6">
            {auditEntries.length === 0 ? (
              <p className="text-sm text-ink-500">No activity yet.</p>
            ) : (
              <AuditTrail entries={auditEntries} defaultVisible={10} />
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = "ink",
  icon,
}: {
  label: string;
  value: number;
  tone?: "ink" | "green" | "dawn" | "sky";
  icon?: React.ReactNode;
}) {
  const toneClass =
    tone === "green"
      ? "text-green-700"
      : tone === "dawn"
      ? "text-dawn-700"
      : tone === "sky"
      ? "text-sky-700"
      : "text-ink-900";
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-ink-500">
        {icon}
        <p className="text-xs font-medium uppercase tracking-wider">{label}</p>
      </div>
      <p className={`mt-2 text-2xl font-semibold ${toneClass}`}>{value}</p>
    </Card>
  );
}

function Row({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between border-b border-ink-50 pb-2 last:border-0">
      <dt className="text-ink-500">{label}</dt>
      <dd className={mono ? "font-mono text-ink-900" : "text-ink-900"}>{value}</dd>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-ink-100 px-1.5 text-[10px] font-semibold text-ink-600">
      {children}
    </span>
  );
}

function EmptyTab({ message }: { message: string }) {
  return (
    <Card className="p-10 text-center">
      <p className="text-sm text-ink-500">{message}</p>
    </Card>
  );
}