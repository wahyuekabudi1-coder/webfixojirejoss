import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Star, 
  Heart, 
  Handshake, 
  MapPin, 
  Mail, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  PhoneCall, 
  Compass, 
  Map, 
  CheckCircle2, 
  Plus, 
  Minus,
  Sparkles,
  Car,
  BookOpen,
  Search,
  Calendar,
  User,
  Tag,
  ArrowRight,
  ExternalLink,
  X,
  Share2
} from 'lucide-react';
import { BLOG_POSTS, BlogPost } from '../blogData';
import Breadcrumbs from '../components/Breadcrumbs';
import SocialMediaButtons from '../components/SocialMediaButtons';
import ServiceAreaMap from '../components/ServiceAreaMap';

interface StatCardProps {
  key?: React.Key;
  target: number;
  suffix: string;
  label: string;
  sublabel: string;
}

function StatCard({ target, suffix, label, sublabel }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  const startAnimation = () => {
    const duration = 800; 
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = progress * (2 - progress);
      const currentVal = Math.floor(easeProgress * target);
      
      setDisplayValue(currentVal);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  useEffect(() => {
    startAnimation();
  }, [target]);

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <div 
      className="p-6 bg-slate-900/80 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between items-center text-center group cursor-pointer shadow-lg shadow-black/20"
      onMouseEnter={startAnimation}
    >
      <div className="text-3xl sm:text-4xl font-black text-amber-500 tracking-tight font-mono">
        {formatNumber(displayValue)}{suffix}
      </div>
      <div className="space-y-1 mt-3 w-full">
        <div className="text-xs text-white uppercase tracking-wider font-extrabold font-mono">
          {label}
        </div>
        <div className="text-[11px] text-slate-400 font-medium leading-snug">
          {sublabel}
        </div>
      </div>
    </div>
  );
}

