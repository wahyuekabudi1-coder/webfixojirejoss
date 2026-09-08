import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  Database, Upload, Download, History, Settings, FileText, 
  MapPin, CheckCircle2, AlertTriangle, RefreshCw, Layers, 
  DollarSign, Percent, ArrowUpFromLine, Plus, Search, Trash2, 
  Edit, ArrowDownToLine, Compass, HelpCircle, Check, X, ShieldAlert,
  LayoutDashboard, Users, BarChart3, ClipboardList, Plane, TrendingUp
} from 'lucide-react';
import { TaxiMasterArea, TaxiMasterDestination, TaxiPricingRule, TaxiAreaRule, TaxiImportHistory } from '../../types';
import TaxiBookingCalendar from './TaxiBookingCalendar';
import { useApp } from '../../AppContext';

interface TaxiExcelManagerProps {
  taxiMasterAreas: TaxiMasterArea[];
  setTaxiMasterAreas: React.Dispatch<React.SetStateAction<TaxiMasterArea[]>>;
  taxiMasterDestinations: TaxiMasterDestination[];
  setTaxiMasterDestinations: React.Dispatch<React.SetStateAction<TaxiMasterDestination[]>>;
  taxiPricingRules: TaxiPricingRule[];
  setTaxiPricingRules: React.Dispatch<React.SetStateAction<TaxiPricingRule[]>>;
  taxiAreaRules: TaxiAreaRule[];
  setTaxiAreaRules: React.Dispatch<React.SetStateAction<TaxiAreaRule[]>>;
  taxiImportHistory: TaxiImportHistory[];
  setTaxiImportHistory: React.Dispatch<React.SetStateAction<TaxiImportHistory[]>>;
  currency: 'USD' | 'IDR';
  formatPrice: (usdPrice: number, idrPrice: number) => string;
  triggerToast: (msg: string) => void;
  activeTab?: 'dashboard' | 'calendar' | 'master-data' | 'pricing-engine' | 'excel-import' | 'excel-export' | 'import-history' | 'settings';
  setActiveTab?: (tab: 'dashboard' | 'calendar' | 'master-data' | 'pricing-engine' | 'excel-import' | 'excel-export' | 'import-history' | 'settings') => void;
  isDark?: boolean;
}

