"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { TextInput } from "@/components/input";
import { mockRemittanceCorridors, type RemittanceCorridor } from "@/components/mock/data";
import { formatCurrency, cn } from "@/lib/utils";
import { Search, ChevronRight, Clock, AlertCircle, Globe } from "lucide-react";

export default function RemitPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCorridors = useMemo(() => {
    let result = mockRemittanceCorridors.filter(c => c.status === 'ACTIVE');
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(c =>
        c.toCountry.toLowerCase().includes(q) ||
        c.fromCountry.toLowerCase().includes(q)
      );
    }
    return result;
  }, [searchQuery]);

  const handleSelect = (corridor: RemittanceCorridor) => {
    router.push(`/remit/recipient?corridor=${corridor.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/wallet")}
          className="text-ink-400 hover:text-ink-600"
          aria-label="Back to wallet"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-ink">Send Money</h1>
      </div>

      {/* Info banner */}
      <div className="bg-sky-50/50 border border-sky-200 rounded-lg p-4 text-sm text-ink-60">
        <p>Choose the destination country to send money. Fast, secure transfers to mobile money and bank accounts.</p>
      </div>

      {/* Search */}
      <TextInput
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search destination country..."
        leftElement={<Search className="w-4 h-4 text-ink-400" />}
        className="bg-white"
      />

      {/* Corridor list */}
      {filteredCorridors.length === 0 ? (
        <Card className="p-8 text-center">
          <Globe className="w-10 h-10 text-ink-300 mx-auto" />
          <p className="text-ink-400 mt-2">No corridors available</p>
          {searchQuery && (
            <p className="text-sm text-ink-300">Try a different search term</p>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredCorridors.map((corridor) => (
            <Card
              key={corridor.id}
              className="p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-all"
              onClick={() => handleSelect(corridor)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-paper flex items-center justify-center text-2xl">
                  🌍
                </div>
                <div>
                  <p className="font-semibold text-ink">
                    {corridor.fromCountry} → {corridor.toCountry}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-400">
                    <span>Rate: {corridor.rate} {corridor.toCurrency} / {corridor.fromCurrency}</span>
                    <span>·</span>
                    <span>Fee: {formatCurrency(corridor.fee, corridor.fromCurrency)}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {corridor.estimatedDelivery}
                    </span>
                  </div>
                  <p className="text-xs text-ink-300">
                    Min: {formatCurrency(corridor.minAmount, corridor.fromCurrency)} · Max: {formatCurrency(corridor.maxAmount, corridor.fromCurrency)}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-ink-400" />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}