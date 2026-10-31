'use client';

import React, { useState } from 'react';
import { ClientReviewItem } from '../../types';
import { formatINR } from '../../utils/formatters';
import { Icons } from '../ui/Icons';

interface ClientReviewModalProps {
  item: ClientReviewItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (itemId: string, ratings: { paymentDiscipline: number; scopeClarity: number; cooperation: number; notes: string }) => void;
}

export const ClientReviewModal: React.FC<ClientReviewModalProps> = ({
  item,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [paymentDiscipline, setPaymentDiscipline] = useState(5);
  const [scopeClarity, setScopeClarity] = useState(5);
  const [cooperation, setCooperation] = useState(5);
  const [notes, setNotes] = useState('');

  if (!isOpen || !item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(item.id, {
      paymentDiscipline,
      scopeClarity,
      cooperation,
      notes: notes || 'Prompt UPI settlement and crystal clear milestone scope.',
    });
    onClose();
  };

  const renderStarSelector = (value: number, onChange: (val: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 hover:scale-110 transition-transform focus:outline-none"
          >
            <Icons.Star
              className={`w-5 h-5 ${
                star <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
              }`}
              filled={star <= value}
            />
          </button>
        ))}
        <span className="text-xs font-bold text-slate-700 ml-2">{value}.0 / 5.0</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Icons.ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Rate Client to Unlock Review</h3>
              <p className="text-xs text-slate-500">Mutual blind review ensures unbiased feedback</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <Icons.X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Project Summary Banner */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
            <img
              src={item.clientAvatar}
              alt={item.clientName}
              className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
            />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-slate-900 block truncate">
                {item.clientName}
              </span>
              <span className="text-[11px] text-slate-500 block truncate">
                {item.projectTitle}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold font-mono">
                Billed: {formatINR(item.totalBilled)}
              </span>
            </div>
          </div>

          <div className="space-y-3.5">
            {/* Pillar 1: Payment Discipline */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">1. Payment Discipline & UPI Speed</span>
                <span className="text-[11px] text-slate-400">Did they settle milestones promptly?</span>
              </div>
              {renderStarSelector(paymentDiscipline, setPaymentDiscipline)}
            </div>

            {/* Pillar 2: Scope Clarity */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">2. Scope Clarity & Specifications</span>
                <span className="text-[11px] text-slate-400">Were requirements defined without creep?</span>
              </div>
              {renderStarSelector(scopeClarity, setScopeClarity)}
            </div>

            {/* Pillar 3: Cooperation */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">3. Cooperation & Feedback Loop</span>
                <span className="text-[11px] text-slate-400">Timely reviews and constructive comms</span>
              </div>
              {renderStarSelector(cooperation, setCooperation)}
            </div>

            {/* Notes / Private Comments */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Freelancer Verification Note (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Prompt milestone clearance and very supportive feedback cycles..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-800"
              />
            </div>
          </div>

          {/* Unlock notice */}
          <div className="p-3 rounded-lg bg-indigo-50/70 border border-indigo-100 flex items-start gap-2 text-xs text-indigo-900">
            <Icons.Unlock className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Once you submit this review, the client&apos;s mutual rating for your craftsmanship, punctuality, and communication will be revealed and credited to your verified reputation profile.
            </p>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Icons.Sparkles className="w-3.5 h-3.5" />
              <span>Submit & Unlock Mutual Review</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

