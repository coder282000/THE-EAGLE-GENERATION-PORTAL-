"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/avatar";
import { Button } from "@/components/button";
import { PillarTag } from "@/components/pillarTag";
import { Heart, MessageCircle, Share2, MoreVertical, Flag } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Post } from "@/components/mock/data";
import Link from "next/link";
import { useReportModal } from "@/hooks/useReportModal";

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
}

export function PostCard({ post, onLike }: PostCardProps) {
  const { openReport } = useReportModal();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

  // Handle report
  const handleReport = () => {
    setIsMenuOpen(false);
    openReport({
      type: "POST",
      id: post.id,
      title: `Post by ${post.author.firstName} ${post.author.lastName}`,
      author: post.author.id,
    });
  };

  return (
    <Card className="border border-sky/10 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start gap-3 space-y-0">
        <Avatar className="h-10 w-10">
          {post.author.avatar ? (
            <AvatarImage src={post.author.avatar} alt={`${post.author.firstName} ${post.author.lastName}`} />
          ) : (
            <AvatarFallback>
              {post.author.firstName[0]}{post.author.lastName[0]}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/profile/${post.author.id}`} className="font-medium hover:underline">
              {post.author.firstName} {post.author.lastName}
            </Link>
            {post.isPinned && (
              <span className="text-xs bg-dawn text-ink-dark px-2 py-0.5 rounded-full">Pinned</span>
            )}
            <span className="text-xs text-clay-light">• {timeAgo}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <PillarTag pillar={post.pillar} size="sm" />
            {post.author.chapterName && (
              <span className="text-xs text-clay-light">• {post.author.chapterName}</span>
            )}
          </div>
        </div>

        {/* Menu dropdown */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="More options"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-1 w-48 rounded-lg border border-ink-100 bg-white shadow-lg py-1 z-10 animate-rise">
              <button
                onClick={handleReport}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-clay-600 hover:bg-ink-50 transition-colors"
              >
                <Flag className="h-4 w-4" />
                Report
              </button>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-ink-600 hover:bg-ink-50 transition-colors"
              >
                Share
              </button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap">{post.content}</p>
      </CardContent>
      <CardFooter className="flex items-center gap-4 border-t border-sky/5 pt-3">
        <Button
          variant="ghost"
          size="sm"
          className={`gap-1 ${post.likedByUser ? 'text-red-500' : ''}`}
          onClick={() => onLike(post.id)}
        >
          <Heart className={`h-4 w-4 ${post.likedByUser ? 'fill-current' : ''}`} />
          <span>{post.likes}</span>
        </Button>
        <Link href={`/community/posts/${post.id}`}>
          <Button variant="ghost" size="sm" className="gap-1">
            <MessageCircle className="h-4 w-4" />
            <span>{post.comments}</span>
          </Button>
        </Link>
        <Button variant="ghost" size="sm" className="gap-1">
          <Share2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
