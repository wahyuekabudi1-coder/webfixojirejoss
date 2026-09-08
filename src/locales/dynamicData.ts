import { Language } from './index';

export interface LocalizedTourData {
  name: Record<Language, string>;
  description: Record<Language, string>;
  duration: Record<Language, string>;
  category: Record<Language, string>;
  highlights: Record<Language, string[]>;
  itinerary: Record<Language, string[]>;
}

export const DYNAMIC_TOURS: Record<string, LocalizedTourData> = {
  bromo: {
    name: {
      id: 'Paket Wisata Midnight Sunrise Gunung Bromo',
      en: 'Mount Bromo Midnight Sunrise Tour',
      zh: '布罗莫火山午夜日出探索游'
    },
    description: {
      id: 'Saksikan panorama matahari terbit spektakuler di atas kaldera Gunung Bromo, jelajahi kawah aktif, dan nikmati sensasi Jeep 4x4 melintasi lautan pasir.',
      en: 'Witness the iconic otherworldly sunrise over Mount Bromo, scale the volcanic crater, and explore the vast sea of sand in an open-top 4x4 Jeep.',
      zh: '亲临感受布罗莫火山壮丽的异星日出，登临活火山口边缘，乘坐 4x4 越野吉普车纵横广袤黑沙海。'
    },
    duration: {
      id: '1 Hari (12-14 Jam)',
      en: '1 Day (12-14 Hours)',
      zh: '1天 (12-14小时)'
    },
    category: {
      id: 'Petualangan',
      en: 'Adventure',
      zh: '火山探险'
    },
    highlights: {
      id: [
        'Titik Pandang Sunrise Penanjakan Peak',
        'Petualangan Jeep 4x4 di Lautan Pasir Berbisik',
        'Mendaki ke bibir Kawah Aktif Bromo',
        'Kuil Suci Hindu Poten Tengger',
        'Driver & Guide Lokal Ramah Berbahasa Inggris'
      ],
      en: [
        'Penanjakan Golden Sunrise Viewpoint',
        '4x4 Jeep driving through Sea of Sand',
        'Scale Bromo volcanic crater rim',
        'Luhur Poten Hindu Temple',
        'Professional English-speaking local guide'
      ],
      zh: [
        'Penanjakan 观景台绝美日出',
        '4x4 越野吉普车穿行奇幻黑沙海',
        '攀登布罗莫活火山口边缘',
        '探访古老神圣的 Poten 印度教神庙',
        '专业双语地接导游全程贴心服务'
      ]
    },
    itinerary: {
      id: [
        '00:00 - Penjemputan di Surabaya atau Malang (Hotel / Stasiun / Bandara)',
        '02:30 - Tiba di titik transit Tosari/Cemoro Lawang, berganti ke Jeep 4x4',
        '03:30 - Tiba di puncak Penanjakan, nikmati kopi/teh hangat & sambut sunrise',
        '06:00 - Turun ke Lautan Pasir Bromo, berjalan kaki / naik kuda ke kawah',
        '08:00 - Kembali ke Jeep, transfer kembali ke pos transit untuk sarapan pagi',
        '10:30 - Perjalanan kembali menuju kota tujuan',
        '13:00 - Tiba kembali di Surabaya atau Malang'
      ],
      en: [
        '00:00 AM - Pickup from Surabaya or Malang (Hotel/Airport/Station)',
        '02:30 AM - Arrive at Tosari/Cemoro Lawang transit point, transfer to 4x4 Jeep',
        '03:30 AM - Arrive at Mount Penanjakan peak; hot coffee/tea and view sunrise',
        '06:00 AM - Descent to Bromo Sea of Sand, short walk or horse ride to crater',
        '08:00 AM - Return to Jeep, transfer back to transit point for breakfast',
        '10:30 AM - Depart back to your drop-off city',
        '01:00 PM - Arrive back in Surabaya or Malang'
      ],
      zh: [
        '00:00 - 泗水或玛琅市区酒店/机场/火车站专车接送',
        '02:30 - 抵达 Cemoro Lawang 中转站，换乘专属 4x4 越野吉普车',
        '03:30 - 抵达 Penanjakan 峰顶，品尝热咖啡/茶，静候壮丽日出',
        '06:00 - 下至布罗莫黑沙海，步行或骑马登上火山口观赏翻滚岩浆',
        '08:00 - 返回吉普车，返回中转基地享用热腾腾的印尼早餐',
        '10:30 - 专车启程返回泗水或玛琅',
        '13:00 - 顺利送达泗水或玛琅市区酒店或机场'
      ]
    }
  },

  ijen: {
    name: {
      id: 'Ekspedisi Api Biru Kawah Ijen',
      en: 'Ijen Crater Blue Fire Expedition',
      zh: '宜珍火山神秘蓝火探险之旅'
    },
    description: {
      id: 'Lakukan pendakian tengah malam ke kawah aktif Gunung Ijen untuk menyaksikan fenomena alam langka Api Biru elektrik dan danau kawah asam terbesar di dunia.',
      en: 'Embark on a midnight trek into the active volcanic crater of Mount Ijen to witness the rare natural phenomenon of the Electric Blue Fire.',
      zh: '午夜徒步攀登宜珍活火山，亲眼目睹世界罕见的电光蓝火自然奇观以及全球最大的绿松石色酸性火山口湖。'
    },
    duration: {
      id: '1 Hari (14-16 Jam)',
      en: '1 Day (14-16 Hours)',
      zh: '1天 (14-16小时)'
    },
    category: {
      id: 'Wisata Alam',
      en: 'Nature',
      zh: '自然生态'
    },
    highlights: {
      id: [
        'Fenomena langka Api Biru (Electric Blue Fire)',
        'Danau kawah asam toska terbesar di dunia',
        'Pemandangan matahari terbit memukau dari bibir kawah',
        'Menyaksikan aktivitas penambang belerang tradisional',
        'Masker gas bersertifikat & senter kepala sudah termasuk'
      ],
      en: [
        'Rare Electric Blue Fire phenomenon',
        'World’s largest highly acidic crater lake',
        'Stunning sunrise view from the ridge',
        'Meet the traditional sulfur miners',
        'Gas mask and safety gear included'
      ],
      zh: [
        '目睹举世闻名的幽蓝电光蓝火奇观',
        '打卡世界最大绿松石酸性火山湖',
        '山脊线上欣赏绝美晨曦与云海',
        '走近坚韧不拔的传统硫磺采矿工人',
        '包含专业防毒面具与高亮夜行头灯'
      ]
    },
    itinerary: {
      id: [
        '00:00 - Penjemputan di Banyuwangi atau Bondowoso',
        '01:30 - Tiba di pos Paltuding; briefing keselamatan & pembagian masker gas',
        '02:00 - Memulai pendakian Gunung Ijen (sekitar 3 km, 1.5 - 2 jam)',
        '03:45 - Turun ke kawah untuk melihat fenomena Api Biru dari dekat',
        '05:15 - Naik ke bibir kawah menikmati sunrise di atas danau toska',
        '07:00 - Turun kembali ke Paltuding, sarapan pagi lokal',
        '10:00 - Pengantaran kembali ke hotel atau pelabuhan feri Ketapang'
      ],
      en: [
        '00:00 AM - Pickup from Banyuwangi or Bondowoso',
        '01:30 AM - Arrive at Paltuding base camp; safety brief & gear distribution',
        '02:00 AM - Begin trekking up Mount Ijen (approx. 3 km, 1.5 - 2 hours)',
        '03:45 AM - Descend into the crater to witness the mystical Blue Fire close-up',
        '05:15 AM - Ascend to the crater rim to enjoy the sunrise over the turquoise lake',
        '07:00 AM - Walk down to Paltuding camp, transfer for local breakfast',
        '10:00 AM - Return transfer to your hotel or port'
      ],
      zh: [
        '00:00 - 外南梦或邦多沃索酒店专车接送',
        '01:30 - 抵达 Paltuding 登山大本营，安全宣导并分发防毒面具与头灯',
        '02:00 - 开始徒步攀登宜珍火山（约3公里，耗时1.5-2小时）',
        '03:45 - 沿小径下至火山口，近距离震撼观赏神秘跃动的电光蓝火',
        '05:15 - 攀登至山脊观景台，俯瞰碧绿宝石般的酸性火山湖与日出',
        '07:00 - 步行下山回到大本营，享用能量早餐',
        '10:00 - 专车送回外南梦酒店或吉打邦码头'
      ]
    }
  },

  'tumpak-sewu': {
    name: {
      id: 'Petualangan Air Terjun Tumpak Sewu',
      en: 'Tumpak Sewu Thousand Waterfalls Adventure',
      zh: '赛武千重瀑布秘境探险'
    },
    description: {
      id: 'Jelajahi air terjun melingkar paling spektakuler di Indonesia yang dikelilingi hutan tropis lebat di kaki Gunung Semeru yang megah.',
      en: 'Explore Indonesia’s most spectacular semi-circular canyon waterfall, surrounded by lush tropical rainforests at the base of Mount Semeru.',
      zh: '探寻印尼最震撼的环形峡谷千重瀑布，在赛梅鲁活火山脚下穿越葱郁的热带雨林秘境。'
    },
    duration: {
      id: '1 Hari (10-12 Jam)',
      en: '1 Day (10-12 Hours)',
      zh: '1天 (10-12小时)'
    },
    category: {
      id: 'Petualangan',
      en: 'Adventure',
      zh: '瀑布秘境'
    },
    highlights: {
      id: [
        'Panorama megah dari tebing pandang Tumpak Sewu',
        'Trekking dasar lembah melintasi sungai jernih',
        'Mengunjungi kompleks air terjun & goa Goa Tetes',
        'Pemandangan latar Gunung Semeru yang memukau',
        'Didampingi ranger lokal berpengalaman'
      ],
      en: [
        'Panoramic view from Tumpak Sewu cliff edge',
        'Canyon floor hike through pristine rivers',
        'Visit Goa Tetes cave & waterfall complex',
        'Breathtaking views of Mount Semeru active volcano',
        'All safety equipment and local ranger'
      ],
      zh: [
        '从悬崖全景平台俯瞰磅礴瀑布群',
        '下至峡谷底部溯溪徒步穿越原始雨林',
        '探访梦幻的滴水洞穴 Goa Tetes 瀑布群',
        '远眺赛梅鲁活火山巍峨雄姿',
        '配备专业向导与全程安全护航'
      ]
    },
    itinerary: {
      id: [
        '06:30 - Penjemputan di Malang (atau 05:00 dari Surabaya)',
        '09:00 - Tiba di Tumpak Sewu, nikmati panorama dari atas tebing',
        '09:30 - Memulai turunan aman menyusuri jalur tebing ke dasar lembah',
        '10:15 - Rasakan gemuruh embun di kaki Air Terjun Seribu',
        '11:30 - Trekking ke Goa Tetes kompleks air terjun bertingkat',
        '13:00 - Kembali ke atas untuk makan siang dan mandi bilas',
        '15:00 - Perjalanan pulang kembali ke Malang atau Surabaya'
      ],
      en: [
        '06:30 AM - Pickup from Malang (or 05:00 AM from Surabaya)',
        '09:00 AM - Arrive at Tumpak Sewu Entrance, view from the cliff point',
        '09:30 AM - Guided descent down the cliff path to the canyon floor',
        '10:15 AM - Stand in awe at the base of the Thousand Waterfalls',
        '11:30 AM - Trek upstream to Goa Tetes cave waterfall system',
        '01:00 PM - Climb back to top for local lunch and refreshing shower',
        '03:00 PM - Transfer back to Malang or Surabaya'
      ],
      zh: [
        '06:30 - 玛琅酒店专车接送（泗水出发为 05:00）',
        '09:00 - 抵达赛武瀑布景区，在悬崖观景台拍摄震撼全景',
        '09:30 - 在专业向导带领下沿悬崖阶梯下至峡谷底部',
        '10:15 - 站在千重飞瀑下感受水雾弥漫的自然力量',
        '11:30 - 沿清澈溪流探秘水帘洞穴 Goa Tetes',
        '13:00 - 攀登回到上方享用印尼特色午餐与洗漱更衣',
        '15:00 - 专车平稳返回玛琅或泗水'
      ]
    }
  },

  'malang-city': {
    name: {
      id: 'Wisata Budaya & Heritage Malang - Kota Batu',
      en: 'Malang & Batu Premium Heritage Tour',
      zh: '玛琅古城与巴图高原避暑风情游'
    },
    description: {
      id: 'Jelajahi keanggunan arsitektur kolonial Belanda di Malang, kunjungi kampung warna-warni Jodipan, dan nikmati udara sejuk pegunungan kota apel Batu.',
      en: 'Discover the charming Dutch colonial architecture of Malang, visit traditional colorful villages, and experience the cool mountain air of Batu.',
      zh: '领略玛琅充满荷兰殖民风情的历史街区，打卡彩虹村 Jodipan，并在巴图高原享受采摘新鲜苹果与清凉山谷的惬意时光。'
    },
    duration: {
      id: '1 Hari (8-10 Jam)',
      en: '1 Day (8-10 Hours)',
      zh: '1天 (8-10小时)'
    },
    category: {
      id: 'Eksplorasi Kota',
      en: 'City',
      zh: '城市文化'
    },
    highlights: {
      id: [
        'Kampung Warna-Warni Jodipan yang ikonik',
        'Kawasan Heritage Kolonial Jalan Ijen & Balai Kota',
        'Petik apel segar langsung di kebun agro Batu',
        'Kuliner otentik Jawa Timur legendaris',
        'Mobil privat ber-AC sepanjang hari'
      ],
      en: [
        'Jodipan Colorful Village (Kampung Warna-Warni)',
        'Historic Dutch Colonial Heritage Area',
        'Apple picking in the orchards of Batu',
        'Premium Indonesian culinary tastings',
        'Private air-conditioned vehicle all day'
      ],
      zh: [
        '打卡网红彩虹村 Jodipan（七彩村）',
        '慢步 Ijen 大道历史荷兰殖民建筑群',
        '在巴图有机果园亲手采摘新鲜苹果',
        '品尝地道特色的东爪哇传奇美食',
        '全天专属空调商务私家车服务'
      ]
    },
    itinerary: {
      id: [
        '08:30 - Penjemputan di hotel area Malang',
        '09:00 - Jalan santai dan berfoto di Kampung Warna-Warni Jodipan',
        '10:30 - Melewati Ijen Boulevard, Katedral Malang, dan Balai Kota',
        '12:00 - Makan siang kuliner khas di restoran kolonial bersejarah',
        '13:30 - Menuju kota peristirahatan sejuk Batu',
        '14:00 - Petik apel segar di kebun apel lokal',
        '16:00 - Mengunjungi Air Terjun Coban Rondo & labirin hijau',
        '18:00 - Pengantaran kembali ke hotel di Malang'
      ],
      en: [
        '08:30 AM - Pickup from your Malang hotel',
        '09:00 AM - Guided walk through Jodipan Colorful Village',
        '10:30 AM - Scenic drive through Ijen Boulevard, Malang Cathedral, and Town Hall',
        '12:00 PM - Authentic Javanese lunch at a historic colonial eatery',
        '01:30 PM - Drive to the mountain resort town of Batu',
        '02:00 PM - Fresh apple picking at a local orchard',
        '04:00 PM - Visit Coban Rondo waterfall and lush green labyrinth',
        '06:00 PM - Drop-off back to your Malang hotel'
      ],
      zh: [
        '08:30 - 玛琅市区酒店专车接送',
        '09:00 - 游览七彩斑斓的 Jodipan 彩虹村拍照留念',
        '10:30 - 车游百年 Ijen 林荫大道、玛琅大教堂与市政厅',
        '12:00 - 在历史悠久的经典餐厅享用特色午餐',
        '13:30 - 乘车前往气候凉爽的高原度假胜地巴图',
        '14:00 - 体验趣味盎然的果园摘苹果体验',
        '16:00 - 游览 Coban Rondo 森林瀑布与绿色迷宫',
        '18:00 - 专车送回玛琅酒店'
      ]
    }
  },

  'volcano-combo-3d': {
    name: {
      id: '4 Hari 3 Malam Safari Spektakuler Gunung Berapi Jawa Timur',
      en: '4-Day Ultimate East Java Volcanoes Combo',
      zh: '4天3晚 东爪哇火山全景终极探险'
    },
    description: {
      id: 'Paket safari terlengkap. Kunjungi Tumpak Sewu, saksikan matahari terbit magis Gunung Bromo, dan daki Kawah Ijen untuk melihat Api Biru langka.',
      en: 'The definitive volcanic safari. Visit Malang, hike Tumpak Sewu, witness the otherworldly sunrise over Mount Bromo, and trek Mount Ijen to see the rare Electric Blue Fire.',
      zh: '东爪哇经典火山合集。一次网罗赛武瀑布、布罗莫火山日出沙海吉普车巡游以及宜珍火山电光蓝火与绿松石湖。'
    },
    duration: {
      id: '4 Hari (4H3M)',
      en: '4 Days (4D3N)',
      zh: '4天3晚 (4D3N)'
    },
    category: {
      id: 'Wisata Alam',
      en: 'Nature',
      zh: '火山大环线'
    },
    highlights: {
      id: [
        'Trekking Air Terjun Tetes & Tumpak Sewu',
        'Safari Jeep 4x4 sunrise kaldera Gunung Bromo',
        'Fenomena Api Biru & danau toska Kawah Ijen',
        '3 Malam penginapan hotel pilihan terbaik',
        'Transportasi privat all-in selama 4 hari penuh'
      ],
      en: [
        'Trek Air Terjun Tetes & Tumpak Sewu Thousand Waterfalls',
        'Mount Bromo golden sunrise 4x4 Jeep safari',
        'Rare Electric Blue Fire & Acidic Turquoise Lake in Ijen',
        '3 Nights handpicked hotel accommodations',
        'Fully private air-conditioned vehicle for 4 days'
      ],
      zh: [
        '徒步探秘赛武千重瀑布与水帘洞',
        '布罗莫火山金色日出与4x4越野吉普车探险',
        '宜珍火山神秘电光蓝火与绿松石酸性湖',
        '3晚精选特色舒适酒店住宿',
        '全程专属私家车与贴心中文/英文司导服务'
      ]
    },
    itinerary: {
      id: [
        'Hari 1 - Penjemputan di Surabaya/Malang, perjalanan ke area Tumpak Sewu, check-in hotel.',
        'Hari 2 - Eksplorasi Air Terjun Tumpak Sewu & Goa Tetes. Lanjut ke Bromo, check-in resort.',
        'Hari 3 - 03:00 Safari Jeep Bromo sunrise & kawah. Sarapan, lalu menuju Banyuwangi/Ijen.',
        'Hari 4 - 00:30 Midnight trek Kawah Ijen Blue Fire. Sunrise, sarapan, drop-off ke Bali / Surabaya.'
      ],
      en: [
        'Day 1 - Pickup in Surabaya/Malang, scenic drive towards Tumpak Sewu, hotel check-in.',
        'Day 2 - Morning trek at Tumpak Sewu & Goa Tetes. Scenic drive to Mount Bromo resort.',
        'Day 3 - 03:00 AM Bromo 4x4 Jeep sunrise & crater rim walk. Drive to Banyuwangi/Ijen hotel.',
        'Day 4 - 00:30 AM Midnight hike to Ijen Crater Blue Fire. Sunrise, breakfast, drop-off to Bali or Surabaya.'
      ],
      zh: [
        '第1天 - 泗水/玛琅机场接机，乘车前往赛武瀑布景区，入住特色酒店',
        '第2天 - 清晨徒步赛武千重瀑布与水帘洞，午后驱车前往布罗莫火山度假村入住',
        '第3天 - 03:00 乘越野吉普观布罗莫日出，漫步沙海与火山口。午后驱车前往外南梦宜珍酒店',
        '第4天 - 00:30 午夜向导带领登顶宜珍看蓝火与日出，下山享用早餐，送往巴厘岛渡轮码头或返回泗水'
      ]
    }
  }
};

