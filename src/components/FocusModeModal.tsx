import React from 'react';
import { Minimize2, Play, Pause, RotateCcw } from 'lucide-react';
import { usePomodoroTimer } from '../hooks/usePomodoroTimer';
import { useStudy } from '../context/StudyContext';

export const FocusModeModal: React.FC = () => {
  const { isDistractionFree, setIsDistractionFree, activeTaskForFocus, subjects } = useStudy();
  const {
    isRunning,
    timeFormatted,
    mode,
    start,
    pause,
    reset,
    progressRatio,
    completedCycles,
  } = usePomodoroTimer();

  if (!isDistractionFree) return null;

  const subject = subjects.find((s) => s.id === activeTaskForFocus?.subjectId);

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950 text-white flex flex-col items-center justify-between p-6 sm:p-12 animate-fadeIn selection:bg-indigo-500/20">
      {/* Top Header */}
      <div className="w-full max-w-3xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs uppercase tracking-widest text-neutral-400 font-medium">
            Distraction-Free Focus
          </span>
        </div>

        <button
          onClick={() => setIsDistractionFree(false)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label="Exit distraction-free mode"
        >
          <Minimize2 className="w-3.5 h-3.5" />
          <span>Exit Focus Mode</span>
        </button>
      </div>

      {/* Main Focus Center */}
      <div className="flex flex-col items-center text-center space-y-8 max-w-xl mx-auto my-auto">
        {/* Subject & Task */}
        <div className="space-y-2">
          {subject && (
            <span
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full"
              style={{
                backgroundColor: `${subject.color}25`,
                color: subject.color,
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: subject.color }}
              />
              {subject.name}
            </span>
          )}

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white max-w-lg">
            {activeTaskForFocus?.title || 'Focused Study Session'}
          </h1>

          <p className="text-sm text-neutral-400">
            {mode === 'focus' ? 'Deep Work in progress' : 'Break in progress'} · Session{' '}
            {(completedCycles % 4) + 1} of 4
          </p>
        </div>

        {/* Huge Timer */}
        <div className="text-7xl sm:text-9xl font-extrabold tracking-tight font-mono tabular-nums text-white">
          {timeFormatted}
        </div>

        {/* Minimal Progress Bar */}
        <div className="w-64 sm:w-80 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 transition-all duration-300 rounded-full"
            style={{ width: `${Math.round(progressRatio * 100)}%` }}
          />
        </div>

        {/* Minimal Controls */}
        <div className="flex items-center gap-4">
          {isRunning ? (
            <button
              onClick={pause}
              className="px-8 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-2xl transition-colors flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <Pause className="w-4 h-4 fill-current" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={start}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-2xl transition-colors flex items-center gap-2 shadow-lg shadow-indigo-600/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Resume Focus</span>
            </button>
          )}

          <button
            onClick={reset}
            className="p-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-2xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Reset timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Quote */}
      <div className="text-xs text-neutral-500 text-center font-medium">
        Plan less. Focus more. Finish what matters.
      </div>
    </div>
  );
};
