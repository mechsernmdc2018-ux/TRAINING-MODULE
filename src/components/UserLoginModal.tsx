import React, { useState } from 'react';
import { useApp, OFFICIAL_USERS } from '../context/AppContext';
import { NMDCLogo } from './NMDCLogo';
import {
  Lock,
  Mail,
  User,
  KeyRound,
  Eye,
  EyeOff,
  Building,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  LogOut,
  Sparkles,
  Phone,
  BadgeCheck,
  Layers,
  ArrowRight,
  Shield,
  UserPlus,
  LogIn,
  FileSpreadsheet,
  UploadCloud,
} from 'lucide-react';
import { UserRole } from '../types';

export const UserLoginModal: React.FC = () => {
  const {
    currentUser,
    loginUser,
    registerUser,
    logoutUser,
    switchUser,
    registeredUsers,
    isLoginModalOpen,
    setIsLoginModalOpen,
    setActiveTab,
  } = useApp();

  const [activeMode, setActiveMode] = useState<'LOGIN' | 'REGISTER' | 'PROFILE'>('LOGIN');

  // Login form state
  const [loginEmailOrId, setLoginEmailOrId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regEmployeeId, setRegEmployeeId] = useState('');
  const [regPhone, setRegPhone] = useState('+91 ');
  const [regDepartment, setRegDepartment] = useState('Mining');
  const [regDesignation, setRegDesignation] = useState('Safety Incharge');
  const [regRole, setRegRole] = useState<UserRole>('Safety Officer');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regAgreed, setRegAgreed] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // Quick switcher drawer state
  const [showQuickOfficers, setShowQuickOfficers] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccess('');

    if (!loginEmailOrId.trim()) {
      setLoginError('Please enter your official email, employee ID, or username.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await loginUser(loginEmailOrId, loginPassword);
      if (res.success && res.user) {
        setLoginSuccess(`Welcome back, ${res.user.name}! Authenticated as ${res.user.role}.`);
        setTimeout(() => {
          setIsLoginModalOpen(false);
          setLoginSuccess('');
        }, 1200);
      } else {
        setLoginError(res.error || 'Login failed. Please verify your credentials.');
      }
    } catch (err) {
      setLoginError('An unexpected authentication error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regName.trim()) {
      setRegError('Please provide your full name.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setRegError('Please provide a valid official email address.');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters in length.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match. Please re-enter.');
      return;
    }
    if (!regAgreed) {
      setRegError('Please acknowledge the statutory compliance and terms of access.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await registerUser({
        name: regName.trim(),
        email: regEmail.trim(),
        employeeId: regEmployeeId.trim() || `NMDC-EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        phone: regPhone.trim(),
        department: regDepartment,
        designation: regDesignation.trim(),
        role: regRole,
        password: regPassword,
      });

      if (res.success && res.user) {
        setRegSuccess(`Registration successful! Welcome to the portal, ${res.user.name}.`);
        setTimeout(() => {
          setIsLoginModalOpen(false);
          setRegSuccess('');
        }, 1500);
      } else {
        setRegError(res.error || 'Registration failed. Email may already be registered.');
      }
    } catch (err) {
      setRegError('Failed to complete registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with NMDC Brand Insignia */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-5 text-white flex items-center justify-between border-b border-amber-500/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-white rounded-xl shadow-xs shrink-0 flex items-center justify-center p-0.5">
              <NMDCLogo className="h-full w-auto" showText={true} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded">
                  NMDC PORTAL ACCESS
                </span>
                <span className="text-[11px] text-slate-300 font-medium">Donimalai Complex</span>
              </div>
              <h2 className="text-base font-extrabold tracking-tight text-white mt-0.5">
                Personnel Authentication & Registration
              </h2>
            </div>
          </div>
          <button
            onClick={() => setIsLoginModalOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold shrink-0">
          <button
            onClick={() => {
              setActiveMode('LOGIN');
              setLoginError('');
            }}
            className={`flex-1 py-3 text-center transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeMode === 'LOGIN'
                ? 'bg-white text-slate-950 border-b-2 border-amber-500 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LogIn className="w-3.5 h-3.5 text-amber-600" />
            Sign In / Login
          </button>

          <button
            onClick={() => {
              setActiveMode('REGISTER');
              setRegError('');
            }}
            className={`flex-1 py-3 text-center transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeMode === 'REGISTER'
                ? 'bg-white text-slate-950 border-b-2 border-amber-500 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-sky-600" />
            Create Account / Register
          </button>

          <button
            onClick={() => setActiveMode('PROFILE')}
            className={`flex-1 py-3 text-center transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeMode === 'PROFILE'
                ? 'bg-white text-slate-950 border-b-2 border-amber-500 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
            Active Profile
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* MODE 1: LOGIN */}
          {activeMode === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong>Official PSU Authentication:</strong> Sign in with your registered @nmdc.co.in email, Employee ID, or select an official officer profile below.
                </div>
              </div>

              {loginError && (
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {loginSuccess && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{loginSuccess}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  Official Email, Employee ID, or Role
                </label>
                <input
                  type="text"
                  placeholder="e.g. officer@nmdc.co.in, NMDC-EMP-1001, or Super Administrator"
                  value={loginEmailOrId}
                  onChange={(e) => setLoginEmailOrId(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                    Account Password
                  </label>
                  <span className="text-[11px] text-slate-400">Default: password or leave blank for demo</span>
                </div>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    placeholder="Enter your security password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                {isSubmitting ? 'Authenticating...' : 'Sign In to Portal'}
              </button>

              {/* Quick Officer Selector for Demo/Inspection */}
              <div className="pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowQuickOfficers(!showQuickOfficers)}
                  className="w-full flex items-center justify-between text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 p-2.5 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Quick Demo Profiles (1-Click Switch)
                  </span>
                  <span className="text-[11px] text-slate-400">{showQuickOfficers ? 'Hide' : 'Show All'}</span>
                </button>

                {showQuickOfficers && (
                  <div className="mt-2.5 max-h-48 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100">
                    {OFFICIAL_USERS.map((usr) => (
                      <div
                        key={usr.id}
                        onClick={() => {
                          switchUser(usr.id);
                          setLoginSuccess(`Switched to ${usr.role} (${usr.name})`);
                          setTimeout(() => {
                            setIsLoginModalOpen(false);
                            setLoginSuccess('');
                          }, 800);
                        }}
                        className="p-2 hover:bg-amber-50 rounded-lg cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900">{usr.role}</div>
                          <div className="text-[11px] text-slate-500">{usr.name} • {usr.department}</div>
                        </div>
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                          Select
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </form>
          )}

          {/* MODE 2: REGISTER */}
          {activeMode === 'REGISTER' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-xs text-sky-900 flex items-start gap-2.5">
                <UserPlus className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
                <div>
                  <strong>Individual Personnel Registration:</strong> Register an official officer, supervisor, or staff profile one by one.
                </div>
              </div>

              {/* Statutory Alternative to Individual Registration */}
              <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 rounded-xl border border-emerald-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-xs">
                <div className="flex items-start gap-2.5 text-emerald-950">
                  <div className="p-1.5 bg-emerald-600 text-white rounded-lg shrink-0 mt-0.5">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.2 rounded">
                        Alternative Method
                      </span>
                      <strong className="text-emerald-900">Bulk Workforce Excel Upload</strong>
                    </div>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      Need to register multiple employees? Upload the official NMDC Employee Master Excel sheet to register, enroll in Form B, and provision accounts for all employees at once.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginModalOpen(false);
                    setActiveTab('excel-upload');
                  }}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-[11px] shrink-0 transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload Excel Sheet</span>
                </button>
              </div>

              {regError && (
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              {regSuccess && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{regSuccess}</span>
                </div>
              )}

              {/* Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-500" /> Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Chandra"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-500" /> Official Email *
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. ramesh.chandra@nmdc.co.in"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>

              {/* Employee ID & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-slate-500" /> Employee / Officer ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. NMDC-EMP-3041"
                    value={regEmployeeId}
                    onChange={(e) => setRegEmployeeId(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-500" /> Mobile Number
                  </label>
                  <input
                    type="text"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Role & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <Briefcase className="w-3 h-3 text-slate-500" /> System Role *
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:border-amber-500 bg-white"
                  >
                    <option value="Super Administrator">Super Administrator</option>
                    <option value="Training Officer">Training Officer (Principal VTC)</option>
                    <option value="Safety Officer">Safety Officer (DGMS Liaison)</option>
                    <option value="Medical Officer">Medical Officer (Rule 29B)</option>
                    <option value="Mine Manager">Mine Manager (DGMS First Class)</option>
                    <option value="Department Head">Department Head</option>
                    <option value="Supervisor">Mine Foreman / Supervisor</option>
                    <option value="Trainer">Vocational Instructor / Trainer</option>
                    <option value="Auditor">Statutory Safety Auditor</option>
                    <option value="Employee">Employee / Operative</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <Building className="w-3 h-3 text-slate-500" /> Department
                  </label>
                  <select
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:border-amber-500 bg-white"
                  >
                    <option value="Mining">Mining Operations</option>
                    <option value="Safety">Safety & DGMS Compliance</option>
                    <option value="Training">Vocational Training Centre (VTC)</option>
                    <option value="Medical">Donimalai Project Hospital</option>
                    <option value="Mechanical Services">Mechanical Services</option>
                    <option value="Electrical">Electrical Engineering</option>
                    <option value="Administration">Human Resources & Administration</option>
                    <option value="Security">Security & CISF Liaison</option>
                  </select>
                </div>
              </div>

              {/* Designation */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Official Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Assistant General Manager (Safety), Senior Medical Officer"
                  value={regDesignation}
                  onChange={(e) => setRegDesignation(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:border-amber-500"
                />
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <KeyRound className="w-3 h-3 text-slate-500" /> Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      placeholder="Min 6 characters"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:border-amber-500 pr-9"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    Confirm Password *
                  </label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    placeholder="Repeat password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              {/* Undertaking Checkbox */}
              <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={regAgreed}
                  onChange={(e) => setRegAgreed(e.target.checked)}
                  className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                  required
                />
                <span>
                  I declare that I am an authorized NMDC personnel / contractor officer and agree to handle statutory safety records under Mines Vocational Training Rules 1966.
                </span>
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                {isSubmitting ? 'Registering...' : 'Register Official Account'}
              </button>
            </form>
          )}

          {/* MODE 3: ACTIVE PROFILE */}
          {activeMode === 'PROFILE' && (
            <div className="space-y-5">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 border-2 border-amber-400 text-amber-400 font-extrabold text-lg flex items-center justify-center shrink-0 shadow-xs">
                  {currentUser.role.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                      ACTIVE SESSION
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">{currentUser.id}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{currentUser.name}</h3>
                  <div className="text-xs font-semibold text-amber-800">{currentUser.designation}</div>
                  <div className="text-[11px] text-slate-500">{currentUser.department} • Donimalai Complex</div>
                </div>
              </div>

              {/* Permissions list */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Assigned Statutory Permissions ({currentUser.permissions.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {currentUser.permissions.map((perm) => (
                    <span
                      key={perm}
                      className="px-2.5 py-1 bg-slate-100 text-slate-800 text-[11px] font-semibold rounded-lg border border-slate-200"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              </div>

              {/* Registered user accounts directory */}
              {registeredUsers.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    Locally Registered Accounts ({registeredUsers.length})
                  </h4>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {registeredUsers.map((u) => (
                      <div
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setIsLoginModalOpen(false);
                        }}
                        className={`p-2 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                          currentUser.id === u.id
                            ? 'bg-amber-50 border-amber-300 font-bold'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-slate-900">{u.name}</div>
                          <div className="text-[11px] text-slate-500">{u.role} • {u.email}</div>
                        </div>
                        {currentUser.id === u.id ? (
                          <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold">
                            Current
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 hover:text-slate-900 font-semibold">
                            Switch
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => {
                    logoutUser();
                    setActiveMode('LOGIN');
                  }}
                  className="flex-1 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs rounded-xl border border-rose-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out Session
                </button>
                <button
                  onClick={() => setIsLoginModalOpen(false)}
                  className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info & concept credits */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
          <span className="font-semibold text-slate-700">
            DGMS Compliant Portal • Mines Vocational Training 1966
          </span>
          <span className="text-[10.5px] text-slate-600 font-medium">
            Concept by <strong className="text-slate-950">Anil Kumar CGM (Prod.)</strong>, Designed and Developed by <strong className="text-amber-900">Abhishek Singh</strong>, <span className="text-amber-600 font-bold">•</span>
          </span>
        </div>
      </div>
    </div>
  );
};