export const DYNAMIC_VEHICLES: Record<string, {
  name: string;
  category: Record<Language, string>;
  description: Record<Language, string>;
  features: Record<Language, string[]>;
}> = {
  avanza: {
    name: 'Toyota Avanza',
    category: {
      id: 'Standar / MPV',
      en: 'Standard MPV',
      zh: '经济型 MPV'
    },
    description: {
      id: 'Mobil keluarga terlaris di Indonesia. Kompak, lincah, irit bensin, dan pas untuk rute perkotaan maupun jalan berliku.',
      en: 'The classic Indonesian family car. Compact, agile, economical, and ideal for urban transit or winding mountain roads.',
      zh: '印尼最畅销的紧凑型家庭MPV，机动灵活，省油舒适，极适合市区游览与山间公路穿行。'
    },
    features: {
      id: ['Kapasitas 5 Penumpang', 'AC Dingin Dobel Blower', 'Audio Bluetooth', 'Bagasi Nyaman'],
      en: ['5 Passenger Capacity', 'Dual Zone Air Conditioning', 'Bluetooth Audio System', 'Luggage Space'],
      zh: ['可容纳5位乘客', '前后双温区强劲空调', '蓝牙多媒体车载音响', '充足后备箱空间']
    }
  },
  innova: {
    name: 'Toyota Innova Reborn / Zenix',
    category: {
      id: 'Premium / Eksekutif',
      en: 'Executive Premium',
      zh: '豪华商务 MPV'
    },
    description: {
      id: 'Pilihan utama perjalanan wisata keluarga dan eksekutif bisnis. Suspensi empuk, kabin senyap, dan kenyamanan superior.',
      en: 'The preferred choice for VIP business and long family tours. Features plush seating, superior acoustic insulation, and high comfort.',
      zh: 'VIP高端商务与家庭长途旅行首选车型。减震降噪隔音优异，航空级舒适大座，平稳舒适。'
    },
    features: {
      id: ['Kapasitas 7 Penumpang', 'Kursi Captain Seat Empuk', 'Kabin Senyap VIP', 'Ruang Bagasi Lega'],
      en: ['7 Passenger Capacity', 'Plush Captain Seats', 'Whisper-Quiet VIP Cabin', 'Extra Luggage Capacity'],
      zh: ['可容纳7位乘客', '舒适独立队长大座', '超静音VIP座舱', '大容量行李空间']
    }
  },
  'hiace-commuter': {
    name: 'Toyota Hiace Commuter',
    category: {
      id: 'Van Rombongan / Grup',
      en: 'Spacious Group Van',
      zh: '15座宽敞团队客车'
    },
    description: {
      id: 'Sangat ideal untuk rombongan keluarga besar, outing kantor, atau tur grup hingga 15 orang dengan kabin tinggi dan lapang.',
      en: 'Perfect for mid-sized travel groups, corporate outings, and extended family gatherings up to 15 passengers.',
      zh: '非常适合中型旅行团、公司团建及大家庭多代出行，拥有15座超大空间与高顶通透乘坐体验。'
    },
    features: {
      id: ['Kapasitas 15 Penumpang', 'Plafon Tinggi & AC Tiap Baris', 'Kursi Reclining', 'Suspensi Kokoh'],
      en: ['15 Ergonomic Passenger Seats', 'High Ceiling Air Venting', 'Reclining mechanism', 'Sturdy suspension'],
      zh: ['15个符合人体工学座椅', '高车顶每排独立独立出风口', '可调节靠背角度', '稳健长途行车底盘']
    }
  },
  'hiace-premio': {
    name: 'Toyota Hiace Premio Luxury',
    category: {
      id: 'VIP Luxury Van',
      en: 'VIP Luxury Van',
      zh: 'VIP头等舱豪华大包车'
    },
    description: {
      id: 'Puncak kemewahan transportasi rombongan di Indonesia. Kursi semi-kulit individual, port USB tiap baris, dan kenyamanan setara kelas bisnis.',
      en: 'The pinnacle of luxury group transportation in Indonesia. Generous legroom, individual semi-leather seats, and supreme comfort.',
      zh: '印尼高端团队尊贵出行典范。超宽敞腿部空间、半真皮独立大座、每座USB充电，尊享头等舱级体验。'
    },
    features: {
      id: ['11 Kursi Semi-Kulit Mewah', 'Port Charger USB Tiap Kursi', 'Peredam Suara Mewah', 'Fitur Keselamatan Modern'],
      en: ['11 Premium Semi-Leather Seats', 'USB ports for every passenger', 'Luxury cabin acoustic damping', 'Advanced safety systems'],
      zh: ['11张尊贵半真皮独立座椅', '每个座位专属USB充电接口', '全车豪华隔音降噪处理', '最新主动行车安全辅助']
    }
  }
};

