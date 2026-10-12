import React from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Award,
  QrCode,
  Printer,
  X,
  HeartPulse,
} from 'lucide-react';
import { getPersonnelAvatar } from '../utils/avatarUtils';

export const SafetyPassportModal: React.FC = () => {
  const {
    viewPassportWorkerId,
    setViewPassportWorkerId,
    employees,
    mvtStatuses,
    certificates,
    hemmCompetencies,
    getWorkerDeploymentClearance,
  } = useApp();

  if (!viewPassportWorkerId) return null;

  const worker = employees.find(
    (e) => e.id.toLowerCase() === viewPassportWorkerId.toLowerCase()
  );

  if (!worker) {
    return (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 text-center text-xs text-slate-700 shadow-xl">
          <div className="text-rose-600 font-bold text-sm mb-2">Worker Not Found</div>
          <p>No personnel record found for identification code: {viewPassportWorkerId}</p>
          <button
            onClick={() => setViewPassportWorkerId(null)}
            className="mt-4 px-4 py-1.5 text-xs font-semibold bg-slate-100 text-slate-800 rounded-lg hover:bg-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const mvt = mvtStatuses[worker.id];
  const clearance = getWorkerDeploymentClearance(worker.id);
  const workerCerts = certificates.filter((c) => c.workerId === worker.id);
  const workerCompetencies = hemmCompetencies.filter((c) => c.workerId === worker.id);

  const isMedicalValid = worker.medicalFitnessValidTill >= '2026-10-06';

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full shadow-2xl my-8 overflow-hidden print:bg-white print:text-black">
        {/* Top Header */}
        <div className="bg-slate-50 p-5 border-b border-slate-200 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black text-lg shadow-sm border border-amber-400">
              NMDC
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-widest uppercase text-amber-800">
                GOVT. OF INDIA ENTERPRISE • DONIMALAI COMPLEX
              </div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                DIGITAL MINER SAFETY PASSPORT & ENTRY AUTHORISATION
              </h2>
            </div>
          </div>

          <button
            onClick={() => setViewPassportWorkerId(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 print:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Passport Body */}
        <div className="p-6 space-y-6">
          {/* Personnel Identity Banner */}
          <div className="flex flex-col sm:flex-row items-start gap-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <img
              src={worker.photoUrl || getPersonnelAvatar(worker.name, worker.employeeType === 'NMDC_REGULAR' ? 'REGULAR' : 'CONTRACT')}
              alt={worker.name}
              onError={(e) => {
                e.currentTarget.src = getPersonnelAvatar(worker.name, worker.employeeType === 'NMDC_REGULAR' ? 'REGULAR' : 'CONTRACT');
              }}
              className="w-24 h-24 rounded-xl object-cover border-2 border-amber-400 shadow-sm shrink-0"
            />
            <div className="flex-1 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900">{worker.name}</h3>
                  <div className="font-mono text-xs font-bold text-amber-800">{worker.id}</div>
                </div>

                {/* Clearance Gate Badge */}
                <div className="text-right">
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase ${
                      clearance.status === 'CLEARED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : clearance.status === 'CONDITIONAL'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {clearance.status.replace('_', ' ')}
                  </span>
                  <span className="block text-[10px] text-slate-500 mt-1">Gate Pass Clearance</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 text-[11px] text-slate-700">
                <div>
                  <span className="text-slate-500 block text-[10px]">Department</span>
                  <strong className="text-slate-900">{worker.department}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Designation</span>
                  <strong className="text-slate-900">{worker.designation}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Classification</span>
                  <strong className="text-amber-800 font-bold">{worker.classification}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Agency / Employer</span>
                  <strong className="text-slate-900">{worker.contractorName || 'NMDC Limited Regular'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Shift & Section</span>
                  <strong className="text-slate-800">{worker.shift}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Deployment Zone</span>
                  <strong className="text-slate-800">{worker.workLocation}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Statutory Compliance Triad: MVT • Medical • Competency */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 1. MVT Status Card */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase">MVT Vocational Training</span>
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    mvt?.status === 'VALID'
                      ? 'bg-emerald-600'
                      : mvt?.status === 'DUE' || mvt?.status === 'DUE_SOON'
                      ? 'bg-amber-500'
                      : 'bg-rose-600'
                  }`}
                />
              </div>
              <div className="text-sm font-bold text-slate-900">
                {mvt?.status === 'VALID' ? 'Rule 9 Valid' : mvt?.status || 'N/A'}
              </div>
              <div className="text-[11px] text-slate-600">
                Next Due: <strong className="text-slate-900">{mvt?.nextMVTDueDate || 'N/A'}</strong>
              </div>
              {mvt?.daysOverdue ? (
                <div className="text-[10px] text-rose-700 font-bold">
                  {mvt.daysOverdue} Days Overdue
                </div>
              ) : (
                <div className="text-[10px] text-emerald-700">
                  {mvt?.daysRemaining} Days Validity Left
                </div>
              )}
            </div>

            {/* 2. Medical Fitness Card */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Periodic Medical Exam</span>
                <HeartPulse className={`w-3.5 h-3.5 ${isMedicalValid ? 'text-emerald-600' : 'text-rose-600'}`} />
              </div>
              <div className="text-sm font-bold text-slate-900">
                {isMedicalValid ? 'Fit for Mining Duty' : 'Medical Fitness Expired'}
              </div>
              <div className="text-[11px] text-slate-600">
                Valid Till: <strong className={isMedicalValid ? 'text-slate-900' : 'text-rose-700 font-bold'}>{worker.medicalFitnessValidTill}</strong>
              </div>
              <div className="text-[10px] text-slate-500">
                Examined at NMDC Project Hospital
              </div>
            </div>

            {/* 3. Safety Induction / Verification */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Induction & Verification</span>
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-sm font-bold text-slate-900">
                {worker.verificationStatus}
              </div>
              <div className="text-[11px] text-slate-600">
                Joining Date: <strong className="text-slate-900">{worker.dateOfJoining}</strong>
              </div>
              <div className="text-[10px] text-slate-500">
                Gate Entry Permit Approved
              </div>
            </div>
          </div>

          {/* HEMM Equipment Authorisations */}
          {workerCompetencies.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-600" />
                Heavy Earth Moving Machinery (HEMM) Authorisations
              </h4>
              <div className="space-y-2">
                {workerCompetencies.map((comp) => (
                  <div key={comp.id} className="p-2.5 rounded bg-white border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{comp.equipmentModel}</div>
                      <div className="text-[10px] font-mono text-amber-800">{comp.authorisationNumber}</div>
                    </div>
                    <div className="text-right text-[11px]">
                      <span className="text-emerald-700 font-bold font-mono">{comp.overallScorePercent}% Practical</span>
                      <div className="text-[10px] text-slate-500">Valid till {comp.validUntil}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Digital Certificates List */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-600" />
              Accredited Statutory Certificates ({workerCerts.length})
            </h4>
            {workerCerts.length > 0 ? (
              <div className="space-y-2">
                {workerCerts.map((cert) => (
                  <div key={cert.id} className="p-2.5 rounded bg-white border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{cert.trainingTitle}</div>
                      <div className="text-[10px] font-mono text-slate-500">{cert.certificateNumber}</div>
                    </div>
                    <div className="text-right text-[11px]">
                      <div className="text-emerald-700 font-bold">{cert.status}</div>
                      <div className="text-[10px] text-slate-500">Expires {cert.validUntil}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-500 italic text-[11px]">
                No separate digital certificates generated yet. MVT Form B ledger active.
              </div>
            )}
          </div>

          {/* QR Verification & Authentication Block */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white p-1 rounded-lg border border-amber-400 shrink-0 flex items-center justify-center">
                <QrCode className="w-9 h-9 text-slate-900" />
              </div>
              <div className="text-xs">
                <span className="font-mono text-amber-900 font-bold block">
                  NMDC-PASSPORT-{worker.id}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Scan at Security Checkpoint or Quarry Gate to verify live deployment clearance.
                </span>
              </div>
            </div>
            <div className="text-right text-[10px] text-slate-500 font-mono">
              Timestamp: 2026-10-07 10:30:00<br />
              Donimalai Mining Area
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between print:hidden">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 text-xs font-bold bg-white text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-300 flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Digital Passport</span>
          </button>
          <button
            onClick={() => setViewPassportWorkerId(null)}
            className="px-5 py-2 text-xs font-bold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
