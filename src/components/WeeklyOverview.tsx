import React from 'react';
import { Flame, Target, Trophy, TrendingUp, CalendarDays } from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { formatMinutes, getCurrentWeekDays } from '../utils/dateUtils';

export const WeeklyOverview: React.FC = () => {
  const { dailyActivities, streak, settings, updateSettings, todayStats } = useStudy();

  const weekDays = getCurrentWeekDays();

  // Find maximum focus minutes in this week for proportional bar scaling
  const maxWeekMinutes = Math.max(
    120,
    ...weekDays.map((d) => dailyActivities[d.dateStr]?.focusMinutes || 0)
  );

  const goalOptions = [30, 60, 90, 120, 180];
  const goalMinutes = settings.dailyGoalMinutes || 120;
  const goalProgressRatio = Math.min(1, todayStats.focusMinutes / goalMinutes);
  const goalPercentage = Math.round(goalProgressRatio * 100);

  // Total weekly calculations
  const weeklyFocusTotal = weekDays.reduce(
    (acc, d) => acc + (dailyActivities[d.dateStr]?.focusMinutes || 0),
    0
  );
  const weeklyTasksTotal = weekDays.reduce(
    (acc, d) => acc + (dailyActivities[d.dateStr]?.tasksCompleted || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Top Banner: Study Streak & Goal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Streak Card */}
        <div className="p-5 sm:p-6 bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 flex items-center justify-center text-amber-500">
                <Flame className="w-4 h-4 fill-amber-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Study Streak
                </h3>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                  Calculated from real daily sessions
                </p>
              </div>
            </div>

            <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tabular-nums">
              {streak.currentStreak}{' '}
              <span className="text-sm font-semibold text-neutral-400">days</span>
            </span>
          </div>

          {/* Mini Calendar visualization */}
          <div className="grid grid-cols-7 gap-1.5 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
            {weekDays.map((d) => {
              const rec = dailyActivities[d.dateStr];
              const isActive = rec && (rec.focusMinutes > 0 || rec.tasksCompleted > 0 || rec.pomodoros > 0);

              return (
                <div
                  key={d.dateStr}
                  className={`p-2 rounded-xl text-center flex flex-col items-center justify-center border transition-all ${
                    d.isToday
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                      : isActive
                      ? 'border-amber-200 dark:border-amber-800/40 bg-amber-50/40 dark:bg-amber-950/20'
                      : 'border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40'
                  }`}
                >
                  <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500 uppercase">
                    {d.dayName}
                  </span>
                  <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 tabular-nums">
                    {d.dayNumber}
                  </span>
                  {isActive ? (
                    <Flame className="w-3 h-3 text-amber-500 fill-amber-500 mt-1" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700 mt-1.5" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
            <span>Longest streak: <strong className="text-neutral-900 dark:text-white tabular-nums">{streak.longestStreak} days</strong></span>
            <span>Keep the chain unbroken 🔥</span>
          </div>
        </div>

        {/* Daily Study Goal Card */}
        <div className="p-5 sm:p-6 bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Daily Study Goal
                </h3>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                  Target deep study focus
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white tabular-nums">
                {todayStats.focusMinutes} / {goalMinutes} min
              </span>
              <span className="block text-[11px] text-neutral-400 dark:text-neutral-500">
                {goalPercentage >= 100 ? 'Goal Achieved! 🏆' : `${Math.max(0, goalMinutes - todayStats.focusMinutes)} min to go`}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                goalPercentage >= 100 ? 'bg-emerald-500' : 'bg-indigo-600 dark:bg-indigo-500'
              }`}
              style={{ width: `${Math.min(100, goalPercentage)}%` }}
            />
          </div>

          {/* Quick Goal Presets */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 mb-1.5">
              Change Daily Goal:
            </label>
            <div className="flex flex-wrap items-center gap-1.5">
              {goalOptions.map((mins) => (
                <button
                  key={mins}
                  onClick={() => updateSettings({ dailyGoalMinutes: mins })}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors tabular-nums ${
                    goalMinutes === mins
                      ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  {mins < 60 ? `${mins}m` : `${mins / 60}h`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Activity Bar Chart */}
      <div className="p-5 sm:p-6 bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                This Week’s Focus Activity
              </h3>
            </div>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
              Monday through Sunday study performance
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-neutral-400">Total Focus: </span>
              <strong className="text-neutral-900 dark:text-white tabular-nums">
                {formatMinutes(weeklyFocusTotal)}
              </strong>
            </div>
            <div>
              <span className="text-neutral-400">Tasks Completed: </span>
              <strong className="text-neutral-900 dark:text-white tabular-nums">
                {weeklyTasksTotal}
              </strong>
            </div>
          </div>
        </div>

        {/* Bar chart */}
        <div className="pt-4 grid grid-cols-7 gap-2 sm:gap-4 items-end h-48 border-b border-neutral-100 dark:border-neutral-800 pb-2">
          {weekDays.map((d) => {
            const rec = dailyActivities[d.dateStr];
            const mins = rec?.focusMinutes || 0;
            const barHeightPercent = Math.max(8, Math.round((mins / maxWeekMinutes) * 100));

            return (
              <div key={d.dateStr} className="flex flex-col items-center h-full justify-end group">
                <div className="text-[10px] font-mono text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1 tabular-nums">
                  {mins}m
                </div>
                <div className="w-full max-w-[36px] bg-neutral-100 dark:bg-neutral-800/80 rounded-t-lg relative flex flex-col justify-end h-32 overflow-hidden">
                  <div
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      d.isToday
                        ? 'bg-indigo-600 dark:bg-indigo-500'
                        : mins > 0
                        ? 'bg-indigo-400/80 dark:bg-indigo-600/70 hover:bg-indigo-500'
                        : 'bg-transparent'
                    }`}
                    style={{ height: `${mins > 0 ? barHeightPercent : 0}%` }}
                  />
                </div>
                <span
                  className={`text-[11px] mt-2 font-medium tracking-tight ${
                    d.isToday
                      ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  {d.dayName}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[11px] text-neutral-400 dark:text-neutral-500 pt-1">
          <span>Weekly target based on {settings.dailyGoalMinutes} min/day</span>
          <span className="tabular-nums font-mono">
            {Math.round((weeklyFocusTotal / (goalMinutes * 7)) * 100)}% of weekly goal
          </span>
        </div>
      </div>
    </div>
  );
};
