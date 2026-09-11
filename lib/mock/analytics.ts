// lib/mock/analytics.ts
// PNL-17 Analytics and Reporting - mock infrastructure.
// Mirrors eventual API contracts. Every metric carries a denominator.

import { getCurrentUser } from "./current-user";

// ---------- Types ----------

export interface Kpi {
  key: string;
  label: string;
  value: number;
  unit: "count" | "percent" | "hours" | "days" | "money";
  currency?: string;
  denominator: string;
  trend: number;
}

export interface SeriesPoint {
  date: string;
  value: number;
}

export interface MonthlySummary {
  month: string;
  members: number;
  applications: number;
  retention: number;
  cohorts: number;
  revenueMinor: number;
}

export interface ChapterRow {
  code: string;
  name: string;
  region: string;
  type: "CAMPUS" | "PROFESSIONAL" | "REGIONAL";
  members: number;
  growth30d: number;
  retention: number;
  completion: number;
  attendance: number;
  engagementScore: number;
  insufficientData: boolean;
}

export interface CohortRow {
  id: string;
  name: string;
  course: string;
  pillar: "MARKETPLACE" | "GOVERNANCE" | "TECHNOLOGY";
  startsOn: string;
  capacity: number;
  enrolled: number;
  completed: number;
  completionRate: number;
}

export interface LessonDropOff {
  lessonId: string;
  lessonTitle: string;
  abandonments: number;
  enrolments: number;
}

export interface FeatureAdoption {
  feature: string;
  uniqueUsers: number;
  sessions: number;
  avgTimeOnFeature: number;
}

export interface SurfaceRevenue {
  surface: "EVENTS" | "SHOP" | "COURSES" | "SUBSCRIPTIONS" | "DONATIONS";
  revenueMinor: number;
  transactions: number;
}

export interface ReportDefinition {
  id: string;
  name: string;
  description: string;
  metrics: string[];
  dimensions: string[];
  filters: { field: string; op: string; value: string }[];
  from: string;
  to: string;
  format: "TABLE" | "BAR" | "LINE";
  ownerId: string;
  visibility: "PRIVATE" | "ADMIN_ONLY" | "SHARED";
  schedule?: {
    frequency: "DAILY" | "WEEKLY" | "MONTHLY";
    recipients: string[];
    format: "PDF" | "CSV";
  };
  lastRunAt?: string;
  lastRunStatus?: "SUCCESS" | "FAILED" | "RUNNING";
}

// ---------- Permission helpers ----------

export function canViewAnalytics(): boolean {
  const r = getCurrentUser().role;
  return ["SUPER_ADMIN", "ADMIN", "COMPLIANCE_LEAD", "FINANCE_OFFICER", "CHAPTER_LEADER"].includes(r);
}

export function canViewExecutive(): boolean {
  const r = getCurrentUser().role;
  return ["SUPER_ADMIN", "ADMIN", "COMPLIANCE_LEAD"].includes(r);
}

export function canViewMembership(): boolean {
  const r = getCurrentUser().role;
  return ["SUPER_ADMIN", "ADMIN", "COMPLIANCE_LEAD"].includes(r);
}

export function canViewLearning(): boolean {
  const r = getCurrentUser().role;
  return ["SUPER_ADMIN", "ADMIN", "COMPLIANCE_LEAD"].includes(r);
}

export function canViewEngagement(): boolean {
  const r = getCurrentUser().role;
  return ["SUPER_ADMIN", "ADMIN", "COMPLIANCE_LEAD"].includes(r);
}

export function canViewFinancial(): boolean {
  const r = getCurrentUser().role;
  return ["SUPER_ADMIN", "ADMIN", "FINANCE_OFFICER", "COMPLIANCE_LEAD"].includes(r);
}

export function canViewChapters(): boolean {
  const r = getCurrentUser().role;
  return ["SUPER_ADMIN", "ADMIN", "COMPLIANCE_LEAD", "CHAPTER_LEADER"].includes(r);
}

export function canGenerateImpactReport(): boolean {
  const r = getCurrentUser().role;
  return ["SUPER_ADMIN", "ADMIN", "COMPLIANCE_LEAD"].includes(r);
}

