import React, { useState, useEffect } from "react";
import { Trip, Batch, Booking } from "./types";
import { fetchDB } from "./api";
import TripListing from "./components/TripListing";
import TripDetail from "./components/TripDetail";
import BookingForm from "./components/BookingForm";
import BookingSuccess from "./components/BookingSuccess";
import StatusChecker from "./components/StatusChecker";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import { RefreshCw, MapPin, Compass } from "lucide-react";

export default function App() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  // Navigation Routing State
  // "trips" | "trip-detail" | "book" | "success" | "status" | "admin"
  const [currentView, setCurrentView] = useState<string>("trips");
  
  const [selectedTripSlug, setSelectedTripSlug] = useState<string>("");
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [selectedNationality, setSelectedNationality] = useState<'WNI' | 'WNA' | 'WNA_CHINA' | 'WNA_EUROPE' | null>(null);
  const [recentlyBooked, setRecentlyBooked] = useState<Booking | null>(null);

  // Admin authentication state
  const [adminToken, setAdminToken] = useState<string>(() => {
    return localStorage.getItem("smart_journey_admin_token") || "";
  });

  // Database Loader State
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const refreshDatabase = async () => {
    try {
      const db = await fetchDB();
      setTrips(db.trips || []);
      setBatches(db.batches || []);
      setBookings(db.bookings || []);
      setErrorMsg("");
    } catch (err: any) {
      console.error("Database sync error:", err);
      setErrorMsg(err.message || "Failed to connect to ShareTour server database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshDatabase();

    // Listen to hash and pathname changes for hidden direct admin url routing
    const handleUrlRouting = () => {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      const search = window.location.search.toLowerCase();
      
      if (hash === "#admin" || path.endsWith("/admin") || search.includes("admin=true")) {
        setCurrentView("admin");
      } else if (hash === "#status" || path.endsWith("/status") || path.endsWith("/check-booking") || search.includes("check-booking")) {
        setCurrentView("status");
      }
    };

    handleUrlRouting();
    window.addEventListener("hashchange", handleUrlRouting);
    window.addEventListener("popstate", handleUrlRouting);
    return () => {
      window.removeEventListener("hashchange", handleUrlRouting);
      window.removeEventListener("popstate", handleUrlRouting);
    };
  }, []);

  const handleSelectTrip = (slug: string) => {
    setSelectedTripSlug(slug);
    setCurrentView("trip-detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectBatchToBook = (batchId: string, nationalityType?: 'WNI' | 'WNA' | 'WNA_CHINA' | 'WNA_EUROPE' | null) => {
    setSelectedBatchId(batchId);
    setSelectedNationality(nationalityType ?? null);
    setCurrentView("book");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBookingCompleted = (booking: Booking) => {
    setRecentlyBooked(booking);
    setBookings((prev) => [booking, ...prev]);
    // Soft reload database from server to align quota decrements
    refreshDatabase();
    setCurrentView("success");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAdminSuccess = (token: string) => {
    setAdminToken(token);
    localStorage.setItem("smart_journey_admin_token", token);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAdminLogout = () => {
    setAdminToken("");
    localStorage.removeItem("smart_journey_admin_token");
    setCurrentView("trips");
  };

  const activeTrip = trips.find((t) => t.slug === selectedTripSlug);
  const activeBatch = batches.find((b) => b.id === selectedBatchId);
  const isAdminView = currentView === "admin";

  return (
    <div className={`flex flex-col min-h-screen ${isAdminView ? "bg-[#F8FAFC]" : "bg-[#F4F7F5]"}`} id="smart-journey-root-app">
      {/* Main Container Core Router - Padded below fixed global website Header */}
      <main className={isAdminView ? "flex-1 w-full pt-20" : "flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 sm:pt-28"}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4" id="db-loading-spinner">
            <RefreshCw className="w-10 h-10 text-[#315B4F] animate-spin" />
            <p className="text-sm font-sans font-medium text-gray-500">Synchronizing Smart Journey Open Trips Database...</p>
          </div>
        ) : errorMsg ? (
          <div className="max-w-md mx-auto bg-rose-50 border border-rose-100 p-8 rounded-2xl text-center shadow-lg space-y-4 my-10" id="db-error-panel">
            <h1 className="font-display font-bold text-rose-800 text-lg">Database Connection Error</h1>
            <p className="text-xs text-rose-700 leading-relaxed font-sans">{errorMsg}</p>
            <button
              onClick={() => { setLoading(true); refreshDatabase(); }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg text-xs"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <div className="animate-fade-in relative h-full">
            
            {/* View 1: Trips Overview page */}
            {currentView === "trips" && (
              <TripListing 
                trips={trips}
                batches={batches}
                onSelectTrip={handleSelectTrip}
                onNavigateToCheckStatus={() => {
                  setCurrentView("status");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            )}

            {/* View 2: Trip Detail page */}
            {currentView === "trip-detail" && activeTrip && (
              <TripDetail 
                trip={activeTrip}
                batches={batches}
                onBack={() => {
                  setCurrentView("trips");
                  setSelectedTripSlug("");
                }}
                onBook={handleSelectBatchToBook}
                trips={trips}
                onSelectTrip={handleSelectTrip}
              />
            )}

            {/* View 3: Checkout / registration Form page */}
            {currentView === "book" && activeTrip && activeBatch && (
              <BookingForm 
                trip={activeTrip}
                batch={activeBatch}
                bookingType="shared"
                tourBookingType="shared"
                nationalityType={selectedNationality}
                onBack={() => setCurrentView("trip-detail")}
                onSuccess={handleBookingCompleted}
              />
            )}

            {/* View 4: Success confirmation voucher page */}
            {currentView === "success" && recentlyBooked && (
              <BookingSuccess 
                booking={recentlyBooked}
                onNavigateToTrips={() => {
                  setCurrentView("trips");
                  setRecentlyBooked(null);
                }}
                onNavigateToCheckStatus={(code, email) => {
                  setCurrentView("status");
                  setRecentlyBooked(null);
                }}
              />
            )}

            {/* View 5: Check Status page */}
            {currentView === "status" && (
              <StatusChecker 
                prefilledCode={recentlyBooked?.bookingCode || ""}
                prefilledEmail={recentlyBooked?.email || ""}
                bookings={bookings}
                onRefreshDB={refreshDatabase}
                batches={batches}
                trips={trips}
              />
            )}

            {/* View 6: Secure admin routing door */}
            {currentView === "admin" && (
              adminToken ? (
                <AdminDashboard 
                  trips={trips}
                  batches={batches}
                  bookings={bookings}
                  onRefreshDB={refreshDatabase}
                  onLogout={handleAdminLogout}
                />
              ) : (
                <AdminLogin 
                  onSuccess={handleAdminSuccess}
                  onBack={() => setCurrentView("trips")}
                />
              )
            )}

          </div>
        )}
      </main>
    </div>
  );
}
