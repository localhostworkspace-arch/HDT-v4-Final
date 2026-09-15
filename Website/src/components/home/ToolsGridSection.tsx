import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Search } from 'lucide-react';
import { TOOLS_DATA } from '../../data/toolsData';
import { DynamicIcon } from '../common/DynamicIcon';
const categories = [{ id: 'all', name: 'All instruments' }, { id: 'input', name: 'Input devices' }, { id: 'performance', name: 'Performance & specs' }, { id: 'display', name: 'Display' }, { id: 'audio-video', name: 'Audio & video' }, { id: 'network', name: 'Connectivity' }];
export function ToolsGridSection({ compact = false }: { compact?: boolean }) {
  const [params, setParams] = useSearchParams();
  const [homeCategory, setHomeCategory] = useState('all');
  const category = compact ? homeCategory : (params.get('category') || 'all');
  const query = compact ? '' : (params.get('q') || '');
  const update = (key: string, value: string) => { const next = new URLSearchParams(params); if (value && value !== 'all') next.set(key, value); else next.delete(key); setParams(next, { replace: true }); };
  const tools = useMemo(() => TOOLS_DATA.filter(tool => (category === 'all' || tool.category === category) && `${tool.name} ${tool.shortDesc} ${tool.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase().trim())), [category, query]);
  const displayed = compact ? tools.slice(0, 6) : tools;
  return <section className="tool-index lab-container" id="instruments"><div className="index-heading"><div><span className="lab-eyebrow">THE INSTRUMENTS / {String(TOOLS_DATA.length).padStart(2, '0')} TOOLS</span><h2>{compact ? 'Find your starting point.' : 'A tool for every question.'}</h2></div>{compact ? <a href="#instruments" className="text-link">View all instruments <ArrowUpRight size={18} /></a> : <label className="catalog-search"><Search size={18} /><input aria-label="Filter instruments" value={query} onChange={e => update('q', e.target.value)} placeholder="Find an instrument…" /></label>}</div>
    <div className="index-layout"><div className="category-rail" aria-label="Instrument categories">{categories.map(item => <button key={item.id} aria-pressed={category === item.id} onClick={() => compact ? setHomeCategory(item.id) : update('category', item.id)}><span>{item.name}</span><span>{String(item.id === 'all' ? TOOLS_DATA.length : TOOLS_DATA.filter(t => t.category === item.id).length).padStart(2, '0')}</span></button>)}<p className="rail-note">No accounts.<br />No installation.<br />Just your browser.</p></div>
    <div className="tool-rows"><span className="sr-only" role="status">{tools.length} instruments found</span>{displayed.map((tool, index) => <Link className="tool-row" key={tool.id} to={tool.path}><span className="tool-number">{String(index + 1).padStart(2, '0')}</span><span className="tool-row-icon"><DynamicIcon name={tool.iconName} size={24} strokeWidth={1.4} /></span><div className="tool-row-name"><h3>{tool.name}</h3><small>{tool.categoryLabel}</small></div><p>{tool.shortDesc}</p><ArrowUpRight className="tool-row-arrow" size={20} /></Link>)}{!tools.length && <div className="empty-results"><h3>No matching instruments.</h3><p>Try a device name such as keyboard, screen or CPU.</p><button className="text-link" onClick={() => { setParams({}); setHomeCategory('all'); }}>Clear filters <ArrowRight size={16} /></button></div>}</div></div>
  </section>;
}
