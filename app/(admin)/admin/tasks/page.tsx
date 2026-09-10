// app/admin/tasks/page.tsx
"use client";

import { useMemo, useState } from "react";
import { AdminCard } from "@/components/admin/AdminCard";
import { TaskItem } from "@/components/admin/TaskItem";
import { EmptyState } from "@/components/admin/EmptyState";
import { Button } from "@/components/button";
import { cn } from "@/lib/utils";
import {
  mockAdminMyTasks,
  type AdminTask,
  type AdminPriority,
} from "@/components/mock/data";

type PriorityFilter = "all" | AdminPriority;
type TypeFilter = "all" | AdminTask["type"];

const priorityTabs: { value: PriorityFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const typeFilters: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "All types" },
  { value: "application", label: "Applications" },
  { value: "refund", label: "Refunds" },
  { value: "moderation", label: "Moderation" },
  { value: "kyc", label: "KYC" },
  { value: "aml", label: "AML" },
  { value: "payout", label: "Payouts" },
  { value: "dispute", label: "Disputes" },
];

export default function MyTasksPage() {
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [search, setSearch] = useState("");

  const filteredTasks = useMemo(() => {
    let result = mockAdminMyTasks;

    if (priorityFilter !== "all") {
      result = result.filter((t) => t.priority === priorityFilter);
    }

    if (typeFilter !== "all") {
      result = result.filter((t) => t.type === typeFilter);
    }

    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.entityId.toLowerCase().includes(q) ||
          t.entityLabel.toLowerCase().includes(q)
      );
    }

    return result;
  }, [priorityFilter, typeFilter, search]);

  const counts = useMemo(
    () => ({
      all: mockAdminMyTasks.length,
      critical: mockAdminMyTasks.filter((t) => t.priority === "critical").length,
      high: mockAdminMyTasks.filter((t) => t.priority === "high").length,
      medium: mockAdminMyTasks.filter((t) => t.priority === "medium").length,
      low: mockAdminMyTasks.filter((t) => t.priority === "low").length,
    }),
    []
  );

  const hasActiveFilters =
    search.trim() !== "" || priorityFilter !== "all" || typeFilter !== "all";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">My Tasks</h1>
          <p className="text-ink/60 mt-1">
            {mockAdminMyTasks.length} items require your attention
          </p>
        </div>
        <Button variant="outline" size="sm">
          🔄 Refresh
        </Button>
      </div>

      {/* Priority filter tabs */}
      <div
        role="tablist"
        aria-label="Filter by priority"
        className="flex flex-wrap items-center gap-2 border-b border-ink/10 pb-3"
      >
        {priorityTabs.map((tab) => {
          const isActive = priorityFilter === tab.value;
          const count = counts[tab.value];
          return (
            <button
              key={tab.value}
              role="tab"
              aria-selected={isActive}
              onClick={() => setPriorityFilter(tab.value)}
              className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-sky/50",
                isActive
                  ? "bg-sky text-white"
                  : "text-ink/70 hover:bg-paper"
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center",
                  isActive ? "bg-white/20" : "bg-ink/10"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search + Type filter */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[220px]">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks by title, ID, or entity..."
            aria-label="Search tasks"
            className="w-full px-3 py-2 bg-white border border-ink/10 rounded-lg text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-sky/50 focus:border-sky/50"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
          aria-label="Filter by task type"
          className="px-3 py-2 bg-white border border-ink/10 rounded-lg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-sky/50"
        >
          {typeFilters.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Results count */}
      <p className="text-sm text-ink/60">
        Showing{" "}
        <span className="font-medium text-ink">{filteredTasks.length}</span> of{" "}
        <span className="font-medium text-ink">{mockAdminMyTasks.length}</span>{" "}
        tasks
      </p>

      {/* Task list */}
      {filteredTasks.length === 0 ? (
        <AdminCard padding="none">
          <EmptyState
            icon="🎉"
            title="All caught up!"
            description="No tasks match your current filters. Adjust the filters or check back later."
            action={
              hasActiveFilters ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setPriorityFilter("all");
                    setTypeFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        </AdminCard>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}