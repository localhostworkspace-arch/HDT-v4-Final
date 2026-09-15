import React, { useEffect, useState } from 'react';
import type { CompatibilityResult } from '../../../types';

interface CompatibilityHeroProps {
  result: CompatibilityResult;
}

const STATUS_CONFIG = {
  can_run: {
    emoji: '🟢',
    label: 'Your PC Can Run This',
    shortLabel: 'CAN RUN',
    subtitleBase: 'Your PC meets the recommended requirements.',
    gradientFrom: 'from-emerald-500/20',
    gradientTo: 'to-emerald-900/10',
    borderColor: 'border-emerald-500/40',
    textColor: 'text-emerald-400',
    scoreColor: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/15 border-emerald-500/30',
  },
  may_run: {
    emoji: '🟡',
    label: 'Your PC May Run This',
    shortLabel: 'MAY RUN',
    subtitleBase: 'Your PC meets minimum requirements, but some hardware is below recommended.',
    gradientFrom: 'from-amber-500/20',
    gradientTo: 'to-amber-900/10',
    borderColor: 'border-amber-500/40',
    textColor: 'text-amber-400',
    scoreColor: 'text-amber-400',
    badgeBg: 'bg-amber-500/15 border-amber-500/30',
  },
  cannot_run: {
    emoji: '🔴',
    label: 'Your PC Cannot Reliably Run This',
    shortLabel: 'CANNOT RUN',
    subtitleBase: 'Your hardware does not meet the minimum requirements for this application.',
    gradientFrom: 'from-red-500/20',
    gradientTo: 'to-red-900/10',
    borderColor: 'border-red-500/40',
    textColor: 'text-red-400',
    scoreColor: 'text-red-400',
    badgeBg: 'bg-red-500/15 border-red-500/30',
  },
  insufficient_data: {
    emoji: '⚪',
    label: 'Compatibility Unknown',
    shortLabel: 'UNKNOWN',
    subtitleBase: "We couldn't detect enough of your hardware to make a reliable determination.",
    gradientFrom: 'from-slate-500/20',
    gradientTo: 'to-slate-900/10',
    borderColor: 'border-slate-500/40',
    textColor: 'text-slate-400',
    scoreColor: 'text-slate-400',
    badgeBg: 'bg-slate-500/15 border-slate-500/30',
  },
};

export const CompatibilityHero: React.FC<CompatibilityHeroProps> = ({ result }) => {
  const cfg = STATUS_CONFIG[result.status];
  const [displayScore, setDisplayScore] = useState(0);

  // Animate score count-up
  useEffect(() => {
    setDisplayScore(0);
    const target = result.overallScore;
    const step = Math.ceil(target / 40);
    const timer = setInterval(() => {
      setDisplayScore((prev) => {
        if (prev + step >= target) { clearInterval(timer); return target; }
        return prev + step;
      });
    }, 16);
    return () => clearInterval(timer);
  }, [result.overallScore]);

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border ${cfg.borderColor} bg-gradient-to-br ${cfg.gradientFrom} ${cfg.gradientTo} p-6 sm:p-8`}
      role="region"
      aria-label="Compatibility result"
    >
      {/* Background glow */}
      <div className={`absolute -top-16 -right-16 w-64 h-64 rounded-full blur-3xl opacity-20 ${
        result.status === 'can_run' ? 'bg-emerald-500' :
        result.status === 'may_run' ? 'bg-amber-500' :
        result.status === 'cannot_run' ? 'bg-red-500' : 'bg-slate-500'
      }`} />

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
        {/* Score Arc */}
        <div className="shrink-0 relative flex items-center justify-center">
          <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden="true">
            {/* Background track */}
            <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
            {/* Progress arc */}
            <circle
              cx="60" cy="60" r="50"
              fill="none"
              stroke={
                result.status === 'can_run' ? '#10b981' :
                result.status === 'may_run' ? '#f59e0b' :
                result.status === 'cannot_run' ? '#ef4444' : '#64748b'
              }
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 50}`}
              strokeDashoffset={`${2 * Math.PI * 50 * (1 - displayScore / 100)}`}
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dashoffset 0.05s linear' }}
            />
            {/* Score text */}
            <text x="60" y="55" textAnchor="middle" className="fill-white" fontSize="26" fontWeight="800" fontFamily="inherit">
              {displayScore}
            </text>
            <text x="60" y="72" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="11" fontFamily="inherit">
              / 100
            </text>
          </svg>
        </div>

        {/* Result Info */}
        <div className="flex-1 min-w-0">
          {/* Status Badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${cfg.badgeBg} ${cfg.textColor} mb-3`}>
            <span aria-hidden="true">{cfg.emoji}</span>
            <span>{cfg.shortLabel}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-1">
            {result.item.name}
          </h2>

          <p className={`text-base font-semibold ${cfg.textColor} mb-2`}>
            {cfg.label}
          </p>

          <p className="text-sm text-slate-400 leading-relaxed max-w-lg">
            {cfg.subtitleBase}
          </p>

          {/* Quick stat chips */}
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/40 text-slate-300">
              {result.item.type === 'game' ? '🎮 Game' : '💻 Software'}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/40 text-slate-300">
              {result.item.category}
            </span>
            <span className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${cfg.badgeBg} ${cfg.textColor}`}>
              Compatibility: {result.overallScore}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
