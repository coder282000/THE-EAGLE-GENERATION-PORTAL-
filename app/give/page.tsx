"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { TextInput, TextareaInput } from "@/components/input";
import { mockSupportPacks, SupportPack } from "@/components/mock/data";

export default function GivePage() {
  const [selectedPack, setSelectedPack] = useState<SupportPack | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Determine amount
    let amount: number | null = null;
    if (selectedPack) {
      amount = selectedPack.amount;
    } else if (customAmount && !isNaN(Number(customAmount)) && Number(customAmount) > 0) {
      amount = Number(customAmount);
    } else {
      setError("Please select a support pack or enter a valid custom amount.");
      return;
    }

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsLoading(false);
    setIsSubmitted(true);
    // In a real app, you'd send the donation data to an API.
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center px-4 py-12">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="text-6xl mb-4">🙏</div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Thank You!</h1>
          <p className="text-ink-500 mt-2">
            Your generous support makes a difference. You will receive a confirmation email shortly.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/">
              <Button variant="primary">Return Home</Button>
            </Link>
            <Link href="/give">
              <Button variant="secondary">Make Another Gift</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <div className="container-portal py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="font-display text-3xl font-bold text-ink-900">Give</h1>
            <p className="mt-2 text-sm text-ink-500">
              Your generosity empowers the next generation of Kingdom leaders across East Africa.
            </p>
          </div>

          {/* Support Packs */}
          <div>
            <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-ink-400 mb-3">
              Choose a Support Pack
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {mockSupportPacks.map((pack) => {
                const isSelected = selectedPack?.id === pack.id;
                return (
                  <button
                    key={pack.id}
                    type="button"
                    onClick={() => {
                      setSelectedPack(pack);
                      setCustomAmount(""); // clear custom amount
                      setError(null);
                    }}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${
                      isSelected
                        ? "border-dawn-500 ring-2 ring-dawn-200 bg-white"
                        : "border-ink-100 hover:border-ink-300 bg-white"
                    }`}
                  >
                    <div className="text-3xl">{pack.icon}</div>
                    <p className="font-display font-bold text-ink-900 mt-1">{pack.name}</p>
                    <p className="text-sm text-dawn-600 font-medium">KES {pack.amount.toLocaleString()}</p>
                    <p className="text-xs text-ink-400 mt-1">{pack.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Amount */}
          <div>
            <label htmlFor="custom-amount" className="block text-sm font-medium text-ink-700">
              Or enter a custom amount (KES)
            </label>
            <div className="mt-1 flex gap-3">
              <input
                id="custom-amount"
                type="number"
                placeholder="e.g., 1000"
                className="flex-1 rounded-md border border-ink-200 px-3 py-2 text-sm outline-none focus:border-sky-500"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  if (e.target.value) setSelectedPack(null);
                  setError(null);
                }}
              />
              {selectedPack && (
                <Button variant="ghost" onClick={() => setSelectedPack(null)}>
                  Clear
                </Button>
              )}
            </div>
            {selectedPack && (
              <p className="text-xs text-ink-400 mt-1">
                Selected: <span className="font-medium">{selectedPack.name}</span> (KES {selectedPack.amount.toLocaleString()})
              </p>
            )}
          </div>

          {/* Donor Form */}
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextInput
                  id="donor-name"
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Your full name"
                  disabled={isLoading}
                />
                <TextInput
                  id="donor-email"
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  disabled={isLoading}
                />
              </div>

              <TextareaInput
                id="donor-message"
                label="Message (optional)"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Leave a message for the Eagle Generation community..."
                disabled={isLoading}
              />

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="h-4 w-4 text-sky-600 rounded border-ink-200"
                />
                <label htmlFor="anonymous" className="text-sm text-ink-600">
                  Donate anonymously (your name will not be shown publicly)
                </label>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Donate Now"}
              </Button>

              <p className="text-xs text-ink-400 text-center">
                Secure payments via M-Pesa, card, or bank transfer. You will receive a receipt.
              </p>
            </form>
          </Card>

          {/* Trust Badges */}
          <div className="flex justify-center gap-6 text-xs text-ink-400">
            <span>🔒 Secure Payment</span>
            <span>📧 Receipt Provided</span>
            <span>🤝 100% Goes to Programmes</span>
          </div>

          <div className="text-center">
            <Link href="/" className="text-sm text-sky-600 hover:underline">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}