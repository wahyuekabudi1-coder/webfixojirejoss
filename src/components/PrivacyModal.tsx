import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Mail, Phone, MapPin, Sparkles, Calendar, ArrowRight } from 'lucide-react';
import { useApp } from '../AppContext';

export default function PrivacyModal() {
  const { isPrivacyOpen, setPrivacyOpen } = useApp();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPrivacyOpen) {
        setPrivacyOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPrivacyOpen, setPrivacyOpen]);

  if (!isPrivacyOpen) return null;

  return (
    <AnimatePresence>
      <div 
        id="privacy-policy-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-modal-title"
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md cursor-pointer overflow-hidden"
        onClick={() => setPrivacyOpen(false)}
      >
        <motion.div
          id="privacy-policy-container"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full max-w-3xl bg-[#203c34] border border-[#315B4F] rounded-3xl shadow-2xl cursor-default overflow-hidden flex flex-col max-h-[85vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-[#315B4F] flex items-center justify-between shrink-0 bg-[#182e28] backdrop-blur-sm relative">
            <div className="absolute top-0 left-10 w-32 h-[1px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 id="privacy-modal-title" className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  Kebijakan Privasi
                  <span className="text-amber-500 text-xs px-2 py-0.5 bg-amber-500/10 rounded-full font-mono border border-amber-500/20 font-medium">Privacy Policy</span>
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 font-medium">
                  <Calendar className="h-3 w-3 text-amber-500/70" aria-hidden="true" />
                  <span>Terakhir Diperbarui: 7 Juli 2026</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setPrivacyOpen(false)}
              className="p-2 rounded-full border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              aria-label="Tutup Kebijakan Privasi"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Content Body (Scrollable) */}
          <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300 leading-relaxed scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            {/* Intro */}
            <div className="bg-slate-950/40 border border-slate-800/50 rounded-2xl p-4 sm:p-5 space-y-3">
              <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-extrabold uppercase tracking-widest font-mono">
                <Sparkles className="h-3 w-3" /> Selamat Datang di Smart Journey
              </span>
              <p>
                Privasi Anda sangat penting bagi kami. Kebijakan Privasi ini menjelaskan bagaimana <strong>Smart Journey</strong> mengumpulkan, menggunakan, menyimpan, dan melindungi informasi pribadi Anda saat Anda mengunjungi situs web kami atau menggunakan layanan kami.
              </p>
              <p className="text-xs text-slate-400 italic">
                Dengan mengakses situs web kami atau memesan layanan kami, Anda menyetujui praktik-praktik yang dijelaskan dalam Kebijakan Privasi ini.
              </p>
            </div>

            {/* Sections */}
            <div className="space-y-6">
              
              {/* Section 1 */}
              <div className="space-y-2 border-l-2 border-amber-500 pl-4">
                <h3 className="text-white font-bold text-base">1. Tentang Kami (About Us)</h3>
                <p>
                  Smart Journey adalah perusahaan penyedia jasa layanan perjalanan wisata dan transportasi premium yang menawarkan:
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {[
                    'Paket Tour Wisata (Tour Packages)',
                    'Antar Jemput Bandara (Airport Transfer)',
                    'Layanan Taksi (Taxi Services)',
                    'Sewa Mobil Premium (Car Rental)'
                  ].map((service, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs bg-slate-950/35 border border-slate-800/40 px-3 py-2 rounded-xl text-slate-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      {service}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-slate-400 pt-1">
                  Kami berkomitmen tinggi untuk senantiasa melindungi data pribadi Anda dan memastikan integritas serta kenyamanan privasi Anda.
                </p>
              </div>

              {/* Section 2 */}
              <div className="space-y-3 border-l-2 border-amber-500 pl-4">
                <h3 className="text-white font-bold text-base">2. Informasi yang Kami Kumpulkan (Information We Collect)</h3>
                <p>
                  Kami dapat mengumpulkan informasi berikut ketika Anda menggunakan situs web kami atau memesan layanan kami:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* Personal */}
                  <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-4 space-y-2.5">
                    <h4 className="text-amber-400 text-xs font-bold uppercase tracking-wider font-mono">Informasi Pribadi</h4>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {[
                        'Nama Lengkap',
                        'Nomor Telepon / WhatsApp aktif',
                        'Alamat Email',
                        'Alamat Penjemputan (Pickup Address)',
                        'Alamat Tujuan (Destination Address)',
                        'Detail Perjalanan & Rencana Rute',
                        'Informasi Pemesanan & Pembayaran',
                        'Permintaan Khusus (Special Requests)'
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="text-amber-500 font-bold">&#8226;</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Auto */}
                  <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-4 space-y-2.5">
                    <h4 className="text-amber-400 text-xs font-bold uppercase tracking-wider font-mono">Informasi yang Dikumpulkan Otomatis</h4>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {[
                        'Alamat IP (IP Address)',
                        'Jenis Peramban (Browser Type)',
                        'Informasi Perangkat & Sistem Operasi',
                        'Halaman yang Dikunjungi di Situs Kami',
                        'Tanggal & Waktu Akses Situs',
                        'Statistik Penggunaan Situs Web'
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="text-amber-500 font-bold">&#8226;</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Section 3 */}
              <div className="space-y-2 border-l-2 border-amber-500 pl-4">
                <h3 className="text-white font-bold text-base">3. Cara Kami Menggunakan Informasi Anda (How We Use Your Information)</h3>
                <p>Informasi Anda digunakan dengan penuh tanggung jawab untuk tujuan berikut:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
                  {[
                    'Memproses dan mengelola detail pemesanan perjalanan Anda.',
                    'Mengirimkan konfirmasi reservasi dan rincian armada.',
                    'Menghubungi Anda terkait pemesanan, waktu penjemputan, atau kendala.',
                    'Memberikan bantuan & layanan dukungan pelanggan yang responsif.',
                    'Meningkatkan performa fungsionalitas situs web dan kualitas layanan.',
                    'Mencegah aktivitas mencurigakan, penipuan, atau transaksi ilegal.',
                    'Mematuhi regulasi hukum dan kewajiban administratif yang berlaku.'
                  ].map((use, i) => (
                    <div key={i} className="bg-slate-950/20 border border-slate-800/30 p-2.5 rounded-xl flex gap-2">
                      <span className="text-amber-500 font-bold shrink-0">0{i+1}.</span>
                      <span>{use}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4 */}
              <div className="space-y-2 border-l-2 border-amber-500 pl-4">
                <h3 className="text-white font-bold text-base">4. Keamanan Data (Data Security)</h3>
                <p>
                  Kami menerapkan langkah-langkah administratif, teknis, dan fisik yang wajar untuk melindungi informasi pribadi Anda dari akses tidak sah, pengungkapan, perubahan, atau penghancuran yang tidak semestinya.
                </p>
                <p className="text-xs text-slate-400">
                  Meskipun kami berupaya semaksimal mungkin untuk melindungi data Anda, perlu diingat bahwa tidak ada metode transmisi internet atau penyimpanan elektronik yang sepenuhnya 100% aman.
                </p>
              </div>

              {/* Section 5 */}
              <div className="space-y-2 border-l-2 border-amber-500 pl-4">
                <h3 className="text-white font-bold text-base">5. Berbagi Informasi (Information Sharing)</h3>
                <p>
                  Kami berkomitmen penuh untuk <strong className="text-amber-400">TIDAK</strong> menjual, menyewakan, atau memperdagangkan informasi pribadi Anda kepada pihak lain.
                </p>
                <p>Kami hanya membagikan data Anda dengan entitas berikut bilamana dirasa perlu:</p>
                <ul className="space-y-2 pt-1 text-xs">
                  {[
                    'Mitra pengemudi/operasional lokal tepercaya yang bertugas melayani perjalanan Anda.',
                    'Penyedia layanan gerbang pembayaran (payment gateway) resmi yang memproses pembayaran digital secara aman.',
                    'Mitra penyedia teknologi hosting dan infrastruktur server situs web kami.',
                    'Pihak berwenang atau penegak hukum jika secara legal diwajibkan oleh undang-undang.'
                  ].map((share, i) => (
                    <li key={i} className="flex items-start gap-2 bg-slate-950/20 p-2 rounded-lg border border-slate-800/40">
                      <ArrowRight className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span>{share}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Section 6 */}
              <div className="space-y-2 border-l-2 border-amber-500 pl-4">
                <h3 className="text-white font-bold text-base">6. Cookie (Cookies)</h3>
                <p>
                  Situs web kami dapat menggunakan cookie untuk meningkatkan pengalaman penelusuran Anda, mengingat preferensi rute, dan menganalisis metrik lalu lintas situs secara anonim.
                </p>
                <p>
                  Anda dapat menonaktifkan cookie melalui pengaturan peramban (browser) Anda, meskipun beberapa fitur situs web mungkin tidak berfungsi secara optimal setelahnya.
                </p>
              </div>

              {/* Section 7 */}
              <div className="space-y-2 border-l-2 border-amber-500 pl-4">
                <h3 className="text-white font-bold text-base">7. Retensi Data (Data Retention)</h3>
                <p>
                  Kami hanya menyimpan data pribadi Anda selama periode yang logis dan diperlukan untuk menyediakan layanan, memenuhi kewajiban administratif, mematuhi regulasi pajak yang berlaku, serta menyelesaikan perselisihan bisnis yang mungkin timbul.
                </p>
              </div>

              {/* Section 8 */}
              <div className="space-y-2 border-l-2 border-amber-500 pl-4">
                <h3 className="text-white font-bold text-base">8. Hak-Hak Anda (Your Rights)</h3>
                <p>Berdasarkan undang-undang pelindungan data pribadi yang berlaku, Anda berhak untuk:</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  {[
                    'Mengakses riwayat informasi pribadi Anda yang kami simpan.',
                    'Meminta koreksi atau perbaikan data jika terdapat ketidakakuratan.',
                    'Memperbarui detail kontak atau rincian penjemputan Anda.',
                    'Meminta penghapusan permanen atas data pribadi Anda dari database kami.'
                  ].map((right, i) => (
                    <li key={i} className="flex items-center gap-2 bg-slate-950/30 px-3 py-2 rounded-xl border border-slate-800/40">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      <span>{right}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Section 9 */}
              <div className="space-y-2 border-l-2 border-amber-500 pl-4">
                <h3 className="text-white font-bold text-base">9. Tautan Pihak Ketiga (Third-Party Links)</h3>
                <p>
                  Situs web kami mungkin menyertakan tautan navigasi eksternal ke situs web pihak ketiga. Kami tidak bertanggung jawab atas praktik privasi, sistem keamanan, atau konten yang dimuat oleh situs web pihak ketiga tersebut.
                </p>
              </div>

              {/* Section 10 */}
              <div className="space-y-2 border-l-2 border-amber-500 pl-4">
                <h3 className="text-white font-bold text-base">10. Perubahan Kebijakan Privasi ini (Changes to Policy)</h3>
                <p>
                  Kami berhak memperbarui Kebijakan Privasi ini sewaktu-waktu. Setiap revisi atau perubahan akan langsung berlaku efektif setelah dipublikasikan secara resmi di halaman situs web ini. Kami menyarankan Anda untuk meninjau halaman ini secara berkala.
                </p>
              </div>

              {/* Section 11 */}
              <div className="space-y-3 border-l-2 border-amber-500 pl-4">
                <h3 className="text-white font-bold text-base">11. Hubungi Kami (Contact Us)</h3>
                <p>
                  Apabila Anda memiliki pertanyaan, saran, atau keluhan terkait Kebijakan Privasi ini atau pengelolaan data pribadi Anda oleh kami, silakan hubungi tim kami:
                </p>
                
                <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-3.5 text-xs">
                  <div className="text-slate-200 font-extrabold text-sm uppercase tracking-wider font-mono text-amber-400">
                    Smart Journey Office
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5 text-slate-300">
                      <Phone className="h-4 w-4 text-amber-500 shrink-0" />
                      <a href="https://wa.me/6285212347289" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors font-medium">
                        +62 852-1234-7289 (WhatsApp)
                      </a>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-300">
                      <Mail className="h-4 w-4 text-amber-500 shrink-0" />
                      <a href="mailto:Info@sawahjayatrans.com" className="hover:text-amber-400 transition-colors font-medium">
                        Info@sawahjayatrans.com
                      </a>
                    </div>
                    <div className="flex items-start gap-2.5 text-slate-300">
                      <MapPin className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <div className="leading-snug">
                        <strong>Kantor Pusat:</strong> Jl. Puntadewa No. 192, Tumpang, Malang, Jawa Timur, Indonesia
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Ending Message */}
            <div className="text-center pt-4 text-xs text-slate-400 max-w-lg mx-auto leading-relaxed border-t border-slate-800">
              Terima kasih telah memilih Smart Journey. Kami menghargai kepercayaan Anda dan berkomitmen menyediakan pengalaman perjalanan yang aman, nyaman, dan tak terlupakan.
            </div>
          </div>

          {/* Footer (Actions) */}
          <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/40 backdrop-blur-sm shrink-0 flex items-center justify-end gap-3">
            <button
              onClick={() => setPrivacyOpen(false)}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md active:scale-98 cursor-pointer"
            >
              Saya Mengerti &amp; Tutup
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
