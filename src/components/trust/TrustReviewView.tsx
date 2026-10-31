'use client';

import React, { useState } from 'react';
import { TrustScoreMetrics, ClientReviewItem } from '../../types';
import { formatINR } from '../../utils/formatters';
import { Icons } from '../ui/Icons';
import { ClientReviewModal } from './ClientReviewModal';
import { mockFreelancerProfile, mockTrustMetrics, mockPendingClientReviews } from '../../data/mockData';

interface TrustReviewViewProps {
  metrics?: TrustScoreMetrics;
  reviewsQueue?: ClientReviewItem[];
  onShareProfile?: () => void;
  onBackToOverview?: () => void;
}

export const TrustReviewView: React.FC<TrustReviewViewProps> = ({
  metrics: initialMetrics = mockTrustMetrics,
  reviewsQueue: initialQueue = mockPendingClientReviews,
  onShareProfile,
  onBackToOverview,
}) => {
  const [metrics, setMetrics] = useState<TrustScoreMetrics>(initialMetrics);
  const [reviews, setReviews] = useState<ClientReviewItem[]>(initialQueue);
  const [selectedReviewItem, setSelectedReviewItem] = useState<ClientReviewItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleOpenReviewModal = (item: ClientReviewItem) => {
    setSelectedReviewItem(item);
    setIsModalOpen(true);
  };

  const handleFreelancerReviewSubmit = (
    itemId: string,
    ratings: { paymentDiscipline: number; scopeClarity: number; cooperation: number; notes: string }
  ) => {
    // Reveal mutual review for the client
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === itemId) {
          return {
            ...r,
            isFreelancerReviewSubmitted: true,
            isMutualReviewUnlocked: true,
            freelancerRatings: ratings,
            clientRatings: {
              craftsmanship: 5,
              punctuality: 5,
              communication: 4.9,
              testimonial:
                'Outstanding engineering craft! Arjun delivered our fintech dashboard design system 3 days ahead of schedule. Zero revisions needed on tokens.',
            },
          };
        }
        return r;
      })
    );

    // Increment metrics
    setMetrics((prev) => ({
      ...prev,
      totalReviews: prev.totalReviews + 1,
      overallScore: 4.94,
    }));

    setToastMessage('🎉 Mutual Review Unlocked! New rating added to your verified score.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const pendingList = reviews.filter((r) => !r.isMutualReviewUnlocked);
  const unlockedList = reviews.filter((r) => r.isMutualReviewUnlocked);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-600 text-white p-3 rounded-xl shadow-lg flex items-center justify-between text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Icons.CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="opacity-80 hover:opacity-100">
            <Icons.X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Trust Overview Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex flex-col items-center justify-center shadow-md shadow-emerald-200">
              <Icons.ShieldCheck className="w-8 h-8" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">Verified Freelancer Reputation</h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Escrow Backed
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
                PaidFlow reviews are tamper-proof and double-blind. Client ratings are only published once both parties have submitted feedback or settled final UPI milestones.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {metrics.overallScore.toFixed(2)}
                </span>
                <span className="text-slate-400 font-semibold text-sm">/ 5.0</span>
                <Icons.Star className="w-5 h-5 text-amber-400 fill-amber-400" filled={true} />
              </div>
              <span className="text-xs font-semibold text-slate-500 block">
                Based on {metrics.totalReviews} verified transactions
              </span>
            </div>

            <button
              onClick={() => {
                if (onShareProfile) {
                  onShareProfile();
                } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
                  navigator.clipboard.writeText(mockFreelancerProfile.reputationUrl);
                  setToastMessage('Copied reputation profile link to clipboard!');
                  setTimeout(() => setToastMessage(null), 3000);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors shrink-0"
            >
              <Icons.Share2 className="w-3.5 h-3.5" />
              <span>Share Profile</span>
            </button>
          </div>
        </div>

        {/* 3 Pillars of Freelancer Reputation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
          {/* Pillar 1: Product Craftsmanship */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">
                Product Craftsmanship & Quality
              </span>
              <span className="text-sm font-bold text-indigo-700 font-mono">
                {metrics.pillars.craftsmanship.score.toFixed(2)}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full"
                style={{ width: `${(metrics.pillars.craftsmanship.score / 5) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Evaluated on Figma design tokens, responsive code clean-up, and UI polish.
            </p>
          </div>

          {/* Pillar 2: Deadline Punctuality */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Deadline Punctuality</span>
              <span className="text-sm font-bold text-emerald-700 font-mono">
                {metrics.pillars.punctuality.score.toFixed(2)}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full"
                style={{ width: `${(metrics.pillars.punctuality.score / 5) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              98% of milestones delivered on or before the committed scope date.
            </p>
          </div>

          {/* Pillar 3: Communication & Revisions */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">
                Communication & Revisions
              </span>
              <span className="text-sm font-bold text-indigo-700 font-mono">
                {metrics.pillars.communication.score.toFixed(2)}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full"
                style={{ width: `${(metrics.pillars.communication.score / 5) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Async WhatsApp & Loom turnaround time under 45 minutes on average.
            </p>
          </div>
        </div>
      </div>

      {/* Review Pending Queue (Mutual Lock Mechanism) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">Review Pending Queue</h3>
              {pendingList.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                  {pendingList.length} Action Required
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Rate your client to unlock their reciprocal rating and publish it to your profile.
            </p>
          </div>
        </div>

        {pendingList.length === 0 ? (
          <div className="p-6 bg-white rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
            All client reviews unlocked! No pending reviews in your queue.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingList.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-amber-200/80 p-5 shadow-xs relative overflow-hidden space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.clientAvatar}
                      alt={item.clientName}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{item.clientName}</h4>
                      <p className="text-[11px] text-slate-500">{item.projectTitle}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-900 whitespace-nowrap bg-slate-50 px-2 py-1 rounded">
                    {formatINR(item.totalBilled)}
                  </span>
                </div>

                <div className="p-3 bg-amber-50/70 rounded-lg border border-amber-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-amber-800">
                    <Icons.Lock className="w-4 h-4 text-amber-600" />
                    <span>Client has submitted rating. Unlock to view!</span>
                  </div>
                  <button
                    onClick={() => handleOpenReviewModal(item)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors inline-flex items-center gap-1 shadow-xs"
                  >
                    <span>Rate Client</span>
                    <Icons.ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Unlocked Mutual Client Reviews Feed */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          Verified Reviews Feed ({unlockedList.length})
        </h3>

        <div className="space-y-3.5">
          {unlockedList.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3 hover:border-slate-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={rev.clientAvatar}
                    alt={rev.clientName}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{rev.clientName}</span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        <Icons.CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Verified Payer
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{rev.projectTitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="text-right">
                    <div className="flex items-center justify-end text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Icons.Star key={i} className="w-4 h-4 fill-amber-400" filled={true} />
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">
                      Settled {formatINR(rev.totalBilled)} via UPI
                    </span>
                  </div>
                </div>
              </div>

              {rev.clientRatings?.testimonial && (
                <p className="text-xs text-slate-700 bg-slate-50/70 p-3.5 rounded-lg border border-slate-100 italic leading-relaxed">
                  &ldquo;{rev.clientRatings.testimonial}&rdquo;
                </p>
              )}

              {/* Freelancer Mutual Feedback Tag */}
              {rev.freelancerRatings && (
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span className="font-semibold text-slate-700">Your rating for client:</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded">
                    Payment Discipline: {rev.freelancerRatings.paymentDiscipline}/5 ★
                  </span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded">
                    Scope Clarity: {rev.freelancerRatings.scopeClarity}/5 ★
                  </span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded">
                    Cooperation: {rev.freelancerRatings.cooperation}/5 ★
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Review Modal */}
      <ClientReviewModal
        item={selectedReviewItem}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFreelancerReviewSubmit}
      />
    </div>
  );
};

