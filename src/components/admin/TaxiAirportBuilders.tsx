import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Search, ArrowRight, Check, MapPin, 
  Globe, Plane, Landmark, Copy, RefreshCw, Sparkles, Sliders 
} from 'lucide-react';
import { 
  useAutoSaveDraft, 
  AutoSaveStatusBadge, 
  DraftRecoveryBanner 
} from './AutoSaveDraftComponents';
import { clearDraft } from '../../utils/adminDraftStorage';

interface TaxiRoute {
  id: string;
  code: string;
  name: string;
  pickupCity: string;
  pickupArea: string;
  destinationCity: string;
  destinationArea: string;
  vehicle: string;
  maxPassengers: number;
  maxLuggage: number;
  price: number; // USD
  priceIDR: number; // IDR
  status: 'Active' | 'Inactive';
}

interface AirportTransfer {
  id: string;
  airportName: string;
  terminal?: string;
  direction: 'Arrival' | 'Departure';
  destinationArea: string;
  vehicle: string;
  maxPassengers: number;
  maxLuggage: number;
  meetAndGreet: boolean;
  flightNumRequired: boolean;
  price: number; // USD
  priceIDR: number; // IDR
  status: 'Active' | 'Inactive';
}

const VEHICLE_PRESETS = [
  { name: 'Toyota Avanza Veloz', passengers: 4, luggage: 2 },
  { name: 'Toyota Innova Reborn', passengers: 6, luggage: 4 },
  { name: 'Toyota HiAce Commuter', passengers: 12, luggage: 6 },
  { name: 'Toyota Alphard VIP', passengers: 5, luggage: 4 }
];

