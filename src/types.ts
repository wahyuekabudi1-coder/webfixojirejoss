export interface Tour {
  id: string;
  name: string;
  description: string;
  duration: string;
  days?: number;
  nights?: number;
  startingPrice: number; // in USD (WNA Price)
  startingPriceIDR: number; // in IDR (WNI Price)
  wniPrice?: number; // explicit alias for startingPriceIDR
  wnaPrice?: number; // explicit alias for startingPrice in USD
  rating: number;
  reviewCount: number;
  image: string;
  highlights: string[];
  itinerary: string[];
  category: 'Adventure' | 'Nature' | 'Culture' | 'City' | string;
  experienceCategory?: 'Adventure' | 'Nature' | 'Culture' | 'City' | string;
  includes?: string[];
  excludes?: string[];
  gallery?: string[];
  whatToBring?: string[];
  status?: 'published' | 'draft' | 'unpublished';
  createdAt?: string;
  updatedAt?: string;
}

export interface Vehicle {
  id: string;
  name: string;
  category: 'Standard' | 'Premium' | 'Family' | 'Van' | string;
  passengers: number;
  luggage: number;
  hasAC: boolean;
  pricePerDay: number; // base pricing
  pricePerDayIDR: number;
  image: string;
  description: string;
  features: string[];
}

export interface Review {
  id: string;
  name: string;
  country: string;
  rating: number;
  text: string;
  date: string;
  avatar: string;
  isLocalGuide?: boolean;
  status?: 'pending' | 'approved';
  serviceType?: 'tour' | 'airport' | 'taxi' | 'rental';
  serviceId?: string;
}

export interface Booking {
  id: string;
  type: 'tour' | 'airport' | 'taxi' | 'rental';
  serviceName: string; // e.g., "Mount Bromo Adventure Tour" or "Juanda Airport Transfer"
  details: {
    pickupLocation?: string;
    destination?: string;
    date: string;
    time?: string;
    guests?: number;
    days?: number;
    vehicleId?: string;
    vehicleName?: string;
    returnDate?: string;
    withDriver?: boolean;
    tourId?: string;
    cityAddress?: string;
    routeType?: 'One Way' | 'Round Trip';
    direction?: 'Airport to City' | 'City to Airport';
    luggage?: number;
    returnDateText?: string;
    returnTimeText?: string;

    // Rental booking zone-based flow extensions
    operationalCity?: string;
    pickupArea?: string;
    dropoffArea?: string;
    pickupZone?: string;
    dropoffZone?: string;
    selectedAddons?: string[];
    pricingBreakdown?: {
      basePriceUSD: number;
      basePriceIDR: number;
      surchargeUSD: number;
      surchargeIDR: number;
      addonsTotalUSD: number;
      addonsTotalIDR: number;
      totalUSD: number;
      totalIDR: number;
      days: number;
      basePricePerDayUSD: number;
      basePricePerDayIDR: number;
    };
  };
  totalPrice: number;
  totalPriceIDR: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  bookingDate: string;
  status: 'Pending' | 'Confirmed' | 'Completed';
  paymentStatus?: 'Unpaid' | 'Paid' | 'Pending';
}

export interface AirportRoute {
  id: string;
  airport: string;
  city: string;
  priceUSD: number;
  priceIDR: number;
  status: 'Published' | 'Draft';
}

export interface Airport {
  code: string;
  name: string;
  description: string;
  status: 'Active' | 'Inactive';
  surchargeUSD: number;
  surchargeIDR: number;
}

export type ActivePage = 'home' | 'tours' | 'share-tour' | 'airport' | 'taxi' | 'partnerships' | 'contact' | 'bookings' | 'car-rental' | 'about' | 'admin';

export interface TaxiMasterArea {
  id: string; // e.g. "A001", "A002"
  name: string; // e.g. "Surabaya", "Malang"
  code: string; // e.g. "SUB", "MLG"
  type: 'Airport' | 'City';
  lat: number;
  lon: number;
  status: 'Active' | 'Inactive';
}

export interface TaxiMasterDestination {
  id: string; // e.g. "D001"
  area_id: string; // foreign key to TaxiMasterArea.id
  name: string; // e.g. "Stasiun Malang Kotabaru"
  lat: number;
  lon: number;
  status: 'Active' | 'Inactive';
}

export interface TaxiPricingRule {
  id: string; // e.g. "P001"
  source_id: string; // reference to TaxiMasterArea.id or TaxiMasterDestination.id
  destination_id: string; // reference to TaxiMasterArea.id or TaxiMasterDestination.id
  vehicle_type: 'Standard' | 'Premium' | 'Family' | 'Van';
  price_usd: number;
  price_idr: number;
  status: 'Active' | 'Inactive';
}

export interface TaxiAreaRule {
  id: string; // e.g. "AR001"
  area_id: string; // foreign key to TaxiMasterArea.id
  surcharge_usd: number;
  surcharge_idr: number;
  is_blackout: boolean;
  note?: string;
}

export interface TaxiImportHistory {
  id: string;
  date: string;
  filename: string;
  importedBy: string;
  importedRows: number;
  updatedRows: number;
  skippedRows: number;
  failedRows: number;
  status: 'Success' | 'Warning' | 'Failed';
  log: string[];
}

export interface OperationalCity {
  id: string;
  name: string;
  status: 'Active' | 'Inactive';
  displayOrder: number;
}

export interface ServiceZone {
  id: string;
  cityId: string;
  name: string;
  code: string;
  description: string;
  status: 'Active' | 'Inactive';
  displayOrder: number;
}

export interface RentalLocation {
  id: string;
  cityId: string;
  name: string;
  zone: 'Zone 0' | 'Zone 1' | 'Zone 2';
  status: 'Active' | 'Inactive';
  displayOrder: number;
  notes?: string;
}

export interface RentalVehicle {
  id: string;
  name: string;
  categoryId: string;
  cityId: string;
  passengers: number;
  luggage: number;
  hasAC: boolean;
  pricePerDay?: number;
  pricePerDayIDR?: number;
  image: string;
  description: string;
  features: string[];
  status: 'Active' | 'Inactive';
  supportedZones: string[];
}

export interface RentalCategory {
  id: string;
  name: string;
  description: string;
  displayOrder: number;
  status: 'Active' | 'Inactive';
  priceZone0USD?: number;
  priceZone0IDR?: number;
  priceZone1USD?: number;
  priceZone1IDR?: number;
  priceZone2USD?: number;
  priceZone2IDR?: number;
}

export interface RentalAddon {
  id: string;
  name: string;
  description: string;
  priceUSD: number;
  priceIDR: number;
  pricingType: 'Fixed' | 'Per Day';
  status: 'Active' | 'Inactive';
  displayOrder: number;
  applicableCategories: string[];
  isRequired: boolean;
}

export interface ZonePricing {
  id: string;
  cityId: string;
  pickupZoneCode: string;
  dropoffZoneCode: string;
  priceUSD: number;
  priceIDR: number;
  status: 'Active' | 'Inactive';
}



