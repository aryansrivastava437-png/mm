import React, { useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Maximize2,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { usePomodoroTimer } from '../hooks/usePomodoroTimer';
import { useStudy } from '../context/StudyContext';
import { formatMinutes } from '../utils/dateUtils';
import { TimerMode } from '../types';

export const PomodoroTimer: React.FC = () => {
  const {
    mode,
    isRunning,
    timeFormatted,
    progressRatio,
    completedCycles,
    completionMessage,
    dismissCompletionMessage,
    start,
    pause,
    reset,
    skip,
    switchMode,
    totalDurationMinutes,
  } = usePomodoroTimer();

  const {
    todayTasks,
    subjects,
    activeTaskForFocus,
    setActiveTaskForFocus,
    todayStats,
    sessions,
    setIsDistractionFree,
  } = useStudy();

  const activeSubject = subjects.find((s) => s.id === activeTaskForFocus?.subjectId);

  // SVG Circular progress dimensions
  const size = 260;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - Math.min(1, Math.max(0, progressRatio)));

  const modeLabels: Record<TimerMode, { title: string; subtitle: string; color: string; ringColor: string }> = {
    focus: {
      title: 'Deep Focus',
      subtitle: `${totalDurationMinutes}-minute focus session`,
      color: 'text-indigo-600 dark:text-indigo-400',
      ringColor: '#4F46E5',
    },
    short_break: {
      title: 'Short Break',
      subtitle: `${totalDurationMinutes}-minute recharge & stretch`,
      color: 'text-emerald-600 dark:text-emerald-400',
      ringColor: '#10B981',
    },
    long_break: {
      title: 'Long Break',
      subtitle: `${totalDurationMinutes}-minute deep rest & hydrate`,
      color: 'text-blue-600 dark:text-blue-400',
      ringColor: '#2563EB',
    },
  };

  const currentModeInfo = modeLabels[mode];

  // Today's completed sessions
  const todaySessions = useMemo(() => {
    return sessions.slice(0, 10);
  }, [sessions]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Focus Room
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Single-task with high cognitive intensity. Let nothing break your rhythm.
          </p>
        </div>

        <button
          onClick={() => setIsDistractionFree(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-xl transition-colors self-start sm:self-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Distraction-Free Mode</span>
        </button>
      </div>

      {/* Completion alert message if triggered */}
      {completionMessage && (
        <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80 flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <p className="text-sm font-medium text-neutral-900 dark:text-white">
              {completionMessage}
            </p>
          </div>
          <button
            onClick={dismissCompletionMessage}
            className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Focus Console */}
      <div className="p-6 sm:p-8 bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-3xl shadow-xs flex flex-col items-center text-center space-y-6">
        {/* Mode Selector Segmented Tabs */}
        <div className="flex items-center p-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-xl border border-neutral-200/60 dark:border-neutral-700/60">
          <button
            onClick={() => switchMode('focus')}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${
              mode === 'focus'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Focus (25m)
          </button>
          <button
            onClick={() => switchMode('short_break')}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${
              mode === 'short_break'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Short Break (5m)
          </button>
          <button
            onClick={() => switchMode('long_break')}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${
              mode === 'long_break'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Long Break (15m)
          </button>
        </div>

        {/* Task Selection Dropdown */}
        <div className="w-full max-w-md">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-1.5 text-left">
            Focusing on:
          </label>
          <div className="relative">
            <select
              value={activeTaskForFocus?.id || ''}
              onChange={(e) => {
                const sel = todayTasks.find((t) => t.id === e.target.value);
                setActiveTaskForFocus(sel || null);
              }}
              className="w-full pl-3 pr-8 py-2 text-xs font-medium bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700/80 rounded-xl text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="">-- No specific task (Free focus study) --</option>
              {todayTasks
                .filter((t) => !t.completed)
                .map((task) => {
                  const sub = subjects.find((s) => s.id === task.subjectId);
                  return (
                    <option key={task.id} value={task.id}>
                      {sub ? `[${sub.name}] ` : ''}
                      {task.title}
                    </option>
                  );
                })}
            </select>
          </div>
          {activeTaskForFocus && (
            <div className="flex items-center justify-between mt-1.5 text-[11px] text-neutral-500 dark:text-neutral-400 px-1">
              <span className="flex items-center gap-1 font-medium">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: activeSubject?.color || '#4F46E5' }}
                />
                {activeSubject?.name}
              </span>
              <span>Est: {activeTaskForFocus.estimatedMinutes} min</span>
            </div>
          )}
        </div>

        {/* Circular SVG Timer */}
        <div className="relative flex items-center justify-center my-2">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-neutral-100 dark:text-neutral-800/80"
              fill="transparent"
            />
            {/* Progress track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={currentModeInfo.ringColor}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-300 ease-linear"
            />
          </svg>

          {/* Time in center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-5xl sm:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white font-mono tabular-nums">
              {timeFormatted}
            </span>
            <span
              className={`text-xs font-semibold uppercase tracking-widest mt-1 ${currentModeInfo.color}`}
            >
              {isRunning ? (mode === 'focus' ? 'FOCUSING' : 'ON BREAK') : currentModeInfo.title}
            </span>
            <span className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">
              Cycle {(completedCycles % 4) + 1} of 4
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-3 w-full max-w-sm">
          {isRunning ? (
            <button
              onClick={pause}
              className="flex-1 py-3 px-5 text-sm font-semibold text-neutral-800 dark:text-white bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-2xl transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <Pause className="w-4 h-4 fill-current" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={start}
              className="flex-1 py-3 px-5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{mode === 'focus' ? 'Start Focus' : 'Start Break'}</span>
            </button>
          )}

          <button
            onClick={reset}
            title="Reset session"
            className="p-3 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-2xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Reset timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={skip}
            title="Skip to next session"
            className="p-3 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-2xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Skip session"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Quick summary metrics */}
        <div className="flex items-center justify-center gap-6 pt-4 border-t border-neutral-100 dark:border-neutral-800/80 text-xs text-neutral-500 dark:text-neutral-400 w-full">
          <div>
            <span className="text-neutral-400 block text-[10px] uppercase">Today's Focus</span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-200 tabular-nums">
              {formatMinutes(todayStats.focusMinutes)}
            </span>
          </div>
          <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-800" />
          <div>
            <span className="text-neutral-400 block text-[10px] uppercase">Sessions Done</span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-200 tabular-nums">
              {todayStats.pomodoros} sessions
            </span>
          </div>
        </div>
      </div>

      {/* Session History Log */}
      <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
            Today’s Focus Log
          </h3>
          <span className="text-xs text-neutral-400 dark:text-neutral-500 tabular-nums">
            {todaySessions.length} logged
          </span>
        </div>

        {todaySessions.length === 0 ? (
          <div className="text-center py-6 text-neutral-400 dark:text-neutral-500 text-xs">
            <Clock className="w-6 h-6 mx-auto mb-1.5 opacity-40" />
            No focus sessions yet today. Start your first 25-minute session above!
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
            {todaySessions.map((session, idx) => {
              const sub = subjects.find((s) => s.id === session.subjectId);
              const timeString = new Date(session.completedAt).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              });

              return (
                <div key={session.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-neutral-900 dark:text-white truncate">
                        {session.taskTitle || 'Open Study Session'}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 dark:text-neutral-500">
                        {sub && (
                          <span className="flex items-center gap-1">
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: sub.color }}
                            />
                            {sub.name}
                          </span>
                        )}
                        <span>·</span>
                        <span>{timeString}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 font-mono tabular-nums text-neutral-600 dark:text-neutral-400">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      +{session.durationMinutes}m
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
