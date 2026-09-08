import { idTranslations } from './id';
import { enTranslations } from './en';
import { zhTranslations } from './zh';
import { 
  DYNAMIC_TOURS, 
  DYNAMIC_VEHICLES, 
  DYNAMIC_FAQS, 
  DYNAMIC_HERO_SLIDES,
  DYNAMIC_WHY_CHOOSE_US,
  DYNAMIC_DESTINATIONS,
  LocalizedTourData 
} from './dynamicData';
import { Tour, Vehicle } from '../types';

export {
  DYNAMIC_TOURS,
  DYNAMIC_VEHICLES,
  DYNAMIC_FAQS,
  DYNAMIC_HERO_SLIDES,
  DYNAMIC_WHY_CHOOSE_US,
  DYNAMIC_DESTINATIONS,
};

export type Language = 'id' | 'en' | 'zh';
export type Currency = 'USD' | 'IDR' | 'CNY';

export const translations = {
  id: idTranslations,
  en: enTranslations,
  zh: zhTranslations,
};

// Safe deep-get helper function
function getNestedValue(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  
  // Direct path lookup first
  const parts = path.split('.');
  const direct = parts.reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
  if (direct !== undefined) return direct;

  // Case-insensitive / normalized lookup
  let current = obj;
  for (const part of parts) {
    if (!current || typeof current !== 'object') return undefined;
    const targetKey = Object.keys(current).find(k => k.toLowerCase() === part.toLowerCase());
    if (!targetKey) return undefined;
    current = current[targetKey];
  }
  return current;
}

