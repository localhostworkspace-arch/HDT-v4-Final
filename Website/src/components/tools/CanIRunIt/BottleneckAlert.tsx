import React from 'react';
import { AlertTriangle, TrendingDown } from 'lucide-react';
import type { CompatibilityResult } from '../../../types';

interface BottleneckAlertProps {
  result: CompatibilityResult;
}

export const BottleneckAlert: React.FC<BottleneckAlertProps> = ({ result }) => {
  if (!result.bottleneck || !result.bottleneckReason) return null;

  const isCritical = result.status === 'cannot_run';

  return (
    <div
      className={`rounded-2xl p-5 border ${
        isCritical
          ? 'bg-red-500/8 border-red-500/30'
          : 'bg-amber-500/8 border-amber-500/25'
      }`}
      role="alert"
      aria-label="Performance bottleneck warning"
    >
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
          isCritical ? 'bg-red-500/15' : 'bg-amber-500/15'
        }`}>
          {isCritical
            ? <TrendingDown className="w-5 h-5 text-red-400" />
            : <AlertTriangle className="w-5 h-5 text-amber-400" />
          }
        </div>
        <div>
          <h3 className={`font-bold text-sm mb-1 ${isCritical ? 'text-red-300' : 'text-amber-300'}`}>
            {isCritical ? 'Critical Bottleneck' : 'Performance Limiter'}:{' '}
            <span className="text-white">{result.bottleneck}</span>
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">{result.bottleneckReason}</p>
        </div>
      </div>
    </div>
  );
};
