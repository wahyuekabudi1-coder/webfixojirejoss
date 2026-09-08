import React, { useEffect } from 'react';
import { useApp } from '../AppContext';
import { useLanguageCurrency } from '../sharetour/LanguageCurrencyContext';
import { getLocalizedTour } from '../locales';

interface PageMetadata {
  title: Record<string, string>;
  description: Record<string, string>;
  keywords: Record<string, string>;
  canonical: string;
  breadcrumbsName: Record<string, string>;
  schemaType: string;
  schemaData: object;
}

const BASE_URL = 'https://smartjourney.co.id';
const OFFICIAL_PHONE = '+6285212347289';
const OFFICIAL_ADDRESS = {
  '@type': 'PostalAddress',
  'streetAddress': 'Jl. Puntadewa No. 192, Tumpang',
  'addressLocality': 'Malang',
  'addressRegion': 'Jawa Timur',
  'postalCode': '65156',
  'addressCountry': 'ID'
};

const defaultCompanySchema = {
  '@context': 'https://schema.org',
  '@type': 'TravelAgency',
  'name': 'Smart Journey Indonesia',
  'legalName': 'PT Sawah Jaya Trans 1',
  'image': 'https://images.unsplash.com/photo-1605538032432-a9f0c8d9baac?auto=format&fit=crop&w=1200&q=80',
  'url': BASE_URL,
  'telephone': OFFICIAL_PHONE,
  'email': 'sawahjayatrans@gmail.com',
  'priceRange': 'IDR 175.000 - IDR 5.000.000',
  'address': OFFICIAL_ADDRESS,
  'geo': {
    '@type': 'GeoCoordinates',
    'latitude': -7.983908,
    'longitude': 112.621391
  },
  'openingHoursSpecification': {
    '@type': 'OpeningHoursSpecification',
    'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    'opens': '00:00',
    'closes': '23:59'
  },
  'aggregateRating': {
    '@type': 'AggregateRating',
    'ratingValue': '4.9',
    'reviewCount': '849'
  }
};

