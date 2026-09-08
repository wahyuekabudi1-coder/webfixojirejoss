import React, { useState, useMemo } from "react";
import { Trip, Batch, Booking } from "../types";
import { 
  ChevronLeft, Sparkles, ShieldCheck, Send, MapPin, Clock, Globe, Lock, Check,
  ArrowRight, CheckCircle2, User, Phone, Mail, Compass
} from "lucide-react";
import { createBooking } from "../api";
import { useLanguageCurrency } from "../LanguageCurrencyContext";
import { processArtoPayPayment } from "../../lib/artopay";
import { 
  calculatePrivateTourPricing, 
  calculateShareTourPricing, 
  formatCurrencyAmount 
} from "../../utils/pricingUtils";

interface BookingFormProps {
  trip: Trip;
  batch?: Batch | null;
  bookingType?: 'private' | 'shared';
  tourBookingType?: 'private' | 'shared';
  departureDate?: string;
  initialParticipants?: number;
  initialUnitPrice?: number;
  initialUnitPriceUSD?: number;
  initialUnitPriceIDR?: number;
  surchargeMultiplier?: number;
  nationalityType?: 'WNI' | 'WNA' | 'WNA_CHINA' | 'WNA_EUROPE' | null;
  onBack: () => void;
  onSuccess: (booking: Booking) => void;
}

