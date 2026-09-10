// components/mock/data.ts

// ============================================================
// 1. INTERFACES
// ============================================================

export interface Member {
  id: string;
  memberNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'pending';
  tier: 'Eagle' | 'Rising' | 'Nestling';
  chapter: string;
  pillarInterest: ('Marketplace' | 'Governance' | 'Technology')[];
  bio: string;
  avatar?: string;
  joinedAt: string;
}

export interface Chapter {
  code: string;
  name: string;
  type: 'CAMPUS' | 'PROFESSIONAL';
  memberCount: number;
  location: string;
  leader?: string;
  description?: string;
}

export interface Application {
  reference: string;
  name: string;
  email: string;
  tier: string;
  status: 'pending' | 'approved' | 'rejected';
  motivation: string;
  chapter: string;
  interviewDate?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  createdAt: string;
  author: string;
  readBy?: string[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  entity: string;
  timestamp: string;
  details?: string;
}

export interface ChapterActivity {
  id: string;
  chapterCode: string;
  type: 'member_joined' | 'announcement' | 'event' | 'leader_post';
  title: string;
  description?: string;
  actor: string;
  timestamp: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  location: string;
  type: 'summit' | 'workshop' | 'networking' | 'training' | 'other';
  capacity: number;
  registered: number;
  price: number;
  image?: string;
  status: 'upcoming' | 'past' | 'cancelled';
  registrationDeadline?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'merchandise' | 'resources' | 'learning' | 'other';
  image?: string;
  inStock: boolean;
  sku?: string;
  createdAt: string;
}

export interface FAQItem {
  id: string;
  category: 'Membership' | 'Learning' | 'Payments' | 'Technical' | 'General';
  question: string;
  answer: string;
}

export interface SupportPack {
  id: string;
  name: string;
  amount: number;
  description: string;
  color: string;
  icon: string;
}

export interface BlockedUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  blockedAt: string;
  reason?: string;
}

// ============================================================
// R2 – Community, Mentorship, Messaging
// ============================================================

export interface Post {
  id: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    chapterId?: string;
    chapterName?: string;
  };
  content: string;
  pillar: 'MARKETPLACE' | 'GOVERNANCE' | 'TECHNOLOGY';
  createdAt: string;
  likes: number;
  comments: number;
  likedByUser: boolean;
  isPinned?: boolean;
  images?: string[];
}

export interface Comment {
  id: string;
  postId: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
  parentId?: string;
  likes: number;
  likedByUser: boolean;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  type: 'STUDY' | 'CHAPTER' | 'MENTORSHIP' | 'INTEREST';
  visibility: 'OPEN' | 'CLOSED' | 'SECRET';
  chapterId?: string;
  createdBy: string;
  createdAt: string;
  memberCount: number;
  coverImage?: string;
  tags: string[];
}

export interface GroupMember {
  userId: string;
  groupId: string;
  role: 'MEMBER' | 'MODERATOR' | 'ADMIN';
  joinedAt: string;
}

export interface GroupPost {
  id: string;
  groupId: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
  likes: number;
  comments: number;
  likedByUser: boolean;
  isPinned?: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  updatedAt: string;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  sentAt: string;
  readAt?: string;
  attachments?: string[];
  type: 'text' | 'image' | 'file';
}

export interface MentorProfile {
  userId: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  focusCategories: string[];
  expertise: string[];
  availability: string;
  bio: string;
  isActive: boolean;
  capacity: number;
  currentMentees: number;
  rating?: number;
  reviewCount?: number;
}

export interface MentorshipRequest {
  id: string;
  mentorId: string;
  menteeId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';
  focusArea: string;
  message: string;
  requestedAt: string;
  respondedAt?: string;
}

export interface MentorshipSession {
  id: string;
  requestId: string;
  mentorId: string;
  menteeId: string;
  scheduledAt: string;
  durationMinutes: number;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'MISSED';
  notes?: string;
  feedback?: string;
  meetingLink?: string;
}

export interface Meeting {
  id: string;
  title: string;
  description: string;
  scheduledFor: string;
  durationMinutes: number;
  meetingLink: string;
  createdBy: string;
  createdAt: string;
  audience: 'ALL' | 'CHAPTER' | 'COHORT' | 'MENTORSHIP';
  recordingUrl?: string;
  isRecurring: boolean;
  recurrenceRule?: string;
  status: 'UPCOMING' | 'LIVE' | 'ENDED' | 'CANCELLED';
}

// ============================================================
// R2 – E‑Learning
// ============================================================

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  pillar: 'MARKETPLACE' | 'GOVERNANCE' | 'TECHNOLOGY';
  instructorId: string;
  instructorName: string;
  enrolledCount: number;
  rating: number;
  reviewCount: number;
  image?: string;
  durationHours: number;
  lessonsCount: number;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

export interface Cohort {
  id: string;
  courseId: string;
  name: string;
  startsOn: string;
  endsOn: string;
  capacity: number;
  enrolled: number;
  status: 'PLANNED' | 'OPEN' | 'FULL' | 'IN_PROGRESS' | 'COMPLETED';
  facilitators: string[];
}

export interface Enrollment {
  courseId: string;
  userId: string;
  progress: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  enrolledAt: string;
  completedAt?: string;
  lastAccessedAt?: string;
}

export interface CohortMember {
  userId: string;
  cohortId: string;
  progress: number;
  status: 'ACTIVE' | 'COMPLETED' | 'DROPPED';
  enrolledAt: string;
  completedAt?: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  content: string;
  type: 'video' | 'text' | 'quiz' | 'assignment';
  order: number;
  durationMinutes: number;
  videoUrl?: string;
  attachmentUrl?: string;
  isPreview?: boolean;
}

export interface LessonProgress {
  userId: string;
  lessonId: string;
  completed: boolean;
  completedAt?: string;
  quizScore?: number;
  assignmentSubmitted?: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface Quiz {
  id: string;
  lessonId: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  timeLimitMinutes?: number;
  passingScore: number;
}

export interface Assignment {
  id: string;
  lessonId: string;
  title: string;
  description: string;
  instructions: string;
  dueDate: string;
  maxScore: number;
  isSubmitted: boolean;
  submittedAt?: string;
  submissionText?: string;
  submissionFileUrl?: string;
  grade?: number;
  feedback?: string;
}

export interface Certificate {
  id: string;
  certificateNumber: string;
  userId: string;
  courseId: string;
  issuedAt: string;
  expiresAt?: string;
  status: 'issued' | 'revoked';
}

// ============================================================
// PHASE 1 – COMMERCE & KYC DATA MODELS (R3)
// ============================================================

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  variant?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentMethod: 'mpesa' | 'card' | 'bank_transfer' | 'wallet';
  paymentReference?: string;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    county: string;
    postalCode: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: 'standard' | 'premium' | 'enterprise';
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  startDate: string;
  renewalDate: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'annually';
  autoRenew: boolean;
}

export interface Donation {
  id: string;
  userId: string;
  supportPackId?: string;
  amount: number;
  currency: string;
  message?: string;
  isAnonymous: boolean;
  status: 'pending' | 'success' | 'failed';
  receiptUrl?: string;
  createdAt: string;
}

export interface KYCDocument {
  type: 'national_id' | 'passport' | 'drivers_license' | 'proof_of_address' | 'selfie';
  url: string;
  status: 'pending' | 'verified' | 'rejected';
  rejectionReason?: string;
  uploadedAt: string;
}

