export interface PartnerApp {
  id: string;
  name: string;
  url: string;
  logoUrl: string;
  squareLogoUrl?: string;
  category?: string;
  description?: string;
}

export const PARTNERS_DATA_VERSION = '2026.2';

// Crisp, vector SVG data URLs for authentic official 2026 brand logos
export const OFFICIAL_PARTNERS: PartnerApp[] = [
  {
    id: 'traveloka',
    name: 'Traveloka',
    url: 'https://www.traveloka.com',
    category: 'OTA & Flight Booking',
    description: 'Southeast Asia’s leading lifestyle super-app for flights, stays, car rentals, and attractions.',
    squareLogoUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><rect width="64" height="64" rx="14" fill="%230194F3"/><g transform="translate(10, 10)"><path d="M6 30 C 12 30, 24 23, 33 13 C 27 17, 21 19, 17 19 C 23 16, 29 13, 31 10 C 23 13, 17 14, 12 14 C 18 12, 26 7, 29 5 C 20 7, 12 11, 8 17 C 4 21, 5 27, 6 30 Z" fill="%23FFFFFF"/><path d="M12 26 C 16 26, 25 21, 30 15 C 25 18, 20 19, 15 19 Z" fill="%2370D4FF"/></g></svg>`,
    logoUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 60" width="240" height="60"><g transform="translate(8, 8)"><circle cx="22" cy="22" r="22" fill="%230194F3"/><g transform="translate(5, 5)"><path d="M4 24 C 9 24, 19 18, 26 10 C 21 13, 17 15, 13 15 C 18 13, 23 10, 25 8 C 18 10, 14 11, 10 11 C 15 9, 21 5, 23 4 C 16 5, 9 9, 6 13 C 3 17, 4 21, 4 24 Z" fill="%23FFFFFF"/><path d="M9 20 C 13 20, 20 16, 24 12 C 20 14, 16 15, 12 15 Z" fill="%2370D4FF"/></g></g><text x="60" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif" font-size="27" font-weight="900" fill="%230194F3" letter-spacing="-0.5">traveloka</text></svg>`
  },
  {
    id: 'trip-com',
    name: 'Trip.com',
    url: 'https://www.trip.com',
    category: 'Global Travel Platform',
    description: 'International one-stop travel service platform with extensive airline and hotel network.',
    squareLogoUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><rect width="64" height="64" rx="14" fill="%23287DFA"/><g transform="translate(10, 10)"><rect x="2" y="2" width="40" height="40" rx="10" fill="%23287DFA"/><path d="M12 22 L32 22 M22 12 L22 34" stroke="%23FFFFFF" stroke-width="5" stroke-linecap="round" /><circle cx="32" cy="12" r="4.5" fill="%23FF4D4F"/></g></svg>`,
    logoUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 60" width="220" height="60"><g transform="translate(8, 10)"><rect x="0" y="2" width="36" height="36" rx="10" fill="%23287DFA"/><path d="M10 20 L26 20 M18 11 L18 29" stroke="%23FFFFFF" stroke-width="4.5" stroke-linecap="round" /><circle cx="26" cy="11" r="3.5" fill="%23FF4D4F"/></g><text x="52" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="900" fill="%230F294D" letter-spacing="-0.5">Trip<tspan fill="%23287DFA">.com</tspan></text></svg>`
  },
  {
    id: 'booking-com',
    name: 'Booking.com',
    url: 'https://www.booking.com',
    category: 'Hotel Reservations',
    description: 'World’s premier accommodation reservation network connecting travelers with millions of properties.',
    squareLogoUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><rect width="64" height="64" rx="14" fill="%23003580"/><text x="18" y="44" font-family="BlinkMacSystemFont, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="38" font-weight="900" fill="%23FFFFFF">B</text><circle cx="46" cy="42" r="4.5" fill="%2300BAF2"/></svg>`,
    logoUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 60" width="250" height="60"><g transform="translate(6, 7)"><rect width="238" height="46" rx="10" fill="%23003580"/><text x="20" y="33" font-family="BlinkMacSystemFont, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="25" font-weight="900" fill="%23FFFFFF" letter-spacing="-0.3">Booking<tspan fill="%2300BAF2">.com</tspan></text><circle cx="218" cy="18" r="3.5" fill="%2300BAF2"/></g></svg>`
  },
  {
    id: 'airbnb',
    name: 'Airbnb',
    url: 'https://www.airbnb.com',
    category: 'Homestay & Experiences',
    description: 'Global marketplace for unique stays, villas, boutique lodges, and authentic local experiences.',
    squareLogoUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><rect width="64" height="64" rx="14" fill="%23FFFFFF" stroke="%23E5E7EB" stroke-width="1.5"/><g transform="translate(10, 8)"><path d="M22 4 C15 4, 8 9, 6 17 C 3 27, 10 38, 22 49 C 34 38, 41 27, 38 17 C 36 9, 29 4, 22 4 Z M 22 13 C 25.5 13, 28.5 16, 28.5 20.5 C 28.5 26, 24.5 30.5, 22 34 C 19.5 30.5, 15.5 26, 15.5 20.5 C 15.5 16, 18.5 13, 22 13 Z" fill="%23FF385C" fill-rule="evenodd"/></g></svg>`,
    logoUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 60" width="220" height="60"><g transform="translate(10, 8)"><path d="M22 3 C15 3, 8 8, 6 16 C 3 25, 10 35, 22 45 C 34 35, 41 25, 38 16 C 36 8, 29 3, 22 3 Z M 22 11.5 C 25.5 11.5, 28.5 14.5, 28.5 19 C 28.5 24, 24.5 28.5, 22 32 C 19.5 28.5, 15.5 24, 15.5 19 C 15.5 14.5, 18.5 11.5, 22 11.5 Z" fill="%23FF385C" fill-rule="evenodd"/></g><text x="58" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="30" font-weight="800" fill="%23FF385C" letter-spacing="-0.8">airbnb</text></svg>`
  },
  {
    id: 'agoda',
    name: 'Agoda',
    url: 'https://www.agoda.com',
    category: 'Hotel Booking',
    description: 'Asia-Pacific powerhouse for discounted hotel rates, resorts, and vacation home rentals.',
    squareLogoUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><rect width="64" height="64" rx="14" fill="%23FFFFFF" stroke="%23E5E7EB" stroke-width="1.5"/><g transform="translate(6, 12)"><circle cx="8" cy="14" r="5" fill="%23EE2A24"/><circle cx="19" cy="9" r="4.5" fill="%23FFB703"/><circle cx="29" cy="12" r="4.5" fill="%232EC4B6"/><circle cx="39" cy="16" r="4" fill="%230096C7"/><circle cx="47" cy="13" r="4.5" fill="%238E44AD"/><text x="4" y="36" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="900" fill="%23222222" letter-spacing="-0.3">agoda</text></g></svg>`,
    logoUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 60" width="220" height="60"><g transform="translate(14, 5)"><circle cx="12" cy="10" r="5" fill="%23EE2A24"/><circle cx="26" cy="6" r="4.5" fill="%23FFB703"/><circle cx="39" cy="9" r="4.5" fill="%232EC4B6"/><circle cx="52" cy="13" r="4" fill="%230096C7"/><circle cx="64" cy="10" r="4.5" fill="%238E44AD"/></g><text x="14" y="44" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="900" fill="%23222222" letter-spacing="-0.6">agoda</text></svg>`
  },
  {
    id: 'tiket-com',
    name: 'Tiket.com',
    url: 'https://www.tiket.com',
    category: 'Indonesia OTA & Lifestyle',
    description: 'Pioneer Indonesian online travel agent for flights, train tickets, car rentals, and attractions.',
    squareLogoUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><rect width="64" height="64" rx="14" fill="%230064D2"/><circle cx="32" cy="32" r="18" fill="%23FEDD00"/><circle cx="32" cy="32" r="8" fill="%230064D2"/></svg>`,
    logoUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 230 60" width="230" height="60"><g transform="translate(8, 8)"><circle cx="22" cy="22" r="21" fill="%23FEDD00"/><circle cx="22" cy="22" r="9.5" fill="%230064D2"/></g><text x="56" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="29" font-weight="900" fill="%230064D2" letter-spacing="-0.5">tiket<tspan fill="%23FEDD00">.com</tspan></text></svg>`
  },
  {
    id: 'klook',
    name: 'Klook',
    url: 'https://www.klook.com',
    category: 'Attraction Tickets & Tours',
    description: 'Global travel activity and services booking platform for destination discoveries.',
    squareLogoUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><rect width="64" height="64" rx="14" fill="%23FF5B00"/><g transform="translate(12, 12)"><circle cx="20" cy="20" r="18" fill="%23FF5B00"/><path d="M12 20 C 12 14, 16 10, 22 10 C 28 10, 32 14, 32 20 C 32 26, 28 30, 22 30 C 16 30, 12 26, 12 20 Z" fill="%23FF5B00"/><circle cx="16" cy="17" r="7" fill="%23FFD200"/></g></svg>`,
    logoUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 60" width="210" height="60"><g transform="translate(8, 9)"><circle cx="21" cy="21" r="19" fill="%23FF5B00"/><circle cx="16" cy="17" r="7" fill="%23FFD200"/></g><text x="54" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="30" font-weight="900" fill="%23FF5B00" letter-spacing="-0.6">klook</text></svg>`
  },
  {
    id: 'tripadvisor',
    name: 'Tripadvisor',
    url: 'https://www.tripadvisor.com',
    category: 'Travel Guidance & Reviews',
    description: 'The world’s largest travel guidance and review platform helping hundreds of millions of travelers.',
    squareLogoUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><rect width="64" height="64" rx="14" fill="%2300AF87"/><g transform="translate(10, 12)"><circle cx="14" cy="20" r="9" fill="%23FFFFFF"/><circle cx="30" cy="20" r="9" fill="%23FFFFFF"/><circle cx="14" cy="20" r="5" fill="%2300AF87"/><circle cx="30" cy="20" r="5" fill="%2300AF87"/><circle cx="14" cy="20" r="2.5" fill="%23000000"/><circle cx="30" cy="20" r="2.5" fill="%23000000"/><path d="M7 13 C 14 7, 30 7, 37 13 L 22 17 Z" fill="%23004C3F"/><polygon points="22,17 20,23 24,23" fill="%23FF5722"/></g></svg>`,
    logoUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 60" width="240" height="60"><g transform="translate(8, 11)"><circle cx="13" cy="19" r="8.5" fill="%2300AF87"/><circle cx="28" cy="19" r="8.5" fill="%2300AF87"/><circle cx="13" cy="19" r="5" fill="%23FFFFFF"/><circle cx="28" cy="19" r="5" fill="%23FFFFFF"/><circle cx="13" cy="19" r="2.5" fill="%23000000"/><circle cx="28" cy="19" r="2.5" fill="%23000000"/><path d="M6 12 C 12 7, 28 7, 35 12 L 20.5 16 Z" fill="%23004C3F"/><polygon points="20.5,16 18.5,21 22.5,21" fill="%23FF5722"/></g><text x="50" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="900" fill="%23000000" letter-spacing="-0.5">Trip<tspan fill="%2300AF87">advisor</tspan></text></svg>`
  },
  {
    id: 'viator',
    name: 'Viator',
    url: 'https://www.viator.com',
    category: 'Tours & Experiences',
    description: 'A Tripadvisor company specializing in incredible guided tours, excursions, and bucket-list adventures.',
    squareLogoUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><rect width="64" height="64" rx="14" fill="%2300875A"/><g transform="translate(10, 10)"><text x="4" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="900" fill="%23FFFFFF">V</text><circle cx="34" cy="16" r="4.5" fill="%23FFFFFF"/></g></svg>`,
    logoUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60"><text x="10" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="32" font-weight="900" fill="%2300875A" letter-spacing="-0.5">viator</text><circle cx="106" cy="18" r="4" fill="%2300875A"/></svg>`
  },
  {
    id: 'expedia',
    name: 'Expedia',
    url: 'https://www.expedia.com',
    category: 'Global Travel Group',
    description: 'Worldwide full-service online travel brand for flights, vacation packages, and lodging.',
    squareLogoUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><rect width="64" height="64" rx="14" fill="%2300355F"/><g transform="translate(12, 12)"><circle cx="20" cy="20" r="18" fill="%2300355F"/><path d="M10 26 L28 14 L22 26 Z" fill="%23FFCC00"/></g></svg>`,
    logoUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 60" width="220" height="60"><g transform="translate(8, 10)"><circle cx="20" cy="20" r="18" fill="%2300355F"/><path d="M12 25 L26 15 L22 25 Z" fill="%23FFCC00"/></g><text x="52" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="800" fill="%2300355F" letter-spacing="-0.5">Expedia</text></svg>`
  },
  {
    id: 'ctrip',
    name: 'Ctrip (携程旅行)',
    url: 'https://www.ctrip.com',
    category: 'Greater China Leader',
    description: 'Largest travel agency across Greater China providing worldwide comprehensive travel services.',
    squareLogoUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><rect width="64" height="64" rx="14" fill="%232577E3"/><g transform="translate(10, 10)"><path d="M12 22 L32 22 M22 12 L22 32" stroke="%23FFFFFF" stroke-width="5" stroke-linecap="round"/></g></svg>`,
    logoUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 60" width="220" height="60"><g transform="translate(8, 10)"><rect x="0" y="2" width="36" height="36" rx="12" fill="%232577E3"/><path d="M10 20 L26 20 M18 12 L18 28" stroke="%23FFFFFF" stroke-width="4" stroke-linecap="round"/></g><text x="50" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="25" font-weight="800" fill="%232577E3" letter-spacing="-0.5">Ctrip <tspan fill="%23FF4D4F" font-size="21">携程</tspan></text></svg>`
  },
  {
    id: 'getyourguide',
    name: 'GetYourGuide',
    url: 'https://www.getyourguide.com',
    category: 'Experiential Tourism',
    description: 'Premier online booking platform for incredible travel experiences, excursions, and activities.',
    squareLogoUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><rect width="64" height="64" rx="14" fill="%23FF5722"/><g transform="translate(12, 12)"><circle cx="20" cy="20" r="18" fill="%23FF5722"/><text x="13" y="28" font-family="sans-serif" font-size="22" font-weight="900" fill="%23FFFFFF">G</text></g></svg>`,
    logoUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 60" width="240" height="60"><g transform="translate(8, 10)"><circle cx="20" cy="20" r="18" fill="%23FF5722"/><text x="13" y="27" font-family="sans-serif" font-size="22" font-weight="900" fill="%23FFFFFF">G</text></g><text x="52" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="23" font-weight="900" fill="%231A1A1A" letter-spacing="-0.5">GetYourGuide</text></svg>`
  },
  {
    id: 'kkday',
    name: 'KKday',
    url: 'https://www.kkday.com',
    category: 'Asia Tour & Tickets',
    description: 'Leading Asia travel e-commerce platform offering local tours, passes, and bespoke activities.',
    squareLogoUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><rect width="64" height="64" rx="14" fill="%2326C6DA"/><text x="12" y="42" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="900" fill="%23FFFFFF">KK</text></svg>`,
    logoUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60"><g transform="translate(10, 10)"><rect width="40" height="40" rx="10" fill="%2326C6DA"/><text x="6" y="28" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="900" fill="%23FFFFFF">KK</text></g><text x="58" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="900" fill="%2326C6DA" letter-spacing="-0.5">kkday</text></svg>`
  }
];
