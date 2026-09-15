import React, { useState } from 'react';
import type { CompatibilityResult, PerformanceEstimate } from '../../../types';
import { Info } from 'lucide-react';

interface PerformanceEstimateCardProps {
  result: CompatibilityResult;
}

const RESOLUTION_ORDER = ['1080p', '1440p', '4K'];
const PRESET_ORDER = ['Low', 'Medium', 'High', 'Ultra'];

const CONFIDENCE_LABEL: Record<string, string> = {
  high: 'High confidence',
  medium: 'Medium confidence',
  low: 'Low confidence',
  unknown: 'Unknown',
};

function organizeEstimates(
  estimates: PerformanceEstimate[]
): Record<string, Record<string, PerformanceEstimate>> {
  const map: Record<string, Record<string, PerformanceEstimate>> = {};
  for (const est of estimates) {
    if (!map[est.resolution]) map[est.resolution] = {};
    map[est.resolution][est.preset] = est;
  }
  return map;
}

const fpsBarWidth = (fpsMax: number) => {
  const clamp = Math.min(fpsMax, 200);
  return `${(clamp / 200) * 100}%`;
};

const fpsColor = (fpsMin: number) => {
  if (fpsMin >= 60) return 'bg-emerald-500';
  if (fpsMin >= 30) return 'bg-amber-500';
  return 'bg-red-500';
};

export const PerformanceEstimateCard: React.FC<PerformanceEstimateCardProps> = ({ result }) => {
  const [activeRes, setActiveRes] = useState('1080p');

  if (result.item.type !== 'game' || result.performanceEstimates.length === 0) return null;

  const organized = organizeEstimates(result.performanceEstimates);
  const availableResolutions = RESOLUTION_ORDER.filter((r) => organized[r]);
  const currentEstimates = organized[activeRes] ?? {};
  const firstEst = Object.values(currentEstimates)[0];

  return (
    <div className="rounded-2xl bg-slate-900/60 border border-slate-700/60 p-5">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="text-base font-bold text-white">Estimated Performance</h3>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />
            Estimates based on GPU tier comparison. Not laboratory measurements.
          </p>
        </div>
        {/* Resolution tabs */}
        <div className="flex gap-1 shrink-0">
          {availableResolutions.map((res) => (
            <button
              key={res}
              onClick={() => setActiveRes(res)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                activeRes === res
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {res}
            </button>
          ))}
        </div>
      </div>

      {/* FPS bars */}
      <div className="space-y-3.5">
        {PRESET_ORDER.map((preset) => {
          const est = currentEstimates[preset];
          if (!est) return null;
          return (
            <div key={preset}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-300 w-14">{preset}</span>
                <span className="text-slate-400 font-mono">{est.fpsMin}–{est.fpsMax} FPS</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full ${fpsColor(est.fpsMin)} transition-all duration-700`}
                  style={{ width: fpsBarWidth(est.fpsMax) }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Confidence note */}
      {firstEst && (
        <p className="mt-4 text-[11px] text-slate-500">
          Estimate confidence:{' '}
          <span className="font-semibold text-slate-400">{CONFIDENCE_LABEL[firstEst.confidence]}</span>
          {' '}· Actual FPS depends on CPU, driver version, and in-game settings.
        </p>
      )}
    </div>
  );
};
