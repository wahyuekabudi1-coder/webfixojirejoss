import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../AppContext';
import { useLanguageCurrency } from '../sharetour/LanguageCurrencyContext';
import { 
  Shield, Sparkles, Star, Users, Briefcase, Car, Route, Plane, 
  Navigation, Calendar, Check, MessageSquare, ArrowRight, ArrowLeft, 
  Clock, Compass, Handshake, Globe, ChevronLeft, ChevronRight, 
  Heart, Mail, Send, CheckCircle2 
} from 'lucide-react';
import CheckoutModal from '../components/CheckoutModal';
import { motion, AnimatePresence } from 'motion/react';
import { OFFICIAL_PARTNERS, PartnerApp, PARTNERS_DATA_VERSION } from '../data/partnersData';
import TourFilterBar from '../components/TourFilterBar';
import { matchesTourFilter } from '../utils/tourFilterUtils';

const WHY_US_ICONS: Record<number, React.ReactNode> = {
  1: <Users className="h-5 w-5 sm:h-6 sm:w-6" />,
  2: <Shield className="h-5 w-5 sm:h-6 sm:w-6" />,
  3: <Car className="h-5 w-5 sm:h-6 sm:w-6" />,
  4: <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />,
  5: <Calendar className="h-5 w-5 sm:h-6 sm:w-6" />,
  6: <Compass className="h-5 w-5 sm:h-6 sm:w-6" />,
  7: <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />,
  8: <Route className="h-5 w-5 sm:h-6 sm:w-6" />,
};

