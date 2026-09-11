"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/button";
import {
  getContent,
  canViewModeration,
  canActionModeration,
  isChapterLeaderScoped,
  type ContentItem,
  type ContentType,
} from "@/lib/mock/moderation";

const TYPE_LABELS: Record<ContentType, string> = {
  POST: "Post",
  COMMENT: "Comment",
  MESSAGE: "Message",
};

type ActionKey = null | "remove" | "review";

export default function ContentSearchPage() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [removedFilter, setRemovedFilter] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [action, setAction] = useState<ActionKey>(null);

  const canView = canViewModeration();
  const canAction = canActionModeration();
  const scoped = isChapterLeaderScoped();
  const all = useMemo(() => getContent(), []);

  const filtered = useMemo(() => {
    let r = all;
    if (typeFilter !== "all") r = r.filter((x) => x.type === typeFilter);
    if (removedFilter === "removed") r = r.filter((x) => x.removedAt);
    if (removedFilter === "visible") r = r.filter((x) => !x.removedAt);
    if (query.trim().length >= 3) {
      const q = query.toLowerCase();
      r = r.filter(
        (x) =>
          x.snippet.toLowerCase().includes(q) ||
          x.body.toLowerCase().includes(q) ||
          x.authorName.toLowerCase().includes(q)
      );
    }
    return r;
  }, [all, query, typeFilter, removedFilter]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((c) => c.id)));
  };

  if (!canView) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/70">
          You do not have permission to view this panel.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Content search</h1>
        <p className="mt-1 text-sm text-ink/60">
          Find and act on posts, comments, and group messages.
        </p>
      </header>

      <div role="note" className="rounded-lg border border-clay/40 bg-clay/5 p-3 text-sm text-ink">
        Direct messages are only searchable when reported or as part of a safeguarding case.
      </div>

      {scoped && (
        <div className="rounded-lg border border-sky/30 bg-sky/5 p-3 text-sm text-ink">
          Own-chapter scope: you see and can remove only content from your chapter.
        </div>
      )}

      <div className="rounded-lg border border-ink/10 bg-paper">
        <div className="flex flex-wrap gap-3 border-b border-ink/10 p-4">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search content (min 3 characters)"
            className="flex-1 min-w-[240px] rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
            aria-label="Search content"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
            aria-label="Filter by type"
          >
            <option value="all">All types</option>
            <option value="POST">Post</option>
            <option value="COMMENT">Comment</option>
            <option value="MESSAGE">Message</option>
          </select>
          <select
            value={removedFilter}
            onChange={(e) => setRemovedFilter(e.target.value)}
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
            aria-label="Filter by removal state"
          >
            <option value="all">All content</option>
            <option value="visible">Visible only</option>
            <option value="removed">Removed only</option>
          </select>
        </div>

        {canAction && selected.size > 0 && (
          <div className="flex items-center gap-3 border-b border-ink/10 bg-sky/5 p-3 text-sm">
            <span className="font-medium text-ink">{selected.size} selected</span>
            <Button variant="destructive" onClick={() => setAction("remove")}>
              Remove
            </Button>
            <Button variant="outline" onClick={() => setAction("review")}>
              Mark for review
            </Button>
            <Button variant="ghost" onClick={() => setSelected(new Set())}>
              Clear
            </Button>
          </div>
        )}

        {query.length < 3 && !typeFilter.match(/POST|COMMENT|MESSAGE/) && removedFilter === "all" ? (
          <div className="p-8 text-center text-sm text-ink/60">
            Enter a search term to find content.
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink/60">
            No content matched your search.
          </div>
        ) : (
          <ul className="divide-y divide-ink/5">
            {filtered.map((item) => (
              <li key={item.id} className="flex items-start gap-3 p-4 hover:bg-ink/5">
                {canAction && !item.removedAt && (
                  <input
                    type="checkbox"
                    checked={selected.has(item.id)}
                    onChange={() => toggle(item.id)}
                    className="mt-1"
                    aria-label={`Select ${item.type.toLowerCase()} by ${item.authorName}`}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-ink/50">
                    <span className="rounded-full bg-ink/10 px-2 py-0.5">{TYPE_LABELS[item.type]}</span>
                    <span>{item.authorName}</span>
                    {item.chapterCode && <span>/ {item.chapterCode}</span>}
                    <span>/ {new Date(item.createdAt).toLocaleDateString("en-GB")}</span>
                    {item.reportCount > 0 && (
                      <span className="text-clay">{item.reportCount} report{item.reportCount === 1 ? "" : "s"}</span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-ink">{item.snippet}</p>
                  {item.removedAt && (
                    <p className="mt-2 text-xs text-red-600">
                      Removed by {item.removedBy} on {new Date(item.removedAt).toLocaleDateString("en-GB")}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {canAction && filtered.length > 0 && (
          <div className="border-t border-ink/10 p-3 text-xs text-ink/60">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={selected.size === filtered.length && filtered.length > 0}
                onChange={toggleAll}
              />
              Select all
            </label>
          </div>
        )}
      </div>

      {action && (
        <ActionDialog
          action={action}
          count={selected.size}
          onClose={() => {
            setAction(null);
            setSelected(new Set());
          }}
        />
      )}
    </div>
  );
}

function ActionDialog({
  action,
  count,
  onClose,
}: {
  action: Exclude<ActionKey, null>;
  count: number;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const title = action === "remove" ? `Remove ${count} item${count === 1 ? "" : "s"}?` : `Mark ${count} item${count === 1 ? "" : "s"} for review?`;
  const description =
    action === "remove"
      ? "Authors will be notified and the content hidden. A reason is required and the action is audited."
      : "Flagged for review. No member is notified. A reason is required.";
  const needReason = reason.trim().length < 10;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-paper p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-ink">{title}</h3>
        <p className="mt-2 text-sm text-ink/70">{description}</p>
        <div className="mt-4">
          <label className="block text-xs uppercase tracking-wide text-ink/60">Reason</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
          />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            variant={action === "remove" ? "destructive" : "primary"}
            disabled={needReason}
            onClick={onClose}
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}