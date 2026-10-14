import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { WorkerClassification, EmploymentType } from '../types';
import { getPersonnelAvatar } from '../utils/avatarUtils';
import { NMDCLogo } from './NMDCLogo';
import {
  UserPlus,
  X,
  CheckCircle2,
  AlertTriangle,
  Building,
  HardHat,
  Calendar,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Phone,
  Mail,
  HeartPulse,
  Truck,
  Eye,
  RefreshCw,
  FileSpreadsheet,
  UploadCloud,
  ArrowRight,
} from 'lucide-react';

export const EmployeeRegistrationModal: React.FC = () => {
  const {
    isRegisterEmployeeOpen,
    setIsRegisterEmployeeOpen,
    registrationInitialType,
    employees,
    contractors,
    addEmployee,
    addContractWorker,
    setViewPassportWorkerId,
    setActiveTab,
  } = useApp();

  // Mode: Regular vs Contract
  const [empType, setEmpType] = useState<EmploymentType>('NMDC_REGULAR');

  // Form Fields
  const [empId, setEmpId] = useState('');
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('1992-05-10');
  const [mobile, setMobile] = useState('+91 ');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Mining');
  const [section, setSection] = useState('Pit-1 HEMM Operations');
  const [designation, setDesignation] = useState('Heavy Machinery Operator');
  const [trade, setTrade] = useState('HEMM Driving');
  const [grade, setGrade] = useState('W-05');
  const [classification, setClassification] = useState<WorkerClassification>('HEMM Operator');
  const [shift, setShift] = useState<'Shift A (06:00-14:00)' | 'Shift B (14:00-22:00)' | 'Shift C (22:00-06:00)' | 'General (09:00-17:30)'>('Shift A (06:00-14:00)');
  const [supervisor, setSupervisor] = useState('Mining Foreman / Incharge');
  const [workLocation, setWorkLocation] = useState('Donimalai Mine Pit-1 Quarry Face');
  const [dateOfJoining, setDateOfJoining] = useState('2026-10-08');
  const [dateOfDeployment, setDateOfDeployment] = useState('2026-10-09');

  // Statutory Medical & Safety fields
  const [medicalExamDate, setMedicalExamDate] = useState('2026-04-01');
  const [medicalFitnessValidTill, setMedicalFitnessValidTill] = useState('2027-04-01');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactMobile, setEmergencyContactMobile] = useState('');

  // Contractor Specific fields (Custom entry, no dropdown)
  const [contractorName, setContractorName] = useState('');
  const [contractorCode, setContractorCode] = useState('');
  const [workOrderNumber, setWorkOrderNumber] = useState('');

  // HEMM Equipment specific (Standard quick-select & custom entry)
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(['BEML BH-100S']);
  const [customEquipmentInput, setCustomEquipmentInput] = useState('');

  // Success State
  const [registeredSuccessWorker, setRegisteredSuccessWorker] = useState<{ id: string; name: string } | null>(null);

  // Sync initial type when opened
  useEffect(() => {
    if (isRegisterEmployeeOpen) {
      setEmpType(registrationInitialType || 'NMDC_REGULAR');
      setRegisteredSuccessWorker(null);
      handleAutoGenerateId(registrationInitialType || 'NMDC_REGULAR');
    }
  }, [isRegisterEmployeeOpen, registrationInitialType]);

  const handleAutoGenerateId = (typeToGen: EmploymentType) => {
    if (typeToGen === 'NMDC_REGULAR') {
      const regCount = employees.filter((e) => e.employeeType === 'NMDC_REGULAR').length;
      setEmpId(`NMDC-EMP-${1000 + regCount + 1}`);
    } else {
      const contCount = employees.filter((e) => e.employeeType === 'CONTRACT_WORKER').length;
      setEmpId(`CONT-WRK-${2000 + contCount + 1}`);
    }
  };

  // Check for duplicate ID
  const isDuplicateId = useMemo(() => {
    if (!empId.trim()) return false;
    return employees.some((e) => e.id.toLowerCase() === empId.trim().toLowerCase());
  }, [empId, employees]);

  // Calculate age
  const calculatedAge = useMemo(() => {
    if (!dateOfBirth) return 0;
    const dob = new Date(dateOfBirth);
    const today = new Date('2026-10-08');
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  }, [dateOfBirth]);

  const handleToggleEquipment = (eq: string) => {
    setSelectedEquipment((prev) =>
      prev.includes(eq) ? prev.filter((item) => item !== eq) : [...prev, eq]
    );
  };

  const handleAddCustomEquipment = () => {
    const trimmed = customEquipmentInput.trim();
    if (!trimmed) return;
    if (!selectedEquipment.includes(trimmed)) {
      setSelectedEquipment((prev) => [...prev, trimmed]);
    }
    setCustomEquipmentInput('');
  };

  const handleRemoveEquipment = (eqToRemove: string) => {
    setSelectedEquipment((prev) => prev.filter((item) => item !== eqToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isDuplicateId) {
      alert(`Error: Employee ID "${empId}" already exists in Donimalai personnel records. Please provide a unique Emp ID.`);
      return;
    }

    if (calculatedAge < 18) {
      alert('Statutory Error: Mines Act 1952 Section 40 strictly prohibits employment of persons under 18 years of age in mines.');
      return;
    }

    const trimmedId = empId.trim();

    if (empType === 'NMDC_REGULAR') {
      const newEmp = addEmployee(
        {
          name: name.trim(),
          photoUrl: getPersonnelAvatar(name.trim(), 'REGULAR'),
          dateOfBirth,
          mobile,
          email: email.trim() || `${name.trim().toLowerCase().replace(/\s+/g, '.')}@nmdc.co.in`,
          department,
          section,
          designation,
          trade,
          grade,
          employeeType: 'NMDC_REGULAR',
          dateOfJoining,
          dateOfDeployment,
          shift,
          supervisor,
          workLocation,
          mine: 'Donimalai Iron Ore Mine',
          employmentStatus: 'ACTIVE',
          classification,
          verificationStatus: 'Verified',
          medicalFitnessDate: medicalExamDate,
          medicalFitnessValidTill,
          assignedEquipment: classification === 'HEMM Operator' ? selectedEquipment : undefined,
          bloodGroup,
          aadhaarNumber,
          emergencyContactName,
          emergencyContactMobile,
        },
        trimmedId
      );

      setRegisteredSuccessWorker({ id: newEmp.id, name: newEmp.name });
    } else {
      const cleanContractorName = contractorName.trim() || 'Contractor Agency';
      const cleanContractorCode = contractorCode.trim() || (workOrderNumber.trim() ? `CONT-${workOrderNumber.replace(/[^A-Za-z0-9]/g, '').substring(0, 8)}` : `CONT-${cleanContractorName.replace(/[^A-Za-z0-9]/g, '').substring(0, 6).toUpperCase() || 'GEN'}`);
      const newWorker = addContractWorker(
        {
          name: name.trim(),
          photoUrl: getPersonnelAvatar(name.trim(), 'CONTRACT'),
          dateOfBirth,
          mobile,
          email: email.trim() || `${name.trim().toLowerCase().replace(/\s+/g, '')}@contractor.in`,
          department,
          section,
          designation,
          trade,
          grade: 'Contract-Skilled',
          dateOfJoining,
          dateOfDeployment,
          shift,
          supervisor: supervisor || 'Contractor Safety Supervisor',
          workLocation,
          mine: 'Donimalai Iron Ore Mine',
          employmentStatus: 'ACTIVE',
          classification,
          contractorCode: cleanContractorCode,
          contractorName: cleanContractorName,
          workOrderNumber: workOrderNumber.trim() || 'WO/NMDC/2026',
          verificationStatus: 'Pending Verification',
          medicalFitnessDate: medicalExamDate,
          medicalFitnessValidTill,
          assignedEquipment: (classification === 'HEMM Operator' || selectedEquipment.length > 0) ? selectedEquipment : undefined,
          bloodGroup,
          aadhaarNumber,
          emergencyContactName,
          emergencyContactMobile,
        },
        trimmedId
      );

      setRegisteredSuccessWorker({ id: newWorker.id, name: newWorker.name });
    }
  };

  const handleResetForNewRegistration = () => {
    setName('');
    setDateOfBirth('1994-06-15');
    setContractorName('');
    setWorkOrderNumber('');
    setSelectedEquipment(['BEML BH-100S']);
    setCustomEquipmentInput('');
    setRegisteredSuccessWorker(null);
    handleAutoGenerateId(empType);
  };

  if (!isRegisterEmployeeOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-6 animate-in zoom-in-95 flex flex-col max-h-[92vh]">
        {/* Modal Header with Official NMDC Emblem */}
        <div className="bg-slate-50 p-4 sm:p-5 border-b border-slate-200 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-white rounded-xl shadow-xs shrink-0 flex items-center justify-center p-0.5 border border-slate-200">
              <NMDCLogo className="h-full w-auto" showText={true} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                  Form B Personnel Master
                </span>
                <span className="text-xs text-slate-500">Mines Rules 1955 · Donimalai Complex</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
                Personnel Registration & MVT Onboarding
              </h2>
            </div>
          </div>

          <button
            onClick={() => setIsRegisterEmployeeOpen(false)}
            className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {registeredSuccessWorker ? (
            /* Success State */
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-300">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Personnel Successfully Registered!
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Record archived in Donimalai personnel database & Form B Vocational Training register.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 max-w-md mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500">Employee ID:</span>
                  <strong className="font-mono text-slate-900 font-bold">{registeredSuccessWorker.id}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500">Full Name:</span>
                  <strong className="text-slate-900">{registeredSuccessWorker.name}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500">Cadre:</span>
                  <strong className="text-slate-900">{empType === 'NMDC_REGULAR' ? 'NMDC Regular Employee' : 'Contractor Worker'}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500">MVT Status:</span>
                  <span className="text-orange-700 font-bold">Rule 6 Initial Training Due</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Digital Safety Passport:</span>
                  <span className="text-emerald-700 font-bold">Generated & QR Activated</span>
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetForNewRegistration}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Register Another Employee
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setViewPassportWorkerId(registeredSuccessWorker.id);
                    setIsRegisterEmployeeOpen(false);
                  }}
                  className="px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Safety Passport</span>
                </button>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              {/* Statutory Alternative to Individual Registration: Bulk Excel Sheet Upload */}
              <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 rounded-xl border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-start gap-2.5">
                  <div className="p-2 bg-emerald-600 text-white rounded-lg shrink-0 mt-0.5 shadow-xs">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.2 rounded">
                        Alternative Registration Method
                      </span>
                      <span className="text-[11px] font-bold text-slate-900">Bulk Workforce Excel Upload</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Need to register multiple employees? Upload the official NMDC Employee Master Excel sheet to instantly register, enroll in Form B, and provision login accounts for all workforce personnel at once.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterEmployeeOpen(false);
                    setActiveTab('excel-upload');
                  }}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-extrabold text-xs flex items-center justify-center gap-1.5 shrink-0 shadow-xs transition-colors cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload Excel Sheet Instead</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Cadre Type Selector */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Select Workforce Cadre:
                </span>
                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setEmpType('NMDC_REGULAR');
                      handleAutoGenerateId('NMDC_REGULAR');
                    }}
                    className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors cursor-pointer ${
                      empType === 'NMDC_REGULAR'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    NMDC Regular Employee
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmpType('CONTRACT_WORKER');
                      handleAutoGenerateId('CONTRACT_WORKER');
                    }}
                    className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors cursor-pointer ${
                      empType === 'CONTRACT_WORKER'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Contract Worker
                  </button>
                </div>
              </div>

              {/* Core Identification: Name, Emp ID, Date of Birth */}
              <div>
                <h3 className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5 border-b border-slate-100 pb-1">
                  <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                  Primary Statutory Identification
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Emp ID with Auto-generate helper */}
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-700">
                        Employee ID <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleAutoGenerateId(empType)}
                        className="text-[10px] text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-0.5 cursor-pointer"
                        title="Auto-generate next sequential code"
                      >
                        <RefreshCw className="w-2.5 h-2.5" />
                        <span>Auto-Gen</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. NMDC-EMP-1009"
                      value={empId}
                      onChange={(e) => setEmpId(e.target.value)}
                      className={`w-full bg-slate-50 text-xs text-slate-900 font-mono font-bold px-3 py-2 rounded-lg border mt-1 focus:bg-white focus:outline-none ${
                        isDuplicateId
                          ? 'border-rose-400 focus:border-rose-500 bg-rose-50/40'
                          : 'border-slate-300 focus:border-amber-500'
                      }`}
                      required
                    />
                    {isDuplicateId ? (
                      <span className="text-[10px] text-rose-600 font-semibold block mt-0.5">
                        Duplicate ID: Already exists in records!
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Unique personnel code
                      </span>
                    )}
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="font-bold text-slate-700">
                      Full Legal Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter worker's full legal name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1 focus:bg-white focus:border-amber-500 focus:outline-none"
                      required
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      As per official identity records
                    </span>
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-700">
                        Date of Birth <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] text-slate-500 font-semibold">
                        Age: {calculatedAge} yrs
                      </span>
                    </div>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className={`w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border mt-1 focus:bg-white focus:outline-none ${
                        calculatedAge < 18
                          ? 'border-rose-400 focus:border-rose-500'
                          : 'border-slate-300 focus:border-amber-500'
                      }`}
                      required
                    />
                    {calculatedAge < 18 ? (
                      <span className="text-[10px] text-rose-600 font-semibold block mt-0.5">
                        Statutory minimum age is 18 years!
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">
                        Eligible under Mines Act 1952
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Department, Designation & Classification */}
              <div>
                <h3 className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5 border-b border-slate-100 pb-1">
                  <Building className="w-3.5 h-3.5 text-amber-600" />
                  Deployment & Trade Classification
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700">Department</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1 focus:bg-white"
                    >
                      <option value="Mining">Mining</option>
                      <option value="Mechanical Services">Mechanical Services</option>
                      <option value="Electrical Services">Electrical Services</option>
                      <option value="Production">Production</option>
                      <option value="Safety">Safety</option>
                      <option value="Beneficiation">Beneficiation</option>
                      <option value="Administration">Administration</option>
                      <option value="Medical">Medical</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700">Designation</label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Dumper Operator"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1 focus:bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700">DGMS Classification</label>
                    <select
                      value={classification}
                      onChange={(e) => setClassification(e.target.value as WorkerClassification)}
                      className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1 focus:bg-white font-semibold"
                    >
                      <option value="HEMM Operator">HEMM Operator (High-Risk)</option>
                      <option value="Blaster/Shotfirer">Blaster/Shotfirer (High-Risk)</option>
                      <option value="Operator">Operator</option>
                      <option value="Technician">Technician</option>
                      <option value="Skilled Worker">Skilled Worker</option>
                      <option value="Electrical Personnel">Electrical Personnel</option>
                      <option value="Maintenance Personnel">Maintenance Personnel</option>
                      <option value="General Worker">General Worker</option>
                      <option value="Supervisor">Supervisor</option>
                      <option value="Statutory Person">Statutory Person</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                  <div>
                    <label className="font-bold text-slate-700">Section / Mining Bench</label>
                    <input
                      type="text"
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1 focus:bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700">Shift</label>
                    <select
                      value={shift}
                      onChange={(e) => setShift(e.target.value as any)}
                      className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1 focus:bg-white"
                    >
                      <option value="Shift A (06:00-14:00)">Shift A (06:00-14:00)</option>
                      <option value="Shift B (14:00-22:00)">Shift B (14:00-22:00)</option>
                      <option value="Shift C (22:00-06:00)">Shift C (22:00-06:00)</option>
                      <option value="General (09:00-17:30)">General (09:00-17:30)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700">Grade / Cadre</label>
                    <input
                      type="text"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1 focus:bg-white"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Contractor Master Association (If Contractor Worker) */}
              {empType === 'CONTRACT_WORKER' && (
                <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-amber-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <HardHat className="w-3.5 h-3.5 text-amber-700" />
                      Contractor Agency & Work Order Information
                    </h3>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                      Custom Entry
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700">
                        Contracting Company <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={contractorName}
                        onChange={(e) => setContractorName(e.target.value)}
                        placeholder="Enter custom contracting company name..."
                        className="w-full bg-white text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1 font-medium focus:outline-none focus:border-amber-500 focus:bg-white"
                        required
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        Custom contractor firm, agency or vendor name
                      </span>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700">Work Order Reference</label>
                      <input
                        type="text"
                        value={workOrderNumber}
                        onChange={(e) => setWorkOrderNumber(e.target.value)}
                        placeholder="e.g. WO/NMDC/DNM/2026/042"
                        className="w-full bg-white text-xs text-slate-900 font-mono px-3 py-2 rounded-lg border border-slate-300 mt-1 focus:outline-none focus:border-amber-500"
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        Statutory work order or service agreement number
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* HEMM Machinery Authorization (If HEMM Operator or Operator Trade) */}
              {(classification === 'HEMM Operator' || trade.toLowerCase().includes('hemm') || trade.toLowerCase().includes('dumper') || trade.toLowerCase().includes('driving') || selectedEquipment.length > 0) && (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-amber-600" />
                      Assigned Heavy Machinery (DGMS Tech Circular 04/2020)
                    </h3>
                    <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {selectedEquipment.length} Selected
                    </span>
                  </div>

                  {/* Standard Quick-Pick Presets */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      Quick-Select Standard HEMM Models:
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[
                        'BEML BH-100S (100T Dumper)',
                        'Tata Hitachi EX-1200 (Excavator)',
                        'BEML BD-355 (Crawler Dozer)',
                        'Komatsu WA600 (Wheel Loader)',
                        'Epiroc IDM-45 (Blast Hole Drill)',
                        'Hitachi EX1900 (Electric Shovel)',
                        'BEML BG825 (Motor Grader)',
                      ].map((eq) => {
                        const modelTag = eq.split(' (')[0];
                        const isSel = selectedEquipment.includes(modelTag);
                        return (
                          <button
                            key={eq}
                            type="button"
                            onClick={() => handleToggleEquipment(modelTag)}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                              isSel
                                ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold shadow-2xs'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            {isSel ? '✓ ' : '+ '}
                            {eq}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Machinery Entry */}
                  <div className="pt-2 border-t border-slate-200">
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Custom Machinery Entry:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customEquipmentInput}
                        onChange={(e) => setCustomEquipmentInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomEquipment();
                          }
                        }}
                        placeholder="Enter custom machinery model / make (e.g. Caterpillar 777D, Sany SY500H, Volvo FMX 460...)"
                        className="flex-1 bg-white text-xs text-slate-900 px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500 focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomEquipment}
                        disabled={!customEquipmentInput.trim()}
                        className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-200 disabled:text-slate-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        <span>+ Add Machinery</span>
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Type any custom HEMM equipment or vehicle model and click Add Machinery.
                    </span>
                  </div>

                  {/* Currently Selected Machinery Badges */}
                  {selectedEquipment.length > 0 && (
                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                        Authorized Machinery for this Operator:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedEquipment.map((eq) => (
                          <span
                            key={eq}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold rounded-md shadow-2xs"
                          >
                            <Truck className="w-3.5 h-3.5 text-amber-700" />
                            <span>{eq}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveEquipment(eq)}
                              className="text-amber-700 hover:text-rose-600 hover:bg-rose-50 p-0.5 rounded cursor-pointer transition-colors"
                              title={`Remove ${eq}`}
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Contact, Medical & Emergency Details */}
              <div>
                <h3 className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5 border-b border-slate-100 pb-1">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
                  Statutory Medical & Emergency Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="font-bold text-slate-700">Mobile Number</label>
                    <input
                      type="text"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700">Blood Group</label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1 font-bold"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700">Medical Fitness Valid Till</label>
                    <input
                      type="date"
                      value={medicalFitnessValidTill}
                      onChange={(e) => setMedicalFitnessValidTill(e.target.value)}
                      className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700">Aadhaar (Last 4 Digits)</label>
                    <input
                      type="text"
                      placeholder="XXXX-XXXX-1234"
                      value={aadhaarNumber}
                      onChange={(e) => setAadhaarNumber(e.target.value)}
                      className="w-full bg-slate-50 text-xs text-slate-900 font-mono px-3 py-2 rounded-lg border border-slate-300 mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="font-bold text-slate-700">Emergency Contact Person</label>
                    <input
                      type="text"
                      placeholder="e.g. Smt. Lakshmi (Spouse)"
                      value={emergencyContactName}
                      onChange={(e) => setEmergencyContactName(e.target.value)}
                      className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700">Emergency Contact Phone</label>
                    <input
                      type="text"
                      placeholder="+91 94480 00000"
                      value={emergencyContactMobile}
                      onChange={(e) => setEmergencyContactMobile(e.target.value)}
                      className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Form Footer */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Form B Register · Automatic MVT Rule 6 initial training record created
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRegisterEmployeeOpen(false)}
                    className="px-4 py-2 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isDuplicateId || calculatedAge < 18}
                    className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 rounded-lg transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Register Employee & Initialize MVT</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
