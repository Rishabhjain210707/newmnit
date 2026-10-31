'use client';

import React, { useState } from 'react';
import { Icons } from '../ui/Icons';
import { Proposal } from '../../types';

interface NewProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (proposal: Partial<Proposal>) => void;
}

export const NewProposalModal: React.FC<NewProposalModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [initialAmount, setInitialAmount] = useState('75000');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      title: title || 'Mobile App Design System & Tokens',
      clientName: clientName || 'Vikram Malhotra',
      clientPhone: clientPhone || '+91 98112 34567',
      subtotal: Number(initialAmount) || 75000,
      totalAmount: (Number(initialAmount) || 75000) * 1.18,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Icons.PenTool className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Create New Proposal</h3>
              <p className="text-xs text-slate-400">Lock scope and deliverable milestones</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <Icons.X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Project Name</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Fintech React Native App Architecture"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Client Full Name</label>
            <input
              type="text"
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. Vikram Malhotra"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Client WhatsApp Number</label>
            <input
              type="text"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              placeholder="+91 98112 34567"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Estimated Budget (₹ INR)</label>
            <input
              type="number"
              value={initialAmount}
              onChange={(e) => setInitialAmount(e.target.value)}
              placeholder="75000"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-bold"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs flex items-center gap-1.5"
            >
              <Icons.Plus className="w-3.5 h-3.5" />
              <span>Continue to Milestone Builder</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

