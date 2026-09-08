import React from "react";
import { Compass, Languages, Coins } from "lucide-react";
import { useLanguageCurrency } from "../LanguageCurrencyContext";
import { ENABLE_FOREIGN_CURRENCIES } from "../../utils/pricingUtils";
import SawahJayaLogo from "./SawahJayaLogo";

interface CustomerHeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isAdminLoggedIn: boolean;
}

export default function CustomerHeader({ currentView, onNavigate, isAdminLoggedIn }: CustomerHeaderProps) {
  const { language, setLanguage, currency, setCurrency, t } = useLanguageCurrency();

  return (
    <header className="sticky top-0 z-50 bg-[#315B4F] text-white shadow-md border-b border-[#24453c]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <div 
            onClick={() => onNavigate("trips")} 
            className="flex items-center space-x-3 cursor-pointer group select-none"
            id="brand-logo"
          >
            <div className="bg-[#D6B16D] p-1.5 rounded-xl transition-transform duration-300 group-hover:scale-110 flex items-center justify-center w-9 h-9">
              {/* Sawah Jaya Custom S Logo */}
              <SawahJayaLogo size={24} color="#315B4F" />
            </div>
            <div>
              <span className="font-display font-bold text-base sm:text-lg tracking-tight text-white block uppercase">
                {t("SMART_JOURNEY") === "SMART_JOURNEY" ? "SMART JOURNEY" : t("SMART JOURNEY")}
              </span>
            </div>
          </div>
 
          {/* Controls & Nav */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Language Switcher Button (English & Chinese) */}
            <div className="flex items-center bg-[#25463c] border border-[#2b5145] rounded-xl p-1" id="lang-switcher">
              <button
                title="English"
                onClick={() => setLanguage("en")}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold tracking-tight uppercase transition-all duration-150 cursor-pointer ${
                  language === "en"
                    ? "bg-[#D6B16D] text-[#315B4F] shadow-sm font-semibold"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                EN
              </button>
              <button
                title="中文"
                onClick={() => setLanguage("zh")}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold tracking-tight transition-all duration-150 cursor-pointer ${
                  language === "zh"
                    ? "bg-[#D6B16D] text-[#315B4F] shadow-sm font-semibold"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                中文
              </button>
            </div>

            {/* Currency Selector (Dollar, Rupiah & Yuan): Tombol Dolar & Yen sementara dimatikan, jangan dihapus */}
            <div className="flex flex-col items-center bg-[#25463c] border border-[#2b5145] rounded-lg p-0.5" id="curr-switcher" title="Pilih Mata Uang">
              {/* Tombol Dollar (USD) - Sementara dimatikan, jangan dihapus */}
              <button
                type="button"
                disabled={!ENABLE_FOREIGN_CURRENCIES}
                title={!ENABLE_FOREIGN_CURRENCIES ? "Dollar (USD) - Sementara dinonaktifkan" : "Dollar (USD)"}
                onClick={() => ENABLE_FOREIGN_CURRENCIES && setCurrency("USD")}
                className={`w-5.5 h-3.5 rounded text-[10px] font-black leading-none flex items-center justify-center transition-all duration-150 ${
                  !ENABLE_FOREIGN_CURRENCIES
                    ? "text-gray-500 opacity-30 cursor-not-allowed select-none"
                    : currency === "USD"
                    ? "bg-[#D6B16D] text-[#315B4F] shadow-sm font-black cursor-pointer"
                    : "text-gray-300 hover:text-white cursor-pointer"
                }`}
              >
                $
              </button>

              {/* Tombol Rupiah (IDR) - Aktif */}
              <button
                type="button"
                title="Rupiah (IDR) - Aktif"
                onClick={() => setCurrency("IDR")}
                className={`w-5.5 h-3.5 rounded text-[8.5px] font-black leading-none flex items-center justify-center transition-all duration-150 cursor-pointer ${
                  currency === "IDR"
                    ? "bg-[#D6B16D] text-[#315B4F] shadow-sm font-black"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                Rp
              </button>

              {/* Tombol Yuan / Yen (CNY) - Sementara dimatikan, jangan dihapus */}
              <button
                type="button"
                disabled={!ENABLE_FOREIGN_CURRENCIES}
                title={!ENABLE_FOREIGN_CURRENCIES ? "Yen / Yuan (CNY) - Sementara dinonaktifkan" : "Yen / Yuan (CNY)"}
                onClick={() => ENABLE_FOREIGN_CURRENCIES && setCurrency("CNY")}
                className={`w-5.5 h-3.5 rounded text-[10px] font-black leading-none flex items-center justify-center transition-all duration-150 ${
                  !ENABLE_FOREIGN_CURRENCIES
                    ? "text-gray-500 opacity-30 cursor-not-allowed select-none"
                    : currency === "CNY"
                    ? "bg-[#D6B16D] text-[#315B4F] shadow-sm font-black cursor-pointer"
                    : "text-gray-300 hover:text-white cursor-pointer"
                }`}
              >
                ¥
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
