"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { MemberLayout } from "@/components/layout/memberLayout";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { TextInput } from "@/components/input";
import { Textarea } from "@/components/textarea";
import { Select } from "@/components/select";
import { AscentStepper } from "@/components/ascentStepper";
// Main page component with Suspense wrapper
export default function ApplyFormPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <FormContent />
    </Suspense>
  );
}
// Actual form component that uses useSearchParams
function FormContent() {
  const searchParams = useSearchParams();
  const tier = searchParams.get("tier") || "Eagle";
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    chapter: "",
    motivation: "",
  });
  const totalSteps = 5;
  // Define the step labels and provide dummy state (will be overridden)
  const stepLabels = ["Personal", "Chapter", "Interests", "Motivation", "Review"];
  const steps = stepLabels.map((label) => ({
    label,
    state: "upcoming" as const, // placeholder, overridden by currentIndex
  }));
  const handleNext = () => setStep((s) => Math.min(s + 1, totalSteps));
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted", { tier, ...formData });
  };
  return (
    <MemberLayout>
      <div className="max-w-2xl mx-auto">
        <AscentStepper steps={steps} currentIndex={step - 1} />
        <Card className="p-6 mt-6">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Info */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="font-display text-xl font-semibold text-ink-900">Personal Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <TextInput
                    id="firstName"
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                  <TextInput
                    id="lastName"
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <TextInput
                  id="email"
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <TextInput
                  id="phone"
                  label="Phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            )}
            {/* Step 2: Chapter */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="font-display text-xl font-semibold text-ink-900">Chapter Selection</h2>
                <Select
                  id="chapter"
                  label="Chapter"
                  name="chapter"
                  options={[
                    { value: "KU", label: "Kenyatta University" },
                    { value: "UON", label: "University of Nairobi" },
                    { value: "Strathmore", label: "Strathmore University" },
                    { value: "Nairobi Professional", label: "Nairobi Professional" },
                    { value: "Kisumu", label: "Kisumu Professional" },
                  ]}
                  value={formData.chapter}
                  onChange={handleChange}
                  required
                />
              </div>
            )}
            {/* Step 3: Interests */}
            {step === 3 && (
              <div className="space-y-4">
                <h2 className="font-display text-xl font-semibold text-ink-900">Pillar Interests</h2>
                <p className="text-sm text-ink-500">Select your primary pillar interests.</p>
                <div className="flex flex-wrap gap-3">
                  {["Marketplace", "Governance", "Technology"].map((pillar) => (
                    <label key={pillar} className="flex items-center gap-2">
                      <input type="checkbox" className="h-4 w-4 text-sky-600" />
                      <span className="text-sm">{pillar}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            {/* Step 4: Motivation */}
            {step === 4 && (
              <div className="space-y-4">
                <h2 className="font-display text-xl font-semibold text-ink-900">Motivation</h2>
                <Textarea
                  id="motivation"
                  label="Why do you want to join?"
                  name="motivation"
                  rows={4}
                  value={formData.motivation}
                  onChange={handleChange}
                  required
                  placeholder="Tell us about your journey and aspirations..."
                />
              </div>
            )}
            {/* Step 5: Review */}
            {step === 5 && (
              <div className="space-y-4">
                <h2 className="font-display text-xl font-semibold text-ink-900">Review Your Application</h2>
                <div className="bg-ink-50 p-4 rounded-lg space-y-2 text-sm">
                  <p><span className="font-medium">Name:</span> {formData.firstName} {formData.lastName}</p>
                  <p><span className="font-medium">Email:</span> {formData.email}</p>
                  <p><span className="font-medium">Phone:</span> {formData.phone || "Not provided"}</p>
                  <p><span className="font-medium">Chapter:</span> {formData.chapter || "Not selected"}</p>
                  <p><span className="font-medium">Tier:</span> {tier}</p>
                </div>
              </div>
            )}
            {/* Navigation */}
            <div className="flex justify-between mt-6 pt-4 border-t">
              <Button variant="secondary" onClick={handlePrev} disabled={step === 1} type="button">
                Previous
              </Button>
              {step === totalSteps ? (
                <Button variant="primary" type="submit">Submit Application</Button>
              ) : (
                <Button variant="primary" onClick={handleNext} type="button">Next</Button>
              )}
            </div>
          </form>
        </Card>
      </div>
    </MemberLayout>
  );
}
