import React from 'react';
import { StudyProvider, useStudy } from './context/StudyContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { TaskManager } from './components/TaskManager';
import { PomodoroTimer } from './components/PomodoroTimer';
import { BacklogVault } from './components/BacklogVault';
import { DailyReport } from './components/DailyReport';
import { SubjectRadar } from './components/SubjectRadar';
import { WeeklyOverview } from './components/WeeklyOverview';
import { SettingsView } from './components/SettingsView';
import { AIAgentView } from './components/AIAgentView';
import { FocusModeModal } from './components/FocusModeModal';
import { PlanMyDayModal } from './components/PlanMyDayModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';

const MainContent: React.FC = () => {
  const { activeTab } = useStudy();

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'tasks':
        return (
          <div className="max-w-3xl mx-auto">
            <TaskManager />
          </div>
        );
      case 'focus':
        return <PomodoroTimer />;
      case 'backlog':
        return <BacklogVault />;
      case 'progress':
        return (
          <div className="max-w-4xl mx-auto space-y-8">
            <DailyReport />
            <WeeklyOverview />
          </div>
        );
      case 'subjects':
        return (
          <div className="max-w-4xl mx-auto">
            <SubjectRadar />
          </div>
        );
      case 'agent':
        return <AIAgentView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* 3-Zone Clean Header */}
      <Header />

      {/* Main Workspace: Sidebar + Viewport */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        <Sidebar />

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-24 md:pb-12 overflow-x-hidden">
          {renderActiveTab()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Overlays & Modals */}
      <FocusModeModal />
      <PlanMyDayModal />
      <GlobalSearchModal />
    </div>
  );
};

export default function App() {
  return (
    <StudyProvider>
      <MainContent />
    </StudyProvider>
  );
}
