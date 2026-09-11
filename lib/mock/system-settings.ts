// lib/mock/system-settings.ts
// PNL-19 System Settings - mock infrastructure.

import { getCurrentUser } from "./current-user";

export type FeatureFlagKey =
  | "FEATURE_DIRECT_MESSAGING"
  | "FEATURE_COMMERCE"
  | "FEATURE_SAVINGS_CIRCLES"
  | "FEATURE_VIRTUAL_ASSETS"
  | "FEATURE_KYC";

export interface FeatureFlag {
  key: FeatureFlagKey;
  name: string;
  description: string;
  enabled: boolean;
  requiresGate: string;
  gateApproved: boolean;
  controlledBy: "Compliance Lead" | "SUPER_ADMIN";
  lastChangedAt?: string;
  lastChangedBy?: string;
}

export interface IntegrationStatus {
  id: string;
  name: string;
  category: string;
  status: "HEALTHY" | "DEGRADED" | "DOWN" | "NOT_CONFIGURED";
  environment: string;
  lastCheckedAt: string;
  notes: string;
}

export interface NotificationTemplate {
  id: string;
  key: string;
  name: string;
  channel: "EMAIL" | "SMS" | "PUSH";
  subject?: string;
  body: string;
  version: number;
  active: boolean;
  updatedAt: string;
}

export interface LocaleEntry {
  id: string;
  locale: string;
  language: string;
  translatedKeys: number;
  totalKeys: number;
  status: "COMPLETE" | "IN_PROGRESS" | "NOT_STARTED";
}

export interface BackgroundJob {
  id: string;
  name: string;
  schedule: string;
  lastRunAt?: string;
  lastRunStatus?: "SUCCESS" | "FAILED" | "RUNNING";
  nextRunAt: string;
  failureCount: number;
}

export interface SystemHealthComponent {
  component: string;
  status: "HEALTHY" | "DEGRADED" | "DOWN";
  detail: string;
  metric?: string;
}

export interface GeneralConfig {
  platformName: string;
  supportEmail: string;
  defaultCurrency: string;
  defaultTimezone: string;
  newMemberApplicationOpen: boolean;
}

export interface RoleEntry {
  code: string;
  name: string;
  description: string;
}

export function canViewSystemSettings(): boolean {
  const r = getCurrentUser().role;
  return ["SUPER_ADMIN", "COMPLIANCE_LEAD"].includes(r);
}

export function canEditSystemSettings(): boolean {
  return getCurrentUser().role === "SUPER_ADMIN";
}

export function canManageFeatureFlags(): boolean {
  const r = getCurrentUser().role;
  return ["SUPER_ADMIN", "COMPLIANCE_LEAD"].includes(r);
}

const now = new Date();
const days = (n: number) => new Date(now.getTime() + n * 86400000).toISOString();
const hours = (n: number) => new Date(now.getTime() + n * 3600000).toISOString();

export const seedGeneralConfig: GeneralConfig = {
  platformName: "Eagle Generation Portal",
  supportEmail: "support@theeaglgeneration.org",
  defaultCurrency: "KES",
  defaultTimezone: "Africa/Nairobi",
  newMemberApplicationOpen: true,
};

export const seedFeatureFlags: FeatureFlag[] = [
  { key: "FEATURE_DIRECT_MESSAGING", name: "Direct messaging", description: "1:1 and small-group messaging between members.", enabled: false, requiresGate: "G-2", gateApproved: false, controlledBy: "Compliance Lead" },
  { key: "FEATURE_COMMERCE", name: "Commerce", description: "Events, shop, course purchase, subscriptions, donations.", enabled: false, requiresGate: "G-4", gateApproved: false, controlledBy: "Compliance Lead" },
  { key: "FEATURE_SAVINGS_CIRCLES", name: "Savings circles", description: "Circle ledger, contributions, payouts.", enabled: false, requiresGate: "G-5", gateApproved: false, controlledBy: "Compliance Lead" },
  { key: "FEATURE_VIRTUAL_ASSETS", name: "Virtual assets", description: "Custodial wallet, OTC desk, remittance.", enabled: false, requiresGate: "G-6", gateApproved: false, controlledBy: "Compliance Lead" },
  { key: "FEATURE_KYC", name: "KYC verification", description: "Identity document capture, liveness, address.", enabled: false, requiresGate: "G-4", gateApproved: false, controlledBy: "Compliance Lead" },
];

