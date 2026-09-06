'use client';
"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MemberLayout } from "@/components/layout/memberLayout";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/avatar";
import { Input } from "@/components/input";
import {
  mockConversations,
  mockMessages,
  mockMembers,
  Conversation,
  Message,
} from "@/components/mock/data";
import { format, formatDistanceToNow } from "date-fns";

// ============================================================
// Helpers
// ============================================================

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

function getOtherParticipant(conversation: Conversation, userId: string) {
  const otherId = conversation.participants.find((id) => id !== userId);
  return mockMembers.find((m) => m.id === otherId);
}

function getParticipantNames(conversation: Conversation, userId: string): string {
  return conversation.participants
    .filter((id) => id !== userId)
    .map((id) => {
      const user = mockMembers.find((m) => m.id === id);
      return user ? `${user.firstName} ${user.lastName}` : "Unknown";
    })
    .join(", ");
}

// ============================================================
// Message Item Component
// ============================================================

function MessageItem({
  message,
  isOwn,
  showAvatar,
  showTime,
}: {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
  showTime: boolean;
}) {
  const sender = mockMembers.find((m) => m.id === message.senderId);
  const initials = sender
    ? `${sender.firstName[0]}${sender.lastName[0]}`
    : "??";

  const timeStr = format(new Date(message.sentAt), "h:mm a");
  const isRead = !!message.readAt;

  return (
    <div className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      {!isOwn && showAvatar ? (
        <Avatar className="h-8 w-8 shrink-0 mt-0.5">
          {sender?.avatar ? (
            <AvatarImage src={sender.avatar} alt={`${sender?.firstName} ${sender?.lastName}`} />
          ) : (
            <AvatarFallback className="bg-ink-100 text-ink-700 text-xs font-medium">
              {initials}
            </AvatarFallback>
          )}
        </Avatar>
      ) : (
        !isOwn && <div className="h-8 w-8 shrink-0" />
      )}

      {/* Message bubble */}
      <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[75%]`}>
        {!isOwn && showAvatar && sender && (
          <p className="text-xs text-ink-500 mb-0.5 ml-1">
            {sender.firstName} {sender.lastName}
          </p>
        )}
        <div
          className={`rounded-2xl px-4 py-2.5 break-words ${
            isOwn
              ? "bg-dawn-500 text-white rounded-br-none"
              : "bg-ink-100 text-ink-900 rounded-bl-none"
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
        <div className={`flex items-center gap-1 mt-0.5 text-[10px] text-ink-400 ${isOwn ? "flex-row-reverse" : ""}`}>
          <span>{timeStr}</span>
          {isOwn && (
            <span>{isRead ? "✓✓" : "✓"}</span>
          )}
        </div>
      </div>

      {isOwn && <div className="h-8 w-8 shrink-0" />}
    </div>
  );
}

// ============================================================
// Date Separator Component
// ============================================================

function DateSeparator({ date }: { date: string }) {
  const messageDate = new Date(date);
  const now = new Date();
  const isToday = messageDate.toDateString() === now.toDateString();
  const isYesterday = new Date(now.setDate(now.getDate() - 1)).toDateString() === messageDate.toDateString();

  let label;
  if (isToday) label = "Today";
  else if (isYesterday) label = "Yesterday";
  else label = format(messageDate, "EEEE, MMMM d, yyyy");

  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 border-t border-ink-100" />
      <span className="text-xs font-medium text-ink-400 uppercase tracking-wider">{label}</span>
      <div className="flex-1 border-t border-ink-100" />
    </div>
  );
}

// ============================================================
// Main Page Component
// ============================================================

