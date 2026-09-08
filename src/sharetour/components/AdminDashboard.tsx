import React, { useState } from "react";
import { Trip, Batch, Booking, ItineraryItem, FAQItem, TimeSchedule } from "../types";
import { formatTourDuration, parseTourDays, parseTourNights } from "../../utils/tourFilterUtils";
import { 
  createTrip, updateTrip, deleteTrip, 
  createBatch, updateBatch, deleteBatch, 
  updateBooking, purgeAllBookings, importBulk
} from "../api";
import { 
  useAutoSaveDraft, 
  AutoSaveStatusBadge, 
  DraftRecoveryBanner 
} from "../../components/admin/AutoSaveDraftComponents";
import { clearDraft } from "../../utils/adminDraftStorage";
import { 
  Users, Calendar, Compass, Check, X, ShieldCheck, 
  Plus, Edit, Trash, Eye, DollarSign, Filter, Search, RotateCcw,
  BookOpen, Sparkles, Image as ImageIcon, MapPin, Clock, ListOrdered, CheckCircle,
  TrendingUp, BarChart2, Briefcase, FileCheck, Layers, HelpCircle, Save, Sliders, Globe, AlertTriangle, Plane, ChevronDown, ChevronUp, ChevronRight, Menu, LogOut, Info, AlertCircle
} from "lucide-react";

interface AdminDashboardProps {
  trips: Trip[];
  batches: Batch[];
  bookings: Booking[];
  onRefreshDB: () => void;
  onLogout: () => void;
  embedded?: boolean;
}

type AdminTab = "analytics" | "verification" | "catalog" | "batches" | "participants" | "excel-import";
type TripFormTab = "basic" | "facilities" | "itinerary" | "media-faq";

