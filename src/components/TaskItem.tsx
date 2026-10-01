import React, { useState } from 'react';
import {
  Check,
  Trash2,
  Edit2,
  Clock,
  ArrowDownToLine,
  ArrowUpFromLine,
  Play,
  Save,
  X,
} from 'lucide-react';
import { Priority, SubjectId, Task } from '../types';
import { useStudy } from '../context/StudyContext';

interface TaskItemProps {
  task: Task;
  isBacklogView?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, isBacklogView = false }) => {
  const {
    subjects,
    toggleTaskComplete,
    deleteTask,
    editTask,
    moveTaskToBacklog,
    moveBacklogToToday,
    setActiveTaskForFocus,
    setActiveTab,
  } = useStudy();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editSubjectId, setEditSubjectId] = useState<SubjectId>(task.subjectId);
  const [editPriority, setEditPriority] = useState<Priority>(task.priority);
  const [editMinutes, setEditMinutes] = useState<number>(task.estimatedMinutes || 25);
  const [editNotes, setEditNotes] = useState<string>(task.notes || '');

  const subject = subjects.find((s) => s.id === task.subjectId);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
    editTask(task.id, {
      title: editTitle.trim(),
      subjectId: editSubjectId,
      priority: editPriority,
      estimatedMinutes: Number(editMinutes) || 25,
      notes: editNotes.trim(),
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditSubjectId(task.subjectId);
    setEditPriority(task.priority);
    setEditMinutes(task.estimatedMinutes);
    setEditNotes(task.notes || '');
    setIsEditing(false);
  };

  const handleStartFocus = () => {
    setActiveTaskForFocus(task);
    setActiveTab('focus');
  };

  const priorityStyles: Record<Priority, { text: string; dot: string; label: string }> = {
    high: {
      text: 'text-rose-600 dark:text-rose-400 font-medium',
      dot: 'bg-rose-500',
      label: 'High',
    },
    medium: {
      text: 'text-amber-600 dark:text-amber-400',
      dot: 'bg-amber-500',
      label: 'Medium',
    },
    low: {
      text: 'text-neutral-500 dark:text-neutral-400',
      dot: 'bg-neutral-400',
      label: 'Low',
    },
  };

  if (isEditing) {
    return (
      <form
        onSubmit={handleSave}
        className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/20 dark:bg-indigo-950/20 space-y-3"
      >
        <div>
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
            Task Name
          </label>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-3 py-1.5 text-sm bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Subject
            </label>
            <select
              value={editSubjectId}
              onChange={(e) => setEditSubjectId(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Priority
            </label>
            <select
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value as Priority)}
              className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Est. Minutes
            </label>
            <input
              type="number"
              min="5"
              max="240"
              step="5"
              value={editMinutes}
              onChange={(e) => setEditMinutes(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
            Notes (Optional)
          </label>
          <input
            type="text"
            value={editNotes}
            placeholder="e.g. Exercise 3.2 Q1 to Q6 in homework register"
            onChange={(e) => setEditNotes(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={handleCancel}
            className="px-3 py-1 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg transition-colors flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            Cancel
          </button>
          <button
            type="submit"
            className="px-3.5 py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            Save Changes
          </button>
        </div>
      </form>
    );
  }

  const pConfig = priorityStyles[task.priority];

  return (
    <div
      className={`group flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
        task.completed
          ? 'bg-neutral-50/60 dark:bg-neutral-900/30 border-neutral-200/60 dark:border-neutral-800/40 opacity-75'
          : 'bg-white dark:bg-neutral-900 border-neutral-200/90 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-xs'
      }`}
    >
      {/* Checkbox */}
      <button
        type="button"
        role="checkbox"
        aria-checked={task.completed}
        onClick={() => toggleTaskComplete(task.id)}
        className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
          task.completed
            ? 'bg-emerald-600 border-emerald-600 text-white'
            : 'border-neutral-300 dark:border-neutral-600 hover:border-indigo-500 bg-white dark:bg-neutral-800'
        }`}
        aria-label={task.completed ? `Mark "${task.title}" incomplete` : `Mark "${task.title}" complete`}
      >
        {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
      </button>

      {/* Task Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p
            className={`text-sm font-medium transition-all break-words ${
              task.completed
                ? 'line-through text-neutral-400 dark:text-neutral-500'
                : 'text-neutral-900 dark:text-neutral-100'
            }`}
          >
            {task.title}
          </p>
        </div>

        {/* Clean unboxed metadata with · separator (Zero-pill discipline) */}
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          {/* Subject indicator */}
          <span className="flex items-center gap-1.5 font-medium text-neutral-700 dark:text-neutral-300">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: subject?.color || '#6B7280' }}
              aria-hidden="true"
            />
            {subject?.name || 'General'}
          </span>

          <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-600">
            ·
          </span>

          {/* Priority indicator */}
          <span className={`flex items-center gap-1 ${pConfig.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${pConfig.dot}`} />
            {pConfig.label}
          </span>

          {/* Estimated minutes */}
          {task.estimatedMinutes > 0 && (
            <>
              <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-600">
                ·
              </span>
              <span className="flex items-center gap-1 tabular-nums">
                <Clock className="w-3 h-3 text-neutral-400" />
                {task.estimatedMinutes} min
              </span>
            </>
          )}

          {/* Notes if available */}
          {task.notes && (
            <>
              <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-600">
                ·
              </span>
              <span className="truncate max-w-[200px] text-neutral-400 dark:text-neutral-500 italic">
                {task.notes}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
        {/* Focus on this task button */}
        {!task.completed && (
          <button
            onClick={handleStartFocus}
            title="Focus on this task in Focus Room"
            className="p-1.5 text-neutral-500 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
            aria-label="Start Pomodoro focus on this task"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
          </button>
        )}

        {/* Move to Backlog or Move to Today */}
        {isBacklogView ? (
          <button
            onClick={() => moveBacklogToToday(task.id)}
            title="Move to Today's Mission"
            className="p-1.5 text-neutral-500 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
            aria-label="Plan for today"
          >
            <ArrowUpFromLine className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={() => moveTaskToBacklog(task.id)}
            title="Move to Backlog Vault"
            className="p-1.5 text-neutral-500 dark:text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
            aria-label="Move to backlog"
          >
            <ArrowDownToLine className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Edit */}
        <button
          onClick={() => setIsEditing(true)}
          title="Edit task"
          className="p-1.5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
          aria-label="Edit task"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>

        {/* Delete */}
        <button
          onClick={() => deleteTask(task.id)}
          title="Delete task"
          className="p-1.5 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
          aria-label="Delete task"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
