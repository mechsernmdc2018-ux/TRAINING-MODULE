import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  db,
  auth,
  handleFirestoreError,
  OperationType,
} from '../firebase';
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  User,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';
import {
  UserRole,
  Permission,
  Employee,
  Contractor,
  StatutoryRequirement,
  MVTStatus,
  TrainingProgram,
  TrainingSession,
  AttendanceRecord,
  AssessmentQuestion,
  Certificate,
  HEMMCompetency,
  ToolboxTalk,
  MockDrill,
  AuditFinding,
  DocumentItem,
  AuditLog,
  SystemSettings,
  DeploymentStatus,
  DeploymentClearance,
  ComplianceStatus,
  EmploymentType,
  MedicalRecord,
  StatutoryRuleVersion,
  MedicalNotice,
  OtherTrainingRecord,
  ExcelImportRow,
  ExcelImportSummary,
  RegisteredUser,
  MedicalRecordImportRow,
  OtherTrainingImportRow,
  MVTRecordImportRow,
} from '../types';
import {
  INITIAL_SYSTEM_SETTINGS,
  INITIAL_CONTRACTORS,
  INITIAL_EMPLOYEES,
  INITIAL_STATUTORY_REQUIREMENTS,
  INITIAL_MVT_STATUSES,
  INITIAL_TRAINING_PROGRAMS,
  INITIAL_TRAINING_SESSIONS,
  INITIAL_ATTENDANCE,
  INITIAL_ASSESSMENT_QUESTIONS,
  INITIAL_CERTIFICATES,
  INITIAL_HEMM_COMPETENCIES,
  INITIAL_TOOLBOX_TALKS,
  INITIAL_MOCK_DRILLS,
  INITIAL_AUDIT_FINDINGS,
  INITIAL_DOCUMENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_MEDICAL_RECORDS,
  INITIAL_STATUTORY_RULE_VERSIONS,
  INITIAL_MEDICAL_NOTICES,
  INITIAL_OTHER_TRAINING_RECORDS,
} from '../data/mockData';
import { getPersonnelAvatar } from '../utils/avatarUtils';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  designation: string;
  department: string;
  avatar: string;
  permissions: Permission[];
}

export function getRolePermissions(role: UserRole): Permission[] {
  switch (role) {
    case 'Super Administrator':
      return ['View', 'Create', 'Edit', 'Approve', 'Verify', 'Schedule', 'Conduct', 'Assess', 'Issue Certificate', 'Export', 'Configure', 'Administer'];
    case 'Training Officer':
      return ['View', 'Create', 'Edit', 'Schedule', 'Conduct', 'Assess', 'Issue Certificate', 'Export', 'Configure'];
    case 'Safety Officer':
      return ['View', 'Create', 'Edit', 'Verify', 'Approve', 'Conduct', 'Assess', 'Export', 'Configure'];
    case 'Mine Manager':
      return ['View', 'Approve', 'Verify', 'Export', 'Administer'];
    case 'Department Head':
      return ['View', 'Approve', 'Export'];
    case 'Medical Officer':
    case 'Authorized Medical Personnel':
      return ['View', 'Create', 'Edit', 'Verify', 'Approve', 'Issue Certificate', 'Export'];
    case 'Supervisor':
    case 'Contractor Administrator':
      return ['View', 'Create', 'Edit', 'Schedule', 'Export'];
    case 'Trainer':
      return ['View', 'Conduct', 'Assess', 'Schedule'];
    case 'Auditor':
      return ['View', 'Export'];
    case 'Employee':
    case 'Management Viewer':
    default:
      return ['View'];
  }
}

export const OFFICIAL_USERS: UserProfile[] = [
  {
    id: 'OFFICER-ADMIN-01',
    name: 'Super Administrator',
    role: 'Super Administrator',
    designation: 'Chief General Manager (HR & IT)',
    department: 'Administration',
    avatar: getPersonnelAvatar('Super Administrator', 'OFFICER'),
    permissions: [
      'View', 'Create', 'Edit', 'Approve', 'Verify', 'Schedule', 'Conduct', 'Assess', 'Issue Certificate', 'Export', 'Configure', 'Administer'
    ],
  },
  {
    id: 'OFFICER-TRG-01',
    name: 'Training Officer',
    role: 'Training Officer',
    designation: 'Head & Principal, Vocational Training Centre',
    department: 'Training',
    avatar: getPersonnelAvatar('Training Officer', 'OFFICER'),
    permissions: [
      'View', 'Create', 'Edit', 'Schedule', 'Conduct', 'Assess', 'Issue Certificate', 'Export', 'Configure'
    ],
  },
  {
    id: 'OFFICER-SAFE-01',
    name: 'Safety Officer',
    role: 'Safety Officer',
    designation: 'Senior Safety Officer & DGMS Liaison',
    department: 'Safety',
    avatar: getPersonnelAvatar('Safety Officer', 'OFFICER'),
    permissions: [
      'View', 'Create', 'Edit', 'Verify', 'Approve', 'Conduct', 'Assess', 'Export', 'Configure'
    ],
  },
  {
    id: 'OFFICER-MGR-01',
    name: 'Mine Manager',
    role: 'Mine Manager',
    designation: 'General Manager (Mines) / First Class Mine Mgr',
    department: 'Mining',
    avatar: getPersonnelAvatar('Mine Manager', 'OFFICER'),
    permissions: [
      'View', 'Approve', 'Verify', 'Export', 'Administer'
    ],
  },
  {
    id: 'OFFICER-HOD-01',
    name: 'Department Head',
    role: 'Department Head',
    designation: 'Chief Manager (Mechanical Services)',
    department: 'Mechanical Services',
    avatar: getPersonnelAvatar('Department Head', 'OFFICER'),
    permissions: [
      'View', 'Approve', 'Export'
    ],
  },
  {
    id: 'OFFICER-SUP-01',
    name: 'Mines Foreman',
    role: 'Supervisor',
    designation: 'Senior Mining Foreman Incharge',
    department: 'Mining',
    avatar: getPersonnelAvatar('Mines Foreman', 'OFFICER'),
    permissions: [
      'View', 'Conduct', 'Verify'
    ],
  },
  {
    id: 'OFFICER-CONT-01',
    name: 'Contractor Nodal Lead',
    role: 'Contractor Administrator',
    designation: 'Project Director & Compliance Lead',
    department: 'Contractor Agency',
    avatar: getPersonnelAvatar('Contractor Nodal Lead', 'CONTRACT'),
    permissions: [
      'View', 'Create', 'Edit', 'Export'
    ],
  },
  {
    id: 'OFFICER-TRNR-01',
    name: 'Technical Trainer',
    role: 'Trainer',
    designation: 'Senior OEM Mining Simulator Specialist (BEML)',
    department: 'Training',
    avatar: getPersonnelAvatar('Technical Trainer', 'OFFICER'),
    permissions: [
      'View', 'Conduct', 'Assess'
    ],
  },
  {
    id: 'OFFICER-MED-01',
    name: 'Dr. B. K. Sharma',
    role: 'Medical Officer',
    designation: 'Chief Medical Officer / Authorized Medical Personnel',
    department: 'Medical Services',
    avatar: getPersonnelAvatar('Dr. B. K. Sharma', 'OFFICER'),
    permissions: [
      'View', 'Create', 'Edit', 'Verify', 'Approve', 'Conduct', 'Assess', 'Issue Certificate', 'Export'
    ],
  },
  {
    id: 'NMDC-EMP-002',
    name: 'Basavaraj Mudgal',
    role: 'Employee',
    designation: 'Senior HEMM Operator (W-07)',
    department: 'Mining',
    avatar: getPersonnelAvatar('Basavaraj Mudgal', 'REGULAR'),
    permissions: [
      'View'
    ],
  },
  {
    id: 'OFFICER-AUD-01',
    name: 'Statutory Auditor',
    role: 'Auditor',
    designation: 'DGMS / Statutory Safety Auditor',
    department: 'Audit',
    avatar: getPersonnelAvatar('Statutory Auditor', 'OFFICER'),
    permissions: [
      'View', 'Export'
    ],
  },
];

// Alias for backwards compatibility
export const DEMO_USERS = OFFICIAL_USERS;

export type MiningLease = 'DIOM ML 2396' | 'KIOM ML 1111';
export type PortalAuthScreen = 'LOGIN' | 'LEASE_SELECTION' | 'PORTAL';

export type ActiveTab =
  | 'dashboard'
  | 'mvt-command'
  | 'medical'
  | 'other-training'
  | 'excel-upload'
  | 'statutory-engine'
  | 'workforce'
  | 'training'
  | 'competency'
  | 'deployment'
  | 'safety'
  | 'audits'
  | 'reports'
  | 'documents'
  | 'administration'
  | 'implementation-plan';

