import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  GraduationCap,
  Globe2,
  Building2,
  Wrench,
  BookOpen,
  PlusCircle,
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  IndianRupee,
  CheckCircle2,
  Award,
  Users,
  Eye,
  FileCheck,
  Briefcase,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import {
  OtherTrainingRecord,
  OtherTrainingCategory,
  TrainingCompletionStatus,
  TrainingApprovalStatus,
  PersonnelCategory,
} from '../types';

export const OtherTrainingManagement: React.FC = () => {
  const {
    currentUser,
    employees,
    otherTrainingRecords,
    addOtherTrainingRecord,
    updateOtherTrainingRecord,
    exportToCSV,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<'ALL' | OtherTrainingCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [workerCatFilter, setWorkerCatFilter] = useState<'ALL' | PersonnelCategory>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [finYearFilter, setFinYearFilter] = useState<string>('ALL');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');

  // Modals
  const [isNewRecordModalOpen, setIsNewRecordModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<OtherTrainingRecord | null>(null);
  const [viewHistoryWorkerId, setViewHistoryWorkerId] = useState<string | null>(null);

  // Form State
  const [newWorkerId, setNewWorkerId] = useState('');
  const [newCategory, setNewCategory] = useState<OtherTrainingCategory>('OEM');
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newProvider, setNewProvider] = useState('BEML Training Institute, KGF');
  const [newVenue, setNewVenue] = useState('BEML Centre of Excellence, KGF');
  const [newStartDate, setNewStartDate] = useState('2026-10-15');
  const [newEndDate, setNewEndDate] = useState('2026-10-19');
  const [newDurationHours, setNewDurationHours] = useState(35);
  const [newDurationDays, setNewDurationDays] = useState(5);
  const [newCostInr, setNewCostInr] = useState(45000);
  const [newFinYear, setNewFinYear] = useState('2026-27');
  const [newAttendance, setNewAttendance] = useState<'PRESENT' | 'PARTIAL' | 'ABSENT'>('PRESENT');
  const [newCompletion, setNewCompletion] = useState<TrainingCompletionStatus>('COMPLETED');
  const [newApproval, setNewApproval] = useState<TrainingApprovalStatus>('APPROVED');
  const [newApprover, setNewApprover] = useState('Head of Training / CGM (Mining)');
  const [newCertNumber, setNewCertNumber] = useState('');
  const [newSkills, setNewSkills] = useState('');
  const [newRemarks, setNewRemarks] = useState('');

  // Filtered records
  const filteredRecords = useMemo(() => {
    return otherTrainingRecords.filter((rec) => {
      if (activeCategory !== 'ALL' && rec.trainingCategory !== activeCategory) return false;
      if (workerCatFilter !== 'ALL' && rec.workerCategory !== workerCatFilter) return false;
      if (statusFilter !== 'ALL' && rec.completionStatus !== statusFilter) return false;
      if (finYearFilter !== 'ALL' && rec.financialYear !== finYearFilter) return false;
      if (deptFilter !== 'ALL' && rec.workerDepartment !== deptFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mTitle = rec.courseTitle.toLowerCase().includes(q);
        const mProv = rec.trainingProvider.toLowerCase().includes(q);
        const mName = rec.workerName.toLowerCase().includes(q);
        const mId = rec.workerId.toLowerCase().includes(q);
        const mCert = rec.certificateNumber.toLowerCase().includes(q);
        if (!mTitle && !mProv && !mName && !mId && !mCert) return false;
      }
      return true;
    });
  }, [otherTrainingRecords, activeCategory, workerCatFilter, statusFilter, finYearFilter, deptFilter, searchQuery]);

  // Analytics Metrics
  const analytics = useMemo(() => {
    const total = otherTrainingRecords.length;
    const completed = otherTrainingRecords.filter((r) => r.completionStatus === 'COMPLETED').length;
    const totalCost = otherTrainingRecords.reduce((acc, r) => acc + (r.costInr || 0), 0);
    const totalHours = otherTrainingRecords.reduce((acc, r) => acc + (r.durationHours || 0), 0);
    const execCount = otherTrainingRecords.filter((r) => r.workerCategory === 'REGULAR_EXECUTIVE').length;
    const workCount = otherTrainingRecords.filter((r) => r.workerCategory !== 'REGULAR_EXECUTIVE').length;
    const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : '100';

    return { total, completed, totalCost, totalHours, execCount, workCount, completionRate };
  }, [otherTrainingRecords]);

  // Selected Employee Multiple Training Records History
  const workerTrainingHistory = useMemo(() => {
    if (!viewHistoryWorkerId) return [];
    return otherTrainingRecords.filter((r) => r.workerId === viewHistoryWorkerId);
  }, [otherTrainingRecords, viewHistoryWorkerId]);

  // Handle Create Training Record
  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const worker = employees.find((emp) => emp.id === newWorkerId);
    if (!worker) return;

    const certNo = newCertNumber.trim() || `NMDC-OTR-CERT-${Date.now().toString().slice(-4)}`;
    const skillsList = newSkills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    addOtherTrainingRecord({
      workerId: worker.id,
      workerName: worker.name,
      workerDepartment: worker.department,
      workerDesignation: worker.designation,
      workerCategory: worker.employeeType === 'NMDC_REGULAR'
        ? (worker.grade.startsWith('E') ? 'REGULAR_EXECUTIVE' : 'REGULAR_WORKMAN')
        : 'CONTRACTOR_WORKMAN',
      trainingCategory: newCategory,
      courseTitle: newCourseTitle,
      trainingProvider: newProvider,
      venue: newVenue,
      startDate: newStartDate,
      endDate: newEndDate,
      durationHours: Number(newDurationHours) || 8,
      durationDays: Number(newDurationDays) || 1,
      costInr: Number(newCostInr) || 0,
      financialYear: newFinYear,
      attendanceStatus: newAttendance,
      completionStatus: newCompletion,
      approvalStatus: newApproval,
      approvingAuthority: newApprover,
      certificateNumber: certNo,
      skillsLearned: skillsList.length > 0 ? skillsList : ['Industrial Competency Standards'],
      remarks: newRemarks,
    });

    setIsNewRecordModalOpen(false);
    // Reset Form
    setNewCourseTitle('');
    setNewSkills('');
    setNewRemarks('');
  };

  const handleExportCSV = () => {
    const headers = [
      'Worker ID',
      'Worker Name',
      'Department',
      'Designation',
      'Category (Exec/Workman)',
      'Training Category',
      'Course Title',
      'Provider',
      'Venue',
      'Start Date',
      'End Date',
      'Duration (Hours)',
      'Cost (INR)',
      'FY',
      'Attendance',
      'Status',
      'Approver',
      'Certificate No',
    ];

    const rows = filteredRecords.map((r) => [
      r.workerId,
      r.workerName,
      r.workerDepartment,
      r.workerDesignation,
      r.workerCategory,
      r.trainingCategory,
      r.courseTitle,
      r.trainingProvider,
      r.venue,
      r.startDate,
      r.endDate,
      r.durationHours,
      r.costInr,
      r.financialYear,
      r.attendanceStatus,
      r.completionStatus,
      r.approvingAuthority,
      r.certificateNumber,
    ]);

    exportToCSV('NMDC_Donimalai_Other_Training_Register', headers, rows);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl p-6 shadow-md border border-indigo-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-lg border border-indigo-400/30">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                  Specialized Technical Competency
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Executives & Workmen Covered
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
                Other Training Records (OEM, Internal, External & International)
              </h1>
              <p className="text-xs sm:text-sm text-indigo-200/80 mt-1 max-w-3xl">
                Comprehensive tracking for Original Equipment Manufacturer (OEM), Internal Centre of Excellence, External Apex Institutes (IITs/ESCI) and International technical training programs. Retains complete employee training history with cost & approvals.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                if (employees.length > 0) setNewWorkerId(employees[0].id);
                setIsNewRecordModalOpen(true);
              }}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Log Training Record
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-200 text-xs font-semibold rounded-lg border border-indigo-700/50 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Records
            </button>
          </div>
        </div>

        {/* 4 Pillars Quick Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5 pt-4 border-t border-indigo-800/50 text-xs text-indigo-200">
          <div className="flex items-center gap-2 bg-indigo-950/40 p-2 rounded-lg border border-indigo-800/40">
            <Wrench className="w-4 h-4 text-amber-400" />
            <div>
              <div className="font-bold text-white">OEM Training</div>
              <div className="text-[10px] text-indigo-300">BEML, Tata Hitachi, Komatsu</div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-indigo-950/40 p-2 rounded-lg border border-indigo-800/40">
            <Building2 className="w-4 h-4 text-sky-400" />
            <div>
              <div className="font-bold text-white">Internal Training</div>
              <div className="text-[10px] text-indigo-300">NMDC VTC & Workshop Centre</div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-indigo-950/40 p-2 rounded-lg border border-indigo-800/40">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="font-bold text-white">External Training</div>
              <div className="text-[10px] text-indigo-300">ESCI, IITs, NITs, ASCI</div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-indigo-950/40 p-2 rounded-lg border border-indigo-800/40">
            <Globe2 className="w-4 h-4 text-purple-400" />
            <div>
              <div className="font-bold text-white">International</div>
              <div className="text-[10px] text-indigo-300">Overseas Mining & Automation</div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Total Records</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{analytics.total}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Retained In Database</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <div className="text-xs font-medium text-emerald-700">Completed</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{analytics.completed}</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">{analytics.completionRate}% Completion Rate</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-indigo-200 bg-indigo-50/20 shadow-xs">
          <div className="text-xs font-medium text-indigo-700">Total Man-Hours</div>
          <div className="text-2xl font-bold text-indigo-700 mt-1">{analytics.totalHours} hrs</div>
          <div className="text-[11px] text-indigo-600 mt-0.5">Classroom & Lab</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <div className="text-xs font-medium text-amber-700">Total Investment</div>
          <div className="text-xl font-bold text-amber-700 mt-1">
            ₹{(analytics.totalCost / 100000).toFixed(2)} L
          </div>
          <div className="text-[11px] text-amber-600 mt-0.5">Approved Budget</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-sky-200 bg-sky-50/20 shadow-xs">
          <div className="text-xs font-medium text-sky-700">Executives</div>
          <div className="text-2xl font-bold text-sky-700 mt-1">{analytics.execCount}</div>
          <div className="text-[11px] text-sky-600 mt-0.5">E-01 to E-08 Cadre</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-purple-200 bg-purple-50/20 shadow-xs">
          <div className="text-xs font-medium text-purple-700">Workmen / Technicians</div>
          <div className="text-2xl font-bold text-purple-700 mt-1">{analytics.workCount}</div>
          <div className="text-[11px] text-purple-600 mt-0.5">W-01 to W-10 & Contractors</div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveCategory('ALL')}
          className={`py-2.5 px-4 font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeCategory === 'ALL'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          All Categories ({otherTrainingRecords.length})
        </button>
        <button
          onClick={() => setActiveCategory('OEM')}
          className={`py-2.5 px-4 font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeCategory === 'OEM'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Wrench className="w-4 h-4 text-amber-600" />
          OEM Programs ({otherTrainingRecords.filter((r) => r.trainingCategory === 'OEM').length})
        </button>
        <button
          onClick={() => setActiveCategory('INTERNAL')}
          className={`py-2.5 px-4 font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeCategory === 'INTERNAL'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4 text-sky-600" />
          Internal Programs ({otherTrainingRecords.filter((r) => r.trainingCategory === 'INTERNAL').length})
        </button>
        <button
          onClick={() => setActiveCategory('EXTERNAL')}
          className={`py-2.5 px-4 font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeCategory === 'EXTERNAL'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4 text-emerald-600" />
          External Programs ({otherTrainingRecords.filter((r) => r.trainingCategory === 'EXTERNAL').length})
        </button>
        <button
          onClick={() => setActiveCategory('INTERNATIONAL')}
          className={`py-2.5 px-4 font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeCategory === 'INTERNATIONAL'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Globe2 className="w-4 h-4 text-purple-600" />
          International ({otherTrainingRecords.filter((r) => r.trainingCategory === 'INTERNATIONAL').length})
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap gap-3 items-center justify-between text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by course title, provider, employee name, or certificate..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Cadre:</span>
            <select
              value={workerCatFilter}
              onChange={(e) => setWorkerCatFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5 text-xs text-slate-700"
            >
              <option value="ALL">All Cadres</option>
              <option value="REGULAR_EXECUTIVE">Executives (E-0 to E-8)</option>
              <option value="REGULAR_WORKMAN">Regular Workmen</option>
              <option value="CONTRACTOR_WORKMAN">Contractor Workmen</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5 text-xs text-slate-700"
            >
              <option value="ALL">All Status</option>
              <option value="COMPLETED">Completed</option>
              <option value="ONGOING">Ongoing</option>
              <option value="NOMINATED">Nominated</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-500">FY:</span>
            <select
              value={finYearFilter}
              onChange={(e) => setFinYearFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5 text-xs text-slate-700"
            >
              <option value="ALL">All Financial Years</option>
              <option value="2026-27">FY 2026-27</option>
              <option value="2025-26">FY 2025-26</option>
              <option value="2024-25">FY 2024-25</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-500">Dept:</span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5 text-xs text-slate-700"
            >
              <option value="ALL">All Departments</option>
              <option value="Mining">Mining</option>
              <option value="Mechanical Services">Mechanical Services</option>
              <option value="Electrical Services">Electrical Services</option>
              <option value="Training">Training</option>
              <option value="Screening Plant">Screening Plant</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-4">Course Title & Provider</th>
                <th className="py-3 px-3">Dates & Duration</th>
                <th className="py-3 px-3">Cost (INR)</th>
                <th className="py-3 px-3">Status & Approvals</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No other training records found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{rec.workerName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                        <span className="font-mono text-indigo-700 font-medium">{rec.workerId}</span>
                        <span>•</span>
                        <span>{rec.workerDepartment}</span>
                      </div>
                      <span className="inline-block mt-0.5 px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded text-[10px]">
                        {rec.workerCategory === 'REGULAR_EXECUTIVE'
                          ? 'Executive'
                          : rec.workerCategory === 'REGULAR_WORKMAN'
                          ? 'Workman'
                          : 'Contract Worker'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                          rec.trainingCategory === 'OEM'
                            ? 'bg-amber-100 text-amber-800'
                            : rec.trainingCategory === 'INTERNAL'
                            ? 'bg-sky-100 text-sky-800'
                            : rec.trainingCategory === 'EXTERNAL'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {rec.trainingCategory}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-semibold text-slate-900 line-clamp-1">{rec.courseTitle}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">
                        <strong>Provider:</strong> {rec.trainingProvider}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">Venue: {rec.venue}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-900 font-medium">{rec.startDate}</div>
                      <div className="text-[11px] text-slate-500">to {rec.endDate}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {rec.durationHours} hrs ({rec.durationDays} days)
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">₹{rec.costInr.toLocaleString('en-IN')}</div>
                      <div className="text-[10px] text-slate-400">FY {rec.financialYear}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                          rec.completionStatus === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rec.completionStatus === 'ONGOING'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {rec.completionStatus}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                        Approved by {rec.approvingAuthority}
                      </div>
                      <div className="font-mono text-[10px] text-slate-400 mt-0.5">{rec.certificateNumber}</div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedRecord(rec)}
                          className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded font-medium text-[11px] flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                        <button
                          onClick={() => setViewHistoryWorkerId(rec.workerId)}
                          title="View all training history for this employee"
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded font-medium text-[11px] transition-colors"
                        >
                          History
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD DETAILS MODAL */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/20 text-indigo-300 rounded-lg border border-indigo-400/30">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Training Record Details</h3>
                  <p className="text-xs text-indigo-200">
                    {selectedRecord.trainingCategory} • {selectedRecord.certificateNumber}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedRecord(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="text-sm font-bold text-slate-900">{selectedRecord.courseTitle}</div>
                <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] border-t border-slate-200">
                  <div>
                    <span className="text-slate-500 block">Trained Employee:</span>
                    <span className="font-bold text-slate-900">{selectedRecord.workerName} ({selectedRecord.workerId})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Department / Role:</span>
                    <span className="text-slate-800">{selectedRecord.workerDepartment} • {selectedRecord.workerDesignation}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Training Provider:</span>
                    <span className="font-semibold text-slate-900">{selectedRecord.trainingProvider}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Venue:</span>
                    <span className="text-slate-800">{selectedRecord.venue}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Dates & Duration:</span>
                    <span className="text-slate-900">{selectedRecord.startDate} to {selectedRecord.endDate} ({selectedRecord.durationHours} hrs)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Investment Cost:</span>
                    <span className="font-bold text-amber-700">₹{selectedRecord.costInr.toLocaleString('en-IN')} (FY {selectedRecord.financialYear})</span>
                  </div>
                </div>
              </div>

              {selectedRecord.skillsLearned.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-slate-800 mb-1.5">Acquired Competencies & Skills:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedRecord.skillsLearned.map((skill, i) => (
                      <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md text-[11px] font-medium">
                        ✓ {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedRecord.remarks && (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] text-slate-700">
                  <strong>Evaluator Remarks:</strong> {selectedRecord.remarks}
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <div>Approving Authority: <span className="font-semibold text-slate-800">{selectedRecord.approvingAuthority}</span></div>
                <div>Status: <span className="font-bold text-emerald-700">{selectedRecord.completionStatus}</span></div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MULTIPLE TRAINING HISTORY MODAL (EMPLOYEE-WISE) */}
      {viewHistoryWorkerId && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="font-bold text-base text-white">
                    Employee Training Career Log • {viewHistoryWorkerId}
                  </h3>
                  <p className="text-xs text-slate-300">
                    Complete multi-course OEM, internal, and external training history
                  </p>
                </div>
              </div>
              <button onClick={() => setViewHistoryWorkerId(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-3 text-xs max-h-[70vh] overflow-y-auto">
              {workerTrainingHistory.length === 0 ? (
                <div className="py-6 text-center text-slate-500">
                  No other training records logged for this employee.
                </div>
              ) : (
                workerTrainingHistory.map((hist, idx) => (
                  <div key={hist.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex items-start justify-between">
                      <div className="font-bold text-sm text-slate-900">{hist.courseTitle}</div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                        {hist.trainingCategory}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      <strong>Provider:</strong> {hist.trainingProvider} ({hist.venue})
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-slate-500 pt-1">
                      <span>Dates: {hist.startDate} - {hist.endDate}</span>
                      <span>Duration: {hist.durationHours} hrs</span>
                      <span>Cost: ₹{hist.costInr.toLocaleString('en-IN')}</span>
                      <span className="text-emerald-700 font-bold">Cert: {hist.certificateNumber}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setViewHistoryWorkerId(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW TRAINING RECORD MODAL */}
      {isNewRecordModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
            <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GraduationCap className="w-5 h-5 text-indigo-300" />
                <div>
                  <h3 className="font-bold text-base text-white">Log Other Training Record</h3>
                  <p className="text-xs text-indigo-200">Capture OEM, Internal, External or International Program</p>
                </div>
              </div>
              <button onClick={() => setIsNewRecordModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRecord} className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Nominated Employee / Executive:</label>
                <select
                  value={newWorkerId}
                  onChange={(e) => setNewWorkerId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-xs text-slate-900 font-semibold"
                  required
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.id}) • {emp.department} • {emp.designation} ({emp.grade})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Training Category:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as OtherTrainingCategory)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-xs text-slate-900 font-bold"
                  >
                    <option value="OEM">OEM (Original Equipment Manufacturer)</option>
                    <option value="INTERNAL">Internal (NMDC Centre of Excellence)</option>
                    <option value="EXTERNAL">External (ESCI / IIT / NIT)</option>
                    <option value="INTERNATIONAL">International (Overseas Exposure)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Financial Year:</label>
                  <select
                    value={newFinYear}
                    onChange={(e) => setNewFinYear(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-xs text-slate-900"
                  >
                    <option value="2026-27">FY 2026-27</option>
                    <option value="2025-26">FY 2025-26</option>
                    <option value="2024-25">FY 2024-25</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Course Title:</label>
                <input
                  type="text"
                  placeholder="e.g. BEML Electric Wheel Drive Diagnostics & Simulator Masterclass"
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-xs text-slate-900 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Training Provider:</label>
                  <input
                    type="text"
                    value={newProvider}
                    onChange={(e) => setNewProvider(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-xs text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Venue / Location:</label>
                  <input
                    type="text"
                    value={newVenue}
                    onChange={(e) => setNewVenue(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-xs text-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Start Date:</label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-xs text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">End Date:</label>
                  <input
                    type="date"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-xs text-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Duration (Hours):</label>
                  <input
                    type="number"
                    value={newDurationHours}
                    onChange={(e) => setNewDurationHours(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-xs text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Duration (Days):</label>
                  <input
                    type="number"
                    value={newDurationDays}
                    onChange={(e) => setNewDurationDays(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-xs text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Cost / Fee (INR):</label>
                  <input
                    type="number"
                    value={newCostInr}
                    onChange={(e) => setNewCostInr(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-xs text-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Completion Status:</label>
                  <select
                    value={newCompletion}
                    onChange={(e) => setNewCompletion(e.target.value as TrainingCompletionStatus)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-xs text-slate-900 font-bold"
                  >
                    <option value="COMPLETED">Completed</option>
                    <option value="ONGOING">Ongoing</option>
                    <option value="NOMINATED">Nominated</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Approving Authority:</label>
                  <input
                    type="text"
                    value={newApprover}
                    onChange={(e) => setNewApprover(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-xs text-slate-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Skills Acquired (Comma separated):</label>
                <input
                  type="text"
                  placeholder="e.g. Hydraulic circuit analysis, Brake calibration, PLC telemetry"
                  value={newSkills}
                  onChange={(e) => setNewSkills(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-xs text-slate-900"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewRecordModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs shadow-xs"
                >
                  Save Training Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
