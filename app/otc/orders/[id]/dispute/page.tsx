"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { Textarea } from "@/components/textarea";
import { Select } from "@/components/select";
import { mockOTCOrders } from "@/components/mock/data";
import { formatCurrency, cn } from "@/lib/utils";
import { AlertCircle, CheckCircle, Shield } from "lucide-react";

const disputeReasons = [
  { value: "FUNDS_NOT_RECEIVED", label: "Funds not received" },
  { value: "INCORRECT_AMOUNT", label: "Incorrect amount" },
  { value: "AGENT_UNRESPONSIVE", label: "Agent unresponsive" },
  { value: "TECHNICAL_ISSUE", label: "Technical issue" },
  { value: "OTHER", label: "Other" },
];

export default function OTCDisputePage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const order = useMemo(() => {
    return mockOTCOrders.find((o) => o.id === orderId);
  }, [orderId]);

  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <Card className="p-8 border-red-200 bg-red-50/50">
          <h2 className="text-lg font-semibold text-red-700">Order not found</h2>
          <Button variant="primary" className="mt-4" onClick={() => router.push("/otc/orders")}>
            Back to Orders
          </Button>
        </Card>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!reason) {
      setError("Please select a reason for the dispute.");
      return;
    }
    if (!description.trim()) {
      setError("Please provide a detailed description.");
      return;
    }
    setError(null);
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <Card className="p-8 text-center space-y-4 border-green-200 bg-green-50/50">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-green-700">Dispute Submitted</h2>
            <p className="text-ink-60 mt-1">
              Your dispute has been submitted and will be reviewed by our team.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 text-left space-y-2 max-w-sm mx-auto">
            <div className="flex justify-between text-sm">
              <span className="text-ink-60">Order ID</span>
              <span className="font-mono text-ink">{order.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-60">Status</span>
              <span className="text-clay font-medium">Under Review</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => router.push(`/otc/orders/${order.id}`)}>
              View Order
            </Button>
            <Button variant="primary" className="flex-1" onClick={() => router.push("/otc/orders")}>
              All Orders
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push(`/otc/orders/${order.id}`)}
          className="text-ink-400 hover:text-ink-600"
        >
          ← Back to Order
        </button>
        <h1 className="text-2xl font-bold text-ink">Raise Dispute</h1>
      </div>

      <Card className="p-4 border-clay/30 bg-clay/5 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-clay flex-shrink-0 mt-0.5" />
        <div className="text-sm text-ink-60">
          <p className="font-medium text-clay">Before you proceed</p>
          <p className="text-xs">
            Disputes are reviewed by our team within 24-48 hours. Please provide as much detail as possible.
            Orders are paused during dispute resolution.
          </p>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-ink-60">Order</span>
          <span className="font-mono text-ink">{order.id}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-ink-60">Amount</span>
          <span className="font-medium">{formatCurrency(order.amount, "USD")} USDT</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-ink-60">Status</span>
          <span className="text-clay font-medium">{order.status}</span>
        </div>

        <div className="border-t border-ink/10 pt-4">
          <Select
            label="Reason for dispute"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            options={disputeReasons}
            className="bg-white"
          />
        </div>

        <div>
          <Textarea
            id="dispute-description"
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please describe the issue in detail..."
            className="bg-white"
            rows={4}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={() => router.push(`/otc/orders/${order.id}`)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            className="flex-1 bg-red-600 hover:bg-red-700"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Dispute"}
          </Button>
        </div>
      </Card>
    </div>
  );
}