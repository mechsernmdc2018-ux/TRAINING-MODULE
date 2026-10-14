import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { useApp } from '../context/AppContext';
import {
  Users,
  UserPlus,
  FileSpreadsheet,
  Download,
  Search,
  HardHat,
  Building,
  Upload,
  Eye,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  RefreshCw,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import { Employee, WorkerClassification, ExcelImportRow } from '../types';
import { getPersonnelAvatar } from '../utils/avatarUtils';

export const EmployeeManagement: React.FC = () => {
  const {
    employees,
    contractors,
    addEmployee,
    addContractWorker,
    bulkImportEmployees,
    exportToCSV,
    filterAlertScope,
    setViewPassportWorkerId,
    getWorkerDeploymentClearance,
    setIsRegisterEmployeeOpen,
    setRegistrationInitialType,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'ALL' | 'REGULAR' | 'CONTRACT_WORKERS' | 'CONTRACTORS_MASTER'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [classFilter, setClassFilter] = useState('ALL');
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Modals
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [showAddContractWorkerModal, setShowAddContractWorkerModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [selectedWorkerDetail, setSelectedWorkerDetail] = useState<Employee | null>(null);

  // Master Excel Import State
  const [previewRows, setPreviewRows] = useState<ExcelImportRow[]>([]);
  const [isUpdateMode, setIsUpdateMode] = useState(true);
  const [importSummary, setImportSummary] = useState<{
    inserted: number;
    updated: number;
    skipped: number;
    rejected: number;
    errors: { row: number; error: string }[];
  } | null>(null);
  const [isImportCommitted, setIsImportCommitted] = useState(false);
  const [importFileName, setImportFileName] = useState('');

  // Add Regular Employee Form State
  const [empName, setEmpName] = useState('');
  const [empDob, setEmpDob] = useState('1990-01-01');
  const [empMobile, setEmpMobile] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empDept, setEmpDept] = useState('Mining');
  const [empSection] = useState('Pit-1 HEMM Operations');
  const [empDesig, setEmpDesig] = useState('Heavy Machinery Operator');
  const [empTrade, setEmpTrade] = useState('HEMM Driving');
  const [empGrade] = useState('W-05');
  const [empShift, setEmpShift] = useState<Employee['shift']>('Shift A (06:00-14:00)');
  const [empSupervisor] = useState('Mining Foreman / Incharge');
  const [empLocation] = useState('Donimalai Mine Pit-1 Quarry Face');
  const [empClass, setEmpClass] = useState<WorkerClassification>('HEMM Operator');
  const [empMedicalValid, setEmpMedicalValid] = useState('2027-04-01');

  // Add Contract Worker Form State
  const [cwName, setCwName] = useState('');
  const [cwDob, setCwDob] = useState('1995-05-15');
  const [cwMobile, setCwMobile] = useState('');
  const [cwContractorName, setCwContractorName] = useState('');
  const [cwWorkOrder, setCwWorkOrder] = useState('');
  const [cwDept, setCwDept] = useState('Mining');
  const [cwDesig, setCwDesig] = useState('Contract Tipper Driver');
  const [cwTrade, setCwTrade] = useState('Heavy Commercial Driving');
  const [cwClass, setCwClass] = useState<WorkerClassification>('Operator');
  const [cwShift, setCwShift] = useState<Employee['shift']>('Shift A (06:00-14:00)');
  const [cwMedicalValid, setCwMedicalValid] = useState('2027-05-01');

  // Filtered workforce
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // Tab filter
      if (activeTab === 'REGULAR' && emp.employeeType !== 'NMDC_REGULAR') return false;
      if (activeTab === 'CONTRACT_WORKERS' && emp.employeeType !== 'CONTRACT_WORKER') return false;

      // Alert scope filter
      if (filterAlertScope === 'INDUCTION_PENDING' && emp.verificationStatus !== 'Pending Verification') {
        return false;
      }

      // Department filter
      if (deptFilter !== 'ALL' && emp.department !== deptFilter) return false;

      // Classification filter
      if (classFilter !== 'ALL' && emp.classification !== classFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mName = emp.name.toLowerCase().includes(q);
        const mId = emp.id.toLowerCase().includes(q);
        const mTrade = emp.trade.toLowerCase().includes(q);
        const mDesig = emp.designation.toLowerCase().includes(q);
        if (!mName && !mId && !mTrade && !mDesig) return false;
      }

      return true;
    });
  }, [employees, activeTab, deptFilter, classFilter, searchQuery, filterAlertScope]);

  const handleAddRegularEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const newEmp = addEmployee({
      name: empName,
      photoUrl: getPersonnelAvatar(empName, 'REGULAR'),
      dateOfBirth: empDob,
      mobile: empMobile,
      email: empEmail || `${empName.toLowerCase().replace(/\s+/g, '.')}@nmdc.co.in`,
      department: empDept,
      section: empSection,
      designation: empDesig,
      trade: empTrade,
      grade: empGrade,
      employeeType: 'NMDC_REGULAR',
      dateOfJoining: '2026-10-06',
      dateOfDeployment: '2026-10-07',
      shift: empShift,
      supervisor: empSupervisor,
      workLocation: empLocation,
      mine: 'Donimalai Iron Ore Mine',
      employmentStatus: 'ACTIVE',
      classification: empClass,
      verificationStatus: 'Verified',
      medicalFitnessDate: '2026-04-01',
      medicalFitnessValidTill: empMedicalValid,
      assignedEquipment: empClass === 'HEMM Operator' ? ['BEML BH-100S'] : undefined,
    });

    setShowAddEmpModal(false);
    setFeedbackToast({
      message: `Regular Employee registered successfully (ID: ${newEmp.id}). Statutory MVT tracking initialized!`,
      type: 'success',
    });
  };

  const handleAddContractWorkerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newWorker = addContractWorker({
      name: cwName,
      photoUrl: getPersonnelAvatar(cwName, 'CONTRACT'),
      dateOfBirth: cwDob,
      mobile: cwMobile,
      email: `${cwName.toLowerCase().replace(/\s+/g, '')}@contractor.in`,
      department: cwDept,
      section: 'Contractual Mining Work Order',
      designation: cwDesig,
      trade: cwTrade,
      grade: 'Contract-Skilled',
      dateOfJoining: '2026-10-06',
      dateOfDeployment: '2026-10-08',
      shift: cwShift,
      supervisor: 'Contractor Safety Supervisor',
      workLocation: 'Donimalai Pit Operations',
      mine: 'Donimalai Iron Ore Mine',
      employmentStatus: 'ACTIVE',
      classification: cwClass,
      contractorCode: cwWorkOrder.trim() || `CONT-${(cwContractorName.trim() || 'GEN').replace(/[^A-Za-z0-9]/g, '').substring(0, 6).toUpperCase()}`,
      contractorName: cwContractorName.trim() || 'Contractor Agency',
      workOrderNumber: cwWorkOrder.trim() || 'WO/NMDC/2026',
      verificationStatus: 'Pending Verification',
      medicalFitnessDate: '2026-05-01',
      medicalFitnessValidTill: cwMedicalValid,
    });

    setShowAddContractWorkerModal(false);
    setFeedbackToast({
      message: `Contract Worker registered (ID: ${newWorker.id}). Placed under 'Pending Verification' awaiting Safety Induction.`,
      type: 'info',
    });
  };

  const handleExportWorkforce = () => {
    const headers = ['Worker ID', 'Name', 'Type', 'Department', 'Designation', 'Trade', 'Shift', 'Classification', 'Contractor', 'Status'];
    const rows = filteredEmployees.map((e) => [
      e.id,
      e.name,
      e.employeeType === 'NMDC_REGULAR' ? 'Regular' : 'Contract Worker',
      e.department,
      e.designation,
      e.trade,
      e.shift,
      e.classification,
      e.contractorName || 'NMDC Limited',
      e.employmentStatus,
    ]);
    exportToCSV('NMDC_Donimalai_Workforce_Register', headers, rows);
  };

  // Requirement 4: Excel (.xlsx) Template Generator
  const handleDownloadExcelTemplate = () => {
    const wb = XLSX.utils.book_new();
    const templateData = [
      [
        'EmployeeID',
        'Name',
        'EmployeeType',
        'DateOfBirth',
        'Mobile',
        'Email',
        'Department',
        'Section',
        'Designation',
        'Trade',
        'Grade',
        'Shift',
        'WorkLocation',
        'MedicalFitnessValidTill',
        'ContractorName',
        'WorkOrderNumber',
      ],
      [
        'NMDC-EMP-001',
        'Rajesh Kumar Verma',
        'NMDC_REGULAR',
        '1976-08-14',
        '+91 94481 12301',
        'r.verma@nmdc.co.in',
        'Mining',
        'Pit-1 Quarry',
        'Deputy General Manager (Mining)',
        'Mining Engineering',
        'E-06',
        'General (09:00-17:30)',
        'Donimalai Mine Pit-1 Quarry',
        '2026-04-10',
        '',
        '',
      ],
      [
        'CONT-WRK-001',
        'Manjunath Kuruba',
        'CONTRACT_WORKER',
        '1993-06-18',
        '+91 98451 67856',
        'm.kuruba@deccanearthmovers.in',
        'Mining',
        'Overburden Handling South Block',
        'Contract Tipper Driver',
        'Commercial Heavy Driving',
        'Contract-Skilled',
        'Shift A (06:00-14:00)',
        'Donimalai Pit Operations',
        '2027-04-05',
        'M/s Deccan Earthmovers & Mining Infra Pvt Ltd',
        'WO/NMDC/DNM/MIN/2024/118',
      ],
      [
        '',
        '[Instructions]: Use EmployeeID for matching updates. Leave EmployeeID blank for automatic new ID assignment. EmployeeType must be NMDC_REGULAR or CONTRACT_WORKER.',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    XLSX.utils.book_append_sheet(wb, ws, 'Workforce_Template');
    XLSX.writeFile(wb, 'NMDC_Donimalai_Employee_Master_Template.xlsx');
  };

  // Requirement 4: File Validation, Upload-Size Limits, and Multi-Format (.xlsx, .xls, .csv) Parsing
  const handleProcessExcelFile = (file: File) => {
    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      setFeedbackToast({
        message: 'File size exceeds 10MB limit. Please upload a smaller file.',
        type: 'error',
      });
      return;
    }

    setImportFileName(file.name);
    setIsImportCommitted(false);
    setImportSummary(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (rawJson.length === 0) {
          setFeedbackToast({
            message: 'Uploaded spreadsheet is empty. Please use the NMDC template.',
            type: 'error',
          });
          return;
        }

        const parsedRows: ExcelImportRow[] = [];

        rawJson.forEach((row, index) => {
          const rowNum = index + 2;

          // Normalize keys (trim and case-insensitive check)
          const getVal = (keyNames: string[]): string => {
            for (const k of Object.keys(row)) {
              if (keyNames.some((kn) => kn.toLowerCase() === k.trim().toLowerCase())) {
                return String(row[k]).trim();
              }
            }
            return '';
          };

          const rawEmpId = getVal(['EmployeeID', 'WorkerID', 'ID', 'EmpID']);
          const rawName = getVal(['Name', 'WorkerName', 'FullName', 'EmployeeName']);
          const rawType = getVal(['EmployeeType', 'Type', 'WorkerType']);
          const rawDob = getVal(['DateOfBirth', 'DOB', 'BirthDate']);
          const rawMobile = getVal(['Mobile', 'Phone', 'ContactNumber']);
          const rawEmail = getVal(['Email', 'EmailAddress']);
          const rawDept = getVal(['Department', 'Dept']);
          const rawSection = getVal(['Section', 'MineSection']);
          const rawDesig = getVal(['Designation', 'Desig']);
          const rawTrade = getVal(['Trade']);
          const rawGrade = getVal(['Grade']);
          const rawShift = getVal(['Shift']);
          const rawLoc = getVal(['WorkLocation', 'Location']);
          const rawMedValid = getVal(['MedicalFitnessValidTill', 'MedicalValidTill', 'MedicalDate']);
          const rawContName = getVal(['ContractorName', 'Contractor']);
          const rawWorkOrder = getVal(['WorkOrderNumber', 'WorkOrder']);

          // Skip instructions row if present
          if (rawName.startsWith('[Instructions]')) return;

          const rowErrors: string[] = [];

          if (!rawName) {
            rowErrors.push('Worker Name is required');
          }
          if (!rawDept) {
            rowErrors.push('Department is required');
          }

          const isContract =
            rawType.toUpperCase().includes('CONTRACT') ||
            (rawContName && rawContName.length > 0) ||
            rawEmpId.startsWith('CONT-');

          const empType = isContract ? 'CONTRACT_WORKER' : 'NMDC_REGULAR';

          // Match by Employee ID
          const existingEmployee = rawEmpId ? employees.find((e) => e.id.toLowerCase() === rawEmpId.toLowerCase()) : undefined;

          let status: ExcelImportRow['status'] = 'INSERT';
          let action = 'New Record Insert';

          if (rowErrors.length > 0) {
            status = 'INVALID';
            action = 'Validation Error';
          } else if (existingEmployee) {
            status = 'UPDATE';
            action = 'Update Existing (Preserves Linked Records)';
          } else {
            status = 'INSERT';
            action = 'New Employee Insert';
          }

          parsedRows.push({
            rowNumber: rowNum,
            status,
            action,
            employeeId: rawEmpId,
            name: rawName,
            employeeType: empType,
            workerCategory: empType === 'NMDC_REGULAR' ? 'REGULAR_WORKMAN' : 'CONTRACTOR_WORKMAN',
            department: rawDept || 'Mining',
            section: rawSection || 'Donimalai Mine Operations',
            designation: rawDesig || 'Operative',
            trade: rawTrade || 'General Mining',
            grade: rawGrade || (empType === 'NMDC_REGULAR' ? 'W-04' : 'Contract-Skilled'),
            dateOfBirth: rawDob || '1990-01-01',
            mobile: rawMobile || '+91 94480 00000',
            email: rawEmail || `${rawName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@nmdc.co.in`,
            shift: (rawShift as any) || 'Shift A (06:00-14:00)',
            workLocation: rawLoc || 'Donimalai Complex',
            contractorName: rawContName || (isContract ? 'Contractor Agency' : undefined),
            workOrderNumber: rawWorkOrder || (isContract ? 'WO/NMDC/2026' : undefined),
            medicalFitnessValidTill: rawMedValid || '2027-04-01',
            errors: rowErrors,
            existingRecord: existingEmployee,
          });
        });

        setPreviewRows(parsedRows);
      } catch (err: any) {
        setFeedbackToast({
          message: `Failed to parse Excel file: ${err.message || 'Corrupted file'}`,
          type: 'error',
        });
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Commit Import
  const handleCommitImport = async () => {
    if (previewRows.length === 0) return;

    try {
      const result = await bulkImportEmployees(previewRows, isUpdateMode);
      setImportSummary({
        inserted: result.inserted,
        updated: result.updated,
        skipped: result.skipped,
        rejected: result.rejected,
        errors: result.errors,
      });
      setIsImportCommitted(true);
      setFeedbackToast({
        message: `Import committed successfully: ${result.inserted} inserted, ${result.updated} updated, ${result.skipped} skipped, ${result.rejected} rejected. Linked records preserved.`,
        type: 'success',
      });
    } catch (err: any) {
      setFeedbackToast({
        message: `Database import error: ${err.message || 'Transaction failed'}`,
        type: 'error',
      });
    }
  };

  // Download Row-Level Error Report
  const handleDownloadErrorReport = () => {
    const errorRows = previewRows.filter((r) => r.status === 'INVALID' || r.errors.length > 0);
    if (errorRows.length === 0) return;

    const wb = XLSX.utils.book_new();
    const data = [
      ['RowNumber', 'EmployeeID', 'Name', 'Department', 'Errors'],
      ...errorRows.map((r) => [r.rowNumber, r.employeeId || 'N/A', r.name || 'N/A', r.department || 'N/A', r.errors.join('; ')]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Error_Exceptions');
    XLSX.writeFile(wb, `NMDC_Import_Error_Report_${Date.now()}.xlsx`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700">
                <Users className="w-5 h-5" />
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase">
                DONIMALAI COMPLEX WORKFORCE MASTER REGISTER
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Regular NMDC employees and registered contractor personnel • Scalable enterprise personnel directory
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            <button
              onClick={() => {
                setRegistrationInitialType('NMDC_REGULAR');
                setIsRegisterEmployeeOpen(true);
              }}
              className="px-3.5 py-2 text-xs font-bold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>REGISTER EMPLOYEE</span>
            </button>
            <button
              onClick={() => {
                setRegistrationInitialType('CONTRACT_WORKER');
                setIsRegisterEmployeeOpen(true);
              }}
              className="px-3.5 py-2 text-xs font-bold bg-slate-50 text-amber-800 border border-amber-300 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <HardHat className="w-4 h-4 text-amber-700" />
              <span>REGISTER CONTRACT WORKER</span>
            </button>
            <button
              onClick={() => setShowBulkImportModal(true)}
              className="px-3.5 py-2 text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Bulk Excel Sheet Upload - Statutory Alternative to Individual Employee Registration"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>EXCEL REGISTRATION (BULK)</span>
            </button>
            <button
              onClick={handleExportWorkforce}
              className="p-2 text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 cursor-pointer"
              title="Export Register to CSV"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Statutory Registration Alternative Notice */}
        <div className="mt-3 p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-lg flex items-center justify-between text-xs text-emerald-900 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[10px] bg-emerald-200 text-emerald-950 px-2 py-0.5 rounded uppercase tracking-wider">
              Registration Alternative
            </span>
            <span className="text-slate-700">
              Workforce Excel sheet upload serves as an official statutory alternative to registering employees individually. All uploaded personnel receive Form B entries, MVT tracking, and portal credentials.
            </span>
          </div>
          <button
            onClick={() => setShowBulkImportModal(true)}
            className="text-emerald-800 font-bold hover:underline shrink-0 text-xs cursor-pointer flex items-center gap-1"
          >
            <span>Open Excel Uploader</span>
            <span>&rarr;</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeTab === 'ALL' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            All Workforce ({employees.length})
          </button>
          <button
            onClick={() => setActiveTab('REGULAR')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeTab === 'REGULAR' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            NMDC Regular ({employees.filter((e) => e.employeeType === 'NMDC_REGULAR').length})
          </button>
          <button
            onClick={() => setActiveTab('CONTRACT_WORKERS')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeTab === 'CONTRACT_WORKERS' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            Contractor Workers ({employees.filter((e) => e.employeeType === 'CONTRACT_WORKER').length})
          </button>
          <button
            onClick={() => setActiveTab('CONTRACTORS_MASTER')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeTab === 'CONTRACTORS_MASTER' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            Contractors Master ({contractors.length})
          </button>
        </div>
      </div>

      {activeTab === 'CONTRACTORS_MASTER' ? (
        /* Contractors Master Register Table */
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Building className="w-4 h-4 text-amber-600" />
              Approved Contractor Agencies & Work Order Monitoring
            </h3>
            <span className="text-xs text-slate-500">{contractors.length} Agencies</span>
          </div>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                  <th className="py-2.5 px-3">Contractor Agency</th>
                  <th className="py-2.5 px-3">Work Order & Validity</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Contract Manager</th>
                  <th className="py-2.5 px-3">Safety Officer</th>
                  <th className="py-2.5 px-3 text-center">Approved vs Deployed</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contractors.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{c.name}</div>
                      <div className="text-[11px] font-mono text-amber-800">{c.code}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      <div className="text-slate-800">{c.workOrderNumber}</div>
                      <div className="text-[10px] text-slate-500">{c.workOrderStartDate} to {c.workOrderEndDate}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">{c.department}</td>
                    <td className="py-2.5 px-3 text-slate-700">{c.contractManager}</td>
                    <td className="py-2.5 px-3 text-slate-700">{c.safetyOfficer}</td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      <span className="text-emerald-700 font-bold">{c.currentManpower}</span> / {c.approvedManpower}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {c.contractStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Workforce Table */
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
          {/* Filters */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search name, ID, trade, designation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 text-xs text-slate-900 pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="bg-slate-50 text-xs text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200"
              >
                <option value="ALL">All Departments</option>
                <option value="Mining">Mining</option>
                <option value="Mechanical Services">Mechanical Services</option>
                <option value="Electrical Services">Electrical Services</option>
                <option value="Production">Production</option>
                <option value="Safety">Safety</option>
                <option value="Beneficiation">Beneficiation</option>
              </select>

              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="bg-slate-50 text-xs text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200"
              >
                <option value="ALL">All Classifications</option>
                <option value="HEMM Operator">HEMM Operator</option>
                <option value="Blaster/Shotfirer">Blaster/Shotfirer</option>
                <option value="Electrical Personnel">Electrical Personnel</option>
                <option value="Maintenance Personnel">Maintenance Personnel</option>
                <option value="Operator">Operator</option>
                <option value="Skilled Worker">Skilled Worker</option>
                <option value="General Worker">General Worker</option>
                <option value="Statutory Person">Statutory Person</option>
              </select>
            </div>

            <span className="text-xs font-mono text-slate-500">
              Showing {filteredEmployees.length} of {employees.length} workers
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                  <th className="py-2.5 px-3">Worker ID & Photo</th>
                  <th className="py-2.5 px-3">Full Name & Mobile</th>
                  <th className="py-2.5 px-3">Department & Shift</th>
                  <th className="py-2.5 px-3">Designation & Trade</th>
                  <th className="py-2.5 px-3">Classification</th>
                  <th className="py-2.5 px-3">Medical Valid Till</th>
                  <th className="py-2.5 px-3 text-center">Clearance Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((emp) => {
                  const clearance = getWorkerDeploymentClearance(emp.id);

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={emp.photoUrl}
                            alt={emp.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-300"
                          />
                          <div>
                            <span className="font-mono font-bold text-amber-800">{emp.id}</span>
                            <span className="block text-[10px] text-slate-500">
                              {emp.employeeType === 'NMDC_REGULAR' ? 'Regular' : 'Contractor'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div
                          className="font-bold text-slate-900 hover:text-amber-700 cursor-pointer"
                          onClick={() => setViewPassportWorkerId(emp.id)}
                        >
                          {emp.name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">{emp.mobile}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="text-slate-800">{emp.department}</div>
                        <div className="text-[10px] text-slate-500">{emp.shift}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="text-slate-800 font-medium">{emp.designation}</div>
                        <div className="text-[11px] text-slate-500">{emp.trade}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {emp.classification}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono">
                        <span
                          className={
                            emp.medicalFitnessValidTill < '2026-10-06'
                              ? 'text-rose-700 font-bold'
                              : 'text-slate-700'
                          }
                        >
                          {emp.medicalFitnessValidTill}
                        </span>
                        {emp.medicalFitnessValidTill < '2026-10-06' && (
                          <span className="block text-[10px] text-rose-700 font-bold uppercase">Expired</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
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
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewPassportWorkerId(emp.id)}
                            className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-amber-700 cursor-pointer"
                            title="Open Digital Safety Passport"
                          >
                            <HardHat className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setSelectedWorkerDetail(emp)}
                            className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-900 cursor-pointer"
                            title="Inspect Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500 bg-slate-50/50">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Users className="w-8 h-8 text-slate-300" />
                        <span className="font-bold text-slate-700 text-sm">No Workforce Records Found</span>
                        <p className="text-xs text-slate-400 max-w-md">
                          The personnel database is clean. Use the '+ REGISTER EMPLOYEE' or '+ REGISTER CONTRACT WORKER' buttons above, or use the 'EXCEL IMPORT' tool to upload your real workforce file.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Regular Employee Modal */}
      {showAddEmpModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                Register Regular NMDC Employee
              </h3>
              <button onClick={() => setShowAddEmpModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddRegularEmployee} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    value={empName}
                    onChange={(e) => setEmpName(e.target.value)}
                    className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1 focus:bg-white focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Date of Birth</label>
                  <input
                    type="date"
                    value={empDob}
                    onChange={(e) => setEmpDob(e.target.value)}
                    className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1 focus:bg-white focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Mobile Number</label>
                  <input
                    type="text"
                    value={empMobile}
                    onChange={(e) => setEmpMobile(e.target.value)}
                    className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Department</label>
                  <select
                    value={empDept}
                    onChange={(e) => setEmpDept(e.target.value)}
                    className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1"
                  >
                    <option value="Mining">Mining</option>
                    <option value="Mechanical Services">Mechanical Services</option>
                    <option value="Electrical Services">Electrical Services</option>
                    <option value="Production">Production</option>
                    <option value="Safety">Safety</option>
                    <option value="Beneficiation">Beneficiation</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Designation</label>
                  <input
                    type="text"
                    value={empDesig}
                    onChange={(e) => setEmpDesig(e.target.value)}
                    className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Trade</label>
                  <input
                    type="text"
                    value={empTrade}
                    onChange={(e) => setEmpTrade(e.target.value)}
                    className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Classification</label>
                  <select
                    value={empClass}
                    onChange={(e) => setEmpClass(e.target.value as any)}
                    className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1"
                  >
                    <option value="HEMM Operator">HEMM Operator</option>
                    <option value="Blaster/Shotfirer">Blaster/Shotfirer</option>
                    <option value="Electrical Personnel">Electrical Personnel</option>
                    <option value="Maintenance Personnel">Maintenance Personnel</option>
                    <option value="Operator">Operator</option>
                    <option value="Skilled Worker">Skilled Worker</option>
                    <option value="General Worker">General Worker</option>
                    <option value="Statutory Person">Statutory Person</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Shift</label>
                  <select
                    value={empShift}
                    onChange={(e) => setEmpShift(e.target.value as any)}
                    className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1"
                  >
                    <option value="Shift A (06:00-14:00)">Shift A (06:00-14:00)</option>
                    <option value="Shift B (14:00-22:00)">Shift B (14:00-22:00)</option>
                    <option value="Shift C (22:00-06:00)">Shift C (22:00-06:00)</option>
                    <option value="General (09:00-17:30)">General (09:00-17:30)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Medical Fitness Valid Till</label>
                  <input
                    type="date"
                    value={empMedicalValid}
                    onChange={(e) => setEmpMedicalValid(e.target.value)}
                    className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddEmpModal(false)}
                  className="px-4 py-2 text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 transition-colors shadow-xs"
                >
                  SAVE EMPLOYEE & INITIALISE MVT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Contract Worker Modal */}
      {showAddContractWorkerModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                Register Contractor Worker
              </h3>
              <button onClick={() => setShowAddContractWorkerModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddContractWorkerSubmit} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Worker Full Name</label>
                  <input
                    type="text"
                    value={cwName}
                    onChange={(e) => setCwName(e.target.value)}
                    className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Contracting Company</label>
                  <input
                    type="text"
                    value={cwContractorName}
                    onChange={(e) => setCwContractorName(e.target.value)}
                    placeholder="Enter custom contracting company name"
                    className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Mobile Number</label>
                  <input
                    type="text"
                    value={cwMobile}
                    onChange={(e) => setCwMobile(e.target.value)}
                    className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Classification</label>
                  <select
                    value={cwClass}
                    onChange={(e) => setCwClass(e.target.value as any)}
                    className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1"
                  >
                    <option value="Operator">Operator</option>
                    <option value="HEMM Operator">HEMM Operator</option>
                    <option value="Skilled Worker">Skilled Worker</option>
                    <option value="General Worker">General Worker</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Designation / Trade</label>
                  <input
                    type="text"
                    value={cwDesig}
                    onChange={(e) => setCwDesig(e.target.value)}
                    className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Medical Fitness Valid Till</label>
                  <input
                    type="date"
                    value={cwMedicalValid}
                    onChange={(e) => setCwMedicalValid(e.target.value)}
                    className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1"
                    required
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
                <strong>Gate Pass Protocol:</strong> Newly registered contract workers will remain in <span className="font-bold underline">Pending Verification</span> until statutory Safety Induction and MVT validation are verified by the Safety Officer.
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddContractWorkerModal(false)}
                  className="px-4 py-2 text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 transition-colors shadow-xs"
                >
                  REGISTER WORKER & ISSUE TEMPORARY ID
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Requirement 4: Bulk Master Excel Import Modal (.xlsx / .xls) */}
      {showBulkImportModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 uppercase tracking-tight">
                    NMDC Employee Master Excel Ingestion Engine
                  </h3>
                  <p className="text-xs text-slate-500">
                    Supports .xlsx, .xls and .csv files • Server-level duplicate checking & linked record preservation
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowBulkImportModal(false);
                  setPreviewRows([]);
                  setImportSummary(null);
                  setIsImportCommitted(false);
                }}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Template & Options Banner */}
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="font-bold text-slate-900">Standard Donimalai Template Available</div>
                <div className="text-slate-600">
                  Use Employee ID as matching key. Updates preserve linked MVT, medical & competency records.
                </div>
              </div>
              <button
                onClick={handleDownloadExcelTemplate}
                className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span>Download .xlsx Template</span>
              </button>
            </div>

            {/* Upload Drop Zone */}
            <div className="mt-4 p-6 border-2 border-dashed border-slate-300 rounded-2xl text-center bg-slate-50/50 hover:border-amber-400 hover:bg-amber-50/20 transition-all">
              <Upload className="w-9 h-9 text-amber-600 mx-auto mb-2" />
              <div className="text-sm font-bold text-slate-900">
                {importFileName ? `Selected: ${importFileName}` : 'Select Employee Master Spreadsheet'}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Supports Microsoft Excel (.xlsx, .xls) and CSV (Up to 10MB)
              </p>

              <div className="mt-4 flex items-center justify-center gap-3">
                <label className="px-5 py-2.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition-all shadow-xs cursor-pointer inline-flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  <span>Choose Spreadsheet File</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleProcessExcelFile(file);
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Mode Toggle */}
            <div className="mt-4 flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={isUpdateMode}
                  onChange={(e) => setIsUpdateMode(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                />
                <span>Controlled Update Mode: Match by Employee ID and update existing records (Preserves linked training and medical history)</span>
              </label>
            </div>

            {/* Pre-Commit Preview Table */}
            {previewRows.length > 0 && !isImportCommitted && (
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-slate-900 uppercase">Pre-Commit Validation Preview:</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-800">
                      {previewRows.length} Rows Parsed
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-emerald-700 font-bold">
                      {previewRows.filter((r) => r.status === 'INSERT').length} Inserts
                    </span>
                    <span className="text-indigo-700 font-bold">
                      {previewRows.filter((r) => r.status === 'UPDATE').length} Updates
                    </span>
                    <span className="text-rose-700 font-bold">
                      {previewRows.filter((r) => r.status === 'INVALID').length} Errors
                    </span>
                  </div>
                </div>

                <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-600 font-bold sticky top-0">
                      <tr>
                        <th className="py-2 px-3">Row</th>
                        <th className="py-2 px-3">Employee ID</th>
                        <th className="py-2 px-3">Name</th>
                        <th className="py-2 px-3">Department</th>
                        <th className="py-2 px-3">Type</th>
                        <th className="py-2 px-3">Target Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {previewRows.map((r) => (
                        <tr key={r.rowNumber} className={r.status === 'INVALID' ? 'bg-rose-50/60' : 'hover:bg-slate-50'}>
                          <td className="py-2 px-3 font-mono text-slate-500">{r.rowNumber}</td>
                          <td className="py-2 px-3 font-mono font-bold text-amber-800">{r.employeeId || '(Auto ID)'}</td>
                          <td className="py-2 px-3 font-semibold text-slate-900">{r.name || '<Empty>'}</td>
                          <td className="py-2 px-3 text-slate-700">{r.department}</td>
                          <td className="py-2 px-3 text-slate-600">{r.employeeType}</td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              r.status === 'INSERT'
                                ? 'bg-emerald-100 text-emerald-800'
                                : r.status === 'UPDATE'
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {r.action}
                            </span>
                            {r.errors.length > 0 && (
                              <div className="text-[10px] text-rose-600 mt-0.5">{r.errors.join('; ')}</div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between pt-2">
                  {previewRows.some((r) => r.status === 'INVALID') && (
                    <button
                      onClick={handleDownloadErrorReport}
                      className="px-3 py-1.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Row Error Report</span>
                    </button>
                  )}
                  <div className="ml-auto flex items-center gap-2">
                    <button
                      onClick={handleCommitImport}
                      className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Commit Import to Database ({previewRows.filter((r) => r.status !== 'INVALID').length} Records)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Post-Commit Summary Display */}
            {isImportCommitted && importSummary && (
              <div className="mt-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-3">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Import Completed Successfully</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center font-mono">
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-200">
                    <div className="text-[10px] text-slate-500">INSERTED</div>
                    <div className="text-lg font-bold text-emerald-700">{importSummary.inserted}</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-200">
                    <div className="text-[10px] text-slate-500">UPDATED</div>
                    <div className="text-lg font-bold text-indigo-700">{importSummary.updated}</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-200">
                    <div className="text-[10px] text-slate-500">SKIPPED</div>
                    <div className="text-lg font-bold text-slate-700">{importSummary.skipped}</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-200">
                    <div className="text-[10px] text-slate-500">REJECTED</div>
                    <div className="text-lg font-bold text-rose-700">{importSummary.rejected}</div>
                  </div>
                </div>
                {importSummary.errors.length > 0 && (
                  <div className="pt-2 flex justify-between items-center text-rose-800">
                    <span>{importSummary.errors.length} rows encountered validation errors and were rejected.</span>
                    <button
                      onClick={handleDownloadErrorReport}
                      className="px-3 py-1 bg-white border border-rose-300 rounded font-bold text-rose-700 hover:bg-rose-50"
                    >
                      Download Error Log
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => {
                  setShowBulkImportModal(false);
                  setPreviewRows([]);
                  setImportSummary(null);
                  setIsImportCommitted(false);
                }}
                className="px-5 py-2 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspect Worker Details Modal */}
      {selectedWorkerDetail && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                Personnel Profile • {selectedWorkerDetail.name}
              </h3>
              <button onClick={() => setSelectedWorkerDetail(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>
            <div className="mt-4 flex items-start gap-4">
              <img
                src={selectedWorkerDetail.photoUrl}
                alt={selectedWorkerDetail.name}
                className="w-20 h-20 rounded-xl object-cover border-2 border-amber-400 shadow-sm"
              />
              <div className="text-xs space-y-1">
                <div className="text-sm font-bold text-slate-900">{selectedWorkerDetail.name}</div>
                <div className="font-mono text-amber-800 font-bold">{selectedWorkerDetail.id}</div>
                <div className="text-slate-700">{selectedWorkerDetail.designation} ({selectedWorkerDetail.grade})</div>
                <div className="text-slate-500">{selectedWorkerDetail.department} • {selectedWorkerDetail.section}</div>
                <div className="text-slate-500">Supervisor: {selectedWorkerDetail.supervisor}</div>
              </div>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-between">
              <button
                onClick={() => {
                  const id = selectedWorkerDetail.id;
                  setSelectedWorkerDetail(null);
                  setViewPassportWorkerId(id);
                }}
                className="px-3 py-1.5 text-xs font-bold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 cursor-pointer"
              >
                View Full Digital Safety Passport
              </button>
              <button
                onClick={() => setSelectedWorkerDetail(null)}
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
