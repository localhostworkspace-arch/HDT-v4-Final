import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { CompatibilityItem } from '../../../types';

interface GameCardProps {
  item: CompatibilityItem;
  onClick: (item: CompatibilityItem) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ item, onClick }) => {
  return (
    <button
      onClick={() => onClick(item)}
      className="group relative flex flex-col justify-between p-5 rounded-2xl bg-slate-900/60 border border-slate-700/60 hover:border-indigo-500/40 hover:bg-slate-900/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 text-left overflow-hidden"
      aria-label={`Check if you can run ${item.name}`}
    >
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl bg-indigo-500/5 group-hover:bg-indigo-500/15 transition-all duration-500 pointer-events-none" />

      <div>
        <div className="flex items-start justify-between mb-3">
          <span className="text-3xl">{item.icon}</span>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
            item.type === 'game'
              ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25'
              : 'bg-purple-500/15 text-purple-400 border border-purple-500/25'
          }`}>
            {item.type === 'game' ? 'Game' : 'App'}
          </span>
        </div>

        <h4 className="font-bold text-white text-sm leading-tight mb-1 group-hover:text-indigo-300 transition-colors">
          {item.name}
        </h4>
        <p className="text-xs text-slate-500 mb-3">{item.developer}</p>

        <div className="space-y-1 text-xs text-slate-400">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Min GPU:</span>
            <span className="text-slate-300 font-medium truncate ml-2 max-w-[100px]">
              {item.minimumRequirements.gpu.replace('NVIDIA GeForce ', '').replace('AMD Radeon ', '')}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Min RAM:</span>
            <span className="text-slate-300 font-medium">{item.minimumRequirements.ramGB} GB</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800">
        <span className="text-xs text-indigo-400 font-semibold group-hover:text-indigo-300">Check Compatibility</span>
        <div className="w-7 h-7 rounded-lg bg-indigo-500/10 group-hover:bg-indigo-600 flex items-center justify-center transition-colors">
          <ArrowRight className="w-3.5 h-3.5 text-indigo-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </button>
  );
};
