import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, TrendingUp, Users, Eye, Clock, Phone, MessageSquare, 
  Globe, Smartphone, Laptop, Tablet, ArrowUpRight, ArrowDownRight, 
  Calendar, RefreshCw, Download, Filter, Layers, Compass, CheckCircle2, 
  AlertCircle, Radio, Sparkles, ExternalLink, MapPin, Search, ChevronRight,
  ShieldCheck, Activity, Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface AnalyticsDashboardProps {
  isDark?: boolean;
}

export interface AnalyticsSummary {
  totalVisitors: number;
  uniqueVisitors: number;
  sessions: number;
  pageViews: number;
  newVisitors: number;
  returningVisitors: number;
  avgDurationSeconds: number;
  bounceRate: number;
  whatsappClicks: number;
  phoneClicks: number;
  emailClicks: number;
  bookNowClicks: number;
  inquirySubmissions: number;
  tourDetailClicks: number;
  externalClicks: number;
  totalBookings: number;
  conversionRate: number;
  
  trendTimeline: Array<{
    date: string;
    label: string;
    visitors: number;
    pageViews: number;
    conversions: number;
  }>;

  trafficSources: Array<{
    source: string;
    visitors: number;
    pageViews: number;
    conversions: number;
    conversionRate: number;
    percentage: number;
  }>;

  utmCampaigns: Array<{
    campaign: string;
    source: string;
    medium: string;
    visitors: number;
    conversions: number;
  }>;

  popularPages: Array<{
    path: string;
    title: string;
    views: number;
    uniqueVisitors: number;
    avgTimeSpent: string;
    category: string;
  }>;

  devices: {
    mobile: number;
    desktop: number;
    tablet: number;
    mobilePct: number;
    desktopPct: number;
    tabletPct: number;
  };

  locations: Array<{
    country: string;
    visitors: number;
    percentage: number;
  }>;

  browsers: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;

  recentEvents: Array<{
    id: string;
    type: string;
    title?: string;
    page?: string;
    source?: string;
    device?: string;
    location?: string;
    timestamp: string;
    metadata?: Record<string, any>;
  }>;

  realtime: {
    activeNow: number;
    activePages: Array<{ path: string; count: number }>;
    activeLocations: Array<{ country: string; count: number }>;
  };
}

