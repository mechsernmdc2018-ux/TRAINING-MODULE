import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  Plus,
} from 'lucide-react';
import { AuditFinding } from '../types';

export const AuditManagement: React.FC = () => {
  const {
    auditFindings,
    addAuditFinding,
    updateAuditFindingStatus,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'OPEN' | 'UNDER_ACTION' | 'CLOSED'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [category, setCategory] = useState<AuditFinding['checklistCategory']>('MVT Compliance');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<AuditFinding['severity']>('HIGH');
  const [responsiblePerson, setResponsiblePerson] = useState('');
  const [dueDate, setDueDate] = useState('2026-10-20');
  const [action, setAction] = useState('');

  const checklistItems = [
    { title: 'Form B Statutory MVT Register maintained up-to-date', status: 'COMPLIANT' },
    { title: 'Initial vocational training completed prior to pit entry', status: 'COMPLIANT' },
    { title: 'Periodic refresher vocational training compliance ≥ 90%', status: 'ACTION_REQUIRED' },
    { title: 'Contractor safety induction passports verified', status: 'COMPLIANT' },
    { title: '13-Point HEMM operator practical competency checks current', status: 'ACTION_REQUIRED' },
    { title: 'Bi-annual mine evacuation mock drill conducted & documented', status: 'COMPLIANT' },
    { title: 'VTC training infrastructure & simulator calibration', status: 'COMPLIANT' },
    { title: 'Statutory rule changes superseded with traceable version history', status: 'COMPLIANT' },
  ];

  const handleCreateFinding = (e: React.FormEvent) => {
    e.preventDefault();
    addAuditFinding({
      checklistCategory: category,
      findingDescription: description,
      severity,
      responsiblePerson,
      dueDate,
      correctiveAction: action,
      status: 'OPEN',
    });
    setShowAddModal(false);
    alert('Audit finding successfully logged into statutory CAPA registry.');
  };

  const filteredFindings = auditFindings.filter((f) => {
    if (activeFilter !== 'ALL' && f.status !== activeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700">
                <FileText className="w-5 h-5" />
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase">
                DGMS & STATUTORY SAFETY AUDIT & CAPA CENTRE
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Internal & external statutory audits • Checklist compliance • Finding → Action Assigned → Evidence → Closure
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 text-xs font-bold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>LOG AUDIT FINDING</span>
          </button>
        </div>

        {/* Audit Checklist Status Radar */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {checklistItems.map((item, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start justify-between gap-2">
              <span className="text-slate-800 font-medium leading-snug">{item.title}</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                  item.status === 'COMPLIANT'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                {item.status.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Findings & CAPA Workflow */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
              Audit Findings & Corrective Action (CAPA) Pipeline
            </h3>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
            {(['ALL', 'OPEN', 'UNDER_ACTION', 'CLOSED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setActiveFilter(st)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  activeFilter === st ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 mt-4">
          {filteredFindings.map((finding) => (
            <div key={finding.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-amber-800 text-xs">{finding.id}</span>
                  <span className="text-xs text-slate-500">• {finding.checklistCategory}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      finding.severity === 'CRITICAL'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : finding.severity === 'HIGH'
                        ? 'bg-orange-50 text-orange-700 border border-orange-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {finding.severity}
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      finding.status === 'CLOSED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {finding.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="text-xs font-semibold text-slate-900 leading-relaxed">
                {finding.findingDescription}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-slate-700 pt-1 border-t border-slate-200/80">
                <div>Responsible: <strong className="text-slate-900">{finding.responsiblePerson}</strong></div>
                <div>Target Closure Date: <strong className="text-amber-800 font-mono font-semibold">{finding.dueDate}</strong></div>
                <div>Assigned: {finding.actionAssignedDate}</div>
              </div>

              <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-700">
                <span className="text-emerald-700 font-semibold block text-[10px] uppercase">Enforced Corrective Action:</span>
                {finding.correctiveAction}
              </div>

              {/* Progress and status advance */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-xs">
                <div className="text-[11px] text-slate-500">
                  {finding.evidenceNotes && <span>Evidence: {finding.evidenceNotes}</span>}
                </div>

                <div className="flex items-center gap-2">
                  {finding.status === 'OPEN' && (
                    <button
                      onClick={() => updateAuditFindingStatus(finding.id, 'UNDER_ACTION', 'Corrective action initiated')}
                      className="px-3 py-1 text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300 rounded hover:bg-amber-100 cursor-pointer"
                    >
                      Move to Under Action
                    </button>
                  )}
                  {finding.status === 'UNDER_ACTION' && (
                    <button
                      onClick={() => updateAuditFindingStatus(finding.id, 'CLOSED', 'Verified by Statutory Safety Officer')}
                      className="px-3 py-1 text-[11px] font-bold bg-emerald-600 text-white rounded hover:bg-emerald-500 cursor-pointer"
                    >
                      Verify & Close Finding
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Finding Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">Log Audit Finding</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <form onSubmit={handleCreateFinding} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Checklist Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1 focus:bg-white"
                >
                  <option value="MVT Compliance">MVT Compliance</option>
                  <option value="HEMM Competency">HEMM Competency</option>
                  <option value="Contractor Compliance">Contractor Compliance</option>
                  <option value="Statutory Registers">Statutory Registers</option>
                  <option value="Safety Training Infrastructure">Safety Training Infrastructure</option>
                  <option value="Toolbox & Induction Records">Toolbox & Induction Records</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Finding Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail the non-compliance or observation..."
                  className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1 focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Target Closure Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Responsible Official / Contractor</label>
                <input
                  type="text"
                  placeholder="e.g. Training Officer / Safety Officer / Contractor Safety Engr"
                  value={responsiblePerson}
                  onChange={(e) => setResponsiblePerson(e.target.value)}
                  className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Prescribed Corrective Action</label>
                <textarea
                  rows={2}
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  placeholder="Mandatory remedial actions..."
                  className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1 focus:bg-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-3 py-1.5 text-slate-500 hover:text-slate-700">Cancel</button>
                <button type="submit" className="px-4 py-1.5 font-bold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400">Save Finding</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
