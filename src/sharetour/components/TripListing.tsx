import React, { useState } from "react";
import { Trip, Batch } from "../types";
import { 
  MapPin, 
  Clock, 
  Search, 
  Sparkles,
  ChevronRight,
  ClipboardList,
  Compass,
  ShieldCheck,
  Send,
  Calendar,
  User,
  CreditCard,
  Check
} from "lucide-react";
import { useLanguageCurrency } from "../LanguageCurrencyContext";
import TourFilterBar from "../../components/TourFilterBar";
import { matchesTourFilter } from "../../utils/tourFilterUtils";

interface TripListingProps {
  trips: Trip[];
  batches: Batch[];
  onSelectTrip: (slug: string) => void;
  onNavigateToCheckStatus: () => void;
}

export default function TripListing({ trips, batches, onSelectTrip, onNavigateToCheckStatus }: TripListingProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDuration, setSelectedDuration] = useState<string>("all");
  const [selectedExperience, setSelectedExperience] = useState<string>("all");
  const [activeStep, setActiveStep] = useState(0);
  const { t, formatPrice } = useLanguageCurrency();

  const filteredTrips = trips.filter((trip) => {
    const isPublished = trip.status === undefined || trip.status === "published";
    if (!isPublished) return false;

    // Filter by Duration & Experience Category
    if (!matchesTourFilter(trip as any, selectedDuration, selectedExperience)) {
      return false;
    }

    if (!searchQuery.trim()) return true;

    // Use lowercase translations as fallback in search query matching
    const translatedTitle = t(trip.title).toLowerCase();
    const translatedLocation = t(trip.location).toLowerCase();
    const translatedDescription = t(trip.description).toLowerCase();
    const q = searchQuery.toLowerCase();

    return (
      trip.title.toLowerCase().includes(q) ||
      trip.location.toLowerCase().includes(q) ||
      trip.description.toLowerCase().includes(q) ||
      translatedTitle.includes(q) ||
      translatedLocation.includes(q) ||
      translatedDescription.includes(q)
    );
  });

  return (
    <div className="space-y-20 pb-20 font-sans" id="luxury-trip-listing-container">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs font-medium text-neutral-500 mb-4 px-2">
        <a href="#/" className="hover:text-amber-600 transition-colors">Home</a>
        <span>/</span>
        <span className="text-neutral-900 font-semibold">{t("Share Tour")}</span>
      </nav>

      {/* 1. HERO SECTION WITH NATURE BACKGROUND & PREMIUM GRADIENT OVERLAY */}
      <section 
        className="relative rounded-3xl overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.15)] bg-[#0f172a] text-white py-16 sm:py-24 px-6 sm:px-12 md:px-16"
        id="hero-banner-section"
      >
        {/* Background Image with 40% Dark Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center mix-blend-multiply opacity-50" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1600&q=75')" }}
          aria-hidden="true"
        />
        {/* Radial Luxury Glow Ambient Effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#1F2E2A]/95 via-[#315B4F]/40 to-transparent opacity-80 pointer-events-none" />
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-[#D6B16D]/15 blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl space-y-8" id="hero-headlines">
          {/* Subheadline */}
          <div className="inline-flex items-center space-x-2 bg-[#D6B16D]/15 text-white px-4 py-2 rounded-full text-xs sm:text-sm font-sans font-medium tracking-wider uppercase border border-[#D6B16D]/20 shadow-lg select-none">
            <Sparkles className="w-4 h-4 text-[#D6B16D] animate-pulse" />
            <span>{t("Premium Nature Tour Packages")}</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-extrabold text-white tracking-tight leading-none max-w-3xl">
            {t("Informasi & Booking")} <br className="hidden md:block"/>
            <span className="text-[#D6B16D]">
              {t("Share Tour")}
            </span>
          </h1>

          {/* Description */}
          <p className="text-gray-100 font-sans font-normal text-sm sm:text-base leading-relaxed max-w-xl opacity-90">
            {t("Configure your explorer profiles and lock your departure quota before seats deplete.")}
          </p>

          {/* Luxury CTA Buttons */}
          <div className="flex flex-wrap gap-4 pt-2">
            {/* Primary CTA Button */}
            <button
              id="hero-explore-btn"
              onClick={() => {
                document.getElementById("signature-tours-sec")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="bg-[#D6B16D] text-[#315B4F] hover:bg-[#cda45a] hover:scale-105 active:scale-95 font-display font-bold text-xs sm:text-sm tracking-widest px-8 py-4 rounded-xl transition-all duration-200 cursor-pointer text-center block"
            >
              {t("Explore Tour")}
            </button>
            {/* Secondary CTA Button */}
            <button
              id="hero-status-btn"
              onClick={onNavigateToCheckStatus}
              className="border-2 border-[#D6B16D]/80 text-[#D6B16D] hover:bg-[#D6B16D]/10 hover:scale-105 active:scale-95 font-display font-bold text-xs sm:text-sm tracking-widest px-8 py-4 rounded-xl transition-all duration-200 cursor-pointer text-center block"
            >
              {t("Verify My Ticket")}
            </button>
          </div>
        </div>
      </section>

      {/* 2. TRIPS CONTROLS & LUXURY SEARCH BAR */}
      <section className="space-y-4" id="search-filter-controls">
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-100 shadow-[0_12px_30px_rgba(0,0,0,0.04)] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#315B4F] shrink-0 ml-2" />
          <input
            id="trip-search"
            type="text"
            placeholder={t("Search and filter tours...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2 bg-transparent text-gray-800 font-sans text-sm placeholder-gray-400 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 cursor-pointer font-bold"
            >
              Clear
            </button>
          )}
        </div>

        {/* Professional Tour Filter Bar (Duration & Experience Category) */}
        <TourFilterBar
          selectedDuration={selectedDuration}
          onSelectDuration={setSelectedDuration}
          selectedExperience={selectedExperience}
          onSelectExperience={setSelectedExperience}
          onResetFilters={() => {
            setSelectedDuration("all");
            setSelectedExperience("all");
            setSearchQuery("");
          }}
          totalFilteredCount={filteredTrips.length}
          totalAvailableCount={trips.length}
        />
      </section>

      {/* 3. SIGNATURE TOURS CARD SHOWCASE */}
      <section className="space-y-8 scroll-mt-24" id="signature-tours-sec">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-gray-900 tracking-tight leading-tight">
            {t("Our Signature Tours")}
          </h2>
          <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto">
            {t("Curated micro-expeditions for environment advocates and outdoor explorers.")}
          </p>
          <div className="w-16 h-1 bg-[#315B4F] mx-auto rounded-full mt-1.5" />
        </div>

        {/* Grid of luxury packages */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTrips.length > 0 ? (
            filteredTrips.map((trip) => {
              const tripBatches = batches.filter((b) => b.tripId === trip.id);
              const openBatchesCount = tripBatches.filter((b) => b.status === "Open").length;

              return (
                <article
                  key={trip.id}
                  id={`trip-card-${trip.slug}`}
                  onClick={() => onSelectTrip(trip.slug)}
                  className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_45px_rgba(49,91,79,0.06)] hover:border-[#315B4F]/30 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                >
                  {/* Visual Cover image frame */}
                  <div className="relative h-56 overflow-hidden bg-gray-100">
                    <img
                      src={trip.coverImage}
                      alt={t(trip.title)}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Dark gradient shadow inside image */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Absolute Top Left badges */}
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center space-x-1 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-md border border-white/10 shadow-md">
                        <MapPin className="w-3.5 h-3.5 text-[#D6B16D]" />
                        <span className="tracking-wide uppercase text-[10px]">{t(trip.location).split(",")[0]}</span>
                      </span>
                    </div>

                    {/* Absolute Top Right: Standout Golden Amber Ribbon Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 text-neutral-950 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-amber-500/35 border border-white/60 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 fill-neutral-950 text-neutral-950" />
                        <span>{trip.slug.includes("bromo") ? "BEST SELLER" : "OPEN TRIP"}</span>
                      </span>
                    </div>

                    {/* Open Batches Indicator */}
                    <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm border border-gray-100 text-gray-800 font-mono text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider shadow-sm">
                      {openBatchesCount > 0 ? (
                        <span className="text-emerald-700">{openBatchesCount} {t("Batches Open")}</span>
                      ) : (
                        <span className="text-gray-400">{t("Sold Out")}</span>
                      )}
                    </div>
                  </div>

                  {/* Card Content Description */}
                  <div className="p-6 flex flex-col flex-1 space-y-4">
                    {/* Duration with icon */}
                    <div className="flex items-center space-x-2 text-xs text-gray-500 font-sans font-medium">
                      <span className="flex items-center space-x-1 bg-gray-50 px-2 py-0.5 rounded-md text-gray-600 border border-gray-100">
                        <Clock className="w-3.5 h-3.5 text-[#D6B16D]" />
                        <span className="uppercase text-[10px] font-semibold font-mono">{t(trip.duration)}</span>
                      </span>
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <h3 className="text-base sm:text-lg font-display font-bold text-gray-905 group-hover:text-[#315B4F] transition-colors leading-tight">
                        {t(trip.title)}
                      </h3>
                      <p className="text-xs sm:text-xs text-gray-500 font-sans font-normal leading-relaxed line-clamp-2">
                        {t(trip.description)}
                      </p>
                    </div>

                    {/* Card Price Line & Explore Details */}
                    <div className="border-t border-gray-50 pt-3 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] text-gray-400 block uppercase tracking-wider font-bold">{t("Starting rate")}</span>
                        <span className="text-[#315B4F] font-display font-black text-sm sm:text-base leading-none block">
                          {formatPrice(trip?.startingPrice || 150)}
                        </span>
                      </div>

                      <span className="text-xs font-sans font-bold text-[#315B4F] flex items-center gap-1 group-hover:text-[#203c34] transition-colors">
                        <span>{t("Lihat Detail") || "Lihat Detail"}</span>
                        <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="col-span-full bg-gray-50/50 p-12 text-center rounded-2xl border border-dashed border-gray-200">
              <p className="text-gray-500 text-sm font-sans">{t("No vacations or trips found matching your current search parameters.")}</p>
              <button
                onClick={() => { setSearchQuery(""); setSelectedDuration("all"); setSelectedExperience("all"); }}
                className="mt-4 inline-flex items-center space-x-1 text-xs text-[#315B4F] font-bold underline cursor-pointer hover:text-[#203c34] font-sans"
              >
                {t("Reset Search Filters")}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 6. HYPER-MODERN "SMART JOURNEY" HORIZONTAL PROCESS TIMELINE */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-white to-slate-50/40 relative overflow-hidden border-t border-gray-100" id="how-it-works-section">
        {/* Subtle background glows */}
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-[#315B4F]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-[#D6B16D]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          
          {/* Section Title */}
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-[10px] text-[#D6B16D] font-mono tracking-[0.3em] uppercase font-bold px-3 py-1 bg-[#315B4F]/5 rounded-full border border-[#315B4F]/10 inline-block">
              {t("Interactive Booking System")}
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-light text-gray-950 tracking-tight leading-tight">
              Smart Journey: <span className="font-extrabold text-[#315B4F]">{t("Alur Reservasi Modern")}</span>
            </h2>
            <div className="w-12 h-0.5 bg-[#D6B16D] mx-auto mt-2" />
          </div>

          {/* Desktop Horizontal Process Timeline Canvas (S-Curve & Floating Pill Cards) */}
          <div className="hidden md:block max-w-5xl mx-auto relative h-[320px] mb-12">
            
            {/* SVG Wave Ribbon & Connection Lines (Precision Geometric Blueprint matching reference image) */}
            <div className="absolute inset-0 pointer-events-none z-0">
              <svg className="w-full h-full" viewBox="0 0 800 320" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Horizontal Center Axis Timeline */}
                <line 
                  x1="60" y1="160" x2="740" y2="160" 
                  stroke="#315B4F" strokeWidth="2" strokeOpacity="0.1" 
                  strokeDasharray="6 6" 
                />

                {/* Vertical Connector Lines attaching cards to the timeline nodes */}
                <line x1="100" y1="65" x2="100" y2="160" stroke="#315B4F" strokeWidth="1.5" strokeOpacity="0.15" strokeDasharray="4 4" />
                <line x1="300" y1="160" x2="300" y2="255" stroke="#315B4F" strokeWidth="1.5" strokeOpacity="0.15" strokeDasharray="4 4" />
                <line x1="500" y1="65" x2="500" y2="160" stroke="#315B4F" strokeWidth="1.5" strokeOpacity="0.15" strokeDasharray="4 4" />
                <line x1="700" y1="160" x2="700" y2="255" stroke="#315B4F" strokeWidth="1.5" strokeOpacity="0.15" strokeDasharray="4 4" />

                {/* The S-Curves Wave Ribbon looping elegantly between steps */}
                <path 
                  d="M 100 65 C 200 65, 200 255, 300 255 C 400 255, 400 65, 500 65 C 600 65, 600 255, 700 255" 
                  stroke="#315B4F" 
                  strokeWidth="2.5" 
                  strokeOpacity="0.25" 
                  strokeDasharray="3 4"
                  fill="none" 
                />

                {/* Nodes Dots at intersections */}
                <circle cx="100" cy="160" r="6" fill="#315B4F" stroke="white" strokeWidth="2.5" />
                <circle cx="300" cy="160" r="6" fill="#315B4F" stroke="white" strokeWidth="2.5" />
                <circle cx="500" cy="160" r="6" fill="#315B4F" stroke="white" strokeWidth="2.5" />
                <circle cx="700" cy="160" r="6" fill="#315B4F" stroke="white" strokeWidth="2.5" />

                {/* Highlight Active Node Pulse */}
                {activeStep === 0 && <circle cx="100" cy="160" r="12" fill="#315B4F" fillOpacity="0.15" className="animate-pulse" />}
                {activeStep === 1 && <circle cx="300" cy="160" r="12" fill="#315B4F" fillOpacity="0.15" className="animate-pulse" />}
                {activeStep === 2 && <circle cx="500" cy="160" r="12" fill="#315B4F" fillOpacity="0.15" className="animate-pulse" />}
                {activeStep === 3 && <circle cx="700" cy="160" r="12" fill="#315B4F" fillOpacity="0.15" className="animate-pulse" />}
              </svg>
            </div>

            {/* Step Touchpoints (Zig-zag grid alignments) */}
            <div className="absolute inset-x-0 top-0 bottom-0 z-10 pointer-events-none">
              
              {/* Step 1: Choose Trip (Top Row) */}
              <div className="absolute left-[12.5%] top-[12px] -translate-x-1/2 pointer-events-auto">
                <button
                  type="button"
                  onClick={() => setActiveStep(0)}
                  className={`px-6 py-[14px] bg-white/90 backdrop-blur-md rounded-full border text-left flex items-center gap-4 transition-all duration-300 cursor-pointer select-none group min-w-[210px] sm:min-w-[230px] ${
                    activeStep === 0 
                      ? "shadow-[0_20px_40px_rgba(49,91,79,0.12)] border-[#315B4F]/40 -translate-y-[2px]" 
                      : "border-gray-150-80 shadow-[0_5px_22px_rgba(0,0,0,0.03)] hover:border-[#315B4F]/20 hover:shadow-[0_15px_30px_rgba(49,91,79,0.06)]"
                  }`}
                >
                  <div className={`p-3 rounded-full border transition-colors ${
                    activeStep === 0 ? "bg-[#315B4F] text-white border-transparent" : "bg-gray-50 text-[#315B4F] border-gray-100 group-hover:bg-[#315B4F]/5"
                  }`}>
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[8px] font-mono font-bold text-[#D6B16D] tracking-wider block leading-none mb-1">01 / {t("CHOOSE")}</span>
                    <h3 className="font-sans font-extrabold text-gray-900 text-xs sm:text-sm tracking-tight leading-none">{t("Choose Trip")}</h3>
                  </div>
                </button>
              </div>

              {/* Step 2: Fill Details (Bottom Row) */}
              <div className="absolute left-[37.5%] bottom-[12px] -translate-x-1/2 pointer-events-auto">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className={`px-6 py-[14px] bg-white/90 backdrop-blur-md rounded-full border text-left flex items-center gap-4 transition-all duration-300 cursor-pointer select-none group min-w-[210px] sm:min-w-[230px] ${
                    activeStep === 1 
                      ? "shadow-[0_20px_40px_rgba(49,91,79,0.12)] border-[#315B4F]/40 -translate-y-[2px]" 
                      : "border-gray-150-80 shadow-[0_5px_22px_rgba(0,0,0,0.03)] hover:border-[#315B4F]/20 hover:shadow-[0_15px_30px_rgba(49,91,79,0.06)]"
                  }`}
                >
                  <div className={`p-3 rounded-full border transition-colors ${
                    activeStep === 1 ? "bg-[#315B4F] text-white border-transparent" : "bg-gray-50 text-[#315B4F] border-gray-100 group-hover:bg-[#315B4F]/5"
                  }`}>
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[8px] font-mono font-bold text-[#D6B16D] tracking-wider block leading-none mb-1">02 / {t("DETAILS")}</span>
                    <h3 className="font-sans font-extrabold text-gray-900 text-xs sm:text-sm tracking-tight leading-none">{t("Fill Details")}</h3>
                  </div>
                </button>
              </div>

              {/* Step 3: Payment (Top Row) */}
              <div className="absolute left-[62.5%] top-[12px] -translate-x-1/2 pointer-events-auto">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className={`px-6 py-[14px] bg-white/90 backdrop-blur-md rounded-full border text-left flex items-center gap-4 transition-all duration-300 cursor-pointer select-none group min-w-[210px] sm:min-w-[230px] ${
                    activeStep === 2 
                      ? "shadow-[0_20px_40px_rgba(49,91,79,0.12)] border-[#315B4F]/40 -translate-y-[2px]" 
                      : "border-gray-150-80 shadow-[0_5px_22px_rgba(0,0,0,0.03)] hover:border-[#315B4F]/20 hover:shadow-[0_15px_30px_rgba(49,91,79,0.06)]"
                  }`}
                >
                  <div className={`p-3 rounded-full border transition-colors ${
                    activeStep === 2 ? "bg-[#315B4F] text-white border-transparent" : "bg-gray-50 text-[#315B4F] border-gray-100 group-hover:bg-[#315B4F]/5"
                  }`}>
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[8px] font-mono font-bold text-[#D6B16D] tracking-wider block leading-none mb-1">03 / {t("DEPOSIT")}</span>
                    <h3 className="font-sans font-extrabold text-gray-900 text-xs sm:text-sm tracking-tight leading-none">{t("Secure Deposit")}</h3>
                  </div>
                </button>
              </div>

              {/* Step 4: Confirmation (Bottom Row) */}
              <div className="absolute left-[87.5%] bottom-[12px] -translate-x-1/2 pointer-events-auto">
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className={`px-6 py-[14px] bg-white/90 backdrop-blur-md rounded-full border text-left flex items-center gap-4 transition-all duration-300 cursor-pointer select-none group min-w-[210px] sm:min-w-[230px] ${
                    activeStep === 3 
                      ? "shadow-[0_20px_40px_rgba(49,91,79,0.12)] border-[#315B4F]/40 -translate-y-[2px]" 
                      : "border-gray-150-80 shadow-[0_5px_22px_rgba(0,0,0,0.03)] hover:border-[#315B4F]/20 hover:shadow-[0_15px_30px_rgba(49,91,79,0.06)]"
                  }`}
                >
                  <div className={`p-3 rounded-full border transition-colors ${
                    activeStep === 3 ? "bg-[#315B4F] text-white border-transparent" : "bg-gray-50 text-[#315B4F] border-gray-100 group-hover:bg-[#315B4F]/5"
                  }`}>
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[8px] font-mono font-bold text-[#D6B16D] tracking-wider block leading-none mb-1">04 / {t("TICKET")}</span>
                    <h3 className="font-sans font-extrabold text-gray-900 text-xs sm:text-sm tracking-tight leading-none">{t("Get E-Ticket")}</h3>
                  </div>
                </button>
              </div>

            </div>

          </div>

          {/* Mobile compact 4-column layout */}
          <div className="md:hidden max-w-sm mx-auto mb-8 grid grid-cols-4 gap-2 px-1">
            {[
              { label: "Trip", icon: Calendar, num: "01" },
              { label: "Details", icon: User, num: "02" },
              { label: "Deposit", icon: CreditCard, num: "03" },
              { label: "Ticket", icon: Check, num: "04" }
            ].map((step, idx) => {
              const Icon = step.icon;
              const isActive = activeStep === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveStep(idx)}
                  className={`py-3 px-1 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isActive 
                      ? "bg-[#315B4F] text-white border-[#315B4F] shadow-md shadow-[#315B4F]/15 ring-2 ring-[#315B4F]/10" 
                      : "bg-white text-gray-500 border-gray-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[8px] font-mono font-bold leading-none">0{idx + 1}</span>
                  <span className="text-[9px] font-sans font-bold leading-none truncate max-w-full">{t(step.label)}</span>
                </button>
              );
            })}
          </div>

          {/* Detailed Content Display Card */}
          <div className="max-w-3xl mx-auto bg-[#102c24] text-white rounded-3xl p-6 sm:p-8 border border-white/5 relative overflow-hidden shadow-2xl transition-all duration-500">
            {/* Visual Backglows */}
            <div className="absolute right-0 top-0 w-80 h-80 bg-[#D6B16D]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute left-0 bottom-0 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-emerald-950/80 pb-4 mb-6 gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D6B16D] animate-ping" />
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#D6B16D] font-extrabold">
                  {t("GUIDE: STEP")} 0{activeStep + 1}
                </span>
              </div>
              <div className="text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-900/30">
                STATUS: {activeStep === 0 ? t("STATUS: EXPLORING") : activeStep === 1 ? t("STATUS: FORM_FILLING") : activeStep === 2 ? t("STATUS: SECURE_GATEWAY") : t("STATUS: TICKET_ISSUED")}
              </div>
            </div>

            <div className="relative z-10 space-y-5">
              <h3 className="font-display font-black text-lg sm:text-xl text-white tracking-tight leading-snug">
                {activeStep === 0 && t("Pilih Paket & Tentukan Jadwal Batch Keberangkatan")}
                {activeStep === 1 && t("Pengisian Formulir Manifest Penumpang Secara Lengkap")}
                {activeStep === 2 && t("Konfirmasi WhatsApp Admin & Deposit (DP) Aman")}
                {activeStep === 3 && t("Unduh E-Ticket Boarding Pass Berbarcode Resmi")}
              </h3>
              
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans font-light">
                {activeStep === 0 && t("Telusuri katalog paket pelayaran mewah kami di atas. Pilih dari berbagai rute, tipe kapal phinisi premium, serta durasi perjalanan impian Anda. Setelah menemukan batch tanggal keberangkatan yang ideal yang masih menyisakan kursi (cabin/bed), tentukan jumlah penumpang untuk memulai.")}
                {activeStep === 1 && t("Klik tombol booking pada paket tersebut dan isi detail formulir manifes resmi dengan lengkap. Anda hanya perlu menyertakan nama pinyin/paspor, ID WeChat, ID XiaoHongShu (Red ID), data WhatsApp aktif, kota domisili, serta rincian penerbangan kedatangan agar staf logistik kami dapat menjadwalkan layanan penjemputan bandara gratis.")}
                {activeStep === 2 && t("Setelah formulir terkirim, sistem kami akan langsung mengamankan slot manifes awal Anda. Hubungi Travel Coordinator kami via WhatsApp bersama Kode Booking Anda untuk menerima invoice resmi. Lakukan transfer pembayaran deposit (down payment) secara aman untuk mengunci seat kabin Anda secara permanen.")}
                {activeStep === 3 && t("Begitu pembayaran deposit diverifikasi aman oleh Admin, status reservasi Anda otomatis menjadi 'Telah Dikonfirmasi' (Confirmed). Anda dapat langsung mengakses menu 'Cek Status' di bagian atas halaman web ini, memasukkan Nomor WhatsApp / Kode Booking Anda, dan mengunduh E-Ticket Boarding Pass bertanda QR-Code dalam sekejap.")}
              </p>

              {/* Dynamic Step Checklist Bullets */}
              <div className="bg-emerald-950/40 rounded-2xl p-4 border border-emerald-900/30 space-y-3 mt-4">
                <span className="text-[10px] font-mono font-bold text-[#D6B16D] uppercase tracking-wider block">{t("Quick Checklist")}</span>
                <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {activeStep === 0 && [
                    "Telusuri katalog paket di atas",
                    "Pilih rute & tipe kapal phinisi",
                    "Tentukan batch tanggal aktif"
                  ].map((bullet, bidx) => (
                    <li key={bidx} className="flex items-center gap-2 text-xs text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D6B16D]" />
                      <span>{t(bullet)}</span>
                    </li>
                  ))}
                  {activeStep === 1 && [
                    "Isi nama resmi & nama Inggris",
                    "Isi ID WeChat & XiaoHongShu ID",
                    "Isi nomor penerbangan transfer"
                  ].map((bullet, bidx) => (
                    <li key={bidx} className="flex items-center gap-2 text-xs text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D6B16D]" />
                      <span>{t(bullet)}</span>
                    </li>
                  ))}
                  {activeStep === 2 && [
                    "Terima invoice dari admin via WA",
                    "Lakukan transfer deposit (DP)",
                    "Sistem otomatis mengunci seat"
                  ].map((bullet, bidx) => (
                    <li key={bidx} className="flex items-center gap-2 text-xs text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D6B16D]" />
                      <span>{t(bullet)}</span>
                    </li>
                  ))}
                  {activeStep === 3 && [
                    "Manifes tervalidasi Syahbandar",
                    "Boarding pass QR Code terbit",
                    "Unduh instan di 'Cek Status'"
                  ].map((bullet, bidx) => (
                    <li key={bidx} className="flex items-center gap-2 text-xs text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D6B16D]" />
                      <span>{t(bullet)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Selector micro pagination */}
              <div className="flex justify-between items-center pt-4 border-t border-white/5 gap-2 flex-wrap">
                <span className="text-[10px] text-gray-500 font-sans hidden sm:inline">{t("Klik pada tombol kartu di atas atau kelola di bawah untuk info detail:")}</span>
                <div className="flex gap-1.5">
                  {[0, 1, 2, 3].map((stepIdx) => (
                    <button
                      key={stepIdx}
                      type="button"
                      onClick={() => setActiveStep(stepIdx)}
                      className={`px-3 py-1 text-[10px] font-mono font-bold rounded-lg transition-all cursor-pointer ${
                        activeStep === stepIdx
                          ? "bg-[#D6B16D] text-[#315B4F] shadow-lg scale-105"
                          : "bg-emerald-950/60 text-emerald-400 hover:bg-emerald-900 border border-emerald-900"
                      }`}
                    >
                      0{stepIdx + 1}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Bottom Floating Status Check Block */}
      <section className="bg-emerald-50/20 rounded-3xl border border-emerald-100/50 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="font-display font-bold text-[#315B4F] text-xl sm:text-2xl">{t("Already booked an expedition?")}</h3>
          <p className="text-xs sm:text-sm text-gray-500 font-sans leading-normal">{t("Check your real-time verification logs or trace your trip itinerary voucher status instantly.")}</p>
        </div>
        <button
          id="listing-status-btn"
          onClick={onNavigateToCheckStatus}
          className="bg-[#315B4F] hover:bg-[#203c34] text-white px-6 py-3.5 rounded-2xl text-xs font-display font-bold uppercase tracking-widest transition-all cursor-pointer select-none text-center"
        >
          {t("Check Booking Details")}
        </button>
      </section>

    </div>
  );
}