export const DYNAMIC_FAQS: Array<{
  question: Record<Language, string>;
  answer: Record<Language, string>;
}> = [
  {
    question: {
      id: 'Apakah harga yang tertera sudah all-inclusive tanpa biaya tersembunyi?',
      en: 'Are the prices listed all-inclusive or are there hidden fees?',
      zh: '网站上的报价是一口价全包吗？会有隐形消费吗？'
    },
    answer: {
      id: 'Semua harga kami 100% transparan. Paket wisata sudah mencakup mobil ber-AC, driver, BBM, tol, parkir, tiket masuk objek wisata, dan Jeep 4x4 (untuk Bromo). Tidak ada biaya tersembunyi.',
      en: 'All our prices are 100% transparent. Tour bookings include private air-conditioned vehicle, professional driver, fuel, highway tolls, parking, specified entry tickets, and 4x4 Jeep (for Bromo). Zero hidden surcharges.',
      zh: '我们的报价 100% 透明无套路。旅游套餐包含全程专属私家空调车、专业司机、全程燃油费、高速费、停车费、景区首道门票及布罗莫 4x4 吉普车。绝无任何强制隐形消费。'
    }
  },
  {
    question: {
      id: 'Apakah pengemudi (driver) bisa berbahasa Inggris atau Mandarin?',
      en: 'Do your drivers speak English or Chinese?',
      zh: '你们的司机会讲英语或中文吗？'
    },
    answer: {
      id: 'Ya! Seluruh driver kami ramah, profesional, bersertifikat pariwisata, dan fasih berbahasa Inggris. Untuk tamu yang membutuhkan pemandu berbahasa Mandarin, kami juga menyediakan guide berlisensi khusus.',
      en: 'Yes! All our chauffeurs are tourist-certified, friendly, and speak fluent English. For guests requesting Mandarin Chinese translation, we can also provide certified Chinese-speaking tour guides upon request.',
      zh: '是的！我们的司机均经过严格涉外旅游培训，性格友善，能用流利英语交流；我们同时配备有经验丰富的高级中文持证导游，并支持全程微信中文客服 24 小时在线协助。'
    }
  },
  {
    question: {
      id: 'Bagaimana cara melakukan pembayaran dan konfirmasi pemesanan?',
      en: 'How do I pay and confirm my reservation?',
      zh: '如何完成支付与确认预订？'
    },
    answer: {
      id: 'Anda dapat memesan langsung melalui website atau WhatsApp. Kami menerima Kartu Kredit (Visa/Mastercard), QRIS (GoPay/OVO/Dana/BCA), Transfer Bank, PayPal, dan pelunasan tunai ke driver saat penjemputan.',
      en: 'You can submit your reservation online or directly via WhatsApp. We accept Credit/Debit Cards, QRIS instant QR payments, Bank Transfers, PayPal, or cash payment to your driver upon arrival.',
      zh: '您可以在网站直接提交订单或联系微信/WhatsApp客服。支持国际信用卡（Visa/Mastercard）、印尼扫码支付 QRIS、银行转账、PayPal 以及到达后现金付款给司机。'
    }
  },
  {
    question: {
      id: 'Bagaimana kebijakan pembatalan dan perubahan tanggal (reschedule)?',
      en: 'What is your cancellation and rescheduling policy?',
      zh: '退订取消与更改出行日期（改签）的政策是什么？'
    },
    answer: {
      id: 'Kami memberikan fasilitas pembatalan gratis dan fleksibilitas ubah tanggal hingga 24 jam sebelum jadwal penjemputan tanpa dipersulit.',
      en: 'We offer 100% free cancellation and flexible date rescheduling up to 24 hours prior to your scheduled pickup time with zero hassle.',
      zh: '我们支持极度灵活的退改政策：出行前 24 小时以上通知客服，可享受 100% 免费取消或免费修改出行日期。'
    }
  },
  {
    question: {
      id: 'Berapa hari sebelumnya saya harus memesan paket wisata atau transfer?',
      en: 'How far in advance should I book my tour or transfer?',
      zh: '我需要提前多久预订旅游套餐或接送机？'
    },
    answer: {
      id: 'Kami menyarankan pemesanan minimal 48 jam sebelumnya, terutama untuk Bromo dan Ijen agar kuota tiket konservasi taman nasional dan alokasi Jeep 4x4 dapat terjamin.',
      en: 'We strongly recommend booking at least 48 hours in advance, especially for Mount Bromo and Ijen Crater to guarantee national park conservation permits and 4x4 Jeep allocations.',
      zh: '建议您至少提前 48 小时预订，尤其是布罗莫火山与宜珍火山行程，以便我们提前为您锁定国家公园实名制门票及专属 4x4 越野吉普车。'
    }
  }
];

