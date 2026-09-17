import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  ActivePage, Booking, Tour, AirportRoute, Airport, 
  TaxiMasterArea, TaxiMasterDestination, TaxiPricingRule, TaxiAreaRule, TaxiImportHistory,
  OperationalCity, RentalLocation, RentalVehicle, RentalCategory, RentalAddon, ZonePricing,
  Review
} from './types';
import { TOURS, REVIEWS } from './data';
import { EXCHANGE_RATE_USD_TO_IDR, EXCHANGE_RATE_USD_TO_CNY, ENABLE_FOREIGN_CURRENCIES } from './utils/pricingUtils';

interface AppContextProps {
  activePage: ActivePage;
  setPage: (page: ActivePage) => void;
  currency: 'USD' | 'IDR' | 'CNY';
  setCurrency: (currency: 'USD' | 'IDR' | 'CNY') => void;
  isPrivacyOpen: boolean;
  setPrivacyOpen: (open: boolean) => void;
  isTermsOpen: boolean;
  setTermsOpen: (open: boolean) => void;
  isComingSoonOpen: boolean;
  setComingSoonOpen: (open: boolean) => void;
  comingSoonService: 'tours' | 'airport' | 'taxi' | null;
  setComingSoonService: (service: 'tours' | 'airport' | 'taxi' | null) => void;
  bookings: Booking[];
  refreshBookings: () => Promise<void>;
  addBooking: (booking: Omit<Booking, 'id' | 'bookingDate' | 'status'>) => Promise<Booking> | Booking;
  updateBookingStatus: (id: string, status: string, paymentStatus?: string) => Promise<void> | void;
  formatPrice: (usdPrice: number, idrPrice: number) => string;
  tours: Tour[];
  addTour: (tour: Tour) => Promise<void> | void;
  updateTour: (tour: Tour) => Promise<void> | void;
  deleteTour: (id: string) => Promise<void> | void;
  setTourStatus: (id: string, status: 'published' | 'draft' | 'unpublished') => Promise<void> | void;
  refreshTours: () => Promise<void>;
  schedules: any[];
  addSchedule: (schedule: any) => void;
  updateSchedule: (schedule: any) => void;
  deleteSchedule: (id: string) => void;
  logs: any[];
  addLog: (message: string, type?: 'tour' | 'rental' | 'taxi' | 'airport' | 'system') => void;
  searchParams: {
    destination?: string;
    date?: string;
    guests?: number;
    tourType?: string;
    airport?: string;
    pickupLocation?: string;
    pickupTime?: string;
    returnDate?: string;
    vehicleType?: string;
    withDriver?: boolean;
  };
  setSearchParams: (params: any) => void;
  maxBookingsPerDay: number;
  setMaxBookingsPerDay: (limit: number) => void;
  airportRoutes: AirportRoute[];
  setAirportRoutes: React.Dispatch<React.SetStateAction<AirportRoute[]>>;
  airports: Airport[];
  setAirports: React.Dispatch<React.SetStateAction<Airport[]>>;
  taxiMasterAreas: TaxiMasterArea[];
  setTaxiMasterAreas: React.Dispatch<React.SetStateAction<TaxiMasterArea[]>>;
  taxiMasterDestinations: TaxiMasterDestination[];
  setTaxiMasterDestinations: React.Dispatch<React.SetStateAction<TaxiMasterDestination[]>>;
  taxiPricingRules: TaxiPricingRule[];
  setTaxiPricingRules: React.Dispatch<React.SetStateAction<TaxiPricingRule[]>>;
  taxiAreaRules: TaxiAreaRule[];
  setTaxiAreaRules: React.Dispatch<React.SetStateAction<TaxiAreaRule[]>>;
  taxiImportHistory: TaxiImportHistory[];
  setTaxiImportHistory: React.Dispatch<React.SetStateAction<TaxiImportHistory[]>>;
  rentalCities: OperationalCity[];
  setRentalCities: React.Dispatch<React.SetStateAction<OperationalCity[]>>;
  rentalLocations: RentalLocation[];
  setRentalLocations: React.Dispatch<React.SetStateAction<RentalLocation[]>>;
  rentalVehicles: RentalVehicle[];
  setRentalVehicles: React.Dispatch<React.SetStateAction<RentalVehicle[]>>;
  rentalCategories: RentalCategory[];
  setRentalCategories: React.Dispatch<React.SetStateAction<RentalCategory[]>>;
  rentalAddons: RentalAddon[];
  setRentalAddons: React.Dispatch<React.SetStateAction<RentalAddon[]>>;
  rentalZonePricing: ZonePricing[];
  setRentalZonePricing: React.Dispatch<React.SetStateAction<ZonePricing[]>>;
  serviceLimits: {
    tour: number;
    airport: number;
    taxi: number;
    rental: number;
  };
  setServiceLimit: (type: 'tour' | 'airport' | 'taxi' | 'rental', limit: number) => void;
  reviews: Review[];
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
  addReview: (reviewData: Omit<Review, 'id' | 'date'>) => void;
  approveReview: (id: string) => void;
  rejectReview: (id: string) => void;
}