const pageSEOData: Record<string, PageMetadata> = {
  home: {
    title: {
      id: 'Smart Journey | Paket Tour Bromo Ijen, Sewa Mobil & Transfer Bandara',
      en: 'Smart Journey | Bromo Ijen Volcano Tours, Car Rental & Airport Transfers',
      zh: 'Smart Journey 慧捷之旅 | 布罗莫宜珍火山游、包车租车与机场接送'
    },
    description: {
      id: 'Smart Journey (PT Sawah Jaya Trans 1) menyediakan paket tour Bromo Ijen Blue Fire, sewa mobil Innova Zenix HiAce, taksi privat antar kota, dan transfer bandara 24 jam.',
      en: 'Smart Journey provides private Mount Bromo & Ijen Blue Fire volcano tours, Innova Zenix & HiAce car rental, intercity private taxis, and 24/7 airport transfers in East Java & Bali.',
      zh: 'Smart Journey 专注印尼东爪哇与巴厘岛布罗莫火山日出、宜珍神秘蓝火私人包车定制游、Innova与HiAce商务车租车及24小时机场接送机服务。'
    },
    keywords: {
      id: 'paket tour bromo, tour ijen blue fire, sewa mobil surabaya, rental hiace malang, transfer bandara juanda, smart journey, private tour bali',
      en: 'bromo tour package, ijen blue fire tour, car rental surabaya, hiace rental malang, juanda airport transfer, smart journey, private tour east java',
      zh: '布罗莫火山旅游, 宜珍火山蓝火, 泗水包车, 玛琅租车, 泗水机场接送, 慧捷之旅, 印尼火山定制游'
    },
    canonical: `${BASE_URL}/`,
    breadcrumbsName: {
      id: 'Beranda',
      en: 'Home',
      zh: '首页'
    },
    schemaType: 'TravelAgency',
    schemaData: defaultCompanySchema
  },
  tours: {
    title: {
      id: 'Paket Tour Wisata Bromo, Ijen, Malang & Bali | Smart Journey',
      en: 'Volcano & Nature Tour Packages: Bromo, Ijen, Malang | Smart Journey',
      zh: '精选火山旅游套餐：布罗莫、宜珍蓝火、赛武瀑布 | Smart Journey'
    },
    description: {
      id: 'Pesan paket tour privat Bromo 4x4 Jeep sunrise, Kawah Ijen blue fire, Malang Batu highland, dan Tumpak Sewu dengan jaminan harga terbaik & pengemudi berpengalaman.',
      en: 'Book private Mount Bromo sunrise 4x4 Jeep tours, Ijen Crater electric blue fire, Malang Batu heritage, and Tumpak Sewu waterfalls with guaranteed top ratings.',
      zh: '预订布罗莫火山 4x4 越野吉普车日出、宜珍火山电光蓝火、玛琅古城与赛武千重瀑布私人定制游。'
    },
    keywords: {
      id: 'paket tour bromo sunrise, kawah ijen midnight tour, paket wisata malang batu, tumpaksewu tour, tour bali private, booking tour indonesia',
      en: 'bromo sunrise tour, ijen crater blue fire, tumpak sewu waterfall tour, malang batu tour, east java private tours',
      zh: '布罗莫日出行程, 宜珍蓝火徒步, 赛武瀑布一日游, 玛琅包车, 东爪哇火山之旅'
    },
    canonical: `${BASE_URL}/#/tours`,
    breadcrumbsName: {
      id: 'Paket Tour Wisata',
      en: 'Tour Packages',
      zh: '旅游套餐'
    },
    schemaType: 'OfferCatalog',
    schemaData: {
      '@context': 'https://schema.org',
      '@type': 'OfferCatalog',
      'name': 'Smart Journey Volcano Tour Catalog',
    }
  },
  airport: {
    title: {
      id: 'Layanan Transfer Bandara Surabaya, Bali, Jogja, Jakarta 24 Jam | Smart Journey',
      en: '24/7 Airport Transfers: Surabaya, Bali, Yogyakarta, Jakarta | Smart Journey',
      zh: '24小时机场专车接送机：泗水、巴厘岛、日惹、雅加达 | Smart Journey'
    },
    description: {
      id: 'Antar jemput bandara Juanda (SUB), Ngurah Rai (DPS), YIA, dan CGK tepat waktu dengan armada ber-AC bersih dan gratis pelacakan delay pesawat.',
      en: 'Punctual private airport transfers for Juanda (Surabaya), Ngurah Rai (Bali), YIA (Yogyakarta), and CGK (Jakarta) with live flight tracking.',
      zh: '准时接送泗水 Juanda (SUB)、巴厘岛 Ngurah Rai (DPS)、日惹 YIA、雅加达 CGK 机场，实时航班追踪与VIP举牌接送。'
    },
    keywords: {
      id: 'transfer bandara juanda, antar jemput airport surabaya, drop off bandara bali, airport transfer ngurah rai, taksi bandara yia',
      en: 'juanda airport transfer, surabaya airport taxi, bali ngurah rai airport transfer, yogyakarta airport pickup, jakarta airport car',
      zh: '泗水机场接送, 巴厘岛机场接机, 日惹机场包车, 雅加达机场送机, 印尼机场专车'
    },
    canonical: `${BASE_URL}/#/airport`,
    breadcrumbsName: {
      id: 'Transfer Bandara',
      en: 'Airport Transfer',
      zh: '机场接送'
    },
    schemaType: 'TaxiService',
    schemaData: defaultCompanySchema
  },
  taxi: {
    title: {
      id: 'Taksi Privat Antar Kota Surabaya, Malang, Bromo, Banyuwangi, Bali | Smart Journey',
      en: 'Private Intercity Taxi & Shuttle East Java & Bali | Smart Journey',
      zh: '城际专车包车与点对点接送 东爪哇 & 巴厘岛 | Smart Journey'
    },
    description: {
      id: 'Layanan taksi privat antar kota door-to-door dengan harga flat transparan. Bebas repot tanpa gabung penumpang lain, sudah termasuk tol dan BBM.',
      en: 'Direct door-to-door private intercity taxi service across East Java & Bali. Flat fixed pricing, all tolls and fuel included.',
      zh: '点对点直达城际专车，全包透明一口价，包含高速费与燃油费，独立私密专车。'
    },
    keywords: {
      id: 'taksi surabaya malang, travel surabaya bromo, drop banyuwangi surabaya, taksi privat antar kota jawa timur, sewa mobil drop off',
      en: 'surabaya to malang taxi, bromo to surabaya private driver, banyuwangi intercity taxi, east java private transfer',
      zh: '泗水到玛琅专车, 泗水到布罗莫包车, 外南梦到泗水接送, 东爪哇城际专车'
    },
    canonical: `${BASE_URL}/#/taxi`,
    breadcrumbsName: {
      id: 'Taksi Privat',
      en: 'Private Taxi',
      zh: '城际专车'
    },
    schemaType: 'TaxiService',
    schemaData: defaultCompanySchema
  },
  'car-rental': {
    title: {
      id: 'Sewa Mobil Surabaya, Malang & Bali (Lepas Kunci & Driver) | Smart Journey',
      en: 'Car Rental Surabaya, Malang & Bali (Self-Drive & With Driver) | Smart Journey',
      zh: '印尼租车包车：泗水、玛琅与巴厘岛（自驾/带司机）| Smart Journey'
    },
    description: {
      id: 'Rental mobil harian Innova Zenix, Avanza, HiAce Commuter, dan Premio dengan kondisi prima, AC dingin, dan harga bersahabat.',
      en: 'Daily and weekly car rentals for Innova Zenix, Avanza, HiAce Commuter, and Premio Luxury in East Java & Bali.',
      zh: '提供 Innova Zenix、Avanza、HiAce 15座及头等舱商务车日租与周租，车况如新，服务周到。'
    },
    keywords: {
      id: 'sewa mobil surabaya, rental hiace malang, rental innova reborn surabaya, sewa hiace premio bali, car rental east java',
      en: 'car rental surabaya, hiace rental malang, innova rental bromo, van rental bali, self drive indonesia car',
      zh: '泗水租车, 玛琅HiAce包车, 印尼自驾租车, 巴厘岛包车, 布罗莫租车'
    },
    canonical: `${BASE_URL}/#/car-rental`,
    breadcrumbsName: {
      id: 'Sewa Mobil',
      en: 'Car Rental',
      zh: '租车包车'
    },
    schemaType: 'AutoRental',
    schemaData: defaultCompanySchema
  },
  about: {
    title: {
      id: 'Tentang Kami - PT Sawah Jaya Trans 1 (Smart Journey)',
      en: 'About Us - PT Sawah Jaya Trans 1 (Smart Journey)',
      zh: '关于我们 - PT Sawah Jaya Trans 1 (Smart Journey 慧捷之旅)'
    },
    description: {
      id: 'Profil PT Sawah Jaya Trans 1, legalitas izin pariwisata resmi, visi keselamatan berkendara, dan komitmen layanan prima Smart Journey Indonesia.',
      en: 'Learn about PT Sawah Jaya Trans 1, our official tourism transport licenses, strict safety standards, and commitment to hospitality in Indonesia.',
      zh: '了解 PT Sawah Jaya Trans 1 企业资质、正规营运牌照、安全行车标准与高品质客户服务承诺。'
    },
    keywords: {
      id: 'tentang smart journey, pt sawah jaya trans 1, legalitas travel jawa timur, profil perusahaan tour malang',
      en: 'about smart journey, pt sawah jaya trans 1, official tour operator east java, licensed transport company',
      zh: '关于慧捷之旅, PT Sawah Jaya Trans 1, 正规印尼地接社, 官方牌照车队'
    },
    canonical: `${BASE_URL}/#/about`,
    breadcrumbsName: {
      id: 'Tentang Kami',
      en: 'About Us',
      zh: '关于我们'
    },
    schemaType: 'AboutPage',
    schemaData: defaultCompanySchema
  },
  partnerships: {
    title: {
      id: 'Kemitraan Bisnis B2B Travel Agent & Hotel | Smart Journey',
      en: 'B2B Travel Agent & Hotel Partnerships | Smart Journey',
      zh: 'B2B 同业合作与旅行社地接分销 | Smart Journey'
    },
    description: {
      id: 'Program kerjasama B2B untuk travel agent, hotel concierge, dan korporat dengan komisi menarik dan jaminan alokasi armada prioritas.',
      en: 'Join Smart Journey B2B partnership program for travel agents, hotel concierges, and corporate clients with top net rates and guaranteed fleet allocation.',
      zh: '加入 Smart Journey B2B 合作伙伴计划，享受优厚同业底价返点与旺季越野吉普保供。'
    },
    keywords: {
      id: 'kemitraan travel agent bromo, b2b tour operator malang, kerjasama hotel surabaya, rental mobil korporat',
      en: 'b2b travel agent indonesia, dmc east java, tour operator partnership, bromo jeep b2b contract',
      zh: '印尼地接社合作, 旅行社同业底价, 布罗莫吉普车批发, B2B商务合作'
    },
    canonical: `${BASE_URL}/#/partnerships`,
    breadcrumbsName: {
      id: 'Kemitraan B2B',
      en: 'B2B Partnerships',
      zh: 'B2B商务合作'
    },
    schemaType: 'ContactPage',
    schemaData: defaultCompanySchema
  },
  bookings: {
    title: {
      id: 'Cek Status Pesanan & E-Voucher | Smart Journey',
      en: 'Check Booking Status & E-Voucher | Smart Journey',
      zh: '订单状态查询与电子凭证 | Smart Journey'
    },
    description: {
      id: 'Pantau status pemesanan tur dan transportasi Anda secara real-time, unduh tiket digital dan lakukan pelunasan dengan aman.',
      en: 'Track your tour and transport reservation in real-time, download official digital vouchers, and settle payments securely.',
      zh: '实时查询您的火山游与专车订单状态，下载电子行程单凭证及完成在线付款。'
    },
    keywords: {
      id: 'cek booking smart journey, download voucher tour bromo, status pesanan rental mobil',
      en: 'check booking status, smart journey voucher download, manage reservation',
      zh: '订单查询, 下载行程单, 预订管理'
    },
    canonical: `${BASE_URL}/#/bookings`,
    breadcrumbsName: {
      id: 'Pesanan Saya',
      en: 'My Bookings',
      zh: '我的订单'
    },
    schemaType: 'ItemPage',
    schemaData: defaultCompanySchema
  }
};

