import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../AppContext';
import { 
  Car, MapPin, Calendar, Users, ArrowRight, ShieldCheck, CheckCircle2, Info, Briefcase, Settings, 
  User, Clock, ChevronRight, ChevronLeft, Check, Sparkles, ArrowLeft, MessageSquare, Mail, Globe, 
  AlertCircle, SlidersHorizontal, ArrowUpDown, Award, FileText, Shield, Building, Plane
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import CustomerReviewsSection from '../components/CustomerReviewsSection';
import Breadcrumbs from '../components/Breadcrumbs';
import ServiceNavTabs from '../components/ServiceNavTabs';
import { processArtoPayPayment } from '../lib/artopay';

interface LocationItem {
  name: string;
  zone: string;
}

function SearchableDropdown({
  label,
  placeholder,
  value,
  onChange,
  options,
  id,
  icon: Icon
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  options: LocationItem[];
  id: string;
  icon: any;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt =>
    opt.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative space-y-1" ref={dropdownRef} id={id}>
      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 pl-1">
        {label}
      </label>
      <div className="relative">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-xl pl-10 pr-10 py-3 text-sm font-semibold cursor-pointer focus:border-amber-500 hover:border-neutral-700 transition-colors flex items-center justify-between"
        >
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500" />
          <span className={value ? 'text-white' : 'text-neutral-500'}>
            {value || placeholder}
          </span>
          <ChevronRight className={`h-4 w-4 text-neutral-400 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-30 w-full mt-1 bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden max-h-60 flex flex-col animate-fade-in">
          <div className="p-2 border-b border-neutral-900 bg-neutral-950">
            <input
              type="text"
              autoFocus
              placeholder="Type to search locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 placeholder-neutral-500"
            />
          </div>
          <div className="overflow-y-auto grow py-1 custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, i) => (
                <div
                  key={i}
                  onClick={() => {
                    onChange(opt.name);
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 text-xs text-neutral-300 hover:bg-amber-500 hover:text-neutral-950 font-medium cursor-pointer transition-colors flex items-center justify-between"
                >
                  <span className="truncate pr-2">{opt.name}</span>
                  <span className="text-[8px] bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-400 shrink-0 uppercase font-mono">
                    {opt.zone}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-xs text-neutral-500 italic text-center">
                No matching locations found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function InteractiveCalendar({
  label,
  placeholder,
  value,
  onChange,
  id
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  id: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { bookings, serviceLimits, schedules } = useApp();

  const today = new Date();
  const initialDate = value ? new Date(value) : today;
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    onChange(`${currentYear}-${formattedMonth}-${formattedDay}`);
    setIsOpen(false);
  };

  const isTodayDate = (day: number) => {
    const d = new Date();
    return d.getDate() === day && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  };

  const isPast = (day: number) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const cellDate = new Date(currentYear, currentMonth, day);
    return cellDate < d;
  };

  const isBlockedOrFull = (day: number) => {
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;

    const isBlocked = (schedules || []).some(s => s.date === dateStr && s.type === 'blocked');
    const confirmedCount = (bookings || []).filter(b => 
      b.type === 'rental' && 
      b.details?.date === dateStr && 
      (b.status === 'Confirmed' || b.status === 'Completed')
    ).length;

    const isFull = confirmedCount >= (serviceLimits?.rental ?? 5);
    return { isBlocked, isFull };
  };

  const isSelected = (day: number) => {
    if (!value) return false;
    const parts = value.split('-');
    return (
      parseInt(parts[0], 10) === currentYear &&
      parseInt(parts[1], 10) === currentMonth + 1 &&
      parseInt(parts[2], 10) === day
    );
  };

  const blankCells = Array.from({ length: firstDayIndex });
  const dayCells = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getDisplayValue = () => {
    if (!value) return placeholder;
    const parts = value.split('-');
    const dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="relative space-y-1" ref={dropdownRef} id={id}>
      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 pl-1">
        {label}
      </label>
      <div className="relative">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-xl pl-10 pr-10 py-3 text-sm font-semibold cursor-pointer focus:border-amber-500 hover:border-neutral-700 transition-colors flex items-center justify-between"
        >
          <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500" />
          <span className={value ? 'text-white' : 'text-neutral-500'}>
            {getDisplayValue()}
          </span>
          <ChevronRight className={`h-4 w-4 text-neutral-400 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-40 w-full md:w-80 mt-1 bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl p-4 flex flex-col space-y-3 animate-fade-in left-0 md:left-auto md:right-0">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-neutral-500 font-bold uppercase">
            {DAYS_OF_WEEK.map(d => <div key={d}>{d}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {blankCells.map((_, i) => <div key={`blank-${i}`} />)}
            {dayCells.map((day) => {
              const { isBlocked, isFull } = isBlockedOrFull(day);
              const past = isPast(day);
              const disabled = past || isBlocked || isFull;
              const selected = isSelected(day);
              const current = isTodayDate(day);

              return (
                <button
                  type="button"
                  key={`day-${day}`}
                  disabled={disabled}
                  onClick={() => handleSelectDay(day)}
                  className={`aspect-square rounded-full text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                    selected
                      ? 'bg-amber-500 text-neutral-950 font-black scale-105'
                      : isFull
                      ? 'text-rose-500 bg-rose-950/20 cursor-not-allowed opacity-50'
                      : isBlocked || past
                      ? 'text-neutral-700 cursor-not-allowed opacity-30 line-through'
                      : 'text-neutral-300 hover:bg-neutral-800 hover:text-amber-500'
                  }`}
                >
                  <span>{day}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CarRentalView() {
  const { 
    formatPrice, 
    addBooking,
    rentalCities,
    rentalLocations,
    rentalVehicles,
    rentalCategories,
    rentalAddons,
    rentalZonePricing,
    setPage
  } = useApp();

  const getRelativeDateString = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // State mimicking Traveloka Car Booking Flow
  const [serviceType, setServiceType] = useState<'without_driver' | 'with_driver'>('with_driver');
  const [selectedRegion, setSelectedRegion] = useState<'Malang' | 'Bali'>('Malang');
  const [searchStep, setSearchStep] = useState<1 | 2>(1);
  
  const [pickupLocation, setPickupLocation] = useState<string>('');
  const [dropoffLocation, setDropoffLocation] = useState<string>('');
  const [pickupDate, setPickupDate] = useState<string>(getRelativeDateString(1));
  const [pickupTime, setPickupTime] = useState<string>('09:00');
  const [durationDays, setDurationDays] = useState<number>(1);

  const returnDate = (() => {
    if (!pickupDate) return getRelativeDateString(2);
    try {
      const d = new Date(pickupDate);
      d.setDate(d.getDate() + durationDays);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    } catch (e) {
      return getRelativeDateString(2);
    }
  })();
  const returnTime = pickupTime;
  
  const [currentScreen, setCurrentScreen] = useState<'search' | 'results' | 'providers' | 'details' | 'form' | 'review'>('search');
  const [searchError, setSearchError] = useState<string | null>(null);

  // Results State
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [sortOption, setSortOption] = useState<'price_asc' | 'price_desc' | 'rating_desc'>('price_asc');
  const [filterTransmission, setFilterTransmission] = useState<'all' | 'Automatic' | 'Manual'>('all');
  const [filterClass, setFilterClass] = useState<'all' | 'Standard' | 'Premium' | 'Van'>('all');

  // Provider State
  const [selectedProvider, setSelectedProvider] = useState<any>(null);

  // Rental details options
  const [pickupType, setPickupType] = useState<'office' | 'airport' | 'hotel'>('office');
  const [dropoffType, setDropoffType] = useState<'office' | 'airport' | 'hotel'>('office');
  const [pickupDetail, setPickupDetail] = useState<string>('');
  const [dropoffDetail, setDropoffDetail] = useState<string>('');
  const [verificationAccepted, setVerificationAccepted] = useState(true);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [selectedZone, setSelectedZone] = useState<'Zone 0' | 'Zone 1' | 'Zone 2'>('Zone 0');

  // Synchronize selectedZone whenever pickup or dropoff location is manually changed from the dropdown
  useEffect(() => {
    const pLoc = getDynamicLocations().find(l => l.name === pickupLocation);
    const dLoc = getDynamicLocations().find(l => l.name === dropoffLocation);
    const pZone = pLoc ? pLoc.zone : 'Zone 0';
    const dZone = dLoc ? dLoc.zone : 'Zone 0';
    
    // Choose the maximum zone between pick-up and drop-off to determine the active pricing/routing zone
    const pZoneNum = parseInt(pZone.replace(/\D/g, ''), 10) || 0;
    const dZoneNum = parseInt(dZone.replace(/\D/g, ''), 10) || 0;
    const maxZoneNum = Math.max(pZoneNum, dZoneNum);
    
    const maxZoneStr = `Zone ${maxZoneNum}` as 'Zone 0' | 'Zone 1' | 'Zone 2';
    setSelectedZone(maxZoneStr);
  }, [pickupLocation, dropoffLocation, selectedRegion]);

  const handleSelectZoneDirectly = (zoneCode: 'Zone 0' | 'Zone 1' | 'Zone 2') => {
    setSelectedZone(zoneCode);
    
    const availableLocs = getDynamicLocations();
    // Find the first location in this zone
    const targetLoc = availableLocs.find(l => l.zone === zoneCode);
    if (targetLoc) {
      setDropoffLocation(targetLoc.name);
    }
    
    // Also, if pickupLocation is empty or has a zone mismatch, set it to a popular Zone 0 location
    const currentPLoc = availableLocs.find(l => l.name === pickupLocation);
    if (!pickupLocation || (currentPLoc && currentPLoc.zone !== 'Zone 0')) {
      const defaultPickup = availableLocs.find(l => l.zone === 'Zone 0') || availableLocs[0];
      if (defaultPickup) {
        setPickupLocation(defaultPickup.name);
      }
    }
  };

  // Booking details form
  const [customerName, setCustomerName] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [isDriverSameAsContact, setIsDriverSameAsContact] = useState<boolean>(true);
  const [driverName, setDriverName] = useState<string>('');
  const [driverPhone, setDriverPhone] = useState<string>('');
  const [nationality, setNationality] = useState<string>('Indonesia');
  const [specialRequest, setSpecialRequest] = useState<string>('');
  const [policyAccepted, setPolicyAccepted] = useState<boolean>(false);



  const getDynamicLocations = () => {
    const city = rentalCities.find(c => c.name.toLowerCase() === selectedRegion.toLowerCase());
    if (!city) return [];
    return rentalLocations
      .filter(l => l.cityId === city.id && l.status === 'Active')
      .map(l => ({ name: l.name, zone: l.zone || 'Zone 1' }));
  };

  const getDynamicVehicles = () => {
    const city = rentalCities.find(c => c.name.toLowerCase() === selectedRegion.toLowerCase());
    if (!city) return [];
    
    let activeVehicles = rentalVehicles.filter(v => v.cityId === city.id && v.status === 'Active');
    
    // Map with Category Name
    return activeVehicles.map(v => {
      const cat = rentalCategories.find(c => c.id === v.categoryId);
      return {
        ...v,
        categoryName: cat ? cat.name : 'Standard',
        category: cat
      };
    });
  };

  const getVehicleZonePrice = (vehicle: any) => {
    if (!vehicle) return { usd: 0, idr: 0 };
    const pLoc = getDynamicLocations().find(l => l.name === pickupLocation);
    const dLoc = getDynamicLocations().find(l => l.name === dropoffLocation);
    const pZone = pLoc ? pLoc.zone : 'Zone 1';
    const dZone = dLoc ? dLoc.zone : 'Zone 1';
    const maxZone = Math.max(
      parseInt(pZone.replace(/\D/g, ''), 10) || 1,
      parseInt(dZone.replace(/\D/g, ''), 10) || 1
    );

    const category = vehicle.category;
    if (!category) return { usd: vehicle.pricePerDay || 45, idr: vehicle.pricePerDayIDR || 650000 };

    let baseUSD = category.priceZone1USD || 45;
    let baseIDR = category.priceZone1IDR || 650000;

    if (maxZone === 0) {
      baseUSD = category.priceZone0USD || baseUSD;
      baseIDR = category.priceZone0IDR || baseIDR;
    } else if (maxZone === 2) {
      baseUSD = category.priceZone2USD || baseUSD * 1.2;
      baseIDR = category.priceZone2IDR || baseIDR * 1.2;
    }

    return { usd: Math.round(baseUSD), idr: Math.round(baseIDR) };
  };

  const getProvidersForVehicle = (vehicle: any) => {
    const { usd: baseUSD, idr: baseIDR } = getVehicleZonePrice(vehicle);
    
    // For Without Driver, apply 20% discount on base rates (since driver cost is not included!)
    const multiplier = serviceType === 'without_driver' ? 0.8 : 1.0;
    const finalBaseUSD = Math.round(baseUSD * multiplier);
    const finalBaseIDR = Math.round(baseIDR * multiplier);

    return [
      {
        id: 'sawah_jaya',
        name: 'Smart Journey (Official Brand)',
        rating: 4.9,
        reviewsCount: 520,
        tag: 'Recommended Partner',
        tagColor: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
        priceUSD: finalBaseUSD,
        priceIDR: finalBaseIDR,
        cancellation: 'Free Cancellation up to 24 hrs prior',
        inclusions: [
          'Excellent Customer Service guarantee',
          'Full-to-Full Fuel Policy',
          'Taxes & Toll Surcharges inclusive',
          'Verified Clean Sanitized Interior'
        ]
      },
      {
        id: 'bintang_rent',
        name: 'Bintang Nusantara Rent',
        rating: 4.7,
        reviewsCount: 195,
        tag: 'Popular choice',
        tagColor: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
        priceUSD: Math.round(finalBaseUSD * 1.08),
        priceIDR: Math.round(finalBaseIDR * 1.08),
        cancellation: 'Non-refundable booking',
        inclusions: [
          'Clean standard car condition',
          '24/7 Roadside Assistance support',
          'Basic collision damage coverage limit'
        ]
      },
      {
        id: 'ecocar',
        name: 'EcoCar Premium Rentals',
        rating: 4.4,
        reviewsCount: 88,
        tag: 'Cheapest Option',
        tagColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
        priceUSD: Math.round(finalBaseUSD * 0.93),
        priceIDR: Math.round(finalBaseIDR * 0.93),
        cancellation: 'Free Cancellation within 12 hrs',
        inclusions: [
          'Standard Car Cleanliness guarantee',
          'Refundable security deposit policy'
        ]
      }
    ];
  };

  const getDynamicAddons = () => {
    return rentalAddons
      .filter(a => a.status === 'Active')
      .map(a => ({
        id: a.id,
        name: a.name,
        description: a.description,
        priceUSD: a.priceUSD,
        priceIDR: a.priceIDR,
        isPerDay: a.pricingType === 'Per Day'
      }));
  };

  const calculateFinalPrice = () => {
    if (!selectedVehicle || !selectedProvider) return { usd: 0, idr: 0, addonsUSD: 0, addonsIDR: 0 };
    
    const providerUSD = selectedProvider.priceUSD * durationDays;
    const providerIDR = selectedProvider.priceIDR * durationDays;

    let addonsUSD = 0;
    let addonsIDR = 0;

    selectedAddOns.forEach(id => {
      const addon = getDynamicAddons().find(a => a.id === id);
      if (addon) {
        if (addon.isPerDay) {
          addonsUSD += addon.priceUSD * durationDays;
          addonsIDR += addon.priceIDR * durationDays;
        } else {
          addonsUSD += addon.priceUSD;
          addonsIDR += addon.priceIDR;
        }
      }
    });

    return {
      usd: providerUSD + addonsUSD,
      idr: providerIDR + addonsIDR,
      vehicleUSD: providerUSD,
      vehicleIDR: providerIDR,
      addonsUSD,
      addonsIDR
    };
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);

    if (!pickupLocation || !dropoffLocation) {
      setSearchError('Harap pilih Lokasi Penjemputan dan Lokasi Tujuan Paling Jauh (Tujuan Wisata).');
      return;
    }

    setCurrentScreen('results');
  };

  const handleSelectCar = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    const providers = getProvidersForVehicle(vehicle);
    const officialProvider = providers.find(p => p.id === 'sawah_jaya') || providers[0];
    setSelectedProvider(officialProvider);
    setCurrentScreen('details');
  };

  const handleSelectProvider = (provider: any) => {
    setSelectedProvider(provider);
    setCurrentScreen('details');
  };

  const handleProceedToForm = () => {
    if (!pickupDetail.trim()) {
      setSearchError('Harap lengkapi Alamat Lengkap / Detail Penjemputan untuk melanjutkan.');
      return;
    }
    setSearchError(null);
    setCurrentScreen('form');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);

    if (!customerName || !customerEmail || !customerPhone) {
      setSearchError('Please fill in all mandatory contact information.');
      return;
    }

    if (!isDriverSameAsContact && !driverName) {
      setSearchError("Please specify the driver's full name.");
      return;
    }

    if (!policyAccepted) {
      setSearchError('You must agree to the rental terms and insurance policy rules.');
      return;
    }

    setCurrentScreen('review');
  };

  const handleFinalBooking = () => {
    const finalPrice = calculateFinalPrice();
    const addOnList = selectedAddOns.map(id => {
      const item = getDynamicAddons().find(a => a.id === id);
      return item ? item.name : id;
    });

    const bookingPayload = {
      type: 'rental' as const,
      serviceName: `Car Rental: ${selectedVehicle.name} - ${selectedProvider.name}`,
      details: {
        pickupLocation,
        destination: dropoffLocation,
        date: pickupDate,
        time: pickupTime,
        days: durationDays,
        vehicleId: selectedVehicle.id,
        vehicleName: selectedVehicle.name,
        withDriver: serviceType === 'with_driver',
        nationality,
        cityAddress: `Detail Penjemputan: ${pickupDetail}`,
        specialRequest: specialRequest || '',
        addOns: addOnList,
        operationalCity: selectedRegion,
        pickupArea: pickupLocation,
        dropoffArea: dropoffLocation,
        pickupZone: 'Zone 1',
        dropoffZone: 'Zone 1',
        selectedAddons: addOnList,
        pricingBreakdown: {
          basePriceUSD: selectedProvider.priceUSD,
          basePriceIDR: selectedProvider.priceIDR,
          surchargeUSD: 0,
          surchargeIDR: 0,
          addonsTotalUSD: finalPrice.addonsUSD,
          addonsTotalIDR: finalPrice.addonsIDR,
          days: durationDays
        }
      },
      totalPrice: finalPrice.usd,
      totalPriceIDR: finalPrice.idr,
      customerName,
      customerEmail,
      customerPhone
    };

    try {
      const newBooking = addBooking(bookingPayload);
      processArtoPayPayment({
        orderId: newBooking.id,
        amount: finalPrice.idr,
        currency: 'IDR',
        onSuccess: () => {
          window.location.hash = '#/bookings';
        },
        onError: () => {
          window.location.hash = '#/bookings';
        }
      }).catch(() => {
        window.location.hash = '#/bookings';
      });
    } catch (err: any) {
      alert(err.message || 'An error occurred while building your booking.');
    }
  };

  // Pre-filtered and sorted vehicles list
  const processedVehicles = (() => {
    let list = getDynamicVehicles();

    // Filter transmission
    if (filterTransmission !== 'all') {
      const isAuto = filterTransmission === 'Automatic';
      list = list.filter(v => {
        const isCarAuto = v.id === 'avanza' || v.id === 'innova';
        return isAuto ? isCarAuto : !isCarAuto;
      });
    }

    // Filter Category class
    if (filterClass !== 'all') {
      list = list.filter(v => v.categoryName === filterClass);
    }

    // Sort
    return list.sort((a, b) => {
      const priceA = getVehicleZonePrice(a).usd;
      const priceB = getVehicleZonePrice(b).usd;
      if (sortOption === 'price_asc') return priceA - priceB;
      if (sortOption === 'price_desc') return priceB - priceA;
      return 1; // Default
    });
  })();

  return (
    <div id="car-rental-view" className="bg-neutral-950 text-neutral-100 min-h-screen pt-20 md:pt-24 pb-20 font-sans">
      
      {/* Service Switcher Navigation Bar */}
      <ServiceNavTabs />

      {/* Breadcrumb Navigation */}
      <Breadcrumbs items={[{ label: 'Car Rental with Driver' }]} />

      {/* HEADER SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-8 space-y-3">
        <span className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full text-xs font-semibold text-amber-500 uppercase tracking-widest font-mono">
          <Car className="h-4.5 w-4.5" />
          <span>Verified Premium Fleets</span>
        </span>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
          Sewa Mobil &amp; Rental <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-600">Innova &amp; HiAce Premio</span>
        </h1>
        <p className="text-neutral-400 text-xs sm:text-sm max-w-lg mx-auto">
          Layanan rental mobil privat dengan driver berpengalaman di Jawa Timur dan Bali. Pilihan unit Toyota Avanza, Innova Reborn, Zenix, HiAce Premio, dan Alphard.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TRAVELOKA PROGRESS TRACKER */}
        <div className="max-w-4xl mx-auto mb-10 overflow-x-auto scrollbar-none">
          <div className="flex items-center justify-between min-w-[580px] sm:min-w-0 text-[11px] font-bold text-neutral-500 uppercase tracking-wider border-b border-neutral-800 pb-3">
            <span className={currentScreen === 'search' ? 'text-amber-500 font-extrabold border-b-2 border-amber-500 pb-3 -mb-[14px]' : 'text-neutral-300'}>
              1. Search
            </span>
            <span className={currentScreen === 'results' ? 'text-amber-500 font-extrabold border-b-2 border-amber-500 pb-3 -mb-[14px]' : 'text-neutral-300'}>
              2. Car Model
            </span>
            <span className={currentScreen === 'details' ? 'text-amber-500 font-extrabold border-b-2 border-amber-500 pb-3 -mb-[14px]' : 'text-neutral-300'}>
              3. Options
            </span>
            <span className={currentScreen === 'form' ? 'text-amber-500 font-extrabold border-b-2 border-amber-500 pb-3 -mb-[14px]' : 'text-neutral-300'}>
              4. Details Form
            </span>
            <span className={currentScreen === 'review' ? 'text-amber-500 font-extrabold border-b-2 border-amber-500 pb-3 -mb-[14px]' : 'text-neutral-300'}>
              5. Confirm &amp; Pay
            </span>
          </div>
        </div>

        {/* ERROR BOUNDARY BAR */}
        {searchError && (
          <div className="max-w-4xl mx-auto mb-6 bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs rounded-xl p-4 flex items-center gap-2.5 animate-fade-in">
            <AlertCircle className="h-4.5 w-4.5 text-rose-500 shrink-0" />
            <p className="font-semibold">{searchError}</p>
          </div>
        )}

        {/* ANIME CONTAINER */}
        <AnimatePresence mode="wait">

          {/* SCREEN 1: SEARCH BAR CONTAINER */}
          {currentScreen === 'search' && (
            <motion.div
              key="search-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
                
                {/* TRAVELOKA SINGLE TAB HEADER */}
                <div className="bg-neutral-950/80 border-b border-neutral-800">
                  <div className="py-4.5 px-6 text-sm font-extrabold tracking-wide uppercase bg-neutral-900 text-amber-500 border-t-2 border-amber-500 flex items-center justify-center gap-2">
                    <User className="h-5 w-5 text-amber-500" />
                    <span>Layanan Dengan Sopir (With Driver Rental Service Only)</span>
                  </div>
                </div>

                <div className="p-6 sm:p-8 space-y-6">
                  {searchStep === 1 ? (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="space-y-6 animate-fade-in"
                    >
                      <div className="text-center space-y-2 py-4">
                        <span className="text-[10px] text-amber-500 font-extrabold uppercase tracking-widest font-mono">Langkah 1 (Step 1)</span>
                        <h3 className="text-2xl font-black text-white">Pilih Kota Operasional</h3>
                        <p className="text-sm text-neutral-400">Silakan pilih kota wilayah operasional untuk layanan sewa mobil dengan sopir.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {[
                          { key: 'Malang', title: 'Malang' },
                          { key: 'Bali', title: 'Bali' }
                        ].map((city) => (
                          <div
                            key={city.key}
                            onClick={() => {
                              setSelectedRegion(city.key as any);
                              setPickupLocation('');
                              setDropoffLocation('');
                              setSearchStep(2);
                            }}
                            className={`p-6 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01] hover:border-amber-500/50 flex flex-col justify-between h-36 ${
                              selectedRegion === city.key
                                ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-md ring-1 ring-amber-500/20'
                                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:bg-neutral-900'
                            }`}
                          >
                            <div className="space-y-1">
                              <span className="font-black text-xl block text-white">{city.title}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-black uppercase text-amber-500 font-mono flex items-center justify-end gap-1">
                                <span>Pilih Kota</span>
                                <ArrowRight className="h-3 w-3" />
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setPickupLocation('');
                            setDropoffLocation('');
                            setSearchStep(2);
                          }}
                          className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black py-3.5 px-8 rounded-xl text-sm uppercase tracking-wider transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <span>Lanjutkan (Continue)</span>
                          <ArrowRight className="h-4 w-4 stroke-[3]" />
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-6"
                    >
                      {/* Return/Back button & Chosen city indicator */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-950 border border-neutral-850 p-4.5 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-500">
                            <MapPin className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">Kota Operasional Terpilih</span>
                            <span className="text-sm font-extrabold text-white">{selectedRegion === 'Malang' ? 'Malang' : 'Bali'}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSearchStep(1)}
                          className="text-xs font-black uppercase text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer bg-neutral-900 border border-neutral-800 px-4 py-2.5 rounded-xl self-start sm:self-auto font-mono"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          <span>Ubah Kota (Change City)</span>
                        </button>
                      </div>

                      <form onSubmit={handleSearchSubmit} className="space-y-6">
                        
                        {/* Interactive Zone Selection Widget */}
                        <div className="space-y-3 bg-neutral-950 p-5 rounded-2xl border border-neutral-850">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                                <Sparkles className="h-4.5 w-4.5 text-amber-500" />
                                <span>Pilih Zona Wilayah Tujuan Utama (Route Zone)</span>
                              </h4>
                              <p className="text-xs text-neutral-400 mt-0.5">
                                Pilih zona untuk memilih lokasi & mengaktifkan rute tarif otomatis secara instan.
                              </p>
                            </div>
                            <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full font-black uppercase tracking-wider font-mono">
                              Aktif: {selectedZone === 'Zone 0' ? 'Zona Nol' : selectedZone === 'Zone 1' ? 'Zona Satu' : 'Zona Dua'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
                            {[
                              {
                                code: 'Zone 0' as const,
                                label: 'Zona Nol',
                                sub: selectedRegion === 'Malang' ? 'Kota Malang' : 'Denpasar & Sekitar',
                                desc: selectedRegion === 'Malang' 
                                  ? 'Area pusat Kota Malang & 5 Kecamatan lengkap.' 
                                  : 'Bandara, Kuta, Seminyak, Sanur, Nusa Dua.',
                                examples: selectedRegion === 'Malang'
                                  ? 'Stasiun, Alun-Alun, Klojen, Blimbing, Sukun, Lowokwaru, Kedungkandang'
                                  : 'Bandara Ngurah Rai, Legian, Kuta, Seminyak, Sanur',
                                color: 'border-emerald-500/20 hover:border-emerald-500/40 bg-emerald-500/5 text-emerald-400',
                                activeColor: 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-500/10 text-emerald-300'
                              },
                              {
                                code: 'Zone 1' as const,
                                label: 'Zona Satu',
                                sub: selectedRegion === 'Malang' ? 'Kab. Malang & Batu' : 'Ubud & Area Tengah',
                                desc: selectedRegion === 'Malang' 
                                  ? 'Wilayah Kabupaten Malang & pariwisata Kota Batu.' 
                                  : 'Ubud Center, Tanah Lot, Uluwatu Cliff Temple.',
                                examples: selectedRegion === 'Malang'
                                  ? 'Batu, Singosari, Karangploso, Dau, Kepanjen, Tumpang, Lawang, Pakis'
                                  : 'Ubud, Tanah Lot, Uluwatu, Jimbaran, Gianyar',
                                color: 'border-amber-500/20 hover:border-amber-500/40 bg-amber-500/5 text-amber-400',
                                activeColor: 'ring-2 ring-amber-500 border-amber-500 bg-amber-500/10 text-amber-300'
                              },
                              {
                                code: 'Zone 2' as const,
                                label: 'Zona Dua',
                                sub: selectedRegion === 'Malang' ? 'Kabupaten Tetangga' : 'Bali Utara & Jauh',
                                desc: selectedRegion === 'Malang' 
                                  ? 'Luar Malang / Kabupaten tetangga batas terjauh.' 
                                  : 'Kintamani Batur View, Singaraja, Lovina Beach.',
                                examples: selectedRegion === 'Malang'
                                  ? 'Lumajang, Kediri, Blitar, Probolinggo, Pasuruan, Gunung Bromo, Tumpak Sewu'
                                  : 'Kintamani, Lovina, Gilimanuk, Karangasem, Bedugul',
                                color: 'border-rose-500/20 hover:border-rose-500/40 bg-rose-500/5 text-rose-400',
                                activeColor: 'ring-2 ring-rose-500 border-rose-500 bg-rose-500/10 text-rose-300'
                              }
                            ].map((z) => {
                              const isActive = selectedZone === z.code;
                              return (
                                <div
                                  key={z.code}
                                  onClick={() => handleSelectZoneDirectly(z.code)}
                                  className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between h-40 ${
                                    isActive ? z.activeColor : `bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:bg-neutral-900`
                                  }`}
                                >
                                  <div>
                                    <div className="flex items-center justify-between">
                                      <span className="font-extrabold text-xs uppercase text-white">{z.label}</span>
                                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded font-mono ${
                                        isActive ? 'bg-white/20 text-white' : 'bg-neutral-800 text-neutral-400'
                                      }`}>
                                        {z.code}
                                      </span>
                                    </div>
                                    <span className="text-[11px] font-bold text-amber-500 block mt-1">{z.sub}</span>
                                    <p className="text-[10px] text-neutral-400 leading-snug mt-1.5">{z.desc}</p>
                                  </div>
                                  <div className="border-t border-neutral-800/60 pt-1.5 mt-1">
                                    <span className="text-[8px] text-neutral-500 font-bold uppercase block">Contoh Wilayah:</span>
                                    <span className="text-[9px] text-neutral-300 truncate block font-medium" title={z.examples}>
                                      {z.examples}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Row 2: Location Dropdowns */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <SearchableDropdown
                            id="pickup-dd"
                            label="Lokasi Penjemputan (Pick-up)"
                            placeholder="Cari dan pilih lokasi penjemputan..."
                            value={pickupLocation}
                            onChange={setPickupLocation}
                            options={getDynamicLocations()}
                            icon={MapPin}
                          />
                          <SearchableDropdown
                            id="return-dd"
                            label="Lokasi Tujuan Paling Jauh (Tujuan Wisata)"
                            placeholder="Cari dan pilih lokasi tujuan..."
                            value={dropoffLocation}
                            onChange={setDropoffLocation}
                            options={getDynamicLocations()}
                            icon={MapPin}
                          />
                        </div>

                        {/* Row 3: Date, Time & Duration parameters */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <InteractiveCalendar
                            id="p-date"
                            label="Tanggal Mulai Sewa"
                            placeholder="Pilih Tanggal"
                            value={pickupDate}
                            onChange={setPickupDate}
                          />
                          <div className="space-y-1">
                            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 pl-1">
                              Jam Mulai Sewa
                            </label>
                            <select
                              value={pickupTime}
                              onChange={(e) => setPickupTime(e.target.value)}
                              className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-xl px-3 py-3 text-sm font-bold focus:outline-none"
                            >
                              {Array.from({ length: 24 }).map((_, hour) => {
                                const formattedHour = String(hour).padStart(2, '0');
                                return (
                                  <React.Fragment key={hour}>
                                    <option value={`${formattedHour}:00`}>{formattedHour}:00</option>
                                    <option value={`${formattedHour}:30`}>{formattedHour}:30</option>
                                  </React.Fragment>
                                );
                              })}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 pl-1">
                              Durasi Sewa (Hari)
                            </label>
                            <select
                              value={durationDays}
                              onChange={(e) => setDurationDays(parseInt(e.target.value, 10))}
                              className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-xl px-3 py-3 text-sm font-bold focus:outline-none"
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 14, 30].map((d) => (
                                <option key={d} value={d}>
                                  {d} Hari ({d} Day{d > 1 ? 's' : ''})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Helper calculation display */}
                        <div className="bg-neutral-950 p-4 rounded-2xl flex items-center justify-between text-xs border border-neutral-850">
                          <span className="text-neutral-400 flex items-center gap-2">
                            <Info className="h-4 w-4 text-amber-500" />
                            <span>Total rental calculation:</span>
                          </span>
                          <span className="font-extrabold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-md font-mono">
                            {durationDays} Day{durationDays > 1 ? 's' : ''} rental period
                          </span>
                        </div>

                        {/* Submission Button */}
                        <button
                          type="submit"
                          className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black py-4 rounded-xl text-sm uppercase tracking-wider transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <span>Cari Mobil (Search Available Cars)</span>
                          <ArrowRight className="h-4 w-4 stroke-[3]" />
                        </button>

                      </form>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* SCREEN 2: CAR RESULTS LIST */}
          {currentScreen === 'results' && (
            <motion.div
              key="results-screen"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Active search summary header */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center md:text-left">
                  <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider font-mono">Current Search Parameters</span>
                  <h3 className="text-sm font-black text-white leading-tight">
                    {selectedRegion} City • With Driver Included
                  </h3>
                  <p className="text-xs text-neutral-400">
                    {pickupLocation} ({pickupDate} {pickupTime}) → {dropoffLocation} ({returnDate} {returnTime}) ({durationDays} days)
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSearchStep(1);
                    setCurrentScreen('search');
                  }}
                  className="bg-neutral-950 border border-neutral-800 hover:border-neutral-700 hover:text-white text-neutral-300 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Change Search
                </button>
              </div>

              {/* Filtering and sorting strip */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 flex flex-col lg:flex-row items-center justify-between gap-5">
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-neutral-400 font-bold">Filters:</span>
                  </div>

                  {/* Gearbox filter */}
                  <select
                    value={filterTransmission}
                    onChange={(e) => setFilterTransmission(e.target.value as any)}
                    className="bg-neutral-950 border border-neutral-800 text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-500 font-bold"
                  >
                    <option value="all">All Transmissions</option>
                    <option value="Automatic">Automatic only</option>
                    <option value="Manual">Manual only</option>
                  </select>

                  {/* Class Filter */}
                  <select
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value as any)}
                    className="bg-neutral-950 border border-neutral-800 text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-500 font-bold"
                  >
                    <option value="all">All Vehicle Classes</option>
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                    <option value="Van">Van / Microbus</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 text-xs w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 border-neutral-800 pt-3 lg:pt-0">
                  <span className="text-neutral-400 font-bold flex items-center gap-2">
                    <ArrowUpDown className="h-3.5 w-3.5 text-amber-500" />
                    <span>Sort by:</span>
                  </span>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as any)}
                    className="bg-neutral-950 border border-neutral-800 text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-500 font-bold"
                  >
                    <option value="price_asc">Price (Lowest first)</option>
                    <option value="price_desc">Price (Highest first)</option>
                  </select>
                </div>
              </div>

              {/* VEHICLE LIST CARDS */}
              {processedVehicles.length > 0 ? (
                <div className="space-y-4">
                  {processedVehicles.map((car) => {
                    const { usd: dailyUSD, idr: dailyIDR } = getVehicleZonePrice(car);
                    const listRateUSD = serviceType === 'without_driver' ? Math.round(dailyUSD * 0.8) : dailyUSD;
                    const listRateIDR = serviceType === 'without_driver' ? Math.round(dailyIDR * 0.8) : dailyIDR;
                    const isAuto = car.id === 'avanza' || car.id === 'innova';

                    return (
                      <div
                        key={car.id}
                        className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden p-3.5 hover:border-amber-500/30 transition-all flex gap-3.5 sm:gap-6 group items-center relative"
                      >
                        {/* Image Column */}
                        <div className="relative w-28 h-20 sm:w-48 sm:h-32 flex-shrink-0 bg-neutral-950 rounded-xl overflow-hidden">
                          <img
                            src={car.image}
                            alt={car.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute top-1.5 left-1.5 bg-amber-500 text-neutral-950 text-[8px] sm:text-[9px] font-black px-1.5 sm:px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                            {car.categoryName}
                          </span>
                        </div>

                        {/* Details Column */}
                        <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6 min-w-0">
                          <div className="space-y-1 sm:space-y-2 flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                              <h3 className="text-sm sm:text-lg font-black text-white truncate">{car.name}</h3>
                              <span className="text-[10px] sm:text-xs text-amber-400 font-bold flex items-center gap-1 self-start sm:self-auto">
                                ⭐ 4.8 <span className="text-[9px] sm:text-[10px] text-neutral-500 font-normal">(120+ reviews)</span>
                              </span>
                            </div>
                            
                            <p className="hidden md:block text-xs text-neutral-400 line-clamp-1">{car.description}</p>

                            {/* Specs list - very compact, like Traveloka */}
                            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] sm:text-xs text-neutral-300 font-semibold bg-neutral-950/40 p-1.5 sm:p-2 rounded-lg border border-neutral-850/50 w-fit">
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3 text-amber-500" />
                                <span>{car.passengers} Kursi</span>
                              </span>
                              <span className="text-neutral-700 font-normal">•</span>
                              <span className="flex items-center gap-1">
                                <Briefcase className="h-3 w-3 text-amber-500" />
                                <span>{car.luggage} Bagasi</span>
                              </span>
                              <span className="text-neutral-700 font-normal">•</span>
                              <span className="flex items-center gap-1">
                                <Settings className="h-3 w-3 text-amber-500" />
                                <span>{isAuto ? 'Matic' : 'Manual'}</span>
                              </span>
                            </div>
                          </div>

                          {/* Pricing & Booking Column */}
                          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 border-t sm:border-t-0 border-neutral-800/60 pt-2.5 sm:pt-0">
                            <div className="text-left sm:text-right">
                              <span className="hidden sm:block text-[8px] text-neutral-500 uppercase font-black tracking-wider font-mono">Mulai dari</span>
                              <span className="text-sm sm:text-xl font-black text-amber-500 font-mono block leading-none">
                                {formatPrice(listRateUSD, listRateIDR)}
                              </span>
                              <span className="text-[9px] sm:text-xs text-neutral-400 font-semibold block mt-1">
                                / hari
                              </span>
                              <span className="text-[8px] sm:text-[10px] text-neutral-500 block">
                                Total: {formatPrice(listRateUSD * durationDays, listRateIDR * durationDays)} ({durationDays} Hari)
                              </span>
                            </div>
                            <button
                              onClick={() => handleSelectCar(car)}
                              className="bg-amber-500 hover:bg-amber-400 text-neutral-950 text-[10px] sm:text-xs font-black px-4 sm:px-5 py-1.5 sm:py-2.5 rounded-xl uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
                            >
                              <span>Pilih</span>
                              <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-12 text-center text-neutral-400">
                  <p className="text-sm font-bold italic">No matching vehicles found with selected filters.</p>
                </div>
              )}
            </motion.div>
          )}



          {/* SCREEN 4: RENTAL DETAILS & REQUIREMENTS */}
          {currentScreen === 'details' && selectedVehicle && selectedProvider && (
            <motion.div
              key="details-screen"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-7xl mx-auto space-y-6"
            >
              <button
                onClick={() => setCurrentScreen('results')}
                className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-xs font-bold uppercase font-mono cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Car List</span>
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Form column */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Pick-up location detail */}
                  <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-4">
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <Building className="h-5 w-5 text-amber-500" />
                      <span>Alamat Lengkap / Detail Penjemputan</span>
                    </h3>
                    
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-neutral-400">
                        Harap masukkan lokasi penjemputan secara detail (misal: Alamat Rumah, Nama Hotel & Nomor Kamar, Terminal Bandara & Kode Penerbangan, dsb.)
                      </label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Contoh: Hotel Grand Hyatt room 402, jemput di lobby jam 09:00 pagi..."
                        value={pickupDetail}
                        onChange={(e) => setPickupDetail(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-850 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50"
                      />
                    </div>
                  </div>



                  {/* Optional Add-ons */}
                  <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-4">
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-amber-500" />
                      <span>Optional Enhancements (Add-ons)</span>
                    </h3>
                    <div className="space-y-3">
                      {getDynamicAddons().map((add) => {
                        const isAdded = selectedAddOns.includes(add.id);
                        return (
                          <div
                            key={add.id}
                            onClick={() => {
                              if (isAdded) {
                                setSelectedAddOns(prev => prev.filter(a => a !== add.id));
                              } else {
                                setSelectedAddOns(prev => [...prev, add.id]);
                              }
                            }}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all flex justify-between items-center ${
                              isAdded
                                ? 'bg-amber-500/10 border-amber-500'
                                : 'bg-neutral-950 border-neutral-850 hover:border-neutral-700'
                            }`}
                          >
                            <div className="space-y-0.5 pr-4">
                              <span className="font-bold text-xs text-white block">{add.name}</span>
                              <span className="text-[10px] text-neutral-400 block">{add.description}</span>
                            </div>
                            <span className="font-mono text-xs text-amber-400 font-extrabold shrink-0">
                              +{formatPrice(add.priceUSD, add.priceIDR)}
                              <span className="text-[9px] text-neutral-500 font-normal">{add.isPerDay ? '/day' : ' flat'}</span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Right Sticky Receipt column */}
                <div className="lg:col-span-5">
                  <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-6 sticky top-28">
                    <div>
                      <span className="text-[9px] text-amber-500 font-bold uppercase tracking-widest font-mono">Fare Calculation</span>
                      <h3 className="text-lg font-black text-white">Booking Invoice</h3>
                    </div>

                    <div className="space-y-3 text-xs leading-relaxed border-b border-neutral-850 pb-4">
                      <div className="flex justify-between">
                        <div>
                          <span className="font-bold text-white block">{selectedVehicle.name}</span>
                          <span className="text-[10px] text-neutral-400">{selectedProvider.name} x {durationDays} Days</span>
                        </div>
                        <span className="font-semibold text-white font-mono">
                          {formatPrice(selectedProvider.priceUSD * durationDays, selectedProvider.priceIDR * durationDays)}
                        </span>
                      </div>

                      {selectedAddOns.map(addId => {
                        const add = getDynamicAddons().find(a => a.id === addId);
                        if (!add) return null;
                        const addUSD = add.isPerDay ? add.priceUSD * durationDays : add.priceUSD;
                        const addIDR = add.isPerDay ? add.priceIDR * durationDays : add.priceIDR;
                        return (
                          <div key={addId} className="flex justify-between pt-2 border-t border-dashed border-neutral-850 text-neutral-300">
                            <span>{add.name}</span>
                            <span className="font-mono">+{formatPrice(addUSD, addIDR)}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-between items-center bg-neutral-950 p-4 rounded-2xl border border-neutral-850">
                      <div>
                        <span className="text-[9px] text-neutral-400 font-bold uppercase block font-mono">Total Payable</span>
                        <span className="text-xl font-black text-amber-500 font-mono">
                          {formatPrice(calculateFinalPrice().usd, calculateFinalPrice().idr)}
                        </span>
                      </div>
                      <span className="text-[8px] font-black bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono uppercase">
                        Final Tariff
                      </span>
                    </div>

                    <button
                      onClick={handleProceedToForm}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black py-4 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Lanjut Isi Data</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* SCREEN 5: DATA FORM ENTRY */}
          {currentScreen === 'form' && selectedVehicle && selectedProvider && (
            <motion.div
              key="form-screen"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
                <div>
                  <h2 className="text-xl font-black text-white">Contact &amp; Driver Details</h2>
                  <p className="text-xs text-neutral-400">Please provide verified contact information to process your reservation voucher.</p>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-6">
                  
                  {/* Lead passenger fields */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest font-mono">Lead Contact (Pemesan)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-neutral-400">Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Robert Smith"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-850 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-neutral-400">Email Address *</label>
                        <input
                          type="email"
                          required
                          placeholder="smith@domain.com"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-850 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-neutral-400">WhatsApp Phone *</label>
                        <input
                          type="tel"
                          required
                          placeholder="+62 812-3456-789"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-850 text-white rounded-xl px-4 py-3 text-sm focus:outline-none font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-neutral-400">Nationality</label>
                        <select
                          value={nationality}
                          onChange={(e) => setNationality(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-850 text-white rounded-xl px-4 py-3 text-sm font-semibold"
                        >
                          <option value="Indonesia">Indonesia</option>
                          <option value="Singapore">Singapore</option>
                          <option value="Malaysia">Malaysia</option>
                          <option value="Australia">Australia</option>
                          <option value="Other">Other / International</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Driver fields (Optional Separate) */}
                  <div className="space-y-4 border-t border-neutral-850 pt-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest font-mono">Driver Details (Pengemudi)</h3>
                      <div
                        onClick={() => setIsDriverSameAsContact(!isDriverSameAsContact)}
                        className="flex items-center gap-2 cursor-pointer text-xs font-bold"
                      >
                        <div className={`h-4.5 w-4.5 rounded border flex items-center justify-center ${isDriverSameAsContact ? 'bg-amber-500 border-amber-500 text-neutral-950' : 'border-neutral-600'}`}>
                          {isDriverSameAsContact && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                        </div>
                        <span className="text-neutral-300">Same as lead contact</span>
                      </div>
                    </div>

                    {!isDriverSameAsContact && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-neutral-400">Driver Full Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Sarah Smith"
                            value={driverName}
                            onChange={(e) => setDriverName(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-850 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-neutral-400">Driver WhatsApp Phone *</label>
                          <input
                            type="tel"
                            required
                            placeholder="+62 812-9876-543"
                            value={driverPhone}
                            onChange={(e) => setDriverPhone(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-850 text-white rounded-xl px-4 py-3 text-sm focus:outline-none font-mono"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Special notes */}
                  <div className="space-y-1.5 border-t border-neutral-850 pt-5">
                    <label className="block text-xs font-bold text-neutral-400">Additional Requests / Special Instructions</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Request baby seat installation, non-smoking cabin, early handover preferred..."
                      value={specialRequest}
                      onChange={(e) => setSpecialRequest(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-850 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                    />
                  </div>

                  {/* Smart Journey Terms accepted */}
                  <div
                    onClick={() => setPolicyAccepted(!policyAccepted)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                      policyAccepted
                        ? 'bg-amber-500/15 border-amber-500 text-white'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    <div className={`h-4.5 w-4.5 rounded border flex items-center justify-center ${policyAccepted ? 'bg-amber-500 border-amber-500 text-neutral-950' : 'border-neutral-600'}`}>
                      {policyAccepted && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                    </div>
                    <span className="text-xs font-bold">I agree to the Traveloka Car Rental Policies and Smart Journey Terms of Service.</span>
                  </div>

                  {/* Submission buttons */}
                  <div className="flex justify-between items-center pt-4 border-t border-neutral-850">
                    <button
                      type="button"
                      onClick={() => setCurrentScreen('details')}
                      className="text-neutral-400 hover:text-white flex items-center gap-1 text-xs font-bold font-mono transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back</span>
                    </button>

                    <button
                      type="submit"
                      className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black px-8 py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/10 cursor-pointer flex items-center gap-2"
                    >
                      <span>Review Booking Summary</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>

                </form>
              </div>
            </motion.div>
          )}

          {/* SCREEN 6: BOARDING PASS SUMMARY REVIEW */}
          {currentScreen === 'review' && selectedVehicle && selectedProvider && (
            <motion.div
              key="review-screen"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="max-w-2xl mx-auto space-y-6"
            >
              <div className="text-center space-y-1 mb-4">
                <h2 className="text-xl font-bold text-white uppercase tracking-wider">Review &amp; Pay Securely</h2>
                <p className="text-xs text-neutral-400">Review all details before redirecting to the payment sandbox portal.</p>
              </div>

              {/* Printable-style digital Boarding Pass Ticket */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl relative">
                
                {/* Tickets custom punched edges */}
                <div className="absolute -left-3 top-[250px] w-6 h-6 rounded-full bg-neutral-950 border border-neutral-800" />
                <div className="absolute -right-3 top-[250px] w-6 h-6 rounded-full bg-neutral-950 border border-neutral-800" />

                {/* Ticket header */}
                <div className="bg-neutral-950 p-6 border-b border-neutral-850 flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                      <ShieldCheck className="h-5 w-5" />
                    </span>
                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">Digital Voucher Card</h4>
                      <p className="text-[9px] text-neutral-500 uppercase font-bold font-mono">Traveloka Integration Node</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/35 px-3 py-1 rounded-full uppercase font-mono font-black tracking-widest">
                    VOUCHER
                  </span>
                </div>

                {/* Ticket Details */}
                <div className="p-6 sm:p-8 space-y-5 text-xs">
                  
                  {/* Service overview block */}
                  <div className="flex justify-between items-center bg-neutral-950/80 p-4 rounded-2xl border border-neutral-850">
                    <div>
                      <span className="text-[9px] text-neutral-500 uppercase font-black tracking-widest font-mono">CAR MODEL</span>
                      <p className="text-sm font-extrabold text-white">{selectedVehicle.name}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-neutral-500 uppercase font-black tracking-widest font-mono">SELECTED PROVIDER</span>
                      <p className="text-sm font-extrabold text-amber-500">{selectedProvider.name}</p>
                    </div>
                  </div>

                  {/* Main specs table */}
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6 border-b border-neutral-850 pb-5">
                    <div>
                      <span className="text-[10px] text-neutral-500 font-bold uppercase block">Kategori Mobil</span>
                      <span className="text-neutral-200 font-extrabold">{selectedVehicle.categoryName} Class</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 font-bold uppercase block">Durasi Sewa</span>
                      <span className="text-neutral-200 font-extrabold">{durationDays} Hari ({pickupDate} s/d {returnDate})</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 font-bold uppercase block">Lokasi Mulai Sewa</span>
                      <span className="text-neutral-200 font-extrabold">{pickupLocation} @ {pickupTime}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 font-bold uppercase block">Lokasi Tujuan Paling Jauh</span>
                      <span className="text-neutral-200 font-extrabold">{dropoffLocation}</span>
                    </div>
                    <div className="col-span-2 bg-neutral-950/50 p-3.5 rounded-xl border border-neutral-850/50">
                      <span className="text-[10px] text-neutral-500 font-bold uppercase block mb-1">Detail Alamat Penjemputan</span>
                      <span className="text-neutral-200 font-semibold block break-words whitespace-pre-wrap">{pickupDetail}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 font-bold uppercase block">Nama Kontak Pemesan</span>
                      <span className="text-neutral-200 font-extrabold">{customerName} ({nationality})</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 font-bold uppercase block">Detail Pengemudi</span>
                      <span className="text-neutral-200 font-extrabold">
                        {isDriverSameAsContact ? `${customerName} (Sama)` : `${driverName}`}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[10px] text-neutral-500 font-bold uppercase block">Status Verifikasi</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1.5 mt-0.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>Persyaratan dokumen verifikasi sewa telah disetujui</span>
                      </span>
                    </div>
                  </div>

                  {/* Addons detailed summary */}
                  {selectedAddOns.length > 0 && (
                    <div className="space-y-2 border-b border-neutral-850 pb-5">
                      <span className="text-[10px] text-neutral-500 font-bold uppercase block font-mono">Selected Add-ons</span>
                      <div className="grid grid-cols-1 gap-1.5">
                        {selectedAddOns.map(addId => {
                          const add = getDynamicAddons().find(a => a.id === addId);
                          if (!add) return null;
                          const addUSD = add.isPerDay ? add.priceUSD * durationDays : add.priceUSD;
                          const addIDR = add.isPerDay ? add.priceIDR * durationDays : add.priceIDR;
                          return (
                            <div key={addId} className="flex justify-between items-center text-xs text-neutral-300 bg-neutral-950 px-3.5 py-2 rounded-xl border border-neutral-850">
                              <span>{add.name}</span>
                              <span className="font-mono text-neutral-400">{formatPrice(addUSD, addIDR)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Detailed receipt breakdown */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] text-neutral-500 font-bold uppercase block font-mono">Invoice Pricing Breakdown</span>
                    <div className="flex justify-between text-xs text-neutral-400">
                      <span>Base Vehicle Daily Rental ({formatPrice(selectedProvider.priceUSD, selectedProvider.priceIDR)} x {durationDays} days)</span>
                      <span className="font-mono">{formatPrice(selectedProvider.priceUSD * durationDays, selectedProvider.priceIDR * durationDays)}</span>
                    </div>
                    {selectedAddOns.length > 0 && (
                      <div className="flex justify-between text-xs text-neutral-400">
                        <span>Optional Selected Add-ons Total</span>
                        <span className="font-mono">{formatPrice(calculateFinalPrice().addonsUSD, calculateFinalPrice().addonsIDR)}</span>
                      </div>
                    )}

                    <div className="h-px bg-neutral-800" />

                    <div className="flex justify-between items-center pt-2">
                      <div>
                        <span className="text-[10px] text-neutral-500 font-black uppercase block font-mono">Grand Total Payable</span>
                        <span className="text-2xl font-black text-amber-500 font-mono">
                          {formatPrice(calculateFinalPrice().usd, calculateFinalPrice().idr)}
                        </span>
                      </div>
                      <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl uppercase tracking-wider font-mono">
                        Secure Payment
                      </span>
                    </div>
                  </div>

                </div>

                {/* Confirm buttons */}
                <div className="bg-neutral-950 p-6 border-t border-neutral-850 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button
                    onClick={() => setCurrentScreen('form')}
                    className="text-neutral-400 hover:text-white flex items-center gap-1 text-xs font-bold font-mono transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to form</span>
                  </button>

                  <button
                    onClick={handleFinalBooking}
                    className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black px-10 py-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/15 flex items-center justify-center gap-2 cursor-pointer font-mono"
                  >
                    <span>Proceed to Pay</span>
                    <ArrowRight className="h-4 w-4 stroke-[3]" />
                  </button>
                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* REVIEWS COMPONENT INTEGRATED AT BOTTOM */}
        <CustomerReviewsSection 
          serviceType="rental" 
          serviceName="Car Rental (Sewa Mobil Lepas Kunci / Driver)" 
        />

      </div>

    </div>
  );
}
