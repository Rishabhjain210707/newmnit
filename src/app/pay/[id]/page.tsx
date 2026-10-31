'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { mockInitialInvoice, mockFreelancerProfile } from '../../../data/mockData';
import { formatINR, generateUPILink } from '../../../utils/formatters';
import { Icons } from '../../../components/ui/Icons';

function ClientUPIPaymentCheckoutContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const invoiceId = (params?.id as string) || 'inv_1042_t2';

  // Read search params if available
  const queryAmountStr = searchParams?.get('amount');
  const queryTitle = searchParams?.get('title');
  const queryInv = searchParams?.get('inv');
  const queryClient = searchParams?.get('client');

  // Helper to safely decode strings without throwing URIError on standalone '%' signs
  const safeDecode = (val?: string | null): string => {
    if (!val) return '';
    try {
      if (/%[0-9a-fA-F]{2}/.test(val)) {
        return decodeURIComponent(val);
      }
      return val;
    } catch {
      return val;
    }
  };

  // Initial calculation based on query params or invoiceId
  const getInitialData = () => {
    let amount = 70800;
    let label = 'Tranche 2: 50% on Final Delivery';
    let invNum = queryInv ? safeDecode(queryInv) : mockInitialInvoice.invoiceNumber;
    let clientName = queryClient ? safeDecode(queryClient) : 'CRED Technologies Pvt Ltd';

    // 1. If explicit amount query param passed (e.g. ?amount=1 or ?amount=1.36)
    if (queryAmountStr !== null && queryAmountStr !== undefined && !isNaN(Number(queryAmountStr))) {
      amount = Math.max(0, Math.round(Number(queryAmountStr)));
    } else {
      // 2. Fallback based on specific tranche suffixes
      const lower = invoiceId.toLowerCase();
      if (lower.endsWith('_m1') || lower === 'tranche_m1') {
        amount = 42480;
        label = 'Tranche 1: 30% Advance & Scoping';
      } else if (lower.endsWith('_m2') || lower === 'tranche_m2') {
        amount = 56640;
        label = 'Tranche 2: 40% Mid-Sprint Alpha Approval';
      } else if (lower.endsWith('_m3') || lower === 'tranche_m3') {
        amount = 42480;
        label = 'Tranche 3: 30% Final Delivery & Master Handoff';
      } else if (lower.endsWith('_t1') || lower === 'tranche_1') {
        amount = 70800;
        label = 'Tranche 1: 50% Advance Lock';
      } else if (lower.endsWith('_t2') || lower === 'tranche_2') {
        amount = 70800;
        label = 'Tranche 2: 50% on Final Delivery';
      } else if (lower.endsWith('_full') || lower === 'tranche_full') {
        amount = 141600;
        label = '100% Full Payment';
      }
    }

    if (queryTitle) {
      label = safeDecode(queryTitle);
    }

    return { amount, label, invNum, clientName };
  };

  const initial = getInitialData();
  const [trancheAmount, setTrancheAmount] = useState<number>(initial.amount);
  const [trancheLabel, setTrancheLabel] = useState<string>(initial.label);
  const [invoiceNumber, setInvoiceNumber] = useState<string>(initial.invNum);
  const [clientCompany, setClientCompany] = useState<string>(initial.clientName);

  // Check localStorage on mount in case amount was configured locally
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        // If query param is explicitly provided, keep query param
        if (queryAmountStr !== null && queryAmountStr !== undefined && !isNaN(Number(queryAmountStr))) {
          setTrancheAmount(Math.max(0, Math.round(Number(queryAmountStr))));
          if (queryTitle) setTrancheLabel(safeDecode(queryTitle));
          if (queryInv) setInvoiceNumber(safeDecode(queryInv));
          if (queryClient) setClientCompany(safeDecode(queryClient));
          return;
        }

        // Otherwise check localStorage
        const cached =
          localStorage.getItem(`paidflow_tranche_${invoiceId}`) ||
          localStorage.getItem(`paidflow_pay_${invoiceId}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && typeof parsed.amount === 'number') {
            setTrancheAmount(Math.max(0, Math.round(parsed.amount)));
            if (parsed.label) setTrancheLabel(safeDecode(parsed.label));
          }
        }
      } catch (e) {}
    }
  }, [invoiceId, queryAmountStr, queryTitle, queryInv, queryClient]);

  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid'>('pending');
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [settledRef, setSettledRef] = useState<string | null>(null);

  const upiIntent = generateUPILink({
    vpa: mockFreelancerProfile.upiId, // 9079879010@fam
    name: mockFreelancerProfile.name,
    amount: trancheAmount,
    note: `${invoiceNumber} - ${trancheLabel}`,
  });

  const handleCopyVpa = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(mockFreelancerProfile.upiId);
      setCopiedVpa(true);
      setTimeout(() => setCopiedVpa(false), 2000);
    }
  };

  const handleCopyCheckoutLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleSimulatePayment = () => {
    const ref = 'UPI/' + Math.floor(100000000000 + Math.random() * 900000000000) + '/HDFC';
    setSettledRef(ref);
    setPaymentStatus('paid');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col antialiased font-sans text-slate-800">
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 text-white px-4 sm:px-8 py-3.5 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white tracking-tight text-base">PaidFlow</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Instant UPI
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Zero Fee NPCI Direct Settlement Rail</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push('/p/proj_cred_video')}
            className="text-xs text-slate-300 hover:text-white flex items-center gap-1 font-medium transition-colors"
          >
            <span>← Back to Scope Portal</span>
          </button>
        </div>
      </header>

      {/* Main Checkout Box */}
      <main className="max-w-xl mx-auto p-4 sm:p-6 w-full flex-1 flex flex-col justify-center">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-slate-100">
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider block">
                {clientCompany}
              </span>
              <h1 className="text-xl font-extrabold text-slate-900 mt-0.5">
                {trancheLabel}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Invoice: {invoiceNumber}</p>
            </div>

            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              0% Gateway Cut
            </span>
          </div>

          {/* Amount Box */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-center space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Amount to Pay
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {formatINR(trancheAmount)}
            </div>
            <p className="text-[11px] text-slate-400">
              Direct to <strong>{mockFreelancerProfile.name}</strong> • VPA:{' '}
              <span className="font-mono text-indigo-600 font-semibold">{mockFreelancerProfile.upiId}</span>
            </p>
          </div>

          {paymentStatus !== 'paid' ? (
            <div className="space-y-6">
              {/* Dynamic QR Code */}
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 border border-slate-200 relative">
                <div className="w-52 h-52 bg-white p-2.5 rounded-2xl border-2 border-slate-200/90 shadow-md flex items-center justify-center overflow-hidden">
                  <img
                    src="/upi-qr.jpg"
                    alt={`Scan to Pay via UPI (${mockFreelancerProfile.upiId})`}
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
                <span className="text-xs font-bold text-slate-800 mt-3">Scan to Pay {formatINR(trancheAmount)}</span>
                <span className="text-[11px] text-slate-500 font-mono mt-0.5">
                  UPI ID: <span className="font-bold text-indigo-600">{mockFreelancerProfile.upiId}</span>
                </span>
                <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[10px] font-semibold text-slate-500">
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200 shadow-2xs">GPay</span>
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200 shadow-2xs">PhonePe</span>
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200 shadow-2xs">Paytm</span>
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200 shadow-2xs">CRED</span>
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200 shadow-2xs">BHIM</span>
                </div>
              </div>

              {/* 1-Click Pay on Mobile */}
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.href = upiIntent;
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(mockFreelancerProfile.upiId);
                    }
                  }
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Icons.QrCode className="w-4 h-4" />
                <span>Pay {formatINR(trancheAmount)} via UPI App</span>
              </button>

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyVpa}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5"
                >
                  {copiedVpa ? <Icons.Check className="w-3.5 h-3.5 text-emerald-600" /> : <Icons.Copy className="w-3.5 h-3.5" />}
                  <span>{copiedVpa ? 'VPA Copied!' : 'Copy UPI ID'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyCheckoutLink}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5"
                >
                  {copiedLink ? <Icons.Check className="w-3.5 h-3.5 text-emerald-600" /> : <Icons.Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
                </button>
              </div>

              {/* Instant Simulation Button */}
              <div className="pt-2 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={handleSimulatePayment}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl border border-emerald-200 transition-colors inline-flex items-center gap-1.5"
                >
                  <Icons.Sparkles className="w-3.5 h-3.5" />
                  <span>Simulate Instant Settlement (Hackathon Demo)</span>
                </button>
              </div>
            </div>
          ) : (
            /* Paid Confirmation Card */
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-sm">
                <Icons.Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h2 className="text-lg font-extrabold text-emerald-950">Payment Cleared & Settled!</h2>
              <p className="text-xs text-emerald-800">
                Received <strong>{formatINR(trancheAmount)}</strong> directly to HDFC Bank ****9810 with 0% platform fee.
              </p>
              <div className="bg-white p-3 rounded-xl border border-emerald-200 text-xs font-mono text-emerald-900 select-all">
                Reference ID: {settledRef}
              </div>
              <button
                type="button"
                onClick={() => router.push('/p/proj_cred_video')}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors mt-2"
              >
                Return to Deliverables Portal →
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ClientUPIPaymentCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-100 flex items-center justify-center font-sans text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
            <span className="text-sm font-semibold">Loading UPI Checkout...</span>
          </div>
        </div>
      }
    >
      <ClientUPIPaymentCheckoutContent />
    </Suspense>
  );
}
