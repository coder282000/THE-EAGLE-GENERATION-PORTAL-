"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MemberLayout } from "@/components/layout/memberLayout";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/avatar";
import { Button } from "@/components/button";
import { PillarTag } from "@/components/pillarTag";
import { Textarea } from "@/components/textarea";
import { Heart, MessageCircle, Share2, ArrowLeft, MoreVertical, Flag } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { mockPosts, mockComments, Post, Comment } from "@/components/mock/data";
import { useReportModal } from "@/hooks/useReportModal";

// ============================================================
// Comment Item Component (Recursive for nested replies)
// ============================================================

interface CommentItemProps {
  comment: Comment;
  onLike: (commentId: string) => void;
  onReply: (parentId: string) => void;
  onReport: (comment: Comment) => void;
  replies?: Comment[];
  level?: number;
}

function CommentItem({ comment, onLike, onReply, onReport, replies = [], level = 0 }: CommentItemProps) {
  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });
  const initials = comment.author.firstName[0] + comment.author.lastName[0];
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleReplySubmit = () => {
    if (replyContent.trim()) {
      // In real app, call API to add reply
      setShowReplyForm(false);
      setReplyContent("");
      alert("Reply added! (Mock)");
    }
  };

  const handleReport = () => {
    setIsMenuOpen(false);
    onReport(comment);
  };

  return (
    <div className={`flex gap-3 ${level > 0 ? "ml-8 mt-3" : "mt-4"}`}>
      {/* Avatar */}
      <Link href={`/profile/${comment.author.id}`} className="shrink-0">
        <Avatar className="h-8 w-8">
          {comment.author.avatar ? (
            <AvatarImage src={comment.author.avatar} alt={`${comment.author.firstName} ${comment.author.lastName}`} />
          ) : (
            <AvatarFallback className="bg-ink-100 text-ink-700 text-xs font-medium">
              {initials}
            </AvatarFallback>
          )}
        </Avatar>
      </Link>

      {/* Comment body */}
      <div className="flex-1 min-w-0">
        <div className="rounded-lg bg-ink-50 px-3 py-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <Link href={`/profile/${comment.author.id}`} className="font-medium text-sm text-ink-900 hover:underline">
                {comment.author.firstName} {comment.author.lastName}
              </Link>
              <span className="text-xs text-ink-400">• {timeAgo}</span>
            </div>
            {/* Comment menu */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="More options"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
              {isMenuOpen && (
                <div className="absolute right-0 mt-1 w-40 rounded-lg border border-ink-100 bg-white shadow-lg py-1 z-10 animate-rise">
                  <button
                    onClick={handleReport}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-clay-600 hover:bg-ink-50 transition-colors"
                  >
                    <Flag className="h-3.5 w-3.5" />
                    Report
                  </button>
                </div>
              )}
            </div>
          </div>
          <p className="text-sm text-ink-800 mt-0.5">{comment.content}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 mt-1">
          <button
            onClick={() => onLike(comment.id)}
            className={`flex items-center gap-1 text-xs transition-colors ${
              comment.likedByUser ? "text-clay-500" : "text-ink-400 hover:text-ink-600"
            }`}
          >
            <Heart className={`h-3.5 w-3.5 ${comment.likedByUser ? "fill-clay-500" : ""}`} />
            <span>{comment.likes}</span>
          </button>
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="text-xs text-ink-400 hover:text-ink-600 transition-colors"
          >
            Reply
          </button>
        </div>

        {/* Reply form */}
        {showReplyForm && (
          <div className="mt-2 flex gap-2">
            <Textarea
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={2}
              className="flex-1 text-sm"
            />
            <div className="flex flex-col gap-1">
              <Button variant="primary" size="sm" onClick={handleReplySubmit}>
                Reply
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowReplyForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Nested replies */}
        {replies.length > 0 && (
          <div className="mt-2 space-y-2">
            {replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                onLike={onLike}
                onReply={onReply}
                onReport={onReport}
                replies={[]}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Main Page Component
// ============================================================

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  const { openReport, ReportModal } = useReportModal();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isPostMenuOpen, setIsPostMenuOpen] = useState(false);

  // Fetch post and comments
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 600));

        const foundPost = mockPosts.find((p) => p.id === postId);
        if (!foundPost) {
          setError("Post not found");
          setIsLoading(false);
          return;
        }
        setPost(foundPost);

        const postComments = mockComments.filter((c) => c.postId === postId);
        setComments(postComments);

        setError(null);
      } catch (err) {
        setError("Failed to load post. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [postId]);

  // Build comment tree (parentId -> children)
  const commentTree = useMemo(() => {
    const map: Record<string, Comment[]> = {};
    const roots: Comment[] = [];

    comments.forEach((c) => {
      if (c.parentId) {
        if (!map[c.parentId]) map[c.parentId] = [];
        map[c.parentId].push(c);
      } else {
        roots.push(c);
      }
    });

    return roots.map((root) => ({
      ...root,
      replies: map[root.id] || [],
    }));
  }, [comments]);

  // Handle comment like (optimistic)
  const handleCommentLike = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? {
              ...c,
              likes: c.likedByUser ? c.likes - 1 : c.likes + 1,
              likedByUser: !c.likedByUser,
            }
          : c
      )
    );
  };

  // Handle post like
  const handlePostLike = () => {
    if (!post) return;
    setPost({
      ...post,
      likes: post.likedByUser ? post.likes - 1 : post.likes + 1,
      likedByUser: !post.likedByUser,
    });
  };

  // Handle new comment submit
  const handleCommentSubmit = async () => {
    if (!newComment.trim() || !post) return;

    setIsSubmittingComment(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const newCommentObj: Comment = {
        id: `comment-${Date.now()}`,
        postId: post.id,
        author: {
          id: "1",
          firstName: "Grace",
          lastName: "Mwangi",
          avatar: "",
        },
        content: newComment.trim(),
        createdAt: new Date().toISOString(),
        parentId: undefined,
        likes: 0,
        likedByUser: false,
      };

      setComments((prev) => [...prev, newCommentObj]);
      setNewComment("");
      setPost({
        ...post,
        comments: post.comments + 1,
      });
    } catch (err) {
      alert("Failed to post comment. Please try again.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Handle report for comments
  const handleCommentReport = (comment: Comment) => {
    openReport({
      type: "COMMENT",
      id: comment.id,
      title: `Comment by ${comment.author.firstName} ${comment.author.lastName}`,
      author: comment.author.id,
    });
  };

  // Handle report for post
  const handlePostReport = () => {
    if (!post) return;
    setIsPostMenuOpen(false);
    openReport({
      type: "POST",
      id: post.id,
      title: `Post by ${post.author.firstName} ${post.author.lastName}`,
      author: post.author.id,
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <MemberLayout>
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" disabled>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="h-6 w-32 bg-ink-100 rounded animate-pulse" />
          </div>
          <Card className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-ink-100 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-ink-100 animate-pulse" />
                <div className="h-3 w-20 bg-ink-100 animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-ink-100 animate-pulse" />
              <div className="h-4 w-3/4 bg-ink-100 animate-pulse" />
            </div>
            <div className="flex gap-4">
              <div className="h-6 w-12 bg-ink-100 animate-pulse" />
              <div className="h-6 w-12 bg-ink-100 animate-pulse" />
            </div>
          </Card>
        </div>
      </MemberLayout>
    );
  }

  // Error state
  if (error || !post) {
    return (
      <MemberLayout>
        <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-12 text-center">
          <span className="text-4xl mb-4">🔍</span>
          <p className="text-lg text-ink-600">{error || "Post not found"}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/community/feed")}
          >
            Back to Feed
          </Button>
        </div>
      </MemberLayout>
    );
  }

  // Populated state
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
  const initials = post.author.firstName[0] + post.author.lastName[0];
  const pillarMap: Record<string, "marketplace" | "governance" | "technology"> = {
    MARKETPLACE: "marketplace",
    GOVERNANCE: "governance",
    TECHNOLOGY: "technology",
  };

  return (
    <MemberLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back navigation */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-ink-400 hover:text-ink-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Feed
        </button>

        {/* Post Card */}
        <Card className="border border-ink-100 shadow-sm">
          <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-3">
            <Link href={`/profile/${post.author.id}`} className="shrink-0">
              <Avatar className="h-10 w-10">
                {post.author.avatar ? (
                  <AvatarImage src={post.author.avatar} alt={`${post.author.firstName} ${post.author.lastName}`} />
                ) : (
                  <AvatarFallback className="bg-dawn-100 text-dawn-700 text-sm font-medium">
                    {initials}
                  </AvatarFallback>
                )}
              </Avatar>
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link href={`/profile/${post.author.id}`} className="font-medium text-ink-900 hover:underline text-sm">
                  {post.author.firstName} {post.author.lastName}
                </Link>
                {post.isPinned && (
                  <span className="text-[10px] font-medium bg-dawn-100 text-dawn-700 px-2 py-0.5 rounded-full">
                    📌 Pinned
                  </span>
                )}
                <span className="text-xs text-ink-400">• {timeAgo}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <PillarTag pillar={pillarMap[post.pillar] || "marketplace"} />
                {post.author.chapterName && (
                  <span className="text-xs text-ink-400">• {post.author.chapterName}</span>
                )}
              </div>
            </div>
            {/* Post menu with Report */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8"
                onClick={() => setIsPostMenuOpen(!isPostMenuOpen)}
                aria-label="More options"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
              {isPostMenuOpen && (
                <div className="absolute right-0 mt-1 w-48 rounded-lg border border-ink-100 bg-white shadow-lg py-1 z-10 animate-rise">
                  <button
                    onClick={handlePostReport}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-clay-600 hover:bg-ink-50 transition-colors"
                  >
                    <Flag className="h-4 w-4" />
                    Report
                  </button>
                  <button
                    onClick={() => setIsPostMenuOpen(false)}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-ink-600 hover:bg-ink-50 transition-colors"
                  >
                    Share
                  </button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            <p className="whitespace-pre-wrap text-sm text-ink-800 leading-relaxed">
              {post.content}
            </p>
          </CardContent>
          <CardFooter className="flex items-center gap-6 border-t border-ink-100 pt-3">
            <button
              onClick={handlePostLike}
              className={`flex items-center gap-2 text-sm transition-colors ${
                post.likedByUser ? "text-clay-500" : "text-ink-400 hover:text-clay-500"
              }`}
            >
              <Heart className={`h-5 w-5 ${post.likedByUser ? "fill-clay-500" : ""}`} />
              <span className="font-medium">{post.likes}</span>
            </button>
            <div className="flex items-center gap-2 text-sm text-ink-400">
              <MessageCircle className="h-5 w-5" />
              <span className="font-medium">{post.comments}</span>
            </div>
            <Button variant="ghost" size="sm" className="gap-2 px-0 text-ink-400 hover:text-ink-600 ml-auto">
              <Share2 className="h-5 w-5" />
              Share
            </Button>
          </CardFooter>
        </Card>

        {/* Comment Form */}
        <Card className="border border-ink-100 p-4">
          <h3 className="font-display text-sm font-semibold text-ink-900 mb-3">
            Add a Comment
          </h3>
          <div className="flex gap-3">
            <Textarea
              placeholder="Share your thoughts..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              className="flex-1 resize-none"
            />
          </div>
          <div className="flex justify-end mt-3">
            <Button
              variant="primary"
              size="sm"
              disabled={!newComment.trim() || isSubmittingComment}
              onClick={handleCommentSubmit}
            >
              {isSubmittingComment ? (
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Posting...
                </span>
              ) : (
                "Post Comment"
              )}
            </Button>
          </div>
        </Card>

        {/* Comments Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-sm font-semibold text-ink-900">
              Comments ({comments.length})
            </h3>
          </div>

          {commentTree.length === 0 ? (
            <Card className="border border-dashed border-ink-200 p-6 text-center">
              <p className="text-ink-400">No comments yet. Be the first to share your thoughts!</p>
            </Card>
          ) : (
            <Card className="border border-ink-100 p-4">
              {commentTree.map((root) => (
                <CommentItem
                  key={root.id}
                  comment={root}
                  onLike={handleCommentLike}
                  onReply={() => {}}
                  onReport={handleCommentReport}
                  replies={root.replies || []}
                />
              ))}
            </Card>
          )}
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal />
    </MemberLayout>
  );
}
