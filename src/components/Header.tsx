import React from 'react';
import { Search, Moon, Sun, Maximize2, Flame, Sparkles, Bot } from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { formatFriendlyDate } from '../utils/dateUtils';

export const Header: React.FC = () => {
  const {
    streak,
    resolvedTheme,
    toggleTheme,
    setIsSearchOpen,
    setIsDistractionFree,
    setIsPlanMyDayOpen,
    activeTab,
    setActiveTab,
  } = useStudy();

  const todayFormatted = formatFriendlyDate();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 py-3.5 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800/80 transition-colors">
      {/* Zone 1: Single text element Brand mark */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab('dashboard')}
          className="text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
        >
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              StudyOS
            </span>
            <span className="text-xs font-semibold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase">
              Class 9
            </span>
          </div>
          <p className="hidden md:block text-xs text-neutral-500 dark:text-neutral-400">
            {todayFormatted}
          </p>
        </button>
      </div>

      {/* Zone 2: Navigation Links (Desktop) */}
      <nav className="hidden xl:flex items-center gap-1 bg-neutral-100/70 dark:bg-neutral-800/60 p-1 rounded-xl border border-neutral-200/50 dark:border-neutral-700/50">
        {[
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'tasks', label: 'Today’s Mission' },
          { id: 'focus', label: 'Focus Room' },
          { id: 'backlog', label: 'Backlog Vault' },
          { id: 'progress', label: 'Reports & Streaks' },
          { id: 'subjects', label: 'Subjects' },
          { id: 'agent', label: 'AI Mentor ✦' },
        ].map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as typeof activeTab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                isActive
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Actions & Status */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Streak indicator */}
        <div
          title={`${streak.currentStreak} day study streak!`}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/50 rounded-lg cursor-default select-none"
        >
          <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
          <span className="tabular-nums font-semibold">{streak.currentStreak}d</span>
          <span className="hidden sm:inline text-amber-600 dark:text-amber-400/80">streak</span>
        </div>

        {/* AI Agent Quick Trigger */}
        <button
          onClick={() => setActiveTab('agent')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
            activeTab === 'agent'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/60 dark:border-indigo-800/50'
          }`}
          title="Open StudyOS Personal AI Agent"
        >
          <Bot className="w-4 h-4" />
          <span className="hidden sm:inline">AI Agent</span>
        </button>

        {/* Plan My Day quick trigger */}
        <button
          onClick={() => setIsPlanMyDayOpen(true)}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          title="Plan My Day automatically"
        >
          <Sparkles className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
          <span>Plan Day</span>
        </button>

        {/* Global Search Button */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-1.5 text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          title="Search tasks and subjects (Press /)"
          aria-label="Search StudyOS"
        >
          <Search className="w-4 h-4" />
          <span className="hidden md:inline text-neutral-400 dark:text-neutral-500 text-[11px] font-mono">
            /
          </span>
        </button>

        {/* Distraction-Free Fullscreen */}
        <button
          onClick={() => setIsDistractionFree(true)}
          className="hidden sm:flex items-center justify-center p-2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          title="Enter Distraction-Free Focus Mode"
          aria-label="Distraction-Free Mode"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center p-2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label="Toggle theme"
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-neutral-600" />
          )}
        </button>
      </div>
    </header>
  );
};

