import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Search, Check, Users, ShieldAlert, Truck, 
  MapPin, Settings, AlertCircle, RefreshCw, CalendarDays, Star, MessageSquare 
} from 'lucide-react';

interface FleetVehicle {
  id: string;
  brandModel: string;
  plateNumber: string;
  capacity: number;
  fuelType: string;
  nextService: string;
  status: 'Available' | 'On Trip' | 'Maintenance' | 'Cleaning';
}

interface DriverProfile {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  rating: number;
  tripsCount: number;
  status: 'Online' | 'Offline' | 'On Trip' | 'On Leave';
}

interface TourGuide {
  id: string;
  name: string;
  phone?: string;
  languages: string[];
  rating: number;
  status: 'Available' | 'Booked' | 'Leave';
}

interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  tripsCount: number;
  membershipLevel: 'Platinum' | 'Gold' | 'Silver';
}

export default function ResourcesManager({
  triggerNotification
}: {
  triggerNotification: (title: string, msg: string, type: 'success' | 'warning' | 'info') => void;
}) {
  const [activeTab, setActiveTab] = useState<'vehicles' | 'drivers' | 'guides' | 'customers'>('vehicles');

  // Database States
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [guides, setGuides] = useState<TourGuide[]>([]);
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & States
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [vehicleForm, setVehicleForm] = useState({
    id: '',
    brandModel: '',
    plateNumber: '',
    capacity: 4,
    fuelType: 'Gasoline',
    nextService: '',
    status: 'Available' as any
  });

  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [driverForm, setDriverForm] = useState({
    id: '',
    name: '',
    phone: '',
    licenseNumber: '',
    rating: 5.0,
    tripsCount: 0,
    status: 'Online' as any
  });

  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [guideForm, setGuideForm] = useState({
    id: '',
    name: '',
    phone: '',
    languages: '',
    rating: 5.0,
    status: 'Available' as any
  });

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    membershipLevel: 'Silver' as any,
    tripsCount: 0
  });

  // Load Database
  useEffect(() => {
    // Vehicles
    const storedVehicles = localStorage.getItem('sj_fleet_vehicles');
    if (storedVehicles) {
      try { setVehicles(JSON.parse(storedVehicles)); } catch(e){}
    } else {
      setVehicles([]);
    }

    // Drivers
    const storedDrivers = localStorage.getItem('sj_driver_profiles');
    if (storedDrivers) {
      try { setDrivers(JSON.parse(storedDrivers)); } catch(e){}
    } else {
      setDrivers([]);
    }

    // Guides
    const storedGuides = localStorage.getItem('sj_tour_guides');
    if (storedGuides) {
      try { setGuides(JSON.parse(storedGuides)); } catch(e){}
    } else {
      setGuides([]);
    }

    // Customers
    const storedCustomers = localStorage.getItem('sj_customer_profiles');
    if (storedCustomers) {
      try { setCustomers(JSON.parse(storedCustomers)); } catch(e){}
    } else {
      setCustomers([]);
    }
  }, []);

  // Save Vehicle
  const handleSaveVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    const isEditing = vehicleForm.id !== '';
    const newId = isEditing ? vehicleForm.id : `v-${Date.now()}`;
    const newItem: FleetVehicle = {
      id: newId,
      brandModel: vehicleForm.brandModel,
      plateNumber: vehicleForm.plateNumber,
      capacity: Number(vehicleForm.capacity),
      fuelType: vehicleForm.fuelType,
      nextService: vehicleForm.nextService,
      status: vehicleForm.status
    };

    const updated = isEditing 
      ? vehicles.map(v => v.id === vehicleForm.id ? newItem : v)
      : [newItem, ...vehicles];

    setVehicles(updated);
    localStorage.setItem('sj_fleet_vehicles', JSON.stringify(updated));
    setIsVehicleModalOpen(false);
    triggerNotification('Fleet Configured', `Vehicle ${vehicleForm.plateNumber} inventory record updated`, 'success');
  };

  // Delete Vehicle
  const handleDeleteVehicle = (id: string) => {
    if (confirm('Hapus pencatatan armada ini?')) {
      const updated = vehicles.filter(v => v.id !== id);
      setVehicles(updated);
      localStorage.setItem('sj_fleet_vehicles', JSON.stringify(updated));
      triggerNotification('Fleet Removed', 'Vehicle profile deleted from SJOMS registry', 'warning');
    }
  };

  // Toggle Driver Status
  const toggleDriverStatus = (id: string, current: string) => {
    const nextStatus = current === 'Online' ? 'Offline' : 'Online';
    const updated = drivers.map(d => d.id === id ? { ...d, status: nextStatus } : d);
    setDrivers(updated as any);
    localStorage.setItem('sj_driver_profiles', JSON.stringify(updated));
    triggerNotification('Driver Shift Changed', `Driver is now ${nextStatus}`, 'info');
  };

  // Save Driver
  const handleSaveDriver = (e: React.FormEvent) => {
    e.preventDefault();
    const isEditing = driverForm.id !== '';
    const newId = isEditing ? driverForm.id : `d-${Date.now()}`;
    const newItem: DriverProfile = {
      id: newId,
      name: driverForm.name,
      phone: driverForm.phone,
      licenseNumber: driverForm.licenseNumber,
      rating: driverForm.rating,
      tripsCount: driverForm.tripsCount,
      status: driverForm.status
    };

    const updated = isEditing
      ? drivers.map(d => d.id === driverForm.id ? newItem : d)
      : [newItem, ...drivers];

    setDrivers(updated);
    localStorage.setItem('sj_driver_profiles', JSON.stringify(updated));
    setIsDriverModalOpen(false);
    triggerNotification('Driver Saved', `Driver ${driverForm.name} profile updated`, 'success');
  };

  // Delete Driver
  const handleDeleteDriver = (id: string) => {
    if (confirm('Hapus supir ini dari database?')) {
      const updated = drivers.filter(d => d.id !== id);
      setDrivers(updated);
      localStorage.setItem('sj_driver_profiles', JSON.stringify(updated));
      triggerNotification('Driver Removed', 'Driver contract database registry updated', 'warning');
    }
  };

  // Toggle Guide Status
  const toggleGuideStatus = (id: string, current: string) => {
    const nextStatus = current === 'Available' ? 'Booked' : current === 'Booked' ? 'Leave' : 'Available';
    const updated = guides.map(g => g.id === id ? { ...g, status: nextStatus } : g);
    setGuides(updated as any);
    localStorage.setItem('sj_tour_guides', JSON.stringify(updated));
    triggerNotification('Tour Guide Status Changed', `Tour Guide is now ${nextStatus}`, 'info');
  };

  // Save Guide
  const handleSaveGuide = (e: React.FormEvent) => {
    e.preventDefault();
    const isEditing = guideForm.id !== '';
    const newId = isEditing ? guideForm.id : `g-${Date.now()}`;
    const langs = guideForm.languages.split(',').map(l => l.trim()).filter(l => l !== '');
    const newItem: TourGuide = {
      id: newId,
      name: guideForm.name,
      phone: guideForm.phone,
      languages: langs,
      rating: Number(guideForm.rating),
      status: guideForm.status
    };

    const updated = isEditing
      ? guides.map(g => g.id === guideForm.id ? newItem : g)
      : [newItem, ...guides];

    setGuides(updated);
    localStorage.setItem('sj_tour_guides', JSON.stringify(updated));
    setIsGuideModalOpen(false);
    triggerNotification('Guide Saved', `Tour Guide ${guideForm.name} profile updated`, 'success');
  };

  // Delete Guide
  const handleDeleteGuide = (id: string) => {
    if (confirm('Hapus Pemandu Wisata ini dari database?')) {
      const updated = guides.filter(g => g.id !== id);
      setGuides(updated);
      localStorage.setItem('sj_tour_guides', JSON.stringify(updated));
      triggerNotification('Guide Removed', 'Tour Guide profile deleted from database registry', 'warning');
    }
  };

  // Save Customer
  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const isEditing = customerForm.id !== '';
    const newId = isEditing ? customerForm.id : `c-${Date.now()}`;
    const newItem: CustomerProfile = {
      id: newId,
      name: customerForm.name,
      email: customerForm.email,
      phone: customerForm.phone,
      membershipLevel: customerForm.membershipLevel,
      tripsCount: Number(customerForm.tripsCount)
    };

    const updated = isEditing
      ? customers.map(c => c.id === customerForm.id ? newItem : c)
      : [newItem, ...customers];

    setCustomers(updated);
    localStorage.setItem('sj_customer_profiles', JSON.stringify(updated));
    setIsCustomerModalOpen(false);
    triggerNotification('Customer Saved', `Customer profile ${customerForm.name} updated`, 'success');
  };

  // Delete Customer
  const handleDeleteCustomer = (id: string) => {
    if (confirm('Hapus pelanggan ini dari database?')) {
      const updated = customers.filter(c => c.id !== id);
      setCustomers(updated);
      localStorage.setItem('sj_customer_profiles', JSON.stringify(updated));
      triggerNotification('Customer Removed', 'Customer profile deleted from database registry', 'warning');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-neutral-100">
      
      {/* Sub Tabs Toggle bar */}
      <div className="flex border-b border-neutral-800 gap-6">
        <button
          onClick={() => { setActiveTab('vehicles'); setSearchQuery(''); }}
          className={`pb-3 font-extrabold text-sm transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'vehicles' ? 'text-amber-500 border-b-2 border-amber-500 font-black' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Truck className="h-4 w-4" />
          <span>Manajemen Armada Mobil</span>
        </button>
        <button
          onClick={() => { setActiveTab('drivers'); setSearchQuery(''); }}
          className={`pb-3 font-extrabold text-sm transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'drivers' ? 'text-amber-500 border-b-2 border-amber-500 font-black' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Database Supir</span>
        </button>
        <button
          onClick={() => { setActiveTab('guides'); setSearchQuery(''); }}
          className={`pb-3 font-extrabold text-sm transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'guides' ? 'text-amber-500 border-b-2 border-amber-500 font-black' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <CalendarDays className="h-4 w-4" />
          <span>Daftar Pemandu Wisata</span>
        </button>
        <button
          onClick={() => { setActiveTab('customers'); setSearchQuery(''); }}
          className={`pb-3 font-extrabold text-sm transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'customers' ? 'text-amber-500 border-b-2 border-amber-500 font-black' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Database Pelanggan</span>
        </button>
      </div>

      {/* SEARCH AND CONTROL TOOLBAR */}
      <div className="bg-neutral-900/60 border border-neutral-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-extrabold text-sm uppercase tracking-wider text-neutral-300">
            {activeTab === 'vehicles' && 'Pusat Inventaris Fleet Kendaraan'}
            {activeTab === 'drivers' && 'Sensus & Status Driver Smart Journey'}
            {activeTab === 'guides' && 'Pemandu Lokal Wisata Bersertifikasi'}
            {activeTab === 'customers' && 'Database Direktori & Loyalitas Pelanggan'}
          </h4>
          <p className="text-[11px] text-neutral-500">
            {activeTab === 'vehicles' && 'Atur jadwal perawatan berkala suksesi armada untuk kepuasan berkendara yang aman.'}
            {activeTab === 'drivers' && 'Pantau shift harian, alokasikan nomor SIM aktif, serta histori ulasan bintang pelanggan.'}
            {activeTab === 'guides' && 'Alokasi keahlian multi-bahasa asing (Mandarin, Inggris, Jepang) untuk pendakian Bromo / Ijen.'}
            {activeTab === 'customers' && 'Daftar rekam jejak loyalitas VIP Platinum dengan keistimewaan harga bebas deposit.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari data..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-900 placeholder:text-slate-500"
            />
          </div>
          
          {activeTab === 'vehicles' && (
            <button
              onClick={() => {
                setVehicleForm({
                  id: '',
                  brandModel: 'Toyota Innova Reborn',
                  plateNumber: 'L 1289 AA',
                  capacity: 6,
                  fuelType: 'Diesel',
                  nextService: '2026-08-15',
                  status: 'Available'
                });
                setIsVehicleModalOpen(true);
              }}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-md"
            >
              <Plus className="h-4 w-4" />
              <span>Daftar Mobil Baru</span>
            </button>
          )}

          {activeTab === 'drivers' && (
            <button
              onClick={() => {
                setDriverForm({
                  id: '',
                  name: 'Mochammad Rizky',
                  phone: '+62 812-3344-5566',
                  licenseNumber: 'SIM A - 98217312',
                  rating: 5.0,
                  tripsCount: 0,
                  status: 'Online'
                });
                setIsDriverModalOpen(true);
              }}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-md"
            >
              <Plus className="h-4 w-4" />
              <span>Daftar Supir Baru</span>
            </button>
          )}

          {activeTab === 'guides' && (
            <button
              onClick={() => {
                setGuideForm({
                  id: '',
                  name: 'Putu Wijaya',
                  phone: '+62 813-9821-2311',
                  languages: 'English, French, Indonesian',
                  rating: 5.0,
                  status: 'Available'
                });
                setIsGuideModalOpen(true);
              }}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-md"
            >
              <Plus className="h-4 w-4" />
              <span>Daftar Pemandu Baru</span>
            </button>
          )}

          {activeTab === 'customers' && (
            <button
              onClick={() => {
                setCustomerForm({
                  id: '',
                  name: 'James Bond',
                  email: 'james.bond@mi6.gov',
                  phone: '+44 7700 900077',
                  membershipLevel: 'Platinum',
                  tripsCount: 1
                });
                setIsCustomerModalOpen(true);
              }}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-md"
            >
              <Plus className="h-4 w-4" />
              <span>Daftar Pelanggan Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. VEHICLES RENDER */}
      {activeTab === 'vehicles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles
            .filter(v => v.brandModel.toLowerCase().includes(searchQuery.toLowerCase()) || v.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((v) => (
              <div key={v.id} className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between hover:border-amber-500/20 group transition-all">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-sm text-neutral-100">{v.brandModel}</h4>
                      <span className="font-mono text-[11px] text-amber-500 font-bold bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10 inline-block mt-1">
                        {v.plateNumber}
                      </span>
                    </div>
                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border uppercase font-mono ${
                      v.status === 'Available' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      v.status === 'On Trip' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      v.status === 'Maintenance' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                      'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }`}>
                      ● {v.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] font-bold text-neutral-400 border-t border-neutral-850">
                    <div>
                      <span className="text-[9px] text-neutral-500 block uppercase font-mono">Bahan Bakar</span>
                      <span>{v.fuelType}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-neutral-500 block uppercase font-mono">Kapasitas Kursi</span>
                      <span>👤 Up to {v.capacity} Pax</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[9px] text-neutral-500 block uppercase font-mono">Jadwal Servis Berkala</span>
                      <span className="text-amber-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>{v.nextService}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-neutral-850">
                  <button
                    onClick={() => {
                      setVehicleForm({
                        id: v.id,
                        brandModel: v.brandModel,
                        plateNumber: v.plateNumber,
                        capacity: v.capacity,
                        fuelType: v.fuelType,
                        nextService: v.nextService,
                        status: v.status
                      });
                      setIsVehicleModalOpen(true);
                    }}
                    className="flex-grow flex items-center justify-center gap-1 py-1.5 rounded-lg bg-neutral-800 text-xs font-bold text-neutral-300 hover:bg-neutral-750 transition-all cursor-pointer"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    <span>Parameter Servis</span>
                  </button>
                  <button
                    onClick={() => handleDeleteVehicle(v.id)}
                    className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all border border-rose-500/20 cursor-pointer"
                    title="Hapus Mobil"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
          ))}
        </div>
      )}

      {/* 2. DRIVERS RENDER */}
      {activeTab === 'drivers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drivers
            .filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.phone.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((d) => (
              <div key={d.id} className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between hover:border-amber-500/20 group transition-all">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-black font-mono">
                        {d.name.split(' ').map(n=>n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-neutral-100">{d.name}</h4>
                        <span className="text-[10px] text-neutral-500 font-mono block mt-0.5">{d.licenseNumber}</span>
                      </div>
                    </div>
                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border uppercase font-mono ${
                      d.status === 'Online' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      d.status === 'On Trip' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      'bg-neutral-800 text-neutral-500 border-neutral-700'
                    }`}>
                      ● {d.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] font-bold text-neutral-400 border-t border-neutral-850">
                    <div>
                      <span className="text-[9px] text-neutral-500 block uppercase font-mono">Hubungi Supir</span>
                      <span>{d.phone}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-neutral-500 block uppercase font-mono">Reputasi Rating</span>
                      <span className="text-amber-500 flex items-center justify-end gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-500 stroke-amber-500" />
                        <span>{d.rating}</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-neutral-500 block uppercase font-mono">Total Trip Selesai</span>
                      <span>💼 {d.tripsCount} Trips</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-neutral-850">
                  <button
                    onClick={() => toggleDriverStatus(d.id, d.status)}
                    className="flex-grow py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-xs font-bold text-amber-500 transition-all cursor-pointer"
                  >
                    {d.status === 'Online' ? 'Set Offline (Shift Off)' : 'Set Online (Shift On)'}
                  </button>
                  <button
                    onClick={() => {
                      setDriverForm({
                        id: d.id,
                        name: d.name,
                        phone: d.phone,
                        licenseNumber: d.licenseNumber,
                        rating: d.rating,
                        tripsCount: d.tripsCount,
                        status: d.status
                      });
                      setIsDriverModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-750 transition-all cursor-pointer border border-neutral-700"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteDriver(d.id)}
                    className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all border border-rose-500/20 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
          ))}
        </div>
      )}

      {/* 3. GUIDES RENDER */}
      {activeTab === 'guides' && (
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950 text-neutral-400 text-[10px] font-bold uppercase tracking-wider">
                <th className="py-4 px-6">Nama Pemandu (Tour Guide)</th>
                <th className="py-4 px-6">Bahasa Asing Dikuasai</th>
                <th className="py-4 px-6">Peringkat Rating</th>
                <th className="py-4 px-6">Status Keberangkatan</th>
                <th className="py-4 px-6 text-center">Komisi Per-Day</th>
                <th className="py-4 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-850 text-xs font-semibold text-neutral-300">
              {guides
                .filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((g) => (
                  <tr key={g.id} className="hover:bg-neutral-900/10 transition-all">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 font-extrabold text-[10px] font-mono">
                        TG
                      </div>
                      <div>
                        <span className="font-extrabold text-neutral-100 block">{g.name}</span>
                        {g.phone && <span className="text-[10px] text-neutral-500 font-mono">{g.phone}</span>}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-1.5 flex-wrap">
                        {g.languages.map((l, i) => (
                          <span key={i} className="text-[10px] bg-neutral-950 border border-neutral-800 text-neutral-400 px-2.5 py-0.5 rounded-full font-bold">
                            🗣️ {l}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-amber-500 flex items-center gap-1 font-mono font-bold text-sm">
                        <Star className="h-4.5 w-4.5 fill-amber-500 stroke-amber-500 shrink-0" />
                        <span>{g.rating.toFixed(1)}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border font-mono ${
                        g.status === 'Available' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                      }`}>
                        {g.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center font-mono text-amber-500 font-bold">
                      IDR 400.000 / Day
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleGuideStatus(g.id, g.status)}
                          className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-[10px] font-bold text-amber-500 transition-all cursor-pointer"
                        >
                          Ubah Status
                        </button>
                        <button
                          onClick={() => {
                            setGuideForm({
                              id: g.id,
                              name: g.name,
                              phone: g.phone || '',
                              languages: g.languages.join(', '),
                              rating: g.rating,
                              status: g.status
                            });
                            setIsGuideModalOpen(true);
                          }}
                          className="p-1.5 rounded bg-neutral-850 hover:bg-neutral-800 text-neutral-300 transition-all cursor-pointer border border-neutral-800"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteGuide(g.id)}
                          className="p-1.5 rounded bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 transition-all border border-rose-500/20 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. CUSTOMERS RENDER */}
      {activeTab === 'customers' && (
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950 text-neutral-400 text-[10px] font-bold uppercase tracking-wider">
                <th className="py-4 px-6">Nama Pelanggan (Customer)</th>
                <th className="py-4 px-6">Email Kontak</th>
                <th className="py-4 px-6">Nomor Telepon</th>
                <th className="py-4 px-6 text-center">Bintang Loyalitas Tiers</th>
                <th className="py-4 px-6 text-center">Total Riwayat Perjalanan</th>
                <th className="py-4 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-850 text-xs font-semibold text-neutral-300">
              {customers
                .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-900/10 transition-all">
                    <td className="py-4 px-6 font-extrabold text-neutral-200">{c.name}</td>
                    <td className="py-4 px-6 font-mono text-neutral-400">{c.email}</td>
                    <td className="py-4 px-6 font-mono text-neutral-400">{c.phone}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border font-mono uppercase ${
                        c.membershipLevel === 'Platinum' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse' : 
                        c.membershipLevel === 'Gold' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 
                        'bg-neutral-850 text-neutral-400 border-neutral-800'
                      }`}>
                        ⭐ {c.membershipLevel} VIP
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center font-mono font-bold text-neutral-400 text-sm">
                      {c.tripsCount} Booking
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setCustomerForm({
                              id: c.id,
                              name: c.name,
                              email: c.email,
                              phone: c.phone,
                              membershipLevel: c.membershipLevel,
                              tripsCount: c.tripsCount
                            });
                            setIsCustomerModalOpen(true);
                          }}
                          className="p-1.5 rounded bg-neutral-850 hover:bg-neutral-800 text-neutral-300 transition-all cursor-pointer border border-neutral-800"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(c.id)}
                          className="p-1.5 rounded bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 transition-all border border-rose-500/20 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* VEHICLE POPUP MODAL */}
      {isVehicleModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <h3 className="text-sm font-black text-amber-600 font-mono tracking-widest uppercase">ARMADA SERVICE &amp; MAINTENANCE LOGGER</h3>
            
            <form onSubmit={handleSaveVehicle} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-800 block uppercase">Brand &amp; Model Mobil</label>
                <input
                  type="text"
                  required
                  value={vehicleForm.brandModel}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, brandModel: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900 placeholder:text-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-800 block uppercase">Pelat Nomor</label>
                  <input
                    type="text"
                    required
                    value={vehicleForm.plateNumber}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, plateNumber: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500 text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-800 block uppercase">Kapasitas (Pax)</label>
                  <input
                    type="number"
                    required
                    value={vehicleForm.capacity}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, capacity: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-800 block uppercase">Jenis Bahan Bakar</label>
                  <input
                    type="text"
                    required
                    value={vehicleForm.fuelType}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, fuelType: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-800 block uppercase">Tanggal Perawatan Servis</label>
                  <input
                    type="date"
                    required
                    value={vehicleForm.nextService}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, nextService: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-800 block uppercase">Status Operasional</label>
                <select
                  value={vehicleForm.status}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, status: e.target.value as any })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900"
                >
                  <option value="Available">Tersedia (Ready)</option>
                  <option value="On Trip">Sedang Berjalan (Active Trip)</option>
                  <option value="Maintenance">Sedang Bengkel (Maintenance)</option>
                  <option value="Cleaning">Pencucian Bersih (Cleaning)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  type="submit"
                  className="flex-grow py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-extrabold text-xs transition-all cursor-pointer text-center"
                >
                  {vehicleForm.id ? 'Simpan Data Armada' : 'Publikasi Armada'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsVehicleModalOpen(false)}
                  className="py-2.5 px-5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DRIVER POPUP MODAL */}
      {isDriverModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <h3 className="text-sm font-black text-amber-600 font-mono tracking-widest uppercase">REGISTRASI DRIVER BARU</h3>
            
            <form onSubmit={handleSaveDriver} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-800 block uppercase">Nama Lengkap Supir</label>
                <input
                  type="text"
                  required
                  value={driverForm.name}
                  onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900 placeholder:text-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-800 block uppercase">Nomor WhatsApp Aktif</label>
                  <input
                    type="text"
                    required
                    value={driverForm.phone}
                    onChange={(e) => setDriverForm({ ...driverForm, phone: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900 placeholder:text-slate-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-800 block uppercase">Nomor Registrasi SIM</label>
                  <input
                    type="text"
                    required
                    value={driverForm.licenseNumber}
                    onChange={(e) => setDriverForm({ ...driverForm, licenseNumber: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-800 block uppercase">Peringkat Rating Awal</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    required
                    value={driverForm.rating}
                    onChange={(e) => setDriverForm({ ...driverForm, rating: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-800 block uppercase">Total Trips Berhasil</label>
                  <input
                    type="number"
                    required
                    value={driverForm.tripsCount}
                    onChange={(e) => setDriverForm({ ...driverForm, tripsCount: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-800 block uppercase">Status Shift</label>
                <select
                  value={driverForm.status}
                  onChange={(e) => setDriverForm({ ...driverForm, status: e.target.value as any })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900"
                >
                  <option value="Online">Online (Shift On)</option>
                  <option value="Offline">Offline (Shift Off)</option>
                  <option value="On Trip">Sedang Jalan (On Trip)</option>
                  <option value="On Leave">Cuti Tahunan (On Leave)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  type="submit"
                  className="flex-grow py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-extrabold text-xs transition-all cursor-pointer text-center"
                >
                  {driverForm.id ? 'Simpan Profil Supir' : 'Daftarkan Supir'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsDriverModalOpen(false)}
                  className="py-2.5 px-5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOUR GUIDE POPUP MODAL */}
      {isGuideModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <h3 className="text-sm font-black text-amber-600 font-mono tracking-widest uppercase">
              {guideForm.id ? 'EDIT PROFIL TOUR GUIDE' : 'DAFTARKAN TOUR GUIDE BARU'}
            </h3>
            
            <form onSubmit={handleSaveGuide} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-800 block uppercase">Nama Lengkap Pemandu</label>
                <input
                  type="text"
                  required
                  value={guideForm.name}
                  onChange={(e) => setGuideForm({ ...guideForm, name: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900 placeholder:text-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-800 block uppercase">Nomor WhatsApp Aktif</label>
                  <input
                    type="text"
                    required
                    value={guideForm.phone}
                    onChange={(e) => setGuideForm({ ...guideForm, phone: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900 placeholder:text-slate-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-800 block uppercase">Peringkat Rating Pemandu</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    required
                    value={guideForm.rating}
                    onChange={(e) => setGuideForm({ ...guideForm, rating: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-800 block uppercase">Bahasa yang Dikuasai (Pisahkan dengan Koma)</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: English, Mandarin, Indonesian"
                  value={guideForm.languages}
                  onChange={(e) => setGuideForm({ ...guideForm, languages: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900 placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-800 block uppercase">Status Tugas</label>
                <select
                  value={guideForm.status}
                  onChange={(e) => setGuideForm({ ...guideForm, status: e.target.value as any })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900"
                >
                  <option value="Available">Available (Tersedia / Siap Jalan)</option>
                  <option value="Booked">Booked (Sedang Bertugas)</option>
                  <option value="Leave">Leave (Cuti / Libur)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  type="submit"
                  className="flex-grow py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-extrabold text-xs transition-all cursor-pointer text-center"
                >
                  {guideForm.id ? 'Simpan Profil Pemandu' : 'Daftarkan Pemandu'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsGuideModalOpen(false)}
                  className="py-2.5 px-5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOMER PROFILE POPUP MODAL */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <h3 className="text-sm font-black text-amber-600 font-mono tracking-widest uppercase">
              {customerForm.id ? 'EDIT DATA PELANGGAN' : 'REGISTRASI PELANGGAN VIP BARU'}
            </h3>
            
            <form onSubmit={handleSaveCustomer} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-800 block uppercase">Nama Lengkap Pelanggan</label>
                <input
                  type="text"
                  required
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900 placeholder:text-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-800 block uppercase">Email Kontak</label>
                  <input
                    type="email"
                    required
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900 placeholder:text-slate-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-800 block uppercase">Nomor WhatsApp</label>
                  <input
                    type="text"
                    required
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900 placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-800 block uppercase">Tingkatan Loyalitas Tier</label>
                  <select
                    value={customerForm.membershipLevel}
                    onChange={(e) => setCustomerForm({ ...customerForm, membershipLevel: e.target.value as any })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900"
                  >
                    <option value="Platinum">⭐ Platinum VIP</option>
                    <option value="Gold">⭐ Gold Member</option>
                    <option value="Silver">⭐ Silver Member</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-800 block uppercase">Total Trips Berhasil</label>
                  <input
                    type="number"
                    required
                    value={customerForm.tripsCount}
                    onChange={(e) => setCustomerForm({ ...customerForm, tripsCount: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  type="submit"
                  className="flex-grow py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-extrabold text-xs transition-all cursor-pointer text-center"
                >
                  {customerForm.id ? 'Simpan Data Pelanggan' : 'Daftarkan Pelanggan'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(false)}
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
