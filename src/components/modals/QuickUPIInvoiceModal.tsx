'use client';

import React, { useState } from 'react';
import { Icons } from '../ui/Icons';
import { formatINR, generateUPILink, generateWhatsAppShareUrl } from '../../utils/formatters';
import { mockFreelancerProfile } from '../../data/mockData';

interface QuickUPIInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvoiceCreated: (invoiceData: any) => void;
}

export const QuickUPIInvoiceModal: React.FC<QuickUPIInvoiceModalProps> = ({
  isOpen,
  onClose,
  onInvoiceCreated,
}) => {
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('+91 90798 79010');
  const [taskDescription, setTaskDescription] = useState('Design Sprint & Frontend Components');
  const [amount, setAmount] = useState('45000');
  const [addGst, setAddGst] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const baseAmount = Number(amount) || 0;
  const gstAmount = addGst ? baseAmount * 0.18 : 0;
  const totalAmount = baseAmount + gstAmount;
  const invNumber = 'INV-' + Math.floor(1000 + Math.random() * 9000);
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const generatedShortUrl = `${origin}/pay/${invNumber.toLowerCase()}?amount=${totalAmount}&title=${encodeURIComponent(taskDescription || 'Quick UPI Payment')}&inv=${invNumber}&client=${encodeURIComponent(clientName || 'Client Partner')}`;

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(generatedShortUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleSendWhatsApp = () => {
    const text = `Hi ${clientName || 'there'}, please find your UPI invoice ${invNumber} for ${formatINR(totalAmount)} here: ${generatedShortUrl}`;
    const url = generateWhatsAppShareUrl(clientPhone, text);
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onInvoiceCreated({
      clientName: clientName || 'Client Partner',
      taskDescription,
      totalAmount,
      invNumber,
      shortUrl: generatedShortUrl,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Icons.QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Quick UPI Invoice Generator</h3>
              <p className="text-xs text-slate-500">Zero platform cut • Instant bank settlement</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <Icons.X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Client Name</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Kunal Shah / CRED"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">WhatsApp Number</label>
              <input
                type="text"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Deliverable / Milestone Scope</label>
            <input
              type="text"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="e.g. Design tokens & UI components"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Amount (₹ INR)</label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="45000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-bold"
              />
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addGst}
                  onChange={(e) => setAddGst(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-0"
                />
                <span className="text-xs text-slate-700 font-medium">Add 18% GST</span>
              </label>
            </div>
          </div>

          {/* Dynamic Link & Total Calculation Preview */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 font-medium">Total Receivable:</span>
              <span className="text-base font-bold text-slate-900">{formatINR(totalAmount)}</span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <div className="flex-1 bg-white border border-slate-200 px-2.5 py-1.5 rounded text-[11px] font-mono text-slate-700 truncate">
                {generatedShortUrl}
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 rounded text-[11px] font-semibold text-slate-800 transition-colors"
              >
                {copiedLink ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
            >
              <Icons.WhatsApp className="w-3.5 h-3.5 fill-emerald-600" />
              <span>WhatsApp Link</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs flex items-center gap-1"
              >
                <Icons.Check className="w-3.5 h-3.5" />
                <span>Save & Issue</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

