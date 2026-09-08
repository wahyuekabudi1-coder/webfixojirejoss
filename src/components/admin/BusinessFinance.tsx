import React, { useState, useEffect } from 'react';
import { 
  Plus, DollarSign, Percent, CreditCard, Tag, Search, Check, 
  Trash2, RefreshCw, Send, Terminal, FileText, CornerDownRight 
} from 'lucide-react';

interface PromoCoupon {
  id: string;
  code: string;
  discountType: 'Percentage' | 'Flat';
  amount: number;
  maxDiscount?: number;
  status: 'Active' | 'Expired';
}

interface WebhookLog {
  id: string;
  orderId: string;
  paymentType: string;
  grossAmount: number;
  transactionStatus: 'settlement' | 'pending' | 'expire' | 'deny';
  timestamp: string;
  payloadPreview: string;
}

interface LedgerItem {
  id: string;
  date: string;
  description: string;
  type: 'Credit' | 'Debit';
  amount: number;
  loggedBy: string;
}

export default function BusinessFinance({
  triggerNotification
}: {
  triggerNotification: (title: string, msg: string, type: 'success' | 'warning' | 'info') => void;
}) {
  const [activeTab, setActiveTab] = useState<'promo' | 'webhook' | 'finance'>('promo');

  // Database States
  const [coupons, setCoupons] = useState<PromoCoupon[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookLog[]>([]);
  const [ledger, setLedger] = useState<LedgerItem[]>([]);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Forms
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'Percentage' as 'Percentage' | 'Flat',
    amount: 10,
    maxDiscount: 100000,
    status: 'Active' as any
  });

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: 0,
    type: 'Debit' as 'Credit' | 'Debit'
  });

  // Selected webhook for payload preview
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookLog | null>(null);

  // Load Seed Databases
  useEffect(() => {
    // Coupons
    const storedCoupons = localStorage.getItem('sj_promo_coupons');
    if (storedCoupons) {
      try { setCoupons(JSON.parse(storedCoupons)); } catch(e){}
    } else {
      setCoupons([]);
    }

    // Webhooks
    setWebhooks([]);

    // Ledger Cashbook
    const storedLedger = localStorage.getItem('sj_finance_ledger');
    if (storedLedger) {
      try { setLedger(JSON.parse(storedLedger)); } catch(e){}
    } else {
      setLedger([]);
    }
  }, []);

  // Save Coupon
  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const newCoupon: PromoCoupon = {
      id: `c-${Date.now()}`,
      code: couponForm.code.toUpperCase().replace(/\s+/g, ''),
      discountType: couponForm.discountType,
      amount: Number(couponForm.amount),
      maxDiscount: couponForm.discountType === 'Percentage' ? Number(couponForm.maxDiscount) : undefined,
      status: couponForm.status
    };

    const updated = [newCoupon, ...coupons];
    setCoupons(updated);
    localStorage.setItem('sj_promo_coupons', JSON.stringify(updated));
    setIsCouponModalOpen(false);
    triggerNotification('Promo Code Published', `Kupon diskon "${newCoupon.code}" telah aktif`, 'success');
  };

  // Delete Coupon
  const handleDeleteCoupon = (id: string) => {
    if (confirm('Hapus kupon promo ini?')) {
      const updated = coupons.filter(c => c.id !== id);
      setCoupons(updated);
      localStorage.setItem('sj_promo_coupons', JSON.stringify(updated));
      triggerNotification('Kupon Dihapus', 'Kupon promo tidak dapat digunakan lagi oleh pelanggan', 'warning');
    }
  };

  // Add Expense manual
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const item: LedgerItem = {
      id: `l-${Date.now()}`,
      date: dateStr,
      description: expenseForm.description,
      type: expenseForm.type,
      amount: Number(expenseForm.amount),
      loggedBy: 'Admin Keuangan'
    };

    const updated = [item, ...ledger];
    setLedger(updated);
    localStorage.setItem('sj_finance_ledger', JSON.stringify(updated));
    setIsExpenseModalOpen(false);
    triggerNotification('Ledger Updated', `${item.type} of IDR ${item.amount.toLocaleString()} recorded successfully`, 'success');
  };

  // Calculations
  const creditTotal = ledger.filter(i => i.type === 'Credit').reduce((acc, i) => acc + i.amount, 0);
  const debitTotal = ledger.filter(i => i.type === 'Debit').reduce((acc, i) => acc + i.amount, 0);
  const netMargin = creditTotal - debitTotal;

  return (
    <div className="space-y-6 animate-fade-in text-neutral-100">
      
      {/* Sub Tabs Toggle bar */}
      <div className="flex border-b border-neutral-800 gap-6">
        <button
          onClick={() => { setActiveTab('promo'); setSearchQuery(''); }}
          className={`pb-3 font-extrabold text-sm transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'promo' ? 'text-amber-500 border-b-2 border-amber-500 font-black' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Percent className="h-4 w-4" />
          <span>Kupon Diskon &amp; Promosi</span>
        </button>
        <button
          onClick={() => { setActiveTab('webhook'); setSearchQuery(''); }}
          className={`pb-3 font-extrabold text-sm transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'webhook' ? 'text-amber-500 border-b-2 border-amber-500 font-black' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>ArtoPay Webhook Callback Logs</span>
        </button>
        <button
          onClick={() => { setActiveTab('finance'); setSearchQuery(''); }}
          className={`pb-3 font-extrabold text-sm transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'finance' ? 'text-amber-500 border-b-2 border-amber-500 font-black' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <DollarSign className="h-4 w-4" />
          <span>Buku Kas Arus Kas Ledger</span>
        </button>
      </div>

      {/* 1. PROMO MANAGEMENT */}
      {activeTab === 'promo' && (
        <div className="space-y-6">
          <div className="bg-neutral-900/60 border border-neutral-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-extrabold text-sm uppercase tracking-wider text-neutral-300">Promo Code &amp; Campaign Management</h4>
              <p className="text-[11px] text-neutral-500">Menejemen kupon diskon untuk konversi checkout pemesanan lebih tinggi</p>
            </div>
            <button
              onClick={() => setIsCouponModalOpen(true)}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-md"
            >
              <Plus className="h-4 w-4" />
              <span>Buat Kupon Promo Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((c) => (
              <div key={c.id} className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between hover:border-amber-500/20 group transition-all">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="font-mono font-black text-sm tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-xl">
                      🎟️ {c.code}
                    </span>
                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border uppercase ${
                      c.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-neutral-800 text-neutral-500 border-neutral-700'
                    }`}>
                      {c.status}
                    </span>
                  </div>

                  <div className="space-y-1 pt-2 font-bold text-xs text-neutral-300">
                    <p className="text-neutral-400 flex justify-between">
                      <span>Metode Potongan</span>
                      <span className="text-neutral-100">{c.discountType === 'Percentage' ? 'Diskon Persen (%)' : 'Diskon Flat Net'}</span>
                    </p>
                    <p className="text-neutral-400 flex justify-between">
                      <span>Besaran Diskon</span>
                      <span className="text-amber-500 font-mono font-black">
                        {c.discountType === 'Percentage' ? `${c.amount}%` : `IDR ${c.amount.toLocaleString()}`}
                      </span>
                    </p>
                    {c.maxDiscount !== undefined && (
                      <p className="text-neutral-400 flex justify-between">
                        <span>Batas Maksimum Potongan</span>
                        <span className="text-neutral-100 font-mono">IDR {c.maxDiscount.toLocaleString()}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-850 flex justify-end">
                  <button
                    onClick={() => handleDeleteCoupon(c.id)}
                    className="flex items-center gap-1.5 py-1.5 px-3.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 text-xs font-bold transition-all border border-rose-500/20 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Nonaktifkan Kupon</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. ARTOPAY WEBHOOK LOGS */}
      {activeTab === 'webhook' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-neutral-900/60 border border-neutral-800 p-5 rounded-2xl flex flex-col justify-between gap-2">
              <div>
                <h4 className="font-extrabold text-sm uppercase tracking-wider text-neutral-300">ArtoPay Webhook Callback HTTP Endpoint Logs</h4>
                <p className="text-[11px] text-neutral-500">Memonitor transaksi status, fraud status, payment types, secara aman via ArtoPay Gateway</p>
              </div>
            </div>

            <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-950 text-neutral-400 text-[10px] font-bold uppercase tracking-wider">
                    <th className="py-4 px-6">ID Booking</th>
                    <th className="py-4 px-6">Metode Bayar</th>
                    <th className="py-4 px-6 text-right">Nilai Rupiah</th>
                    <th className="py-4 px-6 text-center">Status Transaksi</th>
                    <th className="py-4 px-6 text-center">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-850 text-xs font-semibold text-neutral-300">
                  {webhooks.map((w) => (
                    <tr key={w.id} className="hover:bg-neutral-900/20 transition-all cursor-pointer" onClick={() => setSelectedWebhook(w)}>
                      <td className="py-4 px-6 font-mono font-bold text-amber-500">{w.orderId}</td>
                      <td className="py-4 px-6 font-mono text-neutral-400 capitalize">{w.paymentType}</td>
                      <td className="py-4 px-6 text-right font-bold text-neutral-200 font-mono">
                        IDR {w.grossAmount.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border uppercase ${
                          w.transactionStatus === 'settlement' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          w.transactionStatus === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                          'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {w.transactionStatus}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedWebhook(w); }}
                          className="px-2.5 py-1 text-[10px] bg-neutral-800 hover:bg-neutral-750 text-neutral-300 rounded border border-neutral-700 font-mono transition-all"
                        >
                          Payload JSON
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Webhook JSON inspector panel */}
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Terminal className="h-4.5 w-4.5 text-amber-500" />
                <h4 className="font-extrabold text-sm uppercase tracking-wider text-neutral-300">JSON Inspector Panel</h4>
              </div>

              {selectedWebhook ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-1">
                    <span className="text-[9px] text-neutral-500 uppercase block font-mono">Timestamp Callback</span>
                    <span className="text-xs text-neutral-300 font-mono font-bold">{selectedWebhook.timestamp}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] text-neutral-500 uppercase block font-mono">Payload Preview</span>
                    <pre className="bg-neutral-950 border border-neutral-850 p-4 rounded-xl font-mono text-[10px] text-emerald-400 leading-normal overflow-x-auto max-h-[220px]">
                      {selectedWebhook.payloadPreview}
                    </pre>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-neutral-500 font-medium py-12 text-center">
                  Silakan klik salah satu callback webhook untuk melihat HTTP POST Payload lengkap dari ArtoPay Sandbox Environment.
                </p>
              )}
            </div>

            <div className="pt-6 border-t border-neutral-850 text-xs font-bold text-neutral-500 font-mono">
              IP Whitelist Match: 103.127.16.0/24 (ArtoPay Node)
            </div>
          </div>
        </div>
      )}

      {/* 3. CASHBOOK LEDGER */}
      {activeTab === 'finance' && (
        <div className="space-y-6">
          {/* Top visual ledger counters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">Total Kredit (Kategori Masuk)</span>
              <h4 className="text-xl font-black text-neutral-100 font-mono">IDR {creditTotal.toLocaleString()}</h4>
            </div>
            <div className="p-5 bg-rose-500/5 border border-rose-500/10 rounded-2xl space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-widest block">Total Debit (Kategori Pengeluaran)</span>
              <h4 className="text-xl font-black text-neutral-100 font-mono">IDR {debitTotal.toLocaleString()}</h4>
            </div>
            <div className="p-5 bg-amber-500/5 border border-amber-500/15 rounded-2xl space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest block">Margin Keuntungan Operasional (Net)</span>
              <h4 className="text-xl font-black text-amber-500 font-mono">IDR {netMargin.toLocaleString()}</h4>
            </div>
          </div>

          <div className="bg-neutral-900/60 border border-neutral-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-extrabold text-sm uppercase tracking-wider text-neutral-300">Rekonsiliasi Jurnal Umum Kas</h4>
              <p className="text-[11px] text-neutral-500">Mencatat pendapatan tur &amp; pengeluaran operasional supir secara harian</p>
            </div>
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-md"
            >
              <Plus className="h-4 w-4" />
              <span>Catat Pengeluaran Baru</span>
            </button>
          </div>

          {/* Ledger Table */}
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-950 text-neutral-400 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Tanggal Jurnal</th>
                  <th className="py-4 px-6">Deskripsi Transaksi Kas</th>
                  <th className="py-4 px-6">Diposting Oleh</th>
                  <th className="py-4 px-6 text-right">Debit (Keluar)</th>
                  <th className="py-4 px-6 text-right">Kredit (Masuk)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-850 text-xs font-semibold text-neutral-300">
                {ledger.map((l) => (
                  <tr key={l.id} className="hover:bg-neutral-900/10 transition-all">
                    <td className="py-4 px-6 font-mono text-neutral-400">{l.date}</td>
                    <td className="py-4 px-6 font-extrabold text-neutral-200">
                      {l.description}
                    </td>
                    <td className="py-4 px-6 text-neutral-500 font-mono">
                      {l.loggedBy}
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-rose-400 font-bold">
                      {l.type === 'Debit' ? `- IDR ${l.amount.toLocaleString()}` : '—'}
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-emerald-400 font-bold">
                      {l.type === 'Credit' ? `+ IDR ${l.amount.toLocaleString()}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE DISKUN MODAL */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative">
            <h3 className="text-sm font-black text-amber-500 font-mono tracking-widest uppercase">BUAT KUPON DISKON BARU</h3>
            
            <form onSubmit={handleSaveCoupon} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-800 block uppercase">Kode Kupon Promo</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: SMART77, BALIHEALING"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900 placeholder:text-slate-500 font-mono uppercase"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-800 block uppercase">Metode Potongan</label>
                <select
                  value={couponForm.discountType}
                  onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value as any })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900"
                >
                  <option value="Percentage">Persentase (%)</option>
                  <option value="Flat">Potongan Nominal Tetap (Net IDR)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-800 block uppercase">Jumlah Potongan</label>
                  <input
                    type="number"
                    required
                    value={couponForm.amount}
                    onChange={(e) => setCouponForm({ ...couponForm, amount: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500 text-slate-900"
                  />
                </div>
                {couponForm.discountType === 'Percentage' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-800 block uppercase">Maks Diskon (IDR)</label>
                    <input
                      type="number"
                      value={couponForm.maxDiscount}
                      onChange={(e) => setCouponForm({ ...couponForm, maxDiscount: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500 text-slate-900"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-800 block uppercase">Status</label>
                <select
                  value={couponForm.status}
                  onChange={(e) => setCouponForm({ ...couponForm, status: e.target.value as any })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900"
                >
                  <option value="Active">Aktif (Dapat digunakan)</option>
                  <option value="Expired">Kedaluwarsa (Nonaktif)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-neutral-850">
                <button
                  type="submit"
                  className="flex-grow py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-extrabold text-xs transition-all cursor-pointer text-center"
                >
                  Terbitkan Kupon
                </button>
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="py-2.5 px-5 rounded-xl border border-neutral-800 text-neutral-400 hover:text-white text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD EXPENSE MODAL */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative">
            <h3 className="text-sm font-black text-amber-500 font-mono tracking-widest uppercase">CATAT PENGELUARAN JURNAL</h3>
            
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-800 block uppercase">Deskripsi Kas / Pengeluaran</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pembelian BBM Jeep Bromo"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900 placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-800 block uppercase">Metode Arus Kas</label>
                <select
                  value={expenseForm.type}
                  onChange={(e) => setExpenseForm({ ...expenseForm, type: e.target.value as any })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-900"
                >
                  <option value="Debit">Debit (Biaya Keluar)</option>
                  <option value="Credit">Kredit (Pendapatan Masuk)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-800 block uppercase">Nilai Nominal Rupiah (IDR)</label>
                <input
                  type="number"
                  required
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500 text-slate-900"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-neutral-850">
                <button
                  type="submit"
                  className="flex-grow py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-extrabold text-xs transition-all cursor-pointer text-center"
                >
                  Posting ke Buku Kas
                </button>
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="py-2.5 px-5 rounded-xl border border-neutral-800 text-neutral-400 hover:text-white text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
