import { DailyActivity, PomodoroSession, Subject, Task, UserSettings } from '../types';
import { getTodayDateString } from './dateUtils';

const STORAGE_KEY = 'studyos_v1_data';

export const DEFAULT_SUBJECTS: Subject[] = [
  {
    id: 'math',
    name: 'Mathematics',
    color: '#4F46E5', // Indigo
    iconName: 'Calculator',
    description: 'Algebra, Geometry, Coordinate Geometry & Number Systems',
  },
  {
    id: 'science',
    name: 'Science',
    color: '#0D9488', // Teal
    iconName: 'Atom',
    description: 'Physics (Motion & Laws), Chemistry & Biology',
  },
  {
    id: 'english',
    name: 'English',
    color: '#E11D48', // Rose
    iconName: 'BookOpen',
    description: 'Beehive, Moments, Reading & Writing Skills',
  },
  {
    id: 'sst',
    name: 'Social Science',
    color: '#D97706', // Amber
    iconName: 'Globe',
    description: 'History, Geography, Democratic Politics & Economics',
  },
  {
    id: 'hindi',
    name: 'Hindi',
    color: '#8B5CF6', // Purple
    iconName: 'Languages',
    description: 'Sparsh, Sanchayan & Vyakaran',
  },
  {
    id: 'computer',
    name: 'Computer',
    color: '#2563EB', // Blue
    iconName: 'Cpu',
    description: 'Information Technology, Basics of Python & Cyber Safety',
  },
];

export const DEFAULT_SETTINGS: UserSettings = {
  studentName: 'Aryan',
  grade: 'Class 9',
  dailyGoalMinutes: 120, // 2 hours
  theme: 'system',
  soundEnabled: true,
  onboardingCompleted: true,
  pomodoro: {
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    sessionsBeforeLongBreak: 4,
    soundEnabled: true,
  },
};

export const INITIAL_SAMPLE_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Complete Maths exercise 3.2 (Coordinate Geometry)',
    subjectId: 'math',
    priority: 'high',
    estimatedMinutes: 35,
    completed: false,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    isBacklog: false,
    order: 0,
    notes: 'Solve questions 1 through 6 in homework register',
  },
  {
    id: 'task-2',
    title: 'Revise Physics Motion formulas & graph problems',
    subjectId: 'science',
    priority: 'high',
    estimatedMinutes: 40,
    completed: true,
    completedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    isBacklog: false,
    order: 1,
    notes: 'Derive v = u + at and s = ut + 0.5at^2',
  },
  {
    id: 'task-3',
    title: 'Read English Beehive chapter 4 & vocabulary',
    subjectId: 'english',
    priority: 'medium',
    estimatedMinutes: 25,
    completed: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    isBacklog: false,
    order: 2,
    notes: 'Underline unfamiliar words and poetic devices',
  },
  {
    id: 'task-4',
    title: 'Prepare History notes on French Revolution timeline',
    subjectId: 'sst',
    priority: 'medium',
    estimatedMinutes: 30,
    completed: true,
    completedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    isBacklog: false,
    order: 3,
    notes: 'Include key dates: 1789 Bastille, 1792 National Convention',
  },
  {
    id: 'task-5',
    title: 'Practice Hindi grammar Sandhi and Samas exercises',
    subjectId: 'hindi',
    priority: 'low',
    estimatedMinutes: 20,
    completed: false,
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    isBacklog: false,
    order: 4,
    notes: 'Page 48 textbook exercises 1 to 10',
  },
  // Backlog items
  {
    id: 'task-backlog-1',
    title: 'Revise Chemistry Chapter 2 (Is Matter Around Us Pure)',
    subjectId: 'science',
    priority: 'medium',
    estimatedMinutes: 45,
    completed: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    isBacklog: true,
    order: 0,
    notes: 'Separate mixtures techniques summary',
  },
  {
    id: 'task-backlog-2',
    title: 'Complete extra NCERT Exemplar problems in Triangles',
    subjectId: 'math',
    priority: 'high',
    estimatedMinutes: 50,
    completed: false,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    isBacklog: true,
    order: 1,
    notes: 'Questions 8 through 15',
  },
  {
    id: 'task-backlog-3',
    title: 'Create Computer applications presentation on Cyber Safety',
    subjectId: 'computer',
    priority: 'low',
    estimatedMinutes: 30,
    completed: false,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    isBacklog: true,
    order: 2,
    notes: 'Slide deck for upcoming class seminar',
  },
];

export interface StudyOSStorageSchema {
  version: number;
  tasks: Task[];
  subjects: Subject[];
  settings: UserSettings;
  sessions: PomodoroSession[];
  dailyActivities: Record<string, DailyActivity>;
  reflections: Record<string, string>;
  activeTimerState?: {
    mode: 'focus' | 'short_break' | 'long_break';
    targetEndTime: number | null; // Timestamp
    remainingSeconds: number;
    isRunning: boolean;
    taskId?: string;
    completedCycles: number;
  };
}