// Fallback literal dictionary for older or inline keys
const legacyDictionary: Record<string, Partial<Record<Language, string>>> = {
  'Explore Trips': { id: 'Jelajahi Wisata', en: 'Explore Trips', zh: '探索行程之旅' },
  'Check Booking': { id: 'Cek Pesanan', en: 'Check Booking', zh: '查询预订状态' },
  'Trip Management Portal': { id: 'Portal Kelola Pesanan', en: 'Trip Management Portal', zh: '行程预订管理系统' },
  'SMART JOURNEY': { id: 'SMART JOURNEY', en: 'SMART JOURNEY', zh: '慧捷之旅 SMART JOURNEY' },
  'Our Signature Tours': { id: 'Paket Tour Unggulan', en: 'Our Signature Tours', zh: '我们的招牌生态游' },
  'Starting rate': { id: 'Mulai dari', en: 'Starting rate', zh: '起步价' },
  'Batches Open': { id: 'Batch Dibuka', en: 'Batches Open', zh: '个招募批次开放' },
  'Sold Out': { id: 'Sudah Penuh', en: 'Sold Out', zh: '全额售罄' },
  'Book Now': { id: 'Pesan Sekarang', en: 'Book Now', zh: '立即预订' },
  'View Details': { id: 'Lihat Detail', en: 'View Details', zh: '查看详情' },
  'Verify My Ticket': { id: 'Cek Tiket Saya', en: 'Verify My Ticket', zh: '验证我的电子凭证' },
  'Select': { id: 'Pilih', en: 'Select', zh: '选择' },
  'Selected': { id: 'Dipilih', en: 'Selected', zh: '已选择' },
  'Search': { id: 'Cari', en: 'Search', zh: '搜索' },
  'Share Tour': { id: 'Open Trip / Join Share Tour', en: 'Open Trip / Join Share Tour', zh: '拼团拼车 (Open Trip / Join Share Tour)' },
  'nav.shareTour': { id: 'Open Trip / Join Share Tour', en: 'Open Trip / Join Share Tour', zh: '拼团游 (Open Trip / Join Share Tour)' },
  'nav.sharetour': { id: 'Open Trip / Join Share Tour', en: 'Open Trip / Join Share Tour', zh: '拼团游 (Open Trip / Join Share Tour)' },
  'shareTour': { id: 'Open Trip / Join Share Tour', en: 'Open Trip / Join Share Tour', zh: '拼团游 (Open Trip / Join Share Tour)' },
  'Open Trip': { id: 'Open Trip / Join Share Tour', en: 'Open Trip / Join Share Tour', zh: '拼团游 (Open Trip / Join Share Tour)' },
  'Join Share Tour': { id: 'Open Trip / Join Share Tour', en: 'Open Trip / Join Share Tour', zh: '拼团游 (Open Trip / Join Share Tour)' },
  
  // Navigation & service dropdown aliases
  'nav.services': { id: 'Layanan', en: 'Services', zh: '特色服务' },
  'nav.tour.subtitle': { id: 'Jelajahi destinasi wisata terbaik', en: 'Explore curated travel destinations', zh: '精选经典旅游目的地与路线' },
  'nav.tours.subtitle': { id: 'Jelajahi destinasi wisata terbaik', en: 'Explore curated travel destinations', zh: '精选经典旅游目的地与路线' },
  'nav.toursSubtitle': { id: 'Jelajahi destinasi wisata terbaik', en: 'Explore curated travel destinations', zh: '精选经典旅游目的地与路线' },
  'nav.shareTours.subtitle': { id: 'Gabung open trip hemat & seru', en: 'Join open group trips & split costs', zh: '加入拼团游，高性价比结伴同行' },
  'nav.shareTour.subtitle': { id: 'Gabung open trip hemat & seru', en: 'Join open group trips & split costs', zh: '加入拼团游，高性价比结伴同行' },
  'nav.shareTourSubtitle': { id: 'Gabung open trip hemat & seru', en: 'Join open group trips & split costs', zh: '加入拼团游，高性价比结伴同行' },
  'NAV.NEWBADGE': { id: 'BARU', en: 'NEW', zh: '最新' },
  'nav.newBadge': { id: 'BARU', en: 'NEW', zh: '最新' },
  'nav.airport.subtitle': { id: 'Antar jemput bandara tepat waktu', en: 'Reliable airport pickups & drop-offs', zh: '准时机场接送机服务 (SUB / DPS)' },
  'nav.airportSubtitle': { id: 'Antar jemput bandara tepat waktu', en: 'Reliable airport pickups & drop-offs', zh: '准时机场接送机服务 (SUB / DPS)' },
  'nav.taxi.subtitle': { id: 'Layanan antar kota point-to-point', en: 'Point-to-point intercity private rides', zh: '点对点城际舒适专车直达' },
  'nav.taxiSubtitle': { id: 'Layanan antar kota point-to-point', en: 'Point-to-point intercity private rides', zh: '点对点城际舒适专车直达' },
  'nav.rental.subtitle': { id: 'Sewa mobil dengan driver atau lepas kunci', en: 'With driver or self-drive options', zh: '优质车队，支持带驾或自驾' },
  'nav.carRental.subtitle': { id: 'Sewa mobil dengan driver atau lepas kunci', en: 'With driver or self-drive options', zh: '优质车队，支持带驾或自驾' },
  'nav.carRentalSubtitle': { id: 'Sewa mobil dengan driver atau lepas kunci', en: 'With driver or self-drive options', zh: '优质车队，支持带驾或自驾' },

  // Footer aliases
  'FOOTER.SERVICESTITLE': { id: 'Layanan', en: 'Services', zh: '特色服务' },
  'footer.servicesTitle': { id: 'Layanan', en: 'Services', zh: '特色服务' },
  'footer.services': { id: 'Layanan', en: 'Services', zh: '特色服务' },
  'FOOTER.CONTACTTITLE': { id: 'Kontak', en: 'Contact', zh: '联系我们' },
  'footer.contactTitle': { id: 'Kontak', en: 'Contact', zh: '联系我们' },
  'footer.contact': { id: 'Kontak', en: 'Contact', zh: '联系我们' },
  'footer.aboutText': { 
    id: 'Smart Journey adalah operator tur dan penyedia transportasi berizin resmi di bawah PT Sawah Jaya Trans. Melayani wisata gunung berapi Bromo & Ijen, sewa mobil, dan transfer bandara di Jawa Timur & Bali.', 
    en: 'Smart Journey is an officially licensed travel and transportation operator under PT Sawah Jaya Trans. Specializing in Mount Bromo and Ijen Crater volcanic tours, private car rentals, and 24/7 airport transfers across East Java and Bali.', 
    zh: 'Smart Journey 慧捷之旅是 PT Sawah Jaya Trans 旗下正规持牌旅游出行品牌。专注布罗莫与宜珍火山生态游、商务包车及全天候机场接送，覆盖印尼东爪哇与巴厘岛。' 
  },
  'footer.aboutCompany': { 
    id: 'Smart Journey adalah operator tur dan penyedia transportasi berizin resmi di bawah PT Sawah Jaya Trans. Melayani wisata gunung berapi Bromo & Ijen, sewa mobil, dan transfer bandara di Jawa Timur & Bali.', 
    en: 'Smart Journey is an officially licensed travel and transportation operator under PT Sawah Jaya Trans. Specializing in Mount Bromo and Ijen Crater volcanic tours, private car rentals, and 24/7 airport transfers across East Java and Bali.', 
    zh: 'Smart Journey 慧捷之旅是 PT Sawah Jaya Trans 旗下正规持牌旅游出行品牌。专注布罗莫与宜珍火山生态游、商务包车及全天候机场接送，覆盖印尼东爪哇与巴厘岛。' 
  },
  'footer.officialOperator': { id: 'Operator Perjalanan Berizin Resmi', en: 'Official Licensed Travel Operator', zh: '正规持牌旅行与车队运营商' },
  'footer.socialMedia': { id: 'Media Sosial', en: 'Social Media', zh: '官方社交媒体' },
  'footer.partnerships': { id: 'Kemitraan B2B', en: 'B2B Partnerships', zh: 'B2B 商务合作' },
  'footer.secure': { id: '100% AMAN & TERPERCAYA', en: '100% SECURE & TRUSTED', zh: '100% 安全可靠' },
  'footer.secureSubtitle': { id: 'Pembayaran Anda aman bersama kami.', en: 'Your payment is safe and secure with us.', zh: '您的支付与预订全程受加密安全保护。' },
  'footer.licensed': { id: 'IZIN ANGKUTAN RESMI', en: 'OFFICIAL TRANSPORT LICENSE', zh: '正规客运营运资质' },
  'footer.paymentMethods': { id: 'METODE PEMBAYARAN YANG DITERIMA', en: 'ACCEPTED PAYMENT METHODS', zh: '支持的付款方式' },
  'footer.privacyPolicy': { id: 'Kebijakan Privasi', en: 'Privacy Policy', zh: '隐私政策' },
  'footer.termsConditions': { id: 'Syarat & Ketentuan', en: 'Terms & Conditions', zh: '服务条款' },
  'footer.contactUs': { id: 'Hubungi Kami', en: 'Contact Us', zh: '联系我们' },
  'footer.adminAccess': { id: 'Akses Admin', en: 'Admin Access', zh: '后台管理' },
  'footer.adminWebsite': { id: 'Admin Smart Journey', en: 'Admin Smart Journey', zh: '主网站后台管理' },
  'footer.adminShareTour': { id: 'Admin Share Tour', en: 'Admin Share Tour', zh: '拼团/拼车后台管理' },
  'footer.allRightsReserved': { id: 'All rights reserved', en: 'All rights reserved', zh: 'All rights reserved' },
  'footer.copyright': { id: '© 2026 PT Sawah Jaya Trans. All rights reserved.', en: '© 2026 PT Sawah Jaya Trans. All rights reserved.', zh: '© 2026 PT Sawah Jaya Trans. All rights reserved.' },

  // WeChat Modal
  'wechat.title': { id: 'Layanan Pelanggan Resmi WeChat', en: 'Official WeChat Customer Service', zh: 'Smart Journey 官方微信客服' },
  'wechat.instruction': { id: 'Pindai QR Code menggunakan aplikasi WeChat atau salin ID WeChat untuk terhubung dengan konsultan perjalanan kami.', en: 'Scan QR Code with WeChat app or copy WeChat ID to connect with our official travel consultants.', zh: '使用微信扫描上方二维码，或复制微信号添加官方客服，为您提供一对一行程定制咨询。' },
  'wechat.done': { id: 'Selesai', en: 'Done', zh: '完成' },
  'wechat.copied': { id: 'Tersalin!', en: 'Copied!', zh: '已复制！' },
  'wechat.copyId': { id: 'Salin ID', en: 'Copy ID', zh: '复制微信号' },

  // Booking details check banner
  'Already booked an expedition?': {
    id: 'Sudah memesan paket perjalanan?',
    en: 'Already booked an expedition?',
    zh: '已经预订过了探险行程？'
  },
  'Check your real-time verification logs or trace your trip itinerary voucher status instantly.': {
    id: 'Cek log verifikasi real-time atau lacak status voucher jadwal perjalanan Anda secara instan.',
    en: 'Check your real-time verification logs or trace your trip itinerary voucher status instantly.',
    zh: '查看您的真实飞行与向导交接日志，或者即时追踪您的行程单和代金券激活状态。'
  },
  'Check Booking Details': {
    id: 'Cek Detail Pesanan',
    en: 'Check Booking Details',
    zh: '查询预订详情'
  },
};

