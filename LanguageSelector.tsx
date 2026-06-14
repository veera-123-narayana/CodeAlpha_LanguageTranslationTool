/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Check, ChevronDown, Flame, History, Globe } from 'lucide-react';
import { Language } from '../types';
import { LANGUAGES } from '../languages';

interface LanguageSelectorProps {
  idPrefix: string;
  selectedCode: string;
  onChange: (code: string) => void;
  label: string;
  allowAuto?: boolean;
  excludeCode?: string;
  recentCodes?: string[];
}

export default function LanguageSelector({
  idPrefix,
  selectedCode,
  onChange,
  label,
  allowAuto = false,
  excludeCode,
  recentCodes = [],
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (code: string) => {
    onChange(code);
    setIsOpen(false);
    setSearchQuery('');
  };

  const selectedLanguage = useMemo(() => {
    if (selectedCode === 'auto') {
      return { code: 'auto', name: 'Auto Detect', flag: '🔍' };
    }
    return LANGUAGES.find(lang => lang.code === selectedCode) || { code: selectedCode, name: selectedCode.toUpperCase(), flag: '🌐' };
  }, [selectedCode]);

  // Filter languages by search query
  const filteredLanguages = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let currentList = LANGUAGES;
    if (excludeCode) {
      currentList = currentList.filter(l => l.code !== excludeCode);
    }
    if (!query) return currentList;
    return currentList.filter(
      lang => lang.name.toLowerCase().includes(query) || lang.code.toLowerCase().includes(query)
    );
  }, [searchQuery, excludeCode]);

  // Separate languages into popular and recent
  const popularLanguages = useMemo(() => {
    let list = LANGUAGES.filter(l => l.popular);
    if (excludeCode) {
      list = list.filter(l => l.code !== excludeCode);
    }
    return list;
  }, [excludeCode]);

  const recentLanguagesList = useMemo(() => {
    if (!recentCodes || recentCodes.length === 0) return [];
    let list = recentCodes
      .map(code => LANGUAGES.find(l => l.code === code))
      .filter((l): l is Language => !!l);
    if (excludeCode) {
      list = list.filter(l => l.code !== excludeCode);
    }
    return list;
  }, [recentCodes, excludeCode]);

  return (
    <div className="relative w-full" ref={containerRef} id={`sel-container-${idPrefix}`}>
      <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 px-0.5">
        {label}
      </label>
      
      <button
        id={`btn-trigger-${idPrefix}`}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-800 bg-[#0d0f1b] hover:border-slate-700 transition-all duration-200 text-left cursor-pointer shadow-sm text-slate-100"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-xl leading-none">{selectedLanguage.flag}</span>
          <span className="font-medium text-sm md:text-base text-white">{selectedLanguage.name}</span>
          {selectedLanguage.code !== 'auto' && (
            <span className="text-xs text-slate-400 uppercase font-mono px-1.5 py-0.5 rounded bg-slate-900/80">
              {selectedLanguage.code}
            </span>
          )}
        </div>
        <ChevronDown className={`w-4.5 h-4.5 text-slate-400 transition-transform duration-250 ${isOpen ? 'rotate-180 text-cyan-400' : ''}`} />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div 
          id={`panel-${idPrefix}`}
          className="absolute z-50 left-0 right-0 mt-2 p-2.5 rounded-2xl border border-slate-800 bg-[#090b11] shadow-2xl max-h-[380px] overflow-hidden flex flex-col transition-all duration-200"
        >
          {/* Search Input bar */}
          <div className="relative mb-2 shrink-0">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              id={`query-input-${idPrefix}`}
              type="text"
              placeholder="Search translation languages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-white/10 bg-slate-950 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              autoFocus
            />
          </div>

          <div className="overflow-y-auto flex-1 select-none pr-1 space-y-1.5 max-h-[300px]">
            {/* Auto Detect Option for source selectors only */}
            {allowAuto && !searchQuery && (
              <button
                id={`opt-auto-${idPrefix}`}
                type="button"
                onClick={() => handleChange('auto')}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-xl text-left cursor-pointer transition-colors mb-1 ${
                  selectedCode === 'auto'
                    ? 'bg-indigo-600/25 text-indigo-400 font-semibold border border-indigo-500/20'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔍</span>
                  <span>Detect Language Automatically</span>
                </div>
                {selectedCode === 'auto' && <Check className="w-4 h-4 text-indigo-400" />}
              </button>
            )}

            {/* Recent Languages Section */}
            {recentLanguagesList.length > 0 && !searchQuery && (
              <div className="mb-2">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-3 py-1 flex items-center gap-1.5">
                  <History className="w-3 h-3 text-cyan-400" /> Recent Searches
                </div>
                {recentLanguagesList.map(lang => (
                  <button
                    key={`recent-${lang.code}`}
                    type="button"
                    onClick={() => handleChange(lang.code)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-xl text-left cursor-pointer transition-colors ${
                      selectedCode === lang.code
                        ? 'bg-indigo-600/25 text-indigo-400 font-semibold border border-indigo-500/20'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </div>
                    {selectedCode === lang.code && <Check className="w-4 h-4 text-indigo-400" />}
                  </button>
                ))}
              </div>
            )}

            {/* Popular Languages Section */}
            {popularLanguages.length > 0 && !searchQuery && (
              <div className="mb-2">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-3 py-1 flex items-center gap-1.5">
                  <Flame className="w-3 h-3 text-amber-500" /> Popular Languages
                </div>
                <div className="grid grid-cols-2 gap-1 p-1">
                  {popularLanguages.map(lang => (
                    <button
                      key={`pop-${lang.code}`}
                      type="button"
                      onClick={() => handleChange(lang.code)}
                      className={`flex items-center gap-2 px-2.5 py-2 text-xs rounded-lg text-left cursor-pointer transition-all ${
                        selectedCode === lang.code
                          ? 'bg-indigo-600 text-white font-semibold'
                          : 'bg-white/5 hover:bg-white/10 text-slate-350'
                      }`}
                    >
                      <span className="text-sm">{lang.flag}</span>
                      <span className="truncate">{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* All Languages Section */}
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-3 py-1.5 flex items-center gap-1.5 mb-1">
                <Globe className="w-3 h-3 text-cyan-500" /> All Languages ({filteredLanguages.length})
              </div>
              
              {filteredLanguages.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400">
                  No matching languages found.
                </div>
              ) : (
                filteredLanguages.map(lang => (
                  <button
                    key={`all-${lang.code}`}
                    type="button"
                    onClick={() => handleChange(lang.code)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-xl text-left cursor-pointer transition-colors mb-0.5 ${
                      selectedCode === lang.code
                        ? 'bg-indigo-600/25 text-indigo-400 font-semibold border border-indigo-500/20'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">{lang.code}</span>
                    </div>
                    {selectedCode === lang.code && <Check className="w-4 h-4 text-indigo-400" />}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
