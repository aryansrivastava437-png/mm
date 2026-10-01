import React from 'react';
import { LayoutDashboard, CheckSquare, Timer, Archive, Bot } from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { NavTab } from '../types';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, todayStats } = useStudy();

  const items: Array<{ id: NavTab; label: string; icon: React.ElementType; badge?: number }> = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    {
      id: 'tasks',
      label: 'Mission',
      icon: CheckSquare,
      badge: todayStats.remainingTasks > 0 ? todayStats.remainingTasks : undefined,
    },
    { id: 'focus', label: 'Focus', icon: Timer },
    {
      id: 'agent',
      label: 'AI Mentor',
      icon: Bot,
    },
    {
      id: 'backlog',
      label: 'Backlog',
      icon: Archive,
      badge: todayStats.backlogCount > 0 ? todayStats.backlogCount : undefined,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 px-3 py-1.5 flex items-center justify-around h-16 safe-area-pb">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 relative focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 rounded-lg ${
              isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-neutral-500 dark:text-neutral-400'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5 transition-transform" />
              {item.badge !== undefined && (
                <span className="absolute -top-1.5 -right-2.5 px-1 min-w-[16px] h-4 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center tabular-nums">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium tracking-tight mt-1">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