export interface KYCSubmission {
  id: string;
  userId: string;
  tier: 'basic' | 'enhanced';
  status: 'not_started' | 'pending' | 'approved' | 'rejected';
  documents: KYCDocument[];
  submittedAt?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface PaymentTransaction {
  id: string;
  userId: string;
  orderId?: string;
  donationId?: string;
  amount: number;
  currency: string;
  type: 'debit' | 'credit';
  method: 'mpesa' | 'card' | 'bank_transfer' | 'wallet' | 'refund';
  status: 'initiated' | 'pending' | 'success' | 'failed' | 'reversed';
  reference: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

// ============================================================
// R4 – SAVINGS & CREDIT
// ============================================================

export interface Circle {
  id: string;
  name: string;
  description: string;
  type: 'ROTATING' | 'INVESTMENT' | 'GOAL';
  contributionAmount: number;
  currency: string;
  frequency: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
  payoutOrder: 'ROTATIONAL' | 'RANDOM' | 'BIDDING';
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'DISBANDED';
  leaderId: string;
  memberIds: string[];
  createdAt: string;
  nextPayoutDate?: string;
  totalBalance: number;
  contributionCount?: number;
  memberCount?: number;
}

export interface Contribution {
  id: string;
  circleId: string;
  memberId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED';
  transactionId?: string;
  paidAt?: string;
  createdAt: string;
  method: 'M-PESA' | 'BANK' | 'WALLET';
}

export interface Payout {
  id: string;
  circleId: string;
  memberId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'APPROVED' | 'EXECUTED' | 'FAILED' | 'REVERSED';
  initiatedBy: string;
  approvedBy?: string;
  scheduledDate: string;
  executedAt?: string;
  createdAt: string;
}

export interface Dispute {
  id: string;
  circleId: string;
  raisedBy: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED';
  resolution?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoanProduct {
  id: string;
  name: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  minTenor: number;
  maxTenor: number;
  interestRate: number;
  serviceFee: number;
  eligibilityCriteria: {
    minKycLevel: 0 | 1 | 2;
    minSavingsBalance?: number;
    minMemberTier?: 'STUDENT' | 'PROFESSIONAL' | 'ASSOCIATE';
  };
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
}

export interface LoanApplication {
  id: string;
  productId: string;
  memberId: string;
  amount: number;
  tenor: number;
  purpose: string;
  affordabilityNotes?: string;
  guarantorIds: string[];
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'OFFERED' | 'DISBURSED' | 'REPAID';
  submittedAt?: string;
  decisionAt?: string;
  offer?: {
    interestRate: number;
    totalCost: number;
    monthlyPayment: number;
    approvedAmount: number;
    approvedTenor: number;
    expiresAt: string;
  };
  createdAt: string;
}

export interface Loan {
  id: string;
  applicationId: string;
  memberId: string;
  productId: string;
  principal: number;
  interestRate: number;
  totalCost: number;
  disbursedAt: string;
  nextDueDate: string;
  outstandingBalance: number;
  status: 'ACTIVE' | 'PAID' | 'DEFAULTED' | 'RESTRUCTURED';
  repayments: Repayment[];
}

export interface Repayment {
  id: string;
  loanId: string;
  dueDate: string;
  amount: number;
  paidAmount?: number;
  status: 'PAID' | 'PARTIAL' | 'OVERDUE' | 'PENDING';
  paidAt?: string;
}

export interface Guarantee {
  id: string;
  loanId: string;
  guarantorId: string;
  borrowerId: string;
  amount: number;
  status: 'PENDING' | 'ACTIVE' | 'RELEASED' | 'CALLED';
  createdAt: string;
}

// ============================================================
// R5 – WALLET & OTC & REMITTANCE
// ============================================================

export interface WalletBalance {
  asset: 'USDT';
  network: 'TRC20' | 'ERC20' | 'BEP20';
  available: number;
  pending: number;
}

export interface WalletTransaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'OTC_BUY' | 'OTC_SELL';
  asset: 'USDT';
  network: 'TRC20' | 'ERC20' | 'BEP20' | null;
  amount: number;
  fee: number;
  status: 'PENDING' | 'CONFIRMING' | 'CONFIRMED' | 'FAILED' | 'REJECTED';
  txHash?: string;
  confirmations?: number;
  confirmationThreshold?: number;
  timestamp: string;
  counterparty?: string;
  memo?: string;
}

export interface KYCStatus {
  tier: 0 | 1 | 2;
  dailyLimit: number;
  dailyUsed: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface OTCRate {
  pair: 'USDT/KES';
  buyRate: number;
  sellRate: number;
  spread: number;
  lastUpdated: string;
}

export interface OTCQuote {
  id: string;
  type: 'BUY' | 'SELL';
  amount: number;
  rate: number;
  fee: number;
  total: number;
  expiresAt: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REJECTED';
}

export interface OTCOrder {
  id: string;
  userId: string;
  type: 'BUY' | 'SELL';
  amount: number;
  rate: number;
  total: number;
  fee: number;
  status: 'PENDING' | 'IN_ESCROW' | 'MATCHED' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';
  escrowId?: string;
  matchedWith?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface RemittanceCorridor {
  id: string;
  fromCountry: string;
  fromCurrency: string;
  toCountry: string;
  toCurrency: string;
  rate: number;
  fee: number;
  estimatedDelivery: string;
  minAmount: number;
  maxAmount: number;
  status: 'ACTIVE' | 'MAINTENANCE' | 'PAUSED';
  partner: string;
}

export interface RemittanceRecipient {
  id: string;
  name: string;
  phone: string;
  email?: string;
  country: string;
  currency: string;
  bankName?: string;
  bankAccount?: string;
  mobileNetwork?: string;
  relationship: 'SELF' | 'FAMILY' | 'FRIEND' | 'BUSINESS' | 'OTHER';
  isSaved: boolean;
  createdAt: string;
}

export interface RemittanceTransfer {
  id: string;
  userId: string;
  corridorId: string;
  recipientId: string;
  amount: number;
  fee: number;
  rate: number;
  total: number;
  sendCurrency: string;
  receiveAmount: number;
  receiveCurrency: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  purpose: string;
  trackingCode: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  failureReason?: string;
}

// ============================================================
// LAYER 3 – ADMIN CONSOLE (PNL-01: Administration Overview)
// ============================================================

export interface AdminStat {
  id: string;
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'flat';
  icon: 'members' | 'applications' | 'chapters' | 'revenue';
  href: string;
}

export type AdminPriority = 'critical' | 'high' | 'medium' | 'low';

export interface QueueDepth {
  id: string;
  label: string;
  count: number;
  priority: AdminPriority;
  href: string;
  description: string;
}

export type AdminTaskType =
  | 'application'
  | 'refund'
  | 'moderation'
  | 'kyc'
  | 'aml'
  | 'payout'
  | 'dispute';

export interface AdminTask {
  id: string;
  title: string;
  description: string;
  type: AdminTaskType;
  priority: AdminPriority;
  dueIn: string;
  entityId: string;
  entityLabel: string;
  href: string;
  assignedTo?: string;
}

export type AdminActivityCategory =
  | 'member'
  | 'finance'
  | 'content'
  | 'compliance';

export interface AdminActivityItem {
  id: string;
  action: string;
  actor: string;
  target: string;
  timestamp: string;
  category: AdminActivityCategory;
}

export type AdminSearchEntityType =
  | 'member'
  | 'application'
  | 'order'
  | 'transaction'
  | 'chapter'
  | 'course';

export interface AdminSearchResult {
  id: string;
  type: AdminSearchEntityType;
  title: string;
  subtitle: string;
  href: string;
  metadata?: string;
}

// ============================================================
// 2. MOCK DATA
// ============================================================

// ---- Members ----
export const mockMembers: Member[] = [
  {
    id: '1',
    memberNumber: 'TEG-1001',
    firstName: 'Grace',
    lastName: 'Mwangi',
    email: 'grace@example.com',
    phone: '+254 712 345 678',
    status: 'active',
    tier: 'Eagle',
    chapter: 'KU',
    pillarInterest: ['Governance', 'Technology'],
    bio: 'Passionate about policy and innovation. Leading digital transformation in the public sector.',
    joinedAt: '2025-01-15',
  },
  {
    id: '2',
    memberNumber: 'TEG-1002',
    firstName: 'David',
    lastName: 'Ochieng',
    email: 'david@example.com',
    phone: '+254 723 456 789',
    status: 'active',
    tier: 'Rising',
    chapter: 'UON',
    pillarInterest: ['Marketplace'],
    bio: 'Entrepreneur and tech enthusiast. Building AI solutions for African businesses.',
    joinedAt: '2025-02-10',
  },
  {
    id: '3',
    memberNumber: 'TEG-1003',
    firstName: 'Faith',
    lastName: 'Akinyi',
    email: 'faith@example.com',
    phone: '+254 734 567 890',
    status: 'active',
    tier: 'Eagle',
    chapter: 'Strathmore',
    pillarInterest: ['Technology', 'Marketplace'],
    bio: 'Software engineer leading digital transformation. Passionate about mentoring young women in tech.',
    joinedAt: '2024-11-20',
  },
  {
    id: '4',
    memberNumber: 'TEG-1004',
    firstName: 'James',
    lastName: 'Kariuki',
    email: 'james@example.com',
    phone: '+254 745 678 901',
    status: 'pending',
    tier: 'Nestling',
    chapter: 'KU',
    pillarInterest: ['Governance'],
    bio: 'Public policy student interested in good governance and civic engagement.',
    joinedAt: '2026-01-05',
  },
  {
    id: '5',
    memberNumber: 'TEG-1005',
    firstName: 'Mary',
    lastName: 'Wanjiru',
    email: 'mary@example.com',
    phone: '+254 756 789 012',
    status: 'active',
    tier: 'Rising',
    chapter: 'Nairobi Professional',
    pillarInterest: ['Marketplace', 'Governance'],
    bio: 'Business development manager with a passion for ethical leadership.',
    joinedAt: '2025-09-01',
  },
  {
    id: '6',
    memberNumber: 'TEG-1006',
    firstName: 'Peter',
    lastName: 'Odhiambo',
    email: 'peter@example.com',
    phone: '+254 767 890 123',
    status: 'active',
    tier: 'Eagle',
    chapter: 'UON',
    pillarInterest: ['Technology'],
    bio: 'Cloud architect. Building scalable solutions for East African enterprises.',
    joinedAt: '2024-08-15',
  },
  {
    id: '7',
    memberNumber: 'TEG-1007',
    firstName: 'Esther',
    lastName: 'Achieng',
    email: 'esther@example.com',
    phone: '+254 778 901 234',
    status: 'inactive',
    tier: 'Rising',
    chapter: 'Strathmore',
    pillarInterest: ['Governance', 'Technology'],
    bio: 'Legal tech researcher exploring the intersection of law and technology.',
    joinedAt: '2025-12-01',
  },
  {
    id: '8',
    memberNumber: 'TEG-1008',
    firstName: 'Samuel',
    lastName: 'Mutua',
    email: 'samuel@example.com',
    phone: '+254 789 012 345',
    status: 'active',
    tier: 'Nestling',
    chapter: 'Nairobi Professional',
    pillarInterest: ['Marketplace'],
    bio: 'Sales professional. Currently learning about tech entrepreneurship.',
    joinedAt: '2026-02-14',
  },
];

// ---- Chapters ----
export const mockChapters: Chapter[] = [
  {
    code: 'KU',
    name: 'Kenyatta University',
    type: 'CAMPUS',
    memberCount: 45,
    location: 'Nairobi',
    leader: 'Grace Mwangi',
    description: 'The flagship campus chapter.',
  },
  {
    code: 'UON',
    name: 'University of Nairobi',
    type: 'CAMPUS',
    memberCount: 30,
    location: 'Nairobi',
    leader: 'David Ochieng',
    description: 'Strong research focus.',
  },
  {
    code: 'Strathmore',
    name: 'Strathmore University',
    type: 'CAMPUS',
    memberCount: 28,
    location: 'Nairobi',
    leader: 'Faith Akinyi',
    description: 'Entrepreneurship and innovation hub.',
  },
  {
    code: 'Nairobi Professional',
    name: 'Nairobi Professional Chapter',
    type: 'PROFESSIONAL',
    memberCount: 62,
    location: 'Nairobi',
    leader: 'Mary Wanjiru',
    description: 'For working professionals.',
  },
  {
    code: 'Kisumu',
    name: 'Kisumu Professional Chapter',
    type: 'PROFESSIONAL',
    memberCount: 18,
    location: 'Kisumu',
    leader: 'Peter Odhiambo',
    description: 'Western region professionals.',
  },
];

// ---- Applications ----
export const mockApplications: Application[] = [
  {
    reference: 'TEG-2026-001',
    name: 'Peter',
    email: 'peter@example.com',
    tier: 'Eagle',
    status: 'approved',
    motivation: 'I want to lead in technology.',
    chapter: 'UON',
    interviewDate: '2026-02-20',
  },
  {
    reference: 'TEG-2026-002',
    name: 'Esther',
    email: 'esther@example.com',
    tier: 'Rising',
    status: 'pending',
    motivation: 'Eager to grow in governance.',
    chapter: 'Strathmore',
  },
  {
    reference: 'TEG-2026-003',
    name: 'Samuel',
    email: 'samuel@example.com',
    tier: 'Eagle',
    status: 'rejected',
    motivation: 'Interested in marketplace transformation.',
    chapter: 'Nairobi Professional',
  },
  {
    reference: 'TEG-2026-004',
    name: 'James',
    email: 'james@example.com',
    tier: 'Nestling',
    status: 'pending',
    motivation: 'New to leadership.',
    chapter: 'KU',
  },
];

// ---- Announcements ----
export const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Annual Leadership Summit 2026',
    content: 'Join us for the Annual Leadership Summit on June 15-17. Keynote speakers include...',
    priority: 'HIGH',
    createdAt: '2026-02-28T10:00:00Z',
    author: 'Admin',
    readBy: ['1'],
  },
  {
    id: '2',
    title: 'New Chapter Launch – Eldoret',
    content: 'We are excited to announce a new chapter in Eldoret. Kickoff meeting on March 5.',
    priority: 'MEDIUM',
    createdAt: '2026-02-25T14:30:00Z',
    author: 'Admin',
    readBy: [],
  },
  {
    id: '3',
    title: 'Mentorship Program Call for Mentors',
    content: 'We are looking for experienced Eagles to mentor Rising members. Apply by March 10.',
    priority: 'HIGH',
    createdAt: '2026-02-20T09:15:00Z',
    author: 'Admin',
    readBy: ['1'],
  },
  {
    id: '4',
    title: 'Tech Workshop: AI for Good',
    content: 'Free workshop on applying AI to social challenges. Saturday, March 12.',
    priority: 'MEDIUM',
    createdAt: '2026-02-18T16:45:00Z',
    author: 'Admin',
    readBy: [],
  },
  {
    id: '5',
    title: 'Chapter Leader Orientation',
    content: 'All chapter leaders must attend the online orientation on March 3 at 7 PM EAT.',
    priority: 'HIGH',
    createdAt: '2026-02-15T11:00:00Z',
    author: 'Admin',
    readBy: [],
  },
  {
    id: '6',
    title: 'Eagle Generation Podcast Launches',
    content: 'Our new podcast featuring interviews with Kingdom leaders is now live on all platforms.',
    priority: 'MEDIUM',
    createdAt: '2026-02-10T08:30:00Z',
    author: 'Admin',
    readBy: ['1'],
  },
  {
    id: '7',
    title: 'Call for Proposals: Annual Conference 2026',
    content: 'We invite members to submit proposals for workshops, panel discussions, and talks.',
    priority: 'LOW',
    createdAt: '2026-02-05T13:00:00Z',
    author: 'Admin',
    readBy: [],
  },
  {
    id: '8',
    title: 'Volunteer Opportunity: Community Outreach',
    content: 'We are looking for volunteers to lead community outreach programs in Nairobi and Kisumu.',
    priority: 'HIGH',
    createdAt: '2026-01-28T10:00:00Z',
    author: 'Admin',
    readBy: ['1'],
  },
];

// ---- Notifications ----
export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    userId: '1',
    title: 'Welcome to Eagle Generation',
    message: 'Your membership has been approved. Welcome aboard!',
    read: true,
    createdAt: '2026-01-15T08:00:00Z',
    link: '/dashboard',
  },
  {
    id: 'n2',
    userId: '1',
    title: 'New Announcement: Leadership Summit',
    message: 'Check out the latest announcement about the Leadership Summit.',
    read: false,
    createdAt: '2026-02-28T10:00:00Z',
    link: '/announcements/1',
  },
  {
    id: 'n3',
    userId: '1',
    title: 'Your Chapter is Growing',
    message: 'Kenyatta University chapter has added 5 new members this month.',
    read: false,
    createdAt: '2026-02-25T12:00:00Z',
    link: '/chapter',
  },
  {
    id: 'n4',
    userId: '1',
    title: 'Mentorship Opportunity',
    message: 'You have been matched with a mentee. Please review their profile.',
    read: false,
    createdAt: '2026-02-20T09:00:00Z',
    link: '/profile/me',
  },
];

// ---- Audit Logs ----
export const mockAuditLogs: AuditLog[] = [
  {
    id: 'a1',
    actor: 'Admin',
    action: 'APPROVED_APPLICATION',
    entity: 'Peter (TEG-2026-001)',
    timestamp: '2026-02-22T14:30:00Z',
    details: 'Application approved by Admin.',
  },
  {
    id: 'a2',
    actor: 'Grace Mwangi',
    action: 'UPDATED_PROFILE',
    entity: 'Grace Mwangi',
    timestamp: '2026-02-21T10:00:00Z',
    details: 'Updated bio and pillar interests.',
  },
  {
    id: 'a3',
    actor: 'Admin',
    action: 'CREATED_ANNOUNCEMENT',
    entity: 'Leadership Summit',
    timestamp: '2026-02-20T08:00:00Z',
  },
  {
    id: 'a4',
    actor: 'Admin',
    action: 'ADDED_MEMBER',
    entity: 'James Kariuki',
    timestamp: '2026-02-18T16:00:00Z',
  },
  {
    id: 'a5',
    actor: 'David Ochieng',
    action: 'VIEWED_APPLICATION',
    entity: 'Esther (TEG-2026-002)',
    timestamp: '2026-02-17T11:30:00Z',
  },
  {
    id: 'a6',
    actor: 'Admin',
    action: 'UPDATED_CHAPTER',
    entity: 'Kisumu Professional Chapter',
    timestamp: '2026-02-15T09:00:00Z',
  },
];

// ---- Chapter Activities ----
export const chapterActivities: ChapterActivity[] = [
  {
    id: 'act1',
    chapterCode: 'KU',
    type: 'member_joined',
    title: 'New member joined',
    description: 'James Kariuki joined the chapter',
    actor: 'James Kariuki',
    timestamp: '2026-01-05T09:00:00Z',
  },
  {
    id: 'act2',
    chapterCode: 'KU',
    type: 'announcement',
    title: 'Leadership Summit announced',
    description: 'The annual summit is coming up in June.',
    actor: 'Grace Mwangi',
    timestamp: '2026-02-20T14:00:00Z',
  },
  {
    id: 'act3',
    chapterCode: 'KU',
    type: 'event',
    title: 'Chapter meeting',
    description: 'Monthly meeting scheduled for March 1.',
    actor: 'Grace Mwangi',
    timestamp: '2026-02-25T10:00:00Z',
  },
  {
    id: 'act4',
    chapterCode: 'UON',
    type: 'member_joined',
    title: 'New member joined',
    description: 'Peter Odhiambo joined the chapter',
    actor: 'Peter Odhiambo',
    timestamp: '2024-08-16T08:00:00Z',
  },
  {
    id: 'act5',
    chapterCode: 'UON',
    type: 'leader_post',
    title: 'New research partnership',
    description: 'Partnered with a local tech incubator for student projects.',
    actor: 'David Ochieng',
    timestamp: '2026-02-10T12:30:00Z',
  },
  {
    id: 'act6',
    chapterCode: 'Strathmore',
    type: 'member_joined',
    title: 'New member joined',
    description: 'Esther Achieng joined the chapter',
    actor: 'Esther Achieng',
    timestamp: '2025-12-01T09:15:00Z',
  },
  {
    id: 'act7',
    chapterCode: 'Strathmore',
    type: 'announcement',
    title: 'Entrepreneurship workshop',
    description: 'Free workshop on launching a startup, happening next week.',
    actor: 'Faith Akinyi',
    timestamp: '2026-02-22T16:00:00Z',
  },
  {
    id: 'act8',
    chapterCode: 'Nairobi Professional',
    type: 'event',
    title: 'Networking mixer',
    description: 'Professional mixer at Sarova Panafric, March 10.',
    actor: 'Mary Wanjiru',
    timestamp: '2026-02-28T11:00:00Z',
  },
  {
    id: 'act9',
    chapterCode: 'Nairobi Professional',
    type: 'member_joined',
    title: 'New member joined',
    description: 'Samuel Mutua joined the chapter',
    actor: 'Samuel Mutua',
    timestamp: '2026-02-14T08:00:00Z',
  },
  {
    id: 'act10',
    chapterCode: 'Kisumu',
    type: 'leader_post',
    title: 'Community outreach initiative',
    description: 'Partnering with local schools to offer leadership training.',
    actor: 'Peter Odhiambo',
    timestamp: '2026-02-18T07:45:00Z',
  },
];

