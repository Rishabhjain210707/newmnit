import {
  Transaction,
  Proposal,
  Invoice,
  ClientReviewItem,
  TrustScoreMetrics,
  Project,
  TeamMember,
  ClientConcentration,
} from '../types';

export const mockFreelancerProfile = {
  name: 'Arjun Verma',
  handle: '@arjunv_design',
  role: 'Lead Creative Director & Design Engineer',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  upiId: '9079879010@fam',
  panNumber: 'ABCDE1234F',
  gstNumber: '29ABCDE1234F1Z5',
  verifiedBadge: true,
  city: 'Bengaluru, India',
  joinedYear: 2023,
  completedProjectsCount: 42,
  reputationUrl: '/#trust',
};

export const mockTeamMembers: TeamMember[] = [
  {
    id: 'member_rohan',
    name: 'Rohan Mehta',
    role: 'Video Editor & Motion Designer',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    trustMode: 'needs_approval', // Can be toggled to 'trusted'
    assignedProjectIds: ['proj_cred_video'],
    activeTasksCount: 2,
  },
  {
    id: 'member_priya',
    name: 'Priya Nair',
    role: 'Sound Designer & Colorist',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    trustMode: 'trusted',
    assignedProjectIds: ['proj_cred_video', 'proj_finly'],
    activeTasksCount: 1,
  },
];

