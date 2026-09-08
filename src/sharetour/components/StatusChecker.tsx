import React, { useState, useEffect } from "react";
import { Booking, Batch, Trip } from "../types";
import { 
  Search, 
  AlertTriangle, 
  RefreshCw, 
  Plane, 
  Printer, 
  ArrowLeft
} from "lucide-react";
import { useLanguageCurrency } from "../LanguageCurrencyContext";

interface StatusCheckerProps {
  prefilledCode?: string;
  prefilledEmail?: string;
  bookings: Booking[];
  onRefreshDB: () => void;
  batches?: Batch[];
  trips?: Trip[];
}

export default function StatusChecker({ 
  prefilledCode = "", 
  bookings, 
  onRefreshDB,
  batches = [],
  trips = []
}: StatusCheckerProps) {
  const { t, formatPrice, language } = useLanguageCurrency();
  const [bookingCode, setBookingCode] = useState(prefilledCode);
  const [searched, setSearched] = useState(false);
  const [foundBooking, setFoundBooking] = useState<Booking | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Prefill if values are passed down from checkout success
  useEffect(() => {
    if (prefilledCode) {
      setBookingCode(prefilledCode);
      handleSearch(prefilledCode);
    }
  }, [prefilledCode, bookings]);

  const handleSearch = (code: string = bookingCode) => {
    setErrorMsg("");
    
    if (!code.trim()) {
      setErrorMsg(t("Please enter a Booking Code first."));
      setFoundBooking(null);
      setSearched(true);
      return;
    }

    const cleanCode = code.trim().toUpperCase();
    const record = bookings.find(
      (b) => b.bookingCode.toUpperCase() === cleanCode
    );

    if (record) {
      setFoundBooking(record);
      setSearched(true);
    } else {
      setFoundBooking(null);
      setErrorMsg(t("No reservation data found for Booking Code") + ` "${cleanCode}". ` + t("Please double-check your code."));
      setSearched(true);
    }
  };

  const handleReload = async () => {
    setRefreshing(true);
    try {
      await onRefreshDB();
      if (searched && bookingCode) {
        const cleanCode = bookingCode.trim().toUpperCase();
        const record = bookings.find(
          (b) => b.bookingCode.toUpperCase() === cleanCode
        );
        if (record) setFoundBooking(record);
      }
    } catch {
      setErrorMsg(t("Failed to sync database data."));
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDepartureDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    if (language === "zh") {
      return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    }
    return d.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  // Find info associated with the active booking
  const associatedBatch = foundBooking ? batches.find((b) => b.id === foundBooking.batchId) : null;
  const associatedTrip = foundBooking ? trips.find((t) => t.id === foundBooking.tripId || t.title === foundBooking.tripTitle) : null;
  
  const maxQuota = associatedBatch ? associatedBatch.quota : 12;
  const durationStr = associatedTrip ? t(associatedTrip.duration) : t("4 Days 3 Nights");

  // Calculate Batch Label dynamically
  const tripBatches = foundBooking 
    ? batches
        .filter((b) => b.tripId === foundBooking.tripId)
        .sort((a, b) => new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime())
    : [];
  const batchIndex = foundBooking ? tripBatches.findIndex((b) => b.id === foundBooking.batchId) : -1;
  const batchLabel = batchIndex !== -1 ? `${t("Batch")} ${batchIndex + 1}` : `${t("Batch")} 2`;

  // Gathering all passengers confirmed in this batch
  const siblingBookings = foundBooking 
    ? bookings.filter((b) => b.batchId === foundBooking.batchId && b.status === "Confirmed")
    : [];

  const passengerList: { name: string; city: string; }[] = [];

  siblingBookings.forEach((b) => {
    const mainCity = b.participantData?.city || "Jakarta";
    
    if (b.participantsNames && b.participantsNames.length > 0) {
      b.participantsNames.forEach((pName) => {
        passengerList.push({
          name: pName,
          city: mainCity,
        });
      });
    } else {
      passengerList.push({
        name: b.fullName,
        city: mainCity,
      });
    }
  });

  const totalSeatsApproved = passengerList.length;
  const percentFilled = Math.min(100, Math.round((totalSeatsApproved / maxQuota) * 100));

  return (
    <div className={`mx-auto space-y-8 pb-16 px-4 transition-all duration-500 ${searched && foundBooking ? "max-w-6xl w-full" : "max-w-xl w-full"}`}>
      {/* Visual Banner */}
      <section className="text-center space-y-2 max-w-md mx-auto print:hidden">
        <div className="inline-flex items-center space-x-2 bg-[#315B4F]/10 text-[#315B4F] px-4 py-1.5 rounded-full text-xs font-semibold">
          <Plane className="w-3.5 h-3.5 text-[#315B4F]" />
          <span>{t("Smart Journey Tracker")}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-gray-900 tracking-tight">
          {t("Booking Status Tracker")}
        </h1>
        <p className="text-sm text-gray-500 font-sans leading-relaxed">
          {t("Enter your Smart Journey unique Booking Code below to check your active travel scheduling and registration status live.")}
        </p>
      </section>

      {/* Main Single Column Container */}
      <div className="space-y-6">
        {(!searched || !foundBooking) ? (
          /* SEARCH INPUT VIEW */
          <div className="bg-white rounded-3xl border border-gray-150 p-6 sm:p-8 shadow-md space-y-6 max-w-md mx-auto print:hidden">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
              className="space-y-5"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-display font-bold uppercase text-gray-400 tracking-wider font-sans">{t("Lacak Reservasi")}</h2>
                <button
                  type="button"
                  onClick={handleReload}
                  className="text-gray-400 hover:text-[#315B4F] flex items-center space-x-1 text-xs cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
                  <span>{t("Sync")}</span>
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block font-sans">{t("Booking Code")}</label>
                  <input
                    id="status-code-input"
                    type="text"
                    required
                    placeholder="e.g., SJ-W8F3T"
                    value={bookingCode}
                    onChange={(e) => setBookingCode(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-[#315B4F]/40 focus:border-[#315B4F] font-bold text-gray-900"
                  />
                  <span className="text-[10px] text-gray-400 block font-light leading-snug font-sans">
                    {t("Enter your exact 6-character custom code (e.g. SJ-W8F3T) to fetch real-time updates.")}
                  </span>
                </div>

                <button
                  id="status-lookup-btn"
                  type="submit"
                  className="w-full bg-[#315B4F] hover:bg-[#1f3a32] text-white py-3 rounded-xl font-display font-bold text-xs tracking-wider uppercase transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-2"
                >
                  <Search className="w-4 h-4 text-[#D6B16D]" />
                  <span>{t("LOOKUP RESERVATION")}</span>
                </button>
              </div>
            </form>

            {/* Subtle Inline Help Demo Codes */}
            <div className="pt-4 border-t border-gray-100 text-center">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block mb-2">{t("Demo Testing Codes")}</span>
              <div className="flex flex-wrap gap-2 justify-center">
                <button 
                  onClick={() => { setBookingCode("SJ-W8F3T"); handleSearch("SJ-W8F3T"); }}
                  className="text-[11px] text-[#315B4F] hover:underline font-mono font-bold"
                >
                  SJ-W8F3T ({t("Approved")})
                </button>
                <span className="text-gray-300">|</span>
                <button 
                  onClick={() => { setBookingCode("SJ-K2P9D"); handleSearch("SJ-K2P9D"); }}
                  className="text-[11px] text-[#315B4F] hover:underline font-mono font-bold"
                >
                  SJ-K2P9D ({t("Pending")})
                </button>
                <span className="text-gray-300">|</span>
                <button 
                  onClick={() => { setBookingCode("SJ-R9Q2X"); handleSearch("SJ-R9Q2X"); }}
                  className="text-[11px] text-[#315B4F] hover:underline font-mono font-bold"
                >
                  SJ-R9Q2X ({t("Rejected")})
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-center space-y-2 animate-fade-in">
                <AlertTriangle className="w-5 h-5 text-rose-500 mx-auto" />
                <p className="text-xs text-rose-800 font-medium font-sans leading-relaxed">{errorMsg}</p>
              </div>
            )}
          </div>
        ) : (
          /* DETAILED AIRPORT DEPARTURE MONITOR */
          <div className="space-y-4 w-full animate-fade-in">
            {/* Elegant Back button at top */}
            <div className="flex items-center justify-between print:hidden">
              <button
                type="button"
                onClick={() => {
                  setSearched(false);
                  setFoundBooking(null);
                }}
                className="inline-flex items-center space-x-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors uppercase font-mono font-bold tracking-wider cursor-pointer font-sans"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t("Cari Booking Lain")}</span>
              </button>

              <button
                type="button"
                onClick={handleReload}
                className="text-gray-400 hover:text-[#315B4F] flex items-center space-x-1 text-xs cursor-pointer font-bold tracking-wider uppercase font-mono"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
                <span>{t("Sync")}</span>
              </button>
            </div>

            {/* THE CARD */}
            <div 
              id="status-result-card"
              className="bg-slate-950 rounded-3xl border-4 border-slate-900 p-6 sm:p-10 shadow-[0_0_50px_rgba(15,23,42,0.8)] space-y-10 text-white text-left font-mono min-h-[75vh] flex flex-col justify-between"
            >
              {/* Distinct Header Bar */}
              <div className="border-b-2 border-slate-800 pb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center space-x-3.5">
                  <span className="text-2xl sm:text-3xl text-[#10B981] animate-pulse">✈️</span>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-100 tracking-[0.25em] uppercase">{t("TRIP MANIFEST / BOARDING PASS")}</h3>
                    <p className="text-[10px] sm:text-xs text-[#D6B16D] font-extrabold tracking-[0.15em] uppercase">{t("OFFICIAL SMART JOURNEY FLIGHT MANIFEST MONITOR")}</p>
                  </div>
                </div>

                {/* Status Badge */}
                <div>
                  {foundBooking.status === "Confirmed" && (
                    <span className="inline-flex items-center space-x-2 text-emerald-400 bg-emerald-950/60 border-2 border-emerald-500/50 px-6 py-3 rounded-xl font-mono font-black text-xs sm:text-sm tracking-[0.2em] uppercase shadow-[0_0_25px_rgba(16,185,129,0.35)]">
                      <span className="w-3 h-3 rounded-full bg-[#10B981] shadow-[0_0_12px_rgba(16,185,129,1)] animate-ping" />
                      <span>{t("OFFICIALLY APPROVED")}</span>
                    </span>
                  )}
                  {foundBooking.status === "Pending" && (
                    <span className="inline-flex items-center space-x-2 text-amber-400 bg-amber-950/60 border-2 border-amber-500/50 px-6 py-3 rounded-xl font-mono font-black text-xs sm:text-sm tracking-[0.2em] uppercase shadow-[0_0_20px_rgba(245,158,11,0.25)]">
                      <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
                      <span>{t("PENDING AUDIT")}</span>
                    </span>
                  )}
                  {foundBooking.status === "Rejected" && (
                    <span className="inline-flex items-center space-x-2 text-rose-400 bg-rose-955/60 border-2 border-rose-500/50 px-6 py-3 rounded-xl font-mono font-black text-xs sm:text-sm tracking-[0.2em] uppercase shadow-[0_0_20px_rgba(244,63,94,0.25)]">
                      <span className="w-3 h-3 rounded-full bg-rose-500" />
                      <span>{t("MUTASI REJECTED")}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Trip Details: SPREAD IN WIDE GRID LAYOUT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 border-b border-slate-800 pb-8 text-xs">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl font-mono space-y-1.5 shadow-inner">
                  <span className="text-slate-500 font-bold tracking-wider block text-[10px]">{t("BOOKING CODE")}</span>
                  <span className="font-mono font-black text-[#10B981] uppercase tracking-wider text-sm sm:text-base block">{foundBooking.bookingCode}</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl font-mono space-y-1.5 shadow-inner">
                  <span className="text-slate-500 font-bold tracking-wider block text-[10px]">{t("TRIP DESTINATION")}</span>
                  <span className="font-mono font-black text-white uppercase tracking-wider text-sm sm:text-base block truncate">{t(foundBooking.tripTitle)}</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl font-mono space-y-1.5 shadow-inner">
                  <span className="text-slate-500 font-bold tracking-wider block text-[10px]">{t("DEPARTURE BATCH")}</span>
                  <span className="font-mono font-black text-white uppercase tracking-wider text-sm sm:text-base block">{batchLabel}</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl font-mono space-y-1.5 shadow-inner">
                  <span className="text-slate-500 font-bold tracking-wider block text-[10px]">{t("DEPARTURE DATE")}</span>
                  <span className="font-mono font-black text-white uppercase tracking-wider text-sm sm:text-base block">{formatDepartureDate(foundBooking.departureDate)}</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl font-mono space-y-1.5 shadow-inner">
                  <span className="text-slate-500 font-bold tracking-wider block text-[10px]">{t("FLIGHT DURATION")}</span>
                  <span className="font-mono font-black text-white uppercase tracking-wider text-sm sm:text-base block">{durationStr}</span>
                </div>
              </div>

              {/* Progress and lists */}
              <div className="space-y-8 flex-grow">
                {foundBooking.status === "Confirmed" && (
                  <div className="space-y-3.5 bg-slate-900/50 p-6 rounded-2xl border border-slate-850 shadow-inner">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 font-mono">
                      <span className="tracking-[0.1em]">{t("TOTAL FLIGHT OCCUPANCY (TOTAL PESERTA)")}</span>
                      <span className="text-[#10B981] font-black text-xs sm:text-sm">
                        {totalSeatsApproved} / {maxQuota} PAX COMPLETED ({percentFilled}%)
                      </span>
                    </div>
                    {/* Glowing digital green progress bar */}
                    <div className="relative w-full h-5 bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
                      <div 
                        className="absolute top-0 left-0 h-full bg-[#10B981] rounded-xl transition-all duration-700 ease-out shadow-[0_0_15px_rgba(16,185,129,0.8)]"
                        style={{ width: `${percentFilled}%` }}
                      />
                    </div>
                  </div>
                )}

                {foundBooking.status === "Pending" && (
                  <div className="p-10 bg-slate-900/60 border border-slate-800 rounded-3xl text-center space-y-3 font-mono my-6 shadow-inner">
                    <p className="text-sm text-amber-400 font-black leading-relaxed tracking-widest uppercase">
                      {t("MANUALLY VERIFYING PAYMENTS IN PROGRESS...")}
                    </p>
                    <p className="text-xs text-slate-400 max-w-lg mx-auto font-sans leading-relaxed">
                      {t("Sistem kami sedang memvalidasi bukti transfer pembayaran Anda secara manual. Anda akan segera diberitahu setelah status disetujui.")}
                    </p>
                  </div>
                )}

                {foundBooking.status === "Rejected" && (
                  <div className="p-10 bg-rose-950/20 border border-rose-900/50 rounded-3xl text-center space-y-4 font-mono my-6">
                    <div className="space-y-1.5 font-sans">
                      <h4 className="text-xs sm:text-sm font-black text-rose-400 uppercase tracking-widest flex items-center justify-center space-x-2 font-mono">
                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                        <span>{t("ALASAN PENOLAKAN SYSTEM")}</span>
                      </h4>
                      <p className="text-xs text-rose-300 max-w-lg mx-auto leading-relaxed">
                        {foundBooking.rejectReason || t("Penolakan terjadi karena bukti bukti transfer Bank Mandiri / BCA buram atau nominal tidak sesuai.")}
                      </p>
                    </div>
                    <a 
                      href="https://wa.me/6285212347289" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex bg-rose-650 hover:bg-rose-700 text-white px-6 py-3 rounded-xl font-mono font-bold text-xs tracking-wider uppercase transition-all shadow-md items-center justify-center space-x-2 cursor-pointer text-center mx-auto"
                    >
                      <span>{t("Hubungi Admin Smart Journey via WhatsApp")}</span>
                    </a>
                  </div>
                )}

                {/* Passenger list segment */}
                {foundBooking.status === "Confirmed" && (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <h4 className="text-xs sm:text-sm font-black text-slate-300 uppercase tracking-[0.2em] font-mono">
                        {t("PASSENGER BOARDING MANIFEST RECORD")} ({passengerList.length} {t("CONFIRMED")})
                      </h4>
                      <span className="text-[10px] text-[#10B981] font-bold tracking-widest font-mono">STATUS: ACTIVE</span>
                    </div>

                    {passengerList.length > 0 ? (
                      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
                        <table className="w-full text-left font-mono border-collapse text-xs sm:text-sm">
                          <thead>
                            <tr className="bg-slate-950 text-slate-500 border-b border-slate-800 text-[10px] sm:text-xs">
                              <th className="py-3.5 px-6 font-bold tracking-wider w-16">{t("SEQ")}</th>
                              <th className="py-3.5 px-6 font-bold tracking-wider">{t("PASSENGER NAME")}</th>
                              <th className="py-3.5 px-6 font-bold tracking-wider">{t("PORT OF ORIGIN")}</th>
                              <th className="py-3.5 px-6 font-bold tracking-wider text-right w-36">{t("BOARDING")}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/80">
                            {passengerList.map((psg, idx) => (
                              <tr 
                                key={idx} 
                                className={`transition-colors duration-150 hover:bg-slate-850/50 ${
                                  idx % 2 === 0 ? "bg-slate-900/60" : "bg-slate-950"
                                }`}
                              >
                                <td className="py-3.5 px-6 text-slate-500 font-extrabold">
                                  {String(idx + 1).padStart(2, "0")}
                                </td>
                                <td className="py-3.5 px-6 font-bold text-slate-100 uppercase tracking-wider">
                                  {psg.name}
                                </td>
                                <td className="py-3.5 px-6 text-slate-400 font-semibold uppercase">
                                  {t(psg.city)}
                                </td>
                                <td className="py-3.5 px-6 text-right">
                                  <span className="inline-flex items-center px-2.5 py-1 rounded text-[10px] font-black bg-emerald-950/80 text-emerald-400 border border-emerald-900/50 tracking-wider">
                                    {t("VERIFIED")}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic py-4">{t("Belum ada peserta yang lunas dikonfirmasi.")}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Print action footer */}
              {foundBooking.status === "Confirmed" && (
                <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="text-[10px] text-slate-500 font-mono tracking-wider text-center md:text-left leading-normal">
                    <span>SECURITY CODES: <b>SMART_JOURNEY//MANIFEST_VERIFIED</b></span>
                    <br />
                    <span>VERIFIED OFFICIAL SMART JOURNEY DEPARTURES</span>
                  </div>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="w-full md:w-auto px-10 py-4.5 bg-[#D6B16D] hover:bg-[#c19d5f] text-slate-950 rounded-xl font-mono font-black text-xs sm:text-sm tracking-[0.2em] uppercase transition-all shadow-lg hover:shadow-amber-500/10 active:scale-[0.99] flex items-center justify-center space-x-3 cursor-pointer text-center"
                  >
                    <Printer className="w-4 h-4 text-slate-950" />
                    <span>{t("Print Travel Instructions")}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
