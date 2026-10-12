import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { MVTCommandCentre } from './components/MVTCommandCentre';
import { StatutoryCompliance } from './components/StatutoryCompliance';
import { EmployeeManagement } from './components/EmployeeManagement';
import { TrainingManagement } from './components/TrainingManagement';
import { CompetencyHEMM } from './components/CompetencyHEMM';
import { DeploymentClearance } from './components/DeploymentClearance';
import { SafetyModules } from './components/SafetyModules';
import { AuditManagement } from './components/AuditManagement';
import { ReportsMIS } from './components/ReportsMIS';
import { DocumentsRepository } from './components/DocumentsRepository';
import { AdminAuditTrail } from './components/AdminAuditTrail';
import { ImplementationPlan } from './components/ImplementationPlan';
import { SafetyPassportModal } from './components/SafetyPassportModal';
import { EmployeeRegistrationModal } from './components/EmployeeRegistrationModal';
import { ShieldCheck, HardHat, FileText, CheckCircle2 } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'mvt-command' && <MVTCommandCentre />}
      {activeTab === 'statutory-engine' && <StatutoryCompliance />}
      {activeTab === 'workforce' && <EmployeeManagement />}
      {activeTab === 'training' && <TrainingManagement />}
      {activeTab === 'competency' && <CompetencyHEMM />}
      {activeTab === 'deployment' && <DeploymentClearance />}
      {activeTab === 'safety' && <SafetyModules />}
      {activeTab === 'audits' && <AuditManagement />}
      {activeTab === 'reports' && <ReportsMIS />}
      {activeTab === 'documents' && <DocumentsRepository />}
      {activeTab === 'administration' && <AdminAuditTrail />}
      {activeTab === 'implementation-plan' && <ImplementationPlan />}
    </main>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-900">
        {/* Navigation & Official Header */}
        <Header />

        {/* Dynamic Route/Tab Content */}
        <div className="flex-1">
          <MainContent />
        </div>

        {/* Digital Safety Passport Modal (Global Trigger) */}
        <SafetyPassportModal />

        {/* Employee Registration Modal (Global Provision) */}
        <EmployeeRegistrationModal />

        {/* Official NMDC Footer */}
        <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs shadow-xs border border-amber-400">
                NMDC
              </div>
              <div>
                <div className="font-bold text-slate-900">
                  NMDC LIMITED • DONIMALAI COMPLEX (BELLARY DISTRICT, KARNATAKA)
                </div>
                <div className="text-[11px] text-slate-500">
                  Training & Safety Department • DGMS Mine Registration Code: 29/03/DNM
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-slate-500 flex-wrap">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Mines Vocational Training Rules 1966
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                DGMS (Tech) Circular 04/2020
              </span>
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-sky-600" />
                Configurable Statutory Engine
              </span>
            </div>
          </div>
        </footer>
      </div>
    </AppProvider>
  );
}
