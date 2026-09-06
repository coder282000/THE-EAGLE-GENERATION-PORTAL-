"use client";

import { ErrorPage } from "@/components/error/errorpage";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <ErrorPage
          statusCode={500}
          title="Something Went Wrong"
          message="We've encountered an unexpected error. Please try again or contact support."
          emoji="😵"
          actions={[
            { label: "Try Again", href: "#", variant: "primary" },
            { label: "Go Home", href: "/" },
            { label: "Contact Support", href: "/help/support" },
          ]}
        >
          <button
            onClick={reset}
            className="px-6 py-2.5 bg-sky-600 text-white rounded-md font-medium hover:bg-sky-700 transition focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
          >
            Try Again
          </button>
        </ErrorPage>
      </body>
    </html>
  );
}