export function canBuildCustomReport(): boolean {
  const r = getCurrentUser().role;
  return ["SUPER_ADMIN", "ADMIN", "COMPLIANCE_LEAD", "FINANCE_OFFICER", "CHAPTER_LEADER"].includes(r);
}

// ---------- Seed data ----------

const now = new Date();
const days = (n: number) => new Date(now.getTime() + n * 86400000).toISOString();
const monthsBack = (n: number) => {
  const d = new Date(now);
  d.setMonth(d.getMonth() - n);
  return d.toISOString();
};

export const executiveKpis: Kpi[] = [
  { key: "members", label: "Members onboarded", value: 312, unit: "count", denominator: "of 1,000 target (Charter S1)", trend: 12 },
  { key: "chapters", label: "Active chapters", value: 18, unit: "count", denominator: "of 35 chapters targeted (Charter S2)", trend: 4 },
  { key: "cohorts", label: "Cohorts delivered", value: 3, unit: "count", denominator: "of 4 target (Charter S3)", trend: 0 },
  { key: "revenue", label: "Monthly revenue processed", value: 68400000, unit: "money", currency: "KES", denominator: "of KES 900,000 target (Charter S6)", trend: 8 },
  { key: "weekly_active", label: "Weekly active rate", value: 0.34, unit: "percent", denominator: "of 312 active members", trend: 3 },
];

export interface SuccessCriterion {
  id: string;
  label: string;
  actual: number;
  target: number;
  unit: "count" | "percent" | "money" | "bool";
  currency?: string;
  status: "ON_TRACK" | "AT_RISK" | "OFF_TRACK" | "MET";
}

export const successCriteria: SuccessCriterion[] = [
  { id: "S1", label: "Members onboarded", actual: 312, target: 1000, unit: "count", status: "AT_RISK" },
  { id: "S2", label: "Active chapters", actual: 18, target: 35, unit: "count", status: "AT_RISK" },
  { id: "S3", label: "Cohorts delivered", actual: 3, target: 4, unit: "count", status: "ON_TRACK" },
  { id: "S4", label: "Course completion rate", actual: 0.62, target: 0.65, unit: "percent", status: "ON_TRACK" },
  { id: "S5", label: "Weekly active rate", actual: 0.34, target: 0.40, unit: "percent", status: "AT_RISK" },
  { id: "S6", label: "Monthly revenue processed", actual: 68400000, target: 90000000, unit: "money", currency: "KES", status: "ON_TRACK" },
  { id: "S7", label: "Compliance gates passed", actual: 0, target: 4, unit: "count", status: "OFF_TRACK" },
  { id: "S8", label: "Critical security findings", actual: 0, target: 0, unit: "count", status: "MET" },
  { id: "S9", label: "Uptime (90-day rolling)", actual: 0.9993, target: 0.999, unit: "percent", status: "MET" },
  { id: "S10", label: "Impact metrics published with denominators", actual: 1, target: 1, unit: "bool", status: "MET" },
];

export const membershipGrowth: SeriesPoint[] = [
  { date: monthsBack(5), value: 142 },
  { date: monthsBack(4), value: 178 },
  { date: monthsBack(3), value: 214 },
  { date: monthsBack(2), value: 253 },
  { date: monthsBack(1), value: 284 },
  { date: monthsBack(0), value: 312 },
];

export const revenueByMonth: SeriesPoint[] = [
  { date: monthsBack(5), value: 21000000 },
  { date: monthsBack(4), value: 28500000 },
  { date: monthsBack(3), value: 38000000 },
  { date: monthsBack(2), value: 49000000 },
  { date: monthsBack(1), value: 58000000 },
  { date: monthsBack(0), value: 68400000 },
];

export const completionByWeek: SeriesPoint[] = [
  { date: days(-35), value: 0.42 },
  { date: days(-28), value: 0.48 },
  { date: days(-21), value: 0.52 },
  { date: days(-14), value: 0.56 },
  { date: days(-7), value: 0.60 },
  { date: days(0), value: 0.62 },
];

export const membershipKpis: Kpi[] = [
  { key: "onboarded", label: "Members onboarded", value: 312, unit: "count", denominator: "in the last 90 days", trend: 12 },
  { key: "conversion", label: "Application conversion rate", value: 0.41, unit: "percent", denominator: "of 761 applications received", trend: 2 },
  { key: "ttd", label: "Median time to decision", value: 38, unit: "hours", denominator: "median over 310 decisions", trend: -5 },
  { key: "retention30", label: "30-day retention", value: 0.94, unit: "percent", denominator: "of 287 members onboarded 30d ago", trend: 1 },
  { key: "attrition", label: "Attrition", value: 0.03, unit: "percent", denominator: "of 322 active members at period start", trend: 0 },
];

