"use client";

import { useState } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/layout/adminLayout";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { mockChapters } from "@/components/mock/data";

export default function AdminChaptersPage() {
  const [chapters] = useState(mockChapters);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-900">
              Chapters
            </h1>
            <p className="mt-1 text-sm text-ink-500">
              Manage all Eagle Generation chapters.
            </p>
          </div>
          <Button variant="primary" onClick={() => alert("Add chapter form coming soon")}>
            ➕ Add Chapter
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {chapters.map((chapter) => (
            <Card key={chapter.code} className="p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-display font-semibold text-ink-900">{chapter.name}</h3>
                  <p className="text-sm text-ink-500">{chapter.code} · {chapter.type}</p>
                  <p className="text-sm mt-1">{chapter.location}</p>
                  <p className="text-sm text-ink-600 mt-2">{chapter.description}</p>
                  <p className="text-sm mt-1">👥 {chapter.memberCount} members</p>
                  {chapter.leader && <p className="text-sm">👤 Leader: {chapter.leader}</p>}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => alert("Edit chapter")}>
                    Edit
                  </Button>
                  <Button variant="danger" onClick={() => alert("Delete chapter")}>
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}