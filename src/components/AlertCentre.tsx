import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, ChevronRight } from 'lucide-react';

export const AlertCentre: React.FC = () => {
  const { kpis, setActiveTab, setFilterAlertScope } = useApp();

  const handleAlertClick = (scope: string, targetTab: 'mvt-command' | 'training' | 'workforce' | 'competency') => {
    setFilterAlertScope(scope);
    setActiveTab(targetTab);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-600">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-wide uppercase flex items-center gap-2">
              TRAINING & STATUTORY COMPLIANCE ALERT CENTRE
            </h2>
            <p className="text-xs text-slate-500">
              DGMS & NMDC Donimalai compliance radar • Click any alert badge to inspect affected workers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Calculated for:</span>
          <span className="font-mono text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            07-OCT-2026 Shift A
          </span>
        </div>
      </div>

      {/* Grid of Actionable Alert Cards (Light & Simple) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-3">
        {/* 1. MVT Overdue */}
        <button
          onClick={() => handleAlertClick('MVT_OVERDUE', 'mvt-command')}
          className="group text-left p-3 rounded-lg bg-rose-50 hover:bg-rose-100/80 border border-rose-200 transition-all shadow-xs cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
            <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Critical</span>
          </div>
          <div className="text-2xl font-black text-rose-700 mt-1 font-mono tracking-tight group-hover:scale-105 transition-transform">
            {kpis.mvtOverdue}
          </div>
          <div className="text-xs font-bold text-rose-900 mt-0.5 leading-snug">
            MVT OVERDUE
          </div>
          <div className="text-[10px] text-rose-600 mt-1 flex items-center justify-between font-semibold">
            <span>View workers</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        {/* 2. Other Mandatory Training Overdue */}
        <button
          onClick={() => handleAlertClick('OTHER_OVERDUE', 'competency')}
          className="group text-left p-3 rounded-lg bg-rose-50/70 hover:bg-rose-100/70 border border-rose-200 transition-all shadow-xs cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
            <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Statutory</span>
          </div>
          <div className="text-2xl font-black text-rose-700 mt-1 font-mono tracking-tight group-hover:scale-105 transition-transform">
            {kpis.otherTrainingOverdue}
          </div>
          <div className="text-xs font-bold text-rose-900 mt-0.5 leading-snug">
            OTHER OVERDUE
          </div>
          <div className="text-[10px] text-rose-600 mt-1 flex items-center justify-between font-semibold">
            <span>HEMM / LOTO</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        {/* 3. MVT Due within 7 Days */}
        <button
          onClick={() => handleAlertClick('MVT_DUE_7', 'mvt-command')}
          className="group text-left p-3 rounded-lg bg-orange-50 hover:bg-orange-100/80 border border-orange-200 transition-all shadow-xs cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider">Urgent</span>
          </div>
          <div className="text-2xl font-black text-orange-700 mt-1 font-mono tracking-tight group-hover:scale-105 transition-transform">
            {kpis.mvtDue7Days}
          </div>
          <div className="text-xs font-bold text-orange-950 mt-0.5 leading-snug">
            MVT DUE ≤ 7 DAYS
          </div>
          <div className="text-[10px] text-orange-600 mt-1 flex items-center justify-between font-semibold">
            <span>Nominate now</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        {/* 4. Other Training Due within 7 Days */}
        <button
          onClick={() => handleAlertClick('OTHER_DUE_7', 'training')}
          className="group text-left p-3 rounded-lg bg-amber-50 hover:bg-amber-100/80 border border-amber-200 transition-all shadow-xs cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Priority</span>
          </div>
          <div className="text-2xl font-black text-amber-800 mt-1 font-mono tracking-tight group-hover:scale-105 transition-transform">
            {kpis.otherTrainingDue7Days}
          </div>
          <div className="text-xs font-bold text-amber-950 mt-0.5 leading-snug">
            OTHER DUE ≤ 7 D
          </div>
          <div className="text-[10px] text-amber-700 mt-1 flex items-center justify-between font-semibold">
            <span>Refresher batches</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        {/* 5. MVT Due within 30 Days */}
        <button
          onClick={() => handleAlertClick('MVT_DUE_30', 'mvt-command')}
          className="group text-left p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all shadow-xs cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Planning</span>
          </div>
          <div className="text-2xl font-black text-slate-800 mt-1 font-mono tracking-tight group-hover:scale-105 transition-transform">
            {kpis.mvtDue30Days}
          </div>
          <div className="text-xs font-bold text-slate-800 mt-0.5 leading-snug">
            MVT DUE ≤ 30 DAYS
          </div>
          <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between font-semibold">
            <span>Planner queue</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        {/* 6. New Joiners Awaiting Induction */}
        <button
          onClick={() => handleAlertClick('INDUCTION_PENDING', 'workforce')}
          className="group text-left p-3 rounded-lg bg-sky-50 hover:bg-sky-100/80 border border-sky-200 transition-all shadow-xs cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider">Gate Check</span>
          </div>
          <div className="text-2xl font-black text-sky-700 mt-1 font-mono tracking-tight group-hover:scale-105 transition-transform">
            {kpis.newJoinersAwaitingInduction}
          </div>
          <div className="text-xs font-bold text-sky-950 mt-0.5 leading-snug">
            INDUCTION PENDING
          </div>
          <div className="text-[10px] text-sky-600 mt-1 flex items-center justify-between font-semibold">
            <span>Pass withheld</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>
      </div>
    </div>
  );
};
