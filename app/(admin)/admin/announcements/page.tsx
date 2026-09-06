'use client';
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/adminLayout";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { mockAnnouncements } from "@/components/mock/data";

type SortField = "title" | "priority" | "createdAt" | "author";
type SortDirection = "asc" | "desc";

const PRIORITY_FILTERS = [
  { value: "all", label: "All Priorities" },
  { value: "HIGH", label: "🔴 High" },
  { value: "MEDIUM", label: "🟠 Medium" },
  { value: "LOW", label: "🟢 Low" },
];

const priorityColors: Record<string, string> = {
  HIGH: "bg-red-100 text-red-700",
  MEDIUM: "bg-dawn-100 text-dawn-700",
  LOW: "bg-green-100 text-green-700",
};

const priorityIcons: Record<string, string> = {
  HIGH: "🔴",
  MEDIUM: "🟠",
  LOW: "🟢",
};

export default function AnnouncementsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const pageSize = 6;

  // Filter and sort announcements
  const filteredAndSorted = useMemo(() => {
    let result = [...mockAnnouncements];

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.content.toLowerCase().includes(query) ||
          a.author.toLowerCase().includes(query)
      );
    }

    // Priority filter
    if (priorityFilter !== "all") {
      result = result.filter((a) => a.priority === priorityFilter);
    }

    // Sort
    result = [...result].sort((a, b) => {
      let aVal: string | number, bVal: string | number;
      switch (sortField) {
        case "title":
          aVal = a.title;
          bVal = b.title;
          break;
        case "priority":
          const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
          aVal = priorityOrder[a.priority as keyof typeof priorityOrder];
          bVal = priorityOrder[b.priority as keyof typeof priorityOrder];
          break;
        case "createdAt":
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
        case "author":
          aVal = a.author;
          bVal = b.author;
          break;
        default:
          aVal = a.createdAt;
          bVal = b.createdAt;
      }
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [searchQuery, priorityFilter, sortField, sortDirection]);

  // Pagination
  const totalItems = filteredAndSorted.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedItems = filteredAndSorted.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Stats
  const stats = {
    total: mockAnnouncements.length,
    high: mockAnnouncements.filter((a) => a.priority === "HIGH").length,
    medium: mockAnnouncements.filter((a) => a.priority === "MEDIUM").length,
    low: mockAnnouncements.filter((a) => a.priority === "LOW").length,
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedItems.map((a) => a.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    const count = selectedIds.length;
    if (count === 0) return;
    if (confirm(`Are you sure you want to delete ${count} announcement${count > 1 ? "s" : ""}?`)) {
      // In production, this would call an API
      alert(`✅ ${count} announcement${count > 1 ? "s" : ""} deleted.`);
      setSelectedIds([]);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this announcement?")) {
      alert("✅ Announcement deleted.");
    }
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const truncate = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-900">
              Announcements
            </h1>
            <p className="mt-1 text-sm text-ink-500">
              Create and manage announcements for all members.
            </p>
          </div>
          <Button variant="primary" onClick={() => router.push("/admin/announcements/new")}>
            📢 Post Announcement
          </Button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg bg-white p-4 text-center shadow-card">
            <p className="text-xl font-semibold text-ink-900">{stats.total}</p>
            <p className="text-xs text-ink-400">Total</p>
          </div>
          <div className="rounded-lg bg-red-50 p-4 text-center shadow-card">
            <p className="text-xl font-semibold text-red-700">{stats.high}</p>
            <p className="text-xs text-red-500">High Priority</p>
          </div>
          <div className="rounded-lg bg-dawn-50 p-4 text-center shadow-card">
            <p className="text-xl font-semibold text-dawn-700">{stats.medium}</p>
            <p className="text-xs text-dawn-500">Medium Priority</p>
          </div>
          <div className="rounded-lg bg-green-50 p-4 text-center shadow-card">
            <p className="text-xl font-semibold text-green-700">{stats.low}</p>
            <p className="text-xs text-green-500">Low Priority</p>
          </div>
        </div>

        {/* Filters and search */}
        <Card className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search */}
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300">🔍</span>
              <input
                type="text"
                placeholder="Search by title, content, or author..."
                className="w-full rounded-md border border-ink-200 py-2 pl-9 pr-4 text-sm outline-none transition-colors placeholder:text-ink-300 focus:border-sky-500"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="flex gap-2">
              <select
                className="rounded-md border border-ink-200 px-3 py-2 text-sm outline-none focus:border-sky-500"
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                {PRIORITY_FILTERS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Bulk actions */}
          {selectedIds.length > 0 && (
            <div className="mt-4 flex items-center gap-3 rounded-md bg-ink-50 p-3">
              <span className="text-sm font-medium text-ink-700">
                {selectedIds.length} selected
              </span>
              <button
                onClick={handleBulkDelete}
                className="rounded-md bg-clay-100 px-3 py-1.5 text-sm font-medium text-clay-700 hover:bg-clay-200 transition-colors"
              >
                🗑️ Delete
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="ml-auto text-sm text-ink-400 hover:text-ink-600"
              >
                Clear
              </button>
            </div>
          )}
        </Card>

        {/* Sort controls */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="font-medium text-ink-400">Sort by:</span>
          <button
            onClick={() => handleSort("createdAt")}
            className={`rounded-md px-2.5 py-1 transition-colors ${
              sortField === "createdAt"
                ? "bg-ink-900 text-white"
                : "text-ink-500 hover:bg-ink-100"
            }`}
          >
            Date {sortField === "createdAt" && (sortDirection === "asc" ? "↑" : "↓")}
          </button>
          <button
            onClick={() => handleSort("title")}
            className={`rounded-md px-2.5 py-1 transition-colors ${
              sortField === "title"
                ? "bg-ink-900 text-white"
                : "text-ink-500 hover:bg-ink-100"
            }`}
          >
            Title {sortField === "title" && (sortDirection === "asc" ? "↑" : "↓")}
          </button>
          <button
            onClick={() => handleSort("priority")}
            className={`rounded-md px-2.5 py-1 transition-colors ${
              sortField === "priority"
                ? "bg-ink-900 text-white"
                : "text-ink-500 hover:bg-ink-100"
            }`}
          >
            Priority {sortField === "priority" && (sortDirection === "asc" ? "↑" : "↓")}
          </button>
          <button
            onClick={() => handleSort("author")}
            className={`rounded-md px-2.5 py-1 transition-colors ${
              sortField === "author"
                ? "bg-ink-900 text-white"
                : "text-ink-500 hover:bg-ink-100"
            }`}
          >
            Author {sortField === "author" && (sortDirection === "asc" ? "↑" : "↓")}
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginatedItems.map((announcement) => (
            <Card
              key={announcement.id}
              className="p-5 transition-all hover:shadow-lg"
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(announcement.id)}
                  onChange={() => toggleSelect(announcement.id)}
                  className="mt-1 h-4 w-4 rounded border-ink-200 text-sky-600 focus:ring-sky-500 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="font-display font-semibold text-ink-900 text-sm">
                      {announcement.title}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityColors[announcement.priority]}`}
                    >
                      {priorityIcons[announcement.priority]}
                      {announcement.priority}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink-600 leading-relaxed">
                    {truncate(announcement.content)}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-ink-400">
                    <span>By {announcement.author}</span>
                    <span>•</span>
                    <span>{formatDate(announcement.createdAt)}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Link
                      href={`/admin/announcements/${announcement.id}/edit`}
                      className="text-xs font-medium text-sky-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <span className="text-ink-200">|</span>
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      className="text-xs font-medium text-clay-500 hover:text-clay-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty state */}
        {paginatedItems.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-ink-400">No announcements match your filters.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between border-t border-ink-100 pt-4 gap-2">
            <p className="text-xs text-ink-400">
              Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalItems)} of {totalItems}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-md px-3 py-1 text-sm text-ink-400 hover:bg-ink-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let page = i + 1;
                if (totalPages > 5) {
                  if (currentPage > 3) page = currentPage - 2 + i;
                  if (page > totalPages) page = totalPages - (4 - i);
                }
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`rounded-md px-3 py-1 text-sm transition-colors ${
                      currentPage === page
                        ? "bg-ink-900 text-white"
                        : "text-ink-600 hover:bg-ink-50"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-md px-3 py-1 text-sm text-ink-400 hover:bg-ink-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
