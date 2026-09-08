import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  Language, 
  Currency, 
  translateKey, 
  getLocalizedTour, 
  getLocalizedVehicle, 
  getLocalizedFAQs, 
  getLocalizedCity, 
  getLocalizedAirport,
  getLocalizedHeroSlides,
  getLocalizedWhyUs,
  getLocalizedDestinations,
} from "../locales";
import { Tour, Vehicle } from "../types";
import { formatCurrencyAmount, ENABLE_FOREIGN_CURRENCIES } from "../utils/pricingUtils";

export type { Language, Currency };

interface LanguageCurrencyContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: Currency;
  setCurrency: (curr: Currency) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatPrice: (priceUSD: number) => string;
  getTour: (tour: Tour) => Tour;
  getVehicle: (vehicle: Vehicle) => Vehicle;
  getFaqs: () => Array<{ question: string; answer: string }>;
  getCity: (city: string) => string;
  getAirport: (code: string) => string;
  getHeroSlides: () => ReturnType<typeof getLocalizedHeroSlides>;
  getWhyUs: () => ReturnType<typeof getLocalizedWhyUs>;
  getDestinations: () => ReturnType<typeof getLocalizedDestinations>;
}

const LanguageCurrencyContext = createContext<LanguageCurrencyContextProps | undefined>(undefined);

