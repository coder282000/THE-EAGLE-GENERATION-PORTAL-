"use client";

import { Button } from "@/components/button";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Send, Clock } from "lucide-react";

export function QuickActions() {
  const router = useRouter();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Button
        variant="primary"
        className="flex items-center gap-2"
        onClick={() => router.push("/wallet/deposit")}
      >
        <ArrowDown className="w-4 h-4" />
        Deposit
      </Button>
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={() => router.push("/wallet/withdraw")}
      >
        <ArrowUp className="w-4 h-4" />
        Withdraw
      </Button>
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={() => router.push("/wallet/transfer")}
      >
        <Send className="w-4 h-4" />
        Transfer
      </Button>
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={() => router.push("/wallet/transactions")}
      >
        <Clock className="w-4 h-4" />
        History
      </Button>
    </div>
  );
}