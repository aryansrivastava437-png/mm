import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  DailyActivity,
  NavTab,
  PlannedSlot,
  PomodoroSession,
  PomodoroSettings,
  Priority,
  Subject,
  SubjectId,
  Task,
  TimerMode,
  UserSettings,
} from '../types';
import {
  calculateStreak,
  getTodayDateString,
} from '../utils/dateUtils';
import {
  clearAllStorageData,
  exportBackupJSON,
  loadStudyOSData,
  saveStudyOSData,
  StudyOSStorageSchema,
  validateAndImportBackup,
} from '../utils/storage';
import { playChime } from '../utils/audio';

interface StudyContextType {
  // Data
  tasks: Task[];
  todayTasks: Task[];
  backlogTasks: Task[];
  subjects: Subject[];
  settings: UserSettings;
  sessions: PomodoroSession[];
  dailyActivities: Record<string, DailyActivity>;
  reflections: Record<string, string>;

  // Focus & Navigation
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  activeTaskForFocus: Task | null;
  setActiveTaskForFocus: (task: Task | null) => void;
  isDistractionFree: boolean;
  setIsDistractionFree: (val: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (val: boolean) => void;
  isPlanMyDayOpen: boolean;
  setIsPlanMyDayOpen: (val: boolean) => void;

  // Task Actions
  addTask: (data: {
    title: string;
    subjectId: SubjectId;
    priority?: Priority;
    estimatedMinutes?: number;
    notes?: string;
    dueDate?: string;
    isBacklog?: boolean;
  }) => Task;
  editTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  moveTaskToBacklog: (id: string) => void;
  moveBacklogToToday: (id: string) => void;
  reorderTasks: (newOrderTasks: Task[], isBacklog?: boolean) => void;

  // Subject Actions
  addSubject: (data: Omit<Subject, 'id'>) => Subject;
  editSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;

  // Settings & Theme
  updateSettings: (updates: Partial<UserSettings>) => void;
  updatePomodoroSettings: (updates: Partial<PomodoroSettings>) => void;
  toggleTheme: () => void;
  resolvedTheme: 'light' | 'dark';

  // Pomodoro Completion Handler
  recordCompletedSession: (durationMinutes: number, type: TimerMode, taskId?: string) => void;

  // Reflection
  saveDailyReflection: (text: string, dateStr?: string) => void;

  // Calculated Stats
  streak: { currentStreak: number; longestStreak: number };
  todayStats: {
    tasksCompleted: number;
    totalTasks: number;
    completionPercentage: number;
    focusMinutes: number;
    pomodoros: number;
    backlogCount: number;
    remainingTasks: number;
  };
  getSubjectStats: (subjectId: SubjectId) => {
    totalTasks: number;
    completedTasks: number;
    focusMinutes: number;
    percentage: number;
  };

  // Plan My Day
  generatePlanMyDay: (availableMinutes: number) => PlannedSlot[];

  // Backup & Reset
  exportData: () => void;
  importData: (jsonStr: string) => boolean;
  resetAllData: () => void;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state
  const [data, setData] = useState<StudyOSStorageSchema>(() => loadStudyOSData());

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [activeTaskForFocus, setActiveTaskForFocus] = useState<Task | null>(() => {
    // Default to first incomplete high priority task if available
    const initialToday = data.tasks.filter((t) => !t.isBacklog && !t.completed);
    return initialToday.find((t) => t.priority === 'high') || initialToday[0] || null;
  });
  const [isDistractionFree, setIsDistractionFree] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isPlanMyDayOpen, setIsPlanMyDayOpen] = useState<boolean>(false);

  // Sync state changes to storage
  useEffect(() => {
    saveStudyOSData(data);
  }, [data]);

  // System theme listener
  const [systemDark, setSystemDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  const resolvedTheme: 'light' | 'dark' = useMemo(() => {
    if (data.settings.theme === 'system') {
      return systemDark ? 'dark' : 'light';
    }
    return data.settings.theme;
  }, [data.settings.theme, systemDark]);

  // Sync theme class to documentElement
  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [resolvedTheme]);