export const mockProjects: Project[] = [
  {
    id: 'proj_cred_video',
    title: 'CRED Pulse: 30s Brand Video & Interactive Motion Teaser',
    clientName: 'Kunal Shah',
    clientCompany: 'CRED Technologies',
    clientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    clientPhone: '+91 90798 79010',
    totalBudget: 1250000, // ₹12.5 Lakhs (Over 60% concentration!)
    settledAmount: 500000,
    deadline: '2026-11-01', // Within 2 days of simulated today (2026-10-30) -> "At risk"
    status: 'In Progress',
    totalDeliverables: 4,
    completedDeliverables: 2, // 50%
    assignedTeamMemberId: 'member_rohan',
    deliverables: [
      {
        id: 'del_01',
        title: 'Hero 30s Ad Cut & Color Grade',
        type: 'Ad Video Cut',
        workLink: 'https://youtu.be/unlisted_cred_hero_v2',
        currentVersion: 'v2',
        status: 'Submitted', // Waiting for freelancer Arjun's review!
        assignedToName: 'Rohan Mehta',
        assignedToRole: 'Video Editor',
        freeRevisionsLimit: 2,
        revisionsUsed: 1,
        billableRevisionsCount: 0,
        versions: [
          {
            version: 'v1',
            link: 'https://youtu.be/unlisted_cred_hero_v1',
            submittedBy: 'Rohan Mehta',
            submittedAt: '2026-10-27 14:30',
            notes: 'First rough assembly cut with guide voiceover and proxy music.',
          },
          {
            version: 'v2',
            link: 'https://youtu.be/unlisted_cred_hero_v2',
            submittedBy: 'Rohan Mehta',
            submittedAt: '2026-10-30 11:15',
            notes: 'Color graded in DaVinci with sound sync. Ready for lead sign-off.',
          },
        ],
        comments: [
          {
            id: 'comm_1',
            author: 'Kunal Shah',
            authorRole: 'client',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80',
            text: 'Love the transition at 0:12! Can we tighten the ending logo lockup by 1.5 seconds?',
            timestamp: 'Yesterday at 5:40 PM',
          },
          {
            id: 'comm_2',
            author: 'Rohan Mehta',
            authorRole: 'team_member',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80',
            text: 'Updated in v2! Added quick whoosh transition and tightened logo frame.',
            timestamp: 'Today at 11:18 AM',
          },
        ],
      },
      {
        id: 'del_02',
        title: 'Sound Design & Spatial 5.1 Stems',
        type: 'Audio Master',
        workLink: 'https://drive.google.com/cred_spatial_audio_v1',
        currentVersion: 'v1',
        status: 'Draft',
        assignedToName: 'Priya Nair',
        assignedToRole: 'Sound Designer',
        freeRevisionsLimit: 2,
        revisionsUsed: 0,
        billableRevisionsCount: 0,
        versions: [
          {
            version: 'v1',
            link: 'https://drive.google.com/cred_spatial_audio_v1',
            submittedBy: 'Priya Nair',
            submittedAt: '2026-10-29 18:00',
            notes: 'Bass drop master with haptic rumble sync.',
          },
        ],
        comments: [],
      },
      {
        id: 'del_03',
        title: 'Figma Motion Guidelines & Token Specs',
        type: 'Design System',
        workLink: 'https://figma.com/file/cred_motion_specs_v3',
        currentVersion: 'v3',
        status: 'Approved',
        assignedToName: 'Arjun Verma',
        assignedToRole: 'Lead',
        freeRevisionsLimit: 2,
        revisionsUsed: 2,
        billableRevisionsCount: 0,
        versions: [
          {
            version: 'v1',
            link: 'https://figma.com/file/cred_v1',
            submittedBy: 'Arjun Verma',
            submittedAt: '2026-10-20 10:00',
            notes: 'Initial token architecture.',
          },
          {
            version: 'v2',
            link: 'https://figma.com/file/cred_v2',
            submittedBy: 'Arjun Verma',
            submittedAt: '2026-10-24 16:00',
            notes: 'Added dark mode tokens.',
          },
          {
            version: 'v3',
            link: 'https://figma.com/file/cred_v3',
            submittedBy: 'Arjun Verma',
            submittedAt: '2026-10-28 12:00',
            notes: 'Final client approved spec.',
          },
        ],
        comments: [
          {
            id: 'comm_3',
            author: 'Kunal Shah',
            authorRole: 'client',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80',
            text: 'Flawless execution. Tokens plugged straight into our iOS repo.',
            timestamp: '28 Oct at 2:15 PM',
          },
        ],
      },
      {
        id: 'del_04',
        title: '15s Vertical Cutdown for Instagram Reel',
        type: 'Social Cut',
        workLink: 'https://youtu.be/unlisted_cred_15s_v2',
        currentVersion: 'v2',
        status: 'Changes Requested', // 2/2 free used! Scope creep warning threshold!
        assignedToName: 'Rohan Mehta',
        assignedToRole: 'Video Editor',
        freeRevisionsLimit: 2,
        revisionsUsed: 2, // Reached limit!
        billableRevisionsCount: 0,
        versions: [
          {
            version: 'v1',
            link: 'https://youtu.be/unlisted_cred_15s_v1',
            submittedBy: 'Rohan Mehta',
            submittedAt: '2026-10-25 15:00',
            notes: 'First vertical 9:16 cut.',
          },
          {
            version: 'v2',
            link: 'https://youtu.be/unlisted_cred_15s_v2',
            submittedBy: 'Rohan Mehta',
            submittedAt: '2026-10-29 17:00',
            notes: 'Revision 2: Re-paced hook.',
          },
        ],
        comments: [
          {
            id: 'comm_4',
            author: 'Kunal Shah',
            authorRole: 'client',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80',
            text: 'Brand team wants a different opening hook and alternate ending CTA.',
            timestamp: '29 Oct at 7:30 PM',
          },
        ],
      },
    ],
    activityLog: [
      {
        id: 'act_1',
        projectId: 'proj_cred_video',
        deliverableId: 'del_01',
        person: 'Rohan Mehta',
        role: 'Editor',
        action: 'submitted v2 [YouTube Link]',
        detail: 'Color graded cut with spatial sound mix.',
        timestamp: 'Today, 11:15 AM',
        badgeType: 'submission',
      },
      {
        id: 'act_2',
        projectId: 'proj_cred_video',
        deliverableId: 'del_04',
        person: 'Kunal Shah',
        role: 'Client',
        action: 'requested revisions on 15s Cutdown',
        detail: 'Requested new opening hook (Free revision 2/2 used).',
        timestamp: 'Yesterday, 07:30 PM',
        badgeType: 'changes',
      },
      {
        id: 'act_3',
        projectId: 'proj_cred_video',
        deliverableId: 'del_03',
        person: 'Arjun Verma',
        role: 'Freelancer',
        action: 'approved v3 Figma Tokens',
        detail: 'Milestone 2 deliverable verified & locked.',
        timestamp: '28 Oct, 02:20 PM',
        badgeType: 'approval',
      },
      {
        id: 'act_4',
        projectId: 'proj_cred_video',
        person: 'NPCI / HDFC Bank',
        role: 'UPI Rail',
        action: 'Settled Tranche 1 (50% Advance): ₹5,00,000',
        detail: 'UPI Ref: HDFC928172938491 settled directly.',
        timestamp: '26 Oct, 10:14 AM',
        badgeType: 'payment',
      },
    ],
  },
  {
    id: 'proj_finly',
    title: 'Fintech Dashboard Redesign & Multi-Currency Flow',
    clientName: 'Neha Singhal',
    clientCompany: 'Finly.io',
    clientAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    clientPhone: '+91 98111 22334',
    totalBudget: 380000,
    settledAmount: 180000,
    deadline: '2026-10-26', // Past date -> "Overdue" (Red badge)
    status: 'In Progress',
    totalDeliverables: 3,
    completedDeliverables: 1, // 33%
    deliverables: [
      {
        id: 'del_finly_1',
        title: 'Multi-Currency Flow Wireframes',
        type: 'UX Wireframes',
        workLink: 'https://figma.com/file/finly_wires',
        currentVersion: 'v1',
        status: 'Approved',
        assignedToName: 'Arjun Verma',
        assignedToRole: 'Lead',
        freeRevisionsLimit: 2,
        revisionsUsed: 1,
        billableRevisionsCount: 0,
        versions: [],
        comments: [],
      },
      {
        id: 'del_finly_2',
        title: 'FX Conversion Calculator Component',
        type: 'React Code',
        workLink: 'https://github.com/finly/fx-calc',
        currentVersion: 'v2',
        status: 'Sent to Client',
        assignedToName: 'Arjun Verma',
        assignedToRole: 'Lead',
        freeRevisionsLimit: 2,
        revisionsUsed: 0,
        billableRevisionsCount: 0,
        versions: [],
        comments: [],
      },
      {
        id: 'del_finly_3',
        title: 'Stripe Settlement Flow Audit',
        type: 'Audit Document',
        workLink: 'https://docs.google.com/finly_audit',
        currentVersion: 'v1',
        status: 'Draft',
        assignedToName: 'Arjun Verma',
        assignedToRole: 'Lead',
        freeRevisionsLimit: 2,
        revisionsUsed: 0,
        billableRevisionsCount: 0,
        versions: [],
        comments: [],
      },
    ],
    activityLog: [
      {
        id: 'act_f1',
        projectId: 'proj_finly',
        person: 'Arjun Verma',
        role: 'Freelancer',
        action: 'sent v2 FX Calculator for client review',
        timestamp: '25 Oct, 03:00 PM',
        badgeType: 'submission',
      },
    ],
  },
  {
    id: 'proj_aura',
    title: 'Telemedicine Patient Booking & Video Consultation UX',
    clientName: 'Pooja Iyer',
    clientCompany: 'Aura Health',
    clientAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    clientPhone: '+91 97665 43210',
    totalBudget: 250000,
    settledAmount: 250000,
    deadline: '2026-11-20', // Plenty of time -> "On track" (Emerald)
    status: 'Completed',
    totalDeliverables: 3,
    completedDeliverables: 3, // 100%
    deliverables: [],
    activityLog: [],
  },
];

