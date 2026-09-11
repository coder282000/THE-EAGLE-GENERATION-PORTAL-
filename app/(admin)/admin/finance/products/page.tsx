"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/button";
import {
  getProducts,
  canViewCommerce,
  canEditPrice,
  canActionCommerce,
  formatMoney,
  PRODUCT_STATUS_LABELS,
  TRANSACTION_SURFACE_LABELS,
  type Product,
  type ProductStatus,
  type ProductVisibility,
} from "@/lib/mock/commerce";

const STATUS_TONE: Record<ProductStatus, string> = {
  DRAFT: "bg-ink/10 text-ink/70",
  ACTIVE: "bg-green-100 text-green-800",
  ARCHIVED: "bg-ink/10 text-ink/50",
};

const VISIBILITY_LABELS: Record<ProductVisibility, string> = {
  PUBLIC: "Public",
  MEMBER_ONLY: "Members only",
  HIDDEN: "Hidden",
};

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [surfaceFilter, setSurfaceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<string>("");

  const canView = canViewCommerce();
  const canPrice = canEditPrice();
  const canAct = canActionCommerce();
  const all = useMemo(() => getProducts(), []);

  const filtered = useMemo(() => {
    let r = all;
    if (surfaceFilter !== "all") r = r.filter((p) => p.surface === surfaceFilter);
    if (statusFilter !== "all") r = r.filter((p) => p.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((p) => p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q));
    }
    return r;
  }, [all, search, surfaceFilter, statusFilter]);

  if (!canView) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/70">
          You do not have permission to view products.
        </div>
      </div>
    );
  }

  const total = all.length;
  const active = all.filter((p) => p.status === "ACTIVE").length;
  const draft = all.filter((p) => p.status === "DRAFT").length;
  const archived = all.filter((p) => p.status === "ARCHIVED").length;
  const withCodes = all.filter((p) => p.activeCodes > 0).length;

  const selected = selectedId ? all.find((p) => p.id === selectedId) ?? null : null;

  return (
    <div className="space-y-6 p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Products and pricing</h1>
          <p className="mt-1 text-sm text-ink/60">
            The catalogue behind the shop, events, and courses.
          </p>
        </div>
        {canAct && (
          <Button variant="primary" onClick={() => { /* create */ }}>
            Create product
          </Button>
        )}
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Kpi label="Products" value={total} />
        <Kpi label="Active" value={active} tone="success" />
        <Kpi label="Draft" value={draft} />
        <Kpi label="Archived" value={archived} />
        <Kpi label="With active codes" value={withCodes} tone={withCodes > 0 ? "clay" : "ink"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-lg border border-ink/10 bg-paper">
          <div className="flex flex-wrap gap-3 border-b border-ink/10 p-4">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or slug"
              className="flex-1 min-w-[200px] rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
              aria-label="Search products"
            />
            <select
              value={surfaceFilter}
              onChange={(e) => setSurfaceFilter(e.target.value)}
              className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
              aria-label="Filter by surface"
            >
              <option value="all">All surfaces</option>
              {(["EVENTS", "SHOP", "COURSES", "SUBSCRIPTIONS", "DONATIONS"] as const).map((k) => (
                <option key={k} value={k}>{TRANSACTION_SURFACE_LABELS[k]}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
              aria-label="Filter by status"
            >
              <option value="all">All statuses</option>
              {Object.entries(PRODUCT_STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-ink/60">
              No products match your filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">Products</caption>
                <thead className="bg-ink/5 text-left text-xs uppercase tracking-wide text-ink/60">
                  <tr>
                    <th scope="col" className="px-4 py-2">Name</th>
                    <th scope="col" className="px-4 py-2">Surface</th>
                    <th scope="col" className="px-4 py-2">Price</th>
                    <th scope="col" className="px-4 py-2">Codes</th>
                    <th scope="col" className="px-4 py-2">Status</th>
                    <th scope="col" className="px-4 py-2">Last edited</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5">
                  {filtered.map((p: Product) => (
                    <tr
                      key={p.id}
                      onClick={() => { setSelectedId(p.id); setEditPrice(""); }}
                      className={
                        "cursor-pointer hover:bg-ink/5 " +
                        (selectedId === p.id ? "bg-sky/5" : "")
                      }
                    >
                      <td className="px-4 py-3 font-medium text-ink">{p.name}</td>
                      <td className="px-4 py-3 text-ink/70">
                        {TRANSACTION_SURFACE_LABELS[p.surface]}
                      </td>
                      <td className="px-4 py-3">{formatMoney(p.priceMinor, p.currency)}</td>
                      <td className={"px-4 py-3 " + (p.activeCodes > 0 ? "text-clay" : "text-ink/50")}>
                        {p.activeCodes}
                      </td>
                      <td className="px-4 py-3">
                        <span className={"rounded-full px-2 py-0.5 text-xs " + STATUS_TONE[p.status]}>
                          {PRODUCT_STATUS_LABELS[p.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-ink/60">
                        {new Date(p.lastEditedAt).toLocaleDateString("en-GB")} / {p.lastEditedBy}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div>
          {!selected ? (
            <div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/60">
              Select a product to view details.
            </div>
          ) : (
            <section className="rounded-lg border border-ink/10 bg-paper p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-ink/50">
                    {TRANSACTION_SURFACE_LABELS[selected.surface]}
                    {selected.category && ` / ${selected.category}`}
                  </div>
                  <h2 className="mt-1 text-base font-semibold text-ink">{selected.name}</h2>
                  <div className="mt-1 font-mono text-xs text-ink/50">{selected.slug}</div>
                </div>
                <span className={"rounded-full px-2 py-0.5 text-xs " + STATUS_TONE[selected.status]}>
                  {PRODUCT_STATUS_LABELS[selected.status]}
                </span>
              </div>

              <dl className="mt-4 grid gap-3 text-sm">
                <Row k="Price" v={formatMoney(selected.priceMinor, selected.currency)} />
                <Row k="Visibility" v={VISIBILITY_LABELS[selected.visibility]} />
                <Row k="Active codes" v={String(selected.activeCodes)} />
                <Row
                  k="Last edited"
                  v={`${new Date(selected.lastEditedAt).toLocaleDateString("en-GB")} by ${selected.lastEditedBy}`}
                />
              </dl>

              {selected.description && (
                <div className="mt-4 rounded-md border border-ink/10 bg-white p-3 text-sm">
                  {selected.description}
                </div>
              )}

              {canPrice && (
                <div className="mt-4 rounded-md border border-clay/40 bg-clay/5 p-3">
                  <label className="block text-xs uppercase tracking-wide text-ink/60">
                    Change price (minor units)
                  </label>
                  <input
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    placeholder={String(selected.priceMinor)}
                    inputMode="numeric"
                    className="mt-1 w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm font-mono"
                  />
                  <p className="mt-1 text-xs text-ink/60">
                    Price changes are audited. Existing orders keep their original price.
                  </p>
                </div>
              )}

              {canAct && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => { /* edit */ }}>Edit</Button>
                  <Button variant="outline" onClick={() => { /* duplicate */ }}>Duplicate</Button>
                  <Button variant="destructive" onClick={() => { /* archive */ }}>
                    Archive
                  </Button>
                </div>
              )}

              <div className="mt-4">
                <Button variant="ghost" onClick={() => { /* preview in shop */ }}>
                  Preview in shop
                </Button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  tone = "ink",
}: {
  label: string;
  value: string | number;
  tone?: "ink" | "clay" | "danger" | "success";
}) {
  const tones: Record<string, string> = {
    ink: "text-ink",
    clay: "text-clay",
    danger: "text-red-600",
    success: "text-green-700",
  };
  return (
    <div className="rounded-lg border border-ink/10 bg-paper p-4">
      <div className="text-xs uppercase tracking-wide text-ink/50">{label}</div>
      <div className={"mt-1 text-lg font-semibold " + tones[tone]}>{value}</div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-ink/60">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}