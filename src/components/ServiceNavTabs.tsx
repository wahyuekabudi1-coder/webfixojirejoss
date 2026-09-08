import React from 'react';
import { useApp } from '../AppContext';
import { useLanguageCurrency } from '../sharetour/LanguageCurrencyContext';
import { Compass, Users, Plane, Route, Car } from 'lucide-react';

export default function ServiceNavTabs() {
  const { activePage, setPage } = useApp();
  const { t } = useLanguageCurrency();

  const services = [
    { id: 'tours', label: t('nav.tours') || 'Private Tours', icon: Compass },
    { id: 'share-tour', label: t('nav.shareTour') || 'Open Trip / Join Share Tour', badge: 'Open Trip', icon: Users },
    { id: 'airport', label: t('nav.airport') || 'Airport Transfer', icon: Plane },
    { id: 'taxi', label: t('nav.taxi') || 'City Taxi', icon: Route },
    { id: 'car-rental', label: t('nav.carRental') || 'Rental Car', icon: Car },
  ];

  return (
    <div className="w-full bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800 py-2 sticky top-[56px] sm:top-[72px] z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-start md:justify-center overflow-x-auto scrollbar-none gap-2 snap-x snap-mandatory active:cursor-grabbing py-0.5">
        {services.map((srv) => {
          const Icon = srv.icon;
          const isActive = activePage === srv.id;

          return (
            <button
              key={srv.id}
              onClick={() => setPage(srv.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 snap-start min-h-[40px] ${
                isActive
                  ? 'bg-amber-500 text-neutral-950 shadow-sm font-extrabold scale-105'
                  : 'text-neutral-300 hover:text-white active:bg-neutral-800'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-neutral-950' : 'text-amber-400'}`} />
              <span>{srv.label}</span>
              {srv.badge && (
                <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider font-extrabold ${
                  isActive ? 'bg-neutral-950 text-amber-400' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {srv.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