function getSeedActivities(): Record<string, DailyActivity> {
  const today = new Date();
  const activities: Record<string, DailyActivity> = {};

  // Seed 4 days of realistic past study for Class 9 to illustrate streak & weekly progress
  const pastDays = [
    { offset: 4, focus: 50, tasksDone: 3, total: 4, pomos: 2 },
    { offset: 3, focus: 75, tasksDone: 4, total: 5, pomos: 3 },
    { offset: 2, focus: 100, tasksDone: 5, total: 6, pomos: 4 },
    { offset: 1, focus: 80, tasksDone: 4, total: 4, pomos: 3 },
  ];

  pastDays.forEach(({ offset, focus, tasksDone, total, pomos }) => {
    const d = new Date(today);
    d.setDate(today.getDate() - offset);
    const dateStr = getTodayDateString(d);
    activities[dateStr] = {
      date: dateStr,
      focusMinutes: focus,
      tasksCompleted: tasksDone,
      totalTasks: total,
      pomodoros: pomos,
      reflection: 'Good consistent study session. Solved all targeted science and math problems.',
    };
  });

  const todayStr = getTodayDateString(today);
  activities[todayStr] = {
    date: todayStr,
    focusMinutes: 50,
    tasksCompleted: 2,
    totalTasks: 5,
    pomodoros: 2,
    reflection: 'Finished Physics Motion formulas and French Revolution notes. Feeling focused.',
  };

  return activities;
}

export function getDefaultStorageData(): StudyOSStorageSchema {
  const todayStr = getTodayDateString();
  const seedActivities = getSeedActivities();

  return {
    version: 1,
    tasks: INITIAL_SAMPLE_TASKS,
    subjects: DEFAULT_SUBJECTS,
    settings: DEFAULT_SETTINGS,
    sessions: [
      {
        id: 'session-seed-1',
        taskId: 'task-2',
        taskTitle: 'Revise Physics Motion formulas & graph problems',
        subjectId: 'science',
        durationMinutes: 25,
        completedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        type: 'focus',
        date: todayStr,
      },
      {
        id: 'session-seed-2',
        taskId: 'task-4',
        taskTitle: 'Prepare History notes on French Revolution timeline',
        subjectId: 'sst',
        durationMinutes: 25,
        completedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
        type: 'focus',
        date: todayStr,
      },
    ],
    dailyActivities: seedActivities,
    reflections: {
      [todayStr]: 'Finished Physics Motion formulas and French Revolution notes. Feeling focused.',
    },
  };
}

export function loadStudyOSData(): StudyOSStorageSchema {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getDefaultStorageData();
      saveStudyOSData(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.tasks)) {
      console.warn('Corrupted data detected, restoring safe defaults');
      const fallback = getDefaultStorageData();
      saveStudyOSData(fallback);
      return fallback;
    }

    // Merge in case schema evolved
    return {
      version: 1,
      tasks: parsed.tasks || [],
      subjects: parsed.subjects && parsed.subjects.length > 0 ? parsed.subjects : DEFAULT_SUBJECTS,
      settings: {
        ...DEFAULT_SETTINGS,
        ...(parsed.settings || {}),
        pomodoro: {
          ...DEFAULT_SETTINGS.pomodoro,
          ...(parsed.settings?.pomodoro || {}),
        },
      },
      sessions: parsed.sessions || [],
      dailyActivities: parsed.dailyActivities || {},
      reflections: parsed.reflections || {},
      activeTimerState: parsed.activeTimerState,
    };
  } catch (err) {
    console.error('Failed to read from localStorage:', err);
    return getDefaultStorageData();
  }
}

export function saveStudyOSData(data: StudyOSStorageSchema): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

export function exportBackupJSON(data: StudyOSStorageSchema): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `studyos-backup-${getTodayDateString()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function validateAndImportBackup(jsonString: string): StudyOSStorageSchema | null {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') return null;
    if (!Array.isArray(parsed.tasks) || !Array.isArray(parsed.subjects)) return null;

    const sanitized: StudyOSStorageSchema = {
      version: parsed.version || 1,
      tasks: parsed.tasks,
      subjects: parsed.subjects,
      settings: {
        ...DEFAULT_SETTINGS,
        ...(parsed.settings || {}),
      },
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      dailyActivities: parsed.dailyActivities || {},
      reflections: parsed.reflections || {},
      activeTimerState: parsed.activeTimerState,
    };
    saveStudyOSData(sanitized);
    return sanitized;
  } catch (e) {
    console.error('Failed to import backup:', e);
    return null;
  }
}

export function clearAllStorageData(): StudyOSStorageSchema {
  const fresh = getDefaultStorageData();
  fresh.tasks = [];
  fresh.sessions = [];
  fresh.dailyActivities = {};
  fresh.reflections = {};
  fresh.settings.onboardingCompleted = true;
  saveStudyOSData(fresh);
  return fresh;
}
