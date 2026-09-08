import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { VEHICLES } from '../data';
import { 
  Plane, MapPin, Calendar, Clock, Users, ArrowRight, ShieldCheck, 
  CheckCircle, Sparkles, AlertCircle, Briefcase, ArrowRightLeft, X, Search, Check,
  Mail, Phone, ChevronRight, CheckCircle2, Star, Fuel, Landmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { processArtoPayPayment } from '../lib/artopay';
import CustomerReviewsSection from '../components/CustomerReviewsSection';
import Breadcrumbs from '../components/Breadcrumbs';
import ServiceNavTabs from '../components/ServiceNavTabs';

export default function AirportTransferView() {
  const { 
    formatPrice, 
    airportRoutes, 
    addBooking, 
    bookings, 
    schedules, 
    serviceLimits, 
    setActivePage,
    airports,
    setPage
  } = useApp();

  // Search widget parameters
  const [direction, setDirection] = useState<'Airport to City' | 'City to Airport'>('Airport to City');
  const [routeType, setRouteType] = useState<'One Way' | 'Round Trip'>('One Way');
  const [selectedAirport, setSelectedAirport] = useState('SUB');
  const [destinationCity, setDestinationCity] = useState('');
  const [cityAddress, setCityAddress] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [returnTime, setReturnTime] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [returnFlightNumber, setReturnFlightNumber] = useState('');
  const [passengers, setPassengers] = useState(3);
  const [luggage, setLuggage] = useState(2);

  // Transfer options
  const [meetAndGreet, setMeetAndGreet] = useState(true);
  const [childSeat, setChildSeat] = useState(false);
  const [showVehicles, setShowVehicles] = useState(false);

  // Step-based booking states
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

  // Lead passenger states
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Final confirmation states
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Helper mapping for common airport codes to full names
  const airportNames = airports.reduce((acc, ap) => {
    acc[ap.code] = ap.name;
    return acc;
  }, {} as Record<string, string>);

  // Get active published routes
  const publishedRoutes = airportRoutes.filter(r => r.status === 'Published');
  
  // Extract unique departure airports from published routes that are also ACTIVE in airports list
  const activeAirportCodes = airports.filter(ap => ap.status === 'Active').map(ap => ap.code);
  const availableAirports = Array.from(new Set(publishedRoutes.map(r => r.airport)))
    .filter(code => activeAirportCodes.includes(code)) as string[];
  const airportsToRender = (availableAirports.length > 0 ? availableAirports : (activeAirportCodes.length > 0 ? activeAirportCodes : ['SUB', 'DPS', 'YIA', 'CGK'])) as string[];

  // Dynamically extract unique cities available for the selected airport
  const availableCities = Array.from(new Set(
    publishedRoutes
      .filter(r => r.airport === selectedAirport)
      .map(r => r.city)
  )) as string[];

  // Reset/Set active city when airport changes
  useEffect(() => {
    if (availableCities.length > 0) {
      setDestinationCity(availableCities[0]);
    } else {
      setDestinationCity('');
    }
  }, [selectedAirport, airportRoutes]);

  // Calculate pricing based on route, trip type, and add-ons
  const getBaseRate = () => {
    const matchingRoute = publishedRoutes.find(
      r => r.airport === selectedAirport && r.city === destinationCity
    );

    let baseUSD = matchingRoute ? matchingRoute.priceUSD : 25;
    let baseIDR = matchingRoute ? matchingRoute.priceIDR : 380000;

    // Route Type modifier (Round trip is double the single way, with a 5% discount!)
    if (routeType === 'Round Trip') {
      baseUSD = baseUSD * 2 * 0.95;
      baseIDR = baseIDR * 2 * 0.95;
    }

    // Add-on surcharge
    if (childSeat) {
      baseUSD += 5;
      baseIDR += 75000;
    }

    return { usd: Math.round(baseUSD), idr: Math.round(baseIDR) };
  };

  const currentRate = getBaseRate();

  const getMult = (car: any) => {
    if (!car) return 1.0;
    if (car.id === 'avanza') return 0.9;
    if (car.id === 'innova') return 1.0;
    if (car.id === 'hiace-commuter') return 1.5;
    if (car.id === 'hiace-premio') return 1.8;
    return 1.0;
  };

  const getVehiclePrice = (car: any) => {
    if (!car) return { usd: 0, idr: 0 };
    const mult = getMult(car);
    return {
      usd: Math.round(currentRate.usd * mult),
      idr: Math.round(currentRate.idr * mult)
    };
  };

  const handleSearchTransfers = (e: React.FormEvent) => {
    e.preventDefault();
    setShowVehicles(true);

    // Smooth scroll to results
    setTimeout(() => {
      const el = document.getElementById('vehicle-fleet-transfer');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  const handleSelectVehicle = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setErrorMessage(null);
    setActiveStep(2);

    // Smooth scroll to top of process indicator
    setTimeout(() => {
      const el = document.getElementById('process-steps-bar');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleBookingDetailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      setErrorMessage('Harap lengkapi semua data kontak.');
      return;
    }
    setErrorMessage(null);

    // Validate blackout date / quota limits
    if (pickupDate) {
      const isBlocked = (schedules || []).some((s: any) => s.date === pickupDate && s.type === 'blocked');
      const confirmedCount = (bookings || []).filter((b: any) => 
        b.details && 
        b.details.date === pickupDate && 
        b.type === 'airport' &&
        (b.status === 'Confirmed' || b.status === 'Completed')
      ).length;
      
      if (isBlocked) {
        setErrorMessage('Maaf, tanggal ini telah ditutup oleh pihak operasional (Blackout Date). Silakan pilih tanggal lain.');
        return;
      }
      const limit = serviceLimits?.airport ?? 5;
      if (confirmedCount >= limit) {
        setErrorMessage(`Maaf, kuota pemesanan harian (${limit} slot) untuk layanan ini pada tanggal ini telah penuh. Silakan pilih tanggal lain.`);
        return;
      }
    }

    const vehiclePrice = getVehiclePrice(selectedVehicle);
    const airportName = airportNames[selectedAirport] || `${selectedAirport} Airport`;
    const cityText = `${destinationCity}`;

    const serviceName = `Airport Transfer: ${selectedAirport} ⇄ ${destinationCity} (${routeType === 'Round Trip' ? 'Round Trip' : 'One Way'})`;
    
    const pickupLocation = direction === 'Airport to City' 
      ? airportName 
      : `${cityAddress}, ${cityText}`;
      
    const destinationText = direction === 'Airport to City' 
      ? `${cityAddress}, ${cityText}` 
      : airportName;

    const bookingPayload = {
      type: 'airport' as const,
      serviceName,
      details: {
        pickupLocation,
        destination: destinationText,
        date: pickupDate || '2026-07-15',
        time: pickupTime || '12:00',
        guests: Number(passengers),
        luggage: Number(luggage),
        flightNumber: flightNumber || 'N/A',
        meetAndGreet,
        childSeat,
        cityAddress,
        routeType,
        direction,
        vehicleId: selectedVehicle.id,
        vehicleName: selectedVehicle.name,
        returnDateText: routeType === 'Round Trip' ? returnDate : undefined,
        returnTimeText: routeType === 'Round Trip' ? returnTime : undefined,
        returnFlightNumber: routeType === 'Round Trip' ? returnFlightNumber : undefined,
      },
      totalPrice: vehiclePrice.usd,
      totalPriceIDR: vehiclePrice.idr,
      customerName,
      customerEmail,
      customerPhone,
    };

    try {
      const newBooking = addBooking(bookingPayload);
      setConfirmedBooking(newBooking);
      setActiveStep(3);

      // Scroll to process steps bar
      setTimeout(() => {
        const el = document.getElementById('process-steps-bar');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat memproses reservasi Anda.');
    }
  };

  const handlePayWithArtoPayInline = async () => {
    if (!confirmedBooking) return;
    setPaymentLoading(true);
    setErrorMessage(null);
    try {
      await processArtoPayPayment({
        orderId: confirmedBooking.id,
        amount: confirmedBooking.totalPriceIDR,
        currency: 'IDR',
        onSuccess: (res) => {
          console.log('ArtoPay payment event completed:', res);
          window.location.hash = '#/bookings';
        },
        onPending: (res) => {
          console.log('ArtoPay payment pending event:', res);
          window.location.hash = '#/bookings';
        },
        onError: (err) => {
          console.error('ArtoPay payment error/cancelled!', err);
          alert('Pembayaran ArtoPay dibatalkan atau tidak diselesaikan.');
        }
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan koneksi sistem pembayaran ArtoPay.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleWhatsAppConfirmInline = () => {
    if (!confirmedBooking) return;
    const vehiclePrice = getVehiclePrice(selectedVehicle);
    const text = `Halo SawahJaya Trans, saya ingin mengonfirmasi booking Airport Transfer:\n\n` +
      `📌 *ID Booking:* ${confirmedBooking.id}\n` +
      `👤 *Nama:* ${confirmedBooking.customerName}\n` +
      `📞 *WhatsApp:* ${confirmedBooking.customerPhone}\n` +
      `🚗 *Armada:* ${selectedVehicle.name}\n` +
      `📍 *Rute:* ${direction === 'Airport to City' ? `${selectedAirport} ➔ ${destinationCity}` : `${destinationCity} Area ➔ ${selectedAirport}`}\n` +
      `🏠 *Alamat Detail:* ${cityAddress || '-'}\n` +
      `📅 *Jadwal:* ${pickupDate} pukul ${pickupTime}\n` +
      `${routeType === 'Round Trip' ? `🔄 *Jadwal Kembali:* ${returnDate} pukul ${returnTime} (${returnFlightNumber || '-'})\n` : ''}` +
      `✈️ *No. Penerbangan:* ${flightNumber || '-'}\n` +
      `👥 *Pax:* ${passengers} orang | *Bagasi:* ${luggage} koper\n` +
      `💰 *Total Tarif:* ${formatPrice(vehiclePrice.usd, vehiclePrice.idr)} (All-in Nett)\n\n` +
      `Mohon segera diproses penjemputan kami, terima kasih!`;
      
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/6285212347289?text=${encoded}`, '_blank', 'noreferrer,noopener');
  };

  // Toggle route direction (Airport to City <-> City to Airport)
  const toggleDirection = () => {
    setDirection(prev => prev === 'Airport to City' ? 'City to Airport' : 'Airport to City');
  };

  return (
    <div id="airport-transfer-view" className="bg-[#f8fafc] text-neutral-800 min-h-screen pt-20 md:pt-24 pb-16 md:pb-24 font-sans">
      
      {/* Service Switcher Navigation Bar */}
      <ServiceNavTabs />

      {/* Breadcrumb Navigation */}
      <Breadcrumbs items={[{ label: '24/7 Airport Transfer' }]} />

      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-4 mb-8 space-y-3">
        <span className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full text-xs font-semibold text-emerald-600 uppercase tracking-widest font-mono">
          <Plane className="h-4 w-4" />
          <span>Layanan Antar Jemput Bandara 24 Jam</span>
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 leading-tight">
          Transfer Bandara Juanda &amp; Ngurah Rai Privat
        </h1>
        <p className="text-neutral-600 text-xs sm:text-sm max-w-xl mx-auto font-medium">
          Penjemputan tepat waktu di bandara Surabaya (SUB), Malang (MLG), Banyuwangi (BWX), dan Bali (DPS) dengan garansi driver profesional dan armada bersih.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        
        {/* 1. THREE-STEP PROCESS INDICATOR */}
        <div id="process-steps-bar" className="w-full max-w-3xl mx-auto mb-10 md:mb-14">
          <div className="flex items-center justify-between relative">
            
            {/* Step 1: Compare */}
            <div className="flex flex-col items-center z-10 flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold transition-all ${
                activeStep > 1 
                  ? 'bg-emerald-500' 
                  : 'bg-emerald-500 shadow-md shadow-emerald-500/20'
              }`}>
                {activeStep > 1 ? (
                  <Check className="h-5 w-5 stroke-[3]" />
                ) : (
                  <span className="text-sm font-bold">1</span>
                )}
              </div>
              <span className={`text-xs sm:text-sm font-bold mt-2 transition-colors ${
                activeStep >= 1 ? 'text-emerald-600' : 'text-neutral-400'
              }`}>
                Compare
              </span>
            </div>

            {/* Connecting Line 1 */}
            <div className="absolute left-[16.66%] right-[50%] top-5 h-0.5 bg-neutral-200 -z-0">
              <div className={`h-full bg-emerald-500 transition-all duration-300 ${
                activeStep >= 2 ? 'w-full' : 'w-0'
              }`}></div>
            </div>

            {/* Step 2: Booking Detail */}
            <div className="flex flex-col items-center z-10 flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 border-white font-bold transition-all ${
                activeStep > 2 
                  ? 'bg-emerald-500 text-white' 
                  : activeStep === 2
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : 'bg-neutral-200 text-neutral-400'
              }`}>
                {activeStep > 2 ? (
                  <Check className="h-5 w-5 stroke-[3]" />
                ) : (
                  <span className="text-sm font-bold">2</span>
                )}
              </div>
              <span className={`text-xs sm:text-sm font-bold mt-2 transition-colors ${
                activeStep >= 2 ? 'text-emerald-600' : 'text-neutral-400'
              }`}>
                Booking Detail
              </span>
            </div>

            {/* Connecting Line 2 */}
            <div className="absolute left-[50%] right-[16.66%] top-5 h-0.5 bg-neutral-200 -z-0">
              <div className={`h-full bg-emerald-500 transition-all duration-300 ${
                activeStep >= 3 ? 'w-full' : 'w-0'
              }`}></div>
            </div>

            {/* Step 3: Payment */}
            <div className="flex flex-col items-center z-10 flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 border-white font-bold transition-all ${
                activeStep === 3
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-neutral-200 text-neutral-400'
              }`}>
                <span className="text-sm font-bold">3</span>
              </div>
              <span className={`text-xs sm:text-sm font-bold mt-2 transition-colors ${
                activeStep === 3 ? 'text-emerald-600' : 'text-neutral-400'
              }`}>
                Payment
              </span>
            </div>

          </div>
        </div>

        {/* CONDITIONAL PAGES RENDER BASED ON STEP */}
        <AnimatePresence mode="wait">
          
          {/* STEP 1: COMPARE AND SEARCH FLEET */}
          {activeStep === 1 && (
            <motion.div
              key="step1-search"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              {/* THE SIMPLIFIED SEARCH WIDGET CARD */}
              <div className="w-full bg-white border border-neutral-200/80 rounded-3xl shadow-xl shadow-neutral-100/50 p-5 sm:p-7 md:p-8 text-left mb-12">
                <form onSubmit={handleSearchTransfers} className="space-y-6">
                  
                  {/* TRIP TYPE SELECTOR (ONE WAY vs ROUNDTRIP) */}
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                      <input 
                        type="radio" 
                        name="trip_type"
                        checked={routeType === 'One Way'}
                        onChange={() => setRouteType('One Way')}
                        className="sr-only"
                      />
                      <span className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        routeType === 'One Way' ? 'border-emerald-500 bg-white' : 'border-neutral-300 bg-white'
                      }`}>
                        {routeType === 'One Way' && (
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        )}
                      </span>
                      <span className={`text-xs sm:text-sm font-bold transition-colors ${
                        routeType === 'One Way' ? 'text-neutral-900' : 'text-neutral-500'
                      }`}>
                        One Way
                      </span>
                    </label>

                    <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                      <input 
                        type="radio" 
                        name="trip_type"
                        checked={routeType === 'Round Trip'}
                        onChange={() => setRouteType('Round Trip')}
                        className="sr-only"
                      />
                      <span className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        routeType === 'Round Trip' ? 'border-emerald-500 bg-white' : 'border-neutral-300 bg-white'
                      }`}>
                        {routeType === 'Round Trip' && (
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        )}
                      </span>
                      <span className={`text-xs sm:text-sm font-bold transition-colors ${
                        routeType === 'Round Trip' ? 'text-neutral-900' : 'text-neutral-500'
                      }`}>
                        Roundtrip
                      </span>
                    </label>
                  </div>

                  {/* MAIN SEARCH ROW (GRID) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch bg-[#f8fafc] lg:bg-transparent p-4 lg:p-0 rounded-2xl">
                    
                    {/* PICK-UP COLUMN */}
                    <div className="lg:col-span-3 text-left space-y-1.5 bg-white lg:bg-[#f8fafc] p-3 lg:p-4 rounded-xl border border-neutral-100 lg:border-none">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">PICK-UP</span>
                      <div className="flex items-center space-x-2 relative">
                        <MapPin className="h-4 w-4 text-neutral-400 shrink-0" />
                        
                        {direction === 'Airport to City' ? (
                          // Airport pick-up
                          <select
                            value={selectedAirport}
                            onChange={(e) => setSelectedAirport(e.target.value)}
                            className="bg-transparent text-neutral-800 text-xs sm:text-sm w-full font-bold focus:outline-none appearance-none cursor-pointer pr-6"
                          >
                            {airportsToRender.map((code) => (
                              <option key={code} value={code}>
                                {code} – {airportNames[code] ? airportNames[code].split(' (')[0] : `${code} Airport`}
                              </option>
                            ))}
                          </select>
                        ) : (
                          // City pick-up
                          <select
                            value={destinationCity}
                            onChange={(e) => setDestinationCity(e.target.value)}
                            className="bg-transparent text-neutral-800 text-xs sm:text-sm w-full font-bold focus:outline-none appearance-none cursor-pointer pr-6"
                          >
                            {availableCities.map((city) => (
                              <option key={city} value={city}>
                                {city} Area
                              </option>
                            ))}
                          </select>
                        )}

                        {/* Clean clear/cancel selection indicator */}
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                      </div>
                    </div>

                    {/* SWAP / INTERCHANGE BUTTON */}
                    <div className="flex items-center justify-center lg:col-span-1 py-1 lg:py-0">
                      <button
                        type="button"
                        onClick={toggleDirection}
                        className="w-8 h-8 rounded-full bg-white border border-neutral-200 hover:border-emerald-500 hover:text-emerald-600 text-neutral-500 flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-90"
                        title="Tukar Arah Penjemputan"
                      >
                        <ArrowRightLeft className="w-4 h-4 rotate-90 lg:rotate-0" />
                      </button>
                    </div>

                    {/* DROP-OFF COLUMN */}
                    <div className="lg:col-span-3 text-left space-y-1.5 bg-white lg:bg-[#f8fafc] p-3 lg:p-4 rounded-xl border border-neutral-100 lg:border-none">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">DROP-OFF</span>
                      <div className="flex items-center space-x-2 relative">
                        <MapPin className="h-4 w-4 text-emerald-500 shrink-0" />

                        {direction === 'Airport to City' ? (
                          // City Drop-off
                          availableCities.length === 0 ? (
                            <span className="text-xs text-neutral-400 font-bold">No Routes Available</span>
                          ) : (
                            <select
                              value={destinationCity}
                              onChange={(e) => setDestinationCity(e.target.value)}
                              className="bg-transparent text-neutral-800 text-xs sm:text-sm w-full font-bold focus:outline-none appearance-none cursor-pointer pr-6"
                            >
                              {availableCities.map((city) => (
                                <option key={city} value={city}>
                                  {city} Area
                                </option>
                              ))}
                            </select>
                          )
                        ) : (
                          // Airport Drop-off
                          <select
                            value={selectedAirport}
                            onChange={(e) => setSelectedAirport(e.target.value)}
                            className="bg-transparent text-neutral-800 text-xs sm:text-sm w-full font-bold focus:outline-none appearance-none cursor-pointer pr-6"
                          >
                            {airportsToRender.map((code) => (
                              <option key={code} value={code}>
                                {code} – {airportNames[code] ? airportNames[code].split(' (')[0] : `${code} Airport`}
                              </option>
                            ))}
                          </select>
                        )}

                        <span className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                      </div>
                    </div>

                    {/* ARRIVAL/PICKUP DATE & TIME COLUMN */}
                    <div className="lg:col-span-3 text-left space-y-1.5 bg-white lg:bg-[#f8fafc] p-3 lg:p-4 rounded-xl border border-neutral-100 lg:border-none">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                        {direction === 'Airport to City' ? 'ARRIVAL DATE & TIME' : 'PICK-UP DATE & TIME'}
                      </span>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-neutral-400 shrink-0" />
                        <div className="flex items-center space-x-1.5 w-full">
                          <input
                            type="date"
                            required
                            value={pickupDate}
                            onChange={(e) => setPickupDate(e.target.value)}
                            className="bg-transparent text-neutral-800 text-xs sm:text-sm w-full font-bold focus:outline-none cursor-pointer font-mono"
                          />
                          <span className="text-neutral-300">|</span>
                          <input
                            type="time"
                            required
                            value={pickupTime}
                            onChange={(e) => setPickupTime(e.target.value)}
                            className="bg-transparent text-neutral-800 text-xs sm:text-sm w-32 font-bold focus:outline-none cursor-pointer font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* PASSENGERS COLUMN */}
                    <div className="lg:col-span-2 text-left space-y-1.5 bg-white lg:bg-[#f8fafc] p-3 lg:p-4 rounded-xl border border-neutral-100 lg:border-none">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">PASSENGERS</span>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-neutral-400 shrink-0" />
                        <input
                          type="number"
                          min="1"
                          max="25"
                          required
                          value={passengers}
                          onChange={(e) => setPassengers(Number(e.target.value))}
                          className="bg-transparent text-neutral-800 text-xs sm:text-sm w-full font-bold focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                  </div>

                  {/* DETAIL ALAMAT LENGKAP DETAIL FIELD */}
                  {destinationCity && (
                    <div className="space-y-1.5 text-left border-t border-neutral-100 pt-5">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest pl-1 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>Detail Alamat Lengkap ({direction === 'Airport to City' ? 'Drop-off' : 'Penjemputan'})</span>
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={cityAddress}
                        onChange={(e) => setCityAddress(e.target.value)}
                        placeholder="Masukkan nama hotel, perumahan, nomor jalan, RT/RW, dan instruksi spesifik..."
                        className="bg-[#f8fafc] border border-neutral-200 text-neutral-800 text-xs sm:text-sm rounded-2xl px-4 py-3 w-full focus:outline-none focus:border-emerald-500 focus:bg-white transition-all placeholder-neutral-400 font-medium"
                      />
                    </div>
                  )}

                  {/* ADDITIONAL TRIP INFO (FLIGHT NUMBER, LUGGAGE, RETURN TRIP DETAILS) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-neutral-100 pt-5">
                    
                    {/* Flight info & luggage info */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-left space-y-1.5">
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest pl-1">Flight Number</label>
                          <div className="flex items-center space-x-2.5 bg-[#f8fafc] border border-neutral-200 px-3.5 py-2.5 rounded-2xl">
                            <Plane className="h-4 w-4 text-neutral-400" />
                            <input
                              type="text"
                              placeholder="Contoh: SQ-938"
                              value={flightNumber}
                              onChange={(e) => setFlightNumber(e.target.value)}
                              className="bg-transparent text-neutral-800 text-xs font-bold w-full focus:outline-none font-mono uppercase"
                            />
                          </div>
                        </div>

                        <div className="text-left space-y-1.5">
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest pl-1">Jumlah Koper (Bags)</label>
                          <div className="flex items-center space-x-2.5 bg-[#f8fafc] border border-neutral-200 px-3.5 py-2.5 rounded-2xl">
                            <Briefcase className="h-4 w-4 text-neutral-400" />
                            <input
                              type="number"
                              min="0"
                              max="25"
                              required
                              value={luggage}
                              onChange={(e) => setLuggage(Number(e.target.value))}
                              className="bg-transparent text-neutral-800 text-xs font-bold w-full focus:outline-none font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4">
                        <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-bold text-neutral-600">
                          <input
                            type="checkbox"
                            checked={meetAndGreet}
                            onChange={(e) => setMeetAndGreet(e.target.checked)}
                            className="rounded border-neutral-300 bg-neutral-50 text-emerald-500 focus:ring-emerald-500 h-4.5 w-4.5 cursor-pointer"
                          />
                          <span>Meet &amp; Greet Sign Board di Terminal</span>
                        </label>
                        <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-bold text-neutral-600">
                          <input
                            type="checkbox"
                            checked={childSeat}
                            onChange={(e) => setChildSeat(e.target.checked)}
                            className="rounded border-neutral-300 bg-neutral-50 text-emerald-500 focus:ring-emerald-500 h-4.5 w-4.5 cursor-pointer"
                          />
                          <span>Tambahkan Kursi Bayi (+$5)</span>
                        </label>
                      </div>
                    </div>

                    {/* Return Leg details if Roundtrip is active */}
                    <div>
                      <AnimatePresence>
                        {routeType === 'Round Trip' ? (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="bg-emerald-50/50 border border-emerald-500/20 rounded-2xl p-4 space-y-3"
                          >
                            <h4 className="text-[10px] font-black text-emerald-700 font-mono uppercase tracking-wider">
                              🔄 JADWAL KEPULANGAN (RETURN TRIP LEG)
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1 text-left">
                                <label className="text-[9px] font-bold text-neutral-400 uppercase">Tanggal Return</label>
                                <input
                                  type="date"
                                  required
                                  value={returnDate}
                                  onChange={(e) => setReturnDate(e.target.value)}
                                  className="bg-white border border-neutral-200 rounded-xl px-2.5 py-2 text-xs w-full focus:outline-none font-semibold font-mono"
                                />
                              </div>
                              <div className="space-y-1 text-left">
                                <label className="text-[9px] font-bold text-neutral-400 uppercase">Jam Return</label>
                                <input
                                  type="time"
                                  required
                                  value={returnTime}
                                  onChange={(e) => setReturnTime(e.target.value)}
                                  className="bg-white border border-neutral-200 rounded-xl px-2.5 py-2 text-xs w-full focus:outline-none font-semibold font-mono"
                                />
                              </div>
                            </div>
                            <div className="space-y-1 text-left">
                              <label className="text-[9px] font-bold text-neutral-400 uppercase">Return Flight Number</label>
                              <input
                                  type="text"
                                  placeholder="Contoh: SQ-931"
                                  value={returnFlightNumber}
                                  onChange={(e) => setReturnFlightNumber(e.target.value)}
                                  className="bg-white border border-neutral-200 rounded-xl px-2.5 py-2 text-xs w-full focus:outline-none font-semibold font-mono uppercase"
                                />
                            </div>
                          </motion.div>
                        ) : (
                          <div className="h-full flex items-center justify-center p-6 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                            <p className="text-xs text-neutral-400 text-center font-medium leading-relaxed">
                              Anda memilih Sekali Jalan.<br />Aktifkan <strong className="text-neutral-600">Roundtrip</strong> untuk diskon 5% perjalanan pulang-pergi.
                            </p>
                          </div>
                        )}
                      </AnimatePresence>
                    </div>

                  </div>

                  {/* SEARCH SUBMISSION BUTTON */}
                  <div className="pt-3 flex justify-end">
                    <button
                      type="submit"
                      disabled={availableCities.length === 0}
                      className="bg-[#0cae7a] hover:bg-[#0b9c6d] disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-black py-4 px-10 rounded-2xl text-sm transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center space-x-2 cursor-pointer uppercase tracking-wider font-mono"
                    >
                      <Search className="h-4.5 w-4.5 text-white stroke-[2.5]" />
                      <span>Search</span>
                    </button>
                  </div>

                </form>
              </div>

              {/* MATCHING VEHICLES RENDER AREA */}
              <AnimatePresence>
                {showVehicles && (
                  <motion.section
                    id="vehicle-fleet-transfer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-10 max-w-7xl mx-auto px-1 sm:px-4 space-y-12 scroll-mt-24 text-left"
                  >
                    <div className="text-center space-y-2">
                      <span className="text-emerald-600 font-black uppercase tracking-widest font-mono text-xs">Pilihan Armada SjT</span>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">Kendaraan Chauffeur Privat Tersedia</h2>
                      <p className="text-neutral-500 text-xs sm:text-sm max-w-xl mx-auto">
                        Biaya all-inclusive (BBM, Driver, Toll &amp; Parkir) untuk rute {selectedAirport} ⇄ {destinationCity}. {routeType === 'Round Trip' && 'Sudah termasuk diskon 5% Pulang Pergi!'}
                      </p>
                    </div>

                    <div className="space-y-6 max-w-5xl mx-auto">
                      {VEHICLES.map((car) => {
                        const vehiclePrice = getVehiclePrice(car);

                        return (
                          <div
                            key={car.id}
                            className="bg-white border border-neutral-200 rounded-3xl overflow-hidden flex flex-col md:flex-row hover:border-emerald-500/30 hover:shadow-xl transition-all duration-300 group w-full"
                          >
                            {/* Vehicle Image */}
                            <div className="w-full md:w-80 h-48 md:h-auto relative overflow-hidden bg-neutral-50 shrink-0">
                              <img
                                src={car.image}
                                alt={car.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/50 to-transparent" />
                              <span className="absolute top-4 left-4 bg-neutral-900/95 border border-white/10 text-emerald-400 text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider font-mono">
                                {car.category} MPV
                              </span>
                            </div>

                            {/* Specifications and Content */}
                            <div className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between grow gap-6">
                              <div className="space-y-3 text-left">
                                <h3 className="text-xl font-extrabold text-neutral-900 group-hover:text-emerald-600 transition-colors">
                                  {car.name}
                                </h3>
                                <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed max-w-xl">
                                  {car.description}
                                </p>
                                
                                {/* Amenities & Specifications Badges */}
                                <div className="flex flex-wrap items-center gap-3 pt-1">
                                  <span className="flex items-center space-x-1.5 bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full text-xs font-semibold">
                                    <Users className="h-4 w-4 text-emerald-500 shrink-0" />
                                    <span>Maks. {car.passengers} Penumpang</span>
                                  </span>
                                  <span className="flex items-center space-x-1.5 bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full text-xs font-semibold">
                                    <Briefcase className="h-4 w-4 text-emerald-500 shrink-0" />
                                    <span>Maks. {car.luggage} Koper</span>
                                  </span>
                                  <span className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                    <span>Sopir + BBM + Tol &amp; Parkir</span>
                                  </span>
                                </div>
                              </div>

                              {/* Price & Action Area */}
                              <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 border-neutral-100 pt-4 md:pt-0 shrink-0 md:pl-6 md:border-l md:border-neutral-200/60 md:min-w-[200px]">
                                <div className="text-left md:text-right space-y-0.5">
                                  <span className="text-[9px] text-neutral-400 uppercase font-bold tracking-widest font-mono">TARIF ALL-IN NETT</span>
                                  <div className="flex items-baseline gap-1 justify-start md:justify-end">
                                    <span className="text-2xl font-black text-emerald-600 font-mono">
                                      {formatPrice(vehiclePrice.usd, vehiclePrice.idr)}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-emerald-600 font-bold block">✔ Tanpa Biaya Tambahan</span>
                                </div>

                                <button
                                  onClick={() => handleSelectVehicle(car)}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-2xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-emerald-500/10 cursor-pointer active:scale-95 transition-all uppercase tracking-wider font-mono shrink-0 md:mt-4"
                                >
                                  <span>Pilih Mobil</span>
                                  <ArrowRight className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Delay Info Note */}
                    <div className="bg-white border border-neutral-200 rounded-2xl p-4 flex items-start gap-3 max-w-2xl mx-auto shadow-sm">
                      <AlertCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      <div className="text-xs text-neutral-600 space-y-1">
                        <p className="font-bold text-neutral-900">Kebijakan Pemantauan Penundaan Penerbangan (Flight Delays)</p>
                        <p className="leading-relaxed">
                          Kami memantau secara otomatis nomor penerbangan Anda. Jika pesawat Anda mendarat lebih awal ataupun mengalami penundaan, driver kami akan secara otomatis menyesuaikan jam penjemputan di terminal tanpa ada biaya tambahan sama sekali.
                        </p>
                      </div>
                    </div>

                  </motion.section>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* STEP 2: BOOKING DETAILS (DATA PEMESAN) */}
          {activeStep === 2 && selectedVehicle && (
            <motion.div
              key="step2-detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left max-w-6xl mx-auto"
            >
              {/* Left Column: Chosen Vehicle & Journey Details */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm space-y-6">
                  <h3 className="text-lg font-black text-neutral-900 border-b border-neutral-100 pb-3 font-mono">
                    📋 RINGKASAN TRANSFER
                  </h3>
                  
                  {/* Selected Vehicle Card */}
                  <div className="flex items-center gap-4 bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                    <img
                      src={selectedVehicle.image}
                      alt={selectedVehicle.name}
                      className="w-24 h-16 object-cover rounded-xl shrink-0"
                    />
                    <div>
                      <span className="text-[8px] bg-emerald-500/10 text-emerald-600 font-extrabold uppercase px-2 py-0.5 rounded font-mono">
                        {selectedVehicle.category} MPV
                      </span>
                      <h4 className="font-extrabold text-neutral-900 text-sm mt-0.5">{selectedVehicle.name}</h4>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-neutral-500 font-semibold">
                        <span className="flex items-center gap-0.5">
                          <Users className="h-3 w-3" /> {selectedVehicle.passengers} Pax
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5">
                          <Briefcase className="h-3 w-3" /> {selectedVehicle.luggage} Bags
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Route & Times Summary */}
                  <div className="space-y-4">
                    <div className="relative pl-6 border-l-2 border-emerald-500/30 space-y-4">
                      
                      {/* Pick-up Location */}
                      <div className="relative">
                        <span className="absolute -left-[31px] top-0 w-4.5 h-4.5 rounded-full bg-emerald-50 border-4 border-emerald-500 flex items-center justify-center" />
                        <span className="text-[9px] text-neutral-400 font-bold uppercase block tracking-wider font-mono">TITIK JEMPUT</span>
                        <p className="text-xs sm:text-sm font-extrabold text-neutral-800 leading-snug">
                          {direction === 'Airport to City' 
                            ? (airportNames[selectedAirport] || `${selectedAirport} Airport`)
                            : `${cityAddress ? `${cityAddress}, ` : ''}${destinationCity} Area`
                          }
                        </p>
                      </div>

                      {/* Drop-off Location */}
                      <div className="relative">
                        <span className="absolute -left-[31px] top-0 w-4.5 h-4.5 rounded-full bg-emerald-50 border-4 border-emerald-500 flex items-center justify-center" />
                        <span className="text-[9px] text-neutral-400 font-bold uppercase block tracking-wider font-mono">TITIK ANTAR</span>
                        <p className="text-xs sm:text-sm font-extrabold text-neutral-800 leading-snug">
                          {direction === 'Airport to City'
                            ? `${cityAddress ? `${cityAddress}, ` : ''}${destinationCity} Area`
                            : (airportNames[selectedAirport] || `${selectedAirport} Airport`)
                          }
                        </p>
                      </div>

                    </div>

                    {/* Schedule Date & Time Row */}
                    <div className="grid grid-cols-2 gap-4 bg-neutral-50 p-3 rounded-2xl border border-neutral-100 text-xs">
                      <div>
                        <span className="text-[8px] text-neutral-400 font-bold block uppercase font-mono">TANGGAL &amp; JAM</span>
                        <span className="font-bold text-neutral-800 font-mono block mt-0.5">
                          {pickupDate || 'Belum dipilih'} | {pickupTime || '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[8px] text-neutral-400 font-bold block uppercase font-mono">PENERBANGAN</span>
                        <span className="font-bold text-neutral-800 font-mono block mt-0.5 uppercase">
                          {flightNumber || 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Roundtrip Info if active */}
                    {routeType === 'Round Trip' && (
                      <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-2xl text-xs space-y-1">
                        <span className="text-[8px] text-emerald-600 font-black uppercase font-mono tracking-wider block">🔄 JADWAL KEMBALI</span>
                        <p className="font-bold text-neutral-800 font-mono">
                          {returnDate} @ {returnTime} {returnFlightNumber ? `(${returnFlightNumber.toUpperCase()})` : ''}
                        </p>
                      </div>
                    )}

                    {/* Specifications List */}
                    <div className="space-y-2 text-xs text-neutral-600 border-t border-neutral-100 pt-4">
                      <div className="flex items-center justify-between font-medium">
                        <span>Layanan</span>
                        <span className="font-bold text-neutral-900">Private Transfer ({routeType})</span>
                      </div>
                      <div className="flex items-center justify-between font-medium">
                        <span>Fasilitas All-in</span>
                        <span className="text-emerald-600 font-bold">Driver, BBM, Tol &amp; Parkir</span>
                      </div>
                      {meetAndGreet && (
                        <div className="flex items-center justify-between font-medium">
                          <span>Sign Board di Terminal</span>
                          <span className="text-emerald-600 font-bold">Gratis</span>
                        </div>
                      )}
                      {childSeat && (
                        <div className="flex items-center justify-between font-medium">
                          <span>Kursi Bayi (Child Seat)</span>
                          <span className="font-bold text-neutral-900">Tambahan (Termasuk)</span>
                        </div>
                      )}
                    </div>

                    {/* Pricing Detail Card */}
                    <div className="border-t border-neutral-100 pt-4 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] text-neutral-400 uppercase font-black tracking-widest font-mono">TARIF ALL-IN NETT</span>
                        <span className="text-neutral-500 text-[10px] block font-medium">Sudah termasuk pajak &amp; biaya tol</span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-emerald-600 font-mono block">
                          {formatPrice(getVehiclePrice(selectedVehicle).usd, getVehiclePrice(selectedVehicle).idr)}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Right Column: Lead Passenger Form */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-xl font-extrabold text-neutral-900">Detail Informasi Kontak Pemesan</h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      Mohon isi kontak penanggung jawab perjalanan (lead passenger). Nomor WhatsApp aktif sangat diperlukan untuk koordinasi driver kami.
                    </p>
                  </div>

                  <form onSubmit={handleBookingDetailSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name Input */}
                      <div className="space-y-1.5 text-left">
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest font-mono">NAMA LENGKAP</label>
                        <div className="relative">
                          <Users className="absolute left-4 top-3.5 h-4 w-4 text-neutral-400" />
                          <input
                            type="text"
                            required
                            placeholder="Contoh: Budi Santoso"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="bg-neutral-50 border border-neutral-200 rounded-2xl pl-11 pr-4 py-3.5 text-xs sm:text-sm text-neutral-800 w-full focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-semibold"
                          />
                        </div>
                      </div>

                      {/* Email Input */}
                      <div className="space-y-1.5 text-left">
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest font-mono">ALAMAT EMAIL</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-3.5 h-4 w-4 text-neutral-400" />
                          <input
                            type="email"
                            required
                            placeholder="Contoh: budi@gmail.com"
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            className="bg-neutral-50 border border-neutral-200 rounded-2xl pl-11 pr-4 py-3.5 text-xs sm:text-sm text-neutral-800 w-full focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-semibold"
                          />
                        </div>
                      </div>

                      {/* Phone Input */}
                      <div className="space-y-1.5 text-left sm:col-span-2">
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest font-mono">NOMOR WHATSAPP (AKTIF)</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-3.5 h-4 w-4 text-neutral-400" />
                          <input
                            type="tel"
                            required
                            placeholder="Contoh: +62 812-3456-7890"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            className="bg-neutral-50 border border-neutral-200 rounded-2xl pl-11 pr-4 py-3.5 text-xs sm:text-sm text-neutral-800 w-full focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-semibold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Blackout dates or quota warnings */}
                    {errorMessage && (
                      <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl p-4 flex items-start gap-2.5 animate-fade-in">
                        <div className="p-0.5 rounded-full bg-red-100 text-red-500 shrink-0">
                          <X className="h-4 w-4" />
                        </div>
                        <p className="font-semibold leading-tight">{errorMessage}</p>
                      </div>
                    )}

                    <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100 flex items-start gap-3">
                      <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-neutral-500 leading-relaxed">
                        Kami menjamin keamanan data pribadi Anda. Sistem kami tidak memerlukan pembayaran kartu kredit hari ini; Anda dapat memilih untuk membayar cash pada kedatangan, atau mengamankan transaksi via ArtoPay Gateway setelah formulir ini dikirim.
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveStep(1);
                          setTimeout(() => {
                            const el = document.getElementById('vehicle-fleet-transfer');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }, 100);
                        }}
                        className="w-full sm:w-auto text-neutral-500 hover:text-neutral-800 text-xs font-bold py-2 px-4 transition-colors text-center cursor-pointer uppercase tracking-wider font-mono"
                      >
                        ← Ubah Pilihan Mobil
                      </button>

                      <button
                        type="submit"
                        className="w-full sm:w-auto bg-[#0cae7a] hover:bg-[#0b9c6d] text-white font-bold px-8 py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer active:scale-98 transition-all uppercase tracking-wider font-mono text-xs sm:text-sm"
                      >
                        <span>Selesaikan Pemesanan</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>

                  </form>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: PAYMENT / CHECKOUT & SUCCESS (PEMBAYARAN) */}
          {activeStep === 3 && confirmedBooking && (
            <motion.div
              key="step3-checkout"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="max-w-2xl mx-auto space-y-8"
            >
              {/* Success Badge */}
              <div className="text-center space-y-3 py-4">
                <div className="inline-flex items-center justify-center bg-emerald-50 text-emerald-500 p-5 rounded-full shadow-inner relative">
                  <CheckCircle2 className="h-12 w-12" />
                  <Sparkles className="absolute top-1.5 right-1.5 h-5 w-5 text-amber-500 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-neutral-900 tracking-tight">Pemesanan Anda Berhasil!</h2>
                  <p className="text-xs sm:text-sm text-neutral-500 font-medium">
                    Kami telah mengonfirmasi pemesanan Anda dengan kode referensi aman berikut.
                  </p>
                </div>
              </div>

              {/* TICKET-STYLE INVOICE DETAIL */}
              <div className="bg-white border border-neutral-200/80 rounded-3xl overflow-hidden shadow-xl shadow-neutral-100 relative">
                
                {/* Invoice Top Strip */}
                <div className="bg-emerald-600 text-white p-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-300" />
                    <span className="text-[10px] font-bold uppercase tracking-widest font-mono">OFFICIAL BOOKING RECEIPT</span>
                  </div>
                  <span className="bg-white/20 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase font-mono">
                    {confirmedBooking.status || 'Confirmed'}
                  </span>
                </div>

                <div className="p-6 sm:p-8 space-y-6 text-left">
                  {/* Reservation Ticket Header */}
                  <div className="border-b border-dashed border-neutral-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[9px] text-neutral-400 font-bold uppercase block tracking-wider font-mono">KODE RESERVASI</span>
                      <span className="text-xl sm:text-2xl font-black text-neutral-900 tracking-wider font-mono">
                        {confirmedBooking.id}
                      </span>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-[9px] text-neutral-400 font-bold uppercase block tracking-wider font-mono">TOTAL TARIF</span>
                      <span className="text-xl sm:text-2xl font-black text-emerald-600 font-mono">
                        {formatPrice(confirmedBooking.totalPrice, confirmedBooking.totalPriceIDR)}
                      </span>
                    </div>
                  </div>

                  {/* Customer Information Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[8px] text-neutral-400 font-bold block uppercase font-mono tracking-wider">NAMA PELANGGAN</span>
                      <span className="font-bold text-neutral-800 text-sm">{confirmedBooking.customerName}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-neutral-400 font-bold block uppercase font-mono tracking-wider">WHATSAPP</span>
                      <span className="font-bold text-neutral-800 text-sm">{confirmedBooking.customerPhone}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-[8px] text-neutral-400 font-bold block uppercase font-mono tracking-wider">ALAMAT EMAIL</span>
                      <span className="font-bold text-neutral-700">{confirmedBooking.customerEmail}</span>
                    </div>
                  </div>

                  {/* Booking Specifics */}
                  <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 text-xs space-y-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-neutral-500 font-medium shrink-0">Armada Pilihan</span>
                      <span className="font-bold text-neutral-900 text-right">{selectedVehicle?.name} Class</span>
                    </div>
                    <div className="flex items-start justify-between gap-2 border-t border-neutral-200/50 pt-2.5">
                      <span className="text-neutral-500 font-medium shrink-0">Rute Perjalanan</span>
                      <span className="font-bold text-neutral-900 text-right">
                        {direction === 'Airport to City' ? `${selectedAirport} ⇄ ${destinationCity}` : `${destinationCity} ⇄ ${selectedAirport}`}
                      </span>
                    </div>
                    {cityAddress && (
                      <div className="flex items-start justify-between gap-2 border-t border-neutral-200/50 pt-2.5">
                        <span className="text-neutral-500 font-medium shrink-0">Detail Alamat</span>
                        <span className="font-bold text-neutral-800 text-right leading-relaxed max-w-xs">{cityAddress}</span>
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-2 border-t border-neutral-200/50 pt-2.5">
                      <span className="text-neutral-500 font-medium shrink-0">Jadwal Penjemputan</span>
                      <span className="font-bold text-neutral-900 text-right font-mono">
                        {pickupDate} @ {pickupTime}
                      </span>
                    </div>
                    {routeType === 'Round Trip' && (
                      <div className="flex items-start justify-between gap-2 border-t border-neutral-200/50 pt-2.5">
                        <span className="text-neutral-500 font-medium shrink-0">Jadwal Kepulangan</span>
                        <span className="font-bold text-neutral-900 text-right font-mono">
                          {returnDate} @ {returnTime} ({returnFlightNumber?.toUpperCase() || '-'})
                        </span>
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-2 border-t border-neutral-200/50 pt-2.5">
                      <span className="text-neutral-500 font-medium shrink-0">Penumpang / Koper</span>
                      <span className="font-bold text-neutral-900 text-right">
                        {passengers} Pax · {luggage} Bags
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PAYMENT ACTION DECISION SEGMENT */}
              <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-sm text-left space-y-6">
                <div>
                  <h3 className="text-lg font-extrabold text-neutral-900">Metode Pembayaran Aman &amp; Konfirmasi</h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Silakan pilih metode penyelesaian pembayaran di bawah ini. Anda dapat membayar secara instan dan otomatis menggunakan ArtoPay Gateway, atau bayar cash kepada driver kami saat tiba dengan konfirmasi cepat via WhatsApp.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Option 1: ArtoPay Online Payment */}
                  <div className="border border-neutral-200 rounded-2xl p-5 flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Landmark className="h-5 w-5 text-emerald-600" />
                        <h4 className="font-bold text-sm text-neutral-900">Bayar Instan Online (ArtoPay)</h4>
                      </div>
                      <p className="text-[11px] text-neutral-500 leading-relaxed">
                        Bayar otomatis &amp; aman via *ArtoPay Gateway* (Virtual Account, QRIS, e-Wallet, Kartu Kredit). Konfirmasi instan tanpa kirim bukti.
                      </p>
                    </div>
                    
                    <button
                      onClick={handlePayWithArtoPayInline}
                      disabled={paymentLoading || confirmedBooking.paymentStatus === 'Paid'}
                      className="mt-4 w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-100 disabled:text-neutral-400 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all uppercase tracking-wider font-mono active:scale-95 shadow-sm shadow-emerald-500/10"
                    >
                      {paymentLoading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          <span>Menghubungkan ArtoPay...</span>
                        </>
                      ) : confirmedBooking.paymentStatus === 'Paid' ? (
                        <>
                          <Check className="h-4 w-4 stroke-[3]" />
                          <span>Sudah Terbayar Lunas (ArtoPay)</span>
                        </>
                      ) : (
                        <>
                          <span>Bayar via ArtoPay</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </div>

                  {/* Option 2: WhatsApp Confirmation & Cash */}
                  <div className="border border-neutral-200 rounded-2xl p-5 flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Phone className="h-5 w-5 text-emerald-600" />
                        <h4 className="font-bold text-sm text-neutral-900">Bayar Cash ke Driver</h4>
                      </div>
                      <p className="text-[11px] text-neutral-500 leading-relaxed">
                        Anda dapat membayar tunai kepada driver Anda saat perjalanan selesai. Mohon kirim detail reservasi ini ke WhatsApp CS kami untuk pencatatan jadwal driver.
                      </p>
                    </div>
                    
                    <button
                      onClick={handleWhatsAppConfirmInline}
                      className="mt-4 w-full bg-neutral-900 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all uppercase tracking-wider font-mono active:scale-95"
                    >
                      <svg className="h-4.5 w-4.5 fill-white" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.403 0 9.797-4.302 9.8-9.59 0-2.562-1.0-4.97-2.817-6.788-1.816-1.816-4.23-2.815-6.79-2.817-5.405 0-9.8 4.302-9.802 9.59-.001 1.905.504 3.762 1.464 5.395l-.101.594-.65 2.373 2.433-.637.588.118zM18.006 14.8c-.33-.164-1.94-.955-2.24-1.064-.3-.11-.518-.165-.738.165-.219.33-.848 1.063-1.04 1.28-.19.22-.382.247-.71.082-.33-.164-1.39-.512-2.65-1.634-1-.892-1.675-2.003-1.872-2.33-.198-.33-.02-.508.144-.672.148-.147.33-.384.493-.576.164-.192.219-.33.328-.548.11-.219.055-.411-.027-.575-.082-.164-.738-1.78-.1.11-1.01-2.41-1.01-.22 0-.424.11-.518.246-.054.41-.054.547 0 1.013.164.466.822 1.97 1.945 2.85 1.123.882 2.053 1.35 2.8 1.48.747.13 1.427.11 1.964.03.597-.088 1.94-.793 2.214-1.56.274-.766.274-1.422.192-1.56-.082-.137-.3-.219-.63-.383z"/>
                      </svg>
                      <span>WhatsApp Konfirmasi</span>
                    </button>
                  </div>
                </div>

                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl p-4 flex items-start gap-2.5 animate-fade-in">
                    <div className="p-0.5 rounded-full bg-red-100 text-red-500 shrink-0">
                      <X className="h-4 w-4" />
                    </div>
                    <p className="font-semibold leading-tight">{errorMessage}</p>
                  </div>
                )}

                {/* Return Buttons */}
                <div className="pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button
                    onClick={() => {
                      setActiveStep(1);
                      setShowVehicles(false);
                      setConfirmedBooking(null);
                      setSelectedVehicle(null);
                      // Clear forms
                      setCustomerName('');
                      setCustomerEmail('');
                      setCustomerPhone('');
                    }}
                    className="w-full sm:w-auto text-neutral-500 hover:text-neutral-800 text-xs font-bold py-2.5 px-4 transition-colors text-center cursor-pointer uppercase tracking-wider font-mono bg-neutral-50 hover:bg-neutral-100 rounded-xl"
                  >
                    Booking Rute Lain
                  </button>

                  <button
                    onClick={() => setActivePage('bookings')}
                    className="w-full sm:w-auto bg-neutral-900 hover:bg-neutral-800 text-white font-bold px-8 py-3 rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all uppercase tracking-wider font-mono text-xs"
                  >
                    <span>Lihat Rincian Booking Saya</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>

        <CustomerReviewsSection 
          serviceType="airport" 
          serviceName="Airport Transfer (Antar Jemput Bandara)" 
        />
      </div>

    </div>
  );
}

