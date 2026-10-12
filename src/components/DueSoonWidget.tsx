import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TrainingSession, Employee } from '../types';
import {
  Clock,
  Calendar,
  UserPlus,
  Users,
  CheckCircle2,
  AlertTriangle,
  Building,
  HardHat,
  Search,
  X,
  ChevronRight,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

export const DueSoonWidget: React.FC = () => {
  const {
    trainingSessions,
    trainingPrograms,
    employees,
    mvtStatuses,
    nominateWorkers,
    setActiveTab,
  } = useApp();

  const [selectedSessionForEnrollment, setSelectedSessionForEnrollment] = useState<TrainingSession | null>(null);
  const [candidateFilter, setCandidateFilter] = useState<'DUE_OR_OVERDUE' | 'ALL'>('DUE_OR_OVERDUE');
  const [workerSearch, setWorkerSearch] = useState('');
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<string[]>([]);
  const [enrollmentSuccessMessage, setEnrollmentSuccessMessage] = useState<string | null>(null);

  // Filter for upcoming scheduled MVT sessions
  const upcomingSessions = useMemo(() => {
    return trainingSessions
      .filter((s) => s.status === 'SCHEDULED')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [trainingSessions]);

  // Total available seats calculation
  const totalRemainingSeats = useMemo(() => {
    return upcomingSessions.reduce((acc, sess) => {
      const remaining = Math.max(0, sess.capacity - sess.nominatedWorkerIds.length);
      return acc + remaining;
    }, 0);
  }, [upcomingSessions]);

  // Calculate days remaining until session date relative to simulation date '2026-10-08'
  const getDaysUntilSession = (dateStr: string) => {
    const today = new Date('2026-10-08');
    const target = new Date(dateStr);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleOpenEnrollment = (session: TrainingSession) => {
    setSelectedSessionForEnrollment(session);
    // Pre-populate with workers who are already nominated
    setSelectedWorkerIds([...session.nominatedWorkerIds]);
    setWorkerSearch('');
    setCandidateFilter('DUE_OR_OVERDUE');
    setEnrollmentSuccessMessage(null);
  };

  const handleToggleWorkerSelection = (workerId: string) => {
    setSelectedWorkerIds((prev) =>
      prev.includes(workerId) ? prev.filter((id) => id !== workerId) : [...prev, workerId]
    );
  };

  const handleConfirmEnrollment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessionForEnrollment) return;

    nominateWorkers(selectedSessionForEnrollment.id, selectedWorkerIds);
    const count = selectedWorkerIds.length;
    setEnrollmentSuccessMessage(
      `Roll successfully updated! ${count} candidate(s) enrolled into ${selectedSessionForEnrollment.title}.`
    );

    setTimeout(() => {
      setSelectedSessionForEnrollment(null);
      setEnrollmentSuccessMessage(null);
    }, 1500);
  };

  // Eligible candidate list for enrollment modal
  const eligibleCandidates = useMemo(() => {
    return employees.filter((emp) => {
      const mvt = mvtStatuses[emp.id];
      if (!mvt || !mvt.applicable) return false;

      // Filter by due/overdue status
      if (candidateFilter === 'DUE_OR_OVERDUE') {
        const isOverdue = mvt.status === 'OVERDUE';
        const isDue = mvt.status === 'DUE' || (mvt.daysRemaining >= 0 && mvt.daysRemaining <= 30);
        if (!isOverdue && !isDue) return false;
      }

      // Search filter
      if (workerSearch.trim()) {
        const q = workerSearch.toLowerCase();
        const matchName = emp.name.toLowerCase().includes(q);
        const matchId = emp.id.toLowerCase().includes(q);
        const matchDept = emp.department.toLowerCase().includes(q);
        const matchTrade = emp.trade.toLowerCase().includes(q);
        const matchContractor = emp.contractorName?.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchDept && !matchTrade && !matchContractor) return false;
      }

      return true;
    });
  }, [employees, mvtStatuses, candidateFilter, workerSearch]);

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-xs">
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3.5 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                DUE SOON: UPCOMING MVT SESSIONS
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 bg-orange-50 px-1.5 py-0.2 rounded border border-orange-200">
                Statutory Roll
              </span>
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 flex-wrap">
              <span>Mines Vocational Training Rules 1966</span>
              <span>·</span>
              <span>Rule 6 & Rule 9 Batches</span>
              <span>·</span>
              <strong className="text-slate-700 font-semibold">{totalRemainingSeats} Seats Available</strong>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('mvt-command')}
            className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>Open MVT Planner</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Upcoming Sessions Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-3.5">
        {upcomingSessions.map((session) => {
          const program = trainingPrograms.find((p) => p.id === session.programId);
          const daysLeft = getDaysUntilSession(session.date);
          const enrolledCount = session.nominatedWorkerIds.length;
          const remainingSeats = Math.max(0, session.capacity - enrolledCount);
          const fillPercent = Math.min(100, Math.round((enrolledCount / session.capacity) * 100));

          let countdownBadge = {
            label: `In ${daysLeft} Days`,
            bg: 'bg-amber-50 text-amber-800 border-amber-200',
          };

          if (daysLeft <= 0) {
            countdownBadge = {
              label: 'Today',
              bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
            };
          } else if (daysLeft <= 4) {
            countdownBadge = {
              label: `In ${daysLeft} Days (Urgent)`,
              bg: 'bg-orange-50 text-orange-800 border-orange-200',
            };
          } else if (daysLeft <= 7) {
            countdownBadge = {
              label: `In ${daysLeft} Days`,
              bg: 'bg-amber-50 text-amber-800 border-amber-200',
            };
          } else {
            countdownBadge = {
              label: `In ${daysLeft} Days`,
              bg: 'bg-sky-50 text-sky-800 border-sky-200',
            };
          }

          return (
            <div
              key={session.id}
              className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 flex flex-col justify-between space-y-3 hover:border-slate-300 transition-all shadow-2xs"
            >
              {/* Card Top: Date & Countdown */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 font-bold">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>{session.date}</span>
                    <span className="text-[11px] font-normal text-slate-500">({session.startTime})</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${countdownBadge.bg}`}
                  >
                    {countdownBadge.label}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 mt-2 line-clamp-2 leading-snug">
                  {session.title}
                </h3>

                {/* Rule & Venue Meta */}
                <div className="text-[11px] text-slate-500 mt-1.5 space-y-1">
                  <div className="flex items-center gap-1 text-slate-600">
                    <Building className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{session.venue}</span>
                  </div>
                  <div className="text-[10px] font-mono font-medium text-amber-800 truncate">
                    {program?.statutoryReference || 'DGMS MVT Rules 1966'} · {session.trainerName}
                  </div>
                </div>

                {/* Seat Capacity Progress */}
                <div className="mt-3 pt-2.5 border-t border-slate-200/80">
                  <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1">
                    <span>
                      Enrolled: <strong className="text-slate-900 font-mono">{enrolledCount}</strong> / {session.capacity}
                    </span>
                    <span className={remainingSeats <= 5 ? 'text-orange-700 font-bold' : 'text-slate-500 font-medium'}>
                      {remainingSeats} seat(s) left
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        fillPercent >= 90
                          ? 'bg-rose-500'
                          : fillPercent >= 60
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${fillPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Card Footer: Enroll Now Quick Link Button */}
              <div className="pt-2">
                <button
                  onClick={() => handleOpenEnrollment(session)}
                  className="w-full py-2 px-3 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Enroll Now</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Instant Enrollment Modal */}
      {selectedSessionForEnrollment && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full shadow-2xl p-5 max-h-[90vh] flex flex-col animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-amber-50 text-amber-700 border border-amber-200">
                    <UserPlus className="w-4 h-4" />
                  </span>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                    Quick Session Enrollment
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedSessionForEnrollment.title} · Date: <strong className="text-slate-800">{selectedSessionForEnrollment.date}</strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedSessionForEnrollment(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success Toast Banner */}
            {enrollmentSuccessMessage && (
              <div className="mt-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-semibold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{enrollmentSuccessMessage}</span>
              </div>
            )}

            {/* Filter Bar & Search */}
            <div className="mt-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 text-xs">
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setCandidateFilter('DUE_OR_OVERDUE')}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                    candidateFilter === 'DUE_OR_OVERDUE'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Overdue & Due Soon Candidates
                </button>
                <button
                  type="button"
                  onClick={() => setCandidateFilter('ALL')}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                    candidateFilter === 'ALL'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Workforce
                </button>
              </div>

              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter name, ID, contractor..."
                  value={workerSearch}
                  onChange={(e) => setWorkerSearch(e.target.value)}
                  className="w-full bg-slate-50 text-xs text-slate-900 pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Candidate Workers List */}
            <form onSubmit={handleConfirmEnrollment} className="flex-1 flex flex-col min-h-0 mt-3">
              <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 min-h-[220px]">
                {eligibleCandidates.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No personnel found matching the current filter.
                  </div>
                ) : (
                  eligibleCandidates.map((worker) => {
                    const isSelected = selectedWorkerIds.includes(worker.id);
                    const mvt = mvtStatuses[worker.id];

                    return (
                      <label
                        key={worker.id}
                        className={`flex items-center justify-between p-2.5 hover:bg-slate-50 transition-colors cursor-pointer text-xs ${
                          isSelected ? 'bg-amber-50/50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleWorkerSelection(worker.id)}
                            className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                          />
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{worker.name}</span>
                              <span className="text-[10px] font-mono text-slate-500">({worker.id})</span>
                              {worker.employeeType === 'CONTRACT_WORKER' && (
                                <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200">
                                  Contract
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate max-w-[320px]">
                              {worker.designation} · {worker.department}
                              {worker.contractorName ? ` · ${worker.contractorName.split(' ')[0]}` : ''}
                            </div>
                          </div>
                        </div>

                        {/* MVT Status Indicator */}
                        <div className="text-right shrink-0">
                          {mvt?.status === 'OVERDUE' && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                              Overdue by {mvt.daysOverdue}d
                            </span>
                          )}
                          {mvt?.status === 'DUE' && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">
                              Due in {mvt.daysRemaining}d
                            </span>
                          )}
                          {mvt?.status === 'DUE_SOON' && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                              Due in {mvt.daysRemaining}d
                            </span>
                          )}
                          {mvt?.status === 'VALID' && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                              Valid MVT
                            </span>
                          )}
                        </div>
                      </label>
                    );
                  })
                )}
              </div>

              {/* Modal Footer */}
              <div className="pt-3.5 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="text-slate-600">
                  Selected:{' '}
                  <strong className="text-slate-900 font-mono font-bold">
                    {selectedWorkerIds.length}
                  </strong>{' '}
                  / {selectedSessionForEnrollment.capacity} max capacity
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSessionForEnrollment(null)}
                    className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors shadow-xs cursor-pointer"
                  >
                    Confirm Enrollment ({selectedWorkerIds.length})
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
