'use client';
"use client";

import { useState } from "react";
import Link from "next/link";
import { MemberLayout } from "@/components/layout/memberLayout";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { TextInput } from "@/components/input";

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function SecurityPage() {
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [mfaCode, setMfaCode] = useState("");

  // Mock sessions with device icons
  const sessions = [
    { 
      id: 1, 
      device: "Chrome on Windows", 
      icon: "💻",
      location: "Nairobi, Kenya", 
      lastActive: "2 hours ago", 
      current: true 
    },
    { 
      id: 2, 
      device: "Safari on iPhone", 
      icon: "📱",
      location: "Nairobi, Kenya", 
      lastActive: "2 days ago", 
      current: false 
    },
    { 
      id: 3, 
      device: "Firefox on Mac", 
      icon: "🖥️",
      location: "Kampala, Uganda", 
      lastActive: "1 week ago", 
      current: false 
    },
  ];

  // Password strength checker
  const getPasswordStrength = (password: string): { label: string; color: string; width: string } => {
    if (!password) return { label: "Empty", color: "bg-ink-100", width: "0%" };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    
    const map = [
      { label: "Very Weak", color: "bg-clay-500", width: "20%" },
      { label: "Weak", color: "bg-clay-400", width: "40%" },
      { label: "Fair", color: "bg-dawn-400", width: "60%" },
      { label: "Good", color: "bg-sky-400", width: "80%" },
      { label: "Strong", color: "bg-green-500", width: "100%" },
    ];
    return map[Math.min(Math.floor(score / 1.5), 4)] || map[0];
  };

  const passwordStrength = getPasswordStrength(passwordForm.newPassword);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setToast({ type: "error", message: "Passwords do not match." });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setToast({ type: "error", message: "Password must be at least 8 characters." });
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);

    setToast({ type: "success", message: "Password updated successfully." });
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const toggleMfa = () => {
    if (!mfaEnabled) {
      setShowMfaSetup(true);
    } else {
      setMfaEnabled(false);
      setToast({ type: "success", message: "MFA disabled successfully." });
    }
  };

  const handleMfaSetup = () => {
    if (mfaCode.length !== 6) {
      setToast({ type: "error", message: "Please enter a valid 6-digit code." });
      return;
    }
    setMfaEnabled(true);
    setShowMfaSetup(false);
    setMfaCode("");
    setToast({ type: "success", message: "MFA enabled successfully." });
  };

  const handleRevokeSession = (sessionId: number) => {
    setToast({ type: "success", message: `Session revoked successfully.` });
  };

  return (
    <MemberLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-900">
            Account Security
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Manage your password, multi-factor authentication, and active sessions.
          </p>
        </div>

        {/* Toast notification */}
        {toast && (
          <div
            className={`flex items-center gap-3 rounded-lg p-4 text-sm ${
              toast.type === "success"
                ? "border border-dawn-200 bg-dawn-50 text-dawn-700"
                : "border border-clay-200 bg-clay-50 text-clay-700"
            }`}
          >
            <span>{toast.type === "success" ? "✅" : "❌"}</span>
            {toast.message}
          </div>
        )}

        {/* Password change */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-sm font-semibold text-ink-900">Change Password</h2>
              <p className="text-xs text-ink-400">Use a strong, unique password for your account.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowPasswords(!showPasswords)}
              className="text-sm text-sky-600 hover:text-sky-700 font-medium"
            >
              {showPasswords ? "Hide" : "Show"} passwords
            </button>
          </div>

          <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-4">
            <TextInput
              id="currentPassword"
              type={showPasswords ? "text" : "password"}
              label="Current Password"
              required
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              placeholder="Enter your current password"
            />

            <div>
              <TextInput
                id="newPassword"
                type={showPasswords ? "text" : "password"}
                label="New Password"
                required
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="Enter a new password"
              />
              {passwordForm.newPassword && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-ink-400">Strength: <span className="font-medium" style={{ color: passwordStrength.color.includes("green") ? "#22c55e" : passwordStrength.color.includes("sky") ? "#4A6FA5" : passwordStrength.color.includes("dawn") ? "#E29B3D" : "#B8493D" }}>{passwordStrength.label}</span></span>
                    <span className="text-ink-400">{passwordForm.newPassword.length} characters</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: passwordStrength.width }}
                    />
                  </div>
                </div>
              )}
            </div>

            <TextInput
              id="confirmPassword"
              type={showPasswords ? "text" : "password"}
              label="Confirm New Password"
              required
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              placeholder="Confirm your new password"
            />

            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </Card>

        {/* Multi-Factor Authentication */}
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-sm font-semibold text-ink-900">
                Multi-Factor Authentication
              </h2>
              <p className="text-xs text-ink-400">
                Add an extra layer of security to your account.
              </p>
              {mfaEnabled && (
                <p className="mt-1 text-xs font-medium text-green-600">✅ Currently enabled</p>
              )}
            </div>
            <button
              type="button"
              onClick={toggleMfa}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                mfaEnabled ? "bg-dawn-400" : "bg-ink-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  mfaEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {showMfaSetup && (
            <div className="mt-4 rounded-md border border-ink-100 bg-ink-50 p-5">
              <h3 className="font-display text-sm font-semibold text-ink-900">Set up MFA</h3>
              <ol className="mt-3 list-decimal space-y-3 pl-5 text-sm text-ink-600">
                <li>Download an authenticator app like Google Authenticator or Authy.</li>
                <li>Scan the QR code below with your authenticator app.</li>
              </ol>

              <div className="my-4 flex justify-center">
                <div className="flex h-36 w-36 items-center justify-center rounded-lg border-2 border-dashed border-ink-200 bg-white text-xs text-ink-400">
                  📱 QR Code Placeholder
                </div>
              </div>

              <p className="text-sm text-ink-600">3. Enter the 6-digit code from your authenticator app:</p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="text"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full rounded-md border border-ink-200 px-4 py-2.5 text-center text-lg font-mono tracking-widest outline-none focus:border-sky-500 sm:w-36"
                  placeholder="000000"
                />
                <div className="flex gap-3">
                  <Button variant="secondary" size="md" onClick={() => setShowMfaSetup(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="md" onClick={handleMfaSetup}>
                    Verify & Enable
                  </Button>
                </div>
              </div>
              <p className="mt-2 text-xs text-ink-400">Backup codes will be provided after verification.</p>
            </div>
          )}
        </Card>

        {/* Active Sessions */}
        <Card>
          <h2 className="font-display text-sm font-semibold text-ink-900">Active Sessions</h2>
          <p className="mt-1 text-xs text-ink-400">Sessions signed in with your account.</p>

          <ul className="mt-4 divide-y divide-ink-50">
            {sessions.map((session) => (
              <li key={session.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{session.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-ink-900">
                      {session.device}
                      {session.current && (
                        <span className="ml-2 text-xs font-normal text-dawn-600">(Current)</span>
                      )}
                    </p>
                    <p className="text-xs text-ink-400">
                      {session.location} · Last active {session.lastActive}
                    </p>
                  </div>
                </div>
                {!session.current && (
                  <button
                    onClick={() => handleRevokeSession(session.id)}
                    className="text-xs font-medium text-clay-600 hover:text-clay-700 transition-colors"
                  >
                    Revoke
                  </button>
                )}
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="mt-4 text-sm font-medium text-clay-600 hover:text-clay-700 transition-colors"
            onClick={() => setToast({ type: "error", message: "All other sessions revoked." })}
          >
            Sign out all other sessions
          </button>
        </Card>
      </div>
    </MemberLayout>
  );
}
