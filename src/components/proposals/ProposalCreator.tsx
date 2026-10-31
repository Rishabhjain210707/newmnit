'use client';

import React, { useState } from 'react';
import { Proposal, MilestoneItem } from '../../types';
import { formatINR, generateWhatsAppShareUrl, getAppBaseUrl } from '../../utils/formatters';
import { Icons } from '../ui/Icons';
import { SignatureCanvas } from './SignatureCanvas';
import { mockFreelancerProfile } from '../../data/mockData';

interface ProposalCreatorProps {
  initialProposal: Proposal;
  onSaveProposal?: (proposal: Proposal) => void;
}

export const ProposalCreator: React.FC<ProposalCreatorProps> = ({
  initialProposal,
  onSaveProposal,
}) => {
  const [proposal, setProposal] = useState<Proposal>(initialProposal);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSignedByClient, setIsSignedByClient] = useState(proposal.signedByClient);
  const [, setSignatureData] = useState<string | null>(null);

  // Milestone management
  const handleMilestoneChange = (id: string, field: keyof MilestoneItem, value: any) => {
    const updatedMilestones = proposal.milestones.map((m) =>
      m.id === id ? { ...m, [field]: value } : m
    );

    recalculateTotals(updatedMilestones, proposal.gstApplicable, proposal.discount);
  };

  const handleAddMilestone = () => {
    const newMilestone: MilestoneItem = {
      id: `ms_${Date.now()}`,
      title: `Milestone ${proposal.milestones.length + 1}: Final Review & Deployment`,
      description: 'Production QA, DNS cutover, cross-browser verification, and code handoff.',
      deliverableDate: '2026-12-15',
      amount: 30000,
      status: 'Upcoming',
    };
    const updated = [...proposal.milestones, newMilestone];
    recalculateTotals(updated, proposal.gstApplicable, proposal.discount);
  };

  const handleRemoveMilestone = (id: string) => {
    if (proposal.milestones.length <= 1) return;
    const updated = proposal.milestones.filter((m) => m.id !== id);
    recalculateTotals(updated, proposal.gstApplicable, proposal.discount);
  };

  // Pricing calculations
  const recalculateTotals = (
    milestones: MilestoneItem[],
    gstApplicable: boolean,
    discount: number
  ) => {
    const subtotal = milestones.reduce((sum, m) => sum + (Number(m.amount) || 0), 0);
    const taxableAmount = Math.max(0, subtotal - (Number(discount) || 0));
    const gstAmount = gstApplicable ? taxableAmount * 0.18 : 0;
    const totalAmount = taxableAmount + gstAmount;

    setProposal((prev) => ({
      ...prev,
      milestones,
      subtotal,
      gstApplicable,
      discount,
      totalAmount,
    }));
  };

  const handleGstToggle = () => {
    const nextState = !proposal.gstApplicable;
    recalculateTotals(proposal.milestones, nextState, proposal.discount);
  };

  const handleDiscountChange = (val: number) => {
    recalculateTotals(proposal.milestones, proposal.gstApplicable, val);
  };

  const handleApproveSignature = () => {
    setIsSignedByClient(true);
    const updated: Proposal = {
      ...proposal,
      signedByClient: true,
      status: 'Approved',
      clientSignedAt: new Date().toISOString(),
    };
    setProposal(updated);
    if (onSaveProposal) {
      onSaveProposal(updated);
    }
  };

  const getShareUrl = () => {
    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : getAppBaseUrl();
    return `${origin}/p/${proposal.id}`;
  };

  const proposalShareUrl = getShareUrl();

  const handleCopyLink = () => {
    const currentUrl = getShareUrl();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleSendWhatsApp = () => {
    const currentUrl = getShareUrl();
    const text = `Hi ${proposal.clientName}, Arjun has shared the verified project scope and milestone proposal "${proposal.title}" for review & e-sign: ${currentUrl}`;
    const url = generateWhatsAppShareUrl(proposal.clientPhone, text);
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Quick Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              Proposal Mode
            </span>
            <span className="text-xs text-slate-400 font-mono">ID: {proposal.id}</span>
            {isSignedByClient ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <Icons.Check className="w-3 h-3 stroke-[3]" />
                Approved & Sealed
              </span>
            ) : (
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Awaiting E-Sign
              </span>
            )}
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">Scope & Digital Contract Creator</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          >
            {copiedLink ? (
              <>
                <Icons.Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Icons.Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Link</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSendWhatsApp}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
          >
            <Icons.WhatsApp className="w-3.5 h-3.5 fill-white" />
            <span>WhatsApp Client</span>
          </button>
        </div>
      </div>

      {/* Main Split Grid: Left Form Builder & Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Interactive Scope Form (6 Cols) */}
        <div className="lg:col-span-6 space-y-5">
          {/* Section: Project & Client Essentials */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs">
                1
              </span>
              <span>Project & Client Details</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Project Title / Engagement Name
                </label>
                <input
                  type="text"
                  value={proposal.title}
                  onChange={(e) => setProposal({ ...proposal, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="e.g. Next.js SaaS MVP Redesign"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Client Full Name</label>
                  <input
                    type="text"
                    value={proposal.clientName}
                    onChange={(e) => setProposal({ ...proposal, clientName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    placeholder="e.g. Aditya Mathur"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Client Company (Optional)
                  </label>
                  <input
                    type="text"
                    value={proposal.clientCompany || ''}
                    onChange={(e) => setProposal({ ...proposal, clientCompany: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    placeholder="e.g. AgentFlow Tech Pvt Ltd"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    WhatsApp Mobile Number
                  </label>
                  <input
                    type="text"
                    value={proposal.clientPhone}
                    onChange={(e) => setProposal({ ...proposal, clientPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Client Email</label>
                  <input
                    type="email"
                    value={proposal.clientEmail}
                    onChange={(e) => setProposal({ ...proposal, clientEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    placeholder="client@company.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Milestones & Deliverables Builder */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs">
                  2
                </span>
                <span>Milestones & Deliverable Timelines</span>
              </h3>
              <button
                type="button"
                onClick={handleAddMilestone}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100 transition-colors"
              >
                <Icons.Plus className="w-3.5 h-3.5" />
                <span>Add Milestone</span>
              </button>
            </div>

            <div className="space-y-3.5">
              {proposal.milestones.map((m, index) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 relative group hover:border-slate-300 transition-colors text-xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-700">Milestone {index + 1}</span>
                    {proposal.milestones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMilestone(m.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete milestone"
                      >
                        <Icons.Trash className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <input
                      type="text"
                      value={m.title}
                      onChange={(e) => handleMilestoneChange(m.id, 'title', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
                      placeholder="Milestone Title"
                    />

                    <textarea
                      rows={2}
                      value={m.description}
                      onChange={(e) =>
                        handleMilestoneChange(m.id, 'description', e.target.value)
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-slate-700 focus:outline-none focus:border-indigo-500"
                      placeholder="Key deliverables and handoff specs..."
                    />

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="text-[11px] text-slate-500 block mb-0.5">
                          Delivery Date
                        </label>
                        <input
                          type="date"
                          value={m.deliverableDate}
                          onChange={(e) =>
                            handleMilestoneChange(m.id, 'deliverableDate', e.target.value)
                          }
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-500 block mb-0.5">
                          Amount (₹ INR)
                        </label>
                        <input
                          type="number"
                          value={m.amount}
                          onChange={(e) =>
                            handleMilestoneChange(m.id, 'amount', Number(e.target.value))
                          }
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
                          placeholder="Amount in INR"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Price Calculation & Taxes */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs">
                3
              </span>
              <span>Pricing Breakdown & Tax Engine</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-600">Milestone Subtotal</span>
                <span className="font-semibold text-slate-900">{formatINR(proposal.subtotal)}</span>
              </div>

              {/* Discount Input */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-slate-600 font-medium block">Early Bird / Flat Discount</span>
                  <span className="text-[11px] text-slate-400">Direct discount in ₹ INR</span>
                </div>
                <div className="w-32">
                  <input
                    type="number"
                    value={proposal.discount}
                    onChange={(e) => handleDiscountChange(Number(e.target.value))}
                    className="w-full px-2.5 py-1 text-right bg-slate-50 border border-slate-200 rounded font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* GST Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-800 font-medium">18% Indian GST</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                      SAC: 998314
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Calculated on taxable subtotal
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleGstToggle}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${proposal.gstApplicable ? 'bg-indigo-600' : 'bg-slate-300'
                    }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${proposal.gstApplicable ? 'translate-x-5' : 'translate-x-0'
                      }`}
                  />
                </button>
              </div>

              {proposal.gstApplicable && (
                <div className="flex items-center justify-between text-slate-500 pl-2">
                  <span>
                    GST (18% on {formatINR(Math.max(0, proposal.subtotal - proposal.discount))})
                  </span>
                  <span className="font-medium text-slate-700">
                    {formatINR(Math.max(0, proposal.subtotal - proposal.discount) * 0.18)}
                  </span>
                </div>
              )}

              {/* Grand Total */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between bg-slate-50 -mx-5 -mb-5 p-5 rounded-b-xl">
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 block">
                    Total Proposal Value
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {proposal.milestones.length} escrow milestones
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-slate-900 block">
                    {formatINR(proposal.totalAmount)}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium">
                    No hidden deductions
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Live Client View & E-Sign Signature Pad (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-slate-700">
                Live Client Preview Pane
              </span>
            </div>
            <div className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Interactive Scope Viewer
            </div>
          </div>

          {/* Client View Proposal Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 relative overflow-hidden">
            {/* Top Verified Ribbon */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={mockFreelancerProfile.avatar}
                  alt={mockFreelancerProfile.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-100"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 text-sm">
                      {mockFreelancerProfile.name}
                    </span>
                    <Icons.CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span>{mockFreelancerProfile.role}</span>
                    <span>•</span>
                    <span className="text-amber-500 font-medium">★ 4.9 Trust</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Proposal For
                </span>
                <span className="text-xs font-bold text-slate-900">{proposal.clientName}</span>
                {proposal.clientCompany && (
                  <span className="text-[11px] text-slate-500 block">
                    {proposal.clientCompany}
                  </span>
                )}
              </div>
            </div>

            {/* Proposal Scope Title */}
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                Project Scope Document
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">{proposal.title}</h3>
              <p className="text-xs text-slate-500 mt-1">
                Valid until {proposal.validUntil} • Protected by PaidFlow Verified Escrow
              </p>
            </div>

            {/* Client Milestones Roadmap */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                Scope & Delivery Roadmap
              </span>

              <div className="space-y-2.5">
                {proposal.milestones.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-lg border border-slate-200/90 bg-slate-50/50 space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{m.title}</span>
                      <span className="font-bold text-slate-900">{formatINR(m.amount)}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{m.description}</p>
                    <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Delivery Target: {m.deliverableDate}</span>
                      <span className="text-emerald-700 font-medium">UPI Direct Release</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Milestone Subtotal</span>
                <span>{formatINR(proposal.subtotal)}</span>
              </div>
              {proposal.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Discount Applied</span>
                  <span>-{formatINR(proposal.discount)}</span>
                </div>
              )}
              {proposal.gstApplicable && (
                <div className="flex justify-between text-slate-600">
                  <span>GST (18%)</span>
                  <span>
                    {formatINR(Math.max(0, proposal.subtotal - proposal.discount) * 0.18)}
                  </span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                <span>Total Commitment</span>
                <span className="text-indigo-600">{formatINR(proposal.totalAmount)}</span>
              </div>
            </div>

            {/* E-Sign Signature Canvas Box */}
            <SignatureCanvas
              onSignatureCapture={(dataUrl) => setSignatureData(dataUrl)}
              isSigned={isSignedByClient}
              signedDate={proposal.clientSignedAt}
            />

            {/* Client Approval Action Button */}
            {!isSignedByClient ? (
              <button
                type="button"
                onClick={handleApproveSignature}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-md transition-all"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
                <span>Simulate Client E-Sign & Approve</span>
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
                <Icons.CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Agreement Active: Milestones Ready for Invoice Generation</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};