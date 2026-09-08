import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { useLanguageCurrency } from '../sharetour/LanguageCurrencyContext';
import { Menu, X, ChevronDown, Calendar, Globe, Plane, Car, Route, Star, Compass, Handshake, Share2, Users, Check } from 'lucide-react';
import { ENABLE_FOREIGN_CURRENCIES } from '../utils/pricingUtils';
import { AnimatePresence, motion } from 'motion/react';

export default function Header() {
  const { activePage, setPage, bookings } = useApp();
  const { language, setLanguage, currency, setCurrency, t } = useLanguageCurrency();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Desktop dropdown states
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isCurrOpen, setIsCurrOpen] = useState(false);

  // Mobile Header dropdown states
  const [isMobileLangOpen, setIsMobileLangOpen] = useState(false);
  const [isMobileCurrOpen, setIsMobileCurrOpen] = useState(false);

  // Mobile Drawer dropdown states
  const [isDrawerLangOpen, setIsDrawerLangOpen] = useState(false);
  const [isDrawerCurrOpen, setIsDrawerCurrOpen] = useState(false);

  const [imageFailed, setImageFailed] = useState(false);

  // Monitor scroll to trigger header background blur
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#lang-switcher-container') && !target.closest('#curr-switcher-container')) {
        setIsLangOpen(false);
        setIsCurrOpen(false);
      }
      if (!target.closest('#mobile-lang-container') && !target.closest('#mobile-curr-container')) {
        setIsMobileLangOpen(false);
        setIsMobileCurrOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleNavigate = (page: any) => {
    setPage(page);
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
    setIsLangOpen(false);
    setIsCurrOpen(false);
    setIsMobileLangOpen(false);
    setIsMobileCurrOpen(false);
  };

  const handleLanguageChange = (newLang: 'id' | 'en' | 'zh') => {
    setLanguage(newLang);
    // Tombol mata uang Dolar ($) dan Yen (¥) sementara dinonaktifkan
    if (ENABLE_FOREIGN_CURRENCIES) {
      if (newLang === 'id' && currency === 'USD') setCurrency('IDR');
      else if (newLang === 'zh' && currency === 'USD') setCurrency('CNY');
      else if (newLang === 'en' && (currency === 'IDR' || currency === 'CNY')) setCurrency('USD');
    }
    setIsLangOpen(false);
    setIsMobileLangOpen(false);
    setIsDrawerLangOpen(false);
  };

  const handleCurrencyChange = (newCurr: 'USD' | 'IDR' | 'CNY') => {
    setCurrency(newCurr);
    setIsCurrOpen(false);
    setIsMobileCurrOpen(false);
    setIsDrawerCurrOpen(false);
  };

  return (
    <header
      id="main-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || activePage !== 'home'
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-neutral-200/60 py-3.5 sm:py-4'
          : 'bg-white/90 backdrop-blur-md shadow-sm border-b border-neutral-200/50 py-4 sm:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Brand Logo */}
          <div
            id="brand-logo"
            onClick={() => handleNavigate('home')}
            className="flex items-center space-x-2.5 cursor-pointer group shrink-0"
          >
            {!imageFailed ? (
              <img 
                src="/logo.png" 
                alt="Smart Journey Logo" 
                className="h-9 sm:h-11 w-auto max-w-[160px] sm:max-w-[180px] object-contain group-hover:scale-105 transition-transform duration-300"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <div className="bg-amber-500 text-neutral-950 p-2 rounded-xl flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform duration-300">
                <Compass className="h-5 w-5 animate-spin-slow" />
              </div>
            )}
            <div>
              <span className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 group-hover:text-amber-600 transition-colors duration-200">
                Smart<span className="text-amber-500"> Journey</span>
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav id="desktop-nav" className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => handleNavigate('home')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activePage === 'home'
                  ? 'text-amber-600 bg-amber-500/10 font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              {t('nav.home')}
            </button>

            {/* Services Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center space-x-1 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  ['tours', 'share-tour', 'airport', 'taxi', 'car-rental'].includes(activePage)
                    ? 'text-amber-600 bg-amber-500/10 font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                <span>{t('nav.services')}</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 mt-2 w-64 rounded-2xl bg-white border border-neutral-200 shadow-xl py-2 overflow-hidden"
                  >
                     <button
                      onClick={() => handleNavigate('tours')}
                      className="flex items-center space-x-3 w-full px-4 py-3 text-left text-neutral-700 hover:text-amber-600 hover:bg-amber-500/5 transition-colors"
                    >
                      <Compass className="h-4 w-4 text-amber-500 shrink-0" />
                      <div>
                        <div className="text-sm font-semibold">
                          <span>{t('nav.tours')}</span>
                        </div>
                        <div className="text-[10px] text-neutral-500">{t('nav.toursSubtitle')}</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleNavigate('share-tour')}
                      className="flex items-center space-x-3 w-full px-4 py-3 text-left text-neutral-700 hover:text-amber-600 hover:bg-amber-500/5 transition-colors border-t border-neutral-100"
                    >
                      <Users className="h-4 w-4 text-amber-500 shrink-0" />
                      <div>
                        <div className="text-sm font-semibold flex items-center gap-1.5">
                          <span>{t('nav.shareTour')}</span>
                          <span className="text-[8px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-1 py-0.5 rounded font-mono font-black uppercase tracking-wider">{t('nav.newBadge')}</span>
                        </div>
                        <div className="text-[10px] text-neutral-500">{t('nav.shareTourSubtitle')}</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleNavigate('airport')}
                      className="flex items-center space-x-3 w-full px-4 py-3 text-left text-neutral-700 hover:text-amber-600 hover:bg-amber-500/5 transition-colors border-t border-neutral-100"
                    >
                      <Plane className="h-4 w-4 text-amber-500 shrink-0" />
                      <div>
                        <div className="text-sm font-semibold flex items-center gap-1.5">
                          <span>{t('nav.airport')}</span>
                        </div>
                        <div className="text-[10px] text-neutral-500">{t('nav.airportSubtitle')}</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleNavigate('taxi')}
                      className="flex items-center space-x-3 w-full px-4 py-3 text-left text-neutral-700 hover:text-amber-600 hover:bg-amber-500/5 transition-colors border-t border-neutral-100"
                    >
                      <Route className="h-4 w-4 text-amber-500 shrink-0" />
                      <div>
                        <div className="text-sm font-semibold flex items-center gap-1.5">
                          <span>{t('nav.taxi')}</span>
                        </div>
                        <div className="text-[10px] text-neutral-500">{t('nav.taxiSubtitle')}</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleNavigate('car-rental')}
                      className="flex items-center space-x-3 w-full px-4 py-3 text-left text-neutral-700 hover:text-amber-600 hover:bg-amber-500/5 transition-colors border-t border-neutral-100"
                    >
                      <Car className="h-4 w-4 text-amber-500" />
                      <div>
                        <div className="text-sm font-semibold flex items-center gap-1.5">
                          <span>{t('nav.carRental')}</span>
                        </div>
                        <div className="text-[10px] text-neutral-500">{t('nav.carRentalSubtitle')}</div>
                      </div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => handleNavigate('about')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activePage === 'about'
                  ? 'text-amber-600 bg-amber-500/10 font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              {t('nav.about')}
            </button>
          </nav>

          {/* Desktop Language & Currency Switchers (Original Exact Initial Layout) */}
          <div className="hidden md:flex items-center space-x-2.5">
            {/* Desktop Language Dropdown (Original Exact Style) */}
            <div className="relative" id="lang-switcher-container">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 hover:bg-neutral-200/80 border border-neutral-200 text-neutral-800 transition-all cursor-pointer focus-visible:outline-none"
              >
                <Globe className="h-3.5 w-3.5 text-amber-600" />
                <span className="uppercase tracking-wide">
                  {language === 'en' ? 'EN' : language === 'id' ? 'ID' : 'ZH'}
                </span>
                <ChevronDown className="h-3 w-3 text-neutral-500" />
              </button>

              <AnimatePresence>
                {isLangOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute right-0 mt-2 w-32 rounded-2xl bg-white border border-neutral-200 shadow-xl py-1 z-50 overflow-hidden"
                  >
                    <button
                      onClick={() => { setLanguage('id'); setIsLangOpen(false); }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-amber-50 cursor-pointer ${language === 'id' ? 'font-bold text-amber-600 bg-amber-50/60' : 'text-neutral-700'}`}
                    >
                      <span className="flex items-center gap-1.5 font-bold">🇮🇩 Indonesia</span>
                      {language === 'id' && <Check className="h-3.5 w-3.5 text-amber-600" />}
                    </button>
                    <button
                      onClick={() => { setLanguage('en'); setIsLangOpen(false); }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-amber-50 cursor-pointer ${language === 'en' ? 'font-bold text-amber-600 bg-amber-50/60' : 'text-neutral-700'}`}
                    >
                      <span className="flex items-center gap-1.5 font-bold">🇬🇧 English</span>
                      {language === 'en' && <Check className="h-3.5 w-3.5 text-amber-600" />}
                    </button>
                    <button
                      onClick={() => { setLanguage('zh'); setIsLangOpen(false); }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-amber-50 cursor-pointer ${language === 'zh' ? 'font-bold text-amber-600 bg-amber-50/60' : 'text-neutral-700'}`}
                    >
                      <span className="flex items-center gap-1.5 font-bold">🇨🇳 中文</span>
                      {language === 'zh' && <Check className="h-3.5 w-3.5 text-amber-600" />}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop Currency Switcher (Tombol Dolar $ dan Yen ¥ sementara dimatikan, jangan dihapus) */}
            <div className="flex flex-col items-center justify-center bg-neutral-100/90 border border-neutral-200/90 p-0.5 rounded-lg shadow-xs" id="desktop-currency-switcher" title="Mata Uang">
              {/* Tombol Dolar ($) - Sementara dimatikan, jangan dihapus */}
              <button
                type="button"
                disabled={!ENABLE_FOREIGN_CURRENCIES}
                onClick={() => ENABLE_FOREIGN_CURRENCIES && setCurrency('USD')}
                className={`w-6 h-4 rounded text-[11px] font-black leading-none flex items-center justify-center transition-all duration-150 ${
                  !ENABLE_FOREIGN_CURRENCIES
                    ? 'text-neutral-300 opacity-30 cursor-not-allowed select-none'
                    : currency === 'USD'
                    ? 'bg-amber-500 text-neutral-950 shadow-xs font-black cursor-pointer'
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/60 font-bold cursor-pointer'
                }`}
                title={!ENABLE_FOREIGN_CURRENCIES ? "Dolar ($) - Sementara dinonaktifkan" : "USD ($)"}
                aria-label="Set currency to US Dollar ($)"
              >
                $
              </button>

              {/* Tombol Rupiah (IDR) - Aktif */}
              <button
                type="button"
                onClick={() => setCurrency('IDR')}
                className={`w-6 h-4 rounded text-[9.5px] font-black leading-none flex items-center justify-center transition-all duration-150 cursor-pointer ${
                  currency === 'IDR'
                    ? 'bg-amber-500 text-neutral-950 shadow-xs font-black'
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/60 font-bold'
                }`}
                title="IDR (Rp) - Aktif"
                aria-label="Set currency to Indonesian Rupiah (Rp)"
              >
                Rp
              </button>

              {/* Tombol Yen / Yuan (¥) - Sementara dimatikan, jangan dihapus */}
              <button
                type="button"
                disabled={!ENABLE_FOREIGN_CURRENCIES}
                onClick={() => ENABLE_FOREIGN_CURRENCIES && setCurrency('CNY')}
                className={`w-6 h-4 rounded text-[11px] font-black leading-none flex items-center justify-center transition-all duration-150 ${
                  !ENABLE_FOREIGN_CURRENCIES
                    ? 'text-neutral-300 opacity-30 cursor-not-allowed select-none'
                    : currency === 'CNY'
                    ? 'bg-amber-500 text-neutral-950 shadow-xs font-black cursor-pointer'
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/60 font-bold cursor-pointer'
                }`}
                title={!ENABLE_FOREIGN_CURRENCIES ? "Yen / Yuan (¥) - Sementara dinonaktifkan" : "CNY (¥)"}
                aria-label="Set currency to Chinese Yuan (¥)"
              >
                ¥
              </button>
            </div>

            {/* My Bookings Link */}
            <button
              onClick={() => handleNavigate('bookings')}
              className={`relative px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center space-x-1.5 cursor-pointer ${
                activePage === 'bookings'
                  ? 'text-amber-600 bg-amber-500/10'
                  : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <Calendar className="h-3.5 w-3.5 text-amber-500" />
              <span>{t('nav.myBookings')}</span>
              {bookings && bookings.length > 0 && (
                <span className="ml-0.5 bg-amber-500 text-neutral-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {bookings.length}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Separate Dropdowns & Menu Controls (Compact & Sleek for Smartphone) */}
          <div className="flex md:hidden items-center space-x-1 sm:space-x-1.5">
            
            {/* 1. Mobile Separate Language Dropdown */}
            <div className="relative" id="mobile-lang-container">
              <button
                onClick={() => {
                  setIsMobileLangOpen(!isMobileLangOpen);
                  setIsMobileCurrOpen(false);
                }}
                className="bg-neutral-100/90 active:bg-neutral-200 border border-neutral-200 text-neutral-800 text-[11px] px-2 py-1 rounded-lg font-black font-mono h-7 flex items-center justify-center gap-1 cursor-pointer shadow-2xs transition-all hover:bg-neutral-200/60"
                title="Pilih Bahasa"
                aria-label="Pilih Bahasa"
                aria-expanded={isMobileLangOpen}
              >
                <span className="uppercase tracking-tight text-neutral-800">
                  {language === 'en' ? 'EN' : language === 'id' ? 'ID' : 'ZH'}
                </span>
                <ChevronDown className={`h-3 w-3 text-neutral-500 transition-transform duration-200 ${isMobileLangOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isMobileLangOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.96 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-full mt-1 w-28 bg-white rounded-xl shadow-xl border border-neutral-200 py-1 z-50 overflow-hidden"
                  >
                    <button
                      onClick={() => handleLanguageChange('id')}
                      className={`w-full text-left px-2.5 py-1.5 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        language === 'id' ? 'bg-amber-50 text-amber-800 font-bold' : 'text-neutral-700 active:bg-neutral-100'
                      }`}
                    >
                      <span className="font-bold">ID</span>
                      {language === 'id' && <Check className="h-3 w-3 text-amber-600" />}
                    </button>
                    <button
                      onClick={() => handleLanguageChange('en')}
                      className={`w-full text-left px-2.5 py-1.5 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        language === 'en' ? 'bg-amber-50 text-amber-800 font-bold' : 'text-neutral-700 active:bg-neutral-100'
                      }`}
                    >
                      <span className="font-bold">EN</span>
                      {language === 'en' && <Check className="h-3 w-3 text-amber-600" />}
                    </button>
                    <button
                      onClick={() => handleLanguageChange('zh')}
                      className={`w-full text-left px-2.5 py-1.5 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        language === 'zh' ? 'bg-amber-50 text-amber-800 font-bold' : 'text-neutral-700 active:bg-neutral-100'
                      }`}
                    >
                      <span className="font-bold">ZH</span>
                      {language === 'zh' && <Check className="h-3 w-3 text-amber-600" />}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 2. Mobile Separate Currency Dropdown */}
            <div className="relative" id="mobile-curr-container">
              <button
                onClick={() => {
                  setIsMobileCurrOpen(!isMobileCurrOpen);
                  setIsMobileLangOpen(false);
                }}
                className="bg-neutral-100/90 active:bg-neutral-200 border border-neutral-200 text-neutral-800 text-[11px] px-2 py-1 rounded-lg font-black font-mono h-7 flex items-center justify-center gap-1 cursor-pointer shadow-2xs transition-all hover:bg-neutral-200/60"
                title="Pilih Mata Uang"
                aria-label="Pilih Mata Uang"
                aria-expanded={isMobileCurrOpen}
              >
                <span className="tracking-tight text-neutral-800">
                  {currency}
                </span>
                <ChevronDown className={`h-3 w-3 text-neutral-500 transition-transform duration-200 ${isMobileCurrOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isMobileCurrOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 1 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-full mt-1 w-28 bg-white rounded-xl shadow-xl border border-neutral-200 py-1 z-50 overflow-hidden"
                  >
                    <button
                      onClick={() => handleCurrencyChange('IDR')}
                      className={`w-full text-left px-2.5 py-1.5 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        currency === 'IDR' ? 'bg-amber-50 text-amber-800 font-bold' : 'text-neutral-700 active:bg-neutral-100'
                      }`}
                    >
                      <span className="font-bold font-mono">IDR</span>
                      {currency === 'IDR' && <Check className="h-3 w-3 text-amber-600" />}
                    </button>
                    {/* Tombol Dolar (USD) - Sementara dimatikan, jangan dihapus */}
                    <button
                      disabled={!ENABLE_FOREIGN_CURRENCIES}
                      onClick={() => ENABLE_FOREIGN_CURRENCIES && handleCurrencyChange('USD')}
                      className={`w-full text-left px-2.5 py-1.5 text-xs flex items-center justify-between transition-colors ${
                        !ENABLE_FOREIGN_CURRENCIES
                          ? 'text-neutral-400 opacity-40 cursor-not-allowed select-none'
                          : currency === 'USD' ? 'bg-amber-50 text-amber-800 font-bold cursor-pointer' : 'text-neutral-700 active:bg-neutral-100 cursor-pointer'
                      }`}
                      title={!ENABLE_FOREIGN_CURRENCIES ? "Dolar (USD) - Sementara dinonaktifkan" : "USD ($)"}
                    >
                      <span className="font-bold font-mono">USD {!ENABLE_FOREIGN_CURRENCIES && <span className="text-[10px] text-neutral-400 font-normal">(Off)</span>}</span>
                      {ENABLE_FOREIGN_CURRENCIES && currency === 'USD' && <Check className="h-3 w-3 text-amber-600" />}
                    </button>
                    {/* Tombol Yen / CNY - Sementara dimatikan, jangan dihapus */}
                    <button
                      disabled={!ENABLE_FOREIGN_CURRENCIES}
                      onClick={() => ENABLE_FOREIGN_CURRENCIES && handleCurrencyChange('CNY')}
                      className={`w-full text-left px-2.5 py-1.5 text-xs flex items-center justify-between transition-colors ${
                        !ENABLE_FOREIGN_CURRENCIES
                          ? 'text-neutral-400 opacity-40 cursor-not-allowed select-none'
                          : currency === 'CNY' ? 'bg-amber-50 text-amber-800 font-bold cursor-pointer' : 'text-neutral-700 active:bg-neutral-100 cursor-pointer'
                      }`}
                      title={!ENABLE_FOREIGN_CURRENCIES ? "Yen / CNY - Sementara dinonaktifkan" : "CNY (¥)"}
                    >
                      <span className="font-bold font-mono">CNY/Yen {!ENABLE_FOREIGN_CURRENCIES && <span className="text-[10px] text-neutral-400 font-normal">(Off)</span>}</span>
                      {ENABLE_FOREIGN_CURRENCIES && currency === 'CNY' && <Check className="h-3 w-3 text-amber-600" />}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 3. Mobile Hamburger Navigation Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-neutral-700 hover:text-neutral-900 active:bg-neutral-100 p-1 rounded-lg h-7 w-7 flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              aria-label="Toggle Navigation Menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Backdrop & Drawer Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 top-[52px] sm:top-[60px] bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="relative z-50 md:hidden bg-white border-b border-neutral-200 shadow-2xl max-h-[calc(100vh-3.5rem)] overflow-y-auto"
            >
              <div className="px-4 pt-3 pb-8 space-y-3">
                <button
                  onClick={() => handleNavigate('home')}
                  className={`flex items-center w-full text-left px-4 py-3 rounded-2xl text-sm font-semibold transition-colors min-h-[44px] cursor-pointer ${
                    activePage === 'home' ? 'bg-amber-500/10 text-amber-700 font-bold' : 'text-neutral-800 hover:bg-neutral-50'
                  }`}
                >
                  {t('nav.home')}
                </button>

                <div className="border-t border-neutral-100 pt-3 my-1">
                  <div className="px-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2 font-mono">
                    {t('nav.services')}
                  </div>
                  <button
                    onClick={() => handleNavigate('tours')}
                    className={`flex items-center justify-between w-full px-4 py-3 rounded-2xl text-sm transition-colors min-h-[44px] cursor-pointer ${
                      activePage === 'tours' ? 'bg-amber-500/10 text-amber-700 font-bold' : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Compass className="h-5 w-5 text-amber-500 shrink-0" />
                      <span className="font-medium">{t('nav.tours')}</span>
                    </div>
                    <span className="text-xs text-neutral-400">Bromo, Ijen</span>
                  </button>

                  <button
                    onClick={() => handleNavigate('share-tour')}
                    className={`flex items-center justify-between w-full px-4 py-3 rounded-2xl text-sm transition-colors min-h-[44px] cursor-pointer ${
                      activePage === 'share-tour' ? 'bg-amber-500/10 text-amber-700 font-bold' : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-amber-500 shrink-0" />
                      <span className="font-medium">{t('nav.shareTour')}</span>
                    </div>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">{t('nav.newBadge')}</span>
                  </button>

                  <button
                    onClick={() => handleNavigate('airport')}
                    className={`flex items-center justify-between w-full px-4 py-3 rounded-2xl text-sm transition-colors min-h-[44px] cursor-pointer ${
                      activePage === 'airport' ? 'bg-amber-500/10 text-amber-700 font-bold' : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Plane className="h-5 w-5 text-amber-500 shrink-0" />
                      <span className="font-medium">{t('nav.airport')}</span>
                    </div>
                    <span className="text-xs text-neutral-400">SUB, DPS</span>
                  </button>

                  <button
                    onClick={() => handleNavigate('taxi')}
                    className={`flex items-center justify-between w-full px-4 py-3 rounded-2xl text-sm transition-colors min-h-[44px] cursor-pointer ${
                      activePage === 'taxi' ? 'bg-amber-500/10 text-amber-700 font-bold' : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Route className="h-5 w-5 text-amber-500 shrink-0" />
                      <span className="font-medium">{t('nav.taxi')}</span>
                    </div>
                    <span className="text-xs text-neutral-400">{t('nav.taxiSubtitle')}</span>
                  </button>

                  <button
                    onClick={() => handleNavigate('car-rental')}
                    className={`flex items-center justify-between w-full px-4 py-3 rounded-2xl text-sm transition-colors min-h-[44px] cursor-pointer ${
                      activePage === 'car-rental' ? 'bg-amber-500/10 text-amber-700 font-bold' : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Car className="h-5 w-5 text-amber-500 shrink-0" />
                      <span className="font-medium">{t('nav.carRental')}</span>
                    </div>
                    <span className="text-xs text-neutral-400">{t('nav.carRentalSubtitle')}</span>
                  </button>
                </div>

                <button
                  onClick={() => handleNavigate('about')}
                  className={`flex items-center w-full text-left px-4 py-3 rounded-2xl text-sm font-semibold transition-colors min-h-[44px] cursor-pointer ${
                    activePage === 'about' ? 'bg-amber-500/10 text-amber-700 font-bold' : 'text-neutral-800 hover:bg-neutral-50'
                  }`}
                >
                  {t('nav.about')}
                </button>

                {/* Mobile Drawer Separate Dropdowns Card */}
                <div className="bg-neutral-50 border border-neutral-200/80 rounded-2xl p-3.5 space-y-3">
                  
                  {/* Separate Dropdown 1: Bahasa */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-amber-600" />
                      {language === 'id' ? 'Pilih Bahasa' : language === 'zh' ? '选择语言' : 'Choose Language'}
                    </label>
                    <div className="relative">
                      <button
                        onClick={() => {
                          setIsDrawerLangOpen(!isDrawerLangOpen);
                          setIsDrawerCurrOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 shadow-xs cursor-pointer active:bg-neutral-50"
                      >
                        <span className="font-bold">
                          {language === 'id' ? 'ID (Bahasa Indonesia)' : language === 'en' ? 'EN (English)' : 'ZH (简体中文)'}
                        </span>
                        <ChevronDown className={`h-4 w-4 text-neutral-400 transition-transform duration-200 ${isDrawerLangOpen ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {isDrawerLangOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.15 }}
                            className="mt-1.5 w-full bg-white border border-neutral-200 rounded-xl shadow-lg py-1 overflow-hidden z-20"
                          >
                            <button
                              onClick={() => handleLanguageChange('id')}
                              className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between cursor-pointer ${
                                language === 'id' ? 'bg-amber-50 text-amber-800 font-bold' : 'text-neutral-700 hover:bg-neutral-50'
                              }`}
                            >
                              <span>ID (Bahasa Indonesia)</span>
                              {language === 'id' && <Check className="h-4 w-4 text-amber-600" />}
                            </button>
                            <button
                              onClick={() => handleLanguageChange('en')}
                              className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between cursor-pointer ${
                                language === 'en' ? 'bg-amber-50 text-amber-800 font-bold' : 'text-neutral-700 hover:bg-neutral-50'
                              }`}
                            >
                              <span>EN (English)</span>
                              {language === 'en' && <Check className="h-4 w-4 text-amber-600" />}
                            </button>
                            <button
                              onClick={() => handleLanguageChange('zh')}
                              className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between cursor-pointer ${
                                language === 'zh' ? 'bg-amber-50 text-amber-800 font-bold' : 'text-neutral-700 hover:bg-neutral-50'
                              }`}
                            >
                              <span>ZH (简体中文)</span>
                              {language === 'zh' && <Check className="h-4 w-4 text-amber-600" />}
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Separate Dropdown 2: Mata Uang */}
                  <div className="space-y-1.5 pt-1 border-t border-neutral-200/60">
                    <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <span className="font-black text-amber-600 font-mono">$</span>
                      {language === 'id' ? 'Pilih Mata Uang' : language === 'zh' ? '选择结算货币' : 'Choose Currency'}
                    </label>
                    <div className="relative">
                      <button
                        onClick={() => {
                          setIsDrawerCurrOpen(!isDrawerCurrOpen);
                          setIsDrawerLangOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 shadow-xs cursor-pointer active:bg-neutral-50"
                      >
                        <span className="font-bold font-mono">
                          {currency}
                        </span>
                        <ChevronDown className={`h-4 w-4 text-neutral-400 transition-transform duration-200 ${isDrawerCurrOpen ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {isDrawerCurrOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.15 }}
                            className="mt-1.5 w-full bg-white border border-neutral-200 rounded-xl shadow-lg py-1 overflow-hidden z-20"
                          >
                            <button
                              onClick={() => handleCurrencyChange('IDR')}
                              className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between cursor-pointer ${
                                currency === 'IDR' ? 'bg-amber-50 text-amber-800 font-bold' : 'text-neutral-700 hover:bg-neutral-50'
                              }`}
                            >
                              <span className="font-bold font-mono">IDR</span>
                              {currency === 'IDR' && <Check className="h-4 w-4 text-amber-600" />}
                            </button>
                            {/* Tombol Dolar (USD) - Sementara dimatikan, jangan dihapus */}
                            <button
                              disabled={!ENABLE_FOREIGN_CURRENCIES}
                              onClick={() => ENABLE_FOREIGN_CURRENCIES && handleCurrencyChange('USD')}
                              className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between ${
                                !ENABLE_FOREIGN_CURRENCIES
                                  ? 'text-neutral-400 opacity-40 cursor-not-allowed select-none'
                                  : currency === 'USD' ? 'bg-amber-50 text-amber-800 font-bold cursor-pointer' : 'text-neutral-700 hover:bg-neutral-50 cursor-pointer'
                              }`}
                              title={!ENABLE_FOREIGN_CURRENCIES ? "Dolar (USD) - Sementara dinonaktifkan" : "USD ($)"}
                            >
                              <span className="font-bold font-mono">USD {!ENABLE_FOREIGN_CURRENCIES && <span className="text-[10px] text-neutral-400 font-normal">(Off)</span>}</span>
                              {ENABLE_FOREIGN_CURRENCIES && currency === 'USD' && <Check className="h-4 w-4 text-amber-600" />}
                            </button>
                            {/* Tombol Yen / CNY - Sementara dimatikan, jangan dihapus */}
                            <button
                              disabled={!ENABLE_FOREIGN_CURRENCIES}
                              onClick={() => ENABLE_FOREIGN_CURRENCIES && handleCurrencyChange('CNY')}
                              className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between ${
                                !ENABLE_FOREIGN_CURRENCIES
                                  ? 'text-neutral-400 opacity-40 cursor-not-allowed select-none'
                                  : currency === 'CNY' ? 'bg-amber-50 text-amber-800 font-bold cursor-pointer' : 'text-neutral-700 hover:bg-neutral-50 cursor-pointer'
                              }`}
                              title={!ENABLE_FOREIGN_CURRENCIES ? "Yen / CNY - Sementara dinonaktifkan" : "CNY (¥)"}
                            >
                              <span className="font-bold font-mono">CNY/Yen {!ENABLE_FOREIGN_CURRENCIES && <span className="text-[10px] text-neutral-400 font-normal">(Off)</span>}</span>
                              {ENABLE_FOREIGN_CURRENCIES && currency === 'CNY' && <Check className="h-4 w-4 text-amber-600" />}
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                </div>

                {/* Mobile Drawer Action Buttons */}
                <div className="pt-2 space-y-2.5">
                  <button
                    onClick={() => handleNavigate('bookings')}
                    className="flex items-center justify-between w-full px-4 py-3.5 rounded-2xl bg-neutral-900 active:bg-neutral-800 text-white text-xs font-bold transition-all cursor-pointer min-h-[44px]"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Calendar className="h-4.5 w-4.5 text-amber-400" />
                      <span>{t('nav.checkStatus')}</span>
                    </div>
                    {bookings && bookings.length > 0 && (
                      <span className="bg-amber-500 text-neutral-950 text-[10px] font-black px-2.5 py-1 rounded-full">
                        {bookings.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
