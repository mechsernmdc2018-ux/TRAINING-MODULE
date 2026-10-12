import React, { useState } from 'react';
import { useApp, OFFICIAL_USERS, ActiveTab } from '../context/AppContext';
import {
  ShieldAlert,
  Search,
  BookOpen,
  FileText,
  Users,
  Settings,
  Calendar,
  CheckCircle2,
  HardHat,
  Cpu,
  FileCheck,
  ChevronDown,
  Layers,
  Sparkles,
  Award,
  Cloud,
  LogIn,
  LogOut,
} from 'lucide-react';

interface PrimaryNavGroup {
  id: string;
  label: string;
  icon: React.ReactNode;
  defaultTab: ActiveTab;
  tabIds: ActiveTab[];
  badge?: number;
}

export const Header: React.FC = () => {
  const {
    currentUser,
    switchUser,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    kpis,
    setViewPassportWorkerId,
    firebaseUser,
    isCloudSyncActive,
    signInWithGoogle,
    signOutFirebase,
  } = useApp();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showQuickPassportModal, setShowQuickPassportModal] = useState(false);
  const [showJumpMenu, setShowJumpMenu] = useState(false);
  const [quickPassportInput, setQuickPassportInput] = useState('');

  // Primary 6 intuitive categories
  const primaryNavGroups: PrimaryNavGroup[] = [
    {
      id: 'group-dashboard',
      label: 'Dashboard',
      icon: <Layers className="w-4 h-4" />,
      defaultTab: 'dashboard',
      tabIds: ['dashboard'],
    },
    {
      id: 'group-mvt',
      label: 'MVT & Clearance',
      icon: <ShieldAlert className="w-4 h-4" />,
      defaultTab: 'mvt-command',
      tabIds: ['mvt-command', 'deployment'],
      badge: kpis.mvtOverdue > 0 ? kpis.mvtOverdue : undefined,
    },
    {
      id: 'group-workforce',
      label: 'Workforce',
      icon: <Users className="w-4 h-4" />,
      defaultTab: 'workforce',
      tabIds: ['workforce'],
    },
    {
      id: 'group-training',
      label: 'Training & Safety',
      icon: <BookOpen className="w-4 h-4" />,
      defaultTab: 'training',
      tabIds: ['training', 'competency', 'safety'],
    },
    {
      id: 'group-statutory',
      label: 'Statutory & Audits',
      icon: <FileCheck className="w-4 h-4" />,
      defaultTab: 'statutory-engine',
      tabIds: ['statutory-engine', 'documents', 'audits'],
    },
    {
      id: 'group-reports-admin',
      label: 'Reports & Admin',
      icon: <Settings className="w-4 h-4" />,
      defaultTab: 'reports',
      tabIds: ['reports', 'administration', 'implementation-plan'],
    },
  ];

  // Map sub-tabs
  const subTabConfigs: Record<
    string,
    { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[]
  > = {
    'group-mvt': [
      {
        id: 'mvt-command',
        label: 'MVT Command Centre',
        icon: <ShieldAlert className="w-3.5 h-3.5" />,
        badge: kpis.mvtOverdue > 0 ? kpis.mvtOverdue : undefined,
      },
      {
        id: 'deployment',
        label: 'Gate Clearance & Overrides',
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      },
    ],
    'group-training': [
      {
        id: 'training',
        label: 'Training Programs & Assessment',
        icon: <BookOpen className="w-3.5 h-3.5" />,
      },
      {
        id: 'competency',
        label: 'HEMM Operator Competency',
        icon: <Cpu className="w-3.5 h-3.5" />,
      },
      {
        id: 'safety',
        label: 'Toolbox Talks & Mock Drills',
        icon: <HardHat className="w-3.5 h-3.5" />,
      },
    ],
    'group-statutory': [
      {
        id: 'statutory-engine',
        label: 'Statutory Compliance Engine',
        icon: <FileCheck className="w-3.5 h-3.5" />,
      },
      {
        id: 'documents',
        label: 'DGMS Circulars & SOPs',
        icon: <Calendar className="w-3.5 h-3.5" />,
      },
      {
        id: 'audits',
        label: 'Safety Audits & CAPA',
        icon: <FileText className="w-3.5 h-3.5" />,
      },
    ],
    'group-reports-admin': [
      {
        id: 'reports',
        label: 'Management MIS & Reports',
        icon: <Award className="w-3.5 h-3.5" />,
      },
      {
        id: 'administration',
        label: 'System Administration & Audit Trail',
        icon: <Settings className="w-3.5 h-3.5" />,
      },
      {
        id: 'implementation-plan',
        label: 'Implementation Roadmap & Tests',
        icon: <Sparkles className="w-3.5 h-3.5" />,
      },
    ],
  };

  // Find currently active primary group
  const currentGroup =
    primaryNavGroups.find((g) => g.tabIds.includes(activeTab)) ||
    primaryNavGroups[0];

  const currentSubTabs = subTabConfigs[currentGroup.id];

  const handleQuickPassportSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickPassportInput.trim()) {
      setViewPassportWorkerId(quickPassportInput.trim());
      setShowQuickPassportModal(false);
      setQuickPassportInput('');
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Bar: Brand, Search, Quick Passport, Demo Account Switcher */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* NMDC Brand Emblem & Clean Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center shadow-xs text-slate-950 font-black text-base tracking-tight border border-amber-400 shrink-0">
              NMDC
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  Navratna PSU
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Donimalai Complex • Mine Code: 29/03/DNM
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 leading-tight">
                NMDC LIMITED • TRAINING & SAFETY MANAGEMENT PORTAL
              </h1>
              <div className="text-[11px] text-slate-500 hidden sm:flex items-center gap-1.5">
                <span>Training</span>
                <span>·</span>
                <span>MVT Compliance</span>
                <span>·</span>
                <span>Competency</span>
                <span>·</span>
                <span>DGMS Statutory Compliance</span>
                <span>·</span>
                <span>Safety</span>
              </div>
            </div>
          </div>

          {/* Right Action Tools: Search, Passport, Role Switcher */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Search Input */}
            <div className="relative min-w-[170px] sm:min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search worker, MVT, rule..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 text-xs text-slate-900 placeholder-slate-400 pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>

            {/* Quick Digital Safety Passport Verification Button */}
            <button
              onClick={() => setShowQuickPassportModal(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg border border-amber-300 transition-colors shadow-xs"
              title="Verify Digital Safety Passport by Worker ID"
            >
              <HardHat className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden md:inline">Verify</span> Passport
            </button>

            {/* Firebase Cloud Firestore Sync & Google Auth */}
            {firebaseUser ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-300 text-xs shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-semibold hidden xl:inline">Firebase Live</span>
                <span className="text-[11px] text-emerald-700 max-w-[90px] truncate hidden md:inline">
                  {firebaseUser.email?.split('@')[0]}
                </span>
                <button
                  onClick={() => signOutFirebase()}
                  title={`Signed in as ${firebaseUser.email || 'Cloud Officer'}. Click to sign out.`}
                  className="ml-1 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 rounded"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => signInWithGoogle()}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 rounded-lg border border-indigo-200 transition-colors shadow-xs cursor-pointer"
                title="Connect to Firebase Firestore with Google Account"
              >
                <Cloud className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Firebase</span> Sync
                <LogIn className="w-3 h-3 text-indigo-500" />
              </button>
            )}

            {/* Official Officer Profile Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-left transition-colors shadow-xs cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0">
                  {currentUser.role.charAt(0)}
                </div>
                <div className="hidden sm:block">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-900 leading-none">
                      {currentUser.role}
                    </span>
                    <span className="text-[9px] uppercase font-bold px-1 py-0.2 rounded bg-slate-100 text-slate-800 border border-slate-300">
                      OFFICER
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-700 font-semibold block leading-tight">
                    {currentUser.department}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-0.5" />
              </button>

              {/* Role Dropdown */}
              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50">
                  <div className="px-3 py-1.5 border-b border-slate-100">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-800">
                      AUTHORIZED OFFICER PROFILES
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Switch executive role to review permissions:
                    </p>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {OFFICIAL_USERS.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => {
                          switchUser(user.id);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors flex items-center justify-between ${
                          currentUser.id === user.id
                            ? 'bg-amber-50/80 border-l-3 border-amber-500'
                            : ''
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            {user.role}
                          </div>
                          <div className="text-[11px] text-amber-700 font-medium">
                            {user.designation}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate max-w-[200px]">
                            Dept: {user.department}
                          </div>
                        </div>
                        {currentUser.id === user.id && (
                          <span className="text-[10px] bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded font-bold">
                            Active
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Primary Navigation Ribbon (6 Clean Pillars) */}
      <div className="border-t border-slate-200 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <nav className="flex space-x-1 overflow-x-auto py-1 scrollbar-none">
              {primaryNavGroups.map((group) => {
                const isGroupActive = group.id === currentGroup.id;
                return (
                  <button
                    key={group.id}
                    onClick={() => {
                      if (!isGroupActive) {
                        setActiveTab(group.defaultTab);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                      isGroupActive
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    <span className={isGroupActive ? 'text-amber-600' : 'text-slate-400'}>
                      {group.icon}
                    </span>
                    <span>{group.label}</span>
                    {group.badge !== undefined && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-rose-100 text-rose-700 border border-rose-200 leading-tight">
                        {group.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Quick Module Jump Menu */}
            <div className="relative hidden lg:block shrink-0 pl-2">
              <button
                onClick={() => setShowJumpMenu(!showJumpMenu)}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-200/50"
              >
                <span>All Modules</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {showJumpMenu && (
                <div className="absolute right-0 mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-50 text-xs">
                  <div className="font-bold text-[10px] text-slate-400 uppercase px-2 py-1">
                    Quick Navigation
                  </div>
                  <div className="space-y-0.5">
                    {[
                      { id: 'dashboard', label: 'Executive Dashboard' },
                      { id: 'mvt-command', label: 'MVT Command Centre' },
                      { id: 'deployment', label: 'Gate Clearance & Overrides' },
                      { id: 'workforce', label: 'Workforce (Employees & Contractors)' },
                      { id: 'training', label: 'Training Sessions & Assessment' },
                      { id: 'competency', label: 'HEMM Operator Competency' },
                      { id: 'statutory-engine', label: 'Statutory Compliance Engine' },
                      { id: 'safety', label: 'Toolbox Talks & Mock Drills' },
                      { id: 'audits', label: 'Audits & CAPA' },
                      { id: 'reports', label: 'Reports & MIS' },
                      { id: 'documents', label: 'DGMS / SOPs Repository' },
                      { id: 'administration', label: 'System Admin & Audit Trail' },
                      { id: 'implementation-plan', label: 'Implementation Roadmap' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id as ActiveTab);
                          setShowJumpMenu(false);
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded transition-colors ${
                          activeTab === item.id
                            ? 'bg-amber-50 text-amber-900 font-bold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Sub-Tabs Ribbon (Clean, Light, Simple) */}
      {currentSubTabs && currentSubTabs.length > 1 && (
        <div className="border-t border-slate-200/80 bg-white py-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider pr-2">
                Views:
              </span>
              {currentSubTabs.map((subTab) => {
                const isSubActive = activeTab === subTab.id;
                return (
                  <button
                    key={subTab.id}
                    onClick={() => setActiveTab(subTab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs transition-colors cursor-pointer whitespace-nowrap ${
                      isSubActive
                        ? 'bg-amber-50 text-amber-900 font-bold border border-amber-300'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {subTab.icon}
                    <span>{subTab.label}</span>
                    {subTab.badge !== undefined && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-rose-600 text-white">
                        {subTab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Quick Passport Search Modal */}
      {showQuickPassportModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HardHat className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Digital Safety Passport Verification
                </h3>
              </div>
              <button
                onClick={() => setShowQuickPassportModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-600 mt-3">
              Enter Employee ID or Contractor Worker ID (e.g.,{' '}
              <code className="text-amber-800 font-bold font-mono">
                NMDC-EMP-1001
              </code>{' '}
              or{' '}
              <code className="text-amber-800 font-bold font-mono">
                CONT-WRK-2001
              </code>
              ).
            </p>
            <form onSubmit={handleQuickPassportSearch} className="mt-4 space-y-3">
              <input
                type="text"
                placeholder="e.g. NMDC-EMP-1001 or CONT-WRK-2001"
                value={quickPassportInput}
                onChange={(e) => setQuickPassportInput(e.target.value)}
                className="w-full bg-slate-50 text-sm text-slate-900 px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500 focus:bg-white"
                autoFocus
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuickPassportModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 transition-colors shadow-xs"
                >
                  View Digital Passport
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
