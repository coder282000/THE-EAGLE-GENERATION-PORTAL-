"use client";

import { ReactNode } from "react";
import Link from "next/link";

interface ErrorPageProps {
  statusCode: 404 | 403 | 500;
  title: string;
  message: string;
  emoji: string;
  actions: {
    label: string;
    href: string;
    variant?: "primary" | "secondary";
  }[];
  children?: ReactNode;
}

export function ErrorPage({
  statusCode,
  title,
  message,
  emoji,
  actions,
  children,
}: ErrorPageProps) {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="container-portal py-12 max-w-2xl mx-auto text-center">
        {/* Status Code */}
        <div className="text-7xl font-display font-bold text-ink-200 mb-2">
          {statusCode}
        </div>

        {/* Emoji */}
        <div className="text-6xl mb-4">{emoji}</div>

        {/* Title */}
        <h1 className="font-display text-3xl md:text-4xl font-bold text-ink-900 mb-3">
          {title}
        </h1>

        {/* Message */}
        <p className="text-lg text-ink-600 mb-8 max-w-md mx-auto">
          {message}
        </p>

        {/* Optional extra content */}
        {children && <div className="mb-8">{children}</div>}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {actions.map((action, index) => (
            <Link key={index} href={action.href}>
              <button
                className={`px-6 py-2.5 rounded-md font-medium transition focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 ${
                  action.variant === "primary"
                    ? "bg-sky-600 text-white hover:bg-sky-700"
                    : "bg-white text-ink-700 border border-ink-200 hover:bg-paper"
                }`}
              >
                {action.label}
              </button>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <p className="mt-8 text-sm text-ink-400">
          If you think this is a mistake, please{" "}
          <Link href="/help/support" className="text-sky-600 hover:underline">
            contact support
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