// ---- Events ----
export const mockEvents: Event[] = [
  {
    id: 'evt-001',
    title: 'Annual Leadership Summit 2026',
    description: 'Join us for the annual gathering of Eagles from across East Africa.',
    date: '2026-06-15T09:00:00Z',
    endDate: '2026-06-17T17:00:00Z',
    location: 'Nairobi, Kenya',
    type: 'summit',
    capacity: 500,
    registered: 312,
    price: 2500,
    status: 'upcoming',
  },
  {
    id: 'evt-002',
    title: 'Tech Workshop: AI for Good',
    description: 'Free hands-on workshop exploring AI applications for social impact.',
    date: '2026-03-12T14:00:00Z',
    endDate: '2026-03-12T17:00:00Z',
    location: 'Online (Zoom)',
    type: 'workshop',
    capacity: 100,
    registered: 78,
    price: 0,
    status: 'upcoming',
  },
  {
    id: 'evt-003',
    title: 'Networking Mixer – Nairobi Professional',
    description: 'Professional networking event for members in the Nairobi area.',
    date: '2026-03-20T18:00:00Z',
    endDate: '2026-03-20T21:00:00Z',
    location: 'Sarova Panafric, Nairobi',
    type: 'networking',
    capacity: 80,
    registered: 54,
    price: 1500,
    status: 'upcoming',
  },
  {
    id: 'evt-004',
    title: 'Chapter Leaders Training',
    description: 'Training session for all chapter leaders.',
    date: '2026-04-05T10:00:00Z',
    endDate: '2026-04-05T16:00:00Z',
    location: 'Online (Zoom)',
    type: 'training',
    capacity: 200,
    registered: 143,
    price: 0,
    status: 'upcoming',
  },
  {
    id: 'evt-005',
    title: 'Annual General Meeting 2025',
    description: 'Review of the year\'s achievements and planning for the next year.',
    date: '2025-12-10T14:00:00Z',
    location: 'Nairobi, Kenya',
    type: 'other',
    capacity: 150,
    registered: 120,
    price: 0,
    status: 'past',
  },
];

// ---- Products ----
export const mockProducts: Product[] = [
  {
    id: 'prod-001',
    name: 'Eagle Generation T-Shirt',
    description: '100% cotton, unisex. Available in S, M, L, XL.',
    price: 1500,
    category: 'merchandise',
    inStock: true,
    sku: 'TEG-TSHIRT-001',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'prod-002',
    name: 'Kingdom Leaders Handbook',
    description: 'A comprehensive guide to leadership from a Kingdom perspective.',
    price: 3500,
    category: 'resources',
    inStock: true,
    sku: 'TEG-BOOK-001',
    createdAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'prod-003',
    name: 'Eagle Generation Cap',
    description: 'Stylish cap with the Eagle Generation logo. Adjustable fit.',
    price: 1200,
    category: 'merchandise',
    inStock: true,
    sku: 'TEG-CAP-001',
    createdAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'prod-004',
    name: 'Digital Leadership Course Bundle',
    description: 'Access all three pillar courses at a discounted price.',
    price: 15000,
    category: 'learning',
    inStock: true,
    sku: 'TEG-BUNDLE-001',
    createdAt: '2026-02-15T00:00:00Z',
  },
  {
    id: 'prod-005',
    name: 'Eagle Generation Journal',
    description: 'A premium leather-bound journal for notes and reflections.',
    price: 2000,
    category: 'merchandise',
    inStock: false,
    sku: 'TEG-JOURNAL-001',
    createdAt: '2026-01-20T00:00:00Z',
  },
  {
    id: 'prod-006',
    name: 'Mentorship Guidebook',
    description: 'A guide for mentors and mentees on building effective relationships.',
    price: 2800,
    category: 'resources',
    inStock: true,
    sku: 'TEG-GUIDE-001',
    createdAt: '2026-02-10T00:00:00Z',
  },
];

// ---- FAQ ----
export const mockFAQ: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'Membership',
    question: 'How do I renew my membership?',
    answer: 'You can renew your membership by visiting your profile settings and selecting "Subscription".',
  },
  {
    id: 'faq-2',
    category: 'Membership',
    question: 'What are the different membership tiers?',
    answer: 'We offer three tiers: Eagle, Rising, and Nestling. Each provides different levels of access.',
  },
  {
    id: 'faq-3',
    category: 'Learning',
    question: 'How do I access my enrolled courses?',
    answer: 'Go to the "My Learning" section from the sidebar. There you will see all your active and completed courses.',
  },
  {
    id: 'faq-4',
    category: 'Learning',
    question: 'Can I download course materials?',
    answer: 'Yes, instructors may provide downloadable resources. Look for the "Resources" tab within each lesson.',
  },
  {
    id: 'faq-5',
    category: 'Payments',
    question: 'What payment methods do you accept?',
    answer: 'We accept M‑Pesa, bank transfers, and credit/debit cards through our secure payment gateway.',
  },
  {
    id: 'faq-6',
    category: 'Payments',
    question: 'How do I get a receipt for my payment?',
    answer: 'After a successful payment, a receipt will be emailed to you. You can also find it in your order history.',
  },
  {
    id: 'faq-7',
    category: 'Technical',
    question: 'What browsers are supported?',
    answer: 'We support the latest versions of Chrome, Firefox, Safari, and Edge.',
  },
  {
    id: 'faq-8',
    category: 'General',
    question: 'How do I contact support?',
    answer: 'If you cannot find an answer here, you can submit a support ticket from the "Contact Support" page.',
  },
];

// ---- Support Packs ----
export const mockSupportPacks: SupportPack[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    amount: 2500,
    description: 'Support a scholar for one month',
    color: 'border-amber-300 bg-amber-50',
    icon: '🥉',
  },
  {
    id: 'silver',
    name: 'Silver',
    amount: 5000,
    description: 'Support a scholar for two months',
    color: 'border-gray-300 bg-gray-50',
    icon: '🥈',
  },
  {
    id: 'gold',
    name: 'Gold',
    amount: 10000,
    description: 'Support a scholar for a full programme',
    color: 'border-yellow-300 bg-yellow-50',
    icon: '🥇',
  },
  {
    id: 'platinum',
    name: 'Platinum',
    amount: 25000,
    description: 'Sponsor a chapter for a year',
    color: 'border-sky-300 bg-sky-50',
    icon: '💎',
  },
];

// ---- Blocked Users ----
export const mockBlockedUsers: BlockedUser[] = [
  {
    id: '2',
    firstName: 'David',
    lastName: 'Ochieng',
    email: 'david@example.com',
    blockedAt: '2026-02-15T10:30:00Z',
    reason: 'Spam messages',
  },
  {
    id: '4',
    firstName: 'James',
    lastName: 'Kariuki',
    email: 'james@example.com',
    blockedAt: '2026-03-01T14:20:00Z',
    reason: 'Harassment',
  },
];

// ============================================================
// R2 MOCK DATA
// ============================================================

// ---- Posts ----
export const mockPosts: Post[] = [
  {
    id: 'post-1',
    author: {
      id: '1',
      firstName: 'Grace',
      lastName: 'Mwangi',
      avatar: '',
      chapterId: 'chap-001',
      chapterName: 'Kenyatta University',
    },
    content:
      'Excited to start the Governance pillar course! This will transform how we approach public service and ethical leadership in our communities. Who else is joining? 🦅',
    pillar: 'GOVERNANCE',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    likes: 12,
    comments: 4,
    likedByUser: false,
    isPinned: true,
  },
  {
    id: 'post-2',
    author: {
      id: '2',
      firstName: 'Daniel',
      lastName: 'Omondi',
      avatar: '',
      chapterId: 'chap-002',
      chapterName: 'Strathmore University',
    },
    content:
      'Who else is joining the Marketplace cohort this quarter? Let\'s connect and share insights on ethical business practices in Kenya.',
    pillar: 'MARKETPLACE',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    likes: 8,
    comments: 2,
    likedByUser: true,
  },
  {
    id: 'post-3',
    author: {
      id: '3',
      firstName: 'Faith',
      lastName: 'Akinyi',
      avatar: '',
      chapterId: 'chap-001',
      chapterName: 'Kenyatta University',
    },
    content:
      'Just completed the "Foundations of Technology" module. The content on AI ethics and data sovereignty was eye-opening! Highly recommend to anyone in the Tech pillar. 🚀',
    pillar: 'TECHNOLOGY',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    likes: 24,
    comments: 7,
    likedByUser: false,
  },
  {
    id: 'post-4',
    author: {
      id: '4',
      firstName: 'James',
      lastName: 'Kariuki',
      avatar: '',
      chapterId: 'chap-003',
      chapterName: 'UoN – Main Campus',
    },
    content:
      'Our chapter is hosting a networking mixer this Friday at 5 PM. All members are welcome! Come connect with fellow Eagles and share your journey. See you there!',
    pillar: 'GOVERNANCE',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    likes: 15,
    comments: 5,
    likedByUser: false,
  },
  {
    id: 'post-5',
    author: {
      id: '5',
      firstName: 'Mary',
      lastName: 'Wanjiru',
      avatar: '',
      chapterId: 'chap-002',
      chapterName: 'Strathmore University',
    },
    content:
      'The mentorship programme has been incredible. Shoutout to my mentor for guiding me through the Marketplace curriculum. I\'ve grown so much in just two months! 🙌',
    pillar: 'MARKETPLACE',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    likes: 31,
    comments: 9,
    likedByUser: true,
  },
];

// ---- Comments ----
export const mockComments: Comment[] = [
  {
    id: 'comment-1',
    postId: 'post-1',
    author: { id: '2', firstName: 'Daniel', lastName: 'Omondi', avatar: '' },
    content: 'Count me in! I\'ve been looking forward to this. When does it start?',
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    likes: 3,
    likedByUser: false,
  },
  {
    id: 'comment-2',
    postId: 'post-1',
    author: { id: '4', firstName: 'James', lastName: 'Kariuki', avatar: '' },
    content: 'This is exactly what our nation needs. Proud of you Grace!',
    createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    likes: 5,
    likedByUser: true,
  },
  {
    id: 'comment-3',
    postId: 'post-1',
    author: { id: '5', firstName: 'Mary', lastName: 'Wanjiru', avatar: '' },
    content: 'I\'m already enrolled! See you in the first session.',
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    likes: 2,
    likedByUser: false,
  },
  {
    id: 'comment-4',
    postId: 'post-3',
    author: { id: '6', firstName: 'Peter', lastName: 'Odhiambo', avatar: '' },
    content: 'This module changed my perspective on tech ethics. Highly recommended!',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    likes: 7,
    likedByUser: false,
  },
  {
    id: 'comment-5',
    postId: 'post-5',
    author: { id: '1', firstName: 'Grace', lastName: 'Mwangi', avatar: '' },
    content: 'So proud of you Mary! Keep soaring! 🦅',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    likes: 4,
    likedByUser: false,
  },
];

// ---- Groups ----
export const mockGroups: Group[] = [
  {
    id: 'group-1',
    name: 'Governance Leaders Circle',
    description: 'A group for members passionate about good governance, public policy, and ethical leadership.',
    type: 'STUDY',
    visibility: 'OPEN',
    chapterId: 'chap-001',
    createdBy: '1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    memberCount: 34,
    tags: ['Governance', 'Policy', 'Leadership'],
  },
  {
    id: 'group-2',
    name: 'Tech Innovators Hub',
    description: 'Discuss the latest in technology, AI, and digital transformation with fellow Eagles.',
    type: 'INTEREST',
    visibility: 'OPEN',
    createdBy: '3',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    memberCount: 56,
    tags: ['Technology', 'AI', 'Innovation'],
  },
  {
    id: 'group-3',
    name: 'Marketplace Mentorship Cohort',
    description: 'A closed mentorship group for Rising members in the Marketplace pillar.',
    type: 'MENTORSHIP',
    visibility: 'CLOSED',
    createdBy: '5',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    memberCount: 18,
    tags: ['Marketplace', 'Mentorship', 'Business'],
  },
  {
    id: 'group-4',
    name: 'Kenyatta University Eagles',
    description: 'The official group for KU chapter members. Share events, announcements, and connect.',
    type: 'CHAPTER',
    visibility: 'CLOSED',
    chapterId: 'chap-001',
    createdBy: '1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
    memberCount: 45,
    tags: ['KU', 'Chapter', 'Community'],
  },
  {
    id: 'group-5',
    name: 'Faith & Work Integration',
    description: 'Exploring how faith intersects with professional life across all three pillars.',
    type: 'STUDY',
    visibility: 'OPEN',
    createdBy: '5',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    memberCount: 22,
    tags: ['Faith', 'Work', 'Integration'],
  },
];

