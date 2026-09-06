'use client';
import { ErrorPage } from "@/components/error/errorpage";

export default function ForbiddenPage() {
  return (
    <ErrorPage
      statusCode={403}
      title="Permission Denied"
      message="You don't have permission to view this page. Please check your account permissions or contact support if you believe this is an error."
      emoji="🚫"
      actions={[
        { label: "Return to Dashboard", href: "/dashboard", variant: "primary" },
        { label: "Contact Support", href: "/help/support" },
      ]}
    />
  );
}
