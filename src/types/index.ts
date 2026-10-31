export type TabType =
  | 'overview'
  | 'projects'
  | 'deliverables'
  | 'invoices'
  | 'simulator'
  | 'concentration'
  | 'trust'
  | 'proposals';

export type UserRole = 'freelancer' | 'team_member' | 'client';
export type Role = UserRole;

export type TransactionStatus = 'Paid' | 'Pending' | 'Review Window Open';

export interface Transaction {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientAvatar: string;
  projectTitle: string;
  amount: number;
  paymentMethod: 'UPI' | 'Direct Transfer' | 'Card';
  status: TransactionStatus;
  date: string;
  upiRef?: string;
  vpa?: string;
  trancheLabel?: string;
  dueDate?: string;
}

export interface MilestoneItem {
  id: string;
  title: string;
  description: string;
  deliverableDate: string;
  amount: number;
  status: 'Completed' | 'In Progress' | 'Upcoming';
}

export interface Proposal {
  id: string;
  title: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientCompany?: string;
  createdAt: string;
  validUntil: string;
  milestones: MilestoneItem[];
  currency: string;
  subtotal: number;
  gstApplicable: boolean;
  gstRate: number; // e.g. 18
  discount: number;
  totalAmount: number;
  signedByClient: boolean;
  clientSignedAt?: string;
  signatureDataUrl?: string;
  status: 'Draft' | 'Sent' | 'Approved' | 'Declined';
}

export interface InvoiceItem {
  id: string;
  description: string;
  hoursOrUnits: number;
  rate: number;
  amount: number;
}

export type PaymentStructure = 'full' | 'advance_delivery' | 'milestones';

export interface InvoiceTranche {
  id: string;
  label: string; // e.g. "Tranche 1: 50% Advance Lock"
  percentage: number;
  amount: number;
  dueDate: string;
  shortUrl: string;
  upiIntentUrl: string;
  status: 'Paid' | 'Pending';
  settledAt?: string;
  upiRef?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientPhone?: string;
  clientVpa: string;
  freelancerVpa: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  gstEnabled: boolean;
  gstNumber?: string;
  discountAmount: number;
  totalPayable: number;
  shortUrl: string;
  upiIntentUrl: string;
  qrCodeUrl?: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  paymentStructure: PaymentStructure;
  tranches: InvoiceTranche[];
}

export interface ClientReviewItem {
  id: string;
  projectId: string;
  projectTitle: string;
  clientName: string;
  clientAvatar: string;
  completionDate: string;
  totalBilled: number;
  isFreelancerReviewSubmitted: boolean;
  isMutualReviewUnlocked: boolean;
  freelancerRatings?: {
    paymentDiscipline: number; // 1-5
    scopeClarity: number;      // 1-5
    cooperation: number;       // 1-5
    notes?: string;
  };
  clientRatings?: {
    craftsmanship: number;     // 1-5
    punctuality: number;       // 1-5
    communication: number;     // 1-5
    testimonial: string;
  };
}

export interface TrustScoreMetrics {
  overallScore: number;
  totalReviews: number;
  verifiedTransactionsCount: number;
  onTimePaymentRate: number; // percentage
  pillars: {
    craftsmanship: { score: number; label: string; count: number };
    punctuality: { score: number; label: string; count: number };
    communication: { score: number; label: string; count: number };
  };
}

// ================= HACKATHON ROADMAP NEW TYPES =================

export type DeliverableStatus =
  | 'Draft'
  | 'Submitted'
  | 'Freelancer Approved'
  | 'Sent to Client'
  | 'Approved'
  | 'Changes Requested';

export interface DeliverableVersion {
  version: string; // e.g. 'v1', 'v2', 'v3'
  link: string; // e.g. 'https://youtu.be/unlisted_cut_v2'
  submittedBy: string;
  submittedAt: string;
  notes: string;
}

export interface DeliverableComment {
  id: string;
  author: string;
  authorRole: UserRole;
  avatar: string;
  text: string;
  timestamp: string;
}

export interface DeliverableItem {
  id: string;
  title: string;
  type?: string; // e.g. "Hero Ad Video Cut", "Figma Design System", "Sound Design & Mix"
  workLink: string;
  currentVersion: string;
  version?: string; // alias
  versions: DeliverableVersion[];
  status: DeliverableStatus | string;
  assignedToName: string;
  assignedToRole: string;
  freeRevisionsLimit: number; // default 2
  revisionsUsed: number;
  billableRevisionsCount: number;
  comments: DeliverableComment[];
  latestComment?: string;
}

export interface ActivityLogItem {
  id: string;
  projectId: string;
  deliverableId?: string;
  person: string;
  role: string;
  action: string;
  detail?: string;
  timestamp: string;
  badgeType?: 'submission' | 'approval' | 'changes' | 'payment' | 'scope';
}
export type ActivityLog = ActivityLogItem;

export interface TeamMember {
  id: string;
  name: string;
  role: string; // e.g. "Video Editor & Motion Designer"
  avatar: string;
  trustMode: 'trusted' | 'needs_approval' | 'approval_required';
  assignedProjectIds: string[];
  activeTasksCount: number;
}

export interface Project {
  id: string;
  title: string;
  clientName: string;
  clientCompany: string;
  clientAvatar?: string;
  clientPhone?: string;
  totalBudget: number;
  budget?: number; // alias
  settledAmount?: number;
  deadline: string; // ISO date 'YYYY-MM-DD'
  status: 'In Progress' | 'Completed' | 'Pending Review' | string;
  totalDeliverables: number;
  completedDeliverables: number;
  deliverables: DeliverableItem[];
  activityLog?: ActivityLogItem[];
  assignedTeamMemberId?: string;
  freeRevisionsTotal?: number;
  freeRevisionsUsed?: number;
  extraScopeAmount?: number;
}

export interface ClientConcentration {
  clientName: string;
  clientAvatar: string;
  clientCompany: string;
  totalRevenue: number;
  percentage: number;
  riskLevel: 'healthy' | 'moderate' | 'high';
}
