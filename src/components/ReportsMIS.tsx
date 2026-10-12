import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Award,
  Download,
  Printer,
} from 'lucide-react';

export const ReportsMIS: React.FC = () => {
  const {
    kpis,
    employees,
    mvtStatuses,
    contractors,
    certificates,
    exportToCSV,
  } = useApp();

  const [reportType, setReportType] = useState<'MVT_SUMMARY' | 'CONTRACTOR_SCORECARD' | 'DEPARTMENT_COMPLIANCE' | 'CERTIFICATE_REGISTER'>('MVT_SUMMARY');

  const handleExportCurrentReport = () => {
    if (reportType === 'MVT_SUMMARY') {
      const headers = ['Worker ID', 'Name', 'Department', 'Type', 'Applicable Rule', 'Last MVT', 'Next Due', 'Days Remaining', 'Status'];
      const rows = employees.map((e) => {
        const m = mvtStatuses[e.id];
        return [
          e.id,
          e.name,
          e.department,
          e.employeeType,
          m?.applicableRule || 'MVT Rules 1966',
          m?.lastMVTDate || 'Initial Pending',
          m?.nextMVTDueDate || 'N/A',
          m?.daysRemaining ?? 'N/A',
          m?.status || 'N/A',
        ];
      });
      exportToCSV('NMDC_Donimalai_MVT_Compliance_Register', headers, rows);
    } else if (reportType === 'CONTRACTOR_SCORECARD') {
      const headers = ['Contractor Code', 'Name', 'Work Order', 'Total Manpower', 'MVT Valid', 'MVT Overdue', 'Compliance %'];
      const rows = contractors.map((c) => {
        const workers = employees.filter((e) => e.contractorCode === c.code);
        const valid = workers.filter((w) => mvtStatuses[w.id]?.status === 'VALID').length;
        const overdue = workers.filter((w) => mvtStatuses[w.id]?.status === 'OVERDUE').length;
        const comp = workers.length > 0 ? Number(((valid / workers.length) * 100).toFixed(1)) : 100;
        return [c.code, c.name, c.workOrderNumber, workers.length, valid, overdue, comp];
      });
      exportToCSV('NMDC_Donimalai_Contractor_Scorecard', headers, rows);
    } else if (reportType === 'CERTIFICATE_REGISTER') {
      const headers = ['Cert No', 'Worker ID', 'Worker Name', 'Training Title', 'Issue Date', 'Valid Until', 'Status'];
      const rows = certificates.map((c) => [c.certificateNumber, c.workerId, c.workerName, c.trainingTitle, c.issueDate, c.validUntil, c.status]);
      exportToCSV('NMDC_Donimalai_Certificates_Register', headers, rows);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700">
                <Award className="w-5 h-5" />
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase">
                MANAGEMENT INFORMATION SYSTEM (MIS) & EXPORT CENTRE
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Executive compliance analytics • Statutory DGMS Form B registers • Automated CSV / Excel generation
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>PRINT REPORT</span>
            </button>
            <button
              onClick={handleExportCurrentReport}
              className="px-4 py-2 text-xs font-bold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>EXPORT TO CSV</span>
            </button>
          </div>
        </div>

        {/* Report Selector */}
        <div className="flex items-center gap-2 mt-4 text-xs overflow-x-auto">
          <button
            onClick={() => setReportType('MVT_SUMMARY')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              reportType === 'MVT_SUMMARY' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            MVT Compliance Summary (Form B)
          </button>
          <button
            onClick={() => setReportType('CONTRACTOR_SCORECARD')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              reportType === 'CONTRACTOR_SCORECARD' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            Contractor Scorecard
          </button>
          <button
            onClick={() => setReportType('CERTIFICATE_REGISTER')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              reportType === 'CERTIFICATE_REGISTER' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            Certificates Registry
          </button>
        </div>
      </div>

      {/* KPI Summary Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-xs">
          <div className="text-[10px] font-semibold text-slate-500 uppercase">MVT Compliance</div>
          <div className="text-xl font-bold font-mono text-emerald-700 mt-1">{kpis.mvtCompliancePercent}%</div>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-xs">
          <div className="text-[10px] font-semibold text-slate-500 uppercase">Training Hours</div>
          <div className="text-xl font-bold font-mono text-amber-800 mt-1">{kpis.totalTrainingHoursCompleted}h</div>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-xs">
          <div className="text-[10px] font-semibold text-slate-500 uppercase">Certificates Issued</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">{certificates.length}</div>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-xs">
          <div className="text-[10px] font-semibold text-slate-500 uppercase">High Risk Cleared</div>
          <div className="text-xl font-bold font-mono text-orange-700 mt-1">{kpis.highRiskCompliancePercent}%</div>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-xs">
          <div className="text-[10px] font-semibold text-slate-500 uppercase">MVT Overdue</div>
          <div className="text-xl font-bold font-mono text-rose-700 mt-1">{kpis.mvtOverdue} Cases</div>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-xs">
          <div className="text-[10px] font-semibold text-slate-500 uppercase">Induction Pending</div>
          <div className="text-xl font-bold font-mono text-sky-700 mt-1">{kpis.newJoinersAwaitingInduction} Workers</div>
        </div>
      </div>

      {/* Report Data Preview Table */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
            {reportType.replace('_', ' ')} DATA REGISTER
          </h3>
          <span className="text-xs text-slate-500 font-mono">Live query</span>
        </div>

        <div className="overflow-x-auto mt-4">
          {reportType === 'MVT_SUMMARY' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                  <th className="py-2.5 px-3">Worker ID</th>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Last MVT</th>
                  <th className="py-2.5 px-3">Next Due</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((e) => {
                  const m = mvtStatuses[e.id];
                  return (
                    <tr key={e.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono text-amber-800 font-bold">{e.id}</td>
                      <td className="py-2 px-3 font-semibold text-slate-900">{e.name}</td>
                      <td className="py-2 px-3 text-slate-700">{e.department}</td>
                      <td className="py-2 px-3 text-slate-500">{e.employeeType === 'NMDC_REGULAR' ? 'Regular' : 'Contractor'}</td>
                      <td className="py-2 px-3 font-mono text-slate-700">{m?.lastMVTDate || 'Initial Pending'}</td>
                      <td className="py-2 px-3 font-mono text-slate-700">{m?.nextMVTDueDate || 'N/A'}</td>
                      <td className="py-2 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${m?.status === 'VALID' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                          {m?.status || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {reportType === 'CONTRACTOR_SCORECARD' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                  <th className="py-2.5 px-3">Contractor Name</th>
                  <th className="py-2.5 px-3">Code</th>
                  <th className="py-2.5 px-3">Work Order</th>
                  <th className="py-2.5 px-3 text-center">Manpower</th>
                  <th className="py-2.5 px-3 text-center">Compliance %</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contractors.map((c) => {
                  const workers = employees.filter((e) => e.contractorCode === c.code);
                  const valid = workers.filter((w) => mvtStatuses[w.id]?.status === 'VALID').length;
                  const comp = workers.length > 0 ? Number(((valid / workers.length) * 100).toFixed(1)) : 100;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-bold text-slate-900">{c.name}</td>
                      <td className="py-2 px-3 font-mono text-amber-800">{c.code}</td>
                      <td className="py-2 px-3 font-mono text-slate-700">{c.workOrderNumber}</td>
                      <td className="py-2 px-3 text-center font-mono">{workers.length}</td>
                      <td className="py-2 px-3 text-center font-mono font-bold text-emerald-700">{comp}%</td>
                      <td className="py-2 px-3 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {c.contractStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {reportType === 'CERTIFICATE_REGISTER' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                  <th className="py-2.5 px-3">Certificate No</th>
                  <th className="py-2.5 px-3">Worker Name</th>
                  <th className="py-2.5 px-3">Training Module</th>
                  <th className="py-2.5 px-3">Issue Date</th>
                  <th className="py-2.5 px-3">Valid Until</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {certificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono font-bold text-amber-800">{cert.certificateNumber}</td>
                    <td className="py-2 px-3 font-bold text-slate-900">{cert.workerName}</td>
                    <td className="py-2 px-3 text-slate-700">{cert.trainingTitle}</td>
                    <td className="py-2 px-3 font-mono text-slate-600">{cert.issueDate}</td>
                    <td className="py-2 px-3 font-mono text-slate-600">{cert.validUntil}</td>
                    <td className="py-2 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {cert.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
