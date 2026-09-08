import React, { useState } from 'react';
import { 
  LayoutDashboard, ClipboardList, Layers, MapPin, Globe, 
  Settings, Compass, Users, Calendar, Sparkles, X, Plus, Trash2, Edit, DollarSign, Car, Info, Star, ShieldCheck, Save
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  OperationalCity, RentalLocation, RentalVehicle, 
  RentalCategory, RentalAddon, ZonePricing, Booking 
} from '../../types';
import RentalBookingCalendar from './RentalBookingCalendar';
import { useApp } from '../../AppContext';

interface RentalAdminWorkspaceProps {
  rentalCities: OperationalCity[];
  setRentalCities: React.Dispatch<React.SetStateAction<OperationalCity[]>>;
  rentalLocations: RentalLocation[];
  setRentalLocations: React.Dispatch<React.SetStateAction<RentalLocation[]>>;
  rentalVehicles: RentalVehicle[];
  setRentalVehicles: React.Dispatch<React.SetStateAction<RentalVehicle[]>>;
  rentalCategories: RentalCategory[];
  setRentalCategories: React.Dispatch<React.SetStateAction<RentalCategory[]>>;
  rentalAddons: RentalAddon[];
  setRentalAddons: React.Dispatch<React.SetStateAction<RentalAddon[]>>;
  rentalZonePricing: ZonePricing[];
  setRentalZonePricing: React.Dispatch<React.SetStateAction<ZonePricing[]>>;
  bookings: Booking[];
  updateBookingStatus: (id: string, status: 'Pending' | 'Confirmed' | 'Cancelled') => void;
  theme: any;
  currency: string;
  formatPrice: (usd: number, idr: number) => string;
  triggerToast: (msg: string) => void;
  activeSubTab: string;
  setActiveSubTab: (tab: any) => void;
}

