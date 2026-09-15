import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import type { CompatibilityItem } from '../../../types';
import { searchCompatibilityItems } from '../../../services/searchService';

interface SearchBarProps {
  onSelect: (item: CompatibilityItem) => void;
  placeholder?: string;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSelect, placeholder }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CompatibilityItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 150);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    setIsSearching(true);
    const found = searchCompatibilityItems(debouncedQuery, { limit: 8 });
    setResults(found);
    setIsOpen(true);
    setIsSearching(false);
    setActiveIndex(-1);
  }, [debouncedQuery]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (item: CompatibilityItem) => {
    setQuery('');
    setIsOpen(false);
    setResults([]);
    onSelect(item);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, results.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && activeIndex >= 0) { handleSelect(results[activeIndex]); }
    if (e.key === 'Escape') { setIsOpen(false); setActiveIndex(-1); }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto" role="search">
      {/* Search Input */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400 pointer-events-none" />
        <input
          ref={inputRef}
          id="can-i-run-it-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
          placeholder={placeholder ?? 'Search games, apps, and software...'}
          aria-label="Search games and software"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          autoComplete="off"
          className="w-full pl-12 pr-12 py-4 rounded-2xl bg-slate-800/70 border border-slate-700/60 focus:border-indigo-500/70 focus:bg-slate-800/90 text-white placeholder-slate-400 text-base font-medium outline-none transition-all shadow-xl focus:shadow-indigo-500/10 focus:ring-2 focus:ring-indigo-500/20"
        />
        {isSearching && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400 animate-spin" />
        )}
        {query && !isSearching && (
          <button
            onClick={() => { setQuery(''); setResults([]); setIsOpen(false); inputRef.current?.focus(); }}
            aria-label="Clear search"
            className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Search results"
          className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-slate-900/98 border border-slate-700/60 shadow-2xl shadow-black/40 backdrop-blur-xl z-50 overflow-hidden"
        >
          {results.length === 0 && query.trim() && (
            <div className="px-5 py-6 text-center">
              <p className="text-slate-300 font-medium mb-1">We couldn't find that title.</p>
              <p className="text-slate-500 text-sm">Try another name or search for a different game or software.</p>
            </div>
          )}
          {results.map((item, idx) => (
            <button
              key={item.id}
              role="option"
              aria-selected={idx === activeIndex}
              onClick={() => handleSelect(item)}
              onMouseEnter={() => setActiveIndex(idx)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-slate-800/60 last:border-0 ${
                idx === activeIndex ? 'bg-indigo-600/20' : 'hover:bg-slate-800/60'
              }`}
            >
              <span className="text-2xl shrink-0">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <span className="block font-semibold text-white text-sm truncate">{item.name}</span>
                <span className="block text-xs text-slate-400 truncate">
                  {item.type === 'game' ? '🎮 Game' : '💻 Software'} · {item.developer}
                </span>
              </div>
              <div className="shrink-0 text-right hidden sm:block">
                <span className="text-[11px] text-slate-500">
                  Min GPU: {item.minimumRequirements.gpu.replace('NVIDIA GeForce ', '').replace('AMD Radeon ', '')}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
