import React from 'react';
import { useApp, MiningLease } from '../context/AppContext';
import { NMDCLogo } from './NMDCLogo';
import {
  Mountain,
  HardHat,
  ShieldCheck,
  Building2,
  ArrowRight,
  LogOut,
  MapPin,
  CheckCircle2,
  Activity,
  Layers,
  FileText,
  Sparkles,
} from 'lucide-react';

export const LeaseSelectionPage: React.FC = () => {
  const {
    currentUser,
    logoutUser,
    selectLeaseAndEnterPortal,
    kpis,
  } = useApp();

  const handleSelectLease = (lease: MiningLease) => {
    selectLeaseAndEnterPortal(lease);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 via-slate-850 to-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-amber-400 selection:text-slate-900">
      {/* Top Header Bar */}
      <header className="border-b border-slate-700/60 bg-slate-900/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-white p-1 flex items-center justify-center shadow-md border border-slate-200 shrink-0">
            <NMDCLogo className="h-full w-auto" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                Navratna PSU
              </span>
              <span className="text-xs text-slate-400 font-medium">Donimalai Complex • Bellary District</span>
            </div>
            <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white">
              NATIONAL MINERAL DEVELOPMENT CORPORATION LIMITED
            </h1>
          </div>
        </div>

        {/* Current User Profile & Sign Out */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2.5 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-xl">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full border border-amber-400/60 object-cover"
            />
            <div className="text-left">
              <div className="text-xs font-bold text-white leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-amber-400 font-medium leading-tight">
                {currentUser.role}
              </div>
            </div>
          </div>

          <button
            onClick={() => logoutUser()}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            title="Sign Out to Login Page"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Middle of Page: Two prominent tabs for DIOM ML 2396 and KIOM ML 1111 */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        <div className="max-w-5xl w-full text-center space-y-6">
          {/* Centered Instruction Header */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              OPERATIONAL MINING LEASE SELECTION
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Select Mining Lease to Enter Portal
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
              Please choose between <strong className="text-amber-400">DIOM ML 2396</strong> and <strong className="text-amber-400">KIOM ML 1111</strong> to launch the safety, MVT, medical & statutory compliance management system.
            </p>
          </div>

          {/* TWO PROMINENT TABS IN THE MIDDLE OF THE PAGE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 max-w-4xl mx-auto">
            {/* TAB 1: DIOM ML 2396 */}
            <div
              onClick={() => handleSelectLease('DIOM ML 2396')}
              className="group relative bg-linear-to-b from-slate-800 to-slate-850 hover:from-slate-750 hover:to-slate-800 rounded-2xl border-2 border-slate-700 hover:border-amber-400 p-6 sm:p-8 text-left transition-all duration-200 shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider">
                    <Mountain className="w-4 h-4 text-amber-400" />
                    Lease ML 2396
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-700">
                    Code: 29/03/DNM
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white group-hover:text-amber-300 transition-colors">
                    DIOM ML 2396
                  </h3>
                  <div className="text-xs font-bold text-slate-300 mt-1">
                    Donimalai Iron Ore Mine (Bellary District)
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Flagship mechanized opencast iron ore mine, crushing, screening & beneficiation facilities, hill top conveyor and railway loading yard.
                </p>

                {/* Features & Key Indicators */}
                <div className="space-y-2 pt-2 border-t border-slate-700/60 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>MVT Refresher Compliance: <strong className="text-white">{kpis.mvtCompliancePercent}%</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Active Monitored Workforce: <strong className="text-white">{kpis.totalWorkforce} Personnel</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Donimalai Hill Range, Sandur Taluk, Bellary</span>
                  </div>
                </div>
              </div>

              {/* Action Button inside Tab */}
              <div className="mt-8 pt-4">
                <button
                  type="button"
                  className="w-full py-3.5 px-4 bg-amber-500 group-hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <span>Enter DIOM ML 2396 Portal</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* TAB 2: KIOM ML 1111 */}
            <div
              onClick={() => handleSelectLease('KIOM ML 1111')}
              className="group relative bg-linear-to-b from-slate-800 to-slate-850 hover:from-slate-750 hover:to-slate-800 rounded-2xl border-2 border-slate-700 hover:border-blue-400 p-6 sm:p-8 text-left transition-all duration-200 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-black uppercase tracking-wider">
                    <Layers className="w-4 h-4 text-blue-400" />
                    Lease ML 1111
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-700">
                    Code: 29/03/KWM
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white group-hover:text-blue-300 transition-colors">
                    KIOM ML 1111
                  </h3>
                  <div className="text-xs font-bold text-slate-300 mt-1">
                    Kumaraswamy Iron Ore Mine (Sandur Taluk)
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  High-capacity mechanized iron ore mining lease with downhill conveyor corridor, secondary crushing unit, environmental buffer & safety zones.
                </p>

                {/* Features & Key Indicators */}
                <div className="space-y-2 pt-2 border-t border-slate-700/60 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Rule 29B Medical Fitness: <strong className="text-white">{kpis.medicalCompliancePercent}%</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>HEMM Simulator Verified: <strong className="text-white">Active 100%</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Kumaraswamy Hill Range, Sandur Taluk, Bellary</span>
                  </div>
                </div>
              </div>

              {/* Action Button inside Tab */}
              <div className="mt-8 pt-4">
                <button
                  type="button"
                  className="w-full py-3.5 px-4 bg-blue-600 group-hover:bg-blue-500 text-white font-black rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <span>Enter KIOM ML 1111 Portal</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Help & Switch Note */}
          <div className="text-xs text-slate-400 pt-2">
            You can also seamlessly switch between <strong className="text-white">DIOM ML 2396</strong> and <strong className="text-white">KIOM ML 1111</strong> from inside the portal navigation at any time.
          </div>
        </div>
      </main>

      {/* Mandatory Creation Credits Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 px-2 py-0.5 rounded shadow-xs">
              CREATION CREDITS
            </span>
            <span className="text-slate-200 font-bold">
              Concept by <span className="text-amber-400 font-black">Anil Kumar CGM (Prod.)</span>, Designed and Developed by <span className="text-amber-300 font-black">Abhishek Singh</span>,
            </span>
            <span className="text-amber-500 font-black text-sm">•</span>
          </div>

          <div className="text-[11px] text-slate-400">
            NMDC Limited • Donimalai Complex (Bellary District, Karnataka) • DGMS Approved
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LeaseSelectionPage;
