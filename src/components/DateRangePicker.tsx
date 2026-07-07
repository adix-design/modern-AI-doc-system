import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronDown, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DateRangePickerProps {
  id?: string;
}

type PresetKey = 'all' | 'today' | 'week' | 'month' | 'last30' | 'custom';

interface Preset {
  key: PresetKey;
  label: string;
  startDate: string;
  endDate: string;
}

export default function DateRangePicker({ id = 'global-date-range-picker' }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Constants anchored to July 6, 2026
  const presets: Preset[] = [
    { key: 'all', label: 'All Time', startDate: '', endDate: '' },
    { key: 'today', label: 'Today', startDate: '2026-07-06', endDate: '2026-07-06' },
    { key: 'week', label: 'This Week', startDate: '2026-07-05', endDate: '2026-07-11' },
    { key: 'month', label: 'This Month', startDate: '2026-07-01', endDate: '2026-07-31' },
    { key: 'last30', label: 'Last 30 Days', startDate: '2026-06-06', endDate: '2026-07-06' },
    { key: 'custom', label: 'Custom Range', startDate: '', endDate: '' }
  ];

  const [activePreset, setActivePreset] = useState<PresetKey>(() => {
    return (localStorage.getItem('vanguard_global_preset') as PresetKey) || 'all';
  });

  const [customStart, setCustomStart] = useState(() => {
    return localStorage.getItem('vanguard_global_start_date') || '';
  });

  const [customEnd, setCustomEnd] = useState(() => {
    return localStorage.getItem('vanguard_global_end_date') || '';
  });

  // Handle outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Sync state with localStorage if preset changes
  const handlePresetSelect = (preset: Preset) => {
    if (preset.key === 'custom') {
      setActivePreset('custom');
      // Keep dropdown open to let user enter dates
      return;
    }

    setActivePreset(preset.key);
    setCustomStart(preset.startDate);
    setCustomEnd(preset.endDate);

    localStorage.setItem('vanguard_global_preset', preset.key);
    localStorage.setItem('vanguard_global_start_date', preset.startDate);
    localStorage.setItem('vanguard_global_end_date', preset.endDate);

    // Dispatch global sync event
    window.dispatchEvent(new Event('vanguard-global-date-range-updated'));
    setIsOpen(false);
  };

  const handleApplyCustomRange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStart || !customEnd) {
      alert('Please select both start and end dates.');
      return;
    }
    if (customStart > customEnd) {
      alert('Start date cannot be after end date.');
      return;
    }

    setActivePreset('custom');
    localStorage.setItem('vanguard_global_preset', 'custom');
    localStorage.setItem('vanguard_global_start_date', customStart);
    localStorage.setItem('vanguard_global_end_date', customEnd);

    window.dispatchEvent(new Event('vanguard-global-date-range-updated'));
    setIsOpen(false);
  };

  const handleClearFilter = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePreset('all');
    setCustomStart('');
    setCustomEnd('');

    localStorage.setItem('vanguard_global_preset', 'all');
    localStorage.setItem('vanguard_global_start_date', '');
    localStorage.setItem('vanguard_global_end_date', '');

    window.dispatchEvent(new Event('vanguard-global-date-range-updated'));
    setIsOpen(false);
  };

  // Format date display label nicely
  const getDisplayLabel = () => {
    if (activePreset !== 'custom') {
      return presets.find(p => p.key === activePreset)?.label || 'All Time';
    }
    
    if (customStart && customEnd) {
      const formatDate = (dStr: string) => {
        const d = new Date(dStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      };
      return `${formatDate(customStart)} - ${formatDate(customEnd)}`;
    }
    
    return 'Custom Range';
  };

  return (
    <div 
      id={id} 
      ref={dropdownRef} 
      className="relative shrink-0"
    >
      {/* Trigger Button */}
      <button
        id={`${id}-trigger-btn`}
        onClick={() => setIsOpen(!isOpen)}
        className={`h-10 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-white flex items-center gap-2.5 transition-all duration-200 border border-white/5 relative cursor-pointer select-none ${
          isOpen ? 'bg-white/12 border-[#D946C4]/20' : ''
        }`}
      >
        <Calendar size={15} className={activePreset !== 'all' ? 'text-[#D946C4]' : 'text-white/50'} />
        <span className="font-medium tracking-wide">
          {getDisplayLabel()}
        </span>
        {activePreset !== 'all' ? (
          <div 
            id={`${id}-clear-icon`}
            onClick={handleClearFilter}
            className="p-0.5 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors"
            title="Clear date filter"
          >
            <X size={12} />
          </div>
        ) : (
          <ChevronDown size={14} className="text-white/40" />
        )}
      </button>

      {/* Floating Dropdown Dialog */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={`${id}-dropdown`}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-72 rounded-2xl bg-stone-950/95 backdrop-blur-xl border border-white/10 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-2.5">
              <span className="text-[10px] font-mono tracking-wider text-white/45 uppercase">Date Filter Range</span>
              {activePreset !== 'all' && (
                <button
                  id={`${id}-clear-all-btn`}
                  onClick={handleClearFilter}
                  className="text-[10px] text-[#D946C4]/80 hover:text-[#D946C4]/70 font-semibold"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Presets List */}
            <div className="space-y-1">
              {presets.map(p => {
                const isSelected = activePreset === p.key;
                if (p.key === 'custom') return null; // handle separately below

                return (
                  <button
                    key={p.key}
                    id={`${id}-preset-${p.key}`}
                    onClick={() => handlePresetSelect(p)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-all duration-150 ${
                      isSelected 
                        ? 'bg-[#D946C4]/10 text-[#D946C4] font-semibold border border-[#D946C4]/10' 
                        : 'text-white/70 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <span>{p.label}</span>
                    {isSelected && <Check size={14} className="text-[#D946C4]" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Range Sub-Form */}
            <div className="mt-3 border-t border-white/5 pt-3">
              <button
                id={`${id}-preset-custom`}
                onClick={() => setActivePreset('custom')}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs text-left transition-all duration-150 mb-2 ${
                  activePreset === 'custom' 
                    ? 'text-[#D946C4] font-semibold' 
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <span>Custom Range</span>
                {activePreset === 'custom' && <Check size={14} className="text-[#D946C4]" />}
              </button>

              <AnimatePresence initial={false}>
                {activePreset === 'custom' && (
                  <motion.form
                    id={`${id}-custom-form`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleApplyCustomRange}
                    className="space-y-2.5 overflow-hidden px-1"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] font-mono uppercase text-white/40 mb-1">Start Date</label>
                        <input
                          id={`${id}-start-input`}
                          type="date"
                          value={customStart}
                          onChange={(e) => setCustomStart(e.target.value)}
                          className="w-full h-8 px-2.5 rounded-lg bg-white/5 border border-white/5 text-xs text-white/90 focus:outline-none focus:border-[#D946C4]/20"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono uppercase text-white/40 mb-1">End Date</label>
                        <input
                          id={`${id}-end-input`}
                          type="date"
                          value={customEnd}
                          onChange={(e) => setCustomEnd(e.target.value)}
                          className="w-full h-8 px-2.5 rounded-lg bg-white/5 border border-white/5 text-xs text-white/90 focus:outline-none focus:border-[#D946C4]/20"
                        />
                      </div>
                    </div>

                    <button
                      id={`${id}-apply-btn`}
                      type="submit"
                      className="w-full h-8 bg-[#D946C4] hover:bg-[#D946C4]/80 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      Apply Filter
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
