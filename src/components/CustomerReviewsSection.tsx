import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Star, MessageSquare, CheckCircle, User, Globe, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CustomerReviewsSectionProps {
  serviceType: 'tour' | 'airport' | 'taxi' | 'rental';
  serviceId?: string;
  serviceName: string;
}

export default function CustomerReviewsSection({ serviceType, serviceId, serviceName }: CustomerReviewsSectionProps) {
  const { reviews, addReview } = useApp();
  
  // Form states
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  // Filter reviews matching this service type and approved
  const approvedReviews = reviews.filter(
    r => r.serviceType === serviceType && r.status === 'approved'
  );

  // Calculate average rating
  const averageRating = approvedReviews.length > 0
    ? (approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length).toFixed(1)
    : '5.0';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Nama lengkap wajib diisi');
      return;
    }
    if (!country.trim()) {
      setFormError('Negara asal wajib diisi');
      return;
    }
    if (!text.trim()) {
      setFormError('Isi ulasan tidak boleh kosong');
      return;
    }

    // Submit review to global state
    addReview({
      name,
      country,
      rating,
      text,
      avatar: '',
      serviceType,
      serviceId
    });

    setIsSubmitted(true);
    // Reset form fields
    setName('');
    setCountry('');
    setRating(5);
    setText('');
  };

  return (
    <div className="bg-white rounded-3xl border border-neutral-100 p-6 sm:p-8 shadow-sm text-left mt-10" id="reviews-section">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Summary statistics */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xl font-extrabold text-neutral-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-amber-500" />
            <span>Ulasan Pelanggan</span>
          </h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Pendapat jujur dari para pelancong yang telah menggunakan layanan <strong>{serviceName}</strong> kami.
          </p>

          <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-100 flex items-center gap-4">
            <div className="text-center">
              <span className="text-4xl font-black text-neutral-900 font-mono">{averageRating}</span>
              <span className="text-neutral-400 text-xs block font-semibold mt-0.5">dari 5.0</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-0.5 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${i < Math.round(parseFloat(averageRating)) ? 'fill-amber-500' : 'text-neutral-200'}`} 
                  />
                ))}
              </div>
              <span className="text-xs text-neutral-500 font-bold block mt-1">
                {approvedReviews.length} Ulasan Terverifikasi
              </span>
            </div>
          </div>

          {/* Form Side - write review info */}
          <div className="hidden lg:block bg-amber-50/50 rounded-2xl p-5 border border-amber-100/40 text-neutral-800 space-y-2">
            <h4 className="text-xs font-black uppercase text-amber-800 tracking-wider">Moderasi Ulasan Instan</h4>
            <p className="text-[11px] text-amber-900/80 leading-relaxed">
              Ulasan baru yang Anda kirimkan akan berstatus <strong>Pending</strong> dan akan tampil di website setelah diverifikasi oleh tim Admin kami demi kenyamanan bersama.
            </p>
          </div>
        </div>

        {/* Right column: Reviews list & Submission form */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Tabs header */}
          <div className="border-b border-neutral-100 pb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-extrabold text-neutral-800">
                Daftar Ulasan ({approvedReviews.length})
              </span>
              <span className="text-xs text-neutral-400 font-mono">Smart Journey</span>
            </div>
          </div>

          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin">
            {approvedReviews.length === 0 ? (
              <div className="text-center py-8 text-neutral-400 space-y-2">
                <MessageSquare className="h-8 w-8 mx-auto text-neutral-300" />
                <p className="text-xs font-semibold">Belum ada ulasan untuk layanan ini.</p>
                <p className="text-[11px] text-neutral-400">Jadilah yang pertama memberikan ulasan positif Anda!</p>
              </div>
            ) : (
              approvedReviews.map((review, idx) => {
                const bgColors = [
                  'bg-blue-600', 'bg-emerald-600', 'bg-purple-600', 'bg-rose-600', 'bg-amber-600'
                ];
                const colorClass = bgColors[idx % bgColors.length];
                return (
                  <div key={review.id} className="border-b border-neutral-100 pb-4 last:border-b-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-white text-xs ${colorClass}`}>
                          {review.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-xs text-neutral-900">{review.name}</h4>
                          <span className="text-[10px] text-neutral-400 font-semibold uppercase">{review.country}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-neutral-400 font-mono">{review.date}</span>
                    </div>

                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                      ))}
                      {[...Array(5 - review.rating)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 text-neutral-200" />
                      ))}
                    </div>

                    <p className="text-xs text-neutral-600 leading-relaxed italic">
                      "{review.text}"
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Form area */}
          <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-150/40">
            <AnimatePresence mode="wait">
              {isSubmitted ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-6 space-y-3"
                >
                  <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-neutral-900">Ulasan Berhasil Dikirim!</h4>
                    <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
                      Terima kasih atas masukan Anda. Ulasan Anda telah masuk antrean moderasi dengan status <strong className="text-amber-600 uppercase">Pending</strong> dan akan segera tampil setelah disetujui oleh admin kami.
                    </p>
                  </div>
                  <button 
                    onClick={() => setIsSubmitted(false)}
                    className="text-xs text-amber-500 font-black hover:underline cursor-pointer"
                  >
                    Tulis Ulasan Lainnya
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h4 className="text-xs font-black uppercase text-neutral-800 tracking-wider">Bagikan Pengalaman Anda</h4>
                  
                  {formError && (
                    <div className="text-[11px] text-red-500 font-semibold bg-red-50 border border-red-100 rounded-lg p-2">
                      ⚠️ {formError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-neutral-500 uppercase flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>Nama Lengkap</span>
                      </label>
                      <input 
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Contoh: Alex Carter"
                        className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-neutral-500 uppercase flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        <span>Negara Asal</span>
                      </label>
                      <input 
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="Contoh: Australia"
                        className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-neutral-500 uppercase">Bintang Penilaian (Rating)</label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="text-amber-500 focus:outline-none cursor-pointer transition-all active:scale-125"
                        >
                          <Star className={`h-6 w-6 ${star <= rating ? 'fill-amber-500 text-amber-500' : 'text-neutral-200'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-neutral-500 uppercase">Ulasan Pengalaman Anda</label>
                    <textarea 
                      rows={3}
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Ceritakan pengalaman Anda menggunakan layanan kami..."
                      className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-sm hover:shadow flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Kirim Ulasan (Menunggu Moderasi Admin)</span>
                  </button>
                </form>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </div>
  );
}
