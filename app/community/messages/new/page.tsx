"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { MemberLayout } from "@/components/layout/memberLayout";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Textarea } from "@/components/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/avatar";
import { mockMembers, mockConversations, mockMessages, Member } from "@/components/mock/data";

// ============================================================
// Member Search Result Item
// ============================================================

function MemberResultItem({
  member,
  isSelected,
  onClick,
}: {
  member: Member;
  isSelected: boolean;
  onClick: () => void;
}) {
  const initials = `${member.firstName[0]}${member.lastName[0]}`;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
        isSelected
          ? "bg-dawn-50 border-2 border-dawn-300"
          : "hover:bg-ink-50 border-2 border-transparent"
      }`}
    >
      <Avatar className="h-10 w-10 shrink-0">
        {member.avatar ? (
          <AvatarImage src={member.avatar} alt={`${member.firstName} ${member.lastName}`} />
        ) : (
          <AvatarFallback className="bg-dawn-100 text-dawn-700 font-medium">
            {initials}
          </AvatarFallback>
        )}
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-ink-900">
          {member.firstName} {member.lastName}
        </p>
        <p className="text-sm text-ink-400 truncate">{member.email}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs font-medium text-ink-400 bg-ink-50 px-2 py-0.5 rounded-full">
          {member.chapter}
        </span>
        {isSelected && (
          <span className="text-dawn-500 font-medium text-sm">✓</span>
        )}
      </div>
    </button>
  );
}

// ============================================================
// Main Page Component
// ============================================================

export default function NewMessagePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentUserId = "1"; // mock current user

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  // Filter members based on search (exclude current user)
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const q = searchQuery.toLowerCase().trim();
    return mockMembers.filter((member) => {
      // Exclude current user
      if (member.id === currentUserId) return false;

      // Search by name, email, member number, chapter
      const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
      return (
        fullName.includes(q) ||
        member.email.toLowerCase().includes(q) ||
        member.memberNumber.toLowerCase().includes(q) ||
        member.chapter.toLowerCase().includes(q)
      );
    });
  }, [searchQuery]);

  // Check if a conversation already exists with the selected member
  const existingConversation = useMemo(() => {
    if (!selectedMember) return null;

    return mockConversations.find(
      (conv) =>
        !conv.isGroup &&
        conv.participants.includes(currentUserId) &&
        conv.participants.includes(selectedMember.id)
    );
  }, [selectedMember]);

  // Handle send message
  const handleSendMessage = async () => {
    if (!selectedMember || !message.trim() || isSending) return;

    setIsSending(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      let conversationId: string;

      // Check if conversation already exists
      if (existingConversation) {
        conversationId = existingConversation.id;
      } else {
        // Create new conversation
        conversationId = `conv-${Date.now()}`;
        const newConversation = {
          id: conversationId,
          participants: [currentUserId, selectedMember.id],
          updatedAt: new Date().toISOString(),
          isGroup: false,
        };
        // Add to mock data (in real app, API would handle this)
        mockConversations.unshift(newConversation);
      }

      // Create the message
      const newMessage = {
        id: `msg-${Date.now()}`,
        conversationId,
        senderId: currentUserId,
        content: message.trim(),
        sentAt: new Date().toISOString(),
        readAt: undefined,
        type: "text" as const,
      };
      mockMessages.push(newMessage);

      // Redirect to the conversation
      router.push(`/community/messages/${conversationId}`);
    } catch (err) {
      setError("Failed to send message. Please try again.");
      setIsSending(false);
    }
  };

  // Handle Enter key in textarea (Shift+Enter for new line)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Clear selection
  const handleClearSelection = () => {
    setSelectedMember(null);
    setSearchQuery("");
    inputRef.current?.focus();
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
          <Card className="p-6 space-y-4">
            <div className="space-y-2">
              <div className="h-4 w-20 bg-ink-100 animate-pulse" />
              <div className="h-10 w-full bg-ink-100 animate-pulse rounded-md" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <div className="h-10 w-10 rounded-full bg-ink-100 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-ink-100 animate-pulse" />
                    <div className="h-3 w-48 bg-ink-100 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </MemberLayout>
    );
  }

  // ======== SELECTED MEMBER VIEW ========
  if (selectedMember) {
    const initials = `${selectedMember.firstName[0]}${selectedMember.lastName[0]}`;

    return (
      <MemberLayout>
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleClearSelection}
              className="text-ink-400 hover:text-ink-600 transition-colors p-1"
              aria-label="Back to search"
            >
              ←
            </button>
            <div className="flex items-center gap-3 flex-1">
              <Avatar className="h-10 w-10">
                {selectedMember.avatar ? (
                  <AvatarImage src={selectedMember.avatar} alt={`${selectedMember.firstName} ${selectedMember.lastName}`} />
                ) : (
                  <AvatarFallback className="bg-dawn-100 text-dawn-700 font-medium">
                    {initials}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <p className="font-medium text-ink-900">
                  {selectedMember.firstName} {selectedMember.lastName}
                </p>
                <p className="text-sm text-ink-400">{selectedMember.email}</p>
              </div>
            </div>
          </div>

          {/* Message form */}
          <Card className="p-6 space-y-4">
            <h2 className="font-display text-sm font-semibold text-ink-900">
              Send a message
            </h2>

            {existingConversation && (
              <div className="rounded-lg bg-ink-50 p-3 text-sm text-ink-600 border border-ink-100">
                💬 You already have a conversation with {selectedMember.firstName}. 
                Sending will continue that conversation.
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-clay-50 border border-clay-200 p-3 text-sm text-clay-700">
                ⚠️ {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="message-input" className="text-sm font-medium text-ink-700">
                Message
              </label>
              <Textarea
                ref={textareaRef}
                id="message-input"
                placeholder={`Say hello to ${selectedMember.firstName}...`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={4}
                disabled={isSending}
                className="resize-none"
                autoFocus
              />
              <p className="text-xs text-ink-400 text-right">
                {message.length} characters • Shift+Enter for new line
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2 border-t border-ink-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearSelection}
                disabled={isSending}
              >
                Change Recipient
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSendMessage}
                disabled={!message.trim() || isSending}
                className="min-w-[120px]"
              >
                {isSending ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Sending...
                  </span>
                ) : (
                  "Send Message"
                )}
              </Button>
            </div>
          </Card>
        </div>
      </MemberLayout>
    );
  }

  // ======== SEARCH STATE ========
  return (
    <MemberLayout>
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => router.push("/community/messages")}
              className="text-sm text-ink-400 hover:text-ink-600 transition-colors flex items-center gap-1"
            >
              ← Back to Messages
            </button>
            <h1 className="font-display text-2xl font-semibold text-ink-900 mt-1">
              New Message
            </h1>
            <p className="text-sm text-ink-400">
              Search for a member to start a conversation.
            </p>
          </div>
        </div>

        {/* Search */}
        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="search-members" className="text-sm font-medium text-ink-700">
              Find a member
            </label>
            <Input
              ref={inputRef}
              id="search-members"
              placeholder="Search by name, email, or member number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full"
            />
            <p className="text-xs text-ink-400">
              Type at least 2 characters to start searching
            </p>
          </div>

          {/* Results */}
          {searchQuery.trim().length >= 2 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-ink-700">
                Results ({filteredMembers.length})
              </p>
              {filteredMembers.length === 0 ? (
                <div className="rounded-lg border border-dashed border-ink-200 p-6 text-center">
                  <p className="text-ink-500">No members found.</p>
                  <p className="text-sm text-ink-400 mt-1">
                    Try adjusting your search term.
                  </p>
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto space-y-1 border border-ink-100 rounded-lg p-1">
                  {filteredMembers.map((member) => (
                    <MemberResultItem
                      key={member.id}
                      member={member}
                      isSelected={false}
                      onClick={() => setSelectedMember(member)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {searchQuery.trim().length === 0 && (
            <div className="rounded-lg border border-dashed border-ink-200 p-8 text-center">
              <span className="text-4xl block mb-3">🔍</span>
              <p className="text-ink-500">Search for a member to start messaging</p>
              <p className="text-sm text-ink-400 mt-1">
                Type a name, email, or member number above
              </p>
            </div>
          )}
        </Card>
      </div>
    </MemberLayout>
  );
}