// Core translation dictionary for outstanding localized translation
const dictionary: Record<string, Partial<Record<Language, string>>> = {
  // Navigation / Header
  "Explore Trips": {
    en: "Explore Trips",
    zh: "探索行程之旅"
  },
  "Check Booking": {
    en: "Check Booking",
    zh: "查询预订状态"
  },
  "Trip Management Portal": {
    en: "Trip Management Portal",
    zh: "行程预订管理系统"
  },
  "SMART JOURNEY": {
    en: "SMART JOURNEY",
    zh: "慧捷之旅 SMART JOURNEY"
  },
  "nav.toursSubtitle": {
    en: "Explore curated travel destinations",
    id: "Jelajahi destinasi wisata terbaik",
    zh: "精选经典旅游目的地与路线"
  },
  "nav.shareTour": {
    en: "Open Trip / Join Share Tour",
    id: "Open Trip / Join Share Tour",
    zh: "拼团游 (Open Trip / Join Share Tour)"
  },
  "nav.shareTourSubtitle": {
    en: "Join open group trips & split costs",
    id: "Gabung open trip hemat & seru",
    zh: "加入拼团游，高性价比结伴同行"
  },
  "nav.newBadge": {
    en: "NEW",
    id: "BARU",
    zh: "最新"
  },
  "nav.airportSubtitle": {
    en: "Reliable airport pickups & drop-offs",
    id: "Antar jemput bandara tepat waktu",
    zh: "准时机场接送机服务 (SUB / DPS)"
  },
  "nav.taxiSubtitle": {
    en: "Point-to-point intercity private rides",
    id: "Layanan antar kota point-to-point",
    zh: "点对点城际舒适专车直达"
  },
  "nav.carRentalSubtitle": {
    en: "With driver or self-drive options",
    id: "Sewa mobil dengan driver atau lepas kunci",
    zh: "优质车队，支持带驾或自驾"
  },
  "nav.services": {
    en: "Services",
    id: "Layanan",
    zh: "特色服务"
  },
  "FOOTER.SERVICESTITLE": {
    en: "Services",
    id: "Layanan",
    zh: "特色服务"
  },
  "footer.servicesTitle": {
    en: "Services",
    id: "Layanan",
    zh: "特色服务"
  },
  "footer.services": {
    en: "Services",
    id: "Layanan",
    zh: "特色服务"
  },
  "FOOTER.CONTACTTITLE": {
    en: "Contact",
    id: "Kontak",
    zh: "联系我们"
  },
  "footer.contactTitle": {
    en: "Contact",
    id: "Kontak",
    zh: "联系我们"
  },
  "footer.contact": {
    en: "Contact",
    id: "Kontak",
    zh: "联系我们"
  },
  "footer.aboutText": {
    en: "Smart Journey is an officially licensed travel and transportation operator under PT Sawah Jaya Trans. Specializing in Mount Bromo and Ijen Crater volcanic tours, private car rentals, and 24/7 airport transfers across East Java and Bali.",
    id: "Smart Journey adalah operator tur dan penyedia transportasi berizin resmi di bawah PT Sawah Jaya Trans. Melayani wisata gunung berapi Bromo & Ijen, sewa mobil, dan transfer bandara di Jawa Timur & Bali.",
    zh: "Smart Journey 慧捷之旅是 PT Sawah Jaya Trans 旗下正规持牌旅游出行品牌。专注布罗莫与宜珍火山生态游、商务包车及全天候机场接送，覆盖印尼东爪哇与巴厘岛。"
  },
  "footer.aboutCompany": {
    en: "Smart Journey is an officially licensed travel and transportation operator under PT Sawah Jaya Trans. Specializing in Mount Bromo and Ijen Crater volcanic tours, private car rentals, and 24/7 airport transfers across East Java and Bali.",
    id: "Smart Journey adalah operator tur dan penyedia transportasi berizin resmi di bawah PT Sawah Jaya Trans. Melayani wisata gunung berapi Bromo & Ijen, sewa mobil, dan transfer bandara di Jawa Timur & Bali.",
    zh: "Smart Journey 慧捷之旅是 PT Sawah Jaya Trans 旗下正规持牌旅游出行品牌。专注布罗莫与宜珍火山生态游、商务包车及全天候机场接送，覆盖印尼东爪哇与巴厘岛。"
  },
  "footer.officialOperator": {
    en: "Official Licensed Travel Operator",
    id: "Operator Perjalanan Berizin Resmi",
    zh: "正规持牌旅行与车队运营商"
  },
  "footer.partnerships": {
    en: "B2B Partnerships",
    id: "Kemitraan B2B",
    zh: "B2B 商务合作"
  },
  "footer.secure": {
    en: "100% SECURE & TRUSTED",
    id: "100% AMAN & TERPERCAYA",
    zh: "100% 安全可靠"
  },
  "footer.secureSubtitle": {
    en: "Your payment is safe and secure with us.",
    id: "Pembayaran Anda aman bersama kami.",
    zh: "您的支付与预订全程受加密安全保护。"
  },
  "footer.licensed": {
    en: "OFFICIAL TRANSPORT LICENSE",
    id: "IZIN ANGKUTAN RESMI",
    zh: "正规客运营运资质"
  },
  "footer.paymentMethods": {
    en: "ACCEPTED PAYMENT METHODS",
    id: "METODE PEMBAYARAN YANG DITERIMA",
    zh: "支持的付款方式"
  },
  "footer.privacyPolicy": {
    en: "Privacy Policy",
    id: "Kebijakan Privasi",
    zh: "隐私政策"
  },
  "footer.termsConditions": {
    en: "Terms & Conditions",
    id: "Syarat & Ketentuan",
    zh: "服务条款"
  },
  "footer.contactUs": {
    en: "Contact Us",
    id: "Hubungi Kami",
    zh: "联系我们"
  },
  "footer.adminAccess": {
    en: "Admin Access",
    id: "Akses Admin",
    zh: "后台管理"
  },
  "footer.adminWebsite": {
    en: "Admin Smart Journey",
    id: "Admin Smart Journey",
    zh: "主网站后台管理"
  },
  "footer.adminShareTour": {
    en: "Admin Share Tour",
    id: "Admin Share Tour",
    zh: "拼团/拼车后台管理"
  },
  "footer.allRightsReserved": {
    en: "All rights reserved",
    id: "Hak cipta dilindungi undang-undang",
    zh: "版权所有"
  },
  "wechat.title": {
    en: "Official WeChat Customer Service",
    id: "Layanan Pelanggan Resmi WeChat",
    zh: "Smart Journey 官方微信客服"
  },
  "wechat.instruction": {
    en: "Scan QR Code with WeChat app or copy WeChat ID to connect with our official travel consultants.",
    id: "Pindai QR Code menggunakan aplikasi WeChat atau salin ID WeChat untuk terhubung dengan konsultan perjalanan kami.",
    zh: "使用微信扫描上方二维码，或复制微信号添加官方客服，为您提供一对一行程定制咨询。"
  },
  "wechat.done": {
    en: "Done",
    id: "Selesai",
    zh: "完成"
  },
  "wechat.copied": {
    en: "Copied!",
    id: "Tersalin!",
    zh: "已复制！"
  },
  "wechat.copyId": {
    en: "Copy ID",
    id: "Salin ID",
    zh: "复制微信号"
  },

  // Hero Section
  "Premium Nature Tour Packages": {
    en: "Premium Nature Tour Packages",
    zh: "高端精品自然生态行程"
  },
  "Informasi & Booking": {
    en: "Information & Booking",
    zh: "特色出行信息与预订"
  },
  "Share Tour": {
    en: "Open Trip / Join Share Tour",
    id: "Open Trip / Join Share Tour",
    zh: "拼团游 (Open Trip / Join Share Tour)"
  },
  "Curated micro-expeditions for environment advocates and outdoor explorers.": {
    en: "Curated micro-expeditions for environment advocates and outdoor explorers.",
    zh: "专为环保倡导者及户外探险家量身定制的精心微型探险。"
  },
  "Explore Tour": {
    en: "Explore Tour",
    zh: "探索精品拼车游"
  },
  "Verify My Ticket": {
    en: "Verify My Ticket",
    zh: "验证我的电子凭证"
  },

  // Search & Filter
  "Search and filter tours...": {
    en: "Search and filter tours...",
    zh: "搜索和过滤特色行程..."
  },
  "All Days": {
    en: "All Days",
    zh: "所有天数"
  },
  "Days": {
    en: "Days",
    zh: "天"
  },
  "Reset Search Filters": {
    en: "Reset Search Filters",
    zh: "重置搜索过滤器"
  },
  "No vacations or trips found matching your current search parameters.": {
    en: "No vacations or trips found matching your current search parameters.",
    zh: "未找到符合您搜索条件的度假或探索旅行。"
  },

  // Tours Section
  "Our Signature Tours": {
    en: "Our Signature Tours",
    zh: "我们的招牌生态游"
  },
  "Starting rate": {
    en: "Starting rate",
    zh: "起步价"
  },
  "Batches Open": {
    en: "Batches Open",
    zh: "个招募批次开放"
  },
  "Sold Out": {
    en: "Sold Out",
    zh: "全额售罄"
  },

  // Process Steps
  "Your Journey in 3 Steps": {
    en: "Your Journey in 3 Steps",
    zh: "只需3步 轻松启程"
  },
  "Cara Booking & Alur Reservasi": {
    en: "How to Book & Reservation Flow",
    zh: "如何预订与服务流程"
  },
  "Langkah mudah untuk mendaftar dan mengunci slot kuota perjalanan Anda dengan aman.": {
    en: "Easy steps to register and lock your travel quota slot securely.",
    zh: "简单几步，即可轻松注册并实时锁定您的专属拼团出行席位。"
  },
  "1. Pilih Tour & Jadwal": {
    en: "1. Choose Tour & Batch",
    zh: "1. 精选行程与班期"
  },
  "Cari petualangan Anda dan klik detail untuk memilih batch tanggal keberangkatan yang masih tersedia (Open).": {
    en: "Browse our signature packages and click details to select an active departure date with open available seats.",
    zh: "自主浏览挑选精品拼车路线，点击详情以选定状态为开放（Open）的招募期出发行程。"
  },
  "2. Lengkapi Form Data Diri": {
    en: "2. Fill Traveler Profile",
    zh: "2. 填写完整出行人信息"
  },
  "Masukkan 8 data wajib pemesan utama (WeChat, WhatsApp, Email, dll) beserta nama-nama peserta tambahan dengan lengkap.": {
    en: "Complete the 8 mandatory fields with your active credentials (WeChat ID, WhatsApp, Email, present city, passport details, flight) perfectly.",
    zh: "依次填写微信ID、WhatsApp号、邮箱、居住城市及航班号等8项关键数据，支持录入多位追加同行人姓名。"
  },
  "3. Verifikasi Instan & Kode Booking": {
    en: "3. Lock Quote & Secure Code",
    zh: "3. 实时占位与专属预订码"
  },
  "Kirim formulir untuk mendaftarkan reservasi offline. Anda akan langsung mendapatkan Kode Booking unik (misal: SJ-W8F3T) untuk disimpan.": {
    en: "Submit the registration request. Our system directly claims seats from the quota and hands you an exclusive 6-character Booking Code.",
    zh: "一键提交预订。系统自动硬扣减席位并生成唯一的6位跟踪码（例如：SJ-W8F3T），请妥善保存该凭证。"
  },
  "4. Lacak Live & Selesaikan Pembayaran": {
    en: "4. Live Tracking & Boarding Print",
    zh: "4. 实时追踪与登机牌打印"
  },
  "Pantau live status pesanan Anda. Setelah dikonfirmasi oleh Admin Smart Journey via WhatsApp, tiket digital verified siap dicetak.": {
    en: "Track status live using the Booking Code. Once validated offline by the travel coordinator, download your authorized manifest and print tickets.",
    zh: "前往“Monitor Status Live”输入预订码监控状态。订单由客服在后台录入并审批确认后即可自助打印您的电子登机manifest。"
  },
  "Our booking process is designed to save your time and verify your logs": {
    en: "Our booking process is designed to save your time and verify your logs",
    zh: "极其流畅的安全预订流程，旨在为您节省时间并提供即时验证凭证"
  },
  "Choose Route": {
    en: "Choose Route",
    zh: "选定探索路线"
  },
  "Browse our catalog of micro-ecosystems and select your adventure.": {
    en: "Browse our catalog of micro-ecosystems and select your adventure.",
    zh: "浏览我们的微型生态环境目录，选择专属于您的定制探险之旅。"
  },
  "Pick Open Batch": {
    en: "Pick Open Batch",
    zh: "匹配心仪批次"
  },
  "Choose an active departure batch date that fits your calendar.": {
    en: "Choose an active departure batch date that fits your calendar.",
    zh: "选择最适合您时间表并且状态为开放（Open）的出发批次。"
  },
  "Instant Ticket": {
    en: "Instant Ticket",
    zh: "即时提取票据"
  },
  "Complete details and obtain a certified digital voucher instantly.": {
    en: "Complete details and obtain a certified digital voucher instantly.",
    zh: "完成基本信息填写，秒级生成经官方数字签名认证的电子出行凭证。"
  },

  // Sidebar Booking Banner / Bottom Bar
  "Already booked an expedition?": {
    en: "Already booked an expedition?",
    id: "Sudah memesan paket perjalanan?",
    zh: "已经预订过了探险行程？"
  },
  "Check your real-time verification logs or trace your trip itinerary voucher status instantly.": {
    en: "Check your real-time verification logs or trace your trip itinerary voucher status instantly.",
    id: "Cek log verifikasi real-time atau lacak status voucher jadwal perjalanan Anda secara instan.",
    zh: "查看您的真实飞行与向导交接日志，或者即时追踪您的行程单和代金券激活状态。"
  },
  "Check Booking Details": {
    en: "Check Booking Details",
    id: "Cek Detail Pesanan",
    zh: "查询预订详情"
  },
  "Real-time Secure Checkouts Locked": {
    en: "Official Protected Checkout",
    id: "Gerbang Pembayaran Resmi Terlindungi",
    zh: "官方安全认证结账"
  },

  // Trip Detail
  "Back to Expeditions": {
    en: "Back to Expeditions",
    zh: "返回行程列表"
  },
  "Trip Overview & Highlights": {
    en: "Trip Overview & Highlights",
    zh: "行程概览与闪光亮点"
  },
  "Comprehensive Description": {
    en: "Comprehensive Description",
    zh: "深度全景介绍"
  },
  "Special Trip Highlight": {
    en: "Special Trip Highlight",
    zh: "本路线专属极致特色"
  },
  "Editable by Authorized Admin only": {
    en: "Editable by Authorized Admin only",
    zh: "此包仅限获授权的管理员在后台编辑修改"
  },
  "Interactive Day-by-Day Itinerary": {
    en: "Interactive Day-by-Day Itinerary",
    zh: "交互式逐日深度行程表"
  },
  "Expand days to audit specific time schedules & activities.": {
    en: "Expand days to audit specific time schedules & activities.",
    zh: "点击展开各个时间节点审核当天的具体活动、行车与就餐细节。"
  },
  "Minimize Details": {
    en: "Minimize Details",
    zh: "收起所有卡片细节"
  },
  "Maximize Details": {
    en: "Maximize Details",
    zh: "展开所有卡片细节"
  },
  "Price Includes": {
    en: "Price Includes",
    zh: "费用包含（安心全包）"
  },
  "Price Excludes": {
    en: "Price Excludes",
    zh: "费用不含（透明自理）"
  },
  "Frequently Asked Questions": {
    en: "Frequently Asked Questions",
    zh: "出行行前常见问答"
  },
  "Departure Calendar": {
    en: "Departure Calendar",
    zh: "可供选择的出团日历"
  },
  "Pick an open batch departure to register.": {
    en: "Pick an open batch departure to register.",
    zh: "请在下方勾选一个仍然开放报名的团期以继续。"
  },
  "Left": {
    en: "Left",
    zh: "位余量"
  },
  "Full": {
    en: "Full",
    zh: "抱满"
  },
  "Total rate per traveler": {
    en: "Total rate per traveler",
    zh: "单人全包均价费用"
  },
  "URGENT": {
    en: "URGENT",
    zh: "名额告急"
  },
  "Selected Date": {
    en: "Selected Date",
    zh: "已选出港日"
  },
  "Price rate (USD)": {
    en: "Price rate (USD)",
    zh: "原始美元底价"
  },
  "Subtotal": {
    en: "Subtotal",
    zh: "应付费用总计"
  },
  "Continue to Registration": {
    en: "Continue to Registration",
    zh: "继续填写乘机人资料"
  },
  "Other Signature Expeditions": {
    en: "Other Signature Expeditions",
    zh: "看看其他金牌推荐特惠路线"
  },
  "No other expeditions available at the moment.": {
    en: "No other expeditions available at the moment.",
    zh: "暂无其他可替代的相关路线推荐。"
  },
  "Please select one available departure date above to reveal the luxury all-inclusive pricing rate.": {
    en: "Please select one available departure date above to reveal the luxury all-inclusive pricing rate.",
    zh: "请先在上面的离港日历中勾选一个日期，即可激活本产品的支付通道与转换汇总。"
  },

  // Booking Form
  "Secure Registration Request": {
    en: "Secure Registration Request",
    zh: "旅客实名制安全登记"
  },
  "Configure your explorer profiles and lock your departure quota before seats deplete.": {
    en: "Configure your explorer profiles and lock your departure quota before seats deplete.",
    zh: "请即刻补充并锁定出港探险名单名额，防止名额在支付断档前滑走。"
  },
  "Go Back to Trip Details": {
    en: "Go Back to Trip Details",
    zh: "放弃并退回产品详情页"
  },
  "Selected Expedition": {
    en: "Selected Expedition",
    zh: "预订游览目的地"
  },
  "Selected Departure Batch": {
    en: "Selected Departure Batch",
    zh: "选定出团营期"
  },
  "Rate per Traveler": {
    en: "Rate per Traveler",
    zh: "均价/每人"
  },
  "Total Payable": {
    en: "Total Payable",
    zh: "共计需要电汇款额"
  },
  "Register Passenger Profile": {
    en: "Register Passenger Profile",
    zh: "填写出游人护照基本档案"
  },
  "Full Name (matches passport)": {
    en: "Full Name (matches passport)",
    zh: "拼音全名 (须与护照或身份证完全一致)"
  },
  "Email Address": {
    en: "Email Address",
    zh: "电子邮箱地址"
  },
  "Phone Number (with country code)": {
    en: "Phone Number (with country code)",
    zh: "手机号码 (添加国际区号，如+86 / +62)"
  },
  "Traveler Count": {
    en: "Traveler Count",
    zh: "出行总人数"
  },
  "Group Traveler Names (including yourself, one per line)": {
    en: "Group Traveler Names (including yourself, one per line)",
    zh: "随行同行人英文姓名 (包括您自己，每行录入一个拼音全名)"
  },
  "Upload Proof of Bank Payment Transfer": {
    en: "Upload Proof of Bank Payment Transfer",
    zh: "上传银行汇款（外汇/转账）凭证截图"
  },
  "Payment instructions": {
    en: "Payment instructions",
    zh: "境外电汇官方支付指令指引"
  },
  "Please transfer the total amount calculated above to our corporate bank account or scan the QR code:": {
    en: "Please transfer the total amount calculated above to our corporate bank account or scan the QR code:",
    zh: "请发送上述计算的折算总汇款金额至我方商业银行监管账目，或使用第三方主流支付工具扫码存证："
  },
  "Bank Name": {
    en: "Bank Name",
    zh: "存货行（收款银行）"
  },
  "Account Number": {
    en: "Account Number",
    zh: "官方公用账号"
  },
  "Account Holder": {
    en: "Account Holder",
    zh: "收款公司（开户人）"
  },
  "Drag & drop payment receipt image here, or click to browse": {
    en: "Drag & drop payment receipt image here, or click to browse",
    zh: "将电子账单、银行水单、转账或者扫码成功的截图拖拽入此区域，或点击此处选择本地文件"
  },
  "Supported formats: PNG, JPG, JPEG (Max 5MB)": {
    en: "Supported formats: PNG, JPG, JPEG (Max 5MB)",
    zh: "支持文件格式：PNG, JPG, JPEG (素材体积不得超过5兆)"
  },
  "Receipt file locked": {
    en: "Receipt file locked",
    zh: "汇款水单已入库上行"
  },
  "Change Selected File": {
    en: "Change Selected File",
    zh: "重新上传其他水单"
  },
  "I hereby certify that my group holds official passport clearance, accepts the Ecotourism Stewardship Agreement, and verified the travel batch constraints honestly.": {
    en: "I hereby certify that my group holds official passport clearance, accepts the Ecotourism Stewardship Agreement, and verified the travel batch constraints honestly.",
    zh: "我确认本出行团队各成员已取得对应目的地签证与有效护照，接受并签署《生态环境行为负面清单自律及生态保护告知书》，并保证填写的申报内容真实不欺。"
  },
  "Submit Registration Request": {
    en: "Submit Registration Request",
    zh: "向慧捷客服正式递交审核出单"
  },
  "Registering Locked Quota...": {
    en: "Registering Locked Quota...",
    zh: "正在锁定机票并上传，请勿关闭本窗口..."
  },

  // Booking Success
  "Reservation Order Queue Locked": {
    en: "Reservation Order Queue Locked",
    zh: "生态探险位已成功锁定且已发出"
  },
  "We have locked your eco-travel queue and generated your secure check voucher below. Please reserve the code for ticket retrievals.": {
    en: "We have locked your eco-travel queue and generated your secure check voucher below. Please reserve the code for ticket retrievals.",
    zh: "我们的后台系统已为您的随行家庭及团队排遣锁定席位，并生成了以下唯一的安全出行电子行程单密钥。请务必妥善留存代码，以便后续查询航班向导、打印或导出。"
  },
  "Download Secure PDF Voucher": {
    en: "Download Secure PDF Voucher",
    zh: "一键导出PDF出行凭证(带防伪网印)"
  },
  "Booking Reference": {
    en: "Booking Reference",
    zh: "出行订单编号"
  },
  "Voucher Status": {
    en: "Voucher Status",
    zh: "当前审核状态"
  },
  "Passenger Registered": {
    en: "Passenger Registered",
    zh: "乘机常旅客登记"
  },
  "Confirmed Departure Date": {
    en: "Confirmed Departure Date",
    zh: "离港执行时间"
  },
  "Secure Gate Verification Status": {
    en: "Secure Gate Verification Status",
    zh: "数字资产网关验证签名"
  },
  "AUTHORIZED SECURE VOUCHER": {
    en: "AUTHORIZED SECURE VOUCHER",
    zh: "国家生态旅游联盟认证之数字客票"
  },
  "Verify Another Code": {
    en: "Verify Another Code",
    zh: "重新输入其他订单"
  },

  // Status Checker
  "Search Booking Registry": {
    en: "Search Booking Registry",
    zh: "登机牌与预订检索中心"
  },
  "Provide your alphanumeric booking code and registered email to check status, download PDF, or audit verification history.": {
    en: "Provide your alphanumeric booking code and registered email to check status, download PDF, or audit verification history.",
    zh: "请输入您的订单汇款序列号与在报名表中填写的邮箱地址，以调取在库状态、导出登机防伪凭据或追溯行程审计。"
  },
  "Enter Booking Code": {
    en: "Enter Booking Code",
    zh: "订单序列密钥 code"
  },
  "Registered Email Address": {
    en: "Registered Email Address",
    zh: "原登记邮箱"
  },
  "Fetch My Ticket Voucher": {
    en: "Fetch My Ticket Voucher",
    zh: "检索并调取我的出游凭证"
  },
  "No registered booking match found. Please verify code or email spelling.": {
    en: "No registered booking match found. Please verify code or email spelling.",
    zh: "后台未查询到与之相配的登记信息。请核对订单号或邮箱拼写是否漏打、打错。"
  },
  "Checking credentials secure register...": {
    en: "Checking credentials secure register...",
    zh: "正在调取云端数据库安全通道校验，请稍候..."
  },
  "Audit Security Verification History": {
    en: "Audit Security Verification History",
    zh: "审计该客户出行单的历史验真实体追踪"
  },
  "Verified by Admin Desk": {
    en: "Verified by Admin Desk",
    zh: "商旅出单客服柜台"
  },
  "Passenger Manifest Checked": {
    en: "Passenger Manifest Checked",
    zh: "旅客护照等出境信息已过检"
  },
  "Payment Confirmed Match": {
    en: "Payment Confirmed Match",
    zh: "银行转账汇款已比对并结算"
  },
  "Pending Review": {
    en: "Pending Review",
    zh: "等待后台客服人工认领"
  },
  "Confirmed": {
    en: "Confirmed",
    zh: "确认已出单 (常旅客及向导已锁定)"
  },
  "Rejected": {
    en: "Rejected",
    zh: "汇款不足或驳回复审"
  },

  // Smart Journey Horizontal Timeline Localization
  "Interactive Booking System": {
    en: "Interactive Booking System",
    zh: "交互式智能预订系统"
  },
  "Alur Reservasi Modern": {
    en: "Modern Reservation Flow",
    zh: "现代预订与服务流程"
  },
  "CHOOSE": {
    en: "CHOOSE",
    zh: "选定班期"
  },
  "Choose Trip": {
    en: "Choose Trip",
    zh: "精选路线"
  },
  "DETAILS": {
    en: "DETAILS",
    zh: "填写名单"
  },
  "Fill Details": {
    en: "Fill Details",
    zh: "完善客户资料"
  },
  "DEPOSIT": {
    en: "DEPOSIT",
    zh: "海事定金"
  },
  "Secure Deposit": {
    en: "Secure Deposit",
    zh: "安全定金保护"
  },
  "TICKET": {
    en: "TICKET",
    zh: "提取船票"
  },
  "Get E-Ticket": {
    en: "Get E-Ticket",
    zh: "获取电子船票"
  },
  "Trip": {
    en: "Trip",
    zh: "路线"
  },
  "Details": {
    en: "Details",
    zh: "名单"
  },
  "Deposit": {
    en: "Deposit",
    zh: "定金"
  },
  "Ticket": {
    en: "Ticket",
    zh: "船票"
  },
  "GUIDE: STEP": {
    en: "GUIDE: STEP",
    zh: "向导步骤"
  },
  "STATUS: EXPLORING": {
    en: "EXPLORING CATALOG",
    zh: "正在探索精选路线"
  },
  "STATUS: FORM_FILLING": {
    en: "REGISTERING TRAVELERS",
    zh: "正在填报常旅客名单"
  },
  "STATUS: SECURE_GATEWAY": {
    en: "DEPOSIT SETTLEMENT",
    zh: "微信定金到账审核中"
  },
  "STATUS: TICKET_ISSUED": {
    en: "BOARDING PASS READY",
    zh: "电子登船凭证已签发"
  },
  "Pilih Paket & Tentukan Jadwal Batch Keberangkatan": {
    en: "Select Tour & Pick Your Departure Date Batch",
    zh: "精选海洋船宿/地质套餐并匹配您的班期"
  },
  "Pengisian Formulir Manifest Penumpang Secara Lengkap": {
    en: "Fill Manifest Form with Passenger Profiles",
    zh: "在线填报官方海事登记乘客核对名单"
  },
  "Konfirmasi WhatsApp Admin & Deposit (DP) Aman": {
    en: "WhatsApp Confirmation & Secure Down Payment",
    zh: "专员线上对接与预付定金防伪"
  },
  "Unduh E-Ticket Boarding Pass Berbarcode Resmi": {
    en: "Retrieve & Download Your PDF Boarding Pass",
    zh: "一键调取下载您的一体防伪微信条码船票"
  },
  "Telusuri katalog paket pelayaran mewah kami di atas. Pilih dari berbagai rute, tipe kapal phinisi premium, serta durasi perjalanan impian Anda. Setelah menemukan batch tanggal keberangkatan yang ideal yang masih menyisakan kursi (cabin/bed), tentukan jumlah penumpang untuk memulai.": {
    en: "Browse our signature package catalog above. Select your preferred route, phinisi class, and ideal duration. Check live seating, select your active batch date, and insert the travel party count to open the gateway.",
    zh: "自主浏览上方精品皮尼西船宿及海岛探险套餐。匹配适合您的出行时间、轻奢船舱规格与理想航程。选定仍然开放可售的日期批次，输入总出游人数即可继续。"
  },
  "Klik tombol booking pada paket tersebut dan isi detail formulir manifes resmi dengan lengkap. Anda hanya perlu menyertakan nama pinyin/paspor, ID WeChat, ID XiaoHongShu (Red ID), data WhatsApp aktif, kota domisili, serta rincian penerbangan kedatangan agar staf logistik kami dapat menjadwalkan layanan penjemputan bandara gratis.": {
    en: "Click the booking button and fill in Traveler Manifest form properly. We ask for passport details, WeChat ID, Xiaohongshu Red ID, active WhatsApp contact, home city, and arrival flight info to customize your free airport Shuttle service.",
    zh: "点击预订键进入官方出港常客系统。请如实对齐并录入乘船其中英文、护照号、微信号、小红书ID、常用手机号、客源地及客运航班。以便本地后勤调度人员为您编排免费保姆车接送机日程。"
  },
  "Setelah formulir terkirim, sistem kami akan langsung mengamankan slot manifes awal Anda. Hubungi Travel Coordinator kami via WhatsApp bersama Kode Booking Anda untuk menerima invoice resmi. Lakukan transfer pembayaran deposit (down payment) secara aman untuk mengunci seat kabin Anda secara permanen.": {
    en: "Once submitted, your temporary manifest seat is put on hold. Reach out to our Travel Coordinator via WhatsApp with your unique Booking Code to obtain the official invoice. Settle down the lock-in deposit (down payment) to secure your cozy cabin seats forever.",
    zh: "出单提交后，系统将临时锁定该舱位名额。请联络在线客服发送您的六位预订码获取收费发票，通过第三方支付工具快捷支付极小额定金（Down Payment）使席位获得正式排班担保。"
  },
  "Begitu pembayaran deposit diverifikasi aman oleh Admin, status reservasi Anda otomatis menjadi 'Telah Dikonfirmasi' (Confirmed). Anda dapat langsung mengakses menu 'Cek Status' di bagian atas halaman web ini, memasukkan Nomor WhatsApp / Kode Booking Anda, dan mengunduh E-Ticket Boarding Pass bertanda QR-Code dalam sekejap.": {
    en: "Once deposit payment is validated and cleared by Admin, your booking status automatically updates to 'Confirmed'. You can then head over to 'Check Booking' at the top navigation, enter your mobile/Booking Code, and instantly download your standard E-Ticket with QR-Code.",
    zh: "财务或微信定金过账认领后，后台订单将秒级标识为“已确认”（Confirmed）。此时可随时进入网站左上角“查询预订”入口，输入预登记微信/手机或预订钥匙，秒级获取或导出防伪登船数字凭证。"
  },
  "Quick Checklist": {
    en: "Quick Checklist",
    zh: "核心要素检查"
  },
  "Telusuri katalog paket di atas": {
    en: "Browse packages above",
    zh: "寻找心仪皮尼西或火山套餐"
  },
  "Pilih rute & tipe kapal phinisi": {
    en: "Select route & vessel type",
    zh: "挑选中意探险路线和船体"
  },
  "Tentukan batch tanggal aktif": {
    en: "Pick active open batch",
    zh: "查找仍在开团的出航批次"
  },
  "Isi nama resmi & nama Inggris": {
    en: "Fill official English name",
    zh: "拼写须与护照或身份证对齐"
  },
  "Isi ID WeChat & XiaoHongShu ID": {
    en: "Fill WeChat & Red ID",
    zh: "留存国内微信号及小红书ID"
  },
  "Isi nomor penerbangan transfer": {
    en: "Provide transfer flight #",
    zh: "备注用于免费调度的客运航班"
  },
  "Terima invoice dari admin via WA": {
    en: "Receive invoice via WA",
    zh: "向对接专员取得预付定金单"
  },
  "Lakukan transfer deposit (DP)": {
    en: "Wire down payment deposit",
    zh: "快捷扫码支付少量预付定金"
  },
  "Sistem otomatis mengunci seat": {
    en: "Seats locked on the list",
    zh: "系统自动锁死所选铺位名额"
  },
  "Manifes tervalidasi Syahbandar": {
    en: "Manifest cleared by port",
    zh: "常客名册由客运海事局报备"
  },
  "Boarding pass QR Code terbit": {
    en: "Download QR boarding voucher",
    zh: "成功签发高清晰电子二维码"
  },
  "Unduh instan di 'Cek Status'": {
    en: "Instant download at 'Check'",
    zh: "通过“查询预订”即时无排队下载"
  },
  "Klik pada tombol kartu di atas atau kelola di bawah untuk info detail:": {
    en: "Click the step cards above or navigate using pagination dots below for details:",
    zh: "轻触上方横向步骤连线卡片页签，或点击下方指示点切换步骤说明："
  },

  // Database standard items (fallback fallback translations for the major trips database objects)
  "Labuan Bajo Komodo Liveaboard Adventure": {
    en: "Labuan Bajo Komodo Liveaboard Adventure",
    zh: "科莫多龙双层帆船船宿终极探险营 (拉布安巴佐)"
  },
  "Ancient Java: Bromo Sunrise & Mt. Ijen Blue Fire": {
    en: "Ancient Java: Bromo Sunrise & Mt. Ijen Blue Fire",
    zh: "爪哇奇迹：婆罗摩火山火山日出 ＆ 伊真火山地核蓝火探险"
  },
  "Nusa Penida Ultimate Tropical Gateway": {
    en: "Nusa Penida Ultimate Tropical Gateway",
    zh: "佩尼达岛魔鬼鱼同游 ＆ 恐龙湾热带天堂秘境游"
  },
  "Labuan Bajo, Nusa Tenggara Timur": {
    en: "Labuan Bajo, Nusa Tenggara Timur",
    zh: "印度尼西亚·拉布安巴佐"
  },
  "East Java (Probolinggo & Banyuwangi)": {
    en: "East Java (Probolinggo & Banyuwangi)",
    zh: "印度尼西亚·东爪哇外南梦与布罗莫"
  },
  "Nusa Penida, Bali": {
    en: "Nusa Penida, Bali",
    zh: "印度尼西亚·巴厘岛佩尼达"
  }
};

