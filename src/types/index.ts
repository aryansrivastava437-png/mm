export type Priority = 'high' | 'medium' | 'low';

export type SubjectId = string;

export interface Subject {
  id: SubjectId;
  name: string;
  color: string; // Hex color or Tailwind accent class
  textColor?: string;
  iconName: string;
  description?: string;
}

export interface Task {
  id: string;
  title: string;
  subjectId: SubjectId;
  priority: Priority;
  estimatedMinutes: number;
  dueDate?: string; // YYYY-MM-DD
  completed: boolean;
  completedAt?: string; // ISO string
  createdAt: string; // ISO string
  notes?: string;
  isBacklog: boolean;
  order: number;
}

export type TimerMode = 'focus' | 'short_break' | 'long_break';

export interface PomodoroSettings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
  soundEnabled: boolean;
}

export interface PomodoroSession {
  id: string;
  taskId?: string;
  taskTitle?: string;
  subjectId?: SubjectId;
  durationMinutes: number;
  completedAt: string; // ISO string
  type: TimerMode;
  date: string; // YYYY-MM-DD
}

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  tasksCompleted: number;
  totalTasks: number;
  focusMinutes: number;
  pomodoros: number;
  reflection?: string;
}

export interface UserSettings {
  studentName: string;
  grade: string;
  dailyGoalMinutes: number;
  theme: 'light' | 'dark' | 'system';
  pomodoro: PomodoroSettings;
  soundEnabled: boolean;
  onboardingCompleted: boolean;
}

export interface PlannedSlot {
  id: string;
  timeLabel: string;
  taskId?: string;
  title: string;
  subjectName?: string;
  subjectColor?: string;
  durationMinutes: number;
  isBreak: boolean;
}

export type NavTab = 'dashboard' | 'tasks' | 'focus' | 'backlog' | 'progress' | 'subjects' | 'settings' | 'agent';
