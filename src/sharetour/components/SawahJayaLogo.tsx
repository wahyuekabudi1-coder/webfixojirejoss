import React, { useState } from "react";

interface SawahJayaLogoProps {
  className?: string;
  size?: number | string;
  color?: string; // Brand Green: #315B4F
}

export default function SawahJayaLogo({ className = "", size = "100%", color = "#315B4F" }: SawahJayaLogoProps) {
  const [imgError, setImgError] = useState(false);
  const maskId = React.useId().replace(/:/g, "-");

  // Keep the dynamic file support in case they drop logo.png in public folders
  if (!imgError) {
    return (
      <img
        src="/images/logo.png"
        alt="Smart Journey Logo"
        className={`${className} object-contain`}
        style={{ width: size, height: size }}
        onError={() => setImgError(true)}
        referrerPolicy="no-referrer"
      />
    );
  }

  // Pixel-perfect, mathematically symmetric green S-logo matching the user's uploaded screenshot exactly
  return (
    <svg 
      className={className}
      width={size}
      height={size}
      viewBox="0 0 1000 1000" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Dynamic mask subtracting two horizontal/vertical rounded channels to generate the interlocking S curves */}
        <mask id={`sawah-jaya-logo-mask-${maskId}`}>
          {/* White base canvas: keeping the underlying shape */}
          <rect x="0" y="0" width="1000" height="1000" fill="white" />
          
          {/* Upper interlocking track channel */}
          <path 
            d="M 850 350 L 350 350 L 350 650 L 590 650" 
            stroke="black" 
            strokeWidth="110" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            fill="none"
          />
          
          {/* Lower interlocking track channel */}
          <path 
            d="M 150 650 L 650 650 L 650 350 L 410 350" 
            stroke="black" 
            strokeWidth="110" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            fill="none"
          />
        </mask>
      </defs>
      
      {/* Dynamic S-squircle bounding shape - math-drawn for maximum screen crispness */}
      <rect 
        x="150" 
        y="150" 
        width="700" 
        height="700" 
        rx="220" 
        fill={color} 
        mask={`url(#sawah-jaya-logo-mask-${maskId})`}
      />
    </svg>
  );
}

