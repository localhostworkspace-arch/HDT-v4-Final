import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { CompatibilityItem } from '../../../types';

interface PopularItemsProps {
  onSelect: (item: CompatibilityItem) => void;
  games: CompatibilityItem[];
  software: CompatibilityItem[];
}

export const PopularItems: React.FC<PopularItemsProps> = ({ onSelect, games, software }) => {
  return (
    <div className="space-y-6">
      {/* Popular Games */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Popular Games</h3>
        <div className="flex flex-wrap gap-2">
          {games.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/70 border border-slate-700/50 hover:border-indigo-500/50 hover:bg-indigo-600/10 text-slate-300 hover:text-white text-sm font-medium transition-all group"
              aria-label={`Check compatibility for ${item.name}`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span className="truncate max-w-[120px]">{item.name}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Popular Software */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Popular Software</h3>
        <div className="flex flex-wrap gap-2">
          {software.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/70 border border-slate-700/50 hover:border-purple-500/50 hover:bg-purple-600/10 text-slate-300 hover:text-white text-sm font-medium transition-all group"
              aria-label={`Check compatibility for ${item.name}`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span className="truncate max-w-[120px]">{item.name}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 transition-colors shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