export default function TaxiAirportBuilders({ 
  triggerNotification,
  formatPrice,
  role = 'central'
}: { 
  triggerNotification: (title: string, msg: string, type: 'success' | 'warning' | 'info') => void;
  formatPrice: (usd: number, idr: number) => string;
  role?: 'central' | 'tour' | 'rental' | 'taxi' | 'airport';
}) {
  const [activeSubTab, setActiveSubTab] = useState<'taxi' | 'airport'>(role === 'airport' ? 'airport' : 'taxi');

  // Sync sub-tab selection with role changes
  useEffect(() => {
    if (role === 'taxi') {
      setActiveSubTab('taxi');
    } else if (role === 'airport') {
      setActiveSubTab('airport');
    }
  }, [role]);

  // Core States
  const [taxiRoutes, setTaxiRoutes] = useState<TaxiRoute[]>([]);
  const [airportTransfers, setAirportTransfers] = useState<AirportTransfer[]>([]);

  // Search & Filter
  const [taxiSearch, setTaxiSearch] = useState('');
  const [airportSearch, setAirportSearch] = useState('');

  // Forms
  const [isTaxiModalOpen, setIsTaxiModalOpen] = useState(false);
  const [taxiForm, setTaxiForm] = useState({
    id: '',
    pickupCity: 'Malang',
    pickupArea: 'Stasiun Malang Kotabaru',
    destinationCity: 'Surabaya',
    destinationArea: 'Bandara Juanda T1',
    vehicleIndex: 1, // Innova Reborn
    priceIDR: 650000,
    priceUSD: 43,
    status: 'Active' as 'Active' | 'Inactive'
  });

  const [isAirportModalOpen, setIsAirportModalOpen] = useState(false);
  const [airportForm, setAirportForm] = useState({
    id: '',
    airportName: 'Bandara Juanda (SUB)',
    terminal: 'Terminal 2 Internasional',
    direction: 'Arrival' as 'Arrival' | 'Departure',
    destinationArea: 'Malang Kota / Batu Villa',
    vehicleIndex: 1,
    meetAndGreet: true,
    flightNumRequired: true,
    priceIDR: 600000,
    priceUSD: 40,
    status: 'Active' as 'Active' | 'Inactive'
  });

  // Auto-Save Draft for Fixed-Route Taxi Service
  const {
    saveStatus: taxiSaveStatus,
    lastSaved: taxiLastSaved,
    isOnline: taxiIsOnline,
    detectedDraft: taxiDraft,
    showRecoveryBanner: showTaxiRecoveryBanner,
    handleRecover: recoverTaxiDraft,
    handleDiscard: discardTaxiDraft,
    performSave: performTaxiSave,
    clearCurrentDraft: clearTaxiDraft
  } = useAutoSaveDraft<typeof taxiForm>({
    type: 'service',
    subType: 'taxi',
    targetId: taxiForm.id || 'new',
    title: taxiForm.pickupArea && taxiForm.destinationArea ? `${taxiForm.pickupArea} ➔ ${taxiForm.destinationArea}` : 'Rute Taxi Baru',
    data: taxiForm,
    isEditing: Boolean(taxiForm.id),
    enabled: isTaxiModalOpen,
    debounceMs: 750,
    hasUnsavedContent: Boolean(taxiForm.pickupArea?.trim() || taxiForm.destinationArea?.trim() || taxiForm.id),
    onRecover: (draft) => {
      if (draft.data) {
        setTaxiForm(draft.data);
        triggerNotification('Draft Dipulihkan', 'Data formulir taxi berhasil dipulihkan dari draft', 'success');
      }
    }
  });

  // Auto-Save Draft for Airport Transfer Service
  const {
    saveStatus: airportSaveStatus,
    lastSaved: airportLastSaved,
    isOnline: airportIsOnline,
    detectedDraft: airportDraft,
    showRecoveryBanner: showAirportRecoveryBanner,
    handleRecover: recoverAirportDraft,
    handleDiscard: discardAirportDraft,
    performSave: performAirportSave,
    clearCurrentDraft: clearAirportDraft
  } = useAutoSaveDraft<typeof airportForm>({
    type: 'service',
    subType: 'airport_transfer',
    targetId: airportForm.id || 'new',
    title: airportForm.destinationArea ? `${airportForm.airportName} ➔ ${airportForm.destinationArea}` : 'Airport Transfer Baru',
    data: airportForm,
    isEditing: Boolean(airportForm.id),
    enabled: isAirportModalOpen,
    debounceMs: 750,
    hasUnsavedContent: Boolean(airportForm.destinationArea?.trim() || airportForm.id),
    onRecover: (draft) => {
      if (draft.data) {
        setAirportForm(draft.data);
        triggerNotification('Draft Dipulihkan', 'Data formulir airport transfer berhasil dipulihkan dari draft', 'success');
      }
    }
  });

  // Load Seed Databases
  useEffect(() => {
    const storedTaxi = localStorage.getItem('sj_taxi_routes');
    if (storedTaxi) {
      try { setTaxiRoutes(JSON.parse(storedTaxi)); } catch(e){}
    } else {
      const defaultTaxi: TaxiRoute[] = [
        { id: 'tx-1', code: 'TX-MLG-SUB-01', name: 'Malang Town ➔ Surabaya City Center', pickupCity: 'Malang', pickupArea: 'Malang Downtown', destinationCity: 'Surabaya', destinationArea: 'Tunjungan Plaza Area', vehicle: 'Toyota Innova Reborn', maxPassengers: 6, maxLuggage: 4, price: 43, priceIDR: 650000, status: 'Active' },
        { id: 'tx-2', code: 'TX-SUB-MLG-02', name: 'Surabaya Airport ➔ Malang / Batu', pickupCity: 'Surabaya', pickupArea: 'Juanda Airport T1', destinationCity: 'Malang', destinationArea: 'Batu Tourist Center', vehicle: 'Toyota Avanza Veloz', maxPassengers: 4, maxLuggage: 2, price: 38, priceIDR: 580000, status: 'Active' },
        { id: 'tx-3', code: 'TX-DPS-UBUD-03', name: 'Denpasar ➔ Ubud Fixed Shuttle', pickupCity: 'Denpasar (Bali)', pickupArea: 'Kuta Beach Area', destinationCity: 'Gianyar (Bali)', destinationArea: 'Ubud Center Palace', vehicle: 'Toyota Innova Reborn', maxPassengers: 6, maxLuggage: 4, price: 30, priceIDR: 450000, status: 'Active' }
      ];
      setTaxiRoutes(defaultTaxi);
      localStorage.setItem('sj_taxi_routes', JSON.stringify(defaultTaxi));
    }

    const storedAirport = localStorage.getItem('sj_airport_transfers');
    if (storedAirport) {
      try { setAirportTransfers(JSON.parse(storedAirport)); } catch(e){}
    } else {
      const defaultAirport: AirportTransfer[] = [
        { id: 'ap-1', airportName: 'Juanda Airport (SUB)', terminal: 'Terminal 1 Domestik', direction: 'Arrival', destinationArea: 'Malang Hotel Area', vehicle: 'Toyota Innova Reborn', maxPassengers: 6, maxLuggage: 4, meetAndGreet: true, flightNumRequired: true, price: 40, priceIDR: 600000, status: 'Active' },
        { id: 'ap-2', airportName: 'Ngurah Rai Airport (DPS)', terminal: 'Terminal Internasional', direction: 'Arrival', destinationArea: 'Ubud Village Villa', vehicle: 'Toyota Avanza Veloz', maxPassengers: 4, maxLuggage: 2, meetAndGreet: true, flightNumRequired: true, price: 28, priceIDR: 420000, status: 'Active' },
        { id: 'ap-3', airportName: 'Juanda Airport (SUB)', terminal: 'Terminal 2 Internasional', direction: 'Departure', destinationArea: 'Batu Resort Area', vehicle: 'Toyota HiAce Commuter', maxPassengers: 12, maxLuggage: 6, meetAndGreet: false, flightNumRequired: true, price: 78, priceIDR: 1200000, status: 'Active' }
      ];
      setAirportTransfers(defaultAirport);
      localStorage.setItem('sj_airport_transfers', JSON.stringify(defaultAirport));
    }
  }, []);

  // Save taxi
  const handleSaveTaxi = (e: React.FormEvent) => {
    e.preventDefault();
    const preset = VEHICLE_PRESETS[taxiForm.vehicleIndex];
    const isEditing = taxiForm.id !== '';
    const newId = isEditing ? taxiForm.id : `tx-${Date.now()}`;
    const code = isEditing ? taxiRoutes.find(r => r.id === taxiForm.id)?.code || `TX-R-${Math.floor(100+Math.random()*900)}` : `TX-R-${Math.floor(100+Math.random()*900)}`;

    const newRoute: TaxiRoute = {
      id: newId,
      code,
      name: `${taxiForm.pickupArea} ➔ ${taxiForm.destinationArea}`,
      pickupCity: taxiForm.pickupCity,
      pickupArea: taxiForm.pickupArea,
      destinationCity: taxiForm.destinationCity,
      destinationArea: taxiForm.destinationArea,
      vehicle: preset.name,
      maxPassengers: preset.passengers,
      maxLuggage: preset.luggage,
      price: Number(taxiForm.priceUSD),
      priceIDR: Number(taxiForm.priceIDR),
      status: taxiForm.status
    };

    let updated: TaxiRoute[] = [];
    if (isEditing) {
      updated = taxiRoutes.map(r => r.id === taxiForm.id ? newRoute : r);
      triggerNotification('Route Updated', 'Fixed-Route Taxi service updated', 'success');
    } else {
      updated = [newRoute, ...taxiRoutes];
      triggerNotification('Route Created', 'New Fixed-Route Taxi route published', 'success');
    }

    setTaxiRoutes(updated);
    localStorage.setItem('sj_taxi_routes', JSON.stringify(updated));
    clearTaxiDraft();
    setIsTaxiModalOpen(false);
  };

  // Duplicate taxi
  const handleDuplicateTaxi = (route: TaxiRoute) => {
    const dup: TaxiRoute = {
      ...route,
      id: `tx-${Date.now()}`,
      code: `TX-DUP-${Math.floor(100+Math.random()*900)}`,
      name: `${route.name} (DUPLICATE)`
    };
    const updated = [dup, ...taxiRoutes];
    setTaxiRoutes(updated);
    localStorage.setItem('sj_taxi_routes', JSON.stringify(updated));
    triggerNotification('Route Duplicated', 'Duplicated fixed-route taxi route successfully', 'success');
  };

  // Delete Taxi
  const handleDeleteTaxi = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus rute taxi ini? (Soft Delete)')) {
      const updated = taxiRoutes.filter(r => r.id !== id);
      setTaxiRoutes(updated);
      localStorage.setItem('sj_taxi_routes', JSON.stringify(updated));
      triggerNotification('Route Deleted', 'Fixed route taxi has been deleted from active builder index', 'warning');
    }
  };

  // Save Airport
  const handleSaveAirport = (e: React.FormEvent) => {
    e.preventDefault();
    const preset = VEHICLE_PRESETS[airportForm.vehicleIndex];
    const isEditing = airportForm.id !== '';
    const newId = isEditing ? airportForm.id : `ap-${Date.now()}`;

    const newTransfer: AirportTransfer = {
      id: newId,
      airportName: airportForm.airportName,
      terminal: airportForm.terminal,
      direction: airportForm.direction,
      destinationArea: airportForm.destinationArea,
      vehicle: preset.name,
      maxPassengers: preset.passengers,
      maxLuggage: preset.luggage,
      meetAndGreet: airportForm.meetAndGreet,
      flightNumRequired: airportForm.flightNumRequired,
      price: Number(airportForm.priceUSD),
      priceIDR: Number(airportForm.priceIDR),
      status: airportForm.status
    };

    let updated: AirportTransfer[] = [];
    if (isEditing) {
      updated = airportTransfers.map(t => t.id === airportForm.id ? newTransfer : t);
      triggerNotification('Service Updated', 'Airport transfer profile updated', 'success');
    } else {
      updated = [newTransfer, ...airportTransfers];
      triggerNotification('Service Published', 'New Airport Shuttle route published successfully', 'success');
    }

    setAirportTransfers(updated);
    localStorage.setItem('sj_airport_transfers', JSON.stringify(updated));
    clearAirportDraft();
    setIsAirportModalOpen(false);
  };

  // Duplicate Airport
  const handleDuplicateAirport = (transfer: AirportTransfer) => {
    const dup: AirportTransfer = {
      ...transfer,
      id: `ap-${Date.now()}`,
      destinationArea: `${transfer.destinationArea} (Copy)`
    };
    const updated = [dup, ...airportTransfers];
    setAirportTransfers(updated);
    localStorage.setItem('sj_airport_transfers', JSON.stringify(updated));
    triggerNotification('Service Duplicated', 'Duplicated airport transfer profile', 'success');
  };

  // Delete Airport
  const handleDeleteAirport = (id: string) => {
    if (confirm('Hapus profil transfer bandara ini?')) {
      const updated = airportTransfers.filter(t => t.id !== id);
      setAirportTransfers(updated);
      localStorage.setItem('sj_airport_transfers', JSON.stringify(updated));
      triggerNotification('Deleted', 'Airport shuttle plan deleted', 'warning');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-neutral-100">
      
      {/* Sub Tabs Toggle bar */}
      {role === 'central' && (
        <div className="flex border-b border-neutral-800 gap-6">
          <button
            onClick={() => setActiveSubTab('taxi')}
            className={`pb-3 font-extrabold text-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'taxi' ? 'text-amber-500 border-b-2 border-amber-500 font-black' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sliders className="h-4 w-4" />
            <span>Database Rute Taxi (Fixed Route)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('airport')}
            className={`pb-3 font-extrabold text-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'airport' ? 'text-amber-500 border-b-2 border-amber-500 font-black' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Plane className="h-4 w-4" />
            <span>Database Airport Transfer</span>
          </button>
        </div>
      )}

      {/* TAXI BUILDER TAB */}
      {activeSubTab === 'taxi' && (
        <div className="space-y-6">
          <div className="bg-neutral-900/60 border border-neutral-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-extrabold text-sm uppercase tracking-wider text-neutral-300">Central Taxi Route Builder</h4>
              <p className="text-[11px] text-neutral-500">Buat rute manual dengan harga flat tetap. Bebas Biaya Google Maps API</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Cari Kota / Area..."
                  value={taxiSearch}
                  onChange={(e) => setTaxiSearch(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-neutral-200"
                />
              </div>
              <button
                onClick={() => {
                  setTaxiForm({
                    id: '',
                    pickupCity: 'Malang',
                    pickupArea: 'Stasiun Malang Kotabaru',
                    destinationCity: 'Surabaya',
                    destinationArea: 'Bandara Juanda T1',
                    vehicleIndex: 1,
                    priceIDR: 650000,
                    priceUSD: 43,
                    status: 'Active'
                  });
                  setIsTaxiModalOpen(true);
                }}
                className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-md"
              >
                <Plus className="h-4 w-4" />
                <span>Buat Rute Taxi Baru</span>
              </button>
            </div>
          </div>

          {/* Taxi Table list */}
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-950 text-neutral-400 text-[10px] font-bold uppercase tracking-wider">
                    <th className="py-4 px-6">ID Code</th>
                    <th className="py-4 px-6">Informasi Rute (Flat Route)</th>
                    <th className="py-4 px-6">Armada Assigned</th>
                    <th className="py-4 px-6 text-right">Harga Fixed Flat</th>
                    <th className="py-4 px-6 text-center">Status Publish</th>
                    <th className="py-4 px-6 text-center">Tindakan Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-850 text-xs font-semibold text-neutral-300">
                  {taxiRoutes
                    .filter(r => r.name.toLowerCase().includes(taxiSearch.toLowerCase()) || r.pickupCity.toLowerCase().includes(taxiSearch.toLowerCase()))
                    .map((r) => (
                      <tr key={r.id} className="hover:bg-neutral-900/20 transition-all">
                        <td className="py-4 px-6 font-mono text-neutral-400 font-bold">{r.code}</td>
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <span className="font-extrabold text-neutral-100 flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                              <span>{r.pickupCity} ({r.pickupArea})</span>
                              <ArrowRight className="h-3 w-3 text-neutral-500" />
                              <span>{r.destinationCity} ({r.destinationArea})</span>
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-mono text-neutral-400">
                          <span className="font-bold">{r.vehicle}</span>
                          <span className="text-[10px] text-neutral-500 block">Cap: 👥 {r.maxPassengers} pax • 💼 {r.maxLuggage} lug</span>
                        </td>
                        <td className="py-4 px-6 text-right font-black text-amber-500 font-mono text-sm">
                          {formatPrice(r.price, r.priceIDR)}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border ${
                            r.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-neutral-800 text-neutral-500 border-neutral-700'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                const idx = VEHICLE_PRESETS.findIndex(p => p.name === r.vehicle);
                                setTaxiForm({
                                  id: r.id,
                                  pickupCity: r.pickupCity,
                                  pickupArea: r.pickupArea,
                                  destinationCity: r.destinationCity,
                                  destinationArea: r.destinationArea,
                                  vehicleIndex: idx !== -1 ? idx : 1,
                                  priceIDR: r.priceIDR,
                                  priceUSD: r.price,
                                  status: r.status
                                });
                                setIsTaxiModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-750 transition-all border border-neutral-700"
                              title="Edit Route Parameters"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDuplicateTaxi(r)}
                              className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-all border border-amber-500/20"
                              title="Duplikat Layanan"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTaxi(r.id)}
                              className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all border border-rose-500/20"
                              title="Delete (Soft Delete)"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                  ))}
                  {taxiRoutes.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-neutral-500 font-medium">Belum ada rute taxi terdaftar.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* AIRPORT SHUTTLE TAB */}
      {activeSubTab === 'airport' && (
        <div className="space-y-6">
          <div className="bg-neutral-900/60 border border-neutral-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-extrabold text-sm uppercase tracking-wider text-neutral-300">Central Airport Shuttle Builder</h4>
              <p className="text-[11px] text-neutral-500">Menejemen layanan transfer bandara dengan penjemputan (Arrival) &amp; pengantaran (Departure) yang efisien</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Cari Bandara / Area..."
                  value={airportSearch}
                  onChange={(e) => setAirportSearch(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-neutral-200"
                />
              </div>
              <button
                onClick={() => {
                  setAirportForm({
                    id: '',
                    airportName: 'Bandara Juanda (SUB)',
                    terminal: 'Terminal 1 Domestik',
                    direction: 'Arrival',
                    destinationArea: 'Malang Kota / Batu Villa',
                    vehicleIndex: 1,
                    meetAndGreet: true,
                    flightNumRequired: true,
                    priceIDR: 600000,
                    priceUSD: 40,
                    status: 'Active'
                  });
                  setIsAirportModalOpen(true);
                }}
                className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-md"
              >
                <Plus className="h-4 w-4" />
                <span>Buat Airport Shuttle Baru</span>
              </button>
            </div>
          </div>

          {/* Airport Shuttle lists */}
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-950 text-neutral-400 text-[10px] font-bold uppercase tracking-wider">
                    <th className="py-4 px-6">Tipe Layanan</th>
                    <th className="py-4 px-6">Hub Bandara (Airport)</th>
                    <th className="py-4 px-6">Area Destinasi</th>
                    <th className="py-4 px-6">Unit Mobil</th>
                    <th className="py-4 px-6 text-right">Harga Tetap</th>
                    <th className="py-4 px-6 text-center">Meet &amp; Greet</th>
                    <th className="py-4 px-6 text-center">Tindakan Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-850 text-xs font-semibold text-neutral-300">
                  {airportTransfers
                    .filter(t => t.airportName.toLowerCase().includes(airportSearch.toLowerCase()) || t.destinationArea.toLowerCase().includes(airportSearch.toLowerCase()))
                    .map((t) => (
                      <tr key={t.id} className="hover:bg-neutral-900/20 transition-all">
                        <td className="py-4 px-6">
                          <span className={`text-[9px] font-black px-2.5 py-1 rounded-md border ${
                            t.direction === 'Arrival' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          }`}>
                            ✈️ {t.direction === 'Arrival' ? 'Arrival (Penjemputan)' : 'Departure (Pengantaran)'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-0.5">
                            <span className="font-extrabold text-neutral-100 block">{t.airportName}</span>
                            <span className="text-[10px] text-neutral-500 block font-mono">{t.terminal || 'Semua Terminal'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-extrabold text-neutral-200">
                          {t.destinationArea}
                        </td>
                        <td className="py-4 px-6 font-mono text-neutral-400">
                          <span className="font-bold">{t.vehicle}</span>
                          <span className="text-[10px] text-neutral-500 block">Cap: 👥 {t.maxPassengers} • 💼 {t.maxLuggage}</span>
                        </td>
                        <td className="py-4 px-6 text-right font-black text-amber-500 font-mono text-sm">
                          {formatPrice(t.price, t.priceIDR)}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`text-[10px] font-bold ${t.meetAndGreet ? 'text-emerald-400' : 'text-neutral-500'}`}>
                            {t.meetAndGreet ? '✅ Ya (Included)' : '❌ Tidak'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                const idx = VEHICLE_PRESETS.findIndex(p => p.name === t.vehicle);
                                setAirportForm({
                                  id: t.id,
                                  airportName: t.airportName,
                                  terminal: t.terminal || '',
                                  direction: t.direction,
                                  destinationArea: t.destinationArea,
                                  vehicleIndex: idx !== -1 ? idx : 1,
                                  meetAndGreet: t.meetAndGreet,
                                  flightNumRequired: t.flightNumRequired,
                                  priceIDR: t.priceIDR,
                                  priceUSD: t.price,
                                  status: t.status
                                });
                                setIsAirportModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-750 border border-neutral-700 transition-all"
                              title="Edit Parameters"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDuplicateAirport(t)}
                              className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20 transition-all"
                              title="Duplikat Layanan"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteAirport(t.id)}
                              className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-all"
                              title="Hapus Layanan"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                  ))}
                  {airportTransfers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-neutral-500 font-medium">Belum ada transfer bandara terdaftar.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAXI MODAL BUILDER */}
      {isTaxiModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-amber-600 font-mono tracking-widest uppercase">
                {taxiForm.id ? 'EDIT TAXI SERVICE ROUTE' : 'TAXI SERVICE BUILDER ENGINE'}
              </h3>
              <AutoSaveStatusBadge
                status={taxiSaveStatus}
                lastSaved={taxiLastSaved}
                isOnline={taxiIsOnline}
                onManualSave={performTaxiSave}
              />
            </div>

            {/* Auto-Save Draft Recovery Banner */}
            {showTaxiRecoveryBanner && taxiDraft && (
              <DraftRecoveryBanner
                draft={taxiDraft}
                typeLabel={taxiForm.id ? 'Edit Rute Taxi' : 'Rute Taxi Baru'}
                onRecover={recoverTaxiDraft}
                onDiscard={discardTaxiDraft}
              />
            )}
            
            <form onSubmit={handleSaveTaxi} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-800 block uppercase">Kota Pickup (Kota Asal)</label>
                  <input
                    type="text"
                    required
                    value={taxiForm.pickupCity}
                    onChange={(e) => setTaxiForm({ ...taxiForm, pickupCity: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900 placeholder:text-slate-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-800 block uppercase">Area / Landmark Asal</label>
                  <input
                    type="text"
                    required
                    value={taxiForm.pickupArea}
                    onChange={(e) => setTaxiForm({ ...taxiForm, pickupArea: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900 placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-800 block uppercase">Kota Destinasi (Kota Tujuan)</label>
                  <input
                    type="text"
                    required
                    value={taxiForm.destinationCity}
                    onChange={(e) => setTaxiForm({ ...taxiForm, destinationCity: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900 placeholder:text-slate-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-800 block uppercase">Area / Landmark Tujuan</label>
                  <input
                    type="text"
                    required
                    value={taxiForm.destinationArea}
                    onChange={(e) => setTaxiForm({ ...taxiForm, destinationArea: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900 placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-800 block uppercase">Spesifikasi Kendaraan &amp; Kapasitas</label>
                <select
                  value={taxiForm.vehicleIndex}
                  onChange={(e) => setTaxiForm({ ...taxiForm, vehicleIndex: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900"
                >
                  {VEHICLE_PRESETS.map((p, idx) => (
                    <option key={idx} value={idx}>{p.name} (Kapasitas: {p.passengers} pax, {p.luggage} bagasi)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-800 block uppercase">Harga Fixed (IDR)</label>
                  <input
                    type="number"
                    required
                    value={taxiForm.priceIDR}
                    onChange={(e) => setTaxiForm({ ...taxiForm, priceIDR: Number(e.target.value), priceUSD: Math.round(Number(e.target.value) / 15000) })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500 text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-800 block uppercase">Harga USD Equivalen</label>
                  <input
                    type="number"
                    required
                    value={taxiForm.priceUSD}
                    onChange={(e) => setTaxiForm({ ...taxiForm, priceUSD: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500 text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-800 block uppercase">Status Aktif</label>
                <select
                  value={taxiForm.status}
                  onChange={(e) => setTaxiForm({ ...taxiForm, status: e.target.value as any })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900"
                >
                  <option value="Active">Aktif (Published)</option>
                  <option value="Inactive">Nonaktif (Draft)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  type="submit"
                  className="flex-grow py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-extrabold text-xs transition-all cursor-pointer text-center"
                >
                  {taxiForm.id ? 'Simpan Rute Taxi' : 'Publish Rute Taxi'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsTaxiModalOpen(false)}
                  className="py-2.5 px-5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AIRPORT SHUTTLE MODAL */}
      {isAirportModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-amber-600 font-mono tracking-widest uppercase">
                {airportForm.id ? 'EDIT AIRPORT SHUTTLE ROUTE' : 'AIRPORT SHUTTLE BUILDER ENGINE'}
              </h3>
              <AutoSaveStatusBadge
                status={airportSaveStatus}
                lastSaved={airportLastSaved}
                isOnline={airportIsOnline}
                onManualSave={performAirportSave}
              />
            </div>

            {/* Auto-Save Draft Recovery Banner */}
            {showAirportRecoveryBanner && airportDraft && (
              <DraftRecoveryBanner
                draft={airportDraft}
                typeLabel={airportForm.id ? 'Edit Airport Shuttle' : 'Airport Shuttle Baru'}
                onRecover={recoverAirportDraft}
                onDiscard={discardAirportDraft}
              />
            )}
            
            <form onSubmit={handleSaveAirport} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-800 block uppercase">Tipe Penjemputan</label>
                <select
                  value={airportForm.direction}
                  onChange={(e) => setAirportForm({ ...airportForm, direction: e.target.value as any })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900"
                >
                  <option value="Arrival">Arrival (Penjemputan dari Bandara ➔ Hotel)</option>
                  <option value="Departure">Departure (Pengantaran dari Hotel ➔ Bandara)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-800 block uppercase">Nama Bandara (Airport Name)</label>
                  <input
                    type="text"
                    required
                    value={airportForm.airportName}
                    onChange={(e) => setAirportForm({ ...airportForm, airportName: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900 placeholder:text-slate-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-800 block uppercase">Terminal Penerbangan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Terminal 1 Domestik"
                    value={airportForm.terminal}
                    onChange={(e) => setAirportForm({ ...airportForm, terminal: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900 placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-800 block uppercase">Kawasan Destinasi Penjemputan / Pengantaran</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Malang Kota, Ubud Area, Seminyak"
                  value={airportForm.destinationArea}
                  onChange={(e) => setAirportForm({ ...airportForm, destinationArea: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900 placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-800 block uppercase">Pilihan Armada &amp; Spesifikasi</label>
                <select
                  value={airportForm.vehicleIndex}
                  onChange={(e) => setAirportForm({ ...airportForm, vehicleIndex: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900"
                >
                  {VEHICLE_PRESETS.map((p, idx) => (
                    <option key={idx} value={idx}>{p.name} (Kapasitas: {p.passengers} pax, {p.luggage} bagasi)</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={airportForm.meetAndGreet}
                    onChange={(e) => setAirportForm({ ...airportForm, meetAndGreet: e.target.checked })}
                    className="h-4 w-4 bg-white border-slate-300 text-amber-500 focus:ring-0 rounded"
                  />
                  <span>Layanan Meet &amp; Greet (Driver pegang papan nama)</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-800 block uppercase">Harga (IDR)</label>
                  <input
                    type="number"
                    required
                    value={airportForm.priceIDR}
                    onChange={(e) => setAirportForm({ ...airportForm, priceIDR: Number(e.target.value), priceUSD: Math.round(Number(e.target.value) / 15000) })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500 text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-800 block uppercase">Harga USD Equivalen</label>
                  <input
                    type="number"
                    required
                    value={airportForm.priceUSD}
                    onChange={(e) => setAirportForm({ ...airportForm, priceUSD: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500 text-slate-900"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  type="submit"
                  className="flex-grow py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-extrabold text-xs transition-all cursor-pointer text-center"
                >
                  {airportForm.id ? 'Simpan Shuttle' : 'Publish Shuttle'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAirportModalOpen(false)}
                  className="py-2.5 px-5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
