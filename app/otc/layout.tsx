import { MemberLayout } from '@/components/layout/memberLayout';
import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return <MemberLayout>{children}</MemberLayout>;
}