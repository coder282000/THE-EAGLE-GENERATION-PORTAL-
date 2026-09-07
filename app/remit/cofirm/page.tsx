"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { TextInput } from "@/components/input";
import {
  getCorridorById,
  getRecipientById,
  mockRemittanceRecipients,
} from "@/components/mock/data";
import { formatCurrency, cn } from "@/lib/utils";
import { AlertCircle, CheckCircle, Lock, Shield } from "lucide-react";

export default function ConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const corridorId = searchParams.get("corridor");
  const recipientId = searchParams.get("recipient");
  const amountParam = searchParams.get("amount");
  const purpose = searchParams.get("purpose") || "";

  const corridor = useMemo(() => {
    return corridorId ? getCorridorById(corridorId) : null;
  }, [corridorId]);

  const recipient = useMemo(() => {
    if (!recipientId) return null;
    return mockRemittanceRecipients.find(r => r.id === recipientId) || null;
  }, [recipientId]);

  const amountMinor = useMemo(() => parseInt(amountParam || "0", 10), [amountParam]);

  const [show2FA, setShow2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [is2FAVerifying, setIs2FAVerifying] = useState(false);
  const [twoFAError, setTwoFAError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [transferId, setTransferId] = useState("");

  const fee = corridor?.fee || 0;
  const total = amountMinor + fee;
  const receiveAmount = corridor ? Math.round(amountMinor * corridor.rate) : 0;

  const handleConfirm = () => {
    setShow2FA(true);
  };

  const handle2FASubmit = () => {
    if (twoFactorCode.length !== 6) {
      setTwoFAError("Please enter a valid 6-digit code.");
      return;
    }
    setIs2FAVerifying(true);
    setTwoFAError(null);

    // Simulate transfer submission
    setTimeout(() => {
      setIs2FAVerifying(false);
      setShow2FA(false);
      setIsSubmitting(true);

      setTimeout(() => {
        setIsSubmitting(false);
        setSuccess(true);
        setTransferId("rem-" + Date.now().toString(36));
      }, 800);
    }, 1200);
  };

  if (!corridor || !recipient || !amountMinor) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <Card className="p-8 border-red-200 bg-red-50/50">
          <p className="text-red-700">Invalid transfer details. Please start over.</p>
          <Button variant="primary" className="mt-4" onClick={() => router.push("/remit")}>
            Start Over
          </Button>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <Card className="p-8 text-center space-y-4 border-green-200 bg-green-50/50">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-green-700">Transfer Initiated!</h2>
            <p className="text-ink-60 mt-1">
              Your money is on its way to {recipient.name}.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 text-left space-y-2 max-w-sm mx-auto">
            <div className="flex justify-between text-sm">
              <span className="text-ink-60">Transfer ID</span>
              <span className="font-mono text-ink">{transferId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-60">Amount</span>
              <span>{formatCurrency(amountMinor, corridor.fromCurrency)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-60">Recipient</span>
              <span>{recipient.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-60">Status</span>
              <span className="text-clay font-medium">Processing</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => router.push("/remit/transfers")}>
              View Transfers
            </Button>
            <Button variant="primary" className="flex-1" onClick={() => router.push("/wallet")}>
              Back to Wallet
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push(`/remit/quote?corridor=${corridor.id}&recipient=${recipient.id}`)}
          className="text-ink-400 hover:text-ink-600"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-ink">Confirm Transfer</h1>
      </div>

      {/* Review card */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm text-ink-60">
          <Shield className="w-5 h-5 text-sky-600" />
          <span>Review the details below before confirming.</span>
        </div>

        <div className="space-y-3 border-t border-ink/10 pt-4">
          <div className="flex justify-between">
            <span className="text-ink-60">Recipient</span>
            <span className="font-medium">{recipient.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-60">Destination</span>
            <span>{corridor.toCountry}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-60">Amount</span>
            <span>{formatCurrency(amountMinor, corridor.fromCurrency)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-60">Fee</span>
            <span className="text-clay">+ {formatCurrency(fee, corridor.fromCurrency)}</span>
          </div>
          <div className="flex justify-between border-t border-ink/10 pt-2 font-bold">
            <span>Total</span>
            <span>{formatCurrency(total, corridor.fromCurrency)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-ink-60">Recipient gets</span>
            <span className="font-medium text-green-600">
              {formatCurrency(receiveAmount, corridor.toCurrency)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-ink-60">Payout partner</span>
            <span>{corridor.partner}</span>
          </div>
          {purpose && (
            <div className="flex justify-between text-sm">
              <span className="text-ink-60">Purpose</span>
              <span className="text-ink-400">{purpose}</span>
            </div>
          )}
        </div>

        <div className="bg-clay/5 border border-clay/20 rounded-lg p-2 text-xs text-ink-60 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-clay" />
          <span>Once confirmed, this transfer cannot be cancelled. Please verify all details.</span>
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
            <p className="text-sm text-ink-60 mb-4">
              Enter your 2FA code to confirm this transfer.
            </p>
            <TextInput
              label="6-digit code"
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
            {twoFAError && <p className="text-sm text-red-600 mt-2">{twoFAError}</p>}
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setShow2FA(false)}>
                Cancel
              </Button>
              <Button variant="primary" className="flex-1" onClick={handle2FASubmit} disabled={is2FAVerifying || twoFactorCode.length !== 6}>
                {is2FAVerifying ? "Verifying..." : "Confirm"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={() => router.push(`/remit/quote?corridor=${corridor.id}&recipient=${recipient.id}`)}>
          Back
        </Button>
        <Button variant="primary" className="flex-1" onClick={handleConfirm} disabled={isSubmitting}>
          {isSubmitting ? "Processing..." : "Confirm & Send"}
        </Button>
      </div>
    </div>
  );
}