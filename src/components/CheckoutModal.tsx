import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { X, ShieldCheck, CheckCircle2, Star, Sparkles, User, Mail, Phone, Calendar, ArrowRight, ChevronRight, Fuel, Briefcase, CreditCard, Loader2, Globe } from 'lucide-react';
import { VEHICLES } from '../data';
import { motion, AnimatePresence } from 'motion/react';
import { processArtoPayPayment } from '../lib/artopay';
import { usdToIDR, idrToUSD } from '../utils/pricingUtils';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceType: 'tour' | 'airport' | 'taxi' | 'rental';
  serviceName: string;
  basePriceUSD: number;
  basePriceIDR: number;
  initialDetails: any;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  serviceType,
  serviceName,
  basePriceUSD,
  basePriceIDR,
  initialDetails
}: CheckoutModalProps) {
  const { addBooking, formatPrice, bookings, schedules, serviceLimits } = useApp();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedVehicle, setSelectedVehicle] = useState(VEHICLES[1]); // Innova default
  const [customerName, setCustomerName] = useState('');
  const [englishName, setEnglishName] = useState('');
  const [weChatId, setWeChatId] = useState('');
  const [xiaoHongShuId, setXiaoHongShuId] = useState('');
  const [city, setCity] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [companionNames, setCompanionNames] = useState<string[]>([]);
  const [nationalityType, setNationalityType] = useState<'WNI' | 'WNA_CHINA' | 'WNA_EUROPE'>(() => {
    if (initialDetails?.nationalityType === 'WNA_EUROPE') return 'WNA_EUROPE';
    if (initialDetails?.nationalityType === 'WNA_CHINA') return 'WNA_CHINA';
    if (initialDetails?.nationalityType === 'WNA') return 'WNA_CHINA';
    return 'WNI';
  });
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate pricing upgrades if vehicle is premium or large
  const getVehicleMultiplier = () => {
    if (serviceType === 'tour') return 1.0; // Tour price is pre-set by package tier selection
    if (selectedVehicle.id === 'avanza') return 0.9;
    if (selectedVehicle.id === 'innova') return 1.0;
    if (selectedVehicle.id === 'hiace-commuter') return 1.5;
    if (selectedVehicle.id === 'hiace-premio') return 1.8;
    return 1.0;
  };

  const calculateFinalPrice = () => {
    if (serviceType === 'tour') {
      const guests = initialDetails.guests || 1;
      let unitUSD = basePriceUSD;
      if (initialDetails?.nationalityType) {
        if (nationalityType === 'WNI') {
          unitUSD = initialDetails.nationalityType === 'WNI' ? basePriceUSD : Math.round(basePriceUSD / 1.25);
        } else {
          unitUSD = initialDetails.nationalityType === 'WNI' ? Math.round(basePriceUSD * 1.25) : basePriceUSD;
        }
      }
      const totalUSD = Math.round(unitUSD * guests);
      const totalIDR = basePriceIDR > 0 && initialDetails.nationalityType === nationalityType 
        ? Math.round(basePriceIDR * guests) 
        : usdToIDR(totalUSD);
      return { usd: totalUSD, idr: totalIDR };
    }
    const mult = getVehicleMultiplier();
    const days = initialDetails.days || 1;
    const guests = 1;
    const finalUSD = Math.round(basePriceUSD * mult * days * guests);
    const finalIDR = basePriceIDR > 0 
      ? Math.round(basePriceIDR * mult * days * guests) 
      : usdToIDR(finalUSD);
    return { usd: finalUSD, idr: finalIDR };
  };

  const finalPrice = calculateFinalPrice();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMessage(null);
    setIsSubmitting(true);

    if (serviceType === 'tour' || initialDetails?.tourId) {
      if (!customerName.trim()) {
        setErrorMessage('Harap isi Nama Lengkap / Full Name.');
        setIsSubmitting(false);
        return;
      }
      if (!englishName.trim()) {
        setErrorMessage('Harap isi English Name / Pinyin.');
        setIsSubmitting(false);
        return;
      }
      if (nationalityType === 'WNA_CHINA') {
        if (!weChatId.trim()) {
          setErrorMessage('Harap isi ID WeChat aktif.');
          setIsSubmitting(false);
          return;
        }
        if (!xiaoHongShuId.trim()) {
          setErrorMessage('Harap isi ID XiaoHongShu / RED ID.');
          setIsSubmitting(false);
          return;
        }
      } else {
        if (!customerPhone.trim()) {
          setErrorMessage('Harap isi No. WhatsApp aktif.');
          setIsSubmitting(false);
          return;
        }
      }
      if (!city.trim()) {
        setErrorMessage('Harap isi Kota / Country of Residence.');
        setIsSubmitting(false);
        return;
      }
      if (!customerEmail.trim()) {
        setErrorMessage('Harap isi Email Address.');
        setIsSubmitting(false);
        return;
      }
    } else {
      if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
        setErrorMessage('Harap isi Nama Lengkap, Email, dan No. WhatsApp.');
        setIsSubmitting(false);
        return;
      }
    }

    const targetDate = initialDetails?.date;
    // Private Trips (serviceType === 'tour') are free from calendar batch/availability restrictions
    if (targetDate && serviceType !== 'tour') {
      const isBlocked = (schedules || []).some(s => s.date === targetDate && s.type === 'blocked');
      const confirmedCount = (bookings || []).filter(b => 
        b.details && 
        b.details.date === targetDate && 
        b.type === serviceType &&
        (b.status === 'Confirmed' || b.status === 'Completed')
      ).length;
      
      if (isBlocked) {
        setErrorMessage('Maaf, tanggal ini telah ditutup oleh pihak operasional (Blackout Date). Silakan pilih tanggal lain.');
        setIsSubmitting(false);
        return;
      }
      const limit = serviceLimits[serviceType] ?? 3;
      if (confirmedCount >= limit) {
        setErrorMessage(`Maaf, kuota pemesanan harian (${limit} slot) untuk layanan ini pada tanggal ini telah penuh. Silakan pilih tanggal lain.`);
        setIsSubmitting(false);
        return;
      }
    }

    const bookingPayload = {
      type: serviceType,
      serviceName,
      details: {
        ...initialDetails,
        nationalityType,
        fullName: customerName.trim(),
        englishName: englishName.trim(),
        weChatId: nationalityType === 'WNA_CHINA' ? weChatId.trim() : '',
        xiaoHongShuId: nationalityType === 'WNA_CHINA' ? xiaoHongShuId.trim() : '',
        city: city.trim(),
        whatsapp: customerPhone.trim(),
        flightNumber: flightNumber ? flightNumber.toUpperCase().trim() : '',
        companionNames: companionNames.filter(n => n.trim() !== ''),
        vehicleId: selectedVehicle?.id,
        vehicleName: selectedVehicle?.name,
      },
      totalPrice: finalPrice.usd,
      totalPriceIDR: finalPrice.idr,
      customerName: customerName.trim(),
      customerEmail: customerEmail.toLowerCase().trim(),
      customerPhone: customerPhone.trim(),
    };

    try {
      const newBooking = addBooking(bookingPayload);
      setConfirmedBooking(newBooking);

      // Trigger ArtoPay Payment Gateway
      try {
        await processArtoPayPayment({
          orderId: newBooking.id,
          amount: finalPrice.idr,
          currency: 'IDR',
          description: serviceName,
          customerName: customerName.trim(),
          customerEmail: customerEmail.toLowerCase().trim(),
          customerPhone: customerPhone.trim(),
          onSuccess: (res) => {
            console.log('ArtoPay Payment Completed Event:', res);
            setIsSubmitting(false);
            onClose();
            window.location.hash = '#/bookings';
          },
          onPending: (res) => {
            console.log('ArtoPay Payment Pending Event:', res);
            setIsSubmitting(false);
            onClose();
            window.location.hash = '#/bookings';
          },
          onError: (err) => {
            console.error('ArtoPay Payment Error:', err);
            setIsSubmitting(false);
            setErrorMessage(err.message || 'Gagal menghubungkan ke ArtoPay Gateway. Silakan coba lagi.');
          }
        });
      } catch (payErr: any) {
        console.error('ArtoPay checkout trigger error:', payErr);
        setIsSubmitting(false);
        setErrorMessage(payErr.message || 'Gagal memproses pembayaran via ArtoPay Gateway.');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Terjadi kesalahan saat memproses reservasi Anda.');
    }
  };

  // Close modal on Escape key press
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-start sm:items-center justify-center p-4 sm:p-6 md:p-10"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 cursor-default" onClick={onClose} aria-hidden="true" />

      {/* Main Container */}
      <div className="relative bg-[#203c34] border border-[#315B4F] rounded-2xl sm:rounded-3xl w-full max-w-2xl shadow-2xl z-10 flex flex-col my-auto text-white max-h-[90vh] sm:max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#315B4F] flex items-center justify-between bg-[#182e28] shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-400">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h3 id="checkout-modal-title" className="text-base sm:text-lg font-bold text-white tracking-tight">Secure Private Reservation</h3>
              <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono">Premium Travel Standard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Reservation Modal / Tutup Modal Reservasi"
            className="text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Content Stages */}
        <div className="p-4 sm:p-6 md:p-8 grow overflow-y-auto">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-6"
              >
                {/* Summary & Vehicle Selection (Col 7) */}
                <form onSubmit={handleSubmit} className="md:col-span-12 space-y-6">
                  
                  {/* Service Card */}
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[9px] font-bold text-amber-400 font-mono uppercase tracking-widest bg-amber-500/10 px-2.5 py-1 rounded-full">
                        {serviceType}
                      </span>
                      <h4 className="text-base font-bold text-white mt-2 leading-tight">{serviceName}</h4>
                      <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1.5 flex-wrap">
                        <Calendar className="h-3.5 w-3.5 text-amber-500" />
                        <span>Date: {initialDetails.date} {initialDetails.time ? `at ${initialDetails.time}` : ''}</span>
                        {initialDetails.guests && <span>· {initialDetails.guests} Guests</span>}
                        {initialDetails.luggage !== undefined && <span>· {initialDetails.luggage} Bags</span>}
                        {initialDetails.days && <span>· {initialDetails.days} Days</span>}
                      </p>
                      {initialDetails.cityAddress && (
                        <p className="text-[11px] text-neutral-300 mt-2 bg-white/5 p-2.5 rounded-xl border border-white/5 font-mono">
                          <strong className="text-amber-500">📍 Detail Alamat:</strong> {initialDetails.cityAddress}
                        </p>
                      )}
                      {initialDetails.routeType === 'Round Trip' && (
                        <p className="text-[11px] text-amber-400 mt-2 bg-amber-500/5 p-2.5 rounded-xl border border-amber-500/10 font-mono">
                          🔄 <strong>Jadwal Kepulangan:</strong> {initialDetails.returnDateText} {initialDetails.returnTimeText ? `at ${initialDetails.returnTimeText}` : ''} {initialDetails.returnFlightNumber ? `(${initialDetails.returnFlightNumber})` : ''}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-neutral-400 font-mono">ESTIMATED FARE</div>
                      <div className="text-2xl font-black text-amber-400">
                        {formatPrice(finalPrice.usd, finalPrice.idr)}
                      </div>
                      <div className="text-[10px] text-neutral-500">All-Inclusive Fixed Pricing</div>
                    </div>
                  </div>

                  {/* Vehicle Upgrades or Package Tier Benefits */}
                  {serviceType === 'tour' && initialDetails.packageTier ? (
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
                        <div>
                          <h5 className="text-sm font-black text-amber-500 font-mono tracking-wider uppercase">
                            {initialDetails.packageTier}
                          </h5>
                          <p className="text-[10px] text-neutral-400">Pilihan paket wisata premium terkurasi</p>
                        </div>
                      </div>
                      <p className="text-xs text-neutral-300 leading-relaxed italic">
                        "Fasilitas lengkap, transportasi privat sesuai tier, konsumsi, tiket masuk fast-track, dan pemandu lokal berlisensi sudah termasuk."
                      </p>
                      <div className="pt-2 border-t border-white/5 grid grid-cols-2 gap-2 text-[11px] text-neutral-400">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" />
                          Tiket Masuk & Retribusi
                        </span>
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" />
                          Layanan Chauffeur AC
                        </span>
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" />
                          Guide Lokal Berlisensi
                        </span>
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" />
                          Snack & Air Mineral
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider pl-1 block">
                        Choose Private Vehicle Class
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {VEHICLES.map((car) => {
                          const isSelected = selectedVehicle.id === car.id;
                          return (
                            <div
                              key={car.id}
                              onClick={() => setSelectedVehicle(car)}
                              className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                                isSelected
                                  ? 'bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/5'
                                  : 'bg-white/5 border-white/5 hover:border-white/15'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <h5 className="font-bold text-sm text-white">{car.name}</h5>
                                  <p className="text-[10px] text-neutral-400">{car.category} MPV/Van</p>
                                </div>
                                <span className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                                  isSelected ? 'border-amber-400 bg-amber-500 text-neutral-950' : 'border-neutral-600'
                                }`}>
                                  {isSelected && <span className="h-2 w-2 rounded-full bg-neutral-950" />}
                                </span>
                              </div>

                              {/* Capacity details */}
                              <div className="flex items-center space-x-3 text-neutral-400 text-xs mt-3.5">
                                <span className="flex items-center space-x-1">
                                  <User className="h-3.5 w-3.5 text-amber-500" />
                                  <span>{car.passengers} Pax</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Briefcase className="h-3.5 w-3.5 text-amber-500" />
                                  <span>{car.luggage} Bags</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Fuel className="h-3.5 w-3.5 text-amber-500" />
                                  <span>A/C</span>
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Nationality Category Selector for Tour */}
                  {serviceType === 'tour' && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-amber-400 uppercase tracking-wider pl-1 block">
                        Kategori Tamu / Guest Category
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setNationalityType('WNI')}
                          className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            nationalityType === 'WNI'
                              ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm'
                              : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                          }`}
                        >
                          <span className="text-sm">🇮🇩</span>
                          <span>Domestic</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setNationalityType('WNA_CHINA')}
                          className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            nationalityType === 'WNA_CHINA'
                              ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm'
                              : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                          }`}
                        >
                          <span className="text-sm">🇨🇳</span>
                          <span>Foreigner (China)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setNationalityType('WNA_EUROPE')}
                          className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            nationalityType === 'WNA_EUROPE'
                              ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm'
                              : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                          }`}
                        >
                          <Globe className="w-3.5 h-3.5 text-blue-400" />
                          <span>Foreigner (International)</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Customer Information Form */}
                  <div className="space-y-4 pt-2">
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider pl-1 block">
                      {serviceType === 'tour' ? 'Data Registrasi Profil Peserta Utama' : 'Lead Passenger Contact Information'}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* 1. Nama Lengkap */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-neutral-300 block">
                          1. Nama Lengkap <span className="text-rose-400">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-500" />
                          <input
                            type="text"
                            required
                            placeholder={nationalityType === 'WNA_CHINA' ? "Hanzi / Sesuai paspor (e.g. 陈智华)" : "Sesuai KTP / Paspor"}
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-base sm:text-sm text-white w-full focus:outline-none focus:border-amber-500 placeholder-neutral-500 min-h-[44px]"
                          />
                        </div>
                      </div>

                      {/* 2. English Name */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-neutral-300 block">
                          2. English Name <span className="text-rose-400">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-500" />
                          <input
                            type="text"
                            required
                            placeholder={nationalityType === 'WNA_CHINA' ? "Pinyin (e.g. CHEN ZHIHUA)" : "Passport Name (e.g. TONY TAN)"}
                            value={englishName}
                            onChange={(e) => setEnglishName(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-base sm:text-sm text-white w-full focus:outline-none focus:border-amber-500 placeholder-neutral-500 min-h-[44px]"
                          />
                        </div>
                      </div>

                      {/* FIELDS SPECIFIC TO CHINA DARATAN */}
                      {nationalityType === 'WNA_CHINA' && (
                        <>
                          {/* WeChat ID */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-neutral-300 block">
                              3. WeChat ID <span className="text-rose-400">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="ID WeChat Aktif (e.g. tony_wx)"
                              value={weChatId}
                              onChange={(e) => setWeChatId(e.target.value)}
                              className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-base sm:text-sm text-white w-full focus:outline-none focus:border-amber-500 placeholder-neutral-500 min-h-[44px]"
                            />
                          </div>

                          {/* XiaoHongShu ID */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-neutral-300 block">
                              4. XiaoHongShu ID (Red ID) <span className="text-rose-400">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="ID XiaoHongShu (e.g. user_red)"
                              value={xiaoHongShuId}
                              onChange={(e) => setXiaoHongShuId(e.target.value)}
                              className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-base sm:text-sm text-white w-full focus:outline-none focus:border-amber-500 placeholder-neutral-500 min-h-[44px]"
                            />
                          </div>
                        </>
                      )}

                      {/* City / Country */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-neutral-300 block">
                          {nationalityType === 'WNA_CHINA' ? '5. ' : '3. '}
                          {nationalityType === 'WNA_EUROPE' ? 'City & Country of Residence' : 'Kota Tinggal Saat Ini'} <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder={nationalityType === 'WNA_EUROPE' ? "e.g. Paris, France" : "e.g. Shanghai / Jakarta"}
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-base sm:text-sm text-white w-full focus:outline-none focus:border-amber-500 placeholder-neutral-500 min-h-[44px]"
                        />
                      </div>

                      {/* WhatsApp */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-neutral-300 block">
                          {nationalityType === 'WNA_CHINA' ? '6. ' : '4. '}
                          No. WhatsApp {nationalityType === 'WNA_CHINA' ? <span className="text-neutral-500 font-normal">(Opsional)</span> : <span className="text-rose-400">*</span>}
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-500" />
                          <input
                            type="tel"
                            required={nationalityType !== 'WNA_CHINA'}
                            placeholder="e.g. +62 812-3456-7890 / +33 6 12 34 56 78"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-base sm:text-sm text-white w-full focus:outline-none focus:border-amber-500 placeholder-neutral-500 min-h-[44px]"
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-neutral-300 block">
                          {nationalityType === 'WNA_CHINA' ? '7. ' : '5. '}
                          Email Address <span className="text-rose-400">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-500" />
                          <input
                            type="email"
                            required
                            placeholder="traveller@example.com"
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-base sm:text-sm text-white w-full focus:outline-none focus:border-amber-500 placeholder-neutral-500 min-h-[44px]"
                          />
                        </div>
                      </div>

                      {/* Flight Number */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-neutral-300 block">
                          {nationalityType === 'WNA_CHINA' ? '8. ' : '6. '}
                          No. Penerbangan <span className="text-neutral-500 font-normal">(Opsional)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. GA 312 / SQ 922"
                          value={flightNumber}
                          onChange={(e) => setFlightNumber(e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-base sm:text-sm text-white w-full focus:outline-none focus:border-amber-500 placeholder-neutral-500 min-h-[44px]"
                        />
                      </div>
                    </div>

                    {/* Companion list if guests > 1 */}
                    {initialDetails?.guests && initialDetails.guests > 1 && (
                      <div className="space-y-3 pt-3 border-t border-white/5">
                        <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                          Daftar Nama Peserta Tambahan ({initialDetails.guests - 1} Orang)
                        </label>
                        <div className="space-y-2">
                          {Array.from({ length: initialDetails.guests - 1 }).map((_, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="text-xs text-neutral-400 font-mono w-20 shrink-0">Peserta #{idx + 2}:</span>
                              <input
                                type="text"
                                placeholder={`Nama Lengkap Peserta #${idx + 2}`}
                                value={companionNames[idx] || ''}
                                onChange={(e) => {
                                  const next = [...companionNames];
                                  next[idx] = e.target.value;
                                  setCompanionNames(next);
                                }}
                                className="bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white w-full focus:outline-none focus:border-amber-500 placeholder-neutral-500"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {errorMessage && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-200 text-xs rounded-2xl p-4 flex items-start gap-2.5 animate-fade-in">
                      <div className="p-0.5 rounded-full bg-red-500/10 text-red-500 shrink-0">
                        <X className="h-4 w-4" />
                      </div>
                      <p className="font-semibold leading-tight">{errorMessage}</p>
                    </div>
                  )}

                  {/* Submission segment */}
                  <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <p className="text-[11px] text-neutral-400 leading-relaxed max-w-sm">
                      Dengan melanjutkan, pesanan Anda akan diproses dan diteruskan ke gerbang pembayaran aman <strong className="text-[#D6B16D]">ArtoPay Payment Gateway</strong> (QRIS, Transfer Bank, e-Wallet, Kartu Kredit).
                    </p>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`bg-[#315B4F] hover:bg-[#203c34] text-white font-display font-bold px-6 py-3.5 rounded-2xl flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer border border-[#467b6b] ${
                        isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4.5 w-4.5 text-[#D6B16D] animate-spin" />
                          <span>Menyiapkan Pembayaran ArtoPay...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4.5 w-4.5 text-[#D6B16D]" />
                          <span>Bayar via ArtoPay Gateway</span>
                          <ArrowRight className="h-4 w-4 text-white" />
                        </>
                      )}
                    </button>
                  </div>

                </form>
              </motion.div>
            ) : (
              /* Step 2: Confirmation Success */
              <motion.div
                key="step2"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 space-y-6"
              >
                <div className="inline-flex items-center justify-center bg-emerald-500/15 text-emerald-400 p-5 rounded-full relative">
                  <CheckCircle2 className="h-12 w-12" />
                  <Sparkles className="absolute top-1.5 right-1.5 h-5 w-5 text-amber-400 animate-pulse" />
                </div>

                <div className="space-y-2">
                  <h4 className="text-2xl font-black text-white">Booking Confirmed!</h4>
                  <p className="text-sm text-neutral-400">
                    Your luxury ride is secured. A confirmation is dispatched to <span className="text-white font-medium">{customerEmail}</span> and WhatsApp.
                  </p>
                </div>

                {/* Digital Ticket display */}
                <div className="bg-[#182e28] border border-[#315B4F] rounded-2xl p-6 text-left max-w-md mx-auto relative overflow-hidden">
                  {/* Decorative Ticket Cuts */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-[#203c34] rounded-r-full border-r border-[#315B4F]" />
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-[#203c34] rounded-l-full border-l border-[#315B4F]" />
                  
                  <div className="flex justify-between items-start border-b border-white/5 pb-4 mb-4">
                    <div>
                      <span className="text-[10px] text-amber-400 font-mono tracking-widest uppercase">SmartJourney Reservation</span>
                      <h5 className="font-bold text-sm text-white mt-1">{serviceName}</h5>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-neutral-500 font-mono block">RESERVATION ID</span>
                      <span className="text-xs font-mono font-bold text-white">{confirmedBooking?.id}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-3 text-xs mb-4">
                    <div>
                      <span className="text-neutral-500 block">Lead Passenger</span>
                      <span className="text-white font-medium">{customerName}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">WhatsApp Contact</span>
                      <span className="text-white font-medium">{customerPhone}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Departure Date</span>
                      <span className="text-white font-medium">{initialDetails.date} {initialDetails.time ? `at ${initialDetails.time}` : ''}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">
                        {serviceType === 'tour' ? 'Package Option' : 'Vehicle Class'}
                      </span>
                      <span className="text-white font-medium">
                        {serviceType === 'tour' && initialDetails.packageTier 
                          ? initialDetails.packageTier 
                          : selectedVehicle.name}
                      </span>
                    </div>
                    {initialDetails.cityAddress && (
                      <div className="col-span-2">
                        <span className="text-neutral-500 block">📍 Detail Alamat Kota</span>
                        <span className="text-white font-medium font-mono">{initialDetails.cityAddress}</span>
                      </div>
                    )}
                    {initialDetails.routeType === 'Round Trip' && (
                      <div className="col-span-2 bg-amber-500/5 p-2 rounded-lg border border-amber-500/10 text-[11px]">
                        <span className="text-amber-500 font-bold block">🔄 Jadwal Kepulangan (Return Trip)</span>
                        <span className="text-neutral-200 font-medium font-mono">
                          {initialDetails.returnDateText} {initialDetails.returnTimeText ? `at ${initialDetails.returnTimeText}` : ''} {initialDetails.returnFlightNumber ? `(${initialDetails.returnFlightNumber})` : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="bg-white/5 p-3 rounded-xl flex items-center justify-between text-xs">
                    <span className="text-neutral-400">Total Price Paid (On-Site)</span>
                    <span className="font-mono font-black text-amber-400">
                      {formatPrice(finalPrice.usd, finalPrice.idr)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-center space-x-4 pt-4">
                  <button
                    onClick={() => {
                      onClose();
                      // Set page to bookings via click
                      window.location.hash = '#/bookings';
                    }}
                    className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all"
                  >
                    Manage Reservation Itinerary
                  </button>
                  <button
                    onClick={onClose}
                    className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-6 py-3 rounded-xl text-sm shadow-lg shadow-amber-500/10 transition-all"
                  >
                    Done
                  </button>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