export default function BookingForm({
  trip,
  batch,
  bookingType = 'shared',
  tourBookingType,
  departureDate,
  initialParticipants = 1,
  initialUnitPrice,
  initialUnitPriceUSD,
  initialUnitPriceIDR,
  surchargeMultiplier = 1.0,
  nationalityType = 'WNI',
  onBack,
  onSuccess
}: BookingFormProps) {
  const { t, formatPrice, currency, language } = useLanguageCurrency();

  const isPrivate = (bookingType === 'private' || tourBookingType === 'private' || !batch);
  const selectedDepartureDate = isPrivate 
    ? (departureDate || (batch ? batch.departureDate : new Date().toISOString().split('T')[0]))
    : (batch ? batch.departureDate : (departureDate || new Date().toISOString().split('T')[0]));

  // Initial nationality category state
  const initialCategory = (): 'WNI' | 'WNA_CHINA' | 'WNA_EUROPE' => {
    if (nationalityType === 'WNA_EUROPE') return 'WNA_EUROPE';
    if (nationalityType === 'WNA_CHINA') return 'WNA_CHINA';
    if (nationalityType === 'WNA') return 'WNA_CHINA';
    return 'WNI';
  };

  const [currentNationality, setCurrentNationality] = useState<'WNI' | 'WNA_CHINA' | 'WNA_EUROPE'>(initialCategory);

  // Form input fields
  const [name, setName] = useState(""); // 1. Nama Lengkap (Hanzi / sesuai paspor)
  const [englishName, setEnglishName] = useState(""); // 2. Nama Inggris (Pinyin / Sesuai paspor)
  const [weChatId, setWeChatId] = useState(""); // 3. ID WeChat (khusus China)
  const [xiaoHongShuId, setXiaoHongShuId] = useState(""); // 4. ID XiaoHongShu / Red ID (khusus China)
  const [city, setCity] = useState(""); // Kota Tinggal / Country
  const [whatsapp, setWhatsapp] = useState(""); // No WhatsApp (Aktif)
  const [email, setEmail] = useState(""); // Email
  const [flightNumber, setFlightNumber] = useState(""); // No Penerbangan
  const [pickupLocation, setPickupLocation] = useState(""); // Lokasi Penjemputan
  const [specialRequests, setSpecialRequests] = useState(""); // Catatan Khusus

  // Participants Counter
  const maxSeatsAllowed = isPrivate ? 25 : (batch ? Math.min(12, batch.availableSeats) : 12);
  const [numParticipants, setNumParticipants] = useState(() => Math.max(1, Math.min(initialParticipants, maxSeatsAllowed)));
  const [companionNames, setCompanionNames] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    if (language === "zh") {
      const d = new Date(dateStr);
      return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    }
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  // Adjust companion arrays dynamically
  const handleParticipantsChange = (val: number) => {
    const count = Math.max(1, Math.min(val, maxSeatsAllowed));
    setNumParticipants(count);
    
    const companionsDiff = count - 1;
    if (companionsDiff > companionNames.length) {
      const added = Array(companionsDiff - companionNames.length).fill("");
      setCompanionNames([...companionNames, ...added]);
    } else if (companionsDiff < companionNames.length) {
      setCompanionNames(companionNames.slice(0, companionsDiff));
    }
  };

  const handleCompanionNameChange = (index: number, val: string) => {
    const updated = [...companionNames];
    updated[index] = val;
    setCompanionNames(updated);
  };

  // Unified Single Source of Truth Price Calculation
  const pricingBreakdown = useMemo(() => {
    if (isPrivate) {
      return calculatePrivateTourPricing(
        {
          startingPrice: initialUnitPriceUSD || trip.startingPrice || trip.price || 135,
          startingPriceIDR: initialUnitPriceIDR || trip.startingPriceIDR || trip.wniPrice,
          wnaPrice: initialUnitPriceUSD || trip.wnaPrice || trip.wnaStartingPrice,
          wniPrice: initialUnitPriceIDR || trip.wniPrice || trip.startingPriceIDR
        },
        currentNationality,
        numParticipants,
        surchargeMultiplier || 1.0
      );
    } else {
      return calculateShareTourPricing(
        trip,
        batch,
        currentNationality,
        numParticipants
      );
    }
  }, [isPrivate, trip, batch, currentNationality, numParticipants, initialUnitPriceUSD, initialUnitPriceIDR, surchargeMultiplier]);

  const unitPriceFormatted = formatCurrencyAmount(pricingBreakdown.unitPriceUSD, currency);
  const totalPriceFormatted = formatCurrencyAmount(pricingBreakdown.totalPriceUSD, currency);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Field validation depending on WNA category
    if (currentNationality === 'WNA_CHINA') {
      if (!name || !englishName || !email || !city || !weChatId || !xiaoHongShuId) {
        setErrorMsg(t("Harap lengkapi semua data wajib WNA China Daratan (Nama Lengkap, English Name, ID WeChat, ID XiaoHongShu, Kota Tinggal, dan Email)."));
        return;
      }
    } else if (currentNationality === 'WNA_EUROPE') {
      if (!name || !englishName || !email || !city || !whatsapp) {
        setErrorMsg(t("Harap lengkapi semua data wajib WNA Eropa & Internasional (Full Name, English Name, No. WhatsApp, Kota/Negara, dan Email)."));
        return;
      }
    } else {
      // WNI
      if (!name || !englishName || !email || !city || !whatsapp) {
        setErrorMsg(t("Harap lengkapi semua data wajib (Nama Lengkap, English Name, No. WhatsApp, Kota Tinggal, dan Email)."));
        return;
      }
    }

    if (!pickupLocation.trim()) {
      setErrorMsg(t("Harap isi lokasi penjemputan (Nama Hotel / Alamat / Stasiun / Bandara)."));
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const participantsList = [name];
    companionNames.forEach((n) => {
      if (n.trim()) participantsList.push(n.trim());
    });

    try {
      const payload: any = {
        tripId: trip.id,
        ...(isPrivate ? {} : { batchId: batch?.id }),
        bookingType: isPrivate ? 'private' : 'shared',
        tourBookingType: isPrivate ? 'private' : 'shared',
        departureDate: selectedDepartureDate,
        fullName: name.trim(),
        customerName: name.trim(),
        email: email.toLowerCase().trim(),
        customerEmail: email.toLowerCase().trim(),
        phone: whatsapp.trim(),
        customerPhone: whatsapp.trim(),
        participantsCount: numParticipants,
        participantsNames: participantsList,
        proofOfPayment: "OJIRE_GATEWAY",
        status: "Pending",
        paymentStatus: "Pending Payment",
        totalPrice: pricingBreakdown.totalPriceUSD,
        totalPriceIDR: pricingBreakdown.totalPriceIDR,
        nationalityType: currentNationality,
        pickupLocation: pickupLocation.trim(),
        specialRequests: specialRequests.trim(),
        paymentMethod: "OJIRE_GATEWAY",
        participantData: {
          name: name.trim(),
          englishName: englishName.trim(),
          weChatId: currentNationality === 'WNA_CHINA' ? weChatId.trim() : "",
          xiaoHongShuId: currentNationality === 'WNA_CHINA' ? xiaoHongShuId.trim() : "",
          city: city.trim(),
          whatsapp: whatsapp.trim(),
          email: email.toLowerCase().trim(),
          flightNumber: flightNumber ? flightNumber.toUpperCase().trim() : "",
          pickupLocation: pickupLocation.trim(),
          specialRequests: specialRequests.trim(),
          paymentMethod: "OJIRE_GATEWAY",
          nationalityType: currentNationality
        },
        adminNotes: ""
      };

      const result = await createBooking(payload);

      // Trigger OJIRE Payment Gateway directly with exact IDR amount
      try {
        await processArtoPayPayment({
          orderId: result.bookingCode || result.id,
          amount: pricingBreakdown.paymentAmountIDR,
          currency: 'IDR',
          description: isPrivate 
            ? `Private Tour: ${trip.title} (${selectedDepartureDate}, ${numParticipants} Pax)` 
            : `Open Trip: ${trip.title} (${selectedDepartureDate}, ${numParticipants} Pax)`,
          customerName: name.trim(),
          customerEmail: email.toLowerCase().trim(),
          customerPhone: whatsapp.trim(),
          metadata: {
            bookingId: result.id,
            bookingCode: result.bookingCode,
            tourId: trip.id,
            tourName: trip.title,
            travelDate: selectedDepartureDate,
            nationality: currentNationality,
            pax: numParticipants,
            amountUSD: pricingBreakdown.totalPriceUSD,
            amountIDR: pricingBreakdown.totalPriceIDR,
            amount: pricingBreakdown.paymentAmountIDR,
            currency: 'IDR',
            pickupLocation: pickupLocation.trim(),
            specialRequests: specialRequests.trim()
          },
          onSuccess: (payRes) => {
            console.log("OJIRE Payment Completed:", payRes);
            onSuccess(result);
          },
          onPending: (payRes) => {
            console.log("OJIRE Payment Pending:", payRes);
            onSuccess(result);
          },
          onError: (payErr) => {
            console.error("OJIRE Payment Gateway Error:", payErr);
            setErrorMsg(payErr.message || t("Gagal menghubungkan ke Payment Gateway OJIRE. Silakan coba kembali atau periksa koneksi internet."));
          }
        });
      } catch (payError: any) {
        console.error("OJIRE checkout trigger exception:", payError);
        setErrorMsg(payError.message || t("Gagal memproses transaksi Payment Gateway OJIRE."));
      }
    } catch (e: any) {
      setErrorMsg(e.message || t("Failed to submit booking registration. Please verify connection and try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 animate-fade-in" id="booking-registration-module">
      {/* Safe Back Navigation: Returns to Tour Detail without losing selected state */}
      <div className="flex items-center justify-between">
        <button
          id="btn-back-to-tour-detail"
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-gray-700 hover:text-[#315B4F] text-xs sm:text-sm font-bold transition-all cursor-pointer bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-2xs hover:shadow-xs group"
        >
          <ChevronLeft className="w-4 h-4 text-[#315B4F] group-hover:-translate-x-0.5 transition-transform" />
          <span>{isPrivate ? "← Kembali ke Detail Tour" : t("Cancel & Back to Trip Details")}</span>
        </button>

        <span className="text-[11px] font-mono text-gray-500 hidden sm:inline-flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Checkout Terenkripsi 256-bit</span>
        </span>
      </div>

      {/* Grid: Left column is BOOKING SUMMARY, Right is CUSTOMER INFORMATION & PAYMENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: BOOKING SUMMARY */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-5">
            <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#315B4F] font-mono tracking-widest uppercase font-bold block">
                  {isPrivate ? "PRIVATE TOUR CHECKOUT" : t("Trip Registration")}
                </span>
                <h2 className="text-base font-display font-black text-gray-900 tracking-wide">
                  BOOKING SUMMARY
                </h2>
              </div>
              <span className="text-[10px] bg-emerald-50 text-[#315B4F] border border-emerald-200 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
                {isPrivate ? "Private Tour" : "Open Trip"}
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-mono block">Tour</span>
                <span className="font-bold text-gray-900 text-sm block leading-snug">{trip.title}</span>
                <span className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-[#315B4F] shrink-0" />
                  <span>{trip.location}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-mono block">Date</span>
                  <span className="font-bold text-gray-800">{formatDate(selectedDepartureDate)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-mono block">Duration</span>
                  <span className="font-bold text-gray-800">{trip.duration}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <span className="text-[10px] text-gray-400 uppercase font-mono block">Guest Category</span>
                <span className="font-bold text-[#315B4F] text-xs">
                  {currentNationality === 'WNI' 
                    ? "🇮🇩 Domestic" 
                    : currentNationality === 'WNA_CHINA' 
                      ? "🇨🇳 Foreigner (China)" 
                      : "🌐 Foreigner (International)"
                  }
                </span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-mono block">Guests</span>
                  <span className="font-bold text-gray-800">{numParticipants} Pax</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 uppercase font-mono block">Tarif / Orang</span>
                  <span className="font-bold text-gray-800">{unitPriceFormatted}</span>
                </div>
              </div>

              {/* Highlighted Total Box */}
              <div className="bg-[#315B4F]/5 p-4 rounded-2xl border border-[#315B4F]/20 flex justify-between items-end mt-2">
                <div>
                  <span className="text-[10px] uppercase text-[#315B4F] font-black font-mono tracking-wider block">
                    TOTAL HARGA
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium">Sudah termasuk pajak &amp; tiket</span>
                </div>
                <span className="font-display font-black text-xl text-[#315B4F]">
                  {totalPriceFormatted}
                </span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="bg-gray-50 rounded-2xl p-4 text-[11px] text-gray-600 space-y-2.5 border border-gray-100">
              <div className="flex items-center gap-2 font-bold text-gray-800">
                <ShieldCheck className="w-4 h-4 text-[#315B4F]" />
                <span>Jaminan Transaksi &amp; Reservasi</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-gray-500">
                <li className="flex items-center gap-1.5 text-emerald-700 font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Konfirmasi instan &amp; e-voucher digital</span>
                </li>
                <li className="flex items-center gap-1.5 text-emerald-700 font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Bebas biaya tersembunyi</span>
                </li>
                <li className="flex items-center gap-1.5 text-emerald-700 font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Penjemputan tepat waktu garansi Smart Journey</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Participant Form Input */}
        <div className="lg:col-span-2">
          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-md space-y-8 relative">
            <div className="border-b border-gray-100 pb-4 space-y-1">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-display font-extrabold text-gray-900">
                  {t("Traveler Profile Registration")}
                </h2>
                <span className="text-xs font-mono font-bold text-[#315B4F] bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  {currentNationality === 'WNI' 
                    ? "🇮🇩 Domestic" 
                    : currentNationality === 'WNA_CHINA' 
                      ? "🇨🇳 Foreigner (China)" 
                      : "🌐 Foreigner (International)"
                  }
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {currentNationality === 'WNA_CHINA'
                  ? "Form registrasi wisatawan China Daratan (memerlukan ID WeChat & ID XiaoHongShu)."
                  : currentNationality === 'WNA_EUROPE'
                    ? "Form registrasi wisatawan Eropa & Non-China (memerlukan Nama Paspor & WhatsApp)."
                    : "Form registrasi wisatawan domestik Indonesia."
                }
              </p>
            </div>

            {errorMsg && (
              <div className="bg-rose-50 text-rose-800 p-4 rounded-xl text-xs border border-rose-100 flex items-start space-x-2.5">
                <span className="font-bold">{t("Error")}:</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Traveler inputs dynamically adjusted per category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Field 1: Nama Lengkap */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">
                  1. {t("Nama Lengkap")} <span className="text-rose-500">*</span>
                  <span className="text-[10px] text-gray-400 font-normal block">
                    {currentNationality === 'WNA_CHINA' ? "Hanzi atau sesuai paspor (e.g. 陈智华 / Tony Tan)" : "Sesuai KTP / Paspor (Full Name)"}
                  </span>
                </label>
                <input
                  id="book-fullName"
                  type="text"
                  required
                  placeholder={t("Nama Lengkap / Full Name")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#315B4F]/50 focus:border-[#315B4F]"
                />
              </div>

              {/* Field 2: English Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">
                  2. {t("English Name")} <span className="text-rose-500">*</span>
                  <span className="text-[10px] text-gray-400 font-normal block">
                    {currentNationality === 'WNA_CHINA' ? "Pinyin / Sesuai paspor (e.g. CHEN ZHIHUA)" : "English Name in Passport (e.g. TONY TAN)"}
                  </span>
                </label>
                <input
                  id="book-englishName"
                  type="text"
                  required
                  placeholder={t("English Name / Pinyin")}
                  value={englishName}
                  onChange={(e) => setEnglishName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#315B4F]/50 focus:border-[#315B4F]"
                />
              </div>

              {/* FIELDS FOR CHINA DARATAN ONLY */}
              {currentNationality === 'WNA_CHINA' && (
                <>
                  {/* Field 3: ID WeChat */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 block">
                      3. {t("WeChat ID")} <span className="text-rose-500">*</span>
                      <span className="text-[10px] text-gray-400 font-normal block">{t("ID WeChat Aktif (e.g. tony_wx)")}</span>
                    </label>
                    <input
                      id="book-weChatId"
                      type="text"
                      required
                      placeholder={t("ID WeChat (Wajib)")}
                      value={weChatId}
                      onChange={(e) => setWeChatId(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#315B4F]/50 focus:border-[#315B4F]"
                    />
                  </div>

                  {/* Field 4: ID XiaoHongShu */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 block">
                      4. {t("XiaoHongShu ID (Red ID)")} <span className="text-rose-500">*</span>
                      <span className="text-[10px] text-gray-400 font-normal block">{t("ID XiaoHongShu / Red ID (e.g. user_red)")}</span>
                    </label>
                    <input
                      id="book-redId"
                      type="text"
                      required
                      placeholder={t("ID XiaoHongShu (Wajib)")}
                      value={xiaoHongShuId}
                      onChange={(e) => setXiaoHongShuId(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#315B4F]/50 focus:border-[#315B4F]"
                    />
                  </div>
                </>
              )}

              {/* Kota Tinggal / Country */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">
                  {currentNationality === 'WNA_CHINA' ? "5. " : "3. "}
                  {currentNationality === 'WNA_EUROPE' ? t("City & Country of Residence") : t("Kota Tinggal Saat Ini")}{" "}
                  <span className="text-rose-500">*</span>
                  <span className="text-[10px] text-gray-400 font-normal block">
                    {currentNationality === 'WNA_EUROPE' ? "City & Country (e.g. Paris, France / Munich, Germany)" : "Kota tinggal saat ini (e.g. Shanghai / Jakarta)"}
                  </span>
                </label>
                <input
                  id="book-city"
                  type="text"
                  required
                  placeholder={currentNationality === 'WNA_EUROPE' ? "e.g. Paris, France" : "City / Kota Tinggal"}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#315B4F]/50 focus:border-[#315B4F]"
                />
              </div>

              {/* No WhatsApp */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">
                  {currentNationality === 'WNA_CHINA' ? "6. " : "4. "}
                  {t("No WhatsApp (Aktif)")}{" "}
                  {currentNationality === 'WNA_CHINA' ? (
                    <span className="text-xs text-gray-400 font-normal">({t("Optional")})</span>
                  ) : (
                    <span className="text-rose-500">*</span>
                  )}
                  <span className="text-[10px] text-gray-400 font-normal block">
                    {currentNationality === 'WNA_EUROPE' 
                      ? "Active WhatsApp with country code (e.g. +33 6 12 34 56 78)" 
                      : "No. WhatsApp aktif dengan kode negara (e.g. +62 812-3456-7890)"}
                  </span>
                </label>
                <input
                  id="book-whatsapp"
                  type="tel"
                  required={currentNationality !== 'WNA_CHINA'}
                  placeholder={t("WhatsApp Number (with country code)")}
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#315B4F]/50 focus:border-[#315B4F]"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">
                  {currentNationality === 'WNA_CHINA' ? "7. " : "5. "}
                  {t("Email Address")} <span className="text-rose-500">*</span>
                  <span className="text-[10px] text-gray-400 font-normal block">{t("Primary contact email (e.g. traveller@example.com)")}</span>
                </label>
                <input
                  id="book-email"
                  type="email"
                  required
                  placeholder={t("Email Address")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#315B4F]/50 focus:border-[#315B4F]"
                />
              </div>

              {/* Flight Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">
                  {currentNationality === 'WNA_CHINA' ? "8. " : "6. "}
                  {t("Nomor Penerbangan")} <span className="text-xs text-gray-400 font-normal">({t("Optional")})</span>
                  <span className="text-[10px] text-gray-400 font-normal block">{t("Arrival Flight Number (e.g. SQ956 or GA412)")}</span>
                </label>
                <input
                  id="book-flightNumber"
                  type="text"
                  placeholder={t("Arrival Flight (e.g. SQ956)")}
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#315B4F]/50 focus:border-[#315B4F]"
                />
              </div>

              {/* Pickup Location (Lokasi Penjemputan) */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-gray-700 block">
                  {currentNationality === 'WNA_CHINA' ? "9. " : "7. "}
                  {t("Lokasi Penjemputan")} <span className="text-rose-500">*</span>
                  <span className="text-[10px] text-gray-400 font-normal block">
                    Nama hotel, alamat villa, atau nama stasiun/bandara kedatangan (e.g. Hotel Tugu Malang, Bandara Juanda T2 Surabaya)
                  </span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#315B4F] absolute left-3.5 top-3.5" />
                  <input
                    id="book-pickupLocation"
                    type="text"
                    required
                    placeholder="Contoh: Hotel Santika Premiere Malang / Bandara Juanda Surabaya"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#315B4F]/50 focus:border-[#315B4F]"
                  />
                </div>
              </div>

              {/* Special Request (Catatan Khusus) */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-gray-700 block">
                  {currentNationality === 'WNA_CHINA' ? "10. " : "8. "}
                  {t("Special Request / Catatan Khusus")} <span className="text-xs text-gray-400 font-normal">({t("Optional")})</span>
                  <span className="text-[10px] text-gray-400 font-normal block">
                    Permintaan khusus, preferensi makanan/vegetarian, kursi bayi, atau kebutuhan lainnya
                  </span>
                </label>
                <textarea
                  id="book-specialRequests"
                  rows={2}
                  placeholder="Tuliskan permintaan khusus Anda jika ada (opsional)..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#315B4F]/50 focus:border-[#315B4F] resize-none"
                />
              </div>
            </div>

            {/* Participants Count */}
            <div className="space-y-4 pt-6 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-gray-700 block">
                    {t("Total Booking Seats")} (Max {maxSeatsAllowed})
                  </span>
                  <p className="text-[11px] text-[#315B4F] font-semibold">
                    {isPrivate 
                      ? t("Private Tour: Bebas menentukan tanggal dan jumlah peserta (hingga 25 orang).")
                      : t("Share Tour: Maksimal kuota peserta dibatasi oleh ketersediaan kursi batch.")}
                  </p>
                </div>
                
                <div className="flex items-center space-x-3 bg-gray-50 px-3 py-1.5 rounded-2xl border border-gray-200 w-fit self-start sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleParticipantsChange(numParticipants - 1)}
                    className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 flex items-center justify-center font-black cursor-pointer shadow-sm select-none"
                  >
                    -
                  </button>
                  <span className="text-sm font-mono font-bold text-gray-800 text-center w-24">
                    {numParticipants} {t(numParticipants > 1 ? "Travelers" : "Traveler")}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleParticipantsChange(numParticipants + 1)}
                    className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 flex items-center justify-center font-black cursor-pointer shadow-sm select-none"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Dynamic companion entries */}
              {numParticipants > 1 && (
                <div className="space-y-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 animate-fade-in">
                  <span className="text-xs font-bold text-gray-700 block">{t("Additional Companion Full Names")}</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {companionNames.map((cName, cIdx) => (
                      <div key={cIdx} className="space-y-1">
                        <label className="text-[10px] text-gray-400 font-mono font-bold uppercase">{t("Companion")} #{cIdx + 2} {t("Name")}</label>
                        <input
                          id={`companion-${cIdx}`}
                          type="text"
                          required
                          placeholder={`${t("Full Name of Traveler")} ${cIdx + 2}`}
                          value={cName}
                          onChange={(e) => handleCompanionNameChange(cIdx, e.target.value)}
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#315B4F]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submission Block: LANJUT KE PEMBAYARAN */}
            <div className="pt-6 border-t border-gray-100 space-y-3">
              <button
                id="btn-submit-booking-form"
                type="submit"
                disabled={loading}
                className={`w-full py-4 px-6 rounded-2xl text-white font-display font-black text-sm uppercase tracking-wider transition-all shadow-xl flex flex-col items-center justify-center gap-1.5 ${
                  loading 
                    ? "bg-gray-400 cursor-not-allowed opacity-80" 
                    : "bg-[#315B4F] hover:bg-[#203c34] active:scale-[0.99] cursor-pointer shadow-[#315B4F]/25 hover:shadow-2xl"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4 text-[#D6B16D]" />
                  <span>
                    {loading ? "Menghubungkan ke OJIRE..." : "LANJUT KE PEMBAYARAN"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </div>
                <span className="text-[11px] text-amber-300 font-mono font-semibold tracking-wide">
                  TOTAL: {totalPriceFormatted}
                </span>
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500 text-center">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Pilihan metode pembayaran (QRIS, Virtual Account, Kartu Kredit) akan dipilih langsung secara aman di Payment Gateway OJIRE.</span>
              </div>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