export const DYNAMIC_HERO_SLIDES = [
  {
    image: '/bromo.png',
    candidates: ['/bromo.png', '/bromo.jpg', '/bromo.jpeg', '/bromo.webp'],
    fallback: 'https://images.unsplash.com/photo-1588668214407-6eb97207c83a?auto=format&fit=crop&w=1920&q=80',
    title: {
      id: 'Safari Sunrise Emas Gunung Bromo',
      en: 'Mount Bromo Golden Sunrise Safari',
      zh: '布罗莫火山金色日出越野巡游'
    },
    subtitle: {
      id: 'Saksikan panorama magis matahari terbit di atas Gunung Bromo, kawah vulkanik aktif, dan lautan pasir dengan Jeep 4x4 privat.',
      en: 'Witness the iconic golden sunrise over Mount Bromo, active volcanic crater, and sea of sand in a private 4x4 Jeep.',
      zh: '乘坐专属 4x4 越野吉普车，亲历布罗莫火山日出、奔腾活火山口与广袤黑沙海的旷世奇景。'
    },
    tag: {
      id: 'Destinasi Favorit Jawa Timur',
      en: 'East Java Top Destination',
      zh: '东爪哇必游目的地'
    }
  },
  {
    image: '/tumpak-sewu.png',
    candidates: ['/tumpak-sewu.png', '/tumpak-sewu.jpg', '/tumpak-sewu.jpeg', '/tumpak-sewu.webp'],
    fallback: 'https://images.unsplash.com/photo-1621360841013-c7683c659ec6?auto=format&fit=crop&w=1920&q=80',
    title: {
      id: 'Ekspedisi Air Terjun Tumpak Sewu',
      en: 'Tumpak Sewu Waterfall Expedition',
      zh: '赛武千重瀑布大峡谷探险'
    },
    subtitle: {
      id: 'Jelajahi ngarai tropis alami di bawah kemegahan seribu air terjun dengan latar belakang Gunung Semeru.',
      en: 'Trek through pristine tropical canyons beneath the breathtaking thousand waterfalls of Mount Semeru.',
      zh: '在巍峨的赛梅鲁活火山脚下，徒步穿行原始热带雨林峡谷，领略千重飞瀑的磅礴震撼。'
    },
    tag: {
      id: 'Petualangan Alam Terbaik',
      en: 'Ultimate Nature Trek',
      zh: '极致自然秘境探险'
    }
  },
  {
    image: '/kawah-ijen.png',
    candidates: ['/kawah-ijen.png', '/kawah-ijen.jpeg', '/kawah-ijen.jpg', '/kawah-ijen.webp'],
    fallback: 'https://images.unsplash.com/photo-1542224566-6e85f2e6772f?auto=format&fit=crop&w=1920&q=80',
    title: {
      id: 'Fenomena Api Biru Kawah Ijen',
      en: 'Ijen Crater Electric Blue Fire',
      zh: '宜珍火山神秘电光蓝火奇观'
    },
    subtitle: {
      id: 'Turun ke kawah vulkanik aktif untuk menyaksikan api biru elektrik langka dan danau kawah asam berwarna toska.',
      en: 'Descend into the active volcanic crater to witness rare electric blue flames and the turquoise acidic lake.',
      zh: '午夜徒步下至活跃火山口，亲眼见证全球罕见的电光幽蓝火焰与碧如翡翠的酸性火山湖。'
    },
    tag: {
      id: 'Fenomena Vulkanik Langka',
      en: 'Rare Volcanic Phenomenon',
      zh: '全球罕见火山奇观'
    }
  },
  {
    image: '/bali.png',
    candidates: ['/bali.png', '/bali.jpg', '/bali.jpeg', '/bali.webp'],
    fallback: 'https://images.unsplash.com/photo-1508873696983-2df519f0397e?auto=format&fit=crop&w=1920&q=80',
    title: {
      id: 'Pesona Tropis Pulau Dewata Bali',
      en: 'Tropical Wonders of Bali',
      zh: '巴厘岛热带梦幻海岛风情'
    },
    subtitle: {
      id: 'Jelajahi pura tebing kuno, pantai pasir putih eksotis, dan warisan budaya Bali yang kaya dan memikat.',
      en: 'Explore ancient cliffside sea temples, warm white sand beaches, and vibrant cultural heritage.',
      zh: '漫步悬崖古老海神庙宇，流连细腻洁白沙滩，沉浸体验绚丽多彩的巴厘岛多元文化。'
    },
    tag: {
      id: 'Surga Wisata Kepulauan',
      en: 'Island Paradise Journey',
      zh: '梦幻度假海岛之旅'
    }
  },
  {
    image: '/nusa-penida.png',
    candidates: ['/nusa-penida.png', '/nusa-penida.jpg', '/nusa-penida.jpeg', '/nusa-penida.webp'],
    fallback: 'https://images.unsplash.com/photo-1502759683299-cdcd6974244f?auto=format&fit=crop&w=1920&q=80',
    title: {
      id: 'Tebing Pesisir Eksotis Nusa Penida',
      en: 'Nusa Penida Coastal Cliffs',
      zh: '佩尼达岛壮丽绝壁海岸'
    },
    subtitle: {
      id: 'Berdiri di puncak tebing ikonik T-Rex Pantai Kelingking dengan pemandangan laut toska yang menakjubkan.',
      en: 'Stand atop the iconic T-Rex cliff at Kelingking Beach overlooking pristine turquoise sea waters.',
      zh: '屹立于网红暴龙湾（Kelingking Beach）峭壁之巅，俯瞰浩瀚湛蓝的印度洋碧波。'
    },
    tag: {
      id: 'Surga Pesisir Eksotis',
      en: 'Exotic Coastal Haven',
      zh: '网红绝壁海景圣地'
    }
  }
];

