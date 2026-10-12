import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  CheckCircle2,
  AlertTriangle,
  Search,
} from 'lucide-react';
import { Employee } from '../types';

export const DeploymentClearance: React.FC = () => {
  const {
    employees,
    getWorkerDeploymentClearance,
    overrideDeploymentClearance,
    setViewPassportWorkerId,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CLEARED' | 'CONDITIONAL' | 'NOT_CLEARED'>('ALL');

  // Override Modal State
  const [overrideWorker, setOverrideWorker] = useState<Employee | null>(null);
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideDays, setOverrideDays] = useState(3);

  const workersWithClearance = employees.map((w) => ({
    worker: w,
    clearance: getWorkerDeploymentClearance(w.id),
  }));

  const filtered = workersWithClearance.filter(({ worker, clearance }) => {
    if (statusFilter !== 'ALL' && clearance.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const mName = worker.name.toLowerCase().includes(q);
      const mId = worker.id.toLowerCase().includes(q);
      const mTrade = worker.trade.toLowerCase().includes(q);
      const mDept = worker.department.toLowerCase().includes(q);
      if (!mName && !mId && !mTrade && !mDept) return false;
    }
    return true;
  });

  const handleOverrideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideWorker || !overrideReason.trim()) return;

    overrideDeploymentClearance(overrideWorker.id, overrideReason.trim(), Number(overrideDays));
    setOverrideWorker(null);
    setOverrideReason('');
    alert(`Deployment override logged for ${overrideWorker.name} (${overrideWorker.id}). Linage recorded in audit trail.`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
                <CheckCircle2 className="w-5 h-5" />
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase">
                DEPLOYMENT CLEARANCE & GATE PASS ELIGIBILITY ENGINE
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Zero tolerance deployment validation • Automated blocking for MVT overdue, medical fitness expiry & HEMM competency lapse
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-500">Gate Policy:</span>
            <span className="font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 font-bold">
              DGMS Strict Zero-Defect Rule
            </span>
          </div>
        </div>

        {/* Status Legend Callout (Light & Simple) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs">
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-emerald-600 shrink-0" />
            <div>
              <span className="font-bold text-emerald-900">GREEN: CLEARED</span>
              <p className="text-[11px] text-emerald-700">All statutory MVT, medical & competency records 100% valid.</p>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
            <div>
              <span className="font-bold text-amber-900">AMBER: CONDITIONAL / OVERRIDDEN</span>
              <p className="text-[11px] text-amber-700">Temporary authorization granted by Mine Manager or Safety Officer.</p>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-rose-600 shrink-0" />
            <div>
              <span className="font-bold text-rose-900">RED: NOT CLEARED</span>
              <p className="text-[11px] text-rose-700">Mine entry strictly withheld; exact breach displayed on gate console.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Clearance Register */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search worker ID, name, designation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 text-xs text-slate-900 pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
              {(['ALL', 'CLEARED', 'CONDITIONAL', 'NOT_CLEARED'] as const).map((st) => (
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
            {filtered.length} Personnel Evaluated
          </span>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                <th className="py-2.5 px-3">Worker ID & Name</th>
                <th className="py-2.5 px-3">Department & Trade</th>
                <th className="py-2.5 px-3">Workforce Type</th>
                <th className="py-2.5 px-3 text-center">Clearance Status</th>
                <th className="py-2.5 px-3">Statutory Reason / Exception</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(({ worker, clearance }) => (
                <tr key={worker.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={worker.photoUrl}
                        alt={worker.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-300"
                      />
                      <div>
                        <div
                          className="font-bold text-slate-900 hover:text-amber-700 cursor-pointer"
                          onClick={() => setViewPassportWorkerId(worker.id)}
                        >
                          {worker.name}
                        </div>
                        <span className="text-[11px] font-mono text-slate-500">{worker.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="text-slate-800">{worker.department}</div>
                    <div className="text-[11px] text-slate-500">{worker.designation}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        worker.employeeType === 'NMDC_REGULAR'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {worker.employeeType === 'NMDC_REGULAR' ? 'Regular' : 'Contractor'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        clearance.status === 'CLEARED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : clearance.status === 'CONDITIONAL'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {clearance.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    {clearance.status === 'CLEARED' ? (
                      <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        All compliance parameters valid
                      </span>
                    ) : (
                      <div className="space-y-1">
                        {clearance.reasons.map((r, rIdx) => (
                          <div
                            key={rIdx}
                            className="text-[11px] font-mono text-rose-800 bg-rose-50 p-1 rounded border border-rose-200"
                          >
                            {r}
                          </div>
                        ))}
                        {clearance.override && (
                          <div className="text-[10px] text-amber-900 bg-amber-50 p-1 rounded border border-amber-200">
                            <strong>OVERRIDE ACTIVE:</strong> {clearance.override.reason} (Valid till {clearance.override.validUntil})
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setViewPassportWorkerId(worker.id)}
                        className="px-2 py-1 text-[11px] font-bold bg-slate-50 hover:bg-slate-100 text-amber-800 rounded border border-slate-200 cursor-pointer"
                        title="View Digital Safety Passport"
                      >
                        Passport
                      </button>

                      {clearance.status === 'NOT_CLEARED' && (
                        <button
                          onClick={() => setOverrideWorker(worker)}
                          className="px-2 py-1 text-[11px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-800 rounded border border-rose-200 cursor-pointer"
                          title="Authorised Executive Override"
                        >
                          Override
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 bg-slate-50/50">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="font-bold text-slate-700 text-sm">No Deployment Clearance Records Found</span>
                      <p className="text-xs text-slate-400 max-w-md">
                        Registered workforce gate clearances and real-time statutory interlocks will appear here once employees are registered.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Override Modal */}
      {overrideWorker && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                  Authorised Deployment Override
                </h3>
              </div>
              <button onClick={() => setOverrideWorker(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 mt-3">
              Issuing temporary conditional deployment override for <strong className="text-amber-800">{overrideWorker.name} ({overrideWorker.id})</strong>.
            </p>

            <form onSubmit={handleOverrideSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Mandatory Justification / Operational Necessity</label>
                <textarea
                  rows={3}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. Critical breakdown attendance at crusher hopper; enrolled in MVT session batch starting 12-Oct-2026..."
                  className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Override Validity Period (Days)</label>
                <select
                  value={overrideDays}
                  onChange={(e) => setOverrideDays(Number(e.target.value))}
                  className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1"
                >
                  <option value={1}>1 Day (Shift specific)</option>
                  <option value={3}>3 Days (Maximum standard emergency)</option>
                  <option value={7}>7 Days (Requires Mine Manager signoff)</option>
                </select>
              </div>

              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
                <strong>Statutory Rule:</strong> Overrides are permanently logged with timestamp and authorising officer credentials in the immutable audit trail.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOverrideWorker(null)}
                  className="px-4 py-2 text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 transition-colors shadow-xs"
                >
                  SIGN & ISSUE OVERRIDE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
