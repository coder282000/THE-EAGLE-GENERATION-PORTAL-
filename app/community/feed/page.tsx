'use client';
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { MemberLayout } from "@/components/layout/memberLayout";
import { PostCard } from "@/components/community/postcard";
import { PostSkeleton } from "@/components/community/PostSkeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { mockPosts, Post } from "@/components/mock/data";

type FilterType = "global" | "chapter";

export default function ActivityFeedPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState<FilterType>("global");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Mock user chapter – replace with actual hook later
  const chapterId = "chap-001"; // mock chapter ID

  // Simulate API fetch
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 800));
        setPosts(mockPosts);
        setError(null);
      } catch (err) {
        setError("Failed to load posts. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Filter posts by global or chapter
  const filteredPosts = useMemo(() => {
    let result = posts;
    if (filter === "chapter" && chapterId) {
      result = result.filter((post) => post.author.chapterId === chapterId);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (post) =>
          post.content.toLowerCase().includes(q) ||
          post.author.firstName.toLowerCase().includes(q) ||
          post.author.lastName.toLowerCase().includes(q) ||
          post.pillar.toLowerCase().includes(q)
      );
    }
    return result;
  }, [posts, filter, chapterId, searchQuery]);

  const handleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes: post.likedByUser ? post.likes - 1 : post.likes + 1,
              likedByUser: !post.likedByUser,
            }
          : post
      )
    );
  };

  const handleNewPost = () => {
    router.push("/community/post/new");
  };

  // ======== LOADING ========
  if (isLoading) {
    return (
      <MemberLayout>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-ink">Activity Feed</h1>
            <Button variant="primary" size="sm" disabled>
              New Post
            </Button>
          </div>
          <div className="flex flex-wrap gap-4">
            <Tabs defaultValue="global" className="w-full md:w-auto">
              <TabsList>
                <TabsTrigger value="global">Global</TabsTrigger>
                <TabsTrigger value="chapter">My Chapter</TabsTrigger>
              </TabsList>
            </Tabs>
            <Input placeholder="Search posts..." className="max-w-sm" disabled />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <PostSkeleton key={i} />
            ))}
          </div>
        </div>
      </MemberLayout>
    );
  }

  // ======== ERROR ========
  if (error) {
    return (
      <MemberLayout>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-lg text-clay">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </MemberLayout>
    );
  }

  // ======== EMPTY ========
  if (filteredPosts.length === 0) {
    return (
      <MemberLayout>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-ink">Activity Feed</h1>
            <Button variant="primary" size="sm" onClick={handleNewPost}>
              New Post
            </Button>
          </div>
          <div className="flex flex-wrap gap-4">
            <Tabs
              defaultValue="global"
              className="w-full md:w-auto"
              onValueChange={(val: string) => setFilter(val as FilterType)}
            >
              <TabsList>
                <TabsTrigger value="global">Global</TabsTrigger>
                <TabsTrigger value="chapter">My Chapter</TabsTrigger>
              </TabsList>
            </Tabs>
            <Input
              placeholder="Search posts..."
              className="max-w-sm"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchQuery(e.target.value)
              }
            />
          </div>
          <div className="rounded-lg border border-dashed border-clay p-8 text-center">
            <p className="text-clay">No posts found.</p>
            <p className="text-sm text-clay-light">
              {searchQuery
                ? "Try adjusting your search or filter."
                : "Be the first to start a conversation!"}
            </p>
          </div>
        </div>
      </MemberLayout>
    );
  }

  // ======== POPULATED ========
  return (
    <MemberLayout>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-ink">Activity Feed</h1>
          <Button variant="primary" size="sm" onClick={handleNewPost}>
            New Post
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Tabs
            defaultValue={filter}
            className="w-full md:w-auto"
            onValueChange={(val: string) => setFilter(val as FilterType)}
          >
            <TabsList>
              <TabsTrigger value="global">Global</TabsTrigger>
              <TabsTrigger value="chapter">My Chapter</TabsTrigger>
            </TabsList>
          </Tabs>
          <Input
            placeholder="Search posts..."
            className="max-w-sm"
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
          />
        </div>
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} onLike={handleLike} />
          ))}
        </div>
      </div>
    </MemberLayout>
  );
}
