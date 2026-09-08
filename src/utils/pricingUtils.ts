/**
 * Smart Journey Unified Pricing & Currency Engine
 * Single Source of Truth for all Tour, Share Tour, and Booking Price Calculations.
 * 
 * Rules:
 * 1. NO hardcoded hacks (e.g. if total == 338 then 6000000).
 * 2. Formatting functions (formatPrice) must NEVER be used for calculations.
 * 3. Consistent pricing across Tour Detail -> Booking Form -> Checkout -> OJIRE Payment Gateway.
 * 4. OJIRE Payment Gateway settles in IDR (Indonesian Rupiah).
 */

export const EXCHANGE_RATE_USD_TO_IDR = 16000;
export const EXCHANGE_RATE_USD_TO_CNY = 7.2;

/**
 * Flag kontrol tombol mata uang asing (USD / Dolar & CNY / Yen).
 * Sementara dimatikan dulu sesuai permintaan pengguna (jangan dihapus kodenya).
 * Jika di masa depan ingin diaktifkan kembali, cukup ubah nilai ini menjadi true.
 */
export const ENABLE_FOREIGN_CURRENCIES = false;

export interface TourPricingResult {
  unitPriceUSD: number;
  unitPriceIDR: number;
  pax: number;
  surchargeMultiplier: number;
  totalPriceUSD: number;
  totalPriceIDR: number;
  paymentAmountIDR: number; // The exact whole-Rupiah amount to be charged by OJIRE Payment Gateway
}

/**
 * Converts USD amount to whole IDR (Rupiah).
 */
export function usdToIDR(usd: number): number {
  if (!usd || isNaN(usd)) return 0;
  return Math.round(usd * EXCHANGE_RATE_USD_TO_IDR);
}

/**
 * Converts IDR amount to USD.
 */
export function idrToUSD(idr: number): number {
  if (!idr || isNaN(idr)) return 0;
  return Math.round(idr / EXCHANGE_RATE_USD_TO_IDR);
}

/**
 * Converts USD amount to CNY.
 */
export function usdToCNY(usd: number): number {
  if (!usd || isNaN(usd)) return 0;
  return Number((usd * EXCHANGE_RATE_USD_TO_CNY).toFixed(1));
}

/**
 * Canonical Pricing Calculator for Private Tours.
 * 
 * - WNI (Wisatawan Domestik): Base is tour.startingPriceIDR (or tour.wniPrice).
 * - WNA (Wisatawan Mancanegara): Base is tour.wnaPrice || Math.round(tour.startingPrice * 1.25).
 *   Equivalent in IDR is exactly unitPriceUSD * 16,000.
 */
export function calculatePrivateTourPricing(
  tour: {
    startingPrice?: number;
    startingPriceIDR?: number;
    wnaPrice?: number;
    wniPrice?: number;
  },
  nationalityType: 'WNI' | 'WNA' | 'WNA_CHINA' | 'WNA_EUROPE' = 'WNI',
  pax: number = 1,
  surchargeMultiplier: number = 1.0
): TourPricingResult {
  const isWNI = nationalityType === 'WNI';
  const safePax = Math.max(1, Number(pax) || 1);
  const mult = Math.max(1.0, Number(surchargeMultiplier) || 1.0);

  const baseStartingPriceUSD = Number(tour?.startingPrice) || 135;
  const baseStartingPriceIDR = Number(tour?.startingPriceIDR || tour?.wniPrice) || Math.round(baseStartingPriceUSD * EXCHANGE_RATE_USD_TO_IDR);

  let unitPriceUSD: number;
  let unitPriceIDR: number;

  if (isWNI) {
    unitPriceIDR = baseStartingPriceIDR;
    unitPriceUSD = Number(tour?.startingPrice) && Number(tour?.startingPrice) < 1000 
      ? Number(tour.startingPrice) 
      : Math.round(unitPriceIDR / EXCHANGE_RATE_USD_TO_IDR);
  } else {
    // WNA: e.g. 135 * 1.25 = 168.75 -> 169 USD
    unitPriceUSD = Number(tour?.wnaPrice) || Math.round(baseStartingPriceUSD * 1.25);
    // IDR equivalent is 169 * 16,000 = 2,704,000 IDR
    unitPriceIDR = Math.round(unitPriceUSD * EXCHANGE_RATE_USD_TO_IDR);
  }

  const subtotalUSD = unitPriceUSD * safePax;
  const subtotalIDR = unitPriceIDR * safePax;

  const totalPriceUSD = Math.round(subtotalUSD * mult);
  const totalPriceIDR = Math.round(subtotalIDR * mult);

  return {
    unitPriceUSD,
    unitPriceIDR,
    pax: safePax,
    surchargeMultiplier: mult,
    totalPriceUSD,
    totalPriceIDR,
    paymentAmountIDR: totalPriceIDR
  };
}

