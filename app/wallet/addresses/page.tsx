"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import TextInput from "@/components/input"; // default import
import { Select } from "@/components/select";
import { Avatar } from "@/components/avatar";
import { formatCurrency, cn } from "@/lib/utils";
import {
  Plus,
  Trash2,
  Edit2,
  Copy,
  CheckCircle,
  AlertCircle,
  Clock,
  Shield,
  ShieldCheck,
  ShieldOff,
  ExternalLink,
  X,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// Types
interface AddressEntry {
  id: string;
  label: string;
  address: string;
  network: "TRC20" | "ERC20" | "BEP20";
  asset: "USDT";
  isWhitelisted: boolean;
  cooldownUntil?: string; // ISO date
  createdAt: string;
  lastUsedAt?: string;
  note?: string;
}

// Mock address book data
const mockAddressBook: AddressEntry[] = [
  {
    id: "addr-1",
    label: "My External Wallet",
    address: "TQmZxPqR7...abc123",
    network: "TRC20",
    asset: "USDT",
    isWhitelisted: true,
    cooldownUntil: undefined,
    createdAt: "2026-01-15T10:00:00Z",
    lastUsedAt: "2026-02-20T14:30:00Z",
  },
  {
    id: "addr-2",
    label: "Exchange Account",
    address: "0xAbCdEf123456...7890",
    network: "ERC20",
    asset: "USDT",
    isWhitelisted: true,
    cooldownUntil: undefined,
    createdAt: "2026-01-20T11:00:00Z",
    lastUsedAt: "2026-02-18T09:00:00Z",
  },
  {
    id: "addr-3",
    label: "Family Wallet",
    address: "TZxPqR7abc...def456",
    network: "TRC20",
    asset: "USDT",
    isWhitelisted: false,
    cooldownUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days cooling
    createdAt: "2026-02-25T08:00:00Z",
  },
  {
    id: "addr-4",
    label: "Savings Wallet (BSC)",
    address: "0x1234567890abcdef...",
    network: "BEP20",
    asset: "USDT",
    isWhitelisted: false,
    cooldownUntil: undefined,
    createdAt: "2026-03-01T12:00:00Z",
  },
];

// Network options
const networkOptions = [
  { value: "TRC20", label: "TRC20 (USDT)" },
  { value: "ERC20", label: "ERC20 (USDT)" },
  { value: "BEP20", label: "BEP20 (USDT)" },
];

// Helper: truncate address
const truncateAddress = (addr: string, chars = 6) => {
  if (addr.length <= chars * 2 + 4) return addr;
  return `${addr.slice(0, chars)}...${addr.slice(-chars)}`;
};

// Helper: format date
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Helper: time remaining
const getTimeRemaining = (dateStr: string) => {
  const now = new Date();
  const target = new Date(dateStr);
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return "Ready";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h remaining`;
  return `${hours}h remaining`;
};

export default function AddressBookPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<AddressEntry[]>(mockAddressBook);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterNetwork, setFilterNetwork] = useState<"ALL" | "TRC20" | "ERC20" | "BEP20">("ALL");
  const [filterWhitelist, setFilterWhitelist] = useState<"ALL" | "WHITELISTED" | "PENDING">("ALL");
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<Partial<AddressEntry>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filtered addresses
  const filteredAddresses = useMemo(() => {
    let result = addresses;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.label.toLowerCase().includes(query) ||
          a.address.toLowerCase().includes(query) ||
          a.network.toLowerCase().includes(query)
      );
    }

    if (filterNetwork !== "ALL") {
      result = result.filter((a) => a.network === filterNetwork);
    }

    if (filterWhitelist === "WHITELISTED") {
      result = result.filter((a) => a.isWhitelisted);
    } else if (filterWhitelist === "PENDING") {
      result = result.filter((a) => !a.isWhitelisted);
    }

    return result;
  }, [addresses, searchQuery, filterNetwork, filterWhitelist]);

  // Stats
  const stats = useMemo(() => {
    const total = addresses.length;
    const whitelisted = addresses.filter((a) => a.isWhitelisted).length;
    const pending = addresses.filter((a) => !a.isWhitelisted).length;
    return { total, whitelisted, pending };
  }, [addresses]);

  // Handlers
  const handleCopy = (address: string, id: string) => {
    navigator.clipboard.writeText(address);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAdd = () => {
    const newEntry: AddressEntry = {
      id: "addr-" + Date.now().toString(36),
      label: editingEntry.label || "New Address",
      address: editingEntry.address || "",
      network: (editingEntry.network as "TRC20" | "ERC20" | "BEP20") || "TRC20",
      asset: "USDT",
      isWhitelisted: false,
      cooldownUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days cooldown
      createdAt: new Date().toISOString(),
      note: editingEntry.note,
    };
    setAddresses([newEntry, ...addresses]);
    setIsAdding(false);
    setEditingEntry({});
  };

  const handleUpdate = () => {
    if (!isEditing) return;
    setAddresses(
      addresses.map((a) =>
        a.id === isEditing
          ? {
              ...a,
              label: editingEntry.label || a.label,
              address: editingEntry.address || a.address,
              network: (editingEntry.network as "TRC20" | "ERC20" | "BEP20") || a.network,
              note: editingEntry.note !== undefined ? editingEntry.note : a.note,
            }
          : a
      )
    );
    setIsEditing(null);
    setEditingEntry({});
  };

  const handleToggleWhitelist = (id: string) => {
    setAddresses(
      addresses.map((a) =>
        a.id === id
          ? {
              ...a,
              isWhitelisted: !a.isWhitelisted,
              cooldownUntil: !a.isWhitelisted
                ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString() // Start cooldown
                : undefined,
            }
          : a
      )
    );
  };

  const handleDelete = (id: string) => {
    setAddresses(addresses.filter((a) => a.id !== id));
    setShowDeleteConfirm(null);
  };

  const handleEditClick = (entry: AddressEntry) => {
    setIsEditing(entry.id);
    setEditingEntry({ ...entry });
  };

  const handleCancelEdit = () => {
    setIsEditing(null);
    setEditingEntry({});
    setIsAdding(false);
  };

  const isWhitelistDisabled = (entry: AddressEntry) => {
    if (entry.cooldownUntil) {
      return new Date(entry.cooldownUntil) > new Date();
    }
    return false;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/wallet")}
            className="text-ink-400 hover:text-ink-600"
            aria-label="Back to wallet"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-ink">Address Book</h1>
        </div>
        <Button
          variant="primary"
          className="flex items-center gap-2"
          onClick={() => {
            setIsAdding(true);
            setEditingEntry({ label: "", address: "", network: "TRC20", note: "" });
          }}
        >
          <Plus className="w-4 h-4" />
          Add Address
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <p className="text-xs text-ink-40">Total</p>
          <p className="text-xl font-bold text-ink">{stats.total}</p>
        </Card>
        <Card className="p-3 text-center border-green-200 bg-green-50/30">
          <p className="text-xs text-ink-40">Whitelisted</p>
          <p className="text-xl font-bold text-green-600">{stats.whitelisted}</p>
        </Card>
        <Card className="p-3 text-center border-clay/30 bg-clay/5">
          <p className="text-xs text-ink-40">Pending</p>
          <p className="text-xl font-bold text-clay">{stats.pending}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <TextInput
              id="search-addresses"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              placeholder="Search addresses..."
              leftElement={<Search className="w-4 h-4 text-ink-400" />}
              className="bg-white"
            />
          </div>
          <Select
            value={filterNetwork}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterNetwork(e.target.value as any)}
            options={[
              { value: "ALL", label: "All Networks" },
              { value: "TRC20", label: "TRC20" },
              { value: "ERC20", label: "ERC20" },
              { value: "BEP20", label: "BEP20" },
            ]}
            className="min-w-[140px]"
          />
          <Select
            value={filterWhitelist}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterWhitelist(e.target.value as any)}
            options={[
              { value: "ALL", label: "All Status" },
              { value: "WHITELISTED", label: "Whitelisted" },
              { value: "PENDING", label: "Pending" },
            ]}
            className="min-w-[140px]"
          />
        </div>
      </Card>

      {/* Empty state */}
      {filteredAddresses.length === 0 && (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-paper flex items-center justify-center mx-auto text-3xl">
            📖
          </div>
          <h3 className="text-lg font-semibold text-ink mt-4">No addresses found</h3>
          <p className="text-sm text-ink-400 mt-1">
            {searchQuery || filterNetwork !== "ALL" || filterWhitelist !== "ALL"
              ? "Try adjusting your filters"
              : "Add your first withdrawal address"}
          </p>
          {(searchQuery || filterNetwork !== "ALL" || filterWhitelist !== "ALL") && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchQuery("");
                setFilterNetwork("ALL");
                setFilterWhitelist("ALL");
              }}
            >
              Clear Filters
            </Button>
          )}
        </Card>
      )}

      {/* Address list */}
      {filteredAddresses.length > 0 && (
        <div className="space-y-3">
          {filteredAddresses.map((entry) => {
            const isEditingThis = isEditing === entry.id;
            const isCopied = copiedId === entry.id;
            const isCooldown = isWhitelistDisabled(entry);

            return (
              <Card key={entry.id} className="p-4 space-y-3">
                {isEditingThis ? (
                  // Edit mode
                  <div className="space-y-3">
                    <TextInput
                      id="edit-label"
                      label="Label"
                      value={editingEntry.label || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setEditingEntry({ ...editingEntry, label: e.target.value })
                      }
                      placeholder="e.g., My Exchange Wallet"
                      className="bg-white"
                    />
                    <TextInput
                      id="edit-address"
                      label="Address"
                      value={editingEntry.address || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setEditingEntry({ ...editingEntry, address: e.target.value })
                      }
                      placeholder="Enter wallet address..."
                      className="bg-white font-mono text-sm"
                    />
                    <Select
                      label="Network"
                      value={editingEntry.network || "TRC20"}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setEditingEntry({ ...editingEntry, network: e.target.value as any })
                      }
                      options={networkOptions}
                      className="bg-white"
                    />
                    <TextInput
                      id="edit-note"
                      label="Note (optional)"
                      value={editingEntry.note || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setEditingEntry({ ...editingEntry, note: e.target.value })
                      }
                      placeholder="Any additional info..."
                      className="bg-white text-sm"
                    />
                    <div className="flex gap-2 pt-2">
                      <Button variant="primary" onClick={isAdding ? handleAdd : handleUpdate}>
                        {isAdding ? "Add Address" : "Save Changes"}
                      </Button>
                      <Button variant="outline" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-ink">{entry.label}</p>
                          {entry.isWhitelisted ? (
                            <span className="flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                              <ShieldCheck className="w-3 h-3" />
                              Whitelisted
                            </span>
                          ) : entry.cooldownUntil && new Date(entry.cooldownUntil) > new Date() ? (
                            <span className="flex items-center gap-1 text-xs text-clay bg-clay/10 px-2 py-0.5 rounded-full">
                              <Clock className="w-3 h-3" />
                              Cooling: {getTimeRemaining(entry.cooldownUntil)}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-ink-400 bg-paper px-2 py-0.5 rounded-full">
                              <ShieldOff className="w-3 h-3" />
                              Pending
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-xs font-mono text-ink-400 truncate">
                            {truncateAddress(entry.address, 8)}
                          </code>
                          <button
                            onClick={() => handleCopy(entry.address, entry.id)}
                            className="text-ink-300 hover:text-ink-600"
                            aria-label="Copy address"
                          >
                            {isCopied ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-ink-400">
                          <span>{entry.network}</span>
                          <span>·</span>
                          <span>Added {formatDate(entry.createdAt)}</span>
                          {entry.lastUsedAt && (
                            <>
                              <span>·</span>
                              <span>Last used {formatDate(entry.lastUsedAt)}</span>
                            </>
                          )}
                          {entry.note && (
                            <>
                              <span>·</span>
                              <span className="text-ink-300">{entry.note}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(entry)}
                          className="text-ink-400"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleWhitelist(entry.id)}
                          disabled={isCooldown && !entry.isWhitelisted}
                          className={cn(
                            entry.isWhitelisted
                              ? "text-amber-600 border-amber-200 hover:bg-amber-50"
                              : "text-sky-600 border-sky-200 hover:bg-sky-50",
                            isCooldown && !entry.isWhitelisted && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          {entry.isWhitelisted ? (
                            <>
                              <ShieldOff className="w-3.5 h-3.5 mr-1" />
                              Remove
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                              Whitelist
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowDeleteConfirm(entry.id)}
                          className="text-red-400 hover:text-red-600 hover:border-red-200"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Cooldown info */}
                    {entry.cooldownUntil && !entry.isWhitelisted && new Date(entry.cooldownUntil) > new Date() && (
                      <div className="bg-clay/5 border border-clay/20 rounded-lg p-2 text-xs text-clay flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>
                          This address is in cooldown. It will be available for whitelisting in{" "}
                          {getTimeRemaining(entry.cooldownUntil)}.
                        </span>
                      </div>
                    )}
                  </>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-md w-full">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-ink">Delete Address?</h3>
                <p className="text-sm text-ink-400 mt-1">
                  This action cannot be undone. The address will be permanently removed from your address book.
                </p>
                <div className="flex gap-3 mt-4">
                  <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => handleDelete(showDeleteConfirm)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}