import React, { useState } from "react";
import { Phone, Mail, MapPin, MessageSquare, ShieldCheck, FileText } from "lucide-react";
import WeChatModal from "./WeChatModal";
import SawahJayaLogo from "./SawahJayaLogo";
import SocialMediaButtons from "../../components/SocialMediaButtons";

interface CustomerFooterProps {
  onNavigate?: (view: string) => void;
}

export default function CustomerFooter({ onNavigate }: CustomerFooterProps) {
  const [isWeChatOpen, setIsWeChatOpen] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);

  const handleCopyrightClick = () => {
    const next = clickCount + 1;
    if (next >= 6) {
      setIsAdminUnlocked(true);
      setClickCount(0);
      if (onNavigate) {
        onNavigate("admin");
      }
      window.location.hash = "#admin";
    } else {
      setClickCount(next);
    }
  };

  return (
    <footer className="bg-[#0A0A0A] text-gray-400 py-16 sm:py-20 border-t border-zinc-900 mt-auto font-sans" id="luxury-customer-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* ROW 1 - Top Section (2 columns grid for an ultra-spacious, premium feel) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          
          {/* Column 1 (Left Side - Branding, Description, and Stats) */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="bg-[#D6B16D] p-1.5 rounded-xl flex items-center justify-center shadow-md w-9 h-9">
                  {/* Sawah Jaya Custom S Logo */}
                  <SawahJayaLogo size={24} color="#315B4F" />
                </div>
                <div className="flex flex-col">
                  <span className="font-display font-black text-xl text-white tracking-widest leading-none">
                    SMART JOURNEY
                  </span>
                  <span className="text-[9px] text-[#D6B16D] tracking-[0.3em] font-extrabold uppercase mt-1">
                    PREMIUM ECO-TOURISM
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed max-w-md">
                Premium eco-tourism experiences across Indonesia with trusted local expertise and unforgettable journeys.
              </p>
              
              {/* Official Social Media */}
              <div className="pt-2">
                <SocialMediaButtons size="sm" />
              </div>
            </div>

            {/* Stats Row */}
            <div className="pt-4 border-t border-zinc-900 flex flex-wrap gap-x-6 gap-y-2 text-xs font-mono text-gray-500 uppercase">
              <div>
                <span className="text-[#D6B16D] font-bold text-sm tracking-tight mr-1">12K+</span> TRAVELERS
              </div>
              <div className="text-zinc-850 font-sans">|</div>
              <div>
                <span className="text-[#D6B16D] font-bold text-sm tracking-tight mr-1">850+</span> TOURS
              </div>
              <div className="text-zinc-850 font-sans">|</div>
              <div>
                <span className="text-[#D6B16D] font-bold text-sm tracking-tight mr-1">4.9</span> RATING
              </div>
            </div>

            {/* Payment Methods & Security Credentials */}
            <div className="pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-zinc-900 space-y-4 sm:space-y-5" id="customer-payment-showcase">
              <div className="space-y-2.5 sm:space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black font-sans tracking-wide text-white uppercase block">
                    PAYMENT METHODS
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase sm:hidden">
                    Instant & Secure
                  </span>
                </div>
                
                {/* Symmetrical 3x2 Grid on Mobile Smartphones, Flex on Tablet/Desktop */}
                <div className="grid grid-cols-3 sm:flex sm:flex-wrap items-center gap-2" id="payment-badge-grid">
                  {/* BCA Badge */}
                  <div className="bg-white px-2 sm:px-3 py-1.5 rounded-lg flex items-center justify-center shadow-xs h-9 w-full sm:w-[72px] select-none border border-zinc-100" title="BCA">
                    <span className="text-[#00519E] font-sans font-black tracking-normal text-xs sm:text-sm">BCA</span>
                  </div>

                  {/* VISA Badge */}
                  <div className="bg-white px-2 sm:px-3 py-1.5 rounded-lg flex items-center justify-center shadow-xs h-9 w-full sm:w-[72px] select-none border border-zinc-100" title="Visa">
                    <span className="text-[#1A1F71] font-sans font-extrabold italic tracking-tight text-xs sm:text-sm">VISA</span>
                  </div>

                  {/* MASTERCARD Badge */}
                  <div className="bg-white px-2 sm:px-3 py-1.5 rounded-lg flex items-center justify-center shadow-xs h-9 w-full sm:w-[72px] select-none border border-zinc-100" title="Mastercard">
                    <svg className="w-7 sm:w-8 h-4 shrink-0" viewBox="0 0 32 20" fill="none">
                      <circle cx="11" cy="10" r="8" fill="#EB001B" />
                      <circle cx="21" cy="10" r="8" fill="#F79E1B" fillOpacity="0.85" />
                    </svg>
                  </div>

                  {/* PAYPAL Badge */}
                  <div className="bg-white px-2 sm:px-3 py-1.5 rounded-lg flex items-center justify-center shadow-xs h-9 w-full sm:w-[72px] select-none border border-zinc-100" title="PayPal">
                    <span className="text-[#003087] font-sans font-black italic tracking-tighter text-[11px] leading-none shrink-0">
                      Pay<span className="text-[#0079C1]">Pal</span>
                    </span>
                  </div>

                  {/* ALIPAY Badge */}
                  <div className="bg-white px-2 sm:px-3 py-1.5 rounded-lg flex items-center justify-center shadow-xs h-9 w-full sm:w-[72px] select-none border border-zinc-100" title="Alipay">
                    <span className="text-[#00A0E9] font-sans font-extrabold tracking-tight text-xs">Alipay</span>
                  </div>

                  {/* WECHAT PAY Badge */}
                  <div className="bg-white px-2 sm:px-3 py-1.5 rounded-lg flex items-center justify-center shadow-xs h-9 w-full sm:w-[84px] select-none border border-zinc-100" title="WeChat Pay">
                    <span className="text-[#09B83E] font-sans font-extrabold tracking-tighter text-[10px] sm:text-xs">WeChat Pay</span>
                  </div>
                </div>
              </div>

              {/* Secure Licensed Capsule */}
              <div 
                className="inline-flex items-center space-x-2 bg-zinc-950/80 border border-zinc-900 rounded-full py-1 px-3 sm:py-1.5 sm:px-3.5 select-none" 
                id="secure-licensed-capsule"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#D6B16D] shrink-0" />
                <span className="text-[10px] sm:text-[11px] font-semibold text-zinc-300 font-sans tracking-wide">100% Secure</span>
                <span className="text-zinc-800 text-xs">|</span>
                <FileText className="w-3.5 h-3.5 text-[#D6B16D] shrink-0" />
                <span className="text-[10px] sm:text-[11px] font-semibold text-zinc-300 font-sans tracking-wide">Official Licensed</span>
              </div>
            </div>
          </div>

          {/* Column 2 (Right Side - Contact Info and Call to Action Buttons) */}
          <div className="space-y-6">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-[0.2em] pb-2 border-b border-zinc-900">
              CONTACT & INQUIRIES
            </h3>
            
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <li className="flex items-center space-x-3 text-gray-300">
                <Phone className="w-4 h-4 text-[#D6B16D] shrink-0" />
                <span className="font-mono text-xs">+62 852-1234-7289</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-300">
                <Mail className="w-4 h-4 text-[#D6B16D] shrink-0" />
                <span className="font-mono text-xs">Info@sawahjayatrans.com</span>
              </li>
              <li className="flex items-start space-x-3 text-gray-300 col-span-1 sm:col-span-2">
                <MapPin className="w-4 h-4 text-[#D6B16D] shrink-0 mt-0.5" />
                <span className="text-xs leading-normal font-sans">
                  <strong className="block text-white font-semibold">Malang Office:</strong>
                  Jl. Puntadewa No. 192, Tumpang, Malang 65156
                </span>
              </li>
              <li className="flex items-start space-x-3 text-gray-300 col-span-1 sm:col-span-2">
                <MapPin className="w-4 h-4 text-[#D6B16D] shrink-0 mt-0.5" />
                <span className="text-xs leading-normal font-sans">
                  <strong className="block text-white font-semibold">Bali Office:</strong>
                  Jl. By Pass Ngurah Rai, Denpasar, Bali 80237
                </span>
              </li>
            </ul>

            {/* Action Buttons Stack: Chat with Us & WeChat (Directly Below) */}
            <div className="space-y-3 pt-2 max-w-sm">
              {/* WhatsApp Button */}
              <a
                href="https://wa.me/6285212347289"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 border border-[#25D366]/40 hover:border-[#25D366] text-white hover:bg-[#25D366]/10 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wider transition-all duration-300 bg-transparent text-center cursor-pointer w-full"
              >
                <MessageSquare className="w-4 h-4 text-[#25D366]" />
                <span>CHAT WITH US</span>
              </a>

              {/* WeChat Button */}
              <button
                type="button"
                onClick={() => setIsWeChatOpen(true)}
                className="flex items-center justify-center space-x-2 bg-[#07C160] hover:bg-[#06a652] active:scale-[0.99] text-white px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wider transition-all duration-300 text-center cursor-pointer w-full focus:outline-none shadow-sm"
                aria-label="Open WeChat QR code"
              >
                {/* WeChat Custom SVG Icon */}
                <svg className="w-4 h-4 text-white fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M8.52 14.16c-.4 0-.74-.32-.74-.7 0-.39.34-.72.74-.72s.75.33.75.72c0 .38-.35.7-.75.7zm3.82-5.74c-.45 0-.82-.36-.82-.8 0-.44.37-.8.82-.8s.82.36.82.8c0 .44-.37.8-.82.8zm-6.2 5.04c0-.39.34-.7.74-.7s.74.31.74.7-.34.7-.74.7-.74-.31-.74-.7zm9.64-5.04c-.45 0-.81-.36-.81-.8 0-.44.36-.8.81-.8s.82.36.82.8c0 .44-.37.8-.82.8zM12 2C6.48 2 2 5.86 2 10.63c0 2.72 1.46 5.14 3.74 6.72L5 19.83l3.12-1.56c1.2.33 2.51.51 3.88.51 5.52 0 10-3.86 10-8.63C22 5.86 17.52 2 12 2zm3.3 15.68c-.47-.1-.94-.17-1.4-.23l.11-.23c2.4-1.34 3.99-3.66 3.99-6.32 0-4.08-3.68-7.42-8.22-7.42-3.4 0-6.31 1.88-7.58 4.67-.14-.01-.28-.01-.42-.01-4.96 0-9 3.47-9 7.74 0 2.45 1.32 4.62 3.37 6.04L4.5 22.5l2.8-1.4c1.08.3 2.22.46 3.45.46 4.96 0 9-3.47 9-7.75 0-1.44-.45-2.78-1.23-3.95.34.84.53 1.76.53 2.73s-.67 3.33-1.65 5.09z" />
                </svg>
                <span>CONNECT ON WECHAT</span>
              </button>
            </div>
          </div>

        </div>

        {/* WeChat Modal */}
        <WeChatModal isOpen={isWeChatOpen} onClose={() => setIsWeChatOpen(false)} />

        {/* ROW 3 - Bottom Bar (full width copyright line) */}
        <div className="border-t border-zinc-900 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono text-gray-500">
          <div 
            onClick={handleCopyrightClick}
            className="cursor-pointer select-none transition-colors duration-300 py-1"
          >
            © 2026 <span className="font-medium text-gray-400">PT Sawah Jaya Trans 1</span>. All Rights Reserved.
          </div>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <span>·</span>
            <a href="#" className="hover:text-white transition-colors">Terms & Conditions</a>
            <span>·</span>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
            {isAdminUnlocked && (
              <>
                <span>·</span>
                <button
                  onClick={() => {
                    if (onNavigate) onNavigate("admin");
                    window.location.hash = "#admin";
                  }}
                  className="text-[#D6B16D] font-black hover:text-yellow-400 transition-colors animate-pulse focus:outline-none"
                >
                  Admin Panel
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </footer>
  );
}
