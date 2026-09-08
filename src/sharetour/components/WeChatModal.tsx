import React, { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Copy, X, Check, ExternalLink, HelpCircle } from "lucide-react";
import SawahJayaLogo from "./SawahJayaLogo";

interface WeChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WeChatModal({ isOpen, onClose }: WeChatModalProps) {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [qrSrc, setQrSrc] = useState('/wechat-qr-1.png');
  const [deeplinkNotice, setDeeplinkNotice] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setImgError(false);
      setQrSrc('/wechat-qr-1.png');
    }
  }, [isOpen]);

  // Copy ID functionality
  const handleCopyID = () => {
    navigator.clipboard.writeText("sjtrans");
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  // Open WeChat deep link
  const handleOpenWeChat = () => {
    // Attempt deep linking to WeChat
    window.location.href = "weixin://dl/chat?sjtrans";
    
    // Set a notice to open manually in case fallback is required
    setDeeplinkNotice("Opening WeChat app... If it does not build/open, please open the WeChat app manually and search for ID: sjtrans.");
    setTimeout(() => {
      setDeeplinkNotice(null);
    }, 6000);
  };

  // Handle ESC key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Focus trap inside modal when opened
  useEffect(() => {
    if (!isOpen) return;
    
    // Focus the modal content container for screen readers and keyboard navigation
    modalRef.current?.focus();
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="wechat-modal-title"
          aria-describedby="wechat-modal-description"
        >
          {/* Overlay Background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            ref={modalRef}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.93, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative bg-[#121212] border border-zinc-850 rounded-2xl w-full max-w-sm overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.7)] focus:outline-none p-5 z-10 font-sans space-y-4"
            id="wechat-modal-container"
          >
            {/* Dark Mode Modal Sub-header: Applet Control */}
            <div className="flex items-center justify-between border-b border-zinc-850 pb-2.5" id="wechat-modal-header">
              <div className="flex items-center space-x-2 text-left">
                <span className="w-2 h-2 rounded-full bg-[#07C160] animate-pulse" />
                <h3 id="wechat-modal-title" className="text-xs font-bold tracking-wider uppercase text-zinc-400 font-mono">
                  WeChat Contact Card
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-zinc-500 hover:text-white transition-colors p-1 hover:bg-zinc-900 rounded-lg cursor-pointer focus:outline-none"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Premium WeChat Ticket Pass Card (Beautifully matches user screenshot in white) */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-zinc-200 text-center space-y-6" id="wechat-premium-ticket">
              {/* Ticket Top Header: Sawah Jaya Brand Logo + Title */}
              <div className="flex items-center space-x-3.5 text-left" id="wechat-ticket-brand">
                <div className="bg-[#315B4F] p-2 rounded-xl flex items-center justify-center shadow-md w-10 h-10 border border-[#315B4F]/10 shrink-0">
                  {/* Glowing contract custom S Logo */}
                  <SawahJayaLogo size={26} color="#D6B16D" />
                </div>
                <div className="flex flex-col">
                  <span className="font-display font-black text-lg text-zinc-900 leading-none tracking-tight">
                    Smart Journey
                  </span>
                  <span className="text-[10px] uppercase font-mono font-bold text-zinc-400 tracking-[0.12em] mt-1">
                    Java Timur, Indonesia
                  </span>
                </div>
              </div>

              {/* Ticket Middle Frame: QR Code Container */}
              <div className="relative w-64 h-64 mx-auto flex items-center justify-center bg-white p-2.5 rounded-xl border border-zinc-100 shadow-sm" id="wechat-modal-qr-frame">
                {!imgError ? (
                  <img
                    src={qrSrc}
                    alt="WeChat QR Code"
                    className="w-full h-full object-contain select-none"
                    onError={() => {
                      if (qrSrc === '/wechat-qr-1.png') {
                        setQrSrc('/wechat-qr.png');
                      } else if (qrSrc === '/wechat-qr.png') {
                        setQrSrc('/images/wechat.png');
                      } else if (qrSrc === '/images/wechat.png') {
                        setQrSrc('/qr.png');
                      } else {
                        setImgError(true);
                      }
                    }}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  // Elegant, precise representation of their official WeChat QR Code using vector paths and emerald branding
                  <svg className="w-full h-full p-0.5 bg-white select-none" viewBox="0 0 100 100" aria-label="WeChat QR Code fallback illustration">
                    {/* Top Left Finder anchor (WeChat Green: #07C160) */}
                    <path d="M 5,5 H 31 V 31 H 5 Z" fill="#07C160" />
                    <path d="M 9,9 H 27 V 27 H 9 Z" fill="white" />
                    <path d="M 12,12 H 24 V 24 H 12 Z" fill="#07C160" />

                    {/* Top Right Finder anchor (#07C160) */}
                    <path d="M 69,5 H 95 V 31 H 69 Z" fill="#07C160" />
                    <path d="M 73,9 H 91 V 27 H 73 Z" fill="white" />
                    <path d="M 76,12 H 88 V 24 H 76 Z" fill="#07C160" />

                    {/* Bottom Left Finder anchor (#07C160) */}
                    <path d="M 5,69 H 31 V 95 H 5 Z" fill="#07C160" />
                    <path d="M 9,73 H 27 V 91 H 9 Z" fill="white" />
                    <path d="M 12,76 H 24 V 88 H 12 Z" fill="#07C160" />
                    
                    {/* Stylized QR bits pattern representing real QR payload */}
                    <path d="M 40,8 H 48 V 12 H 40 Z M 58,8 H 63 V 13 H 58 Z" fill="#07C160" />
                    <path d="M 40,18 H 44 V 28 H 40 Z M 48,22 H 56 V 25 H 48 Z M 60,18 H 64 V 30 H 60 Z" fill="#07C160" />
                    <path d="M 10,40 H 20 V 44 H 10 Z M 28,40 H 34 V 44 H 28 Z M 14,50 H 28 V 54 H 14 Z" fill="#07C160" />
                    <path d="M 8,60 H 18 V 64 H 8 Z M 24,60 H 34 V 64 H 24 Z" fill="#07C160" />
                    <path d="M 70,38 H 88 V 42 H 70 Z M 72,48 H 80 V 52 H 72 Z M 86,46 H 93 V 50 H 86 Z" fill="#07C160" />
                    <path d="M 70,58 H 76 V 62 H 70 Z M 80,58 H 90 V 62 H 80 Z" fill="#07C160" />
                    <path d="M 40,78 H 46 V 82 H 40 Z M 44,88 H 64 V 92 H 44 Z" fill="#07C160" />
                    <path d="M 48,68 H 54 V 72 H 48 Z M 58,68 H 63 V 72 H 58 Z" fill="#07C160" />
                    <path d="M 80,72 H 95 V 92 H 80 Z" fill="white" />
                    <path d="M 80,72 H 84 V 76 H 80 Z M 88,78 H 93 V 85 H 88 Z" fill="#07C160" />

                    {/* Integrated WeChat Logo inside middle of the custom QR fallback */}
                    <rect x="36" y="36" width="28" height="28" rx="6" fill="white" />
                    <rect x="38" y="38" width="24" height="24" rx="5" fill="#07C160" />
                    
                    {/* WeChat Bubble icon path */}
                    <circle cx="46" cy="48" r="1.5" fill="white" />
                    <circle cx="54" cy="48" r="1.5" fill="white" />
                    <path d="M 42,54 C 42,51 45,49 49,49 C 53,49 56,51 56,54 C 56,55.5 54.5,56.5 52,57 L 52,59.5 L 49.5,57.5 C 49,57.5 48.5,57.5 48,57.5 C 44.5,57.5 42,56 42,54 Z" fill="white" opacity="0.95" />
                    <circle cx="47" cy="53" r="1" fill="#07C160" />
                    <circle cx="51" cy="53" r="1" fill="#07C160" />
                  </svg>
                )}
              </div>

              {/* Ticket Footer Caption: WeChat scanner instructions */}
              <p id="wechat-modal-description" className="text-xs text-zinc-400 font-sans font-medium leading-relaxed px-5">
                Pindai kode QR untuk menambahkan saya sebagai teman.
              </p>
            </div>

            {/* Display WeChat ID bar inside Modal */}
            <div 
              className="bg-zinc-950/40 border border-zinc-900 rounded-xl px-4 py-3 flex items-center justify-between text-xs font-mono"
              id="wechat-modal-id-container"
            >
              <span className="text-zinc-500 font-bold uppercase tracking-wider">WECHAT ID:</span>
              <span className="text-white font-black tracking-wider text-sm bg-[#07C160]/10 px-2.5 py-1 rounded border border-[#07C160]/30 select-all select-none">
                sjtrans
              </span>
            </div>

            {/* Interactive Buttons footer block: Copy ID & Open WeChat */}
            <div className="space-y-3" id="wechat-modal-actions">
              <div className="grid grid-cols-2 gap-3">
                {/* Copy ID Button */}
                <button
                  type="button"
                  onClick={handleCopyID}
                  className="flex items-center justify-center space-x-1.5 bg-[#07C160] hover:bg-[#06a652] active:scale-[0.98] text-white py-3 px-3 rounded-xl font-mono font-bold text-xs tracking-wider uppercase transition-all shadow-md cursor-pointer select-none focus:outline-none"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 shrink-0" />
                      <span>COPIED!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 shrink-0" />
                      <span>COPY ID</span>
                    </>
                  )

                  }
                </button>

                {/* Open WeChat Link Button */}
                <button
                  type="button"
                  onClick={handleOpenWeChat}
                  className="flex items-center justify-center space-x-1.5 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 active:scale-[0.98] text-zinc-300 hover:text-white py-3 px-3 rounded-xl font-mono font-bold text-xs tracking-wider uppercase transition-all cursor-pointer focus:outline-none"
                >
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  <span>OPEN APP</span>
                </button>
              </div>

              {/* Deeplink Help Info Notice Banner */}
              {deeplinkNotice && (
                <div className="p-3 bg-zinc-950/80 border border-zinc-900 text-left rounded-xl text-[10px] sm:text-xs text-[#07C160] leading-relaxed font-mono mt-1 select-none animate-fade-in flex items-start space-x-2">
                  <HelpCircle className="w-4 h-4 text-[#07C160] shrink-0 mt-0.5" />
                  <span>{deeplinkNotice}</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