/**
 * Canonical Pricing Calculator for Share Tours / Open Trips.
 */
export function calculateShareTourPricing(
  trip: {
    startingPrice?: number;
    wnaStartingPrice?: number;
    price?: number;
    wnaPrice?: number;
  },
  batch: {
    price?: number;
    wnaPrice?: number;
  } | null | undefined,
  nationalityType: 'WNI' | 'WNA' | 'WNA_CHINA' | 'WNA_EUROPE' = 'WNI',
  pax: number = 1
): TourPricingResult {
  const isWNI = nationalityType === 'WNI';
  const safePax = Math.max(1, Number(pax) || 1);

  let unitPriceUSD: number;

  if (batch) {
    if (isWNI) {
      unitPriceUSD = Number(batch.price) || 150;
    } else {
      unitPriceUSD = Number(batch.wnaPrice) || (Number(batch.price) ? Number(batch.price) + 20 : 170);
    }
  } else {
    if (isWNI) {
      unitPriceUSD = Number(trip.price || trip.startingPrice) || 150;
    } else {
      unitPriceUSD = Number(trip.wnaPrice || trip.wnaStartingPrice) || ((Number(trip.price || trip.startingPrice) || 150) + 20);
    }
  }

  const unitPriceIDR = Math.round(unitPriceUSD * EXCHANGE_RATE_USD_TO_IDR);
  const totalPriceUSD = unitPriceUSD * safePax;
  const totalPriceIDR = Math.round(totalPriceUSD * EXCHANGE_RATE_USD_TO_IDR);

  return {
    unitPriceUSD,
    unitPriceIDR,
    pax: safePax,
    surchargeMultiplier: 1.0,
    totalPriceUSD,
    totalPriceIDR,
    paymentAmountIDR: totalPriceIDR
  };
}

/**
 * Universal safe currency formatter.
 * 
 * Automatically detects whether amount is in USD or IDR.
 * - If amount >= 10,000, it treats the amount as IDR.
 * - If amount < 10,000, it treats the amount as USD.
 * This completely prevents accidental double-conversion (e.g. 5,408,000 * 16,000).
 */
export function formatCurrencyAmount(
  amount: number,
  targetCurrency: 'USD' | 'IDR' | 'CNY' = 'USD'
): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '';

  let amountUSD: number;
  let amountIDR: number;

  if (amount >= 10000) {
    // Input is already in IDR
    amountIDR = amount;
    amountUSD = Math.round(amount / EXCHANGE_RATE_USD_TO_IDR);
  } else {
    // Input is in USD
    amountUSD = amount;
    amountIDR = Math.round(amount * EXCHANGE_RATE_USD_TO_IDR);
  }

  if (targetCurrency === 'IDR') {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.round(amountIDR)).replace('Rp', 'Rp ');
  } else if (targetCurrency === 'CNY') {
    const cnyValue = amountUSD * EXCHANGE_RATE_USD_TO_CNY;
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1
    }).format(cnyValue);
  } else {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.round(amountUSD));
  }
}
