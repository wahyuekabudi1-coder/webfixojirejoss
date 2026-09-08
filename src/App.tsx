/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy, useEffect } from 'react';
import { AppProvider, useApp } from './AppContext';
import { LanguageCurrencyProvider } from './sharetour/LanguageCurrencyContext';
import SEOHead from './components/SEOHead';
import Header from './components/Header';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import HomeView from './views/HomeView';
import { motion, AnimatePresence } from 'motion/react';
import { trackPageView } from './lib/analytics';

// Code-split lazy loaded view chunks to keep initial bundle ultra-light
const ToursView = lazy(() => import('./views/ToursView'));
const AirportTransferView = lazy(() => import('./views/AirportTransferView'));
const TaxiView = lazy(() => import('./views/TaxiView'));
const PartnershipsView = lazy(() => import('./views/PartnershipsView'));
const BookingsView = lazy(() => import('./views/BookingsView'));
const CarRentalView = lazy(() => import('./views/CarRentalView'));
const AboutView = lazy(() => import('./views/AboutView'));
const AdminView = lazy(() => import('./views/AdminView'));
const ShareTourView = lazy(() => import('./views/ShareTourView'));
const PrivacyModal = lazy(() => import('./components/PrivacyModal'));
const TermsModal = lazy(() => import('./components/TermsModal'));

const PageFallback = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center">
    <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
    <span className="text-xs font-mono text-neutral-500 font-bold tracking-wider uppercase">Loading Smart Journey...</span>
  </div>
);

function AppContent() {
  const { activePage } = useApp();

  // Automatic privacy-conscious analytics page view tracking
  useEffect(() => {
    if (activePage === 'admin') return; // Do not log admin dashboard usage as public traffic
    
    const pagePathMap: Record<string, { path: string; title: string }> = {
      home: { path: '/', title: 'Smart Journey - Sewa Mobil, Antar Jemput Bandara & Paket Wisata Bromo Bali' },
      tours: { path: '/tours', title: 'Paket Wisata Private Tour - Bromo, Ijen, Bali & Tumpak Sewu' },
      'share-tour': { path: '/share-tour', title: 'Open Trip & Share Tour Bromo Ijen Murah' },
      airport: { path: '/airport', title: 'Antar Jemput Bandara Juanda, Abdulrachman Saleh & Banyuwangi' },
      taxi: { path: '/taxi', title: 'Layanan Taksi & Antar Jemput Luar Kota Jawa Bali' },
      'car-rental': { path: '/car-rental', title: 'Rental Mobil Lepas Kunci & dengan Supir Terpercaya' },
      about: { path: '/about', title: 'Tentang Smart Journey Indonesia' },
      partnerships: { path: '/partnerships', title: 'Kemitraan & Partner Ekosistem Smart Journey' },
      bookings: { path: '/bookings', title: 'Cek Status Booking & Tiket Wisata' }
    };

    const target = pagePathMap[activePage] || { path: `/${activePage}`, title: 'Smart Journey' };
    trackPageView(target.path, target.title);
  }, [activePage]);

  // Render the appropriate view based on active page
  const renderView = () => {
    switch (activePage) {
      case 'home':
        return <HomeView />;
      case 'tours':
        return <ToursView />;
      case 'share-tour':
        return <ShareTourView />;
      case 'airport':
        return <AirportTransferView />;
      case 'taxi':
        return <TaxiView />;
      case 'car-rental':
        return <CarRentalView />;
      case 'about':
        return <AboutView />;
      case 'partnerships':
        return <PartnershipsView />;
      case 'bookings':
        return <BookingsView />;
      case 'admin':
        return <AdminView />;
      default:
        return <HomeView />;
    }
  };

  if (activePage === 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-slate-900 selection:text-white">
        <main className="grow">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Suspense fallback={<PageFallback />}>
                {renderView()}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F8FAF9] text-neutral-900 flex flex-col justify-between selection:bg-[#315B4F] selection:text-white">
      {/* Skip to main content link for keyboard accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-amber-500 focus:text-neutral-950 focus:font-extrabold focus:rounded-xl focus:shadow-2xl focus:outline-none focus:ring-2 focus:ring-amber-300"
      >
        Skip to main content / Langsung ke konten utama
      </a>

      {/* Dynamic Document Title & SEO Schema Manager */}
      <SEOHead />
      
      {/* Sticky Premium Header */}
      <Header />

      {/* Main Dynamic View Content Container */}
      <main className="grow outline-none w-full overflow-x-hidden" id="main-content" tabIndex={-1}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          >
            <Suspense fallback={<PageFallback />}>
              {renderView()}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating 24/7 WhatsApp help-desk */}
      <FloatingWhatsApp />

      {/* Global Privacy Policy & Terms Modals (Lazy) */}
      <Suspense fallback={null}>
        <PrivacyModal />
        <TermsModal />
      </Suspense>

      {/* Sticky 4-Column Footer */}
      <Footer />
      
    </div>
  );
}

export default function App() {
  return (
    <LanguageCurrencyProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </LanguageCurrencyProvider>
  );
}
