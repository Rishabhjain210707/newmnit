/**
 * Utility functions for Indian Rupee (INR) formatting, date formatting,
 * deadline calculations, and UPI payment string generation.
 */

export function formatINR(amount: number | string | undefined | null, compact: boolean = false): string {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return '₹0';
  const num = Number(amount);

  if (compact) {
    if (num >= 10000000) {
      const cr = (num / 10000000).toFixed(2).replace(/\.00$/, '');
      return `₹${cr} Cr`;
    }
    if (num >= 100000) {
      const lakh = (num / 100000).toFixed(2).replace(/\.00$/, '');
      return `₹${lakh} L`;
    }
    if (num >= 1000) {
      const k = (num / 1000).toFixed(1).replace(/\.0$/, '');
      return `₹${k}k`;
    }
  }

  // Format with standard Indian numbering system (2,2,3 grouping)
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatNumberINR(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return '0';
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr || typeof dateStr !== 'string') return 'Nov 2026';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function formatRelativeTime(timestamp?: string | null): string {
  if (!timestamp || typeof timestamp !== 'string') return 'Just now';
  try {
    const diffMs = Date.now() - new Date(timestamp).getTime();
    if (isNaN(diffMs)) return 'Just now';
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  } catch {
    return 'Recently';
  }
}

/**
 * Calculates deadline alert status:
 * - If past simulated current date (2026-10-30): 'Overdue' (Red)
 * - If within 3 days (between 2026-10-30 and 2026-11-02): 'At risk' (Amber)
 * - Otherwise: 'On track' (Emerald)
 */
export function getDeadlineStatus(deadlineStr?: string | null, simulatedTodayStr: string = '2026-10-30'): {
  label: 'Overdue' | 'At risk' | 'On track';
  color: 'red' | 'amber' | 'emerald';
  daysDiff: number;
} {
  if (!deadlineStr) return { label: 'On track', color: 'emerald', daysDiff: 10 };
  try {
    const deadline = new Date(deadlineStr).getTime();
    const today = new Date(simulatedTodayStr).getTime();
    if (isNaN(deadline) || isNaN(today)) return { label: 'On track', color: 'emerald', daysDiff: 10 };

    const diffDays = Math.round((deadline - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: 'Overdue', color: 'red', daysDiff: diffDays };
    }
    if (diffDays <= 3) {
      return { label: 'At risk', color: 'amber', daysDiff: diffDays };
    }
    return { label: 'On track', color: 'emerald', daysDiff: diffDays };
  } catch {
    return { label: 'On track', color: 'emerald', daysDiff: 10 };
  }
}

/**
 * Cash Runway Simulator:
 * Baseline balance: ₹1,20,000, monthly burn ₹60,000 (₹2,000/day)
 * If Kunal delays payment of `delayedAmount` by `delayDays`,
 * calculate remaining runway days.
 */
export function calculateDelayImpact(
  delayedAmount: number = 0,
  delayDays: number = 0,
  baselineBalance: number = 120000,
  monthlyBurn: number = 60000
): {
  baseRunwayDays: number;
  baselineRunwayDays: number;
  projectedRunwayDays: number;
  runwayDaysAfterDelay: number;
  netImpactText: string;
} {
  const safeDelayDays = Math.max(0, Number(delayDays) || 0);
  const dailyBurn = (Number(monthlyBurn) || 60000) / 30; // ₹2,000 / day
  const baseRunwayDays = Math.round((Number(baselineBalance) || 120000) / dailyBurn);

  const cashRemainingAtDelayEnd = Math.max(0, baselineBalance - safeDelayDays * dailyBurn);
  const projectedRunwayDays = Math.round(cashRemainingAtDelayEnd / dailyBurn);

  return {
    baseRunwayDays,
    baselineRunwayDays: baseRunwayDays,
    projectedRunwayDays,
    runwayDaysAfterDelay: projectedRunwayDays,
    netImpactText: `drops from ${baseRunwayDays} days to ${projectedRunwayDays} days`,
  };
}

export function generateUPILink(params?: {
  vpa?: string;
  name?: string;
  amount?: number;
  note?: string;
  transactionRef?: string;
}): string {
  const vpa = params?.vpa || '9079879010@fam';
  const name = params?.name || 'Arjun Verma';
  const amount = Number(params?.amount) || 0;
  const note = params?.note || 'SoloFlow Milestone Settlement';
  const transactionRef = params?.transactionRef || 'PF' + Math.floor(100000 + Math.random() * 900000);

  const encodedName = encodeURIComponent(name);
  const encodedNote = encodeURIComponent(note);
  return `upi://pay?pa=${vpa}&pn=${encodedName}&am=${amount.toFixed(2)}&cu=INR&tn=${encodedNote}&tr=${transactionRef}`;
}

export function generateWhatsAppShareUrl(phone?: string | null, text?: string | null): string {
  const safePhone = typeof phone === 'string' ? phone : (phone ? String(phone) : '');
  const cleanPhone = safePhone ? safePhone.replace(/[^0-9]/g, '') : '';
  const encodedText = encodeURIComponent(text || '');

  if (cleanPhone) {
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
  }
  return `https://api.whatsapp.com/send?text=${encodedText}`;
}

export function getAppBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }
  return 'http://localhost:3000';
}
