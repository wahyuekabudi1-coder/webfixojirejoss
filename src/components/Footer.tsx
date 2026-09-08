import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { useLanguageCurrency } from '../sharetour/LanguageCurrencyContext';
import SocialMediaButtons from './SocialMediaButtons';
import { Mail, MapPin, Phone, Clock, MessageSquare, Instagram, Facebook, Youtube, Share2, Sparkles, QrCode, Copy, Check, X, ShieldCheck, FileText, Lock, ExternalLink, Compass, Timer } from 'lucide-react';
import { trackWhatsAppClick, trackEmailClick, trackPhoneClick } from '../lib/analytics';

function WeChatIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      fill="currentColor" 
      viewBox="0 0 16 16"
      className={className}
    >
      <path d="M11.176 14.429c-2.665 0-4.826-1.8-4.826-4.018 0-2.22 2.159-4.02 4.824-4.02S16 8.191 16 10.411c0 1.21-.65 2.301-1.666 3.036a.32.32 0 0 0-.12.366l.218.81a.6.6 0 0 1 .029.117.166.166 0 0 1-.162.162.2.2 0 0 1-.092-.03l-1.057-.61a.5.5 0 0 0-.256-.074.5.5 0 0 0-.142.021 5.7 5.7 0 0 1-1.576.22M9.064 9.542a.647.647 0 1 0 .557-1 .645.645 0 0 0-.646.647.6.6 0 0 0 .09.353Zm3.232.001a.646.646 0 1 0 .546-1 .645.645 0 0 0-.644.644.63.63 0 0 0 .098.356"/>
      <path d="M0 6.826c0 1.455.781 2.765 2.001 3.656a.385.385 0 0 1 .143.439l-.161.6-.1.373a.5.5 0 0 0-.032.14.19.19 0 0 0 .193.193q.06 0 .111-.029l1.268-.733a.6.6 0 0 1 .308-.088q.088 0 .171.025a6.8 6.8 0 0 0 1.625.26 4.5 4.5 0 0 1-.177-1.251c0-2.936 2.785-5.02 5.824-5.02l.15.002C10.587 3.429 8.392 2 5.796 2 2.596 2 0 4.16 0 6.826m4.632-1.555a.77.77 0 1 1-1.54 0 .77.77 0 0 1 1.54 0m3.875 0a.77.77 0 1 1-1.54 0 .77.77 0 0 1 1.54 0"/>
    </svg>
  );
}

