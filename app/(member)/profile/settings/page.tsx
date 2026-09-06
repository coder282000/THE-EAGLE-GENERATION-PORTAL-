"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MemberLayout } from "@/components/layout/memberLayout";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { TextInput, TextareaInput } from "@/components/input";
import { mockMembers } from "@/components/mock/data";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  bio?: string;
}

export default function EditProfilePage() {
  const router = useRouter();
  const member = mockMembers[0];

  const [form, setForm] = useState<FormData>({
    firstName: member.firstName,
    lastName: member.lastName,
    email: member.email,
    phone: member.phone || "",
    bio: member.bio || "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.firstName.trim()) newErrors.firstName = "First name is required";
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Invalid email address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setToast(null);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);

    setToast({ type: "success", message: "Profile updated successfully!" });

    // Redirect after toast
    setTimeout(() => router.push("/profile/me"), 1500);
  };

  return (
    <MemberLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-900">
              Edit Profile
            </h1>
            <p className="mt-1 text-sm text-ink-500">
              Update your personal information and bio.
            </p>
          </div>
          <Link
            href="/profile/me"
            className="text-sm font-medium text-ink-400 hover:text-ink-900 transition-colors"
          >
            Cancel
          </Link>
        </div>

        {/* Toast notification */}
        {toast && (
          <div
            className={`flex items-center gap-3 rounded-lg p-4 text-sm ${
              toast.type === "success"
                ? "border border-dawn-200 bg-dawn-50 text-dawn-700"
                : "border border-clay-200 bg-clay-50 text-clay-700"
            }`}
          >
            <span>{toast.type === "success" ? "✅" : "❌"}</span>
            {toast.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile photo */}
          <Card className="p-5">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
              <div className="relative h-24 w-24 shrink-0">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-ink-100 text-3xl font-medium text-ink-500">
                  {form.firstName?.[0] || "?"}
                </div>
                <button
                  type="button"
                  className="absolute -bottom-1 -right-1 rounded-full bg-ink-900 p-1.5 text-white shadow-sm hover:bg-ink-700 transition-colors"
                  onClick={() => alert("Photo upload would open here")}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
              <div className="text-center sm:text-left">
                <p className="font-medium text-ink-900">Profile Photo</p>
                <p className="text-sm text-ink-400">Click the pencil icon to upload a new photo</p>
                <p className="text-xs text-ink-300">PNG, JPG up to 5MB</p>
              </div>
            </div>
          </Card>

          {/* Form fields */}
          <Card className="space-y-5 p-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <TextInput
                id="firstName"
                label="First name"
                required
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                error={errors.firstName}
                hint="Your given name as it appears on official documents"
              />
              <TextInput
                id="lastName"
                label="Last name"
                required
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                error={errors.lastName}
                hint="Your family name or surname"
              />
            </div>

            <TextInput
              id="email"
              type="email"
              label="Email address"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
              hint="Used for login and notifications"
            />

            <TextInput
              id="phone"
              type="tel"
              label="Phone number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              hint="Include your country code (e.g., +254 7XX XXX XXX)"
            />

            <div>
              <TextareaInput
                id="bio"
                label="Bio"
                rows={4}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Tell the community about yourself, your interests, and what you hope to gain..."
                hint={`${form.bio.length} characters`}
              />
            </div>
          </Card>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:gap-4">
            <Link href="/profile/me" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" fullWidth className="sm:w-auto">
                Cancel
              </Button>
            </Link>
            <Button type="submit" variant="primary" size="lg" fullWidth disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </div>
    </MemberLayout>
  );
}
