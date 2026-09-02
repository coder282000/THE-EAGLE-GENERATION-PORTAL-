// components/mock/data.ts

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

// ===== NEW: Event Interface =====
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // ISO
  endDate?: string;
  location: string;
  type: 'summit' | 'workshop' | 'networking' | 'training' | 'other';
  capacity: number;
  registered: number;
  price: number; // in KES, 0 for free
  image?: string;
  status: 'upcoming' | 'past' | 'cancelled';
  registrationDeadline?: string;
}

// ---- Mock Data ----

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

export const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Annual Leadership Summit 2026',
    content: 'Join us for the Annual Leadership Summit on June 15-17. Keynote speakers include...',
    priority: 'HIGH',
    createdAt: '2026-02-28T10:00:00Z',
    author: 'Admin',
  },
  {
    id: '2',
    title: 'New Chapter Launch – Eldoret',
    content: 'We are excited to announce a new chapter in Eldoret. Kickoff meeting on March 5.',
    priority: 'MEDIUM',
    createdAt: '2026-02-25T14:30:00Z',
    author: 'Admin',
  },
  {
    id: '3',
    title: 'Mentorship Program Call for Mentors',
    content: 'We are looking for experienced Eagles to mentor Rising members. Apply by March 10.',
    priority: 'HIGH',
    createdAt: '2026-02-20T09:15:00Z',
    author: 'Admin',
  },
  {
    id: '4',
    title: 'Tech Workshop: AI for Good',
    content: 'Free workshop on applying AI to social challenges. Saturday, March 12.',
    priority: 'MEDIUM',
    createdAt: '2026-02-18T16:45:00Z',
    author: 'Admin',
  },
  {
    id: '5',
    title: 'Chapter Leader Orientation',
    content: 'All chapter leaders must attend the online orientation on March 3 at 7 PM EAT.',
    priority: 'HIGH',
    createdAt: '2026-02-15T11:00:00Z',
    author: 'Admin',
  },
  {
    id: '6',
    title: 'Eagle Generation Podcast Launches',
    content: 'Our new podcast featuring interviews with Kingdom leaders is now live on all platforms. Tune in to Spotify, Apple Podcasts, and YouTube.',
    priority: 'MEDIUM',
    createdAt: '2026-02-10T08:30:00Z',
    author: 'Admin',
  },
  {
    id: '7',
    title: 'Call for Proposals: Annual Conference 2026',
    content: 'We invite members to submit proposals for workshops, panel discussions, and talks at the annual conference. Submission deadline: March 31.',
    priority: 'LOW',
    createdAt: '2026-02-05T13:00:00Z',
    author: 'Admin',
  },
  {
    id: '8',
    title: 'Volunteer Opportunity: Community Outreach',
    content: 'We are looking for volunteers to lead community outreach programs in Nairobi and Kisumu. Training provided. Sign up by March 15.',
    priority: 'HIGH',
    createdAt: '2026-01-28T10:00:00Z',
    author: 'Admin',
  },
];

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

// ===== NEW: Mock Events =====
export const mockEvents: Event[] = [
  {
    id: 'evt-001',
    title: 'Annual Leadership Summit 2026',
    description: 'Join us for the annual gathering of Eagles from across East Africa. Keynote speakers, workshops, and networking.',
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
    description: 'Free hands-on workshop exploring AI applications for social impact. No prior experience required.',
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
    description: 'Professional networking event for members in the Nairobi area. Connect with peers and mentors.',
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
    description: 'Training session for all chapter leaders. Learn best practices, platform updates, and leadership skills.',
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