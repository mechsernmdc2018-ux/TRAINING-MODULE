import React, { useState, useMemo } from 'react';
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
  Stethoscope,
  GraduationCap,
  Download,
  Filter,
  Calendar,
  MapPin,
  Briefcase,
  Clock,
  ShieldAlert,
  IndianRupee,
  Layers,
  FileSpreadsheet,
  HeartPulse,
} from 'lucide-react';

type DashboardSection = 'OVERVIEW' | 'STATUTORY_TRAINING' | 'MEDICAL_EXAMINATIONS' | 'OTHER_TRAINING';

export const Dashboard: React.FC = () => {
  const {
    kpis,
    setActiveTab,
    setFilterAlertScope,
    contractors,
    employees,
    mvtStatuses,
    trainingSessions,
    trainingPrograms,
    medicalRecords,
    otherTrainingRecords,
    systemSettings,
    setIsRegisterEmployeeOpen,
    setRegistrationInitialType,
    exportToCSV,
    currentUser,
  } = useApp();

  // Active Sub-Dashboard Selector
  const [activeSection, setActiveSection] = useState<DashboardSection>('OVERVIEW');

  // Interactive Global Filter States
  const [filterDepartment, setFilterDepartment] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterLocation, setFilterLocation] = useState<string>('ALL');
  const [filterFinYear, setFilterFinYear] = useState<string>('2026-27');
  const [filterDateRange, setFilterDateRange] = useState<string>('ALL');

  // Filtered workforce according to interactive filters
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (filterDepartment !== 'ALL' && emp.department !== filterDepartment) return false;
      if (filterCategory === 'REGULAR_EXECUTIVE') {
        if (emp.employeeType !== 'NMDC_REGULAR' || !emp.grade.startsWith('E-')) return false;
      } else if (filterCategory === 'REGULAR_WORKMAN') {
        if (emp.employeeType !== 'NMDC_REGULAR' || !emp.grade.startsWith('W-')) return false;
      } else if (filterCategory === 'CONTRACTOR_WORKER') {
        if (emp.employeeType !== 'CONTRACT_WORKER') return false;
      }
      if (filterLocation !== 'ALL' && emp.workLocation !== filterLocation) return false;
      return true;
    });
  }, [employees, filterDepartment, filterCategory, filterLocation]);

  const filteredEmpIds = useMemo(() => new Set(filteredEmployees.map((e) => e.id)), [filteredEmployees]);

  // Filtered Medical Records
  const filteredMedical = useMemo(() => {
    return medicalRecords.filter((rec) => {
      if (!filteredEmpIds.has(rec.workerId)) return false;
      if (filterDepartment !== 'ALL' && rec.workerDepartment !== filterDepartment) return false;
      return true;
    });
  }, [medicalRecords, filteredEmpIds, filterDepartment]);

  // Filtered Other Training Records
  const filteredOtherTraining = useMemo(() => {
    return otherTrainingRecords.filter((rec) => {
      if (!filteredEmpIds.has(rec.workerId)) return false;
      if (filterFinYear !== 'ALL' && rec.financialYear !== filterFinYear) return false;
      if (filterDepartment !== 'ALL' && rec.workerDepartment !== filterDepartment) return false;
      return true;
    });
  }, [otherTrainingRecords, filteredEmpIds, filterFinYear, filterDepartment]);

  // Statutory MVT Metrics based on filtered workforce
  const statutoryMetrics = useMemo(() => {
    let validCount = 0;
    let overdueCount = 0;
    let dueSoonCount = 0;
    let rule6Count = 0;
    let rule9Count = 0;

    filteredEmployees.forEach((emp) => {
      const mvt = mvtStatuses[emp.id];
      if (mvt) {
        if (mvt.status === 'VALID') validCount++;
        else if (mvt.status === 'OVERDUE') overdueCount++;
        else if (mvt.status === 'DUE' || mvt.status === 'DUE_SOON') dueSoonCount++;

        if (mvt.applicableRule?.includes('Rule 6')) rule6Count++;
        else if (mvt.applicableRule?.includes('Rule 9')) rule9Count++;
      }
    });

    const total = filteredEmployees.length;
    const compliancePercent = total > 0 ? Number(((validCount / total) * 100).toFixed(1)) : 100;

    return {
      total,
      validCount,
      overdueCount,
      dueSoonCount,
      rule6Count,
      rule9Count,
      compliancePercent,
    };
  }, [filteredEmployees, mvtStatuses]);

  // Medical Metrics based on filtered records
  const medicalMetrics = useMemo(() => {
    const total = filteredMedical.length;
    const imeCount = filteredMedical.filter((m) => m.examType === 'IME').length;
    const pmeCount = filteredMedical.filter((m) => m.examType === 'PME').length;
    const fitCount = filteredMedical.filter((m) => m.fitnessResult === 'FIT').length;
    const tempUnfitCount = filteredMedical.filter((m) => m.fitnessResult === 'TEMPORARILY_UNFIT').length;
    const permUnfitCount = filteredMedical.filter((m) => m.fitnessResult === 'UNFIT').length;
    const overdueCount = filteredMedical.filter((m) => m.examStatus === 'OVERDUE').length;
    const dueSoonCount = filteredMedical.filter((m) => m.examStatus === 'SCHEDULED' || m.examStatus === 'DUE_SOON').length;
    const compliancePercent = total > 0 ? Number(((fitCount / total) * 100).toFixed(1)) : 100;

    return {
      total,
      imeCount,
      pmeCount,
      fitCount,
      tempUnfitCount,
      permUnfitCount,
      overdueCount,
      dueSoonCount,
      compliancePercent,
    };
  }, [filteredMedical]);

  // Other Training Metrics based on filtered records
  const otherTrainingMetrics = useMemo(() => {
    const total = filteredOtherTraining.length;
    const completed = filteredOtherTraining.filter((r) => r.completionStatus === 'COMPLETED').length;
    const inProgress = filteredOtherTraining.filter((r) => r.completionStatus === 'ONGOING').length;
    const oemCount = filteredOtherTraining.filter((r) => r.trainingCategory === 'OEM').length;
    const internalCount = filteredOtherTraining.filter((r) => r.trainingCategory === 'INTERNAL').length;
    const externalCount = filteredOtherTraining.filter((r) => r.trainingCategory === 'EXTERNAL').length;
    const internationalCount = filteredOtherTraining.filter((r) => r.trainingCategory === 'INTERNATIONAL').length;
    const totalCost = filteredOtherTraining.reduce((sum, r) => sum + (r.costInr || 0), 0);
    const execCount = filteredOtherTraining.filter((r) => r.workerCategory === 'REGULAR_EXECUTIVE').length;
    const workmenCount = filteredOtherTraining.filter((r) => r.workerCategory !== 'REGULAR_EXECUTIVE').length;

    return {
      total,
      completed,
      inProgress,
      oemCount,
      internalCount,
      externalCount,
      internationalCount,
      totalCost,
      execCount,
      workmenCount,
    };
  }, [filteredOtherTraining]);

  // Export Filtered Dashboard Data
  const handleExportDashboard = () => {
    if (activeSection === 'STATUTORY_TRAINING') {
      const headers = ['Employee ID', 'Name', 'Type', 'Department', 'Designation', 'MVT Rule', 'MVT Status', 'Next Due Date', 'Days Overdue'];
      const rows = filteredEmployees.map((e) => {
        const mvt = mvtStatuses[e.id];
        return [
          e.id,
          e.name,
          e.employeeType,
          e.department,
          e.designation,
          mvt?.applicableRule || 'N/A',
          mvt?.status || 'UNKNOWN',
          mvt?.nextMVTDueDate || 'N/A',
          mvt?.daysOverdue || 0,
        ];
      });
      exportToCSV(`NMDC_Statutory_Training_Dashboard_${filterFinYear}`, headers, rows);
    } else if (activeSection === 'MEDICAL_EXAMINATIONS') {
      const headers = ['Record ID', 'Worker ID', 'Worker Name', 'Department', 'Exam Type', 'Exam Date', 'Status', 'Fitness Result', 'Valid Till', 'Next Due Date'];
      const rows = filteredMedical.map((m) => [
        m.id,
        m.workerId,
        m.workerName,
        m.workerDepartment,
        m.examType,
        m.completedDate || m.scheduledDate,
        m.examStatus,
        m.fitnessResult || 'N/A',
        m.validTill || 'N/A',
        m.nextDueDate || 'N/A',
      ]);
      exportToCSV(`NMDC_Medical_Examination_Dashboard_${filterFinYear}`, headers, rows);
    } else if (activeSection === 'OTHER_TRAINING') {
      const headers = ['Record ID', 'Worker ID', 'Worker Name', 'Category', 'Course Title', 'Provider', 'Venue', 'Start Date', 'End Date', 'Duration (Hours)', 'Cost (INR)', 'Completion Status', 'Certificate No'];
      const rows = filteredOtherTraining.map((t) => [
        t.id,
        t.workerId,
        t.workerName,
        t.trainingCategory,
        t.courseTitle,
        t.trainingProvider,
        t.venue,
        t.startDate,
        t.endDate,
        t.durationHours,
        t.costInr,
        t.completionStatus,
        t.certificateNumber,
      ]);
      exportToCSV(`NMDC_Other_Training_Dashboard_${filterFinYear}`, headers, rows);
    } else {
      const headers = ['Metric', 'Count / Value', 'Filter Department', 'Filter Category', 'Financial Year'];
      const rows = [
        ['Total Filtered Workforce', filteredEmployees.length, filterDepartment, filterCategory, filterFinYear],
        ['Statutory MVT Valid', statutoryMetrics.validCount, filterDepartment, filterCategory, filterFinYear],
        ['Statutory MVT Overdue', statutoryMetrics.overdueCount, filterDepartment, filterCategory, filterFinYear],
        ['Medical Fitness Evaluated', medicalMetrics.total, filterDepartment, filterCategory, filterFinYear],
        ['Medical Fit Workers', medicalMetrics.fitCount, filterDepartment, filterCategory, filterFinYear],
        ['Medical Overdue Examinations', medicalMetrics.overdueCount, filterDepartment, filterCategory, filterFinYear],
        ['Other Training Programs Logged', otherTrainingMetrics.total, filterDepartment, filterCategory, filterFinYear],
        ['Other Training Expenditure (INR)', otherTrainingMetrics.totalCost, filterDepartment, filterCategory, filterFinYear],
      ];
      exportToCSV(`NMDC_Executive_Dashboard_Summary_${filterFinYear}`, headers, rows);
    }
  };

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
            onClick={() => setActiveTab('medical')}
            className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Stethoscope className="w-3.5 h-3.5 text-emerald-700" />
            <span>Medical (IME/PME)</span>
          </button>
          <button
            onClick={() => setActiveTab('other-training')}
            className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-900 rounded-lg border border-indigo-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <GraduationCap className="w-3.5 h-3.5 text-indigo-700" />
            <span>Other Training (OEM/Ext)</span>
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
            <span>Manage Workforce</span>
          </button>
        </div>
      </div>

      {/* DASHBOARDS SELECTION & INTERACTIVE FILTERS BAR (Requirement 5) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
        {/* Module-Specific Dashboard Switcher Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-600" />
              Donimalai Executive Dashboards & Analytics
            </h2>
            <p className="text-xs text-slate-500">
              Select module view and configure dynamic multidimensional filters
            </p>
          </div>

          {/* 4 Dedicated Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveSection('OVERVIEW')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeSection === 'OVERVIEW'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-amber-600" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveSection('STATUTORY_TRAINING')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeSection === 'STATUTORY_TRAINING'
                  ? 'bg-white text-amber-900 shadow-xs border-b-2 border-amber-500'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              <span>Statutory Training</span>
            </button>
            <button
              onClick={() => setActiveSection('MEDICAL_EXAMINATIONS')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeSection === 'MEDICAL_EXAMINATIONS'
                  ? 'bg-white text-emerald-900 shadow-xs border-b-2 border-emerald-500'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
              <span>Medical (IME/PME)</span>
            </button>
            <button
              onClick={() => setActiveSection('OTHER_TRAINING')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeSection === 'OTHER_TRAINING'
                  ? 'bg-white text-indigo-900 shadow-xs border-b-2 border-indigo-500'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
              <span>Other Training</span>
            </button>
          </div>
        </div>

        {/* Dynamic Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5 text-slate-500" /> Filters:
            </span>

            {/* Department Filter */}
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="ALL">All Departments</option>
              <option value="Mining">Mining</option>
              <option value="Mechanical Services">Mechanical Services</option>
              <option value="Electrical Services">Electrical Services</option>
              <option value="Production">Production</option>
              <option value="Safety">Safety & Rescue</option>
              <option value="Central Workshops">Central Workshops</option>
            </select>

            {/* Employee Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="ALL">All Personnel Categories</option>
              <option value="REGULAR_EXECUTIVE">NMDC Regular Executives</option>
              <option value="REGULAR_WORKMAN">NMDC Regular Workmen</option>
              <option value="CONTRACTOR_WORKER">Contractor Workmen</option>
            </select>

            {/* Location Filter */}
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="ALL">All Mine Locations</option>
              <option value="Donimalai Iron Ore Mine">Donimalai Iron Ore Mine</option>
              <option value="Kumaraswamy Mine">Kumaraswamy Mine</option>
              <option value="Beneficiation Plant">Beneficiation Plant</option>
              <option value="Pellet Plant">Pellet Plant</option>
              <option value="Donimalai Pit Operations">Donimalai Pit Operations</option>
            </select>

            {/* Financial Year Filter */}
            <select
              value={filterFinYear}
              onChange={(e) => setFilterFinYear(e.target.value)}
              className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="ALL">All Financial Years</option>
              <option value="2026-27">FY 2026-27 (Current)</option>
              <option value="2025-26">FY 2025-26</option>
              <option value="2024-25">FY 2024-25</option>
            </select>

            {/* Date Range Filter */}
            <select
              value={filterDateRange}
              onChange={(e) => setFilterDateRange(e.target.value)}
              className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="ALL">Full Financial Year</option>
              <option value="LAST_30">Last 30 Days</option>
              <option value="LAST_90">Last 90 Days</option>
              <option value="CURRENT_QUARTER">Current Quarter (Q3)</option>
            </select>
          </div>

          {/* Export Report Button */}
          <button
            onClick={handleExportDashboard}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs shrink-0"
            title="Download verified statutory MIS report in spreadsheet CSV format"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export {activeSection.replace('_', ' ')} MIS</span>
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE DASHBOARD MODULE */}

      {/* 1. STATUTORY TRAINING DASHBOARD */}
      {activeSection === 'STATUTORY_TRAINING' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Filtered Workforce</div>
              <div className="text-2xl font-black text-slate-900 font-mono mt-1">{statutoryMetrics.total}</div>
              <div className="text-[10px] text-slate-500 mt-1">Applicable to MVT Rules</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
              <div className="text-[11px] font-bold text-emerald-700 uppercase">Training Completed (Valid)</div>
              <div className="text-2xl font-black text-emerald-600 font-mono mt-1">{statutoryMetrics.validCount}</div>
              <div className="text-[10px] text-emerald-700 font-semibold mt-1">{statutoryMetrics.compliancePercent}% Compliance</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
              <div className="text-[11px] font-bold text-amber-700 uppercase">Training Due (Next 30D)</div>
              <div className="text-2xl font-black text-amber-600 font-mono mt-1">{statutoryMetrics.dueSoonCount}</div>
              <div className="text-[10px] text-amber-700 font-semibold mt-1">Advance Notice Active</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
              <div className="text-[11px] font-bold text-rose-700 uppercase">Overdue Items</div>
              <div className="text-2xl font-black text-rose-600 font-mono mt-1">{statutoryMetrics.overdueCount}</div>
              <div className="text-[10px] text-rose-600 font-bold mt-1">Deployment Blocked</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
              <div className="text-[11px] font-bold text-sky-700 uppercase">Rule 6 (Initial Induction)</div>
              <div className="text-2xl font-black text-sky-700 font-mono mt-1">{statutoryMetrics.rule6Count}</div>
              <div className="text-[10px] text-slate-500 mt-1">New Entrants / Contractors</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
              <div className="text-[11px] font-bold text-indigo-700 uppercase">Rule 9 (Periodic Refresher)</div>
              <div className="text-2xl font-black text-indigo-700 font-mono mt-1">{statutoryMetrics.rule9Count}</div>
              <div className="text-[10px] text-slate-500 mt-1">Triennial Mandatory Refresher</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  MVT Refresher Compliance & Validity Pipeline
                </h3>
                <span className="text-xs font-mono text-slate-500">{filterFinYear}</span>
              </div>
              <div className="mt-4 space-y-3">
                {filteredEmployees.slice(0, 6).map((emp) => {
                  const mvt = mvtStatuses[emp.id];
                  const isValid = mvt?.status === 'VALID';
                  const isOverdue = mvt?.status === 'OVERDUE';
                  return (
                    <div key={emp.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div>
                        <div className="font-bold text-xs text-slate-900">{emp.name} ({emp.id})</div>
                        <div className="text-[11px] text-slate-500">{emp.designation} • {emp.department}</div>
                        <div className="text-[10px] text-amber-800 font-medium">{mvt?.applicableRule}</div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          isValid ? 'bg-emerald-100 text-emerald-800' : isOverdue ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {mvt?.status || 'PENDING'}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-1 font-mono">
                          Due: {mvt?.nextMVTDueDate || 'Immediate'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setActiveTab('mvt-command')}
                  className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1"
                >
                  Open Full MVT Command Centre <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-sky-600" />
                  Upcoming Refresher Batches & Nominations
                </h3>
                <span className="text-xs text-slate-500">Donimalai VTC Centre</span>
              </div>
              <div className="mt-4 space-y-3">
                {trainingSessions.slice(0, 4).map((session) => (
                  <div key={session.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-900">{session.title}</div>
                      <div className="text-[11px] text-slate-500">
                        {session.date} ({session.startTime}-{session.endTime}) • Venue: {session.venue}
                      </div>
                      <div className="text-[10px] text-slate-600 mt-0.5">
                        Trainer: {session.trainerName} • Batch Code: {session.id}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">
                        {session.nominatedWorkerIds.length} Nominated
                      </span>
                      <div className="text-[10px] text-slate-500 mt-1 font-mono">
                        Status: {session.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setActiveTab('training')}
                  className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1"
                >
                  Manage Sessions & Attendance <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. MEDICAL EXAMINATIONS DASHBOARD */}
      {activeSection === 'MEDICAL_EXAMINATIONS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Total Evaluated</div>
              <div className="text-2xl font-black text-slate-900 font-mono mt-1">{medicalMetrics.total}</div>
              <div className="text-[10px] text-slate-500 mt-1">DGMS Rule 29B Scope</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
              <div className="text-[11px] font-bold text-emerald-700 uppercase">Fit for Mine Duty</div>
              <div className="text-2xl font-black text-emerald-600 font-mono mt-1">{medicalMetrics.fitCount}</div>
              <div className="text-[10px] text-emerald-700 font-semibold mt-1">{medicalMetrics.compliancePercent}% Fit</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
              <div className="text-[11px] font-bold text-amber-700 uppercase">PME Exams (Periodic)</div>
              <div className="text-2xl font-black text-amber-600 font-mono mt-1">{medicalMetrics.pmeCount}</div>
              <div className="text-[10px] text-slate-500 mt-1">5-Yr / Annual Rule</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
              <div className="text-[11px] font-bold text-sky-700 uppercase">IME Exams (Initial)</div>
              <div className="text-2xl font-black text-sky-600 font-mono mt-1">{medicalMetrics.imeCount}</div>
              <div className="text-[10px] text-slate-500 mt-1">Pre-Employment</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
              <div className="text-[11px] font-bold text-rose-700 uppercase">Medical Overdue</div>
              <div className="text-2xl font-black text-rose-600 font-mono mt-1">{medicalMetrics.overdueCount}</div>
              <div className="text-[10px] text-rose-600 font-bold mt-1">Notice Form N Served</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
              <div className="text-[11px] font-bold text-orange-700 uppercase">Temp / Perm Unfit</div>
              <div className="text-2xl font-black text-orange-600 font-mono mt-1">
                {medicalMetrics.tempUnfitCount + medicalMetrics.permUnfitCount}
              </div>
              <div className="text-[10px] text-orange-700 font-semibold mt-1">Under Clinical Review</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-emerald-600" />
                  Live Medical Compliance & Fitness Distribution
                </h3>
                <span className="text-xs text-slate-500">DGMS Mines Rules 1955</span>
              </div>
              <div className="mt-4 space-y-3">
                {filteredMedical.slice(0, 6).map((med) => (
                  <div key={med.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-900">{med.workerName} ({med.workerId})</div>
                      <div className="text-[11px] text-slate-500">{med.workerDepartment} • {med.examType} ({med.statutoryRuleReference})</div>
                      <div className="text-[10px] text-slate-600 font-mono">Exam Date: {med.completedDate || med.scheduledDate}</div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        med.fitnessResult === 'FIT'
                          ? 'bg-emerald-100 text-emerald-800'
                          : med.fitnessResult === 'TEMPORARILY_UNFIT'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {med.fitnessResult || med.examStatus}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-1 font-mono">
                        Next Due: {med.nextDueDate || 'Pending'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setActiveTab('medical')}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1"
                >
                  Open Medical Examination Module <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  Statutory Rule 29B Compliance Summary & Notice Pipeline
                </h3>
                <span className="text-xs font-semibold text-slate-500">Official NMDC Records</span>
              </div>
              <div className="mt-4 space-y-4">
                <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                    <span>Overall Medical Fitness Index</span>
                    <span className="font-mono text-emerald-700">{medicalMetrics.compliancePercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-emerald-200 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{ width: `${medicalMetrics.compliancePercent}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-emerald-800 mt-2">
                    {medicalMetrics.fitCount} of {medicalMetrics.total} workers hold verified fitness certificates under DGMS standards.
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4 text-sky-600" />
                    Statutory Rule Engine Indicators
                  </div>
                  <div className="flex justify-between text-slate-600 border-b border-slate-200 pb-1.5">
                    <span>Mines Rules 1955 - Rule 29B (PME &lt; 45 Yrs)</span>
                    <span className="font-bold text-slate-900">5-Year Interval</span>
                  </div>
                  <div className="flex justify-between text-slate-600 border-b border-slate-200 pb-1.5">
                    <span>Mines Rules 1955 - Rule 29B (PME ≥ 45 Yrs)</span>
                    <span className="font-bold text-amber-700">3-Year Interval</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>DGMS Technical Circular 01/2021 (Silicosis/Pneumoconiosis)</span>
                    <span className="font-bold text-emerald-700">Annual Chest X-Ray</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. OTHER TRAINING RECORDS DASHBOARD */}
      {activeSection === 'OTHER_TRAINING' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Total Programs Logged</div>
              <div className="text-2xl font-black text-slate-900 font-mono mt-1">{otherTrainingMetrics.total}</div>
              <div className="text-[10px] text-slate-500 mt-1">OEM / Ext / Int / Global</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
              <div className="text-[11px] font-bold text-emerald-700 uppercase">Completed Successfully</div>
              <div className="text-2xl font-black text-emerald-600 font-mono mt-1">{otherTrainingMetrics.completed}</div>
              <div className="text-[10px] text-emerald-700 font-semibold mt-1">Certificates Issued</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
              <div className="text-[11px] font-bold text-indigo-700 uppercase">OEM Certified Courses</div>
              <div className="text-2xl font-black text-indigo-600 font-mono mt-1">{otherTrainingMetrics.oemCount}</div>
              <div className="text-[10px] text-slate-500 mt-1">BEML, Tata Hitachi, Komatsu</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
              <div className="text-[11px] font-bold text-sky-700 uppercase">Internal / In-House</div>
              <div className="text-2xl font-black text-sky-600 font-mono mt-1">{otherTrainingMetrics.internalCount}</div>
              <div className="text-[10px] text-slate-500 mt-1">ESCI / Safety Workshops</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
              <div className="text-[11px] font-bold text-amber-700 uppercase">External & Global</div>
              <div className="text-2xl font-black text-amber-600 font-mono mt-1">
                {otherTrainingMetrics.externalCount + otherTrainingMetrics.internationalCount}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">IIT / ISM / Global SIM</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
              <div className="text-[11px] font-bold text-purple-700 uppercase">Total Investment (INR)</div>
              <div className="text-2xl font-black text-purple-700 font-mono mt-1">
                ₹{(otherTrainingMetrics.totalCost / 100000).toFixed(1)}L
              </div>
              <div className="text-[10px] text-slate-500 mt-1">FY {filterFinYear} Outlay</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  Recent OEM & Advanced Training Records
                </h3>
                <span className="text-xs text-slate-500">Live Course Register</span>
              </div>
              <div className="mt-4 space-y-3">
                {filteredOtherTraining.slice(0, 6).map((rec) => (
                  <div key={rec.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-900">{rec.courseTitle}</div>
                      <div className="text-[11px] text-slate-500">
                        {rec.workerName} ({rec.workerId}) • {rec.workerCategory.replace('_', ' ')}
                      </div>
                      <div className="text-[10px] text-indigo-700 font-medium mt-0.5">
                        {rec.trainingProvider} • {rec.durationHours} Hours • ₹{rec.costInr.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded font-bold text-[10px]">
                        {rec.trainingCategory}
                      </span>
                      <div className="text-[10px] text-emerald-700 font-mono mt-1 font-bold">
                        {rec.completionStatus}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setActiveTab('other-training')}
                  className="text-xs text-indigo-700 hover:text-indigo-800 font-bold flex items-center gap-1"
                >
                  View Full Other Training Register <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-600" />
                  Workforce Category Distribution & Up-skilling Outlay
                </h3>
                <span className="text-xs text-slate-500">Executives & Workmen</span>
              </div>
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-200">
                    <div className="text-xs font-bold text-indigo-900">Executive Development</div>
                    <div className="text-xl font-black text-indigo-700 font-mono mt-1">{otherTrainingMetrics.execCount}</div>
                    <div className="text-[10px] text-indigo-800 mt-1">Management & Safety Leadership</div>
                  </div>
                  <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200">
                    <div className="text-xs font-bold text-amber-900">Workmen Technical Up-skilling</div>
                    <div className="text-xl font-black text-amber-700 font-mono mt-1">{otherTrainingMetrics.workmenCount}</div>
                    <div className="text-[10px] text-amber-800 mt-1">HEMM, Blasting & Electrics</div>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-slate-600" />
                    Key Training Partners & Academies
                  </div>
                  <div className="flex justify-between text-slate-600 border-b border-slate-100 pb-1">
                    <span>BEML Mining Training Institute, KGF</span>
                    <span className="font-bold text-slate-900">HEMM Simulators</span>
                  </div>
                  <div className="flex justify-between text-slate-600 border-b border-slate-100 pb-1">
                    <span>Tata Hitachi Training Centre, Dharwad</span>
                    <span className="font-bold text-slate-900">Hydraulic Excavators</span>
                  </div>
                  <div className="flex justify-between text-slate-600 border-b border-slate-100 pb-1">
                    <span>Engineering Staff College of India (ESCI)</span>
                    <span className="font-bold text-slate-900">Statutory Mine Leadership</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>IIT (ISM) Dhanbad Department of Mining</span>
                    <span className="font-bold text-slate-900">Advanced Blasting Science</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. EXECUTIVE OVERVIEW DASHBOARD (Original Integrated Radar) */}
      {activeSection === 'OVERVIEW' && (
        <div className="space-y-6">
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

              {/* 5. Medical Examination Fitness */}
              <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs hover:border-slate-300 transition-colors">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>MEDICAL COMPLIANCE</span>
                  <Stethoscope className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-emerald-700 font-mono mt-1">
                  {kpis.medicalCompliancePercent}%
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between border-t border-slate-100 pt-1">
                  <span>{kpis.medicalFitCount} Fit</span>
                  <span className="text-rose-700 font-bold">{kpis.medicalOverdueCount} Overdue</span>
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

          {/* Department Performance & Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600">
                        <span>Workers: <strong className="text-slate-900">{workerCount}</strong></span>
                        <span className="text-emerald-700 font-medium">Valid: {validCount}</span>
                        <span className={overdueCount > 0 ? 'text-rose-600 font-bold' : 'text-slate-400'}>
                          Overdue: {overdueCount}
                        </span>
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
      )}
    </div>
  );
};