export default function TaxiExcelManager({
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
  currency,
  formatPrice,
  triggerToast,
  activeTab: propActiveTab,
  setActiveTab: propSetActiveTab,
  isDark = false
}: TaxiExcelManagerProps) {
  const [internalActiveTab, setInternalActiveTab] = useState<'dashboard' | 'calendar' | 'master-data' | 'pricing-engine' | 'excel-import' | 'excel-export' | 'import-history' | 'settings'>('dashboard');

  const theme = {
    card: isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm',
    innerCard: isDark ? 'bg-neutral-950 border-neutral-850' : 'bg-neutral-50 border-neutral-200',
    textPrimary: isDark ? 'text-neutral-100' : 'text-neutral-900',
    textSecondary: isDark ? 'text-neutral-400' : 'text-neutral-600',
    textMuted: isDark ? 'text-neutral-500' : 'text-neutral-400',
    border: isDark ? 'border-neutral-800' : 'border-neutral-200',
    input: isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-900',
    hover: isDark ? 'hover:bg-neutral-800/60' : 'hover:bg-neutral-100',
    tableHeader: isDark ? 'bg-neutral-950/70 text-neutral-400' : 'bg-neutral-100 text-neutral-600',
    tableRowHover: isDark ? 'hover:bg-neutral-850/50' : 'hover:bg-neutral-50'
  };

  const activeTab = propActiveTab || internalActiveTab;
  const setActiveTab = propSetActiveTab || setInternalActiveTab;

  const { bookings } = useApp();

  // Master Data sub-view
  const [masterSubTab, setMasterSubTab] = useState<'areas' | 'destinations' | 'vehicles'>('areas');

  // Search filter states
  const [searchArea, setSearchArea] = useState('');
  const [searchDest, setSearchDest] = useState('');
  const [searchPriceRule, setSearchPriceRule] = useState('');

  // Manual CRUD modals / inline forms
  const [isAreaFormOpen, setIsAreaFormOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<TaxiMasterArea | null>(null);
  const [areaForm, setAreaForm] = useState({
    id: '',
    name: '',
    code: '',
    type: 'City' as 'City' | 'Airport',
    lat: 0,
    lon: 0,
    status: 'Active' as 'Active' | 'Inactive'
  });

  const [isDestFormOpen, setIsDestFormOpen] = useState(false);
  const [editingDest, setEditingDest] = useState<TaxiMasterDestination | null>(null);
  const [destForm, setDestForm] = useState({
    id: '',
    area_id: '',
    name: '',
    lat: 0,
    lon: 0,
    status: 'Active' as 'Active' | 'Inactive'
  });

  const [isPriceRuleFormOpen, setIsPriceRuleFormOpen] = useState(false);
  const [editingPriceRule, setEditingPriceRule] = useState<TaxiPricingRule | null>(null);
  const [priceRuleForm, setPriceRuleForm] = useState({
    id: '',
    source_id: '',
    destination_id: '',
    vehicle_type: 'Standard' as 'Standard' | 'Family' | 'Premium' | 'Van',
    price_usd: 0,
    price_idr: 0,
    status: 'Active' as 'Active' | 'Inactive'
  });

  // Excel Import states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importing, setImporting] = useState(false);
  const [validationReport, setValidationReport] = useState<{
    valid: boolean;
    sheets: { name: string; rows: number; columns: string[] }[];
    errors: string[];
    warnings: string[];
    parsedData?: {
      areas: TaxiMasterArea[];
      destinations: TaxiMasterDestination[];
      pricing: TaxiPricingRule[];
      areaRules: TaxiAreaRule[];
    };
  } | null>(null);

  // Stats Card Component helper
  const StatCard = ({ title, value, label, icon: Icon, color }: { title: string; value: string | number; label: string; icon: any; color: string }) => (
    <div className={`${theme.card} border rounded-3xl p-6 flex items-center justify-between shadow-md relative overflow-hidden text-left`}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/[0.02] rounded-full blur-2xl pointer-events-none" />
      <div className="space-y-1">
        <span className={`text-[10px] font-black uppercase tracking-widest ${theme.textMuted} block`}>{title}</span>
        <h4 className={`text-2xl font-mono font-black ${theme.textPrimary}`}>{value}</h4>
        <p className={`text-[10px] ${theme.textSecondary} font-medium font-mono`}>{label}</p>
      </div>
      <div className={`p-3.5 rounded-2xl ${color} text-neutral-950`}>
        <Icon className="h-5.5 w-5.5 stroke-[2.5]" />
      </div>
    </div>
  );

  // Manual CRUD Handlers: AREAS
  const handleOpenAreaModal = (area: TaxiMasterArea | null = null) => {
    if (area) {
      setEditingArea(area);
      setAreaForm({ ...area });
    } else {
      setEditingArea(null);
      setAreaForm({
        id: `A${String(taxiMasterAreas.length + 1).padStart(3, '0')}`,
        name: '',
        code: '',
        type: 'City',
        lat: 0,
        lon: 0,
        status: 'Active'
      });
    }
    setIsAreaFormOpen(true);
  };

  const handleSaveArea = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingArea) {
      setTaxiMasterAreas(prev => prev.map(a => a.id === areaForm.id ? { ...areaForm } as TaxiMasterArea : a));
      triggerToast(`Area ${areaForm.name} berhasil diperbarui!`);
    } else {
      setTaxiMasterAreas(prev => [...prev, { ...areaForm } as TaxiMasterArea]);
      triggerToast(`Area baru ${areaForm.name} berhasil ditambahkan!`);
    }
    setIsAreaFormOpen(false);
  };

  const handleDeleteArea = (id: string) => {
    if (confirm('Yakin ingin menghapus area ini? Seluruh rute harga yang terikat dengan area ini juga akan terpengaruh.')) {
      setTaxiMasterAreas(prev => prev.filter(a => a.id !== id));
      triggerToast('Area berhasil dihapus!');
    }
  };

  // Manual CRUD Handlers: DESTINATIONS
  const handleOpenDestModal = (dest: TaxiMasterDestination | null = null) => {
    if (dest) {
      setEditingDest(dest);
      setDestForm({ ...dest });
    } else {
      setEditingDest(null);
      setDestForm({
        id: `D${String(taxiMasterDestinations.length + 1).padStart(3, '0')}`,
        area_id: taxiMasterAreas[0]?.id || '',
        name: '',
        lat: 0,
        lon: 0,
        status: 'Active'
      });
    }
    setIsDestFormOpen(true);
  };

  const handleSaveDest = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDest) {
      setTaxiMasterDestinations(prev => prev.map(d => d.id === destForm.id ? { ...destForm } as TaxiMasterDestination : d));
      triggerToast(`Destinasi ${destForm.name} berhasil diperbarui!`);
    } else {
      setTaxiMasterDestinations(prev => [...prev, { ...destForm } as TaxiMasterDestination]);
      triggerToast(`Destinasi baru ${destForm.name} berhasil ditambahkan!`);
    }
    setIsDestFormOpen(false);
  };

  const handleDeleteDest = (id: string) => {
    if (confirm('Yakin ingin menghapus destinasi ini?')) {
      setTaxiMasterDestinations(prev => prev.filter(d => d.id !== id));
      triggerToast('Destinasi berhasil dihapus!');
    }
  };

  // Manual CRUD Handlers: PRICING RULES
  const handleOpenPriceRuleModal = (rule: TaxiPricingRule | null = null) => {
    if (rule) {
      setEditingPriceRule(rule);
      setPriceRuleForm({ ...rule });
    } else {
      setEditingPriceRule(null);
      setPriceRuleForm({
        id: `P${String(taxiPricingRules.length + 1).padStart(3, '0')}`,
        source_id: taxiMasterAreas.find(a => a.type === 'Airport')?.id || taxiMasterAreas[0]?.id || '',
        destination_id: taxiMasterAreas.find(a => a.type === 'City')?.id || taxiMasterAreas[0]?.id || '',
        vehicle_type: 'Standard',
        price_usd: 25,
        price_idr: 380000,
        status: 'Active'
      });
    }
    setIsPriceRuleFormOpen(true);
  };

  const handleSavePriceRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPriceRule) {
      setTaxiPricingRules(prev => prev.map(r => r.id === priceRuleForm.id ? { ...priceRuleForm } as TaxiPricingRule : r));
      triggerToast('Aturan tarif berhasil diperbarui!');
    } else {
      setTaxiPricingRules(prev => [...prev, { ...priceRuleForm } as TaxiPricingRule]);
      triggerToast('Aturan tarif baru berhasil ditambahkan!');
    }
    setIsPriceRuleFormOpen(false);
  };

  const handleDeletePriceRule = (id: string) => {
    if (confirm('Yakin ingin menghapus aturan tarif ini?')) {
      setTaxiPricingRules(prev => prev.filter(r => r.id !== id));
      triggerToast('Aturan tarif berhasil dihapus!');
    }
  };

  // EXCEL PARSER AND REFERENTIAL INTEGRITY VALIDATOR
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      validateExcelFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      validateExcelFile(file);
    }
  };

  const validateExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const sheetsReport: { name: string; rows: number; columns: string[] }[] = [];
        const errors: string[] = [];
        const warnings: string[] = [];

        // Check required sheets
        const requiredSheets = ['Master_Areas', 'Master_Destinations', 'Pricing_Rules', 'Area_Rules'];
        const missingSheets = requiredSheets.filter(s => !workbook.SheetNames.includes(s));
        
        if (missingSheets.length > 0) {
          errors.push(`Gagal memuat workbook Excel: Sheet berikut hilang dari file: ${missingSheets.join(', ')}`);
          setValidationReport({ valid: false, sheets: [], errors, warnings });
          return;
        }

        // 1. Parse Master_Areas
        const areasSheet = workbook.Sheets['Master_Areas'];
        const areasRaw: any[] = XLSX.utils.sheet_to_json(areasSheet);
        sheetsReport.push({
          name: 'Master_Areas',
          rows: areasRaw.length,
          columns: Object.keys(areasRaw[0] || {})
        });

        const parsedAreas: TaxiMasterArea[] = [];
        areasRaw.forEach((row, idx) => {
          const rowNum = idx + 2; // header is row 1
          const id = String(row.id || row['Area ID'] || '').trim();
          const name = String(row.name || row['Area Name'] || '').trim();
          const code = String(row.code || row['Area Code'] || '').trim();
          const type = String(row.type || row['Type'] || 'City').trim() as 'City' | 'Airport';
          const lat = parseFloat(row.lat || row['Latitude'] || 0);
          const lon = parseFloat(row.lon || row['Longitude'] || 0);
          const status = String(row.status || 'Active').trim() as 'Active' | 'Inactive';

          if (!id) errors.push(`[Master_Areas] Row ${rowNum}: ID Area kosong`);
          if (!name) errors.push(`[Master_Areas] Row ${rowNum}: Nama Area kosong`);
          if (type !== 'City' && type !== 'Airport') {
            warnings.push(`[Master_Areas] Row ${rowNum}: Tipe Area "${type}" tidak standar (Harus "City" atau "Airport"). Sistem otomatis menganggap sebagai "City".`);
          }

          parsedAreas.push({ id, name, code, type: (type === 'Airport' ? 'Airport' : 'City'), lat, lon, status });
        });

        // 2. Parse Master_Destinations
        const destsSheet = workbook.Sheets['Master_Destinations'];
        const destsRaw: any[] = XLSX.utils.sheet_to_json(destsSheet);
        sheetsReport.push({
          name: 'Master_Destinations',
          rows: destsRaw.length,
          columns: Object.keys(destsRaw[0] || {})
        });

        const parsedDestinations: TaxiMasterDestination[] = [];
        destsRaw.forEach((row, idx) => {
          const rowNum = idx + 2;
          const id = String(row.id || row['Destination ID'] || '').trim();
          const area_id = String(row.area_id || row['Area ID'] || '').trim();
          const name = String(row.name || row['Destination Name'] || '').trim();
          const lat = parseFloat(row.lat || row['Latitude'] || 0);
          const lon = parseFloat(row.lon || row['Longitude'] || 0);
          const status = String(row.status || 'Active').trim() as 'Active' | 'Inactive';

          if (!id) errors.push(`[Master_Destinations] Row ${rowNum}: ID Destinasi kosong`);
          if (!area_id) errors.push(`[Master_Destinations] Row ${rowNum}: ID Area referensi kosong`);
          if (!name) errors.push(`[Master_Destinations] Row ${rowNum}: Nama Destinasi kosong`);

          // Check referential integrity for area_id
          const areaExistsInUpload = parsedAreas.some(a => a.id === area_id);
          const areaExistsInDb = taxiMasterAreas.some(a => a.id === area_id);
          if (!areaExistsInUpload && !areaExistsInDb) {
            errors.push(`[Master_Destinations] Row ${rowNum}: Referensi ID Area "${area_id}" tidak ditemukan di Master_Areas upload maupun database!`);
          }

          parsedDestinations.push({ id, area_id, name, lat, lon, status });
        });

        // 3. Parse Pricing_Rules
        const pricingSheet = workbook.Sheets['Pricing_Rules'];
        const pricingRaw: any[] = XLSX.utils.sheet_to_json(pricingSheet);
        sheetsReport.push({
          name: 'Pricing_Rules',
          rows: pricingRaw.length,
          columns: Object.keys(pricingRaw[0] || {})
        });

        const parsedPricing: TaxiPricingRule[] = [];
        pricingRaw.forEach((row, idx) => {
          const rowNum = idx + 2;
          const id = String(row.id || row['Rule ID'] || '').trim();
          const source_id = String(row.source_id || row['Source Area ID'] || '').trim();
          const destination_id = String(row.destination_id || row['Destination Area ID'] || '').trim();
          const vehicle_type = String(row.vehicle_type || row['Vehicle Type'] || 'Standard').trim() as 'Standard' | 'Family' | 'Premium' | 'Van';
          const price_usd = parseFloat(row.price_usd || row['Price USD'] || 0);
          const price_idr = parseFloat(row.price_idr || row['Price IDR'] || 0);
          const status = String(row.status || 'Active').trim() as 'Active' | 'Inactive';

          if (!id) errors.push(`[Pricing_Rules] Row ${rowNum}: ID Aturan Tarif kosong`);
          if (!source_id) errors.push(`[Pricing_Rules] Row ${rowNum}: Source Area ID kosong`);
          if (!destination_id) errors.push(`[Pricing_Rules] Row ${rowNum}: Destination Area ID kosong`);
          if (price_usd <= 0 || price_idr <= 0) {
            warnings.push(`[Pricing_Rules] Row ${rowNum}: Nominal harga USD ($${price_usd}) atau IDR (Rp ${price_idr}) bernilai 0 atau negatif.`);
          }

          // Check source referential integrity
          const sourceExists = parsedAreas.some(a => a.id === source_id) || taxiMasterAreas.some(a => a.id === source_id);
          if (!sourceExists) {
            errors.push(`[Pricing_Rules] Row ${rowNum}: ID Area Asal "${source_id}" tidak ditemukan di Master_Areas!`);
          }

          // Check destination referential integrity
          const destExists = parsedAreas.some(a => a.id === destination_id) || taxiMasterAreas.some(a => a.id === destination_id);
          if (!destExists) {
            errors.push(`[Pricing_Rules] Row ${rowNum}: ID Area Tujuan "${destination_id}" tidak ditemukan di Master_Areas!`);
          }

          parsedPricing.push({ id, source_id, destination_id, vehicle_type, price_usd, price_idr, status });
        });

        // 4. Parse Area_Rules
        const rulesSheet = workbook.Sheets['Area_Rules'];
        const rulesRaw: any[] = XLSX.utils.sheet_to_json(rulesSheet);
        sheetsReport.push({
          name: 'Area_Rules',
          rows: rulesRaw.length,
          columns: Object.keys(rulesRaw[0] || {})
        });

        const parsedAreaRules: TaxiAreaRule[] = [];
        rulesRaw.forEach((row, idx) => {
          const rowNum = idx + 2;
          const id = String(row.id || row['Rule ID'] || '').trim();
          const area_id = String(row.area_id || row['Area ID'] || '').trim();
          const surcharge_usd = parseFloat(row.surcharge_usd || row['Surcharge USD'] || 0);
          const surcharge_idr = parseFloat(row.surcharge_idr || row['Surcharge IDR'] || 0);
          const is_blackout_val = row.is_blackout || row['Is Blackout'] || false;
          const is_blackout = is_blackout_val === true || String(is_blackout_val).toLowerCase() === 'true' || is_blackout_val === 1 || String(is_blackout_val).toLowerCase() === 'yes';
          const note = String(row.note || '').trim();

          if (!id) errors.push(`[Area_Rules] Row ${rowNum}: ID Aturan Surcharge kosong`);
          if (!area_id) errors.push(`[Area_Rules] Row ${rowNum}: Referensi ID Area kosong`);

          const areaExists = parsedAreas.some(a => a.id === area_id) || taxiMasterAreas.some(a => a.id === area_id);
          if (!areaExists) {
            errors.push(`[Area_Rules] Row ${rowNum}: ID Area "${area_id}" tidak ditemukan di Master_Areas!`);
          }

          parsedAreaRules.push({ id, area_id, surcharge_usd, surcharge_idr, is_blackout, note });
        });

        const isValid = errors.length === 0;
        setValidationReport({
          valid: isValid,
          sheets: sheetsReport,
          errors,
          warnings,
          parsedData: isValid ? {
            areas: parsedAreas,
            destinations: parsedDestinations,
            pricing: parsedPricing,
            areaRules: parsedAreaRules
          } : undefined
        });

      } catch (err: any) {
        setValidationReport({
          valid: false,
          sheets: [],
          errors: [`Gagal membaca struktur berkas Excel: ${err.message || err}`],
          warnings: []
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExecuteImport = () => {
    if (!validationReport || !validationReport.parsedData) {
      triggerToast('Unggah berkas Excel valid terlebih dahulu!');
      return;
    }

    setImporting(true);
    setImportProgress(10);

    const data = validationReport.parsedData;
    
    // Simulate pipeline loading progress
    const interval = setInterval(() => {
      setImportProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          
          // Complete import - overwrite local state
          setTaxiMasterAreas(data.areas);
          setTaxiMasterDestinations(data.destinations);
          setTaxiPricingRules(data.pricing);
          setTaxiAreaRules(data.areaRules);

          // Calculate import metrics
          const totalRowsImported = data.areas.length + data.destinations.length + data.pricing.length + data.areaRules.length;
          
          // Append to import history
          const newHistoryItem: TaxiImportHistory = {
            id: `IMP-${String(taxiImportHistory.length + 1).padStart(3, '0')}`,
            date: new Date().toISOString().replace('T', ' ').slice(0, 16),
            filename: selectedFile?.name || 'uploaded_data.xlsx',
            importedBy: 'Super Administrator',
            importedRows: totalRowsImported,
            updatedRows: 0,
            skippedRows: 0,
            failedRows: 0,
            status: 'Success',
            log: [
              `Successfully parsed and loaded Master Areas: ${data.areas.length} records.`,
              `Successfully parsed and loaded Destinations: ${data.destinations.length} records.`,
              `Successfully loaded Pricing Engine rules: ${data.pricing.length} records.`,
              `Successfully updated Area Rules & Dispatch restrictions: ${data.areaRules.length} records.`
            ]
          };

          setTaxiImportHistory(prev => [newHistoryItem, ...prev]);
          setImporting(false);
          setSelectedFile(null);
          setValidationReport(null);
          setActiveTab('dashboard');
          triggerToast(`Sinkronisasi Sukses! ${totalRowsImported} baris data taksi berhasil diimpor.`);
          return 100;
        }
        return p + 30;
      });
    }, 400);
  };

  // EXCEL EXPORTER
  const handleExportSystemData = () => {
    const wb = XLSX.utils.book_new();

    // Map system data to structured sheet sheets
    const areasWS = XLSX.utils.json_to_sheet(taxiMasterAreas);
    XLSX.utils.book_append_sheet(wb, areasWS, 'Master_Areas');

    const destsWS = XLSX.utils.json_to_sheet(taxiMasterDestinations);
    XLSX.utils.book_append_sheet(wb, destsWS, 'Master_Destinations');

    const pricingWS = XLSX.utils.json_to_sheet(taxiPricingRules);
    XLSX.utils.book_append_sheet(wb, pricingWS, 'Pricing_Rules');

    const areaRulesWS = XLSX.utils.json_to_sheet(taxiAreaRules);
    XLSX.utils.book_append_sheet(wb, areaRulesWS, 'Area_Rules');

    XLSX.writeFile(wb, `sawah_jaya_taxi_database_${new Date().toISOString().slice(0, 10)}.xlsx`);
    triggerToast('Database rute taksi berhasil diekspor ke Excel!');
  };

  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new();

    const sampleAreas = [
      { id: "A001", name: "Surabaya", code: "SUB", type: "City", lat: -7.2575, lon: 112.7521, status: "Active" },
      { id: "A002", name: "Malang", code: "MLG", type: "City", lat: -7.9653, lon: 112.6214, status: "Active" },
      { id: "A007", name: "Juanda Airport (SUB)", code: "SUB", type: "Airport", lat: -7.3798, lon: 112.7874, status: "Active" },
      { id: "A008", name: "Ngurah Rai Airport (DPS)", code: "DPS", type: "Airport", lat: -8.7481, lon: 115.1674, status: "Active" }
    ];

    const sampleDests = [
      { id: "D001", area_id: "A001", name: "Tunjungan Plaza Area", lat: -7.2625, lon: 112.7381, status: "Active" },
      { id: "D002", area_id: "A002", name: "Stasiun Malang Kotabaru", lat: -7.9775, lon: 112.6375, status: "Active" },
      { id: "D003", area_id: "A001", name: "Grand City Mall", lat: -7.2612, lon: 112.7490, status: "Active" }
    ];

    const samplePricing = [
      { id: "P001_S", source_id: "A007", destination_id: "A001", vehicle_type: "Standard", price_usd: 25, price_idr: 380000, status: "Active" },
      { id: "P001_F", source_id: "A007", destination_id: "A001", vehicle_type: "Family", price_usd: 30, price_idr: 450000, status: "Active" },
      { id: "P002_S", source_id: "A007", destination_id: "A002", vehicle_type: "Standard", price_usd: 60, price_idr: 910000, status: "Active" }
    ];

    const sampleAreaRules = [
      { id: "AR001", area_id: "A007", surcharge_usd: 3, surcharge_idr: 45000, is_blackout: false, note: "Juanda Airport Pickup Surcharge" },
      { id: "AR002", area_id: "A008", surcharge_usd: 5, surcharge_idr: 75000, is_blackout: false, note: "Ngurah Rai Airport Surcharge" }
    ];

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sampleAreas), 'Master_Areas');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sampleDests), 'Master_Destinations');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(samplePricing), 'Pricing_Rules');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sampleAreaRules), 'Area_Rules');

    XLSX.writeFile(wb, 'sawah_jaya_taxi_template.xlsx');
    triggerToast('Berkas Excel Template Rute berhasil diunduh!');
  };

  // Helper getters
  const getAreaName = (areaId: string) => {
    return taxiMasterAreas.find(a => a.id === areaId)?.name || areaId;
  };

  // Filter lists
  const filteredAreas = taxiMasterAreas.filter(a => 
    a.name.toLowerCase().includes(searchArea.toLowerCase()) || 
    a.code.toLowerCase().includes(searchArea.toLowerCase()) ||
    a.id.toLowerCase().includes(searchArea.toLowerCase())
  );

  const filteredDests = taxiMasterDestinations.filter(d => {
    const parentArea = getAreaName(d.area_id);
    return d.name.toLowerCase().includes(searchDest.toLowerCase()) || 
      d.id.toLowerCase().includes(searchDest.toLowerCase()) ||
      parentArea.toLowerCase().includes(searchDest.toLowerCase());
  });

  const filteredPricingRules = taxiPricingRules.filter(r => {
    const sourceName = getAreaName(r.source_id);
    const destName = getAreaName(r.destination_id);
    const text = `${sourceName} ${destName} ${r.vehicle_type} ${r.id}`.toLowerCase();
    return text.includes(searchPriceRule.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Dynamic Header */}
      {activeTab !== 'dashboard' && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-850 pb-4">
          <div>
            <span className="text-[9px] font-black tracking-widest text-amber-500 uppercase font-mono">WORKSPACE REVISI PORTAL INTERNAL</span>
            <h2 className="text-xl font-black text-neutral-100 flex items-center gap-2 mt-0.5 tracking-tight font-mono">
              <Layers className="h-5.5 w-5.5 text-amber-500 shrink-0" />
              <span>EXCEL-DRIVEN TAXI DISPATCH CONTROL</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Portal integrasi data ribuan rute taksi Smart Journey secara kilat dengan template spreadsheet Excel multi-sheet.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <button 
              onClick={handleDownloadTemplate}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-200 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow"
            >
              <Download className="h-4 w-4 text-amber-500" />
              <span>Unduh Template Excel</span>
            </button>
            <button 
              onClick={handleExportSystemData}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <ArrowDownToLine className="h-4 w-4 text-neutral-950 stroke-[2.5]" />
              <span>Ekspor Live Database</span>
            </button>
          </div>
        </div>
      )}



      {/* MAIN VIEW CONTROLLER */}
      <div className="space-y-6">

        {/* 1. DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (() => {
          const taxiBookings = bookings.filter(b => b.type === 'taxi');
          const totalSalesUSD = taxiBookings.filter(b => b.status === 'Completed' || b.status === 'Confirmed').reduce((sum, b) => sum + (b.totalPrice || 0), 0);
          const totalSalesIDR = taxiBookings.filter(b => b.status === 'Completed' || b.status === 'Confirmed').reduce((sum, b) => sum + (b.totalPriceIDR || 0), 0);
          const activeTrips = taxiBookings.filter(b => b.status === 'Confirmed').length;
          const completedTrips = taxiBookings.filter(b => b.status === 'Completed').length;
          const pendingTrips = taxiBookings.filter(b => b.status === 'Pending').length;

          // Split types of areas
          const totalAreas = taxiMasterAreas.length;
          const airportAreasCount = taxiMasterAreas.filter(a => a.type === 'Airport').length;
          const cityAreasCount = taxiMasterAreas.filter(a => a.type === 'City').length;
          const airportPct = totalAreas ? Math.round((airportAreasCount / totalAreas) * 100) : 0;
          const cityPct = totalAreas ? Math.round((cityAreasCount / totalAreas) * 100) : 0;

          // Surcharge details
          const activeSurchargesCount = taxiAreaRules.filter(r => (r.surcharge_usd > 0 || r.surcharge_idr > 0) && !r.is_blackout).length;
          const blackoutZonesCount = taxiAreaRules.filter(r => r.is_blackout).length;

          return (
            <div className="space-y-6 animate-fade-in">
              {/* Header banner */}
              <div className={`${theme.card} border rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
                <div className="space-y-1 text-left">
                  <h3 className="text-base font-black uppercase tracking-wider font-mono text-amber-500 flex items-center gap-2">
                    <MapPin className="h-4.5 w-4.5" />
                    ANALITIK DEPARTEMEN TAXI DISPATCH SERVICE
                  </h3>
                  <p className={`text-xs ${theme.textSecondary}`}>
                    Tinjauan metrik operasional armada taksi, volume penugasan supir aktif, statistik area penjemputan, dan sebaran tarif wilayah Bali.
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full shrink-0">
                  DIVISI: SJT_TAXI_DISPATCH
                </span>
              </div>

              {/* Stats Panel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                  title="Jangkauan Wilayah" 
                  value={`${totalAreas} Area`} 
                  label={`${taxiMasterDestinations.length} Titik Koordinat`} 
                  icon={MapPin} 
                  color="bg-amber-500" 
                />
                <StatCard 
                  title="Omset Penjualan Taksi" 
                  value={formatPrice(totalSalesUSD, totalSalesIDR)} 
                  label={`Dari ${completedTrips + activeTrips} Trip Disetujui`} 
                  icon={DollarSign} 
                  color="bg-emerald-500" 
                />
                <StatCard 
                  title="Booking Aktif" 
                  value={`${activeTrips} Active`} 
                  label={`${pendingTrips} Pending Dispatch`} 
                  icon={ClipboardList} 
                  color="bg-indigo-500" 
                />
                <StatCard 
                  title="Aturan Tarif Rute" 
                  value={`${taxiPricingRules.length} Rute`} 
                  label={`${activeSurchargesCount} Surcharge • ${blackoutZonesCount} Blackout`} 
                  icon={Layers} 
                  color="bg-rose-500" 
                />
              </div>

              {/* Quick action grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Area & Surcharge Distribution */}
                <div className={`${theme.card} border rounded-2xl p-6 space-y-4`}>
                  <h4 className="text-xs font-black uppercase tracking-widest font-mono text-amber-500 border-b border-neutral-850 pb-2 text-left">
                    Distribusi Zona Operasional
                  </h4>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-1 text-left">
                      <div className="flex justify-between items-center text-xs">
                        <span className={`font-extrabold ${theme.textPrimary}`}>Terminal Bandara (Airport)</span>
                        <span className={`font-mono font-bold ${theme.textSecondary}`}>{airportAreasCount} Zona ({airportPct}%)</span>
                      </div>
                      <div className={`h-1.5 w-full ${theme.innerCard} rounded-full overflow-hidden`}>
                        <div className="h-full bg-amber-500" style={{ width: `${airportPct}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1 text-left">
                      <div className="flex justify-between items-center text-xs">
                        <span className={`font-extrabold ${theme.textPrimary}`}>Kawasan Kota &amp; Wisata (City)</span>
                        <span className={`font-mono font-bold ${theme.textSecondary}`}>{cityAreasCount} Zona ({cityPct}%)</span>
                      </div>
                      <div className={`h-1.5 w-full ${theme.innerCard} rounded-full overflow-hidden`}>
                        <div className="h-full bg-amber-500" style={{ width: `${cityPct}%` }} />
                      </div>
                    </div>

                    <div className="border-t border-neutral-850 pt-4 space-y-3">
                      <span className={`text-[10px] font-mono font-black ${theme.textMuted} uppercase block tracking-wider text-left`}>STATUS DISPATCHER RATE</span>
                      <div className={`p-3 ${theme.innerCard} rounded-xl border flex items-center justify-between`}>
                        <div className="text-left">
                          <span className={`text-xs font-bold ${theme.textPrimary} block`}>Surcharge Peak-Season</span>
                          <span className={`text-[10px] ${theme.textMuted} font-mono`}>Diatur via Aturan Dispatcher</span>
                        </div>
                        <span className="text-[9px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Active Normal
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Live Dispatch Monitor */}
                <div className={`lg:col-span-2 ${theme.card} border rounded-2xl p-6 space-y-4`}>
                  <h4 className="text-xs font-black uppercase tracking-widest font-mono text-amber-500 border-b border-neutral-850 pb-2 flex justify-between items-center">
                    <span>Terminal Dispatch Taksi Terkini</span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono font-bold animate-pulse">● LIVE DISPATCH LINKED</span>
                  </h4>

                  <div className="space-y-3 pt-2">
                    {taxiBookings.length > 0 ? (
                      taxiBookings.slice(0, 4).map((b) => {
                        const details = b.details || {};
                        const statusColor = b.status === 'Completed'
                          ? 'bg-neutral-800 text-neutral-400 border border-neutral-750'
                          : b.status === 'Confirmed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : b.status === 'Pending'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20';

                        return (
                          <div 
                            key={b.id} 
                            className={`flex flex-col md:flex-row justify-between items-start md:items-center p-3.5 rounded-xl ${theme.innerCard} border text-xs text-left gap-3.5 ${theme.hover} transition-all`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0 font-black text-[11px] font-mono">
                                🚖
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-black text-amber-500 text-xs">{b.id}</span>
                                  <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full ${statusColor}`}>
                                    {b.status === 'Confirmed' ? 'AKTIF' : b.status === 'Completed' ? 'SELESAI' : b.status}
                                  </span>
                                </div>
                                <h5 className={`font-extrabold ${theme.textPrimary}`}>{b.customerName} • <span className={`font-mono ${theme.textMuted} text-[10px]`}>{b.customerPhone}</span></h5>
                                <div className={`text-[10px] ${theme.textSecondary} flex items-center gap-1.5 leading-tight`}>
                                  <span className={`font-bold ${theme.textPrimary}`}>{details.pickupLocation || 'Pickup'}</span>
                                  <span className="text-amber-500 font-bold">➔</span>
                                  <span className={`font-bold ${theme.textPrimary}`}>{details.destination || 'Destination'}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right w-full md:w-auto shrink-0 pt-2.5 md:pt-0 border-t md:border-t-0 border-neutral-850/60 flex md:flex-col justify-between items-center md:items-end">
                              <span className="text-xs font-mono font-black text-emerald-500">
                                {formatPrice(b.totalPrice, b.totalPriceIDR)}
                              </span>
                              <span className={`text-[10px] ${theme.textMuted} font-mono font-bold mt-0.5 block`}>Pukul {details.time || '--:--'} WIB</span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className={`text-center py-12 text-xs ${theme.textMuted} font-mono space-y-2 border-2 border-dashed ${theme.border} rounded-2xl ${theme.innerCard}`}>
                        <MapPin className="h-8 w-8 text-neutral-500 mx-auto animate-pulse" />
                        <div>Belum ada data trip taksi terdaftar.</div>
                        <p className={`text-[10px] ${theme.textSecondary} max-w-md mx-auto`}>Gunakan halaman Kalender Booking atau menu Excel Import untuk memperbarui data trip layanan taksi.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* TAXI BOOKING CALENDAR */}
        {activeTab === 'calendar' && (
          <div className="animate-fade-in">
            <TaxiBookingCalendar />
          </div>
        )}

        {/* 2. MASTER DATA (ZONES & PLACES) */}
        {activeTab === 'master-data' && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              {/* Master sub tabs */}
              <div className="flex bg-neutral-950 p-1 border border-neutral-850 rounded-xl gap-1">
                <button
                  onClick={() => setMasterSubTab('areas')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    masterSubTab === 'areas' ? 'bg-amber-500 text-neutral-950 font-black' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  📍 Master Area (Zones)
                </button>
                <button
                  onClick={() => setMasterSubTab('destinations')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    masterSubTab === 'destinations' ? 'bg-amber-500 text-neutral-950 font-black' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  🗺️ Master Destinasi (Places)
                </button>
              </div>

              {masterSubTab === 'areas' ? (
                <button 
                  onClick={() => handleOpenAreaModal()}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Plus className="h-4 w-4" />
                  <span>Tambah Area Baru</span>
                </button>
              ) : (
                <button 
                  onClick={() => handleOpenDestModal()}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Plus className="h-4 w-4" />
                  <span>Tambah Destinasi Baru</span>
                </button>
              )}
            </div>

            {/* TAB: AREAS SUB LIST */}
            {masterSubTab === 'areas' && (
              <div className="space-y-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Cari area, kode, atau ID..." 
                      value={searchArea}
                      onChange={(e) => setSearchArea(e.target.value)}
                      className="w-full bg-white border border-slate-300 pl-10 pr-4 py-2 text-xs rounded-xl focus:outline-none focus:border-amber-500 text-slate-900 placeholder:text-slate-500 font-medium" 
                    />
                  </div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-neutral-950 text-neutral-400 font-bold uppercase text-[9px] tracking-widest border-b border-neutral-850">
                        <tr>
                          <th className="p-4">KODE ID</th>
                          <th className="p-4">NAMA AREA</th>
                          <th className="p-4">KODE KHUSUS</th>
                          <th className="p-4">TIPE</th>
                          <th className="p-4 font-mono">LOKASI (LAT, LON)</th>
                          <th className="p-4">STATUS</th>
                          <th className="p-4 text-right">TINDAKAN</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-850 font-medium">
                        {filteredAreas.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-neutral-500 font-mono">Tidak ada area yang cocok dengan pencarian Anda.</td>
                          </tr>
                        ) : (
                          filteredAreas.map((area) => (
                            <tr key={area.id} className="hover:bg-neutral-850/20 transition-all">
                              <td className="p-4 font-mono font-bold text-amber-500">{area.id}</td>
                              <td className="p-4 font-extrabold text-neutral-100">{area.name}</td>
                              <td className="p-4 font-mono font-bold text-indigo-400">{area.code}</td>
                              <td className="p-4">
                                <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded border ${
                                  area.type === 'Airport' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                }`}>
                                  {area.type}
                                </span>
                              </td>
                              <td className="p-4 font-mono text-neutral-400">{area.lat}, {area.lon}</td>
                              <td className="p-4">
                                <button
                                  onClick={() => {
                                    setTaxiMasterAreas(prev => prev.map(a => a.id === area.id ? { ...a, status: (a.status === 'Active' ? 'Inactive' : 'Active') as 'Active' | 'Inactive' } : a));
                                    triggerToast(`Status area ${area.name} diubah.`);
                                  }}
                                  className={`text-[9px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full border transition-all cursor-pointer ${
                                    area.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                                  }`}
                                >
                                  {area.status}
                                </button>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => handleOpenAreaModal(area)} className="p-1.5 border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-amber-500 rounded-lg cursor-pointer transition-all" title="Ubah">
                                    <Edit className="h-3.5 w-3.5" />
                                  </button>
                                  <button onClick={() => handleDeleteArea(area.id)} className="p-1.5 border border-rose-500/10 bg-rose-500/5 hover:bg-rose-500/15 text-rose-400 rounded-lg cursor-pointer transition-all" title="Hapus">
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
            )}

            {/* TAB: DESTINATIONS SUB LIST */}
            {masterSubTab === 'destinations' && (
              <div className="space-y-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Cari destinasi, tempat, area..." 
                      value={searchDest}
                      onChange={(e) => setSearchDest(e.target.value)}
                      className="w-full bg-white border border-slate-300 pl-10 pr-4 py-2 text-xs rounded-xl focus:outline-none focus:border-amber-500 text-slate-900 placeholder:text-slate-500 font-medium" 
                    />
                  </div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-neutral-950 text-neutral-400 font-bold uppercase text-[9px] tracking-widest border-b border-neutral-850">
                        <tr>
                          <th className="p-4">KODE ID</th>
                          <th className="p-4">NAMA DESTINASI</th>
                          <th className="p-4">AREA ZONA REFF</th>
                          <th className="p-4 font-mono">LATITUDE &amp; LONGITUDE</th>
                          <th className="p-4">STATUS</th>
                          <th className="p-4 text-right">TINDAKAN</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-850 font-medium">
                        {filteredDests.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-neutral-500 font-mono">Tidak ada destinasi yang cocok dengan pencarian Anda.</td>
                          </tr>
                        ) : (
                          filteredDests.map((dest) => (
                            <tr key={dest.id} className="hover:bg-neutral-850/20 transition-all">
                              <td className="p-4 font-mono font-bold text-amber-500">{dest.id}</td>
                              <td className="p-4 font-extrabold text-neutral-100">{dest.name}</td>
                              <td className="p-4">
                                <span className="font-semibold text-neutral-300">📍 {getAreaName(dest.area_id)}</span>
                                <span className="text-[10px] text-neutral-500 font-mono block mt-0.5">ID: {dest.area_id}</span>
                              </td>
                              <td className="p-4 font-mono text-neutral-400">{dest.lat}, {dest.lon}</td>
                              <td className="p-4">
                                <button
                                  onClick={() => {
                                    setTaxiMasterDestinations(prev => prev.map(d => d.id === dest.id ? { ...d, status: (d.status === 'Active' ? 'Inactive' : 'Active') as 'Active' | 'Inactive' } : d));
                                    triggerToast(`Status destinasi ${dest.name} diubah.`);
                                  }}
                                  className={`text-[9px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full border transition-all cursor-pointer ${
                                    dest.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                                  }`}
                                >
                                  {dest.status}
                                </button>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => handleOpenDestModal(dest)} className="p-1.5 border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-amber-500 rounded-lg cursor-pointer transition-all" title="Ubah">
                                    <Edit className="h-3.5 w-3.5" />
                                  </button>
                                  <button onClick={() => handleDeleteDest(dest.id)} className="p-1.5 border border-rose-500/10 bg-rose-500/5 hover:bg-rose-500/15 text-rose-400 rounded-lg cursor-pointer transition-all" title="Hapus">
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
            )}
          </div>
        )}

        {/* 3. PRICING ENGINE */}
        {activeTab === 'pricing-engine' && (
          <div className="space-y-4 animate-fade-in text-left">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Cari rute harga, mobil, atau ID..." 
                  value={searchPriceRule}
                  onChange={(e) => setSearchPriceRule(e.target.value)}
                  className="w-full bg-white border border-slate-300 pl-10 pr-4 py-2 text-xs rounded-xl focus:outline-none focus:border-amber-500 text-slate-900 placeholder:text-slate-500 font-medium" 
                />
              </div>

              <button 
                onClick={() => handleOpenPriceRuleModal()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shrink-0"
              >
                <Plus className="h-4 w-4 text-neutral-950 stroke-[2.5]" />
                <span>Tambah Aturan Tarif</span>
              </button>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-950 text-neutral-400 font-bold uppercase text-[9px] tracking-widest border-b border-neutral-850">
                    <tr>
                      <th className="p-4">KODE ID</th>
                      <th className="p-4">ZONA ASAL</th>
                      <th className="p-4">ZONA TUJUAN</th>
                      <th className="p-4">TIPE MOBIL</th>
                      <th className="p-4 text-right">TARIF USD</th>
                      <th className="p-4 text-right">TARIF IDR</th>
                      <th className="p-4">STATUS</th>
                      <th className="p-4 text-right">TINDAKAN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-850 font-medium">
                    {filteredPricingRules.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-neutral-500 font-mono">Belum ada aturan tarif harga taksi yang terdaftar.</td>
                      </tr>
                    ) : (
                      filteredPricingRules.map((rule) => (
                        <tr key={rule.id} className="hover:bg-neutral-850/20 transition-all">
                          <td className="p-4 font-mono font-bold text-amber-500">{rule.id}</td>
                          <td className="p-4 font-bold text-neutral-200">{getAreaName(rule.source_id)}</td>
                          <td className="p-4 font-bold text-neutral-200">{getAreaName(rule.destination_id)}</td>
                          <td className="p-4 font-extrabold font-mono text-indigo-400">{rule.vehicle_type}</td>
                          <td className="p-4 text-right font-mono font-black text-emerald-400">${rule.price_usd}</td>
                          <td className="p-4 text-right font-mono font-black text-emerald-400">Rp {rule.price_idr.toLocaleString('id-ID')}</td>
                          <td className="p-4">
                            <button
                              onClick={() => {
                                setTaxiPricingRules(prev => prev.map(r => r.id === rule.id ? { ...r, status: (r.status === 'Active' ? 'Inactive' : 'Active') as 'Active' | 'Inactive' } : r));
                                triggerToast(`Status tarif ${rule.id} diubah.`);
                              }}
                              className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                                rule.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                              }`}
                            >
                              {rule.status}
                            </button>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => handleOpenPriceRuleModal(rule)} className="p-1.5 border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-amber-500 rounded-lg cursor-pointer transition-all" title="Ubah">
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => handleDeletePriceRule(rule.id)} className="p-1.5 border border-rose-500/10 bg-rose-500/5 hover:bg-rose-500/15 text-rose-400 rounded-lg cursor-pointer transition-all" title="Hapus">
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
        )}

        {/* 4. EXCEL IMPORT MODULE */}
        {activeTab === 'excel-import' && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-base font-black font-mono text-amber-500 border-b border-neutral-850 pb-3 flex items-center gap-2">
                <Upload className="h-5 w-5" />
                <span>UNGGAH DATA TAXI EXCEL</span>
              </h3>
              
              <p className="text-xs text-neutral-400 leading-relaxed">
                Anda dapat mengunggah berkas Excel (.xlsx) untuk mengganti seluruh database rute taksi dalam sekali sinkronisasi. Sistem akan secara otomatis memvalidasi format, tipe data, dan integritas referensi ID Area sebelum memprosesnya ke database.
              </p>

              {/* Drag and Drop Zone */}
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-neutral-850 hover:border-amber-500/50 bg-neutral-950/40 p-12 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all space-y-3 relative group"
              >
                <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-500 group-hover:scale-105 transition-transform">
                  <ArrowUpFromLine className="h-8 w-8" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-neutral-200">
                    {selectedFile ? selectedFile.name : 'Tarik & Letakkan file Excel di sini atau klik untuk jelajahi'}
                  </h4>
                  <p className="text-[10px] text-neutral-500 font-mono mt-1">Hanya mendukung format .xlsx berkas multi-sheet</p>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".xlsx" 
                  className="hidden" 
                />
              </div>

              {/* Validation Status Report */}
              {validationReport && (
                <div className="border border-neutral-850 rounded-2xl overflow-hidden text-xs">
                  <div className={`p-4 font-mono font-black tracking-wider flex justify-between items-center ${
                    validationReport.valid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    <span className="flex items-center gap-1.5">
                      {validationReport.valid ? (
                        <>
                          <CheckCircle2 className="h-4.5 w-4.5" />
                          <span>HASIL VALIDASI: BERKAS BERSIH DAN SIAP DIIMPOR</span>
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="h-4.5 w-4.5" />
                          <span>HASIL VALIDASI: DITEMUKAN ERROR PARSING (IMPORT DIBLOKIR)</span>
                        </>
                      )}
                    </span>
                    <span className="text-[10px] bg-neutral-950/60 px-3 py-1 rounded-full border border-current">
                      {validationReport.valid ? 'VALIDATED' : 'FAILED'}
                    </span>
                  </div>

                  <div className="p-5 bg-neutral-950 space-y-4 max-h-[300px] overflow-y-auto no-scrollbar">
                    {/* Sheets Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
                      {validationReport.sheets.map((s, i) => (
                        <div key={i} className="bg-neutral-900 border border-neutral-850 p-3 rounded-xl">
                          <span className="text-[9px] text-neutral-500 font-mono block">SHEET NAME</span>
                          <strong className="text-neutral-200 block text-[11px] mt-0.5">{s.name}</strong>
                          <span className="text-[10px] text-amber-500 font-mono font-bold block mt-1">{s.rows} Baris Data</span>
                        </div>
                      ))}
                    </div>

                    {/* Warnings log */}
                    {validationReport.warnings.length > 0 && (
                      <div className="space-y-1.5 text-left text-amber-400">
                        <span className="text-[9px] font-mono font-black text-neutral-500 uppercase block tracking-widest">PERINGATAN SISTEM (WARNINGS):</span>
                        {validationReport.warnings.map((w, i) => (
                          <div key={i} className="flex gap-2 text-[10px] font-mono bg-amber-500/[0.03] border border-amber-500/10 p-2 rounded-lg">
                            <span>⚠</span>
                            <span>{w}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Errors log */}
                    {validationReport.errors.length > 0 ? (
                      <div className="space-y-1.5 text-left text-rose-400">
                        <span className="text-[9px] font-mono font-black text-neutral-500 uppercase block tracking-widest">KESALAHAN STRUKTUR &amp; REFERENSI (ERRORS):</span>
                        {validationReport.errors.map((e, i) => (
                          <div key={i} className="flex gap-2 text-[10px] font-mono bg-rose-500/[0.03] border border-rose-500/10 p-2 rounded-lg">
                            <span>❌</span>
                            <span>{e}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-neutral-500 font-mono text-center">Integritas referensi antar lembar sheet 100% tervalidasi sukses.</p>
                    )}
                  </div>

                  {/* Actions to Import */}
                  <div className="p-4 bg-neutral-900 border-t border-neutral-850 flex justify-end gap-2.5">
                    <button 
                      onClick={() => { setSelectedFile(null); setValidationReport(null); }}
                      className="px-5 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 text-xs font-bold hover:text-white transition-all cursor-pointer"
                    >
                      Batal Unggah
                    </button>
                    <button 
                      onClick={handleExecuteImport}
                      disabled={!validationReport.valid || importing}
                      className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-neutral-800 disabled:text-neutral-500 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      {importing ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin text-neutral-950" />
                          <span>Mengimpor data ({importProgress}%) ...</span>
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 text-neutral-950 stroke-[2.5]" />
                          <span>Sinkronisasikan ke Database</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. EXCEL EXPORT MODULE */}
        {activeTab === 'excel-export' && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between shadow-md">
                <div className="space-y-2">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <FileText className="h-5 w-5 animate-pulse" />
                  </div>
                  <h4 className="text-sm font-black uppercase tracking-wider font-mono">Template Berkas Kosong</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Unduh file Excel kosong dengan baris contoh minimal yang sudah dikonfigurasikan dengan format relasional Smart Journey. Sangat tepat digunakan sebagai acuan awal sebelum Anda membuat daftar rute Anda sendiri.
                  </p>
                </div>
                <button 
                  onClick={handleDownloadTemplate}
                  className="w-full py-3 rounded-xl bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 text-neutral-200 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-4 shadow"
                >
                  <Download className="h-4 w-4 text-amber-500" />
                  <span>Unduh XLS Template Rute</span>
                </button>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between shadow-md">
                <div className="space-y-2">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-black uppercase tracking-wider font-mono">Ekspor Cadangan Live Database</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Mencadangkan seluruh data rute taksi, titik penjemputan destinasi, tarif multi-tipe kendaraan, dan surcharge operasional dispatcher yang sedang berjalan di sistem pariwisata utama Anda saat ini ke berkas Excel.
                  </p>
                </div>
                <button 
                  onClick={handleExportSystemData}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-4 shadow-md"
                >
                  <ArrowDownToLine className="h-4 w-4 text-neutral-950 stroke-[2.5]" />
                  <span>Unduh Live Database (.xlsx)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 6. IMPORT HISTORY */}
        {activeTab === 'import-history' && (
          <div className="space-y-4 animate-fade-in text-left">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-950 text-neutral-400 font-bold uppercase text-[9px] tracking-widest border-b border-neutral-850">
                    <tr>
                      <th className="p-4">KODE IMPORT ID</th>
                      <th className="p-4">WAKTU &amp; TANGGAL</th>
                      <th className="p-4">NAMA BERKAS EXCEL</th>
                      <th className="p-4">PELAKSANA</th>
                      <th className="p-4 text-center">JUMLAH BARIS DIIMPOR</th>
                      <th className="p-4">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-850 font-medium">
                    {taxiImportHistory.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-neutral-500 font-mono">Belum ada catatan import rute dalam sistem database Anda.</td>
                      </tr>
                    ) : (
                      taxiImportHistory.map((history) => (
                        <tr key={history.id} className="hover:bg-neutral-850/20 transition-all">
                          <td className="p-4 font-mono font-bold text-amber-500">{history.id}</td>
                          <td className="p-4 font-mono text-neutral-300">{history.date}</td>
                          <td className="p-4 font-extrabold text-neutral-100 flex items-center gap-1.5 mt-1.5">
                            <FileText className="h-4 w-4 text-amber-500 shrink-0" />
                            <span>{history.filename}</span>
                          </td>
                          <td className="p-4 font-semibold text-neutral-400">{history.importedBy}</td>
                          <td className="p-4 text-center font-mono font-black text-amber-500">{history.importedRows} Baris</td>
                          <td className="p-4">
                            <span className="text-[10px] font-mono font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                              {history.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 7. SETTINGS & DISPATCHER SURCHARGES */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-base font-black font-mono text-amber-500 border-b border-neutral-850 pb-3 flex items-center gap-2">
                <Settings className="h-5 w-5 text-amber-500" />
                <span>ATURAN SURCHARGE &amp; BLACKOUT AREA</span>
              </h3>
              
              <p className="text-xs text-neutral-400 leading-relaxed">
                Konfigurasikan biaya tambahan surcharge dispatcher (seperti retribusi bandara, fee tol lokal, dll.) atau buat area tertutup sementara (blackout) untuk menghentikan dispatcher taksi melayani wilayah tersebut secara manual.
              </p>

              <div className="bg-neutral-950 rounded-2xl overflow-hidden mt-4 border border-neutral-850">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-900/60 text-neutral-400 font-bold uppercase text-[9px] tracking-widest border-b border-neutral-850">
                      <tr>
                        <th className="p-4">ID ATURAN</th>
                        <th className="p-4">WILAYAH AREA TARGET</th>
                        <th className="p-4 text-right">BIAYA TAMBAHAN USD</th>
                        <th className="p-4 text-right">BIAYA TAMBAHAN IDR</th>
                        <th className="p-4">BLACKOUT AKTIF</th>
                        <th className="p-4">DESKRIPSI / CATATAN</th>
                        <th className="p-4 text-right">TINDAKAN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-850 font-medium">
                      {taxiAreaRules.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-neutral-500 font-mono">Belum ada aturan area terpasang. Aturan area dapat diimpor langsung melalui sheet "Area_Rules".</td>
                        </tr>
                      ) : (
                        taxiAreaRules.map((rule) => (
                          <tr key={rule.id} className="hover:bg-neutral-850/20 transition-all text-neutral-300">
                            <td className="p-4 font-mono font-bold text-amber-500">{rule.id}</td>
                            <td className="p-4 font-bold text-neutral-100">{getAreaName(rule.area_id)}</td>
                            <td className="p-4 text-right font-mono font-black text-rose-400">+${rule.surcharge_usd}</td>
                            <td className="p-4 text-right font-mono font-black text-rose-400">+Rp {rule.surcharge_idr.toLocaleString('id-ID')}</td>
                            <td className="p-4">
                              <button
                                onClick={() => {
                                  setTaxiAreaRules(prev => prev.map(r => r.id === rule.id ? { ...r, is_blackout: !r.is_blackout } : r));
                                  triggerToast(`Status Blackout untuk area diubah.`);
                                }}
                                className={`text-[9px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full border cursor-pointer transition-all ${
                                  rule.is_blackout ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                }`}
                              >
                                {rule.is_blackout ? 'BLACKOUT' : 'OPEN'}
                              </button>
                            </td>
                            <td className="p-4 italic text-neutral-400">{rule.note || '-'}</td>
                            <td className="p-4 text-right">
                              <button 
                                onClick={() => {
                                  if (confirm('Yakin ingin menghapus aturan surcharge area ini?')) {
                                    setTaxiAreaRules(prev => prev.filter(r => r.id !== rule.id));
                                    triggerToast('Aturan area dihapus!');
                                  }
                                }}
                                className="p-1.5 border border-rose-500/10 bg-rose-500/5 hover:bg-rose-500/15 text-rose-400 rounded-lg cursor-pointer transition-all" 
                                title="Hapus"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* --- INLINE MANUAL CRUD FORMS (MODALS) --- */}
      {/* 1. Modal Form: Area */}
      {isAreaFormOpen && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl text-left">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-sm font-black font-mono text-amber-600">
                {editingArea ? 'UBAH DATA MASTER AREA' : 'TAMBAH AREA BARU'}
              </h3>
              <button onClick={() => setIsAreaFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveArea} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-black font-mono text-slate-800 block uppercase">ID AREA (NON-EDITABLE)</label>
                <input 
                  type="text" 
                  disabled 
                  value={areaForm.id}
                  className="w-full bg-slate-100 border border-slate-300 px-3.5 py-2 rounded-xl text-slate-600 font-mono font-bold cursor-not-allowed" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black font-mono text-slate-800 block uppercase">NAMA AREA ZONA</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: Surabaya, Malang, Batu"
                  value={areaForm.name}
                  onChange={(e) => setAreaForm({ ...areaForm, name: e.target.value })}
                  className="w-full bg-white border border-slate-300 px-3.5 py-2 rounded-xl text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-amber-500" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black font-mono text-slate-800 block uppercase">KODE SINGKATAN</label>
                  <input 
                    type="text" 
                    required
                    maxLength={5}
                    placeholder="Contoh: SUB"
                    value={areaForm.code}
                    onChange={(e) => setAreaForm({ ...areaForm, code: e.target.value.toUpperCase() })}
                    className="w-full bg-white border border-slate-300 px-3.5 py-2 rounded-xl text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 font-mono font-black" 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black font-mono text-slate-800 block uppercase">TIPE AREA</label>
                  <select 
                    value={areaForm.type}
                    onChange={(e) => setAreaForm({ ...areaForm, type: e.target.value as 'City' | 'Airport' })}
                    className="w-full bg-white border border-slate-300 px-3 py-2 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500 font-bold"
                  >
                    <option value="City">City (Kota / Resort)</option>
                    <option value="Airport">Airport (Bandara / Terminal)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="space-y-1">
                  <label className="text-[10px] font-black font-mono text-slate-800 block uppercase">LATITUDE</label>
                  <input 
                    type="number" 
                    step="any"
                    required
                    value={areaForm.lat}
                    onChange={(e) => setAreaForm({ ...areaForm, lat: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 px-3.5 py-2 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500" 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black font-mono text-slate-800 block uppercase">LONGITUDE</label>
                  <input 
                    type="number" 
                    step="any"
                    required
                    value={areaForm.lon}
                    onChange={(e) => setAreaForm({ ...areaForm, lon: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 px-3.5 py-2 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500" 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black font-mono text-slate-800 block uppercase">STATUS PUBLIKASI</label>
                <select 
                  value={areaForm.status}
                  onChange={(e) => setAreaForm({ ...areaForm, status: e.target.value as 'Active' | 'Inactive' })}
                  className="w-full bg-white border border-slate-300 px-3 py-2 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500 font-bold"
                >
                  <option value="Active">Active (Publish)</option>
                  <option value="Inactive">Inactive (Draft)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAreaFormOpen(false)} className="px-4 py-2 border border-slate-300 bg-white rounded-xl font-bold cursor-pointer text-slate-700 hover:bg-slate-50">Batal</button>
                <button type="submit" className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black rounded-xl cursor-pointer font-mono">SIMPAN AREA</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal Form: Destination */}
      {isDestFormOpen && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl text-left">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-sm font-black font-mono text-amber-600">
                {editingDest ? 'UBAH DATA DESTINASI' : 'TAMBAH DESTINASI BARU'}
              </h3>
              <button onClick={() => setIsDestFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDest} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-black font-mono text-slate-800 block uppercase">ID DESTINASI</label>
                <input 
                  type="text" 
                  disabled 
                  value={destForm.id}
                  className="w-full bg-slate-100 border border-slate-300 px-3.5 py-2 rounded-xl text-slate-600 font-mono font-bold cursor-not-allowed" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black font-mono text-slate-800 block uppercase">PILIH AREA ZONA INDUK (ZONING)</label>
                <select 
                  value={destForm.area_id}
                  onChange={(e) => setDestForm({ ...destForm, area_id: e.target.value })}
                  className="w-full bg-white border border-slate-300 px-3 py-2 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500 font-bold"
                >
                  {taxiMasterAreas.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.code})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black font-mono text-slate-800 block uppercase">NAMA TEMPAT / ALAMAT UTAMA</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: Tunjungan Plaza Mall 1-6"
                  value={destForm.name}
                  onChange={(e) => setDestForm({ ...destForm, name: e.target.value })}
                  className="w-full bg-white border border-slate-300 px-3.5 py-2 rounded-xl text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-amber-500" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="space-y-1">
                  <label className="text-[10px] font-black font-mono text-slate-800 block uppercase">LATITUDE</label>
                  <input 
                    type="number" 
                    step="any"
                    required
                    value={destForm.lat}
                    onChange={(e) => setDestForm({ ...destForm, lat: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 px-3.5 py-2 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500" 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black font-mono text-slate-800 block uppercase">LONGITUDE</label>
                  <input 
                    type="number" 
                    step="any"
                    required
                    value={destForm.lon}
                    onChange={(e) => setDestForm({ ...destForm, lon: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 px-3.5 py-2 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500" 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black font-mono text-slate-800 block uppercase">STATUS</label>
                <select 
                  value={destForm.status}
                  onChange={(e) => setDestForm({ ...destForm, status: e.target.value as 'Active' | 'Inactive' })}
                  className="w-full bg-white border border-slate-300 px-3 py-2 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500 font-bold"
                >
                  <option value="Active">Active (Publish)</option>
                  <option value="Inactive">Inactive (Draft)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onClick={() => setIsDestFormOpen(false)} className="px-4 py-2 border border-slate-300 bg-white rounded-xl font-bold cursor-pointer text-slate-700 hover:bg-slate-50">Batal</button>
                <button type="submit" className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black rounded-xl cursor-pointer font-mono">SIMPAN DESTINASI</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal Form: Price Rule */}
      {isPriceRuleFormOpen && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl text-left">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-sm font-black font-mono text-amber-600">
                {editingPriceRule ? 'UBAH DATA ATURAN TARIF' : 'TAMBAH ATURAN TARIF BARU'}
              </h3>
              <button onClick={() => setIsPriceRuleFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePriceRule} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-black font-mono text-slate-800 block uppercase">ID ATURAN TARIF</label>
                <input 
                  type="text" 
                  disabled 
                  value={priceRuleForm.id}
                  className="w-full bg-slate-100 border border-slate-300 px-3.5 py-2 rounded-xl text-slate-600 font-mono font-bold cursor-not-allowed" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black font-mono text-slate-800 block uppercase">AREA ASAL</label>
                  <select 
                    value={priceRuleForm.source_id}
                    onChange={(e) => setPriceRuleForm({ ...priceRuleForm, source_id: e.target.value })}
                    className="w-full bg-white border border-slate-300 px-3 py-2 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500 font-bold"
                  >
                    {taxiMasterAreas.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black font-mono text-slate-800 block uppercase">AREA TUJUAN</label>
                  <select 
                    value={priceRuleForm.destination_id}
                    onChange={(e) => setPriceRuleForm({ ...priceRuleForm, destination_id: e.target.value })}
                    className="w-full bg-white border border-slate-300 px-3 py-2 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500 font-bold"
                  >
                    {taxiMasterAreas.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black font-mono text-slate-800 block uppercase">TIPE ARMADA KENDARAAN</label>
                <select 
                  value={priceRuleForm.vehicle_type}
                  onChange={(e) => setPriceRuleForm({ ...priceRuleForm, vehicle_type: e.target.value as any })}
                  className="w-full bg-white border border-slate-300 px-3 py-2 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500 font-mono font-bold"
                >
                  <option value="Standard">Standard (Avanza, Xenia)</option>
                  <option value="Family">Family (Innova Reborn, Zenix)</option>
                  <option value="Premium">Premium (Alphard VIP, Vellfire)</option>
                  <option value="Van">Van (Hiace Commuter/Premio)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 font-mono">
                  <label className="text-[10px] font-black font-mono text-slate-800 block uppercase">TARIF DASAR (USD)</label>
                  <input 
                    type="number" 
                    required
                    value={priceRuleForm.price_usd}
                    onChange={(e) => setPriceRuleForm({ ...priceRuleForm, price_usd: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-white border border-slate-300 px-3.5 py-2 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500 font-bold" 
                  />
                </div>

                <div className="space-y-1 font-mono">
                  <label className="text-[10px] font-black font-mono text-slate-800 block uppercase">TARIF DASAR (IDR)</label>
                  <input 
                    type="number" 
                    required
                    value={priceRuleForm.price_idr}
                    onChange={(e) => setPriceRuleForm({ ...priceRuleForm, price_idr: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-white border border-slate-300 px-3.5 py-2 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500 font-bold" 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black font-mono text-slate-800 block uppercase">STATUS AKTIF</label>
                <select 
                  value={priceRuleForm.status}
                  onChange={(e) => setPriceRuleForm({ ...priceRuleForm, status: e.target.value as 'Active' | 'Inactive' })}
                  className="w-full bg-white border border-slate-300 px-3 py-2 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500 font-bold"
                >
                  <option value="Active">Active (Publish)</option>
                  <option value="Inactive">Inactive (Draft)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onClick={() => setIsPriceRuleFormOpen(false)} className="px-4 py-2 border border-slate-300 bg-white rounded-xl font-bold cursor-pointer text-slate-700 hover:bg-slate-50">Batal</button>
                <button type="submit" className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black rounded-xl cursor-pointer font-mono">SIMPAN TARIF</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
