import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NMDCLogo } from './NMDCLogo';
import { Lock, User, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const { loginUser, registerUser } = useApp();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmployeeId, setRegEmployeeId] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDepartment, setRegDepartment] = useState('Mining');
  const [regDesignation, setRegDesignation] = useState('Safety Incharge');
  const [regRole, setRegRole] = useState<UserRole>('Safety Officer');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginId.trim()) {
      setLoginError('Please enter your Employee ID or Email');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await loginUser(loginId.trim(), loginPassword.trim() || undefined);
      if (!res.success) {
        setLoginError(res.error || 'Authentication failed. Please verify credentials.');
      }
    } catch {
      setLoginError('Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim()) {
      setRegError('Please enter full name');
      return;
    }
    if (!regEmail.trim()) {
      setRegError('Please enter email address');
      return;
    }
    if (regPassword && regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await registerUser({
        name: regName.trim(),
        email: regEmail.trim(),
        employeeId: regEmployeeId.trim() || `NMDC-${Date.now().toString().slice(-4)}`,
        department: regDepartment.trim() || 'Mining',
        designation: regDesignation.trim() || 'Officer',
        role: regRole,
        password: regPassword,
      });

      if (!res.success) {
        setRegError(res.error || 'Registration failed');
      }
    } catch {
      setRegError('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 selection:bg-amber-400 selection:text-slate-900">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* NMDC Only */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-2.5 bg-white rounded-2xl shadow-md border border-slate-200">
            <NMDCLogo className="h-16 w-auto" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-wider">
            NMDC
          </h1>
        </div>

        {/* Simple Login and Register Switcher */}
        <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-700">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setLoginError('');
            }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setRegError('');
            }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* Login Form */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-xs text-red-200">
                {loginError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Employee ID or Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="e.g. OFFICER-ADMIN-01 or user@nmdc.co.in"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <LogIn className="w-4 h-4" />
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setRegError('');
                }}
                className="text-xs text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
              >
                Don't have an account? <span className="font-bold underline text-amber-400">Register</span>
              </button>
            </div>
          </form>
        )}

        {/* Register Form */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            {regError && (
              <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-xs text-red-200">
                {regError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Enter full name"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Employee ID
                </label>
                <input
                  type="text"
                  value={regEmployeeId}
                  onChange={(e) => setRegEmployeeId(e.target.value)}
                  placeholder="e.g. NMDC-1042"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={regDepartment}
                  onChange={(e) => setRegDepartment(e.target.value)}
                  placeholder="e.g. Mining"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="name@nmdc.co.in"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Role
              </label>
              <select
                value={regRole}
                onChange={(e) => setRegRole(e.target.value as UserRole)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
              >
                <option value="Safety Officer">Safety Officer</option>
                <option value="Mining Engineer">Mining Engineer</option>
                <option value="MVT Training Officer">MVT Training Officer</option>
                <option value="Medical Officer">Medical Officer</option>
                <option value="Contractor Administrator">Contractor Administrator</option>
                <option value="Employee">Employee</option>
                <option value="Super Administrator">Super Administrator</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password
                </label>
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Confirm Password
                </label>
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Confirm"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-3"
            >
              <UserPlus className="w-4 h-4" />
              {isSubmitting ? 'Registering...' : 'Register'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setLoginError('');
                }}
                className="text-xs text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
              >
                Already have an account? <span className="font-bold underline text-amber-400">Login</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
