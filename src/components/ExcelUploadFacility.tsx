import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useApp } from '../context/AppContext';
import { NMDCLogo } from './NMDCLogo';
import {
  FileSpreadsheet,
  UploadCloud,
  Download,
  CheckCircle2,
  AlertTriangle,
  Users,
  Stethoscope,
  ShieldAlert,
  GraduationCap,
  RefreshCw,
  FileText,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Building2,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  RecordUploadType,
  ExcelImportRow,
  MedicalRecordImportRow,
  MVTRecordImportRow,
  OtherTrainingImportRow,
  MedicalFitnessResult,
  OtherTrainingCategory,
  TrainingCompletionStatus,
} from '../types';

export const ExcelUploadFacility: React.FC = () => {
  const {
    employees,
    bulkImportEmployees,
    bulkImportMedicalRecords,
    bulkImportMVTRecords,
    bulkImportOtherTrainingRecords,
    setActiveTab,
    currentUser,
  } = useApp();

  const [selectedType, setSelectedType] = useState<RecordUploadType>('EMPLOYEE_MASTER');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VALID' | 'INVALID' | 'INSERT' | 'UPDATE'>('ALL');

  // Parsed row states per type
  const [employeeRows, setEmployeeRows] = useState<ExcelImportRow[]>([]);
  const [medicalRows, setMedicalRows] = useState<MedicalRecordImportRow[]>([]);
  const [mvtRows, setMvtRows] = useState<MVTRecordImportRow[]>([]);
  const [otherTrainingRows, setOtherTrainingRows] = useState<OtherTrainingImportRow[]>([]);

  // Execution result state
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    type: RecordUploadType;
    fileName: string;
    inserted: number;
    updated: number;
    skipped: number;
    rejected: number;
    errors: { row: number; error: string }[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Template generators using SheetJS XLSX
  const handleDownloadTemplate = (type: RecordUploadType) => {
    const wb = XLSX.utils.book_new();

    if (type === 'EMPLOYEE_MASTER') {
      const headers = [
        'Employee ID',
        'Full Name',
        'Employment Type (NMDC_REGULAR/CONTRACT_WORKER)',
        'Worker Category (Executive/Workman/Contractor)',
        'Department',
        'Section',
        'Designation',
        'Trade',
        'Grade',
        'Date of Birth (YYYY-MM-DD)',
        'Mobile Number',
        'Email Address',
        'Shift (Shift A/Shift B/General Shift)',
        'Work Location',
        'Contractor Name (if contract)',
        'Work Order Number (if contract)',
        'Medical Fitness Valid Till (YYYY-MM-DD)',
      ];
      const data = [
        headers,
        [
          'NMDC-EMP-2001',
          'Ramesh Kumar Sharma',
          'NMDC_REGULAR',
          'Workman',
          'Mining',
          'Donimalai Pit Phase II',
          'HEMM Operator Grade I',
          'Heavy Mining Machinery',
          'W-06',
          '1987-05-14',
          '+91 94480 12345',
          'ramesh.sharma@nmdc.co.in',
          'Shift A (06:00-14:00)',
          'Donimalai Mining Complex',
          '',
          '',
          '2027-05-14',
        ],
        [
          'NMDC-EMP-2002',
          'Suresh Patel',
          'NMDC_REGULAR',
          'Executive',
          'Safety',
          'Mine Safety & DGMS Liaison',
          'Safety Officer',
          'Mining Safety Engineering',
          'E-03',
          '1985-11-20',
          '+91 94480 67890',
          'suresh.patel@nmdc.co.in',
          'General Shift (09:00-17:30)',
          'Donimalai Administrative Block',
          '',
          '',
          '2028-11-20',
        ],
        [
          'CONT-WRK-5001',
          'Anand Verma',
          'CONTRACT_WORKER',
          'Contractor',
          'Mechanical Services',
          'Crushing Plant Workshop',
          'Welder Grade II',
          'Fabrication & Welding',
          'C-02',
          '1994-08-10',
          '+91 98860 11223',
          'anand.verma@contractor.in',
          'Shift B (14:00-22:00)',
          'Crusher House Donimalai',
          'M/s Bellary Mining Infra Pvt Ltd',
          'WO/NMDC/DNM/2026/089',
          '2027-04-10',
        ],
      ];
      const ws = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, 'Employee_Master_Template');
      XLSX.writeFile(wb, 'NMDC_Employee_Master_Template.xlsx');
    } else if (type === 'MEDICAL_RECORDS') {
      const headers = [
        'Worker ID',
        'Worker Name',
        'Department',
        'Exam Type (IME/PME)',
        'Exam Date (YYYY-MM-DD)',
        'Fitness Result (FIT/TEMPORARILY_UNFIT/PERMANENTLY_UNFIT)',
        'Validity Period (YYYY-MM-DD)',
        'Next Due Date (YYYY-MM-DD)',
        'Examining Doctor',
        'Doctor Reg No',
        'Statutory Rule Reference',
        'Medical Certificate Number',
        'Special Remarks / Restrictions',
      ];
      const data = [
        headers,
        [
          'NMDC-EMP-2001',
          'Ramesh Kumar Sharma',
          'Mining',
          'PME',
          '2026-04-10',
          'FIT',
          '2031-04-10',
          '2031-04-10',
          'Dr. K. S. Rao, MD',
          'KMC-84920',
          'Mines Rules 1955 - Rule 29B',
          'NMDC-MED-CERT-2026-001',
          'Audiometry and Spirometry clear. Certified fit for open-cast heavy mining.',
        ],
        [
          'CONT-WRK-5001',
          'Anand Verma',
          'Mechanical Services',
          'IME',
          '2026-03-15',
          'FIT',
          '2027-03-15',
          '2027-03-15',
          'Dr. Sunita Deshmukh, MS',
          'KMC-99124',
          'Mines Rules 1955 - Rule 29B',
          'NMDC-MED-CERT-2026-002',
          'Initial pre-employment fitness verified.',
        ],
      ];
      const ws = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, 'Medical_Records_Template');
      XLSX.writeFile(wb, 'NMDC_Medical_Exam_Register_Template.xlsx');
    } else if (type === 'STATUTORY_MVT') {
      const headers = [
        'Worker ID',
        'Worker Name',
        'Department',
        'Training Type (Initial/Refresher/Special/Induction)',
        'Training Module Name',
        'Completion Date (YYYY-MM-DD)',
        'Validity Until (YYYY-MM-DD)',
        'Trainer / Principal VTC',
        'Attendance Score %',
        'Assessment Result (PASS/FAIL/EXEMPT)',
        'MVT Certificate Number',
        'Statutory Rule Applied',
      ];
      const data = [
        headers,
        [
          'NMDC-EMP-2001',
          'Ramesh Kumar Sharma',
          'Mining',
          'Refresher',
          'MVT Refresher Course (Rule 9) - Open Cast Mining',
          '2026-05-10',
          '2029-05-10',
          'Principal, Donimalai VTC',
          '95',
          'PASS',
          'MVT-FORM-B-2026-8801',
          'Mines Vocational Training Rules 1966 - Rule 9',
        ],
        [
          'CONT-WRK-5001',
          'Anand Verma',
          'Mechanical Services',
          'Initial',
          'Basic Induction & Gas Safety for Contractors (Rule 6)',
          '2026-04-01',
          '2027-04-01',
          'Safety Officer & VTC Trainer',
          '88',
          'PASS',
          'MVT-FORM-A-2026-9214',
          'Mines Vocational Training Rules 1966 - Rule 6',
        ],
      ];
      const ws = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, 'Statutory_MVT_Template');
      XLSX.writeFile(wb, 'NMDC_Statutory_MVT_Register_Template.xlsx');
    } else if (type === 'OTHER_TRAINING') {
      const headers = [
        'Worker ID',
        'Worker Name',
        'Department',
        'Training Category (OEM_SPECIALIZED/EXTERNAL_INSTITUTION/INTERNAL_TECHNICAL/INTERNATIONAL)',
        'Course Title',
        'Training Provider',
        'Venue',
        'Start Date (YYYY-MM-DD)',
        'End Date (YYYY-MM-DD)',
        'Duration Hours',
        'Training Cost (INR)',
        'Financial Year',
        'Completion Status (COMPLETED/IN_PROGRESS/NOMINATED)',
        'Certificate Number',
        'Competencies Acquired',
      ];
      const data = [
        headers,
        [
          'NMDC-EMP-2001',
          'Ramesh Kumar Sharma',
          'Mining',
          'OEM_SPECIALIZED',
          'Komatsu PC-2000 Hydraulic Excavator Maintenance & Operation',
          'Komatsu India Pvt Ltd',
          'Donimalai Heavy Equipment Centre',
          '2026-06-01',
          '2026-06-05',
          '40',
          '35000',
          '2026-2027',
          'COMPLETED',
          'KOMATSU-DNM-2026-041',
          'Hydraulic Controls, Telemetry Diagnostics, Advanced Safety Overrides',
        ],
        [
          'NMDC-EMP-2002',
          'Suresh Patel',
          'Safety',
          'EXTERNAL_INSTITUTION',
          'DGMS Certified Mine Safety Auditor Program',
          'Indian School of Mines (IIT ISM Dhanbad)',
          'Dhanbad Campus',
          '2026-07-10',
          '2026-07-14',
          '35',
          '45000',
          '2026-2027',
          'COMPLETED',
          'ISM-AUD-2026-118',
          'Risk Assessment Matrix, Statutory Compliance Audits, Incident Investigation',
        ],
      ];
      const ws = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, 'Other_Training_Template');
      XLSX.writeFile(wb, 'NMDC_Other_Training_Register_Template.xlsx');
    }
  };

  // Process chosen file
  const handleProcessFile = (selectedFile: File) => {
    setFile(selectedFile);
    setIsProcessing(true);
    setLastResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: 'binary', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          alert('The uploaded Excel sheet contains no data rows.');
          setIsProcessing(false);
          return;
        }

        const existingEmpMap = new Map(employees.map((emp) => [emp.id.trim().toUpperCase(), emp]));

        if (selectedType === 'EMPLOYEE_MASTER') {
          const parsed: ExcelImportRow[] = rawJson.map((row, idx) => {
            const rowNumber = idx + 2;
            const empId = String(
              row['Employee ID'] || row['employeeId'] || row['ID'] || row['Worker ID'] || row['Emp ID'] || ''
            ).trim();
            const name = String(row['Full Name'] || row['name'] || row['Name'] || '').trim();
            const rawEmpType = String(row['Employment Type (NMDC_REGULAR/CONTRACT_WORKER)'] || row['employeeType'] || '').trim().toUpperCase();
            const employeeType = rawEmpType.includes('CONTRACT') ? 'CONTRACT_WORKER' : 'NMDC_REGULAR';
            const department = String(row['Department'] || row['department'] || 'Mining').trim();
            const designation = String(row['Designation'] || row['designation'] || 'Operative').trim();
            const dateOfBirth = String(row['Date of Birth (YYYY-MM-DD)'] || row['dateOfBirth'] || '1990-01-01').trim();
            const mobile = String(row['Mobile Number'] || row['mobile'] || '+91 94480 00000').trim();
            const email = String(row['Email Address'] || row['email'] || '').trim() || `${name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@nmdc.co.in`;
            const validTill = String(row['Medical Fitness Valid Till (YYYY-MM-DD)'] || row['medicalFitnessValidTill'] || '2027-04-01').trim();

            const errors: string[] = [];
            if (!empId) errors.push('Missing Employee ID');
            if (!name) errors.push('Missing Full Name');

            const existing = existingEmpMap.get(empId.toUpperCase());
            const status = errors.length > 0 ? 'INVALID' : existing ? 'UPDATE' : 'INSERT';

            return {
              rowNumber,
              status,
              action: status,
              employeeId: empId,
              name,
              employeeType,
              workerCategory: employeeType === 'NMDC_REGULAR' ? 'REGULAR_WORKMAN' : 'CONTRACTOR_WORKMAN',
              department,
              section: String(row['Section'] || 'Donimalai Operations').trim(),
              designation,
              trade: String(row['Trade'] || 'General Mining').trim(),
              grade: String(row['Grade'] || 'W-04').trim(),
              dateOfBirth,
              mobile,
              email,
              shift: 'Shift A (06:00-14:00)',
              workLocation: String(row['Work Location'] || 'Donimalai Mining Complex').trim(),
              contractorName: String(row['Contractor Name (if contract)'] || '').trim() || undefined,
              workOrderNumber: String(row['Work Order Number (if contract)'] || '').trim() || undefined,
              medicalFitnessValidTill: validTill,
              errors,
              existingRecord: existing,
            };
          });
          setEmployeeRows(parsed);
        } else if (selectedType === 'MEDICAL_RECORDS') {
          const parsed: MedicalRecordImportRow[] = rawJson.map((row, idx) => {
            const rowNumber = idx + 2;
            const workerId = String(row['Worker ID'] || row['workerId'] || row['Employee ID'] || '').trim();
            const workerName = String(row['Worker Name'] || row['workerName'] || row['Name'] || '').trim();
            const department = String(row['Department'] || row['department'] || 'Mining').trim();
            const examTypeRaw = String(row['Exam Type (IME/PME)'] || row['examType'] || 'PME').trim().toUpperCase();
            const examType = examTypeRaw.includes('IME') ? 'IME' : 'PME';
            const examDate = String(row['Exam Date (YYYY-MM-DD)'] || row['examDate'] || '2026-04-10').trim();
            const rawResult = String(row['Fitness Result (FIT/TEMPORARILY_UNFIT/UNFIT)'] || row['fitnessResult'] || 'FIT').trim().toUpperCase();
            const fitnessResult: MedicalFitnessResult = rawResult.includes('TEMP') ? 'TEMPORARILY_UNFIT' : rawResult.includes('RESTRICT') ? 'FIT_WITH_RESTRICTION' : rawResult.includes('UNFIT') ? 'UNFIT' : 'FIT';
            const validTill = String(row['Validity Period (YYYY-MM-DD)'] || row['validTill'] || '2031-04-10').trim();
            const nextDueDate = String(row['Next Due Date (YYYY-MM-DD)'] || row['nextDueDate'] || validTill).trim();
            const doctor = String(row['Examining Doctor'] || row['examiningDoctor'] || 'Dr. K. S. Rao, MD').trim();
            const regNo = String(row['Doctor Reg No'] || row['doctorRegistrationNo'] || 'KMC-84920').trim();
            const certNo = String(row['Medical Certificate Number'] || row['certificateNumber'] || `DGMS-MED-${Date.now()}-${idx}`).trim();
            const ruleRef = String(row['Statutory Rule Reference'] || row['statutoryRuleReference'] || 'Mines Rules 1955 - Rule 29B').trim();
            const remarks = String(row['Special Remarks / Restrictions'] || row['restrictionNotes'] || '').trim();

            const errors: string[] = [];
            if (!workerId) errors.push('Missing Worker ID');

            const workerExists = existingEmpMap.has(workerId.toUpperCase());
            if (!workerExists) {
              errors.push(`Worker ID '${workerId}' not currently registered in workforce`);
            }

            return {
              rowNumber,
              status: errors.length > 0 ? 'INVALID' : 'INSERT',
              workerId,
              workerName: workerName || existingEmpMap.get(workerId.toUpperCase())?.name || 'Worker',
              department,
              examType,
              examDate,
              fitnessResult,
              validTill,
              nextDueDate,
              certificateNumber: certNo,
              examiningDoctor: doctor,
              doctorRegistrationNo: regNo,
              statutoryRuleReference: ruleRef,
              publicFitnessIndicator: fitnessResult,
              restrictionNotes: remarks,
              errors,
            };
          });
          setMedicalRows(parsed);
        } else if (selectedType === 'STATUTORY_MVT') {
          const parsed: MVTRecordImportRow[] = rawJson.map((row, idx) => {
            const rowNumber = idx + 2;
            const workerId = String(row['Worker ID'] || row['workerId'] || row['Employee ID'] || '').trim();
            const workerName = String(row['Worker Name'] || row['workerName'] || row['Name'] || '').trim();
            const department = String(row['Department'] || row['department'] || 'Mining').trim();
            const trainingTypeRaw = String(row['Training Type (Initial/Refresher/Special/Induction)'] || row['trainingType'] || 'Refresher').trim();
            const trainingType: 'Initial' | 'Refresher' | 'Special' | 'Induction' =
              trainingTypeRaw.toLowerCase().includes('init') ? 'Initial' :
              trainingTypeRaw.toLowerCase().includes('spec') ? 'Special' :
              trainingTypeRaw.toLowerCase().includes('induc') ? 'Induction' : 'Refresher';

            const trainingName = String(row['Training Module Name'] || row['trainingName'] || 'MVT Refresher Training').trim();
            const completionDate = String(row['Completion Date (YYYY-MM-DD)'] || row['completionDate'] || '2026-05-10').trim();
            const validTill = String(row['Validity Until (YYYY-MM-DD)'] || row['validTill'] || '2029-05-10').trim();
            const trainer = String(row['Trainer / Principal VTC'] || row['trainerName'] || 'Principal, Donimalai VTC').trim();
            const score = String(row['Attendance Score %'] || row['attendanceScore'] || '90').trim();
            const rawAssessment = String(row['Assessment Result (PASS/FAIL/EXEMPT)'] || row['assessmentResult'] || 'PASS').trim().toUpperCase();
            const assessmentResult: 'PASS' | 'FAIL' | 'EXEMPT' = rawAssessment.includes('FAIL') ? 'FAIL' : rawAssessment.includes('EXEMPT') ? 'EXEMPT' : 'PASS';
            const certNo = String(row['MVT Certificate Number'] || row['certificateNumber'] || `MVT-CERT-${Date.now()}-${idx}`).trim();
            const rule = String(row['Statutory Rule Applied'] || row['statutoryRuleApplied'] || 'MVT Rules 1966 - Rule 9').trim();

            const errors: string[] = [];
            if (!workerId) errors.push('Missing Worker ID');

            return {
              rowNumber,
              status: errors.length > 0 ? 'INVALID' : 'INSERT',
              workerId,
              workerName: workerName || existingEmpMap.get(workerId.toUpperCase())?.name || 'Worker',
              department,
              trainingType,
              trainingName,
              completionDate,
              validTill,
              trainerName: trainer,
              attendanceScore: score,
              assessmentResult,
              certificateNumber: certNo,
              statutoryRuleApplied: rule,
              errors,
            };
          });
          setMvtRows(parsed);
        } else if (selectedType === 'OTHER_TRAINING') {
          const parsed: OtherTrainingImportRow[] = rawJson.map((row, idx) => {
            const rowNumber = idx + 2;
            const workerId = String(row['Worker ID'] || row['workerId'] || row['Employee ID'] || '').trim();
            const workerName = String(row['Worker Name'] || row['workerName'] || row['Name'] || '').trim();
            const department = String(row['Department'] || row['department'] || 'Mining').trim();
            const rawCat = String(row['Training Category (OEM/EXTERNAL/INTERNAL/INTERNATIONAL)'] || row['trainingCategory'] || 'OEM').trim().toUpperCase();
            const trainingCategory: OtherTrainingCategory =
              rawCat.includes('OEM') ? 'OEM' :
              rawCat.includes('EXT') ? 'EXTERNAL' :
              rawCat.includes('INT_TECH') || rawCat.includes('INTERNAL') ? 'INTERNAL' :
              rawCat.includes('INTERNAT') ? 'INTERNATIONAL' : 'OEM';

            const courseTitle = String(row['Course Title'] || row['courseTitle'] || 'Heavy Machinery Technical Training').trim();
            const provider = String(row['Training Provider'] || row['trainingProvider'] || 'Technical Training Wing').trim();
            const venue = String(row['Venue'] || row['venue'] || 'Donimalai Complex').trim();
            const startDate = String(row['Start Date (YYYY-MM-DD)'] || row['startDate'] || '2026-06-01').trim();
            const endDate = String(row['End Date (YYYY-MM-DD)'] || row['endDate'] || '2026-06-05').trim();
            const durationHours = Number(row['Duration Hours'] || row['durationHours'] || 40);
            const costInr = Number(row['Training Cost (INR)'] || row['costInr'] || 0);
            const financialYear = String(row['Financial Year'] || row['financialYear'] || '2026-2027').trim();
            const rawStatus = String(row['Completion Status (COMPLETED/ONGOING/NOMINATED)'] || row['completionStatus'] || 'COMPLETED').trim().toUpperCase();
            const completionStatus: TrainingCompletionStatus = rawStatus.includes('PROG') || rawStatus.includes('ONGOING') ? 'ONGOING' : rawStatus.includes('NOM') ? 'NOMINATED' : 'COMPLETED';
            const certNo = String(row['Certificate Number'] || row['certificateNumber'] || `OTR-CERT-${Date.now()}-${idx}`).trim();
            const skills = String(row['Competencies Acquired'] || row['skillsLearned'] || 'Heavy Mining Safety').trim();

            const errors: string[] = [];
            if (!workerId) errors.push('Missing Worker ID');
            if (!courseTitle) errors.push('Missing Course Title');

            return {
              rowNumber,
              status: errors.length > 0 ? 'INVALID' : 'INSERT',
              workerId,
              workerName: workerName || existingEmpMap.get(workerId.toUpperCase())?.name || 'Worker',
              department,
              trainingCategory,
              courseTitle,
              trainingProvider: provider,
              venue,
              startDate,
              endDate,
              durationHours,
              costInr,
              financialYear,
              completionStatus,
              certificateNumber: certNo,
              skillsLearned: skills,
              errors,
            };
          });
          setOtherTrainingRows(parsed);
        }
      } catch (err) {
        console.error('Error parsing Excel sheet:', err);
        alert('Failed to parse the Excel spreadsheet. Please verify it is a valid .xlsx or .xls file.');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsBinaryString(selectedFile);
  };

  // Commit parsed rows
  const handleCommit = async () => {
    setIsCommitting(true);
    try {
      if (selectedType === 'EMPLOYEE_MASTER') {
        const result = await bulkImportEmployees(employeeRows, isUpdateMode);
        setLastResult({
          success: true,
          type: 'EMPLOYEE_MASTER',
          fileName: file?.name || 'Employee_Master.xlsx',
          ...result,
        });
      } else if (selectedType === 'MEDICAL_RECORDS') {
        const result = await bulkImportMedicalRecords(medicalRows, isUpdateMode);
        setLastResult({
          success: true,
          type: 'MEDICAL_RECORDS',
          fileName: file?.name || 'Medical_Records.xlsx',
          ...result,
        });
      } else if (selectedType === 'STATUTORY_MVT') {
        const result = await bulkImportMVTRecords(mvtRows, isUpdateMode);
        setLastResult({
          success: true,
          type: 'STATUTORY_MVT',
          fileName: file?.name || 'MVT_Records.xlsx',
          ...result,
        });
      } else if (selectedType === 'OTHER_TRAINING') {
        const result = await bulkImportOtherTrainingRecords(otherTrainingRows, isUpdateMode);
        setLastResult({
          success: true,
          type: 'OTHER_TRAINING',
          fileName: file?.name || 'Other_Training_Records.xlsx',
          ...result,
        });
      }
    } catch (err) {
      console.error('Commit failed:', err);
      alert('Encountered an issue committing records. Please check the logs.');
    } finally {
      setIsCommitting(false);
    }
  };

  // Download error log
  const handleDownloadErrorLog = () => {
    if (!lastResult || lastResult.errors.length === 0) return;
    const wb = XLSX.utils.book_new();
    const data = [
      ['Row Number', 'Error Details'],
      ...lastResult.errors.map((e) => [e.row, e.error]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Rejection_Errors');
    XLSX.writeFile(wb, `NMDC_${lastResult.type}_Error_Report.xlsx`);
  };

  // Row counts
  const currentTotal =
    selectedType === 'EMPLOYEE_MASTER' ? employeeRows.length :
    selectedType === 'MEDICAL_RECORDS' ? medicalRows.length :
    selectedType === 'STATUTORY_MVT' ? mvtRows.length : otherTrainingRows.length;

  const currentValid =
    selectedType === 'EMPLOYEE_MASTER' ? employeeRows.filter((r) => r.status !== 'INVALID').length :
    selectedType === 'MEDICAL_RECORDS' ? medicalRows.filter((r) => r.status !== 'INVALID').length :
    selectedType === 'STATUTORY_MVT' ? mvtRows.filter((r) => r.status !== 'INVALID').length :
    otherTrainingRows.filter((r) => r.status !== 'INVALID').length;

  const currentInvalid = currentTotal - currentValid;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Enterprise Facility Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-50 rounded-full blur-3xl -z-10 opacity-70 pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="h-16 w-14 bg-white rounded-2xl border border-slate-200 shadow-sm shrink-0 flex items-center justify-center p-1">
              <NMDCLogo className="h-full w-auto" showText={true} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-amber-400 px-2.5 py-0.5 rounded-full">
                  Statutory Ingestion Facility
                </span>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                  Alternative to Registration of Employees
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Bulk Excel Record Upload & Ingestion Centre
              </h1>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Ingest workforce registers, DGMS Rule 29B medical examination records, Mines Vocational Training Form A/B certificates, and OEM training histories in bulk with full transaction safety and linked record preservation.
              </p>
              <div className="mt-2.5 p-2.5 bg-emerald-50/90 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-center gap-2 max-w-2xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  <strong>Workforce Registration Alternative:</strong> Uploading the Employee Master Excel sheet serves as the statutory alternative to registering employees individually. All uploaded personnel are automatically enrolled into Form B registers, MVT countdowns, and provisioned user portal accounts.
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleDownloadTemplate(selectedType)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs shadow-sm border border-slate-700 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-amber-400" />
              Download Official Template (.xlsx)
            </button>
            <button
              onClick={() => {
                if (fileInputRef.current) fileInputRef.current.click();
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-sm transition-all cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              Upload SpreadSheet
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleProcessFile(e.target.files[0]);
                }
              }}
              accept=".xlsx,.xls,.csv"
              className="hidden"
            />
          </div>
        </div>

        {/* Record Category Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
          <button
            onClick={() => {
              setSelectedType('EMPLOYEE_MASTER');
              setLastResult(null);
            }}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              selectedType === 'EMPLOYEE_MASTER'
                ? 'bg-amber-50/80 border-amber-400 shadow-xs'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <Users className={`w-4 h-4 ${selectedType === 'EMPLOYEE_MASTER' ? 'text-amber-800 font-bold' : 'text-slate-500'}`} />
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                Master Roster
              </span>
            </div>
            <div className="text-xs font-bold text-slate-900">Workforce Master</div>
            <div className="text-[11px] text-slate-500">Regular & Contract Cadre</div>
          </button>

          <button
            onClick={() => {
              setSelectedType('MEDICAL_RECORDS');
              setLastResult(null);
            }}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              selectedType === 'MEDICAL_RECORDS'
                ? 'bg-amber-50/80 border-amber-400 shadow-xs'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <Stethoscope className={`w-4 h-4 ${selectedType === 'MEDICAL_RECORDS' ? 'text-emerald-700 font-bold' : 'text-slate-500'}`} />
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                Rule 29B
              </span>
            </div>
            <div className="text-xs font-bold text-slate-900">Medical (IME / PME)</div>
            <div className="text-[11px] text-slate-500">DGMS Fitness Register</div>
          </button>

          <button
            onClick={() => {
              setSelectedType('STATUTORY_MVT');
              setLastResult(null);
            }}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              selectedType === 'STATUTORY_MVT'
                ? 'bg-amber-50/80 border-amber-400 shadow-xs'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <ShieldAlert className={`w-4 h-4 ${selectedType === 'STATUTORY_MVT' ? 'text-amber-700 font-bold' : 'text-slate-500'}`} />
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                MVT 1966
              </span>
            </div>
            <div className="text-xs font-bold text-slate-900">Statutory MVT Records</div>
            <div className="text-[11px] text-slate-500">Form A & B Certifications</div>
          </button>

          <button
            onClick={() => {
              setSelectedType('OTHER_TRAINING');
              setLastResult(null);
            }}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              selectedType === 'OTHER_TRAINING'
                ? 'bg-amber-50/80 border-amber-400 shadow-xs'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <GraduationCap className={`w-4 h-4 ${selectedType === 'OTHER_TRAINING' ? 'text-indigo-700 font-bold' : 'text-slate-500'}`} />
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                OEM / Technical
              </span>
            </div>
            <div className="text-xs font-bold text-slate-900">Other Training History</div>
            <div className="text-[11px] text-slate-500">Specialized Competencies</div>
          </button>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleProcessFile(e.dataTransfer.files[0]);
          }
        }}
        className="bg-white border-2 border-dashed border-slate-300 hover:border-amber-400 rounded-2xl p-8 text-center transition-all bg-gradient-to-b from-slate-50/50 to-white"
      >
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 mx-auto flex items-center justify-center border border-amber-300 shadow-xs">
            <FileSpreadsheet className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Drag & drop your Excel sheet here, or browse files
          </h3>
          <p className="text-xs text-slate-500">
            Supports Microsoft Excel (<code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">.xlsx</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">.xls</code>) and CSV (<code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">.csv</code>). Maximum file size 25MB.
          </p>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => {
                if (fileInputRef.current) fileInputRef.current.click();
              }}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Select Spreadsheet
            </button>
            <button
              onClick={() => handleDownloadTemplate(selectedType)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-all border border-slate-200 cursor-pointer"
            >
              Get Template (.xlsx)
            </button>
          </div>

          {file && (
            <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between text-left text-xs">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-700 shrink-0" />
                <div>
                  <div className="font-bold text-slate-900">{file.name}</div>
                  <div className="text-[11px] text-slate-500">{(file.size / 1024).toFixed(1)} KB • Loaded for {selectedType}</div>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-amber-200 text-amber-900 font-bold rounded text-[10px]">
                Ready to Ingest
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Execution Feedback Banner */}
      {lastResult && (
        <div className={`p-6 rounded-2xl border shadow-sm ${
          lastResult.rejected > 0 ? 'bg-amber-50/90 border-amber-300' : 'bg-emerald-50/90 border-emerald-300'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl shrink-0 ${
                lastResult.rejected > 0 ? 'bg-amber-200 text-amber-900' : 'bg-emerald-200 text-emerald-900'
              }`}>
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Spreadsheet Ingestion Completed for {lastResult.fileName}
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Processed by <strong>{currentUser.name}</strong> ({currentUser.role}). All linked safety records and gate permissions have been updated.
                </p>
                {selectedType === 'EMPLOYEE_MASTER' && (
                  <div className="text-[11px] text-emerald-800 font-medium mt-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>Statutory Registration Complete:</strong> Personnel enrolled in Form B master and user portal accounts provisioned (Login ID: Employee ID).</span>
                  </div>
                )}
                <div className="flex items-center gap-3 mt-2 text-xs font-semibold flex-wrap">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded border border-emerald-200">
                    Inserted: {lastResult.inserted}
                  </span>
                  <span className="px-2 py-0.5 bg-sky-100 text-sky-800 rounded border border-sky-200">
                    Updated: {lastResult.updated}
                  </span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                    Skipped: {lastResult.skipped}
                  </span>
                  {lastResult.rejected > 0 && (
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded border border-rose-200">
                      Rejected: {lastResult.rejected}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              {lastResult.rejected > 0 && (
                <button
                  onClick={handleDownloadErrorLog}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 text-rose-700 font-bold text-xs rounded-lg border border-rose-300 shadow-xs cursor-pointer"
                >
                  Download Error Log (.xlsx)
                </button>
              )}
              <button
                onClick={() => {
                  if (selectedType === 'EMPLOYEE_MASTER') setActiveTab('workforce');
                  else if (selectedType === 'MEDICAL_RECORDS') setActiveTab('medical');
                  else if (selectedType === 'STATUTORY_MVT') setActiveTab('mvt-command');
                  else if (selectedType === 'OTHER_TRAINING') setActiveTab('other-training');
                }}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                View Module Register <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Section */}
      {currentTotal > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                  Parsed Sheet Preview
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  {currentTotal} Rows Evaluated
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                Data Verification & Commit Panel
              </h3>
            </div>

            <div className="flex items-center gap-3 flex-wrap w-full md:w-auto">
              {/* Conflict Mode Toggle */}
              <label className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={isUpdateMode}
                  onChange={(e) => setIsUpdateMode(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                Update Existing (Safe Upsert)
              </label>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs focus:outline-none"
              >
                <option value="ALL">All Rows ({currentTotal})</option>
                <option value="VALID">Valid Rows ({currentValid})</option>
                <option value="INVALID">Issues / Errors ({currentInvalid})</option>
              </select>

              {/* Search */}
              <div className="relative min-w-[150px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter rows..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="bg-white text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none w-full shadow-xs"
                />
              </div>

              {/* Commit Button */}
              <button
                onClick={handleCommit}
                disabled={isCommitting || currentValid === 0}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ml-auto"
              >
                {isCommitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Ingesting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Commit {currentValid} Rows
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto max-h-96 divide-y divide-slate-100">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 z-10 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Worker ID</th>
                  <th className="py-2.5 px-3">Full Name</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Details / Modules</th>
                  <th className="py-2.5 px-3">Validity / Date</th>
                  <th className="py-2.5 px-3">Audit / Validation Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {selectedType === 'EMPLOYEE_MASTER' &&
                  employeeRows
                    .filter((r) => {
                      if (statusFilter === 'VALID') return r.status !== 'INVALID';
                      if (statusFilter === 'INVALID') return r.status === 'INVALID';
                      return true;
                    })
                    .filter(
                      (r) =>
                        r.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                        r.employeeId.toLowerCase().includes(searchFilter.toLowerCase()) ||
                        r.department.toLowerCase().includes(searchFilter.toLowerCase())
                    )
                    .map((r) => (
                      <tr key={r.rowNumber} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-slate-400 text-[11px]">{r.rowNumber}</td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              r.status === 'INSERT'
                                ? 'bg-emerald-100 text-emerald-800'
                                : r.status === 'UPDATE'
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-900">{r.employeeId}</td>
                        <td className="py-2 px-3">{r.name}</td>
                        <td className="py-2 px-3 text-slate-600">{r.department}</td>
                        <td className="py-2 px-3 text-slate-600">{r.designation} ({r.employeeType})</td>
                        <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">{r.medicalFitnessValidTill}</td>
                        <td className="py-2 px-3">
                          {r.errors.length > 0 ? (
                            <span className="text-rose-600 font-semibold text-[11px] flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 shrink-0" /> {r.errors.join(', ')}
                            </span>
                          ) : (
                            <span className="text-emerald-700 text-[11px] flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 shrink-0" /> Ready to commit
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}

                {selectedType === 'MEDICAL_RECORDS' &&
                  medicalRows
                    .filter((r) => {
                      if (statusFilter === 'VALID') return r.status !== 'INVALID';
                      if (statusFilter === 'INVALID') return r.status === 'INVALID';
                      return true;
                    })
                    .filter(
                      (r) =>
                        r.workerName.toLowerCase().includes(searchFilter.toLowerCase()) ||
                        r.workerId.toLowerCase().includes(searchFilter.toLowerCase()) ||
                        r.department.toLowerCase().includes(searchFilter.toLowerCase())
                    )
                    .map((r) => (
                      <tr key={r.rowNumber} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-slate-400 text-[11px]">{r.rowNumber}</td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              r.status === 'INSERT'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-900">{r.workerId}</td>
                        <td className="py-2 px-3">{r.workerName}</td>
                        <td className="py-2 px-3 text-slate-600">{r.department}</td>
                        <td className="py-2 px-3 text-slate-600 font-semibold">{r.examType} • {r.fitnessResult}</td>
                        <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">{r.validTill}</td>
                        <td className="py-2 px-3">
                          {r.errors.length > 0 ? (
                            <span className="text-rose-600 font-semibold text-[11px] flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 shrink-0" /> {r.errors.join(', ')}
                            </span>
                          ) : (
                            <span className="text-emerald-700 text-[11px] flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 shrink-0" /> Validated under DGMS 29B
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}

                {selectedType === 'STATUTORY_MVT' &&
                  mvtRows
                    .filter((r) => {
                      if (statusFilter === 'VALID') return r.status !== 'INVALID';
                      if (statusFilter === 'INVALID') return r.status === 'INVALID';
                      return true;
                    })
                    .filter(
                      (r) =>
                        r.workerName.toLowerCase().includes(searchFilter.toLowerCase()) ||
                        r.workerId.toLowerCase().includes(searchFilter.toLowerCase()) ||
                        r.department.toLowerCase().includes(searchFilter.toLowerCase())
                    )
                    .map((r) => (
                      <tr key={r.rowNumber} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-slate-400 text-[11px]">{r.rowNumber}</td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              r.status === 'INSERT'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-900">{r.workerId}</td>
                        <td className="py-2 px-3">{r.workerName}</td>
                        <td className="py-2 px-3 text-slate-600">{r.department}</td>
                        <td className="py-2 px-3 text-slate-600">{r.trainingName} ({r.trainingType})</td>
                        <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">{r.validTill}</td>
                        <td className="py-2 px-3">
                          {r.errors.length > 0 ? (
                            <span className="text-rose-600 font-semibold text-[11px] flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 shrink-0" /> {r.errors.join(', ')}
                            </span>
                          ) : (
                            <span className="text-emerald-700 text-[11px] flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 shrink-0" /> Verified MVT Certificate
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}

                {selectedType === 'OTHER_TRAINING' &&
                  otherTrainingRows
                    .filter((r) => {
                      if (statusFilter === 'VALID') return r.status !== 'INVALID';
                      if (statusFilter === 'INVALID') return r.status === 'INVALID';
                      return true;
                    })
                    .filter(
                      (r) =>
                        r.workerName.toLowerCase().includes(searchFilter.toLowerCase()) ||
                        r.workerId.toLowerCase().includes(searchFilter.toLowerCase()) ||
                        r.courseTitle.toLowerCase().includes(searchFilter.toLowerCase())
                    )
                    .map((r) => (
                      <tr key={r.rowNumber} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-slate-400 text-[11px]">{r.rowNumber}</td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              r.status === 'INSERT'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-900">{r.workerId}</td>
                        <td className="py-2 px-3">{r.workerName}</td>
                        <td className="py-2 px-3 text-slate-600">{r.department}</td>
                        <td className="py-2 px-3 text-slate-600">{r.courseTitle} • {r.trainingCategory}</td>
                        <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">{r.endDate}</td>
                        <td className="py-2 px-3">
                          {r.errors.length > 0 ? (
                            <span className="text-rose-600 font-semibold text-[11px] flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 shrink-0" /> {r.errors.join(', ')}
                            </span>
                          ) : (
                            <span className="text-emerald-700 text-[11px] flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 shrink-0" /> Competencies recorded
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Statutory Guidance Notes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-slate-900">DGMS Regulatory Compliance</div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Ingested records are automatically mapped to Mines Vocational Training Rules 1966 & Mines Rules 1955 Rule 29B registers.
            </p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-start gap-3">
          <Building2 className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-slate-900">Preservation of Linked Safety Records</div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Updating worker attributes preserves all historical medical clearances, digital safety passports, and Gate clearance tokens.
            </p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-start gap-3">
          <Clock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-slate-900">Audit Trail Logging</div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Every bulk upload action is timestamped with officer credentials and available in the System Administration Audit Trail.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
