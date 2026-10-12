import React from 'react';
import { useApp } from '../context/AppContext';
import { AlertCentre } from './AlertCentre';
import { SafetyBriefingWidget } from './SafetyBriefingWidget';
import { DueSoonWidget } from './DueSoonWidget';
import {
  Users,
  UserPlus,
  ShieldCheck,
  AlertOctagon,
  TrendingUp,
  FileCheck2,
  HardHat,
  Award,
  ChevronRight,
  Flame,
  Activity,
  ArrowUpRight,
  Building2,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const {
    kpis,
    setActiveTab,
    setFilterAlertScope,
    contractors,
    employees,
    mvtStatuses,
    systemSettings,
    setIsRegisterEmployeeOpen,
    setRegistrationInitialType,
  } = useApp();

  // Contractor-wise calculated MVT compliance
  const contractorMetrics = contractors.map((c) => {
    const workers = employees.filter((e) => e.contractorCode === c.code);
    let validCount = 0;
    let overdueCount = 0;
    let dueCount = 0;

    workers.forEach((w) => {
      const mvt = mvtStatuses[w.id];
      if (mvt) {
        if (mvt.status === 'VALID') validCount++;
        else if (mvt.status === 'OVERDUE') overdueCount++;
        else if (mvt.status === 'DUE' || mvt.status === 'DUE_SOON') dueCount++;
      }
    });

    const compPercent = workers.length > 0 ? Number(((validCount / workers.length) * 100).toFixed(1)) : 100;
    const isBelowThreshold = compPercent < systemSettings.contractorComplianceThresholdPercent;

    return {
      contractor: c,
      workerCount: workers.length,
      validCount,
      overdueCount,
      dueCount,
      compPercent,
      isBelowThreshold,
    };
  });

  // Department-wise calculations
  const departments = ['Mining', 'Mechanical Services', 'Electrical Services', 'Production', 'Safety'];
  const departmentMetrics = departments.map((dept) => {
    const deptWorkers = employees.filter((e) => e.department === dept);
    let validMvt = 0;
    deptWorkers.forEach((w) => {
      const mvt = mvtStatuses[w.id];
      if (mvt && mvt.status === 'VALID') validMvt++;
    });
    const percent = deptWorkers.length > 0 ? Number(((validMvt / deptWorkers.length) * 100).toFixed(1)) : 100;
    return { name: dept, total: deptWorkers.length, valid: validMvt, percent };
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Quick Action Launcher Bar (Simple, Direct) */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
            Quick Actions:
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setRegistrationInitialType('NMDC_REGULAR');
              setIsRegisterEmployeeOpen(true);
            }}
            className="px-3 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Register Employee</span>
          </button>
          <button
            onClick={() => setActiveTab('deployment')}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Gate Clearance</span>
          </button>
          <button
            onClick={() => {
              setFilterAlertScope('MVT_OVERDUE');
              setActiveTab('mvt-command');
            }}
            className="px-3 py-1.5 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-lg border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
            <span>Overdue MVT ({kpis.mvtOverdue})</span>
          </button>
          <button
            onClick={() => setActiveTab('mvt-command')}
            className="px-3 py-1.5 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg border border-amber-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
            <span>Plan MVT Batch</span>
          </button>
          <button
            onClick={() => setActiveTab('workforce')}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Users className="w-3.5 h-3.5 text-slate-600" />
            <span>Manage Workers</span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Award className="w-3.5 h-3.5 text-sky-600" />
            <span>MIS Reports</span>
          </button>
        </div>
      </div>

      {/* Clickable Real-Time Alert Centre */}
      <AlertCentre />

      {/* Rotating Daily Statutory Safety Briefing Widget (DGMS Mandate) */}
      <SafetyBriefingWidget />

      {/* Due Soon: Upcoming MVT Sessions Widget with Enroll Now link */}
      <DueSoonWidget />

      {/* Primary KPI Metrics Grid (Clean Light Cards) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-600" />
            Executive Compliance & Workforce Radar
          </h2>
          <span className="text-xs text-slate-500 hidden sm:inline">Calculated from live Donimalai database records</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3.5">
          {/* 1. Total Workforce */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>TOTAL WORKFORCE</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono mt-1">
              {kpis.totalWorkforce}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between border-t border-slate-100 pt-1">
              <span>{kpis.nmdcEmployees} Regular</span>
              <span className="text-amber-700 font-semibold">{kpis.contractWorkers} Contract</span>
            </div>
          </div>

          {/* 2. MVT Compliance % */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>MVT COMPLIANCE</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className={`text-2xl font-black font-mono mt-1 ${kpis.mvtCompliancePercent >= 85 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {kpis.mvtCompliancePercent}%
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between border-t border-slate-100 pt-1">
              <span>{kpis.mvtValid} / {kpis.mvtApplicable} Valid</span>
              <span className="text-xs text-emerald-700 font-bold">Rule 6 & 9</span>
            </div>
          </div>

          {/* 3. Overall Training Compliance */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>TRAINING COMPLIANCE</span>
              <Award className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-700 font-mono mt-1">
              {kpis.overallTrainingCompliancePercent}%
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between border-t border-slate-100 pt-1">
              <span>Hours: {kpis.totalTrainingHoursCompleted}h</span>
              <span className="text-slate-700 font-medium">{kpis.totalCertificatesIssued} certs</span>
            </div>
          </div>

          {/* 4. Statutory Rule Health */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>STATUTORY RULES</span>
              <FileCheck2 className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl font-black text-sky-700 font-mono mt-1">
              {kpis.statutoryCompliancePercent}%
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between border-t border-slate-100 pt-1">
              <span>Active DGMS rules</span>
              <span className="text-sky-700 font-semibold">Verified</span>
            </div>
          </div>

          {/* 5. High-Risk Training Compliance */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>HIGH-RISK OPERATORS</span>
              <Flame className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-2xl font-black text-orange-600 font-mono mt-1">
              {kpis.highRiskCompliancePercent}%
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between border-t border-slate-100 pt-1">
              <span>HEMM & Blasters</span>
              <span className="text-orange-700 font-bold">13-pt DGMS</span>
            </div>
          </div>

          {/* 6. MVT Overdue Counter */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>MVT OVERDUE</span>
              <AlertOctagon className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-black text-rose-600 font-mono mt-1">
              {kpis.mvtOverdue}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between border-t border-slate-100 pt-1">
              <span className="text-rose-600 font-semibold">Action needed</span>
              <button
                onClick={() => {
                  setFilterAlertScope('MVT_OVERDUE');
                  setActiveTab('mvt-command');
                }}
                className="text-amber-700 font-bold hover:underline flex items-center text-[10px]"
              >
                Inspect <ChevronRight className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row: Detailed Breakdown Charts & Scorecards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Department Performance & Trends (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Department Compliance Progress */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Department-Wise Training & MVT Compliance Matrix
                </h3>
              </div>
              <span className="text-xs text-slate-500">Target: ≥ 85%</span>
            </div>

            <div className="space-y-3 mt-4">
              {departmentMetrics.map((dept) => (
                <div key={dept.name}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-800">{dept.name}</span>
                    <span className="font-mono text-slate-600">
                      {dept.valid}/{dept.total} Valid (
                      <span className={dept.percent >= 85 ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                        {dept.percent}%
                      </span>
                      )
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        dept.percent >= 85
                          ? 'bg-emerald-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${dept.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Automatic notification dispatched to Department Heads weekly</span>
              <button
                onClick={() => setActiveTab('reports')}
                className="text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1"
              >
                View Detailed MIS <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Annual Compliance & Refresher Trend */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Annual Vocational Training (MVT) Throughput (2026)
                </h3>
              </div>
              <span className="text-xs text-slate-500">Donimalai VTC Register</span>
            </div>

            {/* Visual Mini Trend Chart */}
            <div className="mt-4">
              <div className="h-40 w-full flex items-end justify-between gap-3 pt-4 px-2">
                {[
                  { month: 'Apr', trained: 45, compliance: 88 },
                  { month: 'May', trained: 62, compliance: 90 },
                  { month: 'Jun', trained: 54, compliance: 89 },
                  { month: 'Jul', trained: 78, compliance: 92 },
                  { month: 'Aug', trained: 65, compliance: 91 },
                  { month: 'Sep', trained: 82, compliance: 93 },
                  { month: 'Oct (Curr)', trained: 42, compliance: 94 },
                ].map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <span className="text-[10px] font-mono text-amber-700 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.trained}
                    </span>
                    <div
                      className="w-full bg-amber-400 hover:bg-amber-500 rounded-t transition-colors shadow-2xs"
                      style={{ height: `${(item.trained / 90) * 100}%` }}
                    />
                    <span className="text-[11px] font-medium text-slate-600 group-hover:text-slate-900">
                      {item.month}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-6 mt-3 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-amber-400" />
                  <span>Vocational Training Sessions Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-emerald-500" />
                  <span>DGMS Compliance Target (≥90%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Contractor Compliance Scorecard & Rapid Controls */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HardHat className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Contractor Compliance Scorecard
                </h3>
              </div>
              <span className="text-xs text-amber-800 font-semibold">Min: {systemSettings.contractorComplianceThresholdPercent}%</span>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {contractorMetrics.map(({ contractor, workerCount, validCount, overdueCount, compPercent, isBelowThreshold }) => (
                <div key={contractor.id} className="py-3 first:pt-2 last:pb-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 hover:text-amber-700 cursor-pointer">
                        {contractor.name}
                      </h4>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {contractor.code} • Work Order: {contractor.workOrderNumber}
                      </div>
                    </div>
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                        isBelowThreshold
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {compPercent}%
                    </span>
                  </div>

                  {/* Warning banner if contractor is below threshold */}
                  {isBelowThreshold && (
                    <div className="mt-2 p-2 rounded bg-rose-50 border border-rose-200 text-[11px] text-rose-800 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">CONTRACTOR ALERT:</span> Compliance below {systemSettings.contractorComplianceThresholdPercent}%. Gate Pass issuance withheld for overdue personnel.
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-600 mt-2">
                    <span>Manpower: <strong className="text-slate-800">{workerCount}</strong></span>
                    <span>Valid MVT: <strong className="text-emerald-700">{validCount}</strong></span>
                    <span>Overdue: <strong className={overdueCount > 0 ? 'text-rose-600 font-bold' : 'text-slate-700'}>{overdueCount}</strong></span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActiveTab('workforce')}
                className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1"
              >
                Manage Contractor Personnel <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Action Dock */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ArrowUpRight className="w-4 h-4 text-amber-600" />
              Rapid Officer Shortcuts
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  setFilterAlertScope('MVT_OVERDUE');
                  setActiveTab('mvt-command');
                }}
                className="p-2.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-left transition-colors shadow-2xs cursor-pointer"
              >
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  Plan MVT Batch
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Enrol overdue workers</div>
              </button>

              <button
                onClick={() => setActiveTab('deployment')}
                className="p-2.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-left transition-colors shadow-2xs cursor-pointer"
              >
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Gate Clearance
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Inspect entry eligibility</div>
              </button>

              <button
                onClick={() => setActiveTab('competency')}
                className="p-2.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-left transition-colors shadow-2xs cursor-pointer"
              >
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-orange-600" />
                  HEMM Practical
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">13-point DGMS check</div>
              </button>

              <button
                onClick={() => setActiveTab('statutory-engine')}
                className="p-2.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-left transition-colors shadow-2xs cursor-pointer"
              >
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <FileCheck2 className="w-3.5 h-3.5 text-sky-600" />
                  Statutory Rules
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Configure DGMS rules</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
