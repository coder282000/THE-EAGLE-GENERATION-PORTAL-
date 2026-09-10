"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MemberLayout } from "@/components/layout/memberLayout";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { getDepositById } from "@/components/mock/data";

export default function DepositAddressPage() {
  const params = useParams<{ id: string }>();
  const deposit = getDepositById(params.id);
  const [copied, setCopied] = useState(false);

  if (!deposit) {
    return (
      <MemberLayout>
        <div className="container-portal py-12">
          <Card>
            <div className="p-8 text-center">
              <h1 className="font-display text-2xl text-ink">Deposit not found</h1>
              <p className="mt-2 text-sm text-ink/60">
                This deposit request does not exist or has expired.
              </p>
              <Link href="/wallet/deposit" className="mt-6 inline-block">
                <Button variant="primary">Back to deposit</Button>
              </Link>
            </div>
          </Card>
        </div>
      </MemberLayout>
    );
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(deposit.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const remaining = Math.max(0, deposit.requiredConfirmations - deposit.confirmations);
  const progress = Math.min(100, (deposit.confirmations / deposit.requiredConfirmations) * 100);

  return (
    <MemberLayout>
      <div className="container-portal py-8">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ink/60">
          <ol className="flex flex-wrap items-center gap-2">
            <li><Link href="/wallet" className="hover:text-sky">Wallet</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/wallet/deposit" className="hover:text-sky">Deposit</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-ink">{deposit.networkLabel}</li>
          </ol>
        </nav>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Address + QR */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h1 className="font-display text-xl text-ink">
                  Deposit {deposit.asset}
                </h1>
                <span className="rounded-full bg-sky/10 px-3 py-1 text-xs font-medium text-sky">
                  {deposit.network}
                </span>
              </div>

              <div className="mt-6 flex justify-center">
                <div
                  className="flex h-48 w-48 items-center justify-center rounded-lg border border-ink/10 bg-white p-3"
                  role="img"
                  aria-label={`QR code for deposit address ${deposit.address}`}
                >
                  <QRPlaceholder value={deposit.address} />
                </div>
              </div>

              <div className="mt-6">
                <label
                  htmlFor="deposit-address"
                  className="text-xs font-medium uppercase tracking-wide text-ink/60"
                >
                  Deposit address
                </label>
                <div className="mt-2 flex items-center gap-2">
                  <code
                    id="deposit-address"
                    className="min-w-0 flex-1 truncate rounded-md border border-ink/10 bg-paper px-3 py-2 font-mono text-sm text-ink"
                  >
                    {deposit.address}
                  </code>
                  <Button
                    variant="outline"
                    onClick={handleCopy}
                    aria-label={copied ? "Address copied" : "Copy address"}
                  >
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>

              <div className="mt-6 rounded-md border border-clay/30 bg-clay/5 p-4">
                <p className="text-sm text-clay">
                  Send only <strong>{deposit.asset}</strong> on the{" "}
                  <strong>{deposit.networkLabel}</strong> network to this address.
                  Sending any other asset or using a different network will result
                  in permanent loss.
                </p>
              </div>
            </div>
          </Card>

          {/* Status + confirmations */}
          <Card>
            <div className="p-6">
              <h2 className="font-display text-lg text-ink">Waiting for deposit</h2>

              <div className="mt-4">
                <StatusRow
                  label="Status"
                  value={deposit.confirmations === 0 ? "Awaiting transfer" : "Confirming on-chain"}
                  tone="pending"
                />
                <StatusRow
                  label="Confirmations"
                  value={`${deposit.confirmations} of ${deposit.requiredConfirmations}`}
                  tone={remaining === 0 ? "success" : "pending"}
                />
                <StatusRow label="Network" value={deposit.networkLabel} />
                <StatusRow
                  label="Minimum deposit"
                  value={`${(deposit.minimumDeposit / 100).toFixed(2)} ${deposit.asset}`}
                />
              </div>

              <div className="mt-6">
                <div className="h-2 overflow-hidden rounded-full bg-paper">
                  <div
                    className="h-full bg-sky transition-all"
                    style={{ width: `${progress}%` }}
                    role="progressbar"
                    aria-valuenow={deposit.confirmations}
                    aria-valuemin={0}
                    aria-valuemax={deposit.requiredConfirmations}
                    aria-label="Confirmation progress"
                  />
                </div>
                <p className="mt-2 text-xs text-ink/60">
                  {remaining === 0
                    ? "Fully confirmed. Funds credited to your wallet."
                    : `${remaining} more confirmation${remaining === 1 ? "" : "s"} required`}
                </p>
              </div>

              <p className="mt-6 text-xs text-ink/60">
                This page updates automatically as the network confirms your deposit.
                You can safely close it — funds will be credited once confirmed.
              </p>

              <div className="mt-6 flex gap-3">
                <Link href="/wallet" className="flex-1">
                  <Button variant="outline" fullWidth>Back to wallet</Button>
                </Link>
                <Link href="/wallet/transactions" className="flex-1">
                  <Button variant="primary" fullWidth>View transactions</Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MemberLayout>
  );
}

function StatusRow({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "pending" | "success";
}) {
  const toneClass =
    tone === "success" ? "text-green-600" :
    tone === "pending" ? "text-clay" :
    "text-ink";
  return (
    <div className="flex items-center justify-between border-b border-ink/5 py-3 last:border-0">
      <span className="text-sm text-ink/60">{label}</span>
      <span className={`text-sm font-medium ${toneClass}`}>{value}</span>
    </div>
  );
}

/**
 * Deterministic QR-like placeholder. In production, replace with a real
 * QR library (qrcode.react or similar) rendering `value`.
 */
function QRPlaceholder({ value }: { value: string }) {
  const cells = 21;
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) >>> 0;

  const grid: boolean[] = [];
  for (let i = 0; i < cells * cells; i++) {
    const r = Math.floor(i / cells);
    const c = i % cells;
    const inTopLeft = r < 7 && c < 7;
    const inTopRight = r < 7 && c >= cells - 7;
    const inBottomLeft = r >= cells - 7 && c < 7;
    const isFinder = inTopLeft || inTopRight || inBottomLeft;

    if (isFinder) {
      const rr = inTopLeft ? r : inTopRight ? r : r - (cells - 7);
      const cc = inTopLeft ? c : inTopRight ? c - (cells - 7) : c;
      const border = rr === 0 || rr === 6 || cc === 0 || cc === 6;
      const center = rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4;
      grid.push(border || center);
    } else {
      grid.push(((h >> (i % 30)) & 1) === 1);
    }
  }

  return (
    <svg viewBox={`0 0 ${cells} ${cells}`} className="h-full w-full" aria-hidden="true">
      {grid.map((on, i) =>
        on ? (
          <rect
            key={i}
            x={i % cells}
            y={Math.floor(i / cells)}
            width="1"
            height="1"
            fill="#141B2E"
          />
        ) : null
      )}
    </svg>
  );
}