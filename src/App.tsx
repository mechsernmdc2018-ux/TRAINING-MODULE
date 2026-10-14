import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LoginPage } from './components/LoginPage';
import { LeaseSelectionPage } from './components/LeaseSelectionPage';
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
import { MedicalManagement } from './components/MedicalManagement';
import { OtherTrainingManagement } from './components/OtherTrainingManagement';
import { ExcelUploadFacility } from './components/ExcelUploadFacility';
import { SafetyPassportModal } from './components/SafetyPassportModal';
import { EmployeeRegistrationModal } from './components/EmployeeRegistrationModal';
import { UserLoginModal } from './components/UserLoginModal';
import { NMDCLogo } from './components/NMDCLogo';
import { ShieldCheck, HardHat, FileText, CheckCircle2 } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'mvt-command' && <MVTCommandCentre />}
      {activeTab === 'medical' && <MedicalManagement />}
      {activeTab === 'other-training' && <OtherTrainingManagement />}
      {activeTab === 'excel-upload' && <ExcelUploadFacility />}
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

const AppFlow: React.FC = () => {
  const { authScreen, selectedLease } = useApp();

  // Screen 1: Separate Login Page
  if (authScreen === 'LOGIN') {
    return <LoginPage />;
  }

  // Screen 2: Middle of page two tabs (DIOM ML 2396 and KIOM ML 1111)
  if (authScreen === 'LEASE_SELECTION') {
    return <LeaseSelectionPage />;
  }

  // Screen 3: The Operational Portal
  return (
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

      {/* Personnel Login & Registration Modal */}
      <UserLoginModal />

      {/* Official NMDC Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-white text-slate-950 flex items-center justify-center p-0.5 shadow-xs border border-slate-200 shrink-0">
                <NMDCLogo className="h-full w-auto" />
              </div>
              <div>
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <span>NMDC LIMITED • {selectedLease} • DONIMALAI COMPLEX</span>
                  <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded border border-amber-300">
                    Navratna PSU
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {selectedLease === 'DIOM ML 2396' ? 'Donimalai Iron Ore Mine • DGMS Code: 29/03/DNM' : 'Kumaraswamy Iron Ore Mine • DGMS Code: 29/03/KWM'}
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
                Rule 29B Medical Register
              </span>
            </div>
          </div>

          {/* Prominent Designer & Concept Credits Requested by User */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 px-2 py-0.5 rounded shadow-xs">
                CREATION CREDITS
              </span>
              <span className="text-slate-900 font-bold">
                Concept by <span className="text-amber-950 font-black">Anil Kumar CGM (Prod.)</span>, Designed and Developed by <span className="text-amber-900 font-black">Abhishek Singh</span>,
              </span>
              <span className="text-amber-600 font-black text-sm">•</span>
            </div>
            <div className="text-[11px] text-slate-500">
              National Mineral Development Corporation • Ministry of Steel, Government of India
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppFlow />
    </AppProvider>
  );
}