export const seedIntegrations: IntegrationStatus[] = [
  { id: "i-1", name: "Supabase Auth", category: "Identity", status: "HEALTHY", environment: "production", lastCheckedAt: hours(-1), notes: "Token refresh normal." },
  { id: "i-2", name: "Postmark", category: "Email", status: "HEALTHY", environment: "production", lastCheckedAt: hours(-1), notes: "Delivery rate 99.4%." },
  { id: "i-3", name: "Africa Talking", category: "SMS", status: "DEGRADED", environment: "production", lastCheckedAt: hours(-2), notes: "Elevated latency on the Nairobi cluster." },
  { id: "i-4", name: "Web Push", category: "Push", status: "HEALTHY", environment: "production", lastCheckedAt: hours(-1), notes: "" },
  { id: "i-5", name: "Daily.co", category: "Video meetings", status: "HEALTHY", environment: "production", lastCheckedAt: hours(-1), notes: "" },
  { id: "i-6", name: "Mux", category: "Video hosting", status: "HEALTHY", environment: "production", lastCheckedAt: hours(-1), notes: "" },
  { id: "i-7", name: "Licensed PSP", category: "Payments", status: "NOT_CONFIGURED", environment: "production", lastCheckedAt: hours(-1), notes: "Awaiting G-4 certification." },
  { id: "i-8", name: "KYC provider", category: "Identity verification", status: "NOT_CONFIGURED", environment: "production", lastCheckedAt: hours(-1), notes: "Selected at R3 gate." },
  { id: "i-9", name: "Screening provider", category: "AML", status: "NOT_CONFIGURED", environment: "production", lastCheckedAt: hours(-1), notes: "Selected at R4 gate." },
  { id: "i-10", name: "Sentry", category: "Monitoring", status: "HEALTHY", environment: "production", lastCheckedAt: hours(-1), notes: "" },
  { id: "i-11", name: "PostHog", category: "Analytics", status: "HEALTHY", environment: "production", lastCheckedAt: hours(-1), notes: "EU region." },
];

export const seedTemplates: NotificationTemplate[] = [
  { id: "t-1", key: "application.received", name: "Application received", channel: "EMAIL", subject: "We have received your application", body: "Dear member, thank you. Your reference is available.", version: 3, active: true, updatedAt: days(-20) },
  { id: "t-2", key: "application.approved", name: "Application approved", channel: "EMAIL", subject: "Welcome to the Eagle Generation", body: "Your member number is available.", version: 2, active: true, updatedAt: days(-30) },
  { id: "t-3", key: "application.approved.sms", name: "Approval SMS", channel: "SMS", body: "Welcome to TEG. Your member number is available.", version: 1, active: true, updatedAt: days(-30) },
  { id: "t-4", key: "order.confirmed", name: "Order confirmation", channel: "EMAIL", subject: "Order confirmed", body: "Thank you for your order.", version: 1, active: true, updatedAt: days(-15) },
  { id: "t-5", key: "kyc.approved", name: "KYC approved push", channel: "PUSH", body: "Your verification is complete.", version: 1, active: true, updatedAt: days(-10) },
];

export const seedLocales: LocaleEntry[] = [
  { id: "l-1", locale: "en", language: "English", translatedKeys: 1842, totalKeys: 1842, status: "COMPLETE" },
  { id: "l-2", locale: "fr", language: "French", translatedKeys: 412, totalKeys: 1842, status: "IN_PROGRESS" },
  { id: "l-3", locale: "sw", language: "Kiswahili", translatedKeys: 0, totalKeys: 1842, status: "NOT_STARTED" },
];

export const seedJobs: BackgroundJob[] = [
  { id: "j-1", name: "Daily reconciliation", schedule: "0 2 * * *", lastRunAt: hours(-12), lastRunStatus: "SUCCESS", nextRunAt: hours(12), failureCount: 0 },
  { id: "j-2", name: "Retention purge", schedule: "0 3 * * *", lastRunAt: hours(-11), lastRunStatus: "SUCCESS", nextRunAt: hours(13), failureCount: 0 },
  { id: "j-3", name: "KYC verification polling", schedule: "*/15 * * * *", lastRunAt: hours(-1), lastRunStatus: "SUCCESS", nextRunAt: hours(1), failureCount: 0 },
  { id: "j-4", name: "Notification delivery", schedule: "*/5 * * * *", lastRunAt: hours(-1), lastRunStatus: "FAILED", nextRunAt: hours(1), failureCount: 3 },
  { id: "j-5", name: "AML screening", schedule: "0 */6 * * *", lastRunAt: hours(-4), lastRunStatus: "SUCCESS", nextRunAt: hours(2), failureCount: 0 },
  { id: "j-6", name: "Backup verification", schedule: "0 4 * * 0", lastRunAt: days(-7), lastRunStatus: "SUCCESS", nextRunAt: days(0), failureCount: 0 },
];