export default function MessageThreadPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentUserId = "1"; // mock current user

  // Fetch conversation and messages
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 500));

        const foundConversation = mockConversations.find(
          (c) => c.id === conversationId
        );
        if (!foundConversation) {
          setError("Conversation not found");
          setIsLoading(false);
          return;
        }

        setConversation(foundConversation);

        // Get messages for this conversation
        const conversationMessages = mockMessages.filter(
          (m) => m.conversationId === conversationId
        );
        setMessages(conversationMessages);

        // Mark messages as read (mock)
        // In real app, call API to mark as read

        setError(null);
      } catch (err) {
        setError("Failed to load conversation. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [conversationId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on load
  useEffect(() => {
    if (!isLoading && !error) {
      inputRef.current?.focus();
    }
  }, [isLoading, error]);

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversation || isSending) return;

    setIsSending(true);

    // Optimistic message
    const optimisticMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId: conversation.id,
      senderId: currentUserId,
      content: newMessage.trim(),
      sentAt: new Date().toISOString(),
      readAt: undefined,
      type: "text",
    };

    // Add optimistically
    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage("");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 600));

      // In real app, we'd get the real message back from API
      // For mock, we'll update the optimistic message with a read status
      setMessages((prev) =>
        prev.map((m) =>
          m.id === optimisticMessage.id
            ? { ...m, readAt: new Date().toISOString() }
            : m
        )
      );
    } catch (err) {
      // Failed – remove optimistic message
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
      setNewMessage(newMessage.trim());
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ======== LOADING STATE ========
  if (isLoading) {
    return (
      <MemberLayout>
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 bg-ink-100 animate-pulse rounded" />
            <div className="h-6 w-32 bg-ink-100 animate-pulse rounded" />
          </div>
          <Card className="p-4 space-y-4 min-h-[400px] flex flex-col">
            <div className="flex items-center gap-3 pb-4 border-b border-ink-100">
              <div className="h-10 w-10 rounded-full bg-ink-100 animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-5 w-32 bg-ink-100 animate-pulse" />
                <div className="h-3 w-24 bg-ink-100 animate-pulse" />
              </div>
            </div>
            <div className="flex-1 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${i % 2 === 0 ? "" : "flex-row-reverse"}`}
                >
                  <div className="h-8 w-8 rounded-full bg-ink-100 animate-pulse" />
                  <div className={`space-y-2 max-w-[75%] ${i % 2 === 0 ? "" : "items-end"}`}>
                    <div className="h-10 w-48 bg-ink-100 animate-pulse rounded-2xl" />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-4 border-t border-ink-100">
              <div className="flex-1 h-10 bg-ink-100 animate-pulse rounded-md" />
              <div className="h-10 w-20 bg-ink-100 animate-pulse rounded-md" />
            </div>
          </Card>
        </div>
      </MemberLayout>
    );
  }

  // ======== ERROR STATE ========
  if (error || !conversation) {
    return (
      <MemberLayout>
        <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-12 text-center">
          <span className="text-4xl mb-4">🔍</span>
          <p className="text-lg text-ink-600">{error || "Conversation not found"}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/community/messages")}>
            Back to Messages
          </Button>
        </div>
      </MemberLayout>
    );
  }

  // ======== POPULATED STATE ========
  const name = getConversationName(conversation, currentUserId);
  const avatar = getConversationAvatar(conversation, currentUserId);
  const initials = getConversationInitials(conversation, currentUserId);
  const isGroup = conversation.isGroup;
  const participantNames = isGroup ? getParticipantNames(conversation, currentUserId) : "";
  const otherUser = !isGroup ? getOtherParticipant(conversation, currentUserId) : null;

  // Group messages by date for separators
  const messagesWithSeparators = useMemo(() => {
    const result: (Message | { type: "separator"; date: string })[] = [];
    let lastDate: string | null = null;

    messages.forEach((msg) => {
      const date = new Date(msg.sentAt).toDateString();
      if (date !== lastDate) {
        result.push({ type: "separator", date: msg.sentAt });
        lastDate = date;
      }
      result.push(msg);
    });

    return result;
  }, [messages]);

  return (
    <MemberLayout>
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/community/messages")}
            className="text-ink-400 hover:text-ink-600 transition-colors p-1"
            aria-label="Back to messages"
          >
            ←
          </button>
          <Link href={`/profile/${isGroup ? "group" : otherUser?.id}`}>
            <Avatar className="h-10 w-10">
              {avatar ? (
                <AvatarImage src={avatar} alt={name} />
              ) : (
                <AvatarFallback className="bg-dawn-100 text-dawn-700 font-medium">
                  {initials}
                </AvatarFallback>
              )}
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-semibold text-ink-900 truncate">
              {name}
            </h1>
            {isGroup ? (
              <p className="text-xs text-ink-400 truncate">
                {conversation.participants.length} participants • {participantNames}
              </p>
            ) : (
              <p className="text-xs text-ink-400">
                {otherUser?.status === "active" ? "🟢 Active" : "⚪ Offline"}
              </p>
            )}
          </div>
        </div>

        {/* Messages */}
        <Card className="p-4 min-h-[400px] flex flex-col">
          <div className="flex-1 space-y-2 max-h-[500px] overflow-y-auto">
            {messagesWithSeparators.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <span className="text-4xl mb-3">💬</span>
                <p className="text-ink-500">No messages yet.</p>
                <p className="text-sm text-ink-400">Say hello to start the conversation!</p>
              </div>
            ) : (
              messagesWithSeparators.map((item, index) => {
                if ("type" in item && item.type === "separator") {
                  return <DateSeparator key={`sep-${index}`} date={item.date} />;
                }
                const msg = item as Message;
                const isOwn = msg.senderId === currentUserId;
                const showAvatar = !isOwn;
                const prevMsg = messagesWithSeparators[index - 1] as Message | undefined;
                const showTime = true;

                return (
                  <MessageItem
                    key={msg.id}
                    message={msg}
                    isOwn={isOwn}
                    showAvatar={showAvatar}
                    showTime={showTime}
                  />
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message input */}
          <div className="flex gap-2 pt-4 border-t border-ink-100 mt-4">
            <Input
              ref={inputRef}
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSending}
              className="flex-1"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isSending}
              className="shrink-0"
            >
              {isSending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Sending...
                </span>
              ) : (
                "Send"
              )}
            </Button>
          </div>
        </Card>
      </div>
    </MemberLayout>
  );
}
