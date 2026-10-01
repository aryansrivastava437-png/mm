import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Laptop,
  Volume2,
  VolumeX,
  Download,
  Upload,
  RotateCcw,
  ShieldAlert,
  Check,
  User,
  Sparkles,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { playChime } from '../utils/audio';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    updatePomodoroSettings,
    exportData,
    importData,
    resetAllData,
  } = useStudy();

  const [studentName, setStudentName] = useState(settings.studentName || 'Student');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleNameBlur = () => {
    if (studentName.trim()) {
      updateSettings({ studentName: studentName.trim() });
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importData(content);
      if (success) {
        setImportStatus('Backup restored successfully!');
      } else {
        setImportStatus('Failed to restore backup: Invalid data format.');
      }
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Settings & Preferences
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          Customize your study environment, timer intervals, and local data.
        </p>
      </div>

      {/* Student Profile Card */}
      <div className="p-5 sm:p-6 bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-500" />
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
            Student Profile
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              onBlur={handleNameBlur}
              className="w-full px-3 py-1.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Academic Standard
            </label>
            <input
              type="text"
              value={settings.grade || 'Class 9'}
              disabled
              className="w-full px-3 py-1.5 text-sm bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-500 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="p-5 sm:p-6 bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
          Appearance
        </h3>

        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'light', label: 'Light', icon: Sun },
            { id: 'dark', label: 'Dark', icon: Moon },
            { id: 'system', label: 'System', icon: Laptop },
          ].map((theme) => {
            const Icon = theme.icon;
            const isSelected = settings.theme === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => updateSettings({ theme: theme.id as typeof settings.theme })}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{theme.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pomodoro Timer Preferences */}
      <div className="p-5 sm:p-6 bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
          Pomodoro Durations
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Focus Duration
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="5"
                max="90"
                value={settings.pomodoro.focusMinutes}
                onChange={(e) =>
                  updatePomodoroSettings({ focusMinutes: Math.max(5, Number(e.target.value)) })
                }
                className="w-full px-3 py-1.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-xs text-neutral-500">mins</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Short Break
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="30"
                value={settings.pomodoro.shortBreakMinutes}
                onChange={(e) =>
                  updatePomodoroSettings({ shortBreakMinutes: Math.max(1, Number(e.target.value)) })
                }
                className="w-full px-3 py-1.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-xs text-neutral-500">mins</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Long Break
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="5"
                max="60"
                value={settings.pomodoro.longBreakMinutes}
                onChange={(e) =>
                  updatePomodoroSettings({ longBreakMinutes: Math.max(5, Number(e.target.value)) })
                }
                className="w-full px-3 py-1.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-xs text-neutral-500">mins</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
            Cycles Before Long Break
          </label>
          <select
            value={settings.pomodoro.sessionsBeforeLongBreak}
            onChange={(e) =>
              updatePomodoroSettings({ sessionsBeforeLongBreak: Number(e.target.value) })
            }
            className="w-full sm:w-48 px-3 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value={2}>2 cycles</option>
            <option value={3}>3 cycles</option>
            <option value={4}>4 cycles (Recommended)</option>
            <option value={5}>5 cycles</option>
          </select>
        </div>

        {/* Audio Chime test */}
        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {settings.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <VolumeX className="w-4 h-4 text-neutral-400" />
            )}
            <div>
              <span className="text-xs font-semibold text-neutral-900 dark:text-white block">
                Session Chime Sounds
              </span>
              <span className="text-[11px] text-neutral-400">
                Warm acoustic chime plays when a focus or break session finishes
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => playChime('focus_complete')}
              className="px-2.5 py-1 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 rounded-lg transition-colors"
            >
              Test Chime
            </button>
            <button
              onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                settings.soundEnabled
                  ? 'bg-emerald-600 text-white'
                  : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              {settings.soundEnabled ? 'Enabled' : 'Muted'}
            </button>
          </div>
        </div>
      </div>

      {/* Data Backup & Migration */}
      <div className="p-5 sm:p-6 bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
          Data Storage & Backup
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
          Your tasks, subjects, sessions, streak records, and daily reflections are securely persisted in your browser’s LocalStorage. You can export a JSON backup file at any time.
        </p>

        {importStatus && (
          <div className="p-3 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-800 font-medium text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500" />
            {importStatus}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={exportData}
            className="px-3.5 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-200 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-xl transition-colors flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Backup JSON</span>
          </button>

          <label className="px-3.5 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-200 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-xl transition-colors flex items-center gap-2 cursor-pointer focus-within:ring-2 focus-within:ring-indigo-500">
            <Upload className="w-3.5 h-3.5" />
            <span>Import Backup JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>
        </div>

        {/* Reset Data Section */}
        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 block">
              Reset Application Data
            </span>
            <span className="text-[11px] text-neutral-400">
              Clear all tasks, study history, and return to default state.
            </span>
          </div>

          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-600 border border-rose-200 dark:border-rose-900 rounded-xl transition-colors"
          >
            Reset All Data
          </button>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/40 flex items-center justify-center text-rose-600 mx-auto">
              <ShieldAlert className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Delete all StudyOS data?
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                This will permanently delete your tasks, focus logs, and daily reflections. This action cannot be undone unless you have exported a backup.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="flex-1 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  resetAllData();
                  setIsResetConfirmOpen(false);
                }}
                className="flex-1 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
              >
                Yes, Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
