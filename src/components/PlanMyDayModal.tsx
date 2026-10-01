import React, { useState } from 'react';
import { X, Sparkles, Clock, CheckCircle2, Play, Coffee } from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { PlannedSlot } from '../types';

export const PlanMyDayModal: React.FC = () => {
  const {
    isPlanMyDayOpen,
    setIsPlanMyDayOpen,
    generatePlanMyDay,
    setActiveTaskForFocus,
    setActiveTab,
    tasks,
  } = useStudy();

  const [selectedMinutes, setSelectedMinutes] = useState<number>(120);
  const [generatedPlan, setGeneratedPlan] = useState<PlannedSlot[] | null>(null);

  if (!isPlanMyDayOpen) return null;

  const handleGenerate = (mins: number) => {
    setSelectedMinutes(mins);
    const plan = generatePlanMyDay(mins);
    setGeneratedPlan(plan);
  };

  const handleStartTask = (taskId?: string) => {
    if (taskId) {
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        setActiveTaskForFocus(task);
      }
    }
    setIsPlanMyDayOpen(false);
    setActiveTab('focus');
  };

  const timeOptions = [
    { label: '30 min', value: 30, desc: 'Quick revision sprint' },
    { label: '1 hour', value: 60, desc: 'Single subject focus' },
    { label: '2 hours', value: 120, desc: 'Balanced multi-subject study' },
    { label: '3 hours', value: 180, desc: 'Deep exam preparation' },
    { label: '4+ hours', value: 240, desc: 'Full weekend study marathon' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                Plan My Day
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Organize your tasks into an optimal study sequence.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsPlanMyDayOpen(false)}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-xl"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Time Selection */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
            How much study time do you have today?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {timeOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleGenerate(opt.value)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  selectedMinutes === opt.value
                    ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <span className="block text-sm font-bold text-neutral-900 dark:text-white">
                  {opt.label}
                </span>
                <span className="block text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-tight">
                  {opt.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Generated Schedule Timeline */}
        {generatedPlan && (
          <div className="space-y-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-neutral-900 dark:text-white">
                Suggested Schedule ({selectedMinutes} min)
              </span>
              <span className="text-neutral-400">
                {generatedPlan.filter((s) => !s.isBreak).length} study blocks
              </span>
            </div>

            {generatedPlan.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 text-xs text-neutral-500">
                All today's tasks are completed! Add new tasks in Today's Mission to build a schedule.
              </div>
            ) : (
              <div className="space-y-2">
                {generatedPlan.map((slot) => {
                  if (slot.isBreak) {
                    return (
                      <div
                        key={slot.id}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30 text-xs"
                      >
                        <Coffee className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
                          {slot.timeLabel}
                        </span>
                        <span className="text-emerald-800 dark:text-emerald-200 font-medium">
                          {slot.title}
                        </span>
                        <span className="ml-auto text-[11px] text-emerald-600 dark:text-emerald-400 tabular-nums">
                          {slot.durationMinutes}m
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-neutral-800/90 border border-neutral-200 dark:border-neutral-700 text-xs shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400 shrink-0 tabular-nums">
                          {slot.timeLabel}
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-neutral-900 dark:text-white truncate">
                            {slot.title}
                          </p>
                          <span
                            className="inline-flex items-center gap-1 text-[11px] font-medium"
                            style={{ color: slot.subjectColor }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: slot.subjectColor }}
                            />
                            {slot.subjectName}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-neutral-500 tabular-nums">
                          {slot.durationMinutes}m
                        </span>
                        <button
                          onClick={() => handleStartTask(slot.taskId)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg transition-colors"
                          title="Start this task now"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-2">
          {!generatedPlan ? (
            <button
              type="button"
              onClick={() => handleGenerate(selectedMinutes)}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-xl transition-all shadow-xs"
            >
              Generate Optimal Plan
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                const firstTaskSlot = generatedPlan.find((s) => !s.isBreak);
                handleStartTask(firstTaskSlot?.taskId);
              }}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Begin Session 1 in Focus Room</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
