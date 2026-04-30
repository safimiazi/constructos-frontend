'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface BaseProps {
  options: SelectOption[];
  placeholder?: string;
  searchable?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  label?: string;
  error?: string;
}

// ─── Single Select ────────────────────────────────────────────────────────────

interface SingleSelectProps extends BaseProps {
  multiple?: false;
  value: string;
  onChange: (value: string) => void;
}

// ─── Multi Select ─────────────────────────────────────────────────────────────

interface MultiSelectProps extends BaseProps {
  multiple: true;
  value: string[];
  onChange: (value: string[]) => void;
  maxDisplay?: number;
}

type SelectProps = SingleSelectProps | MultiSelectProps;

export function Select(props: SelectProps) {
  const { options, placeholder = 'Select…', searchable = true, clearable = false, disabled = false, loading = false, className = '', label, error } = props;

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus search on open
  useEffect(() => {
    if (open && searchable) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open, searchable]);

  const filtered = options.filter(o =>
    !search || o.label.toLowerCase().includes(search.toLowerCase()) || o.description?.toLowerCase().includes(search.toLowerCase())
  );

  const isSelected = useCallback((val: string) => {
    if (props.multiple) return (props.value as string[]).includes(val);
    return props.value === val;
  }, [props]);

  const getLabel = () => {
    if (props.multiple) {
      const vals = props.value as string[];
      if (!vals.length) return null;
      const max = (props as MultiSelectProps).maxDisplay ?? 2;
      const shown = vals.slice(0, max).map(v => options.find(o => o.value === v)?.label ?? v);
      const extra = vals.length - max;
      return (
        <div className="flex items-center gap-1 flex-wrap">
          {shown.map(l => (
            <span key={l} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ background: 'rgba(168,85,247,0.15)', color: '#a855f7' }}>
              {l}
            </span>
          ))}
          {extra > 0 && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>+{extra} more</span>}
        </div>
      );
    }
    const opt = options.find(o => o.value === props.value);
    return opt ? (
      <span className="flex items-center gap-2">
        {opt.icon && <span className="shrink-0">{opt.icon}</span>}
        <span>{opt.label}</span>
      </span>
    ) : null;
  };

  const handleSelect = (val: string) => {
    if (props.multiple) {
      const current = props.value as string[];
      const next = current.includes(val) ? current.filter(v => v !== val) : [...current, val];
      props.onChange(next);
    } else {
      (props as SingleSelectProps).onChange(val);
      setOpen(false);
      setSearch('');
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (props.multiple) props.onChange([]);
    else (props as SingleSelectProps).onChange('');
  };

  const hasValue = props.multiple ? (props.value as string[]).length > 0 : !!props.value;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>}

      {/* Trigger */}
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => !disabled && !loading && setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-left transition-all"
        style={{
          background: 'var(--input-bg)',
          border: `1px solid ${error ? 'var(--error-text)' : open ? 'var(--input-focus)' : 'var(--input-border)'}`,
          boxShadow: open ? '0 0 0 3px rgba(147,51,234,0.15)' : 'none',
          color: hasValue ? 'var(--input-text)' : 'var(--text-muted)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          minHeight: 38,
        }}
      >
        <div className="flex-1 min-w-0 overflow-hidden">
          {loading ? (
            <span className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
              <span className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin shrink-0" style={{ borderColor: 'var(--brand-500)', borderTopColor: 'transparent' }} />
              Loading…
            </span>
          ) : hasValue ? getLabel() : <span>{placeholder}</span>}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {clearable && hasValue && !disabled && (
            <span onClick={handleClear} className="p-0.5 rounded hover:bg-(--bg-muted) transition-colors" style={{ color: 'var(--text-muted)' }}>
              <X size={13} />
            </span>
          )}
          <ChevronDown size={15} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} style={{ color: 'var(--text-muted)' }} />
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden shadow-xl"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', minWidth: 200 }}>

          {/* Search */}
          {searchable && (
            <div className="p-2" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  ref={searchRef}
                  className="w-full pl-7 pr-3 py-1.5 text-sm rounded-lg outline-none"
                  style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)', color: 'var(--input-text)' }}
                  placeholder="Search…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onClick={e => e.stopPropagation()}
                />
              </div>
            </div>
          )}

          {/* Options */}
          <div className="overflow-y-auto" style={{ maxHeight: 240 }}>
            {filtered.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                {search ? `No results for "${search}"` : 'No options available'}
              </div>
            ) : (
              filtered.map(opt => {
                const selected = isSelected(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={opt.disabled}
                    onClick={() => !opt.disabled && handleSelect(opt.value)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left transition-colors"
                    style={{
                      background: selected ? 'rgba(168,85,247,0.08)' : 'transparent',
                      color: opt.disabled ? 'var(--text-muted)' : selected ? '#a855f7' : 'var(--text-primary)',
                      cursor: opt.disabled ? 'not-allowed' : 'pointer',
                      opacity: opt.disabled ? 0.5 : 1,
                    }}
                    onMouseEnter={e => { if (!opt.disabled && !selected) (e.currentTarget as HTMLElement).style.background = 'var(--bg-muted)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = selected ? 'rgba(168,85,247,0.08)' : 'transparent'; }}
                  >
                    {/* Checkbox for multi */}
                    {props.multiple && (
                      <span className="w-4 h-4 rounded flex items-center justify-center shrink-0 transition-all"
                        style={{ background: selected ? '#a855f7' : 'transparent', border: `1.5px solid ${selected ? '#a855f7' : 'var(--border-strong)'}` }}>
                        {selected && <Check size={10} color="white" strokeWidth={3} />}
                      </span>
                    )}
                    {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{opt.label}</p>
                      {opt.description && <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{opt.description}</p>}
                    </div>
                    {/* Checkmark for single */}
                    {!props.multiple && selected && <Check size={14} style={{ color: '#a855f7', flexShrink: 0 }} />}
                  </button>
                );
              })
            )}
          </div>

          {/* Multi footer */}
          {props.multiple && (props.value as string[]).length > 0 && (
            <div className="px-3 py-2 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-muted)' }}>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{(props.value as string[]).length} selected</span>
              <button type="button" onClick={handleClear} className="text-xs hover:underline" style={{ color: '#a855f7' }}>Clear all</button>
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-1 text-xs" style={{ color: 'var(--error-text)' }}>{error}</p>}
    </div>
  );
}
