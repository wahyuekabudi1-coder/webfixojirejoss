import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  Car, 
  Ship, 
  Plane, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Clock,
  ArrowUpRight,
  Compass,
  CornerDownRight
} from 'lucide-react';

interface CityPoint {
  id: string;
  name: string;
  region: 'east-java' | 'bali';
  type: 'hub' | 'transit' | 'destination';
  badge: string;
  x: number; // SVG X coordinate
  y: number; // SVG Y coordinate
  description: string;
  pickupPoints: string[];
  routes: string[];
}

const REGIONAL_HUBS: CityPoint[] = [
  // Jawa Timur
  {
    id: 'surabaya',
    name: 'Surabaya',
    region: 'east-java',
    type: 'hub',
    badge: 'Main Metro Hub',
    x: 230,
    y: 190,
    description: 'Pusat operasional transit Jawa Timur, melayani penjemputan Bandara Internasional Juanda & Stasiun Utama.',
    pickupPoints: ['Bandara Juanda (Terminal 1 & 2)', 'Stasiun Surabaya Gubeng & Pasar Turi', 'Seluruh Hotel & Kawasan Bisnis Kota'],
    routes: ['Surabaya → Bromo (Via Tol Paspro)', 'Surabaya → Malang (Via Tol Pandaan)', 'Surabaya → Banyuwangi & Bali']
  },
  {
    id: 'mojokerto',
    name: 'Mojokerto',
    region: 'east-java',
    type: 'transit',
    badge: 'Transit Gateway',
    x: 160,
    y: 230,
    description: 'Akses koridor barat Jawa Timur, kawasan cagar budaya Trowulan, dan gerbang tol Trans Jawa.',
    pickupPoints: ['Pintu Tol Mojokerto Barat / Timur', 'Stasiun Mojokerto', 'Area Perhotelan & Industri'],
    routes: ['Mojokerto → Surabaya Airport', 'Mojokerto → Malang / Batu']
  },
  {
    id: 'malang',
    name: 'Malang & Batu',
    region: 'east-java',
    type: 'hub',
    badge: 'Headquarters & Base',
    x: 215,
    y: 330,
    description: 'Kantor pusat Smart Journey, garasi armada utama, dan basis tur Bromo, Tumpak Sewu, serta Kota Batu.',
    pickupPoints: ['Kantor Pusat & Smart Garage Malang', 'Bandara Abdulrachman Saleh (MLG)', 'Stasiun Malang Kotabaru', 'Seluruh Resort & Hotel Kota Batu'],
    routes: ['Malang → Midnight Bromo Sunrise Tour', 'Malang → Tumpak Sewu Waterfall', 'Malang → Surabaya Airport Drop-off']
  },
  {
    id: 'probolinggo',
    name: 'Probolinggo',
    region: 'east-java',
    type: 'transit',
    badge: 'Bromo Corridor',
    x: 375,
    y: 255,
    description: 'Pintu gerbang utara Taman Nasional Bromo Tengger Semeru via Sukapura / Cemorolawang.',
    pickupPoints: ['Stasiun Probolinggo', 'Exit Tol Paspro', 'Rest Area Sukapura / Bromo Basecamp'],
    routes: ['Probolinggo → Bromo Crater', 'Probolinggo → Banyuwangi Ijen Crater']
  },
  {
    id: 'lumajang',
    name: 'Lumajang',
    region: 'east-java',
    type: 'destination',
    badge: 'Tumpak Sewu Base',
    x: 350,
    y: 360,
    description: 'Sentra wisata air terjun Tumpak Sewu, Goa Tetes, dan panorama megah Gunung Semeru.',
    pickupPoints: ['Entrance Gate Tumpak Sewu', 'Kawasan Pronojiwo', 'Terminal & Stasiun Klakah'],
    routes: ['Lumajang → Malang Overland', 'Lumajang → Banyuwangi Lintas Selatan']
  },
  {
    id: 'banyuwangi',
    name: 'Banyuwangi',
    region: 'east-java',
    type: 'hub',
    badge: 'Port & Ijen Gateway',
    x: 520,
    y: 310,
    description: 'Pusat eksplorasi Kawah Ijen Blue Fire, Taman Nasional Baluran, dan Pelabuhan Ferry Ketapang ke Bali.',
    pickupPoints: ['Pelabuhan Penyeberangan Ketapang', 'Bandara Banyuwangi (BWX)', 'Stasiun Banyuwangi Kota & Karangasem', 'Paltuding Ijen Basecamp'],
    routes: ['Banyuwangi → Midnight Ijen Blue Fire Tour', 'Banyuwangi → Bali Island Crossing (Gilimanuk)']
  },

  // Pulau Bali
  {
    id: 'jembrana',
    name: 'Gilimanuk (Jembrana)',
    region: 'bali',
    type: 'transit',
    badge: 'West Bali Port',
    x: 615,
    y: 295,
    description: 'Gerbang masuk penyeberangan Selat Bali ke Pulau Dewata dengan layanan transfer pelabuhan resmi.',
    pickupPoints: ['Dermaga Ferry Pelabuhan Gilimanuk', 'Taman Nasional Bali Barat', 'Jalur Lintas Gilimanuk - Denpasar'],
    routes: ['Gilimanuk → Denpasar / Kuta / Seminyak', 'Gilimanuk → Singaraja / Lovina']
  },
  {
    id: 'buleleng',
    name: 'Singaraja & Lovina',
    region: 'bali',
    type: 'destination',
    badge: 'North Bali Heritage',
    x: 710,
    y: 215,
    description: 'Wisata lumba-lumba Pantai Lovina, Danau Beratan Bedugul, dan rangkaian air terjun Bali Utara.',
    pickupPoints: ['Kawasan Pantai Lovina', 'Danau Buyan & Tamblingan', 'Bedugul Resort Area'],
    routes: ['Lovina → Ubud & Kintamani', 'Lovina → South Bali Airport']
  },
  {
    id: 'bangli',
    name: 'Kintamani & Bangli',
    region: 'bali',
    type: 'destination',
    badge: 'Highland & Volcano',
    x: 805,
    y: 255,
    description: 'Kawasan kaldera Gunung & Danau Batur, Desa Tradisional Penglipuran, dan Pura Besakih.',
    pickupPoints: ['Kintamani Crater Viewpoints', 'Desa Wisata Penglipuran', 'Pura Besakih Area'],
    routes: ['Kintamani → Ubud Cultural Tour', 'Kintamani → Sanur & Denpasar']
  },
  {
    id: 'gianyar',
    name: 'Ubud & Gianyar',
    region: 'bali',
    type: 'destination',
    badge: 'Ubud Cultural Heart',
    x: 800,
    y: 350,
    description: 'Pusat seni budaya, Monkey Forest, Tegalalang Rice Terrace, dan akomodasi resort Ubud.',
    pickupPoints: ['Monkey Forest Sanctuary Area', 'Tegalalang Rice Terrace', 'Seluruh Villa & Resort Ubud'],
    routes: ['Ubud → Denpasar Airport (DPS)', 'Ubud → Fastboat Pier Kusamba/Sanur']
  },
  {
    id: 'badung',
    name: 'Badung & Denpasar',
    region: 'bali',
    type: 'hub',
    badge: 'Airport & Tourism Hub',
    x: 745,
    y: 410,
    description: 'Pusat pariwisata premier Bali: Kuta, Seminyak, Canggu, Nusa Dua, Uluwatu, dan Bandara Internasional Ngurah Rai.',
    pickupPoints: ['Bandara Internasional Ngurah Rai (DPS)', 'Kawasan Kuta, Seminyak & Canggu', 'Nusa Dua & Jimbaran Luxury Resorts', 'Kawasan Tebing Uluwatu'],
    routes: ['Airport DPS → Seluruh Villa Bali', 'Badung/Denpasar → Overland Tour Jawa Timur']
  },
  {
    id: 'klungkung',
    name: 'Klungkung & Nusa Penida',
    region: 'bali',
    type: 'destination',
    badge: 'Island Fastboat Link',
    x: 885,
    y: 360,
    description: 'Akses fastboat terintegrasi menuju Nusa Penida (Kelingking Beach, Broken Beach, Diamond Beach).',
    pickupPoints: ['Pelabuhan Fastboat Kusamba / Sanur', 'Dermaga Banjar Nyuh Nusa Penida', 'Kawasan Wisata Klungkung'],
    routes: ['Sanur/Kusamba → 1-Day Nusa Penida Tour', 'Klungkung → Ubud / Denpasar']
  }
];

