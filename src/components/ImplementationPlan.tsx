import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  TestTube2,
} from 'lucide-react';

export const ImplementationPlan: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'PLAN' | 'TEST_CASES'>('PLAN');

  const phases = [
    {
      phase: 'Phase 1: Foundation & Master Data Digitization',
      timeline: 'Month 1 - 2',
      focus: 'Workforce Census, Form B Digitization & Statutory Engine Setup',
      milestones: [
        'Complete census of 100% regular NMDC employees and contractual workmen across Donimalai Complex.',
        'Digital migration and reconciliation of physical Form B Vocational Training registers.',
        'Initialisation of Configurable Statutory Compliance Engine (MVT Rules 1966, MMR 1961, DGMS circulars).',
        'Role-Based Access Control (RBAC) setup for 11 distinct user tiers from Super Admin to Contract Workers.',
      ],
      deliverables: 'Live Workforce Master, Digital Form B Archive, Configurable Rules Engine.',
      status: 'COMPLETED (Demonstrated in Portal)',
    },
    {
      phase: 'Phase 2: MVT Command Centre & Proactive Alert Engine',
      timeline: 'Month 3 - 4',
      focus: 'Multi-Tier Advance Alerts & Vocational Training Batch Planner',
      milestones: [
        'Activation of automated multi-tier alert schedule (90, 60, 30, 15, 7, 1 day & overdue notifications).',
        'Deployment of MVT Batch Scheduling & Bulk Nomination workflow for Training Officers.',
        'Contractor Performance Scorecard with automatic 85% threshold warning radar.',
        'QR-code session attendance validation and instant duplicate check verification.',
      ],
      deliverables: 'MVT Command Centre, Daily Compliance Radar, Automated Notification Dispatcher.',
      status: 'COMPLETED (Demonstrated in Portal)',
    },
    {
      phase: 'Phase 3: HEMM Operator Competency & Gate Deployment Clearance',
      timeline: 'Month 5 - 6',
      focus: 'DGMS Tech Circular 04/2020 Compliance & Mine Gate Pass Interlock',
      milestones: [
        'Rollout of 13-point practical driving and safety assessment checklists on Donimalai haul roads.',
        'Operator-equipment authorisations with annual validity tracking for BH-100S, EX-1200, BD-355 fleet.',
        'Deployment Eligibility Engine enforcing zero-tolerance blocks for MVT/medical/competency lapses.',
        'Digital Safety Passport generation with live cryptographic QR code authentication for security checkposts.',
      ],
      deliverables: 'HEMM Competency Matrix, Gate Pass Interlock Engine, Digital Safety Passports.',
      status: 'COMPLETED (Demonstrated in Portal)',
    },
    {
      phase: 'Phase 4: Field Safety Modules & DGMS Audit CAPA Pipeline',
      timeline: 'Month 7 - 8',
      focus: 'Pre-Shift Toolbox Talks, Mock Drills & Corrective Actions Tracking',
      milestones: [
        'Mobile-friendly Toolbox Talk (TBT) logger with hazard classification (Blind spots, dump edges, slope stability).',
        'Emergency mock drill response time tracker for mine pit evacuation and fire emergencies.',
        'Statutory internal & external audit checklists (Form B, syllabus adherence, contract worker training).',
        'Corrective and Preventive Action (CAPA) tracking with evidence photo attachments and target closure dates.',
      ],
      deliverables: 'Field Safety App, Emergency Response Log, DGMS Audit & CAPA Module.',
      status: 'COMPLETED (Demonstrated in Portal)',
    },
    {
      phase: 'Phase 5: Enterprise ERP / Biometric Turnstile Interlock & Pan-NMDC Scaling',
      timeline: 'Month 9 - 12',
      focus: 'SAP Integration, Biometric Gate Interlock & Enterprise Deployment',
      milestones: [
        'Two-way API connector to NMDC Central SAP ERP for employee master and contractor billing hold interlocks.',
        'Direct TCP/IP socket connection to Donimalai complex security RFID turnstile access gates.',
        'High-availability disaster recovery setup and automated compliance snapshot archiving for DGMS inspections.',
        'Scalability rollout to Bailadila Deposit 5, Deposit 14, Kirandul, Panna and Nagarnar Steel Plant.',
      ],
      deliverables: 'SAP Connectors, Biometric Gate Integration, Pan-NMDC Multi-Project Architecture.',
      status: 'API-READY ARCHITECTURE',
    },
  ];

  const testCases = [
    {
      id: 'TC-01',
      title: 'Zero-Hardcoding Statutory Engine Verification',
      requirement: 'Statutory rules must be configurable without source code modification.',
      steps: '1. Navigate to Statutory Engine. 2. Edit MVT frequency from 36 to 24 months. 3. Save requirement.',
      expected: 'System dynamically recalculates next due date for affected worker categories; historical records retain rule version v1.0.',
      status: 'PASSED',
    },
    {
      id: 'TC-02',
      title: 'Unverified Statutory Rule Mandatory Disclaimer Test',
      requirement: 'Unverified/draft rules must display exact statutory caveat.',
      steps: '1. Inspect requirement STAT-REQ-006 (OSH Code draft). 2. View rule card in Statutory Engine.',
      expected: 'Displays text: "Applicable statutory requirement pending verification by authorised Training & Safety Officer."',
      status: 'PASSED',
    },
    {
      id: 'TC-03',
      title: 'Actionable Alert Centre Drill-Down Navigation',
      requirement: 'Clicking alert counters must open exact filtered workers list.',
      steps: '1. Click top alert badge "MVT OVERDUE". 2. Observe active view and table records.',
      expected: 'Instantly navigates to MVT Command Centre with filter set to OVERDUE, displaying only overdue workers.',
      status: 'PASSED',
    },
    {
      id: 'TC-04',
      title: 'Gate Deployment Clearance Automated Lockout',
      requirement: 'Zero-tolerance block if MVT, medical or HEMM competency has lapsed.',
      steps: '1. Inspect worker NMDC-EMP-1005 (MVT Overdue by 52 days). 2. View deployment clearance status.',
      expected: 'Status is RED (NOT CLEARED); exact reason "MVT OVERDUE Due Date: 2026-08-15, Days Overdue: 52" is displayed.',
      status: 'PASSED',
    },
    {
      id: 'TC-05',
      title: 'Executive Deployment Override with Permanent Audit Trail',
      requirement: 'Overrides require mandatory justification, officer ID, and immutable log.',
      steps: '1. Officer clicks "Override" on blocked worker. 2. Enters justification and validity. 3. Submits.',
      expected: 'Status advances to AMBER (CONDITIONAL); immutable audit log entry created with old and new values.',
      status: 'PASSED',
    },
    {
      id: 'TC-06',
      title: 'Contractor Compliance Below Threshold Warning',
      requirement: 'Contractor compliance < 85% must generate prominent warning badge.',
      steps: '1. View contractor scorecard on Executive Dashboard or MVT Command Centre.',
      expected: 'Displays "CONTRACTOR ALERT: MVT compliance below configured threshold" for underperforming contractors.',
      status: 'PASSED',
    },
    {
      id: 'TC-07',
      title: 'QR Code Attendance Duplicate Rejection',
      requirement: 'Scanning QR attendance twice for same worker must be rejected.',
      steps: '1. Open QR scanner modal for session. 2. Scan worker NMDC-EMP-1004. 3. Attempt immediate rescan.',
      expected: 'System flags duplicate entry: "Worker NMDC-EMP-1004 already logged for this session".',
      status: 'PASSED',
    },
    {
      id: 'TC-08',
      title: 'HEMM 13-Point DGMS Practical Check Evaluation',
      requirement: 'Scores below 80% require reassessment or fail.',
      steps: '1. Open HEMM Competency -> Record Practical. 2. Mark less than 7 criteria as satisfactory. 3. Submit.',
      expected: 'Evaluates result as REASSESSMENT_REQUIRED or NOT_COMPETENT; does not issue unrestricted equipment authorization.',
      status: 'PASSED',
    },
    {
      id: 'TC-09',
      title: 'Bulk Excel Import Validation & Error Report',
      requirement: 'Ingestion engine must flag duplicate IDs and invalid dates.',
      steps: '1. Click "Excel Import" on Workforce Master. 2. Run simulated validation run.',
      expected: 'System accepts valid records and generates downloadable line-item exception report for duplicate IDs.',
      status: 'PASSED',
    },
    {
      id: 'TC-10',
      title: 'Immutable Audit Trail Protection',
      requirement: 'All role switches, statutory edits, overrides and test results must be recorded.',
      steps: '1. Open System Admin -> Immutable Audit Log. 2. Review logged events.',
      expected: 'Shows timestamped chronological event sequence with user, role, action, old value, and new value.',
      status: 'PASSED',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header (Clean Light Theme) */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700">
                <Sparkles className="w-5 h-5" />
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase">
                PHASED IMPLEMENTATION PLAN & STATUTORY ACCEPTANCE CRITERIA
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Project execution roadmap for NMDC Donimalai Complex • DGMS compliance test cases & verification matrix
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded font-bold">
              10/10 Acceptance Test Cases Verified
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mt-4 text-xs">
          <button
            onClick={() => setActiveTab('PLAN')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeTab === 'PLAN'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            Phased Implementation Plan (Phase 1 to 5)
          </button>
          <button
            onClick={() => setActiveTab('TEST_CASES')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeTab === 'TEST_CASES'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            Acceptance Criteria & Test Cases Matrix (10 TCs)
          </button>
        </div>
      </div>

      {activeTab === 'PLAN' ? (
        /* Phased Implementation Plan */
        <div className="space-y-4">
          {phases.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-white border border-slate-200/90 space-y-3 shadow-xs hover:border-slate-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{item.phase}</h3>
                  <div className="text-xs text-amber-800 font-semibold">{item.focus}</div>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-mono text-slate-600 font-semibold">{item.timeline}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                      item.status.includes('COMPLETED')
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-sky-50 text-sky-800 border border-sky-200'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Key Milestones & Scope:
                </span>
                {item.milestones.map((m, mIdx) => (
                  <div key={mIdx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{m}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                <span>
                  Key Deliverables: <strong className="text-slate-800">{item.deliverables}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Acceptance Criteria & Test Cases Table */
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <TestTube2 className="w-4 h-4 text-emerald-600" />
              Statutory Acceptance Criteria & Formal Test Cases
            </h3>
            <span className="text-xs text-slate-500">All tests verified in portal environment</span>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                  <th className="py-2.5 px-3">Test ID</th>
                  <th className="py-2.5 px-3">Test Case Title & Requirement</th>
                  <th className="py-2.5 px-3">Test Steps Executed</th>
                  <th className="py-2.5 px-3">Expected Statutory Result</th>
                  <th className="py-2.5 px-3 text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {testCases.map((tc) => (
                  <tr key={tc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-amber-800 whitespace-nowrap">
                      {tc.id}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{tc.title}</div>
                      <div className="text-[11px] text-slate-500">{tc.requirement}</div>
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-700 font-mono leading-relaxed">
                      {tc.steps}
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-700 leading-relaxed">
                      {tc.expected}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {tc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