export const DYNAMIC_WHY_CHOOSE_US = [
  {
    id: 1,
    title: {
      id: 'Driver Profesional',
      en: 'Professional Drivers',
      zh: '专业持证老牌司机'
    },
    description: {
      id: 'Driver kami ramah, bersertifikat pariwisata, paham rute lokal, dan siap melayani dengan bahasa Inggris & Indonesia.',
      en: 'Our tourist-certified, English-speaking drivers understand local traffic, regional history, and professional hospitality.',
      zh: '涉外旅游认证资深司机，熟悉路况与风土人情，英语无障碍交流，提供专业贴心接送。'
    }
  },
  {
    id: 2,
    title: {
      id: 'Harga Transparan & Pasti',
      en: 'Fixed Transparent Pricing',
      zh: '透明一口价无隐形消费'
    },
    description: {
      id: 'Tanpa biaya tersembunyi. Tol, parkir, retribusi wisata, dan BBM sudah termasuk secara pasti sejak awal pemesanan.',
      en: 'Zero surprise charges or fuel markups. Tolls, parking permits, tourist park entry, and service taxes are bundled strictly in advance.',
      zh: '绝无临时加价或燃油涨价。高速过路费、停车费、景点门票及税费提前一站式全包。'
    }
  },
  {
    id: 3,
    title: {
      id: 'Armada Nyaman & Terawat',
      en: 'Comfortable Vehicles',
      zh: '现代化舒适车队'
    },
    description: {
      id: 'Armada muda (Avanza, Innova Reborn/Zenix, Hiace Premio) selalu dibersihkan setiap hari dengan AC sejuk maksimal.',
      en: 'Our young fleet (Avanza, Innova, Hiace Premio) is meticulously cleaned daily and features pristine, ice-cold air conditioning.',
      zh: '准新车况车队（Avanza、Innova、Hiace海狮），每日深度消毒清洁，强劲双温区冰爽空调。'
    }
  },
  {
    id: 4,
    title: {
      id: 'Layanan Pelanggan 24/7',
      en: '24/7 Support',
      zh: '24小时双语专属客服'
    },
    description: {
      id: 'Bantuan instan via WhatsApp dan WeChat setiap saat. Kelola, jadwalkan ulang, atau konsultasi tur dengan mudah.',
      en: 'Incredible real-time support over WhatsApp, WeChat, and Email. Manage, reschedule, or customize bookings effortlessly.',
      zh: '全天候 WhatsApp 与微信客服在线，轻松咨询定制、改签班期或解答行程疑问。'
    }
  },
  {
    id: 5,
    title: {
      id: 'Pemesanan Cepat & Mudah',
      en: 'Seamless Booking',
      zh: '一分钟极速便捷预订'
    },
    description: {
      id: 'Pesan dalam 1 menit dengan rute kustom dan konfirmasi instan langsung ke WhatsApp & Email Anda.',
      en: 'Book in under a minute with custom routes and flexible options. Get instant confirmation via WhatsApp.',
      zh: '支持个性化自选路线与灵活出行方案，一分钟在线提交即可获取即时确认单。'
    }
  },
  {
    id: 6,
    title: {
      id: 'Pemandu Lokal Berlisensi',
      en: 'Verified Local Guides',
      zh: '官方认证本地金牌向导'
    },
    description: {
      id: 'Guide kami berpengalaman dan memahami seluk-beluk geografi, budaya, serta protokol keselamatan Gunung Berapi.',
      en: 'Our guides are certified experts with deep local knowledge of East Java\'s culture, geography, and safety.',
      zh: '资深持证地接向导，深入通晓东爪哇历史人文与火山登山安全防护体系。'
    }
  },
  {
    id: 7,
    title: {
      id: 'Standar Kebersihan & Keamanan VIP',
      en: 'Premium Safety & Hygiene',
      zh: '高标准卫生与安全保障'
    },
    description: {
      id: 'Setiap armada dilengkapi kotak P3K, masker standar Kawah Ijen, dan sanitasi berkala untuk keamanan perjalanan.',
      en: 'Every vehicle is completely sanitized before and after every trip. Fully licensed fleet with safety packages.',
      zh: '每辆车出发前均严格消毒，配备随车应急医药包与专业火山防毒呼吸面具。'
    }
  },
  {
    id: 8,
    title: {
      id: 'Itinerary Fleksibel Sesuai Keinginan',
      en: 'Tailor-Made Itineraries',
      zh: '随心定制专属行程路线'
    },
    description: {
      id: 'Kebebasan penuh mengatur waktu keberangkatan, titik berhenti foto, dan rekomendasi kuliner lokal terbaik.',
      en: 'Absolute routing freedom. Customize your stops, photo opportunities, and timing on the fly.',
      zh: '享有极高自由度，随时随地根据您的喜好停靠拍照、自由品尝地道印尼风味美食。'
    }
  }
];

