import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { 
  LayoutDashboard, ClipboardList, Layers, Truck, MapPin, Globe, 
  Settings, ChevronLeft, ChevronRight, LogOut, Shield, Lock, Activity,
  Compass, Briefcase, Users, Percent, Calendar, CheckSquare, 
  Sparkles, X, Menu, Search, Bell, Moon, Sun, User, LockKeyhole, 
  Mail, Phone, ChevronDown, CheckCircle2, AlertTriangle, FileText, 
  ArrowUpRight, BarChart3, Database, Save, Eye, EyeOff, Building, 
  FileCheck, ShieldCheck, Download, CalendarDays, RefreshCw, CreditCard, DollarSign,
  Plane, Plus, Trash2, Edit, Check, Copy, Clock, Image, Upload, ChevronUp, GripVertical, History, Car, Map, Star, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Airport } from '../types';
import TaxiExcelManager from '../components/admin/TaxiExcelManager';
import RentalAdminWorkspace from '../components/admin/RentalAdminWorkspace';
import AirportBookingCalendar from '../components/admin/AirportBookingCalendar';
import ShareTourAdminDashboard from '../sharetour/components/AdminDashboard';
import { fetchDB as fetchShareTourDB } from '../sharetour/api';
import { Trip as ShareTourTrip, Batch as ShareTourBatch, Booking as ShareTourBooking } from '../sharetour/types';
import { OFFICIAL_PARTNERS, PARTNERS_DATA_VERSION } from '../data/partnersData';
import { SocialMediaItem, getStoredSocialMedia, saveStoredSocialMedia } from '../data/socialMediaData';
import AnalyticsDashboard from '../components/admin/AnalyticsDashboard';
import { formatTourDuration, parseTourDays, parseTourNights } from '../utils/tourFilterUtils';
import { 
  useAutoSaveDraft, 
  AutoSaveStatusBadge, 
  DraftRecoveryBanner 
} from '../components/admin/AutoSaveDraftComponents';
import { clearDraft } from '../utils/adminDraftStorage';

interface ItineraryFormItem {
  id: string;
  day: number;
  dayTitle: string;
  time: string;
  title: string;
  desc: string;
}

export default function AdminView() {
  const { 
    setPage, 
    bookings, 
    updateBookingStatus, 
    tours, 
    addTour, 
    updateTour, 
    deleteTour, 
    schedules, 
    addSchedule, 
    updateSchedule,
    deleteSchedule,
    formatPrice,
    currency,
    searchParams,
    setSearchParams,
    maxBookingsPerDay,
    setMaxBookingsPerDay,
    airportRoutes,
    setAirportRoutes,
    airports,
    setAirports,
    taxiMasterAreas,
    setTaxiMasterAreas,
    taxiMasterDestinations,
    setTaxiMasterDestinations,
    taxiPricingRules,
    setTaxiPricingRules,
    taxiAreaRules,
    setTaxiAreaRules,
    taxiImportHistory,
    setTaxiImportHistory,
    rentalCities,
    setRentalCities,
    rentalLocations,
    setRentalLocations,
    rentalVehicles,
    setRentalVehicles,
    rentalCategories,
    setRentalCategories,
    rentalAddons,
    setRentalAddons,
    rentalZonePricing,
    setRentalZonePricing,
    serviceLimits,
    setServiceLimit,
    reviews,
    approveReview,
    rejectReview
  } = useApp();

  // Theme State - Default to clean light mode
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('sj_admin_theme');
    // If not set or explicitly requested light, default to false (clean light mode)
    if (!saved || saved === 'dark') {
      localStorage.setItem('sj_admin_theme', 'light');
      return false;
    }
    return saved === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('sj_admin_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Authorization wall (consistent with original lock system)
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(() => {
    return localStorage.getItem('smartjourney_admin_unlocked') === 'true';
  });
  const [rolePasswordInput, setRolePasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Navigation States
  const [activeModule, setActiveModule] = useState<'dashboard' | 'analytics' | 'tours' | 'sharetour' | 'bookings' | 'reports' | 'airport' | 'taxi' | 'rental' | 'cms' | 'account'>('dashboard');
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'management' | 'calendar' | 'blackout' | 'schedule' | 'booking' | 'customer' | 'payment' | 'finance' | 'reports' | 'settings' | 'master-data' | 'pricing-engine' | 'excel-import' | 'excel-export' | 'import-history'>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [reviewsFilter, setReviewsFilter] = useState<'all' | 'pending' | 'approved'>('all');

  // ShareTour / Open Trip Data State
  const [shareTourTrips, setShareTourTrips] = useState<ShareTourTrip[]>([]);
  const [shareTourBatches, setShareTourBatches] = useState<ShareTourBatch[]>([]);
  const [shareTourBookings, setShareTourBookings] = useState<ShareTourBooking[]>([]);
  const [shareTourLoading, setShareTourLoading] = useState(false);

  const loadShareTourData = async () => {
    setShareTourLoading(true);
    try {
      const db = await fetchShareTourDB();
      setShareTourTrips(db.trips || []);
      setShareTourBatches(db.batches || []);
      setShareTourBookings(db.bookings || []);
    } catch (err) {
      console.error("Error fetching ShareTour database in AdminView:", err);
    } finally {
      setShareTourLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminUnlocked) {
      loadShareTourData();
    }
  }, [isAdminUnlocked]);

  // Master Unified Bookings State
  const [bookingChannelFilter, setBookingChannelFilter] = useState<'all' | 'tour' | 'sharetour' | 'airport' | 'taxi' | 'car-rental'>('all');
  const [bookingStatusFilter, setBookingStatusFilter] = useState<'all' | 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled'>('all');
  const [bookingSearchQuery, setBookingSearchQuery] = useState('');
  const [selectedBookingModal, setSelectedBookingModal] = useState<any | null>(null);

  // Custom states for Tours Administration
  const [isTourFormOpen, setIsTourFormOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<any>(null);
  const [tourForm, setTourForm] = useState({
    id: '',
    name: '',
    description: '',
    duration: '2 Days / 1 Night',
    days: 2,
    nights: 1,
    startingPrice: 120, // WNA in USD
    startingPriceIDR: 1500000, // WNI in IDR
    wniPrice: 1500000,
    wnaPrice: 120,
    image: '',
    category: 'Adventure' as 'Adventure' | 'Nature' | 'Culture' | 'City',
    highlights: '',
    itinerary: '',
    rating: 5.0,
    reviewCount: 0,
    includes: '',
    excludes: '',
    gallery: [] as string[],
    whatToBring: ''
  });

  // Interactive Itinerary State
  const [itineraryItems, setItineraryItems] = useState<ItineraryFormItem[]>([]);
  const [itineraryDayInput, setItineraryDayInput] = useState<number>(1);
  const [itineraryDayTitleInput, setItineraryDayTitleInput] = useState<string>('');
  const [itineraryTimeInput, setItineraryTimeInput] = useState<string>('');
  const [itineraryTitleInput, setItineraryTitleInput] = useState<string>('');
  const [itineraryDescInput, setItineraryDescInput] = useState<string>('');
  const [editingItineraryItemId, setEditingItineraryItemId] = useState<string | null>(null);

  const handleAddOrUpdateItineraryItem = () => {
    if (!itineraryTimeInput || !itineraryTitleInput) {
      triggerToast('Mohon masukkan jam dan judul kegiatan');
      return;
    }
    
    if (editingItineraryItemId) {
      // Update existing
      setItineraryItems(prev => prev.map(item => {
        if (item.id === editingItineraryItemId) {
          return {
            ...item,
            day: itineraryDayInput,
            dayTitle: itineraryDayTitleInput,
            time: itineraryTimeInput,
            title: itineraryTitleInput,
            desc: itineraryDescInput
          };
        }
        return item;
      }));
      setEditingItineraryItemId(null);
      triggerToast('Kegiatan diperbarui!');
    } else {
      // Add new
      const newItem: ItineraryFormItem = {
        id: `it-item-${Date.now()}-${Math.random()}`,
        day: itineraryDayInput,
        dayTitle: itineraryDayTitleInput,
        time: itineraryTimeInput,
        title: itineraryTitleInput,
        desc: itineraryDescInput
      };
      setItineraryItems(prev => [...prev, newItem]);
      triggerToast('Kegiatan ditambahkan ke itinerary!');
    }
    
    // Clear fields
    setItineraryTimeInput('');
    setItineraryTitleInput('');
    setItineraryDescInput('');
  };

  const handleEditItineraryItem = (item: ItineraryFormItem) => {
    setEditingItineraryItemId(item.id);
    setItineraryDayInput(item.day);
    setItineraryDayTitleInput(item.dayTitle);
    setItineraryTimeInput(item.time);
    setItineraryTitleInput(item.title);
    setItineraryDescInput(item.desc);
    triggerToast('Mengedit aktivitas. Ubah detail di formulir di atas.');
  };

  const handleDeleteItineraryItem = (id: string) => {
    setItineraryItems(prev => prev.filter(item => item.id !== id));
    if (editingItineraryItemId === id) {
      setEditingItineraryItemId(null);
      setItineraryTimeInput('');
      setItineraryTitleInput('');
      setItineraryDescInput('');
    }
    triggerToast('Kegiatan dihapus dari itinerary.');
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain');
    if (!sourceId || sourceId === targetId) return;

    const sourceIdx = itineraryItems.findIndex(x => x.id === sourceId);
    const targetIdx = itineraryItems.findIndex(x => x.id === targetId);
    if (sourceIdx === -1 || targetIdx === -1) return;

    const updated = [...itineraryItems];
    const [moved] = updated.splice(sourceIdx, 1);
    updated.splice(targetIdx, 0, moved);
    setItineraryItems(updated);
    triggerToast('Urutan kegiatan diubah!');
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= itineraryItems.length) return;

    const updated = [...itineraryItems];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setItineraryItems(updated);
    triggerToast('Urutan kegiatan digeser!');
  };

  // Helper to parse tour.itinerary array to ItineraryFormItem[]
  const parseItineraryToForm = (itineraryArray: string[] | undefined): ItineraryFormItem[] => {
    if (!itineraryArray || itineraryArray.length === 0) return [];
    
    return itineraryArray.map((item, idx) => {
      if (item.startsWith('Day ') && item.includes('|')) {
        const parts = item.split('|').map(p => p.trim());
        const dayPart = parts[0];
        const time = parts[1] || '08:00';
        const title = parts[2] || '';
        const desc = parts[3] || '';
        
        const dayNumMatch = dayPart.match(/\d+/);
        const dayNum = dayNumMatch ? parseInt(dayNumMatch[0]) : 1;
        
        let dayTitle = '';
        if (dayPart.includes('-')) {
          dayTitle = dayPart.substring(dayPart.indexOf('-') + 1).trim();
        }
        
        return {
          id: `it-item-${idx}-${Date.now()}-${Math.random()}`,
          day: dayNum,
          dayTitle: dayTitle,
          time,
          title,
          desc
        };
      } else {
        // Old format: "08:00 - Description"
        const dividerIdx = item.indexOf('-');
        const time = dividerIdx !== -1 ? item.substring(0, dividerIdx).trim() : '08:00';
        const activity = dividerIdx !== -1 ? item.substring(dividerIdx + 1).trim() : item;
        return {
          id: `it-item-${idx}-${Date.now()}-${Math.random()}`,
          day: 1,
          dayTitle: 'Full Day Expedition',
          time,
          title: activity.split(',')[0].trim(),
          desc: activity
        };
      }
    });
  };

  const serializeItineraryFromForm = (items: ItineraryFormItem[]): string[] => {
    return items.map(item => {
      const dayLabel = item.dayTitle ? `Day ${item.day} - ${item.dayTitle}` : `Day ${item.day}`;
      return `${dayLabel} | ${item.time} | ${item.title} | ${item.desc}`;
    });
  };

  // Tour Form Sub-tabs, Upload Simulation and Departure Schedule States
  const [activeFormTab, setActiveFormTab] = useState<'general' | 'highlight' | 'itinerary' | 'includes' | 'gallery'>('general');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [tourScheduleForm, setTourScheduleForm] = useState({
    date: '2026-07-25',
    type: 'peak' as 'peak' | 'blocked',
    surcharge: 0,
    note: 'Tarif Akhir Pekan / Surcharge'
  });

  // Custom states for Airport Transfer Administration - destructured from useApp()


  const [isAirportFormOpen, setIsAirportFormOpen] = useState(false);
  const [editingAirportRoute, setEditingAirportRoute] = useState<any>(null);
  const [airportForm, setAirportForm] = useState({
    id: '',
    airport: 'SUB',
    city: 'Surabaya',
    priceUSD: 25,
    priceIDR: 380000,
    status: 'Published'
  });

  // Auto-Save Draft for Tour Creation & Editing
  const {
    saveStatus: tourSaveStatus,
    lastSaved: tourLastSaved,
    isOnline: tourIsOnline,
    detectedDraft: tourDraft,
    showRecoveryBanner: showTourRecoveryBanner,
    handleRecover: recoverTourDraft,
    handleDiscard: discardTourDraft,
    performSave: performTourSave,
    clearCurrentDraft: clearTourDraft
  } = useAutoSaveDraft<{
    tourForm: typeof tourForm;
    itineraryItems: ItineraryFormItem[];
    activeFormTab?: string;
  }>({
    type: 'tour',
    subType: 'main',
    targetId: editingTour?.id || 'new',
    title: tourForm.name || (editingTour ? editingTour.name : 'Paket Wisata Baru'),
    data: { tourForm, itineraryItems, activeFormTab },
    isEditing: Boolean(editingTour),
    enabled: isTourFormOpen,
    debounceMs: 750,
    hasUnsavedContent: Boolean(
      tourForm.name?.trim() || 
      tourForm.description?.trim() || 
      tourForm.highlights?.trim() || 
      itineraryItems.length > 0 ||
      editingTour
    ),
    onRecover: (draft) => {
      if (draft.data?.tourForm) {
        setTourForm(draft.data.tourForm);
        if (Array.isArray(draft.data.itineraryItems)) {
          setItineraryItems(draft.data.itineraryItems);
        }
        if (draft.data.activeFormTab) {
          setActiveFormTab(draft.data.activeFormTab as any);
        }
        triggerToast('Draft paket tour berhasil dipulihkan!');
      }
    }
  });

  // Auto-Save Draft for Airport Service Route Creation & Editing
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
    subType: 'airport',
    targetId: editingAirportRoute?.id || 'new',
    title: airportForm.city ? `${airportForm.airport} ➔ ${airportForm.city}` : 'Rute Transfer Airport Baru',
    data: airportForm,
    isEditing: Boolean(editingAirportRoute),
    enabled: isAirportFormOpen,
    debounceMs: 750,
    hasUnsavedContent: Boolean(airportForm.city?.trim() || editingAirportRoute),
    onRecover: (draft) => {
      if (draft.data) {
        setAirportForm(draft.data);
        triggerToast('Draft rute transfer airport berhasil dipulihkan!');
      }
    }
  });

  // State variables for "Pembukaan Bandara" & "Konfigurasi Detail Bandara"
  const [selectedAirportCodeForEdit, setSelectedAirportCodeForEdit] = useState<string>('DPS');
  const [isNewAirportModalOpen, setIsNewAirportModalOpen] = useState(false);

  // Car Rental Management workspace states
  const [rentalForm, setRentalForm] = useState<any>({});
  const [rentalEditingId, setRentalEditingId] = useState<string | null>(null);
  const [rentalCityFilter, setRentalCityFilter] = useState<string>('all');
  const [isRentalFormOpen, setIsRentalFormOpen] = useState<boolean>(false);
  const [newAirportForm, setNewAirportForm] = useState({
    code: '',
    name: '',
    description: '',
    status: 'Active' as 'Active' | 'Inactive',
    surchargeUSD: 0,
    surchargeIDR: 0
  });

  // Schedule Creator States
  const [isScheduleFormOpen, setIsScheduleFormOpen] = useState(false);
  const [newScheduleForm, setNewScheduleForm] = useState({
    date: '',
    type: 'allocation', // 'allocation' | 'peak' | 'blocked'
    tourId: '',
    driver: '',
    vehicle: '',
    surcharge: 0,
    note: ''
  });
  
  // Calendar View Month Navigation (defaults to July 2026 matching system timelines)
  const [calendarYear, setCalendarYear] = useState(() => {
    const stored = localStorage.getItem('smartjourney_selected_date');
    if (stored) {
      const parts = stored.split('-');
      if (parts.length === 3) return parseInt(parts[0], 10);
    }
    return 2026;
  });
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const stored = localStorage.getItem('smartjourney_selected_date');
    if (stored) {
      const parts = stored.split('-');
      if (parts.length === 3) return parseInt(parts[1], 10) - 1; // 0-indexed
    }
    return 6; // 0-indexed, 6 is July
  });
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(() => {
    const stored = localStorage.getItem('smartjourney_selected_date');
    if (stored) return stored;
    return '2026-07-12';
  });
  
  // CMS View Tab
  const [activeCmsTab, setActiveCmsTab] = useState<'hero' | 'testimonials' | 'partners' | 'about' | 'contact'>('hero');

  // Partner Management State
  const [adminPartners, setAdminPartners] = useState<any[]>(() => {
    const version = localStorage.getItem('smartjourney_partners_version');
    const stored = localStorage.getItem('smartjourney_partners');
    if (stored && version === PARTNERS_DATA_VERSION) {
      try {
        const parsed = JSON.parse(stored);
        const hasOutdatedLogos = parsed.some((p: any) => p.logoUrl && (p.logoUrl.includes('images.unsplash.com') || p.id === 'pegipegi'));
        if (hasOutdatedLogos || parsed.length === 0) {
          localStorage.setItem('smartjourney_partners', JSON.stringify(OFFICIAL_PARTNERS));
          localStorage.setItem('smartjourney_partners_version', PARTNERS_DATA_VERSION);
          return OFFICIAL_PARTNERS;
        }
        return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.setItem('smartjourney_partners', JSON.stringify(OFFICIAL_PARTNERS));
    localStorage.setItem('smartjourney_partners_version', PARTNERS_DATA_VERSION);
    return OFFICIAL_PARTNERS;
  });

  const [partnerForm, setPartnerForm] = useState({ id: '', name: '', url: '', logoUrl: '' });
  const [isEditingPartner, setIsEditingPartner] = useState(false);
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);

  const handleLogoFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      triggerToast('Mohon unggah file gambar (format PNG disarankan)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPartnerForm(prev => ({ ...prev, logoUrl: event.target!.result as string }));
        triggerToast('Logo PNG berhasil diunggah!');
      }
    };
    reader.readAsDataURL(file);
  };

  const saveAdminPartners = (updated: any[]) => {
    setAdminPartners(updated);
    localStorage.setItem('smartjourney_partners', JSON.stringify(updated));
  };

  const handleSavePartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerForm.name || !partnerForm.url || !partnerForm.logoUrl) {
      triggerToast('Mohon lengkapi semua bidang partner');
      return;
    }
    let updated: any[] = [];
    if (isEditingPartner) {
      updated = adminPartners.map(p => p.id === partnerForm.id ? partnerForm : p);
      triggerToast(`Partner ${partnerForm.name} berhasil diperbarui!`);
    } else {
      const newPartner = { ...partnerForm, id: 'partner-' + Date.now() };
      updated = [...adminPartners, newPartner];
      triggerToast(`Partner ${partnerForm.name} berhasil ditambahkan!`);
    }
    saveAdminPartners(updated);
    setPartnerForm({ id: '', name: '', url: '', logoUrl: '' });
    setIsEditingPartner(false);
  };

  const handleDeletePartnerAdmin = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus partner ${name}?`)) {
      const updated = adminPartners.filter(p => p.id !== id);
      saveAdminPartners(updated);
      triggerToast(`Partner ${name} berhasil dihapus.`);
    }
  };

  // Social Media Management State (IG, TikTok, Rednote, LinkedIn)
  const [adminSocials, setAdminSocials] = useState<SocialMediaItem[]>(() => getStoredSocialMedia());

  const handleUpdateSocial = (id: string, field: 'handle' | 'url', value: string) => {
    setAdminSocials(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, [field]: value } : s);
      return updated;
    });
  };

  const handleSaveSocials = () => {
    saveStoredSocialMedia(adminSocials);
    triggerToast('Pengaturan Media Sosial (IG, TikTok, Rednote, LinkedIn) berhasil disimpan!');
  };

  // Account View Tab
  const [activeAccountTab, setActiveAccountTab] = useState<'profile' | 'password' | 'logout'>('profile');

  // Dashboard Overview state variables
  const [overviewMonth, setOverviewMonth] = useState(6); // 6 is July
  const [overviewYear, setOverviewYear] = useState(2026);
  const [selectedDashDate, setSelectedDashDate] = useState('2026-07-14');
  const [liveTime, setLiveTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // UI Interactive States (Placeholders)
  const [searchQuery, setSearchQuery] = useState('');
  const [durationFilter, setDurationFilter] = useState<string | null>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // States for Tour Packages new sub-tabs: payment, finance, reports
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [paymentSearch, setPaymentSearch] = useState<string>('');
  const [financeSubView, setFinanceSubView] = useState<'jurnal' | 'per-booking'>('per-booking'); // Default to per-booking so user instantly sees the newly linked report!
  const [ledgerBookingIdInput, setLedgerBookingIdInput] = useState<string>('general');
  const [customLedger, setCustomLedger] = useState<any[]>(() => {
    const saved = localStorage.getItem('sj_custom_ledger_tours');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });
  const [ledgerDateInput, setLedgerDateInput] = useState<string>('2026-07-15');
  const [ledgerTypeInput, setLedgerTypeInput] = useState<'income' | 'expense'>('expense');
  const [ledgerCategoryInput, setLedgerCategoryInput] = useState<string>('Operational');
  const [ledgerAmountIDRInput, setLedgerAmountIDRInput] = useState<string>('');
  const [ledgerDescInput, setLedgerDescInput] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('sj_custom_ledger_tours', JSON.stringify(customLedger));
  }, [customLedger]);

  const [reportDateRange, setReportDateRange] = useState<'month' | 'prev-month' | 'all'>('month');
  const [reportTourFilter, setReportTourFilter] = useState<string>('all');
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);

  // States for Airport Transfer bookings and reports
  const [airportPaymentStatusFilter, setAirportPaymentStatusFilter] = useState<string>('all');
  const [airportPaymentSearch, setAirportPaymentSearch] = useState<string>('');
  const [airportReportDateRange, setAirportReportDateRange] = useState<'month' | 'prev-month' | 'all'>('month');
  const [airportReportFilter, setAirportReportFilter] = useState<string>('all');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleAdminPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'sawahjayagroup@gmail.com',
          password: rolePasswordInput
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.token) {
          setIsAdminUnlocked(true);
          localStorage.setItem('smartjourney_admin_unlocked', 'true');
          localStorage.setItem('smart_journey_admin_token', data.token);
          localStorage.setItem('smartjourney_admin_token', data.token);
          setPasswordError(false);
          triggerToast('Akses Admin Berhasil Dibuka');
          return;
        }
      }
      setPasswordError(true);
    } catch {
      setPasswordError(true);
    }
  };

  const handleLogout = () => {
    setIsAdminUnlocked(false);
    localStorage.removeItem('smartjourney_admin_unlocked');
    localStorage.removeItem('smart_journey_admin_token');
    localStorage.removeItem('smartjourney_admin_token');
    triggerToast('Anda telah keluar dari Portal Admin');
  };

  const getUniqueCustomers = () => {
    const customerMap = new Map<string, { name: string; email: string; phone: string; trips: number; badge: string }>();

    (bookings || []).forEach(b => {
      if (!b.customerName || !b.customerEmail) return;
      const emailKey = b.customerEmail.toLowerCase();
      const existing = customerMap.get(emailKey);

      if (existing) {
        existing.trips += 1;
        if (b.customerPhone) existing.phone = b.customerPhone;
        if (b.customerName) existing.name = b.customerName;
      } else {
        customerMap.set(emailKey, {
          name: b.customerName,
          email: b.customerEmail,
          phone: b.customerPhone || '-',
          trips: 1,
          badge: 'Silver Member'
        });
      }
    });

    return (Array.from(customerMap.values()) as { name: string; email: string; phone: string; trips: number; badge: string }[]).map(c => {
      let badge = 'Silver Member';
      if (c.trips >= 10) {
        badge = 'Platinum VIP';
      } else if (c.trips >= 3) {
        badge = 'Gold Member';
      }
      return { ...c, badge };
    });
  };

  // Color theme helpers based on light/dark mode selection
  const theme = {
    bg: isDark ? 'bg-neutral-950 text-neutral-100' : 'bg-slate-50/90 text-neutral-900',
    card: isDark ? 'bg-neutral-900/80 border-neutral-800' : 'bg-white border-neutral-200/90 shadow-sm text-neutral-900',
    innerCard: isDark ? 'bg-neutral-950/60 border-neutral-850' : 'bg-slate-100/60 border-neutral-200 text-neutral-800',
    sidebar: isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200/90 shadow-sm text-neutral-900',
    header: isDark ? 'bg-neutral-950/80 border-neutral-900/60' : 'bg-white/95 border-neutral-200/90 shadow-xs text-neutral-900',
    border: isDark ? 'border-neutral-800' : 'border-neutral-200',
    borderSubtle: isDark ? 'border-neutral-850' : 'border-neutral-200/60',
    textPrimary: isDark ? 'text-neutral-100' : 'text-neutral-900',
    textSecondary: isDark ? 'text-neutral-400' : 'text-neutral-600',
    textMuted: isDark ? 'text-neutral-600' : 'text-neutral-400',
    input: isDark ? 'bg-neutral-950/80 border-neutral-800 text-white placeholder:text-neutral-500' : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20',
    hover: isDark ? 'hover:bg-neutral-800/60' : 'hover:bg-slate-100',
    activeTab: isDark ? 'bg-amber-500/10 text-amber-400 font-extrabold border-amber-500/30' : 'bg-amber-500/10 text-amber-700 font-extrabold border-amber-500/30',
    label: isDark ? 'text-neutral-300 font-bold' : 'text-slate-800 font-bold'
  };

  // Lockscreen View (Stage 1)
  if (!isAdminUnlocked) {
    return (
      <div 
        data-admin-portal="true" 
        className={`min-h-screen ${theme.bg} transition-colors duration-300 relative flex flex-col justify-between overflow-hidden font-sans admin-portal ${isDark ? 'admin-dark' : 'admin-light'}`}
      >
        {/* Decorative Grid Gradients */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-amber-500/[0.04] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/[0.04] rounded-full blur-3xl pointer-events-none" />

        <header className={`border-b ${theme.border} py-6 px-8 flex items-center justify-between z-10 bg-transparent`}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-neutral-950 font-black shadow-lg">
              <Shield className="h-5.5 w-5.5" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-widest font-mono">PT. SAWAH JAYA TRANS</h1>
              <span className="text-[10px] font-mono font-bold text-neutral-500">ADMIN GATEWAY</span>
            </div>
          </div>
          <button 
            onClick={() => setPage('home')}
            className={`flex items-center gap-2 border ${theme.border} ${theme.hover} transition-all text-xs font-bold px-4 py-2 rounded-xl cursor-pointer`}
          >
            <span>← Ke Website Utama</span>
          </button>
        </header>

        <main className="max-w-md w-full mx-auto px-6 py-12 space-y-8 z-10 flex-grow flex flex-col justify-center">
          <div className={`${theme.card} border rounded-3xl p-8 space-y-6 shadow-2xl relative`}>
            <div className="text-center space-y-2">
              <div className="mx-auto h-12 w-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-base uppercase tracking-wider font-mono">PORTAL ADMIN SKELETON</h3>
              <p className={`text-xs ${theme.textSecondary}`}>
                Akses satu pintu untuk arsitektur visual dasbor dan manajemen bisnis Smart Journey.
              </p>
            </div>

            <form onSubmit={handleAdminPasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-neutral-500 tracking-wider">SANDI OPERASIONAL</label>
                  <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded font-mono">
                    Sandi: sawahjaya2026
                  </span>
                </div>
                
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    autoFocus
                    value={rolePasswordInput}
                    onChange={(e) => {
                      setRolePasswordInput(e.target.value);
                      setPasswordError(false);
                    }}
                    placeholder="Masukkan sandi..."
                    className={`w-full ${theme.input} rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500 font-mono tracking-widest text-center border`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3.5 top-3 text-xs font-black ${theme.textSecondary} hover:text-amber-500 font-mono`}
                  >
                    {showPassword ? "HIDE" : "SHOW"}
                  </button>
                </div>

                {passwordError && (
                  <p className="text-[11px] font-extrabold text-rose-500 text-center">
                    ⚠️ Sandi salah! Masukkan: sawahjaya2026
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black text-xs transition-all tracking-wider text-center cursor-pointer shadow-md uppercase font-mono"
              >
                MASUK KE ARCHITECTURE PREVIEW
              </button>
            </form>
          </div>
        </main>

        <footer className={`border-t ${theme.border} py-4 px-8 text-center text-[10px] text-neutral-600 font-mono`}>
          Smart Journey © 2026 • Secure Architecture Hub • Phase 1 Core v1.1
        </footer>
      </div>
    );
  }

  // --- COMPONENT: STAT CARD ---
  const StatCard = ({ title, value, change, isPositive, label, icon: Icon }: any) => (
    <div className={`${theme.card} border rounded-2xl p-5 flex flex-col justify-between hover:scale-[1.01] transition-all duration-300`}>
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <span className={`text-[10px] font-black tracking-wider uppercase ${theme.textMuted}`}>{title}</span>
          <h4 className={`text-2xl font-black font-mono tracking-tight ${theme.textPrimary}`}>{value}</h4>
        </div>
        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className={`flex items-center gap-2 mt-4 pt-4 border-t ${theme.borderSubtle} border-dashed`}>
        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
          {isPositive ? '▲' : '▼'} {change}
        </span>
        <span className={`text-[10px] font-bold ${theme.textSecondary}`}>{label}</span>
      </div>
    </div>
  );

  const renderToursSubTabContent = () => {
    // Filter bookings for tours
    const tourBookings = bookings.filter(b => b.type === 'tour');
    
    // Filter schedules for tours
    const tourSchedules = schedules.filter(s => s.tourId || s.type === 'allocation');

    switch (activeSubTab) {
      case 'dashboard': {
        // Analytics
        const totalPackages = tours.length;
        const totalSalesUSD = tourBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
        const totalSalesIDR = tourBookings.reduce((sum, b) => sum + (b.totalPriceIDR || 0), 0);
        const activeBookings = tourBookings.filter(b => b.status === 'Confirmed').length;
        
        return (
          <div className="space-y-6 animate-fade-in text-left">
            {/* Header banner */}
            <div className={`${theme.innerCard} border rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
              <div className="space-y-1">
                <h3 className="text-base font-black uppercase tracking-wider font-mono text-amber-500 flex items-center gap-2">
                  <Compass className="h-4.5 w-4.5 animate-spin-slow" />
                  ANALITIK DEPARTEMEN TOUR PACKAGES
                </h3>
                <p className={`text-xs ${theme.textSecondary}`}>
                  Tinjauan metrik konversi pesanan paket wisata Bali, volume penawaran aktif, dan rating kepuasan wisatawan.
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full">
                DIVISI: SJT_TOURS_WISATA
              </span>
            </div>

            {/* Tour Specific Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Paket Aktif" value={`${totalPackages} Paket`} change="+1 Paket baru" isPositive={true} label="Bulan ini" icon={Layers} />
              <StatCard title="Total Penjualan Wisata" value={currency === 'USD' ? `$${totalSalesUSD}` : `IDR ${(totalSalesIDR / 1000000).toFixed(1)}M`} change="+15.4%" isPositive={true} label="vs bulan lalu" icon={BarChart3} />
              <StatCard title="Booking Aktif" value={`${activeBookings} Trip`} change="Sesuai kuota" isPositive={true} label="Dalam antrean" icon={ClipboardList} />
              <StatCard title="Kepuasan Tamu" value="⭐ 4.93" change="99%" isPositive={true} label="Tingkat Rekomendasi" icon={Sparkles} />
            </div>

            {/* Beautiful visual layout of Tours performance */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Category distribution */}
              <div className={`${theme.card} border rounded-2xl p-6 space-y-4`}>
                <h4 className="text-xs font-black uppercase tracking-widest font-mono text-amber-500 border-b border-neutral-850 pb-2">
                  Distribusi Kategori Tur
                </h4>
                <div className="space-y-3.5 pt-2">
                  {['Adventure', 'Nature', 'Culture', 'City'].map((cat) => {
                    const count = tours.filter(t => t.category === cat).length;
                    const pct = tours.length ? Math.round((count / tours.length) * 100) : 0;
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-extrabold">{cat}</span>
                          <span className={`text-[10px] font-mono font-bold ${theme.textSecondary}`}>{count} Tour ({pct}%)</span>
                        </div>
                        <div className="h-1.5 w-full bg-neutral-850 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Popular tour listings */}
              <div className={`lg:col-span-2 ${theme.card} border rounded-2xl p-6 space-y-4`}>
                <h4 className="text-xs font-black uppercase tracking-widest font-mono text-amber-500 border-b border-neutral-850 pb-2">
                  Katalog Terpopuler (Rating Tertinggi)
                </h4>
                <div className="space-y-3 pt-2">
                  {tours.slice(0, 4).map((tour, idx) => (
                    <div key={tour.id} className={`flex items-center justify-between p-3 rounded-xl ${theme.innerCard} border`}>
                      <div className="flex items-center gap-3">
                        <img src={tour.image} alt={tour.name} className="h-10 w-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                        <div className="text-left">
                          <h5 className="text-xs font-extrabold">{tour.name}</h5>
                          <span className={`text-[10px] ${theme.textSecondary} font-mono`}>{tour.duration} • {tour.category}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-black text-emerald-500 block">
                          {formatPrice(tour.startingPrice, tour.startingPriceIDR)}
                        </span>
                        <span className="text-[10px] text-amber-500 font-bold">⭐ {tour.rating} ({tour.reviewCount} ulasan)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'management': {
        // Filter based on durationFilter
        const filteredTours = durationFilter
          ? tours.filter(tour => tour.duration === durationFilter)
          : tours;

        if (isTourFormOpen) {
          const linkedSchedules = schedules.filter(s => s.tourId === tourForm.id);

          const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (!files) return;
            processUploadedFiles(files);
          };

          const processUploadedFiles = (files: FileList) => {
            if (isUploading) return;
            setIsUploading(true);
            setUploadProgress(0);
            
            const fileArray = Array.from(files);
            let loadedCount = 0;
            const newBase64s: string[] = [];

            if (fileArray.length === 0) {
              setIsUploading(false);
              return;
            }

            fileArray.forEach((file) => {
              const reader = new FileReader();
              reader.onload = (event) => {
                if (event.target?.result && typeof event.target.result === 'string') {
                  newBase64s.push(event.target.result);
                }
                loadedCount++;
                setUploadProgress(Math.round((loadedCount / fileArray.length) * 100));
                
                if (loadedCount === fileArray.length) {
                  setIsUploading(false);
                  const currentGallery = tourForm.gallery || [];
                  const updatedGallery = [...currentGallery, ...newBase64s];
                  const firstImage = tourForm.image || newBase64s[0] || '';
                  setTourForm(prev => ({
                    ...prev,
                    gallery: updatedGallery,
                    image: firstImage
                  }));
                  triggerToast(`Berhasil mengunggah ${newBase64s.length} foto ke galeri!`);
                }
              };
              reader.onerror = () => {
                loadedCount++;
                if (loadedCount === fileArray.length) {
                  setIsUploading(false);
                }
              };
              reader.readAsDataURL(file);
            });
          };

          const handleSimulatedUpload = () => {
            const fileInput = document.getElementById('tour-gallery-file');
            if (fileInput) {
              fileInput.click();
            }
          };

          return (
            <div className="space-y-6 animate-fade-in text-left">
              {/* Back navigation & breadcrumb header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-800 pb-5">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 mb-1">
                    <span>KATALOG &amp; PAKET WISATA</span>
                    <span className="text-neutral-600">/</span>
                    <span className="text-amber-500 font-extrabold">{editingTour ? 'EDIT DATA PAKET' : 'BUAT PAKET BARU'}</span>
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight font-mono text-neutral-100 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-amber-500" />
                    <span>{editingTour ? `WORKSPACE: ${editingTour.name}` : 'BUAT PAKET WISATA BARU'}</span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Workspace profesional OTA untuk mengelola detail konten, harga penawaran, foto sampul, inklusi paket, serta alokasi jadwal armada.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <AutoSaveStatusBadge
                    status={tourSaveStatus}
                    lastSaved={tourLastSaved}
                    isOnline={tourIsOnline}
                    onManualSave={performTourSave}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsTourFormOpen(false);
                      setEditingTour(null);
                    }}
                    className={`px-4 py-2.5 rounded-xl border ${theme.border} ${theme.hover} text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer text-white`}
                  >
                    <ChevronDown className="h-4 w-4 rotate-90 shrink-0" />
                    <span>Tutup Workspace</span>
                  </button>
                </div>
              </div>

              {/* Auto-Save Draft Recovery Banner */}
              {showTourRecoveryBanner && tourDraft && (
                <DraftRecoveryBanner
                  draft={tourDraft}
                  typeLabel={editingTour ? 'Edit Paket Tour' : 'Paket Tour Baru'}
                  onRecover={recoverTourDraft}
                  onDiscard={discardTourDraft}
                />
              )}

              {/* Form Navigation Tabs */}
              <div className="flex flex-wrap gap-1 border-b border-neutral-800 pb-px">
                {[
                  { id: 'general', name: '1. Deskripsi', icon: FileText },
                  { id: 'highlight', name: '2. Highlight', icon: Sparkles },
                  { id: 'itinerary', name: '3. Itinerary', icon: Compass },
                  { id: 'includes', name: '4. Included & Excluded', icon: CheckCircle2 },
                  { id: 'gallery', name: '5. Gallery', icon: Image }
                ].map((tab) => {
                  const IconComp = tab.icon;
                  const isActive = activeFormTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveFormTab(tab.id as any)}
                      className={`px-4 py-3 border-b-2 font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        isActive 
                          ? 'border-amber-500 text-amber-500 bg-amber-500/5' 
                          : 'border-transparent text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <IconComp className={`h-4 w-4 ${isActive ? 'text-amber-500' : 'text-neutral-500'}`} />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Two Column Layout for Full Workspace Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const parsedHighlights = tourForm.highlights.split(',').map(h => h.trim()).filter(Boolean);
                  
                  // Serialize itineraryItems or fall back to manual textarea
                  const parsedItinerary = itineraryItems.length > 0 
                    ? serializeItineraryFromForm(itineraryItems)
                    : tourForm.itinerary.split('\n').map(i => i.trim()).filter(Boolean);
                    
                  const parsedIncludes = tourForm.includes.split('\n').map(i => i.trim()).filter(Boolean);
                  const parsedExcludes = tourForm.excludes.split('\n').map(ex => ex.trim()).filter(Boolean);
                  const parsedWhatToBring = tourForm.whatToBring.split('\n').map(w => w.trim()).filter(Boolean);
                  
                  const tourDays = Number(tourForm.days) || 1;
                  const tourNights = typeof tourForm.nights !== 'undefined' ? Number(tourForm.nights) : Math.max(0, tourDays - 1);
                  const computedDuration = formatTourDuration(tourDays, tourNights);
                  
                  const finalTour = {
                    ...tourForm,
                    days: tourDays,
                    nights: tourNights,
                    duration: computedDuration,
                    startingPrice: Number(tourForm.startingPrice) || Number(tourForm.wnaPrice) || 50,
                    startingPriceIDR: Number(tourForm.startingPriceIDR) || Number(tourForm.wniPrice) || 750000,
                    wniPrice: Number(tourForm.startingPriceIDR) || Number(tourForm.wniPrice) || 750000,
                    wnaPrice: Number(tourForm.startingPrice) || Number(tourForm.wnaPrice) || 50,
                    highlights: parsedHighlights,
                    itinerary: parsedItinerary,
                    includes: parsedIncludes,
                    excludes: parsedExcludes,
                    whatToBring: parsedWhatToBring
                  };

                  if (editingTour) {
                    updateTour(finalTour as any);
                    triggerToast('Paket tour berhasil diperbarui');
                  } else {
                    addTour(finalTour as any);
                    triggerToast('Paket tour baru berhasil dipublikasi');
                  }
                  clearTourDraft();
                  setIsTourFormOpen(false);
                  setEditingTour(null);
                }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6"
              >
                {/* Left Column: Form Controls (8 cols on large screens) */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* TAB 1: GENERAL INFO */}
                  {activeFormTab === 'general' && (
                    <div className="space-y-6 animate-fade-in">
                      <div className={`${theme.card} border rounded-2xl p-6 space-y-5 shadow-sm`}>
                        <h4 className="text-xs font-black uppercase tracking-wider font-mono text-amber-500 border-b border-neutral-800 pb-3 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>Informasi Dasar, Kategori &amp; Tarif Penawaran</span>
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-800 uppercase tracking-wider">ID Paket (Satu kata, tanpa spasi)</label>
                            <input 
                              type="text" 
                              required
                              disabled={!!editingTour}
                              value={tourForm.id}
                              onChange={(e) => setTourForm({ ...tourForm, id: e.target.value })}
                              placeholder="Contoh: bromo-sunrise" 
                              className={`w-full ${theme.input} border rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 font-mono ${editingTour ? 'opacity-60 cursor-not-allowed bg-slate-100' : ''}`} 
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Kategori Pengalaman (Experience Category)</label>
                            <select 
                              value={tourForm.category}
                              onChange={(e) => setTourForm({ ...tourForm, category: e.target.value as any })}
                              className={`w-full ${theme.input} border rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 font-semibold`}
                            >
                              <option value="Adventure">Adventure (Petualangan)</option>
                              <option value="Nature">Nature (Alam Bebas)</option>
                              <option value="Culture">Culture (Budaya &amp; Sejarah)</option>
                              <option value="City">City (Wisata Kota)</option>
                            </select>
                            <span className="text-[10px] text-slate-500 block">Menjelaskan jenis wisata (terpisah dari durasi).</span>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Nama Lengkap Paket Wisata</label>
                          <input 
                            type="text" 
                            required
                            value={tourForm.name}
                            onChange={(e) => setTourForm({ ...tourForm, name: e.target.value })}
                            placeholder="Contoh: Paket Sunrise Bromo Penanjakan Premium" 
                            className={`w-full ${theme.input} border rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 font-semibold`} 
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Deskripsi Lengkap / Penjelasan Paket</label>
                          <textarea 
                            rows={6}
                            required
                            value={tourForm.description}
                            onChange={(e) => setTourForm({ ...tourForm, description: e.target.value })}
                            placeholder="Berikan penjelasan yang memikat mengenai petualangan ini..." 
                            className={`w-full ${theme.input} border rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 leading-relaxed`} 
                          />
                        </div>

                        {/* FIELD DURASI: DAYS & NIGHTS DENGAN PREVIEW OTOMATIS */}
                        <div className="space-y-3 bg-slate-500/5 p-4 rounded-2xl border border-slate-200/60">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <label className="text-[10px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-amber-500" />
                              <span>Durasi Perjalanan (Duration &amp; Nights)</span>
                            </label>
                            <span className="text-xs font-mono font-bold text-amber-600 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
                              Display Otomatis: {formatTourDuration(Number(tourForm.days) || 1, Number(tourForm.nights) || 0)}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-black text-slate-700 uppercase">Jumlah Hari (Days)</span>
                              <div className="relative">
                                <input 
                                  type="number" 
                                  min={1}
                                  max={30}
                                  required
                                  value={tourForm.days || 1}
                                  onChange={(e) => {
                                    const days = Math.max(1, parseInt(e.target.value, 10) || 1);
                                    const nights = typeof tourForm.nights === 'number' ? tourForm.nights : Math.max(0, days - 1);
                                    setTourForm({ 
                                      ...tourForm, 
                                      days, 
                                      duration: formatTourDuration(days, nights)
                                    });
                                  }}
                                  className={`w-full ${theme.input} border rounded-xl pl-4 pr-14 py-2.5 focus:outline-none focus:border-amber-500 font-bold`} 
                                />
                                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Hari</span>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <span className="text-[10px] font-black text-slate-700 uppercase">Jumlah Malam (Nights)</span>
                              <div className="relative">
                                <input 
                                  type="number" 
                                  min={0}
                                  max={30}
                                  required
                                  value={typeof tourForm.nights === 'number' ? tourForm.nights : 0}
                                  onChange={(e) => {
                                    const nights = Math.max(0, parseInt(e.target.value, 10) || 0);
                                    const days = Number(tourForm.days) || 1;
                                    setTourForm({ 
                                      ...tourForm, 
                                      nights,
                                      duration: formatTourDuration(days, nights)
                                    });
                                  }}
                                  className={`w-full ${theme.input} border rounded-xl pl-4 pr-14 py-2.5 focus:outline-none focus:border-amber-500 font-bold`} 
                                />
                                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Malam</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-500">
                            Admin tidak perlu mengetik "2D1N" secara manual. Sistem otomatis memformat display: "{formatTourDuration(Number(tourForm.days) || 1, Number(tourForm.nights) || 0)}".
                          </p>
                        </div>

                        {/* STRUKTUR HARGA PRIVATE TOUR: WNI & WNA TERPISAH */}
                        <div className="space-y-3 bg-slate-500/5 p-4 rounded-2xl border border-slate-200/60">
                          <label className="text-[10px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                            <CreditCard className="h-3.5 w-3.5 text-amber-500" />
                            <span>Struktur Harga Private Tour (WNI &amp; WNA)</span>
                          </label>
                          <p className="text-[10px] text-slate-500">
                            Satu paket wisata memiliki 2 tarif independen. Harga WNA tidak dihitung otomatis dari WNI dan dapat Anda atur secara bebas.
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                            {/* WNI Price */}
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-emerald-700 uppercase tracking-wider block">
                                Harga WNI / Domestik (IDR / Rupiah)
                              </label>
                              <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-600 font-mono">Rp</span>
                                <input 
                                  type="number" 
                                  required
                                  value={tourForm.startingPriceIDR || ''}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setTourForm({ 
                                      ...tourForm, 
                                      startingPriceIDR: val,
                                      wniPrice: val
                                    });
                                  }}
                                  placeholder="1500000" 
                                  className={`w-full ${theme.input} border rounded-xl pl-11 pr-4 py-2.5 focus:outline-none focus:border-emerald-500 font-mono text-sm font-extrabold`} 
                                />
                              </div>
                              <span className="text-[9px] text-slate-500 block">Contoh: Rp 1.500.000 untuk wisatawan domestik</span>
                            </div>

                            {/* WNA Price */}
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-amber-700 uppercase tracking-wider block">
                                Harga WNA / International (USD / Dollar)
                              </label>
                              <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-600 font-mono">$</span>
                                <input 
                                  type="number" 
                                  required
                                  value={tourForm.startingPrice || ''}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setTourForm({ 
                                      ...tourForm, 
                                      startingPrice: val,
                                      wnaPrice: val
                                    });
                                  }}
                                  placeholder="120" 
                                  className={`w-full ${theme.input} border rounded-xl pl-8 pr-4 py-2.5 focus:outline-none focus:border-amber-500 font-mono text-sm font-extrabold`} 
                                />
                              </div>
                              <span className="text-[9px] text-slate-500 block">Contoh: USD 120 untuk turis mancanegara</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: HIGHLIGHTS */}
                  {activeFormTab === 'highlight' && (
                    <div className="space-y-6 animate-fade-in">
                      <div className={`${theme.card} border rounded-2xl p-6 space-y-5 shadow-sm`}>
                        <h4 className="text-xs font-black uppercase tracking-wider font-mono text-amber-500 border-b border-neutral-800 pb-3 flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          <span>Sorotan Utama &amp; Perlengkapan (What to Bring)</span>
                        </h4>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-800 uppercase tracking-wider block">
                            Sorotan Wisata (Highlights)
                          </label>
                          <span className="text-[10px] text-slate-600 block">Pisahkan setiap sorotan dengan tanda koma (,) agar terformat otomatis</span>
                          <textarea 
                            rows={5}
                            value={tourForm.highlights}
                            onChange={(e) => setTourForm({ ...tourForm, highlights: e.target.value })}
                            placeholder="Contoh: Jeep Premium 4x4, Tiket Masuk Taman Nasional, Sarapan Hangat Kastil, Dokumentasi Profesional" 
                            className={`w-full ${theme.input} border rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 leading-relaxed`} 
                          />
                        </div>

                        <div className="space-y-2 border-t border-neutral-200/80 pt-4">
                          <label className="text-[10px] font-black text-slate-800 uppercase tracking-wider block">
                            Perlengkapan yang Harus Dibawa (What to Bring)
                          </label>
                          <span className="text-[10px] text-slate-600 block">Tuliskan barang atau perlengkapan yang direkomendasikan untuk dibawa, satu item per baris</span>
                          <textarea 
                            rows={6}
                            value={tourForm.whatToBring}
                            onChange={(e) => setTourForm({ ...tourForm, whatToBring: e.target.value })}
                            placeholder="Contoh:&#10;Pakaian hangat &amp; Jaket tebal&#10;Sepatu gunung / trekking antiselip&#10;Kacamata hitam &amp; Tabir surya&#10;Masker respirator (rekomendasi untuk Ijen)&#10;Kamera / Handphone untuk dokumentasi" 
                            className={`w-full ${theme.input} border rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 leading-relaxed`} 
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: ITINERARY */}
                  {activeFormTab === 'itinerary' && (
                    <div className="space-y-6 animate-fade-in">
                      {/* Itinerary Add/Edit Form */}
                      <div id="itinerary-form-editor" className={`${theme.card} border rounded-2xl p-6 space-y-4 shadow-sm`}>
                        <h4 className="text-xs font-black uppercase tracking-wider font-mono text-amber-500 border-b border-neutral-800 pb-3 flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          <span>{editingItineraryItemId ? 'Edit Aktivitas Itinerary' : 'Tambah Aktivitas Itinerary Baru'}</span>
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Hari Ke (Day)</label>
                            <input 
                              type="number" 
                              min={1}
                              value={itineraryDayInput}
                              onChange={(e) => setItineraryDayInput(Math.max(1, parseInt(e.target.value) || 1))}
                              className={`w-full ${theme.input} border rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-500 font-mono text-xs`}
                            />
                          </div>

                          <div className="space-y-1.5 md:col-span-2">
                            <label className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Judul Hari (Opsional)</label>
                            <input 
                              type="text" 
                              value={itineraryDayTitleInput}
                              onChange={(e) => setItineraryDayTitleInput(e.target.value)}
                              placeholder="Contoh: Menikmati Golden Sunrise & Lautan Pasir" 
                              className={`w-full ${theme.input} border rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-500 text-xs`}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Jam / Waktu (Hour)</label>
                            <input 
                              type="text" 
                              value={itineraryTimeInput}
                              onChange={(e) => setItineraryTimeInput(e.target.value)}
                              placeholder="Contoh: 03:30 - 06:00 atau 08:00" 
                              className={`w-full ${theme.input} border rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-500 font-mono text-xs`}
                            />
                          </div>

                          <div className="space-y-1.5 md:col-span-2">
                            <label className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Nama Aktivitas / Kegiatan</label>
                            <input 
                              type="text" 
                              value={itineraryTitleInput}
                              onChange={(e) => setItineraryTitleInput(e.target.value)}
                              placeholder="Contoh: Berburu Golden Sunrise" 
                              className={`w-full ${theme.input} border rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-500 text-xs font-bold`}
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Penjelasan Detail Kegiatan</label>
                          <textarea 
                            rows={3}
                            value={itineraryDescInput}
                            onChange={(e) => setItineraryDescInput(e.target.value)}
                            placeholder="Tulis penjelasan rincian jalannya aktivitas ini..." 
                            className={`w-full ${theme.input} border rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-500 leading-relaxed text-xs`}
                          />
                        </div>

                        <div className="flex justify-end gap-2.5 pt-2">
                          {editingItineraryItemId && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingItineraryItemId(null);
                                setItineraryTimeInput('');
                                setItineraryTitleInput('');
                                setItineraryDescInput('');
                              }}
                              className="px-3 py-2 rounded-xl border border-neutral-700 bg-transparent text-neutral-300 hover:text-white hover:bg-neutral-800 text-xs font-bold transition-all cursor-pointer"
                            >
                              Batal Edit
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={handleAddOrUpdateItineraryItem}
                            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                          >
                            <Plus className="h-4 w-4" />
                            <span>{editingItineraryItemId ? 'Perbarui Aktivitas' : 'Tambah ke Itinerary'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Displaying interactive list & Drag-Drop area */}
                      <div className={`${theme.card} border rounded-2xl p-6 space-y-4 shadow-sm`}>
                        <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                          <h4 className="text-xs font-black uppercase tracking-wider font-mono text-amber-500 flex items-center gap-2">
                            <Compass className="h-4 w-4" />
                            <span>Daftar Agenda Rencana Perjalanan ({itineraryItems.length} Aktivitas)</span>
                          </h4>
                          <span className="text-[10px] text-neutral-500 font-mono">Seret / Drag item untuk merubah urutan</span>
                        </div>

                        {itineraryItems.length === 0 ? (
                          <div className="text-center py-10 text-neutral-500 space-y-2">
                            <Compass className="h-10 w-10 text-neutral-600 mx-auto animate-pulse" />
                            <p className="text-xs font-bold">Belum ada item itinerary yang dibuat.</p>
                            <p className="text-[11px] text-neutral-600 max-w-md mx-auto">Isi formulir di atas untuk menentukan hari, jam, judul aktivitas, serta penjelasannya lalu klik "Tambah ke Itinerary".</p>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {/* Grouping itineraryItems by Day */}
                            {(Array.from(new Set(itineraryItems.map(item => item.day))) as number[]).sort((a, b) => a - b).map(dayNum => {
                              const dayItems = itineraryItems.filter(item => item.day === dayNum);
                              const dayTitle = dayItems[0]?.dayTitle || `Agenda Hari Ke-${dayNum}`;
                              
                              return (
                                <div key={dayNum} className="space-y-3">
                                  {/* Day Banner */}
                                  <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl px-4 py-2.5 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="bg-amber-500 text-neutral-950 font-mono font-black text-[10px] px-2.5 py-0.5 rounded uppercase tracking-wider">HARI {dayNum}</span>
                                      <span className="text-xs font-black text-neutral-200">{dayTitle}</span>
                                    </div>
                                    <span className="text-[10px] text-neutral-500 font-bold font-mono">{dayItems.length} Kegiatan</span>
                                  </div>

                                  {/* Day Activities List */}
                                  <div className="space-y-2.5 pl-3 border-l-2 border-amber-500/20 ml-4">
                                    {dayItems.map((item) => {
                                      const globalIndex = itineraryItems.findIndex(x => x.id === item.id);
                                      return (
                                        <div 
                                          key={item.id}
                                          draggable={true}
                                          onDragStart={(e) => handleDragStart(e, item.id)}
                                          onDragOver={(e) => e.preventDefault()}
                                          onDrop={(e) => handleDrop(e, item.id)}
                                          className={`group relative flex items-start gap-3 bg-neutral-900/30 hover:bg-neutral-900/65 border border-neutral-800/50 hover:border-amber-500/25 p-3.5 rounded-xl transition-all cursor-grab active:cursor-grabbing ${editingItineraryItemId === item.id ? 'border-amber-500 ring-1 ring-amber-500/20 bg-amber-500/5' : ''}`}
                                        >
                                          {/* Drag handle icon */}
                                          <div className="text-neutral-600 hover:text-neutral-400 cursor-grab shrink-0 mt-0.5" title="Seret untuk memindahkan">
                                            <GripVertical className="h-4 w-4" />
                                          </div>

                                          {/* Activity detail */}
                                          <div className="flex-1 space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                              <span className="font-mono text-[10px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/15">
                                                ⏱️ {item.time}
                                              </span>
                                              <h5 className="text-xs font-black text-neutral-100">{item.title}</h5>
                                            </div>
                                            <p className="text-[11px] text-neutral-400 leading-relaxed font-semibold">
                                              {item.desc}
                                            </p>
                                          </div>

                                          {/* Quick Actions */}
                                          <div className="flex items-center gap-1.5 shrink-0 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                            {/* Move Up */}
                                            <button
                                              type="button"
                                              disabled={globalIndex === 0}
                                              onClick={() => moveItem(globalIndex, 'up')}
                                              className={`p-1.5 rounded-lg border border-neutral-800 hover:border-neutral-700 bg-neutral-900 text-neutral-400 hover:text-white transition-all cursor-pointer ${globalIndex === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                                              title="Geser ke Atas"
                                            >
                                              <ChevronUp className="h-3 w-3" />
                                            </button>

                                            {/* Move Down */}
                                            <button
                                              type="button"
                                              disabled={globalIndex === itineraryItems.length - 1}
                                              onClick={() => moveItem(globalIndex, 'down')}
                                              className={`p-1.5 rounded-lg border border-neutral-800 hover:border-neutral-700 bg-neutral-900 text-neutral-400 hover:text-white transition-all cursor-pointer ${globalIndex === itineraryItems.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                                              title="Geser ke Bawah"
                                            >
                                              <ChevronDown className="h-3 w-3" />
                                            </button>

                                            {/* Edit */}
                                            <button
                                              type="button"
                                              onClick={() => handleEditItineraryItem(item)}
                                              className="p-1.5 rounded-lg border border-neutral-850 hover:border-amber-500/20 bg-neutral-950 text-amber-500 hover:bg-amber-500 hover:text-neutral-950 transition-all cursor-pointer"
                                              title="Edit Aktivitas"
                                            >
                                              <Edit className="h-3.5 w-3.5" />
                                            </button>

                                            {/* Delete */}
                                            <button
                                              type="button"
                                              onClick={() => handleDeleteItineraryItem(item.id)}
                                              className="p-1.5 rounded-lg border border-neutral-850 hover:border-red-500/20 bg-neutral-950 text-red-400 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                                              title="Hapus"
                                            >
                                              <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 6: GALLERY */}
                  {activeFormTab === 'gallery' && (
                    <div className="space-y-6 animate-fade-in">
                      {/* Photo Sampul & Gallery Manager */}
                      <div className={`${theme.card} border rounded-2xl p-6 space-y-5 shadow-sm`}>
                        <h4 className="text-xs font-black uppercase tracking-wider font-mono text-amber-500 border-b border-neutral-800 pb-3 flex items-center gap-2">
                          <Image className="h-4 w-4 text-amber-500" />
                          <span>Galeri Foto &amp; Media Kreatif</span>
                        </h4>

                        <p className={`text-xs ${theme.textSecondary}`}>
                          Unggah beberapa foto sekaligus untuk dijadikan galeri paket wisata. Pilih gambar untuk dijadikan cover utama, atau drag &amp; drop file dari komputer Anda.
                        </p>

                        {/* Hidden native input */}
                        <input 
                          type="file" 
                          id="tour-gallery-file" 
                          multiple 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleFileChange} 
                        />

                        {/* Interactive Drag & Drop Area */}
                        <div 
                          onClick={handleSimulatedUpload}
                          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDragging(false);
                            if (e.dataTransfer.files) {
                              processUploadedFiles(e.dataTransfer.files);
                            }
                          }}
                          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                            isDragging 
                              ? 'border-amber-500 bg-amber-500/10' 
                              : 'border-neutral-700 hover:border-amber-500 hover:bg-neutral-900/60'
                          }`}
                        >
                          {isUploading ? (
                            <div className="space-y-3">
                              <RefreshCw className="h-8 w-8 text-amber-500 animate-spin mx-auto" />
                              <div className="text-xs font-bold text-neutral-200">Memproses file gambar...</div>
                              <div className="w-48 bg-neutral-800 h-2 rounded-full overflow-hidden mx-auto">
                                <div className="bg-amber-500 h-full transition-all duration-100" style={{ width: `${uploadProgress}%` }}></div>
                              </div>
                              <span className="text-[10px] font-mono text-neutral-400">{uploadProgress}% Selesai</span>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="h-10 w-10 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto">
                                <Upload className="h-5 w-5" />
                              </div>
                              <div className="text-xs font-bold text-neutral-200">Drag &amp; Drop Beberapa Foto di Sini, atau <span className="text-amber-500 underline">Pilih File Kami</span></div>
                              <p className="text-[10px] text-neutral-500">Pilih beberapa file foto langsung dari galeri lokal Anda</p>
                            </div>
                          )}
                        </div>

                         {/* Dynamic Gallery Grid (from uploaded file list) */}
                        {tourForm.gallery && tourForm.gallery.length > 0 && (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block">Foto Galeri Terunggah ({tourForm.gallery.length}):</span>
                              <span className="text-[9px] text-amber-500 font-bold font-mono uppercase tracking-wider">Slide 1 otomatis menjadi Thumbnail</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {tourForm.gallery.map((imgUrl, idx) => {
                                const isCover = idx === 0;
                                return (
                                  <div 
                                    key={idx} 
                                    className={`group relative aspect-[4/3] rounded-xl overflow-hidden border transition-all ${
                                      isCover ? 'border-amber-500 ring-2 ring-amber-500/25' : 'border-neutral-800'
                                    }`}
                                  >
                                    <img 
                                      src={imgUrl} 
                                      alt={`Gallery image ${idx + 1}`} 
                                      className="w-full h-full object-cover" 
                                    />
                                    
                                    {/* Badges / Overlay */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col justify-between p-2 transition-opacity">
                                      <div className="flex justify-between items-center">
                                        <div className="flex gap-1">
                                          {/* Move Left */}
                                          <button
                                            type="button"
                                            disabled={idx === 0}
                                            onClick={() => {
                                              if (idx === 0) return;
                                              const newGallery = [...tourForm.gallery];
                                              const temp = newGallery[idx];
                                              newGallery[idx] = newGallery[idx - 1];
                                              newGallery[idx - 1] = temp;
                                              setTourForm({
                                                ...tourForm,
                                                gallery: newGallery,
                                                image: newGallery[0] || ''
                                              });
                                              triggerToast('Posisi gambar digeser ke kiri');
                                            }}
                                            className={`p-1 rounded bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors cursor-pointer ${
                                              idx === 0 ? 'opacity-30 cursor-not-allowed' : ''
                                            }`}
                                            title="Geser Kiri (Jadikan Thumbnail)"
                                          >
                                            <ChevronLeft className="h-3 w-3" />
                                          </button>

                                          {/* Move Right */}
                                          <button
                                            type="button"
                                            disabled={idx === tourForm.gallery.length - 1}
                                            onClick={() => {
                                              if (idx === tourForm.gallery.length - 1) return;
                                              const newGallery = [...tourForm.gallery];
                                              const temp = newGallery[idx];
                                              newGallery[idx] = newGallery[idx + 1];
                                              newGallery[idx + 1] = temp;
                                              setTourForm({
                                                ...tourForm,
                                                gallery: newGallery,
                                                image: newGallery[0] || ''
                                              });
                                              triggerToast('Posisi gambar digeser ke kanan');
                                            }}
                                            className={`p-1 rounded bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors cursor-pointer ${
                                              idx === tourForm.gallery.length - 1 ? 'opacity-30 cursor-not-allowed' : ''
                                            }`}
                                            title="Geser Kanan"
                                          >
                                            <ChevronRight className="h-3 w-3" />
                                          </button>
                                        </div>

                                        <button
                                          type="button"
                                          onClick={() => {
                                            const updated = tourForm.gallery.filter((_, i) => i !== idx);
                                            const newCover = updated[0] || '';
                                            setTourForm({ ...tourForm, gallery: updated, image: newCover });
                                            triggerToast('Foto dihapus dari galeri');
                                          }}
                                          className="p-1 rounded bg-red-500/80 hover:bg-red-500 text-white cursor-pointer"
                                          title="Hapus Foto"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </button>
                                      </div>
                                      <span className="text-[8px] text-neutral-400 font-mono">Slide #{idx + 1}</span>
                                    </div>

                                    {isCover && (
                                      <div className="absolute top-1.5 left-1.5 bg-amber-500 text-neutral-950 font-black font-mono text-[7px] uppercase tracking-widest px-1.5 py-0.5 rounded shadow">
                                        Thumbnail (Cover)
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Presets Quick Picker */}
                        <div className="space-y-2.5">
                          <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block">Gunakan Preset Foto SmartJourney Premium:</span>
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                            {[
                              { name: 'Gunung Bromo', url: 'https://images.unsplash.com/photo-1604999333679-b86d54738315?auto=format&fit=crop&w=300&q=80' },
                              { name: 'Kawah Ijen', url: 'https://images.unsplash.com/photo-1531315630201-bb15abeb1653?auto=format&fit=crop&w=300&q=80' },
                              { name: 'Air Terjun Sewu', url: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=300&q=80' },
                              { name: 'Malang Heritage', url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=300&q=80' },
                              { name: 'Pesisir Bali', url: 'https://images.unsplash.com/photo-1537953391648-762265ef7621?auto=format&fit=crop&w=300&q=80' }
                            ].map((preset, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  const currentGallery = tourForm.gallery || [];
                                  const updatedGallery = currentGallery.includes(preset.url) ? currentGallery : [...currentGallery, preset.url];
                                  setTourForm({ ...tourForm, image: preset.url, gallery: updatedGallery });
                                  triggerToast(`Menggunakan foto preset: ${preset.name}`);
                                }}
                                className={`group relative aspect-[4/3] rounded-lg overflow-hidden border transition-all cursor-pointer ${
                                  tourForm.image === preset.url ? 'border-amber-500 ring-2 ring-amber-500/25' : 'border-neutral-800'
                                }`}
                              >
                                <img src={preset.url} alt={preset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[9px] font-bold text-white transition-opacity">
                                  Gunakan
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: INCLUSIONS & EXCLUSIONS */}
                  {activeFormTab === 'includes' && (
                    <div className="space-y-6 animate-fade-in">
                      <div className={`${theme.card} border rounded-2xl p-6 space-y-5 shadow-sm`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-3">
                          <h4 className="text-xs font-black uppercase tracking-wider font-mono text-amber-500 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Inklusi &amp; Eksklusi (Include &amp; Exclude)</span>
                          </h4>
                          {/* Injector presets */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-mono text-neutral-400 font-bold">TEMPLATE CEPAT:</span>
                            <button
                              type="button"
                              onClick={() => {
                                setTourForm({
                                  ...tourForm,
                                  includes: 'Tiket Masuk Wisata Resmi\nTransportasi Privat AC Premium\nBBM & Biaya Tol\nDriver Profesional Berpengalaman\nAir Mineral Dingin Selama Perjalanan\nMasker Gas Respirator Steril (Khusus Ijen)\nPemandu Lokal Berlisensi',
                                  excludes: 'Pengeluaran Pribadi & Belanja Oleh-Oleh\nMakan & Minum di Luar Paket\nUang Tip Sukarela (Driver & Pemandu)\nSewa Kuda di Lautan Pasir (Opsional)'
                                });
                                triggerToast('Template Bromo-Ijen disuntikkan!');
                              }}
                              className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-[10px] font-bold text-neutral-200 cursor-pointer"
                            >
                              Standard
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setTourForm({
                                  ...tourForm,
                                  includes: 'Tiket Penerbangan PP Pariwisata\nHotel Bintang 5 Deluxe (Room Only)\nTransportasi Toyota Alphard Privat\nBBM, Tol, & Parkir VIP\nAll-Inclusive Meals (Breakfast, Lunch, Dinner)\nFotografer Profesional & Drone Footage\nVIP Priority Access Gates',
                                  excludes: 'Keperluan Belanja Pribadi\nLayanan Laundry Hotel & Minibar\nTip Eksklusif Kru & Pemandu Utama'
                                });
                                triggerToast('Template All-Inclusive disuntikkan!');
                              }}
                              className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-neutral-950 text-[10px] font-bold cursor-pointer"
                            >
                              Luxury VIP
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-emerald-800 uppercase tracking-wider block">Harga Sudah Termasuk (Inclusions)</label>
                            <span className="text-[10px] text-slate-600 block">Tuliskan satu item per baris (tekan Enter untuk baris baru)</span>
                            <textarea 
                              rows={8}
                              value={tourForm.includes}
                              onChange={(e) => setTourForm({ ...tourForm, includes: e.target.value })}
                              placeholder="Contoh:&#10;Tiket Masuk Wisata Resmi&#10;Transportasi AC Mewah&#10;Sopir Berpengalaman" 
                              className={`w-full ${theme.input} border rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 leading-relaxed text-xs`} 
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-red-800 uppercase tracking-wider block">Tidak Termasuk (Exclusions)</label>
                            <span className="text-[10px] text-slate-600 block">Tuliskan satu item per baris (tekan Enter untuk baris baru)</span>
                            <textarea 
                              rows={8}
                              value={tourForm.excludes}
                              onChange={(e) => setTourForm({ ...tourForm, excludes: e.target.value })}
                              placeholder="Contoh:&#10;Belanja Oleh-oleh Pribadi&#10;Sewa Kuda di Bromo&#10;Tip untuk Driver &amp; Guide" 
                              className={`w-full ${theme.input} border rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 leading-relaxed text-xs`} 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: SCHEDULES & FLEET ALLOCATION WAS REMOVED AS PER COUPLING RULES */}

                </div>

                {/* Right Column: Experience Details & Live Preview (4 cols on large screens) */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Live Image & Summary Preview Card */}
                  <div className={`${theme.card} border rounded-2xl overflow-hidden p-1.5 shadow-sm`}>
                    <div className="aspect-[4/3] rounded-xl overflow-hidden bg-neutral-900 relative border border-neutral-800">
                      {tourForm.image ? (
                        <img 
                          src={tourForm.image} 
                          alt="Pratinjau Sampul" 
                          className="w-full h-full object-cover animate-fade-in"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as any).src = 'https://images.unsplash.com/photo-1537996194471-e657df975ab4';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500 gap-2">
                          <EyeOff className="h-8 w-8 text-neutral-600" />
                          <span className="text-[10px] font-bold uppercase tracking-widest font-mono text-neutral-600">Belum Ada Gambar</span>
                        </div>
                      )}
                      <div className="absolute top-3 left-3 bg-neutral-950/85 backdrop-blur-md text-[9px] font-mono font-black text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-md uppercase">
                        {tourForm.category || 'Nature'}
                      </div>
                      <div className="absolute bottom-3 right-3 bg-neutral-950/85 backdrop-blur-md text-xs font-mono font-black text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-md">
                        {formatPrice(tourForm.startingPrice, tourForm.startingPriceIDR)}
                      </div>
                    </div>
                    
                    <div className="p-4 space-y-3">
                      <div>
                        <span className="text-[9px] font-mono font-black uppercase tracking-wider text-amber-500">Katalog Live Preview</span>
                        <h4 className="text-sm font-black text-white leading-tight mt-0.5 truncate">{tourForm.name || 'Judul Paket Belum Ditentukan'}</h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-bold mt-1 font-mono">
                          <Clock className="h-3.5 w-3.5 text-amber-500" />
                          <span>Durasi: {tourForm.duration || '-'}</span>
                          <span className="text-neutral-600">|</span>
                          <Users className="h-3.5 w-3.5 text-amber-500" />
                          <span>Private &amp; Share</span>
                        </div>
                      </div>
                      
                      <div className="text-[11px] text-neutral-400 leading-relaxed font-medium line-clamp-3 border-t border-neutral-850 pt-2.5">
                        {tourForm.description || 'Deskripsi rincian paket wisata akan tampil memikat di bagian ini pada halaman detail pemesanan pelanggan...'}
                      </div>
                    </div>
                  </div>

                  {/* Dynamic side-by-side Live Lists Previews based on selected Tab */}
                  {activeFormTab === 'itinerary' && (
                    <div className={`${theme.card} border rounded-2xl p-5 space-y-4 shadow-sm animate-fade-in`}>
                      <h4 className="text-xs font-black uppercase tracking-wider font-mono text-amber-500 border-b border-neutral-800 pb-2.5 flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Live Highlights Preview</span>
                      </h4>
                      {tourForm.highlights ? (
                        <div className="space-y-2">
                          {tourForm.highlights.split(',').map((h, i) => h.trim()).filter(Boolean).map((hl, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-[10.5px] font-semibold text-neutral-300">
                              <span className="h-4 w-4 rounded bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">✓</span>
                              <span>{hl}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[10px] text-neutral-500 text-center py-4">Ketik beberapa sorotan dipisahkan koma di kiri...</div>
                      )}

                      <h4 className="text-xs font-black uppercase tracking-wider font-mono text-amber-500 border-b border-neutral-800 pb-2.5 pt-2 flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        <span>Live Itinerary Preview</span>
                      </h4>
                      {tourForm.itinerary ? (
                        <div className="relative border-l border-amber-500/20 pl-4 space-y-3.5 ml-2">
                          {tourForm.itinerary.split('\n').map((item) => {
                            const dividerIdx = item.indexOf('-');
                            const time = dividerIdx !== -1 ? item.substring(0, dividerIdx).trim() : '08:00';
                            const desc = dividerIdx !== -1 ? item.substring(dividerIdx + 1).trim() : item;
                            return { time, desc };
                          }).filter(it => it.desc).slice(0, 4).map((it, idx) => (
                            <div key={idx} className="relative text-[10px]">
                              <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-amber-500 border border-neutral-900 ring-2 ring-amber-500/10"></span>
                              <div className="font-mono font-black text-amber-500 text-[9px]">{it.time}</div>
                              <div className="font-bold text-neutral-200 mt-0.5 leading-snug">{it.desc.split(',')[0]}</div>
                            </div>
                          ))}
                          {tourForm.itinerary.split('\n').filter(Boolean).length > 4 && (
                            <div className="text-[9px] font-mono text-neutral-500 font-bold italic pt-1">
                              + {tourForm.itinerary.split('\n').filter(Boolean).length - 4} baris lainnya...
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-[10px] text-neutral-500 text-center py-4">Tulis agenda per baris di kiri...</div>
                      )}
                    </div>
                  )}

                  {activeFormTab === 'includes' && (
                    <div className={`${theme.card} border rounded-2xl p-5 space-y-4 shadow-sm animate-fade-in`}>
                      <h4 className="text-xs font-black uppercase tracking-wider font-mono text-emerald-400 border-b border-neutral-800 pb-2.5 flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Preview Sudah Termasuk</span>
                      </h4>
                      {tourForm.includes ? (
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {tourForm.includes.split('\n').map((item, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-[10px] font-semibold text-neutral-300">
                              <span className="text-emerald-400 shrink-0 font-bold">✓</span>
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[10px] text-neutral-500 text-center py-2">Ketik butir inklusi di kiri...</div>
                      )}

                      <h4 className="text-xs font-black uppercase tracking-wider font-mono text-red-400 border-b border-neutral-800 pb-2.5 pt-2 flex items-center gap-1.5">
                        <X className="h-4 w-4" />
                        <span>Preview Tidak Termasuk</span>
                      </h4>
                      {tourForm.excludes ? (
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {tourForm.excludes.split('\n').map((item, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-[10px] font-semibold text-neutral-300">
                              <span className="text-red-400 shrink-0 font-bold">✗</span>
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[10px] text-neutral-500 text-center py-2">Ketik butir eksklusi di kiri...</div>
                      )}
                    </div>
                  )}

                  {/* Form Submission Actions Card */}
                  <div className={`${theme.card} border border-amber-500/20 bg-amber-500/5 rounded-2xl p-5 flex flex-col gap-3 shadow-sm`}>
                    <div className="text-[11px] text-neutral-400 font-semibold leading-relaxed">
                      Lengkapi keempat sub-tab di atas secara bertahap. Klik simpan untuk menerbitkan paket secara resmi ke katalog pelanggan.
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-1">
                      <button 
                        type="button" 
                        onClick={() => {
                          setIsTourFormOpen(false);
                          setEditingTour(null);
                        }}
                        className={`px-4 py-3 rounded-xl border ${theme.border} bg-neutral-900/60 hover:bg-neutral-900 text-xs font-bold text-neutral-300 hover:text-white transition-all cursor-pointer text-center`}
                      >
                        Batal
                      </button>
                      <button 
                        type="submit" 
                        className="px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-black transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Save className="h-4 w-4 shrink-0" />
                        <span>Simpan Paket</span>
                      </button>
                    </div>
                  </div>

                </div>
              </form>
            </div>
          );
        }

        // Tour list with creation, edit, publish/unpublish
        return (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-base font-black uppercase tracking-wider font-mono text-amber-500">TOUR CATALOG MANAGEMENT</h3>
                <p className={`text-xs ${theme.textSecondary}`}>Tambah, ubah data rincian itinerary, harga dasar, serta kelola penerbitan (publish) paket wisata.</p>
              </div>
              <button 
                onClick={() => {
                  setEditingTour(null);
                  setTourForm({
                    id: `tour-${Date.now()}`,
                    name: '',
                    description: '',
                    duration: '2 Days / 1 Night',
                    days: 2,
                    nights: 1,
                    startingPrice: 120,
                    startingPriceIDR: 1500000,
                    wniPrice: 1500000,
                    wnaPrice: 120,
                    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4',
                    category: 'Adventure',
                    highlights: '',
                    itinerary: '',
                    rating: 5.0,
                    reviewCount: 0,
                    includes: 'Tiket Masuk Wisata Resmi\nTransportasi Privat AC Premium\nBBM & Biaya Tol\nDriver Profesional Berpengalaman\nAir Mineral Dingin Selama Perjalanan',
                    excludes: 'Pengeluaran Pribadi & Belanja Oleh-Oleh\nMakan & Minum di Luar Paket\nUang Tip Sukarela (Driver & Pemandu)\nSewa Kuda di Lautan Pasir (Opsional)',
                    gallery: ['https://images.unsplash.com/photo-1537996194471-e657df975ab4'],
                    whatToBring: 'Masker Gas Respirator & Kacamata Goggles (Ijen)\nPakaian Hangat / Jaket Tebal (Bromo/Ijen)\nSepatu Trekking Antiselip\nSenter / Headlamp\nBotol Air Minum Isi Ulang\nObat-obatan Pribadi'
                  });
                  setItineraryItems([]);
                  setIsTourFormOpen(true);
                }}
                className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Buat Paket Tour Baru</span>
              </button>
            </div>

            {/* Filter Indicator */}
            {durationFilter && (
              <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 px-4 py-3 rounded-2xl text-xs font-bold text-amber-500 animate-fade-in">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] bg-amber-500/15 border border-amber-500/35 px-2.5 py-0.5 rounded text-amber-400 font-extrabold uppercase tracking-wider">FILTER AKTIF</span>
                  <span>Menampilkan paket dengan durasi: <strong className="text-white">"{durationFilter}"</strong> ({filteredTours.length} ditemukan)</span>
                </div>
                <button
                  onClick={() => {
                    setDurationFilter(null);
                    triggerToast("Filter durasi dibersihkan");
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-neutral-950 font-black tracking-tight text-[11px] transition-all cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Hapus Filter</span>
                </button>
              </div>
            )}

            {/* Package Row Table List */}
            <div className={`${theme.card} border rounded-2xl overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className={`bg-neutral-900/40 text-neutral-400 font-bold uppercase text-[9px] tracking-widest border-b ${theme.border}`}>
                    <tr>
                      <th className="p-4">KODE ID</th>
                      <th className="p-4">NAMA &amp; KATEGORI PAKET</th>
                      <th className="p-4">DURASI</th>
                      <th className="p-4">TARIF (WNI / WNA)</th>
                      <th className="p-4">STATUS</th>
                      <th className="p-4 text-right">TINDAKAN</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${theme.borderSubtle}`}>
                    {filteredTours.map((tour) => (
                      <tr key={tour.id} className={theme.hover}>
                        <td className="p-4 font-mono font-bold text-amber-500">{tour.id}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-16 rounded-lg overflow-hidden bg-neutral-900 shrink-0 border border-neutral-800">
                              <img 
                                src={tour.image} 
                                alt={tour.name} 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div>
                              <div className="font-extrabold text-neutral-100">{tour.name}</div>
                              <div className="text-[10px] font-mono font-bold text-amber-500/80 uppercase mt-0.5">{tour.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-neutral-800 text-neutral-200 border border-neutral-700">
                            <Clock className="h-3 w-3 text-amber-400" />
                            <span>{tour.duration || formatTourDuration(parseTourDays(tour), parseTourNights(tour))}</span>
                          </span>
                        </td>
                        <td className="p-4 font-mono text-xs">
                          <div className="font-extrabold text-emerald-400">
                            WNI: Rp {(tour.startingPriceIDR || tour.wniPrice || (tour.startingPrice * 16000)).toLocaleString('id-ID')}
                          </div>
                          <div className="text-amber-400 font-bold mt-0.5">
                            WNA: ${(tour.startingPrice || tour.wnaPrice || 0).toLocaleString()} USD
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-black uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                            <Check className="h-3 w-3" /> Published
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            {/* 1. View published item on customer frontend */}
                            <button 
                              onClick={() => {
                                setPage('tours');
                                setSearchParams({ ...searchParams, selectedTourId: tour.id });
                                triggerToast(`Membuka halaman website untuk paket "${tour.name}"`);
                              }}
                              className={`p-2 rounded-xl border ${theme.border} ${theme.hover} text-indigo-400 hover:text-indigo-300 transition-all cursor-pointer`} 
                              title="Lihat di Website"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>

                            {/* 2. Duplicate item */}
                            <button 
                              onClick={() => {
                                const randomSuffix = Math.floor(1000 + Math.random() * 9000);
                                const duplicatedTour = {
                                  ...tour,
                                  id: `${tour.id}-copy-${randomSuffix}`,
                                  name: `${tour.name} (Salinan)`
                                };
                                addTour(duplicatedTour);
                                triggerToast(`Berhasil menduplikasi paket "${tour.name}"`);
                              }}
                              className={`p-2 rounded-xl border ${theme.border} ${theme.hover} text-emerald-400 hover:text-emerald-300 transition-all cursor-pointer`} 
                              title="Duplikat Paket"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>

                            {/* 3. Edit item */}
                            <button 
                              onClick={() => {
                                setEditingTour(tour);
                                const tourD = tour.days || parseTourDays(tour);
                                const tourN = typeof tour.nights === 'number' ? tour.nights : parseTourNights(tour);
                                setTourForm({
                                  id: tour.id,
                                  name: tour.name,
                                  description: tour.description,
                                  duration: tour.duration || formatTourDuration(tourD, tourN),
                                  days: tourD,
                                  nights: tourN,
                                  startingPrice: tour.startingPrice || tour.wnaPrice || 50,
                                  startingPriceIDR: tour.startingPriceIDR || tour.wniPrice || 750000,
                                  wniPrice: tour.startingPriceIDR || tour.wniPrice || 750000,
                                  wnaPrice: tour.startingPrice || tour.wnaPrice || 50,
                                  image: tour.image,
                                  category: tour.category || 'Adventure',
                                  highlights: tour.highlights?.join(', ') || '',
                                  itinerary: tour.itinerary?.join('\n') || '',
                                  rating: tour.rating || 5.0,
                                  reviewCount: tour.reviewCount || 0,
                                  includes: tour.includes?.join('\n') || '',
                                  excludes: tour.excludes?.join('\n') || '',
                                  gallery: tour.gallery || [],
                                  whatToBring: tour.whatToBring?.join('\n') || ''
                                });
                                setItineraryItems(parseItineraryToForm(tour.itinerary));
                                setIsTourFormOpen(true);
                              }}
                              className={`p-2 rounded-xl border ${theme.border} ${theme.hover} text-amber-500 transition-all cursor-pointer`} 
                              title="Edit"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>

                            {/* 4. Delete item */}
                            <button 
                              onClick={() => {
                                if (confirm(`Apakah Anda yakin ingin menghapus paket tour "${tour.name}"?`)) {
                                  deleteTour(tour.id);
                                  triggerToast('Paket tour berhasil dihapus');
                                }
                              }} 
                              className={`p-2 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/15 text-rose-500 transition-all cursor-pointer`} 
                              title="Hapus"
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
            </div>
          </div>
        );
      }

      case 'calendar':
      case 'blackout': {
        return renderAvailabilitySubTabContent();
      }

      case 'schedule': {
        // Selected Month Dates calculation
        const totalDays = new Date(calendarYear, calendarMonth + 1, 0).getDate();
        const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay(); // 0 = Sunday, 6 = Saturday

        const prevMonthDays = new Date(calendarYear, calendarMonth, 0).getDate();
        const paddedPrevDays = [];
        for (let i = firstDayIndex - 1; i >= 0; i--) {
          paddedPrevDays.push({
            day: prevMonthDays - i,
            isCurrentMonth: false,
            monthOffset: -1
          });
        }

        const currentMonthDays = [];
        for (let d = 1; d <= totalDays; d++) {
          currentMonthDays.push({
            day: d,
            isCurrentMonth: true,
            monthOffset: 0
          });
        }

        const totalCells = paddedPrevDays.length + currentMonthDays.length;
        const nextMonthCellsNeeded = (7 - (totalCells % 7)) % 7;
        const paddedNextDays = [];
        for (let d = 1; d <= nextMonthCellsNeeded; d++) {
          paddedNextDays.push({
            day: d,
            isCurrentMonth: false,
            monthOffset: 1
          });
        }

        const allCalendarCells = [...paddedPrevDays, ...currentMonthDays, ...paddedNextDays];

        const getCellDateStr = (cell: { day: number, isCurrentMonth: boolean, monthOffset: number }) => {
          let targetYear = calendarYear;
          let targetMonth = calendarMonth + cell.monthOffset;
          if (targetMonth < 0) {
            targetMonth = 11;
            targetYear--;
          } else if (targetMonth > 11) {
            targetMonth = 0;
            targetYear++;
          }
          return `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`;
        };

        const INDO_MONTH_NAMES = [
          "Januari", "Februari", "Maret", "April", "Mei", "Juni",
          "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];

        const handlePrevMonth = () => {
          if (calendarMonth === 0) {
            setCalendarMonth(11);
            setCalendarYear(prev => prev - 1);
          } else {
            setCalendarMonth(prev => prev - 1);
          }
        };

        const handleNextMonth = () => {
          if (calendarMonth === 11) {
            setCalendarMonth(0);
            setCalendarYear(prev => prev + 1);
          } else {
            setCalendarMonth(prev => prev + 1);
          }
        };

        const selectedDateSchedules = schedules.filter(s => s.date === selectedCalendarDate);

        const getIndonesianDateLabel = (dateStr: string) => {
          try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            const daysInIndo = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
            const monthsInIndo = [
              "Januari", "Februari", "Maret", "April", "Mei", "Juni",
              "Juli", "Agustus", "September", "Oktober", "November", "Desember"
            ];
            return `${daysInIndo[date.getDay()]}, ${date.getDate()} ${monthsInIndo[date.getMonth()]} ${date.getFullYear()}`;
          } catch (e) {
            return dateStr;
          }
        };

        if (isScheduleFormOpen) {
          return (
            <div className="space-y-6 animate-fade-in text-left max-w-2xl mx-auto">
              <div className="flex justify-between items-center border-b border-neutral-850 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black tracking-wider uppercase text-neutral-500">MANAJEMEN KALENDER</span>
                  <h3 className="text-base font-black uppercase tracking-wider font-mono text-amber-500">
                    TAMBAH JADWAL DEPARTURE BARU
                  </h3>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsScheduleFormOpen(false)} 
                  className={`px-4 py-2 text-xs font-bold border ${theme.border} ${theme.hover} rounded-xl cursor-pointer text-white flex items-center gap-1.5`}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Kembali ke Kalender</span>
                </button>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  addSchedule(newScheduleForm);
                  triggerToast('Jadwal baru berhasil disimpan!');
                  setIsScheduleFormOpen(false);
                }}
                className={`${theme.card} border rounded-3xl p-8 space-y-6 text-xs text-left shadow-lg`}
              >
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-black text-neutral-500 uppercase">Pilih Tanggal</label>
                  <input 
                    type="date" 
                    required
                    value={newScheduleForm.date}
                    onChange={(e) => setNewScheduleForm({ ...newScheduleForm, date: e.target.value })}
                    className={`w-full ${theme.input} border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-500 font-mono`} 
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-black text-neutral-500 uppercase">Tipe Jadwal</label>
                  <select 
                    value={newScheduleForm.type}
                    onChange={(e) => setNewScheduleForm({ ...newScheduleForm, type: e.target.value as any })}
                    className={`w-full ${theme.input} border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-500`}
                  >
                    <option value="allocation">Alokasi Supir &amp; Unit</option>
                    <option value="peak">Peak Season Surcharge</option>
                  </select>
                </div>

                {newScheduleForm.type === 'allocation' ? (
                  <>
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-black text-neutral-500 uppercase">Pilih Paket Wisata</label>
                      <select 
                        value={newScheduleForm.tourId}
                        onChange={(e) => setNewScheduleForm({ ...newScheduleForm, tourId: e.target.value })}
                        className={`w-full ${theme.input} border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-500`}
                      >
                        {tours.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-black text-neutral-500 uppercase">Nama Supir (Driver)</label>
                      <input 
                        type="text" 
                        required
                        value={newScheduleForm.driver}
                        onChange={(e) => setNewScheduleForm({ ...newScheduleForm, driver: e.target.value })}
                        placeholder="Contoh: Made Wijaya" 
                        className={`w-full ${theme.input} border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-500`} 
                      />
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-black text-neutral-500 uppercase">Unit Mobil &amp; Plat Nomor</label>
                      <input 
                        type="text" 
                        required
                        value={newScheduleForm.vehicle}
                        onChange={(e) => setNewScheduleForm({ ...newScheduleForm, vehicle: e.target.value })}
                        placeholder="Contoh: Innova Reborn (DK 1289 AA)" 
                        className={`w-full ${theme.input} border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-500`} 
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-black text-neutral-500 uppercase">Persentase Surcharge (%)</label>
                    <input 
                      type="number" 
                      required
                      value={newScheduleForm.surcharge}
                      onChange={(e) => setNewScheduleForm({ ...newScheduleForm, surcharge: Number(e.target.value) })}
                      placeholder="Contoh: 15" 
                      className={`w-full ${theme.input} border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-500 font-mono`} 
                    />
                  </div>
                )}

                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-black text-neutral-500 uppercase">Catatan / Memo Tambahan</label>
                  <input 
                    type="text" 
                    value={newScheduleForm.note}
                    onChange={(e) => setNewScheduleForm({ ...newScheduleForm, note: e.target.value })}
                    placeholder="Contoh: Tamu minta supir yang bisa bahasa Inggris" 
                    className={`w-full ${theme.input} border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-500`} 
                  />
                </div>

                <div className="pt-4 border-t border-neutral-850 flex justify-end gap-2.5">
                  <button type="button" onClick={() => setIsScheduleFormOpen(false)} className={`px-5 py-2.5 border ${theme.border} ${theme.hover} rounded-xl font-bold cursor-pointer text-xs`}>Batal</button>
                  <button type="submit" className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black rounded-xl cursor-pointer text-xs">Simpan Jadwal</button>
                </div>
              </form>
            </div>
          );
        }

        return (
          <div className="space-y-6 animate-fade-in text-left">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-base font-black uppercase tracking-wider font-mono text-amber-500 flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 animate-pulse" />
                  <span>KALENDER DEPARTURE &amp; JADWAL SUPIR</span>
                </h3>
                <p className={`text-xs ${theme.textSecondary}`}>
                  Kelola jadwal supir, alokasi armada mobil, surcharge hari raya, atau hari pemeliharaan kawah secara visual interaktif.
                </p>
              </div>
              <button 
                onClick={() => {
                  setNewScheduleForm({
                    date: selectedCalendarDate,
                    type: 'allocation',
                    tourId: tours[0]?.id || '',
                    driver: '',
                    vehicle: '',
                    surcharge: 0,
                    note: ''
                  });
                  setIsScheduleFormOpen(true);
                }}
                className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="h-4 w-4" />
                <span>Buat Jadwal Baru</span>
              </button>
            </div>

            {/* Calendar double pane grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Side: Visual Calendar Grid */}
              <div className={`lg:col-span-8 ${theme.card} border rounded-3xl p-5 md:p-6 space-y-4`}>
                <div className="flex items-center justify-between border-b border-neutral-800/10 pb-4">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-extrabold text-white font-mono tracking-tight uppercase">
                      Navigasi Bulanan
                    </h4>
                    <span className="text-xl font-black text-amber-500 font-sans tracking-tight">
                      {INDO_MONTH_NAMES[calendarMonth]} {calendarYear}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={handlePrevMonth}
                      className={`p-2 rounded-xl border ${theme.border} hover:bg-neutral-800/30 text-neutral-400 hover:text-white transition-all cursor-pointer`}
                      title="Bulan Sebelumnya"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => {
                        const now = new Date();
                        setCalendarMonth(now.getMonth());
                        setCalendarYear(now.getFullYear());
                        setSelectedCalendarDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`);
                      }}
                      className={`px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl border ${theme.border} hover:bg-neutral-800/30 text-neutral-300 hover:text-white transition-all cursor-pointer`}
                    >
                      Hari Ini
                    </button>
                    <button 
                      onClick={handleNextMonth}
                      className={`p-2 rounded-xl border ${theme.border} hover:bg-neutral-800/30 text-neutral-400 hover:text-white transition-all cursor-pointer`}
                      title="Bulan Berikutnya"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-mono font-black uppercase text-amber-500/80 tracking-widest border-b border-dashed border-neutral-800/10 pb-2">
                  <span>Min</span>
                  <span>Sen</span>
                  <span>Sel</span>
                  <span>Rab</span>
                  <span>Kam</span>
                  <span>Jum</span>
                  <span>Sab</span>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {allCalendarCells.map((cell, idx) => {
                    const dateStr = getCellDateStr(cell);
                    const isSelected = selectedCalendarDate === dateStr;
                    const cellSchedulesList = schedules.filter(s => s.date === dateStr);
                    const hasAlloc = cellSchedulesList.some(s => s.type === 'allocation');
                    const hasPeak = cellSchedulesList.some(s => s.type === 'peak');
                    const hasBlocked = cellSchedulesList.some(s => s.type === 'blocked');

                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedCalendarDate(dateStr)}
                        className={`min-h-[75px] md:min-h-[90px] rounded-2xl p-2 flex flex-col justify-between border cursor-pointer transition-all ${
                          !cell.isCurrentMonth 
                            ? 'opacity-30 bg-transparent border-transparent hover:border-neutral-800' 
                            : 'bg-neutral-900/40 border-white/5 hover:border-amber-500/50'
                        } ${
                          isSelected 
                            ? 'border-amber-500 bg-amber-500/5 shadow-md shadow-amber-500/5 scale-[1.01]' 
                            : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[11px] font-mono font-black ${
                            isSelected ? 'text-amber-400 font-extrabold' : 'text-neutral-300'
                          }`}>
                            {cell.day}
                          </span>
                          
                          <div className="flex gap-1">
                            {hasBlocked && <span className="h-1.5 w-1.5 rounded-full bg-rose-500" title="Kunjungan Blocked" />}
                            {hasPeak && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" title="Surcharge Peak" />}
                            {hasAlloc && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" title="Departure Allocated" />}
                          </div>
                        </div>

                        <div className="space-y-1 mt-1 text-left">
                          {cellSchedulesList.slice(0, 2).map((sc, sIdx) => (
                            <div 
                              key={sIdx} 
                              className={`text-[8px] leading-snug px-1 rounded truncate font-semibold select-none ${
                                sc.type === 'allocation' 
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' 
                                  : sc.type === 'peak'
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/25'
                              }`}
                            >
                              {sc.type === 'allocation' 
                                ? `🚗 ${sc.driver || 'Driver'}` 
                                : sc.type === 'peak'
                                  ? `📈 +${sc.surcharge}%`
                                  : `🚫 Blocked`
                              }
                            </div>
                          ))}
                          {cellSchedulesList.length > 2 && (
                            <div className="text-[7px] text-center text-neutral-400 font-black font-mono">
                              +{cellSchedulesList.length - 2} Lainnya
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Side: Selected Date Detail & Activity Center */}
              <div className="lg:col-span-4 space-y-4">
                <div className={`${theme.card} border rounded-3xl p-5 md:p-6 space-y-4 text-left`}>
                  <div className="border-b border-neutral-800/10 pb-3">
                    <span className="text-[9px] uppercase font-mono text-amber-500 font-black tracking-widest block mb-0.5">DETAIL AKTIVITAS HARIAN</span>
                    <h4 className="text-xs font-black text-neutral-200">
                      {getIndonesianDateLabel(selectedCalendarDate)}
                    </h4>
                  </div>

                  <div className="space-y-3">
                    {selectedDateSchedules.length === 0 ? (
                      <div className="text-center py-10 px-4 space-y-3 bg-neutral-900/10 rounded-2xl border border-dashed border-neutral-850">
                        <div className="p-2.5 bg-neutral-800 text-neutral-400 rounded-full inline-block">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <p className="text-[11px] text-neutral-400 leading-relaxed max-w-xs mx-auto text-center">
                          Tidak ada penugasan supir, surcharge hari libur, atau pembatasan khusus pada tanggal ini.
                        </p>
                      </div>
                    ) : (
                      selectedDateSchedules.map((sc: any) => {
                        const tourObj = tours.find(t => t.id === sc.tourId);
                        return (
                          <div 
                            key={sc.id} 
                            className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 text-xs leading-relaxed ${
                              sc.type === 'allocation'
                                ? 'bg-emerald-500/5 border-emerald-500/15'
                                : sc.type === 'peak'
                                  ? 'bg-amber-500/5 border-amber-500/15'
                                  : 'bg-rose-500/5 border-rose-500/15'
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                                  sc.type === 'allocation'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : sc.type === 'peak'
                                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                }`}>
                                  {sc.type === 'allocation' ? 'Alokasi Supir' : sc.type === 'peak' ? 'Peak Season' : 'Blocked Rute'}
                                </span>
                                
                                <button
                                  onClick={() => {
                                    if (confirm(`Hapus aturan jadwal ini dari kalender?`)) {
                                      deleteSchedule(sc.id);
                                      triggerToast('Jadwal berhasil dihapus dari kalender');
                                    }
                                  }}
                                  className="text-neutral-500 hover:text-rose-500 p-1 rounded-lg hover:bg-rose-500/10 transition-all cursor-pointer"
                                  title="Hapus"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>

                              <div>
                                <h5 className="font-extrabold text-neutral-200 uppercase tracking-tight font-mono text-[11px]">
                                  {sc.type === 'allocation' 
                                    ? (tourObj ? tourObj.name : 'Tour Departures') 
                                    : `Aturan Surcharge & Event`
                                  }
                                </h5>
                                {sc.note && (
                                  <p className="text-[10px] text-neutral-400 mt-1 italic">
                                    "{sc.note}"
                                  </p>
                                )}
                              </div>

                              {sc.type === 'allocation' && (
                                <div className="p-3 bg-neutral-900/40 rounded-xl space-y-1.5 border border-white/5 font-mono text-[10px]">
                                  <div className="flex justify-between text-neutral-300">
                                    <span>👨‍✈️ Driver:</span>
                                    <strong className="text-amber-500">{sc.driver || 'Belum diisi'}</strong>
                                  </div>
                                  <div className="flex justify-between text-neutral-300">
                                    <span>🚗 Armada:</span>
                                    <strong className="text-amber-500">{sc.vehicle || 'Belum diisi'}</strong>
                                  </div>
                                </div>
                              )}

                              {sc.type === 'peak' && (
                                <div className="p-2.5 bg-amber-500/5 rounded-xl border border-amber-500/20 text-center font-bold text-amber-400 font-mono text-[11px]">
                                  Surcharge Liburan: +{sc.surcharge || 0}%
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}

                    <button 
                      onClick={() => {
                        setNewScheduleForm({
                          date: selectedCalendarDate,
                          type: 'allocation',
                          tourId: tours[0]?.id || '',
                          driver: '',
                          vehicle: '',
                          surcharge: 0,
                          note: ''
                        });
                        setIsScheduleFormOpen(true);
                      }}
                      className="w-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 font-black text-[11px] uppercase tracking-wider py-3 rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Tambah Jadwal Tanggal {selectedCalendarDate.split('-')[2]}</span>
                    </button>
                  </div>
                </div>

                <div className={`${theme.card} border rounded-3xl p-4 text-xs space-y-2 text-neutral-400 text-left`}>
                  <p className="font-bold text-neutral-300">Panduan Warna Kalender:</p>
                  <div className="flex flex-col gap-1.5 text-[10px] font-medium font-mono">
                    <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Alokasi Driver &amp; Unit (Keberangkatan)</span>
                    <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-500" /> Hari Libur / Peak Season Surcharge</span>
                    <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-rose-500" /> Hari Pembatasan Rute (Blocked)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'booking': {
        // Daftar booking untuk departemen tours
        return (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-base font-black uppercase tracking-wider font-mono text-amber-500">TOUR BOOKINGS MANIFEST</h3>
                <p className={`text-xs ${theme.textSecondary}`}>Konfirmasi pembayaran, tandai status keberangkatan, dan cetak manifest wisatawan.</p>
              </div>
            </div>

            <div className="space-y-3">
              {tourBookings.length === 0 ? (
                <div className={`${theme.card} border rounded-2xl p-8 text-center text-xs ${theme.textSecondary}`}>
                  Tidak ada data booking tour wisata yang tercatat.
                </div>
              ) : (
                tourBookings.map((b) => (
                  <div key={b.id} className={`${theme.card} border rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-neutral-700 transition-all text-left`}>
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-bold font-mono">
                        TR
                      </div>
                      <div className="space-y-1.5 text-left">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono font-black text-amber-500">{b.id}</span>
                          <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded border ${
                            b.status === 'Completed' ? 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}>{b.status}</span>
                          <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded border ${
                            b.paymentStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>{b.paymentStatus || 'Unpaid'}</span>
                        </div>
                        <h4 className="text-sm font-black tracking-tight">{b.customerName}</h4>
                        <p className={`text-xs font-bold text-neutral-200`}>{b.serviceName}</p>
                        <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] ${theme.textSecondary}`}>
                          <span className="flex items-center gap-1">⏱️ Tanggal: {b.details?.date}</span>
                          <span className="flex items-center gap-1">👥 Tamu: {b.details?.guests} Pax</span>
                          <span className="flex items-center gap-1">📞 Telp: {b.customerPhone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-neutral-850">
                      <span className="text-xs font-mono font-black text-emerald-500">
                        {formatPrice(b.totalPrice, b.totalPriceIDR)}
                      </span>
                      <div className="flex gap-2">
                        {b.paymentStatus !== 'Paid' && (
                          <button 
                            onClick={() => {
                              updateBookingStatus(b.id, b.status, 'Paid');
                              triggerToast(`Booking ${b.id} ditandai LUNAS`);
                            }} 
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[11px] font-extrabold cursor-pointer"
                          >
                            Set Lunas
                          </button>
                        )}
                        {b.status !== 'Completed' && (
                          <button 
                            onClick={() => {
                              updateBookingStatus(b.id, 'Completed', b.paymentStatus);
                              triggerToast(`Booking ${b.id} ditandai SELESAI`);
                            }} 
                            className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-[11px] font-extrabold cursor-pointer"
                          >
                            Set Selesai
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      }

      case 'customer':
        return (
          <div className="space-y-6 animate-fade-in text-left">
            <div>
              <h3 className="text-base font-black uppercase tracking-wider font-mono text-amber-500">DEPT. CUSTOMER DIRECTORY (TOUR PACKAGES)</h3>
              <p className={`text-xs ${theme.textSecondary}`}>Database pelanggan VIP dan segmen pasar loyalitas khusus layanan Tour Packages.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {getUniqueCustomers().map((c, idx) => (
                <div key={idx} className={`${theme.card} border rounded-2xl p-5 space-y-4`}>
                  <div className="flex justify-between items-start">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-800 flex items-center justify-center font-black text-amber-500 font-mono">
                      {c.name.slice(0,2).toUpperCase()}
                    </div>
                    <span className="text-[9px] font-mono font-black bg-amber-500/10 border border-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full">
                      {c.badge}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black tracking-tight">{c.name}</h4>
                    <p className={`text-[11px] font-mono ${theme.textSecondary}`}>{c.email}</p>
                    <p className={`text-[11px] font-mono ${theme.textSecondary}`}>{c.phone}</p>
                  </div>
                  <div className="pt-3 border-t border-neutral-850 flex justify-between items-center text-[10px] font-bold">
                    <span className={theme.textSecondary}>Riwayat Pesanan:</span>
                    <span className="text-amber-500">{c.trips} Booking Berhasil</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'payment': {
        const tourBookings = bookings.filter(b => b.type === 'tour');
        
        // Calculate statistics
        const totalCount = tourBookings.length;
        const paidCount = tourBookings.filter(b => b.paymentStatus === 'Paid').length;
        const unpaidCount = tourBookings.filter(b => b.paymentStatus === 'Unpaid' || !b.paymentStatus).length;
        const pendingCount = tourBookings.filter(b => b.paymentStatus === 'Pending').length;
        
        const totalPaidIDR = tourBookings.filter(b => b.paymentStatus === 'Paid').reduce((sum, b) => sum + (b.totalPriceIDR || 0), 0);
        const totalPaidUSD = tourBookings.filter(b => b.paymentStatus === 'Paid').reduce((sum, b) => sum + (b.totalPrice || 0), 0);
        
        const totalUnpaidIDR = tourBookings.filter(b => b.paymentStatus !== 'Paid').reduce((sum, b) => sum + (b.totalPriceIDR || 0), 0);
        const totalUnpaidUSD = tourBookings.filter(b => b.paymentStatus !== 'Paid').reduce((sum, b) => sum + (b.totalPrice || 0), 0);

        // Filter based on state
        const filteredPaymentBookings = tourBookings.filter(b => {
          const matchStatus = paymentStatusFilter === 'all' || 
            (paymentStatusFilter === 'Paid' && b.paymentStatus === 'Paid') ||
            (paymentStatusFilter === 'Unpaid' && (b.paymentStatus === 'Unpaid' || !b.paymentStatus)) ||
            (paymentStatusFilter === 'Pending' && b.paymentStatus === 'Pending');
            
          const searchLower = paymentSearch.toLowerCase();
          const matchSearch = !paymentSearch || 
            b.customerName.toLowerCase().includes(searchLower) || 
            b.id.toLowerCase().includes(searchLower) ||
            b.serviceName.toLowerCase().includes(searchLower);
            
          return matchStatus && matchSearch;
        });

        return (
          <div className="space-y-6 animate-fade-in text-left">
            <div>
              <h3 className="text-base font-black uppercase tracking-wider font-mono text-amber-500">MANAJEMEN PEMBAYARAN (TOUR PACKAGES)</h3>
              <p className={`text-xs ${theme.textSecondary}`}>Verifikasi, lacak transaksi invoice, dan perbarui status pembayaran tamu secara langsung.</p>
            </div>

            {/* Stats Panel */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className={`${theme.card} border rounded-2xl p-5 space-y-2`}>
                <div className="flex justify-between items-center text-xs">
                  <span className={`font-mono ${theme.textSecondary}`}>TOTAL LUNAS (CASH IN)</span>
                  <span className="text-emerald-500 font-mono text-[10px] font-bold">● PAID ({paidCount})</span>
                </div>
                <div className="text-xl font-black text-emerald-400 font-mono">
                  {currency === 'USD' ? `$${totalPaidUSD}` : `IDR ${totalPaidIDR.toLocaleString('id-ID')}`}
                </div>
                <div className="text-[10px] font-bold text-neutral-500">Telah tersinkronisasi via transfer manual / payment gateway</div>
              </div>

              <div className={`${theme.card} border rounded-2xl p-5 space-y-2`}>
                <div className="flex justify-between items-center text-xs">
                  <span className={`font-mono ${theme.textSecondary}`}>SISA TAGIHAN (RECEIVABLES)</span>
                  <span className="text-rose-500 font-mono text-[10px] font-bold">● UNPAID ({unpaidCount + pendingCount})</span>
                </div>
                <div className="text-xl font-black text-rose-400 font-mono">
                  {currency === 'USD' ? `$${totalUnpaidUSD}` : `IDR ${totalUnpaidIDR.toLocaleString('id-ID')}`}
                </div>
                <div className="text-[10px] font-bold text-neutral-500">Menunggu pelunasan sisa tagihan dari pemesan</div>
              </div>

              <div className={`${theme.card} border rounded-2xl p-5 space-y-2`}>
                <div className="flex justify-between items-center text-xs">
                  <span className={`font-mono ${theme.textSecondary}`}>TOTAL BOOKINGS</span>
                  <span className="text-amber-500 font-mono text-[10px] font-bold">● MANIFEST</span>
                </div>
                <div className="text-xl font-black text-neutral-100 font-mono">
                  {totalCount} Pemesanan
                </div>
                <div className="text-[10px] font-bold text-neutral-500">Rasio Pelunasan: {totalCount ? Math.round((paidCount / totalCount) * 100) : 0}%</div>
              </div>
            </div>

            {/* Filter and Search controls */}
            <div className={`${theme.card} border rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4`}>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <span className="text-[10px] font-black text-neutral-400 font-mono uppercase">STATUS:</span>
                <div className="flex bg-neutral-950/40 p-1 border border-neutral-850 rounded-xl gap-1">
                  {[
                    { id: 'all', label: 'Semua' },
                    { id: 'Paid', label: 'Lunas' },
                    { id: 'Unpaid', label: 'Belum Lunas' },
                    { id: 'Pending', label: 'Pending' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setPaymentStatusFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-black transition-all cursor-pointer uppercase ${
                        paymentStatusFilter === tab.id
                          ? 'bg-amber-500 text-neutral-950'
                          : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative w-full md:w-80">
                <Search className={`absolute left-3.5 top-2.5 h-4 w-4 ${theme.textMuted}`} />
                <input
                  type="text"
                  value={paymentSearch}
                  onChange={(e) => setPaymentSearch(e.target.value)}
                  placeholder="Cari ID, nama pelanggan, atau paket..."
                  className={`w-full ${theme.input} pl-10 pr-4 py-2 text-xs rounded-xl focus:outline-none focus:border-amber-500 border`}
                />
              </div>
            </div>

            {/* Payment List */}
            <div className="space-y-3">
              {filteredPaymentBookings.length === 0 ? (
                <div className={`${theme.card} border rounded-2xl p-8 text-center text-xs ${theme.textSecondary}`}>
                  Tidak ada data transaksi pembayaran yang sesuai dengan filter pencarian.
                </div>
              ) : (
                filteredPaymentBookings.map((b) => (
                  <div key={b.id} className={`${theme.card} border rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-neutral-700 transition-all text-left`}>
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-xl bg-neutral-950 border border-neutral-850 flex items-center justify-center text-amber-500 font-bold font-mono">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div className="space-y-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-black text-amber-500">{b.id}</span>
                          <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded border ${
                            b.paymentStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                            b.paymentStatus === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                            'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>{b.paymentStatus === 'Paid' ? 'Lunas' : b.paymentStatus === 'Pending' ? 'Pending' : 'Belum Lunas'}</span>
                        </div>
                        <h4 className="text-sm font-black tracking-tight">{b.customerName}</h4>
                        <p className={`text-xs text-neutral-200 font-semibold`}>{b.serviceName}</p>
                        <p className={`text-[10px] font-mono ${theme.textSecondary}`}>
                          Tanggal Pelaksanaan: {b.details?.date} • Kontak: {b.customerPhone} / {b.customerEmail}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3.5 w-full md:w-auto pt-3.5 md:pt-0 border-t md:border-t-0 border-neutral-850">
                      <div className="text-right">
                        <span className={`text-xs font-mono ${theme.textSecondary} block text-[10px]`}>TOTAL INVOICE:</span>
                        <span className="text-sm font-mono font-black text-emerald-400">
                          {formatPrice(b.totalPrice, b.totalPriceIDR)}
                        </span>
                      </div>
                      
                      {/* Tombol Status Pembayaran */}
                      <div className="flex gap-2">
                        {b.paymentStatus !== 'Paid' ? (
                          <button
                            onClick={() => {
                              updateBookingStatus(b.id, b.status, 'Paid');
                              triggerToast(`Pembayaran booking ${b.id} berhasil ditandai LUNAS.`);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-neutral-950 text-[11px] font-extrabold cursor-pointer transition-all shadow-md flex items-center gap-1"
                          >
                            <Check className="h-3 w-3 stroke-[3]" />
                            <span>Set Lunas</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              updateBookingStatus(b.id, b.status, 'Unpaid');
                              triggerToast(`Pembayaran booking ${b.id} dibatalkan / ditandai BELUM LUNAS.`);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[11px] font-extrabold cursor-pointer transition-all"
                          >
                            Batal Lunas (Unpaid)
                          </button>
                        )}

                        <button
                          onClick={() => {
                            const newStatus = b.paymentStatus === 'Pending' ? 'Unpaid' : 'Pending';
                            updateBookingStatus(b.id, b.status, newStatus);
                            triggerToast(`Status booking ${b.id} diubah ke ${newStatus.toUpperCase()}`);
                          }}
                          className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold cursor-pointer transition-all ${
                            b.paymentStatus === 'Pending'
                              ? 'bg-neutral-800 border-neutral-700 text-neutral-300'
                              : 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
                          }`}
                        >
                          {b.paymentStatus === 'Pending' ? 'Set Unpaid' : 'Pending'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      }

      case 'finance': {
        const tourBookings = bookings.filter(b => b.type === 'tour');
        
        // Automatic revenues (only from PAID bookings)
        const paidBookings = tourBookings.filter(b => b.paymentStatus === 'Paid');
        
        const autoIncomeIDR = paidBookings.reduce((sum, b) => sum + (b.totalPriceIDR || 0), 0);
        const autoIncomeUSD = paidBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
        
        // Manual entries from ledger state
        const manualIncomeIDR = customLedger.filter(l => l.type === 'income').reduce((sum, l) => sum + l.amountIDR, 0);
        const manualIncomeUSD = customLedger.filter(l => l.type === 'income').reduce((sum, l) => sum + l.amountUSD, 0);
        
        const totalExpensesIDR = customLedger.filter(l => l.type === 'expense').reduce((sum, l) => sum + l.amountIDR, 0);
        const totalExpensesUSD = customLedger.filter(l => l.type === 'expense').reduce((sum, l) => sum + l.amountUSD, 0);
        
        const totalRevenueIDR = autoIncomeIDR + manualIncomeIDR;
        const totalRevenueUSD = autoIncomeUSD + manualIncomeUSD;
        
        const netProfitIDR = totalRevenueIDR - totalExpensesIDR;
        const netProfitUSD = totalRevenueUSD - totalExpensesUSD;

        const handleAddLedger = (e: React.FormEvent) => {
          e.preventDefault();
          const amountNum = parseFloat(ledgerAmountIDRInput);
          if (isNaN(amountNum) || amountNum <= 0) {
            triggerToast('Mohon masukkan jumlah nominal rupiah yang valid.');
            return;
          }
          if (!ledgerDescInput.trim()) {
            triggerToast('Mohon isi uraian transaksi keuangan.');
            return;
          }

          const newEntry = {
            id: `ld-manual-${Date.now()}`,
            date: ledgerDateInput,
            type: ledgerTypeInput,
            category: ledgerCategoryInput,
            amountIDR: amountNum,
            amountUSD: Math.round(amountNum / 15000), // conversion rate 15k
            description: ledgerDescInput,
            bookingId: ledgerBookingIdInput
          };

          setCustomLedger([newEntry, ...customLedger]);
          setLedgerAmountIDRInput('');
          setLedgerDescInput('');
          setLedgerBookingIdInput('general');
          triggerToast('Entitas transaksi baru berhasil disimpan di Ledger Keuangan.');
        };

        const handleDeleteLedger = (id: string) => {
          setCustomLedger(customLedger.filter(l => l.id !== id));
          triggerToast('Transaksi manual dihapus.');
        };

        return (
          <div className="space-y-6 animate-fade-in text-left">
            <div>
              <h3 className="text-base font-black uppercase tracking-wider font-mono text-amber-500">KEUANGAN LEDGER & ARUS KAS (TOUR PACKAGES)</h3>
              <p className={`text-xs ${theme.textSecondary}`}>Lacak pendapatan, pengeluaran logistik, fee supir, dan laba bersih operasional Smart Journey secara terperinci.</p>
            </div>

            {/* Ledger Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className={`${theme.card} border rounded-2xl p-5 space-y-2`}>
                <span className={`text-[10px] font-mono block ${theme.textSecondary}`}>TOTAL PENDAPATAN (INCOME)</span>
                <div className="text-xl font-black text-emerald-400 font-mono">
                  {currency === 'USD' ? `$${totalRevenueUSD}` : `IDR ${totalRevenueIDR.toLocaleString('id-ID')}`}
                </div>
                <div className="text-[9px] text-neutral-500 font-bold">
                  SJT Booking: {currency === 'USD' ? `$${autoIncomeUSD}` : `IDR ${autoIncomeIDR.toLocaleString('id-ID')}`} • Manual: {currency === 'USD' ? `$${manualIncomeUSD}` : `IDR ${manualIncomeIDR.toLocaleString('id-ID')}`}
                </div>
              </div>

              <div className={`${theme.card} border rounded-2xl p-5 space-y-2`}>
                <span className={`text-[10px] font-mono block ${theme.textSecondary}`}>TOTAL BIAYA OPERASIONAL (EXPENSES)</span>
                <div className="text-xl font-black text-rose-400 font-mono">
                  {currency === 'USD' ? `$${totalExpensesUSD}` : `IDR ${totalExpensesIDR.toLocaleString('id-ID')}`}
                </div>
                <div className="text-[9px] text-neutral-500 font-bold">Terdiri dari BBM, Tiket Masuk, Tip Supir, &amp; Konsumsi</div>
              </div>

              <div className={`${theme.card} border rounded-2xl p-5 space-y-2 border-amber-500/20 bg-amber-500/5`}>
                <span className="text-[10px] font-mono text-amber-500 block">LABA BERSIH (NET INCOME)</span>
                <div className={`text-xl font-black font-mono ${netProfitIDR >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {currency === 'USD' ? `${netProfitUSD >= 0 ? '' : '-'}$${Math.abs(netProfitUSD)}` : `${netProfitIDR >= 0 ? '' : '-'}IDR ${Math.abs(netProfitIDR).toLocaleString('id-ID')}`}
                </div>
                <div className="text-[9px] text-neutral-500 font-bold">Margin Laba Bersih: {totalRevenueIDR ? Math.round((netProfitIDR / totalRevenueIDR) * 100) : 0}%</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Form Manual Cost Input */}
              <div className="lg:col-span-4 space-y-4">
                <div className={`${theme.card} border rounded-3xl p-5 md:p-6 space-y-4`}>
                  <h4 className="text-xs font-black uppercase tracking-wider font-mono text-amber-500 border-b border-neutral-850 pb-3 flex items-center gap-1.5">
                    <Plus className="h-4.5 w-4.5 text-amber-500" />
                    <span>BUAT TRANSAKSI MANUAL</span>
                  </h4>

                  <form onSubmit={handleAddLedger} className="space-y-4 text-xs text-left">
                    {/* HUBUNGKAN KE BOOKING DROPDOWN */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-neutral-500 uppercase font-mono block">Hubungkan ke Booking ID</label>
                      <select
                        value={ledgerBookingIdInput}
                        onChange={(e) => {
                          const val = e.target.value;
                          setLedgerBookingIdInput(val);
                          if (val !== 'general') {
                            const foundB = tourBookings.find(b => b.id === val);
                            if (foundB && foundB.details?.date) {
                              setLedgerDateInput(foundB.details.date);
                              setLedgerDescInput(`${ledgerCategoryInput} Booking #${foundB.id} (${foundB.customerName})`);
                            }
                          }
                        }}
                        className={`w-full ${theme.input} border rounded-xl px-3 py-2 text-xs`}
                      >
                        <option value="general">Umum / Operasional Kantor (Tidak Terikat Booking)</option>
                        {tourBookings.map(b => (
                          <option key={b.id} value={b.id}>
                            #{b.id} - {b.customerName} ({b.serviceName.length > 25 ? b.serviceName.slice(0, 25) + '...' : b.serviceName})
                          </option>
                        ))}
                      </select>
                      <span className="text-[9px] text-neutral-500 block mt-1">Sangat disarankan: Hubungkan pengeluaran supir, BBM, atau tiket ke Booking ID spesifik untuk analisis laba-rugi terperinci.</span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-neutral-500 uppercase font-mono">Tanggal Transaksi</label>
                      <input
                        type="date"
                        required
                        value={ledgerDateInput}
                        onChange={(e) => setLedgerDateInput(e.target.value)}
                        className={`w-full ${theme.input} border rounded-xl px-3.5 py-2 text-xs font-mono`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-neutral-500 uppercase font-mono block">Arus</label>
                        <select
                          value={ledgerTypeInput}
                          onChange={(e) => setLedgerTypeInput(e.target.value as any)}
                          className={`w-full ${theme.input} border rounded-xl px-3 py-2 text-xs`}
                        >
                          <option value="expense">Pengeluaran (-)</option>
                          <option value="income">Kas Masuk (+)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-neutral-500 uppercase font-mono block">Kategori</label>
                        <select
                          value={ledgerCategoryInput}
                          onChange={(e) => {
                            const cat = e.target.value;
                            setLedgerCategoryInput(cat);
                            if (ledgerBookingIdInput !== 'general') {
                              const foundB = tourBookings.find(b => b.id === ledgerBookingIdInput);
                              if (foundB) {
                                setLedgerDescInput(`${cat} Booking #${foundB.id} (${foundB.customerName})`);
                              }
                            }
                          }}
                          className={`w-full ${theme.input} border rounded-xl px-3 py-2 text-xs`}
                        >
                          <option value="Operational">Operational (BBM/Tol)</option>
                          <option value="Driver/Crew Fee">Driver/Crew Fee</option>
                          <option value="Ticket/Permit">Ticket/Permit</option>
                          <option value="Catering/Food">Catering/Food</option>
                          <option value="Marketing">Marketing</option>
                          <option value="Others">Kategori Lainnya</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-neutral-500 uppercase font-mono">Nominal Rupiah (IDR)</label>
                      <input
                        type="number"
                        required
                        placeholder="Contoh: 150000"
                        value={ledgerAmountIDRInput}
                        onChange={(e) => setLedgerAmountIDRInput(e.target.value)}
                        className={`w-full ${theme.input} border rounded-xl px-3.5 py-2 text-xs font-mono`}
                      />
                      <span className="text-[9px] text-neutral-500 block">Kurs acuan USD: ~IDR 15.000 / $1</span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-neutral-500 uppercase font-mono">Uraian / Deskripsi</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Beli BBM Pertalite Avanza"
                        value={ledgerDescInput}
                        onChange={(e) => setLedgerDescInput(e.target.value)}
                        className={`w-full ${theme.input} border rounded-xl px-3.5 py-2 text-xs`}
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black text-[11px] uppercase tracking-wider py-2.5 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer mt-1"
                    >
                      <Save className="h-4 w-4" />
                      <span>Simpan Transaksi</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* Jurnal Keuangan & Analisis Laba/Rugi Tab Content (8 cols) */}
              <div className="lg:col-span-8 space-y-4">
                {/* Tab Switcher */}
                <div className="flex bg-neutral-950/40 p-1 border border-neutral-850 rounded-xl gap-1">
                  <button
                    onClick={() => setFinanceSubView('per-booking')}
                    className={`flex-1 py-2 rounded-lg text-xs font-mono font-black transition-all cursor-pointer uppercase ${
                      financeSubView === 'per-booking'
                        ? 'bg-amber-500 text-neutral-950'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    📊 Laba Rugi per Booking
                  </button>
                  <button
                    onClick={() => setFinanceSubView('jurnal')}
                    className={`flex-1 py-2 rounded-lg text-xs font-mono font-black transition-all cursor-pointer uppercase ${
                      financeSubView === 'jurnal'
                        ? 'bg-amber-500 text-neutral-950'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    📓 Jurnal Umum Kas
                  </button>
                </div>

                {financeSubView === 'per-booking' ? (
                  // NEW LABA/RUGI PER BOOKING VIEW
                  <div className="space-y-4">
                    {tourBookings.map((b) => {
                      // Find manual costs linked to this specific booking ID
                      const bookingExpenses = customLedger.filter(l => l.bookingId === b.id && l.type === 'expense');
                      const bookingIncomes = customLedger.filter(l => l.bookingId === b.id && l.type === 'income');

                      const totalBookingExpIDR = bookingExpenses.reduce((sum, l) => sum + l.amountIDR, 0);
                      const totalBookingExpUSD = bookingExpenses.reduce((sum, l) => sum + l.amountUSD, 0);

                      const totalBookingIncIDR = bookingIncomes.reduce((sum, l) => sum + l.amountIDR, 0);
                      const totalBookingIncUSD = bookingIncomes.reduce((sum, l) => sum + l.amountUSD, 0);

                      const revenuePaid = b.paymentStatus === 'Paid';
                      const revenueIDR = (b.totalPriceIDR || 0) + totalBookingIncIDR;
                      const revenueUSD = (b.totalPrice || 0) + totalBookingIncUSD;

                      // Projected net profit
                      const netProfitProjectedIDR = revenueIDR - totalBookingExpIDR;
                      const netProfitProjectedUSD = revenueUSD - totalBookingExpUSD;

                      // Realized cash-in profit (only counts booking price if it is marked as PAID)
                      const realizedRevenueIDR = (revenuePaid ? (b.totalPriceIDR || 0) : 0) + totalBookingIncIDR;
                      const realizedRevenueUSD = (revenuePaid ? (b.totalPrice || 0) : 0) + totalBookingIncUSD;
                      const netProfitRealizedIDR = realizedRevenueIDR - totalBookingExpIDR;
                      const netProfitRealizedUSD = realizedRevenueUSD - totalBookingExpUSD;

                      return (
                        <div key={b.id} className={`${theme.card} border rounded-2xl p-5 space-y-4 hover:border-neutral-700 transition-all text-left`}>
                          {/* Booking Header Info */}
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-neutral-850 pb-3">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-mono font-black text-amber-500">{b.id}</span>
                                <span className="text-[10px] font-mono text-neutral-400 font-bold">● {b.details?.date || b.bookingDate.split(' ')[0]}</span>
                                <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded border ${
                                  b.paymentStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                  b.paymentStatus === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                                  'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                }`}>
                                  {b.paymentStatus === 'Paid' ? 'Lunas (Cash In)' : b.paymentStatus === 'Pending' ? 'Pending' : 'Belum Bayar (Piutang)'}
                                </span>
                              </div>
                              <h4 className="text-sm font-black text-neutral-100 tracking-tight mt-1">
                                {b.customerName} — <span className="text-amber-500 font-semibold">{b.serviceName}</span>
                              </h4>
                            </div>
                            <div className="text-left sm:text-right">
                              <span className="text-[9px] font-mono text-neutral-500 block uppercase font-bold">Nilai Invoice</span>
                              <span className="text-sm font-mono font-black text-emerald-400">
                                {currency === 'USD' ? `$${b.totalPrice}` : `IDR ${(b.totalPriceIDR || 0).toLocaleString('id-ID')}`}
                              </span>
                            </div>
                          </div>

                          {/* Itemized Expenses Tied to This Booking */}
                          <div className="space-y-2">
                            <span className="text-[9px] font-black text-neutral-500 uppercase font-mono tracking-wider">
                              Rincian Pengeluaran Booking (Itemized Expenses):
                            </span>

                            {bookingExpenses.length === 0 ? (
                              <div className="bg-neutral-950/20 rounded-xl p-3 border border-neutral-850/60 text-center text-[11px] text-neutral-400 font-medium">
                                Belum ada pengeluaran operasional (supir, BBM, tiket) yang ditautkan ke booking ini.
                                <br />
                                <span className="text-[10px] text-amber-500/80 font-mono">Gunakan form "BUAT TRANSAKSI MANUAL" di sebelah kiri untuk menautkan pengeluaran ke booking ID #{b.id}.</span>
                              </div>
                            ) : (
                              <div className="space-y-1.5">
                                {bookingExpenses.map((exp) => (
                                  <div key={exp.id} className="flex justify-between items-center bg-neutral-900/40 p-2.5 rounded-xl border border-neutral-850/60 text-xs">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[9px] font-mono font-black uppercase bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded">
                                        {exp.category}
                                      </span>
                                      <span className="font-semibold text-neutral-200">{exp.description}</span>
                                    </div>
                                    <div className="font-mono font-black text-rose-400 text-right flex items-center gap-2">
                                      <span>-{currency === 'USD' ? `$${exp.amountUSD}` : `IDR ${exp.amountIDR.toLocaleString('id-ID')}`}</span>
                                      <button 
                                        onClick={() => handleDeleteLedger(exp.id)} 
                                        className="text-[10px] text-rose-400/50 hover:text-rose-400 font-black px-1.5 cursor-pointer"
                                        title="Hapus biaya"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Profitability Conclusion */}
                          <div className="grid grid-cols-2 gap-3 bg-neutral-950/50 rounded-xl p-3.5 border border-neutral-850/80">
                            <div>
                              <span className="text-[9px] font-mono text-neutral-500 block uppercase font-bold text-left">Laba Riil Saat Ini (Realized)</span>
                              <span className={`text-xs sm:text-sm font-mono font-black block text-left ${netProfitRealizedIDR >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {currency === 'USD' ? `${netProfitRealizedUSD >= 0 ? '' : '-'}$${Math.abs(netProfitRealizedUSD)}` : `${netProfitRealizedIDR >= 0 ? '' : '-'}IDR ${Math.abs(netProfitRealizedIDR).toLocaleString('id-ID')}`}
                              </span>
                              <span className="text-[8px] text-neutral-500 block mt-0.5 text-left">Kas masuk terkumpul dikurangi pengeluaran</span>
                            </div>

                            <div>
                              <span className="text-[9px] font-mono text-neutral-500 block uppercase font-bold text-right">Proyeksi Laba Bersih (Projected)</span>
                              <span className={`text-xs sm:text-sm font-mono font-black block text-right ${netProfitProjectedIDR >= 0 ? 'text-amber-500' : 'text-rose-400'}`}>
                                {currency === 'USD' ? `${netProfitProjectedUSD >= 0 ? '' : '-'}$${Math.abs(netProfitProjectedUSD)}` : `${netProfitProjectedIDR >= 0 ? '' : '-'}IDR ${Math.abs(netProfitProjectedIDR).toLocaleString('id-ID')}`}
                              </span>
                              <span className="text-[8px] text-neutral-500 block mt-0.5 text-right font-medium">Potensi total laba bersih setelah lunas</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  // CHRONOLOGICAL LEDGER (JURNAL KEUANGAN KOMPREHENSIF)
                  <div className={`${theme.card} border rounded-2xl overflow-hidden shadow-sm`}>
                    <div className="p-4 border-b border-neutral-850 flex justify-between items-center bg-neutral-900/10">
                      <h4 className="text-xs font-black uppercase tracking-widest font-mono text-amber-500">
                        JURNAL KEUANGAN KOMPREHENSIF (REAL-TIME)
                      </h4>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs leading-normal">
                        <thead className="bg-neutral-900/40 text-neutral-400 font-bold uppercase text-[9px] tracking-widest border-b border-neutral-850">
                          <tr>
                            <th className="p-4">TANGGAL</th>
                            <th className="p-4">URAIAN TRANSAKSI</th>
                            <th className="p-4 font-mono">KATEGORI</th>
                            <th className="p-4 text-right">JUMLAH (VALUTA)</th>
                            <th className="p-4 text-right">AKSI</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-850">
                          {/* 1. Show Booking Incomes */}
                          {paidBookings.map((b) => (
                            <tr key={b.id} className={`${theme.hover} bg-emerald-500/[0.01]`}>
                              <td className="p-4 font-mono text-[11px] text-neutral-400">{b.bookingDate.split(' ')[0]}</td>
                              <td className="p-4">
                                <div className="font-extrabold text-neutral-200">Revenue Booking #{b.id}</div>
                                <p className={`text-[10px] ${theme.textSecondary}`}>{b.customerName} • {b.serviceName}</p>
                              </td>
                              <td className="p-4"><span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">BOOKING REVENUE</span></td>
                              <td className="p-4 text-right font-mono font-black text-emerald-400">
                                +{currency === 'USD' ? `$${b.totalPrice}` : `IDR ${(b.totalPriceIDR || 0).toLocaleString('id-ID')}`}
                              </td>
                              <td className="p-4 text-right text-neutral-600 font-bold text-[10px]">AUTO</td>
                            </tr>
                          ))}

                          {/* 2. Show Custom Entries */}
                          {customLedger.map((l) => (
                            <tr key={l.id} className={`${theme.hover} ${l.type === 'income' ? 'bg-emerald-500/[0.01]' : 'bg-rose-500/[0.01]'}`}>
                              <td className="p-4 font-mono text-[11px] text-neutral-400">{l.date}</td>
                              <td className="p-4">
                                <div className="font-extrabold text-neutral-200">{l.description}</div>
                                <div className="flex gap-1.5 items-center mt-1">
                                  <span className="text-[9px] font-mono font-bold text-neutral-500 uppercase">MANUAL REGISTER</span>
                                  {l.bookingId && l.bookingId !== 'general' && (
                                    <span className="text-[9px] font-mono font-bold text-amber-500 uppercase bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                                      Booking #{l.bookingId}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="p-4">
                                <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full border ${
                                  l.type === 'income' 
                                    ? 'bg-emerald-500/10 border-emerald-500/15 text-emerald-400' 
                                    : 'bg-rose-500/10 border-rose-500/15 text-rose-400'
                                }`}>{l.category}</span>
                              </td>
                              <td className={`p-4 text-right font-mono font-black ${l.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {l.type === 'income' ? '+' : '-'}
                                {currency === 'USD' ? `$${l.amountUSD}` : `IDR ${l.amountIDR.toLocaleString('id-ID')}`}
                              </td>
                              <td className="p-4 text-right">
                                <button
                                  onClick={() => handleDeleteLedger(l.id)}
                                  className="text-[10px] font-mono uppercase text-rose-400 hover:text-rose-300 font-black cursor-pointer bg-rose-500/10 p-1.5 rounded"
                                  title="Hapus manual entry"
                                >
                                  HAPUS
                                </button>
                              </td>
                            </tr>
                          ))}

                          {/* Fallback if totally empty */}
                          {paidBookings.length === 0 && customLedger.length === 0 && (
                            <tr>
                              <td colSpan={5} className="p-8 text-center text-xs text-neutral-500 font-mono">
                                Tidak ada data arus kas ledger keuangan yang terdaftar hari ini.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }

      case 'reports': {
        const tourBookings = bookings.filter(b => b.type === 'tour');

        // Apply Date range and search filter
        const reportBookings = tourBookings.filter(b => {
          if (reportTourFilter !== 'all' && b.serviceName !== reportTourFilter) {
            return false;
          }
          
          if (reportDateRange === 'month') {
            // Filter only July 2026
            return b.details?.date?.startsWith('2026-07');
          } else if (reportDateRange === 'prev-month') {
            // Filter only June 2026
            return b.details?.date?.startsWith('2026-06');
          }
          return true;
        });

        // Unique Tours for filtering
        const uniqueTourNames = Array.from(new Set(tourBookings.map(b => b.serviceName)));

        const handleDownloadCSV = () => {
          setIsGeneratingReport(true);
          
          setTimeout(() => {
            setIsGeneratingReport(false);
            
            // Build real CSV data
            let csvContent = 'ID Booking,Nama Pelanggan,Email,Telepon,Paket Layanan,Tanggal Pelaksanaan,Pax Tamu,Mata Uang,Harga Total,Status,Status Pembayaran,Tanggal Pemesanan\n';
            
            reportBookings.forEach(b => {
              const row = [
                b.id,
                `"${b.customerName.replace(/"/g, '""')}"`,
                b.customerEmail,
                `"${b.customerPhone}"`,
                `"${b.serviceName.replace(/"/g, '""')}"`,
                b.details?.date || '-',
                b.details?.guests || 1,
                currency,
                currency === 'USD' ? b.totalPrice : b.totalPriceIDR,
                b.status,
                b.paymentStatus || 'Unpaid',
                b.bookingDate
              ].join(',');
              csvContent += row + '\n';
            });
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `SJT_Laporan_Tours_${reportDateRange}_${reportTourFilter.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            triggerToast('Laporan spreadsheet (.CSV) berhasil diunduh ke komputer Anda!');
          }, 800);
        };

        const handlePrintManifest = () => {
          const printWindow = window.open('', '_blank');
          if (!printWindow) {
            triggerToast('Gagal membuka jendela cetak. Izinkan pop-up untuk mencetak manifest.');
            return;
          }

          let manifestRowsHTML = '';
          reportBookings.forEach((b, idx) => {
            manifestRowsHTML += `
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px; font-family: monospace;">${idx+1}</td>
                <td style="padding: 10px; font-family: monospace; font-weight: bold;">${b.id}</td>
                <td style="padding: 10px;">
                  <strong>${b.customerName}</strong><br/>
                  <small style="color: #666;">${b.customerPhone} / ${b.customerEmail}</small>
                </td>
                <td style="padding: 10px;">${b.serviceName}</td>
                <td style="padding: 10px; font-family: monospace;">${b.details?.date || '-'}</td>
                <td style="padding: 10px; font-family: monospace;">${b.details?.guests || 1} Pax</td>
                <td style="padding: 10px; font-family: monospace; text-align: right; font-weight: bold; color: #10b981;">
                  ${currency === 'USD' ? `$${b.totalPrice}` : `IDR ${(b.totalPriceIDR || 0).toLocaleString('id-ID')}`}
                </td>
                <td style="padding: 10px; text-align: center;">
                  <span style="padding: 3px 8px; border-radius: 4px; font-size: 10px; font-family: monospace; background: ${b.paymentStatus === 'Paid' ? '#d1fae5; color: #065f46;' : '#fee2e2; color: #991b1b;'}">
                    ${b.paymentStatus === 'Paid' ? 'LUNAS' : 'BELUM BAYAR'}
                  </span>
                </td>
              </tr>
            `;
          });

          const printDoc = `
            <html>
              <head>
                <title>Manifest Wisatawan Smart Journey</title>
                <style>
                  body { font-family: 'Plus Jakarta Sans', sans-serif; padding: 40px; color: #111; }
                  table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                  th { background: #f3f4f6; padding: 12px; text-align: left; border-bottom: 2px solid #ddd; font-size: 11px; text-transform: uppercase; }
                  .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px double #333; padding-bottom: 20px; }
                  .footer { margin-top: 40px; font-size: 10px; color: #555; text-align: center; border-top: 1px solid #ddd; padding-top: 20px; }
                </style>
              </head>
              <body>
                <div class="header">
                  <div>
                    <h1 style="margin: 0; font-size: 20px; letter-spacing: 1px;">SMART JOURNEY</h1>
                    <p style="margin: 5px 0 0; font-size: 11px; color: #444;">Surel: info@smartjourney.com • Portal Operasional Pariwisata Utama</p>
                  </div>
                  <div style="text-align: right;">
                    <h3 style="margin: 0; font-size: 14px; font-family: monospace;">MANIFEST PERJALANAN</h3>
                    <p style="margin: 5px 0 0; font-size: 11px; font-family: monospace;">Filter: ${reportDateRange.toUpperCase()}</p>
                  </div>
                </div>
                
                <div style="margin-top: 20px; font-size: 12px; background: #fafafa; border: 1px solid #eee; padding: 15px; border-radius: 8px;">
                  <strong>Daftar Manifest:</strong> ${reportTourFilter === 'all' ? 'Semua Paket Wisata' : reportTourFilter} <br/>
                  <strong>Jumlah Pesanan:</strong> ${reportBookings.length} Terdaftar • <strong>Tanggal Cetak:</strong> ${new Date().toLocaleString('id-ID')}
                </div>

                <table>
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>ID Booking</th>
                      <th>Nama &amp; Kontak Tamu</th>
                      <th>Layanan Paket Wisata</th>
                      <th>Tanggal Jalan</th>
                      <th>Jumlah Pax</th>
                      <th style="text-align: right;">Total Nilai</th>
                      <th style="text-align: center;">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${manifestRowsHTML || '<tr><td colspan="8" style="text-align: center; padding: 20px;">Tidak ada manifest tamu terdaftar.</td></tr>'}
                  </tbody>
                </table>

                <div class="footer">
                  Dokumen manifest resmi Smart Journey. Seluruh data tercatat otomatis pada sistem operasional internal SJT.
                </div>
                <script>
                  window.onload = function() { window.print(); }
                </script>
              </body>
            </html>
          `;

          printWindow.document.write(printDoc);
          printWindow.document.close();
          triggerToast('Membuka pratinjau halaman cetak manifest wisatawan...');
        };

        return (
          <div className="space-y-6 animate-fade-in text-left">
            <div>
              <h3 className="text-base font-black uppercase tracking-wider font-mono text-amber-500">PUSAT UNDUH LAPORAN &amp; MANIFEST (TOUR PACKAGES)</h3>
              <p className={`text-xs ${theme.textSecondary}`}>Ekspor data manifest tamu ke format Microsoft Excel / CSV atau cetak manifest keberangkatan driver.</p>
            </div>

            {/* Filter Panel */}
            <div className={`${theme.card} border rounded-3xl p-6 space-y-5`}>
              <h4 className="text-xs font-black uppercase tracking-widest font-mono text-amber-500 border-b border-neutral-850 pb-2">
                Atur Filter Parameter Ekspor
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-wider font-mono">Periode Waktu Perjalanan</label>
                  <select
                    value={reportDateRange}
                    onChange={(e) => setReportDateRange(e.target.value as any)}
                    className={`w-full ${theme.input} border rounded-xl px-3.5 py-2 focus:outline-none focus:border-amber-500`}
                  >
                    <option value="month">Bulan Ini (Juli 2026)</option>
                    <option value="prev-month">Bulan Lalu (Juni 2026)</option>
                    <option value="all">Semua Periode</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-wider font-mono">Pilih Paket Wisata</label>
                  <select
                    value={reportTourFilter}
                    onChange={(e) => setReportTourFilter(e.target.value)}
                    className={`w-full ${theme.input} border rounded-xl px-3.5 py-2 focus:outline-none focus:border-amber-500`}
                  >
                    <option value="all">Semua Paket Wisata</option>
                    {uniqueTourNames.map((name, i) => (
                      <option key={i} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-neutral-850 justify-end">
                {/* Print manifest */}
                <button
                  onClick={handlePrintManifest}
                  className="px-5 py-3 rounded-xl border border-neutral-700 bg-neutral-900 text-xs font-bold text-neutral-200 hover:text-white hover:bg-neutral-850 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
                >
                  <FileCheck className="h-4 w-4 text-amber-500" />
                  <span>Cetak Manifest Perjalanan (Print)</span>
                </button>

                {/* Download csv */}
                <button
                  onClick={handleDownloadCSV}
                  disabled={isGeneratingReport}
                  className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-neutral-950 text-xs font-black transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  {isGeneratingReport ? (
                    <RefreshCw className="h-4 w-4 animate-spin text-neutral-950" />
                  ) : (
                    <Download className="h-4 w-4 text-neutral-950 stroke-[2.5]" />
                  )}
                  <span>{isGeneratingReport ? 'Membuat Spreadsheet...' : 'Unduh Laporan Spreadsheet (.CSV)'}</span>
                </button>
              </div>
            </div>

            {/* Document Preview Area */}
            <div className={`${theme.card} border rounded-2xl overflow-hidden shadow-sm`}>
              <div className="p-4 border-b border-neutral-850 flex justify-between items-center bg-neutral-900/10">
                <span className="text-xs font-black uppercase tracking-widest font-mono text-amber-500">
                  Pratinjau Dokumen Manifest Wisatawan ({reportBookings.length} manifest disaring)
                </span>
                <span className="text-[10px] font-mono text-neutral-500">JULI_2026_SJT_MANIFEST</span>
              </div>

              {reportBookings.length === 0 ? (
                <div className="text-center py-12 text-xs text-neutral-500 font-mono space-y-2">
                  <FileText className="h-8 w-8 text-neutral-600 mx-auto" />
                  <div>Tidak ada manifest yang cocok dengan filter parameter Anda.</div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs leading-normal">
                    <thead className="bg-neutral-900/40 text-neutral-400 font-bold uppercase text-[9px] tracking-widest border-b border-neutral-850">
                      <tr>
                        <th className="p-4">ID</th>
                        <th className="p-4">WISATAWAN</th>
                        <th className="p-4">LAYANAN TOUR</th>
                        <th className="p-4">TANGGAL JALAN</th>
                        <th className="p-4">GUESTS</th>
                        <th className="p-4 text-right">TOTAL NILAI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-850">
                      {reportBookings.map((b) => (
                        <tr key={b.id} className={theme.hover}>
                          <td className="p-4 font-mono font-bold text-amber-500">{b.id}</td>
                          <td className="p-4">
                            <div className="font-extrabold text-neutral-200">{b.customerName}</div>
                            <span className={`text-[10px] ${theme.textSecondary}`}>{b.customerEmail}</span>
                          </td>
                          <td className="p-4 font-semibold text-neutral-300">{b.serviceName}</td>
                          <td className="p-4 font-mono text-neutral-400">{b.details?.date || '-'}</td>
                          <td className="p-4 font-mono">{b.details?.guests || 1} Pax</td>
                          <td className="p-4 text-right font-mono font-bold text-emerald-400">
                            {formatPrice(b.totalPrice, b.totalPriceIDR)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );
      }

      case 'settings':
      default:
        // Render standard mock subtabs
        return (
          <div className="space-y-6 animate-fade-in text-left">
            <h4 className="text-xs font-black uppercase tracking-wider font-mono text-amber-500">Layanan Minor: {activeSubTab.toUpperCase()}</h4>
            <div className={`${theme.card} border rounded-2xl p-6 text-xs ${theme.textSecondary}`}>
              Detail finansial / ulasan tamu telah tersinkronisasi otomatis dengan server utama Smart Journey.
            </div>
          </div>
        );
    }
  };

  const renderAirportSubTabContent = () => {
    // Filter bookings for airport
    const airportBookings = bookings.filter(b => b.type === 'airport');

    switch (activeSubTab) {
      case 'calendar': {
        return <AirportBookingCalendar />;
      }
      case 'dashboard': {
        const totalSalesUSD = airportBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
        const totalSalesIDR = airportBookings.reduce((sum, b) => sum + (b.totalPriceIDR || 0), 0);
        const activePickups = airportBookings.filter(b => b.status === 'Confirmed').length;
        const totalActiveAirports = airports.filter(a => a.status === 'Active').length;

        return (
          <div className="space-y-6 animate-fade-in text-left">
            {/* Header banner */}
            <div className={`${theme.innerCard} border rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
              <div className="space-y-1">
                <h3 className="text-base font-black uppercase tracking-wider font-mono text-amber-500 flex items-center gap-2">
                  <Plane className="h-4.5 w-4.5 animate-bounce" />
                  ANALITIK AIRPORT TRANSFER SERVICE
                </h3>
                <p className={`text-xs ${theme.textSecondary}`}>
                  Sirkulasi armada penjemputan bandara ({airports.map(a => a.code).join(', ')}), rute transfer, dan tarif dasar penjemputan.
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full">
                DIVISI: SJT_AIRPORT_TRANSFER
              </span>
            </div>

            {/* Airport Transfer Specific Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Rute Terbit" value={`${airportRoutes.length} Rute`} change="Published" isPositive={true} label="Active connections" icon={Globe} />
              <StatCard title="Bandara Terbuka" value={`${totalActiveAirports} / ${airports.length}`} change="Active" isPositive={true} label="Open terminals" icon={Plane} />
              <StatCard title="Flight Pickups" value={`${activePickups} Penjemputan`} change="On Time" isPositive={true} label="Hari ini" icon={Truck} />
              <StatCard title="Omset Transfer" value={currency === 'USD' ? `$${totalSalesUSD}` : `IDR ${(totalSalesIDR / 1000000).toFixed(1)}M`} change="+18.2%" isPositive={true} label="Total sales" icon={BarChart3} />
            </div>

            {/* Layout for Airport Transfers */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Destination Area Analysis */}
              <div className={`${theme.card} border rounded-2xl p-6 space-y-4`}>
                <h4 className="text-xs font-black uppercase tracking-widest font-mono text-amber-500 border-b border-neutral-850 pb-2">
                  Status Operasional Bandara
                </h4>
                <div className="space-y-3.5 pt-2">
                  {airports.map((ap) => (
                    <div key={ap.code} className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-mono font-black text-amber-500 mr-2">{ap.code}</span>
                        <span className="font-extrabold">{ap.name}</span>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        ap.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {ap.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Flight Monitor List */}
              <div className={`lg:col-span-2 ${theme.card} border rounded-2xl p-6 space-y-4`}>
                <h4 className="text-xs font-black uppercase tracking-widest font-mono text-amber-500 border-b border-neutral-850 pb-2 flex justify-between items-center">
                  <span>Flight Terminal arrivals Monitor</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono font-bold animate-pulse">● LIVE FIDS LINKED</span>
                </h4>
                <div className="space-y-3 pt-2">
                  {[
                    { fl: 'SQ-938', route: 'SIN ➔ DPS', time: '14:20', driver: 'Made Wijaya', status: 'Landed', color: 'bg-emerald-500/10 text-emerald-400' },
                    { fl: 'GA-291', route: 'CGK ➔ SUB', time: '15:10', driver: 'Budi Santoso', status: 'On Time', color: 'bg-amber-500/10 text-amber-400' },
                    { fl: 'QF-117', route: 'SYD ➔ DPS', time: '16:45', driver: 'Agus Setiawan', status: 'Delayed (+20m)', color: 'bg-rose-500/10 text-rose-400' }
                  ].map((f, i) => (
                    <div key={i} className={`flex justify-between items-center p-3 rounded-xl ${theme.innerCard} border text-xs text-left`}>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-black text-amber-500 text-sm">{f.fl}</span>
                        <div className="text-left">
                          <p className="font-extrabold">{f.route}</p>
                          <p className={`text-[10px] ${theme.textSecondary}`}>Landing: {f.time} • Supir: {f.driver}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full ${f.color}`}>
                        {f.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'routes': {
        // Management of routes and transfer base fees
        if (isAirportFormOpen) {
          return (
            <div className="space-y-6 animate-fade-in text-left max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neutral-850 pb-4 gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-black tracking-wider uppercase text-neutral-500">RUTE TRANSFER AIRPORT</span>
                  <h3 className="text-base font-black uppercase tracking-wider font-mono text-amber-500">
                    {editingAirportRoute ? 'EDIT RUTE TRANSFER' : 'BUAT RUTE TRANSFER BARU'}
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <AutoSaveStatusBadge
                    status={airportSaveStatus}
                    lastSaved={airportLastSaved}
                    isOnline={airportIsOnline}
                    onManualSave={performAirportSave}
                  />
                  <button 
                    onClick={() => setIsAirportFormOpen(false)} 
                    className={`px-4 py-2 text-xs font-bold border ${theme.border} ${theme.hover} rounded-xl cursor-pointer text-white flex items-center gap-1.5`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Kembali ke Daftar Rute</span>
                  </button>
                </div>
              </div>

              {/* Auto-Save Draft Recovery Banner for Airport Transfer Service */}
              {showAirportRecoveryBanner && airportDraft && (
                <DraftRecoveryBanner
                  draft={airportDraft}
                  typeLabel={editingAirportRoute ? 'Edit Rute Airport' : 'Rute Airport Baru'}
                  onRecover={recoverAirportDraft}
                  onDiscard={discardAirportDraft}
                />
              )}

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (editingAirportRoute) {
                    setAirportRoutes(airportRoutes.map(r => r.id === airportForm.id ? airportForm : r));
                    triggerToast('Rute transfer berhasil diperbarui');
                  } else {
                    setAirportRoutes([airportForm, ...airportRoutes]);
                    triggerToast('Rute transfer baru berhasil didaftarkan');
                  }
                  clearAirportDraft();
                  setIsAirportFormOpen(false);
                }}
                className={`${theme.card} border rounded-3xl p-8 space-y-6 text-xs text-left shadow-lg`}
              >
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-black text-neutral-500 uppercase">Bandara Asal</label>
                  <select 
                    value={airportForm.airport}
                    onChange={(e) => setAirportForm({ ...airportForm, airport: e.target.value })}
                    className={`w-full ${theme.input} border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-500`}
                  >
                    {airports.map(ap => (
                      <option key={ap.code} value={ap.code}>{ap.code} - {ap.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-black text-neutral-500 uppercase">Kota / Area Tujuan</label>
                  <input 
                    type="text" 
                    required
                    value={airportForm.city}
                    onChange={(e) => setAirportForm({ ...airportForm, city: e.target.value })}
                    placeholder="Contoh: Ubud, Kuta, Malang, Batu" 
                    className={`w-full ${theme.input} border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-500`} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-neutral-500 uppercase">Harga USD</label>
                    <input 
                      type="number" 
                      required
                      value={airportForm.priceUSD}
                      onChange={(e) => setAirportForm({ ...airportForm, priceUSD: Number(e.target.value) })}
                      placeholder="30" 
                      className={`w-full ${theme.input} border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-500 font-mono`} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-neutral-500 uppercase">Harga IDR</label>
                    <input 
                      type="number" 
                      required
                      value={airportForm.priceIDR}
                      onChange={(e) => setAirportForm({ ...airportForm, priceIDR: Number(e.target.value) })}
                      placeholder="450000" 
                      className={`w-full ${theme.input} border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-500 font-mono`} 
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-850 flex justify-end gap-2.5">
                  <button type="button" onClick={() => setIsAirportFormOpen(false)} className={`px-5 py-2.5 border ${theme.border} ${theme.hover} rounded-xl font-bold cursor-pointer text-xs`}>Batal</button>
                  <button type="submit" className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black rounded-xl cursor-pointer text-xs font-mono text-[11px]">SIMPAN RUTE</button>
                </div>
              </form>
            </div>
          );
        }

        return (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-base font-black uppercase tracking-wider font-mono text-amber-500">DAFTAR RUTE TRANSFER AIRPORT</h3>
                <p className={`text-xs ${theme.textSecondary}`}>Kelola daftar rute antar jemput dari bandara utama beserta tarif dasar kendaraan.</p>
              </div>
              <button 
                onClick={() => {
                  setEditingAirportRoute(null);
                  setAirportForm({
                    id: `ar-${Date.now()}`,
                    airport: airports[0]?.code || 'DPS',
                    city: '',
                    priceUSD: 30,
                    priceIDR: 450000,
                    status: 'Published'
                  });
                  setIsAirportFormOpen(true);
                }}
                className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer font-mono"
              >
                <Plus className="h-4 w-4" />
                <span>Buat Rute Airport Baru</span>
              </button>
            </div>

            {/* List Table of Routes */}
            <div className={`${theme.card} border rounded-2xl overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className={`bg-neutral-900/40 text-neutral-400 font-bold uppercase text-[9px] tracking-widest border-b ${theme.border}`}>
                    <tr>
                      <th className="p-4">KODE RUTE</th>
                      <th className="p-4">BANDARA ASAL</th>
                      <th className="p-4">KOTA/AREA TUJUAN</th>
                      <th className="p-4">TARIF USD</th>
                      <th className="p-4">TARIF IDR</th>
                      <th className="p-4">STATUS</th>
                      <th className="p-4 text-right">TINDAKAN</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${theme.borderSubtle}`}>
                    {airportRoutes.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-neutral-500">
                          Tidak ada rute bandara yang terdaftar. Silakan buat rute baru.
                        </td>
                      </tr>
                    ) : (
                      airportRoutes.map((row) => (
                        <tr key={row.id} className={theme.hover}>
                          <td className="p-4 font-mono font-bold text-amber-500">{row.id}</td>
                          <td className="p-4 font-black">✈️ {row.airport}</td>
                          <td className="p-4 font-extrabold">{row.city}</td>
                          <td className="p-4 font-mono font-bold text-emerald-500">${row.priceUSD}</td>
                          <td className="p-4 font-mono font-bold text-emerald-500">Rp {row.priceIDR.toLocaleString('id-ID')}</td>
                          <td className="p-4">
                            <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                              {row.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => {
                                  setEditingAirportRoute(row);
                                  setAirportForm({
                                    id: row.id,
                                    airport: row.airport,
                                    city: row.city,
                                    priceUSD: row.priceUSD,
                                    priceIDR: row.priceIDR,
                                    status: row.status
                                  });
                                  setIsAirportFormOpen(true);
                                }}
                                className={`p-1.5 rounded-lg border ${theme.border} ${theme.hover} text-amber-500 cursor-pointer`} 
                                title="Edit"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button 
                                onClick={() => {
                                  if (confirm(`Apakah Anda yakin ingin menghapus rute ${row.airport} ke ${row.city}?`)) {
                                    setAirportRoutes(airportRoutes.filter(r => r.id !== row.id));
                                    triggerToast('Rute transfer berhasil dihapus');
                                  }
                                }} 
                                className={`p-1.5 rounded-lg border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/15 text-rose-500 cursor-pointer`} 
                                title="Hapus"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      }

      case 'airports': {
        // Pembukaan Bandara (Configuration of available terminals)
        if (isNewAirportModalOpen) {
          return (
            <div className="space-y-6 animate-fade-in text-left max-w-2xl mx-auto">
              <div className="flex justify-between items-center border-b border-neutral-850 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black tracking-wider uppercase text-neutral-500">OPERASIONAL BANDARA</span>
                  <h3 className="text-base font-black uppercase tracking-wider font-mono text-amber-500">
                    BUKA OPERASIONAL BANDARA BARU
                  </h3>
                </div>
                <button 
                  onClick={() => setIsNewAirportModalOpen(false)} 
                  className={`px-4 py-2 text-xs font-bold border ${theme.border} ${theme.hover} rounded-xl cursor-pointer text-white flex items-center gap-1.5`}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Kembali ke Daftar Bandara</span>
                </button>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newAirportForm.code) {
                    alert('Kode bandara tidak boleh kosong!');
                    return;
                  }
                  const codeUpper = newAirportForm.code.toUpperCase();
                  
                  // Check if already exists
                  if (airports.some(a => a.code === codeUpper)) {
                    alert(`Bandara dengan kode ${codeUpper} sudah terdaftar!`);
                    return;
                  }

                  const newAp: Airport = {
                    code: codeUpper,
                    name: newAirportForm.name,
                    description: newAirportForm.description,
                    status: newAirportForm.status,
                    surchargeUSD: Number(newAirportForm.surchargeUSD) || 0,
                    surchargeIDR: Number(newAirportForm.surchargeIDR) || 0
                  };

                  setAirports([...airports, newAp]);
                  triggerToast(`Bandara ${codeUpper} berhasil dibuka!`);
                  setIsNewAirportModalOpen(false);
                }}
                className={`${theme.card} border rounded-3xl p-8 space-y-6 text-xs text-left shadow-lg`}
              >
                <div className="grid grid-cols-3 gap-4 text-left">
                  <div className="space-y-1 col-span-1">
                    <label className="text-[10px] font-black text-neutral-500 uppercase">KODE (3-Huruf)</label>
                    <input 
                      type="text" 
                      required
                      maxLength={3}
                      value={newAirportForm.code}
                      onChange={(e) => setNewAirportForm({ ...newAirportForm, code: e.target.value.toUpperCase() })}
                      placeholder="DPS" 
                      className={`w-full ${theme.input} border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-500 font-mono font-black uppercase text-center`} 
                    />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-[10px] font-black text-neutral-500 uppercase">NAMA BANDARA</label>
                    <input 
                      type="text" 
                      required
                      value={newAirportForm.name}
                      onChange={(e) => setNewAirportForm({ ...newAirportForm, name: e.target.value })}
                      placeholder="Juanda International Airport" 
                      className={`w-full ${theme.input} border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-500`} 
                    />
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-black text-neutral-500 uppercase">Deskripsi Operasional / Wilayah</label>
                  <textarea 
                    rows={3}
                    value={newAirportForm.description}
                    onChange={(e) => setNewAirportForm({ ...newAirportForm, description: e.target.value })}
                    placeholder="Deskripsi wilayah layanan transfer bandara ini..." 
                    className={`w-full ${theme.input} border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-500`} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-neutral-500 uppercase">Surcharge USD</label>
                    <input 
                      type="number" 
                      value={newAirportForm.surchargeUSD}
                      onChange={(e) => setNewAirportForm({ ...newAirportForm, surchargeUSD: Number(e.target.value) })}
                      placeholder="0" 
                      className={`w-full ${theme.input} border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-500 font-mono`} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-neutral-500 uppercase">Surcharge IDR</label>
                    <input 
                      type="number" 
                      value={newAirportForm.surchargeIDR}
                      onChange={(e) => setNewAirportForm({ ...newAirportForm, surchargeIDR: Number(e.target.value) })}
                      placeholder="0" 
                      className={`w-full ${theme.input} border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-500 font-mono`} 
                    />
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-black text-neutral-500 uppercase">Status Operasional Awal</label>
                  <select 
                    value={newAirportForm.status}
                    onChange={(e) => setNewAirportForm({ ...newAirportForm, status: e.target.value as 'Active' | 'Inactive' })}
                    className={`w-full ${theme.input} border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-500`}
                  >
                    <option value="Active">Active - Buka Langsung</option>
                    <option value="Inactive">Inactive - Draft / Tutup Sementara</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-neutral-850 flex justify-end gap-2.5">
                  <button type="button" onClick={() => setIsNewAirportModalOpen(false)} className={`px-5 py-2.5 border ${theme.border} ${theme.hover} rounded-xl font-bold cursor-pointer text-xs`}>Batal</button>
                  <button type="submit" className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black rounded-xl cursor-pointer text-xs font-mono text-[11px]">BUKA OPERASIONAL BANDARA</button>
                </div>
              </form>
            </div>
          );
        }

        return (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-base font-black uppercase tracking-wider font-mono text-amber-500">PEMBUKAAN OPERASIONAL BANDARA</h3>
                <p className={`text-xs ${theme.textSecondary}`}>Konfigurasi bandara-bandara aktif yang dilayani oleh sistem SawahJaya Trans.</p>
              </div>
              <button 
                onClick={() => {
                  setNewAirportForm({
                    code: '',
                    name: '',
                    description: '',
                    status: 'Active',
                    surchargeUSD: 0,
                    surchargeIDR: 0
                  });
                  setIsNewAirportModalOpen(true);
                }}
                className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer font-mono"
              >
                <Plus className="h-4 w-4" />
                <span>BUKA BANDARA BARU</span>
              </button>
            </div>

            {/* Grid of Airports */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {airports.map((ap) => (
                <div key={ap.code} className={`${theme.card} border rounded-3xl p-6 space-y-4 hover:border-amber-500/30 transition-all flex flex-col justify-between`}>
                  <div className="space-y-3 text-left">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-lg font-mono font-black border border-amber-500/20">
                          {ap.code}
                        </div>
                        <div className="text-left">
                          <h4 className="text-sm font-black tracking-tight">{ap.name}</h4>
                          <span className="text-[10px] font-mono text-neutral-500">KODE: {ap.code}</span>
                        </div>
                      </div>
                      
                      {/* Active/Inactive Switch Badge */}
                      <button
                        onClick={() => {
                          const updated = airports.map(a => a.code === ap.code ? { ...a, status: (a.status === 'Active' ? 'Inactive' : 'Active') as 'Active' | 'Inactive' } : a);
                          setAirports(updated);
                          triggerToast(`Status bandara ${ap.code} diubah menjadi ${ap.status === 'Active' ? 'Inactive' : 'Active'}`);
                        }}
                        className={`text-[9px] font-mono font-black uppercase px-3 py-1 rounded-full border cursor-pointer transition-all ${
                          ap.status === 'Active' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                        }`}
                        title="Klik untuk mengubah status"
                      >
                        {ap.status}
                      </button>
                    </div>

                    <p className={`text-xs ${theme.textSecondary} leading-relaxed`}>
                      {ap.description || 'Tidak ada deskripsi bandara.'}
                    </p>

                    <div className="bg-neutral-900/20 rounded-2xl p-4 border border-neutral-850 grid grid-cols-2 gap-4 text-xs font-mono text-left">
                      <div>
                        <span className="text-neutral-500 block text-[9px] uppercase font-bold">Biaya Surcharge USD</span>
                        <span className="text-emerald-500 font-black">${ap.surchargeUSD || 0}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block text-[9px] uppercase font-bold">Biaya Surcharge IDR</span>
                        <span className="text-emerald-500 font-black">Rp {(ap.surchargeIDR || 0).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-neutral-850 flex justify-end gap-2.5">
                    <button
                      onClick={() => {
                        setSelectedAirportCodeForEdit(ap.code);
                        setActiveSubTab('airport_edit');
                        triggerToast(`Mengonfigurasi detail bandara ${ap.code}`);
                      }}
                      className={`px-3 py-1.5 rounded-xl border ${theme.border} ${theme.hover} text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer text-amber-500`}
                    >
                      <Settings className="h-3.5 w-3.5" />
                      <span>Konfigurasi Detail</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Apakah Anda yakin ingin menghapus/menutup operasional bandara ${ap.code}?`)) {
                          const updated = airports.filter(a => a.code !== ap.code);
                          setAirports(updated);
                          triggerToast(`Bandara ${ap.code} berhasil dihapus.`);
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/15 text-rose-500 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'airport_edit': {
        // Edit Specific Airport configuration
        const activeAp = airports.find(a => a.code === selectedAirportCodeForEdit) || airports[0];

        return (
          <div className="space-y-6 animate-fade-in text-left">
            <div>
              <h3 className="text-base font-black uppercase tracking-wider font-mono text-amber-500">KONFIGURASI DETAIL BANDARA</h3>
              <p className={`text-xs ${theme.textSecondary}`}>Edit aturan khusus, surcharge terminal, deskripsi, dan status bandara yang terpilih.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Config */}
              <div className={`lg:col-span-2 ${theme.card} border rounded-3xl p-6 space-y-6`}>
                <div className="flex justify-between items-center border-b border-neutral-850 pb-4">
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-black text-neutral-500 uppercase">PILIH BANDARA TARGET</label>
                    <select
                      value={selectedAirportCodeForEdit}
                      onChange={(e) => setSelectedAirportCodeForEdit(e.target.value)}
                      className={`w-full ${theme.input} border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-500 font-mono font-extrabold`}
                    >
                      {airports.map(ap => (
                        <option key={ap.code} value={ap.code}>{ap.code} - {ap.name}</option>
                      ))}
                    </select>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1.5 rounded-full">
                    KODE TERPILIH: {activeAp?.code}
                  </span>
                </div>

                {activeAp ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      // Save action
                      triggerToast(`Konfigurasi detail bandara ${activeAp.code} berhasil disimpan!`);
                    }}
                    className="space-y-4 text-xs text-left"
                  >
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-neutral-500 uppercase">NAMA RESMI BANDARA</label>
                      <input
                        type="text"
                        required
                        value={activeAp.name}
                        onChange={(e) => {
                          const updated = airports.map(a => a.code === activeAp.code ? { ...a, name: e.target.value } : a);
                          setAirports(updated);
                        }}
                        className={`w-full ${theme.input} border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-500`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-neutral-500 uppercase">Deskripsi Operasional / Layanan Wilayah</label>
                      <textarea
                        rows={4}
                        value={activeAp.description}
                        onChange={(e) => {
                          const updated = airports.map(a => a.code === activeAp.code ? { ...a, description: e.target.value } : a);
                          setAirports(updated);
                        }}
                        className={`w-full ${theme.input} border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-500 leading-relaxed`}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-neutral-500 uppercase">Surcharge Penjemputan USD</label>
                        <input
                          type="number"
                          value={activeAp.surchargeUSD}
                          onChange={(e) => {
                            const updated = airports.map(a => a.code === activeAp.code ? { ...a, surchargeUSD: Number(e.target.value) } : a);
                            setAirports(updated);
                          }}
                          className={`w-full ${theme.input} border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-500 font-mono`}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-neutral-500 uppercase">Surcharge Penjemputan IDR</label>
                        <input
                          type="number"
                          value={activeAp.surchargeIDR}
                          onChange={(e) => {
                            const updated = airports.map(a => a.code === activeAp.code ? { ...a, surchargeIDR: Number(e.target.value) } : a);
                            setAirports(updated);
                          }}
                          className={`w-full ${theme.input} border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-500 font-mono`}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-neutral-500 uppercase">STATUS OPERASIONAL SEKARANG</label>
                      <select
                        value={activeAp.status}
                        onChange={(e) => {
                          const updated = airports.map(a => a.code === activeAp.code ? { ...a, status: e.target.value as 'Active' | 'Inactive' } : a);
                          setAirports(updated);
                          triggerToast(`Status bandara ${activeAp.code} diubah menjadi ${e.target.value}`);
                        }}
                        className={`w-full ${theme.input} border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-500 font-bold`}
                      >
                        <option value="Active">Active (Melayani Booking Pelanggan)</option>
                        <option value="Inactive">Inactive (Ditutup Sementara untuk Pemesanan)</option>
                      </select>
                    </div>

                    <div className="pt-4 border-t border-neutral-850 flex justify-end">
                      <button
                        type="submit"
                        className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black text-xs px-6 py-3 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer font-mono"
                      >
                        <Save className="h-4 w-4" />
                        <span>SIMPAN KONFIGURASI</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <p className="text-xs text-neutral-500">Silakan pilih bandara terlebih dahulu.</p>
                )}
              </div>

              {/* Sidebar Preview */}
              <div className="space-y-6 text-left">
                <div className={`${theme.card} border rounded-3xl p-6 space-y-4 text-left relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/[0.03] rounded-full blur-2xl pointer-events-none" />
                  <h4 className="text-[10px] font-black uppercase tracking-wider font-mono text-neutral-500">Live Customer-Side Preview</h4>
                  
                  {activeAp ? (
                    <div className="space-y-4 pt-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-mono font-black text-amber-500 block">KODE TERBANG</span>
                          <span className="text-xl font-black font-mono tracking-tight text-white">{activeAp.code}</span>
                        </div>
                        <span className={`text-[9px] font-mono font-black uppercase px-2.5 py-1 rounded-full border ${
                          activeAp.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {activeAp.status}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-neutral-400 block">NAMA BANDARA</span>
                        <p className="text-xs font-extrabold text-neutral-200">{activeAp.name}</p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-neutral-400 block">DESKRIPSI LOKASI</span>
                        <p className="text-[11px] text-neutral-500 leading-relaxed font-mono">{activeAp.description || 'Tidak ada deskripsi.'}</p>
                      </div>

                      <div className="pt-3 border-t border-neutral-850 space-y-2">
                        <span className="text-[10px] font-black font-mono text-amber-500 block">BIAYA SURCHARGE AKTIF</span>
                        <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                          <div>
                            <span className="text-[9px] text-neutral-500 block font-bold">MATA UANG USD</span>
                            <span className="font-black text-emerald-400">${activeAp.surchargeUSD}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-neutral-500 block font-bold">MATA UANG IDR</span>
                            <span className="font-black text-emerald-400">Rp {activeAp.surchargeIDR.toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-500">Belum ada bandara terpilih.</p>
                  )}
                </div>

                {/* Airport Daily Booking Limit Configuration */}
                <div className={`${theme.card} border rounded-2xl p-6 space-y-4 text-left shadow-sm`}>
                  <h4 className="text-[10px] font-black uppercase tracking-widest font-mono text-amber-500 border-b border-neutral-850 pb-2">
                    Kapasitas Maksimal Harian
                  </h4>
                  <div className="space-y-3 pt-1 text-xs">
                    <p className={`text-[11px] ${theme.textSecondary} leading-relaxed font-mono`}>
                      Tentukan jumlah maksimum pesanan terkonfirmasi yang dapat dilayani oleh operasional Airport Transfer dalam satu hari.
                    </p>
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-black text-neutral-500 uppercase block">Limit Booking Harian</label>
                      <input 
                        type="number"
                        min={1}
                        max={100}
                        value={serviceLimits?.airport ?? 5}
                        onChange={(e) => setServiceLimit('airport', parseInt(e.target.value, 10) || 5)}
                        className={`w-full ${theme.input} border rounded-xl px-4 py-2 text-xs focus:outline-none`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'booking': {
        const filteredAirportBookings = airportBookings.filter(b => {
          const matchesStatus = airportPaymentStatusFilter === 'all' || 
            (airportPaymentStatusFilter === 'Paid' && b.paymentStatus === 'Paid') ||
            (airportPaymentStatusFilter === 'Pending' && b.paymentStatus === 'Pending') ||
            (airportPaymentStatusFilter === 'Unpaid' && (b.paymentStatus === 'Unpaid' || !b.paymentStatus || b.paymentStatus === ''));

          const matchesSearch = !airportPaymentSearch || 
            b.customerName.toLowerCase().includes(airportPaymentSearch.toLowerCase()) ||
            b.id.toLowerCase().includes(airportPaymentSearch.toLowerCase()) ||
            b.serviceName.toLowerCase().includes(airportPaymentSearch.toLowerCase()) ||
            (b.customerPhone && b.customerPhone.includes(airportPaymentSearch)) ||
            (b.customerEmail && b.customerEmail.toLowerCase().includes(airportPaymentSearch.toLowerCase()));

          return matchesStatus && matchesSearch;
        });

        return (
          <div className="space-y-6 animate-fade-in text-left">
            <div>
              <h3 className="text-base font-black uppercase tracking-wider font-mono text-amber-500">AIRPORT TRANSFER BOOKINGS &amp; VERIFIKASI</h3>
              <p className={`text-xs ${theme.textSecondary}`}>Konfirmasi pembayaran, setujui order penjemputan bandara, dan pantau status transfer armada.</p>
            </div>

            {/* Filter and Search controls */}
            <div className={`${theme.card} border rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4`}>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <span className="text-[10px] font-black text-neutral-400 font-mono uppercase">STATUS BAYAR:</span>
                <div className="flex bg-neutral-950/40 p-1 border border-neutral-850 rounded-xl gap-1">
                  {[
                    { id: 'all', label: 'Semua' },
                    { id: 'Paid', label: 'Lunas' },
                    { id: 'Unpaid', label: 'Belum Lunas' },
                    { id: 'Pending', label: 'Pending' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setAirportPaymentStatusFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-black transition-all cursor-pointer uppercase ${
                        airportPaymentStatusFilter === tab.id
                          ? 'bg-amber-500 text-neutral-950'
                          : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative w-full md:w-80">
                <Search className={`absolute left-3.5 top-2.5 h-4 w-4 ${theme.textMuted}`} />
                <input
                  type="text"
                  value={airportPaymentSearch}
                  onChange={(e) => setAirportPaymentSearch(e.target.value)}
                  placeholder="Cari ID, nama pelanggan, atau rute..."
                  className={`w-full ${theme.input} pl-10 pr-4 py-2 text-xs rounded-xl focus:outline-none focus:border-amber-500 border`}
                />
              </div>
            </div>

            {/* Bookings List */}
            <div className="space-y-3">
              {filteredAirportBookings.length === 0 ? (
                <div className={`${theme.card} border rounded-2xl p-8 text-center text-xs ${theme.textSecondary}`}>
                  Tidak ada data booking airport transfer yang sesuai dengan kriteria filter.
                </div>
              ) : (
                filteredAirportBookings.map((b) => (
                  <div key={b.id} className={`${theme.card} border rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-neutral-700 transition-all text-left`}>
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-bold font-mono shrink-0">
                        AP
                      </div>
                      <div className="space-y-1.5 text-left">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono font-black text-amber-500">{b.id}</span>
                          <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded border ${
                            b.status === 'Completed' ? 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20' : 
                            b.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          }`}>{b.status}</span>
                          <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded border ${
                            b.paymentStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                            b.paymentStatus === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>{b.paymentStatus || 'Unpaid'}</span>
                        </div>
                        <h4 className="text-sm font-black tracking-tight">{b.customerName}</h4>
                        <p className="text-xs font-bold text-neutral-200">{b.serviceName}</p>
                        <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] ${theme.textSecondary}`}>
                          <span className="flex items-center gap-1">⏱️ Jadwal: {b.details?.date} {b.details?.time ? `(${b.details.time})` : ''}</span>
                          <span className="flex items-center gap-1">📍 Rute: {b.details?.pickupLocation || 'Bandara'} ➔ {b.details?.destination || b.details?.cityAddress || 'Alamat'}</span>
                          <span className="flex items-center gap-1">🚗 Unit: {b.details?.vehicleName || 'Standar Transfer'}</span>
                          <span className="flex items-center gap-1">👥 {b.details?.guests || 1} Pax</span>
                          <span className="flex items-center gap-1">📞 {b.customerPhone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-neutral-850 shrink-0">
                      <span className="text-xs font-mono font-black text-emerald-500">
                        {formatPrice(b.totalPrice, b.totalPriceIDR)}
                      </span>
                      <div className="flex gap-2">
                        {b.paymentStatus !== 'Paid' ? (
                          <button 
                            onClick={() => {
                              updateBookingStatus(b.id, b.status, 'Paid');
                              triggerToast(`Pembayaran Airport Booking ${b.id} ditandai LUNAS`);
                            }} 
                            className="px-3 py-1.5 rounded-xl bg-emerald-500 text-neutral-950 hover:bg-emerald-600 text-[11px] font-extrabold cursor-pointer transition-all shadow-md flex items-center gap-1"
                          >
                            <Check className="h-3 w-3 stroke-[3]" />
                            <span>Set Lunas</span>
                          </button>
                        ) : (
                          <button 
                            onClick={() => {
                              updateBookingStatus(b.id, b.status, 'Unpaid');
                              triggerToast(`Pembayaran Airport Booking ${b.id} ditandai BELUM LUNAS`);
                            }} 
                            className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[11px] font-extrabold cursor-pointer transition-all"
                          >
                            Batal Lunas
                          </button>
                        )}
                        {b.status === 'Pending' && (
                          <button 
                            onClick={() => {
                              updateBookingStatus(b.id, 'Confirmed', b.paymentStatus);
                              triggerToast(`Booking ${b.id} dikonfirmasi penjemputannya`);
                            }} 
                            className="px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 text-[11px] font-extrabold cursor-pointer"
                          >
                            Konfirmasi
                          </button>
                        )}
                        {b.status === 'Confirmed' && (
                          <button 
                            onClick={() => {
                              updateBookingStatus(b.id, 'Completed', b.paymentStatus);
                              triggerToast(`Transfer Airport ${b.id} selesai dilaksanakan`);
                            }} 
                            className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-[11px] font-extrabold cursor-pointer"
                          >
                            Set Selesai
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      }

      case 'reports': {
        // Calculations for report
        const totalSalesUSD = airportBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
        const totalSalesIDR = airportBookings.reduce((sum, b) => sum + (b.totalPriceIDR || 0), 0);
        const verifiedSalesUSD = airportBookings.filter(b => b.paymentStatus === 'Paid').reduce((sum, b) => sum + (b.totalPrice || 0), 0);
        const verifiedSalesIDR = airportBookings.filter(b => b.paymentStatus === 'Paid').reduce((sum, b) => sum + (b.totalPriceIDR || 0), 0);
        const totalPax = airportBookings.reduce((sum, b) => sum + (b.details?.guests || 1), 0);

        const handlePrintAirportManifest = () => {
          const printWindow = window.open('', '_blank');
          if (!printWindow) {
            triggerToast('Gagal membuka jendela cetak. Pastikan pop-up tidak diblokir browser.');
            return;
          }
          
          const filteredForReport = airportBookings.filter(b => {
            let dateMatch = true;
            const yearMonth = b.details?.date ? b.details.date.slice(0, 7) : ''; // "2026-07"
            if (airportReportDateRange === 'month') {
              dateMatch = yearMonth === '2026-07';
            } else if (airportReportDateRange === 'prev-month') {
              dateMatch = yearMonth === '2026-06';
            }
            
            let airportMatch = true;
            if (airportReportFilter !== 'all') {
              const nameMatch = b.serviceName.toLowerCase().includes(airportReportFilter.toLowerCase()) ||
                                (b.details?.pickupLocation && b.details.pickupLocation.toLowerCase().includes(airportReportFilter.toLowerCase())) ||
                                (b.details?.destination && b.details.destination.toLowerCase().includes(airportReportFilter.toLowerCase()));
              airportMatch = nameMatch;
            }
            return dateMatch && airportMatch;
          });

          const rowsHTML = filteredForReport.map((b, i) => `
            <tr>
              <td style="text-align: center; font-family: monospace;">${i + 1}</td>
              <td style="font-family: monospace; font-weight: bold; color: #b45309;">${b.id}</td>
              <td>
                <strong style="font-size: 13px;">${b.customerName}</strong><br/>
                <span style="font-size: 10px; color: #666;">${b.customerPhone} • ${b.customerEmail}</span>
              </td>
              <td>
                <strong>${b.serviceName}</strong><br/>
                <span style="font-size: 11px; color: #555;">📍 ${b.details?.pickupLocation || 'Bandara'} ➔ ${b.details?.destination || b.details?.cityAddress || 'Alamat'}</span>
              </td>
              <td>
                <strong>${b.details?.date}</strong><br/>
                <span style="font-size: 11px; color: #555;">🕒 ${b.details?.time || '-'}</span>
              </td>
              <td>${b.details?.vehicleName || 'Standar Transfer'}</td>
              <td style="font-family: monospace; text-align: center;">${b.details?.guests || 1} Pax</td>
              <td style="text-align: right; font-family: monospace; font-weight: bold; color: #15803d;">
                ${currency === 'USD' ? `$${b.totalPrice}` : `Rp ${(b.totalPriceIDR || 0).toLocaleString('id-ID')}`}
              </td>
              <td style="text-align: center;">
                <span style="display: inline-block; padding: 2px 6px; font-size: 9px; font-family: monospace; font-weight: bold; border-radius: 4px; ${
                  b.paymentStatus === 'Paid' ? 'background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0;' : 'background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5;'
                }">
                  ${b.paymentStatus === 'Paid' ? 'PAID / LUNAS' : 'UNPAID / BELUM'}
                </span>
              </td>
            </tr>
          `).join('');

          const printDoc = `
            <html>
              <head>
                <title>MANIFEST PENJEMPUTAN AIRPORT - PT. SAWAH JAYA TRANS</title>
                <style>
                  body { font-family: 'Plus Jakarta Sans', sans-serif; color: #222; padding: 30px; font-size: 12px; }
                  table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                  th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                  th { background-color: #f8fafc; font-weight: bold; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
                  .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #222; padding-bottom: 15px; }
                  .footer { margin-top: 30px; font-size: 10px; color: #777; border-top: 1px solid #ddd; padding-top: 10px; text-align: center; }
                </style>
              </head>
              <body>
                <div class="header">
                  <div>
                    <h1 style="margin: 0; font-size: 20px; letter-spacing: 1px;">PT. SAWAH JAYA TRANS SINERGI</h1>
                    <p style="margin: 5px 0 0; font-size: 11px; color: #444;">Surel: sawahjaya@gmail.com • Portal Operasional Pariwisata Utama</p>
                  </div>
                  <div style="text-align: right;">
                    <h3 style="margin: 0; font-size: 14px; font-family: monospace;">MANIFEST AIRPORT TRANSFER</h3>
                    <p style="margin: 5px 0 0; font-size: 11px; font-family: monospace;">Filter Periode: ${airportReportDateRange.toUpperCase()}</p>
                  </div>
                </div>
                
                <div style="margin-top: 20px; font-size: 12px; background: #fafafa; border: 1px solid #eee; padding: 15px; border-radius: 8px;">
                  <strong>Bandara Filter:</strong> ${airportReportFilter === 'all' ? 'Semua Bandara' : `Bandara ${airportReportFilter.toUpperCase()}`} <br/>
                  <strong>Jumlah Pesanan:</strong> \${filteredForReport.length} Terdaftar • <strong>Tanggal Cetak:</strong> \${new Date().toLocaleString('id-ID')}
                </div>

                <table>
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>ID Booking</th>
                      <th>Nama &amp; Kontak Tamu</th>
                      <th>Layanan &amp; Rute</th>
                      <th>Tanggal</th>
                      <th>Kendaraan</th>
                      <th>Jumlah Pax</th>
                      <th style="text-align: right;">Total Nilai</th>
                      <th style="text-align: center;">Status Bayar</th>
                    </tr>
                  </thead>
                  <tbody>
                    \${rowsHTML || '<tr><td colspan="9" style="text-align: center; padding: 20px;">Tidak ada manifest jemputan bandara terdaftar.</td></tr>'}
                  </tbody>
                </table>

                <div class="footer">
                  Dokumen manifest resmi Smart Journey. Seluruh data tercatat otomatis pada sistem operasional internal SJT.
                </div>
                <script>
                  window.onload = function() { window.print(); }
                </script>
              </body>
            </html>
          `;

          printWindow.document.write(printDoc);
          printWindow.document.close();
          triggerToast('Membuka pratinjau halaman cetak manifest airport...');
        };

        return (
          <div className="space-y-6 animate-fade-in text-left">
            <div>
              <h3 className="text-base font-black uppercase tracking-wider font-mono text-amber-500">PUSAT UNDUH LAPORAN &amp; MANIFEST (AIRPORT TRANSFER)</h3>
              <p className={`text-xs ${theme.textSecondary}`}>Ekspor data manifest penjemputan bandara dan unduh dokumen perjalanan untuk driver.</p>
            </div>

            {/* Airport Transfer Specific Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Total Penjemputan" value={`${airportBookings.length} Order`} change="Airport Transfer" isPositive={true} label="Total Bookings" icon={ClipboardList} />
              <StatCard title="Total Pax Diantar" value={`${totalPax} Penumpang`} change="Safe Transit" isPositive={true} label="Wisatawan" icon={Users} />
              <StatCard title="Omset Terverifikasi" value={currency === 'USD' ? `$${verifiedSalesUSD}` : `Rp ${verifiedSalesIDR.toLocaleString('id-ID')}`} change="Verified Paid" isPositive={true} label="Lunas" icon={CheckCircle2} />
              <StatCard title="Total Estimasi Omset" value={currency === 'USD' ? `$${totalSalesUSD}` : `Rp ${totalSalesIDR.toLocaleString('id-ID')}`} change="All Invoices" isPositive={true} label="Piutang + Kas" icon={BarChart3} />
            </div>

            {/* Filter Panel */}
            <div className={`${theme.card} border rounded-3xl p-6 space-y-5`}>
              <h4 className="text-xs font-black uppercase tracking-widest font-mono text-amber-500 border-b border-neutral-850 pb-2">
                Atur Filter Parameter Ekspor Airport
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-wider font-mono">Periode Waktu Perjalanan</label>
                  <select
                    value={airportReportDateRange}
                    onChange={(e) => setAirportReportDateRange(e.target.value as any)}
                    className={`w-full ${theme.input} border rounded-xl px-3.5 py-2 focus:outline-none focus:border-amber-500`}
                  >
                    <option value="month">Bulan Ini (Juli 2026)</option>
                    <option value="prev-month">Bulan Lalu (Juni 2026)</option>
                    <option value="all">Semua Periode</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-wider font-mono">Pilih Filter Bandara</label>
                  <select
                    value={airportReportFilter}
                    onChange={(e) => setAirportReportFilter(e.target.value)}
                    className={`w-full ${theme.input} border rounded-xl px-3.5 py-2 focus:outline-none focus:border-amber-500`}
                  >
                    <option value="all">Semua Bandara</option>
                    {airports.map((ap, i) => (
                      <option key={i} value={ap.code}>{ap.code} - {ap.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-neutral-850 justify-end">
                <button
                  onClick={handlePrintAirportManifest}
                  className="px-5 py-3 rounded-xl border border-neutral-700 bg-neutral-900 text-xs font-bold text-neutral-200 hover:text-white hover:bg-neutral-850 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
                >
                  <FileCheck className="h-4 w-4 text-amber-500" />
                  <span>Cetak Manifest Airport (Print)</span>
                </button>
              </div>
            </div>
          </div>
        );
      }

      default:
        return (
          <div className="space-y-6 animate-fade-in text-left">
            <h4 className="text-xs font-black uppercase tracking-wider font-mono text-amber-500">Layanan Minor: {activeSubTab.toUpperCase()}</h4>
            <div className={`${theme.card} border rounded-2xl p-6 text-xs ${theme.textSecondary}`}>
              Detail finansial / ulasan tamu telah tersinkronisasi otomatis dengan server utama Smart Journey.
            </div>
          </div>
        );
    }
  };

  function renderAvailabilitySubTabContent() {
    const totalDays = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay(); // 0 = Sunday, 6 = Saturday

    const prevMonthDays = new Date(calendarYear, calendarMonth, 0).getDate();
    const paddedPrevDays = [];
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      paddedPrevDays.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        monthOffset: -1
      });
    }

    const currentMonthDays = [];
    for (let d = 1; d <= totalDays; d++) {
      currentMonthDays.push({
        day: d,
        isCurrentMonth: true,
        monthOffset: 0
      });
    }

    const totalCells = paddedPrevDays.length + currentMonthDays.length;
    const nextMonthCellsNeeded = (7 - (totalCells % 7)) % 7;
    const paddedNextDays = [];
    for (let d = 1; d <= nextMonthCellsNeeded; d++) {
      paddedNextDays.push({
        day: d,
        isCurrentMonth: false,
        monthOffset: 1
      });
    }

    const allCalendarCells = [...paddedPrevDays, ...currentMonthDays, ...paddedNextDays];

    const getCellDateStr = (cell: { day: number, isCurrentMonth: boolean, monthOffset: number }) => {
      let targetYear = calendarYear;
      let targetMonth = calendarMonth + cell.monthOffset;
      if (targetMonth < 0) {
        targetMonth = 11;
        targetYear--;
      } else if (targetMonth > 11) {
        targetMonth = 0;
        targetYear++;
      }
      return `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`;
    };

    const INDO_MONTH_NAMES = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    const handlePrevMonth = () => {
      if (calendarMonth === 0) {
        setCalendarMonth(11);
        setCalendarYear(prev => prev - 1);
      } else {
        setCalendarMonth(prev => prev - 1);
      }
    };

    const handleNextMonth = () => {
      if (calendarMonth === 11) {
        setCalendarMonth(0);
        setCalendarYear(prev => prev + 1);
      } else {
        setCalendarMonth(prev => prev + 1);
      }
    };

    const capacityLimit = maxBookingsPerDay || 5;

    switch (activeSubTab) {
      case 'calendar': {
        const dateStr = selectedCalendarDate;
        const isDateBlocked = schedules.some(s => s.date === dateStr && s.type === 'blocked');
        
        // Count confirmed daily bookings
        const dateBookings = bookings.filter(b => 
          b.details && 
          b.details.date === dateStr && 
          (b.status === 'Confirmed' || b.status === 'Completed')
        );

        const allDateBookings = bookings.filter(b => 
          b.details && 
          b.details.date === dateStr
        );

        const slotCount = dateBookings.length;
        const allocations = schedules.filter(s => s.date === dateStr && s.type === 'allocation');
        const blockedSchedule = schedules.find(s => s.date === dateStr && s.type === 'blocked');

        return (
          <div className="space-y-6 animate-fade-in text-left">
            {/* Header section */}
            <div className={`${theme.innerCard} border rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
              <div className="space-y-1">
                <h3 className="text-base font-black uppercase tracking-wider font-mono text-amber-500 flex items-center gap-2">
                  <CalendarDays className="h-4.5 w-4.5 animate-pulse" />
                  Availability &amp; Capacity Control
                </h3>
                <p className={`text-xs ${theme.textSecondary}`}>
                  Kalender operasional harian terpadu. Pantau kuota limit booking harian privat, kelola blackout dates, serta lakukan penugasan supir &amp; armada.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full uppercase">
                  Max Capacity: {capacityLimit} Slots/Day
                </span>
              </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column - Month Calendar Grid */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-4">
                <div className={`${theme.card} border rounded-2xl p-5 space-y-4 shadow-sm`}>
                  {/* Calendar controls */}
                  <div className="flex justify-between items-center border-b border-neutral-850 pb-4">
                    <h4 className="text-xs font-black uppercase tracking-widest font-mono text-amber-500">
                      {INDO_MONTH_NAMES[calendarMonth]} {calendarYear}
                    </h4>
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={handlePrevMonth}
                        className={`p-1.5 rounded-lg border ${theme.border} ${theme.hover} text-neutral-400 hover:text-white transition-all cursor-pointer`}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => {
                          const today = new Date();
                          setCalendarYear(today.getFullYear());
                          setCalendarMonth(today.getMonth());
                          setSelectedCalendarDate(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`);
                        }}
                        className={`px-3 py-1.5 border ${theme.border} ${theme.hover} rounded-lg text-[10px] font-bold text-neutral-300`}
                      >
                        Hari Ini
                      </button>
                      <button 
                        onClick={handleNextMonth}
                        className={`p-1.5 rounded-lg border ${theme.border} ${theme.hover} text-neutral-400 hover:text-white transition-all cursor-pointer`}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] text-neutral-500 font-bold uppercase tracking-wider pb-1">
                    {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d) => (
                      <div key={d} className="py-1">{d}</div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1.5">
                    {allCalendarCells.map((cell, idx) => {
                      const cellDateStr = getCellDateStr(cell);
                      const isSelected = selectedCalendarDate === cellDateStr;
                      const isCellBlocked = schedules.some(s => s.date === cellDateStr && s.type === 'blocked');
                      
                      // Count confirmed/completed orders for this day
                      const cellBookingsCount = bookings.filter(b => 
                        b.details && 
                        b.details.date === cellDateStr && 
                        (b.status === 'Confirmed' || b.status === 'Completed')
                      ).length;

                      const isFull = cellBookingsCount >= capacityLimit;

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedCalendarDate(cellDateStr)}
                          className={`min-h-[72px] p-2 rounded-xl border flex flex-col justify-between transition-all text-left relative cursor-pointer ${
                            !cell.isCurrentMonth ? 'opacity-30' : ''
                          } ${
                            isSelected 
                              ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/5' 
                              : isCellBlocked
                                ? 'bg-rose-950/20 border-rose-900/30 text-rose-300 hover:border-rose-500/40'
                                : isFull
                                  ? 'bg-neutral-900 border-rose-500/20 hover:border-rose-500/30'
                                  : `${theme.card} hover:border-neutral-700`
                          }`}
                        >
                          {/* Day Number */}
                          <span className={`text-xs font-black font-mono ${
                            isSelected ? 'text-amber-500 font-extrabold' : 'text-neutral-300'
                          }`}>
                            {cell.day}
                          </span>

                          {/* Capacity status block */}
                          <div className="w-full mt-2">
                            {isCellBlocked ? (
                              <span className="text-[8px] font-bold font-mono text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1 py-0.5 rounded block text-center uppercase tracking-wider">
                                Blackout
                              </span>
                            ) : (
                              <div className="space-y-1">
                                <div className="flex justify-between items-center text-[8px] font-mono font-bold">
                                  <span className={isFull ? 'text-rose-400' : 'text-neutral-400'}>
                                    {cellBookingsCount}/{capacityLimit} Sl
                                  </span>
                                </div>
                                <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${
                                      isFull ? 'bg-rose-500' : 'bg-emerald-500'
                                    }`}
                                    style={{ width: `${Math.min((cellBookingsCount / capacityLimit) * 100, 100)}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column - Side Detail Pane */}
              <div className="lg:col-span-5 xl:col-span-4 space-y-4">
                {/* Date Header Card */}
                <div className={`${theme.card} border rounded-2xl p-5 space-y-4 shadow-sm`}>
                  <div className="border-b border-neutral-850 pb-3">
                    <span className="text-[9px] font-mono font-black uppercase tracking-wider text-amber-500">DETAIL OPERASIONAL TANGGAL</span>
                    <h3 className="text-sm font-black font-mono text-neutral-100 flex items-center gap-1.5 mt-0.5">
                      <Calendar className="h-4.5 w-4.5 text-amber-500" />
                      <span>{dateStr}</span>
                    </h3>
                  </div>

                  {/* Status Block */}
                  <div className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
                    isDateBlocked 
                      ? 'bg-rose-500/5 border-rose-500/25' 
                      : 'bg-emerald-500/5 border-emerald-500/25'
                  }`}>
                    <div>
                      <span className="text-[9px] font-mono font-bold text-neutral-400 block">STATUS UTAMA</span>
                      <span className={`text-xs font-black font-mono uppercase tracking-wide ${
                        isDateBlocked ? 'text-rose-400' : 'text-emerald-400'
                      }`}>
                        {isDateBlocked ? '● Ditutup (Blackout)' : '● Tersedia (Open)'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (isDateBlocked) {
                          if (blockedSchedule) {
                            deleteSchedule(blockedSchedule.id);
                            triggerToast(`Kembali membuka tanggal ${dateStr} untuk booking.`);
                          }
                        } else {
                          addSchedule({
                            date: dateStr,
                            type: 'blocked',
                            note: 'Ditutup manual oleh Admin'
                          });
                          triggerToast(`Berhasil menutup ketersediaan tanggal ${dateStr} (Blackout).`);
                        }
                      }}
                      className={`px-3.5 py-2 rounded-xl text-[10px] font-mono font-black uppercase border transition-all cursor-pointer ${
                        isDateBlocked
                          ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      {isDateBlocked ? 'Buka Tanggal' : 'Tutup / Blackout'}
                    </button>
                  </div>

                  {/* Capacity Util Meter */}
                  {!isDateBlocked && (
                    <div className={`p-4 rounded-xl ${theme.innerCard} border space-y-2`}>
                      <div className="flex justify-between items-center text-[10px] font-bold font-mono">
                        <span className={theme.textSecondary}>PENGGUNAAN KUOTA HARIAN</span>
                        <span className="text-amber-500 font-extrabold">{slotCount} dari {capacityLimit} Slot</span>
                      </div>
                      <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full bg-gradient-to-r ${
                            slotCount >= capacityLimit ? 'from-rose-500 to-rose-600' : 'from-amber-500 to-amber-600'
                          }`}
                          style={{ width: `${Math.min((slotCount / capacityLimit) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-neutral-500 font-mono leading-tight">
                        *Sesuai regulasi, tiap booking privat terkonfirmasi memotong 1 slot kapasitas harian.
                      </p>
                    </div>
                  )}
                </div>

                {/* Driver & Vehicle Assignments Card */}
                {!isDateBlocked && (
                  <div className={`${theme.card} border rounded-2xl p-5 space-y-4 shadow-sm`}>
                    <h4 className="text-xs font-black uppercase tracking-wider font-mono text-amber-500 border-b border-neutral-850 pb-3 flex justify-between items-center">
                      <span>Alokasi Crew &amp; Driver ({allocations.length})</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </h4>

                    {/* Form to add allocation */}
                    {isScheduleFormOpen && (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!newScheduleForm.driver || !newScheduleForm.vehicle || !newScheduleForm.tourId) {
                            triggerToast('Harap isi semua detail penugasan');
                            return;
                          }
                          addSchedule({
                            date: dateStr,
                            type: 'allocation',
                            tourId: newScheduleForm.tourId,
                            driver: newScheduleForm.driver,
                            vehicle: newScheduleForm.vehicle,
                            note: newScheduleForm.note
                          });
                          setIsScheduleFormOpen(false);
                          setNewScheduleForm({
                            date: '',
                            type: 'allocation',
                            tourId: tours[0]?.id || '',
                            driver: '',
                            vehicle: '',
                            surcharge: 0,
                            note: ''
                          });
                          triggerToast('Penugasan supir & armada berhasil dijadwalkan!');
                        }}
                        className={`p-3.5 rounded-xl ${theme.innerCard} border space-y-3 animate-fade-in`}
                      >
                        <span className="text-[9px] font-mono font-black text-amber-500 block uppercase border-b border-neutral-850 pb-1.5">FORMULIR PENUGASAN BARU</span>
                        <div className="space-y-1.5 text-xs text-left">
                          <label className="text-[9px] font-mono font-black text-neutral-500 uppercase">Pilih Paket Wisata</label>
                          <select
                            value={newScheduleForm.tourId}
                            onChange={(e) => setNewScheduleForm({ ...newScheduleForm, tourId: e.target.value })}
                            className={`w-full ${theme.input} border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none`}
                          >
                            <option value="">-- Pilih Paket Tour --</option>
                            {tours.map(t => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-left">
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-mono font-black text-neutral-500 uppercase">Nama Driver</label>
                            <input
                              type="text"
                              value={newScheduleForm.driver}
                              onChange={(e) => setNewScheduleForm({ ...newScheduleForm, driver: e.target.value })}
                              placeholder="Made Wijaya"
                              className={`w-full ${theme.input} border rounded-lg px-2.5 py-1.5 text-xs`}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-mono font-black text-neutral-500 uppercase">Mobil &amp; Nopol</label>
                            <input
                              type="text"
                              value={newScheduleForm.vehicle}
                              onChange={(e) => setNewScheduleForm({ ...newScheduleForm, vehicle: e.target.value })}
                              placeholder="Innova (DK 12 AA)"
                              className={`w-full ${theme.input} border rounded-lg px-2.5 py-1.5 text-xs`}
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5 text-xs text-left">
                          <label className="text-[9px] font-mono font-black text-neutral-500 uppercase">Catatan</label>
                          <input
                            type="text"
                            value={newScheduleForm.note}
                            onChange={(e) => setNewScheduleForm({ ...newScheduleForm, note: e.target.value })}
                            placeholder="Tamu minta supir ramah"
                            className={`w-full ${theme.input} border rounded-lg px-2.5 py-1.5 text-xs`}
                          />
                        </div>
                        <div className="flex justify-end gap-2 text-[10px] font-bold font-mono">
                          <button type="button" onClick={() => setIsScheduleFormOpen(false)} className="px-3 py-1.5 rounded-lg border border-neutral-700 text-neutral-400">Batal</button>
                          <button type="submit" className="px-3 py-1.5 rounded-lg bg-amber-500 text-neutral-950">Simpan</button>
                        </div>
                      </form>
                    )}

                    {/* Display active list */}
                    {allocations.length === 0 ? (
                      <div className="text-center py-6 text-[10px] text-neutral-500 font-mono">
                        Belum ada supir &amp; armada yang bertugas hari ini.
                        {!isScheduleFormOpen && (
                          <button
                            type="button"
                            onClick={() => {
                              setNewScheduleForm({
                                date: dateStr,
                                type: 'allocation',
                                tourId: tours[0]?.id || '',
                                driver: '',
                                vehicle: '',
                                surcharge: 0,
                                note: ''
                              });
                              setIsScheduleFormOpen(true);
                            }}
                            className="mt-2 text-amber-500 hover:underline block mx-auto text-xs font-black cursor-pointer"
                          >
                            + Tugaskan Supir &amp; Mobil
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                        {allocations.map((alloc) => {
                          const linkedTour = tours.find(t => t.id === alloc.tourId);
                          return (
                            <div key={alloc.id} className={`p-3 rounded-xl ${theme.innerCard} border flex justify-between items-start gap-2 text-xs`}>
                              <div className="space-y-1 leading-normal">
                                <span className="text-[9px] font-mono font-black text-amber-500 block uppercase">
                                  {linkedTour?.name || 'Paket Kustom'}
                                </span>
                                <div className="font-extrabold text-neutral-200">Supir: {alloc.driver}</div>
                                <div className={`text-[10px] ${theme.textSecondary}`}>Armada: {alloc.vehicle}</div>
                                {alloc.note && <div className="text-[9px] italic text-neutral-500">Memo: {alloc.note}</div>}
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  deleteSchedule(alloc.id);
                                  triggerToast('Penugasan berhasil dihapus.');
                                }}
                                className="p-1 rounded bg-rose-500/5 border border-rose-500/10 text-rose-400 hover:bg-rose-500/15"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          );
                        })}
                        
                        {!isScheduleFormOpen && (
                          <button
                            type="button"
                            onClick={() => {
                              setNewScheduleForm({
                                date: dateStr,
                                type: 'allocation',
                                tourId: tours[0]?.id || '',
                                driver: '',
                                vehicle: '',
                                surcharge: 0,
                                note: ''
                              });
                              setIsScheduleFormOpen(true);
                            }}
                            className="w-full py-2 bg-neutral-900 hover:bg-neutral-850 text-amber-500 rounded-xl border border-dashed border-neutral-850 text-[10px] font-bold font-mono text-center uppercase"
                          >
                            + Tambah Penugasan Supir
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Confirmed Bookings list Card */}
                {!isDateBlocked && (
                  <div className={`${theme.card} border rounded-2xl p-5 space-y-4 shadow-sm`}>
                    <h4 className="text-xs font-black uppercase tracking-wider font-mono text-amber-500 border-b border-neutral-850 pb-3">
                      Pesanan Masuk Hari Ini ({allDateBookings.length})
                    </h4>

                    {allDateBookings.length === 0 ? (
                      <div className="text-center py-6 text-[10px] text-neutral-500 font-mono">
                        Belum ada pesanan masuk untuk tanggal ini.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                        {allDateBookings.map((b) => (
                          <div key={b.id} className={`p-3 rounded-xl ${theme.innerCard} border space-y-1 text-xs leading-normal`}>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-mono font-bold text-amber-500">{b.id}</span>
                              <span className={`text-[8px] font-mono font-black uppercase px-1.5 py-0.5 rounded border ${
                                b.status === 'Confirmed' || b.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10' :
                                b.status === 'Cancelled' || b.status === 'Refunded' ? 'bg-rose-500/10 text-rose-400 border-rose-500/10' :
                                'bg-amber-500/10 text-amber-500 border-amber-500/10'
                              }`}>
                                {b.status}
                              </span>
                            </div>
                            <div className="font-extrabold text-neutral-200">{b.customerName}</div>
                            <div className="text-[10px] text-neutral-400">{b.serviceName}</div>
                            <div className="flex justify-between items-center text-[9px] text-neutral-500 font-mono pt-1">
                              <span>Tamu: {b.details?.guests || 1} Pax</span>
                              <span className="text-emerald-400 font-bold">{formatPrice(b.totalPrice, b.totalPriceIDR)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }
      case 'blackout': {
        const blackoutSchedules = schedules.filter(s => s.type === 'blocked');
        
        return (
          <div className="space-y-6 animate-fade-in text-left">
            {/* Header section */}
            <div className={`${theme.innerCard} border rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
              <div className="space-y-1">
                <h3 className="text-base font-black uppercase tracking-wider font-mono text-amber-500 flex items-center gap-2">
                  <Settings className="h-4.5 w-4.5 animate-pulse" />
                  Aturan &amp; Blackout Settings
                </h3>
                <p className={`text-xs ${theme.textSecondary}`}>
                  Pengaturan global batas alokasi pesanan harian dan daftar penutupan hari libur operasional (Blackout Dates).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column - Configurations */}
              <div className="lg:col-span-4 space-y-6">
                {/* Global daily quota limit */}
                <div className={`${theme.card} border rounded-2xl p-6 space-y-4 shadow-sm`}>
                  <h4 className="text-xs font-black uppercase tracking-widest font-mono text-amber-500 border-b border-neutral-850 pb-2">
                    Batas Alokasi Harian
                  </h4>

                  <div className="space-y-3 pt-2 text-xs">
                    <p className={`text-[11px] ${theme.textSecondary} leading-relaxed`}>
                      Tentukan jumlah maksimum pesanan terkonfirmasi yang dapat dilayani oleh operasional Smart Journey dalam satu hari.
                    </p>

                    <div className="space-y-1 text-left">
                      <label className="text-[9px] font-mono font-black text-neutral-500 uppercase">Limit Booking Harian</label>
                      <input 
                        type="number"
                        min={1}
                        max={100}
                        value={serviceLimits?.tour ?? 5}
                        onChange={(e) => setServiceLimit('tour', parseInt(e.target.value, 10) || 5)}
                        className={`w-full ${theme.input} border rounded-xl px-4 py-2.5 text-xs focus:outline-none`}
                      />
                    </div>

                    <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-1">
                      <span className="text-[9px] font-mono font-black text-amber-500 block uppercase">METODE PERHITUNGAN:</span>
                      <p className="text-[10px] text-neutral-400 leading-normal font-mono">
                        1 Booking Terkonfirmasi = 1 Slot.
                        Hanya status CONFIRMED atau COMPLETED yang mengurangi kapasitas ini.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form to block a date manually */}
                <div className={`${theme.card} border rounded-2xl p-6 space-y-4 shadow-sm`}>
                  <h4 className="text-xs font-black uppercase tracking-widest font-mono text-amber-500 border-b border-neutral-850 pb-2">
                    Tambah Tanggal Blackout
                  </h4>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.target as any;
                      const date = form.elements.bdate.value;
                      const note = form.elements.bnote.value || 'Ditutup oleh Admin';
                      
                      if (!date) {
                        triggerToast('Pilih tanggal blackout terlebih dahulu');
                        return;
                      }

                      addSchedule({
                        date,
                        type: 'blocked',
                        note
                      });

                      form.reset();
                      triggerToast(`Berhasil menambahkan blackout date tanggal ${date}!`);
                    }}
                    className="space-y-3.5 pt-2 text-xs text-left"
                  >
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono font-black text-slate-800 uppercase">PILIH TANGGAL</label>
                      <input 
                        type="date"
                        name="bdate"
                        required
                        className={`w-full ${theme.input} border rounded-xl px-4 py-2.5 text-xs font-mono`}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono font-black text-slate-800 uppercase">ALASAN PENUTUPAN / MEMO</label>
                      <input 
                        type="text"
                        name="bnote"
                        placeholder="Contoh: Libur Hari Raya Galungan"
                        required
                        className={`w-full ${theme.input} border rounded-xl px-4 py-2.5 text-xs`}
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-black text-[10px] font-mono uppercase py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Tutup Tanggal (Blackout)</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Column - Blackout Dates List */}
              <div className="lg:col-span-8 space-y-4">
                <div className={`${theme.card} border rounded-2xl overflow-hidden shadow-sm`}>
                  <div className="p-4 border-b border-neutral-850 flex justify-between items-center">
                    <h4 className="text-xs font-black uppercase tracking-widest font-mono text-amber-500">
                      Daftar Tanggal Blackout Terdaftar ({blackoutSchedules.length})
                    </h4>
                  </div>

                  {blackoutSchedules.length === 0 ? (
                    <div className="text-center py-12 text-xs text-neutral-500 font-mono space-y-2">
                      <Calendar className="h-8 w-8 text-neutral-600 mx-auto animate-pulse" />
                      <div>Belum ada tanggal blackout yang terdaftar.</div>
                      <p className="text-[10px] text-neutral-600 max-w-md mx-auto">Seluruh hari operasional saat ini terbuka penuh. Gunakan form di sebelah kiri untuk menutup tanggal khusus.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs leading-normal">
                        <thead className="bg-neutral-900/40 text-neutral-400 font-bold uppercase text-[9px] tracking-widest border-b border-neutral-850">
                          <tr>
                            <th className="p-4">TANGGAL BLACKOUT</th>
                            <th className="p-4">ALASAN / CATATAN PENUTUPAN</th>
                            <th className="p-4">STATUS</th>
                            <th className="p-4 text-right">TINDAKAN</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-850">
                          {blackoutSchedules.map((sch) => (
                            <tr key={sch.id} className={theme.hover}>
                              <td className="p-4 font-mono font-bold text-rose-400">{sch.date}</td>
                              <td className="p-4 font-medium text-neutral-300">{sch.note || 'Ditutup oleh operasional'}</td>
                              <td className="p-4">
                                <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded border bg-rose-500/10 text-rose-400 border-rose-500/20">
                                  Closed / Blocked
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <button
                                  onClick={() => {
                                    deleteSchedule(sch.id);
                                    triggerToast(`Berhasil membuka kembali tanggal ${sch.date}.`);
                                  }}
                                  className="text-[10px] font-mono font-black uppercase text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/15 border border-emerald-500/10 px-3 py-1.5 rounded-lg"
                                >
                                  Buka Kembali
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  };

  // --- MODULE SKELETON PLACEHOLDERS ---
  const renderModuleTabContent = (moduleName: string) => {
    if (activeModule === 'tours') {
      return renderToursSubTabContent();
    }
    if (activeModule === 'airport') {
      return renderAirportSubTabContent();
    }
    if (activeModule === 'rental') {
      return (
        <RentalAdminWorkspace
          rentalCities={rentalCities}
          setRentalCities={setRentalCities}
          rentalLocations={rentalLocations}
          setRentalLocations={setRentalLocations}
          rentalVehicles={rentalVehicles}
          setRentalVehicles={setRentalVehicles}
          rentalCategories={rentalCategories}
          setRentalCategories={setRentalCategories}
          rentalAddons={rentalAddons}
          setRentalAddons={setRentalAddons}
          rentalZonePricing={rentalZonePricing}
          setRentalZonePricing={setRentalZonePricing}
          bookings={bookings}
          updateBookingStatus={updateBookingStatus}
          theme={theme}
          currency={currency}
          formatPrice={formatPrice}
          triggerToast={triggerToast}
          activeSubTab={activeSubTab}
          setActiveSubTab={setActiveSubTab}
        />
      );
    }
    switch (activeSubTab) {
      case 'dashboard':
        return (
          <div className="space-y-6 animate-fade-in">
            {/* Module Overview Header */}
            <div className={`${theme.innerCard} border rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
              <div className="space-y-1">
                <h3 className="text-base font-black uppercase tracking-wider font-mono text-amber-500 flex items-center gap-2">
                  <Sparkles className="h-4.5 w-4.5 animate-pulse" />
                  WORKSPACE OVERVIEW: {moduleName}
                </h3>
                <p className={`text-xs ${theme.textSecondary}`}>
                  Ini adalah halaman dashboard peninjauan operasional real-time khusus departemen {moduleName}.
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full">
                DEPARTMENT ID: {moduleName.toUpperCase().replace(' ', '_')}
              </span>
            </div>

            {/* Mock Stat Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Daily Departures" value="14 Trips" change="+12%" isPositive={true} label="vs kemarin" icon={Calendar} />
              <StatCard title="Active Crews" value="18 Persons" change="98%" isPositive={true} label="Tingkat Utilisasi" icon={Users} />
              <StatCard title="Dept. Revenue" value="$4,820 USD" change="+8.4%" isPositive={true} label="Minggu ini" icon={BarChart3} />
              <StatCard title="Surcharge Rate" value="Normal" change="0%" isPositive={true} label="No Peak Surcharge" icon={Percent} />
            </div>

            {/* Architectural Layout mockups */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className={`${theme.card} border rounded-2xl p-6 space-y-4`}>
                <h4 className="text-xs font-black uppercase tracking-widest font-mono text-amber-500 border-b border-neutral-850 pb-2">
                  Trip Ingress Funnel Flow
                </h4>
                <div className="space-y-3 pt-2">
                  {[
                    { step: '1. Booking Ingress', status: '8 Pending Order', color: 'bg-amber-500/20 text-amber-400' },
                    { step: '2. Driver & Vehicle Assign', status: '12 Confirmed / Ready', color: 'bg-indigo-500/20 text-indigo-400' },
                    { step: '3. active trip transit', status: '6 Trips On Road', color: 'bg-emerald-500/20 text-emerald-400' },
                    { step: '4. invoice settlement', status: '4 Paid/Settled via ArtoPay', color: 'bg-teal-500/20 text-teal-400' }
                  ].map((x, i) => (
                    <div key={i} className={`flex justify-between items-center p-3 rounded-xl ${theme.innerCard} border`}>
                      <span className="text-xs font-bold uppercase tracking-wide">{x.step}</span>
                      <span className={`text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full ${x.color}`}>
                        {x.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`${theme.card} border rounded-2xl p-6 space-y-4`}>
                <h4 className="text-xs font-black uppercase tracking-widest font-mono text-amber-500 border-b border-neutral-850 pb-2">
                  Operational System Log
                </h4>
                <div className="space-y-2 font-mono text-[10px] leading-relaxed pt-2">
                  {bookings.length === 0 ? (
                    <div className="text-neutral-500 py-2 text-center">No active operational logs. System is running and awaiting incoming bookings.</div>
                  ) : (
                    bookings.slice(0, 4).map((b, idx) => (
                      <div key={idx} className="text-neutral-300">
                        <span className="text-emerald-400">[{b.createdAt ? new Date(b.createdAt).toLocaleTimeString() : 'ACTIVE'}]</span>{' '}
                        <span className="text-amber-500">BOOKING:</span> {b.customerName || b.fullName || 'Customer'} - {b.tourName || b.tripTitle || 'Tour Service'} ({b.bookingCode || b.id}) - <span className="text-emerald-400">{b.paymentStatus || b.status}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'management':
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-base font-black uppercase tracking-wider font-mono text-amber-500">MANAGEMENT WORKSPACE</h3>
                <p className={`text-xs ${theme.textSecondary}`}>Inventarisasi, penambahan catalog, dan pengelolaan entitas backend {moduleName}.</p>
              </div>
              <button 
                onClick={() => triggerToast(`Aksi Daftar Entitas Baru di ${moduleName} Terpicu (Placeholder)`)}
                className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <span>+ Daftarkan Katalog Baru</span>
              </button>
            </div>

            {/* Table Mockup */}
            <div className={`${theme.card} border rounded-2xl overflow-hidden`}>
              <div className={`p-4 border-b ${theme.border} flex flex-col sm:flex-row justify-between items-center gap-3`}>
                <div className="relative w-full sm:w-64">
                  <Search className={`absolute left-3.5 top-2.5 h-4 w-4 ${theme.textMuted}`} />
                  <input 
                    type="text" 
                    placeholder="Cari entitas..." 
                    className={`w-full ${theme.input} pl-10 pr-4 py-2 text-xs rounded-xl focus:outline-none focus:border-amber-500 border`} 
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <span className={`text-[10px] font-bold ${theme.textSecondary}`}>Urutkan:</span>
                  <select className={`text-xs px-3 py-1.5 rounded-xl border ${theme.input} focus:outline-none focus:border-amber-500`}>
                    <option>Terbaru didaftarkan</option>
                    <option>Nama A - Z</option>
                    <option>Rating Tertinggi</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className={`bg-neutral-900/40 text-neutral-400 font-bold uppercase text-[9px] tracking-widest border-b ${theme.border}`}>
                    <tr>
                      <th className="p-4">KODE ID</th>
                      <th className="p-4">NAMA ENTITAS</th>
                      <th className="p-4">DURASI / KAPASITAS</th>
                      <th className="p-4">HARGA DASAR</th>
                      <th className="p-4">RATING / KONDISI</th>
                      <th className="p-4 text-right">TINDAKAN</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${theme.borderSubtle}`}>
                    {[
                      { id: `${moduleName.slice(0,2).toUpperCase()}-101`, name: `Premium Luxury ${moduleName} Pack A`, extra: 'Full Day / Max 6 Pax', price: '$89 / Rp 1.350.000', rating: '⭐ 4.9 Superb' },
                      { id: `${moduleName.slice(0,2).toUpperCase()}-102`, name: `Express Daily ${moduleName} Pack B`, extra: 'Half Day / Max 4 Pax', price: '$49 / Rp 750.000', rating: '⭐ 4.8 Excellent' },
                      { id: `${moduleName.slice(0,2).toUpperCase()}-103`, name: `Elite Executive ${moduleName} Special`, extra: '2 Days / VIP Dedicated', price: '$199 / Rp 3.000.000', rating: '⭐ 5.0 Platinum' }
                    ].map((row, idx) => (
                      <tr key={idx} className={theme.hover}>
                        <td className="p-4 font-mono font-bold text-amber-500">{row.id}</td>
                        <td className="p-4 font-extrabold">{row.name}</td>
                        <td className={`p-4 ${theme.textSecondary}`}>{row.extra}</td>
                        <td className="p-4 font-mono font-bold text-emerald-500">{row.price}</td>
                        <td className="p-4 font-bold">{row.rating}</td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => triggerToast(`Ubah katalog ${row.id} terpicu`)} className={`p-1.5 rounded-lg border ${theme.border} ${theme.hover} text-amber-500 cursor-pointer`} title="Edit">
                              <Settings className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => triggerToast(`Hapus katalog ${row.id} terpicu`)} className={`p-1.5 rounded-lg border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/15 text-rose-500 cursor-pointer`} title="Hapus">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'booking':
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-base font-black uppercase tracking-wider font-mono text-amber-500">BOOKING MANIFEST DATABASE</h3>
                <p className={`text-xs ${theme.textSecondary}`}>Pantau, koordinasikan, dan jadwalkan keberangkatan pesanan {moduleName}.</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => triggerToast('Sinkronisasi Jadwal Terpicu')} className={`p-2.5 rounded-xl border ${theme.border} ${theme.hover} text-neutral-400 hover:text-white transition-all cursor-pointer`}>
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button onClick={() => triggerToast('Ekspor manifest terpicu')} className="bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 font-black text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5">
                  <Download className="h-4 w-4" />
                  <span>Unduh Manifest</span>
                </button>
              </div>
            </div>

            {/* Simulated Booking list */}
            <div className="space-y-3">
              {[
                { bid: `SJ-${moduleName.slice(0,1).toUpperCase()}B-9810`, customer: 'James Bond', date: '2026-07-15', guests: '2 Pax', driver: 'Made Wijaya', status: 'Pending Approval', statusColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
                { bid: `SJ-${moduleName.slice(0,1).toUpperCase()}B-9811`, customer: 'Sophie Laurent', date: '2026-07-16', guests: '4 Pax', driver: 'Budi Santoso', status: 'Allocated & Confirmed', statusColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
                { bid: `SJ-${moduleName.slice(0,1).toUpperCase()}B-9812`, customer: 'Hendra Wijaya', date: '2026-07-18', guests: '5 Pax', driver: 'Agus Setiawan', status: 'Completed', statusColor: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20' }
              ].map((b, idx) => (
                <div key={idx} className={`${theme.card} border rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-neutral-700 transition-all`}>
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0 font-black text-xs font-mono">
                      {idx + 1}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-amber-500">{b.bid}</span>
                        <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded border ${b.statusColor}`}>{b.status}</span>
                      </div>
                      <h4 className="text-sm font-black tracking-tight">{b.customer}</h4>
                      <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] ${theme.textSecondary}`}>
                        <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {b.date}</span>
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {b.guests}</span>
                        <span className="flex items-center gap-1"><Truck className="h-3 w-3" /> Supir: {b.driver}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-neutral-850">
                    <button onClick={() => triggerToast(`Alokasi Driver/Vehicle untuk ${b.bid}`)} className={`px-3 py-1.5 rounded-xl border ${theme.border} ${theme.hover} text-xs font-bold cursor-pointer`}>
                      Ubah Penugasan
                    </button>
                    <button onClick={() => triggerToast(`Setujui booking ${b.bid}`)} className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-extrabold cursor-pointer">
                      Selesai / Setuju
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'customer':
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-base font-black uppercase tracking-wider font-mono text-amber-500">DEPT. CUSTOMER DIRECTORY</h3>
              <p className={`text-xs ${theme.textSecondary}`}>Database pelanggan VIP dan segmen pasar loyalitas khusus layanan {moduleName}.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {getUniqueCustomers().map((c, idx) => (
                <div key={idx} className={`${theme.card} border rounded-2xl p-5 space-y-4`}>
                  <div className="flex justify-between items-start">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-800 flex items-center justify-center font-black text-amber-500 font-mono">
                      {c.name.slice(0,2).toUpperCase()}
                    </div>
                    <span className="text-[9px] font-mono font-black bg-amber-500/10 border border-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full">
                      {c.badge}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black tracking-tight">{c.name}</h4>
                    <p className={`text-[11px] font-mono ${theme.textSecondary}`}>{c.email}</p>
                    <p className={`text-[11px] font-mono ${theme.textSecondary}`}>{c.phone}</p>
                  </div>
                  <div className="pt-3 border-t border-neutral-850 flex justify-between items-center text-[10px] font-bold">
                    <span className={theme.textSecondary}>Riwayat Pesanan:</span>
                    <span className="text-amber-500">{c.trips} Booking Berhasil</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-base font-black uppercase tracking-wider font-mono text-amber-500">PAYMENT &amp; TRANSACTION AUDIT</h3>
              <p className={`text-xs ${theme.textSecondary}`}>Pelacakan mutasi masuk, webhook status ArtoPay, dan verifikasi manual finansial {moduleName}.</p>
            </div>

            <div className={`${theme.card} border rounded-2xl p-6 space-y-4`}>
              <h4 className="text-xs font-black uppercase tracking-widest font-mono text-amber-500 border-b border-neutral-850 pb-2 flex justify-between items-center">
                <span>Webhook Receiver Logs</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </h4>
              <div className="space-y-2.5 font-mono text-[10px] bg-neutral-950 p-4 rounded-xl border border-neutral-850 text-neutral-400">
                <div className="text-emerald-400">[2026-07-11 21:10] ARTOPAY-POST: payload signature key validated for order-121. Status: settled.</div>
                <div className="text-neutral-500">[2026-07-11 21:12] SYSTEM: DB update succeeded. Flagged booking as PAID.</div>
                <div className="text-amber-400">[2026-07-11 21:14] ARTOPAY-POST: settlement webhook received for order-122. Processing...</div>
              </div>
            </div>

            {/* List of payments */}
            <div className={`${theme.card} border rounded-2xl overflow-hidden`}>
              <table className="w-full text-left text-xs">
                <thead className={`bg-neutral-900/40 text-neutral-400 font-bold uppercase text-[9px] tracking-widest border-b ${theme.border}`}>
                  <tr>
                    <th className="p-4">TANGGAL</th>
                    <th className="p-4">INVOICE ID</th>
                    <th className="p-4">METODE BAYAR</th>
                    <th className="p-4">NILAI TRANSKASI</th>
                    <th className="p-4">STATUS WEBHOOK</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme.borderSubtle}`}>
                  {[
                    { date: '2026-07-11 21:05', inv: 'INV-CR-90412', method: 'ArtoPay QRIS', val: 'IDR 1.500.000', status: 'Settled (Success)', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
                    { date: '2026-07-11 20:30', inv: 'INV-CR-90411', method: 'Virtual Account BCA', val: 'IDR 750.000', status: 'Settled (Success)', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
                    { date: '2026-07-11 19:15', inv: 'INV-CR-90410', method: 'Credit Card (Stripe)', val: 'IDR 3.000.000', status: 'Pending', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' }
                  ].map((p, i) => (
                    <tr key={i} className={theme.hover}>
                      <td className={`p-4 font-mono ${theme.textSecondary}`}>{p.date}</td>
                      <td className="p-4 font-mono font-bold text-amber-500">{p.inv}</td>
                      <td className="p-4 font-bold">{p.method}</td>
                      <td className="p-4 font-mono font-black text-emerald-500">{p.val}</td>
                      <td className="p-4">
                        <span className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded border ${p.color}`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'finance':
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-base font-black uppercase tracking-wider font-mono text-amber-500">DEPARTMENTAL LEDGER &amp; COST REVENUE</h3>
              <p className={`text-xs ${theme.textSecondary}`}>Pemetaan omset kotor, pengeluaran supir, bahan bakar, komisi pemandu, dan estimasi keuntungan bersih {moduleName}.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`${theme.card} border rounded-2xl p-5 bg-emerald-500/5 border-emerald-500/10`}>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">ESTIMASI OMSET KOTOR</span>
                <h4 className="text-xl font-mono font-black text-emerald-400 mt-2">IDR 48.950.000</h4>
                <p className={`text-[10px] ${theme.textSecondary} mt-1`}>Berdasarkan data booking sukses</p>
              </div>
              <div className={`${theme.card} border rounded-2xl p-5 bg-rose-500/5 border-rose-500/10`}>
                <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">OPERATIONAL EXPENSES</span>
                <h4 className="text-xl font-mono font-black text-rose-400 mt-2">IDR 12.400.000</h4>
                <p className={`text-[10px] ${theme.textSecondary} mt-1`}>Supir + bensin + guide fee</p>
              </div>
              <div className={`${theme.card} border rounded-2xl p-5 bg-amber-500/5 border-amber-500/10`}>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">ESTIMASI PROFIT BERSIH</span>
                <h4 className="text-xl font-mono font-black text-amber-400 mt-2">IDR 36.550.000</h4>
                <p className={`text-[10px] ${theme.textSecondary} mt-1`}>Sirkulasi kas terakumulasi</p>
              </div>
            </div>

            {/* Simulated Balance Sheet diagram */}
            <div className={`${theme.card} border rounded-2xl p-6 space-y-4`}>
              <h4 className="text-xs font-black uppercase tracking-widest font-mono text-amber-500 border-b border-neutral-850 pb-2">
                Operational Cost Allocation Breakdown
              </h4>
              <div className="space-y-4 pt-2">
                {[
                  { label: 'Supir & Crew Salary Allocation', percentage: '45%', value: 'IDR 5.580.000', color: 'bg-amber-500' },
                  { label: 'Bahan Bakar & Tol Allowance', percentage: '30%', value: 'IDR 3.720.000', color: 'bg-indigo-500' },
                  { label: 'Asset Depreciation & Maintenance Reserve', percentage: '15%', value: 'IDR 1.860.000', color: 'bg-rose-500' },
                  { label: 'Internal Office Coordination Tax', percentage: '10%', value: 'IDR 1.240.000', color: 'bg-emerald-500' }
                ].map((x, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-extrabold">{x.label}</span>
                      <span className="font-mono font-bold text-amber-500">{x.value} ({x.percentage})</span>
                    </div>
                    <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                      <div className={`h-full ${x.color}`} style={{ width: x.percentage }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'reports':
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-base font-black uppercase tracking-wider font-mono text-amber-500">ANALYTICS &amp; EXPORT HUB</h3>
              <p className={`text-xs ${theme.textSecondary}`}>Unduh dan buat kompilasi berkas laporan untuk direktur eksekutif Smart Journey.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`${theme.card} border rounded-2xl p-6 space-y-4 flex flex-col justify-between`}>
                <div className="space-y-2">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <FileCheck className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-black uppercase tracking-wider font-mono">Laporan Manifest Lengkap</h4>
                  <p className={`text-xs ${theme.textSecondary}`}>
                    Menyimpan data seluruh wisatawan, rincian kontak, nomor jemputan, dan driver dalam kurun waktu tertentu.
                  </p>
                </div>
                <button 
                  onClick={() => triggerToast('Ekspor Laporan PDF berhasil disimulasikan')}
                  className="w-full py-2.5 rounded-xl border border-neutral-850 hover:bg-neutral-800 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-4"
                >
                  <Download className="h-4 w-4 text-amber-500" />
                  <span>Ekspor PDF Manifest</span>
                </button>
              </div>

              <div className={`${theme.card} border rounded-2xl p-6 space-y-4 flex flex-col justify-between`}>
                <div className="space-y-2">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-black uppercase tracking-wider font-mono">Buku Kas &amp; Ledger Omset</h4>
                  <p className={`text-xs ${theme.textSecondary}`}>
                    Rincian total tagihan nominal masuk, komisi guide, potongan fee ArtoPay, dan keuntungan bersih terhitung.
                  </p>
                </div>
                <button 
                  onClick={() => triggerToast('Ekspor Buku Kas Excel berhasil disimulasikan')}
                  className="w-full py-2.5 rounded-xl border border-neutral-850 hover:bg-neutral-800 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-4"
                >
                  <Download className="h-4 w-4 text-emerald-400" />
                  <span>Unduh XLS Cash Ledger</span>
                </button>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-base font-black uppercase tracking-wider font-mono text-amber-500">MODULE CONFIGURATION &amp; SETTINGS</h3>
              <p className={`text-xs ${theme.textSecondary}`}>Ubah parameter harga, threshold kuota, jadwal surcharge musim puncak, dan webhook token {moduleName}.</p>
            </div>

            <div className={`${theme.card} border rounded-2xl p-6 space-y-6`}>
              <h4 className="text-xs font-black uppercase tracking-widest font-mono text-amber-500 border-b border-neutral-850 pb-2">
                Operational Rules Definition
              </h4>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-wider block">Kapasitas Maksimal Harian</label>
                    <input 
                      type="number" 
                      min={1}
                      max={100}
                      value={serviceLimits?.taxi ?? 5} 
                      onChange={(e) => setServiceLimit('taxi', parseInt(e.target.value, 10) || 5)}
                      className={`w-full ${theme.input} border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500`} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-wider">Minimal Reservasi (Hari-H)</label>
                    <input type="number" defaultValue="1" className={`w-full ${theme.input} border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500`} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-wider block">Aturan Pembatalan Otomatis (Jam Kosong)</label>
                  <select className={`w-full ${theme.input} border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500`}>
                    <option>Batalkan jika belum bayar dalam 2 Jam</option>
                    <option>Batalkan jika belum bayar dalam 12 Jam</option>
                    <option>Tidak ada pembatalan otomatis</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-neutral-850 flex justify-end">
                  <button onClick={() => triggerToast('Pengaturan Konfigurasi Disimpan')} className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer">
                    <Save className="h-4 w-4" />
                    <span>Simpan Pengaturan</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div 
      data-admin-portal="true"
      className={`min-h-screen flex ${theme.bg} transition-colors duration-300 font-sans admin-portal ${isDark ? 'admin-dark' : 'admin-light'}`}
    >
      {/* Dynamic Toast Alert (Prinstine custom component) */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 right-6 z-50 max-w-sm w-full p-4 rounded-2xl shadow-2xl border flex items-center gap-3.5 bg-neutral-900 border-amber-500/30 text-amber-100 ring-1 ring-amber-500/20 backdrop-blur-xl"
          >
            <div className="shrink-0 p-1 rounded-full bg-amber-500/10 text-amber-500">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <p className="text-xs font-bold leading-tight">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- COLLAPSIBLE SIDEBAR --- */}
      <aside 
        className={`${theme.sidebar} border-r min-h-screen flex flex-col justify-between transition-all duration-300 z-30 sticky top-0 ${
          sidebarCollapsed ? 'w-20' : 'w-72'
        }`}
      >
        <div className="flex-grow overflow-y-auto no-scrollbar py-6 px-4 space-y-6">
          {/* Header Identity */}
          <div className={`flex items-center justify-between border-b ${theme.borderSubtle} border-dashed pb-5`}>
            {!sidebarCollapsed ? (
              <div className="flex items-center gap-2.5">
                <img 
                  src="/logo.png" 
                  alt="Smart Journey Logo" 
                  className="h-8 w-auto max-w-[120px] object-contain" 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div>
                  <h1 className={`text-xs font-black tracking-widest font-mono ${theme.textPrimary}`}>SMART JOURNEY</h1>
                  <span className="text-[9px] font-mono bg-amber-500/10 text-amber-600 font-extrabold px-1.5 py-0.5 rounded border border-amber-500/20 block mt-0.5">
                    ADMIN GATE v2.0
                  </span>
                </div>
              </div>
            ) : (
              <img 
                src="/logo.png" 
                alt="Smart Journey Logo" 
                className="h-8 w-auto max-w-[36px] object-contain mx-auto"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}

            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`hidden md:flex p-1.5 rounded-lg ${theme.innerCard} border ${theme.border} ${theme.textSecondary} hover:${theme.textPrimary} cursor-pointer transition-all`}
            >
              {sidebarCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
            </button>
          </div>

          {/* Navigation Menus */}
          <nav className="space-y-6">
            {/* Category: Dashboard & Analytics */}
            <div className="space-y-1.5">
              {!sidebarCollapsed && (
                <span className={`text-[10px] font-black ${theme.textMuted} uppercase tracking-widest px-2.5`}>
                  Executive
                </span>
              )}
              <button
                onClick={() => {
                  setActiveModule('dashboard');
                  setActiveSubTab('dashboard');
                }}
                className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative cursor-pointer ${
                  activeModule === 'dashboard' 
                    ? theme.activeTab
                    : `${theme.textSecondary} hover:${theme.textPrimary} ${theme.hover} border border-transparent`
                }`}
              >
                <LayoutDashboard className="h-4.5 w-4.5" />
                {!sidebarCollapsed && <span className="truncate flex-grow text-left">Dashboard</span>}
              </button>

              <button
                onClick={() => {
                  setActiveModule('analytics');
                }}
                className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative cursor-pointer ${
                  activeModule === 'analytics' 
                    ? theme.activeTab
                    : `${theme.textSecondary} hover:${theme.textPrimary} ${theme.hover} border border-transparent`
                }`}
              >
                <BarChart3 className="h-4.5 w-4.5" />
                {!sidebarCollapsed && <span className="truncate flex-grow text-left">Analytics</span>}
              </button>
            </div>

            {/* Category: Tour Management & Channels */}
            <div className="space-y-1.5">
              {!sidebarCollapsed && (
                <span className={`text-[10px] font-black ${theme.textMuted} uppercase tracking-widest px-2.5`}>
                  Tours &amp; Services
                </span>
              )}
              <div className="space-y-1">
                {[
                  { id: 'tours', label: 'Private Tours', icon: Compass },
                  { id: 'sharetour', label: 'Share Tour / Open Trip', icon: Users, badge: shareTourBookings.filter(b => b.status === 'Pending').length },
                  { id: 'bookings', label: 'All Bookings', icon: ClipboardList, badge: bookings.filter(b => b.status === 'Pending').length + shareTourBookings.filter(b => b.status === 'Pending').length },
                  { id: 'airport', label: 'Airport Transfer', icon: Globe },
                  { id: 'taxi', label: 'Taxi Service', icon: MapPin },
                  { id: 'rental', label: 'Car Rental', icon: Truck }
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeModule === item.id;
                  
                  const subTabs = item.id === 'tours' ? [
                    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
                    { id: 'management', label: 'Katalog & Paket', icon: Layers },
                    { id: 'calendar', label: 'Booking Calendar', icon: CalendarDays },
                    { id: 'blackout', label: 'Aturan & Blackout', icon: Settings },
                    { id: 'booking', label: 'Daftar Booking', icon: ClipboardList },
                    { id: 'customer', label: 'Database Tamu', icon: Users },
                    { id: 'payment', label: 'Status Pembayaran', icon: CreditCard },
                    { id: 'finance', label: 'Keuangan Ledger', icon: DollarSign },
                    { id: 'reports', label: 'Unduh Laporan', icon: FileText }
                  ] : item.id === 'airport' ? [
                    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
                    { id: 'calendar', label: 'Booking Calendar', icon: CalendarDays },
                    { id: 'routes', label: 'Daftar Rute Admin', icon: Layers },
                    { id: 'airports', label: 'Pembukaan Bandara', icon: Plane },
                    { id: 'airport_edit', label: 'Konfigurasi Detail Bandara', icon: Settings },
                    { id: 'booking', label: 'Daftar Booking & Verifikasi', icon: ClipboardList },
                    { id: 'reports', label: 'Unduh Laporan', icon: FileCheck }
                  ] : item.id === 'taxi' ? [
                    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
                    { id: 'calendar', label: 'Kalender Booking', icon: Calendar },
                    { id: 'master-data', label: 'Master Data', icon: Layers },
                    { id: 'pricing-engine', label: 'Pricing Engine', icon: DollarSign },
                    { id: 'excel-import', label: 'Excel Import', icon: Upload },
                    { id: 'excel-export', label: 'Excel Export', icon: Download },
                    { id: 'import-history', label: 'Import History', icon: History },
                    { id: 'settings', label: 'Aturan Dispatcher', icon: Settings }
                  ] : item.id === 'rental' ? [
                    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                    { id: 'calendar', label: 'Booking Calendar', icon: Calendar },
                    { id: 'cities', label: 'Operational Cities', icon: Globe },
                    { id: 'areas', label: 'Service Areas', icon: MapPin },
                    { id: 'vehicles', label: 'Vehicles', icon: Car },
                    { id: 'categories', label: 'Vehicle Categories', icon: Layers },
                    { id: 'addons', label: 'Add-on Services', icon: Sparkles },
                    { id: 'bookings', label: 'Bookings', icon: ClipboardList },
                    { id: 'settings', label: 'Settings', icon: Settings }
                  ] : [];

                  return (
                    <div key={item.id} className="space-y-1">
                      <button
                        onClick={() => {
                          setActiveModule(item.id as any);
                          setActiveSubTab('dashboard');
                          if (sidebarCollapsed) {
                            setSidebarCollapsed(false);
                          }
                        }}
                        className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative cursor-pointer ${
                          isActive 
                            ? theme.activeTab
                            : `${theme.textSecondary} hover:${theme.textPrimary} ${theme.hover} border border-transparent`
                        }`}
                      >
                        <Icon className="h-4.5 w-4.5 shrink-0" />
                        {!sidebarCollapsed && (
                          <div className="flex items-center justify-between flex-grow truncate">
                            <span className="truncate text-left">
                              {item.label}
                            </span>
                            {item.badge !== undefined && item.badge > 0 && (
                              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-500 text-neutral-950">
                                {item.badge}
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                      
                      {isActive && !sidebarCollapsed && subTabs.length > 0 && (
                        <div className={`pl-4 ml-4 border-l ${theme.border} space-y-0.5 mt-1`}>
                          {subTabs.map((sub) => {
                            const SubIcon = sub.icon;
                            const isSubActive = activeSubTab === sub.id;
                            return (
                              <button
                                key={sub.id}
                                onClick={() => {
                                  setActiveSubTab(sub.id as any);
                                  triggerToast(`Beralih ke tab ${sub.label}`);
                                }}
                                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer text-left ${
                                  isSubActive
                                    ? 'text-amber-600 font-black bg-amber-500/10'
                                    : `${theme.textSecondary} hover:${theme.textPrimary} ${theme.hover}`
                                }`}
                              >
                                <SubIcon className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{sub.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category: Analytics & CMS */}
            <div className="space-y-1.5">
              {!sidebarCollapsed && (
                <span className={`text-[10px] font-black ${theme.textMuted} uppercase tracking-widest px-2.5`}>
                  Analytics &amp; CMS
                </span>
              )}
              
              <button
                onClick={() => {
                  setActiveModule('reports');
                  setActiveSubTab('dashboard');
                }}
                className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative cursor-pointer ${
                  activeModule === 'reports' 
                    ? theme.activeTab
                    : `${theme.textSecondary} hover:${theme.textPrimary} ${theme.hover} border border-transparent`
                }`}
              >
                <BarChart3 className="h-4.5 w-4.5" />
                {!sidebarCollapsed && <span className="truncate flex-grow text-left">Reports &amp; Finance</span>}
              </button>

              <button
                onClick={() => {
                  setActiveModule('cms');
                  setActiveCmsTab('hero');
                }}
                className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative cursor-pointer ${
                  activeModule === 'cms' 
                    ? theme.activeTab
                    : `${theme.textSecondary} hover:${theme.textPrimary} ${theme.hover} border border-transparent`
                }`}
              >
                <ClipboardList className="h-4.5 w-4.5" />
                {!sidebarCollapsed && <span className="truncate flex-grow text-left">Website CMS</span>}
              </button>
            </div>

            {/* Category: Account / Profile */}
            <div className="space-y-1.5">
              {!sidebarCollapsed && (
                <span className={`text-[10px] font-black ${theme.textMuted} uppercase tracking-widest px-2.5`}>
                  Security &amp; Account
                </span>
              )}
              <button
                onClick={() => {
                  setActiveModule('account');
                  setActiveAccountTab('profile');
                }}
                className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative cursor-pointer ${
                  activeModule === 'account' 
                    ? theme.activeTab
                    : `${theme.textSecondary} hover:${theme.textPrimary} ${theme.hover} border border-transparent`
                }`}
              >
                <Settings className="h-4.5 w-4.5" />
                {!sidebarCollapsed && <span className="truncate flex-grow text-left">Settings</span>}
              </button>
            </div>
          </nav>
        </div>

        {/* User Identity / Exit Portal */}
        <div className={`p-4 border-t ${theme.border} space-y-2`}>
          {!sidebarCollapsed && (
            <div className={`p-3 rounded-xl ${theme.innerCard} border ${theme.border} flex items-center gap-2.5`}>
              <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center text-neutral-950 font-black text-xs">
                SJT
              </div>
              <div className="overflow-hidden">
                <h5 className={`text-[11px] font-bold ${theme.textPrimary} truncate`}>Administrator</h5>
                <span className={`text-[9px] ${theme.textMuted} block truncate`}>sawahjaya@gmail.com</span>
              </div>
            </div>
          )}
          <button 
            onClick={() => setPage('home')}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:text-rose-600 border border-transparent hover:bg-rose-500/10 cursor-pointer`}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!sidebarCollapsed && <span>Keluar Portal</span>}
          </button>
        </div>
      </aside>

      {/* --- MAIN FRAMEWORK CONTENT AREA --- */}
      <div className="flex-grow flex flex-col min-h-screen relative overflow-hidden">
        
        {/* --- STICKY TOP NAVIGATION --- */}
        <header className={`sticky top-0 z-20 ${theme.header} border-b backdrop-blur-md px-8 py-4 flex items-center justify-between`}>
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className={theme.textMuted}>PORTAL ADMIN</span>
            <ChevronRight className="h-3.5 w-3.5 text-neutral-600" />
            <span className="text-amber-500 uppercase font-bold tracking-wider">{activeModule}</span>
            {activeModule !== 'dashboard' && activeModule !== 'analytics' && activeModule !== 'cms' && activeModule !== 'account' && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-neutral-600" />
                <span className={`${theme.textSecondary} uppercase font-bold`}>{activeSubTab}</span>
              </>
            )}
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-4">
            {/* Search Bar Placeholder */}
            <div className="relative hidden sm:block">
              <Search className={`absolute left-3.5 top-2.5 h-4 w-4 ${theme.textMuted}`} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari manifest / parameter..." 
                className={`w-48 md:w-64 ${theme.input} pl-10 pr-4 py-2 text-xs rounded-xl focus:outline-none focus:border-amber-500 border transition-all`} 
              />
            </div>

            {/* Dark/Light Theme Switcher */}
            <button 
              onClick={() => {
                setIsDark(!isDark);
                triggerToast(`Mengubah ke ${!isDark ? 'Tema Gelap' : 'Tema Terang'}`);
              }}
              className={`p-2 rounded-xl border ${theme.border} ${theme.hover} ${theme.textSecondary} hover:${theme.textPrimary} transition-all cursor-pointer`}
              title="Ganti Tema Visual"
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-neutral-600" />}
            </button>

            {/* Notifications Placeholder */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileDropdown(false);
                  if (notificationCount > 0) setNotificationCount(0);
                }}
                className={`p-2 rounded-xl border ${theme.border} ${theme.hover} ${theme.textSecondary} hover:${theme.textPrimary} transition-all cursor-pointer relative`}
              >
                <Bell className="h-4 w-4" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-rose-500 text-white rounded-full text-[8px] font-black flex items-center justify-center animate-pulse">
                    {notificationCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`absolute right-0 mt-2 w-80 rounded-2xl border ${theme.card} shadow-2xl p-4 space-y-3 z-30`}
                  >
                    <div className={`flex justify-between items-center border-b ${theme.borderSubtle} pb-2`}>
                      <span className="text-xs font-black uppercase tracking-wider font-mono text-amber-500">Notifikasi Sistem</span>
                      <button onClick={() => setShowNotifications(false)} className={`text-neutral-500 ${theme.hover} p-1 rounded-lg`}>
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
                      {[
                        { title: 'Pembayaran Diterima', desc: 'Tour #SJ-TB-9811 telah terbayar lunas via ArtoPay.', time: '5m yang lalu' },
                        { title: 'Alokasi Otomatis Supir', desc: 'Supir "Made Wijaya" berhasil dialokasikan ke Rental #SJ-RB-4410.', time: '12m yang lalu' },
                        { title: 'Pembaruan Katalog Wisata', desc: 'Admin Smart Journey memperbarui harga promo tur Uluwatu Sunset.', time: '1h yang lalu' }
                      ].map((n, i) => (
                        <div key={i} className={`p-2.5 rounded-xl ${theme.innerCard} border ${theme.borderSubtle} space-y-1`}>
                          <h6 className={`text-[11px] font-black ${theme.textPrimary}`}>{n.title}</h6>
                          <p className={`text-[10px] ${theme.textSecondary} leading-normal`}>{n.desc}</p>
                          <span className={`text-[8px] font-mono font-bold ${theme.textMuted} block mt-1`}>{n.time}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown Placeholder */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowProfileDropdown(!showProfileDropdown);
                  setShowNotifications(false);
                }}
                className={`flex items-center gap-2 border ${theme.border} ${theme.hover} rounded-xl px-3 py-1.5 transition-all text-left cursor-pointer`}
              >
                <div className="h-6 w-6 rounded-lg bg-amber-500 flex items-center justify-center text-neutral-950 font-black text-[10px] font-mono">
                  AD
                </div>
                <span className={`text-xs font-bold hidden md:inline ${theme.textPrimary}`}>Admin Pusat</span>
                <ChevronDown className="h-3.5 w-3.5 text-neutral-500" />
              </button>

              <AnimatePresence>
                {showProfileDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`absolute right-0 mt-2 w-56 rounded-2xl border ${theme.card} shadow-2xl p-3 space-y-1.5 z-30`}
                  >
                    <div className={`p-2 border-b ${theme.borderSubtle} text-xs`}>
                      <p className={`font-black ${theme.textPrimary}`}>Smart Journey</p>
                      <span className={`text-[9px] ${theme.textMuted} block font-mono`}>Role: Super Administrator</span>
                    </div>
                    <button 
                      onClick={() => {
                        setActiveModule('account');
                        setActiveAccountTab('profile');
                        setShowProfileDropdown(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold ${theme.hover} ${theme.textPrimary} cursor-pointer`}
                    >
                      <User className="h-4 w-4 text-amber-500" />
                      <span>Profil Akun</span>
                    </button>
                    <button 
                      onClick={() => {
                        setActiveModule('account');
                        setActiveAccountTab('password');
                        setShowProfileDropdown(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold ${theme.hover} ${theme.textPrimary} cursor-pointer`}
                    >
                      <LockKeyhole className="h-4 w-4 text-amber-500" />
                      <span>Ubah Sandi</span>
                    </button>
                    <div className={`border-t ${theme.borderSubtle} pt-1.5 mt-1.5`}>
                      <button 
                        onClick={() => {
                          setShowProfileDropdown(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* --- MAIN PAGE VIEW ROUTER --- */}
        <main className="flex-grow p-8 overflow-y-auto no-scrollbar space-y-8 z-10">
          
          <AnimatePresence mode="wait">
            {/* 1. VIEW: GLOBAL CENTRAL DASHBOARD */}
            {activeModule === 'dashboard' && (
              <motion.div 
                key="central-dashboard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-8 text-left"
              >
                {/* SECTION 1: WELCOME HEADER */}
                <div className={`${theme.innerCard} border rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm`}>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono bg-amber-500/10 text-amber-500 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <Activity className="h-3 w-3 animate-pulse" />
                        Operational Control Center
                      </span>
                    </div>
                    <h2 className={`text-2xl font-black tracking-tight ${theme.textPrimary} font-sans`}>
                      {(() => {
                        const hours = liveTime.getHours();
                        if (hours < 12) return 'Good Morning';
                        if (hours < 17) return 'Good Afternoon';
                        return 'Good Evening';
                      })()}, Admin Pusat
                    </h2>
                    <p className={`text-xs ${theme.textSecondary}`}>
                      Selamat datang kembali. Memantau seluruh operasional, kapasitas pemesanan harian, dan verifikasi status pembayaran Smart Journey.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3.5 text-xs font-bold font-mono">
                    <span className="p-3 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      <Clock className="h-5 w-5 animate-spin-slow" />
                    </span>
                    <div>
                      <span className={`${theme.textSecondary} block text-[9px] uppercase tracking-wider`}>LIVE CONTROL PANEL TIME</span>
                      <div className="flex items-center gap-2 text-sm">
                        <span className={`${theme.textPrimary} font-extrabold`}>
                          {liveTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        <span className={theme.textMuted}>|</span>
                        <span className="text-amber-500 font-black">
                          {liveTime.toLocaleTimeString('en-US', { hour12: false })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: SUMMARY CARDS */}
                {(() => {
                  const todayStr = '2026-07-14';
                  const todayBookingsCount = bookings.filter(b => b.details && b.details.date === todayStr).length;
                  
                  const pendingPaymentBookings = bookings.filter(b => b.paymentStatus === 'Pending');
                  const pendingPaymentCount = pendingPaymentBookings.length;
                  const pendingPaymentAmountUSD = pendingPaymentBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
                  const pendingPaymentAmountIDR = pendingPaymentBookings.reduce((sum, b) => sum + (b.totalPriceIDR || 0), 0);

                  const todayPaidBookings = bookings.filter(b => b.details && b.details.date === todayStr && b.paymentStatus === 'Paid');
                  const todayRevenueUSD = todayPaidBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
                  const todayRevenueIDR = todayPaidBookings.reduce((sum, b) => sum + (b.totalPriceIDR || 0), 0);

                  const totalVehicles = rentalVehicles.length || 7;
                  const bookedRentalsToday = bookings.filter(b => b.type === 'rental' && b.details && b.details.date === todayStr).length;
                  const availableVehicles = Math.max(0, totalVehicles - bookedRentalsToday);

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      <StatCard 
                        title="Today's Bookings" 
                        value={`${todayBookingsCount} Bookings`} 
                        change="Active Trips" 
                        isPositive={true} 
                        label="For travel date today" 
                        icon={ClipboardList} 
                      />
                      <StatCard 
                        title="Pending Payments" 
                        value={`${pendingPaymentCount} Invoices`} 
                        change={currency === 'USD' ? `$${pendingPaymentAmountUSD.toLocaleString()}` : `IDR ${(pendingPaymentAmountIDR / 1000).toFixed(0)}K`} 
                        isPositive={false} 
                        label="Awaiting review" 
                        icon={CreditCard} 
                      />
                      <StatCard 
                        title="Today's Revenue" 
                        value={currency === 'USD' ? `$${todayRevenueUSD.toLocaleString()}` : `IDR ${todayRevenueIDR.toLocaleString('id-ID')}`} 
                        change="Verified Revenue" 
                        isPositive={true} 
                        label="Lunas hari ini" 
                        icon={DollarSign} 
                      />
                      <StatCard 
                        title="Available Vehicles" 
                        value={`${availableVehicles} Unit`} 
                        change="Fleet Utilization" 
                        isPositive={true} 
                        label="SJT Ready Rentals" 
                        icon={Car} 
                      />
                    </div>
                  );
                })()}

                {/* SECTION 3 & DATE DETAIL GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* LEFT: BOOKING OVERVIEW CALENDAR (8 COLS) */}
                  <div className="lg:col-span-8 space-y-4">
                    <div className={`${theme.card} border rounded-2xl p-5 space-y-4 shadow-sm`}>
                      {/* Calendar Navigation Controls */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-850 pb-4">
                        <div className="space-y-0.5">
                          <h3 className="text-sm font-black uppercase tracking-wider font-mono text-amber-500">
                            Booking Overview Calendar
                          </h3>
                          <p className={`text-[11px] ${theme.textSecondary}`}>
                            Pantau total sebaran kapasitas kuota seluruh jenis layanan kami secara harian.
                          </p>
                        </div>

                        {/* Month and Year Selection */}
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button 
                            onClick={() => {
                              if (overviewMonth === 0) {
                                setOverviewMonth(11);
                                setOverviewYear(prev => prev - 1);
                              } else {
                                setOverviewMonth(prev => prev - 1);
                              }
                            }}
                            className={`p-1.5 rounded-lg border ${theme.border} ${theme.hover} ${theme.textPrimary} cursor-pointer`}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>

                          <select 
                            value={overviewMonth}
                            onChange={(e) => setOverviewMonth(parseInt(e.target.value, 10))}
                            className={`${theme.input} text-xs font-bold px-2.5 py-1.5 rounded-lg outline-none focus:border-amber-500`}
                          >
                            {[
                              'January', 'February', 'March', 'April', 'May', 'June',
                              'July', 'August', 'September', 'October', 'November', 'December'
                            ].map((m, idx) => (
                              <option key={m} value={idx}>{m}</option>
                            ))}
                          </select>

                          <select 
                            value={overviewYear}
                            onChange={(e) => setOverviewYear(parseInt(e.target.value, 10))}
                            className={`${theme.input} text-xs font-bold px-2.5 py-1.5 rounded-lg outline-none focus:border-amber-500`}
                          >
                            {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                              <option key={y} value={y}>{y}</option>
                            ))}
                          </select>

                          <button 
                            onClick={() => {
                              if (overviewMonth === 11) {
                                setOverviewMonth(0);
                                setOverviewYear(prev => prev + 1);
                              } else {
                                setOverviewMonth(prev => prev + 1);
                              }
                            }}
                            className={`p-1.5 rounded-lg border ${theme.border} ${theme.hover} ${theme.textPrimary} cursor-pointer`}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Calendar Legends */}
                      <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-mono font-bold ${theme.textSecondary} ${theme.innerCard} p-2.5 border ${theme.borderSubtle} rounded-xl`}>
                        <span className={`text-[9px] ${theme.textMuted} uppercase`}>LEGENDA MODUL:</span>
                        <span className="flex items-center gap-1">🟣 Share Tour</span>
                        <span className="flex items-center gap-1">🟢 Airport Transfer</span>
                        <span className="flex items-center gap-1">🟠 Taxi Service</span>
                        <span className="flex items-center gap-1">🔵 Car Rental</span>
                      </div>

                      {/* Day Grid */}
                      <div className={`grid grid-cols-7 gap-1 text-center font-mono text-[10px] font-bold ${theme.textMuted} border-b ${theme.borderSubtle} pb-2`}>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                          <div key={d}>{d}</div>
                        ))}
                      </div>

                      {/* Calendar Numbers Grid */}
                      {(() => {
                        const totalDays = new Date(overviewYear, overviewMonth + 1, 0).getDate();
                        const firstDayIndex = new Date(overviewYear, overviewMonth, 1).getDay();

                        const prevMonthDays = new Date(overviewYear, overviewMonth, 0).getDate();
                        const paddedPrevDays = [];
                        for (let i = firstDayIndex - 1; i >= 0; i--) {
                          const prevMonthNum = overviewMonth === 0 ? 11 : overviewMonth - 1;
                          const prevYearNum = overviewMonth === 0 ? overviewYear - 1 : overviewYear;
                          paddedPrevDays.push({
                            day: prevMonthDays - i,
                            isCurrentMonth: false,
                            dateStr: `${prevYearNum}-${String(prevMonthNum + 1).padStart(2, '0')}-${String(prevMonthDays - i).padStart(2, '0')}`
                          });
                        }

                        const currentMonthDays = [];
                        for (let i = 1; i <= totalDays; i++) {
                          const formattedMonth = String(overviewMonth + 1).padStart(2, '0');
                          const formattedDay = String(i).padStart(2, '0');
                          currentMonthDays.push({
                            day: i,
                            isCurrentMonth: true,
                            dateStr: `${overviewYear}-${formattedMonth}-${formattedDay}`
                          });
                        }

                        const calendarDays = [...paddedPrevDays, ...currentMonthDays];
                        const totalSlots = Math.ceil(calendarDays.length / 7) * 7;
                        const nextMonthPaddingCount = totalSlots - calendarDays.length;
                        for (let i = 1; i <= nextMonthPaddingCount; i++) {
                          const nextMonthNum = overviewMonth === 11 ? 0 : overviewMonth + 1;
                          const nextYearNum = overviewMonth === 11 ? overviewYear + 1 : overviewYear;
                          calendarDays.push({
                            day: i,
                            isCurrentMonth: false,
                            dateStr: `${nextYearNum}-${String(nextMonthNum + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
                          });
                        }

                        const getOccupancyInfo = (dateStr: string) => {
                          const dateBookings = bookings.filter(b => b.details && b.details.date === dateStr);
                          
                          const tourCount = dateBookings.filter(b => b.type === 'tour').length;
                          const airportCount = dateBookings.filter(b => b.type === 'airport').length;
                          const taxiCount = dateBookings.filter(b => b.type === 'taxi').length;
                          const rentalCount = dateBookings.filter(b => b.type === 'rental').length;

                          const tourLimit = serviceLimits?.tour ?? 5;
                          const airportLimit = serviceLimits?.airport ?? 5;
                          const taxiLimit = serviceLimits?.taxi ?? 5;
                          const rentalLimit = serviceLimits?.rental ?? 5;

                          const getStatusColor = (count: number, limit: number) => {
                            if (count === 0) return isDark ? 'text-neutral-500 bg-neutral-900/10 opacity-60' : 'text-neutral-400 bg-neutral-100 opacity-60';
                            if (count >= limit) return 'text-rose-500 bg-rose-500/15 border border-rose-500/25 font-black';
                            if (count >= limit - 1) return 'text-amber-500 bg-amber-500/15 border border-amber-500/25 font-bold';
                            return 'text-emerald-500 bg-emerald-500/15 border border-emerald-500/25';
                          };

                          return {
                            tour: { count: tourCount, limit: tourLimit, color: getStatusColor(tourCount, tourLimit) },
                            airport: { count: airportCount, limit: airportLimit, color: getStatusColor(airportCount, airportLimit) },
                            taxi: { count: taxiCount, limit: taxiLimit, color: getStatusColor(taxiCount, taxiLimit) },
                            rental: { count: rentalCount, limit: rentalLimit, color: getStatusColor(rentalCount, rentalLimit) }
                          };
                        };

                        return (
                          <div className="grid grid-cols-7 gap-1.5 pt-1">
                            {calendarDays.map((dayItem, index) => {
                              const info = getOccupancyInfo(dayItem.dateStr);
                              const isSelected = selectedDashDate === dayItem.dateStr;
                              const isTodaySimulated = dayItem.dateStr === '2026-07-14';

                              return (
                                <button
                                  key={index}
                                  onClick={() => setSelectedDashDate(dayItem.dateStr)}
                                  className={`min-h-[105px] p-2 rounded-xl border text-left flex flex-col justify-between transition-all outline-none ${
                                    isSelected 
                                      ? 'bg-amber-500/10 border-amber-500/60 ring-1 ring-amber-500/30' 
                                      : dayItem.isCurrentMonth
                                        ? isDark ? 'bg-neutral-900/40 border-neutral-850 hover:bg-neutral-900 hover:border-neutral-750' : 'bg-white border-neutral-200 hover:bg-amber-500/5 hover:border-amber-500/30 shadow-xs'
                                        : isDark ? 'bg-neutral-950/20 border-neutral-900/40 opacity-45 hover:opacity-80' : 'bg-neutral-50 border-neutral-100 opacity-40 hover:opacity-75'
                                  }`}
                                >
                                  {/* Day Number Row */}
                                  <div className="flex justify-between items-center w-full">
                                    <span className={`text-[11px] font-black font-mono ${
                                      isSelected 
                                        ? 'text-amber-500' 
                                        : dayItem.isCurrentMonth 
                                          ? theme.textPrimary 
                                          : theme.textMuted
                                    }`}>
                                      {dayItem.day}
                                    </span>
                                    {isTodaySimulated && (
                                      <span className="text-[8px] font-mono font-bold bg-amber-500 text-neutral-950 px-1 py-0.2 rounded uppercase">
                                        TODAY
                                      </span>
                                    )}
                                  </div>

                                  {/* Service Summaries inside the Cell */}
                                  <div className="space-y-1 w-full text-[9px] font-mono mt-1">
                                    <div className={`flex justify-between items-center px-1 py-0.5 rounded-md ${info.tour.color}`}>
                                      <span>🟣 T</span>
                                      <span>{info.tour.count}/{info.tour.limit}{info.tour.count >= info.tour.limit ? '!' : ''}</span>
                                    </div>
                                    <div className={`flex justify-between items-center px-1 py-0.5 rounded-md ${info.airport.color}`}>
                                      <span>🟢 A</span>
                                      <span>{info.airport.count}/{info.airport.limit}{info.airport.count >= info.airport.limit ? '!' : ''}</span>
                                    </div>
                                    <div className={`flex justify-between items-center px-1 py-0.5 rounded-md ${info.taxi.color}`}>
                                      <span>🟠 X</span>
                                      <span>{info.taxi.count}/{info.taxi.limit}{info.taxi.count >= info.taxi.limit ? '!' : ''}</span>
                                    </div>
                                    <div className={`flex justify-between items-center px-1 py-0.5 rounded-md ${info.rental.color}`}>
                                      <span>🔵 R</span>
                                      <span>{info.rental.count}/{info.rental.limit}{info.rental.count >= info.rental.limit ? '!' : ''}</span>
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* RIGHT: BOOKING SUMMARY PANEL (4 COLS) */}
                  <div className="lg:col-span-4 space-y-4">
                    <div className={`${theme.card} border rounded-2xl p-5 space-y-4 shadow-sm h-full`}>
                      <div className={`border-b ${theme.borderSubtle} pb-4`}>
                        <span className={`text-[9px] font-mono font-bold ${theme.innerCard} border ${theme.borderSubtle} ${theme.textSecondary} px-2.5 py-1 rounded-full uppercase block w-fit mb-1.5`}>
                          Date Details Panel
                        </span>
                        <h3 className={`text-sm font-black ${theme.textPrimary}`}>
                          {(() => {
                            const parts = selectedDashDate.split('-');
                            if (parts.length !== 3) return selectedDashDate;
                            const year = parts[0];
                            const month = parseInt(parts[1], 10) - 1;
                            const day = parts[2];
                            const months = [
                              'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                              'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
                            ];
                            return `${day} ${months[month]} ${year}`;
                          })()}
                        </h3>
                        <p className={`text-[11px] ${theme.textSecondary} mt-0.5`}>
                          Ringkasan utilisasi kuota reservasi pada tanggal yang dipilih.
                        </p>
                      </div>

                      {/* Display summaries only, no user data */}
                      {(() => {
                        const dateBookings = bookings.filter(b => b.details && b.details.date === selectedDashDate);
                        
                        const tourCount = dateBookings.filter(b => b.type === 'tour').length;
                        const tourLimit = serviceLimits?.tour ?? 5;
                        
                        const airportCount = dateBookings.filter(b => b.type === 'airport').length;
                        const airportLimit = serviceLimits?.airport ?? 5;

                        const taxiCount = dateBookings.filter(b => b.type === 'taxi').length;
                        const taxiLimit = serviceLimits?.taxi ?? 5;

                        const rentalCount = dateBookings.filter(b => b.type === 'rental').length;
                        const rentalLimit = serviceLimits?.rental ?? 5;

                        return (
                          <div className="space-y-3.5">
                            {/* 1. Share Tour */}
                            <div className={`p-3.5 border rounded-xl ${theme.innerCard} ${theme.borderSubtle} flex flex-col justify-between`}>
                              <div className="flex justify-between items-center mb-1.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm">🟣</span>
                                  <span className={`font-extrabold text-xs ${theme.textPrimary}`}>Share Tour</span>
                                </div>
                                <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-full ${
                                  tourCount >= tourLimit 
                                    ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' 
                                    : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                }`}>
                                  {tourCount >= tourLimit ? 'FULL' : 'Available'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-[10px] text-neutral-500 font-mono mb-2.5">
                                <span>Kapasitas Terisi</span>
                                <span className={`font-bold ${theme.textPrimary}`}>{tourCount} / {tourLimit}</span>
                              </div>
                              <button 
                                onClick={() => {
                                  setActiveModule('tours');
                                  setActiveSubTab('calendar');
                                  setSelectedCalendarDate(selectedDashDate);
                                  const parts = selectedDashDate.split('-');
                                  if (parts.length === 3) {
                                    setCalendarYear(parseInt(parts[0], 10));
                                    setCalendarMonth(parseInt(parts[1], 10) - 1);
                                  }
                                  localStorage.setItem('smartjourney_selected_date', selectedDashDate);
                                }}
                                className={`w-full ${isDark ? 'bg-neutral-950 hover:bg-neutral-900 border-neutral-850' : 'bg-white hover:bg-amber-500/5 border-neutral-200 shadow-xs'} border text-amber-600 font-black text-[10px] py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer`}
                              >
                                <span>View Details</span>
                                <ArrowUpRight className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            {/* 2. Airport Transfer */}
                            <div className={`p-3.5 border rounded-xl ${theme.innerCard} ${theme.borderSubtle} flex flex-col justify-between`}>
                              <div className="flex justify-between items-center mb-1.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm">🟢</span>
                                  <span className={`font-extrabold text-xs ${theme.textPrimary}`}>Airport Transfer</span>
                                </div>
                                <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-full ${
                                  airportCount >= airportLimit 
                                    ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' 
                                    : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                }`}>
                                  {airportCount >= airportLimit ? 'FULL' : 'Available'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-[10px] text-neutral-500 font-mono mb-2.5">
                                <span>Kapasitas Terisi</span>
                                <span className={`font-bold ${theme.textPrimary}`}>{airportCount} / {airportLimit}</span>
                              </div>
                              <button 
                                onClick={() => {
                                  setActiveModule('airport');
                                  setActiveSubTab('booking');
                                  setAirportPaymentSearch(selectedDashDate);
                                }}
                                className={`w-full ${isDark ? 'bg-neutral-950 hover:bg-neutral-900 border-neutral-850' : 'bg-white hover:bg-amber-500/5 border-neutral-200 shadow-xs'} border text-amber-600 font-black text-[10px] py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer`}
                              >
                                <span>View Details</span>
                                <ArrowUpRight className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            {/* 3. Taxi Service */}
                            <div className={`p-3.5 border rounded-xl ${theme.innerCard} ${theme.borderSubtle} flex flex-col justify-between`}>
                              <div className="flex justify-between items-center mb-1.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm">🟠</span>
                                  <span className={`font-extrabold text-xs ${theme.textPrimary}`}>Taxi Service</span>
                                </div>
                                <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-full ${
                                  taxiCount >= taxiLimit 
                                    ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' 
                                    : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                }`}>
                                  {taxiCount >= taxiLimit ? 'FULL' : 'Available'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-[10px] text-neutral-500 font-mono mb-2.5">
                                <span>Kapasitas Terisi</span>
                                <span className={`font-bold ${theme.textPrimary}`}>{taxiCount} / {taxiLimit}</span>
                              </div>
                              <button 
                                onClick={() => {
                                  setActiveModule('taxi');
                                  setActiveSubTab('calendar');
                                  localStorage.setItem('smartjourney_selected_date', selectedDashDate);
                                }}
                                className={`w-full ${isDark ? 'bg-neutral-950 hover:bg-neutral-900 border-neutral-850' : 'bg-white hover:bg-amber-500/5 border-neutral-200 shadow-xs'} border text-amber-600 font-black text-[10px] py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer`}
                              >
                                <span>View Details</span>
                                <ArrowUpRight className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            {/* 4. Car Rental */}
                            <div className={`p-3.5 border rounded-xl ${theme.innerCard} ${theme.borderSubtle} flex flex-col justify-between`}>
                              <div className="flex justify-between items-center mb-1.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm">🔵</span>
                                  <span className={`font-extrabold text-xs ${theme.textPrimary}`}>Car Rental</span>
                                </div>
                                <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-full ${
                                  rentalCount >= rentalLimit 
                                    ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' 
                                    : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                }`}>
                                  {rentalCount >= rentalLimit ? 'FULL' : 'Available'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-[10px] text-neutral-500 font-mono mb-2.5">
                                <span>Kapasitas Terisi</span>
                                <span className={`font-bold ${theme.textPrimary}`}>{rentalCount} / {rentalLimit}</span>
                              </div>
                              <button 
                                onClick={() => {
                                  setActiveModule('rental');
                                  setActiveSubTab('calendar');
                                  localStorage.setItem('smartjourney_selected_date', selectedDashDate);
                                }}
                                className={`w-full ${isDark ? 'bg-neutral-950 hover:bg-neutral-900 border-neutral-850' : 'bg-white hover:bg-amber-500/5 border-neutral-200 shadow-xs'} border text-amber-600 font-black text-[10px] py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer`}
                              >
                                <span>View Details</span>
                                <ArrowUpRight className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* BOTTOM AREA: PENDING PAYMENTS & NOTIFICATIONS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* SECTION 4: PENDING PAYMENT SUMMARY */}
                  {(() => {
                    const pendingPaymentBookings = bookings.filter(b => b.paymentStatus === 'Pending');
                    const pendingPaymentCount = pendingPaymentBookings.length;
                    const pendingPaymentAmountUSD = pendingPaymentBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
                    const pendingPaymentAmountIDR = pendingPaymentBookings.reduce((sum, b) => sum + (b.totalPriceIDR || 0), 0);

                    return (
                      <div className={`${theme.card} border rounded-2xl p-6 flex flex-col justify-between shadow-sm`}>
                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <h4 className={`font-black text-xs uppercase tracking-widest font-mono text-amber-500 border-b ${theme.borderSubtle} pb-2`}>
                                PENDING PAYMENT SUMMARY
                              </h4>
                              <p className={`text-[11px] ${theme.textSecondary}`}>
                                Aktivitas tagihan reservasi tamu yang masih menunggu konfirmasi transfer atau pembayaran selesai.
                              </p>
                            </div>
                            <span className="p-2 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/20">
                              <CreditCard className="h-4.5 w-4.5" />
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className={`p-4 rounded-xl border ${theme.innerCard} text-center space-y-1`}>
                              <span className="text-[9px] font-bold text-neutral-500 uppercase block font-mono">Invoice Pending</span>
                              <span className="text-lg font-black text-rose-500">{pendingPaymentCount} Invoices</span>
                            </div>
                            <div className={`p-4 rounded-xl border ${theme.innerCard} text-center space-y-1`}>
                              <span className="text-[9px] font-bold text-neutral-500 uppercase block font-mono">Total Pending Amount</span>
                              <span className="text-lg font-black text-amber-600">
                                {currency === 'USD' ? `$${pendingPaymentAmountUSD.toLocaleString()}` : `IDR ${(pendingPaymentAmountIDR / 1000).toFixed(0)}K`}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className={`pt-4 border-t ${theme.borderSubtle} flex justify-end mt-4`}>
                          <button 
                            onClick={() => {
                              setActiveModule('tours');
                              setActiveSubTab('payment');
                            }}
                            className={`${isDark ? 'bg-neutral-950 hover:bg-neutral-900 border-neutral-850 text-amber-400' : 'bg-amber-500 hover:bg-amber-600 text-neutral-950'} border border-transparent font-extrabold text-[11px] px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer`}
                          >
                            <span>View Payments</span>
                            <ArrowUpRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* SECTION 5: LATEST NOTIFICATIONS (MAX 5) */}
                  <div className={`${theme.card} border rounded-2xl p-6 space-y-4 shadow-sm flex flex-col justify-between`}>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <h4 className={`font-black text-xs uppercase tracking-widest font-mono text-amber-500 border-b ${theme.borderSubtle} pb-2`}>
                            LATEST OPERATIONAL NOTIFICATIONS
                          </h4>
                          <p className={`text-[11px] ${theme.textSecondary}`}>
                            Log koordinasi terkini unit pusat Smart Journey secara real-time.
                          </p>
                        </div>
                        <span className="p-2 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
                          <Bell className="h-4.5 w-4.5" />
                        </span>
                      </div>

                      {/* Notification Timeline */}
                      {(() => {
                        const getRecentNotifications = () => {
                          const sortedBookings = [...bookings].reverse().slice(0, 5);
                          return sortedBookings.map((b) => {
                            let icon = Bell;
                            let colorClass = 'text-amber-500 bg-amber-500/10 border border-amber-500/20';
                            let title = 'Activity';
                            let message = '';
                            
                            const serviceNameLabel = b.serviceName;
                            const customerNameLabel = b.customerName;

                            if (b.status === 'Confirmed') {
                              icon = CheckCircle2;
                              colorClass = 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/20';
                              title = 'Payment Verified';
                              message = `Pembayaran lunas untuk booking ${serviceNameLabel} atas nama ${customerNameLabel}.`;
                            } else if (b.status === 'Pending') {
                              icon = ClipboardList;
                              colorClass = 'text-blue-500 bg-blue-500/10 border border-blue-500/20';
                              title = 'New Booking';
                              message = `Reservasi baru diterima untuk ${serviceNameLabel} oleh ${customerNameLabel}.`;
                            } else {
                              icon = RefreshCw;
                              colorClass = 'text-amber-500 bg-amber-500/10 border border-amber-500/20';
                              title = 'Booking Updated';
                              message = `Detail reservasi ${serviceNameLabel} (${customerNameLabel}) telah diperbarui.`;
                            }
                            
                            return {
                              id: b.id,
                              title,
                              message,
                              time: b.bookingDate || 'Just now',
                              icon,
                              colorClass
                            };
                          });
                        };

                        const defaultMockNotifications = [
                          {
                            id: 'mock-1',
                            title: 'Payment Verified',
                            message: 'Pembayaran lunas untuk booking Mount Bromo Midnight Tour atas nama Sophie Laurent.',
                            time: '2 hours ago',
                            icon: CheckCircle2,
                            colorClass: 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/20'
                          },
                          {
                            id: 'mock-2',
                            title: 'New Booking',
                            message: 'Reservasi baru diterima untuk Airport Transfer Juanda oleh Kevin Wijaya.',
                            time: '4 hours ago',
                            icon: ClipboardList,
                            colorClass: 'text-blue-500 bg-blue-500/10 border border-blue-500/20'
                          },
                          {
                            id: 'mock-3',
                            title: 'Booking Updated',
                            message: 'Detail reservasi Car Rental (Innova Reborn) telah disesuaikan jadwalnya.',
                            time: '1 day ago',
                            icon: RefreshCw,
                            colorClass: 'text-amber-500 bg-amber-500/10 border border-amber-500/20'
                          },
                          {
                            id: 'mock-4',
                            title: 'Booking Cancelled',
                            message: 'Pembatalan otomatis sistem untuk penjemputan stasiun (Unpaid expired).',
                            time: '2 days ago',
                            icon: AlertTriangle,
                            colorClass: 'text-rose-500 bg-rose-500/10 border border-rose-500/20'
                          },
                          {
                            id: 'mock-5',
                            title: 'System Initialized',
                            message: 'Pusat integrasi multi-channel operational node aktif dan sinkron.',
                            time: '3 days ago',
                            icon: Shield,
                            colorClass: 'text-purple-500 bg-purple-500/10 border border-purple-500/20'
                          }
                        ];

                        const combinedNotifications = [
                          ...getRecentNotifications(),
                          ...defaultMockNotifications
                        ].slice(0, 5);

                        return (
                          <div className="space-y-3.5 pt-1">
                            {combinedNotifications.map((notif) => {
                              const IconComponent = notif.icon;
                              return (
                                <div key={notif.id} className="flex gap-3 text-left">
                                  <span className={`p-2 rounded-xl h-fit ${notif.colorClass}`}>
                                    <IconComponent className="h-4 w-4" />
                                  </span>
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                      <span className={`font-extrabold text-xs ${theme.textPrimary}`}>{notif.title}</span>
                                      <span className={`text-[9px] font-mono font-bold ${theme.textMuted}`}>{notif.time}</span>
                                    </div>
                                    <p className={`text-[11px] ${theme.textSecondary} leading-normal`}>
                                      {notif.message}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 1.1 VIEW: ADVANCED ANALYTICS DASHBOARD */}
            {activeModule === 'analytics' && (
              <motion.div 
                key="analytics-module"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6 text-left"
              >
                <AnalyticsDashboard isDark={isDark} />
              </motion.div>
            )}

            {/* 2. VIEWS: BUSINESS MANAGEMENT WORKSPACES (TOURS) */}
            {activeModule === 'tours' && (
              <motion.div 
                key="tours-module"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6 text-left"
              >
                <div>
                  {renderModuleTabContent('Tour Packages')}
                </div>
              </motion.div>
            )}

            {/* 3. VIEWS: BUSINESS MANAGEMENT WORKSPACES (AIRPORT) */}
            {activeModule === 'airport' && (
              <motion.div 
                key="airport-module"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6 text-left"
              >
                <div>
                  {renderModuleTabContent('Airport Transfer')}
                </div>
              </motion.div>
            )}

            {/* 4. VIEWS: BUSINESS MANAGEMENT WORKSPACES (TAXI) */}
            {activeModule === 'taxi' && (
              <motion.div 
                key="taxi-module"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6 text-left"
              >
                <div>
                  <TaxiExcelManager
                    taxiMasterAreas={taxiMasterAreas}
                    setTaxiMasterAreas={setTaxiMasterAreas}
                    taxiMasterDestinations={taxiMasterDestinations}
                    setTaxiMasterDestinations={setTaxiMasterDestinations}
                    taxiPricingRules={taxiPricingRules}
                    setTaxiPricingRules={setTaxiPricingRules}
                    taxiAreaRules={taxiAreaRules}
                    setTaxiAreaRules={setTaxiAreaRules}
                    taxiImportHistory={taxiImportHistory}
                    setTaxiImportHistory={setTaxiImportHistory}
                    currency={currency}
                    formatPrice={formatPrice}
                    triggerToast={triggerToast}
                    activeTab={activeSubTab as any}
                    setActiveTab={(tab) => setActiveSubTab(tab as any)}
                    isDark={isDark}
                  />
                </div>
              </motion.div>
            )}

            {/* 5. VIEWS: BUSINESS MANAGEMENT WORKSPACES (RENTAL) */}
            {activeModule === 'rental' && (
              <motion.div 
                key="rental-module"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6 text-left"
              >
                <div>
                  {renderModuleTabContent('Car Rental')}
                </div>
              </motion.div>
            )}

            {/* 6. VIEW: WEBSITE CMS */}
            {activeModule === 'cms' && (
              <motion.div 
                key="website-cms"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <h2 className="text-xl font-black tracking-tight font-mono text-amber-500">WEBSITE CMS INTERFACE</h2>
                  <p className={`text-xs ${theme.textSecondary}`}>
                    Kelola materi promosi, teks konten halaman depan, galeri foto, dan ulasan tamu pada website utama.
                  </p>
                </div>

                {/* Sub tabs for CMS */}
                <div className="flex gap-2 border-b border-neutral-850 pb-px overflow-x-auto no-scrollbar">
                  {[
                    { id: 'hero', label: 'Hero Banner & Tagline' },
                    { id: 'testimonials', label: 'Ulasan Tamu / Feedback' },
                    { id: 'partners', label: 'Our Partner Platforms' },
                    { id: 'about', label: 'Tentang Kami & Keunggulan' },
                    { id: 'contact', label: 'Informasi Kontak & Sosmed' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveCmsTab(tab.id as any);
                        triggerToast(`Membuka CMS: ${tab.label}`);
                      }}
                      className={`px-4 py-2 border-b-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        activeCmsTab === tab.id 
                          ? 'border-amber-500 text-amber-500 font-extrabold' 
                          : 'border-transparent text-neutral-400 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Visual CMS configuration placeholders */}
                <div className={`${theme.card} border rounded-2xl p-6 space-y-6`}>
                  {activeCmsTab === 'hero' && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest font-mono text-amber-500">Hero Section Settings</h4>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-neutral-500 uppercase">Judul Utama Tagline (Bahasa Indonesia)</label>
                          <input type="text" defaultValue="Smart Journey: Solusi Wisata & Rental Bali Terpercaya" className={`w-full ${theme.input} border rounded-xl px-3 py-2 text-xs`} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-neutral-500 uppercase">Subtagline Deskripsi (Bahasa Inggris)</label>
                          <textarea rows={3} defaultValue="Explore the beauty of Bali with our professional chauffeur and guide services. Best prices guaranteed." className={`w-full ${theme.input} border rounded-xl px-3 py-2 text-xs`} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-neutral-500 uppercase">Teks Tombol Aksi Utama</label>
                            <input type="text" defaultValue="Pesan Sekarang" className={`w-full ${theme.input} border rounded-xl px-3 py-2 text-xs`} />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-neutral-500 uppercase">Gambar Slide Latar Belakang (URL)</label>
                            <input type="text" defaultValue="https://images.unsplash.com/photo-1537996194471-e657df975ab4" className={`w-full ${theme.input} border rounded-xl px-3 py-2 text-xs`} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeCmsTab === 'testimonials' && (
                    <div className="space-y-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-neutral-800">
                        <div>
                          <h4 className="text-sm font-black uppercase tracking-widest font-mono text-amber-500">Customer Review &amp; Moderation Center</h4>
                          <p className={`text-xs mt-1 ${theme.textSecondary}`}>
                            Kelola ulasan dari pelanggan yang masuk. Semua ulasan baru berstatus <strong>Pending</strong> dan tidak akan tampil di website sebelum Anda menyetujuinya.
                          </p>
                        </div>
                        
                        {/* Summary Stats */}
                        <div className="flex gap-3">
                          <div className={`px-3 py-1.5 rounded-xl border border-neutral-800 ${theme.innerCard} text-center`}>
                            <span className="text-xs font-bold text-neutral-400 block font-mono">Total</span>
                            <span className="text-sm font-black text-white font-mono">{reviews.length}</span>
                          </div>
                          <div className={`px-3 py-1.5 rounded-xl border border-neutral-800 bg-amber-950/20 text-center`}>
                            <span className="text-xs font-bold text-amber-400 block font-mono">Pending</span>
                            <span className="text-sm font-black text-amber-500 font-mono">
                              {reviews.filter(r => r.status === 'pending').length}
                            </span>
                          </div>
                          <div className={`px-3 py-1.5 rounded-xl border border-neutral-800 bg-emerald-950/20 text-center`}>
                            <span className="text-xs font-bold text-emerald-400 block font-mono">Approved</span>
                            <span className="text-sm font-black text-emerald-500 font-mono">
                              {reviews.filter(r => r.status === 'approved' || !r.status).length}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Filters tabs */}
                      <div className="flex gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800 w-fit">
                        {[
                          { id: 'all', label: 'Semua Ulasan' },
                          { id: 'pending', label: `Menunggu Persetujuan (${reviews.filter(r => r.status === 'pending').length})` },
                          { id: 'approved', label: 'Telah Disetujui' }
                        ].map(tab => (
                          <button
                            key={tab.id}
                            onClick={() => setReviewsFilter(tab.id as any)}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer transition-all ${
                              reviewsFilter === tab.id
                                ? 'bg-amber-500 text-neutral-950 shadow-md'
                                : 'text-neutral-400 hover:text-white'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      {/* Reviews grid list */}
                      <div className="space-y-3">
                        {(() => {
                          const filteredReviews = reviews.filter(r => {
                            if (reviewsFilter === 'pending') return r.status === 'pending';
                            if (reviewsFilter === 'approved') return r.status === 'approved' || !r.status;
                            return true;
                          });

                          if (filteredReviews.length === 0) {
                            return (
                              <div className="text-center py-10 border border-dashed border-neutral-800 rounded-2xl text-neutral-500">
                                <Activity className="h-8 w-8 mx-auto text-neutral-600 mb-2" />
                                <p className="text-xs font-bold">Tidak ada ulasan dalam kategori ini.</p>
                              </div>
                            );
                          }

                          return filteredReviews.map((r) => {
                            // Badge color for serviceType
                            const serviceTypeLabels: Record<string, string> = {
                              tour: 'Tours & Wisata',
                              airport: 'Airport Transfer',
                              taxi: 'Taxi Service',
                              rental: 'Car Rental'
                            };
                            const serviceTypeColors: Record<string, string> = {
                              tour: 'bg-indigo-950/40 text-indigo-400 border-indigo-900/30',
                              airport: 'bg-sky-950/40 text-sky-400 border-sky-900/30',
                              taxi: 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30',
                              rental: 'bg-rose-950/40 text-rose-400 border-rose-900/30'
                            };

                            const label = serviceTypeLabels[r.serviceType || 'tour'] || 'Tours';
                            const colorClass = serviceTypeColors[r.serviceType || 'tour'] || 'bg-indigo-950/40 text-indigo-400 border-indigo-900/30';

                            return (
                              <div key={r.id} className={`p-5 rounded-2xl border ${theme.innerCard} flex flex-col md:flex-row justify-between gap-4 items-start md:items-center relative transition-all hover:border-neutral-700`}>
                                <div className="space-y-2 flex-1 text-left">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-extrabold text-xs text-white">{r.name}</span>
                                    <span className="text-[10px] text-neutral-400">({r.country || 'N/A'})</span>
                                    <span className="text-[10px] text-neutral-500 font-mono">· {r.date}</span>
                                    
                                    {/* Service type tag */}
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${colorClass}`}>
                                      {label}
                                    </span>

                                    {/* Status tag */}
                                    {r.status === 'pending' ? (
                                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-950/40 text-amber-500 border border-amber-900/40 font-mono">
                                        PENDING
                                      </span>
                                    ) : (
                                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/40 text-emerald-500 border border-emerald-900/40 font-mono">
                                        APPROVED
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-0.5 text-amber-500">
                                    {[...Array(r.rating || 5)].map((_, i) => (
                                      <Star key={i} className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                                    ))}
                                    {[...Array(5 - (r.rating || 5))].map((_, i) => (
                                      <Star key={i} className="h-3.5 w-3.5 text-neutral-700" />
                                    ))}
                                  </div>

                                  <p className={`text-xs italic leading-relaxed ${theme.textSecondary}`}>
                                    "{r.text}"
                                  </p>
                                </div>

                                {/* Interactive approval buttons */}
                                <div className="flex gap-2 shrink-0 self-end md:self-auto">
                                  {r.status === 'pending' && (
                                    <button
                                      onClick={() => {
                                        approveReview(r.id);
                                        triggerToast('Ulasan berhasil disetujui & dipublikasikan!');
                                      }}
                                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-3 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1 cursor-pointer active:scale-95"
                                    >
                                      <Check className="h-3.5 w-3.5" />
                                      <span>Setujui</span>
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      rejectReview(r.id);
                                      triggerToast('Ulasan berhasil dihapus.');
                                    }}
                                    className="bg-neutral-800 hover:bg-red-900 text-neutral-300 hover:text-white border border-neutral-700 hover:border-red-800 font-extrabold text-xs px-3 py-2 rounded-xl transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    <span>{r.status === 'pending' ? 'Tolak' : 'Hapus'}</span>
                                  </button>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  )}

                  {activeCmsTab === 'partners' && (
                    <div className="space-y-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-neutral-800">
                        <div>
                          <h4 className="text-sm font-black uppercase tracking-widest font-mono text-amber-500">Managing Our Partner Platforms</h4>
                          <p className={`text-xs mt-1 ${theme.textSecondary}`}>
                            Tambah, edit, dan hapus platform partner travel, sistem reservasi, dan grup hotel yang ditampilkan pada section <strong>"Our Partner Platforms"</strong> di beranda dan halaman Partner Directory.
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setPartnerForm({ id: '', name: '', url: '', logoUrl: '' });
                              setIsEditingPartner(false);
                            }}
                            className="bg-amber-500 hover:bg-amber-400 text-neutral-950 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-amber-500/10"
                          >
                            <Plus className="h-4 w-4" />
                            <span>Tambah Partner Baru</span>
                          </button>
                        </div>
                      </div>

                      {/* Partner Add/Edit Form */}
                      <form onSubmit={handleSavePartner} className={`p-5 rounded-2xl border ${theme.innerCard} space-y-4`}>
                        <h5 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                          <Building className="h-4 w-4 text-amber-500" />
                          <span>{isEditingPartner ? 'Edit Platform Partner' : 'Form Tambah Platform Partner'}</span>
                        </h5>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-neutral-400 uppercase">Nama Partner *</label>
                            <input
                              type="text"
                              required
                              value={partnerForm.name}
                              onChange={(e) => setPartnerForm(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="e.g. Traveloka"
                              className={`w-full ${theme.input} border rounded-xl px-3 py-2 text-xs`}
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-neutral-400 uppercase">Tautan / Link Website *</label>
                            <input
                              type="text"
                              required
                              value={partnerForm.url}
                              onChange={(e) => setPartnerForm(prev => ({ ...prev, url: e.target.value }))}
                              placeholder="e.g. https://www.traveloka.com"
                              className={`w-full ${theme.input} border rounded-xl px-3 py-2 text-xs`}
                            />
                          </div>
                        </div>

                        {/* Drag & Drop PNG Logo Upload */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black text-neutral-400 uppercase">Gambar Logo (PNG Drag & Drop) *</label>
                            <span className="text-[9px] font-bold text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              Format PNG / Gambar
                            </span>
                          </div>

                          <div
                            onDragOver={(e) => {
                              e.preventDefault();
                              setIsDraggingLogo(true);
                            }}
                            onDragLeave={() => setIsDraggingLogo(false)}
                            onDrop={(e) => {
                              e.preventDefault();
                              setIsDraggingLogo(false);
                              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                handleLogoFileUpload(e.dataTransfer.files[0]);
                              }
                            }}
                            className={`relative border-2 border-dashed rounded-2xl p-4 transition-all text-center flex flex-col items-center justify-center cursor-pointer ${
                              isDraggingLogo
                                ? 'border-amber-500 bg-amber-500/15 scale-[1.01]'
                                : partnerForm.logoUrl
                                ? 'border-emerald-500/50 bg-emerald-500/5'
                                : 'border-neutral-700/80 bg-neutral-900/50 hover:border-amber-500/60 hover:bg-neutral-900'
                            }`}
                          >
                            <input
                              type="file"
                              accept="image/png,image/*"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleLogoFileUpload(e.target.files[0]);
                                }
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />

                            {partnerForm.logoUrl ? (
                              <div className="flex flex-col sm:flex-row items-center gap-4 w-full z-20">
                                <div className="w-20 h-20 rounded-xl bg-neutral-950 border border-neutral-800 p-2 flex items-center justify-center shrink-0">
                                  <img
                                    src={partnerForm.logoUrl}
                                    alt="Preview Logo Partner"
                                    className="max-h-full max-w-full object-contain rounded"
                                  />
                                </div>
                                <div className="text-left flex-1 min-w-0">
                                  <span className="inline-block text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 mb-1">
                                    Gambar Logo Siap Digunakan
                                  </span>
                                  <p className="text-xs font-medium text-neutral-300 truncate">
                                    {partnerForm.logoUrl.startsWith('data:') ? 'File Gambar PNG Terunggah (Base64)' : partnerForm.logoUrl}
                                  </p>
                                  <p className="text-[10px] text-neutral-500 mt-1">
                                    Seret file PNG baru ke sini atau klik area ini untuk mengganti gambar logo.
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPartnerForm(prev => ({ ...prev, logoUrl: '' }));
                                  }}
                                  className="z-30 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/20 transition-all cursor-pointer shrink-0"
                                >
                                  Hapus Logo
                                </button>
                              </div>
                            ) : (
                              <div className="py-3 flex flex-col items-center gap-2 pointer-events-none">
                                <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                                  <Upload className="h-6 w-6" />
                                </div>
                                <div>
                                  <p className="text-xs font-extrabold text-white">
                                    Seret & Lepas Gambar Logo PNG di Sini
                                  </p>
                                  <p className="text-[11px] text-neutral-400 mt-0.5">
                                    atau <span className="text-amber-400 font-bold underline">Klik di sini untuk memilih file PNG</span> dari komputer/HP Anda
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Fallback URL input option */}
                          <details className="text-[11px] text-neutral-500 pt-1">
                            <summary className="cursor-pointer hover:text-amber-400 font-medium select-none">
                              Atau masukkan URL gambar logo secara manual (opsional)
                            </summary>
                            <input
                              type="text"
                              value={partnerForm.logoUrl}
                              onChange={(e) => setPartnerForm(prev => ({ ...prev, logoUrl: e.target.value }))}
                              placeholder="https://example.com/logo.png"
                              className={`w-full ${theme.input} border rounded-xl px-3 py-1.5 text-xs mt-1.5`}
                            />
                          </details>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
                          {isEditingPartner && (
                            <button
                              type="button"
                              onClick={() => {
                                setPartnerForm({ id: '', name: '', url: '', logoUrl: '' });
                                setIsEditingPartner(false);
                              }}
                              className="px-4 py-2 rounded-xl text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-all cursor-pointer"
                            >
                              Batal
                            </button>
                          )}
                          <button
                            type="submit"
                            className="px-5 py-2 rounded-xl text-xs font-extrabold bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                          >
                            <Save className="h-3.5 w-3.5" />
                            <span>{isEditingPartner ? 'Simpan Perubahan Partner' : 'Tambahkan Partner'}</span>
                          </button>
                        </div>
                      </form>

                      {/* Partner List Grid */}
                      <div className="space-y-3">
                        <h5 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                          Daftar Partner Aktif ({adminPartners.length})
                        </h5>

                        {adminPartners.length === 0 ? (
                          <div className="text-center py-8 border border-dashed border-neutral-800 rounded-2xl text-neutral-500">
                            <p className="text-xs font-bold">Belum ada partner platform terdaftar.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {adminPartners.map((p) => (
                              <div
                                key={p.id}
                                className={`p-4 rounded-2xl border ${theme.innerCard} flex items-center justify-between gap-3 relative group`}
                              >
                                <div className="flex items-center gap-3 overflow-hidden">
                                  <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 p-2 flex items-center justify-center shrink-0">
                                    <img
                                      src={p.logoUrl}
                                      alt={p.name}
                                      className="max-h-full max-w-full object-contain rounded"
                                      onError={(e) => {
                                        (e.target as any).src = 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?auto=format&fit=crop&w=150&q=80';
                                      }}
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <h6 className="text-xs font-extrabold text-white truncate">{p.name}</h6>
                                    <a
                                      href={p.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[10px] text-amber-500 hover:underline truncate block"
                                    >
                                      {p.url}
                                    </a>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    onClick={() => {
                                      setPartnerForm(p);
                                      setIsEditingPartner(true);
                                    }}
                                    className="p-2 rounded-lg bg-neutral-800 hover:bg-amber-500 hover:text-neutral-950 text-neutral-300 transition-all cursor-pointer"
                                    title="Edit Partner"
                                  >
                                    <Edit className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeletePartnerAdmin(p.id, p.name)}
                                    className="p-2 rounded-lg bg-neutral-800 hover:bg-red-600 text-neutral-300 hover:text-white transition-all cursor-pointer"
                                    title="Hapus Partner"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeCmsTab === 'about' && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest font-mono text-amber-500">About Us / Value Proposition CMS</h4>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-neutral-500 uppercase">Sejarah Singkat Perusahaan</label>
                          <textarea rows={4} defaultValue="Didirikan tahun 2020, Smart Journey didedikasikan untuk memberikan standar kenyamanan dan armada premium di Bali..." className={`w-full ${theme.input} border rounded-xl px-3 py-2 text-xs`} />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeCmsTab === 'contact' && (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest font-mono text-amber-500">Global Contact / Footer Info</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-neutral-500 uppercase">Nomor WhatsApp Support Utama</label>
                            <input type="text" defaultValue="+62 852-1234-7289" className={`w-full ${theme.input} border rounded-xl px-3 py-2 text-xs`} />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-neutral-500 uppercase">Alamat Email Korespondensi</label>
                            <input type="email" defaultValue="sawahjayatrans@gmail.com" className={`w-full ${theme.input} border rounded-xl px-3 py-2 text-xs`} />
                          </div>
                        </div>
                      </div>

                      {/* Social Media Settings (IG, TikTok, Rednote, LinkedIn) */}
                      <div className="space-y-4 pt-4 border-t border-neutral-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-widest font-mono text-amber-500">
                              Integrasi Media Sosial Resmi (IG, TikTok, Rednote, LinkedIn)
                            </h4>
                            <p className={`text-[11px] mt-0.5 ${theme.textSecondary}`}>
                              Kelola tautan dan tombol direct media sosial yang tampil di Footer dan Halaman Tentang Kami.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleSaveSocials}
                            className="bg-amber-500 hover:bg-amber-400 text-neutral-950 px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            <Save className="h-3.5 w-3.5" />
                            <span>Simpan Sosmed</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {adminSocials.map((social) => (
                            <div 
                              key={social.id} 
                              className={`p-4 rounded-2xl border ${theme.card} space-y-3 relative overflow-hidden`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black"
                                    style={{ backgroundColor: social.color }}
                                  >
                                    {social.shortName.slice(0, 2)}
                                  </div>
                                  <div>
                                    <span className="text-xs font-bold text-neutral-200 block">{social.name}</span>
                                    <span className="text-[10px] text-neutral-400 font-mono">{social.category}</span>
                                  </div>
                                </div>
                                <a
                                  href={social.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg transition-colors"
                                >
                                  <span>Buka Tautan</span>
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>

                              <div className="space-y-2">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-neutral-400 uppercase">Username / ID Handle</label>
                                  <input
                                    type="text"
                                    value={social.handle}
                                    onChange={(e) => handleUpdateSocial(social.id, 'handle', e.target.value)}
                                    placeholder="e.g. @smartjourney.id"
                                    className={`w-full ${theme.input} border rounded-xl px-3 py-2 text-xs`}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-neutral-400 uppercase">Target URL Direct Link</label>
                                  <input
                                    type="url"
                                    value={social.url}
                                    onChange={(e) => handleUpdateSocial(social.id, 'url', e.target.value)}
                                    placeholder="https://..."
                                    className={`w-full ${theme.input} border rounded-xl px-3 py-2 text-xs font-mono`}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Save CMS Changes */}
                  <div className="pt-4 border-t border-neutral-850 flex justify-end">
                    <button 
                      onClick={() => {
                        handleSaveSocials();
                        triggerToast('Pengaturan CMS & Media Sosial Berhasil Dipublikasikan!');
                      }}
                      className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="h-4 w-4" />
                      <span>Publikasikan Perubahan</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 6. VIEW: SHARE TOUR / OPEN TRIP BACK-OFFICE MODULE */}
            {activeModule === 'sharetour' && (
              <motion.div
                key="sharetour-module"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {shareTourLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
                    <p className={`text-xs font-mono ${theme.textSecondary}`}>Memuat Database Share Tour / Open Trip...</p>
                  </div>
                ) : (
                  <ShareTourAdminDashboard
                    trips={shareTourTrips}
                    batches={shareTourBatches}
                    bookings={shareTourBookings}
                    onRefreshDB={loadShareTourData}
                    onLogout={handleLogout}
                    embedded={true}
                  />
                )}
              </motion.div>
            )}

            {/* 7. VIEW: UNIFIED ALL-CHANNELS BOOKINGS MASTER */}
            {activeModule === 'bookings' && (
              <motion.div
                key="unified-bookings-module"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6 text-left"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-xl font-black tracking-tight font-mono text-amber-500 flex items-center gap-2">
                      <ClipboardList className="h-5 w-5" />
                      <span>MASTER BOOKINGS &amp; ORDERS CONTROL</span>
                    </h2>
                    <p className={`text-xs ${theme.textSecondary}`}>
                      Pusat kendali seluruh transaksi pemesanan lintas saluran: Private Tour, Share Tour, Airport Transfer, Taxi Service, dan Car Rental.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const csvContent = "data:text/csv;charset=utf-8," + 
                          ["ID,Service,Guest Name,Phone,Email,Date,Pax,Amount,Status",
                            ...bookings.map(b => `"${b.id}","${b.type}","${b.guestDetails?.name || ''}","${b.guestDetails?.phone || ''}","${b.guestDetails?.email || ''}","${b.details?.date || b.bookingDate || ''}","${b.details?.passengers || 1}","${b.pricing?.totalPrice || 0}","${b.status}"`),
                            ...shareTourBookings.map(sb => `"${sb.bookingCode}","share-tour","${sb.leadFullName}","${sb.phoneNumber}","${sb.email}","${sb.createdAt}","${sb.participantCount}","${sb.totalAmountIDR}","${sb.status}"`)
                          ].join("\n");
                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", `smartjourney_master_bookings_${new Date().toISOString().slice(0,10)}.csv`);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        triggerToast('Master CSV Bookings berhasil diunduh');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      <Download className="h-4 w-4" />
                      <span>Export Master CSV</span>
                    </button>
                  </div>
                </div>

                {/* KPI Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Pemesanan', count: bookings.length + shareTourBookings.length, icon: ClipboardList, color: 'text-blue-500' },
                    { label: 'Perlu Konfirmasi', count: bookings.filter(b => b.status === 'Pending').length + shareTourBookings.filter(b => b.status === 'Pending').length, icon: AlertTriangle, color: 'text-amber-500' },
                    { label: 'Terkonfirmasi (Aktif)', count: bookings.filter(b => b.status === 'Confirmed').length + shareTourBookings.filter(b => b.status === 'Confirmed').length, icon: CheckCircle2, color: 'text-emerald-500' },
                    { label: 'Selesai Beroperasi', count: bookings.filter(b => b.status === 'Completed').length + shareTourBookings.filter(b => b.status === 'Completed').length, icon: ShieldCheck, color: 'text-purple-500' }
                  ].map((stat, idx) => (
                    <div key={idx} className={`${theme.innerCard} border rounded-2xl p-4 space-y-1`}>
                      <span className={`text-[10px] font-mono font-bold ${theme.textSecondary} uppercase block`}>{stat.label}</span>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-black font-mono">{stat.count}</span>
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Filter & Search Bar */}
                <div className={`${theme.card} border rounded-2xl p-4 space-y-4`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Search Field */}
                    <div className="relative flex-grow max-w-md">
                      <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                      <input
                        type="text"
                        value={bookingSearchQuery}
                        onChange={(e) => setBookingSearchQuery(e.target.value)}
                        placeholder="Cari ID booking, nama tamu, no. telepon, atau email..."
                        className={`w-full ${theme.input} pl-10 pr-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-amber-500`}
                      />
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                      <span className="text-[10px] font-mono text-neutral-500 font-bold uppercase shrink-0">Status:</span>
                      {(['all', 'Confirmed', 'Pending', 'Completed', 'Cancelled'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => setBookingStatusFilter(st)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                            bookingStatusFilter === st
                              ? 'bg-amber-500 text-neutral-950 font-black'
                              : `${theme.innerCard} border text-neutral-400 hover:text-white`
                          }`}
                        >
                          {st === 'all' ? 'Semua' : st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Channel Filter Pills */}
                  <div className="flex items-center gap-2 border-t border-neutral-850 pt-3 overflow-x-auto no-scrollbar">
                    <span className="text-[10px] font-mono text-neutral-500 font-bold uppercase shrink-0">Saluran:</span>
                    {[
                      { id: 'all', label: 'Semua Saluran' },
                      { id: 'tour', label: 'Private Tour' },
                      { id: 'sharetour', label: 'Share Tour / Open Trip' },
                      { id: 'airport', label: 'Airport Transfer' },
                      { id: 'taxi', label: 'Taxi Service' },
                      { id: 'car-rental', label: 'Car Rental' }
                    ].map((ch) => (
                      <button
                        key={ch.id}
                        onClick={() => setBookingChannelFilter(ch.id as any)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                          bookingChannelFilter === ch.id
                            ? 'bg-amber-500/15 border border-amber-500/30 text-amber-500 font-extrabold'
                            : 'text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        {ch.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Master Bookings Table */}
                <div className={`${theme.card} border rounded-2xl overflow-hidden shadow-sm`}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className={`${theme.innerCard} border-b text-[10px] font-mono uppercase text-neutral-400 font-black`}>
                        <tr>
                          <th className="p-3.5">ID / Kode</th>
                          <th className="p-3.5">Layanan</th>
                          <th className="p-3.5">Nama Tamu</th>
                          <th className="p-3.5">Kontak</th>
                          <th className="p-3.5">Tanggal Operasional</th>
                          <th className="p-3.5 text-right">Nilai Transaksi</th>
                          <th className="p-3.5 text-center">Status</th>
                          <th className="p-3.5 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-850">
                        {(() => {
                          // Combine AppContext bookings and ShareTour bookings into unified list
                          const unifiedList = [
                            ...bookings.map(b => ({
                              source: 'main' as const,
                              id: b.id,
                              channel: b.type === 'tour' ? 'Private Tour' : b.type === 'airport' ? 'Airport Transfer' : b.type === 'taxi' ? 'Taxi Service' : b.type === 'car-rental' ? 'Car Rental' : b.type,
                              channelRaw: b.type,
                              guestName: b.guestDetails?.name || 'Anonim',
                              phone: b.guestDetails?.phone || '-',
                              email: b.guestDetails?.email || '-',
                              date: b.details?.date || b.bookingDate,
                              amount: b.pricing?.totalPrice ? formatPrice(b.pricing.totalPrice) : '-',
                              status: b.status,
                              original: b
                            })),
                            ...shareTourBookings.map(sb => ({
                              source: 'sharetour' as const,
                              id: sb.bookingCode,
                              channel: 'Share Tour / Open Trip',
                              channelRaw: 'sharetour',
                              guestName: sb.leadFullName,
                              phone: sb.phoneNumber || '-',
                              email: sb.email || '-',
                              date: sb.createdAt ? new Date(sb.createdAt).toLocaleDateString() : '-',
                              amount: `Rp ${sb.totalAmountIDR?.toLocaleString('id-ID')}`,
                              status: sb.status,
                              original: sb
                            }))
                          ];

                          const filtered = unifiedList.filter(item => {
                            const matchQuery = !bookingSearchQuery || 
                              item.id.toLowerCase().includes(bookingSearchQuery.toLowerCase()) ||
                              item.guestName.toLowerCase().includes(bookingSearchQuery.toLowerCase()) ||
                              item.phone.toLowerCase().includes(bookingSearchQuery.toLowerCase()) ||
                              item.email.toLowerCase().includes(bookingSearchQuery.toLowerCase());
                            
                            const matchStatus = bookingStatusFilter === 'all' || item.status === bookingStatusFilter;
                            
                            const matchChannel = bookingChannelFilter === 'all' || 
                              (bookingChannelFilter === 'tour' && item.channelRaw === 'tour') ||
                              (bookingChannelFilter === 'sharetour' && item.channelRaw === 'sharetour') ||
                              (bookingChannelFilter === 'airport' && item.channelRaw === 'airport') ||
                              (bookingChannelFilter === 'taxi' && item.channelRaw === 'taxi') ||
                              (bookingChannelFilter === 'car-rental' && item.channelRaw === 'car-rental');

                            return matchQuery && matchStatus && matchChannel;
                          });

                          if (filtered.length === 0) {
                            return (
                              <tr>
                                <td colSpan={8} className="p-8 text-center text-neutral-500 font-mono">
                                  Tidak ada data pemesanan yang cocok dengan kriteria filter.
                                </td>
                              </tr>
                            );
                          }

                          return filtered.map((item, idx) => (
                            <tr key={idx} className={`${theme.hover} transition-colors`}>
                              <td className="p-3.5 font-mono font-bold text-amber-500">
                                #{item.id.slice(-8)}
                              </td>
                              <td className="p-3.5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                                  item.channelRaw === 'tour' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                  item.channelRaw === 'sharetour' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                  item.channelRaw === 'airport' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                  item.channelRaw === 'taxi' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                                  'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                }`}>
                                  {item.channel}
                                </span>
                              </td>
                              <td className="p-3.5 font-bold">
                                {item.guestName}
                              </td>
                              <td className="p-3.5 text-[11px] font-mono text-neutral-400">
                                <div>{item.phone}</div>
                                <div className="text-[10px] text-neutral-500">{item.email}</div>
                              </td>
                              <td className="p-3.5 font-mono text-neutral-300">
                                {item.date}
                              </td>
                              <td className="p-3.5 font-mono font-black text-right text-neutral-100">
                                {item.amount}
                              </td>
                              <td className="p-3.5 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase ${
                                  item.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                  (item.status === 'Pending' || item.status === 'Pending Confirmation') ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse' :
                                  item.status === 'Completed' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                  'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                }`}>
                                  {item.status}
                                </span>
                              </td>
                              <td className="p-3.5 text-right space-x-1.5">
                                {item.source === 'main' ? (
                                  <>
                                    {(item.status === 'Pending' || item.status === 'Pending Confirmation') && (
                                      <button
                                        onClick={() => {
                                          updateBookingStatus(item.id, 'Confirmed');
                                          triggerToast(`Booking #${item.id.slice(-6)} telah dikonfirmasi`);
                                        }}
                                        className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-pointer"
                                        title="Konfirmasi Booking"
                                      >
                                        <Check className="h-3.5 w-3.5" />
                                      </button>
                                    )}
                                    {item.status === 'Confirmed' && (
                                      <button
                                        onClick={() => {
                                          updateBookingStatus(item.id, 'Completed');
                                          triggerToast(`Booking #${item.id.slice(-6)} ditandai selesai`);
                                        }}
                                        className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 cursor-pointer"
                                        title="Tandai Selesai"
                                      >
                                        <ShieldCheck className="h-3.5 w-3.5" />
                                      </button>
                                    )}
                                  </>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setActiveModule('sharetour');
                                      triggerToast('Beralih ke Audit Queue Share Tour');
                                    }}
                                    className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 cursor-pointer"
                                    title="Audit di Modul Share Tour"
                                  >
                                    <FileCheck className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 8. VIEW: FINANCIAL & OPERATIONAL REPORTS */}
            {activeModule === 'reports' && (
              <motion.div
                key="reports-analytics-module"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6 text-left"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-xl font-black tracking-tight font-mono text-amber-500 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      <span>FINANCIAL &amp; BUSINESS INTELLIGENCE REPORTS</span>
                    </h2>
                    <p className={`text-xs ${theme.textSecondary}`}>
                      Ringkasan analitik pendapatan kotor, volume penumpang, utilisasi armada, dan buku besar keuangan Smart Journey.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => triggerToast('Laporan PDF Keuangan sedang di-generate...')}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      <Download className="h-4 w-4" />
                      <span>Unduh Laporan Keuangan</span>
                    </button>
                  </div>
                </div>

                {/* Revenue Overview KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className={`${theme.card} border rounded-2xl p-6 space-y-2`}>
                    <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider block">
                      Total Estimasi Omset (Semua Saluran)
                    </span>
                    <div className="text-3xl font-black font-mono text-amber-500">
                      {formatPrice(bookings.reduce((sum, b) => sum + (b.pricing?.totalPrice || 0), 0) + (shareTourBookings.filter(b => b.status === 'Confirmed').reduce((sum, b) => sum + (b.totalAmountIDR || 0), 0) / 15000))}
                    </div>
                    <p className={`text-[11px] ${theme.textSecondary}`}>
                      Akumulasi omset dari Private Tours, Share Tour, Airport Transfer, Taxi, dan Rental.
                    </p>
                  </div>

                  <div className={`${theme.card} border rounded-2xl p-6 space-y-2`}>
                    <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider block">
                      Tingkat Keberhasilan Konfirmasi
                    </span>
                    <div className="text-3xl font-black font-mono text-emerald-400">
                      {(() => {
                        const total = bookings.length + shareTourBookings.length;
                        if (total === 0) return '100%';
                        const confirmed = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Completed').length + shareTourBookings.filter(b => b.status === 'Confirmed' || b.status === 'Completed').length;
                        return `${Math.round((confirmed / total) * 100)}%`;
                      })()}
                    </div>
                    <p className={`text-[11px] ${theme.textSecondary}`}>
                      Persentase booking yang berstatus terkonfirmasi dan berhasil beroperasi.
                    </p>
                  </div>

                  <div className={`${theme.card} border rounded-2xl p-6 space-y-2`}>
                    <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider block">
                      Total Tamu &amp; Penumpang
                    </span>
                    <div className="text-3xl font-black font-mono text-purple-400">
                      {bookings.reduce((sum, b) => sum + (b.details?.passengers || 1), 0) + shareTourBookings.reduce((sum, b) => sum + (b.participantCount || 1), 0)} Pax
                    </div>
                    <p className={`text-[11px] ${theme.textSecondary}`}>
                      Jumlah wisatawan dan pengguna jasa transportasi yang telah dilayani.
                    </p>
                  </div>
                </div>

                {/* Channel Breakdown Breakdown Bars */}
                <div className={`${theme.card} border rounded-2xl p-6 space-y-6`}>
                  <h4 className="text-xs font-black uppercase tracking-widest font-mono text-amber-500 border-b border-neutral-850 pb-3">
                    Distribusi Kontribusi Saluran Bisnis
                  </h4>

                  <div className="space-y-4">
                    {[
                      { name: 'Private Tour Packages', count: bookings.filter(b => b.type === 'tour').length, percent: '45%', color: 'bg-amber-500' },
                      { name: 'Share Tour / Open Trip', count: shareTourBookings.length, percent: '30%', color: 'bg-emerald-500' },
                      { name: 'Airport Transfer (DPS/SUB/YIA/CGK)', count: bookings.filter(b => b.type === 'airport').length, percent: '15%', color: 'bg-blue-500' },
                      { name: 'Car Rental & Charter', count: bookings.filter(b => b.type === 'car-rental').length, percent: '7%', color: 'bg-purple-500' },
                      { name: 'Taxi Direct Service', count: bookings.filter(b => b.type === 'taxi').length, percent: '3%', color: 'bg-indigo-500' }
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-neutral-200">{item.name}</span>
                          <span className="font-mono text-neutral-400">{item.count} Transaksi ({item.percent})</span>
                        </div>
                        <div className="h-2 w-full bg-neutral-850 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color} rounded-full`} style={{ width: item.percent }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 9. VIEW: ACCOUNT PAGE */}
            {activeModule === 'account' && (
              <motion.div 
                key="account-page"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <h2 className="text-xl font-black tracking-tight font-mono text-amber-500">ACCOUNT SETTINGS &amp; PROFILE</h2>
                  <p className={`text-xs ${theme.textSecondary}`}>
                    Kelola profil personal, ganti kata sandi operasional, dan konfigurasi verifikasi keamanan akun.
                  </p>
                </div>

                {/* Sub tabs for Account */}
                <div className="flex gap-2 border-b border-neutral-850 pb-px overflow-x-auto no-scrollbar">
                  {[
                    { id: 'profile', label: 'Profil Saya' },
                    { id: 'password', label: 'Keamanan / Ganti Sandi' },
                    { id: 'logout', label: 'Keluar Sesi' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveAccountTab(tab.id as any);
                        triggerToast(`Tab Akun: ${tab.label}`);
                      }}
                      className={`px-4 py-2 border-b-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        activeAccountTab === tab.id 
                          ? 'border-amber-500 text-amber-500 font-extrabold' 
                          : 'border-transparent text-neutral-400 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Avatar & Security badge */}
                  <div className={`${theme.card} border rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4`}>
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-neutral-950 font-black text-2xl font-mono shadow-xl ring-4 ring-amber-500/10">
                      AD
                    </div>
                    <div>
                      <h4 className="text-base font-black">Super Administrator</h4>
                      <p className={`text-xs ${theme.textSecondary} font-mono`}>sawahjayagroup@gmail.com</p>
                    </div>
                    <span className="text-[10px] font-mono font-black bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full uppercase">
                      ✓ verified staff
                    </span>
                  </div>

                  {/* Right Column: Dynamic Form panels */}
                  <div className={`lg:col-span-2 ${theme.card} border rounded-2xl p-6 space-y-6`}>
                    {activeAccountTab === 'profile' && (
                      <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest font-mono text-amber-500 border-b border-neutral-850 pb-2">
                          Profil Personal Informasi (Mockup)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-800 uppercase">Nama Lengkap Staff</label>
                            <input type="text" defaultValue="Smart Journey Administrator" className={`w-full ${theme.input} border rounded-xl px-3 py-2 text-xs`} />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-800 uppercase">ID Karyawan</label>
                            <input type="text" defaultValue="SJT-2026-904" disabled className={`w-full ${theme.input} border rounded-xl px-3 py-2 text-xs cursor-not-allowed`} />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-800 uppercase">No. Telepon WhatsApp</label>
                            <input type="text" defaultValue="+62 813-1122-3344" className={`w-full ${theme.input} border rounded-xl px-3 py-2 text-xs`} />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-800 uppercase">Divisi Utama</label>
                            <input type="text" defaultValue="Central Operational Hub" disabled className={`w-full ${theme.input} border rounded-xl px-3 py-2 text-xs cursor-not-allowed`} />
                          </div>
                        </div>
                      </div>
                    )}

                    {activeAccountTab === 'password' && (
                      <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest font-mono text-amber-500 border-b border-neutral-850 pb-2">
                          Ubah Kode Sandi Akses Portal
                        </h4>
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-800 uppercase">Sandi Saat Ini</label>
                            <input type="password" placeholder="••••••••" className={`w-full ${theme.input} border rounded-xl px-3 py-2 text-xs`} />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-800 uppercase">Sandi Baru</label>
                            <input type="password" placeholder="••••••••" className={`w-full ${theme.input} border rounded-xl px-3 py-2 text-xs`} />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-800 uppercase">Konfirmasi Sandi Baru</label>
                            <input type="password" placeholder="••••••••" className={`w-full ${theme.input} border rounded-xl px-3 py-2 text-xs`} />
                          </div>
                        </div>
                      </div>
                    )}

                    {activeAccountTab === 'logout' && (
                      <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest font-mono text-amber-500 border-b border-neutral-850 pb-2">
                          Keluar Sesi Portal Admin
                        </h4>
                        <p className={`text-xs ${theme.textSecondary} leading-relaxed`}>
                          Tutup koneksi browser dan amankan portal admin. Sesi cookie dan data state lokal akan di-clear secara aman.
                        </p>
                        <div className="pt-2">
                          <button 
                            onClick={handleLogout}
                            className="px-5 py-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-500 hover:bg-rose-500/25 transition-all font-black text-xs cursor-pointer flex items-center gap-1.5"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Keluar Sekarang</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Footer Save changes trigger */}
                    {activeAccountTab !== 'logout' && (
                      <div className="pt-4 border-t border-neutral-850 flex justify-end">
                        <button 
                          onClick={() => triggerToast('Pengaturan Akun Berhasil Diperbarui (Placeholder)')}
                          className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                        >
                          <Save className="h-4 w-4" />
                          <span>Simpan Profil Akun</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </main>

        {/* --- DYNAMIC METADATA FOOTER --- */}
        <footer className={`border-t ${theme.border} py-4 px-8 flex flex-col md:flex-row justify-between items-center text-[10px] text-neutral-500 font-mono gap-2`}>
          <span>Smart Journey © 2026 • Premium Admin Dashboard Framework</span>
          <div className="flex gap-4">
            <span>Uptime: 99.98%</span>
            <span>API Status: Operational</span>
            <span>Version: v2.0-SaaS-Skeleton</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
