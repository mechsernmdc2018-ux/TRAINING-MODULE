import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileCheck2,
  Plus,
  Search,
  Info,
} from 'lucide-react';
import { StatutoryRequirement, WorkerClassification } from '../types';

export const StatutoryCompliance: React.FC = () => {
  const {
    statutoryRequirements,
    addStatutoryRequirement,
    supersedeStatutoryRequirement,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUPERSEDED'>('ALL');
  const [selectedReq, setSelectedReq] = useState<StatutoryRequirement | null>(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSupersedeModal, setShowSupersedeModal] = useState(false);
  const [supersedeTarget, setSupersedeTarget] = useState<StatutoryRequirement | null>(null);
  const [supersedeNote, setSupersedeNote] = useState('');

  // Add Form state
  const [newActCode, setNewActCode] = useState('Mines Act 1952 / Mines Vocational Training Rules 1966');
  const [newRuleRegulation, setNewRuleRegulation] = useState('');
  const [newDgmsRef, setNewDgmsRef] = useState('');
  const [newCircularNo, setNewCircularNo] = useState('');
  const [newIssueDate, setNewIssueDate] = useState('2026-01-01');
  const [newEffectiveDate, setNewEffectiveDate] = useState('2026-02-01');
  const [newRequirementDesc, setNewRequirementDesc] = useState('');
  const [newCategory] = useState<WorkerClassification[] | 'ALL'>('ALL');
  const [newFrequency, setNewFrequency] = useState(36);
  const [newValidity, setNewValidity] = useState(36);
  const [newMinDuration, setNewMinDuration] = useState(36);
  const [newAssessmentReq, setNewAssessmentReq] = useState(true);
  const [newCertReq, setNewCertReq] = useState(true);
  const [newEvidence, setNewEvidence] = useState('Form B MVT Register / Competency Certificate');
  const [newDepartment, setNewDepartment] = useState('Training');
  const [newStatus, setNewStatus] = useState<StatutoryRequirement['status']>('ACTIVE');
  const [newNotes, setNewNotes] = useState('');

  const filteredRequirements = statutoryRequirements.filter((req) => {
    if (statusFilter !== 'ALL' && req.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchAct = req.actCode.toLowerCase().includes(q);
      const matchRule = req.ruleRegulation.toLowerCase().includes(q);
      const matchDgms = req.dgmsReference.toLowerCase().includes(q);
      const matchDesc = req.trainingRequirement.toLowerCase().includes(q);
      if (!matchAct && !matchRule && !matchDgms && !matchDesc) return false;
    }
    return true;
  });

  const handleCreateRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    addStatutoryRequirement({
      actCode: newActCode,
      ruleRegulation: newRuleRegulation,
      dgmsReference: newDgmsRef,
      circularNumber: newCircularNo,
      issueDate: newIssueDate,
      effectiveDate: newEffectiveDate,
      trainingRequirement: newRequirementDesc,
      applicableWorkerCategory: newCategory,
      applicableActivity: 'Donimalai Mine Operations',
      frequencyMonths: Number(newFrequency),
      validityMonths: Number(newValidity),
      minimumDurationHours: Number(newMinDuration),
      assessmentRequired: newAssessmentReq,
      certificateRequired: newCertReq,
      evidenceRequired: newEvidence,
      responsibleDepartment: newDepartment,
      status: newStatus,
      version: '1.0',
      notes: newNotes || (newStatus === 'PENDING_VERIFICATION' ? 'Applicable statutory requirement pending verification by authorised Training & Safety Officer.' : undefined),
    });

    setShowAddModal(false);
    resetForm();
    alert('Statutory Requirement successfully added to compliance engine. Linage logged in audit trail.');
  };

  const handleSupersedeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (supersedeTarget && supersedeNote.trim()) {
      supersedeStatutoryRequirement(supersedeTarget.id, supersedeNote.trim());
      setShowSupersedeModal(false);
      setSupersedeTarget(null);
      setSupersedeNote('');
      alert(`Statutory Requirement ${supersedeTarget.id} has been superseded. Historical compliance records retained under previous version.`);
    }
  };

  const resetForm = () => {
    setNewRuleRegulation('');
    setNewDgmsRef('');
    setNewCircularNo('');
    setNewRequirementDesc('');
    setNewNotes('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Statutory Header */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-700">
                <FileCheck2 className="w-5 h-5" />
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase">
                CONFIGURABLE STATUTORY COMPLIANCE ENGINE
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Zero-hardcoding engine • Configure Acts, Rules, DGMS circulars, frequencies, and validity without code modifications
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 text-xs font-bold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>CONFIGURE NEW REQUIREMENT</span>
          </button>
        </div>

        {/* Legal Integrity Callout */}
        <div className="mt-4 p-3 rounded-lg bg-amber-50/80 border border-amber-200 flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
          <div className="text-xs text-amber-950 leading-relaxed">
            <strong className="text-amber-900">Statutory Lineage Principle:</strong> All employee historical compliance records permanently retain the specific rule version in effect when training was conducted. Unverified legislative amendments display: <span className="italic font-medium text-amber-900">"Applicable statutory requirement pending verification by authorised Training & Safety Officer."</span> Statutory rules are never permanently deleted.
          </div>
        </div>
      </div>

      {/* Rules Registry Table & Filters */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Act, DGMS circular, rule, keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 text-xs text-slate-900 pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
              {(['ALL', 'ACTIVE', 'PENDING_VERIFICATION', 'SUPERSEDED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                    statusFilter === st ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <span className="text-xs font-mono text-slate-500">
            {filteredRequirements.length} Configured Rules
          </span>
        </div>

        {/* Requirements Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                <th className="py-2.5 px-3">Req ID & Version</th>
                <th className="py-2.5 px-3">Act / Rule Reference</th>
                <th className="py-2.5 px-3">DGMS Reference / Circular</th>
                <th className="py-2.5 px-3">Frequency & Validity</th>
                <th className="py-2.5 px-3">Min Hours</th>
                <th className="py-2.5 px-3 text-center">Exam & Cert</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequirements.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3">
                    <span className="font-mono font-bold text-amber-800">{req.id}</span>
                    <span className="block text-[10px] text-slate-500 font-mono">v{req.version}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-slate-900">{req.ruleRegulation}</div>
                    <div className="text-[11px] text-slate-500">{req.actCode}</div>
                    {req.status === 'PENDING_VERIFICATION' && (
                      <div className="mt-1 text-[10px] text-amber-900 font-medium italic bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Applicable statutory requirement pending verification by authorised Training & Safety Officer.
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="text-slate-800 font-medium">{req.dgmsReference}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{req.circularNumber}</div>
                  </td>
                  <td className="py-2.5 px-3 font-mono">
                    <div className="text-slate-800">{req.frequencyMonths} Mo Freq</div>
                    <div className="text-[10px] text-slate-500">{req.validityMonths} Mo Validity</div>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-800">
                    {req.minimumDurationHours} hrs
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${req.assessmentRequired ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'}`}>
                        {req.assessmentRequired ? 'Exam' : 'No Exam'}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${req.certificateRequired ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-slate-100 text-slate-500'}`}>
                        {req.certificateRequired ? 'Cert' : 'No Cert'}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        req.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : req.status === 'PENDING_VERIFICATION'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : req.status === 'SUPERSEDED'
                          ? 'bg-slate-100 text-slate-500 border border-slate-200 line-through'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {req.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedReq(req)}
                        className="px-2 py-1 text-[11px] rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                        title="View Full Parameters & Lineage"
                      >
                        Inspect
                      </button>
                      {req.status === 'ACTIVE' && (
                        <button
                          onClick={() => {
                            setSupersedeTarget(req);
                            setShowSupersedeModal(true);
                          }}
                          className="px-2 py-1 text-[11px] font-semibold rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 cursor-pointer"
                          title="Supersede with updated rule version"
                        >
                          Supersede
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Requirement Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                  Configure Statutory / DGMS Requirement
                </h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRequirement} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Act / Code Authority</label>
                  <input
                    type="text"
                    value={newActCode}
                    onChange={(e) => setNewActCode(e.target.value)}
                    className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1 focus:bg-white focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Rule / Regulation Reference</label>
                  <input
                    type="text"
                    placeholder="e.g. Rule 6 / Rule 9 Refresher Training"
                    value={newRuleRegulation}
                    onChange={(e) => setNewRuleRegulation(e.target.value)}
                    className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1 focus:bg-white focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">DGMS Circular Reference</label>
                  <input
                    type="text"
                    placeholder="e.g. DGMS(Tech) Circular No. 04 of 2020"
                    value={newDgmsRef}
                    onChange={(e) => setNewDgmsRef(e.target.value)}
                    className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Circular / Notification Number</label>
                  <input
                    type="text"
                    placeholder="e.g. DGMS(Tech)/Cir.04/2020"
                    value={newCircularNo}
                    onChange={(e) => setNewCircularNo(e.target.value)}
                    className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Training Requirement Description</label>
                <textarea
                  rows={2}
                  value={newRequirementDesc}
                  onChange={(e) => setNewRequirementDesc(e.target.value)}
                  placeholder="Describe the mandatory compliance requirement syllabus and scope..."
                  className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1 focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Frequency (Months)</label>
                  <input
                    type="number"
                    value={newFrequency}
                    onChange={(e) => setNewFrequency(Number(e.target.value))}
                    className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1"
                    min="1"
                    max="120"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Validity (Months)</label>
                  <input
                    type="number"
                    value={newValidity}
                    onChange={(e) => setNewValidity(Number(e.target.value))}
                    className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1"
                    min="1"
                    max="120"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Min Duration (Hours)</label>
                  <input
                    type="number"
                    value={newMinDuration}
                    onChange={(e) => setNewMinDuration(Number(e.target.value))}
                    className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1"
                    min="1"
                    max="100"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={newAssessmentReq}
                      onChange={(e) => setNewAssessmentReq(e.target.checked)}
                      className="rounded border-slate-300 text-amber-500"
                    />
                    <span>Assessment Required</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={newCertReq}
                      onChange={(e) => setNewCertReq(e.target.checked)}
                      className="rounded border-slate-300 text-amber-500"
                    />
                    <span>Certificate Required</span>
                  </label>
                </div>

                <div>
                  <label className="font-semibold text-slate-700">Compliance Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1"
                  >
                    <option value="ACTIVE">ACTIVE (Legally Enforceable)</option>
                    <option value="PENDING_VERIFICATION">PENDING VERIFICATION (Awaiting Officer Signoff)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 transition-colors shadow-xs cursor-pointer"
                >
                  SAVE & ENFORCE STATUTORY REQUIREMENT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supersede Rule Modal */}
      {showSupersedeModal && supersedeTarget && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                Supersede Requirement: {supersedeTarget.id}
              </h3>
              <button onClick={() => setShowSupersedeModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-600 mt-3">
              This will mark version <strong className="text-amber-800">v{supersedeTarget.version}</strong> as superseded and generate a new incremented active version. Historical records remain permanently tied to the original version.
            </p>
            <form onSubmit={handleSupersedeSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Revision Justification / DGMS Gazette Reference</label>
                <textarea
                  rows={3}
                  value={supersedeNote}
                  onChange={(e) => setSupersedeNote(e.target.value)}
                  placeholder="e.g. Revised pursuant to DGMS Notification 2026 increasing refresher frequency..."
                  className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1 focus:bg-white"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSupersedeModal(false)}
                  className="px-4 py-2 text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 transition-colors shadow-xs"
                >
                  SUPERSEDE RULE & PUBLISH NEW VERSION
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Requirement Details Modal */}
      {selectedReq && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-xl w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono text-amber-700 font-bold">{selectedReq.id} • v{selectedReq.version}</span>
                <h3 className="text-base font-bold text-slate-900">{selectedReq.ruleRegulation}</h3>
              </div>
              <button onClick={() => setSelectedReq(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs mt-4">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 font-semibold block">Act / Statutory Authority:</span>
                <span className="text-slate-900 font-bold text-sm">{selectedReq.actCode}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 font-semibold block">DGMS Reference:</span>
                <span className="text-slate-800">{selectedReq.dgmsReference} ({selectedReq.circularNumber})</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 font-semibold block">Syllabus & Requirement:</span>
                <span className="text-slate-800 leading-relaxed">{selectedReq.trainingRequirement}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 font-mono">
                  <span className="text-slate-500 text-[10px] block">Frequency</span>
                  <span className="text-amber-800 font-bold">{selectedReq.frequencyMonths} Months</span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 font-mono">
                  <span className="text-slate-500 text-[10px] block">Validity</span>
                  <span className="text-emerald-700 font-bold">{selectedReq.validityMonths} Months</span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 font-mono">
                  <span className="text-slate-500 text-[10px] block">Min Duration</span>
                  <span className="text-sky-700 font-bold">{selectedReq.minimumDurationHours} Hours</span>
                </div>
              </div>
              {selectedReq.notes && (
                <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-900 italic text-[11px]">
                  <strong>Notes:</strong> {selectedReq.notes}
                </div>
              )}
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedReq(null)}
                className="px-4 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
