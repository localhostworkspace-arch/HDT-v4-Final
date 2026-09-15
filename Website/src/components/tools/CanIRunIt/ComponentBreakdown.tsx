import React from 'react';
import type { CompatibilityResult, ComponentScore } from '../../../types';

interface ComponentBreakdownProps {
  result: CompatibilityResult;
}

const BAR_COLORS = {
  pass: { bar: 'bg-emerald-500', label: 'text-emerald-400' },
  warn: { bar: 'bg-amber-500', label: 'text-amber-400' },
  fail: { bar: 'bg-red-500', label: 'text-red-400' },
  unknown: { bar: 'bg-slate-600', label: 'text-slate-500' },
};

const TIER_LABEL = (score: number, status: ComponentScore['status']) => {
  if (status === 'unknown') return 'Unknown';
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Fair';
  if (score >= 30) return 'Marginal';
  return 'Insufficient';
};

interface BarRow {
  label: string;
  score: ComponentScore;
  weight?: string; // display weight hint
}

const getRows = (result: CompatibilityResult): BarRow[] => [
  { label: 'GPU', score: result.gpu },
  { label: 'CPU', score: result.cpu },
  { label: 'VRAM', score: result.vram },
  { label: 'RAM', score: result.ram },
  { label: 'Storage', score: result.storage },
  { label: 'OS', score: result.os },
];

export const ComponentBreakdown: React.FC<ComponentBreakdownProps> = ({ result }) => {
  const rows = getRows(result);

  return (
    <div>
      <h3 className="text-base font-bold text-white mb-4">Component Scores</h3>
      <div className="space-y-4">
        {rows.map(({ label, score }) => {
          const colors = BAR_COLORS[score.status];
          const tierLabel = TIER_LABEL(score.score, score.status);

          return (
            <div key={label} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-300">{label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 font-mono truncate max-w-[140px] sm:max-w-xs" title={score.userValue}>
                    {score.userValue}
                  </span>
                  <span className={`text-xs font-bold ${colors.label} min-w-[70px] text-right`}>
                    {score.status !== 'unknown' ? `${score.score}% · ${tierLabel}` : 'Unknown'}
                  </span>
                </div>
              </div>
              {/* Progress bar */}
              <div
                className="h-2 rounded-full bg-slate-800 overflow-hidden"
                role="progressbar"
                aria-valuenow={score.score}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${label} score: ${score.score}%`}
              >
                <div
                  className={`h-full rounded-full ${colors.bar} transition-all duration-700 ease-out`}
                  style={{ width: `${score.score}%` }}
                />
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                <span>Min: {score.requiredMinValue}</span>
                <span>·</span>
                <span>Rec: {score.requiredRecValue}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
