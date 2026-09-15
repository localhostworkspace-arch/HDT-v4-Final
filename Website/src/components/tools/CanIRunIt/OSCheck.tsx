import React from 'react';
import { Monitor, CheckCircle2, XCircle } from 'lucide-react';
import type { CompatibilityResult } from '../../../types';

interface OSCheckProps {
  result: CompatibilityResult;
}

export const OSCheck: React.FC<OSCheckProps> = ({ result }) => {
  const { os } = result;
  const reqOS = result.item.minimumRequirements.operatingSystem;

  return (
    <div className="rounded-2xl bg-slate-900/60 border border-slate-700/60 p-5">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
          <Monitor className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-white text-sm mb-3">Operating System</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500 text-xs uppercase tracking-wider block mb-1">Required</span>
              <span className="text-slate-300">{reqOS}</span>
            </div>
            <div>
              <span className="text-slate-500 text-xs uppercase tracking-wider block mb-1">Your System</span>
              <span className="text-white font-semibold">{result.profile.operatingSystem}</span>
            </div>
          </div>

          <div className={`flex items-center gap-2 mt-3 text-sm font-semibold ${
            os.status === 'pass' ? 'text-emerald-400' :
            os.status === 'fail' ? 'text-red-400' : 'text-slate-400'
          }`}>
            {os.status === 'pass' && <><CheckCircle2 className="w-4 h-4" /> Compatible</>}
            {os.status === 'fail' && <><XCircle className="w-4 h-4" /> May not be compatible</>}
            {os.status === 'unknown' && 'OS compatibility could not be confirmed'}
          </div>
        </div>
      </div>
    </div>
  );
};
