import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { TOURS } from '../data';
import { 
  ArrowLeft, Calendar, Clock, Check, X, ChevronDown, ChevronUp, Star, MapPin, 
  Users, User, Car, Plane, Route, ShieldCheck, Info, Compass, Gift, AlertTriangle, ArrowRight,
  Coffee, Sunrise, Utensils, Bed, Sparkles, Lock, Unlock, Maximize2, Eye, Minimize2, ChevronLeft, ChevronRight, Image as ImageIcon, Globe
} from 'lucide-react';
import CheckoutModal from '../components/CheckoutModal';
import BookingForm from '../sharetour/components/BookingForm';
import BookingSuccess from '../sharetour/components/BookingSuccess';
import { Trip, Batch, Booking } from '../sharetour/types';
import { motion, AnimatePresence } from 'motion/react';
import CustomerReviewsSection from '../components/CustomerReviewsSection';
import Breadcrumbs from '../components/Breadcrumbs';
import { trackTourDetailView, trackBookNowClick } from '../lib/analytics';
import { calculatePrivateTourPricing, EXCHANGE_RATE_USD_TO_IDR } from '../utils/pricingUtils';

interface TourDetailViewProps {
  tourId: string;
  onBack: () => void;
}

// Activity data schema
interface ActivityItem {
  time: string;
  title: string;
  desc: string;
  iconType: 'pickup' | 'jeep' | 'sunrise' | 'trek' | 'food' | 'volcano' | 'waterfall' | 'rest' | 'hotel' | 'transfer' | 'city' | 'beach' | 'boat';
}

interface DayItinerary {
  dayNum: number;
  dayTitle: string;
  activities: ActivityItem[];
}

// Fallback rich details schema
const DEFAULT_RICH_DATA = {
  gallery: [] as string[],
  includes: [
    'Private air-conditioned premium MPV with professional driver',
    'All-inclusive fuel, toll tickets, and parking fees',
    'Comprehensive national park admission tickets & permits',
    'Licensed local bilingual guide for full depth sharing',
    'Premium lunch and bottled mineral water replenishment'
  ],
  excludes: [
    'Personal purchases, souvenirs, and extra meals',
    'Personal travel insurance',
    'Optional gratuities/tips for the local service crew'
  ],
  whatToBring: [
    'Comfortable casual clothing and hiking shoes with good grip',
    'Warm jacket or layered clothing (temperatures can be cold)',
    'Waterproof dry-bag / protective case for cameras & phones',
    'High SPF sunscreen, sunglasses, and protective hat',
    'Personal identification cards and pocket cash'
  ],
  faqs: [
    { q: 'Bagaimana penyesuaian jadwal penjemputan?', a: 'Jadwal penjemputan sangat fleksibel dan dapat disesuaikan dengan waktu kedatangan pesawat atau kereta api Anda.' },
    { q: 'Apakah semua tiket masuk sudah termasuk?', a: 'Ya, seluruh harga kami all-inclusive. Anda tidak perlu membayar tiket masuk lagi di lokasi.' }
  ],
  advertiseText: 'Pesan sekarang dan dapatkan layanan penjemputan bandara privat gratis!',
  promoCode: 'SMARTJOURNEY'
};

