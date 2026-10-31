'use client';

import React from 'react';

export type IconProps = React.SVGProps<SVGSVGElement> & {
  className?: string;
  filled?: boolean;
};

const DefaultSvg: React.FC<IconProps> = ({ className = 'w-4 h-4', children, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {children}
  </svg>
);

export const Icons = {
  Rupee: ({ className = 'w-4 h-4', ...props }: IconProps) => (
    <DefaultSvg className={className} {...props}>
      <path d="M6 3h12M6 8h12M6 13l8.5 8M6 13h3a4 4 0 0 0 0-8" />
    </DefaultSvg>
  ),
  Plus: ({ className = 'w-4 h-4', ...props }: IconProps) => (
    <DefaultSvg className={className} {...props}>
      <path d="M5 12h14M12 5v14" />
    </DefaultSvg>
  ),
  Check: ({ className = 'w-4 h-4', ...props }: IconProps) => (
    <DefaultSvg className={className} {...props}>
      <polyline points="20 6 9 17 4 12" />
    </DefaultSvg>
  ),
  CheckCircle2: ({ className = 'w-4 h-4', ...props }: IconProps) => (
    <DefaultSvg className={className} {...props}>
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </DefaultSvg>
  ),
  Copy: ({ className = 'w-4 h-4', ...props }: IconProps) => (
    <DefaultSvg className={className} {...props}>
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </DefaultSvg>
  ),
  Trash: ({ className = 'w-4 h-4', ...props }: IconProps) => (
    <DefaultSvg className={className} {...props}>
      <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </DefaultSvg>
  ),
  Clock: ({ className = 'w-4 h-4', ...props }: IconProps) => (
    <DefaultSvg className={className} {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </DefaultSvg>
  ),
  FileText: ({ className = 'w-4 h-4', ...props }: IconProps) => (
    <DefaultSvg className={className} {...props}>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8M16 13H8M16 17H8" />
    </DefaultSvg>
  ),
  ShieldCheck: ({ className = 'w-4 h-4', ...props }: IconProps) => (
    <DefaultSvg className={className} {...props}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </DefaultSvg>
  ),
  Star: ({ className = 'w-4 h-4', filled = false, ...props }: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Search: ({ className = 'w-4 h-4', ...props }: IconProps) => (
    <DefaultSvg className={className} {...props}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </DefaultSvg>
  ),
  Sparkles: ({ className = 'w-4 h-4', ...props }: IconProps) => (
    <DefaultSvg className={className} {...props}>
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
    </DefaultSvg>
  ),
  Share2: ({ className = 'w-4 h-4', ...props }: IconProps) => (
    <DefaultSvg className={className} {...props}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
      <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
    </DefaultSvg>
  ),
  ArrowUpRight: ({ className = 'w-4 h-4', ...props }: IconProps) => (
    <DefaultSvg className={className} {...props}>
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </DefaultSvg>
  ),
  PenTool: ({ className = 'w-4 h-4', ...props }: IconProps) => (
    <DefaultSvg className={className} {...props}>
      <path d="M12 19l7-7 3 3-7 7-3-3z" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <circle cx="11" cy="11" r="2" />
    </DefaultSvg>
  ),
  WhatsApp: ({ className = 'w-4 h-4', ...props }: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.67 12.05 3.67Z" />
    </svg>
  ),
  Users: ({ className = 'w-4 h-4', ...props }: IconProps) => (
    <DefaultSvg className={className} {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </DefaultSvg>
  ),
  User: ({ className = 'w-4 h-4', ...props }: IconProps) => (
    <DefaultSvg className={className} {...props}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </DefaultSvg>
  ),
  Sliders: ({ className = 'w-4 h-4', ...props }: IconProps) => (
    <DefaultSvg className={className} {...props}>
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </DefaultSvg>
  ),
  AlertTriangle: ({ className = 'w-4 h-4', ...props }: IconProps) => (
    <DefaultSvg className={className} {...props}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </DefaultSvg>
  ),
  Play: ({ className = 'w-4 h-4', ...props }: IconProps) => (
    <DefaultSvg className={className} {...props}>
      <polygon points="5 3 19 12 5 21 5 3" />
    </DefaultSvg>
  ),
  Link2: ({ className = 'w-4 h-4', ...props }: IconProps) => (
    <DefaultSvg className={className} {...props}>
      <path d="M9 17H7A5 5 0 0 1 7 7h2" />
      <path d="M15 7h2a5 5 0 1 1 0 10h-2" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </DefaultSvg>
  ),
  History: ({ className = 'w-4 h-4', ...props }: IconProps) => (
    <DefaultSvg className={className} {...props}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </DefaultSvg>
  ),
  MessageSquare: ({ className = 'w-4 h-4', ...props }: IconProps) => (
    <DefaultSvg className={className} {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </DefaultSvg>
  ),
  Lock: ({ className = 'w-4 h-4', ...props }: IconProps) => (
    <DefaultSvg className={className} {...props}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </DefaultSvg>
  ),
  Unlock: ({ className = 'w-4 h-4', ...props }: IconProps) => (
    <DefaultSvg className={className} {...props}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </DefaultSvg>
  ),
  X: ({ className = 'w-4 h-4', ...props }: IconProps) => (
    <DefaultSvg className={className} {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </DefaultSvg>
  ),
  TrendingUp: ({ className = 'w-4 h-4', ...props }: IconProps) => (
    <DefaultSvg className={className} {...props}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </DefaultSvg>
  ),
  Calendar: ({ className = 'w-4 h-4', ...props }: IconProps) => (
    <DefaultSvg className={className} {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </DefaultSvg>
  ),
  Send: ({ className = 'w-4 h-4', ...props }: IconProps) => (
    <DefaultSvg className={className} {...props}>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </DefaultSvg>
  ),
  Dashboard: ({ className = 'w-4 h-4', ...props }: IconProps) => (
    <DefaultSvg className={className} {...props}>
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </DefaultSvg>
  ),
  QrCode: ({ className = 'w-4 h-4', ...props }: IconProps) => (
    <DefaultSvg className={className} {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="3" height="3" />
      <rect x="18" y="18" width="3" height="3" />
      <rect x="14" y="18" width="2" height="2" />
      <rect x="18" y="14" width="2" height="2" />
      <path d="M7 7h.01M17 7h.01M7 17h.01" strokeWidth={2.5} strokeLinecap="round" />
    </DefaultSvg>
  ),
};

export const {
  Rupee,
  Plus,
  Check,
  CheckCircle2,
  Copy,
  Trash,
  Clock,
  FileText,
  ShieldCheck,
  Star,
  Search,
  Sparkles,
  Share2,
  ArrowUpRight,
  PenTool,
  WhatsApp,
  Users,
  User,
  Sliders,
  AlertTriangle,
  Play,
  Link2,
  History,
  MessageSquare,
  Lock,
  Unlock,
  X,
  TrendingUp,
  Calendar,
  Send,
  Dashboard,
  QrCode,
} = Icons;

export default Icons;
