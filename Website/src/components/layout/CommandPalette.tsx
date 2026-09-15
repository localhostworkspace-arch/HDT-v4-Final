import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowUp, ArrowDown, CornerDownLeft } from 'lucide-react';
import { TOOLS_DATA } from '../../data/toolsData';
import { DynamicIcon } from '../common/DynamicIcon';
import { useToast } from '../../context/ToastContext';
import './CommandPalette.css';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const normalize = (value: string) => value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, ' ').trim();

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLUListElement>(null);
  const navigate = useNavigate();
  const { showNotAvailable } = useToast();
  const id = useId();
  const tokens = normalize(query).split(' ').filter(Boolean);
  const filteredTools = TOOLS_DATA.filter(tool => {
    const searchable = normalize([tool.name, tool.slug, tool.shortDesc, tool.categoryLabel, ...tool.tags].join(' '));
    return tokens.every(token => searchable.includes(token));
  });
  const selectedTool = filteredTools[selectedIndex];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !isOpen) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setQuery('');
    setSelectedIndex(0);
    dialog.showModal();
    inputRef.current?.focus();
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = originalOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    resultsRef.current?.children[selectedIndex]?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  const updateQuery = (value: string) => {
    setQuery(value);
    setSelectedIndex(0);
  };

  const selectTool = (tool: typeof TOOLS_DATA[number]) => {
    if (tool.isAvailable === false || tool.status === 'Not Available') showNotAvailable(tool.name);
    else navigate(tool.path);
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className="lab-command"
      aria-labelledby={`${id}-title`}
      onCancel={event => { event.preventDefault(); onClose(); }}
      onClick={event => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
      }}
    >
      <div className="lab-command__heading">
        <div><span className="lab-command__eyebrow">Diagnostic index</span><h2 id={`${id}-title`}>Find your next test.</h2></div>
        <button type="button" className="lab-command__close" aria-label="Close diagnostic search" onClick={onClose}><X size={20} /></button>
      </div>
      <div className="lab-command__search">
        <Search size={20} aria-hidden="true" />
        <input
          ref={inputRef}
          role="combobox"
          aria-label="Search diagnostic tools"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={`${id}-results`}
          aria-activedescendant={selectedTool ? `${id}-${selectedTool.id}` : undefined}
          autoComplete="off"
          placeholder="Try keyboard, GPU, or stick drift"
          value={query}
          onChange={event => updateQuery(event.target.value)}
          onKeyDown={event => {
            if (event.nativeEvent.isComposing) return;
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault();
              const direction = event.key === 'ArrowDown' ? 1 : -1;
              setSelectedIndex(index => Math.max(0, Math.min(filteredTools.length - 1, index + direction)));
            } else if (event.key === 'Enter' && selectedTool) {
              event.preventDefault();
              selectTool(selectedTool);
            }
          }}
        />
      </div>
      <div className="lab-command__suggestions" aria-label="Suggested searches">
        {['Keyboard', 'Mouse', 'Gamepad', 'Screen', 'Microphone', 'Speed'].map(term => (
          <button key={term} type="button" onClick={() => { updateQuery(term); inputRef.current?.focus(); }}>{term}</button>
        ))}
      </div>
      <p className="lab-command__count" role="status">{filteredTools.length} {filteredTools.length === 1 ? 'diagnostic' : 'diagnostics'} found</p>
      <ul ref={resultsRef} id={`${id}-results`} className="lab-command__results" role="listbox" aria-label="Diagnostic tools">
        {filteredTools.map((tool, index) => (
          <li
            key={tool.id}
            id={`${id}-${tool.id}`}
            role="option"
            aria-selected={index === selectedIndex}
            className="lab-command__result"
            onMouseEnter={() => setSelectedIndex(index)}
            onMouseDown={event => event.preventDefault()}
            onClick={() => selectTool(tool)}
          >
            <span className="lab-command__icon" aria-hidden="true"><DynamicIcon name={tool.iconName} className="size-5" /></span>
            <span className="lab-command__description"><strong>{tool.name}</strong><span>{tool.shortDesc}</span></span>
            <span className="lab-command__category">{tool.isAvailable === false || tool.status === 'Not Available' ? 'Unavailable' : tool.categoryLabel}</span>
            <CornerDownLeft className="lab-command__enter" size={16} aria-hidden="true" />
          </li>
        ))}
      </ul>
      {filteredTools.length === 0 && <div className="lab-command__empty">No matching tools. Try “audio”, “pixels”, or “speed”.</div>}
      <div className="lab-command__footer"><span><ArrowUp size={12} /><ArrowDown size={12} /> Navigate <kbd>Enter</kbd> Open</span><span><kbd>Esc</kbd> Close</span></div>
    </dialog>
  );
}
