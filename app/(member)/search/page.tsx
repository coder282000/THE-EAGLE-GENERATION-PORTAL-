"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { MemberLayout } from "@/components/layout/memberLayout";
import { TextInput } from "@/components/input";
import { 
  mockMembers, 
  mockEvents, 
  mockAnnouncements, 
  mockProducts,
  type Member,
  type Event,
  type Announcement,
  type Product,
} from "@/components/mock/data";

// Types for search results
type SearchResultItem = 
  | { type: "member"; data: Member; href: string }
  | { type: "event"; data: Event; href: string }
  | { type: "announcement"; data: Announcement; href: string }
  | { type: "product"; data: Product; href: string };

type GroupedResults = {
  members: SearchResultItem[];
  events: SearchResultItem[];
  announcements: SearchResultItem[];
  products: SearchResultItem[];
};

export default function GlobalSearchPage() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce logic: update debouncedQuery after 300ms
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Compute search results based on debouncedQuery
  const results = useMemo<GroupedResults>(() => {
    const q = debouncedQuery.toLowerCase().trim();
    if (!q) {
      return { members: [], events: [], announcements: [], products: [] };
    }

    // Helper: check if any field contains the query
    const matches = (text: string) => text.toLowerCase().includes(q);

    // Search members
    const members = mockMembers
      .filter((m) =>
        matches(m.firstName) ||
        matches(m.lastName) ||
        matches(m.email) ||
        matches(m.bio) ||
        matches(m.chapter) ||
        matches(m.memberNumber)
      )
      .map((m) => ({
        type: "member" as const,
        data: m,
        href: `/profile/${m.id}`, // assuming we have profile route by id
      }));

    // Search events
    const events = mockEvents
      .filter((e) =>
        matches(e.title) ||
        matches(e.description) ||
        matches(e.location) ||
        matches(e.type)
      )
      .map((e) => ({
        type: "event" as const,
        data: e,
        href: `/events/${e.id}`,
      }));

    // Search announcements
    const announcements = mockAnnouncements
      .filter((a) =>
        matches(a.title) ||
        matches(a.content) ||
        matches(a.author)
      )
      .map((a) => ({
        type: "announcement" as const,
        data: a,
        href: `/announcements/${a.id}`,
      }));

    // Search products (as "Resources")
    const products = mockProducts
      .filter((p) =>
        matches(p.name) ||
        matches(p.description) ||
        matches(p.category)
      )
      .map((p) => ({
        type: "product" as const,
        data: p,
        href: `/shop/${p.id}`,
      }));

    return { members, events, announcements, products };
  }, [debouncedQuery]);

  // Total count
  const totalResults = useMemo(() => {
    return results.members.length + results.events.length + results.announcements.length + results.products.length;
  }, [results]);

  // Render result item
  const renderResultItem = (item: SearchResultItem) => {
    const { type, data, href } = item;
    let title = "";
    let subtitle = "";
    let icon = "";

    switch (type) {
      case "member":
        const member = data as Member;
        title = `${member.firstName} ${member.lastName}`;
        subtitle = `${member.memberNumber} · ${member.chapter}`;
        icon = "👤";
        break;
      case "event":
        const event = data as Event;
        title = event.title;
        subtitle = `${event.type} · ${new Date(event.date).toLocaleDateString()}`;
        icon = "📅";
        break;
      case "announcement":
        const announcement = data as Announcement;
        title = announcement.title;
        subtitle = `By ${announcement.author} · ${new Date(announcement.createdAt).toLocaleDateString()}`;
        icon = "📢";
        break;
      case "product":
        const product = data as Product;
        title = product.name;
        subtitle = `${product.category} · KES ${product.price.toLocaleString()}`;
        icon = "🛍️";
        break;
    }

    return (
      <Link key={href} href={href}>
        <div className="flex items-start gap-3 p-3 hover:bg-paper rounded-lg transition cursor-pointer border border-transparent hover:border-ink-100">
          <span className="text-2xl">{icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink-900 truncate">{title}</p>
            <p className="text-xs text-ink-500 truncate">{subtitle}</p>
          </div>
          <span className="text-ink-300 text-sm">→</span>
        </div>
      </Link>
    );
  };

  return (
    <MemberLayout>
      <div className="container-portal py-6 max-w-3xl mx-auto">
        {/* Header */}
        <h1 className="font-display text-3xl font-bold text-ink-900 mb-2">
          Global Search
        </h1>
        <p className="text-ink-500 mb-6">
          Search for members, events, announcements, and resources.
        </p>

        {/* Search Input */}
        <div className="mb-6">
          <TextInput
            id="global-search"
            label="Search"
            placeholder="Type to search across the platform..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full"
            autoFocus
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3" aria-live="polite">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-3 animate-pulse">
                <div className="w-8 h-8 bg-ink-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-ink-200 rounded w-3/4" />
                  <div className="h-3 bg-ink-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && debouncedQuery && totalResults === 0 && (
          <div className="text-center py-12">
            <p className="text-ink-500 text-lg">
              No results found for "{debouncedQuery}".
            </p>
            <p className="text-sm text-ink-400 mt-2">
              Try adjusting your search terms or browse our categories.
            </p>
          </div>
        )}

        {/* Initial State (no query) */}
        {!isLoading && !debouncedQuery && (
          <div className="text-center py-12">
            <p className="text-ink-400 text-lg">
              Enter a search term to begin.
            </p>
            <p className="text-sm text-ink-300 mt-2">
              Search for members by name, events by title, announcements, or products.
            </p>
          </div>
        )}

        {/* Results */}
        {!isLoading && debouncedQuery && totalResults > 0 && (
          <div className="space-y-6">
            {/* Members */}
            {results.members.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-ink-500 uppercase tracking-wider mb-2">
                  Members ({results.members.length})
                </h2>
                <div className="space-y-1">
                  {results.members.map((item) => renderResultItem(item))}
                </div>
              </div>
            )}

            {/* Events */}
            {results.events.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-ink-500 uppercase tracking-wider mb-2">
                  Events ({results.events.length})
                </h2>
                <div className="space-y-1">
                  {results.events.map((item) => renderResultItem(item))}
                </div>
              </div>
            )}

            {/* Announcements */}
            {results.announcements.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-ink-500 uppercase tracking-wider mb-2">
                  Announcements ({results.announcements.length})
                </h2>
                <div className="space-y-1">
                  {results.announcements.map((item) => renderResultItem(item))}
                </div>
              </div>
            )}

            {/* Products */}
            {results.products.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-ink-500 uppercase tracking-wider mb-2">
                  Resources ({results.products.length})
                </h2>
                <div className="space-y-1">
                  {results.products.map((item) => renderResultItem(item))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </MemberLayout>
  );
}
