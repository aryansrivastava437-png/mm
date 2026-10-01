import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Timer,
  Archive,
  BarChart3,
  BookOpen,
  Settings,
  Sparkles,
  Bot,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { NavTab } from '../types';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    todayStats,
    setIsPlanMyDayOpen,
  } = useStudy();

  const navItems: Array<{
    id: NavTab;
    label: string;
    icon: React.ElementType;
    badge?: number;
    specialBadge?: string;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'tasks',
      label: "Today's Mission",
      icon: CheckSquare,
      badge: todayStats.remainingTasks > 0 ? todayStats.remainingTasks : undefined,
    },
    { id: 'focus', label: 'Focus Room', icon: Timer },
    {
      id: 'backlog',
      label: 'Backlog Vault',
      icon: Archive,
      badge: todayStats.backlogCount > 0 ? todayStats.backlogCount : undefined,
    },
    { id: 'progress', label: 'Progress & Reports', icon: BarChart3 },
    { id: 'subjects', label: 'Class 9 Subjects', icon: BookOpen },
    {
      id: 'agent',
      label: 'AI Study Mentor',
      icon: Bot,
      specialBadge: '✦ AI',
    },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/50 min-h-[calc(100vh-61px)] p-4 justify-between">
      <div className="space-y-6">
        {/* Navigation list */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2">
            Study Workspace
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-xl transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  isActive
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-neutral-800/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : item.id === 'agent'
                        ? 'text-indigo-500'
                        : 'text-neutral-500 dark:text-neutral-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-mono tabular-nums ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                        : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {item.specialBadge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                    {item.specialBadge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Study Assistant Prompt */}
        <div className="p-3.5 bg-gradient-to-br from-indigo-50/80 to-purple-50/50 dark:from-indigo-950/30 dark:to-purple-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-semibold text-neutral-900 dark:text-white">
              Personal Study Agent
            </span>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3 leading-relaxed">
            Need help explaining a chapter or planning today's focus?
          </p>
          <button
            onClick={() => setActiveTab('agent')}
            className="w-full py-1.5 px-3 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg shadow-xs transition-colors text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            Chat with AI Mentor
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-neutral-200/60 dark:border-neutral-800/60">
        <div className="text-[11px] text-neutral-400 dark:text-neutral-500 flex items-center justify-between">
          <span>StudyOS v1.1 · AI</span>
          <span>Class 9 CBSE / ICSE</span>
        </div>
      </div>
    </aside>
  );
};