export const seedHealth: SystemHealthComponent[] = [
  { component: "API", status: "HEALTHY", detail: "Responding normally", metric: "p95 180ms" },
  { component: "Database", status: "HEALTHY", detail: "Replication in sync", metric: "lag 42ms" },
  { component: "Redis cache", status: "HEALTHY", detail: "Hit rate normal", metric: "97.2%" },
  { component: "Queue", status: "DEGRADED", detail: "Notification queue backing up", metric: "depth 412" },
  { component: "Object storage", status: "HEALTHY", detail: "Reachable", metric: "" },
  { component: "Payments provider", status: "DOWN", detail: "Not configured - awaiting G-4", metric: "" },
  { component: "AML screening", status: "DOWN", detail: "Not configured - selected at R4 gate", metric: "" },
  { component: "Kill switch", status: "HEALTHY", detail: "Available", metric: "" },
];

export const seedEnvironment = {
  name: "production",
  region: "eu-west-1",
  version: "1.1.0",
  commit: "75506bb",
  deployedAt: hours(-6),
};

export const seedRoles: RoleEntry[] = [
  { code: "GUEST", name: "Guest", description: "Unauthenticated visitor" },
  { code: "MEMBER", name: "Member", description: "Vetted, admitted member" },
  { code: "MENTOR", name: "Mentor", description: "Instructor and/or mentor" },
  { code: "CIRCLE_LEADER", name: "Circle Leader", description: "Manages a savings circle" },
  { code: "CHAPTER_LEADER", name: "Chapter Leader", description: "Manages a campus or professional chapter" },
  { code: "FINANCE_OFFICER", name: "Finance Officer", description: "Reconciliation, refunds, reporting" },
  { code: "ADMIN", name: "Admin", description: "Membership, content, moderation" },
  { code: "SUPER_ADMIN", name: "Super Admin", description: "Configuration, security, role management" },
];

export function getGeneralConfig(): GeneralConfig | null {
  if (!canViewSystemSettings()) return null;
  return seedGeneralConfig;
}

export function getFeatureFlags(): FeatureFlag[] {
  if (!canViewSystemSettings()) return [];
  return seedFeatureFlags;
}

export function getIntegrations(): IntegrationStatus[] {
  if (!canViewSystemSettings()) return [];
  return seedIntegrations;
}

export function getTemplates(): NotificationTemplate[] {
  if (!canViewSystemSettings()) return [];
  return seedTemplates;
}

export function getLocales(): LocaleEntry[] {
  if (!canViewSystemSettings()) return [];
  return seedLocales;
}

export function getJobs(): BackgroundJob[] {
  if (!canViewSystemSettings()) return [];
  return seedJobs;
}

export function getHealth(): SystemHealthComponent[] {
  if (!canViewSystemSettings()) return [];
  return seedHealth;
}

export function getEnvironment() {
  if (!canViewSystemSettings()) return null;
  return seedEnvironment;
}

export function getRoles(): RoleEntry[] {
  if (!canViewSystemSettings()) return [];
  return seedRoles;
}

export const INTEGRATION_STATUS_TONE: Record<IntegrationStatus["status"], string> = {
  HEALTHY: "text-green-700",
  DEGRADED: "text-clay",
  DOWN: "text-red-600",
  NOT_CONFIGURED: "text-ink/50",
};

export const JOB_STATUS_TONE: Record<NonNullable<BackgroundJob["lastRunStatus"]>, string> = {
  SUCCESS: "text-green-700",
  FAILED: "text-red-600",
  RUNNING: "text-sky",
};

export const HEALTH_STATUS_TONE: Record<SystemHealthComponent["status"], string> = {
  HEALTHY: "text-green-700",
  DEGRADED: "text-clay",
  DOWN: "text-red-600",
};