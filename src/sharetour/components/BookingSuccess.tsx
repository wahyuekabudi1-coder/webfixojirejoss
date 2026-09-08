import React, { useState } from "react";
import { Booking } from "../types";
import { CheckCircle2, Copy, Compass, ExternalLink, CreditCard, ShieldCheck, Loader2 } from "lucide-react";
import { useLanguageCurrency } from "../LanguageCurrencyContext";
import { updateBooking } from "../api";
import { processArtoPayPayment } from "../../lib/artopay";

interface BookingSuccessProps {
  booking: Booking;
  onNavigateToTrips: () => void;
  onNavigateToCheckStatus: (code: string, email: string) => void;
}

export default function BookingSuccess({ booking: initialBooking, onNavigateToTrips, onNavigateToCheckStatus }: BookingSuccessProps) {
  const [booking, setBooking] = useState<Booking>(initialBooking);
  const [copied, setCopied] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState("");
  const { t, formatPrice } = useLanguageCurrency();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(booking.bookingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePayWithArtoPay = async () => {
    setPayLoading(true);
    setPayError("");

    try {
      const orderId = booking.bookingCode || booking.id || `SJ-${Math.floor(100000 + Math.random() * 900000)}`;
      const rawPrice = Number(booking.totalPrice) || 1500000;
      const amountInIDR = rawPrice > 10000 
        ? Math.round(rawPrice) 
        : Math.round(rawPrice * 16000);

      await processArtoPayPayment({
        orderId,
        amount: amountInIDR,
        currency: "IDR",
        onSuccess: async (res) => {
          setPayError("");
          try {
            const check = await fetch(`/api/orders/${booking.id}/payment-status`);
            if (check.ok) {
              const data = await check.json();
              if (data.booking) {
                setBooking(data.booking);
              }
            }
          } catch (e) {
            console.warn("Status verify catch:", e);
          }
        },
        onPending: async (res) => {
          setPayError("");
          try {
            const check = await fetch(`/api/orders/${booking.id}/payment-status`);
            if (check.ok) {
              const data = await check.json();
              if (data.booking) {
                setBooking(data.booking);
              }
            }
          } catch (e) {
            console.warn("Status verify catch:", e);
          }
        },
        onError: (err) => {
          if (err && err.message) {
            setPayError(err.message);
          } else {
            setPayError(t("Pembayaran ArtoPay dibatalkan atau tidak diselesaikan."));
          }
        }
      });
    } catch (err: any) {
      console.error(err);
      setPayError(err.message || t("Gagal membuka gerbang pembayaran ArtoPay."));
    } finally {
      setPayLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden p-8 sm:p-10 space-y-8 my-8 text-center bg-card-bg">
      {/* Visual Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center justify-center p-3.5 bg-emerald-50 text-[#315B4F] rounded-full ring-8 ring-emerald-50/50">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-gray-950">
          {t("Booking Submitted Successfully!")}
        </h1>
        <p className="text-sm text-gray-500 font-sans max-w-sm mx-auto">
          {t("We have securely locked your seats. You can complete instant payment via ArtoPay Gateway or check booking status.")}
        </p>
      </div>

      {/* Booking Code Card */}
      <div className="bg-[#315B4F]/5 rounded-2xl p-6 border border-[#315B4F]/10 space-y-4">
        <div className="space-y-1">
          <span className="text-[10px] text-gray-400 font-mono tracking-wider block uppercase">{t("Your Exclusive Booking Code")}</span>
          <div className="flex items-center justify-center space-x-2.5">
            <span className="text-2xl sm:text-3xl font-mono font-black text-[#315B4F] tracking-wider select-all">
              {booking.bookingCode}
            </span>
            <button
              id="copy-code-success-btn"
              onClick={copyToClipboard}
              title="Copy to clipboard"
              className={`p-1 px-2.5 rounded-lg text-xs font-bold cursor-pointer transition-colors border ${
                copied 
                  ? "bg-emerald-600 border-emerald-600 text-white" 
                  : "bg-white border-[#315B4F]/20 text-[#315B4F] hover:bg-[#315B4F] hover:text-white"
              }`}
            >
              <Copy className="w-3.5 h-3.5 inline mr-1" />
              {copied ? t("Copied!") : t("Copy")}
            </button>
          </div>
        </div>

        {/* Ledger */}
        <div className="border-t border-emerald-99/10 pt-4 grid grid-cols-2 gap-y-3.5 gap-x-6 text-left text-xs sm:text-sm">
          <div>
            <span className="text-[10px] text-gray-400 block uppercase font-mono">{t("Primary Traveler")}</span>
            <span className="font-semibold text-gray-800">{booking.fullName}</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block uppercase font-mono">{t("Destination Package")}</span>
            <span className="font-semibold text-gray-800 truncate block max-w-[200px]">{t(booking.tripTitle)}</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block uppercase font-mono">{t("Departure Date")}</span>
            <span className="font-semibold text-gray-800">{booking.departureDate}</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block uppercase font-mono">{t("Seats Reserved")}</span>
            <span className="font-semibold text-gray-800">{booking.participantsCount} {t("Persons")}</span>
          </div>
          {Boolean(booking.pickupLocation || (booking.participantData as any)?.pickupLocation) && (
            <div className="col-span-2">
              <span className="text-[10px] text-gray-400 block uppercase font-mono">{t("Lokasi Penjemputan")}</span>
              <span className="font-semibold text-gray-800">
                {booking.pickupLocation || (booking.participantData as any)?.pickupLocation}
              </span>
            </div>
          )}
          <div className="col-span-2 pt-2 border-t border-emerald-900/10 flex justify-between items-end">
            <span className="text-xs uppercase text-gray-400 font-semibold font-mono">{t("Total Net Cost")}</span>
            <span className="text-base font-display font-bold text-[#315B4F]">{formatPrice(booking.totalPrice)}</span>
          </div>
        </div>
      </div>

      {/* ArtoPay Payment Action Box */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg border border-slate-800 text-left space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-[#D6B16D]" />
            <span className="font-mono font-bold text-xs uppercase tracking-wider text-slate-200">
              {t("ArtoPay Gateway Integration")}
            </span>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-800 text-[#D6B16D] border border-[#D6B16D]/30 font-bold">
            ORDER: SHARE-{booking.bookingCode}
          </span>
        </div>

        <p className="text-xs text-slate-300 font-sans leading-relaxed">
          {t("Klik tombol di bawah untuk membuka modal pembayaran resmi ArtoPay Gateway (Virtual Account, QRIS, e-Wallet).")}
        </p>

        {payError && (
          <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-xs text-rose-300">
            {payError}
          </div>
        )}

        <button
          id="btn-pay-artopay-sdk"
          type="button"
          onClick={handlePayWithArtoPay}
          disabled={payLoading || booking.status === "Confirmed"}
          className={`w-full py-4 rounded-xl font-mono font-extrabold text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer ${
            booking.status === "Confirmed"
              ? "bg-emerald-900 text-emerald-300 cursor-default border border-emerald-700"
              : payLoading
              ? "bg-slate-700 text-slate-300 cursor-not-allowed"
              : "bg-[#D6B16D] hover:bg-[#c4a05c] text-slate-950 hover:shadow-lg active:scale-[0.99]"
          }`}
        >
          {payLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              <span>{t("Menghubungkan ArtoPay...")}</span>
            </>
          ) : booking.status === "Confirmed" ? (
            <>
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>{t("Pembayaran Berhasil / Lunas")}</span>
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 text-slate-950" />
              <span>{t("Bayar via ArtoPay")} ({booking.bookingCode})</span>
            </>
          )}
        </button>
      </div>

      {/* Redirect buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-2">
        <button
          id="btn-success-explore"
          onClick={onNavigateToTrips}
          className="flex-1 inline-flex items-center justify-center space-x-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl text-sm transition-all cursor-pointer"
        >
          <Compass className="w-4 h-4 text-[#315B4F]" />
          <span>{t("Exit to Trip Explorer")}</span>
        </button>

        <button
          id="btn-success-check-status"
          onClick={() => onNavigateToCheckStatus(booking.bookingCode, booking.email)}
          className="flex-1 inline-flex items-center justify-center space-x-1.5 bg-[#315B4F] hover:bg-[#1f3a32] text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all cursor-pointer shadow-md"
        >
          <span>{t("Monitor Status Live")}</span>
          <ExternalLink className="w-4 h-4 text-[#D6B16D]" />
        </button>
      </div>
    </div>
  );
}