export default function HomeView() {
  const { setPage, searchParams, setSearchParams, tours, reviews, addReview } = useApp();
  const { 
    t, 
    language, 
    formatPrice, 
    getTour, 
    getHeroSlides, 
    getWhyUs, 
    getDestinations 
  } = useLanguageCurrency();

  const heroSlides = getHeroSlides();
  const whyChooseUsItems = getWhyUs();
  const destinationsList = getDestinations();
  
  // Wishlist State
  const [wishlist, setWishlist] = useState<string[]>([]);
  const toggleWishlist = (tourId: string) => {
    setWishlist(prev => 
      prev.includes(tourId) 
        ? prev.filter(id => id !== tourId) 
        : [...prev, tourId]
    );
  };
  
  // Hero Slideshow State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideCandidateIndex, setSlideCandidateIndex] = useState<Record<number, number>>({});

  const getSlideImageSrc = (slideIndex: number) => {
    const slide = heroSlides[slideIndex];
    if (!slide) return '';
    const candidateIdx = slideCandidateIndex[slideIndex] ?? 0;
    if (slide.candidates && candidateIdx < slide.candidates.length) {
      return slide.candidates[candidateIdx];
    }
    return slide.fallback;
  };

  const handleSlideImageError = (slideIndex: number) => {
    setSlideCandidateIndex((prev) => {
      const currentIdx = prev[slideIndex] ?? 0;
      return { ...prev, [slideIndex]: currentIdx + 1 };
    });
  };

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(slideInterval);
  }, [heroSlides.length]);
  
  // Partnerships State
  const [partners, setPartners] = useState<PartnerApp[]>([]);
  React.useEffect(() => {
    const version = localStorage.getItem('smartjourney_partners_version');
    const stored = localStorage.getItem('smartjourney_partners');
    
    if (stored && version === PARTNERS_DATA_VERSION) {
      try {
        const parsed: PartnerApp[] = JSON.parse(stored);
        const hasOutdatedLogos = parsed.some(p => p.logoUrl && (p.logoUrl.includes('images.unsplash.com') || p.id === 'pegipegi'));
        if (hasOutdatedLogos || parsed.length === 0) {
          setPartners(OFFICIAL_PARTNERS);
          localStorage.setItem('smartjourney_partners', JSON.stringify(OFFICIAL_PARTNERS));
          localStorage.setItem('smartjourney_partners_version', PARTNERS_DATA_VERSION);
        } else {
          setPartners(parsed);
        }
      } catch (e) {
        console.error('Failed to parse partners in HomeView', e);
        setPartners(OFFICIAL_PARTNERS);
        localStorage.setItem('smartjourney_partners', JSON.stringify(OFFICIAL_PARTNERS));
        localStorage.setItem('smartjourney_partners_version', PARTNERS_DATA_VERSION);
      }
    } else {
      setPartners(OFFICIAL_PARTNERS);
      localStorage.setItem('smartjourney_partners', JSON.stringify(OFFICIAL_PARTNERS));
      localStorage.setItem('smartjourney_partners_version', PARTNERS_DATA_VERSION);
    }
  }, []);
  
  // Hero Search Widget State
  const [destination, setDestination] = useState('bromo');
  const [tourDate, setTourDate] = useState('');
  const [guests, setGuests] = useState(2);
  const [tourType, setTourType] = useState('Adventure');
  const [searchResults, setSearchResults] = useState<any>(null);

  // New Tour Filter State: Duration & Experience Category
  const [selectedDuration, setSelectedDuration] = useState<string>('all');
  const [selectedExperience, setSelectedExperience] = useState<string>('all');

  const filteredHomeTours = tours.filter((t) => 
    matchesTourFilter(t, selectedDuration, selectedExperience)
  );

  // Checkout Modal State
  const [selectedTourForBooking, setSelectedTourForBooking] = useState<any>(null);

  // Newsletter Subscription State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [newsletterError, setNewsletterError] = useState<string | null>(null);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@') || !newsletterEmail.includes('.')) {
      setNewsletterError(language === 'id' ? 'Silakan masukkan alamat email yang valid.' : language === 'zh' ? '请输入有效的电子邮箱地址。' : 'Please enter a valid email address.');
      return;
    }
    setNewsletterError(null);
    setIsSubscribed(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter tours based on search criteria
    const filtered = tours.filter(t => 
      t.id === destination || t.category.toLowerCase().includes(tourType.toLowerCase())
    );
    setSearchResults(filtered.length > 0 ? filtered : tours);
    
    // Smooth scroll down to results
    setTimeout(() => {
      const el = document.getElementById('search-results-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Only display reviews that are approved or have no status field (pre-seeded default reviews)
  const localReviews = reviews.filter(r => r.status !== 'pending');

  const [isHoveringReviews, setIsHoveringReviews] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const reviewsContainerRef = useRef<HTMLDivElement>(null);

  const handleReviewsScroll = () => {
    const container = reviewsContainerRef.current;
    if (!container) return;
    const maxScroll = container.scrollWidth - container.clientWidth;
    if (maxScroll <= 0) return;
    setScrollProgress(container.scrollLeft / maxScroll);
  };

  const scrollReviews = (direction: 'left' | 'right') => {
    const container = reviewsContainerRef.current;
    if (!container) return;
    
    const scrollAmount = container.clientWidth;
    if (direction === 'left') {
      if (container.scrollLeft <= 10) {
        container.scrollTo({
          left: container.scrollWidth - container.clientWidth,
          behavior: 'smooth'
        });
      } else {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      }
    } else {
      if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 15) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  const scrollToPercent = (percent: number) => {
    const container = reviewsContainerRef.current;
    if (!container) return;
    container.scrollTo({
      left: percent * (container.scrollWidth - container.clientWidth),
      behavior: 'smooth'
    });
  };

  // Auto-play interval - slides automatically and slowly to the right
  useEffect(() => {
    if (isHoveringReviews) return;
    const interval = setInterval(() => {
      scrollReviews('right');
    }, 5000);
    return () => clearInterval(interval);
  }, [isHoveringReviews, localReviews]);

  const triggerCheckout = (tour: any) => {
    setSelectedTourForBooking({
      tour: getTour(tour),
      details: {
        date: tourDate || '2026-07-10',
        guests: Number(guests),
        tourId: tour.id,
        tourType
      }
    });
  };

  // Interactive Services Directory State
  const [activeService, setActiveService] = useState<'tours' | 'share-tour' | 'airport' | 'taxi' | 'car-rental'>('tours');

  // Bento Grid Mouse Drag Scroll State
  const bentoRef = useRef<HTMLDivElement>(null);
  const [bentoDrag, setBentoDrag] = useState({
    isDown: false,
    startX: 0,
    scrollLeft: 0
  });

  const handleBentoMouseDown = (e: React.MouseEvent) => {
    const container = bentoRef.current;
    if (!container) return;
    setBentoDrag({
      isDown: true,
      startX: e.pageX - container.offsetLeft,
      scrollLeft: container.scrollLeft
    });
  };

  const handleBentoMouseLeave = () => {
    setBentoDrag(prev => ({ ...prev, isDown: false }));
  };

  const handleBentoMouseUp = () => {
    setBentoDrag(prev => ({ ...prev, isDown: false }));
  };

  const handleBentoMouseMove = (e: React.MouseEvent) => {
    if (!bentoDrag.isDown) return;
    e.preventDefault();
    const container = bentoRef.current;
    if (!container) return;
    const x = e.pageX - container.offsetLeft;
    const walk = (x - bentoDrag.startX) * 1.5;
    container.scrollLeft = bentoDrag.scrollLeft - walk;
  };

  const safeSlide = heroSlides[currentSlide] || heroSlides[0];

  return (
    <div id="home-view" className="relative text-neutral-800 overflow-hidden bg-white">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] lg:h-[80vh] lg:min-h-[640px] flex flex-col lg:flex-row items-center justify-center pt-20 pb-10 sm:pt-24 sm:pb-12 lg:pt-36 lg:pb-20 overflow-hidden bg-neutral-950 lg:bg-transparent">
        {/* Background Slideshow with Crossfade (Desktop only) */}
        <div className="absolute inset-0 z-0 hidden lg:block">
          <AnimatePresence initial={false}>
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <img
                src={getSlideImageSrc(currentSlide)}
                alt={safeSlide.title}
                className="w-full h-full object-cover"
                loading="eager"
                decoding="async"
                referrerPolicy="no-referrer"
                onError={() => handleSlideImageError(currentSlide)}
              />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-white via-black/40 to-black/60 z-[1]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center w-full">
          
          {/* Mobile/Tablet Inline Slideshow */}
          <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] md:aspect-[2/1] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl lg:hidden border border-neutral-800 bg-neutral-900 mb-6 z-10">
            <AnimatePresence initial={false}>
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <img
                  src={getSlideImageSrc(currentSlide)}
                  alt={safeSlide.title}
                  className="w-full h-full object-cover"
                  loading="eager"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  onError={() => handleSlideImageError(currentSlide)}
                />
              </motion.div>
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-neutral-950/40 z-[1]" />
          </div>

          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentSlide}-${language}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="space-y-6"
              >
                <span className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 font-extrabold uppercase tracking-widest font-mono text-[10px] sm:text-xs px-3.5 py-1.5 rounded-full border border-amber-500/30 backdrop-blur-sm drop-shadow-md">
                  ★ {safeSlide.tag}
                </span>
                <h1 className="text-3xl sm:text-5xl lg:text-6.5xl font-black tracking-tight text-white leading-tight drop-shadow-xl">
                  {safeSlide.title}
                </h1>
                <p className="text-sm sm:text-lg text-neutral-200 lg:text-neutral-100 font-medium max-w-2xl mx-auto drop-shadow-sm leading-relaxed">
                  {safeSlide.subtitle}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="pt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setPage('tours')}
                className="inline-flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 px-8 py-3.5 rounded-full text-xs font-extrabold uppercase tracking-widest shadow-lg hover:shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Compass className="h-4.5 w-4.5" />
                <span>{t('home.heroCtaTour')}</span>
              </button>
              <button
                onClick={() => setPage('share-tour')}
                className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-7 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Users className="h-4.5 w-4.5 text-amber-400" />
                <span>{t('home.heroCtaShare')}</span>
              </button>
            </div>
          </div>

          {/* Tour Search Widget */}
          <div className="mt-8 lg:mt-12 w-full max-w-4xl mx-auto bg-white/95 border border-neutral-200/80 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-2xl backdrop-blur-md text-neutral-800">
            <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
              
              {/* Destination */}
              <div className="text-left space-y-1">
                <label htmlFor="home-search-destination" className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest pl-1">
                  {t('home.searchDestinationLabel')}
                </label>
                <select
                  id="home-search-destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="bg-neutral-50 border border-neutral-200 text-neutral-800 rounded-xl px-3 py-3 text-base lg:text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
                >
                  <option value="bromo" className="bg-white text-neutral-800">
                    {language === 'zh' ? '布罗莫活火山 (Mount Bromo)' : language === 'id' ? 'Gunung Bromo Volcano' : 'Mount Bromo Volcano'}
                  </option>
                  <option value="ijen" className="bg-white text-neutral-800">
                    {language === 'zh' ? '宜珍火山神秘蓝火 (Ijen Crater)' : language === 'id' ? 'Kawah Ijen Api Biru' : 'Ijen Crater Blue Fire'}
                  </option>
                  <option value="tumpak-sewu" className="bg-white text-neutral-800">
                    {language === 'zh' ? '赛武千重瀑布 (Tumpak Sewu)' : language === 'id' ? 'Air Terjun Tumpak Sewu' : 'Tumpak Sewu Waterfall'}
                  </option>
                  <option value="malang-city" className="bg-white text-neutral-800">
                    {language === 'zh' ? '玛琅与巴图文化游 (Malang & Batu)' : language === 'id' ? 'Kota Malang & Wisata Batu' : 'Malang & Batu Heritage'}
                  </option>
                </select>
              </div>

              {/* Tour Date */}
              <div className="text-left space-y-1">
                <label htmlFor="home-search-date" className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest pl-1">
                  {t('home.searchDateLabel')}
                </label>
                <input
                  id="home-search-date"
                  type="date"
                  required
                  value={tourDate}
                  onChange={(e) => setTourDate(e.target.value)}
                  className="bg-neutral-50 border border-neutral-200 text-neutral-800 rounded-xl px-3 py-3 text-base lg:text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
                />
              </div>

              {/* Number of Guests */}
              <div className="text-left space-y-1">
                <label htmlFor="home-search-guests" className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest pl-1">
                  {t('home.searchGuestsLabel')}
                </label>
                <input
                  id="home-search-guests"
                  type="number"
                  min="1"
                  max="15"
                  required
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="bg-neutral-50 border border-neutral-200 text-neutral-800 rounded-xl px-3 py-3 text-base lg:text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
                />
              </div>

              {/* Tour Type */}
              <div className="text-left space-y-1">
                <label htmlFor="home-search-type" className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest pl-1">
                  {t('tours.sortBy')}
                </label>
                <select
                  id="home-search-type"
                  value={tourType}
                  onChange={(e) => setTourType(e.target.value)}
                  className="bg-neutral-50 border border-neutral-200 text-neutral-800 rounded-xl px-3 py-3 text-base lg:text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
                >
                  <option value="Adventure" className="bg-white text-neutral-800">{t('tours.filterAdventure')}</option>
                  <option value="Nature" className="bg-white text-neutral-800">{t('tours.filterNature')}</option>
                  <option value="Culture" className="bg-white text-neutral-800">{t('tours.filterCulture')}</option>
                </select>
              </div>

              {/* Search Button */}
              <div className="flex items-end">
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold py-3.5 rounded-xl text-sm w-full transition-all shadow-md shadow-amber-500/15 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  {t('home.searchButton')}
                </button>
              </div>

            </form>
          </div>
        </div>
      </section>

      {/* FIND YOUR PERFECT TRIP (DURATION & EXPERIENCE CATEGORY) */}
      <section id="find-your-perfect-trip-section" className="py-12 sm:py-16 bg-neutral-50/60 border-b border-neutral-200/80 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <TourFilterBar
            selectedDuration={selectedDuration}
            onSelectDuration={setSelectedDuration}
            selectedExperience={selectedExperience}
            onSelectExperience={setSelectedExperience}
            onResetFilters={() => {
              setSelectedDuration('all');
              setSelectedExperience('all');
            }}
            totalFilteredCount={filteredHomeTours.length}
            totalAvailableCount={tours.length}
          />

          {/* TOUR RESULTS */}
          <div id="tour-results" className="space-y-6 scroll-mt-24">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                  {language === 'zh' ? '行程推荐结果' : language === 'id' ? 'Hasil Paket Tour' : 'Tour Results'}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-500 font-medium">
                  {selectedDuration !== 'all' || selectedExperience !== 'all'
                    ? (language === 'zh' ? `已为您找到 ${filteredHomeTours.length} 个符合条件的行程` : language === 'id' ? `Menampilkan ${filteredHomeTours.length} paket tour yang cocok dengan pilihan filter Anda` : `Showing ${filteredHomeTours.length} tours matching your selected criteria`)
                    : (language === 'zh' ? '浏览全部精选行程，或使用上方筛选器按天数与体验风格查找' : language === 'id' ? 'Jelajahi seluruh paket tour atau gunakan filter di atas untuk menemukan durasi & pengalaman yang tepat' : 'Browse all curated tours or use the filter above to find your exact duration and style')}
                </p>
              </div>

              {(selectedDuration !== 'all' || selectedExperience !== 'all') && (
                <button
                  onClick={() => {
                    setSelectedDuration('all');
                    setSelectedExperience('all');
                  }}
                  className="text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-500/10 hover:bg-amber-500/20 px-3.5 py-1.5 rounded-xl transition-all self-start sm:self-auto cursor-pointer"
                >
                  {language === 'zh' ? '重置筛选' : language === 'id' ? 'Atur Ulang Filter' : 'Reset Filters'}
                </button>
              )}
            </div>

            {filteredHomeTours.length === 0 ? (
              <div className="text-center py-16 px-4 bg-white rounded-3xl border border-neutral-200/80 max-w-lg mx-auto space-y-4 shadow-sm">
                <div className="p-3.5 bg-amber-500/10 text-amber-600 rounded-full inline-block">
                  <Clock className="w-7 h-7 text-amber-500" />
                </div>
                <h4 className="text-lg font-bold text-neutral-900">
                  {language === 'zh' ? '未找到符合条件的行程' : language === 'id' ? 'Tidak Ada Paket Tour yang Cocok' : 'No Tours Match Your Criteria'}
                </h4>
                <p className="text-xs text-neutral-500 leading-relaxed max-w-sm mx-auto">
                  {tours.length === 0
                    ? (language === 'zh' ? '后台暂无可用行程，请前往管理后台添加新行程。' : language === 'id' ? 'Belum ada paket wisata di sistem. Tambahkan tour baru melalui Portal Admin.' : 'No tours created in system yet. Add new tours through the Admin Portal.')
                    : (language === 'zh' ? '请尝试调整天数或体验分类，或点击重置所有筛选。' : language === 'id' ? 'Silakan pilih kombinasi durasi atau kategori pengalaman lain, atau klik tombol atur ulang di bawah ini.' : 'Try choosing a different duration or category, or click reset below.')}
                </p>
                {tours.length > 0 && (
                  <button
                    onClick={() => {
                      setSelectedDuration('all');
                      setSelectedExperience('all');
                    }}
                    className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm"
                  >
                    {language === 'zh' ? '重置筛选' : language === 'id' ? 'Atur Ulang Filter' : 'Reset Filters'}
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
                {filteredHomeTours.map((rawTour) => {
                  const tour = getTour(rawTour);
                  const isWishlisted = wishlist.includes(tour.id);
                  return (
                    <div
                      key={tour.id}
                      id={`tour-card-results-${tour.id}`}
                      onClick={() => {
                        setSearchParams({ ...searchParams, selectedTourId: tour.id });
                        setPage('tours');
                      }}
                      className="bg-white rounded-[32px] overflow-hidden shadow-[0_12px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(15,118,110,0.08)] hover:-translate-y-2 transition-all duration-500 group flex flex-col justify-between w-full max-w-[380px] border border-neutral-200/70 h-full cursor-pointer"
                    >
                      {/* Image Block */}
                      <div className="relative aspect-[16/10] m-3 overflow-hidden rounded-[24px] shrink-0">
                        <img
                          src={tour.image}
                          alt={tour.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

                        {/* Top Left: Category Badge */}
                        <span className="absolute top-4 left-4 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 text-neutral-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-amber-500/35 border border-white/60 flex items-center gap-1.5 z-10">
                          <Sparkles className="w-3 h-3 fill-neutral-950 text-neutral-950" />
                          <span>{tour.category || 'Adventure'}</span>
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
                            <span className="text-xs font-bold text-[#111827] ml-1">{tour.rating || 4.9}</span>
                            <span className="text-xs text-[#6B7280]">({tour.reviewCount || 0} {t('common.reviews')})</span>
                          </div>

                          {/* Tour Title */}
                          <h4 className="font-bold text-sm sm:text-base text-[#111827] leading-tight group-hover:text-[#0F766E] transition-colors line-clamp-1">
                            {tour.name}
                          </h4>

                          {/* Small Information Row with Clean Duration badge */}
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-1 text-[11px] text-[#6B7280] font-bold border-t border-neutral-100 mt-2">
                            <span className="flex items-center gap-1 text-[#0F766E] font-black">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{tour.duration}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5 text-[#0F766E]" />
                              <span>{language === 'zh' ? '私家独立包车' : language === 'id' ? 'Tur Privat' : 'Private Tour'}</span>
                            </span>
                          </div>
                        </div>

                        {/* Pricing and Call To Action */}
                        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2 mt-auto">
                          <div className="flex flex-col">
                            <span className="text-[9px] uppercase tracking-wider text-[#6B7280] font-extrabold">{t('common.startingFrom')}</span>
                            <div className="flex items-baseline gap-0.5">
                              <span className="text-lg font-black text-[#111827]">{formatPrice(tour.startingPrice)}</span>
                              <span className="text-[10px] text-[#6B7280] font-bold"> / {t('common.perPerson')}</span>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSearchParams({ ...searchParams, selectedTourId: tour.id });
                              setPage('tours');
                            }}
                            className="bg-[#0F766E] hover:bg-[#0d635c] text-white font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-widest transition-all hover:shadow-md hover:shadow-[#0F766E]/10 active:scale-95 cursor-pointer flex items-center gap-1"
                          >
                            <span>{t('common.viewDetails')}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* DYNAMIC SEARCH RESULTS SECTION */}
      {searchResults && (
        <section id="search-results-section" className="py-16 bg-neutral-50 border-t border-b border-neutral-200/80 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-amber-600 font-bold uppercase tracking-widest font-mono text-xs">{t('common.search')}</span>
                <h3 className="text-2xl font-bold text-neutral-900 mt-1">{t('tours.pageTitle')}</h3>
              </div>
              <button
                onClick={() => setSearchResults(null)}
                className="text-neutral-600 hover:text-neutral-900 text-xs border border-neutral-200 px-3 py-1.5 rounded-xl hover:bg-neutral-100 cursor-pointer"
              >
                {t('common.reset')}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {searchResults.map((rawTour: any) => {
                const tour = getTour(rawTour);
                return (
                  <div key={tour.id} className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:border-neutral-300/85 transition-all flex flex-col justify-between group">
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={tour.image}
                        alt={tour.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-4 left-4 bg-amber-500 text-neutral-950 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                        {tour.category}
                      </span>
                    </div>
                    <div className="p-6 flex-grow flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-lg text-neutral-900 leading-tight mb-2">{tour.name}</h4>
                        <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed mb-4">{tour.description}</p>
                        <div className="flex items-center space-x-4 mb-4 text-xs text-neutral-500 border-b border-neutral-100 pb-4">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-amber-500" />
                            <span>{tour.duration}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                            <span>{tour.rating} ({tour.reviewCount} {t('common.reviews')})</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-auto">
                        <div>
                          <span className="text-[10px] text-neutral-400 block uppercase font-mono">{t('common.startingFrom')}</span>
                          <span className="text-xl font-black text-amber-600">{formatPrice(tour.startingPrice)}</span>
                          <span className="text-[10px] text-neutral-500"> / {t('common.perPerson')}</span>
                        </div>
                        <button
                          onClick={() => triggerCheckout(tour)}
                          className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1 shadow-md shadow-amber-500/10 transition-colors cursor-pointer"
                        >
                          <span>{t('common.bookNow')}</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 2. WHY CHOOSE SMARTJOURNEY */}
      <section className="py-8 md:py-12 lg:py-14 bg-gradient-to-b from-neutral-50/30 via-white to-neutral-50/30 relative">
        {/* Subtle decorative background glow */}
        <div className="absolute top-1/4 left-0 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 sm:mb-10 gap-4">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-600 font-extrabold uppercase tracking-widest font-mono text-[10px] sm:text-xs px-3.5 py-1.5 rounded-full border border-amber-500/20">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{language === 'zh' ? '官方品质认证保障' : language === 'id' ? 'Jaminan Kualitas Pariwisata' : 'Excellence Guaranteed'}</span>
              </span>
              <h2 className="text-2xl sm:text-4.5xl font-black text-neutral-900 tracking-tight leading-none mt-2">
                {t('home.whyUsTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 max-w-xl font-medium">
                {t('home.whyUsSubtitle')}
              </p>
              <div className="h-1.5 w-20 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full mt-3" />
            </div>
          </div>

          {/* Premium Bento Grid */}
          <div
            ref={bentoRef}
            onMouseDown={handleBentoMouseDown}
            onMouseLeave={handleBentoMouseLeave}
            onMouseUp={handleBentoMouseUp}
            onMouseMove={handleBentoMouseMove}
            className={`flex lg:grid lg:grid-cols-4 overflow-x-auto lg:overflow-visible ${bentoDrag.isDown ? 'cursor-grabbing' : 'snap-x snap-mandatory scroll-smooth cursor-grab'} [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mx-4 px-4 lg:mx-0 lg:px-0 gap-3 sm:gap-6 lg:gap-8 pb-4 lg:pb-0 select-none`}
          >
            {whyChooseUsItems.map((card) => {
              const iconElement = WHY_US_ICONS[card.id] || <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />;
              return (
                <div
                  key={card.id}
                  className="bg-white border border-neutral-200/80 border-t-4 border-t-amber-500 p-3 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-xl lg:hover:-translate-y-2 hover:border-amber-500/30 transition-all duration-300 group relative overflow-hidden flex flex-col justify-between min-h-[180px] sm:min-h-[220px] w-[calc(50%-6px)] sm:w-[calc(50%-12px)] lg:w-auto shrink-0 snap-start"
                >
                  {/* Visual accent watermark */}
                  <div className="absolute -right-4 -bottom-4 text-neutral-100 opacity-20 pointer-events-none group-hover:scale-125 group-hover:text-amber-500/10 transition-all duration-500">
                    {React.cloneElement(iconElement as React.ReactElement, { className: 'h-16 w-16 sm:h-24 sm:w-24' })}
                  </div>

                  <div className="space-y-2 sm:space-y-4 relative z-10">
                    <div className="bg-amber-500/10 text-amber-600 border border-amber-500/20 p-2 sm:p-3.5 rounded-xl sm:rounded-2xl w-fit group-hover:bg-amber-500 group-hover:text-neutral-950 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      {React.cloneElement(iconElement as React.ReactElement, { className: 'h-4 w-4 sm:h-6 sm:w-6' })}
                    </div>
                    <h3 className="font-extrabold text-xs sm:text-base lg:text-lg text-neutral-900 leading-tight group-hover:text-amber-600 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-[10px] sm:text-xs lg:text-sm text-neutral-600 leading-normal sm:leading-relaxed font-medium">
                      {card.description}
                    </p>
                  </div>
                  
                  {/* Bottom line decorative indicator */}
                  <div className="w-0 group-hover:w-full h-1 bg-gradient-to-r from-amber-500 to-amber-600 absolute bottom-0 left-0 transition-all duration-300" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. OUR SERVICES */}
      <section className="py-16 sm:py-20 lg:py-24 bg-neutral-900 text-slate-100 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center space-y-3 mb-10 sm:mb-14 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-400 font-semibold uppercase tracking-widest text-xs px-3.5 py-1.5 rounded-full border border-amber-500/20">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{language === 'zh' ? '全方位出行服务指南' : language === 'id' ? 'Katalog Layanan Unggulan' : 'Service Directory'}</span>
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              {language === 'zh' ? '高品质专属旅游与接送服务' : language === 'id' ? 'Layanan Wisata & Transportasi VIP' : 'Premium Transport & Travel Services'}
            </h2>
            <p className="text-sm sm:text-base text-neutral-400 font-medium leading-relaxed">
              {language === 'zh' ? '覆盖东爪哇与巴厘岛的全程定制生态行程、接送机与跨城专车。' : language === 'id' ? 'Pengalaman perjalanan terkurasi dan transportasi privat profesional di Jawa Timur & Bali.' : 'Tailored travel experiences and professional private transportation across East Java and Indonesia.'}
            </p>
          </div>

          {/* 4 Core Quick Services Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
            {/* 1. Private Tours */}
            <div 
              onClick={() => { setActiveService('tours'); setPage('tours'); }}
              className="bg-neutral-800/80 border border-neutral-700/80 hover:border-amber-500/50 p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-neutral-950 transition-all">
                  <Compass className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                    {language === 'zh' ? '火山探险私家包车游' : language === 'id' ? 'Tur Wisata & Ekspedisi Privat' : 'Private Tours & Expeditions'}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                    {language === 'zh' ? '布罗莫火山、宜珍电光蓝火与赛武瀑布定制行程，含吉普车与首道门票。' : language === 'id' ? 'Paket Bromo, Kawah Ijen, dan Tumpak Sewu lengkap dengan Jeep 4x4 & izin masuk.' : 'Curated Mount Bromo, Ijen Blue Fire, and Tumpak Sewu packages with 4x4 Jeeps & permits included.'}
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-700/60 flex items-center justify-between text-xs font-bold text-amber-400">
                <span>{t('home.heroCtaTour')}</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 2. Airport Transfer */}
            <div 
              onClick={() => { setActiveService('airport'); setPage('airport'); }}
              className="bg-neutral-800/80 border border-neutral-700/80 hover:border-amber-500/50 p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-neutral-950 transition-all">
                  <Plane className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                    {t('nav.airport')}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                    {language === 'zh' ? '泗水朱安达 (SUB)、日惹 (YIA) 及巴厘岛 (DPS) 机场航班实时跟踪专车接送。' : language === 'id' ? 'Penjemputan langsung di Juanda (SUB), YIA, dan Bali (DPS) dengan pemantauan penerbangan langsung.' : 'Direct terminal pickups at Juanda Surabaya (SUB), YIA, and Bali (DPS) with live flight monitoring.'}
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-700/60 flex items-center justify-between text-xs font-bold text-amber-400">
                <span>{t('common.bookNow')}</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 3. Executive Taxi */}
            <div 
              onClick={() => { setActiveService('taxi'); setPage('taxi'); }}
              className="bg-neutral-800/80 border border-neutral-700/80 hover:border-amber-500/50 p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-neutral-950 transition-all">
                  <Route className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                    {t('nav.taxi')}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                    {language === 'zh' ? '泗水、玛琅、外南梦、日惹至巴厘岛点对点一口价跨城专属包车出租车。' : language === 'id' ? 'Antar jemput antarkota flat-rate Surabaya, Malang, Banyuwangi, dan Bali.' : 'Fixed, flat-rate intercity private transfers across Surabaya, Malang, Banyuwangi, and Bali.'}
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-700/60 flex items-center justify-between text-xs font-bold text-amber-400">
                <span>{t('common.bookNow')}</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 4. Car Rental */}
            <div 
              onClick={() => { setActiveService('car-rental'); setPage('car-rental'); }}
              className="bg-neutral-800/80 border border-neutral-700/80 hover:border-amber-500/50 p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-neutral-950 transition-all">
                  <Car className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                    {t('nav.carRental')}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                    {language === 'zh' ? '全系准新车况（Avanza、Innova、海狮 Hiace），配经验丰富本地司机与全程燃油。' : language === 'id' ? 'Armada bersih (Avanza, Innova, Hiace) dengan driver berpengalaman dan BBM lengkap.' : 'Immaculate fleet (Avanza, Innova, Hiace) with professional local drivers and full fuel coverage.'}
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-700/60 flex items-center justify-between text-xs font-bold text-amber-400">
                <span>{t('common.bookNow')}</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Sleek Minimalist Service Navigation Tabs */}
          <div className="flex items-center justify-start md:justify-center overflow-x-auto scrollbar-none gap-2 sm:gap-3 mb-10 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {[
              { id: 'tours', label: t('nav.tours'), icon: <Compass className="h-4 w-4" />, hint: 'Bromo & Ijen', isNew: false },
              { id: 'share-tour', label: t('nav.shareTour'), icon: <Users className="h-4 w-4" />, hint: 'Open Trip', isNew: true },
              { id: 'airport', label: t('nav.airport'), icon: <Plane className="h-4 w-4" />, hint: '24/7 Pickup', isNew: false },
              { id: 'taxi', label: t('nav.taxi'), icon: <Route className="h-4 w-4" />, hint: 'Flat Rate', isNew: false },
              { id: 'car-rental', label: t('nav.carRental'), icon: <Car className="h-4 w-4" />, hint: 'With Driver', isNew: false },
            ].map((srv) => {
              const isActive = activeService === srv.id;
              return (
                <button
                  key={srv.id}
                  onClick={() => setActiveService(srv.id as any)}
                  className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-300 shrink-0 cursor-pointer border ${
                    isActive
                      ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-lg shadow-amber-500/20 font-bold scale-[1.02]'
                      : 'bg-neutral-800/80 text-neutral-300 border-neutral-700/80 hover:bg-neutral-800 hover:text-white hover:border-neutral-600'
                  }`}
                >
                  {srv.icon}
                  <span>{srv.label}</span>
                  {srv.isNew && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider ${
                      isActive ? 'bg-neutral-950 text-amber-400' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      NEW
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Service Detailed Showcase Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeService}-${language}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="bg-neutral-800/60 border border-neutral-700/60 rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 backdrop-blur-sm shadow-2xl"
            >
              {/* Image side */}
              <div className="lg:col-span-5 relative min-h-[260px] lg:min-h-full overflow-hidden bg-neutral-950 group">
                <img
                  src={
                    activeService === 'tours'
                      ? 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1000&q=80'
                      : activeService === 'share-tour'
                      ? 'https://images.unsplash.com/photo-1539635273304-0e8723e0f016?auto=format&fit=crop&w=1000&q=80'
                      : activeService === 'airport'
                      ? 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=1000&q=80'
                      : activeService === 'taxi'
                      ? 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1000&q=80'
                      : 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=80'
                  }
                  alt={activeService}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700 opacity-85"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-neutral-950/20" />
                
                {/* Visual badge */}
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="text-[11px] text-amber-400 font-bold uppercase tracking-wider font-mono bg-neutral-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-neutral-700/80 shadow-md">
                    {activeService === 'tours' && (language === 'zh' ? '东爪哇精选私人定制' : language === 'id' ? 'Tur Terkurasi Jawa Timur' : 'East Java Curated Tours')}
                    {activeService === 'share-tour' && (language === 'zh' ? '高性价比拼团 (Open Trip / Join Share Tour)' : language === 'id' ? 'Open Trip / Join Share Tour' : 'Open Trip / Join Share Tour')}
                    {activeService === 'airport' && (language === 'zh' ? '24小时专业机场接送' : language === 'id' ? 'Transfer Bandara 24/7' : '24/7 Airport Transfer')}
                    {activeService === 'taxi' && (language === 'zh' ? '跨城透明一口价专车' : language === 'id' ? 'Taksi Eksekutif Flat-Rate' : 'Flat-Rate Executive Taxi')}
                    {activeService === 'car-rental' && (language === 'zh' ? '包车带司机自由行' : language === 'id' ? 'Sewa Mobil + Driver Privat' : 'Private Car & Driver')}
                  </span>
                </div>
              </div>

              {/* Content side */}
              <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                    {activeService === 'tours' && (language === 'zh' ? '布罗莫火山与宜珍神秘蓝火私人探险' : language === 'id' ? 'Petualangan Privat Gunung Bromo & Kawah Ijen' : 'Private Mount Bromo & Ijen Crater Adventures')}
                    {activeService === 'share-tour' && (language === 'zh' ? '单人及情侣出游精明之选：Open Trip / Join Share Tour 拼团' : language === 'id' ? 'Open Trip / Join Share Tour untuk Solo & Small Group' : 'Open Trip / Join Share Tour for Smart Solo & Small Group Travelers')}
                    {activeService === 'airport' && (language === 'zh' ? '无缝省心机场接机与航站楼送机' : language === 'id' ? 'Antar Jemput Bandara Nyaman & Bebas Ribet' : 'Seamless Airport Pickups & Transfers')}
                    {activeService === 'taxi' && (language === 'zh' ? '点对点跨城尊贵行政出租车' : language === 'id' ? 'Taksi Antarkota Point-to-Point Eksekutif' : 'Point-to-Point Executive Intercity Taxi')}
                    {activeService === 'car-rental' && (language === 'zh' ? '配备资深双语司机的全天候包车' : language === 'id' ? 'Rental Mobil Premium Bersama Driver Berpengalaman' : 'Premium Car Rental with Professional Local Driver')}
                  </h3>

                  <p className="text-sm text-neutral-300 leading-relaxed font-normal">
                    {activeService === 'tours' && (language === 'zh' ? '亲历布罗莫金色日出、宜珍电光蓝火与千重瀑布。套餐包含全程冷气专车、4x4越野吉普、持证双语向导与景区门票。' : language === 'id' ? 'Rasakan ekspedisi tak terlupakan ke sunrise Bromo, api biru Ijen, dan air terjun Tumpak Sewu dengan Jeep 4x4, driver ramah, dan tiket masuk lengkap.' : 'Experience unforgettable expeditions to Mount Bromo sunrise, Ijen Crater blue fire, and Tumpak Sewu Waterfall. Complete packages include climate-controlled transport, 4x4 off-road Jeeps, licensed English-speaking guides, and pre-arranged park permits.')}
                    {activeService === 'share-tour' && (language === 'zh' ? '按位计价，固定保发班期，专属微信/WhatsApp电子凭证，畅享高品质拼团体验。' : language === 'id' ? 'Keberangkatan grup hemat untuk solo traveler dan pasangan. Ikuti batch terkonfirmasi ke Bromo & Ijen dengan harga per-kursi dan voucher instan.' : 'Cost-effective group departures for solo travelers and couples. Join confirmed departure batches for Mount Bromo and Ijen Crater with per-seat pricing, comfortable fleet, professional guide, and instant voucher validation.')}
                    {activeService === 'airport' && (language === 'zh' ? '准时覆盖泗水朱安达 (SUB)、日惹 (YIA)、雅加达 (CGK) 与巴厘岛 (DPS)。司机实时监控航班动态并举牌在到达厅迎接。' : language === 'id' ? 'Layanan tepat waktu untuk Bandara Juanda (SUB), Yogyakarta (YIA), Jakarta (CGK), dan Bali (DPS) dengan live flight tracking.' : 'Stress-free transfers connecting Juanda International Airport Surabaya (SUB), Yogyakarta (YIA), CGK, and Bali (DPS). Drivers monitor live flight status and provide personalized terminal arrival meet & greet.')}
                    {activeService === 'taxi' && (language === 'zh' ? '一口价全包，无出租车计价表溢价，畅享门到门专属私密行程。' : language === 'id' ? 'Transportasi privat andal dengan tarif pasti. Nikmati kenyamanan antar jemput door-to-door tanpa lonjakan harga argo.' : 'Reliable private transfers with fixed transparent pricing. Enjoy door-to-door comfort for business or leisure with zero hidden toll, parking, or surge fees.')}
                    {activeService === 'car-rental' && (language === 'zh' ? '根据您的个性化日程自由畅游东爪哇，准新车况，安心出行。' : language === 'id' ? 'Jelajahi Jawa Timur sesuai rencana perjalanan bebas Anda dengan armada bersih (Avanza, Innova, Hiace) dan driver berpengalaman.' : 'Explore East Java on your own customized itinerary with our immaculate fleet (Avanza, Innova Reborn, Zenix, Hiace) and experienced local drivers.')}
                  </p>

                  {/* High quality bullets checklist */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                    {(activeService === 'tours'
                      ? (language === 'zh'
                        ? ['已含全部景区门票与森林许可证', '已含布罗莫 4x4 专属越野吉普', '持证双语老牌地接向导', '支持泗水、玛琅、外南梦灵活接送']
                        : language === 'id'
                        ? ['Semua tiket & izin konservasi termasuk', 'Jeep 4x4 Bromo privat termasuk', 'Pemandu lokal bersertifikat', 'Penjemputan fleksibel Surabaya/Malang/Banyuwangi']
                        : ['All entrance tickets & permits included', 'Private 4x4 Bromo Jeep included', 'Certified English-speaking guide', 'Flexible pickup in Surabaya, Malang, or Banyuwangi'])
                      : activeService === 'share-tour'
                      ? (language === 'zh'
                        ? ['超值按位计价，经济透明', '固定批次保发排班', '含 4x4 吉普、司机与向导', '即时生成电子凭证']
                        : language === 'id'
                        ? ['Harga per-kursi terjangkau & transparan', 'Jadwal batch keberangkatan pasti', 'Termasuk Jeep 4x4, driver & guide', 'Konfirmasi digital voucher instan']
                        : ['Budget-friendly per-seat pricing', 'Guaranteed batch departure schedules', 'Includes Jeep 4x4, driver & guide', 'Instant digital voucher confirmation'])
                      : activeService === 'airport'
                      ? (language === 'zh'
                        ? ['航班时刻实时智能跟踪', '接机大厅持专属姓名牌迎接', '已含高速过路费与机场停车费', '免费协助搬运行李直达目的地']
                        : language === 'id'
                        ? ['Pelacakan status penerbangan live', 'Meet & greet dengan papan nama di terminal', 'Sudah termasuk tol & parkir bandara', 'Bantuan bagasi & rute langsung']
                        : ['Real-time flight status tracking', 'Paging nameboard meet & greet at terminal', 'Tolls & airport parking fees included', 'Luggage assistance & direct routing'])
                      : activeService === 'taxi'
                      ? (language === 'zh'
                        ? ['一口价透明锁定，绝无高峰加价', '门到门尊贵私密乘车体验', '专业无烟老牌司机', '免费瓶装矿泉水与车载充电']
                        : language === 'id'
                        ? ['Tarif flat transparan tanpa lonjakan', 'Layanan privat door-to-door', 'Driver profesional non-smoking', 'Air mineral gratis & port charger']
                        : ['Fixed transparent rates without surge', 'Door-to-door executive private service', 'Professional non-smoking drivers', 'Complimentary bottled water & phone charging'])
                      : (language === 'zh'
                        ? ['已全包司机服务费与全程燃油', '完全自主规划每日路线与停留点', '提供5座至15座多元车型', '全车每日深度消毒，空调强劲']
                        : language === 'id'
                        ? ['BBM & uang makan driver sudah termasuk', 'Bebas kustomisasi rute harian', 'Pilihan armada 5 hingga 15 kursi', 'Kendaraan bersih dengan AC dingin']
                        : ['Fuel & driver allowance fully included', 'Customizable daily routing & stops', 'Clean fleet option for 5 to 15 passengers', 'Sanitized vehicles with cold air conditioning'])
                    ).map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 text-neutral-200">
                        <Check className="h-4 w-4 text-amber-400 shrink-0" />
                        <span className="text-xs sm:text-sm font-medium leading-tight">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-neutral-700/60 flex flex-col sm:flex-row items-center gap-4">
                  <button
                    onClick={() => {
                      if (activeService === 'tours') {
                        setPage('tours');
                      } else if (activeService === 'share-tour') {
                        setPage('share-tour');
                      } else {
                        setPage(activeService as any);
                      }
                    }}
                    className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-7 py-3.5 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/10 cursor-pointer"
                  >
                    <span>
                      {activeService === 'tours' && t('home.heroCtaTour')}
                      {activeService === 'share-tour' && t('home.heroCtaShare')}
                      {activeService === 'airport' && (language === 'zh' ? '预订机场接送专车' : language === 'id' ? 'Pesan Transfer Bandara' : 'Book Airport Transfer')}
                      {activeService === 'taxi' && (language === 'zh' ? '预订跨城出租车' : language === 'id' ? 'Pesan Taksi Antarkota' : 'Book Executive Taxi')}
                      {activeService === 'car-rental' && (language === 'zh' ? '预订包车自驾' : language === 'id' ? 'Pesan Sewa Mobil' : 'Book Car Rental')}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <span className="text-xs text-neutral-400 font-medium">
                    ★ {language === 'zh' ? '官方保证：透明一口价，无隐形消费' : language === 'id' ? 'Jaminan Layanan Terbaik & Harga Transparan' : 'Guaranteed Best Service & Fixed Pricing'}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

        </div>
      </section>

      {/* 4. FEATURED TOUR PACKAGES SECTION */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center space-y-4 mb-16 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 bg-[#0F766E]/5 text-[#0F766E] font-black uppercase tracking-widest font-mono text-[10px] sm:text-xs px-4 py-2 rounded-full border border-[#0F766E]/10">
              <Sparkles className="h-3.5 w-3.5 text-[#F59E0B]" />
              <span>SmartJourney Curated</span>
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#111827] tracking-tight">
              {t('home.toursSectionTitle')}
            </h2>
            <p className="text-sm sm:text-base text-[#6B7280] leading-relaxed font-medium">
              {t('home.toursSectionSubtitle')}
            </p>
            <div className="h-1 w-16 bg-[#0F766E] mx-auto rounded-full mt-4" />
          </div>

          {/* Responsive Grid with Beautiful Spacing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center max-w-7xl mx-auto">
            {tours.map((rawTour) => {
               const tour = getTour(rawTour);
               const isWishlisted = wishlist.includes(tour.id);
               
               let tourLocation = "📍 East Java";
               if (tour.id === 'malang-city') {
                 tourLocation = language === 'zh' ? "📍 玛琅 · 东爪哇" : "📍 Malang, East Java";
               } else if (tour.id === 'bromo') {
                 tourLocation = language === 'zh' ? "📍 布罗莫 · 东爪哇" : "📍 Mount Bromo, East Java";
               } else if (tour.id === 'ijen') {
                 tourLocation = language === 'zh' ? "📍 外南梦/宜珍 · 东爪哇" : "📍 Ijen Crater, East Java";
               }

               return (
                 <div
                   key={tour.id}
                   id={`tour-card-home-${tour.id}`}
                   onClick={() => {
                     setSearchParams({ ...searchParams, selectedTourId: tour.id });
                     setPage('tours');
                   }}
                   className="bg-white rounded-[32px] overflow-hidden shadow-[0_12px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(15,118,110,0.08)] hover:-translate-y-2 transition-all duration-500 group flex flex-col justify-between w-full max-w-[380px] border border-neutral-100/50 h-full cursor-pointer"
                 >
                   {/* Image Block */}
                   <div className="relative aspect-[16/10] m-3 overflow-hidden rounded-[24px] shrink-0">
                     <img
                       src={tour.image}
                       alt={tour.name}
                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                       referrerPolicy="no-referrer"
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
                     
                     {/* Top Left: Ribbon Badge */}
                     <span className="absolute top-4 left-4 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 text-neutral-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-amber-500/35 border border-white/60 flex items-center gap-1.5 z-10">
                       <Sparkles className="w-3 h-3 fill-neutral-950 text-neutral-950" />
                       <span>{tour.id === 'bromo' ? t('common.bestSeller') : tour.id === 'ijen' ? t('common.topRated') : t('common.popular')}</span>
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
                         <span className="text-xs text-[#6B7280]">({tour.reviewCount} {t('common.reviews')})</span>
                       </div>

                       {/* Tour Title */}
                       <h3 className="font-bold text-sm sm:text-base text-[#111827] leading-tight group-hover:text-[#0F766E] transition-colors line-clamp-1">
                         {tour.name}
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
                           <span>{language === 'zh' ? '私家独立包车' : language === 'id' ? 'Tur Privat' : 'Private Tour'}</span>
                         </span>
                         <span className="flex items-center gap-1">
                           <Car className="h-3.5 w-3.5 text-[#0F766E]" />
                           <span>{language === 'zh' ? '全包专车接送' : language === 'id' ? 'Antar Jemput Termasuk' : 'Pickup Included'}</span>
                         </span>
                       </div>
                     </div>

                     {/* Pricing and Call To Action */}
                     <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2 mt-auto">
                       <div className="flex flex-col">
                         <span className="text-[9px] uppercase tracking-wider text-[#6B7280] font-extrabold">{t('common.startingFrom')}</span>
                         <div className="flex items-baseline gap-0.5">
                           <span className="text-lg font-black text-[#111827]">{formatPrice(tour.startingPrice)}</span>
                           <span className="text-[10px] text-[#6B7280] font-bold"> / {t('common.perPerson')}</span>
                         </div>
                       </div>

                       <button
                         onClick={(e) => {
                           e.stopPropagation();
                           setSearchParams({ ...searchParams, selectedTourId: tour.id });
                           setPage('tours');
                         }}
                         className="bg-[#0F766E] hover:bg-[#0d635c] text-white font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-widest transition-all hover:shadow-md hover:shadow-[#0F766E]/10 active:scale-95 cursor-pointer flex items-center gap-1"
                       >
                         <span>{t('common.viewDetails')}</span>
                       </button>
                     </div>
                   </div>
                 </div>
               );
            })}
          </div>

        </div>
      </section>

      {/* 4. DESTINATIONS DISCOVERY SECTION */}
      <section className="py-16 sm:py-20 bg-neutral-50 border-t border-b border-neutral-200/80 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-3 mb-12 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-600 font-extrabold uppercase tracking-widest font-mono text-[10px] sm:text-xs px-3.5 py-1.5 rounded-full border border-amber-500/20">
              <Globe className="h-3.5 w-3.5" />
              <span>{language === 'zh' ? '东爪哇与巴厘岛经典胜地' : language === 'id' ? 'Destinasi Unggulan Regional' : 'Regional Highlights'}</span>
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-900 tracking-tight">
              {language === 'zh' ? '东爪哇与巴厘岛必游目的地' : language === 'id' ? 'Destinasi Terpopuler Jawa Timur & Bali' : 'Top Destinations in East Java & Bali'}
            </h2>
            <p className="text-sm sm:text-base text-neutral-500 font-medium">
              {language === 'zh' ? '乘坐配备持证双语司机的专属车队，畅游壮美火山口、热带大峡谷千重飞瀑与浪漫海岛。' : language === 'id' ? 'Jelajahi puncak vulkanik, kaldera kuno, ngarai tropis, dan pulau eksotis bersama driver lokal berlisensi.' : 'Explore volcanic peaks, ancient calderas, tropical canyons, and coastal islands with certified local drivers.'}
            </p>
            <div className="h-1.5 w-20 bg-gradient-to-r from-amber-500 to-amber-600 mx-auto rounded-full mt-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinationsList.map((dest) => (
              <div
                key={dest.id}
                onClick={() => {
                  setSearchParams({ ...searchParams, selectedTourId: dest.id });
                  setPage('tours');
                }}
                className="bg-white border border-neutral-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer flex flex-col justify-between"
              >
                <div className="relative h-52 overflow-hidden bg-neutral-900">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  <span className="absolute top-3 left-3 bg-neutral-950/80 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">
                    {dest.highlightTag}
                  </span>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[10px] font-mono text-amber-300 uppercase tracking-widest block">{dest.region}</span>
                    <h3 className="text-lg font-extrabold leading-tight drop-shadow-md">{dest.name}</h3>
                  </div>
                </div>

                <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                  <p className="text-xs text-neutral-600 leading-relaxed font-normal">
                    {dest.description}
                  </p>
                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-neutral-800">
                    <span className="text-neutral-500 font-medium">{dest.tourCount}</span>
                    <span className="text-amber-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>{t('common.viewDetails')}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. COLLABORATING PLATFORMS SECTION */}
      <section className="py-8 md:py-12 lg:py-14 bg-neutral-50 border-t border-b border-neutral-200/80 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center space-y-3 mb-8 sm:mb-10">
            <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-600 font-extrabold uppercase tracking-widest font-mono text-[10px] sm:text-xs px-3.5 py-1.5 rounded-full border border-amber-500/20">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{language === 'zh' ? '全球数字生态与合作伙伴' : language === 'id' ? 'Sinergi & Ekosistem Digital' : 'Synergy & Digital Ecosystem'}</span>
            </span>
            <h2 className="text-2xl sm:text-4.5xl font-black text-neutral-900 tracking-tight leading-none mt-2">
              {language === 'zh' ? '官方战略合作旅游平台' : language === 'id' ? 'Platform Mitra Kami' : 'Our Partner Platforms'}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-xl mx-auto font-medium">
              {language === 'zh' ? 'SmartJourney 与国际主流旅游预订系统及顶级度假酒店集团紧密合作。' : language === 'id' ? 'SmartJourney beroperasi selaras dengan jaringan perjalanan internasional dan sistem pemesanan terkemuka.' : 'SmartJourney operates in synergy with leading international travel networks, booking systems, and premier luxury hotel groups.'}
            </p>
            <div className="h-1.5 w-20 bg-gradient-to-r from-amber-500 to-amber-600 mx-auto rounded-full mt-3" />
          </div>

          {partners.length === 0 ? (
            <div className="text-center py-12 bg-white border border-neutral-200 rounded-3xl space-y-4">
              <Handshake className="h-12 w-12 text-neutral-400 mx-auto" />
              <h3 className="text-lg font-bold text-neutral-500">{language === 'zh' ? '暂无合作平台信息' : language === 'id' ? 'Belum ada platform mitra' : 'No partner platforms registered'}</h3>
              <p className="text-sm text-neutral-400 max-w-md mx-auto">
                {language === 'zh' ? '请登录管理后台配置已认证的合作平台。' : language === 'id' ? 'Silakan login ke Admin Dashboard untuk menambahkan platform mitra.' : 'Please login to the Admin Dashboard to add and configure verified partner platforms.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
              {partners.slice(0, 12).map((partner) => {
                return (
                  <a
                    key={partner.id}
                    id={`partner-card-${partner.id}`}
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white border border-neutral-200/90 hover:border-amber-500/60 rounded-2xl h-24 flex items-center justify-center p-3 sm:p-4 relative group transition-all duration-300 shadow-xs hover:shadow-md hover:-translate-y-1 cursor-pointer overflow-hidden"
                  >
                    <div className="w-full h-full flex items-center justify-center p-1 sm:p-2">
                      <img
                        src={partner.logoUrl}
                        alt={partner.name}
                        className="max-h-12 max-w-[88%] object-contain group-hover:scale-105 transition-all duration-300"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as any).src = 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?auto=format&fit=crop&w=150&q=80';
                        }}
                      />
                    </div>
                    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-neutral-900/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[9px] text-amber-400 font-bold tracking-wider uppercase whitespace-nowrap pointer-events-none shadow-md">
                      {partner.name}
                    </div>
                  </a>
                );
              })}
            </div>
          )}

          <div className="mt-12 text-center">
            <button
              onClick={() => setPage('partnerships')}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-md shadow-amber-500/10 cursor-pointer"
            >
              <span>{t('nav.partnerships')}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </div>
      </section>

      {/* 6. CUSTOMER REVIEWS SLIDER */}
      <section className="py-8 md:py-12 lg:py-14 bg-neutral-50 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          <div className="space-y-3 mb-6 sm:mb-8">
            <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-600 font-extrabold uppercase tracking-widest font-mono text-[10px] sm:text-xs px-3.5 py-1.5 rounded-full border border-amber-500/20">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{language === 'zh' ? '谷歌地图官方认证好评' : language === 'id' ? 'Ulasan Google Terverifikasi' : 'Verified Google Reviews'}</span>
            </span>
            <h2 className="text-2xl sm:text-4.5xl font-black text-neutral-900 tracking-tight leading-none mt-2">
              {t('home.reviewsTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-xl mx-auto font-medium">
              {t('home.reviewsSubtitle')}
            </p>
            <div className="h-1.5 w-20 bg-gradient-to-r from-amber-500 to-amber-600 mx-auto rounded-full mt-3" />
          </div>

          {/* Real Google Rating Summary Header */}
          <div className="bg-white border border-neutral-200/60 rounded-3xl p-6 sm:p-8 max-w-4xl mx-auto mb-6 sm:mb-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <a 
              href="https://www.google.com/maps/place/Smart+Journey/@-8.0045371,112.7482296,15z/data=!4m8!3m7!1s0x2dd625bdc0ad5b79:0x3446d2c5e7fdfe18!8m2!3d-8.0045585!4d112.7585294!9m1!1b1!16s%2Fg%2F11xfx6lnnw?entry=ttu&g_ep=EgoyMDI2MDYyOS4wIKXMDSoASAFQAw%3D%3D" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left hover:opacity-90 transition-opacity group cursor-pointer"
              title="Google Maps"
            >
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-neutral-150 shrink-0 group-hover:border-blue-500/30 transition-colors">
                <svg className="h-8 w-8" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.81-.63-1.37-1.5-1.37-2.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="font-extrabold text-3xl text-neutral-900 tracking-tight group-hover:text-blue-600 transition-colors">4.9</span>
                  <div className="flex items-center justify-center sm:justify-start">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400 stroke-amber-400" />
                    ))}
                    <span className="text-xs text-neutral-400 ml-2 font-mono">(4.93 / 5)</span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-medium flex items-center justify-center sm:justify-start gap-1">
                  <span>{language === 'zh' ? '谷歌地图真实验证评价' : language === 'id' ? 'Ulasan Terpercaya Google Maps' : 'Authentic Google Reviews'}</span>
                  <span className="text-neutral-300">|</span>
                  <span className="text-blue-600 font-bold group-hover:underline flex items-center gap-0.5">
                    {language === 'zh' ? '查看商家主页 ↗' : language === 'id' ? 'Lihat Profil Bisnis ↗' : 'View Business Profile ↗'}
                  </span>
                </p>
              </div>
            </a>
            
            <div className="w-full md:w-auto">
              <a
                href="https://www.google.com/maps/place/Smart+Journey/@-8.0045371,112.7482296,15z/data=!4m8!3m7!1s0x2dd625bdc0ad5b79:0x3446d2c5e7fdfe18!8m2!3d-8.0045585!4d112.7585294!9m1!1b1!16s%2Fg%2F11xfx6lnnw?entry=ttu&g_ep=EgoyMDI2MDYyOS4wIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold text-xs uppercase tracking-widest px-6 py-4 rounded-xl shadow-md shadow-amber-500/10 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <span>{language === 'zh' ? '在 Google Maps 上撰写评价 ↗' : language === 'id' ? 'Tulis Ulasan di Google Maps ↗' : 'Write Review on Google Maps ↗'}</span>
              </a>
            </div>
          </div>

          {/* Slider Frame */}
          <div 
            className="relative mt-4"
            onMouseEnter={() => setIsHoveringReviews(true)}
            onMouseLeave={() => setIsHoveringReviews(false)}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -left-4 sm:-left-12 z-20">
              <button
                onClick={() => scrollReviews('left')}
                className="bg-white hover:bg-neutral-50 hover:border-neutral-300 text-neutral-700 p-3 rounded-full border border-neutral-200 transition-all shadow-md cursor-pointer active:scale-95"
                aria-label="Previous Reviews"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            </div>
            
            <div className="absolute top-1/2 -translate-y-1/2 -right-4 sm:-right-12 z-20">
              <button
                onClick={() => scrollReviews('right')}
                className="bg-white hover:bg-neutral-50 hover:border-neutral-300 text-neutral-700 p-3 rounded-full border border-neutral-200 transition-all shadow-md cursor-pointer active:scale-95"
                aria-label="Next Reviews"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>

            {/* Slider container */}
            <div
              ref={reviewsContainerRef}
              onScroll={handleReviewsScroll}
              className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-6 pb-6 px-1 w-full relative"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {localReviews.length === 0 ? (
                <div className="w-full text-center py-12 text-neutral-400 font-medium">
                  {language === 'zh' ? '暂无评价' : language === 'id' ? 'Belum ada ulasan saat ini.' : 'No reviews available yet.'}
                </div>
              ) : (
                localReviews.map((review, idx) => {
                  const bgColors = [
                    'bg-blue-600', 'bg-emerald-600', 'bg-purple-600', 'bg-rose-600',
                    'bg-amber-600', 'bg-indigo-600', 'bg-teal-600', 'bg-cyan-600',
                  ];
                  const colorClass = bgColors[idx % bgColors.length];
                  const isLocalGuide = Boolean(review.isLocalGuide);
                  
                  return (
                    <div 
                      key={review.id} 
                      className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] shrink-0 snap-start bg-white border border-neutral-200/60 hover:border-amber-500/30 hover:bg-white rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 text-left relative min-h-[220px]"
                    >
                      <div>
                        {/* Header Row */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-white text-base shrink-0 shadow-inner ${colorClass}`}>
                              {review.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-extrabold text-sm text-neutral-900 truncate flex items-center gap-1">
                                {review.name}
                                {isLocalGuide && (
                                  <span className="w-3.5 h-3.5 bg-blue-500 text-white rounded-full flex items-center justify-center text-[8px] font-bold shrink-0" title="Google Local Guide Verified">✓</span>
                                )}
                              </h4>
                              <p className="text-[10px] text-neutral-500 font-semibold tracking-wide uppercase mt-0.5 flex items-center gap-1">
                                <span>{review.country}</span>
                                {isLocalGuide && (
                                  <>
                                    <span>·</span>
                                    <span className="text-amber-600">Local Guide</span>
                                  </>
                                )}
                              </p>
                            </div>
                          </div>

                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border shrink-0 ${
                            review.serviceType === 'tour' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                            review.serviceType === 'airport' ? 'bg-sky-50 text-sky-600 border-sky-100' :
                            review.serviceType === 'taxi' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            'bg-rose-50 text-rose-600 border-rose-100'
                          }`}>
                            {review.serviceType === 'tour' ? (language === 'zh' ? '生态旅游' : language === 'id' ? 'Wisata' : 'Tour') :
                             review.serviceType === 'airport' ? (language === 'zh' ? '机场接送' : 'Airport') :
                             review.serviceType === 'taxi' ? (language === 'zh' ? '专车出租' : language === 'id' ? 'Taksi' : 'Taxi') :
                             (language === 'zh' ? '汽车租赁' : language === 'id' ? 'Sewa Mobil' : 'Car Rental')}
                          </span>
                        </div>

                        {/* Rating stars & Date */}
                        <div className="flex items-center space-x-0.5 my-3">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                          ))}
                          {[...Array(5 - review.rating)].map((_, i) => (
                            <Star key={i} className="h-3.5 w-3.5 text-neutral-200" />
                          ))}
                          <span className="text-[10px] text-neutral-400 ml-2 font-mono">{review.date}</span>
                        </div>

                        {/* Comment text */}
                        <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed italic line-clamp-5">
                          "{review.text}"
                        </p>
                      </div>
                      
                      {/* Review footer without map link */}
                      <div className="mt-4 pt-2 border-t border-neutral-100 flex items-center justify-between text-[9px] text-neutral-400 font-mono">
                        <span className="flex items-center gap-1">
                          <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.81-.63-1.37-1.5-1.37-2.63z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                          </svg>
                          <span>Google Review</span>
                        </span>
                        <span className="text-neutral-400 font-medium">
                          {review.date}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Navigation dots */}
            <div className="flex justify-center items-center gap-2 mt-8">
              {[0, 0.25, 0.5, 0.75, 1].map((percent, index) => (
                <button
                  key={index}
                  onClick={() => scrollToPercent(percent)}
                  className="p-1 focus:outline-none cursor-pointer"
                  aria-label={`Go to slide position ${index + 1}`}
                >
                  <div className={`h-2.5 rounded-full transition-all duration-300 ${
                    Math.abs(scrollProgress - percent) < 0.125 ? 'w-8 bg-amber-500' : 'w-2.5 bg-neutral-300'
                  }`} />
                </button>
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* 8. SECTION BERLANGGANAN / NEWSLETTER SUBSCRIPTION */}
      <section className="py-16 sm:py-20 bg-[#315B4F] border-t border-[#467b6b] text-white relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-gradient-to-br from-[#203c34]/90 to-[#182e28]/90 border border-[#467b6b] rounded-3xl p-8 sm:p-12 lg:p-16 shadow-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-5 pointer-events-none hidden lg:block bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column */}
              <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
                <span className="inline-flex items-center gap-2 bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold uppercase tracking-widest text-[11px] sm:text-xs px-4 py-1.5 rounded-full font-mono">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{language === 'zh' ? '获取独家旅行优惠与指南' : language === 'id' ? 'Dapatkan Penawaran Eksklusif' : 'Get Exclusive Travel Offers'}</span>
                </span>

                <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  {language === 'zh' ? '订阅获取东爪哇旅游专属优惠与折扣！' : language === 'id' ? 'Berlangganan & Dapatkan Diskon Wisata Spesial!' : 'Subscribe & Receive Special Travel Discounts!'}
                </h2>

                <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto lg:mx-0">
                  {language === 'zh' ? '立即订阅我们的邮件推送，第一时间获取布罗莫、宜珍火山特惠路线、包车优惠券与东爪哇深度游攻略。' : language === 'id' ? 'Daftarkan email Anda sekarang untuk menerima info promo paket wisata Bromo & Ijen, diskon khusus sewa mobil, serta voucher potongan harga eksklusif.' : 'Sign up your email now to receive seasonal promo offers for Mount Bromo & Ijen tours, car rental discounts, and exclusive travel guides.'}
                </p>

                {/* Benefits List */}
                <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs font-semibold text-emerald-100">
                  <div className="flex items-center gap-2 bg-[#203c34]/80 border border-[#315B4F] px-3.5 py-2 rounded-xl">
                    <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>{language === 'zh' ? '最高 20% 专属折扣' : language === 'id' ? 'Diskon Eksklusif s/d 20%' : 'Up to 20% Exclusive Discounts'}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#203c34]/80 border border-[#315B4F] px-3.5 py-2 rounded-xl">
                    <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>{language === 'zh' ? '免费获取东爪哇路书指南' : language === 'id' ? 'Panduan Wisata Gratis' : 'Free Travel Guides'}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#203c34]/80 border border-[#315B4F] px-3.5 py-2 rounded-xl">
                    <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>{language === 'zh' ? '无垃圾邮件，随时可退订' : language === 'id' ? 'Tanpa Spam & Bebas Batal' : 'No Spam & Cancel Anytime'}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Form */}
              <div className="lg:col-span-5">
                <div className="bg-[#182e28]/90 border border-[#315B4F] rounded-2xl p-6 sm:p-8 shadow-xl">
                  {isSubscribed ? (
                    <div className="text-center py-6 space-y-3">
                      <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg">
                        <CheckCircle2 className="h-8 w-8" />
                      </div>
                      <h3 className="text-lg font-bold text-white">
                        {language === 'zh' ? '感谢您的订阅！' : language === 'id' ? 'Terima Kasih Telah Berlangganan!' : 'Thank You for Subscribing!'}
                      </h3>
                      <p className="text-xs text-neutral-300 leading-relaxed">
                        {language === 'zh' ? `您的邮箱 ${newsletterEmail} 已成功登记，请查收东爪哇专属攻略与折扣！` : language === 'id' ? `Email Anda ${newsletterEmail} telah terdaftar. Cek inbox Anda untuk panduan & diskon spesial!` : `Your email ${newsletterEmail} has been registered. Check your inbox for exclusive travel guides & offers!`}
                      </p>
                      <button
                        onClick={() => {
                          setIsSubscribed(false);
                          setNewsletterEmail('');
                        }}
                        className="mt-2 text-xs font-bold text-neutral-400 hover:text-white underline cursor-pointer"
                      >
                        {language === 'zh' ? '登记另一个邮箱' : language === 'id' ? 'Daftarkan email lain' : 'Register another email'}
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-300 mb-2 text-left">
                          {t('common.email')}
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                          <input
                            type="email"
                            required
                            value={newsletterEmail}
                            onChange={(e) => {
                              setNewsletterEmail(e.target.value);
                              setNewsletterError(null);
                            }}
                            placeholder="your.email@example.com"
                            className="w-full bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 text-xs sm:text-sm rounded-xl pl-10 pr-4 py-3.5 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-sans"
                          />
                        </div>
                        {newsletterError && (
                          <p className="text-xs text-rose-400 mt-1.5 font-medium text-left">{newsletterError}</p>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs sm:text-sm py-3.5 px-6 rounded-xl shadow-lg shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-400"
                      >
                        <Send className="h-4 w-4" />
                        <span>{language === 'zh' ? '立即订阅' : language === 'id' ? 'Berlangganan Sekarang' : 'Subscribe Now'}</span>
                      </button>

                      <p className="text-[10px] text-neutral-400 text-center leading-normal">
                        {language === 'zh' ? '我们严格保护您的隐私，随时可通过邮件一键退订。' : language === 'id' ? 'Kami menghormati privasi Anda. Berhenti berlangganan kapan saja dengan 1 klik.' : 'We respect your privacy. Unsubscribe anytime with a single click.'}
                      </p>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. ALREADY BOOKED AN EXPEDITION / BOOKING STATUS SECTION (ABOVE FOOTER) */}
      <section className="py-8 sm:py-12 bg-[#F8FAF9] border-t border-neutral-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-emerald-50/30 rounded-3xl border border-emerald-100/70 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="space-y-1.5 text-center md:text-left">
              <h3 className="font-display font-bold text-[#315B4F] text-xl sm:text-2xl">
                {t("Already booked an expedition?")}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 font-sans leading-normal max-w-2xl">
                {t("Check your real-time verification logs or trace your trip itinerary voucher status instantly.")}
              </p>
            </div>
            <button
              id="home-status-btn"
              onClick={() => {
                setPage('bookings');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="bg-[#315B4F] hover:bg-[#203c34] text-white px-6 py-3.5 rounded-2xl text-xs font-display font-bold uppercase tracking-widest transition-all cursor-pointer select-none text-center shadow-sm shrink-0"
            >
              {t("Check Booking Details")}
            </button>
          </div>
        </div>
      </section>

      {/* SECURE CHECKOUT PORTAL */}
      {selectedTourForBooking && (
        <CheckoutModal
          isOpen={!!selectedTourForBooking}
          onClose={() => setSelectedTourForBooking(null)}
          serviceType="tour"
          serviceName={selectedTourForBooking.tour.name}
          basePriceUSD={selectedTourForBooking.tour.startingPrice}
          basePriceIDR={selectedTourForBooking.tour.startingPriceIDR}
          initialDetails={selectedTourForBooking.details}
        />
      )}

    </div>
  );
}
