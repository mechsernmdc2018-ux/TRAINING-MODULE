import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldAlert,
  Search,
  Building,
  Plus,
  RefreshCw,
  Send,
  History,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { Employee } from '../types';

export const MVTCommandCentre: React.FC = () => {
  const {
    employees,
    mvtStatuses,
    contractors,
    kpis,
    filterAlertScope,
    createTrainingSession,
    recalculateMVTRequirements,
    systemSettings,
    setViewPassportWorkerId,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<string>(filterAlertScope || 'ALL');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedContractor, setSelectedContractor] = useState<string>('ALL');
  const [searchWorker, setSearchWorker] = useState<string>('');
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<string[]>([]);

  // Modals
  const [showPlanModal, setShowPlanModal] = useState<boolean>(false);
  const [inspectHistoryWorker, setInspectHistoryWorker] = useState<Employee | null>(null);

  // New MVT Session Form state
  const [sessionTitle, setSessionTitle] = useState('MVT 6-Day Periodic Refresher Batch');
  const [sessionDate, setSessionDate] = useState('2026-10-14');
  const [sessionStartTime, setSessionStartTime] = useState('09:00');
  const [sessionEndTime, setSessionEndTime] = useState('16:30');
  const [sessionVenue, setSessionVenue] = useState('Vocational Training Centre (VTC) Hall 1, Donimalai Complex');
  const [sessionTrainer, setSessionTrainer] = useState('Principal, Vocational Training Centre');
  const [sessionCapacity, setSessionCapacity] = useState(30);

  // Filtered workers list
  const filteredWorkers = useMemo(() => {
    return employees.filter((worker) => {
      const status = mvtStatuses[worker.id];
      if (!status || !status.applicable) return false;

      // Filter by alert scope / tab
      if (activeFilter === 'OVERDUE' || activeFilter === 'MVT_OVERDUE') {
        if (status.status !== 'OVERDUE') return false;
      } else if (activeFilter === 'DUE_7' || activeFilter === 'MVT_DUE_7') {
        if (status.status !== 'DUE' && !(status.daysRemaining >= 0 && status.daysRemaining <= 7)) return false;
      } else if (activeFilter === 'DUE_15') {
        if (status.daysRemaining < 0 || status.daysRemaining > 15) return false;
      } else if (activeFilter === 'DUE_30' || activeFilter === 'MVT_DUE_30') {
        if (status.daysRemaining < 0 || status.daysRemaining > 30) return false;
      } else if (activeFilter === 'VALID') {
        if (status.status !== 'VALID') return false;
      }

      // Department filter
      if (selectedDept !== 'ALL' && worker.department !== selectedDept) return false;

      // Contractor filter
      if (selectedContractor !== 'ALL') {
        if (selectedContractor === 'NMDC_REGULAR' && worker.employeeType !== 'NMDC_REGULAR') return false;
        if (selectedContractor !== 'NMDC_REGULAR' && worker.contractorCode !== selectedContractor) return false;
      }

      // Search
      if (searchWorker.trim()) {
        const q = searchWorker.toLowerCase();
        const matchName = worker.name.toLowerCase().includes(q);
        const matchId = worker.id.toLowerCase().includes(q);
        const matchDesig = worker.designation.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchDesig) return false;
      }

      return true;
    });
  }, [employees, mvtStatuses, activeFilter, selectedDept, selectedContractor, searchWorker]);

  const toggleSelectWorker = (id: string) => {
    setSelectedWorkerIds((prev) => (prev.includes(id) ? prev.filter((wId) => wId !== id) : [...prev, id]));
  };

  const selectAllFiltered = () => {
    if (selectedWorkerIds.length === filteredWorkers.length) {
      setSelectedWorkerIds([]);
    } else {
      setSelectedWorkerIds(filteredWorkers.map((w) => w.id));
    }
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    const newSession = createTrainingSession({
      programId: 'TRG-PROG-01', // Statutory MVT
      title: sessionTitle,
      date: sessionDate,
      startTime: sessionStartTime,
      endTime: sessionEndTime,
      venue: sessionVenue,
      trainerName: sessionTrainer,
      trainerType: 'Internal Senior Officer',
      capacity: sessionCapacity,
      status: 'SCHEDULED',
      nominatedWorkerIds: selectedWorkerIds,
      notes: `Session created with ${selectedWorkerIds.length} nominated workers via MVT Command Centre.`,
    });

    setShowPlanModal(false);
    setSelectedWorkerIds([]);
    alert(`MVT Training Session scheduled (ID: ${newSession.id}) with ${selectedWorkerIds.length} nominated candidates! Notifications dispatched.`);
  };

  const handleSelectOverdueForPlanning = () => {
    const overdueIds = employees
      .filter((w) => mvtStatuses[w.id]?.status === 'OVERDUE' || (mvtStatuses[w.id]?.daysRemaining !== undefined && mvtStatuses[w.id]!.daysRemaining <= 7))
      .map((w) => w.id);
    setSelectedWorkerIds(overdueIds);
    setShowPlanModal(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* MVT Command Header & Daily Compliance Alert Banner */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700">
                <ShieldAlert className="w-5 h-5" />
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase">
                MVT COMMAND CENTRE & REFRESHER PLANNER
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Mines Vocational Training Rules 1966 • Rule 6 & Rule 9 Periodic Training Monitoring & Batch Scheduler
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleSelectOverdueForPlanning}
              className="px-4 py-2 text-xs font-bold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>PLAN MVT TRAINING BATCH</span>
            </button>
          </div>
        </div>

        {/* Daily MVT Compliance Alert Bar */}
        <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-amber-800 uppercase tracking-wider">
              DAILY MVT COMPLIANCE SUMMARY:
            </span>
            <span className="text-slate-500">Donimalai Mining Area</span>
          </div>

          <div className="flex items-center flex-wrap gap-4 font-mono">
            <button
              onClick={() => setActiveFilter('DUE_7')}
              className="text-slate-700 hover:text-orange-600 transition-colors cursor-pointer"
            >
              DUE IN 7 DAYS: <strong className="text-orange-600 font-bold">{kpis.mvtDue7Days}</strong>
            </button>
            <button
              onClick={() => setActiveFilter('DUE_15')}
              className="text-slate-700 hover:text-amber-600 transition-colors cursor-pointer"
            >
              DUE IN 15 DAYS: <strong className="text-amber-700 font-bold">{kpis.mvtDue15Days}</strong>
            </button>
            <button
              onClick={() => setActiveFilter('DUE_30')}
              className="text-slate-700 hover:text-amber-600 transition-colors cursor-pointer"
            >
              DUE IN 30 DAYS: <strong className="text-slate-800 font-bold">{kpis.mvtDue30Days}</strong>
            </button>
            <button
              onClick={() => setActiveFilter('OVERDUE')}
              className="text-slate-700 hover:text-rose-600 transition-colors cursor-pointer"
            >
              OVERDUE: <strong className="text-rose-600 font-bold">{kpis.mvtOverdue}</strong>
            </button>
            <div className="pl-2 border-l border-slate-300">
              MVT COMPLIANCE: <strong className="text-emerald-700 font-bold">{kpis.mvtCompliancePercent}%</strong>
            </div>
          </div>
        </div>

        {/* Stat Cards Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 mt-4">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
              activeFilter === 'ALL'
                ? 'bg-amber-50 border-amber-400 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="text-[10px] text-slate-500 font-bold uppercase">APPLICABLE</div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">{kpis.mvtApplicable}</div>
          </button>

          <button
            onClick={() => setActiveFilter('VALID')}
            className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
              activeFilter === 'VALID'
                ? 'bg-emerald-50 border-emerald-400 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="text-[10px] text-emerald-700 font-bold uppercase">VALID</div>
            <div className="text-xl font-bold font-mono text-emerald-700 mt-0.5">{kpis.mvtValid}</div>
          </button>

          <button
            onClick={() => setActiveFilter('DUE_7')}
            className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
              activeFilter === 'DUE_7' || activeFilter === 'MVT_DUE_7'
                ? 'bg-orange-50 border-orange-400 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="text-[10px] text-orange-700 font-bold uppercase">DUE IN 7 DAYS</div>
            <div className="text-xl font-bold font-mono text-orange-700 mt-0.5">{kpis.mvtDue7Days}</div>
          </button>

          <button
            onClick={() => setActiveFilter('DUE_15')}
            className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
              activeFilter === 'DUE_15'
                ? 'bg-amber-50 border-amber-400 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="text-[10px] text-amber-700 font-bold uppercase">DUE IN 15 DAYS</div>
            <div className="text-xl font-bold font-mono text-amber-700 mt-0.5">{kpis.mvtDue15Days}</div>
          </button>

          <button
            onClick={() => setActiveFilter('DUE_30')}
            className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
              activeFilter === 'DUE_30' || activeFilter === 'MVT_DUE_30'
                ? 'bg-slate-100 border-slate-400 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="text-[10px] text-slate-700 font-bold uppercase">DUE IN 30 DAYS</div>
            <div className="text-xl font-bold font-mono text-slate-800 mt-0.5">{kpis.mvtDue30Days}</div>
          </button>

          <button
            onClick={() => setActiveFilter('OVERDUE')}
            className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
              activeFilter === 'OVERDUE' || activeFilter === 'MVT_OVERDUE'
                ? 'bg-rose-50 border-rose-400 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="text-[10px] text-rose-700 font-bold uppercase">OVERDUE</div>
            <div className="text-xl font-bold font-mono text-rose-700 mt-0.5">{kpis.mvtOverdue}</div>
          </button>

          <div className="p-2.5 rounded-lg border bg-slate-50 border-slate-200 col-span-2">
            <div className="text-[10px] text-slate-500 font-bold uppercase">COMPLIANCE RATE</div>
            <div className="text-xl font-bold font-mono text-emerald-700 mt-0.5">
              {kpis.mvtCompliancePercent}%
            </div>
          </div>
        </div>
      </div>

      {/* Contractor MVT Performance Breakdown */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-2">
          <Building className="w-4 h-4 text-amber-600" />
          Contractor Agency MVT Compliance Status
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                <th className="py-2.5 px-3">Contractor Agency</th>
                <th className="py-2.5 px-3">Work Order</th>
                <th className="py-2.5 px-3 text-center">Total Workers</th>
                <th className="py-2.5 px-3 text-center">MVT Valid</th>
                <th className="py-2.5 px-3 text-center">Due (≤30d)</th>
                <th className="py-2.5 px-3 text-center">Overdue</th>
                <th className="py-2.5 px-3 text-center">Compliance %</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {contractors.map((c) => {
                const workers = employees.filter((e) => e.contractorCode === c.code);
                let valid = 0;
                let due = 0;
                let overdue = 0;

                workers.forEach((w) => {
                  const m = mvtStatuses[w.id];
                  if (m) {
                    if (m.status === 'VALID') valid++;
                    else if (m.status === 'OVERDUE') overdue++;
                    else if (m.status === 'DUE' || m.status === 'DUE_SOON') due++;
                  }
                });

                const comp = workers.length > 0 ? Number(((valid / workers.length) * 100).toFixed(1)) : 100;
                const isPoor = comp < systemSettings.contractorComplianceThresholdPercent;

                return (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {c.name}
                      <span className="block text-[10px] text-slate-500 font-normal">{c.code}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-mono text-[11px]">{c.workOrderNumber}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-semibold">{workers.length}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-emerald-700 font-bold">{valid}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-amber-700">{due}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-rose-700 font-bold">{overdue}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold">
                      <span className={`px-2 py-0.5 rounded ${comp >= 85 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                        {comp}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {isPoor ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          THRESHOLD BREACH
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          COMPLIANT
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Workers MVT Register & Planner Table */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
        {/* Table Filters & Search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search worker ID or name..."
                value={searchWorker}
                onChange={(e) => setSearchWorker(e.target.value)}
                className="w-full bg-slate-50 text-xs text-slate-900 pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>

            {/* Department Filter */}
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-slate-50 text-xs text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Departments</option>
              <option value="Mining">Mining</option>
              <option value="Mechanical Services">Mechanical Services</option>
              <option value="Electrical Services">Electrical Services</option>
              <option value="Production">Production</option>
              <option value="Safety">Safety</option>
            </select>

            {/* Contractor / Regular Filter */}
            <select
              value={selectedContractor}
              onChange={(e) => setSelectedContractor(e.target.value)}
              className="bg-slate-50 text-xs text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Workforce Types</option>
              <option value="NMDC_REGULAR">NMDC Regular Staff Only</option>
              {contractors.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            {selectedWorkerIds.length > 0 && (
              <button
                onClick={() => setShowPlanModal(true)}
                className="px-3 py-1.5 text-xs font-bold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>NOMINATE SELECTED ({selectedWorkerIds.length})</span>
              </button>
            )}
            <span className="text-xs text-slate-500 font-mono">
              Showing {filteredWorkers.length} workers
            </span>
          </div>
        </div>

        {/* Worker Records Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                <th className="py-2.5 px-3">
                  <input
                    type="checkbox"
                    checked={selectedWorkerIds.length === filteredWorkers.length && filteredWorkers.length > 0}
                    onChange={selectAllFiltered}
                    className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                  />
                </th>
                <th className="py-2.5 px-3">Worker ID & Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Department & Trade</th>
                <th className="py-2.5 px-3">Applicable Rule</th>
                <th className="py-2.5 px-3">Last MVT Date</th>
                <th className="py-2.5 px-3">Next Due Date</th>
                <th className="py-2.5 px-3 text-center">Remaining / Overdue</th>
                <th className="py-2.5 px-3 text-center">MVT Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWorkers.map((worker) => {
                const mvt = mvtStatuses[worker.id];
                const isSelected = selectedWorkerIds.includes(worker.id);

                return (
                  <tr
                    key={worker.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      isSelected ? 'bg-amber-50/60' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectWorker(worker.id)}
                        className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={worker.photoUrl}
                          alt={worker.name}
                          className="w-7 h-7 rounded-full object-cover border border-slate-300"
                        />
                        <div>
                          <div className="font-bold text-slate-900 hover:text-amber-700 cursor-pointer" onClick={() => setViewPassportWorkerId(worker.id)}>
                            {worker.name}
                          </div>
                          <span className="text-[11px] font-mono text-slate-500">{worker.id}</span>
                        </div>
                      </div>
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
                    <td className="py-2.5 px-3">
                      <div className="text-slate-800 font-medium">{worker.department}</div>
                      <div className="text-[11px] text-slate-500">{worker.trade}</div>
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-600 max-w-[200px] truncate" title={mvt?.applicableRule}>
                      {mvt?.applicableRule || 'MVT Rules 1966'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">
                      {mvt?.lastMVTDate || <span className="text-slate-400 italic">Initial Pending</span>}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">
                      {mvt?.nextMVTDueDate || 'N/A'}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      {mvt?.status === 'OVERDUE' ? (
                        <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          {mvt.daysOverdue} Days Overdue
                        </span>
                      ) : mvt?.status === 'DUE' ? (
                        <span className="text-orange-700 font-bold bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                          {mvt.daysRemaining} Days Left
                        </span>
                      ) : mvt?.status === 'DUE_SOON' ? (
                        <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {mvt.daysRemaining} Days Left
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-medium">
                          {mvt?.daysRemaining ? `${mvt.daysRemaining} Days` : 'Valid'}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          mvt?.status === 'VALID'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : mvt?.status === 'DUE'
                            ? 'bg-orange-50 text-orange-700 border border-orange-200'
                            : mvt?.status === 'DUE_SOON'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : mvt?.status === 'OVERDUE'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {mvt?.status || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setInspectHistoryWorker(worker)}
                          className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-amber-700 cursor-pointer"
                          title="View Historical MVT Records"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => recalculateMVTRequirements(worker.id)}
                          className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-emerald-700 cursor-pointer"
                          title="Recalculate MVT based on latest statutory rules"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredWorkers.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500 bg-slate-50/50">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ShieldAlert className="w-8 h-8 text-slate-300" />
                      <span className="font-bold text-slate-700 text-sm">No MVT Records In Current Filter</span>
                      <p className="text-xs text-slate-400 max-w-md">
                        As you register employees and contractor workmen, their statutory Mines Vocational Training (MVT Rules 1966) tracking and compliance countdowns will appear here automatically.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Plan MVT Training Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                  Schedule Mines Vocational Training (MVT) Session
                </h3>
              </div>
              <button
                onClick={() => setShowPlanModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Session Title / Batch</label>
                <input
                  type="text"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1 focus:bg-white focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Training Date</label>
                  <input
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1 focus:bg-white focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Capacity (Persons)</label>
                  <input
                    type="number"
                    value={sessionCapacity}
                    onChange={(e) => setSessionCapacity(Number(e.target.value))}
                    className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1 focus:bg-white focus:border-amber-500"
                    min="5"
                    max="60"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Start Time</label>
                  <input
                    type="time"
                    value={sessionStartTime}
                    onChange={(e) => setSessionStartTime(e.target.value)}
                    className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">End Time</label>
                  <input
                    type="time"
                    value={sessionEndTime}
                    onChange={(e) => setSessionEndTime(e.target.value)}
                    className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Venue</label>
                <input
                  type="text"
                  value={sessionVenue}
                  onChange={(e) => setSessionVenue(e.target.value)}
                  className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Authorised Trainer</label>
                <input
                  type="text"
                  value={sessionTrainer}
                  onChange={(e) => setSessionTrainer(e.target.value)}
                  className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1"
                  required
                />
              </div>

              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                <div className="flex items-center justify-between text-xs font-semibold text-amber-900">
                  <span>Nominated Candidates for this Batch:</span>
                  <span className="font-mono text-amber-950 font-bold">{selectedWorkerIds.length} Workers</span>
                </div>
                <div className="text-[11px] text-amber-800 mt-1">
                  Selected candidates and supervisors will receive training notification automatically.
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="px-4 py-2 text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 transition-colors shadow-xs"
                >
                  CREATE MVT SESSION & DISPATCH NOMINATIONS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Historical MVT Records Modal */}
      {inspectHistoryWorker && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Historical MVT Register (Form B) • {inspectHistoryWorker.name}
                </h3>
              </div>
              <button
                onClick={() => setInspectHistoryWorker(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4">
              <div className="text-xs text-slate-500 mb-2">
                Statutory requirement: Historical compliance and vocational training records are permanent and immutable.
              </div>

              {mvtStatuses[inspectHistoryWorker.id]?.history && mvtStatuses[inspectHistoryWorker.id]!.history.length > 0 ? (
                <div className="space-y-3 mt-3">
                  {mvtStatuses[inspectHistoryWorker.id]!.history.map((rec) => (
                    <div key={rec.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center justify-between font-semibold text-slate-900">
                        <span>{rec.trainingName} ({rec.trainingType})</span>
                        <span className="text-emerald-700 font-mono font-bold">{rec.assessmentResult}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 mt-2">
                        <div>Completed: <strong className="text-slate-900">{rec.completionDate}</strong></div>
                        <div>Valid Till: <strong className="text-slate-900">{rec.validTill}</strong></div>
                        <div>Trainer: <strong className="text-slate-900">{rec.trainerName}</strong></div>
                        <div>Certificate: <strong className="text-amber-800 font-mono">{rec.certificateNumber}</strong></div>
                        <div>Rule Applied: <strong className="text-slate-900">{rec.statutoryRuleApplied}</strong></div>
                        <div>Verified By: <strong className="text-slate-900">{rec.verifiedBy}</strong></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
                  Initial entry registered on {inspectHistoryWorker.dateOfJoining}. Historical physical ledger archived at VTC Donimalai records vault.
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setInspectHistoryWorker(null)}
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
