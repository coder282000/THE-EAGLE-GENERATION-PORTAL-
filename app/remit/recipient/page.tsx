"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { TextInput } from "@/components/input";
import { Select } from "@/components/select";
import {
  mockRemittanceCorridors,
  mockRemittanceRecipients,
  getCorridorById,
  type RemittanceCorridor,
  type RemittanceRecipient,
} from "@/components/mock/data";
import { formatCurrency, cn } from "@/lib/utils";
import { AlertCircle, Phone, Mail, Building, User, Plus } from "lucide-react";

type RecipientStep = "select" | "new";

export default function RecipientPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const corridorId = searchParams.get("corridor");

  const corridor = useMemo(() => {
    return corridorId ? getCorridorById(corridorId) : null;
  }, [corridorId]);

  const [step, setStep] = useState<RecipientStep>("select");
  const [selectedRecipientId, setSelectedRecipientId] = useState("");
  const [error, setError] = useState<string | null>(null);

  // New recipient form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNetwork, setMobileNetwork] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [relationship, setRelationship] = useState<RemittanceRecipient['relationship']>("FRIEND");
  const [saveRecipient, setSaveRecipient] = useState(true);

  // Saved recipients for this user
  const savedRecipients = useMemo(() => {
    return mockRemittanceRecipients.filter(r => r.isSaved);
  }, []);

  // When corridor changes, reset form
  useEffect(() => {
    if (corridor) {
      // Set default mobile network based on corridor
      const networks = ['MTN MoMo', 'Tigo Pesa', 'Airtel Money', 'M-Pesa'];
      const defaultNetwork = networks.find(n =>
        corridor.partner.includes(n.split(' ')[0])
      );
      if (defaultNetwork) {
        setMobileNetwork(defaultNetwork);
      }
    }
  }, [corridor]);

  const handleSelectRecipient = () => {
    if (!selectedRecipientId) {
      setError("Please select a recipient.");
      return;
    }
    setError(null);
    router.push(`/remit/quote?corridor=${corridorId}&recipient=${selectedRecipientId}`);
  };

  const handleCreateRecipient = () => {
    // Validate
    if (!name.trim() || !phone.trim()) {
      setError("Name and phone are required.");
      return;
    }
    setError(null);

    // Create recipient (in real app, would save to backend)
    const newRecipient: RemittanceRecipient = {
      id: 'rec-' + Date.now().toString(36),
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      country: corridor?.toCountry || '',
      currency: corridor?.toCurrency || '',
      bankName: bankName.trim() || undefined,
      bankAccount: bankAccount.trim() || undefined,
      mobileNetwork: mobileNetwork || undefined,
      relationship,
      isSaved: saveRecipient,
      createdAt: new Date().toISOString(),
    };

    // Navigate to quote with new recipient
    router.push(`/remit/quote?corridor=${corridorId}&recipient=${newRecipient.id}`);
  };

  if (!corridor) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <Card className="p-8 border-red-200 bg-red-50/50">
          <p className="text-red-700">Invalid corridor selected.</p>
          <Button variant="primary" className="mt-4" onClick={() => router.push("/remit")}>
            Back to corridors
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
          onClick={() => router.push("/remit")}
          className="text-ink-400 hover:text-ink-600"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-ink">Recipient Details</h1>
      </div>

      {/* Corridor info */}
      <div className="bg-paper border border-ink/10 rounded-lg p-4 text-sm">
        <p className="font-medium">Sending to: {corridor.toCountry}</p>
        <p className="text-ink-400 text-xs">Payout partner: {corridor.partner}</p>
      </div>

      {/* Step selector */}
      <div className="flex items-center gap-4 border-b border-ink/10 pb-4">
        <button
          onClick={() => setStep("select")}
          className={cn(
            "text-sm font-medium transition-colors",
            step === "select"
              ? "text-sky-600 border-b-2 border-sky-600 pb-2"
              : "text-ink-400 hover:text-ink-600"
          )}
        >
          Saved Recipients
        </button>
        <button
          onClick={() => setStep("new")}
          className={cn(
            "text-sm font-medium transition-colors",
            step === "new"
              ? "text-sky-600 border-b-2 border-sky-600 pb-2"
              : "text-ink-400 hover:text-ink-600"
          )}
        >
          New Recipient
        </button>
      </div>

      {step === "select" ? (
        // ---- Select saved recipient ----
        <div className="space-y-4">
          <Select
            label="Select Recipient"
            value={selectedRecipientId}
            onChange={(e) => {
              setSelectedRecipientId(e.target.value);
              setError(null);
            }}
            options={[
              { value: "", label: "Choose a saved recipient..." },
              ...savedRecipients.map(r => ({
                value: r.id,
                label: `${r.name} - ${r.phone}`,
              })),
            ]}
            className="bg-white"
          />

          {selectedRecipientId && (
            <Card className="p-4 bg-paper">
              {(() => {
                const rec = mockRemittanceRecipients.find(r => r.id === selectedRecipientId);
                if (!rec) return null;
                return (
                  <div className="space-y-1 text-sm">
                    <p><span className="text-ink-400">Name:</span> {rec.name}</p>
                    <p><span className="text-ink-400">Phone:</span> {rec.phone}</p>
                    {rec.email && <p><span className="text-ink-400">Email:</span> {rec.email}</p>}
                    {rec.mobileNetwork && <p><span className="text-ink-400">Network:</span> {rec.mobileNetwork}</p>}
                    {rec.bankName && <p><span className="text-ink-400">Bank:</span> {rec.bankName}</p>}
                    <p><span className="text-ink-400">Relationship:</span> {rec.relationship}</p>
                  </div>
                );
              })()}
            </Card>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <Button variant="primary" className="w-full" onClick={handleSelectRecipient} disabled={!selectedRecipientId}>
            Continue to Quote
          </Button>
        </div>
      ) : (
        // ---- New recipient form ----
        <div className="space-y-4">
          {/* Full Name with icon */}
          <div className="relative">
            <TextInput
              id="recipient-name"
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Grace Mwangi"
              className="bg-white pl-9"
            />
            <User className="absolute left-3 top-9 w-4 h-4 text-ink-400" />
          </div>

          {/* Phone Number with icon */}
          <div className="relative">
            <TextInput
              id="recipient-phone"
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g., +256 712 345 678"
              className="bg-white pl-9"
            />
            <Phone className="absolute left-3 top-9 w-4 h-4 text-ink-400" />
          </div>

          {/* Email with icon */}
          <div className="relative">
            <TextInput
              id="recipient-email"
              label="Email (optional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="recipient@example.com"
              className="bg-white pl-9"
            />
            <Mail className="absolute left-3 top-9 w-4 h-4 text-ink-400" />
          </div>

          <Select
            label="Mobile Network (optional)"
            value={mobileNetwork}
            onChange={(e) => setMobileNetwork(e.target.value)}
            options={[
              { value: "", label: "Select network..." },
              { value: "MTN MoMo", label: "MTN MoMo" },
              { value: "Tigo Pesa", label: "Tigo Pesa" },
              { value: "Airtel Money", label: "Airtel Money" },
              { value: "M-Pesa", label: "M-Pesa" },
            ]}
            className="bg-white"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Bank Name with icon */}
            <div className="relative">
              <TextInput
                id="recipient-bank-name"
                label="Bank Name (optional)"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g., CRDB Bank"
                className="bg-white pl-9"
              />
              <Building className="absolute left-3 top-9 w-4 h-4 text-ink-400" />
            </div>
            <TextInput
              id="recipient-bank-account"
              label="Bank Account (optional)"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              placeholder="e.g., 1234567890"
              className="bg-white"
            />
          </div>

          <Select
            label="Relationship"
            value={relationship}
            onChange={(e) => setRelationship(e.target.value as RemittanceRecipient['relationship'])}
            options={[
              { value: "SELF", label: "Self" },
              { value: "FAMILY", label: "Family" },
              { value: "FRIEND", label: "Friend" },
              { value: "BUSINESS", label: "Business" },
              { value: "OTHER", label: "Other" },
            ]}
            className="bg-white"
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="saveRecipient"
              checked={saveRecipient}
              onChange={(e) => setSaveRecipient(e.target.checked)}
              className="w-4 h-4 rounded border-ink-300 text-sky-600 focus:ring-sky-500"
            />
            <label htmlFor="saveRecipient" className="text-sm text-ink-600">
              Save this recipient for future transfers
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <Button variant="primary" className="w-full" onClick={handleCreateRecipient}>
            <Plus className="w-4 h-4 mr-2" />
            Add & Continue to Quote
          </Button>
        </div>
      )}

      <Button variant="outline" className="w-full" onClick={() => router.push("/remit")}>
        Back to Corridors
      </Button>
    </div>
  );
}