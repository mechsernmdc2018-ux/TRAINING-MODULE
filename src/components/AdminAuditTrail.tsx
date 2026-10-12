import React, { useState } from 'react';
import { useApp, OFFICIAL_USERS } from '../context/AppContext';
import {
  Settings,
  Shield,
  RotateCcw,
  Sliders,
  Search,
  Trash2,
  Cloud,
  Database,
  CheckCircle2,
  LogIn,
  LogOut,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { Permission } from '../types';

export const AdminAuditTrail: React.FC = () => {
  const {
    auditLogs,
    systemSettings,
    updateSystemSettings,
    clearAllRecords,
    purgeMockData,
    firebaseUser,
    isCloudSyncActive,
    signInWithGoogle,
    signOutFirebase,
    syncLocalToFirebase,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'AUDIT_LOGS' | 'SETTINGS' | 'ROLES_PERMISSIONS' | 'FIREBASE_CLOUD'>('AUDIT_LOGS');
  const [logSearch, setLogSearch] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Local settings state
  const [threshold, setThreshold] = useState(systemSettings.contractorComplianceThresholdPercent);
  const [passMark, setPassMark] = useState(systemSettings.assessmentPassingPercentage);
  const [certPrefix, setCertPrefix] = useState(systemSettings.certificateNumberPrefix);

  const permissionsList: Permission[] = [
    'View',
    'Create',
    'Edit',
    'Approve',
    'Verify',
    'Schedule',
    'Conduct',
    'Assess',
    'Issue Certificate',
    'Export',
    'Configure',
    'Administer',
  ];

  const filteredLogs = auditLogs.filter((log) => {
    if (logSearch.trim()) {
      const q = logSearch.toLowerCase();
      const mAction = log.action.toLowerCase().includes(q);
      const mUser = log.userName.toLowerCase().includes(q);
      const mDetails = log.details.toLowerCase().includes(q);
      const mEntity = log.entity.toLowerCase().includes(q);
      if (!mAction && !mUser && !mDetails && !mEntity) return false;
    }
    return true;
  });

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemSettings({
      ...systemSettings,
      contractorComplianceThresholdPercent: Number(threshold),
      assessmentPassingPercentage: Number(passMark),
      certificateNumberPrefix: certPrefix,
    });
    setNotification({ message: 'System settings and compliance thresholds saved successfully.', type: 'success' });
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification Banner */}
      {notification && (
        <div
          className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : notification.type === 'error'
              ? 'bg-rose-50 border-rose-300 text-rose-900'
              : 'bg-indigo-50 border-indigo-300 text-indigo-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Header (Clean Light Theme) */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700">
                <Settings className="w-5 h-5" />
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase">
                ADMINISTRATION & IMMUTABLE AUDIT TRAIL
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Role-based access matrix • Statutory threshold configuration • Permanent compliance audit ledger • Firebase Cloud sync
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.confirm('Purge all mock and test records from the portal? This gives you a completely clean operational state.')) {
                  purgeMockData();
                  setNotification({ message: 'All mock/fake data removed. The portal is in clean operational mode.', type: 'info' });
                  setTimeout(() => setNotification(null), 4000);
                }
              }}
              className="px-3.5 py-1.5 text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-100 flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purge Mock Data</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center flex-wrap gap-2 mt-4 text-xs">
          <button
            onClick={() => setActiveTab('AUDIT_LOGS')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeTab === 'AUDIT_LOGS'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            Immutable Audit Log ({auditLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('SETTINGS')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeTab === 'SETTINGS'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            System Settings & Thresholds
          </button>
          <button
            onClick={() => setActiveTab('ROLES_PERMISSIONS')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeTab === 'ROLES_PERMISSIONS'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            Granular Role & Permissions Matrix
          </button>
          <button
            onClick={() => setActiveTab('FIREBASE_CLOUD')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'FIREBASE_CLOUD'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            <Cloud className="w-3.5 h-3.5 text-amber-600" />
            <span>Firebase & Cloud Sync</span>
            {isCloudSyncActive && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* AUDIT LOGS TAB */}
      {activeTab === 'AUDIT_LOGS' && (
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="relative min-w-[260px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search audit action, user, entity, details..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                className="w-full bg-slate-50 text-xs text-slate-900 pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>

            <span className="text-xs font-mono font-semibold text-slate-500">
              {filteredLogs.length} Immutable Log Entries
            </span>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Officer / User</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Entity & ID</th>
                  <th className="py-2.5 px-3">Event Details & State Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 text-[11px]">
                    <td className="py-2 px-3 text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-2 px-3 text-slate-900 font-semibold font-sans">{log.userName}</td>
                    <td className="py-2 px-3 text-amber-800 font-sans font-medium">{log.userRole}</td>
                    <td className="py-2 px-3 font-bold text-sky-700">{log.action}</td>
                    <td className="py-2 px-3 text-slate-700">
                      {log.entity} <span className="text-slate-400 text-[10px]">({log.entityId})</span>
                    </td>
                    <td className="py-2 px-3 text-slate-700 font-sans">
                      <div>{log.details}</div>
                      {log.oldValue && log.newValue && (
                        <div className="text-[10px] text-amber-800 font-mono mt-0.5">
                          [{log.oldValue}] ➔ [{log.newValue}]
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SYSTEM SETTINGS TAB */}
      {activeTab === 'SETTINGS' && (
        <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs max-w-3xl">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-600" />
            Configurable Portal Parameters & Statutory Thresholds
          </h3>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700">Contractor MVT Compliance Threshold (%)</label>
                <input
                  type="number"
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-200 mt-1 focus:bg-white focus:outline-none focus:border-amber-500"
                  min="50"
                  max="100"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Contractors falling below this threshold trigger prominent alert banners.
                </span>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Assessment Passing Mark (%)</label>
                <input
                  type="number"
                  value={passMark}
                  onChange={(e) => setPassMark(Number(e.target.value))}
                  className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-200 mt-1 focus:bg-white focus:outline-none focus:border-amber-500"
                  min="50"
                  max="100"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Minimum percentage required to generate accredited certificate.
                </span>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700">Certificate Number Prefix</label>
              <input
                type="text"
                value={certPrefix}
                onChange={(e) => setCertPrefix(e.target.value)}
                className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-200 mt-1 focus:bg-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 block uppercase">MVT Advance Alert Schedule</span>
              <div className="flex items-center gap-2 flex-wrap">
                {systemSettings.mvtAdvanceAlertDays.map((days) => (
                  <span key={days} className="px-2.5 py-1 rounded bg-white border border-slate-200 font-mono text-slate-700 shadow-2xs font-semibold">
                    {days} Days Advance
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-slate-500">
                Dispatches multi-channel alerts to Worker, Supervisor, HOD and Contractor representative.
              </p>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 transition-colors shadow-xs cursor-pointer"
              >
                Save System Configuration
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ROLES & PERMISSIONS MATRIX TAB */}
      {activeTab === 'ROLES_PERMISSIONS' && (
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-600" />
            Granular Role-Based Access Control (RBAC) Matrix
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                  <th className="py-2.5 px-3">Role</th>
                  {permissionsList.map((perm) => (
                    <th key={perm} className="py-2.5 px-2 text-center text-[10px] whitespace-nowrap">
                      {perm}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {OFFICIAL_USERS.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{user.role}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[180px]">{user.designation}</div>
                    </td>
                    {permissionsList.map((perm) => {
                      const hasPerm = user.permissions.includes(perm);
                      return (
                        <td key={perm} className="py-2.5 px-2 text-center">
                          {hasPerm ? (
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" title={`Permitted: ${perm}`} />
                          ) : (
                            <span className="text-slate-300 font-mono text-xs">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FIREBASE & CLOUD PERSISTENCE TAB */}
      {activeTab === 'FIREBASE_CLOUD' && (
        <div className="space-y-6">
          {/* Main Status Card */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-black shadow-2xs">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                      Google Cloud Firestore & Firebase Auth
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      PROVISIONED & ACTIVE
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enterprise Cloud NoSQL Database • Zero-Trust ABAC Security Rules • Real-time Multi-Device Sync
                  </p>
                </div>
              </div>

              {/* Action sync button */}
              <div className="flex items-center gap-2">
                <button
                  disabled={isSyncing}
                  onClick={async () => {
                    if (!firebaseUser) {
                      setNotification({
                        message: 'Please sign in with your Google account first to sync to Firebase Cloud Firestore.',
                        type: 'info',
                      });
                      return;
                    }
                    setIsSyncing(true);
                    const res = await syncLocalToFirebase();
                    setIsSyncing(false);
                    if (res.success) {
                      setNotification({
                        message: `Successfully uploaded ${res.count} records to Cloud Firestore!`,
                        type: 'success',
                      });
                    } else {
                      setNotification({
                        message: res.error || 'Failed to sync to Cloud Firestore.',
                        type: 'error',
                      });
                    }
                    setTimeout(() => setNotification(null), 5000);
                  }}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer ${
                    isSyncing
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Synchronizing...' : 'Sync Local Records to Cloud'}</span>
                </button>
              </div>
            </div>

            {/* Cloud Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
              <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  Firebase Project ID
                </span>
                <span className="text-xs font-mono font-bold text-slate-900 mt-1 block select-all">
                  premium-woods-m71nt
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  Firestore Database ID
                </span>
                <span className="text-xs font-mono font-bold text-slate-900 mt-1 block truncate select-all" title="ai-studio-nmdcdonimalaitra-f7181906-64e5-4dfc-a90d-c56677564405">
                  ai-studio-nmdcdonimalaitra...
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  Cloud Region
                </span>
                <span className="text-xs font-bold text-slate-900 mt-1 block">
                  asia-east1 (Asia East)
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  Security Rules
                </span>
                <span className="text-xs font-bold text-emerald-700 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Deployed (Zero-Trust ABAC)
                </span>
              </div>
            </div>
          </div>

          {/* Authentication & User Session Panel */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-600" />
              Firebase Cloud Authentication
            </h4>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/70">
              <div>
                {firebaseUser ? (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold text-slate-900">
                        Connected as {firebaseUser.email || 'Authenticated Officer'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      UID: <span className="font-mono text-[10px]">{firebaseUser.uid}</span> • Real-time cloud listeners active.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="text-xs font-bold text-slate-900">
                        Local Offline Operational Mode
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Sign in with Google to enable real-time cloud sync across mine control rooms and handheld inspection tablets.
                    </p>
                  </div>
                )}
              </div>

              <div>
                {firebaseUser ? (
                  <button
                    onClick={() => signOutFirebase()}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out from Firebase</span>
                  </button>
                ) : (
                  <button
                    onClick={() => signInWithGoogle()}
                    className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 cursor-pointer shadow-2xs transition-colors"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In with Google</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Active Cloud Collections */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Cloud className="w-4 h-4 text-amber-600" />
              Connected Firestore Collections Schema
            </h4>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden text-xs">
              <div className="p-3 bg-slate-50 font-semibold text-slate-600 grid grid-cols-12 gap-2 text-[11px]">
                <span className="col-span-4">Collection Path</span>
                <span className="col-span-5">Data Entity</span>
                <span className="col-span-3 text-right">Access Rules</span>
              </div>
              <div className="p-3 grid grid-cols-12 gap-2 hover:bg-slate-50/50">
                <span className="col-span-4 font-mono font-bold text-slate-900">/employees</span>
                <span className="col-span-5 text-slate-600">Personnel records (NMDC Regular & Contractor Workmen)</span>
                <span className="col-span-3 text-right text-emerald-700 font-semibold">Strict ABAC</span>
              </div>
              <div className="p-3 grid grid-cols-12 gap-2 hover:bg-slate-50/50">
                <span className="col-span-4 font-mono font-bold text-slate-900">/contractors</span>
                <span className="col-span-5 text-slate-600">Contracting agencies and work order records</span>
                <span className="col-span-3 text-right text-emerald-700 font-semibold">Strict ABAC</span>
              </div>
              <div className="p-3 grid grid-cols-12 gap-2 hover:bg-slate-50/50">
                <span className="col-span-4 font-mono font-bold text-slate-900">/trainingSessions</span>
                <span className="col-span-5 text-slate-600">MVT vocational batches and attendance records</span>
                <span className="col-span-3 text-right text-emerald-700 font-semibold">Strict ABAC</span>
              </div>
              <div className="p-3 grid grid-cols-12 gap-2 hover:bg-slate-50/50">
                <span className="col-span-4 font-mono font-bold text-slate-900">/statutoryRequirements</span>
                <span className="col-span-5 text-slate-600">DGMS circulars, Mines Act, and SOP rules</span>
                <span className="col-span-3 text-right text-emerald-700 font-semibold">Strict ABAC</span>
              </div>
              <div className="p-3 grid grid-cols-12 gap-2 hover:bg-slate-50/50">
                <span className="col-span-4 font-mono font-bold text-slate-900">/auditLogs</span>
                <span className="col-span-5 text-slate-600">Tamper-evident statutory audit trail</span>
                <span className="col-span-3 text-right text-amber-700 font-semibold">Append-Only</span>
              </div>
              <div className="p-3 grid grid-cols-12 gap-2 hover:bg-slate-50/50">
                <span className="col-span-4 font-mono font-bold text-slate-900">/certificates</span>
                <span className="col-span-5 text-slate-600">Issued qualification and training certificates</span>
                <span className="col-span-3 text-right text-emerald-700 font-semibold">Strict ABAC</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
