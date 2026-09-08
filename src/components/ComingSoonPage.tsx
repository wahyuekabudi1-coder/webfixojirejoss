import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Compass, Plane, Route, Car, Clock, Sparkles, Send, CheckCircle2, MessageSquare, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { useApp } from '../AppContext';

interface ComingSoonPageProps {
  service: 'tours' | 'airport' | 'taxi' | 'car-rental';
}

export default function ComingSoonPage({ service }: ComingSoonPageProps) {
  const { setPage } = useApp();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 32, hours: 14, minutes: 45, seconds: 12 });

  // Countdown simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
      setEmail('');
    }
  };

  const getServiceDetails = () => {
    switch (service) {
      case 'tours':
        return {
          title: 'Paket Tour Wisata Jawa Timur',
          subtitle: 'Bromo, Ijen, Tumpak Sewu & Kelingking Bali',
          icon: <Compass className="h-10 w-10 text-amber-500 animate-pulse" />,
          desc: 'Jasa paket wisata terpadu dengan pemandu profesional, tiket terusan, akomodasi, dan jeep 4x4 untuk destinasi spektakuler seperti Sunrise Bromo, Blue Fire Ijen, Air Terjun Tumpak Sewu, dan Nusa Penida Bali.',
          features: [
            'Tiket masuk & perizinan wisata lengkap tanpa antre',
            'Kendaraan Jeep 4x4 off-road Gunung Bromo premium',
            'Pemandu lokal berlisensi, komunikatif & ramah',
            'Penjemputan fleksibel di Surabaya, Malang, atau Banyuwangi'
          ],
          accentColor: 'from-amber-500 to-amber-600',
          bgGlow: 'bg-amber-500/10'
        };
      case 'airport':
        return {
          title: 'Antar-Jemput Bandara 24 Jam',
          subtitle: 'Kenyamanan Penjemputan SUB, DPS, YIA & CGK',
          icon: <Plane className="h-10 w-10 text-amber-500 animate-pulse" />,
          desc: 'Layanan antar-jemput bandara bebas khawatir dengan pemantauan jadwal penerbangan secara langsung, sambutan dengan papan nama di terminal kedatangan, serta armada steril bebas rokok.',
          features: [
            'Pemantauan jadwal penerbangan real-time (anti-telat)',
            'Penyambutan ramah dengan papan nama di gerbang kedatangan',
            'Tarif all-in termasuk biaya tol dan parkir bandara',
            'Bantuan penanganan bagasi & rute tercepat bebas macet'
          ],
          accentColor: 'from-blue-500 to-amber-500',
          bgGlow: 'bg-blue-500/10'
        };
      case 'taxi':
        return {
          title: 'Taksi Eksekutif Antar-Kota',
          subtitle: 'Perjalanan Point-to-Point Tarif Flat Transparan',
          icon: <Route className="h-10 w-10 text-amber-500 animate-pulse" />,
          desc: 'Perjalanan privat pintu-ke-pintu (door-to-door) antar kota di Jawa Timur dan Bali dengan tarif flat yang transparan, termasuk tol dan parkir. Pilihan sempurna untuk dinas kerja atau perjalanan keluarga.',
          features: [
            'Tarif flat transparan disepakati di awal tanpa biaya siluman',
            'Layanan pintu-ke-pintu (door-to-door) sepenuhnya privat',
            'Pengemudi eksekutif profesional berlisensi & rapi',
            'Fasilitas armada wangi dengan charger & air mineral gratis'
          ],
          accentColor: 'from-emerald-500 to-amber-500',
          bgGlow: 'bg-emerald-500/10'
        };
      case 'car-rental':
        return {
          title: 'Sewa Mobil & Sopir Premium',
          subtitle: 'Armada Terbaru & Layanan Sopir Wisata Handal',
          icon: <Car className="h-10 w-10 text-amber-500 animate-pulse" />,
          desc: 'Layanan rental mobil harian kelas eksekutif dengan pengemudi profesional yang memahami rute pariwisata Jawa Timur secara mendalam.',
          features: [
            'Tarif sewa kompetitif sudah termasuk BBM & Sopir',
            'Armada steril terawat (Avanza, Innova Reborn, Zenix, Hiace)',
            'Dukungan customer service responsif 24 jam penuh',
            'Fleksibilitas rute perjalanan tanpa batas kaku'
          ],
          accentColor: 'from-rose-500 to-amber-500',
          bgGlow: 'bg-rose-500/10'
        };
    }
  };

  const details = getServiceDetails();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden pt-28 pb-12 selection:bg-amber-500 selection:text-slate-950">
      {/* Background elegant celestial lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className={`absolute top-1/3 left-1/3 w-[300px] h-[300px] ${details.bgGlow} rounded-full blur-[100px] pointer-events-none`} />
      
      {/* Stars particles overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 w-full flex-1 flex flex-col justify-center py-6">
        
        {/* Upper Navigation Back Button */}
        <div className="mb-6 flex justify-start animate-fadeIn">
          <button
            onClick={() => setPage('home')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer text-xs font-bold uppercase tracking-wider shadow-sm"
          >
            <ArrowLeft className="h-4 w-4 text-amber-500" />
            <span>Kembali ke Beranda</span>
          </button>
        </div>

        {/* Header Section */}
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-10 animate-fadeIn">
          <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-500 font-extrabold uppercase tracking-widest font-mono text-[10px] px-3.5 py-1.5 rounded-full border border-amber-500/20">
            <Sparkles className="h-3.5 w-3.5 animate-spin" />
            <span>Segera Hadir / Coming Soon</span>
          </span>

          <div className="flex justify-center pt-2">
            <div className="h-20 w-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-500 shadow-xl relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
              {details.icon}
            </div>
          </div>

          <h1 className="text-3xl sm:text-4.5xl font-black text-white tracking-tight leading-none pt-2">
            {details.title}
          </h1>
          <p className="text-sm font-bold text-amber-500 tracking-wide uppercase font-mono">
            {details.subtitle}
          </p>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
            {details.desc}
          </p>
        </div>

        {/* Interactive Features & Countdown grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch mb-10">
          
          {/* Countdown & Notify card */}
          <div className="md:col-span-7 bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 backdrop-blur-sm shadow-xl">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-4">
                <Clock className="h-4 w-4 text-amber-500" />
                <span>Rencana Peluncuran</span>
              </h3>
              
              {/* Countdown numbers */}
              <div className="grid grid-cols-4 gap-2.5">
                {[
                  { value: timeLeft.days, label: 'Hari' },
                  { value: timeLeft.hours, label: 'Jam' },
                  { value: timeLeft.minutes, label: 'Menit' },
                  { value: timeLeft.seconds, label: 'Detik' }
                ].map((t, idx) => (
                  <div key={idx} className="bg-slate-950/80 border border-slate-850 p-3 rounded-2xl text-center">
                    <span className="block text-2xl sm:text-3xl font-black text-white font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-300">
                      {String(t.value).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] font-extrabold text-amber-500 uppercase tracking-widest block mt-1 font-mono">
                      {t.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div className="mt-5 space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold text-slate-400 font-mono">
                  <span>PROGRES PERSIAPAN SISTEM</span>
                  <span className="text-amber-500">85% SELESAI</span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full border border-slate-850 overflow-hidden">
                  <div className="h-full w-[85%] bg-gradient-to-r from-amber-500 to-amber-600 rounded-full animate-pulse" />
                </div>
              </div>
            </div>

            {/* Email form */}
            <div className="border-t border-slate-850 pt-5">
              {isSubscribed ? (
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 flex gap-3 items-start animate-fadeIn">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wide">Terima Kasih!</h4>
                    <p className="text-[11px] text-slate-300 leading-normal mt-0.5">
                      Email Anda telah terdaftar. Kami akan mengirimkan notifikasi eksklusif dan diskon perdana saat layanan ini diluncurkan secara resmi.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-3">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                    Ingin mendapatkan kabar peluncuran pertama kali?
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      required
                      placeholder="Masukkan alamat email Anda..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 bg-slate-950/80 border border-slate-850 hover:border-slate-700 focus:border-amber-500 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none transition-all"
                    />
                    <button
                      type="submit"
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-95 shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>

          {/* Core features upcoming card */}
          <div className="md:col-span-5 bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 sm:p-8 flex flex-col justify-between backdrop-blur-sm shadow-xl">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-850">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>Fitur Unggulan</span>
              </h3>
              
              <div className="space-y-3.5">
                {details.features.map((f, idx) => (
                  <div key={idx} className="flex gap-2.5 items-start">
                    <div className="h-5 w-5 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mt-0.5 shrink-0">
                      <ShieldCheck className="h-3 w-3" />
                    </div>
                    <span className="text-xs sm:text-[13px] text-slate-300 font-semibold leading-snug">
                      {f}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Offline Booking Callout */}
            <div className="bg-slate-950/50 border border-slate-850/60 rounded-2xl p-4 mt-6">
              <div className="flex gap-3 items-start">
                <MessageSquare className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[11px] font-bold text-white uppercase tracking-wide">Butuh Reservasi Manual?</h4>
                  <p className="text-[10px] text-slate-400 leading-normal mt-0.5">
                    Layanan ini masih dapat dipesan secara offline melalui WhatsApp Customer Support kami yang aktif 24 jam penuh.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Footer Actions / Direct Booking Options */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fadeIn">
          <a
            href="https://wa.me/6285212347289" // Official Smart Journey WhatsApp
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-850 text-white font-bold border border-slate-800 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:-translate-y-0.5"
          >
            <MessageSquare className="h-4 w-4 text-green-500" />
            <span>Hubungi Via WhatsApp</span>
          </a>

          <button
            onClick={() => setPage('car-rental')}
            className="w-full sm:w-auto px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-amber-500/10 active:scale-98 hover:-translate-y-0.5"
          >
            <span>Gunakan Sewa Mobil (Aktif)</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
