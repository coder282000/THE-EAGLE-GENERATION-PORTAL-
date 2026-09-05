"use client";

import Link from "next/link";
import { Notification } from "@/components/mock/data";
import { Button } from "@/components/button";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onMarkAsUnread: (id: string) => void;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onMarkAsUnread,
}: NotificationItemProps) {
  const { id, title, message, read, createdAt, link } = notification;

  const formattedDate = new Date(createdAt).toLocaleString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleToggleRead = () => {
    if (read) {
      onMarkAsUnread(id);
    } else {
      onMarkAsRead(id);
    }
  };

  const content = (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-start gap-3 p-4 rounded-lg border transition",
        read
          ? "bg-white border-ink-100 hover:border-ink-200"
          : "bg-dawn-50 border-dawn-200 hover:border-dawn-300"
      )}
    >
      {/* Unread indicator */}
      {!read && (
        <div className="flex-shrink-0">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-sky-500" />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium",
            read ? "text-ink-700" : "text-ink-900"
          )}
        >
          {title}
        </p>
        <p
          className={cn(
            "text-sm mt-1",
            read ? "text-ink-500" : "text-ink-700"
          )}
        >
          {message}
        </p>
        <p className="text-xs text-ink-400 mt-2">{formattedDate}</p>
      </div>

      {/* Actions */}
      <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0 ml-auto sm:ml-0">
        {link && (
          <Link href={link}>
            <Button variant="secondary" size="sm">
              View
            </Button>
          </Link>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleRead}
          className="text-xs"
        >
          {read ? "Mark as unread" : "Mark as read"}
        </Button>
      </div>
    </div>
  );

  // If no link, just render the div without Link wrapper
  if (!link) {
    return content;
  }

  return (
    <div className="relative">
      {content}
    </div>
  );
}