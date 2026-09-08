import React from 'react';
import { 
  DURATION_FILTERS, 
  EXPERIENCE_CATEGORIES, 
  getFilterSummaryTitle 
} from '../utils/tourFilterUtils';
import { Clock, Compass, RotateCcw, Sparkles } from 'lucide-react';
import { useLanguageCurrency } from '../sharetour/LanguageCurrencyContext';

interface TourFilterBarProps {
  selectedDuration: string;
  onSelectDuration: (id: string) => void;
  selectedExperience: string;
  onSelectExperience: (id: string) => void;
  onResetFilters: () => void;
  totalFilteredCount: number;
  totalAvailableCount: number;
  className?: string;
  compact?: boolean;
}

export default function TourFilterBar({
  selectedDuration,
  onSelectDuration,
  selectedExperience,
  onSelectExperience,
  onResetFilters,
  totalFilteredCount,
  totalAvailableCount,
  className = '',
  compact = false
}: TourFilterBarProps) {
  const { language } = useLanguageCurrency();

  const isFiltered = selectedDuration !== 'all' || selectedExperience !== 'all';
  const summaryTitle = getFilterSummaryTitle(
    selectedDuration, 
    selectedExperience, 
    totalFilteredCount, 
    language
  );

  return (
    <section 
      id="find-your-perfect-trip"
      aria-label="Tour Filters" 
      className={`bg-white border border-neutral-200/90 rounded-3xl p-5 sm:p-7 shadow-sm transition-all ${className}`}
    >
      {/* Section Header */}
      {!compact && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-black uppercase tracking-widest text-amber-600 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                <Sparkles className="w-3 h-3 text-amber-500" />
                {language === 'zh' ? '智能行程筛选' : language === 'id' ? 'Saring Petualangan' : 'Smart Trip Finder'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
              Find Your Perfect Trip
            </h2>
            <p className="text-xs text-neutral-500 font-medium mt-0.5">
              {language === 'zh' 
                ? '自由组合行程天数与旅行体验，发现最契合您的专属探索路线。'
                : language === 'id'
                ? 'Kombinasikan durasi hari dan kategori pengalaman wisata terbaik untuk perjalanan Anda.'
                : 'Combine trip duration with your preferred travel experience to discover the ideal itinerary.'}
            </p>
          </div>

          {isFiltered && (
            <button
              onClick={onResetFilters}
              className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-amber-600 bg-neutral-100 hover:bg-amber-50 border border-neutral-200 hover:border-amber-300 px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
              title="Clear all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'zh' ? '重置筛选' : language === 'id' ? 'Reset Filter' : 'Clear Filters'}</span>
            </button>
          )}
        </div>
      )}

      <div className="space-y-5 pt-4">
        {/* GROUP 1: DURATION */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-mono font-black uppercase tracking-wider text-neutral-600 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>{language === 'id' ? 'DURASI PERJALANAN (DURATION)' : language === 'zh' ? '行程天数 (DURATION)' : 'DURATION'}</span>
            </label>
            {selectedDuration !== 'all' && (
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                {DURATION_FILTERS.find(d => d.id === selectedDuration)?.label}
              </span>
            )}
          </div>

          {/* Duration Buttons with smooth horizontal scroll on mobile */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
            {DURATION_FILTERS.map((item) => {
              const isActive = selectedDuration === item.id;
              const displayLabel = language === 'id' ? item.labelId : language === 'zh' ? item.labelZh : item.label;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectDuration(item.id)}
                  className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 cursor-pointer border select-none ${
                    isActive
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-md font-extrabold scale-[1.02]'
                      : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200/80 hover:border-neutral-300'
                  }`}
                >
                  {displayLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* GROUP 2: EXPERIENCE CATEGORY */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-mono font-black uppercase tracking-wider text-neutral-600 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-amber-600" />
              <span>{language === 'id' ? 'KATEGORI PENGALAMAN (EXPERIENCE)' : language === 'zh' ? '体验类型 (EXPERIENCE)' : 'EXPERIENCE'}</span>
            </label>
            {selectedExperience !== 'all' && (
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                {selectedExperience}
              </span>
            )}
          </div>

          {/* Experience Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
            {EXPERIENCE_CATEGORIES.map((item) => {
              const isActive = selectedExperience === item.id;
              const displayLabel = language === 'id' ? item.labelId : language === 'zh' ? item.labelZh : item.label;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectExperience(item.id)}
                  className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 cursor-pointer border select-none ${
                    isActive
                      ? 'bg-amber-500 text-neutral-950 border-amber-500 shadow-md shadow-amber-500/20 font-extrabold scale-[1.02]'
                      : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200/80 hover:border-neutral-300'
                  }`}
                >
                  {displayLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Filter Summary Bar */}
        <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="font-bold text-neutral-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{summaryTitle}</span>
          </div>

          {isFiltered && (
            <div className="text-[11px] text-neutral-400 font-medium">
              {totalFilteredCount} of {totalAvailableCount} trips
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
