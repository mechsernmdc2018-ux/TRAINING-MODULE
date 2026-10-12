import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Cpu,
  Plus,
  Search,
  HardHat,
} from 'lucide-react';
import { HEMMCompetency } from '../types';

export const CompetencyHEMM: React.FC = () => {
  const {
    hemmCompetencies,
    employees,
    recordHEMMPracticalAssessment,
    setViewPassportWorkerId,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);

  // Form State for Practical Assessment
  const [operatorId, setOperatorId] = useState(employees[0]?.id || '');
  const [equipmentModel, setEquipmentModel] = useState('BEML BH-100S');
  const [evaluatorName, setEvaluatorName] = useState('Senior Safety Officer & OEM Specialist');

  // Practical 9-point Checklist
  const [preStart, setPreStart] = useState<'SATISFACTORY' | 'NEEDS_IMPROVEMENT'>('SATISFACTORY');
  const [ppe, setPpe] = useState<'SATISFACTORY' | 'NEEDS_IMPROVEMENT'>('SATISFACTORY');
  const [brake, setBrake] = useState<'SATISFACTORY' | 'NEEDS_IMPROVEMENT'>('SATISFACTORY');
  const [steering, setSteering] = useState<'SATISFACTORY' | 'NEEDS_IMPROVEMENT'>('SATISFACTORY');
  const [hornLights, setHornLights] = useState<'SATISFACTORY' | 'NEEDS_IMPROVEMENT'>('SATISFACTORY');
  const [seatBelt, setSeatBelt] = useState<'SATISFACTORY' | 'NEEDS_IMPROVEMENT'>('SATISFACTORY');
  const [haulRoad, setHaulRoad] = useState<'SATISFACTORY' | 'NEEDS_IMPROVEMENT'>('SATISFACTORY');
  const [parkingDumping, setParkingDumping] = useState<'SATISFACTORY' | 'NEEDS_IMPROVEMENT'>('SATISFACTORY');
  const [emergencyResp, setEmergencyResp] = useState<'SATISFACTORY' | 'NEEDS_IMPROVEMENT'>('SATISFACTORY');
  const [remarks, setRemarks] = useState('Practical driving evaluation conducted on Donimalai haul road and pit face.');

  const handleRecordPractical = (e: React.FormEvent) => {
    e.preventDefault();

    const checklistValues = [preStart, ppe, brake, steering, hornLights, seatBelt, haulRoad, parkingDumping, emergencyResp];
    const satisfactoryCount = checklistValues.filter((v) => v === 'SATISFACTORY').length;
    const scorePercent = Math.round((satisfactoryCount / checklistValues.length) * 100);

    const result: HEMMCompetency['result'] = scorePercent >= 80 ? 'COMPETENT' : scorePercent >= 60 ? 'REASSESSMENT_REQUIRED' : 'NOT_COMPETENT';
    const authNo = `NMDC/DNM/HEMM/${equipmentModel.split(' ')[0]}/${Date.now().toString().slice(-4)}`;

    const todayStr = '2026-10-06';
    const nextYear = new Date('2026-10-06');
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const validUntilStr = nextYear.toISOString().split('T')[0];

    recordHEMMPracticalAssessment({
      workerId: operatorId,
      equipmentModel,
      authorisationNumber: authNo,
      preStartInspection: preStart,
      ppeCompliance: ppe,
      brakeCheck: brake,
      steeringCheck: steering,
      hornLightAlarm: hornLights,
      seatBeltSafeOperation: seatBelt,
      haulRoadTrafficRules: haulRoad,
      parkingDumpingTechnique: parkingDumping,
      emergencyResponse: emergencyResp,
      overallScorePercent: scorePercent,
      result,
      evaluatedBy: evaluatorName,
      evaluatedDate: todayStr,
      validUntil: validUntilStr,
      status: result === 'COMPETENT' ? 'VALID' : 'EXPIRED',
      remarks,
    });

    setShowAssessmentModal(false);
    alert(`Practical Assessment Logged for Operator ${operatorId}. Result: ${result} (${scorePercent}%). Valid until ${validUntilStr}`);
  };

  const filteredCompetencies = hemmCompetencies.filter((c) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const worker = employees.find((e) => e.id === c.workerId);
      const matchWorker = worker?.name.toLowerCase().includes(q) || c.workerId.toLowerCase().includes(q);
      const matchEquip = c.equipmentModel.toLowerCase().includes(q);
      const matchAuth = c.authorisationNumber.toLowerCase().includes(q);
      if (!matchWorker && !matchEquip && !matchAuth) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-orange-50 border border-orange-200 text-orange-700">
                <Cpu className="w-5 h-5" />
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase">
                HEMM OPERATOR COMPETENCY & PRACTICAL ASSESSMENT ENGINE
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              DGMS (Tech) Circular No. 04 of 2020 • MMR 1961 Regulation 181 • 13-Point Practical Safety Evaluation & Authorisation
            </p>
          </div>

          <button
            onClick={() => setShowAssessmentModal(true)}
            className="px-4 py-2 text-xs font-bold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>RECORD PRACTICAL ASSESSMENT</span>
          </button>
        </div>

        {/* Equipment Fleet Showcase */}
        <div className="mt-4 flex items-center gap-2.5 overflow-x-auto text-xs pb-1">
          <span className="text-slate-500 font-semibold whitespace-nowrap">Donimalai Heavy Fleet:</span>
          {[
            'BEML BH-100S (100T Dumper)',
            'Tata Hitachi EX-1200 (Excavator)',
            'Hitachi EX1900 (Shovel)',
            'BEML BD-355 (Dozer)',
            'Komatsu WA600 (Wheel Loader)',
            'BEML BG825 (Grader)',
            'Epiroc IDM-45 (Drill)',
          ].map((eq) => (
            <span key={eq} className="px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-slate-700 whitespace-nowrap font-mono text-[11px]">
              {eq}
            </span>
          ))}
        </div>
      </div>

      {/* Competency Registry */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search operator, equipment model, auth no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 text-xs text-slate-900 pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-amber-500 focus:bg-white"
            />
          </div>

          <span className="text-xs font-mono text-slate-500">
            {filteredCompetencies.length} Operator Authorisations
          </span>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                <th className="py-2.5 px-3">Operator Name & ID</th>
                <th className="py-2.5 px-3">Equipment Model</th>
                <th className="py-2.5 px-3">Authorisation No</th>
                <th className="py-2.5 px-3 text-center">Score %</th>
                <th className="py-2.5 px-3 text-center">DGMS Practical Result</th>
                <th className="py-2.5 px-3">Evaluation Date</th>
                <th className="py-2.5 px-3">Valid Until</th>
                <th className="py-2.5 px-3 text-right">Passport</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCompetencies.map((comp) => {
                const worker = employees.find((e) => e.id === comp.workerId);

                return (
                  <tr key={comp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900 hover:text-amber-700 cursor-pointer" onClick={() => setViewPassportWorkerId(comp.workerId)}>
                        {worker?.name || comp.workerId}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">{comp.workerId}</div>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{comp.equipmentModel}</td>
                    <td className="py-2.5 px-3 font-mono text-amber-800 font-medium">{comp.authorisationNumber}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">
                      {comp.overallScorePercent}%
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          comp.result === 'COMPETENT'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {comp.result.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{comp.evaluatedDate}</td>
                    <td className="py-2.5 px-3 font-mono">
                      <span
                        className={
                          comp.validUntil < '2026-10-06' ? 'text-rose-700 font-bold' : 'text-slate-700'
                        }
                      >
                        {comp.validUntil}
                      </span>
                      {comp.validUntil < '2026-10-06' && (
                        <span className="block text-[10px] text-rose-700 font-bold uppercase">Expired</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setViewPassportWorkerId(comp.workerId)}
                        className="px-2.5 py-1 text-[11px] font-bold bg-slate-50 hover:bg-slate-100 text-amber-800 rounded border border-slate-200 cursor-pointer"
                      >
                        Passport
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Practical Assessment Modal */}
      {showAssessmentModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HardHat className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                  DGMS 13-Point Practical Assessment Form
                </h3>
              </div>
              <button onClick={() => setShowAssessmentModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordPractical} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Select Operator</label>
                  <select
                    value={operatorId}
                    onChange={(e) => setOperatorId(e.target.value)}
                    className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1 focus:bg-white"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.id}) • {emp.designation}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700">Equipment Model</label>
                  <select
                    value={equipmentModel}
                    onChange={(e) => setEquipmentModel(e.target.value)}
                    className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1 focus:bg-white"
                  >
                    <option value="BEML BH-100S">BEML BH-100S (100T Rear Dumper)</option>
                    <option value="Tata Hitachi EX-1200">Tata Hitachi EX-1200 (Hydraulic Excavator)</option>
                    <option value="Hitachi EX1900">Hitachi EX1900 (Electric Shovel)</option>
                    <option value="BEML BD-355">BEML BD-355 (Crawler Dozer)</option>
                    <option value="Komatsu WA600">Komatsu WA600 (Wheel Loader)</option>
                    <option value="BEML BG825">BEML BG825 (Motor Grader)</option>
                    <option value="Epiroc IDM-45">Epiroc IDM-45 (Blast Hole Drill)</option>
                  </select>
                </div>
              </div>

              {/* Checklist items */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
                <span className="font-bold text-amber-900 uppercase tracking-wider block">
                  DGMS Practical Checklist Parameters
                </span>

                {[
                  { label: '1. Walkaround & Pre-start physical inspection', state: preStart, setter: setPreStart },
                  { label: '2. Mandatory PPE compliance (helmet, steel toe boots, vest, goggles)', state: ppe, setter: setPpe },
                  { label: '3. Service, Retarder & Emergency Brake test holding check', state: brake, setter: setBrake },
                  { label: '4. Steering response & secondary emergency steering test', state: steering, setter: setSteering },
                  { label: '5. Horn, headlights, rear work lights & reverse alarm', state: hornLights, setter: setHornLights },
                  { label: '6. Three-point seat belt fastened & cabin housekeeping', state: seatBelt, setter: setSeatBelt },
                  { label: '7. Haul road right-of-way, speed limit & safe following distance (50m+)', state: haulRoad, setter: setHaulRoad },
                  { label: '8. Waste dump safety berm approach & safe tipping angle protocol', state: parkingDumping, setter: setParkingDumping },
                  { label: '9. Emergency engine shutdown & evacuation drill', state: emergencyResp, setter: setEmergencyResp },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1.5 border-b border-slate-200/80 last:border-0">
                    <span className="text-slate-800">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => item.setter('SATISFACTORY')}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer ${
                          item.state === 'SATISFACTORY' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        Satisfactory
                      </button>
                      <button
                        type="button"
                        onClick={() => item.setter('NEEDS_IMPROVEMENT')}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer ${
                          item.state === 'NEEDS_IMPROVEMENT' ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        Fail
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="font-semibold text-slate-700">Evaluator Officers</label>
                <input
                  type="text"
                  value={evaluatorName}
                  onChange={(e) => setEvaluatorName(e.target.value)}
                  className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAssessmentModal(false)}
                  className="px-4 py-2 text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 transition-colors shadow-xs"
                >
                  CALCULATE SCORE & ISSUE AUTHORISATION
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
