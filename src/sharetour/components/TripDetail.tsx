import React, { useState, useEffect } from "react";
import { Trip, Batch } from "../types";
import { 
  ChevronLeft, 
  Info, 
  Check, 
  X, 
  Calendar, 
  Users, 
  Sparkles, 
  MapPin, 
  Clock, 
  HelpCircle, 
  Layers, 
  Image as ImageIcon, 
  Maximize2, 
  ChevronRight, 
  CheckCircle2, 
  ExternalLink,
  ChevronDown,
  Globe,
  Briefcase
} from "lucide-react";
import { useLanguageCurrency } from "../LanguageCurrencyContext";
import { trackTourDetailView, trackBookNowClick } from "../../lib/analytics";

interface TripDetailProps {
  trip: Trip;
  batches: Batch[];
  onBack: () => void;
  onBook: (batchId: string, nationalityType?: 'WNI' | 'WNA' | 'WNA_CHINA' | 'WNA_EUROPE' | null) => void;
  // Optional, added to implement similar trips and quick navigation
  trips?: Trip[];
  onSelectTrip?: (slug: string) => void;
}

export default function TripDetail({ 
  trip, 
  batches, 
  onBack, 
  onBook, 
  trips = [], 
  onSelectTrip 
}: TripDetailProps) {
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [nationalityType, setNationalityType] = useState<'WNI' | 'WNA' | 'WNA_CHINA' | 'WNA_EUROPE' | null>(null);
  const [isItineraryExpanded, setIsItineraryExpanded] = useState<boolean>(true);
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({});
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(null);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);
  const [overrideCover, setOverrideCover] = useState<string | null>(null);
  const [packedItems, setPackedItems] = useState<Record<string, boolean>>({});
  
  // Real Calendar monthly selector states
  const [calendarYear, setCalendarYear] = useState<number>(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState<number>(new Date().getMonth());

  const { t, formatPrice, language } = useLanguageCurrency();

  useEffect(() => {
    if (trip) {
      trackTourDetailView(trip.title, trip.id, 'Open Trip');
    }
  }, [trip?.id, trip?.title]);

  // Find batches scheduled for this trip
  const tripBatches = batches.filter((b) => b.tripId === trip.id);
  const selectedBatch = tripBatches.find((b) => b.id === selectedBatchId);

  const getEffectiveUnitPrice = (batch?: Batch) => {
    const isWNA = nationalityType === 'WNA' || nationalityType === 'WNA_CHINA' || nationalityType === 'WNA_EUROPE';
    if (!batch) {
      if (isWNA) {
        return trip.wnaStartingPrice || (trip.startingPrice ? trip.startingPrice + 20 : 170);
      }
      return trip.startingPrice || 150;
    }
    if (isWNA) {
      return batch.wnaPrice || batch.price + 20;
    }
    return batch.price;
  };

  useEffect(() => {
    setOverrideCover(null);
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();

    if (tripBatches.length > 0) {
      // Sort batches by departure date to find the earliest valid current/future batch
      const sortedBatches = [...tripBatches].sort((a,b) => new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime());
      
      const futureOrCurrentBatch = sortedBatches.find(b => {
        const bd = new Date(b.departureDate);
        return bd.getFullYear() > curYear || (bd.getFullYear() === curYear && bd.getMonth() >= curMonth);
      });

      if (futureOrCurrentBatch) {
        const bDate = new Date(futureOrCurrentBatch.departureDate);
        setCalendarYear(bDate.getFullYear());
        setCalendarMonth(bDate.getMonth());
        setSelectedBatchId(futureOrCurrentBatch.id);
      } else {
        setCalendarYear(curYear);
        setCalendarMonth(curMonth);
        setSelectedBatchId("");
      }
    } else {
      setCalendarYear(curYear);
      setCalendarMonth(curMonth);
      setSelectedBatchId("");
    }
  }, [trip.id, batches]);

  const formatDate = (dateStr: string) => {
    if (language === "zh") {
      const d = new Date(dateStr);
      return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    }
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  // Auto-generate similar trips based on matching region or location substring
  const similarTrips = trips
    .filter((t) => t.id !== trip.id && (t.status === undefined || t.status === "published"))
    .slice(0, 3);

  const toggleDay = (day: number) => {
    setExpandedDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  const hasAdminToken = typeof window !== "undefined" && !!localStorage.getItem("smart_journey_admin_token");

  // Default gallery fallback if trip doesn't have custom media
  const galleryPhotos = trip.gallery && trip.gallery.length > 0 
    ? trip.gallery 
    : [trip.coverImage];

  // Calendar render math helpers
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };
  const getBatchOnDate = (day: number) => {
    return tripBatches.find(b => {
      const bDate = new Date(b.departureDate);
      return bDate.getFullYear() === calendarYear && bDate.getMonth() === calendarMonth && bDate.getDate() === day;
    });
  };

  return (
    <div className="space-y-8 pb-20 animate-fade-in" id="trip-detail-page">
      {/* Back navigation & admin helpful modifier banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button
          id="btn-back-to-trips"
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-gray-500 hover:text-[#315B4F] text-sm font-semibold transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 text-[#315B4F]" />
          <span>{t("Back to Expeditions")}</span>
        </button>

        {hasAdminToken && (
          <div className="bg-[#315B4F]/10 border border-[#315B4F]/30 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#315B4F] flex items-center space-x-1.5 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span>You are logged in as Admin. Manage trip content inside the Catalog tab.</span>
          </div>
        )}
      </div>

      {/* Clean Page Title, Meta Badges & Interactive Thumbnail Gallery Block */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-5" id="trip-header-gallery-section">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="space-y-3 flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-gray-900 tracking-tight leading-tight select-text">
              {t(trip.title)}
            </h1>

            <div className="flex flex-wrap gap-2 text-xs pt-1.5">
              <span className="flex items-center space-x-1.5 bg-[#315B4F]/10 text-[#315B4F] px-3.5 py-1.5 rounded-full font-bold uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-[#315B4F]" />
                <span>{t(trip.location)}</span>
              </span>
              <span className="flex items-center space-x-1.5 bg-gray-100 text-gray-700 px-3.5 py-1.5 rounded-full font-bold">
                <Clock className="w-3.5 h-3.5 text-gray-500" />
                <span>{t(trip.duration)}</span>
              </span>
              <span className="flex items-center space-x-1.5 bg-amber-50 text-amber-805 px-3.5 py-1.5 rounded-full font-bold border border-amber-200/50">
                <Sparkles className="w-3.5 h-3.5 text-amber-550" />
                <span>{t("Verified Quota by Smart Journey") === "Verified Quota by Smart Journey" ? "Verified Quota" : t("Verified Quota by Smart Journey")}</span>
              </span>
            </div>
          </div>

          {/* Small Clickable Thumbnails ("di dekat djudul ada kecil2") */}
          <div className="flex-shrink-0 bg-gray-55 border border-gray-100 p-3 rounded-2xl max-w-full space-y-2">
            <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-1.5">
              <span className="text-[10px] text-[#315B4F] font-mono tracking-wider font-bold block uppercase">
                🏷️ Klik Foto untuk Ganti Cover Utama
              </span>
              <span className="text-[9px] text-gray-400 font-sans hidden sm:block">
                {galleryPhotos.length} Destinasi
              </span>
            </div>
            <div className="flex items-center space-x-2 overflow-x-auto py-0.5 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
              {galleryPhotos.map((photo, pIdx) => {
                const currentCover = overrideCover || trip.coverImage;
                const isActive = currentCover === photo;
                return (
                  <button
                    key={pIdx}
                    type="button"
                    title="Ganti cover utama di bawah"
                    onClick={(e) => {
                      e.preventDefault();
                      setOverrideCover(photo);
                    }}
                    className={`relative w-14 h-10 sm:w-16 sm:h-12 rounded-lg overflow-hidden border transition-all duration-300 block hover:scale-105 active:scale-95 flex-shrink-0 cursor-pointer ${
                      isActive 
                        ? "border-[#315B4F] ring-2 ring-[#315B4F]/40 scale-102 opacity-100 shadow-md" 
                        : "border-gray-200 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img 
                      src={photo} 
                      alt={`Thumb ${pIdx}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    {isActive && (
                      <div className="absolute inset-0 bg-[#315B4F]/10 flex items-center justify-center">
                        <div className="bg-[#315B4F] text-[#D6B16D] p-0.5 rounded-full shadow-md">
                          <Check className="w-2.5 h-2.5 font-bold" />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Large Main Photo (Foto yang Besar) displaying selected/clicked image */}
        <div className="relative h-64 sm:h-[400px] lg:h-[460px] rounded-2xl overflow-hidden shadow-md border border-gray-100 group">
          <img
            src={overrideCover || trip.coverImage}
            alt={trip.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none"></div>
          
          {/* Zoom resolution control */}
          <button
            type="button"
            title="Saran: Lihat Resolusi Penuh"
            onClick={() => setActivePhoto(overrideCover || trip.coverImage)}
            className="absolute bottom-4 right-4 bg-white/95 hover:bg-white text-gray-800 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 shadow-md border border-gray-150 flex items-center space-x-1 cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5 text-[#315B4F]" />
            <span>Lihat Resolusi Penuh</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left side detailed specifications, Right side dynamic Sticky Booking widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Specification Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Trip Overview Section (Description + Highlight Side-by-Side as required) */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-lg font-display font-bold text-gray-900 flex items-center space-x-2">
              <Info className="w-5 h-5 text-[#315B4F]" />
              <span>{t("Trip Overview & Highlights")}</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Left Item Description */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest">
                  {t("Comprehensive Description")}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed font-sans whitespace-pre-line">
                  {t(trip.description)}
                </p>
              </div>

              {/* Right Item Highlight */}
              <div className="bg-[#315B4F]/5 p-5 rounded-2xl border border-[#315B4F]/10 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="inline-flex items-center space-x-1.5 bg-[#315B4F] text-white text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md">
                    <Sparkles className="w-3 h-3 text-[#D6B16D]" />
                    <span>{t("Special Trip Highlight")}</span>
                  </div>
                  <p className="text-sm text-emerald-950 font-medium font-sans leading-relaxed">
                    {t(trip.highlight || "Experience pristine tropical lookouts, professional explorer-grade catamaran transfers, and authentic cultural encounters.")}
                  </p>
                </div>
                <div className="flex items-center space-x-3 text-xs text-gray-400 font-mono border-t border-emerald-900/10 pt-3">
                  <span>{t("Editable by Authorized Admin only")}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Combined Expandable/Collapsible Itinerary Section with Time Schedules */}
          <section id="itinerary-timeline-container" className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-lg font-display font-bold text-gray-900 flex items-center space-x-2.5">
                  <Calendar className="w-5 h-5 text-[#315B4F]" />
                  <span>{t("Interactive Day-by-Day Itinerary")}</span>
                </h2>
                <p className="text-xs text-gray-400">{t("Ketuk setiap hari di bawah untuk memperluas rute detail & jadwal lengkap.")}</p>
              </div>

              {/* Convenience expand/collapse all trigger */}
              <button
                type="button"
                onClick={() => {
                  const anyOpen = Object.values(expandedDays).some(v => v);
                  if (anyOpen) {
                    setExpandedDays({});
                  } else {
                    const allDays: Record<number, boolean> = {};
                    trip.itinerary.forEach(it => { allDays[it.day] = true; });
                    setExpandedDays(allDays);
                  }
                }}
                className="px-3.5 py-1.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-650 text-[11px] font-bold rounded-xl transition-all cursor-pointer block"
              >
                {Object.values(expandedDays).some(v => v) ? t("Collapse All") : t("Expand All")}
              </button>
            </div>
            
            <div className="space-y-3.5 animate-fade-in" id="daily-itinerary-accordion-group">
              {trip.itinerary.map((it, idx) => {
                const isOpen = !!expandedDays[it.day];
                return (
                  <div 
                    key={idx} 
                    className={`border rounded-2xl overflow-hidden transition-all duration-300 bg-white ${
                      isOpen ? "border-[#315B4F]/30 shadow-md shadow-[#315B4F]/5" : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleDay(it.day)}
                      className={`w-full p-4 text-left flex items-center justify-between gap-4 transition-colors select-none ${
                        isOpen ? "bg-[#315B4F]/5 text-[#315B4F]" : "bg-white"
                      }`}
                    >
                      <div className="flex items-center space-x-3.5">
                        <span className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono text-xs font-black transition-all ${
                          isOpen ? "bg-[#315B4F] text-[#D6B16D] shadow-sm" : "bg-gray-50 text-gray-700"
                        }`}>
                          D{it.day}
                        </span>
                        <span className="font-display font-extrabold text-[#315B4F] text-xs sm:text-sm">
                          {t("Day")} {it.day}: {t(it.title)}
                        </span>
                      </div>
                      
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 flex-shrink-0 ${isOpen ? "rotate-180 text-[#315B4F]" : ""}`} />
                    </button>

                    {isOpen && (
                      <div className="p-4 sm:p-5 bg-white border-t border-gray-50/80 text-xs sm:text-xs text-gray-650 leading-relaxed font-sans space-y-4 animate-fade-in">
                        <p className="whitespace-pre-line text-[#334155] leading-relaxed select-text font-light">
                          {t(it.description || (it as any).activity)}
                        </p>

                        {/* Scheduled time timelines */}
                        {it.timeSchedules && it.timeSchedules.length > 0 && (
                          <div className="space-y-2 border-t border-gray-100 pt-3">
                            <span className="text-[9px] text-[#315B4F] font-mono font-bold uppercase tracking-wider block">
                              📍 {t("Scheduled Activities Calendar")}
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {it.timeSchedules.map((sched, sIdx) => (
                                <div key={sIdx} className="flex items-start space-x-2 p-2 bg-slate-50/50 rounded-lg border border-slate-100">
                                  <span className="inline-flex items-center justify-center bg-white text-[#315B4F] font-mono font-bold text-[9px] px-1.5 py-0.5 rounded border border-slate-200">
                                    {sched.time}
                                  </span>
                                  <span className="text-[11px] text-gray-600 font-sans leading-tight">
                                    {t(sched.activity)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Inclusions and Exclusions Grid Section */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Inclusions */}
            <div className="bg-emerald-50/40 p-6 sm:p-7 rounded-3xl border border-emerald-100 space-y-4 shadow-sm">
              <h2 className="text-sm font-display font-bold text-[#315B4F] uppercase tracking-wider flex items-center space-x-2">
                <Check className="w-4 h-4 text-[#D6B16D]" />
                <span>{t("Price Includes")}</span>
              </h2>
              <ul className="space-y-2 text-xs sm:text-xs text-gray-600 leading-relaxed">
                {trip.included.map((inc, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="bg-emerald-100 text-[#315B4F] p-0.5 rounded-full mt-0.5">
                      <Check className="w-3 h-3" />
                    </span>
                    <span className="leading-relaxed">{t(inc)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Exclusions */}
            <div className="bg-rose-50/20 p-6 sm:p-7 rounded-3xl border border-rose-100 space-y-4 shadow-sm">
              <h2 className="text-sm font-display font-bold text-rose-900 uppercase tracking-wider flex items-center space-x-2">
                <X className="w-4 h-4 text-rose-500" />
                <span>{t("Price Excludes")}</span>
              </h2>
              <ul className="space-y-2 text-xs sm:text-xs text-gray-600 leading-relaxed">
                {trip.excluded.map((exc, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="bg-rose-100 text-rose-800 p-0.5 rounded-full mt-0.5">
                      <X className="w-3 h-3" />
                    </span>
                    <span className="leading-relaxed">{t(exc)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Whats to Bring Checklist Section */}
          {trip.whatsToBring && trip.whatsToBring.length > 0 && (
            <section className="bg-blue-50/15 p-6 sm:p-7 rounded-3xl border border-blue-100/70 space-y-4 shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="space-y-0.5">
                  <h2 className="text-sm font-display font-bold text-blue-900 uppercase tracking-wider flex items-center space-x-2">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    <span>{t("What's to Bring & Checklist")}</span>
                  </h2>
                  <p className="text-[11px] text-gray-500 font-medium">
                    {t("Rekomendasi / checklist barang bawaan para peserta. Ketuk item jika sudah Anda siapkan!")}
                  </p>
                </div>
                {/* Micro counting badge */}
                <div className="bg-blue-100 text-blue-800 text-[10px] font-mono px-2.5 py-1 rounded-full font-bold">
                  {Object.values(packedItems).filter(Boolean).length} / {trip.whatsToBring.length} {t("Packed")}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {trip.whatsToBring.map((item, idx) => {
                  const isChecked = !!packedItems[item];
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPackedItems({ ...packedItems, [item]: !isChecked })}
                      className={`flex items-start text-left p-3 rounded-2xl border transition-all duration-200 cursor-pointer ${
                        isChecked 
                          ? "bg-blue-50/40 border-blue-200/50 text-gray-500" 
                          : "bg-white border-slate-200/80 hover:border-blue-300 text-gray-850 shadow-sm"
                      }`}
                    >
                      <span className={`flex-shrink-0 w-4 h-4 rounded-md border mt-0.5 mr-3 flex items-center justify-center transition-all ${
                        isChecked 
                          ? "bg-[#315B4F] border-[#315B4F] text-white" 
                          : "border-gray-300 bg-white"
                      }`}>
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </span>
                      <span className={`text-xs select-none leading-relaxed transition-all ${isChecked ? "line-through text-gray-400 font-normal" : "font-medium"}`}>
                        {t(item)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* FAQ Accordion Section */}
          {trip.faq && trip.faq.length > 0 && (
            <section className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
              <h2 className="text-lg font-display font-bold text-gray-900 flex items-center space-x-2.5">
                <HelpCircle className="w-5 h-5 text-[#315B4F]" />
                <span>Frequently Asked Questions</span>
              </h2>

              <div className="space-y-3">
                {trip.faq.map((item, idx) => {
                  const isFAQOpen = openFAQIndex === idx;
                  return (
                    <div 
                      key={idx} 
                      className="border border-gray-100 rounded-2xl overflow-hidden transition-all duration-200"
                    >
                      <button
                        onClick={() => setOpenFAQIndex(isFAQOpen ? null : idx)}
                        className={`w-full p-4 text-left font-display font-bold text-xs sm:text-sm text-gray-800 flex items-center justify-between transition-colors ${
                          isFAQOpen ? "bg-[#315B4F]/5 text-[#315B4F]" : "bg-white hover:bg-gray-50/55"
                        }`}
                      >
                        <span>{item.question}</span>
                        <span className="text-lg leading-none">{isFAQOpen ? "−" : "+"}</span>
                      </button>
                      
                      {isFAQOpen && (
                        <div className="p-4 bg-white/70 border-t border-gray-100 text-xs sm:text-sm text-gray-600 leading-relaxed font-sans">
                          {item.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

        </div>

        {/* Right Sticky Booking column with Interactive Dynamic Calendar */}
        <div className="space-y-6 lg:sticky lg:top-24">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-md space-y-6">
            
            <div className="space-y-1">
              <span className="text-[10px] bg-amber-100 text-amber-900 font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider font-mono inline-block border border-amber-200">
                👥 SHARE TOUR — JADWAL BATCH RESMI
              </span>
              <h3 className="font-display font-bold text-gray-900 text-lg">{t("Departure Calendar")}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {t("Jadwal keberangkatan Share Tour berdasarkan tanggal batch resmi yang dibuka oleh Admin.")}
              </p>
            </div>

            {/* Real Interactive Calendar Month-Year selector */}
            <div className="space-y-4" id="real-interactive-calendar">
              {/* Calendar controls (Month & Year switchers with Dropdown drop menus) */}
              <div className="flex items-center justify-between gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                {(() => {
                  const now = new Date();
                  const isMinMonth = calendarYear < now.getFullYear() || (calendarYear === now.getFullYear() && calendarMonth <= now.getMonth());

                  return (
                    <button
                      type="button"
                      title="Previous Month"
                      disabled={isMinMonth}
                      onClick={() => {
                        if (isMinMonth) return;
                        if (calendarMonth === 0) {
                          setCalendarMonth(11);
                          setCalendarYear(prev => Math.max(now.getFullYear(), prev - 1));
                        } else {
                          setCalendarMonth(prev => prev - 1);
                        }
                      }}
                      className={`p-1 px-2.5 border rounded-lg text-sm font-bold flex items-center justify-center select-none transition-colors ${
                        isMinMonth
                          ? "bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed opacity-60"
                          : "bg-white border-gray-200 hover:bg-gray-100 text-gray-750 cursor-pointer"
                      }`}
                    >
                      &lt;
                    </button>
                  );
                })()}
                
                {/* Custom selectors inside the design header */}
                <div className="flex items-center gap-1 flex-1 justify-center">
                  <select
                    value={calendarMonth}
                    onChange={(e) => setCalendarMonth(parseInt(e.target.value))}
                    className="bg-transparent font-sans font-bold text-xs uppercase tracking-wider text-gray-800 focus:outline-none cursor-pointer p-0.5 border-b border-transparent hover:border-gray-300"
                  >
                    {[
                      "January", "February", "March", "April", "May", "June", 
                      "July", "August", "September", "October", "November", "December"
                    ].map((m, idx) => {
                      const now = new Date();
                      const isPastMonth = calendarYear < now.getFullYear() || (calendarYear === now.getFullYear() && idx < now.getMonth());
                      if (isPastMonth) return null;
                      return (
                        <option key={idx} value={idx}>{t(m) || m}</option>
                      );
                    })}
                  </select>

                  <select
                    value={calendarYear}
                    onChange={(e) => {
                      const newYear = parseInt(e.target.value);
                      const now = new Date();
                      setCalendarYear(newYear);
                      if (newYear === now.getFullYear() && calendarMonth < now.getMonth()) {
                        setCalendarMonth(now.getMonth());
                      }
                    }}
                    className="bg-transparent font-sans font-extrabold text-xs text-gray-800 focus:outline-none cursor-pointer p-0.5 border-b border-transparent hover:border-gray-300"
                  >
                    {Array.from({ length: 6 }).map((_, i) => {
                      const yr = new Date().getFullYear() + i;
                      return (
                        <option key={yr} value={yr}>{yr}</option>
                      );
                    })}
                  </select>
                </div>

                <button
                  type="button"
                  title="Next Month"
                  onClick={() => {
                    if (calendarMonth === 11) {
                      setCalendarMonth(0);
                      setCalendarYear(prev => prev + 1);
                    } else {
                      setCalendarMonth(prev => prev + 1);
                    }
                  }}
                  className="p-1 px-2.5 bg-white border border-gray-200 hover:bg-gray-100 rounded-lg text-sm font-bold text-gray-755 cursor-pointer flex items-center justify-center select-none"
                >
                  &gt;
                </button>
              </div>

              {/* 7 columns grid for days of week */}
              <div className="grid grid-cols-7 gap-1 text-center font-mono font-bold text-[9px] text-[#315B4F] tracking-wider uppercase">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                  <div key={d} className="py-1">{t(d) || d}</div>
                ))}
              </div>

              {/* Monthly grid cell blocks */}
              <div className="grid grid-cols-7 gap-1">
                {(() => {
                  const daysInMonth = getDaysInMonth(calendarYear, calendarMonth);
                  const firstDayIndex = getFirstDayOfMonth(calendarYear, calendarMonth);
                  const cells = [];
                  const now = new Date();
                  const todayDate = now.getDate();
                  const isCurrentMonthYear = calendarYear === now.getFullYear() && calendarMonth === now.getMonth();

                  // Empty spots offset leading-in
                  for (let i = 0; i < firstDayIndex; i++) {
                    cells.push(<div key={`empty-${i}`} className="p-1 text-transparent text-xs" />);
                  }

                  // Numbered days sequence
                  for (let d = 1; d <= daysInMonth; d++) {
                    const isPastDay = isCurrentMonthYear && d < todayDate;
                    const rawBatch = getBatchOnDate(d);
                    const batch = isPastDay ? null : rawBatch;
                    const isSelected = batch && selectedBatchId === batch.id;
                    const isFull = batch && (batch.status === "Closed" || batch.availableSeats <= 0);

                    cells.push(
                      <button
                        key={`day-${d}`}
                        type="button"
                        disabled={!batch || isPastDay}
                        onClick={() => {
                          if (batch && !isFull && !isPastDay) {
                            setSelectedBatchId(batch.id);
                          }
                        }}
                        className={`relative aspect-square rounded-xl text-xs font-mono font-bold flex flex-col items-center justify-center transition-all ${
                          isPastDay
                            ? "text-gray-300 cursor-not-allowed select-none opacity-50"
                            : batch 
                              ? isFull
                                ? "bg-rose-50 text-rose-500 border border-rose-100 cursor-not-allowed opacity-80"
                                : isSelected
                                  ? "bg-[#315B4F] text-[#D6B16D] ring-4 ring-[#315B4F]/20 font-black shadow-md"
                                  : "bg-emerald-50 text-[#315B4F] hover:bg-emerald-105 border border-emerald-100 hover:scale-105 cursor-pointer hover:shadow-sm"
                              : "text-gray-400 hover:bg-gray-50/50 select-none cursor-default"
                        }`}
                      >
                        <span className="relative z-10">{d}</span>
                        
                        {batch && !isFull && !isSelected && (
                          <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#D6B16D]"></span>
                        )}

                        {batch && isFull && (
                          <span className="absolute bottom-0.5 text-[6px] text-rose-500 font-sans tracking-tight font-light whitespace-nowrap scale-90">FULL</span>
                        )}
                      </button>
                    );
                  }

                  return cells;
                })()}
              </div>

              {/* Legends explanation */}
              <div className="flex items-center justify-between text-[9px] text-gray-400 font-mono border-t border-gray-100 pt-2.5">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-emerald-50 border border-emerald-100 rounded block" />
                  <span>{t("Tersedia")}</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-[#315B4F] rounded block" />
                  <span>{t("Terpilih")}</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-rose-50 border border-rose-100 rounded block" />
                  <span>{t("Penuh")}</span>
                </span>
              </div>
            </div>

            {/* Domestic / Foreigner Nationality Category Selector */}
            <div className={`p-4 rounded-2xl border space-y-3 transition-all ${
              selectedBatchId 
                ? "bg-gradient-to-br from-emerald-50/80 to-[#315B4F]/5 border-[#315B4F]/25 shadow-sm ring-1 ring-[#315B4F]/10" 
                : "bg-gray-50/80 border-gray-200"
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-[#315B4F]" />
                  <span>{t("Kategori Tamu / Guest Category")}</span>
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono tracking-wider ${
                  nationalityType === 'WNI' 
                    ? "bg-emerald-100 text-[#315B4F] border border-emerald-200" 
                    : nationalityType === 'WNA_CHINA'
                      ? "bg-amber-100 text-amber-900 border border-amber-200"
                      : nationalityType === 'WNA_EUROPE' || nationalityType === 'WNA'
                        ? "bg-blue-100 text-blue-800 border border-blue-200"
                        : "bg-gray-100 text-gray-500 border border-gray-200"
                }`}>
                  {nationalityType === 'WNI' 
                    ? "🇮🇩 Domestic" 
                    : nationalityType === 'WNA_CHINA' 
                      ? "🇨🇳 Foreigner (China)" 
                      : nationalityType === 'WNA_EUROPE' 
                        ? "🌐 Foreigner (International)" 
                        : nationalityType === 'WNA'
                          ? "🌐 Foreigner"
                          : t("Pilih Kategori Tamu")
                  }
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setNationalityType('WNI')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between select-none ${
                    nationalityType === 'WNI'
                      ? "bg-[#315B4F] text-white border-[#315B4F] shadow-md ring-2 ring-[#315B4F]/20"
                      : "bg-white text-gray-700 border-gray-200 hover:border-emerald-300 hover:bg-gray-50/80"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm leading-none">🇮🇩</span>
                      <span className="font-extrabold text-xs">Domestic</span>
                    </div>
                    {nationalityType === 'WNI' && <Check className="w-4 h-4 text-[#D6B16D]" />}
                  </div>
                  <div className="mt-1">
                    <span className={`block text-[10px] ${nationalityType === 'WNI' ? "text-emerald-100" : "text-gray-400"}`}>
                      KTP / Paspor RI
                    </span>
                    <span className={`block text-[11px] font-bold font-mono ${nationalityType === 'WNI' ? "text-[#D6B16D]" : "text-[#315B4F]"}`}>
                      {formatPrice(selectedBatch ? selectedBatch.price : (trip.startingPrice || 150))}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (nationalityType !== 'WNA_CHINA' && nationalityType !== 'WNA_EUROPE') {
                      setNationalityType('WNA_CHINA');
                    }
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between select-none ${
                    (nationalityType === 'WNA_CHINA' || nationalityType === 'WNA_EUROPE' || nationalityType === 'WNA')
                      ? "bg-[#315B4F] text-white border-[#315B4F] shadow-md ring-2 ring-[#315B4F]/20"
                      : "bg-white text-gray-700 border-gray-200 hover:border-emerald-300 hover:bg-gray-50/80"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Globe className={`w-3.5 h-3.5 ${(nationalityType === 'WNA_CHINA' || nationalityType === 'WNA_EUROPE' || nationalityType === 'WNA') ? "text-[#D6B16D]" : "text-[#315B4F]"}`} />
                      <span className="font-extrabold text-xs">Foreigner</span>
                    </div>
                    {(nationalityType === 'WNA_CHINA' || nationalityType === 'WNA_EUROPE' || nationalityType === 'WNA') && (
                      <Check className="w-4 h-4 text-[#D6B16D]" />
                    )}
                  </div>
                  <div className="mt-1">
                    <span className={`block text-[10px] ${(nationalityType === 'WNA_CHINA' || nationalityType === 'WNA_EUROPE' || nationalityType === 'WNA') ? "text-emerald-100" : "text-gray-400"}`}>
                      Non-Indonesian
                    </span>
                    <span className={`block text-[11px] font-bold font-mono ${(nationalityType === 'WNA_CHINA' || nationalityType === 'WNA_EUROPE' || nationalityType === 'WNA') ? "text-[#D6B16D]" : "text-[#315B4F]"}`}>
                      {formatPrice(selectedBatch ? (selectedBatch.wnaPrice || selectedBatch.price + 20) : (trip.wnaStartingPrice || (trip.startingPrice || 150) + 20))}
                    </span>
                  </div>
                </button>
              </div>

              {/* Subcategory toggle when Foreigner is selected */}
              {(nationalityType === 'WNA' || nationalityType === 'WNA_CHINA' || nationalityType === 'WNA_EUROPE') && (
                <div className="pt-2 border-t border-emerald-200/60 space-y-2 animate-fade-in">
                  <span className="text-[10px] font-bold text-gray-700 block">Pilih Asal Negara / Region:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNationalityType('WNA_CHINA')}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        nationalityType === 'WNA_CHINA'
                          ? "bg-[#315B4F] text-white border-[#315B4F] shadow-sm ring-1 ring-[#315B4F]/30 font-bold"
                          : "bg-white text-gray-800 border-gray-200 hover:bg-emerald-50/60"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1.5">
                          <span className="text-sm leading-none">🇨🇳</span>
                          <span>China</span>
                        </span>
                        {nationalityType === 'WNA_CHINA' && <Check className="w-3.5 h-3.5 text-[#D6B16D]" />}
                      </div>
                      <span className={`text-[9px] mt-0.5 block ${nationalityType === 'WNA_CHINA' ? "text-emerald-200" : "text-gray-400"}`}>
                        WeChat / RED ID
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNationalityType('WNA_EUROPE')}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        nationalityType === 'WNA_EUROPE'
                          ? "bg-[#315B4F] text-white border-[#315B4F] shadow-sm ring-1 ring-[#315B4F]/30 font-bold"
                          : "bg-white text-gray-800 border-gray-200 hover:bg-emerald-50/60"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-blue-500" />
                          <span>International</span>
                        </span>
                        {nationalityType === 'WNA_EUROPE' && <Check className="w-3.5 h-3.5 text-[#D6B16D]" />}
                      </div>
                      <span className={`text-[9px] mt-0.5 block ${nationalityType === 'WNA_EUROPE' ? "text-emerald-200" : "text-gray-400"}`}>
                        Global / WhatsApp
                      </span>
                    </button>
                  </div>
                </div>
              )}

              <p className="text-[10px] text-gray-500 italic">
                *{t("Tarif Foreigner mencakup biaya tiket masuk Taman Nasional Bromo / Ijen untuk wisatawan mancanegara.")}
              </p>
            </div>

            {/* Dynamic visual price and status readout of selected batch */}
            {selectedBatch && (
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100/70 space-y-2.5 animate-fade-in text-xs font-medium">
                <div className="flex items-center justify-between text-gray-500">
                  <span>{t("Selected Date")}</span>
                  <span className="font-bold text-[#315B4F] font-mono">{formatDate(selectedBatch.departureDate)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-500">
                  <span>{t("Kategori Tamu")}</span>
                  <span className={`font-mono font-bold rounded-md px-2 py-0.5 text-[10px] ${
                    nationalityType === 'WNI' 
                      ? "text-[#315B4F] bg-emerald-50 border border-emerald-200" 
                      : nationalityType === 'WNA_CHINA'
                        ? "text-amber-900 bg-amber-50 border border-amber-200"
                        : "text-blue-800 bg-blue-50 border border-blue-200"
                  }`}>
                    {nationalityType === 'WNI' 
                      ? "🇮🇩 Domestic" 
                      : nationalityType === 'WNA_CHINA' 
                        ? "🇨🇳 Foreigner (China)" 
                        : "🌐 Foreigner (International)"
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between text-gray-500">
                  <span>{t("Jumlah Peserta Terisi")}</span>
                  <span className="font-mono font-bold text-gray-800">
                    {Math.max(0, selectedBatch.quota - selectedBatch.availableSeats)} / {selectedBatch.quota} Peserta
                  </span>
                </div>
                <div className="flex items-center justify-between text-gray-500">
                  <span>{t("Sisa Tempat Duduk")}</span>
                  <span className={`font-mono font-bold uppercase rounded-md px-2 py-0.5 text-[9px] ${
                    selectedBatch.availableSeats <= 0
                      ? "text-rose-700 bg-rose-50 border border-rose-200"
                      : selectedBatch.availableSeats <= 3
                        ? "text-amber-700 bg-amber-50 border border-amber-200"
                        : "text-emerald-700 bg-emerald-50 border border-emerald-200"
                  }`}>
                    {selectedBatch.availableSeats <= 0 ? "FULL / Kuota Habis" : `${selectedBatch.availableSeats} ${t("Left")}`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-gray-500">
                  <span>{t("Tarif per Orang")}</span>
                  <span className="font-bold text-gray-800">{formatPrice(getEffectiveUnitPrice(selectedBatch))}</span>
                </div>
                <div className="border-t border-gray-200 pt-2.5 flex items-center justify-between font-bold">
                  <span className="text-gray-700">{t("Subtotal (1 Orang)")}</span>
                  <span className="text-sm font-display font-black text-[#315B4F]">
                    {formatPrice(getEffectiveUnitPrice(selectedBatch))}
                  </span>
                </div>
              </div>
            )}

            {/* Main checkout submit */}
            <button
              id="btn-register-booking"
              disabled={!selectedBatchId || !nationalityType}
              onClick={() => {
                if (selectedBatchId && nationalityType) {
                  trackBookNowClick(trip.title, 'Open Trip', trip.id);
                  onBook(selectedBatchId, nationalityType);
                }
              }}
              className={`w-full py-3.5 rounded-2xl font-display font-bold text-xs uppercase tracking-widest text-center transition-all ${
                selectedBatchId && nationalityType
                  ? "bg-[#315B4F] text-white hover:bg-[#203c34] cursor-pointer shadow-md"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {!selectedBatchId 
                ? t("Pilih Tanggal Keberangkatan")
                : !nationalityType
                  ? t("Pilih Kategori Tamu (Domestic / Foreigner)")
                  : t("Continue to Registration")
              }
            </button>

            <div className="flex items-center justify-center space-x-1.5 text-[10px] text-gray-400 font-mono text-center">
              <Sparkles className="w-3.5 h-3.5 text-[#D6B16D]" />
              <span>{t("Real-time Secure Checkouts Locked")}</span>
            </div>
          </div>
        </div>

      </div>

       {/* Similar Trips Section (auto-generated based on categories/other catalog packages) */}
      {similarTrips.length > 0 && (
        <section id="similar-trips-catalog-tray" className="border-t border-gray-100 pt-12 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-display font-bold text-gray-900 flex items-center space-x-2">
              <Layers className="w-5 h-5 text-[#315B4F]" />
              <span>{t("Trip Serupa (Similar Trips)")}</span>
            </h2>
            <p className="text-xs text-gray-400">{t("Explore other breathtaking destinations offered by Smart Journey Travel.")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarTrips.map((otherTrip) => (
              <div 
                key={otherTrip.id}
                onClick={() => onSelectTrip && onSelectTrip(otherTrip.slug)}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 flex flex-col"
              >
                <div className="relative h-44 overflow-hidden bg-gray-100">
                  <img 
                    src={otherTrip.coverImage} 
                    alt={t(otherTrip.title)} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px] font-bold">
                    {t(otherTrip.duration)}
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
                  <div className="space-y-1">
                    <h3 className="font-display font-bold text-gray-900 text-sm group-hover:text-[#315B4F] transition-colors leading-snug line-clamp-1">
                      {t(otherTrip.title)}
                    </h3>
                    <p className="text-xs text-gray-400 flex items-center space-x-1 font-sans">
                      <MapPin className="w-3 h-3 text-[#D6B16D]" />
                      <span>{t(otherTrip.location)}</span>
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-50 pt-2.5 mt-auto">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono">{t("starting rate") === "starting rate" ? "From" : t("starting rate")}</span>
                    <span className="font-display font-extrabold text-[#315B4F] text-xs sm:text-sm">
                      {formatPrice(otherTrip.startingPrice || 150)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Lightbox Photo Preview Modal Modal */}
      {activePhoto && (
        <div 
          onClick={() => setActivePhoto(null)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in cursor-zoom-out"
        >
          <div className="relative max-w-5xl w-full max-h-[85vh] flex items-center justify-center">
            {/* Visual Close button */}
            <button 
              className="absolute -top-12 right-0 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full cursor-pointer"
              onClick={() => setActivePhoto(null)}
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={activePhoto} 
              alt="Lightbox display full-size preview"
              referrerPolicy="no-referrer"
              className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl border border-white/10 animate-scale-up"
            />
          </div>
        </div>
      )}

    </div>
  );
}