export const applicationFunnel = {
  submitted: 761,
  underReview: 312,
  interviewed: 268,
  approved: 312,
  rejected: 118,
  lapsed: 43,
};

export const membershipByTier: Record<string, number> = {
  STUDENT: 184,
  PROFESSIONAL: 96,
  ASSOCIATE: 32,
};

export const learningKpis: Kpi[] = [
  { key: "cohorts", label: "Cohorts delivered", value: 3, unit: "count", denominator: "target: at least 4 (Charter S3)", trend: 0 },
  { key: "enrolment", label: "Enrolment", value: 428, unit: "count", denominator: "across 3 active cohorts", trend: 14 },
  { key: "completion", label: "Completion rate", value: 0.62, unit: "percent", denominator: "of 291 enrolments that reached Phase 3", trend: 4 },
  { key: "ttc", label: "Median time to complete", value: 42, unit: "days", denominator: "median over 180 completed enrolments", trend: -3 },
  { key: "dropoff", label: "Drop-off rate", value: 0.21, unit: "percent", denominator: "of 428 enrolments that started Phase 1", trend: -2 },
];

export const completionByPillar: Record<string, number> = {
  MARKETPLACE: 0.58,
  GOVERNANCE: 0.64,
  TECHNOLOGY: 0.67,
};

export const phaseFunnel = {
  phase1Started: 428,
  phase1Complete: 341,
  phase2Complete: 262,
  phase3Complete: 209,
  certified: 180,
};

export const cohortSummary: CohortRow[] = [
  { id: "co-1", name: "Foundation 2026-Q1", course: "Kingdom Leadership Foundations", pillar: "GOVERNANCE", startsOn: monthsBack(5), capacity: 120, enrolled: 118, completed: 92, completionRate: 0.78 },
  { id: "co-2", name: "Marketplace Ethics 2026-Q2", course: "Marketplace Ethics", pillar: "MARKETPLACE", startsOn: monthsBack(3), capacity: 100, enrolled: 96, completed: 54, completionRate: 0.56 },
  { id: "co-3", name: "Technology with Integrity 2026-Q2", course: "Technology with Integrity", pillar: "TECHNOLOGY", startsOn: monthsBack(2), capacity: 120, enrolled: 114, completed: 61, completionRate: 0.54 },
  { id: "co-4", name: "Foundation 2026-Q3", course: "Kingdom Leadership Foundations", pillar: "GOVERNANCE", startsOn: days(-14), capacity: 120, enrolled: 100, completed: 0, completionRate: 0 },
];

export const lessonDropOff: LessonDropOff[] = [
  { lessonId: "l-1", lessonTitle: "Calling and Vocation", abandonments: 22, enrolments: 118 },
  { lessonId: "l-2", lessonTitle: "Ethics in the Marketplace", abandonments: 18, enrolments: 96 },
  { lessonId: "l-3", lessonTitle: "Data and Dignity", abandonments: 16, enrolments: 114 },
  { lessonId: "l-4", lessonTitle: "Governance and Accountability", abandonments: 14, enrolments: 118 },
  { lessonId: "l-5", lessonTitle: "Building Teams of Character", abandonments: 12, enrolments: 96 },
];

export const engagementKpis: Kpi[] = [
  { key: "dau", label: "DAU (7-day avg)", value: 89, unit: "count", denominator: "of 312 active members in period", trend: 6 },
  { key: "wau", label: "WAU", value: 106, unit: "count", denominator: "of 312 active members in period", trend: 3 },
  { key: "mau", label: "MAU", value: 184, unit: "count", denominator: "of 312 active members in period", trend: 5 },
  { key: "stickiness", label: "Stickiness (DAU/MAU)", value: 0.48, unit: "percent", denominator: "of 184 MAU", trend: 1 },
  { key: "depth", label: "Median session depth", value: 7, unit: "count", denominator: "over 1,824 sessions in range", trend: 0 },
];

