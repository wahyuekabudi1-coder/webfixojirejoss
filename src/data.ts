import { Tour, Vehicle, Review } from './types';

export const TOURS: Tour[] = [];

export const VEHICLES: Vehicle[] = [
  {
    id: 'avanza',
    name: 'Toyota Avanza',
    category: 'Standard',
    passengers: 5,
    luggage: 2,
    hasAC: true,
    pricePerDay: 40,
    pricePerDayIDR: 600000,
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80', // silver MPV representational
    description: 'The absolute classic Indonesian family car. Compact yet highly functional, economical, and perfectly sized for urban streets or winding mountain roads.',
    features: ['Comfortable seating', 'Dual SRS Airbags', 'Bluetooth Audio System', 'Excellent fuel efficiency'],
    } as Vehicle,
  {
    id: 'innova',
    name: 'Toyota Innova Reborn',
    category: 'Premium',
    passengers: 7,
    luggage: 4,
    hasAC: true,
    pricePerDay: 60,
    pricePerDayIDR: 900000,
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80', // Premium family ride
    description: 'Highly preferred for corporate business, long family trips, and executive airport transfers. Offers superior cabin insulation, plush seats, and high safety standards.',
    features: ['Plush Captain Seats', 'Ambience Light Control', 'Triple Zone Climate Control', 'Extra Luggage Capacity'],
  } as Vehicle,
  {
    id: 'hiace-commuter',
    name: 'Toyota Hiace Commuter',
    category: 'Family',
    passengers: 15,
    luggage: 6,
    hasAC: true,
    pricePerDay: 85,
    pricePerDayIDR: 1300000,
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80', // clean shuttle/passenger van
    description: 'Perfect for mid-sized travel groups, corporate outings, and extended family gatherings. Sturdy, comfortable, and reliable.',
    features: ['15 Ergonomic Passenger Seats', 'High Ceiling Air Venting', 'Underseat luggage space', 'Reclining mechanism'],
  } as Vehicle,
  {
    id: 'hiace-premio',
    name: 'Toyota Hiace Premio',
    category: 'Van',
    passengers: 11,
    luggage: 8,
    hasAC: true,
    pricePerDay: 110,
    pricePerDayIDR: 1700000,
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80', // luxury commercial van
    description: 'The pinnacle of luxury group transportation in Indonesia. Generous legroom, premium semi-leather individual seats, and advanced suspension for an ultra-smooth journey.',
    features: ['11 Premium Semi-Leather Seats', 'USB ports for every passenger', 'Luxury cabin acoustic damping', 'VSC & Hill Start Assist'],
  } as Vehicle
];