export default function AnalyticsDashboard({ isDark = true }: AnalyticsDashboardProps) {
  // Date range filter
  const [dateRange, setDateRange] = useState<'today' | 'yesterday' | '7d' | '30d' | 'this_month' | 'last_month' | 'custom'>('7d');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Active analytics subtab
  const [activeTab, setActiveTab] = useState<'overview' | 'traffic' | 'pages' | 'interactions' | 'funnel' | 'audience' | 'realtime'>('overview');

  // Loading, data & error states
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [summaryData, setSummaryData] = useState<AnalyticsSummary | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [realtimeActiveCount, setRealtimeActiveCount] = useState(0);

  // Styling theme tokens
  const theme = {
    card: isDark ? 'bg-neutral-900/80 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm',
    innerCard: isDark ? 'bg-neutral-950/60 border-neutral-850' : 'bg-neutral-50 border-neutral-200',
    textPrimary: isDark ? 'text-neutral-100' : 'text-neutral-900',
    textSecondary: isDark ? 'text-neutral-400' : 'text-neutral-500',
    textMuted: isDark ? 'text-neutral-500' : 'text-neutral-400',
    border: isDark ? 'border-neutral-800' : 'border-neutral-200',
    input: isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-900',
    hover: isDark ? 'hover:bg-neutral-800/60' : 'hover:bg-neutral-100',
    tableHeader: isDark ? 'bg-neutral-950/70 text-neutral-400' : 'bg-neutral-100 text-neutral-600',
    tableRowHover: isDark ? 'hover:bg-neutral-850/50' : 'hover:bg-neutral-50'
  };

  // Fetch analytics summary from backend
  const fetchAnalytics = async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    else setIsRefreshing(true);
    setErrorMessage(null);

    try {
      const token = localStorage.getItem('smart_journey_admin_token') || 
                    localStorage.getItem('smartjourney_admin_token') || 
                    'admin-smart-journey-token';

      let queryUrl = `/api/analytics/dashboard?range=${dateRange}`;
      if (dateRange === 'custom' && customStartDate && customEndDate) {
        queryUrl += `&startDate=${customStartDate}&endDate=${customEndDate}`;
      }

      const res = await fetch(queryUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Autentikasi admin diperlukan untuk mengakses data analitik.');
        }
        throw new Error(`Gagal memuat analitik (HTTP ${res.status})`);
      }

      const data: AnalyticsSummary = await res.json();
      setSummaryData(data);
      if (data.realtime?.activeNow !== undefined) {
        setRealtimeActiveCount(data.realtime.activeNow);
      }
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setErrorMessage(err.message || 'Terjadi kesalahan saat memuat analitik.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Periodic polling for real-time visitor pulses
  useEffect(() => {
    fetchAnalytics(true);
    const interval = setInterval(() => {
      fetchAnalytics(false);
    }, 15000);
    return () => clearInterval(interval);
  }, [dateRange, customStartDate, customEndDate]);

  // Export analytics data as CSV
  const handleExportCSV = () => {
    if (!summaryData) return;
    const rows = [
      ['Smart Journey Analytics Report'],
      ['Generated At', new Date().toISOString()],
      ['Date Range', dateRange],
      [''],
      ['Key Metric', 'Value'],
      ['Total Visitors', summaryData.totalVisitors],
      ['Unique Visitors', summaryData.uniqueVisitors],
      ['Page Views', summaryData.pageViews],
      ['Sessions', summaryData.sessions],
      ['New Visitors', summaryData.newVisitors],
      ['Returning Visitors', summaryData.returningVisitors],
      ['Avg Duration (sec)', summaryData.avgDurationSeconds],
      ['Bounce Rate (%)', `${summaryData.bounceRate}%`],
      ['WhatsApp Inquiries', summaryData.whatsappClicks],
      ['Book Now Clicks', summaryData.bookNowClicks],
      ['Inquiry Submissions', summaryData.inquirySubmissions],
      ['Total Bookings', summaryData.totalBookings],
      ['Conversion Rate (%)', `${summaryData.conversionRate}%`],
      [''],
      ['Traffic Sources'],
      ['Source', 'Visitors', 'Page Views', 'Conversions', 'Conversion Rate %'],
      ...summaryData.trafficSources.map(s => [s.source, s.visitors, s.pageViews, s.conversions, `${s.conversionRate}%`]),
      [''],
      ['Popular Pages'],
      ['Page Path', 'Page Title', 'Views', 'Unique Visitors', 'Avg Time Spent'],
      ...summaryData.popularPages.map(p => [p.path, p.title, p.views, p.uniqueVisitors, p.avgTimeSpent])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smartjourney_analytics_${dateRange}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format seconds into MM:SS
  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return '0m 00s';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  // Filtered popular pages based on search
  const filteredPages = useMemo(() => {
    if (!summaryData?.popularPages) return [];
    if (!searchFilter) return summaryData.popularPages;
    const q = searchFilter.toLowerCase();
    return summaryData.popularPages.filter(p => 
      p.path.toLowerCase().includes(q) || 
      p.title.toLowerCase().includes(q) || 
      p.category.toLowerCase().includes(q)
    );
  }, [summaryData?.popularPages, searchFilter]);

  // Max value calculation for responsive SVG Bar charts
  const maxTrendVisitors = useMemo(() => {
    if (!summaryData?.trendTimeline?.length) return 10;
    return Math.max(...summaryData.trendTimeline.map(t => t.visitors), 10);
  }, [summaryData?.trendTimeline]);

  return (
    <div className="space-y-6 animate-fade-in text-left">
      
      {/* Top Banner & Header */}
      <div className={`${theme.card} border rounded-2xl p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 shadow-lg`}>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight font-mono text-neutral-100 flex items-center gap-2">
                <span>SMART JOURNEY ANALYTICS</span>
                <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live Engine Active
                </span>
              </h2>
              <p className={`text-xs ${theme.textSecondary}`}>
                Analitik lalu lintas web resmi, pelacakan interaksi konversi, channel pemasaran, dan journey pelanggan.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls: Range Selector, Refresh, Export */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
            {[
              { id: 'today', label: 'Hari Ini' },
              { id: 'yesterday', label: 'Kemarin' },
              { id: '7d', label: '7 Hari' },
              { id: '30d', label: '30 Hari' },
              { id: 'this_month', label: 'Bulan Ini' },
              { id: 'last_month', label: 'Bulan Lalu' },
              { id: 'custom', label: 'Kustom' }
            ].map(r => (
              <button
                key={r.id}
                onClick={() => setDateRange(r.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  dateRange === r.id
                    ? 'bg-amber-500 text-neutral-950 font-black shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {dateRange === 'custom' && (
            <div className="flex items-center gap-2 bg-neutral-950 px-3 py-1.5 rounded-xl border border-neutral-800 text-xs">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="bg-transparent text-neutral-200 outline-none text-xs"
              />
              <span className="text-neutral-500">s/d</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="bg-transparent text-neutral-200 outline-none text-xs"
              />
            </div>
          )}

          <button
            onClick={() => fetchAnalytics(false)}
            disabled={isRefreshing}
            className={`p-2.5 rounded-xl border ${theme.border} ${theme.hover} text-neutral-300 hover:text-white transition-all cursor-pointer`}
            title="Muat Ulang Data"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-amber-500' : ''}`} />
          </button>

          <button
            onClick={handleExportCSV}
            disabled={!summaryData || summaryData.totalVisitors === 0}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-black transition-all cursor-pointer ${
              (!summaryData || summaryData.totalVisitors === 0) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Download className="h-3.5 w-3.5" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-4.5 w-4.5 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button 
            onClick={() => fetchAnalytics(true)}
            className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 font-bold cursor-pointer"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Real-time Indicator Pill Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-850 text-xs font-mono">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>{realtimeActiveCount} Pengunjung Aktif (5 Menit Terakhir)</span>
          </span>
          <span className="text-neutral-600 hidden sm:inline">•</span>
          <span className="text-neutral-400 hidden sm:inline">
            Tipe Pelacakan: First-Party Privacy Compliant (No PII Stored)
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-neutral-500">
          <span>Otorisasi: Admin Terverifikasi</span>
          <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
        </div>
      </div>

      {/* Primary Statistic Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* Card 1: Total Visitors */}
        <div className={`${theme.card} border rounded-2xl p-4 flex flex-col justify-between`}>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-black uppercase tracking-wider ${theme.textMuted}`}>Total Pengunjung</span>
            <Users className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black font-mono text-neutral-100">
              {isLoading ? '...' : (summaryData?.totalVisitors || 0).toLocaleString()}
            </h3>
            <span className="text-[10px] text-neutral-400 font-semibold block mt-0.5">
              Unik: {(summaryData?.uniqueVisitors || 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Card 2: Page Views */}
        <div className={`${theme.card} border rounded-2xl p-4 flex flex-col justify-between`}>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-black uppercase tracking-wider ${theme.textMuted}`}>Tampilan Halaman</span>
            <Eye className="h-4 w-4 text-blue-400" />
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black font-mono text-neutral-100">
              {isLoading ? '...' : (summaryData?.pageViews || 0).toLocaleString()}
            </h3>
            <span className="text-[10px] text-neutral-400 font-semibold block mt-0.5">
              Sesi: {(summaryData?.sessions || 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Card 3: New vs Returning */}
        <div className={`${theme.card} border rounded-2xl p-4 flex flex-col justify-between`}>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-black uppercase tracking-wider ${theme.textMuted}`}>Baru vs Kembali</span>
            <Layers className="h-4 w-4 text-purple-400" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <h3 className="text-xl font-black font-mono text-neutral-100">
                {isLoading ? '...' : summaryData?.newVisitors || 0}
              </h3>
              <span className="text-xs text-neutral-500 font-bold">/</span>
              <span className="text-sm font-bold font-mono text-neutral-300">
                {isLoading ? '...' : summaryData?.returningVisitors || 0}
              </span>
            </div>
            <span className="text-[10px] text-neutral-400 font-semibold block mt-0.5">
              {summaryData?.totalVisitors ? Math.round(((summaryData.newVisitors || 0) / summaryData.totalVisitors) * 100) : 0}% Pengunjung Baru
            </span>
          </div>
        </div>

        {/* Card 4: Avg Duration & Bounce */}
        <div className={`${theme.card} border rounded-2xl p-4 flex flex-col justify-between`}>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-black uppercase tracking-wider ${theme.textMuted}`}>Durasi Sesi</span>
            <Clock className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-black font-mono text-neutral-100">
              {isLoading ? '...' : formatDuration(summaryData?.avgDurationSeconds || 0)}
            </h3>
            <span className="text-[10px] text-neutral-400 font-semibold block mt-0.5">
              Bounce: {summaryData?.bounceRate || 0}%
            </span>
          </div>
        </div>

        {/* Card 5: WhatsApp Clicks */}
        <div className={`${theme.card} border rounded-2xl p-4 flex flex-col justify-between`}>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-black uppercase tracking-wider ${theme.textMuted}`}>Klik WhatsApp</span>
            <MessageSquare className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black font-mono text-emerald-400">
              {isLoading ? '...' : (summaryData?.whatsappClicks || 0).toLocaleString()}
            </h3>
            <span className="text-[10px] text-neutral-400 font-semibold block mt-0.5">
              Inquiry / Form: {summaryData?.inquirySubmissions || 0}
            </span>
          </div>
        </div>

        {/* Card 6: Bookings & Conversion */}
        <div className={`${theme.card} border rounded-2xl p-4 flex flex-col justify-between`}>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-black uppercase tracking-wider ${theme.textMuted}`}>Konversi Total</span>
            <Target className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <h3 className="text-2xl font-black font-mono text-amber-400">
                {isLoading ? '...' : `${summaryData?.conversionRate || 0}%`}
              </h3>
            </div>
            <span className="text-[10px] text-neutral-400 font-semibold block mt-0.5">
              {summaryData?.totalBookings || 0} Booking Berhasil
            </span>
          </div>
        </div>

      </div>

      {/* Sub-Navigation Navigation Bar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-neutral-800 pb-px font-mono text-xs">
        {[
          { id: 'overview', label: '📊 Tren & Overview', icon: TrendingUp },
          { id: 'traffic', label: '🌐 Sumber Traffic (UTM)', icon: Globe },
          { id: 'pages', label: '🗺️ Halaman & Produk Tur', icon: Compass },
          { id: 'interactions', label: '⚡ Interaksi CTA & WA', icon: MessageSquare },
          { id: 'funnel', label: '🎯 Funnel Konversi', icon: Target },
          { id: 'audience', label: '📱 Perangkat & Lokasi', icon: Smartphone },
          { id: 'realtime', label: '🔴 Live Realtime Feed', icon: Radio }
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-3 border-b-2 font-bold transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-amber-400' : 'text-neutral-500'}`} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Content */}
      <div className="space-y-6">

        {/* TAB 1: OVERVIEW & TRENDS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Timeline Visual Chart */}
            <div className={`${theme.card} border rounded-2xl p-6 space-y-4`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider font-mono text-neutral-100 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-amber-500" />
                    Tren Pengunjung & Tampilan Halaman
                  </h3>
                  <p className={`text-xs ${theme.textSecondary}`}>
                    Grafik aktivitas harian pengunjung situs Smart Journey sepanjang periode {dateRange}.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <span className="h-2.5 w-2.5 rounded-sm bg-amber-500" />
                    Pengunjung Unik
                  </span>
                  <span className="flex items-center gap-1.5 text-blue-400">
                    <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" />
                    Tampilan Halaman
                  </span>
                </div>
              </div>

              {/* Responsive SVG Chart */}
              {summaryData?.trendTimeline && summaryData.trendTimeline.length > 0 ? (
                <div className="pt-4 overflow-x-auto">
                  <div className="min-w-[600px] h-64 flex items-end gap-3 px-2 pb-6 border-b border-neutral-800 relative">
                    
                    {/* Background grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
                      <div className="border-b border-white w-full" />
                      <div className="border-b border-white w-full" />
                      <div className="border-b border-white w-full" />
                      <div className="border-b border-white w-full" />
                    </div>

                    {summaryData.trendTimeline.map((item, idx) => {
                      const visitorHeightPct = Math.max(Math.round((item.visitors / maxTrendVisitors) * 85), 4);
                      const pageViewHeightPct = Math.max(Math.round((item.pageViews / (maxTrendVisitors * 2 || 20)) * 85), 4);

                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group relative h-full justify-end">
                          
                          {/* Tooltip on hover */}
                          <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-950 border border-neutral-700 px-2.5 py-1 rounded-lg text-[10px] font-mono whitespace-nowrap shadow-xl z-20 pointer-events-none">
                            <p className="font-bold text-white">{item.label || item.date}</p>
                            <p className="text-amber-400">{item.visitors} Pengunjung</p>
                            <p className="text-blue-400">{item.pageViews} Pageviews</p>
                          </div>

                          {/* Bars */}
                          <div className="w-full flex items-end justify-center gap-1 h-full">
                            <div 
                              className="w-full max-w-[16px] bg-amber-500 hover:bg-amber-400 rounded-t-sm transition-all"
                              style={{ height: `${visitorHeightPct}%` }}
                            />
                            <div 
                              className="w-full max-w-[16px] bg-blue-500/70 hover:bg-blue-400 rounded-t-sm transition-all"
                              style={{ height: `${pageViewHeightPct}%` }}
                            />
                          </div>

                          {/* Date Label */}
                          <span className="text-[10px] font-mono text-neutral-500 truncate w-full text-center">
                            {item.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center text-neutral-500 space-y-2">
                  <AlertCircle className="h-8 w-8 mx-auto text-neutral-600" />
                  <p className="text-xs font-bold">Belum ada data rekaman analitik pada rentang tanggal ini.</p>
                  <p className="text-[11px]">Data akan terisi secara otomatis seiring interaksi pengunjung di website.</p>
                </div>
              )}
            </div>

            {/* Two Column Section: Top Traffic Sources & Top Pages Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Traffic Sources Quick View */}
              <div className={`${theme.card} border rounded-2xl p-6 space-y-4`}>
                <div className="flex items-center justify-between border-b border-neutral-850 pb-3">
                  <h4 className="text-xs font-black uppercase tracking-wider font-mono text-amber-500 flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Sumber Pemasaran & Referral Teratas
                  </h4>
                  <button 
                    onClick={() => setActiveTab('traffic')}
                    className="text-[11px] font-bold text-neutral-400 hover:text-amber-400 flex items-center gap-1 font-mono cursor-pointer"
                  >
                    <span>Detail</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>

                <div className="space-y-3 pt-1">
                  {summaryData?.trafficSources && summaryData.trafficSources.length > 0 ? (
                    summaryData.trafficSources.slice(0, 5).map((src, i) => (
                      <div key={i} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-neutral-200">{src.source}</span>
                          <span className="font-mono text-neutral-400 text-[11px]">
                            {src.visitors} Pengunjung ({src.percentage}%) • {src.conversions} Leads
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-neutral-950 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-500 rounded-full" 
                            style={{ width: `${Math.max(src.percentage, 5)}%` }} 
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-neutral-500 py-4 text-center">Belum ada data sumber referral tercatat.</p>
                  )}
                </div>
              </div>

              {/* Popular Pages Quick View */}
              <div className={`${theme.card} border rounded-2xl p-6 space-y-4`}>
                <div className="flex items-center justify-between border-b border-neutral-850 pb-3">
                  <h4 className="text-xs font-black uppercase tracking-wider font-mono text-amber-500 flex items-center gap-2">
                    <Compass className="h-4 w-4" />
                    Halaman & Destinasi Terpopuler
                  </h4>
                  <button 
                    onClick={() => setActiveTab('pages')}
                    className="text-[11px] font-bold text-neutral-400 hover:text-amber-400 flex items-center gap-1 font-mono cursor-pointer"
                  >
                    <span>Detail</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>

                <div className="space-y-2 pt-1">
                  {summaryData?.popularPages && summaryData.popularPages.length > 0 ? (
                    summaryData.popularPages.slice(0, 5).map((p, i) => (
                      <div key={i} className={`flex items-center justify-between p-2.5 rounded-xl ${theme.innerCard} border text-xs`}>
                        <div className="min-w-0 pr-3">
                          <h5 className="font-bold text-neutral-200 truncate">{p.title || p.path}</h5>
                          <span className="text-[10px] text-neutral-500 font-mono block truncate">{p.path}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-mono font-black text-amber-400 text-xs block">{p.views} views</span>
                          <span className="text-[10px] text-neutral-400 font-mono">{p.avgTimeSpent} avg</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-neutral-500 py-4 text-center">Belum ada kunjungan halaman tercatat.</p>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: TRAFFIC SOURCES & UTM */}
        {activeTab === 'traffic' && (
          <div className="space-y-6">
            
            {/* Traffic Sources Full Table */}
            <div className={`${theme.card} border rounded-2xl p-6 space-y-4`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-neutral-850 pb-4">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider font-mono text-neutral-100">
                    Channel & Sumber Trafik Lengkap
                  </h3>
                  <p className={`text-xs ${theme.textSecondary}`}>
                    Menampilkan asal kedatangan pengunjung (Direct, Google Search, Iklan Instagram, Chat WhatsApp, dsb).
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className={`border-b border-neutral-800 ${theme.tableHeader} font-mono uppercase text-[10px] tracking-wider`}>
                      <th className="py-3 px-4">Sumber Pemasaran</th>
                      <th className="py-3 px-4">Pengunjung</th>
                      <th className="py-3 px-4">Porsi Trafik</th>
                      <th className="py-3 px-4">Tampilan Halaman</th>
                      <th className="py-3 px-4">Aksi Konversi</th>
                      <th className="py-3 px-4 text-right">Tingkat Konversi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-850 font-mono">
                    {summaryData?.trafficSources && summaryData.trafficSources.length > 0 ? (
                      summaryData.trafficSources.map((s, idx) => (
                        <tr key={idx} className={theme.tableRowHover}>
                          <td className="py-3 px-4 font-bold text-neutral-200 flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-amber-500" />
                            {s.source}
                          </td>
                          <td className="py-3 px-4 text-neutral-300 font-bold">{s.visitors.toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-neutral-400 w-10">{s.percentage}%</span>
                              <div className="h-1.5 w-24 bg-neutral-800 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500" style={{ width: `${s.percentage}%` }} />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-neutral-300">{s.pageViews.toLocaleString()}</td>
                          <td className="py-3 px-4 text-emerald-400 font-bold">{s.conversions}</td>
                          <td className="py-3 px-4 text-right font-black text-amber-400">{s.conversionRate}%</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-neutral-500">
                          Tidak ada rekaman sumber trafik.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* UTM Campaign Breakdown Table */}
            <div className={`${theme.card} border rounded-2xl p-6 space-y-4`}>
              <div className="flex items-center justify-between border-b border-neutral-850 pb-4">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider font-mono text-neutral-100">
                    Pelacakan Kampanye UTM (UTM Source, Medium & Campaign)
                  </h3>
                  <p className={`text-xs ${theme.textSecondary}`}>
                    Evaluasi efektivitas kampanye promosi berbayar dan link referral khusus.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className={`border-b border-neutral-800 ${theme.tableHeader} font-mono uppercase text-[10px] tracking-wider`}>
                      <th className="py-3 px-4">Nama Kampanye (utm_campaign)</th>
                      <th className="py-3 px-4">Sumber (utm_source)</th>
                      <th className="py-3 px-4">Medium (utm_medium)</th>
                      <th className="py-3 px-4">Pengunjung</th>
                      <th className="py-3 px-4 text-right">Konversi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-850 font-mono">
                    {summaryData?.utmCampaigns && summaryData.utmCampaigns.length > 0 ? (
                      summaryData.utmCampaigns.map((c, idx) => (
                        <tr key={idx} className={theme.tableRowHover}>
                          <td className="py-3 px-4 font-bold text-amber-400">{c.campaign || 'N/A'}</td>
                          <td className="py-3 px-4 text-neutral-300">{c.source || 'Direct'}</td>
                          <td className="py-3 px-4 text-neutral-400">{c.medium || 'None'}</td>
                          <td className="py-3 px-4 text-neutral-200 font-bold">{c.visitors}</td>
                          <td className="py-3 px-4 text-right text-emerald-400 font-bold">{c.conversions}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-neutral-500">
                          Belum ada kunjungan dengan parameter UTM khusus tercatat.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: POPULAR PAGES AND TOURS */}
        {activeTab === 'pages' && (
          <div className={`${theme.card} border rounded-2xl p-6 space-y-4`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-neutral-850 pb-4">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider font-mono text-neutral-100">
                  Peringkat Popularitas Halaman & Layanan
                </h3>
                <p className={`text-xs ${theme.textSecondary}`}>
                  Analisis intensitas penjelajahan halaman katalog wisata, rute transfer, dan layanan rental.
                </p>
              </div>

              {/* Search filter for pages */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Cari halaman / paket..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className={`w-full ${theme.input} pl-9 pr-4 py-2 rounded-xl text-xs outline-none`}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className={`border-b border-neutral-800 ${theme.tableHeader} font-mono uppercase text-[10px] tracking-wider`}>
                    <th className="py-3 px-4">Halaman / Destinasi</th>
                    <th className="py-3 px-4">Kategori Layanan</th>
                    <th className="py-3 px-4">Tampilan (Views)</th>
                    <th className="py-3 px-4">Pengunjung Unik</th>
                    <th className="py-3 px-4 text-right">Rata-rata Waktu Akses</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-850 font-mono">
                  {filteredPages.length > 0 ? (
                    filteredPages.map((p, idx) => (
                      <tr key={idx} className={theme.tableRowHover}>
                        <td className="py-3.5 px-4 font-sans">
                          <div className="font-bold text-neutral-100">{p.title || p.path}</div>
                          <span className="text-[10px] text-neutral-500 font-mono">{p.path}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-800 text-neutral-300 border border-neutral-700">
                            {p.category || 'Website'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-neutral-200">{p.views.toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-neutral-400">{p.uniqueVisitors.toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-right text-emerald-400 font-bold">{p.avgTimeSpent}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-neutral-500">
                        Tidak ada halaman yang cocok dengan pencarian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: USER INTERACTIONS */}
        {activeTab === 'interactions' && (
          <div className="space-y-6">
            
            {/* Interaction Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className={`${theme.card} border rounded-2xl p-4 space-y-2`}>
                <div className="flex items-center justify-between text-emerald-400">
                  <span className="text-[10px] font-black uppercase font-mono">WhatsApp Clicks</span>
                  <MessageSquare className="h-4 w-4" />
                </div>
                <h4 className="text-2xl font-black font-mono text-neutral-100">
                  {summaryData?.whatsappClicks || 0}
                </h4>
                <p className="text-[10px] text-neutral-400">Tombol floating & konsultasi tur</p>
              </div>

              <div className={`${theme.card} border rounded-2xl p-4 space-y-2`}>
                <div className="flex items-center justify-between text-blue-400">
                  <span className="text-[10px] font-black uppercase font-mono">Book Now Clicks</span>
                  <Target className="h-4 w-4" />
                </div>
                <h4 className="text-2xl font-black font-mono text-neutral-100">
                  {summaryData?.bookNowClicks || 0}
                </h4>
                <p className="text-[10px] text-neutral-400">Inisiasi checkout pemesanan</p>
              </div>

              <div className={`${theme.card} border rounded-2xl p-4 space-y-2`}>
                <div className="flex items-center justify-between text-amber-400">
                  <span className="text-[10px] font-black uppercase font-mono">Tour Details Click</span>
                  <Compass className="h-4 w-4" />
                </div>
                <h4 className="text-2xl font-black font-mono text-neutral-100">
                  {summaryData?.tourDetailClicks || 0}
                </h4>
                <p className="text-[10px] text-neutral-400">Eksplorasi rincian itinerary</p>
              </div>

              <div className={`${theme.card} border rounded-2xl p-4 space-y-2`}>
                <div className="flex items-center justify-between text-purple-400">
                  <span className="text-[10px] font-black uppercase font-mono">Phone / Email / Ext</span>
                  <ExternalLink className="h-4 w-4" />
                </div>
                <h4 className="text-2xl font-black font-mono text-neutral-100">
                  {(summaryData?.phoneClicks || 0) + (summaryData?.emailClicks || 0) + (summaryData?.externalClicks || 0)}
                </h4>
                <p className="text-[10px] text-neutral-400">Telepon, email & link partner</p>
              </div>
            </div>

            {/* Interaction Event History Log */}
            <div className={`${theme.card} border rounded-2xl p-6 space-y-4`}>
              <div className="border-b border-neutral-850 pb-3">
                <h3 className="text-sm font-black uppercase tracking-wider font-mono text-neutral-100">
                  Log Riwayat Interaksi Pengguna Terkini
                </h3>
                <p className={`text-xs ${theme.textSecondary}`}>
                  Rekaman aksi interaktif penting yang dilakukan calon pelanggan di seluruh halaman.
                </p>
              </div>

              <div className="space-y-2.5">
                {summaryData?.recentEvents && summaryData.recentEvents.length > 0 ? (
                  summaryData.recentEvents.map((evt, idx) => (
                    <div key={idx} className={`p-3 rounded-xl ${theme.innerCard} border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs`}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg font-mono text-xs font-black ${
                          evt.type.includes('whatsapp') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          evt.type.includes('book') ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          evt.type.includes('inquiry') ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          'bg-neutral-800 text-neutral-300'
                        }`}>
                          {evt.type.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-neutral-200">{evt.title || evt.page || 'Aktivitas Pengguna'}</p>
                          <span className="text-[10px] text-neutral-500 font-mono">
                            Sumber: {evt.source || 'Direct'} • Perangkat: {evt.device || 'Mobile'}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-neutral-500 font-mono shrink-0">
                        {new Date(evt.timestamp).toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-neutral-500 py-6 text-center">Belum ada interaksi tercatat.</p>
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: CONVERSION FUNNEL */}
        {activeTab === 'funnel' && (
          <div className={`${theme.card} border rounded-2xl p-6 space-y-6`}>
            <div className="border-b border-neutral-850 pb-4">
              <h3 className="text-sm font-black uppercase tracking-wider font-mono text-neutral-100">
                Corong Konversi Pelanggan (Visitor Journey Funnel)
              </h3>
              <p className={`text-xs ${theme.textSecondary}`}>
                Visualisasi alur langkah calon wisatawan dari kunjungan awal hingga menjadi pesanan booking nyata.
              </p>
            </div>

            {/* Funnel Steps */}
            <div className="space-y-4 max-w-2xl mx-auto py-4">
              
              {/* Step 1: All Visitors */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-neutral-200">1. Total Pengunjung Unik</span>
                  <span className="font-black text-amber-400">
                    {(summaryData?.uniqueVisitors || 0).toLocaleString()} (100%)
                  </span>
                </div>
                <div className="h-8 w-full bg-neutral-950 rounded-xl overflow-hidden border border-neutral-800 p-1">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg flex items-center justify-end px-3 text-[10px] font-black text-neutral-950" style={{ width: '100%' }}>
                    100%
                  </div>
                </div>
              </div>

              {/* Step 2: Tour / Product Views */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-neutral-200">2. Eksplorasi Paket & Halaman Tur</span>
                  <span className="font-black text-blue-400">
                    {summaryData?.popularPages?.reduce((acc, p) => acc + p.views, 0) || 0} views
                  </span>
                </div>
                <div className="h-8 w-full bg-neutral-950 rounded-xl overflow-hidden border border-neutral-800 p-1">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-end px-3 text-[10px] font-black text-white" style={{ width: '75%' }}>
                    75% Interaksi
                  </div>
                </div>
              </div>

              {/* Step 3: CTA Click (WhatsApp / Book Now) */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-neutral-200">3. Inisiasi Kontak & CTA Booking</span>
                  <span className="font-black text-emerald-400">
                    {(summaryData?.whatsappClicks || 0) + (summaryData?.bookNowClicks || 0)} aksi
                  </span>
                </div>
                <div className="h-8 w-full bg-neutral-950 rounded-xl overflow-hidden border border-neutral-800 p-1">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-end px-3 text-[10px] font-black text-neutral-950" style={{ width: '45%' }}>
                    {summaryData?.uniqueVisitors ? Math.min(Math.round((((summaryData.whatsappClicks || 0) + (summaryData.bookNowClicks || 0)) / summaryData.uniqueVisitors) * 100), 100) : 0}% Tingkat Respon
                  </div>
                </div>
              </div>

              {/* Step 4: Real Database Bookings */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-neutral-200">4. Booking Sah / Terkonfirmasi</span>
                  <span className="font-black text-amber-300">
                    {summaryData?.totalBookings || 0} Pemesanan
                  </span>
                </div>
                <div className="h-8 w-full bg-neutral-950 rounded-xl overflow-hidden border border-neutral-800 p-1">
                  <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-lg flex items-center justify-end px-3 text-[10px] font-black text-neutral-950" style={{ width: `${Math.max(summaryData?.conversionRate || 5, 5)}%` }}>
                    {summaryData?.conversionRate || 0}% Final
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 6: AUDIENCE, DEVICES & GEOGRAPHY */}
        {activeTab === 'audience' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Device Categories */}
            <div className={`${theme.card} border rounded-2xl p-6 space-y-5`}>
              <div className="border-b border-neutral-850 pb-3">
                <h3 className="text-sm font-black uppercase tracking-wider font-mono text-neutral-100 flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-amber-500" />
                  Kategori Perangkat Pengguna
                </h3>
                <p className={`text-xs ${theme.textSecondary}`}>
                  Distribusi pemakaian Smartphone, Komputer Desktop, dan Tablet.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-850">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5 text-amber-400" />
                    <div>
                      <h5 className="font-bold text-xs text-neutral-200">Mobile (Smartphone)</h5>
                      <span className="text-[10px] text-neutral-500 font-mono">Android & iOS</span>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-black text-neutral-100 text-sm">{summaryData?.devices?.mobilePct || 0}%</span>
                    <span className="text-[10px] text-neutral-400 block">{summaryData?.devices?.mobile || 0} Pengunjung</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-850">
                  <div className="flex items-center gap-3">
                    <Laptop className="h-5 w-5 text-blue-400" />
                    <div>
                      <h5 className="font-bold text-xs text-neutral-200">Desktop / Laptop</h5>
                      <span className="text-[10px] text-neutral-500 font-mono">Windows & macOS</span>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-black text-neutral-100 text-sm">{summaryData?.devices?.desktopPct || 0}%</span>
                    <span className="text-[10px] text-neutral-400 block">{summaryData?.devices?.desktop || 0} Pengunjung</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-850">
                  <div className="flex items-center gap-3">
                    <Tablet className="h-5 w-5 text-purple-400" />
                    <div>
                      <h5 className="font-bold text-xs text-neutral-200">Tablet (iPad / Android Tab)</h5>
                      <span className="text-[10px] text-neutral-500 font-mono">Tablet Screen</span>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-black text-neutral-100 text-sm">{summaryData?.devices?.tabletPct || 0}%</span>
                    <span className="text-[10px] text-neutral-400 block">{summaryData?.devices?.tablet || 0} Pengunjung</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Geographic Distribution */}
            <div className={`${theme.card} border rounded-2xl p-6 space-y-5`}>
              <div className="border-b border-neutral-850 pb-3">
                <h3 className="text-sm font-black uppercase tracking-wider font-mono text-neutral-100 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-400" />
                  Asal Negara & Lokasi Teratas
                </h3>
                <p className={`text-xs ${theme.textSecondary}`}>
                  Agregasi geografis anonim wisatawan yang mengunjungi Smart Journey.
                </p>
              </div>

              <div className="space-y-3">
                {summaryData?.locations && summaryData.locations.length > 0 ? (
                  summaryData.locations.map((loc, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-neutral-200">{loc.country}</span>
                        <span className="text-neutral-400 font-mono text-[11px]">
                          {loc.visitors} ({loc.percentage}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-neutral-950 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${loc.percentage}%` }} />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-neutral-500 py-6 text-center">Belum ada data geografi teragregasi.</p>
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 7: REALTIME LIVE FEED */}
        {activeTab === 'realtime' && (
          <div className={`${theme.card} border rounded-2xl p-6 space-y-6`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-neutral-850 pb-4">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider font-mono text-neutral-100 flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  Real-time Active Visitors Stream
                </h3>
                <p className={`text-xs ${theme.textSecondary}`}>
                  Pengawasan real-time pengguna yang sedang aktif menavigasi situs saat ini.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                {realtimeActiveCount} Pengguna Sedang Online
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-850 space-y-3">
                <h4 className="text-xs font-mono font-bold text-amber-400 uppercase">Halaman Aktif Ditonton</h4>
                <div className="space-y-2">
                  {summaryData?.realtime?.activePages && summaryData.realtime.activePages.length > 0 ? (
                    summaryData.realtime.activePages.map((ap, i) => (
                      <div key={i} className="flex justify-between items-center text-xs">
                        <span className="font-mono text-neutral-300 truncate pr-2">{ap.path}</span>
                        <span className="font-mono font-bold text-emerald-400">{ap.count} live</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-neutral-500">Tidak ada sesi aktif saat ini.</p>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-850 space-y-3">
                <h4 className="text-xs font-mono font-bold text-blue-400 uppercase">Lokasi Pengguna Online</h4>
                <div className="space-y-2">
                  {summaryData?.realtime?.activeLocations && summaryData.realtime.activeLocations.length > 0 ? (
                    summaryData.realtime.activeLocations.map((al, i) => (
                      <div key={i} className="flex justify-between items-center text-xs">
                        <span className="font-mono text-neutral-300">{al.country}</span>
                        <span className="font-mono font-bold text-blue-400">{al.count} online</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-neutral-500">Tidak ada data lokasi real-time.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
