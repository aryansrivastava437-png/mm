import React, { useState } from 'react';
import { BookOpen, Plus, Calculator, Atom, Globe, Languages, Cpu, Check, Edit2, Trash2 } from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { Subject, SubjectId } from '../types';
import { formatMinutes } from '../utils/dateUtils';

const ICON_MAP: Record<string, React.ElementType> = {
  Calculator,
  Atom,
  BookOpen,
  Globe,
  Languages,
  Cpu,
};

export const SubjectRadar: React.FC = () => {
  const { subjects, getSubjectStats, addSubject, editSubject, deleteSubject } = useStudy();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubColor, setNewSubColor] = useState('#4F46E5');
  const [newSubDesc, setNewSubDesc] = useState('');

  const [editingSub, setEditingSub] = useState<Subject | null>(null);

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim()) return;

    addSubject({
      name: newSubName.trim(),
      color: newSubColor,
      iconName: 'BookOpen',
      description: newSubDesc.trim() || undefined,
    });

    setNewSubName('');
    setNewSubDesc('');
    setIsAddModalOpen(false);
  };

  const handleEditSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSub || !editingSub.name.trim()) return;

    editSubject(editingSub.id, {
      name: editingSub.name.trim(),
      color: editingSub.color,
      description: editingSub.description?.trim(),
    });

    setEditingSub(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Subject Radar
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Keep every Class 9 subject moving. Balance revision across the syllabus.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Grid of Subject Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {subjects.map((subject) => {
          const stats = getSubjectStats(subject.id);
          const Icon = ICON_MAP[subject.iconName] || BookOpen;

          return (
            <div
              key={subject.id}
              className="p-4 sm:p-4.5 bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl shadow-xs transition-all hover:border-neutral-300 dark:hover:border-neutral-700 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${subject.color}15`,
                        color: subject.color,
                      }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                        {subject.name}
                      </h4>
                      {subject.description && (
                        <p className="text-[11px] text-neutral-400 dark:text-neutral-500 truncate max-w-[170px]">
                          {subject.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingSub(subject)}
                      className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded"
                      title="Edit subject"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    {subjects.length > 1 && (
                      <button
                        onClick={() => {
                          if (confirm(`Remove subject "${subject.name}"?`)) {
                            deleteSubject(subject.id);
                          }
                        }}
                        className="p-1 text-neutral-400 hover:text-rose-600 rounded"
                        title="Delete subject"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex items-center justify-between text-xs mb-1.5 text-neutral-500 dark:text-neutral-400">
                  <span className="tabular-nums">
                    {stats.completedTasks} / {stats.totalTasks} tasks
                  </span>
                  <span className="font-mono font-semibold text-neutral-900 dark:text-white tabular-nums">
                    {stats.percentage}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${stats.percentage}%`,
                      backgroundColor: subject.color,
                    }}
                  />
                </div>
              </div>

              {/* Focus Time */}
              <div className="pt-3 mt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400 dark:text-neutral-500">
                <span>Focus logged</span>
                <span className="font-medium text-neutral-700 dark:text-neutral-300 tabular-nums">
                  {formatMinutes(stats.focusMinutes)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Subject Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <form
            onSubmit={handleAddSubject}
            className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4"
          >
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Add New Subject
            </h3>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Subject Name
              </label>
              <input
                type="text"
                placeholder="e.g. Sanskrit, Economics, Physical Education"
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Accent Color
              </label>
              <div className="flex items-center gap-2">
                {['#4F46E5', '#0D9488', '#E11D48', '#D97706', '#8B5CF6', '#2563EB', '#059669', '#DB2777'].map(
                  (col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setNewSubColor(col)}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        newSubColor === col ? 'ring-2 ring-offset-2 ring-neutral-800 scale-110' : ''
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  )
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Description / Syllabus Topics (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Chapter 1 to 5 revision"
                value={newSubDesc}
                onChange={(e) => setNewSubDesc(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newSubName.trim()}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-50"
              >
                Add Subject
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Subject Modal */}
      {editingSub && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <form
            onSubmit={handleEditSubject}
            className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4"
          >
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Edit Subject
            </h3>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Subject Name
              </label>
              <input
                type="text"
                value={editingSub.name}
                onChange={(e) => setEditingSub({ ...editingSub, name: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Accent Color
              </label>
              <div className="flex items-center gap-2">
                {['#4F46E5', '#0D9488', '#E11D48', '#D97706', '#8B5CF6', '#2563EB', '#059669', '#DB2777'].map(
                  (col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setEditingSub({ ...editingSub, color: col })}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        editingSub.color === col ? 'ring-2 ring-offset-2 ring-neutral-800 scale-110' : ''
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  )
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Description
              </label>
              <input
                type="text"
                value={editingSub.description || ''}
                onChange={(e) => setEditingSub({ ...editingSub, description: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingSub(null)}
                className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
