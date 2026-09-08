import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { TOURS, FAQS } from '../data';
import { Clock, Star, MapPin, Calendar, Users, Sparkles, HelpCircle, ChevronDown, Check, ArrowRight, ShieldCheck, Heart, Car } from 'lucide-react';
import CheckoutModal from '../components/CheckoutModal';
import TourDetailView from './TourDetailView';
import Breadcrumbs from '../components/Breadcrumbs';
import ServiceNavTabs from '../components/ServiceNavTabs';
import TourFilterBar from '../components/TourFilterBar';
import { matchesTourFilter } from '../utils/tourFilterUtils';
import { motion, AnimatePresence } from 'motion/react';
import ComingSoonPage from '../components/ComingSoonPage';

export default function ToursView() {
  const { formatPrice, searchParams, setSearchParams, tours, setPage } = useApp();

  if (searchParams?.selectedTourId) {
    return (
      <TourDetailView
        tourId={searchParams.selectedTourId}
        onBack={() => setSearchParams({ ...searchParams, selectedTourId: undefined })}
      />
    );
  }

  const [selectedDuration, setSelectedDuration] = useState<string>('all');
  const [selectedExperience, setSelectedExperience] = useState<string>('all');
  const [expandedTourId, setExpandedTourId] = useState<string | null>('bromo'); // Expand first tour by default
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0); // Expand first FAQ

  // Wishlist State for uniform design with HomeView
  const [wishlist, setWishlist] = useState<string[]>([]);
  const toggleWishlist = (tourId: string) => {
    setWishlist(prev => 
      prev.includes(tourId) 
        ? prev.filter(id => id !== tourId) 
        : [...prev, tourId]
    );
  };

  useEffect(() => {
    if (searchParams?.selectedTourId) {
      const tourId = searchParams.selectedTourId;
      setExpandedTourId(tourId);
      
      const timer = setTimeout(() => {
        const element = document.getElementById(`tour-card-${tourId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [searchParams?.selectedTourId]);

  // Search Widget state inside Tours view
  const [searchDestination, setSearchDestination] = useState('bromo');
  const [searchDate, setSearchDate] = useState('');
  const [searchGuests, setSearchGuests] = useState(2);

  // Booking details
  const [bookingTour, setBookingTour] = useState<any>(null);

  const filteredTours = tours.filter(t => matchesTourFilter(t, selectedDuration, selectedExperience));

  const handleBookTour = (tour: any) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setBookingTour({
      tour,
      details: {
        date: searchDate || todayStr,
        guests: Number(searchGuests),
        tourId: tour.id,
        pickupLocation: 'Hotel Lobby / Airport Arrival'
      }
    });
  };

  return (
    <div id="tours-view" className="bg-white text-neutral-800 min-h-screen pt-20 md:pt-24 pb-16 md:pb-24">
      
      {/* Service Switcher Navigation Bar */}
      <ServiceNavTabs />

      {/* Reusable Breadcrumb Navigation */}
      <Breadcrumbs items={[{ label: 'Private Tours & Expeditions' }]} />

      {/* Hero Banner */}
      <section className="relative h-[40vh] min-h-[280px] flex items-center justify-center mb-16 rounded-[32px] overflow-hidden max-w-7xl mx-4 sm:mx-6 lg:mx-8 xl:mx-auto shadow-md">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1920&q=80"
            alt="East Java Waterfalls"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/85 via-neutral-900/40 to-black/60" />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto px-6 space-y-4">
          <span className="inline-flex items-center space-x-1.5 bg-amber-500/20 border border-amber-500/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-amber-300 font-mono uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Curated Guided Expeditions</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Our Premium Tours &amp; Safaris
          </h1>
          <p className="text-xs sm:text-base text-neutral-200 max-w-xl mx-auto leading-relaxed font-medium">
            All-inclusive private and shared tours designed to let you experience the magic of East Java with zero planning stress.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        
        {/* TOURS BROWSER */}
        <section className="space-y-12">
          
          {/* Professional Tour Filter Bar (Duration & Experience Category) */}
          <TourFilterBar
            selectedDuration={selectedDuration}
            onSelectDuration={setSelectedDuration}
            selectedExperience={selectedExperience}
            onSelectExperience={setSelectedExperience}
            onResetFilters={() => {
              setSelectedDuration('all');
              setSelectedExperience('all');
            }}
            totalFilteredCount={filteredTours.length}
            totalAvailableCount={tours.length}
          />

          {/* Catalog grid */}
          {filteredTours.length === 0 ? (
            <div className="text-center py-20 px-4 bg-neutral-50 rounded-3xl border border-neutral-200/60 max-w-lg mx-auto space-y-4">
              <div className="p-3 bg-amber-500/10 text-amber-600 rounded-full inline-block">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search-x"><path d="m13.5 8.5-5 5"/><path d="m8.5 8.5 5 5"/><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
              <h3 className="text-lg font-bold text-neutral-800">Tidak Ada Paket Tour yang Cocok</h3>
              <p className="text-xs text-neutral-500 leading-relaxed max-w-sm mx-auto">
                Maaf, tidak ada paket tour yang cocok dengan pilihan durasi dan kategori pengalaman ini. Silakan coba kombinasi lain atau klik tombol atur ulang di bawah ini.
              </p>
              <button
                onClick={() => {
                  setSelectedDuration('all');
                  setSelectedExperience('all');
                }}
                className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all cursor-pointer shadow-sm"
              >
                Atur Ulang Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center max-w-7xl mx-auto">
              {filteredTours.map((tour) => {
                const isWishlisted = wishlist.includes(tour.id);
                
                let tourLocation = "📍 East Java";
                if (tour.id === 'malang-city') {
                  tourLocation = "📍 Malang, East Java";
                }

                return (
                  <div
                    key={tour.id}
                    id={`tour-card-${tour.id}`}
                    onClick={() => setSearchParams({ ...searchParams, selectedTourId: tour.id })}
                    className="bg-white rounded-[32px] overflow-hidden shadow-[0_12px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(15,118,110,0.08)] hover:-translate-y-2 transition-all duration-500 group flex flex-col justify-between w-full max-w-[380px] border border-neutral-100/50 h-full cursor-pointer"
                  >
                    {/* Image Block: Fluid Aspect Ratio with Inner Padding */}
                    <div className="relative aspect-[16/10] m-3 overflow-hidden rounded-[24px] shrink-0">
                      <img
                        src={tour.image}
                        alt={tour.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                      />
                      {/* Dark gradient overlay for visual premium depth */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
                      
                      {/* Top Left: Standout Golden Amber Ribbon Badge */}
                      <span className="absolute top-4 left-4 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 text-neutral-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-amber-500/35 border border-white/60 flex items-center gap-1.5 z-10">
                        <Sparkles className="w-3 h-3 fill-neutral-950 text-neutral-950" />
                        <span>{tour.id === 'bromo' ? 'BEST SELLER' : tour.id === 'ijen' ? 'TOP RATED' : 'POPULAR'}</span>
                      </span>

                      {/* Top Right: Wishlist Icon */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(tour.id);
                        }}
                        className="absolute top-4 right-4 bg-white/80 backdrop-blur-md p-2.5 rounded-full shadow-sm hover:bg-white text-slate-400 hover:text-red-500 hover:scale-110 active:scale-95 transition-all cursor-pointer z-10"
                        aria-label="Add to wishlist"
                      >
                        <Heart 
                          className={`h-4 w-4 transition-all ${
                            isWishlisted 
                              ? 'fill-red-500 text-red-500 scale-110' 
                              : 'text-[#111827]'
                          }`} 
                        />
                      </button>
                    </div>

                    {/* Below Image Content Area */}
                    <div className="px-6 pb-6 pt-3 flex-grow flex flex-col justify-between space-y-4">
                      <div className="space-y-2.5">
                        {/* Rating & Review row */}
                        <div className="flex items-center gap-1">
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-3 w-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                            ))}
                          </div>
                          <span className="text-xs font-bold text-[#111827] ml-1">4.9</span>
                          <span className="text-xs text-[#6B7280]">({tour.reviewCount || 128} Reviews)</span>
                        </div>

                        {/* Tour Title */}
                        <h3 className="font-bold text-sm sm:text-base text-[#111827] leading-tight group-hover:text-[#0F766E] transition-colors line-clamp-1">
                          {tour.id === 'bromo' ? 'Mount Bromo Sunrise Tour' : tour.name}
                        </h3>

                        {/* Location */}
                        <div className="text-xs text-[#6B7280] font-semibold flex items-center gap-1">
                          <span>{tourLocation}</span>
                        </div>

                        {/* Small Information Row */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-1 text-[11px] text-[#6B7280] font-bold border-t border-neutral-100 mt-2">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-[#0F766E]" />
                            <span>{tour.duration.split('(')[0].trim()}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5 text-[#0F766E]" />
                            <span>Private Tour</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Car className="h-3.5 w-3.5 text-[#0F766E]" />
                            <span>Pickup Included</span>
                          </span>
                        </div>
                      </div>

                      {/* Pricing and Call To Action */}
                      <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2 mt-auto">
                        <div className="flex flex-col">
                          <span className="text-[9px] uppercase tracking-wider text-[#6B7280] font-extrabold">Starting from</span>
                          <div className="flex items-baseline gap-0.5">
                            <span className="text-lg font-black text-[#111827]">
                              {formatPrice(tour.startingPrice, tour.startingPriceIDR)}
                            </span>
                            <span className="text-[10px] text-[#6B7280] font-bold">/ person</span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSearchParams({ ...searchParams, selectedTourId: tour.id });
                          }}
                          className="bg-[#0F766E] hover:bg-[#0D645E] text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-[#0F766E]/10 transition-all hover:scale-[1.02] cursor-pointer"
                        >
                          <span>Detail Tour</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </section>

        {/* FAQ ACCORDION */}
        <section className="bg-neutral-50 border border-neutral-200 rounded-3xl p-6 md:p-12 space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <div className="inline-flex p-3 bg-amber-500/10 text-amber-600 rounded-2xl mb-2">
              <HelpCircle className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900">Frequently Asked Questions</h2>
            <p className="text-xs text-neutral-600">
              Find answers to common questions regarding our private and shared tours, booking confirmations, and physical guidelines.
            </p>
          </div>

          <div className="divide-y divide-neutral-200 max-w-3xl mx-auto">
            {FAQS.map((faq, index) => {
              const isFaqExpanded = expandedFaqIndex === index;
              return (
                <div key={index} className="py-4.5">
                  <button
                    onClick={() => setExpandedFaqIndex(isFaqExpanded ? null : index)}
                    className="w-full flex items-center justify-between text-left font-bold text-sm sm:text-base text-neutral-800 hover:text-amber-600 transition-colors py-2 cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-300 text-amber-500 ${isFaqExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isFaqExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed pt-2.5 pb-2">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

      </div>

      {/* SECURE RESERVATION PORTAL */}
      {bookingTour && (
        <CheckoutModal
          isOpen={!!bookingTour}
          onClose={() => setBookingTour(null)}
          serviceType="tour"
          serviceName={bookingTour.tour.name}
          basePriceUSD={bookingTour.tour.startingPrice}
          basePriceIDR={bookingTour.tour.startingPriceIDR}
          initialDetails={bookingTour.details}
        />
      )}

    </div>
  );
}
