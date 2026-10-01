/**
 * Accurate local calendar date utilities.
 * Avoids UTC timezone shift errors by formatting local calendar components.
 */

export function getTodayDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatFriendlyDate(dateString?: string): string {
  const d = dateString ? parseLocalDate(dateString) : new Date();
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function formatShortDate(dateString: string): string {
  const d = parseLocalDate(dateString);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Calculates current consecutive study streak from recorded daily activity.
 * A day counts as active if tasksCompleted > 0 OR pomodoros > 0 OR focusMinutes > 0.
 */
export function calculateStreak(dailyRecords: Record<string, { tasksCompleted: number; focusMinutes: number; pomodoros: number }>): {
  currentStreak: number;
  longestStreak: number;
} {
  const todayStr = getTodayDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getTodayDateString(yesterday);

  const isActive = (dateStr: string) => {
    const record = dailyRecords[dateStr];
    return record && (record.tasksCompleted > 0 || record.pomodoros > 0 || record.focusMinutes > 0);
  };

  // Determine starting point: either today (if already active) or yesterday
  let checkDate = new Date();
  let currentStreak = 0;

  if (isActive(todayStr)) {
    currentStreak++;
    checkDate.setDate(checkDate.getDate() - 1);
  } else if (isActive(yesterdayStr)) {
    checkDate.setDate(checkDate.getDate() - 1);
  } else {
    return { currentStreak: 0, longestStreak: calculateLongestStreak(dailyRecords) };
  }

  // Walk backwards day by day
  while (true) {
    const dateStr = getTodayDateString(checkDate);
    if (isActive(dateStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  const longestStreak = Math.max(currentStreak, calculateLongestStreak(dailyRecords));
  return { currentStreak, longestStreak };
}

function calculateLongestStreak(dailyRecords: Record<string, { tasksCompleted: number; focusMinutes: number; pomodoros: number }>): number {
  const dates = Object.keys(dailyRecords).sort();
  if (dates.length === 0) return 0;

  let longest = 0;
  let running = 0;
  let prevDate: Date | null = null;

  for (const dateStr of dates) {
    const rec = dailyRecords[dateStr];
    const active = rec && (rec.tasksCompleted > 0 || rec.pomodoros > 0 || rec.focusMinutes > 0);
    if (!active) continue;

    const currDate = parseLocalDate(dateStr);
    if (!prevDate) {
      running = 1;
    } else {
      const diffTime = currDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 3600 * 24));
      if (diffDays === 1) {
        running++;
      } else if (diffDays > 1) {
        running = 1;
      }
    }
    prevDate = currDate;
    if (running > longest) longest = running;
  }

  return longest;
}

/**
 * Returns the 7 days of the current week (Monday to Sunday)
 */
export function getCurrentWeekDays(refDate: Date = new Date()): Array<{
  dayName: string; // 'Mon', 'Tue', etc.
  fullDayName: string;
  dateStr: string;
  dayNumber: number;
  isToday: boolean;
}> {
  const curr = new Date(refDate);
  // Get Monday of this week (0 is Sunday, 1 is Monday... 6 is Saturday)
  const day = curr.getDay();
  const diffToMonday = curr.getDate() - day + (day === 0 ? -6 : 1);
  
  const monday = new Date(curr.setDate(diffToMonday));
  const todayStr = getTodayDateString();

  const week = [];
  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(monday);
    nextDay.setDate(monday.getDate() + i);
    const dateStr = getTodayDateString(nextDay);
    
    week.push({
      dayName: nextDay.toLocaleDateString('en-US', { weekday: 'short' }),
      fullDayName: nextDay.toLocaleDateString('en-US', { weekday: 'long' }),
      dateStr,
      dayNumber: nextDay.getDate(),
      isToday: dateStr === todayStr,
    });
  }

  return week;
}

export function formatMinutes(totalMinutes: number): string {
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }
  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}
