"use client";

import { useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { canBulkImport } from "@/lib/mock/applications";
import {
  ArrowLeft,
  ShieldAlert,
  Upload,
  Download,
  FileSpreadsheet,
  X,
} from "lucide-react";

type RowStatus = "ok" | "invalid" | "duplicate";

interface ParsedRow {
  index: number;
  firstName: string;
  lastName: string;
  email: string;
  chapterCode: string;
  tier: string;
  status: RowStatus;
  reason?: string;
}

const REQUIRED_HEADERS = [
  "first_name",
  "last_name",
  "email",
  "date_of_birth",
  "tier",
  "chapter_code",
  "pillar_interest",
  "motivation",
];

const KNOWN_CHAPTERS = ["KU", "UON", "STRATH", "NRB-PRO", "KSM"];
const KNOWN_TIERS = ["STUDENT", "PROFESSIONAL", "ASSOCIATE"];

const MAX_ROWS = 10_000;
const PREVIEW_LIMIT = 200;

export default function BulkImportPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [rows, setRows] = useState<ParsedRow[] | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [skipEmail, setSkipEmail] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  if (!canBulkImport()) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <Card className="p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-clay-50">
            <ShieldAlert className="h-6 w-6 text-clay-600" aria-hidden="true" />
          </div>
          <h1 className="mt-4 font-display text-xl text-ink-900">Permission denied</h1>
          <p className="mt-2 text-sm text-ink-500">
            You do not have permission to bulk import applicants.
          </p>
          <div className="mt-6">
            <Link href="/admin/applications">
              <Button variant="primary">Back to applications</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const handleDownloadTemplate = () => {
    const header = REQUIRED_HEADERS.join(",");
    const example = [
      "Grace",
      "Mwangi",
      "grace@example.com",
      "2002-04-15",
      "STUDENT",
      "KU",
      "MARKETPLACE,TECHNOLOGY",
      "I want to grow as a Kingdom leader.",
    ].join(",");
    const csv = `${header}\n${example}\n`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "applicant-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseFile = useCallback(async (file: File) => {
    setParsing(true);
    setParseError(null);
    setRows(null);
    setFileName(file.name);

    try {
      const text = await file.text();
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);

      if (lines.length < 2) {
        throw new Error("The file appears to be empty.");
      }

      const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const missing = REQUIRED_HEADERS.filter((h) => !header.includes(h));
      if (missing.length) {
        throw new Error(`Missing required column${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}`);
      }

      const bodyLines = lines.slice(1);
      if (bodyLines.length > MAX_ROWS) {
        throw new Error(`File contains ${bodyLines.length} rows. Maximum is ${MAX_ROWS}.`);
      }

      const idx = (name: string) => header.indexOf(name);
      const seenEmails = new Set<string>();
      const parsed: ParsedRow[] = bodyLines.map((line, i) => {
        const cells = line.split(",").map((c) => c.trim());
        const firstName = cells[idx("first_name")] ?? "";
        const lastName = cells[idx("last_name")] ?? "";
        const email = (cells[idx("email")] ?? "").toLowerCase();
        const tier = (cells[idx("tier")] ?? "").toUpperCase();
        const chapterCode = (cells[idx("chapter_code")] ?? "").toUpperCase();

        let status: RowStatus = "ok";
        let reason: string | undefined;

        if (!firstName || !lastName) {
          status = "invalid";
          reason = "Missing name";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          status = "invalid";
          reason = "Invalid email";
        } else if (seenEmails.has(email)) {
          status = "duplicate";
          reason = "Duplicate in file";
        } else if (!KNOWN_TIERS.includes(tier)) {
          status = "invalid";
          reason = `Unknown tier: ${tier || "—"}`;
        } else if (!KNOWN_CHAPTERS.includes(chapterCode)) {
          status = "invalid";
          reason = `Chapter not found: ${chapterCode || "—"}`;
        }

        if (status === "ok") seenEmails.add(email);

        return {
          index: i + 1,
          firstName,
          lastName,
          email,
          chapterCode,
          tier,
          status,
          reason,
        };
      });

      setRows(parsed);
    } catch (err) {
      setParseError(
        err instanceof Error
          ? err.message
          : "The file could not be read. Ensure it is a valid CSV."
      );
    } finally {
      setParsing(false);
    }
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) parseFile(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
  };

  const handleImport = async () => {
    setConfirmOpen(false);
    setImporting(true);
    await new Promise((r) => setTimeout(r, 900));
    // Mock: POST /api/v1/admin/applications/import
    setImporting(false);
    router.push("/admin/applications");
  };

  const counts = rows
    ? {
        total: rows.length,
        ok: rows.filter((r) => r.status === "ok").length,
        invalid: rows.filter((r) => r.status === "invalid").length,
        duplicate: rows.filter((r) => r.status === "duplicate").length,
      }
    : null;

  const tooManyInvalid = counts ? counts.invalid / counts.total > 0.5 : false;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/applications"
          className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to applications
        </Link>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink-900">
          Bulk import applicants
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Upload a CSV of applicants. Max {MAX_ROWS.toLocaleString()} rows.
        </p>
      </div>

      {/* Upload zone */}
      {!rows && !parsing && !parseError && (
        <Card className="p-6">
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload CSV file"
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={`cursor-pointer rounded-lg border-2 border-dashed p-10 text-center transition-colors ${
              dragOver
                ? "border-sky-500 bg-sky-50"
                : "border-ink-200 hover:border-ink-300 hover:bg-ink-50/50"
            }`}
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sky-50">
              <Upload className="h-6 w-6 text-sky-600" aria-hidden="true" />
            </div>
            <p className="mt-4 text-sm font-medium text-ink-900">
              Drag &amp; drop CSV here
            </p>
            <p className="mt-1 text-sm text-ink-500">or click to browse</p>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={onFileChange}
              className="sr-only"
              aria-hidden="true"
            />
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-2 text-sm text-sky-600 hover:underline"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download CSV template
            </button>
          </div>
        </Card>
      )}

      {/* Parsing */}
      {parsing && (
        <Card className="p-10 text-center">
          <div className="mx-auto h-1 w-48 overflow-hidden rounded-full bg-ink-100">
            <div className="h-full w-1/2 animate-pulse bg-sky-500" />
          </div>
          <p className="mt-4 text-sm text-ink-500">Validating rows…</p>
        </Card>
      )}

      {/* Parse error */}
      {parseError && (
        <Card className="p-6">
          <div role="alert" className="flex items-start gap-3 rounded-md border border-clay-200 bg-clay-50 p-4">
            <X className="h-5 w-5 shrink-0 text-clay-700" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-clay-800">Import failed</p>
              <p className="mt-1 text-sm text-clay-700">{parseError}</p>
            </div>
          </div>
          <div className="mt-4">
            <Button variant="outline" onClick={() => setParseError(null)}>
              Try again
            </Button>
          </div>
        </Card>
      )}

      {/* Preview */}
      {rows && counts && (
        <>
          <Card className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm">
                <FileSpreadsheet className="h-4 w-4 text-ink-500" aria-hidden="true" />
                <span className="font-medium text-ink-900">{fileName}</span>
                <button
                  type="button"
                  onClick={() => {
                    setRows(null);
                    setFileName("");
                    if (inputRef.current) inputRef.current.value = "";
                  }}
                  className="text-ink-400 hover:text-ink-600"
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div role="alert" className="mt-4 flex flex-wrap gap-4 text-sm">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden="true" />
                <strong>{counts.ok.toLocaleString()}</strong>
                <span className="text-ink-500">valid</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-clay-500" aria-hidden="true" />
                <strong>{counts.invalid.toLocaleString()}</strong>
                <span className="text-ink-500">invalid</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-dawn-500" aria-hidden="true" />
                <strong>{counts.duplicate.toLocaleString()}</strong>
                <span className="text-ink-500">duplicate</span>
              </span>
            </div>

            {tooManyInvalid && (
              <div className="mt-4 rounded-md border border-clay-200 bg-clay-50 p-3 text-sm text-clay-800">
                More than 50% of rows are invalid. Fix the file before importing.
              </div>
            )}
          </Card>

          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">Preview of parsed CSV rows</caption>
                <thead className="border-b border-ink-100 bg-ink-50">
                  <tr>
                    <th className="w-16 px-4 py-3 text-left font-medium text-ink-500">Row</th>
                    <th className="px-4 py-3 text-left font-medium text-ink-500">Name</th>
                    <th className="hidden px-4 py-3 text-left font-medium text-ink-500 sm:table-cell">Email</th>
                    <th className="hidden px-4 py-3 text-left font-medium text-ink-500 md:table-cell">Chapter</th>
                    <th className="hidden px-4 py-3 text-left font-medium text-ink-500 md:table-cell">Tier</th>
                    <th className="px-4 py-3 text-left font-medium text-ink-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-50">
                  {rows.slice(0, PREVIEW_LIMIT).map((r) => (
                    <tr key={r.index} className="hover:bg-ink-50/50">
                      <td className="px-4 py-2 font-mono text-xs text-ink-400">{r.index}</td>
                      <td className="px-4 py-2 text-ink-900">
                        {r.firstName} {r.lastName}
                      </td>
                      <td className="hidden px-4 py-2 text-ink-600 sm:table-cell">{r.email}</td>
                      <td className="hidden px-4 py-2 font-mono text-xs text-ink-600 md:table-cell">{r.chapterCode}</td>
                      <td className="hidden px-4 py-2 text-ink-600 md:table-cell">{r.tier}</td>
                      <td className="px-4 py-2">
                        {r.status === "ok" && (
                          <span className="inline-flex items-center gap-1.5 text-xs text-green-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" aria-hidden="true" />
                            ok
                          </span>
                        )}
                        {r.status !== "ok" && (
                          <span className="inline-flex items-center gap-1.5 text-xs text-clay-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-clay-500" aria-hidden="true" />
                            {r.status} — {r.reason}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {rows.length > PREVIEW_LIMIT && (
              <div className="border-t border-ink-100 px-4 py-3 text-center text-xs text-ink-500">
                Showing first {PREVIEW_LIMIT} of {rows.length.toLocaleString()} rows.
              </div>
            )}
          </Card>

          <Card className="p-4">
            <label className="flex items-center gap-2 text-sm text-ink-700">
              <input
                type="checkbox"
                checked={skipEmail}
                onChange={(e) => setSkipEmail(e.target.checked)}
                className="h-4 w-4 rounded border-ink-200 text-sky-600 focus:ring-sky-500"
              />
              Skip acknowledgement email
            </label>
          </Card>

          <div className="flex flex-col gap-3 sm:flex-row-reverse">
            <Button
              variant="primary"
              disabled={counts.ok === 0 || tooManyInvalid || importing}
              onClick={() => setConfirmOpen(true)}
            >
              {importing
                ? "Importing…"
                : `Import ${counts.ok.toLocaleString()} valid row${counts.ok === 1 ? "" : "s"}`}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/admin/applications")}
              disabled={importing}
            >
              Cancel
            </Button>
          </div>
        </>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Import ${counts?.ok ?? 0} applicants?`}
        description={`Each will be created as a SUBMITTED application.${skipEmail ? " No acknowledgement email will be sent." : ""}`}
        confirmLabel="Import"
        onConfirm={handleImport}
      />
    </div>
  );
}