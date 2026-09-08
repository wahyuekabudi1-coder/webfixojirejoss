import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, User, 
  MapPin, Phone, Mail, CheckCircle2, AlertTriangle, X, Check,
  DollarSign, ArrowRight, Star, HelpCircle, ClipboardList, Car, RefreshCw
} from 'lucide-react';
import { useApp } from '../../AppContext';
import { Booking } from '../../types';

export default function RentalBookingCalendar() {
  const { bookings, updateBookingStatus, formatPrice, triggerToast, serviceLimits } = useApp();

  // Selected date state (defaults to simulated date: July 13, 2026)
  const todaySimulated = new Date(2026, 6, 13); // July is 6 in JS Date (0-indexed)
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const stored = localStorage.getItem('smartjourney_selected_date');
    if (stored) {
      const parsed = new Date(stored);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return todaySimulated;
  });
  
  // Calendar viewport state
  const [currentMonth, setCurrentMonth] = useState<number>(() => {
    const stored = localStorage.getItem('smartjourney_selected_date');
    if (stored) {
      const parsed = new Date(stored);
      if (!isNaN(parsed.getTime())) return parsed.getMonth();
    }
    return 6; // July (0-indexed)
  });
  const [currentYear, setCurrentYear] = useState<number>(() => {
    const stored = localStorage.getItem('smartjourney_selected_date');
    if (stored) {
      const parsed = new Date(stored);
      if (!isNaN(parsed.getTime())) return parsed.getFullYear();
    }
    return 2026;
  });

  // Month names in Indonesian
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  // Helper: Get days in month
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Helper: Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

  // Generate calendar cells (grid)
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push(null); // empty padding cells
  }
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push(i);
  }

  // Navigate months
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

  const handleResetToToday = () => {
    setCurrentMonth(6);
    setCurrentYear(2026);
    setSelectedDate(todaySimulated);
    triggerToast('Kalender diatur ulang ke Juli 2026');
  };

  // Filter bookings of type 'rental'
  const rentalBookings = bookings.filter(b => b.type === 'rental');

  // Helper to format date object to YYYY-MM-DD
  const formatDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Helper: Calculate range of dates for a booking and check if dateStr falls in it
  const isBookingOnDate = (b: Booking, dateStr: string) => {
    const startStr = b.details?.date;
    if (!startStr) return false;

    const parts = startStr.split('-');
    if (parts.length !== 3) return false;

    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);

    const startDate = new Date(y, m, d);
    const days = b.details?.days || 1;

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + (days - 1));

    const ey = endDate.getFullYear();
    const em = String(endDate.getMonth() + 1).padStart(2, '0');
    const ed = String(endDate.getDate()).padStart(2, '0');
    const endStr = `${ey}-${em}-${ed}`;

    return dateStr >= startStr && dateStr <= endStr;
  };

  // Helper: Format a booking's end date for display
  const getBookingEndDateStr = (b: Booking) => {
    const startStr = b.details?.date;
    if (!startStr) return '--';

    const parts = startStr.split('-');
    if (parts.length !== 3) return startStr;

    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);

    const startDate = new Date(y, m, d);
    const days = b.details?.days || 1;

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + (days - 1));

    const ey = endDate.getFullYear();
    const em = String(endDate.getMonth() + 1).padStart(2, '0');
    const ed = String(endDate.getDate()).padStart(2, '0');
    return `${ey}-${em}-${ed}`;
  };

  // Get rental bookings active on a specific day string (YYYY-MM-DD)
  const getBookingsForDate = (dateStr: string) => {
    return rentalBookings.filter(b => isBookingOnDate(b, dateStr));
  };

  const selectedDateStr = formatDateString(selectedDate);
  const selectedDateBookings = getBookingsForDate(selectedDateStr);

  // Stats for the current viewed month
  const viewedMonthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  
  const isBookingInViewedMonth = (b: Booking) => {
    const startStr = b.details?.date;
    if (!startStr) return false;

    const parts = startStr.split('-');
    if (parts.length !== 3) return false;

    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);

    const startDate = new Date(y, m, d);
    const days = b.details?.days || 1;

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + (days - 1));

    const startMonthStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
    const endMonthStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}`;

    return startMonthStr === viewedMonthStr || endMonthStr === viewedMonthStr;
  };

  const monthlyBookings = rentalBookings.filter(isBookingInViewedMonth);
  const monthlyEarningsUSD = monthlyBookings
    .filter(b => b.status === 'Completed' || b.status === 'Confirmed')
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const monthlyEarningsIDR = monthlyBookings
    .filter(b => b.status === 'Completed' || b.status === 'Confirmed')
    .reduce((sum, b) => sum + (b.totalPriceIDR || 0), 0);

  const pendingCount = monthlyBookings.filter(b => b.status === 'Pending').length;
  const confirmedCount = monthlyBookings.filter(b => b.status === 'Confirmed').length;
  const completedCount = monthlyBookings.filter(b => b.status === 'Completed').length;

  return (
    <div className="space-y-6 text-left">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-850 pb-5">
        <div>
          <h2 className="text-lg font-black text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-amber-500" />
            <span>KALENDER JADWAL SEWA MOBIL (RENTAL)</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1 leading-relaxed max-w-2xl">
            Sistem pemantauan ketersediaan armada terintegrasi. Pilih tanggal pada kalender untuk memeriksa status sewa harian,
            durasi pinjam, rincian add-on supir/BBM, serta memverifikasi dispatch kendaraan secara real-time.
          </p>
        </div>
        
        <button
          onClick={handleResetToToday}
          className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-amber-500 border border-amber-500/20 hover:border-amber-500/40 text-xs font-black rounded-xl cursor-pointer transition-all uppercase tracking-wider font-mono flex items-center gap-1.5 self-start md:self-center"
        >
          <Clock className="h-4 w-4" />
          <span>Hari Ini (13 Jul 2026)</span>
        </button>
      </div>

      {/* Monthly Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-neutral-900/60 border border-neutral-850 p-4 rounded-2xl">
          <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider font-mono block">TOTAL BOOKING ({monthNames[currentMonth]})</span>
          <span className="text-xl font-black text-white font-mono mt-1.5 block">{monthlyBookings.length} Rental</span>
        </div>
        <div className="bg-neutral-900/60 border border-neutral-850 p-4 rounded-2xl">
          <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider font-mono block">PENDING DISPATCH</span>
          <span className="text-xl font-black text-amber-500 font-mono mt-1.5 block">{pendingCount} Unit</span>
        </div>
        <div className="bg-neutral-900/60 border border-neutral-850 p-4 rounded-2xl">
          <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider font-mono block">AKTIF / DISPINJAM</span>
          <span className="text-xl font-black text-emerald-400 font-mono mt-1.5 block">{confirmedCount} Unit</span>
        </div>
        <div className="bg-neutral-900/60 border border-neutral-850 p-4 rounded-2xl">
          <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider font-mono block">SELESAI KONTRAK</span>
          <span className="text-xl font-black text-indigo-400 font-mono mt-1.5 block">{completedCount} Selesai</span>
        </div>
        <div className="bg-neutral-900/60 border border-neutral-850 p-4 rounded-2xl col-span-2 lg:col-span-1">
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider font-mono block">ESTIMASI OMSET</span>
          <span className="text-sm font-black text-white font-mono mt-1.5 block text-amber-500">
            {formatPrice(monthlyEarningsUSD, monthlyEarningsIDR)}
          </span>
        </div>
      </div>

      {/* Calendar and Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: THE MONTHLY CALENDAR GRID */}
        <div className="lg:col-span-7 bg-neutral-900/40 border border-neutral-850 rounded-2xl p-6 space-y-5">
          {/* Calendar Month Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-neutral-100 uppercase tracking-widest font-mono flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-amber-500" />
              <span>{monthNames[currentMonth]} {currentYear}</span>
            </h3>
            
            <div className="flex items-center gap-1.5">
              <button 
                onClick={handlePrevMonth}
                className="p-2 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg border border-neutral-800 transition-all cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-2 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg border border-neutral-800 transition-all cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {/* Days of Week Headers */}
            {daysOfWeek.map((day, idx) => (
              <div 
                key={day} 
                className={`text-[10px] font-black uppercase tracking-wider py-2 font-mono ${
                  idx === 0 ? 'text-rose-500' : 'text-neutral-500'
                }`}
              >
                {day}
              </div>
            ))}

            {/* Day Cells */}
            {cells.map((dayNum, idx) => {
              if (dayNum === null) {
                return <div key={`empty-${idx}`} className="aspect-square bg-transparent rounded-xl" />;
              }

              const cellDate = new Date(currentYear, currentMonth, dayNum);
              const cellDateStr = formatDateString(cellDate);
              const cellBookings = getBookingsForDate(cellDateStr);
              const hasBookings = cellBookings.length > 0;
              const isCellSelected = cellDateStr === selectedDateStr;
              const isToday = cellDateStr === '2026-07-13'; // July 13, 2026 (Simulated date)

              // Determine color themes for active dates
              let cellBg = 'bg-neutral-950/40 border border-neutral-850/60 hover:bg-neutral-850 hover:border-neutral-750';
              let textColor = 'text-neutral-300';

              if (isCellSelected) {
                cellBg = 'bg-amber-500/20 border-2 border-amber-500 shadow-md shadow-amber-500/5';
                textColor = 'text-amber-400 font-extrabold';
              } else if (isToday) {
                cellBg = 'bg-neutral-950 border border-amber-500/40 hover:bg-neutral-800';
                textColor = 'text-white font-extrabold ring-1 ring-amber-500/25 rounded-xl';
              } else if (hasBookings) {
                cellBg = 'bg-amber-500/[0.03] border border-amber-500/20 hover:bg-amber-500/[0.08] hover:border-amber-500/40';
                textColor = 'text-neutral-100 font-bold';
              }

              return (
                <button
                  key={`day-${dayNum}`}
                  id={`day-cell-${dayNum}`}
                  onClick={() => {
                    setSelectedDate(cellDate);
                    triggerToast(`Menampilkan sewa mobil tanggal: ${dayNum} ${monthNames[currentMonth]} ${currentYear}`);
                  }}
                  className={`aspect-square p-2 rounded-xl flex flex-col justify-between items-center transition-all cursor-pointer relative ${cellBg}`}
                >
                  {/* Day Number and Marker */}
                  <div className="w-full flex justify-between items-start">
                    <span className={`text-[11px] font-mono ${textColor}`}>
                      {dayNum}
                    </span>
                    {isToday && (
                      <span className="text-[8px] bg-amber-500 text-neutral-950 font-black px-1 py-0.2 rounded scale-90 font-mono tracking-tighter">
                        TDY
                      </span>
                    )}
                  </div>

                  {/* Booking count/capacity badge inside grid cell */}
                  {(() => {
                    const limit = serviceLimits?.rental ?? 5;
                    const available = Math.max(0, limit - cellBookings.length);
                    return (
                      <div className="w-full text-center mt-1">
                        <span className={`text-[7.5px] font-mono font-black tracking-tight px-1 py-0.5 rounded inline-flex items-center gap-0.5 max-w-full truncate ${
                          available === 0
                            ? 'bg-rose-500/10 text-rose-500 font-extrabold'
                            : cellBookings.some(b => b.status === 'Pending')
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {available}/{limit} Avail
                        </span>
                      </div>
                    );
                  })()}
                </button>
              );
            })}
          </div>

          {/* Quick Info Guide */}
          <div className="flex flex-wrap items-center gap-4 text-[10px] text-neutral-400 bg-neutral-950/40 p-3 rounded-xl border border-neutral-850">
            <span className="font-mono text-neutral-500 font-bold uppercase">Keterangan:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-neutral-950 border border-neutral-800"></span>
              <span>Kamar Kosong / Siaga</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-500/5 border border-amber-500/30"></span>
              <span>Terisi Booking</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-500/20 border border-amber-500"></span>
              <span>Tanggal Dipilih</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-transparent border border-amber-500"></span>
              <span>Hari Ini</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: BOOKINGS LIST ON THE SELECTED DATE */}
        <div className="lg:col-span-5 bg-neutral-900/40 border border-neutral-850 rounded-2xl p-6 space-y-4 flex flex-col h-full">
          {/* Header of selected day list */}
          <div className="border-b border-neutral-850 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider font-mono text-amber-500">
                JADWAL AKTIVITAS KONTRAK RENTAL
              </h3>
              <span className="text-xs font-bold text-neutral-200 mt-1 block">
                {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
              </span>
            </div>
            
            <span className="text-[10px] font-mono bg-neutral-950 px-2.5 py-1 rounded-full text-neutral-400 border border-neutral-850">
              {selectedDateBookings.length} Armada
            </span>
          </div>

          {/* List Section */}
          <div className="space-y-4 flex-1 overflow-y-auto max-h-[450px] pr-1.5 no-scrollbar">
            {selectedDateBookings.length > 0 ? (
              selectedDateBookings.map((b) => {
                const details = b.details || {};
                const start = details.date || '--';
                const end = getBookingEndDateStr(b);
                
                // Status styles
                const statusStyles = {
                  Pending: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
                  Confirmed: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
                  Completed: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
                  Cancelled: 'bg-rose-500/10 text-rose-500 border border-rose-500/20',
                  Refunded: 'bg-neutral-800 text-neutral-400 border border-neutral-750'
                };

                return (
                  <div 
                    key={b.id} 
                    id={`rental-card-${b.id}`}
                    className="bg-neutral-950 border border-neutral-850 hover:border-neutral-750 p-5 rounded-2xl space-y-4 transition-all"
                  >
                    {/* Booking metadata */}
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] text-neutral-500 font-mono font-bold block">{b.id}</span>
                        <span className="text-[10px] font-mono text-amber-500 flex items-center gap-1.5 mt-0.5">
                          <Car className="h-3.5 w-3.5 text-amber-500" />
                          <span>Unit: {details.vehicleName || 'Toyota Avanza'}</span>
                        </span>
                      </div>

                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full font-mono ${
                        statusStyles[b.status] || statusStyles.Pending
                      }`}>
                        {b.status === 'Confirmed' ? 'DIPINJAM' : b.status === 'Completed' ? 'KEMBALI' : b.status}
                      </span>
                    </div>

                    {/* Rental Period */}
                    <div className="bg-neutral-900/60 p-3 rounded-xl border border-neutral-850/60 text-xs space-y-1.5">
                      <div className="flex justify-between text-neutral-400 font-mono text-[10px]">
                        <span>DURASI SEWA:</span>
                        <span className="font-bold text-amber-500">{details.days || 1} HARI</span>
                      </div>
                      <div className="flex justify-between items-center text-neutral-200 font-bold">
                        <span>{start}</span>
                        <ArrowRight className="h-3 w-3 text-neutral-500" />
                        <span>{end}</span>
                      </div>
                    </div>

                    {/* Locations */}
                    <div className="space-y-2 bg-neutral-900/30 p-3 rounded-xl border border-neutral-850/40 text-xs">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[9px] text-neutral-500 font-bold block uppercase tracking-wider font-mono">Lokasi Ambil ({details.pickupZone || 'Zone 0'}):</span>
                          <span className="text-neutral-200 font-medium leading-tight">{details.pickupLocation}</span>
                        </div>
                      </div>
                      
                      <div className="h-2 border-l border-dashed border-neutral-700 ml-1.5"></div>

                      <div className="flex items-start gap-2">
                        <MapPin className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[9px] text-neutral-500 font-bold block uppercase tracking-wider font-mono">Lokasi Kembali ({details.dropoffZone || 'Zone 0'}):</span>
                          <span className="text-neutral-200 font-medium leading-tight">{details.destination}</span>
                        </div>
                      </div>
                    </div>

                    {/* Selected Addons */}
                    {details.selectedAddons && details.selectedAddons.length > 0 && (
                      <div className="border-t border-neutral-850 pt-3">
                        <span className="text-[9px] text-neutral-500 font-bold block uppercase tracking-wider font-mono mb-1.5">ADDON SERVICES:</span>
                        <div className="flex flex-wrap gap-1">
                          {details.selectedAddons.map((add: string, idx: number) => (
                            <span key={idx} className="bg-neutral-900 border border-neutral-800 text-[10px] px-2 py-0.5 rounded text-neutral-300 font-sans">
                              ✨ {add}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Customer Details */}
                    <div className="space-y-1.5 border-t border-neutral-850 pt-3 text-xs text-left">
                      <div className="flex items-center gap-2 text-neutral-300">
                        <User className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                        <span className="font-extrabold">{b.customerName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
                        <Mail className="h-3 w-3 text-neutral-600 shrink-0" />
                        <span className="font-mono truncate">{b.customerEmail}</span>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
                        <Phone className="h-3 w-3 text-neutral-600 shrink-0" />
                        <span className="font-mono">{b.customerPhone}</span>
                      </div>
                    </div>

                    {/* Price details */}
                    <div className="flex justify-between items-center border-t border-neutral-850 pt-3 text-xs">
                      <div>
                        <span className="text-[9px] text-neutral-500 block uppercase font-mono">WILAYAH OPERASI</span>
                        <span className="text-neutral-200 font-bold mt-0.5 block">{details.operationalCity || 'Bali'}</span>
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] text-neutral-500 block uppercase font-mono">TOTAL NILAI KONTRAK</span>
                        <span className="text-xs font-black text-amber-500 font-mono mt-0.5 block">
                          {formatPrice(b.totalPrice, b.totalPriceIDR)}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons based on status */}
                    <div className="border-t border-neutral-850 pt-3 flex gap-2">
                      {b.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => {
                              updateBookingStatus(b.id, 'Confirmed', 'Paid');
                              triggerToast(`Rental Booking ${b.id} telah disetujui (Status: Confirmed, Pembayaran: Paid)`);
                            }}
                            id={`approve-btn-${b.id}`}
                            className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-black text-[10px] uppercase font-mono tracking-wider rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Check className="h-3.5 w-3.5 stroke-[3]" />
                            <span>Setujui</span>
                          </button>
                          <button
                            onClick={() => {
                              updateBookingStatus(b.id, 'Cancelled');
                              triggerToast(`Rental Booking ${b.id} telah dibatalkan.`);
                            }}
                            id={`cancel-btn-${b.id}`}
                            className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold text-[10px] uppercase font-mono tracking-wider rounded-lg transition-all cursor-pointer"
                          >
                            Tolak
                          </button>
                        </>
                      )}

                      {b.status === 'Confirmed' && (
                        <>
                          <button
                            onClick={() => {
                              updateBookingStatus(b.id, 'Completed');
                              triggerToast(`Order Rental ${b.id} ditandai selesai. Armada telah kembali ke pool dengan aman.`);
                            }}
                            id={`complete-btn-${b.id}`}
                            className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black text-[10px] uppercase font-mono tracking-wider rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Selesaikan Sewa (Kembali)</span>
                          </button>
                          <button
                            onClick={() => {
                              updateBookingStatus(b.id, 'Cancelled');
                              triggerToast(`Rental Booking ${b.id} telah dibatalkan.`);
                            }}
                            id={`cancel-btn-${b.id}`}
                            className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold text-[10px] uppercase font-mono tracking-wider rounded-lg transition-all cursor-pointer"
                          >
                            Batalkan
                          </button>
                        </>
                      )}

                      {b.status === 'Completed' && (
                        <div className="w-full text-center py-1.5 bg-neutral-900 border border-neutral-850 text-neutral-500 text-[10px] font-mono font-bold rounded-lg flex items-center justify-center gap-1">
                          <Check className="h-3.5 w-3.5 text-neutral-500 stroke-[2.5]" />
                          <span>ARMADA KEMBALI & TRANSAKSI SELESAI</span>
                        </div>
                      )}

                      {b.status === 'Cancelled' && (
                        <div className="w-full text-center py-1.5 bg-neutral-900/50 text-rose-500/50 text-[10px] font-mono font-bold rounded-lg border border-rose-500/10">
                          SELLER / USER CANCELLED
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4 border-2 border-dashed border-neutral-800 rounded-2xl bg-neutral-950/20">
                <CalendarIcon className="h-8 w-8 text-neutral-600 mb-3" />
                <h4 className="text-xs font-extrabold text-neutral-400">Tidak Ada Armada yang Disewa</h4>
                <p className="text-[11px] text-neutral-500 mt-1 max-w-xs leading-relaxed">
                  Belum ada kendaraan yang aktif disewa atau dijadwalkan pada tanggal {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
