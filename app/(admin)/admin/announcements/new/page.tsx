"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/adminLayout";
import { Card } from "@/components/card";
import { TextInput, TextareaInput, SelectInput } from "@/components/input";
import { Button } from "@/components/button";

export default function NewAnnouncementPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    content: "",
    priority: "MEDIUM",
  });

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
    console.log("New announcement:", form);
    setIsLoading(false);
    router.push("/admin/announcements");
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900">
            Post Announcement
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Create a new announcement for all members.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="p-6 space-y-5">
            <TextInput
              id="new-title"
              label="Title"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              disabled={isLoading}
              placeholder="Enter announcement title"
            />

            <TextareaInput
              id="new-content"
              label="Content"
              name="content"
              rows={6}
              value={form.content}
              onChange={handleChange}
              required
              disabled={isLoading}
              placeholder="Write the announcement content here..."
              hint="Be clear and concise. Include any important dates or actions required."
            />

            <SelectInput
              id="new-priority"
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
              hint="High priority announcements appear at the top."
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
                {isLoading ? "Publishing..." : "Publish Announcement"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
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