export const mockClientConcentration: ClientConcentration[] = [
  {
    clientName: 'Kunal Shah',
    clientCompany: 'CRED Technologies',
    clientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    totalRevenue: 1250000,
    percentage: 66.5, // 12.5L / 18.8L = 66.5% -> RED alert (>60%)
    riskLevel: 'high',
  },
  {
    clientName: 'Neha Singhal',
    clientCompany: 'Finly.io',
    clientAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    totalRevenue: 380000,
    percentage: 20.2, // Green (<40%)
    riskLevel: 'healthy',
  },
  {
    clientName: 'Pooja Iyer',
    clientCompany: 'Aura Health',
    clientAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    totalRevenue: 250000,
    percentage: 13.3, // Green (<40%)
    riskLevel: 'healthy',
  },
];

export const mockMetrics = {
  totalSettledRevenue: 1485000, // ₹14,85,000 (14.85 Lakhs)
  settledGrowthPercent: '+18.4%',
  pendingInvoicesCount: 3,
  pendingInvoicesAmount: 182500, // ₹1,82,500
  activeProjectsCount: 3,
  verifiedTrustScore: 4.92,
  maxTrustScore: 5.0,
  trustReviewsCount: 38,
  onTimePaymentRate: 98,
};

export const mockTransactions: Transaction[] = [
  {
    id: 'tx_01',
    invoiceNumber: 'INV-2026-089',
    clientName: 'Kunal Shah',
    clientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    projectTitle: 'CRED Pulse: 30s Brand Video (Tranche 1: 50% Advance)',
    amount: 145000,
    paymentMethod: 'UPI',
    status: 'Paid',
    date: '2026-10-28',
    upiRef: 'UPI/239019284719/CRED',
    vpa: 'kunal@cred',
    trancheLabel: '50% Advance Lock',
  },
  {
    id: 'tx_02',
    invoiceNumber: 'INV-2026-090',
    clientName: 'Neha Singhal (Finly.io)',
    clientAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    projectTitle: 'Fintech Dashboard Redesign & Multi-Currency Flow',
    amount: 85000,
    paymentMethod: 'UPI',
    status: 'Review Window Open',
    date: '2026-10-29',
    upiRef: 'UPI/884910294812/AXIS',
    vpa: 'neha@axisbank',
  },
  {
    id: 'tx_03',
    invoiceNumber: 'INV-2026-085',
    clientName: 'Neha Singhal (Finly.io)',
    clientAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    projectTitle: 'Multi-Currency Flow Audit (Milestone 2 - Overdue)',
    amount: 97500,
    paymentMethod: 'UPI',
    status: 'Pending',
    date: '2026-10-25',
    dueDate: '2026-10-25', // Overdue by 5 days!
    vpa: 'neha@axisbank',
  },
  {
    id: 'tx_04',
    invoiceNumber: 'INV-2026-092',
    clientName: 'Kunal Shah',
    clientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    projectTitle: 'CRED Pulse: Tranche 2 (Final Delivery & Master Cut)',
    amount: 145000,
    paymentMethod: 'UPI',
    status: 'Pending',
    date: '2026-10-30',
    dueDate: '2026-11-04',
    vpa: 'kunal@cred',
    trancheLabel: '50% on Final Delivery',
  },
];

