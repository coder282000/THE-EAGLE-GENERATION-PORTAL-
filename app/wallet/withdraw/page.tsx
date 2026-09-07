"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import {TextInput} from "@/components/input"; // default import
import { Select } from "@/components/select";
import {
  mockWalletBalances,
  mockKYCStatus,
  mockWalletTransactions,
} from "@/components/mock/data";
import { formatCurrency, cn } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle,
  ArrowUp,
  Shield,
  Clock,
  UserCheck,
  Lock,
} from "lucide-react";

// Types
interface WithdrawalStep {
  id: "details" | "confirm" | "pending";
  label: string;
}

const steps: WithdrawalStep[] = [
  { id: "details", label: "Details" },
  { id: "confirm", label: "Confirm" },
  { id: "pending", label: "Pending Approval" },
];

// Mock address book (whitelist)
const mockAddressBook = [
  { id: "addr-1", label: "My External Wallet", address: "TQmZxPqR...", network: "TRC20" },
  { id: "addr-2", label: "Exchange Account", address: "0xAbCdEf...", network: "ERC20" },
];

export default function WithdrawPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialAsset = searchParams.get("asset") || "USDT";
  const initialNetwork = searchParams.get("network") || "TRC20";

  // State
  const [currentStep, setCurrentStep] = useState<WithdrawalStep["id"]>("details");
  const [amount, setAmount] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [addressLabel, setAddressLabel] = useState<string>("");
  const [selectedNetwork, setSelectedNetwork] = useState<string>(initialNetwork);
  const [selectedAsset] = useState<string>(initialAsset);
  const [isNewAddress, setIsNewAddress] = useState<boolean>(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [withdrawalId, setWithdrawalId] = useState<string>("");
  const [show2FA, setShow2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState<string>("");
  const [is2FAVerifying, setIs2FAVerifying] = useState(false);
  const [twoFAError, setTwoFAError] = useState<string | null>(null);

  // Get balance for selected network
  const balance = useMemo(() => {
    return mockWalletBalances.find(
      (b) => b.asset === selectedAsset && b.network === selectedNetwork
    );
  }, [selectedAsset, selectedNetwork]);

  // Get KYC limits
  const kyc = mockKYCStatus;
  const dailyRemaining = kyc.dailyLimit - kyc.dailyUsed;

  const amountInMinor = useMemo(() => {
    const val = parseFloat(amount);
    return isNaN(val) ? 0 : Math.round(val * 100);
  }, [amount]);

  const fee = useMemo(() => {
    // Simulate network fee based on network
    const fees: Record<string, number> = {
      TRC20: 150, // $1.50 in cents
      ERC20: 500, // $5.00 in cents
      BEP20: 100, // $1.00 in cents
    };
    return fees[selectedNetwork] || 0;
  }, [selectedNetwork]);

  const totalAmount = amountInMinor + fee;

  const isFormValid = () => {
    if (amountInMinor <= 0) return false;
    if (amountInMinor > (balance?.available || 0)) return false;
    if (amountInMinor > dailyRemaining) return false;
    if (!address || address.length < 10) return false;
    return true;
  };

  const handleNext = () => {
    if (currentStep === "details") {
      if (!isFormValid()) {
        if (amountInMinor <= 0) setError("Please enter a valid amount.");
        else if (amountInMinor > (balance?.available || 0))
          setError("Insufficient balance.");
        else if (amountInMinor > dailyRemaining)
          setError("This would exceed your daily withdrawal limit.");
        else if (!address || address.length < 10)
          setError("Please enter a valid withdrawal address.");
        return;
      }
      setError(null);
      setCurrentStep("confirm");
    } else if (currentStep === "confirm") {
      // Trigger 2FA
      setShow2FA(true);
    }
  };

  const handleBack = () => {
    if (currentStep === "confirm") {
      setCurrentStep("details");
    } else if (currentStep === "pending") {
      router.push("/wallet");
    } else {
      router.push("/wallet");
    }
  };

  const handleConfirm = () => {
    // Verify 2FA (mock)
    if (twoFactorCode.length !== 6) {
      setTwoFAError("Please enter a valid 6-digit code.");
      return;
    }
    setIs2FAVerifying(true);
    setTwoFAError(null);

    // Simulate verification and submission
    setTimeout(() => {
      setIs2FAVerifying(false);
      setShow2FA(false);
      setCurrentStep("pending");
      setWithdrawalId("wd_" + Date.now().toString(36));
      setIsSubmitting(false);
    }, 1200);
  };

  const handleAddressSelect = (id: string) => {
    const addr = mockAddressBook.find((a) => a.id === id);
    if (addr) {
      setSelectedAddressId(id);
      setAddress(addr.address);
      setAddressLabel(addr.label);
      setSelectedNetwork(addr.network);
      setIsNewAddress(false);
    }
  };

  // Navigate to address book
  const goToAddressBook = () => {
    router.push("/wallet/addresses");
  };

  // ---- Step: Details ----
  if (currentStep === "details") {
    const maxAmount = Math.min(balance?.available || 0, dailyRemaining);

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
          <h1 className="text-2xl font-bold text-ink">Withdraw</h1>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors",
                  step.id === currentStep
                    ? "bg-sky-600 text-white"
                    : index < steps.findIndex(s => s.id === currentStep)
                    ? "bg-green-500 text-white"
                    : "bg-paper text-ink-400"
                )}
              >
                {index + 1}
              </div>
              <span
                className={cn(
                  "text-sm hidden sm:inline",
                  step.id === currentStep
                    ? "text-ink font-medium"
                    : "text-ink-400"
                )}
              >
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <span className="text-ink-200">—</span>
              )}
            </div>
          ))}
        </div>

        <p className="text-sm text-ink/60">
          Enter the amount and destination address for your withdrawal.
        </p>

        {/* Balance Info */}
        <Card className="p-4 bg-sky-50/50 border-sky-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-ink/60">Available Balance</p>
              <p className="text-xl font-bold text-ink">
                {formatCurrency(balance?.available || 0, "USD")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-ink/60">Daily Remaining</p>
              <p className="text-sm font-medium text-ink">
                {formatCurrency(dailyRemaining, "USD")}
              </p>
            </div>
          </div>
          <div className="mt-2 h-1.5 w-full bg-paper rounded-full">
            <div
              className="h-1.5 rounded-full bg-sky-500"
              style={{
                width: `${Math.min((kyc.dailyUsed / kyc.dailyLimit) * 100, 100)}%`,
              }}
            />
          </div>
        </Card>

        {/* Form */}
        <div className="space-y-4">
          {/* Amount */}
          <div>
            <TextInput
              id="withdraw-amount"
              label="Amount (USD)"
              type="number"
              value={amount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="text-lg"
            />
            {amountInMinor > 0 && balance && (
              <div className="flex justify-between text-xs mt-1">
                <span className="text-ink/40">
                  Fee: ~{formatCurrency(fee, "USD")}
                </span>
                <span
                  className={cn(
                    amountInMinor > balance.available
                      ? "text-red-500"
                      : amountInMinor > dailyRemaining
                      ? "text-clay"
                      : "text-ink/40"
                  )}
                >
                  Total: {formatCurrency(totalAmount, "USD")}
                </span>
              </div>
            )}
          </div>

          {/* Address Selection */}
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Destination Address
            </label>
            <div className="flex gap-2 mb-2">
              <Button
                variant={isNewAddress ? "primary" : "outline"}
                size="sm"
                onClick={() => {
                  setIsNewAddress(true);
                  setSelectedAddressId("");
                  setAddress("");
                  setAddressLabel("");
                }}
              >
                New Address
              </Button>
              <Button
                variant={!isNewAddress ? "primary" : "outline"}
                size="sm"
                onClick={() => {
                  setIsNewAddress(false);
                  if (mockAddressBook.length > 0) {
                    handleAddressSelect(mockAddressBook[0].id);
                  }
                }}
              >
                Saved Addresses
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToAddressBook}
                className="text-ink-400"
              >
                Manage
              </Button>
            </div>

            {!isNewAddress && (
              <Select
                label="Select saved address"
                value={selectedAddressId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  handleAddressSelect(e.target.value)
                }
                options={mockAddressBook.map((a) => ({
                  value: a.id,
                  label: `${a.label} (${a.network})`,
                }))}
                className="bg-white"
              />
            )}

            <TextInput
              id="withdraw-address"
              label={isNewAddress ? "Address" : undefined}
              value={address}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
              placeholder="Enter wallet address..."
              className={cn("font-mono text-sm", !isNewAddress && "bg-paper")}
              readOnly={!isNewAddress}
            />

            {addressLabel && (
              <p className="text-xs text-ink/40 mt-1">Label: {addressLabel}</p>
            )}
          </div>

          {/* Network */}
          <Select
            label="Network"
            value={selectedNetwork}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setSelectedNetwork(e.target.value)
            }
            options={[
              { value: "TRC20", label: "TRC20 (USDT)" },
              { value: "ERC20", label: "ERC20 (USDT)" },
              { value: "BEP20", label: "BEP20 (USDT)" },
            ]}
            className="bg-white"
          />

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={handleBack} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleNext}
            className="flex-1"
            disabled={!isFormValid()}
          >
            Review & Confirm
          </Button>
        </div>
      </div>
    );
  }

  // ---- Step: Confirm ----
  if (currentStep === "confirm") {
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
          <h1 className="text-2xl font-bold text-ink">Confirm Withdrawal</h1>
        </div>

        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3 text-ink/60">
            <Shield className="w-5 h-5" />
            <span className="text-sm">
              Please review the details below before confirming.
            </span>
          </div>

          <div className="space-y-3 border-t border-ink/10 pt-4">
            <div className="flex justify-between">
              <span className="text-ink/60">Amount</span>
              <span className="font-medium">{formatCurrency(amountInMinor, "USD")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink/60">Network Fee</span>
              <span className="font-medium">{formatCurrency(fee, "USD")}</span>
            </div>
            <div className="flex justify-between border-t border-ink/10 pt-3">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-ink">{formatCurrency(totalAmount, "USD")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink/60">Network</span>
              <span className="font-medium">{selectedNetwork}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink/60">Address</span>
              <span className="font-mono text-xs text-ink break-all max-w-[200px] text-right">
                {address}
              </span>
            </div>
          </div>

          <div className="bg-clay/10 border border-clay/30 rounded-lg p-4 text-sm">
            <p className="font-medium text-clay-700">⚠️ Important</p>
            <p className="text-ink/60 mt-1">
              Withdrawals require{" "}
              <strong>two-factor authentication (2FA)</strong> and are subject to{" "}
              <strong>four-eyes approval</strong> by a Finance Officer.
            </p>
            <p className="text-ink/60 mt-1">
              The withdrawal will be pending until approved. You can track its status in your transaction history.
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
                Enter the 6-digit code from your authenticator app to confirm this withdrawal.
              </p>
              <TextInput
                id="withdraw-2fa"
                label="2FA Code"
                type="text"
                value={twoFactorCode}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
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
                  {is2FAVerifying ? "Verifying..." : "Confirm"}
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
            onClick={handleNext}
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Withdrawal"}
          </Button>
        </div>
      </div>
    );
  }

  // ---- Step: Pending Approval ----
  if (currentStep === "pending") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="text-ink-400 hover:text-ink-600"
            aria-label="Back to wallet"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-ink">Withdrawal Submitted</h1>
        </div>

        <Card className="p-8 text-center space-y-4 border-clay/30 bg-clay/5">
          <div className="w-16 h-16 rounded-full bg-clay/20 flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8 text-clay" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-ink">Awaiting Approval</h2>
            <p className="text-ink/60 mt-1">
              Your withdrawal request has been submitted and is waiting for a Finance Officer to approve it.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 text-left space-y-2 max-w-sm mx-auto">
            <div className="flex justify-between text-sm">
              <span className="text-ink/60">Reference</span>
              <span className="font-mono text-ink">{withdrawalId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink/60">Amount</span>
              <span className="font-medium">{formatCurrency(totalAmount, "USD")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink/60">Status</span>
              <span className="text-clay font-medium">Pending Approval</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-ink/60">
            <UserCheck className="w-4 h-4" />
            <span>Four-eyes approval required: two Finance Officers must approve</span>
          </div>
          <Button
            variant="primary"
            onClick={() => router.push("/wallet/transactions")}
            className="mt-4"
          >
            View Transaction History
          </Button>
        </Card>

        <p className="text-sm text-ink/40 text-center">
          You will receive a notification when your withdrawal is approved or rejected.
        </p>
      </div>
    );
  }

  return null;
}