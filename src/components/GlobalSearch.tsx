import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { toast } from '../lib/toast';
import { useAppContext } from '../AppContext';

export function GlobalSearch() {
  const { searchQuery, setSearchQuery } = useAppContext();
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsFocused(false);
      // Ensure the keyboard is dismissed on mobile
      (document.activeElement as HTMLElement)?.blur();
    }
  };

  return (
    <div className="absolute top-4 left-14 right-14 sm:left-16 sm:right-16 md:left-1/2 md:-translate-x-1/2 md:right-auto w-auto md:w-[400px] lg:w-[500px] md:top-6 z-50 pointer-events-none flex justify-center transition-all duration-300">
      <form 
        onSubmit={handleSearch}
        className={`w-full pointer-events-auto flex items-center bg-slate-900/60 backdrop-blur-md rounded-2xl p-2 shadow-lg border border-slate-700/50 transition-all ${isFocused ? 'ring-2 ring-pink-500/50 bg-slate-900 shadow-pink-500/10' : ''}`}
      >
        <Search className="w-5 h-5 text-slate-400 ml-2 shrink-0" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search friends, topics..." 
          className="bg-transparent border-none outline-none text-white ml-3 w-full text-sm placeholder:text-slate-500"
        />
        {searchQuery && (
          <button 
            type="button" 
            onClick={() => setSearchQuery('')}
            className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors mr-1 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>
    </div>
  );
}