export default function AboutView() {
  const { setPage } = useApp();
  
  // Interactive FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  
  // State for Blog and Articles
  const [blogSearch, setBlogSearch] = useState('');
  const [selectedDest, setSelectedDest] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activePost, setActivePost] = useState<BlogPost | null>(null);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);
  const [dialogTab, setDialogTab] = useState<'read' | 'info' | 'gallery' | 'faq'>('read');
  
  // State for dynamic background/office image (.png or .jpg)
  const [aboutBgSrc, setAboutBgSrc] = useState<string>('/office.png');
  
  // State for dynamic team background image (.jpg or .png)
  const [teamBgSrc, setTeamBgSrc] = useState<string>('/team.jpg');

  // State for dynamic cabin background image (.jpg or .png)
  const [cabinBgSrc, setCabinBgSrc] = useState<string>('/cabin.jpg');

  // State for custom service area map image (.png or .jpg or fallback)
  const [serviceAreaSrc, setServiceAreaSrc] = useState<string | null>(null);

  useEffect(() => {
    // Attempt to load /service-area.png first
    const imgPng = new Image();
    imgPng.src = '/service-area.png';
    imgPng.onload = () => {
      setServiceAreaSrc('/service-area.png');
    };
    imgPng.onerror = () => {
      // Fallback: Attempt to load /service-area.jpg if png isn't found
      const imgJpg = new Image();
      imgJpg.src = '/service-area.jpg';
      imgJpg.onload = () => {
        setServiceAreaSrc('/service-area.jpg');
      };
      imgJpg.onerror = () => {
        // Fallback: Attempt to load /service-area.jpeg
        const imgJpeg = new Image();
        imgJpeg.src = '/service-area.jpeg';
        imgJpeg.onload = () => {
          setServiceAreaSrc('/service-area.jpeg');
        };
        imgJpeg.onerror = () => {
          setServiceAreaSrc(null); // Keep as null so it falls back to the original professional tech dashed map
        };
      };
    };
  }, []);

  // FAQ Data matching the screen perfectly
  const FAQ_DATA = [
    {
      question: "How do I book a service?",
      answer: "Anda dapat dengan mudah memesan secara online melalui formulir beranda kami atau langsung menghubungi asisten perjalanan kami melalui WhatsApp hotline 24 jam. Kami akan memandu Anda dalam merencanakan rute kustom dan melakukan konfirmasi instan."
    },
    {
      question: "Can I pay later?",
      answer: "Ya! Kami menawarkan kebijakan pembayaran fleksibel. Anda dapat membayar deposit kecil untuk mengamankan armada Anda dan melunasi sisanya secara tunai atau transfer bank langsung saat perjalanan dimulai (pay-on-arrival)."
    },
    {
      question: "Do you provide English-speaking drivers?",
      answer: "Tentu saja. Kami memiliki tim pengemudi bersertifikat pariwisata yang terlatih secara profesional, ramah, dan fasih berbahasa Inggris untuk mempermudah komunikasi selama perjalanan dinas atau wisata Anda."
    },
    {
      question: "Is airport pickup available at night?",
      answer: "Ya, layanan antar-jemput bandara kami beroperasi penuh 24 jam sehari. Pengemudi kami akan memantau nomor penerbangan Anda secara real-time dan akan selalu siap menyambut Anda di terminal kedatangan tepat waktu."
    }
  ];

  // Vehicles Data matching the visual cards in the layout
  const VEHICLES_DATA = [
    {
      name: "Innova Reborn",
      image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=500&q=80",
      description: "Pilihan favorit keluarga dengan kenyamanan suspensi ekstra empuk, AC double blower, dan kabin senyap."
    },
    {
      name: "Hiace Commuter",
      image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=500&q=80",
      description: "Ideal untuk rombongan wisata menengah hingga 15 penumpang dengan jok ergonomis dan ruang kaki yang lapang."
    },
    {
      name: "Avanza",
      image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=500&q=80",
      description: "Kendaraan MPV lincah yang sangat andal, hemat bahan bakar, dan sempurna untuk mobilitas harian dalam kota."
    },
    {
      name: "Elf Long",
      image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=500&q=80",
      description: "Minibus berkapasitas besar hingga 19 orang, dilengkapi dengan sasis kokoh untuk perjalanan jarak jauh."
    }
  ];

  // Commitment Cards data
  const COMMITMENT_DATA = [
    {
      title: "⏰ On-Time Commitment",
      desc: "Kami berkomitmen untuk selalu tepat waktu.",
      icon: <Clock className="h-6 w-6 text-amber-500" />
    },
    {
      title: "🚘 Well-Maintained Vehicles",
      desc: "Armada bersih, nyaman, dan dirawat secara berkala.",
      icon: <Car className="h-6 w-6 text-amber-500" />
    },
    {
      title: "🛡️ Safety First",
      desc: "Keamanan Anda adalah prioritas utama kami di setiap rute.",
      icon: <Shield className="h-6 w-6 text-amber-500" />
    },
    {
      title: "⭐ Quality Service",
      desc: "We deliver the best service, every time.",
      icon: <Star className="h-6 w-6 text-amber-500" />
    },
    {
      title: "🤝 Honest & Transparent",
      desc: "Clear pricing and no hidden fees.",
      icon: <Handshake className="h-6 w-6 text-amber-500" />
    },
    {
      title: "❤️ Customer Focused",
      desc: "Kepuasan Anda adalah bukti kesuksesan pelayanan kami.",
      icon: <Heart className="h-6 w-6 text-amber-500" />
    }
  ];

  // Track Record stats based on actual project tour and review data
  const STATS_DATA = [
    { target: 849, suffix: "+", label: "Reviews", sublabel: "Ulasan Terverifikasi" },
    { target: 7, suffix: "", label: "Packages", sublabel: "Paket Tur Unggulan" },
    { target: 4, suffix: "", label: "Fleets", sublabel: "Kelas Armada" },
    { target: 100, suffix: "%", label: "Transparent", sublabel: "Garansi Tanpa Biaya Tersembunyi" }
  ];

  // Filtered Blog Posts
  const filteredPosts = BLOG_POSTS.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(blogSearch.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(blogSearch.toLowerCase()) ||
      post.destination.toLowerCase().includes(blogSearch.toLowerCase()) ||
      post.keywords.some(k => k.toLowerCase().includes(blogSearch.toLowerCase()));
      
    const matchesDest = selectedDest === 'All' || post.destination === selectedDest;
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    
    return matchesSearch && matchesDest && matchesCategory;
  });

  const destinationsList = [
    'All', 
    'Mount Bromo', 
    'Tumpak Sewu', 
    'Ijen Crater', 
    'Surabaya', 
    'Malang', 
    'Banyuwangi', 
    'Bali', 
    'Ubud', 
    'Uluwatu', 
    'Lovina', 
    'Nusa Penida', 
    'Karangasem'
  ];
  const categoriesList = ['All', 'Adventure', 'Nature', 'Culture', 'City'];

  const handleContactScroll = () => {
    document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div id="about-view" className="bg-slate-50 text-slate-900 min-h-screen pt-20">
      <Breadcrumbs items={[{ label: 'About Smart Journey' }]} />

      {/* 1. HERO BANNER - ABOUT SMARTJOURNEY */}
      <section className="relative py-24 md:py-32 bg-slate-950 text-white overflow-hidden border-b border-slate-900">
        {/* Ambient cosmic gradient lines */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent z-10" />
        
        {/* Background Image of Headquarters / Office (Supports /office.png, /office.jpg, /kantor.png, /about-bg.jpg) */}
        <div className="absolute inset-y-0 right-0 w-full md:w-1/2 pointer-events-none overflow-hidden opacity-45 md:opacity-85">
          <img 
            src={aboutBgSrc} 
            alt="Smart Journey Office & Headquarters" 
            className="w-full h-full object-cover"
            onError={() => {
              if (aboutBgSrc === '/office.png') {
                setAboutBgSrc('/office.jpg');
              } else if (aboutBgSrc === '/office.jpg') {
                setAboutBgSrc('/kantor.png');
              } else if (aboutBgSrc === '/kantor.png') {
                setAboutBgSrc('/about-bg.jpg');
              } else if (aboutBgSrc === '/about-bg.jpg') {
                setAboutBgSrc('/about-bg.png');
              } else {
                setAboutBgSrc('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80');
              }
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="max-w-2xl space-y-6">
            <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-400 font-extrabold uppercase tracking-widest font-mono text-[10px] sm:text-xs px-3.5 py-1.5 rounded-full border border-amber-500/20">
              <Sparkles className="h-3 w-3" />
              <span>Smart Journey Premier</span>
            </span>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none text-white uppercase">
              ABOUT <br />
              <span className="text-amber-500">SMART JOURNEY</span>
            </h1>
            <p className="text-sm sm:text-lg text-slate-300 leading-relaxed font-medium">
              Spesialis paket wisata Bromo, Ijen, Tumpak Sewu, serta layanan transportasi antar-jemput bandara resmi di Indonesia.
            </p>
            <div className="pt-4">
              <button
                onClick={handleContactScroll}
                className="bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black px-8 py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all shadow-xl shadow-amber-500/10 cursor-pointer"
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. OUR COMMITMENT */}
      <section className="py-20 bg-slate-50 border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-2xl sm:text-4.5xl font-black text-slate-950 tracking-tight leading-none">
              Our Commitment
            </h2>
            <div className="h-1 w-16 bg-amber-500 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {COMMITMENT_DATA.map((item, index) => (
              <div 
                key={index}
                className="bg-white p-8 rounded-3xl border border-slate-200/50 hover:border-amber-500/50 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center text-center space-y-4 group"
              >
                <div className="p-4 bg-amber-500/10 rounded-2xl group-hover:bg-amber-500 group-hover:text-slate-950 text-amber-600 transition-all duration-300">
                  {item.icon}
                </div>
                <h3 className="font-extrabold text-base text-slate-900 group-hover:text-amber-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PROVEN TRACK RECORD */}
      <section className="py-16 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 to-slate-900" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center space-y-2 mb-12">
            <span className="text-[10px] sm:text-xs text-amber-500 font-extrabold tracking-widest uppercase font-mono">
              Integritas &amp; Reputasi
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight uppercase">
              Proven Track Record
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-center">
            {STATS_DATA.map((stat, idx) => (
              <StatCard 
                key={idx}
                target={stat.target}
                suffix={stat.suffix}
                label={stat.label}
                sublabel={stat.sublabel}
              />
            ))}
          </div>

        </div>
      </section>

      {/* 5. OUR VEHICLES */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-2xl sm:text-4.5xl font-black text-slate-950 tracking-tight leading-none">
              Our Vehicles
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto font-semibold">
              Clean, comfortable, and ready for your journey.
            </p>
            <div className="h-1 w-16 bg-amber-500 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VEHICLES_DATA.map((car, idx) => (
              <div 
                key={idx}
                className="bg-slate-50 border border-slate-200/60 hover:border-amber-500/30 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col justify-between"
              >
                {/* Image panel */}
                <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                  <img
                    src={car.image}
                    alt={car.name}
                    className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent" />
                </div>
                {/* Content Panel */}
                <div className="p-6 space-y-2 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-950 tracking-tight">
                      {car.name}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1 font-semibold">
                      {car.description}
                    </p>
                  </div>
                  <div className="pt-4 flex items-center justify-between text-xs text-amber-600 font-bold border-t border-slate-200/50">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Sopir + BBM Termasuk</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 5.5 SEO BLOG & ARTIKEL PERJALANAN */}
      <section id="blog-and-articles" className="py-24 bg-slate-950 text-white relative overflow-hidden border-t border-b border-slate-900">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Section Header */}
          <div className="text-center space-y-4 mb-16">
            <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-400 font-extrabold uppercase tracking-widest font-mono text-[10px] sm:text-xs px-3.5 py-1.5 rounded-full border border-amber-500/20">
              <BookOpen className="h-3 w-3" />
              <span>Travel Inspiration &amp; SEO Blog</span>
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase leading-none">
              SmartJourney <span className="text-amber-500">Travel Blog</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl mx-auto font-semibold leading-relaxed">
              Explore our comprehensive, SEO-optimized travel guides. Find essential tips, suggested itineraries, and top local guides for <span className="text-white">Mount Bromo, Tumpak Sewu, Ijen Crater, Surabaya, Malang, Banyuwangi, Bali, Ubud, Uluwatu, Lovina, Nusa Penida, and Karangasem</span>.
            </p>
            <div className="h-1 w-16 bg-amber-500 mx-auto rounded-full" />
          </div>

          {/* Search and Filters Hub */}
          <div className="bg-slate-900/60 p-6 sm:p-8 rounded-3xl border border-slate-800/80 mb-12 space-y-6">
            
            {/* Search Input */}
            <div className="relative max-w-md mx-auto">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={blogSearch}
                onChange={(e) => setBlogSearch(e.target.value)}
                placeholder="Search articles, destinations, or keywords..."
                className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-white rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm placeholder-slate-500 outline-none transition-all"
              />
              {blogSearch && (
                <button 
                  onClick={() => setBlogSearch('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Destination filter chips */}
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest font-mono">Select Destination:</span>
              <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 no-scrollbar">
                {destinationsList.map((dest) => (
                  <button
                    key={dest}
                    onClick={() => setSelectedDest(dest)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      selectedDest === dest
                        ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/10 font-extrabold'
                        : 'bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {dest}
                  </button>
                ))}
              </div>
            </div>

            {/* Category filter chips */}
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest font-mono">Filter Category:</span>
              <div className="flex flex-wrap gap-2">
                {categoriesList.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-slate-950/40 border border-slate-850 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredPosts.map((post) => (
                <motion.article
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  key={post.id}
                  className="bg-slate-900/40 border border-slate-850 hover:border-amber-500/40 rounded-3xl overflow-hidden flex flex-col justify-between group transition-all duration-300 shadow-xl shadow-black/10 hover:shadow-black/20"
                >
                  <div>
                    {/* Featured Image Panel */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                      <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md text-[9px] font-mono font-extrabold text-amber-500 border border-slate-800 px-2.5 py-1 rounded-md uppercase tracking-wider">
                        {post.category}
                      </div>
                      <div className="absolute bottom-4 left-4 text-xs font-bold text-white flex items-center gap-1.5 bg-slate-950/50 backdrop-blur-sm px-2.5 py-1 rounded-md">
                        <MapPin className="h-3 w-3 text-amber-500 shrink-0" />
                        <span>{post.destination}</span>
                      </div>
                    </div>

                    {/* Meta info & Title */}
                    <div className="p-6 space-y-4">
                      <div className="flex items-center gap-4 text-[10px] text-slate-500 font-bold font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-600" />
                          {post.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-slate-600" />
                          {post.readTime}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-black text-white leading-snug group-hover:text-amber-400 transition-colors duration-300">
                        {post.title}
                      </h3>

                      <p className="text-xs text-slate-400 leading-relaxed font-semibold line-clamp-3">
                        {post.excerpt}
                      </p>

                      {/* SEO Tags drawer */}
                      <div className="pt-2 flex flex-wrap gap-1.5">
                        {post.keywords.slice(0, 3).map((keyword, index) => (
                          <span 
                            key={index} 
                            className="inline-flex items-center gap-1 bg-slate-950/80 border border-slate-850 px-2 py-0.5 rounded-md text-[9px] font-bold text-slate-400"
                          >
                            <Tag className="h-2.5 w-2.5 text-amber-500/60" />
                            {keyword}
                          </span>
                        ))}
                        {post.keywords.length > 3 && (
                          <span className="text-[9px] text-slate-500 font-bold self-center px-1">
                            +{post.keywords.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Read action footer */}
                  <div className="px-6 pb-6 pt-3 border-t border-slate-850/50 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-extrabold tracking-wide uppercase font-mono">
                      By {post.author}
                    </span>
                    <button
                      onClick={() => { setActivePost(post); setDialogTab('read'); }}
                      className="text-xs font-black text-amber-500 hover:text-amber-400 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>Read Article</span>
                      <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>

            {filteredPosts.length === 0 && (
              <div className="col-span-1 md:col-span-3 py-16 text-center bg-slate-900/20 border border-slate-850 rounded-3xl space-y-3">
                <p className="text-sm sm:text-base text-slate-400 font-semibold">
                  No articles matched your search criteria.
                </p>
                <button
                  onClick={() => { setBlogSearch(''); setSelectedDest('All'); setSelectedCategory('All'); }}
                  className="bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black px-6 py-2 rounded-xl text-[10px] sm:text-xs uppercase tracking-widest transition-all cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* DETAILED ARTICLE READER DIALOG */}
      <AnimatePresence>
        {activePost && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            
            {/* Dark Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActivePost(null)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Dialog Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-4xl bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl z-10 max-h-[90vh] flex flex-col text-white"
            >
              
              {/* Close Floating Trigger */}
              <button
                onClick={() => setActivePost(null)}
                className="absolute top-4 right-4 z-20 bg-slate-950/80 text-white hover:text-amber-500 p-2.5 rounded-full border border-slate-800/80 transition-colors shadow-lg cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              {/* Scrollable Container */}
              <div className="overflow-y-auto no-scrollbar flex-grow">
                
                {/* Huge Featured Image Header */}
                <div className="relative h-64 sm:h-96 w-full bg-slate-950">
                  <img
                    src={activePost.image}
                    alt={activePost.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
                  
                  {/* Category and location tags on image base */}
                  <div className="absolute bottom-6 left-6 right-6 space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-md">
                        {activePost.category}
                      </span>
                      <span className="bg-slate-950/80 backdrop-blur-md text-white font-bold text-[9px] uppercase tracking-wider px-3 py-1 rounded-md border border-slate-800 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-amber-500" />
                        {activePost.destination}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content Panel */}
                <div className="p-6 sm:p-10 space-y-6">
                  
                  {/* Publication metadata */}
                  <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400 font-bold font-mono border-b border-slate-800 pb-6">
                    <span className="flex items-center gap-1.5">
                      <User className="h-4 w-4 text-amber-500" />
                      {activePost.author}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-amber-500" />
                      {activePost.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-amber-500" />
                      {activePost.readTime}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        setCopiedPostId(activePost.id);
                        setTimeout(() => setCopiedPostId(null), 2000);
                      }}
                      className="ml-auto flex items-center gap-1 bg-slate-950 border border-slate-800 px-3 py-1 rounded-lg hover:text-amber-500 hover:border-amber-500/30 transition-all text-[11px] cursor-pointer"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      <span>{copiedPostId === activePost.id ? 'Link Copied!' : 'Share Article'}</span>
                    </button>
                  </div>

                  {/* Title */}
                  <h1 className="text-xl sm:text-3xl.5 md:text-4xl font-black text-white tracking-tight uppercase leading-tight border-l-4 border-amber-500 pl-4">
                    {activePost.title}
                  </h1>

                  {/* Excerpt Summary */}
                  <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-850">
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-semibold italic">
                      " {activePost.excerpt} "
                    </p>
                  </div>

                  {/* Tab Switcher */}
                  <div className="flex border-b border-slate-800 pb-px overflow-x-auto no-scrollbar gap-2 sm:gap-4">
                    <button
                      onClick={() => setDialogTab('read')}
                      className={`px-4 py-2 rounded-t-2xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                        dialogTab === 'read'
                          ? 'bg-slate-900 border-t-2 border-l border-r border-slate-800 border-t-amber-500 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <BookOpen className="h-4 w-4 text-amber-500" />
                      <span>📖 Read Article</span>
                    </button>
                    <button
                      onClick={() => setDialogTab('info')}
                      className={`px-4 py-2 rounded-t-2xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                        dialogTab === 'info'
                          ? 'bg-slate-900 border-t-2 border-l border-r border-slate-800 border-t-amber-500 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Compass className="h-4 w-4 text-amber-500" />
                      <span>🗺️ Travel Info</span>
                    </button>
                    <button
                      onClick={() => setDialogTab('gallery')}
                      className={`px-4 py-2 rounded-t-2xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                        dialogTab === 'gallery'
                          ? 'bg-slate-900 border-t-2 border-l border-r border-slate-800 border-t-amber-500 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Map className="h-4 w-4 text-amber-500" />
                      <span>📸 Photography</span>
                    </button>
                    <button
                      onClick={() => setDialogTab('faq')}
                      className={`px-4 py-2 rounded-t-2xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                        dialogTab === 'faq'
                          ? 'bg-slate-900 border-t-2 border-l border-r border-slate-800 border-t-amber-500 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Tag className="h-4 w-4 text-amber-500" />
                      <span>❓ Q&amp;A &amp; SEO</span>
                    </button>
                  </div>

                  {/* Tab Contents */}
                  <div className="pt-4 min-h-[300px]">
                    {dialogTab === 'read' && (
                      <div className="space-y-6">
                        {/* Introduction */}
                        {activePost.introduction && (
                          <div className="space-y-2">
                            <h3 className="text-xs font-extrabold text-amber-500 uppercase tracking-wider font-mono">Introduction</h3>
                            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-semibold">
                              {activePost.introduction}
                            </p>
                          </div>
                        )}

                        {/* History */}
                        {activePost.history && (
                          <div className="space-y-2 bg-slate-950/40 p-5 rounded-2xl border border-slate-850/80">
                            <h3 className="text-sm font-extrabold text-amber-500 uppercase tracking-wider font-mono flex items-center gap-2">
                              <BookOpen className="h-4 w-4 animate-pulse" />
                              <span>Historical Heritage</span>
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-semibold">
                              {activePost.history}
                            </p>
                          </div>
                        )}

                        {/* Content Sections */}
                        <div className="space-y-6 pt-4">
                          {activePost.content.map((sec, idx) => (
                            <div key={idx} className="space-y-3">
                              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight border-b border-slate-850 pb-2 flex items-center gap-2">
                                <span className="text-amber-500 font-mono text-xs font-black bg-amber-500/10 h-6 w-6 rounded-full flex items-center justify-center shrink-0">
                                  {idx + 1}
                                </span>
                                <span>{sec.sectionTitle}</span>
                              </h2>
                              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-semibold">
                                {sec.text}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Culture & Food */}
                        {(activePost.localCulture || activePost.foodToTry) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            {activePost.localCulture && (
                              <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-850/80 space-y-2">
                                <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider font-mono">Local Culture</h4>
                                <p className="text-xs sm:text-sm text-slate-400 font-semibold leading-relaxed">{activePost.localCulture}</p>
                              </div>
                            )}
                            {activePost.foodToTry && (
                              <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-850/80 space-y-2">
                                <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider font-mono">Culinary Specialties</h4>
                                <p className="text-xs sm:text-sm text-slate-400 font-semibold leading-relaxed">{activePost.foodToTry}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Conclusion */}
                        {activePost.conclusion && (
                          <div className="pt-4 border-t border-slate-800">
                            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-semibold italic">
                              {activePost.conclusion}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {dialogTab === 'info' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {/* Why Visit */}
                          {activePost.whyVisit && (
                            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-850/80 space-y-2">
                              <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider font-mono">Why Visit?</h4>
                              <p className="text-xs sm:text-sm text-slate-300 font-semibold leading-relaxed">{activePost.whyVisit}</p>
                            </div>
                          )}

                          {/* Best Time */}
                          {activePost.bestTimeToVisit && (
                            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-850/80 space-y-2">
                              <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider font-mono">Best Time To Visit</h4>
                              <p className="text-xs sm:text-sm text-slate-300 font-semibold leading-relaxed">{activePost.bestTimeToVisit}</p>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {/* Weather */}
                          {activePost.weather && (
                            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-850/80 space-y-2">
                              <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider font-mono">Weather &amp; Climate</h4>
                              <p className="text-xs sm:text-sm text-slate-300 font-semibold leading-relaxed">{activePost.weather}</p>
                            </div>
                          )}

                          {/* Transportation */}
                          {activePost.transportation && (
                            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-850/80 space-y-2">
                              <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider font-mono">Transportation &amp; Logistics</h4>
                              <p className="text-xs sm:text-sm text-slate-300 font-semibold leading-relaxed">{activePost.transportation}</p>
                            </div>
                          )}
                        </div>

                        {/* Suggested Itinerary */}
                        {activePost.suggestedItinerary && (
                          <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-850/80 space-y-4">
                            <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                              <Calendar className="h-4 w-4 text-amber-500" />
                              <span>Suggested Timeline &amp; Itinerary</span>
                            </h4>
                            <div className="border-l border-amber-500/30 pl-4 ml-2 space-y-4 text-xs sm:text-sm font-semibold">
                              {activePost.suggestedItinerary.split('. ').map((item, i) => {
                                if (!item.trim()) return null;
                                return (
                                  <div key={i} className="relative">
                                    <span className="absolute -left-6 top-1.5 h-3 w-3 rounded-full bg-amber-500 border-2 border-slate-900" />
                                    <p className="text-slate-300 leading-relaxed">{item.trim()}.</p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Travel Tips & Nearby */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {activePost.travelTips && (
                            <div className="bg-amber-500/5 p-5 rounded-2xl border border-amber-500/10 space-y-2">
                              <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1">
                                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                                <span>Essential Travel Tips</span>
                              </h4>
                              <p className="text-xs sm:text-sm text-slate-300 font-semibold leading-relaxed">{activePost.travelTips}</p>
                            </div>
                          )}
                          {activePost.nearbyAttractions && (
                            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-850/80 space-y-2">
                              <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider font-mono">Nearby Attractions</h4>
                              <p className="text-xs sm:text-sm text-slate-300 font-semibold leading-relaxed">{activePost.nearbyAttractions}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {dialogTab === 'gallery' && activePost.gallery && (
                      <div className="space-y-6">
                        <div className="space-y-2 text-center pb-2">
                          <h3 className="text-sm font-extrabold text-amber-500 uppercase tracking-wider font-mono">Destination Photographic Prompts</h3>
                          <p className="text-xs text-slate-400 max-w-xl mx-auto leading-relaxed">
                            Exquisite photographic composition rules generated for {activePost.destination} to guarantee stunning, authentic imagery free from mixed-up locations.
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {activePost.gallery.map((prompt, index) => (
                            <div key={index} className="bg-slate-950/80 p-5 rounded-2xl border border-slate-850 space-y-3 hover:border-amber-500/30 transition-all group">
                              <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
                                <span className="text-[10px] font-mono text-slate-500 font-black">FRAME #{index + 1}</span>
                                <span className="text-[9px] uppercase tracking-widest bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-black ml-auto">Photographer Prompt</span>
                              </div>
                              <p className="text-xs text-slate-300 font-mono italic leading-relaxed">
                                "{prompt}"
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {dialogTab === 'faq' && (
                      <div className="space-y-8">
                        {/* FAQ Accordions */}
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <h3 className="text-sm font-extrabold text-amber-500 uppercase tracking-wider font-mono">Frequently Asked Questions</h3>
                            <p className="text-xs text-slate-400">Essential travel answers for {activePost.destination}</p>
                          </div>
                          <div className="grid grid-cols-1 gap-3">
                            {activePost.faq && activePost.faq.map((item, index) => (
                              <div key={index} className="bg-slate-950/40 rounded-2xl border border-slate-850/80 overflow-hidden">
                                <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-950/60 transition-colors">
                                  <span className="text-xs sm:text-sm font-black text-white">{item.question}</span>
                                  <span className="text-amber-500 font-bold font-mono text-xs">Q&amp;A #{index + 1}</span>
                                </div>
                                <div className="px-4 pb-4 pt-1 border-t border-slate-900 bg-slate-950/20">
                                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-semibold">{item.answer}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* SEO Audit Panel */}
                        {activePost.seoRequirements && (
                          <div className="bg-slate-950 border border-amber-500/20 p-6 rounded-3xl space-y-4 shadow-xl">
                            <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
                              <Search className="h-4 w-4 text-amber-500 animate-pulse" />
                              <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider font-mono">SEO Audit &amp; Metadata Engine</h4>
                              <span className="text-[9px] font-mono font-extrabold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded ml-auto">PASSED</span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                              <div className="space-y-2">
                                <div>
                                  <span className="text-slate-500 block uppercase tracking-widest text-[10px]">URL Slug:</span>
                                  <span className="text-slate-300 font-bold">/{activePost.seoRequirements.slug}</span>
                                </div>
                                <div>
                                  <span className="text-slate-500 block uppercase tracking-widest text-[10px]">Primary Keyword:</span>
                                  <span className="text-amber-400 font-bold font-sans">"{activePost.seoRequirements.primaryKeyword}"</span>
                                </div>
                                <div>
                                  <span className="text-slate-500 block uppercase tracking-widest text-[10px]">Keyword Density:</span>
                                  <span className="text-slate-300 font-bold">{activePost.seoRequirements.keywordDensity || '1.8%'}</span>
                                </div>
                                <div>
                                  <span className="text-slate-500 block uppercase tracking-widest text-[10px]">Recommended Schema:</span>
                                  <span className="text-emerald-400 font-bold">{activePost.seoRequirements.schemaMarkupRecommendation}</span>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div>
                                  <span className="text-slate-500 block uppercase tracking-widest text-[10px]">Meta Title Tag:</span>
                                  <span className="text-slate-300 block font-sans font-semibold leading-relaxed border border-slate-900 p-2 rounded bg-slate-900/40">{activePost.seoRequirements.seoTitle}</span>
                                </div>
                                <div>
                                  <span className="text-slate-500 block uppercase tracking-widest text-[10px]">Meta Description Tag:</span>
                                  <span className="text-slate-400 block font-sans font-semibold leading-relaxed border border-slate-900 p-2 rounded bg-slate-900/40">{activePost.seoRequirements.metaDescription}</span>
                                </div>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-900 space-y-2 text-xs">
                              <span className="text-slate-500 block uppercase tracking-widest font-mono text-[10px]">Search Engine Header Structures (H2 &amp; H3):</span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px]">
                                <div className="space-y-1">
                                  <span className="text-amber-500/80 font-bold block">Target H2 Headings:</span>
                                  <ul className="list-disc pl-4 space-y-1 text-slate-400">
                                    {activePost.seoRequirements.h2 && activePost.seoRequirements.h2.map((h, i) => <li key={i}>{h}</li>)}
                                  </ul>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-amber-500/80 font-bold block">Target H3 Headings:</span>
                                  <ul className="list-disc pl-4 space-y-1 text-slate-400">
                                    {activePost.seoRequirements.h3 && activePost.seoRequirements.h3.map((h, i) => <li key={i}>{h}</li>)}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* SEO Keyword visualization list */}
                  <div className="border-t border-slate-800 pt-6 space-y-2">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest font-mono">Popular Related Keywords:</span>
                    <div className="flex flex-wrap gap-2">
                      {activePost.keywords.map((kw, i) => (
                        <span key={i} className="bg-slate-950/60 border border-slate-850 px-3 py-1 rounded-lg text-[10px] font-bold text-slate-400 flex items-center gap-1">
                          <Tag className="h-3 w-3 text-amber-500/60" />
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Conversion Tour Suggestion CTA Box */}
                  <div className="mt-8 bg-gradient-to-r from-slate-950 to-slate-900 border-2 border-amber-500/30 p-6 sm:p-8 rounded-3xl text-center space-y-4 shadow-xl">
                    <h3 className="text-base sm:text-lg.5 font-black text-white uppercase tracking-tight">
                      Ready to experience this destination firsthand?
                    </h3>
                    <p className="text-xs text-slate-400 max-w-xl mx-auto font-semibold leading-relaxed">
                      Book a premium transport service or customized tour package for <span className="text-white">{activePost.destination}</span> with SmartJourney. Our professional licensed English-speaking drivers are ready to take you safely and comfortably!
                    </p>
                    <div className="pt-2">
                      <a
                        href={`https://wa.me/6285212347289?text=Hello%20SmartJourney,%20I%20am%20interested%20in%20tours%2520and%20transfers%20to%20${encodeURIComponent(activePost.destination)}%20after%20reading%20your%20article%20"${encodeURIComponent(activePost.title)}".%20Can%20you%20provide%20rates%20and%20booking%20info?`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black px-6 py-3 rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-emerald-600/10"
                      >
                        <PhoneCall className="h-4 w-4 shrink-0" />
                        <span>Inquire via WhatsApp</span>
                      </a>
                    </div>
                  </div>

                </div>
              </div>

              {/* Fixed Footer info */}
              <div className="bg-slate-950 px-6 sm:px-10 py-4 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono font-bold">
                <span>© 2026 SmartJourney Travel Agency</span>
                <button
                  onClick={() => setActivePost(null)}
                  className="text-amber-500 hover:text-amber-400 cursor-pointer font-black"
                >
                  CLOSE READER
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. SERVICE AREA */}
      <section className="py-20 bg-slate-50 border-t border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 mb-14">
            <span className="text-xs font-mono uppercase tracking-widest font-black text-amber-600 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Interconnected Coverage
            </span>
            <h2 className="text-3xl sm:text-4.5xl font-black text-slate-950 tracking-tight leading-tight">
              Service Area &amp; Koridor Rute
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto font-medium">
              Jaringan operasional resmi Smart Journey menghubungkan kota-kota utama, gerbang bandara, stasiun, hingga pelabuhan penyeberangan di Jawa Timur dan Pulau Bali.
            </p>
            <div className="h-1 w-16 bg-amber-500 mx-auto rounded-full" />
          </div>

          {/* Professional Interactive Visual Map Component */}
          <ServiceAreaMap />

          {/* Key Strategic Hubs Bento Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 font-black">
                01
              </div>
              <h4 className="text-base font-black text-slate-950">Koridor Metropolitan &amp; Tol</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Surabaya, Mojokerto, Pasuruan, dan Malang dengan konektivitas via Tol Trans Jawa untuk perjalanan tepat waktu dari dan ke Bandara Juanda serta stasiun kereta.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-600 font-black">
                02
              </div>
              <h4 className="text-base font-black text-slate-950">Koridor Wisata Gunung &amp; Air Terjun</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Probolinggo, Lumajang (Tumpak Sewu), dan Banyuwangi (Kawah Ijen) dengan armada tangguh dan driver bersertifikat jalur pegunungan.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 font-black">
                03
              </div>
              <h4 className="text-base font-black text-slate-950">Koridor Pulau Dewata (Bali)</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Jembrana, Buleleng, Bangli, Gianyar (Ubud), Badung (Denpasar/Kuta/Airport DPS), hingga Klungkung (Nusa Penida Link) 24 jam non-stop.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 7. CONTACT INFORMATION */}
      <section id="contact-section" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-2xl sm:text-4.5xl font-black text-slate-950 tracking-tight leading-none">
              Contact Information
            </h2>
            <div className="h-1 w-16 bg-amber-500 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
            
            {/* Left Column: Direct info details */}
            <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
              
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200/60 hover:border-amber-500/30 transition-all duration-300">
                  <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl shrink-0">
                    <PhoneCall className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 font-mono">WhatsApp Hotlines</h4>
                    <a href="https://wa.me/6285212347289" target="_blank" rel="noopener noreferrer" className="text-sm sm:text-base font-black text-slate-900 hover:text-amber-600 transition-colors block mt-0.5">
                      +62 852-1234-7289 (Operator)
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200/60 hover:border-amber-500/30 transition-all duration-300">
                  <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 font-mono">Email Enquiry</h4>
                    <a href="mailto:sawahjayatrans@gmail.com" className="text-sm sm:text-base font-black text-slate-900 hover:text-amber-600 transition-colors block mt-0.5">
                      sawahjayatrans@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200/60 hover:border-amber-500/30 transition-all duration-300">
                  <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 font-mono">Address</h4>
                    <p className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
                      Jl. Puntadewa No. 192, Kel. Tumpang, Kec. Tumpang, Kabupaten Malang 65156
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200/60 hover:border-amber-500/30 transition-all duration-300">
                  <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 font-mono">Business Hours</h4>
                    <p className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
                      24/7 Available
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick dispatch note */}
              <div className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-2xl">
                <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                  <span className="text-amber-600 font-extrabold">Hubungi Kami Sekarang:</span> Tim operator penjemputan bandara dan koordinasi tur kami siaga setiap hari sepanjang waktu, termasuk pada hari libur nasional.
                </p>
              </div>

            </div>

            {/* Right Column: Stylized mock map representation with red pinpoint location marker */}
            <div className="lg:col-span-6 relative rounded-3xl overflow-hidden shadow-lg border border-slate-200 min-h-[300px]">
              {/* Using a beautifully stylized embedded maps iframe or standard mockup map for realistic representation */}
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126438.28548771344!2d112.63009594451006!3d-7.98189815049363!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd629a8397c1355%3A0x4027a7b411136b0!2sMalang%2C%20East%20Java!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid" 
                className="absolute inset-0 w-full h-full border-none grayscale-[20%] contrast-[110%]"
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              
              {/* Highlight Overlay Badge */}
              <div className="absolute top-4 left-4 bg-slate-950/90 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl border border-slate-800 backdrop-blur-sm shadow z-10 flex items-center gap-2">
                <span className="h-2.5 w-2.5 bg-red-500 rounded-full animate-pulse" />
                <span>Malang Headquarters</span>
              </div>
            </div>

          </div>

          {/* Official Social Media Channels (IG, TikTok, Rednote, LinkedIn) */}
          <div className="mt-14 pt-10 border-t border-slate-200/80">
            <div className="text-center max-w-xl mx-auto space-y-2 mb-6">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-600 font-extrabold bg-amber-500/10 px-3 py-1 rounded-full">
                Connect With Us
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Media Sosial Resmi
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Ikuti kanal resmi kami untuk dokumentasi perjalanan, tips wisata terkini, dan interaksi langsung.
              </p>
            </div>

            <div className="flex justify-center">
              <SocialMediaButtons size="lg" className="p-2 bg-slate-100/80 rounded-2xl border border-slate-200/60" />
            </div>
          </div>
        </div>
      </section>

      {/* 8. FREQUENTLY ASKED QUESTIONS */}
      <section className="py-20 bg-slate-50 border-t border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-2xl sm:text-4.5xl font-black text-slate-950 tracking-tight leading-none">
              Frequently Asked Questions
            </h2>
            <div className="h-1 w-16 bg-amber-500 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left side Accordion questions */}
            <div className="lg:col-span-7 space-y-4">
              {FAQ_DATA.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div 
                    key={index}
                    className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm transition-all duration-300 hover:border-amber-500/40"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full text-left p-5 flex items-center justify-between gap-4 font-black text-sm sm:text-base text-slate-950 cursor-pointer select-none"
                    >
                      <span>{faq.question}</span>
                      <span className="p-1 rounded-lg bg-slate-100 text-slate-600 transition-colors">
                        {isOpen ? <Minus className="h-4 w-4 text-amber-600" /> : <Plus className="h-4 w-4" />}
                      </span>
                    </button>
                    
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                        >
                          <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium border-t border-slate-100">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Right Side: Image of VIP Luxury Van interior */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl border border-slate-100 group">
                <img
                  src={cabinBgSrc}
                  alt="High quality leather captain seats inside luxury VIP van"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={() => {
                    if (cabinBgSrc === '/cabin.jpg') {
                      setCabinBgSrc('/cabin.png');
                    } else if (cabinBgSrc === '/cabin.png') {
                      setCabinBgSrc('https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=800&q=80');
                    }
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                  <span className="text-amber-400 font-mono text-[10px] font-bold uppercase tracking-widest">Premium Cabin Interior</span>
                  <p className="text-base sm:text-lg font-black tracking-tight">Kenyamanan VIP Berkelas</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
