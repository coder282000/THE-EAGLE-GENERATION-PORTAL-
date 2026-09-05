"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { MemberLayout } from "@/components/layout/memberLayout";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Textarea } from "@/components/textarea";
import { PillarTag } from "@/components/pillarTag";
import { mockPosts, Post } from "@/components/mock/data";

type Pillar = "MARKETPLACE" | "GOVERNANCE" | "TECHNOLOGY";

const PILLAR_OPTIONS: { value: Pillar; label: string; emoji: string }[] = [
  { value: "MARKETPLACE", label: "Marketplace", emoji: "💼" },
  { value: "GOVERNANCE", label: "Governance", emoji: "⚖️" },
  { value: "TECHNOLOGY", label: "Technology", emoji: "🚀" },
];

export default function CreatePostPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [selectedPillar, setSelectedPillar] = useState<Pillar | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Form validation
  const isValid = content.trim().length > 0 && selectedPillar !== null;

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      setError("Please add content and select a pillar.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // In a real app, we would post to the API
      // For now, create a new post object and add it to mockPosts
      const newPost: Post = {
        id: `post-${Date.now()}`,
        author: {
          id: "user-1",
          firstName: "Grace",
          lastName: "Mwangi",
          avatar: "",
          chapterId: "chap-001",
          chapterName: "Kenyatta University",
        },
        content: content.trim(),
        pillar: selectedPillar,
        createdAt: new Date().toISOString(),
        likes: 0,
        comments: 0,
        likedByUser: false,
        isPinned: false,
      };

      // Add to mock data (in real app, API would handle this)
      mockPosts.unshift(newPost);

      setSuccess(true);

      // Redirect to feed after a short delay
      setTimeout(() => {
        router.push("/community/feed");
      }, 1500);
    } catch (err) {
      setError("Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ======== SUCCESS STATE ========
  if (success) {
    return (
      <MemberLayout>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-3xl mb-4">
            ✅
          </div>
          <h2 className="text-xl font-semibold text-ink-900">Post published!</h2>
          <p className="text-sm text-ink-400 mt-1">Your post is now live in the feed.</p>
          <p className="text-xs text-ink-400 mt-2">Redirecting to feed...</p>
        </div>
      </MemberLayout>
    );
  }

  // ======== FORM STATE ========
  return (
    <MemberLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-sm text-ink-400 hover:text-ink-600 transition-colors flex items-center gap-1"
          >
            ← Back
          </button>
          <h1 className="font-display text-2xl font-semibold text-ink-900 mt-2">
            Create Post
          </h1>
          <p className="text-sm text-ink-400 mt-0.5">
            Share something with the Eagle Generation community.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="p-6 space-y-5">
            {/* Error message */}
            {error && (
              <div className="rounded-lg bg-clay-50 border border-clay-200 p-3 text-sm text-clay-700">
                ⚠️ {error}
              </div>
            )}

            {/* Content */}
            <div className="space-y-2">
              <label htmlFor="post-content" className="text-sm font-medium text-ink-700">
                What's on your mind?
                <span className="text-clay-500 ml-1">*</span>
              </label>
              <Textarea
                id="post-content"
                placeholder="Share your thoughts, insights, or questions..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                disabled={isSubmitting}
                className={`resize-none ${content.trim().length > 0 ? "border-dawn-300" : ""}`}
              />
              <div className="flex justify-between text-xs text-ink-400">
                <span>{content.length} characters</span>
                {content.length > 0 && content.length < 10 && (
                  <span className="text-clay-400">A bit more detail would be great</span>
                )}
              </div>
            </div>

            {/* Pillar selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-700">
                Choose a pillar
                <span className="text-clay-500 ml-1">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PILLAR_OPTIONS.map((pillar) => {
                  const isSelected = selectedPillar === pillar.value;
                  return (
                    <button
                      key={pillar.value}
                      type="button"
                      onClick={() => setSelectedPillar(pillar.value)}
                      disabled={isSubmitting}
                      className={`
                        flex items-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all
                        ${isSelected
                          ? "border-ink-900 bg-ink-900 text-white shadow-raised"
                          : "border-ink-200 bg-white text-ink-600 hover:border-ink-400 hover:bg-ink-50"
                        }
                        ${isSubmitting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                      `}
                    >
                      <span className="text-lg">{pillar.emoji}</span>
                      {pillar.label}
                    </button>
                  );
                })}
              </div>
              {selectedPillar && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-ink-400">Selected:</span>
                  <PillarTag pillar={selectedPillar.toLowerCase() as "marketplace" | "governance" | "technology"} />
                </div>
              )}
            </div>

            {/* Image upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-700">Add an image (optional)</label>
              {imagePreview ? (
                <div className="relative rounded-lg border border-ink-200 overflow-hidden bg-ink-50">
                  <img
                    src={imagePreview}
                    alt="Post image preview"
                    className="max-h-64 w-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 rounded-full bg-ink-900/80 p-1.5 text-white hover:bg-ink-900 transition-colors"
                    aria-label="Remove image"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div
                  className="flex items-center justify-center rounded-lg border-2 border-dashed border-ink-200 p-8 hover:border-ink-400 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="text-center">
                    <span className="text-3xl block mb-2">🖼️</span>
                    <p className="text-sm text-ink-600">Click to upload an image</p>
                    <p className="text-xs text-ink-400 mt-1">PNG, JPG, GIF up to 5MB</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-ink-100">
              <div className="flex items-center gap-2 text-xs text-ink-400">
                <span>🔒</span>
                <span>Your post is visible to all Eagle Generation members</span>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!isValid || isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Publishing...
                    </span>
                  ) : (
                    "Publish Post"
                  )}
                </Button>
              </div>
            </div>

            {/* Character counter warning */}
            {content.length > 500 && (
              <p className="text-xs text-clay-500">Post is getting long. Consider breaking it up.</p>
            )}
          </Card>
        </form>
      </div>
    </MemberLayout>
  );
}