export default function ServiceAreaMap() {
  const [selectedCity, setSelectedCity] = useState<CityPoint>(REGIONAL_HUBS[2]); // Malang & Batu default
  const [activeTab, setActiveTab] = useState<'all' | 'east-java' | 'bali'>('all');

  const filteredHubs = REGIONAL_HUBS.filter(
    h => activeTab === 'all' || h.region === activeTab
  );

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      
      {/* 1. Header Toolbar */}
      <div className="px-6 py-5 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Peta Operasional &amp; Jaringan Transportasi
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Koridor Terkoneksi: Jawa Timur &bull; Penyeberangan Selat Bali &bull; Pulau Bali
            </p>
          </div>
        </div>

        {/* Region Filter Buttons */}
        <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Semua Wilayah ({REGIONAL_HUBS.length})
          </button>
          <button
            onClick={() => setActiveTab('east-java')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'east-java'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Jawa Timur (6)
          </button>
          <button
            onClick={() => setActiveTab('bali')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'bali'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Pulau Bali (6)
          </button>
        </div>
      </div>

      {/* 2. Main Workspace: Professional Vector Cartography & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
        
        {/* Left Side: Clean Executive Map (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-8 bg-slate-950 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800">
          
          {/* Map Top Indicator */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-4 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="font-mono text-[11px] font-semibold">SISTEM NAVIGASI &amp; RUNNING ROUTE</span>
            </div>
            <div className="font-mono text-[11px] text-amber-500 font-bold">
              Konektivitas 24 Jam
            </div>
          </div>

          {/* SVG Map Canvas */}
          <div className="relative w-full aspect-[16/10] my-auto">
            <svg 
              viewBox="0 0 1000 600" 
              className="w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="mapLandBg" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e293b" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
              </defs>

              {/* Water Background Lines */}
              <g stroke="#334155" strokeWidth="0.5" opacity="0.3">
                <line x1="0" y1="150" x2="1000" y2="150" strokeDasharray="5 5" />
                <line x1="0" y1="300" x2="1000" y2="300" strokeDasharray="5 5" />
                <line x1="0" y1="450" x2="1000" y2="450" strokeDasharray="5 5" />
                <line x1="565" y1="0" x2="565" y2="600" strokeDasharray="5 5" />
              </g>

              {/* Region Water Labels */}
              <text x="320" y="90" fill="#475569" fontSize="13" fontWeight="800" letterSpacing="4" fontFamily="monospace">LAUT JAWA</text>
              <text x="565" y="480" textAnchor="middle" fill="#0284c7" fontSize="11" fontWeight="700" letterSpacing="2" fontFamily="monospace">SELAT BALI (FERRY)</text>
              <text x="320" y="550" fill="#475569" fontSize="13" fontWeight="800" letterSpacing="4" fontFamily="monospace">SAMUDERA HINDIA</text>

              {/* Landmass 1: East Java */}
              <path
                d="M 50 160 
                   C 110 145, 170 170, 225 165
                   C 265 160, 275 130, 315 135
                   C 365 140, 420 180, 470 210
                   C 510 230, 560 260, 565 310
                   C 570 365, 530 420, 490 440
                   C 435 460, 375 445, 315 440
                   C 255 435, 175 450, 115 420
                   C 65 390, 50 320, 50 250 
                   Z"
                fill="url(#mapLandBg)"
                stroke="#475569"
                strokeWidth="2"
              />

              {/* Madura Silhouette */}
              <path
                d="M 270 120 C 330 100, 410 110, 460 130 C 450 150, 390 145, 330 140 C 290 135, 270 130, 270 120 Z"
                fill="#0f172a"
                stroke="#334155"
                strokeWidth="1.5"
              />

              {/* Landmass 2: Bali */}
              <path
                d="M 595 290
                   C 630 260, 690 200, 760 200
                   C 830 200, 890 240, 920 280
                   C 940 310, 910 370, 870 390
                   C 820 420, 800 460, 770 480
                   C 740 500, 730 460, 720 410
                   C 680 370, 630 340, 595 290 Z"
                fill="url(#mapLandBg)"
                stroke="#475569"
                strokeWidth="2"
              />

              {/* Nusa Penida Island */}
              <path
                d="M 880 370 C 910 360, 930 380, 920 410 C 900 420, 870 400, 880 370 Z"
                fill="#1e293b"
                stroke="#475569"
                strokeWidth="1.5"
              />

              {/* Arterial Routes (Solid & Clean Dashed) */}
              <g>
                {/* Surabaya - Mojokerto */}
                <line x1="230" y1="190" x2="160" y2="230" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="4 4" />
                {/* Surabaya - Malang */}
                <line x1="230" y1="190" x2="215" y2="330" stroke="#f59e0b" strokeWidth="3" />
                {/* Surabaya - Probolinggo */}
                <path d="M 230 190 Q 300 205 375 255" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="4 4" />
                {/* Malang - Lumajang */}
                <line x1="215" y1="330" x2="350" y2="360" stroke="#f59e0b" strokeWidth="3" />
                {/* Probolinggo - Lumajang */}
                <line x1="375" y1="255" x2="350" y2="360" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3 3" />
                {/* Probolinggo - Banyuwangi */}
                <path d="M 375 255 Q 450 265 520 310" fill="none" stroke="#f59e0b" strokeWidth="3" />
                {/* Lumajang - Banyuwangi */}
                <path d="M 350 360 Q 430 375 520 310" fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3 3" />

                {/* Ferry Crossing Ketapang - Gilimanuk */}
                <line x1="520" y1="310" x2="615" y2="295" stroke="#38bdf8" strokeWidth="3" strokeDasharray="6 4" />

                {/* Gilimanuk - Lovina */}
                <path d="M 615 295 Q 655 240 710 215" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="4 4" />
                {/* Gilimanuk - Denpasar / Badung */}
                <path d="M 615 295 Q 670 360 745 410" fill="none" stroke="#f59e0b" strokeWidth="3" />
                {/* Lovina - Kintamani */}
                <path d="M 710 215 Q 760 220 805 255" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="4 4" />
                {/* Kintamani - Ubud */}
                <line x1="805" y1="255" x2="800" y2="350" stroke="#f59e0b" strokeWidth="2.5" />
                {/* Ubud - Denpasar */}
                <line x1="800" y1="350" x2="745" y2="410" stroke="#f59e0b" strokeWidth="3" />
                {/* Ubud - Klungkung */}
                <line x1="800" y1="350" x2="885" y2="360" stroke="#64748b" strokeWidth="2" strokeDasharray="4 4" />
                {/* Fastboat to Nusa Penida */}
                <line x1="885" y1="360" x2="885" y2="390" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="4 4" />
              </g>

              {/* City Hub Pins */}
              {filteredHubs.map((city) => {
                const isSelected = selectedCity.id === city.id;
                const isHub = city.type === 'hub';

                return (
                  <g
                    key={city.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedCity(city)}
                  >
                    {/* Selected Highlight Circle */}
                    {isSelected && (
                      <circle
                        cx={city.x}
                        cy={city.y}
                        r="14"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="2"
                        opacity="0.8"
                      />
                    )}

                    {/* Node Core */}
                    <circle
                      cx={city.x}
                      cy={city.y}
                      r={isSelected ? 6 : isHub ? 5 : 4}
                      fill={isSelected ? '#f59e0b' : isHub ? '#fbbf24' : '#94a3b8'}
                      stroke="#0f172a"
                      strokeWidth="2"
                    />

                    {/* City Name Badge */}
                    <g transform={`translate(${city.x}, ${city.y + 14})`}>
                      <rect
                        x={-38}
                        y={-8}
                        width={76}
                        height={16}
                        rx={4}
                        fill={isSelected ? '#f59e0b' : '#020617'}
                        stroke={isSelected ? '#f59e0b' : '#334155'}
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="3"
                        textAnchor="middle"
                        fill={isSelected ? '#020617' : '#ffffff'}
                        fontSize="9"
                        fontWeight={isSelected ? '800' : '600'}
                        fontFamily="sans-serif"
                      >
                        {city.name.split(' ')[0]}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Map Legend */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span className="font-medium text-slate-300">Pusat Hub / Base</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                <span className="font-medium text-slate-300">Destinasi &amp; Transit</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
                <span className="font-medium text-slate-300">Ferry Selat Bali</span>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              *Klik titik untuk rincian
            </div>
          </div>

        </div>

        {/* Right Side: Professional City Details & Direct Actions (5 cols) */}
        <div className="lg:col-span-5 p-6 sm:p-8 bg-slate-900/90 flex flex-col justify-between space-y-6">
          
          <div className="space-y-6">
            {/* Header Badge & Title */}
            <div className="space-y-2 border-b border-slate-800 pb-5">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  {selectedCity.badge}
                </span>
                <span className="text-xs font-mono font-bold text-slate-400 uppercase">
                  {selectedCity.region === 'east-java' ? 'Jawa Timur' : 'Pulau Bali'}
                </span>
              </div>
              <h4 className="text-2xl font-black text-white tracking-tight">
                {selectedCity.name}
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {selectedCity.description}
              </p>
            </div>

            {/* Structured Points */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Titik Penjemputan Resmi:</span>
              </div>
              <div className="space-y-2">
                {selectedCity.pickupPoints.map((point, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <span className="font-medium">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Connected Routes */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <CornerDownRight className="h-4 w-4 text-amber-400" />
                <span>Rute Populer:</span>
              </div>
              <div className="space-y-1.5">
                {selectedCity.routes.map((route, idx) => (
                  <div key={idx} className="text-xs text-slate-300 font-mono bg-slate-950/60 px-3 py-2 rounded-lg border border-slate-800/80">
                    {route}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action CTA */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-amber-400" />
                <span>Standby 24/7</span>
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Armada Resmi Terawat</span>
              </span>
            </div>

            <a
              href={`https://wa.me/6285212347289?text=${encodeURIComponent(
                `Halo Smart Journey, saya ingin reservasi/konsultasi layanan transportasi dan rute area ${selectedCity.name}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-slate-950 font-black py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              <span>Hubungi Admin Area {selectedCity.name}</span>
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>

        </div>

      </div>
    </div>
  );
}
