'use client';

import React, { useState } from 'react';
import { Invoice, InvoiceItem, InvoiceTranche, PaymentStructure, UserRole } from '../../types';
import { formatINR, generateUPILink, generateWhatsAppShareUrl, getAppBaseUrl } from '../../utils/formatters';
import { Icons } from '../ui/Icons';
import { mockFreelancerProfile, mockInitialInvoice } from '../../data/mockData';

interface UPIInvoiceViewProps {
  initialInvoice?: Invoice;
  invoiceNumber?: string;
  clientName?: string;
  clientPhone?: string;
  clientVPA?: string;
  totalAmount?: number;
  initialTranches?: any[];
  onPaymentSettled?: (invoice: Invoice, settledTrancheId?: string) => void;
  onInvoiceChange?: (updatedInvoice: Invoice) => void;
  currentUserRole?: UserRole;
  onBackToDashboard?: () => void;
  transactions?: any; // For backward compatibility
}

export const UPIInvoiceView: React.FC<UPIInvoiceViewProps> = (props) => {
  const {
    initialInvoice,
    invoiceNumber,
    clientName,
    clientPhone: propClientPhone,
    clientVPA,
    totalAmount,
    initialTranches,
    onPaymentSettled,
    onInvoiceChange,
    currentUserRole = 'freelancer',
    onBackToDashboard,
  } = props;

  const baseInvoice: Invoice = initialInvoice || {
    ...mockInitialInvoice,
    invoiceNumber: invoiceNumber || mockInitialInvoice.invoiceNumber,
    clientName: clientName || mockInitialInvoice.clientName,
    clientPhone: propClientPhone || mockInitialInvoice.clientPhone || '+91 90798 79010',
    clientVpa: clientVPA || mockInitialInvoice.clientVpa,
    totalPayable: totalAmount || mockInitialInvoice.totalPayable,
    subtotal: totalAmount || mockInitialInvoice.subtotal,
  };

  const [invoice, setInvoice] = useState<Invoice>(baseInvoice);
  const [clientPhone, setClientPhone] = useState<string>(
    baseInvoice.clientPhone || propClientPhone || '+91 90798 79010'
  );
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [copiedTrancheId, setCopiedTrancheId] = useState<string | null>(null);

  // Selected tranche for QR preview & link sharing (default to first pending or tranche 2)
  const safeTranches = Array.isArray(invoice?.tranches) ? invoice.tranches : [];
  const initialPendingTranche =
    safeTranches.find((t) => t.status === 'Pending') ||
    safeTranches[0];
  const [selectedTrancheId, setSelectedTrancheId] = useState<string>(
    initialPendingTranche?.id || 'tranche_2'
  );

  // Active tranche object
  const activeTranche =
    safeTranches.find((t) => t.id === selectedTrancheId) ||
    safeTranches[0] || {
      id: 'tranche_full',
      label: 'Full Payment',
      percentage: 100,
      amount: invoice?.totalPayable || 141600,
      dueDate: invoice?.dueDate || '2026-11-04',
      shortUrl:
        invoice?.shortUrl?.startsWith('http')
          ? invoice.shortUrl
          : `${typeof window !== 'undefined' ? window.location.origin : getAppBaseUrl()}${invoice?.shortUrl?.startsWith('/') ? '' : '/'}${invoice?.shortUrl || 'pay/inv_1042'}`,
      upiIntentUrl: invoice?.upiIntentUrl || '',
      status: invoice?.status === 'Paid' ? 'Paid' : 'Pending',
    };

  // Helper to re-generate tranches based on structure and current total
  const buildTranches = (
    structure: PaymentStructure,
    totalAmount: number,
    invoiceNumber: string,
    freelancerVpa: string,
    dueDate: string,
    existingTranches?: InvoiceTranche[]
  ): InvoiceTranche[] => {
    const origin = typeof window !== 'undefined' ? window.location.origin : getAppBaseUrl();
    const invClean = invoiceNumber.toLowerCase().replace(/[^a-z0-9]/g, '_');

    if (structure === 'full') {
      const cleanTotal = Math.max(1, Math.round(totalAmount));
      const isAlreadyPaid = existingTranches?.every((t) => t.status === 'Paid');
      const label = '100% Full Payment';
      return [
        {
          id: 'tranche_full',
          label,
          percentage: 100,
          amount: cleanTotal,
          dueDate: dueDate,
          shortUrl: `${origin}/pay/${invClean}?amount=${cleanTotal}&title=${encodeURIComponent(label)}&inv=${encodeURIComponent(invoiceNumber)}`,
          upiIntentUrl: generateUPILink({
            vpa: freelancerVpa,
            name: mockFreelancerProfile.name,
            amount: cleanTotal,
            note: `Invoice ${invoiceNumber}`,
          }),
          status: isAlreadyPaid ? 'Paid' : 'Pending',
          settledAt: isAlreadyPaid ? '2026-10-30' : undefined,
          upiRef: isAlreadyPaid ? 'UPI/998127391823/HDFC' : undefined,
        },
      ];
    }

    if (structure === 'advance_delivery') {
      const advanceAmount = Math.max(1, Math.round(totalAmount * 0.5));
      const deliveryAmount = Math.max(1, Math.round(totalAmount - advanceAmount));

      const existingT1 = existingTranches?.find((t) => t.percentage === 50 || t.id.includes('1'));
      const existingT2 = existingTranches?.find((t) => t.id.includes('2'));

      const t1Label = 'Tranche 1: 50% Advance Lock';
      const t2Label = 'Tranche 2: 50% on Final Delivery';

      return [
        {
          id: 'tranche_1',
          label: t1Label,
          percentage: 50,
          amount: advanceAmount,
          dueDate: '2026-10-31',
          shortUrl: `${origin}/pay/${invClean}_t1?amount=${advanceAmount}&title=${encodeURIComponent(t1Label)}&inv=${encodeURIComponent(invoiceNumber)}`,
          upiIntentUrl: generateUPILink({
            vpa: freelancerVpa,
            name: mockFreelancerProfile.name,
            amount: advanceAmount,
            note: `${invoiceNumber} - 50% Advance`,
          }),
          status: existingT1 ? existingT1.status : 'Paid',
          settledAt: existingT1?.settledAt || '2026-10-30',
          upiRef: existingT1?.upiRef || 'UPI/998127391823/HDFC',
        },
        {
          id: 'tranche_2',
          label: t2Label,
          percentage: 50,
          amount: deliveryAmount,
          dueDate: '2026-11-08',
          shortUrl: `${origin}/pay/${invClean}_t2?amount=${deliveryAmount}&title=${encodeURIComponent(t2Label)}&inv=${encodeURIComponent(invoiceNumber)}`,
          upiIntentUrl: generateUPILink({
            vpa: freelancerVpa,
            name: mockFreelancerProfile.name,
            amount: deliveryAmount,
            note: `${invoiceNumber} - 50% Final Delivery`,
          }),
          status: existingT2 ? existingT2.status : 'Pending',
          settledAt: existingT2?.settledAt,
          upiRef: existingT2?.upiRef,
        },
      ];
    }

    // Milestones (30% - 40% - 30%)
    const t1Amount = Math.max(1, Math.round(totalAmount * 0.3));
    const t2Amount = Math.max(1, Math.round(totalAmount * 0.4));
    const t3Amount = Math.max(1, Math.round(totalAmount - t1Amount - t2Amount));

    const m1Label = 'Tranche 1: 30% Advance & Scoping';
    const m2Label = 'Tranche 2: 40% Mid-Sprint Alpha Approval';
    const m3Label = 'Tranche 3: 30% Final Delivery & Master Handoff';

    return [
      {
        id: 'tranche_m1',
        label: m1Label,
        percentage: 30,
        amount: t1Amount,
        dueDate: '2026-10-31',
        shortUrl: `${origin}/pay/${invClean}_m1?amount=${t1Amount}&title=${encodeURIComponent(m1Label)}&inv=${encodeURIComponent(invoiceNumber)}`,
        upiIntentUrl: generateUPILink({
          vpa: freelancerVpa,
          name: mockFreelancerProfile.name,
          amount: t1Amount,
          note: `${invoiceNumber} - Tranche 1 (30%)`,
        }),
        status: 'Paid',
        settledAt: '2026-10-28',
        upiRef: 'UPI/772183948192/AXIS',
      },
      {
        id: 'tranche_m2',
        label: m2Label,
        percentage: 40,
        amount: t2Amount,
        dueDate: '2026-11-04',
        shortUrl: `${origin}/pay/${invClean}_m2?amount=${t2Amount}&title=${encodeURIComponent(m2Label)}&inv=${encodeURIComponent(invoiceNumber)}`,
        upiIntentUrl: generateUPILink({
          vpa: freelancerVpa,
          name: mockFreelancerProfile.name,
          amount: t2Amount,
          note: `${invoiceNumber} - Tranche 2 (40%)`,
        }),
        status: 'Pending',
      },
      {
        id: 'tranche_m3',
        label: m3Label,
        percentage: 30,
        amount: t3Amount,
        dueDate: '2026-11-12',
        shortUrl: `${origin}/pay/${invClean}_m3?amount=${t3Amount}&title=${encodeURIComponent(m3Label)}&inv=${encodeURIComponent(invoiceNumber)}`,
        upiIntentUrl: generateUPILink({
          vpa: freelancerVpa,
          name: mockFreelancerProfile.name,
          amount: t3Amount,
          note: `${invoiceNumber} - Tranche 3 (30%)`,
        }),
        status: 'Pending',
      },
    ];
  };

  // Recalculate invoice totals and tranches
  const recalculateInvoice = (
    items: InvoiceItem[],
    gstEnabled: boolean,
    discountAmount: number,
    structure: PaymentStructure = invoice.paymentStructure
  ) => {
    const subtotal = items.reduce(
      (sum, item) => sum + (Number(item.hoursOrUnits) || 1) * (Number(item.rate) || 0),
      0
    );
    const taxable = Math.max(0, subtotal - (Number(discountAmount) || 0));
    const gst = gstEnabled ? taxable * 0.18 : 0;
    const totalPayable = taxable + gst;

    const dynamicUPILink = generateUPILink({
      vpa: invoice.freelancerVpa,
      name: mockFreelancerProfile.name,
      amount: totalPayable,
      note: `Invoice ${invoice.invoiceNumber}`,
    });

    const updatedTranches = buildTranches(
      structure,
      totalPayable,
      invoice.invoiceNumber,
      invoice.freelancerVpa,
      invoice.dueDate,
      invoice.tranches
    );

    const allPaid = updatedTranches.every((t) => t.status === 'Paid');

    const updated: Invoice = {
      ...invoice,
      items,
      subtotal,
      gstEnabled,
      discountAmount,
      totalPayable,
      upiIntentUrl: dynamicUPILink,
      paymentStructure: structure,
      tranches: updatedTranches,
      status: allPaid ? 'Paid' : 'Pending',
    };

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(`paidflow_invoice_${invoice.invoiceNumber}`, JSON.stringify(updated));
        const invClean = invoice.invoiceNumber.toLowerCase().replace(/[^a-z0-9]/g, '_');
        updatedTranches.forEach((t) => {
          localStorage.setItem(`paidflow_tranche_${t.id}`, JSON.stringify(t));
          localStorage.setItem(`paidflow_tranche_${invClean}_${t.id}`, JSON.stringify(t));
        });
      } catch (e) {}
    }

    setInvoice(updated);
    if (onInvoiceChange) {
      onInvoiceChange(updated);
    }
  };

  const handleStructureChange = (structure: PaymentStructure) => {
    recalculateInvoice(invoice.items, invoice.gstEnabled, invoice.discountAmount, structure);
    // Auto select first pending tranche in new structure
    setTimeout(() => {
      setSelectedTrancheId((prev) => {
        if (structure === 'full') return 'tranche_full';
        if (structure === 'advance_delivery') return 'tranche_2';
        return 'tranche_m2';
      });
    }, 50);
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
    const updated = invoice.items.map((item) => {
      if (item.id === id) {
        const next = { ...item, [field]: value };
        next.amount = (Number(next.hoursOrUnits) || 1) * (Number(next.rate) || 0);
        return next;
      }
      return item;
    });
    recalculateInvoice(updated, invoice.gstEnabled, invoice.discountAmount);
  };

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: `item_${Date.now()}`,
      description: 'Consultation & Design Architecture Sprint',
      hoursOrUnits: 1,
      rate: 20000,
      amount: 20000,
    };
    const updated = [...invoice.items, newItem];
    recalculateInvoice(updated, invoice.gstEnabled, invoice.discountAmount);
  };

  const handleRemoveItem = (id: string) => {
    if (invoice.items.length <= 1) return;
    const updated = invoice.items.filter((item) => item.id !== id);
    recalculateInvoice(updated, invoice.gstEnabled, invoice.discountAmount);
  };

  const handleGstToggle = () => {
    const nextGst = !invoice.gstEnabled;
    recalculateInvoice(invoice.items, nextGst, invoice.discountAmount);
  };

  const handleDiscountChange = (val: number) => {
    recalculateInvoice(invoice.items, invoice.gstEnabled, val);
  };

  const getFullUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const origin = typeof window !== 'undefined' ? window.location.origin : getAppBaseUrl();
    return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const handleCopyLink = (urlToCopy?: string) => {
    const raw = urlToCopy || activeTranche.shortUrl || invoice.shortUrl;
    const text = getFullUrl(raw);
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    }
  };

  const handleCopyTrancheLink = (tranche: InvoiceTranche) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      const fullUrl = getFullUrl(tranche.shortUrl);
      navigator.clipboard.writeText(fullUrl);
      setCopiedTrancheId(tranche.id);
      setTimeout(() => setCopiedTrancheId(null), 2000);
    }
  };

  const handleCopyVpa = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(invoice.freelancerVpa);
      setCopiedVpa(true);
      setTimeout(() => setCopiedVpa(false), 2200);
    }
  };

  const handleSendWhatsApp = () => {
    const isSingle = invoice.paymentStructure === 'full';
    const invoiceLink = getFullUrl(invoice.shortUrl);
    const trancheLink = getFullUrl(activeTranche.shortUrl);

    const message = isSingle
      ? `Hello ${invoice.clientName},\n\nHere is your verified UPI payment invoice ${invoice.invoiceNumber} for ${formatINR(
          invoice.totalPayable
        )}.\n\nPay securely with zero platform fee via UPI:\n${invoiceLink}\n\nFreelancer: ${
          mockFreelancerProfile.name
        } (UPI: ${invoice.freelancerVpa})`
      : `Hello ${invoice.clientName},\n\nHere is your verified UPI payment link for ${
          activeTranche.label
        } (${formatINR(activeTranche.amount)}) on invoice ${
          invoice.invoiceNumber
        }.\n\nPay securely with 0% fee via UPI:\n${trancheLink}\n\nFreelancer: ${
          mockFreelancerProfile.name
        } (UPI: ${invoice.freelancerVpa})`;

    const targetPhone = clientPhone || invoice.clientPhone || '+91 90798 79010';
    const url = generateWhatsAppShareUrl(targetPhone, message);
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  };

  // 1-Click Settle Specific Tranche
  const handleSimulateSettleTranche = (trancheId: string) => {
    const newTxId = 'UPI/' + Math.floor(100000000000 + Math.random() * 900000000000) + '/SETTLED';
    const updatedTranches = (invoice.tranches || []).map((t) => {
      if (t.id === trancheId) {
        return {
          ...t,
          status: 'Paid' as const,
          settledAt: 'Today',
          upiRef: newTxId,
        };
      }
      return t;
    });

    const allPaid = updatedTranches.every((t) => t.status === 'Paid');
    const updatedInvoice: Invoice = {
      ...invoice,
      tranches: updatedTranches,
      status: allPaid ? 'Paid' : 'Pending',
    };

    setInvoice(updatedInvoice);
    if (onPaymentSettled) {
      onPaymentSettled(updatedInvoice, trancheId);
    }
    if (onInvoiceChange) {
      onInvoiceChange(updatedInvoice);
    }
  };

  // Calculate unsettled amount for this invoice
  const unsettledAmount = (invoice.tranches || []).reduce((sum, t) => {
    return t.status !== 'Paid' ? sum + t.amount : sum;
  }, 0);

  const settledAmount = (invoice.tranches || []).reduce((sum, t) => {
    return t.status === 'Paid' ? sum + t.amount : sum;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner with Payment State Indicator */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded font-mono">
              {invoice.invoiceNumber}
            </span>
            {invoice.status === 'Paid' ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <Icons.Check className="w-3.5 h-3.5 stroke-[3]" />
                100% Settled to HDFC Bank
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                <Icons.Clock className="w-3.5 h-3.5" />
                <span>
                  {formatINR(unsettledAmount)} Pending ({invoice.tranches?.filter((t) => t.status !== 'Paid').length || 1} Tranche Unsettled)
                </span>
              </span>
            )}
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
              Structure: {invoice.paymentStructure === 'full' ? '100% Full' : invoice.paymentStructure === 'advance_delivery' ? '50% Advance + 50% Delivery' : 'Milestone Escrow'}
            </span>
          </div>

          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Dynamic UPI Invoicing & Advance Tranche Settlement
          </h2>
          <p className="text-xs text-slate-500">
            Split into advance locks and delivery tranches with individual instant UPI QR codes & 0% gateway cuts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onBackToDashboard && (
            <button
              type="button"
              onClick={onBackToDashboard}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              ← Back to Overview
            </button>
          )}

          {invoice.status !== 'Paid' && (
            <button
              onClick={() => handleSimulateSettleTranche(activeTranche.id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-xs transition-all"
            >
              <Icons.Sparkles className="w-3.5 h-3.5" />
              <span>Simulate Settle {activeTranche.label.split(':')[0]}</span>
            </button>
          )}
        </div>
      </div>

      {/* FEATURE 7: Payment Structure Selector Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Icons.Sliders className="w-4 h-4 text-indigo-600" />
              <span>Select Payment Structure</span>
            </h3>
            <p className="text-xs text-slate-500">
              Choose how client pays. SoloFlow automatically creates separate UPI intent links & QR codes per tranche.
            </p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
            Roadmap Feature 7
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {/* Option 1: 100% Full Payment */}
          <div
            onClick={() => handleStructureChange('full')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              invoice.paymentStructure === 'full'
                ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-900">100% Full Payment</span>
              <input
                type="radio"
                name="paymentStructure"
                checked={invoice.paymentStructure === 'full'}
                onChange={() => handleStructureChange('full')}
                className="text-indigo-600 focus:ring-indigo-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Single settlement invoice. Best for small sprint tasks, fast consultations, or trusted retainers.
            </p>
            <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-500">1 Tranche</span>
              <span className="text-slate-900">{formatINR(invoice.totalPayable)}</span>
            </div>
          </div>

          {/* Option 2: 50% Advance + 50% on Delivery (Recommended) */}
          <div
            onClick={() => handleStructureChange('advance_delivery')}
            className={`p-4 rounded-xl border cursor-pointer transition-all relative ${
              invoice.paymentStructure === 'advance_delivery'
                ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="absolute -top-2.5 right-3 bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
              Solo Creator Standard
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-900">50% Advance + 50% Delivery</span>
              <input
                type="radio"
                name="paymentStructure"
                checked={invoice.paymentStructure === 'advance_delivery'}
                onChange={() => handleStructureChange('advance_delivery')}
                className="text-indigo-600 focus:ring-indigo-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Guarantees cash flow upfront. Locks commitment before starting editing or design execution.
            </p>
            <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold">
              <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded text-[10px]">
                Ghost-Proof
              </span>
              <span className="text-slate-900">2 × {formatINR(invoice.totalPayable / 2)}</span>
            </div>
          </div>

          {/* Option 3: Milestone-based (2-4 Escrow Tranches) */}
          <div
            onClick={() => handleStructureChange('milestones')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              invoice.paymentStructure === 'milestones'
                ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-900">Milestone Tranches (Escrow)</span>
              <input
                type="radio"
                name="paymentStructure"
                checked={invoice.paymentStructure === 'milestones'}
                onChange={() => handleStructureChange('milestones')}
                className="text-indigo-600 focus:ring-indigo-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Split into 3 stages: 30% advance deposit, 40% alpha build sign-off, and 30% master handoff.
            </p>
            <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-500">3 Stages (30/40/30)</span>
              <span className="text-slate-900">Escrow Protected</span>
            </div>
          </div>
        </div>

        {/* Tranche Pills / Tabs for Active View */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Active Tranche Preview:</span>
            <div className="flex flex-wrap gap-1.5">
              {(invoice.tranches || []).map((tranche) => {
                const isSelected = tranche.id === selectedTrancheId;
                const isPaid = tranche.status === 'Paid';
                return (
                  <button
                    key={tranche.id}
                    type="button"
                    onClick={() => setSelectedTrancheId(tranche.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{tranche.label.split(':')[0]}</span>
                    <span className="font-mono text-[11px]">({formatINR(tranche.amount)})</span>
                    {isPaid ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-400" title="Settled" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-amber-400" title="Pending" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span>Settled: <strong className="text-emerald-700">{formatINR(settledAmount)}</strong></span>
            <span>•</span>
            <span>Unsettled: <strong className="text-amber-700">{formatINR(unsettledAmount)}</strong></span>
          </div>
        </div>
      </div>

      {/* Main Two-Column View: Itemized Invoice Sheet & Generated UPI Link Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Clean Invoice Card & Tranche Breakdown (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            {/* Invoice Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-6 border-b border-slate-100 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                    ₹
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{mockFreelancerProfile.name}</h3>
                    <p className="text-xs text-slate-400">{mockFreelancerProfile.role}</p>
                  </div>
                </div>
                <div className="text-xs text-slate-500 space-y-0.5 mt-2">
                  <p>GSTIN: {mockFreelancerProfile.gstNumber}</p>
                  <p>Bengaluru, Karnataka - 560038</p>
                </div>
              </div>

              <div className="text-left sm:text-right text-xs">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Billed To
                </span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{invoice.clientName}</p>
                <p className="text-slate-500 mt-0.5">
                  WhatsApp:{' '}
                  <span className="font-mono text-emerald-700 font-semibold">{clientPhone}</span>
                </p>
                <p className="text-slate-500 mt-0.5">Client UPI ID: {invoice.clientVpa}</p>
                <div className="mt-2 text-slate-400">
                  <span>Due Date: </span>
                  <span className="font-medium text-slate-700">{invoice.dueDate}</span>
                </div>
              </div>
            </div>

            {/* Itemized Tasks Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Itemized Deliverables & Billable Scope
                </h4>
                {currentUserRole === 'freelancer' && (
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 transition-colors"
                  >
                    <Icons.Plus className="w-3 h-3" />
                    <span>Add Item</span>
                  </button>
                )}
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-2 w-16 text-center">Qty / Hrs</th>
                      <th className="py-2.5 px-3 w-28 text-right">Rate (₹)</th>
                      <th className="py-2.5 px-3 w-28 text-right">Amount (₹)</th>
                      {currentUserRole === 'freelancer' && <th className="py-2.5 px-2 w-8"></th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoice.items.map((item) => (
                      <tr key={item.id} className="group">
                        <td className="py-2.5 px-3">
                          {currentUserRole === 'freelancer' ? (
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                              className="w-full bg-transparent border-0 border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:ring-0 text-slate-800 text-xs py-0.5"
                              placeholder="Task description"
                            />
                          ) : (
                            <span className="text-slate-800 font-medium">{item.description}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          {currentUserRole === 'freelancer' ? (
                            <input
                              type="number"
                              value={item.hoursOrUnits}
                              onChange={(e) =>
                                handleItemChange(item.id, 'hoursOrUnits', Number(e.target.value))
                              }
                              className="w-12 text-center bg-transparent border-0 border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:ring-0 text-slate-800 text-xs py-0.5"
                            />
                          ) : (
                            <span className="text-slate-600">{item.hoursOrUnits}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {currentUserRole === 'freelancer' ? (
                            <input
                              type="number"
                              value={item.rate}
                              onChange={(e) =>
                                handleItemChange(item.id, 'rate', Number(e.target.value))
                              }
                              className="w-24 text-right bg-transparent border-0 border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:ring-0 text-slate-900 font-semibold text-xs py-0.5"
                            />
                          ) : (
                            <span className="text-slate-700 font-semibold">{formatINR(item.rate)}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          {formatINR(item.amount)}
                        </td>
                        {currentUserRole === 'freelancer' && (
                          <td className="py-2.5 px-2 text-right">
                            {invoice.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(item.id)}
                                className="text-slate-300 hover:text-rose-500 transition-colors"
                              >
                                <Icons.X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tax, GST, and Discount Controls */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-3 text-xs">
              {/* Subtotal */}
              <div className="flex justify-between text-slate-600">
                <span>Itemized Subtotal</span>
                <span className="font-semibold text-slate-900">{formatINR(invoice.subtotal)}</span>
              </div>

              {/* Discount Field */}
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Discount Amount (INR)</span>
                <div className="w-28">
                  <input
                    type="number"
                    value={invoice.discountAmount}
                    disabled={currentUserRole !== 'freelancer'}
                    onChange={(e) => handleDiscountChange(Number(e.target.value))}
                    className="w-full text-right px-2 py-0.5 bg-white border border-slate-200 rounded text-xs font-semibold focus:outline-none focus:border-indigo-500 disabled:opacity-60"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* GST Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <div>
                  <span className="font-medium text-slate-800">Add 18% GST</span>
                  <span className="text-[11px] text-slate-400 block">
                    Applicable for Indian B2B clients with GST invoice input
                  </span>
                </div>
                <button
                  type="button"
                  disabled={currentUserRole !== 'freelancer'}
                  onClick={handleGstToggle}
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                    invoice.gstEnabled ? 'bg-indigo-600' : 'bg-slate-300'
                  } ${currentUserRole !== 'freelancer' ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      invoice.gstEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {invoice.gstEnabled && (
                <div className="flex justify-between text-slate-500 pl-2">
                  <span>IGST @ 18%</span>
                  <span className="font-medium text-slate-800">
                    {formatINR((invoice.subtotal - invoice.discountAmount) * 0.18)}
                  </span>
                </div>
              )}

              {/* Total Payable */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 text-sm block">Total Net Invoice Amount</span>
                  <span className="text-[10px] text-slate-400">Zero fee deduction via UPI rail</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-slate-900 tracking-tight">
                    {formatINR(invoice.totalPayable)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tranche Breakdown Cards */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Split Tranches & Escrow Schedule
              </h4>
              <span className="text-[11px] text-slate-400">
                {invoice.tranches?.length || 1} payment milestone(s)
              </span>
            </div>

            <div className="space-y-3">
              {(invoice.tranches || []).map((tranche, idx) => {
                const isSelected = tranche.id === selectedTrancheId;
                const isPaid = tranche.status === 'Paid';

                return (
                  <div
                    key={tranche.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/20 shadow-xs'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-slate-900 text-xs">{tranche.label}</span>
                          <span className="text-[10px] font-semibold text-slate-500 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                            {tranche.percentage}%
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                          <span>Due: <strong className="text-slate-700">{tranche.dueDate}</strong></span>
                          <span>•</span>
                          <span className="font-mono text-indigo-600">{tranche.shortUrl}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <div className="text-right">
                          <span className="text-sm font-bold text-slate-900 block">
                            {formatINR(tranche.amount)}
                          </span>
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
                              <Icons.Check className="w-2.5 h-2.5" />
                              Settled
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.2 rounded-full border border-amber-200">
                              <Icons.Clock className="w-2.5 h-2.5" />
                              Pending
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedTrancheId(tranche.id)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                              isSelected
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {isSelected ? 'Viewing' : 'View QR'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopyTrancheLink(tranche)}
                            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                            title="Copy link"
                          >
                            {copiedTrancheId === tranche.id ? (
                              <Icons.Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Icons.Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {!isPaid && (
                            <button
                              type="button"
                              onClick={() => handleSimulateSettleTranche(tranche.id)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                            >
                              Settle
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {isPaid && tranche.upiRef && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-[11px] text-emerald-700 flex items-center justify-between">
                        <span>Ref: <strong className="font-mono">{tranche.upiRef}</strong></span>
                        <span className="text-slate-400">Cleared via UPI to HDFC</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Payment Link, QR Code Preview & Direct WhatsApp (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Card: Generated Dynamic Payment Link Preview for Active Tranche */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Icons.QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {invoice.paymentStructure === 'full' ? 'UPI Payment Preview' : `${activeTranche.label.split(':')[0]} UPI QR`}
                  </h3>
                  <p className="text-[11px] text-slate-500">Auto-generated dynamic checkout</p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                0% Gateway Fee
              </span>
            </div>

            {/* Tranche Status Pill in QR card */}
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-indigo-950 block">{activeTranche.label}</span>
                <span className="text-[11px] text-indigo-700">Due: {activeTranche.dueDate}</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-900 text-sm block">
                  {formatINR(activeTranche.amount)}
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${
                    activeTranche.status === 'Paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {activeTranche.status}
                </span>
              </div>
            </div>

            {/* QR Code Graphic Box */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/90 text-center flex flex-col items-center justify-center relative">
              {/* Real Working Scannable QR Code */}
              <div className="w-48 h-48 bg-white p-2.5 rounded-xl border-2 border-slate-200 shadow-sm flex items-center justify-center relative overflow-hidden">
                <img
                  src="/upi-qr.jpg"
                  alt={`Scan to Pay via UPI (${invoice.freelancerVpa})`}
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>

              <div className="mt-3">
                <span className="text-xs font-bold text-slate-900 block">
                  Scan to Pay {formatINR(activeTranche.amount)}
                </span>
                <span className="text-[11px] text-slate-500 font-mono mt-0.5">
                  UPI ID: <span className="font-bold text-indigo-600">{invoice.freelancerVpa}</span>
                </span>
              </div>

              {/* Supported UPI Apps Row */}
              <div className="mt-3 flex items-center justify-center gap-2 text-[10px] font-semibold text-slate-500">
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200 shadow-2xs">GPay</span>
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200 shadow-2xs">PhonePe</span>
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200 shadow-2xs">Paytm</span>
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200 shadow-2xs">CRED</span>
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200 shadow-2xs">BHIM</span>
              </div>
            </div>

            {/* Instant Payment Short-Link Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Tranche Direct Payment Short Link
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 truncate select-all">
                  {activeTranche.shortUrl}
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyLink(activeTranche.shortUrl)}
                  className="px-3.5 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 text-indigo-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shrink-0"
                >
                  {copiedLink ? (
                    <>
                      <Icons.Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Icons.Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Client WhatsApp Number Input */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Client WhatsApp Phone</span>
                <span className="text-[10px] text-emerald-700 font-mono font-medium">Synced with Kunal Shah</span>
              </div>
              <input
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="+91 90798 79010"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Direct Send to WhatsApp Button */}
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs font-bold shadow-sm transition-all"
            >
              <Icons.WhatsApp className="w-4 h-4 fill-white" />
              <span>Send {activeTranche.label.split(':')[0]} via WhatsApp</span>
            </button>

            {/* Quick VPA Copy */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Freelancer VPA</span>
              <button
                type="button"
                onClick={handleCopyVpa}
                className="font-mono text-indigo-600 hover:underline flex items-center gap-1"
              >
                <span>{invoice.freelancerVpa}</span>
                {copiedVpa ? (
                  <Icons.Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Icons.Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
