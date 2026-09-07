"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { TextInput } from "@/components/input";
import { formatCurrency, cn } from "@/lib/utils";
import { mockOTCRate, getOTCQuote } from "@/components/mock/data";
import { mockWalletBalances, mockKYCStatus } from "@/components/mock/data";
import {
  AlertCircle,
  CheckCircle,
  Lock,
  TrendingDown,
  Info,
} from "lucide-react";

type Step = "amount" | "quote" | "confirm" | "success";

export default function OTCSellPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("amount");
  const [usdtAmount, setUsdtAmount] = useState<string>("");
  const [quote, setQuote] = useState<ReturnType<typeof getOTCQuote> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [show2FA, setShow2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState<string>("");
  const [is2FAVerifying, setIs2FAVerifying] = useState(false);
  const [twoFAError, setTwoFAError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string>("");

  // Get balance (USDT TRC20)
  const usdtBalance = useMemo(() => {
    const bal = mockWalletBalances.find((b) => b.asset === "USDT" && b.network === "TRC20");
    return bal?.available || 0;
  }, []);

  const kyc = mockKYCStatus;
  const dailyLimitRemaining = kyc.dailyLimit - kyc.dailyUsed;

  const usdtAmountMinor = useMemo(() => {
    const val = parseFloat(usdtAmount);
    return isNaN(val) ? 0 : Math.round(val * 100);
  }, [usdtAmount]);

  const isAmountValid = usdtAmountMinor > 0 && usdtAmountMinor <= usdtBalance && usdtAmountMinor <= dailyLimitRemaining;

  const handleGenerateQuote = () => {
    if (!isAmountValid) {
      if (usdtAmountMinor <= 0) setError("Please enter a valid amount.");
      else if (usdtAmountMinor > usdtBalance) setError("Insufficient USDT balance.");
      else if (usdtAmountMinor > dailyLimitRemaining) setError("Exceeds daily OTC limit.");
      return;
    }
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const newQuote = getOTCQuote("SELL", usdtAmountMinor);
      setQuote(newQuote);
      setIsLoading(false);
      setStep("quote");
    }, 600);
  };

  const handleConfirm = () => setShow2FA(true);

  const handle2FASubmit = () => {
    if (twoFactorCode.length !== 6) {
      setTwoFAError("Please enter a valid 6-digit code.");
      return;
    }
    setIs2FAVerifying(true);
    setTwoFAError(null);

    setTimeout(() => {
      setIs2FAVerifying(false);
      setShow2FA(false);
      setStep("success");
      setOrderId("otc-" + Date.now().toString(36));
    }, 1200);
  };

  const handleBack = () => {
    if (step === "quote") {
      setStep("amount");
      setQuote(null);
    } else {
      router.push("/wallet");
    }
  };

  if (step === "amount") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="text-ink-400 hover:text-ink-600">← Back</button>
          <h1 className="text-2xl font-bold text-ink">Sell USDT</h1>
        </div>

        <Card className="p-4 bg-sky-50/50 border-sky-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-ink-60">Current Rate</p>
              <p className="text-xl font-bold text-ink">
                {formatCurrency(Math.round(mockOTCRate.sellRate * 100), "KES")} / USDT
              </p>
            </div>
            <div className="flex items-center gap-1 text-sm text-red-600">
              <TrendingDown className="w-4 h-4" />
              <span>-0.3%</span>
            </div>
          </div>
          <div className="flex justify-between text-xs text-ink-40 mt-1">
            <span>Updated just now</span>
            <span>Available: {formatCurrency(usdtBalance, "USD")}</span>
          </div>
        </Card>

        <div>
          <TextInput
            label="Amount (USDT)"
            type="number"
            value={usdtAmount}
            onChange={(e) => {
              setUsdtAmount(e.target.value);
              setError(null);
            }}
            placeholder="0.00"
            min="0.01"
            step="0.01"
            className="text-xl font-bold"
            rightElement={
              <button
                className="text-xs text-sky-600 hover:text-sky-800 font-medium"
                onClick={() => setUsdtAmount((Math.min(usdtBalance, dailyLimitRemaining) / 100).toString())}
              >
                Max
              </button>
            }
          />
          {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
          <div className="text-xs text-ink-40 mt-1 flex justify-between">
            <span>1 USDT ≈ {formatCurrency(Math.round(mockOTCRate.sellRate * 100), "KES")}</span>
            <span>Limit: {formatCurrency(dailyLimitRemaining, "USD")}</span>
          </div>
        </div>

        <div className="bg-paper border border-ink/10 rounded-lg p-4 space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
            <div className="text-ink-60">
              <p className="font-medium">How it works</p>
              <p className="text-xs">
                You lock in a rate and we match you with an OTC agent. The order enters escrow.
                Your USDT will be deducted from your wallet upon match, and KES will be sent to your M-Pesa.
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="primary"
          className="w-full"
          onClick={handleGenerateQuote}
          disabled={!isAmountValid || isLoading}
        >
          {isLoading ? "Getting quote..." : "Get Quote"}
        </Button>
      </div>
    );
  }

  if (step === "quote" && quote) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="text-ink-400 hover:text-ink-600">← Back</button>
          <h1 className="text-2xl font-bold text-ink">Confirm Quote</h1>
        </div>

        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between text-sm text-ink-60">
            <span>Quote ID</span>
            <span className="font-mono">{quote.id}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-ink-60">
            <span>Expires</span>
            <span className="text-clay font-medium">{new Date(quote.expiresAt).toLocaleTimeString()}</span>
          </div>

          <div className="border-t border-ink/10 pt-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-ink-60">USDT Amount</span>
              <span className="font-semibold">{formatCurrency(quote.amount, "USD")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-60">Rate</span>
              <span className="font-semibold">{formatCurrency(Math.round(quote.rate * 100), "KES")} / USDT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-60">OTC Fee (1%)</span>
              <span className="font-semibold text-clay">- {formatCurrency(quote.fee, "KES")}</span>
            </div>
            <div className="flex justify-between border-t border-ink/10 pt-3">
              <span className="font-bold">You Receive (KES)</span>
              <span className="text-xl font-bold text-green-600">{formatCurrency(quote.total, "KES")}</span>
            </div>
          </div>

          <div className="bg-clay/5 border border-clay/30 rounded-lg p-3 text-sm">
            <p className="font-medium text-clay">⚠️ Note</p>
            <p className="text-ink-60 text-xs">
              This quote is valid for 5 minutes. Order will enter escrow and be matched with an agent.
              KES will be sent to your registered M-Pesa.
            </p>
          </div>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleBack}>Back</Button>
          <Button variant="primary" className="flex-1" onClick={handleConfirm}>Confirm & Place Order</Button>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <Card className="p-8 text-center space-y-4 border-green-200 bg-green-50/50">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-green-700">Sell Order Placed!</h2>
            <p className="text-ink-60 mt-1">
              Your OTC sell order is being processed and will be matched with an agent.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 text-left space-y-2 max-w-sm mx-auto">
            <div className="flex justify-between text-sm">
              <span className="text-ink-60">Order ID</span>
              <span className="font-mono text-ink">{orderId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-60">Status</span>
              <span className="text-clay font-medium">Pending Match</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-60">Amount</span>
              <span className="font-medium">{formatCurrency(quote?.amount || 0, "USD")}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => router.push("/otc/orders")}>
              View Orders
            </Button>
            <Button variant="primary" className="flex-1" onClick={() => router.push("/wallet")}>
              Back to Wallet
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return null;
}