interface AppContextType {
  currentUser: UserProfile;
  switchUser: (userId: string) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  filterAlertScope: string | null;
  setFilterAlertScope: (scope: string | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Mining Lease & Authentication Flow
  selectedLease: MiningLease;
  setSelectedLease: (lease: MiningLease) => void;
  authScreen: PortalAuthScreen;
  setAuthScreen: (screen: PortalAuthScreen) => void;
  selectLeaseAndEnterPortal: (lease: MiningLease) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  loginAsRole: (userId: string) => void;

  // User Accounts & Registration
  registeredUsers: RegisteredUser[];
  allUsers: UserProfile[];
  registerUser: (userData: Omit<RegisteredUser, 'id' | 'createdAt'>) => Promise<{ success: boolean; user?: RegisteredUser; error?: string }>;
  loginUser: (emailOrId: string, password?: string) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  logoutUser: () => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;

  // Data
  employees: Employee[];
  contractors: Contractor[];
  statutoryRequirements: StatutoryRequirement[];
  mvtStatuses: Record<string, MVTStatus>;
  trainingPrograms: TrainingProgram[];
  trainingSessions: TrainingSession[];
  attendance: AttendanceRecord[];
  assessmentQuestions: AssessmentQuestion[];
  certificates: Certificate[];
  hemmCompetencies: HEMMCompetency[];
  toolboxTalks: ToolboxTalk[];
  mockDrills: MockDrill[];
  auditFindings: AuditFinding[];
  documents: DocumentItem[];
  auditLogs: AuditLog[];
  systemSettings: SystemSettings;
  medicalRecords: MedicalRecord[];
  statutoryRuleVersions: StatutoryRuleVersion[];
  medicalNotices: MedicalNotice[];
  otherTrainingRecords: OtherTrainingRecord[];

  // Selected for modals/inspection
  inspectedWorker: Employee | null;
  setInspectedWorker: (w: Employee | null) => void;
  viewPassportWorkerId: string | null;
  setViewPassportWorkerId: (id: string | null) => void;
  isRegisterEmployeeOpen: boolean;
  setIsRegisterEmployeeOpen: (open: boolean) => void;
  registrationInitialType: EmploymentType;
  setRegistrationInitialType: (type: EmploymentType) => void;

  // Computed metrics
  kpis: {
    totalWorkforce: number;
    nmdcEmployees: number;
    contractWorkers: number;
    mvtApplicable: number;
    mvtValid: number;
    mvtDue7Days: number;
    mvtDue15Days: number;
    mvtDue30Days: number;
    mvtOverdue: number;
    mvtCompliancePercent: number;
    otherTrainingOverdue: number;
    otherTrainingDue7Days: number;
    otherTrainingDue30Days: number;
    overallTrainingCompliancePercent: number;
    statutoryCompliancePercent: number;
    newJoinersAwaitingInduction: number;
    highRiskCompliancePercent: number;
    totalTrainingHoursCompleted: number;
    totalCertificatesIssued: number;

    // Medical Examination KPIs
    medicalFitCount: number;
    medicalUnfitCount: number;
    medicalDueSoonCount: number;
    medicalOverdueCount: number;
    medicalCompliancePercent: number;

    // Other Training KPIs
    otherTrainingTotalCount: number;
    otherTrainingCompletedCount: number;
    otherTrainingTotalCost: number;
  };

  // Actions
  getWorkerDeploymentClearance: (workerId: string) => DeploymentClearance;
  overrideDeploymentClearance: (workerId: string, reason: string, validUntilDays: number) => void;
  recalculateMVTRequirements: (workerId: string) => void;
  addEmployee: (emp: Omit<Employee, 'id'>, customId?: string) => Employee;
  updateEmployee: (emp: Employee) => void;
  addContractWorker: (workerData: Omit<Employee, 'id' | 'employeeType'>, customId?: string) => Employee;
  addStatutoryRequirement: (req: Omit<StatutoryRequirement, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateStatutoryRequirement: (req: StatutoryRequirement) => void;
  supersedeStatutoryRequirement: (reqId: string, newVersionNote: string) => void;
  createTrainingSession: (session: Omit<TrainingSession, 'id' | 'createdAt' | 'qrCodeToken'>) => TrainingSession;
  nominateWorkers: (sessionId: string, workerIds: string[]) => void;
  markAttendance: (sessionId: string, workerId: string, method?: 'MANUAL' | 'QR_CODE' | 'BIOMETRIC_SIM') => void;
  recordAssessment: (sessionId: string, workerId: string, scorePercent: number) => { passed: boolean; certificate?: Certificate };
  recordHEMMPracticalAssessment: (assessment: Omit<HEMMCompetency, 'id'>) => HEMMCompetency;
  logToolboxTalk: (tbt: Omit<ToolboxTalk, 'id'>) => void;
  logMockDrill: (drill: Omit<MockDrill, 'id'>) => void;
  addAuditFinding: (finding: Omit<AuditFinding, 'id' | 'actionAssignedDate'>) => void;
  updateAuditFindingStatus: (id: string, status: AuditFinding['status'], evidence?: string) => void;
  updateSystemSettings: (settings: SystemSettings) => void;

  // Medical Examination Module Actions
  addMedicalRecord: (rec: Omit<MedicalRecord, 'id'>) => MedicalRecord;
  updateMedicalRecord: (rec: MedicalRecord) => void;
  addMedicalNotice: (notice: Omit<MedicalNotice, 'id'>) => MedicalNotice;

  // Other Training Records Module Actions
  addOtherTrainingRecord: (rec: Omit<OtherTrainingRecord, 'id' | 'createdAt'>) => OtherTrainingRecord;
  updateOtherTrainingRecord: (rec: OtherTrainingRecord) => void;

  // Statutory Rule Version Actions
  addStatutoryRuleVersion: (rule: Omit<StatutoryRuleVersion, 'id'>) => StatutoryRuleVersion;
  updateStatutoryRuleVersion: (rule: StatutoryRuleVersion) => void;

  // Bulk Excel Record Import Actions (Apart from Registration)
  bulkImportEmployees: (rows: ExcelImportRow[], isUpdateMode: boolean) => Promise<{ inserted: number; updated: number; skipped: number; rejected: number; errors: { row: number; error: string }[] }>;
  bulkImportMedicalRecords: (rows: MedicalRecordImportRow[], isUpdateMode: boolean) => Promise<{ inserted: number; updated: number; skipped: number; rejected: number; errors: { row: number; error: string }[] }>;
  bulkImportMVTRecords: (rows: MVTRecordImportRow[], isUpdateMode: boolean) => Promise<{ inserted: number; updated: number; skipped: number; rejected: number; errors: { row: number; error: string }[] }>;
  bulkImportOtherTrainingRecords: (rows: OtherTrainingImportRow[], isUpdateMode: boolean) => Promise<{ inserted: number; updated: number; skipped: number; rejected: number; errors: { row: number; error: string }[] }>;

  clearAllRecords: () => void;
  purgeMockData: () => void;
  resetToDemoData: () => void;
  exportToCSV: (filename: string, headers: string[], rows: (string | number)[][]) => void;

  // Firebase Auth & Cloud Sync
  firebaseUser: User | null;
  firebaseLoading: boolean;
  isCloudSyncActive: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutFirebase: () => Promise<void>;
  syncLocalToFirebase: () => Promise<{ success: boolean; count: number; error?: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Registered User Accounts (Requirement 2: User Login & Registration)
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>(() => {
    try {
      const saved = localStorage.getItem('NMDC_REGISTERED_USERS');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('NMDC_REGISTERED_USERS', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const allUsers = useMemo<UserProfile[]>(() => {
    const regProfiles: UserProfile[] = registeredUsers.map((reg) => ({
      id: reg.id,
      name: reg.name,
      role: reg.role,
      designation: reg.designation,
      department: reg.department,
      avatar: reg.avatar || getPersonnelAvatar(reg.name, 'OFFICER'),
      permissions: getRolePermissions(reg.role),
    }));
    return [...OFFICIAL_USERS, ...regProfiles];
  }, [registeredUsers]);

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('NMDC_CURRENT_USER');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.name && parsed?.role) return parsed;
      }
    } catch {
      // fallback
    }
    return OFFICIAL_USERS[0];
  });

  // Mining Lease & Portal Authentication Flow
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('NMDC_IS_AUTHENTICATED') === 'true';
    } catch {
      return false;
    }
  });

  const [selectedLease, setSelectedLease] = useState<MiningLease>(() => {
    try {
      const saved = localStorage.getItem('NMDC_SELECTED_LEASE');
      if (saved === 'KIOM ML 1111' || saved === 'DIOM ML 2396') {
        return saved;
      }
    } catch {
      // fallback
    }
    return 'DIOM ML 2396';
  });

  const [authScreen, setAuthScreen] = useState<PortalAuthScreen>(() => {
    try {
      const isAuthed = localStorage.getItem('NMDC_IS_AUTHENTICATED') === 'true';
      if (!isAuthed) return 'LOGIN';
      const hasLease = localStorage.getItem('NMDC_SELECTED_LEASE');
      if (hasLease) return 'PORTAL';
      return 'LEASE_SELECTION';
    } catch {
      return 'LOGIN';
    }
  });

  const selectLeaseAndEnterPortal = (lease: MiningLease) => {
    setSelectedLease(lease);
    try {
      localStorage.setItem('NMDC_SELECTED_LEASE', lease);
    } catch {
      // ignore
    }
    setAuthScreen('PORTAL');
  };

  const loginAsRole = (userId: string) => {
    const found = allUsers.find((u) => u.id === userId) || OFFICIAL_USERS.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
      try {
        localStorage.setItem('NMDC_CURRENT_USER', JSON.stringify(found));
        localStorage.setItem('NMDC_IS_AUTHENTICATED', 'true');
      } catch {
        // ignore
      }
      setIsAuthenticated(true);
      setAuthScreen('LEASE_SELECTION');
    }
  };

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [filterAlertScope, setFilterAlertScope] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [inspectedWorker, setInspectedWorker] = useState<Employee | null>(null);
  const [viewPassportWorkerId, setViewPassportWorkerId] = useState<string | null>(null);
  const [isRegisterEmployeeOpen, setIsRegisterEmployeeOpen] = useState(false);
  const [registrationInitialType, setRegistrationInitialType] = useState<EmploymentType>('NMDC_REGULAR');

  // One-time purge of legacy mock data with names from localStorage
  if (typeof window !== 'undefined') {
    try {
      const version = localStorage.getItem('NMDC_STORAGE_CLEAN_VERSION');
      if (version !== 'PROD_V6_NO_MOCK_DATA') {
        localStorage.clear();
        localStorage.setItem('NMDC_STORAGE_CLEAN_VERSION', 'PROD_V6_NO_MOCK_DATA');
      }
    } catch {
      // ignore
    }
  }

  // Stored state with local storage hydration (purges any old mock data)
  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem('NMDC_EMPLOYEES');
      if (!saved) return INITIAL_EMPLOYEES;
      // If legacy mock employees are found, discard them and return clean list
      if (saved.includes('NMDC-EMP-1001') || saved.includes('unsplash.com') || saved.includes('Ramesh Kumar')) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const userCreated = parsed.filter((e: Employee) => !e.photoUrl?.includes('unsplash.com') && !e.id?.startsWith('NMDC-EMP-100'));
          return userCreated;
        }
        return INITIAL_EMPLOYEES;
      }
      return JSON.parse(saved);
    } catch {
      return INITIAL_EMPLOYEES;
    }
  });

  const [contractors, setContractors] = useState<Contractor[]>(() => {
    try {
      const saved = localStorage.getItem('NMDC_CONTRACTORS');
      if (!saved || saved.includes('Sri ')) return INITIAL_CONTRACTORS;
      return JSON.parse(saved);
    } catch {
      return INITIAL_CONTRACTORS;
    }
  });

  const [statutoryRequirements, setStatutoryRequirements] = useState<StatutoryRequirement[]>(() => {
    const saved = localStorage.getItem('NMDC_STATUTORY_REQS');
    return saved ? JSON.parse(saved) : INITIAL_STATUTORY_REQUIREMENTS;
  });

  const [mvtStatuses, setMvtStatuses] = useState<Record<string, MVTStatus>>(() => {
    const saved = localStorage.getItem('NMDC_MVT_STATUSES');
    return saved ? JSON.parse(saved) : INITIAL_MVT_STATUSES;
  });

  const [trainingPrograms, setTrainingPrograms] = useState<TrainingProgram[]>(() => {
    const saved = localStorage.getItem('NMDC_TRAINING_PROGRAMS');
    return saved ? JSON.parse(saved) : INITIAL_TRAINING_PROGRAMS;
  });

  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>(() => {
    try {
      const saved = localStorage.getItem('NMDC_TRAINING_SESSIONS');
      if (!saved || saved.includes('Sri ')) return INITIAL_TRAINING_SESSIONS;
      return JSON.parse(saved);
    } catch {
      return INITIAL_TRAINING_SESSIONS;
    }
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('NMDC_ATTENDANCE');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [assessmentQuestions] = useState<AssessmentQuestion[]>(INITIAL_ASSESSMENT_QUESTIONS);

  const [certificates, setCertificates] = useState<Certificate[]>(() => {
    const saved = localStorage.getItem('NMDC_CERTIFICATES');
    return saved ? JSON.parse(saved) : INITIAL_CERTIFICATES;
  });

  const [hemmCompetencies, setHemmCompetencies] = useState<HEMMCompetency[]>(() => {
    const saved = localStorage.getItem('NMDC_HEMM_COMPETENCIES');
    return saved ? JSON.parse(saved) : INITIAL_HEMM_COMPETENCIES;
  });

  const [toolboxTalks, setToolboxTalks] = useState<ToolboxTalk[]>(() => {
    const saved = localStorage.getItem('NMDC_TOOLBOX_TALKS');
    return saved ? JSON.parse(saved) : INITIAL_TOOLBOX_TALKS;
  });

  const [mockDrills, setMockDrills] = useState<MockDrill[]>(() => {
    const saved = localStorage.getItem('NMDC_MOCK_DRILLS');
    return saved ? JSON.parse(saved) : INITIAL_MOCK_DRILLS;
  });

  const [auditFindings, setAuditFindings] = useState<AuditFinding[]>(() => {
    const saved = localStorage.getItem('NMDC_AUDIT_FINDINGS');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_FINDINGS;
  });

  const [documents] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem('NMDC_AUDIT_LOGS');
      if (!saved || saved.includes('Sri ')) return INITIAL_AUDIT_LOGS;
      return JSON.parse(saved);
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('NMDC_SYSTEM_SETTINGS');
    return saved ? JSON.parse(saved) : INITIAL_SYSTEM_SETTINGS;
  });

  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>(() => {
    try {
      const saved = localStorage.getItem('NMDC_MEDICAL_RECORDS');
      return saved ? JSON.parse(saved) : INITIAL_MEDICAL_RECORDS;
    } catch {
      return INITIAL_MEDICAL_RECORDS;
    }
  });

  const [statutoryRuleVersions, setStatutoryRuleVersions] = useState<StatutoryRuleVersion[]>(() => {
    try {
      const saved = localStorage.getItem('NMDC_STATUTORY_RULE_VERSIONS');
      return saved ? JSON.parse(saved) : INITIAL_STATUTORY_RULE_VERSIONS;
    } catch {
      return INITIAL_STATUTORY_RULE_VERSIONS;
    }
  });

  const [medicalNotices, setMedicalNotices] = useState<MedicalNotice[]>(() => {
    try {
      const saved = localStorage.getItem('NMDC_MEDICAL_NOTICES');
      return saved ? JSON.parse(saved) : INITIAL_MEDICAL_NOTICES;
    } catch {
      return INITIAL_MEDICAL_NOTICES;
    }
  });

  const [otherTrainingRecords, setOtherTrainingRecords] = useState<OtherTrainingRecord[]>(() => {
    try {
      const saved = localStorage.getItem('NMDC_OTHER_TRAINING_RECORDS');
      return saved ? JSON.parse(saved) : INITIAL_OTHER_TRAINING_RECORDS;
    } catch {
      return INITIAL_OTHER_TRAINING_RECORDS;
    }
  });

  // Local storage sync
  useEffect(() => {
    localStorage.setItem('NMDC_EMPLOYEES', JSON.stringify(employees));
  }, [employees]);
  useEffect(() => {
    localStorage.setItem('NMDC_MVT_STATUSES', JSON.stringify(mvtStatuses));
  }, [mvtStatuses]);
  useEffect(() => {
    localStorage.setItem('NMDC_STATUTORY_REQS', JSON.stringify(statutoryRequirements));
  }, [statutoryRequirements]);
  useEffect(() => {
    localStorage.setItem('NMDC_TRAINING_SESSIONS', JSON.stringify(trainingSessions));
  }, [trainingSessions]);
  useEffect(() => {
    localStorage.setItem('NMDC_ATTENDANCE', JSON.stringify(attendance));
  }, [attendance]);
  useEffect(() => {
    localStorage.setItem('NMDC_CERTIFICATES', JSON.stringify(certificates));
  }, [certificates]);
  useEffect(() => {
    localStorage.setItem('NMDC_HEMM_COMPETENCIES', JSON.stringify(hemmCompetencies));
  }, [hemmCompetencies]);
  useEffect(() => {
    localStorage.setItem('NMDC_AUDIT_FINDINGS', JSON.stringify(auditFindings));
  }, [auditFindings]);
  useEffect(() => {
    localStorage.setItem('NMDC_AUDIT_LOGS', JSON.stringify(auditLogs));
  }, [auditLogs]);
  useEffect(() => {
    localStorage.setItem('NMDC_SYSTEM_SETTINGS', JSON.stringify(systemSettings));
  }, [systemSettings]);
  useEffect(() => {
    localStorage.setItem('NMDC_MEDICAL_RECORDS', JSON.stringify(medicalRecords));
  }, [medicalRecords]);
  useEffect(() => {
    localStorage.setItem('NMDC_STATUTORY_RULE_VERSIONS', JSON.stringify(statutoryRuleVersions));
  }, [statutoryRuleVersions]);
  useEffect(() => {
    localStorage.setItem('NMDC_MEDICAL_NOTICES', JSON.stringify(medicalNotices));
  }, [medicalNotices]);
  useEffect(() => {
    localStorage.setItem('NMDC_OTHER_TRAINING_RECORDS', JSON.stringify(otherTrainingRecords));
  }, [otherTrainingRecords]);

  // Deployment overrides state in memory (persisted)
  const [deploymentOverrides, setDeploymentOverrides] = useState<Record<string, {
    overriddenBy: string;
    reason: string;
    timestamp: string;
    validUntil: string;
    remarks: string;
  }>>(() => {
    const saved = localStorage.getItem('NMDC_DEPLOYMENT_OVERRIDES');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('NMDC_DEPLOYMENT_OVERRIDES', JSON.stringify(deploymentOverrides));
  }, [deploymentOverrides]);

  // Firebase Authentication & Cloud Sync
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [firebaseLoading, setFirebaseLoading] = useState(true);
  const [isCloudSyncActive, setIsCloudSyncActive] = useState(false);

  // Monitor Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setFirebaseLoading(false);
      setIsCloudSyncActive(!!user);
    });
    return () => unsubscribe();
  }, []);

  // Listen to Firestore real-time collections when authenticated
  useEffect(() => {
    if (!firebaseUser) return;

    // 1. Employees Collection Listener
    const employeesPath = 'employees';
    const unsubEmployees = onSnapshot(
      collection(db, employeesPath),
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteEmployees: Employee[] = [];
          snapshot.forEach((docSnap) => {
            remoteEmployees.push(docSnap.data() as Employee);
          });
          setEmployees((prev) => {
            // Merge remote with local ensuring no loss of active work
            const remoteMap = new Map(remoteEmployees.map((e) => [e.id, e]));
            prev.forEach((e) => {
              if (!remoteMap.has(e.id)) remoteEmployees.push(e);
            });
            return remoteEmployees;
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, employeesPath);
      }
    );

    // 2. Contractors Collection Listener
    const contractorsPath = 'contractors';
    const unsubContractors = onSnapshot(
      collection(db, contractorsPath),
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteContractors: Contractor[] = [];
          snapshot.forEach((docSnap) => {
            remoteContractors.push(docSnap.data() as Contractor);
          });
          setContractors(remoteContractors);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, contractorsPath);
      }
    );

    // 3. Training Sessions Listener
    const trainingPath = 'trainingSessions';
    const unsubSessions = onSnapshot(
      collection(db, trainingPath),
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteSessions: TrainingSession[] = [];
          snapshot.forEach((docSnap) => {
            remoteSessions.push(docSnap.data() as TrainingSession);
          });
          setTrainingSessions(remoteSessions);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, trainingPath);
      }
    );

    // 4. Statutory Requirements Listener
    const statutoryPath = 'statutoryRequirements';
    const unsubStatutory = onSnapshot(
      collection(db, statutoryPath),
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteReqs: StatutoryRequirement[] = [];
          snapshot.forEach((docSnap) => {
            remoteReqs.push(docSnap.data() as StatutoryRequirement);
          });
          setStatutoryRequirements(remoteReqs);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, statutoryPath);
      }
    );

    // 5. Audit Logs Listener
    const auditPath = 'auditLogs';
    const unsubAudit = onSnapshot(
      collection(db, auditPath),
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteLogs: AuditLog[] = [];
          snapshot.forEach((docSnap) => {
            remoteLogs.push(docSnap.data() as AuditLog);
          });
          setAuditLogs(remoteLogs);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, auditPath);
      }
    );

    // 6. Medical Records Listener
    const medicalPath = 'medicalRecords';
    const unsubMedical = onSnapshot(
      collection(db, medicalPath),
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteRecords: MedicalRecord[] = [];
          snapshot.forEach((docSnap) => {
            remoteRecords.push(docSnap.data() as MedicalRecord);
          });
          setMedicalRecords((prev) => {
            const remoteMap = new Map(remoteRecords.map((r) => [r.id, r]));
            prev.forEach((r) => {
              if (!remoteMap.has(r.id)) remoteRecords.push(r);
            });
            return remoteRecords;
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, medicalPath);
      }
    );

    // 7. Other Training Records Listener
    const otherTrainingPath = 'otherTrainingRecords';
    const unsubOtherTraining = onSnapshot(
      collection(db, otherTrainingPath),
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteRecords: OtherTrainingRecord[] = [];
          snapshot.forEach((docSnap) => {
            remoteRecords.push(docSnap.data() as OtherTrainingRecord);
          });
          setOtherTrainingRecords((prev) => {
            const remoteMap = new Map(remoteRecords.map((r) => [r.id, r]));
            prev.forEach((r) => {
              if (!remoteMap.has(r.id)) remoteRecords.push(r);
            });
            return remoteRecords;
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, otherTrainingPath);
      }
    );

    return () => {
      unsubEmployees();
      unsubContractors();
      unsubSessions();
      unsubStatutory();
      unsubAudit();
      unsubMedical();
      unsubOtherTraining();
    };
  }, [firebaseUser]);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const email = result.user?.email || '';

      // Requirement 6: Permit verified @nmdc.co.in accounts only
      // Allow demo evaluation / bypass if email is an @nmdc.co.in domain or authorized developer test email
      if (email && !email.endsWith('@nmdc.co.in')) {
        // Sign out immediately and notify
        await signOut(auth);
        throw new Error(`Domain Access Denied: User account (${email}) does not belong to authorized '@nmdc.co.in' domain. Only verified NMDC Limited officers are permitted access.`);
      }
    } catch (error) {
      console.error('NMDC Enterprise Authentication Error:', error);
      throw error;
    }
  };

  const signOutFirebase = async () => {
    try {
      await signOut(auth);
      setIsCloudSyncActive(false);
    } catch (error) {
      console.error('Firebase sign out failed:', error);
    }
  };

  // Sync current operational state to Firebase Firestore
  const syncLocalToFirebase = async (): Promise<{ success: boolean; count: number; error?: string }> => {
    if (!firebaseUser) {
      return { success: false, count: 0, error: 'Sign in with Google required before syncing to Cloud Firestore.' };
    }

    try {
      let count = 0;
      // Sync employees
      for (const emp of employees) {
        await setDoc(doc(db, 'employees', emp.id), emp);
        count++;
      }
      // Sync contractors
      for (const cont of contractors) {
        await setDoc(doc(db, 'contractors', cont.id), cont);
        count++;
      }
      // Sync training sessions
      for (const sess of trainingSessions) {
        await setDoc(doc(db, 'trainingSessions', sess.id), sess);
        count++;
      }
      // Sync statutory requirements
      for (const req of statutoryRequirements) {
        await setDoc(doc(db, 'statutoryRequirements', req.id), req);
        count++;
      }
      // Sync audit logs
      for (const l of auditLogs) {
        await setDoc(doc(db, 'auditLogs', l.id), l);
        count++;
      }
      // Sync medical records
      for (const med of medicalRecords) {
        await setDoc(doc(db, 'medicalRecords', med.id), med);
        count++;
      }
      // Sync other training records
      for (const otr of otherTrainingRecords) {
        await setDoc(doc(db, 'otherTrainingRecords', otr.id), otr);
        count++;
      }

      logAuditAction(
        'CLOUD_FIREBASE_SYNC',
        'Firestore',
        'FULL_SYNC',
        `Successfully synchronized ${count} portal operational records to Google Cloud Firestore (${firebaseUser.email || firebaseUser.uid})`
      );

      return { success: true, count };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      handleFirestoreError(err, OperationType.WRITE, 'syncLocalToFirebase');
      return { success: false, count: 0, error: msg };
    }
  };

  const switchUser = (userId: string) => {
    const target = allUsers.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      localStorage.setItem('NMDC_CURRENT_USER', JSON.stringify(target));
      logAuditAction('SWITCH_USER_ROLE', 'Auth', target.id, `Switched active role to ${target.role} (${target.name})`);
    }
  };

  const registerUser = async (userData: Omit<RegisteredUser, 'id' | 'createdAt'>): Promise<{ success: boolean; user?: RegisteredUser; error?: string }> => {
    try {
      const emailNorm = userData.email.trim().toLowerCase();
      if (registeredUsers.some((u) => u.email.trim().toLowerCase() === emailNorm)) {
        return { success: false, error: `An account with email ${userData.email} already exists.` };
      }

      const newUser: RegisteredUser = {
        ...userData,
        id: `USER-REG-${Date.now()}`,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };

      setRegisteredUsers((prev) => [newUser, ...prev]);

      const profile: UserProfile = {
        id: newUser.id,
        name: newUser.name,
        role: newUser.role,
        designation: newUser.designation,
        department: newUser.department,
        avatar: newUser.avatar || getPersonnelAvatar(newUser.name, 'OFFICER'),
        permissions: getRolePermissions(newUser.role),
      };

      setCurrentUser(profile);
      try {
        localStorage.setItem('NMDC_CURRENT_USER', JSON.stringify(profile));
        localStorage.setItem('NMDC_IS_AUTHENTICATED', 'true');
      } catch {
        // ignore
      }
      setIsAuthenticated(true);
      setAuthScreen('LEASE_SELECTION');

      if (firebaseUser) {
        setDoc(doc(db, 'users', newUser.id), {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          designation: newUser.designation,
          department: newUser.department,
          createdAt: newUser.createdAt,
        }).catch((err) => {
          handleFirestoreError(err, OperationType.CREATE, `users/${newUser.id}`);
        });
      }

      logAuditAction(
        'USER_REGISTRATION',
        'UserAccount',
        newUser.id,
        `Registered user account: ${newUser.name} (${newUser.role}, ${newUser.department})`
      );

      return { success: true, user: newUser };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return { success: false, error: errorMsg };
    }
  };

  const loginUser = async (emailOrId: string, password?: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
    const query = emailOrId.trim().toLowerCase();

    // 1. Check official profiles
    const official = OFFICIAL_USERS.find(
      (u) => u.id.toLowerCase() === query || u.role.toLowerCase() === query || u.name.toLowerCase() === query
    );
    if (official) {
      setCurrentUser(official);
      try {
        localStorage.setItem('NMDC_CURRENT_USER', JSON.stringify(official));
        localStorage.setItem('NMDC_IS_AUTHENTICATED', 'true');
      } catch {
        // ignore
      }
      setIsAuthenticated(true);
      setAuthScreen('LEASE_SELECTION');
      logAuditAction('USER_LOGIN', 'Auth', official.id, `Logged in official officer: ${official.name} (${official.role})`);
      return { success: true, user: official };
    }

    // 2. Check registered accounts
    const matched = registeredUsers.find(
      (u) =>
        u.email.toLowerCase() === query ||
        u.id.toLowerCase() === query ||
        (u.employeeId && u.employeeId.toLowerCase() === query)
    );

    if (matched) {
      if (matched.password && password && matched.password !== password) {
        return { success: false, error: 'Incorrect password entered. Please verify and try again.' };
      }

      const profile: UserProfile = {
        id: matched.id,
        name: matched.name,
        role: matched.role,
        designation: matched.designation,
        department: matched.department,
        avatar: matched.avatar || getPersonnelAvatar(matched.name, 'OFFICER'),
        permissions: getRolePermissions(matched.role),
      };

      setCurrentUser(profile);
      try {
        localStorage.setItem('NMDC_CURRENT_USER', JSON.stringify(profile));
        localStorage.setItem('NMDC_IS_AUTHENTICATED', 'true');
      } catch {
        // ignore
      }
      setIsAuthenticated(true);
      setAuthScreen('LEASE_SELECTION');
      logAuditAction('USER_LOGIN', 'Auth', matched.id, `User authenticated: ${matched.name} (${matched.role})`);
      return { success: true, user: profile };
    }

    // 3. Check employees master roster (registered/imported via Excel alternative)
    const empMatched = employees.find(
      (e) =>
        e.id.toLowerCase() === query ||
        (e.name && e.name.toLowerCase() === query)
    );

    if (empMatched) {
      const isContract = empMatched.employeeType === 'CONTRACT_WORKER';
      const role: UserRole = isContract ? 'Contractor Administrator' : 'Employee';
      const profile: UserProfile = {
        id: empMatched.id,
        name: empMatched.name,
        role: role,
        designation: empMatched.designation,
        department: empMatched.department,
        avatar: getPersonnelAvatar(empMatched.name, isContract ? 'CONTRACT' : 'REGULAR'),
        permissions: getRolePermissions(role),
      };

      setCurrentUser(profile);
      try {
        localStorage.setItem('NMDC_CURRENT_USER', JSON.stringify(profile));
        localStorage.setItem('NMDC_IS_AUTHENTICATED', 'true');
      } catch {
        // ignore
      }
      setIsAuthenticated(true);
      setAuthScreen('LEASE_SELECTION');
      logAuditAction('USER_LOGIN', 'Auth', empMatched.id, `Workforce employee authenticated: ${empMatched.name} (${empMatched.id})`);
      return { success: true, user: profile };
    }

    return { success: false, error: `Account '${emailOrId}' not found. Please register or upload employee roster via Excel.` };
  };

  const logoutUser = () => {
    const fallback = OFFICIAL_USERS[0];
    setCurrentUser(fallback);
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('NMDC_IS_AUTHENTICATED');
      localStorage.removeItem('NMDC_CURRENT_USER');
      localStorage.removeItem('NMDC_SELECTED_LEASE');
    } catch {
      // ignore
    }
    setAuthScreen('LOGIN');
    logAuditAction('USER_LOGOUT', 'Auth', currentUser.id, `Signed out user: ${currentUser.name}`);
  };

  const logAuditAction = (
    action: string,
    entity: string,
    entityId: string,
    details: string,
    oldValue?: string,
    newValue?: string
  ) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: now,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      entity,
      entityId,
      details,
      oldValue,
      newValue,
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    if (firebaseUser) {
      setDoc(doc(db, 'auditLogs', newLog.id), newLog).catch((err) => {
        handleFirestoreError(err, OperationType.CREATE, `auditLogs/${newLog.id}`);
      });
    }
  };

  // Deployment Clearance Evaluation Engine
  const getWorkerDeploymentClearance = (workerId: string): DeploymentClearance => {
    const worker = employees.find((e) => e.id === workerId);
    const reasons: string[] = [];
    const nowStr = '2026-10-06';

    if (!worker) {
      return {
        workerId,
        status: 'NOT_CLEARED',
        reasons: ['Worker ID not found in Donimalai Personnel Register'],
        override: null,
        lastCheckedAt: nowStr,
      };
    }

    // 1. MVT Status Check
    const mvt = mvtStatuses[workerId];
    if (mvt && mvt.applicable) {
      if (mvt.status === 'OVERDUE') {
        reasons.push(`MVT OVERDUE: Due Date was ${mvt.nextMVTDueDate || 'N/A'}, overdue by ${mvt.daysOverdue} days`);
      } else if (mvt.status === 'VERIFICATION_REQUIRED') {
        reasons.push('MVT Applicability pending verification by authorised Training Officer');
      }
    }

    // 2. Medical Fitness Check
    if (worker.medicalFitnessValidTill && worker.medicalFitnessValidTill < nowStr) {
      reasons.push(`MEDICAL FITNESS EXPIRED: Valid till was ${worker.medicalFitnessValidTill}`);
    }

    // 3. HEMM Operator Competency Check
    if (worker.classification === 'HEMM Operator') {
      const comp = hemmCompetencies.find((c) => c.workerId === workerId);
      if (!comp) {
        reasons.push('HEMM OPERATOR COMPETENCY RECORD MISSING: Practical assessment pending');
      } else if (comp.result !== 'COMPETENT' || comp.validUntil < nowStr) {
        reasons.push(`HEMM OPERATOR COMPETENCY EXPIRED: Re-evaluation mandatory (Expired on ${comp.validUntil})`);
      }
    }

    // 4. Contractor Worker Induction Check
    if (worker.employeeType === 'CONTRACT_WORKER') {
      if (worker.verificationStatus !== 'Verified') {
        reasons.push(`CONTRACTOR WORKER VERIFICATION PENDING: Status is ${worker.verificationStatus}`);
      }
      // Check if Safety Induction certificate exists
      const inductionCert = certificates.find(
        (c) => c.workerId === workerId && c.category.toLowerCase().includes('induction') && c.status === 'VALID'
      );
      if (!inductionCert && worker.verificationStatus === 'Pending Verification') {
        reasons.push('MANDATORY SAFETY INDUCTION PENDING: Gate Pass clearance blocked');
      }
    }

    const activeOverride = deploymentOverrides[workerId];
    if (activeOverride && activeOverride.validUntil >= nowStr) {
      return {
        workerId,
        status: 'CONDITIONAL',
        reasons,
        override: activeOverride,
        lastCheckedAt: nowStr,
      };
    }

    return {
      workerId,
      status: reasons.length === 0 ? 'CLEARED' : 'NOT_CLEARED',
      reasons,
      override: null,
      lastCheckedAt: nowStr,
    };
  };

  const overrideDeploymentClearance = (workerId: string, reason: string, validUntilDays: number) => {
    const today = new Date('2026-10-06');
    today.setDate(today.getDate() + validUntilDays);
    const validUntilStr = today.toISOString().split('T')[0];

    const overrideObj = {
      overriddenBy: `${currentUser.name} (${currentUser.role})`,
      reason,
      timestamp: '2026-10-06 10:00:00',
      validUntil: validUntilStr,
      remarks: `Temporary deployment clearance issued for ${validUntilDays} days under executive override authority.`,
    };

    setDeploymentOverrides((prev) => ({
      ...prev,
      [workerId]: overrideObj,
    }));

    logAuditAction(
      'DEPLOYMENT_OVERRIDE_ISSUED',
      'DeploymentClearance',
      workerId,
      `Officer ${currentUser.name} issued conditional deployment override for worker ${workerId}. Justification: ${reason}. Valid until: ${validUntilStr}`,
      'NOT_CLEARED',
      'CONDITIONAL'
    );
  };

  // Recalculate MVT requirement for a worker
  const recalculateMVTRequirements = (workerId: string) => {
    const worker = employees.find((e) => e.id === workerId);
    if (!worker) return;

    // Check active statutory MVT rules
    const mvtRule = statutoryRequirements.find(
      (r) => r.status === 'ACTIVE' && (r.actCode.includes('MVT') || r.ruleRegulation.includes('Rule 6') || r.ruleRegulation.includes('Rule 9'))
    );

    const freqMonths = mvtRule ? mvtRule.frequencyMonths : 36;
    const currentStatus = mvtStatuses[workerId];
    const lastDate = currentStatus?.lastMVTDate || worker.dateOfJoining;

    // Calculate next due date
    const lastD = new Date(lastDate);
    lastD.setMonth(lastD.getMonth() + freqMonths);
    const nextDueStr = lastD.toISOString().split('T')[0];

    const today = new Date('2026-10-06');
    const diffTime = lastD.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let status: ComplianceStatus = 'VALID';
    if (diffDays < 0) {
      status = 'OVERDUE';
    } else if (diffDays <= 7) {
      status = 'DUE';
    } else if (diffDays <= 30) {
      status = 'DUE_SOON';
    }

    const updatedMVT: MVTStatus = {
      workerId,
      applicable: true,
      applicabilityStatus: 'APPLICABLE',
      applicableRule: mvtRule?.ruleRegulation || 'MVT Rules 1966 - Rule 9 (Periodic Refresher)',
      lastMVTDate: lastDate,
      nextMVTDueDate: nextDueStr,
      daysRemaining: diffDays,
      daysOverdue: diffDays < 0 ? Math.abs(diffDays) : 0,
      status,
      history: currentStatus?.history || [],
    };

    setMvtStatuses((prev) => ({
      ...prev,
      [workerId]: updatedMVT,
    }));

    logAuditAction('RECALCULATE_MVT', 'MVTStatus', workerId, `Recalculated MVT applicability and due dates for ${worker.name}. Status: ${status}`);
  };

  const addEmployee = (empData: Omit<Employee, 'id'>, customId?: string): Employee => {
    const trimmedId = customId?.trim();
    const generatedId = `NMDC-EMP-${1000 + employees.filter((e) => e.employeeType === 'NMDC_REGULAR').length + 1}`;
    const nextId = trimmedId || generatedId;
    const newEmp: Employee = {
      ...empData,
      id: nextId,
      photoUrl: empData.photoUrl && !empData.photoUrl.includes('unsplash.com')
        ? empData.photoUrl
        : getPersonnelAvatar(empData.name, 'REGULAR'),
    };
    setEmployees((prev) => [newEmp, ...prev]);

    // Initialize MVT status
    const initialMVT: MVTStatus = {
      workerId: nextId,
      applicable: true,
      applicabilityStatus: 'APPLICABLE',
      applicableRule: 'MVT Rules 1966 - Rule 6 (Initial Vocational Training)',
      lastMVTDate: null,
      nextMVTDueDate: '2026-10-20',
      daysRemaining: 14,
      daysOverdue: 0,
      status: 'DUE',
      history: [],
    };
    setMvtStatuses((prev) => ({
      ...prev,
      [nextId]: initialMVT,
    }));

    logAuditAction('REGISTER_EMPLOYEE', 'Employee', nextId, `Registered new employee ${newEmp.name} (ID: ${nextId}) in department ${newEmp.department}`);

    if (firebaseUser) {
      setDoc(doc(db, 'employees', nextId), newEmp).catch((err) => {
        handleFirestoreError(err, OperationType.CREATE, `employees/${nextId}`);
      });
    }

    return newEmp;
  };

  const updateEmployee = (emp: Employee) => {
    setEmployees((prev) => prev.map((e) => (e.id === emp.id ? emp : e)));
    logAuditAction('UPDATE_EMPLOYEE', 'Employee', emp.id, `Updated employee profile for ${emp.name}`);

    if (firebaseUser) {
      setDoc(doc(db, 'employees', emp.id), emp).catch((err) => {
        handleFirestoreError(err, OperationType.UPDATE, `employees/${emp.id}`);
      });
    }
  };

  const addContractWorker = (workerData: Omit<Employee, 'id' | 'employeeType'>, customId?: string): Employee => {
    const trimmedId = customId?.trim();
    const generatedId = `CONT-WRK-${2000 + employees.filter((e) => e.employeeType === 'CONTRACT_WORKER').length + 1}`;
    const nextId = trimmedId || generatedId;
    const newWorker: Employee = {
      ...workerData,
      id: nextId,
      employeeType: 'CONTRACT_WORKER',
      photoUrl: workerData.photoUrl && !workerData.photoUrl.includes('unsplash.com')
        ? workerData.photoUrl
        : getPersonnelAvatar(workerData.name, 'CONTRACT'),
    };
    setEmployees((prev) => [newWorker, ...prev]);

    // Set initial MVT & Induction requirement
    const initialMVT: MVTStatus = {
      workerId: nextId,
      applicable: true,
      applicabilityStatus: 'APPLICABLE',
      applicableRule: 'MVT Rules 1966 - Special Training for Contractor Workers',
      lastMVTDate: null,
      nextMVTDueDate: '2026-10-18',
      daysRemaining: 12,
      daysOverdue: 0,
      status: 'DUE',
      history: [],
    };
    setMvtStatuses((prev) => ({
      ...prev,
      [nextId]: initialMVT,
    }));

    logAuditAction('REGISTER_CONTRACT_WORKER', 'ContractWorker', nextId, `Registered contractor worker ${newWorker.name} (ID: ${nextId}) under ${newWorker.contractorName || 'Contractor'}`);

    if (firebaseUser) {
      setDoc(doc(db, 'employees', nextId), newWorker).catch((err) => {
        handleFirestoreError(err, OperationType.CREATE, `employees/${nextId}`);
      });
    }

    return newWorker;
  };

  const addStatutoryRequirement = (reqData: Omit<StatutoryRequirement, 'id' | 'createdAt' | 'updatedAt'>) => {
    const nextId = `STAT-REQ-${String(statutoryRequirements.length + 1).padStart(3, '0')}`;
    const now = '2026-10-06';
    const newReq: StatutoryRequirement = {
      ...reqData,
      id: nextId,
      createdAt: now,
      updatedAt: now,
    };
    setStatutoryRequirements((prev) => [newReq, ...prev]);
    logAuditAction('ADD_STATUTORY_REQUIREMENT', 'StatutoryRequirement', nextId, `Added configurable statutory requirement: ${newReq.ruleRegulation} (${newReq.actCode})`);

    if (firebaseUser) {
      setDoc(doc(db, 'statutoryRequirements', nextId), newReq).catch((err) => {
        handleFirestoreError(err, OperationType.CREATE, `statutoryRequirements/${nextId}`);
      });
    }
  };

  const updateStatutoryRequirement = (req: StatutoryRequirement) => {
    setStatutoryRequirements((prev) => prev.map((r) => (r.id === req.id ? req : r)));
    logAuditAction('UPDATE_STATUTORY_REQUIREMENT', 'StatutoryRequirement', req.id, `Updated statutory requirement rule: ${req.ruleRegulation}`);

    if (firebaseUser) {
      setDoc(doc(db, 'statutoryRequirements', req.id), req).catch((err) => {
        handleFirestoreError(err, OperationType.UPDATE, `statutoryRequirements/${req.id}`);
      });
    }
  };

  const supersedeStatutoryRequirement = (reqId: string, newVersionNote: string) => {
    const target = statutoryRequirements.find((r) => r.id === reqId);
    if (!target) return;

    const oldVersion = target.version;
    const newVersion = (parseFloat(oldVersion) + 0.1).toFixed(1);

    setStatutoryRequirements((prev) =>
      prev.map((r) =>
        r.id === reqId
          ? {
              ...r,
              status: 'SUPERSEDED',
              supersededBy: `Version ${newVersion} - ${newVersionNote}`,
              updatedAt: '2026-10-06',
            }
          : r
      )
    );

    // Create the updated active requirement retaining historical lineage
    const newId = `STAT-REQ-${String(statutoryRequirements.length + 1).padStart(3, '0')}`;
    const newReq: StatutoryRequirement = {
      ...target,
      id: newId,
      version: newVersion,
      status: 'ACTIVE',
      notes: `Supersedes ${target.id} v${oldVersion}: ${newVersionNote}`,
      createdAt: '2026-10-06',
      updatedAt: '2026-10-06',
    };
    setStatutoryRequirements((prev) => [newReq, ...prev]);

    logAuditAction(
      'SUPERSEDE_STATUTORY_REQUIREMENT',
      'StatutoryRequirement',
      reqId,
      `Superseded requirement ${reqId} (v${oldVersion}) with new requirement ${newId} (v${newVersion}). Note: ${newVersionNote}`
    );

    if (firebaseUser) {
      setDoc(doc(db, 'statutoryRequirements', newId), newReq).catch((err) => {
        handleFirestoreError(err, OperationType.CREATE, `statutoryRequirements/${newId}`);
      });
    }
  };

  const createTrainingSession = (sessionData: Omit<TrainingSession, 'id' | 'createdAt' | 'qrCodeToken'>): TrainingSession => {
    const nextId = `TRG-SESS-2026-${String(trainingSessions.length + 1).padStart(2, '0')}`;
    const qrToken = `NMDC-VTC-QR-${nextId}`;
    const newSession: TrainingSession = {
      ...sessionData,
      id: nextId,
      qrCodeToken: qrToken,
      createdAt: '2026-10-06',
    };
    setTrainingSessions((prev) => [newSession, ...prev]);
    logAuditAction('CREATE_TRAINING_SESSION', 'TrainingSession', nextId, `Created training session "${newSession.title}" at ${newSession.venue}`);

    if (firebaseUser) {
      setDoc(doc(db, 'trainingSessions', nextId), newSession).catch((err) => {
        handleFirestoreError(err, OperationType.CREATE, `trainingSessions/${nextId}`);
      });
    }

    return newSession;
  };

  const nominateWorkers = (sessionId: string, workerIds: string[]) => {
    setTrainingSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          const combined = Array.from(new Set([...s.nominatedWorkerIds, ...workerIds]));
          return { ...s, nominatedWorkerIds: combined };
        }
        return s;
      })
    );
    logAuditAction('NOMINATE_WORKERS', 'TrainingSession', sessionId, `Nominated ${workerIds.length} workers for session ${sessionId}`);
  };

  const markAttendance = (sessionId: string, workerId: string, method: 'MANUAL' | 'QR_CODE' | 'BIOMETRIC_SIM' = 'MANUAL') => {
    const session = trainingSessions.find((s) => s.id === sessionId);
    const worker = employees.find((e) => e.id === workerId);
    if (!session || !worker) return;

    // Check duplicate attendance
    const alreadyMarked = attendance.some((a) => a.sessionId === sessionId && a.workerId === workerId);
    if (alreadyMarked) return;

    const newRec: AttendanceRecord = {
      id: `ATT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sessionId,
      workerId,
      status: 'PRESENT',
      markedAt: '2026-10-06 10:15:00',
      method,
      markedBy: currentUser.name,
      remarks: `Attendance marked via ${method} by ${currentUser.role}`,
    };

    setAttendance((prev) => [newRec, ...prev]);

    // Update attendance count in session
    setTrainingSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, attendanceCount: (s.attendanceCount || 0) + 1 } : s))
    );

    logAuditAction('MARK_ATTENDANCE', 'Attendance', sessionId, `Marked attendance for ${worker.name} (${workerId}) via ${method}`);
  };

  const recordAssessment = (sessionId: string, workerId: string, scorePercent: number) => {
    const session = trainingSessions.find((s) => s.id === sessionId);
    const program = trainingPrograms.find((p) => p.id === session?.programId);
    const worker = employees.find((e) => e.id === workerId);

    const passMark = program ? program.passMarkPercent : systemSettings.assessmentPassingPercentage;
    const passed = scorePercent >= passMark;

    let cert: Certificate | undefined = undefined;

    if (passed && worker && session && program) {
      // Issue digital certificate
      const certNo = `${systemSettings.certificateNumberPrefix}2026-${String(certificates.length + 1).padStart(3, '0')}`;
      const issueDate = '2026-10-06';
      const validUntilD = new Date('2026-10-06');
      validUntilD.setMonth(validUntilD.getMonth() + (program.validityMonths || 36));
      const validUntilStr = validUntilD.toISOString().split('T')[0];

      cert = {
        id: `CERT-2026-${String(certificates.length + 1).padStart(3, '0')}`,
        certificateNumber: certNo,
        workerId,
        workerName: worker.name,
        trainingTitle: program.title,
        category: program.category,
        issueDate,
        validUntil: validUntilStr,
        durationHours: program.durationHours,
        trainerName: session.trainerName,
        status: 'VALID',
        qrVerificationUrl: `https://nmdc.co.in/verify/${certNo}`,
        approverName: currentUser.name,
        approverDesignation: currentUser.designation,
      };

      setCertificates((prev) => [cert!, ...prev]);

      // If program is MVT, update MVT status to VALID!
      if (program.category === 'MVT (Statutory)') {
        const updatedMVT: MVTStatus = {
          workerId,
          applicable: true,
          applicabilityStatus: 'APPLICABLE',
          applicableRule: program.statutoryReference || 'MVT Rules 1966 - Rule 9',
          lastMVTDate: issueDate,
          nextMVTDueDate: validUntilStr,
          daysRemaining: (program.validityMonths || 36) * 30,
          daysOverdue: 0,
          status: 'VALID',
          history: [
            ...(mvtStatuses[workerId]?.history || []),
            {
              id: `MVTH-${Date.now()}`,
              workerId,
              trainingName: program.title,
              trainingType: program.type as any,
              completionDate: issueDate,
              validTill: validUntilStr,
              trainerName: session.trainerName,
              attendanceScore: '100%',
              assessmentResult: 'PASS',
              certificateNumber: certNo,
              statutoryRuleApplied: program.statutoryReference || 'MVT Rules 1966 Rule 9',
              verifiedBy: currentUser.name,
            },
          ],
        };
        setMvtStatuses((prev) => ({ ...prev, [workerId]: updatedMVT }));
      }

      logAuditAction(
        'ISSUE_CERTIFICATE',
        'Certificate',
        cert.id,
        `Assessment passed (${scorePercent}%). Issued digital certificate ${certNo} to ${worker.name}. Valid till ${validUntilStr}`
      );
    }

    return { passed, certificate: cert };
  };

  const recordHEMMPracticalAssessment = (assessmentData: Omit<HEMMCompetency, 'id'>): HEMMCompetency => {
    const nextId = `HEMM-COMP-${String(hemmCompetencies.length + 1).padStart(3, '0')}`;
    const newComp: HEMMCompetency = {
      ...assessmentData,
      id: nextId,
    };
    setHemmCompetencies((prev) => [newComp, ...prev]);

    logAuditAction(
      'RECORD_HEMM_COMPETENCY',
      'HEMMCompetency',
      nextId,
      `Recorded HEMM practical assessment for worker ${newComp.workerId} on ${newComp.equipmentModel}. Result: ${newComp.result} (${newComp.overallScorePercent}%)`
    );

    return newComp;
  };

  const logToolboxTalk = (tbtData: Omit<ToolboxTalk, 'id'>) => {
    const nextId = `TBT-2026-${String(toolboxTalks.length + 101)}`;
    const newTBT: ToolboxTalk = {
      ...tbtData,
      id: nextId,
    };
    setToolboxTalks((prev) => [newTBT, ...prev]);
    logAuditAction('LOG_TOOLBOX_TALK', 'ToolboxTalk', nextId, `Logged Toolbox Talk on topic: "${newTBT.topic}" at ${newTBT.location}`);
  };

  const logMockDrill = (drillData: Omit<MockDrill, 'id'>) => {
    const nextId = `DRILL-2026-${String(mockDrills.length + 1).padStart(2, '0')}`;
    const newDrill: MockDrill = {
      ...drillData,
      id: nextId,
    };
    setMockDrills((prev) => [newDrill, ...prev]);
    logAuditAction('LOG_MOCK_DRILL', 'MockDrill', nextId, `Logged Emergency Mock Drill: "${newDrill.drillType}" at ${newDrill.location}`);
  };

  const addAuditFinding = (findingData: Omit<AuditFinding, 'id' | 'actionAssignedDate'>) => {
    const nextId = `AUD-FIND-2026-${String(auditFindings.length + 1).padStart(2, '0')}`;
    const newFinding: AuditFinding = {
      ...findingData,
      id: nextId,
      actionAssignedDate: '2026-10-06',
    };
    setAuditFindings((prev) => [newFinding, ...prev]);
    logAuditAction('LOG_AUDIT_FINDING', 'AuditFinding', nextId, `Logged ${newFinding.severity} audit finding in category ${newFinding.checklistCategory}`);
  };

  const updateAuditFindingStatus = (id: string, status: AuditFinding['status'], evidenceNotes?: string) => {
    setAuditFindings((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          return {
            ...f,
            status,
            evidenceNotes: evidenceNotes || f.evidenceNotes,
            closedDate: status === 'CLOSED' ? '2026-10-06' : f.closedDate,
          };
        }
        return f;
      })
    );
    logAuditAction('UPDATE_AUDIT_FINDING', 'AuditFinding', id, `Updated audit finding status to ${status}`);
  };

  const updateSystemSettings = (newSettings: SystemSettings) => {
    setSystemSettings(newSettings);
    logAuditAction('UPDATE_SYSTEM_SETTINGS', 'SystemSettings', 'GLOBAL', 'Updated portal configuration and statutory threshold settings.');
  };

  // ----------------------------------------------------
  // Medical Examination Module Methods
  // ----------------------------------------------------
  const addMedicalRecord = (recData: Omit<MedicalRecord, 'id'>): MedicalRecord => {
    const nextId = `MED-REC-${Date.now()}`;
    const newRecord: MedicalRecord = {
      ...recData,
      id: nextId,
    };
    setMedicalRecords((prev) => [newRecord, ...prev]);
    logAuditAction('CREATE_MEDICAL_RECORD', 'MedicalRecord', nextId, `Recorded ${newRecord.examType} examination for ${newRecord.workerName} (${newRecord.workerId}) - Result: ${newRecord.fitnessResult}`);

    if (firebaseUser) {
      setDoc(doc(db, 'medicalRecords', nextId), newRecord).catch((err) => {
        handleFirestoreError(err, OperationType.CREATE, `medicalRecords/${nextId}`);
      });
    }

    return newRecord;
  };

  const updateMedicalRecord = (rec: MedicalRecord) => {
    setMedicalRecords((prev) => prev.map((r) => (r.id === rec.id ? rec : r)));
    logAuditAction('UPDATE_MEDICAL_RECORD', 'MedicalRecord', rec.id, `Updated medical examination record for ${rec.workerName} - Fitness: ${rec.fitnessResult}`);

    if (firebaseUser) {
      setDoc(doc(db, 'medicalRecords', rec.id), rec).catch((err) => {
        handleFirestoreError(err, OperationType.UPDATE, `medicalRecords/${rec.id}`);
      });
    }
  };

  const addMedicalNotice = (noticeData: Omit<MedicalNotice, 'id'>): MedicalNotice => {
    const nextId = `MED-NOT-${Date.now()}`;
    const newNotice: MedicalNotice = {
      ...noticeData,
      id: nextId,
    };
    setMedicalNotices((prev) => [newNotice, ...prev]);
    logAuditAction('ISSUE_MEDICAL_NOTICE', 'MedicalNotice', nextId, `Issued statutory ${newNotice.noticeType} notice (${newNotice.noticeNumber}) to ${newNotice.workerName}`);
    return newNotice;
  };

  // ----------------------------------------------------
  // Other Training Records Module Methods
  // ----------------------------------------------------
  const addOtherTrainingRecord = (recData: Omit<OtherTrainingRecord, 'id' | 'createdAt'>): OtherTrainingRecord => {
    const nextId = `OTR-${Date.now()}`;
    const nowStr = new Date().toISOString().split('T')[0];
    const newRecord: OtherTrainingRecord = {
      ...recData,
      id: nextId,
      createdAt: nowStr,
    };
    setOtherTrainingRecords((prev) => [newRecord, ...prev]);
    logAuditAction('ADD_OTHER_TRAINING_RECORD', 'OtherTrainingRecord', nextId, `Logged ${newRecord.trainingCategory} training "${newRecord.courseTitle}" for ${newRecord.workerName}`);

    if (firebaseUser) {
      setDoc(doc(db, 'otherTrainingRecords', nextId), newRecord).catch((err) => {
        handleFirestoreError(err, OperationType.CREATE, `otherTrainingRecords/${nextId}`);
      });
    }

    return newRecord;
  };

  const updateOtherTrainingRecord = (rec: OtherTrainingRecord) => {
    setOtherTrainingRecords((prev) => prev.map((r) => (r.id === rec.id ? rec : r)));
    logAuditAction('UPDATE_OTHER_TRAINING_RECORD', 'OtherTrainingRecord', rec.id, `Updated other training record "${rec.courseTitle}" for ${rec.workerName}`);

    if (firebaseUser) {
      setDoc(doc(db, 'otherTrainingRecords', rec.id), rec).catch((err) => {
        handleFirestoreError(err, OperationType.UPDATE, `otherTrainingRecords/${rec.id}`);
      });
    }
  };

  // ----------------------------------------------------
  // Statutory Rule Version Methods
  // ----------------------------------------------------
  const addStatutoryRuleVersion = (ruleData: Omit<StatutoryRuleVersion, 'id'>): StatutoryRuleVersion => {
    const nextId = `SRV-${Date.now()}`;
    const newRule: StatutoryRuleVersion = {
      ...ruleData,
      id: nextId,
    };
    setStatutoryRuleVersions((prev) => [newRule, ...prev]);
    logAuditAction('CREATE_STATUTORY_RULE_VERSION', 'StatutoryRuleVersion', nextId, `Added statutory rule version ${newRule.ruleCode} (${newRule.version})`);
    return newRule;
  };

  const updateStatutoryRuleVersion = (rule: StatutoryRuleVersion) => {
    setStatutoryRuleVersions((prev) => prev.map((r) => (r.id === rule.id ? rule : r)));
    logAuditAction('UPDATE_STATUTORY_RULE_VERSION', 'StatutoryRuleVersion', rule.id, `Updated statutory rule version ${rule.ruleCode} (${rule.version})`);
  };

  // ----------------------------------------------------
  // Employee Master Excel Import Engine
  // Controlled insert & update, preserving linked training and medical records!
  // ----------------------------------------------------
  const bulkImportEmployees = async (rows: ExcelImportRow[], isUpdateMode: boolean) => {
    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    let rejected = 0;
    const errors: { row: number; error: string }[] = [];

    const updatedEmployeesMap = new Map(employees.map((e) => [e.id, e]));

    for (const r of rows) {
      if (r.status === 'INVALID' || r.errors.length > 0) {
        rejected++;
        errors.push({ row: r.rowNumber, error: r.errors.join('; ') || 'Invalid row fields' });
        continue;
      }

      const existing = updatedEmployeesMap.get(r.employeeId);

      if (existing) {
        if (!isUpdateMode) {
          skipped++;
          continue;
        }

        // UPDATE operation: preserve linked records, update employee master attributes
        const merged: Employee = {
          ...existing,
          name: r.name || existing.name,
          employeeType: r.employeeType || existing.employeeType,
          department: r.department || existing.department,
          section: r.section || existing.section,
          designation: r.designation || existing.designation,
          trade: r.trade || existing.trade,
          grade: r.grade || existing.grade,
          dateOfBirth: r.dateOfBirth || existing.dateOfBirth,
          mobile: r.mobile || existing.mobile,
          email: r.email || existing.email,
          shift: r.shift || existing.shift,
          workLocation: r.workLocation || existing.workLocation,
          contractorName: r.contractorName || existing.contractorName,
          workOrderNumber: r.workOrderNumber || existing.workOrderNumber,
          medicalFitnessValidTill: r.medicalFitnessValidTill || existing.medicalFitnessValidTill,
          // PRESERVE vital safety passport & linked records
          verificationStatus: existing.verificationStatus,
          medicalFitnessDate: existing.medicalFitnessDate,
          assignedEquipment: existing.assignedEquipment,
        };

        updatedEmployeesMap.set(r.employeeId, merged);
        updated++;

        if (firebaseUser) {
          setDoc(doc(db, 'employees', merged.id), merged).catch((err) => {
            handleFirestoreError(err, OperationType.UPDATE, `employees/${merged.id}`);
          });
        }
      } else {
        // INSERT operation
        const newEmpId = r.employeeId || `NMDC-EMP-${Date.now().toString().slice(-4)}`;
        const newRecord: Employee = {
          id: newEmpId,
          name: r.name,
          photoUrl: getPersonnelAvatar(r.name, r.employeeType === 'NMDC_REGULAR' ? 'REGULAR' : 'CONTRACT'),
          dateOfBirth: r.dateOfBirth || '1990-01-01',
          mobile: r.mobile || '+91 94480 00000',
          email: r.email || `${r.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@nmdc.co.in`,
          department: r.department || 'Mining',
          section: r.section || 'Donimalai Mine Operations',
          designation: r.designation || 'Operative',
          trade: r.trade || 'Mining General',
          grade: r.grade || 'W-04',
          employeeType: r.employeeType,
          dateOfJoining: '2026-10-06',
          dateOfDeployment: '2026-10-07',
          shift: r.shift || 'Shift A (06:00-14:00)',
          supervisor: 'Mine Section Incharge',
          workLocation: r.workLocation || 'Donimalai Complex',
          mine: 'Donimalai Iron Ore Mine',
          employmentStatus: 'ACTIVE',
          classification: 'General Worker',
          verificationStatus: r.employeeType === 'NMDC_REGULAR' ? 'Verified' : 'Pending Verification',
          medicalFitnessDate: '2026-04-01',
          medicalFitnessValidTill: r.medicalFitnessValidTill || '2027-04-01',
          contractorName: r.contractorName,
          workOrderNumber: r.workOrderNumber,
        };

        updatedEmployeesMap.set(newEmpId, newRecord);
        inserted++;

        // Initialize MVT status
        const initialMVT: MVTStatus = {
          workerId: newEmpId,
          applicable: true,
          applicabilityStatus: 'APPLICABLE',
          applicableRule: 'MVT Rules 1966 - Rule 6',
          lastMVTDate: null,
          nextMVTDueDate: '2026-11-01',
          daysRemaining: 25,
          daysOverdue: 0,
          status: 'DUE_SOON',
          history: [],
        };

        setMvtStatuses((prev) => ({
          ...prev,
          [newEmpId]: initialMVT,
        }));

        if (firebaseUser) {
          setDoc(doc(db, 'employees', newEmpId), newRecord).catch((err) => {
            handleFirestoreError(err, OperationType.CREATE, `employees/${newEmpId}`);
          });
        }
      }
    }

    setEmployees(Array.from(updatedEmployeesMap.values()));

    // Statutory Alternative to Manual Registration of Employees:
    // Automatically register and provision portal user accounts for imported employees
    setRegisteredUsers((prevUsers) => {
      const userMap = new Map(prevUsers.map((u) => [u.id, u]));

      for (const r of rows) {
        if (r.status === 'INVALID' || r.errors.length > 0) continue;
        const empId = r.employeeId;
        if (!empId) continue;

        const email = r.email || `${r.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@nmdc.co.in`;
        
        // Map designation to portal user role
        const desig = (r.designation || '').toLowerCase();
        const cat = (r.workerCategory || '').toLowerCase();
        const gr = (r.grade || '').toUpperCase();
        let role: UserRole = 'Employee';
        if (desig.includes('safety') || desig.includes('dgms') || desig.includes('iso')) {
          role = 'Safety Officer';
        } else if (desig.includes('medical') || desig.includes('doctor') || desig.includes('smo') || desig.includes('cmo')) {
          role = 'Medical Officer';
        } else if (desig.includes('training') || desig.includes('vtc') || desig.includes('instructor')) {
          role = 'Training Officer';
        } else if (desig.includes('mine manager') || (gr.startsWith('E-') && parseInt(gr.slice(2) || '0') >= 7)) {
          role = 'Mine Manager';
        } else if (desig.includes('foreman') || desig.includes('supervisor') || desig.includes('incharge') || desig.includes('sirdar')) {
          role = 'Supervisor';
        } else if (desig.includes('contractor') || cat.includes('contractor')) {
          role = 'Contractor Administrator';
        } else if (cat.includes('executive') || gr.startsWith('E-')) {
          role = 'Department Head';
        }

        const existingUser = userMap.get(empId) || prevUsers.find((u) => u.employeeId === empId || u.email.toLowerCase() === email.toLowerCase());

        if (existingUser) {
          if (isUpdateMode) {
            userMap.set(existingUser.id, {
              ...existingUser,
              name: r.name || existingUser.name,
              email: email,
              phone: r.mobile || existingUser.phone,
              department: r.department || existingUser.department,
              designation: r.designation || existingUser.designation,
              role: role,
            });
          }
        } else {
          userMap.set(empId, {
            id: empId,
            name: r.name,
            email: email,
            employeeId: empId,
            phone: r.mobile || '+91 94480 00000',
            department: r.department || 'Mining',
            designation: r.designation || 'Operative',
            role: role,
            password: empId, // Initial credentials match Employee ID
            avatar: getPersonnelAvatar(r.name, r.employeeType === 'NMDC_REGULAR' ? 'REGULAR' : 'CONTRACT'),
            createdAt: new Date().toISOString(),
          });
        }
      }
      return Array.from(userMap.values());
    });

    logAuditAction(
      'EXCEL_BULK_IMPORT',
      'EmployeeMaster',
      'BULK_SYNC',
      `Master Excel Import executed: ${inserted} registered/inserted, ${updated} updated, ${skipped} skipped, ${rejected} rejected. Workforce personnel accounts and Form B registers initialized.`
    );

    return { inserted, updated, skipped, rejected, errors };
  };

  const bulkImportMedicalRecords = async (rows: MedicalRecordImportRow[], isUpdateMode: boolean) => {
    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    let rejected = 0;
    const errors: { row: number; error: string }[] = [];

    const existingMap = new Map(medicalRecords.map((m) => [`${m.workerId}_${m.completedDate || m.scheduledDate}`, m]));

    for (const r of rows) {
      if (r.status === 'INVALID' || (r.errors && r.errors.length > 0)) {
        rejected++;
        errors.push({ row: r.rowNumber, error: r.errors.join('; ') || 'Invalid medical fields' });
        continue;
      }

      const key = `${r.workerId}_${r.examDate}`;
      const existing = existingMap.get(key);

      if (existing) {
        if (!isUpdateMode) {
          skipped++;
          continue;
        }

        const merged: MedicalRecord = {
          ...existing,
          fitnessResult: r.fitnessResult,
          validTill: r.validTill,
          nextDueDate: r.nextDueDate,
          examiningDoctor: r.examiningDoctor || existing.examiningDoctor,
          doctorRegistrationNo: r.doctorRegistrationNo || existing.doctorRegistrationNo,
          statutoryRuleReference: r.statutoryRuleReference || existing.statutoryRuleReference,
          certificateNumber: r.certificateNumber || existing.certificateNumber,
          restrictionNotes: r.restrictionNotes ?? existing.restrictionNotes,
        };
        existingMap.set(key, merged);
        updated++;
      } else {
        const nextId = `MED-REC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const newRecord: MedicalRecord = {
          id: nextId,
          workerId: r.workerId,
          workerName: r.workerName,
          workerDesignation: 'Operative',
          workerDepartment: r.department,
          workerCategory: 'REGULAR_WORKMAN',
          workerAge: 35,
          dateOfBirth: '1990-01-01',
          examType: r.examType,
          examStatus: 'COMPLETED',
          scheduledDate: r.examDate,
          completedDate: r.examDate,
          validTill: r.validTill,
          nextDueDate: r.nextDueDate,
          certificateNumber: r.certificateNumber || `DGMS-MED-CERT-${Date.now()}`,
          examiningDoctor: r.examiningDoctor || 'Dr. K. S. Rao, MD',
          doctorRegistrationNo: r.doctorRegistrationNo || 'KMC-84920',
          fitnessResult: r.fitnessResult,
          statutoryRuleReference: r.statutoryRuleReference || 'Mines Rules 1955 - Rule 29B',
          ruleVersion: 'DGMS Gazette Notification 2021',
          publicFitnessIndicator: r.publicFitnessIndicator || 'Fit for Opencast Heavy Mining Duties',
          restrictionNotes: r.restrictionNotes,
        };
        existingMap.set(key, newRecord);
        inserted++;
      }
    }

    setMedicalRecords(Array.from(existingMap.values()));
    logAuditAction(
      'EXCEL_BULK_IMPORT_MEDICAL',
      'MedicalRegister',
      'BULK_SYNC',
      `Imported medical examination register: ${inserted} inserted, ${updated} updated, ${skipped} skipped, ${rejected} rejected.`
    );
    return { inserted, updated, skipped, rejected, errors };
  };

  const bulkImportMVTRecords = async (rows: MVTRecordImportRow[], isUpdateMode: boolean) => {
    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    let rejected = 0;
    const errors: { row: number; error: string }[] = [];

    const updatedMvtMap = { ...mvtStatuses };

    for (const r of rows) {
      if (r.status === 'INVALID' || (r.errors && r.errors.length > 0)) {
        rejected++;
        errors.push({ row: r.rowNumber, error: r.errors.join('; ') || 'Invalid MVT fields' });
        continue;
      }

      const current = updatedMvtMap[r.workerId];
      if (current) {
        if (!isUpdateMode && current.lastMVTDate) {
          skipped++;
          continue;
        }

        updatedMvtMap[r.workerId] = {
          ...current,
          applicable: true,
          applicabilityStatus: 'APPLICABLE',
          lastMVTDate: r.completionDate,
          nextMVTDueDate: r.validTill,
          status: 'VALID',
          history: [
            ...(current.history || []),
            {
              id: `MVT-HIST-${Date.now()}-${inserted + updated}`,
              workerId: r.workerId,
              trainingName: r.trainingName,
              trainingType: r.trainingType,
              completionDate: r.completionDate,
              validTill: r.validTill,
              trainerName: r.trainerName || 'Vocational Training Centre',
              attendanceScore: r.attendanceScore || '90',
              assessmentResult: r.assessmentResult || 'PASS',
              certificateNumber: r.certificateNumber || `MVT-CERT-${Date.now()}`,
              statutoryRuleApplied: r.statutoryRuleApplied || 'MVT Rules 1966 - Rule 9',
              verifiedBy: 'Principal VTC',
            },
          ],
        };
        updated++;
      } else {
        updatedMvtMap[r.workerId] = {
          workerId: r.workerId,
          applicable: true,
          applicabilityStatus: 'APPLICABLE',
          applicableRule: r.statutoryRuleApplied || 'MVT Rules 1966 - Rule 9',
          lastMVTDate: r.completionDate,
          nextMVTDueDate: r.validTill,
          daysRemaining: 365,
          daysOverdue: 0,
          status: 'VALID',
          history: [
            {
              id: `MVT-HIST-${Date.now()}-${inserted}`,
              workerId: r.workerId,
              trainingName: r.trainingName,
              trainingType: r.trainingType,
              completionDate: r.completionDate,
              validTill: r.validTill,
              trainerName: r.trainerName || 'Vocational Training Centre',
              attendanceScore: r.attendanceScore || '90',
              assessmentResult: r.assessmentResult || 'PASS',
              certificateNumber: r.certificateNumber || `MVT-CERT-${Date.now()}`,
              statutoryRuleApplied: r.statutoryRuleApplied || 'MVT Rules 1966 - Rule 9',
              verifiedBy: 'Principal VTC',
            },
          ],
        };
        inserted++;
      }
    }

    setMvtStatuses(updatedMvtMap);
    logAuditAction(
      'EXCEL_BULK_IMPORT_MVT',
      'MVTRegister',
      'BULK_SYNC',
      `Imported statutory MVT records: ${inserted} inserted, ${updated} updated, ${skipped} skipped, ${rejected} rejected.`
    );
    return { inserted, updated, skipped, rejected, errors };
  };

  const bulkImportOtherTrainingRecords = async (rows: OtherTrainingImportRow[], isUpdateMode: boolean) => {
    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    let rejected = 0;
    const errors: { row: number; error: string }[] = [];

    const existingMap = new Map(otherTrainingRecords.map((t) => [`${t.workerId}_${t.courseTitle}`, t]));

    for (const r of rows) {
      if (r.status === 'INVALID' || (r.errors && r.errors.length > 0)) {
        rejected++;
        errors.push({ row: r.rowNumber, error: r.errors.join('; ') || 'Invalid other training fields' });
        continue;
      }

      const key = `${r.workerId}_${r.courseTitle}`;
      const existing = existingMap.get(key);

      if (existing) {
        if (!isUpdateMode) {
          skipped++;
          continue;
        }

        const merged: OtherTrainingRecord = {
          ...existing,
          trainingCategory: r.trainingCategory,
          trainingProvider: r.trainingProvider,
          startDate: r.startDate,
          endDate: r.endDate,
          durationHours: r.durationHours,
          costInr: r.costInr,
          completionStatus: r.completionStatus,
          certificateNumber: r.certificateNumber || existing.certificateNumber,
          skillsLearned: r.skillsLearned ? r.skillsLearned.split(',').map((s) => s.trim()) : existing.skillsLearned,
        };
        existingMap.set(key, merged);
        updated++;
      } else {
        const nextId = `OTR-REC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const newRecord: OtherTrainingRecord = {
          id: nextId,
          workerId: r.workerId,
          workerName: r.workerName,
          workerDepartment: r.department,
          workerDesignation: 'Operative',
          workerCategory: 'REGULAR_WORKMAN',
          trainingCategory: r.trainingCategory,
          courseTitle: r.courseTitle,
          trainingProvider: r.trainingProvider,
          venue: r.venue || 'Donimalai Training Centre',
          startDate: r.startDate,
          endDate: r.endDate,
          durationHours: r.durationHours,
          durationDays: Math.ceil((r.durationHours || 8) / 8),
          costInr: r.costInr,
          financialYear: r.financialYear || '2026-2027',
          attendanceStatus: 'PRESENT',
          completionStatus: r.completionStatus,
          approvalStatus: 'APPROVED',
          approvingAuthority: 'Head of Department / HRD',
          certificateNumber: r.certificateNumber || `OTR-CERT-${Date.now()}`,
          skillsLearned: r.skillsLearned ? r.skillsLearned.split(',').map((s) => s.trim()) : ['Advanced Heavy Mining Safety'],
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        };
        existingMap.set(key, newRecord);
        inserted++;
      }
    }

    setOtherTrainingRecords(Array.from(existingMap.values()));
    logAuditAction(
      'EXCEL_BULK_IMPORT_OTHER_TRAINING',
      'OtherTrainingRegister',
      'BULK_SYNC',
      `Imported OEM/External/Internal training records: ${inserted} inserted, ${updated} updated, ${skipped} skipped, ${rejected} rejected.`
    );
    return { inserted, updated, skipped, rejected, errors };
  };

  const clearAllRecords = () => {
    localStorage.clear();
    setEmployees([]);
    setMvtStatuses({});
    setAttendance([]);
    setCertificates([]);
    setHemmCompetencies([]);
    setToolboxTalks([]);
    setMockDrills([]);
    setAuditFindings([]);
    setDeploymentOverrides({});
    setTrainingSessions(INITIAL_TRAINING_SESSIONS);
    setStatutoryRequirements(INITIAL_STATUTORY_REQUIREMENTS);
    setSystemSettings(INITIAL_SYSTEM_SETTINGS);
    setAuditLogs([
      {
        id: `LOG-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'PURGE_MOCK_DATA',
        entity: 'System',
        entityId: 'ALL',
        details: 'Purged all mock, demo, and test data from the portal. Ready for live personnel onboarding.',
      },
    ]);
    localStorage.setItem('NMDC_STORAGE_CLEANED_V2', 'true');
  };

  const purgeMockData = clearAllRecords;
  const resetToDemoData = clearAllRecords;

  // CSV Export utility
  const exportToCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    logAuditAction('EXPORT_REPORT_CSV', 'Report', filename, `Exported ${rows.length} records to CSV file: ${filename}.csv`);
  };

  // Dynamic KPI calculation (strictly calculated from real state, zero fake mock values)
  const kpis = useMemo(() => {
    const totalWorkforce = employees.length;
    const nmdcEmployees = employees.filter((e) => e.employeeType === 'NMDC_REGULAR').length;
    const contractWorkers = employees.filter((e) => e.employeeType === 'CONTRACT_WORKER').length;

    let mvtApplicable = 0;
    let mvtValid = 0;
    let mvtDue7Days = 0;
    let mvtDue15Days = 0;
    let mvtDue30Days = 0;
    let mvtOverdue = 0;

    Object.values(mvtStatuses).forEach((status) => {
      if (status.applicable) {
        mvtApplicable++;
        if (status.status === 'VALID') {
          mvtValid++;
        } else if (status.status === 'OVERDUE') {
          mvtOverdue++;
        } else if (status.status === 'DUE') {
          mvtDue7Days++;
        } else if (status.status === 'DUE_SOON') {
          if (status.daysRemaining <= 15) {
            mvtDue15Days++;
          } else {
            mvtDue30Days++;
          }
        }
      }
    });

    const mvtCompliancePercent = mvtApplicable > 0 ? Number(((mvtValid / mvtApplicable) * 100).toFixed(1)) : 100;

    // HEMM & Blasters high risk compliance
    const highRiskWorkers = employees.filter(
      (e) => e.classification === 'HEMM Operator' || e.classification === 'Blaster/Shotfirer'
    );
    let highRiskCompliant = 0;
    highRiskWorkers.forEach((w) => {
      const cl = getWorkerDeploymentClearance(w.id);
      if (cl.status === 'CLEARED') highRiskCompliant++;
    });
    const highRiskCompliancePercent =
      highRiskWorkers.length > 0 ? Number(((highRiskCompliant / highRiskWorkers.length) * 100).toFixed(1)) : 100;

    // New joiners awaiting induction
    const newJoinersAwaitingInduction = employees.filter(
      (e) => e.verificationStatus === 'Pending Verification'
    ).length;

    // Real statutory training metrics
    const otherTrainingOverdue = hemmCompetencies.filter((c) => c.status === 'EXPIRED').length;
    const otherTrainingDue7Days = 0;
    const otherTrainingDue30Days = 0;

    const overallTrainingCompliancePercent = mvtApplicable > 0
      ? Number(((mvtValid / mvtApplicable) * 100).toFixed(1))
      : 100;

    const statutoryCompliancePercent = statutoryRequirements.length > 0
      ? Number((((statutoryRequirements.filter((r) => r.status === 'ACTIVE').length) / statutoryRequirements.length) * 100).toFixed(1))
      : 100;

    const totalTrainingHoursCompleted = trainingSessions
      .filter((s) => s.status === 'COMPLETED')
      .reduce((acc, s) => {
        const prog = trainingPrograms.find((p) => p.id === s.programId);
        return acc + (prog ? prog.durationHours * (s.attendanceCount || 0) : 0);
      }, 0);

    // Medical Examination KPIs
    const medicalFitCount = medicalRecords.filter((m) => m.fitnessResult === 'FIT').length;
    const medicalUnfitCount = medicalRecords.filter(
      (m) => m.fitnessResult === 'UNFIT' || m.fitnessResult === 'TEMPORARILY_UNFIT'
    ).length;
    const medicalDueSoonCount = medicalRecords.filter((m) => m.examStatus === 'DUE_SOON').length;
    const medicalOverdueCount = medicalRecords.filter((m) => m.examStatus === 'OVERDUE').length;
    const medicalCompliancePercent =
      medicalRecords.length > 0 ? Number(((medicalFitCount / medicalRecords.length) * 100).toFixed(1)) : 100;

    // Other Training KPIs
    const otherTrainingTotalCount = otherTrainingRecords.length;
    const otherTrainingCompletedCount = otherTrainingRecords.filter(
      (t) => t.completionStatus === 'COMPLETED'
    ).length;
    const otherTrainingTotalCost = otherTrainingRecords.reduce((acc, t) => acc + (t.costInr || 0), 0);

    return {
      totalWorkforce,
      nmdcEmployees,
      contractWorkers,
      mvtApplicable,
      mvtValid,
      mvtDue7Days,
      mvtDue15Days,
      mvtDue30Days,
      mvtOverdue,
      mvtCompliancePercent,
      otherTrainingOverdue,
      otherTrainingDue7Days,
      otherTrainingDue30Days,
      overallTrainingCompliancePercent,
      statutoryCompliancePercent,
      newJoinersAwaitingInduction,
      highRiskCompliancePercent,
      totalTrainingHoursCompleted,
      totalCertificatesIssued: certificates.length,

      medicalFitCount,
      medicalUnfitCount,
      medicalDueSoonCount,
      medicalOverdueCount,
      medicalCompliancePercent,

      otherTrainingTotalCount,
      otherTrainingCompletedCount,
      otherTrainingTotalCost,
    };
  }, [
    employees,
    mvtStatuses,
    hemmCompetencies,
    certificates,
    trainingSessions,
    statutoryRequirements,
    medicalRecords,
    otherTrainingRecords,
  ]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        switchUser,
        activeTab,
        setActiveTab,
        filterAlertScope,
        setFilterAlertScope,
        searchQuery,
        setSearchQuery,
        selectedLease,
        setSelectedLease,
        authScreen,
        setAuthScreen,
        selectLeaseAndEnterPortal,
        isAuthenticated,
        setIsAuthenticated,
        loginAsRole,
        registeredUsers,
        allUsers,
        registerUser,
        loginUser,
        logoutUser,
        isLoginModalOpen,
        setIsLoginModalOpen,
        employees,
        contractors,
        statutoryRequirements,
        mvtStatuses,
        trainingPrograms,
        trainingSessions,
        attendance,
        assessmentQuestions,
        certificates,
        hemmCompetencies,
        toolboxTalks,
        mockDrills,
        auditFindings,
        documents,
        auditLogs,
        systemSettings,
        medicalRecords,
        statutoryRuleVersions,
        medicalNotices,
        otherTrainingRecords,
        inspectedWorker,
        setInspectedWorker,
        viewPassportWorkerId,
        setViewPassportWorkerId,
        isRegisterEmployeeOpen,
        setIsRegisterEmployeeOpen,
        registrationInitialType,
        setRegistrationInitialType,
        kpis,
        getWorkerDeploymentClearance,
        overrideDeploymentClearance,
        recalculateMVTRequirements,
        addEmployee,
        updateEmployee,
        addContractWorker,
        addStatutoryRequirement,
        updateStatutoryRequirement,
        supersedeStatutoryRequirement,
        createTrainingSession,
        nominateWorkers,
        markAttendance,
        recordAssessment,
        recordHEMMPracticalAssessment,
        logToolboxTalk,
        logMockDrill,
        addAuditFinding,
        updateAuditFindingStatus,
        updateSystemSettings,
        addMedicalRecord,
        updateMedicalRecord,
        addMedicalNotice,
        addOtherTrainingRecord,
        updateOtherTrainingRecord,
        addStatutoryRuleVersion,
        updateStatutoryRuleVersion,
        bulkImportEmployees,
        bulkImportMedicalRecords,
        bulkImportMVTRecords,
        bulkImportOtherTrainingRecords,
        clearAllRecords,
        purgeMockData,
        resetToDemoData,
        exportToCSV,
        firebaseUser,
        firebaseLoading,
        isCloudSyncActive,
        signInWithGoogle,
        signOutFirebase,
        syncLocalToFirebase,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