export const featureAdoption: FeatureAdoption[] = [
  { feature: "Feed", uniqueUsers: 168, sessions: 512, avgTimeOnFeature: 4.2 },
  { feature: "Courses", uniqueUsers: 142, sessions: 380, avgTimeOnFeature: 18.4 },
  { feature: "Messages", uniqueUsers: 98, sessions: 402, avgTimeOnFeature: 6.1 },
  { feature: "Events", uniqueUsers: 121, sessions: 214, avgTimeOnFeature: 3.2 },
  { feature: "Directory", uniqueUsers: 89, sessions: 142, avgTimeOnFeature: 2.1 },
  { feature: "Mentorship", uniqueUsers: 54, sessions: 96, avgTimeOnFeature: 12.4 },
  { feature: "Groups", uniqueUsers: 112, sessions: 248, avgTimeOnFeature: 5.6 },
  { feature: "Announcements", uniqueUsers: 178, sessions: 262, avgTimeOnFeature: 1.4 },
  { feature: "Notifications", uniqueUsers: 201, sessions: 384, avgTimeOnFeature: 0.8 },
  { feature: "Search", uniqueUsers: 62, sessions: 108, avgTimeOnFeature: 1.2 },
];

export const financialKpis: Kpi[] = [
  { key: "revenue", label: "Revenue processed", value: 68400000, unit: "money", currency: "KES", denominator: "in the last 30 days", trend: 8 },
  { key: "transactions", label: "Transactions", value: 1247, unit: "count", denominator: "in the last 30 days", trend: 6 },
  { key: "avg", label: "Average transaction value", value: 54867, unit: "money", currency: "KES", denominator: "across 1,247 transactions", trend: 2 },
  { key: "recon", label: "Reconciliation rate", value: 0.998, unit: "percent", denominator: "of 30 daily reconciliation runs", trend: 0 },
  { key: "failed", label: "Failed or reversed rate", value: 0.014, unit: "percent", denominator: "of 1,247 transactions in range", trend: -1 },
];

export const revenueBySurface: SurfaceRevenue[] = [
  { surface: "EVENTS", revenueMinor: 18200000, transactions: 412 },
  { surface: "COURSES", revenueMinor: 24800000, transactions: 384 },
  { surface: "SUBSCRIPTIONS", revenueMinor: 13400000, transactions: 286 },
  { surface: "DONATIONS", revenueMinor: 8900000, transactions: 121 },
  { surface: "SHOP", revenueMinor: 3100000, transactions: 44 },
];

export const paymentMethodMix: Record<string, number> = {
  "M-Pesa": 0.78,
  Card: 0.14,
  Bank: 0.07,
  Other: 0.01,
};

export const settlementAging = {
  settled: 1189,
  pending: 48,
  overdue: 10,
};

export const financialMonthly: MonthlySummary[] = [
  { month: "2026-02", members: 178, applications: 224, retention: 0.92, cohorts: 0, revenueMinor: 21000000 },
  { month: "2026-03", members: 214, applications: 262, retention: 0.93, cohorts: 0, revenueMinor: 28500000 },
  { month: "2026-04", members: 253, applications: 298, retention: 0.94, cohorts: 1, revenueMinor: 38000000 },
  { month: "2026-05", members: 284, applications: 318, retention: 0.94, cohorts: 1, revenueMinor: 49000000 },
  { month: "2026-06", members: 312, applications: 342, retention: 0.94, cohorts: 1, revenueMinor: 58000000 },
];

export const chapterLeague: ChapterRow[] = [
  { code: "KU", name: "Kenyatta University", region: "Nairobi", type: "CAMPUS", members: 82, growth30d: 12, retention: 0.96, completion: 0.68, attendance: 0.74, engagementScore: 82, insufficientData: false },
  { code: "UON", name: "University of Nairobi", region: "Nairobi", type: "CAMPUS", members: 76, growth30d: 9, retention: 0.94, completion: 0.64, attendance: 0.71, engagementScore: 78, insufficientData: false },
  { code: "STRATH", name: "Strathmore University", region: "Nairobi", type: "CAMPUS", members: 58, growth30d: 8, retention: 0.95, completion: 0.66, attendance: 0.68, engagementScore: 76, insufficientData: false },
  { code: "NAIROBI_PROF", name: "Nairobi Professional", region: "Nairobi", type: "PROFESSIONAL", members: 42, growth30d: 4, retention: 0.91, completion: 0.52, attendance: 0.61, engagementScore: 64, insufficientData: false },
  { code: "KSM", name: "Kisumu Chapter", region: "Kisumu", type: "CAMPUS", members: 28, growth30d: 6, retention: 0.93, completion: 0.58, attendance: 0.66, engagementScore: 68, insufficientData: false },
  { code: "THIKA_PROF", name: "Thika Professional", region: "Thika", type: "PROFESSIONAL", members: 22, growth30d: 3, retention: 0.89, completion: 0.48, attendance: 0.55, engagementScore: 52, insufficientData: false },
  { code: "ELDORET", name: "Eldoret Chapter", region: "Eldoret", type: "CAMPUS", members: 4, growth30d: 1, retention: 0, completion: 0, attendance: 0, engagementScore: 0, insufficientData: true },
];

