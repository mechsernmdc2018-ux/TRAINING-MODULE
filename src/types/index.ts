export type UserRole =
  | 'Super Administrator'
  | 'Training Officer'
  | 'Safety Officer'
  | 'Medical Officer'
  | 'Authorized Medical Personnel'
  | 'Mine Manager'
  | 'Department Head'
  | 'Supervisor'
  | 'Contractor Administrator'
  | 'Trainer'
  | 'Employee'
  | 'Management Viewer'
  | 'Auditor';

export type Permission =
  | 'View'
  | 'Create'
  | 'Edit'
  | 'Approve'
  | 'Verify'
  | 'Schedule'
  | 'Conduct'
  | 'Assess'
  | 'Issue Certificate'
  | 'Export'
  | 'Configure'
  | 'Administer';

export type WorkerClassification =
  | 'General Worker'
  | 'Skilled Worker'
  | 'Operator'
  | 'Technician'
  | 'Supervisor'
  | 'Statutory Person'
  | 'HEMM Operator'
  | 'Electrical Personnel'
  | 'Blaster/Shotfirer'
  | 'Maintenance Personnel'
  | 'Other';

export type EmploymentType = 'NMDC_REGULAR' | 'CONTRACT_WORKER';

export type EmploymentStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export type VerificationStatus = 'Pending Verification' | 'Verified' | 'Rejected' | 'Expired';

export type ComplianceStatus = 'VALID' | 'DUE_SOON' | 'DUE' | 'OVERDUE' | 'NOT_APPLICABLE' | 'VERIFICATION_REQUIRED';

export type DeploymentStatus = 'CLEARED' | 'CONDITIONAL' | 'NOT_CLEARED';

export interface Employee {
  id: string; // NMDC-EMP-XXXX or CONT-WRK-XXXX
  name: string;
  photoUrl: string;
  dateOfBirth: string;
  mobile: string;
  email: string;
  department: string;
  section: string;
  designation: string;
  trade: string;
  grade: string;
  employeeType: EmploymentType;
  dateOfJoining: string;
  dateOfDeployment: string;
  shift: 'Shift A (06:00-14:00)' | 'Shift B (14:00-22:00)' | 'Shift C (22:00-06:00)' | 'General (09:00-17:30)';
  supervisor: string;
  workLocation: string; // e.g. Donimalai Mine Pit 1, Screening Plant, Loading Plant, Central Workshop
  mine: string; // Donimalai Iron Ore Mine
  employmentStatus: EmploymentStatus;
  classification: WorkerClassification;
  contractorCode?: string;
  contractorName?: string;
  workOrderNumber?: string;
  verificationStatus: VerificationStatus;
  medicalFitnessDate: string;
  medicalFitnessValidTill: string;
  assignedEquipment?: string[]; // e.g. ['BEML BH-100S', 'Tata Hitachi EX-1200']
  bloodGroup?: string;
  emergencyContactName?: string;
  emergencyContactMobile?: string;
  aadhaarNumber?: string;
}

export interface Contractor {
  id: string;
  code: string;
  name: string;
  workOrderNumber: string;
  workOrderStartDate: string;
  workOrderEndDate: string;
  scopeOfWork: string;
  department: string;
  contractManager: string;
  safetyOfficer: string;
  representative: string;
  contactNumber: string;
  email: string;
  approvedManpower: number;
  currentManpower: number;
  contractStatus: 'Active' | 'Pending Renewal' | 'Expired' | 'Suspended';
}