export default function AdminDashboard({ trips, batches, bookings, onRefreshDB, onLogout, embedded = false }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("analytics");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [tripFilter, setTripFilter] = useState("All");

  // Selection Logs / Dialogs
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedParticipantForEdit, setSelectedParticipantForEdit] = useState<Booking | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Customer Trip Preview Modal
  const [previewTrip, setPreviewTrip] = useState<Trip | null>(null);

  // Participant Tab Group expansion states (keeps track of expanded batches)
  const [expandedBatches, setExpandedBatches] = useState<{ [key: string]: boolean }>({});

  // Trip Modal & Form States
  const [showTripModal, setShowTripModal] = useState(false);
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [tripFormTab, setTripFormTab] = useState<TripFormTab>("basic");
  const [tripForm, setTripForm] = useState<{
    title: string;
    slug: string;
    location: string;
    duration: string;
    description: string;
    coverImage: string;
    highlight: string;
    startingPrice: number;
    status: "published" | "draft";
    included: string[];
    excluded: string[];
    gallery: string[];
    faq: FAQItem[];
    itinerary: ItineraryItem[];
    whatsToBring?: string[];
  }>({
    title: "",
    slug: "",
    location: "",
    duration: "",
    description: "",
    coverImage: "",
    highlight: "",
    startingPrice: 150,
    status: "draft",
    included: [],
    excluded: [],
    gallery: [],
    faq: [],
    itinerary: [],
    whatsToBring: []
  });

  // Auto-Save Draft for Open Trip Blueprint creation/editing
  const {
    saveStatus: tripSaveStatus,
    lastSaved: tripLastSaved,
    isOnline: tripIsOnline,
    detectedDraft: tripDraft,
    showRecoveryBanner: showTripRecoveryBanner,
    handleRecover: recoverTripDraft,
    handleDiscard: discardTripDraft,
    performSave: performTripSave,
    clearCurrentDraft: clearTripDraft
  } = useAutoSaveDraft<typeof tripForm>({
    type: 'tour',
    subType: 'sharetour',
    targetId: editingTripId || 'new',
    title: tripForm.title || (editingTripId ? 'Edit Open Trip' : 'Open Trip Baru'),
    data: tripForm,
    isEditing: Boolean(editingTripId),
    enabled: showTripModal,
    debounceMs: 750,
    hasUnsavedContent: Boolean(
      tripForm.title?.trim() || 
      tripForm.description?.trim() || 
      tripForm.itinerary?.length > 0 || 
      editingTripId
    ),
    onRecover: (draft) => {
      if (draft.data) {
        setTripForm(draft.data);
      }
    }
  });

  // Local helper states for individual inclusion/exclusion inputs
  const [tempInclusion, setTempInclusion] = useState("");
  const [tempExclusion, setTempExclusion] = useState("");
  const [tempWhatsToBring, setTempWhatsToBring] = useState("");
  const [tempGalleryImage, setTempGalleryImage] = useState("");
  const [tempQA, setTempQA] = useState({ question: "", answer: "" });
  const [selectedItineraryDayIdx, setSelectedItineraryDayIdx] = useState<number>(0);
  const [tempSchedule, setTempSchedule] = useState({ time: "", activity: "" });

  // Batch Form Modal States
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null);
  const [batchForm, setBatchForm] = useState<{
    tripId: string;
    departureDate: string;
    quota: number;
    availableSeats: number;
    price: number;
    status: "Open" | "Closed";
  }>({
    tripId: "",
    departureDate: "",
    quota: 14,
    availableSeats: 14,
    price: 150,
    status: "Open"
  });

  // Participant Fields Profile editor
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  const [participantFields, setParticipantFields] = useState({
    name: "",
    englishName: "",
    weChatId: "",
    xiaoHongShuId: "",
    city: "",
    whatsapp: "",
    email: "",
    flightNumber: ""
  });

  // Excel / CSV Importer States
  const [importTripsText, setImportTripsText] = useState("");
  const [importBatchesText, setImportBatchesText] = useState("");
  const [parsedTrips, setParsedTrips] = useState<Trip[]>([]);
  const [parsedBatches, setParsedBatches] = useState<Batch[]>([]);
  const [importMode, setImportMode] = useState<"append" | "overwrite">("append");
  const [importFeedback, setImportFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeImportSection, setActiveImportSection] = useState<"trips" | "batches">("trips");

  const parseTripsData = (text: string) => {
    if (!text.trim()) {
      setParsedTrips([]);
      return;
    }
    const lines = text.split(/\r?\n/);
    const result: Trip[] = [];
    
    const firstLine = lines[0].toLowerCase();
    const isHeader = firstLine.includes("title") || firstLine.includes("judul") || firstLine.includes("location") || firstLine.includes("durasi") || firstLine.includes("nama");
    const startIndex = isHeader ? 1 : 0;
    
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const tabsCount = (line.match(/\t/g) || []).length;
      const commasCount = (line.match(/,/g) || []).length;
      const semicolonsCount = (line.match(/;/g) || []).length;
      
      let cells: string[] = [];
      if (tabsCount > commasCount && tabsCount > semicolonsCount) {
        cells = line.split("\t");
      } else if (semicolonsCount > commasCount) {
        cells = line.split(";");
      } else {
        cells = line.split(",");
      }
      
      const cleanCells = cells.map(c => {
        let val = c.trim();
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.substring(1, val.length - 1);
        }
        return val;
      });
      
      if (cleanCells.length < 1 || !cleanCells[0]) continue;
      
      const title = cleanCells[0];
      const location = cleanCells[1] || "Banyuwangi & Bromo";
      const duration = cleanCells[2] || "3 Days 2 Nights";
      const description = cleanCells[3] || "Premium Nature Tour Package with local guides";
      const startingPrice = Number(cleanCells[4]) || 150;
      const highlight = cleanCells[5] || "";
      const coverImage = cleanCells[6] || "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1200&q=80";
      
      const parseList = (str: string) => {
        if (!str) return [];
        return str.split(/[;|]/).map(item => item.trim()).filter(Boolean);
      };
      
      const included = parseList(cleanCells[7] || "");
      const excluded = parseList(cleanCells[8] || "");
      
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .split(/\s+/)
        .join("-");
        
      result.push({
        id: "trip-" + Date.now() + "-" + Math.random().toString(36).substring(2, 5),
        title,
        slug,
        location,
        duration,
        description,
        startingPrice,
        highlight,
        coverImage,
        included: included.length > 0 ? included : [
          "AC Tour Transport", 
          "Private Bromo 4x4 Jeep", 
          "Banyuwangi & Bromo hotels", 
          "Mt. Ijen volcano guides"
        ],
        excluded: excluded.length > 0 ? excluded : [
          "Flights & train tickets", 
          "Lunch & dinners", 
          "Personal expenditures"
        ],
        itinerary: [
          { day: 1, title: "Day 1 Arrival & Explorer Check-in", description: "Arrive at Surabaya/Malang Airport and drive to hotel overlook lodge near caldera.", timeSchedules: [{ time: "12:00", activity: "Driver pick up" }] },
          { day: 2, title: "Day 2 Midnight Ascent & Crater Lakes", description: "Hike summit overlook, view magnificent sulfuric blue fires and toxic acid lakes.", timeSchedules: [{ time: "01:00", activity: "Summit trek climb" }] },
          { day: 3, title: "Day 3 Tour Finish & Return Transfer", description: "Breakfast, packing checkout and drop-off to local airport/harbor station.", timeSchedules: [{ time: "11:00", activity: "Hotel check-out" }] }
        ],
        faq: [
          { question: "Is this package suitable for children?", answer: "Yes, standard treks are manageable with appropriate light trail clothing." }
        ],
        gallery: [coverImage],
        status: "published"
      });
    }
    
    setParsedTrips(result);
  };

  const parseBatchesData = (text: string) => {
    if (!text.trim()) {
      setParsedBatches([]);
      return;
    }
    const lines = text.split(/\r?\n/);
    const result: Batch[] = [];
    
    const firstLine = lines[0].toLowerCase();
    const isHeader = firstLine.includes("trip") || firstLine.includes("destination") || firstLine.includes("date") || firstLine.includes("quota");
    const startIndex = isHeader ? 1 : 0;
    
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const tabsCount = (line.match(/\t/g) || []).length;
      const commasCount = (line.match(/,/g) || []).length;
      const semicolonsCount = (line.match(/;/g) || []).length;
      
      let cells: string[] = [];
      if (tabsCount > commasCount && tabsCount > semicolonsCount) {
        cells = line.split("\t");
      } else if (semicolonsCount > commasCount) {
        cells = line.split(";");
      } else {
        cells = line.split(",");
      }
      
      const cleanCells = cells.map(c => {
        let val = c.trim();
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.substring(1, val.length - 1);
        }
        return val;
      });
      
      if (cleanCells.length < 2 || !cleanCells[0]) continue;
      
      const tripTitleLower = cleanCells[0].toLowerCase();
      
      // Match from newly parsed trips OR existing database blueprints
      let matchedTrip = parsedTrips.find(t => t.title.toLowerCase().includes(tripTitleLower));
      if (!matchedTrip) {
        matchedTrip = trips.find(t => t.title.toLowerCase().includes(tripTitleLower));
      }
      
      // Generate a temporary linking code if we can't match it directly,
      // which we will resolve relative to the auto-link titles
      const tripId = matchedTrip ? matchedTrip.id : (`pending-link-${cleanCells[0]}`);
      const departureDate = cleanCells[1] || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split("T")[0];
      const quota = Number(cleanCells[2]) || 14;
      const price = Number(cleanCells[3]) || (matchedTrip ? matchedTrip.startingPrice : 150);
      const status: "Open" | "Closed" = (cleanCells[4] || "Open").toLowerCase().includes("clos") ? "Closed" : "Open";
      
      result.push({
        id: "batch-" + Date.now() + "-" + Math.random().toString(36).substring(2, 5),
        tripId,
        departureDate,
        quota,
        availableSeats: quota,
        price,
        status
      });
    }
    
    setParsedBatches(result);
  };

  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "trips" | "batches") => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (type === "trips") {
        setImportTripsText(content);
        parseTripsData(content);
      } else {
        setImportBatchesText(content);
        parseBatchesData(content);
      }
    };
    reader.readAsText(file);
  };

  const handlePublishBulkImport = async () => {
    if (parsedTrips.length === 0 && parsedBatches.length === 0) {
      setImportFeedback({ type: "error", text: "Please paste or upload some spreadsheet rows first to preview." });
      return;
    }
    
    try {
      // Clean trip references inside parsed batches to point to the correct generated trip IDs
      const mappedBatches = parsedBatches.map(batch => {
        if (batch.tripId.startsWith("pending-link-")) {
          const rawTitle = batch.tripId.replace("pending-link-", "").toLowerCase();
          // Find if we just created this trip blueprint in this import session
          const newlyCreatedTrip = parsedTrips.find(t => t.title.toLowerCase().includes(rawTitle));
          if (newlyCreatedTrip) {
            return { ...batch, tripId: newlyCreatedTrip.id };
          }
          // fallback to a default trip or the first active trip
          const firstDbTrip = trips.find(t => t.title.toLowerCase().includes(rawTitle));
          if (firstDbTrip) {
            return { ...batch, tripId: firstDbTrip.id };
          }
          if (trips.length > 0) {
            return { ...batch, tripId: trips[0].id };
          }
        }
        return batch;
      });

      const payload = {
        trips: parsedTrips,
        batches: mappedBatches,
        mode: importMode
      };

      const res = await importBulk(payload);
      if (res.success) {
        setImportFeedback({ 
          type: "success", 
          text: `Success! Successfully imported ${parsedTrips.length} Trip Blueprints and ${parsedBatches.length} Departure Batches utilizing ${importMode === "overwrite" ? "Overwrite" : "Append"} configuration.` 
        });
        
        // Clear forms
        setImportTripsText("");
        setImportBatchesText("");
        setParsedTrips([]);
        setParsedBatches([]);
        
        // Reload global database
        onRefreshDB();
      }
    } catch (err: any) {
      console.error(err);
      setImportFeedback({ type: "error", text: "Database Bulk Import Failed: " + err.message });
    }
  };

  const handleInsertSampleTrips = () => {
    const sample = `Title\tLocation\tDuration\tDescription\tStarting Price\tHighlight\tCover Image URL\tIncluded\tExcluded
Bromo Milky Way Photography\tEast Java (Bromo Tengger)\t2 Days 1 Night\tCapture the stunning core of the galactic center sitting over Mount Bromo crater rim.\t185\tPrivate midnight astrophotography guides & top caldera overlook\thttps://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format\tAstro Guide|Caldera Lodge|4x4 Jeep\tFlights|Warm heavy coats
Sunset Lovina & Dolphin Cruise\tNorth Bali (Lovina Beach)\t3 Days 2 Nights\tWatch authentic spinner wild dolphin herds jump at dawn in traditional outrigger boats.\t195\tScenic waterfall swims and direct morning ocean cruise departures\thttps://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format\tDolphin boat|English guide|Beach Resort\tFerry tickets|Individual tip gratuity`;
    setImportTripsText(sample);
    parseTripsData(sample);
  };

  const handleInsertSampleBatches = () => {
    const sample = `Trip Title\tDeparture Date\tQuota\tPrice\tStatus
Bromo Milky Way Photography\t2026-07-15\t14\t185\tOpen
Sunset Lovina & Dolphin Cruise\t2026-08-01\t10\t195\tOpen`;
    setImportBatchesText(sample);
    setTimeout(() => {
      parseBatchesData(sample);
    }, 50);
  };

  // Utilities`;
  const formatUSD = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(num);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? dateStr : date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  // Switch tabs helper (prevents layout jumping)
  const switchTab = (tab: AdminTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Auto Slugging helper
  const handleTitleChangeForSlug = (title: string) => {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .split(/\s+/)
      .join("-");
    setTripForm(prev => ({ ...prev, title, slug }));
  };

  // Verification operations
  const handleApprove = async (id: string) => {
    try {
      await updateBooking(id, { status: "Confirmed", rejectReason: "" });
      onRefreshDB();
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking(prev => prev ? { ...prev, status: "Confirmed", rejectReason: "" } : null);
      }
    } catch (e: any) {
      alert("Error confirming booking proof: " + e.message);
    }
  };

  const handleOpenReject = (id: string) => {
    setRejectReason("");
    setShowRejectDialog(id);
  };

  const submitReject = async () => {
    if (!showRejectDialog) return;
    if (!rejectReason.trim()) {
      alert("Provide a clear reason for the decline feedback");
      return;
    }
    try {
      await updateBooking(showRejectDialog, { status: "Rejected", rejectReason: rejectReason.trim() });
      setShowRejectDialog(null);
      onRefreshDB();
      if (selectedBooking && selectedBooking.id === showRejectDialog) {
        setSelectedBooking(prev => prev ? { ...prev, status: "Rejected", rejectReason: rejectReason.trim() } : null);
      }
    } catch (e: any) {
      alert("Operation failed: " + e.message);
    }
  };

  const handlePurgeAllBookings = async () => {
    const confirmText = "APAKAH ANDA YAKIN INGIN MENGHAPUS SEMUA DATA DI DATABASE BOOKING?\n\nTindakan ini bersifat PERMANEN! Semua data booking uji coba / contoh akan dibersihkan, dan sisa kursi (quota) untuk semua keberangkatan akan di-reset penuh.";
    if (!window.confirm(confirmText)) return;
    
    const verifyWord = window.prompt("Ketik 'HAPUS' (huruf besar semua) untuk mengonfirmasi pembersihan total sistem:");
    if (verifyWord !== "HAPUS") {
      alert("Batal menghapus. Konfirmasi tidak sesuai.");
      return;
    }
    
    try {
      await purgeAllBookings();
      alert("Sukses! Seluruh data booking contoh telah dihapus secara permanen. Database sekarang dalam keadaan BERSIH (0 booking) dan siap diisi oleh peserta perjalanan riil Anda.");
      onRefreshDB();
      setSelectedBooking(null);
    } catch (e: any) {
      alert("Gagal membersihkan data: " + e.message);
    }
  };

  // TRIP Blueprints Operations
  const initCreateTrip = () => {
    setEditingTripId(null);
    setTripFormTab("basic");
    setTripForm({
      title: "",
      slug: "",
      location: "",
      duration: "3 Days / 2 Nights",
      days: 3,
      nights: 2,
      category: "Adventure" as any,
      experienceCategory: "Adventure" as any,
      description: "",
      coverImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format",
      highlight: "",
      startingPrice: 150,
      wniPrice: 1800000,
      status: "draft",
      included: [
        "Sailing boat / Liveaboard usage for selected itinerary",
        "Required conservation tax and harbor clearance gates fee",
        "Expert local divemaster & wildlife park ranger guide",
        "Three wholesome meals catered daily with mineral drinks"
      ],
      excluded: [
        "International flight ticket to and from destinations",
        "Personal medical / diving protection insurance policy",
        "Optional souvenirs, upgrades, and local crew tip gratuity"
      ],
      gallery: [],
      faq: [
        { question: "What is the recommended baggage load?", answer: "We advise soft backpack luggage up to a maximum of 15kg due to boat spatial slots." }
      ],
      itinerary: [
        { 
          day: 1, 
          title: "Coastal Welcome & Sunset Cruise", 
          description: "Greeting at local terminal, checking in to premium cabin suite, and setting course to explore Kelor Island viewpoint.",
          timeSchedules: [
            { time: "09:00", activity: "Airport / Hotel pickup session and shuttle transfer" },
            { time: "14:00", activity: "Trek to Kelor Hill and capture panoramic sunset vistas" }
          ]
        }
      ],
      whatsToBring: [
        "Sandal / Sepatu Trekking (Comfortable Trekking Shoes)",
        "Pakaian Ganti & Baju Renang (Swimwear & Extra Clothes)",
        "Kacamata Hitam, Topi, & Sunscreen (Sun protection items)",
        "Obat-obatan Pribadi (Personal medicines & motion sickness pills)",
        "Kamera / Drone / HP dengan kantong tahan air (Waterproof dry bag & cameras)"
      ]
    });
    setSelectedItineraryDayIdx(0);
    setShowTripModal(true);
  };

  const initEditTrip = (t: Trip) => {
    setEditingTripId(t.id);
    setTripFormTab("basic");
    const tDays = t.days || parseTourDays(t as any);
    const tNights = typeof t.nights === 'number' ? t.nights : parseTourNights(t as any);
    const tCat = t.category || t.experienceCategory || "Adventure";
    setTripForm({
      title: t.title,
      slug: t.slug,
      location: t.location,
      duration: t.duration || formatTourDuration(tDays, tNights),
      days: tDays,
      nights: tNights,
      category: tCat,
      experienceCategory: tCat,
      description: t.description,
      coverImage: t.coverImage,
      highlight: t.highlight || "",
      startingPrice: t.startingPrice || 150,
      wniPrice: t.wniPrice || ((t.startingPrice || 150) * 16000),
      status: t.status || "published",
      included: [...t.included],
      excluded: [...t.excluded],
      gallery: t.gallery ? [...t.gallery] : [],
      faq: t.faq ? [...t.faq] : [],
      whatsToBring: t.whatsToBring ? [...t.whatsToBring] : [],
      itinerary: t.itinerary ? t.itinerary.map(item => ({
        day: item.day,
        title: item.title,
        description: item.description || (item as any).activity || "",
        timeSchedules: item.timeSchedules ? [...item.timeSchedules] : []
      })) : []
    });
    setSelectedItineraryDayIdx(0);
    setShowTripModal(true);
  };

  const saveTrip = async () => {
    if (!tripForm.title || !tripForm.slug || !tripForm.description) {
      alert("Title, Slug path, and full Description are mandatory fields.");
      return;
    }
    try {
      const tourDays = Number(tripForm.days) || 1;
      const tourNights = typeof tripForm.nights !== 'undefined' ? Number(tripForm.nights) : Math.max(0, tourDays - 1);
      const computedDuration = formatTourDuration(tourDays, tourNights);
      const category = (tripForm as any).category || (tripForm as any).experienceCategory || "Adventure";

      const payload: Omit<Trip, "id"> = { 
        ...tripForm, 
        days: tourDays,
        nights: tourNights,
        duration: computedDuration,
        category: category as any,
        experienceCategory: category as any,
        startingPrice: Number(tripForm.startingPrice),
        wniPrice: Number((tripForm as any).wniPrice) || (Number(tripForm.startingPrice) * 16000)
      };
      if (editingTripId) {
        await updateTrip(editingTripId, payload);
      } else {
        await createTrip(payload);
      }
      clearTripDraft();
      setShowTripModal(false);
      onRefreshDB();
    } catch (e: any) {
      alert("Error saving: " + e.message);
    }
  };

  const handleDeleteTrip = async (id: string) => {
    if (confirm("Delete this trip? Registrations tied to associated batches will become read-only.")) {
      try {
        await deleteTrip(id);
        onRefreshDB();
      } catch (e: any) {
        alert("Delete failed: " + e.message);
      }
    }
  };

  // Itinerary form array assistants
  const addItineraryDay = () => {
    const nextDay = tripForm.itinerary.length + 1;
    const newDay: ItineraryItem = {
      day: nextDay,
      title: `Day ${nextDay} Itinerary`,
      description: "",
      timeSchedules: []
    };
    setTripForm(prev => ({ ...prev, itinerary: [...prev.itinerary, newDay] }));
    setSelectedItineraryDayIdx(tripForm.itinerary.length);
  };

  const removeItineraryDay = (idx: number) => {
    const fresh = tripForm.itinerary.filter((_, i) => i !== idx).map((day, ix) => ({ ...day, day: ix + 1 }));
    setTripForm(prev => ({ ...prev, itinerary: fresh }));
    setSelectedItineraryDayIdx(0);
  };

  const moveItineraryDayUp = (idx: number) => {
    if (idx === 0) return;
    const fresh = [...tripForm.itinerary];
    const temp = fresh[idx];
    fresh[idx] = fresh[idx - 1];
    fresh[idx - 1] = temp;
    
    const mapped = fresh.map((day, ix) => ({ ...day, day: ix + 1 }));
    setTripForm(prev => ({ ...prev, itinerary: mapped }));
    setSelectedItineraryDayIdx(idx - 1);
  };

  const moveItineraryDayDown = (idx: number) => {
    if (idx === tripForm.itinerary.length - 1) return;
    const fresh = [...tripForm.itinerary];
    const temp = fresh[idx];
    fresh[idx] = fresh[idx + 1];
    fresh[idx + 1] = temp;
    
    const mapped = fresh.map((day, ix) => ({ ...day, day: ix + 1 }));
    setTripForm(prev => ({ ...prev, itinerary: mapped }));
    setSelectedItineraryDayIdx(idx + 1);
  };

  const addTimeItem = () => {
    if (!tempSchedule.time || !tempSchedule.activity) {
      alert("Type a specific time (e.g., 08:30) and activity.");
      return;
    }
    const freshIt = [...tripForm.itinerary];
    if (!freshIt[selectedItineraryDayIdx].timeSchedules) {
      freshIt[selectedItineraryDayIdx].timeSchedules = [];
    }
    freshIt[selectedItineraryDayIdx].timeSchedules.push({ ...tempSchedule });
    setTripForm(prev => ({ ...prev, itinerary: freshIt }));
    setTempSchedule({ time: "", activity: "" });
  };

  // Departure seat batches operations
  const initCreateBatch = () => {
    setEditingBatchId(null);
    setBatchForm({
      tripId: trips[0]?.id || "",
      departureDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split("T")[0],
      quota: 14,
      availableSeats: 14,
      price: trips[0]?.startingPrice || 150,
      status: "Open"
    });
    setShowBatchModal(true);
  };

  const initEditBatch = (b: Batch) => {
    setEditingBatchId(b.id);
    setBatchForm({
      tripId: b.tripId,
      departureDate: b.departureDate,
      quota: b.quota,
      availableSeats: b.availableSeats,
      price: b.price,
      status: b.status
    });
    setShowBatchModal(true);
  };

  const saveBatch = async () => {
    if (!batchForm.tripId || !batchForm.departureDate) {
      alert("Must map a specific trip package and departure calendar date.");
      return;
    }
    if (batchForm.quota > 14) {
      alert("Quota is restricted to a maximum of 14 travelers per batch (Maks 14 peserta) to ensure safety standards.");
      return;
    }
    try {
      const payload = {
        ...batchForm,
        quota: Number(batchForm.quota),
        availableSeats: editingBatchId ? Number(batchForm.availableSeats) : Number(batchForm.quota),
        price: Number(batchForm.price)
      };
      if (editingBatchId) {
        await updateBatch(editingBatchId, payload);
      } else {
        await createBatch(payload);
      }
      setShowBatchModal(false);
      onRefreshDB();
    } catch (e: any) {
      alert("Operation failed: " + e.message);
    }
  };

  const handleDeleteBatch = async (id: string) => {
    if (confirm("Delete this scheduled departure batch?")) {
      try {
        await deleteBatch(id);
        onRefreshDB();
      } catch (e: any) {
        alert("Operation aborted: " + e.message);
      }
    }
  };

  // Participant edit profile modal
  const handleEditParticipant = (b: Booking) => {
    setSelectedParticipantForEdit(b);
    setParticipantFields({
      name: b.participantData?.name || b.fullName || "",
      englishName: b.participantData?.englishName || b.fullName || "",
      weChatId: b.participantData?.weChatId || "",
      xiaoHongShuId: b.participantData?.xiaoHongShuId || "",
      city: b.participantData?.city || "",
      whatsapp: b.participantData?.whatsapp || b.phone || "",
      email: b.participantData?.email || b.email || "",
      flightNumber: b.participantData?.flightNumber || ""
    });
    setShowParticipantModal(true);
  };

  const saveParticipantProfile = async () => {
    if (!selectedParticipantForEdit) return;
    try {
      await updateBooking(selectedParticipantForEdit.id, {
        fullName: participantFields.name,
        email: participantFields.email,
        phone: participantFields.whatsapp,
        participantData: { ...participantFields }
      });
      setShowParticipantModal(false);
      onRefreshDB();
    } catch (e: any) {
      alert("Update failed: " + e.message);
    }
  };

  // Filters calculation
  const searchLower = searchQuery.toLowerCase().trim();
  const verifiedBookings = bookings.filter(b => {
    const matchSearch = !searchLower || 
      b.fullName.toLowerCase().includes(searchLower) ||
      b.bookingCode.toLowerCase().includes(searchLower) ||
      b.email.toLowerCase().includes(searchLower);
    
    const matchStatus = statusFilter === "All" || b.status === statusFilter;
    const matchTrip = tripFilter === "All" || b.tripId === tripFilter;

    return matchSearch && matchStatus && matchTrip;
  });

  // Analytics Computation (Real dashboard variables)
  const approvedBookings = bookings.filter(b => b.status === "Confirmed");
  const pendingBookings = bookings.filter(b => b.status === "Pending");
  const totalRevenue = approvedBookings.reduce((sum, current) => sum + current.totalPrice, 0);
  const confirmedPaxCount = approvedBookings.reduce((p, c) => p + c.participantsCount, 0);

  // Group bookings by batch for the "grouped participants" tab view
  // Generates groups for non-rejected bookings
  const batchParticipantsGroup: { [batchId: string]: Booking[] } = {};
  bookings.filter(b => b.status !== "Rejected").forEach(b => {
    if (!batchParticipantsGroup[b.batchId]) {
      batchParticipantsGroup[b.batchId] = [];
    }
    batchParticipantsGroup[b.batchId].push(b);
  });

  return (
    <div className={embedded ? "w-full space-y-6" : "flex flex-col lg:flex-row min-h-screen bg-[#F8FAFC] text-slate-800"} id="smart-journey-dashboard-wrapper">
      
      {/* If embedded in main admin shell, render sleek top tab pills */}
      {embedded ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-sm flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "analytics", label: "Analytics & KPI", icon: BarChart2 },
              { id: "verification", label: `Audit Queue (${pendingBookings.length})`, icon: FileCheck, badge: pendingBookings.length > 0 },
              { id: "catalog", label: "Trip Blueprints", icon: Compass },
              { id: "batches", label: "Departure Calendar", icon: Calendar },
              { id: "participants", label: "Grouped Customers", icon: Users },
              { id: "excel-import", label: "Excel / CSV Importer", icon: Layers }
            ].map(item => {
              const IconComponent = item.icon;
              const isSelected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => switchTab(item.id as AdminTab)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-display font-bold transition-all cursor-pointer ${
                    isSelected 
                      ? "bg-amber-500 text-neutral-950 font-black shadow-sm" 
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <IconComponent className={`w-3.5 h-3.5 ${isSelected ? "text-neutral-950" : "text-slate-500"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-2">
            <button 
              onClick={() => { onRefreshDB(); }}
              className="p-2 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold inline-flex items-center space-x-1.5 transition text-slate-700 cursor-pointer"
              title="Refresh database state"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Sync Cloud</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* SIDEBAR NAVIGATION (Desktop: Persistent list, Mobile: Slide overlay) */}
          <aside className={`fixed inset-y-0 left-0 bg-emerald-950 text-slate-100 w-72 p-6 flex flex-col z-40 transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen lg:flex-1-0 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`} id="admin-dashboard-sidebar">
            <div className="flex items-center justify-between pb-8 border-b border-emerald-900">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-900 rounded-lg text-[#D6B16D]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="font-display font-extrabold text-sm tracking-widest text-[#D6B16D] uppercase">Smart Journey</h1>
                  <p className="text-[10px] font-mono text-emerald-300 tracking-wider">ADMIN DECISION HUB</p>
                </div>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden p-1 bg-emerald-900 rounded-md text-emerald-100 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="mt-8 space-y-1.5 flex-1">
              {[
                { id: "analytics", label: "Dashboard Analytics", icon: BarChart2 },
                { id: "verification", label: `Audit Queue (${pendingBookings.length})`, icon: FileCheck },
                { id: "catalog", label: "Trip Blueprints", icon: Compass },
                { id: "batches", label: "Departure Calendar", icon: Calendar },
                { id: "participants", label: "Grouped Customers", icon: Users },
                { id: "excel-import", label: "Excel / CSV Importer", icon: Layers }
              ].map(item => {
                const IconComponent = item.icon;
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => switchTab(item.id as AdminTab)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-display font-bold transition-all ${
                      isSelected 
                        ? "bg-[#D6B16D] text-emerald-950 shadow-md font-bold" 
                        : "text-emerald-150 hover:bg-emerald-900/50 hover:text-white"
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 ${isSelected ? "text-emerald-950" : "text-emerald-400"}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="pt-6 border-t border-emerald-900 space-y-3 mt-auto">
              <div className="bg-emerald-900/40 p-3.5 rounded-2xl border border-emerald-900/60 flex items-center space-x-3">
                <div className="w-7 h-7 bg-emerald-800 text-teal-100 rounded-full flex items-center justify-center font-bold text-xs uppercase shadow-sm">SM</div>
                <div className="truncate">
                  <span className="text-[10px] font-mono text-emerald-400 block uppercase font-bold">Authorized Session</span>
                  <p className="text-xs font-bold text-slate-100 truncate">sawahjayagroup@gmail.com</p>
                </div>
              </div>
              <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center space-x-2 bg-rose-950 hover:bg-rose-900 py-2.5 rounded-xl text-xs font-display font-bold text-rose-300 transition-all cursor-pointer border border-rose-900/30"
              >
                <LogOut className="w-4 h-4" />
                <span>Terminate Session</span>
              </button>
            </div>
          </aside>

          {/* MOBILE TRIGGER NAV BAR */}
          <div className="lg:hidden bg-emerald-950 text-slate-100 p-4 shrink-0 flex items-center justify-between border-b border-emerald-900">
            <div className="flex items-center space-x-2.5">
              <div id="logo-icon-mob" className="p-1.5 bg-emerald-900 rounded-lg text-[#D6B16D]"><Sparkles className="w-4 h-4" /></div>
              <div>
                <h1 className="font-display font-bold tracking-widest text-[#D6B16D] text-xs uppercase">Smart Journey</h1>
                <p className="text-[9px] text-emerald-300 font-mono">Mobile Admin Portal</p>
              </div>
            </div>
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 bg-emerald-900 rounded-xl text-emerald-200 hover:text-white transition duration-200"
              id="mob-hamburger-drawer-btn"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </>
      )}

      {/* CONTENT RUNTIME AREA */}
      <main className={embedded ? "w-full space-y-6" : "flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 max-h-screen"}>
        
        {/* SUBHEADER INDICATORS BAR */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5 mb-8 gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-extrabold">Smart Journey Open Trips v1.2</span>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-display font-black tracking-tight text-slate-900">
                {activeTab === "analytics" && "Analytical Performance Metrics"}
                {activeTab === "verification" && "Verification & Audit Desk"}
                {activeTab === "catalog" && "Interactive Blueprints catalog"}
                {activeTab === "batches" && "Departure Seating Schedule"}
                {activeTab === "participants" && "Batch Grouped Attendees"}
                {activeTab === "excel-import" && "Bulk Excel / CSV Spreadsheets Importer"}
              </h2>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => { onRefreshDB(); }}
              className="p-2 py-2 px-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold inline-flex items-center space-x-2 transition duration-200 text-slate-700 cursor-pointer shadow-sm"
              title="Refresh database state"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Sync Cloud</span>
            </button>
          </div>
        </header>

        {/* ----------------- TAB A: ANALYTICS CORE DASHBOARD ----------------- */}
        {activeTab === "analytics" && (
          <div className="space-y-8 animate-fade-in" id="analytics-tab">
            
            {/* KPI MATRIX */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { label: "Gross Net Bookings", value: formatUSD(totalRevenue), desc: "Guaranteed & Confirmed revenue", icon: DollarSign, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
                { label: "Approved Travelers", value: `${confirmedPaxCount} Pax`, desc: "Total seats checked out & secure", icon: Users, color: "text-blue-600 bg-blue-50 border-blue-100" },
                { label: "Attention Needed", value: `${pendingBookings.length} Audits`, desc: "Vouchers awaiting validation", icon: AlertCircle, color: pendingBookings.length > 0 ? "text-amber-600 bg-amber-50 border-amber-100 animate-pulse" : "text-slate-400 bg-slate-50 border-slate-100" },
                { label: "Tours Listed", value: `${trips.length} Blueprints`, desc: "Total active packages registered", icon: Compass, color: "text-indigo-600 bg-indigo-50 border-indigo-100" }
              ].map((card, i) => {
                const Icon = card.icon;
                return (
                  <div key={i} className={`p-5 bg-white border rounded-3xl flex items-center justify-between shadow-sm transition hover:-translate-y-1 ${card.color}`}>
                    <div className="space-y-1 max-w-[70%]">
                      <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-slate-400 block">{card.label}</span>
                      <p className="text-xl font-display font-black text-slate-900">{card.value}</p>
                      <span className="text-[10px] text-slate-500 block truncate">{card.desc}</span>
                    </div>
                    <div className="p-3 bg-white/80 rounded-2xl border border-inherit">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* VISUAL CHARTS & GRAPHS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Occupied Seats progress listing bar */}
              <div className="bg-white border border-slate-150 p-6 rounded-3xl lg:col-span-2 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-display font-extrabold text-slate-900 text-sm">Departure Occupancy Progress Monitor</h3>
                    <p className="text-[10px] text-slate-400">Targeting up to maximum 14 travelers per batch limits</p>
                  </div>
                  <span className="p-1 px-2.5 bg-emerald-50 text-emerald-800 font-mono text-[9px] font-black rounded-lg">LIVE SLOTS</span>
                </div>

                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  {batches.map(b => {
                    const trip = trips.find(t => t.id === b.tripId);
                    const filled = b.quota - b.availableSeats;
                    const fillPercent = Math.min(100, Math.round((filled / b.quota) * 100));
                    return (
                      <div key={b.id} className="space-y-1.5 p-3 rounded-2xl bg-slate-50/50 border border-slate-100">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-display font-bold text-slate-800 truncate max-w-[190px]">{trip?.title || "Special Program"}</span>
                          <span className="font-mono text-slate-450">{formatDate(b.departureDate)}</span>
                        </div>
                        <div className="flex items-center space-x-3 text-xs">
                          <div className="flex-1 bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                fillPercent >= 80 ? "bg-rose-500" : fillPercent >= 50 ? "bg-[#D6B16D]" : "bg-emerald-600"
                              }`}
                              style={{ width: `${fillPercent}%` }}
                            />
                          </div>
                          <span className="font-mono font-bold shrink-0">{filled} / {b.quota} Pax ({fillPercent}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status breakdown visual panel */}
              <div className="bg-white border border-slate-150 p-6 rounded-3xl shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-display font-extrabold text-slate-900 text-sm pb-1">Voucher Status Audit Breakdown</h3>
                  <p className="text-[10px] text-slate-400">Total processed vs pending bookings queue</p>
                </div>
                
                <div className="flex items-center justify-center py-4 relative">
                  <div className="w-24 h-24 rounded-full border-8 border-slate-100 flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-2xl font-black text-slate-900">{bookings.length}</span>
                      <p className="text-[8px] text-slate-400 uppercase font-mono tracking-widest font-black">All Bookings</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  {[
                    { label: "Approved (Seat Guaranteed)", count: approvedBookings.length, pct: bookings.length ? Math.round((approvedBookings.length / bookings.length) * 100) : 0, color: "bg-emerald-600" },
                    { label: "Awaiting (Pending Verification)", count: pendingBookings.length, pct: bookings.length ? Math.round((pendingBookings.length / bookings.length) * 100) : 0, color: "bg-amber-400" },
                    { label: "Rejected (Audit Failures)", count: bookings.filter(b => b.status === "Rejected").length, pct: bookings.length ? Math.round((bookings.filter(b => b.status === "Rejected").length / bookings.length) * 100) : 0, color: "bg-rose-500" }
                  ].map((st, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center space-x-2 max-w-[70%]">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${st.color}`} />
                        <span className="text-slate-650 truncate font-medium text-[11px]">{st.label}</span>
                      </div>
                      <span className="font-mono font-bold font-black text-slate-900 text-[11px]">{st.count} ({st.pct}%)</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* DIRECT BOOKING INGRESS STATS */}
            <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm space-y-4">
              <div>
                <h3 className="font-display font-extrabold text-slate-900 text-sm">Recent Activity Stream</h3>
                <p className="text-[10px] text-slate-400">Real-time incoming traveler registrations and auditing actions</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400">
                      <th className="py-2 pb-3 uppercase font-mono tracking-wider font-extrabold text-[10px]">Reference</th>
                      <th className="py-2 pb-3 uppercase font-mono tracking-wider font-extrabold text-[10px]">Buyer Profile</th>
                      <th className="py-2 pb-3 uppercase font-mono tracking-wider font-extrabold text-[10px]">Travel Destination</th>
                      <th className="py-2 pb-3 uppercase font-mono tracking-wider font-extrabold text-[10px]">Subtotal Transacted</th>
                      <th className="py-2 pb-3 uppercase font-mono tracking-wider font-extrabold text-[10px]">Status Check</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {bookings.slice(0, 5).map(b => (
                      <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 font-mono font-extrabold text-emerald-800">{b.bookingCode}</td>
                        <td className="py-3">
                          <span className="font-bold text-slate-900 block">{b.fullName}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">{b.email}</span>
                        </td>
                        <td className="py-3 font-semibold text-slate-700">{b.tripTitle || "Open Loop Package"}</td>
                        <td className="py-3 font-mono font-bold text-slate-900">{formatUSD(b.totalPrice)}</td>
                        <td className="py-3">
                          {b.status === "Pending" && <span className="p-1 px-2.5 bg-amber-50 text-amber-700 font-bold border border-amber-250/20 rounded-full text-[9px]">Awaiting</span>}
                          {b.status === "Confirmed" && <span className="p-1 px-2.5 bg-emerald-50 text-emerald-700 font-bold border border-emerald-250/20 rounded-full text-[9px]">Confirmed</span>}
                          {b.status === "Rejected" && <span className="p-1 px-2.5 bg-rose-50 text-rose-700 font-bold border border-rose-250/20 rounded-full text-[9px]">Declined</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ----------------- TAB B: AUDIT & VERIFICATION QUEUE ----------------- */}
        {activeTab === "verification" && (
          <div className="space-y-6 animate-fade-in" id="verification-tab">
            
            {/* GO-LIVE READY BANNER & SYSTEM RESET */}
            <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-3xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-md border border-slate-800">
              <div className="flex items-start space-x-3.5">
                <div className="p-2.5 bg-amber-500/10 rounded-2xl text-amber-500 mt-1 flex-shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-white text-sm">Go-Live & Sistem Pembersihan Database</h3>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed max-w-2xl">
                    Gunakan panel ini sebelum meluncurkan formulir pendaftaran secara luas. Panel ini dikonfigurasi khusus untuk membantu Anda menghapus semua data pendaftaran uji coba/contoh secara instan, mengosongkan tabel, dan mengembalikan sisa kuota kursi keberangkatan ke kapasitas penuh.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handlePurgeAllBookings}
                className="w-full lg:w-auto bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-5 py-3 rounded-2xl flex items-center justify-center space-x-2.5 transition active:scale-95 flex-shrink-0 shadow-lg shadow-rose-950/20"
              >
                <Trash className="w-4 h-4" />
                <span>Hapus Semua Data Contoh / Uji Coba</span>
              </button>
            </div>

            {/* SEARCH FILTERS BLOCK */}
            <div className="bg-white p-5 rounded-3xl border border-slate-150 grid grid-cols-1 md:grid-cols-4 gap-4 shadow-sm">
              <div className="relative md:col-span-2">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Query traveler name, code voucher, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white transition"
                />
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 py-2.5 px-3 rounded-2xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white"
                >
                  <option value="All">All Status Checklist</option>
                  <option value="Pending">Pending Audit</option>
                  <option value="Confirmed">Confirmed Guarantee</option>
                  <option value="Rejected">Rejected Audit</option>
                </select>
              </div>

              <div>
                <select
                  value={tripFilter}
                  onChange={(e) => setTripFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 py-2.5 px-3 rounded-2xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white truncate"
                >
                  <option value="All">All Trip Maps</option>
                  {trips.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* AUDIT LOGS TABLE LIST */}
            <div className="bg-white rounded-3xl border border-slate-150 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-[#315B4F] text-slate-100 uppercase font-mono tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4">Reference Code</th>
                      <th className="p-4">Traveler Name</th>
                      <th className="p-4">Active Destination / Date</th>
                      <th className="p-4 font-mono">Cost Subtotal</th>
                      <th className="p-4">Registry State</th>
                      <th className="p-4 text-center">Decisions Console</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {verifiedBookings.length > 0 ? (
                      verifiedBookings.map(b => (
                        <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-mono font-extrabold text-emerald-800 text-[13px]">{b.bookingCode}</td>
                          <td className="p-4">
                            <span className="font-bold text-slate-900 block text-[13px]">{b.fullName}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">{b.email}</span>
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-slate-750 block truncate max-w-[170px]">{b.tripTitle}</span>
                            <span className="text-[10px] text-slate-450 block font-mono">{formatDate(b.departureDate || "")} ({b.participantsCount} seats transacted)</span>
                          </td>
                          <td className="p-4 font-bold font-mono text-emerald-950 text-[13px]">{formatUSD(b.totalPrice)}</td>
                          <td className="p-4">
                            {b.status === "Pending" && <span className="bg-amber-100 text-amber-800 border border-amber-200/40 font-bold px-2 py-1 rounded-full text-[9px] animate-pulse">Pending Audit</span>}
                            {b.status === "Confirmed" && <span className="bg-emerald-100 text-emerald-800 border border-emerald-250/20 font-bold px-2 py-1 rounded-full text-[9px]">Seat Guaranteed</span>}
                            {b.status === "Rejected" && <span className="bg-rose-100 text-rose-800 border border-rose-250/20 font-bold px-2 py-1 rounded-full text-[9px]">Decline Fail</span>}
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => setSelectedBooking(b)}
                                className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-[#315B4F] hover:text-white rounded-xl transition duration-200 font-bold cursor-pointer"
                              >
                                View Ticket
                              </button>
                              {b.status !== "Confirmed" && (
                                <button
                                  onClick={() => handleApprove(b.id)}
                                  className="p-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-xl transition duration-200 border border-emerald-100 shadow-sm cursor-pointer"
                                  title="Approve booking proof"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {b.status !== "Rejected" && (
                                <button
                                  onClick={() => handleOpenReject(b.id)}
                                  className="p-2 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white rounded-xl transition duration-200 border border-rose-100 shadow-sm cursor-pointer"
                                  title="Reject billing proof"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center p-12 text-slate-400 font-medium">
                          No audit entries matching filters found in logs.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ----------------- TAB C: TRIP BLUEPRINTS (TEXT-ROW STREAMLINED CATALOG) ----------------- */}
        {activeTab === "catalog" && (
          <div className="space-y-6 animate-fade-in" id="trip-catalog-tab">
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-150 shadow-sm">
              <div>
                <h3 className="font-display font-extrabold text-slate-900 text-sm">Trip Package Blueprints</h3>
                <p className="text-[10px] text-slate-450">List, preview, update itinerary, inclusion/exclusion, status drafting, and starting values</p>
              </div>

              <button
                onClick={initCreateTrip}
                className="bg-[#315B4F] hover:bg-emerald-900 text-white text-xs font-bold px-4 py-2.5 rounded-2xl cursor-pointer shadow inline-flex items-center space-x-1.5 transition duration-200"
              >
                <Plus className="w-4 h-4 text-[#D6B16D]" />
                <span>Create New Blueprint</span>
              </button>
            </div>

            {/* TEXT-ROW LIST COMPACT LAYOUT */}
            <div className="bg-white rounded-3xl border border-slate-150 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-[#315B4F] text-slate-100 uppercase font-mono tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4">Package Name / Area</th>
                      <th className="p-4">URL Slug Path</th>
                      <th className="p-4 font-mono">Duration Tag</th>
                      <th className="p-4 text-center">Starting Price (USD)</th>
                      <th className="p-4">State</th>
                      <th className="p-4 text-center font-bold">Action Suite</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {trips.length > 0 ? (
                      trips.map(trip => (
                        <tr key={trip.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 flex items-center space-x-3">
                            <img 
                              src={trip.coverImage} 
                              alt={trip.title}
                              referrerPolicy="no-referrer"
                              className="w-12 h-10 object-cover rounded-xl border border-slate-200 flex-shrink-0"
                            />
                            <div>
                              <span className="font-display font-black text-slate-900 text-[13px] block">{trip.title}</span>
                              <span className="text-[10px] text-slate-400 block font-sans font-medium flex items-center space-x-1">
                                <MapPin className="w-3 h-3 text-slate-350" />
                                <span>{trip.location}</span>
                              </span>
                            </div>
                          </td>
                          <td className="p-4 font-mono font-medium text-slate-550">{trip.slug}</td>
                          <td className="p-4 font-mono font-bold text-slate-700">{trip.duration}</td>
                          <td className="p-4 font-black font-mono text-emerald-900 text-center text-[13px]">
                            {formatUSD(trip.startingPrice || 150)}
                          </td>
                          <td className="p-4">
                            {trip.status === "draft" ? (
                              <span className="bg-amber-100 text-amber-800 border border-amber-250/20 font-bold px-2 py-0.5 rounded text-[9px]">Draft</span>
                            ) : (
                              <span className="bg-emerald-600 text-white font-bold px-2 py-0.5 rounded text-[9px]">Live Catalog</span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center space-x-1.5">
                              <button
                                onClick={() => setPreviewTrip(trip)}
                                className="p-2 bg-slate-50 hover:bg-slate-200 border border-slate-200 text-slate-550 rounded-xl transition duration-200 cursor-pointer"
                                title="Customer-facing Live Preview"
                              >
                                <Eye className="w-4 h-4 text-[#315B4F]" />
                              </button>
                              <button
                                onClick={() => initEditTrip(trip)}
                                className="p-2 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-100 text-[#315B4F] rounded-xl transition duration-200 cursor-pointer"
                                title="Edit Blueprint parameters"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteTrip(trip.id)}
                                className="p-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 hover:border-rose-300 text-rose-700 rounded-xl transition duration-200 cursor-pointer"
                                title="Delete Trip Blueprint"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center p-12 text-slate-400 font-medium">
                          No trip blueprints found. Click "Create New Blueprint" above to add a tour.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ----------------- TAB D: DEPARTURE QUOTA & COMPACT BATCHES ----------------- */}
        {activeTab === "batches" && (
          <div className="space-y-6 animate-fade-in" id="batches-schedule-tab">
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-150 shadow-sm">
              <div>
                <h3 className="font-display font-extrabold text-slate-900 text-sm">Departure Seating Quota Batch Management</h3>
                <p className="text-[10px] text-slate-450">Map slots, set pricing USD rate structure, and set seating limits up to a maximum of 14 travelers</p>
              </div>

              <button
                onClick={initCreateBatch}
                className="bg-[#315B4F] hover:bg-emerald-900 text-white text-xs font-bold px-4 py-2.5 rounded-2xl cursor-pointer shadow inline-flex items-center space-x-1.5 transition duration-200"
              >
                <Plus className="w-4 h-4 text-[#D6B16D]" />
                <span>Schedule New Batch</span>
              </button>
            </div>

            {/* BATCHES TABLE LIST */}
            <div className="bg-white rounded-3xl border border-slate-150 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-[#315B4F] text-slate-100 uppercase font-mono tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4">Scheduled Trip Destination</th>
                      <th className="p-4">Departure Date</th>
                      <th className="p-4">USD Flat Cost Rate</th>
                      <th className="p-4">Avail / Max Spots Quota</th>
                      <th className="p-4">State</th>
                      <th className="p-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {batches.length > 0 ? (
                      batches.map(batch => {
                        const tripObj = trips.find(t => t.id === batch.tripId);
                        return (
                          <tr key={batch.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 font-bold text-slate-800 text-[13px]">{tripObj ? tripObj.title : "Unknown Package Reference"}</td>
                            <td className="p-4 font-mono font-extrabold text-emerald-800 text-[13px]">{formatDate(batch.departureDate)}</td>
                            <td className="p-4 font-extrabold font-mono text-emerald-950 text-[13px]">{formatUSD(batch.price)}</td>
                            <td className="p-4">
                              <span className="font-bold text-slate-900">{batch.availableSeats}</span>
                              <span className="text-slate-400 font-medium"> / {batch.quota} spots maximum</span>
                            </td>
                            <td className="p-4">
                              {batch.status === "Open" ? (
                                <span className="bg-emerald-100 text-emerald-800 border border-emerald-250/20 font-bold px-2 py-0.5 rounded text-[9px]">Open</span>
                              ) : (
                                <span className="bg-rose-100 text-rose-800 border border-rose-250/20 font-bold px-2 py-0.5 rounded text-[9px]">Closed</span>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center space-x-1.5">
                                <button
                                  onClick={() => initEditBatch(batch)}
                                  className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-[#315B4F] hover:text-white rounded-xl transition duration-200 font-bold cursor-pointer"
                                >
                                  Edit batch
                                </button>
                                <button
                                  onClick={() => handleDeleteBatch(batch.id)}
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition duration-200 border border-rose-220 cursor-pointer"
                                  title="Delete batch"
                                >
                                  <Trash className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center p-12 text-slate-400 font-medium">
                          No scheduled batches found. Click "Schedule New Batch" above to populate!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ----------------- TAB E: GROUPED PARTICIPANT DATA SHEET (ACCORDION PER BATCH) ----------------- */}
        {activeTab === "participants" && (
          <div className="space-y-6 animate-fade-in" id="participants-accordion-tab">
            
            <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm">
              <h3 className="font-display font-extrabold text-slate-900 text-sm">Participant Database Grouped by Departure Dates</h3>
              <p className="text-[10px] text-slate-450">Displays attendees sorted neatly per departure batch slot to make client airport logistics effortless.</p>
            </div>

            {/* BATCH ACCORDIONS STREAM */}
            <div className="space-y-4">
              {batches.map(batch => {
                const tripObj = trips.find(t => t.id === batch.tripId);
                const batchBookings = batchParticipantsGroup[batch.id] || [];
                const totalAttendeesCount = batchBookings.reduce((sum, b) => sum + b.participantsCount, 0);
                const isExpanded = !!expandedBatches[batch.id];

                return (
                  <div key={batch.id} className="bg-white rounded-3xl border border-slate-150 shadow-sm overflow-hidden">
                    
                    {/* ACCORDION BAR TRIGGER */}
                    <button
                      onClick={() => setExpandedBatches(prev => ({ ...prev, [batch.id]: !isExpanded }))}
                      className="w-full p-5 flex flex-col sm:flex-row sm:items-center justify-between text-left hover:bg-slate-50/60 transition duration-200 select-none cursor-pointer"
                    >
                      <div className="space-y-1 max-w-[80%]">
                        <span className="text-[10px] font-mono text-emerald-800 font-extrabold uppercase bg-emerald-50 px-2 py-0.5 rounded">
                          {formatDate(batch.departureDate)}
                        </span>
                        <h4 className="font-display font-bold text-slate-900 text-sm">
                          {tripObj ? tripObj.title : `Unmapped Trip Reference ID #${batch.tripId}`}
                        </h4>
                        <p className="text-[10px] text-slate-450 flex items-center space-x-1.5 font-medium">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span>{totalAttendeesCount} registered travelers total on this departures slot ({batch.availableSeats} available spots left)</span>
                        </p>
                      </div>

                      <div className="flex items-center space-x-3 mt-3 sm:mt-0 shrink-0">
                        <span className={`text-[10px] uppercase font-mono font-black tracking-wider px-2 py-1 rounded-lg ${
                          totalAttendeesCount > 0 ? "bg-emerald-100 text-emerald-800 font-extrabold" : "bg-slate-100 text-slate-400"
                        }`}>
                          {totalAttendeesCount} Active Pax
                        </span>
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-slate-400 animate-slide-up" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {/* TABLE DETAILS EXPANSION */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 p-5 bg-slate-50/30">
                        {batchBookings.length > 0 ? (
                          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead className="bg-slate-100 text-slate-500 uppercase font-mono tracking-wider text-[9px] font-bold">
                                <tr>
                                  <th className="p-3">Reference Code</th>
                                  <th className="p-3">Kategori</th>
                                  <th className="p-3">Full Candidate Name</th>
                                  <th className="p-3">English Passport Name</th>
                                  <th className="p-3">WeChat Account ID</th>
                                  <th className="p-3">Red (XiaoHongShu)</th>
                                  <th className="p-3">Flight Assigned</th>
                                  <th className="p-3">Contact WhatsApp</th>
                                  <th className="p-3 text-center">Operation</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {batchBookings.map(b => (
                                  <tr key={b.id} className="hover:bg-slate-50/50 transition duration-200">
                                    <td className="p-3 font-mono font-bold text-[#315B4F]">{b.bookingCode}</td>
                                    <td className="p-3">
                                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                        (b.nationalityType || b.participantData?.nationalityType) === 'WNA'
                                          ? "bg-blue-100 text-blue-800 border border-blue-200"
                                          : "bg-emerald-100 text-[#315B4F] border border-emerald-200"
                                      }`}>
                                        {(b.nationalityType || b.participantData?.nationalityType) === 'WNA' ? "🌐 WNA" : "🇮🇩 WNI"}
                                      </span>
                                    </td>
                                    <td className="p-3 font-bold text-slate-800">{b.participantData?.name || b.fullName}</td>
                                    <td className="p-3 font-bold text-slate-700">{b.participantData?.englishName || "N/A"}</td>
                                    <td className="p-3 font-mono text-slate-600">{b.participantData?.weChatId || "N/A"}</td>
                                    <td className="p-3 font-mono text-slate-650">{b.participantData?.xiaoHongShuId || "N/A"}</td>
                                    <td className="p-3">
                                      {b.participantData?.flightNumber ? (
                                        <span className="inline-flex items-center space-x-1.5 bg-emerald-50/50 text-emerald-850 px-2 py-0.5 rounded border border-emerald-100/40 text-[10px] font-bold font-mono uppercase">
                                          <Plane className="w-2.5 h-2.5" />
                                          <span>{b.participantData.flightNumber}</span>
                                        </span>
                                      ) : (
                                        <span className="text-slate-400 font-mono">Unassigned</span>
                                      )}
                                    </td>
                                    <td className="p-3 font-mono text-slate-700">{b.participantData?.whatsapp || b.phone || "N/A"}</td>
                                    <td className="p-3 text-center">
                                      <button
                                        onClick={() => handleEditParticipant(b)}
                                        className="px-2.5 py-1.5 bg-slate-100 text-slate-700 hover:bg-[#315B4F] hover:text-white rounded-xl transition duration-200 font-bold border border-slate-200 cursor-pointer text-[10px]"
                                      >
                                        Edit Profile
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="p-6 text-center text-slate-400 font-medium">
                            No passengers registered for this departure batch yet.
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ----------------- TAB F: EXCEL / CSV IMPORTER ----------------- */}
        {activeTab === "excel-import" && (
          <div className="space-y-8 animate-fade-in text-slate-800" id="excel-importer-tab">
            
            {/* Header / Guide banner */}
            <div className="bg-emerald-950 text-slate-100 p-6 sm:p-8 rounded-3xl border border-emerald-900 shadow-lg relative overflow-hidden">
              <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[#D6B16D]/10 blur-2xl pointer-events-none" />
              <div className="relative space-y-4 max-w-4xl">
                <div className="inline-flex items-center space-x-2 bg-[#D6B16D]/15 text-white px-3.5 py-1.5 rounded-full text-xs font-bold border border-[#D6B16D]/20 shadow-md">
                  <Sparkles className="w-3.5 h-3.5 text-[#D6B16D] animate-bounce" />
                  <span>Excel / Spreadsheet Connectivity</span>
                </div>
                <h3 className="text-2xl font-display font-black text-white tracking-tight">
                  Direct Tourism Data Synchronization
                </h3>
                <p className="text-sm font-sans text-emerald-100 leading-relaxed opacity-90">
                  Have your trip details or schedules designed in **Microsoft Excel, Google Sheets, or Apple Numbers**? 
                  Copy and paste the cells directly below or drop in a standard `.csv` export. The system will cleanly parse, associate, and render them on your website instantly.
                </p>
              </div>
            </div>

            {/* Main Importer Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Input and Controls */}
              <div className="bg-white border border-slate-150 p-6 rounded-3xl shadow-sm lg:col-span-7 space-y-6">
                
                {/* Mode Selector Toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 gap-4">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block mb-0.5">Database Write Mode</span>
                    <p className="text-[10px] text-slate-400">Determine how newly imported data matches with existing listings.</p>
                  </div>
                  <div className="inline-flex bg-slate-200 p-1 rounded-xl">
                    <button
                      onClick={() => setImportMode("append")}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition duration-205 ${
                        importMode === "append"
                          ? "bg-slate-900 text-white shadow-sm"
                          : "text-slate-605 hover:text-slate-900"
                      }`}
                    >
                      Append Mode
                    </button>
                    <button
                      onClick={() => setImportMode("overwrite")}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition duration-205 ${
                        importMode === "overwrite"
                          ? "bg-rose-900 text-white shadow-sm"
                          : "text-slate-605 hover:text-rose-600"
                      }`}
                    >
                      Overwrite Mode
                    </button>
                  </div>
                </div>

                {/* Sub Tab Switchers (Trips vs Batches) */}
                <div className="flex border-b border-slate-200">
                  <button
                    onClick={() => setActiveImportSection("trips")}
                    className={`pb-3 pr-6 text-sm font-display font-black tracking-tight border-b-2 transition duration-201 ${
                      activeImportSection === "trips"
                        ? "border-[#315B4F] text-[#315B4F]"
                        : "border-transparent text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    1. Tour Packages (Trips)
                  </button>
                  <button
                    onClick={() => setActiveImportSection("batches")}
                    className={`pb-3 px-6 text-sm font-display font-black tracking-tight border-b-2 transition duration-201 relative ${
                      activeImportSection === "batches"
                        ? "border-[#315B4F] text-[#315B4F]"
                        : "border-transparent text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    2. Departures Calendar (Batches)
                    {parsedTrips.length > 0 && parsedBatches.length === 0 && (
                      <span className="absolute -right-3 top-0 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
                    )}
                  </button>
                </div>

                {/* Switchable Import Panes */}
                {activeImportSection === "trips" ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900">Trip Spreadsheet Input</span>
                        <p className="text-[10px] text-slate-400">Copy table from Excel and paste here, or choose a .csv file</p>
                      </div>
                      <button
                        onClick={handleInsertSampleTrips}
                        className="text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 p-1.5 px-3.5 rounded-xl border border-emerald-100 transition duration-200"
                      >
                        Load Sample Rows
                      </button>
                    </div>

                    <textarea
                      placeholder="Title	Location	Duration	Description	Starting Price	Highlight	Cover Image URL	Included	Excluded"
                      value={importTripsText}
                      onChange={(e) => {
                        setImportTripsText(e.target.value);
                        parseTripsData(e.target.value);
                      }}
                      className="w-full h-48 p-4 bg-slate-50 border border-slate-200 focus:border-slate-350 focus:outline-none rounded-2xl font-mono text-xs text-slate-700 placeholder-slate-400"
                    />

                    <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
                      <span>Or upload direct file:</span>
                      <label className="bg-slate-100 text-slate-700 p-2 px-4 rounded-xl border border-slate-200 hover:bg-slate-200 cursor-pointer text-xs font-bold inline-flex items-center space-x-1.5">
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Select .CSV File</span>
                        <input
                          type="file"
                          accept=".csv"
                          onChange={(e) => handleCsvFileUpload(e, "trips")}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900">Departures Calendar Input</span>
                        <p className="text-[10px] text-slate-400">Map specific calendar slots to corresponding trip titles</p>
                      </div>
                      <button
                        onClick={handleInsertSampleBatches}
                        className="text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 p-1.5 px-3.5 rounded-xl border border-emerald-100 transition duration-200"
                      >
                        Load Sample Batches
                      </button>
                    </div>

                    <textarea
                      placeholder="Trip Title	Departure Date (YYYY-MM-DD)	Quota	Price	Status (Open/Closed)"
                      value={importBatchesText}
                      onChange={(e) => {
                        setImportBatchesText(e.target.value);
                        parseBatchesData(e.target.value);
                      }}
                      className="w-full h-48 p-4 bg-slate-50 border border-slate-200 focus:border-slate-350 focus:outline-none rounded-2xl font-mono text-xs text-slate-700 placeholder-slate-400"
                    />

                    <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
                      <span>Or upload direct file:</span>
                      <label className="bg-slate-100 text-slate-700 p-2 px-4 rounded-xl border border-slate-200 hover:bg-slate-200 cursor-pointer text-xs font-bold inline-flex items-center space-x-1.5">
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Select .CSV File</span>
                        <input
                          type="file"
                          accept=".csv"
                          onChange={(e) => handleCsvFileUpload(e, "batches")}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                )}

                {/* Import feedback alert messages */}
                {importFeedback && (
                  <div className={`p-4 rounded-2xl text-xs space-y-1.5 border ${
                    importFeedback.type === "success"
                      ? "bg-emerald-50 text-emerald-900 border-emerald-100"
                      : "bg-rose-50 text-rose-900 border-rose-100"
                  }`}>
                    <div className="flex items-center space-x-2 font-black">
                      {importFeedback.type === "success" ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                      )}
                      <span>{importFeedback.type === "success" ? "Bulk Operation Completed" : "Format Error Log"}</span>
                    </div>
                    <p className="font-semibold">{importFeedback.text}</p>
                    <button
                      onClick={() => setImportFeedback(null)}
                      className="text-[10px] text-slate-400 hover:text-slate-600 underline font-semibold block"
                    >
                      Dismiss Notification
                    </button>
                  </div>
                )}

                {/* Submit button bar */}
                <div className="pt-4 border-t border-slate-150 flex items-center justify-between gap-4">
                  <div className="max-w-[60%]">
                    <span className="text-[11px] font-mono text-slate-405 block">SUBMIT FOR PRODUCTION</span>
                    <p className="text-[10px] text-slate-505 leading-tight">These listings will be published for travelers real-time.</p>
                  </div>
                  <button
                    onClick={handlePublishBulkImport}
                    disabled={parsedTrips.length === 0 && parsedBatches.length === 0}
                    className={`font-display font-extrabold text-xs tracking-widest p-4 px-8 rounded-xl shrink-0 transition-all cursor-pointer ${
                      parsedTrips.length > 0 || parsedBatches.length > 0
                        ? "bg-[#315B4F] text-white hover:bg-emerald-900 shadow-lg group hover:scale-105 active:scale-95"
                        : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                    }`}
                  >
                    🚀 PUBLISH DIRECTLY
                  </button>
                </div>

              </div>

              {/* Right Column: Dynamic Preview Table */}
              <div className="space-y-6 lg:col-span-5 flex flex-col justify-between">
                
                {/* Guidelines Cheat sheet card */}
                <div className="bg-slate-50 border border-slate-150 p-6 rounded-3xl space-y-4">
                  <h4 className="font-display font-black text-slate-950 text-xs uppercase tracking-wider inline-flex items-center space-x-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-800" />
                    <span>Spreadsheet Headers Cheat-Sheet</span>
                  </h4>
                  <div className="text-[11px] text-slate-600 leading-relaxed space-y-2.5 font-sans">
                    <p>Format your spreadsheet column order exactly like this so the database maps them cleanly:</p>
                    
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      <div className="bg-slate-100/80 px-3 py-1.5 font-bold font-mono text-[9px] text-slate-500 uppercase border-b border-slate-150">
                        1. Trip Blueprints Template
                      </div>
                      <div className="p-3 font-mono text-[9px] text-slate-700 divide-y divide-slate-100 space-y-1">
                        <div>1. <b className="text-emerald-950 font-black">Title</b> (Scenic Tour Overlook)</div>
                        <div>2. <b>Location</b> (Java, Indonesia)</div>
                        <div>3. <b>Duration</b> (3 Days 2 Nights)</div>
                        <div>4. <b>Description</b> (Surreal mountain landscapes)</div>
                        <div>5. <b>Price</b> (Starting Price in numbers)</div>
                        <div>6. <b>Highlight</b> (Sub-highlight line)</div>
                        <div>7. <b>Image URL</b> (Landscape cover image link)</div>
                        <div>8. <b>Included</b> (Split with vertical | bar)</div>
                        <div>9. <b>Excluded</b> (Split with vertical | bar)</div>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      <div className="bg-slate-100/80 px-3 py-1.5 font-bold font-mono text-[9px] text-slate-500 uppercase border-b border-slate-150">
                        2. Departures Calendar Template
                      </div>
                      <div className="p-3 font-mono text-[9px] text-slate-700 divide-y divide-slate-100 space-y-1">
                        <div>1. <b className="text-emerald-950 font-black">Trip Title</b> (Must match blueprint title)</div>
                        <div>2. <b>Departure Date</b> (YYYY-MM-DD calendar slot)</div>
                        <div>3. <b>Quota Max</b> (Maximum traveler seats limit)</div>
                        <div>4. <b>Seat Price</b> (Price for departure)</div>
                        <div>5. <b>Status</b> (Open / Closed option)</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Parsed Previews Box */}
                <div className="bg-slate-900 text-slate-100 p-6 rounded-3xl flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-mono tracking-widest font-extrabold text-[#D6B16D]">
                        Spreadsheet Parser Terminal
                      </span>
                      <span className="p-1 px-2.5 bg-[#D6B16D]/15 text-[#D6B16D] font-mono text-[9px] font-black rounded-lg">
                        AUTODETECT READY
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-sans mt-0.5">
                      Visualizing verified records extracted from pasted rows.
                    </p>
                  </div>

                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {parsedTrips.length === 0 && parsedBatches.length === 0 ? (
                      <div className="text-center py-10 border border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center space-y-2">
                        <Layers className="w-8 h-8 text-slate-600" />
                        <p className="text-[11px] text-slate-500 font-mono">No parsed spreadsheet cells detected</p>
                      </div>
                    ) : (
                      <div className="space-y-3 font-mono text-[10px]">
                        
                        {parsedTrips.length > 0 && (
                          <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                            <span className="text-emerald-400 font-extrabold flex items-center space-x-1">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>EXTRACTED TRIP BLUEPRINTS ({parsedTrips.length})</span>
                            </span>
                            <div className="divide-y divide-slate-800 max-h-[100px] overflow-y-auto pt-1 space-y-1">
                              {parsedTrips.map((pt, idx) => (
                                <div key={idx} className="flex justify-between py-1 text-slate-400">
                                  <span className="truncate max-w-[200px] text-slate-200">{pt.title}</span>
                                  <span>{formatUSD(pt.startingPrice)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {parsedBatches.length > 0 && (
                          <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                            <span className="text-emerald-400 font-extrabold flex items-center space-x-1">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>EXTRACTED DEPARTURE CALENDARS ({parsedBatches.length})</span>
                            </span>
                            <div className="divide-y divide-slate-800 max-h-[100px] overflow-y-auto pt-1 space-y-1">
                              {parsedBatches.map((pb, idx) => {
                                let referencedTitle = trips.find(t => t.id === pb.tripId)?.title || pb.tripId;
                                if (pb.tripId.startsWith("pending-link-")) {
                                  referencedTitle = pb.tripId.replace("pending-link-", "");
                                }
                                return (
                                  <div key={idx} className="flex justify-between py-1 text-slate-400">
                                    <span className="truncate max-w-[150px] text-slate-200">{referencedTitle}</span>
                                    <span>{pb.departureDate}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                      </div>
                    )}
                  </div>

                  <div className="text-center text-[10px] text-slate-550 font-mono border-t border-slate-805 pt-3 flex items-center justify-between">
                    <span>STATUS: {parsedTrips.length + parsedBatches.length > 0 ? "RECORDS_LOADED" : "AWAITING_INPUT"}</span>
                    <span>SIZE: {parsedTrips.length + parsedBatches.length} items</span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </main>

      {/* ----------------- MODAL WIDGET 1: VERIFICATION DETAIL MODAL ----------------- */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-[#022C22]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-150 max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="bg-[#315B4F] text-slate-100 p-6 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-emerald-250 uppercase font-mono tracking-widest block font-bold">VOUCHER AUDIT PORTAL</span>
                <span className="font-mono text-lg font-black">{selectedBooking.bookingCode} Verification</span>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="text-emerald-100 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full cursor-pointer transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
              <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/10 space-y-2">
                <span className="text-[10px] font-mono tracking-wider font-extrabold text-[#315B4F] block">Registered Destination</span>
                <div className="flex justify-between items-center">
                  <span className="font-display font-black text-slate-900">{selectedBooking.tripTitle}</span>
                  <span className="font-mono font-bold text-emerald-800 text-xs bg-emerald-100/50 px-2.5 py-1 rounded-lg">{formatDate(selectedBooking.departureDate || "")}</span>
                </div>
              </div>

              {/* 8 parameters specifications list */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-mono tracking-widest font-extrabold text-slate-400 uppercase">Traveler Dynamic Profile & Credentials</h4>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                    (selectedBooking.nationalityType || selectedBooking.participantData?.nationalityType) === 'WNA'
                      ? "bg-blue-100 text-blue-800 border border-blue-200"
                      : "bg-emerald-100 text-[#315B4F] border border-emerald-200"
                  }`}>
                    {(selectedBooking.nationalityType || selectedBooking.participantData?.nationalityType) === 'WNA' ? "🌐 WNA (Asing)" : "🇮🇩 WNI (Domestik)"}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-150/60">
                  {[
                    { label: "Kategori Kewarganegaraan", val: (selectedBooking.nationalityType || selectedBooking.participantData?.nationalityType) === 'WNA' ? "WNA (Wisatawan Asing)" : "WNI (Wisatawan Domestik)" },
                    { label: "1. Full Passport Name (Hanzi / Mandarin)", val: selectedBooking.fullName },
                    { label: "2. English/Pinyin Name (Format Paspor)", val: selectedBooking.participantData?.englishName || "N/A" },
                    { label: "3. WeChat ID Account", val: selectedBooking.participantData?.weChatId || "N/A" },
                    { label: "4. RED (XiaoHongShu ID)", val: selectedBooking.participantData?.xiaoHongShuId || "N/A" },
                    { label: "5. Residence City Location", val: selectedBooking.participantData?.city || "N/A" },
                    { label: "6. Primary Contact WhatsApp", val: selectedBooking.phone },
                    { label: "7. Registered Email Address", val: selectedBooking.email },
                    { label: "8. Arrival Flight Code (Airport Meetup)", val: selectedBooking.participantData?.flightNumber || "N/A" }
                  ].map((field, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <span className="text-[9px] text-slate-400 block font-mono font-semibold uppercase">{field.label}</span>
                      <p className="font-bold text-slate-900 break-words">{field.val}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Proof image display */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono tracking-widest font-extrabold text-slate-400 block uppercase">Proof of Payment billing ticket</span>
                {selectedBooking.proofOfPayment && selectedBooking.proofOfPayment.startsWith("data:image") ? (
                  <div className="rounded-2xl overflow-hidden border border-slate-200">
                    <img src={selectedBooking.proofOfPayment} alt="Proof of Payment visual ticket transfer" className="w-full max-h-[300px] object-contain bg-slate-900" />
                  </div>
                ) : (
                  <div className="bg-slate-100 p-8 rounded-2xl text-center border border-dashed border-slate-300 text-slate-450 font-medium">
                    No visual transfer attachment. Marked as sandbox/preview registration.
                  </div>
                )}
              </div>

              {/* Action suite bar within voucher */}
              <div className="border-t border-slate-150 pt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-mono tracking-widest font-bold block">AUDIT DECISION STATE</span>
                  <div className="mt-1">
                    {selectedBooking.status === "Pending" && <span className="p-1.5 px-3 bg-amber-50 font-bold text-amber-800 border border-amber-250/20 rounded-md">Pending Validation</span>}
                    {selectedBooking.status === "Confirmed" && <span className="p-1.5 px-3 bg-emerald-50 text-emerald-800 font-bold border border-emerald-250/20 rounded-md">Guaranteed Seats Pass</span>}
                    {selectedBooking.status === "Rejected" && <span className="p-1.5 px-3 bg-rose-50 text-rose-800 font-bold border border-rose-250/20 rounded-md">Rejected Rollback</span>}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {selectedBooking.status !== "Confirmed" && (
                    <button
                      onClick={() => handleApprove(selectedBooking.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer transition shadow"
                    >
                      Approve Proof
                    </button>
                  )}
                  {selectedBooking.status !== "Rejected" && (
                    <button
                      onClick={() => handleOpenReject(selectedBooking.id)}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl cursor-pointer transition shadow"
                    >
                      Reject Proof
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- MODAL WIDGET 2: REJECTION BILLING MODAL ----------------- */}
      {showRejectDialog && (
        <div className="fixed inset-0 bg-[#022C22]/70 backdrop-blur-sm z-55 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-150 max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <h3 className="font-display font-extrabold text-rose-800 text-sm uppercase tracking-wider">disapprove booking checkout proof</h3>
            <p className="text-slate-450 leading-relaxed font-medium">
              Explain clearly why the proof of payment audit failed. This message will display immediately in the guest status tracker console.
            </p>
            <textarea
              required
              rows={3}
              placeholder="e.g. Attached ticket proof is incomplete / Blur screenshot copy / Departure batch is already at full capacity..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-1 focus:ring-rose-500 font-medium text-xs focus:outline-none focus:bg-white transition"
            />
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button onClick={() => setShowRejectDialog(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer transition text-xs font-bold">
                Keep Pending
              </button>
              <button onClick={submitReject} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer transition shadow">
                Disapprove Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- MODAL WIDGET 3: SECTIONAL SEPARATED TRIP BLUEPRINT MODAL ----------------- */}
      {showTripModal && (
        <div className="fixed inset-0 bg-[#022C22]/60 backdrop-blur-sm z-40 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-150 max-w-4xl w-full text-xs overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            
            {/* Header */}
            <div className="bg-[#315B4F] text-slate-100 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <span className="text-[10px] text-emerald-250 uppercase font-mono tracking-widest block font-bold">TRIP BLUEPRINT SPECIFICATIONS CREATOR</span>
                <span className="font-display font-black text-sm sm:text-base">
                  {editingTripId ? `Editing Model Blueprint: ${tripForm.title}` : "Assemble New Tour Blueprint File"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <AutoSaveStatusBadge
                  status={tripSaveStatus}
                  lastSaved={tripLastSaved}
                  isOnline={tripIsOnline}
                  onManualSave={performTripSave}
                />
                <button onClick={() => setShowTripModal(false)} className="text-emerald-100 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full cursor-pointer transition">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Auto-Save Draft Recovery Banner */}
            {showTripRecoveryBanner && tripDraft && (
              <div className="p-3 bg-slate-50 border-b border-slate-200">
                <DraftRecoveryBanner
                  draft={tripDraft}
                  typeLabel={editingTripId ? 'Edit Model Open Trip' : 'Model Open Trip Baru'}
                  onRecover={recoverTripDraft}
                  onDiscard={discardTripDraft}
                />
              </div>
            )}

            {/* MODULAR COMPONENT SECTION BUTTONS (Tabs!) */}
            <div className="bg-slate-100/80 p-3 border-b border-slate-200 flex flex-wrap gap-2">
              {[
                { id: "basic", label: "💎 1. Informasi Utama (General info)", desc: "Title, slug, cover, location, price" },
                { id: "facilities", label: "✅ 2. Include & Exclude (Fasilitas)", desc: "Included/excluding listings" },
                { id: "itinerary", label: "📅 3. Itinerary Program (Harian)", desc: "Assemble dynamic time paths" },
                { id: "media-faq", label: "❓ 4. Gallery & FAQs (Media)", desc: "Tanya jawab & photo stacks" }
              ].map(tabItem => (
                <button
                  key={tabItem.id}
                  type="button"
                  onClick={() => setTripFormTab(tabItem.id as TripFormTab)}
                  className={`px-3 py-2 rounded-xl text-[11px] font-display font-bold transition-all cursor-pointer ${
                    tripFormTab === tabItem.id 
                      ? "bg-[#315B4F] text-white shadow-sm" 
                      : "bg-white text-slate-705 border border-slate-200/60 hover:bg-slate-50"
                  }`}
                  title={tabItem.desc}
                >
                  {tabItem.label}
                </button>
              ))}
            </div>

            {/* INNER FORM PANELS COMPARTMENT */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 max-h-[60vh]">
              
              {/* SECTION A: INFORMASI UTAMA GENERAL */}
              {tripFormTab === "basic" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="bg-emerald-50/20 p-4 rounded-2xl border border-emerald-100/20">
                    <span className="text-[9px] font-mono tracking-widest font-extrabold text-[#315B4F] uppercase block">GUIDE DETAILS</span>
                    <p className="text-slate-500 leading-relaxed text-[11px] font-medium pt-1">
                      Configure the essential identities of your tour. The title will automatically project a clean SEO-friendly path slug for url links.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Trip Blueprint Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Labuan Bajo Liveaboard Voyage"
                        value={tripForm.title}
                        onChange={(e) => handleTitleChangeForSlug(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Endpoint Path Slug (Auto Generated)</label>
                      <input
                        type="text"
                        required
                        placeholder="labuan-bajo-voyage"
                        value={tripForm.slug}
                        onChange={(e) => setTripForm({ ...tripForm, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                        className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-mono text-slate-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Geographical Location Area</label>
                      <input
                        type="text"
                        placeholder="e.g. Flores Island, East Nusa Tenggara"
                        value={tripForm.location}
                        onChange={(e) => setTripForm({ ...tripForm, location: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Kategori Pengalaman (Experience Category)</label>
                      <select
                        value={(tripForm as any).category || (tripForm as any).experienceCategory || "Adventure"}
                        onChange={(e) => setTripForm({ ...tripForm, category: e.target.value as any, experienceCategory: e.target.value as any })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
                      >
                        <option value="Adventure">Adventure (Petualangan)</option>
                        <option value="Nature">Nature (Alam Bebas)</option>
                        <option value="Culture">Culture (Budaya &amp; Sejarah)</option>
                        <option value="City">City (Wisata Kota)</option>
                      </select>
                      <span className="text-[10px] text-slate-400 block">Menjelaskan jenis wisata (terpisah dari durasi).</span>
                    </div>

                    {/* DURATION DAYS & NIGHTS */}
                    <div className="col-span-full space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <label className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#315B4F]" />
                          <span>Durasi Tour (Days &amp; Nights)</span>
                        </label>
                        <span className="text-xs font-mono font-bold text-[#315B4F] bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                          Display Otomatis: {formatTourDuration(Number(tripForm.days) || 1, Number(tripForm.nights) || 0)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-600 uppercase">Jumlah Hari (Days)</span>
                          <input
                            type="number"
                            min={1}
                            max={30}
                            required
                            value={tripForm.days || 1}
                            onChange={(e) => {
                              const days = Math.max(1, parseInt(e.target.value, 10) || 1);
                              const nights = typeof tripForm.nights === 'number' ? tripForm.nights : Math.max(0, days - 1);
                              setTripForm({
                                ...tripForm,
                                days,
                                duration: formatTourDuration(days, nights)
                              });
                            }}
                            className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-700"
                          />
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-600 uppercase">Jumlah Malam (Nights)</span>
                          <input
                            type="number"
                            min={0}
                            max={30}
                            required
                            value={typeof tripForm.nights === 'number' ? tripForm.nights : 0}
                            onChange={(e) => {
                              const nights = Math.max(0, parseInt(e.target.value, 10) || 0);
                              const days = Number(tripForm.days) || 1;
                              setTripForm({
                                ...tripForm,
                                nights,
                                duration: formatTourDuration(days, nights)
                              });
                            }}
                            className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-700"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Cover Thumbnail Image URL</label>
                      <input
                        type="text"
                        value={tripForm.coverImage}
                        onChange={(e) => setTripForm({ ...tripForm, coverImage: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-500"
                      />
                    </div>

                    {/* PRICING: WNI (IDR) & WNA (USD) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 col-span-full bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 text-xs flex items-center gap-1">
                          <span>Tarif WNI / Domestik (Rp IDR)</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">Rp</span>
                          <input
                            type="number"
                            value={(tripForm as any).wniPrice || ""}
                            onChange={(e) => setTripForm({ ...tripForm, wniPrice: Number(e.target.value) })}
                            placeholder="1800000"
                            className="w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-emerald-800"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 text-xs flex items-center gap-1">
                          <span>Tarif WNA / International ($ USD)</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">$</span>
                          <input
                            type="number"
                            value={tripForm.startingPrice || ""}
                            onChange={(e) => setTripForm({ ...tripForm, startingPrice: Number(e.target.value) })}
                            placeholder="150"
                            className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-emerald-800"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Status Availability</label>
                      <select
                        value={tripForm.status}
                        onChange={(e) => setTripForm({ ...tripForm, status: e.target.value as "published" | "draft" })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                      >
                        <option value="draft">Draft mode (Invisible on frontend catalog)</option>
                        <option value="published">Published / Open (Sits active in live lists)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Brief Highlights Bullet line</label>
                      <input
                        type="text"
                        placeholder="e.g. Scenic treks, complete snorkeling gear, local ranger guidances..."
                        value={tripForm.highlight}
                        onChange={(e) => setTripForm({ ...tripForm, highlight: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>

                    <div className="col-span-full space-y-1">
                      <label className="font-bold text-slate-700">Full Description Markdown Introduction</label>
                      <textarea
                        rows={4}
                        placeholder="Introduce this tour destination to your clients detail..."
                        value={tripForm.description}
                        onChange={(e) => setTripForm({ ...tripForm, description: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl shadow-inner text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION B: INCLUDE & EXCLUDE FACILITIES */}
              {tripFormTab === "facilities" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-emerald-50/20 p-4 rounded-2xl border border-emerald-100/20">
                    <span className="text-[9px] font-mono tracking-widest font-extrabold text-[#315B4F] uppercase block">INCLUSIONS & EXCLUSIONS BULLET DESK</span>
                    <p className="text-slate-500 text-[11px] font-medium pt-0.5">
                      Enter what features are covered by your transacted fee, and what parameters fall on traveler private funding.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* INCLUDED ARRAYS */}
                    <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200/80">
                      <h4 className="font-display font-extrabold text-[#315B4F] text-xs">Included Facility items (Included)</h4>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="e.g. Free dynamic catamaran tickets..."
                          value={tempInclusion}
                          onChange={(e) => setTempInclusion(e.target.value)}
                          className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!tempInclusion.trim()) return;
                            setTripForm({ ...tripForm, included: [...tripForm.included, tempInclusion.trim()] });
                            setTempInclusion("");
                          }}
                          className="bg-[#315B4F] text-white p-2 rounded-xl"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <ul className="space-y-1 pt-2 max-h-48 overflow-y-auto pr-1">
                        {tripForm.included.map((item, id) => (
                          <li key={id} className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/50 text-[#315B4F]">
                            <span className="truncate max-w-[85%]">{item}</span>
                            <button
                              type="button"
                              onClick={() => setTripForm({ ...tripForm, included: tripForm.included.filter((_, i) => i !== id) })}
                              className="text-stone-400 hover:text-stone-600"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* EXCLUDED ARRAYS */}
                    <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200/80">
                      <h4 className="font-display font-extrabold text-rose-800 text-xs">Not Included items (Excluded)</h4>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="e.g. Soft drinks gratuity or tips..."
                          value={tempExclusion}
                          onChange={(e) => setTempExclusion(e.target.value)}
                          className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!tempExclusion.trim()) return;
                            setTripForm({ ...tripForm, excluded: [...tripForm.excluded, tempExclusion.trim()] });
                            setTempExclusion("");
                          }}
                          className="bg-rose-700 text-white p-2 rounded-xl"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <ul className="space-y-1 pt-2 max-h-48 overflow-y-auto pr-1">
                        {tripForm.excluded.map((item, id) => (
                          <li key={id} className="flex items-center justify-between p-2 rounded-lg bg-rose-50/50 text-rose-850">
                            <span className="truncate max-w-[85%]">{item}</span>
                            <button
                              type="button"
                              onClick={() => setTripForm({ ...tripForm, excluded: tripForm.excluded.filter((_, i) => i !== id) })}
                              className="text-stone-400 hover:text-stone-600"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* WHATS TO BRING ARRAYS (FULL WIDTH BELOW) */}
                    <div className="col-span-full space-y-3 bg-white p-4 rounded-2xl border border-slate-200/80">
                      <h4 className="font-display font-extrabold text-blue-800 text-xs flex items-center col-span-full">
                        <span>Checklist Perlengkapan / Barang Bawaan (What's to Bring)</span>
                      </h4>
                      <p className="text-slate-500 text-[11px] pt-0.5">
                        Tambahkan barang-barang atau peralatan wajib dan anjuran untuk dibawa oleh para peserta selama perjalanan (Optional).
                      </p>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="Contoh: Kacamata Hitam, Sandal Trekking, Baju Renang..."
                          value={tempWhatsToBring}
                          onChange={(e) => setTempWhatsToBring(e.target.value)}
                          className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (!tempWhatsToBring.trim()) return;
                              setTripForm({ 
                                ...tripForm, 
                                whatsToBring: [...(tripForm.whatsToBring || []), tempWhatsToBring.trim()] 
                              });
                              setTempWhatsToBring("");
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!tempWhatsToBring.trim()) return;
                            setTripForm({ 
                              ...tripForm, 
                              whatsToBring: [...(tripForm.whatsToBring || []), tempWhatsToBring.trim()] 
                            });
                            setTempWhatsToBring("");
                          }}
                          className="bg-blue-700 text-white p-2 rounded-xl"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 max-h-48 overflow-y-auto pr-1">
                        {(tripForm.whatsToBring || []).map((item, id) => (
                          <li key={id} className="flex items-center justify-between p-2 rounded-lg bg-blue-50/50 text-blue-900 text-xs">
                            <span className="truncate max-w-[85%] font-medium">{item}</span>
                            <button
                              type="button"
                              onClick={() => setTripForm({ 
                                ...tripForm, 
                                whatsToBring: (tripForm.whatsToBring || []).filter((_, i) => i !== id) 
                              })}
                              className="text-stone-400 hover:text-stone-600 transition"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </li>
                        ))}
                        {(tripForm.whatsToBring || []).length === 0 && (
                          <li className="col-span-full text-center py-2 text-stone-400 text-xs italic">
                            Belum ada barang bawaan ditambahkan.
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION C: DAILY ITINERARY BUILDER */}
              {tripFormTab === "itinerary" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-emerald-50/20 p-4 rounded-2xl border border-emerald-100/20 flex justify-between items-center flex-wrap gap-2">
                    <div className="max-w-[70%]">
                      <span className="text-[10px] font-mono tracking-widest font-extrabold text-[#315B4F] uppercase block">ITINERARY HOURLY TRACK BUILDER</span>
                      <p className="text-slate-500 text-[11px] font-medium pt-0.5">
                        Build hours scheduler tracks for each day of travel excursion.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={addItineraryDay}
                      className="bg-[#315B4F] text-white font-bold p-2 px-3 rounded-xl flex items-center space-x-1 hover:bg-[#203c34] shadow-sm transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Insert New Day</span>
                    </button>
                  </div>

                  {tripForm.itinerary.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                   {/* Days select list */}
                      <div className="md:col-span-1 space-y-1.5 max-h-[400px] overflow-y-auto p-1.5 border border-slate-200/50 rounded-2xl bg-white pr-2">
                        {tripForm.itinerary.map((it, idx) => (
                          <div
                            key={idx}
                            onClick={() => setSelectedItineraryDayIdx(idx)}
                            className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between transition ${
                              selectedItineraryDayIdx === idx 
                                ? "bg-[#315B4F]/10 border-[#315B4F]" 
                                : "hover:bg-slate-50 border-slate-200/60"
                            }`}
                          >
                            <div className="truncate max-w-[55%]">
                              <span className="font-mono text-[9px] font-bold text-slate-400 block uppercase">DAY INDEX #{it.day}</span>
                              <span className="font-bold text-slate-950 truncate block" title={it.title}>{it.title}</span>
                            </div>
                            <div className="flex items-center space-x-1 flex-shrink-0">
                              {/* Move Up */}
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveItineraryDayUp(idx);
                                }}
                                className={`p-1 rounded transition ${
                                  idx === 0 
                                    ? "text-slate-300 opacity-30 cursor-not-allowed" 
                                    : "text-slate-500 hover:bg-[#315B4F]/10 hover:text-[#315B4F]"
                                }`}
                                title="Move Up"
                              >
                                <ChevronUp className="w-3.5 h-3.5 stroke-[3]" />
                              </button>
                              
                              {/* Move Down */}
                              <button
                                type="button"
                                disabled={idx === tripForm.itinerary.length - 1}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveItineraryDayDown(idx);
                                }}
                                className={`p-1 rounded transition ${
                                  idx === tripForm.itinerary.length - 1 
                                    ? "text-slate-300 opacity-30 cursor-not-allowed" 
                                    : "text-slate-500 hover:bg-[#315B4F]/10 hover:text-[#315B4F]"
                                }`}
                                title="Move Down"
                              >
                                <ChevronDown className="w-3.5 h-3.5 stroke-[3]" />
                              </button>

                              {/* Remove */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeItineraryDay(idx);
                                }}
                                className="p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded transition ml-1"
                                title="Delete Day"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Day particulars panel */}
                      <div className="md:col-span-2 space-y-4 bg-white p-4 rounded-3xl border border-slate-200">
                        {tripForm.itinerary[selectedItineraryDayIdx] ? (
                          <div className="space-y-3">
                            <span className="font-mono text-[9px] font-bold text-[#315B4F]">EDIT DAY #{tripForm.itinerary[selectedItineraryDayIdx].day} INFO</span>
                            
                            <div className="grid grid-cols-1 gap-2">
                              <input
                                type="text"
                                placeholder="Headline title (e.g. trekking and snorkeling island loop)"
                                value={tripForm.itinerary[selectedItineraryDayIdx].title}
                                onChange={(e) => {
                                  const freshIt = [...tripForm.itinerary];
                                  freshIt[selectedItineraryDayIdx].title = e.target.value;
                                  setTripForm({ ...tripForm, itinerary: freshIt });
                                }}
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                              />
                              <textarea
                                rows={2}
                                placeholder="General summary description for this day..."
                                value={tripForm.itinerary[selectedItineraryDayIdx].description}
                                onChange={(e) => {
                                  const freshIt = [...tripForm.itinerary];
                                  freshIt[selectedItineraryDayIdx].description = e.target.value;
                                  setTripForm({ ...tripForm, itinerary: freshIt });
                                }}
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                              />
                            </div>

                            {/* HOURLY TIME SCHEDULE BUILDER LINE */}
                            <div className="border-t border-slate-100 pt-3 space-y-2">
                              <h5 className="font-display font-extrabold text-slate-800 text-[11px]">Agenda Schedules Timeline Mapping</h5>
                              
                              <div className="flex space-x-2">
                                <input
                                  type="text"
                                  placeholder="08:00 - 10:00"
                                  value={tempSchedule.time}
                                  onChange={(e) => setTempSchedule({ ...tempSchedule, time: e.target.value })}
                                  className="w-1/3 p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-center"
                                />
                                <input
                                  type="text"
                                  placeholder="Activity agenda (Snorkeling/trekking)"
                                  value={tempSchedule.activity}
                                  onChange={(e) => setTempSchedule({ ...tempSchedule, activity: e.target.value })}
                                  className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl"
                                />
                                <button
                                  type="button"
                                  onClick={addTimeItem}
                                  className="bg-[#315B4F] text-white p-2 px-3 rounded-xl font-bold"
                                >
                                  ADD
                                </button>
                              </div>

                              <ul className="space-y-1 max-h-36 overflow-y-auto pr-1">
                                {(tripForm.itinerary[selectedItineraryDayIdx].timeSchedules || []).map((t, idx) => (
                                  <li key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-250/40">
                                    <div className="flex items-center space-x-2 text-xs">
                                      <span className="font-mono font-bold text-[#315B4F] bg-emerald-50 px-2 rounded">{t.time}</span>
                                      <span className="text-slate-700 font-medium">{t.activity}</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const freshIt = [...tripForm.itinerary];
                                        freshIt[selectedItineraryDayIdx].timeSchedules = freshIt[selectedItineraryDayIdx].timeSchedules.filter((_, i) => i !== idx);
                                        setTripForm({ ...tripForm, itinerary: freshIt });
                                      }}
                                      className="text-stone-400 hover:text-stone-600 p-1"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ) : (
                          <div className="p-12 text-center text-slate-400 font-medium">No days created yet. Insert a day above!</div>
                        )}
                      </div>

                    </div>
                  ) : (
                    <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-medium">
                      No days defined yet. Click "Insert New Day" in the toolbar above to populate.
                    </div>
                  )}
                </div>
              )}

              {/* SECTION D: MEDIA GALLERY & FAQS CONTROLS */}
              {tripFormTab === "media-faq" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-emerald-50/20 p-4 rounded-2xl border border-emerald-100/20">
                    <span className="text-[10px] font-mono tracking-widest font-extrabold text-[#315B4F] uppercase block">MEDIA CHANNELS & FAQS QUESTIONS STACKS</span>
                    <p className="text-slate-500 text-[11px] font-medium pt-0.5">
                      Supply multiple high resolutions photos and establish quick helpful FAQs for clients reading information desk catalog.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* GALLERY MEDIA */}
                    <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200">
                      <h4 className="font-display font-extrabold text-[#315B4F] text-xs">Dynamic Photo Gallery Grid</h4>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="Unsplash / CDN image address URL..."
                          value={tempGalleryImage}
                          onChange={(e) => setTempGalleryImage(e.target.value)}
                          className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!tempGalleryImage.trim()) return;
                            setTripForm({ ...tripForm, gallery: [...(tripForm.gallery || []), tempGalleryImage.trim()] });
                            setTempGalleryImage("");
                          }}
                          className="bg-[#315B4F] text-white p-2 rounded-xl"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-4 gap-2 pt-2 max-h-48 overflow-y-auto pr-1">
                        {(tripForm.gallery || []).map((img, idx) => (
                          <div key={idx} className="relative h-12 bg-slate-100 rounded-lg group overflow-hidden border border-slate-200">
                            <img src={img} alt="Excursion sample" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <button
                              type="button"
                              onClick={() => setTripForm({ ...tripForm, gallery: tripForm.gallery.filter((_, i) => i !== idx) })}
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition duration-200"
                            >
                              <Trash className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* FAQS MANAGER */}
                    <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200">
                      <h4 className="font-display font-extrabold text-[#315B4F] text-xs">Helpful Destination FAQs items</h4>
                      <div className="space-y-2 bg-slate-50/50 p-2.5 border border-slate-200 rounded-xl text-xs">
                        <input
                          type="text"
                          placeholder="Question (e.g. Is wifi onboard?)"
                          value={tempQA.question}
                          onChange={(e) => setTempQA({ ...tempQA, question: e.target.value })}
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs"
                        />
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            placeholder="Answer (e.g. Satellite Wi-Fi works in ports.)"
                            value={tempQA.answer}
                            onChange={(e) => setTempQA({ ...tempQA, answer: e.target.value })}
                            className="flex-1 p-2 bg-white border border-slate-200 rounded-xl text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!tempQA.question || !tempQA.answer) return;
                              setTripForm({ ...tripForm, faq: [...(tripForm.faq || []), { ...tempQA }] });
                              setTempQA({ question: "", answer: "" });
                            }}
                            className="bg-[#315B4F] text-white p-2 rounded-xl"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <ul className="space-y-1.5 pt-1 max-h-40 overflow-y-auto pr-1">
                        {(tripForm.faq || []).map((faqItem, idx) => (
                          <li key={idx} className="p-2 bg-slate-50 border border-slate-150 rounded-xl flex items-start justify-between">
                            <div className="max-w-[90%]">
                              <span className="font-bold text-slate-800 block text-[10px]">Q: {faqItem.question}</span>
                              <span className="text-slate-500 block leading-normal text-[10px]">A: {faqItem.answer}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setTripForm({ ...tripForm, faq: tripForm.faq ? tripForm.faq.filter((_, i) => i !== idx) : [] })}
                              className="text-stone-400 hover:text-stone-600"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>
                </div>
              )}

            </div>

            {/* General Submit controller */}
            <div className="p-5 border-t border-slate-200 bg-slate-55 flex items-center justify-end space-x-2.5">
              <button
                type="button"
                onClick={() => setShowTripModal(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-250 text-slate-700 font-bold rounded-2xl cursor-pointer text-xs"
              >
                Discard Drafts
              </button>
              <button
                type="button"
                onClick={saveTrip}
                className="px-6 py-2.5 bg-[#315B4F] hover:bg-emerald-900 text-white font-bold rounded-2xl cursor-pointer shadow-sm text-xs"
              >
                Commit Changes
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ----------------- MODAL WIDGET 4: BATCH CALENDAR POPUP FORM ----------------- */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-[#022C22]/60 backdrop-blur-sm z-40 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-150 max-w-md w-full overflow-hidden shadow-2xl flex flex-col">
            <div className="bg-[#315B4F] text-white p-5 flex justify-between items-center text-xs">
              <div>
                <span className="text-[9px] uppercase font-mono tracking-widest block font-bold text-emerald-200">DEPARTURE BATCH SEATING DESIGNER</span>
                <span className="font-display font-black text-sm">{editingBatchId ? "Update Scheduled Batch" : "Schedule New Launch Batch"}</span>
              </div>
              <button onClick={() => setShowBatchModal(false)} className="text-emerald-100 bg-white/10 p-1.5 rounded-full cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Map Destination Blueprint Package</label>
                <select
                  value={batchForm.tripId}
                  onChange={(e) => {
                    const selTrip = trips.find(t => t.id === e.target.value);
                    setBatchForm({ ...batchForm, tripId: e.target.value, price: selTrip?.startingPrice || 150 });
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                >
                  {trips.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Scheduled Departure Calendar Date</label>
                <input
                  type="date"
                  required
                  value={batchForm.departureDate}
                  onChange={(e) => setBatchForm({ ...batchForm, departureDate: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Pricing rate in USD ($)</label>
                  <input
                    type="number"
                    value={batchForm.price}
                    onChange={(e) => setBatchForm({...batchForm, price: Number(e.target.value)})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-black text-emerald-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Spots Quota Capacity (Maks 14)</label>
                  <input
                    type="number"
                    max={14}
                    value={batchForm.quota}
                    onChange={(e) => setBatchForm({...batchForm, quota: Number(e.target.value), availableSeats: editingBatchId ? Number(batchForm.availableSeats) : Number(e.target.value)})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-black text-slate-900"
                  />
                </div>
              </div>

              {editingBatchId && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-750 block">Override Available Seats remaining</label>
                  <input
                    type="number"
                    required
                    max={batchForm.quota}
                    value={batchForm.availableSeats}
                    onChange={(e) => setBatchForm({...batchForm, availableSeats: Number(e.target.value)})}
                    className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono text-slate-705"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Batch Seating Gate state</label>
                <select
                  value={batchForm.status}
                  onChange={(e) => setBatchForm({ ...batchForm, status: e.target.value as "Open" | "Closed" })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="Open">Open (Active for public reservations checkout)</option>
                  <option value="Closed">Closed / Locked (Declines bookings ingestion)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button type="button" onClick={() => setShowBatchModal(false)} className="px-4 py-2 bg-slate-105 hover:bg-slate-200 text-slate-700 rounded-xl font-bold">
                  Discard
                </button>
                <button type="button" onClick={saveBatch} className="px-5 py-2 bg-[#315B4F] text-white rounded-xl font-bold shadow-sm hover:bg-emerald-900">
                  Save Departure
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ----------------- MODAL WIDGET 5: PARTICIPANT PARAMETERS PROFILES EDITOR ----------------- */}
      {showParticipantModal && selectedParticipantForEdit && (
        <div className="fixed inset-0 bg-[#022C22]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-150 max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            <div className="bg-[#315B4F] text-white p-5 flex justify-between items-center text-xs">
              <div>
                <span className="text-[10px] text-emerald-250 font-mono tracking-widest block font-bold">MODIFY TRAVELER PROFILE REGISTRATION</span>
                <span className="font-mono text-sm font-black">Audit #{selectedParticipantForEdit.bookingCode} Update</span>
              </div>
              <button onClick={() => setShowParticipantModal(false)} className="text-emerald-100 hover:text-white bg-white/10 p-1.5 rounded-full cursor-pointer transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100 text-[11px] text-amber-800 font-medium">
                Verify each of the 8 passport-registration criteria submitted below before saving back to base database logs.
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="font-bold text-slate-700">1. Nama Lengkap (Sesuai Paspor / ID)</label>
                  <input
                    type="text"
                    value={participantFields.name}
                    onChange={(e) => setParticipantFields({ ...participantFields, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl mt-1 focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block">2. English Passport Name (UPPERCASE formats)</label>
                  <input
                    type="text"
                    value={participantFields.englishName}
                    onChange={(e) => setParticipantFields({ ...participantFields, englishName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl mt-1 focus:ring-1 focus:ring-emerald-700 uppercase"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block text-[11px]">3. WeChat Account ID</label>
                    <input
                      type="text"
                      value={participantFields.weChatId}
                      onChange={(e) => setParticipantFields({ ...participantFields, weChatId: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl mt-1 font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block text-[11px]">4. RED (XiaoHongShu ID)</label>
                    <input
                      type="text"
                      value={participantFields.xiaoHongShuId}
                      onChange={(e) => setParticipantFields({ ...participantFields, xiaoHongShuId: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl mt-1 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block">5. Current City</label>
                    <input
                      type="text"
                      value={participantFields.city}
                      onChange={(e) => setParticipantFields({ ...participantFields, city: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl mt-1"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block">6. WhatsApp (Contact)</label>
                    <input
                      type="text"
                      value={participantFields.whatsapp}
                      onChange={(e) => setParticipantFields({ ...participantFields, whatsapp: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl mt-1 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block">7. Registration Email</label>
                    <input
                      type="email"
                      value={participantFields.email}
                      onChange={(e) => setParticipantFields({ ...participantFields, email: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl mt-1 font-medium text-slate-650"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block">8. Assigned Flight Arrival/ID</label>
                    <input
                      type="text"
                      placeholder="e.g. MH370 or GA210"
                      value={participantFields.flightNumber}
                      onChange={(e) => setParticipantFields({ ...participantFields, flightNumber: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl mt-1 font-mono uppercase"
                    />
                  </div>
                </div>

              </div>

              <div className="pt-4 border-t border-slate-150 flex items-center justify-end space-x-2">
                <button type="button" onClick={() => setShowParticipantModal(false)} className="px-4 py-2 bg-slate-105 hover:bg-slate-200 text-slate-700 rounded-xl font-bold">
                  Discard
                </button>
                <button type="button" onClick={saveParticipantProfile} className="px-5 py-2 bg-[#315B4F] text-white rounded-xl font-bold shadow-sm hover:bg-emerald-900">
                  Save Profile Details
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ----------------- MODAL WIDGET 6: LIVE CUSTOMER VIEW PREVIEW POPUP ----------------- */}
      {previewTrip && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in text-xs sm:text-sm">
          <div className="bg-white rounded-3xl border border-slate-150 max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="bg-[#315B4F] text-white p-5 flex justify-between items-center text-xs">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#D6B16D] font-extrabold block">LIVE CUSTOMER PERSPECTIVE PREVIEW</span>
                <span className="font-display font-black text-sm">{previewTrip.title}</span>
              </div>
              <button onClick={() => setPreviewTrip(null)} className="text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full cursor-pointer transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-slate-700">
              
              {/* Cover */}
              <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-100 bg-slate-100 shadow-inner">
                <img src={previewTrip.coverImage} alt={previewTrip.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute top-3 left-3 bg-black/60 text-emerald-250 font-display font-black px-3 py-1 rounded-full text-[10px] shadow">
                  {previewTrip.duration}
                </div>
                <div className="absolute bottom-3 right-3 bg-white/95 text-[#315B4F] font-mono font-black p-2 rounded-xl text-center shadow-lg">
                  <span className="text-[9px] uppercase tracking-wider block text-slate-400 font-extrabold">STARTING AT</span>
                  <span className="text-sm font-extrabold">{formatUSD(previewTrip.startingPrice || 150)}</span>
                </div>
              </div>

              {/* general properties */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-150/50">
                <div className="space-y-0.5">
                  <span className="text-[9px] tracking-widest font-mono text-slate-400 block uppercase font-bold">Geographic target</span>
                  <p className="font-bold text-slate-900">{previewTrip.location}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] tracking-widest font-mono text-slate-400 block uppercase font-bold">Perks highlight</span>
                  <p className="font-bold text-slate-950 font-display">{previewTrip.highlight || "Complete luxury packages included"}</p>
                </div>
              </div>

              {/* Description summary */}
              <div className="space-y-2">
                <h4 className="font-display font-extrabold text-[#315B4F] text-xs">Aesthetic Tour description</h4>
                <p className="text-slate-600 leading-relaxed text-xs whitespace-pre-wrap">{previewTrip.description}</p>
              </div>

              {/* Itinerary listing outline */}
              {previewTrip.itinerary && previewTrip.itinerary.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-display font-extrabold text-[#315B4F] text-xs">Excursion Schedule Daily programs</h4>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {previewTrip.itinerary.map((d, dIx) => (
                      <div key={dIx} className="bg-slate-50 border border-slate-200/60 p-3 rounded-2xl">
                        <span className="font-mono text-[9px] text-[#315B4F] uppercase font-bold">DAY INDEX #{d.day} TRACK</span>
                        <h5 className="font-bold text-slate-900 text-xs">{d.title}</h5>
                        {d.description && <p className="text-[11px] text-slate-500 pt-0.5 block">{d.description}</p>}
                        
                        {(d.timeSchedules && d.timeSchedules.length > 0) && (
                          <div className="mt-2 space-y-1 border-t border-slate-200/50 pt-2">
                            {d.timeSchedules.map((ts, tIx) => (
                              <div key={tIx} className="flex space-x-2 text-[10px] items-center text-slate-600">
                                <span className="font-mono bg-white border border-slate-200 px-1 rounded text-emerald-850 font-bold">{ts.time}</span>
                                <span className="font-medium">{ts.activity}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
