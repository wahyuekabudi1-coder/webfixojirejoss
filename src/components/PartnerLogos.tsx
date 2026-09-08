import React from 'react';
import { OFFICIAL_PARTNERS, PartnerApp } from '../data/partnersData';

interface PartnerLogosProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showAll?: boolean;
}

export default function PartnerLogos({
  className = '',
  size = 'md',
  showAll = false
}: PartnerLogosProps) {
  // Filter top official partners: Traveloka, Trip.com, Booking.com, Airbnb, Agoda, Tiket.com, Klook, Tripadvisor
  const targetIds = ['traveloka', 'trip-com', 'booking-com', 'airbnb', 'agoda', 'tiket-com', 'klook', 'tripadvisor'];
  const partnersList = showAll 
    ? OFFICIAL_PARTNERS 
    : OFFICIAL_PARTNERS.filter(p => targetIds.includes(p.id));

  const sizeClasses = {
    sm: 'w-8 h-8 p-1.5 rounded-lg',
    md: 'w-10 h-10 p-2 rounded-xl',
    lg: 'w-12 h-12 p-2.5 rounded-xl'
  }[size];

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {partnersList.map((partner) => (
        <a
          key={partner.id}
          id={`partner-logo-box-${partner.id}`}
          href={partner.url}
          target="_blank"
          rel="noopener noreferrer"
          title={partner.name}
          aria-label={partner.name}
          className={`${sizeClasses} bg-white border border-neutral-200/90 shadow-xs hover:shadow-md hover:border-amber-400/80 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center cursor-pointer group shrink-0 overflow-hidden`}
        >
          <img
            src={partner.squareLogoUrl || partner.logoUrl}
            alt={partner.name}
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-200 select-none"
            loading="lazy"
          />
        </a>
      ))}
    </div>
  );
}
