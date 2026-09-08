import React from 'react';
import { 
  DollarSign, ClipboardList, Layers, Users, TrendingUp, AlertCircle, 
  CheckCircle, Globe, RefreshCw, LogOut, Activity, ArrowRight, Truck, MapPin 
} from 'lucide-react';
import { Booking, Tour } from '../../types';
import { AdminTab } from './Sidebar';

interface DashboardViewProps {
  bookings: Booking[];
  tours: Tour[];
  logs: any[];
  onCardClick: (tab: AdminTab) => void;
  formatPrice: (usd: number, idr: number) => string;
  onSimulateInquiry: () => void;
  onExit: () => void;
  role?: 'central' | 'tour' | 'rental' | 'taxi' | 'airport';
  isDark?: boolean;
}

export default function DashboardView({
  bookings,
  tours,
  logs,
  onCardClick,
  formatPrice,
  onSimulateInquiry,
  onExit,
  role = 'central',
  isDark = false
}: DashboardViewProps) {

  // Filter bookings and logs to display only current role context
  const filteredBookings = bookings.filter(b => {
    if (role === 'central') return true;
    return b.type === role;
  });

  const filteredLogs = logs.filter(l => {
    if (role === 'central') return true;
    if (l.type) return l.type === role;
    
    const ev = (l.event || '').toLowerCase();
    if (role === 'tour' && (ev.includes('tour') || ev.includes('wisata') || ev.includes('bromo') || ev.includes('katalog'))) return true;
    if (role === 'rental' && (ev.includes('rental') || ev.includes('sewa') || ev.includes('mobil') || ev.includes('fleet'))) return true;
    if (role === 'taxi' && (ev.includes('taxi') || ev.includes('taksi') || ev.includes('rute'))) return true;
    if (role === 'airport' && (ev.includes('airport') || ev.includes('bandara') || ev.includes('jemput'))) return true;
    return false;
  });

  // Only display logs belonging to this role context. Do not fall back to avoid mixing/leaking.
  const displayLogs = filteredLogs;

  // Computations based on filtered data
  const totalRevenueUSD = filteredBookings
    .filter(b => b.status === 'Confirmed' || b.status === 'Completed')
    .reduce((acc, b) => acc + (b.totalPrice || 0), 0);

  const totalRevenueIDR = filteredBookings
    .filter(b => b.status === 'Confirmed' || b.status === 'Completed')
    .reduce((acc, b) => acc + (b.totalPriceIDR || 0), 0);

  const pendingCount = filteredBookings.filter(b => b.status === 'Pending').length;
  const tourCount = bookings.filter(b => b.type === 'tour').length;
  const rentalCount = bookings.filter(b => b.type === 'rental').length;
  const taxiCount = bookings.filter(b => b.type === 'taxi').length;
  const airportCount = bookings.filter(b => b.type === 'airport').length;

  // Custom metadata based on role
  const roleMeta = {
    central: {
      title: 'Portal Koordinator Pusat (Central Manager Hub)',
      desc: 'Pusat komando utama Smart Journey. Pantau seluruh aktivitas 4 divisi operasional, kelola inventori global, database supir & armada, serta otorisasi keuangan ledger gabungan.',
      badge: 'SUPER ADMIN'
    },
    tour: {
      title: 'Portal Operasional Manajemen Tur (Tour Ops Desk)',
      desc: 'Fokus koordinasi paket petualangan, kalender surcharge puncak, penugasan pemandu wisata, rincian peserta trip, serta audit konversi pesanan paket liburan.',
      badge: 'COORDINATOR TUR'
    },
    rental: {
      title: 'Portal Layanan Sewa Mobil (Car Rental Dispatch)',
      desc: 'Fokus manajemen penyewaan armada dengan supir (chauffeur), pengaturan jadwal siaga armada supir lapangan, ketersediaan unit mobil, serta koordinasi sewa harian.',
      badge: 'DISPATCHER RENTAL'
    },
    taxi: {
      title: 'Portal Layanan Taksi Point-to-Point',
      desc: 'Fokus pemantauan jalur taksi antar-kota fixed-price, penyesuaian tarif per kilometer, penugasan supir taksi point-to-point, serta monitoring log pesanan harian.',
      badge: 'DISPATCHER TAKSI'
    },
    airport: {
      title: 'Portal Penjemputan Bandara (Airport Transfer Desk)',
      desc: 'Fokus monitoring transfer bandara, verifikasi nomor penerbangan (flight number), koordinasi jam kedatangan / keberangkatan, serta penempatan supir bandara.',
      badge: 'AIRPORT TRANSFER OFFICER'
    }
  }[role] || {
    title: 'Portal Smart Journey',
    desc: 'Sistem operasional dan koordinasi Smart Journey.',
    badge: 'STAF OPERASI'
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className={`${
        isDark 
          ? 'bg-neutral-900 border-neutral-800' 
          : 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-white border-neutral-200 shadow-sm'
      } border rounded-3xl p-6 relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
          <div className="space-y-2.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono font-black bg-amber-500 text-neutral-950 px-2 py-0.5 rounded-md uppercase tracking-wider">
                {roleMeta.badge}
              </span>
              <span className={`text-[9px] font-mono font-black ${
                isDark ? 'bg-neutral-950 text-neutral-400 border-neutral-800' : 'bg-white text-neutral-600 border-neutral-200 shadow-xs'
              } border px-2 py-0.5 rounded-md`}>
                ROLE: {role.toUpperCase()}
              </span>
            </div>
            <h2 className={`text-xl font-black ${isDark ? 'text-neutral-100' : 'text-neutral-900'} tracking-tight`}>{roleMeta.title}</h2>
            <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-600'} font-medium leading-relaxed`}>
              {roleMeta.desc}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={onSimulateInquiry}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-neutral-950 font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all transform active:scale-95 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Simulasikan Booking Baru</span>
            </button>
            <button 
              onClick={onExit}
              className={`flex items-center gap-1.5 border ${
                isDark 
                  ? 'border-neutral-850 hover:border-neutral-700 hover:bg-neutral-800 text-neutral-400' 
                  : 'border-neutral-200 hover:border-neutral-300 hover:bg-white text-neutral-600 shadow-xs'
              } font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all cursor-pointer`}
            >
              <span>Situs Utama</span>
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue OR Role Specific Card */}
        {role === 'central' ? (
          <button
            onClick={() => onCardClick('finance')}
            className={`${
              isDark 
                ? 'bg-neutral-900/60 border-neutral-800 hover:border-amber-500/30 hover:bg-neutral-900' 
                : 'bg-white border-neutral-200/80 hover:border-amber-500/40 hover:shadow-md shadow-xs'
            } border p-5 rounded-2xl transition-all text-left group flex flex-col justify-between cursor-pointer min-h-[145px]`}
          >
            <div className="flex justify-between items-start w-full">
              <span className={`text-[10px] font-bold ${isDark ? 'text-neutral-400' : 'text-neutral-500'} uppercase tracking-wider block`}>Pendapatan Terbayar</span>
              <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-600 group-hover:scale-110 transition-transform">
                <DollarSign className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="space-y-1 mt-3">
              <h3 className={`text-2xl font-black tracking-tight ${isDark ? 'text-neutral-100' : 'text-neutral-900'}`}>${totalRevenueUSD.toLocaleString()}</h3>
              <p className="text-[10px] font-bold text-neutral-500">IDR {totalRevenueIDR >= 1000000 ? `${(totalRevenueIDR / 1000000).toFixed(1)}M` : totalRevenueIDR.toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-1 text-[9px] text-emerald-600 font-bold mt-2 font-mono">
              <TrendingUp className="h-3 w-3" />
              <span>+24.8% vs last week</span>
            </div>
          </button>
        ) : (
          <button
            onClick={() => onCardClick(role === 'tour' ? 'guides' : 'vehicles')}
            className={`${
              isDark 
                ? 'bg-neutral-900/60 border-neutral-800 hover:border-amber-500/30 hover:bg-neutral-900' 
                : 'bg-white border-neutral-200/80 hover:border-amber-500/40 hover:shadow-md shadow-xs'
            } border p-5 rounded-2xl transition-all text-left group flex flex-col justify-between cursor-pointer min-h-[145px]`}
          >
            <div className="flex justify-between items-start w-full">
              <span className={`text-[10px] font-bold ${isDark ? 'text-neutral-400' : 'text-neutral-500'} uppercase tracking-wider block`}>
                {role === 'tour' ? 'Pemandu Wisata' : 'Armada Operasional'}
              </span>
              <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-600 group-hover:scale-110 transition-transform">
                {role === 'tour' ? <Users className="h-4.5 w-4.5" /> : <Truck className="h-4.5 w-4.5" />}
              </div>
            </div>
            <div className="space-y-1 mt-3">
              <h3 className={`text-2xl font-black tracking-tight ${isDark ? 'text-neutral-100' : 'text-neutral-900'}`}>
                {role === 'tour' ? '3 Pemandu Aktif' : role === 'rental' ? '7 Unit Mobil' : role === 'taxi' ? '4 Unit Taksi' : '3 Unit Bandara'}
              </h3>
              <p className="text-[10px] font-semibold text-neutral-500">
                {role === 'tour' ? 'Berlisensi HPI & Ramah' : 'Kondisi Prima & Bersih'}
              </p>
            </div>
            <div className="flex items-center gap-1 text-[9px] text-emerald-600 font-bold mt-2 font-mono">
              <CheckCircle className="h-3 w-3" />
              <span>Status: Siap Jalan</span>
            </div>
          </button>
        )}

        {/* Pending Bookings */}
        <button
          onClick={() => onCardClick('bookings')}
          className={`${
            isDark 
              ? 'bg-neutral-900/60 border-neutral-800 hover:border-amber-500/30 hover:bg-neutral-900' 
              : 'bg-white border-neutral-200/80 hover:border-amber-500/40 hover:shadow-md shadow-xs'
          } border p-5 rounded-2xl transition-all text-left group flex flex-col justify-between cursor-pointer min-h-[145px]`}
        >
          <div className="flex justify-between items-start w-full">
            <span className={`text-[10px] font-bold ${isDark ? 'text-neutral-400' : 'text-neutral-500'} uppercase tracking-wider block`}>Booking Baru</span>
            <div className={`p-1.5 rounded-xl bg-orange-500/10 text-orange-600 ${pendingCount > 0 ? 'animate-bounce' : ''} group-hover:scale-110 transition-transform`}>
              <ClipboardList className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="space-y-1 mt-3">
            <h3 className={`text-2xl font-black tracking-tight ${isDark ? 'text-neutral-100' : 'text-neutral-900'}`}>{pendingCount} Booking</h3>
            <p className="text-[10px] font-semibold text-neutral-500">Menunggu konfirmasi driver</p>
          </div>
          <div className="flex items-center gap-1 text-[9px] text-orange-600 font-bold mt-2 font-mono">
            <AlertCircle className="h-3 w-3" />
            <span>Tindakan manual diperlukan</span>
          </div>
        </button>

        {/* Active Inventory */}
        <button
          onClick={() => onCardClick(role === 'tour' ? 'tours' : role === 'rental' ? 'rental' : role === 'taxi' ? 'taxi' : 'airport')}
          className={`${
            isDark 
              ? 'bg-neutral-900/60 border-neutral-800 hover:border-amber-500/30 hover:bg-neutral-900' 
              : 'bg-white border-neutral-200/80 hover:border-amber-500/40 hover:shadow-md shadow-xs'
          } border p-5 rounded-2xl transition-all text-left group flex flex-col justify-between cursor-pointer min-h-[145px]`}
        >
          <div className="flex justify-between items-start w-full">
            <span className={`text-[10px] font-bold ${isDark ? 'text-neutral-400' : 'text-neutral-500'} uppercase tracking-wider block`}>
              {role === 'tour' ? 'Katalog Paket Tur' : role === 'rental' ? 'Sewa Chauffeur' : role === 'taxi' ? 'Layanan Taksi' : 'Transfer Bandara'}
            </span>
            <div className="p-1.5 rounded-xl bg-teal-500/10 text-teal-600 group-hover:scale-110 transition-transform">
              {role === 'tour' ? <Layers className="h-4.5 w-4.5" /> : role === 'taxi' ? <MapPin className="h-4.5 w-4.5" /> : <Truck className="h-4.5 w-4.5" />}
            </div>
          </div>
          <div className="space-y-1 mt-3">
            <h3 className={`text-2xl font-black tracking-tight ${isDark ? 'text-neutral-100' : 'text-neutral-900'}`}>
              {role === 'tour' ? `${tours.length} Paket Aktif` : role === 'rental' ? 'Chauffeur Desk' : role === 'taxi' ? 'Point-to-Point' : 'Airport Desk'}
            </h3>
            <p className="text-[10px] font-semibold text-neutral-500">Katalog terpublikasi online</p>
          </div>
          <div className="flex items-center gap-1 text-[9px] text-teal-600 font-bold mt-2 font-mono">
            <CheckCircle className="h-3 w-3" />
            <span>Semua rute sinkron</span>
          </div>
        </button>

        {/* Database Drivers */}
        <button
          onClick={() => onCardClick('drivers' as any)}
          className={`${
            isDark 
              ? 'bg-neutral-900/60 border-neutral-800 hover:border-amber-500/30 hover:bg-neutral-900' 
              : 'bg-white border-neutral-200/80 hover:border-amber-500/40 hover:shadow-md shadow-xs'
          } border p-5 rounded-2xl transition-all text-left group flex flex-col justify-between cursor-pointer min-h-[145px]`}
        >
          <div className="flex justify-between items-start w-full">
            <span className={`text-[10px] font-bold ${isDark ? 'text-neutral-400' : 'text-neutral-500'} uppercase tracking-wider block`}>Supir On Duty</span>
            <div className="p-1.5 rounded-xl bg-blue-500/10 text-blue-600 group-hover:scale-110 transition-transform">
              <Users className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="space-y-1 mt-3">
            <h3 className={`text-2xl font-black tracking-tight ${isDark ? 'text-neutral-100' : 'text-neutral-900'}`}>5 Supir Siaga</h3>
            <p className="text-[10px] font-semibold text-neutral-500">Mendukung sewa &amp; tour</p>
          </div>
          <div className="flex items-center gap-1 text-[9px] text-blue-600 font-bold mt-2 font-mono">
            <Globe className="h-3 w-3" />
            <span>Online 24 jam</span>
          </div>
        </button>
      </div>

      {/* SERVICE TYPE METRICS SUB-STATS ROW */}
      {role === 'central' ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-4 ${isDark ? 'bg-neutral-900/40 border-neutral-850' : 'bg-white border-neutral-200/80 shadow-xs'} border rounded-xl space-y-1 text-center`}>
            <span className="text-[10px] font-extrabold text-neutral-500 block uppercase font-mono">Total Tour</span>
            <span className="text-base font-black text-amber-600">{tourCount} Trips</span>
          </div>
          <div className={`p-4 ${isDark ? 'bg-neutral-900/40 border-neutral-850' : 'bg-white border-neutral-200/80 shadow-xs'} border rounded-xl space-y-1 text-center`}>
            <span className="text-[10px] font-extrabold text-neutral-500 block uppercase font-mono">Total Rental</span>
            <span className="text-base font-black text-amber-600">{rentalCount} Hari</span>
          </div>
          <div className={`p-4 ${isDark ? 'bg-neutral-900/40 border-neutral-850' : 'bg-white border-neutral-200/80 shadow-xs'} border rounded-xl space-y-1 text-center`}>
            <span className="text-[10px] font-extrabold text-neutral-500 block uppercase font-mono">Fixed-Route Taxi</span>
            <span className="text-base font-black text-amber-600">{taxiCount} Jalur</span>
          </div>
          <div className={`p-4 ${isDark ? 'bg-neutral-900/40 border-neutral-850' : 'bg-white border-neutral-200/80 shadow-xs'} border rounded-xl space-y-1 text-center`}>
            <span className="text-[10px] font-extrabold text-neutral-500 block uppercase font-mono">Airport Transfer</span>
            <span className="text-base font-black text-amber-600">{airportCount} Penjemputan</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 ${isDark ? 'bg-neutral-900/40 border-neutral-850' : 'bg-white border-neutral-200/80 shadow-xs'} border rounded-xl space-y-1`}>
            <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block font-mono">STATUS DEPARTEMEN</span>
            <span className="text-xs font-black text-emerald-600 uppercase">● AKTIF &amp; SINKRON</span>
          </div>
          <div className={`p-4 ${isDark ? 'bg-neutral-900/40 border-neutral-850' : 'bg-white border-neutral-200/80 shadow-xs'} border rounded-xl space-y-1`}>
            <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block font-mono">VOLUME TRANSAKSI AKTIF</span>
            <span className={`text-xs font-black ${isDark ? 'text-neutral-300' : 'text-neutral-800'} font-mono`}>
              {filteredBookings.length} Pesanan Diproses
            </span>
          </div>
          <div className={`p-4 ${isDark ? 'bg-neutral-900/40 border-neutral-850' : 'bg-white border-neutral-200/80 shadow-xs'} border rounded-xl space-y-1`}>
            <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block font-mono">HAK AKSES OPERASIONAL</span>
            <span className="text-xs font-black text-amber-600 uppercase font-mono">
              BATASAN: PEMBUATAN &amp; MANAJEMEN SAJA
            </span>
          </div>
        </div>
      )}

      {/* VISUAL CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        {role === 'central' && (
          <div className={`lg:col-span-2 ${isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200/80 shadow-xs'} border rounded-2xl p-6`}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className={`font-extrabold text-sm uppercase tracking-wider ${isDark ? 'text-neutral-300' : 'text-neutral-900'}`}>Grafik Penjualan Harian</h4>
              <p className="text-[11px] text-neutral-500">Statistik konversi booking yang diproses seminggu terakhir</p>
            </div>
            <span className={`text-[9px] font-mono font-bold ${isDark ? 'bg-neutral-950 border-neutral-800 text-amber-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-700'} border px-2 py-1 rounded`}>LIVE SYNCED</span>
          </div>
          
          <div className="relative h-60 w-full flex items-end">
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 500 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D97706" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#D97706" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              
              <line x1="0" y1="50" x2="500" y2="50" stroke={isDark ? "#262626" : "#e5e7eb"} strokeDasharray="4" />
              <line x1="0" y1="100" x2="500" y2="100" stroke={isDark ? "#262626" : "#e5e7eb"} strokeDasharray="4" />
              <line x1="0" y1="150" x2="500" y2="150" stroke={isDark ? "#262626" : "#e5e7eb"} strokeDasharray="4" />
              
              <path 
                d="M 10 180 Q 80 130 150 160 T 300 80 T 420 110 T 490 50 L 490 200 L 10 200 Z" 
                fill="url(#salesGrad)" 
              />
              <path 
                d="M 10 180 Q 80 130 150 160 T 300 80 T 420 110 T 490 50" 
                fill="none" 
                stroke="#D97706" 
                strokeWidth="3" 
                strokeLinecap="round"
              />
              
              <circle cx="150" cy="160" r="4" fill="#F59E0B" />
              <circle cx="300" cy="80" r="4" fill="#F59E0B" />
              <circle cx="490" cy="50" r="4" fill="#F59E0B" />
            </svg>
            
            <div className={`absolute inset-x-0 bottom-0 flex justify-between text-[10px] font-mono text-neutral-500 pt-2 px-1 border-t ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}>
              <span>Sen</span>
              <span>Sel</span>
              <span>Rab</span>
              <span>Kam</span>
              <span>Jum</span>
              <span>Sab</span>
              <span>Min</span>
            </div>
          </div>
        </div>
      )}

        {/* Destination Ranking */}
        <div className={`${role === 'central' ? 'lg:col-span-1' : 'lg:col-span-3'} ${isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200/80 shadow-xs'} border rounded-2xl p-6 flex flex-col justify-between`}>
          <div className="space-y-4">
            <div>
              <h4 className={`font-extrabold text-sm uppercase tracking-wider ${isDark ? 'text-neutral-300' : 'text-neutral-900'}`}>Rute Terfavorit</h4>
              <p className="text-[11px] text-neutral-500">Volume pencarian &amp; transaksi tertinggi</p>
            </div>
            
            <div className="space-y-4.5 pt-2">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className={`font-extrabold ${isDark ? 'text-neutral-300' : 'text-neutral-800'}`}>Mount Bromo Midnight Tour</span>
                  <span className={`font-mono ${isDark ? 'text-neutral-400' : 'text-neutral-500'} font-bold`}>82% bookings</span>
                </div>
                <div className={`w-full ${isDark ? 'bg-neutral-950 border-neutral-850' : 'bg-neutral-100 border-neutral-200'} h-2 rounded-full overflow-hidden border`}>
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full w-[82%]" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className={`font-extrabold ${isDark ? 'text-neutral-300' : 'text-neutral-800'}`}>Car Rental Malang (Innova Reborn)</span>
                  <span className={`font-mono ${isDark ? 'text-neutral-400' : 'text-neutral-500'} font-bold`}>64% bookings</span>
                </div>
                <div className={`w-full ${isDark ? 'bg-neutral-950 border-neutral-850' : 'bg-neutral-100 border-neutral-200'} h-2 rounded-full overflow-hidden border`}>
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full w-[64%]" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className={`font-extrabold ${isDark ? 'text-neutral-300' : 'text-neutral-800'}`}>Ngurah Rai Airport ➔ Seminyak</span>
                  <span className={`font-mono ${isDark ? 'text-neutral-400' : 'text-neutral-500'} font-bold`}>48% bookings</span>
                </div>
                <div className={`w-full ${isDark ? 'bg-neutral-950 border-neutral-850' : 'bg-neutral-100 border-neutral-200'} h-2 rounded-full overflow-hidden border`}>
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full w-[48%]" />
                </div>
              </div>
            </div>
          </div>

          <div className={`pt-6 border-t ${isDark ? 'border-neutral-850' : 'border-neutral-200'} text-xs font-bold flex justify-between text-neutral-500`}>
            <span>Rasio Konversi Web</span>
            <span className="text-amber-600">92.4% (Tinggi)</span>
          </div>
        </div>
      </div>

      {/* LIVE AUDIT LOG TIMELINE */}
      <div className={`${isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200/80 shadow-xs'} border rounded-2xl p-6`}>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
          <h4 className={`font-extrabold text-sm uppercase tracking-wider ${isDark ? 'text-neutral-300' : 'text-neutral-900'}`}>Live Audit Trail &amp; Activity Log</h4>
        </div>
        
        <div className={`${isDark ? 'bg-neutral-950 border-neutral-850 text-neutral-400' : 'bg-slate-50 border-neutral-200 text-neutral-700'} border p-4.5 rounded-xl max-h-[180px] overflow-y-auto font-mono text-[11px] leading-relaxed space-y-3`}>
          {displayLogs.slice(0, 10).map((log, idx) => (
            <div key={idx} className={`flex gap-3 ${isDark ? 'hover:text-neutral-200 border-neutral-900' : 'hover:text-neutral-900 border-neutral-200/60'} transition-colors py-1 border-b last:border-0`}>
              <span className={`${isDark ? 'text-neutral-600' : 'text-neutral-400'} shrink-0 select-none font-bold`}>[{log.time || '04:43'}]</span>
              <span className="text-amber-500 font-bold">●</span>
              <span className={`${isDark ? 'text-neutral-300' : 'text-neutral-800'} font-medium`}>{log.event}</span>
            </div>
          ))}
          {displayLogs.length === 0 && (
            <div className="text-center py-6 text-neutral-400 font-mono">Belum ada aktivitas tercatat untuk peran ini.</div>
          )}
        </div>
      </div>
    </div>
  );
}