export default function Footer() {
  const { setPage, setPrivacyOpen, setTermsOpen } = useApp();
  const { t, language } = useLanguageCurrency();
  const [emailSubscribed, setEmailSubscribed] = useState(false);
  const [email, setEmail] = useState('');
  const [isWeChatModalOpen, setIsWeChatModalOpen] = useState(false);
  const [copiedWeChat, setCopiedWeChat] = useState(false);
  const [qrImageError, setQrImageError] = useState(false);
  const [qrSrc, setQrSrc] = useState('/wechat-qr-1.png');
  const [footerLogoError, setFooterLogoError] = useState(false);

  const [clickCount, setClickCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes = 180 seconds

  // Auto-hide countdown timer (3 minutes / 180 seconds)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (clickCount >= 8 && clickCount <= 12) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setClickCount(0); // auto-hide when 3 minutes expire
            return 180;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setTimeLeft(180);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [clickCount]);

  const handleSecretClick = () => {
    const nextCount = clickCount + 1;
    if (nextCount > 12) {
      setClickCount(0);
      setTimeLeft(180);
    } else {
      if (nextCount === 8) {
        setTimeLeft(180);
      }
      setClickCount(nextCount);
    }
  };

  const handleCopyWeChat = () => {
    navigator.clipboard.writeText('sjtrans');
    setCopiedWeChat(true);
    setTimeout(() => setCopiedWeChat(false), 2000);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setEmailSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer id="main-footer" className="bg-neutral-50 text-neutral-600 pb-24 sm:pb-12 border-t border-neutral-200/85">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-12">
          
          {/* Column 1: About Info, Brand Logo & Official Social Channels */}
          <div className="space-y-4">
            {/* Brand Logo */}
            <div 
              id="footer-brand-logo"
              onClick={() => {
                setPage('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center space-x-2.5 cursor-pointer group select-none"
            >
              {!footerLogoError ? (
                <img 
                  src="/logo.png" 
                  alt="Smart Journey Logo" 
                  className="h-10 sm:h-11 w-auto max-w-[160px] object-contain group-hover:scale-105 transition-transform duration-300"
                  onError={() => setFooterLogoError(true)}
                />
              ) : (
                <div className="bg-amber-500 text-neutral-950 p-2 rounded-xl flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform duration-300">
                  <Compass className="h-5 w-5 animate-spin-slow" />
                </div>
              )}
              <div>
                <span className="text-base sm:text-lg font-bold tracking-tight text-neutral-900 group-hover:text-amber-600 transition-colors duration-200 block">
                  Smart<span className="text-amber-500"> Journey</span>
                </span>
                <span className="text-[10px] text-neutral-400 font-mono tracking-wider uppercase font-semibold block">
                  PT Sawah Jaya Trans
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                {t('footer.aboutText')}
              </p>
            </div>

            {/* Official Social Media - Icon-Only Buttons */}
            <div className="pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 font-mono block mb-2">
                {language === 'zh' ? '官方社交媒体' : language === 'id' ? 'Media Sosial Resmi' : 'Official Social Media'}
              </span>
              <SocialMediaButtons size="md" />
            </div>
          </div>
 
          {/* Column 2: Services & Quick Links */}
          <div className="border-t border-neutral-200/60 pt-6 md:border-t-0 md:pt-0">
            <h3 className="text-neutral-900 font-bold text-xs tracking-wider uppercase mb-4 border-l-2 border-amber-500 pl-2.5">
              {t('footer.servicesTitle')}
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => setPage('tours')} className="hover:text-amber-600 text-neutral-700 transition-colors cursor-pointer font-medium">
                  {t('nav.tours')}
                </button>
              </li>
              <li>
                <button onClick={() => setPage('share-tour')} className="hover:text-amber-600 text-neutral-700 transition-colors cursor-pointer flex items-center gap-1.5 font-medium">
                  <span>{t('nav.shareTour')}</span>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono font-bold uppercase">{t('nav.newBadge')}</span>
                </button>
              </li>
              <li>
                <button onClick={() => setPage('airport')} className="hover:text-amber-600 text-neutral-700 transition-colors cursor-pointer font-medium">
                  {t('nav.airport')}
                </button>
              </li>
              <li>
                <button onClick={() => setPage('taxi')} className="hover:text-amber-600 text-neutral-700 transition-colors cursor-pointer font-medium">
                  {t('nav.taxi')}
                </button>
              </li>
              <li>
                <button onClick={() => setPage('car-rental')} className="hover:text-amber-600 text-neutral-700 transition-colors cursor-pointer font-medium">
                  {t('nav.carRental')}
                </button>
              </li>
              <li className="pt-2 border-t border-neutral-200/60 flex items-center gap-4 text-xs font-semibold text-neutral-500">
                <button onClick={() => setPage('about')} className="hover:text-amber-600 transition-colors cursor-pointer">
                  {t('nav.about')}
                </button>
                <span>•</span>
                <button onClick={() => setPage('partnerships')} className="hover:text-amber-600 transition-colors cursor-pointer">
                  {t('footer.partnerships')}
                </button>
              </li>
            </ul>
          </div>
 
          {/* Column 3: Contact Details */}
          <div id="footer-contact-column" className="border-t border-neutral-200/60 pt-6 md:border-t-0 md:pt-0 rounded-2xl p-2 transition-all duration-500">
            <h3 className="text-neutral-900 font-bold text-xs tracking-wider uppercase mb-4 border-l-2 border-amber-500 pl-2.5">
              {t('footer.contactTitle')}
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm text-neutral-600">
              <li className="flex items-center space-x-2.5">
                <Phone className="h-4 w-4 text-amber-500 shrink-0" />
                <a 
                  href="https://wa.me/6285212347289" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  onClick={() => trackWhatsAppClick('Footer Phone Link', '+6285212347289')}
                  className="hover:text-amber-600 font-medium text-neutral-700 transition-colors"
                >
                  +62 852-1234-7289 (WhatsApp)
                </a>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail className="h-4 w-4 text-amber-500 shrink-0" />
                <a 
                  href="mailto:Info@sawahjayatrans.com" 
                  onClick={() => trackEmailClick('Info@sawahjayatrans.com', 'Footer Email Link')}
                  className="hover:text-amber-600 font-medium text-neutral-700 transition-colors"
                >
                  Info@sawahjayatrans.com
                </a>
              </li>
              <li className="flex items-start space-x-2.5">
                <MapPin className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs text-neutral-700 space-y-0.5 leading-snug">
                  <div><strong>Malang:</strong> Jl. Puntadewa No. 192, Tumpang</div>
                  <div><strong>Bali:</strong> Jl. By Pass Ngurah Rai, Denpasar</div>
                </div>
              </li>
            </ul>

            {/* Quick Contact Buttons */}
            <div className="mt-4 pt-4 border-t border-neutral-200/50 flex gap-2">
              <a 
                id="footer-wa-btn"
                href="https://wa.me/6285212347289" 
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={() => trackWhatsAppClick('Footer Quick WhatsApp Button', '+6285212347289')}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all hover:scale-[1.01] duration-200 flex-1 text-center"
              >
                <Phone className="h-3.5 w-3.5" />
                <span>WhatsApp</span>
              </a>

              <button 
                id="footer-wechat-btn"
                onClick={() => {
                  setQrImageError(false);
                  setQrSrc('/wechat-qr-1.png');
                  setIsWeChatModalOpen(true);
                }}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold shadow-sm transition-all hover:scale-[1.01] duration-200 flex-1 text-center"
              >
                <WeChatIcon className="h-3.5 w-3.5" />
                <span>WeChat</span>
              </button>
            </div>
          </div>
 
        </div>
 
        {/* 2. SECURITY & PAYMENT METHODS STRIP (Clean & Professional 2026 Enterprise Edition) */}
        <div id="footer-secure-payment-strip" className="bg-[#1b332c] text-white p-5 sm:py-6 sm:px-8 rounded-2xl border border-[#2b5145] my-6 sm:my-8 shadow-xl max-w-5xl mx-auto w-full flex flex-col md:flex-row md:items-center md:justify-between gap-5 md:gap-8">
          
          {/* LEFT: Security Section */}
          <div className="flex items-center gap-3.5 w-full md:w-auto">
            <div className="w-11 h-11 rounded-xl bg-[#26483d] border border-[#3b6657] flex items-center justify-center text-amber-300 shrink-0 shadow-sm">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs sm:text-sm font-black tracking-wider text-white uppercase font-sans">
                {t('footer.secure')}
              </span>
              <p className="text-[11px] sm:text-xs text-emerald-100/90 font-normal leading-tight mt-0.5">
                {t('footer.secureSubtitle')}
              </p>
            </div>
          </div>

          {/* Horizontal Divider on Mobile / Vertical Divider on Desktop */}
          <div className="w-full h-px bg-[#2b5145] md:hidden" />
          <div className="hidden md:block w-px h-10 bg-[#2b5145] shrink-0 self-center" />

          {/* RIGHT: Payment Methods Section (Neat 3x2 Grid on Mobile, 1x6 Row on Desktop) */}
          <div className="flex flex-col items-center md:items-end gap-2.5 w-full md:w-auto shrink-0">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-200/90 font-mono text-center md:text-right">
              {t('footer.paymentMethods')}
            </span>
            
            {/* Payment Method Badges: Balanced 3-col grid on smartphone, clean flex row on tablet/desktop */}
            <div className="grid grid-cols-3 sm:flex sm:flex-nowrap items-center justify-center gap-2 sm:gap-2.5 w-full sm:w-auto">
              {/* VISA */}
              <div className="w-full sm:w-[60px] h-[34px] sm:h-[30px] bg-white rounded-lg flex items-center justify-center select-none border border-slate-200 shadow-xs hover:scale-105 transition-transform" title="VISA">
                <span className="text-[#1A1F71] font-black italic tracking-wide text-xs sm:text-xs font-sans">VISA</span>
              </div>

              {/* Mastercard */}
              <div className="w-full sm:w-[60px] h-[34px] sm:h-[30px] bg-white rounded-lg flex items-center justify-center select-none border border-slate-200 shadow-xs hover:scale-105 transition-transform" title="Mastercard">
                <div className="relative w-6 h-4 flex items-center justify-center">
                  <div className="absolute left-0.5 w-[13px] h-[13px] rounded-full bg-[#EB001B] opacity-95" />
                  <div className="absolute right-0.5 w-[13px] h-[13px] rounded-full bg-[#F79E1B] opacity-90 mix-blend-multiply" />
                </div>
              </div>

              {/* JCB */}
              <div className="w-full sm:w-[60px] h-[34px] sm:h-[30px] bg-white rounded-lg flex items-center justify-center select-none border border-slate-200 shadow-xs hover:scale-105 transition-transform" title="JCB">
                <div className="flex items-center gap-0.5 font-sans">
                  <span className="text-[#004193] font-black tracking-tight text-xs italic">J</span>
                  <span className="text-[#D31115] font-black tracking-tight text-xs italic">C</span>
                  <span className="text-[#008938] font-black tracking-tight text-xs italic">B</span>
                </div>
              </div>

              {/* QRIS */}
              <div className="w-full sm:w-[60px] h-[34px] sm:h-[30px] bg-white rounded-lg flex items-center justify-center select-none border border-slate-200 shadow-xs hover:scale-105 transition-transform" title="QRIS">
                <span className="text-[#012d5e] font-black tracking-tight text-xs font-sans">QRIS</span>
              </div>

              {/* Alipay */}
              <div className="w-full sm:w-[60px] h-[34px] sm:h-[30px] bg-white rounded-lg flex items-center justify-center select-none border border-slate-200 shadow-xs hover:scale-105 transition-transform" title="Alipay">
                <span className="text-[#00A1E9] font-extrabold text-xs tracking-tight font-sans">Alipay</span>
              </div>

              {/* PayPal */}
              <div className="w-full sm:w-[60px] h-[34px] sm:h-[30px] bg-white rounded-lg flex items-center justify-center select-none border border-slate-200 shadow-xs hover:scale-105 transition-transform" title="PayPal">
                <div className="flex items-center justify-center font-sans tracking-tight font-black italic text-xs">
                  <span className="text-[#003087]">Pay</span>
                  <span className="text-[#0079C1]">Pal</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. POLICY & CONTACT NAVIGATION (Horizontal & Center Aligned) */}
        <div className="border-t border-neutral-200/80 mt-8 pt-6 flex justify-center text-xs text-neutral-500">
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-neutral-500 text-xs font-medium">
            <button 
              onClick={() => setPrivacyOpen(true)} 
              className="hover:text-neutral-900 transition-colors cursor-pointer"
            >
              {t('footer.privacyPolicy')}
            </button>
            <span className="text-neutral-300 select-none">•</span>
            <button 
              onClick={() => setTermsOpen(true)} 
              className="hover:text-neutral-900 transition-colors cursor-pointer"
            >
              {t('footer.termsConditions')}
            </button>
            <span className="text-neutral-300 select-none">•</span>
            <button 
              onClick={() => {
                const element = document.getElementById('footer-contact-column');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  element.classList.add('bg-amber-500/10', 'ring-2', 'ring-amber-500/20');
                  setTimeout(() => {
                    element.classList.remove('bg-amber-500/10', 'ring-2', 'ring-amber-500/20');
                  }, 2000);
                }
              }} 
              className="hover:text-neutral-900 transition-colors cursor-pointer"
            >
              {t('footer.contactUs')}
            </button>
          </div>
        </div>

        {/* 4. COPYRIGHT & CONDITIONAL ADMIN ACCESS BUTTONS (Revealed on 8-12 clicks on PT Sawah Jaya Trans) */}
        <div className="mt-4 pb-2 flex flex-col items-center justify-center gap-2.5 text-center text-xs text-neutral-500 font-normal select-none">
          <p>
            © {new Date().getFullYear()}{' '}
            <span 
              id="secret-admin-copyright-trigger"
              onClick={handleSecretClick}
              className="font-semibold text-neutral-700 hover:text-neutral-900 cursor-pointer transition-colors"
              title=""
            >
              PT Sawah Jaya Trans
            </span>
            . All rights reserved.
          </p>

          {/* Admin Access Buttons (Visible strictly when clicked 8 to 12 times; disappears automatically if > 12 or after 3 minutes) */}
          {clickCount >= 8 && clickCount <= 12 && (
            <div className="mt-1 flex flex-wrap items-center justify-center gap-2.5 animate-fade-in">
              {/* 1. Admin Website (Smart Journey) */}
              <button
                id="btn-admin-smart-journey-footer"
                type="button"
                onClick={() => {
                  window.location.hash = '';
                  setPage('admin');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#203c34] hover:bg-[#315B4F] text-amber-300 hover:text-amber-200 text-[11px] font-mono font-semibold rounded-lg border border-[#315B4F] hover:border-[#467b6b] transition-all shadow-xs hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                title="Akses Dashboard Admin Smart Journey (/admin)"
              >
                <Lock className="w-3 h-3 text-amber-300" />
                <span>{t('footer.adminWebsite')}</span>
              </button>

              {/* 2. Admin Share Tour */}
              <button
                id="btn-admin-share-tour-footer"
                type="button"
                onClick={() => {
                  setPage('share-tour');
                  window.location.hash = '#admin';
                  window.dispatchEvent(new HashChangeEvent('hashchange'));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#203c34] hover:bg-[#315B4F] text-emerald-300 hover:text-emerald-200 text-[11px] font-mono font-semibold rounded-lg border border-[#315B4F] hover:border-[#467b6b] transition-all shadow-xs hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                title="Akses Dashboard Admin Share Tour (/share-tour#admin)"
              >
                <ShieldCheck className="w-3 h-3 text-emerald-300" />
                <span>{t('footer.adminShareTour')}</span>
              </button>

              {/* 3-Minute Auto-Hide Countdown Badge */}
              <div 
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-300/80 text-amber-800 text-[10px] font-mono font-bold rounded-lg shadow-xs"
                title="Akses admin akan tertutup otomatis saat durasi habis (maks. 3 menit)"
              >
                <Timer className="w-3 h-3 text-amber-600 animate-pulse" />
                <span>
                  {Math.floor(timeLeft / 60)}:{timeLeft % 60 < 10 ? '0' : ''}{timeLeft % 60}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* WeChat Info Modal */}
      {isWeChatModalOpen && (
        <div 
          className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md cursor-pointer animate-fade-in"
          onClick={() => setIsWeChatModalOpen(false)}
        >
          <div 
            className="relative w-full max-w-[440px] bg-white rounded-3xl shadow-2xl border border-neutral-150 p-5 space-y-4 animate-scale-up cursor-default"
          >
            {/* Header / Profile Row */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center overflow-hidden border border-neutral-200 shadow-sm p-1">
                  <img 
                    src="/logo.png" 
                    alt="Smart Journey Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-800 text-sm sm:text-base leading-tight">Smart Journey</h3>
                  <p className="text-xs text-neutral-500 font-medium">{t('wechat.title')}</p>
                </div>
              </div>
              
              {/* Highly visible Close Button in the header */}
              <button 
                id="close-wechat-modal-btn"
                onClick={() => setIsWeChatModalOpen(false)}
                className="flex items-center justify-center p-2 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-all border border-neutral-200/50"
                title={t('common.close')}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* QR Code Container (Dynamic, scaled for maximum scanning size) */}
            <div 
              onClick={(e) => e.stopPropagation()}
              className="flex flex-col items-center justify-center bg-neutral-50 rounded-2xl p-2.5 border border-neutral-200/60 relative"
            >
              {!qrImageError ? (
                <div className="relative w-full aspect-[888/1248] max-h-[460px] bg-white p-2 rounded-xl border border-neutral-200/60 shadow-sm flex items-center justify-center overflow-hidden">
                  <img 
                    src={qrSrc} 
                    alt="Smart Journey WeChat QR Code"
                    className="w-full h-full object-contain rounded-lg select-none"
                    onError={() => {
                      if (qrSrc === '/wechat-qr-1.png') {
                        setQrSrc('/wechat-qr.png');
                      } else if (qrSrc === '/wechat-qr.png') {
                        setQrSrc('/images/wechat.png');
                      } else if (qrSrc === '/images/wechat.png') {
                        setQrSrc('/qr.png');
                      } else if (qrSrc === '/qr.png') {
                        setQrSrc('/wechat-qr.jpg');
                      } else {
                        setQrImageError(true);
                      }
                    }}
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-emerald-600 w-full bg-neutral-50 rounded-xl">
                  <QrCode className="h-32 w-32 text-neutral-800 mb-2 animate-pulse" />
                  <span className="text-xs text-neutral-500 text-center px-6 leading-relaxed">
                    Unggah file QR Code Anda ke folder <code className="bg-white px-1.5 py-0.5 rounded border border-neutral-200 text-amber-600 font-mono font-semibold">public</code> dengan nama <code className="bg-white px-1.5 py-0.5 rounded border border-neutral-200 text-amber-600 font-mono font-semibold">wechat-qr.png</code>
                  </span>
                </div>
              )}
            </div>

            {/* Copy ID Block */}
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200/60 space-y-2"
            >
              <div className="text-[10px] uppercase tracking-widest font-semibold text-neutral-400">WeChat ID / Username</div>
              <div className="flex items-center justify-between gap-2 bg-white px-3.5 py-2.5 rounded-xl border border-neutral-200/40 shadow-sm">
                <span className="font-mono text-sm font-bold text-neutral-800">sjtrans</span>
                <button 
                  onClick={handleCopyWeChat}
                  className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 font-semibold transition-colors bg-amber-50 hover:bg-amber-100/80 px-3 py-1.5 rounded-lg border border-amber-200/30"
                >
                  {copiedWeChat ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>{t('wechat.copied')}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>{t('wechat.copyId')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Help / Instructions */}
            <div className="text-xs text-neutral-500 text-center leading-relaxed px-2">
              {t('wechat.instruction')}
            </div>

            {/* Primary Selesai Button */}
            <button 
              onClick={() => setIsWeChatModalOpen(false)}
              className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-2xl text-sm transition-all shadow-md hover:shadow-lg duration-200"
            >
              {t('wechat.done')}
            </button>
          </div>
        </div>
      )}
    </footer>
  );
}
