'use client';
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MemberLayout } from "@/components/layout/memberLayout";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/avatar";
import { mockConversations, mockMessages, mockMembers, Conversation, Message } from "@/components/mock/data";
import { formatDistanceToNow, format } from "date-fns";

// ============================================================
// Helpers
// ============================================================

function getLastMessage(conversationId: string): Message | undefined {
  const conversationMessages = mockMessages.filter((m) => m.conversationId === conversationId);
  return conversationMessages.length > 0
    ? conversationMessages.reduce((a, b) => (a.sentAt > b.sentAt ? a : b))
    : undefined;
}

function getUnreadCount(conversationId: string, userId: string): number {
  return mockMessages.filter(
    (m) => m.conversationId === conversationId && m.senderId !== userId && !m.readAt
  ).length;
}

function getConversationName(conversation: Conversation, userId: string): string {
  if (conversation.isGroup && conversation.groupName) {
    return conversation.groupName;
  }
  const otherParticipantId = conversation.participants.find((id) => id !== userId);
  const otherUser = mockMembers.find((m) => m.id === otherParticipantId);
  return otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : "Unknown User";
}

function getConversationAvatar(conversation: Conversation, userId: string): string | undefined {
  if (conversation.isGroup && conversation.groupAvatar) {
    return conversation.groupAvatar;
  }
  const otherParticipantId = conversation.participants.find((id) => id !== userId);
  const otherUser = mockMembers.find((m) => m.id === otherParticipantId);
  return otherUser?.avatar;
}

function getConversationInitials(conversation: Conversation, userId: string): string {
  if (conversation.isGroup && conversation.groupName) {
    return conversation.groupName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  const otherParticipantId = conversation.participants.find((id) => id !== userId);
  const otherUser = mockMembers.find((m) => m.id === otherParticipantId);
  return otherUser
    ? `${otherUser.firstName[0]}${otherUser.lastName[0]}`
    : "??";
}

function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return format(date, "h:mm a");
  } else if (diffInHours < 48) {
    return "Yesterday";
  } else if (diffInHours < 168) {
    return format(date, "EEE");
  } else {
    return format(date, "MMM d");
  }
}

// ============================================================
// Conversation Item Component
// ============================================================