export default function RentalAdminWorkspace({
  rentalCities, setRentalCities,
  rentalLocations, setRentalLocations,
  rentalVehicles, setRentalVehicles,
  rentalCategories, setRentalCategories,
  rentalAddons, setRentalAddons,
  rentalZonePricing, setRentalZonePricing,
  bookings, updateBookingStatus,
  theme, currency, formatPrice, triggerToast,
  activeSubTab, setActiveSubTab
}: RentalAdminWorkspaceProps) {
  
  // Local Form and Filter states
  const [form, setForm] = useState<any>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [cityFilter, setCityFilter] = useState('all');
  const [activeZoneDetail, setActiveZoneDetail] = useState<'Zone 0' | 'Zone 1' | 'Zone 2' | null>(null);

  const [editingRatesZone, setEditingRatesZone] = useState<'Zone 0' | 'Zone 1' | 'Zone 2' | null>(null);
  const [zoneRatesForm, setZoneRatesForm] = useState<Record<string, { usd: number, idr: number }>>({});

  const handleStartEditRates = (zoneCode: 'Zone 0' | 'Zone 1' | 'Zone 2') => {
    const initialForm: Record<string, { usd: number, idr: number }> = {};
    rentalCategories.forEach(cat => {
      let usd = 0;
      let idr = 0;
      if (zoneCode === 'Zone 0') {
        usd = cat.priceZone0USD || 0;
        idr = cat.priceZone0IDR || 0;
      } else if (zoneCode === 'Zone 1') {
        usd = cat.priceZone1USD || 0;
        idr = cat.priceZone1IDR || 0;
      } else {
        usd = cat.priceZone2USD || 0;
        idr = cat.priceZone2IDR || 0;
      }
      initialForm[cat.id] = { usd, idr };
    });
    setZoneRatesForm(initialForm);
    setEditingRatesZone(zoneCode);
  };

  const handleSaveZoneRates = (zoneCode: 'Zone 0' | 'Zone 1' | 'Zone 2') => {
    setRentalCategories(prev => prev.map(cat => {
      const formVal = zoneRatesForm[cat.id];
      if (!formVal) return cat;

      if (zoneCode === 'Zone 0') {
        return {
          ...cat,
          priceZone0USD: formVal.usd,
          priceZone0IDR: formVal.idr
        };
      } else if (zoneCode === 'Zone 1') {
        return {
          ...cat,
          priceZone1USD: formVal.usd,
          priceZone1IDR: formVal.idr
        };
      } else {
        return {
          ...cat,
          priceZone2USD: formVal.usd,
          priceZone2IDR: formVal.idr
        };
      }
    }));
    setEditingRatesZone(null);
    triggerToast(`Direct Category Rates updated for ${zoneCode}!`);
  };

  const rentalBookings = bookings.filter(b => b.type === 'rental');

  const resetForm = () => {
    setForm({});
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleStatusChange = (bookingId: string, newStatus: string) => {
    updateBookingStatus(bookingId, newStatus as any);
    triggerToast(`Booking status updated to ${newStatus}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400';
      case 'Cancelled':
        return 'bg-rose-500/10 border border-rose-500/20 text-rose-400';
      default:
        return 'bg-amber-500/10 border border-amber-500/20 text-amber-400';
    }
  };

  // --- 1. DASHBOARD VIEW ---
  if (activeSubTab === 'dashboard') {
    const activeFleet = rentalVehicles.filter(v => v.status === 'Active').length;
    const confirmedCount = rentalBookings.filter(b => b.status === 'Confirmed').length;
    const totalRevenueUSD = rentalBookings.filter(b => b.status === 'Confirmed').reduce((s, b) => s + (b.totalPrice || 0), 0);
    const totalRevenueIDR = rentalBookings.filter(b => b.status === 'Confirmed').reduce((s, b) => s + (b.totalPriceIDR || 0), 0);

    return (
      <div className="space-y-6 animate-fade-in text-left">
        {/* Workspace Overview Header */}
        <div className={`${theme.innerCard} border rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
          <div className="space-y-1">
            <h3 className="text-base font-black uppercase tracking-wider font-mono text-amber-500 flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 animate-pulse" />
              SJT CAR RENTAL DESK
            </h3>
            <p className={`text-xs ${theme.textSecondary}`}>
              Pusat komando sewa mobil harian, konfigurasi wilayah operasional, aturan surcharge rute zona, dan ketersediaan armada.
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full">
            DEPT ID: RENTAL_OPS_CENTER
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`${theme.card} border rounded-2xl p-5 flex items-start justify-between`}>
            <div className="space-y-1">
              <span className={`text-[10px] uppercase font-bold tracking-wider font-mono ${theme.textSecondary}`}>Active Fleet</span>
              <h2 className="text-2xl font-black text-white">{activeFleet} / {rentalVehicles.length} Units</h2>
              <span className="text-[10px] text-emerald-400 font-bold block pt-1">● 100% Operational</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
              <Car className="h-5 w-5" />
            </div>
          </div>

          <div className={`${theme.card} border rounded-2xl p-5 flex items-start justify-between`}>
            <div className="space-y-1">
              <span className={`text-[10px] uppercase font-bold tracking-wider font-mono ${theme.textSecondary}`}>Locations & Areas</span>
              <h2 className="text-2xl font-black text-white">{rentalLocations.length} Areas / 3 Zones</h2>
              <span className="text-[10px] text-amber-400 font-bold block pt-1">In {rentalCities.length} Operational Cities</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
              <MapPin className="h-5 w-5" />
            </div>
          </div>

          <div className={`${theme.card} border rounded-2xl p-5 flex items-start justify-between`}>
            <div className="space-y-1">
              <span className={`text-[10px] uppercase font-bold tracking-wider font-mono ${theme.textSecondary}`}>Car Rental Bookings</span>
              <h2 className="text-2xl font-black text-white">{rentalBookings.length} Bookings</h2>
              <span className="text-[10px] text-amber-400 font-bold block pt-1">{confirmedCount} Confirmed Rides</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
              <ClipboardList className="h-5 w-5" />
            </div>
          </div>

          <div className={`${theme.card} border rounded-2xl p-5 flex items-start justify-between`}>
            <div className="space-y-1">
              <span className={`text-[10px] uppercase font-bold tracking-wider font-mono ${theme.textSecondary}`}>Accumulated Revenue</span>
              <h2 className="text-2xl font-black text-amber-500 font-mono truncate max-w-[180px]">
                {formatPrice(totalRevenueUSD, totalRevenueIDR)}
              </h2>
              <span className="text-[10px] text-emerald-400 font-bold block pt-1">Settle via Payment Gateway</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Quick Setup Modules */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`${theme.card} border rounded-2xl p-6 space-y-4`}>
            <h4 className="text-xs font-black uppercase tracking-widest font-mono text-amber-500 border-b border-neutral-850 pb-2 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Quick Setup Desk
            </h4>
            <div className="space-y-2">
              {[
                { tab: 'calendar', label: 'Booking Calendar', desc: 'Daily rental fleet tracking & calendar views', icon: Calendar },
                { tab: 'cities', label: 'Operational Cities', desc: 'Active business regions', icon: Globe },
                { tab: 'areas', label: 'Service Areas & Zones', desc: 'Mapped geographical zones & location spots', icon: MapPin },
                { tab: 'vehicles', label: 'Car Fleet Registry', desc: 'Add cars, categories, and manage supported zones', icon: Car },
                { tab: 'categories', label: 'Vehicle Class Rates', desc: 'Define daily rates per Service Zone', icon: Layers },
                { tab: 'addons', label: 'Add-on Services', desc: 'Guides, babycar seats, outdoor kits', icon: Sparkles },
                { tab: 'bookings', label: 'Car Rental Bookings', desc: 'Review and manage dispatch requests', icon: ClipboardList }
              ].map(x => {
                const Icon = x.icon;
                return (
                  <button
                    key={x.tab}
                    onClick={() => setActiveSubTab(x.tab as any)}
                    className={`w-full text-left p-3 rounded-xl border ${theme.innerCard} hover:border-amber-500/30 hover:bg-amber-500/5 transition-all flex items-start gap-3 group`}
                  >
                    <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20 group-hover:scale-105 transition-transform">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">{x.label}</div>
                      <div className="text-[10px] text-neutral-400 mt-0.5 leading-relaxed">{x.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className={`${theme.card} border rounded-2xl p-6 space-y-4`}>
              <h4 className="text-xs font-black uppercase tracking-widest font-mono text-amber-500 border-b border-neutral-850 pb-2">
                Recent Incoming Rentals
              </h4>
              <div className="space-y-3">
                {rentalBookings.slice(0, 4).map((b, i) => (
                  <div key={b.id || i} className={`flex justify-between items-center p-3 rounded-xl ${theme.innerCard} border`}>
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-white block uppercase">{b.customerName}</span>
                      <span className="text-[10px] text-neutral-400 block font-mono">
                        {b.details.pickupLocation} → {b.details.destination} ({b.details.days} Days)
                      </span>
                    </div>
                    <div className="text-right space-y-1.5">
                      <span className="text-xs font-black text-amber-500 block font-mono">{formatPrice(b.totalPrice, b.totalPriceIDR)}</span>
                      <span className={`text-[8px] font-mono font-black uppercase px-2 py-0.5 rounded-full ${getStatusBadge(b.status)}`}>
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))}
                {rentalBookings.length === 0 && (
                  <div className="text-center py-8 text-xs text-neutral-500">
                    No active rental bookings in database.
                  </div>
                )}
              </div>
            </div>

            <div className={`${theme.card} border rounded-2xl p-6 space-y-4`}>
              <h4 className="text-xs font-black uppercase tracking-widest font-mono text-amber-500 border-b border-neutral-850 pb-2">
                Log System & Integrity
              </h4>
              <div className="space-y-2 font-mono text-[10px] leading-relaxed pt-1">
                <div className="text-emerald-400">[SYSTEM] Core database initialized. Loaded {rentalCities.length} operational cities, {rentalLocations.length} service areas.</div>
                <div className="text-amber-500">[DISPATCH] Checking zone pricing integrity across cross-border locations...</div>
                <div className="text-neutral-400">[API] CarRentalView.tsx successfully linked to AppContext rentalState.</div>
                <div className="text-neutral-500">[LOG] Zone surcharges auto-calculating in client browser context.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- CALENDAR VIEW ---
  if (activeSubTab === 'calendar') {
    return <RentalBookingCalendar />;
  }

  // --- 2. OPERATIONAL CITIES VIEW ---
  if (activeSubTab === 'cities') {
    const handleSaveCity = (e: React.FormEvent) => {
      e.preventDefault();
      if (!form.name) return;

      if (editingId) {
        setRentalCities(prev => prev.map(c => c.id === editingId ? { ...c, name: form.name, status: form.status || 'Active', displayOrder: Number(form.displayOrder || 0) } : c));
        triggerToast(`Updated city: ${form.name}`);
      } else {
        const newCity: OperationalCity = {
          id: `city-${Date.now()}`,
          name: form.name,
          status: form.status || 'Active',
          displayOrder: Number(form.displayOrder || rentalCities.length + 1)
        };
        setRentalCities(prev => [...prev, newCity]);
        triggerToast(`Added city: ${form.name}`);
      }
      resetForm();
    };

    const handleDeleteCity = (id: string, name: string) => {
      if (confirm(`Delete operational city: ${name}?`)) {
        setRentalCities(prev => prev.filter(c => c.id !== id));
        triggerToast(`Deleted city: ${name}`);
      }
    };

    return (
      <div className="space-y-6 animate-fade-in text-left">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-base font-black uppercase tracking-wider font-mono text-amber-500">OPERATIONAL CITIES</h3>
            <p className={`text-xs ${theme.textSecondary}`}>Manage territories where your private car rentals operate.</p>
          </div>
          {!isFormOpen && (
            <button
              onClick={() => {
                setForm({ status: 'Active', displayOrder: rentalCities.length + 1 });
                setIsFormOpen(true);
              }}
              className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add City</span>
            </button>
          )}
        </div>

        {isFormOpen && (
          <div className={`${theme.card} border rounded-2xl p-6 space-y-4`}>
            <div className="flex justify-between items-center border-b border-neutral-850 pb-3">
              <h4 className="text-xs font-black uppercase tracking-widest font-mono text-amber-500">
                {editingId ? 'Edit Operational City' : 'Add New Operational City'}
              </h4>
              <button onClick={resetForm} className="text-neutral-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSaveCity} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-400">City Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Malang, Bali, Surabaya"
                  value={form.name || ''}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className={`w-full ${theme.input} border px-4 py-2 text-xs rounded-xl focus:outline-none focus:border-amber-500`}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-400">Status</label>
                <select
                  value={form.status || 'Active'}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  className={`w-full ${theme.input} border px-4 py-2 text-xs rounded-xl focus:outline-none focus:border-amber-500`}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-400">Display Order</label>
                <input
                  type="number"
                  value={form.displayOrder || ''}
                  onChange={e => setForm({ ...form, displayOrder: e.target.value })}
                  className={`w-full ${theme.input} border px-4 py-2 text-xs rounded-xl focus:outline-none focus:border-amber-500`}
                />
              </div>
              <div className="md:col-span-3 flex justify-end gap-2 pt-2">
                <button type="button" onClick={resetForm} className="px-4 py-2 text-xs text-neutral-400 hover:text-white">Cancel</button>
                <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs px-5 py-2 rounded-xl">Save City</button>
              </div>
            </form>
          </div>
        )}

        <div className={`${theme.card} border rounded-2xl overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-850 font-mono text-neutral-400 uppercase bg-neutral-950/20">
                  <th className="p-4">ID</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Order</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-850/40">
                {rentalCities.sort((a,b) => a.displayOrder - b.displayOrder).map(c => (
                  <tr key={c.id} className="hover:bg-neutral-950/10">
                    <td className="p-4 font-mono text-neutral-400">{c.id}</td>
                    <td className="p-4 font-bold text-white">{c.name}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${c.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono">{c.displayOrder}</td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setForm({ name: c.name, status: c.status, displayOrder: c.displayOrder });
                          setEditingId(c.id);
                          setIsFormOpen(true);
                        }}
                        className="p-1 text-neutral-400 hover:text-amber-500"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDeleteCity(c.id, c.name)} className="p-1 text-neutral-400 hover:text-rose-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // --- 3. SERVICE AREAS VIEW ---
  if (activeSubTab === 'areas') {
    const handleSaveArea = (e: React.FormEvent) => {
      e.preventDefault();
      const zoneToSave = activeZoneDetail || form.zone || 'Zone 0';
      if (!form.cityId || !form.name || !zoneToSave) return;

      if (editingId) {
        setRentalLocations(prev => prev.map(l => l.id === editingId ? {
          ...l,
          cityId: form.cityId,
          name: form.name,
          zone: zoneToSave as 'Zone 0' | 'Zone 1' | 'Zone 2',
          status: form.status || 'Active',
          notes: form.notes || '',
          displayOrder: Number(form.displayOrder || 0)
        } : l));
        triggerToast(`Updated service area: ${form.name}`);
      } else {
        const newLoc: RentalLocation = {
          id: `loc-${Date.now()}`,
          cityId: form.cityId,
          name: form.name,
          zone: zoneToSave as 'Zone 0' | 'Zone 1' | 'Zone 2',
          status: form.status || 'Active',
          notes: form.notes || '',
          displayOrder: Number(form.displayOrder || rentalLocations.length + 1)
        };
        setRentalLocations(prev => [...prev, newLoc]);
        triggerToast(`Added service area: ${form.name}`);
      }
      resetForm();
    };

    const handleDeleteArea = (id: string, name: string) => {
      if (confirm(`Delete service area: ${name}?`)) {
        setRentalLocations(prev => prev.filter(l => l.id !== id));
        triggerToast(`Deleted service area: ${name}`);
      }
    };

    const filteredLocs = cityFilter === 'all'
      ? rentalLocations
      : rentalLocations.filter(l => l.cityId === cityFilter);

    // Grouping into the three main zones
    const zonesList = [
      { 
        code: 'Zone 0' as const, 
        name: 'Zona Nol (Kota Malang & 5 Kecamatan)', 
        desc: 'Zona Nol mencakup seluruh wilayah administratif Kota Malang beserta lima kecamatannya (Klojen, Blimbing, Lowokwaru, Sukun, Kedungkandang) tanpa biaya surcharge.',
        color: 'from-emerald-500/10 to-teal-500/5', 
        border: 'border-emerald-500/20',
        text: 'text-emerald-400',
        badge: 'bg-emerald-500/10 text-emerald-400'
      },
      { 
        code: 'Zone 1' as const, 
        name: 'Zona Satu (Kabupaten Malang & Kota Batu)', 
        desc: 'Zona Satu mencakup seluruh wilayah di luar Kota Malang, yaitu kecamatan-kecamatan yang berada di wilayah administratif Kabupaten Malang (seperti Singosari, Karangploso, Dau, Kepanjen, dll) beserta wilayah administratif Kota Batu.',
        color: 'from-amber-500/10 to-orange-500/5', 
        border: 'border-amber-500/20',
        text: 'text-amber-400',
        badge: 'bg-amber-500/10 text-amber-400'
      },
      { 
        code: 'Zone 2' as const, 
        name: 'Zona Dua (Kabupaten Tetangga / Luar Malang)', 
        desc: 'Zona Dua mencakup wilayah di luar Kota dan Kabupaten Malang, yaitu Kabupaten Lumajang, Kabupaten Kediri, Kabupaten Blitar, Kabupaten Probolinggo, dan Kabupaten Pasuruan (berlaku surcharge tarif penuh).',
        color: 'from-rose-500/10 to-pink-500/5', 
        border: 'border-rose-500/20',
        text: 'text-rose-400',
        badge: 'bg-rose-500/10 text-rose-400'
      }
    ];

    return (
      <div className="space-y-6 animate-fade-in text-left">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-base font-black uppercase tracking-wider font-mono text-amber-500">
              {activeZoneDetail ? `KELOLA AREA: ${activeZoneDetail}` : 'ZONA LAYANAN (SERVICE AREAS)'}
            </h3>
            <p className={`text-xs ${theme.textSecondary}`}>
              {activeZoneDetail 
                ? `Kelola semua nama area/lokasi penjemputan dan pengantaran yang masuk dalam ${activeZoneDetail}.` 
                : 'Sederhana dan rapi. Kelola semua area penjemputan dan pengantaran yang dikelompokkan ke dalam 3 Zona Utama.'}
            </p>
          </div>
          {activeZoneDetail && (
            <button
              onClick={() => {
                setActiveZoneDetail(null);
                resetForm();
              }}
              className="bg-neutral-800 hover:bg-neutral-750 text-white font-mono text-xs px-4 py-2.5 rounded-xl transition-all border border-neutral-700 flex items-center gap-1.5 cursor-pointer"
            >
              <span>← Kembali ke Daftar 3 Zona</span>
            </button>
          )}
        </div>

        {/* Global/Detail Filters & City Controls */}
        {!activeZoneDetail && (
          <div className="flex justify-start items-center gap-2 bg-neutral-900/10 p-3 border border-neutral-850 rounded-xl">
            <span className="text-xs font-bold text-neutral-400 uppercase font-mono">Filter Kota:</span>
            <select
              value={cityFilter}
              onChange={e => setCityFilter(e.target.value)}
              className={`${theme.input} border px-2.5 py-1 text-xs rounded focus:outline-none`}
            >
              <option value="all">Semua Kota</option>
              {rentalCities.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* 1. THREE ZONES MAIN VIEW */}
        {!activeZoneDetail && (
          <div className="grid grid-cols-1 gap-6">
            {zonesList.map(zone => {
              const zoneLocs = filteredLocs.filter(l => l.zone === zone.code);
              const activeCount = zoneLocs.filter(l => l.status === 'Active').length;
              const inactiveCount = zoneLocs.length - activeCount;

              return (
                <div 
                  key={zone.code} 
                  className={`bg-gradient-to-br ${zone.color} border ${zone.border} rounded-2xl p-6 transition-all hover:scale-[1.005] duration-250 flex flex-col md:flex-row justify-between gap-6 items-start`}
                >
                  <div className="space-y-4 flex-1">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5">
                        <span className={`px-3 py-1 rounded-full text-xs font-mono font-black uppercase ${zone.badge}`}>
                          {zone.code}
                        </span>
                        <h4 className="text-base font-extrabold text-white">{zone.name}</h4>
                      </div>
                      <p className="text-xs text-neutral-400 font-medium">{zone.desc}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
                          Daftar Area/Spot Terdaftar ({zoneLocs.length}):
                        </span>
                        <div className="flex gap-2">
                          <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-500/10">
                            {activeCount} Aktif
                          </span>
                          {inactiveCount > 0 && (
                            <span className="text-[9px] font-mono bg-rose-500/10 text-rose-400 px-1.5 py-0.2 rounded border border-rose-500/10">
                              {inactiveCount} Tidak Aktif
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto pr-2">
                        {zoneLocs.map(loc => {
                          const cityObj = rentalCities.find(c => c.id === loc.cityId);
                          return (
                            <div 
                              key={loc.id} 
                              className={`text-[10px] font-mono px-2.5 py-1 rounded-xl border flex items-center gap-1.5 bg-neutral-950/40 ${loc.status === 'Active' ? 'border-neutral-800 text-neutral-300' : 'border-rose-500/10 text-rose-400/80'}`}
                            >
                              <span className="font-extrabold text-amber-500">{cityObj?.name || 'Unknown'}:</span>
                              <span>{loc.name}</span>
                              {loc.notes && <span className="text-neutral-500 text-[9px] italic">({loc.notes})</span>}
                            </div>
                          );
                        })}
                        {zoneLocs.length === 0 && (
                          <span className="text-xs text-neutral-500 italic font-mono py-1">Belum ada area ditambahkan ke zona ini. Klik Kelola Area untuk menambahkan.</span>
                        )}
                      </div>
                    </div>

                    {/* Direct Category Rates section */}
                    <div className="mt-4 p-4 rounded-xl bg-neutral-950/40 border border-neutral-850/60 space-y-3 text-left w-full">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono font-bold uppercase text-neutral-400 tracking-wider">
                          Direct Category Rates for this Zone (Sewa Harian):
                        </span>
                        {editingRatesZone !== zone.code && (
                          <button
                            onClick={() => handleStartEditRates(zone.code)}
                            className="text-[10px] font-mono font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1 cursor-pointer bg-neutral-900 px-2 py-1 rounded border border-neutral-800"
                          >
                            <DollarSign className="h-3 w-3" />
                            <span>Edit Rates</span>
                          </button>
                        )}
                      </div>

                      {editingRatesZone === zone.code ? (
                        <div className="space-y-3 pt-1">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {rentalCategories.map(cat => {
                              const rates = zoneRatesForm[cat.id] || { usd: 0, idr: 0 };
                              return (
                                <div key={cat.id} className="bg-neutral-900/60 p-3 rounded-lg border border-neutral-800 space-y-2">
                                  <span className="text-[10px] font-bold text-white uppercase block">{cat.name}</span>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-0.5">
                                      <label className="text-[8px] font-mono text-neutral-500 uppercase block">USD Rate</label>
                                      <input
                                        type="number"
                                        value={rates.usd}
                                        onChange={e => setZoneRatesForm(prev => ({
                                          ...prev,
                                          [cat.id]: { ...rates, usd: Number(e.target.value) }
                                        }))}
                                        className={`w-full ${theme.input} border px-2 py-1 text-xs rounded-lg focus:outline-none focus:border-amber-500`}
                                      />
                                    </div>
                                    <div className="space-y-0.5">
                                      <label className="text-[8px] font-mono text-neutral-500 uppercase block">IDR Rate</label>
                                      <input
                                        type="number"
                                        value={rates.idr}
                                        onChange={e => setZoneRatesForm(prev => ({
                                          ...prev,
                                          [cat.id]: { ...rates, idr: Number(e.target.value) }
                                        }))}
                                        className={`w-full ${theme.input} border px-2 py-1 text-xs rounded-lg focus:outline-none focus:border-amber-500`}
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setEditingRatesZone(null)}
                              className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveZoneRates(zone.code)}
                              className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black text-xs px-4 py-1.5 rounded-lg transition-all"
                            >
                              Save Rates
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                          {rentalCategories.map(cat => {
                            let usd = 0;
                            let idr = 0;
                            if (zone.code === 'Zone 0') {
                              usd = cat.priceZone0USD || 0;
                              idr = cat.priceZone0IDR || 0;
                            } else if (zone.code === 'Zone 1') {
                              usd = cat.priceZone1USD || 0;
                              idr = cat.priceZone1IDR || 0;
                            } else {
                              usd = cat.priceZone2USD || 0;
                              idr = cat.priceZone2IDR || 0;
                            }
                            return (
                              <div key={cat.id} className="flex justify-between items-center bg-neutral-900/40 px-3 py-2 rounded-lg border border-neutral-800/60">
                                <span className="text-[10px] font-extrabold text-neutral-300 uppercase truncate mr-1">{cat.name}</span>
                                <span className="text-xs font-mono font-black text-amber-500 shrink-0">{formatPrice(usd, idr)}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex md:flex-col justify-end items-stretch w-full md:w-auto shrink-0 gap-3">
                    <button
                      onClick={() => {
                        setActiveZoneDetail(zone.code);
                        // Pre-populate form default values for this zone
                        setForm({
                          cityId: cityFilter !== 'all' ? cityFilter : (rentalCities[0]?.id || ''),
                          zone: zone.code,
                          status: 'Active',
                          notes: ''
                        });
                      }}
                      className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black text-xs px-5 py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Kelola & Edit Area ({zoneLocs.length})</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 2. SPECIFIC ZONE DETAIL WORKSPACE */}
        {activeZoneDetail && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Side: Inline Add/Edit Form */}
            <div className="lg:col-span-4 space-y-4">
              <div className={`${theme.card} border rounded-2xl p-5 space-y-4`}>
                <div className="flex justify-between items-center border-b border-neutral-850 pb-2">
                  <h4 className="text-xs font-black uppercase tracking-widest font-mono text-amber-500">
                    {editingId ? 'Edit Area / Lokasi' : 'Tambah Area Baru'}
                  </h4>
                  {editingId && (
                    <button 
                      onClick={() => {
                        setEditingId(null);
                        setForm({
                          cityId: cityFilter !== 'all' ? cityFilter : (rentalCities[0]?.id || ''),
                          zone: activeZoneDetail,
                          status: 'Active',
                          notes: ''
                        });
                      }} 
                      className="text-xs text-rose-400 hover:underline"
                    >
                      Batal Edit
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveArea} className="space-y-4">
                  {/* Lock the Zone automatically */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-neutral-400 font-mono">Zona Tujuan (Otomatis)</label>
                    <div className="w-full bg-neutral-950 border border-neutral-850 px-4 py-2 text-xs rounded-xl text-amber-400 font-mono font-bold">
                      {activeZoneDetail}
                    </div>
                  </div>

                  {/* Operational City Dropdown */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-neutral-400 font-mono">Kota Operasional</label>
                    <select
                      value={form.cityId || ''}
                      onChange={e => setForm({ ...form, cityId: e.target.value })}
                      className={`w-full ${theme.input} border px-4 py-2 text-xs rounded-xl focus:outline-none`}
                      required
                    >
                      <option value="">-- Pilih Kota --</option>
                      {rentalCities.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Area / Spot Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-neutral-400 font-mono">Nama Area / Tempat</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Seminyak, Ubud Center, Gilimanuk Harbor"
                      value={form.name || ''}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className={`w-full ${theme.input} border px-4 py-2 text-xs rounded-xl focus:outline-none`}
                    />
                  </div>

                  {/* Notes / Descriptions */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-neutral-400 font-mono">Catatan / Deskripsi Geografis</label>
                    <input
                      type="text"
                      placeholder="Contoh: Titik temu Lobby, terminal, bandara dll."
                      value={form.notes || ''}
                      onChange={e => setForm({ ...form, notes: e.target.value })}
                      className={`w-full ${theme.input} border px-4 py-2 text-xs rounded-xl focus:outline-none`}
                    />
                  </div>

                  {/* Status Dropdown */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-neutral-400 font-mono">Status Aktif</label>
                    <select
                      value={form.status || 'Active'}
                      onChange={e => setForm({ ...form, status: e.target.value })}
                      className={`w-full ${theme.input} border px-4 py-2 text-xs rounded-xl focus:outline-none`}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  {/* Save buttons */}
                  <div className="flex justify-end gap-2 pt-2 border-t border-neutral-850">
                    <button 
                      type="submit" 
                      className="w-full bg-amber-500 hover:bg-amber-600 text-neutral-950 font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      {editingId ? 'Simpan Perubahan Area' : 'Tambahkan Area Baru'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Informational Guidelines Card */}
              <div className={`${theme.card} border rounded-2xl p-4 space-y-2 text-xs bg-neutral-900/10`}>
                <h5 className="font-bold text-amber-500 uppercase font-mono text-[10px]">Informasi Surcharge:</h5>
                <p className="text-neutral-400 leading-relaxed text-[11px]">
                  Semua area di dalam <span className="font-mono text-white">{activeZoneDetail}</span> ini akan otomatis menggunakan perhitungan tarif di menu <span className="font-bold text-white">Zone Pricing Rules</span>.
                </p>
              </div>
            </div>

            {/* Right Side: List of Areas inside this Active Zone */}
            <div className="lg:col-span-8 space-y-4">
              {/* Internal search/filter row inside detail view */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-neutral-900/10 p-3 border border-neutral-850 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold text-neutral-400 uppercase font-mono">Kota Saringan:</span>
                  <select
                    value={cityFilter}
                    onChange={e => setCityFilter(e.target.value)}
                    className={`${theme.input} border px-2 py-0.5 text-xs rounded focus:outline-none`}
                  >
                    <option value="all">Semua Kota</option>
                    {rentalCities.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <span className="text-[10px] font-mono font-bold text-neutral-400">
                  Total Terdaftar: <span className="text-white font-extrabold">{filteredLocs.filter(l => l.zone === activeZoneDetail).length} Area</span>
                </span>
              </div>

              {/* Table of Areas inside activeZoneDetail */}
              <div className={`${theme.card} border rounded-2xl overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-neutral-850 font-mono text-neutral-400 uppercase bg-neutral-950/20">
                        <th className="p-4">Nama Area / Tempat</th>
                        <th className="p-4">Kota</th>
                        <th className="p-4">Catatan</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-850/40">
                      {filteredLocs
                        .filter(l => l.zone === activeZoneDetail)
                        .map(l => {
                          const cityObj = rentalCities.find(c => c.id === l.cityId);
                          const isCurrentlyEditing = editingId === l.id;
                          return (
                            <tr 
                              key={l.id} 
                              className={`hover:bg-neutral-950/10 transition-colors ${isCurrentlyEditing ? 'bg-amber-500/5' : ''}`}
                            >
                              <td className="p-4">
                                <span className="font-extrabold text-white text-xs block">{l.name}</span>
                              </td>
                              <td className="p-4">
                                <span className="font-bold text-neutral-300 font-mono text-[10px]">{cityObj?.name || 'Unknown'}</span>
                              </td>
                              <td className="p-4 max-w-xs truncate text-neutral-400 italic font-mono text-[11px]">
                                {l.notes || '-'}
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${l.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                                  {l.status}
                                </span>
                              </td>
                              <td className="p-4 text-right space-x-2">
                                <button
                                  onClick={() => {
                                    setForm({ 
                                      cityId: l.cityId, 
                                      zone: l.zone, 
                                      name: l.name, 
                                      notes: l.notes || '', 
                                      status: l.status, 
                                      displayOrder: l.displayOrder 
                                    });
                                    setEditingId(l.id);
                                  }}
                                  className="p-1.5 text-neutral-400 hover:text-amber-500 hover:bg-neutral-800 rounded-lg transition-colors"
                                  title="Edit Area"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteArea(l.id, l.name)} 
                                  className="p-1.5 text-neutral-400 hover:text-rose-500 hover:bg-neutral-800 rounded-lg transition-colors"
                                  title="Hapus Area"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      {filteredLocs.filter(l => l.zone === activeZoneDetail).length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-neutral-500 font-mono">Belum ada area terdaftar di {activeZoneDetail} untuk filter kota saat ini.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    );
  }

  // --- 6. VEHICLES FLEET VIEW ---
  if (activeSubTab === 'vehicles') {
    const handleSaveVehicle = (e: React.FormEvent) => {
      e.preventDefault();
      if (!form.name || !form.categoryId || !form.cityId) return;

      const fallbackImg = form.image || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600';
      const featuresArr = typeof form.features === 'string'
        ? form.features.split(',').map((x: string) => x.trim()).filter(Boolean)
        : (form.features || []);

      if (editingId) {
        setRentalVehicles(prev => prev.map(v => v.id === editingId ? {
          ...v,
          name: form.name,
          categoryId: form.categoryId,
          cityId: form.cityId,
          passengers: Number(form.passengers || 4),
          luggage: Number(form.luggage || 2),
          hasAC: form.hasAC ?? true,
          image: fallbackImg,
          description: form.description || '',
          features: featuresArr,
          status: form.status || 'Active',
          supportedZones: form.supportedZones || ['Zone 0', 'Zone 1', 'Zone 2']
        } : v));
        triggerToast(`Updated unit: ${form.name}`);
      } else {
        const newVehicle: RentalVehicle = {
          id: `car-${Date.now()}`,
          name: form.name,
          categoryId: form.categoryId,
          cityId: form.cityId,
          passengers: Number(form.passengers || 4),
          luggage: Number(form.luggage || 2),
          hasAC: form.hasAC ?? true,
          image: fallbackImg,
          description: form.description || '',
          features: featuresArr,
          status: form.status || 'Active',
          supportedZones: form.supportedZones || ['Zone 0', 'Zone 1', 'Zone 2']
        };
        setRentalVehicles(prev => [...prev, newVehicle]);
        triggerToast(`Registered new unit: ${form.name}`);
      }
      resetForm();
    };

    const handleDeleteVehicle = (id: string, name: string) => {
      if (confirm(`Delete vehicle unit: ${name}?`)) {
        setRentalVehicles(prev => prev.filter(v => v.id !== id));
        triggerToast(`Deleted unit: ${name}`);
      }
    };

    const handleZoneCheckChange = (zoneCode: string, checked: boolean) => {
      const currentZones = form.supportedZones || [];
      let updatedZones = [];
      if (checked) {
        updatedZones = [...currentZones, zoneCode];
      } else {
        updatedZones = currentZones.filter((z: string) => z !== zoneCode);
      }
      setForm({ ...form, supportedZones: updatedZones });
    };

    const filteredVehicles = cityFilter === 'all'
      ? rentalVehicles
      : rentalVehicles.filter(v => v.cityId === cityFilter);

    // Get all available unique codes of zones
    const currentCityZoneCodes = ['Zone 0', 'Zone 1', 'Zone 2'];

    return (
      <div className="space-y-6 animate-fade-in text-left">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-base font-black uppercase tracking-wider font-mono text-amber-500">FLEET VEHICLES</h3>
            <p className={`text-xs ${theme.textSecondary}`}>Register units, specifications, and map them to standard categories. Pricing is governed dynamically by category rules.</p>
          </div>
          {!isFormOpen && (
            <button
              onClick={() => {
                setForm({
                  name: '',
                  categoryId: rentalCategories[0]?.id || '',
                  cityId: rentalCities[0]?.id || '',
                  passengers: 5,
                  luggage: 2,
                  hasAC: true,
                  image: '',
                  description: '',
                  features: 'Professional Driver, Fuel Included, Clean Cabin',
                  status: 'Active',
                  supportedZones: ['Zone 0', 'Zone 1', 'Zone 2']
                });
                setIsFormOpen(true);
              }}
              className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Vehicle</span>
            </button>
          )}
        </div>

        <div className="flex justify-start items-center gap-2 bg-neutral-900/10 p-3 border border-neutral-850 rounded-xl">
          <span className="text-xs font-bold text-neutral-400 uppercase font-mono">Filter City:</span>
          <select
            value={cityFilter}
            onChange={e => setCityFilter(e.target.value)}
            className={`${theme.input} border px-2.5 py-1 text-xs rounded focus:outline-none`}
          >
            <option value="all">All Cities</option>
            {rentalCities.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {isFormOpen && (
          <div className={`${theme.card} border rounded-2xl p-6 space-y-4`}>
            <div className="flex justify-between items-center border-b border-neutral-850 pb-3">
              <h4 className="text-xs font-black uppercase tracking-widest font-mono text-amber-500">
                {editingId ? 'Edit Vehicle Unit' : 'Add New Vehicle Unit'}
              </h4>
              <button onClick={resetForm} className="text-neutral-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSaveVehicle} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-bold uppercase text-neutral-400">Vehicle Name / Model</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Toyota Avanza Veloz"
                  value={form.name || ''}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className={`w-full ${theme.input} border px-4 py-2 text-xs rounded-xl focus:outline-none`}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-400">Class Category</label>
                <select
                  value={form.categoryId || ''}
                  onChange={e => setForm({ ...form, categoryId: e.target.value })}
                  className={`w-full ${theme.input} border px-4 py-2 text-xs rounded-xl focus:outline-none`}
                >
                  <option value="">-- Class Category --</option>
                  {rentalCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-400">City Base</label>
                <select
                  value={form.cityId || ''}
                  onChange={e => setForm({ ...form, cityId: e.target.value })}
                  className={`w-full ${theme.input} border px-4 py-2 text-xs rounded-xl focus:outline-none`}
                >
                  <option value="">-- City Base --</option>
                  {rentalCities.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-400">Pax Capacity</label>
                <input
                  type="number"
                  value={form.passengers || ''}
                  onChange={e => setForm({ ...form, passengers: Number(e.target.value) })}
                  className={`w-full ${theme.input} border px-4 py-2 text-xs rounded-xl focus:outline-none`}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-400">Luggage Bags Capacity</label>
                <input
                  type="number"
                  value={form.luggage || ''}
                  onChange={e => setForm({ ...form, luggage: Number(e.target.value) })}
                  className={`w-full ${theme.input} border px-4 py-2 text-xs rounded-xl focus:outline-none`}
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-400">Photo URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={form.image || ''}
                  onChange={e => setForm({ ...form, image: e.target.value })}
                  className={`w-full ${theme.input} border px-4 py-2 text-xs rounded-xl focus:outline-none`}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-400">Air Conditioner (AC)</label>
                <select
                  value={form.hasAC ? 'true' : 'false'}
                  onChange={e => setForm({ ...form, hasAC: e.target.value === 'true' })}
                  className={`w-full ${theme.input} border px-4 py-2 text-xs rounded-xl focus:outline-none`}
                >
                  <option value="true">Double blower A/C (Yes)</option>
                  <option value="false">No A/C (No)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-400">Status</label>
                <select
                  value={form.status || 'Active'}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  className={`w-full ${theme.input} border px-4 py-2 text-xs rounded-xl focus:outline-none`}
                >
                  <option value="Active">Ready</option>
                  <option value="Inactive">Standby / Service</option>
                </select>
              </div>
              <div className="md:col-span-4 space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-400">Core Features (Separated by commas)</label>
                <input
                  type="text"
                  placeholder="Professional Driver, Fuel Included, Airbags, Wi-Fi"
                  value={Array.isArray(form.features) ? form.features.join(', ') : (form.features || '')}
                  onChange={e => setForm({ ...form, features: e.target.value })}
                  className={`w-full ${theme.input} border px-4 py-2 text-xs rounded-xl focus:outline-none`}
                />
              </div>

              {/* Supported Surcharges multi checkbox */}
              <div className="md:col-span-4 p-4 border border-neutral-850 bg-neutral-950/20 rounded-2xl space-y-2">
                <span className="text-[10px] font-bold uppercase text-amber-500 font-mono block">Supported Service Zones</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {currentCityZoneCodes.map(zCode => {
                    const isChecked = (form.supportedZones || []).includes(zCode);
                    return (
                      <label key={zCode} className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300 hover:text-white select-none">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={e => handleZoneCheckChange(zCode, e.target.checked)}
                          className="h-4 w-4 rounded border-neutral-800 bg-neutral-900 text-amber-500 focus:ring-amber-500"
                        />
                        <span>{zCode} Surcharge</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="md:col-span-4 flex justify-end gap-2 pt-2">
                <button type="button" onClick={resetForm} className="px-4 py-2 text-xs text-neutral-400 hover:text-white">Cancel</button>
                <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs px-5 py-2 rounded-xl">Save Unit</button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map(v => {
            const cityObj = rentalCities.find(c => c.id === v.cityId);
            const catObj = rentalCategories.find(c => c.id === v.categoryId);
            return (
              <div key={v.id} className={`${theme.card} border rounded-2xl overflow-hidden hover:border-amber-500/30 hover:shadow-2xl transition-all flex flex-col justify-between group`}>
                <div className="w-full h-40 relative bg-neutral-950 overflow-hidden">
                  <img src={v.image} alt={v.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                  <div className="absolute top-3 left-3 bg-neutral-950/80 border border-neutral-800 text-[9px] font-mono text-amber-500 font-extrabold px-2.5 py-1 rounded-full uppercase">
                    {cityObj?.name || 'All Territory'}
                  </div>
                  <div className="absolute top-3 right-3 bg-neutral-950/80 border border-neutral-800 text-[9px] font-mono text-neutral-200 font-extrabold px-2.5 py-1 rounded-full uppercase">
                    {catObj?.name || 'Standard'}
                  </div>
                </div>
                <div className="p-5 flex-grow flex flex-col justify-between space-y-4 text-left">
                  <div className="space-y-1.5">
                    <h4 className="text-base font-black text-white group-hover:text-amber-400 transition-colors uppercase truncate">{v.name}</h4>
                    <div className="flex items-center gap-3 text-neutral-400 font-mono text-[10px]">
                      <span>👤 {v.passengers} Seats</span>
                      <span>💼 {v.luggage} Bags</span>
                      <span>❄️ {v.hasAC ? 'A/C' : 'No A/C'}</span>
                    </div>
                    <p className="text-[10px] text-neutral-400 leading-relaxed italic line-clamp-2">{v.description || 'Reliable local rental vehicle.'}</p>
                  </div>

                  <div className="border-t border-neutral-850 pt-3 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[10px] uppercase font-bold text-neutral-500">Base Rate (Zone 0):</span>
                      <span className="font-mono text-amber-500 font-black">
                        {catObj ? formatPrice(catObj.priceZone0USD || 0, catObj.priceZone0IDR || 0) : 'N/A'} / Day
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(v.supportedZones || []).map((zc, idx) => (
                        <span key={idx} className="bg-neutral-950 border border-neutral-800 text-[8px] font-mono text-neutral-300 px-1.5 py-0.5 rounded uppercase">
                          {zc}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-neutral-850 pt-3 mt-auto">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${v.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' : 'bg-rose-500/10 text-rose-400 border border-rose-500/10'}`}>
                      {v.status === 'Active' ? 'READY' : 'SERVICE'}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setForm({
                            name: v.name,
                            categoryId: v.categoryId,
                            cityId: v.cityId,
                            passengers: v.passengers,
                            luggage: v.luggage,
                            hasAC: v.hasAC,
                            image: v.image,
                            description: v.description,
                            features: (v.features || []).join(', '),
                            status: v.status,
                            supportedZones: v.supportedZones || []
                          });
                          setEditingId(v.id);
                          setIsFormOpen(true);
                        }}
                        className="p-1 text-neutral-400 hover:text-amber-500"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDeleteVehicle(v.id, v.name)} className="p-1 text-neutral-400 hover:text-rose-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // --- 7. VEHICLE CATEGORIES VIEW ---
  if (activeSubTab === 'categories') {
    const handleSaveCategory = (e: React.FormEvent) => {
      e.preventDefault();
      if (!form.name) return;

      if (editingId) {
        setRentalCategories(prev => prev.map(c => c.id === editingId ? { 
          ...c, 
          name: form.name, 
          description: form.description || '', 
          displayOrder: Number(form.displayOrder || 0), 
          status: form.status || 'Active',
          priceZone0USD: Number(form.priceZone0USD || 0),
          priceZone0IDR: Number(form.priceZone0IDR || 0),
          priceZone1USD: Number(form.priceZone1USD || 0),
          priceZone1IDR: Number(form.priceZone1IDR || 0),
          priceZone2USD: Number(form.priceZone2USD || 0),
          priceZone2IDR: Number(form.priceZone2IDR || 0)
        } : c));
        triggerToast(`Updated class category: ${form.name}`);
      } else {
        const newCat: RentalCategory = {
          id: `cat-${Date.now()}`,
          name: form.name,
          description: form.description || '',
          displayOrder: Number(form.displayOrder || rentalCategories.length + 1),
          status: form.status || 'Active',
          priceZone0USD: Number(form.priceZone0USD || 0),
          priceZone0IDR: Number(form.priceZone0IDR || 0),
          priceZone1USD: Number(form.priceZone1USD || 0),
          priceZone1IDR: Number(form.priceZone1IDR || 0),
          priceZone2USD: Number(form.priceZone2USD || 0),
          priceZone2IDR: Number(form.priceZone2IDR || 0)
        };
        setRentalCategories(prev => [...prev, newCat]);
        triggerToast(`Added class category: ${form.name}`);
      }
      resetForm();
    };

    const handleDeleteCategory = (id: string, name: string) => {
      if (confirm(`Delete class category: ${name}?`)) {
        setRentalCategories(prev => prev.filter(c => c.id !== id));
        triggerToast(`Deleted class: ${name}`);
      }
    };

    return (
      <div className="space-y-6 animate-fade-in text-left">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-base font-black uppercase tracking-wider font-mono text-amber-500">VEHICLE CATEGORIES & PRICING</h3>
            <p className={`text-xs ${theme.textSecondary}`}>Manage fleet classifications and define service pricing per Service Zone.</p>
          </div>
          {!isFormOpen && (
            <button
              onClick={() => {
                setForm({ 
                  status: 'Active', 
                  displayOrder: rentalCategories.length + 1,
                  priceZone0USD: 0,
                  priceZone0IDR: 0,
                  priceZone1USD: 0,
                  priceZone1IDR: 0,
                  priceZone2USD: 0,
                  priceZone2IDR: 0
                });
                setIsFormOpen(true);
              }}
              className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Category & Pricing</span>
            </button>
          )}
        </div>

        {isFormOpen && (
          <div className={`${theme.card} border rounded-2xl p-6 space-y-4`}>
            <div className="flex justify-between items-center border-b border-neutral-850 pb-3">
              <h4 className="text-xs font-black uppercase tracking-widest font-mono text-amber-500">
                {editingId ? 'Edit Category & Pricing' : 'Add New Category & Pricing'}
              </h4>
              <button onClick={resetForm} className="text-neutral-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-neutral-400">Class Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MPV Standard, Luxury VIP SUV"
                    value={form.name || ''}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className={`w-full ${theme.input} border px-4 py-2 text-xs rounded-xl focus:outline-none`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-neutral-400">Display Order</label>
                  <input
                    type="number"
                    value={form.displayOrder || ''}
                    onChange={e => setForm({ ...form, displayOrder: e.target.value })}
                    className={`w-full ${theme.input} border px-4 py-2 text-xs rounded-xl focus:outline-none`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-neutral-400">Status</label>
                  <select
                    value={form.status || 'Active'}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                    className={`w-full ${theme.input} border px-4 py-2 text-xs rounded-xl focus:outline-none`}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-400">Description / Standards</label>
                <input
                  type="text"
                  placeholder="Standar kenyamanan kelas, e.g. Avanza, Xenia, Ertiga"
                  value={form.description || ''}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className={`w-full ${theme.input} border px-4 py-2 text-xs rounded-xl focus:outline-none`}
                />
              </div>

              <div className="p-4 border border-neutral-850 bg-neutral-950/20 rounded-2xl space-y-4">
                <span className="text-[11px] font-black uppercase text-amber-500 font-mono block">Zone Pricing Definition (Rate Per Day)</span>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Zone 0 */}
                  <div className="space-y-3 p-3 bg-neutral-950/40 rounded-xl border border-emerald-500/10">
                    <span className="text-[10px] font-bold text-emerald-400 font-mono block">ZONE 0 (Base City Area)</span>
                    <div className="space-y-2">
                      <div>
                        <label className="text-[9px] text-neutral-400 block uppercase">Price (USD)</label>
                        <input
                          type="number"
                          required
                          value={form.priceZone0USD === undefined ? '' : form.priceZone0USD}
                          onChange={e => setForm({ ...form, priceZone0USD: Number(e.target.value) })}
                          className={`w-full ${theme.input} border px-3 py-1.5 text-xs rounded-lg focus:outline-none`}
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-neutral-400 block uppercase">Price (IDR)</label>
                        <input
                          type="number"
                          required
                          value={form.priceZone0IDR === undefined ? '' : form.priceZone0IDR}
                          onChange={e => setForm({ ...form, priceZone0IDR: Number(e.target.value) })}
                          className={`w-full ${theme.input} border px-3 py-1.5 text-xs rounded-lg focus:outline-none`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Zone 1 */}
                  <div className="space-y-3 p-3 bg-neutral-950/40 rounded-xl border border-amber-500/10">
                    <span className="text-[10px] font-bold text-amber-400 font-mono block">ZONE 1 (Medium / Suburban)</span>
                    <div className="space-y-2">
                      <div>
                        <label className="text-[9px] text-neutral-400 block uppercase">Price (USD)</label>
                        <input
                          type="number"
                          required
                          value={form.priceZone1USD === undefined ? '' : form.priceZone1USD}
                          onChange={e => setForm({ ...form, priceZone1USD: Number(e.target.value) })}
                          className={`w-full ${theme.input} border px-3 py-1.5 text-xs rounded-lg focus:outline-none`}
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-neutral-400 block uppercase">Price (IDR)</label>
                        <input
                          type="number"
                          required
                          value={form.priceZone1IDR === undefined ? '' : form.priceZone1IDR}
                          onChange={e => setForm({ ...form, priceZone1IDR: Number(e.target.value) })}
                          className={`w-full ${theme.input} border px-3 py-1.5 text-xs rounded-lg focus:outline-none`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Zone 2 */}
                  <div className="space-y-3 p-3 bg-neutral-950/40 rounded-xl border border-rose-500/10">
                    <span className="text-[10px] font-bold text-rose-400 font-mono block">ZONE 2 (Far / Out of Town)</span>
                    <div className="space-y-2">
                      <div>
                        <label className="text-[9px] text-neutral-400 block uppercase">Price (USD)</label>
                        <input
                          type="number"
                          required
                          value={form.priceZone2USD === undefined ? '' : form.priceZone2USD}
                          onChange={e => setForm({ ...form, priceZone2USD: Number(e.target.value) })}
                          className={`w-full ${theme.input} border px-3 py-1.5 text-xs rounded-lg focus:outline-none`}
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-neutral-400 block uppercase">Price (IDR)</label>
                        <input
                          type="number"
                          required
                          value={form.priceZone2IDR === undefined ? '' : form.priceZone2IDR}
                          onChange={e => setForm({ ...form, priceZone2IDR: Number(e.target.value) })}
                          className={`w-full ${theme.input} border px-3 py-1.5 text-xs rounded-lg focus:outline-none`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={resetForm} className="px-4 py-2 text-xs text-neutral-400 hover:text-white">Cancel</button>
                <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs px-5 py-2.5 rounded-xl">Save Class & Pricing</button>
              </div>
            </form>
          </div>
        )}

        <div className={`${theme.card} border rounded-2xl overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-850 font-mono text-neutral-400 uppercase bg-neutral-950/20">
                  <th className="p-4">Class Name</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Zone 0 Rate</th>
                  <th className="p-4">Zone 1 Rate</th>
                  <th className="p-4">Zone 2 Rate</th>
                  <th className="p-4">Order</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-850/40">
                {rentalCategories.sort((a,b) => a.displayOrder - b.displayOrder).map(cat => (
                  <tr key={cat.id} className="hover:bg-neutral-950/10">
                    <td className="p-4">
                      <span className="font-black text-white uppercase tracking-wider block">{cat.name}</span>
                      <span className="text-[10px] font-mono text-neutral-400">{cat.id}</span>
                    </td>
                    <td className="p-4 text-neutral-400 italic max-w-xs truncate">{cat.description || '-'}</td>
                    <td className="p-4 font-mono font-bold text-emerald-400">
                      {formatPrice(cat.priceZone0USD || 0, cat.priceZone0IDR || 0)}
                    </td>
                    <td className="p-4 font-mono font-bold text-amber-400">
                      {formatPrice(cat.priceZone1USD || 0, cat.priceZone1IDR || 0)}
                    </td>
                    <td className="p-4 font-mono font-bold text-rose-400">
                      {formatPrice(cat.priceZone2USD || 0, cat.priceZone2IDR || 0)}
                    </td>
                    <td className="p-4 font-mono">{cat.displayOrder}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${cat.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                        {cat.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setForm({ 
                            name: cat.name, 
                            description: cat.description, 
                            displayOrder: cat.displayOrder, 
                            status: cat.status,
                            priceZone0USD: cat.priceZone0USD || 0,
                            priceZone0IDR: cat.priceZone0IDR || 0,
                            priceZone1USD: cat.priceZone1USD || 0,
                            priceZone1IDR: cat.priceZone1IDR || 0,
                            priceZone2USD: cat.priceZone2USD || 0,
                            priceZone2IDR: cat.priceZone2IDR || 0
                          });
                          setEditingId(cat.id);
                          setIsFormOpen(true);
                        }}
                        className="p-1.5 text-neutral-400 hover:text-amber-500 hover:bg-neutral-800 rounded-lg transition-all"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDeleteCategory(cat.id, cat.name)} className="p-1.5 text-neutral-400 hover:text-rose-500 hover:bg-neutral-800 rounded-lg transition-all">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // --- 8. ADDON SERVICES VIEW ---
  if (activeSubTab === 'addons') {
    const handleSaveAddon = (e: React.FormEvent) => {
      e.preventDefault();
      if (!form.name) return;

      const catsArray = typeof form.applicableCategories === 'string'
        ? form.applicableCategories.split(',').map((c: string) => c.trim()).filter(Boolean)
        : (Array.isArray(form.applicableCategories) ? form.applicableCategories : ['all']);

      if (editingId) {
        setRentalAddons(prev => prev.map(a => a.id === editingId ? {
          ...a,
          name: form.name,
          description: form.description || '',
          priceUSD: Number(form.priceUSD || 0),
          priceIDR: Number(form.priceIDR || 0),
          pricingType: form.pricingType || 'Fixed',
          isRequired: form.isRequired ?? false,
          status: form.status || 'Active',
          displayOrder: Number(form.displayOrder || 0),
          applicableCategories: catsArray
        } : a));
        triggerToast(`Updated add-on: ${form.name}`);
      } else {
        const newAddon: RentalAddon = {
          id: `addon-${Date.now()}`,
          name: form.name,
          description: form.description || '',
          priceUSD: Number(form.priceUSD || 0),
          priceIDR: Number(form.priceIDR || 0),
          pricingType: form.pricingType || 'Fixed',
          isRequired: form.isRequired ?? false,
          status: form.status || 'Active',
          displayOrder: Number(form.displayOrder || rentalAddons.length + 1),
          applicableCategories: catsArray
        };
        setRentalAddons(prev => [...prev, newAddon]);
        triggerToast(`Added add-on: ${form.name}`);
      }
      resetForm();
    };

    const handleDeleteAddon = (id: string, name: string) => {
      if (confirm(`Delete add-on service: ${name}?`)) {
        setRentalAddons(prev => prev.filter(a => a.id !== id));
        triggerToast(`Deleted add-on: ${name}`);
      }
    };

    return (
      <div className="space-y-6 animate-fade-in text-left">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-base font-black uppercase tracking-wider font-mono text-amber-500">ADD-ON SERVICES</h3>
            <p className={`text-xs ${theme.textSecondary}`}>Manage optional trip additions (English Guides, Toddler Seat, Outdoor gear etc).</p>
          </div>
          {!isFormOpen && (
            <button
              onClick={() => {
                setForm({ pricingType: 'Fixed', isRequired: false, priceUSD: 10, priceIDR: 150000, status: 'Active', displayOrder: rentalAddons.length + 1, applicableCategories: 'all' });
                setIsFormOpen(true);
              }}
              className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Add-on</span>
            </button>
          )}
        </div>

        {isFormOpen && (
          <div className={`${theme.card} border rounded-2xl p-6 space-y-4`}>
            <div className="flex justify-between items-center border-b border-neutral-850 pb-3">
              <h4 className="text-xs font-black uppercase tracking-widest font-mono text-amber-500">
                {editingId ? 'Edit Add-on Service' : 'Add New Add-on Service'}
              </h4>
              <button onClick={resetForm} className="text-neutral-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSaveAddon} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-bold uppercase text-neutral-400">Add-on Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. English Speaking Guide"
                  value={form.name || ''}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className={`w-full ${theme.input} border px-4 py-2 text-xs rounded-xl focus:outline-none`}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-400">Price (USD)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 10"
                  value={form.priceUSD === undefined ? '' : form.priceUSD}
                  onChange={e => setForm({ ...form, priceUSD: Number(e.target.value) })}
                  className={`w-full ${theme.input} border px-4 py-2 text-xs rounded-xl focus:outline-none`}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-400">Price (IDR)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 150000"
                  value={form.priceIDR === undefined ? '' : form.priceIDR}
                  onChange={e => setForm({ ...form, priceIDR: Number(e.target.value) })}
                  className={`w-full ${theme.input} border px-4 py-2 text-xs rounded-xl focus:outline-none`}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-400">Pricing Multiplier</label>
                <select
                  value={form.pricingType || 'Fixed'}
                  onChange={e => setForm({ ...form, pricingType: e.target.value })}
                  className={`w-full ${theme.input} border px-4 py-2 text-xs rounded-xl focus:outline-none`}
                >
                  <option value="Per Day">Per Day (Sewa Harian)</option>
                  <option value="Fixed">Flat Single Fee (Sekali Bayar)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-400">Display Order</label>
                <input
                  type="number"
                  value={form.displayOrder || ''}
                  onChange={e => setForm({ ...form, displayOrder: e.target.value })}
                  className={`w-full ${theme.input} border px-4 py-2 text-xs rounded-xl focus:outline-none`}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-400">Status</label>
                <select
                  value={form.status || 'Active'}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  className={`w-full ${theme.input} border px-4 py-2 text-xs rounded-xl focus:outline-none`}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-400">Applicable Car Class</label>
                <input
                  type="text"
                  placeholder="all or standard, luxury"
                  value={form.applicableCategories || 'all'}
                  onChange={e => setForm({ ...form, applicableCategories: e.target.value })}
                  className={`w-full ${theme.input} border px-4 py-2 text-xs rounded-xl focus:outline-none`}
                />
              </div>
              <div className="md:col-span-3 space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-400">Description</label>
                <input
                  type="text"
                  placeholder="Explain details of this addon service"
                  value={form.description || ''}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className={`w-full ${theme.input} border px-4 py-2 text-xs rounded-xl focus:outline-none`}
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="isRequired"
                  checked={form.isRequired || false}
                  onChange={e => setForm({ ...form, isRequired: e.target.checked })}
                  className="h-4.5 w-4.5 rounded border-neutral-850 bg-neutral-900 text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="isRequired" className="text-xs text-neutral-300 font-bold select-none cursor-pointer">Required addon (Wajib)</label>
              </div>
              <div className="md:col-span-4 flex justify-end gap-2 pt-2">
                <button type="button" onClick={resetForm} className="px-4 py-2 text-xs text-neutral-400 hover:text-white">Cancel</button>
                <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs px-5 py-2 rounded-xl">Save Add-on</button>
              </div>
            </form>
          </div>
        )}

        <div className={`${theme.card} border rounded-2xl overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-850 font-mono text-neutral-400 uppercase bg-neutral-950/20">
                  <th className="p-4">Addon Name</th>
                  <th className="p-4">Rate</th>
                  <th className="p-4">Multiplier</th>
                  <th className="p-4">Wajib / Opsional</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-850/40">
                {rentalAddons.sort((a,b) => a.displayOrder - b.displayOrder).map(addon => (
                  <tr key={addon.id} className="hover:bg-neutral-950/10">
                    <td className="p-4 font-bold text-white uppercase">{addon.name}</td>
                    <td className="p-4 font-mono font-bold text-amber-500 text-sm">{formatPrice(addon.priceUSD, addon.priceIDR)}</td>
                    <td className="p-4 font-mono">{addon.pricingType === 'Per Day' ? 'Daily multiplier' : 'Flat rate'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${addon.isRequired ? 'bg-amber-500/15 text-amber-500 border border-amber-500/20' : 'bg-neutral-800 text-neutral-400'}`}>
                        {addon.isRequired ? 'Required' : 'Optional'}
                      </span>
                    </td>
                    <td className="p-4 text-neutral-400 italic max-w-xs truncate">{addon.description || '-'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${addon.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                        {addon.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setForm({
                            name: addon.name,
                            description: addon.description,
                            priceUSD: addon.priceUSD,
                            priceIDR: addon.priceIDR,
                            pricingType: addon.pricingType,
                            isRequired: addon.isRequired,
                            status: addon.status,
                            displayOrder: addon.displayOrder,
                            applicableCategories: Array.isArray(addon.applicableCategories) ? addon.applicableCategories.join(', ') : addon.applicableCategories
                          });
                          setEditingId(addon.id);
                          setIsFormOpen(true);
                        }}
                        className="p-1 text-neutral-400 hover:text-amber-500"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDeleteAddon(addon.id, addon.name)} className="p-1 text-neutral-400 hover:text-rose-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // --- 9. BOOKINGS LIST VIEW ---
  if (activeSubTab === 'bookings') {
    return (
      <div className="space-y-6 animate-fade-in text-left">
        <div>
          <h3 className="text-base font-black uppercase tracking-wider font-mono text-amber-500">CAR RENTAL BOOKINGS</h3>
          <p className={`text-xs ${theme.textSecondary}`}>Review and manage physical fleet dispatch requests from your web clients.</p>
        </div>

        <div className={`${theme.card} border rounded-2xl overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-850 font-mono text-neutral-400 uppercase bg-neutral-950/20">
                  <th className="p-4">Booking ID</th>
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">Vehicle &amp; Territory</th>
                  <th className="p-4">Pickup / Drop-off</th>
                  <th className="p-4">Duration &amp; Date</th>
                  <th className="p-4">Price Charged</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-850/40">
                {rentalBookings.map((b, idx) => (
                  <tr key={b.id || idx} className="hover:bg-neutral-950/10">
                    <td className="p-4 font-mono text-neutral-400 font-bold">{b.id || `CR-${1000 + idx}`}</td>
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <span className="font-extrabold text-white block uppercase">{b.customerName}</span>
                        <span className="text-[10px] text-neutral-400 font-mono block">{b.customerPhone}</span>
                        <span className="text-[10px] text-neutral-500 block font-mono">{b.customerEmail}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <span className="font-extrabold text-white block">{b.serviceName}</span>
                        <div className="flex flex-wrap gap-1">
                          {b.details.operationalCity && (
                            <span className="inline-block text-[9px] font-mono font-bold bg-amber-500/15 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/20">
                              {b.details.operationalCity}
                            </span>
                          )}
                          {b.details.withDriver !== undefined && (
                            <span className={`inline-block text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${b.details.withDriver ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20' : 'bg-neutral-800 text-neutral-400 border-neutral-750'}`}>
                              {b.details.withDriver ? 'With Driver' : 'Self Drive'}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1.5 font-mono text-neutral-300">
                        {b.details.pickupArea ? (
                          <>
                            <div className="space-y-0.5">
                              <span className="block font-bold text-white">📍 Pickup: {b.details.pickupArea}</span>
                              <span className="block text-[9px] text-neutral-500">Admin zone: {b.details.pickupZone || 'Zone 0'}</span>
                            </div>
                            <div className="space-y-0.5">
                              <span className="block font-bold text-neutral-200">🏁 Dropoff: {b.details.dropoffArea}</span>
                              <span className="block text-[9px] text-neutral-500">Admin zone: {b.details.dropoffZone || 'Zone 0'}</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="block font-bold">📍 Pickup: {b.details.pickupLocation || 'Unknown'}</span>
                            <span className="block text-[10px] text-neutral-400">🏁 Dropoff: {b.details.destination || 'Unknown'}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-neutral-200 block font-mono">📅 {b.details.date} ({b.details.time || '08:00'})</span>
                        <span className="text-[10px] text-neutral-400 block">{b.details.days || 1} Days Rent</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1.5">
                        <div className="font-mono font-black text-amber-500 text-sm">
                          {formatPrice(b.totalPrice, b.totalPriceIDR)}
                        </div>
                        {b.details.pricingBreakdown && (
                          <div className="text-[9px] font-mono text-neutral-400 bg-neutral-950/40 p-1.5 rounded border border-neutral-850/60 space-y-0.5 max-w-[180px]">
                            <div className="flex justify-between gap-2">
                              <span>Base x{b.details.pricingBreakdown.days}:</span>
                              <span className="text-neutral-300">{formatPrice(b.details.pricingBreakdown.basePriceUSD * b.details.pricingBreakdown.days, b.details.pricingBreakdown.basePriceIDR * b.details.pricingBreakdown.days)}</span>
                            </div>
                            {b.details.pricingBreakdown.surchargeUSD > 0 && (
                              <div className="flex justify-between gap-2 text-rose-400">
                                <span>Surcharge:</span>
                                <span>+{formatPrice(b.details.pricingBreakdown.surchargeUSD, b.details.pricingBreakdown.surchargeIDR)}</span>
                              </div>
                            )}
                            {b.details.pricingBreakdown.addonsTotalUSD > 0 && (
                              <div className="flex justify-between gap-2 text-emerald-400">
                                <span>Add-ons:</span>
                                <span>+{formatPrice(b.details.pricingBreakdown.addonsTotalUSD, b.details.pricingBreakdown.addonsTotalIDR)}</span>
                              </div>
                            )}
                          </div>
                        )}
                        {b.details.selectedAddons && b.details.selectedAddons.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {b.details.selectedAddons.map((addon, aIdx) => (
                              <span key={aIdx} className="text-[8px] font-mono bg-neutral-800 text-neutral-400 px-1 py-0.2 rounded">
                                + {addon}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-mono font-black uppercase ${getStatusBadge(b.status)}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <select
                        value={b.status}
                        onChange={e => handleStatusChange(b.id, e.target.value)}
                        className={`${theme.input} border px-2 py-1 text-[10px] rounded focus:outline-none focus:border-amber-500 font-mono cursor-pointer`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {rentalBookings.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-neutral-500">No car rental bookings recorded.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (activeSubTab === 'settings') {
    const { serviceLimits, setServiceLimit } = useApp();
    return (
      <div className="space-y-6 animate-fade-in text-left">
        <div>
          <h3 className="text-base font-black uppercase tracking-wider font-mono text-amber-500">CAR RENTAL CONFIGURATION &amp; SETTINGS</h3>
          <p className="text-xs text-neutral-400">Ubah parameter kapasitas harian dan aturan operasional Car Rental.</p>
        </div>

        <div className={`${theme.card} border rounded-2xl p-6 space-y-6`}>
          <h4 className="text-xs font-black uppercase tracking-widest font-mono text-amber-500 border-b border-neutral-850 pb-2">
            Operational Rules Definition
          </h4>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-wider block">Limit Booking Harian (Car Rental Quota)</label>
                <input 
                  type="number" 
                  min={1}
                  max={100}
                  value={serviceLimits?.rental ?? 5} 
                  onChange={(e) => setServiceLimit('rental', parseInt(e.target.value, 10) || 5)}
                  className={`w-full ${theme.input} border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500`} 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-wider block">Minimal Reservasi (Hari-H)</label>
                <input type="number" defaultValue="1" className={`w-full ${theme.input} border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500`} />
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-850 flex justify-end">
              <button onClick={() => triggerToast('Pengaturan Konfigurasi Rental Disimpan')} className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer border-0">
                <Save className="h-4 w-4" />
                <span>Simpan Pengaturan</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