const AppContext = createContext<AppContextProps | undefined>(undefined);

// Clean Admin State migration: purge legacy dummy seeds
const CLEAN_STATE_KEY = 'sj_clean_state_v1';
if (typeof window !== 'undefined' && localStorage.getItem(CLEAN_STATE_KEY) !== 'true') {
  const dummyKeys = [
    'smartjourney_tours',
    'smartjourney_bookings',
    'smartjourney_reviews',
    'smartjourney_logs',
    'sj_airport_routes',
    'sj_taxi_master_areas',
    'sj_taxi_master_destinations',
    'sj_taxi_pricing_rules',
    'sj_taxi_area_rules',
    'sj_taxi_import_history',
    'sj_rental_cities',
    'sj_rental_locations',
    'sj_rental_categories_v3',
    'sj_rental_vehicles_v3',
    'sj_rental_addons',
    'sj_rental_zone_pricing',
    'sj_promo_coupons',
    'sj_finance_ledger',
    'sj_fleet_vehicles',
    'sj_driver_profiles',
    'sj_tour_guides',
    'sj_customer_profiles',
    'sj_custom_ledger_tours',
    'smartjourney_schedules'
  ];
  dummyKeys.forEach(k => {
    try { localStorage.removeItem(k); } catch(e){}
  });
  try { localStorage.setItem(CLEAN_STATE_KEY, 'true'); } catch(e){}
}

function getAdminHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined'
    ? (localStorage.getItem('smart_journey_admin_token') || localStorage.getItem('smartjourney_admin_token') || '')
    : '';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePage, setActivePageState] = useState<ActivePage>('home');
  const [currency, setCurrencyState] = useState<'USD' | 'IDR' | 'CNY'>(() => {
    // Tombol mata uang Dolar ($) dan Yen/Yuan (¥) sementara dimatikan (jangan dihapus)
    if (!ENABLE_FOREIGN_CURRENCIES) {
      try { localStorage.setItem('sj_currency', 'IDR'); } catch(e){}
      return 'IDR';
    }
    return (localStorage.getItem('sj_currency') as 'USD' | 'IDR' | 'CNY') || 'IDR';
  });

  const setCurrency = (curr: 'USD' | 'IDR' | 'CNY') => {
    // Jika mata uang asing dimatikan, cegah perubahan ke USD atau CNY
    if (!ENABLE_FOREIGN_CURRENCIES && curr !== 'IDR') {
      return;
    }
    setCurrencyState(curr);
    localStorage.setItem('sj_currency', curr);
  };
  const [isPrivacyOpen, setPrivacyOpen] = useState(false);
  const [isTermsOpen, setTermsOpen] = useState(false);
  const [isComingSoonOpen, setComingSoonOpen] = useState(false);
  const [comingSoonService, setComingSoonService] = useState<'tours' | 'airport' | 'taxi' | null>(null);
  const [maxBookingsPerDay, setMaxBookingsPerDayState] = useState<number>(() => {
    const stored = localStorage.getItem('smartjourney_max_bookings_per_day');
    return stored ? parseInt(stored, 10) : 5;
  });

  const setMaxBookingsPerDay = (limit: number) => {
    setMaxBookingsPerDayState(limit);
    localStorage.setItem('smartjourney_max_bookings_per_day', limit.toString());
  };

  const [serviceLimits, setServiceLimits] = useState<{
    tour: number;
    airport: number;
    taxi: number;
    rental: number;
  }>(() => {
    const stored = localStorage.getItem('smartjourney_service_limits');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return {
          tour: parsed.tour ?? 5,
          airport: parsed.airport ?? 5,
          taxi: parsed.taxi ?? 5,
          rental: parsed.rental ?? 5,
        };
      } catch (e) {
        console.error('Failed to parse service limits', e);
      }
    }
    return {
      tour: 5,
      airport: 5,
      taxi: 5,
      rental: 5,
    };
  });

  const setServiceLimit = (type: 'tour' | 'airport' | 'taxi' | 'rental', limit: number) => {
    setServiceLimits(prev => {
      const updated = { ...prev, [type]: limit };
      localStorage.setItem('smartjourney_service_limits', JSON.stringify(updated));
      return updated;
    });
  };

  const [reviews, setReviews] = useState<Review[]>(() => {
    const stored = localStorage.getItem('smartjourney_reviews');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse reviews', e);
      }
    }
    return [];
  });

  const addReview = (reviewData: Omit<Review, 'id' | 'date'>) => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const newReview: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      date: formattedDate,
      status: 'pending'
    };
    setReviews(prev => {
      const updated = [newReview, ...prev];
      localStorage.setItem('smartjourney_reviews', JSON.stringify(updated));
      return updated;
    });
  };

  const approveReview = (id: string) => {
    setReviews(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, status: 'approved' as const } : r);
      localStorage.setItem('smartjourney_reviews', JSON.stringify(updated));
      return updated;
    });
  };

  const rejectReview = (id: string) => {
    setReviews(prev => {
      const updated = prev.filter(r => r.id !== id);
      localStorage.setItem('smartjourney_reviews', JSON.stringify(updated));
      return updated;
    });
  };
  
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const stored = localStorage.getItem('smartjourney_bookings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('Failed to parse bookings', e);
      }
    }
    return [];
  });

  const [searchParams, setSearchParams] = useState<any>({});
  
  // Custom states for Admin Panel (Synchronized with Server-Side Authoritative Source)
  const [tours, setTours] = useState<Tour[]>(() => {
    const stored = localStorage.getItem('smartjourney_tours');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('Failed to parse tours from cache', e);
      }
    }
    return [];
  });

  // Server fetch and sync for Main Website Tours
  const refreshTours = useCallback(async () => {
    try {
      const res = await fetch('/api/main-tours?all=true');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          if (data.length > 0) {
            // Authoritative server data
            setTours(data);
            try {
              localStorage.setItem('smartjourney_tours', JSON.stringify(data));
            } catch (e) {
              console.warn('Could not cache tours to localStorage:', e);
            }
            return;
          } else {
            // Server returned empty list.
            // Check if local cache has tours that should be synced to persistent server storage
            const cached = localStorage.getItem('smartjourney_tours');
            if (cached) {
              try {
                const localParsed = JSON.parse(cached);
                if (Array.isArray(localParsed) && localParsed.length > 0) {
                  console.info(`[Sync] Migrating ${localParsed.length} cached tours to persistent server storage...`);
                  await fetch('/api/main-tours/sync-local', {
                    method: 'POST',
                    headers: getAdminHeaders(),
                    body: JSON.stringify({ localTours: localParsed })
                  });
                  const verifyRes = await fetch('/api/main-tours?all=true');
                  if (verifyRes.ok) {
                    const verified = await verifyRes.json();
                    if (Array.isArray(verified) && verified.length > 0) {
                      setTours(verified);
                      return;
                    }
                  }
                  setTours(localParsed);
                  return;
                }
              } catch (e) {
                console.warn('Error checking cached tours for sync:', e);
              }
            }
            setTours([]);
            try {
              localStorage.setItem('smartjourney_tours', JSON.stringify([]));
            } catch (e) {}
          }
        }
      }
    } catch (err) {
      console.warn('Could not fetch tours from server API, preserving existing tours state:', err);
    }
  }, []);

  // Server fetch for Bookings (authoritative source)
  const refreshBookings = useCallback(async () => {
    try {
      const res = await fetch('/api/bookings');
      if (res.ok) {
        const serverBookings = await res.json();
        if (Array.isArray(serverBookings)) {
          setBookings(serverBookings);
          try {
            localStorage.setItem('smartjourney_bookings', JSON.stringify(serverBookings));
          } catch (e) {}
        }
      }
    } catch (err) {
      console.warn('Could not fetch bookings from server API:', err);
    }
  }, []);

  useEffect(() => {
    refreshTours();
    refreshBookings();
  }, [refreshTours, refreshBookings]);

  const [schedules, setSchedules] = useState<any[]>(() => {
    const stored = localStorage.getItem('smartjourney_schedules');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('Failed to parse schedules', e);
      }
    }
    return [];
  });

  const [logs, setLogs] = useState<any[]>(() => {
    const stored = localStorage.getItem('smartjourney_logs');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse logs', e);
      }
    }
    return [];
  });

  const [airportRoutes, setAirportRoutes] = useState<AirportRoute[]>(() => {
    const saved = localStorage.getItem('sj_airport_routes');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [];
  });
  
  useEffect(() => {
    localStorage.setItem('sj_airport_routes', JSON.stringify(airportRoutes));
  }, [airportRoutes]);

  const [airports, setAirports] = useState<Airport[]>(() => {
    const saved = localStorage.getItem('sj_airports_list');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [
      { code: 'DPS', name: 'Ngurah Rai International Airport (DPS - Bali)', description: 'Bandara Internasional utama Bali di Tuban, Kuta. Melayani rute pariwisata premium internasional & domestik.', status: 'Active', surchargeUSD: 5, surchargeIDR: 75000 },
      { code: 'SUB', name: 'Juanda International Airport (SUB - Surabaya)', description: 'Bandara Internasional Jawa Timur berlokasi di Sidoarjo, melayani rute bisnis & wisata regional.', status: 'Active', surchargeUSD: 3, surchargeIDR: 45000 },
      { code: 'YIA', name: 'Yogyakarta International Airport (YIA)', description: 'Bandara megah modern di Kulon Progo, melayani pariwisata Candi Borobudur, Prambanan dan DIY Yogyakarta.', status: 'Active', surchargeUSD: 4, surchargeIDR: 60000 },
      { code: 'CGK', name: 'Soekarno-Hatta International Airport (CGK - Jakarta)', description: 'Bandara Internasional metropolitan tersibuk di Indonesia berlokasi di Tangerang, gerbang utama ibukota Jakarta.', status: 'Active', surchargeUSD: 5, surchargeIDR: 75000 }
    ];
  });

  useEffect(() => {
    localStorage.setItem('sj_airports_list', JSON.stringify(airports));
  }, [airports]);

  // Sync with URL hash

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.split('?')[0].replace(/^#\/?/, '');
      const validPages: ActivePage[] = ['home', 'tours', 'share-tour', 'airport', 'taxi', 'partnerships', 'contact', 'bookings', 'car-rental', 'about', 'admin'];
      if (validPages.includes(hash as ActivePage)) {
        setActivePageState(hash as ActivePage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '') {
        setActivePageState('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Run once on mount

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const setPage = (page: ActivePage) => {
    setActivePageState(page);
    window.location.hash = `#/${page}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addBooking = (bookingData: Omit<Booking, 'id' | 'bookingDate' | 'status'>): Booking => {
    const targetDate = bookingData.details?.date;
    // Private Trips (type === 'tour') are free from calendar batch/availability restrictions
    if (targetDate && bookingData.type !== 'tour') {
      const isBlocked = (schedules || []).some(s => s.date === targetDate && s.type === 'blocked');
      const confirmedCount = bookings.filter(b => 
        b.details && 
        b.details.date === targetDate && 
        b.type === bookingData.type &&
        (b.status === 'Confirmed' || b.status === 'Completed')
      ).length;
      
      if (isBlocked) {
        throw new Error('Maaf, tanggal ini telah ditutup oleh pihak operasional (Blackout Date).');
      }
      const currentLimit = serviceLimits[bookingData.type] ?? 5;
      if (confirmedCount >= currentLimit) {
        throw new Error(`Maaf, kuota pemesanan harian (${currentLimit} slot) untuk layanan ini pada tanggal ini telah penuh.`);
      }
    }

    const id = `SJ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const bookingDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const newBooking: Booking = {
      ...bookingData,
      id,
      bookingDate,
      status: 'Pending',
      paymentStatus: 'Pending'
    };

    const updated = [newBooking, ...bookings];
    setBookings(updated);
    localStorage.setItem('smartjourney_bookings', JSON.stringify(updated));
    addLog(`New booking ${id} received for ${bookingData.serviceName} (Status: Pending Payment)`);

    // Post to server DB for ArtoPay webhook tracking and persistent storage
    fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        bookingCode: id,
        bookingType: 'private',
        tourBookingType: 'private',
        type: bookingData.type,
        serviceName: bookingData.serviceName,
        departureDate: bookingData.details?.date || '',
        customerName: bookingData.customerName,
        fullName: bookingData.customerName,
        customerEmail: bookingData.customerEmail,
        email: bookingData.customerEmail,
        customerPhone: bookingData.customerPhone,
        phone: bookingData.customerPhone,
        totalPrice: bookingData.totalPrice,
        totalPriceIDR: bookingData.totalPriceIDR || bookingData.totalPrice,
        status: 'Pending',
        paymentStatus: 'Pending',
        details: bookingData.details || {}
      })
    }).catch(err => {
      console.warn('Server booking sync warning:', err);
    });

    return newBooking;
  };

  const updateBookingStatus = async (
    id: string, 
    status: string, 
    paymentStatus?: string
  ) => {
    const updated = bookings.map(b => {
      if (b.id === id || b.bookingCode === id) {
        return { 
          ...b, 
          status, 
          paymentStatus: paymentStatus !== undefined ? paymentStatus : b.paymentStatus 
        };
      }
      return b;
    });
    setBookings(updated);
    try { localStorage.setItem('smartjourney_bookings', JSON.stringify(updated)); } catch (e) {}
    addLog(`Booking ${id} status updated to ${status}${paymentStatus ? ` (${paymentStatus})` : ''}`);

    try {
      const payload: any = { status };
      if (paymentStatus !== undefined) payload.paymentStatus = paymentStatus;
      let res = await fetch(`/api/bookings/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        headers: getAdminHeaders(),
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        // Fallback to PUT /api/bookings/:id if needed
        res = await fetch(`/api/bookings/${encodeURIComponent(id)}`, {
          method: 'PUT',
          headers: getAdminHeaders(),
          body: JSON.stringify(payload)
        });
      }
      if (res.ok) {
        const serverUpdated = await res.json();
        setBookings(prev => prev.map(b => (b.id === serverUpdated.id || b.bookingCode === serverUpdated.bookingCode) ? { ...b, ...serverUpdated } : b));
      } else {
        console.error('Failed to persist booking status update to server:', await res.text());
      }
    } catch (err) {
      console.error('Error persisting booking status update to server:', err);
    }
  };

  // Tours actions with Server-Side Authoritative Persistence
  const addTour = async (tour: Tour) => {
    const tourWithStatus: Tour = {
      ...tour,
      id: tour.id && tour.id.trim() !== '' ? tour.id.trim() : `tour-${Date.now()}`,
      status: tour.status || 'published',
      createdAt: tour.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Optimistic UI state
    setTours(prev => {
      const next = [tourWithStatus, ...prev.filter(t => t.id !== tourWithStatus.id)];
      try { localStorage.setItem('smartjourney_tours', JSON.stringify(next)); } catch (e) {}
      return next;
    });
    addLog(`Paket tour baru dibuat: ${tourWithStatus.name} (${tourWithStatus.id})`);

    try {
      const res = await fetch('/api/main-tours', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify(tourWithStatus)
      });
      if (res.ok) {
        const saved: Tour = await res.json();
        setTours(prev => {
          const next = [saved, ...prev.filter(t => t.id !== saved.id)];
          try { localStorage.setItem('smartjourney_tours', JSON.stringify(next)); } catch (e) {}
          return next;
        });
      } else {
        console.error('Failed to persist tour to server database:', await res.text());
      }
    } catch (err) {
      console.error('Network error saving tour to server:', err);
    }
  };

  const updateTour = async (updatedTour: Tour) => {
    const tourWithTimestamp: Tour = {
      ...updatedTour,
      updatedAt: new Date().toISOString()
    };

    setTours(prev => {
      const next = prev.map(t => t.id === tourWithTimestamp.id ? tourWithTimestamp : t);
      try { localStorage.setItem('smartjourney_tours', JSON.stringify(next)); } catch (e) {}
      return next;
    });
    addLog(`Paket tour ${tourWithTimestamp.id} (${tourWithTimestamp.name}) diperbarui`);

    try {
      const res = await fetch(`/api/main-tours/${encodeURIComponent(tourWithTimestamp.id)}`, {
        method: 'PUT',
        headers: getAdminHeaders(),
        body: JSON.stringify(tourWithTimestamp)
      });
      if (res.ok) {
        const saved: Tour = await res.json();
        setTours(prev => {
          const next = prev.map(t => t.id === saved.id ? saved : t);
          try { localStorage.setItem('smartjourney_tours', JSON.stringify(next)); } catch (e) {}
          return next;
        });
      } else {
        console.error('Failed to update tour on server database:', await res.text());
      }
    } catch (err) {
      console.error('Network error updating tour on server:', err);
    }
  };

  const deleteTour = async (id: string) => {
    setTours(prev => {
      const next = prev.filter(t => t.id !== id);
      try { localStorage.setItem('smartjourney_tours', JSON.stringify(next)); } catch (e) {}
      return next;
    });
    addLog(`Paket tour ${id} dihapus dari inventaris`);

    try {
      const res = await fetch(`/api/main-tours/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: getAdminHeaders()
      });
      if (!res.ok) {
        console.error('Failed to delete tour from server database:', await res.text());
      }
    } catch (err) {
      console.error('Network error deleting tour from server:', err);
    }
  };

  const setTourStatus = async (id: string, status: 'published' | 'draft' | 'unpublished') => {
    const target = tours.find(t => t.id === id);
    if (!target) return;
    const updated: Tour = { ...target, status, updatedAt: new Date().toISOString() };
    await updateTour(updated);
  };

  // Schedules
  const addSchedule = (schedule: any) => {
    const newSchedule = { ...schedule, id: `sc-${Date.now()}` };
    const updated = [newSchedule, ...schedules];
    setSchedules(updated);
    localStorage.setItem('smartjourney_schedules', JSON.stringify(updated));
    addLog(`Added schedule rule: ${schedule.type} on ${schedule.date}`);
  };

  const updateSchedule = (updatedSchedule: any) => {
    const updated = schedules.map(s => s.id === updatedSchedule.id ? updatedSchedule : s);
    setSchedules(updated);
    localStorage.setItem('smartjourney_schedules', JSON.stringify(updated));
    addLog(`Updated schedule rule ${updatedSchedule.id}`);
  };

  const deleteSchedule = (id: string) => {
    const updated = schedules.filter(s => s.id !== id);
    setSchedules(updated);
    localStorage.setItem('smartjourney_schedules', JSON.stringify(updated));
    addLog(`Deleted schedule rule ${id}`);
  };

  // Logs
  const addLog = (event: string, type?: 'tour' | 'rental' | 'taxi' | 'airport' | 'system') => {
    const now = new Date();
    const time = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    // Auto-detect type if not provided
    let detectedType = type;
    if (!detectedType) {
      const ev = event.toLowerCase();
      if (ev.includes('tour') || ev.includes('wisata') || ev.includes('bromo') || ev.includes('katalog')) {
        detectedType = 'tour';
      } else if (ev.includes('rental') || ev.includes('sewa') || ev.includes('mobil') || ev.includes('fleet') || ev.includes('chauffeur')) {
        detectedType = 'rental';
      } else if (ev.includes('taxi') || ev.includes('taksi') || ev.includes('rute')) {
        detectedType = 'taxi';
      } else if (ev.includes('airport') || ev.includes('bandara') || ev.includes('jemput')) {
        detectedType = 'airport';
      } else {
        detectedType = 'system';
      }
    }

    const newLog = { time, event, type: detectedType };
    setLogs(prev => {
      const updated = [newLog, ...prev].slice(0, 100); // keep last 100 logs
      localStorage.setItem('smartjourney_logs', JSON.stringify(updated));
      return updated;
    });
  };

  const formatPrice = useCallback((usdPrice: number, idrPrice: number) => {
    if (currency === 'USD') {
      return `$${usdPrice}`;
    } else if (currency === 'CNY') {
      const cny = Math.round(usdPrice * EXCHANGE_RATE_USD_TO_CNY);
      return `¥${cny.toLocaleString('zh-CN')}`;
    } else {
      // Clean IDR formatting: Rp X.XXX.XXX (no confusing M suffix)
      const validIDR = idrPrice > 0 ? idrPrice : Math.round(usdPrice * EXCHANGE_RATE_USD_TO_IDR);
      return `IDR ${validIDR.toLocaleString('id-ID')}`;
    }
  }, [currency]);

  // --- TAXI DATABASE ENGINE (EXCEL-DRIVEN WORKFLOW) ---
  const [taxiMasterAreas, setTaxiMasterAreas] = useState<TaxiMasterArea[]>(() => {
    const saved = localStorage.getItem('sj_taxi_master_areas');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  const [taxiMasterDestinations, setTaxiMasterDestinations] = useState<TaxiMasterDestination[]>(() => {
    const saved = localStorage.getItem('sj_taxi_master_destinations');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  const [taxiPricingRules, setTaxiPricingRules] = useState<TaxiPricingRule[]>(() => {
    const saved = localStorage.getItem('sj_taxi_pricing_rules');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  const [taxiAreaRules, setTaxiAreaRules] = useState<TaxiAreaRule[]>(() => {
    const saved = localStorage.getItem('sj_taxi_area_rules');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  const [taxiImportHistory, setTaxiImportHistory] = useState<TaxiImportHistory[]>(() => {
    const saved = localStorage.getItem('sj_taxi_import_history');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  // --- CAR RENTAL MANAGEMENT STATES ---
  const [rentalCities, setRentalCities] = useState<OperationalCity[]>(() => {
    const saved = localStorage.getItem('sj_rental_cities');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  const [rentalLocations, setRentalLocations] = useState<RentalLocation[]>(() => {
    const saved = localStorage.getItem('sj_rental_locations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });

  const [rentalCategories, setRentalCategories] = useState<RentalCategory[]>(() => {
    const saved = localStorage.getItem('sj_rental_categories_v3');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  const [rentalVehicles, setRentalVehicles] = useState<RentalVehicle[]>(() => {
    const saved = localStorage.getItem('sj_rental_vehicles_v3');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  const [rentalAddons, setRentalAddons] = useState<RentalAddon[]>(() => {
    const saved = localStorage.getItem('sj_rental_addons');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  const [rentalZonePricing, setRentalZonePricing] = useState<ZonePricing[]>(() => {
    const saved = localStorage.getItem('sj_rental_zone_pricing');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('sj_rental_cities', JSON.stringify(rentalCities));
  }, [rentalCities]);

  useEffect(() => {
    localStorage.setItem('sj_rental_locations', JSON.stringify(rentalLocations));
  }, [rentalLocations]);

  useEffect(() => {
    localStorage.setItem('sj_rental_categories_v3', JSON.stringify(rentalCategories));
  }, [rentalCategories]);

  useEffect(() => {
    localStorage.setItem('sj_rental_vehicles_v3', JSON.stringify(rentalVehicles));
  }, [rentalVehicles]);

  useEffect(() => {
    localStorage.setItem('sj_rental_addons', JSON.stringify(rentalAddons));
  }, [rentalAddons]);

  useEffect(() => {
    localStorage.setItem('sj_rental_zone_pricing', JSON.stringify(rentalZonePricing));
  }, [rentalZonePricing]);

  useEffect(() => {
    localStorage.setItem('sj_taxi_master_areas', JSON.stringify(taxiMasterAreas));
  }, [taxiMasterAreas]);

  useEffect(() => {
    localStorage.setItem('sj_taxi_master_destinations', JSON.stringify(taxiMasterDestinations));
  }, [taxiMasterDestinations]);

  useEffect(() => {
    localStorage.setItem('sj_taxi_pricing_rules', JSON.stringify(taxiPricingRules));
  }, [taxiPricingRules]);

  useEffect(() => {
    localStorage.setItem('sj_taxi_area_rules', JSON.stringify(taxiAreaRules));
  }, [taxiAreaRules]);

  useEffect(() => {
    localStorage.setItem('sj_taxi_import_history', JSON.stringify(taxiImportHistory));
  }, [taxiImportHistory]);

  return (
    <AppContext.Provider
      value={{
        activePage,
        setPage,
        currency,
        setCurrency,
        isPrivacyOpen,
        setPrivacyOpen,
        isTermsOpen,
        setTermsOpen,
        isComingSoonOpen,
        setComingSoonOpen,
        comingSoonService,
        setComingSoonService,
        bookings,
        refreshBookings,
        addBooking,
        updateBookingStatus,
        formatPrice,
        tours,
        addTour,
        updateTour,
        deleteTour,
        setTourStatus,
        refreshTours,
        schedules,
        addSchedule,
        updateSchedule,
        deleteSchedule,
        logs,
        addLog,
        searchParams,
        setSearchParams,
        maxBookingsPerDay,
        setMaxBookingsPerDay,
        airportRoutes,
        setAirportRoutes,
        airports,
        setAirports,
        taxiMasterAreas,
        setTaxiMasterAreas,
        taxiMasterDestinations,
        setTaxiMasterDestinations,
        taxiPricingRules,
        setTaxiPricingRules,
        taxiAreaRules,
        setTaxiAreaRules,
        taxiImportHistory,
        setTaxiImportHistory,
        rentalCities,
        setRentalCities,
        rentalLocations,
        setRentalLocations,
        rentalVehicles,
        setRentalVehicles,
        rentalCategories,
        setRentalCategories,
        rentalAddons,
        setRentalAddons,
        rentalZonePricing,
        setRentalZonePricing,
        serviceLimits,
        setServiceLimit,
        reviews,
        setReviews,
        addReview,
        approveReview,
        rejectReview
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
