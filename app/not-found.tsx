"use client";

import { ErrorPage } from "@/components/error/errorpage";

export default function NotFound() {
  return (
    <ErrorPage
      statusCode={404}
      title="Page Not Found"
      message="We couldn't find the page you were looking for."
      emoji="🔍"
      actions={[
        { label: "Go Home", href: "/", variant: "primary" },
        { label: "Return to Dashboard", href: "/dashboard" },
        { label: "Browse the Site", href: "/events" },
      ]}
    />
  );
}
