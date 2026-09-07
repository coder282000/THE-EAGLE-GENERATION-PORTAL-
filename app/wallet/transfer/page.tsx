"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { TextInput } from "@/components/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/avatar";
import { mockMembers, mockWalletBalances, mockKYCStatus } from "@/components/mock/data";
import { formatCurrency, cn } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle,
  Search,
  Send,
  User,
  Users,
  Lock,
} from "lucide-react";

// Types
type TransferStep = "search" | "amount" | "confirm" | "success";

interface SelectedRecipient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

function getInitials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

export default function TransferPage() {
  const router = useRouter();
  const [step, setStep] = useState<TransferStep>("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState<SelectedRecipient | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [memo, setMemo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [show2FA, setShow2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState<string>("");
  const [is2FAVerifying, setIs2FAVerifying] = useState(false);
  const [twoFAError, setTwoFAError] = useState<string | null>(null);
  const [transferId, setTransferId] = useState<string>("");

  // Get USDT balance (TRC20 as primary)
  const balance = useMemo(() => {
    const usdtBalance = mockWalletBalances.find(
      (b) => b.asset === "USDT" && b.network === "TRC20"
    );
    return usdtBalance?.available || 0;
  }, []);

  // Search members (exclude self - assuming current user is '1')
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    return mockMembers
      .filter(
        (m) =>
          m.id !== "1" &&
          (m.firstName.toLowerCase().includes(query) ||
            m.lastName.toLowerCase().includes(query) ||
            m.email.toLowerCase().includes(query) ||
            m.memberNumber.toLowerCase().includes(query))
      )
      .slice(0, 10);
  }, [searchQuery]);

  const amountInMinor = useMemo(() => {
    const val = parseFloat(amount);
    return isNaN(val) ? 0 : Math.round(val * 100);
  }, [amount]);

  const isAmountValid = amountInMinor > 0 && amountInMinor <= balance;
  const hasSufficientBalance = amountInMinor <= balance;

  const handleSelectRecipient = (recipient: SelectedRecipient) => {
    setSelectedRecipient(recipient);
    setSearchQuery("");
    setStep("amount");
  };

  const handleBack = () => {
    if (step === "amount") {
      setStep("search");
      setSelectedRecipient(null);
    } else if (step === "confirm") {
      setStep("amount");
    } else if (step === "success") {
      router.push("/wallet");
    } else {
      router.push("/wallet");
    }
  };

  const handleAmountNext = () => {
    if (!isAmountValid) {
      if (amountInMinor <= 0) setError("Please enter a valid amount.");
      else if (!hasSufficientBalance) setError("Insufficient balance.");
      return;
    }
    setError(null);
    setStep("confirm");
  };

  const handleConfirm = () => {
    if (twoFactorCode.length !== 6) {
      setTwoFAError("Please enter a valid 6-digit code.");
      return;
    }
    setIs2FAVerifying(true);
    setTwoFAError(null);

    // Simulate verification and transfer
    setTimeout(() => {
      setIs2FAVerifying(false);
      setShow2FA(false);
      setStep("success");
      setTransferId("tx_" + Date.now().toString(36));
      setIsSubmitting(false);
    }, 1200);
  };

  const handleRecipientSelect = (member: SelectedRecipient) => {
    // In a real app, this would check if the member has a wallet
    handleSelectRecipient(member);
  };

  // ---- Step: Search ----
  if (step === "search") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="text-ink-400 hover:text-ink-600"
            aria-label="Back to wallet"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-ink">Transfer USDT</h1>
        </div>

        <p className="text-sm text-ink/60">
          Send USDT to another Eagle Generation member instantly and free of charge.
        </p>

        {/* Balance */}
        <Card className="p-4 bg-sky-50/50 border-sky-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-ink/60">Available USDT (TRC20)</p>
              <p className="text-xl font-bold text-ink">
                {formatCurrency(balance, "USD")}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-bold">
              US
            </div>
          </div>
        </Card>

        {/* Search */}
        <div>
          <TextInput
            label="Search for a member"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or member number..."
            leftElement={<Search className="w-4 h-4 text-ink-400" />}
            className="bg-white"
            autoFocus
          />
        </div>

        {/* Results */}
        {searchQuery.trim() && (
          <div className="space-y-2">
            <p className="text-xs text-ink-400 font-medium uppercase tracking-wider">
              Members ({searchResults.length})
            </p>
            {searchResults.length === 0 ? (
              <Card className="p-6 text-center">
                <Users className="w-8 h-8 text-ink-300 mx-auto mb-2" />
                <p className="text-ink-400">No members found</p>
                <p className="text-sm text-ink-300">
                  Try a different search term
                </p>
              </Card>
            ) : (
              searchResults.map((member) => (
                <Card
                  key={member.id}
                  className="p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all"
                  onClick={() =>
                    handleRecipientSelect({
                      id: member.id,
                      firstName: member.firstName,
                      lastName: member.lastName,
                      email: member.email,
                      avatar: member.avatar,
                    })
                  }
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={member.avatar}
                      alt={`${member.firstName} ${member.lastName}`}
                    />
                    <AvatarFallback>
                      {getInitials(member.firstName, member.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-ink">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="text-xs text-ink-400">
                      {member.memberNumber} · {member.email}
                    </p>
                  </div>
                  <div className="text-ink-400">→</div>
                </Card>
              ))
            )}
          </div>
        )}

        {!searchQuery.trim() && (
          <div className="bg-paper border border-ink/10 rounded-lg p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-paper flex items-center justify-center mx-auto text-2xl">
              🔍
            </div>
            <p className="text-sm text-ink-400 mt-3">
              Search for a member by name, email, or member number to send USDT.
            </p>
            <p className="text-xs text-ink-300 mt-1">
              Internal transfers are instant and free of charge.
            </p>
          </div>
        )}
      </div>
    );
  }

  // ---- Step: Amount ----
  if (step === "amount" && selectedRecipient) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="text-ink-400 hover:text-ink-600"
            aria-label="Back"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-ink">Enter Amount</h1>
        </div>

        {/* Recipient */}
        <Card className="p-4 flex items-center gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={selectedRecipient.avatar}
              alt={`${selectedRecipient.firstName} ${selectedRecipient.lastName}`}
            />
            <AvatarFallback>
              {getInitials(selectedRecipient.firstName, selectedRecipient.lastName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-ink">
              {selectedRecipient.firstName} {selectedRecipient.lastName}
            </p>
            <p className="text-xs text-ink-400">{selectedRecipient.email}</p>
          </div>
          <div className="ml-auto text-xs text-ink-400 bg-paper px-2 py-1 rounded">
            Member
          </div>
        </Card>

        {/* Amount */}
        <div>
          <TextInput
            label="Amount (USDT)"
            type="number"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError(null);
            }}
            placeholder="0.00"
            min="0.01"
            step="0.01"
            className="text-2xl font-bold"
            rightElement={
              <button
                className="text-xs text-sky-600 hover:text-sky-800 font-medium"
                onClick={() => setAmount((balance / 100).toString())}
              >
                Max
              </button>
            }
          />
          {amountInMinor > 0 && (
            <div className="flex justify-between text-xs mt-1">
              <span className="text-ink-40">
                Available: {formatCurrency(balance, "USD")}
              </span>
              <span
                className={cn(
                  !hasSufficientBalance && "text-red-500",
                  hasSufficientBalance && "text-green-600"
                )}
              >
                {hasSufficientBalance
                  ? "✓ Sufficient balance"
                  : "Insufficient balance"}
              </span>
            </div>
          )}
          {error && (
            <p className="text-sm text-red-600 mt-2">{error}</p>
          )}
        </div>

        {/* Memo (optional) */}
        <div>
          <TextInput
            label="Memo (optional)"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="What's this transfer for?"
            className="text-sm"
          />
        </div>

        <div className="bg-paper border border-ink/10 rounded-lg p-3 text-xs text-ink-400">
          <p>💡 Internal transfers are free and credited instantly.</p>
          <p className="mt-1">No network fees apply.</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={handleBack} className="flex-1">
            Back
          </Button>
          <Button
            variant="primary"
            onClick={handleAmountNext}
            className="flex-1"
            disabled={!isAmountValid}
          >
            Review Transfer
          </Button>
        </div>
      </div>
    );
  }

  // ---- Step: Confirm ----
  if (step === "confirm" && selectedRecipient) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="text-ink-400 hover:text-ink-600"
            aria-label="Back"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-ink">Confirm Transfer</h1>
        </div>

        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3 text-ink-60">
            <Send className="w-5 h-5 text-sky-600" />
            <span className="text-sm">
              You are about to transfer USDT to a fellow Eagle.
            </span>
          </div>

          <div className="space-y-3 border-t border-ink/10 pt-4">
            <div className="flex justify-between">
              <span className="text-ink/60">Recipient</span>
              <span className="font-medium">
                {selectedRecipient.firstName} {selectedRecipient.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink/60">Amount</span>
              <span className="font-bold text-ink">
                {formatCurrency(amountInMinor, "USD")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink/60">Fee</span>
              <span className="text-green-600 font-medium">Free</span>
            </div>
            {memo && (
              <div className="flex justify-between">
                <span className="text-ink/60">Memo</span>
                <span className="text-ink-400 text-sm">{memo}</span>
              </div>
            )}
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
            <p>✓ Internal transfers are instant and free of charge.</p>
            <p className="text-xs text-green-600 mt-1">
              The recipient will receive the funds immediately.
            </p>
          </div>
        </Card>

        {/* 2FA Modal */}
        {show2FA && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="p-6 max-w-md w-full">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-6 h-6 text-sky-600" />
                <h2 className="text-lg font-bold text-ink">Verify Your Identity</h2>
              </div>
              <p className="text-sm text-ink/60 mb-4">
                Enter the 6-digit code from your authenticator app to confirm this transfer.
              </p>
              <TextInput
                label="2FA Code"
                type="text"
                value={twoFactorCode}
                onChange={(e) => {
                  setTwoFactorCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setTwoFAError(null);
                }}
                placeholder="000000"
                className="text-center text-2xl font-mono tracking-widest"
                maxLength={6}
                autoFocus
              />
              {twoFAError && (
                <p className="text-sm text-red-600 mt-2">{twoFAError}</p>
              )}
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShow2FA(false);
                    setTwoFactorCode("");
                    setTwoFAError(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleConfirm}
                  disabled={is2FAVerifying || twoFactorCode.length !== 6}
                >
                  {is2FAVerifying ? "Verifying..." : "Confirm Transfer"}
                </Button>
              </div>
            </Card>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={handleBack} className="flex-1">
            Back
          </Button>
          <Button
            variant="primary"
            onClick={() => setShow2FA(true)}
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Confirm"}
          </Button>
        </div>
      </div>
    );
  }

  // ---- Step: Success ----
  if (step === "success" && selectedRecipient) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <Card className="p-8 text-center space-y-4 border-green-200 bg-green-50/50">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-green-700">
              Transfer Successful!
            </h2>
            <p className="text-ink/60 mt-1">
              {formatCurrency(amountInMinor, "USD")} USDT has been sent to{" "}
              <strong>{selectedRecipient.firstName} {selectedRecipient.lastName}</strong>.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 text-left space-y-2 max-w-sm mx-auto">
            <div className="flex justify-between text-sm">
              <span className="text-ink/60">Transaction ID</span>
              <span className="font-mono text-ink text-xs">{transferId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink/60">Recipient</span>
              <span className="font-medium">
                {selectedRecipient.firstName} {selectedRecipient.lastName}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink/60">Amount</span>
              <span className="font-bold text-ink">
                {formatCurrency(amountInMinor, "USD")}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink/60">Status</span>
              <span className="text-green-600 font-medium">Completed</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push("/wallet/transactions")}
              className="flex-1"
            >
              View History
            </Button>
            <Button
              variant="primary"
              onClick={() => router.push("/wallet")}
              className="flex-1"
            >
              Back to Wallet
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return null;
}