// ---- Group Members ----
export let mockGroupMembers: GroupMember[] = [
  { userId: '1', groupId: 'group-1', role: 'ADMIN', joinedAt: '2026-01-10T08:00:00Z' },
  { userId: '2', groupId: 'group-1', role: 'MEMBER', joinedAt: '2026-01-12T09:00:00Z' },
  { userId: '4', groupId: 'group-1', role: 'MEMBER', joinedAt: '2026-01-15T10:00:00Z' },
  { userId: '5', groupId: 'group-1', role: 'MODERATOR', joinedAt: '2026-01-18T11:00:00Z' },
  { userId: '6', groupId: 'group-1', role: 'MEMBER', joinedAt: '2026-01-20T12:00:00Z' },
  { userId: '3', groupId: 'group-2', role: 'ADMIN', joinedAt: '2026-01-15T08:00:00Z' },
  { userId: '1', groupId: 'group-2', role: 'MEMBER', joinedAt: '2026-01-16T09:00:00Z' },
  { userId: '6', groupId: 'group-2', role: 'MEMBER', joinedAt: '2026-01-17T10:00:00Z' },
  { userId: '8', groupId: 'group-2', role: 'MEMBER', joinedAt: '2026-01-18T11:00:00Z' },
  { userId: '5', groupId: 'group-3', role: 'ADMIN', joinedAt: '2026-01-20T08:00:00Z' },
  { userId: '2', groupId: 'group-3', role: 'MEMBER', joinedAt: '2026-01-21T09:00:00Z' },
  { userId: '4', groupId: 'group-3', role: 'MEMBER', joinedAt: '2026-01-22T10:00:00Z' },
  { userId: '1', groupId: 'group-4', role: 'ADMIN', joinedAt: '2025-11-01T08:00:00Z' },
  { userId: '4', groupId: 'group-4', role: 'MEMBER', joinedAt: '2025-11-02T09:00:00Z' },
  { userId: '5', groupId: 'group-4', role: 'MODERATOR', joinedAt: '2025-11-03T10:00:00Z' },
  { userId: '5', groupId: 'group-5', role: 'ADMIN', joinedAt: '2026-02-01T08:00:00Z' },
  { userId: '1', groupId: 'group-5', role: 'MEMBER', joinedAt: '2026-02-02T09:00:00Z' },
  { userId: '3', groupId: 'group-5', role: 'MEMBER', joinedAt: '2026-02-03T10:00:00Z' },
  { userId: '7', groupId: 'group-5', role: 'MEMBER', joinedAt: '2026-02-04T11:00:00Z' },
];

// ---- Group Posts ----
export const mockGroupPosts: GroupPost[] = [
  {
    id: 'gpost-1',
    groupId: 'group-1',
    author: { id: '1', firstName: 'Grace', lastName: 'Mwangi', avatar: '' },
    content: 'Welcome everyone to the Governance Leaders Circle! I\'m excited to dive into our first topic: "Ethical Leadership in the Public Sector." Please introduce yourselves and share what you hope to learn.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    likes: 15,
    comments: 8,
    likedByUser: false,
    isPinned: true,
  },
  {
    id: 'gpost-2',
    groupId: 'group-1',
    author: { id: '5', firstName: 'Mary', lastName: 'Wanjiru', avatar: '' },
    content: 'I just read an article on participatory governance in Kenya. Would love to discuss this in our next meeting!',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    likes: 6,
    comments: 3,
    likedByUser: false,
  },
  {
    id: 'gpost-3',
    groupId: 'group-2',
    author: { id: '3', firstName: 'Faith', lastName: 'Akinyi', avatar: '' },
    content: 'Tech Innovators – our first project is building an AI ethics framework for East Africa. Who\'s interested in leading this effort?',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    likes: 22,
    comments: 12,
    likedByUser: true,
  },
  {
    id: 'gpost-4',
    groupId: 'group-4',
    author: { id: '1', firstName: 'Grace', lastName: 'Mwangi', avatar: '' },
    content: 'KU Eagles! Our chapter meeting is tomorrow at 5 PM in the Education Building. Please bring your course materials and questions.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    likes: 18,
    comments: 5,
    likedByUser: false,
  },
];

// ---- Conversations & Messages ----
export const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    participants: ['1', '2'],
    updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    isGroup: false,
  },
  {
    id: 'conv-2',
    participants: ['1', '3', '5'],
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    isGroup: true,
    groupName: 'Governance Study Group',
  },
  {
    id: 'conv-3',
    participants: ['1', '4'],
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    isGroup: false,
  },
];

export const mockMessages: Message[] = [
  {
    id: 'msg-1',
    conversationId: 'conv-1',
    senderId: '2',
    content: 'Hey Grace, are you joining the Governance course?',
    sentAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    readAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    type: 'text',
  },
  {
    id: 'msg-2',
    conversationId: 'conv-1',
    senderId: '1',
    content: 'Yes, I already enrolled! Excited to dive in.',
    sentAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    readAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    type: 'text',
  },
  {
    id: 'msg-3',
    conversationId: 'conv-1',
    senderId: '2',
    content: 'Awesome! Let me know if you want to study together.',
    sentAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    readAt: undefined,
    type: 'text',
  },
  {
    id: 'msg-4',
    conversationId: 'conv-2',
    senderId: '3',
    content: 'Everyone, let\'s meet on Thursday at 5 PM to discuss the reading.',
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    readAt: undefined,
    type: 'text',
  },
  {
    id: 'msg-5',
    conversationId: 'conv-2',
    senderId: '5',
    content: 'I\'ll be there! Looking forward to it.',
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
    readAt: undefined,
    type: 'text',
  },
];

// ---- Mentorship ----
export const mockMentors: MentorProfile[] = [
  {
    userId: '1',
    firstName: 'Grace',
    lastName: 'Mwangi',
    avatar: '',
    focusCategories: ['Leadership', 'Governance', 'Public Policy'],
    expertise: ['Policy Analysis', 'Public Administration', 'Ethical Leadership'],
    availability: 'Weekends and Tuesday evenings',
    bio: 'I\'m passionate about mentoring the next generation of leaders in governance. I have 8 years of experience in public policy and am currently leading a digital transformation initiative.',
    isActive: true,
    capacity: 5,
    currentMentees: 2,
    rating: 4.8,
    reviewCount: 12,
  },
  {
    userId: '2',
    firstName: 'Daniel',
    lastName: 'Omondi',
    avatar: '',
    focusCategories: ['Entrepreneurship', 'Technology', 'Marketplace'],
    expertise: ['Business Development', 'AI Strategy', 'Product Management'],
    availability: 'Weekdays after 6 PM',
    bio: 'I\'m an AI entrepreneur with a passion for building products that solve African challenges. I mentor on business strategy, product development, and tech ethics.',
    isActive: true,
    capacity: 3,
    currentMentees: 1,
    rating: 4.9,
    reviewCount: 8,
  },
  {
    userId: '3',
    firstName: 'Faith',
    lastName: 'Akinyi',
    avatar: '',
    focusCategories: ['Technology', 'Software Engineering', 'Career Growth'],
    expertise: ['Full Stack Development', 'Mentoring Women in Tech', 'Cloud Architecture'],
    availability: 'Saturdays 10 AM – 2 PM',
    bio: 'I\'ve been a software engineer for over 6 years and now lead a team. I love mentoring women in tech and helping people navigate their career paths.',
    isActive: true,
    capacity: 4,
    currentMentees: 3,
    rating: 4.7,
    reviewCount: 15,
  },
  {
    userId: '6',
    firstName: 'Peter',
    lastName: 'Odhiambo',
    avatar: '',
    focusCategories: ['Cloud Computing', 'DevOps', 'Infrastructure'],
    expertise: ['AWS', 'Kubernetes', 'CI/CD', 'Site Reliability'],
    availability: 'Monday – Thursday evenings',
    bio: 'I\'m a cloud architect with experience at a major tech company. I can help you understand cloud infrastructure, DevOps practices, and how to build scalable systems.',
    isActive: true,
    capacity: 3,
    currentMentees: 0,
    rating: 4.6,
    reviewCount: 6,
  },
];

