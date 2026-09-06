'use client';
"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wordmark } from "@/components/wordmark";
import { TextInput } from "@/components/input";
import { Button } from "@/components/button";
import { Card } from "@/components/card";

interface FormState {
  email: string;
  password: string;
}

type Errors = Partial<Record<keyof FormState, string>>;

function validate(form: FormState): Errors {
  const errors: Errors = {};
  if (!form.email.trim()) {
    errors.email = "Enter your email address.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!form.password) errors.password = "Enter your password.";
  return errors;
}

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({ email: "", password: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    if (authError) setAuthError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setAuthError(null);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSubmitting(false);
    // Redirect to dashboard on success
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-paper">
      <header className="border-b border-ink-100 bg-white">
        <div className="container-portal flex h-16 items-center">
          <Link href="/">
            <Wordmark />
          </Link>
        </div>
      </header>

      <section className="container-portal flex flex-col justify-center py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-dawn-600">
          Member sign in
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-ink-900">
          Welcome back.
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Sign in with the email and password from your membership approval.
        </p>

        <Card className="mt-6 p-5">
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            {authError && (
              <p className="rounded-md bg-clay-50 px-3 py-2 text-sm font-medium text-clay-700">
                {authError}
              </p>
            )}

            <TextInput
              id="email"
              type="email"
              label="Email address"
              required
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              error={errors.email}
              placeholder="you@example.com"
              autoComplete="email"
            />

            <div>
              <TextInput
                id="password"
                type="password"
                label="Password"
                required
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                error={errors.password}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <div className="mt-2 text-right">
                <Link href="/reset-password" className="text-xs font-medium text-sky-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" fullWidth disabled={submitting}>
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-ink-500">
          Not a member yet?{" "}
          <Link href="/" className="font-medium text-sky-600 hover:underline">
            Apply for membership
          </Link>
        </p>
      </section>
    </main>
  );
}