export default function TourDetailView({ tourId, onBack }: TourDetailViewProps) {
  const { formatPrice, setPage, setSearchParams, searchParams, tours, schedules, bookings, serviceLimits } = useApp();
  const tour = tours.find(t => t.id === tourId);

  useEffect(() => {
    if (tour) {
      trackTourDetailView(tour.name, tour.id, tour.category);
    }
  }, [tourId, tour?.name]);
  
  if (!tour) {
    return (
      <div className="pt-36 pb-24 text-center max-w-lg mx-auto space-y-4">
        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
        <h3 className="text-xl font-bold">Tour Tidak Ditemukan</h3>
        <button onClick={onBack} className="text-amber-500 font-bold hover:underline">
          Kembali ke Katalog
        </button>
      </div>
    );
  }

  // Get rich structured day-by-day itineraries dynamically
  const daysData = (() => {
    const itineraryArray = tour.itinerary || [];
    if (itineraryArray.length === 0) {
      return [{
        dayNum: 1,
        dayTitle: 'Jadwal Perjalanan',
        activities: [{
          time: '08:00',
          title: tour.name,
          desc: tour.description || 'Jadwal perjalanan privat terpadu.',
          iconType: 'pickup' as const
        }]
      }];
    }

    const hasStructuredItems = itineraryArray.some(item => item.startsWith('Day ') && item.includes('|'));
    
    if (hasStructuredItems) {
      // Map to intermediate activity items
      const intermediateItems = itineraryArray.map((item, idx) => {
        if (item.startsWith('Day ') && item.includes('|')) {
          const parts = item.split('|').map(p => p.trim());
          const dayPart = parts[0];
          const time = parts[1] || '08:00';
          const title = parts[2] || '';
          const desc = parts[3] || '';
          
          const dayNumMatch = dayPart.match(/\d+/);
          const dayNum = dayNumMatch ? parseInt(dayNumMatch[0]) : 1;
          
          let dayTitle = '';
          if (dayPart.includes('-')) {
            dayTitle = dayPart.substring(dayPart.indexOf('-') + 1).trim();
          }
          
          return {
            day: dayNum,
            dayTitle: dayTitle || `Agenda Hari Ke-${dayNum}`,
            time,
            title,
            desc,
            iconType: (idx === 0 ? 'pickup' : idx === itineraryArray.length - 1 ? 'transfer' : 'trek') as any
          };
        } else {
          // Legacy format: "08:00 - Title, Description"
          const dividerIdx = item.indexOf('-');
          const time = dividerIdx !== -1 ? item.substring(0, dividerIdx).trim() : '08:00';
          const activity = dividerIdx !== -1 ? item.substring(dividerIdx + 1).trim() : item;
          return {
            day: 1,
            dayTitle: 'Full Day Expedition',
            time,
            title: activity.split(',')[0].trim(),
            desc: activity,
            iconType: (idx === 0 ? 'pickup' : idx === itineraryArray.length - 1 ? 'transfer' : 'trek') as any
          };
        }
      });

      // Group by Day
      const dayNums = (Array.from(new Set(intermediateItems.map(item => item.day))) as number[]).sort((a, b) => a - b);
      return dayNums.map(dayNum => {
        const itemsForDay = intermediateItems.filter(item => item.day === dayNum);
        const dayTitle = itemsForDay[0]?.dayTitle || `Agenda Hari Ke-${dayNum}`;
        return {
          dayNum,
          dayTitle,
          activities: itemsForDay.map(item => ({
            time: item.time,
            title: item.title,
            desc: item.desc,
            iconType: item.iconType
          }))
        };
      });
    }

    return [
      {
        dayNum: 1,
        dayTitle: 'Jadwal Perjalanan',
        activities: itineraryArray.map((item, idx) => {
          const dividerIdx = item.indexOf('-');
          const time = dividerIdx !== -1 ? item.substring(0, dividerIdx).trim() : '08:00';
          const activity = dividerIdx !== -1 ? item.substring(dividerIdx + 1).trim() : item;
          return {
            time,
            title: activity.split(',')[0].trim(),
            desc: activity,
            iconType: (idx === 0 ? 'pickup' : idx === itineraryArray.length - 1 ? 'transfer' : 'trek') as any
          };
        })
      }
    ];
  })();

  const richData = {
    ...DEFAULT_RICH_DATA,
    includes: tour.includes && tour.includes.length > 0 ? tour.includes : DEFAULT_RICH_DATA.includes,
    excludes: tour.excludes && tour.excludes.length > 0 ? tour.excludes : DEFAULT_RICH_DATA.excludes,
    gallery: tour.gallery && tour.gallery.length > 0 ? tour.gallery : (tour.image ? [tour.image] : []),
    whatToBring: tour.whatToBring && tour.whatToBring.length > 0 ? tour.whatToBring : DEFAULT_RICH_DATA.whatToBring
  };
  const [activeImage, setActiveImage] = useState<string>(tour.image);
  const [imageDisplayMode, setImageDisplayMode] = useState<'cover' | 'contain'>('cover');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [isAvailabilitySheetOpen, setIsAvailabilitySheetOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('01:00 AM');
  const [guestCount, setGuestCount] = useState<number>(2);
  const [selectedTierId, setSelectedTierId] = useState<'WNI' | 'WNA_CHINA' | 'WNA_EUROPE' | ''>('WNI');
  
  // Calendar month & year navigation state - defaults to current date
  const [calendarYear, setCalendarYear] = useState<number>(() => new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState<number>(() => new Date().getMonth()); // current month (0-indexed)

  // Tab control for the Day-by-Day structured itinerary
  const [selectedDayTab, setSelectedDayTab] = useState<number>(1);

  // Sync activeImage & Reset tabs if tour changes
  useEffect(() => {
    setActiveImage(tour.image);
    setSelectedDayTab(1);
    setSelectedTierId('WNI');
    setSelectedDate('');
    setSelectedTime('01:00 AM');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [tourId]);

  const currentMultiplier = React.useMemo(() => {
    if (!selectedDate) return 1.0;
    const peakSch = (schedules || []).find(s => s.date === selectedDate && s.type === 'peak');
    if (peakSch) {
      return peakSch.surcharge > 0 ? (1 + (peakSch.surcharge / 100)) : 1.15;
    }
    const dayOfWeek = new Date(selectedDate).getDay();
    return (dayOfWeek === 0 || dayOfWeek === 6) ? 1.15 : 1.0;
  }, [selectedDate, schedules]);

  const wniPricing = calculatePrivateTourPricing(tour, 'WNI', 1, currentMultiplier);
  const wnaChinaPricing = calculatePrivateTourPricing(tour, 'WNA_CHINA', 1, currentMultiplier);
  const wnaEuropePricing = calculatePrivateTourPricing(tour, 'WNA_EUROPE', 1, currentMultiplier);

  const packageTiers = [
    {
      id: 'WNI' as const,
      name: 'Paket Domestik (Indonesia)',
      description: 'Paket tur privat khusus Warga Negara Indonesia (KTP / Paspor RI).',
      priceUSD: wniPricing.unitPriceUSD,
      priceIDR: wniPricing.unitPriceIDR,
      features: [
        'Transportasi privat AC dingin (Avanza / Innova)',
        'Jeep 4x4 Privat khusus grup Anda',
        'Tiket masuk Taman Nasional tarif Domestik',
        'Driver & Tour Guide lokal profesional'
      ]
    },
    {
      id: 'WNA_CHINA' as const,
      name: 'Paket Foreigner (China)',
      description: 'Paket tur privat khusus wisatawan China Daratan (ID WeChat & RED ID).',
      priceUSD: wnaChinaPricing.unitPriceUSD,
      priceIDR: wnaChinaPricing.unitPriceIDR,
      features: [
        'Transportasi privat AC dingin (Avanza / Innova)',
        'Jeep 4x4 Privat khusus grup Anda',
        'Tiket masuk Taman Nasional tarif Wisatawan Mancanegara',
        'Layanan komunikasi & panduan via WeChat',
        'Bantuan registrasi & dokumentasi perjalanan'
      ]
    },
    {
      id: 'WNA_EUROPE' as const,
      name: 'Paket Foreigner (International)',
      description: 'Paket tur privat wisatawan mancanegara internasional (WhatsApp & Paspor).',
      priceUSD: wnaEuropePricing.unitPriceUSD,
      priceIDR: wnaEuropePricing.unitPriceIDR,
      features: [
        'Transportasi privat AC dingin (Avanza / Innova)',
        'Jeep 4x4 Privat khusus grup Anda',
        'Tiket masuk Taman Nasional tarif Wisatawan Mancanegara',
        'English-speaking professional tour guide',
        'Bantuan registrasi & layanan pelanggan WhatsApp'
      ]
    }
  ];

  const selectedTier = packageTiers.find(t => t.id === selectedTierId) || packageTiers[0];

  // Full-Page Checkout & Success Flow (Identical to Share Tour)
  if (createdBooking) {
    return (
      <div className="pt-28 pb-16 min-h-screen bg-[#F8FAF9]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <BookingSuccess
            booking={createdBooking}
            onNavigateToTrips={() => {
              setCreatedBooking(null);
              setIsBookingOpen(false);
              onBack();
            }}
            onNavigateToCheckStatus={(code, email) => {
              setCreatedBooking(null);
              setIsBookingOpen(false);
              setPage('bookings');
            }}
          />
        </div>
      </div>
    );
  }

  if (isBookingOpen) {
    const selectedPricing = calculatePrivateTourPricing(
      tour,
      selectedTierId,
      guestCount,
      currentMultiplier
    );

    const shareTrip: Trip = {
      id: tour.id,
      title: tour.name,
      slug: tour.id,
      location: tour.location,
      duration: tour.duration,
      description: tour.description,
      coverImage: tour.images && tour.images.length > 0 ? tour.images[0] : tour.image,
      included: tour.highlights || [],
      excluded: tour.exclusions || [],
      itinerary: [],
      startingPrice: selectedPricing.unitPriceUSD,
      wnaStartingPrice: selectedPricing.unitPriceUSD,
      price: selectedPricing.unitPriceUSD,
      wnaPrice: selectedPricing.unitPriceUSD,
      startingPriceIDR: selectedPricing.unitPriceIDR,
      wniPrice: selectedPricing.unitPriceIDR
    };

    const mappedNationality: 'WNI' | 'WNA_CHINA' | 'WNA_EUROPE' = 
      selectedTier.id === 'WNA_CHINA' ? 'WNA_CHINA' : 
      selectedTier.id === 'WNA_EUROPE' ? 'WNA_EUROPE' : 'WNI';

    return (
      <div className="pt-28 pb-16 min-h-screen bg-[#F8FAF9]">
        <BookingForm
          trip={shareTrip}
          batch={null}
          bookingType="private"
          tourBookingType="private"
          departureDate={selectedDate || new Date().toISOString().split('T')[0]}
          initialParticipants={guestCount}
          initialUnitPriceUSD={selectedPricing.unitPriceUSD}
          initialUnitPriceIDR={selectedPricing.unitPriceIDR}
          initialUnitPrice={selectedPricing.unitPriceUSD}
          surchargeMultiplier={currentMultiplier}
          nationalityType={mappedNationality}
          onBack={() => setIsBookingOpen(false)}
          onSuccess={(b) => {
            setCreatedBooking(b);
          }}
        />
      </div>
    );
  }

  const monthNamesIndo = [
    'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
    'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
  ];

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(prev => prev - 1);
    } else {
      setCalendarMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(prev => prev + 1);
    } else {
      setCalendarMonth(prev => prev + 1);
    }
  };

  // Generate date list for interactive departure calendar for selected year & month
  // NOTE: For Private Trips, date selection is 100% FREE (any day today or in the future is available daily)
  const getCalendarMonthData = () => {
    const firstDay = new Date(calendarYear, calendarMonth, 1);
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const startDayIndex = firstDay.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const monthStr = String(calendarMonth + 1).padStart(2, '0');
      const dayStr = String(i).padStart(2, '0');
      const dateStr = `${calendarYear}-${monthStr}-${dayStr}`;
      
      // Private trip: Any day from today onwards is fully available without batch or quota constraints
      const isPast = dateStr < todayStr;
      const isAvailable = !isPast;

      // Determine pricing multiplier (peak surcharge or weekend premium)
      const peakSch = (schedules || []).find(s => s.date === dateStr && s.type === 'peak');
      let priceMultiplier = 1.0;
      let note = '';
      
      if (peakSch) {
        priceMultiplier = peakSch.surcharge > 0 ? (1 + (peakSch.surcharge / 100)) : 1.15;
        note = peakSch.note || '';
      } else {
        const dayOfWeek = new Date(dateStr).getDay();
        priceMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 1.15 : 1.0;
      }

      days.push({
        dayNum: i,
        dateString: dateStr,
        isAvailable,
        isPast,
        priceMultiplier,
        note
      });
    }

    return { startDayIndex, daysInMonth, days, todayStr };
  };

  const calendarMonthData = getCalendarMonthData();

  // Lightbox Image Navigation helpers
  const activeImageIndex = richData.gallery.indexOf(activeImage) !== -1 
    ? richData.gallery.indexOf(activeImage) 
    : 0;

  const handlePrevImage = () => {
    const prevIdx = (activeImageIndex - 1 + richData.gallery.length) % richData.gallery.length;
    setActiveImage(richData.gallery[prevIdx]);
  };

  const handleNextImage = () => {
    const nextIdx = (activeImageIndex + 1) % richData.gallery.length;
    setActiveImage(richData.gallery[nextIdx]);
  };

  const handleBookNow = () => {
    setSearchParams({
      ...searchParams,
      date: selectedDate,
      guests: guestCount
    });
    setIsBookingOpen(true);
  };

  // Helper to render activity icons
  const renderActivityIcon = (type: string) => {
    switch (type) {
      case 'pickup':
        return <Car className="h-5 w-5 text-amber-600" />;
      case 'jeep':
        return <Car className="h-5 w-5 text-emerald-600 stroke-[2.5]" />;
      case 'sunrise':
        return <Sunrise className="h-5 w-5 text-amber-500" />;
      case 'trek':
        return <Compass className="h-5 w-5 text-blue-600" />;
      case 'food':
        return <Utensils className="h-5 w-5 text-amber-700" />;
      case 'volcano':
        return <Sparkles className="h-5 w-5 text-red-500" />;
      case 'waterfall':
        return <Sparkles className="h-5 w-5 text-teal-500" />;
      case 'hotel':
        return <Bed className="h-5 w-5 text-indigo-600" />;
      case 'city':
        return <MapPin className="h-5 w-5 text-purple-600" />;
      case 'beach':
        return <Sparkles className="h-5 w-5 text-yellow-500" />;
      case 'rest':
      default:
        return <Coffee className="h-5 w-5 text-neutral-600" />;
    }
  };

  return (
    <div className="bg-white text-neutral-850 min-h-screen pt-20 pb-20">

      {/* Top Breadcrumb & Return Navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-4 flex flex-wrap items-center justify-between gap-3">
        <Breadcrumbs items={[{ label: 'Private Tours', page: 'tours' }, { label: tour.name }]} />
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-neutral-600 hover:text-amber-600 transition-colors cursor-pointer group bg-neutral-100 hover:bg-neutral-200 px-3.5 py-1.5 rounded-lg border border-neutral-200/80"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span>Kembali ke Semua Paket Wisata</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Core Layout: Grid for main visual contents and booking card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* LEFT 7 COLUMNS: Gallery, Description, Itinerary, Inclusions/Exclusions, Maps, FAQ */}
          <div className="lg:col-span-7 space-y-12">
            
            {/* 1. Interactive Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-[16/10] w-full rounded-3xl overflow-hidden border border-neutral-200 shadow-md bg-neutral-950 flex items-center justify-center group/gallery">
                {/* Blurred backdrop to fill background beautifully in Fit mode */}
                <img
                  src={activeImage}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-105 pointer-events-none transition-all duration-300"
                  referrerPolicy="no-referrer"
                />

                {/* Main Foreground Image */}
                <img
                  src={activeImage}
                  alt={tour.name}
                  onClick={() => setIsLightboxOpen(true)}
                  className={`transition-all duration-500 cursor-zoom-in hover:scale-[1.01] ${
                    imageDisplayMode === 'contain'
                      ? 'w-full h-full object-contain max-h-full max-w-full p-2.5 relative z-10'
                      : 'w-full h-full object-cover'
                  }`}
                  referrerPolicy="no-referrer"
                />

                {/* Category Tag */}
                <span className="absolute top-4 left-4 z-20 bg-neutral-900/85 backdrop-blur-md text-amber-500 text-[10px] font-mono font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border border-amber-500/30">
                  {tour.category}
                </span>

                {/* Controls Bar */}
                <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                  {/* Mode Toggle Button */}
                  <button
                    type="button"
                    title={imageDisplayMode === 'contain' ? "Isi Penuh Layar (Fill Cover)" : "Suaikan Ukuran (Fit Contain)"}
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageDisplayMode(prev => prev === 'contain' ? 'cover' : 'contain');
                    }}
                    className="p-2 sm:p-2.5 rounded-xl bg-neutral-900/85 hover:bg-neutral-900 text-white border border-white/15 hover:border-white/30 backdrop-blur-md transition-all cursor-pointer shadow-md flex items-center justify-center"
                  >
                    {imageDisplayMode === 'contain' ? (
                      <Maximize2 className="h-4 w-4 text-amber-400" />
                    ) : (
                      <Minimize2 className="h-4 w-4 text-amber-400" />
                    )}
                  </button>

                  {/* Lightbox Trigger */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsLightboxOpen(true);
                    }}
                    className="p-2 sm:p-2.5 rounded-xl bg-neutral-900/85 hover:bg-neutral-900 text-white border border-white/15 hover:border-white/30 backdrop-blur-md transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5 text-xs font-bold"
                  >
                    <Eye className="h-4 w-4 text-amber-400" />
                    <span className="hidden sm:inline font-sans text-white text-[10px] tracking-wider uppercase font-black">Perbesar</span>
                  </button>
                </div>

                {/* Rating and Info Overlays */}
                <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
                  <div className="bg-neutral-900/85 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 border border-white/10 shadow">
                    <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                    <span className="font-bold">{tour.rating}</span>
                    <span className="text-neutral-300">({tour.reviewCount} ulasan)</span>
                  </div>

                  <span className="hidden sm:inline-block bg-neutral-900/75 backdrop-blur-sm text-neutral-300 px-2.5 py-1 rounded-lg text-[9px] font-mono tracking-wide uppercase">
                    Klik gambar untuk layar penuh
                  </span>
                </div>
              </div>

              {/* clickable Thumbnail Strip */}
              <div className="grid grid-cols-4 gap-3">
                {richData.gallery.map((img, i) => {
                  const isSelected = activeImage === img;
                  return (
                    <button
                      key={i}
                      onClick={() => setActiveImage(img)}
                      className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-amber-500 scale-[0.98] ring-4 ring-amber-500/20' 
                          : 'border-transparent hover:border-neutral-300'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Gallery view ${i + 1}`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-amber-500/15 flex items-center justify-center">
                          <span className="bg-amber-500 text-neutral-950 text-[8px] font-black uppercase font-mono px-2 py-0.5 rounded shadow-sm">
                            Aktif
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Title, Overview, Highlights */}
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-600 flex items-center gap-1.5 mb-2">
                  <MapPin className="h-4 w-4 text-amber-500" />
                  <span>East Java National Parks</span>
                </span>
                <h1 className="text-2xl sm:text-4xl font-black text-neutral-900 leading-tight">
                  {tour.name}
                </h1>
              </div>

              {/* Quick Spec Tags */}
              <div className="grid grid-cols-3 gap-3 border-t border-b border-neutral-100 py-4 text-center">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono text-neutral-400 block font-bold">Duration</span>
                  <div className="flex items-center justify-center gap-1 text-xs sm:text-sm font-extrabold text-neutral-800">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span>{tour.duration}</span>
                  </div>
                </div>
                <div className="space-y-1 border-l border-r border-neutral-100">
                  <span className="text-[10px] uppercase font-mono text-neutral-400 block font-bold">Group Type</span>
                  <div className="flex items-center justify-center gap-1 text-xs sm:text-sm font-extrabold text-neutral-800">
                    <Users className="h-4 w-4 text-amber-500" />
                    <span>Private &amp; Share</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono text-neutral-400 block font-bold">Transport</span>
                  <div className="flex items-center justify-center gap-1 text-xs sm:text-sm font-extrabold text-neutral-800">
                    <Car className="h-4 w-4 text-amber-500" />
                    <span>4x4 Jeep &amp; SUV</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h3 className="text-lg font-extrabold text-neutral-900">Trip Overview</h3>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                  {tour.description} Nikmati kemudahan berwisata tanpa repot memikirkan transportasi, perizinan, dan pemandu lokal. SmartJourney memastikan setiap aspek petualangan Anda terorganisir secara mulus dengan armada penjemputan premium ber-AC dingin, sopir berpengalaman, dan pemandu lokal berlisensi.
                </p>
              </div>

              {/* Key Highlights */}
              <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-amber-700 flex items-center gap-2">
                  <Compass className="h-4 w-4" />
                  <span>Highlight Perjalanan</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {tour.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <div className="p-0.5 bg-emerald-500/15 text-emerald-600 rounded mt-0.5">
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      </div>
                      <span className="text-xs font-bold text-neutral-700 leading-tight">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* 3. Daily Itinerary (Day-by-Day Interactive Tabs with Hourly Timeline) */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
                <div>
                  <h3 className="text-xl font-extrabold text-neutral-900 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-amber-500" />
                    <span>Rencana Perjalanan Detail</span>
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">Jadwal akurat per hari beserta aktivitas jam demi jam</p>
                </div>

                {/* Day Selectors */}
                {daysData.length > 1 && (
                  <div className="flex flex-wrap gap-1.5">
                    {daysData.map((d) => (
                      <button
                        key={d.dayNum}
                        onClick={() => setSelectedDayTab(d.dayNum)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                          selectedDayTab === d.dayNum
                            ? 'bg-amber-500 text-neutral-950 shadow'
                            : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                        }`}
                      >
                        Hari {d.dayNum}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Render Selected Day Timeline */}
              {daysData.map((day) => {
                if (day.dayNum !== selectedDayTab) return null;
                return (
                  <div key={day.dayNum} className="space-y-6 animate-fade-in">
                    
                    {/* Day Title bar */}
                    <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-2xl flex items-center gap-3">
                      <div className="bg-amber-500 text-neutral-950 font-mono font-black px-3 py-1 rounded-xl text-xs uppercase tracking-wider">
                        DAY 0{day.dayNum}
                      </div>
                      <span className="text-sm font-extrabold text-neutral-800 uppercase tracking-tight">
                        {day.dayTitle}
                      </span>
                    </div>

                    {/* Timeline List of Activities */}
                    <div className="relative border-l-2 border-amber-500/30 pl-6 space-y-8 ml-4">
                      {day.activities.map((act, actIdx) => (
                        <div key={actIdx} className="relative group">
                          {/* Circle pointer with custom icon */}
                          <div className="absolute -left-[37px] top-1 h-8 w-8 rounded-full bg-white border-2 border-amber-500 flex items-center justify-center shadow-sm z-10 transition-transform group-hover:scale-110">
                            {renderActivityIcon(act.iconType)}
                          </div>

                          <div className="space-y-1.5">
                            {/* Time badge */}
                            <span className="font-mono text-xs font-black text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/15">
                              {act.time}
                            </span>
                            
                            {/* Activity name */}
                            <h4 className="text-sm sm:text-base font-black text-neutral-900 pt-1 flex items-center gap-1.5">
                              <span>{act.title}</span>
                            </h4>

                            {/* Detailed explanation */}
                            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-medium">
                              {act.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                );
              })}
            </div>

            {/* 4. Include & Exclude Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              {/* Inclusions */}
              <div className="border border-neutral-200/80 rounded-2xl p-6 space-y-4">
                <h4 className="font-extrabold text-sm uppercase tracking-wider text-emerald-600 flex items-center gap-2">
                  <Check className="h-4.5 w-4.5" />
                  <span>Harga Sudah Termasuk</span>
                </h4>
                <ul className="space-y-3">
                  {richData.includes.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs font-semibold text-neutral-600 leading-relaxed">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Exclusions */}
              <div className="border border-neutral-200/80 rounded-2xl p-6 space-y-4">
                <h4 className="font-extrabold text-sm uppercase tracking-wider text-red-500 flex items-center gap-2">
                  <X className="h-4.5 w-4.5" />
                  <span>Tidak Termasuk</span>
                </h4>
                <ul className="space-y-3">
                  {richData.excludes.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs font-semibold text-neutral-600 leading-relaxed">
                      <X className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* What to Bring Section */}
            <div className="border border-neutral-200/80 rounded-2xl p-6 space-y-4 bg-amber-500/5">
              <h4 className="font-extrabold text-sm uppercase tracking-wider text-amber-600 flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5" />
                <span>Perlengkapan yang Harus Dibawa (What to Bring)</span>
              </h4>
              <p className="text-xs text-neutral-500">Persiapkan barang-barang berikut agar perjalanan Anda berjalan lancar dan nyaman:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {(richData.whatToBring || []).map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs font-semibold text-neutral-600 leading-relaxed">
                    <div className="h-5 w-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                      {idx + 1}
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>



            {/* 6. Collapse FAQ Accordions */}
            <div className="space-y-4">
              <h3 className="text-xl font-extrabold text-neutral-900">Pertanyaan yang Sering Diajukan (FAQ)</h3>
              <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-2xl bg-white overflow-hidden">
                {richData.faqs.map((item, idx) => {
                  const isOpen = expandedFaq === idx;
                  return (
                    <div key={idx} className="py-1">
                      <button
                        onClick={() => setExpandedFaq(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between text-left font-bold text-xs sm:text-sm text-neutral-800 hover:text-amber-600 transition-colors py-4 px-5 cursor-pointer"
                      >
                        <span>{item.q}</span>
                        {isOpen ? <ChevronUp className="h-4 w-4 text-amber-500" /> : <ChevronDown className="h-4 w-4 text-neutral-400" />}
                      </button>
                      
                      {isOpen && (
                        <div className="px-5 pb-4 text-xs sm:text-sm text-neutral-500 leading-relaxed">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT 5 COLUMNS: Departure Calendar & Sticky Secure Booking Widget */}
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-24">
            
            {/* Embedded Departure Calendar & Booking Widget - Private Trip (Free Calendar Selection) */}
            <div id="booking-section" className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-7 shadow-md space-y-6 text-left">
              
              <div className="space-y-1">
                <span className="text-[10px] bg-emerald-100 text-[#315B4F] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest font-mono inline-block border border-emerald-200">
                  ✨ PRIVATE TRIP — BEBAS PILIH TANGGAL
                </span>
                <h3 className="text-xl font-display font-bold text-gray-900">Pilih Tanggal &amp; Reservasi</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Khusus Private Trip, Anda bebas menentukan tanggal keberangkatan kapan saja (tersedia setiap hari).
                </p>
              </div>

              {/* Quick Direct Date Picker Input */}
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 font-mono flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#315B4F]" />
                  <span>Pilih Tanggal Keberangkatan Langsung:</span>
                </label>
                <input
                  type="date"
                  min={calendarMonthData.todayStr}
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    if (e.target.value) {
                      const d = new Date(e.target.value);
                      if (!isNaN(d.getTime())) {
                        setCalendarYear(d.getFullYear());
                        setCalendarMonth(d.getMonth());
                      }
                      if (!selectedTierId) {
                        setSelectedTierId('WNI');
                      }
                    }
                  }}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs sm:text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#315B4F]/30 focus:border-[#315B4F] transition-all cursor-pointer"
                />
              </div>

              {/* 1. Interactive Calendar Navigation */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-1 px-2.5 bg-white border border-gray-200 hover:bg-gray-100 rounded-lg text-sm font-bold text-gray-750 cursor-pointer flex items-center justify-center select-none"
                    title="Bulan Sebelumnya"
                  >
                    &lt;
                  </button>

                  <div className="text-center">
                    <span className="font-sans font-bold text-xs uppercase tracking-wider text-gray-800">
                      {monthNamesIndo[calendarMonth]} {calendarYear}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-1 px-2.5 bg-white border border-gray-200 hover:bg-gray-100 rounded-lg text-sm font-bold text-gray-750 cursor-pointer flex items-center justify-center select-none"
                    title="Bulan Berikutnya"
                  >
                    &gt;
                  </button>
                </div>

                {/* 7 Days Grid Labels */}
                <div className="grid grid-cols-7 gap-1 text-center font-mono font-bold text-[9px] text-[#315B4F] tracking-wider uppercase">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                    <div key={d} className="py-1">{d}</div>
                  ))}
                </div>

                {/* Month Days Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: calendarMonthData.startDayIndex }).map((_, i) => (
                    <div key={`empty-${i}`} className="p-1 text-transparent text-xs" />
                  ))}

                  {calendarMonthData.days.map(day => {
                    const isSelected = selectedDate === day.dateString;
                    return (
                      <button
                        key={day.dateString}
                        type="button"
                        disabled={!day.isAvailable}
                        onClick={() => {
                          setSelectedDate(day.dateString);
                          if (!selectedTierId) {
                            setSelectedTierId('WNI');
                          }
                        }}
                        className={`relative aspect-square rounded-xl text-xs font-mono font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${
                          !day.isAvailable
                            ? 'text-gray-300 cursor-not-allowed select-none opacity-40 bg-gray-50'
                            : isSelected
                            ? 'bg-[#315B4F] text-[#D6B16D] ring-4 ring-[#315B4F]/20 font-black shadow-md'
                            : 'bg-emerald-50 text-[#315B4F] hover:bg-emerald-100 border border-emerald-100 hover:scale-105'
                        }`}
                      >
                        <span>{day.dayNum}</span>
                        {isSelected && (
                          <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#D6B16D]" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Calendar Legends */}
                <div className="flex items-center justify-between text-[9px] text-gray-400 font-mono border-t border-gray-100 pt-2.5">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 bg-emerald-50 border border-emerald-100 rounded block" />
                    <span>Bebas Dipilih (Setiap Hari)</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 bg-[#315B4F] rounded block" />
                    <span>Tanggal Terpilih</span>
                  </span>
                </div>
              </div>

              {/* 2. Nationality Category Selection (Matching Share Tour) */}
              <div className={`p-4 rounded-2xl border space-y-3 transition-all ${
                selectedDate 
                  ? "bg-gradient-to-br from-emerald-50/80 to-[#315B4F]/5 border-[#315B4F]/25 shadow-sm ring-1 ring-[#315B4F]/10" 
                  : "bg-gray-50/80 border-gray-200"
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-[#315B4F]" />
                    <span>Kategori Tamu / Guest Category</span>
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono tracking-wider ${
                    selectedTierId === 'WNI' 
                      ? "bg-emerald-100 text-[#315B4F] border border-emerald-200" 
                      : selectedTierId === 'WNA_CHINA'
                        ? "bg-amber-100 text-amber-900 border border-amber-200"
                        : "bg-blue-100 text-blue-800 border border-blue-200"
                  }`}>
                    {selectedTierId === 'WNI' 
                      ? "🇮🇩 Domestic" 
                      : selectedTierId === 'WNA_CHINA' 
                        ? "🇨🇳 Foreigner (China)" 
                        : "🌐 Foreigner (International)"
                    }
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedTierId('WNI')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between select-none ${
                      selectedTierId === 'WNI'
                        ? "bg-[#315B4F] text-white border-[#315B4F] shadow-md ring-2 ring-[#315B4F]/20"
                        : "bg-white text-gray-700 border-gray-200 hover:border-emerald-300 hover:bg-gray-50/80"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm leading-none">🇮🇩</span>
                        <span className="font-extrabold text-xs">Domestic</span>
                      </div>
                      {selectedTierId === 'WNI' && <Check className="w-4 h-4 text-[#D6B16D]" />}
                    </div>
                    <div className="mt-1">
                      <span className={`block text-[10px] ${selectedTierId === 'WNI' ? "text-emerald-100" : "text-gray-400"}`}>
                        KTP / Paspor RI
                      </span>
                      <span className={`block text-[11px] font-bold font-mono ${selectedTierId === 'WNI' ? "text-[#D6B16D]" : "text-[#315B4F]"}`}>
                        {formatPrice(packageTiers[0].priceUSD, packageTiers[0].priceIDR)}
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (selectedTierId !== 'WNA_CHINA' && selectedTierId !== 'WNA_EUROPE') {
                        setSelectedTierId('WNA_CHINA');
                      }
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between select-none ${
                      (selectedTierId === 'WNA_CHINA' || selectedTierId === 'WNA_EUROPE')
                        ? "bg-[#315B4F] text-white border-[#315B4F] shadow-md ring-2 ring-[#315B4F]/20"
                        : "bg-white text-gray-700 border-gray-200 hover:border-emerald-300 hover:bg-gray-50/80"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Globe className={`w-3.5 h-3.5 ${(selectedTierId === 'WNA_CHINA' || selectedTierId === 'WNA_EUROPE') ? "text-[#D6B16D]" : "text-[#315B4F]"}`} />
                        <span className="font-extrabold text-xs">Foreigner</span>
                      </div>
                      {(selectedTierId === 'WNA_CHINA' || selectedTierId === 'WNA_EUROPE') && (
                        <Check className="w-4 h-4 text-[#D6B16D]" />
                      )}
                    </div>
                    <div className="mt-1">
                      <span className={`block text-[10px] ${(selectedTierId === 'WNA_CHINA' || selectedTierId === 'WNA_EUROPE') ? "text-emerald-100" : "text-gray-400"}`}>
                        Non-Indonesian
                      </span>
                      <span className={`block text-[11px] font-bold font-mono ${(selectedTierId === 'WNA_CHINA' || selectedTierId === 'WNA_EUROPE') ? "text-[#D6B16D]" : "text-[#315B4F]"}`}>
                        {formatPrice(packageTiers[1].priceUSD, packageTiers[1].priceIDR)}
                      </span>
                    </div>
                  </button>
                </div>

                {/* Subcategory toggle when Foreigner is selected */}
                {(selectedTierId === 'WNA_CHINA' || selectedTierId === 'WNA_EUROPE') && (
                  <div className="pt-2 border-t border-emerald-200/60 space-y-2 animate-fade-in">
                    <span className="text-[10px] font-bold text-gray-700 block">Pilih Asal Negara / Region:</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedTierId('WNA_CHINA')}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          selectedTierId === 'WNA_CHINA'
                            ? "bg-[#315B4F] text-white border-[#315B4F] shadow-sm ring-1 ring-[#315B4F]/30 font-bold"
                            : "bg-white text-gray-800 border-gray-200 hover:bg-emerald-50/60"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="flex items-center gap-1.5">
                            <span className="text-sm leading-none">🇨🇳</span>
                            <span>China</span>
                          </span>
                          {selectedTierId === 'WNA_CHINA' && <Check className="w-3.5 h-3.5 text-[#D6B16D]" />}
                        </div>
                        <span className={`text-[9px] mt-0.5 block ${selectedTierId === 'WNA_CHINA' ? "text-emerald-200" : "text-gray-400"}`}>
                          WeChat / RED ID
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedTierId('WNA_EUROPE')}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          selectedTierId === 'WNA_EUROPE'
                            ? "bg-[#315B4F] text-white border-[#315B4F] shadow-sm ring-1 ring-[#315B4F]/30 font-bold"
                            : "bg-white text-gray-800 border-gray-200 hover:bg-emerald-50/60"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-blue-500" />
                            <span>International</span>
                          </span>
                          {selectedTierId === 'WNA_EUROPE' && <Check className="w-3.5 h-3.5 text-[#D6B16D]" />}
                        </div>
                        <span className={`text-[9px] mt-0.5 block ${selectedTierId === 'WNA_EUROPE' ? "text-emerald-200" : "text-gray-400"}`}>
                          Global / WhatsApp
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Pax / Guest Counter */}
              <div className="bg-white border border-gray-200 p-3.5 rounded-2xl flex items-center justify-between shadow-2xs">
                <label className="text-xs font-bold text-gray-900 flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#315B4F]" />
                  <span>Jumlah Tamu / Pax</span>
                </label>
                <div className="bg-gray-100 border border-gray-200 p-1 rounded-xl flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setGuestCount(prev => Math.max(1, prev - 1))}
                    className="h-8 w-8 bg-white text-gray-800 hover:bg-gray-200 border border-gray-200 rounded-lg text-sm font-bold flex items-center justify-center transition-all cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-xs font-bold text-gray-900 min-w-[45px] text-center">{guestCount} Pax</span>
                  <button
                    type="button"
                    onClick={() => setGuestCount(prev => Math.min(25, prev + 1))}
                    className="h-8 w-8 bg-white text-gray-800 hover:bg-gray-200 border border-gray-200 rounded-lg text-sm font-bold flex items-center justify-center transition-all cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* 4. Dynamic Selected Summary & Action Readout (Same display requirements as Share Tour) */}
              {selectedDate && selectedTier ? (
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100/70 space-y-2.5 text-xs font-medium animate-fade-in">
                  <div className="flex items-center justify-between text-gray-500">
                    <span>Tanggal Terpilih</span>
                    <span className="font-bold text-[#315B4F] font-mono">{selectedDate}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-500">
                    <span>Kategori Tamu</span>
                    <span className={`font-mono font-bold rounded-md px-2 py-0.5 text-[10px] ${
                      selectedTierId === 'WNI' 
                        ? "text-[#315B4F] bg-emerald-50 border border-emerald-200" 
                        : selectedTierId === 'WNA_CHINA'
                          ? "text-amber-900 bg-amber-50 border border-amber-200"
                          : "text-blue-800 bg-blue-50 border border-blue-200"
                    }`}>
                      {selectedTierId === 'WNI' 
                        ? "🇮🇩 Domestic" 
                        : selectedTierId === 'WNA_CHINA' 
                          ? "🇨🇳 Foreigner (China)" 
                          : "🌐 Foreigner (International)"
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-gray-500">
                    <span>Jumlah Tamu</span>
                    <span className="font-mono font-bold text-gray-800">{guestCount} Pax</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-500">
                    <span>Tarif per Orang</span>
                    <span className="font-bold text-gray-800">{formatPrice(selectedTier.priceUSD, selectedTier.priceIDR)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-200 pt-2 font-bold">
                    <div className="flex flex-col">
                      <span className="text-gray-900 font-extrabold uppercase text-xs tracking-wider">TOTAL HARGA</span>
                      <span className="text-[10px] text-gray-400 font-mono">Total Booking ({guestCount} Pax)</span>
                    </div>
                    <span className="text-base sm:text-lg font-black text-[#315B4F]">
                      {formatPrice(selectedTier.priceUSD * guestCount, selectedTier.priceIDR * guestCount)}
                    </span>
                  </div>

                  {/* SINGLE PRIMARY PROCEED BUTTON */}
                  <div className="pt-2 space-y-2">
                    <button
                      id="btn-proceed-to-checkout"
                      type="button"
                      onClick={() => {
                        if (tour) {
                          trackBookNowClick(tour.name, 'Private Tour', tour.id);
                        }
                        setIsBookingOpen(true);
                      }}
                      className="w-full bg-[#315B4F] hover:bg-[#203c34] text-white font-display font-bold py-4 px-6 rounded-2xl text-xs sm:text-sm uppercase tracking-widest flex flex-col items-center justify-center gap-0.5 shadow-lg shadow-[#315B4F]/20 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-[#D6B16D]" />
                        <span className="text-xs sm:text-sm font-black">LANJUT KE PEMBAYARAN</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] text-amber-300 font-mono tracking-wider font-semibold">PROCEED TO CHECKOUT</span>
                    </button>

                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-center gap-3 text-[10px] text-gray-600 font-semibold flex-wrap">
                        <span className="flex items-center gap-1 text-emerald-700">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Garansi Batal Gratis 24 Jam</span>
                        </span>
                        <span className="flex items-center gap-1 text-emerald-700">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Tanpa Biaya Tersembunyi</span>
                        </span>
                        <span className="flex items-center gap-1 text-emerald-700">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>E-Voucher Instan</span>
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 font-medium text-center pt-1 border-t border-gray-200/80">
                        Butuh bantuan atau rute kustom? <a href="https://wa.me/6285212347289" target="_blank" rel="noopener noreferrer" className="text-[#315B4F] font-bold hover:underline">Chat WhatsApp Hotlines ↗</a>
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50/70 border border-emerald-100 p-3.5 rounded-2xl text-center text-xs text-[#315B4F] font-semibold leading-relaxed">
                  👉 Silakan klik salah satu tanggal keberangkatan pada kalender di atas untuk melihat ringkasan harga dan melanjutkan pemesanan.
                </div>
              )}

            </div>

            {/* Extra Auxiliary Transport Services links */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-3xl p-6 space-y-4">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-neutral-800">Layanan Ekstra SmartJourney</h4>
              <p className="text-[11px] text-neutral-500 leading-normal">
                Butuh layanan penjemputan bandara atau rental mobil di kota asal? Hubungkan rencana perjalanan Anda sekarang juga.
              </p>
              
              <div className="space-y-2">
                <button
                  onClick={() => setPage('airport')}
                  className="w-full text-left bg-white hover:bg-neutral-100/50 border border-neutral-200 p-3 rounded-xl flex items-center justify-between text-xs font-bold text-neutral-700 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Plane className="h-4.5 w-4.5 text-amber-500" />
                    <span>Airport Transfer Service (SUB / YIA)</span>
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-neutral-400" />
                </button>

                <button
                  onClick={() => setPage('taxi')}
                  className="w-full text-left bg-white hover:bg-neutral-100/50 border border-neutral-200 p-3 rounded-xl flex items-center justify-between text-xs font-bold text-neutral-700 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Route className="h-4.5 w-4.5 text-amber-500" />
                    <span>Flat-Rate Intercity Executive Taxi</span>
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-neutral-400" />
                </button>

                <button
                  onClick={() => setPage('car-rental')}
                  className="w-full text-left bg-white hover:bg-neutral-100/50 border border-neutral-200 p-3 rounded-xl flex items-center justify-between text-xs font-bold text-neutral-700 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Car className="h-4.5 w-4.5 text-amber-500" />
                    <span>Premium Car Rental with Private Tour Driver</span>
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-neutral-400" />
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* 7. Similar Trips recommendations */}
        <div className="border-t border-neutral-200 mt-20 pt-16 space-y-8">
          <div>
            <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-amber-600 block mb-1">Rekomendasi</span>
            <h3 className="text-2xl font-black text-neutral-900">Similar Trips (Tur yang Serupa)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tours.filter(t => t.id !== tour.id).slice(0, 3).map(simTour => (
              <div
                key={simTour.id}
                onClick={() => {
                  setSearchParams({ ...searchParams, selectedTourId: simTour.id });
                }}
                className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:border-neutral-300 transition-all flex flex-col justify-between group cursor-pointer"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={simTour.image}
                    alt={simTour.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute top-3 left-3 bg-neutral-900/80 backdrop-blur-sm text-amber-500 text-[9px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-widest border border-amber-500/20">
                    {simTour.category}
                  </span>
                </div>
                <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-neutral-900 group-hover:text-amber-600 transition-colors line-clamp-1">
                      {simTour.name}
                    </h4>
                    <p className="text-xs text-neutral-500 line-clamp-2 mt-1.5 leading-relaxed">
                      {simTour.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                    <div>
                      <span className="text-[9px] text-neutral-400 block uppercase font-mono">From</span>
                      <span className="text-sm font-black text-amber-600">
                        {formatPrice(simTour.startingPrice, simTour.startingPriceIDR)}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-amber-600 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                      <span>Detail</span>
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <CustomerReviewsSection 
          serviceType="tour" 
          serviceId={tour.id} 
          serviceName={tour.name} 
        />
      </div>

      {/* Sticky Floating Bottom Action Bar - Linear Booking Progression */}
      {!isBookingOpen && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#1f3a32]/95 backdrop-blur-md border-t border-[#315B4F] z-40 shadow-2xl px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 flex items-center justify-between transition-all animate-fade-in">
          <div className="flex flex-col items-start text-left min-w-0 pr-2">
            {selectedDate && selectedTier ? (
              <>
                <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider font-mono flex items-center gap-1">
                  <span>TOTAL HARGA</span>
                  <span className="text-gray-300 font-normal">({guestCount} Pax • {selectedTierId === 'WNI' ? 'Domestic' : 'Foreigner'})</span>
                </span>
                <span className="text-sm sm:text-base font-black text-white truncate">
                  {formatPrice(selectedTier.priceUSD * guestCount, selectedTier.priceIDR * guestCount)}
                </span>
              </>
            ) : (
              <>
                <span className="text-[10px] text-gray-300 font-bold uppercase tracking-wider font-mono">
                  Mulai Dari
                </span>
                <span className="text-sm sm:text-base font-black text-amber-300 truncate">
                  {formatPrice(tour.startingPrice, tour.startingPriceIDR)} <span className="text-xs text-gray-300 font-normal">/ pax</span>
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {selectedDate && selectedTier ? (
              <button
                id="btn-sticky-proceed"
                type="button"
                onClick={() => {
                  if (tour) {
                    trackBookNowClick(tour.name, 'Private Tour', tour.id);
                  }
                  setIsBookingOpen(true);
                }}
                className="bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-neutral-950 font-black px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all cursor-pointer border border-amber-300 min-h-[44px]"
              >
                <span>Lanjut ke Pembayaran</span>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </button>
            ) : (
              <button
                id="btn-sticky-select-date"
                type="button"
                onClick={() => {
                  const el = document.getElementById('booking-section');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-neutral-950 font-black px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all cursor-pointer border border-amber-300 min-h-[44px]"
              >
                <Calendar className="h-4 w-4 shrink-0" />
                <span>Pilih Tanggal &amp; Pesan</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Interactive Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[200] bg-neutral-950/98 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 animate-fade-in select-none">
          {/* Close Backdrop click */}
          <div className="absolute inset-0 cursor-zoom-out" onClick={() => setIsLightboxOpen(false)} />
          
          {/* Header Info & Close Button */}
          <div className="absolute top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 flex items-center justify-between z-[210] pointer-events-none">
            <div className="text-white text-left max-w-[70%]">
              <span className="text-[10px] font-mono text-amber-500 font-bold uppercase tracking-widest block">
                {tour.category} • Layar Penuh
              </span>
              <h4 className="text-sm sm:text-base font-black truncate text-neutral-100">{tour.name}</h4>
            </div>
            
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all cursor-pointer pointer-events-auto border border-white/5 flex items-center justify-center"
              title="Tutup (ESC)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Central Image and Arrows */}
          <div className="relative max-w-5xl w-full h-[60vh] sm:h-[70vh] flex items-center justify-center z-[205]">
            {/* Left Nav Arrow */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrevImage();
              }}
              className="absolute left-0 sm:-left-16 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all cursor-pointer border border-white/5 flex items-center justify-center z-[210] hover:scale-110 active:scale-95"
              title="Foto Sebelumnya"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Image display container */}
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Blurred background backup to look lush and eliminate blank spaces */}
              <img
                src={activeImage}
                alt=""
                className="absolute max-w-full max-h-full object-contain blur-3xl opacity-35 scale-105 pointer-events-none transition-all duration-300"
                referrerPolicy="no-referrer"
              />
              <img
                src={activeImage}
                alt="Lightbox view"
                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl relative z-10 transition-all duration-300"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Right Nav Arrow */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNextImage();
              }}
              className="absolute right-0 sm:-right-16 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all cursor-pointer border border-white/5 flex items-center justify-center z-[210] hover:scale-110 active:scale-95"
              title="Foto Selanjutnya"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Thumbnails list inside lightbox */}
          <div className="relative z-[205] mt-6 sm:mt-8 max-w-md w-full flex flex-col items-center gap-3">
            <span className="text-[11px] font-mono font-bold text-neutral-400">
              Foto {activeImageIndex + 1} dari {richData.gallery.length}
            </span>
            <div className="flex gap-2 justify-center w-full overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-neutral-800">
              {richData.gallery.map((img, i) => {
                const isSelected = activeImage === img;
                return (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={`h-12 w-16 sm:h-14 sm:w-20 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer relative ${
                      isSelected ? 'border-amber-500 scale-[0.95]' : 'border-neutral-700 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
