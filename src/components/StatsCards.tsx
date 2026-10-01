import React from 'react';
import { CheckCircle2, Clock, Flame, Inbox } from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { formatMinutes } from '../utils/dateUtils';

export const StatsCards: React.FC = () => {
  const { todayStats } = useStudy();

  const cards = [
    {
      id: 'tasks',
      title: "Today's Tasks",
      value: `${todayStats.tasksCompleted} / ${todayStats.totalTasks}`,
      sublabel: 'completed today',
      icon: CheckCircle2,
      accent: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50/50 dark:bg-emerald-950/20',
      borderColor: 'border-emerald-200/60 dark:border-emerald-800/40',
    },
    {
      id: 'focus-time',
      title: 'Focus Time',
      value: formatMinutes(todayStats.focusMinutes),
      sublabel: 'deep study time',
      icon: Clock,
      accent: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50/50 dark:bg-indigo-950/20',
      borderColor: 'border-indigo-200/60 dark:border-indigo-800/40',
    },
    {
      id: 'pomodoros',
      title: 'Pomodoros',
      value: `${todayStats.pomodoros}`,
      sublabel: 'sessions finished',
      icon: Flame,
      accent: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50/50 dark:bg-amber-950/20',
      borderColor: 'border-amber-200/60 dark:border-amber-800/40',
    },
    {
      id: 'backlog',
      title: 'Backlog Vault',
      value: `${todayStats.backlogCount}`,
      sublabel: 'items waiting',
      icon: Inbox,
      accent: 'text-neutral-600 dark:text-neutral-300',
      bgColor: 'bg-neutral-50 dark:bg-neutral-900/60',
      borderColor: 'border-neutral-200/80 dark:border-neutral-800/80',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className={`p-4 sm:p-5 rounded-2xl border ${card.borderColor} ${card.bgColor} bg-white dark:bg-neutral-900 transition-all hover:border-neutral-300 dark:hover:border-neutral-700 shadow-xs`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                {card.title}
              </span>
              <Icon className={`w-4 h-4 ${card.accent}`} />
            </div>

            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white tabular-nums">
              {card.value}
            </div>

            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              {card.sublabel}
            </p>
          </div>
        );
      })}
    </div>
  );
};