export const mockInitialProposal: Proposal = {
  id: 'prop_2026_01',
  title: 'CRED Pulse: 30s Brand Video & Interactive Motion Teaser',
  clientName: 'Kunal Shah',
  clientEmail: 'kunal@cred.club',
  clientPhone: '+91 90798 79010',
  clientCompany: 'CRED Technologies Pvt Ltd',
  createdAt: '2026-10-30',
  validUntil: '2026-11-15',
  currency: 'INR',
  milestones: [
    {
      id: 'ms_1',
      title: 'Milestone 1: 50% Advance Lock & Storyboard Direction',
      description: 'Color script, storyboard animatics, and sound design scratch track.',
      deliverableDate: '2026-11-04',
      amount: 625000,
      status: 'In Progress',
    },
    {
      id: 'ms_2',
      title: 'Milestone 2: Final 4K DaVinci Grade & Spatial Audio Stems',
      description: 'Clean ProRes 4444 master, Instagram 9:16 cut, and complete stem pack.',
      deliverableDate: '2026-11-15',
      amount: 625000,
      status: 'Upcoming',
    },
  ],
  subtotal: 1250000,
  gstApplicable: true,
  gstRate: 18,
  discount: 25000,
  totalAmount: 1445500,
  signedByClient: false,
  status: 'Sent',
};

export const mockProposals: Proposal[] = [mockInitialProposal];

