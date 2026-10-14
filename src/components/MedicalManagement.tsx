import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Stethoscope,
  ShieldAlert,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  Download,
  PlusCircle,
  Eye,
  EyeOff,
  Clock,
  UserCheck,
  Lock,
  CheckCircle2,
  XCircle,
  Printer,
  ChevronRight,
  FileCheck2,
  RefreshCw,
  Info,
} from 'lucide-react';
import {
  MedicalRecord,
  MedicalExamType,
  MedicalFitnessResult,
  MedicalExamStatus,
  StatutoryRuleVersion,
  MedicalNotice,
} from '../types';

export const MedicalManagement: React.FC = () => {
  const {
    currentUser,
    employees,
    medicalRecords,
    statutoryRuleVersions,
    medicalNotices,
    addMedicalRecord,
    updateMedicalRecord,
    addMedicalNotice,
    exportToCSV,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'REGISTER' | 'SCHEDULES' | 'NOTICES' | 'RULES'>('REGISTER');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterExamType, setFilterExamType] = useState<string>('ALL');
  const [filterFitness, setFilterFitness] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterDepartment, setFilterDepartment] = useState<string>('ALL');

  // Modals
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isNewExamModalOpen, setIsNewExamModalOpen] = useState(false);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [selectedNoticeForPrint, setSelectedNoticeForPrint] = useState<MedicalNotice | null>(null);

  // New Examination Form State
  const [newWorkerId, setNewWorkerId] = useState('');
  const [newExamType, setNewExamType] = useState<MedicalExamType>('PME');
  const [newExamStatus, setNewExamStatus] = useState<MedicalExamStatus>('COMPLETED');
  const [newScheduledDate, setNewScheduledDate] = useState('2026-10-15');
  const [newCompletedDate, setNewCompletedDate] = useState('2026-10-15');
  const [newFitnessResult, setNewFitnessResult] = useState<MedicalFitnessResult>('FIT');
  const [newDoctorName, setNewDoctorName] = useState('Dr. B. K. Sharma, CMO');
  const [newDoctorRegNo, setNewDoctorRegNo] = useState('KMC/1994/28192');
  const [newRestrictionNotes, setNewRestrictionNotes] = useState('');
  const [newChestXRay, setNewChestXRay] = useState<'NORMAL' | 'CLEAR' | 'SUSPICIOUS' | 'PNEUMOCONIOSIS_CATEGORY_1'>('NORMAL');
  const [newAudiometry, setNewAudiometry] = useState<'NORMAL_HEARING' | 'MILD_HIGH_FREQ_LOSS' | 'NOISE_INDUCED_HEARING_LOSS'>('NORMAL_HEARING');
  const [newSpirometry, setNewSpirometry] = useState('3.8 L (96% predicted)');
  const [newBP, setNewBP] = useState('120/80 mmHg');
  const [newSugar, setNewSugar] = useState('92 mg/dL');
  const [newVisualAcuity, setNewVisualAcuity] = useState('6/6 bilateral');
  const [newClinicalNotes, setNewClinicalNotes] = useState('');

  // Check if current user is authorized to view sensitive clinical diagnostics
  const isAuthorizedMedical = useMemo(() => {
    return (
      currentUser.role === 'Medical Officer' ||
      currentUser.role === 'Authorized Medical Personnel' ||
      currentUser.role === 'Super Administrator'
    );
  }, [currentUser]);

  // Filtered Medical Records
  const filteredRecords = useMemo(() => {
    return medicalRecords.filter((rec) => {
      if (filterExamType !== 'ALL' && rec.examType !== filterExamType) return false;
      if (filterFitness !== 'ALL' && rec.fitnessResult !== filterFitness) return false;
      if (filterStatus !== 'ALL' && rec.examStatus !== filterStatus) return false;
      if (filterDepartment !== 'ALL' && rec.workerDepartment !== filterDepartment) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mName = rec.workerName.toLowerCase().includes(q);
        const mId = rec.workerId.toLowerCase().includes(q);
        const mCert = rec.certificateNumber.toLowerCase().includes(q);
        const mDept = rec.workerDepartment.toLowerCase().includes(q);
        if (!mName && !mId && !mCert && !mDept) return false;
      }
      return true;
    });
  }, [medicalRecords, filterExamType, filterFitness, filterStatus, filterDepartment, searchQuery]);

  // Summary counts
  const kpiStats = useMemo(() => {
    const total = medicalRecords.length;
    const fit = medicalRecords.filter((r) => r.fitnessResult === 'FIT').length;
    const unfit = medicalRecords.filter((r) => r.fitnessResult === 'UNFIT' || r.fitnessResult === 'TEMPORARILY_UNFIT').length;
    const dueSoon = medicalRecords.filter((r) => r.examStatus === 'DUE_SOON').length;
    const overdue = medicalRecords.filter((r) => r.examStatus === 'OVERDUE').length;
    const compliancePercent = total > 0 ? ((fit / total) * 100).toFixed(1) : '100';
    return { total, fit, unfit, dueSoon, overdue, compliancePercent };
  }, [medicalRecords]);

  // Handle Save New Medical Record
  const handleCreateMedicalRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const worker = employees.find((emp) => emp.id === newWorkerId);
    if (!worker) return;

    // Calculate age
    const birthYear = parseInt(worker.dateOfBirth?.split('-')[0] || '1985', 10);
    const workerAge = 2026 - birthYear;

    // DGMS Rule 29B Periodicity: <=45 years: 5 years (60 months); >45 years: 3 years (36 months)
    const periodicityMonths = workerAge > 45 ? 36 : 60;
    const validTillDate = new Date(newCompletedDate);
    validTillDate.setMonth(validTillDate.getMonth() + periodicityMonths);
    const validTillStr = validTillDate.toISOString().split('T')[0];

    const certPrefix = worker.employeeType === 'NMDC_REGULAR' ? 'FORM-O/NMDC/DNM' : 'FORM-O/NMDC/CONT';
    const certNum = `${certPrefix}/2026/${String(medicalRecords.length + 1).padStart(3, '0')}`;

    addMedicalRecord({
      workerId: worker.id,
      workerName: worker.name,
      workerDesignation: worker.designation,
      workerDepartment: worker.department,
      workerCategory: worker.employeeType === 'NMDC_REGULAR'
        ? (worker.grade.startsWith('E') ? 'REGULAR_EXECUTIVE' : 'REGULAR_WORKMAN')
        : 'CONTRACTOR_WORKMAN',
      workerAge,
      dateOfBirth: worker.dateOfBirth,
      examType: newExamType,
      examStatus: newExamStatus,
      scheduledDate: newScheduledDate,
      completedDate: newExamStatus === 'COMPLETED' ? newCompletedDate : null,
      validTill: validTillStr,
      nextDueDate: validTillStr,
      certificateNumber: certNum,
      examiningDoctor: newDoctorName,
      doctorRegistrationNo: newDoctorRegNo,
      fitnessResult: newFitnessResult,
      statutoryRuleReference: 'Mines Rules 1955 - Rule 29B',
      ruleVersion: '2021.1 (Standard)',
      publicFitnessIndicator: newFitnessResult === 'FIT'
        ? 'Medically Fit for Opencast Heavy Mining Operations'
        : newFitnessResult === 'TEMPORARILY_UNFIT'
        ? 'Temporarily Unfit - Medical Follow-up Required'
        : 'Medically Unfit for High-Hazard Mining Duties',
      restrictionNotes: newRestrictionNotes,
      chestXRayResult: newChestXRay,
      chestXRayDate: newCompletedDate,
      audiometryResult: newAudiometry,
      lungSpirometryFvc: newSpirometry,
      bloodPressure: newBP,
      bloodSugarFasting: newSugar,
      visualAcuity: newVisualAcuity,
      clinicalObservations: newClinicalNotes,
    });

    setIsNewExamModalOpen(false);
  };

  // Handle Generate Form M Notice
  const handleIssueNotice = (record: MedicalRecord, type: 'FORM_M_PERIODICAL' | 'FORM_N_REEXAMINATION') => {
    const today = new Date().toISOString().split('T')[0];
    const examDate = new Date();
    examDate.setDate(examDate.getDate() + 20); // Prescribed notice at least 20 days prior
    const examDateStr = examDate.toISOString().split('T')[0];

    const noticeNum = type === 'FORM_M_PERIODICAL'
      ? `NMDC/DNM/MED/FORM-M/2026/${String(medicalNotices.length + 1).padStart(3, '0')}`
      : `NMDC/DNM/MED/FORM-N/2026/${String(medicalNotices.length + 1).padStart(3, '0')}`;

    const newNot = addMedicalNotice({
      workerId: record.workerId,
      workerName: record.workerName,
      noticeType: type,
      noticeNumber: noticeNum,
      issueDate: today,
      examScheduledDate: examDateStr,
      venue: 'NMDC Project Hospital Donimalai (Occupational Health Centre, Room 12)',
      servedBy: currentUser.name,
      status: 'ISSUED',
      remarks: `Statutory examination notice under Rule 29B of Mines Rules 1955 served to ${record.workerName}.`,
    });

    setSelectedNoticeForPrint(newNot);
    setIsNoticeModalOpen(true);
  };

  const handleExportMedical = () => {
    const headers = [
      'Worker ID',
      'Worker Name',
      'Department',
      'Designation',
      'Age',
      'Exam Type',
      'Status',
      'Completed Date',
      'Valid Till',
      'Certificate No',
      'Fitness Result',
      'Public Indicator',
    ];
    const rows = filteredRecords.map((r) => [
      r.workerId,
      r.workerName,
      r.workerDepartment,
      r.workerDesignation,
      r.workerAge,
      r.examType,
      r.examStatus,
      r.completedDate || 'Pending',
      r.validTill,
      r.certificateNumber,
      r.fitnessResult,
      r.publicFitnessIndicator,
    ]);
    exportToCSV('NMDC_Donimalai_Medical_Examination_Register', headers, rows);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white rounded-xl p-6 shadow-md border border-sky-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-sky-500/20 text-sky-400 rounded-lg border border-sky-400/30">
              <Stethoscope className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-500/30 text-sky-300 border border-sky-400/30">
                  DGMS Statutory Mines Rules 1955 • Rule 29B
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Form M • Form N • Form O
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
                Medical Examination Module (IME & PME)
              </h1>
              <p className="text-xs sm:text-sm text-sky-200/80 mt-1 max-w-3xl">
                Initial Medical Examination (IME) at entry & Periodical Medical Examination (PME) periodicity tracking.
                Configured with statutory age-bracket periodicity rules (≤45 years every 5 years; &gt;45 years every 3 years).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {isAuthorizedMedical && (
              <button
                onClick={() => {
                  if (employees.length > 0) setNewWorkerId(employees[0].id);
                  setIsNewExamModalOpen(true);
                }}
                className="px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Record Medical Exam
              </button>
            )}
            <button
              onClick={handleExportMedical}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-sky-200 text-xs font-semibold rounded-lg border border-sky-700/50 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Register
            </button>
          </div>
        </div>

        {/* Security / Privacy Role Indicator Banner */}
        <div className="mt-5 pt-4 border-t border-sky-800/50 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-sky-200/90 gap-2">
          <div className="flex items-center gap-2">
            {isAuthorizedMedical ? (
              <span className="flex items-center gap-1.5 text-emerald-300 font-medium bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-500/30">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Medical Personnel Clearance Active: Full Access to Diagnostic & Clinical Data
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-300 font-medium bg-amber-950/60 px-2.5 py-1 rounded-md border border-amber-500/30">
                <Lock className="w-4 h-4 text-amber-400" />
                Data Privacy Enforced: Clinical observations & diagnostic notes restricted to Authorized Medical Personnel
              </span>
            )}
          </div>
          <div className="text-[11px] text-sky-300/70">
            Current Operator: <span className="text-white font-medium">{currentUser.name}</span> ({currentUser.role})
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Total Tracked</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{kpiStats.total}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Mine Workforce</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <div className="text-xs font-medium text-emerald-700">Medically Fit</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{kpiStats.fit}</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Form O Certified</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <div className="text-xs font-medium text-amber-700">Due Soon (&lt;30d)</div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{kpiStats.dueSoon}</div>
          <div className="text-[11px] text-amber-600 mt-0.5">Form M Served</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-xs">
          <div className="text-xs font-medium text-rose-700">Overdue Exams</div>
          <div className="text-2xl font-bold text-rose-700 mt-1">{kpiStats.overdue}</div>
          <div className="text-[11px] text-rose-600 mt-0.5">Immediate Notice</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-orange-200 bg-orange-50/20 shadow-xs">
          <div className="text-xs font-medium text-orange-700">Unfit / Observation</div>
          <div className="text-2xl font-bold text-orange-700 mt-1">{kpiStats.unfit}</div>
          <div className="text-[11px] text-orange-600 mt-0.5">Form N Appeal</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-sky-200 bg-sky-50/20 shadow-xs">
          <div className="text-xs font-medium text-sky-700">Medical Fitness %</div>
          <div className="text-2xl font-bold text-sky-700 mt-1">{kpiStats.compliancePercent}%</div>
          <div className="text-[11px] text-sky-600 mt-0.5">Statutory Ratio</div>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="border-b border-slate-200 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveSubTab('REGISTER')}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeSubTab === 'REGISTER'
                ? 'border-sky-600 text-sky-700 bg-sky-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            Medical Fitness Register (IME & PME)
          </button>
          <button
            onClick={() => setActiveSubTab('NOTICES')}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeSubTab === 'NOTICES'
                ? 'border-sky-600 text-sky-700 bg-sky-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            Statutory Examination Notices (Form M & N)
            <span className="ml-1 px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded-full text-[10px]">
              {medicalNotices.length}
            </span>
          </button>
          <button
            onClick={() => setActiveSubTab('RULES')}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeSubTab === 'RULES'
                ? 'border-sky-600 text-sky-700 bg-sky-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Statutory Rule Versions & Amendments
          </button>
        </div>
      </div>

      {/* SUB TAB 1: MEDICAL REGISTER */}
      {activeSubTab === 'REGISTER' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap gap-3 items-center justify-between text-xs">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by worker name, ID, department or certificate..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1">
                <span className="text-slate-500">Exam:</span>
                <select
                  value={filterExamType}
                  onChange={(e) => setFilterExamType(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5 text-xs text-slate-700"
                >
                  <option value="ALL">All Types</option>
                  <option value="IME">IME (Initial)</option>
                  <option value="PME">PME (Periodical)</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-slate-500">Result:</span>
                <select
                  value={filterFitness}
                  onChange={(e) => setFilterFitness(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5 text-xs text-slate-700"
                >
                  <option value="ALL">All Results</option>
                  <option value="FIT">Fit</option>
                  <option value="TEMPORARILY_UNFIT">Temporarily Unfit</option>
                  <option value="UNFIT">Unfit</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-slate-500">Status:</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5 text-xs text-slate-700"
                >
                  <option value="ALL">All Status</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="DUE_SOON">Due Soon (&lt;30d)</option>
                  <option value="OVERDUE">Overdue</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-slate-500">Dept:</span>
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5 text-xs text-slate-700"
                >
                  <option value="ALL">All Depts</option>
                  <option value="Mining">Mining</option>
                  <option value="Mechanical Services">Mechanical Services</option>
                  <option value="Electrical Services">Electrical Services</option>
                  <option value="Screening Plant">Screening Plant</option>
                  <option value="Loading Plant">Loading Plant</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold uppercase text-[11px] tracking-wider">
                    <th className="py-3 px-4">Employee Details</th>
                    <th className="py-3 px-3">Exam Type</th>
                    <th className="py-3 px-3">Age & Rule Rule 29B</th>
                    <th className="py-3 px-3">Completed / Valid Till</th>
                    <th className="py-3 px-3">Fitness Result</th>
                    <th className="py-3 px-3">Form O Certificate No</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        No medical examination records match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{rec.workerName}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                            <span className="font-mono text-sky-700 font-medium">{rec.workerId}</span>
                            <span>•</span>
                            <span>{rec.workerDepartment}</span>
                          </div>
                          <div className="text-[10px] text-slate-400">{rec.workerDesignation}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium text-[11px] ${
                              rec.examType === 'IME'
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-sky-100 text-sky-800'
                            }`}
                          >
                            {rec.examType}
                          </span>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {rec.examType === 'IME' ? 'Initial (Entry)' : 'Periodical'}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-medium text-slate-900">{rec.workerAge} yrs</div>
                          <div className="text-[10px] text-slate-500">
                            {rec.workerAge > 45 ? 'Periodicity: 3 Yrs (>45)' : 'Periodicity: 5 Yrs (≤45)'}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-medium text-slate-900">
                            {rec.completedDate ? rec.completedDate : 'Pending'}
                          </div>
                          <div className="text-[11px] flex items-center gap-1 mt-0.5">
                            <span className="text-slate-500">Valid:</span>
                            <span
                              className={`font-semibold ${
                                rec.examStatus === 'OVERDUE'
                                  ? 'text-rose-600'
                                  : rec.examStatus === 'DUE_SOON'
                                  ? 'text-amber-600'
                                  : 'text-emerald-600'
                              }`}
                            >
                              {rec.validTill}
                            </span>
                          </div>
                          {rec.examStatus === 'OVERDUE' && (
                            <span className="inline-block px-1.5 py-0.2 bg-rose-100 text-rose-800 text-[10px] rounded font-semibold mt-0.5">
                              Overdue
                            </span>
                          )}
                          {rec.examStatus === 'DUE_SOON' && (
                            <span className="inline-block px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[10px] rounded font-semibold mt-0.5">
                              Due &lt;30 Days
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              rec.fitnessResult === 'FIT'
                                ? 'bg-emerald-100 text-emerald-800'
                                : rec.fitnessResult === 'TEMPORARILY_UNFIT'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {rec.fitnessResult === 'FIT' ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ) : rec.fitnessResult === 'TEMPORARILY_UNFIT' ? (
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            )}
                            {rec.fitnessResult}
                          </span>
                          <div className="text-[10px] text-slate-500 mt-0.5 max-w-[140px] truncate">
                            {rec.publicFitnessIndicator}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-mono text-slate-800 font-medium text-[11px]">
                            {rec.certificateNumber}
                          </div>
                          <div className="text-[10px] text-slate-500">By {rec.examiningDoctor}</div>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedRecord(rec);
                                setIsRecordModalOpen(true);
                              }}
                              className="px-2.5 py-1 text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded font-medium flex items-center gap-1 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Inspect
                            </button>
                            <button
                              onClick={() => handleIssueNotice(rec, 'FORM_M_PERIODICAL')}
                              title="Generate Form M Statutory Notice"
                              className="px-2 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded font-medium text-[11px] transition-colors"
                            >
                              Form M
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
        </div>
      )}

      {/* SUB TAB 2: STATUTORY NOTICES (FORM M & N) */}
      {activeSubTab === 'NOTICES' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-900 text-xs">
            <div className="font-bold flex items-center gap-1.5 text-amber-950 mb-1">
              <Info className="w-4 h-4 text-amber-700" />
              Mines Rules 1955 Statutory Notice Protocols
            </div>
            <p>
              Under <strong>Rule 29B</strong>, the owner, agent or manager shall give not less than <strong>20 days notice</strong> in writing in <strong>Form M</strong> to every person to submit himself for examination.
              In case of unfitness or appeal, re-examination is ordered under <strong>Form N</strong> before the Appellate Medical Board.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {medicalNotices.map((not) => (
              <div key={not.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-sky-300 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 bg-sky-100 text-sky-800 font-semibold rounded text-[11px]">
                      {not.noticeType}
                    </span>
                    <div className="font-mono text-xs font-bold text-slate-900 mt-1.5">{not.noticeNumber}</div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      not.status === 'OVERDUE'
                        ? 'bg-rose-100 text-rose-800'
                        : not.status === 'ISSUED'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {not.status}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Recipient Employee:</span>
                    <span className="font-semibold text-slate-900">{not.workerName} ({not.workerId})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Notice Issue Date:</span>
                    <span>{not.issueDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Scheduled Examination:</span>
                    <span className="font-semibold text-sky-700">{not.examScheduledDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Venue:</span>
                    <span className="text-right max-w-[200px] text-[11px] truncate">{not.venue}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">Issued by: {not.servedBy}</span>
                  <button
                    onClick={() => {
                      setSelectedNoticeForPrint(not);
                      setIsNoticeModalOpen(true);
                    }}
                    className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print Notice
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB TAB 3: STATUTORY RULE VERSIONS */}
      {activeSubTab === 'RULES' && (
        <div className="space-y-4">
          <div className="bg-sky-50 border border-sky-200 p-4 rounded-xl text-sky-950 text-xs">
            <div className="font-bold flex items-center gap-1.5 text-sky-950 mb-1">
              <ShieldCheck className="w-4 h-4 text-sky-700" />
              Effective-Dated DGMS Statutory Governance Framework
            </div>
            <p>
              This portal maintains version-controlled statutory rules with official gazette and circular references.
              Any amendments made by DGMS or Mine Management retain effective dates and audit logs to ensure regulatory non-repudiation.
            </p>
          </div>

          <div className="space-y-3">
            {statutoryRuleVersions.map((rule) => (
              <div key={rule.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
                        {rule.ruleCode}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-800 font-semibold rounded">
                        Version {rule.version} ({rule.status})
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 mt-1">{rule.ruleTitle}</h3>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <div>Effective Date: <span className="font-semibold text-slate-800">{rule.effectiveDate}</span></div>
                    <div className="text-[11px] text-slate-400">{rule.officialCircularNumber}</div>
                  </div>
                </div>

                <div className="mt-3 text-xs text-slate-700 space-y-2">
                  <p>{rule.summary}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-lg text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Governing Act:</span>
                      <span className="font-semibold text-slate-900">{rule.governingAct}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Periodicity Configuration:</span>
                      <span className="font-semibold text-slate-900">
                        ≤45 yrs: {rule.periodicityMonthsUnder45 / 12} yrs • &gt;45 yrs: {rule.periodicityMonthsOver45 / 12} yrs
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Prescribed Forms:</span>
                      <span className="font-semibold text-slate-900">{rule.prescribedForms.join(', ')}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* INSPECTION / DETAILS MODAL */}
      {isRecordModalOpen && selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
            <div className="bg-gradient-to-r from-slate-900 to-sky-950 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-sky-500/20 text-sky-300 rounded-lg border border-sky-400/30">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    Medical Fitness Record • {selectedRecord.certificateNumber}
                  </h3>
                  <p className="text-xs text-sky-200">
                    {selectedRecord.workerName} ({selectedRecord.workerId}) • {selectedRecord.examType}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
              {/* High Level Fitness Summary (Public to all authorized officers) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-800 flex items-center justify-between">
                  <span>General Medical Status</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${
                      selectedRecord.fitnessResult === 'FIT'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {selectedRecord.fitnessResult}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 text-[11px] border-t border-slate-200">
                  <div>
                    <span className="text-slate-500 block">Exam Date:</span>
                    <span className="font-semibold text-slate-900">{selectedRecord.completedDate || 'Pending'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Next Due Date:</span>
                    <span className="font-semibold text-sky-700">{selectedRecord.nextDueDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Examining Doctor:</span>
                    <span className="font-semibold text-slate-900">{selectedRecord.examiningDoctor}</span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-600 pt-1">
                  <strong>Indicator:</strong> {selectedRecord.publicFitnessIndicator}
                </div>
                {selectedRecord.restrictionNotes && (
                  <div className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                    <strong>Restriction:</strong> {selectedRecord.restrictionNotes}
                  </div>
                )}
              </div>

              {/* Sensitive Clinical Data (ROLE-BASED RESTRICTION) */}
              {isAuthorizedMedical ? (
                <div className="bg-sky-50/50 p-4 rounded-xl border border-sky-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-sky-950 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Confidential Clinical Diagnostics (Medical Personnel Clearance)
                    </div>
                    <span className="text-[10px] bg-sky-200 text-sky-800 px-2 py-0.5 rounded font-semibold">
                      DGMS Form O Detail
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div className="bg-white p-2.5 rounded border border-sky-100">
                      <span className="text-slate-500 block">Chest X-Ray (Pneumoconiosis):</span>
                      <span className="font-bold text-slate-900">{selectedRecord.chestXRayResult || 'NORMAL'}</span>
                      <span className="text-[10px] text-slate-400 block">Date: {selectedRecord.chestXRayDate || 'N/A'}</span>
                    </div>

                    <div className="bg-white p-2.5 rounded border border-sky-100">
                      <span className="text-slate-500 block">Pure Tone Audiometry:</span>
                      <span className="font-bold text-slate-900">{selectedRecord.audiometryResult || 'NORMAL_HEARING'}</span>
                    </div>

                    <div className="bg-white p-2.5 rounded border border-sky-100">
                      <span className="text-slate-500 block">Lung Spirometry (FVC):</span>
                      <span className="font-bold text-slate-900">{selectedRecord.lungSpirometryFvc || '3.8 L (96%)'}</span>
                    </div>

                    <div className="bg-white p-2.5 rounded border border-sky-100">
                      <span className="text-slate-500 block">Blood Pressure:</span>
                      <span className="font-bold text-slate-900">{selectedRecord.bloodPressure || '120/80 mmHg'}</span>
                    </div>

                    <div className="bg-white p-2.5 rounded border border-sky-100">
                      <span className="text-slate-500 block">Fasting Blood Glucose:</span>
                      <span className="font-bold text-slate-900">{selectedRecord.bloodSugarFasting || '92 mg/dL'}</span>
                    </div>

                    <div className="bg-white p-2.5 rounded border border-sky-100">
                      <span className="text-slate-500 block">Visual Acuity & Stereopsis:</span>
                      <span className="font-bold text-slate-900">{selectedRecord.visualAcuity || '6/6 unaided'}</span>
                    </div>
                  </div>

                  {selectedRecord.clinicalObservations && (
                    <div className="bg-white p-3 rounded border border-sky-100">
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                        Doctor's Clinical Notes:
                      </span>
                      <p className="text-slate-800 mt-1">{selectedRecord.clinicalObservations}</p>
                    </div>
                  )}

                  {selectedRecord.sensitiveDiagnosisNotes && (
                    <div className="bg-white p-3 rounded border border-amber-200">
                      <span className="text-amber-700 block text-[10px] uppercase font-semibold">
                        Confidential Diagnostic Observation:
                      </span>
                      <p className="text-slate-800 mt-1">{selectedRecord.sensitiveDiagnosisNotes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-100 p-5 rounded-xl border border-slate-300 text-center space-y-2">
                  <div className="mx-auto w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                    <Lock className="w-5 h-5 text-slate-700" />
                  </div>
                  <h4 className="font-bold text-slate-800">Sensitive Clinical Diagnostics Masked</h4>
                  <p className="text-slate-500 max-w-md mx-auto text-[11px]">
                    Detailed clinical observations, chest X-ray pneumoconiosis classifications, and audiometry records are restricted to
                    <strong> Authorized Medical Personnel</strong> in compliance with occupational health privacy standards.
                  </p>
                  <div className="pt-1 text-[11px] text-sky-700 font-semibold">
                    Public Fitness: {selectedRecord.fitnessResult} • Valid Until {selectedRecord.validTill}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => handleIssueNotice(selectedRecord, 'FORM_M_PERIODICAL')}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded text-xs transition-colors"
              >
                Issue Form M Notice
              </button>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="px-4 py-1.5 bg-sky-700 hover:bg-sky-600 text-white font-semibold rounded text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW EXAMINATION MODAL */}
      {isNewExamModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
            <div className="bg-gradient-to-r from-sky-900 to-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sky-500/20 text-sky-300 rounded-lg border border-sky-400/30">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Record Medical Examination (Rule 29B)</h3>
                  <p className="text-xs text-sky-200">Issue Form O Medical Certificate of Fitness</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewExamModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMedicalRecord} className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Select Employee / Workman:</label>
                <select
                  value={newWorkerId}
                  onChange={(e) => setNewWorkerId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-xs text-slate-900 font-medium"
                  required
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.id}) • {emp.department} • {emp.designation}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Exam Type:</label>
                  <select
                    value={newExamType}
                    onChange={(e) => setNewExamType(e.target.value as MedicalExamType)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-xs text-slate-900"
                  >
                    <option value="PME">PME (Periodical Examination)</option>
                    <option value="IME">IME (Initial Onboarding)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Fitness Result:</label>
                  <select
                    value={newFitnessResult}
                    onChange={(e) => setNewFitnessResult(e.target.value as MedicalFitnessResult)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-xs text-slate-900 font-bold"
                  >
                    <option value="FIT">FIT (Fit for Mining Duties)</option>
                    <option value="TEMPORARILY_UNFIT">TEMPORARILY UNFIT</option>
                    <option value="UNFIT">UNFIT (Unfit for Mines)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Examination Completed Date:</label>
                  <input
                    type="date"
                    value={newCompletedDate}
                    onChange={(e) => setNewCompletedDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-xs text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Examining Medical Officer:</label>
                  <input
                    type="text"
                    value={newDoctorName}
                    onChange={(e) => setNewDoctorName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-xs text-slate-900"
                    required
                  />
                </div>
              </div>

              {/* Clinical Diagnostics Section */}
              <div className="bg-sky-50/50 p-3.5 rounded-xl border border-sky-200 space-y-3">
                <div className="font-bold text-sky-950 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Clinical Diagnostic Parameters (Protected)
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 text-[11px] mb-0.5">Chest X-Ray Result:</label>
                    <select
                      value={newChestXRay}
                      onChange={(e) => setNewChestXRay(e.target.value as any)}
                      className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs text-slate-800"
                    >
                      <option value="NORMAL">NORMAL / CLEAR</option>
                      <option value="SUSPICIOUS">SUSPICIOUS</option>
                      <option value="PNEUMOCONIOSIS_CATEGORY_1">PNEUMOCONIOSIS CAT 1</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 text-[11px] mb-0.5">Audiometry:</label>
                    <select
                      value={newAudiometry}
                      onChange={(e) => setNewAudiometry(e.target.value as any)}
                      className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs text-slate-800"
                    >
                      <option value="NORMAL_HEARING">NORMAL HEARING</option>
                      <option value="MILD_HIGH_FREQ_LOSS">MILD HIGH FREQ LOSS</option>
                      <option value="NOISE_INDUCED_HEARING_LOSS">NOISE INDUCED LOSS</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-600 text-[11px] mb-0.5">Blood Pressure:</label>
                    <input
                      type="text"
                      value={newBP}
                      onChange={(e) => setNewBP(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-[11px] mb-0.5">Fasting Sugar:</label>
                    <input
                      type="text"
                      value={newSugar}
                      onChange={(e) => setNewSugar(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-[11px] mb-0.5">Spirometry FVC:</label>
                    <input
                      type="text"
                      value={newSpirometry}
                      onChange={(e) => setNewSpirometry(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 text-[11px] mb-0.5">Doctor's Clinical Notes:</label>
                  <textarea
                    rows={2}
                    value={newClinicalNotes}
                    onChange={(e) => setNewClinicalNotes(e.target.value)}
                    placeholder="Enter clinical examination notes, heart/lung auscultation, or observations..."
                    className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Restriction Notes (If Any):</label>
                <input
                  type="text"
                  placeholder="e.g. Must wear corrective spectacles during dumper cabin driving"
                  value={newRestrictionNotes}
                  onChange={(e) => setNewRestrictionNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-xs text-slate-900"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewExamModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg text-xs shadow-xs transition-colors"
                >
                  Record & Issue Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STATUTORY NOTICE PRINT PREVIEW MODAL */}
      {isNoticeModalOpen && selectedNoticeForPrint && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-sm text-white">
                  Official Statutory Notice Preview • {selectedNoticeForPrint.noticeType}
                </h3>
              </div>
              <button
                onClick={() => setIsNoticeModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Official Indian DGMS Standard Notice Paper Mock */}
            <div className="p-8 bg-amber-50/30 border border-slate-300 m-5 rounded-lg shadow-inner text-slate-900 font-serif space-y-4">
              <div className="text-center border-b border-slate-400 pb-3">
                <div className="text-[11px] font-sans font-bold text-slate-500 tracking-wider">
                  GOVERNMENT OF INDIA • MINISTRY OF LABOUR & EMPLOYMENT
                </div>
                <div className="text-[10px] font-sans text-slate-500">
                  DIRECTORATE GENERAL OF MINES SAFETY (DGMS)
                </div>
                <div className="text-base font-bold text-slate-950 mt-1 uppercase font-serif">
                  {selectedNoticeForPrint.noticeType === 'FORM_M_PERIODICAL'
                    ? 'FORM M [See Rule 29B(1)]'
                    : 'FORM N [See Rule 29B(3)]'}
                </div>
                <div className="text-xs font-semibold text-slate-800">
                  {selectedNoticeForPrint.noticeType === 'FORM_M_PERIODICAL'
                    ? 'Notice of Periodical Medical Examination'
                    : 'Notice for Re-examination / Medical Appeal'}
                </div>
                <div className="text-[11px] font-sans text-slate-600 mt-1">
                  NMDC Limited • Donimalai Iron Ore Mine • Mine Reg Code: 29/03/DNM
                </div>
              </div>

              <div className="text-xs space-y-2 pt-2 leading-relaxed">
                <p>
                  <strong>Notice No:</strong> {selectedNoticeForPrint.noticeNumber}
                  <span className="float-right"><strong>Date of Issue:</strong> {selectedNoticeForPrint.issueDate}</span>
                </p>

                <p className="pt-2">
                  To,<br />
                  <strong>Sri {selectedNoticeForPrint.workerName}</strong> (Worker ID: {selectedNoticeForPrint.workerId})<br />
                  Donimalai Iron Ore Complex, Bellary District, Karnataka.
                </p>

                <p className="pt-2 indent-6 text-justify">
                  Take notice that in accordance with the provisions of <strong>Rule 29B of the Mines Rules, 1955</strong>,
                  you are hereby required to submit yourself for Periodical Medical Examination on the date, time and venue stated below:
                </p>

                <div className="bg-white p-3 rounded border border-slate-300 font-sans text-xs space-y-1 my-3">
                  <div><strong>Date of Examination:</strong> <span className="text-sky-800 font-bold">{selectedNoticeForPrint.examScheduledDate} (at 08:30 AM)</span></div>
                  <div><strong>Venue:</strong> {selectedNoticeForPrint.venue}</div>
                  <div><strong>Examining Authority:</strong> Chief Medical Officer, NMDC Project Hospital Donimalai</div>
                </div>

                <p className="text-[11px] text-slate-600 italic">
                  Note: Please bring your valid Safety Passport / Mine Gate Pass and report on an empty stomach for fasting blood & chest radiography.
                </p>
              </div>

              <div className="pt-8 flex justify-between items-end border-t border-slate-300 font-sans text-xs">
                <div>
                  <div className="text-[10px] text-slate-500">Official Mine Seal</div>
                  <div className="w-20 h-14 border border-dashed border-slate-400 rounded flex items-center justify-center text-[10px] text-slate-400">
                    NMDC SEAL
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900">{selectedNoticeForPrint.servedBy}</div>
                  <div className="text-[11px] text-slate-600">Authorized Medical / Safety Liaison Officer</div>
                  <div className="text-[10px] text-slate-500">For and on behalf of Manager, Donimalai Mine</div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-sky-700 hover:bg-sky-600 text-white font-semibold rounded text-xs flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / Save PDF
              </button>
              <button
                onClick={() => setIsNoticeModalOpen(false)}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded text-xs transition-colors"
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
