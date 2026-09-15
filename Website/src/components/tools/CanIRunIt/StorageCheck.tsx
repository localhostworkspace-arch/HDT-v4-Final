import React from 'react';
import { HardDrive, CheckCircle2, XCircle } from 'lucide-react';
import type { CompatibilityResult } from '../../../types';

interface StorageCheckProps {
  result: CompatibilityResult;
}

export const StorageCheck: React.FC<StorageCheckProps> = ({ result }) => {
  const { storage } = result;
  const reqGB = result.item.minimumRequirements.storageGB;
  const available = result.profile.storageAvailableGB;

  return (
    <div className="rounded-2xl bg-slate-900/60 border border-slate-700/60 p-5">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
          <HardDrive className="w-5 h-5 text-amber-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-white text-sm mb-3">Storage Check</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500 text-xs uppercase tracking-wider block mb-1">Required</span>
              <span className="text-white font-semibold">{reqGB} GB</span>
            </div>
            <div>
              <span className="text-slate-500 text-xs uppercase tracking-wider block mb-1">Available</span>
              <span className={`font-semibold ${storage.status === 'fail' ? 'text-red-400' : 'text-white'}`}>
                {available != null ? `~${available} GB` : 'Unknown'}
              </span>
            </div>
          </div>

          <div className={`flex items-center gap-2 mt-3 text-sm font-semibold ${
            storage.status === 'pass' ? 'text-emerald-400' :
            storage.status === 'fail' ? 'text-red-400' : 'text-slate-400'
          }`}>
            {storage.status === 'pass' && <CheckCircle2 className="w-4 h-4" />}
            {storage.status === 'fail' && <XCircle className="w-4 h-4" />}
            {storage.status === 'pass' && 'Enough free space'}
            {storage.status === 'fail' && available != null &&
              `Free up ~${reqGB - available} GB before installation`}
            {storage.status === 'unknown' && 'Storage availability could not be determined'}
          </div>
        </div>
      </div>
    </div>
  );
};