export const mockInitialInvoice: Invoice = {
  id: 'inv_1042',
  invoiceNumber: 'INV-2026-1042',
  clientName: 'Kunal Shah (CRED Technologies)',
  clientPhone: '+91 90798 79010',
  clientVpa: 'kunal@cred',
  freelancerVpa: '9079879010@fam',
  dueDate: '2026-11-04',
  paymentStructure: 'advance_delivery', // Default 50-50 split
  items: [
    {
      id: 'item_1',
      description: 'CRED Pulse Brand Ad Cut (30s) + Color Grade Master',
      hoursOrUnits: 1,
      rate: 95000,
      amount: 95000,
    },
    {
      id: 'item_2',
      description: 'Spatial 5.1 Sound Design & Audio Stems',
      hoursOrUnits: 1,
      rate: 30000,
      amount: 30000,
    },
  ],
  subtotal: 125000,
  gstEnabled: true,
  gstNumber: '29ABCDE1234F1Z5',
  discountAmount: 5000,
  totalPayable: 141600, // (125000 - 5000) * 1.18 = 141600
  shortUrl: '/pay/inv_1042',
  upiIntentUrl: 'upi://pay?pa=9079879010@fam&pn=Arjun%20Verma&am=141600.00&cu=INR&tn=Invoice%20INV-2026-1042',
  status: 'Pending',
  tranches: [
    {
      id: 'tranche_1',
      label: 'Tranche 1: 50% Advance Lock',
      percentage: 50,
      amount: 70800,
      dueDate: '2026-10-31',
      shortUrl: '/pay/inv_1042_t1',
      upiIntentUrl: 'upi://pay?pa=9079879010@fam&pn=Arjun%20Verma&am=70800.00&cu=INR&tn=Invoice%201042%20Tranche1',
      status: 'Paid',
      settledAt: '2026-10-30',
      upiRef: 'UPI/998127391823/HDFC',
    },
    {
      id: 'tranche_2',
      label: 'Tranche 2: 50% on Final Delivery',
      percentage: 50,
      amount: 70800,
      dueDate: '2026-11-08',
      shortUrl: '/pay/inv_1042_t2',
      upiIntentUrl: 'upi://pay?pa=9079879010@fam&pn=Arjun%20Verma&am=70800.00&cu=INR&tn=Invoice%201042%20Tranche2',
      status: 'Pending',
    },
  ],
};

export const mockTrustMetrics: TrustScoreMetrics = {
  overallScore: 4.92,
  totalReviews: 38,
  verifiedTransactionsCount: 42,
  onTimePaymentRate: 98,
  pillars: {
    craftsmanship: {
      score: 4.95,
      label: 'Product Craftsmanship & Quality',
      count: 38,
    },
    punctuality: {
      score: 4.89,
      label: 'Deadline Punctuality',
      count: 38,
    },
    communication: {
      score: 4.93,
      label: 'Communication & Revisions',
      count: 38,
    },
  },
};

export const mockPendingClientReviews: ClientReviewItem[] = [
  {
    id: 'rev_pending_01',
    projectId: 'proj_finly',
    projectTitle: 'Fintech Dashboard Redesign & Multi-Currency Flow',
    clientName: 'Neha Singhal (Finly.io)',
    clientAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    completionDate: '2026-10-29',
    totalBilled: 85000,
    isFreelancerReviewSubmitted: false,
    isMutualReviewUnlocked: false,
  },
  {
    id: 'rev_pending_02',
    projectId: 'proj_cred_video',
    projectTitle: 'CRED Pulse: 30s Brand Video & Interactive Motion Teaser',
    clientName: 'Kunal Shah',
    clientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    completionDate: '2026-10-28',
    totalBilled: 145000,
    isFreelancerReviewSubmitted: true,
    isMutualReviewUnlocked: true,
    freelancerRatings: {
      paymentDiscipline: 5,
      scopeClarity: 5,
      cooperation: 5,
      notes: 'Seamless payment settled via UPI in under 12 minutes upon milestone completion.',
    },
    clientRatings: {
      craftsmanship: 5,
      punctuality: 5,
      communication: 5,
      testimonial:
        'Arjun and team delivered high-velocity perfection on our brand video. Figma specs were flawless and Rohan’s DaVinci color grading was world class.',
    },
  },
];

export const initialProjects = mockProjects;
export const initialTeamMembers = mockTeamMembers;
export const initialActivityLogs = mockProjects[0]?.activityLog || [];