export const DYNAMIC_DESTINATIONS = [
  {
    id: 'bromo',
    name: {
      id: 'Kaldera Gunung Bromo',
      en: 'Mount Bromo Volcano',
      zh: '布罗莫活火山与沙海'
    },
    region: {
      id: 'Probolinggo, Jawa Timur',
      en: 'Probolinggo, East Java',
      zh: '庞越 · 东爪哇'
    },
    description: {
      id: 'Saksikan sunrise magis keemasan di atas kaldera aktif, lautan pasir berbisik, dan pura kuno Poten.',
      en: 'Witness the golden sunrise over the active caldera, sea of sand, and Hindu temple.',
      zh: '在观景台领略异星般的绝美日出、广袤黑沙海与古老的印度教 Poten 神庙。'
    },
    image: 'https://images.unsplash.com/photo-1604999333679-b86d54738315?auto=format&fit=crop&w=800&q=80',
    tourCount: {
      id: '3 Paket Privat & Share Tour',
      en: '3 Private & Share Packages',
      zh: '3个私家定制与拼团套餐'
    },
    highlightTag: {
      id: 'Kaldera Vulkanik Ikonik',
      en: 'Top Volcanic Caldera',
      zh: '世界级活火山全景'
    }
  },
  {
    id: 'ijen',
    name: {
      id: 'Kawah Ijen & Api Biru',
      en: 'Ijen Crater & Blue Fire',
      zh: '宜珍火山神秘蓝火'
    },
    region: {
      id: 'Banyuwangi, Jawa Timur',
      en: 'Banyuwangi, East Java',
      zh: '外南梦 · 东爪哇'
    },
    description: {
      id: 'Daki kawah aktif di tengah malam untuk melihat fenomena api biru belerang dan danau asam toska.',
      en: 'Trek into the active volcanic crater to see rare electric blue sulfur flames.',
      zh: '深夜徒步攀登活火山口，目睹震撼人心的电光蓝火与绿松石酸性湖。'
    },
    image: 'https://images.unsplash.com/photo-1531315630201-bb15abeb1653?auto=format&fit=crop&w=800&q=80',
    tourCount: {
      id: '2 Paket Ekspedisi',
      en: '2 Private Expeditions',
      zh: '2条经典探险路线'
    },
    highlightTag: {
      id: 'Api Biru Langka Dunia',
      en: 'Rare Electric Blue Fire',
      zh: '世界罕见电光蓝火'
    }
  },
  {
    id: 'tumpak-sewu',
    name: {
      id: 'Air Terjun Tumpak Sewu',
      en: 'Tumpak Sewu Waterfall',
      zh: '赛武千重飞瀑秘境'
    },
    region: {
      id: 'Lumajang, Jawa Timur',
      en: 'Lumajang, East Java',
      zh: '卢马姜 · 东爪哇'
    },
    description: {
      id: 'Jelajahi air terjun melingkar 120 meter di dasar ngarai tropis dengan pemandangan megah Gunung Semeru.',
      en: 'Explore the 120m semi-circular canyon waterfall at the foot of Mount Semeru.',
      zh: '探寻高120米的巨型半环形峡谷千重瀑布，壮阔的热带雨林尽收眼底。'
    },
    image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=800&q=80',
    tourCount: {
      id: '2 Paket Trekking Ngarai',
      en: '2 Canyon Trek Packages',
      zh: '2条峡谷溯溪徒步路线'
    },
    highlightTag: {
      id: 'Air Terjun Seribu Megah',
      en: 'Thousand Waterfalls',
      zh: '千重瀑布之王'
    }
  },
  {
    id: 'malang-city',
    name: {
      id: 'Kota Malang & Wisata Batu',
      en: 'Malang & Batu Highlands',
      zh: '玛琅与巴图高原避暑地'
    },
    region: {
      id: 'Malang & Batu, Jawa Timur',
      en: 'Malang, East Java',
      zh: '玛琅/巴图 · 东爪哇'
    },
    description: {
      id: 'Arsitektur kolonial Belanda, kampung warna-warni Jodipan, dan wisata petik apel di pegunungan sejuk.',
      en: 'Dutch colonial architecture, colorful heritage villages, and cool mountain resorts.',
      zh: '百年荷兰风情殖民历史街区、网红彩色村 Jodipan 与清凉高山有机果园。'
    },
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80',
    tourCount: {
      id: 'Tur Budaya & Heritage',
      en: 'Heritage & City Tours',
      zh: '城市人文与庄园游'
    },
    highlightTag: {
      id: 'Wisata Pegunungan Sejuk',
      en: 'Cool Mountain Resort',
      zh: '清凉高原度假胜地'
    }
  },
  {
    id: 'banyuwangi',
    name: {
      id: 'Banyuwangi & Taman Nasional',
      en: 'Banyuwangi & National Parks',
      zh: '外南梦国家公园生态'
    },
    region: {
      id: 'Gerbang Timur Jawa Timur',
      en: 'East Java Gateway',
      zh: '东爪哇海上门户'
    },
    description: {
      id: 'Savana Afrika ala Baluran, konservasi penyu Sukamade, dan akses penyeberangan feri cepat ke Bali.',
      en: 'Savannahs of Baluran, turtle conservation at Sukamade, and Bali ferry connectivity.',
      zh: '巴鲁兰小非洲稀树草原、苏卡马德海龟保护区与直达巴厘岛渡轮码头。'
    },
    image: 'https://images.unsplash.com/photo-1542224566-6e85f2e6772f?auto=format&fit=crop&w=800&q=80',
    tourCount: {
      id: 'Rute Satwa Liar & Pesisir',
      en: 'Wilderness & Coastal Routes',
      zh: '生态与海滨探险路线'
    },
    highlightTag: {
      id: 'Gerbang Jawa-Bali',
      en: 'Java-Bali Gateway',
      zh: '爪哇-巴厘中转枢纽'
    }
  },
  {
    id: 'bali',
    name: {
      id: 'Bali & Nusa Penida',
      en: 'Bali & Nusa Penida',
      zh: '巴厘岛与佩尼达岛'
    },
    region: {
      id: 'Provinsi Bali',
      en: 'Bali Province',
      zh: '巴厘省'
    },
    description: {
      id: 'Pura tebing laut kuno, tebing pesisir megah Kelingking, pantai pasir putih, dan tur budaya pulau.',
      en: 'Ancient sea temples, dramatic coastal cliffs, white sand beaches, and cultural tours.',
      zh: '古老壮阔的海崖庙宇、佩尼达岛网红精灵坠崖与碧海白沙阳光浴场。'
    },
    image: 'https://images.unsplash.com/photo-1508873696983-2df519f0397e?auto=format&fit=crop&w=800&q=80',
    tourCount: {
      id: 'Tur Pulau & Antar Jemput',
      en: 'Island Tours & Transfers',
      zh: '海岛环游与专车接送'
    },
    highlightTag: {
      id: 'Surga Wisata Dunia',
      en: 'Tropical Paradise',
      zh: '世界级海岛度假天堂'
    }
  }
];