// Dynamic database string fallback rules for items when language is Chinese (simplified mapping)
const dynamicDatabaseZH: Record<string, string> = {
  // Trips titles
  "Labuan Bajo Komodo Liveaboard Adventure": "科莫多龙船宿终极探险营",
  "Ancient Java: Bromo Sunrise & Mt. Ijen Blue Fire": "爪哇火山：婆罗摩日出 ＆ 伊真地核蓝火",
  "Nusa Penida Ultimate Tropical Gateway": "佩尼达岛魔鬼鱼同游和恐龙湾特惠游",

  // Trip descriptions
  "Sail across the crystalline waters of Komodo National Park on a luxury pinisi boat. Hike up Padar Island, walk alongside ancient Komodo dragons on Rinca, relax on the vibrant Pink Beach, and swim with graceful manta rays at Manta Point.":
    "搭乘轻奢双层原木 Pinisi 巨轮穿越科莫多国家公园的绿松石海域。徒步登上帕达尔岛俯瞰壮美三色海滩，在林卡林地与古老的科莫多巨蜥并肩漫游，在梦幻粉红沙滩肆意嬉戏，并于 Manta 湾与巨大的野生魔鬼鱼零距离共游。",
  
  "Witness the surreal sea of sand surrounding Mount Bromo, feel the cold mountain air as the sun rises over smoke-venting volcanos, and venture deep inside Mount Ijen to see the magical neon-blue sulfuric fire of Banyuwangi.":
    "站在巍峨的火山口边缘，俯望 Mount Bromo 壮美的沙海。在凌晨的凛冽高空微风中观赏晨曦点亮漫天云海，随后背上供氧面罩深夜探地，见证伊真火山内部举世罕见的亮蓝色岩浆硫磺硫火奇观。",

  "Take a fast boat from mainland Bali to discover the dramatic towering cliffs and pristine white beaches of Nusa Penida. Visit the famous T-Rex cliff of Kelingking beach, swim with marine life, and swim in natural pools.":
    "从巴厘岛本岛搭乘巨型双体豪华快艇横渡印度洋，前去饱览佩尼达岛鬼斧神工的断崖绝壁与果冻色环礁。打卡全球知名的霸王龙海角 T-Rex，与珊瑚鱼海龟共游，在天使浴池天然无边浪池中浮沉。",

  // Highlights
  "Sail on a luxury double-deck Pinisi boat, conquer Padar Island's triple-bay viewpoints, snorkel with wild manta rays, and track prehistoric dragons guided by Rangers.":
    "畅享高端双层皮尼西帆船巡航，征服帕达尔岛三弧湾顶尖日出摄影角，浮潜搜寻野生魔鬼鱼，并在国家公园持枪管理员贴身保护下追踪活化石科莫多巨蜥。",

  "Private 4x4 Jeep sunrise convoy across Bromo's whispering sand sea, and a midnight trek into Ijen crater to see the rare glowing sulfuric blue flame.":
    "搭乘超酷私人 4x4 牧马人越野车车队冲破布罗莫晨雾沙海，午夜戴上面具深度挺进伊真，探秘旷世罕见的硫磺霓虹亮蓝异星火焰。",

  "Visit the famous dinosaur head Kelingking cliff edge, ride a high-speed catamaran, and walk down the spectacular Diamond Beach staircase.":
    "伫立在震慑寰宇的 Kelingking 霸王龙头断崖之巅，乘坐高速豪华全空调双筏帆船，踏上下到精灵钻石沙滩的刀削白崖天梯壁道。",

  // Durations
  "3 Days 2 Nights": "3天2晚 精品深度",
  "2 Days 1 Night": "2天1晚 极速超值",

  // Inclusions default
  "Luxury AC Cabin Pinisi Boat (3D2N)": "24小时全空调豪华双层皮尼西船舱住宿(3天2晚)",
  "Professional local diver guide & captain": "具备急救与高级执照的本地中文/英文双语潜水长、船长及水手",
  "National Park entrance fees & ranger fees": "科莫多大园区生态大门票及国家公园派驻护林员向导费",
  "All meals (Breakfast, Lunch, Dinner) onboard": "船上主厨每日烹饪早、中、晚三餐海洋生态健康餐",
  "Snorkeling gear & life jackets": "全套高压消杀进口浮潜防雾镜、呼吸管及专业浮力救生衣",
  "Airport or hotel pickup/drop-off": "往返机场或拉布安巴佐本岛酒店的豪华商务专车无缝接送",
  "AC Transport throughout Java tour (3 days)": "全行程专属高级越野或保姆商务车(配专业代驾、路桥油费全包)",
  "4x4 Private Jeep in Mount Bromo": "超酷私享复古 4x4 硬派越野切诺基/丰田清晨登山车队",
  "Local mountain guides for Bromo & Ijen": "持有外南梦外事局与林务署特许的高山登山总领队",
  "Entrance fees for Bromo and Ijen National Parks": "布罗莫和伊真火山口地质大公园门票与进山许可税",
  "1 Night at Bromo mountain lodge, 1 Night at Banyuwangi hotel": "1晚布罗莫星空山脊度假屋 ➕ 1晚外南梦法式生态庄园精选酒店",
  "Gas masks for Mt. Ijen sulfuric fumes": "提供安全等级符合防尘滤毒标准的活性炭防酸雾防毒面具与头灯",
  "Daily mineral water and breakfast": "高山露营和探险期间的主厨特制元气早餐和全天无限量优质矿泉水",
  "Round-trip Fast Boat tickets from Sanur to Nusa Penida": "往返巴厘岛沙努尔沙滩码头至佩尼达航道的官方豪华飞艇高速客票",
  "Private AC car & driver in Nusa Penida": "佩尼达岛上全天专属空调越野商务座驾及中文熟路老司机",
  "Entrance fees and island parking permits": "包含全岛各主要断崖路网大门票、拍照费、环保税和停车手续",
  "Snorkeling excursion (Manta Bay, Crystal Bay, Gamat Bay)": "私人定制快艇浮潜，巡航三大海湾（魔鬼鱼湾、水晶湾、加马特湾）",
  "1 Night stay at a tropical boutique hotel with pool": "1晚精选佩尼达椰林星空泳池轻奢度假美墅",
  "Breakfast & 2x Local lunches": "包含庄园有机早餐和两天分段美味餐车地道特色风味午餐",

  // Exclusions default
  "Flights to/from Labuan Bajo (LBJ)": "全网往返拉布安巴佐(LBJ)机场之国内或国际中转大交通机票",
  "Personal travel insurance": "旅客个人出国旅行高风险户外活动综合险 (强烈建议自行出单)",
  "Alcoholic beverages & personal souvenir shopping": "行程外的软饮、鸡尾酒、烈酒消费、特色手工艺品及个人纪念品盲盒买单",
  "Tipping for boat crew and guide": "给与船务大副、贴心厨工及登山向导之自由意愿小费",
  "Lunch and Dinner meals": "不含每日自由活动期间的经典正餐，可在司导推荐下按个人喜好探索品尝",
  "Horse riding fees in Bromo": "布罗莫黑沙海至主火山口阶梯底部间的乘马体验费 (可步行前往)",
  "Flights or trains to Surabaya/Malang": "出发点往返泗水机场(SUB) or 玛琅车站的往返机票与动车客票",
  "Tips for guides and drivers": "出于自愿原则支付给当地勤劳工作师傅之小费奖励表彰",
  "Personal shopping & tips": "自由购物开销、自买伴手礼特产及自付给快艇船员的小费",
  "Hotel pickup in mainland Bali (optional add-on)": "巴厘岛本岛偏远酒店到 Sanur 港口码头的往返拼车（可提供加购）",

  // Itinerary titles / descriptions
  "Kelor Island Trekking & Kalong Bat Sunset": "克洛岛探险徒步 & 巨蝠蔽日夕阳奇观",
  "Arrive at Labuan Bajo Airport. Meet our guide and transfer to the harbor. Board our Pinisi boat, enjoy welcome drinks, and start sailing. First stop is Kelor Island for a short uphill trek with panoramic ocean views. Snorkeling at Manjarite. Anchor next to Kalong Island to witness thousands of giant flying foxes fill the spectacular sunset sky.":
    "降落于 Labuan Bajo 机场。与我司金牌领队会合转运至深水自由码头。登临气派船宿皮尼西，来上一杯特色迎宾红茶。开航首站：克洛小岛，徒步轻登岩山俯视双月湾蓝透海域。紧接着在 Manjarite 进行沉浸式珊瑚野趣浮潜。黄昏时分泊锚于飞蝠岛旁，叹观万千巨型飞狐在橘色残阳中腾空蔽日的史诗画卷。",
  
  "Airport Meetup & Guided Harbor Transfer": "机场贵宾接机 & 专车私家码头平开对接",
  "Trekking Kelor Island & Ocean Lookout": "登临克洛群岛，登顶俯瞰科莫多环海经典双弧线海湾",
  "Snorkeling at pristine Manjarite reef": "在极高水清之 Manjarite 生态保育红珊瑚海床与群鱼逐舞",
  "Kalong Island sunset bat migration watching": "在卡龙岛锚地静候十万巨蝠破空而出的绝美黄昏交响乐",

  "Padar Island Hike, Pink Beach & Komodo Dragon Hunt": "帕达尔震撼三色海滩摄影 & 梦幻粉红沙滩 & 实地探险科莫多巨蜥",
  "Early morning hike to the summit of Padar Island for the legendary three-bay panoramic photo. Continue to Pink Beach for swimming and relaxing. Sail to Rinca Island/Komodo Island for a guided trek with rangers to observe Komodo dragons in their natural habitat. Head over to Manta Point for an unforgettable swim with wild manta rays.":
    "朝霞初露，起航并登顶帕达尔，打卡全科莫多最为震撼、被誉为一生必看一次的三半岛粉白黑三色海湾交融奇观。后泊舟粉海滩，触摸自然碎红珊瑚，纵享碧水微澜之惬意。午后转向科莫多大岛，在园区长枪林长看顾下与存活至今的猛兽科莫多龙安全同框。最后深入魔鬼鱼湾，在起伏潮汐中与温和沉稳的暗海巨蝠贴身同潜。",
  
  "Summit Sunrise Hike up Padar Island": "清晨黄金日出登顶世界地理奇迹帕达尔岛悬崖台阶",
  "Lounge and swim at the unique Pink Beach": "游弋沐浴在纯天然的梦幻粉红色微细沙滩清冽海水中",
  "Ranger-guided search for Komodo Dragons": "在科莫多护林员带哨防身引路下搜寻地球末代恐龙巨蜥",
  "Snorkeling safari with Mantas at Manta Point": "在深洋魔鬼鱼汇集点跟高贵滑翔的巨型鳐鱼在清流中同游",

  "Kanawa Island Relaxation & Airport Return": "卡纳瓦纯白沙滩漫步 ＆ 丰盛主厨午餐 ＆ 带着不舍与回忆离港",
  "Savor local breakfast on deck, then sail to Kanawa Island, a private paradise with white sandy beaches and an active house reef overflowing with vibrant marine life. After a final lunch onboard, transfer back to Labuan Bajo Harbor and proceed to the airport for your flight home.":
    "在凉快微风的甲板上品尝主厨风味小点，随后帆船横越至私属卡纳瓦岛。该岛岸边珊瑚保存度极高，海水浅露，下水即是色彩纷呈的庞大热带鱼群。享用完海鲜告别大餐后，转陆路私家商务客车，将您妥协投递至机场，协助帮办托运结束完美船宿航程。",
  
  "Breakfast on deck and Kanawa island sailing": "甲板晨光精致海景早餐 ＆ 扬帆卡纳瓦珊瑚极乐地",
  "House reef marine snorkeling safari": "海浪退潮期在岸边极好的珊瑚保育区与小丑鱼魔鬼鱼玩乐",
  "Airport drops and guest departures": "专车送至拉布安巴佐机场协助帮办托运告别启程",

  // Trip 2 Itinerary
  "Pick up from Surabaya & Bromo Mountain Check-in": "泗水接机 ＆ 壮景穿越 ＆ 布罗莫火山边缘山脊度假屋入住",
  "Pick up from Surabaya Airport/Train Station. Enjoy a private scenic 4-hour drive to Cemoro Lawang village. Check into your cozy room sitting directly on the rim of the Tengger Caldera. Feel the crisp mountain air and rest early for the pre-dawn expedition.":
    "从泗水机场或客运枢纽专车接驾。舒享四个小时的爪哇乡村私享观光风景车程前往著名的塞莫罗拉望云中秘境村。下榻直面巨型火山卡尔德拉坑口第一排的景观房。深吸一股清新冷峻的高地富氧空气，享用完高山晚餐后早早休息，为凌晨的火山清晨远行做好充足能量储备。",

  "Surabaya airport pickup & meet private driver": "泗水国际机场接机会客 & 认识专享司导安全员",
  "Check-in at mountain caldera overlook lodge": "下榻悬挂入海的布罗莫巨型火山盆地最前线景观山脊屋",

  "Bromo Sunrise, Crater Trek & Banyuwangi Drive": "布罗莫壮阔星空银河日出 & 近距离火山口探奇 ＆ 外南梦田园漫行",
  "Wake up at 3:00 AM. Board your private 4x4 Jeep to Penanjakan viewpoint to witness the world-famous sunrise over Mt. Bromo, Mt. Batok, and Mt. Semeru. Afterward, cross the dramatic Whispering Sand and hike 250 steps to Bromo's active crater rim. Return, check out, and take a 6-hour scenic drive to Banyuwangi.":
    "拂晓凌晨 3:00。坐上拉风狂野的专属 4x4 钢制越野吉普一跃重上 Penanjakan 绝佳观景之巅，屏气叹凝布罗莫、巴托克与远方赛美鲁火山喷吐巨烟交错在紫金星海日出中的盖世景观。随后狂飙越过漫天细沙的“低语沙海”，登梯 250 级亲临咆哮冒烟的布罗莫活火山口边缘听地核呼吸。洗漱回房办理离开，驾乘舒爽专车纵览东爪哇原生态田野奔往外南梦。",

  "Board 4x4 Offroad Jeep to sunrise overlook": "乘坐高底盘硬核 4x4 吉普征服火山沙原重上黄金观日台",
  "Volcanic crater rim hike & Whispering Sand crossing": "清晨横渡沙滩，登上主峰天梯攀上咆哮冒烟的火口边缘",
  "Checkout and transfer drive to Banyuwangi": "返回用膳、洗热水澡 checkout 本地公路网穿越外南梦",

  "Ijen Midnight Hike, Blue Flame Experience & Bali Ferry Transfer": "伊真夜半行军 & 亲见亮霓虹蓝火奇迹 & 轮渡过海直达巴厘岛",
  "Start at 1:00 AM. Hike 2 hours up Mount Ijen. Descent safely into the crater alongside sulfur miners to see the stunning Neon Blue Acid Flames of Ijen. Walk around the giant turquoise acidic lake at sunrise. Return to base for breakfast, then transfer to Banyuwangi harbor or catch a ferry to Bali.":
    "繁星密布的凌晨 1:00 精英出发，背氧气面罩，手提电光照明电钻。在向导的指引和探明下，用两个小时跨过重重林海攀上伊真圣山。紧接沿崎岖滑坡缓步向下直插伊真蓝金锅底，在背筐矿工身边，屏息见证那股由地下压喷射而出的科幻霓虹神秘火海。日出东方，卡尔德拉盆内万顷剧毒绿松色酸湖展现致命美感。用完撤离早餐，您可在港口乘坐专车轮渡快速过渡直通巴厘岛。",

  "Midnight departure and trek up Mt. Ijen summit": "午夜带头灯启步，夜登高地密林野地沙土碎石路征服山顶",
  "Sulfur crater descent & glowing blue fire viewing": "戴上供氧防酸面罩下到硫磺深崖，静触珍稀霓虹冰蓝火海",
  "Sunrise view over toxic acid green lake": "沐浴清晨阳光拍摄惊摄眼球的巨大奶绿色剧毒强酸性湖泊",
  "Breakfast checkout & ferry transfer drop-off": "返回用早餐修整，前往外南梦码头坐豪华渡轮安全送抵巴厘航道",

  // Trip 3 Itinerary
  "Fast Boat Cruise & West Penida Expedition": "高速快艇跨洋 ＆ 佩尼达西线野性史诗风光",
  "Gather at Sanur beach harbor. Cross to Nusa Penida on a fast catamaran. Hop onto your private car to visit the legendary Kelingking Cliff (T-Rex ocean overlook), Broken Beach volcanic arch, and Angel's Billabong emerald infinity tide pool. Rest up in your Penida resort.":
    "早上于 Sanur 沙滩客运港口会师领票。登上全天候气垫高速巨型游艇，约45分钟劈波斩浪横渡印度洋。下码头后无缝跳转上空调越野专车，首奔轰动全球社交网络的 Kelingking 霸王龙怪崖听海潮怒吼。接着去到 Broken Beach 的火山天坑拱桥和不远处的 Angel's Billabong 天然翡翠无边潮汐池，最后悠游入驻您的海岛泳池精选庄园。",

  "Sanur beach harbor checkout boarding": "沙努尔海岸港口换票安检上船跨洋启航",
  "Cliff side photography at Kelingking dinosaur head": "打卡标志性震撼悬崖霸王龙海角断崖最前沿全方位摄像点",
  "Tide pools exploring at Angel's Billabong": "打卡上帝留在凡间的无边果冻浅池——天使浴池和海蚀破碎桥",

  "Snorkeling Safari, Diamond Beach & Fast Boat to Bali": "豪华游艇惊异浮潜 & 钻石天梯沙滩 & 乘风归返巴厘本岛",
  "Start the day Snorkeling from our custom boat with guides to look for Mantas at Manta Bay. Then visit the spectacular pristine sandy staircase of Diamond Beach and Tree House overlook. Cross back to Sanur beach Bali in the afternoon.":
    "清晨，跟指导一起，跳上浮潜特制木舟开进著名的 Manta 湾，与身覆暗金色云纹的野生魔鬼鱼温顺共泳。随后驱车游览令人窒息的 Diamond Beach “钻石沙滩”，踏上凿刻在坚硬白崖上的笔直巨型峭壁岩梯下海逐浪。午后在风浪渐起前踏上快艇，怀揣一整天的阳光与快慰乘风踏浪退返巴厘本岛沙努尔。",

  "Ocean snorkeling for marine life and wild mantas": "出海寻踪海洋温顺大物魔鬼鱼及在水晶保护区探访热带游鱼",
  "Trekking down pristine Diamond beach staircase": "踩着垂直悬崖雕凿的梦幻台阶下到绝美钻石白色沙岩港湾",
  "Fast catamaran sailing and back to mainland Bali": "豪华跨海飞艇快速返航巴厘岛Sanur港口回程"
};

