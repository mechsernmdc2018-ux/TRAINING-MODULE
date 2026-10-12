import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BookOpen,
  Calendar as CalendarIcon,
  QrCode,
  Award,
  Play,
  Printer,
  Sparkles,
} from 'lucide-react';
import { TrainingSession, Certificate } from '../types';

export const TrainingManagement: React.FC = () => {
  const {
    trainingPrograms,
    trainingSessions,
    employees,
    attendance,
    certificates,
    assessmentQuestions,
    markAttendance,
    recordAssessment,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'SESSIONS' | 'PROGRAMS' | 'ASSESSMENT_SIMULATOR' | 'CERTIFICATES'>('SESSIONS');

  // Interactive Assessment State
  const [selectedSessionForQuiz, setSelectedSessionForQuiz] = useState<string>(trainingSessions[0]?.id || '');
  const [selectedWorkerForQuiz, setSelectedWorkerForQuiz] = useState<string>(employees[0]?.id || '');
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<{ score: number; passed: boolean; cert?: Certificate } | null>(null);

  // QR Attendance Scanner Simulator Modal State
  const [showQRModal, setShowQRModal] = useState<boolean>(false);
  const [activeQRSession, setActiveQRSession] = useState<TrainingSession | null>(null);
  const [scannedWorkerIdInput, setScannedWorkerIdInput] = useState<string>('');
  const [qrScanMessage, setQrScanMessage] = useState<string | null>(null);

  // Certificate Modal State
  const [inspectedCertificate, setInspectedCertificate] = useState<Certificate | null>(null);

  const handleSimulatedQRScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQRSession || !scannedWorkerIdInput.trim()) return;

    const worker = employees.find((e) => e.id.toLowerCase() === scannedWorkerIdInput.trim().toLowerCase());
    if (!worker) {
      setQrScanMessage('ERROR: Worker ID not found in Donimalai personnel database.');
      return;
    }

    // Check duplicate
    const already = attendance.some((a) => a.sessionId === activeQRSession.id && a.workerId === worker.id);
    if (already) {
      setQrScanMessage(`DUPLICATE WARNING: Attendance already recorded for ${worker.name} in this session.`);
      return;
    }

    markAttendance(activeQRSession.id, worker.id, 'QR_CODE');
    setQrScanMessage(`SUCCESS: Attendance verified for ${worker.name} (${worker.id}) via QR Token ${activeQRSession.qrCodeToken}!`);
    setScannedWorkerIdInput('');
  };

  const handleQuizOptionSelect = (questionId: string, optionIndex: number) => {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const submitAssessmentQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    let correctCount = 0;
    assessmentQuestions.forEach((q) => {
      if (quizAnswers[q.id] === q.correctOptionIndex) {
        correctCount++;
      }
    });

    const percent = Math.round((correctCount / assessmentQuestions.length) * 100);
    const result = recordAssessment(selectedSessionForQuiz, selectedWorkerForQuiz, percent);

    setQuizScore({
      score: percent,
      passed: result.passed,
      cert: result.certificate,
    });
    setQuizSubmitted(true);
  };

  const resetQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Training Navigation Header */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700">
                <BookOpen className="w-5 h-5" />
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase">
                TRAINING MANAGEMENT & ASSESSMENT CENTRE
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Course syllabus • Session scheduling • QR code attendance • Statutory examinations • Digital certificates
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('ASSESSMENT_SIMULATOR')}
              className="px-3.5 py-2 text-xs font-bold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Play className="w-4 h-4" />
              <span>LAUNCH ASSESSMENT SIMULATOR</span>
            </button>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveSubTab('SESSIONS')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'SESSIONS' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            Training Sessions ({trainingSessions.length})
          </button>
          <button
            onClick={() => setActiveSubTab('PROGRAMS')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'PROGRAMS' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            Course Curriculum ({trainingPrograms.length})
          </button>
          <button
            onClick={() => setActiveSubTab('ASSESSMENT_SIMULATOR')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'ASSESSMENT_SIMULATOR' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            Statutory Exam Simulator
          </button>
          <button
            onClick={() => setActiveSubTab('CERTIFICATES')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'CERTIFICATES' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            Certificates Register ({certificates.length})
          </button>
        </div>
      </div>

      {/* SESSIONS TAB */}
      {activeSubTab === 'SESSIONS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {trainingSessions.map((session) => {
              const program = trainingPrograms.find((p) => p.id === session.programId);
              const sessionAttendance = attendance.filter((a) => a.sessionId === session.id);

              return (
                <div
                  key={session.id}
                  className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold">
                        {session.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          session.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {session.status}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-slate-900 mt-2 leading-snug">
                      {session.title}
                    </h3>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {program?.category} • {program?.durationHours} Hours
                    </div>

                    <div className="space-y-1.5 mt-3 text-[11px] text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span>{session.date} ({session.startTime} - {session.endTime})</span>
                      </div>
                      <div className="text-slate-500 truncate" title={session.venue}>
                        Venue: {session.venue}
                      </div>
                      <div className="text-slate-500">
                        Trainer: <strong className="text-slate-800">{session.trainerName}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-slate-500">Attendance / Capacity</span>
                      <span className="font-mono font-bold text-slate-800">
                        {sessionAttendance.length} / {session.capacity}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setActiveQRSession(session);
                          setShowQRModal(true);
                          setQrScanMessage(null);
                        }}
                        className="w-full py-1.5 text-[11px] font-bold bg-slate-50 hover:bg-slate-100 text-amber-800 rounded-lg border border-slate-200 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5 text-amber-600" />
                        <span>Scan QR</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedSessionForQuiz(session.id);
                          setActiveSubTab('ASSESSMENT_SIMULATOR');
                        }}
                        className="w-full py-1.5 text-[11px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg border border-amber-200 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>Assess</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PROGRAMS CURRICULUM TAB */}
      {activeSubTab === 'PROGRAMS' && (
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-600" />
            Statutory & NMDC Approved Training Modules
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trainingPrograms.map((prog) => (
              <div key={prog.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-800">{prog.code}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                    {prog.durationHours} Hours • {prog.deliveryMode}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 leading-snug">{prog.title}</h4>
                <p className="text-[11px] text-slate-600 line-clamp-3 leading-relaxed">{prog.description}</p>
                <div className="pt-2 border-t border-slate-200/80 text-[10px] text-slate-500 space-y-1">
                  <div>Statutory Ref: <strong className="text-slate-800">{prog.statutoryReference || 'NMDC Internal Standard'}</strong></div>
                  <div>Passing Standard: <strong className="text-amber-800">{prog.passMarkPercent}%</strong></div>
                  <div>Validity Period: <strong className="text-emerald-700">{prog.validityMonths} Months</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ASSESSMENT SIMULATOR TAB */}
      {activeSubTab === 'ASSESSMENT_SIMULATOR' && (
        <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs max-w-4xl mx-auto">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                Statutory Safety Competency Examination Simulator
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Objective question bank aligned with DGMS guidelines • Automated scoring and digital certificate generation
              </p>
            </div>
            {quizSubmitted && (
              <button
                onClick={resetQuiz}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 cursor-pointer"
              >
                Reset Assessment
              </button>
            )}
          </div>

          {!quizSubmitted ? (
            <form onSubmit={submitAssessmentQuiz} className="space-y-6 mt-6">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Select Candidate for Examination</label>
                  <select
                    value={selectedWorkerForQuiz}
                    onChange={(e) => setSelectedWorkerForQuiz(e.target.value)}
                    className="w-full bg-white text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 focus:border-amber-500"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.id}) • {emp.designation}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Select Enrolled Training Session</label>
                  <select
                    value={selectedSessionForQuiz}
                    onChange={(e) => setSelectedSessionForQuiz(e.target.value)}
                    className="w-full bg-white text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 focus:border-amber-500"
                  >
                    {trainingSessions.map((sess) => (
                      <option key={sess.id} value={sess.id}>
                        {sess.title} ({sess.id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-4">
                {assessmentQuestions.map((q, idx) => (
                  <div key={q.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="font-bold text-amber-800 font-mono">QUESTION {idx + 1} OF {assessmentQuestions.length}</span>
                      <span className="px-2 py-0.5 rounded bg-white text-[10px] font-semibold text-slate-600 border border-slate-200">
                        {q.difficulty}
                      </span>
                    </div>

                    <div className="text-sm font-semibold text-slate-900 leading-relaxed">
                      {q.question}
                    </div>

                    <div className="space-y-2 mt-2">
                      {q.options.map((opt, oIdx) => (
                        <label
                          key={oIdx}
                          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            quizAnswers[q.id] === oIdx
                              ? 'bg-amber-50 border-amber-500 text-slate-900 font-medium'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`q_${q.id}`}
                            checked={quizAnswers[q.id] === oIdx}
                            onChange={() => handleQuizOptionSelect(q.id, oIdx)}
                            className="mt-0.5 text-amber-600 focus:ring-amber-500"
                            required
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 transition-colors shadow-xs cursor-pointer"
                >
                  SUBMIT ASSESSMENT & CALCULATE SCORE
                </button>
              </div>
            </form>
          ) : (
            /* Quiz Result Screen */
            <div className="mt-6 text-center space-y-6">
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 max-w-lg mx-auto">
                <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center text-3xl font-black ${quizScore?.passed ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-rose-100 text-rose-700 border border-rose-300'}`}>
                  {quizScore?.passed ? '✓' : '✗'}
                </div>

                <h4 className="text-lg font-bold text-slate-900 mt-4">
                  {quizScore?.passed ? 'Competency Assessment Passed!' : 'Assessment Not Qualified'}
                </h4>
                <div className="text-3xl font-black font-mono text-amber-700 mt-2">
                  {quizScore?.score}%
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Passing Standard: 70% minimum under DGMS / NMDC Safety Standards
                </p>

                {quizScore?.passed && quizScore.cert && (
                  <div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-2">
                    <span className="font-bold flex items-center justify-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      Digital Certificate Issued Automatically
                    </span>
                    <div className="font-mono text-slate-900 font-bold">
                      {quizScore.cert.certificateNumber}
                    </div>
                    <button
                      onClick={() => setInspectedCertificate(quizScore.cert!)}
                      className="mt-2 px-4 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 cursor-pointer"
                    >
                      View & Print Certificate
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CERTIFICATES REGISTER TAB */}
      {activeSubTab === 'CERTIFICATES' && (
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600" />
              Digital Competency & MVT Certificate Register
            </h3>
            <span className="text-xs text-slate-500 font-mono">{certificates.length} Certificates</span>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                  <th className="py-2.5 px-3">Certificate Number</th>
                  <th className="py-2.5 px-3">Candidate Name & ID</th>
                  <th className="py-2.5 px-3">Training Module</th>
                  <th className="py-2.5 px-3">Issue Date</th>
                  <th className="py-2.5 px-3">Valid Until</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {certificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-amber-800">
                      {cert.certificateNumber}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{cert.workerName}</div>
                      <div className="text-[11px] font-mono text-slate-500">{cert.workerId}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-800">{cert.trainingTitle}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{cert.issueDate}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{cert.validUntil}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          cert.status === 'VALID'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {cert.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setInspectedCertificate(cert)}
                        className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded border border-slate-300 cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QR Attendance Scanner Modal */}
      {showQRModal && activeQRSession && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                  Session Attendance QR Scanner
                </h3>
              </div>
              <button onClick={() => setShowQRModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <div className="mt-4 text-center space-y-3">
              <div className="w-32 h-32 mx-auto bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-center">
                <div className="w-full h-full border-2 border-slate-800 flex flex-col justify-between p-1 bg-white">
                  <div className="flex justify-between">
                    <div className="w-5 h-5 bg-slate-900" />
                    <div className="w-5 h-5 bg-slate-900" />
                  </div>
                  <div className="text-[8px] font-mono font-black text-slate-900 tracking-tighter">
                    NMDC-VTC
                  </div>
                  <div className="flex justify-between">
                    <div className="w-5 h-5 bg-slate-900" />
                    <div className="w-3 h-3 bg-slate-900" />
                  </div>
                </div>
              </div>
              <div className="text-xs font-mono text-amber-800 font-bold">{activeQRSession.qrCodeToken}</div>
              <p className="text-[11px] text-slate-500">
                Scan worker ID badge or enter ID manually below to mark present.
              </p>
            </div>

            <form onSubmit={handleSimulatedQRScan} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Worker Badge ID</label>
                <input
                  type="text"
                  placeholder="e.g. NMDC-EMP-1001 or CONT-WRK-2001"
                  value={scannedWorkerIdInput}
                  onChange={(e) => setScannedWorkerIdInput(e.target.value)}
                  className="w-full bg-slate-50 text-xs text-slate-900 px-3 py-2 rounded-lg border border-slate-300 mt-1 focus:bg-white"
                  autoFocus
                />
              </div>

              {qrScanMessage && (
                <div
                  className={`p-2.5 rounded-lg text-xs font-semibold ${
                    qrScanMessage.startsWith('SUCCESS')
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border border-rose-200 text-rose-800'
                  }`}
                >
                  {qrScanMessage}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQRModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                >
                  Done
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400"
                >
                  Record Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Certificate View Modal */}
      {inspectedCertificate && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-8 shadow-2xl print:bg-white print:text-black">
            {/* Certificate Border Framing */}
            <div className="border-4 border-double border-amber-600/70 p-6 rounded-xl relative bg-amber-50/20">
              <div className="text-center space-y-1">
                <div className="text-[10px] font-bold tracking-widest uppercase text-amber-800">
                  GOVERNMENT OF INDIA ENTERPRISE • NAVRATNA PSU
                </div>
                <h2 className="text-lg font-extrabold text-slate-900 tracking-wide">
                  NMDC LIMITED • DONIMALAI COMPLEX
                </h2>
                <div className="text-xs text-slate-500 uppercase font-semibold">
                  VOCATIONAL TRAINING & STATUTORY SAFETY DIRECTORATE
                </div>
              </div>

              <div className="my-6 text-center">
                <div className="text-xs uppercase tracking-widest text-slate-500 font-semibold">CERTIFICATE OF TRAINING & COMPETENCY</div>
                <div className="text-xs text-slate-600 mt-2">This is to certify that</div>
                <div className="text-xl font-black text-amber-900 tracking-tight mt-1">
                  {inspectedCertificate.workerName}
                </div>
                <div className="text-xs font-mono text-slate-500">
                  Personnel Identification: {inspectedCertificate.workerId}
                </div>
                <div className="text-xs text-slate-600 mt-3 max-w-lg mx-auto leading-relaxed">
                  has satisfactorily completed the prescribed statutory training curriculum and passed the examination in
                </div>
                <div className="text-sm sm:text-base font-bold text-slate-900 mt-1">
                  "{inspectedCertificate.trainingTitle}"
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Duration: {inspectedCertificate.durationHours} Hours • Trainer: {inspectedCertificate.trainerName}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200 text-[11px] text-slate-600">
                <div>
                  <div>Certificate Number:</div>
                  <div className="font-mono font-bold text-slate-900">{inspectedCertificate.certificateNumber}</div>
                  <div>Issued: {inspectedCertificate.issueDate}</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto border border-amber-300 p-1 bg-white rounded shadow-xs">
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[7px] font-mono text-slate-900 font-bold">
                      VERIFIED
                    </div>
                  </div>
                  <div className="text-[9px] mt-1 text-slate-500">QR Authenticated</div>
                </div>
                <div className="text-right">
                  <div>Valid Till: <strong className="text-emerald-700">{inspectedCertificate.validUntil}</strong></div>
                  <div className="mt-2 text-slate-800 font-semibold">{inspectedCertificate.approverName}</div>
                  <div className="text-[10px] text-slate-500">{inspectedCertificate.approverDesignation}</div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between print:hidden">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Certificate (PDF)</span>
              </button>
              <button
                onClick={() => setInspectedCertificate(null)}
                className="px-5 py-2 text-xs font-bold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