const SEOHead: React.FC = () => {
  const { activePage, searchParams, tours } = useApp();
  const { language } = useLanguageCurrency();

  useEffect(() => {
    let title = '';
    let description = '';
    let keywords = '';
    let canonical = '';
    let breadcrumbItemName = '';
    let ogImage = 'https://images.unsplash.com/photo-1605538032432-a9f0c8d9baac?auto=format&fit=crop&w=1200&q=80';
    let schemaList: object[] = [];

    const activeTour = searchParams?.selectedTourId 
      ? tours.find(t => t.id === searchParams.selectedTourId)
      : null;

    if (activePage === 'tours' && activeTour) {
      const locTour = getLocalizedTour(activeTour, language);
      const suffix = language === 'zh' ? ' - 慧捷之旅' : language === 'en' ? ' - Smart Journey' : ' - Smart Journey';
      title = `${locTour.name}${suffix}`;
      description = locTour.description;
      keywords = `${locTour.name}, tour ${locTour.id}, bromo ijen tour, smart journey`;
      canonical = `${BASE_URL}/#/tours?id=${activeTour.id}`;
      breadcrumbItemName = locTour.name;
      ogImage = activeTour.image;

      const tourSchema = {
        '@context': 'https://schema.org',
        '@type': 'TouristTrip',
        'name': locTour.name,
        'description': locTour.description,
        'image': activeTour.image,
        'offers': {
          '@type': 'Offer',
          'price': activeTour.startingPriceIDR,
          'priceCurrency': 'IDR',
          'availability': 'https://schema.org/InStock',
          'url': canonical
        }
      };

      const tourBreadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': language === 'zh' ? '首页' : language === 'en' ? 'Home' : 'Beranda',
            'item': `${BASE_URL}/`
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': language === 'zh' ? '旅游套餐' : language === 'en' ? 'Tour Packages' : 'Paket Tour',
            'item': `${BASE_URL}/#/tours`
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': locTour.name,
            'item': canonical
          }
        ]
      };

      schemaList = [tourSchema, tourBreadcrumbSchema];

    } else {
      const config = pageSEOData[activePage] || pageSEOData.home;
      title = config.title[language] || config.title.en || config.title.id;
      description = config.description[language] || config.description.en || config.description.id;
      keywords = config.keywords[language] || config.keywords.en || config.keywords.id;
      canonical = config.canonical;
      breadcrumbItemName = config.breadcrumbsName[language] || config.breadcrumbsName.en || config.breadcrumbsName.id;

      const mainSchema = config.schemaData;
      const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': language === 'zh' ? '首页' : language === 'en' ? 'Home' : 'Beranda',
            'item': `${BASE_URL}/`
          },
          ...(activePage !== 'home' ? [{
            '@type': 'ListItem',
            'position': 2,
            'name': breadcrumbItemName,
            'item': canonical
          }] : [])
        ]
      };

      schemaList = [mainSchema, breadcrumbSchema];
    }

    // 1. Update Document Title
    document.title = title;

    // 2. Helper to set or create meta tag
    const setMetaTag = (selector: string, attrName: string, attrValue: string, content: string) => {
      let element = document.head.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 3. Helper to set link tag
    const setLinkTag = (rel: string, href: string, hreflang?: string) => {
      const selector = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]`;
      let link = document.head.querySelector(selector) as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', rel);
        if (hreflang) link.setAttribute('hreflang', hreflang);
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
    };

    // Standard Meta Tags
    setMetaTag('meta[name="description"]', 'name', 'description', description);
    setMetaTag('meta[name="keywords"]', 'name', 'keywords', keywords);
    setMetaTag('meta[name="robots"]', 'name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    setMetaTag('meta[name="author"]', 'name', 'author', 'Smart Journey Indonesia');
    setMetaTag('meta[name="theme-color"]', 'name', 'theme-color', '#315B4F');

    // Geo Location Tags
    setMetaTag('meta[name="geo.region"]', 'name', 'geo.region', 'ID-JI');
    setMetaTag('meta[name="geo.placename"]', 'name', 'geo.placename', 'Malang');

    // Open Graph Tags
    const ogLocale = language === 'zh' ? 'zh_CN' : language === 'en' ? 'en_US' : 'id_ID';
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', title);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', activeTour ? 'article' : 'website');
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', canonical);
    setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', 'Smart Journey');
    setMetaTag('meta[property="og:locale"]', 'property', 'og:locale', ogLocale);
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', ogImage);

    // Twitter Tags
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', ogImage);

    // Canonical & Multilingual Hreflang Links
    setLinkTag('canonical', canonical);
    setLinkTag('alternate', `${BASE_URL}/`, 'id');
    setLinkTag('alternate', `${BASE_URL}/?lang=en`, 'en');
    setLinkTag('alternate', `${BASE_URL}/?lang=zh`, 'zh-Hans');
    setLinkTag('alternate', `${BASE_URL}/`, 'x-default');

    // JSON-LD Structured Data Injection
    let schemaScript = document.head.querySelector('#json-ld-seo-schema') as HTMLScriptElement;
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = 'json-ld-seo-schema';
      schemaScript.type = 'application/ld+json';
      document.head.appendChild(schemaScript);
    }
    schemaScript.textContent = JSON.stringify(schemaList);

  }, [activePage, searchParams?.selectedTourId, tours, language]);

  return null;
};

export default SEOHead;

