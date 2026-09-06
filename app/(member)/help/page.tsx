"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { MemberLayout } from "@/components/layout/memberLayout";
import { TextInput } from "@/components/input";
import { Button } from "@/components/button";
import { mockFAQ, type FAQItem } from "@/components/mock/data";

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const filteredFAQs = useMemo(() => {
    if (!searchQuery.trim()) return mockFAQ;
    const q = searchQuery.toLowerCase().trim();
    return mockFAQ.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 600);
  };

  if (error) {
    return (
      <MemberLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-ink-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-ink-500 mb-6">{error}</p>
          <Button variant="primary" onClick={handleRetry}>
            Try Again
          </Button>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="container-portal py-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-ink-900">
            Help Centre
          </h1>
          <p className="text-lg text-ink-500 mt-1">
            Find answers to common questions about membership, learning, payments, and more.
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <TextInput
            id="help-search"
            label="Search"
            placeholder="Search for questions or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4" aria-live="polite">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="border border-ink-100 rounded-lg p-4 animate-pulse"
              >
                <div className="h-5 bg-ink-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-ink-100 rounded w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredFAQs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-ink-500 text-lg">
              No results found for "{searchQuery}".
            </p>
            <p className="text-sm text-ink-400 mt-2">
              Try adjusting your search terms or{" "}
              <Link href="/help/support" className="text-sky-600 hover:underline font-medium">
                contact support
              </Link>
              .
            </p>
          </div>
        )}

        {/* Populated State: Accordion */}
        {!isLoading && filteredFAQs.length > 0 && (
          <div className="space-y-3">
            {filteredFAQs.map((item) => (
              <div
                key={item.id}
                className="border border-ink-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => toggleExpand(item.id)}
                  className="w-full text-left px-4 py-3 bg-white hover:bg-paper flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-inset"
                  aria-expanded={expandedId === item.id}
                  aria-controls={`faq-answer-${item.id}`}
                >
                  <span className="font-medium text-ink-900 pr-4">
                    {item.question}
                  </span>
                  <span
                    className="text-ink-400 transition-transform duration-200"
                    style={{
                      transform:
                        expandedId === item.id ? "rotate(180deg)" : "rotate(0)",
                    }}
                  >
                    ▼
                  </span>
                </button>
                <div
                  id={`faq-answer-${item.id}`}
                  className={`px-4 pb-4 transition-all duration-200 ${
                    expandedId === item.id ? "block" : "hidden"
                  }`}
                >
                  <p className="text-ink-700 leading-relaxed">{item.answer}</p>
                  <span className="inline-block mt-3 text-xs font-medium bg-paper text-ink-500 px-2 py-1 rounded">
                    {item.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contact Support CTA */}
        <div className="mt-10 p-4 bg-sky-50 border border-sky-200 rounded-lg flex flex-col sm:flex-row items-center justify-between">
          <p className="text-sky-800 font-medium">
            Still need help? We're here for you.
          </p>
          <Link href="/help/support" className="mt-2 sm:mt-0">
            <Button variant="primary">Contact Support</Button>
          </Link>
        </div>
      </div>
    </MemberLayout>
  );
}
