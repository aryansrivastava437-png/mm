import React, { useState, useMemo } from 'react';
import { Plus, Archive, ArrowUpFromLine, Sparkles, FolderSearch } from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { Priority, SubjectId } from '../types';
import { TaskItem } from './TaskItem';

export const BacklogVault: React.FC = () => {
  const { backlogTasks, subjects, addTask } = useStudy();

  const [newTitle, setNewTitle] = useState('');
  const [newSubjectId, setNewSubjectId] = useState<SubjectId>(subjects[0]?.id || 'math');
  const [newPriority, setNewPriority] = useState<Priority>('medium');
  const [newMinutes, setNewMinutes] = useState<number>(30);
  const [filterSubjectId, setFilterSubjectId] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const handleAddBacklog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addTask({
      title: newTitle.trim(),
      subjectId: newSubjectId,
      priority: newPriority,
      estimatedMinutes: newMinutes,
      isBacklog: true,
    });

    setNewTitle('');
  };

  const filteredBacklog = useMemo(() => {
    return backlogTasks.filter((t) => {
      if (filterSubjectId !== 'all' && t.subjectId !== filterSubjectId) return false;
      if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
      return true;
    });
  }, [backlogTasks, filterPriority, filterSubjectId]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Backlog Vault
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 tabular-nums">
              {backlogTasks.length} waiting
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Not today? Store it here without forgetting it.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2">
          {/* Subject Filter */}
          <select
            value={filterSubjectId}
            onChange={(e) => setFilterSubjectId(e.target.value)}
            className="px-2.5 py-1 text-xs font-medium bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Subjects</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-2.5 py-1 text-xs font-medium bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Quick Add Form */}
      <form
        onSubmit={handleAddBacklog}
        className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl shadow-xs space-y-3"
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add to backlog (e.g. Watch missed Science lecture, revise Chemistry ch 2)..."
            className="flex-1 px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/80 rounded-xl text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            type="submit"
            disabled={!newTitle.trim()}
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <Plus className="w-4 h-4" />
            <span>Store in Vault</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div>
            <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
              Subject
            </label>
            <select
              value={newSubjectId}
              onChange={(e) => setNewSubjectId(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
              Priority
            </label>
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as Priority)}
              className="w-full px-2.5 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
              Est. Duration
            </label>
            <input
              type="number"
              min="5"
              max="240"
              step="5"
              value={newMinutes}
              onChange={(e) => setNewMinutes(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </form>

      {/* Backlog List */}
      <div className="space-y-2">
        {filteredBacklog.length === 0 ? (
          <div className="p-10 text-center rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/20">
            <Archive className="w-8 h-8 text-neutral-300 dark:text-neutral-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Nothing waiting. Nice.
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
              Your backlog is clear. Any non-urgent homework, extra exam questions, or reading can be saved here for later.
            </p>
          </div>
        ) : (
          filteredBacklog.map((task) => (
            <TaskItem key={task.id} task={task} isBacklogView={true} />
          ))
        )}
      </div>
    </div>
  );
};
