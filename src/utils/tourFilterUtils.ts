export interface TourLike {
  days?: number;
  nights?: number;
  duration?: string;
  category?: string;
  experienceCategory?: string;
}

export interface DurationFilterOption {
  id: string; // 'all', '1', '2', '3', '4', '5', '6', '7', '8+'
  label: string;
  labelId: string;
  labelZh: string;
  days: number | null;
}

export const DURATION_FILTERS: DurationFilterOption[] = [
  { id: 'all', label: 'All Trips', labelId: 'Semua Durasi', labelZh: '全部行程', days: null },
  { id: '1', label: '1 Day', labelId: '1 Hari', labelZh: '1天', days: 1 },
  { id: '2', label: '2 Days', labelId: '2 Hari', labelZh: '2天', days: 2 },
  { id: '3', label: '3 Days', labelId: '3 Hari', labelZh: '3天', days: 3 },
  { id: '4', label: '4 Days', labelId: '4 Hari', labelZh: '4天', days: 4 },
  { id: '5', label: '5 Days', labelId: '5 Hari', labelZh: '5天', days: 5 },
  { id: '6', label: '6 Days', labelId: '6 Hari', labelZh: '6天', days: 6 },
  { id: '7', label: '7 Days', labelId: '7 Hari', labelZh: '7天', days: 7 },
  { id: '8+', label: '8 Days+', labelId: '8+ Hari', labelZh: '8天及以上', days: 8 }
];

export interface ExperienceCategoryOption {
  id: string; // 'all', 'Adventure', 'Nature', 'Culture', 'City'
  label: string;
  labelId: string;
  labelZh: string;
}

export const EXPERIENCE_CATEGORIES: ExperienceCategoryOption[] = [
  { id: 'all', label: 'All', labelId: 'Semua', labelZh: '全部' },
  { id: 'Adventure', label: 'Adventure', labelId: 'Adventure', labelZh: '探险' },
  { id: 'Nature', label: 'Nature', labelId: 'Nature', labelZh: '自然' },
  { id: 'Culture', label: 'Culture', labelId: 'Culture', labelZh: '文化' },
  { id: 'City', label: 'City', labelId: 'City', labelZh: '城市' }
];

export function parseTourDays(tour: TourLike): number {
  if (typeof tour.days === 'number' && !isNaN(tour.days) && tour.days > 0) {
    return Math.floor(tour.days);
  }
  if (tour.duration) {
    // E.g. "10 Days", "3 Days 2 Nights", "2D1N", "1D", "3 Hari", "1 Day", "12 Jam"
    const dMatch = tour.duration.match(/(\d+)\s*(?:d\b|days?|hari)/i);
    if (dMatch) return parseInt(dMatch[1], 10);
    const numOnly = tour.duration.match(/^(\d+)/);
    if (numOnly) return parseInt(numOnly[1], 10);
  }
  return 1;
}

export function parseTourNights(tour: TourLike): number {
  if (typeof tour.nights === 'number' && !isNaN(tour.nights) && tour.nights >= 0) {
    return Math.floor(tour.nights);
  }
  if (tour.duration) {
    const nMatch = tour.duration.match(/(\d+)\s*(?:n\b|nights?|malam)/i);
    if (nMatch) return parseInt(nMatch[1], 10);
  }
  const days = parseTourDays(tour);
  return Math.max(0, days - 1);
}

export function formatTourDuration(days: number, nights?: number): string {
  const safeDays = Math.max(1, Math.floor(days || 1));
  const safeNights = typeof nights === 'number' && !isNaN(nights) && nights >= 0
    ? Math.floor(nights)
    : Math.max(0, safeDays - 1);

  if (safeNights === 0) {
    return safeDays === 1 ? '1 Day' : `${safeDays} Days`;
  }
  return `${safeDays} Day${safeDays > 1 ? 's' : ''} / ${safeNights} Night${safeNights > 1 ? 's' : ''}`;
}

export function getTourExperienceCategory(tour: TourLike): string {
  return (tour.experienceCategory || tour.category || 'Adventure').trim();
}

export function matchesTourFilter(
  tour: TourLike,
  selectedDuration: string, // 'all', '1', '2', '3', '4', '5', '6', '7', '8+'
  selectedExperience: string // 'all', 'Adventure', 'Nature', 'Culture', 'City'
): boolean {
  // 1. DURATION FILTER
  const days = parseTourDays(tour);
  let matchesDur = true;
  if (selectedDuration !== 'all') {
    if (selectedDuration === '8+') {
      matchesDur = days >= 8;
    } else {
      matchesDur = days === parseInt(selectedDuration, 10);
    }
  }

  // 2. EXPERIENCE CATEGORY FILTER
  const cat = getTourExperienceCategory(tour).toLowerCase();
  let matchesExp = true;
  if (selectedExperience !== 'all') {
    matchesExp = cat === selectedExperience.toLowerCase();
  }

  // AND filtering
  return matchesDur && matchesExp;
}

export function getFilterSummaryTitle(
  selectedDuration: string,
  selectedExperience: string,
  totalCount: number,
  language: string = 'en'
): string {
  const isAllDur = selectedDuration === 'all';
  const isAllExp = selectedExperience === 'all';

  let durStr = '';
  if (!isAllDur) {
    durStr = selectedDuration === '8+' ? '8+ Day' : `${selectedDuration}-Day`;
  }

  let expStr = '';
  if (!isAllExp) {
    expStr = selectedExperience;
  }

  if (isAllDur && isAllExp) {
    if (language === 'id') return `Menampilkan Semua Paket Wisata (${totalCount})`;
    if (language === 'zh') return `显示全部行程 (${totalCount})`;
    return `Showing All Trips (${totalCount})`;
  }

  if (!isAllDur && !isAllExp) {
    if (language === 'id') return `Menampilkan Paket Wisata ${durStr} ${expStr} (${totalCount})`;
    if (language === 'zh') return `显示 ${durStr} ${expStr} 行程 (${totalCount})`;
    return `Showing ${durStr} ${expStr} Trips (${totalCount})`;
  }

  if (!isAllDur) {
    if (language === 'id') return `Menampilkan Paket Wisata ${durStr} (${totalCount})`;
    if (language === 'zh') return `显示 ${durStr} 行程 (${totalCount})`;
    return `Showing ${durStr} Trips (${totalCount})`;
  }

  if (language === 'id') return `Menampilkan Paket Wisata ${expStr} (${totalCount})`;
  if (language === 'zh') return `显示 ${expStr} 行程 (${totalCount})`;
  return `Showing ${expStr} Trips (${totalCount})`;
}
