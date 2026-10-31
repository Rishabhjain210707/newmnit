'use client';

import React, { useState } from 'react';
import { Icons } from '../ui/Icons';
import { mockFreelancerProfile, mockMetrics } from '../../data/mockData';

interface ShareReputationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareReputationModal: React.FC<ShareReputationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedBadgeCode, setCopiedBadgeCode] = useState(false);

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const profileUrl = `${origin}/#trust`;
  const badgeEmbedCode = `<a href="${profileUrl}" target="_blank"><img src="${origin}/favicon.ico" alt="PaidFlow Verified Freelancer 4.9★" /></a>`;

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(profileUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyBadge = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(badgeEmbedCode);
      setCopiedBadgeCode(true);
      setTimeout(() => setCopiedBadgeCode(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Icons.Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Share Reputation Profile</h3>
              <p className="text-xs text-slate-500">Public verified trust card & badges</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <Icons.X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Reputation Card Preview */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-xl p-4 text-white relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <img
                  src={mockFreelancerProfile.avatar}
                  alt={mockFreelancerProfile.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-400"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-white">{mockFreelancerProfile.name}</span>
                    <Icons.CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-[11px] text-slate-300">{mockFreelancerProfile.role}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-amber-400 flex items-center justify-end gap-1">
                  <Icons.Star className="w-3.5 h-3.5 fill-amber-400" filled={true} />
                  <span>{mockMetrics.verifiedTrustScore.toFixed(1)} / 5.0</span>
                </span>
                <span className="text-[10px] text-slate-400">PaidFlow Top 1%</span>
              </div>
            </div>

            <div className="pt-3 grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/5 rounded-lg p-1.5">
                <span className="text-[10px] text-slate-400 block">Settled</span>
                <span className="text-xs font-bold text-emerald-400">₹14.85 L</span>
              </div>
              <div className="bg-white/5 rounded-lg p-1.5">
                <span className="text-[10px] text-slate-400 block">On-Time</span>
                <span className="text-xs font-bold text-indigo-300">98%</span>
              </div>
              <div className="bg-white/5 rounded-lg p-1.5">
                <span className="text-[10px] text-slate-400 block">Reviews</span>
                <span className="text-xs font-bold text-slate-200">38 Verified</span>
              </div>
            </div>
          </div>

          {/* Direct Profile Link */}
          <div className="space-y-1.5">
            <label className="text-slate-700 font-semibold block">Your Verified Profile Link</label>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={profileUrl}
                className="flex-1 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-xs font-mono text-slate-800 select-all"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors shrink-0"
              >
                {copiedLink ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* HTML Embed Snippet */}
          <div className="space-y-1.5">
            <label className="text-slate-700 font-semibold block">Embed Badge on Portfolio / GitHub</label>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={badgeEmbedCode}
                className="flex-1 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-[11px] font-mono text-slate-600 truncate"
              />
              <button
                type="button"
                onClick={handleCopyBadge}
                className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors shrink-0"
              >
                {copiedBadgeCode ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold text-slate-700"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

