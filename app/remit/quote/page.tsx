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
  type RemittanceCorridor,
  type RemittanceRecipient,
} from "@/components/mock/data";
import { formatCurrency, cn } from "@/lib/utils";
import { AlertCircle, Info, Shield, Clock } from "lucide-react";

export default function QuotePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const corridorId = searchParams.get("corridor");
  const recipientId = searchParams.get("recipient");

  const corridor = useMemo(() => {
    return corridorId ? getCorridorById(corridorId) : null;
  }, [corridorId]);

  const recipient = useMemo(() => {
    if (!recipientId) return null;
    // Check both saved and mock recipients
    return mockRemittanceRecipients.find(r => r.id === recipientId) || null;
  }, [recipientId]);

  const [amount, setAmount] = useState<string>("");
  const [purpose, setPurpose] = useState("");
  const [error, setError] = useState<string | null>(null);

  const amountMinor = useMemo(() => {
    const val = parseFloat(amount);
    return isNaN(val) ? 0 : Math.round(val * 100);
  }, [amount]);

  const fee = corridor?.fee || 0;
  const total = amountMinor + fee;
  const receiveAmount = corridor ? Math.round(amountMinor * corridor.rate) : 0;

  const isAmountValid = amountMinor > 0 &&
    corridor &&
    amountMinor >= corridor.minAmount &&
    amountMinor <= corridor.maxAmount;

  const handleProceed = () => {
    if (!isAmountValid) {
      if (amountMinor <= 0) setError("Please enter a valid amount.");
      else if (corridor && amountMinor < corridor.minAmount)
        setError(`Minimum amount is ${formatCurrency(corridor.minAmount, corridor.fromCurrency)}`);
      else if (corridor && amountMinor > corridor.maxAmount)
        setError(`Maximum amount is ${formatCurrency(corridor.maxAmount, corridor.fromCurrency)}`);
      return;
    }
    setError(null);
    router.push(
      `/remit/confirm?corridor=${corridorId}&recipient=${recipientId}&amount=${amountMinor}&purpose=${encodeURIComponent(purpose)}`
    );
  };

  if (!corridor || !recipient) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <Card className="p-8 border-red-200 bg-red-50/50">
          <p className="text-red-700">Invalid corridor or recipient. Please start over.</p>
          <Button variant="primary" className="mt-4" onClick={() => router.push("/remit")}>
            Start Over
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push(`/remit/recipient?corridor=${corridor.id}`)}
          className="text-ink-400 hover:text-ink-600"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-ink">Quote</h1>
      </div>

      {/* Summary */}
      <div className="bg-paper border border-ink/10 rounded-lg p-4 space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-ink-400">To</span>
          <span className="font-medium">{recipient.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-400">Destination</span>
          <span>{corridor.toCountry} ({corridor.toCurrency})</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-400">Payout partner</span>
          <span>{corridor.partner}</span>
        </div>
      </div>

      {/* Amount input */}
      <div>
        <TextInput
          label={`Amount (${corridor.fromCurrency})`}
          type="number"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            setError(null);
          }}
          placeholder={`Min: ${formatCurrency(corridor.minAmount, corridor.fromCurrency)}`}
          className="text-xl font-bold"
          step="0.01"
          min={corridor.minAmount / 100}
        />
        <div className="flex justify-between text-xs text-ink-400 mt-1">
          <span>Min: {formatCurrency(corridor.minAmount, corridor.fromCurrency)}</span>
          <span>Max: {formatCurrency(corridor.maxAmount, corridor.fromCurrency)}</span>
        </div>
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      </div>

      {/* Purpose (optional) */}
      <TextInput
        label="Purpose (optional)"
        value={purpose}
        onChange={(e) => setPurpose(e.target.value)}
        placeholder="e.g., Family support, School fees..."
        className="bg-white"
      />

      {/* Quote breakdown */}
      {amountMinor > 0 && (
        <Card className="p-4 space-y-3 border-sky-200 bg-sky-50/30">
          <h3 className="font-semibold text-ink text-sm">Quote Breakdown</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-400">Amount</span>
              <span>{formatCurrency(amountMinor, corridor.fromCurrency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-400">Transfer Fee</span>
              <span className="text-clay">+ {formatCurrency(fee, corridor.fromCurrency)}</span>
            </div>
            <div className="flex justify-between border-t border-ink/10 pt-2 font-bold">
              <span>Total to pay</span>
              <span>{formatCurrency(total, corridor.fromCurrency)}</span>
            </div>
            <div className="flex justify-between border-t border-ink/10 pt-2">
              <span className="text-ink-400">Exchange Rate</span>
              <span>1 {corridor.fromCurrency} = {corridor.rate} {corridor.toCurrency}</span>
            </div>
            <div className="flex justify-between text-green-600 font-medium">
              <span>Recipient gets</span>
              <span>{formatCurrency(receiveAmount, corridor.toCurrency)}</span>
            </div>
          </div>

          <div className="bg-white/70 rounded-lg p-2 text-xs text-ink-400 flex items-start gap-2">
            <Clock className="w-4 h-4 flex-shrink-0 mt-0.5 text-sky-600" />
            <span>Estimated delivery: {corridor.estimatedDelivery}. Quote valid for 5 minutes.</span>
          </div>
        </Card>
      )}

      {/* FX disclosure */}
      {amountMinor > 0 && (
        <div className="bg-clay/5 border border-clay/20 rounded-lg p-3 text-xs text-ink-60 flex items-start gap-2">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-clay" />
          <div>
            <p className="font-medium text-clay">FX Disclosure</p>
            <p>
              Rate: 1 {corridor.fromCurrency} = {corridor.rate} {corridor.toCurrency}.
              Total cost of transfer: {formatCurrency(total, corridor.fromCurrency)}.
              Recipient will receive {formatCurrency(receiveAmount, corridor.toCurrency)}.
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={() => router.push(`/remit/recipient?corridor=${corridor.id}`)}>
          Back
        </Button>
        <Button variant="primary" className="flex-1" onClick={handleProceed} disabled={!isAmountValid}>
          Proceed to Pay
        </Button>
      </div>
    </div>
  );
}