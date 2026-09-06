"use client";

import { useEffect, useState } from "react";
import { ErrorPage } from "@/components/error/errorpage";

export default function NotFoundPage() {
  const [path, setPath] = useState("");

  useEffect(() => {
    // Get the current path after mount to avoid hydration mismatch
    setPath(window.location.pathname);
  }, []);

  return (
    <ErrorPage
      statusCode={404}
      title="Page Not Found"
      message={
        path
          ? `We couldn't find the page "${path}".`
          : "We couldn't find the page you were looking for."
      }
      emoji="🔍"
      actions={[
        { label: "Go Home", href: "/", variant: "primary" },
        { label: "Return to Dashboard", href: "/dashboard" },
        { label: "Browse the Site", href: "/events" },
      ]}
    />
  );
}
