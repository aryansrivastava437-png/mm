import { useState, useEffect, useRef, useCallback } from 'react';
import { TimerMode } from '../types';
import { useStudy } from '../context/StudyContext';
import { playChime } from '../utils/audio';

const TIMER_STORAGE_KEY = 'studyos_active_timer_v1';

interface StoredTimerState {
  mode: TimerMode;
  targetEndTime: number | null; // Milliseconds timestamp
  remainingSeconds: number;
  isRunning: boolean;
  completedCycles: number;
  taskId?: string;
  durationMinutes: number;
}

export function usePomodoroTimer() {
  const {
    settings,
    recordCompletedSession,
    activeTaskForFocus,
    setActiveTaskForFocus,
    tasks,
  } = useStudy();

  const getDurationForMode = useCallback(
    (m: TimerMode): number => {
      if (m === 'focus') return settings.pomodoro.focusMinutes;
      if (m === 'short_break') return settings.pomodoro.shortBreakMinutes;
      return settings.pomodoro.longBreakMinutes;
    },
    [settings.pomodoro]
  );

  const [mode, setMode] = useState<TimerMode>('focus');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [targetEndTime, setTargetEndTime] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    return settings.pomodoro.focusMinutes * 60;
  });
  const [completedCycles, setCompletedCycles] = useState<number>(0);
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);

  // Restore stored timer state on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(TIMER_STORAGE_KEY);
      if (raw) {
        const stored: StoredTimerState = JSON.parse(raw);
        setMode(stored.mode);
        setCompletedCycles(stored.completedCycles || 0);

        if (stored.isRunning && stored.targetEndTime) {
          const now = Date.now();
          const rem = Math.max(0, Math.round((stored.targetEndTime - now) / 1000));
          if (rem > 0) {
            setRemainingSeconds(rem);
            setTargetEndTime(stored.targetEndTime);
            setIsRunning(true);
          } else {
            // Expired while tab was closed/sleeping
            setRemainingSeconds(0);
            setIsRunning(false);
            setTargetEndTime(null);
          }
        } else {
          setRemainingSeconds(stored.remainingSeconds);
          setIsRunning(false);
          setTargetEndTime(null);
        }

        if (stored.taskId) {
          const found = tasks.find((t) => t.id === stored.taskId);
          if (found) setActiveTaskForFocus(found);
        }
      }
    } catch {
      // Fallback
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save state on changes
  useEffect(() => {
    try {
      const stateToSave: StoredTimerState = {
        mode,
        targetEndTime,
        remainingSeconds,
        isRunning,
        completedCycles,
        taskId: activeTaskForFocus?.id,
        durationMinutes: getDurationForMode(mode),
      };
      localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch {
      // ignore
    }
  }, [mode, targetEndTime, remainingSeconds, isRunning, completedCycles, activeTaskForFocus, getDurationForMode]);

  // When timer duration settings change and timer is stopped, update remaining seconds
  const initialMount = useRef(true);
  useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false;
      return;
    }
    if (!isRunning && targetEndTime === null) {
      setRemainingSeconds(getDurationForMode(mode) * 60);
    }
  }, [settings.pomodoro, mode, isRunning, targetEndTime, getDurationForMode]);

  // Accurate interval ticker checking Date.now() against targetEndTime
  useEffect(() => {
    if (!isRunning || targetEndTime === null) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.round((targetEndTime - now) / 1000));

      setRemainingSeconds(diff);

      if (diff <= 0) {
        clearInterval(interval);
        handleSessionComplete();
      }
    }, 250);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, targetEndTime, mode, completedCycles]);

  const handleSessionComplete = useCallback(() => {
    setIsRunning(false);
    setTargetEndTime(null);

    const dur = getDurationForMode(mode);

    if (mode === 'focus') {
      // Play chime
      if (settings.soundEnabled) {
        playChime('focus_complete');
      }

      // Record session
      recordCompletedSession(dur, 'focus', activeTaskForFocus?.id);

      const nextCycle = completedCycles + 1;
      setCompletedCycles(nextCycle);

      const isLongBreak = nextCycle % settings.pomodoro.sessionsBeforeLongBreak === 0;
      const nextMode: TimerMode = isLongBreak ? 'long_break' : 'short_break';

      setCompletionMessage(`Focus session complete! 🎉 Take a ${isLongBreak ? 'longer 15-minute' : 'short 5-minute'} break.`);
      setMode(nextMode);
      setRemainingSeconds(getDurationForMode(nextMode) * 60);
    } else {
      // Break complete
      if (settings.soundEnabled) {
        playChime('break_complete');
      }

      setCompletionMessage('Break complete. Ready for another focus session? 🎯');
      setMode('focus');
      setRemainingSeconds(getDurationForMode('focus') * 60);
    }
  }, [
    activeTaskForFocus?.id,
    completedCycles,
    getDurationForMode,
    mode,
    recordCompletedSession,
    settings.pomodoro.sessionsBeforeLongBreak,
    settings.soundEnabled,
  ]);

  const start = useCallback(() => {
    const end = Date.now() + remainingSeconds * 1000;
    setTargetEndTime(end);
    setIsRunning(true);
    setCompletionMessage(null);
  }, [remainingSeconds]);

  const pause = useCallback(() => {
    if (!isRunning || targetEndTime === null) return;
    const now = Date.now();
    const rem = Math.max(0, Math.round((targetEndTime - now) / 1000));
    setRemainingSeconds(rem);
    setTargetEndTime(null);
    setIsRunning(false);
  }, [isRunning, targetEndTime]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setTargetEndTime(null);
    setRemainingSeconds(getDurationForMode(mode) * 60);
    setCompletionMessage(null);
  }, [getDurationForMode, mode]);

  const switchMode = useCallback(
    (newMode: TimerMode) => {
      setIsRunning(false);
      setTargetEndTime(null);
      setMode(newMode);
      setRemainingSeconds(getDurationForMode(newMode) * 60);
      setCompletionMessage(null);
    },
    [getDurationForMode]
  );

  const skip = useCallback(() => {
    setIsRunning(false);
    setTargetEndTime(null);
    if (mode === 'focus') {
      const nextMode = (completedCycles + 1) % settings.pomodoro.sessionsBeforeLongBreak === 0 ? 'long_break' : 'short_break';
      setMode(nextMode);
      setRemainingSeconds(getDurationForMode(nextMode) * 60);
    } else {
      setMode('focus');
      setRemainingSeconds(getDurationForMode('focus') * 60);
    }
    setCompletionMessage(null);
  }, [completedCycles, getDurationForMode, mode, settings.pomodoro.sessionsBeforeLongBreak]);

  // Formatted string mm:ss
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalModeDurationSeconds = getDurationForMode(mode) * 60;
  const progressRatio = totalModeDurationSeconds > 0 ? (totalModeDurationSeconds - remainingSeconds) / totalModeDurationSeconds : 0;

  return {
    mode,
    isRunning,
    remainingSeconds,
    timeFormatted,
    minutes,
    seconds,
    progressRatio,
    completedCycles,
    completionMessage,
    dismissCompletionMessage: () => setCompletionMessage(null),
    start,
    pause,
    reset,
    skip,
    switchMode,
    totalDurationMinutes: getDurationForMode(mode),
  };
}