export const executiveMonthly: MonthlySummary[] = financialMonthly;

// ---------- Accessors with role scoping ----------

export function getExecutiveKpis(): Kpi[] {
  if (!canViewExecutive()) return [];
  return executiveKpis;
}

export function getSuccessCriteria(): SuccessCriterion[] {
  if (!canViewExecutive()) return [];
  return successCriteria;
}

export function getMembershipGrowth(): SeriesPoint[] {
  if (!canViewMembership()) return [];
  return membershipGrowth;
}

export function getRevenueByMonth(): SeriesPoint[] {
  if (!canViewFinancial()) return [];
  return revenueByMonth;
}

export function getCompletionByWeek(): SeriesPoint[] {
  if (!canViewLearning()) return [];
  return completionByWeek;
}

export function getMembershipKpis(): Kpi[] {
  if (!canViewMembership()) return [];
  return membershipKpis;
}

export function getApplicationFunnel() {
  if (!canViewMembership()) return null;
  return applicationFunnel;
}

export function getMembershipByTier(): Record<string, number> {
  if (!canViewMembership()) return {};
  return membershipByTier;
}

export function getLearningKpis(): Kpi[] {
  if (!canViewLearning()) return [];
  return learningKpis;
}

export function getCompletionByPillar(): Record<string, number> {
  if (!canViewLearning()) return {};
  return completionByPillar;
}

export function getPhaseFunnel() {
  if (!canViewLearning()) return null;
  return phaseFunnel;
}

export function getCohortSummary(): CohortRow[] {
  if (!canViewLearning()) return [];
  return cohortSummary;
}

export function getLessonDropOff(): LessonDropOff[] {
  if (!canViewLearning()) return [];
  return lessonDropOff;
}

export function getEngagementKpis(): Kpi[] {
  if (!canViewEngagement()) return [];
  return engagementKpis;
}

export function getFeatureAdoption(): FeatureAdoption[] {
  if (!canViewEngagement()) return [];
  return featureAdoption;
}

export function getFinancialKpis(): Kpi[] {
  if (!canViewFinancial()) return [];
  return financialKpis;
}

export function getRevenueBySurface(): SurfaceRevenue[] {
  if (!canViewFinancial()) return [];
  return revenueBySurface;
}

export function getPaymentMethodMix(): Record<string, number> {
  if (!canViewFinancial()) return {};
  return paymentMethodMix;
}

export function getSettlementAging() {
  if (!canViewFinancial()) return null;
  return settlementAging;
}

export function getFinancialMonthly(): MonthlySummary[] {
  if (!canViewFinancial()) return [];
  return financialMonthly;
}

export function getChapterLeague(): ChapterRow[] {
  if (!canViewChapters()) return [];
  const u = getCurrentUser();
  if (u.role === "CHAPTER_LEADER") {
    return chapterLeague.filter((c) => c.code === u.chapterCode);
  }
  return chapterLeague;
}

export function getExecutiveMonthly(): MonthlySummary[] {
  if (!canViewExecutive()) return [];
  return executiveMonthly;
}

// ---------- Formatting helpers ----------

export function formatMoney(minor: number, currency: string): string {
  const whole = Math.floor(minor / 100);
  const cents = String(minor % 100).padStart(2, "0");
  return `${currency} ${whole.toLocaleString("en-KE")}.${cents}`;
}

export function formatPercent(n: number): string {
  return `${Math.round(n * 100)}%`;
}