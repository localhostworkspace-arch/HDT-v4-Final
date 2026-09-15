import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertCircle, X, ShieldAlert } from 'lucide-react';

interface ToastOptions {
  title?: string;
  message: string;
  type?: 'info' | 'warning' | 'error';
  duration?: number;
}

interface ToastContextType {
  showToast: (options: ToastOptions | string) => void;
  showNotAvailable: (toolName: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<{
    id: number;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error';
  } | null>(null);

  const [modalTool, setModalTool] = useState<string | null>(null);

  const showToast = useCallback((options: ToastOptions | string) => {
    const title = typeof options === 'string' ? 'Notice' : options.title || 'Notice';
    const message = typeof options === 'string' ? options : options.message;
    const type = typeof options === 'string' ? 'warning' : options.type || 'warning';
    const duration = typeof options === 'string' ? 4000 : options.duration || 4000;

    const id = Date.now();
    setToast({ id, title, message, type });

    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, duration);
  }, []);

  const showNotAvailable = useCallback((toolName: string) => {
    setModalTool(toolName);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, showNotAvailable }}>
      {children}

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-900/95 dark:bg-[#0E1526]/95 border border-amber-500/40 text-white shadow-2xl backdrop-blur-xl max-w-sm">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <h4 className="text-sm font-bold text-amber-400">{toast.title}</h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Prominent "Not Available" Dialog / Modal */}
      {modalTool && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="fixed inset-0"
            onClick={() => setModalTool(null)}
          />
          <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-slate-900 dark:bg-[#0E1526] border border-amber-500/30 shadow-2xl text-center z-10 animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setModalTool(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Warning Icon Badge */}
            <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5 shadow-lg shadow-amber-500/10">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
              Not Available
            </div>

            <h3 className="text-2xl font-black text-white tracking-tight mb-2">
              {modalTool}
            </h3>

            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              This diagnostic tool is currently marked as <span className="text-amber-400 font-semibold">Not Available</span>. Our team is actively updating this module. Please explore our other available testing suites!
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setModalTool(null)}
                className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-sm transition-all shadow-lg shadow-amber-600/20 cursor-pointer"
              >
                Understood / Close
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
