import React, { useState, useEffect } from 'react';
import { Search, X, CheckSquare, Archive, BookOpen, ArrowRight } from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { Task } from '../types';

export const GlobalSearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    tasks,
    subjects,
    setActiveTaskForFocus,
    setActiveTab,
  } = useStudy();

  const [query, setQuery] = useState('');

  // Keyboard shortcut listener: `/` to open search, `Escape` to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const trimmed = query.trim().toLowerCase();

  const matchedTasks = trimmed
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(trimmed) ||
          (t.notes && t.notes.toLowerCase().includes(trimmed))
      )
    : [];

  const matchedSubjects = trimmed
    ? subjects.filter(
        (s) =>
          s.name.toLowerCase().includes(trimmed) ||
          (s.description && s.description.toLowerCase().includes(trimmed))
      )
    : [];

  const handleSelectTask = (task: Task) => {
    setIsSearchOpen(false);
    if (task.isBacklog) {
      setActiveTab('backlog');
    } else {
      setActiveTaskForFocus(task);
      setActiveTab('tasks');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4 animate-fadeIn">
      <div className="w-full max-w-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-neutral-200 dark:border-neutral-800 gap-3">
          <Search className="w-5 h-5 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Class 9 tasks, topics, formulas, or subjects..."
            className="flex-1 bg-transparent text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none"
            autoFocus
          />
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4 text-xs">
          {!trimmed ? (
            <div className="py-8 text-center text-neutral-400 space-y-1">
              <p>Type to instantly search all tasks, homework, and subjects.</p>
              <p className="text-[11px] text-neutral-500">
                Press <kbd className="px-1 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded font-mono">Esc</kbd> to exit.
              </p>
            </div>
          ) : matchedTasks.length === 0 && matchedSubjects.length === 0 ? (
            <div className="py-8 text-center text-neutral-400">
              No results found for “{query}”.
            </div>
          ) : (
            <>
              {/* Subjects */}
              {matchedSubjects.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    Subjects
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {matchedSubjects.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setActiveTab('subjects');
                        }}
                        className="flex items-center gap-2 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-indigo-500 text-left transition-colors"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: sub.color }}
                        />
                        <span className="font-semibold text-neutral-900 dark:text-white">
                          {sub.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks */}
              {matchedTasks.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    Tasks & Homework ({matchedTasks.length})
                  </p>
                  <div className="space-y-1">
                    {matchedTasks.map((t) => {
                      const sub = subjects.find((s) => s.id === t.subjectId);
                      return (
                        <button
                          key={t.id}
                          onClick={() => handleSelectTask(t)}
                          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left transition-colors group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {t.isBacklog ? (
                              <Archive className="w-4 h-4 text-amber-500 shrink-0" />
                            ) : (
                              <CheckSquare
                                className={`w-4 h-4 shrink-0 ${
                                  t.completed ? 'text-emerald-500' : 'text-neutral-400'
                                }`}
                              />
                            )}
                            <div className="min-w-0">
                              <p
                                className={`font-medium truncate ${
                                  t.completed
                                    ? 'line-through text-neutral-400'
                                    : 'text-neutral-900 dark:text-white'
                                }`}
                              >
                                {t.title}
                              </p>
                              <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                                <span>{sub?.name}</span>
                                <span>·</span>
                                <span>{t.isBacklog ? 'In Backlog' : 'Today’s Mission'}</span>
                                {t.estimatedMinutes > 0 && <span>· {t.estimatedMinutes}m</span>}
                              </div>
                            </div>
                          </div>

                          <ArrowRight className="w-3.5 h-3.5 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
