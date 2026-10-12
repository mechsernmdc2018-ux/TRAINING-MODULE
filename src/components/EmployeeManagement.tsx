import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { Employee, WorkerClassification } from '../types';
import { getPersonnelAvatar } from '../utils/avatarUtils';

export const EmployeeManagement: React.FC = () => {
  const {
    employees,
    contractors,
    addEmployee,
    addContractWorker,
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

  // Modals
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [showAddContractWorkerModal, setShowAddContractWorkerModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [selectedWorkerDetail, setSelectedWorkerDetail] = useState<Employee | null>(null);

  // Bulk Import State
  const [bulkImportResults, setBulkImportResults] = useState<{
    total: number;
    success: number;
    errors: { row: number; error: string }[];
  } | null>(null);

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
    alert(`Regular Employee successfully registered (ID: ${newEmp.id}). MVT tracking initialized!`);
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
    alert(`Contract Worker registered (ID: ${newWorker.id}). Placed under 'Pending Verification' awaiting Safety Induction.`);
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

  const handleDownloadSampleCSV = () => {
    const headers = ['Name', 'EmployeeType', 'DateOfBirth', 'Mobile', 'Department', 'Designation', 'Trade', 'Classification', 'MedicalFitnessValidTill', 'ContractorCode'];
    const sampleRows = [
      ['[Candidate Full Name]', 'NMDC_REGULAR', '1990-01-01', '+91 90000 00000', 'Mining', 'Heavy Machinery Operator', 'HEMM Driving', 'HEMM Operator', '2027-04-01', ''],
      ['[Contract Worker Full Name]', 'CONTRACT_WORKER', '1992-05-15', '+91 90000 00001', 'Mining', 'Tipper Driver', 'Commercial Driving', 'Operator', '2027-05-01', 'NMDC-CONT-DM-01'],
    ];
    exportToCSV('NMDC_Workforce_Import_Template', headers, sampleRows);
  };

  const handleProcessCSV = (csvText: string) => {
    const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length <= 1) {
      alert('CSV file contains no data rows.');
      return;
    }

    const dataRows = lines.slice(1);
    let successCount = 0;
    const errors: { row: number; error: string }[] = [];

    dataRows.forEach((line, index) => {
      const rowNum = index + 2;
      const parts = line.split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''));
      if (parts.length < 5) {
        errors.push({ row: rowNum, error: 'Insufficient columns. Expected at least Name, Type, DOB, Mobile, Department.' });
        return;
      }

      const [name, rawType, dob, mobile, dept, desig, trade, classification, medValid, contCode] = parts;

      if (!name) {
        errors.push({ row: rowNum, error: 'Worker name is missing.' });
        return;
      }

      const isContract = rawType?.toUpperCase().includes('CONTRACT');
      const empClassification: WorkerClassification = (classification as WorkerClassification) || (isContract ? 'Operator' : 'HEMM Operator');
      const medicalDate = medValid || '2027-04-01';

      try {
        if (!isContract) {
          addEmployee({
            name,
            photoUrl: getPersonnelAvatar(name, 'REGULAR'),
            dateOfBirth: dob || '1990-01-01',
            mobile: mobile || '+91 94480 00000',
            email: `${name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@nmdc.co.in`,
            department: dept || 'Mining',
            section: 'Donimalai Mine Operations',
            designation: desig || 'Operative',
            trade: trade || 'Mining Support',
            grade: 'W-04',
            employeeType: 'NMDC_REGULAR',
            dateOfJoining: '2026-10-08',
            dateOfDeployment: '2026-10-09',
            shift: 'Shift A (06:00-14:00)',
            supervisor: 'Foreman Incharge',
            workLocation: 'Donimalai Complex',
            mine: 'Donimalai Iron Ore Mine',
            employmentStatus: 'ACTIVE',
            classification: empClassification,
            verificationStatus: 'Verified',
            medicalFitnessDate: '2026-04-01',
            medicalFitnessValidTill: medicalDate,
          });
        } else {
          const contractor = contractors.find((c) => c.code === contCode) || contractors[0];
          addContractWorker({
            name,
            photoUrl: getPersonnelAvatar(name, 'CONTRACT'),
            dateOfBirth: dob || '1992-05-15',
            mobile: mobile || '+91 98860 00000',
            email: `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@contractor.in`,
            department: dept || 'Mining',
            section: 'Contractual Mining Work Order',
            designation: desig || 'Contract Worker',
            trade: trade || 'General Driving',
            grade: 'Contract-Skilled',
            dateOfJoining: '2026-10-08',
            dateOfDeployment: '2026-10-10',
            shift: 'Shift A (06:00-14:00)',
            supervisor: contractor?.safetyOfficer || 'Contractor Supervisor',
            workLocation: 'Donimalai Pit Operations',
            mine: 'Donimalai Iron Ore Mine',
            employmentStatus: 'ACTIVE',
            classification: empClassification,
            contractorCode: contractor?.code || 'NMDC-CONT-DM-01',
            contractorName: contractor?.name || 'Contractor Agency',
            workOrderNumber: contractor?.workOrderNumber || 'WO/NMDC/2026',
            verificationStatus: 'Pending Verification',
            medicalFitnessDate: '2026-04-01',
            medicalFitnessValidTill: medicalDate,
          });
        }
        successCount++;
      } catch (err: any) {
        errors.push({ row: rowNum, error: err.message || 'Error creating worker record.' });
      }
    });

    setBulkImportResults({
      total: dataRows.length,
      success: successCount,
      errors,
    });
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
              className="px-3 py-2 text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Bulk Excel / CSV Import"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>EXCEL IMPORT</span>
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

      {/* Bulk Excel Import Modal */}
      {showBulkImportModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-xl w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                  Bulk Workforce Excel / CSV Import Engine
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowBulkImportModal(false);
                  setBulkImportResults(null);
                }}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 mt-3">
              Automated validation against duplicates, invalid statutory references, missing mandatory columns, and medical date boundaries.
            </p>

            <div className="mt-4 p-5 border-2 border-dashed border-slate-300 rounded-xl text-center bg-slate-50 hover:border-amber-400 transition-colors">
              <Upload className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <div className="text-xs font-bold text-slate-900">Upload NMDC Form B / Contractor Manpower CSV File</div>
              <p className="text-[11px] text-slate-500 mt-1">Select a UTF-8 encoded .csv roster file</p>
              
              <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
                <label className="px-4 py-2 text-xs font-bold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 transition-colors shadow-xs cursor-pointer inline-flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose CSV File</span>
                  <input
                    type="file"
                    accept=".csv,.txt"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const text = event.target?.result as string;
                          if (text) handleProcessCSV(text);
                        };
                        reader.readAsText(file);
                      }
                    }}
                  />
                </label>

                <button
                  onClick={handleDownloadSampleCSV}
                  className="px-3 py-2 text-xs font-semibold bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Sample Template</span>
                </button>
              </div>
            </div>

            {bulkImportResults && (
              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-900">Total Validated: {bulkImportResults.total}</span>
                  <span className="text-emerald-700">{bulkImportResults.success} Records Validated</span>
                  <span className="text-rose-700">{bulkImportResults.errors.length} Flagged</span>
                </div>
                <div className="border-t border-slate-200 pt-2 text-[11px] text-slate-700 space-y-1">
                  <span className="font-semibold text-rose-700">Validation Error Exceptions:</span>
                  {bulkImportResults.errors.map((err, idx) => (
                    <div key={idx} className="text-rose-800 bg-rose-50 p-1.5 rounded border border-rose-200">
                      Row {err.row}: {err.error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => {
                  setShowBulkImportModal(false);
                  setBulkImportResults(null);
                }}
                className="px-4 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg"
              >
                Close
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
