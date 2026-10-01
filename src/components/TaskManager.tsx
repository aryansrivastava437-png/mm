import React, { useState, useMemo } from 'react';
import { Plus, ListFilter, ArrowUpDown, Sparkles, CheckCircle2 } from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { Priority, SubjectId, Task } from '../types';
import { TaskItem } from './TaskItem';

type SortOption = 'order' | 'priority' | 'subject' | 'completed';
type FilterOption = 'all' | 'active' | 'completed';

export const TaskManager: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const {
    todayTasks,
    subjects,
    addTask,
    todayStats,
  } = useStudy();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<SubjectId>(
    subjects[0]?.id || 'math'
  );
  const [selectedPriority, setSelectedPriority] = useState<Priority>('medium');
  const [selectedMinutes, setSelectedMinutes] = useState<number>(25);
  const [sortBy, setSortBy] = useState<SortOption>('order');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [isFormExpanded, setIsFormExpanded] = useState(false);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    addTask({
      title: newTaskTitle.trim(),
      subjectId: selectedSubjectId,
      priority: selectedPriority,
      estimatedMinutes: selectedMinutes,
      isBacklog: false,
    });

    setNewTaskTitle('');
    setIsFormExpanded(false);
  };

  // Motivational quote based on prompt specification
  const motivationalMessage = useMemo(() => {
    const { totalTasks, tasksCompleted, completionPercentage } = todayStats;
    if (totalTasks === 0) return 'Your mission is empty. Add one meaningful task to begin.';
    if (tasksCompleted === 0) return 'Start with one small task. Momentum builds with action.';
    if (tasksCompleted === totalTasks) return 'Mission complete. Great work today! 🌟';
    if (completionPercentage >= 50) return "You're halfway there. Keep pushing through.";
    return 'Good start. Keep going one step at a time.';
  }, [todayStats]);

  // Filter and Sort
  const processedTasks = useMemo(() => {
    let list = [...todayTasks];

    // Filter
    if (filterBy === 'active') {
      list = list.filter((t) => !t.completed);
    } else if (filterBy === 'completed') {
      list = list.filter((t) => t.completed);
    }

    // Sort
    const priorityWeight: Record<Priority, number> = { high: 3, medium: 2, low: 1 };
    list.sort((a, b) => {
      if (sortBy === 'priority') {
        const diff = priorityWeight[b.priority] - priorityWeight[a.priority];
        if (diff !== 0) return diff;
        return a.completed === b.completed ? 0 : a.completed ? 1 : -1;
      }
      if (sortBy === 'subject') {
        const subA = subjects.find((s) => s.id === a.subjectId)?.name || '';
        const subB = subjects.find((s) => s.id === b.subjectId)?.name || '';
        return subA.localeCompare(subB);
      }
      if (sortBy === 'completed') {
        return a.completed === b.completed ? 0 : a.completed ? 1 : -1;
      }
      return a.order - b.order;
    });

    return list;
  }, [todayTasks, filterBy, sortBy, subjects]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Today’s Mission
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 tabular-nums">
              {todayStats.tasksCompleted}/{todayStats.totalTasks}
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Only put things here that you actually want to finish today.
          </p>
        </div>

        {/* Filter and Sort controls */}
        {!compact && (
          <div className="flex items-center gap-2">
            {/* Status Filter Tabs */}
            <div className="flex items-center p-0.5 bg-neutral-100 dark:bg-neutral-800/80 rounded-lg border border-neutral-200/60 dark:border-neutral-700/60">
              {(['all', 'active', 'completed'] as FilterOption[]).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setFilterBy(opt)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md capitalize transition-colors ${
                    filterBy === opt
                      ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-2xs font-semibold'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="relative flex items-center">
              <label htmlFor="task-sort-select" className="sr-only">
                Sort tasks by
              </label>
              <ArrowUpDown className="w-3.5 h-3.5 absolute left-2.5 text-neutral-400 pointer-events-none" />
              <select
                id="task-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Sort tasks by"
                className="pl-7 pr-3 py-1 text-xs font-medium bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="order">Custom Order</option>
                <option value="priority">Priority</option>
                <option value="subject">Subject</option>
                <option value="completed">Status</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Progress & Motivational banner */}
      <div className="p-3 bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800/80 rounded-xl space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 font-medium text-neutral-700 dark:text-neutral-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            {motivationalMessage}
          </span>
          <span className="font-mono tabular-nums text-neutral-600 dark:text-neutral-400 font-semibold">
            {todayStats.completionPercentage}%
          </span>
        </div>
        <div className="h-1.5 w-full bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-300 rounded-full"
            style={{ width: `${todayStats.completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Task Creation Form */}
      <form
        onSubmit={handleAddTask}
        className="p-3.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs space-y-3"
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onFocus={() => setIsFormExpanded(true)}
            placeholder="Add a task for today (e.g., Complete Maths exercise 3.2)..."
            className="flex-1 px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/80 rounded-xl text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            type="submit"
            disabled={!newTaskTitle.trim()}
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Task</span>
          </button>
        </div>

        {/* Expanded options for subject, priority, duration */}
        {isFormExpanded && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 animate-fadeIn">
            {/* Subject Selector */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                Subject
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Selector */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                Priority
              </label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value as Priority)}
                className="w-full px-2.5 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>

            {/* Estimated Duration */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                Est. Duration
              </label>
              <select
                value={selectedMinutes}
                onChange={(e) => setSelectedMinutes(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value={15}>15 minutes</option>
                <option value={25}>25 minutes (1 Pomodoro)</option>
                <option value={35}>35 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>
          </div>
        )}
      </form>

      {/* Task List */}
      <div className="space-y-2">
        {processedTasks.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/20">
            <CheckCircle2 className="w-8 h-8 text-neutral-300 dark:text-neutral-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              {filterBy === 'completed'
                ? 'No completed tasks yet.'
                : filterBy === 'active'
                ? 'All tasks completed for today!'
                : 'Your mission is empty.'}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              {filterBy === 'all'
                ? 'Add one meaningful task above to begin your study session.'
                : 'Keep up the focused effort!'}
            </p>
          </div>
        ) : (
          processedTasks.map((task) => <TaskItem key={task.id} task={task} />)
        )}
      </div>
    </div>
  );
};