export interface StatutoryRequirement {
  id: string;
  actCode: string; // e.g. "Mines Act 1952 / Mines Vocational Training Rules 1966"
  ruleRegulation: string; // e.g. "Rule 6 / Rule 9 - Periodic Training"
  dgmsReference: string; // e.g. "DGMS(Tech) Circular No. 04 of 2020"
  circularNumber: string;
  issueDate: string;
  effectiveDate: string;
  trainingRequirement: string;
  applicableWorkerCategory: WorkerClassification[] | 'ALL';
  applicableEquipment?: string[];
  applicableActivity: string;
  frequencyMonths: number;
  validityMonths: number;
  minimumDurationHours: number;
  assessmentRequired: boolean;
  certificateRequired: boolean;
  evidenceRequired: string;
  responsibleDepartment: string;
  status: 'ACTIVE' | 'SUPERSEDED' | 'PENDING_VERIFICATION' | 'ARCHIVED';
  version: string;
  supersededBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MVTHistoryRecord {
  id: string;
  workerId: string;
  trainingName: string;
  trainingType: 'Initial' | 'Refresher' | 'Special' | 'Induction';
  completionDate: string;
  validTill: string;
  trainerName: string;
  attendanceScore: string;
  assessmentResult: 'PASS' | 'FAIL' | 'EXEMPT';
  certificateNumber: string;
  statutoryRuleApplied: string;
  verifiedBy: string;
}

export interface MVTStatus {
  workerId: string;
  applicable: boolean;
  applicabilityStatus: 'APPLICABLE' | 'NOT_APPLICABLE' | 'VERIFICATION_REQUIRED';
  applicableRule: string;
  lastMVTDate: string | null;
  nextMVTDueDate: string | null;
  daysRemaining: number;
  daysOverdue: number;
  status: ComplianceStatus;
  history: MVTHistoryRecord[];
}

export type TrainingCategory =
  | 'MVT (Statutory)'
  | 'HEMM & Equipment'
  | 'Mine Safety & Hazards'
  | 'Electrical & Mechanical Safety'
  | 'Fire & Emergency Response'
  | 'Occupational Health & First Aid'
  | 'Blasting & Explosives Safety'
  | 'Environmental Management'
  | 'SOP & Special Procedures';

export type TrainingType =
  | 'Initial'
  | 'Refresher'
  | 'Special'
  | 'Induction'
  | 'Equipment Training'
  | 'HEMM'
  | 'Fire Safety'
  | 'First Aid'
  | 'Electrical Safety'
  | 'Explosives Safety'
  | 'Emergency Response'
  | 'Environmental Safety'
  | 'Occupational Health'
  | 'Defensive Driving'
  | 'Traffic Management'
  | 'Toolbox Talk'
  | 'Mock Drill'
  | 'Behaviour-Based Safety'
  | 'Other';

export interface TrainingProgram {
  id: string;
  code: string;
  title: string;
  category: TrainingCategory;
  type: TrainingType;
  description: string;
  durationHours: number;
  deliveryMode: 'Classroom' | 'Field Practical' | 'Simulated Simulator' | 'Hybrid (Theory + Practical)';
  applicableWorkerCategories: WorkerClassification[];
  applicableContractorCategories: string[];
  assessmentRequired: boolean;
  certificateRequired: boolean;
  validityMonths: number;
  renewalPeriodMonths: number;
  trainerType: 'Internal Senior Officer' | 'DGMS Empanelled External' | 'OEM Specialist (BEML/Hitachi)' | 'Safety Officer';
  department: string;
  equipmentApplicable?: string;
  isStatutory: boolean;
  statutoryReference?: string;
  passMarkPercent: number;
}

export interface TrainingSession {
  id: string;
  programId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  trainerName: string;
  trainerType: string;
  capacity: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  nominatedWorkerIds: string[];
  attendanceCount?: number;
  qrCodeToken: string;
  notes?: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  workerId: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  markedAt: string;
  method: 'MANUAL' | 'QR_CODE' | 'BIOMETRIC_SIM';
  markedBy: string;
  remarks?: string;
}

export interface AssessmentQuestion {
  id: string;
  topic: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  difficulty: 'Basic' | 'Intermediate' | 'Statutory Standard';
}

export interface AssessmentAttempt {
  id: string;
  sessionId: string;
  programId: string;
  workerId: string;
  scorePercent: number;
  passMark: number;
  passed: boolean;
  attemptDate: string;
  attemptNumber: number;
  evaluator: string;
}

export interface Certificate {
  id: string;
  certificateNumber: string;
  workerId: string;
  workerName: string;
  trainingTitle: string;
  category: string;
  issueDate: string;
  validUntil: string;
  durationHours: number;
  trainerName: string;
  status: 'VALID' | 'EXPIRED' | 'REVOKED';
  qrVerificationUrl: string;
  approverName: string;
  approverDesignation: string;
}

export interface HEMMCompetency {
  id: string;
  workerId: string;
  equipmentModel: string; // e.g. BEML BH-100S, Tata Hitachi EX-1200
  authorisationNumber: string;
  preStartInspection: 'SATISFACTORY' | 'NEEDS_IMPROVEMENT';
  ppeCompliance: 'SATISFACTORY' | 'NEEDS_IMPROVEMENT';
  brakeCheck: 'SATISFACTORY' | 'NEEDS_IMPROVEMENT';
  steeringCheck: 'SATISFACTORY' | 'NEEDS_IMPROVEMENT';
  hornLightAlarm: 'SATISFACTORY' | 'NEEDS_IMPROVEMENT';
  seatBeltSafeOperation: 'SATISFACTORY' | 'NEEDS_IMPROVEMENT';
  haulRoadTrafficRules: 'SATISFACTORY' | 'NEEDS_IMPROVEMENT';
  parkingDumpingTechnique: 'SATISFACTORY' | 'NEEDS_IMPROVEMENT';
  emergencyResponse: 'SATISFACTORY' | 'NEEDS_IMPROVEMENT';
  overallScorePercent: number;
  result: 'COMPETENT' | 'NOT_COMPETENT' | 'REASSESSMENT_REQUIRED';
  evaluatedBy: string;
  evaluatedDate: string;
  validUntil: string;
  status: 'VALID' | 'DUE_SOON' | 'EXPIRED';
  remarks?: string;
}

export interface DeploymentClearance {
  workerId: string;
  status: DeploymentStatus;
  reasons: string[];
  override?: {
    overriddenBy: string;
    reason: string;
    timestamp: string;
    validUntil: string;
    remarks: string;
  } | null;
  lastCheckedAt: string;
}

export interface ToolboxTalk {
  id: string;
  topic: string;
  date: string;
  shift: string;
  location: string;
  supervisorName: string;
  department: string;
  participantCount: number;
  participantIds: string[];
  keySafetyObservations: string;
  correctiveActions: string;
  photoUrl?: string;
  status: 'LOGGED' | 'VERIFIED';
}

export interface MockDrill {
  id: string;
  drillType: 'Mine Pit Evacuation' | 'HEMM Fire Emergency' | 'First Aid & Triage' | 'Electrical Substation Emergency' | 'Monsoon Landslide Response';
  date: string;
  location: string;
  scenario: string;
  responseTimeMinutes: number;
  participantCount: number;
  leadEvaluator: string;
  observations: string;
  gapsIdentified: string;
  correctiveActions: string;
  status: 'COMPLETED' | 'REPORT_SUBMITTED' | 'CLOSED';
}

export interface AuditFinding {
  id: string;
  checklistCategory: 'Statutory Registers' | 'MVT Compliance' | 'HEMM Competency' | 'Contractor Compliance' | 'Safety Training Infrastructure' | 'Toolbox & Induction Records';
  findingDescription: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  responsiblePerson: string;
  dueDate: string;
  correctiveAction: string;
  evidenceNotes?: string;
  status: 'OPEN' | 'UNDER_ACTION' | 'SUBMITTED' | 'VERIFIED' | 'CLOSED';
  actionAssignedDate: string;
  closedDate?: string;
}

export interface DocumentItem {
  id: string;
  documentNumber: string;
  title: string;
  category: 'DGMS Circular' | 'NMDC SOP' | 'Statutory Act/Rule' | 'Training Module' | 'Technical Guidelines';
  date: string;
  effectiveDate: string;
  subject: string;
  applicability: string;
  version: string;
  fileSize: string;
  status: 'ACTIVE' | 'SUPERSEDED' | 'ARCHIVED';
  supersededBy?: string;
  downloadUrl?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  oldValue?: string;
  newValue?: string;
}

export interface SystemSettings {
  mvtAdvanceAlertDays: number[]; // e.g. [90, 60, 30, 15, 7, 1]
  trainingAdvanceAlertDays: number[];
  contractorComplianceThresholdPercent: number; // e.g. 85%
  assessmentPassingPercentage: number; // e.g. 70%
  certificateNumberPrefix: string; // e.g. "NMDC-DNM-CERT-"
  medicalFitnessValidityMonths: number;
  ssoEnabled: boolean;
  biometricIntegrationReady: boolean;
}

// ----------------------------------------------------
// Medical Examination Module (Mines Rules 1955 Rule 29B)
// ----------------------------------------------------

export type MedicalExamType = 'IME' | 'PME';
export type MedicalFitnessResult = 'FIT' | 'UNFIT' | 'TEMPORARILY_UNFIT' | 'FIT_WITH_RESTRICTION';
export type MedicalExamStatus = 'COMPLETED' | 'SCHEDULED' | 'OVERDUE' | 'DUE_SOON' | 'APPEAL_PENDING';
export type PersonnelCategory = 'REGULAR_EXECUTIVE' | 'REGULAR_WORKMAN' | 'CONTRACTOR_WORKMAN';

export interface MedicalRecord {
  id: string;
  workerId: string;
  workerName: string;
  workerDesignation: string;
  workerDepartment: string;
  workerCategory: PersonnelCategory;
  workerAge: number;
  dateOfBirth: string;
  examType: MedicalExamType; // Initial or Periodical
  examStatus: MedicalExamStatus;
  scheduledDate: string;
  completedDate: string | null;
  validTill: string;
  nextDueDate: string;
  certificateNumber: string; // e.g. FORM-O/NMDC/2026/089
  examiningDoctor: string;
  doctorRegistrationNo: string;
  fitnessResult: MedicalFitnessResult;

