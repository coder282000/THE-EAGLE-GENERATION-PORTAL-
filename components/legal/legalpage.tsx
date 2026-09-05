import { ReactNode } from "react";
import Link from "next/link";

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  version: string;
  children: ReactNode;
}

export function LegalPage({ title, lastUpdated, version, children }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-paper">
      <div className="container-portal py-6 max-w-4xl mx-auto">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sky-600 hover:text-sky-700 font-medium mb-4"
        >
          ← Back to Dashboard
        </Link>

        <div className="bg-white rounded-lg shadow-sm border border-ink-100 p-6 md:p-8">
          <h1 className="font-display text-3xl font-bold text-ink-900 mb-2">
            {title}
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-ink-500 border-b border-ink-100 pb-4 mb-6">
            <span>Version {version}</span>
            <span>•</span>
            <span>Last updated: {lastUpdated}</span>
          </div>

          <div className="prose prose-ink max-w-none">
            {children}
          </div>

          {/* Print button */}
          <div className="mt-8 pt-6 border-t border-ink-100 flex justify-end">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center text-sm text-sky-600 hover:text-sky-700 font-medium"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print this page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}