'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { mockProjects, mockFreelancerProfile, mockInitialInvoice } from '../../../data/mockData';
import { Project, DeliverableItem } from '../../../types';
import { formatINR, getDeadlineStatus, getAppBaseUrl } from '../../../utils/formatters';
import { Icons } from '../../../components/ui/Icons';
import { SignatureCanvas } from '../../../components/proposals/SignatureCanvas';

export default function ClientProjectPortalPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = (params?.id as string) || 'proj_cred_video';

  const matchedProject =
    mockProjects.find((p) => p.id === projectId) ||
    mockProjects[0];

  const [project, setProject] = useState<Project>(matchedProject);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [isSigned, setIsSigned] = useState(false);
  const [approvalFeedback, setApprovalFeedback] = useState<string | null>(null);
  const [feedbackInput, setFeedbackInput] = useState<{ [delId: string]: string }>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const deadlineStatus = getDeadlineStatus(project.deadline);
  const completedDeliverables = (project.deliverables || []).filter((d) => d.status === 'Approved').length;
  const totalDeliverables = project.deliverables?.length || 1;
  const progressPct = Math.round((completedDeliverables / totalDeliverables) * 100);

  const handleApproveDeliverable = (deliverableId: string) => {
    const updated = (project.deliverables || []).map((d) => {
      if (d.id === deliverableId) {
        return { ...d, status: 'Approved' as const };
      }
      return d;
    });

    setProject((prev) => ({
      ...prev,
      deliverables: updated,
      completedDeliverables: updated.filter((d) => d.status === 'Approved').length,
    }));

    showToast('✓ Deliverable Approved! Ready for final handoff.');
  };

  const handleRequestRevision = (deliverableId: string) => {
    const reason = feedbackInput[deliverableId] || 'Please refine colors and pacing at intro.';
    const updated = (project.deliverables || []).map((d) => {
      if (d.id === deliverableId) {
        const nextRevisions = (d.revisionsUsed || 0) + 1;
        return {
          ...d,
          status: 'Changes Requested' as const,
          revisionsUsed: nextRevisions,
          latestComment: reason,
        };
      }
      return d;
    });

    setProject((prev) => ({
      ...prev,
      deliverables: updated,
    }));

    setFeedbackInput((prev) => ({ ...prev, [deliverableId]: '' }));
    showToast('Revision request sent to Arjun & video editor Rohan!');
  };

  const handleSignScope = () => {
    if (!signatureData) {
      showToast('Please sign in the box above before submitting approval.');
      return;
    }
    setIsSigned(true);
    setApprovalFeedback('Project Scope & Milestones approved and signed via SoloFlow E-Sign!');
    showToast('✓ Proposal signed and approved successfully!');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-top-2 border border-slate-700">
          <Icons.CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2">
            <Icons.X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Banner */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-8 py-3.5 shadow-2xs">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-base">PaidFlow</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Client Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Secure Client Approval & UPI Escrow Rail</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold text-slate-900 block">{project.clientName}</span>
              <span className="text-[11px] text-slate-400">{project.clientCompany}</span>
            </div>
            <button
              type="button"
              onClick={() => router.push(`/pay/${mockInitialInvoice.id}`)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Icons.Rupee className="w-3.5 h-3.5" />
              <span>Pay Milestone via UPI</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto p-4 sm:p-8 space-y-6">
        {/* Project Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {project.clientCompany}
                </span>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    deadlineStatus.color === 'red'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : deadlineStatus.color === 'amber'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {deadlineStatus.label}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {project.title}
              </h1>
              <p className="text-xs text-slate-500">
                Prepared by Lead Designer <strong>{mockFreelancerProfile.name}</strong> • VPA:{' '}
                <span className="font-mono text-indigo-600">{mockFreelancerProfile.upiId}</span>
              </p>
            </div>

            <div className="text-left sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Total Scope Budget</span>
              <span className="text-2xl font-extrabold text-slate-900">
                {formatINR(project.totalBudget || project.budget || 1250000)}
              </span>
              <span className="text-[11px] text-slate-500 block">Due Date: {project.deadline}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">
                Overall Deliverables Approval: <strong>{completedDeliverables}/{totalDeliverables} Approved</strong>
              </span>
              <span className="font-bold text-slate-900 font-mono">{progressPct}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Deliverables Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Deliverables & Creative Assets</h2>
              <p className="text-xs text-slate-500">
                Inspect unlisted review cuts, verify deliverables, and approve or request revisions.
              </p>
            </div>
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
              2 Free Revisions Included
            </span>
          </div>

          <div className="space-y-4">
            {(project.deliverables || []).map((deliv) => {
              const revisionsRemaining = Math.max(0, (deliv.freeRevisionsLimit || 2) - (deliv.revisionsUsed || 0));
              const isOverQuota = (deliv.revisionsUsed || 0) >= (deliv.freeRevisionsLimit || 2);

              return (
                <div
                  key={deliv.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-indigo-100 text-indigo-800 font-mono">
                          {deliv.currentVersion || deliv.version || 'v2'}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs font-semibold text-slate-500">{deliv.type || 'Deliverable Asset'}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base mt-0.5">{deliv.title}</h3>
                    </div>

                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border ${
                        deliv.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : deliv.status === 'Changes Requested'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : deliv.status === 'Submitted'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {deliv.status}
                    </span>
                  </div>

                  {/* Clickable External Link Box */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 truncate">
                      <Icons.Play className="w-4 h-4 text-indigo-600 shrink-0" />
                      <div className="truncate">
                        <span className="font-semibold text-slate-800 block">External Review Link</span>
                        <span className="font-mono text-indigo-600 text-[11px] select-all truncate block">
                          {deliv.workLink || 'https://youtu.be/unlisted_cred_hero_v2'}
                        </span>
                      </div>
                    </div>

                    <a
                      href={deliv.workLink || 'https://youtu.be/unlisted_cred_hero_v2'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <Icons.ArrowUpRight className="w-3.5 h-3.5" />
                      <span>Watch & Inspect Cut</span>
                    </a>
                  </div>

                  {/* Revision Limit Alert */}
                  {isOverQuota && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                      <Icons.AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        <strong>Free revision limit reached (2/2 used).</strong> Additional revision rounds are billable
                        at ₹5,000 per sprint.
                      </span>
                    </div>
                  )}

                  {/* Actions for Client */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-xs text-slate-500">
                      Revision Status: <strong>{deliv.revisionsUsed || 0}/2 used</strong> ({revisionsRemaining} free left)
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleApproveDeliverable(deliv.id)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <Icons.Check className="w-4 h-4 stroke-[3]" />
                        <span>Approve Deliverable</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRequestRevision(deliv.id)}
                        className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors"
                      >
                        Request Changes
                      </button>
                    </div>
                  </div>

                  {/* Revision Feedback Input */}
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Specify timestamped changes (e.g., 'Tighten 0:15 cut by 1s and boost bass')..."
                      value={feedbackInput[deliv.id] || ''}
                      onChange={(e) => setFeedbackInput({ ...feedbackInput, [deliv.id]: e.target.value })}
                      className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRequestRevision(deliv.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
                    >
                      Send Note
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* E-Signature & Approval Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">E-Sign & Project Scope Approval</h2>
            <p className="text-xs text-slate-500">
              Sign below to approve project milestones, deliverables, and payment release terms.
            </p>
          </div>

          {approvalFeedback && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
              <Icons.CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{approvalFeedback}</span>
            </div>
          )}

          {!isSigned ? (
            <div className="space-y-4">
              <SignatureCanvas onSignatureCapture={(dataUrl: string) => setSignatureData(dataUrl)} />

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-400">
                  By signing, you confirm approval of scope and UPI milestone releases.
                </span>
                <button
                  type="button"
                  onClick={handleSignScope}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-2"
                >
                  <Icons.Check className="w-4 h-4 stroke-[3]" />
                  <span>E-Sign & Approve Project</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <Icons.CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-slate-900 text-sm">Scope Signed & Approved by {project.clientName}</h3>
              <p className="text-xs text-slate-500">Timestamp: Today at {new Date().toLocaleTimeString('en-IN')}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
