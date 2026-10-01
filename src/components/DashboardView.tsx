import React from 'react';
import {
  Play,
  Sparkles,
  ArrowRight,
  Flame,
  CheckCircle2,
  Clock,
  BookOpen,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { formatFriendlyDate, getGreeting } from '../utils/dateUtils';
import { StatsCards } from './StatsCards';
import { TaskManager } from './TaskManager';
import { DailyReport } from './DailyReport';
import { SubjectRadar } from './SubjectRadar';
import { WeeklyOverview } from './WeeklyOverview';

export const DashboardView: React.FC = () => {
  const {
    todayTasks,
    subjects,
    activeTaskForFocus,
    setActiveTaskForFocus,
    setActiveTab,
    setIsPlanMyDayOpen,
    settings,
  } = useStudy();

  const greeting = getGreeting();
  const dateFormatted = formatFriendlyDate();

  // Find candidate for Next Focus (first unfinished task or activeTaskForFocus)
  const nextTask =
    activeTaskForFocus && !activeTaskForFocus.completed
      ? activeTaskForFocus
      : todayTasks.find((t) => !t.completed) || null;

  const nextSubject = nextTask ? subjects.find((s) => s.id === nextTask.subjectId) : null;

  const handleStartFocusHero = () => {
    if (nextTask) {
      setActiveTaskForFocus(nextTask);
    }
    setActiveTab('focus');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Hero Banner */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
          <span>StudyOS</span>
          <span>•</span>
          <span>Class 9</span>
          <span>•</span>
          <span className="text-neutral-500 dark:text-neutral-400 font-medium normal-case">
            {dateFormatted}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white" style={{ textWrap: 'balance' }}>
          Your study day, organized.
        </h1>

        <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 font-medium max-w-2xl">
          Plan less. Focus more. Finish what matters.
        </p>
      </div>

      {/* Greeting & Next Focus Hero Card */}
      <div className="p-6 sm:p-7 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/40 dark:from-neutral-900 dark:via-neutral-900 dark:to-indigo-950/20 border border-neutral-200/90 dark:border-neutral-800 rounded-3xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              {greeting}, {settings.studentName || 'Student'} 👋
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white mt-0.5">
              What should you study right now?
            </h2>
          </div>

          <button
            onClick={() => setIsPlanMyDayOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-neutral-800 border border-indigo-200 dark:border-indigo-800 rounded-xl hover:bg-indigo-50 dark:hover:bg-neutral-700 transition-colors shadow-2xs self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Smart Plan</span>
          </button>
        </div>

        {nextTask ? (
          <div className="p-4 sm:p-5 bg-white dark:bg-neutral-800/90 border border-neutral-200/80 dark:border-neutral-700 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: nextSubject?.color || '#4F46E5' }}
                />
                <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                  {nextSubject?.name || 'General'}
                </span>
                <span className="text-neutral-300 dark:text-neutral-600">·</span>
                <span className="text-xs text-neutral-500 tabular-nums">
                  {nextTask.estimatedMinutes || 25} min estimated
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white truncate">
                {nextTask.title}
              </h3>
              {nextTask.notes && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                  {nextTask.notes}
                </p>
              )}
            </div>

            <button
              onClick={handleStartFocusHero}
              className="py-2.5 px-5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Focus</span>
            </button>
          </div>
        ) : (
          <div className="p-4 text-center rounded-2xl bg-white dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700 text-xs text-neutral-500 dark:text-neutral-400 space-y-1">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
            <p className="font-semibold text-neutral-800 dark:text-neutral-200">
              All tasks for today are finished!
            </p>
            <p>Add new homework below or take from your Backlog Vault.</p>
          </div>
        )}
      </div>

      {/* Quick Stats Section */}
      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">
          Quick Stats
        </h2>
        <StatsCards />
      </section>

      {/* Main Mission + Focus preview layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Today's Mission (Primary Visual Weight) */}
        <section aria-labelledby="mission-heading" className="lg:col-span-7">
          <TaskManager />
        </section>

        {/* Right Column: Daily Report, Reflection & Weekly Overview */}
        <div className="lg:col-span-5 space-y-6">
          <DailyReport />
        </div>
      </div>

      {/* Subject Radar Section */}
      <section aria-labelledby="radar-heading" className="pt-2">
        <SubjectRadar />
      </section>

      {/* Weekly Overview Section */}
      <section aria-labelledby="weekly-heading" className="pt-2">
        <WeeklyOverview />
      </section>
    </div>
  );
};
