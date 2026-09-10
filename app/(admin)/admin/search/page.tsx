// app/admin/search/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AdminCard } from "@/components/admin/AdminCard";
import { EmptyState } from "@/components/admin/EmptyState";
import {
  mockAdminSearchIndex,
  adminSearchLabels,
  adminSearchIcons,
  type AdminSearchEntityType,
  type AdminSearchResult,
} from "@/components/mock/data";

const ENTITY_ORDER: AdminSearchEntityType[] = [
  "member",
  "application",
  "order",
  "transaction",
  "chapter",
  "course",
];

export default function GlobalSearchPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Debounce the query
  useEffect(() => {
    if (query.trim() === "") {
      setDebouncedQuery("");
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setIsSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const results = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return [];
    return mockAdminSearchIndex.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.subtitle.toLowerCase().includes(q) ||
        e.metadata?.toLowerCase().includes(q)
    );
  }, [debouncedQuery]);

  // Group results by type
  const grouped = useMemo(() => {
    const groups: Record<AdminSearchEntityType, AdminSearchResult[]> = {
      member: [],
      application: [],
      order: [],
      transaction: [],
      chapter: [],
      course: [],
    };
    for (const r of results) {
      groups[r.type].push(r);
    }
    return groups;
  }, [results]);

  const hasQuery = debouncedQuery.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink">Global Search</h1>
        <p className="text-ink/60 mt-1">
          Search across members, applications, orders, transactions, chapters,
          and courses
        </p>
      </div>

      {/* Search input */}
      <div className="relative">
        <span
          className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40 text-lg pointer-events-none"
          aria-hidden="true"
        >
          🔍
        </span>
        <input
          type="search"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, ID, email, order number, transaction ID..."
          aria-label="Global search"
          className="w-full pl-12 pr-4 py-3 bg-white border border-ink/10 rounded-lg text-base text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-sky/50 focus:border-sky/50 shadow-sm"
        />
        {isSearching && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-ink/40 text-sm">
            Searching...
          </span>
        )}
      </div>

      {/* Results */}
      {!hasQuery ? (
        <AdminCard padding="none">
          <EmptyState
            icon="🔍"
            title="Search across the platform"
            description="Start typing to search members, applications, orders, transactions, chapters, and courses."
          />
        </AdminCard>
      ) : results.length === 0 ? (
        <AdminCard padding="none">
          <EmptyState
            icon="🤔"
            title={`No results for "${debouncedQuery}"`}
            description="Try a different search term, or check the spelling."
          />
        </AdminCard>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-ink/60">
            Found{" "}
            <span className="font-medium text-ink">{results.length}</span>{" "}
            result{results.length !== 1 ? "s" : ""} for{" "}
            <span className="font-medium text-ink">
              &ldquo;{debouncedQuery}&rdquo;
            </span>
          </p>

          {ENTITY_ORDER.map((type) => {
            const items = grouped[type];
            if (items.length === 0) return null;
            return (
              <AdminCard
                key={type}
                title={adminSearchLabels[type]}
                subtitle={`${items.length} result${
                  items.length !== 1 ? "s" : ""
                }`}
                icon={adminSearchIcons[type]}
                padding="sm"
              >
                <ul className="divide-y divide-ink/5">
                  {items.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className="flex items-start gap-3 py-3 px-2 rounded-lg hover:bg-paper transition-colors focus:outline-none focus:ring-2 focus:ring-sky/50"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-ink truncate">
                            {item.title}
                          </p>
                          <p className="text-sm text-ink/60 mt-0.5 truncate">
                            {item.subtitle}
                          </p>
                          {item.metadata && (
                            <p className="text-xs text-ink/40 mt-1 truncate">
                              {item.metadata}
                            </p>
                          )}
                        </div>
                        <span
                          className="text-ink/30 shrink-0 mt-1"
                          aria-hidden="true"
                        >
                          →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </AdminCard>
            );
          })}
        </div>
      )}
    </div>
  );
}