import React, { useState } from 'react';
import { CheckCircle2, Clock, Flame, Inbox, MessageSquareHeart, Save, Check } from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { formatMinutes, getTodayDateString } from '../utils/dateUtils';

export const DailyReport: React.FC = () => {
  const { todayStats, saveDailyReflection, reflections } = useStudy();
  const todayStr = getTodayDateString();
  const currentReflection = reflections[todayStr] || '';

  const [reflectionText, setReflectionText] = useState(currentReflection);
  const [justSaved, setJustSaved] = useState(false);

  const handleSaveReflection = (e: React.FormEvent) => {
    e.preventDefault();
    saveDailyReflection(reflectionText);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Daily Progress & Summary */}
      <div className="p-5 sm:p-6 bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl shadow-xs space-y-5">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-sm font-bold tracking-tight text-neutral-900 dark:text-white">
              Daily Mission Completion
            </h3>
            <span className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
              {todayStats.completionPercentage}%
            </span>
          </div>

          <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${todayStats.completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Breakdown Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl">
            <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 block">
              Done
            </span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {todayStats.tasksCompleted}
            </span>
          </div>

          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl">
            <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 block">
              Remaining
            </span>
            <span className="text-lg font-bold text-neutral-800 dark:text-neutral-200 tabular-nums">
              {todayStats.remainingTasks}
            </span>
          </div>

          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl">
            <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 block">
              Focus Time
            </span>
            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
              {formatMinutes(todayStats.focusMinutes)}
            </span>
          </div>

          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl">
            <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 block">
              Pomodoros
            </span>
            <span className="text-lg font-bold text-amber-600 dark:text-amber-400 tabular-nums">
              {todayStats.pomodoros}
            </span>
          </div>

          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl col-span-2 sm:col-span-1">
            <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 block">
              Backlog Left
            </span>
            <span className="text-lg font-bold text-neutral-700 dark:text-neutral-300 tabular-nums">
              {todayStats.backlogCount}
            </span>
          </div>
        </div>
      </div>

      {/* Daily Reflection Box */}
      <form
        onSubmit={handleSaveReflection}
        className="p-5 sm:p-6 bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl shadow-xs space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquareHeart className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              How did your study day go?
            </h3>
          </div>
          {justSaved && (
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 animate-fadeIn">
              <Check className="w-3.5 h-3.5" />
              Saved
            </span>
          )}
        </div>

        <textarea
          rows={3}
          value={reflectionText}
          onChange={(e) => setReflectionText(e.target.value)}
          placeholder="What did you learn today? What will you improve tomorrow? (e.g. Mastered Physics equations of motion, need more speed on Geometry theorems)"
          className="w-full p-3 text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/80 rounded-xl text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
        />

        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Reflection</span>
          </button>
        </div>
      </form>
    </div>
  );
};