  // Derived tasks
  const todayTasks = useMemo(() => {
    return data.tasks
      .filter((t) => !t.isBacklog)
      .sort((a, b) => a.order - b.order);
  }, [data.tasks]);

  const backlogTasks = useMemo(() => {
    return data.tasks
      .filter((t) => t.isBacklog)
      .sort((a, b) => a.order - b.order);
  }, [data.tasks]);

  // Helper to ensure today's dailyActivity record exists
  const ensureTodayActivity = useCallback((prevActivities: Record<string, DailyActivity>, tasks: Task[], dateStr: string) => {
    const existing = prevActivities[dateStr];
    const todayList = tasks.filter((t) => !t.isBacklog);
    const completedList = todayList.filter((t) => t.completed);

    return {
      date: dateStr,
      focusMinutes: existing?.focusMinutes || 0,
      pomodoros: existing?.pomodoros || 0,
      tasksCompleted: completedList.length,
      totalTasks: todayList.length,
      reflection: existing?.reflection || '',
    };
  }, []);

  // Task actions
  const addTask = useCallback((params: {
    title: string;
    subjectId: SubjectId;
    priority?: Priority;
    estimatedMinutes?: number;
    notes?: string;
    dueDate?: string;
    isBacklog?: boolean;
  }) => {
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: params.title.trim(),
      subjectId: params.subjectId,
      priority: params.priority || 'medium',
      estimatedMinutes: params.estimatedMinutes || 25,
      notes: params.notes?.trim() || '',
      dueDate: params.dueDate,
      completed: false,
      createdAt: new Date().toISOString(),
      isBacklog: !!params.isBacklog,
      order: 0,
    };

    setData((prev) => {
      // Prepend or append
      const updatedTasks = [newTask, ...prev.tasks.map((t) => ({ ...t, order: t.order + 1 }))];
      const todayStr = getTodayDateString();
      const updatedActivities = { ...prev.dailyActivities };
      if (!newTask.isBacklog) {
        updatedActivities[todayStr] = ensureTodayActivity(updatedActivities, updatedTasks, todayStr);
      }

      return {
        ...prev,
        tasks: updatedTasks,
        dailyActivities: updatedActivities,
      };
    });

    return newTask;
  }, [ensureTodayActivity]);

  const editTask = useCallback((id: string, updates: Partial<Task>) => {
    setData((prev) => {
      const updatedTasks = prev.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t));
      const todayStr = getTodayDateString();
      const updatedActivities = { ...prev.dailyActivities };
      updatedActivities[todayStr] = ensureTodayActivity(updatedActivities, updatedTasks, todayStr);

      return {
        ...prev,
        tasks: updatedTasks,
        dailyActivities: updatedActivities,
      };
    });
  }, [ensureTodayActivity]);

  const deleteTask = useCallback((id: string) => {
    setData((prev) => {
      const updatedTasks = prev.tasks.filter((t) => t.id !== id);
      const todayStr = getTodayDateString();
      const updatedActivities = { ...prev.dailyActivities };
      updatedActivities[todayStr] = ensureTodayActivity(updatedActivities, updatedTasks, todayStr);

      return {
        ...prev,
        tasks: updatedTasks,
        dailyActivities: updatedActivities,
      };
    });

    setActiveTaskForFocus((curr) => (curr?.id === id ? null : curr));
  }, [ensureTodayActivity]);

  const toggleTaskComplete = useCallback((id: string) => {
    let nowCompleted = false;
    setData((prev) => {
      const task = prev.tasks.find((t) => t.id === id);
      if (!task) return prev;
      nowCompleted = !task.completed;

      const updatedTasks = prev.tasks.map((t) => {
        if (t.id === id) {
          return {
            ...t,
            completed: nowCompleted,
            completedAt: nowCompleted ? new Date().toISOString() : undefined,
          };
        }
        return t;
      });

      const todayStr = getTodayDateString();
      const updatedActivities = { ...prev.dailyActivities };
      updatedActivities[todayStr] = ensureTodayActivity(updatedActivities, updatedTasks, todayStr);

      return {
        ...prev,
        tasks: updatedTasks,
        dailyActivities: updatedActivities,
      };
    });

    if (nowCompleted) {
      if (data.settings.soundEnabled) {
        playChime('task_done');
      }
      // Check if all today's tasks are completed to celebrate subtly
      const remainingToday = todayTasks.filter((t) => t.id !== id && !t.completed);
      if (remainingToday.length === 0 && todayTasks.length > 0) {
        try {
          confetti({
            particleCount: 45,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#4F46E5', '#10B981', '#F59E0B'],
          });
        } catch {
          // ignore
        }
      }
    }
  }, [data.settings.soundEnabled, ensureTodayActivity, todayTasks]);

  const moveTaskToBacklog = useCallback((id: string) => {
    setData((prev) => {
      const updatedTasks = prev.tasks.map((t) => (t.id === id ? { ...t, isBacklog: true } : t));
      const todayStr = getTodayDateString();
      const updatedActivities = { ...prev.dailyActivities };
      updatedActivities[todayStr] = ensureTodayActivity(updatedActivities, updatedTasks, todayStr);

      return {
        ...prev,
        tasks: updatedTasks,
        dailyActivities: updatedActivities,
      };
    });

    setActiveTaskForFocus((curr) => (curr?.id === id ? null : curr));
  }, [ensureTodayActivity]);

  const moveBacklogToToday = useCallback((id: string) => {
    setData((prev) => {
      const updatedTasks = prev.tasks.map((t) => (t.id === id ? { ...t, isBacklog: false } : t));
      const todayStr = getTodayDateString();
      const updatedActivities = { ...prev.dailyActivities };
      updatedActivities[todayStr] = ensureTodayActivity(updatedActivities, updatedTasks, todayStr);

      return {
        ...prev,
        tasks: updatedTasks,
        dailyActivities: updatedActivities,
      };
    });
  }, [ensureTodayActivity]);

  const reorderTasks = useCallback((newOrderTasks: Task[], isBacklog: boolean = false) => {
    setData((prev) => {
      const otherTasks = prev.tasks.filter((t) => t.isBacklog !== isBacklog);
      const indexed = newOrderTasks.map((t, idx) => ({ ...t, order: idx }));
      return {
        ...prev,
        tasks: [...otherTasks, ...indexed],
      };
    });
  }, []);

  // Subject actions
  const addSubject = useCallback((params: Omit<Subject, 'id'>) => {
    const newSub: Subject = {
      ...params,
      id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    setData((prev) => ({
      ...prev,
      subjects: [...prev.subjects, newSub],
    }));
    return newSub;
  }, []);

  const editSubject = useCallback((id: string, updates: Partial<Subject>) => {
    setData((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  }, []);

  const deleteSubject = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s.id !== id),
    }));
  }, []);

  // Settings
  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    setData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...updates,
      },
    }));
  }, []);

  const updatePomodoroSettings = useCallback((updates: Partial<PomodoroSettings>) => {
    setData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        pomodoro: {
          ...prev.settings.pomodoro,
          ...updates,
        },
      },
    }));
  }, []);

  const toggleTheme = useCallback(() => {
    setData((prev) => {
      const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
      return {
        ...prev,
        settings: {
          ...prev.settings,
          theme: nextTheme,
        },
      };
    });
  }, [resolvedTheme]);

  // Pomodoro recording
  const recordCompletedSession = useCallback((durationMinutes: number, type: TimerMode, taskId?: string) => {
    const todayStr = getTodayDateString();
    const task = taskId ? data.tasks.find((t) => t.id === taskId) : activeTaskForFocus;

    const newSession: PomodoroSession = {
      id: `session-${Date.now()}`,
      taskId: task?.id,
      taskTitle: task?.title,
      subjectId: task?.subjectId,
      durationMinutes,
      completedAt: new Date().toISOString(),
      type,
      date: todayStr,
    };

    setData((prev) => {
      const prevDaily = prev.dailyActivities[todayStr] || {
        date: todayStr,
        tasksCompleted: 0,
        totalTasks: 0,
        focusMinutes: 0,
        pomodoros: 0,
        reflection: '',
      };

      const updatedDaily: DailyActivity = {
        ...prevDaily,
        focusMinutes: type === 'focus' ? prevDaily.focusMinutes + durationMinutes : prevDaily.focusMinutes,
        pomodoros: type === 'focus' ? prevDaily.pomodoros + 1 : prevDaily.pomodoros,
      };

      return {
        ...prev,
        sessions: [newSession, ...prev.sessions],
        dailyActivities: {
          ...prev.dailyActivities,
          [todayStr]: updatedDaily,
        },
      };
    });
  }, [activeTaskForFocus, data.tasks]);

  // Reflection
  const saveDailyReflection = useCallback((text: string, dateStr: string = getTodayDateString()) => {
    setData((prev) => {
      const current = prev.dailyActivities[dateStr] || {
        date: dateStr,
        tasksCompleted: 0,
        totalTasks: 0,
        focusMinutes: 0,
        pomodoros: 0,
        reflection: '',
      };

      return {
        ...prev,
        reflections: {
          ...prev.reflections,
          [dateStr]: text,
        },
        dailyActivities: {
          ...prev.dailyActivities,
          [dateStr]: {
            ...current,
            reflection: text,
          },
        },
      };
    });
  }, []);

  // Stats
  const streak = useMemo(() => {
    return calculateStreak(data.dailyActivities);
  }, [data.dailyActivities]);

  const todayStats = useMemo(() => {
    const todayStr = getTodayDateString();
    const todayRecord = data.dailyActivities[todayStr];
    const totalToday = todayTasks.length;
    const completedToday = todayTasks.filter((t) => t.completed).length;
    const completionPercentage = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

    return {
      tasksCompleted: completedToday,
      totalTasks: totalToday,
      completionPercentage,
      focusMinutes: todayRecord?.focusMinutes || 0,
      pomodoros: todayRecord?.pomodoros || 0,
      backlogCount: backlogTasks.length,
      remainingTasks: Math.max(0, totalToday - completedToday),
    };
  }, [data.dailyActivities, todayTasks, backlogTasks.length]);

  const getSubjectStats = useCallback((subjectId: SubjectId) => {
    const subjectTasks = data.tasks.filter((t) => t.subjectId === subjectId);
    const completed = subjectTasks.filter((t) => t.completed).length;
    const total = subjectTasks.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Focus minutes spent across sessions for this subject
    const subjectSessions = data.sessions.filter(
      (s) => s.type === 'focus' && (s.subjectId === subjectId || data.tasks.find((t) => t.id === s.taskId)?.subjectId === subjectId)
    );
    const focusMinutes = subjectSessions.reduce((acc, s) => acc + s.durationMinutes, 0);

    return {
      totalTasks: total,
      completedTasks: completed,
      focusMinutes,
      percentage,
    };
  }, [data.sessions, data.tasks]);

  // Plan My Day
  const generatePlanMyDay = useCallback((availableMinutes: number): PlannedSlot[] => {
    const unfinished = todayTasks.filter((t) => !t.completed);
    if (unfinished.length === 0) return [];

    // Sort by priority (high > medium > low), then duration
    const priorityWeight: Record<Priority, number> = { high: 3, medium: 2, low: 1 };
    const sorted = [...unfinished].sort((a, b) => {
      const pDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
      if (pDiff !== 0) return pDiff;
      return (b.estimatedMinutes || 25) - (a.estimatedMinutes || 25);
    });

    const slots: PlannedSlot[] = [];
    let currentMinute = 0;
    const startTime = new Date();
    // Round to nearest 5 minutes
    startTime.setMinutes(Math.ceil(startTime.getMinutes() / 5) * 5, 0, 0);

    const formatSlotTime = (offsetMins: number) => {
      const slotD = new Date(startTime.getTime() + offsetMins * 60000);
      return slotD.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    let sessionCount = 0;
    for (const task of sorted) {
      if (currentMinute >= availableMinutes) break;

      const dur = Math.min(task.estimatedMinutes || 25, availableMinutes - currentMinute);
      if (dur < 10) break;

      const subject = data.subjects.find((s) => s.id === task.subjectId);

      slots.push({
        id: `slot-${task.id}-${currentMinute}`,
        timeLabel: formatSlotTime(currentMinute),
        taskId: task.id,
        title: task.title,
        subjectName: subject?.name || 'General',
        subjectColor: subject?.color || '#4F46E5',
        durationMinutes: dur,
        isBreak: false,
      });

      currentMinute += dur;
      sessionCount++;

      // Insert break if more time remains
      if (currentMinute + 5 <= availableMinutes) {
        const breakDur = sessionCount % 3 === 0 ? 10 : 5;
        slots.push({
          id: `break-${currentMinute}`,
          timeLabel: formatSlotTime(currentMinute),
          title: breakDur === 10 ? 'Rest & Hydrate (Longer Break)' : 'Quick Stretch & Water Break',
          durationMinutes: breakDur,
          isBreak: true,
        });
        currentMinute += breakDur;
      }
    }

    return slots;
  }, [data.subjects, todayTasks]);

  // Export / Import / Reset
  const exportData = useCallback(() => {
    exportBackupJSON(data);
  }, [data]);

  const importData = useCallback((jsonStr: string) => {
    const validated = validateAndImportBackup(jsonStr);
    if (validated) {
      setData(validated);
      return true;
    }
    return false;
  }, []);

  const resetAllData = useCallback(() => {
    const fresh = clearAllStorageData();
    setData(fresh);
    setActiveTaskForFocus(null);
  }, []);

  const value = useMemo(
    () => ({
      tasks: data.tasks,
      todayTasks,
      backlogTasks,
      subjects: data.subjects,
      settings: data.settings,
      sessions: data.sessions,
      dailyActivities: data.dailyActivities,
      reflections: data.reflections,
      activeTab,
      setActiveTab,
      activeTaskForFocus,
      setActiveTaskForFocus,
      isDistractionFree,
      setIsDistractionFree,
      isSearchOpen,
      setIsSearchOpen,
      isPlanMyDayOpen,
      setIsPlanMyDayOpen,
      addTask,
      editTask,
      deleteTask,
      toggleTaskComplete,
      moveTaskToBacklog,
      moveBacklogToToday,
      reorderTasks,
      addSubject,
      editSubject,
      deleteSubject,
      updateSettings,
      updatePomodoroSettings,
      toggleTheme,
      resolvedTheme,
      recordCompletedSession,
      saveDailyReflection,
      streak,
      todayStats,
      getSubjectStats,
      generatePlanMyDay,
      exportData,
      importData,
      resetAllData,
    }),
    [
      data.tasks,
      todayTasks,
      backlogTasks,
      data.subjects,
      data.settings,
      data.sessions,
      data.dailyActivities,
      data.reflections,
      activeTab,
      activeTaskForFocus,
      isDistractionFree,
      isSearchOpen,
      isPlanMyDayOpen,
      addTask,
      editTask,
      deleteTask,
      toggleTaskComplete,
      moveTaskToBacklog,
      moveBacklogToToday,
      reorderTasks,
      addSubject,
      editSubject,
      deleteSubject,
      updateSettings,
      updatePomodoroSettings,
      toggleTheme,
      resolvedTheme,
      recordCompletedSession,
      saveDailyReflection,
      streak,
      todayStats,
      getSubjectStats,
      generatePlanMyDay,
      exportData,
      importData,
      resetAllData,
    ]
  );

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
};

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};