  // DGMS Statutory Notice Reference (Form M & N)
  formMNoticeNumber?: string | null;
  formMNoticeDate?: string | null;
  formNNoticeNumber?: string | null;
  formNNoticeDate?: string | null;
  statutoryRuleReference: string; // 'Mines Rules 1955 - Rule 29B'
  ruleVersion: string; // e.g. 'DGMS Gazette Notification 2021'

  // Non-sensitive summary (visible to All authorized users)
  publicFitnessIndicator: string; // 'Fit for Opencast Heavy Mining Duties'
  restrictionNotes?: string; // e.g. 'Must wear corrective spectacles during HEMM operation'

  // Sensitive Clinical Examination Data (STRICTLY restricted to Medical Officer & System Admin)
  chestXRayResult?: 'NORMAL' | 'PNEUMOCONIOSIS_CATEGORY_1' | 'SUSPICIOUS' | 'CLEAR';
  chestXRayDate?: string;
  audiometryResult?: 'NORMAL_HEARING' | 'MILD_HIGH_FREQ_LOSS' | 'NOISE_INDUCED_HEARING_LOSS';
  lungSpirometryFvc?: string; // e.g. '3.9 L (98% of predicted)'
  bloodPressure?: string; // e.g. '120/80 mmHg'
  bloodSugarFasting?: string; // e.g. '92 mg/dL'
  visualAcuity?: string; // e.g. '6/6 (with glasses)'
  clinicalObservations?: string; // Doctor's private medical notes
  sensitiveDiagnosisNotes?: string;
  confidentialPrescriptions?: string;
}

export interface StatutoryRuleVersion {
  id: string;
  ruleCode: string; // e.g. 'RULE-29B-PME'
  ruleTitle: string;
  governingAct: string; // e.g. 'Mines Act 1952 / Mines Rules 1955'
  gazetteReference: string; // e.g. 'GSR 1886 dt. 20-12-1965 / DGMS Cir 01 of 2021'
  officialCircularNumber: string;
  version: string;
  effectiveDate: string;
  periodicityMonthsUnder45: number; // 60 months (5 years)
  periodicityMonthsOver45: number; // 36 months (3 years)
  highRiskPeriodicityMonths?: number; // 12-24 months
  prescribedForms: string[]; // ['Form M', 'Form N', 'Form O']
  status: 'ACTIVE' | 'SUPERSEDED' | 'PROPOSED';
  summary: string;
  notes?: string;
}

export interface MedicalNotice {
  id: string;
  workerId: string;
  workerName: string;
  noticeType: 'FORM_M_INITIAL' | 'FORM_M_PERIODICAL' | 'FORM_N_REEXAMINATION' | 'COMPLIANCE_REMINDER';
  noticeNumber: string;
  issueDate: string;
  examScheduledDate: string;
  venue: string;
  servedBy: string;
  status: 'ISSUED' | 'ACKNOWLEDGED' | 'COMPLIED' | 'OVERDUE';
  remarks?: string;
}

// ----------------------------------------------------
// Other Training Records (OEM, Internal, External, International)
// ----------------------------------------------------

export type OtherTrainingCategory = 'OEM' | 'INTERNAL' | 'EXTERNAL' | 'INTERNATIONAL';
export type TrainingApprovalStatus = 'APPROVED' | 'PENDING_HOD_APPROVAL' | 'REJECTED';
export type TrainingCompletionStatus = 'COMPLETED' | 'ONGOING' | 'NOMINATED' | 'DROPPED';

export interface OtherTrainingRecord {
  id: string;
  workerId: string;
  workerName: string;
  workerDepartment: string;
  workerDesignation: string;
  workerCategory: PersonnelCategory;
  trainingCategory: OtherTrainingCategory;
  courseTitle: string;
  trainingProvider: string; // e.g. 'BEML Training Institute', 'Tata Hitachi', 'IIT Kharagpur'
  venue: string;
  startDate: string;
  endDate: string;
  durationHours: number;
  durationDays: number;
  costInr: number;
  financialYear: string; // e.g. '2026-27'
  attendanceStatus: 'PRESENT' | 'PARTIAL' | 'ABSENT';
  completionStatus: TrainingCompletionStatus;
  approvalStatus: TrainingApprovalStatus;
  approvingAuthority: string;
  certificateNumber: string;
  certificateUrl?: string;
  skillsLearned: string[];
  remarks?: string;
  createdAt: string;
}

// ----------------------------------------------------
// Employee Master Excel Import Types
// ----------------------------------------------------

export interface ExcelImportRow {
  rowNumber: number;
  status: 'INSERT' | 'UPDATE' | 'INVALID' | 'SKIPPED';
  action: string;
  employeeId: string;
  name: string;
  employeeType: EmploymentType;
  workerCategory: PersonnelCategory;
  department: string;
  section: string;
  designation: string;
  trade: string;
  grade: string;
  dateOfBirth: string;
  mobile: string;
  email: string;
  shift: Employee['shift'];
  workLocation: string;
  contractorName?: string;
  workOrderNumber?: string;
  medicalFitnessValidTill: string;
  errors: string[];
  existingRecord?: Employee;
}

export interface ExcelImportSummary {
  fileName: string;
  totalRows: number;
  insertedCount: number;
  updatedCount: number;
  skippedCount: number;
  rejectedCount: number;
  processedAt: string;
  committed: boolean;
}

// ----------------------------------------------------
// Operational Records Bulk Excel Import Types (Medical, Other Training, Statutory MVT)
// ----------------------------------------------------

export interface MedicalRecordImportRow {
  rowNumber: number;
  status: 'INSERT' | 'UPDATE' | 'INVALID';
  workerId: string;
  workerName: string;
  department: string;
  examType: MedicalExamType;
  examDate: string;
  fitnessResult: MedicalFitnessResult;
  validTill: string;
  nextDueDate: string;
  certificateNumber: string;
  examiningDoctor: string;
  doctorRegistrationNo: string;
  statutoryRuleReference: string;
  publicFitnessIndicator: string;
  restrictionNotes?: string;
  errors: string[];
}

export interface OtherTrainingImportRow {
  rowNumber: number;
  status: 'INSERT' | 'UPDATE' | 'INVALID';
  workerId: string;
  workerName: string;
  department: string;
  trainingCategory: OtherTrainingCategory;
  courseTitle: string;
  trainingProvider: string;
  venue: string;
  startDate: string;
  endDate: string;
  durationHours: number;
  costInr: number;
  financialYear: string;
  completionStatus: TrainingCompletionStatus;
  certificateNumber: string;
  skillsLearned: string;
  errors: string[];
}

export interface MVTRecordImportRow {
  rowNumber: number;
  status: 'INSERT' | 'UPDATE' | 'INVALID';
  workerId: string;
  workerName: string;
  department: string;
  trainingType: 'Initial' | 'Refresher' | 'Special' | 'Induction';
  trainingName: string;
  completionDate: string;
  validTill: string;
  trainerName: string;
  attendanceScore: string;
  assessmentResult: 'PASS' | 'FAIL' | 'EXEMPT';
  certificateNumber: string;
  statutoryRuleApplied: string;
  errors: string[];
}

export type RecordUploadType =
  | 'EMPLOYEE_MASTER'
  | 'STATUTORY_MVT'
  | 'MEDICAL_RECORDS'
  | 'OTHER_TRAINING';

export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  designation: string;
  department: string;
  employeeId?: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
}

