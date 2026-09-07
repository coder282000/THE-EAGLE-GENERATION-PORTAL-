"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { TextInput } from "@/components/input";
import { mockWalletBalances, mockWalletTransactions } from "@/components/mock/data";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle, Copy, ExternalLink, QrCode } from "lucide-react";

// Types
interface DepositOption {
  asset: "USDT";
  network: "TRC20" | "ERC20" | "BEP20";
  available: number;
  pending: number;
}

// Mock deposit address generation (would come from API in production)
const generateDepositAddress = (network: string): string => {
  const prefixes: Record<string, string> = {
    TRC20: "T",
    ERC20: "0x",
    BEP20: "0x",
  };
  const prefix = prefixes[network] || "";
  const randomHex = Array.from({ length: 40 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
  return prefix + randomHex;
};

export default function DepositPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialAsset = searchParams.get("asset") || "USDT";
  const initialNetwork = searchParams.get("network") || "TRC20";

  // Step: 'select' or 'address'
  const [step, setStep] = useState<"select" | "address">("select");
  const [selectedOption, setSelectedOption] = useState<DepositOption | null>(null);
  const [depositAddress, setDepositAddress] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [confirmations, setConfirmations] = useState(0);
  const [isPolling, setIsPolling] = useState(false);

  // Options derived from balances
  const options: DepositOption[] = mockWalletBalances.map((b) => ({
    asset: b.asset,
    network: b.network,
    available: b.available,
    pending: b.pending,
  }));

  // Auto-select from query params if valid
  useEffect(() => {
    if (step === "select") {
      const match = options.find(
        (o) => o.asset === initialAsset && o.network === initialNetwork
      );
      if (match) {
        setSelectedOption(match);
        handleSelect(match);
      }
    }
  }, [initialAsset, initialNetwork, options]);

  const handleSelect = (option: DepositOption) => {
    setSelectedOption(option);
    // Generate address and move to address step
    setIsGenerating(true);
    // Simulate API call
    setTimeout(() => {
      const addr = generateDepositAddress(option.network);
      setDepositAddress(addr);
      setIsGenerating(false);
      setStep("address");
      // Start polling for confirmations (mock)
      startPolling();
    }, 800);
  };

  const startPolling = () => {
    setIsPolling(true);
    let count = 0;
    const interval = setInterval(() => {
      count += 1;
      setConfirmations(count);
      if (count >= 6) {
        clearInterval(interval);
        setIsPolling(false);
        // In a real app, we would also set the transaction hash from the chain
        setTxHash("0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""));
      }
    }, 2000);
    // Cleanup on unmount
    return () => clearInterval(interval);
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(depositAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBack = () => {
    if (step === "address") {
      setStep("select");
      setTxHash(null);
      setConfirmations(0);
      setIsPolling(false);
    } else {
      router.push("/wallet");
    }
  };

  // ---- Step 1: Select ----
  if (step === "select") {
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
          <h1 className="text-2xl font-bold text-ink">Deposit USDT</h1>
        </div>

        <p className="text-sm text-ink/60">
          Select the asset and network you want to deposit. Make sure to send only USDT on the selected network.
        </p>

        <div className="space-y-3">
          {options.map((option) => {
            const isSelected = selectedOption?.network === option.network;
            const available = formatCurrency(option.available, "USD");
            const pending = option.pending > 0 ? formatCurrency(option.pending, "USD") : null;

            return (
              <Card
                key={option.network}
                className={cn(
                  "p-4 flex items-center justify-between cursor-pointer transition-all hover:shadow-md",
                  isSelected && "border-sky-400 ring-2 ring-sky-200"
                )}
                onClick={() => handleSelect(option)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-bold">
                    {option.asset.slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-semibold text-ink">{option.asset}</p>
                    <p className="text-xs text-ink/60">{option.network}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-ink">{available}</p>
                  {pending && <p className="text-xs text-clay">Pending: {pending}</p>}
                </div>
              </Card>
            );
          })}
        </div>

        <div className="bg-paper border border-ink/10 rounded-lg p-4 text-sm text-ink/60">
          ⚠️ Always double-check the network. Sending tokens on the wrong network may result in permanent loss.
        </div>
      </div>
    );
  }

  // ---- Step 2: Address & QR ----
  if (step === "address" && selectedOption) {
    const isConfirmed = confirmations >= 6;
    const isConfirming = confirmations > 0 && confirmations < 6;
    const isPending = !txHash && !isConfirming;

    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="text-ink-400 hover:text-ink-600"
            aria-label="Back to select"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-ink">Deposit Address</h1>
        </div>

        {isGenerating ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-ink/60">Generating deposit address...</p>
          </div>
        ) : (
          <>
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-ink/60">Network</p>
                  <p className="font-medium">{selectedOption.network}</p>
                </div>
                <div>
                  <p className="text-sm text-ink/60">Asset</p>
                  <p className="font-medium">{selectedOption.asset}</p>
                </div>
              </div>

              <div className="border-t border-ink/10 pt-4">
                <p className="text-sm text-ink/60 mb-2">Deposit Address</p>
                <div className="flex items-center gap-2 bg-paper rounded-lg p-3 border border-ink/10">
                  <code className="flex-1 text-xs break-all text-ink">{depositAddress}</code>
                  <button
                    onClick={handleCopyAddress}
                    className="p-2 text-ink-400 hover:text-ink-600 transition-colors"
                    aria-label="Copy address"
                  >
                    {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* QR Code placeholder */}
              <div className="flex justify-center">
                <div className="w-40 h-40 bg-white border border-ink/10 rounded-lg flex items-center justify-center">
                  <QrCode className="w-24 h-24 text-ink/30" />
                </div>
              </div>

              <div className="text-xs text-ink/40 text-center">
                Send only {selectedOption.asset} on the {selectedOption.network} network to this address.
              </div>
            </Card>

            {/* Status */}
            <Card className="p-4 border-sky-200 bg-sky-50/50">
              <div className="flex items-start gap-3">
                {isConfirmed ? (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                ) : isConfirming ? (
                  <div className="w-5 h-5 border-2 border-sky-200 border-t-sky-600 rounded-full animate-spin flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-clay flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-medium text-ink">
                    {isConfirmed
                      ? "Deposit confirmed!"
                      : isConfirming
                      ? `Confirming... ${confirmations}/6 confirmations`
                      : "Waiting for deposit..."}
                  </p>
                  <p className="text-sm text-ink/60">
                    {isConfirmed
                      ? "Your deposit has been confirmed and credited to your wallet."
                      : isConfirming
                      ? "We are waiting for the blockchain to confirm your transaction."
                      : "Send funds to the address above. The deposit will appear once confirmed."}
                  </p>
                  {txHash && (
                    <a
                      href={`https://tronscan.org/#/transaction/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-sky-600 hover:underline flex items-center gap-1 mt-2"
                    >
                      View on block explorer <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back to networks
              </Button>
              {isConfirmed && (
                <Button
                  variant="primary"
                  onClick={() => router.push("/wallet")}
                  className="flex-1"
                >
                  Go to Wallet
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  return null;
}