export const mockMentorshipRequests: MentorshipRequest[] = [
  {
    id: 'req-1',
    mentorId: '1',
    menteeId: '4',
    status: 'ACCEPTED',
    focusArea: 'Public Policy',
    message: 'I\'m interested in learning more about how to get involved in public policy as a young leader.',
    requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    respondedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
  },
  {
    id: 'req-2',
    mentorId: '2',
    menteeId: '5',
    status: 'PENDING',
    focusArea: 'Entrepreneurship',
    message: 'I\'m launching a startup and would love your guidance on product-market fit.',
    requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'req-3',
    mentorId: '3',
    menteeId: '8',
    status: 'PENDING',
    focusArea: 'Software Engineering',
    message: 'I\'m looking to transition into tech. Can you help me figure out where to start?',
    requestedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
];

export const mockMentorshipSessions: MentorshipSession[] = [
  {
    id: 'sess-1',
    requestId: 'req-1',
    mentorId: '1',
    menteeId: '4',
    scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
    durationMinutes: 60,
    status: 'SCHEDULED',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
  },
  {
    id: 'sess-2',
    requestId: 'req-1',
    mentorId: '1',
    menteeId: '4',
    scheduledAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    durationMinutes: 45,
    status: 'COMPLETED',
    notes: 'Discussed policy frameworks and career paths.',
    feedback: 'Very helpful! Great insights.',
  },
];

// ---- Meetings ----
export const mockMeetings: Meeting[] = [
  {
    id: 'mtg-1',
    title: 'Chapter Leaders Orientation',
    description: 'All chapter leaders must attend this orientation to learn about platform updates and leadership best practices.',
    scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
    durationMinutes: 90,
    meetingLink: 'https://meet.google.com/xyz-abc-def',
    createdBy: '1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    audience: 'CHAPTER',
    isRecurring: false,
    status: 'UPCOMING',
  },
  {
    id: 'mtg-2',
    title: 'Governance Pillar Study Group',
    description: 'Weekly discussion on the current reading: "Ethical Leadership in Public Service".',
    scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(),
    durationMinutes: 60,
    meetingLink: 'https://meet.google.com/jkl-mno-pqr',
    createdBy: '3',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    audience: 'COHORT',
    isRecurring: true,
    recurrenceRule: 'FREQ=WEEKLY;BYDAY=TH',
    status: 'UPCOMING',
  },
  {
    id: 'mtg-3',
    title: 'Mentorship Session – Grace & James',
    description: 'One-on-one mentorship session to discuss policy career pathways.',
    scheduledFor: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    durationMinutes: 45,
    meetingLink: 'https://meet.google.com/stu-vwx-yz',
    createdBy: '1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    audience: 'MENTORSHIP',
    isRecurring: false,
    status: 'ENDED',
    recordingUrl: 'https://drive.google.com/file/d/abc123',
  },
];

// ---- E‑Learning ----
export const mockCourses: Course[] = [
  {
    id: 'course-1',
    title: 'Foundations of Governance',
    slug: 'foundations-of-governance',
    description: 'An introduction to good governance, ethics, and public policy for emerging leaders.',
    pillar: 'GOVERNANCE',
    instructorId: '1',
    instructorName: 'Grace Mwangi',
    enrolledCount: 156,
    rating: 4.7,
    reviewCount: 89,
    durationHours: 12,
    lessonsCount: 24,
    level: 'BEGINNER',
    status: 'PUBLISHED',
  },
  {
    id: 'course-2',
    title: 'Marketplace Ethics & Entrepreneurship',
    slug: 'marketplace-ethics-entrepreneurship',
    description: 'Learn how to build ethical businesses and transform the marketplace.',
    pillar: 'MARKETPLACE',
    instructorId: '2',
    instructorName: 'Daniel Ochieng',
    enrolledCount: 98,
    rating: 4.9,
    reviewCount: 45,
    durationHours: 15,
    lessonsCount: 30,
    level: 'INTERMEDIATE',
    status: 'PUBLISHED',
  },
  {
    id: 'course-3',
    title: 'Technology & Society',
    slug: 'technology-society',
    description: 'Explore the intersection of technology, ethics, and social impact.',
    pillar: 'TECHNOLOGY',
    instructorId: '3',
    instructorName: 'Faith Akinyi',
    enrolledCount: 210,
    rating: 4.8,
    reviewCount: 112,
    durationHours: 10,
    lessonsCount: 20,
    level: 'BEGINNER',
    status: 'PUBLISHED',
  },
];

export const mockCohorts: Cohort[] = [
  {
    id: 'cohort-1',
    courseId: 'course-1',
    name: 'Governance Cohort Q1 2026',
    startsOn: '2026-01-15',
    endsOn: '2026-03-15',
    capacity: 50,
    enrolled: 48,
    status: 'IN_PROGRESS',
    facilitators: ['Grace Mwangi', 'James Kariuki'],
  },
  {
    id: 'cohort-2',
    courseId: 'course-2',
    name: 'Marketplace Cohort Q1 2026',
    startsOn: '2026-02-01',
    endsOn: '2026-04-01',
    capacity: 40,
    enrolled: 38,
    status: 'IN_PROGRESS',
    facilitators: ['Daniel Ochieng'],
  },
  {
    id: 'cohort-3',
    courseId: 'course-3',
    name: 'Tech Cohort Q1 2026',
    startsOn: '2026-01-20',
    endsOn: '2026-03-20',
    capacity: 60,
    enrolled: 60,
    status: 'FULL',
    facilitators: ['Faith Akinyi', 'Peter Odhiambo'],
  },
];

export const mockEnrollments: Enrollment[] = [
  {
    courseId: 'course-1',
    userId: '1',
    progress: 45,
    status: 'IN_PROGRESS',
    enrolledAt: '2026-01-20T10:00:00Z',
    lastAccessedAt: '2026-02-28T14:30:00Z',
  },
  {
    courseId: 'course-2',
    userId: '1',
    progress: 0,
    status: 'NOT_STARTED',
    enrolledAt: '2026-02-01T10:00:00Z',
  },
  {
    courseId: 'course-3',
    userId: '1',
    progress: 100,
    status: 'COMPLETED',
    enrolledAt: '2025-12-15T10:00:00Z',
    completedAt: '2026-01-10T10:00:00Z',
  },
];

export const mockCohortMembers: CohortMember[] = [
  { userId: '1', cohortId: 'cohort-1', progress: 65, status: 'ACTIVE', enrolledAt: '2026-01-15T08:00:00Z' },
  { userId: '2', cohortId: 'cohort-1', progress: 80, status: 'ACTIVE', enrolledAt: '2026-01-15T08:30:00Z' },
  { userId: '4', cohortId: 'cohort-1', progress: 45, status: 'ACTIVE', enrolledAt: '2026-01-16T09:00:00Z' },
  { userId: '5', cohortId: 'cohort-1', progress: 100, status: 'COMPLETED', enrolledAt: '2026-01-15T10:00:00Z', completedAt: '2026-03-10T10:00:00Z' },
  { userId: '6', cohortId: 'cohort-1', progress: 20, status: 'ACTIVE', enrolledAt: '2026-01-17T11:00:00Z' },
  { userId: '3', cohortId: 'cohort-2', progress: 70, status: 'ACTIVE', enrolledAt: '2026-02-01T08:00:00Z' },
  { userId: '2', cohortId: 'cohort-2', progress: 90, status: 'ACTIVE', enrolledAt: '2026-02-01T08:30:00Z' },
  { userId: '8', cohortId: 'cohort-2', progress: 35, status: 'ACTIVE', enrolledAt: '2026-02-02T09:00:00Z' },
  { userId: '5', cohortId: 'cohort-2', progress: 55, status: 'ACTIVE', enrolledAt: '2026-02-03T10:00:00Z' },
  { userId: '7', cohortId: 'cohort-3', progress: 95, status: 'ACTIVE', enrolledAt: '2026-01-20T08:00:00Z' },
  { userId: '3', cohortId: 'cohort-3', progress: 100, status: 'COMPLETED', enrolledAt: '2026-01-20T08:30:00Z', completedAt: '2026-03-18T10:00:00Z' },
  { userId: '1', cohortId: 'cohort-3', progress: 85, status: 'ACTIVE', enrolledAt: '2026-01-21T09:00:00Z' },
  { userId: '6', cohortId: 'cohort-3', progress: 60, status: 'ACTIVE', enrolledAt: '2026-01-22T10:00:00Z' },
];

export const mockLessons: Lesson[] = [
  { id: 'lesson-1-1', courseId: 'course-1', title: 'Introduction to Governance', content: 'This lesson introduces the core concepts of governance, including definitions, key principles, and the role of ethical leadership in public service. We will explore the historical context and modern challenges facing governance in Africa.', type: 'text', order: 1, durationMinutes: 15 },
  { id: 'lesson-1-2', courseId: 'course-1', title: 'Ethical Leadership Frameworks', content: 'In this lesson, we dive into various ethical leadership frameworks, including servant leadership, transformational leadership, and the biblical foundations of leadership. We will examine case studies from African leaders.', type: 'text', order: 2, durationMinutes: 20 },
  { id: 'lesson-1-3', courseId: 'course-1', title: 'Public Policy & Governance', content: 'This lesson covers the policy-making process, stakeholder analysis, and the importance of evidence-based policy. We will also discuss the role of civil society and citizen participation.', type: 'video', order: 3, durationMinutes: 25, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
  { id: 'lesson-1-4', courseId: 'course-1', title: 'Governance Quiz', content: 'Test your understanding of the governance principles covered in this module.', type: 'quiz', order: 4, durationMinutes: 10 },
  { id: 'lesson-1-5', courseId: 'course-1', title: 'Assignment: Governance Case Study', content: 'Write a 500-word analysis of a governance challenge in your community or country.', type: 'assignment', order: 5, durationMinutes: 60 },
  { id: 'lesson-2-1', courseId: 'course-2', title: 'Introduction to Marketplace Ethics', content: 'This lesson defines marketplace ethics, explores the difference between legal and ethical compliance, and introduces the concept of business as a force for good.', type: 'text', order: 1, durationMinutes: 15 },
  { id: 'lesson-2-2', courseId: 'course-2', title: 'Entrepreneurial Mindset', content: 'Learn about the key traits of successful entrepreneurs, opportunity recognition, and the role of innovation in creating value. We will also discuss social entrepreneurship.', type: 'text', order: 2, durationMinutes: 20 },
  { id: 'lesson-2-3', courseId: 'course-2', title: 'Financial Stewardship in Business', content: 'This lesson covers financial management principles, budgeting, cash flow, and the importance of ethical financial practices. We will also discuss the concept of "stewardship" as a business owner.', type: 'video', order: 3, durationMinutes: 25, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
  { id: 'lesson-2-4', courseId: 'course-2', title: 'Marketplace Ethics Quiz', content: 'Test your understanding of ethical business practices.', type: 'quiz', order: 4, durationMinutes: 10 },
  { id: 'lesson-2-5', courseId: 'course-2', title: 'Assignment: Business Plan', content: 'Develop a one-page business plan for a socially responsible venture.', type: 'assignment', order: 5, durationMinutes: 60 },
  { id: 'lesson-3-1', courseId: 'course-3', title: 'Technology and Social Impact', content: 'This lesson explores the dual nature of technology as a tool for empowerment and a source of ethical challenges. We will examine case studies in AI, data privacy, and digital inclusion.', type: 'text', order: 1, durationMinutes: 15 },
  { id: 'lesson-3-2', courseId: 'course-3', title: 'AI Ethics and Governance', content: 'Dive into the ethical considerations around artificial intelligence, including bias, transparency, and accountability. We will also discuss regulatory frameworks and the role of AI in Africa.', type: 'text', order: 2, durationMinutes: 20 },
  { id: 'lesson-3-3', courseId: 'course-3', title: 'Data Sovereignty and Privacy', content: 'This lesson covers the importance of data protection, the Kenya Data Protection Act, and the concept of data sovereignty. We will also explore practical steps for protecting personal data.', type: 'video', order: 3, durationMinutes: 25, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
  { id: 'lesson-3-4', courseId: 'course-3', title: 'Technology & Society Quiz', content: 'Test your understanding of technology ethics and social impact.', type: 'quiz', order: 4, durationMinutes: 10 },
  { id: 'lesson-3-5', courseId: 'course-3', title: 'Assignment: Tech Ethics Case Study', content: 'Analyze a real-world tech ethics issue and propose a solution.', type: 'assignment', order: 5, durationMinutes: 60 },
];

export const mockLessonProgress: LessonProgress[] = [
  { userId: '1', lessonId: 'lesson-1-1', completed: true, completedAt: '2026-02-20T10:00:00Z' },
  { userId: '1', lessonId: 'lesson-1-2', completed: true, completedAt: '2026-02-22T14:30:00Z' },
  { userId: '1', lessonId: 'lesson-1-3', completed: false },
  { userId: '1', lessonId: 'lesson-2-1', completed: false },
];

// ---- Quizzes ----
export const mockQuizzes: Quiz[] = [
  {
    id: 'quiz-1',
    lessonId: 'lesson-1-4',
    title: 'Governance Principles Quiz',
    description: 'Test your understanding of governance, ethics, and public policy.',
    questions: [
      {
        id: 'q1',
        question: 'What is the primary purpose of governance?',
        options: [
          'To control people',
          'To ensure effective decision-making and accountability',
          'To generate profit',
          'To enforce laws'
        ],
        correctAnswer: 1,
        explanation: 'Governance is about decision-making, accountability, and ensuring that organizations or societies function effectively.'
      },
      {
        id: 'q2',
        question: 'Which of the following is a key principle of ethical leadership?',
        options: [
          'Maximizing personal gain',
          'Transparency and integrity',
          'Maintaining the status quo',
          'Avoiding difficult decisions'
        ],
        correctAnswer: 1,
        explanation: 'Ethical leadership requires transparency, integrity, and a commitment to doing what is right, even when difficult.'
      },
      {
        id: 'q3',
        question: 'What is the role of civil society in governance?',
        options: [
          'To replace government functions',
          'To advocate for citizen interests and hold leaders accountable',
          'To enforce laws',
          'To provide funding for political campaigns'
        ],
        correctAnswer: 1,
        explanation: 'Civil society plays a watchdog role, ensuring that leaders are accountable and that citizens have a voice in decision-making.'
      },
      {
        id: 'q4',
        question: 'Which of the following is NOT a pillar of the Eagle Generation?',
        options: [
          'Marketplace',
          'Governance',
          'Technology',
          'Education'
        ],
        correctAnswer: 3,
        explanation: 'The three pillars are Marketplace, Governance, and Technology. Education is not a pillar but is supported by the platform.'
      },
      {
        id: 'q5',
        question: 'What does the term "policy-making" involve?',
        options: [
          'Ignoring public input',
          'Developing strategies to address public issues',
          'Enacting laws without debate',
          'Focusing only on economic growth'
        ],
        correctAnswer: 1,
        explanation: 'Policy-making is the process of developing strategies and solutions to address public issues, often involving stakeholder input and analysis.'
      }
    ],
    timeLimitMinutes: 10,
    passingScore: 70
  },
  {
    id: 'quiz-2',
    lessonId: 'lesson-2-4',
    title: 'Marketplace Ethics Quiz',
    description: 'Test your knowledge of ethical business practices and entrepreneurship.',
    questions: [
      {
        id: 'q1',
        question: 'What is the difference between legal compliance and ethical behavior?',
        options: [
          'There is no difference',
          'Ethical behavior goes beyond what is legally required',
          'Legal compliance is always ethical',
          'Ethical behavior is optional'
        ],
        correctAnswer: 1,
        explanation: 'Ethical behavior extends beyond legal requirements, focusing on what is morally right even if not mandated by law.'
      },
      {
        id: 'q2',
        question: 'Which of the following is a trait of an entrepreneurial mindset?',
        options: [
          'Avoiding risk',
          'Resistance to change',
          'Opportunity recognition',
          'Comfort with the status quo'
        ],
        correctAnswer: 2,
        explanation: 'Entrepreneurs are skilled at recognizing opportunities and taking calculated risks to create value.'
      },
      {
        id: 'q3',
        question: 'What is "stewardship" in business?',
        options: [
          'Maximizing shareholder profits',
          'Responsibly managing resources for the benefit of all stakeholders',
          'Avoiding taxes',
          'Focusing only on short-term gains'
        ],
        correctAnswer: 1,
        explanation: 'Stewardship involves managing resources responsibly, considering the impact on employees, communities, and the environment.'
      },
      {
        id: 'q4',
        question: 'What is the primary purpose of a business from a Kingdom perspective?',
        options: [
          'To generate maximum profit',
          'To serve the community and glorify God',
          'To dominate the market',
          'To compete aggressively'
        ],
        correctAnswer: 1,
        explanation: 'From a Kingdom perspective, business is seen as a vehicle for service, community impact, and honoring God.'
      }
    ],
    timeLimitMinutes: 8,
    passingScore: 75
  },
  {
    id: 'quiz-3',
    lessonId: 'lesson-3-4',
    title: 'Technology & Society Quiz',
    description: 'Assess your understanding of technology ethics, AI, and data sovereignty.',
    questions: [
      {
        id: 'q1',
        question: 'What is AI ethics primarily concerned with?',
        options: [
          'Improving AI speed',
          'Ensuring AI systems are fair, transparent, and accountable',
          'Maximizing AI profits',
          'Reducing AI development costs'
        ],
        correctAnswer: 1,
        explanation: 'AI ethics focuses on fairness, transparency, accountability, and preventing harm from AI systems.'
      },
      {
        id: 'q2',
        question: 'What is data sovereignty?',
        options: [
          'The right of countries to control data within their borders',
          'The right of companies to collect data freely',
          'The right of individuals to delete their data',
          'The right of governments to access all data'
        ],
        correctAnswer: 0,
        explanation: 'Data sovereignty is the concept that data is subject to the laws and governance of the country where it is collected or stored.'
      },
      {
        id: 'q3',
        question: 'What is the "digital divide"?',
        options: [
          'The gap between different operating systems',
          'The gap between those who have access to technology and those who do not',
          'The gap between tech companies and governments',
          'The gap between online and offline shopping'
        ],
        correctAnswer: 1,
        explanation: 'The digital divide refers to the disparity in access to technology and digital skills, often along socioeconomic lines.'
      },
      {
        id: 'q4',
        question: 'What is the Kenya Data Protection Act primarily designed to protect?',
        options: [
          'Government data',
          'Corporate trade secrets',
          'Personal data of individuals',
          'International data transfers'
        ],
        correctAnswer: 2,
        explanation: 'The Kenya Data Protection Act aims to protect the personal data of individuals and ensure responsible data processing.'
      }
    ],
    timeLimitMinutes: 8,
    passingScore: 70
  }
];

// ---- Assignments ----
export const mockAssignments: Assignment[] = [
  {
    id: 'assignment-1',
    lessonId: 'lesson-1-5',
    title: 'Governance Case Study',
    description: 'Analyze a governance challenge in your community or country.',
    instructions: 'Write a 500-word analysis of a governance challenge in your community or country. Identify the root causes, stakeholders involved, and propose actionable solutions. Use at least 3 references from course materials.',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    maxScore: 100,
    isSubmitted: false,
  },
  {
    id: 'assignment-2',
    lessonId: 'lesson-2-5',
    title: 'Business Plan',
    description: 'Develop a one-page business plan for a socially responsible venture.',
    instructions: 'Create a one-page business plan for a venture that addresses a social or environmental challenge. Include: Problem, Solution, Target Market, Revenue Model, and Social Impact. Format: PDF or Word document.',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString(),
    maxScore: 100,
    isSubmitted: false,
  },
  {
    id: 'assignment-3',
    lessonId: 'lesson-3-5',
    title: 'Tech Ethics Case Study',
    description: 'Analyze a real-world tech ethics issue and propose a solution.',
    instructions: 'Choose a real-world tech ethics issue (e.g., AI bias, data privacy breach, algorithm transparency). Analyze the issue, its impacts, and propose a solution or framework to address it. Use at least 2 course concepts.',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
    maxScore: 100,
    isSubmitted: false,
  },
  {
    id: 'assignment-4',
    lessonId: 'lesson-1-5',
    title: 'Governance Case Study (Submitted)',
    description: 'Analyze a governance challenge in your community or country.',
    instructions: 'Write a 500-word analysis...',
    dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    maxScore: 100,
    isSubmitted: true,
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    submissionText: 'The governance challenge in my community is the lack of transparency in local government procurement. This leads to corruption and inefficient use of public funds. Stakeholders include the county government, local businesses, and citizens. To address this, I propose implementing a public procurement portal that publishes all tenders and awards, along with citizen oversight committees.',
    grade: 85,
    feedback: 'Great analysis! You identified the key stakeholders and proposed a practical solution. Consider elaborating on how the oversight committee would be structured to avoid capture by vested interests.',
  }
];

// ---- Certificates ----
export const mockCertificates: Certificate[] = [
  {
    id: 'cert-1',
    certificateNumber: 'TEG-CERT-2026-001',
    userId: '1',
    courseId: 'course-3',
    issuedAt: '2026-01-10T10:00:00Z',
    status: 'issued',
  },
  {
    id: 'cert-2',
    certificateNumber: 'TEG-CERT-2026-002',
    userId: '1',
    courseId: 'course-1',
    issuedAt: '2025-12-15T10:00:00Z',
    status: 'issued',
  },
  {
    id: 'cert-3',
    certificateNumber: 'TEG-CERT-2026-003',
    userId: '2',
    courseId: 'course-2',
    issuedAt: '2026-02-20T10:00:00Z',
    status: 'issued',
  },
];

// ============================================================
// PHASE 1 – MOCK DATA (Commerce & KYC)
// ============================================================

export const mockOrders: Order[] = [
  {
    id: 'ord_001',
    userId: '1',
    items: [
      {
        productId: 'prod-001',
        productName: 'Eagle Generation T-Shirt',
        quantity: 2,
        price: 1500,
        total: 3000,
        variant: 'Large / Black',
      },
      {
        productId: 'prod-002',
        productName: 'Kingdom Leaders Handbook',
        quantity: 1,
        price: 3500,
        total: 3500,
      },
    ],
    subtotal: 6500,
    tax: 780,
    shipping: 350,
    total: 7630,
    currency: 'KES',
    status: 'delivered',
    paymentMethod: 'mpesa',
    paymentReference: 'MPESA_TXN_98765',
    shippingAddress: {
      line1: '123 Ngong Road',
      city: 'Nairobi',
      county: 'Nairobi',
      postalCode: '00100',
      country: 'Kenya',
    },
    createdAt: '2026-08-15T10:30:00Z',
    updatedAt: '2026-08-20T14:20:00Z',
  },
  {
    id: 'ord_002',
    userId: '2',
    items: [
      {
        productId: 'prod-004',
        productName: 'Digital Leadership Course Bundle',
        quantity: 1,
        price: 15000,
        total: 15000,
      },
    ],
    subtotal: 15000,
    tax: 0,
    shipping: 0,
    total: 15000,
    currency: 'KES',
    status: 'paid',
    paymentMethod: 'card',
    paymentReference: 'CARD_AUTH_12345',
    shippingAddress: {
      line1: '45 Moi Avenue',
      city: 'Mombasa',
      county: 'Mombasa',
      postalCode: '80100',
      country: 'Kenya',
    },
    createdAt: '2026-08-28T09:15:00Z',
    updatedAt: '2026-08-28T09:16:00Z',
  },
  {
    id: 'ord_003',
    userId: '3',
    items: [
      {
        productId: 'prod-003',
        productName: 'Eagle Generation Cap',
        quantity: 3,
        price: 1200,
        total: 3600,
      },
      {
        productId: 'prod-004',
        productName: 'Digital Leadership Course Bundle',
        quantity: 1,
        price: 15000,
        total: 15000,
      },
    ],
    subtotal: 18600,
    tax: 2232,
    shipping: 500,
    total: 21332,
    currency: 'KES',
    status: 'shipped',
    paymentMethod: 'bank_transfer',
    paymentReference: 'BANK_REF_56789',
    shippingAddress: {
      line1: '78 Kenyatta Avenue',
      city: 'Kisumu',
      county: 'Kisumu',
      postalCode: '40100',
      country: 'Kenya',
    },
    createdAt: '2026-09-01T12:00:00Z',
    updatedAt: '2026-09-02T08:30:00Z',
  },
  {
    id: 'ord_004',
    userId: '4',
    items: [
      {
        productId: 'prod-006',
        productName: 'Mentorship Guidebook',
        quantity: 2,
        price: 2800,
        total: 5600,
      },
    ],
    subtotal: 5600,
    tax: 672,
    shipping: 0,
    total: 6272,
    currency: 'KES',
    status: 'pending',
    paymentMethod: 'mpesa',
    paymentReference: undefined,
    shippingAddress: {
      line1: '12 Biashara Street',
      city: 'Nakuru',
      county: 'Nakuru',
      postalCode: '20100',
      country: 'Kenya',
    },
    createdAt: '2026-09-03T15:45:00Z',
    updatedAt: '2026-09-03T15:45:00Z',
  },
  {
    id: 'ord_005',
    userId: '5',
    items: [
      {
        productId: 'prod-001',
        productName: 'Eagle Generation T-Shirt',
        quantity: 1,
        price: 1500,
        total: 1500,
      },
      {
        productId: 'prod-003',
        productName: 'Eagle Generation Cap',
        quantity: 1,
        price: 1200,
        total: 1200,
      },
    ],
    subtotal: 2700,
    tax: 324,
    shipping: 350,
    total: 3374,
    currency: 'KES',
    status: 'cancelled',
    paymentMethod: 'mpesa',
    paymentReference: 'MPESA_TXN_11223',
    shippingAddress: {
      line1: '56 Riverside Drive',
      city: 'Nairobi',
      county: 'Nairobi',
      postalCode: '00100',
      country: 'Kenya',
    },
    createdAt: '2026-08-10T09:00:00Z',
    updatedAt: '2026-08-12T11:00:00Z',
  },
];

export const mockSubscriptions: Subscription[] = [
  {
    id: 'sub_001',
    userId: '1',
    plan: 'premium',
    status: 'active',
    startDate: '2026-01-01T00:00:00Z',
    renewalDate: '2027-01-01T00:00:00Z',
    price: 12000,
    currency: 'KES',
    billingCycle: 'annually',
    autoRenew: true,
  },
  {
    id: 'sub_002',
    userId: '2',
    plan: 'standard',
    status: 'cancelled',
    startDate: '2025-06-01T00:00:00Z',
    renewalDate: '2026-06-01T00:00:00Z',
    price: 6000,
    currency: 'KES',
    billingCycle: 'annually',
    autoRenew: false,
  },
  {
    id: 'sub_003',
    userId: '3',
    plan: 'enterprise',
    status: 'active',
    startDate: '2026-03-15T00:00:00Z',
    renewalDate: '2027-03-15T00:00:00Z',
    price: 24000,
    currency: 'KES',
    billingCycle: 'annually',
    autoRenew: true,
  },
  {
    id: 'sub_004',
    userId: '4',
    plan: 'standard',
    status: 'active',
    startDate: '2026-04-01T00:00:00Z',
    renewalDate: '2027-04-01T00:00:00Z',
    price: 6000,
    currency: 'KES',
    billingCycle: 'monthly',
    autoRenew: true,
  },
];

export const mockDonations: Donation[] = [
  {
    id: 'don_001',
    userId: '1',
    supportPackId: 'silver',
    amount: 5000,
    currency: 'KES',
    message: 'Proud to support the Eagle Generation!',
    isAnonymous: false,
    status: 'success',
    receiptUrl: '/receipts/don_001.pdf',
    createdAt: '2026-07-10T08:00:00Z',
  },
  {
    id: 'don_002',
    userId: '3',
    supportPackId: 'platinum',
    amount: 25000,
    currency: 'KES',
    message: '',
    isAnonymous: true,
    status: 'success',
    receiptUrl: '/receipts/don_002.pdf',
    createdAt: '2026-08-20T16:30:00Z',
  },
  {
    id: 'don_003',
    userId: '6',
    supportPackId: undefined,
    amount: 1000,
    currency: 'KES',
    message: 'Keep up the great work!',
    isAnonymous: false,
    status: 'pending',
    receiptUrl: undefined,
    createdAt: '2026-09-04T11:00:00Z',
  },
  {
    id: 'don_004',
    userId: '2',
    supportPackId: 'gold',
    amount: 10000,
    currency: 'KES',
    message: 'Supporting the next generation of leaders.',
    isAnonymous: false,
    status: 'success',
    receiptUrl: '/receipts/don_004.pdf',
    createdAt: '2026-06-15T14:00:00Z',
  },
  {
    id: 'don_005',
    userId: '5',
    supportPackId: 'bronze',
    amount: 2500,
    currency: 'KES',
    message: '',
    isAnonymous: true,
    status: 'failed',
    receiptUrl: undefined,
    createdAt: '2026-09-01T09:30:00Z',
  },
];

export const mockKYCSubmissions: KYCSubmission[] = [
  {
    id: 'kyc_001',
    userId: '2',
    tier: 'enhanced',
    status: 'approved',
    documents: [
      {
        type: 'national_id',
        url: '/mock/id_david_front.png',
        status: 'verified',
        uploadedAt: '2026-05-01T10:00:00Z',
      },
      {
        type: 'selfie',
        url: '/mock/selfie_david.png',
        status: 'verified',
        uploadedAt: '2026-05-01T10:15:00Z',
      },
      {
        type: 'proof_of_address',
        url: '/mock/utility_bill_david.png',
        status: 'verified',
        uploadedAt: '2026-05-02T09:00:00Z',
      },
    ],
    submittedAt: '2026-05-01T10:30:00Z',
    reviewedAt: '2026-05-03T14:00:00Z',
  },
  {
    id: 'kyc_002',
    userId: '4',
    tier: 'basic',
    status: 'rejected',
    documents: [
      {
        type: 'passport',
        url: '/mock/passport_james.png',
        status: 'rejected',
        rejectionReason: 'Image is blurry and does not show full document.',
        uploadedAt: '2026-08-10T12:00:00Z',
      },
    ],
    submittedAt: '2026-08-10T12:15:00Z',
    reviewedAt: '2026-08-12T09:00:00Z',
    rejectionReason: 'Document image quality insufficient. Please re-upload a clear photo.',
  },
  {
    id: 'kyc_003',
    userId: '6',
    tier: 'enhanced',
    status: 'pending',
    documents: [
      {
        type: 'national_id',
        url: '/mock/id_mary.png',
        status: 'pending',
        uploadedAt: '2026-09-02T15:00:00Z',
      },
      {
        type: 'selfie',
        url: '/mock/selfie_mary.png',
        status: 'pending',
        uploadedAt: '2026-09-02T15:05:00Z',
      },
    ],
    submittedAt: '2026-09-02T15:10:00Z',
  },
  {
    id: 'kyc_004',
    userId: '1',
    tier: 'enhanced',
    status: 'approved',
    documents: [
      {
        type: 'national_id',
        url: '/mock/id_grace.png',
        status: 'verified',
        uploadedAt: '2026-01-10T08:00:00Z',
      },
      {
        type: 'selfie',
        url: '/mock/selfie_grace.png',
        status: 'verified',
        uploadedAt: '2026-01-10T08:15:00Z',
      },
      {
        type: 'proof_of_address',
        url: '/mock/utility_bill_grace.png',
        status: 'verified',
        uploadedAt: '2026-01-11T09:00:00Z',
      },
    ],
    submittedAt: '2026-01-10T08:30:00Z',
    reviewedAt: '2026-01-12T10:00:00Z',
  },
  {
    id: 'kyc_005',
    userId: '3',
    tier: 'basic',
    status: 'not_started',
    documents: [],
    submittedAt: undefined,
    reviewedAt: undefined,
  },
];

export const mockPaymentTransactions: PaymentTransaction[] = [
  {
    id: 'txn_001',
    userId: '1',
    orderId: 'ord_001',
    amount: 7630,
    currency: 'KES',
    type: 'debit',
    method: 'mpesa',
    status: 'success',
    reference: 'MPESA_TXN_98765',
    metadata: { stkPushRequestId: 'stk_123' },
    createdAt: '2026-08-15T10:30:00Z',
  },
  {
    id: 'txn_002',
    userId: '2',
    orderId: 'ord_002',
    amount: 15000,
    currency: 'KES',
    type: 'debit',
    method: 'card',
    status: 'success',
    reference: 'CARD_AUTH_12345',
    createdAt: '2026-08-28T09:16:00Z',
  },
  {
    id: 'txn_003',
    userId: '3',
    orderId: 'ord_003',
    amount: 21332,
    currency: 'KES',
    type: 'debit',
    method: 'bank_transfer',
    status: 'success',
    reference: 'BANK_REF_56789',
    createdAt: '2026-09-01T12:05:00Z',
  },
  {
    id: 'txn_004',
    userId: '4',
    orderId: 'ord_004',
    amount: 6272,
    currency: 'KES',
    type: 'debit',
    method: 'mpesa',
    status: 'pending',
    reference: 'MPESA_INIT_11223',
    metadata: { stkPushRequestId: 'stk_456' },
    createdAt: '2026-09-03T15:45:00Z',
  },
  {
    id: 'txn_005',
    userId: '1',
    donationId: 'don_001',
    amount: 5000,
    currency: 'KES',
    type: 'debit',
    method: 'mpesa',
    status: 'success',
    reference: 'MPESA_DON_567',
    createdAt: '2026-07-10T08:01:00Z',
  },
  {
    id: 'txn_006',
    userId: '3',
    orderId: 'ord_003',
    amount: 21332,
    currency: 'KES',
    type: 'credit',
    method: 'refund',
    status: 'success',
    reference: 'REFUND_56789_01',
    metadata: { approvedBy: 'admin_01' },
    createdAt: '2026-09-02T16:00:00Z',
  },
  {
    id: 'txn_007',
    userId: '2',
    donationId: 'don_004',
    amount: 10000,
    currency: 'KES',
    type: 'debit',
    method: 'card',
    status: 'success',
    reference: 'CARD_DON_789',
    createdAt: '2026-06-15T14:05:00Z',
  },
  {
    id: 'txn_008',
    userId: '5',
    donationId: 'don_005',
    amount: 2500,
    currency: 'KES',
    type: 'debit',
    method: 'mpesa',
    status: 'failed',
    reference: 'MPESA_FAIL_999',
    metadata: { error: 'Insufficient balance' },
    createdAt: '2026-09-01T09:30:00Z',
  },
];

// ============================================================
// R4 – MOCK DATA (Savings & Credit)
// ============================================================

export const mockCircles: Circle[] = [
  {
    id: 'c1',
    name: 'Nairobi Professional Circle',
    description: 'Monthly savings for professionals in Nairobi. Rotational payouts.',
    type: 'ROTATING',
    contributionAmount: 5000,
    currency: 'KES',
    frequency: 'MONTHLY',
    payoutOrder: 'ROTATIONAL',
    status: 'ACTIVE',
    leaderId: '5',
    memberIds: ['1', '2', '3', '5'],
    createdAt: '2026-01-15T10:00:00Z',
    nextPayoutDate: '2026-02-15T10:00:00Z',
    totalBalance: 20000,
    contributionCount: 4,
    memberCount: 4,
  },
  {
    id: 'c2',
    name: 'Tech Innovators Investment Pool',
    description: 'Investing in tech startups. Quarterly payouts.',
    type: 'INVESTMENT',
    contributionAmount: 10000,
    currency: 'KES',
    frequency: 'QUARTERLY',
    payoutOrder: 'RANDOM',
    status: 'ACTIVE',
    leaderId: '3',
    memberIds: ['1', '2', '3'],
    createdAt: '2025-11-01T10:00:00Z',
    nextPayoutDate: '2026-04-01T10:00:00Z',
    totalBalance: 30000,
    contributionCount: 3,
    memberCount: 3,
  },
  {
    id: 'c3',
    name: 'Thika Chapter Savings',
    description: 'Supporting chapter projects.',
    type: 'GOAL',
    contributionAmount: 2000,
    currency: 'KES',
    frequency: 'WEEKLY',
    payoutOrder: 'BIDDING',
    status: 'PAUSED',
    leaderId: '2',
    memberIds: ['2', '4', '6'],
    createdAt: '2025-12-01T10:00:00Z',
    totalBalance: 6000,
    contributionCount: 3,
    memberCount: 3,
  },
];

export const mockContributions: Contribution[] = [
  {
    id: 'ct1',
    circleId: 'c1',
    memberId: '1',
    amount: 5000,
    currency: 'KES',
    status: 'COMPLETED',
    transactionId: 'txn_001',
    paidAt: '2026-01-15T10:30:00Z',
    createdAt: '2026-01-15T10:00:00Z',
    method: 'M-PESA',
  },
  {
    id: 'ct2',
    circleId: 'c1',
    memberId: '2',
    amount: 5000,
    currency: 'KES',
    status: 'PENDING',
    createdAt: '2026-01-16T09:00:00Z',
    method: 'BANK',
  },
  {
    id: 'ct3',
    circleId: 'c2',
    memberId: '1',
    amount: 10000,
    currency: 'KES',
    status: 'COMPLETED',
    transactionId: 'txn_002',
    paidAt: '2025-11-01T11:00:00Z',
    createdAt: '2025-11-01T10:00:00Z',
    method: 'WALLET',
  },
];

export const mockPayouts: Payout[] = [
  {
    id: 'p1',
    circleId: 'c1',
    memberId: '1',
    amount: 5000,
    currency: 'KES',
    status: 'PENDING',
    initiatedBy: '5',
    scheduledDate: '2026-02-15T10:00:00Z',
    createdAt: '2026-02-14T10:00:00Z',
  },
  {
    id: 'p2',
    circleId: 'c2',
    memberId: '2',
    amount: 10000,
    currency: 'KES',
    status: 'APPROVED',
    initiatedBy: '3',
    approvedBy: '5',
    scheduledDate: '2026-04-01T10:00:00Z',
    createdAt: '2026-03-30T10:00:00Z',
  },
];

export const mockDisputes: Dispute[] = [
  {
    id: 'd1',
    circleId: 'c1',
    raisedBy: '2',
    title: 'Missing contribution record',
    description: 'I contributed on 2026-01-16 but it is not showing in the ledger.',
    status: 'OPEN',
    createdAt: '2026-01-17T08:00:00Z',
    updatedAt: '2026-01-17T08:00:00Z',
  },
];

export const mockLoanProducts: LoanProduct[] = [
  {
    id: 'lp1',
    name: 'Member Quick Loan',
    description: 'Short-term loan for verified members. Up to 6 months.',
    minAmount: 10000,
    maxAmount: 50000,
    minTenor: 1,
    maxTenor: 6,
    interestRate: 12,
    serviceFee: 500,
    eligibilityCriteria: {
      minKycLevel: 1,
      minMemberTier: 'PROFESSIONAL',
    },
    status: 'ACTIVE',
  },
  {
    id: 'lp2',
    name: 'Savings-Backed Loan',
    description: 'Loan secured by your savings circle balance.',
    minAmount: 5000,
    maxAmount: 200000,
    minTenor: 3,
    maxTenor: 12,
    interestRate: 8,
    serviceFee: 1000,
    eligibilityCriteria: {
      minKycLevel: 2,
      minSavingsBalance: 10000,
    },
    status: 'ACTIVE',
  },
  {
    id: 'lp3',
    name: 'Chapter Development Loan',
    description: 'For chapter leaders to fund events and projects.',
    minAmount: 20000,
    maxAmount: 100000,
    minTenor: 6,
    maxTenor: 18,
    interestRate: 10,
    serviceFee: 1500,
    eligibilityCriteria: {
      minKycLevel: 2,
      minMemberTier: 'PROFESSIONAL',
    },
    status: 'PAUSED',
  },
];

export const mockLoanApplications: LoanApplication[] = [
  {
    id: 'la1',
    productId: 'lp1',
    memberId: '1',
    amount: 30000,
    tenor: 3,
    purpose: 'To buy a laptop for my studies.',
    affordabilityNotes: 'I have a part-time job earning KES 15,000/month.',
    guarantorIds: ['2'],
    status: 'UNDER_REVIEW',
    submittedAt: '2026-01-20T09:00:00Z',
    createdAt: '2026-01-19T10:00:00Z',
  },
  {
    id: 'la2',
    productId: 'lp2',
    memberId: '3',
    amount: 50000,
    tenor: 6,
    purpose: 'To expand my small business.',
    affordabilityNotes: 'Monthly net income KES 30,000.',
    guarantorIds: ['1', '5'],
    status: 'OFFERED',
    submittedAt: '2026-01-15T11:00:00Z',
    offer: {
      interestRate: 8,
      totalCost: 62000,
      monthlyPayment: 10333,
      approvedAmount: 50000,
      approvedTenor: 6,
      expiresAt: '2026-02-15T11:00:00Z',
    },
    createdAt: '2026-01-14T10:00:00Z',
  },
];

export const mockLoans: Loan[] = [
  {
    id: 'l1',
    applicationId: 'la2',
    memberId: '3',
    productId: 'lp2',
    principal: 50000,
    interestRate: 8,
    totalCost: 62000,
    disbursedAt: '2026-01-22T10:00:00Z',
    nextDueDate: '2026-02-22T10:00:00Z',
    outstandingBalance: 62000,
    status: 'ACTIVE',
    repayments: [
      {
        id: 'r1',
        loanId: 'l1',
        dueDate: '2026-02-22T10:00:00Z',
        amount: 10333,
        status: 'PENDING',
      },
      {
        id: 'r2',
        loanId: 'l1',
        dueDate: '2026-03-22T10:00:00Z',
        amount: 10333,
        status: 'PENDING',
      },
    ],
  },
];

export const mockGuarantees: Guarantee[] = [
  {
    id: 'g1',
    loanId: 'l1',
    guarantorId: '1',
    borrowerId: '3',
    amount: 50000,
    status: 'ACTIVE',
    createdAt: '2026-01-20T10:00:00Z',
  },
  {
    id: 'g2',
    loanId: 'la1',
    guarantorId: '2',
    borrowerId: '1',
    amount: 30000,
    status: 'PENDING',
    createdAt: '2026-01-20T10:00:00Z',
  },
];

// ============================================================
// R5 – MOCK DATA (Wallet, OTC & Remittance)
// ============================================================

export const mockWalletBalances: WalletBalance[] = [
  { asset: 'USDT', network: 'TRC20', available: 123456, pending: 0 },
  { asset: 'USDT', network: 'ERC20', available: 45678, pending: 1000 },
  { asset: 'USDT', network: 'BEP20', available: 78901, pending: 2500 },
];

export const mockWalletTransactions: WalletTransaction[] = [
  {
    id: 'tx_1',
    type: 'DEPOSIT',
    asset: 'USDT',
    network: 'TRC20',
    amount: 100000,
    fee: 0,
    status: 'CONFIRMED',
    txHash: '0xabc123...',
    confirmations: 12,
    confirmationThreshold: 6,
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'tx_2',
    type: 'WITHDRAWAL',
    asset: 'USDT',
    network: 'ERC20',
    amount: 50000,
    fee: 150,
    status: 'PENDING',
    txHash: undefined,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'tx_3',
    type: 'TRANSFER_IN',
    asset: 'USDT',
    network: null,
    amount: 25000,
    fee: 0,
    status: 'CONFIRMED',
    counterparty: 'Grace Mwangi',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'tx_4',
    type: 'OTC_BUY',
    asset: 'USDT',
    network: 'BEP20',
    amount: 150000,
    fee: 1500,
    status: 'CONFIRMING',
    txHash: '0xdef456...',
    confirmations: 2,
    confirmationThreshold: 6,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: 'tx_5',
    type: 'DEPOSIT',
    asset: 'USDT',
    network: 'TRC20',
    amount: 30000,
    fee: 0,
    status: 'CONFIRMED',
    txHash: '0xghi789...',
    confirmations: 20,
    confirmationThreshold: 6,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
];

export const mockKYCStatus: KYCStatus = {
  tier: 2,
  dailyLimit: 500000,
  dailyUsed: 150000,
  status: 'APPROVED',
};

export const mockOTCRate: OTCRate = {
  pair: 'USDT/KES',
  buyRate: 150.50,
  sellRate: 148.75,
  spread: 1.16,
  lastUpdated: new Date().toISOString(),
};

export const getOTCQuote = (type: 'BUY' | 'SELL', usdtAmount: number): OTCQuote => {
  const rate = type === 'BUY' ? mockOTCRate.buyRate : mockOTCRate.sellRate;
  const total = usdtAmount * rate;
  const fee = Math.round(total * 0.01);
  return {
    id: 'quote-' + Date.now().toString(36),
    type,
    amount: usdtAmount,
    rate,
    fee,
    total: Math.round(total + fee),
    expiresAt: new Date(Date.now() + 1000 * 60 * 5).toISOString(),
    status: 'PENDING',
  };
};

export const mockOTCOrders: OTCOrder[] = [
  {
    id: 'otc-001',
    userId: '1',
    type: 'BUY',
    amount: 100000,
    rate: 150.50,
    total: 15050000,
    fee: 150500,
    status: 'COMPLETED',
    escrowId: 'esc-001',
    matchedWith: 'agent-001',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
  },
  {
    id: 'otc-002',
    userId: '1',
    type: 'SELL',
    amount: 50000,
    rate: 148.75,
    total: 7437500,
    fee: 74375,
    status: 'IN_ESCROW',
    escrowId: 'esc-002',
    matchedWith: 'agent-002',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
  },
  {
    id: 'otc-003',
    userId: '2',
    type: 'BUY',
    amount: 25000,
    rate: 150.25,
    total: 3756250,
    fee: 37562,
    status: 'PENDING',
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
];

export const mockRemittanceCorridors: RemittanceCorridor[] = [
  {
    id: 'corr-001',
    fromCountry: 'Kenya',
    fromCurrency: 'KES',
    toCountry: 'Uganda',
    toCurrency: 'UGX',
    rate: 28.50,
    fee: 3500,
    estimatedDelivery: '2-5 minutes',
    minAmount: 10000,
    maxAmount: 500000,
    status: 'ACTIVE',
    partner: 'MTN MoMo',
  },
  {
    id: 'corr-002',
    fromCountry: 'Kenya',
    fromCurrency: 'KES',
    toCountry: 'Tanzania',
    toCurrency: 'TZS',
    rate: 23.75,
    fee: 4000,
    estimatedDelivery: '5-10 minutes',
    minAmount: 15000,
    maxAmount: 400000,
    status: 'ACTIVE',
    partner: 'Tigo Pesa',
  },
  {
    id: 'corr-003',
    fromCountry: 'Kenya',
    fromCurrency: 'KES',
    toCountry: 'DR Congo',
    toCurrency: 'CDF',
    rate: 2.10,
    fee: 5000,
    estimatedDelivery: '10-30 minutes',
    minAmount: 20000,
    maxAmount: 300000,
    status: 'ACTIVE',
    partner: 'Airtel Money',
  },
  {
    id: 'corr-004',
    fromCountry: 'Kenya',
    fromCurrency: 'KES',
    toCountry: 'Rwanda',
    toCurrency: 'RWF',
    rate: 0.12,
    fee: 3500,
    estimatedDelivery: '2-5 minutes',
    minAmount: 10000,
    maxAmount: 350000,
    status: 'MAINTENANCE',
    partner: 'MTN MoMo',
  },
];

export const mockRemittanceRecipients: RemittanceRecipient[] = [
  {
    id: 'rec-001',
    name: 'Grace Mwangi',
    phone: '+256 712 345 678',
    email: 'grace@example.com',
    country: 'Uganda',
    currency: 'UGX',
    mobileNetwork: 'MTN MoMo',
    relationship: 'FAMILY',
    isSaved: true,
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'rec-002',
    name: 'Daniel Ochieng',
    phone: '+255 723 456 789',
    country: 'Tanzania',
    currency: 'TZS',
    mobileNetwork: 'Tigo Pesa',
    relationship: 'FRIEND',
    isSaved: true,
    createdAt: '2026-02-10T14:30:00Z',
  },
  {
    id: 'rec-003',
    name: 'Faith Akinyi',
    phone: '+243 812 345 678',
    country: 'DR Congo',
    currency: 'CDF',
    mobileNetwork: 'Airtel Money',
    relationship: 'FAMILY',
    isSaved: false,
    createdAt: '2026-03-01T09:00:00Z',
  },
];

export const mockRemittanceTransfers: RemittanceTransfer[] = [
  {
    id: 'rem-001',
    userId: '1',
    corridorId: 'corr-001',
    recipientId: 'rec-001',
    amount: 50000,
    fee: 3500,
    rate: 28.50,
    total: 53500,
    sendCurrency: 'KES',
    receiveAmount: 1425000,
    receiveCurrency: 'UGX',
    status: 'COMPLETED',
    purpose: 'Family support',
    trackingCode: 'TRK-001-2026',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3 + 1000 * 60 * 5).toISOString(),
  },
  {
    id: 'rem-002',
    userId: '1',
    corridorId: 'corr-002',
    recipientId: 'rec-002',
    amount: 30000,
    fee: 4000,
    rate: 23.75,
    total: 34000,
    sendCurrency: 'KES',
    receiveAmount: 712500,
    receiveCurrency: 'TZS',
    status: 'PROCESSING',
    purpose: 'Business payment',
    trackingCode: 'TRK-002-2026',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
  {
    id: 'rem-003',
    userId: '1',
    corridorId: 'corr-003',
    recipientId: 'rec-003',
    amount: 25000,
    fee: 5000,
    rate: 2.10,
    total: 30000,
    sendCurrency: 'KES',
    receiveAmount: 52500,
    receiveCurrency: 'CDF',
    status: 'PENDING',
    purpose: 'School fees',
    trackingCode: 'TRK-003-2026',
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
];

// ---- Helper Functions ----
export const getCorridorById = (id: string) => mockRemittanceCorridors.find(c => c.id === id);
export const getRecipientById = (id: string) => mockRemittanceRecipients.find(r => r.id === id);

// ============================================================
// LAYER 3 – ADMIN CONSOLE (PNL-01)
// ============================================================

// ---- Admin Dashboard Stats ----
export const mockAdminStats: AdminStat[] = [
  {
    id: 'stat-members',
    label: 'Total Members',
    value: '1,247',
    change: '+12.4%',
    trend: 'up',
    icon: 'members',
    href: '/admin/members',
  },
  {
    id: 'stat-applications',
    label: 'Pending Applications',
    value: String(mockApplications.filter((a) => a.status === 'pending').length),
    change: '+3',
    trend: 'up',
    icon: 'applications',
    href: '/admin/applications',
  },
  {
    id: 'stat-chapters',
    label: 'Active Chapters',
    value: String(mockChapters.length),
    change: '+2',
    trend: 'up',
    icon: 'chapters',
    href: '/admin/chapters',
  },
  {
    id: 'stat-revenue',
    label: 'Revenue (Month)',
    value: 'KES 847K',
    change: '+8.2%',
    trend: 'up',
    icon: 'revenue',
    href: '/admin/finance',
  },
];

// ---- Admin Action Queues ----
export const mockQueueDepths: QueueDepth[] = [
  {
    id: 'queue-applications',
    label: 'Applications',
    count: mockApplications.filter((a) => a.status === 'pending').length,
    priority: 'high',
    href: '/admin/applications',
    description: 'Awaiting review',
  },
  {
    id: 'queue-refunds',
    label: 'Refund Approvals',
    count: 8,
    priority: 'high',
    href: '/admin/finance/refunds',
    description: 'Four-eyes required',
  },
  {
    id: 'queue-moderation',
    label: 'Moderation Reports',
    count: 12,
    priority: 'critical',
    href: '/admin/moderation',
    description: 'Pending triage',
  },
  {
    id: 'queue-kyc',
    label: 'KYC Verification',
    count: mockKYCSubmissions.filter((k) => k.status === 'pending').length,
    priority: 'medium',
    href: '/admin/compliance/kyc',
    description: 'Awaiting review',
  },
  {
    id: 'queue-aml',
    label: 'AML Alerts',
    count: 5,
    priority: 'critical',
    href: '/admin/compliance/aml',
    description: 'SLA-tracked',
  },
  {
    id: 'queue-payouts',
    label: 'Payout Approvals',
    count: mockPayouts.filter((p) => p.status === 'PENDING').length,
    priority: 'high',
    href: '/admin/savings/payouts',
    description: 'Four-eyes required',
  },
];

// ---- Admin Recent Activity ----
export const mockAdminRecentActivity: AdminActivityItem[] = [
  {
    id: 'act-1',
    action: 'Application approved',
    actor: 'Solomon A.',
    target: 'Peter Odhiambo — TEG-2026-001',
    timestamp: '2 min ago',
    category: 'member',
  },
  {
    id: 'act-2',
    action: 'Refund approved',
    actor: 'Miriam',
    target: 'Order ord_003 — KES 213.32',
    timestamp: '18 min ago',
    category: 'finance',
  },
  {
    id: 'act-3',
    action: 'KYC submission received',
    actor: 'Peter Odhiambo',
    target: 'kyc_003 — Enhanced tier',
    timestamp: '1 hour ago',
    category: 'compliance',
  },
  {
    id: 'act-4',
    action: 'Payout initiated',
    actor: 'Mary Wanjiru',
    target: 'Nairobi Professional Circle — KES 50.00',
    timestamp: '2 hours ago',
    category: 'finance',
  },
  {
    id: 'act-5',
    action: 'Chapter leader assigned',
    actor: 'Solomon A.',
    target: 'Esther Achieng → Strathmore Chapter',
    timestamp: '3 hours ago',
    category: 'member',
  },
];

// ---- Admin My Tasks ----
export const mockAdminMyTasks: AdminTask[] = [
  {
    id: 'task-1',
    title: 'Review application',
    description: 'Interview completed, decision pending',
    type: 'application',
    priority: 'high',
    dueIn: 'Today',
    entityId: 'TEG-2026-002',
    entityLabel: 'Esther Achieng',
    href: '/admin/applications/TEG-2026-002',
    assignedTo: 'solomon',
  },
  {
    id: 'task-2',
    title: 'Approve refund',
    description: 'Four-eyes approval required',
    type: 'refund',
    priority: 'high',
    dueIn: 'Today',
    entityId: 'ord_003',
    entityLabel: 'KES 213.32 — Faith Akinyi',
    href: '/admin/finance/refunds/ord_003',
    assignedTo: 'miriam',
  },
  {
    id: 'task-3',
    title: 'Triage moderation report',
    description: 'Safeguarding concern flagged',
    type: 'moderation',
    priority: 'critical',
    dueIn: '2 hours',
    entityId: 'RPT-2026-0142',
    entityLabel: 'Reported post',
    href: '/admin/moderation/RPT-2026-0142',
    assignedTo: 'solomon',
  },
  {
    id: 'task-4',
    title: 'Review KYC submission',
    description: 'Documents uploaded, awaiting check',
    type: 'kyc',
    priority: 'medium',
    dueIn: 'Tomorrow',
    entityId: 'kyc_003',
    entityLabel: 'Peter Odhiambo — Enhanced tier',
    href: '/admin/compliance/kyc/kyc_003',
    assignedTo: 'solomon',
  },
  {
    id: 'task-5',
    title: 'Investigate AML alert',
    description: 'Velocity threshold breached',
    type: 'aml',
    priority: 'critical',
    dueIn: 'Within 4 hours',
    entityId: 'AML-2026-0119',
    entityLabel: 'TXN-2026-1129',
    href: '/admin/compliance/aml/AML-2026-0119',
    assignedTo: 'solomon',
  },
  {
    id: 'task-6',
    title: 'Approve savings payout',
    description: 'Circle payout due, four-eyes required',
    type: 'payout',
    priority: 'high',
    dueIn: 'Today',
    entityId: 'p1',
    entityLabel: 'Nairobi Professional Circle — KES 50.00',
    href: '/admin/savings/payouts/p1',
    assignedTo: 'miriam',
  },
];

// ---- Admin Global Search Index ----
export const mockAdminSearchIndex: AdminSearchResult[] = [
  ...mockMembers.map<AdminSearchResult>((m) => ({
    id: `search-member-${m.id}`,
    type: 'member',
    title: `${m.firstName} ${m.lastName}`,
    subtitle: m.memberNumber,
    href: `/admin/members/${m.id}`,
    metadata: `${m.chapter} · ${m.tier} · ${m.status}`,
  })),

  ...mockApplications.map<AdminSearchResult>((a) => ({
    id: `search-application-${a.reference}`,
    type: 'application',
    title: a.reference,
    subtitle: `${a.name} — ${a.status.toUpperCase()}`,
    href: `/admin/applications/${a.reference}`,
    metadata: `${a.tier} · ${a.chapter}`,
  })),

  ...mockOrders.map<AdminSearchResult>((o) => ({
    id: `search-order-${o.id}`,
    type: 'order',
    title: o.id.toUpperCase(),
    subtitle: `${o.currency} ${(o.total / 100).toFixed(2)} — ${o.status}`,
    href: `/admin/finance/orders/${o.id}`,
    metadata: `${o.items.length} item${o.items.length !== 1 ? 's' : ''} · ${o.paymentMethod}`,
  })),

  ...mockPaymentTransactions.map<AdminSearchResult>((t) => ({
    id: `search-transaction-${t.id}`,
    type: 'transaction',
    title: t.id.toUpperCase(),
    subtitle: `${t.currency} ${(t.amount / 100).toFixed(2)} — ${t.status}`,
    href: `/admin/finance/transactions/${t.id}`,
    metadata: `${t.type} · ${t.method}`,
  })),

  ...mockChapters.map<AdminSearchResult>((c) => ({
    id: `search-chapter-${c.code}`,
    type: 'chapter',
    title: c.name,
    subtitle: `${c.code} — ${c.type}`,
    href: `/admin/chapters/${c.code}`,
    metadata: `${c.location} · ${c.memberCount} members`,
  })),

  ...mockCourses.map<AdminSearchResult>((c) => ({
    id: `search-course-${c.id}`,
    type: 'course',
    title: c.title,
    subtitle: `${c.pillar} — ${c.level}`,
    href: `/admin/learning/courses/${c.id}`,
    metadata: `${c.status} · ${c.enrolledCount} enrolled`,
  })),
];

// ---- Admin Search Metadata (for rendering) ----
export const adminSearchLabels: Record<AdminSearchEntityType, string> = {
  member: 'Members',
  application: 'Applications',
  order: 'Orders',
  transaction: 'Transactions',
  chapter: 'Chapters',
  course: 'Courses',
};

export const adminSearchIcons: Record<AdminSearchEntityType, string> = {
  member: '👤',
  application: '📋',
  order: '📦',
  transaction: '💳',
  chapter: '🏛️',
  course: '📚',
};

// ============================================================
// 3. EXPORT ALL (for convenience)
// ============================================================

export const mockData = {
  // ---- Layer 1 & 2 (existing) ----
  members: mockMembers,
  chapters: mockChapters,
  applications: mockApplications,
  announcements: mockAnnouncements,
  notifications: mockNotifications,
  auditLogs: mockAuditLogs,
  chapterActivities,
  events: mockEvents,
  products: mockProducts,
  faq: mockFAQ,
  supportPacks: mockSupportPacks,
  blockedUsers: mockBlockedUsers,

  // ---- R2: Community, Mentorship, Messaging ----
  posts: mockPosts,
  comments: mockComments,
  groups: mockGroups,
  groupMembers: mockGroupMembers,
  groupPosts: mockGroupPosts,
  conversations: mockConversations,
  messages: mockMessages,
  mentors: mockMentors,
  mentorshipRequests: mockMentorshipRequests,
  mentorshipSessions: mockMentorshipSessions,
  meetings: mockMeetings,

  // ---- R2: E-Learning ----
  courses: mockCourses,
  cohorts: mockCohorts,
  enrollments: mockEnrollments,
  cohortMembers: mockCohortMembers,
  lessons: mockLessons,
  lessonProgress: mockLessonProgress,
  quizzes: mockQuizzes,
  assignments: mockAssignments,
  certificates: mockCertificates,

  // ---- R3: Commerce & KYC ----
  orders: mockOrders,
  subscriptions: mockSubscriptions,
  donations: mockDonations,
  kycSubmissions: mockKYCSubmissions,
  paymentTransactions: mockPaymentTransactions,

  // ---- R4: Savings & Credit ----
  circles: mockCircles,
  contributions: mockContributions,
  payouts: mockPayouts,
  disputes: mockDisputes,
  loanProducts: mockLoanProducts,
  loanApplications: mockLoanApplications,
  loans: mockLoans,
  guarantees: mockGuarantees,

  // ---- R5: Wallet ----
  walletBalances: mockWalletBalances,
  walletTransactions: mockWalletTransactions,
  kycStatus: mockKYCStatus,

  // ---- R5: OTC ----
  otcRate: mockOTCRate,
  otcOrders: mockOTCOrders,

  // ---- R5: Remittance ----
  remittanceCorridors: mockRemittanceCorridors,
  remittanceRecipients: mockRemittanceRecipients,
  remittanceTransfers: mockRemittanceTransfers,

  // ---- Layer 3: Admin Console (PNL-01) ----
  adminStats: mockAdminStats,
  queueDepths: mockQueueDepths,
  adminRecentActivity: mockAdminRecentActivity,
  adminMyTasks: mockAdminMyTasks,
  adminSearchIndex: mockAdminSearchIndex,
  adminSearchLabels,
  adminSearchIcons,
};