import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  HardHat,
  Flame,
  Plus,
} from 'lucide-react';
import { MockDrill } from '../types';

export const SafetyModules: React.FC = () => {
  const {
    toolboxTalks,
    mockDrills,
    logToolboxTalk,
    logMockDrill,
    employees,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'TBT' | 'DRILLS'>('TBT');

  // New TBT Modal State
  const [showTbtModal, setShowTbtModal] = useState(false);
  const [tbtTopic, setTbtTopic] = useState('Haul Road Blind Spots & Reversing Precautions around Heavy Dumpers');
  const [tbtDate, setTbtDate] = useState('2026-10-06');
  const [tbtShift, setTbtShift] = useState('Shift A (06:00-14:00)');
  const [tbtLocation, setTbtLocation] = useState('Pit-1 Quarry Face Bench 825m');
  const [tbtSupervisor, setTbtSupervisor] = useState('Mining Foreman / Shift Incharge');
  const [tbtDept] = useState('Mining');
  const [tbtParticipants, setTbtParticipants] = useState(24);
  const [tbtObservations, setTbtObservations] = useState('');
  const [tbtActions, setTbtActions] = useState('');

  // New Drill Modal State
  const [showDrillModal, setShowDrillModal] = useState(false);
  const [drillType, setDrillType] = useState<MockDrill['drillType']>('Mine Pit Evacuation');
  const [drillDate, setDrillDate] = useState('2026-10-06');
  const [drillLocation, setDrillLocation] = useState('Donimalai Mine Pit-1 Quarry Basin');
  const [drillScenario, setDrillScenario] = useState('');
  const [drillResponseTime, setDrillResponseTime] = useState(6.5);
  const [drillParticipants, setDrillParticipants] = useState(120);
  const [drillEvaluator, setDrillEvaluator] = useState('General Manager (Safety) / Mine Manager');
  const [drillObservations, setDrillObservations] = useState('');
  const [drillGaps, setDrillGaps] = useState('');
  const [drillActions, setDrillActions] = useState('');

  const handleCreateTBT = (e: React.FormEvent) => {
    e.preventDefault();
    logToolboxTalk({
      topic: tbtTopic,
      date: tbtDate,
      shift: tbtShift,
      location: tbtLocation,
      supervisorName: tbtSupervisor,
      department: tbtDept,
      participantCount: Number(tbtParticipants),
      participantIds: employees.slice(0, 4).map((e) => e.id),
      keySafetyObservations: tbtObservations,
      correctiveActions: tbtActions,
      status: 'VERIFIED',
    });
    setShowTbtModal(false);
    alert('Toolbox Talk successfully logged into safety register.');
  };

  const handleCreateDrill = (e: React.FormEvent) => {
    e.preventDefault();
    logMockDrill({
      drillType,
      date: drillDate,
      location: drillLocation,
      scenario: drillScenario,
      responseTimeMinutes: Number(drillResponseTime),
      participantCount: Number(drillParticipants),
      leadEvaluator: drillEvaluator,
      observations: drillObservations,
      gapsIdentified: drillGaps,
      correctiveActions: drillActions,
      status: 'REPORT_SUBMITTED',
    });
    setShowDrillModal(false);
    alert('Emergency Mock Drill report successfully archived.');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700">
                <HardHat className="w-5 h-5" />
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase">
                SAFETY ENGAGEMENT: TOOLBOX TALKS & EMERGENCY MOCK DRILLS
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Daily pre-shift safety briefings • Hazard identification • Emergency evacuation drills & response time evaluation
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'TBT' ? (
              <button
                onClick={() => setShowTbtModal(true)}
                className="px-4 py-2 text-xs font-bold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>LOG TOOLBOX TALK</span>
              </button>
            ) : (
              <button
                onClick={() => setShowDrillModal(true)}
                className="px-4 py-2 text-xs font-bold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>RECORD MOCK DRILL</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mt-4 text-xs">
          <button
            onClick={() => setActiveTab('TBT')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeTab === 'TBT' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            Pre-Shift Toolbox Talks ({toolboxTalks.length})
          </button>
          <button
            onClick={() => setActiveTab('DRILLS')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeTab === 'DRILLS' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            Emergency Mock Drills ({mockDrills.length})
          </button>
        </div>
      </div>

      {activeTab === 'TBT' ? (
        /* Toolbox Talks Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {toolboxTalks.map((tbt) => (
            <div key={tbt.id} className="p-5 rounded-xl bg-white border border-slate-200/90 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-800">{tbt.id}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {tbt.status}
                </span>
              </div>

              <h3 className="text-xs font-bold text-slate-900 leading-snug">{tbt.topic}</h3>

              <div className="space-y-1 text-[11px] text-slate-600">
                <div>Date & Shift: <strong className="text-slate-900">{tbt.date} ({tbt.shift})</strong></div>
                <div>Location: <strong className="text-slate-800">{tbt.location}</strong></div>
                <div>Supervisor: <strong className="text-slate-800">{tbt.supervisorName}</strong></div>
                <div>Attendance: <strong className="text-emerald-700 font-mono font-bold">{tbt.participantCount} Workmen</strong></div>
              </div>

              {tbt.keySafetyObservations && (
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-700">
                  <span className="text-amber-800 font-semibold block text-[10px] uppercase">Safety Observation:</span>
                  {tbt.keySafetyObservations}
                </div>
              )}

              {tbt.correctiveActions && (
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-700">
                  <span className="text-emerald-700 font-semibold block text-[10px] uppercase">Action Enforced:</span>
                  {tbt.correctiveActions}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Emergency Mock Drills */
        <div className="space-y-4">
          {mockDrills.map((drill) => (
            <div key={drill.id} className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-600" />
                  <span className="font-bold text-slate-900 text-sm">{drill.drillType}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-emerald-700 font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Response: {drill.responseTimeMinutes} mins
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {drill.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-700">
                <div>
                  <span className="text-slate-500 text-[10px] block">Location & Date</span>
                  <strong className="text-slate-900">{drill.location} • {drill.date}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Participants</span>
                  <strong className="text-slate-900">{drill.participantCount} Mine Personnel</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Lead Evaluator</span>
                  <strong className="text-slate-800">{drill.leadEvaluator}</strong>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                <strong className="text-slate-900">Drill Scenario:</strong> {drill.scenario}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                  <span className="text-sky-700 font-semibold block text-[10px] uppercase">Gaps Identified:</span>
                  {drill.gapsIdentified}
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                  <span className="text-emerald-700 font-semibold block text-[10px] uppercase">Corrective Actions:</span>
                  {drill.correctiveActions}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Log TBT Modal */}
      {showTbtModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">Log Toolbox Talk</h3>
              <button onClick={() => setShowTbtModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <form onSubmit={handleCreateTBT} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Safety Topic</label>
                <select
                  value={tbtTopic}
                  onChange={(e) => setTbtTopic(e.target.value)}
                  className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1 focus:bg-white"
                >
                  <option value="Haul Road Blind Spots & Reversing Precautions around Heavy Dumpers">Haul Road Blind Spots & Reversing Precautions</option>
                  <option value="Monsoon Bench Drainage, Berm Inspection & Slurry Haul Road Grip">Monsoon Bench Drainage & Berm Inspection</option>
                  <option value="High Voltage LOTO Protocols & Arc Flash PPE in Substations">High Voltage LOTO Protocols & Arc Flash PPE</option>
                  <option value="Tyre Safety & Heat Inflation Hazards on 100T Dumpers">Tyre Safety & Heat Inflation Hazards on 100T Dumpers</option>
                  <option value="Deep Hole Blasting Sentry Guarding & Siren Protocol">Deep Hole Blasting Sentry Guarding & Siren Protocol</option>
                  <option value="Working at Heights & Scaffold Safety on Conveyor Gantries">Working at Heights & Scaffold Safety</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Date</label>
                  <input type="date" value={tbtDate} onChange={(e) => setTbtDate(e.target.value)} className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1 focus:bg-white" required />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Shift</label>
                  <input type="text" value={tbtShift} onChange={(e) => setTbtShift(e.target.value)} className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1 focus:bg-white" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Location</label>
                  <input type="text" value={tbtLocation} onChange={(e) => setTbtLocation(e.target.value)} className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1 focus:bg-white" required />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Participants Count</label>
                  <input type="number" value={tbtParticipants} onChange={(e) => setTbtParticipants(Number(e.target.value))} className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1 focus:bg-white" required />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Supervisor Incharge</label>
                <input type="text" value={tbtSupervisor} onChange={(e) => setTbtSupervisor(e.target.value)} className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1 focus:bg-white" required />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Key Safety Observations</label>
                <textarea rows={2} value={tbtObservations} onChange={(e) => setTbtObservations(e.target.value)} placeholder="Specific field condition observed..." className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1 focus:bg-white" />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Corrective Actions</label>
                <textarea rows={2} value={tbtActions} onChange={(e) => setTbtActions(e.target.value)} placeholder="Immediate preventive measures..." className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1 focus:bg-white" />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowTbtModal(false)} className="px-3 py-1.5 text-slate-500 hover:text-slate-700">Cancel</button>
                <button type="submit" className="px-4 py-1.5 font-bold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400">Log Talk</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Drill Modal */}
      {showDrillModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">Record Emergency Mock Drill</h3>
              <button onClick={() => setShowDrillModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <form onSubmit={handleCreateDrill} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Drill Type</label>
                <select
                  value={drillType}
                  onChange={(e) => setDrillType(e.target.value as any)}
                  className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1 focus:bg-white"
                >
                  <option value="Mine Pit Evacuation">Mine Pit Evacuation</option>
                  <option value="HEMM Fire Emergency">HEMM Fire Emergency</option>
                  <option value="First Aid & Triage">First Aid & Triage</option>
                  <option value="Electrical Substation Emergency">Electrical Substation Emergency</option>
                  <option value="Monsoon Landslide Response">Monsoon Landslide Response</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Date</label>
                  <input type="date" value={drillDate} onChange={(e) => setDrillDate(e.target.value)} className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1 focus:bg-white" required />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Response Time (Minutes)</label>
                  <input type="number" step="0.1" value={drillResponseTime} onChange={(e) => setDrillResponseTime(Number(e.target.value))} className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1 focus:bg-white" required />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Location</label>
                <input type="text" value={drillLocation} onChange={(e) => setDrillLocation(e.target.value)} className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1 focus:bg-white" required />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Scenario Simulated</label>
                <textarea rows={2} value={drillScenario} onChange={(e) => setDrillScenario(e.target.value)} placeholder="Describe the simulated emergency trigger..." className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1 focus:bg-white" required />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Gaps Identified</label>
                <textarea rows={2} value={drillGaps} onChange={(e) => setDrillGaps(e.target.value)} placeholder="Deficiencies in response, equipment, or communication..." className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1 focus:bg-white" />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Corrective Actions</label>
                <textarea rows={2} value={drillActions} onChange={(e) => setDrillActions(e.target.value)} placeholder="Remedial measures assigned..." className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1 focus:bg-white" />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowDrillModal(false)} className="px-3 py-1.5 text-slate-500 hover:text-slate-700">Cancel</button>
                <button type="submit" className="px-4 py-1.5 font-bold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400">Archive Drill Report</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
