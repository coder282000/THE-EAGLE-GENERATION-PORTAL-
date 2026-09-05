import { ErrorPage } from "@/components/error/errorpage";

export default function ServerErrorPage() {
  return (
    <ErrorPage
      statusCode={500}
      title="Something Went Wrong"
      message="We're experiencing some technical difficulties on our side. Please try again later, or contact support if the issue persists."
      emoji="😵"
      actions={[
        { label: "Go Home", href: "/", variant: "primary" },
        { label: "Contact Support", href: "/help/support" },
        { label: "Try Again", href: "#", variant: "secondary" }, // Not a real action, but we can add a retry?
      ]}
    />
  );
}