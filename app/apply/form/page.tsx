"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/button";
import { Wordmark } from "@/components/wordmark";
import { AscentStepper, StepState } from "@/components/ascentStepper";
import { TextInput, SelectInput } from "@/components/input";
import { Card } from "@/components/card";

const STEPS = ["Personal", "Chapter", "Interests", "Motivation", "Review"];

const CHAPTER_OPTIONS = [
  { value: "", label: "Select a chapter" },
  { value: "Kenyatta University (KU)", label: "Kenyatta University (KU)" },
  { value: "University of Nairobi (UON)", label: "University of Nairobi (UON)" },
  { value: "Strathmore University (STRATH)", label: "Strathmore University (STRATH)" },
  { value: "assign_me", label: "Not sure yet — assign me one" },
];

const PILLARS = ["Marketplace", "Governance", "Technology"] as const;

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  chapter: string;
  pillars: string[];
  motivation: string;
  referral: string;
}

export default function ApplyFormPage() {
  const router = useRouter();
  const params = useSearchParams();
  const tier = params.get("tier") ?? "STUDENT";
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>({
    firstName: "", lastName: "", email: "", phone: "", dob: "",
    chapter: "", pillars: [], motivation: "", referral: "",
  });

  // Compute step states for the AscentStepper
  const stepStates: StepState[] = STEPS.map((_, i) =>
    i < step ? "complete" : i === step ? "current" : "upcoming"
  );
  const stepsWithState = STEPS.map((label, i) => ({ label, state: stepStates[i] }));

  const togglePillar = (p: string) => {
    setData((d) => ({
      ...d,
      pillars: d.pillars.includes(p) ? d.pillars.filter((x) => x !== p) : [...d.pillars, p],
    }));
  };

  const canAdvance = () => {
    if (step === 0) return data.firstName && data.lastName && data.email && data.dob;
    if (step === 1) return !!data.chapter;
    if (step === 2) return data.pillars.length > 0;
    if (step === 3) return data.motivation.trim().length >= 20;
    return true;
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else router.push("/apply/submitted");
  };
  const back = () => (step === 0 ? router.back() : setStep(step - 1));

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      {/* Header */}
      <header className="bg-ink-900 pt-6 pb-7">
        <div className="container-portal">
          <Link href="/">
            <Wordmark dark />
          </Link>
          <div className="mt-6">
            <AscentStepper steps={stepsWithState} />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container-portal flex-1 py-7 flex flex-col">
        <div className="flex-1">
          {step === 0 && (
            <div className="flex flex-col gap-4 animate-rise">
              <h2 className="font-display font-semibold text-[19px] text-ink-900">About you</h2>
              <span className="font-mono text-[12px] text-ink-400 -mt-3">Tier: {tier}</span>
              <div className="grid grid-cols-2 gap-3">
                <TextInput
                  id="firstName"
                  label="First name"
                  required
                  value={data.firstName}
                  onChange={(e) => setData({ ...data, firstName: e.target.value })}
                  placeholder="Grace"
                />
                <TextInput
                  id="lastName"
                  label="Last name"
                  required
                  value={data.lastName}
                  onChange={(e) => setData({ ...data, lastName: e.target.value })}
                  placeholder="Wanjiru"
                />
              </div>
              <TextInput
                id="email"
                type="email"
                label="Email address"
                required
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                placeholder="grace@example.com"
              />
              <TextInput
                id="phone"
                type="tel"
                label="Phone number"
                hint="Used for SMS updates on your application"
                value={data.phone}
                onChange={(e) => setData({ ...data, phone: e.target.value })}
                placeholder="+254 7XX XXX XXX"
              />
              <TextInput
                id="dob"
                type="date"
                label="Date of birth"
                required
                value={data.dob}
                onChange={(e) => setData({ ...data, dob: e.target.value })}
              />
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-4 animate-rise">
              <h2 className="font-display font-semibold text-[19px] text-ink-900">Your chapter</h2>
              <p className="text-ink-500 text-[14px] -mt-2">Pick your campus or professional chapter, if you know it.</p>
              <SelectInput
                id="chapter"
                label="Chapter preference"
                required
                options={CHAPTER_OPTIONS}
                value={data.chapter}
                onChange={(e) => setData({ ...data, chapter: e.target.value })}
                placeholder="Select a chapter"
              />
              <TextInput
                id="referral"
                label="How did you hear about us?"
                value={data.referral}
                onChange={(e) => setData({ ...data, referral: e.target.value })}
                placeholder="A friend, an event, social media..."
              />
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4 animate-rise">
              <h2 className="font-display font-semibold text-[19px] text-ink-900">Pillar interest</h2>
              <p className="text-ink-500 text-[14px] -mt-2">Select at least one — you can explore all three once admitted.</p>
              <div className="flex flex-col gap-2.5">
                {PILLARS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePillar(p)}
                    className={`flex items-center justify-between rounded-lg border px-4 py-3.5 text-left transition-colors
                      ${data.pillars.includes(p) ? "border-ink-900 bg-ink-50" : "border-ink-200 bg-white hover:border-ink-300"}`}
                  >
                    <span className="font-medium text-[15px] text-ink-900">{p}</span>
                    <div className={`h-5 w-5 rounded border-2 flex items-center justify-center
                      ${data.pillars.includes(p) ? "border-dawn-400 bg-dawn-400" : "border-ink-200"}`}>
                      {data.pillars.includes(p) && (
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                          <path d="M2.5 6.5L5 9L9.5 3.5" stroke="#141B2E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-4 animate-rise">
              <h2 className="font-display font-semibold text-[19px] text-ink-900">Your motivation</h2>
              <p className="text-ink-500 text-[14px] -mt-2">Tell the review panel why you want to join, in your own words.</p>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="motivation" className="font-body text-sm font-medium text-ink-800">
                  Motivation <span className="ml-0.5 text-clay-600">*</span>
                </label>
                <textarea
                  id="motivation"
                  rows={7}
                  className={`rounded-md border border-ink-200 px-3.5 py-3 text-[15px] text-ink-900 bg-white
                    placeholder:text-ink-300 transition-colors focus:outline-none focus:border-sky-500 resize-none`}
                  value={data.motivation}
                  onChange={(e) => setData({ ...data, motivation: e.target.value })}
                  placeholder="I want to join The Eagle Generation because..."
                />
                <p className="text-xs text-ink-400">{data.motivation.length} characters · minimum 20</p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col gap-4 animate-rise">
              <h2 className="font-display font-semibold text-[19px] text-ink-900">Review your application</h2>
              <p className="text-ink-500 text-[14px] -mt-2">Check everything before you submit — you can still go back to edit.</p>
              <Card className="divide-y divide-ink-100">
                <ReviewRow label="Name" value={`${data.firstName} ${data.lastName}`.trim() || "—"} onEdit={() => setStep(0)} />
                <ReviewRow label="Email" value={data.email || "—"} onEdit={() => setStep(0)} />
                <ReviewRow label="Tier" value={tier} onEdit={() => {}} />
                <ReviewRow label="Chapter" value={data.chapter || "—"} onEdit={() => setStep(1)} />
                <ReviewRow label="Pillars" value={data.pillars.join(", ") || "—"} onEdit={() => setStep(2)} />
                <ReviewRow label="Motivation" value={data.motivation ? `${data.motivation.slice(0, 60)}…` : "—"} onEdit={() => setStep(3)} />
              </Card>
              <p className="text-[12.5px] text-ink-400 leading-relaxed">
                By submitting, you agree that your data will be reviewed by the admissions
                team for the purpose of vetting your membership application only.
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-8">
          <Button variant="secondary" onClick={back} className="flex-1">Back</Button>
          <Button variant="primary" onClick={next} disabled={!canAdvance()} className="flex-[2]">
            {step === STEPS.length - 1 ? "Submit application" : "Continue"}
          </Button>
        </div>
      </main>
    </div>
  );
}

function ReviewRow({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div>
        <p className="text-[12px] text-ink-400">{label}</p>
        <p className="text-[14px] text-ink-900 mt-0.5">{value}</p>
      </div>
      <button onClick={onEdit} className="text-[13px] font-medium text-sky-600 hover:text-sky-700">
        Edit
      </button>
    </div>
  );
}