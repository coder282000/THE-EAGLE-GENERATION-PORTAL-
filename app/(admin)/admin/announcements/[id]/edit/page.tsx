'use client';

import { useParams, useRouter } from 'next/navigation';
import { AnnouncementForm } from '@/components/admin/announcement-form';
import { useCurrentUser } from '@/lib/mock/current-user';
import {
  getAnnouncementById,
  canEditAnnouncement,
} from '@/lib/mock/communications';

export default function EditAnnouncementPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const user = useCurrentUser();
  const id = params?.id ?? '';

  const item = id ? getAnnouncementById(id, user) : null;

  if (!item) {
    return (
      <div className="rounded-lg border border-ink/10 bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-ink">
          Announcement not found.
        </h2>
        <button
          type="button"
          onClick={() => router.push('/admin/announcements')}
          className="mt-4 rounded-md bg-sky px-4 py-2 text-sm font-medium text-white hover:bg-sky/90"
        >
          Back to announcements
        </button>
      </div>
    );
  }

  if (!canEditAnnouncement(user, item)) {
    return (
      <div className="rounded-lg border border-ink/10 bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-ink">
          You don&apos;t have access to this announcement.
        </h2>
        <p className="mt-2 text-sm text-ink/60">
          Only drafts are editable, and only by their author&apos;s role.
        </p>
      </div>
    );
  }

  return <AnnouncementForm mode="edit" initial={item} />;
}