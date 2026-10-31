'use client';

import React, { useState } from 'react';
import { Project, UserRole } from '../../types';
import { Icons } from '../ui/Icons';
import { formatINR, getDeadlineStatus, formatDate } from '../../utils/formatters';

interface ProjectsViewProps {
  projects: Project[];
  currentUserRole: UserRole;
  onSelectProject: (projectId: string) => void;
  onNavigateDeliverables: () => void;
  onNewProposal: () => void;
  onAddBillableScope: (projectId: string, amount: number) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects = [],
  currentUserRole = 'freelancer',
  onSelectProject,
  onNavigateDeliverables,
  onNewProposal,
  onAddBillableScope,
}) => {
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = projects.filter((proj) => {
    const matchSearch =
      (proj.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (proj.clientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (proj.clientCompany || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchSearch) return false;

    if (filter === 'in_progress') return proj.status === 'In Progress' || proj.status === 'Pending Review';
    if (filter === 'completed') return proj.status === 'Completed';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
              Contract Workspaces
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">Delivery Sprints & Deadlines</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 mt-1 tracking-tight">
            Projects & Deadlines
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Track active scopes, milestone deadlines, deliverable completion rates, and billable scope additions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onNavigateDeliverables}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            Review Deliverables →
          </button>
          {currentUserRole === 'freelancer' && (
            <button
              type="button"
              onClick={onNewProposal}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Icons.Plus className="w-3.5 h-3.5" />
              <span>+ New Project Scope</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/70 text-xs font-medium w-fit">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'all' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Projects ({projects.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('in_progress')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'in_progress' ? 'bg-white text-indigo-700 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            In Progress
          </button>
          <button
            type="button"
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'completed' ? 'bg-white text-emerald-800 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed
          </button>
        </div>

        <div className="relative">
          <Icons.Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-full sm:w-60"
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.map((project) => {
          const deadlineStatus = getDeadlineStatus(project.deadline);
          const delivList = project.deliverables || [];
          const totalDeliv = project.totalDeliverables || delivList.length || 1;
          const completedDeliv =
            project.completedDeliverables ||
            delivList.filter((d) => d.status === 'Approved').length ||
            0;
          const progressPct = Math.min(100, Math.round((completedDeliv / totalDeliv) * 100));

          return (
            <div
              key={project.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3.5">
                {/* Header line: Client company + Deadline Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                      {project.clientCompany}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-0.5 leading-snug group-hover:text-indigo-600 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Lead: {project.clientName}</p>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
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

                {/* Progress Bar */}
                <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600">
                      Deliverables: <strong>{completedDeliv}/{totalDeliv}</strong>
                    </span>
                    <span className="font-mono font-bold text-indigo-700">{progressPct}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                {/* Due Date & Scope Budget */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Target Delivery</span>
                    <span className="font-semibold text-slate-700">{formatDate(project.deadline)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Scope Budget</span>
                    <span className="font-bold text-slate-900">
                      {currentUserRole === 'team_member'
                        ? 'Confidential'
                        : formatINR(project.totalBudget || project.budget || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelectProject(project.id)}
                  className="flex-1 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Icons.Search className="w-3.5 h-3.5" />
                  <span>Inspect Scopes</span>
                </button>
                {currentUserRole === 'freelancer' && (
                  <button
                    type="button"
                    onClick={() => onAddBillableScope(project.id, 5000)}
                    className="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                    title="Add +₹5,000 Billable Scope Creep"
                  >
                    +₹5k Scope
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

