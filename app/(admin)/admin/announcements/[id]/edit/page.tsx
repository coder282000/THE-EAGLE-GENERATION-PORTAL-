'use client';
"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/adminLayout";
import { Card } from "@/components/card";
import { TextInput, TextareaInput, SelectInput } from "@/components/input";
import { Button } from "@/components/button";
import { mockAnnouncements } from "@/components/mock/data";

export default function EditAnnouncementPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const announcement = useMemo(() => {
    return mockAnnouncements.find((a) => a.id === id);
  }, [id]);

  const [form, setForm] = useState({
    title: "",
    content: "",
    priority: "MEDIUM",
  });

  useEffect(() => {
    if (announcement) {
      setForm({
        title: announcement.title,
        content: announcement.content,
        priority: announcement.priority,
      });
    }
    setIsLoadingData(false);
  }, [announcement]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!form.title.trim()) {
      setError("Title is required.");
      setIsLoading(false);
      return;
    }
    if (!form.content.trim()) {
      setError("Content is required.");
      setIsLoading(false);
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 1200));
    console.log("Updated announcement:", { id, ...form });
    setIsLoading(false);
    router.push("/admin/announcements");
  };

  if (isLoadingData) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-dawn-400 border-t-transparent mx-auto" />
            <p className="mt-4 text-sm text-ink-500">Loading announcement...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!announcement) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <p className="text-4xl mb-4">📢</p>
          <h1 className="text-2xl font-bold text-ink-900">Announcement Not Found</h1>
          <p className="text-ink-500 mt-2">
            The announcement you're looking for doesn't exist.
          </p>
          <Button
            variant="secondary"
            className="mt-6"
            onClick={() => router.push("/admin/announcements")}
          >
            ← Back to Announcements
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900">
            Edit Announcement
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Update the announcement content.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="p-6 space-y-5">
            <TextInput
              id="edit-title"
              label="Title"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              disabled={isLoading}
            />

            <TextareaInput
              id="edit-content"
              label="Content"
              name="content"
              rows={6}
              value={form.content}
              onChange={handleChange}
              required
              disabled={isLoading}
              hint="Be clear and concise. Include any important dates or actions required."
            />

            <SelectInput
              id="edit-priority"
              label="Priority"
              name="priority"
              options={[
                { value: "HIGH", label: "🔴 High" },
                { value: "MEDIUM", label: "🟠 Medium" },
                { value: "LOW", label: "🟢 Low" },
              ]}
              value={form.priority}
              onChange={handleChange}
              disabled={isLoading}
            />

            {error && (
              <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push("/admin/announcements")}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </AdminLayout>
  );
}
