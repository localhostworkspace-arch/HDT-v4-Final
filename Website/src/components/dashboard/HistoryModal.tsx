import React, { useEffect, useState } from 'react';
import { 
  X, 
  Clock, 
  Trash2, 
  ArrowUpRight, 
  CheckCircle2, 
  Keyboard, 
  Mouse, 
  Monitor, 
  Gauge, 
  Volume2, 
  Gamepad2, 
  Star 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getTestActivities, clearTestActivities, formatTimeAgo, type TestActivity } from '../../services/historyService';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose }) => {
  const [activities, setActivities] = useState<TestActivity[]>([]);

  const loadActivities = () => {
    setActivities(getTestActivities());
  };

  useEffect(() => {
    if (isOpen) {
      loadActivities();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleUpdate = () => loadActivities();
    window.addEventListener('hdt_history_updated', handleUpdate);
    return () => window.removeEventListener('hdt_history_updated', handleUpdate);
  }, []);

  if (!isOpen) return null;

  const getToolIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'keyboard':
      case 'keyboard test':
        return <Keyboard className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'mouse':
      case 'mouse test':
        return <Mouse className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'monitor':
      case 'on-screen test':
        return <Monitor className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'gauge':
      case 'speed test':
        return <Gauge className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'star':
      case 'rate my pc':
        return <Star className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      case 'volume2':
      case 'online sound test':
        return <Volume2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />;
      case 'gamepad2':
      case 'game test':
        return <Gamepad2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 id="history-title" className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Testing History
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tests completed in your current browser
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

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
          {activities.length === 0 ? (
            <div className="py-12 text-center">
              <Clock className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                No tests recorded yet
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                Start any test from the dashboard and your completed diagnostic runs will appear here.
              </p>
            </div>
          ) : (
            activities.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-100 dark:hover:border-blue-900/50 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 border border-slate-200/60 dark:border-slate-600 flex items-center justify-center shadow-2xs">
                    {getToolIcon(item.iconName || item.toolName)}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {item.toolName}
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {formatTimeAgo(item.timestamp)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50">
                    {item.status}
                  </span>
                  <Link
                    to={item.path}
                    onClick={onClose}
                    className="p-1.5 text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-medium"
                    title="Open test"
                  >
                    Run <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {activities.length > 0 && (
          <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                clearTestActivities();
                setActivities([]);
              }}
              className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:underline cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear history
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
