'use client';

import React, { useState } from 'react';
import { OverviewDashboard } from './dashboard/OverviewDashboard';
import { ProposalCreator } from './proposals/ProposalCreator';
import { mockTransactions, mockProposals } from '../data/mockData';
import { Proposal, Transaction } from '../types';

export type UserRole = 'freelancer' | 'team_member' | 'client';

export function MainApp() {
    const [activeTab, setActiveTab] = useState<'overview' | 'proposals' | 'invoices' | 'trust'>('overview');
    const [currentRole, setCurrentRole] = useState<UserRole>('freelancer');

    // Defensive array initialization to prevent undefined .find()
    const [transactions] = useState<Transaction[]>(() =>
        Array.isArray(mockTransactions) ? mockTransactions : []
    );

    const fallbackProposal: Proposal = {
        id: 'prop_01',
        title: 'CRED Mobile App Micro-Interactions & Tokens',
        clientName: 'Kunal Shah',
        clientCompany: 'CRED',
        clientEmail: 'kunal@cred.club',
        clientPhone: '+91 98765 00001',
        totalAmount: 145000,
        subtotal: 145000,
        discount: 0,
        gstApplicable: false,
        createdAt: '2026-10-30',
        currency: 'INR',
        gstRate: 18,
        status: 'Approved',
        signedByClient: true,
        validUntil: '2026-11-30',
        milestones: [
            {
                id: 'ms_1',
                title: 'Design System & Micro-Interactions',
                description: 'Figma prototypes, spline assets, and animation curves.',
                deliverableDate: '2026-11-10',
                amount: 70000,
                status: 'Completed',
            },
        ],
    };

    const [proposals, setProposals] = useState<Proposal[]>(() =>
        Array.isArray(mockProposals) && mockProposals.length > 0 ? mockProposals : [fallbackProposal]
    );

    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [userPassword, setUserPassword] = useState('');
    const [loginFeedback, setLoginFeedback] = useState<string | null>(null);

    const defaultProposal: Proposal = (proposals && proposals[0]) ? proposals[0] : fallbackProposal;

    const metrics = {
        totalSettledRevenue: 1485000,
        settledGrowthPercent: '+18.4%',
        pendingInvoicesCount: 3,
        pendingInvoicesAmount: 182500,
        activeProjectsCount: 3,
        verifiedTrustScore: 4.92,
        maxTrustScore: 5.0,
        trustReviewsCount: 38,
        onTimePaymentRate: 98,
    };

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userEmail) {
            setLoginFeedback('Please enter your email or VPA handle.');
            return;
        }
        setLoginFeedback(`Signed in successfully as ${userEmail.split('@')[0]}!`);
        setTimeout(() => {
            setIsLoginModalOpen(false);
            setLoginFeedback(null);
        }, 1200);
    };

    const handleQuickLoginAs = (role: UserRole) => {
        setCurrentRole(role);
        setIsLoginModalOpen(false);
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800 antialiased font-sans">
            {/* Header Bar */}
            <header className="bg-slate-900 border-b border-slate-800 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs relative z-40">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-indigo-400 uppercase tracking-wider text-[10px] bg-indigo-950 border border-indigo-800 px-2 py-0.5 rounded">
                        PaidFlow Pro
                    </span>
                    <span className="text-slate-300 hidden sm:inline">Active View:</span>
                    <span className="font-semibold text-slate-100">
                        {currentRole === 'freelancer' ? 'Arjun Verma (Freelancer)' : currentRole === 'team_member' ? 'Rohan (Video Editor)' : 'Kunal Shah (CRED Client)'}
                    </span>
                </div>

                {/* Right Action Icons: Login & Menu */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setIsLoginModalOpen(true)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-all shadow-xs flex items-center gap-1.5"
                    >
                        <span>👤</span>
                        <span>Freelancer Login</span>
                    </button>

                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium border border-slate-700 transition-all flex items-center gap-1.5"
                        >
                            <span>☰</span>
                            <span>Menu</span>
                        </button>

                        {isMenuOpen && (
                            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 text-xs">
                                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                                    <span className="font-bold text-sm text-slate-900">Workspace Directory</span>
                                    <button
                                        type="button"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="text-slate-400 hover:text-slate-700 font-bold p-1 rounded"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
                                    {/* Category 1: Delivery & Scopes */}
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider block mb-1.5">
                                            1. Delivery & Scopes
                                        </span>
                                        <div className="space-y-1">
                                            <button
                                                type="button"
                                                onClick={() => { setActiveTab('overview'); setIsMenuOpen(false); }}
                                                className="w-full text-left p-2 rounded-lg hover:bg-slate-50 flex items-center justify-between"
                                            >
                                                <span className="font-semibold text-slate-800">Projects & Deadlines</span>
                                                <span className="text-[10px] text-slate-400">Cards →</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setActiveTab('proposals'); setIsMenuOpen(false); }}
                                                className="w-full text-left p-2 rounded-lg hover:bg-slate-50 flex items-center justify-between"
                                            >
                                                <span className="font-semibold text-slate-800">Deliverables & Versions</span>
                                                <span className="text-[10px] text-slate-400">v1 / v2 →</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Category 2: Financials & Risk Controls */}
                                    <div className="pt-2 border-t border-slate-100">
                                        <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider block mb-1.5">
                                            2. Financials & Cash Risk
                                        </span>
                                        <div className="space-y-1">
                                            <button
                                                type="button"
                                                onClick={() => { setActiveTab('invoices'); setIsMenuOpen(false); }}
                                                className="w-full text-left p-2 rounded-lg hover:bg-slate-50 flex items-center justify-between"
                                            >
                                                <span className="font-semibold text-slate-800">UPI Instant Invoicing</span>
                                                <span className="text-[10px] text-slate-400">Zero Fees →</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setActiveTab('overview'); setIsMenuOpen(false); }}
                                                className="w-full text-left p-2 rounded-lg hover:bg-slate-50 flex items-center justify-between"
                                            >
                                                <span className="font-semibold text-slate-800">Delay Impact Simulator</span>
                                                <span className="text-[10px] text-slate-400">Runway Days →</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setActiveTab('overview'); setIsMenuOpen(false); }}
                                                className="w-full text-left p-2 rounded-lg hover:bg-slate-50 flex items-center justify-between"
                                            >
                                                <span className="font-semibold text-slate-800">Concentration Meter</span>
                                                <span className="text-[10px] text-slate-400">Risk Gauge →</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Category 3: Trust & Reviews */}
                                    <div className="pt-2 border-t border-slate-100">
                                        <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider block mb-1.5">
                                            3. Reputation & Verification
                                        </span>
                                        <div className="space-y-1">
                                            <button
                                                type="button"
                                                onClick={() => { setActiveTab('trust'); setIsMenuOpen(false); }}
                                                className="w-full text-left p-2 rounded-lg hover:bg-slate-50 flex items-center justify-between"
                                            >
                                                <span className="font-semibold text-slate-800">Verified Client Reviews</span>
                                                <span className="text-[10px] text-slate-400">4.92 / 5.0 ★ →</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Category 4: Role Switcher */}
                                    <div className="pt-2 border-t border-slate-100 bg-slate-50 p-2.5 rounded-xl">
                                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1.5">
                                            4. Switch Active Role
                                        </span>
                                        <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                                            <button
                                                type="button"
                                                onClick={() => { setCurrentRole('freelancer'); setIsMenuOpen(false); }}
                                                className={`py-1.5 px-2 rounded-md font-medium text-center ${currentRole === 'freelancer' ? 'bg-indigo-600 text-white font-bold' : 'bg-white border text-slate-700'
                                                    }`}
                                            >
                                                Freelancer
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setCurrentRole('team_member'); setIsMenuOpen(false); }}
                                                className={`py-1.5 px-2 rounded-md font-medium text-center ${currentRole === 'team_member' ? 'bg-amber-600 text-white font-bold' : 'bg-white border text-slate-700'
                                                    }`}
                                            >
                                                Editor
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setCurrentRole('client'); setIsMenuOpen(false); }}
                                                className={`py-1.5 px-2 rounded-md font-medium text-center ${currentRole === 'client' ? 'bg-emerald-600 text-white font-bold' : 'bg-white border text-slate-700'
                                                    }`}
                                            >
                                                Client
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Layout */}
            <div className="flex-1 flex flex-col md:flex-row">
                {/* Sidebar */}
                <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 p-5 shrink-0 flex flex-col justify-between">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                                ₹
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <span className="font-extrabold text-slate-900 tracking-tight text-base">PaidFlow</span>
                                    <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                                        {currentRole === 'freelancer' ? 'LEAD' : currentRole === 'team_member' ? 'COLLAB' : 'CLIENT'}
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-400">Cash Flow & Delivery Guard</p>
                            </div>
                        </div>

                        {currentRole !== 'client' && (
                            <div className="space-y-2">
                                {currentRole === 'freelancer' && (
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('invoices')}
                                        className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                                    >
                                        <span>+ Quick UPI Invoice</span>
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('proposals')}
                                    className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                                >
                                    <span>{currentRole === 'freelancer' ? '✎ Scope & Proposals' : '📂 Deliverables Portal'}</span>
                                </button>
                            </div>
                        )}

                        <nav className="space-y-1">
                            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-3 block mb-2">
                                Workspace
                            </span>

                            <button
                                type="button"
                                onClick={() => setActiveTab('overview')}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${activeTab === 'overview'
                                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <span>⊞</span>
                                    <span>{currentRole === 'client' ? 'Client Dashboard' : 'Overview & Risk Pulse'}</span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-normal">Live</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('proposals')}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${activeTab === 'proposals'
                                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <span>📄</span>
                                    <span>{currentRole === 'client' ? 'Sign & Approve Scopes' : 'Deliverables & Scope'}</span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-normal">Active</span>
                            </button>

                            {currentRole !== 'team_member' && (
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('invoices')}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${activeTab === 'invoices'
                                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <span>💳</span>
                                        <span>{currentRole === 'client' ? 'Pay Milestones (UPI)' : 'UPI Invoicing'}</span>
                                    </div>
                                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-medium">
                                        Instant
                                    </span>
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={() => setActiveTab('trust')}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${activeTab === 'trust'
                                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <span>🛡</span>
                                    <span>Trust & Reviews</span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono">4.9 ★</span>
                            </button>
                        </nav>
                    </div>

                    <div className="pt-4 border-t border-slate-100 mt-6 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs ${currentRole === 'freelancer' ? 'bg-indigo-700' : currentRole === 'team_member' ? 'bg-amber-600' : 'bg-emerald-700'
                                }`}>
                                {currentRole === 'freelancer' ? 'AV' : currentRole === 'team_member' ? 'ED' : 'KS'}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-900 leading-tight">
                                    {currentRole === 'freelancer' ? 'Arjun Verma' : currentRole === 'team_member' ? 'Rohan (Editor)' : 'Kunal Shah'}
                                </p>
                                <p className="text-[10px] text-slate-400">
                                    {currentRole === 'freelancer' ? '9079879010@fam' : currentRole === 'team_member' ? 'rohan.edit@gmail.com' : 'kunal@cred.club'}
                                </p>
                            </div>
                        </div>
                        <span className="w-2 h-2 rounded-full bg-emerald-500" title="Session Active" />
                    </div>
                </aside>

                {/* Content Section */}
                <section className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl">
                    {activeTab === 'overview' && (
                        <OverviewDashboard
                            metrics={metrics}
                            transactions={transactions}
                            onNewProposal={() => setActiveTab('proposals')}
                            onQuickInvoice={() => setActiveTab('invoices')}
                            onShareReputation={() => setActiveTab('trust')}
                            onNavigateTab={(tab) => setActiveTab(tab as any)}
                            onActionClick={() => setActiveTab('invoices')}
                        />
                    )}

                    {activeTab === 'proposals' && (
                        <ProposalCreator
                            initialProposal={defaultProposal}
                            onSaveProposal={(updated) => {
                                setProposals((prev) =>
                                    Array.isArray(prev) ? prev.map((p) => (p?.id === updated?.id ? updated : p)) : [updated]
                                );
                            }}
                        />
                    )}

                    {activeTab === 'invoices' && (
                        <div className="bg-white p-6 rounded-2xl border border-slate-200">
                            <h2 className="text-lg font-bold text-slate-900 mb-2">UPI Invoicing & Settlements</h2>
                            <p className="text-xs text-slate-500 mb-4">Zero fee instant UPI QR codes & milestone escrow links.</p>
                            <button
                                type="button"
                                onClick={() => setActiveTab('overview')}
                                className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg"
                            >
                                ← Back to Overview
                            </button>
                        </div>
                    )}

                    {activeTab === 'trust' && (
                        <div className="bg-white p-6 rounded-2xl border border-slate-200">
                            <h2 className="text-lg font-bold text-slate-900 mb-2">Verified Trust & Reviews</h2>
                            <p className="text-xs text-slate-500 mb-4">4.92 / 5.0 score verified across 38 on-chain client UPI settlements.</p>
                            <button
                                type="button"
                                onClick={() => setActiveTab('overview')}
                                className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg"
                            >
                                ← Back to Overview
                            </button>
                        </div>
                    )}
                </section>
            </div>

            {/* Freelancer Login Modal */}
            {isLoginModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                            <div className="flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                                    ₹
                                </span>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">Freelancer Portal Login</h3>
                                    <p className="text-[11px] text-slate-400">Access your UPI escrow, scopes & trust stats</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsLoginModalOpen(false)}
                                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleLoginSubmit} className="p-5 space-y-4">
                            {loginFeedback && (
                                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                                    {loginFeedback}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Freelancer Email / VPA ID</label>
                                <input
                                    type="text"
                                    placeholder="9079879010@fam"
                                    value={userEmail}
                                    onChange={(e) => setUserEmail(e.target.value)}
                                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Passcode / OTP</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={userPassword}
                                    onChange={(e) => setUserPassword(e.target.value)}
                                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-xs"
                            >
                                Sign In to Dashboard
                            </button>

                            <div className="pt-3 border-t border-slate-100">
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block mb-2 text-center">
                                    Or Instant Demo 1-Click Login
                                </span>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleQuickLoginAs('freelancer')}
                                        className="p-2 text-center rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 text-[11px] font-semibold transition-colors"
                                    >
                                        Arjun (Lead)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleQuickLoginAs('team_member')}
                                        className="p-2 text-center rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-100 text-[11px] font-semibold transition-colors"
                                    >
                                        Rohan (Editor)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleQuickLoginAs('client')}
                                        className="p-2 text-center rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 text-[11px] font-semibold transition-colors"
                                    >
                                        Kunal (Client)
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}