export const REVIEWS: Review[] = [
  {
    id: 'rev1',
    name: '陈秀兰',
    country: 'China',
    rating: 5,
    text: '在微信客服预定的，回复特别快。司机阿古斯很早就来酒店接我们了，开车的技术非常稳，半夜开山路也完全不用担心。布罗莫火山的日出真的绝美！阿古斯还帮我们拍了特别好看的吉普车合影，满分推荐！',
    date: 'March 14, 2024',
    avatar: '',
    serviceType: 'tour',
    status: 'approved'
  },
  {
    id: 'rev2',
    name: '林梓轩',
    country: 'China',
    rating: 5,
    text: '这次的宜珍火山之旅太震撼了，蓝火真的很神奇，虽然爬山有点累。司机的服务很棒，全程带着笑，车里空调很凉快，卫生也做得很好。性价比很高，没有任何隐形消费，很实在的旅行社。',
    date: 'July 28, 2024',
    avatar: '',
    serviceType: 'tour',
    status: 'approved'
  },
  {
    id: 'rev3',
    name: '张伟',
    country: 'China',
    rating: 5,
    text: '从泗水机场接机到布罗莫火山，整个行程安排得非常好。司机托米不仅开车稳当，还会讲一点中文。车子非常干净，是在这里订的Innova，坐着特别舒服，长途坐车也不会觉得累，很赞！',
    date: 'November 05, 2024',
    avatar: '',
    serviceType: 'airport',
    status: 'approved'
  },
  {
    id: 'rev4',
    name: 'Thomas Miller',
    country: 'Germany',
    rating: 5,
    text: 'Perfect service. Booked the midnight Bromo sunrise tour and was blown away. Driver Agus was punctually waiting at our Malang hotel at 11:50 PM. Clean 4x4 Jeep and a safe driver on those winding roads. Zero issues, highly recommended!',
    date: 'January 18, 2025',
    avatar: '',
    isLocalGuide: true,
    serviceType: 'tour',
    status: 'approved'
  },
  {
    id: 'rev5',
    name: '王芳',
    country: 'China',
    rating: 5,
    text: '推荐他们家的包车服务，司机的态度特别诚恳，一路上跟我们聊天，介绍了很多当地好吃的餐厅。车里每天都有准备矿泉水。遇到堵车也会耐心地跟我们解释，让人很安心。',
    date: 'April 09, 2024',
    avatar: '',
    serviceType: 'rental',
    status: 'approved'
  },
  {
    id: 'rev6',
    name: '刘洋',
    country: 'China',
    rating: 5,
    text: '我们在泗水玩了三天，全靠这家公司的包车，车型是Innova Reborn，非常平稳，老人坐着也觉得很舒服。去布罗莫的时候司机对时间把握得特别准，让我们占到了最好的观景位置！',
    date: 'September 22, 2024',
    avatar: '',
    serviceType: 'rental',
    status: 'approved'
  },
  {
    id: 'rev7',
    name: '黄丽丽',
    country: 'China',
    rating: 5,
    text: '非常满意的火山徒步。虽然深夜登山是个挑战，但是司机和向导都非常专业和细心。向导一路上搀扶着体力稍差的朋友，还贴心地准备了防毒面罩 and 头灯，真的很贴心，必须给五星好评！',
    date: 'May 16, 2025',
    avatar: '',
    isLocalGuide: true,
    serviceType: 'tour',
    status: 'approved'
  },
  {
    id: 'rev8',
    name: '赵敏',
    country: 'China',
    rating: 5,
    text: '之前看网上的攻略还担心上山会冷或者不安全，联系了这家的客服，解答得非常有耐心。吉普车司机驾驶技术一流，带我们去的拍照点人也比较少，拍出了大片的感觉。一次完美的旅行体验！',
    date: 'August 30, 2024',
    avatar: '',
    serviceType: 'tour',
    status: 'approved'
  },
  {
    id: 'rev9',
    name: 'Charlotte Evans',
    country: 'United Kingdom',
    rating: 5,
    text: 'Super reliable team! We used their airport transfer to Malang, then did the Tumpak Sewu falls trip. Best choice we made. Driver was friendly, had great local food recs, and drove really smoothly. Price was very fair compared to others.',
    date: 'February 12, 2025',
    avatar: '',
    isLocalGuide: true,
    serviceType: 'airport',
    status: 'approved'
  },
  {
    id: 'rev10',
    name: '许静',
    country: 'China',
    rating: 5,
    text: '服务真的没话说，从泗水包车去外南梦，路程虽然很长，但是司机开得很稳，车里很干净，没有任何异味。中途我们想去咖啡馆 and 便利店，司机也很热心地带我们去，极力推荐给来东爪哇的朋友们！',
    date: 'October 25, 2024',
    avatar: '',
    serviceType: 'taxi',
    status: 'approved'
  },
  {
    id: 'rev11',
    name: '周杰',
    country: 'Taiwan',
    rating: 5,
    text: '布罗莫真的很美，这次选的旅行社很靠谱，车况非常好，司机大哥人特别老实、话不多但很细心，几点出发几点到都安排得妥妥当当。行程中没有任何推销或者带去购物店的行为，非常纯粹的游玩。',
    date: 'December 04, 2024',
    avatar: '',
    serviceType: 'tour',
    status: 'approved'
  },
  {
    id: 'rev12',
    name: '李娜',
    country: 'China',
    rating: 5,
    text: '真的超级划算！我们在宜珍看蓝火，司机在山下一直等我们到早上，下山后还带我们去吃到了正宗的爪哇早餐，特别美味。车子很新，减震做得很好，开山路没有觉得很晕。',
    date: 'March 21, 2025',
    avatar: '',
    serviceType: 'tour',
    status: 'approved'
  },
  {
    id: 'rev13',
    name: 'Aditya Wijaya',
    country: 'Indonesia',
    rating: 5,
    text: 'Sewa Hiace Premio buat rombongan keluarga besar kemarin puas banget. Drivernya Mas Hendra top markotop, ramah dan tahu jalan tikus pas macet di Batu. Unitnya beneran bersih, wangi, AC dingin nyess. Recommended parah buat liburan keluarga!',
    date: 'June 17, 2024',
    avatar: '',
    serviceType: 'rental',
    status: 'approved'
  },
  {
    id: 'rev14',
    name: '郭涛',
    country: 'China',
    rating: 5,
    text: '在网上下单的，行程前一天就有微信客服 and 司机主动联系我，确认上门接送时间和地点，服务态度真的是一流。吉普车司机的车技也是绝了，在沙海里开得飞起，太刺激了！',
    date: 'September 08, 2025',
    avatar: '',
    serviceType: 'tour',
    status: 'approved'
  },
  {
    id: 'rev15',
    name: '梁超',
    country: 'China',
    rating: 5,
    text: '带父母出来玩的，最看重的是安全 and 舒适度。这家的Innova车况好，空间宽敞，司机师傅很沉稳，一路上提醒我们山路颠簸，还细心准备了防寒毛毯。爸妈都对这位司机赞不绝口。',
    date: 'November 29, 2024',
    avatar: '',
    serviceType: 'rental',
    status: 'approved'
  },
  {
    id: 'rev16',
    name: '曾子墨',
    country: 'Hong Kong',
    rating: 5,
    text: '去天崩瀑布（Tumpak Sewu）的行程很完美，向导阿迪带我们走悬崖泥路时非常有安全感，路过水流急的地方都一个一个拉我们过去。服务非常走心，下次来印尼还会找他们家订行程。',
    date: 'January 07, 2025',
    avatar: '',
    serviceType: 'tour',
    status: 'approved'
  },
  {
    id: 'rev17',
    name: 'Hans Baker',
    country: 'Netherlands',
    rating: 5,
    text: 'Highly recommend! Booked an airport transfer from Surabaya and ended up taking a tour with them to Mount Bromo. The communication on WhatsApp was superb. The vehicles are extremely clean and high quality. Great English from the driver too.',
    date: 'May 03, 2024',
    avatar: '',
    serviceType: 'airport',
    status: 'approved'
  },
  {
    id: 'rev18',
    name: '郑宇',
    country: 'China',
    rating: 5,
    text: '性价比真的高，比我们在酒店前台问的价格要划算很多，而且车况要好得多。司机的服务很有礼貌，每次开门都会帮忙提行李。一路上也没有多余的话打扰我们休息，很专业的租车服务。',
    date: 'August 19, 2025',
    avatar: '',
    serviceType: 'rental',
    status: 'approved'
  },
  {
    id: 'rev19',
    name: '孙艳',
    country: 'China',
    rating: 5,
    text: '客服真的特别赞，半夜两点因为接送时间临时有变联系他们，都秒回 and 帮我们调整了司机的安排。司机第二天早上依然按时到达，车子开得非常平稳，真的是超级省心的服务！',
    date: 'October 11, 2024',
    avatar: '',
    serviceType: 'taxi',
    status: 'approved'
  },
  {
    id: 'rev20',
    name: '高鹏',
    country: 'China',
    rating: 5,
    text: '第一次到印尼自由行，幸好订了这家的包车。泗水到外南梦一路上路况很复杂，多亏了司机高超的驾驶技术，省心省力。而且全程没有任何套路 and 隐藏费用，价格透明。必须给一个大大的赞！',
    date: 'December 15, 2025',
    avatar: '',
    serviceType: 'taxi',
    status: 'approved'
  },
  {
    id: 'rev21',
    name: 'David Peterson',
    country: 'United States',
    rating: 5,
    text: 'Awesome experience. Outstanding value, super comfortable Toyota Innova, and excellent timing. Sunrise on Penanjakan was spectacular. Our driver Agus took amazing photos of us. If you want a trouble-free vacation in East Java, book with these guys.',
    date: 'February 24, 2026',
    avatar: '',
    serviceType: 'tour',
    status: 'approved'
  },
  {
    id: 'rev22',
    name: '谢雨婷',
    country: 'China',
    rating: 5,
    text: '宜珍徒步真的很震撼，不虚此行。司机和本地向导人都巨好，向导一路上很幽默，帮我们拿背包，还告诉我们下山走哪里最稳。防毒面具很干净，没有什么异味，推荐预定！',
    date: 'April 14, 2025',
    avatar: '',
    serviceType: 'tour',
    status: 'approved'
  },
  {
    id: 'rev23',
    name: '蔡明',
    country: 'China',
    rating: 5,
    text: '我们是6个人租了一辆Hiace，空间大，行李也完全放得下，空调很足。司机大叔特别开朗，给我们一路上讲了很多爪哇的历史文化，还帮我们买到了便宜的当地水果，非常愉快的体验。',
    date: 'July 19, 2024',
    avatar: '',
    serviceType: 'rental',
    status: 'approved'
  },
  {
    id: 'rev24',
    name: 'Chloe Taylor',
    country: 'Australia',
    rating: 5,
    text: 'The tour was incredible. Ijen blue fire hike was physically demanding but completely worth it with our caring guide. SmartJourney made the whole booking experience simple on WhatsApp. Zero stress. The driver was so gentle on the road.',
    date: 'January 28, 2026',
    avatar: '',
    serviceType: 'tour',
    status: 'approved'
  }
];