export const LanguageCurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem("sj_lang") as Language) || "en";
  });

  const [currency, setCurrencyState] = useState<Currency>(() => {
    // Tombol mata uang Dolar ($) dan Yen/Yuan (¥) sementara dimatikan (jangan dihapus)
    if (!ENABLE_FOREIGN_CURRENCIES) {
      try { localStorage.setItem("sj_currency", "IDR"); } catch (e) {}
      return "IDR";
    }
    return (localStorage.getItem("sj_currency") as Currency) || "IDR";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("sj_lang", lang);
  };

  const setCurrency = (curr: Currency) => {
    // Jika mata uang asing dimatikan, cegah perubahan ke USD atau CNY
    if (!ENABLE_FOREIGN_CURRENCIES && curr !== "IDR") {
      return;
    }
    setCurrencyState(curr);
    localStorage.setItem("sj_currency", curr);
  };

  // Safe client translation translator
  const t = (key: string, params?: Record<string, string | number>): string => {
    if (!key) return "";
    const cleanKey = key.trim();
    
    // 1. Primary: Use structured hierarchical translator
    const translated = translateKey(cleanKey, language, params);
    if (translated && translated !== cleanKey) {
      return translated;
    }

    // 2. Check main static dictionary
    if (dictionary[cleanKey]) {
      const val = dictionary[cleanKey][language];
      if (val) return val;
      if (language === "id") return dictionary[cleanKey]["id"] || cleanKey;
      return dictionary[cleanKey]["en"] || key;
    }

    // 3. Secondary deep dynamic lookup (such as backend database content)
    if (language === "zh" && dynamicDatabaseZH[cleanKey]) {
      return dynamicDatabaseZH[cleanKey];
    }

    // 4. Try case-insensitive matching if direct match fails
    const matchKey = Object.keys(dictionary).find(
      (k) => k.toLowerCase() === cleanKey.toLowerCase()
    );
    if (matchKey) {
      const val = dictionary[matchKey][language];
      if (val) return val;
    }

    // 5. Dynamic checks for partial sentences in Chinese
    if (language === "zh") {
      let result = cleanKey;
      for (const [enStr, transObj] of Object.entries(dictionary)) {
        if (result.includes(enStr) && transObj.zh) {
          result = result.replaceAll(enStr, transObj.zh);
        }
      }
      for (const [enStr, zhStr] of Object.entries(dynamicDatabaseZH)) {
        if (result.includes(enStr)) {
          result = result.replaceAll(enStr, zhStr);
        }
      }
      if (result !== cleanKey) return result;
    }

    // 6. Safe fallback for untranslated internal navigation/badge/footer keys
    if (/^nav\..*subtitle/i.test(cleanKey) || /\.subtitle$/i.test(cleanKey)) {
      return "";
    }
    if (/^nav\.newbadge$/i.test(cleanKey) || cleanKey.toUpperCase() === "NAV.NEWBADGE") {
      return language === "zh" ? "最新" : language === "id" ? "BARU" : "NEW";
    }
    if (/^footer\.services/i.test(cleanKey) || cleanKey.toUpperCase() === "FOOTER.SERVICESTITLE") {
      return language === "zh" ? "特色服务" : language === "id" ? "Layanan" : "Services";
    }
    if (/^footer\.contact/i.test(cleanKey) || cleanKey.toUpperCase() === "FOOTER.CONTACTTITLE") {
      return language === "zh" ? "联系我们" : language === "id" ? "Kontak" : "Contact";
    }
    if (/^footer\.partnership/i.test(cleanKey)) {
      return language === "zh" ? "B2B 商务合作" : language === "id" ? "Kemitraan B2B" : "B2B Partnerships";
    }
    if (/^footer\.secure/i.test(cleanKey)) {
      return language === "zh" ? "100% 安全可靠" : language === "id" ? "100% AMAN & TERPERCAYA" : "100% SECURE & TRUSTED";
    }
    if (/^footer\.licensed/i.test(cleanKey)) {
      return language === "zh" ? "正规客运营运资质" : language === "id" ? "IZIN ANGKUTAN RESMI" : "OFFICIAL TRANSPORT LICENSE";
    }
    if (/^footer\.about/i.test(cleanKey)) {
      return language === "zh"
        ? "Smart Journey 慧捷之旅是 PT Sawah Jaya Trans 旗下正规持牌旅游出行品牌。专注布罗莫与宜珍火山生态游、商务包车及全天候机场接送，覆盖印尼东爪哇与巴厘岛。"
        : language === "id"
        ? "Smart Journey adalah operator tur dan penyedia transportasi berizin resmi di bawah PT Sawah Jaya Trans. Melayani wisata gunung berapi Bromo & Ijen, sewa mobil, dan transfer bandara di Jawa Timur & Bali."
        : "Smart Journey is an officially licensed travel and transportation operator under PT Sawah Jaya Trans. Specializing in Mount Bromo and Ijen Crater volcanic tours, private car rentals, and 24/7 airport transfers across East Java and Bali.";
    }
    if (/^footer\.official/i.test(cleanKey)) {
      return language === "zh" ? "正规持牌旅行与车队运营商" : language === "id" ? "Operator Perjalanan Berizin Resmi" : "Official Licensed Travel Operator";
    }

    return cleanKey;
  };

  const getTour = (tour: Tour): Tour => {
    return getLocalizedTour(tour, language);
  };

  const getVehicle = (vehicle: Vehicle): Vehicle => {
    return getLocalizedVehicle(vehicle, language);
  };

  const getFaqs = () => {
    return getLocalizedFAQs(language);
  };

  const getCity = (city: string): string => {
    return getLocalizedCity(city, language);
  };

  const getAirport = (code: string): string => {
    return getLocalizedAirport(code, language);
  };

  // Convert USD to native currency and format beautiful outputs safely
  const formatPrice = (priceUSD: number): string => {
    return formatCurrencyAmount(priceUSD, currency);
  };

  // Update document language attribute dynamically when language changes
  useEffect(() => {
    const htmlLang = language === 'zh' ? 'zh-CN' : language === 'id' ? 'id' : 'en';
    document.documentElement.lang = htmlLang;
    document.body.classList.remove('lang-id', 'lang-en', 'lang-zh');
    document.body.classList.add(`lang-${language}`);
  }, [language]);

  return (
    <LanguageCurrencyContext.Provider value={{ 
      language, 
      setLanguage, 
      currency, 
      setCurrency, 
      t, 
      formatPrice,
      getTour,
      getVehicle,
      getFaqs,
      getCity,
      getAirport,
      getHeroSlides: () => getLocalizedHeroSlides(language),
      getWhyUs: () => getLocalizedWhyUs(language),
      getDestinations: () => getLocalizedDestinations(language),
    }}>
      {children}
    </LanguageCurrencyContext.Provider>
  );
};

export const useLanguageCurrency = () => {
  const context = useContext(LanguageCurrencyContext);
  if (context === undefined) {
    throw new Error("useLanguageCurrency must be used within a LanguageCurrencyProvider");
  }
  return context;
};
