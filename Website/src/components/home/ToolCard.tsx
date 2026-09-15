import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Lock, AlertCircle } from 'lucide-react';
import type { ToolItem } from '../../types';
import { DynamicIcon } from '../common/DynamicIcon';
import { useToast } from '../../context/ToastContext';

interface ToolCardProps {
  tool: ToolItem;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  const { showNotAvailable } = useToast();
  const isAvailable = tool.isAvailable !== false && tool.status !== 'Not Available';

  const handleClick = (e: React.MouseEvent) => {
    if (!isAvailable) {
      e.preventDefault();
      showNotAvailable(tool.name);
    }
  };

  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (!isAvailable) {
      return (
        <div
          onClick={handleClick}
          className="group relative flex flex-col justify-between p-6 rounded-3xl bg-slate-900/40 dark:bg-[#0E1526]/60 light:bg-white border border-slate-800/80 hover:border-amber-500/40 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-amber-500/5 hover:-translate-y-1 overflow-hidden cursor-pointer opacity-85 hover:opacity-100"
        >
          {children}
        </div>
      );
    }

    return (
      <Link
        to={tool.path}
        className="group relative flex flex-col justify-between p-6 rounded-3xl bg-slate-900/60 dark:bg-[#0E1526]/80 light:bg-white border border-slate-700/60 dark:border-slate-800/80 hover:border-indigo-500/50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1.5 overflow-hidden"
      >
        {children}
      </Link>
    );
  };

  return (
    <CardWrapper>
      {/* Ambient background hover glow */}
      <div 
        className={`absolute top-0 right-0 w-36 h-36 rounded-full blur-2xl transition-all duration-500 pointer-events-none ${
          isAvailable 
            ? 'bg-indigo-500/5 group-hover:bg-indigo-500/15' 
            : 'bg-amber-500/5 group-hover:bg-amber-500/15'
        }`} 
      />

      {/* Top Header: Icon & Category/Badge */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-5">
          <div 
            className={`w-13 h-13 rounded-2xl border flex items-center justify-center transition-all duration-300 shrink-0 ${
              isAvailable
                ? 'bg-gradient-to-tr from-indigo-600/20 to-purple-600/20 light:bg-indigo-50 border-indigo-500/30 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-indigo-600/30'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400 group-hover:bg-amber-500/20'
            }`}
          >
            <DynamicIcon name={tool.iconName} className="w-6 h-6" />
          </div>

          <div className="flex items-center">
            {!isAvailable ? (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
                <AlertCircle className="w-3.5 h-3.5" />
                Not Available
              </span>
            ) : tool.badge ? (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30">
                {tool.badge}
              </span>
            ) : (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-800/60 text-slate-400 border border-slate-700/40">
                {tool.categoryLabel}
              </span>
            )}
          </div>
        </div>

        {/* Title & Short Description */}
        <h3 
          className={`text-xl font-bold transition-colors mb-2 tracking-tight ${
            isAvailable 
              ? 'text-white dark:text-white light:text-slate-900 group-hover:text-indigo-400' 
              : 'text-slate-200 group-hover:text-amber-300'
          }`}
        >
          {tool.name}
        </h3>
        <p className="text-sm text-slate-300 dark:text-slate-400 light:text-slate-600 leading-relaxed mb-5">
          {tool.shortDesc}
        </p>
      </div>

      {/* Bottom Specs / Tags & Launch Action */}
      <div>
        {/* Tags - Top 2 most relevant tags to keep card clean */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {tool.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-800/70 dark:bg-slate-800/70 text-slate-300 border border-slate-700/40"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* CTA Launch Bar */}
        {isAvailable ? (
          <div className="pt-4 border-t border-slate-800/80 dark:border-slate-800/80 flex items-center justify-between text-sm font-semibold text-indigo-400 group-hover:text-indigo-300">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Launch Test Suite
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-all">
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        ) : (
          <div className="pt-4 border-t border-slate-800/80 dark:border-slate-800/80 flex items-center justify-between text-sm font-medium text-amber-400/80 group-hover:text-amber-300">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Not Available
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 group-hover:bg-amber-500/20 text-amber-400 flex items-center justify-center transition-all">
              <Lock className="w-3.5 h-3.5" />
            </div>
          </div>
        )}
      </div>
    </CardWrapper>
  );
};
