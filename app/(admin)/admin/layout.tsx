// app/admin/layout.tsx
import { AdminLayout } from "@/components/layout/adminLayout";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}