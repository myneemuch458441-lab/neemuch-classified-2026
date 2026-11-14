import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  X,
  CheckSquare,
  Square,
  ChevronDown,
  MapPin,
  SlidersHorizontal,
  RotateCcw,
  Home,
  Key,
  Shield,
  Store,
  Tag,
  Building
} from 'lucide-react';
import { NEEMUCH_COLONIES, LISTING_CATEGORIES } from '../data/seedProperties';
import { PropertyConfig, ListingCategory, PROPERTY_CONFIG_OPTIONS } from '../types/property';

export const CONFIG_OPTIONS: (PropertyConfig | 'All')[] = [
  'All',
  ...PROPERTY_CONFIG_OPTIONS,
];

export type AvailabilityFilterType = 'all' | 'available' | 'booked';

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: ListingCategory | 'All';
  onCategoryChange: (category: ListingCategory | 'All') => void;
  selectedConfig: PropertyConfig | 'All';
  onConfigChange: (config: PropertyConfig | 'All') => void;
  selectedColonies: string[];
  onColoniesChange: (colonies: string[]) => void;
  availabilityFilter: AvailabilityFilterType;
  onAvailabilityFilterChange: (value: AvailabilityFilterType) => void;
  onResetFilters: () => void;
  totalFilteredCount: number;
  categoryCounts: Record<string, number>;
  availableCount: number;
  bookedCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedConfig,
  onConfigChange,
  selectedColonies,
  onColoniesChange,
  availabilityFilter,
  onAvailabilityFilterChange,
  onResetFilters,
  totalFilteredCount,
  categoryCounts,
  availableCount,
  bookedCount,
}) => {
  const [isColonyDropdownOpen, setIsColonyDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsColonyDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAllColoniesSelected = selectedColonies.length === NEEMUCH_COLONIES.length;

  const toggleSelectAllColonies = () => {
    if (isAllColoniesSelected) {
      onColoniesChange([]);
    } else {
      onColoniesChange([...NEEMUCH_COLONIES]);
    }
  };

  const toggleSingleColony = (colony: string) => {
    if (selectedColonies.includes(colony)) {
      onColoniesChange(selectedColonies.filter((c) => c !== colony));
    } else {
      onColoniesChange([...selectedColonies, colony]);
    }
  };

  const categories: { label: string; value: ListingCategory | 'All'; icon: React.ReactNode; color: string }[] = [
    { label: 'सभी लिस्टिंग्स', value: 'All', icon: <Home className="w-3.5 h-3.5" />, color: 'emerald' },
    { label: 'मकान किराए हेतु', value: 'मकान किराए हेतु', icon: <Key className="w-3.5 h-3.5" />, color: 'teal' },
    { label: 'गिरवी मकान', value: 'गिरवी मकान', icon: <Shield className="w-3.5 h-3.5" />, color: 'amber' },
    { label: 'दुकान (Shop)', value: 'दुकान', icon: <Store className="w-3.5 h-3.5" />, color: 'cyan' },
    { label: 'मकान बेचना है', value: 'मकान बेचना है', icon: <Tag className="w-3.5 h-3.5" />, color: 'indigo' },
    { label: 'मकान खरीदना है', value: 'मकान खरीदना है', icon: <Tag className="w-3.5 h-3.5" />, color: 'sky' },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md space-y-4">
      {/* Category Tabs: किराए हेतु, गिरवी मकान, दुकान, मकान बेचना है, मकान खरीदना है */}
      <div className="border-b border-slate-800 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.value;
            const count = cat.value === 'All' ? categoryCounts['All'] || 0 : categoryCounts[cat.value] || 0;

            return (
              <button
                key={cat.value}
                onClick={() => onCategoryChange(cat.value)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20 scale-[1.02]'
                    : 'bg-slate-950/80 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[11px] font-black ${
                    isSelected
                      ? 'bg-slate-950 text-emerald-400'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 1: Search Bar and Colony Dropdown */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Search Input */}
        <div className="md:col-span-8 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4 text-emerald-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder='खोजें जैसे "गिरवी मकान, दुकान बघाना, 2BHK विकास नगर, H.N. 42 या मोबाइल"...'
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-100 placeholder-slate-500 text-sm outline-none transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Colony Filter Dropdown */}
        <div className="md:col-span-4 relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsColonyDropdownOpen(!isColonyDropdownOpen)}
            className="w-full py-2.5 px-3.5 rounded-xl bg-slate-950/80 border border-slate-700/80 hover:border-slate-600 text-left text-sm flex items-center justify-between text-slate-200 transition-colors"
          >
            <div className="flex items-center gap-2 truncate">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="truncate">
                {selectedColonies.length === 0
                  ? 'कोई कॉलोनी नहीं चुनी'
                  : selectedColonies.length === NEEMUCH_COLONIES.length
                  ? 'सभी कॉलोनियाँ (All Neemuch)'
                  : `${selectedColonies.length} कॉलोनियाँ चुनी गईं`}
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                isColonyDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Colony Selection Dropdown Menu */}
          {isColonyDropdownOpen && (
            <div className="absolute right-0 mt-2 w-full md:w-80 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-800">
              {/* Select All Checkbox Header */}
              <div
                onClick={toggleSelectAllColonies}
                className="px-3.5 py-2.5 bg-slate-900/90 hover:bg-slate-800/80 cursor-pointer flex items-center justify-between text-xs font-semibold text-slate-200"
              >
                <div className="flex items-center gap-2">
                  {isAllColoniesSelected ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-500" />
                  )}
                  <span>सब सेलेक्ट करें (Select All Colonies)</span>
                </div>
                <span className="text-[11px] text-emerald-400">
                  {isAllColoniesSelected ? 'हटाएँ' : 'सभी चुनें'}
                </span>
              </div>

              {/* Colony Checkbox List */}
              <div className="max-h-64 overflow-y-auto p-1.5 space-y-1">
                {NEEMUCH_COLONIES.map((colony) => {
                  const isChecked = selectedColonies.includes(colony);
                  return (
                    <label
                      key={colony}
                      onClick={() => toggleSingleColony(colony)}
                      className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg cursor-pointer text-xs transition-colors ${
                        isChecked
                          ? 'bg-emerald-500/10 text-emerald-300 font-medium'
                          : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      )}
                      <span className="truncate">{colony}</span>
                    </label>
                  );
                })}
              </div>

              <div className="p-2 bg-slate-900/60 flex items-center justify-between text-[11px] text-slate-400">
                <span>{selectedColonies.length} कॉलोनी सक्रिय</span>
                <button
                  type="button"
                  onClick={() => setIsColonyDropdownOpen(false)}
                  className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs"
                >
                  लागू करें
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Configuration Filters Pills */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
            <span>कॉन्फ़िगरेशन / प्रकार:</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onResetFilters}
              title="फ़िल्टर रीसेट करें"
              className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>रीसेट</span>
            </button>
          </div>
        </div>

        {/* Configuration Pills - Wrapped grid so all options are visible and clickable */}
        <div className="flex flex-wrap items-center gap-1.5">
          {CONFIG_OPTIONS.map((cfg) => {
            const isSelected = selectedConfig === cfg;
            return (
              <button
                key={cfg}
                onClick={() => onConfigChange(cfg)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-md shadow-emerald-500/20 scale-[1.02]'
                    : 'bg-slate-950/80 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                {cfg === 'All' ? 'सभी कॉन्फ़िग' : cfg}
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 3: Availability Selector (मकान उपलब्ध है / मकान बुक हो चुका) */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300">उपलब्धता स्थिति (Availability):</span>
          <div className="inline-flex p-1 rounded-xl bg-slate-950 border border-slate-800 gap-1">
            {/* All */}
            <button
              type="button"
              onClick={() => onAvailabilityFilterChange('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                availabilityFilter === 'all'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              सभी ({availableCount + bookedCount})
            </button>

            {/* Available */}
            <button
              type="button"
              onClick={() => onAvailabilityFilterChange('available')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                availabilityFilter === 'available'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>मकान उपलब्ध है</span>
              <span className="text-[11px] opacity-80">({availableCount})</span>
            </button>

            {/* Booked */}
            <button
              type="button"
              onClick={() => onAvailabilityFilterChange('booked')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                availabilityFilter === 'booked'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-rose-400'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>मकान बुक हो चुका</span>
              <span className="text-[11px] opacity-80">({bookedCount})</span>
            </button>
          </div>
        </div>

        {availabilityFilter === 'booked' && (
          <div className="text-[11px] text-rose-300 bg-rose-950/80 border border-rose-500/40 px-2.5 py-1 rounded-lg flex items-center gap-1.5 animate-pulse">
            <span>🔒 बुक हो चुके मकानों के मकान नं. व मोबाइल नंबर सुरक्षा कारणों से हाइड हैं।</span>
          </div>
        )}
      </div>

      {/* Active Search/Filter Badges summary */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
        <div>
          <span>परिणाम: </span>
          <span className="font-semibold text-emerald-400">{totalFilteredCount} लिस्टिंग मिली</span>
          {selectedCategory !== 'All' && (
            <span className="ml-2 text-slate-400">
              श्रेणी: <span className="text-amber-400 font-bold">{selectedCategory}</span>
            </span>
          )}
          {searchTerm && (
            <span className="ml-2 text-slate-400">
              खोज: <span className="text-slate-200 font-medium">"{searchTerm}"</span>
            </span>
          )}
        </div>

        <div className="text-[11px] text-slate-500">
          * कार्ड पर सीधे व्हाट्सएप चैट या शेयर बटन दबाकर तुरंत बात करें
        </div>
      </div>
    </div>
  );
};