/**
 * Universal translation resolver:
 * 1. Checks structured path (e.g. 'nav.home', 'home.heroTitleHighlight', 'common.bookNow')
 * 2. If not found, checks legacy dictionary
 * 3. Falls back to English, then Indonesian, then the key itself
 */
export function translateKey(key: string, language: Language, params?: Record<string, string | number>): string {
  if (!key) return '';
  const cleanKey = key.trim();

  // 1. Try structured dot notation in current language
  let result = getNestedValue(translations[language], cleanKey);

  // Fallback to English if missing
  if (result === undefined && language !== 'en') {
    result = getNestedValue(translations['en'], cleanKey);
  }

  // Fallback to Indonesian if missing
  if (result === undefined && language !== 'id') {
    result = getNestedValue(translations['id'], cleanKey);
  }

  // 2. Try legacy dictionary
  if (result === undefined && legacyDictionary[cleanKey]) {
    result = legacyDictionary[cleanKey][language] || legacyDictionary[cleanKey]['en'] || legacyDictionary[cleanKey]['id'];
  }

  // If still not found:
  // If the key is an internal key pattern (e.g. 'nav.xxx.subtitle' or 'NAV.XXX' or 'footer.xxx') that wasn't matched,
  // return safe human text instead of leaking the code key to the UI
  let text = typeof result === 'string' ? result : cleanKey;
  if (result === undefined) {
    if (/^nav\..*subtitle/i.test(cleanKey) || /\.subtitle$/i.test(cleanKey)) {
      text = '';
    } else if (/^nav\.newbadge$/i.test(cleanKey) || cleanKey.toUpperCase() === 'NAV.NEWBADGE') {
      text = language === 'zh' ? '最新' : language === 'id' ? 'BARU' : 'NEW';
    } else if (/^footer\.services/i.test(cleanKey) || cleanKey.toUpperCase() === 'FOOTER.SERVICESTITLE') {
      text = language === 'zh' ? '特色服务' : language === 'id' ? 'Layanan' : 'Services';
    } else if (/^footer\.contact/i.test(cleanKey) || cleanKey.toUpperCase() === 'FOOTER.CONTACTTITLE') {
      text = language === 'zh' ? '联系我们' : language === 'id' ? 'Kontak' : 'Contact';
    } else if (/^footer\.partnership/i.test(cleanKey)) {
      text = language === 'zh' ? 'B2B 商务合作' : language === 'id' ? 'Kemitraan B2B' : 'B2B Partnerships';
    } else if (/^footer\.secure/i.test(cleanKey)) {
      text = language === 'zh' ? '100% 安全可靠' : language === 'id' ? '100% AMAN & TERPERCAYA' : '100% SECURE & TRUSTED';
    } else if (/^footer\.licensed/i.test(cleanKey)) {
      text = language === 'zh' ? '正规客运营运资质' : language === 'id' ? 'IZIN ANGKUTAN RESMI' : 'OFFICIAL TRANSPORT LICENSE';
    } else if (/^footer\.about/i.test(cleanKey)) {
      text = language === 'zh'
        ? 'Smart Journey 慧捷之旅是 PT Sawah Jaya Trans 旗下正规持牌旅游出行品牌。专注布罗莫与宜珍火山生态游、商务包车及全天候机场接送，覆盖印尼东爪哇与巴厘岛。'
        : language === 'id'
        ? 'Smart Journey adalah operator tur dan penyedia transportasi berizin resmi di bawah PT Sawah Jaya Trans. Melayani wisata gunung berapi Bromo & Ijen, sewa mobil, dan transfer bandara di Jawa Timur & Bali.'
        : 'Smart Journey is an officially licensed travel and transportation operator under PT Sawah Jaya Trans. Specializing in Mount Bromo and Ijen Crater volcanic tours, private car rentals, and 24/7 airport transfers across East Java and Bali.';
    } else if (/^footer\.official/i.test(cleanKey)) {
      text = language === 'zh' ? '正规持牌旅行与车队运营商' : language === 'id' ? 'Operator Perjalanan Berizin Resmi' : 'Official Licensed Travel Operator';
    }
  }

  // Replace interpolation variables if any (e.g. {{name}} or {count})
  if (params && typeof text === 'string') {
    for (const [pKey, pVal] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{\\{?${pKey}\\}?\\}`, 'g'), String(pVal));
    }
  }

  return text;
}

/**
 * Helper to get a fully localized Tour object
 */
export function getLocalizedTour(tour: Tour, language: Language): Tour {
  const dynamic = DYNAMIC_TOURS[tour.id];
  if (!dynamic) return tour;

  return {
    ...tour,
    name: dynamic.name[language] || dynamic.name['en'] || dynamic.name['id'] || tour.name,
    description: dynamic.description[language] || dynamic.description['en'] || dynamic.description['id'] || tour.description,
    duration: dynamic.duration[language] || dynamic.duration['en'] || dynamic.duration['id'] || tour.duration,
    category: dynamic.category[language] || dynamic.category['en'] || dynamic.category['id'] || tour.category,
    highlights: dynamic.highlights[language] || dynamic.highlights['en'] || dynamic.highlights['id'] || tour.highlights,
    itinerary: dynamic.itinerary[language] || dynamic.itinerary['en'] || dynamic.itinerary['id'] || tour.itinerary,
  };
}

/**
 * Helper to get a fully localized Vehicle object
 */
export function getLocalizedVehicle(vehicle: Vehicle, language: Language): Vehicle {
  const dynamic = DYNAMIC_VEHICLES[vehicle.id];
  if (!dynamic) return vehicle;

  return {
    ...vehicle,
    category: dynamic.category[language] || dynamic.category['en'] || dynamic.category['id'] || vehicle.category,
    description: dynamic.description[language] || dynamic.description['en'] || dynamic.description['id'] || vehicle.description,
    features: dynamic.features[language] || dynamic.features['en'] || dynamic.features['id'] || vehicle.features,
  };
}

/**
 * Helper to get localized FAQs list
 */
export function getLocalizedFAQs(language: Language): Array<{ question: string; answer: string }> {
  return DYNAMIC_FAQS.map(faq => ({
    question: faq.question[language] || faq.question['en'] || faq.question['id'],
    answer: faq.answer[language] || faq.answer['en'] || faq.answer['id']
  }));
}

/**
 * Localized City and Airport names
 */
export const LOCALIZED_CITIES: Record<string, Record<Language, string>> = {
  'Surabaya': { id: 'Surabaya', en: 'Surabaya', zh: '泗水 (Surabaya)' },
  'Malang': { id: 'Malang', en: 'Malang', zh: '玛琅 (Malang)' },
  'Batu': { id: 'Kota Batu', en: 'Batu City', zh: '巴图 (Batu)' },
  'Banyuwangi': { id: 'Banyuwangi (Ijen)', en: 'Banyuwangi (Ijen)', zh: '外南梦/宜珍 (Banyuwangi)' },
  'Probolinggo (Bromo)': { id: 'Probolinggo (Bromo)', en: 'Probolinggo (Bromo)', zh: '庞越/布罗莫 (Probolinggo/Bromo)' },
  'Yogyakarta': { id: 'Yogyakarta', en: 'Yogyakarta', zh: '日惹 (Yogyakarta)' },
  'Denpasar (Bali)': { id: 'Denpasar / Bali', en: 'Denpasar / Bali', zh: '登巴萨 / 巴厘岛 (Bali)' },
  'Jakarta': { id: 'Jakarta', en: 'Jakarta', zh: '雅加达 (Jakarta)' },
};

export function getLocalizedCity(cityName: string, language: Language): string {
  if (LOCALIZED_CITIES[cityName]) {
    return LOCALIZED_CITIES[cityName][language] || cityName;
  }
  return cityName;
}

export const LOCALIZED_AIRPORTS: Record<string, Record<Language, string>> = {
  'SUB': { id: 'Bandara Internasional Juanda (Surabaya - SUB)', en: 'Juanda International Airport (Surabaya - SUB)', zh: '泗水朱安达国际机场 (Juanda - SUB)' },
  'DPS': { id: 'Bandara Internasional Ngurah Rai (Bali - DPS)', en: 'Ngurah Rai International Airport (Bali - DPS)', zh: '巴厘岛伍拉·赖国际机场 (Ngurah Rai - DPS)' },
  'YIA': { id: 'Bandara Internasional Yogyakarta (YIA)', en: 'Yogyakarta International Airport (YIA)', zh: '日惹国际机场 (Yogyakarta - YIA)' },
  'CGK': { id: 'Bandara Internasional Soekarno-Hatta (Jakarta - CGK)', en: 'Soekarno-Hatta International Airport (Jakarta - CGK)', zh: '雅加达苏加诺-哈达国际机场 (CGK)' },
};

export function getLocalizedAirport(code: string, language: Language): string {
  if (LOCALIZED_AIRPORTS[code]) {
    return LOCALIZED_AIRPORTS[code][language] || code;
  }
  return code;
}

export function getLocalizedHeroSlides(language: Language) {
  return DYNAMIC_HERO_SLIDES.map(slide => ({
    ...slide,
    title: slide.title[language] || slide.title['en'] || slide.title['id'],
    subtitle: slide.subtitle[language] || slide.subtitle['en'] || slide.subtitle['id'],
    tag: slide.tag[language] || slide.tag['en'] || slide.tag['id'],
  }));
}

export function getLocalizedWhyUs(language: Language) {
  return DYNAMIC_WHY_CHOOSE_US.map(item => ({
    id: item.id,
    title: item.title[language] || item.title['en'] || item.title['id'],
    description: item.description[language] || item.description['en'] || item.description['id'],
  }));
}

export function getLocalizedDestinations(language: Language) {
  return DYNAMIC_DESTINATIONS.map(dest => ({
    id: dest.id,
    name: dest.name[language] || dest.name['en'] || dest.name['id'],
    region: dest.region[language] || dest.region['en'] || dest.region['id'],
    description: dest.description[language] || dest.description['en'] || dest.description['id'],
    image: dest.image,
    tourCount: dest.tourCount[language] || dest.tourCount['en'] || dest.tourCount['id'],
    highlightTag: dest.highlightTag[language] || dest.highlightTag['en'] || dest.highlightTag['id'],
  }));
}
