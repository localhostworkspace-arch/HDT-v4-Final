import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX, 
  Shield, 
  Info,
  Check
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { clearTestActivities } from '../../services/historyService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme } = useTheme();
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('hdt_sound_fx') !== 'false';
  });
  const [autoRecord, setAutoRecord] = useState(() => {
    return localStorage.getItem('hdt_auto_record') !== 'false';
  });
  const [clearedNotice, setClearedNotice] = useState(false);

  if (!isOpen) return null;

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('hdt_sound_fx', String(next));
  };

  const toggleAutoRecord = () => {
    const next = !autoRecord;
    setAutoRecord(next);
    localStorage.setItem('hdt_auto_record', String(next));
  };

  const handleClearAll = () => {
    clearTestActivities();
    setClearedNotice(true);
    setTimeout(() => setClearedNotice(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 id="settings-title" className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Preferences
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Customise your testing environment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Appearance Theme */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
              Appearance
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Sun className="w-4 h-4" /> Light Mode
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Moon className="w-4 h-4" /> Dark Mode
              </button>
            </div>
          </div>

          {/* Test Preferences */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Behavior
            </label>
            
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2.5">
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                )}
                <div>
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200 block">
                    Sound Feedback
                  </span>
                  <span className="text-xs text-slate-400">
                    Audio cues when completing or clicking test keys
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={toggleSound}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <div>
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200 block">
                    Auto-Save Recent Activity
                  </span>
                  <span className="text-xs text-slate-400">
                    Save completed tests locally in your browser
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoRecord}
                onChange={toggleAutoRecord}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Privacy info banner */}
          <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
              <strong>100% Browser Local:</strong> HDT runs entirely in your client sandbox. No keystrokes, audio, or test logs are ever sent to remote servers.
            </p>
          </div>

          {/* Data Reset */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
            >
              Reset stored test data
            </button>
            {clearedNotice && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                <Check className="w-3.5 h-3.5" /> Cleared
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