export const FAQS = [
  {
    question: 'Are your prices all-inclusive or are there hidden fees?',
    answer: 'All our prices are 100% transparent. Tour bookings include vehicle, professional driver, fuel, toll fees, parking, entry tickets as specified, and safety gear. Car rentals can be selected with or without driver/fuel so you choose exactly what you need.'
  },
  {
    question: 'Do your drivers speak English?',
    answer: 'Yes! SmartJourney prides itself on utilizing tourist-certified, English-speaking professional drivers who understand international standards of customer care, local road safety, and hospitality.'
  },
  {
    question: 'How do I pay and confirm my reservation?',
    answer: 'You can submit your booking request online through our widgets. You will receive an instant digital invoice and a verification message via Email and WhatsApp. Payment can be secured via Credit Card, PayPal, or local bank transfer (QRIS, Bank Mandiri/BCA).'
  },
  {
    question: 'What is your cancellation and rescheduling policy?',
    answer: 'We provide 100% free cancellations and flexible date rescheduling up to 24 hours prior to your scheduled pickup time. No questions asked.'
  },
  {
    question: 'How far in advance should I book my tour or transfer?',
    answer: 'We highly recommend booking at least 48 hours in advance, especially for popular tours like Mount Bromo and Ijen Crater, which require securing Jeep allocations and local national park conservation tickets.'
  }
];

export const AIRPORTS = [
  { code: 'SUB', name: 'Juanda International Airport (Surabaya)' },
  { code: 'DPS', name: 'Ngurah Rai International Airport (Bali)' },
  { code: 'YIA', name: 'Yogyakarta International Airport (Yogyakarta)' },
  { code: 'CGK', name: 'Soekarno-Hatta International Airport (Jakarta)' }
];

export const CITIES = [
  'Surabaya',
  'Malang',
  'Batu',
  'Banyuwangi',
  'Probolinggo (Bromo)',
  'Yogyakarta',
  'Denpasar (Bali)',
  'Jakarta'
];