function ConversationItem({
  conversation,
  userId,
}: {
  conversation: Conversation;
  userId: string;
}) {
  const lastMessage = getLastMessage(conversation.id);
  const unreadCount = getUnreadCount(conversation.id, userId);
  const name = getConversationName(conversation, userId);
  const avatar = getConversationAvatar(conversation, userId);
  const initials = getConversationInitials(conversation, userId);

  return (
    <Link
      href={`/community/messages/${conversation.id}`}
      className="block group"
    >
      <div className="flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-ink-50 border border-transparent hover:border-ink-100">
        {/* Avatar */}
        <Avatar className="h-12 w-12 shrink-0">
          {avatar ? (
            <AvatarImage src={avatar} alt={name} />
          ) : (
            <AvatarFallback className="bg-dawn-100 text-dawn-700 font-medium">
              {initials}
            </AvatarFallback>
          )}
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className={`font-medium text-ink-900 truncate ${unreadCount > 0 ? "font-semibold" : ""}`}>
              {name}
            </p>
            {lastMessage && (
              <span className="text-xs text-ink-400 shrink-0">
                {formatMessageTime(lastMessage.sentAt)}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between gap-2 mt-0.5">
            {lastMessage ? (
              <p className={`text-sm truncate ${unreadCount > 0 ? "text-ink-700 font-medium" : "text-ink-400"}`}>
                {lastMessage.senderId === userId ? "You: " : ""}
                {lastMessage.content}
              </p>
            ) : (
              <p className="text-sm text-ink-400 italic">No messages yet</p>
            )}
            {unreadCount > 0 && (
              <span className="shrink-0 bg-dawn-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// ============================================================
// Main Page Component
// ============================================================

export default function MessagesPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Current user (mock: user '1' is logged in)
  const currentUserId = "1";

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 600));
        setConversations(mockConversations);
        setError(null);
      } catch (err) {
        setError("Failed to load conversations. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchConversations();
  }, []);

  // Filter conversations by search
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;

    const q = searchQuery.toLowerCase().trim();
    return conversations.filter((conv) => {
      const name = getConversationName(conv, currentUserId).toLowerCase();
      return name.includes(q);
    });
  }, [conversations, searchQuery]);

  // Sort by latest message time (newest first)
  const sortedConversations = useMemo(() => {
    return [...filteredConversations].sort((a, b) => {
      const aLast = getLastMessage(a.id);
      const bLast = getLastMessage(b.id);
      if (!aLast && !bLast) return 0;
      if (!aLast) return 1;
      if (!bLast) return -1;
      return new Date(bLast.sentAt).getTime() - new Date(aLast.sentAt).getTime();
    });
  }, [filteredConversations]);

  // Total unread count
  const totalUnread = useMemo(() => {
    return conversations.reduce((sum, conv) => {
      return sum + getUnreadCount(conv.id, currentUserId);
    }, 0);
  }, [conversations]);

  // ======== LOADING STATE ========
  if (isLoading) {
    return (
      <MemberLayout>
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-semibold text-ink-900">Messages</h1>
              <p className="text-sm text-ink-400">Your conversations</p>
            </div>
            <Button variant="primary" size="sm" disabled>
              + New Message
            </Button>
          </div>
          <div className="space-y-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <div className="h-12 w-12 rounded-full bg-ink-100 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-ink-100 animate-pulse" />
                  <div className="h-3 w-48 bg-ink-100 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </MemberLayout>
    );
  }

  // ======== ERROR STATE ========
  if (error) {
    return (
      <MemberLayout>
        <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-12 text-center">
          <span className="text-4xl mb-4">⚠️</span>
          <p className="text-lg text-ink-600">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </MemberLayout>
    );
  }

  // ======== EMPTY STATE ========
  if (sortedConversations.length === 0) {
    return (
      <MemberLayout>
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-semibold text-ink-900">Messages</h1>
              <p className="text-sm text-ink-400">Your conversations</p>
            </div>
            <Link href="/community/messages/new">
              <Button variant="primary" size="sm">
                + New Message
              </Button>
            </Link>
          </div>
          {searchQuery && (
            <Input
              placeholder="Search conversations..."
              className="w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          )}
          <Card className="border border-dashed border-ink-200 p-8 text-center">
            <span className="text-4xl block mb-3">💬</span>
            <p className="text-ink-500">
              {searchQuery ? "No conversations match your search." : "No conversations yet."}
            </p>
            <p className="text-sm text-ink-400 mt-1">
              {searchQuery
                ? "Try adjusting your search term."
                : "Start a new conversation with a fellow Eagle!"}
            </p>
            {!searchQuery && (
              <Link href="/community/messages/new">
                <Button variant="primary" size="sm" className="mt-4">
                  + New Message
                </Button>
              </Link>
            )}
          </Card>
        </div>
      </MemberLayout>
    );
  }

  // ======== POPULATED STATE ========
  return (
    <MemberLayout>
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink-900">Messages</h1>
            <p className="text-sm text-ink-400">
              Your conversations
              {totalUnread > 0 && (
                <span className="ml-2 text-dawn-600 font-medium">
                  • {totalUnread} unread
                </span>
              )}
            </p>
          </div>
          <Link href="/community/messages/new">
            <Button variant="primary" size="sm">
              + New Message
            </Button>
          </Link>
        </div>

        {/* Search */}
        <Input
          placeholder="Search conversations..."
          className="w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Conversation list */}
        <Card className="p-2 divide-y divide-ink-50">
          {sortedConversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              userId={currentUserId}
            />
          ))}
        </Card>
      </div>
    </MemberLayout>
  );
}
