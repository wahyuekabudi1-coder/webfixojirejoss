import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, Mail, Phone, MapPin, Sparkles, Calendar, ArrowRight, FileText } from 'lucide-react';
import { useApp } from '../AppContext';

export default function TermsModal() {
  const { isTermsOpen, setTermsOpen } = useApp();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isTermsOpen) {
        setTermsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTermsOpen, setTermsOpen]);

  if (!isTermsOpen) return null;

  return (
    <AnimatePresence>
      <div 
        id="terms-conditions-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-modal-title"
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md cursor-pointer overflow-hidden"
        onClick={() => setTermsOpen(false)}
      >
        <motion.div
          id="terms-conditions-container"
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
                <FileText className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 id="terms-modal-title" className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  Syarat &amp; Ketentuan
                  <span className="text-amber-500 text-xs px-2 py-0.5 bg-amber-500/10 rounded-full font-mono border border-amber-500/20 font-medium">Terms &amp; Conditions</span>
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 font-medium">
                  <Calendar className="h-3 w-3 text-amber-500/70" aria-hidden="true" />
                  <span>Terakhir Diperbarui: 7 Juli 2026</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setTermsOpen(false)}
              className="p-2 rounded-full border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              aria-label="Tutup Syarat &amp; Ketentuan"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Content Body (Scrollable) */}
          <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300 leading-relaxed scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            {/* Intro */}
            <div className="bg-slate-950/40 border border-slate-800/50 rounded-2xl p-4 sm:p-5 space-y-3">
              <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-extrabold uppercase tracking-widest font-mono">
                <Sparkles className="h-3 w-3" /> Regulasi &amp; Standardisasi Layanan
              </span>
              <p>
                Selamat datang di <strong>Smart Journey</strong>. Syarat &amp; Ketentuan ("Ketentuan") ini mengatur akses dan penggunaan situs web Smart Journey serta seluruh layanan jasa perjalanan yang disediakan oleh Smart Journey, termasuk namun tidak terbatas pada Paket Wisata, Antar Jemput Bandara, Taksi Eksekutif, dan Sewa Mobil.
              </p>
              <p className="text-xs text-slate-400 italic">
                Dengan mengakses situs web kami, melakukan reservasi, atau menggunakan layanan kami, Anda menyatakan telah membaca, memahami, dan menyetujui untuk terikat secara hukum oleh Syarat &amp; Ketentuan ini.
              </p>
            </div>

            {/* Sections */}
            <div className="space-y-6">
              
              {/* Section 1 */}
              <div className="space-y-2 border-l-2 border-amber-500 pl-4">
                <h3 className="text-white font-bold text-base">1. Definisi (Definitions)</h3>
                <p>Dalam Syarat &amp; Ketentuan ini, istilah-istilah berikut memiliki arti:</p>
                <ul className="space-y-2 text-xs pt-1">
                  <li><strong>Perusahaan / Kami:</strong> Merujuk kepada Smart Journey selaku operator perjalanan resmi.</li>
                  <li><strong>Pelanggan / Anda:</strong> Pengguna layanan, pemesan jasa, atau pengunjung situs web kami.</li>
                  <li><strong>Layanan:</strong> Meliputi Paket Wisata, Antar Jemput Bandara, Layanan Taksi, Sewa Mobil, dan layanan terkait perjalanan lainnya.</li>
                  <li><strong>Pemesanan (Booking):</strong> Setiap reservasi formal yang dilakukan melalui situs web, WhatsApp, email, atau jalur komunikasi resmi kami.</li>
                </ul>
              </div>

              {/* Section 2 */}
              <div className="space-y-2 border-l-2 border-amber-500 pl-4">
                <h3 className="text-white font-bold text-base">2. Kelayakan Penggunaan (Eligibility)</h3>
                <p>
                  Pelanggan harus berusia minimal 18 tahun atau memiliki izin dan pendampingan formal dari orang tua atau wali hukum untuk dapat memesan layanan kami. Dengan melakukan pemesanan, Anda menjamin bahwa semua informasi yang Anda berikan adalah akurat, lengkap, dan terkini.
                </p>
              </div>

              {/* Section 3 */}
              <div className="space-y-2 border-l-2 border-amber-500 pl-4">
                <h3 className="text-white font-bold text-base">3. Kebijakan Pemesanan (Booking Policy)</h3>
                <p>Semua pemesanan bersifat kondisional dan tergantung pada ketersediaan armada serta pemandu wisata.</p>
                <p>Pemesanan Anda dianggap terkonfirmasi secara sah setelah:</p>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li>Semua detail data perjalanan dan identitas lengkap yang diperlukan telah diserahkan.</li>
                  <li>Persyaratan pembayaran awal atau deposit (bila ada) telah terpenuhi.</li>
                  <li>SmartJourney telah menerbitkan tanda terima atau surat konfirmasi pemesanan resmi.</li>
                </ul>
              </div>

              {/* Section 4 */}
              <div className="space-y-2 border-l-2 border-amber-500 pl-4">
                <h3 className="text-white font-bold text-base">4. Ketentuan Tarif &amp; Harga (Pricing)</h3>
                <p>
                  Semua harga yang ditampilkan di situs web didasarkan pada tarif resmi dan mata uang yang berlaku (USD atau IDR) kecuali ditentukan lain. Harga dapat berubah sewaktu-waktu tanpa pemberitahuan sebelumnya, namun pesanan yang telah dikonfirmasi dan dibayar tidak akan mengalami perubahan tarif, kecuali ada perubahan rute atau permintaan khusus dari pelanggan.
                </p>
                <p className="text-xs text-amber-400 font-medium">Biaya tambahan dapat berlaku untuk:</p>
                <ul className="grid grid-cols-2 gap-1.5 text-xs">
                  {['Tujuan / Rute Ekstra', 'Waktu Tunggu Ekstra', 'Biaya Kelebihan Waktu (Overtime)', 'Tol &amp; Parkir', 'Tiket Penyeberangan Feri', 'Tiket Masuk Destinasi', 'Pajak Pemerintah', 'Permintaan khusus di luar kontrak'].map((charge, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="text-amber-500 font-bold">&#8226;</span>
                      <span>{charge}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Section 5 */}
              <div className="space-y-2 border-l-2 border-amber-500 pl-4">
                <h3 className="text-white font-bold text-base">5. Sistem Pembayaran (Payment)</h3>
                <p>
                  Pembayaran wajib diselesaikan melalui metode pembayaran resmi yang disediakan oleh SmartJourney. Bergantung pada jenis layanan yang dipilih, pembayaran penuh atau deposit minimum harus diselesaikan sebelum layanan perjalanan dimulai. Keterlambatan pembayaran di luar tenggat waktu dapat mengakibatkan pembatalan otomatis atas pesanan Anda.
                </p>
              </div>

              {/* Section 6 */}
              <div className="space-y-2 border-l-2 border-amber-500 pl-4">
                <h3 className="text-white font-bold text-base">6. Pembatalan oleh Pelanggan (Cancellation by Customer)</h3>
                <p>
                  Setiap permintaan pembatalan harus diajukan secara tertulis melalui saluran komunikasi resmi (WhatsApp/Email) kami. Kelayakan pengembalian dana (refund) sepenuhnya bergantung pada sisa waktu sebelum keberangkatan, jenis layanan, pengeluaran logistik awal yang sudah tidak dapat ditarik kembali, serta kebijakan pembatalan pihak ketiga (seperti hotel atau tiket atraksi). Biaya administrasi tertentu mungkin diberlakukan untuk pemrosesan pembatalan.
                </p>
              </div>

              {/* Section 7 */}
              <div className="space-y-2 border-l-2 border-amber-500 pl-4">
                <h3 className="text-white font-bold text-base">7. Pembatalan oleh SmartJourney (Cancellation by Us)</h3>
                <p>
                  SmartJourney berhak mengubah jadwal atau membatalkan pemesanan sepihak demi keselamatan pelanggan jika terjadi kondisi luar biasa di luar kendali wajar kami (Force Majeure). Dalam situasi ini, kami akan menawarkan rute alternatif, armada pengganti, penjadwalan ulang (reschedule), atau pengembalian dana sesuai kebijakan yang proporsional.
                </p>
              </div>

              {/* Section 8 */}
              <div className="space-y-2 border-l-2 border-amber-500 pl-4">
                <h3 className="text-white font-bold text-base">8. Tanggung Jawab Pelanggan (Customer Responsibilities)</h3>
                <p>Pelanggan setuju untuk senantiasa:</p>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li>Tiba di titik penjemputan tepat waktu sesuai jadwal yang telah ditentukan.</li>
                  <li>Memberikan rincian kontak dan alamat penjemputan yang akurat dan dapat diverifikasi.</li>
                  <li>Mematuhi instruksi keselamatan dari pengemudi atau pemandu wisata selama perjalanan.</li>
                  <li>Menghormati adat istiadat setempat, budaya, serta regulasi hukum yang berlaku.</li>
                  <li>Menjaga barang bawaan pribadi masing-masing dengan penuh kehati-hatian.</li>
                </ul>
              </div>

              {/* Section 9 */}
              <div className="space-y-2 border-l-2 border-amber-500 pl-4">
                <h3 className="text-white font-bold text-base">9. Tanggung Jawab Pengemudi &amp; Kru (Driver Responsibilities)</h3>
                <p>
                  Pengemudi kami akan berusaha keras tiba tepat waktu, mengoperasikan kendaraan dengan aman, mematuhi semua rambu lalu lintas, serta memberikan layanan yang ramah dan profesional. Pengemudi kami berhak menolak memberikan layanan atau menghentikan perjalanan secara sepihak jika pelanggan terindikasi berada di bawah pengaruh zat terlarang, bersikap agresif/melecehkan, membahayakan keselamatan berkendara, atau membawa muatan yang dilarang hukum.
                </p>
              </div>

              {/* Section 10 */}
              <div className="space-y-2 border-l-2 border-amber-500 pl-4">
                <h3 className="text-white font-bold text-base">10. Syarat Paket Wisata (Tour Packages Conditions)</h3>
                <p>
                  Rute perjalanan wisata (itinerary) bersifat fleksibel dan dapat berubah sewaktu-waktu demi keselamatan bersama atau karena faktor eksternal seperti kondisi cuaca buruk, penutupan jalur wisata oleh otoritas setempat, atau kemacetan lalu lintas yang parah. Kami akan mengupayakan destinasi pengganti yang setara jika memungkinkan.
                </p>
              </div>

              {/* Section 11 */}
              <div className="space-y-2 border-l-2 border-amber-500 pl-4">
                <h3 className="text-white font-bold text-base">11. Layanan Antar Jemput Bandara (Airport Transfer)</h3>
                <p>
                  Pelanggan wajib memberikan rincian nomor penerbangan dan estimasi jam mendarat secara akurat. Kami memantau jadwal kedatangan penerbangan Anda jika sistem memungkinkan, namun pelanggan sangat disarankan untuk mengabari pengemudi kami sesegera mungkin jika terjadi keterlambatan atau percepatan jadwal terbang yang drastis.
                </p>
              </div>

              {/* Section 12 */}
              <div className="space-y-2 border-l-2 border-amber-500 pl-4">
                <h3 className="text-white font-bold text-base">12. Aturan Sewa Mobil (Car Rental)</h3>
                <p>Untuk layanan sewa lepas kunci (bila ditawarkan), pelanggan wajib:</p>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li>Memiliki Surat Izin Mengemudi (SIM) yang sah dan masih aktif.</li>
                  <li>Menggunakan kendaraan secara bertanggung jawab dan mengembalikannya tepat waktu.</li>
                  <li>Bertanggung jawab penuh atas denda tilang atau pelanggaran hukum lalu lintas selama masa sewa.</li>
                  <li>Dilarang keras merokok, mengonsumsi minuman keras, atau melakukan aktivitas ilegal di dalam kendaraan.</li>
                </ul>
              </div>

              {/* Section 13 */}
              <div className="space-y-2 border-l-2 border-amber-500 pl-4">
                <h3 className="text-white font-bold text-base">13. Bagasi &amp; Muatan Barang (Luggage)</h3>
                <p>
                  Pelanggan wajib memastikan kapasitas bagasi kendaraan yang dipesan sesuai dengan volume barang bawaan. SmartJourney tidak bertanggung jawab atas kehilangan, kecurian, atau kerusakan barang berharga bawaan penumpang di dalam kendaraan, kecuali akibat kelalaian berat dari pengemudi kami yang dapat dibuktikan secara hukum. Harap periksa kembali seluruh barang bawaan Anda sebelum turun dari kendaraan.
                </p>
              </div>

              {/* Section 14 */}
              <div className="space-y-2 border-l-2 border-amber-500 pl-4">
                <h3 className="text-white font-bold text-base">14. Keterlambatan Perjalanan (Delays)</h3>
                <p>
                  SmartJourney tidak bertanggung jawab atas kerugian materiil maupun non-materiil akibat keterlambatan jadwal perjalanan yang disebabkan oleh faktor lalu lintas, kecelakaan jalan raya, perbaikan jalan, kondisi cuaca ekstrem, atau kejadian tidak terduga lainnya di jalan raya. Estimasi waktu tiba yang kami berikan bersifat panduan umum dan bukan jaminan mutlak.
                </p>
              </div>

              {/* Section 15 */}
              <div className="space-y-2 border-l-2 border-amber-500 pl-4">
                <h3 className="text-white font-bold text-base">15. Keadaan Kahar (Force Majeure)</h3>
                <p>
                  Kami dibebaskan dari segala tuntutan atau kewajiban atas kegagalan atau penundaan pelaksanaan layanan yang disebabkan oleh bencana alam (gempa bumi, banjir, letusan gunung berapi), pandemi global, aksi mogok massal, kerusuhan sipil, kebijakan darurat pemerintah, perang, sabotase, atau gangguan infrastruktur telekomunikasi nasional.
                </p>
              </div>

              {/* Section 16 */}
              <div className="space-y-2 border-l-2 border-amber-500 pl-4">
                <h3 className="text-white font-bold text-base">16. Batasan Tanggung Jawab (Limitation of Liability)</h3>
                <p>
                  Sepanjang diperbolehkan oleh hukum, tanggung jawab kumulatif maksimal SmartJourney atas setiap klaim yang timbul dari layanan kami terbatas pada jumlah total uang yang telah dibayarkan oleh pelanggan untuk pemesanan yang bersangkutan. Kami tidak bertanggung jawab atas kerugian tidak langsung atau hilangnya keuntungan komersial pelanggan.
                </p>
              </div>

              {/* Section 17 */}
              <div className="space-y-2 border-l-2 border-amber-500 pl-4">
                <h3 className="text-white font-bold text-base">17. Hak Kekayaan Intelektual (Intellectual Property)</h3>
                <p>
                  Seluruh aset digital di situs web ini, termasuk namun tidak terbatas pada logo, teks ulasan, kode pemrograman, skema desain, foto dokumentasi perjalanan, grafis, ikon, dan video adalah milik sah SmartJourney atau pemberi lisensi kami dan dilindungi oleh undang-undang hak cipta. Penggunaan tanpa izin tertulis dilarang keras.
                </p>
              </div>

              {/* Section 18 */}
              <div className="space-y-2 border-l-2 border-amber-500 pl-4">
                <h3 className="text-white font-bold text-base">18. Kebijakan Privasi (Privacy)</h3>
                <p>
                  Pengumpulan, penyimpanan, serta penggunaan seluruh informasi pribadi Anda sepenuhnya diatur oleh dokumen <strong>Kebijakan Privasi (Privacy Policy)</strong> kami yang terintegrasi secara utuh dengan Ketentuan ini.
                </p>
              </div>

              {/* Section 19 */}
              <div className="space-y-2 border-l-2 border-amber-500 pl-4">
                <h3 className="text-white font-bold text-base">19. Aktivitas yang Dilarang (Prohibited Activities)</h3>
                <p>
                  Anda dilarang keras memanipulasi pemesanan dengan data palsu, mencoba meretas atau mengganggu kestabilan sistem operasional situs web kami, menyebarkan malware, atau menggunakan materi digital situs ini untuk tujuan penipuan atau persaingan bisnis tidak sehat.
                </p>
              </div>

              {/* Section 20 */}
              <div className="space-y-2 border-l-2 border-amber-500 pl-4">
                <h3 className="text-white font-bold text-base">20. Hukum yang Mengatur &amp; Yurisdiksi (Governing Law)</h3>
                <p>
                  Syarat &amp; Ketentuan ini diatur dan ditafsirkan sesuai dengan hukum Negara Republik Indonesia. Setiap perselisihan yang timbul dari atau terkait dengan dokumen ini akan diupayakan untuk diselesaikan terlebih dahulu melalui musyawarah kekeluargaan demi mufakat. Jika mufakat tidak tercapai, perselisihan akan diselesaikan melalui yurisdiksi pengadilan negeri yang berwenang di Indonesia.
                </p>
              </div>

              {/* Section 21 */}
              <div className="space-y-2 border-l-2 border-amber-500 pl-4">
                <h3 className="text-white font-bold text-base">21. Perubahan Ketentuan ini (Changes to Terms)</h3>
                <p>
                  Smart Journey berhak mengubah, memperbarui, atau merevisi Syarat &amp; Ketentuan ini sewaktu-waktu tanpa persetujuan awal pelanggan. Dokumen terbaru yang diterbitkan di halaman ini dengan tanggal pembaruan terkini akan langsung berlaku efektif. Keberlanjutan penggunaan layanan kami setelah perubahan tersebut dipublikasikan dianggap sebagai persetujuan Anda terhadap dokumen revisi baru tersebut.
                </p>
              </div>

              {/* Section 22 */}
              <div className="space-y-3 border-l-2 border-amber-500 pl-4">
                <h3 className="text-white font-bold text-base">22. Informasi Kontak &amp; Pengaduan (Contact Info)</h3>
                <p>
                  Apabila Anda memerlukan informasi tambahan, klarifikasi klausul, atau ingin menyampaikan keluhan resmi terkait Syarat &amp; Ketentuan ini, silakan hubungi pusat bantuan kami:
                </p>
                
                <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-3.5 text-xs">
                  <div className="text-slate-200 font-extrabold text-sm uppercase tracking-wider font-mono text-amber-400">
                    Smart Journey Customer Care
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5 text-slate-300">
                      <Phone className="h-4 w-4 text-amber-500 shrink-0" />
                      <a href="https://wa.me/6285212347289" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors font-medium">
                        +62 852-1234-7289 (WhatsApp Support)
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
                        <strong>Alamat Operasional:</strong> Jl. Puntadewa No. 192, Tumpang, Malang, Jawa Timur, Indonesia
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Ending Message */}
            <div className="text-center pt-4 text-xs text-slate-400 max-w-lg mx-auto leading-relaxed border-t border-slate-800">
              Terima kasih telah membaca dan menyetujui Ketentuan kami. Kami berkomitmen memberikan layanan perjalanan terbaik, aman, dan memuaskan.
            </div>
          </div>

          {/* Footer (Actions) */}
          <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/40 backdrop-blur-sm shrink-0 flex items-center justify-end gap-3">
            <button
              onClick={() => setTermsOpen(false)}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md active:scale-98 cursor-pointer"
            >
              Saya Setuju &amp; Tutup
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
